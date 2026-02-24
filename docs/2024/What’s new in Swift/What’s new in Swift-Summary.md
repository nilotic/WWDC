# What’s new in Swift

## ✨ 개요

- 세션 주제: **What’s new in Swift**
- 세션 링크: `https://developer.apple.com/videos/play/wwdc2024/10136/`
- 핵심 소개: 세션 소개 및 Transcript를 기반으로 핵심 내용을 정리했습니다.
- 왜 중요한지: 언어 기능 선택이 타입 안정성·동시성 안정성·재사용성에 직접 영향을 주기 때문입니다.
- 언제 쓰는지: Swift 코드베이스의 설계 원칙을 정리하거나 팀 코드리뷰 기준을 만들 때 특히 유용합니다.
- 이 세션에서 특히 봐야 할 포인트

  - `Introduction`: Hi!
  - `Swift over the years`: as it reaches 10 years since it was announced at WWDC2014.
  - `Agenda`: We’ll cover some of the key achievements and new investments in the Swift project.
  - `Swift project update`: The Swift programming language is part of a larger ecosystem which contains tools, packages, and a vibrant community including developers like you.

## 🧭 구조

- 세션은 챕터 기준으로 점진적으로 개념/구현/운영 포인트를 쌓는 구조입니다.
- 챕터 흐름 요약

  - **Introduction**
    - Hi!
    - Welcome to “What’s new in Swift”.
  - **Swift over the years**
    - as it reaches 10 years since it was announced at WWDC2014.
    - We introduced a key feature, the concurrency model with Async/Await, Actors, and structured concurrency The next year, we introduced distributed actors, which made it easier to build network services.
  - **Agenda**
    - We’ll cover some of the key achievements and new investments in the Swift project.
    - and we’ll talk about some of the new language features including the new language mode, Swift 6.
  - **Swift project update**
    - The Swift programming language is part of a larger ecosystem which contains tools, packages, and a vibrant community including developers like you.
  - **Community**
    - Let’s talk about how the community has evolved.
    - In the beginning, the Swift Core team was the only steering group and was responsible for the language evolution process and so much more.
  - **Packages**
    - Swift.org is the home for the Swift Project.
    - To explore Swift packages, you can now visit swift.org/packages which is integrated with swiftPackageIndex.com.
  - **Blogs**
    - This year’s swift.org blog posts highlighted exciting developments across the Swift community.
    - Here are a few examples.
  - **Swift everywhere**
    - Swift continues to grow as cross platform language, as it is being ported to more and more platforms.
    - Swift is officially supported on Apple platforms, Linux, and Windows.
  - **Cross compilation to Linux**
    - Cross compilation is a common development use case, and if you have been developing for Apple platforms you are already using cross compilation.
    - With cross compilation, you can generate an executable on one environment and run it on a different environment.
  - **Foundation**
    - Foundation is an essential component of many applications, providing important APIs including JSON decoding, date and time formatting, file system operations, and more.
    - It is also one of our longest-lived frameworks, with history dating back to the very beginning of macOS X.

- 실전 해석: 초반 챕터는 개념 정의, 중반은 구성/API 적용, 후반은 운영/확장 포인트로 읽으면 팀 공유 자료로 활용하기 좋습니다.

## 🛠️ 세부 API

- 세션에서 반복적으로 등장하거나 설계상 중요한 API/개념

  - **SDK**
    - 왜 중요한지: 이 세션의 핵심 구현 전략 또는 설계 판단 포인트를 구성하는 요소입니다.
    - 언제 쓰는지: 실제 기능 구현/리팩터링/마이그레이션 설계 시 우선 검토 대상입니다.
  - **actor**
    - 왜 중요한지: 이 세션의 핵심 구현 전략 또는 설계 판단 포인트를 구성하는 요소입니다.
    - 언제 쓰는지: 실제 기능 구현/리팩터링/마이그레이션 설계 시 우선 검토 대상입니다.
  - **SwiftUI**
    - 왜 중요한지: 이 세션의 핵심 구현 전략 또는 설계 판단 포인트를 구성하는 요소입니다.
    - 언제 쓰는지: 실제 기능 구현/리팩터링/마이그레이션 설계 시 우선 검토 대상입니다.
  - **generic**
    - 왜 중요한지: 이 세션의 핵심 구현 전략 또는 설계 판단 포인트를 구성하는 요소입니다.
    - 언제 쓰는지: 실제 기능 구현/리팩터링/마이그레이션 설계 시 우선 검토 대상입니다.
  - **SwiftData**
    - 왜 중요한지: 이 세션의 핵심 구현 전략 또는 설계 판단 포인트를 구성하는 요소입니다.
    - 언제 쓰는지: 실제 기능 구현/리팩터링/마이그레이션 설계 시 우선 검토 대상입니다.
  - **GNOME**
    - 왜 중요한지: 이 세션의 핵심 구현 전략 또는 설계 판단 포인트를 구성하는 요소입니다.
    - 언제 쓰는지: 실제 기능 구현/리팩터링/마이그레이션 설계 시 우선 검토 대상입니다.
  - **macros**
    - 왜 중요한지: 이 세션의 핵심 구현 전략 또는 설계 판단 포인트를 구성하는 요소입니다.
    - 언제 쓰는지: 실제 기능 구현/리팩터링/마이그레이션 설계 시 우선 검토 대상입니다.
  - **macro**
    - 왜 중요한지: 이 세션의 핵심 구현 전략 또는 설계 판단 포인트를 구성하는 요소입니다.
    - 언제 쓰는지: 실제 기능 구현/리팩터링/마이그레이션 설계 시 우선 검토 대상입니다.
  - **struct**
    - 왜 중요한지: 이 세션의 핵심 구현 전략 또는 설계 판단 포인트를 구성하는 요소입니다.
    - 언제 쓰는지: 실제 기능 구현/리팩터링/마이그레이션 설계 시 우선 검토 대상입니다.
  - **class**
    - 왜 중요한지: 이 세션의 핵심 구현 전략 또는 설계 판단 포인트를 구성하는 요소입니다.
    - 언제 쓰는지: 실제 기능 구현/리팩터링/마이그레이션 설계 시 우선 검토 대상입니다.

- 실전 개발자 관점: API 이름 자체보다 **상태 경계, 에러 처리, 성능 영향, 테스트 전략**까지 함께 봐야 재사용 가능한 패턴이 됩니다.

## 🔍 차이점

- 이 세션은 기존 기능 전체 설명보다 **변경된 API/동작/권장 패턴** 중심으로 읽어야 실무 적용 가치가 큽니다.
- 적용 판단 시에는 신규 API 추가 여부보다 **기존 구현 대체 범위 / 호환성 / 테스트 비용**을 먼저 계산하는 게 중요합니다.
- 배포 타깃 OS 비율이 낮다면, feature flag 또는 조건부 적용으로 단계적 도입 전략을 잡는 편이 안전합니다.
- 특히 이 세션은 Swift를 단순 앱 개발 언어가 아니라 서버/CLI/패키지까지 포함한 범용 언어로 보여주며, 언어 기능 선택을 시스템 설계 관점으로 끌어올립니다.

## 🧪 실전 포인트

- 아키텍처: 세션에서 제시한 패턴을 전체 코드베이스에 즉시 적용하기보다, 변동성이 큰 모듈/화면/플로우부터 파일럿 적용 후 표준화하세요.
- UX: 언어 수준의 선택(값/참조, 에러 모델, 동시성)은 앱의 안정성과 반응성으로 이어집니다.
- 주의사항: 데모 코드는 개념 전달 중심인 경우가 많으므로, 프로덕션 적용 시에는 오류 처리, 취소, 로깅, 관측성(metrics), 롤백 전략을 보강해야 합니다.
- 설계 판단 기준: 도입 이점(가독성/성능/안정성/개발속도)과 비용(학습/마이그레이션/테스트/호환성)을 팀 단위로 비교해 우선순위를 정하세요.
- 세션 기반 체크포인트

  - `Community`: Let’s talk about how the community has evolved.
  - `Packages`: Swift.org is the home for the Swift Project.

## ✅ 핵심 정리

- 이 세션은 **What’s new in Swift**를 단순 기능 소개가 아니라, 실제 제품/서비스 코드에 적용할 때 필요한 설계 판단 관점까지 연결해 이해하는 데 가치가 있습니다.
- 특히 실무에서는 “무엇을 도입할까”보다 “어떤 문제에 어떤 경계와 패턴으로 적용할까”를 합의하는 기준 문서로 활용하기 좋습니다.

핵심 메시지 한 문장: 세션의 핵심은 API 사용법 자체보다, 제품 요구사항과 운영 조건에 맞춰 도입 범위와 설계 경계를 판단하는 기준을 만드는 데 있습니다.
