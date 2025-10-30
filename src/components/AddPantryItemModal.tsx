import DateTimePicker from "@react-native-community/datetimepicker";
import { format } from "date-fns";
import { Calendar, X } from "lucide-react-native";
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
const DEFAULT_EMOJI = "🍎";

export function AddPantryItemModal({
  visible,
  onClose,
  onAddItem,
}: AddPantryItemModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    quantity: "1",
    emoji: DEFAULT_EMOJI,
    storageLocation: "Fridge" as "Fridge" | "Freezer" | "Pantry",
    expirationDate: "",
    notes: "",
  });

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const handleAddItem = () => {
    const trimmedName = formData.name.trim();
    const quantityValue = parseInt(formData.quantity, 10);

    if (!trimmedName || Number.isNaN(quantityValue) || quantityValue < 1) {
      return;
    }

    onAddItem({
      name: trimmedName,
      quantity: quantityValue,
      emoji: formData.emoji || DEFAULT_EMOJI,
      storageLocation: formData.storageLocation,
      expirationDate: formData.expirationDate.trim() || undefined,
      notes: formData.notes.trim() || undefined,
    });

    setFormData({
      name: "",
      quantity: "1",
      emoji: DEFAULT_EMOJI,
      storageLocation: "Fridge",
      expirationDate: "",
      notes: "",
    });
    onClose();
  };

  const handleCancel = () => {
    setFormData({
      name: "",
      quantity: "1",
      emoji: DEFAULT_EMOJI,
      storageLocation: "Fridge",
      expirationDate: "",
      notes: "",
    });
    setShowDatePicker(false);
    setSelectedDate(new Date());
    onClose();
  };

  const handleQuantityChange = (text: string) => {
    const sanitized = text.replace(/[^0-9]/g, "");
    setFormData((prev) => ({
      ...prev,
      quantity: sanitized,
    }));
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

  const quantityValue = parseInt(formData.quantity, 10);
  const isAddDisabled =
    !formData.name.trim() ||
    !formData.quantity ||
    Number.isNaN(quantityValue) ||
    quantityValue < 1;

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
                  Add Item
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
                style={{ maxHeight: 520 }}
                contentContainerStyle={{ paddingBottom: 8 }}
              >
                <View className="items-center mb-8">
                  <Text className="text-7xl mb-2" style={{ minHeight: 72 }}>
                    {formData.emoji || ""}
                  </Text>
                </View>

                <View className="mb-5">
                  <Text className="text-sm font-semibold text-neutral-700 mb-2.5">
                    Item Name <Text className="text-danger">*</Text>
                  </Text>
                  <View className="flex-row items-center gap-2.5">
                    <TextInput
                      className="flex-1 bg-neutral-50 rounded-2xl"
                      style={{
                        height: 56,
                        paddingHorizontal: 16,
                        paddingVertical: 0,
                        fontSize: 16,
                        fontWeight: "500",
                        color: "#171717",
                        includeFontPadding: false,
                      }}
                      placeholder="e.g., Apples, Milk, Eggs"
                      placeholderTextColor="#a3a3a3"
                      value={formData.name}
                      onChangeText={(text) =>
                        setFormData((prev) => ({ ...prev, name: text }))
                      }
                      autoCapitalize="words"
                      autoCorrect={false}
                      returnKeyType="next"
                    />
                    <TextInput
                      className="bg-neutral-50 rounded-2xl"
                      style={{
                        width: 56,
                        height: 56,
                        paddingVertical: 0,
                        fontSize: 30,
                        textAlign: "center",
                        includeFontPadding: false,
                      }}
                      placeholder=""
                      placeholderTextColor="#d4d4d4"
                      value={formData.emoji}
                      onChangeText={(text) =>
                        setFormData((prev) => ({ ...prev, emoji: text }))
                      }
                      maxLength={2}
                    />
                  </View>
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
                        setFormData((prev) => ({
                          ...prev,
                          quantity: String(
                            Math.max(1, (parseInt(prev.quantity, 10) || 1) - 1),
                          ),
                        }))
                      }
                      className="w-14 h-full items-center justify-center active:bg-neutral-100"
                    >
                      <Text className="text-2xl text-neutral-600 font-light">
                        −
                      </Text>
                    </TouchableOpacity>
                    <TextInput
                      className="flex-1"
                      style={{
                        paddingVertical: 0,
                        fontSize: 18,
                        fontWeight: "700",
                        color: "#171717",
                        textAlign: "center",
                        includeFontPadding: false,
                      }}
                      placeholder="1"
                      placeholderTextColor="#a3a3a3"
                      value={formData.quantity}
                      onChangeText={handleQuantityChange}
                      keyboardType="number-pad"
                      returnKeyType="done"
                    />
                    <TouchableOpacity
                      onPress={() =>
                        setFormData((prev) => ({
                          ...prev,
                          quantity: String(
                            (parseInt(prev.quantity, 10) || 0) + 1,
                          ),
                        }))
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
                    Storage Location
                  </Text>
                  <View className="flex-row gap-2.5">
                    {STORAGE_LOCATIONS.map((location) => (
                      <TouchableOpacity
                        key={location}
                        onPress={() =>
                          setFormData({
                            ...formData,
                            storageLocation: location,
                          })
                        }
                        className={`flex-1 py-3.5 rounded-2xl ${
                          formData.storageLocation === location
                            ? "bg-primary-500"
                            : "bg-neutral-50"
                        }`}
                      >
                        <Text
                          className={`text-center font-bold text-sm ${
                            formData.storageLocation === location
                              ? "text-white"
                              : "text-neutral-600"
                          }`}
                        >
                          {location}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <View className="mb-5">
                  <Text className="text-sm font-semibold text-neutral-700 mb-2.5">
                    Expiration Date{" "}
                    <Text className="text-neutral-400 font-normal">
                      (Optional)
                    </Text>
                  </Text>
                  <TouchableOpacity
                    onPress={() => setShowDatePicker(!showDatePicker)}
                    className="bg-neutral-50 rounded-2xl px-4 flex-row items-center justify-between"
                    style={{ height: 56 }}
                  >
                    <Text
                      className={`text-base font-medium ${
                        formData.expirationDate
                          ? "text-neutral-900"
                          : "text-neutral-400"
                      }`}
                    >
                      {formData.expirationDate || "Select date"}
                    </Text>
                    <Calendar size={20} color="#737373" />
                  </TouchableOpacity>

                  {showDatePicker && Platform.OS === "ios" && (
                    <View className="mt-3 bg-neutral-50 rounded-2xl p-4">
                      <View
                        style={{
                          height: 160,
                          overflow: "hidden",
                          transform: [{ scaleX: 0.9 }, { scaleY: 0.9 }],
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
                      <View className="flex-row gap-2.5 mt-3">
                        <TouchableOpacity
                          onPress={handleClearDate}
                          className="flex-1 py-3 rounded-xl bg-white active:bg-neutral-100"
                        >
                          <Text className="text-neutral-700 font-bold text-center">
                            Clear
                          </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={handleDateSelect}
                          className="flex-1 bg-primary-500 py-3 rounded-xl active:bg-primary-600"
                        >
                          <Text className="text-white font-bold text-center">
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

                <View className="mb-3">
                  <Text className="text-sm font-semibold text-neutral-700 mb-2.5">
                    Notes{" "}
                    <Text className="text-neutral-400 font-normal">
                      (Optional)
                    </Text>
                  </Text>
                  <TextInput
                    className="bg-neutral-50 rounded-2xl"
                    style={{
                      minHeight: 90,
                      paddingHorizontal: 16,
                      paddingTop: 14,
                      paddingBottom: 14,
                      fontSize: 16,
                      fontWeight: "500",
                      color: "#171717",
                      textAlignVertical: "top",
                      includeFontPadding: false,
                    }}
                    placeholder="Add any notes about this item..."
                    placeholderTextColor="#a3a3a3"
                    value={formData.notes}
                    onChangeText={(text) =>
                      setFormData({ ...formData, notes: text })
                    }
                    multiline
                    numberOfLines={3}
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
                  onPress={handleAddItem}
                  disabled={isAddDisabled}
                  className={`flex-1 py-4 rounded-2xl ${
                    isAddDisabled
                      ? "bg-neutral-200"
                      : "bg-primary-500 active:bg-primary-600"
                  }`}
                >
                  <Text
                    className={`font-bold text-center text-base ${
                      isAddDisabled ? "text-neutral-400" : "text-white"
                    }`}
                  >
                    Add Item
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
