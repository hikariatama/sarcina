import "@fontsource-variable/dm-sans";
import "@fontsource-variable/roboto-flex";
import "@fontsource-variable/roboto-flex/wdth.css";
import "@/styles/globals.css";

import { createRoot } from "react-dom/client";
import { App } from "@/app";

const container = document.getElementById("root");

if (!container) {
  throw new Error("Root container was not found");
}

createRoot(container).render(<App />);
