import { Check, Trash2 } from "lucide-react-native";
import React from "react";
import { Alert, Text, TouchableOpacity, View } from "react-native";
import { ShoppingListItem } from "../constants/shopping";

interface ShoppingListItemComponentProps {
  item: ShoppingListItem;
  onToggle: (itemId: string) => void;
  onDelete: (itemId: string) => void;
}

export function ShoppingListItemComponent({
  item,
  onToggle,
  onDelete,
}: ShoppingListItemComponentProps) {
  return (
    <View className="flex-row items-center p-4 border-b border-neutral-100">
      <TouchableOpacity
        onPress={() => onToggle(item.id)}
        className={`w-6 h-6 rounded-full border-2 mr-4 items-center justify-center ${
          item.isChecked
            ? "bg-primary-500 border-primary-500"
            : "border-neutral-300"
        }`}
      >
        {item.isChecked ? <Check size={16} color="white" /> : null}
      </TouchableOpacity>

      <View className="flex-1">
        <Text
          className={`text-base font-semibold ${
            item.isChecked
              ? "text-neutral-400 line-through"
              : "text-neutral-900"
          }`}
        >
          {item.name}
        </Text>
        <Text className="text-sm text-neutral-500 mt-0.5">
          {item.quantity} {item.unit}
        </Text>
        {item.store ? (
          <View className="flex-row items-center mt-1">
            <Text className="text-xs text-neutral-400">{item.store.name}</Text>
          </View>
        ) : null}
      </View>

      <View className="items-end">
        <Text className="text-base font-bold text-primary-600">
          ${item.price.toFixed(2)}
        </Text>
      </View>

      <TouchableOpacity
        onPress={() =>
          Alert.alert(
            "Delete Item",
            "Are you sure you want to delete this item?",
            [
              { text: "Cancel", style: "cancel" },
              {
                text: "Delete",
                style: "destructive",
                onPress: () => onDelete(item.id),
              },
            ],
          )
        }
        className="ml-3 p-2"
      >
        <Trash2 size={18} color="#ef4444" />
      </TouchableOpacity>
    </View>
  );
}
