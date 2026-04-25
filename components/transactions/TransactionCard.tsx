import { Ionicons } from "@expo/vector-icons";
import { Text, TouchableOpacity, View } from "react-native";

const CAT_META: Record<string, { icon: string; bg: string; color: string }> = {
  Food: { icon: "🍜", bg: "#E1F5EE", color: "#1D9E75" },
  Transport: { icon: "🚌", bg: "#E6F1FB", color: "#378ADD" },
  Housing: { icon: "🏠", bg: "#EEEDFE", color: "#7F77DD" },
  Entertainment: { icon: "🎬", bg: "#FAECE7", color: "#D85A30" },
  Health: { icon: "💊", bg: "#FBEAF0", color: "#D4537E" },
  Shopping: { icon: "🛍️", bg: "#FAEEDA", color: "#BA7517" },
  Income: { icon: "💰", bg: "#EAF3DE", color: "#1D9E75" },
  Other: { icon: "📦", bg: "#F1EFE8", color: "#888780" },
};

interface Transaction {
  id: string;
  description: string;
  category: string;
  amount: number;
  type: "income" | "expense";
  date: string;
}

interface Props {
  transaction: Transaction;
  onDelete: () => void;
}

export default function TransactionCard({ transaction: t, onDelete }: Props) {
  const meta = CAT_META[t.category] || CAT_META.Other;
  const isIncome = t.type === "income";

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        backgroundColor: "#fafafa",
        borderRadius: 14,
        padding: 14,
        borderWidth: 0.5,
        borderColor: "#eee",
      }}
    >
      {/* Icon */}
      <View
        style={{
          width: 42,
          height: 42,
          borderRadius: 21,
          backgroundColor: meta.bg,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text style={{ fontSize: 18 }}>{meta.icon}</Text>
      </View>

      {/* Info */}
      <View style={{ flex: 1 }}>
        <Text
          style={{ fontWeight: "600", fontSize: 14, color: "#222" }}
          numberOfLines={1}
        >
          {t.description}
        </Text>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 6,
            marginTop: 2,
          }}
        >
          <View
            style={{
              backgroundColor: meta.bg,
              paddingHorizontal: 8,
              paddingVertical: 2,
              borderRadius: 10,
            }}
          >
            <Text
              style={{ fontSize: 11, color: meta.color, fontWeight: "500" }}
            >
              {t.category}
            </Text>
          </View>
          <Text style={{ fontSize: 11, color: "#bbb" }}>{t.date}</Text>
        </View>
      </View>

      {/* Amount */}
      <Text
        style={{
          fontWeight: "700",
          fontSize: 15,
          color: isIncome ? "#1D9E75" : "#E24B4A",
        }}
      >
        {isIncome ? "+" : "-"}₹{t.amount.toLocaleString("en-IN")}
      </Text>

      {/* Delete */}
      <TouchableOpacity
        onPress={onDelete}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Ionicons name="trash-outline" size={16} color="#ddd" />
      </TouchableOpacity>
    </View>
  );
}
