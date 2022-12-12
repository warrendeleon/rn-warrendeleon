import {fireEvent} from '@testing-library/react-native';
import React from 'react';
import {ListItem} from '../index';
import {customRender} from '../../../testUtils/custom-render';

describe('<ListItem />', () => {
  test('should render and be pressable', async () => {
    const onPressFn = jest.fn();
    const component = customRender(() => (
      <ListItem
        testID={'rntl.listItem'}
        gradStart={['#000000']}
        gradEnd={['#FFFFFF']}
        header={'warrendeleon LTD'}
        content={'Managing Director'}
        dateStart={'Oct 2018'}
        dateEnd={'current'}
        logo={
          'https://raw.githubusercontent.com/warrendeleon/rn-warrendeleon/main/src/assets/svg/warrendeleon-circle.svg'
        }
        onPress={onPressFn()}
      />
    ));

    fireEvent.press(component.getAllByTestId('rntl.listItem')[0], 'onPress');
    expect(onPressFn).toHaveBeenCalled();
  });
});
