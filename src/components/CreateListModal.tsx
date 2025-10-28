import { X } from "lucide-react-native";
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

  const isCreateDisabled = !listName.trim() || !selectedStore;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <View className="flex-1 justify-center items-center bg-black/40 px-4">
          <View className="bg-white rounded-[28px] shadow-2xl w-full max-w-md">
            <View className="px-6 pt-6 pb-6">
              <View className="flex-row items-center justify-between mb-6">
                <Text className="text-2xl font-bold text-neutral-900">
                  Create New List
                </Text>
                <TouchableOpacity
                  onPress={handleCancel}
                  className="w-10 h-10 items-center justify-center rounded-full bg-neutral-100 active:bg-neutral-200"
                >
                  <X size={22} color="#525252" />
                </TouchableOpacity>
              </View>

              <ScrollView
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
                style={{ maxHeight: 480 }}
                contentContainerStyle={{ paddingBottom: 8 }}
              >
                <View className="mb-5">
                  <Text className="text-sm font-semibold text-neutral-700 mb-2.5">
                    Select Store <Text className="text-danger">*</Text>
                  </Text>
                  <StoreSelector
                    selectedStore={selectedStore}
                    onStoreSelect={onStoreSelect}
                    stores={stores}
                  />
                </View>

                <View className="mb-5">
                  <Text className="text-sm font-semibold text-neutral-700 mb-2.5">
                    List Name <Text className="text-danger">*</Text>
                  </Text>
                  <TextInput
                    value={listName}
                    onChangeText={setListName}
                    placeholder="e.g., Weekly Groceries"
                    placeholderTextColor="#a3a3a3"
                    className="bg-neutral-50 rounded-2xl px-4 py-0"
                    style={{
                      height: 56,
                      fontSize: 16,
                      fontWeight: "500",
                      color: "#171717",
                      includeFontPadding: false,
                    }}
                    returnKeyType="next"
                    autoCapitalize="words"
                  />
                </View>

                <View className="mb-3">
                  <Text className="text-sm font-semibold text-neutral-700 mb-2.5">
                    Budget{" "}
                    <Text className="text-neutral-400 font-normal">
                      (Optional)
                    </Text>
                  </Text>
                  <TextInput
                    value={budget}
                    onChangeText={(text) =>
                      setBudget(text.replace(/[^0-9.]/g, ""))
                    }
                    placeholder="0.00"
                    placeholderTextColor="#a3a3a3"
                    className="bg-neutral-50 rounded-2xl px-4 py-0"
                    style={{
                      height: 56,
                      fontSize: 16,
                      fontWeight: "500",
                      color: "#171717",
                      includeFontPadding: false,
                    }}
                    keyboardType="decimal-pad"
                    returnKeyType="done"
                  />
                </View>
              </ScrollView>

              <View className="flex-row gap-3 mt-4">
                <TouchableOpacity
                  onPress={handleCancel}
                  className="flex-1 py-4 rounded-2xl bg-neutral-100 active:bg-neutral-200"
                >
                  <Text className="text-neutral-700 font-bold text-center text-base">
                    Cancel
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleCreateList}
                  disabled={isCreateDisabled}
                  className={`flex-1 py-4 rounded-2xl ${
                    isCreateDisabled
                      ? "bg-neutral-200"
                      : "bg-secondary-500 active:bg-secondary-600"
                  }`}
                >
                  <Text
                    className={`font-bold text-center text-base ${
                      isCreateDisabled ? "text-neutral-400" : "text-white"
                    }`}
                  >
                    Create List
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
