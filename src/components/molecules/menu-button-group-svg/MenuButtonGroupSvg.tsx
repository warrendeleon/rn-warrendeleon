import React, {Fragment, JSX, PropsWithChildren, useCallback} from 'react';
import {SvgFromUri} from 'react-native-svg';
import {VStack} from 'native-base';

import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';

import {MenuButtonDivider} from '@app/atoms';
import {SvgWithTitle} from '@app/components/atoms/buttons/svg-with-title/SvgWithTitle';
import {RootStackParamList, ScreenNames} from '@app/navigators';
import {WorkXP} from '@app/types';
import {Client} from '@app/types/workXP';

type MenuButtonGroupSvgProps = PropsWithChildren<{
  menuList: WorkXP[] | Client[];
}>;
export const MenuButtonGroupSvg = ({
  menuList,
}: MenuButtonGroupSvgProps): JSX.Element => {
  const navigation =
    useNavigation<
      NativeStackNavigationProp<RootStackParamList, ScreenNames.WORK_XP>
    >();
  const onPress = useCallback(
    (item: WorkXP | Client) => () => {
      const isWorkXP = Object.keys(item).includes('clients');
      if (!isWorkXP) {
        navigation.push(ScreenNames.WORK_XP_DETAILS, {workXPId: item.id});
      }

      const xp = item as WorkXP;
      const workXPHasClients = xp.clients?.length > 0;

      if (workXPHasClients) {
        navigation.push(ScreenNames.WORK_XP, {workXPId: item.id});
      }
    },
    [navigation],
  );
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
              onPress={onPress(item)}
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
