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
      <View
        className="absolute top-0 right-0 w-64 h-64 bg-primary-100 rounded-full"
        style={{
          opacity: 0.3,
          transform: [{ translateX: 100 }, { translateY: -100 }],
        }}
      />
      <View
        className="absolute bottom-20 left-0 w-48 h-48 bg-secondary-100 rounded-full"
        style={{
          opacity: 0.25,
          transform: [{ translateX: -80 }],
        }}
      />
      <View
        className="absolute top-96 right-10 w-32 h-32 bg-primary-200 rounded-full"
        style={{
          opacity: 0.2,
        }}
      />

      <ScrollView className="flex-1">
        <View className="px-6 pt-8 pb-6">
          <Text className="text-neutral-900 font-extrabold text-4xl leading-tight mb-2">
            Make your pantry{"\n"}management
          </Text>
          <View className="bg-primary-500 rounded-2xl px-4 py-2 self-start">
            <Text className="text-white font-extrabold text-4xl">easy!</Text>
          </View>
        </View>

        <View
          className="mx-6 mb-6 p-6 bg-white rounded-2xl border border-neutral-200"
          style={{
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.08,
            shadowRadius: 8,
            elevation: 3,
          }}
        >
          <View className="flex-row items-center justify-between mb-1">
            <Text className="text-neutral-500 font-semibold text-xs uppercase tracking-wider">
              This Month
            </Text>
            <View className="bg-primary-100 rounded-full px-3 py-1">
              <Text className="text-primary-700 text-xs font-bold">
                October
              </Text>
            </View>
          </View>
          <Text className="text-5xl font-extrabold text-neutral-900 mt-3 mb-1">
            ${monthlySpending.toFixed(2)}
          </Text>
          <Text className="text-neutral-600 text-sm font-medium">
            Grocery spending
          </Text>
        </View>

        <View className="px-4 mb-2">
          <View className="flex-row">
            <ActionCard
              title="My Pantry"
              subtitle="Track your inventory"
              color="bg-white"
              icon="fridge"
              iconBg="bg-primary-500"
              textColor="text-neutral-900"
              route="/pantry"
            />
            <ActionCard
              title="Shopping List"
              subtitle="Create & manage lists"
              color="bg-white"
              textColor="text-neutral-900"
              icon="format-list-checks"
              iconBg="bg-secondary-500"
              route="/list"
            />
          </View>
          <View className="flex-row">
            <ActionCard
              title="Track Budget"
              subtitle="Monitor spending"
              color="bg-primary-500"
              iconBg="bg-primary-600"
              textColor="text-white"
              route="/analytics"
              icon="chart-line"
            />
          </View>
        </View>

        {expiringItems.length > 0 && (
          <View className="mt-8 px-6 pb-4">
            <View className="flex-row items-center justify-between mb-4">
              <View className="flex-row items-center">
                <View className="bg-amber-100 rounded-xl p-2.5 mr-3">
                  <MaterialCommunityIcons
                    name="clock-alert-outline"
                    size={22}
                    color="#F59E0B"
                  />
                </View>
                <View>
                  <Text className="text-xl font-extrabold text-neutral-900">
                    Expiring Soon
                  </Text>
                  <Text className="text-neutral-500 text-xs mt-0.5 font-medium">
                    {expiringItems.length}{" "}
                    {expiringItems.length === 1 ? "item" : "items"} need
                    attention
                  </Text>
                </View>
              </View>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="-mx-6 px-6"
            >
              {expiringItems.map((item, index) => (
                <ExpiryCard key={index} {...item} />
              ))}
            </ScrollView>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
