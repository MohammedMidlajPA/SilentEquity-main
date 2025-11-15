import React from 'react';

/**
 * Error Boundary Component
 * Catches React errors and displays fallback UI
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log error (in production, send to error tracking service)
    if (import.meta.env.DEV) {
      console.error('Error caught by boundary:', error, errorInfo);
    }
    
    // In production, send to error tracking service (e.g., Sentry)
    // Example: Sentry.captureException(error, { contexts: { react: errorInfo } });
    
    this.setState({
      error,
      errorInfo
    });
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#000',
          color: '#fff',
          padding: '20px',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif'
        }}>
          <div style={{
            maxWidth: '600px',
            textAlign: 'center',
            background: 'rgba(6,20,22,0.90)',
            border: '1px solid rgba(0,255,222,0.25)',
            borderRadius: '16px',
            padding: '40px',
          }}>
            <div style={{ fontSize: '48px', marginBottom: '20px' }}>⚠️</div>
            <h2 style={{ 
              margin: '0 0 16px 0', 
              fontSize: '24px',
              color: '#00ffde'
            }}>
              Something went wrong
            </h2>
            <p style={{ 
              margin: '0 0 24px 0', 
              color: '#9fece2',
              fontSize: '16px'
            }}>
              We encountered an unexpected error. Please try reloading the page or return to the home page.
            </p>
            
            {import.meta.env.DEV && this.state.error && (
              <details style={{
                marginBottom: '24px',
                textAlign: 'left',
                background: 'rgba(255,0,0,0.1)',
                padding: '16px',
                borderRadius: '8px',
                fontSize: '12px',
                color: '#ff6b6b'
              }}>
                <summary style={{ cursor: 'pointer', marginBottom: '8px' }}>
                  Error Details (Development Only)
                </summary>
                <pre style={{ 
                  margin: 0, 
                  overflow: 'auto',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word'
                }}>
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                onClick={this.handleReload}
                style={{
                  background: '#00ffde',
                  color: '#000',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseOver={(e) => e.target.style.background = '#00d4b8'}
                onMouseOut={(e) => e.target.style.background = '#00ffde'}
              >
                🔄 Reload Page
              </button>
              
              <button
                onClick={this.handleGoHome}
                style={{
                  background: 'transparent',
                  color: '#00ffde',
                  border: '1px solid #00ffde',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseOver={(e) => {
                  e.target.style.background = 'rgba(0,255,222,0.1)';
                }}
                onMouseOut={(e) => {
                  e.target.style.background = 'transparent';
                }}
              >
                🏠 Go to Home
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

