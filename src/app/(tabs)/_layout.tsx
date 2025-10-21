import { Tabs } from 'expo-router';
import { Home, Refrigerator, ShoppingCart, TrendingUp } from 'lucide-react-native';
import React from 'react';

export default function TabLayout() {
  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: 'green' }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          headerShown: false,
          tabBarIcon: ({ color }) => <Home color={color} />,
        }}
      />
      <Tabs.Screen
        name="pantry"
        options={{
          title: 'Pantry',
          headerShown: false,
          tabBarIcon: ({ color }) => <Refrigerator color={color} />,
        }}
      />
      <Tabs.Screen
        name="list"
        options={{
          title: 'List',
          headerShown: false,
          tabBarIcon: ({ color }) => <ShoppingCart color={color} />,
        }}
      />
      <Tabs.Screen
        name="analytics"
        options={{
          title: 'Analytics',
          headerShown: false,
          tabBarIcon: ({ color }) => <TrendingUp color={color} />,
        }}
      />
    </Tabs>
  );
}
