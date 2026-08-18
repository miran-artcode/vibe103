import React from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import "./firebase";   // (선택) Firebase가 설정돼 있으면 기기 간 실시간 공유를 켭니다
import App from "./App";
import ChatWidget from "./ChatWidget";  // 💬 오른쪽 아래 선생님 실시간 채팅 (App과 분리된 독립 위젯)
import PinGate from "./PinGate";        // 🔒 숫자 4자리 입장 비밀번호 (비밀번호는 PinGate.tsx 맨 위에서 변경)

createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <PinGate>
      <App />
      <ChatWidget />
    </PinGate>
  </React.StrictMode>
);
