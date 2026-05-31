import React, { forwardRef, memo } from 'react';
import { Text as RNText } from 'react-native';
import {
  H1 as RawH1,
  H2 as RawH2,
  H3 as RawH3,
  H4 as RawH4,
  H5 as RawH5,
  H6 as RawH6,
} from '@expo/html-elements';
import type { VariantProps } from '@gluestack-ui/utils/nativewind-utils';
import { cssInterop } from 'nativewind';

import { headingStyle } from './styles';

// @expo/html-elements types H1..H6 as ComponentType<TextProps>, which drops the
// forwarded-ref instance type. On native each heading renders an RN Text and accepts
// TextProps, so treat them as Text-compatible. This matches the ref pattern used by the
// Text component and lets the size switch forward one ref across H1..H6 without a
// per-branch suppression.
const H1 = RawH1 as unknown as typeof RNText;
const H2 = RawH2 as unknown as typeof RNText;
const H3 = RawH3 as unknown as typeof RNText;
const H4 = RawH4 as unknown as typeof RNText;
const H5 = RawH5 as unknown as typeof RNText;
const H6 = RawH6 as unknown as typeof RNText;

type IHeadingProps = VariantProps<typeof headingStyle> &
  React.ComponentPropsWithoutRef<typeof H1> & {
    as?: React.ElementType;
  };

cssInterop(H1, { className: 'style' });
cssInterop(H2, { className: 'style' });
cssInterop(H3, { className: 'style' });
cssInterop(H4, { className: 'style' });
cssInterop(H5, { className: 'style' });
cssInterop(H6, { className: 'style' });

const MappedHeading = memo(
  forwardRef<React.ComponentRef<typeof H1>, IHeadingProps>(function MappedHeading(
    {
      size,
      className,
      isTruncated,
      bold,
      underline,
      strikeThrough,
      sub,
      italic,
      highlight,
      ...props
    },
    ref
  ) {
    switch (size) {
      case '5xl':
      case '4xl':
      case '3xl':
        return (
          <H1
            className={headingStyle({
              size,
              isTruncated: isTruncated as boolean,
              bold: bold as boolean,
              underline: underline as boolean,
              strikeThrough: strikeThrough as boolean,
              sub: sub as boolean,
              italic: italic as boolean,
              highlight: highlight as boolean,
              class: className,
            })}
            {...props}
            ref={ref}
          />
        );
      case '2xl':
        return (
          <H2
            className={headingStyle({
              size,
              isTruncated: isTruncated as boolean,
              bold: bold as boolean,
              underline: underline as boolean,
              strikeThrough: strikeThrough as boolean,
              sub: sub as boolean,
              italic: italic as boolean,
              highlight: highlight as boolean,
              class: className,
            })}
            {...props}
            ref={ref}
          />
        );
      case 'xl':
        return (
          <H3
            className={headingStyle({
              size,
              isTruncated: isTruncated as boolean,
              bold: bold as boolean,
              underline: underline as boolean,
              strikeThrough: strikeThrough as boolean,
              sub: sub as boolean,
              italic: italic as boolean,
              highlight: highlight as boolean,
              class: className,
            })}
            {...props}
            ref={ref}
          />
        );
      case 'lg':
        return (
          <H4
            className={headingStyle({
              size,
              isTruncated: isTruncated as boolean,
              bold: bold as boolean,
              underline: underline as boolean,
              strikeThrough: strikeThrough as boolean,
              sub: sub as boolean,
              italic: italic as boolean,
              highlight: highlight as boolean,
              class: className,
            })}
            {...props}
            ref={ref}
          />
        );
      case 'md':
        return (
          <H5
            className={headingStyle({
              size,
              isTruncated: isTruncated as boolean,
              bold: bold as boolean,
              underline: underline as boolean,
              strikeThrough: strikeThrough as boolean,
              sub: sub as boolean,
              italic: italic as boolean,
              highlight: highlight as boolean,
              class: className,
            })}
            {...props}
            ref={ref}
          />
        );
      case 'sm':
      case 'xs':
        return (
          <H6
            className={headingStyle({
              size,
              isTruncated: isTruncated as boolean,
              bold: bold as boolean,
              underline: underline as boolean,
              strikeThrough: strikeThrough as boolean,
              sub: sub as boolean,
              italic: italic as boolean,
              highlight: highlight as boolean,
              class: className,
            })}
            {...props}
            ref={ref}
          />
        );
      default:
        return (
          <H4
            className={headingStyle({
              size,
              isTruncated: isTruncated as boolean,
              bold: bold as boolean,
              underline: underline as boolean,
              strikeThrough: strikeThrough as boolean,
              sub: sub as boolean,
              italic: italic as boolean,
              highlight: highlight as boolean,
              class: className,
            })}
            {...props}
            ref={ref}
          />
        );
    }
  })
);

const Heading = memo(
  forwardRef<React.ComponentRef<typeof H1>, IHeadingProps>(function Heading(
    { className, size = 'lg', as: AsComp, ...props },
    ref
  ) {
    const { isTruncated, bold, underline, strikeThrough, sub, italic, highlight } = props;

    if (AsComp) {
      return (
        <AsComp
          className={headingStyle({
            size,
            isTruncated: isTruncated as boolean,
            bold: bold as boolean,
            underline: underline as boolean,
            strikeThrough: strikeThrough as boolean,
            sub: sub as boolean,
            italic: italic as boolean,
            highlight: highlight as boolean,
            class: className,
          })}
          {...props}
        />
      );
    }

    return <MappedHeading className={className} size={size} ref={ref} {...props} />;
  })
);

Heading.displayName = 'Heading';

export { Heading };
