import { Text, View } from 'react-native';

export type StatusType = 'success' | 'warning' | 'danger';

interface ExpiryCardProps {
  name: string;
  daysLeft: number;
  status: StatusType;
}

export const ExpiryCard = ({ name, daysLeft, status }: ExpiryCardProps) => {
  const statusColors = {
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    danger: 'bg-red-100 text-red-800',
  };

  return (
    <View className={`px-4 py-3 rounded-2xl mr-3 ${statusColors[status].split(' ')[0]}`}>
      <Text className={statusColors[status].split(' ')[1]}>{name}</Text>
      <Text className={`${statusColors[status].split(' ')[1]} font-bold`}>
        {daysLeft} days left
      </Text>
    </View>
  );
};
