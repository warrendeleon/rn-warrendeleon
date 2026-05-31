import React from 'react';

import { renderWithProviders } from '@app/test-utils';

import { ButtonGroupDivider } from '../ButtonGroupDivider';

describe('ButtonGroupDivider Stories', () => {
  it('renders Default story as a View element', async () => {
    const { toJSON } = await renderWithProviders(<ButtonGroupDivider />);
    const tree = toJSON();
    expect(tree).not.toBeNull();
    if (tree && !Array.isArray(tree)) {
      expect(tree.type).toBe('View');
    }
  });
});
