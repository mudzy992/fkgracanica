import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Button } from '../ui/button';
import i18n from '../../i18n';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('ErrorBoundary:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4 p-8">
          <p className="text-lg font-medium text-text">{i18n.t('admin.common.error')}</p>
          <Button onClick={() => this.setState({ hasError: false })}>
            {i18n.t('actions.retry')}
          </Button>
        </div>
      );
    }
    return this.props.children;
  }
}
