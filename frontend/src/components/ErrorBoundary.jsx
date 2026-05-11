import React from 'react';
import { FiRefreshCw, FiHome, FiAlertTriangle } from 'react-icons/fi';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    });

    // Log error to monitoring service
    console.error('Error Boundary caught an error:', error, errorInfo);
    
    // You can also send error to external service like Sentry
    if (window.gtag) {
      window.gtag('event', 'exception', {
        description: error.toString(),
        fatal: false
      });
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: 'var(--bg-deep)' }}>
          <div className="max-w-md w-full text-center">
            <div className="mb-8">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center"
                style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}>
                <FiAlertTriangle size={32} />
              </div>
              
              <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                Oops! Something went wrong
              </h1>
              
              <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>
                We're sorry, but something unexpected happened. Our team has been notified and is working to fix this issue.
              </p>

              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="text-left mb-6 p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
                  <summary className="cursor-pointer font-mono text-xs" style={{ color: 'var(--text-muted)' }}>
                    Error Details (Development Only)
                  </summary>
                  <pre className="mt-2 text-xs overflow-auto" style={{ color: 'var(--text-secondary)' }}>
                    {this.state.error && this.state.error.toString()}
                    <br />
                    {this.state.errorInfo.componentStack}
                  </pre>
                </details>
              )}
            </div>

            <div className="space-y-3">
              <button
                onClick={this.handleRetry}
                className="w-full btn-gold flex items-center justify-center gap-2"
                style={{ padding: '12px 24px' }}
              >
                <FiRefreshCw size={16} />
                Try Again
              </button>
              
              <button
                onClick={this.handleGoHome}
                className="w-full btn-outline flex items-center justify-center gap-2"
                style={{ padding: '12px 24px' }}
              >
                <FiHome size={16} />
                Go to Homepage
              </button>
            </div>

            <div className="mt-8 text-xs" style={{ color: 'var(--text-muted)' }}>
              <p>If this problem persists, please contact our support team.</p>
              <p className="mt-1">Error ID: {Date.now()}</p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
