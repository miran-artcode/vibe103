// ============================================================
//  💬 선생님 실시간 채팅 위젯 (오른쪽 아래 플로팅)
//  - App.tsx와 완전히 분리된 독립 컴포넌트 (main.tsx에서 <App/> 옆에 렌더)
//  - 로그인(입장) 정보는 App이 localStorage에 저장하는 "vc:me"를 읽어서 사용
//  - 메시지는 Firestore 'shared/chat_{세션}' 문서 하나에 배열로 저장
//    → 기존 firestore.rules(shared/* 만 허용)를 그대로 통과, 규칙 수정 불필요
//  - onSnapshot 실시간 구독: 강의자가 보내면 접속 중인 모든 선생님에게 즉시 표시
//  - URL을 보내면 자동으로 클릭 가능한 링크로 표시
// ============================================================
import React, { useEffect, useMemo, useRef, useState } from "react";
import { getApps, getApp } from "firebase/app";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import {
  getFirestore, doc, onSnapshot, setDoc, updateDoc, arrayUnion, getDoc,
} from "firebase/firestore";

type Me = { uid: string; nick: string; school: string; session: string };
type Msg = { id: string; uid: string; nick: string; school?: string; text: string; ts: number };

const MAX_KEEP = 80;      // 문서에 유지할 최근 메시지 수
const TRIM_AT = 120;      // 이 개수를 넘으면 보낸 사람이 정리

function readMe(): Me | null {
  try {
    const raw = localStorage.getItem("vc:me");
    if (!raw) return null;
    const v = JSON.parse(raw);
    return v && v.uid && v.session ? v : null;
  } catch { return null; }
}

// 메시지 본문에서 URL을 찾아 클릭 가능한 링크로 렌더
function renderText(text: string, mine: boolean) {
  const parts = text.split(/(https?:\/\/[^\s<>"']+)/g);
  return parts.map((p, i) =>
    /^https?:\/\//.test(p) ? (
      <a key={i} href={p} target="_blank" rel="noopener noreferrer"
        className={`underline break-all font-semibold ${mine ? "text-amber-200" : "text-indigo-600"}`}>
        {p}
      </a>
    ) : (
      <span key={i}>{p}</span>
    )
  );
}

function timeLabel(ts: number) {
  const d = new Date(ts);
  const h = d.getHours(), m = d.getMinutes();
  return `${h < 12 ? "오전" : "오후"} ${((h + 11) % 12) + 1}:${String(m).padStart(2, "0")}`;
}

export default function ChatWidget() {
  const [me, setMe] = useState<Me | null>(() => readMe());
  const [authed, setAuthed] = useState(false);
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [lastSeen, setLastSeen] = useState<number>(() => {
    try { return Number(localStorage.getItem("vc:chat_seen") || 0); } catch { return 0; }
  });
  const listRef = useRef<HTMLDivElement>(null);
  const openRef = useRef(open);
  openRef.current = open;

  const app = getApps().length ? getApp() : null;
  const db = useMemo(() => (app ? getFirestore(app) : null), [app]);

  // 앱에서 입장/로그아웃해도 따라가도록 localStorage의 vc:me를 주기적으로 확인
  useEffect(() => {
    const sync = () => {
      const next = readMe();
      setMe((prev) =>
        (prev?.uid === next?.uid && prev?.session === next?.session && prev?.nick === next?.nick)
          ? prev : next
      );
    };
    const id = setInterval(sync, 2000);
    window.addEventListener("storage", sync);
    return () => { clearInterval(id); window.removeEventListener("storage", sync); };
  }, []);

  // firebase.ts가 이미 수행한 익명 로그인 완료를 기다림
  useEffect(() => {
    if (!app) return;
    return onAuthStateChanged(getAuth(app), (u) => setAuthed(!!u));
  }, [app]);

  // 세션 채팅 문서 실시간 구독
  const chatKey = me ? `chat_${me.session}` : null;
  useEffect(() => {
    if (!db || !authed || !chatKey) { setMsgs([]); return; }
    const unsub = onSnapshot(doc(db, "shared", chatKey), (snap) => {
      const arr = snap.exists() ? (snap.data() as any).value : null;
      setMsgs(Array.isArray(arr) ? arr : []);
    }, (e) => console.error("채팅 구독 실패", e));
    return unsub;
  }, [db, authed, chatKey]);

  // 새 메시지 오면 스크롤 아래로 + 열려 있으면 읽음 처리
  useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
    if (openRef.current && msgs.length) markSeen(msgs[msgs.length - 1].ts);
  }, [msgs, open]);

  const markSeen = (ts: number) => {
    setLastSeen(ts);
    try { localStorage.setItem("vc:chat_seen", String(ts)); } catch {}
  };

  const unread = msgs.filter((m) => m.ts > lastSeen && m.uid !== me?.uid).length;

  // 로그아웃: 입장 정보를 지우고, 참여자 명단에서도 나를 뺀 뒤 입장 화면으로 돌아감
  const logout = async () => {
    if (!me) return;
    if (!window.confirm(`${me.nick} 님, 로그아웃할까요?\n(입장 화면으로 돌아갑니다)`)) return;
    try {
      if (db) {
        const rosterRef = doc(db, "shared", `roster_${me.session}`);
        const snap = await getDoc(rosterRef);
        const arr = snap.exists() ? (snap.data() as any).value : null;
        if (Array.isArray(arr)) {
          await setDoc(rosterRef, { value: arr.filter((p: any) => p?.uid !== me.uid) });
        }
      }
    } catch (e) { console.error("명단 정리 실패(무시하고 진행)", e); }
    try {
      localStorage.removeItem("vc:me");
      localStorage.removeItem("vc:chat_seen");
      sessionStorage.removeItem("vc_pin_ok"); // 로그아웃하면 숫자 4자리 비밀번호부터 다시 입력
    } catch {}
    window.location.reload();
  };

  const send = async () => {
    const text = draft.trim();
    if (!text || !db || !me || !chatKey || sending) return;
    setSending(true);
    const msg: Msg = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      uid: me.uid, nick: me.nick, school: me.school, text, ts: Date.now(),
    };
    const ref = doc(db, "shared", chatKey);
    try {
      // arrayUnion으로 안전하게 덧붙임 (동시에 보내도 서로 안 지워짐)
      await updateDoc(ref, { value: arrayUnion(msg) });
    } catch {
      // 문서가 아직 없으면 새로 생성
      try { await setDoc(ref, { value: [msg] }); } catch (e) { console.error("전송 실패", e); }
    }
    // 너무 길어지면 최근 것만 남기고 정리
    try {
      const snap = await getDoc(ref);
      const arr = snap.exists() ? (snap.data() as any).value : [];
      if (Array.isArray(arr) && arr.length > TRIM_AT) {
        await setDoc(ref, { value: arr.slice(-MAX_KEEP) });
      }
    } catch {}
    setDraft("");
    setSending(false);
  };

  // Firebase 미설정이거나 아직 입장(로그인) 전이면 아무것도 표시하지 않음
  if (!app || !me) return null;

  return (
    <div className="fixed bottom-5 right-5 z-[80] flex flex-col items-end"
      style={{ fontFamily: "'Noto Sans KR', system-ui, sans-serif" }}>
      {open && (
        <div className="mb-3 w-[320px] max-w-[calc(100vw-40px)] h-[420px] max-h-[65vh] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden">
          {/* 헤더 */}
          <div className="px-4 py-3 bg-indigo-950 text-white flex items-center gap-2 shrink-0">
            <span className="text-base">💬</span>
            <div className="min-w-0 flex-1">
              <div className="font-bold text-[13px] leading-tight">선생님 채팅</div>
              <div className="text-[10.5px] text-indigo-300 truncate">세션 {me.session} · {me.nick} 님으로 접속 중</div>
            </div>
            <button onClick={logout} title="로그아웃 (입장 화면으로 돌아가기)"
              className="px-2 h-7 rounded-lg bg-white/10 hover:bg-rose-500/80 text-[10.5px] font-bold text-indigo-100 hover:text-white transition-colors shrink-0">
              로그아웃
            </button>
            <button onClick={() => setOpen(false)}
              className="w-7 h-7 rounded-lg hover:bg-white/10 flex items-center justify-center text-indigo-200"
              aria-label="채팅 닫기">✕</button>
          </div>

          {/* 메시지 목록 */}
          <div ref={listRef} className="flex-1 overflow-y-auto px-3 py-3 space-y-2.5 bg-slate-50">
            {msgs.length === 0 && (
              <div className="text-center text-[12px] text-slate-400 pt-10 leading-relaxed">
                아직 메시지가 없어요.<br />링크(주소)를 보내면 자동으로 클릭할 수 있게 돼요!
              </div>
            )}
            {msgs.map((m) => {
              const mine = m.uid === me.uid;
              return (
                <div key={m.id} className={`flex flex-col ${mine ? "items-end" : "items-start"}`}>
                  {!mine && (
                    <div className="text-[10.5px] text-slate-400 mb-0.5 px-1">
                      <b className="text-slate-600">{m.nick}</b>{m.school ? ` · ${m.school}` : ""}
                    </div>
                  )}
                  <div className={`max-w-[85%] px-3 py-2 rounded-2xl text-[12.5px] leading-relaxed whitespace-pre-wrap break-words shadow-sm ${
                    mine ? "bg-indigo-600 text-white rounded-br-md" : "bg-white text-slate-700 border border-slate-200 rounded-bl-md"}`}>
                    {renderText(m.text, mine)}
                  </div>
                  <div className="text-[9.5px] text-slate-300 mt-0.5 px-1">{timeLabel(m.ts)}</div>
                </div>
              );
            })}
          </div>

          {/* 입력창 */}
          <div className="p-2.5 bg-white border-t border-slate-200 flex items-end gap-2 shrink-0">
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
                  e.preventDefault(); send();
                }
              }}
              rows={1}
              placeholder="메시지 또는 링크 입력… (Enter 전송)"
              className="flex-1 resize-none px-3 py-2 rounded-xl border border-slate-200 text-[12.5px] outline-none focus:border-indigo-400 bg-slate-50 focus:bg-white max-h-24"
            />
            <button onClick={send} disabled={!draft.trim() || sending}
              className="px-3.5 py-2 rounded-xl bg-indigo-600 text-white text-[12.5px] font-bold disabled:opacity-40 hover:bg-indigo-700 transition-colors shrink-0">
              전송
            </button>
          </div>
        </div>
      )}

      {/* 플로팅 버튼 */}
      <button
        onClick={() => {
          const next = !open;
          setOpen(next);
          if (next && msgs.length) markSeen(msgs[msgs.length - 1].ts);
        }}
        className="relative w-14 h-14 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-xl flex items-center justify-center text-2xl transition-transform hover:scale-105 active:scale-95"
        aria-label="선생님 채팅 열기">
        {open ? "✕" : "💬"}
        {!open && unread > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1.5 rounded-full bg-rose-500 text-white text-[11px] font-bold flex items-center justify-center border-2 border-white">
            {unread > 99 ? "99+" : unread}
          </span>
        )}
      </button>
    </div>
  );
}
