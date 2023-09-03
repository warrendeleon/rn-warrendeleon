import React, {JSX} from 'react';
import {SvgFromUri} from 'react-native-svg';
import {useSelector} from 'react-redux';
import {ScrollView} from 'native-base';

import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';

import {MenuButtonGroupSvg} from '@app/components/molecules/menu-button-group-svg/MenuButtonGroupSvg';
import {educationSelector} from '@app/modules';
import {RootStackParamList, ScreenNames} from '@app/navigators';
import {Education as EducationType, MenuListItemSvg} from '@app/types';

export const Education = (): JSX.Element => {
  const navigation =
    useNavigation<
      NativeStackNavigationProp<RootStackParamList, ScreenNames.EDUCATION>
    >();
  const education = useSelector(educationSelector);
  const menuList: MenuListItemSvg[] = education.map((ed: EducationType) => {
    return {
      end: ed.end,
      onPressItem: () => {
        if (ed.certificate) {
          navigation.navigate(ScreenNames.WEBVIEW, {
            title: ed.title,
            uri: ed.certificate,
          });
        }
      },
      start: ed.start,
      svg: <SvgFromUri uri={ed.logo} width={'100%'} height={'100%'} />,
      title: ed.title,
    };
  });

  return (
    <ScrollView flex={1} padding={4}>
      <MenuButtonGroupSvg menuList={menuList} />
    </ScrollView>
  );
};
