import React from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import "./firebase";   // (선택) Firebase가 설정돼 있으면 기기 간 실시간 공유를 켭니다
import App from "./App";
import ChatWidget from "./ChatWidget";  // 💬 오른쪽 아래 선생님 실시간 채팅 (App과 분리된 독립 위젯)

createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
    <ChatWidget />
  </React.StrictMode>
);
