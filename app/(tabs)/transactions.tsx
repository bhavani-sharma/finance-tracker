import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
    Alert,
    FlatList,
    RefreshControl,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import AddTransactionSheet from "../../components/transactions/AddTransactionSheet";
import TransactionCard from "../../components/transactions/TransactionCard";
import {
    useDeleteTransaction,
    useTransactions,
} from "../../lib/hooks/useTransactions";
import { useFinanceStore } from "../../stores/financeStore";

const FILTER_CATS = [
  "All",
  "Income",
  "Food",
  "Transport",
  "Housing",
  "Entertainment",
  "Health",
  "Shopping",
  "Other",
];

export default function Transactions() {
  const { selectedMonth } = useFinanceStore();
  const {
    data: txns = [],
    isLoading,
    refetch,
  } = useTransactions(selectedMonth);
  const { mutate: deleteTx } = useDeleteTransaction();

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [sheetVisible, setSheetVisible] = useState(false);

  const filtered = txns.filter((t) => {
    const matchSearch = t.description
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchFilter =
      filter === "All"
        ? true
        : filter === "Income"
          ? t.type === "income"
          : t.category === filter;
    return matchSearch && matchFilter;
  });

  function confirmDelete(id: string) {
    Alert.alert("Delete transaction", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => deleteTx(id) },
    ]);
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      {/* Header */}
      <View style={{ padding: 20, paddingBottom: 10 }}>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 14,
          }}
        >
          <Text style={{ fontSize: 22, fontWeight: "600" }}>Transactions</Text>
          <TouchableOpacity
            onPress={() => setSheetVisible(true)}
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
              Add
            </Text>
          </TouchableOpacity>
        </View>

        {/* Search */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: "#f5f5f5",
            borderRadius: 12,
            paddingHorizontal: 12,
            marginBottom: 12,
          }}
        >
          <Ionicons name="search" size={16} color="#aaa" />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search transactions..."
            placeholderTextColor="#aaa"
            style={{
              flex: 1,
              paddingVertical: 10,
              paddingLeft: 8,
              fontSize: 14,
            }}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch("")}>
              <Ionicons name="close-circle" size={16} color="#aaa" />
            </TouchableOpacity>
          )}
        </View>

        {/* Category filter chips */}
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={FILTER_CATS}
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => setFilter(item)}
              style={{
                paddingHorizontal: 14,
                paddingVertical: 6,
                borderRadius: 20,
                marginRight: 8,
                backgroundColor: filter === item ? "#1D9E75" : "#f0f0f0",
              }}
            >
              <Text
                style={{
                  color: filter === item ? "#fff" : "#555",
                  fontSize: 13,
                }}
              >
                {item}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Transactions list */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refetch} />
        }
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20 }}
        ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
        ListEmptyComponent={
          <View style={{ alignItems: "center", marginTop: 60 }}>
            <Ionicons name="receipt-outline" size={48} color="#ccc" />
            <Text style={{ color: "#aaa", marginTop: 12, fontSize: 15 }}>
              No transactions found
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <TransactionCard
            transaction={item}
            onDelete={() => confirmDelete(item.id)}
          />
        )}
      />

      <AddTransactionSheet
        visible={sheetVisible}
        onClose={() => setSheetVisible(false)}
      />
    </View>
  );
}
