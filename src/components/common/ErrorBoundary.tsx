import { Component, type ErrorInfo, type ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
  /** Called when the user asks to leave the broken page. */
  onReset?: () => void;
  resetLabel?: string;
}

interface ErrorBoundaryState {
  error: Error | null;
}

/**
 * Catches render/lifecycle errors so a broken page never leaves the learner on
 * a silent white screen. The message is shown in plain language and the raw
 * error text stays visible for debugging (this is a school project without a
 * logging service).
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    // Keep the stack in the console for debugging; the UI shows the short text.
    console.error('Halaman gagal dipaparkan:', error, info.componentStack);
  }

  private handleReset = () => {
    this.setState({ error: null });
    this.props.onReset?.();
  };

  render(): ReactNode {
    const { error } = this.state;
    if (!error) return this.props.children;

    return (
      <main className="app-error" role="alert">
        <div className="app-error__card">
          <p className="app-error__eyebrow">RALAT</p>
          <h1 className="app-error__title">Maaf, halaman ini tidak dapat dipaparkan.</h1>
          <p className="app-error__text">
            Cuba muat semula halaman. Jika masalah berterusan, kembali ke peta dan buka stesen itu
            sekali lagi.
          </p>
          <pre className="app-error__detail">
            {error.name}: {error.message}
          </pre>
          <div className="app-error__actions">
            <button type="button" className="button-quiet" onClick={() => window.location.reload()}>
              Muat semula
            </button>
            {this.props.onReset ? (
              <button type="button" className="button-primary" onClick={this.handleReset}>
                {this.props.resetLabel ?? 'Kembali'}
              </button>
            ) : null}
          </div>
        </div>
      </main>
    );
  }
}
