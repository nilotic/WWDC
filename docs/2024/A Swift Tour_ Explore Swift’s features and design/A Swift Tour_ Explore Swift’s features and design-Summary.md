# A Swift Tour: Explore Swift’s features and design

## ✨ 개요

- 세션 주제: **A Swift Tour: Explore Swift’s features and design**
- 세션 링크: `https://developer.apple.com/videos/play/wwdc2024/10184/`
- 핵심 소개: 세션 소개 및 Transcript를 기반으로 핵심 내용을 정리했습니다.
- 왜 중요한지: 언어 기능 선택이 타입 안정성·동시성 안정성·재사용성에 직접 영향을 주기 때문입니다.
- 언제 쓰는지: Swift 코드베이스의 설계 원칙을 정리하거나 팀 코드리뷰 기준을 만들 때 특히 유용합니다.
- 이 세션에서 특히 봐야 할 포인트

  - 예제를 하나의 Swift Package(라이브러리 + HTTP 서버 + CLI)로 확장하며 Swift를 범용 언어로 설명합니다.
  - 값 타입/에러 모델링/패키지 구조화/프로토콜/동시성/언어 확장성까지를 하나의 흐름으로 연결합니다.
  - Hummingbird(서버)와 swift-argument-parser(CLI)를 예시로 사용해 실제 프로젝트 구조까지 보여줍니다.
  - `Introduction`: Hi, I’m Allan Shortlidge and I work on the Swift compiler.

## 🧭 구조

- 세션은 챕터 기준으로 점진적으로 개념/구현/운영 포인트를 쌓는 구조입니다.
- 챕터 흐름 요약

  - **Introduction**
    - Hi, I’m Allan Shortlidge and I work on the Swift compiler.
    - Today, I’m excited to give you a tour of my favorite programming language: Swift.
  - **Agenda**
    - Today we’re going to take a tour of the core features of Swift.
    - We won’t cover every aspect of it or go deep on any one topic.
  - **The example**
    - While I introduce you to Swift, I’m going to demonstrate its features by building infrastructure for the next great social network.
    - The code will be organized into a Swift package that has three components: The first is a library that provides the data model for representing users in a graph.
  - **Value types**
    - let’s start with a fundamental programming concept: Representing data.
    - The primary way you represent data in Swift is with value types.
  - **Errors and optionals**
    - Disks fill up, network connections fail, and users provide bad data.
    - Swift provides an error handling model that makes it easy to report errors and gracefully handle them.
  - **Code organization**
    - and now I think it’s time to start adding some structure to the code.
    - Two units of code organization supported by Swift are modules and packages.
  - **Classes**
    - Up until now I’ve only talked about value types, but sometimes you need to represent shared mutable state.
    - For that, Swift has reference types, like classes.
  - **Protocols**
    - inheritance is the main mechanism for polymorphism.
    - In Swift, though, protocols provide a more general way to build abstractions, and they work equally well with both value and reference types.
  - **Concurrency**
    - Okay, before we move on to building an HTTP server, there’s one more important Swift concept I want to tell you about first, which is concurrency.
    - Calls to actor methods from outside the context of the actor are asynchronous.
  - **Extensibility**
    - The final category of Swift features we’ll cover have to do with extending the language.
    - These powerful features are often used by library authors to build expressive, type-safe APIs and eliminate boilerplate code in your applications.

- 실전 해석: 초반 챕터는 개념 정의, 중반은 구성/API 적용, 후반은 운영/확장 포인트로 읽으면 팀 공유 자료로 활용하기 좋습니다.

## 🛠️ 세부 API

- 세션에서 반복적으로 등장하거나 설계상 중요한 API/개념

  - **HTTP**
    - 왜 중요한지: 이 세션의 핵심 구현 전략 또는 설계 판단 포인트를 구성하는 요소입니다.
    - 언제 쓰는지: 실제 기능 구현/리팩터링/마이그레이션 설계 시 우선 검토 대상입니다.
  - **UserStore**
    - 왜 중요한지: 이 세션의 핵심 구현 전략 또는 설계 판단 포인트를 구성하는 요소입니다.
    - 언제 쓰는지: 실제 기능 구현/리팩터링/마이그레이션 설계 시 우선 검토 대상입니다.
  - **struct**
    - 왜 중요한지: 이 세션의 핵심 구현 전략 또는 설계 판단 포인트를 구성하는 요소입니다.
    - 언제 쓰는지: 실제 기능 구현/리팩터링/마이그레이션 설계 시 우선 검토 대상입니다.
  - **protocol**
    - 왜 중요한지: 이 세션의 핵심 구현 전략 또는 설계 판단 포인트를 구성하는 요소입니다.
    - 언제 쓰는지: 실제 기능 구현/리팩터링/마이그레이션 설계 시 우선 검토 대상입니다.
  - **actor**
    - 왜 중요한지: 이 세션의 핵심 구현 전략 또는 설계 판단 포인트를 구성하는 요소입니다.
    - 언제 쓰는지: 실제 기능 구현/리팩터링/마이그레이션 설계 시 우선 검토 대상입니다.
  - **class**
    - 왜 중요한지: 이 세션의 핵심 구현 전략 또는 설계 판단 포인트를 구성하는 요소입니다.
    - 언제 쓰는지: 실제 기능 구현/리팩터링/마이그레이션 설계 시 우선 검토 대상입니다.
  - **async**
    - 왜 중요한지: 이 세션의 핵심 구현 전략 또는 설계 판단 포인트를 구성하는 요소입니다.
    - 언제 쓰는지: 실제 기능 구현/리팩터링/마이그레이션 설계 시 우선 검토 대상입니다.
  - **await**
    - 왜 중요한지: 이 세션의 핵심 구현 전략 또는 설계 판단 포인트를 구성하는 요소입니다.
    - 언제 쓰는지: 실제 기능 구현/리팩터링/마이그레이션 설계 시 우선 검토 대상입니다.
  - **macros**
    - 왜 중요한지: 이 세션의 핵심 구현 전략 또는 설계 판단 포인트를 구성하는 요소입니다.
    - 언제 쓰는지: 실제 기능 구현/리팩터링/마이그레이션 설계 시 우선 검토 대상입니다.
  - **AsyncParsableCommand**
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

  - `Agenda`: Today we’re going to take a tour of the core features of Swift.
  - `The example`: While I introduce you to Swift, I’m going to demonstrate its features by building infrastructure for the next great social network.
  - `Value types`: let’s start with a fundamental programming concept: Representing data.
  - `Errors and optionals`: Disks fill up, network connections fail, and users provide bad data.

## ✅ 핵심 정리

- 이 세션은 **A Swift Tour: Explore Swift’s features and design**를 단순 기능 소개가 아니라, 실제 제품/서비스 코드에 적용할 때 필요한 설계 판단 관점까지 연결해 이해하는 데 가치가 있습니다.
- 특히 실무에서는 “무엇을 도입할까”보다 “어떤 문제에 어떤 경계와 패턴으로 적용할까”를 합의하는 기준 문서로 활용하기 좋습니다.

핵심 메시지 한 문장: 세션의 핵심은 API 사용법 자체보다, 제품 요구사항과 운영 조건에 맞춰 도입 범위와 설계 경계를 판단하는 기준을 만드는 데 있습니다.
