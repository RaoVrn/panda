import { Component, type ErrorInfo, type ReactNode } from "react";
import { Button } from "@/components/ui/Button";
import { Logo } from "@/components/brand/Logo";

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  error: Error | null;
}

/**
 * Production error boundary. Catches render/lifecycle errors and shows a calm
 * Panda-styled fallback instead of React's red crash overlay. The boundary
 * itself resets when the user reloads, which also clears the broken state.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    // Logged for developers; never surfaced raw to learners.
    if (import.meta.env.DEV) {
      console.error("Panda crashed:", error, info.componentStack);
    }
  }

  private copyDetails = async (): Promise<void> => {
    const { error } = this.state;
    if (!error) return;
    try {
      await navigator.clipboard.writeText(
        `${error.name}: ${error.message}\n${error.stack ?? ""}`,
      );
    } catch {
      // Clipboard unavailable; nothing else to do.
    }
  };

  render(): ReactNode {
    const { error } = this.state;
    if (!error) return this.props.children;

    return (
      <div className="flex min-h-screen items-center justify-center bg-base px-4 text-text">
        <div className="w-full max-w-md text-center">
          <Logo size={64} className="mx-auto" />
          <h1 className="mt-4 text-2xl font-semibold tracking-tight sm:text-3xl">
            Something went wrong
          </h1>
          <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-text-secondary">
            Panda hit an unexpected snag. Don't worry, your progress is saved on
            this device. A quick reload usually gets you right back to learning.
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Button onClick={() => window.location.reload()}>Reload page</Button>
            <Button variant="secondary" href="/dashboard">
              Go Home
            </Button>
          </div>

          {import.meta.env.DEV && (
            <div className="mt-8">
              <button
                type="button"
                onClick={this.copyDetails}
                className="text-xs text-text-muted underline-offset-2 transition-colors hover:text-accent-hover hover:underline"
              >
                Copy error details
              </button>
              <p className="mt-2 rounded-lg bg-base-subtle p-3 text-left font-mono text-[10px] leading-relaxed text-text-muted">
                {error.message}
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }
}
