import React from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import "./firebase";   // (선택) Firebase가 설정돼 있으면 기기 간 실시간 공유를 켭니다
import App from "./App";

createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
