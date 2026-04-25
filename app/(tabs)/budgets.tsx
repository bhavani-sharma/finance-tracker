import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  Alert,
  Modal,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import BudgetProgressBar from "../../components/budgets/BudgetProgressBar";
import {
  useBudgets,
  useDeleteBudget,
  useSetBudget,
} from "../../lib/hooks/useBudgets";
import { useTransactions } from "../../lib/hooks/useTransactions";
import { useFinanceStore } from "../../stores/financeStore";

const CATEGORIES = [
  "Food",
  "Transport",
  "Housing",
  "Entertainment",
  "Health",
  "Shopping",
  "Other",
];

export default function Budgets() {
  const { selectedMonth } = useFinanceStore();
  const { data: budgets = [], isLoading, refetch } = useBudgets(selectedMonth);
  const { data: txns = [] } = useTransactions(selectedMonth);
  const { mutate: setBudget } = useSetBudget();
  const { mutate: deleteBudget } = useDeleteBudget();

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedCat, setSelectedCat] = useState(CATEGORIES[0]);
  const [limitInput, setLimitInput] = useState("");

  function catSpend(cat: string) {
    return txns
      .filter((t) => t.type === "expense" && t.category === cat)
      .reduce((s, t) => s + t.amount, 0);
  }

  function handleSave() {
    const limit = parseFloat(limitInput);
    if (isNaN(limit) || limit <= 0) {
      Alert.alert("Invalid amount", "Please enter a valid budget limit.");
      return;
    }
    setBudget({
      category: selectedCat,
      limit_amount: limit,
      month: selectedMonth,
    });
    setLimitInput("");
    setModalVisible(false);
  }

  const totalBudgeted = budgets.reduce((s, b) => s + b.limit_amount, 0);
  const totalSpent = budgets.reduce((s, b) => s + catSpend(b.category), 0);
  const overBudget = budgets.filter(
    (b) => catSpend(b.category) > b.limit_amount,
  );

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: "#fff" }}
      contentContainerStyle={{ padding: 20 }}
      refreshControl={
        <RefreshControl refreshing={isLoading} onRefresh={refetch} />
      }
    >
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 20,
        }}
      >
        <Text style={{ fontSize: 22, fontWeight: "600" }}>Budgets</Text>
        <TouchableOpacity
          onPress={() => setModalVisible(true)}
          style={{
            backgroundColor: "#1D9E75",
            borderRadius: 20,
            paddingHorizontal: 14,
            paddingVertical: 8,
            flexDirection: "row",
            alignItems: "center",
            gap: 4,
          }}
        >
          <Ionicons name="add" size={16} color="#fff" />
          <Text style={{ color: "#fff", fontWeight: "600", fontSize: 13 }}>
            Set budget
          </Text>
        </TouchableOpacity>
      </View>

      {/* Summary cards */}
      <View style={{ flexDirection: "row", gap: 10, marginBottom: 20 }}>
        {[
          {
            label: "Total budgeted",
            value: `₹${totalBudgeted.toLocaleString("en-IN")}`,
            color: "#378ADD",
          },
          {
            label: "Total spent",
            value: `₹${totalSpent.toLocaleString("en-IN")}`,
            color: totalSpent > totalBudgeted ? "#E24B4A" : "#1D9E75",
          },
        ].map((m) => (
          <View
            key={m.label}
            style={{
              flex: 1,
              backgroundColor: "#f5f5f5",
              borderRadius: 12,
              padding: 14,
            }}
          >
            <Text style={{ fontSize: 12, color: "#888", marginBottom: 4 }}>
              {m.label}
            </Text>
            <Text style={{ fontSize: 18, fontWeight: "600", color: m.color }}>
              {m.value}
            </Text>
          </View>
        ))}
      </View>

      {overBudget.length > 0 && (
        <View
          style={{
            backgroundColor: "#FFF3F3",
            borderRadius: 12,
            padding: 14,
            marginBottom: 16,
            borderLeftWidth: 3,
            borderLeftColor: "#E24B4A",
          }}
        >
          <Text style={{ color: "#E24B4A", fontWeight: "600", fontSize: 13 }}>
            Over budget in {overBudget.map((b) => b.category).join(", ")}
          </Text>
        </View>
      )}

      {budgets.length === 0 ? (
        <View style={{ alignItems: "center", marginTop: 60 }}>
          <Ionicons name="pie-chart-outline" size={48} color="#ccc" />
          <Text style={{ color: "#aaa", marginTop: 12, fontSize: 15 }}>
            No budgets set yet
          </Text>
          <Text style={{ color: "#bbb", fontSize: 13, marginTop: 4 }}>
            Tap "Set budget" to get started
          </Text>
        </View>
      ) : (
        budgets.map((b) => (
          <View
            key={b.id}
            style={{
              backgroundColor: "#fafafa",
              borderRadius: 14,
              padding: 16,
              marginBottom: 12,
              borderWidth: 0.5,
              borderColor: "#eee",
            }}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 10,
              }}
            >
              <Text style={{ fontWeight: "600", fontSize: 15 }}>
                {b.category}
              </Text>
              <TouchableOpacity onPress={() => deleteBudget(b.id)}>
                <Ionicons name="trash-outline" size={18} color="#ccc" />
              </TouchableOpacity>
            </View>
            <BudgetProgressBar
              spent={catSpend(b.category)}
              limit={b.limit_amount}
            />
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                marginTop: 8,
              }}
            >
              <Text style={{ fontSize: 12, color: "#888" }}>
                ₹{catSpend(b.category).toLocaleString("en-IN")} spent
              </Text>
              <Text style={{ fontSize: 12, color: "#888" }}>
                ₹{b.limit_amount.toLocaleString("en-IN")} limit
              </Text>
            </View>
          </View>
        ))
      )}

      {/* Add budget modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.4)",
            justifyContent: "flex-end",
          }}
        >
          <View
            style={{
              backgroundColor: "#fff",
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              padding: 24,
            }}
          >
            <Text style={{ fontSize: 18, fontWeight: "600", marginBottom: 20 }}>
              Set budget limit
            </Text>

            <Text style={{ fontSize: 13, color: "#888", marginBottom: 8 }}>
              Category
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={{ marginBottom: 16 }}
            >
              {CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  onPress={() => setSelectedCat(cat)}
                  style={{
                    paddingHorizontal: 14,
                    paddingVertical: 8,
                    borderRadius: 20,
                    marginRight: 8,
                    backgroundColor:
                      selectedCat === cat ? "#1D9E75" : "#f0f0f0",
                  }}
                >
                  <Text
                    style={{
                      color: selectedCat === cat ? "#fff" : "#555",
                      fontSize: 13,
                    }}
                  >
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={{ fontSize: 13, color: "#888", marginBottom: 8 }}>
              Monthly limit (₹)
            </Text>
            <TextInput
              value={limitInput}
              onChangeText={setLimitInput}
              keyboardType="numeric"
              placeholder="e.g. 5000"
              style={{
                borderWidth: 1,
                borderColor: "#ddd",
                borderRadius: 12,
                padding: 14,
                fontSize: 16,
                marginBottom: 20,
              }}
            />

            <View style={{ flexDirection: "row", gap: 10 }}>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={{
                  flex: 1,
                  padding: 16,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: "#ddd",
                  alignItems: "center",
                }}
              >
                <Text style={{ fontWeight: "600", color: "#555" }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSave}
                style={{
                  flex: 1,
                  padding: 16,
                  borderRadius: 12,
                  backgroundColor: "#1D9E75",
                  alignItems: "center",
                }}
              >
                <Text style={{ fontWeight: "600", color: "#fff" }}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}
