import { X } from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
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
import { UnitOfMeasure } from "../constants/shopping";

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

  const isAddDisabled =
    !itemName.trim() || (requireManualPrice && !price.trim());

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
                  Add Product
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
                    Product Name <Text className="text-danger">*</Text>
                  </Text>
                  <TextInput
                    ref={itemNameRef}
                    value={itemName}
                    onChangeText={setItemName}
                    placeholder="e.g., Bananas, Orange Juice"
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

                <View className="mb-5">
                  <Text className="text-sm font-semibold text-neutral-700 mb-2.5">
                    Quantity <Text className="text-danger">*</Text>
                  </Text>
                  <View
                    className="flex-row items-center bg-neutral-50 rounded-2xl overflow-hidden"
                    style={{ height: 56 }}
                  >
                    <TouchableOpacity
                      onPress={() =>
                        setQuantity(String(Math.max(1, parseInt(quantity) - 1)))
                      }
                      className="w-14 h-full items-center justify-center active:bg-neutral-100"
                    >
                      <Text className="text-2xl text-neutral-600 font-light">
                        −
                      </Text>
                    </TouchableOpacity>
                    <TextInput
                      value={quantity}
                      onChangeText={(text) =>
                        setQuantity(text.replace(/[^0-9]/g, ""))
                      }
                      placeholder="1"
                      placeholderTextColor="#a3a3a3"
                      className="flex-1 py-0"
                      style={{
                        fontSize: 18,
                        fontWeight: "700",
                        color: "#171717",
                        textAlign: "center",
                        includeFontPadding: false,
                      }}
                      keyboardType="number-pad"
                      returnKeyType="next"
                    />
                    <TouchableOpacity
                      onPress={() =>
                        setQuantity(String((parseInt(quantity) || 0) + 1))
                      }
                      className="w-14 h-full items-center justify-center active:bg-neutral-100"
                    >
                      <Text className="text-2xl text-neutral-600 font-light">
                        +
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <View className="mb-5">
                  <Text className="text-sm font-semibold text-neutral-700 mb-2.5">
                    Unit of Measure
                  </Text>
                  <View className="flex-row gap-2.5">
                    {UNITS.map((unitOption) => (
                      <TouchableOpacity
                        key={unitOption}
                        onPress={() => setUnit(unitOption)}
                        className={`flex-1 py-3.5 rounded-2xl ${
                          unit === unitOption
                            ? "bg-secondary-500"
                            : "bg-neutral-50"
                        }`}
                      >
                        <Text
                          className={`text-center font-bold text-sm ${
                            unit === unitOption
                              ? "text-white"
                              : "text-neutral-600"
                          }`}
                        >
                          {unitOption}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {requireManualPrice && (
                  <View className="mb-3">
                    <Text className="text-sm font-semibold text-neutral-700 mb-2.5">
                      Price <Text className="text-danger">*</Text>
                    </Text>
                    <TextInput
                      value={price}
                      onChangeText={setPrice}
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
                )}
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
                  onPress={handleAddItem}
                  disabled={isAddDisabled}
                  className={`flex-1 py-4 rounded-2xl ${
                    isAddDisabled
                      ? "bg-neutral-200"
                      : "bg-secondary-500 active:bg-secondary-600"
                  }`}
                >
                  <Text
                    className={`font-bold text-center text-base ${
                      isAddDisabled ? "text-neutral-400" : "text-white"
                    }`}
                  >
                    Add Product
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
