import { ScrollView, Text, TouchableOpacity } from "react-native";

interface Props {
  onSelect: (prompt: string) => void;
  disabled?: boolean;
}

const PROMPTS = [
  {
    label: "How am I doing?",
    prompt: "How am I doing with my spending this month?",
  },
  { label: "Cut costs", prompt: "Where can I cut costs based on my spending?" },
  {
    label: "Savings plan",
    prompt: "Create a savings plan based on my income and expenses.",
  },
  { label: "Over budget?", prompt: "Which categories am I over budget in?" },
  {
    label: "Biggest expense",
    prompt: "What is my biggest expense this month?",
  },
  {
    label: "Advice",
    prompt: "Give me your top 3 financial tips based on my data.",
  },
];

export default function QuickChips({ onSelect, disabled }: Props) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{
        paddingHorizontal: 16,
        gap: 8,
        paddingVertical: 10,
      }}
    >
      {PROMPTS.map((p) => (
        <TouchableOpacity
          key={p.label}
          onPress={() => onSelect(p.prompt)}
          disabled={disabled}
          style={{
            paddingHorizontal: 14,
            paddingVertical: 7,
            borderRadius: 20,
            borderWidth: 1,
            borderColor: disabled ? "#eee" : "#d0ede5",
            backgroundColor: disabled ? "#fafafa" : "#f0faf6",
          }}
        >
          <Text
            style={{
              fontSize: 13,
              color: disabled ? "#ccc" : "#1D9E75",
              fontWeight: "500",
            }}
          >
            {p.label}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}
