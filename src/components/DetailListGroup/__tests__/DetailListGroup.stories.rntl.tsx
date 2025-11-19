import React from 'react';

import { renderWithProviders } from '@app/test-utils/renderWithProviders';

import { DetailListGroup } from '../DetailListGroup';
import * as stories from '../DetailListGroup.stories';

describe('DetailListGroup Stories', () => {
  it('renders Default story', () => {
    const { args } = stories.Default;
    const { toJSON } = renderWithProviders(
      <DetailListGroup items={args!.items!} loading={args?.loading} error={args?.error} />
    );
    expect(toJSON()).toBeTruthy();
  });

  it('renders WithBadges story', () => {
    const { args } = stories.WithBadges;
    const { toJSON } = renderWithProviders(
      <DetailListGroup items={args!.items!} loading={args?.loading} error={args?.error} />
    );
    expect(toJSON()).toBeTruthy();
  });

  it('renders WithoutChevrons story', () => {
    const { args } = stories.WithoutChevrons;
    const { toJSON } = renderWithProviders(
      <DetailListGroup items={args!.items!} loading={args?.loading} error={args?.error} />
    );
    expect(toJSON()).toBeTruthy();
  });

  it('renders Loading story', () => {
    const { args } = stories.Loading;
    const { toJSON } = renderWithProviders(
      <DetailListGroup items={args?.items ?? []} loading={args?.loading} error={args?.error} />
    );
    expect(toJSON()).toBeTruthy();
  });

  it('renders Error story', () => {
    const { args } = stories.Error;
    const { toJSON } = renderWithProviders(
      <DetailListGroup items={args?.items ?? []} loading={args?.loading} error={args?.error} />
    );
    expect(toJSON()).toBeTruthy();
  });

  it('renders SingleItem story', () => {
    const { args } = stories.SingleItem;
    const { toJSON } = renderWithProviders(
      <DetailListGroup items={args!.items!} loading={args?.loading} error={args?.error} />
    );
    expect(toJSON()).toBeTruthy();
  });

  it('renders ManyItems story', () => {
    const { args } = stories.ManyItems;
    const { toJSON } = renderWithProviders(
      <DetailListGroup items={args!.items!} loading={args?.loading} error={args?.error} />
    );
    expect(toJSON()).toBeTruthy();
  });

  it('Default story displays labels', () => {
    const { args } = stories.Default;
    const { getByText } = renderWithProviders(
      <DetailListGroup items={args!.items!} loading={args?.loading} error={args?.error} />
    );
    expect(getByText('Company A')).toBeTruthy();
    expect(getByText('Company B')).toBeTruthy();
  });

  it('Loading story shows activity indicator', () => {
    const { args } = stories.Loading;
    const { getByTestId } = renderWithProviders(
      <DetailListGroup items={args?.items ?? []} loading={args?.loading} error={args?.error} />
    );
    expect(getByTestId('activity-indicator')).toBeTruthy();
  });

  it('Error story displays error message', () => {
    const { args } = stories.Error;
    const { getByText } = renderWithProviders(
      <DetailListGroup items={args?.items ?? []} loading={args?.loading} error={args?.error} />
    );
    expect(getByText('Failed to load data. Please try again.')).toBeTruthy();
  });
});
