import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@/styles/global.css";
import { App } from "@/app/App";
import { ProgressToasts } from "@/features/progress/components/ProgressToasts";
import { ErrorBoundary } from "@/components/ErrorBoundary";

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Panda: root element #root was not found in index.html");
}

createRoot(rootElement).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
      <ProgressToasts />
    </ErrorBoundary>
  </StrictMode>,
);