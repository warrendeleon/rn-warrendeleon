import React, { JSX, PropsWithChildren } from "react";
import {VStack} from 'native-base';
import {ButtonWithChevron, MenuButtonDivider} from '@app/atoms';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {faSliders} from '@fortawesome/free-solid-svg-icons';
import {useNavigation} from '@react-navigation/native';
import {useTranslation} from 'react-i18next';
import {MenuListItem} from '@app/models';

type MenuButtonGroupProps = PropsWithChildren<{
  menuList: MenuListItem[];
}>;
export const MenuButtonGroup = ({menuList}: MenuButtonGroupProps): JSX.Element => {
  return (
    <VStack p={4}>
      {menuList.map((button, index) => {
        let roundedTop = index === 0 ? 8 : 0;
        let roundedBottom = index === menuList.length - 1 ? 8 : 0;
        return (
          <>
            <ButtonWithChevron
              roundedTop={roundedTop}
              roundedBottom={roundedBottom}
              key={index}
              startIcon={
                <FontAwesomeIcon size={18} icon={button.icon} color={'white'} />
              }
              startIconBgColor={button.iconBgColor}
              onPress={button.onPress}
              label={button.label}
            />
            {index < menuList.length - 1 && <MenuButtonDivider />}
          </>
        );
      })}
    </VStack>
  );
};
