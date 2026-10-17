import React from "react";
import { createRoot } from "react-dom/client";
import { preload } from "react-dom";
import App from "./App.tsx";
import { WorkspaceProvider } from "./hooks/useWorkspace.tsx";
import { TooltipProvider } from "./components/ui.tsx";
import "./index.css";

preload("https://fonts.googleapis.com", { as: "style" });
preload("https://fonts.gstatic.com", { as: "font", crossOrigin: "anonymous" });



createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <WorkspaceProvider>
      <TooltipProvider>
        <App />
      </TooltipProvider>
    </WorkspaceProvider>
  </React.StrictMode>,
);
