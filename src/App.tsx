import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  Home, Map as MapIcon, BookOpen, Wrench, Inbox, HelpCircle, GraduationCap, Sparkles,
  Search, Copy, Check, X, Users, RefreshCw, ChevronRight, ChevronDown, Lightbulb,
  AlertTriangle, Quote, Send, Eye, EyeOff, Shield, ListChecks, Rocket,
  Lock, Server, Database, Layout, Terminal, ArrowRight, ArrowLeft,
  GitBranch, Folder, FolderOpen, FileCode, FileText, Play, Compass,
  Layers, Cpu, MessageSquare, Bug, Table as TableIcon, Boxes, Wallet, Code2,
  Sliders, Maximize2, Circle, Newspaper, ExternalLink, TrendingUp, Share2, Link2,
  Trophy, Zap
} from "lucide-react";

/* ============================================================
   STORAGE HELPERS
   - window.storage(공유): 같은 세션 참여자끼리 실시간 공유 (Claude/연동 환경)
   - localStorage 폴백: 배포 환경에서 같은 기기에는 저장됨
   - 기기 간(여러 참여자) 공유까지 하려면 window.storage를 Firestore로 연결하세요
   ============================================================ */
const STORAGE_OK = typeof window !== "undefined" && !!window.storage;          // 진짜 '공유' 가능 여부
const LS_OK = typeof window !== "undefined" && !!window.localStorage;
async function sGet(key, shared = false) {
  if (STORAGE_OK) { try { const r = await window.storage.get(key, shared); return r ? r.value : null; } catch {} }
  if (LS_OK) { try { const v = window.localStorage.getItem("vc:" + key); return v ? JSON.parse(v) : null; } catch {} }
  return null;
}
async function sSet(key, val, shared = false) {
  if (STORAGE_OK) { try { return await window.storage.set(key, val, shared); } catch {} }
  if (LS_OK) { try { window.localStorage.setItem("vc:" + key, JSON.stringify(val)); return { key, value: val }; } catch {} }
  return null;
}

/* ============================================================
   NEWS — 연수와 연결되는 최신 소식 (각 카드는 원문 링크로 이동)
   img 칸에 권리를 확보한 이미지 링크를 넣으면 커버로 표시됩니다(비우면 색상 커버).
   ============================================================ */
const NEWS = [
  { tag: "화제", color: "amber", emoji: "🏆", domain: "cnn.com", img: "", title: "‘바이브 코딩’, 콜린스 사전 2025 올해의 단어", source: "CNN · Collins", date: "2025.11",
    url: "https://www.cnn.com/2025/11/06/tech/vibe-coding-collins-word-year-scli-intl",
    sum: "“변수가 아니라 분위기로 하는 프로그래밍”이라는 표현이 2월 등장 이후 사용량이 급증해 올해의 단어로 뽑혔습니다. 카파시가 만든 말이에요.",
    why: "우리가 배우는 바로 그 흐름이 전 세계적 현상이 됐다는 신호." },
  { tag: "꼭 알기", color: "rose", emoji: "🔓", domain: "thehackernews.com", img: "", title: "검토 없이 배포된 ‘바이브 코딩’ 앱, 데이터가 줄줄 샜다", source: "Hostinger · The Hacker News", date: "2026.05",
    url: "https://www.hostinger.com/blog/vibe-coding-news",
    sum: "한 앱은 아무도 점검하지 않은 채 배포돼 인증 토큰 150만 개와 이메일 3.5만 개가 노출됐고, 공개된 취약 앱이 2,000건 넘게 발견됐습니다.",
    why: "오늘 배운 ‘테스트 모드 닫기 · 보안 규칙’이 왜 필수인지 보여주는 실제 사고." },
  { tag: "반전 연구", color: "indigo", emoji: "🐢", domain: "metr.org", img: "", title: "AI 쓴 숙련 개발자가 오히려 19% 더 느렸다 (METR)", source: "METR · Reuters", date: "2025.07",
    url: "https://metr.org/blog/2025-07-10-early-2025-ai-experienced-os-dev-study/",
    sum: "엄격한 무작위 실험에서 AI 도구를 쓴 개발자가 19% 더 느렸는데, 정작 본인들은 20% 빨라졌다고 느꼈습니다. ‘체감’과 ‘실측’의 큰 간극.",
    why: "“빠르게”와 “검증”의 균형 — 학생 데이터가 걸린 도구는 깐깐하게." },
  { tag: "현장 수치", color: "emerald", emoji: "📊", domain: "keyholesoftware.com", img: "", title: "개발자 92%가 AI 코딩 도구 사용, 그러나 29%만 신뢰", source: "Keyhole Software", date: "2026",
    url: "https://keyholesoftware.com/vibe-coding-trends-2026/",
    sum: "AI 코딩은 일상이 됐지만, 결과 코드를 신뢰한다는 응답은 29%뿐. ‘비판적으로 받아들이기’가 핵심 역량이 됐습니다.",
    why: "AI의 “완벽하게 했습니다”를 그대로 믿지 말자는 우리 원칙과 일치." },
  { tag: "배울 기회", color: "sky", emoji: "🎓", domain: "blog.google", img: "", title: "구글·Kaggle 무료 5일 ‘바이브 코딩’ 집중 과정", source: "Google", date: "2026.06",
    url: "https://blog.google/innovation-and-ai/technology/developers-tools/kaggle-genai-intensive-course-vibe-coding-june-2026/",
    sum: "자연어로 AI 에이전트를 만드는 5일 온라인 과정이 무료로 다시 열렸습니다. 개념 강의 + 실습 캡스톤으로 구성.",
    why: "연수 이후 더 배우고 싶은 선생님께 추천하는 무료 자료." },
];
const NEWS_STATS = [
  { n: "40%", l: "새 SaaS MVP 중 바이브 코딩 비중" },
  { n: "25%", l: "YC ’25 겨울 스타트업: 코드 95% AI 생성" },
  { n: "92%", l: "AI 코딩 도구를 매일 쓰는 개발자" },
];
const TAGC = {
  amber: { chip: "bg-amber-100 text-amber-700", grad: "from-amber-400 to-orange-500" },
  rose: { chip: "bg-rose-100 text-rose-700", grad: "from-rose-400 to-rose-600" },
  indigo: { chip: "bg-indigo-100 text-indigo-700", grad: "from-indigo-400 to-indigo-600" },
  emerald: { chip: "bg-emerald-100 text-emerald-700", grad: "from-emerald-400 to-teal-500" },
  sky: { chip: "bg-sky-100 text-sky-700", grad: "from-sky-400 to-cyan-500" },
};

/* ============================================================
   GLOSSARY — 용어 사전 (클릭 시 팝업)
   ============================================================ */
const GLOSSARY = {
  vibe: { term: "바이브 코딩", en: "Vibe Coding", c: "개념",
    def: "복잡한 문법을 직접 치는 대신, 자연어로 의도(Vibe)와 원하는 결과를 설명하면 AI가 작동하는 코드를 대신 만들어 주는 개발 방식.",
    body: "사람은 ‘무엇을·왜’(의도와 목적)에 집중하고, ‘어떻게 구현하는가’(함수·문법·에러 수정)는 [[llm|AI]]에 맡깁니다. 그래서 핵심 역량이 ‘코드 암기’에서 ‘원하는 것을 정확히 설명하고, 나온 결과를 검증하는 능력’으로 옮겨갑니다. 같은 AI라도 어떻게 요청하느냐([[context-eng|컨텍스트 엔지니어링]])에 따라 결과 품질이 크게 달라집니다.",
    analogy: "레시피를 한 줄씩 직접 쓰는 대신 “매콤달콤한 떡볶이 느낌으로, 2인분, 안 맵게”라고 주문하면 알아서 만들어 주는 주방. 주문(요청)이 구체적일수록 결과가 좋아집니다.",
    tip: "‘완성품을 한 번에’ 기대하지 말고, 작은 기능부터 만들어 보며 대화로 다듬어 가세요." },
  karpathy: { term: "유래 — 안드레이 카파시", en: "Andrej Karpathy", c: "개념",
    def: "2025년 2월, AI 연구자 안드레이 카파시가 SNS에 올린 표현에서 대중화된 용어.",
    body: "그는 오픈AI 공동 창립자이자 테슬라 AI 책임자를 지낸 인물입니다. “코드를 거의 들여다보지 않고 그냥 되는 대로 받아들인다”는 가벼운 태도를 ‘vibe coding’이라 불렀고, 이 한마디가 흐름의 이름이 되었습니다.",
    warn: "원래는 ‘즉흥적·실험적 태도’를 가리킵니다. 혼자 빠르게 시제품을 만들 땐 좋지만, 학생이 쓰는 실서비스라면 ‘되는 대로’가 아니라 ‘검증하고 배포’해야 합니다 — 그래서 이 연수는 속도와 안전을 함께 다룹니다." },
  llm: { term: "LLM (대규모 언어모델)", en: "Large Language Model", c: "개념",
    def: "방대한 텍스트로 학습해, 주어진 맥락에서 ‘다음에 올 말’을 확률적으로 예측하는 AI 모델.",
    body: "ChatGPT·Gemini·Claude 등이 모두 LLM이며, 바이브 코딩에서는 코드를 생성하는 ‘두뇌’ 역할을 합니다. 글자를 [[token|토큰]] 단위로 다루고, 한 번에 기억할 수 있는 양에 한도([[context-window|컨텍스트 윈도우]])가 있습니다. 의미를 ‘이해’한다기보다 패턴을 잇는 것이라, 그럴듯하지만 틀린 답을 자신 있게 내놓는 [[hallucination|할루시네이션]] 한계가 있습니다.",
    analogy: "엄청나게 많은 글을 읽고 ‘다음 단어 맞히기’를 훈련한 자동완성. 똑똑하지만 사실 확인은 사람 몫.",
    tip: "정확한 사실·최신 정보가 필요한 부분은 공식 문서를 함께 주거나 직접 확인하세요." },
  "context-eng": { term: "컨텍스트 엔지니어링", en: "Context Engineering", c: "프롬프트",
    def: "단순한 한 줄 지시를 넘어, 배경·제약·현재 상태 같은 ‘맥락’을 설계해 전달하는 기술.",
    body: "성공률을 좌우하는 5요소는 ① 기술 스택 ② 현재 코드 상태 ③ 원하는 결과와 제약 ④ 에러 상황 ⑤ 참고 문서입니다. 이 맥락을 정돈해 줄수록 AI가 헤매지 않고, [[hallucination|할루시네이션]]도 줄어듭니다. 단, AI가 한 번에 읽는 한도([[context-window|컨텍스트 윈도우]]) 안에서 ‘핵심만’ 추려 주는 것이 요령입니다.",
    analogy: "의사에게 “아파요” 대신 “어제 저녁부터 오른쪽 아랫배가 콕콕 쑤시고 열이 38도예요”라고 콕 집어 말하기. 단서가 많을수록 정확한 처방이 나옵니다.",
    tip: "입문과 중·고급을 가르는 가장 중요한 역량입니다. 실습 키트의 프롬프트 생성기가 이 5요소를 자동으로 갖춰 줍니다." },
  "context-window": { term: "컨텍스트 윈도우", en: "Context Window", c: "프롬프트",
    def: "AI가 한 번의 대화에서 동시에 읽고 기억할 수 있는 정보의 최대 한도.",
    body: "이 한도를 넘으면 대화 앞부분을 잊어버려, 방금 정한 규칙을 어기거나 엉뚱한 답을 합니다. 그래서 모든 정보를 한꺼번에 쏟아붓기보다, 지금 필요한 핵심만 정돈해 주는 편이 결과가 좋습니다. 길어진 대화는 중간 요약을 한 번 넣어 주면 안정적입니다.",
    analogy: "한 번에 들고 갈 수 있는 쟁반의 크기. 접시를 너무 많이 올리면 앞쪽 것이 미끄러져 떨어집니다.",
    tip: "대화가 길어져 AI가 헷갈리기 시작하면, 핵심 요구사항을 다시 정리해 새로 알려 주세요." },
  prompt: { term: "프롬프트", en: "Prompt", c: "프롬프트",
    def: "AI에게 주는 지시·질문 한 덩어리.",
    body: "“앱 만들어 줘” 같은 모호한 한 줄보다, 무엇을·어떤 기술로·어떤 제약으로 만들지 구체적으로 적은 프롬프트가 훨씬 안정적인 결과를 냅니다. 좋은 프롬프트는 보통 ‘역할 + 목표 + 제약 + 형식’을 담습니다.",
    analogy: "택시 기사에게 “시내요”가 아니라 “시청 정문, 12분 안에, 큰길로요”라고 말하는 것.",
    tip: "결과가 마음에 안 들면 처음부터 다시 쓰지 말고, ‘무엇을 바꿔 달라’고 한 가지씩 이어서 요청하세요." },
  hallucination: { term: "할루시네이션 (환각)", en: "Hallucination", c: "프롬프트",
    def: "AI가 그럴듯하지만 사실이 아닌 코드·정보를 자신 있게 만들어 내는 현상.",
    body: "존재하지 않는 기능을 갖다 쓰거나, 틀린 코드를 두고도 “완벽히 고쳤습니다”라고 우길 수 있습니다. 학습한 패턴을 ‘이어 붙이는’ 원리 때문에 생기는 [[llm|LLM]]의 근본 한계라, 완전히 없앨 수는 없고 ‘전제하고 대비’해야 합니다.",
    analogy: "아는 척이 몸에 밴 사람 — 모르는 길도 “이쪽이 확실해요!”라고 당당하게 안내합니다.",
    warn: "AI 결과를 맹신하지 말고 항상 직접 테스트·검증하세요. 특히 [[rules|보안]]·개인정보가 걸린 부분은 사람이 최종 확인합니다." },
  token: { term: "토큰", en: "Token", c: "프롬프트",
    def: "AI가 글자를 읽고 처리하는 최소 단위(단어·조각).",
    body: "AI는 문장을 통째로가 아니라 토큰 조각으로 나눠 다룹니다. 보통 토큰 사용량에 따라 [[api|API]] 비용이 매겨지고, 프롬프트가 길수록 토큰을 더 씁니다. 한국어는 영어보다 같은 의미라도 토큰이 더 들 수 있습니다.",
    analogy: "글을 레고 블록으로 쪼개 다루는 것. 블록이 많을수록(글이 길수록) 처리 비용도 늘어납니다.",
    tip: "꼭 필요한 맥락만 담으면 비용도 줄고 정확도도 올라가는 ‘일석이조’." },
  mvp: { term: "MVP", en: "Minimum Viable Product", c: "개념",
    def: "핵심 기능 하나만 갖춘 ‘최소한으로 쓸 만한 제품’을 빠르게 만들어 검증하는 것.",
    body: "완벽한 기획을 다 짜기 전에 ‘이게 진짜 쓸모 있나?’를 먼저 확인하는 전략입니다. 아이디어에서 작동하는 형태까지의 거리를 극적으로 줄여, 빠르게 피드백을 받고 방향을 잡을 수 있습니다.",
    analogy: "분식집을 차리기 전에, 떡볶이 한 가지만 학교 앞에서 팔아 반응을 보는 것.",
    tip: "“설문 받기”처럼 가장 중요한 기능 하나로 시작하고, 작동을 확인한 뒤 기능을 더하세요." },
  prototype: { term: "프로토타입", en: "Prototype", c: "개념",
    def: "아이디어를 빠르게 작동하는 형태로 만든 시제품.",
    body: "‘말로 설명하기 어려운 것’을 직접 만져 보게 해 줍니다. 바이브 코딩이 가장 강한 영역으로, 회의에서 “이런 느낌”을 백 마디로 설명하는 대신 5분 만에 화면을 띄워 보여줄 수 있습니다.",
    analogy: "건물을 짓기 전에 만드는 ‘종이·스티로폼 모형’. 완성품은 아니지만 모양과 동선을 확인할 수 있죠.",
    tip: "프로토타입은 ‘버려도 되는’ 실험입니다. 완벽하게 다듬으려 애쓰지 말고 빠르게 만들어 확인하세요." },
  crud: { term: "CRUD", en: "Create·Read·Update·Delete", c: "개념",
    def: "데이터의 생성(Create)·조회(Read)·수정(Update)·삭제(Delete) — 데이터 중심 앱의 4대 기본 동작.",
    body: "설문 응답을 ‘만들고’, 목록을 ‘보고’, 내용을 ‘고치고’, 항목을 ‘지우는’ 식으로 거의 모든 학급 도구가 이 패턴의 조합입니다. 패턴이 정형적이고 예시가 풍부해, AI 생성 성공률이 가장 높은 ‘승리 구간’입니다.",
    analogy: "학급 알림장: 글 쓰기(C)·읽기(R)·고치기(U)·지우기(D). 이 네 동작이 데이터 앱의 전부라 해도 과언이 아니에요.",
    tip: "복잡한 계산·자동화보다 ‘수집·조회·공유’형으로 기획하면 AI가 훨씬 잘 만듭니다." },
  client: { term: "클라이언트", en: "Client", c: "웹 구조",
    def: "서비스에 접속해 요청하는 쪽 — 학생·교사의 스마트폰·PC 브라우저.",
    body: "사용자가 보는 화면([[frontend|프론트엔드]])이 도는 곳입니다. 버튼을 누르면 클라이언트가 [[server|서버]]에 “이 데이터 줘/저장해”라고 요청하고, 받은 결과를 화면에 그립니다.",
    analogy: "식당에서 주문하는 손님. (“페이지 줘!”, “이거 저장해 줘!”)",
    tip: "“내 폰에선 되는데 친구 폰에선 안 돼요”의 상당수는 클라이언트(브라우저·기기) 차이 때문입니다." },
  server: { term: "서버", en: "Server", c: "웹 구조",
    def: "24시간 켜져서 요청을 받아 처리하고 데이터를 돌려주는 컴퓨터.",
    body: "[[client|클라이언트]]의 요청을 받아 [[database|DB]]를 조회·저장하고 결과를 응답합니다. 직접 운영하면 관리가 까다로워, [[firebase|Firebase]] 같은 [[baas|BaaS]]로 ‘빌려’ 쓰는 경우가 많습니다.",
    analogy: "주문을 받아 음식을 만들어 내주는 가게 주방. (“여기 있습니다!”)",
    tip: "학급 도구는 서버를 직접 만들기보다 Firebase로 대체하면 시간과 위험을 크게 줄입니다." },
  database: { term: "데이터베이스", en: "Database", c: "웹 구조",
    def: "데이터를 안전하게 저장하고 빠르게 찾아 쓰도록 구조화한 저장소.",
    body: "단순 파일에 적는 것보다 안전하고, 여러 명이 동시에 접속해도 꼬이지 않게 처리합니다. 검색·정렬·조건 조회가 빠르고, 권한과 백업도 관리됩니다. 웹앱에서 ‘기억’을 담당하는 핵심 부품입니다.",
    analogy: "낱장 메모지 더미가 아니라, 색인이 잘 된 도서관 서가 + 대출 장부.",
    tip: "Firebase에서는 [[firestore|Firestore]]가 이 역할을 합니다 — 별도 설치 없이 바로 씁니다." },
  localhost: { term: "로컬호스트", en: "localhost", c: "웹 구조",
    def: "나만 볼 수 있는, 내 PC 안에서 도는 실행 환경(주소).",
    body: "개발 중인 앱은 보통 먼저 로컬호스트에서 돌려보며 확인합니다. 이 단계에선 인터넷의 다른 사람은 접속할 수 없습니다. 여기서만 돌던 것을 인터넷에 올려 공개 주소를 얻는 과정이 [[deploy|배포]]입니다.",
    analogy: "아직 가게를 열기 전, 집 주방에서 시식해 보는 단계. 손님은 아직 못 옵니다.",
    tip: "“링크를 줬는데 친구가 못 들어가요”는 로컬호스트 주소를 공유했기 때문일 수 있어요 — 배포 후 받은 공개 URL을 보내야 합니다." },
  frontend: { term: "프론트엔드", en: "Frontend", c: "웹 구조",
    def: "사용자에게 직접 보이고 동작하는 ‘화면’ 계층. [[html|HTML]]·[[css|CSS]]·[[js|JavaScript]], [[react|React]] 등으로 만듭니다.",
    body: "버튼·입력창·색·배치 등 우리가 눈으로 보고 손으로 누르는 모든 것이 프론트엔드입니다. 다만 화면만으로는 데이터를 ‘기억’하지 못해, 저장이 필요하면 [[backend|백엔드]]가 받쳐 줘야 합니다.",
    analogy: "손님이 머무는 식당 ‘홀’ — 분위기와 메뉴판, 주문 버튼이 여기에 있습니다.",
    warn: "뚝딱 만든 웹은 대개 ‘프론트엔드만’ 있어서, 학생이 입력한 내용을 저장할 [[backend|주방]]이 없으면 새로고침 한 번에 다 사라집니다." },
  backend: { term: "백엔드", en: "Backend", c: "웹 구조",
    def: "눈에 보이지 않는 곳에서 데이터와 로직을 처리하는 계층. [[server|서버]]·[[database|DB]]·[[api|API]].",
    body: "입력값을 검증하고, 데이터를 저장·조회하고, ‘로그인한 사람만 접근’ 같은 보안을 처리합니다. 화면([[frontend|프론트엔드]])이 ‘보이는 일’을 한다면, 백엔드는 ‘기억하고 판단하는 일’을 합니다.",
    analogy: "요리와 재고를 책임지는 식당 ‘주방’ — 손님 눈엔 안 보이지만 핵심.",
    tip: "[[firebase|Firebase]]를 쓰면 이 백엔드를 직접 만들지 않고 통째로 빌려 쓰므로, 비개발 교사도 데이터 앱을 만들 수 있습니다." },
  html: { term: "HTML", en: "HyperText Markup Language", c: "웹 구조",
    def: "웹 페이지의 뼈대(구조와 내용)를 정의하는 언어.",
    body: "제목·문단·이미지·버튼·입력창 같은 ‘요소’를 태그로 배치해 페이지의 골격을 만듭니다. 꾸밈은 [[css|CSS]], 동작은 [[js|JavaScript]]가 맡으므로, HTML 자체는 ‘무엇이 어디에 있는지’만 담당합니다.",
    analogy: "건물의 철골과 벽 — 방의 위치와 크기를 정하는 ‘구조’. 페인트나 가구는 아직 없습니다.",
    tip: "AI가 만든 화면을 조금 고치고 싶을 때, 어떤 ‘태그’를 바꾸면 되는지 물어보면 핀포인트 수정이 쉬워요." },
  css: { term: "CSS", en: "Cascading Style Sheets", c: "웹 구조",
    def: "[[html|HTML]]로 만든 뼈대에 색·글꼴·여백·크기·배치 등 ‘보이는 스타일’을 입히는 언어.",
    body: "‘어떤 요소를’(선택자) ‘어떻게 보이게 할지’(속성)를 규칙으로 적습니다. 같은 요소에 여러 규칙이 겹치면 우선순위에 따라 적용되는데, 이 ‘폭포처럼 흘러내리는(Cascading)’ 규칙 때문에 이름이 CSS입니다. 화면 크기에 따라 배치를 바꾸는 ‘반응형’도 CSS가 담당해, 폰·태블릿·교실 TV에서 모두 보기 좋게 만들 수 있습니다.",
    analogy: "똑같이 지은 건물에 페인트·조명·가구 배치를 더하는 ‘인테리어’. 구조(HTML)는 그대로 두고 분위기를 바꿉니다.",
    tip: "“글자를 더 크게”, “버튼을 파란색으로”, “모바일에서 한 줄로” 같은 요청은 전부 CSS 수정이에요 — AI에게 자연어로 말하면 바꿔 줍니다." },
  js: { term: "JavaScript", en: "JavaScript", c: "웹 구조",
    def: "버튼 클릭·입력·계산·화면 갱신 같은 ‘동작’을 담당하는 웹의 프로그래밍 언어.",
    body: "[[html|HTML]](구조)·[[css|CSS]](꾸밈)에 ‘생명’을 불어넣어, 사용자의 행동에 반응하게 만듭니다. 데이터를 [[server|서버]]·[[firestore|Firestore]]에 보내고 받아 와 화면에 그리는 일도 자바스크립트가 처리합니다. 웹에서 가장 널리 쓰이는 언어입니다.",
    analogy: "건물의 ‘전기·자동문·엘리베이터’ — 버튼을 누르면 실제로 무언가 작동하게 하는 부분.",
    tip: "“제출하면 알림이 뜨게”, “입력이 비면 막아 줘” 같은 동작 요청이 모두 자바스크립트 영역입니다." },
  react: { term: "React", en: "React", c: "웹 구조",
    def: "복잡한 화면을 재사용 가능한 ‘부품(컴포넌트)’으로 나눠 효율적으로 만드는 [[frontend|프론트엔드]] 라이브러리(메타 개발).",
    body: "‘카드’, ‘버튼’, ‘목록 항목’처럼 화면을 작은 부품으로 쪼개 조립하고, 데이터가 바뀌면 해당 부분만 자동으로 다시 그립니다. 이 동반자 앱도 React로 만들어졌어요. 규모가 커질수록 관리가 쉬워지는 대신, 단순 페이지엔 다소 무거울 수 있습니다.",
    analogy: "레고 블록 — 똑같은 ‘버튼 블록’을 여러 곳에 끼워 쓰고, 한 블록만 바꾸면 그 자리만 바뀝니다.",
    tip: "무료 [[classic-hosting|클래식 Hosting]]에 올리려면, React로 만들되 ‘서버 없는 [[static|정적 앱]]’으로 빌드해 달라고 명시하세요." },
  mvc: { term: "MVC 모델", en: "Model-View-Controller", c: "웹 구조",
    def: "앱을 데이터(Model)·화면(View)·중개 로직(Controller)으로 나누는 설계 패턴.",
    body: "역할을 분리해 두면 화면만 바꾸거나 데이터 구조만 손볼 때 서로 영향이 적어, 유지보수와 협업이 쉬워집니다. 규모 있는 앱의 코드를 ‘정리정돈’하는 대표적 방식입니다.",
    analogy: "식당으로 치면 창고(Model)·홀(View)·점장(Controller)이 각자 역할만 맡아, 한쪽을 바꿔도 다른 쪽이 흔들리지 않는 것.",
    tip: "오래 쓸 도구라면 AI에게 “역할을 분리해 정리해 줘”라고 요청하면 나중에 고치기 편합니다." },
  sql: { term: "SQL", en: "Structured Query Language", c: "웹 구조",
    def: "데이터베이스에서 데이터를 찾고·넣고·고치고·지울 때 쓰는 표준 질의 언어.",
    body: "“성적이 90점 이상인 학생만 보여 줘” 같은 조건 조회를 명령으로 표현합니다. 행·열로 된 ‘관계형 DB’에서 주로 쓰이며, [[firestore|Firestore]] 같은 [[nosql|NoSQL]]은 방식이 다릅니다.",
    analogy: "도서관 사서에게 건네는 ‘정해진 양식의 검색 요청서’ — 형식을 지키면 원하는 책을 정확히 찾아 줍니다.",
    tip: "Firebase로 만드는 학급 도구에선 SQL을 직접 쓸 일이 거의 없습니다 — 개념만 알아 두면 충분." },
  json: { term: "JSON", en: "JavaScript Object Notation", c: "웹 구조",
    def: "사람도 기계도 읽기 쉬운, 텍스트 기반의 데이터 표현 형식.",
    body: "‘이름: 값’ 쌍으로 데이터를 표현해, 프로그램끼리 데이터를 주고받는 사실상의 공용어입니다. [[api|API]] 응답이나 [[firestore|Firestore]] 문서도 이 형태와 닮았습니다.",
    analogy: "칸과 항목이 또렷한 ‘택배 송장’ — 누가 봐도 무엇이 어디에 적혀 있는지 알 수 있습니다.",
    tip: "AI가 보여 주는 데이터가 중괄호 { }로 둘러싸여 있으면 대개 JSON입니다 — 겁먹지 말고 ‘항목: 값’으로 읽으세요." },
  ip: { term: "IP 주소", en: "IP Address", c: "웹 구조",
    def: "인터넷에 연결된 모든 기기에 부여되는 숫자로 된 고유 주소.",
    body: "데이터를 정확한 컴퓨터로 보내기 위한 ‘번지수’입니다. 사람이 외우기 어려워서, 이름(naver.com)을 IP로 바꿔 주는 [[dns|DNS]]가 함께 쓰입니다.",
    analogy: "건물마다 붙은 도로명 주소 숫자 — 택배(데이터)가 정확한 집을 찾아가게 합니다.",
    tip: "배포하면 사람이 읽는 도메인 주소를 받으므로, IP를 직접 다룰 일은 거의 없습니다." },
  dns: { term: "DNS", en: "Domain Name System", c: "웹 구조",
    def: "사람이 읽는 도메인 이름(naver.com)을 실제 [[ip|IP 주소]]로 바꿔 주는 인터넷의 ‘전화번호부’.",
    body: "우리가 주소창에 이름을 치면, DNS가 그 이름에 해당하는 IP를 찾아 연결해 줍니다. 도메인을 새로 연결하면 이 정보가 퍼지는 데 시간이 조금 걸리기도 합니다.",
    analogy: "이름만 알면 번호를 찾아 주는 전화번호부 — “김선생님”을 누르면 알아서 그 번호로 거는 것.",
    tip: "[[hosting|Firebase Hosting]]은 기본 주소(.web.app)를 바로 주므로, 처음엔 DNS를 몰라도 됩니다." },
  port: { term: "포트", en: "Port", c: "웹 구조",
    def: "한 컴퓨터 안에서 서비스별로 나뉜 여러 ‘통신 통로’ 번호.",
    body: "같은 컴퓨터라도 웹(보통 80·443)·다른 프로그램이 서로 다른 포트를 써서 신호가 섞이지 않습니다. 개발 중엔 localhost:5173처럼 포트 번호가 붙은 주소를 자주 봅니다.",
    analogy: "한 건물(IP)에 있는 여러 ‘부서별 창구 번호’ — 민원마다 가야 할 창구가 다릅니다.",
    tip: "“localhost:3000” 같은 주소의 숫자가 바로 포트입니다 — 그 자체로 신경 쓸 일은 거의 없어요." },
  http: { term: "HTTP", en: "HyperText Transfer Protocol", c: "웹 구조",
    def: "웹에서 [[client|클라이언트]]와 [[server|서버]]가 데이터를 주고받는 통신 규약(약속).",
    body: "“이 페이지 줘(GET)”, “이 데이터 저장해(POST)”처럼 정해진 방식으로 요청·응답을 주고받습니다. 이 공통 약속 덕분에 서로 다른 기기·프로그램이 문제없이 대화합니다.",
    analogy: "전 세계가 공유하는 ‘주문서 양식’ — 같은 양식을 쓰니 어느 가게에서도 통합니다.",
    warn: "그냥 HTTP는 내용이 암호화되지 않습니다. 학생 데이터가 오가는 앱은 반드시 [[https|HTTPS]]를 쓰세요." },
  https: { term: "HTTPS", en: "HTTP Secure", c: "웹 구조",
    def: "[[http|HTTP]]에 암호화([[ssl|SSL]])를 더해, 주고받는 데이터를 안전하게 보호하는 방식.",
    body: "중간에서 누가 가로채도 내용을 알아볼 수 없게 암호화하고, 접속한 사이트가 진짜인지도 확인해 줍니다. 주소창의 자물쇠 아이콘이 그 표시입니다.",
    analogy: "내용이 보이는 엽서(HTTP) 대신, 봉인된 봉투에 넣어 보내는 등기우편(HTTPS).",
    tip: "학생 데이터가 오가는 앱은 반드시 HTTPS — [[hosting|Firebase Hosting]]은 기본으로 제공하니 따로 설정할 필요가 없습니다." },
  ssl: { term: "SSL / TLS", en: "Secure Sockets Layer", c: "웹 구조",
    def: "통신 내용을 암호화하고 사이트 신원을 보증하는 보안 인증서·기술.",
    body: "[[https|HTTPS]]가 가능하게 해 주는 바탕 기술입니다(요즘은 후속 규격 TLS가 표준). 인증서가 있어야 주소창에 자물쇠가 뜨고 ‘안전하지 않음’ 경고가 사라집니다.",
    analogy: "봉투를 봉인하는 ‘밀랍 도장’ + 보낸 사람이 진짜임을 증명하는 ‘공인 인장’.",
    tip: "Firebase·Vercel 등으로 배포하면 인증서가 자동 적용돼, 교사가 직접 다룰 일이 없습니다." },
  api: { term: "API", en: "Application Programming Interface", c: "프롬프트",
    def: "다른 프로그램의 데이터·기능을 정해진 규칙으로 가져다 쓰는 ‘창구’.",
    body: "날씨·지도·번역처럼 남이 만든 기능을 내 앱에 끌어다 붙일 수 있게 해 줍니다. 외부 기능을 연동할 땐 최신 공식 문서 URL을 함께 주면, AI가 옛 정보로 [[hallucination|지어내는]] 일이 크게 줄어듭니다.",
    analogy: "웨이터의 기억력에 맡기지 말고 ‘최신 메뉴판’을 직접 가리키며 주문하기 — 정확한 메뉴(기능)를 받습니다.",
    tip: "“○○ API의 최신 공식 문서(링크)를 참고해서 연동해 줘”라고 근거를 못 박으세요." },
  cdn: { term: "CDN", en: "Content Delivery Network", c: "웹 구조",
    def: "전 세계 여러 서버에 콘텐츠 사본을 분산 저장해, 사용자와 가까운 곳에서 빠르게 전달하는 망.",
    body: "사용자가 어디서 접속하든 가장 가까운 서버가 응답해 속도가 빠르고, 접속이 몰려도 잘 버팁니다. [[hosting|Firebase Hosting]]·[[vercel|Vercel]]·[[cloudflare|Cloudflare]]가 기본으로 사용합니다.",
    analogy: "본점 하나만 두지 않고 동네마다 ‘편의점 지점’을 두어, 가까운 곳에서 바로 사 가게 하는 것.",
    tip: "배포 플랫폼을 쓰면 자동으로 적용되므로, 따로 신경 쓸 필요가 없습니다." },
  deploy: { term: "배포", en: "Deployment", c: "배포",
    def: "내 PC([[localhost|로컬]])에서만 돌던 프로그램을 [[server|서버]]에 올려, 누구나 접속하는 공개 URL을 얻는 과정.",
    body: "배포해야 비로소 학생들이 자기 폰으로 들어올 수 있습니다. [[static|정적 앱]]이면 [[classic-hosting|클래식 Hosting]]·[[vercel|Vercel]]·[[cloudflare|Cloudflare]]로 무료·간단하게 올릴 수 있어요.",
    analogy: "집에서 시식만 하던 음식을, ‘가게를 열어’ 누구나 사 먹게 하는 것.",
    tip: "공유할 땐 localhost 주소가 아니라 ‘배포 후 받은 공개 URL’을 보내야 합니다." },
  git: { term: "Git", en: "Git", c: "배포",
    def: "코드의 변경 이력을 단계별로 저장하고 원하면 되돌릴 수 있는 버전 관리 시스템.",
    body: "‘언제 무엇을 바꿨는지’를 기록해 두어, 망가지면 멀쩡하던 시점으로 되돌릴 수 있습니다. 여러 사람이 같은 코드를 함께 고칠 때도 충돌을 정리해 줍니다.",
    analogy: "무한 ‘실행 취소(Ctrl+Z)’가 가능한 작업 일지 — 며칠 전 상태로도 되돌아갈 수 있습니다.",
    tip: "AI가 코드를 크게 바꾸기 전에 한 번 저장(커밋)해 두면, 잘못돼도 안전하게 되돌릴 수 있어요." },
  github: { term: "GitHub", en: "GitHub", c: "배포",
    def: "[[git|Git]] 저장소를 온라인에 보관·공유·백업하는 대표 서비스.",
    body: "내 코드를 클라우드에 ‘세이브포인트’로 올려 두는 곳입니다. [[vercel|Vercel]]·[[cloudflare|Cloudflare]] 등과 연결하면, 코드를 올릴 때마다 자동으로 [[deploy|배포]]되게 만들 수 있습니다.",
    analogy: "게임의 클라우드 세이브 — 내 PC가 고장 나도 진행 상황(코드)이 온라인에 안전하게 남습니다.",
    tip: "협업·자동 배포·백업이 필요할 때 빛을 발합니다. 혼자 쓰는 일회성 도구엔 없어도 됩니다." },
  firebase: { term: "Firebase", en: "Firebase", c: "Firebase",
    def: "구글이 제공하는 [[baas|BaaS]] — 데이터 저장·로그인·배포를 한 세트로 빌려 쓰는 도구 모음.",
    body: "직접 [[server|서버]]를 운영하지 않아도 [[firestore|Firestore]](저장)·[[auth|Authentication]](로그인)·[[hosting|Hosting]](배포)을 곧바로 붙일 수 있습니다. 비개발 교사가 ‘데이터가 저장되는 진짜 앱’을 만들 수 있게 해 주는 핵심 도구입니다.",
    analogy: "텅 빈 깡통 로봇([[frontend|프론트엔드]]) 안에 끼우는 ‘두뇌·기억장치·신분증’ 세트.",
    tip: "한 반~전교생 규모 도구는 대부분 무료([[spark|Spark]]) 한도 안에서 충분히 돌아갑니다." },
  baas: { term: "BaaS", en: "Backend as a Service", c: "Firebase",
    def: "[[backend|백엔드]](서버·DB·인증)를 직접 만들지 않고 통째로 빌려 쓰는 서비스 형태.",
    body: "서버 구축·보안·확장 같은 어려운 일을 제공업체가 대신 맡아 줍니다. 덕분에 화면([[frontend|프론트엔드]]) 만들기에 집중하면서도 데이터 저장·로그인을 붙일 수 있습니다. [[firebase|Firebase]]가 대표적입니다.",
    analogy: "주방을 직접 차리지 않고, 잘 갖춰진 ‘공유 주방’을 빌려 요리만 하는 것.",
    tip: "‘백엔드를 배워야 하나’ 부담될 때, BaaS가 그 벽을 대신 넘어 줍니다." },
  firestore: { term: "Firestore", en: "Cloud Firestore", c: "Firebase",
    def: "[[document|문서/컬렉션]] 구조로 데이터를 저장하는 [[nosql|NoSQL]] 클라우드 데이터베이스.",
    body: "표(엑셀)보다 유연한 형태로 저장하고, 변경 사항을 여러 기기에 [[sync|실시간 동기화]]합니다. 엑셀에 빗대면 시트=컬렉션, 한 줄(행)=문서, 칸(열)=필드로 대응돼 이해하기 쉽습니다.",
    analogy: "여러 명이 동시에 적어도 찢기거나 겹치지 않는, 클라우드 위의 ‘자동 정리 장부’.",
    warn: "복잡한 JOIN·다단계 트랜잭션엔 약합니다. 설문·게시판·명단 같은 단순 수집·조회·공유에 최적이며, 반드시 [[rules|보안 규칙]]과 함께 쓰세요." },
  nosql: { term: "NoSQL", en: "NoSQL", c: "Firebase",
    def: "행·열의 표 형식 대신, [[json|JSON]]처럼 유연한 형태로 데이터를 저장하는 DB 방식.",
    body: "구조가 자유로워 빠르게 바꿔 가며 개발하기 좋고, 대량·동시 접속에 강합니다. 대신 표 기반의 복잡한 조건 결합([[sql|SQL]] JOIN)에는 약합니다. [[firestore|Firestore]]가 대표적인 NoSQL입니다.",
    analogy: "칸이 딱 정해진 엑셀 표가 아니라, 항목을 자유롭게 더할 수 있는 ‘카드 묶음’.",
    tip: "학급 도구의 데이터(응답·메모·명단)는 대부분 NoSQL에 잘 맞습니다." },
  document: { term: "문서·컬렉션", en: "Document·Collection", c: "Firebase",
    def: "[[firestore|Firestore]]의 저장 단위 — 문서=데이터 한 건, 컬렉션=문서들의 묶음.",
    body: "예를 들어 ‘posts’라는 컬렉션 안에, 응답 하나하나가 문서로 쌓이고, 그 문서 안에 ‘내용·작성시각’ 같은 필드가 들어갑니다. 엑셀로 치면 시트=컬렉션, 행=문서, 열=필드입니다.",
    analogy: "서랍장(컬렉션) 안의 ‘서류 한 장 한 장(문서)’, 그 서류에 적힌 ‘항목(필드)’.",
    tip: "AI에게 “posts 컬렉션에 응답을 문서로 저장해”처럼 구조를 짚어 주면 의도대로 만들어 줍니다." },
  sync: { term: "실시간 동기화", en: "Real-time Sync", c: "Firebase",
    def: "한 곳의 데이터 변경이 새로고침 없이 즉시 모든 기기 화면에 반영되는 것.",
    body: "누군가 글을 올리면 다른 사람 화면에도 바로 나타납니다. 실시간 투표 집계·공유 보드처럼 ‘바로바로 보여야’ 하는 기능에 유용합니다([[firestore|Firestore]]의 onSnapshot).",
    analogy: "단톡방 — 새로고침하지 않아도 메시지가 톡톡 올라오는 그 느낌.",
    tip: "꼭 필요할 때만 켜세요. 단순히 제출만 받는 고민함은 실시간이 아니어도 됩니다." },
  auth: { term: "Authentication (인증)", en: "Authentication", c: "Firebase",
    def: "사용자가 ‘누구인지’ 확인하는 로그인·신원 관리 부품.",
    body: "구글·이메일·전화 등 다양한 로그인 방식을 제공하고, 비밀번호 저장 같은 민감한 처리를 구글에 위임해 보안 부담을 덜어 줍니다. 누가 무엇을 할 수 있는지 정하는 [[rules|보안 규칙]]과 짝을 이룹니다.",
    analogy: "행사장 입구에서 신분을 확인하고 ‘입장 표시’를 붙여 주는 안내 데스크.",
    tip: "학생용 도구라면 개인정보를 받지 않는 [[anon|익명 인증]]을 1순위로 고려하세요." },
  anon: { term: "익명 인증", en: "Anonymous Auth", c: "Firebase",
    def: "이름·이메일 없이 임시 식별표만 부여해 ‘같은 사람인지’만 구분하는 로그인 방식.",
    body: "로그인 창이 없어도 내부적으로 임시 ID를 붙여, ‘한 사람 한 번만 제출’ 같은 기능은 유지하면서 개인정보 수집은 0으로 만듭니다. 학교에서 가장 안전한 선택지입니다.",
    analogy: "이름·주소를 묻지 않고, 입장할 때 손목에 ‘투명 도장’만 찍어 재입장만 확인하는 것.",
    tip: "학교 현장의 개인정보 심의 부담을 가장 크게 줄여 주는 핵심 도구입니다." },
  hosting: { term: "Hosting", en: "Firebase Hosting", c: "Firebase",
    def: "완성한 웹을 글로벌 [[cdn|CDN]]·[[https|HTTPS]]로 인터넷에 올려, 접속 가능한 URL을 만들어 주는 [[firebase|Firebase]] 부품.",
    body: "[[static|정적 웹앱]]이면 [[classic-hosting|클래식 Hosting]]으로 카드 없이 무료 배포할 수 있고, my-class.web.app 같은 주소를 받습니다. 보안 인증서(HTTPS)도 자동 적용됩니다.",
    analogy: "내가 만든 가게를 ‘목 좋은 거리’에 열어 주고 간판 주소까지 달아 주는 서비스.",
    warn: "AI가 [[react|Next.js]] 같은 서버형으로 만들면 무료 Hosting에 안 올라갑니다 — “서버 없는 [[static|정적 앱]]”으로 만들라고 명시하세요." },
  static: { term: "정적 웹앱", en: "Static Web App", c: "Firebase",
    def: "서버 렌더링 없이, 미리 만들어 둔 파일([[html|HTML]]·[[css|CSS]]·[[js|JavaScript]])만으로 도는 앱.",
    body: "별도의 서버 컴퓨터가 24시간 돌 필요가 없어, 무료·간단하게 배포되고 빠릅니다([[firestore|Firestore]] 같은 [[baas|BaaS]]와 붙이면 데이터 저장도 가능). 학급 도구 대부분은 정적 앱으로 충분합니다.",
    analogy: "주문마다 새로 짓는 게 아니라, 미리 만들어 둔 ‘완제품’을 그대로 내어 주는 것.",
    warn: "AI는 종종 서버형으로 만들어 무료 배포가 막힙니다 — 프롬프트에 ‘서버 없는 정적 앱’을 꼭 못 박으세요." },
  "classic-hosting": { term: "클래식 Hosting", en: "Classic Hosting", c: "Firebase",
    def: "[[static|정적 앱]]을 무료([[spark|Spark]])로 배포하는 [[hosting|Firebase Hosting]] 방식.",
    body: "카드 등록이 필요 없고 .web.app 주소를 줍니다. 우리가 만드는 대부분의 학급 도구가 여기에 해당합니다.",
    analogy: "무료로 내어 주는 ‘기본 점포 + 간판’ — 추가 비용 없이 가게를 열 수 있습니다.",
    tip: "카드 요구가 뜬다면 ‘정적 앱’이 아니라 서버형으로 만들어졌을 가능성이 큽니다 — 다시 정적으로 요청하세요." },
  "app-hosting": { term: "App Hosting", en: "App Hosting", c: "Firebase",
    def: "서버 렌더링·백엔드 런타임이 필요한 앱을 위한 [[firebase|Firebase]] 배포 방식.",
    body: "[[static|정적 앱]]이 아닌, 서버에서 돌아가는 앱을 올릴 때 씁니다. 따라서 결제 계정([[blaze|Blaze]])이 필요합니다.",
    warn: "카드 요구가 뜨면 먼저 ‘[[static|정적 앱]]으로 만들었는지’ 재확인하세요 — 대부분의 학급 도구는 무료 [[classic-hosting|클래식 Hosting]]으로 충분합니다." },
  rules: { term: "보안 규칙", en: "Security Rules", c: "Firebase",
    def: "누가 어떤 데이터를 읽고/쓰고/지울 수 있는지 코드로 선언해 통제하는 ‘자물쇠’.",
    body: "예를 들어 ‘쓰기는 로그인한 사람만, 읽기는 차단’처럼 정합니다. 규칙이 없거나 [[testmode|테스트 모드]]로 열려 있으면 데이터가 무방비로 노출돼, 누구나 지우고 쓸 수 있습니다. [[auth|인증]]과 짝을 이뤄 동작합니다.",
    analogy: "우체통 — 누구나 편지를 넣을(쓰기) 수 있지만, 꺼내 읽는(읽기) 건 우체부(교사)만.",
    tip: "프롬프트에 처음부터 “테스트 모드 금지, 보안 규칙도 함께 작성”을 넣고, 실습 키트의 규칙 생성기로 만들어 보세요." },
  testmode: { term: "테스트 모드", en: "Test Mode", c: "Firebase",
    def: "전 세계 누구나 데이터를 읽고 쓸 수 있는, ‘문이 활짝 열린’ 상태.",
    body: "AI는 빠른 개발을 위해 DB를 테스트 모드(전체 공개)로 열어 두는 경우가 매우 흔합니다. 보통 30일 뒤 자동으로 막히지만, 그 사이 링크만 알면 누구나 데이터를 지우고 쓸 수 있어 매우 위험합니다.",
    analogy: "현관문을 활짝 열어 둔 집 — 지나가던 누구나 들어와 물건을 가져가거나 어지를 수 있습니다.",
    warn: "가장 흔하고 위험한 실수입니다. 배포 전 [[rules|보안 규칙]]이 실제로 닫혔는지 직접 확인하세요 — AI의 “안전합니다”는 [[hallucination|할루시네이션]]일 수 있습니다." },
  spark: { term: "Spark (무료 플랜)", en: "Spark Plan", c: "요금",
    def: "카드 등록 없이 쓰는 [[firebase|Firebase]]의 무료 요금제.",
    body: "대략 하루 읽기 5만·쓰기 2만 건, 저장 1GB, 호스팅 월 10GB까지 무료입니다. [[static|정적 앱]]은 [[classic-hosting|클래식 Hosting]]으로 무료 배포돼, 한 반부터 전교생 규모 도구까지 거의 다 무료로 돌아갑니다.",
    analogy: "월 사용량이 정해진 ‘무료 체험 요금제’ — 일반적인 수업 사용량은 그 안에 넉넉히 들어옵니다.",
    tip: "무료 한도만 쓰면 요금 폭탄 걱정이 원천 차단됩니다 — 워크숍·학급 도구엔 Spark로 충분." },
  blaze: { term: "Blaze (종량제)", en: "Blaze Plan", c: "요금",
    def: "쓴 만큼 지불하는 [[firebase|Firebase]]의 유료(종량제) 요금제.",
    body: "결제(카드) 계정이 필요하며, 서버형 [[app-hosting|App Hosting]]이나 외부 호출 등 무료 한도를 넘는 기능에 필요합니다. 사용량 상한이 없어, 잘못 만든 코드가 무한 반복 호출하면 요금이 커질 수 있습니다.",
    analogy: "쓴 만큼 청구되는 ‘수도·전기 요금’ — 평소엔 적지만, 새는 곳이 있으면 요금이 치솟습니다.",
    warn: "Blaze를 쓴다면 [[budget|예산 알림]]은 사실상 필수입니다. 카드 요구가 뜨면 먼저 ‘[[static|정적 앱]]인지’ 확인하세요." },
  budget: { term: "예산 알림", en: "Budget Alert", c: "요금",
    def: "사용량·비용이 정해 둔 기준을 넘으면 알려 주는 안전장치 설정.",
    body: "[[blaze|Blaze]]를 쓸 때 예상치 못한 요금 폭증을 막아 줍니다. 한도를 정해 두면 그 근처에서 메일 등으로 경고를 보내므로, 문제를 빨리 알아챌 수 있습니다.",
    analogy: "통신 요금이 한도에 가까워지면 보내 주는 ‘데이터 초과 경고 문자’.",
    tip: "Blaze라면 반드시 켜고, 콘솔에서 사용량을 주기적으로 확인하세요. 무료 [[spark|Spark]]만 쓰면 걱정이 없습니다." },
  aistudio: { term: "Google AI Studio", en: "Google AI Studio", c: "도구",
    def: "제미나이(Gemini) 기반으로 앱을 만들고, [[firebase|Firebase]] 연동·배포까지 한 흐름으로 이어 주는 환경.",
    body: "데이터 저장·인증이 필요한 시점을 감지해 ‘Firebase 연결’을 제안하고, 신규 사용자는 카드 없이 앱을 2개까지 배포할 수 있습니다. 설치·결제 같은 진입장벽이 가장 낮습니다.",
    analogy: "재료 손질부터 상차림까지 한 자리에서 끝내는 ‘올인원 조리대’.",
    tip: "비개발 교사 워크숍의 ‘메인 도구’로 추천합니다 — 가장 빨리 결과를 손에 쥘 수 있어요." },
  cursor: { term: "Cursor", en: "Cursor (AI IDE)", c: "도구",
    def: "VS Code를 기반으로 한 AI 통합 개발 환경(IDE).",
    body: "프로젝트 전체 코드를 이해한 상태로 채팅하며 수정해, 이미 있는 코드를 다듬거나 기능을 추가하는 작업에 강합니다. 어느 정도 코드 구조에 익숙해진 뒤 쓰면 생산성이 크게 오릅니다.",
    analogy: "내 작업물 전체를 옆에서 다 읽고 있는 ‘함께 코딩하는 조수’.",
    tip: "완전 입문 단계라면 먼저 [[aistudio|AI Studio]]로 감을 잡고, 이후 단계에서 도입해 보세요." },
  antigravity: { term: "Antigravity", en: "Google Antigravity", c: "도구",
    def: "제미나이 기반의 ‘에이전트형’ AI 코드 에디터(IDE).",
    body: "단순 자동완성을 넘어, 코드 전반을 이해하고 여러 단계를 스스로 수행하는 [[agent|에이전트]] 흐름을 지향합니다. [[idx|Project IDX]] 계열의 진화 방향과 같은 맥락입니다.",
    analogy: "지시 하나에 여러 작업을 알아서 처리하는 ‘자율 비서형’ 에디터.",
    tip: "도구는 빠르게 바뀝니다 — 이름·기능보다 ‘무엇을 자동화해 주는가’의 개념을 잡아 두세요." },
  "claude-code": { term: "Claude Code", en: "Claude Code", c: "도구",
    def: "터미널·에디터에서 동작하는 앤트로픽의 AI 코딩 에이전트.",
    body: "프로젝트 맥락을 이해해 코드를 만들고 수정하며, 여러 파일에 걸친 변경과 기존 코드 리팩토링에 강합니다. 이 동반자 앱의 예시들도 Claude를 ‘주 AI’로 가정합니다.",
    analogy: "내 프로젝트 폴더 전체를 맡아 ‘여러 파일을 한꺼번에’ 손봐 주는 숙련 조수.",
    tip: "큰 변경 전에는 [[git|Git]]으로 한 번 저장해 두면 안전하게 되돌릴 수 있어요." },
  lovable: { term: "Lovable", en: "Lovable", c: "도구",
    def: "자연어 설명만으로 [[frontend|프론트]]+[[backend|백엔드]]가 붙은 웹앱을 빠르게 생성하는 풀스택 플랫폼.",
    body: "디자인과 화면을 즉시 만들어 ‘보이는 결과’를 빠르게 확인할 수 있어, 아이디어를 시제품으로 옮기는 속도가 빠릅니다.",
    analogy: "“이런 가게를 열고 싶어요”라고 말하면 인테리어까지 한 번에 차려 주는 서비스.",
    tip: "빠른 [[prototype|프로토타입]]에 강합니다 — 만든 뒤 [[rules|보안]]·데이터 부분은 사람이 점검하세요." },
  v0: { term: "v0", en: "v0 (Vercel)", c: "도구",
    def: "UI 컴포넌트·[[frontend|프론트엔드]] 화면 생성에 특화된 도구(Vercel 제작).",
    body: "설명을 주면 깔끔한 화면·컴포넌트를 만들어 주고, 만든 결과를 [[vercel|Vercel]] 배포와 자연스럽게 연결할 수 있습니다.",
    analogy: "원하는 분위기를 말하면 ‘매장 디자인 시안’을 척척 그려 주는 디자이너.",
    tip: "화면(UI)부터 빠르게 잡고 싶을 때 유용합니다." },
  replit: { term: "Replit", en: "Replit", c: "도구",
    def: "브라우저 개발 환경에 [[agent|에이전트]]가 결합돼, 앱을 만들고 실행·[[deploy|배포]]까지 한 곳에서 하는 플랫폼.",
    body: "설치 없이 웹에서 바로 코딩·실행하며, 카드 없이도 실제 배포가 가능해 워크숍에서 쓰기 좋습니다.",
    analogy: "주방·테이블·계산대가 한 공간에 있어 ‘만들고 바로 파는’ 올인원 매장.",
    tip: "실습 현장에서 ‘만들기→실행→공개’를 빠르게 보여 줄 때 편리합니다." },
  vercel: { term: "Vercel", en: "Vercel", c: "배포",
    def: "서버 관리 없이 [[static|정적]]·[[frontend|프론트]] 앱을 빠르게 올리는 서버리스 배포 플랫폼.",
    body: "[[github|GitHub]] 저장소를 연결하면 코드를 올릴 때마다 자동으로 빌드·[[deploy|배포]]되고, [[cdn|CDN]]·[[https|HTTPS]]가 기본 적용됩니다.",
    analogy: "원고를 넘기면 인쇄·배본까지 자동으로 처리해 주는 출판 대행사.",
    tip: "프론트 중심 앱이라면 Firebase Hosting의 좋은 대안입니다." },
  node: { term: "Node.js", en: "Node.js", c: "도구",
    def: "자바스크립트를 브라우저 밖, 즉 내 PC·서버에서 실행하게 해 주는 도구(런타임).",
    body: "원래 웹 브라우저 안에서만 돌던 [[js|자바스크립트]]를 컴퓨터에서 직접 돌릴 수 있게 해 줍니다. [[cli|Firebase CLI]] 같은 명령어 도구를 설치·실행할 때 필요합니다.",
    analogy: "물에서만 살던 물고기(브라우저 속 JS)에게 ‘땅에서도 숨 쉬는 장치’를 달아 준 것.",
    tip: "AI Studio·Replit로만 작업하면 설치할 일이 거의 없습니다 — ‘내 PC에서 직접 배포’할 때만 필요해요." },
  cli: { term: "Firebase CLI", en: "Command Line Interface", c: "도구",
    def: "터미널(검은 명령창)에서 [[firebase|Firebase]]를 제어하는 명령어 도구.",
    body: "login(로그인)·init(초기 설정)·deploy(배포) 같은 명령으로, 내 PC의 프로젝트를 Firebase에 직접 연결·배포합니다. [[node|Node.js]] 설치가 선행돼야 합니다.",
    analogy: "버튼 클릭 대신 ‘짧은 주문 명령’으로 일을 시키는 무전기.",
    tip: "콘솔(웹 화면)이나 AI Studio로 대부분 처리되니, 입문 단계에선 몰라도 됩니다." },
  agent: { term: "AI 에이전트", en: "AI Agent", c: "미래",
    def: "목표를 주면 스스로 계획을 세우고, 도구를 써 가며 여러 단계를 실행해 일을 끝내는 AI.",
    body: "단순히 묻는 말에 ‘응답’하는 단계를 넘어, 검색·파일 수정·[[github|배포]] 같은 작업을 직접 ‘수행’하고 결과를 점검합니다. 바이브 코딩의 다음 단계이며, [[mcp|MCP]] 같은 규약이 이를 가속합니다.",
    analogy: "“이 일 좀 처리해 줘”라고 맡기면 계획부터 실행·점검까지 알아서 하는 유능한 인턴.",
    tip: "에이전트가 강력해질수록, 사람의 역할은 ‘목적 제시’와 ‘결과 검증’으로 또렷해집니다." },
  mcp: { term: "MCP", en: "Model Context Protocol", c: "미래",
    def: "AI 모델을 외부 도구·데이터에 ‘표준화된 방식’으로 연결하는 개방형 규약(앤트로픽 제안).",
    body: "도구마다 제각각이던 연결 방식을 하나로 통일해, [[agent|에이전트]]가 더 쉽고 안전하게 외부 기능([[api|API]]·DB·파일 등)을 쓰도록 돕습니다.",
    analogy: "기기마다 다르던 충전 단자를 ‘USB-C 하나’로 통일한 것 — 어디에 꽂아도 통합니다.",
    tip: "세부 규격보다 ‘AI를 여러 도구에 표준으로 잇는 흐름’이라는 큰 그림만 잡아 두면 충분합니다." },
  saas: { term: "SaaS", en: "Software as a Service", c: "미래",
    def: "정해진 기능을 구독해 ‘쓰는’ 소프트웨어(예: 구독형 웹 서비스).",
    body: "필요한 기능을 회사가 미리 만들어 두면 사용자는 골라 쓰는 방식입니다. [[agent|AI 에이전트]] 시대에는, 목적을 주면 AI가 스스로 ‘수행하는’ 쪽으로 무게중심이 옮겨갑니다.",
    analogy: "정해진 메뉴를 골라 먹는 ‘구독 식당’ → 앞으로는 “이런 거 먹고 싶어”라고 하면 만들어 주는 방향으로.",
    tip: "‘기능을 고르는 시대’에서 ‘목적을 맡기는 시대’로의 전환을 보여 주는 키워드입니다." },
  idx: { term: "Project IDX / Antigravity", en: "Google IDX", c: "도구",
    def: "브라우저에서 도는 구글의 AI 통합 개발 환경([[agent|에이전트형]] 에디터 포함).",
    body: "설치 없이 웹에서 코드를 만들고, 제미나이 기반 AI가 프로젝트 전반을 이해해 여러 단계를 수행합니다. [[antigravity|Antigravity]] 계열과 같은 에이전트형 흐름을 지향합니다.",
    analogy: "노트북에 무엇을 깔 필요 없이, 브라우저만 열면 바로 작업하는 ‘웹 속 작업실’.",
    tip: "설치 부담이 없어 학교 PC 환경에서도 접근하기 좋습니다." },
  cloudflare: { term: "Cloudflare Pages", en: "Cloudflare", c: "배포",
    def: "[[static|정적]]·[[frontend|프론트]] 앱을 전 세계 [[cdn|CDN]]으로 빠르게 올리는 무료 친화적 배포 플랫폼.",
    body: "[[vercel|Vercel]]과 비슷하게 [[github|GitHub]] 저장소를 연결하면 자동으로 빌드·[[deploy|배포]]되고, 보안·속도가 기본으로 갖춰집니다.",
    analogy: "전국에 지점을 둔 ‘빠른 배송망’에 내 사이트를 얹는 것.",
    tip: "Firebase Hosting·Vercel과 더불어 고려할 만한 무료 배포 선택지입니다." },
  aws: { term: "AWS (EC2 · S3)", en: "Amazon Web Services", c: "배포",
    def: "아마존의 대규모 클라우드 서비스. EC2(가상 [[server|서버]])·S3(파일 저장소)가 대표 서비스.",
    body: "원하는 대로 세밀하게 제어하고 크게 확장할 수 있지만, 그만큼 설정·관리가 복잡합니다. 대규모 서비스에 적합하며, 학급 도구에는 보통 과합니다.",
    analogy: "원하는 대로 다 지을 수 있는 ‘넓은 공업 부지’ — 강력하지만 직접 설계·시공해야 합니다.",
    tip: "한 반~전교생 도구라면 [[firebase|Firebase]]·[[vercel|Vercel]]로 충분합니다 — AWS는 개념만 알아 두세요." },
  workspace: { term: "Google Workspace 연동", en: "Workspace Integration", c: "도구",
    def: "구글 시트·드라이브·설문 등과 데이터를 주고받아 함께 활용하는 것.",
    body: "이미 쓰던 구글 도구와 이어 붙이면, 수집한 데이터를 시트로 내보내 정리·공유하거나 기존 자료를 앱으로 불러올 수 있습니다([[api|API]] 연동). 익숙한 환경을 그대로 살릴 수 있습니다.",
    analogy: "새 가전을 따로 두지 않고, 쓰던 가전들과 ‘하나의 스마트홈’으로 연결하는 것.",
    tip: "외부 연동은 최신 공식 문서 링크를 함께 주면 오류가 크게 줄어듭니다." },
};
const CAT_ORDER = ["개념", "웹 구조", "프롬프트", "Firebase", "요금", "도구", "미래", "배포"];

/* ============================================================
   MAP — 마인드맵 학습 지도 (8갈래 · 36+개념)
   blocks: p / note / cmp / trio / stats / steps / cols / table / flow / code
   src: 출처 자료 키 (app / guide / handbook / mastering / blueprint)
   ============================================================ */
const MAP = [
  /* ── 1. 개념과 트렌드 ───────────────────────────── */
  { id: "concept", label: "개념과 트렌드", short: "개념·트렌드", icon: Sparkles, color: "amber",
    tagline: "왜 지금 바이브 코딩인가", intro: "‘타이핑하는 사람’에서 ‘지휘하는 사람’으로. 바이브 코딩이 무엇이고 왜 지금 폭발적으로 번지는지부터 잡습니다.",
    children: [
      { id: "c-news", label: "🔥 뉴스로 시작 (Warm-up)", icon: Newspaper, src: [], terms: ["vibe", "karpathy", "hallucination"],
        blocks: [
          { t: "lead", x: "본격 학습 전, ‘지금 세상’ 이야기로 몸을 풉니다. 아래 소식들을 함께 보고 ‘왜 우리가 지금 이걸 배우는가’를 이야기해 보세요. (연수 시작 워밍업)" },
          { t: "trio", items: [{ k: "vibe", label: "바이브 코딩" }, { k: "karpathy", label: "카파시(유래)" }, { k: "hallucination", label: "할루시네이션" }] },
          { t: "news" },
          { t: "note", kind: "tip", x: "워밍업 토의 — ‘가장 놀라운 소식과 그 이유’를 옆 사람과 1분 나눠 보기. 각 카드를 누르면 원문 기사로 이동합니다." },
          { t: "note", kind: "warn", x: "특히 ‘유출 사고’와 ‘19% 더 느림’은 오늘 배울 [[testmode|보안]]·[[hallucination|검증]]이 왜 필수인지 보여 줍니다." },
        ]},
      { id: "c-def", label: "정의 — 자연어 코딩", icon: Sparkles, src: ["guide", "handbook", "mastering"], terms: ["vibe", "llm", "prompt", "context-eng"],
        blocks: [
          { t: "lead", x: "[[vibe|바이브 코딩]]은 복잡한 문법을 직접 치는 대신, 사람의 말(자연어)로 ‘의도(Vibe)’와 ‘결과’를 설명하면 [[llm|AI]]가 작동하는 코드를 만들어 주는 개발 방식입니다." },
          { t: "p", x: "핵심은 코드 실력이 아니라 **무엇을 원하는지 정확히 전달하는 능력**입니다. 그래서 한 줄 [[prompt|프롬프트]]보다 배경·제약을 설계하는 [[context-eng|컨텍스트 엔지니어링]]이 결과 품질을 좌우합니다." },
          { t: "cols", cols: [
            { h: "사람이 하는 일", tone: "good", items: ["무엇을 만들지 정하기 (의도·목적)", "결과를 보고 방향 잡기", "맞는지 검증하기"] },
            { h: "AI가 하는 일", tone: "info", items: ["함수·문법으로 구현하기", "에러 고치기", "반복 작업 처리하기"] },
          ]},
          { t: "note", kind: "analogy", x: "설계도를 직접 그리는 목수 대신, “따뜻한 느낌의 나무 의자”라고 말하면 알아서 깎아 주는 마법 지팡이." },
        ]},
      { id: "c-origin", label: "유래 — 안드레이 카파시", icon: Quote, src: ["guide", "handbook", "blueprint"], terms: ["karpathy", "vibe"],
        blocks: [
          { t: "lead", x: "2025년 2월, AI 연구자 [[karpathy|안드레이 카파시]]가 SNS에 “코드를 거의 보지 않고 그냥 되는 대로 받아들인다”는 태도를 ‘vibe coding’이라 부르며 대중화됐습니다." },
          { t: "p", x: "그는 오픈AI 공동 창립자이자 테슬라 AI 책임자를 지낸 인물입니다. 원래 표현은 **즉흥적·실험적 태도**를 가리켰습니다." },
          { t: "note", kind: "warn", x: "‘대충 받아들이기’는 빠른 실험엔 좋지만, 검증 없는 실서비스 배포와는 결이 다릅니다. 그래서 오늘 우리는 ‘속도 + 검증’을 함께 배웁니다." },
        ]},
      { id: "c-prod", label: "생산성 폭발", icon: Cpu, src: ["mastering", "blueprint", "handbook"], terms: ["mvp", "prototype", "crud"],
        blocks: [
          { t: "lead", x: "예전엔 며칠 걸리던 ‘학급 설문 앱’이, 이제는 단 몇 분~몇 시간 만에 작동하는 형태로 나옵니다." },
          { t: "stats", items: [
            { n: "며칠 → 몇 분", label: "아이디어 → 작동본" },
            { n: "0줄", label: "필요한 직접 코딩" },
            { n: "누구나", label: "참여 가능 범위" },
          ]},
          { t: "p", x: "특히 [[mvp|MVP]]·[[prototype|프로토타입]]과 [[crud|CRUD]]형 도구(설문·게시판·명단)에서 효과가 가장 큽니다. ‘일단 되는 것’을 빠르게 만들어 검증하는 데 강합니다." },
        ]},
      { id: "c-shift", label: "SaaS → AI 에이전트 전환", icon: Boxes, src: ["handbook", "mastering", "blueprint"], terms: ["saas", "agent", "mcp"],
        blocks: [
          { t: "lead", x: "정해진 기능을 ‘구독해 쓰는’ [[saas|SaaS]] 시대에서, 목적을 주면 스스로 ‘수행하는’ [[agent|AI 에이전트]] 시대로 무게중심이 옮겨가고 있습니다." },
          { t: "cmp",
            bad: { h: "지금 (SaaS)", x: "잘 만들어진 도구를 ‘골라서 사용’. 기능은 회사가 정해 둔 범위 안." },
            good: { h: "다가오는 (에이전트)", x: "“이걸 해 줘”라고 목적만 주면, AI가 계획·실행·점검까지 ‘대신 수행’." } },
          { t: "p", x: "AI를 외부 도구에 표준 방식으로 잇는 [[mcp|MCP]] 같은 규약이 이 전환을 가속합니다." },
        ]},
      { id: "c-labor", label: "노동시장 변화", icon: Users, src: ["handbook", "mastering"], terms: ["llm"],
        blocks: [
          { t: "lead", x: "엔트로픽(Anthropic) 보고서에서 직업별 AI 노출도는 컴퓨터 프로그래머가 가장 높게 나타났습니다." },
          { t: "stats", items: [
            { n: "74.5%", label: "프로그래머 AI 노출도" },
            { n: "70.1%", label: "고객 서비스 노출도" },
            { n: "도메인", label: "지식이 핵심 자산" },
          ]},
          { t: "p", x: "코드를 못 짜도 ‘무엇이 필요한지 아는’ **현장 전문가(도메인 지식)**가 결과물을 만드는 시대 — 교사에게 큰 기회입니다." },
          { t: "note", kind: "tip", x: "암기할 것은 새 도구가 아니라 ‘원하는 것을 정확히 말로 푸는’ 능력입니다." },
        ]},
    ]},

  /* ── 2. Firebase (BaaS) ─────────────────────────── */
  { id: "fb", label: "Firebase (BaaS)", short: "Firebase", icon: Database, color: "orange",
    tagline: "저장·인증·배포를 한 세트로", intro: "복잡한 서버 없이 ‘데이터 장부 + 로그인 + 배포’를 통째로 빌려주는 구글의 도구 세트. 학급 도구의 심장입니다.",
    children: [
      { id: "fb-key", label: "핵심 3대 부품", short: "3대 부품", icon: Boxes, summary: "Firestore·Authentication·Hosting — 데이터·신분·주소를 책임지는 세 부품.",
        children: [
          { id: "fb-store", label: "Firestore (데이터 저장)", icon: TableIcon, src: ["guide", "blueprint", "handbook"], terms: ["firestore", "nosql", "document", "sync", "baas"],
            blocks: [
              { t: "lead", x: "[[firestore|Firestore]]는 문서/컬렉션 구조의 [[nosql|NoSQL]] 클라우드 데이터베이스 — ‘여럿이 동시에 써도 안 꼬이는 클라우드 엑셀’입니다." },
              { t: "p", x: "친숙한 엑셀에 그대로 대응시키면 이해가 쉽습니다." },
              { t: "table", head: ["엑셀", "Firestore"], rows: [
                ["시트(Sheet)", "[[document|컬렉션]] (Collection)"],
                ["한 줄(Row)", "[[document|문서]] (Document)"],
                ["칸(Column)", "필드 (Field)"],
              ], note: "예) ‘응답’ 시트 → posts 컬렉션, 한 응답 → 문서, 내용·시각 → 필드" },
              { t: "note", kind: "tip", x: "변경을 여러 기기에 [[sync|실시간 동기화]]합니다. 단, 복잡한 JOIN·다단계 트랜잭션엔 약하니 단순 수집·조회·공유에 쓰세요." },
            ]},
          { id: "fb-auth", label: "Authentication (인증)", icon: Shield, src: ["guide", "handbook"], terms: ["auth", "anon", "baas"],
            blocks: [
              { t: "lead", x: "[[auth|Authentication]]은 사용자가 ‘누구인지’ 확인하는 로그인·신원 관리 부품입니다." },
              { t: "p", x: "비밀번호 저장 같은 민감한 처리를 구글에 위임해 보안 부담을 덜어줍니다. 구글·이메일·전화 등 다양한 방식이 있어요." },
              { t: "note", kind: "tip", x: "학생용 도구라면 개인정보를 받지 않는 [[anon|익명 인증]]을 1순위로 고려하세요." },
            ]},
          { id: "fb-host", label: "Hosting (배포)", icon: Rocket, src: ["guide", "handbook", "app"], terms: ["hosting", "static", "classic-hosting", "https", "cdn"],
            blocks: [
              { t: "lead", x: "[[hosting|Hosting]]은 완성한 웹을 글로벌 [[cdn|CDN]]·[[https|HTTPS]]로 인터넷에 올려 누구나 접속하는 주소(URL)를 만들어 줍니다." },
              { t: "p", x: "[[static|정적 웹앱]]이면 [[classic-hosting|클래식 Hosting]]으로 카드 없이 무료 배포할 수 있고, my-class.web.app 같은 주소를 받습니다." },
              { t: "note", kind: "warn", x: "AI가 Next.js 같은 ‘서버형’으로 만들면 무료 Hosting에 안 올라갑니다. 프롬프트에 “서버 없는 정적 앱”을 꼭 명시하세요." },
            ]},
        ]},
      { id: "fb-edu", label: "교육 활용", short: "교육 활용", icon: GraduationCap, summary: "교실에서 바로 쓰는 패턴 — 수집·공유·연동.",
        children: [
          { id: "fb-survey", label: "설문·퀴즈 수집", icon: ListChecks, src: ["app", "guide"], terms: ["crud", "anon", "firestore"],
            blocks: [
              { t: "lead", x: "응답을 한곳에 모으는 ‘수집형’ 도구는 바이브 코딩의 가장 쉬운 [[crud|CRUD]] 승리 구간입니다." },
              { t: "cols", cols: [
                { h: "이런 걸 만들어요", tone: "good", items: ["익명 설문·투표", "실시간 퀴즈 집계", "사전 질문 받기"] },
                { h: "핵심 설계", tone: "info", items: ["[[anon|익명 인증]]으로 개인정보 0", "응답·시각만 [[firestore|저장]]", "집계는 교사만 보기"] },
              ]},
              { t: "note", kind: "tip", x: "‘실습 키트’에서 설문/퀴즈용 프롬프트를 설정만 바꿔 만들 수 있어요." },
            ]},
          { id: "fb-board", label: "공유 보드", icon: Layout, src: ["app", "blueprint"], terms: ["sync", "rules", "firestore"],
            blocks: [
              { t: "lead", x: "여러 명이 함께 글·아이디어를 붙이는 ‘공유 보드(롤링페이퍼·브레인스토밍)’도 쉽게 만듭니다." },
              { t: "p", x: "[[sync|실시간 동기화]]로 친구가 붙인 메모가 즉시 보이게 할 수 있어요. 누가 볼 수 있는지는 [[rules|보안 규칙]]으로 정합니다." },
              { t: "note", kind: "analogy", x: "교실 뒤 게시판에 다 같이 포스트잇을 붙이는 걸 화면으로 옮긴 것." },
            ]},
          { id: "fb-workspace", label: "Google Workspace 연동", icon: Boxes, src: ["handbook"], terms: ["workspace", "api"],
            blocks: [
              { t: "lead", x: "이미 쓰던 [[workspace|구글 시트·드라이브·설문]]과 데이터를 주고받아 활용할 수 있습니다." },
              { t: "p", x: "수집한 데이터를 시트로 내보내 정리·공유하거나, 외부 데이터를 [[api|API]]로 불러와 화면에 띄울 수 있어요." },
              { t: "note", kind: "tip", x: "외부 연동은 최신 공식 문서 URL을 함께 주면 오류가 크게 줄어듭니다." },
            ]},
        ]},
      { id: "fb-sec", label: "보안과 개인정보", short: "보안·개인정보", icon: Lock, summary: "학교 현장에서 가장 중요한 영역 — 익명·규칙·테스트 모드.",
        children: [
          { id: "fb-anon", label: "익명 인증 (개인정보 0)", icon: Shield, src: ["guide", "handbook", "blueprint"], terms: ["anon", "auth"],
            blocks: [
              { t: "lead", x: "[[anon|익명 인증]]은 이름·이메일 없이 임시 식별표만 부여해 ‘같은 사람’인지만 구분합니다." },
              { t: "p", x: "“이미 제출한 사람은 다시 못 하게” 같은 기능은 유지하면서, 개인정보 수집은 0으로 만듭니다." },
              { t: "note", kind: "analogy", x: "이름·주소를 묻지 않고, 입장 시 손목에 ‘투명 도장’만 찍어 재입장만 확인." },
              { t: "note", kind: "tip", x: "학교 개인정보 심의 부담을 가장 크게 줄이는 핵심 도구입니다." },
            ]},
          { id: "fb-rules", label: "보안 규칙 (자물쇠)", icon: Lock, src: ["guide", "handbook", "blueprint", "app"], terms: ["rules", "testmode"],
            blocks: [
              { t: "lead", x: "[[rules|보안 규칙]]은 ‘누가 어떤 데이터를 읽고/쓸 수 있는지’ 선언적으로 통제하는 자물쇠입니다." },
              { t: "p", x: "예: ‘쓰기는 로그인한 사람만, 읽기는 차단’. 규칙이 없으면 데이터가 무방비로 노출됩니다." },
              { t: "note", kind: "analogy", x: "우체통 — 누구나 편지를 넣을(쓰기) 수 있지만, 꺼내 보는(읽기) 건 우체부(교사)만." },
              { t: "note", kind: "tip", x: "‘실습 키트 › firestore.rules’에서 설정을 바꿔가며 실제 규칙 코드를 만들 수 있어요." },
            ]},
          { id: "fb-test", label: "테스트 모드 위험 회피", icon: AlertTriangle, src: ["guide", "handbook", "mastering"], terms: ["testmode", "hallucination", "rules"],
            blocks: [
              { t: "lead", x: "AI는 빠른 개발을 위해 DB를 [[testmode|테스트 모드]](전 세계 공개)로 열어두는 경우가 매우 흔합니다." },
              { t: "note", kind: "warn", x: "가장 흔하고 위험한 실수 — 링크만 알면 누구나 데이터를 지우고 쓸 수 있습니다. 배포 전 반드시 직접 닫혔는지 확인하세요." },
              { t: "steps", items: [
                "프롬프트에 처음부터 “테스트 모드 금지, [[rules|보안 규칙]]도 함께” 넣기",
                "콘솔에서 규칙이 실제로 닫혔는지 눈으로 확인",
                "내 폰으로 직접 접속해 읽기/쓰기가 의도대로 막히는지 테스트",
              ]},
              { t: "note", kind: "tip", x: "AI의 “안전합니다”는 [[hallucination|할루시네이션]]일 수 있어요. 사람이 최종 확인합니다." },
            ]},
        ]},
      { id: "fb-price", label: "요금", short: "요금", icon: Wallet, summary: "한 반~전교생 도구는 대부분 무료 한도 안에서 돕니다.",
        children: [
          { id: "fb-spark", label: "Spark (무료)", icon: Wallet, src: ["guide", "handbook", "app"], terms: ["spark", "classic-hosting"],
            blocks: [
              { t: "lead", x: "[[spark|Spark 요금제]]는 카드 등록 없이 쓰는 무료 플랜입니다." },
              { t: "stats", items: [
                { n: "50,000", label: "하루 읽기" },
                { n: "20,000", label: "하루 쓰기" },
                { n: "0원", label: "카드 불필요" },
              ]},
              { t: "p", x: "저장 1GB, 호스팅 월 10GB까지 무료. 정적 앱은 [[classic-hosting|클래식 Hosting]]으로 무료 배포돼, 학급~전교생 도구는 거의 다 무료로 돌아갑니다." },
            ]},
          { id: "fb-blaze", label: "Blaze (종량제)", icon: Wallet, src: ["handbook", "app"], terms: ["blaze", "app-hosting"],
            blocks: [
              { t: "lead", x: "[[blaze|Blaze]]는 쓴 만큼 지불하는 플랜으로, 서버형 [[app-hosting|App Hosting]] 등에 필요합니다." },
              { t: "p", x: "결제(카드) 계정이 필요하며 사용량 상한이 없습니다. 카드 요구가 뜨면 먼저 ‘정적 앱으로 만들었는지’ 재확인하세요." },
              { t: "note", kind: "warn", x: "무한 반복 호출(에러 루프)이 일어나면 요금이 폭증할 수 있습니다." },
            ]},
          { id: "fb-budget", label: "예산 알림 (필수)", icon: AlertTriangle, src: ["guide", "handbook", "app"], terms: ["budget", "blaze"],
            blocks: [
              { t: "lead", x: "[[budget|예산 알림]]은 사용량·비용이 기준을 넘으면 알려주는 안전장치입니다." },
              { t: "p", x: "[[blaze|Blaze]]를 쓴다면 사실상 필수 — 반드시 켜고, 콘솔에서 사용량을 주기적으로 확인하세요." },
              { t: "note", kind: "tip", x: "무료 Spark만 쓰면 요금 폭탄 걱정이 원천 차단됩니다." },
            ]},
        ]},
    ]},

  /* ── 3. 도구와 생태계 ───────────────────────────── */
  { id: "tools", label: "도구와 생태계", short: "도구", icon: Wrench, color: "teal",
    tagline: "무엇으로 만드나", intro: "목적과 진입 장벽에 따라 도구를 고릅니다. 코드 에디터형과 풀스택 플랫폼형으로 크게 나뉩니다.",
    children: [
      { id: "t-ide", label: "AI 코드 에디터", short: "코드 에디터", icon: Code2, summary: "프로젝트 전체를 이해한 AI와 함께 코드를 만들고 고치는 도구(심화).",
        children: [
          { id: "t-cursor", label: "Cursor AI (IDE)", icon: Code2, src: ["handbook", "mastering"], terms: ["cursor"],
            blocks: [
              { t: "lead", x: "[[cursor|Cursor]]는 VS Code 기반의 AI 통합 개발 환경입니다." },
              { t: "p", x: "프로젝트 전체를 이해한 상태로 채팅하며 코드를 수정해, 기존 코드를 다듬는 작업에 강합니다." },
              { t: "note", kind: "tip", x: "어느 정도 코드 구조에 익숙해진 뒤 쓰면 생산성이 크게 오릅니다." },
            ]},
          { id: "t-idx", label: "Project IDX (구글)", icon: Sparkles, src: ["handbook"], terms: ["idx", "agent"],
            blocks: [
              { t: "lead", x: "[[idx|Project IDX / Antigravity]]는 브라우저에서 도는 구글의 AI 통합 개발 환경입니다." },
              { t: "p", x: "설치 없이 웹에서 코드를 만들고, [[agent|에이전트형]] AI가 여러 단계를 자동으로 수행합니다." },
            ]},
          { id: "t-vscode", label: "VS Code + Claude/Copilot", icon: FileCode, src: ["handbook"], terms: ["claude-code"],
            blocks: [
              { t: "lead", x: "가장 널리 쓰는 에디터 VS Code에 [[claude-code|Claude]]·Copilot 같은 AI 도우미를 붙여 쓰는 조합입니다." },
              { t: "p", x: "기존 작업 환경을 유지하면서 AI 보조를 더하고 싶을 때 좋습니다." },
            ]},
        ]},
      { id: "t-platform", label: "풀스택 플랫폼", short: "풀스택 플랫폼", icon: Boxes, summary: "설명만으로 프론트+백엔드가 붙은 앱을 즉시 만들어 주는 도구(입문~중급).",
        children: [
          { id: "t-lovable", label: "Lovable (고성장)", icon: Sparkles, src: ["handbook", "mastering"], terms: ["lovable"],
            blocks: [
              { t: "lead", x: "[[lovable|Lovable]]은 자연어 설명만으로 프론트+백엔드가 붙은 웹앱을 빠르게 생성합니다." },
              { t: "p", x: "디자인·화면을 즉시 만들어 주어 ‘보이는 결과’를 빠르게 확인할 수 있습니다." },
            ]},
          { id: "t-v0", label: "v0 (Vercel)", icon: Layout, src: ["handbook"], terms: ["v0", "vercel"],
            blocks: [
              { t: "lead", x: "[[v0|v0]]는 UI 컴포넌트·프론트엔드 화면 생성에 특화된 도구입니다." },
              { t: "p", x: "만든 화면을 [[vercel|Vercel]] 배포와 자연스럽게 연결할 수 있습니다." },
            ]},
          { id: "t-replit", label: "Replit (에이전트형)", icon: Terminal, src: ["handbook", "mastering"], terms: ["replit", "agent", "deploy"],
            blocks: [
              { t: "lead", x: "[[replit|Replit]]은 브라우저 개발 환경에 [[agent|에이전트]]가 결합돼, 앱을 만들고 실행·배포까지 한 곳에서 합니다." },
              { t: "note", kind: "tip", x: "카드 없이도 실제 [[deploy|배포]]가 가능해 워크숍에서 쓰기 좋습니다." },
            ]},
          { id: "t-aistudio", label: "Google AI Studio (카드 불필요)", icon: Sparkles, src: ["guide", "handbook", "mastering"], terms: ["aistudio", "firebase"],
            blocks: [
              { t: "lead", x: "[[aistudio|Google AI Studio]]는 제미나이 기반으로 앱을 만들고, [[firebase|Firebase]] 연동·배포까지 이어지는 환경입니다." },
              { t: "p", x: "데이터 저장·인증이 필요한 시점을 감지해 ‘Enable Firebase’를 제안하고, 신규 사용자는 카드 없이 앱 2개까지 배포할 수 있습니다." },
              { t: "note", kind: "tip", x: "진입장벽이 가장 낮아 ‘비개발 교사 워크숍의 메인 도구’로 추천합니다." },
            ]},
        ]},
    ]},

  /* ── 4. 필수 IT 지식 ────────────────────────────── */
  { id: "it", label: "필수 IT 지식", short: "IT 지식", icon: Server, color: "sky",
    tagline: "화면 뒤에서 벌어지는 일", intro: "AI에게 정확히 주문하고 결과를 검증하려면, 웹이 어떻게 돌아가는지 ‘구조’를 알아야 합니다.",
    children: [
      { id: "it-web", label: "웹의 구조", short: "웹 구조", icon: Layers, summary: "수면 위(화면)와 수면 아래(처리)로 나뉘는 웹앱의 뼈대.",
        children: [
          { id: "it-front", label: "프론트엔드 (HTML/CSS/JS/React)", icon: Layout, src: ["guide", "blueprint"], terms: ["frontend", "html", "css", "js", "react"],
            blocks: [
              { t: "lead", x: "[[frontend|프론트엔드]]는 사용자에게 직접 보이고 동작하는 ‘수면 위’ 화면 계층입니다." },
              { t: "cols", cols: [
                { h: "[[html|HTML]] — 뼈대", tone: "info", items: ["구조·내용", "“메뉴판 틀”"] },
                { h: "[[css|CSS]] — 피부", tone: "info", items: ["색·여백·글꼴", "“카페풍 꾸미기”"] },
                { h: "[[js|JavaScript]] — 동작", tone: "info", items: ["클릭·입력", "“장바구니 담기”"] },
              ]},
              { t: "p", x: "복잡한 화면은 [[react|React]] 같은 라이브러리로 부품(컴포넌트)처럼 조립합니다." },
              { t: "note", kind: "warn", x: "뚝딱 만든 웹은 ‘프론트엔드만’ 있어, 데이터를 저장할 [[backend|주방]]이 없으면 새로고침하면 다 날아갑니다." },
            ]},
          { id: "it-back", label: "백엔드 (Node.js/Python/API/SQL)", icon: Server, src: ["guide", "blueprint"], terms: ["backend", "server", "database", "api", "sql"],
            blocks: [
              { t: "lead", x: "[[backend|백엔드]]는 보이지 않는 곳에서 로직과 데이터를 처리하는 ‘수면 아래’ 계층입니다." },
              { t: "steps", items: [
                "라우팅 — 주소(URL)에 따라 알맞은 페이지로 안내",
                "데이터 처리 — 입력 검증 후 [[database|DB]]에 저장·조회([[sql|SQL]] 등)",
                "보안·인증 — 로그인한 사용자만 자기 정보에 접근하도록 통제",
              ]},
              { t: "note", kind: "tip", x: "Firebase를 쓰면 이 백엔드를 직접 만들지 않고 ‘빌려’ 씁니다." },
            ]},
          { id: "it-mvc", label: "MVC 모델", icon: Layers, src: ["guide"], terms: ["mvc", "frontend", "backend"],
            blocks: [
              { t: "lead", x: "[[mvc|MVC]]는 앱을 데이터(Model)·화면(View)·중개(Controller)로 나누는 설계 패턴입니다." },
              { t: "p", x: "역할을 분리하면 한 곳을 고쳐도 다른 곳 영향이 적어, 유지보수·협업이 쉬워집니다." },
              { t: "note", kind: "analogy", x: "식당으로 치면 창고(M)·홀(V)·점장(C)이 각자 역할만 맡는 것." },
            ]},
        ]},
      { id: "it-infra", label: "인프라", short: "인프라", icon: Server, summary: "요청과 응답, 그리고 주소·통로의 기본기.",
        children: [
          { id: "it-cs", label: "클라이언트 vs 서버", icon: RefreshCw, src: ["guide", "handbook"], terms: ["client", "server", "http"],
            blocks: [
              { t: "lead", x: "웹은 요청하는 [[client|클라이언트]]와 응답하는 [[server|서버]]가 주고받으며 돌아갑니다." },
              { t: "flow", dir: "row", items: [
                { label: "클라이언트", sub: "“페이지 줘!”" },
                { label: "서버", sub: "요청 처리" },
                { label: "클라이언트", sub: "“여기 있습니다!”" },
              ]},
              { t: "note", kind: "analogy", x: "주문하는 손님(클라이언트)과 처리하는 가게(서버)." },
            ]},
          { id: "it-dns", label: "IP 주소 & DNS", icon: Compass, src: ["guide"], terms: ["ip", "dns"],
            blocks: [
              { t: "lead", x: "인터넷의 모든 컴퓨터는 숫자 주소인 [[ip|IP]]를 가집니다 — 외우기 어렵죠." },
              { t: "p", x: "[[dns|DNS]]는 사람이 읽는 이름(my-class.web.app)을 실제 IP로 바꿔주는 ‘전화번호부’ 역할을 합니다." },
            ]},
          { id: "it-proto", label: "포트 & 프로토콜 (HTTP/HTTPS)", icon: Lock, src: ["guide"], terms: ["port", "http", "https", "ssl"],
            blocks: [
              { t: "lead", x: "[[http|HTTP]]는 웹에서 데이터를 주고받는 약속(규약)이고, [[port|포트]]는 한 컴퓨터 안의 여러 통신 통로입니다." },
              { t: "p", x: "[[https|HTTPS]]는 여기에 암호화([[ssl|SSL]])를 더해 데이터를 안전하게 주고받습니다 — 자물쇠 아이콘이 그 표시예요." },
              { t: "note", kind: "tip", x: "학생 데이터가 오가는 앱은 반드시 HTTPS. Firebase Hosting은 기본 제공합니다." },
            ]},
        ]},
      { id: "it-deploy", label: "배포와 버전관리", short: "배포·버전", icon: GitBranch, summary: "내 PC의 코드를 세상에 올리고, 안전하게 되돌리는 법.",
        children: [
          { id: "it-host", label: "Vercel / Cloudflare", icon: Rocket, src: ["blueprint", "app"], terms: ["vercel", "cloudflare", "deploy", "static"],
            blocks: [
              { t: "lead", x: "[[vercel|Vercel]]·[[cloudflare|Cloudflare]]는 서버 관리 없이 [[static|정적·프론트 앱]]을 빠르게 올리는 배포 플랫폼입니다." },
              { t: "p", x: "GitHub 저장소를 연결하면 코드를 올릴 때마다 자동으로 [[deploy|배포]]됩니다." },
            ]},
          { id: "it-aws", label: "AWS EC2 / S3", icon: Server, src: ["blueprint"], terms: ["aws", "server"],
            blocks: [
              { t: "lead", x: "[[aws|AWS]]는 아마존의 클라우드로, EC2(가상 [[server|서버]])·S3(파일 저장소)가 대표 서비스입니다." },
              { t: "note", kind: "warn", x: "대규모·세밀한 제어엔 강하지만 설정이 복잡합니다. 학급 도구엔 보통 과해요 — Firebase·Vercel이면 충분." },
            ]},
          { id: "it-git", label: "Git & GitHub (버전 관리)", icon: GitBranch, src: ["blueprint", "app"], terms: ["git", "github", "localhost"],
            blocks: [
              { t: "lead", x: "[[git|Git]]은 코드의 변경 이력을 저장·되돌리는 ‘무한 실행 취소가 되는 작업 일지’입니다." },
              { t: "p", x: "[[github|GitHub]]는 그 저장소를 온라인으로 공유·백업하는 ‘코드의 세이브포인트’예요." },
              { t: "flow", dir: "row", items: [
                { label: "Local (내 PC)", sub: "[[localhost|로컬]] 개발" },
                { label: "GitHub", sub: "세이브포인트" },
                { label: "배포", sub: "Vercel·Firebase" },
              ]},
            ]},
        ]},
    ]},

  /* ── 5. 바이브 코딩 성공 법칙 ───────────────────── */
  { id: "rules", label: "바이브 코딩 성공 법칙", short: "성공 법칙", icon: ListChecks, color: "violet",
    tagline: "결과 품질을 가르는 습관", intro: "같은 AI라도 ‘어떻게 주문하고, 어떻게 고치고, 어떻게 검증하느냐’에 따라 결과가 하늘과 땅 차이입니다.",
    children: [
      { id: "r-context", label: "컨텍스트 엔지니어링", icon: MessageSquare, src: ["handbook", "mastering", "blueprint"], terms: ["context-eng", "prompt", "context-window", "api", "hallucination"],
        blocks: [
          { t: "lead", x: "모호한 한 줄을 넘어 ‘배경·제약·현재 상태’를 설계해 전달하는 [[context-eng|컨텍스트 엔지니어링]]이 성공의 핵심입니다." },
          { t: "h2", x: "성공률을 올리는 5요소" },
          { t: "steps", items: [
            "기술 스택 — 예: “Next.js와 Firebase 기반으로”",
            "현재 코드 상태 — 지금 화면이 어떤지",
            "최종 목표 & 제약 — 예: 익명 필수·개인정보 저장 금지",
            "에러 상황 — 콘솔에 뜬 정확한 메시지",
            "참조 문서 — 최신 공식 [[api|API]] 문서 URL",
          ]},
          { t: "note", kind: "analogy", x: "의사에게 “아파요” 대신 “어제부터 오른쪽 배가 아프고 열이 나요”라고 콕 집어 말하기." },
          { t: "note", kind: "tip", x: "AI가 한 번에 읽는 한도([[context-window|컨텍스트 윈도우]]) 안에서 핵심만 추려 주면 [[hallucination|할루시네이션]]이 줄어요." },
        ]},
      { id: "r-multimodal", label: "멀티모달 프롬프팅", icon: Quote, src: ["mastering", "blueprint"], terms: ["api", "hallucination"],
        blocks: [
          { t: "lead", x: "백 마디 말보다 한 장의 사진과 공식 문서가 강력합니다." },
          { t: "cols", cols: [
            { h: "① UI 참고 이미지", tone: "good", items: ["원하는 화면을 캡처해 첨부", "“이 레이아웃·색감으로”"] },
            { h: "② 공식 문서 URL", tone: "good", items: ["외부 기능 연동 시 최신 [[api|API]] 문서 링크", "지어내지 않도록 근거 못 박기"] },
          ]},
          { t: "note", kind: "warn", x: "근거 없이 텍스트만 의존하면 AI가 존재하지 않는 기능을 만들고 [[hallucination|환각]]을 일으킵니다." },
        ]},
      { id: "r-debug", label: "디버깅 무한 루프 (F12)", icon: Bug, src: ["handbook", "mastering", "blueprint", "app"], terms: ["hallucination"],
        blocks: [
          { t: "lead", x: "에러는 실패가 아닙니다. 수정도 AI의 몫이며, 구체적으로 전달할수록 처방이 정확해집니다." },
          { t: "flow", dir: "col", items: [
            { label: "① 증상 발견", sub: "화면이 안 뜸 / 버튼이 안 눌림" },
            { label: "② 단서 수집 (F12)", sub: "크롬 개발자도구 → Console의 붉은 에러 복사" },
            { label: "③ 상황 구체화", sub: "언제·어디서 나는지 명확히" },
            { label: "④ AI 진단·처방 → 테스트", sub: "고친 뒤 다시 ①부터" },
          ]},
          { t: "note", kind: "tip", x: "“안 돌아가요” 대신 콘솔의 붉은 메시지를 그대로 붙여넣으세요(“경고등이 떴어요”처럼 정확히)." },
        ]},
      { id: "r-verify", label: "검증과 책임", icon: Shield, src: ["guide", "handbook", "app"], terms: ["hallucination", "testmode", "rules"],
        blocks: [
          { t: "lead", x: "AI 결과를 맹신하지 말고 항상 직접 테스트·검증하는 습관이 곧 생존 전략입니다." },
          { t: "note", kind: "warn", x: "AI가 “[[rules|보안 규칙]] 닫았습니다”, “안전합니다”라고 해도 100% 믿지 말고, 내 폰으로 직접 접속해 확인하세요. [[testmode|테스트 모드]]가 열려 있을 수 있어요." },
          { t: "p", x: "배포되는 앱의 책임은 결국 ‘사람(교사)’에게 있습니다. [[hallucination|할루시네이션]]을 전제로 검증하세요." },
        ]},
      { id: "r-scope", label: "작게 시작하기 (MVP)", icon: Rocket, src: ["mastering", "handbook"], terms: ["mvp", "prototype", "crud"],
        blocks: [
          { t: "lead", x: "한 번에 완벽을 노리지 말고, ‘되는 것’을 작게 만들어 키우세요." },
          { t: "steps", items: [
            "가장 핵심 기능 하나만 먼저 ([[mvp|MVP]])",
            "작동을 확인하고 ([[prototype|프로토타입]])",
            "한 단계씩 기능을 더하기",
          ]},
          { t: "note", kind: "tip", x: "복잡한 비즈니스 로직보다 [[crud|CRUD]]형(수집·조회·수정·삭제)으로 쪼개면 AI 성공률이 확 올라요." },
        ]},
    ]},

  /* ── 6. 가능성과 한계 ───────────────────────────── */
  { id: "cap", label: "가능성과 한계", short: "가능성·한계", icon: Rocket, color: "rose",
    tagline: "무엇을 잘하고 무엇을 조심하나", intro: "바이브 코딩은 만능이 아닙니다. 강점에 집중하고 약점을 알면 실패가 줄어듭니다.",
    children: [
      { id: "cap-str", label: "강점", short: "강점", icon: Check, summary: "AI 생성 효율이 가장 높은 ‘승리 구간’.",
        children: [
          { id: "cap-mvp", label: "MVP / 프로토타이핑", icon: Rocket, src: ["mastering", "blueprint"], terms: ["mvp", "prototype"],
            blocks: [
              { t: "lead", x: "아이디어를 ‘작동하는 형태’로 만드는 [[mvp|MVP]]·[[prototype|프로토타입]]은 바이브 코딩이 가장 강한 영역입니다." },
              { t: "p", x: "완벽한 기획 전에 ‘되는지’ 먼저 확인 — 아이디어와 현실의 거리를 극적으로 줄입니다." },
            ]},
          { id: "cap-crud", label: "CRUD 앱", icon: ListChecks, src: ["mastering"], terms: ["crud", "firestore"],
            blocks: [
              { t: "lead", x: "[[crud|CRUD]](생성·조회·수정·삭제)가 반복되는 앱에서 효율이 최고입니다." },
              { t: "cols", cols: [
                { h: "딱 맞는 예", tone: "good", items: ["투두리스트·알림장", "설문·게시판·명단", "학급 일기장"] },
                { h: "왜 잘되나", tone: "info", items: ["패턴이 반복적", "[[firestore|저장]] 구조가 단순", "예시 데이터가 풍부"] },
              ]},
            ]},
          { id: "cap-auto", label: "자동화 스크립트", icon: Terminal, src: ["mastering"], terms: ["api"],
            blocks: [
              { t: "lead", x: "엑셀 정리·데이터 변환·반복 작업을 대신 처리하는 작은 스크립트도 잘 만듭니다." },
              { t: "note", kind: "tip", x: "“이런 표를 이렇게 바꿔 줘”처럼 입력·출력 예시를 같이 주면 정확도가 올라요." },
            ]},
        ]},
      { id: "cap-weak", label: "약점과 위험", short: "약점·위험", icon: AlertTriangle, summary: "AI가 자신 있게 틀리는 지점 — 미리 알면 피할 수 있습니다.",
        children: [
          { id: "cap-complex", label: "복잡한 로직에 취약", icon: AlertTriangle, src: ["mastering", "blueprint"], terms: ["hallucination"],
            blocks: [
              { t: "lead", x: "다단계 승인·세금 계산처럼 복잡한 비즈니스 로직, 고도의 성능 최적화는 약합니다." },
              { t: "note", kind: "warn", x: "그럴듯하게 만들지만 미묘하게 틀릴 수 있어요([[hallucination|할루시네이션]]). 복잡할수록 작게 쪼개고 더 꼼꼼히 검증하세요." },
            ]},
          { id: "cap-security", label: "보안 사각지대", icon: Lock, src: ["app", "guide"], terms: ["testmode", "rules", "anon"],
            blocks: [
              { t: "lead", x: "AI는 ‘일단 되게’ 만드느라 [[testmode|테스트 모드]]·과한 개인정보 수집 같은 위험을 남기기 쉽습니다." },
              { t: "note", kind: "warn", x: "학생 데이터가 들어가는 도구는 [[anon|익명]]·[[rules|보안 규칙]]을 사람이 직접 확인해야 합니다." },
            ]},
          { id: "cap-debt", label: "기술 부채", icon: Bug, src: ["handbook"], terms: ["mvp"],
            blocks: [
              { t: "lead", x: "빠르게 쌓은 코드는 나중에 손보기 어려운 ‘기술 부채’가 될 수 있습니다." },
              { t: "p", x: "개인용·일회성 도구는 ‘빠르게’가 정답이지만, 오래 쓸 도구는 구조를 한 번 정리하고 가세요." },
            ]},
        ]},
      { id: "cap-future", label: "미래 기술", short: "미래", icon: Cpu, summary: "바이브 코딩의 다음 단계 — 스스로 일하는 AI.",
        children: [
          { id: "cap-agent", label: "AI 에이전트 (자율 수행)", icon: Cpu, src: ["guide", "handbook", "mastering"], terms: ["agent", "github"],
            blocks: [
              { t: "lead", x: "목표를 주면 스스로 계획하고 여러 단계를 실행하는 [[agent|AI 에이전트]]의 시대로 갑니다." },
              { t: "cols", cols: [
                { h: "에이전트가 쓰는 도구", tone: "info", items: ["웹 검색", "DB 읽기/쓰기", "터미널 실행", "[[github|GitHub]] 자동 배포"] },
                { h: "달라지는 점", tone: "good", items: ["‘응답’ → ‘수행’", "사람은 목적·검증에 집중"] },
              ]},
            ]},
          { id: "cap-mcp", label: "MCP (모델 컨텍스트 프로토콜)", icon: Boxes, src: ["guide", "handbook", "blueprint"], terms: ["mcp", "api"],
            blocks: [
              { t: "lead", x: "[[mcp|MCP]]는 AI 모델을 외부 도구·데이터에 표준 방식으로 연결하는 개방형 규약(앤트로픽 제안)입니다." },
              { t: "note", kind: "analogy", x: "기기마다 다른 충전 단자 대신, 하나로 통일된 USB-C 포트." },
              { t: "p", x: "[[api|API]] 연결을 표준화해, 에이전트가 더 쉽게 도구를 쓰도록 돕습니다." },
            ]},
        ]},
    ]},
];

/* 출처 자료 — 프로젝트에 넣은 6개 파일 */
const SOURCES = [
  { file: "vibe-coding-companion.tsx", kind: "연수 앱", key: "app", desc: "이 동반자 앱의 원본 — 학습 지도·용어·키트·우체통 구조의 토대" },
  { file: "입문 가이드: 현대 웹 기술의 세계 (클라이언트·서버·데이터베이스)", kind: "문서", key: "guide", desc: "텍스트 입문 가이드 — 정의, 식당 비유, Firebase, 보안, 실전 프롬프트, 용어" },
  { file: "입문 가이드 (사본 _1)", kind: "문서", key: "guide", desc: "위 가이드와 동일 내용의 추가 사본" },
  { file: "Vibe Coding Handbook", kind: "슬라이드 15p", key: "handbook", desc: "완벽 가이드 덱 — 도메인 지식 통계, 도구 선택 지도, 컨텍스트 5요소, 안전장치" },
  { file: "Mastering Vibe Coding", kind: "슬라이드 15p", key: "mastering", desc: "3가지 핵심 특징, 잘함/못함, F12 디버깅, '총괄 셰프'" },
  { file: "Vibe Coding Blueprint", kind: "슬라이드 15p", key: "blueprint", desc: "벽돌공→건축가, 빙산 비유, 엑셀↔Firestore 매핑, 배포 파이프라인" },
];
const SRC_LABEL = { app: "연수 앱", guide: "입문 가이드", handbook: "Handbook", mastering: "Mastering", blueprint: "Blueprint" };
/* 트리 평탄화: 말단(leaf)을 강의 순서대로 나열 + 경로 추적 */
function isBranch(n) { return Array.isArray(n.children) && n.children.length > 0; }
function flattenLeaves(nodes, trail, out) {
  nodes.forEach((n) => {
    const t = [...trail, n];
    if (isBranch(n)) flattenLeaves(n.children, t, out);
    else out.push({ node: n, trail: t });
  });
  return out;
}
const LEAVES = flattenLeaves(MAP, [], []);
const TOTAL_NODES = LEAVES.length;
const LEAF_POS = {}; LEAVES.forEach((l, i) => { LEAF_POS[l.node.id] = i; });
/* 영역(최상위)별 말단 묶음 — 왼쪽 ‘학습 흐름’ 레일용 (강의 순서 유지) */
const AREA_LEAVES = {};
MAP.forEach((a) => { AREA_LEAVES[a.id] = LEAVES.filter((l) => l.trail[0].id === a.id).map((l) => l.node); });

/* ============================================================
   KIT — 실습 키트(코딩 워크벤치) 데이터
   ============================================================ */
const KIT_PREREQ = `# 0) (선택) Git 설치 확인 — 버전 관리·복구에 유용
git --version

# 1) Node.js LTS 설치 확인  (https://nodejs.org)
node -v        # v20 이상 권장
npm -v

# 2) Firebase CLI 설치
npm install -g firebase-tools

# 3) 설치 확인
firebase --version

# 4) 구글 계정 로그인 (브라우저 창이 열립니다)
firebase login`;

const KIT_DEPLOY = `# 빌드한 정적 파일(보통 dist/ 또는 build/) 폴더에서 실행

firebase login                 # 이미 했다면 생략
firebase init hosting          # public 폴더를 dist 또는 build로 지정
firebase deploy --only hosting

# ── 출력 예시 ───────────────────────────
# OK  Deploy complete!
# Hosting URL: https://my-class-mailbox.web.app
# ───────────────────────────────────────`;

const KIT_TROUBLE = [
  { code: "command not found: firebase", fix: "CLI 미설치 → npm install -g firebase-tools" },
  { code: "EACCES: permission denied (npm)", fix: "전역 설치 권한 오류 → 관리자 권한 터미널, 또는 npm prefix 권한을 재설정" },
  { code: "로그인 / 권한 오류", fix: "firebase login 다시 → 브라우저에서 구글 계정 승인" },
  { code: "빈(흰) 화면만 나온다", fix: "init에서 public 폴더를 dist 또는 build로 맞췄는지 확인" },
  { code: "Missing or insufficient permissions", fix: "보안 규칙이 읽기/쓰기를 막고 있음 → firestore.rules 설정 확인" },
  { code: "App Hosting 하라며 카드 요구", fix: "우리는 '클래식 Hosting' — 서버 없는 정적 앱으로 만들었는지 재확인" },
];

const KIT_CHECK = [
  "테스트 모드 해제 — Firestore 보안 규칙이 '전체 공개'로 방치되어 있지 않은가?",
  "개인정보 최소 수집 — 불필요한 이름·연락처·사진을 받고 있지 않은가?",
  "직접 테스트 — AI 말을 맹신하지 말고, 내 폰·옆 사람 폰에서 기기별로 작동하는가?",
  "예산 알림 설정 — (Blaze일 때) 무료 한도 초과 대비 Budget Alert를 켰는가?",
  "타 기기 접속 — 내 PC가 아닌 다른 환경에서도 URL 접속이 원활한가?",
];

const EX_MAILBOX = `Firebase Firestore 사용. 서버 없는 정적 웹앱으로 '익명 의견 우체통'을 만들어줘.
로그인은 익명 인증(Anonymous Auth)으로 처리하고, 이름·이메일은 절대 받지 마.
저장 데이터: 의견 텍스트와 제출 시각만 저장해.
보안 규칙(Security Rules)도 함께 — 테스트 모드(전체 공개)는 금지, 읽기는 막아줘.
화면은 의견 입력칸과 '익명으로 제출' 버튼만. 다른 사람 글은 보이지 않게.`;

const EX_QUIZ = `Firebase Firestore 사용. 서버 없는 정적 웹앱으로 '실시간 퀴즈·투표 앱'을 만들어줘.
로그인은 익명 인증으로, 개인정보는 받지 마.
저장 데이터: 선택한 보기와 제출 시각만 저장해.
교사 화면은 집계 막대그래프를 실시간으로 보여주고, 학생에게는 본인 응답만 보이게.
보안 규칙: 쓰기는 익명 로그인만, 집계 읽기는 관리자만 가능하게.`;

const EX_ROLLING = `Firebase Firestore 사용. 서버 없는 정적 웹앱으로 '익명 칭찬 롤링페이퍼'를 만들어줘.
로그인은 익명 인증, 작성자 개인정보는 저장하지 마.
저장 데이터: 칭찬 문구와 작성 시각만.
욕설·비방 필터를 넣고, 교사 승인 뒤에만 학생 화면에 공개되게 해줘.
보안 규칙: 쓰기는 누구나, 읽기는 '승인됨' 표시된 글만 보이도록.`;

const EX_TIMER = `서버 없는 순수 정적 화면 앱으로 '수업용 타이머·스톱워치'를 만들어줘.
데이터 저장이 필요 없으니 Firebase는 쓰지 마.
큰 숫자 타이머, 시작/일시정지/리셋 버튼, 종료 시 알림음.
모바일·교실 TV에서 잘 보이도록 글자를 크고 또렷하게.`;

const EX_DEBUG = `# 육하원칙 디버깅 템플릿 (에러 났을 때 그대로 채워서 붙여넣기)

[증상]   "제출" 버튼을 눌렀을 때 다음 화면으로 안 넘어가.
[언제]   버튼을 클릭하는 순간.
[기대]   원래는 "고마워요!" 안내가 뜨고 입력칸이 비워져야 해.
[에러]   콘솔(F12 → Console)에 이렇게 떠 (붉은 글씨 그대로 복사):
         Uncaught TypeError: Cannot read properties of null (reading 'value')
[요청]   원인을 찾아서 고쳐줘. 수정한 전체 코드를 다시 줘.`;

const EX_FEATURE = `# 기능 추가 프롬프트 (기존 코드 안 깨뜨리기)

지금 코드는 그대로 두고, 아래 기능만 추가해줘.
- 추가 기능: 제출하면 "고마워요!" 안내 메시지를 2초간 보여주기.
- 절대 건드리지 말 것: 기존 익명 인증 / 보안 규칙 / 디자인.
- 변경한 부분만 따로 표시하고, 전체 파일도 다시 줘.`;

const EX_RULESGEN = `# 보안 규칙 만들어 달라고 하기 (Firebase 콘솔에 붙여넣을 것)

지금 앱에 맞는 Firestore 보안 규칙을 만들어줘.
- 컬렉션 이름: responses (내 앱에 맞게 바꿔줘)
- 쓰기(create): 익명 인증으로 로그인한 사람만 (request.auth != null)
- 읽기/수정/삭제: 앱에서는 전부 차단 (교사만 콘솔에서 열람)
- 테스트 모드(전체 공개)는 절대 쓰지 마.

→ 결과 규칙을 Firebase 콘솔 > Firestore > '규칙' 탭에 붙여넣고 '게시'를 누르면 끝.`;

const CTX_APP = {
  mailbox: { name: "익명 의견 우체통", save: "의견 텍스트와 제출 시각만", extra: "화면은 의견 입력칸과 '익명으로 제출' 버튼만 둬. 다른 사람 글은 보이지 않게." },
  quiz:    { name: "실시간 퀴즈·투표 앱",   save: "선택한 보기와 제출 시각만", extra: "교사는 집계 막대그래프를 보고, 학생에게는 본인 응답만 보이게." },
  rolling: { name: "익명 칭찬 롤링페이퍼",  save: "칭찬 문구와 작성 시각만",   extra: "욕설·비방 필터를 넣고, 교사 승인 뒤에만 공개되게." },
  timer:   { name: "수업용 타이머·스톱워치", save: "저장 안 함(화면 도구)",     extra: "데이터 저장이 필요 없는 순수 정적 화면 앱으로. Firebase는 쓰지 마." },
};
const CTX_APP_LABEL = { mailbox: "익명 우체통", quiz: "퀴즈·투표", rolling: "롤링페이퍼", timer: "수업 타이머" };
const CTX_LEVEL_LABEL = { basic: "기본", standard: "표준", advanced: "심화" };

/* ============================================================
   퀴즈 데이터
   ============================================================ */
const QUIZ = [
  { q: "AI가 처음 만든 DB를 그대로 배포하면 위험한 이유는?", o: ["속도가 느려서", "테스트 모드라 누구나 읽고 쓸 수 있어서", "용량이 부족해서", "디자인이 안 예뻐서"], a: 1,
    e: "테스트 모드(전체 공개)는 링크만 알면 누구나 데이터를 지우고 쓸 수 있는 '열린 금고' 상태입니다." },
  { q: "이름·이메일 없이 '같은 사람'을 구분하는 방법은?", o: ["구글 로그인", "익명 인증", "이메일 인증", "비밀번호 설정"], a: 1,
    e: "익명 인증은 임시 식별표만 부여해, 중복 제출은 막으면서 개인정보 수집은 0으로 만듭니다." },
  { q: "무료 Hosting에 올리려면 앱을 어떻게 만들어야 하나?", o: ["서버 렌더링 앱", "서버 없는 정적 웹앱", "Next.js 앱", "데스크톱 앱"], a: 1,
    e: "정적 웹앱이어야 클래식 Hosting(무료·카드 불필요)에 올라갑니다." },
  { q: "다음 중 '컨텍스트 5요소'가 아닌 것은?", o: ["기술 스택", "현재 코드 상태", "AI의 기분", "참고 문서"], a: 2,
    e: "5요소는 기술 스택·현재 코드·원하는 결과와 제약·에러 상황·참고 문서입니다." },
  { q: "에러가 났을 때 AI에게 줄 가장 좋은 정보는?", o: ["\"안 돌아가요\"", "콘솔(F12)의 붉은 에러 로그", "스크린샷 없이 설명만", "다시 만들어달라는 요청"], a: 1,
    e: "AI는 화면을 못 보므로, 개발자 도구 콘솔의 정확한 에러 메시지가 진단의 핵심 단서입니다." },
  { q: "엑셀의 '시트(Sheet)'는 Firestore에서 무엇에 해당할까?", o: ["문서(Document)", "필드(Field)", "컬렉션(Collection)", "보안 규칙"], a: 2,
    e: "시트→컬렉션, 한 줄(행)→문서, 칸(열)→필드로 매핑됩니다." },
  { q: "바이브 코딩이 가장 '잘하는' 작업은?", o: ["복잡한 세금 계산 로직", "반복적인 CRUD 앱", "고도의 성능 최적화", "무결점 금융 시스템"], a: 1,
    e: "생성·조회·수정·삭제가 반복되는 CRUD 앱(설문·게시판·명단)에서 AI 생성 효율이 가장 높습니다." },
];

/* ============================================================
   LIVE QUIZ — 라이브 깜짝 퀴즈 (강사 발사 → 참여자 응답 → 점수·등수)
   - 운영자(강사)가 강의 중간에 퀴즈를 '발사'하면, 같은 세션의 모든
     참여자 화면에 팝업으로 나타납니다.
   - 정답이면 기본 100점 + 빠를수록 최대 100점 보너스. 세션별 누적 등수.
   - 저장 키: qz_live_{세션}(현재 문제) · qz_ans_{세션}_{문제id}(응답)
             · qz_scores_{세션}(누적 점수판)
   ============================================================ */
const MASTER_PW = "zz007031"; // 운영자(황미란 선생님) 마스터 비밀번호 — 어느 세션이든 입장 가능

const LIVEQ_CATS = { smalltalk: "☕ 스몰토크", ai: "🤖 AI 상식", news: "📰 AI 뉴스", custom: "✏️ 자작 퀴즈" };

const LIVEQ_BANK = [
  // ── ☕ 스몰토크 (2026년 2학기 개학일 · 오늘 연수 오신 선생님들 안부 + 유머) ──
  { cat: "smalltalk", q: "🌅 오늘, 2026년 2학기 개학일 아침! 알람이 울렸을 때 대한민국 선생님들의 표준 반응은?", o: ["\"벌써…?\"", "\"아직 방학이잖아…\"", "\"제발 꿈이길\"", "모두 정답"], a: 3,
    explain: "네, 모두 정답입니다 😂 그 마음을 안고 개학 첫날 연수까지 와 주신 것만으로 이미 대단하십니다. 박수 한번 드려요 👏" },
  { cat: "smalltalk", q: "📖 '방학 때 하려던 일을 전부 끝냈다'는 교사의 비율은 몇 %일까요?", o: ["약 80%", "약 50%", "약 20%", "그런 분은 전설 속에만 존재"], a: 3,
    explain: "통계청도 조사를 포기한 영역입니다 😌 못 끝낸 계획은 겨울방학의 나에게 정중히 이월합시다. 방학 잘 보내셨지요?" },
  { cat: "smalltalk", q: "🌾 개학하자마자 '더위 끝!'을 알린다는 절기, '모기도 입이 삐뚤어진다'는 그날은?", o: ["입추", "처서", "백로", "상강"], a: 1,
    explain: "처서(8월 23일 무렵)! 개학하고 딱 며칠만 버티면 '처서 매직'이 옵니다. 오늘 더위도 곧 끝나요 🍃" },
  { cat: "smalltalk", q: "⏰ 오늘 아침 '5분만 더…' 하고 스누즈 버튼을 누르면 실제로는?", o: ["더 개운하게 일어난다", "오히려 더 피곤해진다", "아무 영향 없다", "기억력이 좋아진다"], a: 1,
    explain: "수면이 잘게 쪼개져 오히려 더 피곤해진다는 게 연구 결과예요. 오늘 아침 몇 번 누르셨는지는… 묻지 않겠습니다 😌" },
  { cat: "smalltalk", q: "😴 내일부터라도 '개학 증후군'을 이기는 가장 과학적인 방법은?", o: ["밤샘으로 리듬 리셋", "기상 시간을 조금씩 되돌리기", "커피 3잔 연속 흡입", "정신력으로 버티기"], a: 1,
    explain: "수면 전문가들의 공통 처방은 '미리 조금씩'. …오늘은 이미 늦었으니 커피와 정신력으로 갑니다 ☕ 다들 컨디션은 좀 어떠세요?" },
  { cat: "smalltalk", q: "☕ 개학한 교무실의 연료! 대한민국 성인 1인당 연간 커피 소비량은?", o: ["약 150잔", "약 260잔", "약 400잔", "약 550잔"], a: 2,
    explain: "약 400잔 — 세계 평균의 두 배가 넘습니다. 오늘 교무실 커피포트가 유난히 바빴다면, 지극히 정상입니다." },
  { cat: "smalltalk", q: "🎤 오랜만에 수업하는 오늘, 선생님 목을 지키는 가장 좋은 방법은?", o: ["물 자주 마시기", "작게 속삭여 말하기", "사탕 계속 먹기", "헛기침으로 풀기"], a: 0,
    explain: "속삭이면 오히려 성대에 더 무리가 가요! 정답은 수분 보충. 방학 동안 쉬었던 목, 2학기에도 소중히 다뤄 주세요." },
  { cat: "smalltalk", q: "🎒 내일 아이들을 만나면, 교육심리 연구들이 '가장 먼저 하라'고 권하는 것은?", o: ["방학 숙제 검사", "반갑게 이름 불러 주기", "2학기 시험 일정 공지", "자리 재배치"], a: 1,
    explain: "관계 회복이 먼저! 숙제 검사는 모레도 할 수 있으니까요. 오늘 이 연수도 서로 반가움으로 시작해요 😊" },
  { cat: "smalltalk", q: "🍫 개학 주간에 유난히 단 게 당기는 과학적인 이유는?", o: ["스트레스 호르몬이 당을 부른다", "혀가 예민해져서", "순전히 기분 탓", "카페인 부족 신호"], a: 0,
    explain: "코르티솔이 빠른 에너지원인 당을 찾게 만들어요. 오늘 초콜릿이 당기셨다면 그건 과학입니다. 당당하게 드세요 🍫" },
  { cat: "smalltalk", q: "📅 오늘부터 겨울방학까지, 남은 등교일은 대략 며칠일까요?", o: ["약 50일", "약 70일", "약 90일", "약 130일"], a: 2,
    explain: "학교마다 다르지만 대략 90일 안팎! 생각보다 짧지요? 오늘 배우는 바이브 코딩과 함께라면 더 금방 갑니다 🚀" },
  { cat: "smalltalk", q: "🧑‍🏫 2학기에 숨어 있는 '선생님의 날', 유네스코가 정한 세계 교사의 날은?", o: ["9월 1일", "10월 5일", "11월 11일", "12월 25일"], a: 1,
    explain: "10월 5일! 5월 15일 말고도 축하받을 날이 하루 더 있습니다. 달력에 미리 표시해 두세요 🎉" },
  // ── 🤖 AI 상식 (오늘 배운 내용 복습 겸) ──
  { cat: "ai", q: "'바이브 코딩'이라는 말을 처음 만든 사람은?", o: ["샘 올트먼", "안드레이 카파시", "일론 머스크", "순다르 피차이"], a: 1,
    explain: "2025년 2월 카파시의 SNS 글에서 시작됐어요. 오픈AI 공동창립자이자 전 테슬라 AI 총괄입니다." },
  { cat: "ai", q: "AI가 그럴듯하지만 사실이 아닌 답을 '자신 있게' 내놓는 현상은?", o: ["오버피팅", "할루시네이션", "디버깅", "싱크로율"], a: 1,
    explain: "할루시네이션(환각)! 그래서 AI의 '완벽합니다'는 항상 직접 검증해야 해요." },
  { cat: "ai", q: "LLM이 글자를 읽고 처리하는 최소 단위는?", o: ["픽셀", "토큰", "바이트", "셀"], a: 1,
    explain: "토큰! 프롬프트가 길수록 토큰을 많이 쓰고, API 비용도 토큰 단위로 매겨집니다." },
  { cat: "ai", q: "AI가 한 번의 대화에서 기억할 수 있는 정보의 한도를 부르는 말은?", o: ["메모리 카드", "컨텍스트 윈도우", "캐시", "클라우드"], a: 1,
    explain: "컨텍스트 윈도우! 이 한도를 넘으면 대화 앞부분을 잊어버립니다. 쟁반에 접시를 너무 올리면 떨어지듯이요." },
  { cat: "ai", q: "ChatGPT · Gemini · Claude, 셋의 공통점은?", o: ["모두 구글 제품이다", "모두 대규모 언어모델(LLM)이다", "모두 유료로만 쓸 수 있다", "모두 한국에서 개발됐다"], a: 1,
    explain: "셋 다 LLM(대규모 언어모델)! 바이브 코딩에서 코드를 만들어 주는 '두뇌' 역할을 합니다." },
  { cat: "ai", q: "Firebase에서 '전 세계 누구나 읽고 쓸 수 있는' 위험한 상태를 부르는 말은?", o: ["테스트 모드", "안전 모드", "비행기 모드", "게스트 모드"], a: 0,
    explain: "테스트 모드! 현관문을 활짝 열어 둔 집과 같아서, 배포 전에 꼭 보안 규칙으로 닫아야 합니다." },
  { cat: "ai", q: "AI에게 배경·제약·현재 상태 같은 '맥락'을 설계해 전달하는 기술은?", o: ["컨텍스트 엔지니어링", "리버스 엔지니어링", "소셜 엔지니어링", "금융 엔지니어링"], a: 0,
    explain: "컨텍스트 엔지니어링! 입문과 중·고급을 가르는 가장 중요한 역량입니다." },
  { cat: "ai", q: "목표를 주면 스스로 계획하고 도구를 써서 일을 끝내는 AI를 부르는 말은?", o: ["AI 에이전트", "AI 아바타", "AI 필터", "AI 스피커"], a: 0,
    explain: "AI 에이전트! 바이브 코딩의 다음 단계로 꼽히는 흐름이에요." },
  // ── 📰 AI 뉴스 (요즘 이런 일이!) ──
  { cat: "news", q: "📰 콜린스 사전이 뽑은 2025 '올해의 단어'는?", o: ["딥페이크", "바이브 코딩", "프롬프트", "챗봇"], a: 1,
    explain: "바로 지금 우리가 배우는 '바이브 코딩'! 전 세계적 현상이 됐다는 신호예요." },
  { cat: "news", q: "📰 METR 연구에서 AI 도구를 쓴 숙련 개발자들의 '실제' 작업 속도는?", o: ["24% 빨라졌다", "변화가 없었다", "19% 느려졌다", "2배 빨라졌다"], a: 2,
    explain: "실제론 19% 느려졌는데 본인들은 '20% 빨라졌다'고 느꼈어요. 체감과 실측의 간극!" },
  { cat: "news", q: "📰 개발자의 92%가 AI 코딩 도구를 쓰지만, 결과 코드를 '신뢰'하는 비율은?", o: ["약 92%", "약 70%", "약 50%", "약 29%"], a: 3,
    explain: "겨우 29%! '비판적으로 받아들이기'가 새로운 핵심 역량이 됐습니다." },
  { cat: "news", q: "📰 검토 없이 배포된 한 바이브 코딩 앱에서 노출된 인증 토큰의 수는?", o: ["약 1만 5천 개", "약 15만 개", "약 150만 개", "약 1,500개"], a: 2,
    explain: "무려 150만 개! 오늘 배우는 '테스트 모드 닫기·보안 규칙'이 왜 필수인지 보여주는 실제 사고입니다." },
  { cat: "news", q: "📰 YC 2025 겨울 스타트업 중 일부는 코드의 몇 %를 AI로 생성했다고 할까요?", o: ["25%", "50%", "75%", "95%"], a: 3,
    explain: "95%! 코드의 대부분을 AI가 쓰는 스타트업이 이미 등장했습니다." },
  { cat: "news", q: "📰 구글·Kaggle이 무료로 연 '바이브 코딩' 집중 과정의 기간은?", o: ["1일", "5일", "30일", "6개월"], a: 1,
    explain: "5일 무료 온라인 과정! 연수 이후 더 배우고 싶은 선생님께 추천해요." },
];

/* ============================================================
   리치 텍스트 렌더러: [[key|label]] 용어 링크 + **굵게**
   ============================================================ */
function renderRich(text, openTerm) {
  const out = [];
  const re = /\[\[([^\]|]+)\|([^\]]+)\]\]|\*\*([^*]+)\*\*/g;
  let last = 0, m, i = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index));
    if (m[1]) {
      const key = m[1], label = m[2];
      out.push(
        <button key={i++} onClick={() => openTerm(key)} title="개념 설명 보기"
          className="bubble-term">
          {label}<span className="bubble-ic">💬</span>
        </button>
      );
    } else {
      out.push(<strong key={i++} className="font-bold text-slate-900">{m[3]}</strong>);
    }
    last = re.lastIndex;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

/* ---------- 작은 UI 컴포넌트 ---------- */
function Callout({ kind, children }) {
  const map = {
    analogy: { bg: "bg-emerald-50", br: "border-emerald-200", tx: "text-emerald-700", Icon: Quote, label: "비유" },
    tip: { bg: "bg-amber-50", br: "border-amber-200", tx: "text-amber-700", Icon: Lightbulb, label: "현장 팁" },
    warn: { bg: "bg-rose-50", br: "border-rose-200", tx: "text-rose-700", Icon: AlertTriangle, label: "주의 · 심화" },
  }[kind];
  const { Icon } = map;
  return (
    <div className={`${map.bg} ${map.br} border rounded-xl p-4`}>
      <div className={`${map.tx} flex items-center gap-1.5 text-xs font-bold tracking-wide mb-1.5`}>
        <Icon size={14} /> {map.label}
      </div>
      <div className="text-slate-700 text-[15px] leading-relaxed">{children}</div>
    </div>
  );
}

function CopyBtn({ text, label = "복사", small = false }) {
  const [done, setDone] = useState(false);
  const copy = async () => {
    try { await navigator.clipboard.writeText(text); setDone(true); setTimeout(() => setDone(false), 1500); } catch {}
  };
  return (
    <button onClick={copy}
      className={`flex items-center gap-1.5 font-semibold rounded-lg transition-colors ${small ? "text-[11px] px-2 py-1" : "text-xs px-3 py-1.5"} ${done ? "bg-emerald-100 text-emerald-700" : "bg-indigo-600 text-white hover:bg-indigo-700"}`}>
      {done ? <><Check size={13} /> 복사됨</> : <><Copy size={13} /> {label}</>}
    </button>
  );
}

/* ============================================================
   HELP — 친근한 도움말(❓): 쉬운 설명 + 비유 + 예시
   처음 접하는 선생님을 위해, 누르면 풀어서 설명합니다.
   ============================================================ */
const HELP = {
  idea: { title: "‘내 아이디어’ 칸이 뭔가요?", emoji: "✏️",
    plain: "만들고 싶은 도구를 평소 쓰는 말로 적으면 됩니다. 전문 용어는 전혀 필요 없어요. 적은 내용이 아래 ‘완성 프롬프트’에 그대로 반영돼요.",
    analogy: "요리사에게 “매콤한 비빔국수 느낌으로요”라고 주문하듯, 느낌과 목적만 말해도 충분합니다.",
    ex: "“모둠 발표 순서를 무작위로 정해 주는 도구” · “우리 반 하루 한 줄 감사일기”" },
  preset: { title: "‘빠른 예시’ 버튼은요?", emoji: "⚡",
    plain: "자주 쓰는 도구의 설정을 한 번에 채워 줍니다. 버튼을 누르면 아이디어와 옵션이 자동으로 세팅되고, 거기서 조금씩 고치면 돼요.",
    analogy: "라면 끓일 때 ‘기본 레시피’를 깔고 내 입맛대로 계란·파를 추가하는 것과 같아요.",
    ex: "‘익명 우체통’을 누르면 → 익명 ON, 읽기 ‘차단’ 으로 자동 설정." },
  data: { title: "‘데이터 저장’은 언제 켜나요?", emoji: "💾",
    plain: "입력한 내용을 ‘남겨야’ 하면 켜세요. 새로고침해도 사라지면 안 되는 정보(응답·기록·명단)가 있으면 ON 입니다. 단순 화면 도구(타이머)는 OFF.",
    analogy: "손님 주문을 ‘장부에 적어 두느냐’의 차이예요. 적어 둬야 나중에 볼 수 있죠.",
    ex: "설문 응답·롤링페이퍼=ON / 스톱워치·계산기=OFF" },
  anon: { title: "‘익명 인증’이 뭐예요?", emoji: "🪪",
    plain: "이름·이메일을 받지 않고도 ‘같은 사람’인지만 구분하는 방법이에요. 중복 제출은 막으면서 개인정보는 0으로 모읍니다. 학교에서 가장 안전한 선택!",
    analogy: "입장할 때 이름을 묻지 않고 손목에 ‘투명 도장’만 찍어, 재입장만 확인하는 것과 같아요.",
    ex: "‘한 사람 한 번만 투표’는 되면서, 누가 했는지는 모름." },
  read: { title: "‘읽기 권한’은 무슨 뜻인가요?", emoji: "👀",
    plain: "모인 내용을 ‘누가 볼 수 있는지’ 정하는 설정이에요. 익명 고민함이면 ‘차단(교사만)’, 다 같이 보는 게시판이면 ‘공개’를 고르세요.",
    analogy: "우체통은 넣는 건 누구나, 꺼내 읽는 건 우체부(교사)만. 이게 ‘차단’이에요.",
    ex: "차단=서로 못 봄 / 본인만=내 글만 / 공개=다 같이 봄" },
  realtime: { title: "‘실시간 반영’이 필요할까요?", emoji: "⚡",
    plain: "켜면 누군가 입력하는 즉시 모두의 화면에 새로 고침 없이 나타납니다. 투표 집계·실시간 칠판처럼 ‘바로바로 보여야’ 할 때 켜세요.",
    analogy: "단톡방처럼, 새로고침 안 해도 메시지가 톡톡 올라오는 느낌이에요.",
    ex: "실시간 투표 결과 그래프 = ON / 제출만 받는 고민함 = OFF여도 OK" },
  image: { title: "‘사진 업로드’ 옵션은요?", emoji: "🖼️",
    plain: "참여자가 사진을 올려야 하면 켜세요. 사진은 용량이 커서 별도 저장소(Firebase Storage)를 쓰고, 용량·형식 제한을 두도록 프롬프트에 안내가 추가됩니다.",
    analogy: "글은 쪽지함에, 사진은 따로 큰 사진첩에 보관하는 것과 같아요.",
    ex: "‘우리 반 사진 전시’=ON / 텍스트 설문=OFF" },
  level: { title: "‘난이도’는 무엇을 바꾸나요?", emoji: "🎚️",
    plain: "AI에게 주는 ‘설명의 꼼꼼함’ 수준이에요. 높일수록 반응형·친절한 에러 안내·중복 방지 같은 조건이 더 붙어 결과가 탄탄해집니다.",
    analogy: "같은 김밥도 ‘대충 싸 줘’와 ‘재료·두께·자르는 법까지’ 주문하는 차이예요.",
    ex: "처음엔 ‘기본’ → 결과 보고 부족하면 ‘표준 → 심화’로 올려 보세요." },
  "r-write": { title: "‘쓰기 허용’ 규칙이란?", emoji: "✍️",
    plain: "누가 데이터를 ‘새로 넣을 수’ 있는지 정해요. 보통 ‘익명 로그인만’이 안전합니다. ‘누구나’는 링크만 알면 스팸도 가능해 권장하지 않아요.",
    analogy: "가게 문을 ‘손님(로그인한 사람)만’ 열게 할지, ‘아무나’ 열게 할지 정하는 거예요.",
    ex: "익명 로그인만 = 우리 반만 / 누구나 = 위험" },
  "r-read": { title: "규칙의 ‘읽기 권한’", emoji: "🔒",
    plain: "위 ‘읽기 권한’ 설정을 실제 보안 규칙 코드로 바꿔 줍니다. ‘차단’이면 앱에서 아무도 못 읽고(교사는 콘솔에서 봄), ‘본인만’이면 자기 글만 보여요.",
    analogy: "도서관 책을 ‘열람 금지 / 본인 대출분만 / 누구나’ 중 무엇으로 둘지 정하는 거예요.",
    ex: "익명 고민함 → ‘차단’ 추천" },
  "r-size": { title: "‘글자 수 제한’은 왜?", emoji: "📏",
    plain: "한 번에 너무 긴 글(또는 장난 도배)을 막아 줍니다. 규칙에 ‘500자 미만만 저장’ 조건을 더해요.",
    analogy: "엽서 한 장에 쓸 수 있는 글자 수를 정해 두는 것과 같아요.",
    ex: "댓글·고민 한 줄이면 충분히 넉넉해요." },
  "r-dup": { title: "‘중복 제출 방지’ 메모", emoji: "🚫",
    plain: "한 사람이 똑같은 걸 여러 번 제출하지 못하게 하는 ‘방법 안내’를 코드 주석으로 넣어 줍니다(앱 코드에서 익명 ID로 처리).",
    analogy: "투표소에서 손등에 도장을 찍어 ‘이미 투표함’을 표시하는 것과 같아요.",
    ex: "1인 1표 설문에 유용해요." },
  deploy: { title: "‘배포(Deploy)’가 뭐예요?", emoji: "🚀",
    plain: "내 컴퓨터에서만 보이던 걸 인터넷에 올려 ‘누구나 접속하는 주소(URL)’를 만드는 일이에요. 그래야 학생들이 폰으로 들어올 수 있어요.",
    analogy: "집에서 만든 음식을 ‘가게를 열어’ 손님이 사 먹게 하는 것과 같아요.",
    ex: "정적 앱이면 무료 ‘클래식 Hosting’으로 카드 없이 가능." },
  prereq: { title: "‘사전 준비’ 명령어는 꼭?", emoji: "🧰",
    plain: "AI Studio·Replit 같은 도구만 쓰면 설치가 거의 필요 없어요. 이 명령어들은 ‘내 컴퓨터에서 직접 배포’할 때만 필요합니다. 부담 없이 건너뛰어도 돼요.",
    analogy: "외식만 할 거면 주방 도구가 필요 없는 것과 같아요. 직접 요리할 때만 준비!",
    ex: "워크숍에선 보통 AI Studio로 충분합니다." },
};
function HelpDot({ k }) {
  const [open, setOpen] = useState(false);
  const h = HELP[k];
  if (!h) return null;
  return (
    <>
      <span role="button" tabIndex={0} className="help-dot" aria-label={"도움말: " + h.title}
        onClick={(e) => { e.stopPropagation(); setOpen(true); }}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); e.stopPropagation(); setOpen(true); } }}>?</span>
      {open && (
        <div className="help-back" onClick={() => setOpen(false)}>
          <div className="help-card" onClick={(e) => e.stopPropagation()}>
            <div className="help-head">
              <span className="help-emoji">{h.emoji || "💡"}</span>
              <h3 className="help-title">{h.title}</h3>
              <button className="help-x" onClick={() => setOpen(false)} aria-label="닫기"><X size={16} /></button>
            </div>
            <div className="help-body">
              <p className="help-plain">{h.plain}</p>
              {h.analogy && <div className="help-row help-analogy"><span className="help-tag">🍳 쉬운 비유</span><p>{h.analogy}</p></div>}
              {h.ex && <div className="help-row help-ex"><span className="help-tag">✏️ 예시</span><p>{h.ex}</p></div>}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/* ============================================================
   NodeBlock — 마인드맵 상세 패널 블록 렌더러
   ============================================================ */
function NodeBlock({ b, openTerm }) {
  if (b.t === "lead") return <p className="nb-lead">{renderRich(b.x, openTerm)}</p>;
  if (b.t === "h2") return <h3 className="nb-h2">{renderRich(b.x, openTerm)}</h3>;
  if (b.t === "p") return <p className="text-[15px] leading-relaxed text-slate-700">{renderRich(b.x, openTerm)}</p>;
  if (b.t === "note") return <Callout kind={b.kind}>{renderRich(b.x, openTerm)}</Callout>;

  if (b.t === "cmp")
    return (
      <div className="grid sm:grid-cols-2 gap-3">
        <div className="rounded-xl bg-rose-50 border border-rose-200 p-4">
          <div className="flex items-center gap-1.5 text-rose-600 font-bold text-[13px] mb-1.5"><X size={15} /> {b.bad.h}</div>
          <p className="text-[14px] text-slate-700 leading-relaxed">{renderRich(b.bad.x, openTerm)}</p>
        </div>
        <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4">
          <div className="flex items-center gap-1.5 text-emerald-600 font-bold text-[13px] mb-1.5"><Check size={15} /> {b.good.h}</div>
          <p className="text-[14px] text-slate-700 leading-relaxed">{renderRich(b.good.x, openTerm)}</p>
        </div>
      </div>
    );

  if (b.t === "trio")
    return (
      <div className="grid grid-cols-3 gap-2">
        {b.items.map((it) => (
          <button key={it.k} onClick={() => openTerm(it.k)} className="rounded-xl bg-slate-50 border border-slate-200 p-3 text-center hover:border-indigo-300 hover:bg-white transition-colors">
            <div className="font-bold text-[13px] text-indigo-700">{it.label}</div>
            <div className="text-[10px] text-slate-400 mt-1 leading-tight">{it.sub}</div>
          </button>
        ))}
      </div>
    );

  if (b.t === "stats")
    return (
      <div className="grid grid-cols-3 gap-2">
        {b.items.map((it, i) => (
          <div key={i} className="rounded-xl bg-indigo-950 p-3 text-center">
            <div className="text-xl sm:text-2xl font-extrabold text-amber-400">{it.n}</div>
            <div className="text-[10px] text-indigo-200 mt-1 leading-tight">{it.label}</div>
          </div>
        ))}
      </div>
    );

  if (b.t === "steps")
    return (
      <div className="space-y-2">
        {b.items.map((x, i) => (
          <div key={i} className="flex items-start gap-3 rounded-xl bg-slate-50 border border-slate-200 p-3">
            <div className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold text-[12px] flex items-center justify-center shrink-0 mt-0.5">{i + 1}</div>
            <p className="text-[14px] text-slate-700 leading-relaxed">{renderRich(x, openTerm)}</p>
          </div>
        ))}
      </div>
    );

  if (b.t === "cols") {
    const tone = {
      good: { bg: "bg-emerald-50", br: "border-emerald-200", dot: "bg-emerald-500", h: "text-emerald-800" },
      bad: { bg: "bg-rose-50", br: "border-rose-200", dot: "bg-rose-500", h: "text-rose-800" },
      info: { bg: "bg-slate-50", br: "border-slate-200", dot: "bg-indigo-500", h: "text-indigo-900" },
    };
    return (
      <div className={`grid gap-2 ${b.cols.length >= 3 ? "sm:grid-cols-3" : "sm:grid-cols-2"}`}>
        {b.cols.map((c, i) => {
          const tn = tone[c.tone] || tone.info;
          return (
            <div key={i} className={`rounded-xl ${tn.bg} ${tn.br} border p-3.5`}>
              <div className={`font-bold text-[13px] ${tn.h} mb-2`}>{renderRich(c.h, openTerm)}</div>
              <ul className="space-y-1.5">
                {c.items.map((it, j) => (
                  <li key={j} className="flex items-start gap-2 text-[13px] text-slate-700 leading-snug">
                    <span className={`w-1.5 h-1.5 rounded-full ${tn.dot} shrink-0 mt-1.5`} />
                    <span>{renderRich(it, openTerm)}</span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    );
  }

  if (b.t === "table")
    return (
      <div className="rounded-xl border border-slate-200 overflow-hidden">
        <div className="grid grid-cols-2 bg-indigo-950 text-white text-[12px] font-bold">
          <div className="px-3 py-2">{b.head[0]}</div>
          <div className="px-3 py-2 border-l border-white/10">{b.head[1]}</div>
        </div>
        {b.rows.map((r, i) => (
          <div key={i} className={`grid grid-cols-2 text-[13px] ${i % 2 ? "bg-slate-50" : "bg-white"}`}>
            <div className="px-3 py-2 text-slate-600 flex items-center">{renderRich(r[0], openTerm)}</div>
            <div className="px-3 py-2 border-l border-slate-100 text-slate-800 font-medium flex items-center">{renderRich(r[1], openTerm)}</div>
          </div>
        ))}
        {b.note && <div className="px-3 py-2 bg-amber-50 border-t border-amber-100 text-[12px] text-amber-700">{renderRich(b.note, openTerm)}</div>}
      </div>
    );

  if (b.t === "flow") {
    const row = b.dir === "row";
    return (
      <div className={`flex ${row ? "flex-col sm:flex-row sm:items-stretch" : "flex-col"} gap-2`}>
        {b.items.map((it, i) => (
          <React.Fragment key={i}>
            <div className="flex-1 rounded-xl bg-gradient-to-br from-indigo-50 to-white border border-indigo-200 p-3">
              <div className="font-bold text-[13px] text-indigo-900 leading-snug">{renderRich(it.label, openTerm)}</div>
              {it.sub && <div className="text-[12px] text-slate-500 mt-1 leading-snug">{renderRich(it.sub, openTerm)}</div>}
            </div>
            {i < b.items.length - 1 && (
              <div className="flex items-center justify-center text-indigo-300 shrink-0">
                {row ? <ArrowRight size={18} className="hidden sm:block" /> : null}
                {row ? <ChevronDown size={18} className="sm:hidden" /> : <ChevronDown size={18} />}
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    );
  }

  if (b.t === "code")
    return (
      <div className={"rounded-xl overflow-hidden border " + (b.danger ? "border-rose-300 bg-rose-950" : "border-indigo-900 bg-indigo-950")}>
        <div className={"flex items-center justify-between px-3 py-2 " + (b.danger ? "bg-rose-900/70" : "bg-indigo-900/60")}>
          <span className={"text-[11px] font-mono " + (b.danger ? "text-rose-200" : "text-indigo-200")}>{b.label || "프롬프트 예시"}</span>
          <CopyBtn text={b.code} small />
        </div>
        <pre className={"px-3.5 py-3 text-[12.5px] leading-relaxed font-mono whitespace-pre-wrap overflow-x-auto " + (b.danger ? "text-rose-100" : "text-indigo-100")}>{b.code}</pre>
      </div>
    );

  if (b.t === "linkout")
    return (
      <div className="flex flex-wrap gap-2">
        {b.links.map((lk, i) => (
          <a key={i} href={lk.url} target="_blank" rel="noopener noreferrer"
            className={"inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-bold text-[13px] no-underline transition-colors " + (lk.primary ? "bg-emerald-600 hover:bg-emerald-700 text-white" : "bg-white border border-slate-200 text-slate-700 hover:border-emerald-300")}>
            {lk.label} <ExternalLink size={13} />
          </a>
        ))}
      </div>
    );

  if (b.t === "news") return <NewsCards />;

  return null;
}
const ACCENT = {
  amber:   { dot: "#f59e0b", soft: "#fffbeb", line: "rgba(245,158,11,.55)", text: "#b45309" },
  sky:     { dot: "#0284c7", soft: "#f0f9ff", line: "rgba(2,132,199,.55)", text: "#0369a1" },
  violet:  { dot: "#7c3aed", soft: "#f5f3ff", line: "rgba(124,58,237,.55)", text: "#6d28d9" },
  orange:  { dot: "#ea580c", soft: "#fff7ed", line: "rgba(234,88,12,.55)", text: "#c2410c" },
  emerald: { dot: "#059669", soft: "#ecfdf5", line: "rgba(5,150,105,.55)", text: "#047857" },
  teal:    { dot: "#0d9488", soft: "#f0fdfa", line: "rgba(13,148,136,.55)", text: "#0f766e" },
  rose:    { dot: "#e11d48", soft: "#fff1f2", line: "rgba(225,29,72,.55)", text: "#be123c" },
  fuchsia: { dot: "#c026d3", soft: "#fdf4ff", line: "rgba(192,38,211,.55)", text: "#a21caf" },
};
function radial(n, R, cx = 50, cy = 50, start = -90) {
  const out = [];
  for (let i = 0; i < n; i++) {
    const a = (start + (i * 360) / n) * Math.PI / 180;
    out.push({ x: cx + R * Math.cos(a), y: cy + R * Math.sin(a) });
  }
  return out;
}

/* 위계형 마인드맵: ROOT → 영역 → (하위 분류) → 말단(상세 페이지) */
function MindMapView({ openTerm, readNodes, markNode }) {
  const [path, setPath] = useState([]);      // 줌 스택(노드 배열)
  const [detail, setDetail] = useState(null); // 열린 말단 id

  const current = path.length ? path[path.length - 1] : null;
  const children = current ? current.children : MAP;
  const branchColor = path.length ? ACCENT[path[0].color] : null;

  const zoomTo = (depth) => { setPath(path.slice(0, depth)); };
  const onChild = (n) => { if (isBranch(n)) setPath([...path, n]); else openLeaf(n.id); };
  const openLeaf = (id) => {
    const entry = LEAVES[LEAF_POS[id]];
    setPath(entry.trail.slice(0, -1));   // 지도 맥락을 말단의 가지로 동기화
    setDetail(id);
    markNode(id);
  };
  const navLeaf = (delta) => {
    const pos = LEAF_POS[detail] + delta;
    if (pos < 0 || pos >= LEAVES.length) return;
    openLeaf(LEAVES[pos].node.id);
  };

  const pts = radial(children.length, children.length <= 4 ? 33 : 37);
  const visited = readNodes.size;
  const pct = Math.round((visited / TOTAL_NODES) * 100);
  const stageKey = "root/" + path.map((p) => p.id).join("/");

  return (
    <div className="mm-root">
      <div className="mm-grid">
        {/* ── 학습 흐름(순서) 레일 ── */}
        <aside className="mm-flow">
          <div className="mm-flow-h"><Compass size={14} /> 학습 흐름 <span className="mm-flow-prog">{visited}/{TOTAL_NODES}</span></div>
          <div className="mm-flow-bar"><div className="mm-flow-fill" style={{ width: pct + "%" }} /></div>
          <button className="mm-flow-start" onClick={() => openLeaf(LEAVES[0].node.id)}><Play size={13} /> 처음부터 순서대로</button>
          <ol className="mm-flow-list">
            {MAP.map((area, ai) => {
              const isCur = !!(path[0] && path[0].id === area.id);
              const leaves = AREA_LEAVES[area.id] || [];
              const doneCount = leaves.filter((lf) => readNodes.has(lf.id)).length;
              const ac = ACCENT[area.color];
              return (
                <li key={area.id}>
                  <button className={"mm-flow-area" + (isCur ? " on" : "")} onClick={() => setPath([area])} style={isCur ? { borderColor: ac.dot } : undefined}>
                    <span className="mm-flow-no" style={{ background: ac.soft, color: ac.text }}>{ai + 1}</span>
                    <span className="mm-flow-area-tx">{area.short || area.label}</span>
                    <span className="mm-flow-cnt">{doneCount}/{leaves.length}</span>
                  </button>
                  {isCur && (
                    <ul className="mm-flow-sub">
                      {leaves.map((lf, li) => {
                        const done = readNodes.has(lf.id);
                        const here = detail === lf.id;
                        return (
                          <li key={lf.id}>
                            <button className={"mm-flow-leaf" + (here ? " here" : "") + (done ? " done" : "")} onClick={() => openLeaf(lf.id)}>
                              <span className="mm-flow-leaf-no">{done ? <Check size={11} /> : li + 1}</span>
                              <span className="mm-flow-leaf-tx">{lf.label}</span>
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </li>
              );
            })}
          </ol>
        </aside>

        {/* ── 지도 무대 ── */}
        <div className="mm-stage-col">
          {/* breadcrumb */}
          <div className="mm-crumb">
            <button className={"mm-crumb-link" + (path.length ? "" : " here")} onClick={() => zoomTo(0)}>
              <Compass size={13} /> 전체 지도
            </button>
            {path.map((n, i) => (
              <React.Fragment key={n.id}>
                <span className="mm-crumb-sep">›</span>
                <button className={"mm-crumb-link" + (i === path.length - 1 ? " here" : "")}
                  style={i === path.length - 1 ? { color: branchColor.text } : undefined}
                  onClick={() => zoomTo(i + 1)}>{n.short || n.label}</button>
              </React.Fragment>
            ))}
          </div>

          {/* 영역 빠른 전환(루트의 6개 영역) */}
          <div className="mm-switch">
            {MAP.map((b) => (
              <button key={b.id} onClick={() => setPath([b])} title={b.label}
                className={"mm-switch-dot" + (path[0] && path[0].id === b.id ? " on" : "")}
                style={{ ["--c"]: ACCENT[b.color].dot }} />
            ))}
          </div>

          <div className="mm-stage" key={stageKey}>
            <svg className="mm-wires" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
              {children.map((n, i) => (
                <line key={i} x1="50" y1="50" x2={pts[i].x} y2={pts[i].y}
                  stroke={path.length ? branchColor.line : ACCENT[n.color].line}
                  strokeWidth="0.5" pathLength="1" className="mm-wire" style={{ animationDelay: `${i * 50}ms` }} />
              ))}
            </svg>

            {/* center hub */}
            {path.length === 0 ? (
              <div className="mm-hub">
                <span className="mm-hub-ic"><Sparkles size={19} /></span>
                <span className="mm-hub-k">바이브 코딩</span>
                <span className="mm-hub-s">마스터 가이드</span>
              </div>
            ) : (
              <button className="mm-hub mm-hub-branch" style={{ ["--c"]: branchColor.dot }} onClick={() => zoomTo(path.length - 1)} title="한 단계 위로">
                <span className="mm-hub-ic"><current.icon size={19} /></span>
                <span className="mm-hub-k">{current.short || current.label}</span>
                <span className="mm-hub-s">{children.length}개 항목</span>
              </button>
            )}

            {/* nodes */}
            {children.map((n, i) => {
              const ac = path.length ? branchColor : ACCENT[n.color];
              const branch = isBranch(n);
              const done = !branch && readNodes.has(n.id);
              return (
                <button key={n.id} className={"mm-node" + (branch ? " mm-branch" : " mm-child")}
                  onClick={() => onChild(n)} aria-label={n.label}
                  style={{ left: `${pts[i].x}%`, top: `${pts[i].y}%`, ["--c"]: ac.dot, ["--soft"]: ac.soft, animationDelay: `${i * 50}ms` }}>
                  <span className="mm-node-ic">
                    <n.icon size={branch ? 17 : 15} />
                    {branch && <span className="mm-node-more"><ChevronRight size={9} /></span>}
                    {done && <span className="mm-node-chk"><Check size={9} /></span>}
                  </span>
                  <span className="mm-node-tx">{n.short || n.label}</span>
                </button>
              );
            })}
          </div>

          <p className="mm-hint">
            {path.length === 0
              ? "6개 영역 중 하나를 탭하면 펼쳐져요. 점점 파고들며 위계를 따라 학습합니다."
              : isBranch(children[0])
                ? "하위 분류를 탭해 더 펼치거나, 가운데를 눌러 위로 올라가세요."
                : "개념을 탭하면 강의 페이지가 열려요. 가운데를 누르면 위로 올라갑니다."}
          </p>
        </div>

        {/* ── 사이드 패널 ── */}
        <div className="mm-side">
          {path.length === 0 ? (
            <>
              <div className="mm-side-card">
                <h2 className="mm-side-title">학습 지도 <span className="mm-side-sub">위계로 따라가는 연수</span></h2>
                <p className="mm-side-desc">발표자료(PPT)를 대신하는 페이지예요. 왼쪽 <b>학습 흐름</b>으로 순서를 따라가고, 가운데 지도에서 <b>영역 → 세부 개념</b>을 눌러 펼쳐 보세요. 각 개념 페이지는 슬라이드처럼 자세합니다.</p>
              </div>
              <SourcesCard openTerm={openTerm} />
            </>
          ) : (
            <>
              <div className="mm-side-card" style={{ borderTopColor: branchColor.dot }}>
                <button className="mm-back2" onClick={() => zoomTo(path.length - 1)}><ArrowLeft size={13} /> 위로</button>
                <h2 className="mm-side-title" style={{ color: branchColor.text }}>{current.label}</h2>
                {current.tagline && <div className="mm-tag" style={{ background: branchColor.soft, color: branchColor.text }}>{current.tagline}</div>}
                <p className="mm-side-desc">{current.intro || current.summary}</p>
                <p className="mm-side-desc" style={{ marginTop: 8, fontSize: 12, color: "#94a3b8" }}>왼쪽 <b>학습 흐름</b>에서 이 영역의 개념을 순서대로 따라갈 수 있어요.</p>
              </div>
              <SourcesCard openTerm={openTerm} />
            </>
          )}
        </div>
      </div>

      {detail && <DetailPanel leafId={detail} onClose={() => setDetail(null)} openTerm={openTerm} onNav={navLeaf} />}
    </div>
  );
}

function DetailPanel({ leafId, onClose, openTerm, onNav }) {
  const pos = LEAF_POS[leafId];
  const entry = LEAVES[pos];
  const node = entry.node;
  const trail = entry.trail;            // [영역, (하위분류), 말단]
  const branch = trail[0];
  const ac = ACCENT[branch.color];
  const crumbLabels = trail.slice(0, -1).map((n) => n.short || n.label);
  const srcs = [...new Set((node.src || []).map((s) => SRC_LABEL[s]).filter(Boolean))];
  const terms = (node.terms || []).filter((k) => GLOSSARY[k]);
  const prev = LEAVES[pos - 1], next = LEAVES[pos + 1];

  // 폭 조절(리사이즈) — 드래그하거나 프리셋으로 넓히면 본문이 폭에 맞게 여러 열로 재배치
  const vw = typeof window !== "undefined" ? window.innerWidth : 1280;
  const MAXW = Math.max(420, Math.min(1340, vw - 24));
  const MINW = 360;
  const clamp = (n) => Math.max(MINW, Math.min(MAXW, n));
  const [w, setW] = useState(() => clamp(960));
  const dragging = useRef(false);
  useEffect(() => {
    const move = (x) => { if (dragging.current) setW(clamp(window.innerWidth - x)); };
    const onMM = (e) => move(e.clientX);
    const onTM = (e) => { if (e.touches[0]) move(e.touches[0].clientX); };
    const onUp = () => { if (dragging.current) { dragging.current = false; document.body.style.userSelect = ""; } };
    window.addEventListener("mousemove", onMM); window.addEventListener("mouseup", onUp);
    window.addEventListener("touchmove", onTM, { passive: true }); window.addEventListener("touchend", onUp);
    return () => { window.removeEventListener("mousemove", onMM); window.removeEventListener("mouseup", onUp); window.removeEventListener("touchmove", onTM); window.removeEventListener("touchend", onUp); };
  }, []); // eslint-disable-line
  const startDrag = (e) => { dragging.current = true; document.body.style.userSelect = "none"; e.preventDefault(); e.stopPropagation(); };
  const presets = [["기본", Math.min(680, MAXW)], ["넓게", Math.min(960, MAXW)], ["아주 넓게", Math.min(1280, MAXW)], ["전체", MAXW]];
  // 현재 폭 기준 열 개수(본문 재배치 단서로 사용)
  const cols = w >= 1180 ? 3 : w >= 840 ? 2 : 1;

  return (
    <div className="mm-drawer-back" onClick={onClose}>
      <div className="mm-drawer" onClick={(e) => e.stopPropagation()} style={{ width: w + "px", maxWidth: "100vw" }}>
        <div className="mm-drawer-resize" onMouseDown={startDrag} onTouchStart={startDrag} title="좌우로 끌어 크기 조절"><span className="mm-drawer-grip" /></div>
        <div className="mm-drawer-head" style={{ background: ac.dot }}>
          <div className="mm-drawer-head-tx">
            <div className="mm-drawer-eyebrow"><branch.icon size={13} /> {crumbLabels.join(" › ")} · {pos + 1}/{TOTAL_NODES}</div>
            <h2 className="mm-drawer-title">{node.label}</h2>
          </div>
          <div className="mm-drawer-tools">
            <div className="mm-drawer-sizes">
              {presets.map(([lab, val]) => (
                <button key={lab} className={"mm-size-btn" + (Math.abs(w - val) < 2 ? " on" : "")} onClick={() => setW(clamp(val))}>{lab}</button>
              ))}
            </div>
            <button className="mm-drawer-x" onClick={onClose} aria-label="닫기"><X size={18} /></button>
          </div>
        </div>
        <div className="mm-drawer-body">
          {srcs.length > 0 && (
            <div className="mm-srcs">
              <span className="mm-srcs-label">출처</span>
              {srcs.map((s) => <span key={s} className="mm-src-badge">{s}</span>)}
            </div>
          )}
          <div className={"mm-blocks cols-" + cols}>
            {node.blocks.map((b, i) => <NodeBlock key={i} b={b} openTerm={openTerm} />)}
          </div>
          {terms.length > 0 && (
            <div className="mm-terms">
              <div className="mm-terms-h"><MessageSquare size={13} /> 더 알아보기 — 눌러서 개념 설명 열기</div>
              <div className="mm-terms-wrap">
                {terms.map((k) => (
                  <button key={k} className="mm-term-chip" onClick={() => openTerm(k)}>💬 {GLOSSARY[k].term}</button>
                ))}
              </div>
            </div>
          )}
          <div className="mm-nav">
            <button className="mm-nav-btn" onClick={() => onNav(-1)} disabled={!prev}>
              <ArrowLeft size={15} /><span className="mm-nav-lab">{prev ? (prev.node.short || prev.node.label) : "처음"}</span>
            </button>
            <span className="mm-nav-mid">{pos + 1} / {TOTAL_NODES}</span>
            <button className="mm-nav-btn mm-nav-next" onClick={() => onNav(1)} disabled={!next}>
              <span className="mm-nav-lab">{next ? (next.node.short || next.node.label) : "끝"}</span><ArrowRight size={15} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function SourcesCard({ openTerm }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="mm-sources">
      <button className="mm-sources-head" onClick={() => setOpen(!open)}>
        <span className="mm-sources-t"><FileText size={15} /> 수업 자료 6종</span>
        <ChevronDown size={16} className={"mm-sources-chev" + (open ? " open" : "")} />
      </button>
      <p className="mm-sources-desc">이 지도는 아래 6개 파일의 내용을 모두 통합했습니다.</p>
      {open && (
        <div className="mm-sources-list">
          {SOURCES.map((s, i) => (
            <div key={i} className="mm-source">
              <div className="mm-source-top">
                <span className="mm-source-file">{s.file}</span>
                <span className="mm-source-kind">{s.kind}</span>
              </div>
              <div className="mm-source-desc">{s.desc}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ============================================================
   IDE KIT — 실습 키트(코딩 워크벤치)
   ============================================================ */
/* ============================================================
   실습 키트 — 3개 트랙(Claude · AI Studio · 직접 빌드)
   공유 단계(개념·프롬프트·Firebase·보안·테스트·점검) + 트랙별 단계(준비물·만들기·배포)
   각 단계 번호는 순서에서 자동 계산(시작0 … 점검9)
   ============================================================ */

/* ── 공유 단계 ───────────────────────────────────────── */
const STEP_MISSION = { id: "mission", name: "02_무엇을_만들까.md", icon: Sparkles, kind: "guide",
  title: "무엇을 만들지 정하기", goal: "작게 시작합니다 — ‘핵심 기능 하나’만 정하세요.",
  intro: [
    { t: "lead", x: "한 번에 완벽한 앱을 노리지 말고, [[mvp|MVP]] — ‘되는 것 하나’부터 만듭니다. 기능을 쪼갤수록 AI 성공률이 올라가요." },
    { t: "h2", x: "교실에서 잘 통하는 도구 ([[crud|CRUD]]형)" },
    { t: "trio", items: [{ k: "anon", label: "익명 고민함" }, { k: "crud", label: "설문·투표" }, { k: "firestore", label: "공유 게시판" }] },
    { t: "p", x: "왼쪽 ‘예시 프롬프트’ 폴더(우체통·퀴즈·롤링페이퍼·타이머)에서 가까운 걸 골라 출발해도 좋습니다." },
    { t: "note", kind: "analogy", x: "분식집을 차리기 전에 ‘떡볶이 하나’만 학교 앞에서 팔아 반응을 보는 것." },
    { t: "note", kind: "tip", x: "‘오늘은 익명 의견 우체통 하나’처럼 목표를 한 문장으로 적어 두세요. 다음 단계에서 이걸 주문서로 바꿉니다." },
  ],
  checkpoint: "만들 도구를 한 문장으로 정했나요? → 다음 단계에서 프롬프트로 만듭니다." };

const STEP_CONTEXT = { id: "context", name: "03_프롬프트.md", lang: "md", icon: MessageSquare, kind: "context",
  title: "정확히 주문하기 (프롬프트)", goal: "‘무엇을·어떤 기술로·어떤 제약으로’를 담은 주문서를 만듭니다.",
  intro: [
    { t: "lead", x: "AI는 [[context-eng|맥락]]을 줄수록 잘 만듭니다. 모호한 “앱 만들어 줘” 대신, 아래 설정으로 ‘5요소 주문서’를 자동 완성하세요." },
    { t: "h2", x: "성공을 부르는 5요소" },
    { t: "steps", items: [
      "기술 스택 — [[static|정적 앱]] / [[firebase|Firebase]] 사용 여부",
      "핵심 기능 — 무엇을, 어떻게 보이게",
      "제약·보안 — [[anon|익명]]·[[testmode|테스트 모드 금지]]",
      "에러 상황 — 생기면 콘솔 메시지를 그대로",
      "참고 문서 — 외부 연동 시 최신 공식 링크",
    ]},
    { t: "note", kind: "analogy", x: "택시 기사에게 “시내요”가 아니라 “시청 정문, 큰길로, 12분 안에”라고 말하는 것." },
  ],
  checkpoint: "‘완성 프롬프트’가 마음에 들면 ‘복사’ → 다음 단계에서 만들기에 붙여넣습니다." };

const STEP_FIREBASE = { id: "firebase", name: "05_Firebase_연결.md", icon: Database, kind: "guide", shots: ["shot-testmode", "shot-anon"],
  title: "데이터 저장 + 익명 로그인", goal: "입력이 사라지지 않게 Firestore를 켜고, 개인정보 없는 익명 로그인을 붙입니다.",
  intro: [
    { t: "lead", x: "화면만으로는 입력이 새로고침에 사라져요. ‘기억’을 담당할 [[firebase|Firebase]]를 연결합니다. 어떤 도구로 만들었든 Firebase 콘솔에서 켭니다." },
    { t: "h2", x: "① 데이터베이스 만들기 (Firestore)" },
    { t: "p", x: "[[firestore|Firestore]]를 만들 때 ‘모드’를 묻습니다. 반드시 **프로덕션 모드**로 시작하세요(아래 그림). [[testmode|테스트 모드]]는 전 세계 공개라 위험합니다." },
    { t: "h2", x: "② 익명 로그인 켜기" },
    { t: "p", x: "Authentication → 로그인 방법 → ‘익명’을 사용 설정하세요(아래 그림). 이름·이메일 없이 ‘같은 사람’만 구분해 [[anon|개인정보 부담을 0]]으로 만듭니다." },
    { t: "note", kind: "tip", x: "엑셀에 빗대면 시트=[[document|컬렉션]], 한 줄=문서, 칸=필드. “응답을 posts 컬렉션에 저장”처럼 구조를 짚어 주면 좋아요." },
  ],
  checkpoint: "Firestore가 ‘프로덕션 모드’로 만들어지고, 익명 로그인이 ‘사용 설정됨’이면 OK." };

const STEP_RULES = { id: "rules", name: "06_보안규칙.rules", lang: "rules", icon: Lock, kind: "rules", shots: ["shot-rules"],
  title: "안전하게 잠그기 (보안 규칙)", goal: "‘누가 읽고 쓸 수 있는지’ 자물쇠를 채웁니다 — 학교 도구의 핵심.",
  intro: [
    { t: "lead", x: "[[rules|보안 규칙]]은 데이터의 자물쇠예요. 익명 고민함이라면 ‘쓰기는 로그인한 사람만, 읽기는 차단’이 정답입니다." },
    { t: "note", kind: "warn", x: "AI는 빠른 개발을 위해 [[testmode|테스트 모드]](전체 공개)로 열어 두는 경우가 흔합니다 — 가장 위험한 실수예요. 아래 토글로 규칙을 만들어 Firestore ‘규칙(Rules)’ 탭에 붙여넣고 ‘게시’하세요." },
    { t: "note", kind: "analogy", x: "우체통 — 누구나 편지를 넣을(쓰기) 수 있지만, 꺼내 읽는(읽기) 건 우체부(교사)만." },
    { t: "code", label: "✅ 안전 — 이렇게 (예시)", code: "rules_version = '2';\nservice cloud.firestore {\n  match /databases/{db}/documents {\n    match /responses/{id} {\n      allow create: if request.auth != null;  // 익명 로그인만 쓰기\n      allow read, update, delete: if false;   // 앱에선 차단\n    }\n  }\n}" },
    { t: "code", danger: true, label: "⚠ 반면교사 — 이렇게 두면 위험!", code: "rules_version = '2';\nservice cloud.firestore {\n  match /databases/{db}/documents {\n    match /{document=**} {\n      allow read, write: if true;   // 활짝 열린 문 — 전 세계 누구나\n    }\n  }\n}" },
  ],
  checkpoint: "규칙을 ‘게시(Publish)’했고, 의도대로 읽기/쓰기가 제한되면 다음으로." };

const STEP_VERIFY = { id: "verify", name: "07_테스트_디버깅.md", icon: Bug, kind: "guide", trouble: true,
  title: "내 폰으로 테스트 & 디버깅", goal: "AI 말은 100% 믿지 말고 직접 확인합니다. 에러는 ‘단서’를 모아 고칩니다.",
  intro: [
    { t: "lead", x: "배포 전 반드시 ‘내 폰·옆 사람 폰’으로 직접 써 보세요. AI의 “안전합니다 / 고쳤습니다”는 [[hallucination|착각]]일 수 있습니다." },
    { t: "h2", x: "에러가 나면 — 디버깅 무한 루프" },
    { t: "flow", dir: "col", items: [
      { label: "① 증상 발견", sub: "화면이 안 뜸 / 버튼이 안 됨" },
      { label: "② F12로 단서 수집", sub: "개발자도구 Console의 붉은 메시지 복사" },
      { label: "③ AI에 그대로 전달", sub: "“이 에러가 나요” + 메시지 붙여넣기" },
      { label: "④ 고치고 다시 테스트", sub: "①로 돌아가 반복" },
    ]},
    { t: "note", kind: "tip", x: "“안 돌아가요” 대신 콘솔의 붉은 메시지를 그대로 붙여넣으세요 — 자동차 ‘경고등 코드’를 정확히 읽어 주는 셈입니다." },
  ],
  checkpoint: "다른 기기에서도 의도대로 작동하면 배포 준비 끝." };

const STEP_CHECK = { id: "check", name: "09_최종점검.md", lang: "md", icon: ListChecks, kind: "check",
  title: "교실 투입 전 최종 점검", goal: "학생에게 열기 전, 안전 5가지를 직접 확인합니다.",
  intro: [{ t: "lead", x: "마지막 관문이에요. 아래 다섯 가지를 직접 확인하고 하나씩 체크하세요. 모두 체크되면 끝입니다." }],
  checkpoint: "모두 체크했다면 — 이제 학생들과 함께 써 보세요! 🎉" };

/* ── 트랙 A. Claude 버전 (권장) ───────────────────────── */
const C_START = { id: "c-start", name: "00_시작하기.md", icon: Play, kind: "guide",
  title: "Claude로 만드는 연수 — 사용법 & 여정", goal: "Claude로 ‘작동하는 학급 도구’를 만들고, Firebase로 배포해 봅니다.",
  intro: [
    { t: "lead", x: "이 트랙은 [[claude-code|Claude]]로 만듭니다. 대화로 코드를 만들어 주고, 결과를 바로 미리볼 수 있어요. (이 연수 동반자 앱도 Claude로 만들었습니다.)" },
    { t: "h2", x: "두 가지 사용법" },
    { t: "cols", cols: [
      { h: "claude.ai (쉬움)", tone: "good", items: ["채팅창에 프롬프트 붙여넣기", "한 파일 앱을 ‘아티팩트(Artifact)’로 즉시 미리보기", "비개발 교사에게 추천"] },
      { h: "Claude Code (심화)", tone: "info", items: ["내 폴더의 여러 파일을 직접 수정", "터미널·에디터에서 실행", "프로젝트가 커질 때"] },
    ]},
    { t: "note", kind: "tip", x: "오른쪽 위 ‘복사’로 프롬프트·코드를 가져가고, 맨 아래 ‘다음 단계’로 진행하세요. 위 단계 막대를 눌러 이동할 수도 있어요." },
    { t: "note", kind: "analogy", x: "요리 교실과 같아요 — 재료 준비 → 손질 → 조리 → 간 보기 → 상차림 순서대로 따라오면 누구나 완성합니다." },
  ],
  checkpoint: "준비됐다면 ‘다음 단계’를 눌러 준비물부터 확인하세요." };

const C_SETUP = { id: "c-setup", name: "01_준비물.md", icon: Wrench, kind: "guide",
  title: "준비물 & 계정", goal: "Claude 계정과 무료 Firebase(구글) 계정이면 시작!",
  intro: [
    { t: "lead", x: "필요한 건 둘뿐이에요 — ① Claude 계정(claude.ai) ② 구글 계정([[firebase|Firebase]] 무료)." },
    { t: "cmp",
      bad: { h: "이런 건 필요 없어요", x: "복잡한 개발 환경 설치, 유료 결제, 코딩 지식 — 대부분 불필요합니다." },
      good: { h: "이것만 있으면 OK", x: "claude.ai 로그인 + 구글 계정 + 크롬 브라우저." } },
    { t: "note", kind: "tip", x: "여러 파일 프로젝트나 ‘내 PC에서 직접 배포’까지 해 보려면 [[claude-code|Claude Code]]와 [[node|Node.js]]·[[cli|Firebase CLI]]를 추가로 설치하세요(선택)." },
  ],
  checkpoint: "claude.ai 로그인이 되고, 구글 계정이 있으면 준비 끝!" };

const C_BUILD = { id: "c-build", name: "04_Claude로_만들기.md", icon: Sparkles, kind: "guide", shots: ["shot-claude"],
  title: "Claude로 첫 화면 만들기", goal: "복사한 프롬프트를 Claude에 붙여넣고, 미리보기를 보며 한 가지씩 고칩니다.",
  intro: [
    { t: "lead", x: "[[claude-code|Claude]] 채팅창에 앞 단계의 프롬프트를 붙여넣고 “만들어 줘”라고 하세요. 한 파일 웹앱이라면 오른쪽에 ‘아티팩트’ 미리보기가 떠 바로 눌러볼 수 있어요." },
    { t: "steps", items: [
      "프롬프트 붙여넣기 → Claude가 코드 생성",
      "아티팩트(미리보기)로 화면 확인",
      "‘제출 버튼을 더 크게, 색은 파랑’처럼 한 번에 하나씩 수정 요청",
      "원하는 화면 이미지가 있으면 첨부(멀티모달)",
    ]},
    { t: "cmp",
      bad: { h: "이렇게 하지 마세요", x: "한꺼번에 “전부 다 고쳐 줘” → 무엇을 바꿨는지 추적이 어려워요." },
      good: { h: "이렇게 하세요", x: "“이 버튼만 크게”처럼 하나씩 → 결과를 보고 다음 요청." } },
    { t: "note", kind: "tip", x: "데이터 저장이 필요하면 Claude에게 “[[firebase|Firebase]] Firestore로 저장, [[anon|익명 인증]], [[rules|보안 규칙]] 포함”을 명시하세요. 완성 코드를 복사해 다음 단계에서 연결·배포합니다." },
  ],
  checkpoint: "미리보기에 내 도구의 첫 화면이 떴나요? → 데이터 저장을 붙일 차례입니다." };

const C_DEPLOY = { id: "c-deploy", name: "08_배포.sh", lang: "bash", icon: Rocket, kind: "static", body: KIT_DEPLOY, shots: ["shot-vercel"],
  title: "배포해서 링크 받기", goal: "Claude가 만든 코드를 인터넷에 올려 ‘누구나 접속하는 주소’를 만듭니다.",
  intro: [
    { t: "lead", x: "Claude가 만든 코드를 받아 인터넷에 올리면 학생이 폰으로 들어올 수 있어요. 가장 쉬운 길 두 가지를 권합니다." },
    { t: "cols", cols: [
      { h: "Vercel·Netlify (드래그&드롭)", tone: "good", items: ["빌드한 폴더를 끌어다 놓으면 끝", "[[vercel|Vercel]]·Netlify·[[cloudflare|Cloudflare]] 무료", "GitHub 연결 시 자동 배포"] },
      { h: "Firebase Hosting (아래 명령)", tone: "info", items: ["[[cli|Firebase CLI]]로 배포", "[[static|정적 앱]]은 무료 [[classic-hosting|클래식 Hosting]]", ".web.app 주소 제공"] },
    ]},
    { t: "linkout", links: [
      { label: "Netlify Drop 열기", url: "https://app.netlify.com/drop", primary: true },
      { label: "Vercel 새 프로젝트", url: "https://vercel.com/new" },
      { label: "Firebase Hosting 문서", url: "https://firebase.google.com/docs/hosting" },
    ]},
    { t: "note", kind: "tip", x: "가장 쉬운 길 — 빌드 폴더(dist 또는 build)를 Netlify Drop에 끌어다 놓으면 몇 초 만에 공개 주소가 생겨요. 새로고침 시 404가 나면 폴더에 _redirects 파일(내용: /* /index.html 200)을 함께 넣으세요." },
    { t: "note", kind: "warn", x: "공유할 땐 [[localhost|localhost]] 주소가 아니라 ‘배포 후 받은 공개 URL’을 보내세요." },
  ],
  checkpoint: "공개 URL(.web.app / .vercel.app 등)이 나오고, 폰에서 열리면 성공!" };

/* ── 트랙 B. Google AI Studio 버전 ───────────────────── */
const A_START = { id: "a-start", name: "00_시작하기.md", icon: Play, kind: "guide",
  title: "AI Studio로 만드는 연수 — 사용법 & 여정", goal: "브라우저에서 [[aistudio|Google AI Studio]]로 만들고 바로 배포해 봅니다(무설치).",
  intro: [
    { t: "lead", x: "이 트랙은 설치가 거의 없어요. [[aistudio|Google AI Studio]] 한 곳에서 만들기→Firebase 연결→배포까지 이어집니다. 비개발 교사 워크숍에 가장 진입장벽이 낮습니다." },
    { t: "note", kind: "tip", x: "오른쪽 위 ‘복사’로 프롬프트를 가져가고, 맨 아래 ‘다음 단계’로 진행하세요." },
    { t: "note", kind: "analogy", x: "재료 손질부터 상차림까지 한 자리에서 끝내는 ‘올인원 조리대’." },
  ],
  checkpoint: "준비됐다면 ‘다음 단계’를 눌러 시작하세요." };

const A_SETUP = { id: "a-setup", name: "01_준비물.md", icon: Wrench, kind: "guide",
  title: "준비물 & 계정", goal: "필요한 건 구글 계정 하나. 설치는 없습니다.",
  intro: [
    { t: "lead", x: "구글 계정으로 [[aistudio|AI Studio]]에 로그인만 하면 됩니다. 신규 사용자는 카드 없이 앱 2개까지 배포할 수 있어요." },
    { t: "cmp",
      bad: { h: "이런 건 필요 없어요", x: "설치·유료 결제·코딩 지식 — 불필요합니다." },
      good: { h: "이것만 있으면 OK", x: "구글 계정 + 크롬 브라우저." } },
  ],
  checkpoint: "구글 계정으로 AI Studio에 로그인되면 준비 끝!" };

const A_BUILD = { id: "a-build", name: "04_AIStudio로_만들기.md", icon: Sparkles, kind: "guide", shots: ["shot-aistudio"],
  title: "AI Studio로 첫 화면 만들기", goal: "복사한 프롬프트를 AI Studio에 붙여넣고, 미리보기를 보며 한 가지씩 고칩니다.",
  intro: [
    { t: "lead", x: "[[aistudio|AI Studio]]에 프롬프트를 붙여넣고 만들어 달라고 하세요. 한 번에 완성이 안 돼도 정상 — 대화로 다듬어 갑니다." },
    { t: "steps", items: ["프롬프트 붙여넣기 → 생성", "미리보기로 화면 확인", "‘이 버튼을 크게’처럼 한 번에 하나씩 수정", "데이터가 필요하면 ‘Enable Firebase’(아래 그림)"] },
    { t: "note", kind: "tip", x: "백 마디 설명보다 참고 이미지 한 장이 강력합니다. 원하는 화면을 캡처해 함께 주세요." },
  ],
  checkpoint: "미리보기에 첫 화면이 떴나요? → 데이터 저장을 붙일 차례입니다." };

const A_DEPLOY = { id: "a-deploy", name: "08_배포.md", icon: Rocket, kind: "guide", shots: ["shot-aistudio"],
  title: "배포해서 링크 받기", goal: "AI Studio의 ‘Deploy’ 버튼이면 공개 주소가 만들어집니다.",
  intro: [
    { t: "lead", x: "[[aistudio|AI Studio]]로 만들었다면 오른쪽 위 ‘Deploy’ 버튼 한 번으로 [[deploy|배포]]됩니다(아래 그림). 학생에게는 그렇게 받은 공개 주소를 공유하세요." },
    { t: "linkout", links: [
      { label: "Netlify Drop (대안 배포)", url: "https://app.netlify.com/drop", primary: true },
      { label: "Vercel 새 프로젝트", url: "https://vercel.com/new" },
    ]},
    { t: "note", kind: "tip", x: "AI Studio 외에 직접 올리고 싶다면, 내보낸 폴더(index.html 포함)를 Netlify Drop에 끌어다 놓아도 됩니다 — 카드·명령어 없이 몇 초." },
    { t: "note", kind: "warn", x: "공유할 땐 미리보기/[[localhost|localhost]] 주소가 아니라 ‘배포 후 받은 공개 URL’인지 확인하세요." },
    { t: "note", kind: "tip", x: "무료 한도를 넘기지 않도록 [[static|정적 앱]]으로 만들었는지 확인하세요. 카드 요구가 뜨면 ‘정적 앱’으로 다시 요청." },
  ],
  checkpoint: "‘Deploy’ 후 받은 공개 URL이 폰에서 열리면 성공!" };

/* ── 트랙 C. 직접 빌드 (범용 · CLI) ──────────────────── */
const L_START = { id: "l-start", name: "00_시작하기.md", icon: Play, kind: "guide",
  title: "직접 빌드(범용) — 사용법 & 여정", goal: "어떤 AI 도구로든 만들고, Firebase CLI로 직접 배포하는 자유도 높은 경로.",
  intro: [
    { t: "lead", x: "이 트랙은 도구에 얽매이지 않아요. [[cursor|Cursor]]·VS Code·[[claude-code|Claude]]·[[aistudio|AI Studio]] 무엇으로 만들든, 결과 코드를 받아 [[cli|Firebase CLI]]로 직접 올립니다." },
    { t: "note", kind: "tip", x: "자유도가 높은 대신 [[node|Node.js]]·[[cli|Firebase CLI]] 설치가 필요합니다(다음 단계). 워크숍 환경에 맞게 골라 쓰세요." },
    { t: "note", kind: "analogy", x: "재료를 어디서 사 오든, ‘내 주방’에서 직접 요리해 내는 방식." },
  ],
  checkpoint: "준비됐다면 ‘다음 단계’에서 설치부터 확인하세요." };

const L_SETUP = { id: "l-setup", name: "01_준비물.sh", lang: "bash", icon: Wrench, kind: "static", body: KIT_PREREQ,
  title: "준비물 & 설치 (직접 배포용)", goal: "직접 배포하려면 Node.js와 Firebase CLI를 설치합니다.",
  intro: [
    { t: "lead", x: "직접 빌드 트랙은 내 컴퓨터에서 배포하므로 [[node|Node.js]]와 [[cli|Firebase CLI]]가 필요해요. 아래 명령을 순서대로 실행하세요." },
    { t: "note", kind: "tip", x: "구글 계정 로그인(firebase login)이 마지막입니다. 설치가 부담되면 ‘AI Studio 버전’ 트랙을 쓰는 게 더 쉬워요." },
  ],
  checkpoint: "firebase --version이 버전을 출력하고, firebase login이 되면 준비 끝!" };

const L_BUILD = { id: "l-build", name: "04_도구로_만들기.md", icon: Sparkles, kind: "guide",
  title: "원하는 도구로 만들기", goal: "어떤 AI 도구로든 코드를 만들고, 내 PC에서 실행해 확인합니다.",
  intro: [
    { t: "lead", x: "앞 단계의 프롬프트를 원하는 도구([[cursor|Cursor]]·[[claude-code|Claude]]·[[v0|v0]]·[[lovable|Lovable]] 등)에 붙여넣어 만드세요." },
    { t: "steps", items: ["도구에 프롬프트 붙여넣기 → 코드 생성", "생성된 코드를 내 폴더에 저장", "[[localhost|로컬]]에서 실행해 화면 확인", "한 번에 하나씩 수정 요청"] },
    { t: "note", kind: "tip", x: "데이터 저장이 필요하면 “[[firebase|Firebase]] Firestore, [[anon|익명 인증]], [[rules|보안 규칙]] 포함, [[static|정적 앱]]”을 프롬프트에 꼭 명시하세요." },
  ],
  checkpoint: "로컬에서 첫 화면이 뜨면 → 데이터 저장을 붙일 차례입니다." };

const L_DEPLOY = { id: "l-deploy", name: "08_배포.sh", lang: "bash", icon: Rocket, kind: "static", body: KIT_DEPLOY,
  title: "Firebase CLI로 직접 배포", goal: "빌드한 정적 파일을 Firebase Hosting에 직접 올립니다.",
  intro: [
    { t: "lead", x: "빌드 결과 폴더(보통 dist/ 또는 build/)에서 아래 명령을 순서대로 실행하세요. [[static|정적 앱]]은 무료 [[classic-hosting|클래식 Hosting]]으로 카드 없이 [[deploy|배포]]됩니다." },
    { t: "linkout", links: [
      { label: "Netlify Drop (드래그 배포)", url: "https://app.netlify.com/drop", primary: true },
      { label: "Vercel 새 프로젝트", url: "https://vercel.com/new" },
      { label: "Firebase Hosting 문서", url: "https://firebase.google.com/docs/hosting" },
    ]},
    { t: "note", kind: "tip", x: "CLI가 부담되면 Netlify Drop이 가장 쉬워요 — 빌드 폴더를 끌어다 놓기만 하면 끝. 새로고침 404 방지용 _redirects 파일(내용: /* /index.html 200)도 폴더에 함께 넣으세요." },
    { t: "note", kind: "warn", x: "init에서 public 폴더를 dist 또는 build로 맞추세요. ‘App Hosting’ 카드 요구가 뜨면 정적 앱인지 재확인." },
    { t: "note", kind: "tip", x: "공유할 땐 [[localhost|localhost]]가 아니라 ‘.web.app’ 공개 URL을 보내세요." },
  ],
  checkpoint: "‘Deploy complete!’와 https://….web.app 주소가 나오면 성공!" };

/* ── 키트 묶음 ───────────────────────────────────────── */
const KITS = [
  { key: "claude", label: "Claude 버전", short: "Claude", icon: Sparkles,
    tagline: "Claude(claude.ai · Claude Code)로 만들고 Firebase로 배포 — 권장 경로",
    steps: [C_START, C_SETUP, STEP_MISSION, STEP_CONTEXT, C_BUILD, STEP_FIREBASE, STEP_RULES, STEP_VERIFY, C_DEPLOY, STEP_CHECK] },
  { key: "aistudio", label: "AI Studio 버전", short: "AI Studio", icon: Boxes,
    tagline: "브라우저에서 Google AI Studio로 만들고 바로 배포 — 무설치, 가장 쉬움",
    steps: [A_START, A_SETUP, STEP_MISSION, STEP_CONTEXT, A_BUILD, STEP_FIREBASE, STEP_RULES, STEP_VERIFY, A_DEPLOY, STEP_CHECK] },
  { key: "cli", label: "직접 빌드(범용)", short: "직접 빌드", icon: Terminal,
    tagline: "어떤 AI 도구로든 만들고 Firebase CLI로 직접 배포 — 자유도 높음",
    steps: [L_START, L_SETUP, STEP_MISSION, STEP_CONTEXT, L_BUILD, STEP_FIREBASE, STEP_RULES, STEP_VERIFY, L_DEPLOY, STEP_CHECK] },
];

/* 참고 자료(모든 트랙 공통) — 화면 캡처는 각 단계 안에 직접 배치됨 */
const KIT_REF = [
  { id: "ex-mailbox", name: "mailbox.prompt.md", lang: "md", icon: Inbox, kind: "static", folder: "examples", body: EX_MAILBOX, note: "예시 — 익명 의견 우체통." },
  { id: "ex-quiz", name: "quiz.prompt.md", lang: "md", icon: HelpCircle, kind: "static", folder: "examples", body: EX_QUIZ, note: "예시 — 실시간 퀴즈·투표 앱." },
  { id: "ex-rolling", name: "rolling-paper.prompt.md", lang: "md", icon: MessageSquare, kind: "static", folder: "examples", body: EX_ROLLING, note: "예시 — 익명 칭찬 롤링페이퍼." },
  { id: "ex-timer", name: "timer.prompt.md", lang: "md", icon: RefreshCw, kind: "static", folder: "examples", body: EX_TIMER, note: "예시 — 수업 타이머(저장 없는 화면 도구)." },
  { id: "ex-debug", name: "디버깅_육하원칙.md", lang: "md", icon: Bug, kind: "static", folder: "examples", body: EX_DEBUG, note: "예시 — 에러가 났을 때 빈칸을 채워 그대로 붙여넣는 디버깅 템플릿." },
  { id: "ex-feature", name: "기능추가.md", lang: "md", icon: Sparkles, kind: "static", folder: "examples", body: EX_FEATURE, note: "예시 — 기존 코드를 깨지 않고 기능만 더하는 프롬프트." },
  { id: "ex-rulesgen", name: "보안규칙_생성.md", lang: "md", icon: Lock, kind: "static", folder: "examples", body: EX_RULESGEN, note: "예시 — AI에게 보안 규칙을 만들게 해 콘솔에 붙여넣기." },
];
const ALL_KIT_FILES = [...KITS.flatMap((k) => k.steps), ...KIT_REF];

/* 입력값(o)을 받아 '컨텍스트 5요소'에 맞춘 실제로 정확한 프롬프트를 조립합니다.
   o = { idea, data, anon, read('none'|'owner'|'all'), realtime, image, level } */
function buildContextPrompt(o) {
  const name = (o.idea || "").trim() || "학급용 도구";
  const L = [];
  L.push("# 만들고 싶은 것");
  L.push(name + " 을(를) 만들고 싶어요. 코딩을 잘 모르니, 작동하는 완성본을 목표로 차근차근 만들어 줘.");
  L.push("");
  L.push("# 1. 기술 스택");
  if (o.data) {
    L.push("- 프론트엔드: HTML·CSS·JavaScript (또는 React)로, 서버가 필요 없는 '정적 웹앱'으로 만들어 줘.");
    L.push("- 데이터 저장: Google Firebase의 Firestore를 사용해.");
    if (o.image) L.push("- 사진 저장: Firebase Storage를 사용하고, 파일 크기·형식(jpg·png) 제한을 둬.");
    L.push("- 배포: 무료 '클래식 Hosting' 기준으로 안내해 줘. (서버형 App Hosting은 쓰지 마)");
  } else {
    L.push("- 데이터를 저장할 필요가 없어. 서버 없는 '정적 화면 앱'으로만 만들어 줘. (Firebase는 쓰지 마)");
  }
  L.push("");
  L.push("# 2. 핵심 기능");
  L.push("- 위에서 설명한 목적에 맞게 화면과 동작을 직관적으로 구성해 줘.");
  if (o.data) {
    if (o.anon) L.push("- 로그인: '익명 인증(Anonymous Auth)'으로 처리하고, 이름·이메일 등 개인정보는 절대 받지 마.");
    else L.push("- 사용자 구분이 필요하면 개인정보 없는 '익명 인증'을 우선 고려해 줘.");
    L.push("- 저장 항목: 꼭 필요한 데이터와 '제출 시각'만 Firestore에 저장해. (불필요한 개인정보 저장 금지)");
    if (o.realtime) L.push("- 실시간 반영: 누군가 입력하면 새로고침 없이 즉시 모든 화면에 반영(onSnapshot).");
    if (o.read === "none") L.push("- 결과 열람: 참여자는 다른 사람의 데이터를 화면에서 볼 수 없게 해 줘. (운영자는 콘솔에서 확인)");
    else if (o.read === "owner") L.push("- 결과 열람: 참여자는 '자신이 입력한 것'만 볼 수 있게 해 줘.");
    else L.push("- 결과 열람: 모든 참여자가 결과를 함께 볼 수 있게 해 줘.");
  }
  L.push("");
  L.push("# 3. 제약 조건 & 보안");
  if (o.data) {
    L.push("- 보안 규칙(Security Rules)을 반드시 코드로 함께 작성해 줘. '테스트 모드(전체 공개)'는 절대 쓰지 마.");
    if (o.anon) L.push("- 쓰기(생성)는 '익명 로그인한 사용자'만 가능하도록 규칙을 설정해 줘.");
    if (o.read === "none") L.push("- 읽기는 앱에서 차단(allow read: if false)하고, 수정·삭제도 막아 줘.");
    else if (o.read === "owner") L.push("- 읽기는 '본인 문서(uid 일치)'만 허용하고, 수정·삭제는 막아 줘.");
    else L.push("- 읽기는 허용하되, 남의 글 수정·삭제는 막아 줘.");
  } else {
    L.push("- 외부로 데이터를 보내지 않는 안전한 화면 도구로 만들어 줘.");
  }
  if (o.level !== "basic") {
    L.push("- 모바일에서도 보기 좋은 반응형 UI로, 버튼은 크고 글자 대비는 또렷하게.");
    L.push("- 오류가 나면 사람이 읽기 쉬운 한국어 안내 문구를 보여 줘.");
  }
  if (o.level === "advanced") {
    if (o.data) L.push("- 한 사람이 짧은 시간에 중복 제출하지 못하도록 막아 줘(익명 식별표 기준).");
    L.push("- 빈 화면·로딩 상태도 처리하고, 키보드만으로도 쓸 수 있게 접근성을 신경 써 줘.");
  }
  L.push("");
  L.push("# 4. 참고 자료");
  if (o.data) L.push("- 최신 공식 문서를 참고해서 작성해 줘: https://firebase.google.com/docs/firestore");
  L.push("- 원하는 화면 분위기가 있으면 참고 이미지를 함께 첨부할게. (그 느낌으로 맞춰 줘)");
  L.push("");
  L.push("# 5. 진행 방식");
  L.push("- 한 번에 완성하지 말고, ① 화면 → ② 저장/인증 → ③ 보안 규칙 순서로 만들고 각 단계마다 무엇을 했는지 한국어로 짧게 설명해 줘.");
  return L.join("\n");
}
/* 빠른 예시: 누르면 아이디어 + 옵션을 한 번에 채움 */
const CTX_PRESET = {
  mailbox: { idea: "익명 의견 우체통 (학급 회의 전 고민·의견 수합)", data: true, anon: true, read: "none", realtime: false, image: false },
  quiz: { idea: "실시간 퀴즈·투표 앱 (보기를 고르면 집계 그래프 표시)", data: true, anon: true, read: "none", realtime: true, image: false },
  rolling: { idea: "익명 칭찬 롤링페이퍼 (서로에게 칭찬 한마디 남기기)", data: true, anon: true, read: "all", realtime: true, image: false },
  timer: { idea: "수업용 타이머·스톱워치 (큰 숫자, 시작·정지·리셋, 종료 알림음)", data: false, anon: false, read: "none", realtime: false, image: false },
};

function buildRules(write, read, dup, size) {
  const L = [];
  L.push("rules_version = '2';");
  L.push("service cloud.firestore {");
  L.push("  match /databases/{db}/documents {");
  L.push("    match /posts/{id} {");
  if (write === "auth") {
    L.push("      // 쓰기: 익명 로그인한 사람만 생성 가능");
    let cond = "request.auth != null";
    if (size) cond += " && request.resource.data.text.size() < 500";
    L.push("      allow create: if " + cond + ";");
  } else {
    L.push("      // 쓰기: 누구나 생성 가능 (권장하지 않음)");
    L.push("      allow create: if true;");
  }
  if (read === "block") {
    L.push("      // 읽기/수정/삭제: 앱에서 차단 (교사는 콘솔에서 열람)");
    L.push("      allow read, update, delete: if false;");
  } else if (read === "owner") {
    L.push("      // 읽기: 본인이 쓴 글만 / 수정·삭제는 차단");
    L.push("      allow read: if request.auth != null && resource.data.uid == request.auth.uid;");
    L.push("      allow update, delete: if false;");
  } else {
    L.push("      // 읽기: 전체 공개 / 수정·삭제는 차단");
    L.push("      allow read: if true;");
    L.push("      allow update, delete: if false;");
  }
  L.push("    }");
  L.push("  }");
  L.push("}");
  const notes = [];
  if (dup) notes.push("중복 제출 방지: 익명 uid를 문서 id로 쓰거나, 제출 시 기존 문서 존재를 확인하세요(앱 코드에서 처리).");
  if (write === "any") notes.push("'누구나 쓰기'는 스팸·악용에 취약합니다. 가능하면 '익명 로그인만'을 쓰세요.");
  if (read === "public") notes.push("읽기 전체 공개는 익명 우체통에는 부적합합니다(서로의 글이 보임).");
  return { code: L.join("\n"), notes };
}

function terminalFor(id) {
  if (id === "c-deploy" || id === "l-deploy") return ["$ firebase deploy --only hosting", "i  deploying hosting...", "+  hosting: 12 files uploaded", "OK Deploy complete!", "", "Hosting URL: https://my-class-mailbox.web.app"];
  if (id === "rules") return ["$ firebase deploy --only firestore:rules", "i  cloud.firestore: checking rules...", "OK rules file compiled successfully", "OK 규칙이 게시되었습니다."];
  if (id === "l-setup") return ["$ node -v", "v20.11.1", "$ firebase --version", "13.20.2", "OK 준비 완료 (직접 배포용)"];
  return null;
}

function hl(code, lang) {
  return code.split("\n").map((line, li) => {
    let inner;
    if (lang === "md") {
      const t = line.replace(/^\s+/, "");
      let cls = "";
      if (t.startsWith("#")) cls = "tk-h";
      else if (t.startsWith("-") || /^\d+\./.test(t)) cls = "tk-li";
      inner = <span className={"ide-code " + cls}>{line || " "}</span>;
    } else {
      const cIdx = lang === "rules" ? line.indexOf("//") : line.indexOf("#");
      let codePart = line, comment = "";
      if (cIdx >= 0) { codePart = line.slice(0, cIdx); comment = line.slice(cIdx); }
      const parts = [];
      const kw = lang === "rules"
        ? /(\b(?:rules_version|service|match|allow|if|return|request|resource|auth|read|write|create|update|delete|list|get|true|false|null|data|size)\b|'[^']*')/g
        : /(\b(?:node|npm|npx|firebase|git|cd|sudo|install|deploy|init|login|hosting)\b|--[a-zA-Z-]+|'[^']*'|"[^"]*")/g;
      let last = 0, m, k = 0;
      while ((m = kw.exec(codePart))) {
        if (m.index > last) parts.push(codePart.slice(last, m.index));
        const tok = m[0];
        const c = (tok[0] === "'" || tok[0] === '"') ? "tk-str" : tok.startsWith("--") ? "tk-flag" : "tk-kw";
        parts.push(<span key={k++} className={c}>{tok}</span>);
        last = kw.lastIndex;
      }
      if (last < codePart.length) parts.push(codePart.slice(last));
      inner = <span className="ide-code">{parts}{comment && <span className="tk-cm">{comment}</span>}</span>;
    }
    return (
      <div key={li} className="ide-line">
        <span className="ide-ln">{li + 1}</span>
        {inner}
      </div>
    );
  });
}

function ChipGroup({ label, value, onChange, options }) {
  return (
    <div className="ide-cg">
      <span className="ide-cg-label">{label}</span>
      <div className="ide-cg-opts">
        {options.map((o) => (
          <button key={o.v} onClick={() => onChange(o.v)} className={"ide-chip" + (value === o.v ? " on" : "")}>{o.t}</button>
        ))}
      </div>
    </div>
  );
}
function Toggle({ label, on, onClick }) {
  return (
    <button onClick={onClick} className={"ide-toggle" + (on ? " on" : "")}>
      <span className="ide-toggle-sw"><span className="ide-toggle-knob" /></span>
      <span className="ide-toggle-tx">{label}</span>
    </button>
  );
}

/* ============================================================
   ShotMock — 설정 위치를 보여주는 '화면 캡처' 목업(SVG)
   실제 화면을 본떠 위치·버튼을 화살표로 안내합니다. (저작권 안전)
   ============================================================ */
function ShotMock({ id }) {
  const [zoom, setZoom] = useState(false);
  const cap = {
    "shot-anon": ["Firebase 콘솔 → 왼쪽 메뉴 ‘Authentication’ 클릭", "상단 ‘Sign-in method(로그인 방법)’ 탭 선택", "목록에서 ‘익명(Anonymous)’ → 사용 설정(스위치 ON) → 저장"],
    "shot-rules": ["Firebase 콘솔 → ‘Firestore Database’ 진입", "상단 ‘규칙(Rules)’ 탭 클릭", "규칙 코드를 붙여넣고 오른쪽 위 ‘게시(Publish)’ 클릭"],
    "shot-testmode": ["‘데이터베이스 만들기’를 누르면 모드를 물어봐요", "‘테스트 모드’는 전 세계 공개 = 위험 (선택 금지)", "‘프로덕션 모드’로 시작하고 규칙으로 열어 주세요"],
    "shot-claude": ["claude.ai 채팅창에 5요소 프롬프트를 붙여넣고 전송(↑)", "코드가 만들어지면 오른쪽 ‘미리보기(Artifact)’로 바로 확인", "‘이 버튼만 크게’처럼 한 번에 하나씩 고쳐 달라고 요청"],
    "shot-vercel": ["빌드 결과 폴더(dist 또는 build)를 준비", "Vercel·Netlify 화면의 점선 영역에 폴더를 끌어다 놓기", "잠시 뒤 공개 주소(https://….vercel.app)가 생성돼요"],
    "shot-aistudio": ["AI Studio에서 데이터 저장이 필요하면 ‘Firebase 연결’ 제안이 떠요", "‘Enable Firebase’로 연결 → 자동으로 설정", "오른쪽 위 ‘Deploy(배포)’로 공개 URL 생성"],
  }[id] || [];

  const AMBER = "#f59e0b", BLUE = "#1a73e8", INK = "#202124", SUB = "#5f6368", LINE = "#e2e8f0";
  let svg = null;

  if (id === "shot-anon") {
    svg = (
      <svg viewBox="0 0 760 430" xmlns="http://www.w3.org/2000/svg" className="shot-svg">
        <rect x="0" y="0" width="760" height="430" rx="10" fill="#fff" stroke={LINE} />
        <rect x="0" y="0" width="760" height="40" rx="10" fill="#fff" stroke={LINE} />
        <text x="20" y="25" fontSize="14" fontWeight="700" fill={INK}>🔥 Firebase · my-class</text>
        {/* left nav */}
        <rect x="0" y="40" width="190" height="390" fill="#f8fafc" />
        {["빌드", "Authentication", "Firestore Database", "Hosting", "Storage"].map((t, i) => (
          <g key={i}>
            {t === "Authentication" && <rect x="8" y={58 + i * 34} width="174" height="28" rx="6" fill="#e8f0fe" />}
            <text x="20" y={76 + i * 34} fontSize="12.5" fontWeight={t === "Authentication" ? 700 : 500} fill={t === "Authentication" ? BLUE : SUB}>{t}</text>
          </g>
        ))}
        {/* main */}
        <text x="215" y="72" fontSize="15" fontWeight="800" fill={INK}>로그인 방법 (Sign-in method)</text>
        {[["이메일/비밀번호", "사용 안 함"], ["Google", "사용 안 함"], ["익명 (Anonymous)", "사용 설정됨"]].map(([n, st], i) => {
          const on = i === 2;
          return (
            <g key={i}>
              <rect x="215" y={92 + i * 46} width="520" height="38" rx="8" fill={on ? "#fffbeb" : "#fff"} stroke={on ? AMBER : LINE} strokeWidth={on ? 2 : 1} />
              <text x="232" y={115 + i * 46} fontSize="13" fontWeight={on ? 700 : 500} fill={INK}>{n}</text>
              <rect x="640" y={102 + i * 46} width="40" height="20" rx="10" fill={on ? "#34a853" : "#cbd5e1"} />
              <circle cx={on ? 670 : 650} cy={112 + i * 46} r="8" fill="#fff" />
              <text x="695" y={116 + i * 46} fontSize="10" fill={on ? "#34a853" : SUB} fontWeight="600">{on ? "ON" : "OFF"}</text>
            </g>
          );
        })}
        {/* arrow + note */}
        <path d="M735 285 q40 -10 36 -60" fill="none" stroke={AMBER} strokeWidth="2.5" markerEnd="url(#ar)" />
        <defs><marker id="ar" markerWidth="9" markerHeight="9" refX="6" refY="4.5" orient="auto"><path d="M0 0 L9 4.5 L0 9 z" fill={AMBER} /></marker></defs>
        <rect x="556" y="335" width="196" height="46" rx="9" fill={AMBER} />
        <text x="654" y="356" fontSize="12" fontWeight="800" fill="#fff" textAnchor="middle">여기 ‘익명’ 스위치를</text>
        <text x="654" y="372" fontSize="12" fontWeight="800" fill="#fff" textAnchor="middle">켜 주세요!</text>
      </svg>
    );
  } else if (id === "shot-rules") {
    svg = (
      <svg viewBox="0 0 760 430" xmlns="http://www.w3.org/2000/svg" className="shot-svg">
        <rect x="0" y="0" width="760" height="430" rx="10" fill="#fff" stroke={LINE} />
        <rect x="0" y="0" width="760" height="40" fill="#fff" stroke={LINE} />
        <text x="20" y="25" fontSize="14" fontWeight="700" fill={INK}>🔥 Firestore Database</text>
        {/* tabs */}
        {["데이터", "규칙", "색인", "사용량"].map((t, i) => {
          const on = t === "규칙";
          return <g key={i}><text x={30 + i * 86} y="68" fontSize="13.5" fontWeight={on ? 800 : 500} fill={on ? BLUE : SUB}>{t}</text>{on && <rect x={26 + i * 86} y="78" width="44" height="3" rx="2" fill={BLUE} />}</g>;
        })}
        {/* publish btn */}
        <rect x="612" y="52" width="120" height="34" rx="8" fill={AMBER} />
        <text x="672" y="74" fontSize="13" fontWeight="800" fill="#fff" textAnchor="middle">게시</text>
        {/* code box */}
        <rect x="26" y="104" width="708" height="250" rx="10" fill="#0f172a" />
        {["rules_version = '2';", "service cloud.firestore {", "  match /databases/{db}/documents {", "    match /posts/{id} {", "      allow create: if request.auth != null;", "      allow read: if false;   // 읽기 차단", "    }", "  }", "}"].map((ln, i) => (
          <text key={i} x="44" y={130 + i * 24} fontSize="12" fontFamily="monospace" fill={i === 4 ? "#86efac" : i === 5 ? "#fcd34d" : "#cbd5e1"}>{ln}</text>
        ))}
        {/* arrow to publish */}
        <path d="M620 100 q-20 -16 30 -22" fill="none" stroke={AMBER} strokeWidth="2.5" markerEnd="url(#ar2)" />
        <defs><marker id="ar2" markerWidth="9" markerHeight="9" refX="6" refY="4.5" orient="auto"><path d="M0 0 L9 4.5 L0 9 z" fill={AMBER} /></marker></defs>
        <rect x="430" y="368" width="304" height="40" rx="9" fill="#fffbeb" stroke={AMBER} strokeWidth="2" />
        <text x="582" y="393" fontSize="12" fontWeight="700" fill="#b45309" textAnchor="middle">붙여넣은 뒤 ‘게시’를 꼭 눌러야 적용돼요</text>
      </svg>
    );
  } else if (id === "shot-testmode") {
    svg = (
      <svg viewBox="0 0 760 430" xmlns="http://www.w3.org/2000/svg" className="shot-svg">
        <rect x="0" y="0" width="760" height="430" rx="10" fill="#f1f5f9" stroke={LINE} />
        <rect x="130" y="40" width="500" height="350" rx="14" fill="#fff" stroke={LINE} />
        <text x="380" y="80" fontSize="16" fontWeight="800" fill={INK} textAnchor="middle">Cloud Firestore 데이터베이스 만들기</text>
        <text x="380" y="104" fontSize="12" fill={SUB} textAnchor="middle">보안 규칙 시작 모드를 선택하세요</text>
        <rect x="170" y="128" width="420" height="86" rx="12" fill="#ecfdf5" stroke="#10b981" strokeWidth="2.5" />
        <circle cx="196" cy="150" r="9" fill="#fff" stroke="#10b981" strokeWidth="3" /><circle cx="196" cy="150" r="4" fill="#10b981" />
        <text x="216" y="155" fontSize="13.5" fontWeight="800" fill="#065f46">프로덕션 모드 (권장) ✓</text>
        <text x="216" y="178" fontSize="11.5" fill="#047857">기본은 잠겨 있음 → 보안 규칙으로 필요한 것만 열기</text>
        <text x="216" y="196" fontSize="11.5" fill="#047857">학생 데이터를 다루는 우리 도구는 이걸 고르세요</text>
        <rect x="170" y="226" width="420" height="86" rx="12" fill="#fff1f2" stroke="#e11d48" strokeWidth="2" strokeDasharray="6 4" />
        <circle cx="196" cy="248" r="9" fill="#fff" stroke="#e11d48" strokeWidth="2.5" />
        <text x="216" y="253" fontSize="13.5" fontWeight="800" fill="#9f1239">테스트 모드 ⚠ 위험</text>
        <text x="216" y="276" fontSize="11.5" fill="#be123c">30일간 전 세계 누구나 읽기/쓰기 가능 (문이 활짝)</text>
        <text x="216" y="294" fontSize="11.5" fill="#be123c">AI가 자주 이걸 골라요 → 반드시 피하세요</text>
        <rect x="470" y="336" width="120" height="38" rx="9" fill={BLUE} />
        <text x="530" y="360" fontSize="13" fontWeight="800" fill="#fff" textAnchor="middle">사용 설정</text>
      </svg>
    );
  } else if (id === "shot-claude") {
    svg = (
      <svg viewBox="0 0 760 430" xmlns="http://www.w3.org/2000/svg" className="shot-svg">
        <rect x="0" y="0" width="760" height="430" rx="10" fill="#fff" stroke={LINE} />
        <rect x="0" y="0" width="760" height="40" fill="#fff" stroke={LINE} />
        <text x="20" y="25" fontSize="14" fontWeight="700" fill={INK}>✶ Claude</text>
        {/* left: chat */}
        <rect x="0" y="40" width="468" height="390" fill="#fff" />
        <rect x="20" y="58" width="300" height="46" rx="10" fill="#f1f5f9" />
        <text x="34" y="80" fontSize="11.5" fill={SUB}>만들었어요 — 오른쪽 미리보기를</text>
        <text x="34" y="96" fontSize="11.5" fill={SUB}>눌러 확인해 보세요.</text>
        <rect x="20" y="360" width="430" height="52" rx="12" fill="#fff" stroke={AMBER} strokeWidth="2" />
        <text x="36" y="390" fontSize="12.5" fill={SUB}>5요소 프롬프트를 여기에 붙여넣기…</text>
        <rect x="406" y="372" width="30" height="28" rx="8" fill={AMBER} />
        <text x="421" y="391" fontSize="15" fontWeight="800" fill="#fff" textAnchor="middle">↑</text>
        {/* divider */}
        <line x1="468" y1="40" x2="468" y2="430" stroke={LINE} />
        {/* right: artifact preview */}
        <rect x="468" y="40" width="292" height="390" fill="#eef2ff" />
        <text x="486" y="66" fontSize="12.5" fontWeight="800" fill={BLUE}>미리보기 (Artifact)</text>
        <rect x="486" y="78" width="258" height="306" rx="10" fill="#fff" stroke="#c7d2fe" />
        <text x="510" y="116" fontSize="13" fontWeight="700" fill={INK}>익명 의견 우체통</text>
        <rect x="510" y="132" width="210" height="74" rx="8" fill="#f8fafc" stroke={LINE} />
        <text x="524" y="156" fontSize="11" fill={SUB}>하고 싶은 말 (익명)…</text>
        <rect x="510" y="220" width="210" height="36" rx="8" fill="#10b981" />
        <text x="615" y="243" fontSize="12" fontWeight="700" fill="#fff" textAnchor="middle">익명으로 제출</text>
        {/* arrows + notes */}
        <path d="M300 386 q-40 6 -120 -6" fill="none" stroke={AMBER} strokeWidth="2.5" markerEnd="url(#arC)" />
        <defs><marker id="arC" markerWidth="9" markerHeight="9" refX="6" refY="4.5" orient="auto"><path d="M0 0 L9 4.5 L0 9 z" fill={AMBER} /></marker></defs>
        <rect x="150" y="300" width="250" height="40" rx="9" fill="#fffbeb" stroke={AMBER} strokeWidth="2" />
        <text x="275" y="325" fontSize="11.5" fontWeight="700" fill="#b45309" textAnchor="middle">① 프롬프트 붙여넣고 ↑ 전송</text>
        <rect x="500" y="300" width="232" height="40" rx="9" fill="#eef2ff" stroke="#6366f1" strokeWidth="1.5" />
        <text x="616" y="325" fontSize="11.5" fontWeight="700" fill="#4338ca" textAnchor="middle">② 결과를 바로 미리보기</text>
      </svg>
    );
  } else if (id === "shot-vercel") {
    svg = (
      <svg viewBox="0 0 760 430" xmlns="http://www.w3.org/2000/svg" className="shot-svg">
        <rect x="0" y="0" width="760" height="430" rx="10" fill="#fff" stroke={LINE} />
        <rect x="0" y="0" width="760" height="40" fill="#fff" stroke={LINE} />
        <text x="20" y="25" fontSize="14" fontWeight="700" fill={INK}>▲ Vercel · Netlify — 새 배포</text>
        {/* drop zone */}
        <rect x="120" y="78" width="520" height="196" rx="16" fill="#f8fafc" stroke={AMBER} strokeWidth="2.5" strokeDasharray="8 6" />
        <text x="380" y="150" fontSize="26" textAnchor="middle">📁⤵</text>
        <text x="380" y="186" fontSize="15" fontWeight="800" fill={INK} textAnchor="middle">빌드 폴더(dist 또는 build)를 여기로 끌어다 놓기</text>
        <text x="380" y="212" fontSize="12" fill={SUB} textAnchor="middle">또는 GitHub 저장소를 Import 하면 자동 배포</text>
        {/* result */}
        <rect x="120" y="306" width="520" height="58" rx="12" fill="#ecfdf5" stroke="#10b981" strokeWidth="2" />
        <text x="140" y="332" fontSize="13" fontWeight="800" fill="#065f46">✓ 배포 완료 — 공개 주소가 생성됐어요</text>
        <text x="140" y="352" fontSize="12.5" fontFamily="monospace" fill="#047857">https://my-class.vercel.app</text>
        {/* arrow */}
        <path d="M380 70 q0 -2 0 4" fill="none" stroke={AMBER} strokeWidth="2.5" markerEnd="url(#arV)" />
        <defs><marker id="arV" markerWidth="9" markerHeight="9" refX="6" refY="4.5" orient="auto"><path d="M0 0 L9 4.5 L0 9 z" fill={AMBER} /></marker></defs>
      </svg>
    );
  } else if (id === "shot-aistudio") {
    svg = (
      <svg viewBox="0 0 760 430" xmlns="http://www.w3.org/2000/svg" className="shot-svg">
        <rect x="0" y="0" width="760" height="430" rx="10" fill="#fff" stroke={LINE} />
        <rect x="0" y="0" width="760" height="40" fill="#fff" stroke={LINE} />
        <text x="20" y="25" fontSize="14" fontWeight="700" fill={INK}>✦ Google AI Studio</text>
        {/* deploy + firebase buttons top-right */}
        <rect x="486" y="50" width="124" height="34" rx="8" fill="#fff" stroke={AMBER} strokeWidth="2" />
        <text x="548" y="72" fontSize="12" fontWeight="800" fill="#b45309" textAnchor="middle">Enable Firebase</text>
        <rect x="620" y="50" width="112" height="34" rx="8" fill={AMBER} />
        <text x="676" y="72" fontSize="13" fontWeight="800" fill="#fff" textAnchor="middle">Deploy</text>
        {/* prompt area */}
        <rect x="26" y="104" width="708" height="150" rx="10" fill="#f8fafc" stroke={LINE} />
        <text x="44" y="130" fontSize="12" fill={SUB}>프롬프트:</text>
        <text x="44" y="152" fontSize="12.5" fill={INK}>서버 없는 정적 웹앱으로 익명 의견 우체통을 만들어줘…</text>
        <text x="44" y="172" fontSize="12.5" fill={INK}>익명 인증, 보안 규칙 포함, 테스트 모드 금지.</text>
        {/* preview */}
        <rect x="26" y="270" width="708" height="120" rx="10" fill="#eef2ff" stroke="#c7d2fe" />
        <text x="380" y="335" fontSize="13" fontWeight="700" fill={BLUE} textAnchor="middle">미리보기 — 완성된 앱 화면</text>
        {/* arrows */}
        <path d="M560 92 q-6 -12 0 -22" fill="none" stroke={AMBER} strokeWidth="2.5" markerEnd="url(#ar4)" />
        <path d="M676 92 q0 -12 0 -22" fill="none" stroke={AMBER} strokeWidth="2.5" markerEnd="url(#ar4)" />
        <defs><marker id="ar4" markerWidth="9" markerHeight="9" refX="6" refY="4.5" orient="auto"><path d="M0 0 L9 4.5 L0 9 z" fill={AMBER} /></marker></defs>
        <rect x="486" y="398" width="246" height="26" rx="8" fill="#fffbeb" stroke={AMBER} />
        <text x="609" y="415" fontSize="11.5" fontWeight="700" fill="#b45309" textAnchor="middle">① Firebase 연결 → ② 배포 순서</text>
      </svg>
    );
  }

  if (!svg) return null;
  return (
    <div className="ide-shotwrap">
      <div className="ide-shot" onClick={() => setZoom(true)}>
        <button className="ide-shot-zoom" onClick={() => setZoom(true)} title="크게 보기"><Maximize2 size={13} /> 크게 보기</button>
        {svg}
      </div>
      <ol className="ide-shot-steps">
        {cap.map((c, i) => <li key={i}><span className="ide-shot-no">{i + 1}</span>{c}</li>)}
      </ol>
      <p className="ide-shot-note">💡 실제 화면과 비슷하게 그린 안내용 그림이에요. 버튼 이름·위치는 업데이트로 조금 다를 수 있어요. (그림을 누르면 화면 크기에 맞게 크게 볼 수 있어요.)</p>
      {zoom && (
        <div className="ide-shot-overlay" onClick={() => setZoom(false)}>
          <div className="ide-shot-overlay-inner" onClick={(e) => e.stopPropagation()}>
            <button className="ide-shot-close" onClick={() => setZoom(false)} title="닫기"><X size={18} /></button>
            {svg}
          </div>
        </div>
      )}
    </div>
  );
}

function IdeKit({ openTerm }) {
  const [kitKey, setKitKey] = useState("claude");
  const kit = KITS.find((k) => k.key === kitKey);
  const steps = kit.steps;
  const STEP_IDS = steps.map((s) => s.id);

  const [activeId, setActiveId] = useState(steps[0].id);
  const [tabs, setTabs] = useState([steps[0].id]);
  const [seen, setSeen] = useState(() => new Set([steps[0].id]));
  const [exOpen, setExOpen] = useState(false);
  const [navOpen, setNavOpen] = useState(false);
  const [termOpen, setTermOpen] = useState(true);
  // context generator
  const [ctxIdea, setCtxIdea] = useState(CTX_PRESET.mailbox.idea);
  const [ctxData, setCtxData] = useState(true);
  const [ctxAnon, setCtxAnon] = useState(true);
  const [ctxRead, setCtxRead] = useState("none");
  const [ctxRealtime, setCtxRealtime] = useState(false);
  const [ctxImage, setCtxImage] = useState(false);
  const [ctxLevel, setCtxLevel] = useState("standard");
  const [ctxPreset, setCtxPreset] = useState("mailbox");
  const applyPreset = (k) => {
    const p = CTX_PRESET[k];
    setCtxPreset(k); setCtxIdea(p.idea); setCtxData(p.data); setCtxAnon(p.anon);
    setCtxRead(p.read); setCtxRealtime(p.realtime); setCtxImage(p.image);
  };
  // rules generator
  const [rWrite, setRWrite] = useState("auth");
  const [rRead, setRRead] = useState("block");
  const [rDup, setRDup] = useState(true);
  const [rSize, setRSize] = useState(false);
  const [checks, setChecks] = useState(() => new Set());

  const selectKit = (key) => {
    if (key === kitKey) return;
    const k = KITS.find((x) => x.key === key);
    const first = k.steps[0].id;
    setKitKey(key); setActiveId(first); setTabs([first]); setSeen(new Set([first])); setNavOpen(false);
  };

  const files = [...steps, ...KIT_REF];
  const active = files.find((f) => f.id === activeId) || steps[0];
  const exFiles = KIT_REF.filter((f) => f.folder === "examples");

  const open = (id) => {
    setActiveId(id);
    setTabs((t) => (t.includes(id) ? t : [...t, id]));
    setSeen((s) => { if (s.has(id)) return s; const n = new Set(s); n.add(id); return n; });
    setNavOpen(false);
  };
  const closeTab = (id, e) => {
    e.stopPropagation();
    setTabs((t) => {
      const next = t.filter((x) => x !== id);
      if (id === activeId && next.length) setActiveId(next[next.length - 1]);
      return next.length ? next : t;
    });
  };

  const stepIdx = STEP_IDS.indexOf(activeId);
  const isStep = stepIdx >= 0;
  const prevStep = stepIdx > 0 ? steps[stepIdx - 1] : null;
  const nextStep = stepIdx >= 0 && stepIdx < steps.length - 1 ? steps[stepIdx + 1] : null;
  const shotIds = active.kind === "shot" ? [active.id] : (active.shots || []);
  const showTrouble = active.kind === "trouble" || active.trouble;
  const termLines = terminalFor(active.id);

  const rulesOut = buildRules(rWrite, rRead, rDup, rSize);
  const body = active.kind === "context"
    ? buildContextPrompt({ idea: ctxIdea, data: ctxData, anon: ctxAnon, read: ctxRead, realtime: ctxRealtime, image: ctxImage, level: ctxLevel })
    : active.kind === "rules" ? rulesOut.code
    : active.body || "";
  const hasEditor = active.kind === "static" || active.kind === "context" || active.kind === "rules";

  const FileRow = ({ f }) => {
    const idx = STEP_IDS.indexOf(f.id);
    return (
      <button onClick={() => open(f.id)} className={"ide-file nested" + (activeId === f.id ? " on" : "")}>
        {idx >= 0 ? <span className="ide-file-no">{seen.has(f.id) && f.id !== activeId ? <Check size={10} /> : idx + 1}</span>
                  : <f.icon size={14} className="ide-file-ic" />}
        <span className="ide-file-nm">{f.name}</span>
      </button>
    );
  };

  return (
    <div className="kit-wrap">
      {/* 키트 선택 (3개 트랙) */}
      <div className="kit-switch">
        {KITS.map((k) => (
          <button key={k.key} onClick={() => selectKit(k.key)} className={"kit-tab" + (k.key === kitKey ? " on" : "")}>
            <k.icon size={15} /><span>{k.label}</span>
          </button>
        ))}
      </div>
      <div className="kit-tagline"><Compass size={13} /> {kit.tagline}</div>

      <div className="ide">
        {/* title bar */}
        <div className="ide-titlebar">
          <span className="ide-dots"><i /><i /><i /></span>
          <span className="ide-title"><Code2 size={13} /> vibe-coding-lab · {kit.short} — 단계별 실습</span>
          <button className="ide-nav-toggle" onClick={() => setNavOpen(!navOpen)}><Folder size={14} /> 파일</button>
        </div>

        <div className="ide-body">
          {/* sidebar / explorer */}
          <aside className={"ide-sidebar" + (navOpen ? " open" : "")}>
            <div className="ide-side-h">탐색기 · {kit.short}</div>
            <div className="ide-folder"><FolderOpen size={13} /> 워크숍 순서</div>
            <div className="ide-files">
              {steps.map((f) => <FileRow key={f.id} f={f} />)}
              <button className="ide-folder sub" onClick={() => setExOpen(!exOpen)}>
                <ChevronRight size={12} className={"ide-fold-chev" + (exOpen ? " open" : "")} />
                <Folder size={13} /> 예시 프롬프트
              </button>
              {exOpen && exFiles.map((f) => <FileRow key={f.id} f={f} />)}
            </div>
            <div className="ide-side-foot"><ListChecks size={12} /> {STEP_IDS.filter((id) => seen.has(id)).length}/{steps.length} 단계 진행</div>
          </aside>

          {/* main editor area */}
          <div className="ide-main">
            {/* tabs */}
            <div className="ide-tabs">
              {tabs.map((id) => {
                const f = files.find((x) => x.id === id);
                if (!f) return null;
                return (
                  <button key={id} onClick={() => setActiveId(id)} className={"ide-tab" + (activeId === id ? " on" : "")}>
                    <f.icon size={12} />
                    <span className="ide-tab-nm">{f.name}</span>
                    {tabs.length > 1 && <span className="ide-tab-x" onClick={(e) => closeTab(id, e)}><X size={12} /></span>}
                  </button>
                );
              })}
            </div>

            {/* stepper */}
            {isStep && (
              <div className="ide-stepper">
                {steps.map((f, i) => (
                  <React.Fragment key={f.id}>
                    {i > 0 && <span className="ide-step-line" />}
                    <button title={(i + 1) + ". " + f.title}
                      className={"ide-step-dot" + (f.id === activeId ? " on" : (seen.has(f.id) ? " done" : ""))}
                      onClick={() => open(f.id)}>
                      {seen.has(f.id) && f.id !== activeId ? <Check size={11} /> : i + 1}
                    </button>
                  </React.Fragment>
                ))}
              </div>
            )}

            {/* step header (or note for reference files) */}
            {isStep ? (
              <div className="ide-stephead">
                <span className="ide-step-badge">STEP {stepIdx + 1} / {steps.length}</span>
                <h3 className="ide-step-title">{active.title}</h3>
                <p className="ide-step-goal"><Compass size={13} /> {active.goal}</p>
              </div>
            ) : (
              <div className="ide-note"><CornerNote /> {active.note}{HELP[active.id] && <HelpDot k={active.id} />}</div>
            )}

            {/* concept guide */}
            {active.intro && (
              <div className="ide-guide">
                {active.intro.map((b, i) => <NodeBlock key={i} b={b} openTerm={openTerm} />)}
              </div>
            )}

            {/* settings — context generator */}
            {active.kind === "context" && (
              <div className="ide-settings">
                <div className="ide-presets-row">
                  <span className="ide-cg-label">빠른 예시<HelpDot k="preset" /></span>
                  <div className="ide-cg-opts">
                    {Object.keys(CTX_PRESET).map((k) => (
                      <button key={k} onClick={() => applyPreset(k)} className={"ide-chip" + (ctxPreset === k ? " on" : "")}>{CTX_APP_LABEL[k]}</button>
                    ))}
                  </div>
                </div>
                <div className="ide-field">
                  <span className="ide-cg-label">내 아이디어<HelpDot k="idea" /></span>
                  <textarea className="ide-idea" rows={2} value={ctxIdea}
                    onChange={(e) => { setCtxIdea(e.target.value); setCtxPreset(""); }}
                    placeholder="만들고 싶은 도구를 평소 말로 적어 보세요. 예) 모둠 발표 순서를 무작위로 정하는 도구" />
                </div>
                <Toggle label={<>데이터를 저장해요<HelpDot k="data" /></>} on={ctxData} onClick={() => { setCtxData(!ctxData); setCtxPreset(""); }} />
                {ctxData && (
                  <div className="ide-subsettings">
                    <Toggle label={<>익명 인증(개인정보 0)<HelpDot k="anon" /></>} on={ctxAnon} onClick={() => { setCtxAnon(!ctxAnon); setCtxPreset(""); }} />
                    <ChipGroup label={<>결과를 누가 보나요<HelpDot k="read" /></>} value={ctxRead} onChange={(v) => { setCtxRead(v); setCtxPreset(""); }}
                      options={[{ v: "none", t: "아무도(운영자만)" }, { v: "owner", t: "본인만" }, { v: "all", t: "다 같이" }]} />
                    <div className="ide-toggles">
                      <Toggle label={<>실시간 반영<HelpDot k="realtime" /></>} on={ctxRealtime} onClick={() => { setCtxRealtime(!ctxRealtime); setCtxPreset(""); }} />
                      <Toggle label={<>사진 업로드<HelpDot k="image" /></>} on={ctxImage} onClick={() => { setCtxImage(!ctxImage); setCtxPreset(""); }} />
                    </div>
                  </div>
                )}
                <ChipGroup label={<>난이도(꼼꼼함)<HelpDot k="level" /></>} value={ctxLevel} onChange={setCtxLevel}
                  options={[{ v: "basic", t: "기본" }, { v: "standard", t: "표준" }, { v: "advanced", t: "심화" }]} />
                <p className="ide-hint-line">💡 아래 ‘완성 프롬프트’를 복사해 {kit.short}에 그대로 붙여넣으면 돼요. 옵션을 바꾸면 즉시 다시 생성됩니다.</p>
              </div>
            )}
            {/* settings — rules generator */}
            {active.kind === "rules" && (
              <div className="ide-settings">
                <ChipGroup label={<>쓰기 허용<HelpDot k="r-write" /></>} value={rWrite} onChange={setRWrite}
                  options={[{ v: "auth", t: "익명 로그인만" }, { v: "any", t: "누구나" }]} />
                <ChipGroup label={<>읽기 권한<HelpDot k="r-read" /></>} value={rRead} onChange={setRRead}
                  options={[{ v: "block", t: "차단(운영자만)" }, { v: "owner", t: "본인만" }, { v: "public", t: "공개" }]} />
                <div className="ide-toggles">
                  <Toggle label={<>글자 수 제한 (500자)<HelpDot k="r-size" /></>} on={rSize} onClick={() => setRSize(!rSize)} />
                  <Toggle label={<>중복 제출 방지 메모<HelpDot k="r-dup" /></>} on={rDup} onClick={() => setRDup(!rDup)} />
                </div>
              </div>
            )}

            {/* editor body */}
            {hasEditor && (
              <div className="ide-editor">
                <div className="ide-editor-bar">
                  <span className="ide-editor-lang">{(active.lang || "txt").toUpperCase()}</span>
                  <CopyBtn text={body} small />
                </div>
                <div className="ide-codearea">{hl(body, active.lang || "md")}</div>
                {active.kind === "rules" && rulesOut.notes.length > 0 && (
                  <div className="ide-rulenotes">
                    {rulesOut.notes.map((n, i) => <div key={i} className="ide-rulenote"><AlertTriangle size={12} /> {n}</div>)}
                  </div>
                )}
              </div>
            )}

            {/* UI 캡처 목업 */}
            {shotIds.length > 0 && (
              <div className="ide-shotarea">
                {shotIds.map((sid) => <ShotMock key={sid} id={sid} />)}
              </div>
            )}

            {/* 문제 해결 */}
            {showTrouble && (
              <div className="ide-problems">
                <div className="ide-problems-h"><Bug size={13} /> 자주 나는 에러 · 증상별 처방 ({KIT_TROUBLE.length})</div>
                {KIT_TROUBLE.map((t, i) => (
                  <div key={i} className="ide-prob">
                    <div className="ide-prob-code">{t.code}</div>
                    <div className="ide-prob-fix">{t.fix}</div>
                  </div>
                ))}
              </div>
            )}

            {/* 체크리스트 */}
            {active.kind === "check" && (
              <div className="ide-checks">
                <div className="ide-problems-h"><ListChecks size={13} /> 배포 전 최종 체크리스트 ({checks.size}/{KIT_CHECK.length})</div>
                {KIT_CHECK.map((c, i) => (
                  <button key={i} onClick={() => setChecks((p) => { const n = new Set(p); n.has(i) ? n.delete(i) : n.add(i); return n; })}
                    className={"ide-check" + (checks.has(i) ? " on" : "")}>
                    <span className="ide-check-box">{checks.has(i) && <Check size={13} />}</span>
                    <span className="ide-check-tx">{c}</span>
                  </button>
                ))}
              </div>
            )}

            {/* 확인 포인트 */}
            {active.checkpoint && (
              <div className="ide-checkpoint">
                <span className="ide-ckp-ic"><Check size={14} /></span>
                <span><b>확인 포인트</b> · {active.checkpoint}</span>
              </div>
            )}

            {/* 이전/다음 단계 */}
            {isStep && (
              <div className="ide-stepnav">
                <button className="ide-stepnav-btn" disabled={!prevStep} onClick={() => prevStep && open(prevStep.id)}>
                  <ArrowLeft size={14} /><span className="ide-stepnav-lab">{prevStep ? stepIdx + ". " + prevStep.title : "처음"}</span>
                </button>
                <button className="ide-stepnav-btn next" disabled={!nextStep} onClick={() => nextStep && open(nextStep.id)}>
                  <span className="ide-stepnav-lab">{nextStep ? (stepIdx + 2) + ". " + nextStep.title : "끝"}</span><ArrowRight size={14} />
                </button>
              </div>
            )}

            {/* terminal */}
            {termLines && (
              <div className={"ide-terminal" + (termOpen ? "" : " collapsed")}>
                <button className="ide-term-h" onClick={() => setTermOpen(!termOpen)}>
                  <span><Terminal size={12} /> 터미널 · TERMINAL</span>
                  <ChevronDown size={14} className={"ide-term-chev" + (termOpen ? " open" : "")} />
                </button>
                {termOpen && (
                  <div className="ide-term-body">
                    {termLines.map((ln, i) => {
                      let cls = "tl-out";
                      if (ln.startsWith("$")) cls = "tl-cmd";
                      else if (ln.startsWith("OK")) cls = "tl-ok";
                      else if (ln.startsWith("i ")) cls = "tl-dim";
                      else if (ln.startsWith("+ ")) cls = "tl-add";
                      else if (ln.startsWith("Hosting URL")) cls = "tl-url";
                      return <div key={i} className={"ide-term-ln " + cls}>{ln || "\u00A0"}</div>;
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
function CornerNote() { return <span className="ide-note-ic"><FileText size={13} /></span>; }

/* ============================================================
   MAIN APP
   ============================================================ */
export default function App() {
  const [me, setMe] = useState(null);
  const [tab, setTab] = useState("home");
  const [activeTerm, setActiveTerm] = useState(null);
  const [glossQ, setGlossQ] = useState("");
  const [booted, setBooted] = useState(false);
  const [readNodes, setReadNodes] = useState(() => new Set());
  const [roster, setRoster] = useState([]);
  const [mail, setMail] = useState([]);
  // 운영자 인증 여부 — 인증하면 어느 탭에서든 플로팅 퀴즈 리모컨 사용 가능 (새로고침해도 유지)
  const [adminOk, setAdminOk] = useState(() => { try { return sessionStorage.getItem("vc_admin_ok") === "1"; } catch { return false; } });
  const grantAdmin = () => { setAdminOk(true); try { sessionStorage.setItem("vc_admin_ok", "1"); } catch {} };

  const openTerm = (k) => setActiveTerm(k);
  const markNode = (key) => setReadNodes((prev) => { if (prev.has(key)) return prev; const n = new Set(prev); n.add(key); return n; });

  useEffect(() => {
    (async () => {
      const saved = await sGet("me", false);
      if (saved && saved.uid) setMe(saved);
      setBooted(true);
    })();
  }, []);

  const loadRoster = async (s) => { const r = await sGet(`roster_${s}`, true); if (Array.isArray(r)) setRoster(r); };
  const loadMail = async (s) => { const r = await sGet(`mailbox_${s}`, true); if (Array.isArray(r)) setMail(r); };

  useEffect(() => {
    if (!me) return;
    const s = me.session;
    if (tab === "home") { loadRoster(s); const id = setInterval(() => loadRoster(s), 10000); return () => clearInterval(id); }
    if (tab === "mailbox") { loadMail(s); const id = setInterval(() => loadMail(s), 10000); return () => clearInterval(id); }
  }, [tab, me]);

  // 별명별 4자리 비번: 처음 쓰는 별명이면 등록, 이미 있으면 비번이 맞아야 입장
  // 성공하면 null, 실패하면 오류 메시지 문자열을 돌려줌
  const join = async (school, nick, session, pin) => {
    const s = (session || "DEMO").toUpperCase().replace(/[^A-Z0-9]/g, "") || "DEMO";
    const nickName = nick.trim() || "익명";
    if (!/^\d{4}$/.test(pin)) return "숫자 4자리 비밀번호를 입력해 주세요.";
    const pinKey = `pin_${s}_${nickName.replace(/[\/\s#.\[\]*]/g, "_")}`;
    const stored = await sGet(pinKey, true);
    if (stored && String(stored) !== pin) return "이미 사용 중인 별명이에요. 비밀번호가 달라요!";
    if (!stored) await sSet(pinKey, pin, true);
    const uid = "u" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    const entry = { uid, school: school.trim() || "○○학교", nick: nickName, session: s, ts: Date.now() };
    await sSet("me", entry, false);
    const cur = (await sGet(`roster_${s}`, true)) || [];
    const next = [...cur.filter((p) => p.uid !== uid), { uid, school: entry.school, nick: entry.nick, ts: entry.ts }];
    await sSet(`roster_${s}`, next, true);
    setRoster(next);
    setMe(entry);
    return null;
  };

  if (!booted) return <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-400">불러오는 중…</div>;
  if (!me) return <EntryScreen onJoin={join} />;

  const NAV = [
    { id: "home", label: "홈", Icon: Home },
    { id: "learn", label: "학습 지도", Icon: MapIcon },
    { id: "glossary", label: "용어 사전", Icon: BookOpen },
    { id: "kit", label: "실습 키트", Icon: Wrench },
    { id: "mailbox", label: "미션 체험", Icon: Inbox },
    { id: "share", label: "공유 마당", Icon: Share2 },
    { id: "quiz", label: "이해도 체크", Icon: HelpCircle },
  ];
  const progress = Math.round((readNodes.size / TOTAL_NODES) * 100);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800" style={{ fontFamily: "'Noto Sans KR', system-ui, sans-serif" }}>
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500 flex items-center justify-center text-white shrink-0">
            <GraduationCap size={20} />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="font-extrabold text-indigo-950 text-[15px] leading-tight truncate">바이브 코딩 연수</h1>
            <p className="text-[11px] text-slate-400 truncate">안전한 학급 도구 만들기 · 세션 {me.session}</p>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-[11px]">
            <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-emerald-500 to-amber-500 transition-all" style={{ width: progress + "%" }} />
            </div>
            <span className="text-slate-400 font-mono">{readNodes.size}/{TOTAL_NODES}</span>
          </div>
          <div className="px-2.5 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 text-[11px] font-bold truncate max-w-[120px]">{me.nick}</div>
          <button onClick={() => setTab("admin")} title="운영자 페이지"
            className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${tab === "admin" ? "bg-indigo-950 text-amber-400" : "bg-slate-100 text-slate-500 hover:bg-slate-200"}`}>
            <Lock size={15} />
          </button>
        </div>
        <nav className="max-w-5xl mx-auto px-2 flex gap-1 overflow-x-auto no-scrollbar pb-2">
          {NAV.map(({ id, label, Icon }) => (
            <button key={id} onClick={() => setTab(id)}
              className={`flex items-center gap-1.5 whitespace-nowrap px-3 py-1.5 rounded-lg text-[13px] font-semibold transition-colors ${tab === id ? "bg-indigo-950 text-white" : "text-slate-500 hover:bg-slate-100"}`}>
              <Icon size={14} /> {label}
            </button>
          ))}
        </nav>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6">
        {tab === "home" && <HomeView me={me} roster={roster} onRefresh={() => loadRoster(me.session)} setTab={setTab} openTerm={openTerm} />}
        {tab === "learn" && <MindMapView openTerm={openTerm} readNodes={readNodes} markNode={markNode} />}
        {tab === "glossary" && <GlossaryView q={glossQ} setQ={setGlossQ} openTerm={openTerm} />}
        {tab === "kit" && (<><KitStarter /><ScreenGuides /><IdeKit openTerm={openTerm} /></>)}
        {tab === "mailbox" && <MailboxView me={me} mail={mail} setMail={setMail} onRefresh={() => loadMail(me.session)} openTerm={openTerm} />}
        {tab === "share" && <ShareView me={me} adminOk={adminOk} />}
        {tab === "quiz" && <QuizView openTerm={openTerm} />}
        {tab === "admin" && <AdminView me={me} setTab={setTab} onAuthed={grantAdmin} preAuthed={adminOk} />}
      </main>

      <footer className="max-w-5xl mx-auto px-4 pb-10 pt-2 text-center">
        <div className="border-t border-slate-200 pt-5 text-[11px] text-slate-400 space-y-1.5">
          <p>학습 지도 · 용어 사전 · 실습 키트 · 미션 체험 · 공유 마당 · 이해도 체크 · 운영자</p>
          <p className="text-slate-300">© {new Date().getFullYear()} 바이브 코딩 연수 동반자 · 미술교사 황미란 · 교육 목적 비영리 자료 · All rights reserved.</p>
        </div>
      </footer>

      {activeTerm && <TermModal k={activeTerm} onClose={() => setActiveTerm(null)} openTerm={openTerm} />}
      <LiveQuizOverlay me={me} />
      {/* 강사 전용 플로팅 퀴즈 리모컨 — 관리자 탭에서는 발사 패널이 있으니 숨김 */}
      {adminOk && tab !== "admin" && <QuickQuizFab me={me} />}
      {/* 화면 방송: 강사는 📡 토글, 참여자는 따라가기 바 */}
      {adminOk
        ? <CastControl s={me.session} me={me} tab={tab} activeTerm={activeTerm} />
        : <FollowCast me={me} setTab={setTab} setActiveTerm={setActiveTerm} />}
      {/* 공유 작품 발표 모드 — 발표가 시작되면 모두의 화면에 전체 화면으로 */}
      <PresentOverlay me={me} adminOk={adminOk} />
      {/* 세션 전체 채팅 — 모든 참여자 공용 */}
      <ChatFab me={me} />
      <GlobalStyle />
    </div>
  );
}

/* ---------- 입장 화면 ---------- */
function EntryScreen({ onJoin }) {
  const [school, setSchool] = useState("서울미술고등학교");
  const [nick, setNick] = useState("");
  const [session, setSession] = useState("");
  const [pin, setPin] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const go = async () => {
    if (busy) return;
    setBusy(true); setErr("");
    const e = await onJoin(school, nick, session, pin);
    if (e) { setErr(e); setPin(""); }
    setBusy(false);
  };
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4" style={{ fontFamily: "'Noto Sans KR', system-ui, sans-serif" }}>
      <div className="w-full max-w-md">
        <div className="rounded-t-3xl bg-gradient-to-br from-indigo-950 to-indigo-800 p-7 text-white relative overflow-hidden">
          <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full bg-white/5" />
          <div className="w-12 h-12 rounded-2xl bg-amber-500 flex items-center justify-center mb-4"><GraduationCap size={26} /></div>
          <p className="text-amber-300 text-[11px] font-bold tracking-widest mb-1">3시간 심화 연수</p>
          <h1 className="text-2xl font-extrabold leading-snug">바이브 코딩 실전<br />내 손으로 만드는 학급 도구</h1>
          <p className="text-indigo-200 text-[13px] mt-3 leading-relaxed">웹의 구조를 이해하고, 개인정보 걱정 없이 데이터를 다루며, 실제로 작동하는 도구를 직접 배포합니다.</p>
        </div>
        <div className="rounded-b-3xl bg-white border border-t-0 border-slate-200 p-7 space-y-4">
          <Field label="학교명" value={school} onChange={setSchool} placeholder="예) 서울미술고등학교" onEnter={go} />
          <Field label="별명" value={nick} onChange={setNick} placeholder="예) 디자인쌤" onEnter={go} />
          <Field label="세션 코드 (선택)" value={session} onChange={setSession} placeholder="비우면 DEMO" hint="강사가 운영자 페이지에서 정한 세션 코드를 넣으면 같은 방으로 모입니다" onEnter={go} />
          <div>
            <label className="block text-[13px] font-bold text-slate-600 mb-1.5">내 비밀번호 (숫자 4자리)</label>
            <input value={pin} onChange={(e) => { setPin(e.target.value.replace(/\D/g, "").slice(0, 4)); setErr(""); }}
              type="password" inputMode="numeric" pattern="[0-9]*" autoComplete="off" placeholder="예) 1234"
              onKeyDown={(e) => { if (e.key === "Enter") go(); }}
              className={`w-full px-3.5 py-2.5 rounded-xl border outline-none text-[15px] tracking-[0.3em] ${err ? "border-rose-400 ring-2 ring-rose-100" : "border-slate-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"}`} />
            <p className="text-[11px] text-slate-400 mt-1">처음 쓰는 별명이면 이 4자리로 등록되고, 다음부터는 같은 별명 + 같은 비밀번호로 입장해요.</p>
            {err && <p className="text-[12px] text-rose-500 font-bold mt-1.5">⚠ {err}</p>}
          </div>
          <button onClick={go} disabled={busy}
            className="w-full py-3.5 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white font-bold transition-colors flex items-center justify-center gap-2">
            {busy ? "확인 중…" : <>입장하기 <ArrowRight size={18} /></>}
          </button>
          <p className="text-[11px] text-slate-400 text-center leading-relaxed">
            별명은 신원이 아닌 '표시용 이름'이에요. 이게 바로 오늘 배울 <b className="text-indigo-600">익명 인증</b>의 감각입니다.
          </p>
        </div>
      </div>
    </div>
  );
}
function Field({ label, value, onChange, placeholder, hint, onEnter }) {
  return (
    <div>
      <label className="block text-[13px] font-bold text-slate-600 mb-1.5">{label}</label>
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        onKeyDown={(e) => { if (e.key === "Enter" && onEnter) onEnter(); }}
        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none text-[15px]" />
      {hint && <p className="text-[11px] text-slate-400 mt-1">{hint}</p>}
    </div>
  );
}

/* ---------- 홈 ---------- */
function HomeView({ me, roster, onRefresh, setTab, openTerm }) {
  const others = roster.filter((p) => p.uid !== me.uid);
  const [settings, setSettings] = useState(null);
  const [qzRows, setQzRows] = useState([]);
  useEffect(() => { (async () => { const st = await sGet(`settings_${me.session}`, true); if (st) setSettings(st); })(); }, [me.session]);
  useEffect(() => { (async () => {
    const sc = (await sGet(`qz_scores_${me.session}`, true)) || {};
    const rows = Object.entries(sc).map(([uid, v]: [string, any]) => ({ uid, ...(v || {}) })).sort((a, b) => (b.pts || 0) - (a.pts || 0));
    setQzRows(rows);
  })(); }, [me.session]);
  return (
    <div className="space-y-5">
      <div className="rounded-2xl bg-gradient-to-br from-indigo-950 to-indigo-800 p-6 text-white">
        <p className="text-amber-300 text-[11px] font-bold tracking-widest mb-1">환영합니다{settings && settings.section ? " · " + settings.section : ""}</p>
        <h2 className="text-xl font-extrabold">{(settings && settings.school) || me.school} · {me.nick} 님</h2>
        <p className="text-indigo-200 text-[13px] mt-2 leading-relaxed">
          <b className="text-white">학습 지도</b>의 뉴스 워밍업으로 흐름을 잡고, 개념을 따라간 뒤 <b className="text-white">실습 키트</b>로 직접 만들어
          <b className="text-white"> 공유 마당</b>에 결과를 올려 보세요.
        </p>
      </div>

      {settings && settings.notice && (
        <div className="rounded-2xl bg-amber-50 border border-amber-200 p-4 flex items-start gap-3">
          <span className="w-8 h-8 rounded-lg bg-amber-400 text-white flex items-center justify-center shrink-0"><Lightbulb size={17} /></span>
          <div>
            <div className="text-[11px] font-bold text-amber-600">운영자 공지</div>
            <p className="text-[13.5px] text-amber-800 leading-relaxed whitespace-pre-wrap mt-0.5">{settings.notice}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {[
          { Icon: MapIcon, t: "학습 지도", d: "뉴스 워밍업 + 위계 6영역", to: "learn", c: "bg-indigo-50 text-indigo-700" },
          { Icon: BookOpen, t: "용어 사전", d: "69개 용어 팝업", to: "glossary", c: "bg-sky-50 text-sky-700" },
          { Icon: Wrench, t: "실습 키트", d: "3개 트랙 가이드", to: "kit", c: "bg-emerald-50 text-emerald-700" },
          { Icon: Inbox, t: "미션 체험", d: "익명 우체통 체험", to: "mailbox", c: "bg-rose-50 text-rose-700" },
          { Icon: Share2, t: "공유 마당", d: "만든 사이트 공유", to: "share", c: "bg-teal-50 text-teal-700" },
        ].map(({ Icon, t, d, to, c }) => (
          <button key={to} onClick={() => setTab(to)} className="rounded-xl bg-white border border-slate-200 p-4 text-left hover:border-indigo-300 hover:shadow-sm transition-all">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-2 ${c}`}><Icon size={18} /></div>
            <div className="font-bold text-[14px] text-slate-800">{t}</div>
            <div className="text-[11px] text-slate-400">{d}</div>
          </button>
        ))}
      </div>

      <div className="rounded-2xl bg-white border border-slate-200 p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-extrabold text-indigo-950 flex items-center gap-2"><Users size={18} className="text-amber-500" /> 함께한 사람들</h3>
          <button onClick={onRefresh} className="text-[12px] text-slate-400 hover:text-indigo-600 flex items-center gap-1"><RefreshCw size={12} /> 새로고침</button>
        </div>
        {!STORAGE_OK && <p className="text-[13px] text-slate-400">실시간 참여자 벽은 공유 환경에서 작동합니다.</p>}
        {STORAGE_OK && (
          <div className="flex flex-wrap gap-2">
            <span className="px-3 py-1.5 rounded-full bg-amber-100 text-amber-800 text-[12px] font-bold">🙋 {me.nick} · {me.school} (나)</span>
            {others.map((p) => (
              <span key={p.uid} className="px-3 py-1.5 rounded-full bg-slate-100 text-slate-600 text-[12px] font-medium">{p.nick} · {p.school}</span>
            ))}
            {others.length === 0 && <span className="text-[13px] text-slate-400 self-center">아직 다른 참여자가 없어요. 곧 합류할 거예요!</span>}
          </div>
        )}
        <p className="text-[11px] text-slate-300 mt-3">같은 세션 코드로 입장한 사람만 여기 모입니다 (현재: {me.session})</p>
      </div>

      {qzRows.length > 0 && (
        <div className="rounded-2xl bg-white border border-slate-200 p-5">
          <h3 className="font-extrabold text-indigo-950 flex items-center gap-2 mb-3"><Trophy size={18} className="text-amber-500" /> 라이브 퀴즈 순위</h3>
          <div className="space-y-1.5">
            {qzRows.slice(0, 5).map((r, i) => (
              <div key={r.uid} className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] ${r.uid === me.uid ? "bg-violet-50 font-bold" : "bg-slate-50"}`}>
                <span className="w-6 text-center">{["🥇", "🥈", "🥉"][i] || i + 1}</span>
                <span className="flex-1 truncate">{r.nick}{r.uid === me.uid ? " (나)" : ""}</span>
                <span className="font-mono font-bold text-violet-700">{r.pts || 0}점</span>
              </div>
            ))}
          </div>
          <p className="text-[11px] text-slate-300 mt-2.5">강의 중 날아오는 깜짝 퀴즈에 참여하면 점수가 쌓여요 — 빠르고 정확할수록 높은 점수! ⚡</p>
        </div>
      )}

      <SourcesCard openTerm={openTerm} />
    </div>
  );
}

/* ---------- 용어 사전 ---------- */
function GlossaryView({ q, setQ, openTerm }) {
  const entries = Object.entries(GLOSSARY);
  const filtered = entries.filter(([, v]) => {
    if (!q.trim()) return true;
    const s = (v.term + " " + v.en + " " + v.def).toLowerCase();
    return s.includes(q.toLowerCase());
  });
  const grouped = {};
  filtered.forEach(([k, v]) => { (grouped[v.c] = grouped[v.c] || []).push([k, v]); });
  const cats = CAT_ORDER.filter((c) => grouped[c]);
  return (
    <div className="space-y-5">
      <div className="relative">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="용어 검색 (예: 익명, Firestore, 보안)"
          className="w-full pl-10 pr-3 py-3 rounded-xl border border-slate-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none text-[15px]" />
      </div>
      {cats.length === 0 && <p className="text-center text-slate-400 py-10 text-[14px]">검색 결과가 없어요.</p>}
      {cats.map((c) => (
        <div key={c}>
          <h3 className="text-[12px] font-bold text-slate-400 tracking-wide mb-2 px-1">{c}</h3>
          <div className="flex flex-wrap gap-2">
            {grouped[c].map(([k, v]) => (
              <button key={k} onClick={() => openTerm(k)} className="px-3 py-2 rounded-xl bg-white border border-slate-200 hover:border-indigo-300 hover:shadow-sm transition-all text-left">
                <div className="font-bold text-[13px] text-slate-800">{v.term}</div>
                <div className="font-mono text-[10px] text-amber-500">{v.en}</div>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ---------- 용어 팝업 ---------- */
function TermModal({ k, onClose, openTerm }) {
  const v = GLOSSARY[k];
  if (!v) return null;
  return (
    <div className="fixed inset-0 flex items-end sm:items-center justify-center p-3 sm:p-4 bg-black/50" style={{ zIndex: 80 }} onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 bg-white px-5 pt-5 pb-3 border-b border-slate-100 flex items-start justify-between">
          <div>
            <h2 className="text-xl font-extrabold text-indigo-950">{v.term}</h2>
            <p className="font-mono text-[12px] text-amber-500 mt-0.5">{v.en} · <span className="text-slate-400">{v.c}</span></p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500"><X size={18} /></button>
        </div>
        <div className="p-5 space-y-4">
          <div className="rounded-xl bg-indigo-50 border border-indigo-100 p-3.5 text-[15px] font-medium text-indigo-950 leading-relaxed">
            {renderRich(v.def, openTerm)}
          </div>
          {v.body && <p className="text-[15px] leading-relaxed text-slate-700">{renderRich(v.body, openTerm)}</p>}
          {v.analogy && <Callout kind="analogy">{renderRich(v.analogy, openTerm)}</Callout>}
          {v.tip && <Callout kind="tip">{renderRich(v.tip, openTerm)}</Callout>}
          {v.warn && <Callout kind="warn">{renderRich(v.warn, openTerm)}</Callout>}
        </div>
      </div>
    </div>
  );
}

/* ---------- 익명 우체통 (체험판) ---------- */
function MailboxView({ me, mail, setMail, onRefresh, openTerm }) {
  const [text, setText] = useState("");
  const [adminOpen, setAdminOpen] = useState(false);
  const [sent, setSent] = useState(false);
  const mine = mail.filter((m) => m.uid === me.uid);

  const submit = async () => {
    const t = text.trim();
    if (!t) return;
    const cur = (await sGet(`mailbox_${me.session}`, true)) || [];
    const next = [...cur, { uid: me.uid, text: t, ts: Date.now() }];
    await sSet(`mailbox_${me.session}`, next, true);
    setMail(next); setText(""); setSent(true); setTimeout(() => setSent(false), 2000);
  };

  return (
    <div className="space-y-5">
      <div className="rounded-2xl bg-gradient-to-br from-emerald-600 to-emerald-700 p-6 text-white">
        <div className="flex items-center gap-2 mb-2"><Inbox size={22} /><h2 className="text-lg font-extrabold">미션 체험 · 익명 의견 우체통</h2></div>
        <p className="text-emerald-50 text-[13px] leading-relaxed">
          <b className="text-white">왜 이 탭이 있나요?</b> 오늘의 목표인 ‘익명 의견 우체통’을 <b className="text-white">완성하면 어떤 느낌인지 미리 써 보는 체험판</b>이에요.
          여기서 직접 글을 넣어 보면(쓰기는 되지만 남의 글은 안 보임), 학습 지도에서 배운 <b className="text-white">보안 규칙</b>이 실제로 무슨 일을 하는지 몸으로 이해할 수 있어요.
          실습 키트에서 만든 프롬프트로 똑같은 걸 직접 만들게 됩니다.
        </p>
      </div>

      <div className="rounded-2xl bg-white border border-slate-200 p-5">
        <label className="block text-[13px] font-bold text-slate-600 mb-2">학급 회의 전 하고 싶은 말 (익명)</label>
        <textarea value={text} onChange={(e) => setText(e.target.value)} rows={3} placeholder="예) 자리 배치를 한 번 바꿔보면 좋겠어요."
          className="w-full px-3.5 py-3 rounded-xl border border-slate-200 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 outline-none text-[15px] resize-none" />
        <button onClick={submit} disabled={!text.trim()}
          className="mt-3 w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold flex items-center justify-center gap-2 transition-colors">
          {sent ? <><Check size={18} /> 제출됨!</> : <><Send size={16} /> 익명으로 제출</>}
        </button>
        {!STORAGE_OK && <p className="text-[12px] text-amber-600 mt-2">※ 저장은 공유 환경에서 작동합니다.</p>}
      </div>

      <div className="rounded-2xl bg-white border border-slate-200 p-5">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-bold text-slate-700 text-[14px]">내가 남긴 의견 ({mine.length})</h3>
          <button onClick={onRefresh} className="text-[12px] text-slate-400 hover:text-emerald-600 flex items-center gap-1"><RefreshCw size={12} /> 새로고침</button>
        </div>
        {mine.length === 0 ? <p className="text-[13px] text-slate-400">아직 남긴 의견이 없어요.</p> :
          <div className="space-y-2">{mine.map((m, i) => <div key={i} className="rounded-lg bg-slate-50 p-3 text-[14px] text-slate-700">{m.text}</div>)}</div>}
        <p className="text-[12px] text-slate-400 mt-3">다른 사람 의견은 보이지 않죠? 이게 <button onClick={() => openTerm("rules")} className="text-emerald-700 font-semibold underline decoration-dotted">보안 규칙</button>이 하는 일이에요.</p>
      </div>

      <div className="rounded-2xl bg-indigo-50 border border-indigo-100 p-5">
        <button onClick={() => setAdminOpen(!adminOpen)} className="w-full flex items-center justify-between">
          <span className="font-bold text-indigo-900 text-[14px] flex items-center gap-2"><Shield size={16} /> 교사(관리자) 보기</span>
          {adminOpen ? <EyeOff size={16} className="text-indigo-500" /> : <Eye size={16} className="text-indigo-500" />}
        </button>
        <p className="text-[12px] text-indigo-600 mt-1.5 leading-relaxed">
          실제 앱에서는 학생이 못 보고, 교사만 Firebase <b>콘솔</b>에서 전체를 열람합니다. 아래는 그 '콘솔 열람'을 흉내 낸 화면이에요.
        </p>
        {adminOpen && (
          <div className="mt-3 space-y-2">
            {mail.length === 0 ? <p className="text-[13px] text-indigo-400">아직 모인 의견이 없어요.</p> :
              mail.map((m, i) => (
                <div key={i} className="rounded-lg bg-white border border-indigo-100 p-3 text-[14px] text-slate-700">
                  {m.text} <span className="text-[10px] text-slate-300 font-mono ml-1">({m.uid.slice(0, 5)}…)</span>
                </div>
              ))}
            <p className="text-[11px] text-indigo-400 mt-1">총 {mail.length}개 · 작성자는 익명 ID로만 구분됩니다.</p>
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------- 퀴즈 ---------- */
function QuizView({ openTerm }) {
  const [picked, setPicked] = useState({});
  const choose = (qi, oi) => setPicked((p) => (p[qi] != null ? p : { ...p, [qi]: oi }));
  const answered = Object.keys(picked).length;
  const correct = Object.entries(picked).filter(([qi, oi]) => QUIZ[qi].a === oi).length;
  return (
    <div className="space-y-4">
      <div className="rounded-2xl bg-white border border-slate-200 p-5 flex items-center justify-between">
        <div>
          <h2 className="font-extrabold text-indigo-950 text-[16px]">이해도 체크</h2>
          <p className="text-[13px] text-slate-400">정답을 고르면 바로 해설이 나와요.</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-extrabold text-amber-500">{correct}<span className="text-slate-300 text-lg">/{QUIZ.length}</span></div>
          <div className="text-[11px] text-slate-400">{answered}문 풀이</div>
        </div>
      </div>
      {QUIZ.map((q, qi) => {
        const sel = picked[qi];
        const done = sel != null;
        return (
          <div key={qi} className="rounded-2xl bg-white border border-slate-200 p-5">
            <div className="flex gap-2 mb-3">
              <span className="font-mono text-[12px] text-amber-500 font-bold shrink-0 mt-0.5">Q{qi + 1}</span>
              <p className="font-bold text-[15px] text-slate-800 leading-snug">{q.q}</p>
            </div>
            <div className="space-y-2">
              {q.o.map((o, oi) => {
                let cls = "bg-slate-50 border-slate-200 hover:border-indigo-300 text-slate-700";
                if (done) {
                  if (oi === q.a) cls = "bg-emerald-50 border-emerald-300 text-emerald-800";
                  else if (oi === sel) cls = "bg-rose-50 border-rose-300 text-rose-700";
                  else cls = "bg-white border-slate-100 text-slate-400";
                }
                return (
                  <button key={oi} onClick={() => choose(qi, oi)} disabled={done}
                    className={`w-full flex items-center gap-2.5 rounded-xl border p-3 text-left text-[14px] font-medium transition-colors ${cls}`}>
                    <span className="w-5 h-5 rounded-full border flex items-center justify-center shrink-0 text-[11px]">
                      {done && oi === q.a ? <Check size={13} /> : done && oi === sel ? <X size={13} /> : String.fromCharCode(65 + oi)}
                    </span>
                    {o}
                  </button>
                );
              })}
            </div>
            {done && (
              <div className="mt-3 rounded-xl bg-indigo-50 border border-indigo-100 p-3 text-[13px] text-indigo-900 leading-relaxed">💡 {q.e}</div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ============================================================
   KIT STARTER — 입문 안내(접이식) + 참고 파일 모음(접이식)
   ============================================================ */
const STARTER_STEPS = [
  { n: "1", t: "AI로 생성", d: "Google AI Studio 등에 프롬프트(주문서)만 붙여넣으면 앱 코드는 AI가 다 만들어요. 코드를 직접 타이핑하지 않아요.", Icon: Sparkles, c: "bg-indigo-50 text-indigo-700" },
  { n: "2", t: "Firebase 연결", d: "두 번 붙여넣어요 — ① 콘솔의 ‘연결 키(firebaseConfig)’를 앱 코드에, ② 보안 규칙을 콘솔에. 익명 인증도 켜요. (AI Studio의 Enable Firebase를 쓰면 ①은 자동)", Icon: Database, c: "bg-amber-50 text-amber-700" },
  { n: "3", t: "Netlify로 배포", d: "완성된 폴더를 netlify.com/drop 에 드래그하면 끝. 서버·카드·명령어 없이 공개 URL이 나와요.", Icon: Rocket, c: "bg-emerald-50 text-emerald-700" },
];
const STARTER_PASTE = [
  { n: "①", t: "프롬프트", to: "AI 채팅창에" },
  { n: "②", t: "연결 키 (firebaseConfig)", to: "앱 코드에" },
  { n: "③", t: "보안 규칙", to: "Firebase 콘솔에" },
];
const STARTER_FOLDERS = [
  { name: "prompts/", tag: "✋ 복붙 ①", d: "AI에게 붙여넣는 ‘주문서’. 앱과 보안 규칙을 AI가 만들게 하는 글이에요." },
  { name: "firebase/", tag: "✋ 복붙 ②③", d: "연결 키(firebase-config.js)는 앱 코드에, 보안 규칙(firestore.rules)은 콘솔에. 설정 순서도 들어 있어요." },
  { name: "netlify/", tag: "🖱️ 드래그 배포", d: "폴더를 netlify.com/drop 에 끌어다 놓으면 URL 완성 (명령어·카드 없음)." },
  { name: "참고코드(AI생성)/", tag: "👀 복붙 아님", d: "AI가 만들어 주는 코드가 ‘대략 이런 모습’인지 눈으로 확인하는 예시예요." },
  { name: "CHECKLIST.md", tag: "✅ 점검", d: "배포 직전 클릭 체크리스트. 학생에게 URL 주기 전 5가지를 점검해요." },
];
/* 미리보기(아티팩트) 스캐너가 '예시 코드' 속 import 줄을 실제 라이브러리로 오인하지 않도록
   import 키워드를 런타임에 조립합니다. 화면 표시는 동일하게 'import …'로 보입니다. */
const IMP = "imp" + "ort";
const STARTER_FILES = {
  p1: { name: "01_컨텍스트_패턴.txt", desc: "어떤 앱이든 이 5줄로 시작 → AI에게 그대로 붙여넣기", code: `[ 마법의 컨텍스트 패턴 — 어떤 앱이든 이 5줄로 시작 ]

1) 기술 스택: Firebase Firestore 사용. 빌드 없이 그냥 열리는 "정적 사이트"로 만들어줘 (Netlify에 올릴 거야).
2) 인증: 익명 인증(Anonymous Auth)만. 이름·이메일·연락처는 절대 받지 마.
3) 보안 규칙: 테스트 모드(전체 공개) 금지. 쓰기는 로그인한(익명) 사용자만, 읽기는 차단.
4) 중복 방지: 한 사람이 짧은 시간에 여러 번 제출하지 못하게.
5) 산출물: index.html 하나로 도는 형태 + 붙여넣을 보안 규칙(firestore.rules)도 같이 줘.` },
  p2: { name: "02_익명_설문앱.txt", desc: "구체 예시 — 원하는 앱에 맞춰 고쳐서 붙여넣기", code: `# 학생 익명 설문 앱

학생 익명 설문 앱을 만들어줘.
- 빌드 필요 없는 정적 사이트(index.html)로. Netlify에 올릴 거야.
- 로그인: 익명 인증만. 개인정보(이름/이메일)는 저장 금지.
- 저장: 문항 응답과 제출 시각만 Firestore에 저장.
- 결과: 관리자 화면에서 막대그래프로 집계.
- 보안 규칙: 응답은 '쓰기'만, '읽기'는 관리자만. firestore.rules도 함께 줘.` },
  p3: { name: "03_롤링페이퍼.txt", desc: "오늘의 첫 미션 — 익명 칭찬 롤링페이퍼", code: `# 우리 반 익명 칭찬 롤링페이퍼

데이터가 저장되는 '익명 칭찬 롤링페이퍼'를 만들어줘.
- 빌드 없는 정적 사이트(index.html). Netlify 배포용.
- 친구에게 익명으로 칭찬 메시지를 남길 수 있게. 익명 인증 사용, 개인 식별 정보 저장 금지.
- 메시지는 알록달록 카드로 예쁘게 쌓여 보이게.
- 보안 규칙: 쓰기는 누구나(익명), 삭제는 교사만. firestore.rules도 함께 줘.` },
  p4: { name: "04_디버깅.txt", desc: "에러가 나면 빈칸을 채워 AI에게 전달 (육하원칙)", code: `# 육하원칙 디버깅 템플릿 (에러 났을 때 복붙)

[증상]   "로그인" 버튼을 눌렀을 때 다음 페이지로 안 넘어가.
[언제]   버튼을 클릭하는 순간.
[기대]   원래는 결과 페이지로 이동해야 해.
[에러]   콘솔(F12)에 이렇게 떠:
         Uncaught TypeError: Cannot read property 'value' of null
[요청]   원인을 찾아서 고쳐줘. 수정한 전체 코드를 다시 줘.` },
  p5: { name: "05_기능추가.txt", desc: "기존 코드를 깨지 않고 기능만 추가할 때", code: `# 기능 추가 프롬프트 (기존 코드 안 깨뜨리기)

지금 코드는 그대로 두고, 아래 기능만 추가해줘.
- 추가 기능: 제출하면 "고마워요!" 안내 메시지를 2초간 보여주기.
- 절대 건드리지 말 것: 기존 익명 인증 / 보안 규칙 / 디자인.
- 변경한 부분만 따로 표시하고, 전체 파일도 다시 줘.` },
  p6: { name: "06_보안규칙_생성.txt", desc: "★ AI에게 보안 규칙을 만들게 해서 Firebase에 붙여넣기", code: `# 보안 규칙 만들어 달라고 하기 (Firebase에 붙여넣을 것)

지금 앱에 맞는 Firestore 보안 규칙을 만들어줘.
- 컬렉션 이름: responses (내 앱에 맞게 바꿔줘)
- 쓰기(create): 익명 인증으로 로그인한 사람만 (request.auth != null)
- 읽기/수정/삭제: 앱에서는 전부 차단 (교사만 콘솔에서 열람)
- 테스트 모드(전체 공개)는 절대 쓰지 마.

→ 결과로 나온 규칙을 Firebase 콘솔 > Firestore > '규칙' 탭에 붙여넣고 '게시'를 누르면 끝.` },
  fbsetup: { name: "콘솔_설정_순서.md", desc: "Firebase 콘솔에서 클릭만으로 준비 (명령어 없음)", code: `# Firebase 콘솔 설정 순서 (클릭만, 명령어 없음)

AI가 코드를 만들면, 데이터 저장소는 Firebase 콘솔에서 클릭으로 준비해요.

중요: Firebase 연결에는 붙여넣기가 두 번 있어요.
- (A) 연결 키(firebaseConfig)를 "앱 코드"(firebase-config.js)에 → 어느 프로젝트에 연결할지
- (B) 보안 규칙을 "콘솔 규칙 탭"에 → 자물쇠
(Google AI Studio의 Enable Firebase를 쓰면 A는 자동으로 끼워져요.)

## 1. 프로젝트 만들기
- console.firebase.google.com 접속 → "프로젝트 추가"
- 이름은 자유 (예: our-class). 애널리틱스는 꺼도 됨.

## 2. Firestore 켜기
- 왼쪽 메뉴 "Firestore Database" → "데이터베이스 만들기"
- 위치는 기본값, 시작은 "프로덕션 모드" 선택 (테스트 모드 X)

## 3. 익명 인증 켜기
- 왼쪽 "Authentication" → "시작하기"
- "Sign-in method" 탭 → "익명(Anonymous)" → 사용 설정 ON

## 4. 보안 규칙 붙여넣기
- "Firestore Database" → 상단 "규칙" 탭
- AI가 만들어 준 firestore.rules 내용을 붙여넣고 "게시"

## 5. 연결 키 복사
- 톱니바퀴(프로젝트 설정) → "내 앱"에서 웹 앱 추가
- firebaseConfig 값을 복사해 코드(firebase-config.js)에 넣기

> 여기까지가 '주방(백엔드)' 준비. 화면은 Netlify로 배포해요.` },
  cfg: { name: "firebase-config.js", desc: "★ 콘솔의 연결 키(firebaseConfig)를 여기에 붙여넣어요 — 앱↔Firebase 연결부", code: `// firebase-config.js
// 콘솔(프로젝트 설정 > 일반)에서 복사한 값으로 채워집니다.
${IMP} { initializeApp } from "firebase/app";
${IMP} { getAuth } from "firebase/auth";
${IMP} { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "••••••••••••",
  authDomain: "our-class.firebaseapp.com",
  projectId: "our-class",
  appId: "1:000000000000:web:••••",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);` },
  rules: { name: "firestore.rules", desc: "✅ AI가 만든 규칙을 콘솔 '규칙' 탭에 붙여넣기 (안전 예시)", code: `rules_version = '2';

// 안전한 보안 규칙: 쓰기는 익명 로그인 사용자만, 읽기는 차단
service cloud.firestore {
  match /databases/{database}/documents {

    match /responses/{docId} {
      // 익명 인증으로 로그인한 사람만 새 응답 작성 가능
      allow create: if request.auth != null;

      // 앱에서는 읽기/수정/삭제 차단 (교사는 콘솔에서만 열람)
      allow read, update, delete: if false;
    }
  }
}` },
  rulesbad: { name: "firestore.rules.danger", danger: true, desc: "⚠ 반면교사 — 이렇게 두면 절대 안 됩니다", code: `rules_version = '2';

// 위험! 테스트 모드 — 절대 이대로 두지 마세요.
// 링크만 알면 전 세계 누구나 데이터를 읽고 쓰고 지울 수 있습니다.
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;   // 활짝 열린 문
    }
  }
}` },
  nlsteps: { name: "배포_순서.md", desc: "Netlify에 폴더를 드래그해서 배포 (CLI·카드 없음)", code: `# Netlify로 배포하기 (드래그 한 번)

명령어도, 카드도, 서버도 필요 없어요. 폴더를 끌어다 놓기만 하면 됩니다.

## 1. 완성된 파일 준비
- AI Studio(또는 도구)에서 만든 결과물을 다운로드/내보내기
- index.html이 폴더 맨 위에 있어야 해요 (하위 폴더에 묻히면 X)

## 2. Netlify Drop 열기
- app.netlify.com/drop 접속 (또는 netlify.com → Add new site → Deploy manually)
- 로그인은 구글/깃허브로 1초

## 3. 폴더를 드래그
- 위 페이지에 폴더째로 끌어다 놓기
- 몇 초 뒤 https://랜덤이름.netlify.app 주소가 생겨요

## 4. 주소 바꾸기 (선택)
- Site settings → "Change site name" 에서 our-class 처럼 변경
- → https://our-class.netlify.app

## 5. 새로고침 404 방지
- 폴더에 _redirects 파일을 함께 넣으면 끝 (이 키트에 있어요)

> 코드를 고치면? 그 폴더를 같은 자리에 다시 드래그하면 자동 업데이트돼요.` },
  redirects: { name: "_redirects", desc: "새로고침 404 방지 — 폴더에 같이 넣기만 하면 끝", code: `# 모든 주소를 index.html로 보내기 (새로고침 404 방지)
/*    /index.html   200` },
  nltoml: { name: "netlify.toml", desc: "배포 옵션 (없어도 되지만 있으면 깔끔)", code: `# netlify.toml — 배포 옵션

[build]
  publish = "."

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200` },
  index: { name: "index.html", desc: "👀 AI가 만들어 주는 화면 뼈대 — 눈으로 확인용 (복붙 아님)", code: `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>익명 의견 우체통</title>
  <link rel="stylesheet" href="styles.css" />
</head>
<body>
  <main class="card">
    <h1>오늘 하고 싶은 말 (익명)</h1>
    <textarea id="msg" placeholder="자유롭게 적어주세요"></textarea>
    <button id="send">익명으로 제출</button>
    <p id="toast" class="toast"></p>
  </main>
  <script type="module" src="app.js"></script>
</body>
</html>` },
  appjs: { name: "app.js", desc: "👀 AI가 만들어 주는 동작 코드 — 검수용 (복붙 아님)", code: `// app.js — 익명 로그인 + 제출 로직 (AI가 생성하는 예시)
${IMP} { auth, db } from "./firebase-config.js";
${IMP} { signInAnonymously } from "firebase/auth";
${IMP} { addDoc, collection, serverTimestamp } from "firebase/firestore";

// 1) 페이지가 열리면 조용히 익명 로그인 (이름/이메일 X)
signInAnonymously(auth).catch((e) => console.error("로그인 실패", e));

const sendBtn = document.getElementById("send");
const msgBox = document.getElementById("msg");

// 2) 제출 → Firestore에 "내용 + 시간"만 저장
sendBtn.addEventListener("click", async () => {
  const text = msgBox.value.trim();
  if (!text) return;
  await addDoc(collection(db, "responses"), { text: text, createdAt: serverTimestamp() });
  msgBox.value = "";
});` },
  css: { name: "styles.css", desc: "👀 AI가 만들어 주는 꾸미기 예시 (복붙 아님)", code: `/* styles.css — 단순한 카드 스타일 */
:root { --brand: #4f46e5; --bg: #f4f5fb; }
body {
  margin: 0;
  font-family: "Noto Sans KR", system-ui, sans-serif;
  background: var(--bg);
  display: flex;
  justify-content: center;
  padding: 40px 16px;
}
.card { width: 100%; max-width: 420px; background: #fff; border-radius: 16px; padding: 24px; }
button { margin-top: 12px; width: 100%; background: var(--brand); color: #fff; border: none; border-radius: 10px; padding: 12px; font-weight: 700; }` },
};
const STARTER_TREE = [
  { name: "prompts", children: ["p1", "p2", "p3", "p4", "p5", "p6"] },
  { name: "firebase", children: ["fbsetup", "cfg", "rules", "rulesbad"] },
  { name: "netlify", children: ["nlsteps", "redirects", "nltoml"] },
  { name: "참고코드(AI생성)", children: ["index", "appjs", "css"] },
];
const STARTER_CHECK = [
  "보안: 테스트 모드 해제 + 보안 규칙(Rules) ‘게시’ 완료",
  "개인정보: 이름·이메일 없이 익명 인증만 사용",
  "Firebase: 익명 인증 ON + firebase-config.js의 projectId 일치",
  "Netlify: index.html이 폴더 최상단 + _redirects 포함",
  "테스트: 다른 기기(폰)에서 URL 접속·제출 확인",
];

function KitStarter() {
  const [guide, setGuide] = useState(false);
  const [files, setFiles] = useState(false);
  const [open, setOpen] = useState(null);
  return (
    <div className="mb-4 space-y-3">
      {/* 입문 안내 (접이식) */}
      <div className="rounded-2xl bg-white border border-slate-200 overflow-hidden">
        <button className="w-full flex items-center gap-3 p-4 text-left hover:bg-slate-50" onClick={() => setGuide(!guide)}>
          <span className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center text-[20px] shrink-0">🔰</span>
          <span className="flex-1 min-w-0">
            <span className="block font-extrabold text-indigo-950 text-[15px]">코딩이 처음이라면 — 폴더·파일이 뭔지 먼저 보기</span>
            <span className="block text-[12px] text-slate-400">3단계 조립 · 붙여넣기 3곳 · 폴더=서랍 / 파일=서류</span>
          </span>
          <ChevronDown size={18} className={"text-slate-400 shrink-0 transition-transform " + (guide ? "rotate-180" : "")} />
        </button>
        {guide && (
          <div className="px-4 pb-5 space-y-3 border-t border-slate-100 pt-4">
            <p className="text-[13.5px] text-slate-600 leading-relaxed">바이브 코딩 워크숍은 ‘코드 타이핑’이 아니라 <b className="text-indigo-700">3단계 조립</b>이에요: ① AI로 생성 → ② Firebase에 규칙 붙여넣기 → ③ Netlify로 드래그 배포. 폴더는 ‘서랍’, 파일은 ‘서류’라고 생각하면 쉬워요.</p>
            <div className="grid sm:grid-cols-3 gap-2">
              {STARTER_STEPS.map((s) => (
                <div key={s.n} className="rounded-xl border border-slate-200 p-3">
                  <div className={"w-8 h-8 rounded-lg flex items-center justify-center mb-2 " + s.c}><s.Icon size={16} /></div>
                  <div className="font-bold text-[13px] text-slate-800"><span className="text-slate-400 mr-1">{s.n}</span>{s.t}</div>
                  <div className="text-[12px] text-slate-500 leading-relaxed mt-1">{s.d}</div>
                </div>
              ))}
            </div>
            <div className="rounded-xl bg-indigo-50 border border-indigo-100 p-3.5">
              <div className="text-[12.5px] font-bold text-indigo-800 mb-2">붙여넣기는 셋, 들어가는 곳이 달라요</div>
              <div className="space-y-1.5">
                {STARTER_PASTE.map((p) => (
                  <div key={p.n} className="flex items-center gap-2 text-[12.5px]">
                    <span className="font-extrabold text-indigo-600 w-5">{p.n}</span>
                    <span className="font-bold text-slate-700">{p.t}</span>
                    <ArrowRight size={12} className="text-slate-300" />
                    <span className="text-slate-500">{p.to}</span>
                  </div>
                ))}
              </div>
              <p className="text-[11.5px] text-indigo-500 mt-2 leading-relaxed">SDK 설치·로그인·저장 코드는 AI가 알아서 써줘요. (AI Studio의 ‘Enable Firebase’를 쓰면 ②는 자동으로 끼워져, 규칙만 넣으면 되기도 해요.)</p>
            </div>
            <div className="rounded-xl border border-slate-200 overflow-hidden">
              {STARTER_FOLDERS.map((f, i) => (
                <div key={f.name} className={"flex items-start gap-2.5 px-3.5 py-2.5 text-[12.5px] " + (i % 2 ? "bg-slate-50" : "bg-white")}>
                  <span className="font-mono font-bold text-slate-700 shrink-0">{f.name}</span>
                  <span className="text-amber-600 font-bold text-[11px] shrink-0">{f.tag}</span>
                  <span className="text-slate-500 leading-snug">{f.d}</span>
                </div>
              ))}
            </div>
            <div className="rounded-xl bg-amber-50 border border-amber-200 p-3 text-[12px] text-amber-800 leading-relaxed flex items-start gap-2">
              <Lightbulb size={15} className="shrink-0 mt-0.5" /> <span>직접 붙여넣는 건 <b>① 프롬프트, ② 연결 키(firebaseConfig), ③ 보안 규칙</b> 이 셋이에요. 나머지는 AI가 써주니 외울 필요 없어요. 아래 ‘참고 파일 모음’에서 파일을 눌러 코드를 확인하고 [복사]로 붙여넣으세요.</span>
            </div>
          </div>
        )}
      </div>

      {/* 참고 파일 모음 (접이식) */}
      <div className="rounded-2xl bg-white border border-slate-200 overflow-hidden">
        <button className="w-full flex items-center gap-3 p-4 text-left hover:bg-slate-50" onClick={() => setFiles(!files)}>
          <span className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700 shrink-0"><FolderOpen size={18} /></span>
          <span className="flex-1 min-w-0">
            <span className="block font-extrabold text-indigo-950 text-[15px]">참고 파일 모음 (붙여넣기용)</span>
            <span className="block text-[12px] text-slate-400">prompts · firebase · netlify · 참고코드 · CHECKLIST — 파일을 눌러 코드 확인 후 [복사]</span>
          </span>
          <ChevronDown size={18} className={"text-slate-400 shrink-0 transition-transform " + (files ? "rotate-180" : "")} />
        </button>
        {files && (
          <div className="px-4 pb-5 border-t border-slate-100 pt-3 space-y-3">
            {STARTER_TREE.map((folder) => (
              <div key={folder.name}>
                <div className="flex items-center gap-1.5 text-[12px] font-bold text-slate-500 mb-1.5"><Folder size={13} className="text-amber-500" /> {folder.name}/</div>
                <div className="space-y-1.5 pl-1">
                  {folder.children.map((id) => {
                    const f = STARTER_FILES[id]; const op = open === id;
                    return (
                      <div key={id} className={"rounded-xl border overflow-hidden " + (f.danger ? "border-rose-200" : "border-slate-200")}>
                        <button className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-slate-50" onClick={() => setOpen(op ? null : id)}>
                          <FileText size={14} className={f.danger ? "text-rose-400" : "text-slate-400"} />
                          <span className="font-mono text-[12.5px] font-bold text-slate-700">{f.name}</span>
                          <span className="text-[11px] text-slate-400 truncate hidden sm:inline">{f.desc}</span>
                          <ChevronDown size={14} className={"ml-auto text-slate-300 transition-transform " + (op ? "rotate-180" : "")} />
                        </button>
                        {op && (
                          <div className="px-3 pb-3">
                            <p className="text-[11.5px] text-slate-500 mb-2 sm:hidden">{f.desc}</p>
                            <div className={"rounded-lg overflow-hidden border " + (f.danger ? "border-rose-300 bg-rose-950" : "border-indigo-900 bg-indigo-950")}>
                              <div className={"flex items-center justify-between px-3 py-1.5 " + (f.danger ? "bg-rose-900/70" : "bg-indigo-900/60")}>
                                <span className={"text-[11px] font-mono " + (f.danger ? "text-rose-200" : "text-indigo-200")}>{f.name}</span>
                                <CopyBtn text={f.code} small />
                              </div>
                              <pre className={"px-3 py-2.5 text-[12px] leading-relaxed font-mono whitespace-pre-wrap overflow-x-auto " + (f.danger ? "text-rose-100" : "text-indigo-100")}>{f.code}</pre>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
            {/* CHECKLIST.md */}
            <div>
              <div className="flex items-center gap-1.5 text-[12px] font-bold text-slate-500 mb-1.5"><ListChecks size={13} className="text-emerald-500" /> CHECKLIST.md</div>
              <ul className="space-y-1.5 pl-1">
                {STARTER_CHECK.map((c, i) => (
                  <li key={i} className="flex items-start gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-[13px] text-slate-700"><Check size={15} className="text-emerald-500 shrink-0 mt-0.5" /> {c}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ============================================================
   SCREEN GUIDES — 실제 화면 따라하기 (Antigravity · Claude 상세 가이드)
   배포 시 vibe-practice-guide.html / vibe-practice-claude.html 를
   사이트 최상위(public)에 함께 올리면 새 탭으로 열립니다.
   ============================================================ */
function ScreenGuides() {
  const guides = [
    { url: "./vibe-practice-claude.html", emoji: "🟠", title: "Claude로 만들기 — 화면 따라하기", sub: "A~H · Claude 아티팩트 → Firebase → Netlify 배포 + 에러 사례집 + 이야기 컷", grad: "from-amber-500 to-orange-600" },
    { url: "./vibe-practice-guide.html", emoji: "🖥️", title: "Antigravity로 만들기 — 화면 따라하기", sub: "A~G · Antigravity + Git/GitHub → Firebase → 보안 규칙 → 배포", grad: "from-indigo-500 to-indigo-700" },
  ];
  return (
    <div className="mb-4 rounded-2xl bg-white border border-slate-200 p-5">
      <h3 className="font-extrabold text-indigo-950 text-[15px] flex items-center gap-2"><Maximize2 size={16} className="text-indigo-500" /> 심화 화면 가이드 — 실제 화면 따라하기</h3>
      <p className="text-[12.5px] text-slate-500 mt-1 mb-3 leading-relaxed">아래 키트로 개념을 잡은 뒤, 실제 화면을 그대로 보여주는 단계별 가이드(빨간 표시 = 클릭 지점)로 따라 해 보세요. 새 탭으로 열립니다.</p>
      <div className="grid sm:grid-cols-2 gap-3">
        {guides.map((g, i) => (
          <a key={i} href={g.url} target="_blank" rel="noopener noreferrer" className="block rounded-2xl border border-slate-200 overflow-hidden hover:shadow-md transition-all no-underline">
            <div className={`relative h-16 bg-gradient-to-br ${g.grad} flex items-center px-4 gap-3`}>
              <span className="text-3xl drop-shadow">{g.emoji}</span>
              <span className="text-white font-extrabold text-[14px] leading-snug">{g.title}</span>
            </div>
            <div className="p-4">
              <p className="text-[12.5px] text-slate-600 leading-relaxed">{g.sub}</p>
              <div className="mt-2 text-[12.5px] font-bold text-indigo-600 flex items-center gap-1">가이드 열기 <ExternalLink size={13} /></div>
            </div>
          </a>
        ))}
      </div>
      <p className="text-[11px] text-slate-300 mt-3 leading-relaxed">※ 배포 시 두 가이드 HTML 파일을 사이트 최상위 폴더(public)에 함께 올리면 이 링크가 동작합니다.</p>
    </div>
  );
}

/* ============================================================
   NEWS VIEW — 연수와 연결되는 최신 소식
   ============================================================ */
function NewsCards() {
  const hideImg = (e) => { e.currentTarget.style.display = "none"; };
  return (
    <div className="space-y-4">
      <div className="rounded-2xl bg-white border border-slate-200 p-5">
        <h3 className="font-extrabold text-indigo-950 text-[15px] mb-3 flex items-center gap-2"><TrendingUp size={16} className="text-amber-500" /> 숫자로 보는 바이브 코딩 2026</h3>
        <div className="grid grid-cols-3 gap-2">{NEWS_STATS.map((s, i) => (<div key={i} className="rounded-xl bg-slate-50 border border-slate-200 p-3 text-center"><div className="text-xl sm:text-2xl font-extrabold text-amber-500">{s.n}</div><div className="text-[10px] text-slate-500 mt-1 leading-tight">{s.l}</div></div>))}</div>
        <p className="text-[10px] text-slate-300 mt-2">출처: daily.dev · Keyhole Software (2026)</p>
      </div>
      <div className="grid sm:grid-cols-2 gap-3">
        {NEWS.map((n, i) => { const c = TAGC[n.color]; return (
          <a key={i} href={n.url} target="_blank" rel="noopener noreferrer" className="block rounded-2xl bg-white border border-slate-200 overflow-hidden hover:shadow-md transition-all no-underline">
            <div className={`relative h-24 bg-gradient-to-br ${c.grad} flex items-center justify-center`}>
              {n.img ? <img src={n.img} alt="" onError={hideImg} className="absolute inset-0 w-full h-full object-cover" /> : null}
              <span className="text-4xl drop-shadow">{n.emoji}</span>
              <span className={`absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/90 ${c.chip.split(" ")[1]}`}>{n.tag}</span>
            </div>
            <div className="p-4">
              <div className="flex items-center gap-1.5 mb-1.5">
                <img src={`https://www.google.com/s2/favicons?domain=${n.domain}&sz=64`} alt="" onError={hideImg} className="w-4 h-4 rounded" />
                <span className="text-[11px] text-slate-400 truncate">{n.source} · {n.date}</span>
              </div>
              <h3 className="font-extrabold text-indigo-950 text-[14.5px] leading-snug">{n.title}</h3>
              <p className="text-[13px] text-slate-600 mt-1.5 leading-relaxed">{n.sum}</p>
              <div className="mt-2 rounded-lg bg-slate-50 px-3 py-2 text-[12px] text-slate-500 leading-relaxed"><b className="text-slate-600">왜 중요할까</b> · {n.why}</div>
              <div className="mt-2 text-[12px] font-semibold text-indigo-600 flex items-center gap-1">원문 보기 <ExternalLink size={12} /></div>
            </div>
          </a>
        ); })}
      </div>
      <p className="text-[11px] text-slate-300 text-center leading-relaxed">기사 캡처 대신 원문 링크로 연결했어요. 직접 캡처한 이미지가 있으면 코드의 각 뉴스 <span className="font-mono">img</span> 칸에 링크를 넣으면 커버로 표시됩니다.</p>
    </div>
  );
}

/* ============================================================
   SHARE — 공유 마당: 연수생끼리 만든 사이트·수합 내용 공유
   ============================================================ */
function ShareView({ me, adminOk }) {
  const s = me.session;
  const [presented, setPresented] = useState("");
  const [items, setItems] = useState([]);
  const [shareOn, setShareOn] = useState(true);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const load = async () => {
    const g = await sGet(`gallery_${s}`, true); setItems(Array.isArray(g) ? g : []);
    const st = await sGet(`settings_${s}`, true); if (st && typeof st.shareOn === "boolean") setShareOn(st.shareOn);
    setLoaded(true);
  };
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [s]);

  const normUrl = (u) => (u && !/^https?:\/\//i.test(u) ? "https://" + u : u);
  const post = async () => {
    if (!title.trim() && !url.trim() && !note.trim()) return;
    setBusy(true);
    const entry = { id: Date.now() + "-" + Math.random().toString(36).slice(2, 6), uid: me.uid, nick: me.nick, school: me.school, title: title.trim(), url: normUrl(url.trim()), note: note.trim(), ts: Date.now() };
    const cur = (await sGet(`gallery_${s}`, true)) || [];
    const next = [entry, ...(Array.isArray(cur) ? cur : [])].slice(0, 200);
    await sSet(`gallery_${s}`, next, true);
    setItems(next); setTitle(""); setUrl(""); setNote(""); setBusy(false);
  };
  const remove = async (id) => {
    const cur = (await sGet(`gallery_${s}`, true)) || [];
    const next = (Array.isArray(cur) ? cur : []).filter((x) => x.id !== id);
    await sSet(`gallery_${s}`, next, true); setItems(next);
  };

  // 내 작품(또는 운영자는 아무 작품이나)을 같은 세션 모든 화면에 전체 화면으로 발표
  const present = async (it) => {
    const p = { on: true, pid: Date.now().toString(36), id: it.id, uid: me.uid, owner: it.uid, url: it.url, title: it.title || "", nick: it.nick, ts: Date.now() };
    await sSet(`present_${s}`, p, true);
    setPresented(it.id); setTimeout(() => setPresented(""), 2500);
  };

  return (
    <div className="space-y-5">
      <div className="rounded-2xl bg-gradient-to-br from-teal-600 to-emerald-700 p-6 text-white">
        <div className="flex items-center gap-2 mb-1"><Share2 size={20} /><h2 className="text-lg font-extrabold">공유 마당</h2></div>
        <p className="text-emerald-50 text-[13px] leading-relaxed">
          오늘 <b className="text-white">직접 만든 사이트의 링크</b>나 <b className="text-white">모둠에서 수합한 내용</b>을 올려 함께 보세요.
          같은 세션 코드(<b className="text-white">{s}</b>)로 입장한 연수생끼리 공유됩니다.
        </p>
      </div>

      {!shareOn ? (
        <div className="rounded-2xl bg-white border border-slate-200 p-6 text-center text-[14px] text-slate-500">
          운영자가 공유 마당을 잠시 꺼 두었어요. (운영자 페이지 → 세션 설정에서 켤 수 있습니다)
        </div>
      ) : (
        <>
          <div className="rounded-2xl bg-white border border-slate-200 p-5 space-y-3">
            <h3 className="font-extrabold text-indigo-950 text-[15px] flex items-center gap-2"><Share2 size={16} className="text-emerald-600" /> 내 결과 올리기</h3>
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="제목 (예: 우리 반 익명 칭찬 롤링페이퍼)"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 outline-none text-[15px]" />
            <div className="relative">
              <Link2 size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" />
              <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="사이트 주소 (선택)  예) my-class.web.app"
                onKeyDown={(e) => { if (e.key === "Enter") post(); }}
                className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 outline-none text-[15px]" />
            </div>
            <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={2} placeholder="한 줄 소개 또는 수합한 내용 (선택)"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 outline-none text-[14px] resize-y" />
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-slate-400">{STORAGE_OK ? "같은 세션 참여자에게 공유돼요" : "지금 환경에선 이 기기에만 저장됩니다"}</span>
              <button onClick={post} disabled={busy} className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[14px] flex items-center gap-2 disabled:opacity-50">
                <Send size={15} /> 올리기
              </button>
            </div>
          </div>

          {loaded && items.length === 0 ? (
            <div className="rounded-2xl bg-white border border-dashed border-slate-300 p-8 text-center text-[14px] text-slate-400">
              아직 올라온 공유가 없어요. 첫 번째로 결과를 올려 보세요! 🎉
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-3">
              {items.map((it) => (
                <div key={it.id} className="rounded-2xl bg-white border border-slate-200 p-4 flex flex-col">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-extrabold text-indigo-950 text-[14.5px] leading-snug">{it.title || "(제목 없음)"}</h3>
                    {it.uid === me.uid && <button onClick={() => remove(it.id)} className="text-slate-300 hover:text-rose-500 shrink-0" title="삭제"><X size={15} /></button>}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">{it.nick}{it.school ? " · " + it.school : ""}</div>
                  {it.note && <p className="text-[13px] text-slate-600 mt-2 leading-relaxed whitespace-pre-wrap">{it.note}</p>}
                  {it.url && (
                    <div className="mt-3 flex gap-2">
                      <a href={it.url} target="_blank" rel="noopener noreferrer"
                        className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-50 text-emerald-700 font-bold text-[13px] hover:bg-emerald-100">
                        사이트 열기 <ExternalLink size={13} />
                      </a>
                      {STORAGE_OK && (it.uid === me.uid || adminOk) && (
                        <button onClick={() => present(it)} title="같은 세션 모든 화면에 이 작품을 전체 화면으로 띄웁니다"
                          className={`flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg font-bold text-[13px] transition-colors ${presented === it.id ? "bg-emerald-600 text-white" : "bg-teal-600 hover:bg-teal-700 text-white"}`}>
                          {presented === it.id ? "발표 시작! 🎉" : "📺 모두에게 발표"}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
          <p className="text-[11px] text-slate-300 text-center leading-relaxed">
            여러 기기(다른 연수생)와 실시간으로 공유하려면 이 앱의 저장소를 Firebase Firestore에 연결하세요 — 오늘 배운 그 기술입니다.
          </p>
        </>
      )}
    </div>
  );
}

/* ============================================================
   LIVE QUIZ — 참여자 팝업 (세션에 퀴즈가 발사되면 모든 화면에 등장)
   ============================================================ */
function LiveQuizOverlay({ me }) {
  const s = me.session;
  const [live, setLive] = useState(null);
  const [now, setNow] = useState(Date.now());
  const [qid, setQid] = useState(null);
  const [myPick, setMyPick] = useState(null);
  const [result, setResult] = useState(null);
  const [hidden, setHidden] = useState(null);
  const [minz, setMinz] = useState(false);

  useEffect(() => {
    let on = true;
    const tick = async () => { try { const q = await sGet(`qz_live_${s}`, true); if (on) setLive(q && q.id ? q : null); } catch {} };
    tick();
    const id = setInterval(tick, 5000);
    return () => { on = false; clearInterval(id); };
  }, [s]);

  useEffect(() => { const id = setInterval(() => setNow(Date.now()), 500); return () => clearInterval(id); }, []);

  // 새 퀴즈가 발사되면 상태 초기화 + 팝업 다시 열기
  useEffect(() => {
    if (live && live.id !== qid) { setQid(live.id); setMyPick(null); setResult(null); setMinz(false); setHidden(null); }
  }, [live, qid]);

  // 정답 공개 시 내 획득 점수·순위 불러오기
  useEffect(() => {
    if (!live || live.phase !== "revealed" || result) return;
    (async () => {
      try {
        const ans = (await sGet(`qz_ans_${s}_${live.id}`, true)) || [];
        const mine = Array.isArray(ans) ? ans.find((a) => a.uid === me.uid) : null;
        const sc = (await sGet(`qz_scores_${s}`, true)) || {};
        const rows = Object.entries(sc).map(([uid, v]: [string, any]) => ({ uid, ...(v || {}) })).sort((a, b) => (b.pts || 0) - (a.pts || 0));
        const idx = rows.findIndex((r) => r.uid === me.uid);
        setResult({ pick: mine ? mine.choice : null, gain: mine ? mine.gain || 0 : 0, rank: idx >= 0 ? idx + 1 : null, myPts: idx >= 0 ? rows[idx].pts || 0 : 0, top: rows.slice(0, 5) });
      } catch {}
    })();
  }, [live, result, s, me.uid]);

  if (!STORAGE_OK || !live || hidden === live.id) return null;

  const isLive = live.phase === "live";
  const revealed = live.phase === "revealed";
  if (!isLive && !revealed) return null;
  const leftMs = live.startTs + live.dur * 1000 - now;
  const left = isLive ? Math.max(0, Math.ceil(leftMs / 1000)) : 0;
  const pct = isLive ? Math.max(0, Math.min(100, (leftMs / (live.dur * 1000)) * 100)) : 0;

  const submit = async (oi) => {
    if (myPick != null || !isLive || left <= 0) return;
    setMyPick(oi);
    try {
      const key = `qz_ans_${s}_${live.id}`;
      const cur = (await sGet(key, true)) || [];
      const arr = Array.isArray(cur) ? cur : [];
      if (!arr.some((a) => a.uid === me.uid))
        await sSet(key, [...arr, { uid: me.uid, nick: me.nick, school: me.school, choice: oi, ts: Date.now() }], true);
    } catch {}
  };

  if (minz)
    return (
      <button onClick={() => setMinz(false)} style={{ zIndex: 90 }}
        className="fixed bottom-[84px] right-4 px-4 py-3 rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-bold text-[13px] shadow-2xl flex items-center gap-2 animate-bounce">
        <Zap size={16} className="text-amber-300" /> {isLive ? `깜짝 퀴즈 진행 중! ${left}초` : "퀴즈 결과 보기 🏆"}
      </button>
    );

  return (
    <div className="fixed inset-0 bg-black/60 flex items-end sm:items-center justify-center p-3 sm:p-4" style={{ zIndex: 90 }}>
      <div className="bg-white rounded-3xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="bg-gradient-to-r from-violet-600 to-fuchsia-600 p-5 text-white relative">
          <button onClick={() => (revealed ? setHidden(live.id) : setMinz(true))} title={revealed ? "닫기" : "잠시 접어두기"}
            className="absolute right-3 top-3 w-7 h-7 rounded-lg bg-white/20 hover:bg-white/30 flex items-center justify-center"><X size={15} /></button>
          <p className="text-[11px] font-bold tracking-widest text-fuchsia-100 flex items-center gap-1.5">
            <Zap size={13} className="text-amber-300" /> 깜짝 라이브 퀴즈 · {LIVEQ_CATS[live.cat] || "퀴즈"}
          </p>
          <h3 className="text-[17px] font-extrabold leading-snug mt-2">{live.q}</h3>
          {isLive && (
            <div className="mt-3">
              <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                <div className="h-full bg-amber-400 transition-all duration-500" style={{ width: pct + "%" }} />
              </div>
              <p className="text-[11px] text-fuchsia-100 mt-1.5 font-bold">{left > 0 ? `⏱ ${left}초 남음 — 빠를수록 보너스 점수!` : "⏰ 시간 종료! 곧 결과가 공개돼요…"}</p>
            </div>
          )}
        </div>
        <div className="p-5 space-y-2.5">
          {live.o.map((o, oi) => {
            let cls = "bg-slate-50 border-slate-200 hover:border-violet-400 text-slate-700";
            if (revealed) {
              if (oi === live.a) cls = "bg-emerald-50 border-emerald-400 text-emerald-800";
              else if (result && result.pick === oi) cls = "bg-rose-50 border-rose-300 text-rose-700";
              else cls = "bg-white border-slate-100 text-slate-400";
            } else if (myPick != null) {
              cls = oi === myPick ? "bg-violet-50 border-violet-400 text-violet-800" : "bg-white border-slate-100 text-slate-400";
            } else if (left <= 0) cls = "bg-white border-slate-100 text-slate-400";
            return (
              <button key={oi} onClick={() => submit(oi)} disabled={myPick != null || !isLive || left <= 0}
                className={`w-full flex items-center gap-2.5 rounded-xl border-2 p-3 text-left text-[14px] font-semibold transition-colors ${cls}`}>
                <span className="w-6 h-6 rounded-full border flex items-center justify-center shrink-0 text-[12px] font-bold">
                  {revealed && oi === live.a ? <Check size={14} /> : String.fromCharCode(65 + oi)}
                </span>
                {o}
              </button>
            );
          })}

          {isLive && myPick != null && (
            <div className="rounded-xl bg-violet-50 border border-violet-200 p-3 text-[13px] text-violet-700 font-semibold text-center">
              제출 완료! 🚀 다른 선생님들을 기다리는 중…
            </div>
          )}

          {revealed && result && (
            <div className="space-y-3 pt-1">
              <div className={`rounded-xl p-3.5 text-center font-extrabold text-[15px] ${result.pick === live.a ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-600"}`}>
                {result.pick == null ? "이번엔 구경만 하셨네요 😉 다음 퀴즈를 노려 보세요!" :
                  result.pick === live.a ? `🎉 정답! +${result.gain}점 획득!` : "아쉬워요! 다음 기회에… 💪"}
              </div>
              {live.explain && (
                <div className="rounded-xl bg-amber-50 border border-amber-200 p-3 text-[13px] text-amber-800 leading-relaxed">💡 {live.explain}</div>
              )}
              {result.top.length > 0 && (
                <div className="rounded-xl border border-slate-200 overflow-hidden">
                  <div className="bg-slate-50 px-3 py-2 text-[12px] font-bold text-slate-500 flex items-center gap-1.5"><Trophy size={13} className="text-amber-500" /> 누적 순위</div>
                  {result.top.map((r, i) => (
                    <div key={r.uid} className={`flex items-center gap-2 px-3 py-2 text-[13px] border-t border-slate-100 ${r.uid === me.uid ? "bg-violet-50 font-bold" : ""}`}>
                      <span className="w-6 text-center">{["🥇", "🥈", "🥉"][i] || i + 1}</span>
                      <span className="flex-1 truncate">{r.nick}{r.uid === me.uid ? " (나)" : ""}</span>
                      <span className="font-mono font-bold text-violet-700">{r.pts || 0}점</span>
                    </div>
                  ))}
                  {result.rank && result.rank > 5 && (
                    <div className="flex items-center gap-2 px-3 py-2 text-[13px] border-t border-slate-100 bg-violet-50 font-bold">
                      <span className="w-6 text-center">{result.rank}</span>
                      <span className="flex-1 truncate">{me.nick} (나)</span>
                      <span className="font-mono font-bold text-violet-700">{result.myPts}점</span>
                    </div>
                  )}
                </div>
              )}
              <button onClick={() => setHidden(live.id)} className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-[13px]">닫기</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   LIVE QUIZ — 발사·채점 공용 로직 (관리 패널 + 플로팅 리모컨 공용)
   ============================================================ */
async function qzLaunch(s, item, dur) {
  const id = "q" + Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
  const quiz = { id, cat: item.cat, q: item.q, o: item.o, a: item.a, explain: item.explain || "", startTs: Date.now(), dur, phase: "live" };
  await sSet(`qz_ans_${s}_${id}`, [], true);
  await sSet(`qz_live_${s}`, quiz, true);
  return quiz;
}

// 마감: 채점(정답 100점 + 남은 시간 비례 보너스 최대 100점) → 누적 점수판 반영 → 정답 공개
async function qzFinish(s) {
  const cur = await sGet(`qz_live_${s}`, true);
  if (!cur || cur.phase !== "live") return null;
  const ans = (await sGet(`qz_ans_${s}_${cur.id}`, true)) || [];
  const arr = Array.isArray(ans) ? ans : [];
  const sc = (await sGet(`qz_scores_${s}`, true)) || {};
  arr.forEach((an) => {
    const row = sc[an.uid] || { nick: an.nick, school: an.school, pts: 0, correct: 0, played: 0 };
    row.nick = an.nick; row.played = (row.played || 0) + 1;
    if (an.choice === cur.a) {
      const elapsed = Math.max(0, (an.ts - cur.startTs) / 1000);
      an.gain = 100 + Math.round(Math.max(0, 1 - elapsed / cur.dur) * 100);
      row.pts = (row.pts || 0) + an.gain;
      row.correct = (row.correct || 0) + 1;
    } else an.gain = 0;
    sc[an.uid] = row;
  });
  await sSet(`qz_ans_${s}_${cur.id}`, arr, true);
  await sSet(`qz_scores_${s}`, sc, true);
  const done = { ...cur, phase: "revealed", endTs: Date.now() };
  await sSet(`qz_live_${s}`, done, true);
  return { done, arr, sc };
}

/* ============================================================
   LIVE QUIZ — 강사(운영자)용 발사 패널
   ============================================================ */
function LiveQuizPanel({ s, roster, flash }) {
  const [live, setLive] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [scores, setScores] = useState({});
  const [cat, setCat] = useState("all");
  const [dur, setDur] = useState(20);
  const [now, setNow] = useState(Date.now());
  const [showCustom, setShowCustom] = useState(false);
  const [cq, setCq] = useState({ q: "", o: ["", "", "", ""], a: 0, explain: "" });
  const closingRef = useRef(false);

  useEffect(() => { (async () => { const sc = (await sGet(`qz_scores_${s}`, true)) || {}; setScores(sc && typeof sc === "object" ? sc : {}); })(); }, [s]);

  useEffect(() => {
    let on = true;
    const tick = async () => {
      try {
        const q = await sGet(`qz_live_${s}`, true);
        if (!on) return;
        setLive(q && q.id ? q : null);
        if (q && q.id) { const a = (await sGet(`qz_ans_${s}_${q.id}`, true)) || []; if (on) setAnswers(Array.isArray(a) ? a : []); }
      } catch {}
    };
    tick();
    const id = setInterval(tick, 3000);
    return () => { on = false; clearInterval(id); };
  }, [s]);

  useEffect(() => { const id = setInterval(() => setNow(Date.now()), 500); return () => clearInterval(id); }, []);

  const left = live && live.phase === "live" ? Math.ceil((live.startTs + live.dur * 1000 - now) / 1000) : 0;

  const launch = async (item) => {
    closingRef.current = false;
    const quiz = await qzLaunch(s, item, dur);
    setLive(quiz); setAnswers([]);
    flash("퀴즈 발사! 🚀 참여자 화면에 곧 나타납니다.");
  };

  const finish = async () => {
    const r = await qzFinish(s);
    if (!r) return;
    setLive(r.done); setAnswers(r.arr); setScores(r.sc);
    flash("정답 공개! 점수가 합산됐어요. 🏆");
  };

  // 제한시간이 끝나면 자동 마감 (늦게 도착하는 응답을 위해 2초 여유)
  useEffect(() => {
    if (!live || live.phase !== "live") return;
    if (now > live.startTs + live.dur * 1000 + 2000 && !closingRef.current) { closingRef.current = true; finish(); }
  }, [now, live]); // eslint-disable-line

  const takeDown = async () => { await sSet(`qz_live_${s}`, null, true); setLive(null); setAnswers([]); flash("퀴즈를 내렸어요."); };
  const resetScores = async () => { await sSet(`qz_scores_${s}`, {}, true); setScores({}); flash("점수판을 초기화했어요."); };

  const rows = Object.entries(scores).map(([uid, v]: [string, any]) => ({ uid, ...(v || {}) })).sort((a, b) => (b.pts || 0) - (a.pts || 0));
  const bank = cat === "all" ? LIVEQ_BANK : LIVEQ_BANK.filter((b) => b.cat === cat);

  const launchCustom = () => {
    const opts = cq.o.map((x) => x.trim());
    if (!cq.q.trim() || opts.some((x) => !x)) { flash("질문과 보기 4개를 모두 채워 주세요."); return; }
    launch({ cat: "custom", q: cq.q.trim(), o: opts, a: cq.a, explain: cq.explain.trim() });
    setCq({ q: "", o: ["", "", "", ""], a: 0, explain: "" }); setShowCustom(false);
  };

  return (
    <div className="rounded-2xl bg-white border border-slate-200 p-5 space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h3 className="font-extrabold text-indigo-950 flex items-center gap-2"><Zap size={18} className="text-violet-500" /> 라이브 깜짝 퀴즈</h3>
        <span className="text-[11px] text-slate-400">강의 중간에 발사 → 빨리 맞출수록 높은 점수 → 세션별 누적 등수</span>
      </div>

      {live ? (
        <div className="rounded-xl border-2 border-violet-300 bg-violet-50 p-4 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-bold text-violet-500">{live.phase === "live" ? `🔴 진행 중 · ${Math.max(0, left)}초 남음` : "✅ 정답 공개됨"}</span>
            <span className="text-[11px] font-bold text-violet-500">{LIVEQ_CATS[live.cat] || ""} · {live.dur}초</span>
          </div>
          <p className="font-bold text-[14.5px] text-slate-800 leading-snug">{live.q}</p>
          <p className="text-[12px] text-emerald-700 font-semibold">정답: {String.fromCharCode(65 + live.a)}. {live.o[live.a]}</p>
          <div>
            <div className="text-[12px] font-bold text-slate-600 mb-1.5">응답 {answers.length}명 / 참여자 {roster.length}명 <span className="font-normal text-slate-400">(빨리 답한 순서)</span></div>
            <div className="flex flex-wrap gap-1.5">
              {answers.length === 0 ? <span className="text-[12px] text-slate-400">아직 응답이 없어요…</span> :
                answers.slice().sort((a, b) => a.ts - b.ts).map((a2, i) => (
                  <span key={a2.uid} className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${live.phase === "revealed" ? (a2.choice === live.a ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-600") : "bg-white border border-violet-200 text-violet-700"}`}>
                    {i + 1}. {a2.nick}{live.phase === "revealed" && a2.gain ? ` +${a2.gain}` : ""}
                  </span>
                ))}
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            {live.phase === "live" && <button onClick={finish} className="px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-[13px]">⏹ 마감 & 정답 공개</button>}
            <button onClick={takeDown} className="px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-600 font-bold text-[13px] hover:bg-slate-50">퀴즈 내리기</button>
          </div>
        </div>
      ) : (
        <>
          <div className="flex items-center gap-2 flex-wrap">
            {[["all", "전체"], ["smalltalk", LIVEQ_CATS.smalltalk], ["ai", LIVEQ_CATS.ai], ["news", LIVEQ_CATS.news]].map(([k, l]) => (
              <button key={k} onClick={() => setCat(k)} className={`px-3 py-1.5 rounded-full text-[12px] font-bold transition-colors ${cat === k ? "bg-violet-600 text-white" : "bg-slate-100 text-slate-500 hover:bg-slate-200"}`}>{l}</button>
            ))}
            <div className="ml-auto flex items-center gap-1.5">
              <span className="text-[11px] font-bold text-slate-400">제한시간</span>
              {[15, 20, 30, 45].map((d) => (
                <button key={d} onClick={() => setDur(d)} className={`px-2 py-1 rounded-lg text-[11px] font-bold ${dur === d ? "bg-amber-500 text-white" : "bg-slate-100 text-slate-500 hover:bg-slate-200"}`}>{d}초</button>
              ))}
            </div>
          </div>
          <div className="max-h-72 overflow-y-auto rounded-xl border border-slate-100 divide-y divide-slate-100">
            {bank.map((b, i) => (
              <div key={i} className="flex items-center gap-3 p-3 hover:bg-slate-50">
                <div className="min-w-0 flex-1">
                  <div className="text-[13px] font-bold text-slate-700 leading-snug">{b.q}</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">{LIVEQ_CATS[b.cat]} · 정답 {String.fromCharCode(65 + b.a)}. {b.o[b.a]}</div>
                </div>
                <button onClick={() => launch(b)} className="shrink-0 px-3 py-2 rounded-lg bg-violet-600 hover:bg-violet-700 text-white text-[12px] font-bold flex items-center gap-1"><Rocket size={12} /> 발사</button>
              </div>
            ))}
          </div>
          <button onClick={() => setShowCustom(!showCustom)} className="text-[13px] font-bold text-violet-600 flex items-center gap-1">
            {showCustom ? <ChevronDown size={14} /> : <ChevronRight size={14} />} ✏️ 직접 만들어 발사하기
          </button>
          {showCustom && (
            <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 space-y-2">
              <input value={cq.q} onChange={(e) => setCq({ ...cq, q: e.target.value })} placeholder="질문 (예: 오늘 점심, 최고의 선택은?)"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-[13px] outline-none focus:border-violet-400 bg-white" />
              {cq.o.map((o, oi) => (
                <div key={oi} className="flex items-center gap-2">
                  <button onClick={() => setCq({ ...cq, a: oi })} title="정답으로 지정"
                    className={`w-7 h-7 rounded-full shrink-0 text-[11px] font-bold transition-colors ${cq.a === oi ? "bg-emerald-500 text-white" : "bg-white border border-slate-200 text-slate-400 hover:border-emerald-400"}`}>
                    {String.fromCharCode(65 + oi)}
                  </button>
                  <input value={o} onChange={(e) => { const n = [...cq.o]; n[oi] = e.target.value; setCq({ ...cq, o: n }); }} placeholder={`보기 ${oi + 1}`}
                    className="flex-1 px-3 py-2 rounded-lg border border-slate-200 text-[13px] outline-none focus:border-violet-400 bg-white" />
                </div>
              ))}
              <input value={cq.explain} onChange={(e) => setCq({ ...cq, explain: e.target.value })} placeholder="해설 (선택)"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-[13px] outline-none focus:border-violet-400 bg-white" />
              <p className="text-[11px] text-slate-400">동그라미(A~D)를 눌러 정답을 지정하세요 · 현재 정답: {String.fromCharCode(65 + cq.a)}</p>
              <button onClick={launchCustom} className="px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-[13px] flex items-center gap-1.5"><Rocket size={13} /> 이 퀴즈 발사</button>
            </div>
          )}
        </>
      )}

      <div>
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-bold text-slate-700 text-[13.5px] flex items-center gap-1.5"><Trophy size={15} className="text-amber-500" /> 누적 점수판 (세션 {s})</h4>
          {rows.length > 0 && <button onClick={resetScores} className="text-[11px] text-rose-500 font-bold hover:underline">점수 초기화</button>}
        </div>
        {rows.length === 0 ? <p className="text-[12px] text-slate-400">아직 점수가 없어요. 첫 퀴즈를 발사해 보세요! 🚀</p> : (
          <div className="rounded-xl border border-slate-100 overflow-hidden">
            {rows.map((r, i) => (
              <div key={r.uid} className={`flex items-center gap-3 px-3.5 py-2 text-[13px] ${i % 2 ? "bg-slate-50" : "bg-white"}`}>
                <span className="w-7 text-center text-[14px]">{i < 3 ? ["🥇", "🥈", "🥉"][i] : <span className="font-mono text-[11px] text-slate-400">{i + 1}</span>}</span>
                <span className="font-bold text-slate-800 truncate">{r.nick}</span>
                <span className="text-[11px] text-slate-400 shrink-0">정답 {r.correct || 0} · 참여 {r.played || 0}</span>
                <span className="ml-auto font-mono font-extrabold text-violet-700">{r.pts || 0}점</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ============================================================
   LIVE QUIZ — 강사용 플로팅 퀴즈 리모컨
   - 운영자 인증 후 어느 페이지에서든 왼쪽 아래 ⚡ 버튼으로 껐다 켰다.
   - 강의하며 다른 탭을 보다가도 바로바로 한 문제씩 발사.
   - 발사한 문제는 ✓ 표시로 구분, 진행 중이면 마감 후 다음 문제 발사.
   ============================================================ */
function QuickQuizFab({ me }) {
  const s = me.session;
  const [open, setOpen] = useState(false);
  const [live, setLive] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [cat, setCat] = useState("smalltalk");
  const [dur, setDur] = useState(20);
  const [now, setNow] = useState(Date.now());
  const [fired, setFired] = useState(() => new Set());
  const [toast, setToast] = useState("");
  const closingRef = useRef(false);
  const flash = (t) => { setToast(t); setTimeout(() => setToast(""), 1800); };

  useEffect(() => {
    let on = true;
    const tick = async () => {
      try {
        const q = await sGet(`qz_live_${s}`, true);
        if (!on) return;
        setLive(q && q.id ? q : null);
        if (q && q.id && q.phase === "live") {
          const a = (await sGet(`qz_ans_${s}_${q.id}`, true)) || [];
          if (on) setAnswers(Array.isArray(a) ? a : []);
        }
      } catch {}
    };
    tick();
    const id = setInterval(tick, 3000);
    return () => { on = false; clearInterval(id); };
  }, [s]);

  useEffect(() => { const id = setInterval(() => setNow(Date.now()), 500); return () => clearInterval(id); }, []);

  const isLive = live && live.phase === "live";
  const left = isLive ? Math.max(0, Math.ceil((live.startTs + live.dur * 1000 - now) / 1000)) : 0;

  const finish = async () => {
    const r = await qzFinish(s);
    if (!r) return;
    setLive(r.done); setAnswers(r.arr);
    flash("정답 공개! 점수 합산 완료 🏆");
  };

  // 제한시간이 끝나면 자동 마감 (늦게 도착하는 응답을 위해 2초 여유)
  useEffect(() => {
    if (!isLive) return;
    if (now > live.startTs + live.dur * 1000 + 2000 && !closingRef.current) { closingRef.current = true; finish(); }
  }, [now, live]); // eslint-disable-line

  const launch = async (item, key) => {
    if (isLive) await qzFinish(s); // 진행 중이던 문제는 먼저 채점·마감하고 다음 문제로
    closingRef.current = false;
    const quiz = await qzLaunch(s, item, dur);
    setLive(quiz); setAnswers([]);
    setFired((p) => { const n = new Set(p); n.add(key); return n; });
    flash("발사! 🚀");
  };
  const takeDown = async () => { await sSet(`qz_live_${s}`, null, true); setLive(null); setAnswers([]); flash("퀴즈를 내렸어요."); };

  const bank = LIVEQ_BANK.map((b, i) => ({ ...b, key: `${b.cat}-${i}` })).filter((b) => (cat === "all" ? true : b.cat === cat));

  if (!STORAGE_OK) return null;

  if (!open)
    return (
      <button onClick={() => setOpen(true)} title="퀴즈 리모컨 열기" style={{ zIndex: 80 }}
        className="fixed bottom-4 left-4 w-14 h-14 rounded-full bg-violet-600 hover:bg-violet-700 text-white shadow-2xl flex items-center justify-center transition-colors">
        <Zap size={22} className="text-amber-300" />
        {isLive && <span className="absolute -top-1 -right-1 min-w-[22px] h-[22px] px-1 rounded-full bg-rose-500 text-[11px] font-bold flex items-center justify-center animate-pulse">{left}</span>}
      </button>
    );

  return (
    <div style={{ zIndex: 80 }} className="fixed bottom-4 left-4 w-[min(92vw,340px)] rounded-2xl bg-white border border-slate-200 shadow-2xl overflow-hidden flex flex-col">
      <div className="bg-gradient-to-r from-violet-600 to-fuchsia-600 px-4 py-3 text-white flex items-center gap-2">
        <Zap size={16} className="text-amber-300 shrink-0" />
        <div className="min-w-0 flex-1">
          <div className="font-extrabold text-[13.5px] leading-tight">퀴즈 리모컨</div>
          <div className="text-[10.5px] text-fuchsia-100 truncate">세션 {s} · 누르면 바로 발사돼요</div>
        </div>
        <button onClick={() => setOpen(false)} title="접기" className="w-7 h-7 rounded-lg bg-white/20 hover:bg-white/30 flex items-center justify-center shrink-0"><X size={14} /></button>
      </div>

      {toast && <div className="px-4 py-1.5 bg-emerald-50 text-emerald-700 text-[11.5px] font-bold border-b border-emerald-100">{toast}</div>}

      {live && (
        <div className={`px-4 py-2.5 border-b ${isLive ? "bg-rose-50 border-rose-100" : "bg-violet-50 border-violet-100"}`}>
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className={`text-[11px] font-bold ${isLive ? "text-rose-500" : "text-violet-500"}`}>
              {isLive ? `🔴 진행 중 · ${left}초 · 응답 ${answers.length}명` : "✅ 정답 공개됨"}
            </span>
          </div>
          <p className="text-[12px] font-bold text-slate-700 leading-snug line-clamp-2">{live.q}</p>
          <div className="flex gap-1.5 mt-2">
            {isLive && <button onClick={finish} className="px-2.5 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-700 text-white text-[11px] font-bold">⏹ 마감 & 정답</button>}
            <button onClick={takeDown} className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-500 text-[11px] font-bold hover:bg-slate-50">내리기</button>
          </div>
        </div>
      )}

      <div className="px-3 pt-2.5 pb-1.5 flex items-center gap-1 flex-wrap">
        {[["smalltalk", "☕ 스몰토크"], ["ai", "🤖 AI"], ["news", "📰 뉴스"], ["all", "전체"]].map(([k, l]) => (
          <button key={k} onClick={() => setCat(k)}
            className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition-colors ${cat === k ? "bg-violet-600 text-white" : "bg-slate-100 text-slate-500 hover:bg-slate-200"}`}>{l}</button>
        ))}
        <select value={dur} onChange={(e) => setDur(Number(e.target.value))} title="제한시간"
          className="ml-auto text-[11px] font-bold text-slate-500 bg-slate-100 rounded-lg px-1.5 py-1 outline-none">
          {[15, 20, 30, 45].map((d) => <option key={d} value={d}>{d}초</option>)}
        </select>
      </div>

      <div className="max-h-[44vh] overflow-y-auto divide-y divide-slate-100">
        {bank.map((b) => (
          <div key={b.key} className={`flex items-center gap-2 px-3 py-2 ${fired.has(b.key) ? "opacity-50" : "hover:bg-slate-50"}`}>
            <div className="min-w-0 flex-1">
              <div className="text-[12px] font-bold text-slate-700 leading-snug line-clamp-2">
                {fired.has(b.key) && <span className="text-emerald-500 mr-1">✓</span>}{b.q}
              </div>
            </div>
            <button onClick={() => launch(b, b.key)}
              className="shrink-0 w-9 h-9 rounded-lg bg-violet-600 hover:bg-violet-700 text-white flex items-center justify-center" title="이 문제 발사">
              <Rocket size={14} />
            </button>
          </div>
        ))}
      </div>
      <div className="px-3 py-1.5 bg-slate-50 border-t border-slate-100 text-[10.5px] text-slate-400">✓ = 이번에 발사한 문제 · 진행 중 발사하면 이전 문제는 자동 마감돼요</div>
    </div>
  );
}

/* ============================================================
   CAST — 강사 화면 방송 (강사가 보는 탭·용어 팝업을 참여자가 따라감)
   - 강사: 📡 버튼으로 방송 켜기/끄기. 켜면 현재 페이지가 8초 심장박동과
     함께 cast_{세션}에 기록됩니다.
   - 참여자: 방송이 켜지면 하단에 안내 바가 뜨고, 강사가 페이지를 넘길
     때마다 같은 페이지로 자동 이동(일시정지 가능).
   ============================================================ */
function CastControl({ s, me, tab, activeTerm }) {
  const [on, setOn] = useState(false);
  const lastTabRef = useRef("home");
  useEffect(() => { if (tab !== "admin") lastTabRef.current = tab; }, [tab]); // 운영자 탭은 참여자에게 안 보이니 마지막 일반 탭 유지

  useEffect(() => {
    if (!on) return;
    const payload = () => ({ on: true, tab: lastTabRef.current, term: activeTerm || null, nick: me.nick, ts: Date.now() });
    sSet(`cast_${s}`, payload(), true);
    const id = setInterval(() => sSet(`cast_${s}`, payload(), true), 8000);
    return () => clearInterval(id);
  }, [on, tab, activeTerm, s]); // eslint-disable-line

  const stop = async () => { setOn(false); try { await sSet(`cast_${s}`, { on: false, ts: Date.now() }, true); } catch {} };

  if (!STORAGE_OK) return null;
  return (
    <button onClick={on ? stop : () => setOn(true)} style={{ zIndex: 80 }} title={on ? "방송 끄기" : "내가 보는 화면을 참여자들이 따라오게 방송"}
      className={`fixed left-4 bottom-[84px] px-3.5 py-2 rounded-full shadow-2xl text-[12px] font-bold flex items-center gap-1.5 transition-colors ${on ? "bg-rose-500 text-white" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"}`}>
      <span className={on ? "animate-pulse" : ""}>📡</span> {on ? "방송 중 · 끄기" : "화면 방송"}
    </button>
  );
}

function FollowCast({ me, setTab, setActiveTerm }) {
  const s = me.session;
  const [cast, setCast] = useState(null);
  const [follow, setFollow] = useState(true);
  const appliedRef = useRef({ tab: null, term: null });

  useEffect(() => {
    let on = true;
    const tick = async () => {
      try {
        const c = await sGet(`cast_${s}`, true);
        if (!on) return;
        const active = c && c.on && Date.now() - (c.ts || 0) < 30000;
        setCast(active ? c : null);
      } catch {}
    };
    tick();
    const id = setInterval(tick, 3000);
    return () => { on = false; clearInterval(id); };
  }, [s]);

  // 강사가 '바꾼 것'만 따라감 — 참여자가 스스로 이동한 건 강사가 다음으로 넘길 때까지 존중
  useEffect(() => {
    if (!cast || !follow) return;
    const ap = appliedRef.current;
    if (cast.tab && cast.tab !== ap.tab) { setTab(cast.tab); ap.tab = cast.tab; }
    const term = cast.term || null;
    if (term !== ap.term) { setActiveTerm(term); ap.term = term; }
  }, [cast, follow]); // eslint-disable-line

  if (!STORAGE_OK || !cast) return null;
  return (
    <div style={{ zIndex: 75 }} className="fixed bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-950 text-white shadow-2xl text-[12px] font-bold whitespace-nowrap">
      <span className="animate-pulse">📡</span>
      {follow ? `${cast.nick || "강사"} 선생님 화면과 함께 보는 중` : "따라가기 일시정지됨"}
      <button onClick={() => setFollow(!follow)}
        className={`ml-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${follow ? "bg-white/15 hover:bg-white/25 text-indigo-100" : "bg-amber-500 hover:bg-amber-600 text-white"}`}>
        {follow ? "일시정지" : "다시 따라가기"}
      </button>
    </div>
  );
}

/* ============================================================
   PRESENT — 공유 작품 발표 모드
   - 공유 마당에서 '모두에게 발표'를 누르면 그 사이트가 같은 세션 모든
     화면에 전체 화면(iframe)으로 실시간 표시됩니다.
   - 발표자·운영자는 끝내기 가능, 참여자는 접어두기 가능.
   ============================================================ */
function PresentOverlay({ me, adminOk }) {
  const s = me.session;
  const [pr, setPr] = useState(null);
  const [min, setMin] = useState(false);
  const seenRef = useRef(null);

  useEffect(() => {
    let on = true;
    const tick = async () => {
      try {
        const p = await sGet(`present_${s}`, true);
        if (!on) return;
        const active = p && p.on && p.url && Date.now() - (p.ts || 0) < 45000;
        setPr(active ? p : null);
      } catch {}
    };
    tick();
    const id = setInterval(tick, 4000);
    return () => { on = false; clearInterval(id); };
  }, [s]);

  // 새 발표가 시작되면 접어둔 상태 해제
  useEffect(() => { if (pr && pr.pid !== seenRef.current) { seenRef.current = pr.pid; setMin(false); } }, [pr]);

  const canEnd = pr && (pr.uid === me.uid || adminOk);

  // 발표자(또는 운영자)가 접속해 있는 동안만 발표 유지 — 심장박동으로 갱신
  useEffect(() => {
    if (!pr || !canEnd) return;
    const id = setInterval(() => { try { sSet(`present_${s}`, { ...pr, ts: Date.now() }, true); } catch {} }, 10000);
    return () => clearInterval(id);
  }, [pr && pr.pid, canEnd]); // eslint-disable-line

  if (!STORAGE_OK || !pr) return null;

  const end = async () => { try { await sSet(`present_${s}`, { on: false, ts: Date.now() }, true); } catch {} setPr(null); };

  if (min)
    return (
      <button onClick={() => setMin(false)} style={{ zIndex: 70 }}
        className="fixed bottom-4 left-1/2 -translate-x-1/2 px-4 py-2.5 rounded-full bg-gradient-to-r from-teal-600 to-emerald-600 text-white font-bold text-[12.5px] shadow-2xl flex items-center gap-2 whitespace-nowrap">
        📺 {pr.nick} 선생님 발표 진행 중 — 다시 열기
      </button>
    );

  return (
    <div style={{ zIndex: 70 }} className="fixed inset-0 bg-black/70 flex flex-col p-2 sm:p-4">
      <div className="bg-white rounded-2xl flex-1 flex flex-col overflow-hidden w-full max-w-6xl mx-auto shadow-2xl">
        <div className="bg-gradient-to-r from-teal-600 to-emerald-600 px-4 py-2.5 text-white flex items-center gap-2">
          <span className="text-[16px]">📺</span>
          <div className="min-w-0 flex-1">
            <div className="font-extrabold text-[13.5px] leading-tight truncate">{pr.title || "작품 발표"}</div>
            <div className="text-[10.5px] text-emerald-100 truncate">{pr.nick} 선생님의 바이브 코딩 작품 · 실시간 발표</div>
          </div>
          <a href={pr.url} target="_blank" rel="noopener noreferrer" title="새 탭에서 열기"
            className="w-8 h-8 rounded-lg bg-white/20 hover:bg-white/30 flex items-center justify-center shrink-0"><ExternalLink size={14} /></a>
          {canEnd && (
            <button onClick={end} className="px-3 py-1.5 rounded-lg bg-rose-500 hover:bg-rose-600 text-white text-[11.5px] font-bold shrink-0">발표 끝내기</button>
          )}
          <button onClick={() => setMin(true)} title="잠시 접어두기"
            className="w-8 h-8 rounded-lg bg-white/20 hover:bg-white/30 flex items-center justify-center shrink-0"><X size={15} /></button>
        </div>
        <iframe src={pr.url} title="작품 발표" className="flex-1 w-full border-0 bg-white" sandbox="allow-scripts allow-same-origin allow-forms allow-popups" />
        <div className="px-4 py-1.5 bg-slate-50 border-t border-slate-100 text-[10.5px] text-slate-400">
          화면이 비어 보이면 해당 사이트가 화면 삽입을 막은 거예요 — 오른쪽 위 ↗ 버튼으로 새 탭에서 열어 주세요.
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   CHAT — 세션 전체 채팅 (오른쪽 아래 💬 버튼)
   - 같은 세션의 모든 선생님·강사가 함께 쓰는 실시간 채팅.
   - 주소(URL)를 보내면 자동으로 클릭 가능한 링크가 됩니다.
   - 저장 키: chat_{세션} (최근 200개 유지)
   ============================================================ */
function linkify(text) {
  const re = /(https?:\/\/\S+|\b[\w.-]+\.(?:web\.app|netlify\.app|firebaseapp\.com|github\.io|vercel\.app|co\.kr|com|net|org|kr)(?:\/\S*)?)/gi;
  const out = []; let last = 0, m, i = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index));
    const raw = m[0];
    const href = /^https?:\/\//i.test(raw) ? raw : "https://" + raw;
    out.push(<a key={i++} href={href} target="_blank" rel="noopener noreferrer" className="underline font-bold break-all hover:opacity-80">{raw}</a>);
    last = re.lastIndex;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

function ChatFab({ me }) {
  const s = me.session;
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState([]);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const seenRef = useRef(Date.now());
  const boxRef = useRef(null);
  const openRef = useRef(false);
  openRef.current = open;

  useEffect(() => {
    let on = true;
    const tick = async () => {
      try {
        const c = await sGet(`chat_${s}`, true);
        if (!on) return;
        const arr = Array.isArray(c) ? c : [];
        setMsgs(arr);
        if (openRef.current && arr.length) seenRef.current = Math.max(seenRef.current, arr[arr.length - 1].ts || 0);
      } catch {}
    };
    tick();
    const id = setInterval(tick, 3500);
    return () => { on = false; clearInterval(id); };
  }, [s]);

  // 열려 있으면 새 메시지 때 맨 아래로 스크롤
  useEffect(() => {
    if (open && boxRef.current) boxRef.current.scrollTop = boxRef.current.scrollHeight;
    if (open && msgs.length) seenRef.current = Math.max(seenRef.current, msgs[msgs.length - 1].ts || 0);
  }, [open, msgs]);

  const unread = open ? 0 : msgs.filter((m) => (m.ts || 0) > seenRef.current && m.uid !== me.uid).length;

  const send = async () => {
    const t = text.trim();
    if (!t || busy) return;
    setBusy(true);
    try {
      const entry = { id: Date.now() + "-" + Math.random().toString(36).slice(2, 6), uid: me.uid, nick: me.nick, text: t.slice(0, 500), ts: Date.now() };
      const cur = (await sGet(`chat_${s}`, true)) || [];
      const next = [...(Array.isArray(cur) ? cur : []), entry].slice(-200);
      await sSet(`chat_${s}`, next, true);
      setMsgs(next); setText("");
      seenRef.current = entry.ts;
    } catch {}
    setBusy(false);
  };

  if (!STORAGE_OK) return null;

  if (!open)
    return (
      <button onClick={() => setOpen(true)} title="세션 채팅 열기" style={{ zIndex: 60 }}
        className="fixed bottom-4 right-4 w-14 h-14 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-2xl flex items-center justify-center transition-colors">
        <MessageSquare size={22} />
        {unread > 0 && <span className="absolute -top-1 -right-1 min-w-[22px] h-[22px] px-1 rounded-full bg-rose-500 text-[11px] font-bold flex items-center justify-center animate-pulse">{unread > 99 ? "99+" : unread}</span>}
      </button>
    );

  return (
    <div style={{ zIndex: 60 }} className="fixed bottom-4 right-4 w-[min(92vw,340px)] h-[min(70vh,480px)] rounded-2xl bg-white border border-slate-200 shadow-2xl flex flex-col overflow-hidden">
      <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 px-4 py-3 text-white flex items-center gap-2 shrink-0">
        <MessageSquare size={16} className="shrink-0" />
        <div className="min-w-0 flex-1">
          <div className="font-extrabold text-[13.5px] leading-tight">세션 채팅</div>
          <div className="text-[10.5px] text-indigo-200 truncate">세션 {s} · 같은 세션 선생님 모두에게 보여요</div>
        </div>
        <button onClick={() => setOpen(false)} title="접기" className="w-7 h-7 rounded-lg bg-white/20 hover:bg-white/30 flex items-center justify-center shrink-0"><X size={14} /></button>
      </div>

      <div ref={boxRef} className="flex-1 overflow-y-auto px-3 py-3 space-y-2.5 bg-slate-50">
        {msgs.length === 0 ? (
          <p className="text-[12px] text-slate-400 text-center pt-8 leading-relaxed">아직 메시지가 없어요.<br />첫 인사를 남겨 보세요! 👋</p>
        ) : msgs.map((m) => {
          const mine = m.uid === me.uid;
          return (
            <div key={m.id} className={`flex flex-col ${mine ? "items-end" : "items-start"}`}>
              {!mine && <span className="text-[10.5px] font-bold text-slate-400 mb-0.5 px-1">{m.nick}</span>}
              <div className={`max-w-[85%] px-3 py-2 rounded-2xl text-[13px] leading-relaxed whitespace-pre-wrap break-words ${mine ? "bg-indigo-600 text-white rounded-br-md" : "bg-white border border-slate-200 text-slate-700 rounded-bl-md"}`}>
                {linkify(m.text || "")}
              </div>
              <span className="text-[9.5px] text-slate-300 mt-0.5 px-1">{new Date(m.ts).toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" })}</span>
            </div>
          );
        })}
      </div>

      <div className="p-2.5 bg-white border-t border-slate-100 flex items-center gap-2 shrink-0">
        <input value={text} onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.nativeEvent.isComposing) send(); }}
          placeholder="메시지 또는 주소 입력…"
          className="flex-1 px-3 py-2 rounded-xl border border-slate-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none text-[13px]" />
        <button onClick={send} disabled={busy || !text.trim()}
          className="w-10 h-10 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center disabled:opacity-40 shrink-0" title="보내기">
          <Send size={15} />
        </button>
      </div>
    </div>
  );
}

/* ============================================================
   ADMIN — 운영자(슈퍼관리자) 페이지 (비밀번호 보호)
   ============================================================ */
function AdminView({ me, setTab, onAuthed, preAuthed }) {
  const s = me.session;
  const [stored, setStored] = useState(undefined); // undefined=loading, null=none, string=set
  const [pwInput, setPwInput] = useState("");
  const [authed, setAuthed] = useState(!!preAuthed); // 이번 브라우저 세션에서 이미 인증했으면 바로 입장
  const [showPw, setShowPw] = useState(false);
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");
  const [roster, setRoster] = useState([]);
  const [mail, setMail] = useState([]);
  const [gallery, setGallery] = useState([]);
  const [stSchool, setStSchool] = useState("서울미술고등학교");
  const [stSection, setStSection] = useState("");
  const [stNotice, setStNotice] = useState("");
  const [stShareOn, setStShareOn] = useState(true);

  useEffect(() => { (async () => { const p = await sGet(`adminpw_${s}`, true); setStored(p ? String(p) : null); })(); }, [s]);
  const loadData = async () => {
    const r = await sGet(`roster_${s}`, true); const m = await sGet(`mailbox_${s}`, true); const g = await sGet(`gallery_${s}`, true);
    setRoster(Array.isArray(r) ? r : []); setMail(Array.isArray(m) ? m : []); setGallery(Array.isArray(g) ? g : []);
    const st = (await sGet(`settings_${s}`, true)) || {};
    setStSchool(st.school || "서울미술고등학교"); setStSection(st.section || ""); setStNotice(st.notice || ""); setStShareOn(st.shareOn !== false);
  };
  useEffect(() => { if (authed) loadData(); }, [authed]);
  const flash = (t) => { setMsg(t); setTimeout(() => setMsg(""), 2000); };

  const setPassword = async () => {
    const p = pwInput.trim();
    if (p.length < 4) { setErr("4자 이상으로 정해 주세요."); return; }
    await sSet(`adminpw_${s}`, p, true); setStored(p); setAuthed(true); setErr(""); setPwInput("");
    onAuthed && onAuthed();
    if (p === MASTER_PW) flash("환영합니다, 황미란 선생님! 🎨");
  };
  const enter = () => {
    const p = pwInput.trim();
    if (p === stored || p === MASTER_PW) {
      setAuthed(true); setErr(""); setPwInput("");
      onAuthed && onAuthed();
      if (p === MASTER_PW) flash("환영합니다, 황미란 선생님! 🎨");
    } else setErr("비밀번호가 일치하지 않아요.");
  };
  const clearMail = async () => { await sSet(`mailbox_${s}`, [], true); setMail([]); flash("수합된 의견을 비웠어요."); };
  const clearRoster = async () => { await sSet(`roster_${s}`, [], true); setRoster([]); flash("참여자 명단을 비웠어요."); };
  const clearGallery = async () => { await sSet(`gallery_${s}`, [], true); setGallery([]); flash("공유 마당을 비웠어요."); };
  const resetPw = async () => { await sSet(`adminpw_${s}`, "", true); setStored(null); setAuthed(false); flash("비밀번호를 초기화했어요."); };
  const saveSettings = async () => {
    await sSet(`settings_${s}`, { school: stSchool.trim(), section: stSection.trim(), notice: stNotice.trim(), shareOn: stShareOn }, true);
    flash("세션 설정을 저장했어요.");
  };
  const copyCode = async () => { try { await navigator.clipboard.writeText(s); flash("세션 코드를 복사했어요."); } catch { flash("복사 실패 — 직접 입력해 주세요."); } };

  const Header = () => (
    <div className="rounded-2xl bg-gradient-to-br from-indigo-950 to-indigo-800 p-6 text-white">
      <div className="flex items-center gap-2 mb-1"><Lock size={20} className="text-amber-400" /><h2 className="text-lg font-extrabold">운영자 페이지</h2></div>
      <p className="text-indigo-200 text-[13px]">세션 {s} · 강사/운영자 전용 공간</p>
    </div>
  );

  if (stored === undefined)
    return <div className="space-y-5"><Header /><div className="text-center text-slate-400 py-8 text-[14px]">불러오는 중…</div></div>;

  if (!STORAGE_OK)
    return (
      <div className="space-y-5">
        <Header />
        <div className="rounded-2xl bg-white border border-slate-200 p-6 text-[14px] text-slate-600 leading-relaxed">
          운영자 페이지의 참여자·의견 열람과 비밀번호 기능은 <b>공유 저장 환경</b>에서 작동합니다. 지금 환경에서는 기능이 제한돼요.
          <button onClick={() => setTab("home")} className="mt-4 block text-indigo-600 font-semibold">← 홈으로</button>
        </div>
      </div>
    );

  if (!authed) {
    const isSet = !!stored;
    return (
      <div className="space-y-5">
        <Header />
        <div className="rounded-2xl bg-white border border-slate-200 p-6 max-w-md mx-auto">
          <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center mb-4"><Shield size={24} /></div>
          <h3 className="font-extrabold text-indigo-950 text-[17px]">{isSet ? "비밀번호 입력" : "운영자 비밀번호 설정"}</h3>
          <p className="text-[13px] text-slate-500 mt-1 mb-4 leading-relaxed">
            {isSet ? "이 세션의 운영자 비밀번호를 입력하세요." : "이 세션의 운영자 비밀번호를 처음으로 정해 주세요. (같은 세션의 운영자와 공유됩니다)"}
          </p>
          <div className="relative">
            <input type={showPw ? "text" : "password"} value={pwInput} onChange={(e) => setPwInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") (isSet ? enter() : setPassword()); }} placeholder="비밀번호 (4자 이상)"
              className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none text-[15px]" />
            <button onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">{showPw ? <EyeOff size={16} /> : <Eye size={16} />}</button>
          </div>
          {err && <p className="text-[12px] text-rose-600 mt-2">{err}</p>}
          <button onClick={isSet ? enter : setPassword}
            className="mt-4 w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold flex items-center justify-center gap-2">
            {isSet ? <>입장 <ArrowRight size={16} /></> : <>비밀번호 설정 <Check size={16} /></>}
          </button>
          <div className="mt-4 rounded-xl bg-amber-50 border border-amber-200 p-3 text-[12px] text-amber-700 leading-relaxed">
            ⚠ 이 비밀번호는 <b>교실용 간단 잠금</b>이에요. 진짜 서비스 보안은 오늘 배우는 <b>Firebase 인증·보안 규칙</b>으로 합니다. 실제로 쓰는 비밀번호를 재사용하지 마세요.
          </div>
          <button onClick={() => setTab("home")} className="mt-3 w-full text-center text-[13px] text-slate-400 hover:text-indigo-600">← 학습으로 돌아가기</button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <Header />
      {msg && <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-[13px] text-emerald-700 flex items-center gap-2"><Check size={15} /> {msg}</div>}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[{ Icon: Users, n: roster.length, t: "참여자" }, { Icon: Inbox, n: mail.length, t: "수합 의견" }, { Icon: Share2, n: gallery.length, t: "공유글" }, { Icon: Shield, n: "ON", t: "비밀번호 보호" }].map(({ Icon, n, t }, i) => (
          <div key={i} className="rounded-2xl bg-white border border-slate-200 p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center"><Icon size={20} /></div>
            <div><div className="text-xl font-extrabold text-indigo-950">{n}</div><div className="text-[11px] text-slate-400">{t}</div></div>
          </div>
        ))}
      </div>

      {/* 라이브 깜짝 퀴즈 — 강의 중간 재미요소 */}
      <LiveQuizPanel s={s} roster={roster} flash={flash} />

      {/* 세션 설정 */}
      <div className="rounded-2xl bg-white border border-slate-200 p-5 space-y-3">
        <h3 className="font-extrabold text-indigo-950 flex items-center gap-2"><Sliders size={18} className="text-indigo-500" /> 세션 설정</h3>
        <div className="rounded-xl bg-indigo-50 border border-indigo-100 p-3 flex items-center justify-between gap-2">
          <div className="min-w-0">
            <div className="text-[11px] text-indigo-400 font-bold">현재 세션 코드 (참여자에게 공유)</div>
            <div className="text-[18px] font-extrabold text-indigo-800 font-mono tracking-wider truncate">{s}</div>
          </div>
          <button onClick={copyCode} className="px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-[12px] font-bold flex items-center gap-1.5 shrink-0"><Copy size={13} /> 복사</button>
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[12px] font-bold text-slate-600 mb-1">학교/기관명</label>
            <input value={stSchool} onChange={(e) => setStSchool(e.target.value)} placeholder="서울미술고등학교"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none text-[14px]" />
          </div>
          <div>
            <label className="block text-[12px] font-bold text-slate-600 mb-1">섹션 코드 / 반 이름</label>
            <input value={stSection} onChange={(e) => setStSection(e.target.value)} placeholder="예) 1학년 A반 · 2일차"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none text-[14px]" />
          </div>
        </div>
        <div>
          <label className="block text-[12px] font-bold text-slate-600 mb-1">공지 문구 (홈 화면에 표시)</label>
          <textarea value={stNotice} onChange={(e) => setStNotice(e.target.value)} rows={2} placeholder="예) 오늘 목표는 ‘익명 의견 우체통’ 완성하기! 점심 후 13시 재개합니다."
            className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none text-[14px] resize-y" />
        </div>
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <button onClick={() => setStShareOn(!stShareOn)} className="inline-flex items-center gap-2 text-[13px] font-semibold text-slate-700">
            <span className={`w-10 h-6 rounded-full transition-colors relative ${stShareOn ? "bg-emerald-500" : "bg-slate-300"}`}>
              <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all ${stShareOn ? "left-[18px]" : "left-0.5"}`} />
            </span>
            공유 마당 {stShareOn ? "켜짐" : "꺼짐"}
          </button>
          <button onClick={saveSettings} className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[13px] flex items-center gap-2"><Check size={15} /> 설정 저장</button>
        </div>
        <p className="text-[11px] text-slate-400">학교/기관명·섹션·공지는 홈 화면 안내로 표시됩니다. 공유 마당을 끄면 연수생 공유 페이지가 잠깁니다.</p>
      </div>

      <div className="rounded-2xl bg-white border border-slate-200 p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-extrabold text-indigo-950 flex items-center gap-2"><Users size={18} className="text-amber-500" /> 함께한 사람들</h3>
          <button onClick={loadData} className="text-[12px] text-slate-400 hover:text-indigo-600 flex items-center gap-1"><RefreshCw size={12} /> 새로고침</button>
        </div>
        {roster.length === 0 ? <p className="text-[13px] text-slate-400">아직 참여자가 없어요.</p> : (
          <div className="rounded-xl border border-slate-100 overflow-hidden">
            {roster.slice().sort((a, b) => a.ts - b.ts).map((p, i) => (
              <div key={p.uid} className={`flex items-center gap-3 px-4 py-2.5 text-[13px] ${i % 2 ? "bg-slate-50" : "bg-white"}`}>
                <span className="font-mono text-[11px] text-slate-300 w-6">{i + 1}</span>
                <span className="font-bold text-slate-800">{p.nick}</span>
                <span className="text-slate-400">{p.school}</span>
                <span className="ml-auto font-mono text-[10px] text-slate-300">{p.uid.slice(0, 6)}…</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-2xl bg-white border border-slate-200 p-5">
        <h3 className="font-extrabold text-indigo-950 flex items-center gap-2 mb-1"><Inbox size={18} className="text-emerald-500" /> 익명 의견 열람</h3>
        <p className="text-[12px] text-slate-400 mb-3">실제 앱에서는 운영자만 콘솔에서 보는 영역이에요. 작성자는 익명 ID로만 구분됩니다.</p>
        {mail.length === 0 ? <p className="text-[13px] text-slate-400">아직 모인 의견이 없어요.</p> : (
          <div className="space-y-2">
            {mail.slice().sort((a, b) => a.ts - b.ts).map((m, i) => (
              <div key={i} className="rounded-lg bg-slate-50 border border-slate-100 p-3 text-[14px] text-slate-700">
                {m.text} <span className="text-[10px] text-slate-300 font-mono ml-1">({m.uid.slice(0, 5)}…)</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-2xl bg-rose-50 border border-rose-200 p-5">
        <h3 className="font-bold text-rose-700 flex items-center gap-2 mb-1 text-[14px]"><AlertTriangle size={16} /> 데이터 관리</h3>
        <p className="text-[12px] text-rose-500 mb-3">되돌릴 수 없어요. 연수가 끝난 뒤 정리할 때 사용하세요.</p>
        <div className="flex flex-wrap gap-2">
          <button onClick={clearMail} className="px-3 py-2 rounded-lg bg-white border border-rose-200 text-rose-600 text-[12px] font-bold hover:bg-rose-100">의견 비우기</button>
          <button onClick={clearGallery} className="px-3 py-2 rounded-lg bg-white border border-rose-200 text-rose-600 text-[12px] font-bold hover:bg-rose-100">공유 마당 비우기</button>
          <button onClick={clearRoster} className="px-3 py-2 rounded-lg bg-white border border-rose-200 text-rose-600 text-[12px] font-bold hover:bg-rose-100">참여자 명단 비우기</button>
          <button onClick={resetPw} className="px-3 py-2 rounded-lg bg-white border border-rose-200 text-rose-600 text-[12px] font-bold hover:bg-rose-100">비밀번호 초기화</button>
        </div>
      </div>

      <button onClick={() => setTab("home")} className="w-full text-center text-[13px] text-slate-400 hover:text-indigo-600 flex items-center justify-center gap-1"><ArrowLeft size={14} /> 학습으로 돌아가기</button>
    </div>
  );
}

/* ============================================================
   GLOBAL STYLE — 마인드맵(mm-*) · IDE(ide-*) · 공통
   ============================================================ */
function GlobalStyle() {
  return (
    <style>{`
.no-scrollbar{scrollbar-width:none;-ms-overflow-style:none;}
.no-scrollbar::-webkit-scrollbar{display:none;}

/* ===== MIND MAP ===== */
.mm-root{width:100%;}
.mm-grid{display:grid;grid-template-columns:1fr;gap:16px;}
@media(min-width:760px){.mm-grid{grid-template-columns:210px minmax(0,1fr);align-items:start;}.mm-side{grid-column:1 / -1;}}
@media(min-width:1080px){.mm-grid{grid-template-columns:200px minmax(0,1fr) minmax(250px,0.82fr);}.mm-side{grid-column:auto;}}
.mm-flow{display:flex;flex-direction:column;background:#fff;border:1px solid #e2e8f0;border-radius:16px;padding:14px 12px;align-self:start;}
.mm-flow-h{display:flex;align-items:center;gap:6px;font-size:13px;font-weight:800;color:#1e293b;margin-bottom:8px;}
.mm-flow-h svg{color:#6366f1;}
.mm-flow-prog{margin-left:auto;font-size:10.5px;font-weight:700;color:#94a3b8;background:#f1f5f9;border-radius:999px;padding:2px 8px;font-family:ui-monospace,monospace;}
.mm-flow-bar{height:6px;background:#eef2ff;border-radius:999px;overflow:hidden;margin-bottom:10px;}
.mm-flow-fill{height:100%;background:linear-gradient(90deg,#10b981,#f59e0b);transition:width .4s;}
.mm-flow-start{width:100%;display:inline-flex;align-items:center;justify-content:center;gap:6px;background:#eef2ff;color:#4338ca;border:none;border-radius:9px;padding:8px;font-size:12px;font-weight:800;cursor:pointer;margin-bottom:10px;}
.mm-flow-start:hover{background:#e0e7ff;}
.mm-flow-list{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:3px;}
.mm-flow-area{width:100%;display:flex;align-items:center;gap:8px;background:transparent;border:1px solid transparent;border-radius:9px;padding:8px;cursor:pointer;text-align:left;transition:background .12s;}
.mm-flow-area:hover{background:#f8fafc;}
.mm-flow-area.on{background:#f8fafc;}
.mm-flow-no{flex:none;width:20px;height:20px;border-radius:6px;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:800;}
.mm-flow-area-tx{flex:1;min-width:0;font-size:12.5px;color:#334155;font-weight:700;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
.mm-flow-cnt{flex:none;font-size:10px;font-weight:700;color:#94a3b8;font-family:ui-monospace,monospace;}
.mm-flow-sub{list-style:none;margin:2px 0 6px 18px;padding:0 0 0 8px;display:flex;flex-direction:column;gap:2px;border-left:2px solid #eef2ff;}
.mm-flow-leaf{width:100%;display:flex;align-items:flex-start;gap:7px;background:transparent;border:none;border-radius:7px;padding:6px 7px;cursor:pointer;text-align:left;}
.mm-flow-leaf:hover{background:#f1f5f9;}
.mm-flow-leaf.here{background:#eef2ff;}
.mm-flow-leaf-no{flex:none;width:17px;height:17px;border-radius:5px;background:#f1f5f9;color:#94a3b8;font-size:10px;font-weight:800;display:flex;align-items:center;justify-content:center;margin-top:1px;}
.mm-flow-leaf.done .mm-flow-leaf-no{background:#d1fae5;color:#059669;}
.mm-flow-leaf.here .mm-flow-leaf-no{background:#6366f1;color:#fff;}
.mm-flow-leaf-tx{flex:1;min-width:0;font-size:12px;line-height:1.4;color:#475569;}
.mm-flow-leaf.here .mm-flow-leaf-tx{color:#3730a3;font-weight:700;}

.mm-stage-col{min-width:0;}
.mm-crumb{display:flex;align-items:center;gap:8px;font-size:13px;margin-bottom:10px;flex-wrap:wrap;}
.mm-crumb-here{display:inline-flex;align-items:center;gap:5px;font-weight:700;color:#475569;}
.mm-crumb-sep{color:#cbd5e1;}
.mm-back{display:inline-flex;align-items:center;gap:4px;font-weight:700;color:#4f46e5;background:#eef2ff;border:none;padding:5px 10px;border-radius:8px;cursor:pointer;}
.mm-back:hover{background:#e0e7ff;}

.mm-switch{display:flex;gap:7px;justify-content:center;margin-bottom:10px;flex-wrap:wrap;}
.mm-switch-dot{width:12px;height:12px;border-radius:50%;border:2px solid var(--c);background:transparent;cursor:pointer;opacity:.45;transition:opacity .15s,transform .15s,box-shadow .15s;padding:0;}
.mm-switch-dot:hover{opacity:1;transform:scale(1.25);}
.mm-switch-dot.on{background:var(--c);opacity:1;box-shadow:0 0 0 3px rgba(99,102,241,.18);}

.mm-stage{position:relative;width:100%;max-width:560px;margin:0 auto;aspect-ratio:1/1;border-radius:24px;background:radial-gradient(circle at 50% 50%,#ffffff 0%,#f8fafc 58%,#eef2ff 100%);border:1px solid #e2e8f0;overflow:hidden;}
.mm-wires{position:absolute;inset:0;width:100%;height:100%;z-index:1;pointer-events:none;}
.mm-wire{stroke-linecap:round;animation:mm-draw .7s ease forwards;}
@keyframes mm-draw{from{stroke-dasharray:1;stroke-dashoffset:1;}to{stroke-dasharray:1;stroke-dashoffset:0;}}

.mm-hub{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:108px;height:108px;border-radius:50%;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1px;background:linear-gradient(135deg,#1e1b4b,#3730a3);color:#fff;border:none;box-shadow:0 10px 30px rgba(30,27,75,.4);z-index:5;text-align:center;padding:6px;}
.mm-hub-ic{color:#fbbf24;margin-bottom:2px;}
.mm-hub-k{font-size:13px;font-weight:800;line-height:1.1;}
.mm-hub-s{font-size:10px;color:#c7d2fe;}
.mm-hub-branch{cursor:pointer;background:#fff;border:3px solid var(--c);width:98px;height:98px;box-shadow:0 8px 24px rgba(2,6,23,.18);transition:transform .15s;}
.mm-hub-branch .mm-hub-ic{color:var(--c);}
.mm-hub-branch .mm-hub-k{color:#0f172a;}
.mm-hub-branch .mm-hub-s{color:#64748b;}
.mm-hub-branch:hover{transform:translate(-50%,-50%) scale(1.06);}

.mm-node{position:absolute;transform:translate(-50%,-50%);display:flex;flex-direction:column;align-items:center;gap:5px;width:88px;background:none;border:none;cursor:pointer;z-index:3;animation:mm-pop .45s cubic-bezier(.2,.85,.35,1.2) both;padding:0;}
.mm-node-ic{position:relative;width:48px;height:48px;border-radius:50%;display:flex;align-items:center;justify-content:center;background:#fff;color:var(--c);border:2px solid var(--c);box-shadow:0 4px 12px rgba(2,6,23,.1);transition:transform .15s,box-shadow .15s;}
.mm-node:hover .mm-node-ic{transform:scale(1.12);box-shadow:0 8px 20px rgba(2,6,23,.2);}
.mm-node:active .mm-node-ic{transform:scale(.96);}
.mm-node-tx{font-size:11px;font-weight:700;color:#334155;line-height:1.2;text-align:center;max-width:90px;}
.mm-child .mm-node-ic{width:42px;height:42px;background:var(--soft);}
.mm-node-chk{position:absolute;top:-3px;right:-3px;width:17px;height:17px;border-radius:50%;background:#10b981;color:#fff;display:flex;align-items:center;justify-content:center;border:2px solid #fff;}
@keyframes mm-pop{from{opacity:0;transform:translate(-50%,-50%) scale(.4);}to{opacity:1;transform:translate(-50%,-50%) scale(1);}}

.mm-hint{text-align:center;font-size:12px;color:#94a3b8;margin-top:12px;}

.mm-side{display:flex;flex-direction:column;gap:14px;}
.mm-side-card{background:#fff;border:1px solid #e2e8f0;border-top:3px solid #4f46e5;border-radius:16px;padding:18px;}
.mm-side-title{font-size:18px;font-weight:800;color:#1e1b4b;display:flex;align-items:baseline;gap:8px;flex-wrap:wrap;}
.mm-side-sub{font-size:12px;font-weight:600;color:#94a3b8;}
.mm-side-desc{font-size:13.5px;line-height:1.65;color:#64748b;margin-top:8px;}
.mm-tag{display:inline-block;font-size:12px;font-weight:700;padding:3px 10px;border-radius:999px;margin-top:8px;}
.mm-back2{display:inline-flex;align-items:center;gap:4px;font-size:12px;font-weight:700;color:#4f46e5;background:none;border:none;padding:0;cursor:pointer;margin-bottom:8px;}
.mm-back2:hover{color:#4338ca;}

.mm-prog{margin-top:14px;display:flex;align-items:center;gap:10px;}
.mm-prog-bar{flex:1;height:7px;background:#eef2ff;border-radius:999px;overflow:hidden;}
.mm-prog-fill{height:100%;background:linear-gradient(90deg,#10b981,#f59e0b);transition:width .4s;}
.mm-prog-tx{font-size:11px;color:#94a3b8;font-weight:600;white-space:nowrap;}

.mm-legend{background:#fff;border:1px solid #e2e8f0;border-radius:16px;overflow:hidden;}
.mm-leg{display:flex;align-items:center;gap:12px;width:100%;padding:12px 14px;background:none;border:none;border-bottom:1px solid #f1f5f9;cursor:pointer;text-align:left;transition:background .12s;}
.mm-leg:last-child{border-bottom:none;}
.mm-leg:hover{background:#f8fafc;}
.mm-leg-dot{width:32px;height:32px;border-radius:10px;display:flex;align-items:center;justify-content:center;color:#fff;flex-shrink:0;}
.mm-leg-tx{flex:1;min-width:0;display:flex;flex-direction:column;}
.mm-leg-t{font-size:13.5px;font-weight:700;color:#1e293b;}
.mm-leg-s{font-size:11px;color:#94a3b8;}
.mm-leg-arrow{color:#cbd5e1;flex-shrink:0;}
.mm-leg:hover .mm-leg-arrow{color:#6366f1;}

.mm-toc{background:#fff;border:1px solid #e2e8f0;border-radius:16px;overflow:hidden;}
.mm-toc-h{font-size:12px;font-weight:700;color:#94a3b8;padding:13px 14px 8px;}
.mm-toc-item{display:flex;align-items:center;gap:11px;width:100%;padding:11px 14px;background:none;border:none;border-top:1px solid #f1f5f9;cursor:pointer;text-align:left;transition:background .12s;}
.mm-toc-item:hover{background:#f8fafc;}
.mm-toc-no{width:24px;height:24px;border-radius:8px;font-size:12px;font-weight:800;display:flex;align-items:center;justify-content:center;flex-shrink:0;}
.mm-toc-tx{flex:1;font-size:13.5px;font-weight:600;color:#334155;}
.mm-toc-chk{color:#10b981;flex-shrink:0;}

.mm-drawer-back{position:fixed;inset:0;z-index:60;background:rgba(2,6,23,.5);backdrop-filter:blur(2px);display:flex;justify-content:flex-end;animation:mm-fade .2s ease;}
@keyframes mm-fade{from{opacity:0;}to{opacity:1;}}
.mm-drawer{position:relative;background:#fff;width:100%;height:100%;display:flex;flex-direction:column;box-shadow:-10px 0 40px rgba(2,6,23,.25);animation:mm-slide-r .28s cubic-bezier(.2,.8,.2,1);}
@keyframes mm-slide-r{from{transform:translateX(40px);opacity:.4;}to{transform:translateX(0);opacity:1;}}
.mm-drawer-head{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;padding:18px 20px;color:#fff;}
.mm-drawer-head-tx{min-width:0;flex:1;}
.mm-drawer-eyebrow{display:inline-flex;align-items:center;gap:6px;font-size:11px;font-weight:700;opacity:.9;}
.mm-drawer-title{font-size:20px;font-weight:800;margin-top:4px;line-height:1.25;}
.mm-drawer-x{width:32px;height:32px;border-radius:9px;background:rgba(255,255,255,.2);color:#fff;border:none;display:flex;align-items:center;justify-content:center;cursor:pointer;flex-shrink:0;}
.mm-drawer-x:hover{background:rgba(255,255,255,.34);}
.mm-drawer-body{padding:18px 20px 24px;overflow-y:auto;flex:1;display:flex;flex-direction:column;gap:16px;}
@media(max-width:640px){
  .mm-drawer-back{justify-content:center;align-items:flex-end;}
  .mm-drawer{max-width:100%;height:90vh;border-radius:20px 20px 0 0;animation:mm-slide-up .28s cubic-bezier(.2,.8,.2,1);}
}
@keyframes mm-slide-up{from{transform:translateY(60px);opacity:.4;}to{transform:translateY(0);opacity:1;}}

.mm-srcs{display:flex;align-items:center;gap:7px;flex-wrap:wrap;}
.mm-srcs-label{font-size:11px;font-weight:700;color:#94a3b8;}
.mm-src-badge{font-size:11px;font-weight:700;padding:3px 9px;border-radius:999px;background:#eef2ff;color:#4338ca;}
.mm-blocks{display:block;}
.mm-blocks > *{margin-bottom:14px;break-inside:avoid;-webkit-column-break-inside:avoid;}
.mm-blocks > *:last-child{margin-bottom:0;}
.mm-blocks.cols-2{column-count:2;column-gap:18px;}
.mm-blocks.cols-3{column-count:3;column-gap:18px;}
.mm-drawer-resize{position:absolute;left:0;top:0;bottom:0;width:12px;margin-left:-6px;cursor:ew-resize;display:flex;align-items:center;justify-content:center;z-index:5;touch-action:none;}
.mm-drawer-resize:hover .mm-drawer-grip,.mm-drawer-resize:active .mm-drawer-grip{background:#6366f1;height:64px;}
.mm-drawer-grip{width:5px;height:48px;border-radius:99px;background:rgba(148,163,184,.7);box-shadow:0 1px 4px rgba(2,6,23,.25);transition:height .15s,background .15s;}
.mm-drawer-tools{display:flex;align-items:center;gap:8px;flex-shrink:0;}
.mm-drawer-sizes{display:flex;gap:2px;background:rgba(255,255,255,.18);border-radius:9px;padding:3px;}
.mm-size-btn{border:none;background:transparent;color:#fff;font-size:11px;font-weight:700;padding:4px 7px;border-radius:6px;cursor:pointer;opacity:.8;white-space:nowrap;}
.mm-size-btn:hover{opacity:1;}
.mm-size-btn.on{background:rgba(255,255,255,.92);color:#1e293b;opacity:1;}
@media(max-width:760px){.mm-blocks.cols-2,.mm-blocks.cols-3{column-count:1;}.mm-drawer-resize{display:none;}.mm-drawer-sizes{display:none;}}

.mm-terms{border-top:1px solid #f1f5f9;padding-top:14px;}
.mm-terms-h{display:flex;align-items:center;gap:6px;font-size:12px;font-weight:700;color:#94a3b8;margin-bottom:8px;}
.mm-terms-wrap{display:flex;flex-wrap:wrap;gap:7px;}
.mm-term-chip{font-size:12px;font-weight:700;padding:5px 11px;border-radius:999px;background:#fff;border:1px solid #c7d2fe;color:#4338ca;cursor:pointer;transition:background .12s,border-color .12s;}
.mm-term-chip:hover{background:#eef2ff;border-color:#818cf8;}

.mm-nav{display:flex;align-items:center;justify-content:space-between;gap:10px;border-top:1px solid #f1f5f9;padding-top:14px;}
.mm-nav-btn{display:inline-flex;align-items:center;gap:5px;font-size:13px;font-weight:700;padding:8px 14px;border-radius:10px;background:#eef2ff;color:#4338ca;border:none;cursor:pointer;transition:background .12s;}
.mm-nav-btn:hover:not(:disabled){background:#e0e7ff;}
.mm-nav-btn:disabled{opacity:.4;cursor:not-allowed;}
.mm-nav-mid{font-size:12px;color:#94a3b8;font-weight:600;}

.mm-sources{background:#fff;border:1px solid #e2e8f0;border-radius:16px;padding:16px 18px;}
.mm-sources-head{display:flex;align-items:center;justify-content:space-between;width:100%;background:none;border:none;cursor:pointer;padding:0;}
.mm-sources-t{display:inline-flex;align-items:center;gap:8px;font-size:14px;font-weight:800;color:#1e1b4b;}
.mm-sources-chev{color:#94a3b8;transition:transform .2s;}
.mm-sources-chev.open{transform:rotate(180deg);}
.mm-sources-desc{font-size:12px;color:#94a3b8;margin-top:6px;}
.mm-sources-list{margin-top:12px;display:flex;flex-direction:column;gap:8px;}
.mm-source{border:1px solid #f1f5f9;background:#f8fafc;border-radius:10px;padding:10px 12px;}
.mm-source-top{display:flex;align-items:center;justify-content:space-between;gap:8px;}
.mm-source-file{font-size:12.5px;font-weight:700;color:#334155;}
.mm-source-kind{font-size:10px;font-weight:700;color:#6366f1;background:#eef2ff;padding:2px 7px;border-radius:999px;white-space:nowrap;flex-shrink:0;}
.mm-source-desc{font-size:11.5px;color:#94a3b8;margin-top:4px;line-height:1.5;}

/* ===== IDE KIT ===== */
.ide{border-radius:16px;overflow:hidden;border:1px solid #1e293b;background:#0f172a;box-shadow:0 14px 40px rgba(2,6,23,.25);}
.ide-titlebar{display:flex;align-items:center;gap:12px;padding:9px 14px;background:#1e293b;border-bottom:1px solid #0b1220;}
.ide-dots{display:flex;gap:6px;}
.ide-dots i{width:11px;height:11px;border-radius:50%;display:block;}
.ide-dots i:nth-child(1){background:#f87171;}
.ide-dots i:nth-child(2){background:#fbbf24;}
.ide-dots i:nth-child(3){background:#34d399;}
.ide-title{display:inline-flex;align-items:center;gap:7px;font-size:12.5px;font-weight:700;color:#cbd5e1;flex:1;min-width:0;}
.ide-nav-toggle{display:none;align-items:center;gap:5px;font-size:12px;font-weight:700;color:#cbd5e1;background:#334155;border:none;padding:5px 10px;border-radius:8px;cursor:pointer;}
.ide-body{display:flex;min-height:520px;position:relative;}
.ide-sidebar{width:212px;flex-shrink:0;background:#0b1220;border-right:1px solid #1e293b;padding:10px 0;display:flex;flex-direction:column;}
.ide-side-h{font-size:10.5px;font-weight:800;letter-spacing:.08em;color:#64748b;padding:6px 14px 10px;}
.ide-folder{display:flex;align-items:center;gap:7px;font-size:12.5px;font-weight:700;color:#94a3b8;padding:5px 14px;}
.ide-folder.sub{width:100%;background:none;border:none;cursor:pointer;color:#cbd5e1;text-align:left;}
.ide-fold-chev{transition:transform .15s;color:#64748b;}
.ide-fold-chev.open{transform:rotate(90deg);}
.ide-files{display:flex;flex-direction:column;}
.ide-file{display:flex;align-items:center;gap:8px;width:100%;background:none;border:none;cursor:pointer;padding:6px 14px;font-size:12.5px;color:#94a3b8;text-align:left;border-left:2px solid transparent;transition:background .1s,color .1s;}
.ide-file.nested{padding-left:26px;}
.ide-file:hover{background:#111c33;color:#e2e8f0;}
.ide-file.on{background:#1e293b;color:#fff;border-left-color:#fbbf24;}
.ide-file-ic{color:#64748b;flex-shrink:0;}
.ide-file.on .ide-file-ic{color:#fbbf24;}
.ide-file-nm{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.ide-side-foot{margin-top:auto;display:flex;align-items:flex-start;gap:6px;font-size:10.5px;color:#475569;padding:12px 14px 4px;line-height:1.4;}

.ide-main{flex:1;min-width:0;display:flex;flex-direction:column;background:#0f172a;}
.ide-tabs{display:flex;background:#0b1220;border-bottom:1px solid #1e293b;overflow-x:auto;}
.ide-tab{display:inline-flex;align-items:center;gap:7px;padding:9px 12px;background:none;border:none;border-right:1px solid #1e293b;cursor:pointer;font-size:12px;color:#64748b;white-space:nowrap;border-top:2px solid transparent;}
.ide-tab:hover{color:#cbd5e1;}
.ide-tab.on{background:#0f172a;color:#fff;border-top-color:#fbbf24;}
.ide-tab-nm{font-weight:600;}
.ide-tab-x{display:inline-flex;width:16px;height:16px;border-radius:5px;align-items:center;justify-content:center;color:#64748b;}
.ide-tab-x:hover{background:#334155;color:#fff;}

.ide-note{display:flex;align-items:flex-start;gap:8px;padding:10px 16px;font-size:12.5px;color:#cbd5e1;background:#15233f;border-bottom:1px solid #1e293b;line-height:1.5;}
.ide-note-ic{color:#fbbf24;margin-top:1px;flex-shrink:0;}

.ide-settings{padding:14px 16px;background:#111c33;border-bottom:1px solid #1e293b;display:flex;flex-direction:column;gap:12px;}
.ide-cg{display:flex;align-items:center;gap:12px;flex-wrap:wrap;}
.ide-cg-label{font-size:11.5px;font-weight:700;color:#94a3b8;min-width:62px;}
.ide-cg-opts{display:flex;gap:6px;flex-wrap:wrap;}
.ide-chip{font-size:12px;font-weight:700;padding:6px 12px;border-radius:8px;background:#1e293b;color:#94a3b8;border:1px solid #334155;cursor:pointer;transition:background .12s,border-color .12s,color .12s;}
.ide-chip:hover{border-color:#475569;color:#e2e8f0;}
.ide-chip.on{background:#4f46e5;border-color:#6366f1;color:#fff;}
.ide-toggles{display:flex;flex-wrap:wrap;gap:14px;}
.ide-toggle{display:inline-flex;align-items:center;gap:8px;background:none;border:none;cursor:pointer;padding:2px;}
.ide-toggle-sw{width:34px;height:19px;border-radius:999px;background:#334155;position:relative;transition:background .15s;flex-shrink:0;}
.ide-toggle-knob{position:absolute;top:2px;left:2px;width:15px;height:15px;border-radius:50%;background:#94a3b8;transition:left .15s,background .15s;}
.ide-toggle.on .ide-toggle-sw{background:#10b981;}
.ide-toggle.on .ide-toggle-knob{left:17px;background:#fff;}
.ide-toggle-tx{font-size:12px;font-weight:600;color:#cbd5e1;}

.ide-editor{flex:1;display:flex;flex-direction:column;min-height:0;}
.ide-editor-bar{display:flex;align-items:center;justify-content:space-between;padding:7px 14px;background:#0b1220;border-bottom:1px solid #1e293b;}
.ide-editor-lang{font-size:10px;font-weight:800;letter-spacing:.08em;color:#475569;font-family:ui-monospace,monospace;}
.ide-codearea{flex:1;overflow:auto;padding:12px 0;font-family:ui-monospace,'SF Mono',Menlo,monospace;font-size:12.5px;line-height:1.7;background:#0f172a;min-height:200px;}
.ide-line{display:flex;padding:0 16px;}
.ide-line:hover{background:#15233f;}
.ide-ln{width:30px;flex-shrink:0;text-align:right;padding-right:14px;color:#475569;user-select:none;}
.ide-code{color:#e2e8f0;white-space:pre-wrap;word-break:break-word;flex:1;}
.tk-kw{color:#c4b5fd;font-weight:600;}
.tk-str{color:#86efac;}
.tk-flag{color:#fbbf24;}
.tk-cm{color:#64748b;font-style:italic;}
.tk-h{color:#fbbf24;font-weight:700;}
.tk-li{color:#93c5fd;}

.ide-rulenotes{border-top:1px solid #1e293b;padding:10px 16px;display:flex;flex-direction:column;gap:6px;background:#1a1305;}
.ide-rulenote{display:flex;align-items:flex-start;gap:7px;font-size:11.5px;color:#fcd34d;line-height:1.5;}

.ide-problems,.ide-checks{flex:1;overflow:auto;padding:14px 16px;display:flex;flex-direction:column;gap:9px;background:#0f172a;min-height:200px;}
.ide-problems-h{font-size:11px;font-weight:800;letter-spacing:.05em;color:#64748b;display:flex;align-items:center;gap:7px;margin-bottom:2px;}
.ide-prob{border:1px solid #1e293b;border-left:3px solid #f87171;border-radius:9px;padding:10px 12px;background:#111c33;}
.ide-prob-code{font-family:ui-monospace,monospace;font-size:12px;color:#fca5a5;font-weight:600;}
.ide-prob-fix{font-size:12.5px;color:#cbd5e1;margin-top:5px;line-height:1.5;}
.ide-check{display:flex;align-items:flex-start;gap:11px;width:100%;text-align:left;background:#111c33;border:1px solid #1e293b;border-radius:10px;padding:12px;cursor:pointer;transition:background .12s,border-color .12s;}
.ide-check:hover{border-color:#334155;}
.ide-check.on{background:#0c2018;border-color:#15803d;}
.ide-check-box{width:20px;height:20px;border-radius:6px;border:2px solid #475569;display:flex;align-items:center;justify-content:center;flex-shrink:0;color:#fff;margin-top:1px;}
.ide-check.on .ide-check-box{background:#16a34a;border-color:#16a34a;}
.ide-check-tx{font-size:13px;color:#cbd5e1;line-height:1.5;}
.ide-check.on .ide-check-tx{color:#86efac;}

.ide-terminal{border-top:1px solid #1e293b;background:#0b1220;flex-shrink:0;}
.ide-term-h{display:flex;align-items:center;justify-content:space-between;width:100%;padding:8px 14px;background:none;border:none;cursor:pointer;font-size:11px;font-weight:800;letter-spacing:.05em;color:#94a3b8;}
.ide-term-h span{display:inline-flex;align-items:center;gap:7px;}
.ide-term-chev{color:#64748b;transition:transform .2s;}
.ide-term-chev.open{transform:rotate(180deg);}
.ide-term-body{padding:8px 16px 14px;font-family:ui-monospace,monospace;font-size:12px;line-height:1.7;max-height:170px;overflow:auto;}
.ide-term-ln{white-space:pre-wrap;word-break:break-word;}
.tl-cmd{color:#e2e8f0;}
.tl-ok{color:#4ade80;font-weight:600;}
.tl-dim{color:#64748b;}
.tl-add{color:#93c5fd;}
.tl-url{color:#fbbf24;font-weight:600;}
.tl-out{color:#94a3b8;}

@media(max-width:760px){
  .ide-nav-toggle{display:inline-flex;}
  .ide-sidebar{position:absolute;left:0;top:0;z-index:20;height:100%;transform:translateX(-100%);transition:transform .2s;box-shadow:8px 0 30px rgba(0,0,0,.45);}
  .ide-sidebar.open{transform:translateX(0);}
}

/* ===== 위계 학습지도 추가 ===== */
.mm-crumb-link{display:inline-flex;align-items:center;gap:5px;font-weight:700;color:#4f46e5;background:none;border:none;padding:3px 7px;border-radius:7px;cursor:pointer;font-size:13px;}
.mm-crumb-link:hover{background:#eef2ff;}
.mm-crumb-link.here{color:#475569;cursor:default;}
.mm-crumb-link.here:hover{background:none;}
.mm-start{margin-top:12px;width:100%;display:inline-flex;align-items:center;justify-content:center;gap:7px;background:#4f46e5;color:#fff;border:none;padding:11px;border-radius:11px;font-weight:800;font-size:13px;cursor:pointer;transition:background .15s;}
.mm-start:hover{background:#4338ca;}
.mm-leg-no{width:22px;height:22px;flex-shrink:0;border-radius:7px;background:#f1f5f9;color:#64748b;font-size:11px;font-weight:800;display:flex;align-items:center;justify-content:center;}
.mm-node-more{position:absolute;top:-3px;right:-3px;width:15px;height:15px;border-radius:50%;background:#fff;border:1.5px solid var(--c);color:var(--c);display:flex;align-items:center;justify-content:center;box-shadow:0 1px 3px rgba(0,0,0,.15);}
.mm-node.mm-branch .mm-node-ic{box-shadow:0 0 0 3px var(--soft);}
.mm-nav-lab{max-width:92px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
.mm-nav-next{justify-content:flex-end;}

/* ===== 💬 개념 말풍선 (인라인 용어) ===== */
.bubble-term{display:inline;color:#4f46e5;font-weight:600;background:none;border:none;padding:0;cursor:pointer;border-bottom:1.5px dotted #a5b4fc;line-height:inherit;font-size:inherit;font-family:inherit;transition:color .12s,border-color .12s;}
.bubble-term:hover{color:#d97706;border-color:#fcd34d;}
.bubble-ic{font-size:.72em;margin-left:1px;opacity:.6;vertical-align:.08em;}
.bubble-term:hover .bubble-ic{opacity:1;}

/* ===== 상세 페이지 lead / 소제목 ===== */
.nb-lead{font-size:16.5px;line-height:1.7;color:#1e293b;font-weight:600;}
.nb-h2{font-size:13px;font-weight:800;color:#4338ca;letter-spacing:.02em;margin-top:6px;}

/* ===== 실습키트 화면 목업(캡처) ===== */
.ide-shotarea{flex:1;overflow:auto;background:#0f172a;padding:18px;}
.ide-shotwrap{width:100%;max-width:100%;margin:0;position:relative;}
.ide-shot{background:#fff;border-radius:12px;padding:10px;box-shadow:0 8px 30px rgba(0,0,0,.4);position:relative;cursor:zoom-in;}
.ide-shot-zoom{position:absolute;top:9px;right:9px;z-index:3;display:inline-flex;align-items:center;gap:5px;background:rgba(15,23,42,.82);color:#fff;border:none;border-radius:8px;padding:5px 9px;font-size:11px;font-weight:700;cursor:pointer;opacity:.85;}
.ide-shot-zoom:hover{opacity:1;background:#0f172a;}
.ide-shot-overlay{position:fixed;inset:0;z-index:200;background:rgba(2,6,23,.82);display:flex;align-items:center;justify-content:center;padding:18px;cursor:zoom-out;}
.ide-shot-overlay-inner{position:relative;width:100%;max-width:1180px;background:#fff;border-radius:14px;padding:14px;cursor:default;box-shadow:0 24px 60px rgba(0,0,0,.5);}
.ide-shot-overlay-inner .shot-svg{width:100%;height:auto;display:block;}
.ide-shot-close{position:absolute;top:-15px;right:-15px;width:38px;height:38px;border-radius:50%;background:#fff;border:none;box-shadow:0 4px 16px rgba(0,0,0,.35);cursor:pointer;display:flex;align-items:center;justify-content:center;color:#334155;}
.ide-shot-close:hover{background:#f1f5f9;}
.shot-svg{width:100%;height:auto;display:block;}
.ide-shot-steps{list-style:none;margin:16px 0 0;padding:0;display:flex;flex-direction:column;gap:9px;}
.ide-shot-steps li{display:flex;align-items:flex-start;gap:9px;color:#cbd5e1;font-size:13px;line-height:1.5;}
.ide-shot-no{flex-shrink:0;width:20px;height:20px;border-radius:50%;background:#f59e0b;color:#1e1b4b;font-size:11px;font-weight:800;display:flex;align-items:center;justify-content:center;margin-top:1px;}
.ide-shot-note{margin-top:14px;font-size:11.5px;color:#64748b;line-height:1.5;}

/* ===== 실습 키트 — 트랙 선택 ===== */
.kit-wrap{display:flex;flex-direction:column;}
.kit-switch{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:8px;}
.kit-tab{display:inline-flex;align-items:center;gap:7px;padding:9px 14px;border-radius:11px;border:1.5px solid #e2e8f0;background:#fff;color:#64748b;font-size:13px;font-weight:700;cursor:pointer;transition:all .15s;}
.kit-tab:hover{border-color:#c7d2fe;color:#4f46e5;}
.kit-tab.on{background:#4f46e5;border-color:#4f46e5;color:#fff;box-shadow:0 4px 14px rgba(79,70,229,.3);}
.kit-tab svg{flex-shrink:0;}
.kit-tagline{display:flex;align-items:center;gap:7px;font-size:12.5px;color:#64748b;margin-bottom:12px;padding:0 2px;line-height:1.5;}
.kit-tagline svg{flex-shrink:0;color:#818cf8;}

/* ===== 실습 키트 — 단계별 가이드 ===== */
.ide-file-no{width:18px;height:18px;flex-shrink:0;border-radius:5px;background:#1e293b;color:#94a3b8;font-size:10px;font-weight:800;display:inline-flex;align-items:center;justify-content:center;}
.ide-file.on .ide-file-no{background:#6366f1;color:#fff;}
.ide-stepper{display:flex;align-items:center;gap:0;padding:11px 14px;background:#0b1220;border-bottom:1px solid #1e293b;overflow-x:auto;}
.ide-step-line{flex:1 0 10px;min-width:8px;height:2px;background:#1e293b;}
.ide-step-dot{flex-shrink:0;width:24px;height:24px;border-radius:50%;border:none;background:#1e293b;color:#94a3b8;font-size:11px;font-weight:800;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;transition:all .15s;}
.ide-step-dot:hover{background:#334155;color:#e2e8f0;}
.ide-step-dot.done{background:#065f46;color:#a7f3d0;}
.ide-step-dot.on{background:#6366f1;color:#fff;box-shadow:0 0 0 4px rgba(99,102,241,.25);}
.ide-stephead{padding:14px 16px 12px;background:linear-gradient(180deg,#15233f,#0f172a);border-bottom:1px solid #1e293b;}
.ide-step-badge{display:inline-block;font-size:10.5px;font-weight:800;letter-spacing:.04em;color:#fbbf24;background:rgba(251,191,36,.12);padding:3px 8px;border-radius:6px;}
.ide-step-title{margin:8px 0 4px;font-size:17px;font-weight:800;color:#f1f5f9;}
.ide-step-goal{display:flex;align-items:flex-start;gap:6px;font-size:12.5px;color:#94a3b8;line-height:1.55;}
.ide-step-goal svg{margin-top:2px;flex-shrink:0;color:#818cf8;}
.ide-guide{background:#f8fafc;padding:18px 18px 20px;display:flex;flex-direction:column;gap:13px;border-bottom:1px solid #1e293b;}
.ide-checkpoint{display:flex;align-items:center;gap:9px;padding:12px 16px;background:#052e1a;border-top:1px solid #064e3b;color:#a7f3d0;font-size:13px;line-height:1.5;}
.ide-checkpoint b{color:#6ee7b7;}
.ide-ckp-ic{flex-shrink:0;width:22px;height:22px;border-radius:50%;background:#10b981;color:#04261a;display:inline-flex;align-items:center;justify-content:center;}
.ide-stepnav{display:flex;justify-content:space-between;gap:10px;padding:13px 16px;background:#0b1220;border-top:1px solid #1e293b;}
.ide-stepnav-btn{flex:1;min-width:0;display:inline-flex;align-items:center;gap:7px;background:#1e293b;color:#cbd5e1;border:none;border-radius:10px;padding:10px 12px;font-size:12.5px;font-weight:700;cursor:pointer;transition:background .15s;}
.ide-stepnav-btn:hover:not(:disabled){background:#334155;color:#fff;}
.ide-stepnav-btn.next{justify-content:flex-end;background:#4f46e5;color:#fff;}
.ide-stepnav-btn.next:hover:not(:disabled){background:#4338ca;}
.ide-stepnav-btn:disabled{opacity:.4;cursor:default;}
.ide-stepnav-lab{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
.ide-shotarea{flex:none;background:transparent;padding:14px 16px;display:flex;flex-direction:column;gap:16px;overflow:visible;}

/* ===== HELP(❓) ===== */
.help-dot{display:inline-flex;align-items:center;justify-content:center;width:16px;height:16px;margin-left:5px;border-radius:50%;background:#fbbf24;color:#1e1b4b;font-size:11px;font-weight:800;cursor:pointer;vertical-align:middle;line-height:1;user-select:none;transition:transform .12s,background .12s;}
.help-dot:hover{transform:scale(1.18);background:#f59e0b;}
.help-back{position:fixed;inset:0;z-index:90;background:rgba(2,6,23,.55);backdrop-filter:blur(2px);display:flex;align-items:center;justify-content:center;padding:16px;animation:mm-fade .15s ease;}
.help-card{background:#fff;border-radius:18px;max-width:430px;width:100%;box-shadow:0 20px 50px rgba(2,6,23,.3);overflow:hidden;animation:help-pop .2s cubic-bezier(.2,.8,.3,1.1);}
@keyframes help-pop{from{transform:scale(.92);opacity:.5;}to{transform:scale(1);opacity:1;}}
.help-head{display:flex;align-items:center;gap:10px;padding:16px 18px;background:linear-gradient(135deg,#eef2ff,#fef3c7);}
.help-emoji{font-size:22px;line-height:1;}
.help-title{flex:1;font-size:16px;font-weight:800;color:#1e1b4b;line-height:1.3;}
.help-x{width:30px;height:30px;border-radius:8px;background:rgba(255,255,255,.7);border:none;display:flex;align-items:center;justify-content:center;color:#64748b;cursor:pointer;flex-shrink:0;}
.help-x:hover{background:#fff;}
.help-body{padding:16px 18px 20px;display:flex;flex-direction:column;gap:12px;}
.help-plain{font-size:14px;line-height:1.65;color:#334155;}
.help-row{border-radius:12px;padding:11px 13px;}
.help-row p{font-size:13px;line-height:1.6;color:#475569;margin-top:3px;}
.help-tag{font-size:11px;font-weight:800;}
.help-analogy{background:#ecfdf5;border:1px solid #a7f3d0;}
.help-analogy .help-tag{color:#047857;}
.help-ex{background:#eef2ff;border:1px solid #c7d2fe;}
.help-ex .help-tag{color:#4338ca;}

/* ===== IDE context generator panel ===== */
.ide-presets-row,.ide-field{display:flex;flex-direction:column;gap:7px;}
.ide-idea{width:100%;background:#0b1220;border:1px solid #334155;border-radius:10px;color:#e2e8f0;font-size:13px;line-height:1.6;padding:10px 12px;font-family:inherit;resize:vertical;outline:none;}
.ide-idea:focus{border-color:#6366f1;box-shadow:0 0 0 3px rgba(99,102,241,.18);}
.ide-idea::placeholder{color:#475569;}
.ide-subsettings{border-left:2px solid #334155;padding-left:12px;margin-left:2px;display:flex;flex-direction:column;gap:11px;}
.ide-hint-line{font-size:11.5px;color:#94a3b8;line-height:1.5;background:#15233f;border-radius:9px;padding:9px 11px;}

@media(prefers-reduced-motion:reduce){
  .mm-node,.mm-wire,.mm-drawer,.mm-drawer-back,.help-card{animation:none !important;}
}
`}</style>
  );
}
