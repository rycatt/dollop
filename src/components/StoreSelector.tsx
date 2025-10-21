import { ChevronDown } from 'lucide-react-native';
import React, { useState } from 'react';
import { FlatList, Text, TouchableOpacity, View } from 'react-native';
import { StoreInfo } from '../types/shopping';

interface StoreSelectorProps {
  selectedStore: StoreInfo | null;
  onStoreSelect: (store: StoreInfo) => void;
  stores: StoreInfo[];
}

export function StoreSelector({ selectedStore, onStoreSelect, stores }: StoreSelectorProps) {
  const [showDropdown, setShowDropdown] = useState(false);

  return (
    <View className="relative">
      <TouchableOpacity
        onPress={() => setShowDropdown(!showDropdown)}
        className="bg-gray-50 border border-gray-200 rounded-xl p-4 flex-row items-center justify-between"
      >
        <View className="flex-row items-center flex-1">
          {selectedStore ? (
            <>
              <View className="flex-1">
                <Text className="text-base font-medium text-gray-900">{selectedStore.name}</Text>
                {selectedStore.address ? (
                  <Text className="text-sm text-gray-500">{selectedStore.address}</Text>
                ) : null}
              </View>
            </>
          ) : (
            <Text className="text-gray-500">Select a store</Text>
          )}
        </View>
        <ChevronDown
          size={20}
          color="#6b7280"
          style={{
            transform: [{ rotate: showDropdown ? '180deg' : '0deg' }],
          }}
        />
      </TouchableOpacity>

      {showDropdown && (
        <View className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-xl mt-1 shadow-lg z-10">
          <FlatList
            data={stores}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => {
                  onStoreSelect(item);
                  setShowDropdown(false);
                }}
                className="p-4 flex-row items-center border-b border-gray-100 last:border-b-0"
              >
                <View className="flex-1">
                  <Text className="text-base font-medium text-gray-900">{item.name}</Text>
                  {item.address ? (
                    <Text className="text-sm text-gray-500">{item.address}</Text>
                  ) : null}
                </View>
              </TouchableOpacity>
            )}
            style={{ maxHeight: 200 }}
          />
        </View>
      )}
    </View>
  );
}
