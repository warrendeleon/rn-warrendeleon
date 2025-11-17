import React, { Component, type ReactNode } from 'react';

import { logError } from '@app/utils/logger';

import { FallbackUI } from './FallbackUI';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    // Log to console in development only (production-safe)
    logError('Error caught by ErrorBoundary', error, { errorInfo });
  }

  resetError = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      return <FallbackUI error={this.state.error} onReset={this.resetError} />;
    }

    return this.props.children;
  }
}
