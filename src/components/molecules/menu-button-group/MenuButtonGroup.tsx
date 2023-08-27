import React, {Fragment, JSX, PropsWithChildren} from 'react';
import {VStack} from 'native-base';

import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';

import {ButtonWithChevron, MenuButtonDivider} from '@app/atoms';
import {MenuListItem} from '@app/types';

type MenuButtonGroupProps = PropsWithChildren<{
  menuList: MenuListItem[];
}>;
export const MenuButtonGroup = ({
  menuList,
}: MenuButtonGroupProps): JSX.Element => {
  return (
    <VStack>
      {menuList.map((button, index) => {
        let roundedTop = index === 0 ? 8 : 0;
        let roundedBottom = index === menuList.length - 1 ? 8 : 0;
        return (
          <Fragment key={index}>
            <ButtonWithChevron
              roundedTop={roundedTop}
              roundedBottom={roundedBottom}
              startIcon={
                <FontAwesomeIcon size={18} icon={button.icon} color={'white'} />
              }
              startIconBgColor={button.iconBgColor}
              onPress={button.onPress}
              label={button.label}
            />
            {index < menuList.length - 1 && <MenuButtonDivider />}
          </Fragment>
        );
      })}
    </VStack>
  );
};
