# WWDC26 Translate your app using agents in Xcode 요약

- Session: 213
- Title: Translate your app using agents in Xcode
- Source: https://developer.apple.com/videos/play/wwdc2026/213/
- Speaker: Avery, Localization team engineer
- Topic: Xcode 27, String Catalogs, coding agents, localization workflow
- Chapters: Introduction / Add translations / Review and iterate / Best practices
- Basis: Apple Developer 공식 전체 transcript 및 Code 섹션

---

## 🎯 한 줄 요약

Xcode 27은 String Catalog에 축적된 **문자열의 코드 위치, 사용 방식, 자동 생성 comment, 유사 용어, 기존 언어의 번역**을 coding agent에게 컨텍스트로 제공해 앱 전체 번역을 자동화하고, 이후 **Preview·TestFlight·번역 가이드 파일**을 이용해 사람이 검토하고 용어와 스타일을 반복 개선할 수 있게 한다.

---

## 🧭 왜 일반 LLM 번역만으로는 부족한가

일반적인 LLM은 자연어 번역 능력 자체는 뛰어나지만, 소프트웨어 문자열은 **맥락이 없으면 같은 단어가 완전히 다른 의미를 가질 수 있다.** 세션의 대표 예시는 `book`이다.

- 명사: 읽는 **책**
- 동사: 방이나 서비스를 **예약하다**

영어에서는 같은 철자지만 다른 언어에서는 서로 전혀 다른 번역이 필요하다. 따라서 앱 번역 품질을 높이려면 문자열만 모델에 전달하는 것이 아니라 **앱 안에서 그 문자열이 어떤 UI와 코드 맥락에서 쓰이는지**를 제공해야 한다.

Apple은 이 문제를 String Catalog의 발전 과정과 연결한다.

- 2년 전: String Catalog가 **문자열이 코드 어디에서 쓰이는지** 추적하기 시작
- 작년: 문자열이 **어떻게 사용되는지** 추적하고 descriptive comment를 자동 생성
- Xcode 27: 이 컨텍스트를 coding agent에게 전달해 **직접 번역에 활용**

즉, Xcode의 agent 기반 번역은 단순한 “문자열 → 번역문” 요청이 아니라 **IDE가 이미 알고 있는 localization metadata를 번역 컨텍스트로 재사용하는 구조**다.

---

## 🌍 번역 시작 전: UI 문자열이 localizable해야 한다

세션의 예제 앱은 세계 여러 landmark를 소개하는 SwiftUI 앱이다. SwiftUI의 대표적인 UI API는 문자열을 기본적으로 localization 대상으로 처리한다.

```swift
Text("Hello, world!", comment: "A standard greeting")
```

`Text`, `Button` 같은 SwiftUI API에 전달한 문자열은 자동으로 localization workflow에 들어간다.

특정 String Catalog로 분리하고 싶다면 custom table name을 사용할 수 있다.

```swift
Text(
    "Hello, world!",
    tableName: "Greetings",
    comment: "A standard greeting"
)
```

이 경우 Xcode는 문자열을 `Greetings`라는 String Catalog에 배치한다.

SwiftUI UI API 바깥의 일반 Swift 문자열은 명시적으로 localization API를 사용해야 한다.

```swift
String(
    localized: "Hello, world!",
    comment: "A standard greeting"
)
```

또는:

```swift
LocalizedStringResource(
    "Hello World!",
    bundle: #bundle,
    comment: "A standard greeting"
)
```

**Agent가 아무리 잘 번역해도 source string이 localization 대상으로 노출되어 있지 않으면 번역할 수 없다.** 따라서 첫 번째 점검은 모든 user-facing string이 localizable한지 확인하는 것이다.

---

## 🤖 Xcode에서 agent에게 앱 번역을 요청하면 일어나는 일

세션에서는 Xcode toolbar의 **New Conversation**에서 agent에게 프로젝트 전체를 Canadian French로 번역해 달라고 요청한다.

Agent와 Xcode는 다음 순서로 작업한다.

### 🧱 프로젝트를 localization 가능 상태로 준비

먼저 Xcode가 프로젝트 설정에 새 언어를 추가한다. 예제에서는 **Canadian French**다.

그 다음 Xcode는 지원 플랫폼의 모든 target을 빌드한다. 이 단계가 중요한 이유는 빌드 과정에서 **프로젝트에 존재하는 모든 localizable string을 다시 발견**하기 때문이다.

이후:

- 새로 발견된 문자열을 String Catalog에 추가
- String Catalog가 없다면 자동 생성
- 기본 catalog 이름은 `Localizable`
- custom table name을 사용하면 별도의 catalog 생성

세션의 프로젝트에서는 이 과정을 통해 navigator에 새 String Catalog 네 개가 생긴다.

### 🔎 번역할 String Catalog 선택

프로젝트 전체 번역을 요청했기 때문에 agent가 네 개의 String Catalog를 모두 읽는다.

이 단계에서 agent는 단순한 key/value 목록이 아니라 Xcode가 제공하는 문자열별 컨텍스트도 함께 사용할 수 있다.

### 🧑‍🤝‍🧑 Subagent로 번역 분산

실제 번역은 agent가 문자열을 여러 batch로 나누고 **개별 subagent에게 위임**한다.

Xcode가 각 subagent에게 전달할 수 있는 컨텍스트 예시는 다음과 같다.

- 해당 문자열이 코드 어디에서 사용되는지
- 비슷한 용어를 사용하는 다른 문자열 목록
- 다른 언어에서 이미 어떻게 번역되어 있는지
- plural variation 등 String Catalog metadata

이 구조는 대규모 프로젝트를 여러 agent가 병렬로 번역하더라도 **용어 일관성을 유지할 수 있게 하는 기반**이 된다.

---

## 🔢 Pluralization도 언어 규칙에 맞게 처리

세션에서는 `%lld items`라는 문자열을 예로 든다.

`%lld`는 runtime에 숫자로 교체되고, 영어에서는 수에 따라 예를 들어 다음처럼 달라진다.

- one item
- two items

Canadian French에서도 agent는 해당 언어에 필요한 plural variation을 생성한다.

중요한 점은 **언어마다 plural category의 개수와 규칙이 다르다**는 것이다. Xcode가 String Catalog metadata를 통해 target language에 어떤 variation이 필요한지 subagent에게 알려 주므로 모델이 영어의 단수/복수 구조를 다른 언어에 그대로 투영하지 않도록 돕는다.

---

## 🇨🇦 번역 품질은 “정답”보다 제품의 언어 스타일에 달려 있다

첫 자동 번역에서 `landmarks`는 Canadian French로 `lieux d'intérêt`로 번역된다. 의미상 매우 자연스러운 번역이지만, 발표자는 Canadian tourism industry에서 더 친숙하게 쓰이는 **`attraits`**라는 표현을 선호한다.

여기서 중요한 워크플로가 나온다.

1. Agent에게 특정 용어를 바꾸라고 요청
2. Agent가 프로젝트 전체의 관련 문자열 탐색
3. 앱 이름 및 문장 안의 같은 개념까지 함께 수정
4. 이후 새 기능을 추가해도 기존 translation terminology를 재사용

예제에서는 앱 이름도 `Attraits phares`로 바꾸고, “Draw a sketch of this landmark” 같은 다른 문자열도 함께 수정된다.

이후 **완전히 새로운 conversation**에서 새 기능을 만들고 번역하더라도 Xcode가 String Catalog의 기존 번역을 컨텍스트로 제공하기 때문에 agent는 `landmarks`를 기본 번역으로 되돌리지 않고 `attraits`를 재사용한다.

즉, **agent conversation history가 없어도 String Catalog 자체가 프로젝트 수준의 번역 기억 역할**을 한다.

---

## 🧩 기능 개발과 번역을 한 번에 수행

이미 localized된 앱에 새 기능을 추가할 때도 별도 localization phase를 나중에 만들 필요는 없다.

세션에서는 agent에게 다음을 한 번에 요청한다.

- featured landmark 아래에 새 label 추가
- 사용자가 앱의 모든 landmark를 발견하도록 유도하는 문구 작성
- 새 기능을 Canadian French로 번역

Agent는 기능 구현 후 새 문자열을 String Catalog에 넣고, 영어와 Canadian French 양쪽에 필요한 plural variation까지 추가한다.

이 접근은 localization을 **출시 직전 별도 작업이 아니라 기능 개발 loop의 일부**로 만든다.

---

## 🔍 번역 후에는 반드시 실제 UI로 검토

번역 문자열이 문법적으로 맞는 것과 실제 앱 UI에서 올바르게 보이는 것은 별개의 문제다.

언어마다 문장 길이, 글자 높이, 방향성이 다르다.

세션에서 언급한 예:

- Canadian French: 영어보다 평균적으로 문장이 길어 **truncation** 가능
- Thai: 글자 형태가 높아 **vertical clipping** 가능
- Arabic: right-to-left이므로 **alignment/layout 문제** 가능

발표자는 agent에게 Canadian French 상태로 새 UI를 렌더링하고 truncation이 있는지 확인해 달라고 요청한다. Xcode Preview에서 실제로 문장 끝이 잘린 문제를 발견한다.

문제를 발견한 다음 가능한 대응은 여러 가지다.

- 구현 버그 수정
- 긴 문자열을 수용하도록 UI 재설계
- 정말 필요한 경우 더 짧은 번역을 agent에게 요청

**첫 반응으로 번역을 무조건 짧게 만드는 것이 아니라 UI가 localization 친화적인지 먼저 검토**하는 것이 포인트다.

---

## 🔄 Agent를 이용한 localization QA loop

세션에서 보여 주는 반복 흐름은 다음과 같다.

```text
기능 구현
   ↓
문자열 discovery / String Catalog 업데이트
   ↓
Agent 번역
   ↓
Target language Preview 렌더링
   ↓
Truncation / clipping / RTL 검사
   ↓
UI 또는 번역 수정
   ↓
다시 Preview
```

이 방식은 localization QA를 feature development와 매우 가까운 위치로 끌어온다.

---

## 👥 번역을 모르는 언어에서는 native speaker 검토가 더 중요

개발자가 coding agent의 코드를 검토할 수 있는 이유는 개발자 자신이 코드의 correctness와 nuance를 판단할 수 있기 때문이다.

하지만 **말하지 못하는 언어의 번역은 같은 방식으로 검토할 수 없다.** 따라서 agent의 출력만 보고 품질을 확신하면 안 된다.

Apple은 이 부분에서 **TestFlight**를 적극 활용하라고 권한다.

Native speaker tester는 다음을 전달할 수 있다.

- 어색한 번역 제안
- 용어 선택 피드백
- 실제 화면의 localization 문제 screenshot
- 문화적으로 부자연스러운 표현

Agent 번역은 초기 생산성을 크게 높이지만, 최종 품질 확보에는 **실제 target-language 사용자 피드백**이 필요하다.

---

## 📝 Translation guidance를 프로젝트에 명시적으로 제공

Agent는 Xcode에 포함된 **language-specific style guide**를 통해 Apple의 번역 관련 지침을 사용할 수 있다. 하지만 앱마다 고유한 제품 언어가 있기 때문에 추가 guidance가 필요할 수 있다.

예를 들면:

- 특정 단어의 고정 번역
- 번역하면 안 되는 product name
- trademark는 원문 유지
- formal / casual tone
- 어린이용 앱처럼 특정 audience를 위한 어조
- 금융 앱처럼 정확성과 신뢰감을 우선하는 문체

이러한 내용을 `AGENTS.md` 같은 agent instruction 파일에 넣을 수 있다.

하지만 번역 지침은 일반 coding task에서는 불필요한 컨텍스트이므로 Apple은 별도 **`TRANSLATION.md`** 파일을 만들고 `AGENTS.md`에서 참조하는 방식을 권장한다.

예시 구조:

```text
AGENTS.md
└─ Translation 작업을 할 때 TRANSLATION.md를 참고

TRANSLATION.md
├─ Preferred terminology
├─ Terms that must not be translated
├─ Product / trademark rules
├─ Tone and voice
└─ Language-specific notes
```

이렇게 하면 agent가 일반 프로그래밍 작업에는 translation context를 로드하지 않고, 번역 task에서만 필요한 지침을 읽는다.

---

## 🧠 모델 선택도 번역 품질에 영향을 준다

앱 전체 번역은 단일 문자열 몇 개를 바꾸는 것과 달리 **긴 작업**이며, 프로젝트 전체에서 terminology consistency를 유지해야 한다.

세션에서 권장하는 모델 특성:

- **큰 context window**
- 긴 요청을 안정적으로 처리
- target language에 충분한 학습 데이터

언어마다 일반 모델 학습 데이터에서 등장하는 빈도가 다르기 때문에 일부 언어는 번역 품질이 낮을 수 있다. 또한 모델별로 특정 언어 능력이 달라질 수 있다.

따라서 Apple은 **사용하는 model provider의 language distribution 관련 문서**도 확인하라고 권한다.

---

## 🏷️ XLIFF에서 agent 번역 여부 확인

Xcode에서 localization을 export한 경우 XLIFF의 **`state-qualifier="leveraged-mt"`**로 agent가 제공한 번역을 식별할 수 있다.

공식 Code 섹션 예제:

```xml
<trans-unit id="Grand Canyon" xml:space="preserve">
  <source>Grand Canyon</source>
  <target state="translated" state-qualifier="leveraged-mt">Grand Canyon</target>
  <note>Name of the ‘Grand Canyon’ landmark.</note>
</trans-unit>
```

이 metadata는 exported localization workflow에서 **어떤 문자열이 machine translation을 통해 채워졌는지 추적**하는 데 사용할 수 있다.

---

## 🛠️ 실제 프로젝트 적용 순서

### 준비

- [ ] 모든 user-facing string이 localizable한지 확인
- [ ] SwiftUI의 `Text`, `Button` 등 자동 localization 활용
- [ ] 일반 Swift 문자열은 `String(localized:)` 또는 `LocalizedStringResource` 사용
- [ ] 의미 있는 `comment` 추가
- [ ] 필요하면 table name으로 String Catalog 분리

### 첫 번역

- [ ] Xcode agent에게 target language 추가 및 번역 요청
- [ ] Xcode가 모든 target을 빌드하도록 허용
- [ ] 새 문자열이 String Catalog에 발견되었는지 확인
- [ ] plural variation 확인
- [ ] terminology consistency 확인

### 제품 언어 보정

- [ ] 제품에서 선호하는 번역 용어 정의
- [ ] product/trademark의 untranslated list 작성
- [ ] target audience에 맞는 tone 작성
- [ ] `TRANSLATION.md`에 guidance 저장
- [ ] `AGENTS.md`에서 translation task에만 해당 파일을 참조하도록 구성

### UI 검토

- [ ] Scheme의 Run language를 target language로 전환
- [ ] Xcode Preview에서 주요 화면 렌더링
- [ ] 긴 언어에서 truncation 검사
- [ ] Thai 같은 tall script에서 vertical clipping 검사
- [ ] Arabic/Hebrew 같은 RTL 언어의 alignment 검사
- [ ] UI를 먼저 수정할지 번역을 조정할지 판단

### 사람 검토

- [ ] Native speaker를 TestFlight tester로 포함
- [ ] Screenshot 기반 localization feedback 수집
- [ ] 용어·어조 피드백을 String Catalog와 `TRANSLATION.md`에 반영
- [ ] 반복적으로 같은 수정이 필요하면 glossary로 승격

### Export workflow

- [ ] XLIFF export 시 `leveraged-mt` 확인
- [ ] Agent 번역과 사람이 검토한 번역의 상태를 운영 프로세스에 반영

---

## ⚠️ 자주 놓치기 쉬운 포인트

### Agent conversation이 번역 일관성의 유일한 기억이 아니다

새 conversation을 시작해도 Xcode는 String Catalog에 있는 기존 번역을 agent에게 context로 전달할 수 있다. 따라서 용어 consistency의 핵심 자산은 **프로젝트의 localization data**다.

### 모든 target을 빌드하는 이유가 있다

번역 전에 Xcode가 target을 빌드하는 단계는 단순 build verification이 아니라 **localizable string discovery**다. 빌드되지 않는 target이나 경로는 String Catalog에 필요한 문자열이 완전하게 반영되지 않을 수 있다.

### 번역 품질과 UI 품질을 구분한다

문장이 잘리는 현상은 항상 번역이 나빠서가 아니다. 원래 UI가 영어 길이에만 맞춰져 있었을 수도 있다. Localization QA에서는 **translation defect와 layout defect를 분리해서 판단**해야 한다.

### 모르는 언어를 agent 출력만으로 승인하지 않는다

코드와 달리 개발자가 직접 정확성을 판단할 수 없는 언어는 TestFlight와 native speaker review가 필수적인 보완 수단이다.

---

## 📚 세션이 연결하는 관련 자료

- **Xcode, agents, and you** — Xcode agent 전반
- **Code-along: Explore localization with Xcode** — localization API와 workflow
- **Build multilingual-ready apps** — 다양한 언어의 text layout/formatting
- **Get it right (to left)** — RTL UI 대응
- **Get started with TestFlight** — 외부 tester 피드백 수집
- **Localizing your app using agents** — Apple Developer resource
- **Expanding Your App to New Markets** — 시장 확대 관련 자료

---

## 🔑 핵심 메시지

Xcode 27의 agent 기반 번역 기능의 핵심은 번역 모델 자체보다 **Xcode가 이미 알고 있는 앱의 localization context를 모델에 공급한다는 점**이다. String Catalog는 코드 위치, 사용 방식, comment, plural variation, 기존 번역을 축적하고, agent는 이를 이용해 프로젝트 전체에서 일관된 번역을 생성한다.

하지만 자동 번역으로 끝나는 기능은 아니다. Apple이 제시하는 전체 흐름은 **agent로 초기 번역 → 실제 UI Preview에서 검증 → native speaker의 TestFlight 피드백 → glossary와 `TRANSLATION.md`로 제품 언어를 체계화 → 다음 기능 번역에 다시 재사용**하는 지속적인 localization workflow다.
