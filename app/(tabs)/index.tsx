// // app/(tabs)/index.tsx
import { RefreshControl, ScrollView, Text, View } from "react-native";
import { useTransactions } from "../../lib/hooks/useTransactions";
import { useFinanceStore } from "../../stores/financeStore";

export default function Overview() {
  const { selectedMonth } = useFinanceStore();
  const {
    data: txns = [],
    isLoading,
    refetch,
  } = useTransactions(selectedMonth);

  const income = txns
    .filter((t) => t.type === "income")
    .reduce((s, t) => s + t.amount, 0);
  const expenses = txns
    .filter((t) => t.type === "expense")
    .reduce((s, t) => s + t.amount, 0);
  const balance = income - expenses;
  const savingsRate = income > 0 ? Math.round((balance / income) * 100) : 0;

  return (
    <ScrollView
      contentContainerStyle={{ padding: 20 }}
      refreshControl={
        <RefreshControl refreshing={isLoading} onRefresh={refetch} />
      }
    >
      <Text style={{ fontSize: 22, fontWeight: "600", marginBottom: 20 }}>
        Overview
      </Text>

      {/* Metric cards */}
      <View
        style={{
          flexDirection: "row",
          flexWrap: "wrap",
          gap: 10,
          marginBottom: 20,
        }}
      >
        {[
          {
            label: "Income",
            value: `₹${income.toLocaleString("en-IN")}`,
            color: "#1D9E75",
          },
          {
            label: "Expenses",
            value: `₹${expenses.toLocaleString("en-IN")}`,
            color: "#E24B4A",
          },
          {
            label: "Balance",
            value: `₹${balance.toLocaleString("en-IN")}`,
            color: balance >= 0 ? "#1D9E75" : "#E24B4A",
          },
          { label: "Savings", value: `${savingsRate}%`, color: "#378ADD" },
        ].map((m) => (
          <View
            key={m.label}
            style={{
              flex: 1,
              minWidth: "45%",
              backgroundColor: "#f5f5f5",
              borderRadius: 12,
              padding: 14,
            }}
          >
            <Text style={{ fontSize: 12, color: "#888", marginBottom: 4 }}>
              {m.label}
            </Text>
            <Text style={{ fontSize: 20, fontWeight: "600", color: m.color }}>
              {m.value}
            </Text>
          </View>
        ))}
      </View>

      {/* Add SpendingDonut and TrendLine chart components here */}
      {/* Add recent transactions list here */}
    </ScrollView>
  );
}
