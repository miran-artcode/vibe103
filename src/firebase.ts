// ============================================================
//  Firebase 연결 — 여러 기기(연수생)끼리 실시간 공유를 켭니다.
//
//  쓰는 법:
//   1) Firebase 콘솔에서 프로젝트를 만들고 Firestore + 익명 인증을 켭니다.
//   2) '프로젝트 설정 > 내 앱 > SDK 설정 및 구성'의 연결 키(firebaseConfig)를
//      아래 빈 칸에 그대로 붙여넣습니다.
//   3) 콘솔 'Firestore > 규칙' 탭에 프로젝트 루트의 firestore.rules 내용을 붙여넣고 '게시'.
//      (또는 터미널에서 `firebase deploy --only firestore:rules`)
//
//  ※ 아래 apiKey 칸이 비어 있으면 Firebase를 쓰지 않고, 같은 기기에만 저장됩니다.
//
//  연결에 문제가 있으면(익명 인증 꺼짐 · 규칙 미게시 등) 화면 위
//  상태 배지가 🔴로 바뀌고 이유를 알려 줍니다 — 더 이상 조용히 실패하지 않아요.
// ============================================================
import { initializeApp } from "firebase/app";
import { getAuth, signInAnonymously } from "firebase/auth";
import {
  getFirestore, doc, getDoc, setDoc, onSnapshot, arrayUnion,
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCo5_C11e7R_1NExQvkZAjmenUEzpW1ceA",
  authDomain: "vibecodingclass-6a01c.firebaseapp.com",
  databaseURL: "https://vibecodingclass-6a01c-default-rtdb.firebaseio.com",
  projectId: "vibecodingclass-6a01c",
  storageBucket: "vibecodingclass-6a01c.firebasestorage.app",
  messagingSenderId: "389933895665",
  appId: "1:389933895665:web:de76fcf778a0066cac3e50",
};

// ── 연결 상태를 앱(헤더 배지)에 알려 주는 이벤트 ──
function setStatus(state: "connecting" | "ok" | "error", detail = "") {
  window.storageStatus = { state, detail };
  try { window.dispatchEvent(new CustomEvent("vc:storage-status", { detail: { state, detail } })); } catch {}
}

// Firestore 오류를 사람이 읽을 수 있는 안내로 바꿔 줍니다.
function explain(e: any): string {
  const code = e?.code || "";
  if (code === "permission-denied")
    return "권한 거부 — Firebase 콘솔에서 ① 익명 인증이 켜져 있는지 ② firestore.rules가 게시됐는지 확인하세요.";
  if (code === "unavailable") return "네트워크가 불안정해요. 연결되면 자동으로 복구됩니다.";
  if (code === "auth/admin-restricted-operation" || code === "auth/operation-not-allowed")
    return "익명 로그인이 꺼져 있어요 — Firebase 콘솔 > Authentication > 로그인 방법에서 '익명'을 켜 주세요.";
  return String(code || e?.message || e);
}

if (firebaseConfig.apiKey) {
  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const db = getFirestore(app);

  setStatus("connecting");

  // 익명 로그인(이름/이메일 없이 '같은 사람'만 구분) — 규칙의 request.auth != null 을 통과
  const ready = signInAnonymously(auth)
    .then(() => setStatus("ok"))
    .catch((e) => { console.error("익명 로그인 실패", e); setStatus("error", explain(e)); });

  const sharedRef = (key: string) => doc(db, "shared", key);

  // 앱이 쓰는 저장소(window.storage)를 Firestore로 연결합니다.
  //  - shared=true  (참여자 명단·퀴즈·방송·공유 마당 등) → Firestore 'shared' 컬렉션(기기 간 공유)
  //  - shared=false (내 별명/세션 같은 개인 식별값)       → 이 기기(localStorage)
  window.storage = {
    async get(key: string, shared = false) {
      if (!shared) {
        const v = localStorage.getItem("vc:" + key);
        return v ? { value: JSON.parse(v) } : null;
      }
      await ready;
      try {
        const snap = await getDoc(sharedRef(key));
        setStatus("ok");
        return snap.exists() ? { value: (snap.data() as any).value } : null;
      } catch (e) {
        console.error("공유 읽기 실패:", key, e);
        setStatus("error", explain(e));
        throw e;
      }
    },

    async set(key: string, value: any, shared = false) {
      if (!shared) {
        localStorage.setItem("vc:" + key, JSON.stringify(value));
        return { value };
      }
      await ready;
      try {
        await setDoc(sharedRef(key), { value });
        setStatus("ok");
        return { value };
      } catch (e) {
        console.error("공유 저장 실패:", key, e);
        setStatus("error", explain(e));
        throw e;
      }
    },

    // 배열 문서에 항목 하나를 안전하게 덧붙임 — 여러 명이 동시에 제출해도 서로 안 지워짐
    async push(key: string, item: any) {
      await ready;
      try {
        await setDoc(sharedRef(key), { value: arrayUnion(item) }, { merge: true });
        setStatus("ok");
      } catch (e) {
        console.error("공유 추가 실패:", key, e);
        setStatus("error", explain(e));
        throw e;
      }
    },

    // 객체(맵) 문서에서 내 필드만 병합 저장 — 시청자 수 심장박동 등에 사용
    async merge(key: string, patch: Record<string, any>) {
      await ready;
      try {
        await setDoc(sharedRef(key), { value: patch }, { merge: true });
        setStatus("ok");
      } catch (e) {
        console.error("공유 병합 실패:", key, e);
        setStatus("error", explain(e));
        throw e;
      }
    },

    // 실시간 구독 — 값이 바뀌는 즉시 cb(value) 호출 (퀴즈 발사·화면 방송이 곧바로 뜨는 핵심)
    subscribe(key: string, cb: (value: any) => void) {
      let unsub: (() => void) | null = null;
      let dead = false;
      ready.then(() => {
        if (dead) return;
        unsub = onSnapshot(
          sharedRef(key),
          (snap) => { setStatus("ok"); cb(snap.exists() ? (snap.data() as any).value : null); },
          (e) => { console.error("실시간 구독 실패:", key, e); setStatus("error", explain(e)); }
        );
      });
      return () => { dead = true; if (unsub) unsub(); };
    },
  };
}

export {};
