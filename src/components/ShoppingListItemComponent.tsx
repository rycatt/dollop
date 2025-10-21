import { Check, Trash2 } from 'lucide-react-native';
import React from 'react';
import { Alert, Text, TouchableOpacity, View } from 'react-native';
import { ShoppingListItem } from '../types/shopping';

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
  const hasDiscount = item.originalPrice && item.originalPrice > item.price;

  return (
    <View className="flex-row items-center p-4 border-b border-gray-100">
      <TouchableOpacity
        onPress={() => onToggle(item.id)}
        className={`w-6 h-6 rounded-full border-2 mr-4 items-center justify-center ${
          item.isChecked ? 'bg-green-500 border-green-500' : 'border-gray-300'
        }`}
      >
        {item.isChecked ? <Check size={16} color="white" /> : null}
      </TouchableOpacity>

      <View className="flex-1">
        <Text
          className={`text-base font-medium ${
            item.isChecked ? 'text-gray-500 line-through' : 'text-gray-900'
          }`}
        >
          {item.name}
        </Text>
        <Text className="text-sm text-gray-500">
          {item.quantity} {item.unit}
        </Text>
        {item.store ? (
          <View className="flex-row items-center mt-1">
            <Text className="text-xs text-gray-400">{item.store.name}</Text>
          </View>
        ) : null}
      </View>

      <View className="items-end">
        <View className="flex-row items-center">
          {hasDiscount ? (
            <Text className="text-sm text-gray-400 line-through mr-2">
              ${item.originalPrice?.toFixed(2)}
            </Text>
          ) : null}
          <Text
            className={`text-base font-semibold ${
              hasDiscount ? 'text-green-600' : 'text-gray-900'
            }`}
          >
            ${item.price.toFixed(2)}
          </Text>
        </View>
        {hasDiscount ? (
          <Text className="text-xs text-green-600 font-medium">
            Save ${((item.originalPrice || 0) - item.price).toFixed(2)}
          </Text>
        ) : null}
      </View>

      <TouchableOpacity
        onPress={() =>
          Alert.alert('Delete Item', 'Are you sure you want to delete this item?', [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Delete',
              style: 'destructive',
              onPress: () => onDelete(item.id),
            },
          ])
        }
        className="ml-3 p-2"
      >
        <Trash2 size={18} color="#ef4444" />
      </TouchableOpacity>
    </View>
  );
}
