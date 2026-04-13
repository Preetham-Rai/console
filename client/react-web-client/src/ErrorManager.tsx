import { Component, type ErrorInfo, type ReactNode } from "react";

interface ErrorMangerProps {
  children: ReactNode;
}

interface ErrorManagerState {
  error: boolean;
  errorInfo?: Error;
}

class ErrorManager extends Component<ErrorMangerProps, ErrorManagerState> {
  state: ErrorManagerState = {
    error: false,
  };

  static getDerivedStateFromError(error: Error): ErrorManagerState {
    return {
      error: true,
      errorInfo: error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.log("Error caught by ErrorManager", error, errorInfo);
  }

  render() {
    if (this.state.error) {
      <div style={{ padding: "20px", textAlign: "center" }}>
        <h1>Something went wrong.</h1>
        <p>Please try refreshing the page.</p>
        {this.state.errorInfo && (
          <details style={{ whiteSpace: "pre-wrap" }}>
            {this.state.errorInfo.toString()}
          </details>
        )}
      </div>;
    }

    return this.props.children;
  }
}

export default ErrorManager;
