import AsyncStorage from '@react-native-async-storage/async-storage';
import { format, formatDistanceToNow, isValid, parse } from 'date-fns';
import { Plus, Search, Trash2, X } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  EmitterSubscription,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Animated as RNAnimated,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

interface PantryItem {
  id: string;
  name: string;
  quantity: number;
  emoji: string;
  storageLocation: 'Fridge' | 'Freezer' | 'Pantry';
  expirationDate?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const STORAGE_KEY = 'pantry_items';
const STORAGE_LOCATIONS = ['Fridge', 'Freezer', 'Pantry'] as const;

interface SwipeableItemProps {
  item: PantryItem;
  onDelete: (itemId: string) => void;
  onPress: (item: PantryItem) => void;
}

function SwipeableItem({ item, onDelete, onPress }: SwipeableItemProps) {
  const translateX = useSharedValue(0);
  const revealOpacity = useSharedValue(0);

  const pan = Gesture.Pan()
    .onUpdate(({ translationX }) => {
      translateX.value = translationX;
      revealOpacity.value = translationX < 0 ? Math.min(Math.abs(translationX) / 80, 1) : 0;
    })
    .onEnd(({ translationX }) => {
      if (translationX < -100) runOnJS(onDelete)(item.id);
      else {
        translateX.value = withSpring(0);
        revealOpacity.value = withTiming(0, { duration: 200 });
      }
    });

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const bgStyle = useAnimatedStyle(() => ({
    opacity: revealOpacity.value,
  }));

  const getExpirationStatus = (i: PantryItem) => {
    if (!i.expirationDate || !isValid(i.expirationDate)) return null;
    const now = new Date();
    const daysUntilExpiry = Math.ceil(
      (i.expirationDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (daysUntilExpiry < 0) return { type: 'expired', days: Math.abs(daysUntilExpiry) as number };
    if (daysUntilExpiry <= 2) return { type: 'expiring', days: daysUntilExpiry as number };
    return null;
  };

  const expirationStatus = getExpirationStatus(item);
  const daysAgo = formatDistanceToNow(item.updatedAt, { addSuffix: true });

  return (
    <View className="mb-3 relative rounded-2xl overflow-hidden">
      <Animated.View
        style={[
          {
            ...StyleSheet.absoluteFillObject,
            backgroundColor: '#ef4444',
            justifyContent: 'center',
            alignItems: 'flex-end',
            paddingRight: 16,
          },
          bgStyle,
        ]}
      >
        <Trash2 size={24} color="white" />
      </Animated.View>

      <GestureDetector gesture={pan}>
        <Animated.View style={cardStyle}>
          <TouchableOpacity
            onPress={() => {
              translateX.value = withSpring(0);
              revealOpacity.value = withTiming(0, { duration: 200 });
              onPress(item);
            }}
            className="bg-white p-4 shadow-sm border border-gray-100"
            accessibilityRole="button"
            accessibilityLabel={`${item.name}, ${item.quantity}`}
          >
            <View className="flex-row items-center">
              <View className="w-12 h-12 bg-gray-100 rounded-full items-center justify-center mr-4">
                <Text className="text-2xl">{item.emoji}</Text>
              </View>

              <View className="flex-1">
                <Text className="text-lg font-semibold text-gray-900 mb-1">{item.name}</Text>
                <Text className="text-sm text-gray-500">{daysAgo}</Text>

                {expirationStatus ? (
                  <View className="mt-2">
                    <View
                      className={`px-3 py-1 rounded-full self-start ${
                        expirationStatus.type === 'expired' ? 'bg-red-100' : 'bg-amber-100'
                      }`}
                    >
                      <Text
                        className={`text-xs font-medium ${
                          expirationStatus.type === 'expired' ? 'text-red-700' : 'text-amber-700'
                        }`}
                      >
                        {expirationStatus.type === 'expired'
                          ? `EXPIRED ${expirationStatus.days} DAY${
                              expirationStatus.days === 1 ? '' : 'S'
                            } AGO`
                          : `EXPIRING IN ${expirationStatus.days} DAY${
                              expirationStatus.days === 1 ? '' : 'S'
                            }`}
                      </Text>
                    </View>
                  </View>
                ) : null}
              </View>

              <View className="items-end">
                <Text className="text-lg font-semibold text-gray-900">{item.quantity}</Text>
              </View>
            </View>
          </TouchableOpacity>
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

export default function PantryScreen() {
  const insets = useSafeAreaInsets();

  const [items, setItems] = useState<PantryItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isDetailsModalVisible, setIsDetailsModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<PantryItem | null>(null);

  const [fabScale] = useState(new RNAnimated.Value(1));
  const [listOpacity] = useState(new RNAnimated.Value(0));
  const [keyboardLiftY] = useState(new RNAnimated.Value(0));

  const [formData, setFormData] = useState({
    name: '',
    quantity: '',
    emoji: '📦',
    storageLocation: 'Fridge' as 'Fridge' | 'Freezer' | 'Pantry',
    expirationDate: '',
    notes: '',
  });

  useEffect(() => {
    loadItems();
    RNAnimated.timing(listOpacity, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [listOpacity]);

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    let subShow: EmitterSubscription | undefined;
    let subHide: EmitterSubscription | undefined;

    subShow = Keyboard.addListener(showEvent, (e) => {
      const h = e.endCoordinates?.height ?? 0;
      RNAnimated.timing(keyboardLiftY, {
        toValue: -h,
        duration: Platform.OS === 'ios' ? (e.duration ?? 250) : 250,
        useNativeDriver: true,
      }).start();
    });

    subHide = Keyboard.addListener(hideEvent, (e) => {
      RNAnimated.timing(keyboardLiftY, {
        toValue: 0,
        duration: Platform.OS === 'ios' ? (e?.duration ?? 250) : 250,
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
      console.error('Error loading items:', error);
    }
  };

  const saveItems = async (newItems: PantryItem[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newItems));
      setItems(newItems);
    } catch (error) {
      console.error('Error saving items:', error);
    }
  };

  const addItem = async () => {
    if (!formData.name.trim() || !formData.quantity) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    const parsed = formData.expirationDate
      ? parse(formData.expirationDate.trim(), 'MM/dd/yyyy', new Date())
      : undefined;

    const newItem: PantryItem = {
      id: Math.random().toString(36).substring(2, 9),
      name: formData.name.trim(),
      quantity: parseFloat(formData.quantity),
      emoji: formData.emoji,
      storageLocation: formData.storageLocation,
      expirationDate: parsed && isValid(parsed) ? parsed : undefined,
      notes: formData.notes.trim(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const updatedItems = [newItem, ...items];
    await saveItems(updatedItems);

    setFormData({
      name: '',
      quantity: '',
      emoji: '📦',
      storageLocation: 'Fridge',
      expirationDate: '',
      notes: '',
    });
    setIsAddModalVisible(false);
    showSuccessToast('Item added successfully!');
  };

  const deleteItem = async (itemId: string) => {
    const updatedItems = items.filter((i) => i.id !== itemId);
    await saveItems(updatedItems);
    setIsDetailsModalVisible(false);
    setSelectedItem(null);
  };

  const showSuccessToast = (message: string) => {
    Alert.alert('Success', message, [{ text: 'OK' }]);
  };

  const getExpirationStatus = (i: PantryItem) => {
    if (!i.expirationDate || !isValid(i.expirationDate)) return null;
    const now = new Date();
    const daysUntilExpiry = Math.ceil(
      (i.expirationDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (daysUntilExpiry < 0) return { type: 'expired', days: Math.abs(daysUntilExpiry) as number };
    if (daysUntilExpiry <= 2) return { type: 'expiring', days: daysUntilExpiry as number };
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
    <SafeAreaView className="flex-1 bg-white" edges={['top', 'bottom']}>
      <View className="flex-row items-center justify-between px-4 py-3 bg-white">
        <Text className="text-2xl font-bold text-gray-900">Pantry</Text>
      </View>

      <View className="px-4 py-3">
        <View className="flex-row items-center bg-gray-50 rounded-full px-4 py-3">
          <Search size={20} color="#6B7280" />
          <TextInput
            className="flex-1 ml-3 leading-none text-gray-900"
            placeholder="Search your pantry"
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
            accessibilityRole="search"
            accessibilityLabel="Search pantry items"
          />
        </View>
      </View>

      <RNAnimated.View style={{ flex: 1, opacity: listOpacity }}>
        <ScrollView
          className="flex-1 px-4 py-2"
          showsVerticalScrollIndicator={false}
          accessibilityRole="list"
          contentInsetAdjustmentBehavior={Platform.OS === 'ios' ? 'automatic' : undefined}
          contentContainerStyle={{
            paddingBottom: (insets.bottom || 0) + 96,
          }}
          keyboardShouldPersistTaps="handled"
        >
          {filteredItems.map((item) => (
            <SwipeableItem
              key={item.id}
              item={item}
              onDelete={deleteItem}
              onPress={(it) => {
                setSelectedItem(it);
                setIsDetailsModalVisible(true);
              }}
            />
          ))}
        </ScrollView>
      </RNAnimated.View>

      <RNAnimated.View
        style={{
          position: 'absolute',
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
          className="w-14 h-14 bg-green-500 rounded-full items-center justify-center shadow-lg"
          accessibilityRole="button"
          accessibilityLabel="Add new item"
        >
          <Plus size={28} color="white" />
        </TouchableOpacity>
      </RNAnimated.View>

      <Modal visible={isAddModalVisible} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView className="flex-1 bg-white" edges={['top', 'bottom']}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? insets.top : 0}
            className="flex-1"
          >
            <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-200">
              <Text className="text-xl font-semibold text-gray-900">Add Item</Text>
              <TouchableOpacity
                onPress={() => setIsAddModalVisible(false)}
                accessibilityRole="button"
                accessibilityLabel="Close"
              >
                <X size={24} color="#374151" />
              </TouchableOpacity>
            </View>

            <ScrollView
              className="flex-1 px-4 py-6"
              keyboardShouldPersistTaps="handled"
              contentInsetAdjustmentBehavior={Platform.OS === 'ios' ? 'automatic' : undefined}
              contentContainerStyle={{
                paddingBottom: (insets.bottom || 0) + 160,
              }}
            >
              <View className="mb-6">
                <Text className="text-base font-medium text-gray-900 mb-2">
                  Name <Text className="text-red-500">*</Text>
                </Text>
                <TextInput
                  className="border border-gray-300 rounded-xl px-4 py-3 leading-none text-gray-900 bg-white"
                  placeholder="Enter item name"
                  placeholderTextColor="#9CA3AF"
                  value={formData.name}
                  onChangeText={(text) => setFormData({ ...formData, name: text })}
                  accessibilityRole="text"
                  accessibilityLabel="Item name"
                  autoCapitalize="words"
                  autoCorrect={false}
                  returnKeyType="next"
                  textAlignVertical="center"
                />
              </View>

              <View className="mb-6">
                <Text className="text-base font-medium text-gray-900 mb-2">Icon</Text>
                <View className="flex-row items-center">
                  <View className="flex-1 mr-2">
                    <TextInput
                      className="border border-gray-300 rounded-xl px-4 py-3 text-center"
                      placeholder="Enter emoji..."
                      value={formData.emoji}
                      onChangeText={(text) => setFormData({ ...formData, emoji: text })}
                      maxLength={2}
                      accessibilityRole="text"
                      accessibilityLabel="Enter custom emoji"
                    />
                  </View>
                  <View className="w-12 h-12 bg-gray-100 rounded-xl items-center justify-center">
                    <Text className="text-2xl">{formData.emoji || '📦'}</Text>
                  </View>
                </View>
              </View>

              <View className="mb-6">
                <Text className="text-base font-medium text-gray-900 mb-2">
                  Quantity <Text className="text-red-500">*</Text>
                </Text>
                <TextInput
                  className="border border-gray-300 rounded-xl px-4 py-3 leading-none text-gray-900 bg-white"
                  placeholder="0"
                  placeholderTextColor="#9CA3AF"
                  value={formData.quantity}
                  onChangeText={(text) => setFormData({ ...formData, quantity: text })}
                  keyboardType="numeric"
                  accessibilityRole="text"
                  accessibilityLabel="Item quantity"
                  textAlignVertical="center"
                />
              </View>

              <View className="mb-6">
                <Text className="text-base font-medium text-gray-900 mb-2">Storage Location</Text>
                <View className="flex-row">
                  {STORAGE_LOCATIONS.map((location) => (
                    <TouchableOpacity
                      key={location}
                      onPress={() => setFormData({ ...formData, storageLocation: location })}
                      className={`flex-1 px-4 py-3 rounded-xl mr-2 ${
                        formData.storageLocation === location ? 'bg-green-500' : 'bg-gray-200'
                      }`}
                      accessibilityRole="button"
                      accessibilityLabel={`Select storage location ${location}`}
                    >
                      <Text
                        className={`text-center font-medium ${
                          formData.storageLocation === location ? 'text-white' : 'text-gray-700'
                        }`}
                      >
                        {location}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View className="mb-6">
                <Text className="text-base font-medium text-gray-900 mb-2">
                  Expiration Date <Text className="text-gray-400">(Optional)</Text>
                </Text>
                <TextInput
                  className="border border-gray-300 rounded-xl px-4 py-3"
                  placeholder="MM/DD/YYYY"
                  value={formData.expirationDate}
                  onChangeText={(text) => setFormData({ ...formData, expirationDate: text })}
                  accessibilityRole="text"
                  accessibilityLabel="Expiration date"
                />
              </View>

              <View className="mb-6">
                <Text className="text-base font-medium text-gray-900 mb-2">
                  Notes <Text className="text-gray-400">(Optional)</Text>
                </Text>
                <TextInput
                  className="border border-gray-300 rounded-xl px-4 py-3"
                  placeholder="Add notes..."
                  value={formData.notes}
                  onChangeText={(text) => setFormData({ ...formData, notes: text })}
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                  accessibilityRole="text"
                  accessibilityLabel="Item notes"
                />
              </View>
            </ScrollView>

            <View
              className="px-4 border-t border-gray-200 bg-white"
              style={{
                paddingTop: 16,
                paddingBottom: (insets.bottom || 0) + 24,
              }}
            >
              <TouchableOpacity
                onPress={addItem}
                className="bg-green-500 rounded-xl py-4 items-center"
                accessibilityRole="button"
                accessibilityLabel="Save item"
              >
                <Text className="text-white font-semibold text-lg">Save Item</Text>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>

      <Modal visible={isDetailsModalVisible} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView className="flex-1 bg-white" edges={['top', 'bottom']}>
          {selectedItem ? (
            <>
              <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-200">
                <Text className="text-xl font-semibold text-gray-900">Item Details</Text>
                <TouchableOpacity
                  onPress={() => {
                    setIsDetailsModalVisible(false);
                    setSelectedItem(null);
                  }}
                  accessibilityRole="button"
                  accessibilityLabel="Close"
                >
                  <X size={24} color="#374151" />
                </TouchableOpacity>
              </View>

              <ScrollView
                className="flex-1 px-4 py-6"
                keyboardShouldPersistTaps="handled"
                contentInsetAdjustmentBehavior={Platform.OS === 'ios' ? 'automatic' : undefined}
                contentContainerStyle={{
                  paddingBottom: (insets.bottom || 0) + 120,
                }}
              >
                <View className="items-center mb-6">
                  <View className="w-20 h-20 bg-gray-100 rounded-full items-center justify-center mb-4">
                    <Text className="text-4xl">{selectedItem.emoji}</Text>
                  </View>
                  <Text className="text-2xl font-bold text-gray-900 text-center">
                    {selectedItem.name}
                  </Text>
                </View>

                <View className="space-y-4">
                  <View className="bg-gray-50 rounded-xl p-4">
                    <Text className="text-sm text-gray-500 mb-1">Quantity</Text>
                    <Text className="text-lg font-semibold text-gray-900">
                      {selectedItem.quantity}
                    </Text>
                  </View>

                  <View className="bg-gray-50 rounded-xl p-4">
                    <Text className="text-sm text-gray-500 mb-1">Storage Location</Text>
                    <Text className="text-lg font-semibold text-gray-900">
                      {selectedItem.storageLocation}
                    </Text>
                  </View>

                  {selectedItem.expirationDate && isValid(selectedItem.expirationDate) ? (
                    <View className="bg-gray-50 rounded-xl p-4">
                      <Text className="text-sm text-gray-500 mb-1">Expiration Date</Text>
                      <Text className="text-lg font-semibold text-gray-900">
                        {format(selectedItem.expirationDate, 'MM/dd/yyyy')}
                      </Text>
                      {(() => {
                        const st = getExpirationStatus(selectedItem);
                        if (!st) return null;
                        return (
                          <View className="mt-2">
                            <View
                              className={`px-3 py-1 rounded-full self-start ${
                                st.type === 'expired' ? 'bg-red-100' : 'bg-amber-100'
                              }`}
                            >
                              <Text
                                className={`text-xs font-medium ${
                                  st.type === 'expired' ? 'text-red-700' : 'text-amber-700'
                                }`}
                              >
                                {st.type === 'expired'
                                  ? `EXPIRED ${st.days} DAY${st.days === 1 ? '' : 'S'} AGO`
                                  : `EXPIRING IN ${st.days} DAY${st.days === 1 ? '' : 'S'}`}
                              </Text>
                            </View>
                          </View>
                        );
                      })()}
                    </View>
                  ) : null}

                  {selectedItem.notes ? (
                    <View className="bg-gray-50 rounded-xl p-4">
                      <Text className="text-sm text-gray-500 mb-1">Notes</Text>
                      <Text className="text-lg font-semibold text-gray-900">
                        {selectedItem.notes}
                      </Text>
                    </View>
                  ) : null}

                  <View className="bg-gray-50 rounded-xl p-4">
                    <Text className="text-sm text-gray-500 mb-1">Last Updated</Text>
                    <Text className="text-lg font-semibold text-gray-900">
                      {formatDistanceToNow(selectedItem.updatedAt, {
                        addSuffix: true,
                      })}
                    </Text>
                  </View>
                </View>
              </ScrollView>

              <View
                className="px-4 border-t border-gray-200 bg-white"
                style={{
                  paddingTop: 16,
                  paddingBottom: (insets.bottom || 0) + 24,
                }}
              >
                <TouchableOpacity
                  onPress={() => deleteItem(selectedItem.id)}
                  className="bg-red-500 rounded-xl py-4 items-center flex-row justify-center"
                  accessibilityRole="button"
                  accessibilityLabel="Delete item"
                >
                  <Trash2 size={20} color="white" />
                  <Text className="text-white font-semibold text-lg ml-2">Delete Item</Text>
                </TouchableOpacity>
              </View>
            </>
          ) : null}
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}
