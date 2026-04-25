import { Text, View } from "react-native";
import Svg, {
  Defs,
  Line,
  LinearGradient,
  Polygon,
  Polyline,
  Stop,
  Text as SvgText,
} from "react-native-svg";

const MONTHS = ["Nov", "Dec", "Jan", "Feb", "Mar", "Apr"];
const W = 320;
const H = 160;
const PAD = { top: 12, bottom: 28, left: 48, right: 12 };
const CHART_W = W - PAD.left - PAD.right;
const CHART_H = H - PAD.top - PAD.bottom;

interface Props {
  currentIncome: number;
  currentExpenses: number;
}

const INCOME_DATA = [72000, 78000, 85000, 80000, 90000];
const EXPENSE_DATA = [48000, 52000, 60000, 55000, 62000];

function toPoints(values: number[], minY: number, maxY: number): string {
  return values
    .map((v, i) => {
      const x = PAD.left + (i / (values.length - 1)) * CHART_W;
      const y = PAD.top + CHART_H - ((v - minY) / (maxY - minY)) * CHART_H;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
}

function toFillPoints(values: number[], minY: number, maxY: number): string {
  const linePoints = values.map((v, i) => {
    const x = PAD.left + (i / (values.length - 1)) * CHART_W;
    const y = PAD.top + CHART_H - ((v - minY) / (maxY - minY)) * CHART_H;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });
  const firstX = PAD.left.toFixed(1);
  const lastX = (PAD.left + CHART_W).toFixed(1);
  const baseY = (PAD.top + CHART_H).toFixed(1);
  return `${firstX},${baseY} ${linePoints.join(" ")} ${lastX},${baseY}`;
}

export default function TrendLine({ currentIncome, currentExpenses }: Props) {
  const allIncome = [...INCOME_DATA, currentIncome];
  const allExpense = [...EXPENSE_DATA, currentExpenses];
  const allValues = [...allIncome, ...allExpense];

  const rawMin = Math.min(...allValues);
  const rawMax = Math.max(...allValues);
  const padding = (rawMax - rawMin) * 0.15;
  const minY = Math.max(0, rawMin - padding);
  const maxY = rawMax + padding;

  // Y-axis tick labels
  const ticks = [0, 0.5, 1].map((t) => Math.round(minY + t * (maxY - minY)));

  return (
    <View>
      <Text
        style={{
          fontSize: 13,
          fontWeight: "600",
          color: "#888",
          marginBottom: 6,
          textTransform: "uppercase",
          letterSpacing: 0.5,
        }}
      >
        6-month trend
      </Text>

      <Svg
        width="100%"
        viewBox={`0 0 ${W} ${H}`}
        style={{ overflow: "visible" }}
      >
        <Defs>
          <LinearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor="#1D9E75" stopOpacity="0.15" />
            <Stop offset="100%" stopColor="#1D9E75" stopOpacity="0" />
          </LinearGradient>
          <LinearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor="#E24B4A" stopOpacity="0.12" />
            <Stop offset="100%" stopColor="#E24B4A" stopOpacity="0" />
          </LinearGradient>
        </Defs>

        {/* Horizontal grid lines */}
        {ticks.map((tick, i) => {
          const y =
            PAD.top + CHART_H - ((tick - minY) / (maxY - minY)) * CHART_H;
          return (
            <Line
              key={i}
              x1={PAD.left}
              y1={y.toFixed(1)}
              x2={PAD.left + CHART_W}
              y2={y.toFixed(1)}
              stroke="#f0f0f0"
              strokeWidth="1"
            />
          );
        })}

        {/* Y-axis labels */}
        {ticks.map((tick, i) => {
          const y =
            PAD.top + CHART_H - ((tick - minY) / (maxY - minY)) * CHART_H;
          return (
            <SvgText
              key={i}
              x={(PAD.left - 6).toFixed(1)}
              y={(y + 4).toFixed(1)}
              fontSize="9"
              fill="#bbb"
              textAnchor="end"
            >
              ₹{(tick / 1000).toFixed(0)}k
            </SvgText>
          );
        })}

        {/* X-axis labels */}
        {MONTHS.map((m, i) => {
          const x = PAD.left + (i / (MONTHS.length - 1)) * CHART_W;
          return (
            <SvgText
              key={m}
              x={x.toFixed(1)}
              y={(PAD.top + CHART_H + 18).toFixed(1)}
              fontSize="9"
              fill="#bbb"
              textAnchor="middle"
            >
              {m}
            </SvgText>
          );
        })}

        {/* Income fill */}
        <Polygon
          points={toFillPoints(allIncome, minY, maxY)}
          fill="url(#incomeGrad)"
        />

        {/* Expense fill */}
        <Polygon
          points={toFillPoints(allExpense, minY, maxY)}
          fill="url(#expenseGrad)"
        />

        {/* Income line */}
        <Polyline
          points={toPoints(allIncome, minY, maxY)}
          fill="none"
          stroke="#1D9E75"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Expense line */}
        <Polyline
          points={toPoints(allExpense, minY, maxY)}
          fill="none"
          stroke="#E24B4A"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Dots — income */}
        {allIncome.map((v, i) => {
          const x = PAD.left + (i / (allIncome.length - 1)) * CHART_W;
          const y = PAD.top + CHART_H - ((v - minY) / (maxY - minY)) * CHART_H;
          return (
            <Svg key={`id${i}`} x={x - 4} y={y - 4} width={8} height={8}>
              <Polygon points="4,0 4,0" fill="none" />
              <Line
                x1="4"
                y1="4"
                x2="4"
                y2="4"
                stroke="#1D9E75"
                strokeWidth="6"
                strokeLinecap="round"
              />
              <Line
                x1="4"
                y1="4"
                x2="4"
                y2="4"
                stroke="#fff"
                strokeWidth="3"
                strokeLinecap="round"
              />
            </Svg>
          );
        })}

        {/* Dots — expense */}
        {allExpense.map((v, i) => {
          const x = PAD.left + (i / (allExpense.length - 1)) * CHART_W;
          const y = PAD.top + CHART_H - ((v - minY) / (maxY - minY)) * CHART_H;
          return (
            <Svg key={`ed${i}`} x={x - 4} y={y - 4} width={8} height={8}>
              <Line
                x1="4"
                y1="4"
                x2="4"
                y2="4"
                stroke="#E24B4A"
                strokeWidth="6"
                strokeLinecap="round"
              />
              <Line
                x1="4"
                y1="4"
                x2="4"
                y2="4"
                stroke="#fff"
                strokeWidth="3"
                strokeLinecap="round"
              />
            </Svg>
          );
        })}
      </Svg>

      {/* Legend */}
      <View
        style={{
          flexDirection: "row",
          gap: 16,
          justifyContent: "center",
          marginTop: 4,
        }}
      >
        {[
          { label: "Income", color: "#1D9E75" },
          { label: "Expenses", color: "#E24B4A" },
        ].map((l) => (
          <View
            key={l.label}
            style={{ flexDirection: "row", alignItems: "center", gap: 5 }}
          >
            <View
              style={{
                width: 14,
                height: 3,
                backgroundColor: l.color,
                borderRadius: 2,
              }}
            />
            <Text style={{ fontSize: 12, color: "#888" }}>{l.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}
