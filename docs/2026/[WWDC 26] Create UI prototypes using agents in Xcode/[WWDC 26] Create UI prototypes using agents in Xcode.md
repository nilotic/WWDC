# WWDC26 Create UI prototypes using agents in Xcode 요약

- Session: 227
- Title: Create UI prototypes using agents in Xcode
- Source: https://developer.apple.com/videos/play/wwdc2026/227/
- Topic: Xcode, Coding Agents, SwiftUI, Prototyping, Xcode Previews, Interaction Design
- Chapters: Introduction, Exploring UI possibilities, Making your app feel lived in, Tuning key moments, Next steps

---

## 한 줄 요약

Xcode의 coding agents와 SwiftUI previews를 함께 사용하면 여러 UI 방향을 빠르게 생성하고, 실제 콘텐츠와 엣지 케이스를 적용해 검증하며, 애니메이션과 상호작용을 위한 전용 tuning panel까지 만들어 프로토타이핑의 피드백 루프를 크게 단축할 수 있다.

---

## 핵심 요약

이번 세션은 coding agents를 완성된 디자인을 대신 만드는 도구가 아니라, 더 많은 가능성을 빠르게 탐색하고 비교하기 위한 **프로토타이핑 협업 도구**로 사용하는 방법을 설명한다.

- **UI 가능성을 넓게 탐색**
  - 모호한 요청 하나로 단일 UI를 만들지 않기
  - 원하는 기능과 분위기를 구체적으로 설명
  - 처음부터 여러 variation을 요청
  - 각 variation을 독립적인 SwiftUI preview로 생성
  - 마음에 드는 요소를 골라 remix하고 반복

- **실제 사용처럼 보이게 만들기**
  - 빈 placeholder 대신 현실적인 sample content 사용
  - empty state, 긴 텍스트, 많은 멤버 등 엣지 케이스 확인
  - 다양한 상태를 각각 preview로 구성
  - UI가 실제 콘텐츠에서 무너지는 지점을 빠르게 발견

- **핵심 인터랙션을 튜닝**
  - animation, transition, friction, inertia, device motion, haptics 검토
  - 값이 여러 코드 위치에 흩어져 있으면 tuning panel 생성
  - 애니메이션을 phase 단위로 분리
  - UI와 tuning controls를 넓은 preview에서 나란히 배치
  - 짧은 피드백 루프로 최적값을 찾기

가장 중요한 원칙은 coding agent에 판단을 위임하지 않는 것이다.

Agent는 아이디어를 빠르게 시도하는 협업자이고, 어떤 경험이 사용자에게 가장 적합한지 결정하는 것은 개발자와 디자이너의 판단이다.

---

# 🧭 프로토타이핑이 중요한 이유

좋은 인터랙션과 세련된 순간은 대개 한 번에 만들어지지 않는다.

다음 과정을 반복하면서 완성된다.

- 많은 아이디어 시도
- 실패
- 비교
- 조정
- 제거
- 재구성
- 세부 값 튜닝

프로토타이핑은 완성된 구현 전에 이런 과정을 빠르게 반복하기 위한 방법이다.

이번 세션에서는 Xcode의 두 기능을 결합한다.

| 기능 | 역할 |
|---|---|
| Coding agents | 자연어 설명을 코드 변경과 기능 구현으로 변환 |
| Xcode previews | 앱 전체를 다시 빌드하지 않고 UI를 즉시 시각화하고 상호작용 |

두 기능을 함께 사용하면 agent가 생성한 실제 native code를 preview에서 바로 비교할 수 있다.

생성된 코드는 단순한 이미지 mockup이 아니라 이후 앱 개발에 이어서 사용할 수 있는 SwiftUI 코드다.

---

# 🤝 Agent는 디자이너가 아니라 협업자

세션에서 가장 강하게 강조하는 메시지는 다음과 같다.

> Critical thinking을 도구에 위임하지 말라.

Coding agent는 빠르게 다양한 시도를 만들 수 있지만, 다음을 스스로 결정해 주지는 않는다.

- 앱이 해결해야 할 문제
- 어떤 기능이 정말 필요한지
- 어떤 정보 구조가 적절한지
- 어떤 시각적 분위기가 브랜드에 맞는지
- 어떤 인터랙션이 사람에게 가장 자연스러운지

Agent는 가능한 답안을 빠르게 만드는 역할을 한다.

최종 선택과 판단은 사람이 해야 한다.

---

# 🎨 UI 가능성을 넓게 탐색하기

세션에서는 정기적으로 만나는 독서 모임을 관리하는 앱을 예제로 사용한다.

처음에는 다음처럼 요청하기 쉽다.

> Create a UI for managing a book club that meets regularly.

이런 prompt는 매우 빠르게 UI를 만들 수 있지만 너무 모호하다.

Agent는 부족한 정보를 스스로 추측하게 된다.

그 결과 다음 문제가 생길 수 있다.

- 임의의 navigation 구조 생성
- 요청하지 않은 기능 추가
- 잘못된 feature set에 맞춘 layout
- 이후 변경하기 어려운 초기 구조
- 불필요한 feature creep
- 화면의 복잡도 증가

따라서 초기 prompt에는 앱의 목적, 핵심 기능, 정보 구조, 분위기, 스타일 방향을 구체적으로 제공해야 한다.

---

# ✍️ 더 좋은 초기 Prompt 작성

초기 UI 탐색에서는 agent보다 사용자가 앱에 대해 더 많은 정보를 알고 있다.

Prompt에 다음 내용을 명확히 제공한다.

- 앱이 해결하려는 문제
- 필수 기능
- 핵심 정보
- 주요 사용자 흐름
- 원하는 분위기
- 시각적 참고 방향
- 만들어야 하는 variation 수
- 각 variation의 preview 구성 방식

독서 모임 앱이라면 다음처럼 방향을 제시할 수 있다.

- 커피숍처럼 따뜻한 분위기
- 종이의 질감을 연상시키는 디자인
- 아름다운 typography 중심
- 책 표지를 강조
- 편집 디자인 같은 정돈된 화면

스타일을 구체적으로 지정하는 것은 결과를 하나로 제한하기 위한 것이 아니라, 무작위 결과를 줄이기 위한 출발점이다.

---

# 🌈 처음부터 여러 Variation 요청

초기 단계에서는 하나의 완성도 높은 화면보다 여러 방향을 비교하는 것이 더 중요하다.

따라서 agent에게 명시적으로 여러 variation을 요청한다.

세션에서는 10개의 서로 다른 UI 방향을 생성한다.

각 variation은 독립적인 이름과 SwiftUI preview를 가진다.

예시는 다음과 같다.

- Club Hub
- Cozy
- Editorial
- Blueprint Atelier
- Racetrack metaphor를 사용한 progress UI

각 preview가 독립되어 있기 때문에 Xcode canvas에서 빠르게 전환하며 비교할 수 있다.

이 방식은 한 UI에 너무 빨리 고착되는 것을 방지하고, navigation, typography, layout, visual metaphor를 동시에 비교하게 해준다.

---

# 🔀 Go Wide, Remix, Repeat

여러 variation을 만들면 각 결과 전체가 마음에 들지 않아도 일부 요소는 유용할 수 있다.

예를 들어 다음 요소가 각각 다른 variation에 있을 수 있다.

- Cozy의 typography
- Club Hub의 navigation
- Racetrack의 progress visualization
- Editorial의 layout
- 특정 variation의 현재 책 이미지 표현

다음 prompt에서는 마음에 든 요소를 구체적으로 나열하고 새로운 조합을 요청한다.

이 과정은 다음 패턴으로 반복된다.

> Go wide → Remix → Repeat

즉,

- 많은 방향 생성
- 좋은 요소 선택
- 서로 다른 variation의 요소 조합
- 새 variation 생성
- 다시 비교
- 불필요한 요소 제거
- 점진적으로 방향 좁히기

---

# 🏠 앱을 실제 사용된 것처럼 만들기

UI 구조가 어느 정도 정해지면 다음 단계는 실제 콘텐츠를 넣어보는 것이다.

빈 placeholder만 있는 화면은 실제 앱이 어떻게 느껴질지 판단하기 어렵다.

실제에 가까운 콘텐츠를 적용하면 layout 문제와 사용자 경험의 약점을 훨씬 빨리 발견할 수 있다.

예:

- 실제 길이의 책 제목
- 실제 독서 토론 내용
- 다양한 길이의 설명
- 여러 사용자 이름
- 모임 장소
- 다음 미팅 정보
- 이전에 읽은 책 목록

Agent를 이용해 이런 sample content를 생성하고, 실제 이미지까지 적용하면 앱이 실제로 사용되는 상태에 가까운 프로토타입을 만들 수 있다.

---

# 🧪 여러 상태를 Preview로 만들기

실제 콘텐츠를 넣을 때도 한 가지 상태만 만들지 않는다.

여러 상태를 각각 preview로 만들어 비교한다.

예:

- 정상 데이터
- Empty state
- 다음 모임이 없는 상태
- 매우 긴 설명
- 매우 긴 책 제목
- 멤버가 적은 상태
- 멤버가 매우 많은 상태
- 토론 메시지가 많은 상태
- 이전 책이 많은 상태

각 variation에 설명적인 이름을 붙이면 agent와 대화할 때 특정 결과를 쉽게 참조할 수 있다.

---

# ⚠️ 직접 엣지 케이스를 생각하기

Agent가 모든 엣지 케이스를 자동으로 찾아줄 것이라고 기대하면 안 된다.

개발자가 먼저 생각하고 prompt에 구체적으로 포함해야 한다.

세션에서 제시한 예시는 다음과 같다.

- 아직 다음 모임이 예약되지 않았다면?
- 멤버 수가 매우 많다면?
- 토론 메시지가 매우 길다면?
- 이전에 읽은 책이 많다면?
- 입력 텍스트가 예상보다 길다면?
- 텍스트를 truncate해야 하는가?
- 여러 줄을 허용해야 하는가?

특히 **크기가 무제한으로 증가할 수 있는 UI 요소**를 주의 깊게 확인한다.

---

# 🗂️ Sample Model을 재사용 가능하게 구성

Agent에게 sample content를 생성하게 할 때 데이터가 화면 코드 안에 흩어지지 않도록 요청하는 것이 좋다.

Sample model을 별도 파일에 구성하면 다음 장점이 있다.

- 직접 내용 수정 가능
- 여러 preview에서 재사용
- 다른 프로토타입에서 활용
- 상태별 dataset 관리
- edge case 테스트 단순화

Prompt에서 sample model이 읽기 쉽고 수정하기 쉬우며 여러 preview에서 재사용 가능하도록 요청할 수 있다.

---

# 🔍 실제 콘텐츠로 발견하는 UI 문제

세션에서는 sample data를 넣은 후 여러 문제가 발견된다.

## Blank Slate UI 부족

처음 사용자가 앱을 열었을 때 무엇을 해야 하는지 명확하지 않았다.

다음 기능을 추가한다.

- 새 책 지정
- 계정 관리
- 명확한 call-to-action

## 긴 Meeting Description

다음 모임 설명이 너무 길면 책 표지 영역을 침범할 수 있다.

해결 방법:

- 적절한 truncation 적용
- 정보 우선순위 조정

## 중복된 책 제목

책 표지에 이미 제목이 있는데 화면에도 같은 제목이 반복되어 시각적으로 중복된다.

불필요한 텍스트를 제거해 구조를 단순화한다.

## 긴 Leaderboard

참가자가 많아지면 leaderboard가 너무 길어져 토론 영역까지 스크롤해야 한다.

개선:

- 현재 사용자의 상대적 순위는 항상 표시
- 전체 목록은 expand control로 열기

---

# 🎨 콘텐츠에 반응하는 UI

실제 책 표지 이미지를 적용하면서 새로운 디자인 아이디어가 나올 수도 있다.

세션에서는 detail page가 책 표지의 색상에 반응하도록 변경하는 아이디어를 탐색한다.

실제 콘텐츠는 단순한 테스트 데이터가 아니라 새로운 디자인 방향의 영감이 될 수 있다.

다음과 같은 요소를 콘텐츠에 맞춰 변화시킬 수 있다.

- 배경색
- accent color
- gradient
- typography contrast
- material
- 카드 스타일

---

# ✨ 핵심 순간과 인터랙션 튜닝

정적인 화면이 정리된 다음에는 앱의 동적인 부분을 다룬다.

SwiftUI에서는 다음 요소를 프로토타이핑할 수 있다.

- Animation
- Transition
- Drag interaction
- Friction
- Inertia
- Device motion
- Haptics

이런 요소는 정적인 layout보다 적절한 값을 찾기 어렵다.

미세한 차이가 전체 경험의 느낌을 크게 바꿀 수 있기 때문이다.

---

# ⏱️ Ease와 Spring Animation

Ease animation은 객체가 부드럽게 가속하거나 감속하는 형태다.

Spring animation은 spring force에 끌리는 객체의 움직임을 모방한다.

대표적인 spring parameter는 다음과 같다.

- Stiffness
- Damping
- Mass

같은 transition이라도 값에 따라 단단함, 부드러움, 무게감, 튕김 정도가 달라진다.

코드에서 상수를 하나씩 수정해도 되지만, 조절 값이 여러 위치에 흩어져 있으면 context switching이 발생한다.

---

# 🪨 Friction, Inertia, Device Motion, Haptics

드래그 가능한 UI는 사용자가 느끼는 무게감이 중요하다.

다음 요소가 느낌에 영향을 준다.

- Drag resistance
- Release velocity
- Deceleration
- Momentum
- Friction
- Inertia

Device motion은 accelerometer와 gyroscope 같은 센서에 반응하는 인터랙션을 만들 수 있다.

Haptics는 중요한 순간이나 특별한 모드를 촉각으로 전달할 수 있다.

이런 요소는 모두 실제 사용 맥락에서 여러 값을 빠르게 비교해야 적절한 수준을 찾을 수 있다.

---

# 🎛️ Tuning Panel 만들기

조절하려는 값이 여러 코드 위치에 흩어져 있다면 특정 UI를 튜닝하기 위한 전용 control panel을 만들 수 있다.

Tuning panel에는 다음 항목을 배치할 수 있다.

- Slider
- Toggle
- Picker
- Segmented control
- Numeric field
- Animation preset selector
- Reset control

사용자는 UI를 보면서 값을 즉시 바꾸고 결과를 비교할 수 있다.

이 control UI 자체도 coding agent에게 생성하도록 요청할 수 있다.

---

# 🧩 Animation을 Phase로 분리

복잡한 animation은 하나의 덩어리로 다루지 않고 여러 phase로 나눈다.

세션 예제에서는 두 단계로 나눈다.

## Phase 1

현재 화면에서 detail page로 transition한다.

## Phase 2

이후 content row가 staggered timing으로 순차적으로 나타난다.

Phase를 나누면 다음 장점이 있다.

- 특정 구간만 독립적으로 재생
- 문제 발생 위치 파악
- delay를 단계별로 조절
- agent와 명확한 공통 용어 사용
- 복잡한 animation을 이해하기 쉬움

---

# 🪟 Side-by-Side Tuning Layout

작은 화면에서 tuning panel을 modal이나 overlay로 표시하면 실제 콘텐츠를 가릴 수 있다.

세션에서는 넓은 Xcode preview canvas에서 다음을 나란히 배치하도록 권장한다.

- 실제 UI
- Tuning controls

이렇게 하면 panel을 열고 닫는 context switching 없이 값을 변경하면서 결과를 즉시 확인할 수 있다.

각 phase를 독립적으로 실행할 수 있게 만들면 delay, stagger timing, spring response 같은 특정 요소만 집중적으로 조정할 수 있다.

---

# 🎚️ Tuning Panel의 활용 범위

Tuning panel은 animation만을 위한 도구가 아니다.

다음과 같은 여러 configuration을 비교하는 데 사용할 수 있다.

- App state
- Color
- Font style
- Visual offset
- Spacing
- Corner radius
- Layout configuration
- Transition
- Animation preset

여러 설정을 반복적으로 비교해야 하는 상황이라면 tuning panel을 만들어 피드백 루프를 줄일 수 있다.

---

# 🔁 프로토타이핑 전체 흐름

| 단계 | 작업 |
|---|---|
| 문제 정의 | 앱이 해결하려는 문제와 핵심 기능 명확화 |
| 방향 탐색 | Agent에게 여러 UI variation 생성 요청 |
| Preview 비교 | 각 variation을 독립적인 SwiftUI preview에서 비교 |
| Remix | 마음에 드는 요소를 구체적으로 조합 |
| 반복 | 새로운 variation 생성 후 방향 좁히기 |
| 실제 콘텐츠 적용 | 현실적인 sample data와 이미지 사용 |
| Edge case 검증 | Empty state, 긴 텍스트, 큰 데이터셋 확인 |
| 구조 개선 | 실제 콘텐츠에서 발견한 문제 수정 |
| 동적 요소 추가 | Animation, transition, haptics 등 적용 |
| Tuning panel 생성 | 조절 가능한 parameter를 한곳에 구성 |
| Phase 분리 | 복잡한 interaction을 단계별로 검증 |
| Side-by-side 비교 | Preview와 control을 동시에 표시 |
| 최종 판단 | 사람이 가장 적절한 경험을 선택 |

---

# 📋 체크리스트

## Agent와 UI 탐색

- [ ] Agent에게 앱의 목적과 핵심 기능을 명확히 설명
- [ ] 요청하지 않은 기능을 임의로 추측하지 않도록 범위 지정
- [ ] 원하는 분위기와 시각적 방향 설명
- [ ] 처음부터 여러 UI variation 요청
- [ ] 각 variation에 고유한 이름 지정
- [ ] 각 variation을 독립적인 SwiftUI preview로 생성
- [ ] 한 결과에 너무 빨리 고착되지 않기
- [ ] 마음에 든 요소를 구체적으로 지정해 remix
- [ ] 불필요한 기능과 중복 정보 지속적으로 제거
- [ ] Agent가 아니라 사람이 최종 판단 수행

## 실제 콘텐츠와 상태

- [ ] Placeholder 대신 실제에 가까운 sample content 사용
- [ ] Sample model을 수정 가능한 별도 구조로 관리
- [ ] Empty state 확인
- [ ] 데이터가 없는 초기 상태 확인
- [ ] 매우 긴 텍스트 확인
- [ ] 멤버 수가 매우 많은 상태 확인
- [ ] 목록이 길어지는 상태 확인
- [ ] Truncation과 multiline 정책 확인
- [ ] 여러 UI 상태를 각각 preview로 구성
- [ ] 실제 이미지에서 layout과 색상 대비 확인
- [ ] 실제 사용자 테스트를 별도로 수행

## Animation과 Interaction

- [ ] Ease animation duration 비교
- [ ] Spring parameter 비교
- [ ] Drag interaction의 friction과 inertia 검토
- [ ] Device motion 사용 시 실제 기기에서 확인
- [ ] 필요한 순간에 haptic feedback 적용
- [ ] 조절 값이 여러 곳에 흩어져 있으면 tuning panel 생성
- [ ] 복잡한 animation을 phase로 분리
- [ ] 각 phase를 독립적으로 재생 가능하게 구성
- [ ] Delay와 stagger timing을 별도로 조절
- [ ] Preview와 tuning panel을 side-by-side로 배치
- [ ] 여러 animation preset을 빠르게 비교

---

# 핵심 메시지

Coding agents는 UI 디자인의 최종 결정을 대신하는 도구가 아니다.

가장 효과적인 사용법은 agent의 빠른 생성 능력을 이용해 가능한 방향을 넓게 탐색하고, Xcode previews에서 결과를 즉시 비교하며, 실제 콘텐츠와 엣지 케이스를 적용해 약점을 발견하고, tuning panel로 세부 인터랙션을 반복 조정하는 것이다.

**Go wide, remix, repeat.**

Agent가 많은 가능성을 빠르게 만들어 주더라도 어떤 경험이 사용자에게 가장 적합한지 결정하는 핵심 요소는 결국 사람의 판단이다.

---

# 함께 보면 좋은 세션

- Xcode, agents, and you
