import { Text, View } from "react-native";

export type StatusType = "success" | "warning" | "danger";

interface ExpiryCardProps {
  name: string;
  daysLeft: number;
  status: StatusType;
}

export const ExpiryCard = ({ name, daysLeft, status }: ExpiryCardProps) => {
  const statusColors = {
    success: "bg-primary-100 text-primary-800 border-primary-200",
    warning: "bg-amber-100 text-amber-800 border-amber-200",
    danger: "bg-red-100 text-red-800 border-red-200",
  };

  const [bg, text, border] = statusColors[status].split(" ");

  return (
    <View className={`px-5 py-4 rounded-2xl mr-3 ${bg} border ${border}`}>
      <Text className={`${text} font-semibold text-base`}>{name}</Text>
      <Text className={`${text} font-bold text-sm mt-1 opacity-80`}>
        {daysLeft} {daysLeft === 1 ? "day" : "days"} left
      </Text>
    </View>
  );
};
