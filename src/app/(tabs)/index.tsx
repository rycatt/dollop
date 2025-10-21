import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ActionCard } from '../../components/ActionCard';
import { ExpiryCard, type StatusType } from '../../components/ExpiryCard';

const MOCK_USER = {
  name: 'User',
};

const MOCK_EXPIRING_ITEMS: {
  name: string;
  daysLeft: number;
  status: StatusType;
}[] = [
  { name: 'Milk', daysLeft: 2, status: 'warning' },
  { name: 'Eggs', daysLeft: 1, status: 'danger' },
  { name: 'Bread', daysLeft: 4, status: 'success' },
  { name: 'Cheese', daysLeft: 3, status: 'warning' },
];

export default function HomeScreen() {
  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 80 }}>
        <View className="px-6 pt-10 pb-4">
          <Text className="text-4xl font-semibold text-gray-900">Hello {MOCK_USER.name}</Text>
          <Text className="text-gray-600 mt-1">Make your pantry management easy</Text>
        </View>

        <View className="px-4">
          <View className="flex-row">
            <ActionCard
              title="My Pantry"
              subtitle="Track your inventory"
              color="bg-green-100"
              icon="fridge"
              iconBg="bg-green-600"
              route="/pantry"
            />
            <ActionCard
              title="Shopping List"
              subtitle="Create & manage lists"
              color="bg-yellow-100"
              textColor="text-yellow-800"
              icon="format-list-checks"
              iconBg="bg-yellow-600"
              route="/list"
            />
          </View>
          <View className="flex-row">
            <ActionCard
              title="Track Budget"
              subtitle="Monitor spending"
              color="bg-gray-800"
              iconBg="bg-gray-700"
              textColor="text-white"
              route="/analytics"
              icon="chart-line"
            />
          </View>
        </View>

        <View className="mt-6 px-6">
          <View className="flex-row items-center mb-4">
            <MaterialCommunityIcons name="clock-alert-outline" size={24} color="#166534" />
            <Text className="text-lg font-bold text-gray-900 ml-2">Expiring Soon</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {MOCK_EXPIRING_ITEMS.map((item, index) => (
              <ExpiryCard key={index} {...item} />
            ))}
          </ScrollView>
        </View>

        <View className="mt-6 mx-6 p-6 bg-green-50 rounded-3xl">
          <Text className="text-green-800 font-medium">This Month</Text>
          <Text className="text-3xl font-bold text-green-900 mt-2">$245.50</Text>
          <Text className="text-green-700 mt-1">Grocery spending</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
