// app/(tabs)/advisor.tsx
import { useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    KeyboardAvoidingView,
    Platform,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { supabase } from "../../lib/supabase";
import { useFinanceStore } from "../../stores/financeStore";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const QUICK_PROMPTS = [
  "How am I doing this month?",
  "Where can I cut costs?",
  "Am I saving enough?",
  "Give me a savings plan",
];

export default function Advisor() {
  const { selectedMonth } = useFinanceStore();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hi! I can see your transactions and budgets. Ask me anything about your finances.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [streamingText, setStreamingText] = useState("");
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    flatListRef.current?.scrollToEnd({ animated: true });
  }, [messages, streamingText]);

  async function send(text?: string) {
    const question = text || input.trim();
    if (!question || loading) return;

    const userMsg: Message = { role: "user", content: question };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput("");
    setLoading(true);
    setStreamingText("");

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      // Invoke the edge function
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/ai-advisor`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            messages: updatedMessages,
            userId: user!.id,
            month: selectedMonth,
          }),
        },
      );

      // Read the SSE stream
      const reader = response.body!.getReader();
      const decoder = new TextDecoder();
      let fullText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n").filter((l) => l.startsWith("data: "));

        for (const line of lines) {
          const data = line.replace("data: ", "").trim();
          if (data === "[DONE]") break;
          try {
            const parsed = JSON.parse(data);
            fullText += parsed.text;
            setStreamingText(fullText);
          } catch {}
        }
      }

      // Commit the streamed reply to messages
      setMessages([
        ...updatedMessages,
        { role: "assistant", content: fullText },
      ]);
      setStreamingText("");
    } catch (error) {
      setMessages([
        ...updatedMessages,
        {
          role: "assistant",
          content:
            "Sorry, I could not reach the advisor right now. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  const allMessages = streamingText
    ? [...messages, { role: "assistant" as const, content: streamingText }]
    : messages;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "#fff" }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={90}
    >
      {/* Quick prompt chips */}
      <View style={{ paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8 }}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={QUICK_PROMPTS}
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => send(item)}
              style={{
                borderWidth: 1,
                borderColor: "#ddd",
                borderRadius: 20,
                paddingHorizontal: 14,
                paddingVertical: 6,
                marginRight: 8,
                backgroundColor: "#f9f9f9",
              }}
            >
              <Text style={{ fontSize: 12, color: "#555" }}>{item}</Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Messages */}
      <FlatList
        ref={flatListRef}
        data={allMessages}
        keyExtractor={(_, i) => String(i)}
        contentContainerStyle={{ padding: 16, gap: 10 }}
        renderItem={({ item, index }) => (
          <View
            style={{
              alignSelf: item.role === "user" ? "flex-end" : "flex-start",
              backgroundColor: item.role === "user" ? "#1D9E75" : "#f0f0f0",
              padding: 12,
              borderRadius: 16,
              borderBottomRightRadius: item.role === "user" ? 4 : 16,
              borderBottomLeftRadius: item.role === "assistant" ? 4 : 16,
              maxWidth: "85%",
            }}
          >
            <Text
              style={{
                color: item.role === "user" ? "#fff" : "#222",
                fontSize: 15,
                lineHeight: 22,
              }}
            >
              {item.content}
              {/* Blinking cursor while streaming */}
              {index === allMessages.length - 1 &&
              loading &&
              item.role === "assistant"
                ? "▋"
                : ""}
            </Text>
          </View>
        )}
        ListFooterComponent={
          loading && !streamingText ? (
            <ActivityIndicator color="#1D9E75" style={{ marginTop: 8 }} />
          ) : null
        }
      />

      {/* Input bar */}
      <View
        style={{
          flexDirection: "row",
          padding: 12,
          gap: 8,
          borderTopWidth: 0.5,
          borderTopColor: "#eee",
        }}
      >
        <TextInput
          value={input}
          onChangeText={setInput}
          placeholder="Ask about your finances..."
          placeholderTextColor="#aaa"
          onSubmitEditing={() => send()}
          returnKeyType="send"
          style={{
            flex: 1,
            borderWidth: 1,
            borderColor: "#ddd",
            borderRadius: 24,
            paddingHorizontal: 16,
            paddingVertical: 10,
            fontSize: 15,
            maxHeight: 100,
          }}
          multiline
        />
        <TouchableOpacity
          onPress={() => send()}
          disabled={loading || !input.trim()}
          style={{
            backgroundColor: loading || !input.trim() ? "#ccc" : "#1D9E75",
            borderRadius: 24,
            paddingHorizontal: 20,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Text style={{ color: "#fff", fontWeight: "600" }}>Send</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}
