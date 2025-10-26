import DateTimePicker from "@react-native-community/datetimepicker";
import { format } from "date-fns";
import { Calendar, X } from "lucide-react-native";
import React, { useState } from "react";
import {
  Modal,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface AddPantryItemModalProps {
  visible: boolean;
  onClose: () => void;
  onAddItem: (itemData: {
    name: string;
    quantity: number;
    emoji: string;
    storageLocation: "Fridge" | "Freezer" | "Pantry";
    expirationDate?: string;
    notes?: string;
  }) => void;
}

const STORAGE_LOCATIONS = ["Fridge", "Freezer", "Pantry"] as const;

export function AddPantryItemModal({
  visible,
  onClose,
  onAddItem,
}: AddPantryItemModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    quantity: "",
    emoji: "📦",
    storageLocation: "Fridge" as "Fridge" | "Freezer" | "Pantry",
    expirationDate: "",
    notes: "",
  });

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const handleAddItem = () => {
    if (!formData.name.trim() || !formData.quantity) {
      return;
    }

    onAddItem({
      name: formData.name.trim(),
      quantity: parseFloat(formData.quantity),
      emoji: formData.emoji,
      storageLocation: formData.storageLocation,
      expirationDate: formData.expirationDate.trim() || undefined,
      notes: formData.notes.trim() || undefined,
    });

    // Reset form
    setFormData({
      name: "",
      quantity: "",
      emoji: "📦",
      storageLocation: "Fridge",
      expirationDate: "",
      notes: "",
    });
    onClose();
  };

  const handleCancel = () => {
    setFormData({
      name: "",
      quantity: "",
      emoji: "📦",
      storageLocation: "Fridge",
      expirationDate: "",
      notes: "",
    });
    setShowDatePicker(false);
    setSelectedDate(new Date());
    onClose();
  };

  const handleDateChange = (_event: any, date?: Date) => {
    if (Platform.OS === "android") {
      setShowDatePicker(false);
    }
    if (date) {
      setSelectedDate(date);
      if (Platform.OS === "android") {
        const formatted = format(date, "MM/dd/yyyy");
        setFormData({ ...formData, expirationDate: formatted });
      }
    }
  };

  const handleDateSelect = () => {
    const formatted = format(selectedDate, "MM/dd/yyyy");
    setFormData({ ...formData, expirationDate: formatted });
    setShowDatePicker(false);
  };

  const handleClearDate = () => {
    setFormData({ ...formData, expirationDate: "" });
    setSelectedDate(new Date());
    setShowDatePicker(false);
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View className="flex-1 bg-black/50 justify-center items-center p-4">
        <View className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-lg">
          <View className="flex-row items-center justify-between mb-6">
            <Text className="text-xl font-bold text-gray-900">
              Add new item
            </Text>
            <TouchableOpacity onPress={handleCancel} className="p-1">
              <X size={20} color="#6b7280" />
            </TouchableOpacity>
          </View>

          <ScrollView
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            style={{ maxHeight: 400 }}
          >
            <View className="w-full items-center">
              <View className="w-24 h-24 bg-gray-100 rounded-2xl flex items-center justify-center mb-2 overflow-hidden">
                <Text className="text-6xl leading-[0px] mt-0">
                  {formData.emoji || "📦"}
                </Text>
              </View>
            </View>
            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700 mb-2">
                Item Details <Text className="text-red-500">*</Text>
              </Text>
              <View className="flex-row items-center w-full">
                <View className="flex-1 mr-2">
                  <TextInput
                    className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-base text-gray-900"
                    placeholder="Enter item name"
                    placeholderTextColor="#6b7280"
                    value={formData.name}
                    onChangeText={(text) =>
                      setFormData({ ...formData, name: text })
                    }
                    autoCapitalize="words"
                    autoCorrect={false}
                    returnKeyType="next"
                  />
                </View>
                <View className="w-16">
                  <TextInput
                    className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-center text-base text-gray-900"
                    placeholder=""
                    placeholderTextColor="#6b7280"
                    value={formData.emoji}
                    onChangeText={(text) =>
                      setFormData({ ...formData, emoji: text })
                    }
                    maxLength={2}
                  />
                </View>
              </View>
            </View>

            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700 mb-2">
                Quantity <Text className="text-red-500">*</Text>
              </Text>
              <TextInput
                className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-base text-gray-900"
                placeholder="0"
                placeholderTextColor="#6b7280"
                value={formData.quantity}
                onChangeText={(text) =>
                  setFormData({ ...formData, quantity: text })
                }
                keyboardType="numeric"
              />
            </View>

            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700 mb-2">
                Storage Location
              </Text>
              <View className="flex-row">
                {STORAGE_LOCATIONS.map((location) => (
                  <TouchableOpacity
                    key={location}
                    onPress={() =>
                      setFormData({
                        ...formData,
                        storageLocation: location,
                      })
                    }
                    className={`flex-1 px-4 py-3 rounded-xl mr-2 ${
                      formData.storageLocation === location
                        ? "bg-primary-500"
                        : "bg-gray-200"
                    }`}
                  >
                    <Text
                      className={`text-center font-medium ${
                        formData.storageLocation === location
                          ? "text-white"
                          : "text-gray-700"
                      }`}
                    >
                      {location}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700 mb-2">
                Expiration Date{" "}
                <Text className="text-gray-400">(Optional)</Text>
              </Text>
              <TouchableOpacity
                onPress={() => setShowDatePicker(!showDatePicker)}
                className="bg-gray-50 border border-gray-200 rounded-xl p-4 flex-row items-center justify-between"
              >
                <Text
                  className={`text-base ${
                    formData.expirationDate ? "text-gray-900" : "text-gray-400"
                  }`}
                >
                  {formData.expirationDate || "Select date"}
                </Text>
                <Calendar size={20} color="#6b7280" />
              </TouchableOpacity>

              {showDatePicker && Platform.OS === "ios" && (
                <View className="mt-4 bg-gray-50 rounded-xl p-3 border border-gray-200 items-center">
                  <View
                    style={{
                      height: 160,
                      overflow: "hidden",
                      transform: [{ scaleX: 0.85 }, { scaleY: 0.85 }],
                    }}
                  >
                    <DateTimePicker
                      value={selectedDate}
                      mode="date"
                      display="spinner"
                      onChange={handleDateChange}
                      textColor="#000000"
                    />
                  </View>
                  <View className="flex-row gap-2 mt-2 w-full">
                    <TouchableOpacity
                      onPress={handleClearDate}
                      className="flex-1 py-2.5 rounded-xl border border-gray-300"
                    >
                      <Text className="text-gray-700 font-medium text-center">
                        Clear
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={handleDateSelect}
                      className="flex-1 bg-primary-500 py-2.5 rounded-xl"
                    >
                      <Text className="text-white font-medium text-center">
                        Select
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {showDatePicker && Platform.OS === "android" && (
                <DateTimePicker
                  value={selectedDate}
                  mode="date"
                  display="default"
                  onChange={handleDateChange}
                />
              )}
            </View>

            <View className="mb-6">
              <Text className="text-sm font-medium text-gray-700 mb-2">
                Note <Text className="text-gray-400">(Optional)</Text>
              </Text>
              <TextInput
                className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-base text-gray-900"
                placeholder="Add notes..."
                placeholderTextColor="#6b7280"
                value={formData.notes}
                onChangeText={(text) =>
                  setFormData({ ...formData, notes: text })
                }
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>
          </ScrollView>

          <View className="flex-row gap-3 mt-6">
            <TouchableOpacity
              onPress={handleCancel}
              className="flex-1 py-4 rounded-xl"
            >
              <Text className="text-gray-700 font-medium text-center">
                Cancel
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleAddItem}
              className="flex-1 bg-primary-500 py-4 rounded-xl"
            >
              <Text className="text-white font-medium text-center">
                Add item
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
