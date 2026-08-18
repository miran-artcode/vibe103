// ============================================================
//  Firebase 연결 (선택) — 여러 기기(연수생)끼리 실시간 공유를 켭니다.
//
//  쓰는 법:
//   1) Firebase 콘솔에서 프로젝트를 만들고 Firestore + 익명 인증을 켭니다.
//   2) '프로젝트 설정 > 내 앱 > SDK 설정 및 구성'의 연결 키(firebaseConfig)를
//      아래 빈 칸에 그대로 붙여넣습니다.
//   3) 콘솔 'Firestore > 규칙' 탭에 프로젝트 루트의 firestore.rules 내용을 붙여넣고 '게시'.
//
//  ※ 아래 apiKey 칸이 비어 있으면 Firebase를 쓰지 않고, 같은 기기에만 저장됩니다.
//    (배포는 그대로 되며, 공유 마당·우체통·명단이 그 기기 안에서만 작동)
// ============================================================
import { initializeApp } from "firebase/app";
import { getAuth, signInAnonymously } from "firebase/auth";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCo5_C11e7R_1NExQvkZAjmenUEzpW1ceA",
  authDomain: "vibecodingclass-6a01c.firebaseapp.com",
  databaseURL: "https://vibecodingclass-6a01c-default-rtdb.firebaseio.com",
  projectId: "vibecodingclass-6a01c",
  storageBucket: "vibecodingclass-6a01c.firebasestorage.app",
  messagingSenderId: "389933895665",
  appId: "1:389933895665:web:de76fcf778a0066cac3e50",
};

if (firebaseConfig.apiKey) {
  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const db = getFirestore(app);

  // 익명 로그인(이름/이메일 없이 '같은 사람'만 구분) — 규칙의 request.auth != null 을 통과
  const ready = signInAnonymously(auth).catch((e) => console.error("익명 로그인 실패", e));

  // 앱이 쓰는 저장소(window.storage)를 Firestore로 연결합니다.
  //  - shared=true  (참여자 명단·익명 의견·공유 마당·세션 설정) → Firestore 'shared' 컬렉션(기기 간 공유)
  //  - shared=false (내 별명/세션 같은 개인 식별값)              → 이 기기(localStorage)
  window.storage = {
    async get(key: string, shared = false) {
      await ready;
      if (!shared) {
        const v = localStorage.getItem("vc:" + key);
        return v ? { value: JSON.parse(v) } : null;
      }
      const snap = await getDoc(doc(db, "shared", key));
      return snap.exists() ? { value: (snap.data() as any).value } : null;
    },
    async set(key: string, value: any, shared = false) {
      await ready;
      if (!shared) {
        localStorage.setItem("vc:" + key, JSON.stringify(value));
        return { value };
      }
      await setDoc(doc(db, "shared", key), { value });
      return { value };
    },
  };
}

export {};
