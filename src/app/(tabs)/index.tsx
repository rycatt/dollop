import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import React, { useCallback, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ActionCard } from "../../components/ActionCard";
import { ExpiryCard } from "../../components/ExpiryCard";
import {
  calculateMonthlySpending,
  ExpiringItem,
  getExpiringItems,
} from "../../utils/dataSync";

const MOCK_USER = {
  name: "User",
};

export default function HomeScreen() {
  const [monthlySpending, setMonthlySpending] = useState<number>(0);
  const [expiringItems, setExpiringItems] = useState<ExpiringItem[]>([]);

  const loadData = useCallback(async () => {
    const spending = await calculateMonthlySpending();
    const expiring = await getExpiringItems();
    setMonthlySpending(spending);
    setExpiringItems(expiring);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData]),
  );
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

        {expiringItems.length > 0 && (
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
              {expiringItems.map((item, index) => (
                <ExpiryCard key={index} {...item} />
              ))}
            </ScrollView>
          </View>
        )}

        <View className="mt-8 mx-6 p-6 bg-primary-50 rounded-3xl border border-primary-100">
          <Text className="text-primary-700 font-semibold text-sm">
            This Month
          </Text>
          <Text className="text-4xl font-bold text-primary-900 mt-2">
            ${monthlySpending.toFixed(2)}
          </Text>
          <Text className="text-primary-600 mt-1">Grocery spending</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
