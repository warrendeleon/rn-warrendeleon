import React from 'react';
import {BlurView as RNBlurView} from '@react-native-community/blur';
import {
  Factory,
  Heading,
  PresenceTransition,
  Pressable,
  useColorModeValue,
  VStack,
  ZStack,
} from 'native-base';

interface BlurredModalBGProps {
  children: string | JSX.Element | JSX.Element[] | undefined;
  goBack: () => void;
  title: string;
}

export const BlurredModalBG: React.FC<BlurredModalBGProps> = ({
  children,
  goBack,
  title,
}) => {
  const BlurView = Factory(RNBlurView);
  const [isOpen, setIsOpen] = React.useState(true);
  const [isBGOpen, setBGIsOpen] = React.useState(true);

  return (
    <PresenceTransition
      visible={isBGOpen}
      initial={{
        opacity: 0,
      }}
      animate={{
        opacity: 1,
        transition: {
          duration: 500,
        },
      }}>
      <BlurView blurType="light" size="full">
        <ZStack flex={1} alignItems="center" justifyContent="center">
          <Pressable
            size="full"
            onPress={() => {
              setIsOpen(false);
              setTimeout(() => setBGIsOpen(false), 100);
              setTimeout(goBack, 500);
            }}
          />
          <VStack>
            <PresenceTransition
              visible={isOpen}
              initial={{
                opacity: 0,
              }}
              animate={{
                opacity: 1,
                transition: {
                  duration: 250,
                },
              }}>
              <Heading
                textAlign={'center'}
                marginBottom={2}
                size={'xl'}
                shadow={9}>
                {title}
              </Heading>
            </PresenceTransition>
            <PresenceTransition
              visible={isOpen}
              initial={{
                opacity: 0,
                scale: 0,
              }}
              animate={{
                opacity: 1,
                scale: 1,
                transition: {
                  duration: 300,
                },
              }}>
              <BlurView
                blurType={useColorModeValue('xlight', 'dark')}
                borderRadius={'2xl'}
                size={72}>
                {children}
              </BlurView>
            </PresenceTransition>
          </VStack>
        </ZStack>
      </BlurView>
    </PresenceTransition>
  );
};
