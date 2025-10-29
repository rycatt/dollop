import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { endOfMonth, startOfMonth, subDays, subMonths } from "date-fns";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  getCategoryColorClass,
  sanitizeCategory,
  type ShoppingList,
} from "../../constants/shopping";
import { getStoredShoppingLists } from "../../utils/dataSync";

const PERIOD_OPTIONS = [
  { label: "This Month", value: "this_month" as const },
  { label: "Last Month", value: "last_month" as const },
  { label: "Last 90 Days", value: "last_90_days" as const },
  { label: "All Time", value: "all_time" as const },
];

type PeriodValue = (typeof PERIOD_OPTIONS)[number]["value"];

const LIST_ALL = "all";

export default function AnalyticsScreen() {
  const [shoppingLists, setShoppingLists] = useState<ShoppingList[]>([]);
  const [periodValue, setPeriodValue] = useState<PeriodValue>("this_month");
  const [selectedListId, setSelectedListId] = useState<string>(LIST_ALL);
  const [isPeriodMenuOpen, setIsPeriodMenuOpen] = useState(false);
  const [isListMenuOpen, setIsListMenuOpen] = useState(false);

  const loadData = useCallback(async () => {
    const lists = await getStoredShoppingLists();
    setShoppingLists(lists);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData]),
  );

  useEffect(() => {
    if (selectedListId !== LIST_ALL) {
      const exists = shoppingLists.some((list) => list.id === selectedListId);
      if (!exists) {
        setSelectedListId(LIST_ALL);
      }
    }
  }, [shoppingLists, selectedListId]);

  const closeMenus = useCallback(() => {
    setIsPeriodMenuOpen(false);
    setIsListMenuOpen(false);
  }, []);

  const selectedPeriodLabel =
    PERIOD_OPTIONS.find((option) => option.value === periodValue)?.label ??
    "This Month";

  const selectedListLabel = useMemo(() => {
    if (selectedListId === LIST_ALL) {
      return "All Lists";
    }
    const match = shoppingLists.find((list) => list.id === selectedListId);
    return match ? match.name : "All Lists";
  }, [selectedListId, shoppingLists]);

  const listOptions = useMemo(
    () => [
      { label: "All Lists", value: LIST_ALL },
      ...shoppingLists
        .slice()
        .sort((a, b) => {
          const aDate =
            a.createdAt instanceof Date ? a.createdAt : new Date(a.createdAt);
          const bDate =
            b.createdAt instanceof Date ? b.createdAt : new Date(b.createdAt);
          const aTimeRaw = aDate.getTime();
          const bTimeRaw = bDate.getTime();
          const aTime = Number.isNaN(aTimeRaw) ? 0 : aTimeRaw;
          const bTime = Number.isNaN(bTimeRaw) ? 0 : bTimeRaw;
          return bTime - aTime;
        })
        .map((list) => ({ label: list.name, value: list.id })),
    ],
    [shoppingLists],
  );

  const filteredLists = useMemo(() => {
    if (shoppingLists.length === 0) return [];

    const now = new Date();
    let start: Date | null = null;
    let end: Date | null = null;

    switch (periodValue) {
      case "this_month":
        start = startOfMonth(now);
        end = endOfMonth(now);
        break;
      case "last_month": {
        const lastMonth = subMonths(now, 1);
        start = startOfMonth(lastMonth);
        end = endOfMonth(lastMonth);
        break;
      }
      case "last_90_days":
        start = subDays(now, 90);
        end = now;
        break;
      case "all_time":
      default:
        break;
    }

    return shoppingLists.filter((list) => {
      const createdAt =
        list.createdAt instanceof Date
          ? list.createdAt
          : new Date(list.createdAt);
      const createdAtTime = createdAt.getTime();
      const isValidDate = !Number.isNaN(createdAtTime);

      const withinPeriod = isValidDate
        ? (!start || createdAt >= start) && (!end || createdAt <= end)
        : periodValue === "all_time";
      const matchesList =
        selectedListId === LIST_ALL ? true : list.id === selectedListId;

      return withinPeriod && matchesList;
    });
  }, [shoppingLists, periodValue, selectedListId]);

  const { totalSpend, categoryBreakdown, topCategories } = useMemo(() => {
    if (filteredLists.length === 0) {
      return {
        totalSpend: 0,
        categoryBreakdown: [] as {
          category: string;
          amount: number;
          percentage: number;
        }[],
        topCategories: [] as {
          category: string;
          amount: number;
          percentage: number;
        }[],
      };
    }

    const categoryTotals: Record<string, number> = {};
    let aggregateTotal = 0;

    filteredLists.forEach((list) => {
      list.items.forEach((item) => {
        const price = Number(item.price) || 0;
        const category = sanitizeCategory(item.category);
        aggregateTotal += price;
        categoryTotals[category] = (categoryTotals[category] || 0) + price;
      });
    });

    const breakdown = Object.entries(categoryTotals)
      .map(([category, amount]) => ({
        category,
        amount,
        percentage: aggregateTotal > 0 ? (amount / aggregateTotal) * 100 : 0,
      }))
      .sort((a, b) => b.amount - a.amount);

    return {
      totalSpend: aggregateTotal,
      categoryBreakdown: breakdown,
      topCategories: breakdown.slice(0, 3),
    };
  }, [filteredLists]);

  const hasData = totalSpend > 0 && categoryBreakdown.length > 0;
  const totalCategories = categoryBreakdown.length;
  const averagePerCategory =
    totalCategories > 0 ? totalSpend / totalCategories : 0;
  const topCategory = topCategories[0];
  const secondCategory = topCategories[1];

  const insightCopy = useMemo(() => {
    if (!topCategory) {
      return `No tracked spending for this range${
        selectedListId === LIST_ALL ? "" : ` in ${selectedListLabel}`
      }. Add prices to surface tailored tips.`;
    }
    if (!secondCategory) {
      return `Most of your spend sits in ${topCategory.category}. Keep tracking to balance things out.`;
    }
    return `${topCategory.category} leads with ${Math.round(topCategory.percentage)}% of your total, followed by ${secondCategory.category} at ${Math.round(secondCategory.percentage)}%.`;
  }, [selectedListId, selectedListLabel, topCategory, secondCategory]);

  const spotlightDots = useMemo(() => {
    return topCategories.flatMap((cat) => {
      const dotCount = Math.min(
        12,
        Math.max(4, Math.round(cat.percentage / 6)),
      );
      return Array.from({ length: dotCount }).map((_, dotIndex) => ({
        colorClass: getCategoryColorClass(cat.category),
        opacity: 1 - dotIndex * 0.08,
      }));
    });
  }, [topCategories]);

  const filteredItemCount = useMemo(
    () => filteredLists.reduce((total, list) => total + list.items.length, 0),
    [filteredLists],
  );
  const activeListCount = filteredLists.length;

  return (
    <SafeAreaView className="flex-1 bg-neutral-50">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 80 }}
        onScrollBeginDrag={closeMenus}
      >
        <View className="px-6 pt-10 pb-6">
          <Text className="text-neutral-900 font-extrabold text-4xl leading-tight mb-2">
            Analytics
          </Text>
          <View className="bg-secondary-500 rounded-2xl px-4 py-2 self-start">
            <Text className="text-white font-extrabold text-2xl">
              Track your budget
            </Text>
          </View>
        </View>

        <View className="px-6">
          <View className="flex-row gap-3 mb-6">
            <View
              className="flex-1"
              style={{ zIndex: isPeriodMenuOpen ? 30 : undefined }}
            >
              <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => {
                  setIsPeriodMenuOpen((prev) => !prev);
                  setIsListMenuOpen(false);
                }}
                className="bg-white rounded-3xl border border-neutral-200 px-4 py-4 flex-row items-center justify-between"
              >
                <View>
                  <Text className="text-xs uppercase tracking-widest text-neutral-400">
                    Period
                  </Text>
                  <Text
                    className="text-neutral-900 font-semibold mt-1"
                    numberOfLines={1}
                  >
                    {selectedPeriodLabel}
                  </Text>
                </View>
                <MaterialCommunityIcons
                  name={isPeriodMenuOpen ? "chevron-up" : "chevron-down"}
                  size={18}
                  color="#737373"
                />
              </TouchableOpacity>

              {isPeriodMenuOpen && (
                <View
                  className="absolute left-0 right-0 bg-white border border-neutral-200 rounded-3xl mt-2 overflow-hidden"
                  style={{
                    shadowColor: "#000000",
                    shadowOffset: { width: 0, height: 8 },
                    shadowOpacity: 0.08,
                    shadowRadius: 12,
                    elevation: 6,
                    top: 72,
                  }}
                >
                  {PERIOD_OPTIONS.map((option) => {
                    const isActive = periodValue === option.value;
                    return (
                      <TouchableOpacity
                        key={option.value}
                        activeOpacity={0.9}
                        onPress={() => {
                          setPeriodValue(option.value);
                          setIsPeriodMenuOpen(false);
                        }}
                        className={`px-4 py-3 ${
                          isActive ? "bg-primary-50" : "bg-white"
                        }`}
                      >
                        <Text
                          className={`text-sm font-semibold ${
                            isActive ? "text-primary-700" : "text-neutral-700"
                          }`}
                        >
                          {option.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}
            </View>

            <View
              className="flex-1"
              style={{ zIndex: isListMenuOpen ? 20 : undefined }}
            >
              <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => {
                  setIsListMenuOpen((prev) => !prev);
                  setIsPeriodMenuOpen(false);
                }}
                className="bg-white rounded-3xl border border-neutral-200 px-4 py-4 flex-row items-center justify-between"
              >
                <View>
                  <Text className="text-xs uppercase tracking-widest text-neutral-400">
                    Lists
                  </Text>
                  <Text
                    className="text-neutral-900 font-semibold mt-1"
                    numberOfLines={1}
                  >
                    {selectedListLabel}
                  </Text>
                </View>
                <MaterialCommunityIcons
                  name={isListMenuOpen ? "chevron-up" : "chevron-down"}
                  size={18}
                  color="#737373"
                />
              </TouchableOpacity>

              {isListMenuOpen && (
                <View
                  className="absolute left-0 right-0 bg-white border border-neutral-200 rounded-3xl mt-2 overflow-hidden"
                  style={{
                    shadowColor: "#000000",
                    shadowOffset: { width: 0, height: 8 },
                    shadowOpacity: 0.08,
                    shadowRadius: 12,
                    elevation: 6,
                    top: 72,
                  }}
                >
                  {listOptions.map((option) => {
                    const isActive = selectedListId === option.value;
                    return (
                      <TouchableOpacity
                        key={option.value}
                        activeOpacity={0.9}
                        onPress={() => {
                          setSelectedListId(option.value);
                          setIsListMenuOpen(false);
                        }}
                        className={`px-4 py-3 ${
                          isActive ? "bg-secondary-50" : "bg-white"
                        }`}
                      >
                        <Text
                          className={`text-sm font-semibold ${
                            isActive ? "text-secondary-700" : "text-neutral-700"
                          }`}
                        >
                          {option.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                  {shoppingLists.length === 0 && (
                    <View className="px-4 py-3 bg-white">
                      <Text className="text-neutral-500 text-sm">
                        No saved lists yet.
                      </Text>
                    </View>
                  )}
                </View>
              )}
            </View>
          </View>

          <View
            className="bg-white rounded-4xl border border-neutral-200 p-6 mb-6"
            style={{
              shadowColor: "#0F766E",
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.07,
              shadowRadius: 18,
              elevation: 4,
            }}
          >
            <View className="flex-row items-center">
              <View className="w-12 h-12 rounded-3xl bg-primary-100 items-center justify-center">
                <MaterialCommunityIcons
                  name="wallet"
                  size={24}
                  color="#047857"
                />
              </View>
              <View className="ml-3">
                <Text className="text-xs uppercase tracking-widest text-neutral-400">
                  Spend snapshot
                </Text>
                <Text className="text-3xl font-extrabold text-neutral-900 mt-1">
                  ${totalSpend.toFixed(2)}
                </Text>
              </View>
            </View>

            <View className="flex-row flex-wrap gap-2 mt-5">
              <View className="bg-neutral-100 rounded-full px-3 py-1.5">
                <Text
                  className="text-neutral-600 text-xs font-semibold"
                  numberOfLines={1}
                >
                  {selectedPeriodLabel}
                </Text>
              </View>
              <View className="bg-neutral-100 rounded-full px-3 py-1.5">
                <Text
                  className="text-neutral-600 text-xs font-semibold"
                  numberOfLines={1}
                >
                  {selectedListLabel}
                </Text>
              </View>
              {activeListCount > 0 && (
                <View className="bg-neutral-100 rounded-full px-3 py-1.5">
                  <Text className="text-neutral-600 text-xs font-semibold">
                    {activeListCount} {activeListCount === 1 ? "list" : "lists"}
                  </Text>
                </View>
              )}
              {filteredItemCount > 0 && (
                <View className="bg-neutral-100 rounded-full px-3 py-1.5">
                  <Text className="text-neutral-600 text-xs font-semibold">
                    {filteredItemCount} items
                  </Text>
                </View>
              )}
            </View>

            <Text className="text-neutral-500 mt-5 leading-6">
              {insightCopy}
            </Text>

            <View className="mt-6">
              <View className="flex-row items-center justify-between mb-3">
                <Text className="text-neutral-500 text-xs uppercase tracking-widest font-semibold">
                  Category share
                </Text>
                <Text className="text-neutral-400 text-xs">
                  proportional to spend
                </Text>
              </View>
              <View className="h-10 bg-neutral-100 rounded-full overflow-hidden flex-row">
                {categoryBreakdown.slice(0, 4).map((cat) => (
                  <View
                    key={`${cat.category}-segment`}
                    className={`h-full ${getCategoryColorClass(cat.category)}`}
                    style={{ flex: cat.amount || 1 }}
                  />
                ))}
              </View>
              {hasData && (
                <View className="flex-row flex-wrap gap-2 mt-4">
                  {categoryBreakdown.slice(0, 4).map((cat) => {
                    const badgeColor = getCategoryColorClass(cat.category);
                    return (
                      <View
                        key={`${cat.category}-legend`}
                        className="flex-row items-center bg-neutral-100 rounded-full px-3 py-1.5"
                      >
                        <View
                          className={`w-2.5 h-2.5 rounded-full ${badgeColor} mr-2`}
                        />
                        <Text className="text-neutral-700 text-xs font-semibold">
                          {cat.category}
                        </Text>
                        <Text className="text-neutral-400 text-xs font-semibold ml-2">
                          {Math.round(cat.percentage)}%
                        </Text>
                      </View>
                    );
                  })}
                </View>
              )}
            </View>
          </View>

          {hasData ? (
            <>
              <View className="bg-secondary-50 border border-secondary-100 rounded-4xl p-6 mb-6">
                <View className="flex-row items-start justify-between">
                  <View className="flex-1 mr-4">
                    <Text className="text-xs uppercase tracking-widest text-secondary-600 font-semibold">
                      Spotlight
                    </Text>
                    <Text className="text-2xl font-extrabold text-secondary-900 mt-2">
                      Where your cart fills up
                    </Text>
                    <Text className="text-secondary-700 mt-3 leading-6">
                      Focus on these categories if you need a quick win. Try
                      swapping premium items or planning portions ahead of time.
                    </Text>
                    <View className="flex-row flex-wrap gap-2 mt-4">
                      {topCategories.map((cat) => {
                        const chipColor = getCategoryColorClass(cat.category);
                        return (
                          <View
                            key={`${cat.category}-chip`}
                            className="flex-row items-center bg-white/80 border border-secondary-100 rounded-full px-4 py-2"
                          >
                            <View
                              className={`w-2 h-2 rounded-full ${chipColor} mr-2`}
                            />
                            <Text className="text-secondary-800 font-semibold text-sm">
                              {cat.category}
                            </Text>
                            <Text className="text-secondary-600 text-xs font-semibold ml-2">
                              {Math.round(cat.percentage)}%
                            </Text>
                          </View>
                        );
                      })}
                    </View>
                  </View>

                  <View className="w-32 h-32 bg-white/70 border border-secondary-100 rounded-4xl items-center justify-center px-3">
                    <View className="flex-row flex-wrap justify-center gap-1.5">
                      {spotlightDots.map((dot, index) => (
                        <View
                          key={`dot-${index}`}
                          className={`w-3 h-3 rounded-full ${dot.colorClass}`}
                          style={{ opacity: dot.opacity }}
                        />
                      ))}
                    </View>
                    <Text className="text-secondary-500 text-xs font-semibold mt-4 text-center">
                      Top categories pulse
                    </Text>
                  </View>
                </View>
              </View>

              <View className="bg-white rounded-4xl border border-neutral-200 p-6 mb-10">
                <Text className="text-lg font-bold text-neutral-900">
                  Detailed breakdown
                </Text>
                <Text className="text-neutral-400 text-sm mt-1">
                  Track how each category contributes to your filtered spend.
                </Text>

                <View className="mt-6">
                  {categoryBreakdown.map((cat, index) => {
                    const colorClass = getCategoryColorClass(cat.category);
                    const width = Math.min(
                      100,
                      Math.max(6, Math.round(cat.percentage)),
                    );

                    return (
                      <View
                        key={cat.category}
                        className={`flex-row items-center ${index < categoryBreakdown.length - 1 ? "mb-5" : ""}`}
                      >
                        <View
                          className={`w-11 h-11 rounded-2xl ${colorClass} items-center justify-center`}
                        >
                          <Text className="text-white font-semibold text-xs uppercase">
                            {cat.category.slice(0, 2)}
                          </Text>
                        </View>

                        <View className="flex-1 ml-4">
                          <View className="flex-row items-center justify-between">
                            <Text className="text-neutral-900 font-semibold">
                              {cat.category}
                            </Text>
                            <Text className="text-neutral-900 font-bold">
                              ${cat.amount.toFixed(2)}
                            </Text>
                          </View>

                          <View className="h-2 bg-neutral-100 rounded-full overflow-hidden mt-3">
                            <View
                              className={`h-full ${colorClass} rounded-full`}
                              style={{ width: `${width}%` }}
                            />
                          </View>
                        </View>
                      </View>
                    );
                  })}
                </View>
              </View>
            </>
          ) : (
            <View className="bg-white rounded-4xl border border-neutral-200 p-12 items-center mb-10">
              <View className="w-20 h-20 bg-neutral-100 rounded-full items-center justify-center mb-4">
                <MaterialCommunityIcons
                  name="cart-outline"
                  size={32}
                  color="#A3A3A3"
                />
              </View>
              <Text className="text-neutral-900 font-bold text-lg">
                No spending yet
              </Text>
              <Text className="text-neutral-500 mt-2 text-center leading-6">
                No purchases matched this selection. Add items with prices to
                your lists to unlock tailored insights and track how your pantry
                spending evolves over time.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
