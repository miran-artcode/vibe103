# 바이브 코딩 연수 동반자 — 배포 안내

React + Vite로 만든 단일 페이지 앱입니다. **GitHub → (Firebase) → Netlify** 순서로 올리면 됩니다.

---

## 0. 미리 준비
- Node.js 18+ 설치 (https://nodejs.org)
- 터미널에서 프로젝트 폴더로 이동 후:
  ```bash
  npm install      # 라이브러리 설치 (처음 한 번)
  npm run dev      # 로컬 미리보기 (http://localhost:5173)
  npm run build    # 배포용 빌드 → dist/ 폴더 생성
  ```

---

## 1. 폴더·파일이 하는 일 (어떤 파일을 어디에)
```
vibe-coding-app/
├─ index.html              ← 화면의 뼈대(루트). 여기서 src/main.tsx를 불러옴
├─ package.json            ← 라이브러리 목록·실행 명령
├─ vite.config.ts          ← 빌드 도구 설정 (건드릴 일 거의 없음)
├─ tailwind.config.js      ← 스타일(Tailwind) 설정
├─ netlify.toml            ← Netlify 배포 설정(빌드 명령·새로고침 404 방지)
├─ firestore.rules         ← ★ Firebase 콘솔 '규칙' 탭에 붙여넣을 보안 규칙
├─ public/
│  ├─ _redirects                  ← 새로고침 404 방지(Netlify)
│  ├─ vibe-practice-claude.html   ← '심화 화면 가이드(Claude)' 링크 대상
│  └─ vibe-practice-guide.html    ← '심화 화면 가이드(Antigravity)' 링크 대상
└─ src/
   ├─ App.tsx              ← 앱 본체(학습 지도·용어·실습 키트·공유 마당 등)
   ├─ main.tsx             ← 앱을 화면에 띄우는 진입 파일
   ├─ firebase.ts          ← ★ Firebase 연결 키를 넣는 곳(선택)
   └─ index.css            ← Tailwind 불러오기
```
> public/ 안의 파일은 빌드 시 그대로 사이트 최상위에 복사됩니다.
> 그래서 두 '심화 화면 가이드'가 `사이트주소/vibe-practice-claude.html` 로 열립니다.

---

## 2. GitHub에 올리기
```bash
git init
git add .
git commit -m "바이브 코딩 연수 동반자"
# GitHub에서 새 저장소(repository)를 만든 뒤, 안내된 주소로:
git branch -M main
git remote add origin https://github.com/사용자명/저장소명.git
git push -u origin main
```
> `.gitignore`가 있어 `node_modules`와 키가 든 파일은 올라가지 않습니다.

---

## 3. Firebase 설정 (여러 기기 실시간 공유가 필요할 때만 / 선택)
앱은 Firebase 없이도 배포·작동합니다(같은 기기에만 저장). **여러 연수생이 기기 너머로 같은 공유 마당·우체통을 보려면** 아래를 합니다.

붙여넣기는 **두 곳**입니다 — ① 연결 키는 *코드*에, ② 보안 규칙은 *콘솔*에.

1. https://console.firebase.google.com → **프로젝트 추가** (이름 자유, 애널리틱스 꺼도 됨)
2. 왼쪽 **Firestore Database → 데이터베이스 만들기** → 위치 `asia-northeast3(서울)` → **프로덕션 모드**로 시작 (테스트 모드 X)
3. 왼쪽 **Authentication → 시작하기 → Sign-in method → '익명(Anonymous)' 사용 설정 ON**
4. **① 연결 키:** 톱니바퀴(프로젝트 설정) → '내 앱'에서 **웹 앱(</>) 추가** → `firebaseConfig` 값을 복사 →
   `src/firebase.ts` 의 `firebaseConfig = { ... }` 빈 칸(apiKey/authDomain/projectId/appId)에 붙여넣기
5. **② 보안 규칙:** Firestore → 상단 **'규칙(Rules)'** 탭 → 이 프로젝트의 **`firestore.rules`** 내용을 통째로 붙여넣고 **'게시(Publish)'**
6. 저장 후 다시 `npm run build` → 배포(아래 4번). 이제 같은 사이트를 연 여러 기기가 공유 마당·우체통·명단을 함께 봅니다.

> 규칙 요약: `shared` 컬렉션은 **익명 인증으로 로그인한 사용자만** 읽고 쓸 수 있고, 나머지는 모두 차단입니다(테스트 모드 아님). 교실용 간단 규칙이며, 더 엄격히 하려면 세션별 권한을 추가하면 됩니다.

---

## 4. Netlify로 배포 (둘 중 하나)
### 방법 A — GitHub 연결(자동 배포, 추천)
1. https://app.netlify.com → **Add new site → Import an existing project → GitHub** → 저장소 선택
2. 빌드 설정 자동 인식(없으면 직접 입력):
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
3. **Deploy** → 공개 주소 생성. 이후 GitHub에 push할 때마다 자동 재배포됩니다.

### 방법 B — 드래그 배포(가장 간단)
1. 로컬에서 `npm run build` → `dist/` 폴더 생성
2. https://app.netlify.com/drop 에 **dist 폴더**를 끌어다 놓기 → 몇 초 뒤 공개 주소
3. (선택) Site settings → **Change site name** 으로 주소를 `our-class.netlify.app` 처럼 변경

> 새로고침 404? `netlify.toml`과 `public/_redirects`가 이미 처리합니다.

---

## 5. 운영자(강사) 설정
- 배포된 사이트 우상단 **자물쇠 아이콘 → 운영자 페이지** → 세션 비밀번호를 처음 정하면 됩니다.
- '세션 설정'에서 **세션 코드 안내, 학교/섹션명, 공지, 공유 마당 켜기/끄기**를 바꿀 수 있습니다.
- 참여자는 입장 화면에서 **같은 세션 코드**를 넣으면 같은 방으로 모입니다.
