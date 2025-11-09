// src/features/home/components/ViewProfileButton.tsx
import React from 'react';
import { Button, ButtonText } from '@gluestack-ui/themed';

type ViewProfileButtonProps = {
  label?: string;
  onPress?: () => void;
};

export const ViewProfileButton: React.FC<ViewProfileButtonProps> = ({
  label = 'View profile',
  onPress,
}) => {
  return (
    <Button size="md" variant="solid" borderRadius="$full" className="w-full" onPress={onPress}>
      <ButtonText fontWeight="$semibold">{label}</ButtonText>
    </Button>
  );
};
