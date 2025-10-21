import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Href, Link } from 'expo-router';
import { Text, TouchableOpacity, View } from 'react-native';

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
  color = 'bg-green-100',
  iconBg,
  textColor = 'text-green-800',
  route,
  badge,
  icon,
}: ActionCardProps) => (
  <Link href={route} asChild>
    <TouchableOpacity className={`flex-1 p-4 m-2 rounded-3xl ${color}`} style={{ minHeight: 120 }}>
      <View className="flex-1 justify-between">
        {badge && (
          <View className="bg-red-400 self-start px-2 py-1 rounded-full mb-2">
            <Text className="text-white text-xs font-medium">{badge}</Text>
          </View>
        )}
        <View className="flex-1 justify-center">
          {icon && (
            <View className={`${iconBg} p-2 rounded-full w-10 h-10 items-center justify-center`}>
              <MaterialCommunityIcons name={icon} size={20} color="#ffffff" />
            </View>
          )}
          <Text className={`text-lg font-bold ${textColor}`}>{title}</Text>
          {subtitle && <Text className={`${textColor} opacity-80 mt-1`}>{subtitle}</Text>}
        </View>
      </View>
    </TouchableOpacity>
  </Link>
);
