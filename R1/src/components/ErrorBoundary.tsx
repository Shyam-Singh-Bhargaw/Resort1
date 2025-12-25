import React from "react";

interface State {
  hasError: boolean;
  error?: Error | null;
}

interface Props {
  name?: string;
  children: React.ReactNode;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: any) {
    // eslint-disable-next-line no-console
    console.error(`Error in ${this.props.name || "component"}:`, error, info);
  }

  render() {
    if (this.state.hasError) {
      const title = this.props.name ? `${this.props.name} failed to render` : "Component error";
      return (
        <div style={{ border: "1px solid #f5c6cb", background: "#fff5f6", padding: 12, borderRadius: 6, margin: 12 }}>
          <strong style={{ display: "block", marginBottom: 6 }}>{title}</strong>
          <pre style={{ margin: 0, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>{String(this.state.error?.stack || this.state.error?.message)}</pre>
        </div>
      );
    }
    return this.props.children as any;
  }
}

export default ErrorBoundary;
