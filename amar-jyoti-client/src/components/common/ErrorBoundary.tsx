import  { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RefreshCcw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Frontend Error Caught by Boundary:", error, errorInfo);
  }

  public handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-primary/30 p-4">
          <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-error" />
            </div>
            <h2 className="text-2xl font-serif font-bold text-dark mb-2">Something went wrong</h2>
            <p className="text-subtle-text mb-6 text-sm">
              We encountered an unexpected error. Usually, reloading the page fixes this.
            </p>
            
            {/* ✅ FIXED: process.env ki jagah import.meta.env use kiya */}
            {import.meta.env.DEV && (
                <div className="bg-gray-100 p-3 rounded text-left text-xs text-red-600 mb-6 overflow-auto max-h-32">
                    {this.state.error?.message}
                </div>
            )}

            <div className="flex gap-3 justify-center">
                <button 
                  onClick={() => window.location.href = '/'}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium hover:bg-gray-50 transition-colors"
                >
                  Go Home
                </button>
                <button 
                  onClick={this.handleReload}
                  className="px-4 py-2 bg-accent text-white rounded-md text-sm font-medium hover:bg-yellow-600 transition-colors flex items-center gap-2"
                >
                  <RefreshCcw className="w-4 h-4" /> Reload Page
                </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;