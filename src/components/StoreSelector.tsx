import { ChevronDown } from "lucide-react-native";
import React, { useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { StoreInfo } from "../constants/shopping";

interface StoreSelectorProps {
  selectedStore: StoreInfo | null;
  onStoreSelect: (store: StoreInfo) => void;
  stores: StoreInfo[];
}

export function StoreSelector({
  selectedStore,
  onStoreSelect,
  stores,
}: StoreSelectorProps) {
  const [showDropdown, setShowDropdown] = useState(false);

  return (
    <View className="relative">
      <TouchableOpacity
        onPress={() => setShowDropdown(!showDropdown)}
        className="bg-neutral-50 border border-neutral-200 rounded-2xl p-4 flex-row items-center justify-between"
      >
        <View className="flex-row items-center flex-1">
          {selectedStore ? (
            <>
              <View className="flex-1">
                <Text className="text-base font-semibold text-neutral-900">
                  {selectedStore.name}
                </Text>
                {selectedStore.address ? (
                  <Text className="text-sm text-neutral-500">
                    {selectedStore.address}
                  </Text>
                ) : null}
              </View>
            </>
          ) : (
            <Text className="text-neutral-500">Select a store</Text>
          )}
        </View>
        <ChevronDown
          size={20}
          color="#A3A3A3"
          style={{
            transform: [{ rotate: showDropdown ? "180deg" : "0deg" }],
          }}
        />
      </TouchableOpacity>

      {showDropdown && (
        <View className="absolute top-full left-0 right-0 bg-white border border-neutral-200 rounded-2xl mt-1 shadow-lg z-10">
          <ScrollView
            style={{ maxHeight: 200 }}
            nestedScrollEnabled
            showsVerticalScrollIndicator={false}
          >
            {stores.map((item, index) => (
              <TouchableOpacity
                key={item.id}
                onPress={() => {
                  onStoreSelect(item);
                  setShowDropdown(false);
                }}
                className={`p-4 flex-row items-center ${
                  index < stores.length - 1 ? "border-b border-neutral-100" : ""
                }`}
              >
                <View className="flex-1">
                  <Text className="text-base font-semibold text-neutral-900">
                    {item.name}
                  </Text>
                  {item.address ? (
                    <Text className="text-sm text-neutral-500">
                      {item.address}
                    </Text>
                  ) : null}
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
}
