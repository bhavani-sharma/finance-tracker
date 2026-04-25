import { Text, View } from "react-native";

interface Props {
  role: "user" | "assistant";
  content: string;
  isStreaming?: boolean;
}

export default function ChatBubble({ role, content, isStreaming }: Props) {
  const isUser = role === "user";

  return (
    <View
      style={{
        alignSelf: isUser ? "flex-end" : "flex-start",
        maxWidth: "85%",
        marginVertical: 4,
      }}
    >
      {!isUser && (
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 6,
            marginBottom: 4,
          }}
        >
          <View
            style={{
              width: 20,
              height: 20,
              borderRadius: 10,
              backgroundColor: "#1D9E75",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text style={{ fontSize: 10 }}>AI</Text>
          </View>
          <Text style={{ fontSize: 11, color: "#aaa" }}>Advisor</Text>
        </View>
      )}

      <View
        style={{
          backgroundColor: isUser ? "#1D9E75" : "#f0f0f0",
          padding: 12,
          borderRadius: 18,
          borderBottomRightRadius: isUser ? 4 : 18,
          borderBottomLeftRadius: isUser ? 18 : 4,
        }}
      >
        <Text
          style={{
            color: isUser ? "#fff" : "#222",
            fontSize: 15,
            lineHeight: 22,
          }}
        >
          {content}
          {isStreaming && (
            <Text style={{ color: isUser ? "#fff" : "#1D9E75" }}>▋</Text>
          )}
        </Text>
      </View>

      {isUser && (
        <Text
          style={{
            fontSize: 11,
            color: "#bbb",
            alignSelf: "flex-end",
            marginTop: 3,
          }}
        >
          You
        </Text>
      )}
    </View>
  );
}
