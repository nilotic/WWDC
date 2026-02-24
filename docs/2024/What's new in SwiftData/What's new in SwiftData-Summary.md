# What’s new in SwiftData

## ✨ 개요

- 세션 주제: **What’s new in SwiftData**
- 세션 링크: `https://developer.apple.com/videos/play/wwdc2024/10137/`
- 핵심 소개: 세션 소개 및 Transcript를 기반으로 핵심 내용을 정리했습니다.
- 왜 중요한지: AI/ML 기능은 모델 성능만이 아니라 통합 방식·지연시간·전력·프라이버시 설계가 성공을 좌우하기 때문입니다.
- 언제 쓰는지: 온디바이스 AI 도입, 모델 추론 UX 설계, 성능 최적화 전략 수립 시 특히 유용합니다.
- 이 세션에서 특히 봐야 할 포인트

  - `Introduction`: iOS 17 introduced SwiftData — a framework that allows you to model and persist your app’s data in Swift across all of Apple’s platforms.
  - `Adopt SwiftData`: First, let’s take a quick tour of SwiftData.
  - `Customize the schema`: The first step was adding the @Model macro and that was just the beginning of how to customize the Schema.
  - `#Unique macro`: And this year, there is a new schema macro that allows you to construct a compound constraint on persistent models!

## 🧭 구조

- 세션은 챕터 기준으로 점진적으로 개념/구현/운영 포인트를 쌓는 구조입니다.
- 챕터 흐름 요약

  - **Introduction**
    - Hello, I am Rishi Verma, and I am an engineer on the SwiftData Team.
    - iOS 17 introduced SwiftData — a framework that allows you to model and persist your app’s data in Swift across all of Apple’s platforms.
  - **Adopt SwiftData**
    - First, let’s take a quick tour of SwiftData.
    - SwiftData is a framework that makes it easy to build your app’s model layer and persist it across launches of your app.
  - **Customize the schema**
    - The first step was adding the @Model macro and that was just the beginning of how to customize the Schema.
    - By simply decorating all of my persistable classes with the macro, the Trip class and related models will have their stored properties persisted.
  - **#Unique macro**
    - And this year, there is a new schema macro that allows you to construct a compound constraint on persistent models!
    - You can use the new #Unique macro to tell SwiftData which combinations of your model’s properties must always remain unique in the model data.
  - **History API**
    - And because these #Unique properties help ensure these @Models are not duplicated, they also represent the identity of this model.
    - You can also use the @Attribute macro to decorate these properties with preserveValueOnDeletion.
  - **Tailor a model container**
    - Tailoring the model container allows an app to fine tune its data location and how it is used throughout the app.
    - The modelContainer modifier is the easiest way to get started with SwiftData.
  - **Custom data stores**
    - In iOS 18, SwiftData lets you customize your modelContainer even further with fully custom data stores.
    - The default data store provides a robust persistence backend supporting all of SwiftData’s features.
  - **Xcode previews**
    - You can also create custom containers for use with Xcode previews.
    - Previews are the perfect companion when developing your app with SwiftUI, and work great with SwiftData.
  - **Customize queries**
    - Finally, let’s talk about creating rich and optimized queries for SwiftData.
    - Query drives your SwiftUI Views with an array of Models that can be sorted and filtered with ease, and it automatically reacts to changes made to the ModelContainer!
  - **#Expression macro**
    - New in iOS 18 is the ability to use Foundation’s new #Expression macro to build complex predicates easily!
    - Expressions allow for reference values that do not produce true or false but instead allow for arbitrary types.

- 실전 해석: 초반 챕터는 개념 정의, 중반은 구성/API 적용, 후반은 운영/확장 포인트로 읽으면 팀 공유 자료로 활용하기 좋습니다.

## 🛠️ 세부 API

- 세션에서 반복적으로 등장하거나 설계상 중요한 API/개념

  - **SwiftData**
    - 왜 중요한지: 이 세션의 핵심 구현 전략 또는 설계 판단 포인트를 구성하는 요소입니다.
    - 언제 쓰는지: 실제 기능 구현/리팩터링/마이그레이션 설계 시 우선 검토 대상입니다.
  - **macro**
    - 왜 중요한지: 이 세션의 핵심 구현 전략 또는 설계 판단 포인트를 구성하는 요소입니다.
    - 언제 쓰는지: 실제 기능 구현/리팩터링/마이그레이션 설계 시 우선 검토 대상입니다.
  - **SwiftUI**
    - 왜 중요한지: 이 세션의 핵심 구현 전략 또는 설계 판단 포인트를 구성하는 요소입니다.
    - 언제 쓰는지: 실제 기능 구현/리팩터링/마이그레이션 설계 시 우선 검토 대상입니다.
  - **macros**
    - 왜 중요한지: 이 세션의 핵심 구현 전략 또는 설계 판단 포인트를 구성하는 요소입니다.
    - 언제 쓰는지: 실제 기능 구현/리팩터링/마이그레이션 설계 시 우선 검토 대상입니다.
  - **CloudKit**
    - 왜 중요한지: 이 세션의 핵심 구현 전략 또는 설계 판단 포인트를 구성하는 요소입니다.
    - 언제 쓰는지: 실제 기능 구현/리팩터링/마이그레이션 설계 시 우선 검토 대상입니다.
  - **ModelContainer**
    - 왜 중요한지: 이 세션의 핵심 구현 전략 또는 설계 판단 포인트를 구성하는 요소입니다.
    - 언제 쓰는지: 실제 기능 구현/리팩터링/마이그레이션 설계 시 우선 검토 대상입니다.
  - **@Model**
    - 왜 중요한지: 이 세션의 핵심 구현 전략 또는 설계 판단 포인트를 구성하는 요소입니다.
    - 언제 쓰는지: 실제 기능 구현/리팩터링/마이그레이션 설계 시 우선 검토 대상입니다.
  - **class**
    - 왜 중요한지: 이 세션의 핵심 구현 전략 또는 설계 판단 포인트를 구성하는 요소입니다.
    - 언제 쓰는지: 실제 기능 구현/리팩터링/마이그레이션 설계 시 우선 검토 대상입니다.
  - **struct**
    - 왜 중요한지: 이 세션의 핵심 구현 전략 또는 설계 판단 포인트를 구성하는 요소입니다.
    - 언제 쓰는지: 실제 기능 구현/리팩터링/마이그레이션 설계 시 우선 검토 대상입니다.
  - **BucketListItems**
    - 왜 중요한지: 이 세션의 핵심 구현 전략 또는 설계 판단 포인트를 구성하는 요소입니다.
    - 언제 쓰는지: 실제 기능 구현/리팩터링/마이그레이션 설계 시 우선 검토 대상입니다.

- 실전 개발자 관점: API 이름 자체보다 **상태 경계, 에러 처리, 성능 영향, 테스트 전략**까지 함께 봐야 재사용 가능한 패턴이 됩니다.

## 🔍 차이점

- 이 세션은 기존 기능 전체 설명보다 **변경된 API/동작/권장 패턴** 중심으로 읽어야 실무 적용 가치가 큽니다.
- 적용 판단 시에는 신규 API 추가 여부보다 **기존 구현 대체 범위 / 호환성 / 테스트 비용**을 먼저 계산하는 게 중요합니다.
- 배포 타깃 OS 비율이 낮다면, feature flag 또는 조건부 적용으로 단계적 도입 전략을 잡는 편이 안전합니다.

## 🧪 실전 포인트

- 아키텍처: 세션에서 제시한 패턴을 전체 코드베이스에 즉시 적용하기보다, 변동성이 큰 모듈/화면/플로우부터 파일럿 적용 후 표준화하세요.
- UX: 정확도뿐 아니라 응답속도, 실패 처리, 사용자 신뢰 형성이 UX를 결정합니다.
- 주의사항: 데모 코드는 개념 전달 중심인 경우가 많으므로, 프로덕션 적용 시에는 오류 처리, 취소, 로깅, 관측성(metrics), 롤백 전략을 보강해야 합니다.
- 설계 판단 기준: 도입 이점(가독성/성능/안정성/개발속도)과 비용(학습/마이그레이션/테스트/호환성)을 팀 단위로 비교해 우선순위를 정하세요.
- 세션 기반 체크포인트

  - `History API`: And because these #Unique properties help ensure these @Models are not duplicated, they also represent the identity of this model.
  - `Tailor a model container`: Tailoring the model container allows an app to fine tune its data location and how it is used throughout the app.

## ✅ 핵심 정리

- 이 세션은 **What’s new in SwiftData**를 단순 기능 소개가 아니라, 실제 제품/서비스 코드에 적용할 때 필요한 설계 판단 관점까지 연결해 이해하는 데 가치가 있습니다.
- 특히 실무에서는 “무엇을 도입할까”보다 “어떤 문제에 어떤 경계와 패턴으로 적용할까”를 합의하는 기준 문서로 활용하기 좋습니다.

핵심 메시지 한 문장: 세션의 핵심은 API 사용법 자체보다, 제품 요구사항과 운영 조건에 맞춰 도입 범위와 설계 경계를 판단하는 기준을 만드는 데 있습니다.
