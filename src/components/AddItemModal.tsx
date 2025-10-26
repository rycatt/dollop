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

  const handleAddItem = () => {
    if (!itemName.trim()) return;

    const quantityNum = parseInt(quantity) || 1;
    onAddItem({
      name: itemName.trim(),
      quantity: quantityNum,
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

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View className="flex-1 bg-black/50 justify-center items-center">
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="w-full items-center justify-center"
        >
          <View className="bg-white rounded-2xl p-6 w-full max-w-sm mx-4">
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
                placeholder="Enter product name"
                placeholderTextColor="#6b7280"
                className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-base text-gray-900"
                returnKeyType="next"
                autoFocus
              />
            </View>

            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700 mb-2">
                Quantity
              </Text>
              <TextInput
                value={quantity}
                onChangeText={setQuantity}
                placeholder="1"
                placeholderTextColor="#6b7280"
                className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-base text-gray-900"
                keyboardType="numeric"
                returnKeyType="next"
              />
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
                className="flex-1 bg-gray-100 py-4 rounded-xl"
              >
                <Text className="text-gray-700 font-medium text-center">
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleAddItem}
                className="flex-1 bg-green-500 py-4 rounded-xl"
              >
                <Text className="text-white font-medium text-center">
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
