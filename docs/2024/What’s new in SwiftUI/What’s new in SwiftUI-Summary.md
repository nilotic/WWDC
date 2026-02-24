# What’s new in SwiftUI

## ✨ 개요

- 세션 주제: **What’s new in SwiftUI**
- 세션 링크: `https://developer.apple.com/videos/play/wwdc2024/10144/`
- 핵심 소개: 세션 소개 및 Transcript를 기반으로 핵심 내용을 정리했습니다.
- 왜 중요한지: 디자인 시스템/상태 흐름/UI 구조 선택이 화면 완성도와 유지보수성을 크게 좌우하기 때문입니다.
- 언제 쓰는지: 디자인 변경 반영, 신규 화면 설계, SwiftUI 리팩터링 시 적용 기준으로 쓰기 좋습니다.
- 이 세션에서 특히 봐야 할 포인트

  - `Introduction`: Hi, and thanks for tuning in!
  - `Fresh apps`: That’s a lot to cover, so let’s dive right in.
  - `Fresh apps: TabView`: It’s primarily a side bar driven app, and in iOS 18.0, the sidebar has become a lot more flexible.
  - `Fresh apps: Presentation sizing`: Sheet presentation sizing is now unified and simplified across platforms.

## 🧭 구조

- 세션은 챕터 기준으로 점진적으로 개념/구현/운영 포인트를 쌓는 구조입니다.
- 챕터 흐름 요약

  - **Introduction**
    - Hi, and thanks for tuning in!
    - I’m Sommer!
  - **Fresh apps**
    - That’s a lot to cover, so let’s dive right in.
    - You can really freshen up your apps with SwiftUI, from a new tab view, to beautiful mesh gradients, and snappy controls!
  - **Fresh apps: TabView**
    - Sam and I wrote a karaoke event planner app.
    - It’s primarily a side bar driven app, and in iOS 18.0, the sidebar has become a lot more flexible.
  - **Fresh apps: Presentation sizing**
    - Sheet presentation sizing is now unified and simplified across platforms.
    - You can use the .presentationSizing modifier to create perfectly-sized sheets with .form or .page, or even use custom sizing.
  - **Fresh apps: Zoom transition**
    - and I can use it to make expanding info on a party look gorgeous.
    - For more on the new TabView check out "Improve your tab and sidebar experience on iPad".
  - **Fresh apps: Custom controls**
    - custom resizable controls such as buttons and toggles that live in control center or the lock screen and can even be activated by the action button.
    - Controls are a new kind of Widget that that are easy to build with App Intents!
  - **Fresh apps: Vectorized and function plots**
    - Sam and I have been working hard to grow our karaoke party attendance.
    - I think an exponential function seems like very reasonable goal.
  - **Fresh apps: TableColumnForEach**
    - As a data nerd, I also like to keep track of how much the attendees are singing at the parties.
    - Using TableColumnForEach, I can now have a dynamic number of table columns for however many parties Sam and I have!
  - **Fresh apps: MeshGradient**
    - To boost our attendance numbers, I think we should send out some colorful party invites!
    - SwiftUI has added first class support for colorful mesh gradients.
  - **Fresh apps: Document launch experience**
    - Now that the Karaoke Planner App is looking fresh, Sam and I want to have a little extra fun by customizing our lyrics!
    - So, we’ve also built a document-based app for editing the words to our favorite songs.

- 실전 해석: 초반 챕터는 개념 정의, 중반은 구성/API 적용, 후반은 운영/확장 포인트로 읽으면 팀 공유 자료로 활용하기 좋습니다.

## 🛠️ 세부 API

- 세션에서 반복적으로 등장하거나 설계상 중요한 API/개념

  - **SwiftUI**
    - 왜 중요한지: 이 세션의 핵심 구현 전략 또는 설계 판단 포인트를 구성하는 요소입니다.
    - 언제 쓰는지: 실제 기능 구현/리팩터링/마이그레이션 설계 시 우선 검토 대상입니다.
  - **UIKit**
    - 왜 중요한지: 이 세션의 핵심 구현 전략 또는 설계 판단 포인트를 구성하는 요소입니다.
    - 언제 쓰는지: 실제 기능 구현/리팩터링/마이그레이션 설계 시 우선 검토 대상입니다.
  - **AppKit**
    - 왜 중요한지: 이 세션의 핵심 구현 전략 또는 설계 판단 포인트를 구성하는 요소입니다.
    - 언제 쓰는지: 실제 기능 구현/리팩터링/마이그레이션 설계 시 우선 검토 대상입니다.
  - **actor**
    - 왜 중요한지: 이 세션의 핵심 구현 전략 또는 설계 판단 포인트를 구성하는 요소입니다.
    - 언제 쓰는지: 실제 기능 구현/리팩터링/마이그레이션 설계 시 우선 검토 대상입니다.
  - **macro**
    - 왜 중요한지: 이 세션의 핵심 구현 전략 또는 설계 판단 포인트를 구성하는 요소입니다.
    - 언제 쓰는지: 실제 기능 구현/리팩터링/마이그레이션 설계 시 우선 검토 대상입니다.
  - **class**
    - 왜 중요한지: 이 세션의 핵심 구현 전략 또는 설계 판단 포인트를 구성하는 요소입니다.
    - 언제 쓰는지: 실제 기능 구현/리팩터링/마이그레이션 설계 시 우선 검토 대상입니다.
  - **protocol**
    - 왜 중요한지: 이 세션의 핵심 구현 전략 또는 설계 판단 포인트를 구성하는 요소입니다.
    - 언제 쓰는지: 실제 기능 구현/리팩터링/마이그레이션 설계 시 우선 검토 대상입니다.
  - **TabView**
    - 왜 중요한지: 이 세션의 핵심 구현 전략 또는 설계 판단 포인트를 구성하는 요소입니다.
    - 언제 쓰는지: 실제 기능 구현/리팩터링/마이그레이션 설계 시 우선 검토 대상입니다.
  - **TableColumnForEach**
    - 왜 중요한지: 이 세션의 핵심 구현 전략 또는 설계 판단 포인트를 구성하는 요소입니다.
    - 언제 쓰는지: 실제 기능 구현/리팩터링/마이그레이션 설계 시 우선 검토 대상입니다.
  - **MagicReplace**
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

  - `Fresh apps: Zoom transition`: and I can use it to make expanding info on a party look gorgeous.
  - `Fresh apps: Custom controls`: custom resizable controls such as buttons and toggles that live in control center or the lock screen and can even be activated by the action button.

## ✅ 핵심 정리

- 이 세션은 **What’s new in SwiftUI**를 단순 기능 소개가 아니라, 실제 제품/서비스 코드에 적용할 때 필요한 설계 판단 관점까지 연결해 이해하는 데 가치가 있습니다.
- 특히 실무에서는 “무엇을 도입할까”보다 “어떤 문제에 어떤 경계와 패턴으로 적용할까”를 합의하는 기준 문서로 활용하기 좋습니다.

핵심 메시지 한 문장: 세션의 핵심은 API 사용법 자체보다, 제품 요구사항과 운영 조건에 맞춰 도입 범위와 설계 경계를 판단하는 기준을 만드는 데 있습니다.
