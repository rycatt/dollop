import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import React, { useCallback, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  calculateCategoryBreakdown,
  calculateMonthlySpending,
} from "../../utils/dataSync";

export default function AnalyticsScreen() {
  const [monthlySpending, setMonthlySpending] = useState<number>(0);
  const [categoryBreakdown, setCategoryBreakdown] = useState<
    { category: string; amount: number; percentage: number }[]
  >([]);

  const loadData = useCallback(async () => {
    const spending = await calculateMonthlySpending();
    const breakdown = await calculateCategoryBreakdown();
    setMonthlySpending(spending);
    setCategoryBreakdown(breakdown);
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
          <Text className="text-4xl font-bold text-neutral-900">Analytics</Text>
          <Text className="text-neutral-500 mt-2 text-base">
            Track your spending
          </Text>
        </View>

        <View className="px-6">
          <View className="bg-primary-50 rounded-3xl p-6 border border-primary-100 mb-4">
            <View className="flex-row items-center mb-2">
              <MaterialCommunityIcons
                name="calendar-month"
                size={20}
                color="#059669"
              />
              <Text className="text-primary-700 font-semibold text-sm ml-2">
                This Month
              </Text>
            </View>
            <Text className="text-4xl font-bold text-primary-900 mt-2">
              ${monthlySpending.toFixed(2)}
            </Text>
            <Text className="text-primary-600 mt-1">Total spending</Text>
          </View>

          {categoryBreakdown.length > 0 ? (
            <View className="bg-white rounded-3xl p-6 border border-neutral-100">
              <Text className="text-lg font-bold text-neutral-900 mb-4">
                Category Breakdown
              </Text>

              {categoryBreakdown.map((cat, index) => {
                const colors = [
                  "bg-primary-500",
                  "bg-secondary-500",
                  "bg-accent-500",
                  "bg-neutral-400",
                  "bg-primary-400",
                  "bg-secondary-400",
                ];
                const colorClass = colors[index % colors.length];

                return (
                  <View
                    key={cat.category}
                    className={
                      index < categoryBreakdown.length - 1 ? "mb-4" : ""
                    }
                  >
                    <View className="flex-row justify-between items-center mb-2">
                      <Text className="text-neutral-700 font-medium">
                        {cat.category}
                      </Text>
                      <Text className="text-neutral-900 font-bold">
                        ${cat.amount.toFixed(2)}
                      </Text>
                    </View>
                    <View className="h-2 bg-neutral-100 rounded-full overflow-hidden">
                      <View
                        className={`h-full ${colorClass} rounded-full`}
                        style={{ width: `${Math.round(cat.percentage)}%` }}
                      />
                    </View>
                  </View>
                );
              })}
            </View>
          ) : (
            <View className="bg-white rounded-3xl p-6 border border-neutral-100">
              <Text className="text-lg font-bold text-neutral-900 mb-2">
                Category Breakdown
              </Text>
              <Text className="text-neutral-500 text-center py-8">
                No spending data available yet.{"\n"}
                Add items to your shopping lists to see breakdown.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
