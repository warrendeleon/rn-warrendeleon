import React, {Fragment, JSX, PropsWithChildren} from 'react';
import {VStack} from 'native-base';

import {MenuButtonDivider, SvgWithTitle} from '@app/atoms';
import {MenuListItemSvg} from '@app/types';

type MenuButtonGroupSvgProps = PropsWithChildren<{
  menuList: MenuListItemSvg[];
}>;

export const MenuButtonGroupSvg = ({
  menuList,
}: MenuButtonGroupSvgProps): JSX.Element => {
  return (
    <VStack mb={8} flex={1}>
      {menuList.map((item, index) => {
        let roundedTop = index === 0 ? 8 : 0;
        let roundedBottom = index === menuList.length - 1 ? 8 : 0;
        const subtitle = !item.end ? item.start : `${item.start} - ${item.end}`;
        return (
          <Fragment key={index}>
            <SvgWithTitle
              svg={item.svg}
              label={item.label}
              title={item.title}
              subtitle={subtitle}
              onPress={item.onPressItem}
              badge={item.badge}
              roundedTop={roundedTop}
              roundedBottom={roundedBottom}
            />
            {index < menuList.length - 1 && (
              <MenuButtonDivider paddingLeftWidth={16} />
            )}
          </Fragment>
        );
      })}
    </VStack>
  );
};
