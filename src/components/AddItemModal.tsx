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
import { UnitOfMeasure } from "../constants/shopping";

interface AddItemModalProps {
  visible: boolean;
  onClose: () => void;
  onAddItem: (itemData: {
    name: string;
    quantity: number;
    unit: UnitOfMeasure;
  }) => void;
}

const UNITS: UnitOfMeasure[] = ["lb", "oz", "pieces", "pack"];

export function AddItemModal({
  visible,
  onClose,
  onAddItem,
}: AddItemModalProps) {
  const [itemName, setItemName] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [unit, setUnit] = useState<UnitOfMeasure>("pieces");
  const itemNameRef = useRef<TextInput>(null);

  useEffect(() => {
    if (visible) {
      setTimeout(() => {
        itemNameRef.current?.focus();
      }, 100);
    }
  }, [visible]);

  const handleQuantityChange = (value: string) => {
    const sanitized = value.replace(/[^0-9]/g, "");
    setQuantity(sanitized === "" ? "" : String(parseInt(sanitized, 10)));
  };

  const adjustQuantity = (delta: number) => {
    const next = Math.max(1, (parseInt(quantity, 10) || 0) + delta);
    setQuantity(String(next));
  };

  const handleAddItem = () => {
    const trimmedName = itemName.trim();
    const quantityValue = parseInt(quantity, 10);
    if (!trimmedName || !quantity || !Number.isInteger(quantityValue) || quantityValue < 1) {
      return;
    }

    onAddItem({
      name: trimmedName,
      quantity: Math.max(1, quantityValue),
      unit,
    });

    setItemName("");
    setQuantity("1");
    setUnit("pieces");
    onClose();
  };

  const handleCancel = () => {
    setItemName("");
    setQuantity("1");
    setUnit("pieces");
    onClose();
  };

  const isAddDisabled =
    !itemName.trim() ||
    !quantity ||
    Number.isNaN(parseInt(quantity, 10)) ||
    parseInt(quantity, 10) < 1;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View className="flex-1 bg-black/50 justify-center items-center">
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="w-full items-center justify-center"
        >
          <View className="bg-white rounded-3xl p-6 w-full max-w-sm mx-4 shadow-lg">
            <Text className="text-xl font-bold text-gray-900 mb-6 text-center">
              Add Item
            </Text>

            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700 mb-2">
                Product Name
              </Text>
              <TextInput
                ref={itemNameRef}
                value={itemName}
                onChangeText={setItemName}
                placeholder="e.g. Honeycrisp apples"
                placeholderTextColor="#9ca3af"
                className="bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-base text-gray-900"
                returnKeyType="next"
                autoFocus
              />
            </View>

            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700 mb-2">
                Quantity
              </Text>
              <View className="flex-row items-center bg-gray-50 border border-gray-200 rounded-2xl">
                <TouchableOpacity
                  onPress={() => adjustQuantity(-1)}
                  className="w-14 h-12 items-center justify-center"
                  accessibilityLabel="Decrease quantity"
                >
                  <Text className="text-xl text-gray-600">-</Text>
                </TouchableOpacity>
                <TextInput
                  value={quantity}
                  onChangeText={handleQuantityChange}
                  placeholder="1"
                  placeholderTextColor="#9ca3af"
                  className="flex-1 px-2 text-center text-lg text-gray-900"
                  keyboardType="number-pad"
                  returnKeyType="next"
                />
                <TouchableOpacity
                  onPress={() => adjustQuantity(1)}
                  className="w-14 h-12 items-center justify-center"
                  accessibilityLabel="Increase quantity"
                >
                  <Text className="text-xl text-gray-600">+</Text>
                </TouchableOpacity>
              </View>
              <Text className="text-xs text-gray-500 mt-1">
                Whole numbers only — minimum of 1 item.
              </Text>
            </View>

            <View className="mb-6">
              <Text className="text-sm font-medium text-gray-700 mb-2">
                Unit of Measure
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {UNITS.map((unitOption) => (
                  <TouchableOpacity
                    key={unitOption}
                    onPress={() => setUnit(unitOption)}
                    className={`px-4 py-2 rounded-lg border ${
                      unit === unitOption
                        ? "bg-green-100 border-green-500"
                        : "bg-gray-50 border-gray-200"
                    }`}
                  >
                    <Text
                      className={`text-sm font-medium ${
                        unit === unitOption ? "text-green-700" : "text-gray-700"
                      }`}
                    >
                      {unitOption}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={handleCancel}
                className="flex-1 bg-gray-100 py-4 rounded-2xl"
              >
                <Text className="text-gray-700 font-medium text-center">
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleAddItem}
                disabled={isAddDisabled}
                className={`flex-1 py-4 rounded-2xl ${
                  isAddDisabled ? "bg-green-300" : "bg-green-500"
                }`}
                activeOpacity={isAddDisabled ? 1 : 0.7}
              >
                <Text
                  className={`font-medium text-center ${
                    isAddDisabled ? "text-white/70" : "text-white"
                  }`}
                >
                  Add Item
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}
