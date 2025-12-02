import React from 'react';

import { renderWithProviders } from '@app/test-utils/renderWithProviders';

import { ButtonGroupDivider } from '../ButtonGroupDivider';

describe('ButtonGroupDivider Stories', () => {
  it('renders Default story', () => {
    const { toJSON } = renderWithProviders(<ButtonGroupDivider />);
    expect(toJSON()).toBeTruthy();
  });

  it('renders divider element', () => {
    const { toJSON } = renderWithProviders(<ButtonGroupDivider />);
    const tree = toJSON();
    expect(tree).toBeTruthy();
  });
});
