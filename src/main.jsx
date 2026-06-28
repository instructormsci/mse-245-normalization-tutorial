import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import NormalizationTutorial from "./NormalizationTutorial.jsx";
import "./index.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <NormalizationTutorial />
  </StrictMode>
);
