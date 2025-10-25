import AsyncStorage from "@react-native-async-storage/async-storage";
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
  FlatList,
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
  STORAGE_KEY,
} from "../../constants/shopping";
import { ShoppingList, StoreInfo, UnitOfMeasure } from "../../types/shopping";

export default function ShoppingListScreen() {
  const [shoppingLists, setShoppingLists] = useState<ShoppingList[]>([]);
  const [selectedList, setSelectedList] = useState<ShoppingList | null>(null);
  const [selectedStore, setSelectedStore] = useState<StoreInfo | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddItemModal, setShowAddItemModal] = useState(false);
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
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        const lists = parsed.map((list: any) => ({
          ...list,
          createdAt: new Date(list.createdAt),
          items: list.items.map((item: any) => ({
            ...item,
            store: list.store
              ? AVAILABLE_STORES.find((s) => s.id === list.storeId)
              : undefined,
          })),
        }));
        setShoppingLists(lists);
      } else {
        setShoppingLists(mockShoppingLists);
        await saveShoppingLists(mockShoppingLists);
      }
    } catch (error) {
      console.error("Error loading shopping lists:", error);
      setShoppingLists(mockShoppingLists);
    } finally {
      setLoading(false);
    }
  }, [saveShoppingLists]);

  useEffect(() => {
    loadShoppingLists();
  }, [loadShoppingLists]);

  const handleToggleItem = (itemId: string) => {
    if (!selectedList) return;

    const updatedList = {
      ...selectedList,
      items: selectedList.items.map((item) =>
        item.id === itemId ? { ...item, isChecked: !item.isChecked } : item,
      ),
    };
    setSelectedList(updatedList);

    const updatedLists = shoppingLists.map((list) =>
      list.id === selectedList.id ? updatedList : list,
    );
    setShoppingLists(updatedLists);
    saveShoppingLists(updatedLists);
  };

  const handleDeleteItem = (itemId: string) => {
    if (!selectedList) return;

    const updatedList = {
      ...selectedList,
      items: selectedList.items.filter((item) => item.id !== itemId),
    };
    setSelectedList(updatedList);

    const updatedLists = shoppingLists.map((list) =>
      list.id === selectedList.id ? updatedList : list,
    );
    setShoppingLists(updatedLists);
    saveShoppingLists(updatedLists);
  };

  const handleAddProduct = (itemData: {
    name: string;
    quantity: number;
    unit: UnitOfMeasure;
    price?: number;
  }) => {
    if (!selectedList) return;

    let itemPrice: number;

    if (itemData.price !== undefined) {
      itemPrice = itemData.price;
    } else {
      const basePrice = Math.random() * 8 + 0.99;
      itemPrice = Math.round(basePrice * 100) / 100;
    }

    const newItem = {
      id: Date.now().toString(),
      name: itemData.name,
      quantity: itemData.quantity,
      unit: itemData.unit,
      price: itemPrice,
      isChecked: false,
      category: "General",
      storeId: selectedList.storeId,
    };

    const updatedList = {
      ...selectedList,
      items: [...selectedList.items, newItem],
    };
    setSelectedList(updatedList);

    const updatedLists = shoppingLists.map((list) =>
      list.id === selectedList.id ? updatedList : list,
    );
    setShoppingLists(updatedLists);
    saveShoppingLists(updatedLists);
  };

  const handleCreateNewList = (listData: {
    name: string;
    budget: number;
    store: StoreInfo;
  }) => {
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

    const updatedLists = [...shoppingLists, newList];
    setShoppingLists(updatedLists);
    saveShoppingLists(updatedLists);
  };

  const handleDeleteList = (listId: string, listName: string) => {
    Alert.alert(
      "Delete List",
      `Are you sure you want to delete "${listName}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            const updatedLists = shoppingLists.filter(
              (list) => list.id !== listId,
            );
            setShoppingLists(updatedLists);
            saveShoppingLists(updatedLists);
          },
        },
      ],
    );
  };

  const calculateTotal = (items: ShoppingList["items"]) => {
    return items.reduce((total, item) => total + item.price, 0);
  };

  const filteredLists = shoppingLists.filter((list) =>
    list.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-neutral-50">
        <View className="flex-1 items-center justify-center">
          <Text className="text-neutral-500">Loading...</Text>
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
          <View className="flex-row items-center justify-between p-4 bg-white">
            <TouchableOpacity
              onPress={() => setSelectedList(null)}
              className="p-2"
            >
              <ArrowLeft size={24} color="#525252" />
            </TouchableOpacity>
            <Text className="text-xl font-bold text-neutral-900">
              {selectedList.name}
            </Text>
          </View>

          <View className="bg-white mx-4 mt-4 rounded-3xl p-5 border border-neutral-100">
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-lg font-bold text-neutral-900">
                Products ({selectedList.items.length})
              </Text>
            </View>

            <View className="flex-row justify-between items-center">
              <View>
                <Text className="text-3xl font-bold text-neutral-900">
                  ${total.toFixed(2)}
                </Text>
                <Text className="text-sm text-neutral-500 mt-1">Total</Text>
              </View>
              {selectedList.budget ? (
                <View className="items-end">
                  <Text
                    className={`text-xl font-bold ${
                      remainingBudget >= 0 ? "text-primary-600" : "text-red-600"
                    }`}
                  >
                    ${remainingBudget.toFixed(2)}
                  </Text>
                  <Text className="text-sm text-neutral-500 mt-1">
                    Remaining
                  </Text>
                </View>
              ) : null}
            </View>
          </View>

          <View className="mx-4 mt-4">
            <TouchableOpacity
              onPress={() => setShowAddItemModal(true)}
              className="bg-primary-500 py-4 rounded-2xl flex-row items-center justify-center"
            >
              <Plus size={22} color="white" />
              <Text className="text-white font-semibold ml-2">Add Product</Text>
            </TouchableOpacity>
          </View>

          <View className="flex-1 bg-white mx-4 mt-4 rounded-2xl shadow-sm overflow-hidden">
            <FlatList
              data={selectedList.items}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <ShoppingListItemComponent
                  item={item}
                  onToggle={handleToggleItem}
                  onDelete={handleDeleteItem}
                />
              )}
              ListEmptyComponent={() => (
                <View className="p-8 items-center">
                  <ShoppingBag size={48} color="#D4D4D4" />
                  <Text className="text-neutral-500 mt-4 text-center">
                    Tap &quot;Add Product&quot; to get started
                  </Text>
                </View>
              )}
            />
          </View>
        </SafeAreaView>

        <AddProductModal
          visible={showAddItemModal}
          onClose={() => setShowAddItemModal(false)}
          onAddItem={handleAddProduct}
          requireManualPrice={selectedList?.storeId === "5"}
        />
      </>
    );
  }

  return (
    <>
      <SafeAreaView className="flex-1 bg-neutral-50">
        <View className="p-6 pt-10">
          <Text className="text-4xl font-bold text-neutral-900">
            Shopping Lists
          </Text>
          <Text className="text-neutral-500 mt-2">
            Manage your grocery trips
          </Text>
        </View>

        <View className="bg-white mx-4 rounded-2xl p-4 border border-neutral-100">
          <View className="flex-row items-center">
            <Search size={20} color="#A3A3A3" className="mr-3" />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search lists..."
              placeholderTextColor="#A3A3A3"
              className="flex-1 text-base text-neutral-900"
            />
          </View>
        </View>

        <View className="mx-4 mt-4">
          <TouchableOpacity
            onPress={() => setShowCreateListModal(true)}
            className="bg-primary-500 py-4 rounded-2xl flex-row items-center justify-center"
          >
            <Plus size={22} color="white" />
            <Text className="text-white font-semibold ml-2">
              Create New List
            </Text>
          </TouchableOpacity>
        </View>

        <View className="flex-1 bg-white mx-4 mt-4 rounded-2xl shadow-sm overflow-hidden">
          <FlatList
            data={filteredLists}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View className="p-4 border-b border-neutral-100 flex-row items-center">
                <TouchableOpacity
                  onPress={() => setSelectedList(item)}
                  className="flex-1"
                >
                  <View className="flex-row items-center justify-between">
                    <View className="flex-1">
                      <Text className="text-lg font-bold text-neutral-900">
                        {item.name}
                      </Text>
                      <Text className="text-sm text-neutral-500 mt-0.5">
                        {format(item.createdAt, "MMM dd, yyyy")}
                      </Text>
                      {item.store ? (
                        <View className="flex-row items-center mt-1">
                          <Text className="text-sm text-neutral-400">
                            {item.store.name}
                          </Text>
                        </View>
                      ) : null}
                    </View>
                    <View className="items-end">
                      <Text className="text-lg font-bold text-neutral-900">
                        ${item.totalSpent.toFixed(2)}
                      </Text>
                      <Text className="text-sm text-neutral-500 mt-0.5">
                        {item.items.length} items
                      </Text>
                      {item.budget ? (
                        <Text className="text-xs text-neutral-400 mt-0.5">
                          Budget: ${item.budget.toFixed(2)}
                        </Text>
                      ) : null}
                    </View>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => handleDeleteList(item.id, item.name)}
                  className="ml-3 p-2"
                >
                  <Trash2 size={20} color="#EF4444" />
                </TouchableOpacity>
              </View>
            )}
            ListEmptyComponent={() => (
              <View className="p-8 items-center">
                <ShoppingBag size={48} color="#D4D4D4" />
                <Text className="text-neutral-500 mt-4 text-center">
                  No shopping lists found
                </Text>
                <Text className="text-neutral-400 mt-2 text-center">
                  Create your first list to get started
                </Text>
              </View>
            )}
          />
        </View>
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
