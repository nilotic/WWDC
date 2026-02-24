# What’s new in privacy

## ✨ 개요

- 세션 주제: **What’s new in privacy**
- 세션 링크: `https://developer.apple.com/videos/play/wwdc2024/10123/`
- 핵심 소개: 세션 소개 및 Transcript를 기반으로 핵심 내용을 정리했습니다.
- 왜 중요한지: 기능 소개를 실제 제품 설계/운영 판단으로 연결할 때 비로소 세션의 가치가 커지기 때문입니다.
- 언제 쓰는지: 도입 검토 단계에서 우선순위·범위·리스크를 판단할 때 활용도가 높습니다.
- 이 세션에서 특히 봐야 할 포인트

  - `Privacy is essential`: Privacy is essential to everything we do here at Apple.
  - `Privacy pillars`: We use the The Privacy Pillars to help keep us focused on what matters.
  - `New pickers`: First, I’ll talk about new pickers that allow people to share just the data they want without permission prompts.
  - `FinanceKit transaction picker`: The first new picker comes with FinanceKit.

## 🧭 구조

- 세션은 챕터 기준으로 점진적으로 개념/구현/운영 포인트를 쌓는 구조입니다.
- 챕터 흐름 요약

  - **Privacy is essential**
    - Privacy is essential to everything we do here at Apple.
    - It is a fundamental human right, and we design our platforms to protect people.
  - **Privacy pillars**
    - We use the The Privacy Pillars to help keep us focused on what matters.
    - Apple’s Privacy Pillars are Data Minimization, On-Device Processing, Transparency and Control, and Security.
  - **New pickers**
    - First, I’ll talk about new pickers that allow people to share just the data they want without permission prompts.
    - They create in-context data sharing experiences, including customizable UI to fit right into your app, while minimizing the data shared.
  - **FinanceKit transaction picker**
    - The first new picker comes with FinanceKit.
    - FinanceKit offers access to a new category of on-device data from sources like Apple Card, Savings for Card, and Apple Cash.
  - **Image Playground picker**
    - iOS 18 and macOS Sequoia provide a new picker to bring image generation to your app in a private, out of process UI with Image Playgrounds APIs.
    - The Image Playground API gives your app access to the system-provided, personalized, and on-device image generation capabilities also used in the Image Playground app.
  - **Accessory Setup Kit picker**
    - but some apps need access to bluetooth and the local network in order to connect to accessories.
    - We applied the same principles behind data pickers to create AccessorySetupKit, the most streamlined and privacy-preserving way to set up accessories.
  - **Private Wi-Fi**
    - First, are some changes coming to introduce private wi-fi controls for MAC address rotation on iOS and to bring MAC address protection to macOS.
    - As a reminder, a MAC address is a unique identifier for a piece of hardware that is used to route network packets between different devices associated with the same network.
  - **macOS Extensions transparency and control**
    - Next are notifications and settings for extensions running on macOS.
    - They provide transparency and control over software that extends the functionality of your apps and your Mac.
  - **App group container protection**
    - Last, is app group data container protection on macOS, which brings the great protections of sandboxing to both groups of apps, and apps that aren’t ready to sandbox all of their data yet.
    - App Sandbox ensures data access is always expected by restricting access to protected resources.
  - **Permission changes**
    - Hi, I’m Chris with Privacy Engineering.
    - With each update, Apple strives to improve APIs to help your apps and give people more control over access to their data, to help them be comfortable providing their personal information when your apps need it.

- 실전 해석: 초반 챕터는 개념 정의, 중반은 구성/API 적용, 후반은 운영/확장 포인트로 읽으면 팀 공유 자료로 활용하기 좋습니다.

## 🛠️ 세부 API

- 세션에서 반복적으로 등장하거나 설계상 중요한 API/개념

  - **MAC**
    - 왜 중요한지: 이 세션의 핵심 구현 전략 또는 설계 판단 포인트를 구성하는 요소입니다.
    - 언제 쓰는지: 실제 기능 구현/리팩터링/마이그레이션 설계 시 우선 검토 대상입니다.
  - **FinanceKit**
    - 왜 중요한지: 이 세션의 핵심 구현 전략 또는 설계 판단 포인트를 구성하는 요소입니다.
    - 언제 쓰는지: 실제 기능 구현/리팩터링/마이그레이션 설계 시 우선 검토 대상입니다.
  - **AccessorySetupKit**
    - 왜 중요한지: 이 세션의 핵심 구현 전략 또는 설계 판단 포인트를 구성하는 요소입니다.
    - 언제 쓰는지: 실제 기능 구현/리팩터링/마이그레이션 설계 시 우선 검토 대상입니다.
  - **extension**
    - 왜 중요한지: 이 세션의 핵심 구현 전략 또는 설계 판단 포인트를 구성하는 요소입니다.
    - 언제 쓰는지: 실제 기능 구현/리팩터링/마이그레이션 설계 시 우선 검토 대상입니다.
  - **QuickLook**
    - 왜 중요한지: 이 세션의 핵심 구현 전략 또는 설계 판단 포인트를 구성하는 요소입니다.
    - 언제 쓰는지: 실제 기능 구현/리팩터링/마이그레이션 설계 시 우선 검토 대상입니다.
  - **struct**
    - 왜 중요한지: 이 세션의 핵심 구현 전략 또는 설계 판단 포인트를 구성하는 요소입니다.
    - 언제 쓰는지: 실제 기능 구현/리팩터링/마이그레이션 설계 시 우선 검토 대상입니다.
  - **MacOS**
    - 왜 중요한지: 이 세션의 핵심 구현 전략 또는 설계 판단 포인트를 구성하는 요소입니다.
    - 언제 쓰는지: 실제 기능 구현/리팩터링/마이그레이션 설계 시 우선 검토 대상입니다.

- 실전 개발자 관점: API 이름 자체보다 **상태 경계, 에러 처리, 성능 영향, 테스트 전략**까지 함께 봐야 재사용 가능한 패턴이 됩니다.

## 🔍 차이점

- 이 세션은 기존 기능 전체 설명보다 **변경된 API/동작/권장 패턴** 중심으로 읽어야 실무 적용 가치가 큽니다.
- 적용 판단 시에는 신규 API 추가 여부보다 **기존 구현 대체 범위 / 호환성 / 테스트 비용**을 먼저 계산하는 게 중요합니다.
- 배포 타깃 OS 비율이 낮다면, feature flag 또는 조건부 적용으로 단계적 도입 전략을 잡는 편이 안전합니다.

## 🧪 실전 포인트

- 아키텍처: 세션에서 제시한 패턴을 전체 코드베이스에 즉시 적용하기보다, 변동성이 큰 모듈/화면/플로우부터 파일럿 적용 후 표준화하세요.
- UX: 기술 선택은 성능·안정성·예측 가능성을 통해 사용자 경험에 직접 반영됩니다.
- 주의사항: 데모 코드는 개념 전달 중심인 경우가 많으므로, 프로덕션 적용 시에는 오류 처리, 취소, 로깅, 관측성(metrics), 롤백 전략을 보강해야 합니다.
- 설계 판단 기준: 도입 이점(가독성/성능/안정성/개발속도)과 비용(학습/마이그레이션/테스트/호환성)을 팀 단위로 비교해 우선순위를 정하세요.
- 세션 기반 체크포인트

  - `Image Playground picker`: iOS 18 and macOS Sequoia provide a new picker to bring image generation to your app in a private, out of process UI with Image Playgrounds APIs.
  - `Accessory Setup Kit picker`: but some apps need access to bluetooth and the local network in order to connect to accessories.

## ✅ 핵심 정리

- 이 세션은 **What’s new in privacy**를 단순 기능 소개가 아니라, 실제 제품/서비스 코드에 적용할 때 필요한 설계 판단 관점까지 연결해 이해하는 데 가치가 있습니다.
- 특히 실무에서는 “무엇을 도입할까”보다 “어떤 문제에 어떤 경계와 패턴으로 적용할까”를 합의하는 기준 문서로 활용하기 좋습니다.

핵심 메시지 한 문장: 세션의 핵심은 API 사용법 자체보다, 제품 요구사항과 운영 조건에 맞춰 도입 범위와 설계 경계를 판단하는 기준을 만드는 데 있습니다.
