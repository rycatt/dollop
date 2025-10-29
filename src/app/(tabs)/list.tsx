import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { format } from "date-fns";
import {
  ArrowLeft,
  Plus,
  Search,
  ShoppingBag,
  Trash2,
} from "lucide-react-native";
import React, { useCallback, useEffect, useState } from "react";
import {
  Alert,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AddProductModal } from "../../components/AddProductModal";
import { CreateListModal } from "../../components/CreateListModal";
import { ShoppingListItemComponent } from "../../components/ShoppingListItemComponent";
import {
  AVAILABLE_STORES,
  mockShoppingLists,
  ShoppingList,
  STORAGE_KEY,
  StoreInfo,
  sanitizeCategory,
  type CategoryName,
  type UnitOfMeasure,
} from "../../constants/shopping";
import { getStoredShoppingLists } from "../../utils/dataSync";

export default function ShoppingListScreen() {
  const [shoppingLists, setShoppingLists] = useState<ShoppingList[]>([]);
  const [selectedList, setSelectedList] = useState<ShoppingList | null>(null);
  const [selectedStore, setSelectedStore] = useState<StoreInfo | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [showCreateListModal, setShowCreateListModal] = useState(false);
  const [loading, setLoading] = useState(true);

  const saveShoppingLists = useCallback(async (lists: ShoppingList[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(lists));
    } catch (error) {
      console.error("Error saving shopping lists:", error);
    }
  }, []);

  const loadShoppingLists = useCallback(async () => {
    const normalizeLists = (lists: ShoppingList[]): ShoppingList[] =>
      lists.map((list) => {
        const resolvedStore =
          list.store ??
          (list.storeId
            ? AVAILABLE_STORES.find((store) => store.id === list.storeId)
            : undefined);

        const normalizedItems = (list.items ?? []).map((item) => ({
          ...item,
          category: sanitizeCategory(item.category),
          store: resolvedStore,
        }));

        const createdAt =
          list.createdAt instanceof Date
            ? list.createdAt
            : new Date(list.createdAt);

        return {
          ...list,
          createdAt,
          store: resolvedStore,
          items: normalizedItems,
        };
      });

    try {
      const storedLists = await getStoredShoppingLists();
      if (storedLists.length > 0) {
        const hydratedLists = normalizeLists(storedLists);
        setShoppingLists(hydratedLists);
      } else {
        const fallbackLists = normalizeLists(mockShoppingLists);
        setShoppingLists(fallbackLists);
        await saveShoppingLists(fallbackLists);
      }
    } catch (error) {
      console.error("Error loading shopping lists:", error);
      const fallbackLists = normalizeLists(mockShoppingLists);
      setShoppingLists(fallbackLists);
    } finally {
      setLoading(false);
    }
  }, [saveShoppingLists]);

  useEffect(() => {
    loadShoppingLists();
  }, [loadShoppingLists]);

  useFocusEffect(
    useCallback(() => {
      loadShoppingLists();
    }, [loadShoppingLists]),
  );

  const calculateTotal = (items: ShoppingList["items"]) =>
    items.reduce((sum, item) => sum + item.price, 0);

  const updateList = useCallback(
    (items: ShoppingList["items"]) => {
      if (!selectedList) return;

      const normalizedItems = items.map((item) => ({
        ...item,
        category: sanitizeCategory(item.category),
      }));

      const updated = {
        ...selectedList,
        items: normalizedItems,
        totalSpent: calculateTotal(normalizedItems),
      };

      setSelectedList(updated);
      const lists = shoppingLists.map((list) =>
        list.id === selectedList.id ? updated : list,
      );
      setShoppingLists(lists);
      saveShoppingLists(lists);
    },
    [selectedList, shoppingLists, saveShoppingLists],
  );

  const handleToggleItem = useCallback(
    (itemId: string) => {
      if (!selectedList) return;
      updateList(
        selectedList.items.map((item) =>
          item.id === itemId ? { ...item, isChecked: !item.isChecked } : item,
        ),
      );
    },
    [selectedList, updateList],
  );

  const handleDeleteItem = useCallback(
    (itemId: string) => {
      if (!selectedList) return;
      updateList(selectedList.items.filter((item) => item.id !== itemId));
    },
    [selectedList, updateList],
  );

  const handleAddProduct = useCallback(
    (itemData: {
      name: string;
      quantity: number;
      unit: UnitOfMeasure;
      price?: number;
      category: CategoryName;
    }) => {
      if (!selectedList) return;

      const price =
        itemData.price ?? Math.round((Math.random() * 8 + 0.99) * 100) / 100;
      const category = sanitizeCategory(itemData.category);

      const newItem = {
        id: Date.now().toString(),
        name: itemData.name,
        quantity: itemData.quantity,
        unit: itemData.unit,
        price,
        isChecked: false,
        category,
        storeId: selectedList.storeId,
        store: selectedList.store,
      };

      updateList([...selectedList.items, newItem]);
    },
    [selectedList, updateList],
  );

  const handleCreateNewList = useCallback(
    (listData: { name: string; budget: number; store: StoreInfo }) => {
      const newList: ShoppingList = {
        id: Date.now().toString(),
        name: listData.name,
        createdAt: new Date(),
        budget: listData.budget,
        totalSpent: 0,
        storeId: listData.store.id,
        store: listData.store,
        items: [],
      };

      const lists = [...shoppingLists, newList];
      setShoppingLists(lists);
      saveShoppingLists(lists);
    },
    [shoppingLists, saveShoppingLists],
  );

  const handleDeleteList = useCallback(
    (listId: string, listName: string) => {
      Alert.alert(
        "Delete List",
        `Are you sure you want to delete "${listName}"?`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Delete",
            style: "destructive",
            onPress: () => {
              const lists = shoppingLists.filter((list) => list.id !== listId);
              setShoppingLists(lists);
              saveShoppingLists(lists);
            },
          },
        ],
      );
    },
    [shoppingLists, saveShoppingLists],
  );

  const filteredLists = shoppingLists.filter((list) =>
    list.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const BackgroundCircle = ({
    size,
    color,
    position,
    opacity = 0.3,
  }: {
    size: number;
    color: string;
    position: { top?: number; bottom?: number; left?: number; right?: number };
    opacity?: number;
  }) => (
    <View
      className={`absolute rounded-full ${color}`}
      style={{
        width: size,
        height: size,
        opacity,
        ...position,
      }}
    />
  );

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-neutral-50">
        <View className="flex-1 items-center justify-center">
          <Text className="text-neutral-500 font-medium">Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (selectedList) {
    const total = calculateTotal(selectedList.items);
    const remainingBudget = selectedList.budget
      ? selectedList.budget - total
      : 0;

    return (
      <>
        <SafeAreaView className="flex-1 bg-neutral-50">
          <BackgroundCircle
            size={224}
            color="bg-secondary-100"
            position={{ top: -80, left: -80 }}
          />
          <BackgroundCircle
            size={160}
            color="bg-primary-100"
            position={{ top: 160, right: 60 }}
            opacity={0.25}
          />

          <View className="flex-row items-center justify-between px-6 pt-4 pb-4">
            <TouchableOpacity
              onPress={() => setSelectedList(null)}
              className="w-10 h-10 bg-white rounded-full items-center justify-center"
              style={{
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 3,
              }}
            >
              <ArrowLeft size={20} color="#525252" />
            </TouchableOpacity>
            <View className="flex-1 mx-4">
              <Text className="text-xl font-bold text-neutral-900 text-center">
                {selectedList.name}
              </Text>
              {selectedList.store && (
                <Text className="text-xs text-neutral-500 text-center mt-0.5">
                  {selectedList.store.name}
                </Text>
              )}
            </View>
            <View className="w-10" />
          </View>

          <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
            <View
              className="mx-6 mb-4 p-6 bg-white rounded-2xl border border-neutral-200"
              style={{
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.08,
                shadowRadius: 8,
                elevation: 3,
              }}
            >
              <View className="flex-row items-center justify-between mb-3">
                <View className="bg-secondary-100 rounded-full px-3 py-1.5">
                  <Text className="text-secondary-700 text-xs font-bold">
                    {selectedList.items.length}{" "}
                    {selectedList.items.length === 1 ? "Product" : "Products"}
                  </Text>
                </View>
                <View className="flex-row items-center">
                  <View
                    className={`w-2 h-2 rounded-full mr-2 ${
                      remainingBudget >= 0 ? "bg-primary-500" : "bg-red-500"
                    }`}
                  />
                  <Text className="text-xs text-neutral-500 font-medium">
                    {remainingBudget >= 0 ? "Under Budget" : "Over Budget"}
                  </Text>
                </View>
              </View>

              <View className="flex-row justify-between items-center">
                <View className="flex-1">
                  <Text className="text-neutral-500 text-xs font-semibold uppercase tracking-wider mb-1">
                    Total Cost
                  </Text>
                  <Text className="text-4xl font-extrabold text-neutral-900">
                    ${total.toFixed(2)}
                  </Text>
                </View>
                {selectedList.budget > 0 && (
                  <View className="items-end">
                    <Text className="text-neutral-500 text-xs font-semibold uppercase tracking-wider mb-1">
                      Remaining
                    </Text>
                    <Text
                      className={`text-3xl font-extrabold ${
                        remainingBudget >= 0
                          ? "text-primary-600"
                          : "text-red-600"
                      }`}
                    >
                      ${Math.abs(remainingBudget).toFixed(2)}
                    </Text>
                  </View>
                )}
              </View>
            </View>

            <View className="mx-6 mb-4">
              <TouchableOpacity
                onPress={() => setShowAddProductModal(true)}
                className="bg-primary-500 active:bg-primary-600 py-4 rounded-2xl flex-row items-center justify-center"
                style={{
                  shadowColor: "#10B981",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 8,
                  elevation: 4,
                }}
              >
                <Plus size={22} color="white" strokeWidth={2.5} />
                <Text className="text-white font-bold text-base ml-2">
                  Add Product
                </Text>
              </TouchableOpacity>
            </View>

            <View
              className="mx-6 mb-6 bg-white rounded-2xl overflow-hidden border border-neutral-200"
              style={{
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 6,
                elevation: 2,
              }}
            >
              {selectedList.items.length > 0 ? (
                selectedList.items.map((item) => (
                  <ShoppingListItemComponent
                    key={item.id}
                    item={item}
                    onToggle={handleToggleItem}
                    onDelete={handleDeleteItem}
                  />
                ))
              ) : (
                <View className="p-12 items-center">
                  <View className="w-20 h-20 bg-neutral-100 rounded-full items-center justify-center mb-4">
                    <ShoppingBag size={36} color="#A3A3A3" />
                  </View>
                  <Text className="text-neutral-900 font-bold text-lg">
                    No products yet
                  </Text>
                  <Text className="text-neutral-500 mt-2 text-center">
                    Tap &quot;Add Product&quot; to start building your list
                  </Text>
                </View>
              )}
            </View>
          </ScrollView>
        </SafeAreaView>

        <AddProductModal
          visible={showAddProductModal}
          onClose={() => setShowAddProductModal(false)}
          onAddItem={handleAddProduct}
          requireManualPrice={selectedList?.storeId === "5"}
        />
      </>
    );
  }

  return (
    <>
      <SafeAreaView className="flex-1 bg-neutral-50">
        <BackgroundCircle
          size={256}
          color="bg-secondary-100"
          position={{ top: -100, right: 100 }}
        />
        <BackgroundCircle
          size={192}
          color="bg-primary-100"
          position={{ bottom: 80, left: -80 }}
          opacity={0.25}
        />
        <BackgroundCircle
          size={128}
          color="bg-secondary-200"
          position={{ top: 288, right: 40 }}
          opacity={0.2}
        />

        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          <View className="px-6 pt-8 pb-6">
            <Text className="text-neutral-900 font-extrabold text-4xl leading-tight mb-2">
              Shopping Lists
            </Text>
            <View className="bg-secondary-500 rounded-2xl px-4 py-2 self-start">
              <Text className="text-white font-extrabold text-2xl">
                Track your groceries
              </Text>
            </View>
          </View>

          <View
            className="mx-6 mb-4 bg-white rounded-2xl p-4 border border-neutral-200 flex-row items-center"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.05,
              shadowRadius: 4,
              elevation: 2,
            }}
          >
            <Search size={20} color="#A3A3A3" />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search your lists..."
              placeholderTextColor="#A3A3A3"
              className="flex-1 ml-3 text-base text-neutral-900 font-medium"
              style={{ includeFontPadding: false, paddingVertical: 0 }}
            />
          </View>

          <View className="mx-6 mb-4">
            <TouchableOpacity
              onPress={() => setShowCreateListModal(true)}
              className="bg-secondary-500 active:bg-secondary-600 py-4 rounded-2xl flex-row items-center justify-center"
              style={{
                shadowColor: "#14B8A6",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 4,
              }}
            >
              <Plus size={22} color="white" strokeWidth={2.5} />
              <Text className="text-white font-bold text-base ml-2">
                Create New List
              </Text>
            </TouchableOpacity>
          </View>

          <View className="px-6 pb-6">
            {filteredLists.length > 0 ? (
              filteredLists.map((item) => (
                <View
                  key={item.id}
                  className="mb-3 bg-white rounded-2xl border border-neutral-200 overflow-hidden"
                  style={{
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.05,
                    shadowRadius: 6,
                    elevation: 2,
                  }}
                >
                  <TouchableOpacity
                    onPress={() => setSelectedList(item)}
                    className="p-5"
                  >
                    <View className="flex-row items-center justify-between mb-3">
                      <Text className="text-xl font-extrabold text-neutral-900 flex-1">
                        {item.name}
                      </Text>
                      <TouchableOpacity
                        onPress={() => handleDeleteList(item.id, item.name)}
                        className="w-9 h-9 bg-red-50 rounded-full items-center justify-center ml-3"
                      >
                        <Trash2 size={16} color="#EF4444" />
                      </TouchableOpacity>
                    </View>

                    <View className="flex-row items-center mb-3">
                      {item.store && (
                        <View className="bg-neutral-100 rounded-full px-3 py-1.5 mr-2">
                          <Text className="text-neutral-700 text-xs font-bold">
                            {item.store.name}
                          </Text>
                        </View>
                      )}
                      <Text className="text-neutral-400 text-xs font-medium">
                        {format(item.createdAt, "MMM dd, yyyy")}
                      </Text>
                    </View>

                    <View className="flex-row items-end justify-between pt-3 border-t border-neutral-100">
                      <View>
                        <Text className="text-neutral-500 text-xs font-semibold uppercase tracking-wider mb-1">
                          Total
                        </Text>
                        <Text className="text-2xl font-extrabold text-neutral-900">
                          ${item.totalSpent.toFixed(2)}
                        </Text>
                      </View>
                      <View className="items-end">
                        <Text className="text-neutral-500 text-xs font-semibold uppercase tracking-wider mb-1">
                          Items
                        </Text>
                        <Text className="text-xl font-bold text-neutral-900">
                          {item.items.length}
                        </Text>
                      </View>
                      {item.budget > 0 && (
                        <View className="items-end">
                          <Text className="text-neutral-500 text-xs font-semibold uppercase tracking-wider mb-1">
                            Budget
                          </Text>
                          <Text className="text-xl font-bold text-primary-600">
                            ${item.budget.toFixed(2)}
                          </Text>
                        </View>
                      )}
                    </View>
                  </TouchableOpacity>
                </View>
              ))
            ) : (
              <View
                className="bg-white rounded-2xl p-12 items-center border border-neutral-200"
                style={{
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.05,
                  shadowRadius: 6,
                  elevation: 2,
                }}
              >
                <View className="w-20 h-20 bg-neutral-100 rounded-full items-center justify-center mb-4">
                  <ShoppingBag size={36} color="#A3A3A3" />
                </View>
                <Text className="text-neutral-900 font-bold text-lg">
                  No lists found
                </Text>
                <Text className="text-neutral-500 mt-2 text-center">
                  {searchQuery
                    ? "Try a different search term"
                    : "Create your first shopping list"}
                </Text>
              </View>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>

      <CreateListModal
        visible={showCreateListModal}
        onClose={() => setShowCreateListModal(false)}
        onCreateList={handleCreateNewList}
        selectedStore={selectedStore}
        onStoreSelect={setSelectedStore}
        stores={AVAILABLE_STORES}
      />
    </>
  );
}
