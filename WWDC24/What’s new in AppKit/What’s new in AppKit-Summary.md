# What’s new in AppKit

## ✨ 개요

- 세션 주제: **What’s new in AppKit**
- 세션 링크: `https://developer.apple.com/videos/play/wwdc2024/10124/`
- 핵심 소개: 세션 소개 및 Transcript를 기반으로 핵심 내용을 정리했습니다.
- 왜 중요한지: 디자인 시스템/상태 흐름/UI 구조 선택이 화면 완성도와 유지보수성을 크게 좌우하기 때문입니다.
- 언제 쓰는지: 디자인 변경 반영, 신규 화면 설계, SwiftUI 리팩터링 시 적용 기준으로 쓰기 좋습니다.
- 이 세션에서 특히 봐야 할 포인트

  - `Introduction`: I’m Matt Zanchelli, an engineer on the AppKit team and this is What’s new in AppKit.
  - `New macOS features`: With Writing Tools, macOS can now not only help you with spelling & grammar,
  - `Writing Tools, Genmoji, and Image Playground`: but more sophisticated writing concepts like structure, clarity, and tone.
  - `Window Tiling`: in macOS Sequoia: Window Tiling.

## 🧭 구조

- 세션은 챕터 기준으로 점진적으로 개념/구현/운영 포인트를 쌓는 구조입니다.
- 챕터 흐름 요약

  - **Introduction**
    - Hello!
    - I’m Matt Zanchelli, an engineer on the AppKit team and this is What’s new in AppKit.
  - **New macOS features**
    - With Writing Tools, macOS can now not only help you with spelling & grammar,
  - **Writing Tools, Genmoji, and Image Playground**
    - but more sophisticated writing concepts like structure, clarity, and tone.
    - We’ve worked hard to bring these writing tools system-wide, and your apps get these intelligence features automatically.
  - **Window Tiling**
    - in macOS Sequoia: Window Tiling.
    - I just gotta show it to you now.
  - **More SwiftUI integrations**
    - I love using SwiftUI in my Mac apps, as it’s a fantastic way to build user interfaces.
    - It’s been designed from the beginning to work alongside AppKit, so that it can be adopted incrementally.
  - **Build menus with SwiftUI**
    - you can now use SwiftUI menus, too.
    - This allows you share menu definitions between the parts of your app that use AppKit and the parts that use SwiftUI.
  - **Get animated with SwiftUI**
    - In macOS Sequoia, AppKit gets animated with SwiftUI!
    - You can now use a SwiftUI Animation type to animate NSViews!
  - **API refinements**
    - Next, I’ll share some of the fantastic AppKit API refinements.
    - There’s a new way to open context menus, new capabilities in the text system and SF symbols, a new convenience when saving documents, some new cursors, more control over toolbars, and an exciting new API to assist with text input.
  - **Context menu refinements**
    - New in macOS Sequoia, is the ability to use the keyboard to open a context menu for the currently-focused UI element.
    - People can use this feature to more quickly or comfortably access an app’s functionality.
  - **Text highlighting**
    - The next new API refinement I’ll share is Text highlighting.
    - Highlights can be used to emphasize text with a background color and contrasting foreground color.

- 실전 해석: 초반 챕터는 개념 정의, 중반은 구성/API 적용, 후반은 운영/확장 포인트로 읽으면 팀 공유 자료로 활용하기 좋습니다.

## 🛠️ 세부 API

- 세션에서 반복적으로 등장하거나 설계상 중요한 API/개념

  - **SwiftUI**
    - 왜 중요한지: 이 세션의 핵심 구현 전략 또는 설계 판단 포인트를 구성하는 요소입니다.
    - 언제 쓰는지: 실제 기능 구현/리팩터링/마이그레이션 설계 시 우선 검토 대상입니다.
  - **AppKit**
    - 왜 중요한지: 이 세션의 핵심 구현 전략 또는 설계 판단 포인트를 구성하는 요소입니다.
    - 언제 쓰는지: 실제 기능 구현/리팩터링/마이그레이션 설계 시 우선 검토 대상입니다.
  - **BOOM**
    - 왜 중요한지: 이 세션의 핵심 구현 전략 또는 설계 판단 포인트를 구성하는 요소입니다.
    - 언제 쓰는지: 실제 기능 구현/리팩터링/마이그레이션 설계 시 우선 검토 대상입니다.
  - **UIKit**
    - 왜 중요한지: 이 세션의 핵심 구현 전략 또는 설계 판단 포인트를 구성하는 요소입니다.
    - 언제 쓰는지: 실제 기능 구현/리팩터링/마이그레이션 설계 시 우선 검토 대상입니다.
  - **protocol**
    - 왜 중요한지: 이 세션의 핵심 구현 전략 또는 설계 판단 포인트를 구성하는 요소입니다.
    - 언제 쓰는지: 실제 기능 구현/리팩터링/마이그레이션 설계 시 우선 검토 대상입니다.
  - **NSToolbar**
    - 왜 중요한지: 이 세션의 핵심 구현 전략 또는 설계 판단 포인트를 구성하는 요소입니다.
    - 언제 쓰는지: 실제 기능 구현/리팩터링/마이그레이션 설계 시 우선 검토 대상입니다.
  - **URL**
    - 왜 중요한지: 이 세션의 핵심 구현 전략 또는 설계 판단 포인트를 구성하는 요소입니다.
    - 언제 쓰는지: 실제 기능 구현/리팩터링/마이그레이션 설계 시 우선 검토 대상입니다.
  - **async**
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

## 🧪 실전 포인트

- 아키텍처: 세션에서 제시한 패턴을 전체 코드베이스에 즉시 적용하기보다, 변동성이 큰 모듈/화면/플로우부터 파일럿 적용 후 표준화하세요.
- UX: 상태/레이아웃/상호작용 설계 품질이 사용자 체감 완성도에 바로 반영됩니다.
- 주의사항: 데모 코드는 개념 전달 중심인 경우가 많으므로, 프로덕션 적용 시에는 오류 처리, 취소, 로깅, 관측성(metrics), 롤백 전략을 보강해야 합니다.
- 설계 판단 기준: 도입 이점(가독성/성능/안정성/개발속도)과 비용(학습/마이그레이션/테스트/호환성)을 팀 단위로 비교해 우선순위를 정하세요.
- 세션 기반 체크포인트

  - `More SwiftUI integrations`: I love using SwiftUI in my Mac apps, as it’s a fantastic way to build user interfaces.
  - `Build menus with SwiftUI`: you can now use SwiftUI menus, too.

## ✅ 핵심 정리

- 이 세션은 **What’s new in AppKit**를 단순 기능 소개가 아니라, 실제 제품/서비스 코드에 적용할 때 필요한 설계 판단 관점까지 연결해 이해하는 데 가치가 있습니다.
- 특히 실무에서는 “무엇을 도입할까”보다 “어떤 문제에 어떤 경계와 패턴으로 적용할까”를 합의하는 기준 문서로 활용하기 좋습니다.

핵심 메시지 한 문장: 세션의 핵심은 API 사용법 자체보다, 제품 요구사항과 운영 조건에 맞춰 도입 범위와 설계 경계를 판단하는 기준을 만드는 데 있습니다.
