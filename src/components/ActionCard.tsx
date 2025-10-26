import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Href, Link } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";

interface ActionCardProps {
  title: string;
  subtitle?: string;
  color?: string;
  iconBg?: string;
  textColor?: string;
  route: Href<any>;
  badge?: string;
  icon?: any;
}

export const ActionCard = ({
  title,
  subtitle,
  color = "bg-primary-50",
  iconBg,
  textColor = "text-primary-800",
  route,
  badge,
  icon,
}: ActionCardProps) => {
  const isDarkCard =
    color.includes("primary-500") || color.includes("primary-600");

  return (
    <Link href={route} asChild>
      <TouchableOpacity
        className={`flex-1 p-5 m-2 rounded-2xl ${color} ${isDarkCard ? "" : "border border-neutral-200"}`}
        style={{
          minHeight: 140,
          shadowColor: isDarkCard ? "#047857" : "#000",
          shadowOffset: { width: 0, height: 3 },
          shadowOpacity: isDarkCard ? 0.25 : 0.08,
          shadowRadius: isDarkCard ? 8 : 6,
          elevation: isDarkCard ? 5 : 3,
        }}
      >
        <View className="flex-1 justify-between">
          {badge && (
            <View className="bg-accent-500 self-start px-3 py-1 rounded-full mb-2">
              <Text className="text-white text-xs font-semibold">{badge}</Text>
            </View>
          )}
          <View className="flex-1 justify-center">
            {icon && (
              <View
                className={`${iconBg} p-3 rounded-xl w-13 h-13 items-center justify-center mb-3`}
                style={{
                  shadowColor: isDarkCard ? "#ffffff40" : "#00000020",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.2,
                  shadowRadius: 4,
                  elevation: 2,
                }}
              >
                <MaterialCommunityIcons name={icon} size={26} color="#ffffff" />
              </View>
            )}
            <Text className={`text-lg font-extrabold ${textColor} mb-1`}>
              {title}
            </Text>
            {subtitle && (
              <Text
                className={`${textColor} text-sm leading-snug font-medium ${isDarkCard ? "opacity-90" : "opacity-60"}`}
              >
                {subtitle}
              </Text>
            )}
          </View>
        </View>
      </TouchableOpacity>
    </Link>
  );
};
