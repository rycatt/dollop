import AsyncStorage from '@react-native-async-storage/async-storage';
import { format } from 'date-fns';
import { ArrowLeft, Plus, Search, ShoppingBag } from 'lucide-react-native';
import React, { useCallback, useEffect, useState } from 'react';
import { FlatList, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AddItemModal } from '../../components/AddItemModal';
import { CreateListModal } from '../../components/CreateListModal';
import { ShoppingListItemComponent } from '../../components/ShoppingListItemComponent';
import { AVAILABLE_STORES, mockShoppingLists, STORAGE_KEY } from '../../constants/shopping';
import { ShoppingList, StoreInfo, UnitOfMeasure } from '../../types/shopping';

export default function ShoppingListScreen() {
  const [shoppingLists, setShoppingLists] = useState<ShoppingList[]>([]);
  const [selectedList, setSelectedList] = useState<ShoppingList | null>(null);
  const [selectedStore, setSelectedStore] = useState<StoreInfo | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddItemModal, setShowAddItemModal] = useState(false);
  const [showCreateListModal, setShowCreateListModal] = useState(false);
  const [loading, setLoading] = useState(true);

  const saveShoppingLists = useCallback(async (lists: ShoppingList[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(lists));
    } catch (error) {
      console.error('Error saving shopping lists:', error);
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
            store: list.store ? AVAILABLE_STORES.find((s) => s.id === list.storeId) : undefined,
          })),
        }));
        setShoppingLists(lists);
      } else {
        setShoppingLists(mockShoppingLists);
        await saveShoppingLists(mockShoppingLists);
      }
    } catch (error) {
      console.error('Error loading shopping lists:', error);
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
        item.id === itemId ? { ...item, isChecked: !item.isChecked } : item
      ),
    };
    setSelectedList(updatedList);

    const updatedLists = shoppingLists.map((list) =>
      list.id === selectedList.id ? updatedList : list
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
      list.id === selectedList.id ? updatedList : list
    );
    setShoppingLists(updatedLists);
    saveShoppingLists(updatedLists);
  };

  const handleAddProduct = (itemData: { name: string; quantity: number; unit: UnitOfMeasure }) => {
    if (!selectedList) return;

    const newItem = {
      id: Date.now().toString(),
      name: itemData.name,
      quantity: itemData.quantity,
      unit: itemData.unit,
      price: Math.random() * 20 + 1,
      originalPrice: Math.random() > 0.5 ? Math.random() * 25 + 2 : undefined,
      isChecked: false,
      category: 'General',
      storeId: selectedList.storeId,
    };

    const updatedList = {
      ...selectedList,
      items: [...selectedList.items, newItem],
    };
    setSelectedList(updatedList);

    const updatedLists = shoppingLists.map((list) =>
      list.id === selectedList.id ? updatedList : list
    );
    setShoppingLists(updatedLists);
    saveShoppingLists(updatedLists);
  };

  const handleCreateNewList = (listData: { name: string; budget: number; store: StoreInfo }) => {
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

  const calculateTotal = (items: ShoppingList['items']) => {
    return items.reduce((total, item) => total + item.price, 0);
  };

  const calculateSavings = (items: ShoppingList['items']) => {
    return items.reduce((savings, item) => {
      if (item.originalPrice) {
        return savings + (item.originalPrice - item.price);
      }
      return savings;
    }, 0);
  };

  const filteredLists = shoppingLists.filter((list) =>
    list.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-1 items-center justify-center">
          <Text className="text-gray-500">Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (selectedList) {
    const total = calculateTotal(selectedList.items);
    const savings = calculateSavings(selectedList.items);
    const remainingBudget = selectedList.budget ? selectedList.budget - total : 0;

    return (
      <>
        <SafeAreaView className="flex-1 bg-gray-50">
          <View className="flex-row items-center justify-between p-4 bg-white">
            <TouchableOpacity onPress={() => setSelectedList(null)} className="p-2">
              <ArrowLeft size={24} color="#374151" />
            </TouchableOpacity>
            <Text className="text-xl font-semibold text-gray-900">{selectedList.name}</Text>
          </View>

          <View className="bg-white mx-4 mt-4 rounded-2xl p-4 shadow-sm">
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-lg font-semibold text-gray-900">
                Products ({selectedList.items.length})
              </Text>
            </View>

            <View className="flex-row justify-between items-center">
              <View>
                <Text className="text-2xl font-bold text-gray-900">${total.toFixed(2)}</Text>
                <Text className="text-sm text-gray-500">Total</Text>
              </View>
              {selectedList.budget ? (
                <View className="items-end">
                  <Text
                    className={`text-lg font-semibold ${
                      remainingBudget >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    ${remainingBudget.toFixed(2)}
                  </Text>
                  <Text className="text-sm text-gray-500">Remaining</Text>
                </View>
              ) : null}
            </View>

            {savings > 0 ? (
              <View className="mt-2 pt-2 border-t border-gray-100">
                <Text className="text-sm text-green-600 font-medium">
                  You save: ${savings.toFixed(2)}
                </Text>
              </View>
            ) : null}
          </View>

          <View className="mx-4 mt-4">
            <TouchableOpacity
              onPress={() => setShowAddItemModal(true)}
              className="bg-green-500 py-4 rounded-2xl flex-row items-center justify-center"
            >
              <Plus size={20} color="white" />
              <Text className="text-white font-medium ml-2">Add Product</Text>
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
                  <ShoppingBag size={48} color="#d1d5db" />
                  <Text className="text-gray-500 mt-4 text-center">
                    Tap &quot;Add Product&quot; to get started
                  </Text>
                </View>
              )}
            />
          </View>
        </SafeAreaView>

        <AddItemModal
          visible={showAddItemModal}
          onClose={() => setShowAddItemModal(false)}
          onAddItem={handleAddProduct}
        />
      </>
    );
  }

  return (
    <>
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="p-4">
          <Text className="text-4xl font-bold text-gray-900">Shopping Lists</Text>
        </View>

        <View className="bg-white mx-4 rounded-2xl p-4 shadow-sm">
          <View className="flex-row items-center">
            <Search size={20} color="#9ca3af" className="mr-3" />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search lists..."
              placeholderTextColor="#6b7280"
              className="flex-1 text-base text-gray-900"
            />
          </View>
        </View>

        <View className="mx-4 mt-4">
          <TouchableOpacity
            onPress={() => setShowCreateListModal(true)}
            className="bg-green-500 py-4 rounded-2xl flex-row items-center justify-center"
          >
            <Plus size={20} color="white" />
            <Text className="text-white font-medium ml-2">Create New List</Text>
          </TouchableOpacity>
        </View>

        <View className="flex-1 bg-white mx-4 mt-4 rounded-2xl shadow-sm overflow-hidden">
          <FlatList
            data={filteredLists}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => setSelectedList(item)}
                className="p-4 border-b border-gray-100"
              >
                <View className="flex-row items-center justify-between">
                  <View className="flex-1">
                    <Text className="text-lg font-semibold text-gray-900">{item.name}</Text>
                    <Text className="text-sm text-gray-500">
                      {format(item.createdAt, 'MMM dd, yyyy')}
                    </Text>
                    {item.store ? (
                      <View className="flex-row items-center mt-1">
                        <Text className="text-sm text-gray-400">{item.store.name}</Text>
                      </View>
                    ) : null}
                  </View>
                  <View className="items-end">
                    <Text className="text-lg font-semibold text-gray-900">
                      ${item.totalSpent.toFixed(2)}
                    </Text>
                    <Text className="text-sm text-gray-500">{item.items.length} items</Text>
                    {item.budget ? (
                      <Text className="text-xs text-gray-400">
                        Budget: ${item.budget.toFixed(2)}
                      </Text>
                    ) : null}
                  </View>
                </View>
              </TouchableOpacity>
            )}
            ListEmptyComponent={() => (
              <View className="p-8 items-center">
                <ShoppingBag size={48} color="#d1d5db" />
                <Text className="text-gray-500 mt-4 text-center">No shopping lists found</Text>
                <Text className="text-gray-400 mt-2 text-center">
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
