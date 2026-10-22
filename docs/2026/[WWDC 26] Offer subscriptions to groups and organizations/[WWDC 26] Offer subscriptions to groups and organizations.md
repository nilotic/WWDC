# WWDC26 — Offer subscriptions to groups and organizations

- **Session:** 391
- **Title:** Offer subscriptions to groups and organizations
- **Source:** https://developer.apple.com/videos/play/wwdc2026/391/
- **Basis:** Apple Developer 공식 전체 transcript
- **Topic:** StoreKit 2, auto-renewable subscriptions, Group Purchases, Volume Purchasing, Apple Business Manager, Apple School Manager, volume pricing, seat management

---

## 🎯 한 줄 요약

Apple은 기존의 개인 중심 자동 갱신 구독을 **그룹과 조직 단위 구매**까지 확장한다. 개발자는 같은 구독을 앱 안의 **Group Purchases**와 Apple Business Manager·Apple School Manager의 **Volume Purchasing** 두 경로로 판매할 수 있고, 구매 좌석 수에 따라 가격을 낮추는 **volume pricing**, Apple이 제공하는 기본 좌석 관리, App Store Server API 기반의 맞춤형 그룹 관리까지 선택할 수 있다.

---

## 🧭 세션 구성

| 시간 | Chapter | 핵심 내용 |
|---|---|---|
| 0:00 | Introduction | 그룹/조직 구독의 두 구매 경로 소개 |
| 2:17 | Availability | StoreKit 2 자동 갱신 구독의 지원 범위와 App Store Connect 설정 |
| 3:24 | Pricing | 좌석별 기본 가격과 최대 5개 구간의 volume pricing |
| 4:43 | Purchasing | Volume Purchasing과 앱 내 Group Purchases 구매 흐름 |
| 5:25 | Seat Management | 조직 배포, 초대 링크, 기본/커스텀 seat management |
| 5:26 | Next steps | StoreKit 2 전환, 가격·가용성·협업 경험 점검 |

---

# 👥 왜 그룹과 조직을 위한 구독인가

기존 App Store 구독은 기본적으로 한 사람이 자신을 위해 구매하는 흐름에 초점이 맞춰져 있었다. 하지만 실제 앱에는 여러 사람이 하나의 서비스에 함께 참여하려는 요구가 있다.

세션에서는 다음과 같은 예를 든다.

- 회사가 편집자 팀 전체에게 영상 편집 소프트웨어를 제공하는 경우
- 러닝 클럽 구성원이 운동 앱을 함께 사용하며 동기 부여와 책임감을 공유하는 경우

이 요구를 위해 Apple은 자동 갱신 구독을 그룹과 조직에 판매하는 두 가지 경로를 제공한다.

### 1. Group Purchases

일반적인 인앱 구독 구매와 비슷하지만 구매자가 **자신 한 명이 아니라 여러 좌석(seats)**을 함께 구매한다.

구매자는 필요한 좌석 수를 선택한 뒤, 생성된 **invitation link**를 다른 사람에게 공유한다. 초대를 받은 사람이 수락하면 해당 구독의 좌석이 자동으로 할당된다.

Apple은 이 방식을 **소규모 팀이나 사회적 그룹**이 앱을 함께 사용하는 경우에 적합한 모델로 설명한다.

### 2. Volume Purchasing

기업이나 학교처럼 대규모 조직은 **Apple Business Manager** 또는 **Apple School Manager**에서 구독을 구매한다.

조직은 기존에 앱을 대규모로 배포하던 것과 같은 방식으로 device management service를 이용해 구성원에게 구독 좌석을 할당한다.

Apple은 이 방식이 다음 요구를 가진 조직에 적합하다고 설명한다.

- 더 큰 구매 규모
- 조직 차원의 관리
- 구성원 identity와 배포 관리

즉, 두 모델은 같은 “여러 사람에게 구독을 제공한다”는 목적을 가지지만 관리 주체와 배포 방식이 다르다.

| 구분 | Group Purchases | Volume Purchasing |
|---|---|---|
| 구매 위치 | 개발자의 앱 내부 | Apple Business Manager / Apple School Manager |
| 대표 대상 | 소규모 팀, 친구·동호회 등 social group | 기업, 학교 등 조직 |
| 좌석 배포 | 구매자가 invitation link 공유 | 조직이 device management service로 할당 |
| 구매 UI | 개발자가 앱에서 구성 | Apple Business/School Manager가 처리 |
| 관리 특성 | 비교적 간단한 초대 기반 | 대규모 배포·관리·identity 요구에 적합 |

---

# ✅ Availability — 어떤 구독에서 사용할 수 있나

이 기능은 **StoreKit 2를 사용하는 모든 auto-renewable subscription**을 대상으로 한다.

Apple이 명확히 강조하는 전제는 다음과 같다.

> 그룹과 조직에 구독을 제공하려면 StoreKit 2가 필요하다.

대부분의 신규 및 기존 StoreKit 2 구독에서는 그룹과 조직에 판매하는 기능이 기본적으로 활성화된다.

다만 **Family Sharing이 활성화된 구독**은 예외다. 이런 구독도 그룹/조직 판매 자체는 지원하지만 기본값은 opt-out이다. 개발자가 Family Sharing과 새로운 그룹 구매 모델을 어떻게 함께 운영할지 결정하도록 한 것이다.

## App Store Connect에서 조정 가능한 범위

개발자는 구독별로 그룹/조직 판매 가용성을 변경할 수 있다.

세션에서 설명한 선택지는 다음과 같다.

- Group Purchases와 Volume Purchasing 모두 제공
- **Apple School Manager에만** 제공
- 그룹과 조직에 대한 판매를 완전히 끄기

### Apple School Manager 전용 구독

구독을 Apple School Manager에만 제공하도록 설정할 수 있다. 이를 통해 **검증된 교육기관을 위한 별도의 플랜과 가격 전략**을 구성할 수 있다.

### 그룹/조직 판매를 끄는 경우

해당 구독은 다음 경로에서는 판매되지 않는다.

- Apple Business Manager의 Volume Purchasing
- Apple School Manager의 Volume Purchasing
- 앱 내부 Group Purchases

하지만 **개인 고객에게 App Store 구독을 판매하는 것은 계속 가능**하다.

따라서 그룹/조직 판매 여부는 개인용 구독 판매 여부와 독립적으로 관리할 수 있다.

---

# 💰 Pricing — 좌석 수에 따른 가격 전략

기본 동작은 단순하다. 그룹이나 조직이 여러 좌석을 구매하더라도 **각 좌석은 App Store Connect에 설정된 현재 구독 가격**으로 판매된다.

대량 구매를 유도하려면 새로운 **volume pricing**을 사용할 수 있다.

## 최대 5개의 price band

Volume pricing에서는 최대 **5개의 가격 구간(price bands)**을 설정할 수 있다.

각 구간마다 개발자가 직접 지정할 수 있는 요소는 다음과 같다.

- 해당 가격이 적용되기 시작하는 좌석 수
- 좌석당 가격

즉, 구매 좌석 수가 많아질수록 좌석당 가격을 낮추는 구조를 만들 수 있다.

## 세션의 가격 예시

Apple은 월 $19.99인 구독을 예로 든다.

| 구매 좌석 범위 | 좌석당 월 가격 |
|---|---:|
| 1–20석 | $19.99 |
| 21–40석 | $13.99 |
| 41석 이상 | $10.99 |

이 구조에는 총 3개의 price band가 사용된다.

50석을 구매하는 예에서는 전체 평균 좌석당 비용이 기본 가격보다 **약 20% 낮아진다**고 설명한다.

Volume pricing의 목적은 단순 할인뿐 아니라 다음 행동을 유도하는 데 있다.

- 구매자가 더 많은 구성원을 하나의 구독으로 포함
- 여러 개의 흩어진 구매를 한 조직의 구매로 통합
- 팀 전체가 동일한 서비스에 참여하도록 유도

가격 구성은 **App Store Connect에서 직접 설정**한다.

---

# 🛒 Purchasing — 두 구매 경로의 차이

## Volume Purchasing

Apple Business Manager와 Apple School Manager가 다음을 처리한다.

- 구독 표시
- 조직의 구매 흐름

개발자의 핵심 작업은 해당 구독이 **organizations에 available**하도록 설정하는 것이다.

세션은 Volume Purchasing을 위해 개발자가 별도의 조직용 구매 화면을 만들어야 한다고 설명하지 않는다. 구매 자체는 Apple Business/School Manager 채널에서 처리된다.

## Group Purchases

Group Purchases는 앱 안에서 이루어지므로 개발자가 **자체 merchandising 및 구매 UI**를 구성한다.

세션이 제시하는 흐름은 다음과 같다.

1. 앱에서 그룹 구독의 가치를 사용자에게 보여 준다.
2. 사용자가 필요한 좌석 수를 선택한다.
3. 선택된 **seat count**를 StoreKit 2 purchase request에 전달한다.
4. StoreKit 2 구매 흐름을 시작한다.

특히 merchandising 단계에서 단순히 “여러 개 살 수 있다”는 기능만 보여 주기보다, 친구·팀원·동료가 함께 구독했을 때 얻는 가치를 전달하는 것이 중요하다고 설명한다.

### Transcript가 명시하지 않은 부분

이 세션은 짧은 개요 세션으로, seat count를 전달하는 **구체적인 StoreKit 2 타입·프로퍼티·메서드 이름은 transcript에서 제시하지 않는다.** 따라서 이 문서에서도 API 이름을 임의로 추정하지 않는다.

---

# 💺 Seat Management — 구매 후 좌석은 어떻게 관리되나

구매가 완료되면 실제 구성원에게 좌석을 할당해야 한다.

두 구매 방식의 seat assignment는 서로 다르다.

## Volume Purchasing의 좌석 할당

조직은 앱을 배포할 때와 동일한 방식으로 **device management service**를 사용해 구성원에게 좌석을 할당한다.

이 모델의 특징은 다음과 같다.

- 조직이 좌석의 소유·관리를 담당
- 대규모 구성원에게 일괄 배포 가능
- 기존 조직용 앱 배포 workflow와 일관됨

## Group Purchases의 좌석 할당

초기 구매자에게 **invitation link**가 생성된다.

구매자가 이 링크를 구성원에게 공유하고, 구성원이 초대를 수락하면 좌석이 할당된다.

## 구성원별 App Store transaction

두 방식 모두 seat assignment가 완료되면 **App Store가 각 구성원에게 transaction을 할당**한다.

개발자는 이 transaction을 기반으로 해당 구성원에게 구독 기능 접근 권한을 제공할 수 있다.

이 점은 “구매자 한 명의 transaction을 여러 사용자가 공유한다”는 모델과 다르다. 실제 좌석이 구성원에게 배정되면 각 구성원 측에도 App Store transaction이 존재하는 구조다.

---

# 🧩 기본 Seat Management 시스템

Group Purchases를 지원하기 위해 개발자가 반드시 자체 그룹/초대 서버를 구축해야 하는 것은 아니다.

기본적으로 Apple이 제공하는 **included seat management system**을 사용할 수 있다.

이 시스템이 담당하는 범위는 다음과 같다.

- invitation link 생성
- 구성원의 초대 수락 상태 추적
- 좌석 assignment 추적
- cancellation 등 애플리케이션의 seat lifecycle 관리

따라서 기본 모델에서는 개발자가 **purchase request를 시작**하면 이후 좌석 관리의 상당 부분을 Apple이 처리할 수 있다.

이는 이미 그룹 관리 인프라가 없는 앱이 Group Purchases를 도입할 때 중요한 진입 장벽을 낮춘다.

---

# 🛠️ Custom invitation 및 member management

이미 자체 invitation/member management 시스템이 있는 앱은 기존 구조를 계속 활용할 수 있다.

Apple은 **새로운 App Store Server API endpoints**를 통해 custom invitation flow와의 통합을 지원할 예정이라고 설명한다.

즉, 선택지는 두 가지다.

### Apple의 기본 관리 사용

- Apple이 invitation link 생성
- acceptance/assignment 추적
- seat lifecycle 관리
- 개발자가 별도 그룹 관리 인프라를 최소화할 수 있음

### 자체 관리 시스템 사용

- 이미 앱에 존재하는 그룹·팀·조직 모델 활용
- 자체 invitation/member workflow 유지
- App Store Server API의 새로운 endpoint를 통해 구매/좌석 상태와 통합

세션은 이 custom endpoint의 구체적인 URL이나 요청/응답 schema까지 설명하지 않는다.

---

# 🌐 App Store Server API의 Group management

앱이 같은 구독에 속한 구성원끼리 다음과 같은 기능을 제공할 수 있다.

- collaboration
- shared resources
- 그룹 전용 콘텐츠나 상태

이 경우 **App Store Server API Group management endpoints**를 사용해 group 정보를 가져올 수 있다.

세션에서 명시한 조회 범위는 다음과 같다.

- 한 고객이 속해 있는 **모든 group**
- 특정 group에 포함된 **모든 member**

이 endpoint들은 다음 두 구매 유형에서 모두 지원된다.

- Volume Purchasing
- Apple의 included seat management flow를 사용하는 Group Purchases

따라서 구독의 entitlement 확인뿐 아니라 “이 사용자가 어느 그룹에 속해 있는가”, “같은 그룹의 구성원은 누구인가” 같은 협업 경험을 서버에서 구성할 기반이 제공된다.

---

# 🧠 Family Sharing과 Group Purchases의 관계

두 기능 모두 한 구매가 여러 사람에게 가치를 제공한다는 점에서 비슷해 보이지만, 세션의 설정 동작에서 차이가 드러난다.

Family Sharing이 활성화된 기존 구독에서도 그룹/조직 판매를 사용할 수 있지만 **기본적으로 opt-out**이다. 개발자가 두 모델을 함께 사용할지 직접 판단해야 한다.

이 세션은 Family Sharing과 Group Purchases 사이의 entitlement 우선순위, 중복 가입 처리, 구성원 이동 시 동작 같은 세부 정책까지 설명하지 않는다. 따라서 이런 세부 동작은 이 transcript만으로 단정할 수 없다.

---

# 🏢 Group Purchases와 Volume Purchasing 선택 기준

세션의 설명을 그대로 구조화하면 다음과 같이 볼 수 있다.

| 요구 | 적합한 방식 |
|---|---|
| 친구나 작은 팀이 함께 사용 | Group Purchases |
| 구매자가 앱에서 직접 좌석 수 선택 | Group Purchases |
| 초대 링크로 간단히 멤버 참여 | Group Purchases |
| 기업/학교가 중앙에서 구매 | Volume Purchasing |
| 많은 구성원에게 일괄 할당 | Volume Purchasing |
| 조직이 좌석의 소유·관리 주체 | Volume Purchasing |
| 기존 device management workflow 사용 | Volume Purchasing |
| 교육기관 전용 가격/플랜 | Apple School Manager 전용 availability 활용 |

두 방식을 반드시 하나만 선택해야 하는 것은 아니다. 동일한 auto-renewable subscription을 App Store Connect 설정에 따라 두 경로에 모두 제공할 수 있다.

---

# 🔄 전체 흐름

## Group Purchases

```text
앱에서 그룹 구독 merchandising
        ↓
사용자가 좌석 수 선택
        ↓
StoreKit 2 purchase request
        ↓
구매 완료
        ↓
Invitation link 생성
        ↓
구매자가 구성원에게 공유
        ↓
구성원이 초대 수락
        ↓
좌석 할당
        ↓
구성원별 App Store transaction 할당
        ↓
앱에서 entitlement 제공
```

Apple의 기본 seat management를 사용하면 invitation과 lifecycle 관리가 이 흐름에 포함된다.

## Volume Purchasing

```text
구독을 organizations에 available로 설정
        ↓
Apple Business Manager / Apple School Manager에 표시
        ↓
조직이 필요한 좌석 구매
        ↓
Device management service로 구성원에게 좌석 할당
        ↓
구성원별 App Store transaction 할당
        ↓
앱에서 entitlement 제공
```

---

# 📋 도입 체크리스트

## StoreKit / Availability

- [ ] 대상 구독이 auto-renewable subscription인지 확인
- [ ] StoreKit 2 사용 여부 확인
- [ ] 기존 StoreKit 구현을 StoreKit 2로 전환할 필요가 있는지 확인
- [ ] 각 구독의 groups/organizations availability 설정 확인
- [ ] Family Sharing 구독의 기본 opt-out 상태 확인
- [ ] Group Purchases 활성화 여부 결정
- [ ] Apple Business Manager Volume Purchasing 활성화 여부 결정
- [ ] Apple School Manager Volume Purchasing 활성화 여부 결정
- [ ] 교육기관 전용 구독/가격 전략 필요성 검토

## Pricing

- [ ] 현재 per-seat 기본 가격이 조직 구매에도 적절한지 확인
- [ ] 대량 구매에 volume pricing을 적용할지 결정
- [ ] 최대 5개 price band 안에서 수량 구간 설계
- [ ] 각 band의 per-seat price 결정
- [ ] 대량 구매 시 전체 평균 단가와 매출 효과 검토

## Group Purchases UX

- [ ] 그룹 구독의 가치를 설명하는 merchandising UI 설계
- [ ] 구매자가 seat count를 선택할 UI 제공
- [ ] 선택한 seat count를 StoreKit 2 purchase request에 전달
- [ ] 구매 후 초대 과정을 사용자가 이해할 수 있게 안내
- [ ] Apple included seat management 사용 여부 결정
- [ ] 자체 invitation/member management가 있다면 Server API 연동 계획 수립

## Organization / Server

- [ ] Volume Purchasing 구매자는 Business/School Manager에서 처리됨을 고려
- [ ] 조직의 device management 기반 좌석 할당 흐름 이해
- [ ] 구성원별 App Store transaction을 entitlement에 반영
- [ ] 협업 기능이 있다면 Group management endpoints 활용 검토
- [ ] 고객이 속한 group 목록 활용 여부 검토
- [ ] group member 목록을 shared-resource 권한과 연결할지 검토
- [ ] cancellation 등 seat lifecycle 변화 처리 계획 수립

---

# ⚠️ Transcript가 다루지 않는 세부 사항

이 세션은 기능을 소개하는 약 6분 분량의 개요 세션이다. 따라서 다음 사항은 공식 transcript에 구체적으로 제시되지 않는다.

- StoreKit 2에서 seat count를 전달하는 구체적인 API 타입/프로퍼티 이름
- 새로운 App Store Server API endpoint의 URL과 request/response schema
- 서버 notification payload의 세부 변화
- 좌석 추가·감소 시 과금 prorating 규칙
- seat transfer의 세부 정책
- Family Sharing과 Group Purchases를 동시에 사용하는 경우의 세부 entitlement 우선순위
- 기존 구독자의 그룹 플랜 전환 절차
- refund 및 billing retry 시 group member별 세부 동작

따라서 위 항목은 이 세션 transcript만으로 임의 보완하지 않는다.

---

# 🚀 Apple이 제안하는 Next steps

세션 마지막에서 Apple은 개발자가 지금부터 다음 세 가지를 검토하라고 권한다.

### StoreKit 2로 전환

아직 StoreKit 2를 사용하지 않는다면 우선 전환한다. 그룹 및 조직 구독을 제공하기 위한 필수 조건이다.

### Availability와 pricing 전략 재검토

기존 구독과 새 구독 모두에 대해 다음이 가격/판매 전략에 어떤 영향을 주는지 검토한다.

- Group Purchases
- Volume Purchasing
- Volume pricing

### 그룹에 맞는 앱 경험 설계

단순히 여러 좌석을 판매하는 것에서 끝내지 않고 그룹·조직 사용자가 함께 사용할 수 있는 경험을 고려한다.

- 협업
- 공유 리소스
- 팀/그룹 단위 기능
- 기존 collaborative experience 개선

구독 판매 모델의 변화가 앱 기능 설계 자체의 확장으로 연결될 수 있다는 것이 세션의 마지막 메시지다.

---

# 🧩 핵심 메시지

WWDC26의 그룹/조직 구독은 하나의 새로운 구독 상품 유형을 추가하는 것보다 **기존 auto-renewable subscription의 구매자 범위를 개인에서 여러 사람과 조직으로 확장하는 변화**에 가깝다.

개발자는 StoreKit 2를 기반으로 동일한 구독을 소규모 그룹에는 앱 내 Group Purchases로, 기업과 학교에는 Apple Business Manager·Apple School Manager의 Volume Purchasing으로 제공할 수 있다. 구매 규모에 맞춰 최대 5단계의 volume pricing을 구성할 수 있고, 좌석 배포 역시 Apple의 기본 관리 시스템을 사용하거나 기존 그룹 인프라와 App Store Server API를 연결할 수 있다.

따라서 실제 도입에서 중요한 결정은 다음 네 가지다.

1. **어떤 구독을 그룹/조직에 공개할 것인가**
2. **좌석 수에 따라 어떤 가격 구조를 적용할 것인가**
3. **Apple의 기본 seat management와 자체 그룹 관리 중 무엇을 사용할 것인가**
4. **여러 사람이 같은 구독에 속한다는 정보를 앱의 협업 경험에 어떻게 연결할 것인가**

---

# 🔗 함께 보면 좋은 자료

- Apple Developer — Offer subscriptions to groups and organizations (WWDC26 Session 391)
- StoreKit 2
- App Store Connect
- App Store Server API
- Apple Business Manager
- Apple School Manager
- WWDC26 — What’s new in managing Apple devices
