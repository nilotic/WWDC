# Say hello to the next generation of CarPlay design system

## ✨ 개요

- 세션 주제: **Say hello to the next generation of CarPlay design system**
- 세션 링크: `https://developer.apple.com/videos/play/wwdc2024/10112/`
- 핵심 소개: 세션 소개 및 Transcript를 기반으로 핵심 내용을 정리했습니다.
- 왜 중요한지: 기능 소개를 실제 제품 설계/운영 판단으로 연결할 때 비로소 세션의 가치가 커지기 때문입니다.
- 언제 쓰는지: 도입 검토 단계에서 우선순위·범위·리스크를 판단할 때 활용도가 높습니다.
- 이 세션에서 특히 봐야 할 포인트

  - `Introduction`: Hi there, I’m Ben Crick from the Apple Design Team, and today I get to introduce you to the Next Generation of CarPlay design system.
  - `Overview`: Before we get into the details, let’s talk about how we got here.
  - `Gauge customization`: In this section we’ll take a closer look at what’s possible, and how automakers, in partnership with Apple, can make Next Generation CarPlay instruments your own.
  - `Building a layout`: it’s time to build a layout by combining a few different types of gauges.

## 🧭 구조

- 세션은 챕터 기준으로 점진적으로 개념/구현/운영 포인트를 쌓는 구조입니다.
- 챕터 흐름 요약

  - **Introduction**
    - Hi there, I’m Ben Crick from the Apple Design Team, and today I get to introduce you to the Next Generation of CarPlay design system.
    - Specifically, we’re going to dive into the extensive customization features that empower automakers, in partnership with our team here, to tailor the look and functionality of CarPlay to each vehicle.
  - **Overview**
    - Before we get into the details, let’s talk about how we got here.
    - It’s pretty simple really, cars have changed a lot since CarPlay first launched.
  - **Gauge customization**
    - In this section we’ll take a closer look at what’s possible, and how automakers, in partnership with Apple, can make Next Generation CarPlay instruments your own.
    - Let’s start with Typography.
  - **Building a layout**
    - it’s time to build a layout by combining a few different types of gauges.
    - Of course, there are a few requirements when it comes to building a layout; current speed and fuel level for example, are mandatory.
  - **Dynamic content**
    - let’s talk about some of the choices drivers have to surface content in the cluster and beyond, along with some opportunities that this presents for you.
    - No matter the layout or design you land on, the system will always have a reserved space for what we call dynamic content.
  - **Bringing it all together**
    - Taken all together, this system allows you to create a deeply customized, integrated experience for your vehicles, and an delightful co-branded experience for those people who love both our products.
    - It goes far beyond what you can do with CarPlay today.
  - **Wrap-up**
    - The next generation of CarPlay is the best of iPhone and the best of your brand together in a beautiful, unified, consistent experience.
    - Unique to your brand, totally at home in your vehicle, with all the benefits of expanded features, deep integration, and familiar interaction patterns.

- 실전 해석: 초반 챕터는 개념 정의, 중반은 구성/API 적용, 후반은 운영/확장 포인트로 읽으면 팀 공유 자료로 활용하기 좋습니다.

## 🛠️ 세부 API

- 세션에서 반복적으로 등장하거나 설계상 중요한 API/개념

  - **CarPlay**
    - 왜 중요한지: 이 세션의 핵심 구현 전략 또는 설계 판단 포인트를 구성하는 요소입니다.
    - 언제 쓰는지: 실제 기능 구현/리팩터링/마이그레이션 설계 시 우선 검토 대상입니다.
  - **struct**
    - 왜 중요한지: 이 세션의 핵심 구현 전략 또는 설계 판단 포인트를 구성하는 요소입니다.
    - 언제 쓰는지: 실제 기능 구현/리팩터링/마이그레이션 설계 시 우선 검토 대상입니다.
  - **class**
    - 왜 중요한지: 이 세션의 핵심 구현 전략 또는 설계 판단 포인트를 구성하는 요소입니다.
    - 언제 쓰는지: 실제 기능 구현/리팩터링/마이그레이션 설계 시 우선 검토 대상입니다.
  - **ADAS**
    - 왜 중요한지: 이 세션의 핵심 구현 전략 또는 설계 판단 포인트를 구성하는 요소입니다.
    - 언제 쓰는지: 실제 기능 구현/리팩터링/마이그레이션 설계 시 우선 검토 대상입니다.

- 실전 개발자 관점: API 이름 자체보다 **상태 경계, 에러 처리, 성능 영향, 테스트 전략**까지 함께 봐야 재사용 가능한 패턴이 됩니다.

## 🔍 차이점

- 세션의 핵심은 단순 API 사용법보다, **문제를 어떻게 모델링하고 어떤 레이어에 배치하는지**를 보여주는 데 있습니다.
- 같은 기능도 Apple 권장 패턴을 따르면 상태 관리·에러 처리·성능 최적화 포인트가 더 명확해집니다.
- 실전 도입은 전체 교체보다 “파일럿 적용 → 패턴 검증 → 공통화” 순서가 리스크를 줄입니다.

## 🧪 실전 포인트

- 아키텍처: 세션에서 제시한 패턴을 전체 코드베이스에 즉시 적용하기보다, 변동성이 큰 모듈/화면/플로우부터 파일럿 적용 후 표준화하세요.
- UX: 기술 선택은 성능·안정성·예측 가능성을 통해 사용자 경험에 직접 반영됩니다.
- 주의사항: 데모 코드는 개념 전달 중심인 경우가 많으므로, 프로덕션 적용 시에는 오류 처리, 취소, 로깅, 관측성(metrics), 롤백 전략을 보강해야 합니다.
- 설계 판단 기준: 도입 이점(가독성/성능/안정성/개발속도)과 비용(학습/마이그레이션/테스트/호환성)을 팀 단위로 비교해 우선순위를 정하세요.
- 세션 기반 체크포인트

  - `Dynamic content`: let’s talk about some of the choices drivers have to surface content in the cluster and beyond, along with some opportunities that this presents for you.
  - `Bringing it all together`: Taken all together, this system allows you to create a deeply customized, integrated experience for your vehicles, and an delightful co-branded experience for those people who l...

## ✅ 핵심 정리

- 이 세션은 **Say hello to the next generation of CarPlay design system**를 단순 기능 소개가 아니라, 실제 제품/서비스 코드에 적용할 때 필요한 설계 판단 관점까지 연결해 이해하는 데 가치가 있습니다.
- 특히 실무에서는 “무엇을 도입할까”보다 “어떤 문제에 어떤 경계와 패턴으로 적용할까”를 합의하는 기준 문서로 활용하기 좋습니다.

핵심 메시지 한 문장: 세션의 핵심은 API 사용법 자체보다, 제품 요구사항과 운영 조건에 맞춰 도입 범위와 설계 경계를 판단하는 기준을 만드는 데 있습니다.
