import React, {Fragment, JSX, PropsWithChildren} from 'react';
import {SvgFromUri} from 'react-native-svg';
import {VStack} from 'native-base';

import {MenuButtonDivider} from '@app/atoms';
import {SvgWithTitle} from '@app/components/atoms/buttons/svg-with-title/SvgWithTitle';
import {WorkXP} from '@app/types';

type MenuButtonGroupSvgProps = PropsWithChildren<{
  menuList: WorkXP[];
}>;
export const MenuButtonGroupSvg = ({
  menuList,
}: MenuButtonGroupSvgProps): JSX.Element => {
  return (
    <VStack mb={8}>
      {menuList.map((item, index) => {
        let roundedTop = index === 0 ? 8 : 0;
        let roundedBottom = index === menuList.length - 1 ? 8 : 0;
        return (
          <Fragment key={index}>
            <SvgWithTitle
              svg={
                <SvgFromUri
                  uri={item.logo}
                  height={
                    item.company.toLowerCase() === 'candide' ? '70%' : '100%'
                  }
                  width={
                    item.company.toLowerCase() === 'candide' ? '70%' : '100%'
                  }
                />
              }
              label={item.company}
              title={item.position}
              subtitle={`${item.start} - ${item.end}`}
              onPress={() => {}}
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
