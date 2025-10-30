import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { format, formatDistanceToNow, isValid, parse } from "date-fns";
import { Plus, Search, Trash2, X } from "lucide-react-native";
import React, { useCallback, useEffect, useState } from "react";
import {
  EmitterSubscription,
  Keyboard,
  Modal,
  Platform,
  Animated as RNAnimated,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  Easing,
  FadeIn,
  FadeOut,
  ZoomIn,
  ZoomOut,
} from "react-native-reanimated";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { AddPantryItemModal } from "../../components/AddPantryItemModal";

interface PantryItem {
  id: string;
  name: string;
  quantity: number;
  emoji: string;
  storageLocation: "Fridge" | "Freezer" | "Pantry";
  expirationDate?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const STORAGE_KEY = "pantry_items";

interface PantryItemCardProps {
  item: PantryItem;
  onPress: (item: PantryItem) => void;
}

function PantryItemCard({ item, onPress }: PantryItemCardProps) {
  const getExpirationStatus = (i: PantryItem) => {
    if (!i.expirationDate || !isValid(i.expirationDate)) return null;
    const now = new Date();
    const daysUntilExpiry = Math.ceil(
      (i.expirationDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
    );
    if (daysUntilExpiry < 0)
      return { type: "expired", days: Math.abs(daysUntilExpiry) as number };
    if (daysUntilExpiry <= 3)
      return { type: "expiring", days: daysUntilExpiry as number };
    return null;
  };

  const expirationStatus = getExpirationStatus(item);
  const daysAgo = formatDistanceToNow(item.updatedAt, { addSuffix: true });

  return (
    <View className="mb-2.5">
      <TouchableOpacity
        onPress={() => onPress(item)}
        className="bg-white p-4 rounded-xl"
        style={{
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.05,
          shadowRadius: 3,
          elevation: 1,
        }}
        accessibilityRole="button"
        accessibilityLabel={`${item.name}, ${item.quantity}`}
      >
        <View className="flex-row items-center">
          <View className="w-11 h-11 bg-neutral-100 rounded-xl items-center justify-center mr-3">
            <Text className="text-xl">{item.emoji}</Text>
          </View>

          <View className="flex-1">
            <View className="flex-row items-center mb-1">
              <Text className="text-base font-bold text-neutral-900 flex-1">
                {item.name}
              </Text>
              {expirationStatus && (
                <View
                  className={`w-2 h-2 rounded-full ml-2 ${
                    expirationStatus.type === "expired"
                      ? "bg-red-500"
                      : "bg-amber-400"
                  }`}
                />
              )}
            </View>
            <View className="flex-row items-center">
              <Text className="text-xs text-neutral-400 font-medium">
                {daysAgo}
              </Text>
              {expirationStatus && (
                <>
                  <Text className="text-neutral-300 mx-1.5">•</Text>
                  <Text
                    className={`text-xs font-semibold ${
                      expirationStatus.type === "expired"
                        ? "text-red-500"
                        : "text-amber-500"
                    }`}
                  >
                    {expirationStatus.type === "expired"
                      ? `Expired ${expirationStatus.days}d ago`
                      : `${expirationStatus.days}d left`}
                  </Text>
                </>
              )}
            </View>
          </View>

          <View className="items-end ml-3">
            <View className="bg-neutral-100 rounded-lg px-2.5 py-1.5">
              <Text className="text-sm font-bold text-neutral-700">
                ×{item.quantity}
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
}

export default function PantryScreen() {
  const insets = useSafeAreaInsets();

  const [items, setItems] = useState<PantryItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isDetailsModalVisible, setIsDetailsModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<PantryItem | null>(null);
  const [isBackdropVisible, setIsBackdropVisible] = useState(false);

  const [fabScale] = useState(new RNAnimated.Value(1));
  const [listOpacity] = useState(new RNAnimated.Value(0));
  const [keyboardLiftY] = useState(new RNAnimated.Value(0));

  useEffect(() => {
    RNAnimated.timing(listOpacity, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [listOpacity]);

  useFocusEffect(
    useCallback(() => {
      loadItems();
    }, []),
  );

  useEffect(() => {
    if (isDetailsModalVisible) {
      setIsBackdropVisible(true);
    }
  }, [isDetailsModalVisible]);

  useEffect(() => {
    const showEvent =
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent =
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

    let subShow: EmitterSubscription | undefined;
    let subHide: EmitterSubscription | undefined;

    subShow = Keyboard.addListener(showEvent, (e) => {
      const h = e.endCoordinates?.height ?? 0;
      RNAnimated.timing(keyboardLiftY, {
        toValue: -h,
        duration: Platform.OS === "ios" ? (e.duration ?? 250) : 250,
        useNativeDriver: true,
      }).start();
    });

    subHide = Keyboard.addListener(hideEvent, (e) => {
      RNAnimated.timing(keyboardLiftY, {
        toValue: 0,
        duration: Platform.OS === "ios" ? (e?.duration ?? 250) : 250,
        useNativeDriver: true,
      }).start();
    });

    return () => {
      subShow?.remove();
      subHide?.remove();
    };
  }, [keyboardLiftY]);

  const loadItems = async () => {
    try {
      const storedItems = await AsyncStorage.getItem(STORAGE_KEY);
      if (storedItems) {
        const parsedItems = JSON.parse(storedItems).map((i: any) => {
          const exp = i.expirationDate ? new Date(i.expirationDate) : undefined;
          return {
            ...i,
            createdAt: new Date(i.createdAt),
            updatedAt: new Date(i.updatedAt),
            expirationDate: exp && isValid(exp) ? exp : undefined,
          } as PantryItem;
        });
        setItems(parsedItems);
      }
    } catch (error) {
      console.error("Error loading items:", error);
    }
  };

  const saveItems = async (newItems: PantryItem[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newItems));
      setItems(newItems);
    } catch (error) {
      console.error("Error saving items:", error);
    }
  };

  const addItem = async (itemData: {
    name: string;
    quantity: number;
    emoji: string;
    storageLocation: "Fridge" | "Freezer" | "Pantry";
    expirationDate?: string;
    notes?: string;
  }) => {
    const parsed = itemData.expirationDate
      ? parse(itemData.expirationDate.trim(), "MM/dd/yyyy", new Date())
      : undefined;

    const newItem: PantryItem = {
      id: Math.random().toString(36).substring(2, 9),
      name: itemData.name,
      quantity: itemData.quantity,
      emoji: itemData.emoji,
      storageLocation: itemData.storageLocation,
      expirationDate: parsed && isValid(parsed) ? parsed : undefined,
      notes: itemData.notes,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const updatedItems = [newItem, ...items];
    await saveItems(updatedItems);
  };

  const closeModal = () => {
    setSelectedItem(null);
    setIsBackdropVisible(false);
    setTimeout(() => {
      setIsDetailsModalVisible(false);
    }, 250);
  };

  const deleteItem = async (itemId: string) => {
    const updatedItems = items.filter((i) => i.id !== itemId);
    await saveItems(updatedItems);
    closeModal();
  };

  const getExpirationStatus = (i: PantryItem) => {
    if (!i.expirationDate || !isValid(i.expirationDate)) return null;
    const now = new Date();
    const daysUntilExpiry = Math.ceil(
      (i.expirationDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
    );
    if (daysUntilExpiry < 0)
      return { type: "expired", days: Math.abs(daysUntilExpiry) as number };
    if (daysUntilExpiry <= 3)
      return { type: "expiring", days: daysUntilExpiry as number };
    return null;
  };

  const filteredItems = items
    .filter((i) => i.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());

  const animateFab = () => {
    RNAnimated.sequence([
      RNAnimated.timing(fabScale, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }),
      RNAnimated.timing(fabScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  return (
    <SafeAreaView className="flex-1 bg-neutral-50" edges={["top", "bottom"]}>
      <View
        className="absolute top-0 right-0 w-64 h-64 bg-primary-100 rounded-full"
        style={{
          opacity: 0.3,
          transform: [{ translateX: 100 }, { translateY: -100 }],
        }}
      />
      <View
        className="absolute bottom-40 left-0 w-48 h-48 bg-secondary-100 rounded-full"
        style={{
          opacity: 0.25,
          transform: [{ translateX: -80 }],
        }}
      />

      <View className="px-6 pt-10 pb-6">
        <Text className="text-neutral-900 font-extrabold text-4xl leading-tight mb-2">
          Pantry
        </Text>
        <View className="bg-secondary-500 rounded-2xl px-4 py-2 self-start">
          <Text className="text-white font-extrabold text-2xl">
            Track your items
          </Text>
        </View>
      </View>

      <View className="px-6 mb-4">
        <View
          className="bg-white rounded-3xl border border-neutral-200 px-4 py-4 flex-row items-center shadow-sm"
          style={{
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.05,
            shadowRadius: 4,
            elevation: 2,
          }}
        >
          <Search size={20} color="#A3A3A3" />
          <TextInput
            className="flex-1 ml-3 text-neutral-900 font-medium"
            placeholder="Search your pantry..."
            placeholderTextColor="#A3A3A3"
            value={searchQuery}
            onChangeText={setSearchQuery}
            accessibilityRole="search"
            accessibilityLabel="Search pantry items"
          />
        </View>
      </View>

      <View className="px-6 mb-3 flex-row items-center">
        <Text className="text-neutral-500 font-medium">
          {filteredItems.length} {filteredItems.length === 1 ? "item" : "items"}
        </Text>

        {(() => {
          const expiringCount = filteredItems.filter((i) => {
            if (!i.expirationDate || !isValid(i.expirationDate)) return false;
            const daysUntil = Math.ceil(
              (i.expirationDate.getTime() - new Date().getTime()) /
                (1000 * 60 * 60 * 24),
            );
            return daysUntil <= 3 && daysUntil >= 0;
          }).length;

          if (expiringCount > 0) {
            return (
              <>
                <Text className="text-neutral-300 mx-1.5">•</Text>
                <Text className="text-amber-600 font-semibold">
                  {expiringCount} expiring
                </Text>
              </>
            );
          }
          return null;
        })()}
      </View>

      <RNAnimated.View style={{ flex: 1, opacity: listOpacity }}>
        <ScrollView
          className="flex-1 px-6"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingBottom: (insets.bottom || 0) + 110,
          }}
          keyboardShouldPersistTaps="handled"
        >
          {filteredItems.length > 0 ? (
            filteredItems.map((item) => (
              <PantryItemCard
                key={item.id}
                item={item}
                onPress={(it) => {
                  setSelectedItem(it);
                  setIsDetailsModalVisible(true);
                }}
              />
            ))
          ) : (
            <View className="bg-white rounded-4xl border border-neutral-200 p-12 items-center mt-10">
              <View className="w-20 h-20 bg-neutral-100 rounded-full items-center justify-center mb-4">
                <Text className="text-3xl">🧺</Text>
              </View>
              <Text className="text-neutral-900 font-bold text-lg">
                Your pantry is empty
              </Text>
              <Text className="text-neutral-500 mt-2 text-center leading-6">
                Add items to start tracking your food storage and expiration
                dates.
              </Text>
            </View>
          )}
        </ScrollView>
      </RNAnimated.View>

      <RNAnimated.View
        style={{
          position: "absolute",
          right: 20,
          bottom: 20,
          transform: [{ scale: fabScale }, { translateY: keyboardLiftY }],
        }}
      >
        <TouchableOpacity
          onPress={() => {
            animateFab();
            setIsAddModalVisible(true);
          }}
          className="w-16 h-16 bg-primary-500 rounded-full items-center justify-center"
          style={{
            shadowColor: "#047857",
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.3,
            shadowRadius: 10,
            elevation: 8,
          }}
          accessibilityRole="button"
          accessibilityLabel="Add pantry item"
        >
          <Plus size={28} color="white" />
        </TouchableOpacity>
      </RNAnimated.View>

      <AddPantryItemModal
        visible={isAddModalVisible}
        onClose={() => setIsAddModalVisible(false)}
        onAddItem={addItem}
      />

      <Modal
        visible={isDetailsModalVisible}
        transparent
        animationType="none"
        onRequestClose={closeModal}
      >
        <View className="flex-1 justify-center items-center p-6">
          {isBackdropVisible && (
            <Animated.View
              key="backdrop"
              entering={FadeIn.duration(250).easing(
                Easing.bezier(0.4, 0, 0.2, 1),
              )}
              exiting={FadeOut.duration(200).easing(
                Easing.bezier(0.4, 0, 0.2, 1),
              )}
              className="absolute inset-0 bg-black/60"
            >
              <TouchableOpacity
                activeOpacity={1}
                onPress={closeModal}
                className="flex-1"
              />
            </Animated.View>
          )}

          {selectedItem && (
            <Animated.View
              key={selectedItem.id}
              entering={ZoomIn.duration(300).easing(
                Easing.bezier(0.4, 0, 0.2, 1),
              )}
              exiting={ZoomOut.duration(220).easing(
                Easing.bezier(0.4, 0, 0.2, 1),
              )}
              className="bg-white rounded-4xl w-full max-w-md border border-neutral-100"
              style={{
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.15,
                shadowRadius: 20,
                elevation: 10,
              }}
            >
              <View className="px-6 pt-6 pb-4 border-b border-neutral-100">
                <View className="flex-row items-center justify-between mb-4">
                  <View className="flex-row items-center flex-1">
                    <View className="w-14 h-14 bg-neutral-100 rounded-2xl items-center justify-center mr-4">
                      <Text className="text-3xl">{selectedItem.emoji}</Text>
                    </View>
                    <View className="flex-1">
                      <Text className="text-xl font-bold text-neutral-900 mb-1">
                        {selectedItem.name}
                      </Text>
                      <Text className="text-sm text-neutral-500 font-medium">
                        {formatDistanceToNow(selectedItem.updatedAt, {
                          addSuffix: true,
                        })}
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    onPress={closeModal}
                    className="w-9 h-9 bg-neutral-100 rounded-full items-center justify-center ml-2"
                  >
                    <X size={18} color="#525252" />
                  </TouchableOpacity>
                </View>
              </View>

              <ScrollView
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
                style={{ maxHeight: 400 }}
                className="px-6 py-5"
              >
                <View className="flex-row mb-4">
                  <View className="flex-1 mr-2">
                    <Text className="text-xs uppercase tracking-widest text-neutral-400 font-medium mb-2">
                      QUANTITY
                    </Text>
                    <View className="bg-neutral-50 rounded-xl p-3">
                      <Text className="text-2xl font-bold text-neutral-900">
                        {selectedItem.quantity}
                      </Text>
                    </View>
                  </View>

                  <View className="flex-1 ml-2">
                    <Text className="text-xs uppercase tracking-widest text-neutral-400 font-medium mb-2">
                      LOCATION
                    </Text>
                    <View className="bg-neutral-50 rounded-xl p-3">
                      <Text className="text-base font-bold text-neutral-900">
                        {selectedItem.storageLocation}
                      </Text>
                    </View>
                  </View>
                </View>

                {selectedItem.expirationDate &&
                isValid(selectedItem.expirationDate) ? (
                  <View className="mb-4">
                    <Text className="text-xs uppercase tracking-widest text-neutral-400 font-medium mb-2">
                      EXPIRATION
                    </Text>
                    <View className="bg-neutral-50 rounded-xl p-3 flex-row items-center justify-between">
                      <Text className="text-base font-bold text-neutral-900">
                        {format(selectedItem.expirationDate, "MMM dd, yyyy")}
                      </Text>
                      {(() => {
                        const st = getExpirationStatus(selectedItem);
                        if (!st) return null;
                        return (
                          <View className="flex-row items-center">
                            <View
                              className={`w-1.5 h-1.5 rounded-full mr-2 ${
                                st.type === "expired"
                                  ? "bg-red-500"
                                  : "bg-amber-400"
                              }`}
                            />
                            <Text
                              className={`text-xs font-semibold ${
                                st.type === "expired"
                                  ? "text-red-500"
                                  : "text-amber-500"
                              }`}
                            >
                              {st.type === "expired"
                                ? `${st.days}d ago`
                                : `${st.days}d left`}
                            </Text>
                          </View>
                        );
                      })()}
                    </View>
                  </View>
                ) : null}

                {selectedItem.notes ? (
                  <View className="mb-4">
                    <Text className="text-xs uppercase tracking-widest text-neutral-400 font-medium mb-2">
                      NOTES
                    </Text>
                    <View className="bg-neutral-50 rounded-xl p-3">
                      <Text className="text-sm text-neutral-700 leading-relaxed">
                        {selectedItem.notes}
                      </Text>
                    </View>
                  </View>
                ) : null}
              </ScrollView>

              <View className="px-6 py-4 border-t border-neutral-100 flex-row gap-3">
                <TouchableOpacity
                  onPress={closeModal}
                  className="flex-1 py-3.5 rounded-xl bg-neutral-100"
                >
                  <Text className="text-neutral-700 font-bold text-base text-center">
                    Close
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => deleteItem(selectedItem.id)}
                  className="flex-1 py-3.5 rounded-xl bg-red-50 flex-row items-center justify-center"
                >
                  <Trash2 size={18} color="#EF4444" />
                  <Text className="text-red-500 font-bold text-base ml-2">
                    Delete
                  </Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          )}
        </View>
      </Modal>
    </SafeAreaView>
  );
}
