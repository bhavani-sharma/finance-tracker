import { Text, View } from "react-native";

interface Props {
  spent: number;
  limit: number;
  showLabels?: boolean;
}

export default function BudgetProgressBar({
  spent,
  limit,
  showLabels = false,
}: Props) {
  const pct = Math.min(100, limit > 0 ? Math.round((spent / limit) * 100) : 0);
  const barColor = pct >= 100 ? "#E24B4A" : pct >= 80 ? "#BA7517" : "#1D9E75";
  const remaining = limit - spent;

  return (
    <View>
      {showLabels && (
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            marginBottom: 6,
          }}
        >
          <Text style={{ fontSize: 12, color: "#888" }}>
            ₹{spent.toLocaleString("en-IN")} spent
          </Text>
          <Text style={{ fontSize: 12, color: barColor, fontWeight: "600" }}>
            {pct}%
          </Text>
        </View>
      )}

      {/* Track */}
      <View
        style={{
          height: 8,
          backgroundColor: "#eee",
          borderRadius: 4,
          overflow: "hidden",
        }}
      >
        <View
          style={{
            width: `${pct}%`,
            height: "100%",
            backgroundColor: barColor,
            borderRadius: 4,
          }}
        />
      </View>

      {pct >= 100 && (
        <Text style={{ fontSize: 11, color: "#E24B4A", marginTop: 4 }}>
          Over by ₹{Math.abs(remaining).toLocaleString("en-IN")}
        </Text>
      )}
      {pct >= 80 && pct < 100 && (
        <Text style={{ fontSize: 11, color: "#BA7517", marginTop: 4 }}>
          ₹{remaining.toLocaleString("en-IN")} remaining
        </Text>
      )}
    </View>
  );
}
