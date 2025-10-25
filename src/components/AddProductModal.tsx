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
import { UnitOfMeasure } from "../types/shopping";

interface AddItemModalProps {
  visible: boolean;
  onClose: () => void;
  onAddItem: (itemData: {
    name: string;
    quantity: number;
    unit: UnitOfMeasure;
    price?: number;
  }) => void;
  requireManualPrice?: boolean;
}

const UNITS: UnitOfMeasure[] = ["lb", "oz", "pieces", "pack"];

export function AddProductModal({
  visible,
  onClose,
  onAddItem,
  requireManualPrice = false,
}: AddItemModalProps) {
  const [itemName, setItemName] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [unit, setUnit] = useState<UnitOfMeasure>("pieces");
  const [price, setPrice] = useState("");
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
    if (requireManualPrice && !price.trim()) return;

    const quantityNum = parseInt(quantity) || 1;
    const priceNum = price.trim() ? parseFloat(price) : undefined;

    if (
      requireManualPrice &&
      priceNum !== undefined &&
      (isNaN(priceNum) || priceNum < 0)
    ) {
      return;
    }

    onAddItem({
      name: itemName.trim(),
      quantity: quantityNum,
      unit,
      price: priceNum,
    });

    setItemName("");
    setQuantity("1");
    setUnit("pieces");
    setPrice("");
    onClose();
  };

  const handleCancel = () => {
    setItemName("");
    setQuantity("1");
    setUnit("pieces");
    setPrice("");
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View className="flex-1 bg-black/50 justify-center items-center">
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="w-full items-center justify-center"
        >
          <View className="bg-white rounded-3xl p-6 w-full max-w-sm mx-4">
            <Text className="text-xl font-bold text-neutral-900 mb-6 text-center">
              Add Product
            </Text>

            <View className="mb-4">
              <Text className="text-sm font-semibold text-neutral-700 mb-2">
                Product Name
              </Text>
              <TextInput
                ref={itemNameRef}
                value={itemName}
                onChangeText={setItemName}
                placeholder="Enter product name"
                placeholderTextColor="#A3A3A3"
                className="bg-neutral-50 border border-neutral-200 rounded-2xl p-4 text-base text-neutral-900"
                returnKeyType="next"
                autoFocus
              />
            </View>

            <View className="mb-4">
              <Text className="text-sm font-semibold text-neutral-700 mb-2">
                Quantity
              </Text>
              <TextInput
                value={quantity}
                onChangeText={setQuantity}
                placeholder="1"
                placeholderTextColor="#A3A3A3"
                className="bg-neutral-50 border border-neutral-200 rounded-2xl p-4 text-base text-neutral-900"
                keyboardType="numeric"
                returnKeyType="next"
              />
            </View>

            {requireManualPrice && (
              <View className="mb-4">
                <Text className="text-sm font-semibold text-neutral-700 mb-2">
                  Price
                </Text>
                <TextInput
                  value={price}
                  onChangeText={setPrice}
                  placeholder="0.00"
                  placeholderTextColor="#A3A3A3"
                  className="bg-neutral-50 border border-neutral-200 rounded-2xl p-4 text-base text-neutral-900"
                  keyboardType="decimal-pad"
                  returnKeyType="next"
                />
              </View>
            )}

            <View className="mb-6">
              <Text className="text-sm font-semibold text-neutral-700 mb-2">
                Unit of Measure
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {UNITS.map((unitOption) => (
                  <TouchableOpacity
                    key={unitOption}
                    onPress={() => setUnit(unitOption)}
                    className={`px-4 py-2 rounded-xl border ${
                      unit === unitOption
                        ? "bg-primary-100 border-primary-500"
                        : "bg-neutral-50 border-neutral-200"
                    }`}
                  >
                    <Text
                      className={`text-sm font-semibold ${
                        unit === unitOption
                          ? "text-primary-700"
                          : "text-neutral-700"
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
                className="flex-1 border border-neutral-200 py-4 rounded-2xl"
              >
                <Text className="text-neutral-700 font-semibold text-center">
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleAddItem}
                className="flex-1 bg-primary-500 py-4 rounded-2xl"
              >
                <Text className="text-white font-semibold text-center">
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
