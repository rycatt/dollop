import React, { useEffect, useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { StoreInfo } from "../types/shopping";
import { StoreSelector } from "./StoreSelector";

interface CreateListModalProps {
  visible: boolean;
  onClose: () => void;
  onCreateList: (listData: {
    name: string;
    budget: number;
    store: StoreInfo;
  }) => void;
  selectedStore: StoreInfo | null;
  onStoreSelect: (store: StoreInfo) => void;
  stores: StoreInfo[];
}

export function CreateListModal({
  visible,
  onClose,
  onCreateList,
  selectedStore,
  onStoreSelect,
  stores,
}: CreateListModalProps) {
  const [listName, setListName] = useState("");
  const [budget, setBudget] = useState("");
  const listNameRef = useRef<TextInput>(null);

  useEffect(() => {
    if (visible) {
      setTimeout(() => {
        listNameRef.current?.focus();
      }, 100);
    }
  }, [visible]);

  const handleCreateList = () => {
    if (!listName.trim() || !selectedStore) return;

    const budgetAmount = budget.trim() ? parseFloat(budget) : 0;
    if (budget.trim() && (isNaN(budgetAmount) || budgetAmount < 0)) return;

    onCreateList({
      name: listName.trim(),
      budget: budgetAmount,
      store: selectedStore,
    });

    setListName("");
    setBudget("");
    onClose();
  };

  const handleCancel = () => {
    setListName("");
    setBudget("");
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View className="flex-1 bg-black/50 justify-center items-center">
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="w-full items-center justify-center"
        >
          <View className="bg-white rounded-2xl p-6 w-full max-w-sm mx-4">
            <Text className="text-xl font-bold text-gray-900 mb-6 text-center">
              Create New List
            </Text>

            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700 mb-2">
                List Name
              </Text>
              <TextInput
                ref={listNameRef}
                value={listName}
                onChangeText={setListName}
                placeholder="Enter list name"
                placeholderTextColor="#6b7280"
                className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-base text-gray-900"
                returnKeyType="next"
                autoFocus
              />
            </View>

            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700 mb-2">
                Budget (Optional)
              </Text>
              <TextInput
                value={budget}
                onChangeText={setBudget}
                placeholder="0.00"
                placeholderTextColor="#6b7280"
                className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-base text-gray-900"
                keyboardType="numeric"
                returnKeyType="done"
              />
            </View>

            <View className="mb-6">
              <Text className="text-sm font-medium text-gray-700 mb-2">
                Select Store
              </Text>
              <StoreSelector
                selectedStore={selectedStore}
                onStoreSelect={onStoreSelect}
                stores={stores}
              />
            </View>

            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={handleCancel}
                className="flex-1 bg-gray-100 py-4 rounded-xl"
              >
                <Text className="text-gray-700 font-medium text-center">
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleCreateList}
                className="flex-1 bg-green-500 py-4 rounded-xl"
              >
                <Text className="text-white font-medium text-center">
                  Create List
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}
