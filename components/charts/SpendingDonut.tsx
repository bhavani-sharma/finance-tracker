import { Text, View } from "react-native";
import Svg, { G, Path, Text as SvgText } from "react-native-svg";

const CAT_COLORS: Record<string, string> = {
  Food: "#1D9E75",
  Transport: "#378ADD",
  Housing: "#7F77DD",
  Entertainment: "#D85A30",
  Health: "#D4537E",
  Shopping: "#BA7517",
  Other: "#888780",
};

interface Transaction {
  category: string;
  type: string;
  amount: number;
}
interface Props {
  transactions: Transaction[];
}

const SIZE = 180;
const CX = SIZE / 2;
const CY = SIZE / 2;
const R = 72;
const INNER = 44;

function polarToXY(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function slicePath(
  cx: number,
  cy: number,
  r: number,
  inner: number,
  startDeg: number,
  endDeg: number,
) {
  const s = polarToXY(cx, cy, r, startDeg);
  const e = polarToXY(cx, cy, r, endDeg);
  const si = polarToXY(cx, cy, inner, startDeg);
  const ei = polarToXY(cx, cy, inner, endDeg);
  const large = endDeg - startDeg > 180 ? 1 : 0;
  return [
    `M ${s.x.toFixed(2)} ${s.y.toFixed(2)}`,
    `A ${r} ${r} 0 ${large} 1 ${e.x.toFixed(2)} ${e.y.toFixed(2)}`,
    `L ${ei.x.toFixed(2)} ${ei.y.toFixed(2)}`,
    `A ${inner} ${inner} 0 ${large} 0 ${si.x.toFixed(2)} ${si.y.toFixed(2)}`,
    "Z",
  ].join(" ");
}

export default function SpendingDonut({ transactions }: Props) {
  const expenses = transactions.filter((t) => t.type === "expense");

  const grouped = expenses.reduce(
    (acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    },
    {} as Record<string, number>,
  );

  const entries = Object.entries(grouped).filter(([, v]) => v > 0);
  const total = entries.reduce((s, [, v]) => s + v, 0);

  if (entries.length === 0) {
    return (
      <View
        style={{ height: 180, alignItems: "center", justifyContent: "center" }}
      >
        <Text style={{ color: "#ccc", fontSize: 14 }}>No expense data</Text>
      </View>
    );
  }

  // Build slices
  let cursor = 0;
  const slices = entries.map(([cat, amount]) => {
    const sweep = (amount / total) * 360;
    const start = cursor;
    const end = cursor + sweep - 1.5; // 1.5° gap
    cursor += sweep;
    return { cat, amount, start, end, color: CAT_COLORS[cat] || "#888" };
  });

  return (
    <View>
      <Text
        style={{
          fontSize: 13,
          fontWeight: "600",
          color: "#888",
          marginBottom: 8,
          textTransform: "uppercase",
          letterSpacing: 0.5,
        }}
      >
        Spending breakdown
      </Text>

      <View style={{ alignItems: "center" }}>
        <Svg width={SIZE} height={SIZE}>
          <G>
            {slices.map((s) => (
              <Path
                key={s.cat}
                d={slicePath(CX, CY, R, INNER, s.start, s.end)}
                fill={s.color}
              />
            ))}
            {/* Centre label */}
            <SvgText
              x={CX}
              y={CY - 8}
              textAnchor="middle"
              fontSize="11"
              fill="#aaa"
            >
              Total
            </SvgText>
            <SvgText
              x={CX}
              y={CY + 10}
              textAnchor="middle"
              fontSize="15"
              fontWeight="bold"
              fill="#222"
            >
              ₹{(total / 1000).toFixed(1)}k
            </SvgText>
          </G>
        </Svg>
      </View>

      {/* Legend */}
      <View
        style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 8 }}
      >
        {slices.map((s) => (
          <View
            key={s.cat}
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 5,
              width: "47%",
            }}
          >
            <View
              style={{
                width: 10,
                height: 10,
                borderRadius: 2,
                backgroundColor: s.color,
              }}
            />
            <Text
              style={{ fontSize: 12, color: "#555", flex: 1 }}
              numberOfLines={1}
            >
              {s.cat}
            </Text>
            <Text style={{ fontSize: 12, color: "#888" }}>
              {Math.round((s.amount / total) * 100)}%
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}
