// ============================================================
//  🔒 숫자 4자리 비밀번호 관문 (로그인 전 잠금 화면)
//  - App.tsx와 완전히 분리 — main.tsx에서 <App/>을 감싸서 사용
//  - 올바른 4자리를 입력해야 입장 화면(학교·별명 입력)이 보입니다
//  - 통과 여부는 sessionStorage에 저장: 탭을 유지하는 동안은 다시 안 물어보고,
//    브라우저를 껐다 켜면 다시 입력해야 합니다
//
//  ★ 비밀번호 바꾸는 곳: 바로 아래 PIN 상수를 원하는 숫자 4자리로 수정하세요.
// ============================================================
import React, { useEffect, useRef, useState } from "react";

const PIN = "1030"; // ← 선생님들께 알려줄 숫자 4자리 비밀번호 (여기서 변경)

export default function PinGate({ children }: { children: React.ReactNode }) {
  const [ok, setOk] = useState(() => {
    try { return sessionStorage.getItem("vc_pin_ok") === "1"; } catch { return false; }
  });
  const [digits, setDigits] = useState("");
  const [wrong, setWrong] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { if (!ok) inputRef.current?.focus(); }, [ok]);

  const onChange = (raw: string) => {
    const v = raw.replace(/\D/g, "").slice(0, 4); // 숫자만, 최대 4자리
    setDigits(v);
    setWrong(false);
    if (v.length === 4) {
      if (v === PIN) {
        try { sessionStorage.setItem("vc_pin_ok", "1"); } catch {}
        setOk(true);
      } else {
        setWrong(true);
        setTimeout(() => { setDigits(""); inputRef.current?.focus(); }, 450);
      }
    }
  };

  if (ok) return <>{children}</>;

  return (
    <div className="min-h-screen bg-indigo-950 flex items-center justify-center px-4"
      style={{ fontFamily: "'Noto Sans KR', system-ui, sans-serif" }}>
      <div className="w-full max-w-sm text-center">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-500 flex items-center justify-center text-3xl shadow-lg">
          🔒
        </div>
        <h1 className="mt-5 text-white font-extrabold text-xl">바이브 코딩 연수</h1>
        <p className="mt-1.5 text-indigo-300 text-[13px]">
          입장 비밀번호 <b className="text-amber-400">숫자 4자리</b>를 입력하세요
        </p>

        {/* 실제 입력은 투명한 input 하나로 받고, 아래 4칸은 표시용 */}
        <div className="relative mt-7 mx-auto w-fit">
          <input
            ref={inputRef}
            value={digits}
            onChange={(e) => onChange(e.target.value)}
            type="password"
            inputMode="numeric"
            pattern="[0-9]*"
            autoComplete="off"
            aria-label="입장 비밀번호 숫자 4자리"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <div className={`flex gap-3 pointer-events-none ${wrong ? "animate-[shake_0.4s]" : ""}`}>
            {[0, 1, 2, 3].map((i) => (
              <div key={i}
                className={`w-14 h-16 rounded-xl border-2 flex items-center justify-center text-2xl font-bold transition-colors ${
                  wrong ? "border-rose-500 bg-rose-500/10 text-rose-400"
                  : i < digits.length ? "border-amber-400 bg-white/10 text-white"
                  : i === digits.length ? "border-indigo-400 bg-white/5 text-white"
                  : "border-indigo-800 bg-white/5 text-white"}`}>
                {i < digits.length ? "●" : ""}
              </div>
            ))}
          </div>
        </div>

        <p className={`mt-4 text-[12.5px] h-5 transition-opacity ${wrong ? "text-rose-400 opacity-100" : "opacity-0"}`}>
          비밀번호가 맞지 않아요. 다시 입력해 주세요!
        </p>
        <p className="mt-6 text-indigo-400/70 text-[11.5px]">
          비밀번호는 강의자(운영자) 선생님께 문의하세요
        </p>
      </div>
      <style>{`@keyframes shake{0%,100%{transform:translateX(0)}20%{transform:translateX(-8px)}40%{transform:translateX(8px)}60%{transform:translateX(-5px)}80%{transform:translateX(5px)}}`}</style>
    </div>
  );
}
