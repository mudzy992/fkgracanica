import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Button } from '../ui/button';
import i18n from '../../i18n';
import { RouteLoadError } from './lazy-route';

interface Props {
  children: ReactNode;
  resetKey?: string;
}

interface State {
  hasError: boolean;
  routeLoadError: boolean;
  resetKey?: string;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, routeLoadError: false, resetKey: this.props.resetKey };

  static getDerivedStateFromProps(props: Props, state: State): Partial<State> | null {
    return props.resetKey !== state.resetKey
      ? { hasError: false, routeLoadError: false, resetKey: props.resetKey }
      : null;
  }

  static getDerivedStateFromError(error: unknown): Partial<State> {
    return { hasError: true, routeLoadError: error instanceof RouteLoadError };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('ErrorBoundary:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4 p-8">
          <p role="alert" className="text-lg font-medium text-text">
            {i18n.t(this.state.routeLoadError ? 'common.routeLoadError' : 'admin.common.error')}
          </p>
          <Button onClick={() => {
            if (this.state.routeLoadError) window.location.reload();
            else this.setState({ hasError: false, routeLoadError: false });
          }}>
            {i18n.t(this.state.routeLoadError ? 'actions.reloadPage' : 'actions.retry')}
          </Button>
        </div>
      );
    }
    return this.props.children;
  }
}
