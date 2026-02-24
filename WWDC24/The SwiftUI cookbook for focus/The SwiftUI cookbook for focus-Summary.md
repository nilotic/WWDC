# The SwiftUI cookbook for focus

## ✨ 개요

- 세션 주제: **The SwiftUI cookbook for focus**
- 세션 링크: `https://developer.apple.com/videos/play/wwdc2023/10162/`
- 핵심 소개: 세션 소개 및 Transcript를 기반으로 핵심 내용을 정리했습니다.
- 왜 중요한지: 배포/운영 자동화는 개발 속도와 운영 리스크를 동시에 줄여 팀 생산성에 직접 영향을 주기 때문입니다.
- 언제 쓰는지: CI/CD 고도화, TestFlight 운영 자동화, App Store 운영 자동화 설계 시 유용합니다.
- 이 세션에서 특히 봐야 할 포인트

  - `What is focus`: that the system uses to find the target of the interaction.
  - `Ingredients`: Now that you know a little about what focus is and how it appears in your app, I can lay out the first course, a look at the basic ingredients that go into every app's focus exp...
  - `Ingredients: Focusable views`: The main ingredient to consider when cooking with focus is the focused view itself.
  - `Ingredients: Focus state`: The next ingredient relates to the state of the focus system from moment to moment.

## 🧭 구조

- 세션은 챕터 기준으로 점진적으로 개념/구현/운영 포인트를 쌓는 구조입니다.
- 챕터 흐름 요약

  - **What is focus**
    - that the system uses to find the target of the interaction.
    - Focus provides the extra information that the system needs to direct input without a pointer cursor.
  - **Ingredients**
    - Now that you know a little about what focus is and how it appears in your app, I can lay out the first course, a look at the basic ingredients that go into every app's focus experience: focusable views, focus state, focused values, and focus sections.
  - **Ingredients: Focusable views**
    - The main ingredient to consider when cooking with focus is the focused view itself.
    - In iOS 17 and macOS Sonoma, there are new APIs for custom controls to participate in the focus system.
  - **Ingredients: Focus state**
    - The next ingredient relates to the state of the focus system from moment to moment.
    - This ingredient is aptly named "FocusState".
  - **Ingredients: Focused values**
    - Next up, the Focused Values API.
    - The Focused Values API solves the problem of how to build data dependencies that link remote parts of your user interface.
  - **Ingredients: Focused sections**
    - The last ingredient is the Focus sections API.
    - Focus sections give you a way to influence how focus moves when someone swipes on an Apple TV Remote or presses the Tab key on a keyboard.
  - **Recipes**
    - I'll take you through some recipes that combine the staple ingredients I just described to polish the look and feel of custom controls and remove friction from common tasks.
    - You may recognize it from his WWDC22 video.
  - **Recipes: Controlling focus**
    - This first recipe shows how a dash of programmatic focus movement can make editing my grocery list a delightful experience.
    - When the grocery list sheet appears, it always has an empty item at its end.
  - **Recipes: Custom focusable control**
    - Next up, let's use some more of the ingredients to improve the focus interactions for a custom control that I've created.
    - At this point, I've cataloged a lot of recipes.
  - **Recipes: Grid view**
    - The last recipe is for a focusable grid view that I've been building to showcase the pictures I've been taking of my finished results.
    - I'm building this as a lazy grid, and I've already implemented some selection behavior.

- 실전 해석: 초반 챕터는 개념 정의, 중반은 구성/API 적용, 후반은 운영/확장 포인트로 읽으면 팀 공유 자료로 활용하기 좋습니다.

## 🛠️ 세부 API

- 세션에서 반복적으로 등장하거나 설계상 중요한 API/개념

  - **SwiftUI**
    - 왜 중요한지: 이 세션의 핵심 구현 전략 또는 설계 판단 포인트를 구성하는 요소입니다.
    - 언제 쓰는지: 실제 기능 구현/리팩터링/마이그레이션 설계 시 우선 검토 대상입니다.
  - **protocol**
    - 왜 중요한지: 이 세션의 핵심 구현 전략 또는 설계 판단 포인트를 구성하는 요소입니다.
    - 언제 쓰는지: 실제 기능 구현/리팩터링/마이그레이션 설계 시 우선 검토 대상입니다.
  - **Task**
    - 왜 중요한지: 이 세션의 핵심 구현 전략 또는 설계 판단 포인트를 구성하는 요소입니다.
    - 언제 쓰는지: 실제 기능 구현/리팩터링/마이그레이션 설계 시 우선 검토 대상입니다.
  - **struct**
    - 왜 중요한지: 이 세션의 핵심 구현 전략 또는 설계 판단 포인트를 구성하는 요소입니다.
    - 언제 쓰는지: 실제 기능 구현/리팩터링/마이그레이션 설계 시 우선 검토 대상입니다.
  - **property wrapper**
    - 왜 중요한지: 이 세션의 핵심 구현 전략 또는 설계 판단 포인트를 구성하는 요소입니다.
    - 언제 쓰는지: 실제 기능 구현/리팩터링/마이그레이션 설계 시 우선 검토 대상입니다.
  - **FocusState**
    - 왜 중요한지: 이 세션의 핵심 구현 전략 또는 설계 판단 포인트를 구성하는 요소입니다.
    - 언제 쓰는지: 실제 기능 구현/리팩터링/마이그레이션 설계 시 우선 검토 대상입니다.
  - **FocusedBinding**
    - 왜 중요한지: 이 세션의 핵심 구현 전략 또는 설계 판단 포인트를 구성하는 요소입니다.
    - 언제 쓰는지: 실제 기능 구현/리팩터링/마이그레이션 설계 시 우선 검토 대상입니다.
  - **WWDC22**
    - 왜 중요한지: 이 세션의 핵심 구현 전략 또는 설계 판단 포인트를 구성하는 요소입니다.
    - 언제 쓰는지: 실제 기능 구현/리팩터링/마이그레이션 설계 시 우선 검토 대상입니다.
  - **@FocusedBinding**
    - 왜 중요한지: 이 세션의 핵심 구현 전략 또는 설계 판단 포인트를 구성하는 요소입니다.
    - 언제 쓰는지: 실제 기능 구현/리팩터링/마이그레이션 설계 시 우선 검토 대상입니다.
  - **FocusedValueKey**
    - 왜 중요한지: 이 세션의 핵심 구현 전략 또는 설계 판단 포인트를 구성하는 요소입니다.
    - 언제 쓰는지: 실제 기능 구현/리팩터링/마이그레이션 설계 시 우선 검토 대상입니다.

- 실전 개발자 관점: API 이름 자체보다 **상태 경계, 에러 처리, 성능 영향, 테스트 전략**까지 함께 봐야 재사용 가능한 패턴이 됩니다.

## 🔍 차이점

- 세션의 핵심은 단순 API 사용법보다, **문제를 어떻게 모델링하고 어떤 레이어에 배치하는지**를 보여주는 데 있습니다.
- 같은 기능도 Apple 권장 패턴을 따르면 상태 관리·에러 처리·성능 최적화 포인트가 더 명확해집니다.
- 실전 도입은 전체 교체보다 “파일럿 적용 → 패턴 검증 → 공통화” 순서가 리스크를 줄입니다.
- 운영 자동화 측면에서 polling 중심 접근보다 webhook/event-driven 설계를 강조한다는 점이 기존 운영 방식과 가장 큰 차이입니다.

## 🧪 실전 포인트

- 아키텍처: 세션에서 제시한 패턴을 전체 코드베이스에 즉시 적용하기보다, 변동성이 큰 모듈/화면/플로우부터 파일럿 적용 후 표준화하세요.
- UX: 배포 파이프라인 안정성은 결국 출시 속도와 사용자 피드백 반영 속도로 이어집니다.
- 주의사항: 데모 코드는 개념 전달 중심인 경우가 많으므로, 프로덕션 적용 시에는 오류 처리, 취소, 로깅, 관측성(metrics), 롤백 전략을 보강해야 합니다.
- 설계 판단 기준: 도입 이점(가독성/성능/안정성/개발속도)과 비용(학습/마이그레이션/테스트/호환성)을 팀 단위로 비교해 우선순위를 정하세요.
- 세션 기반 체크포인트

  - `Ingredients: Focused values`: Next up, the Focused Values API.
  - `Ingredients: Focused sections`: The last ingredient is the Focus sections API.

## ✅ 핵심 정리

- 이 세션은 **The SwiftUI cookbook for focus**를 단순 기능 소개가 아니라, 실제 제품/서비스 코드에 적용할 때 필요한 설계 판단 관점까지 연결해 이해하는 데 가치가 있습니다.
- 특히 실무에서는 “무엇을 도입할까”보다 “어떤 문제에 어떤 경계와 패턴으로 적용할까”를 합의하는 기준 문서로 활용하기 좋습니다.

핵심 메시지 한 문장: 세션의 핵심은 API 사용법 자체보다, 제품 요구사항과 운영 조건에 맞춰 도입 범위와 설계 경계를 판단하는 기준을 만드는 데 있습니다.
