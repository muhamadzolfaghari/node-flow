import React from "react";
import { createRoot } from "react-dom/client";
import { preload } from "react-dom";
import App from "./App.jsx";
import { WorkspaceProvider } from "./hooks/useWorkspace.jsx";
import { TooltipProvider } from "./components/ui.jsx";
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
