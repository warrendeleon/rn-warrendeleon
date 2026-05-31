import React from 'react';

import { renderWithProviders } from '@app/test-utils/renderWithProviders';

import { DetailListGroup } from '../DetailListGroup';
import * as stories from '../DetailListGroup.stories';

describe('DetailListGroup Stories', () => {
  it('renders Default story with item labels', async () => {
    const { args } = stories.Default;
    const { getByText } = await renderWithProviders(
      <DetailListGroup items={args!.items!} loading={args?.loading} error={args?.error} />
    );
    expect(getByText('Company A')).toBeOnTheScreen();
    expect(getByText('Company B')).toBeOnTheScreen();
  });

  it('renders WithBadges story with badge labels', async () => {
    const { args } = stories.WithBadges;
    const { getByText } = await renderWithProviders(
      <DetailListGroup items={args!.items!} loading={args?.loading} error={args?.error} />
    );
    args!.items!.forEach(item => {
      expect(getByText(item.label)).toBeOnTheScreen();
    });
  });

  it('renders WithoutChevrons story with item labels', async () => {
    const { args } = stories.WithoutChevrons;
    const { getByText } = await renderWithProviders(
      <DetailListGroup items={args!.items!} loading={args?.loading} error={args?.error} />
    );
    args!.items!.forEach(item => {
      expect(getByText(item.label)).toBeOnTheScreen();
    });
  });

  it('renders Loading story with activity indicator', async () => {
    const { args } = stories.Loading;
    const { getByTestId } = await renderWithProviders(
      <DetailListGroup items={args?.items ?? []} loading={args?.loading} error={args?.error} />
    );
    expect(getByTestId('activity-indicator')).toBeOnTheScreen();
  });

  it('renders Error story with error message', async () => {
    const { args } = stories.Error;
    const { getByText } = await renderWithProviders(
      <DetailListGroup items={args?.items ?? []} loading={args?.loading} error={args?.error} />
    );
    expect(getByText('Failed to load data. Please try again.')).toBeOnTheScreen();
  });

  it('renders SingleItem story with single label', async () => {
    const { args } = stories.SingleItem;
    const items = args?.items ?? [];
    const { getByText } = await renderWithProviders(
      <DetailListGroup items={items} loading={args?.loading} error={args?.error} />
    );
    expect(getByText(items[0]?.label ?? '')).toBeOnTheScreen();
  });

  it('renders ManyItems story with all labels', async () => {
    const { args } = stories.ManyItems;
    const { getByText } = await renderWithProviders(
      <DetailListGroup items={args!.items!} loading={args?.loading} error={args?.error} />
    );
    args!.items!.forEach(item => {
      expect(getByText(item.label)).toBeOnTheScreen();
    });
  });

  it('Default story displays labels', async () => {
    const { args } = stories.Default;
    const { getByText } = await renderWithProviders(
      <DetailListGroup items={args!.items!} loading={args?.loading} error={args?.error} />
    );
    expect(getByText('Company A')).toBeOnTheScreen();
    expect(getByText('Company B')).toBeOnTheScreen();
  });

  it('Loading story shows activity indicator', async () => {
    const { args } = stories.Loading;
    const { getByTestId } = await renderWithProviders(
      <DetailListGroup items={args?.items ?? []} loading={args?.loading} error={args?.error} />
    );
    expect(getByTestId('activity-indicator')).toBeOnTheScreen();
  });

  it('Error story displays error message', async () => {
    const { args } = stories.Error;
    const { getByText } = await renderWithProviders(
      <DetailListGroup items={args?.items ?? []} loading={args?.loading} error={args?.error} />
    );
    expect(getByText('Failed to load data. Please try again.')).toBeOnTheScreen();
  });
});
