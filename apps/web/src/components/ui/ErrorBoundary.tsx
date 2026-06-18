import { Component, type ReactNode } from 'react';

type Props = { children: ReactNode };
type State = { hasError: boolean; error: Error | null };

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: any) {
    console.error('MindVault caught an error:', error, info);
  }

  handleReset = () => this.setState({ hasError: false, error: null });

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center px-4"
             style={{ background: '#f5f0e8' }}>
          <div className="w-full max-w-sm flex flex-col items-center gap-5">
            <div className="w-16 h-16 rounded-full flex items-center justify-center"
                 style={{ background: 'rgba(220, 38, 38, 0.08)', border: '1px solid rgba(220, 38, 38, 0.2)' }}>
              <span className="text-red-600 text-2xl font-bold">!</span>
            </div>
            <div className="text-center">
              <p className="font-bold text-lg" style={{ color: '#1c1914' }}>
                Something went wrong
              </p>
              <p className="text-sm mt-2 leading-relaxed" style={{ color: '#6b5a49' }}>
                Your memories are safe on 0G Storage. This is just a display issue.
              </p>
            </div>
            <button
              onClick={this.handleReset}
              className="w-full py-3.5 rounded-xl text-white font-semibold text-sm transition-all duration-150 active:scale-[0.98]"
              style={{ background: '#6366f1', boxShadow: '0 2px 12px rgba(99,102,241,0.2)' }}
            >
              Try Again
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
