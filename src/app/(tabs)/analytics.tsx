import { MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AnalyticsScreen() {
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
              $245.50
            </Text>
            <Text className="text-primary-600 mt-1">Total spending</Text>
          </View>

          <View className="bg-white rounded-3xl p-6 border border-neutral-100">
            <Text className="text-lg font-bold text-neutral-900 mb-4">
              Category Breakdown
            </Text>

            <View className="mb-4">
              <View className="flex-row justify-between items-center mb-2">
                <Text className="text-neutral-700 font-medium">Produce</Text>
                <Text className="text-neutral-900 font-bold">$89.20</Text>
              </View>
              <View className="h-2 bg-neutral-100 rounded-full overflow-hidden">
                <View
                  className="h-full bg-primary-500 rounded-full"
                  style={{ width: "45%" }}
                />
              </View>
            </View>

            <View className="mb-4">
              <View className="flex-row justify-between items-center mb-2">
                <Text className="text-neutral-700 font-medium">Dairy</Text>
                <Text className="text-neutral-900 font-bold">$62.30</Text>
              </View>
              <View className="h-2 bg-neutral-100 rounded-full overflow-hidden">
                <View
                  className="h-full bg-secondary-500 rounded-full"
                  style={{ width: "30%" }}
                />
              </View>
            </View>

            <View className="mb-4">
              <View className="flex-row justify-between items-center mb-2">
                <Text className="text-neutral-700 font-medium">
                  Meat & Seafood
                </Text>
                <Text className="text-neutral-900 font-bold">$54.80</Text>
              </View>
              <View className="h-2 bg-neutral-100 rounded-full overflow-hidden">
                <View
                  className="h-full bg-accent-500 rounded-full"
                  style={{ width: "25%" }}
                />
              </View>
            </View>

            <View>
              <View className="flex-row justify-between items-center mb-2">
                <Text className="text-neutral-700 font-medium">Other</Text>
                <Text className="text-neutral-900 font-bold">$39.20</Text>
              </View>
              <View className="h-2 bg-neutral-100 rounded-full overflow-hidden">
                <View
                  className="h-full bg-neutral-400 rounded-full"
                  style={{ width: "18%" }}
                />
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
