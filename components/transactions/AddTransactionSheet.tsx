import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
    Alert,
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { useAddTransaction } from "../../lib/hooks/useTransactions";

const CATEGORIES = [
  "Food",
  "Transport",
  "Housing",
  "Entertainment",
  "Health",
  "Shopping",
  "Other",
];

interface Props {
  visible: boolean;
  onClose: () => void;
}

export default function AddTransactionSheet({ visible, onClose }: Props) {
  const { mutate: addTx, isPending } = useAddTransaction();

  const [type, setType] = useState<"expense" | "income">("expense");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Food");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);

  function reset() {
    setDescription("");
    setAmount("");
    setCategory("Food");
    setType("expense");
    setDate(new Date().toISOString().split("T")[0]);
  }

  function handleAdd() {
    if (!description.trim()) {
      Alert.alert("Error", "Please enter a description.");
      return;
    }
    const amt = parseFloat(amount);
    if (isNaN(amt) || amt <= 0) {
      Alert.alert("Error", "Please enter a valid amount.");
      return;
    }

    addTx(
      {
        description: description.trim(),
        amount: amt,
        category: type === "income" ? "Income" : category,
        type,
        date,
      },
      {
        onSuccess: () => {
          reset();
          onClose();
        },
        onError: (e: any) => Alert.alert("Error", e.message),
      },
    );
  }

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <KeyboardAvoidingView
        style={{
          flex: 1,
          justifyContent: "flex-end",
          backgroundColor: "rgba(0,0,0,0.4)",
        }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View
          style={{
            backgroundColor: "#fff",
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            padding: 24,
            paddingBottom: 40,
          }}
        >
          {/* Header */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 20,
            }}
          >
            <Text style={{ fontSize: 18, fontWeight: "700" }}>
              Add transaction
            </Text>
            <TouchableOpacity
              onPress={() => {
                reset();
                onClose();
              }}
            >
              <Ionicons name="close" size={22} color="#aaa" />
            </TouchableOpacity>
          </View>

          {/* Type toggle */}
          <View
            style={{
              flexDirection: "row",
              backgroundColor: "#f0f0f0",
              borderRadius: 12,
              padding: 4,
              marginBottom: 20,
            }}
          >
            {(["expense", "income"] as const).map((t) => (
              <TouchableOpacity
                key={t}
                onPress={() => setType(t)}
                style={{
                  flex: 1,
                  paddingVertical: 10,
                  borderRadius: 10,
                  alignItems: "center",
                  backgroundColor: type === t ? "#fff" : "transparent",
                }}
              >
                <Text
                  style={{
                    fontWeight: "600",
                    fontSize: 14,
                    color:
                      type === t
                        ? t === "income"
                          ? "#1D9E75"
                          : "#E24B4A"
                        : "#aaa",
                  }}
                >
                  {t === "expense" ? "Expense" : "Income"}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Amount */}
          <View style={{ alignItems: "center", marginBottom: 20 }}>
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 4 }}
            >
              <Text style={{ fontSize: 28, color: "#888" }}>₹</Text>
              <TextInput
                value={amount}
                onChangeText={setAmount}
                keyboardType="numeric"
                placeholder="0"
                placeholderTextColor="#ccc"
                style={{
                  fontSize: 40,
                  fontWeight: "700",
                  color: type === "income" ? "#1D9E75" : "#E24B4A",
                  minWidth: 80,
                  textAlign: "center",
                }}
              />
            </View>
          </View>

          {/* Description */}
          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder="Description (e.g. Swiggy order)"
            style={{
              borderWidth: 1,
              borderColor: "#eee",
              borderRadius: 12,
              padding: 14,
              fontSize: 15,
              marginBottom: 14,
              backgroundColor: "#fafafa",
            }}
          />

          {/* Category (only for expenses) */}
          {type === "expense" && (
            <>
              <Text style={{ fontSize: 13, color: "#888", marginBottom: 8 }}>
                Category
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={{ marginBottom: 14 }}
              >
                {CATEGORIES.map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    onPress={() => setCategory(cat)}
                    style={{
                      paddingHorizontal: 14,
                      paddingVertical: 8,
                      borderRadius: 20,
                      marginRight: 8,
                      backgroundColor: category === cat ? "#1D9E75" : "#f0f0f0",
                    }}
                  >
                    <Text
                      style={{
                        color: category === cat ? "#fff" : "#555",
                        fontSize: 13,
                      }}
                    >
                      {cat}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </>
          )}

          <TouchableOpacity
            onPress={handleAdd}
            disabled={isPending}
            style={{
              backgroundColor: isPending ? "#a0d8c8" : "#1D9E75",
              padding: 16,
              borderRadius: 14,
              alignItems: "center",
            }}
          >
            <Text style={{ color: "#fff", fontWeight: "700", fontSize: 16 }}>
              {isPending ? "Adding..." : "Add transaction"}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
