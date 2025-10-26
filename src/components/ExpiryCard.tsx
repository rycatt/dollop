import { Text, View } from "react-native";

export type StatusType = "success" | "warning" | "danger";

interface ExpiryCardProps {
  name: string;
  daysLeft: number;
  status: StatusType;
}

export const ExpiryCard = ({ name, daysLeft, status }: ExpiryCardProps) => {
  const statusConfig = {
    success: {
      bg: "bg-white",
      text: "text-neutral-900",
      border: "border-primary-200",
      badge: "bg-primary-500",
    },
    warning: {
      bg: "bg-white",
      text: "text-neutral-900",
      border: "border-amber-300",
      badge: "bg-amber-500",
    },
    danger: {
      bg: "bg-white",
      text: "text-neutral-900",
      border: "border-red-300",
      badge: "bg-red-500",
    },
  };

  const config = statusConfig[status];

  return (
    <View
      className={`px-5 py-4 rounded-xl mr-3 min-w-[160px] ${config.bg} border-2 ${config.border}`}
      style={{
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 2,
      }}
    >
      <Text
        className={`${config.text} font-extrabold text-base mb-3`}
        numberOfLines={2}
      >
        {name}
      </Text>
      <View className="flex-row items-center justify-between">
        <View className={`${config.badge} px-3 py-1.5 rounded-lg`}>
          <Text className="text-white font-bold text-xs">
            {daysLeft} {daysLeft === 1 ? "day" : "days"}
          </Text>
        </View>
      </View>
    </View>
  );
};
