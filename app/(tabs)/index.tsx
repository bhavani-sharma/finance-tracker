import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useCallback, useState } from "react";
import {
  Modal,
  RefreshControl,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import BudgetProgressBar from "../../components/budgets/BudgetProgressBar";
import SpendingDonut from "../../components/charts/SpendingDonut";
import TrendLine from "../../components/charts/TrendLine";
import AddTransactionSheet from "../../components/transactions/AddTransactionSheet";
import TransactionCard from "../../components/transactions/TransactionCard";
import { useBudgets } from "../../lib/hooks/useBudgets";
import { useTransactions } from "../../lib/hooks/useTransactions";
import { supabase } from "../../lib/supabase";
import { useFinanceStore } from "../../stores/financeStore";

const MONTHS = [
  "2026-01",
  "2026-02",
  "2026-03",
  "2026-04",
  "2025-10",
  "2025-11",
  "2025-12",
];
const MONTH_LABELS: Record<string, string> = {
  "2026-01": "Jan 2026",
  "2026-02": "Feb 2026",
  "2026-03": "Mar 2026",
  "2026-04": "Apr 2026",
  "2025-10": "Oct 2025",
  "2025-11": "Nov 2025",
  "2025-12": "Dec 2025",
};

export default function Overview() {
  const { selectedMonth, setMonth } = useFinanceStore();
  const {
    data: txns = [],
    isLoading: txLoading,
    refetch: refetchTx,
  } = useTransactions(selectedMonth);
  const {
    data: budgets = [],
    isLoading: budgetLoading,
    refetch: refetchBudgets,
  } = useBudgets(selectedMonth);

  const [addVisible, setAddVisible] = useState(false);
  const [monthPickerVisible, setMonthPickerVisible] = useState(false);

  const isLoading = txLoading || budgetLoading;

  const onRefresh = useCallback(() => {
    refetchTx();
    refetchBudgets();
  }, [refetchTx, refetchBudgets]);

  // Aggregations
  const income = txns
    .filter((t) => t.type === "income")
    .reduce((s, t) => s + t.amount, 0);
  const expenses = txns
    .filter((t) => t.type === "expense")
    .reduce((s, t) => s + t.amount, 0);
  const balance = income - expenses;
  const savingsRate = income > 0 ? Math.round((balance / income) * 100) : 0;

  function catSpend(cat: string) {
    return txns
      .filter((t) => t.type === "expense" && t.category === cat)
      .reduce((s, t) => s + t.amount, 0);
  }

  const overBudget = budgets.filter(
    (b) => catSpend(b.category) > b.limit_amount,
  );
  const nearBudget = budgets.filter((b) => {
    const pct = b.limit_amount > 0 ? catSpend(b.category) / b.limit_amount : 0;
    return pct >= 0.8 && pct < 1;
  });
  const recentTxns = [...txns]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 5);

  async function signOut() {
    await supabase.auth.signOut();
    router.replace("/auth/login");
  }

  const MetricCard = ({
    label,
    value,
    color,
    sub,
  }: {
    label: string;
    value: string;
    color: string;
    sub?: string;
  }) => (
    <View
      style={{
        flex: 1,
        minWidth: "47%",
        backgroundColor: "#f7f7f7",
        borderRadius: 14,
        padding: 14,
      }}
    >
      <Text style={{ fontSize: 12, color: "#999", marginBottom: 4 }}>
        {label}
      </Text>
      <Text style={{ fontSize: 19, fontWeight: "700", color }}>{value}</Text>
      {sub && (
        <Text style={{ fontSize: 11, color: "#bbb", marginTop: 2 }}>{sub}</Text>
      )}
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View
        style={{
          paddingHorizontal: 20,
          paddingTop: 56,
          paddingBottom: 16,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottomWidth: 0.5,
          borderBottomColor: "#f0f0f0",
        }}
      >
        <View>
          <Text style={{ fontSize: 22, fontWeight: "700" }}>Overview</Text>
          <TouchableOpacity
            onPress={() => setMonthPickerVisible(true)}
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 4,
              marginTop: 2,
            }}
          >
            <Text style={{ fontSize: 13, color: "#1D9E75", fontWeight: "500" }}>
              {MONTH_LABELS[selectedMonth] || selectedMonth}
            </Text>
            <Ionicons name="chevron-down" size={13} color="#1D9E75" />
          </TouchableOpacity>
        </View>
        <View style={{ flexDirection: "row", gap: 10 }}>
          <TouchableOpacity
            onPress={() => setAddVisible(true)}
            style={{
              width: 38,
              height: 38,
              borderRadius: 19,
              backgroundColor: "#1D9E75",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons name="add" size={20} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={signOut}
            style={{
              width: 38,
              height: 38,
              borderRadius: 19,
              backgroundColor: "#f5f5f5",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons name="log-out-outline" size={18} color="#888" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={onRefresh}
            tintColor="#1D9E75"
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Metric cards */}
        <View
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            gap: 10,
            marginBottom: 20,
          }}
        >
          <MetricCard
            label="Income"
            value={`₹${income.toLocaleString("en-IN")}`}
            color="#1D9E75"
          />
          <MetricCard
            label="Expenses"
            value={`₹${expenses.toLocaleString("en-IN")}`}
            color="#E24B4A"
          />
          <MetricCard
            label="Balance"
            value={`₹${Math.abs(balance).toLocaleString("en-IN")}`}
            color={balance >= 0 ? "#1D9E75" : "#E24B4A"}
            sub={balance < 0 ? "In deficit" : "Available"}
          />
          <MetricCard
            label="Savings rate"
            value={`${savingsRate}%`}
            color={
              savingsRate >= 20
                ? "#1D9E75"
                : savingsRate >= 10
                  ? "#BA7517"
                  : "#E24B4A"
            }
            sub={
              savingsRate >= 20
                ? "Great job!"
                : savingsRate >= 10
                  ? "Could be better"
                  : "Needs attention"
            }
          />
        </View>

        {/* Alerts */}
        {overBudget.length > 0 && (
          <TouchableOpacity
            onPress={() => router.push("/(tabs)/budgets")}
            style={{
              backgroundColor: "#FFF3F3",
              borderRadius: 12,
              padding: 14,
              marginBottom: 12,
              flexDirection: "row",
              alignItems: "center",
              gap: 10,
              borderLeftWidth: 3,
              borderLeftColor: "#E24B4A",
            }}
          >
            <Ionicons name="warning" size={18} color="#E24B4A" />
            <View style={{ flex: 1 }}>
              <Text
                style={{ color: "#E24B4A", fontWeight: "700", fontSize: 13 }}
              >
                Over budget
              </Text>
              <Text style={{ color: "#E24B4A", fontSize: 12, opacity: 0.8 }}>
                {overBudget.map((b) => b.category).join(", ")}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#E24B4A" />
          </TouchableOpacity>
        )}

        {nearBudget.length > 0 && overBudget.length === 0 && (
          <View
            style={{
              backgroundColor: "#FFFBF0",
              borderRadius: 12,
              padding: 14,
              marginBottom: 12,
              flexDirection: "row",
              alignItems: "center",
              gap: 10,
              borderLeftWidth: 3,
              borderLeftColor: "#BA7517",
            }}
          >
            <Ionicons name="alert-circle" size={18} color="#BA7517" />
            <Text style={{ color: "#BA7517", fontSize: 13, flex: 1 }}>
              Approaching limit in{" "}
              <Text style={{ fontWeight: "700" }}>
                {nearBudget.map((b) => b.category).join(", ")}
              </Text>
            </Text>
          </View>
        )}

        {/* Charts */}
        <View
          style={{
            backgroundColor: "#fafafa",
            borderRadius: 16,
            padding: 16,
            marginBottom: 16,
            borderWidth: 0.5,
            borderColor: "#eee",
          }}
        >
          <SpendingDonut transactions={txns} />
        </View>

        <View
          style={{
            backgroundColor: "#fafafa",
            borderRadius: 16,
            padding: 16,
            marginBottom: 16,
            borderWidth: 0.5,
            borderColor: "#eee",
          }}
        >
          <TrendLine currentIncome={income} currentExpenses={expenses} />
        </View>

        {/* Budget summary */}
        {budgets.length > 0 && (
          <View
            style={{
              backgroundColor: "#fafafa",
              borderRadius: 16,
              padding: 16,
              marginBottom: 16,
              borderWidth: 0.5,
              borderColor: "#eee",
            }}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 14,
              }}
            >
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: "600",
                  color: "#888",
                  textTransform: "uppercase",
                  letterSpacing: 0.5,
                }}
              >
                Budgets
              </Text>
              <TouchableOpacity onPress={() => router.push("/(tabs)/budgets")}>
                <Text
                  style={{ fontSize: 13, color: "#1D9E75", fontWeight: "500" }}
                >
                  See all
                </Text>
              </TouchableOpacity>
            </View>
            {budgets.slice(0, 3).map((b) => (
              <View key={b.id} style={{ marginBottom: 12 }}>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    marginBottom: 5,
                  }}
                >
                  <Text style={{ fontSize: 13, fontWeight: "500" }}>
                    {b.category}
                  </Text>
                  <Text style={{ fontSize: 12, color: "#999" }}>
                    ₹{catSpend(b.category).toLocaleString("en-IN")} / ₹
                    {b.limit_amount.toLocaleString("en-IN")}
                  </Text>
                </View>
                <BudgetProgressBar
                  spent={catSpend(b.category)}
                  limit={b.limit_amount}
                />
              </View>
            ))}
          </View>
        )}

        {/* Recent transactions */}
        <View
          style={{
            backgroundColor: "#fafafa",
            borderRadius: 16,
            padding: 16,
            borderWidth: 0.5,
            borderColor: "#eee",
          }}
        >
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 14,
            }}
          >
            <Text
              style={{
                fontSize: 13,
                fontWeight: "600",
                color: "#888",
                textTransform: "uppercase",
                letterSpacing: 0.5,
              }}
            >
              Recent
            </Text>
            <TouchableOpacity
              onPress={() => router.push("/(tabs)/transactions")}
            >
              <Text
                style={{ fontSize: 13, color: "#1D9E75", fontWeight: "500" }}
              >
                See all
              </Text>
            </TouchableOpacity>
          </View>

          {recentTxns.length === 0 ? (
            <View style={{ alignItems: "center", paddingVertical: 24 }}>
              <Ionicons name="receipt-outline" size={36} color="#ddd" />
              <Text style={{ color: "#ccc", marginTop: 8, fontSize: 14 }}>
                No transactions yet
              </Text>
              <TouchableOpacity
                onPress={() => setAddVisible(true)}
                style={{
                  marginTop: 12,
                  backgroundColor: "#1D9E75",
                  paddingHorizontal: 20,
                  paddingVertical: 10,
                  borderRadius: 20,
                }}
              >
                <Text
                  style={{ color: "#fff", fontWeight: "600", fontSize: 13 }}
                >
                  Add your first
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={{ gap: 8 }}>
              {recentTxns.map((t) => (
                <TransactionCard
                  key={t.id}
                  transaction={t}
                  onDelete={() => {}} // delete handled in transactions tab
                />
              ))}
            </View>
          )}
        </View>

        {/* AI advisor nudge */}
        <TouchableOpacity
          onPress={() => router.push("/(tabs)/advisor")}
          style={{
            marginTop: 16,
            backgroundColor: "#f0faf6",
            borderRadius: 16,
            padding: 16,
            flexDirection: "row",
            alignItems: "center",
            gap: 12,
            borderWidth: 0.5,
            borderColor: "#c0ede0",
          }}
        >
          <View
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: "#1D9E75",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons name="sparkles" size={18} color="#fff" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontWeight: "700", fontSize: 14, color: "#1D9E75" }}>
              Talk to your AI advisor
            </Text>
            <Text style={{ fontSize: 12, color: "#5bb89a", marginTop: 2 }}>
              Get personalised tips based on your spending
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#1D9E75" />
        </TouchableOpacity>
      </ScrollView>

      {/* Month picker modal */}
      <Modal visible={monthPickerVisible} animationType="fade" transparent>
        <TouchableOpacity
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.4)",
            justifyContent: "center",
            alignItems: "center",
          }}
          activeOpacity={1}
          onPress={() => setMonthPickerVisible(false)}
        >
          <View
            style={{
              backgroundColor: "#fff",
              borderRadius: 20,
              padding: 8,
              width: 260,
            }}
          >
            <Text
              style={{
                fontSize: 15,
                fontWeight: "700",
                padding: 12,
                paddingBottom: 8,
              }}
            >
              Select month
            </Text>
            {MONTHS.map((m) => (
              <TouchableOpacity
                key={m}
                onPress={() => {
                  setMonth(m);
                  setMonthPickerVisible(false);
                }}
                style={{
                  paddingVertical: 12,
                  paddingHorizontal: 16,
                  borderRadius: 12,
                  backgroundColor:
                    selectedMonth === m ? "#f0faf6" : "transparent",
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    fontSize: 15,
                    color: selectedMonth === m ? "#1D9E75" : "#333",
                    fontWeight: selectedMonth === m ? "600" : "400",
                  }}
                >
                  {MONTH_LABELS[m]}
                </Text>
                {selectedMonth === m && (
                  <Ionicons name="checkmark" size={16} color="#1D9E75" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      <AddTransactionSheet
        visible={addVisible}
        onClose={() => setAddVisible(false)}
      />
    </View>
  );
}
