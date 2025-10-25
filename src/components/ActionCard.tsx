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
}: ActionCardProps) => (
  <Link href={route} asChild>
    <TouchableOpacity
      className={`flex-1 p-5 m-2 rounded-3xl ${color}`}
      style={{ minHeight: 130 }}
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
              className={`${iconBg} p-2.5 rounded-2xl w-11 h-11 items-center justify-center mb-3`}
            >
              <MaterialCommunityIcons name={icon} size={22} color="#ffffff" />
            </View>
          )}
          <Text className={`text-lg font-bold ${textColor}`}>{title}</Text>
          {subtitle && (
            <Text className={`${textColor} opacity-70 mt-1 text-sm`}>
              {subtitle}
            </Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  </Link>
);
