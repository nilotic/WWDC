# Use CloudKit Console to monitor and optimize database activity

## ✨ 개요

- 세션 주제: **Use CloudKit Console to monitor and optimize database activity**
- 세션 링크: `https://developer.apple.com/videos/play/wwdc2024/10122/`
- 핵심 소개: 세션 소개 및 Transcript를 기반으로 핵심 내용을 정리했습니다.
- 왜 중요한지: 디자인 시스템/상태 흐름/UI 구조 선택이 화면 완성도와 유지보수성을 크게 좌우하기 때문입니다.
- 언제 쓰는지: 디자인 변경 반영, 신규 화면 설계, SwiftUI 리팩터링 시 적용 기준으로 쓰기 좋습니다.
- 이 세션에서 특히 봐야 할 포인트

  - `Introduction`: Hello, I'm Christopher Ward, and I'm an engineer on the iCloud developer experience team.
  - `Notifications`: Notifications make it clear when key events happen in your CloudKit containers.
  - `Telemetry`: Telemetry in the CloudKit Console visualises your app's interactions with your CloudKit containers.
  - `Logging`: When issues are identified within your app, you need as much detail as possible to resolve the problem.

## 🧭 구조

- 세션은 챕터 기준으로 점진적으로 개념/구현/운영 포인트를 쌓는 구조입니다.
- 챕터 흐름 요약

  - **Introduction**
    - Hello, I'm Christopher Ward, and I'm an engineer on the iCloud developer experience team.
    - The CloudKit Console's Database application is a tool enabling you to inspect data and manage your database schema in your CloudKit Containers.
  - **Notifications**
    - Notifications make it clear when key events happen in your CloudKit containers.
    - They are sent with important contextual information.
  - **Telemetry**
    - Telemetry in the CloudKit Console visualises your app's interactions with your CloudKit containers.
    - You will use Telemetry to understand current CloudKit activity, and observe trends across metrics including requests, errors, latency and bandwidth.
  - **Logging**
    - When issues are identified within your app, you need as much detail as possible to resolve the problem.
    - Individual operations your app triggers, can be explored in CloudKit Console's Database Logs.
  - **Alerts**
    - Creating custom alerts gives you the ability to react to important changes in your apps usage of CloudKit.
    - Alerts are triggered when values exceed or fall bellow specified thresholds or averages.

- 실전 해석: 초반 챕터는 개념 정의, 중반은 구성/API 적용, 후반은 운영/확장 포인트로 읽으면 팀 공유 자료로 활용하기 좋습니다.

## 🛠️ 세부 API

- 세션에서 반복적으로 등장하거나 설계상 중요한 API/개념

  - **CloudKit**
    - 왜 중요한지: 이 세션의 핵심 구현 전략 또는 설계 판단 포인트를 구성하는 요소입니다.
    - 언제 쓰는지: 실제 기능 구현/리팩터링/마이그레이션 설계 시 우선 검토 대상입니다.
  - **JSON**
    - 왜 중요한지: 이 세션의 핵심 구현 전략 또는 설계 판단 포인트를 구성하는 요소입니다.
    - 언제 쓰는지: 실제 기능 구현/리팩터링/마이그레이션 설계 시 우선 검토 대상입니다.
  - **CSV**
    - 왜 중요한지: 이 세션의 핵심 구현 전략 또는 설계 판단 포인트를 구성하는 요소입니다.
    - 언제 쓰는지: 실제 기능 구현/리팩터링/마이그레이션 설계 시 우선 검토 대상입니다.

- 실전 개발자 관점: API 이름 자체보다 **상태 경계, 에러 처리, 성능 영향, 테스트 전략**까지 함께 봐야 재사용 가능한 패턴이 됩니다.

## 🔍 차이점

- 세션의 핵심은 단순 API 사용법보다, **문제를 어떻게 모델링하고 어떤 레이어에 배치하는지**를 보여주는 데 있습니다.
- 같은 기능도 Apple 권장 패턴을 따르면 상태 관리·에러 처리·성능 최적화 포인트가 더 명확해집니다.
- 실전 도입은 전체 교체보다 “파일럿 적용 → 패턴 검증 → 공통화” 순서가 리스크를 줄입니다.

## 🧪 실전 포인트

- 아키텍처: 세션에서 제시한 패턴을 전체 코드베이스에 즉시 적용하기보다, 변동성이 큰 모듈/화면/플로우부터 파일럿 적용 후 표준화하세요.
- UX: 상태/레이아웃/상호작용 설계 품질이 사용자 체감 완성도에 바로 반영됩니다.
- 주의사항: 데모 코드는 개념 전달 중심인 경우가 많으므로, 프로덕션 적용 시에는 오류 처리, 취소, 로깅, 관측성(metrics), 롤백 전략을 보강해야 합니다.
- 설계 판단 기준: 도입 이점(가독성/성능/안정성/개발속도)과 비용(학습/마이그레이션/테스트/호환성)을 팀 단위로 비교해 우선순위를 정하세요.
- 세션 기반 체크포인트

  - `Alerts`: Creating custom alerts gives you the ability to react to important changes in your apps usage of CloudKit.

## ✅ 핵심 정리

- 이 세션은 **Use CloudKit Console to monitor and optimize database activity**를 단순 기능 소개가 아니라, 실제 제품/서비스 코드에 적용할 때 필요한 설계 판단 관점까지 연결해 이해하는 데 가치가 있습니다.
- 특히 실무에서는 “무엇을 도입할까”보다 “어떤 문제에 어떤 경계와 패턴으로 적용할까”를 합의하는 기준 문서로 활용하기 좋습니다.

핵심 메시지 한 문장: 세션의 핵심은 API 사용법 자체보다, 제품 요구사항과 운영 조건에 맞춰 도입 범위와 설계 경계를 판단하는 기준을 만드는 데 있습니다.
