import React from "react";

interface Props {
  children: React.ReactNode;
  label?: string;
  /** Changing this value clears a caught error (e.g. the active document id). */
  resetKey?: unknown;
}

interface State {
  error: Error | null;
}

/** Keeps a render crash in one pane from blanking the whole studio. */
export default class ErrorBoundary extends React.Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error(`${this.props.label || "Panel"} crashed:`, error, info.componentStack);
  }

  componentDidUpdate(prev: Props) {
    if (this.state.error && prev.resetKey !== this.props.resetKey) this.setState({ error: null });
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div role="alert" className="flex h-full min-h-40 flex-col items-center justify-center gap-3 p-6 text-center text-sm">
        <p className="font-semibold text-foreground">{this.props.label || "This panel"} hit an error.</p>
        <p className="max-w-md text-muted-foreground">{this.state.error.message}</p>
        <button
          type="button"
          className="rounded-md border border-border px-3 py-1.5 hover:bg-accent"
          onClick={() => this.setState({ error: null })}
        >
          Try again
        </button>
      </div>
    );
  }
}
