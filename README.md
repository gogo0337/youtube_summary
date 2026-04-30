# YouTube 영상 분석기

YouTube 영상을 검색하고 조회수, 구독자, 실적도, 공헌도 등 다양한 지표로 분석하는 웹 애플리케이션입니다.

🔗 **라이브 데모**: https://gogo0337.github.io/youtube_summary/

---

## 주요 기능

- 키워드 검색 (최대 200개 결과)
- 게시일 / Shorts 포함 여부 필터
- 실적도 / 공헌도 / 조회수 / 구독자 등 정렬
- 영상 클릭 시 상세 팝업 → YouTube 바로 이동
- API 쿼터 실시간 모니터링
- 모바일 반응형 (카드 레이아웃 / Bottom Sheet)
- 50개 단위 페이지네이션

---

## 기술 스택

| 항목 | 기술 |
|------|------|
| 프레임워크 | React 18 + Vite 5 |
| 스타일 | Tailwind CSS 3 |
| API | YouTube Data API v3 |
| HTTP | Axios |
| 배포 | GitHub Pages + GitHub Actions |

---

## 처음부터 구축하는 방법

### 1단계 — 사전 준비

#### Node.js 설치

```bash
# 설치 확인
node -v
npm -v
```

설치가 안 되어 있으면 https://nodejs.org 에서 **LTS 버전** 다운로드 및 설치

#### YouTube Data API v3 키 발급

1. https://console.cloud.google.com 접속 → Google 계정 로그인
2. 새 프로젝트 생성 (프로젝트명 자유)
3. `API 및 서비스` → `라이브러리` → `YouTube Data API v3` 검색 → **사용 설정**
4. `API 및 서비스` → `사용자 인증 정보` → `+ 사용자 인증 정보 만들기` → **API 키**
5. 생성된 키 복사 후 보관

> **쿼터**: 하루 10,000 유닛 무료 (검색 1회 ≈ 100 유닛)

---

### 2단계 — Claude를 활용한 자동 구축

아래 프롬프트를 Claude Code (claude.ai/code) 에 순서대로 입력하면
전체 프로젝트를 자동으로 구축할 수 있습니다.

---

#### 📋 Claude 프롬프트 모음

**[프롬프트 1] 프로젝트 역할 및 목표 정의**

```
# Role: 유튜브 영상 검색기

너는 유튜브에 업로드된 영상 중에 제목, 조회수, 구독자, 실적도, 공헌도, 게시일, 
좋아요 수(like), 댓글, 영상수를 분석해서 어떤 영상이 YouTube 알고리즘을 통해 
인기가 있는지 보여주는 기능을 한다.

검색창에서는 내가 검색하려는 주제에 따라 필터링을 할 수 있도록 구성하고 
정렬 기능이 필요하다. 썸네일 항목에는 실제 영상의 썸네일과 클릭했을 때 
해당 영상에 대한 상세 정보를 볼 수 있는 페이지가 팝업된다.
팝업된 페이지에서 해당 영상을 클릭하면 YouTube에서 해당 영상을 시청할 수 있게 
YouTube 링크로 이동한다.

위 기능을 React + Vite + Tailwind CSS로 구현해줘.
YouTube Data API v3를 사용하고 API 키는 .env 파일에 저장한다.
프로젝트 경로는 C:/Claude/youtube 이다.
```

---

**[프롬프트 2] 추가 기능 요청**

```
다음 기능을 추가해줘:

1. 검색 결과 필터와 정렬을 별도 패널로 분리
   - 검색 바: 키워드 + 게시일 + 검색 개수(50/100/150/200개)만
   - 결과 필터: 검색 후 표시되는 Shorts 포함/제외, 실적도, 공헌도 필터
   - 정렬 버튼: 조회수/구독자/게시일/좋아요/댓글/실적도/공헌도

2. Shorts 기본값을 제외로 설정

3. 50개 단위 페이지네이션 (이전/다음 버튼 + 페이지 번호)

4. 더블클릭 없이 행 클릭으로 상세 팝업

5. 영상 제목과 채널명을 별도 태그로 표시

6. npm으로 실행하는 start.bat 파일 생성

7. API 쿼터 모니터링 기능 (헤더에 게이지 표시, 클릭 시 상세 패널)
   - 일일 한도: 10,000 유닛
   - 사용/잔여 표시
   - 검색별 소모 내역
   - localStorage에 저장, 자정에 자동 초기화
```

---

**[프롬프트 3] 모바일 대응**

```
모바일 사파리와 모바일 브라우저에서 자연스럽게 보이도록 반응형 UI를 적용해줘:

- 모바일(md 미만): 카드 레이아웃
- 데스크탑(md 이상): 테이블 레이아웃
- 상세 팝업: 모바일에서 하단 시트(Bottom Sheet) 방식
- 검색/필터 버튼: 모바일에서 자동 줄바꿈
- iOS Safe Area 대응 (노치/홈바)
- viewport-fit=cover 메타태그 적용
```

---

**[프롬프트 4] 실적도/공헌도 알고리즘 개선**

```
실적도와 공헌도 알고리즘을 개선해줘:

실적도 (확산력):
- 조회수 1,000 미만은 최하 (통계적 의미 없음)
- 구독자 수 최솟값 제한 없음 (소형 채널 바이럴 정상 평가)
- 총 도달률(viewCount/subscriberCount)과 일평균 도달률을 혼합
- 영상 나이(daysSince)에 따라 가중치 조정:
  * 180일 미만: 최신성(일평균) 중심
  * 180일 이상: 누적 도달률 중심
- 등급 기준: 최상(≥3) / 상(≥1) / 중(≥0.2) / 하(≥0.05) / 최하

공헌도 (참여율):
- 조회수 1,000 미만은 최하
- 가중 참여율 = (좋아요 + 댓글×2) / 조회수 × 100
- 댓글 가중치 2배 (알고리즘 신호 강도 반영)
- 등급 기준: 최상(≥3%) / 상(≥1.5%) / 중(≥0.5%) / 하(≥0.1%) / 최하
```

---

**[프롬프트 5] GitHub Pages 배포**

```
이 프로젝트를 GitHub Pages로 배포하고 싶어.

1. GitHub Actions 워크플로우 파일 생성 (.github/workflows/deploy.yml)
   - main 브랜치에 push 시 자동 빌드 및 배포
   - VITE_YOUTUBE_API_KEY는 GitHub Secret에서 주입

2. package.json에 homepage, predeploy, deploy 스크립트 추가

3. vite.config.js에 base 경로 설정

4. deploy.bat 파일 생성 (코드 수정 후 git push 자동화)

GitHub 저장소 주소: https://github.com/[유저명]/[저장소명]
```

---

### 3단계 — 로컬 환경 실행

```bash
# 저장소 클론
git clone https://github.com/[유저명]/[저장소명].git
cd [저장소명]

# 패키지 설치
npm install

# .env 파일 생성
echo VITE_YOUTUBE_API_KEY=여기에_API_키_입력 > .env

# 개발 서버 실행
npm run dev
```

브라우저에서 http://localhost:5173 접속

또는 **start.bat** 더블클릭으로 실행 (Windows)

---

### 4단계 — GitHub Pages 배포

#### 저장소 설정

1. GitHub에서 새 **Public** 저장소 생성
2. `Settings` → `Secrets and variables` → `Actions` → `New repository secret`
   ```
   Name  : VITE_YOUTUBE_API_KEY
   Value : 발급받은_API_키
   ```
3. `Settings` → `Pages` → `Source: GitHub Actions`

#### 코드 업로드

```bash
git init
git add .
git commit -m "initial commit"
git remote add origin https://github.com/[유저명]/[저장소명].git
git branch -M main
git push -u origin main
```

#### 배포 확인

```
https://github.com/[유저명]/[저장소명]/actions
```

✅ 초록 체크 확인 후 접속:
```
https://[유저명].github.io/[저장소명]/
```

---

### 5단계 — API 키 보안 설정 (필수)

GitHub Pages에 배포 시 API 키가 JS 파일에 포함되므로 **도메인 제한 필수**

1. https://console.cloud.google.com 접속
2. `API 및 서비스` → `사용자 인증 정보` → API 키 클릭
3. `애플리케이션 제한사항` → `웹사이트` 선택
4. 아래 주소 추가:
   ```
   https://[유저명].github.io/*
   ```
5. 저장

---

## 코드 수정 후 배포

```bash
# 방법 1: 직접 명령어
git add .
git commit -m "수정 내용"
git push

# 방법 2: deploy.bat 더블클릭 (Windows)
```

push 후 약 **1~2분** 내 자동 배포 완료

---

## 프로젝트 구조

```
youtube/
├── .github/
│   └── workflows/
│       └── deploy.yml          # GitHub Actions 자동 배포
├── src/
│   ├── api/
│   │   └── youtube.js          # YouTube API 호출 + 지표 계산
│   ├── components/
│   │   ├── SearchBar.jsx       # 검색 + 게시일/개수 옵션
│   │   ├── ResultFilter.jsx    # 결과 필터 + 정렬
│   │   ├── VideoTable.jsx      # 테이블(PC) / 카드(모바일) + 페이지네이션
│   │   ├── VideoModal.jsx      # 상세 팝업 / Bottom Sheet
│   │   └── QuotaMonitor.jsx    # API 쿼터 모니터링
│   ├── hooks/
│   │   └── useQuota.js         # 쿼터 상태 관리 (localStorage)
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── .env                        # API 키 (gitignore 처리됨)
├── .gitignore
├── deploy.bat                  # 배포 자동화 (Windows)
├── start.bat                   # 로컬 실행 (Windows)
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
└── postcss.config.js
```

---

## 지표 설명

### 실적도 (확산력)

구독자 대비 영상 도달률을 측정합니다.

```
- 신규 영상(180일 미만): 일평균 조회율 중심
- 구영상(180일 이상): 총 누적 도달률 중심

등급 기준:
최상 ≥ 3.0  (구독자 수의 300% 이상 도달)
상   ≥ 1.0  (구독자 수의 100% 이상 도달)
중   ≥ 0.2  (구독자 수의 20% 이상 도달)
하   ≥ 0.05
최하 < 0.05
```

### 공헌도 (참여율)

댓글을 좋아요보다 2배 가중 처리한 참여율입니다.

```
가중 참여율 = (좋아요 + 댓글 × 2) / 조회수 × 100

등급 기준:
최상 ≥ 3.0%
상   ≥ 1.5%
중   ≥ 0.5%
하   ≥ 0.1%
최하 < 0.1%
```

---

## 쿼터 사용량

| 검색 개수 | API 호출 | 예상 소모 |
|----------|---------|---------|
| 50개 | 1페이지 | ≈ 102 유닛 |
| 100개 | 2페이지 | ≈ 204 유닛 |
| 150개 | 3페이지 | ≈ 306 유닛 |
| 200개 | 4페이지 | ≈ 408 유닛 |

일일 한도 10,000 유닛 기준 200개 검색 시 약 **24회** 사용 가능

---

## 문제 해결

| 증상 | 원인 | 해결 |
|------|------|------|
| 검색 결과 없음 | API 키 오류 | .env 파일 확인 |
| 403 오류 | 쿼터 초과 또는 키 제한 | Google Cloud Console 확인 |
| GitHub Pages 배포 실패 | Secret 미등록 | VITE_YOUTUBE_API_KEY Secret 등록 |
| 로컬에서 API 키 오류 | .env 파일 없음 | .env 파일 생성 후 키 입력 |
| 모바일에서 레이아웃 깨짐 | 구버전 브라우저 | Chrome/Safari 최신 버전 업데이트 |
