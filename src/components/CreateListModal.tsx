import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { StoreInfo } from "../constants/shopping";
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
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <View className="flex-1 bg-black/50 justify-center items-center p-4">
          <View
            className="bg-white rounded-3xl w-full max-w-sm"
            style={{ maxHeight: "80%" }}
          >
            <ScrollView
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ padding: 24 }}
            >
              <Text className="text-xl font-bold text-neutral-900 mb-6 text-center">
                Create New List
              </Text>

              <View className="mb-4">
                <Text className="text-sm font-semibold text-neutral-700 mb-2">
                  Select Store
                </Text>
                <StoreSelector
                  selectedStore={selectedStore}
                  onStoreSelect={onStoreSelect}
                  stores={stores}
                />
              </View>

              <View className="mb-4">
                <Text className="text-sm font-semibold text-neutral-700 mb-2">
                  List Name
                </Text>
                <TextInput
                  value={listName}
                  onChangeText={setListName}
                  placeholder="Enter list name"
                  placeholderTextColor="#A3A3A3"
                  className="bg-neutral-50 border border-neutral-200 rounded-2xl p-4 text-base text-neutral-900"
                  returnKeyType="next"
                />
              </View>

              <View className="mb-6">
                <Text className="text-sm font-semibold text-neutral-700 mb-2">
                  Budget (Optional)
                </Text>
                <TextInput
                  value={budget}
                  onChangeText={setBudget}
                  placeholder="0.00"
                  placeholderTextColor="#A3A3A3"
                  className="bg-neutral-50 border border-neutral-200 rounded-2xl p-4 text-base text-neutral-900"
                  keyboardType="numeric"
                  returnKeyType="done"
                />
              </View>

              <View className="flex-row gap-3">
                <TouchableOpacity
                  onPress={handleCancel}
                  className="flex-1 border border-neutral-200 py-4 rounded-2xl"
                >
                  <Text className="text-neutral-700 font-semibold text-center">
                    Cancel
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleCreateList}
                  className="flex-1 bg-primary-500 py-4 rounded-2xl"
                >
                  <Text className="text-white font-semibold text-center">
                    Create List
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
