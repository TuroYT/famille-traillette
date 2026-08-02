import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import FamilleTraillette from "./FamilleTraillette.jsx";
import "./index.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <FamilleTraillette />
  </StrictMode>
);
