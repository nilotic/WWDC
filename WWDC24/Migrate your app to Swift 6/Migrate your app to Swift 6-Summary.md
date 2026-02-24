# Migrate your app to Swift 6

## ✨ 개요

- 세션 주제: **Migrate your app to Swift 6**
- 세션 링크: `https://developer.apple.com/videos/play/wwdc2024/10169/`
- 핵심 소개: 세션 소개 및 Transcript를 기반으로 핵심 내용을 정리했습니다.
- 왜 중요한지: 언어 기능 선택이 타입 안정성·동시성 안정성·재사용성에 직접 영향을 주기 때문입니다.
- 언제 쓰는지: Swift 코드베이스의 설계 원칙을 정리하거나 팀 코드리뷰 기준을 만들 때 특히 유용합니다.
- 이 세션에서 특히 봐야 할 포인트

  - `Introduction`: Hi, I'm Ben from the Swift team, and in this video, I’m going to walk you through enabling the Swift 6 language mode in an existing application.
  - `The Coffee Tracker app`: When we first introduced Swift concurrency at WWDC 2021,
  - `Review the refactor from WWDC21`: I walked you through how to adopt Swift’s new concurrency model in this app.
  - `Swift 6 and data-race safety`: The compiler will prevent this kind of accidental sharing of state between tasks and actors, allowing you to carry out refactoring, or add new functionality to your app, without...

## 🧭 구조

- 세션은 챕터 기준으로 점진적으로 개념/구현/운영 포인트를 쌓는 구조입니다.
- 챕터 흐름 요약

  - **Introduction**
    - Hi, I'm Ben from the Swift team, and in this video, I’m going to walk you through enabling the Swift 6 language mode in an existing application.
    - We’ll see how Swift 6 helps protect you against possible race conditions, and look at some techniques for introducing this change gradually into your app, as well as how to deal with interactions with frameworks that aren’t yet aware of Swift’s concurrency guarantees.
  - **The Coffee Tracker app**
    - that tracks coffee consumption throughout the day, as well as a complication to show your current caffeine level on a watch face.
    - When we first introduced Swift concurrency at WWDC 2021,
  - **Review the refactor from WWDC21**
    - I walked you through how to adopt Swift’s new concurrency model in this app.
    - The actors communicated between each other using thread-safe value types, using Swift’s async/await feature.
  - **Swift 6 and data-race safety**
    - The compiler will prevent this kind of accidental sharing of state between tasks and actors, allowing you to carry out refactoring, or add new functionality to your app, without worrying that you’re introducing new concurrency bugs.
    - The Swift 6 language mode is opting for both existing and new projects.
  - **Swift 6 migration in practice**
    - We’re going to take our CoffeeTracker application, and enable Swift’s data isolation.
    - We’ll do this step-by-step, and look at some of the guidance the compiler gives us, about where we need to make changes to allow Swift to guarantee that CoffeeTracker is free of any data races.
  - **The strategy**
    - where we migrate each one of the targets in our code.
    - This is a per-module setting that leaves your project in Swift 5 mode, but enables warnings for all the code that would fail with Swift 6’s enforced data isolation.
  - **Adopting concurrency features**
    - What does complete checking enable?
    - If you’ve already been using Swift Concurrency in your app, you’ve probably seen warnings or errors from the Swift compiler about concurrency issues that came up as you adopted Swift’s concurrency features.
  - **Enabling complete checking in the watch extension**
    - and in my app, I have two key targets, the WatchKit extension, where my UI layer lives, and CoffeeKit, a framework where the business logic for tracking the caffeine and saving it to HealthKit lives.
    - Or maybe it’s a framework or package module that will get updated to Swift 6, just hasn’t been yet.
  - **Shared mutable state in global variables**
    - We see a logger instance declared as a global variable.
    - Global variables are a source of shared mutable state, every bit of code in your program, no matter what thread it runs on, is able to read and write to this same variable.
  - **Shared mutable state in global instances and functions**
    - The first note here is pointing out that calls to actor-isolated state are implicitly asynchronous, that is, if this were an async function, you could use await to access this global variable on the main actor.
    - Many delegates, and other protocols like SwiftUI views, that are designed to operate only on the main actor, have been annotated like this, especially in the latest SDKs that come with Xcode 16.

- 실전 해석: 초반 챕터는 개념 정의, 중반은 구성/API 적용, 후반은 운영/확장 포인트로 읽으면 팀 공유 자료로 활용하기 좋습니다.

## 🛠️ 세부 API

- 세션에서 반복적으로 등장하거나 설계상 중요한 API/개념

  - **actor**
    - 왜 중요한지: 이 세션의 핵심 구현 전략 또는 설계 판단 포인트를 구성하는 요소입니다.
    - 언제 쓰는지: 실제 기능 구현/리팩터링/마이그레이션 설계 시 우선 검토 대상입니다.
  - **CoffeeKit**
    - 왜 중요한지: 이 세션의 핵심 구현 전략 또는 설계 판단 포인트를 구성하는 요소입니다.
    - 언제 쓰는지: 실제 기능 구현/리팩터링/마이그레이션 설계 시 우선 검토 대상입니다.
  - **protocol**
    - 왜 중요한지: 이 세션의 핵심 구현 전략 또는 설계 판단 포인트를 구성하는 요소입니다.
    - 언제 쓰는지: 실제 기능 구현/리팩터링/마이그레이션 설계 시 우선 검토 대상입니다.
  - **SwiftUI**
    - 왜 중요한지: 이 세션의 핵심 구현 전략 또는 설계 판단 포인트를 구성하는 요소입니다.
    - 언제 쓰는지: 실제 기능 구현/리팩터링/마이그레이션 설계 시 우선 검토 대상입니다.
  - **extension**
    - 왜 중요한지: 이 세션의 핵심 구현 전략 또는 설계 판단 포인트를 구성하는 요소입니다.
    - 언제 쓰는지: 실제 기능 구현/리팩터링/마이그레이션 설계 시 우선 검토 대상입니다.
  - **MainActor**
    - 왜 중요한지: 이 세션의 핵심 구현 전략 또는 설계 판단 포인트를 구성하는 요소입니다.
    - 언제 쓰는지: 실제 기능 구현/리팩터링/마이그레이션 설계 시 우선 검토 대상입니다.
  - **async**
    - 왜 중요한지: 이 세션의 핵심 구현 전략 또는 설계 판단 포인트를 구성하는 요소입니다.
    - 언제 쓰는지: 실제 기능 구현/리팩터링/마이그레이션 설계 시 우선 검토 대상입니다.
  - **CoffeeTracker**
    - 왜 중요한지: 이 세션의 핵심 구현 전략 또는 설계 판단 포인트를 구성하는 요소입니다.
    - 언제 쓰는지: 실제 기능 구현/리팩터링/마이그레이션 설계 시 우선 검토 대상입니다.
  - **CoreLocation**
    - 왜 중요한지: 이 세션의 핵심 구현 전략 또는 설계 판단 포인트를 구성하는 요소입니다.
    - 언제 쓰는지: 실제 기능 구현/리팩터링/마이그레이션 설계 시 우선 검토 대상입니다.
  - **class**
    - 왜 중요한지: 이 세션의 핵심 구현 전략 또는 설계 판단 포인트를 구성하는 요소입니다.
    - 언제 쓰는지: 실제 기능 구현/리팩터링/마이그레이션 설계 시 우선 검토 대상입니다.

- 실전 개발자 관점: API 이름 자체보다 **상태 경계, 에러 처리, 성능 영향, 테스트 전략**까지 함께 봐야 재사용 가능한 패턴이 됩니다.

## 🔍 차이점

- 세션의 핵심은 단순 API 사용법보다, **문제를 어떻게 모델링하고 어떤 레이어에 배치하는지**를 보여주는 데 있습니다.
- 같은 기능도 Apple 권장 패턴을 따르면 상태 관리·에러 처리·성능 최적화 포인트가 더 명확해집니다.
- 실전 도입은 전체 교체보다 “파일럿 적용 → 패턴 검증 → 공통화” 순서가 리스크를 줄입니다.
- 특히 이 세션은 Swift를 단순 앱 개발 언어가 아니라 서버/CLI/패키지까지 포함한 범용 언어로 보여주며, 언어 기능 선택을 시스템 설계 관점으로 끌어올립니다.

## 🧪 실전 포인트

- 아키텍처: 세션에서 제시한 패턴을 전체 코드베이스에 즉시 적용하기보다, 변동성이 큰 모듈/화면/플로우부터 파일럿 적용 후 표준화하세요.
- UX: 언어 수준의 선택(값/참조, 에러 모델, 동시성)은 앱의 안정성과 반응성으로 이어집니다.
- 주의사항: 데모 코드는 개념 전달 중심인 경우가 많으므로, 프로덕션 적용 시에는 오류 처리, 취소, 로깅, 관측성(metrics), 롤백 전략을 보강해야 합니다.
- 설계 판단 기준: 도입 이점(가독성/성능/안정성/개발속도)과 비용(학습/마이그레이션/테스트/호환성)을 팀 단위로 비교해 우선순위를 정하세요.
- 세션 기반 체크포인트

  - `Swift 6 migration in practice`: We’re going to take our CoffeeTracker application, and enable Swift’s data isolation.
  - `The strategy`: This is a per-module setting that leaves your project in Swift 5 mode, but enables warnings for all the code that would fail with Swift 6’s enforced data isolation.

## ✅ 핵심 정리

- 이 세션은 **Migrate your app to Swift 6**를 단순 기능 소개가 아니라, 실제 제품/서비스 코드에 적용할 때 필요한 설계 판단 관점까지 연결해 이해하는 데 가치가 있습니다.
- 특히 실무에서는 “무엇을 도입할까”보다 “어떤 문제에 어떤 경계와 패턴으로 적용할까”를 합의하는 기준 문서로 활용하기 좋습니다.

핵심 메시지 한 문장: 세션의 핵심은 API 사용법 자체보다, 제품 요구사항과 운영 조건에 맞춰 도입 범위와 설계 경계를 판단하는 기준을 만드는 데 있습니다.
