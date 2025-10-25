import { MaterialCommunityIcons } from "@expo/vector-icons";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ActionCard } from "../../components/ActionCard";
import { ExpiryCard, type StatusType } from "../../components/ExpiryCard";

const MOCK_USER = {
  name: "User",
};

const MOCK_EXPIRING_ITEMS: {
  name: string;
  daysLeft: number;
  status: StatusType;
}[] = [
  { name: "Milk", daysLeft: 2, status: "warning" },
  { name: "Eggs", daysLeft: 1, status: "danger" },
  { name: "Bread", daysLeft: 4, status: "success" },
  { name: "Cheese", daysLeft: 3, status: "warning" },
];

export default function HomeScreen() {
  return (
    <SafeAreaView className="flex-1 bg-neutral-50">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 80 }}
      >
        <View className="px-6 pt-10 pb-6">
          <Text className="text-4xl font-bold text-neutral-900">
            Hello {MOCK_USER.name}
          </Text>
          <Text className="text-neutral-500 mt-2 text-base">
            Make your pantry management easy
          </Text>
        </View>

        <View className="px-4">
          <View className="flex-row">
            <ActionCard
              title="My Pantry"
              subtitle="Track your inventory"
              color="bg-primary-50"
              icon="fridge"
              iconBg="bg-primary-500"
              textColor="text-primary-800"
              route="/pantry"
            />
            <ActionCard
              title="Shopping List"
              subtitle="Create & manage lists"
              color="bg-secondary-50"
              textColor="text-secondary-800"
              icon="format-list-checks"
              iconBg="bg-secondary-500"
              route="/list"
            />
          </View>
          <View className="flex-row">
            <ActionCard
              title="Track Budget"
              subtitle="Monitor spending"
              color="bg-primary-600"
              iconBg="bg-primary-700"
              textColor="text-white"
              route="/analytics"
              icon="chart-line"
            />
          </View>
        </View>

        <View className="mt-8 px-6">
          <View className="flex-row items-center mb-4">
            <MaterialCommunityIcons
              name="clock-alert-outline"
              size={24}
              color="#059669"
            />
            <Text className="text-lg font-bold text-neutral-900 ml-2">
              Expiring Soon
            </Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {MOCK_EXPIRING_ITEMS.map((item, index) => (
              <ExpiryCard key={index} {...item} />
            ))}
          </ScrollView>
        </View>

        <View className="mt-8 mx-6 p-6 bg-primary-50 rounded-3xl border border-primary-100">
          <Text className="text-primary-700 font-semibold text-sm">
            This Month
          </Text>
          <Text className="text-4xl font-bold text-primary-900 mt-2">
            $245.50
          </Text>
          <Text className="text-primary-600 mt-1">Grocery spending</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
