# What’s new in DockKit

## ✨ 개요

- 세션 주제: **What’s new in DockKit**
- 세션 링크: `https://developer.apple.com/videos/play/wwdc2024/10164/`
- 핵심 소개: 세션 소개 및 Transcript를 기반으로 핵심 내용을 정리했습니다.
- 왜 중요한지: AI/ML 기능은 모델 성능만이 아니라 통합 방식·지연시간·전력·프라이버시 설계가 성공을 좌우하기 때문입니다.
- 언제 쓰는지: 온디바이스 AI 도입, 모델 추론 UX 설계, 성능 최적화 전략 수립 시 특히 유용합니다.
- 이 세션에서 특히 봐야 할 포인트

  - `Introduction`: Hello everyone.
  - `Introduction to Intelligent Tracking`: So, what is Intelligent Subject Tracking?
  - `How it works`: Now lets look at the underlying algorithms, and frameworks that make this possible.
  - `Custom control in your app`: These are some great changes we brought to DockKit system tracking, without you having to add any additional code to your app.

## 🧭 구조

- 세션은 챕터 기준으로 점진적으로 개념/구현/운영 포인트를 쌓는 구조입니다.
- 챕터 흐름 요약

  - **Introduction**
    - Hello everyone.
    - My name is Dhruv Samant, an engineer on the DockKit team, and today, I'm thrilled to share the exciting updates and innovations we've been working on for DockKit.
  - **Introduction to Intelligent Tracking**
    - So, what is Intelligent Subject Tracking?
    - Intelligent Subject Tracking aims to address the age-old question of who to focus on in a video scene.
  - **How it works**
    - Now lets look at the underlying algorithms, and frameworks that make this possible.
    - Building upon the multi-person tracker in iOS 17, which used iPhone's image intelligence to estimate trajectories of multiple subjects in a scene, we've developed a brand new Intelligent Tracking Pipeline in iOS 18.
  - **Custom control in your app**
    - These are some great changes we brought to DockKit system tracking, without you having to add any additional code to your app.
    - However, we want to give you even more control.
  - **Button controls for DocKit**
    - So this is how you can benefit from intelligent tracking in your app.
    - We are also adding button support for DockKit accessories.
  - **New camera modes**
    - Leveraging on our work in intelligent subject tracking, and remote control I am excited to announce that in iOS 18 we have expanded DockKit support to new camera modes in the iOS camera app - photo, panorama and cinematic mode.
    - We can now track subjects in the Camera app for photo mode.
  - **Monitor accessory battery**
    - In iOS 18, we've also added a feature that allows you to monitor the battery of your DockKit accessory within your app.
    - You can utilize this data to implement custom behaviors and display relevant status messages to your users.

- 실전 해석: 초반 챕터는 개념 정의, 중반은 구성/API 적용, 후반은 운영/확장 포인트로 읽으면 팀 공유 자료로 활용하기 좋습니다.

## 🛠️ 세부 API

- 세션에서 반복적으로 등장하거나 설계상 중요한 API/개념

  - **DockKit**
    - 왜 중요한지: 이 세션의 핵심 구현 전략 또는 설계 판단 포인트를 구성하는 요소입니다.
    - 언제 쓰는지: 실제 기능 구현/리팩터링/마이그레이션 설계 시 우선 검토 대상입니다.
  - **async**
    - 왜 중요한지: 이 세션의 핵심 구현 전략 또는 설계 판단 포인트를 구성하는 요소입니다.
    - 언제 쓰는지: 실제 기능 구현/리팩터링/마이그레이션 설계 시 우선 검토 대상입니다.
  - **class**
    - 왜 중요한지: 이 세션의 핵심 구현 전략 또는 설계 판단 포인트를 구성하는 요소입니다.
    - 언제 쓰는지: 실제 기능 구현/리팩터링/마이그레이션 설계 시 우선 검토 대상입니다.
  - **actor**
    - 왜 중요한지: 이 세션의 핵심 구현 전략 또는 설계 판단 포인트를 구성하는 요소입니다.
    - 언제 쓰는지: 실제 기능 구현/리팩터링/마이그레이션 설계 시 우선 검토 대상입니다.
  - **struct**
    - 왜 중요한지: 이 세션의 핵심 구현 전략 또는 설계 판단 포인트를 구성하는 요소입니다.
    - 언제 쓰는지: 실제 기능 구현/리팩터링/마이그레이션 설계 시 우선 검토 대상입니다.
  - **FaceTime**
    - 왜 중요한지: 이 세션의 핵심 구현 전략 또는 설계 판단 포인트를 구성하는 요소입니다.
    - 언제 쓰는지: 실제 기능 구현/리팩터링/마이그레이션 설계 시 우선 검토 대상입니다.
  - **DocKit**
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

  - `Button controls for DocKit`: So this is how you can benefit from intelligent tracking in your app.
  - `New camera modes`: Leveraging on our work in intelligent subject tracking, and remote control I am excited to announce that in iOS 18 we have expanded DockKit support to new camera modes in the iO...

## ✅ 핵심 정리

- 이 세션은 **What’s new in DockKit**를 단순 기능 소개가 아니라, 실제 제품/서비스 코드에 적용할 때 필요한 설계 판단 관점까지 연결해 이해하는 데 가치가 있습니다.
- 특히 실무에서는 “무엇을 도입할까”보다 “어떤 문제에 어떤 경계와 패턴으로 적용할까”를 합의하는 기준 문서로 활용하기 좋습니다.

핵심 메시지 한 문장: 세션의 핵심은 API 사용법 자체보다, 제품 요구사항과 운영 조건에 맞춰 도입 범위와 설계 경계를 판단하는 기준을 만드는 데 있습니다.
