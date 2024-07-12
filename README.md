# 레벨업 날씨 AI 챗봇 v2

이 프로젝트는 OpenAI와 OpenWeatherMap API를 사용하여 실시간 날씨 정보를 제공하는 채팅 애플리케이션입니다.

본 프로젝트는 도서 [『레벨업 리액트 프로그래밍 with Next.js (웹앱의 작동 원리부터 SSR 방식을 적용한 현대적 접근까지)』](https://reactnext-central.xyz/levelup/book)의 '12장. AI 챗봇을 통합하는 웹 애플리케이션'의 [실습 프로젝트](https://github.com/bjpublic/react_programming_with_Next.js/tree/main/chapter12)의 업데이트 버전입니다. 최신 버셀 AI SDK를 사용하고 OpenAI의 Chat Completion과 Assistants를 이용하여 다음의 네 가지 방식으로 구현된 예제를 설명합니다.
1. 클라언트 렌더링: useChat 훅과 라우트 핸들러에서 streamText 사용
2. 서버 렌더링: useActions 훅과 서버 액션에서 generateText 사용
3. 클라이언트 렌더링(Assistants): useAssistant 훅과 라우트 핸들러에서 AssistantResponse 사용
4. 서버 렌더링(Assistants): useActions 훅과 서버 액션에서 createStreamableUI 사용


## 다운로드 및 설치

이 프로젝트를 다운로드하고 실행하려면 다음 단계를 따르십시오.

1. 먼저 프로젝트를 다운로드합니다.
```bash
git https://github.com/Eirene-dev/levelup-weather-chat-v2.git
```

2. 프로젝트 폴더로 이동합니다.
```bash
cd levelup-weather-chat-v2
```

3. 의존성 있는 패키지들을 설치합니다.
```bash
pnpm install
```

이제 프로젝트의 모든 의존성 패키지가 설치되었으며 프로젝트를 실행할 준비가 되었습니다.

### 프로젝트를 새로 생성하여 본 프로젝트를 참조하여 구현하는 경우
<details>
    <summary>프로젝트를 새로 생성하는 방법</summary>

다음 명령어를 사용하여 Next.js 애플리케이션을 생성하고 프로젝트 디렉터리로 이동합니다.

```bash
npx create-next-app@latest levelup-weather-chat-v2
cd levelup-weather-chat-v2/
```

이제 필요한 패키지를 설치합니다. 먼저 OpenAI SDK, React, Zod를 설치합니다.

```bash
npm install ai @ai-sdk/openai @ai-sdk/react zod
```

다음으로 Markdown과 MDX 처리를 위해 필요한 패키지를 설치합니다. 이 패키지는 GitHub Flavored Markdown(GFM) 및 MDX 처리를 위한 remark와 rehype 플러그인을 포함합니다.

```bash
npm install remark-gfm @next/mdx @mdx-js/loader remark remark-html
```
</details>


## 환경 변수 설정
본 프로젝트를 실행하기 위해서는 Next.js [환경 변수 설정](https://reactnext-central.xyz/docs/nextjs/configuring/environment-variables)이 필요합니다. 다음 단계를 따라 설정을 완료하세요.

1. 프로젝트 루트 디렉터리에 `.env.local` 파일을 생성하거나,
`.env.example` 파일을 `.env.local`로 변경하여 로컬 환경 변수를 설정합니다.

```bash
mv .env.example .env.local
```

2. `.env.local` 파일을 다음과 같이 설정합니다.

```env
# OpenAI API 키
OPENAI_API_KEY="your-openai-api-key-here"

# Assistant ID
ASSISTANT_ID="your-assistant-id-here"

# OpenWeatherMap API 키
OPENWEATHERMAP_KEY="your-openweathermap-api-key-here"
NEXT_PUBLIC_OPENWEATHERMAP_KEY="your-next-public-openweathermap-api-key-here"
```

  - `OPENAI_API_KEY`: [OpenAI API 키](https://platform.openai.com/api-keys)를 입력합니다. OpenAI 계정에서 API 키를 생성할 수 있습니다.
  - `ASSISTANT_ID`: 사용하고자 하는 [OpenAI Assistant의 ID](https://platform.openai.com/assistants)를 입력합니다.
  - `OPENWEATHERMAP_KEY`와 `NEXT_PUBLIC_OPENWEATHERMAP_KEY`: OpenWeatherMap API 키를 입력합니다. [OpenWeatherMap](https://openweathermap.org/) 계정에서 API 키를 생성할 수 있습니다.

이제 프로젝트의 환경 변수가 설정되었으며, 프로젝트를 실행할 준비가 되었습니다. 필요한 경우 환경 변수를 수정하여 다른 API 키나 설정을 적용할 수 있습니다.

## 실행 방법

프로젝트를 시작하려면 다음 명령어를 사용하세요.

```bash
pnpm dev
```

이 명령어는 로컬 개발 서버를 시작합니다. 브라우저에서 `http://localhost:3000`으로 이동하여 애플리케이션을 확인할 수 있습니다.

## 주요 기능

- OpenAI와 OpenWeatherMap API를 사용하여 실시간 날씨 정보를 제공합니다.
- 사용자는 특정 도시의 날씨 정보를 채팅을 통해 요청할 수 있습니다.
- MDX 및 remark를 사용하여 Markdown 콘텐츠를 쉽게 렌더링합니다.

### 커스터마이징

이 프로젝트는 다음과 같은 주요 기술을 사용합니다.

- **Next.js**: React 기반의 프레임워크로, 서버 사이드 렌더링 및 정적 사이트 생성을 지원합니다.
- **OpenAI API**: AI 모델을 사용하여 자연어 처리를 수행합니다.
- **OpenWeatherMap API**: 실시간 날씨 데이터를 가져옵니다.
- **TailwindCSS**: 유틸리티 퍼스트 CSS 프레임워크로, 빠르고 쉽게 스타일링할 수 있습니다.
- **MDX**: Markdown과 JSX를 결합하여 콘텐츠를 작성할 수 있습니다.
