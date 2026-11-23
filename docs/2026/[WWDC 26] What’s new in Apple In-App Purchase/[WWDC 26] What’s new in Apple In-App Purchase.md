# WWDC26 — What’s new in Apple In-App Purchase

- **Session:** 210
- **Source:** https://developer.apple.com/videos/play/wwdc2026/210/
- **Basis:** Apple Developer 공식 전체 transcript 및 Code 섹션
- **Topics:** StoreKit, subscriptions, App Store Server API, offer codes, App Review

---

## 🎯 한 줄 요약

iOS 26.5부터 연간 자동 갱신 구독에 **월 단위 결제 + 12개월 약정**을 추가할 수 있고, StoreKit은 이를 `PricingTerms`와 `billingPlanType`으로 노출한다. 앱과 서버는 `commitmentInfo`로 약정 진행 상황을 추적하며, Xcode에서 테스트할 수 있다. WWDC26에서는 여기에 **Bundles/Suites**, 검증 결과를 직접 돌려주는 **offer code redemption API**, 그리고 여러 In-App Purchase를 하나의 **App Review submission**으로 묶는 제출 흐름까지 확장했다.

---

## 🧭 세션 구성

| 시간 | 챕터 |
|---|---|
| 0:01 | Introduction |
| 0:51 | Overview of monthly subscriptions with a 12-month commitment |
| 1:42 | Set up in App Store Connect |
| 2:28 | Merchandise with StoreKit |
| 6:55 | Monitor subscriptions with App Store Server APIs |
| 8:50 | Bundles and Suites |
| 9:26 | Offer code redemption |
| 10:35 | Enhanced submission experience |
| 12:38 | Next steps |

---

# 💳 월 단위 결제 + 12개월 약정

## 어떤 상품인가

기존 연간 자동 갱신 구독은 일반적으로 1년치 가격을 한 번에 결제한다. 새 옵션은 **연간 구독의 약정 기간은 12개월로 유지하면서, 결제는 매월 이루어지도록** 만든다.

Apple은 이 모델을 **monthly subscription with a 12-month commitment**라고 부른다.

핵심 특성:

- 새 상품을 별도로 만들지 않고, **기존 또는 신규 1년 auto-renewable subscription에 billing plan을 추가**한다.
- 고객은 연간 선불 결제와 월별 결제 중 하나를 선택할 수 있다.
- 월별 결제더라도 전체 약정은 12개월이다.
- Billing plan별로 서로 다른 subscription offer를 구성할 수 있다.
- 예를 들어 월별 12개월 약정 플랜에만 무료 체험을 붙일 수 있다.

세션 기준으로 앱을 **26.5 SDK 이상으로 빌드**하면 지원 시장에서 iOS, iPadOS, macOS, tvOS, visionOS 26.4 이상 기기에서 이 billing plan을 판매할 수 있다.

## App Store Connect 설정

App Store Connect의 Subscriptions에서 **duration이 1년인 상품**을 선택하고, `Monthly with a 12-month commitment` availability를 설정한다.

구성 항목은 크게 다음과 같다.

- availability
- monthly pricing
- offers
- billing plan별 판매 조건

기존 annual subscription과 동일한 product를 사용하되, 그 안에 여러 pricing terms가 존재하게 된다.

---

# 🏷️ StoreKit에서 새로운 billing plan 노출

## `SubscriptionInfo.PricingTerms`

StoreKit은 `SubscriptionInfo`에 새로운 `pricingTerms` 정보를 제공한다.

한 auto-renewable subscription에는 최소 하나의 billing plan이 존재한다.

- 기본: `.upFront`
- 월별 12개월 약정 플랜을 설정한 경우: 추가로 `.monthly`

즉 하나의 `Product` 안에서 고객 storefront에 따라 사용할 수 있는 여러 결제 조건을 가져올 수 있다.

### StoreKit Views에서 월별 플랜 우선 노출

```swift
import StoreKit
import SwiftUI

struct SubscriptionStore: View {
    var body: some View {
        SubscriptionStoreView(groupID: "3F19ED53") {
            // Custom marketing content
        }
        .preferredSubscriptionPricingTerms { _, subscriptionInfo in
            subscriptionInfo.pricingTerms.first {
                $0.billingPlanType == .monthly
            }
        }
    }
}
```

`preferredSubscriptionPricingTerms`를 사용하면 `SubscriptionStoreView`가 특정 billing plan을 우선적으로 상품화하도록 지정할 수 있다.

StoreKit Views는 App Store에서 상품 메타데이터를 불러오고 플랫폼에 맞춰 UI를 자동 조정하므로, 커스텀 store UI를 직접 구현하지 않아도 새 결제 옵션을 노출할 수 있다.

---

# 🧾 Custom UI에서 가격 표시와 구매

StoreKit Views 대신 직접 UI를 구성하려면 `Product`를 가져오고 `.pricingTerms`에서 원하는 billing plan을 찾는다.

```swift
import StoreKit

var product: Product?
// Fetch and assign product

let pricingTerms = product?.subscription?.pricingTerms
    .first(where: { $0.billingPlanType == .monthly })

if let pricingTerms {
    let monthlyPrice = pricingTerms.billingDisplayPrice
    let totalCommitmentPrice = pricingTerms.commitmentInfo.price
    // Display both monthly and total commitment price to the customer
}

let result = try? await product?.purchase(
    options: [.billingPlanType(.monthly)]
)

switch result {
    // Verify the transaction, give the customer access to
    // the purchased content, and then finish the transaction
}
```

여기서 UI에 표시해야 할 중요한 값은 두 가지다.

- **월별 결제 금액**
- **12개월 전체 약정 금액**

`pricingTerms`는 해당 고객의 storefront에서 billing plan이 실제로 판매 가능한 경우에만 반환될 수 있으므로, `.monthly`가 항상 존재한다고 가정하면 안 된다.

구매 시에는 새 purchase option인 다음 값을 전달한다.

```swift
.billingPlanType(.monthly)
```

이를 통해 동일한 Product 안에서 어떤 billing plan을 구매하는지 StoreKit에 명시한다.

---

# 🛡️ 첫 구매 시 App Store disclosure

고객이 처음으로 12개월 약정 월별 플랜을 구독할 때 App Store가 disclosure sheet를 자동 표시한다.

이 화면은 Apple Account당 한 번 표시되며 다음 내용을 설명한다.

- 약정을 완료하기 위해 필요한 결제 횟수
- cancellation guidance
- 전체 commitment의 의미

앱에서 별도로 이 고지 UI를 재구현할 필요는 없다.

---

# ⚙️ 구독 관리 UI

활성 약정이 있으면 App Store의 subscription management UI도 새 billing plan을 이해한다.

고객은 다음 정보를 확인할 수 있다.

- 사용 가능한 plan
- 남은 payment 횟수
- commitment renewal 시점

SwiftUI에서 직접 관리 화면을 열 수 있다.

```swift
import SwiftUI
import StoreKit

struct ManageSubscriptionsButton: View {
    let subscriptionGroupID: String
    @State var presentingManageSubscriptionsSheet: Bool = false

    var body: some View {
        Button("Manage Subscriptions") {
            presentingManageSubscriptionsSheet = true
        }
        .manageSubscriptionsSheet(
            isPresented: $presentingManageSubscriptionsSheet,
            subscriptionGroupID: subscriptionGroupID
        )
    }
}
```

UIKit에서는 `showManageSubscriptions` API를 사용할 수 있다.

---

# 🔎 Transaction에서 약정 상태 읽기

새 billing plan의 실제 entitlement와 진행 상태는 `Transaction`에서 확인한다.

## `billingPlanType`

Transaction은 어떤 billing plan에서 발생한 거래인지 알려준다.

- `.upFront`
- `.monthly`

## `commitmentInfo`

- `.upFront` transaction: `commitmentInfo == nil`
- `.monthly` transaction: `commitmentInfo`가 존재

`commitmentInfo`에는 전체 약정에서 현재 결제가 어디에 위치하는지, 가격과 만료 시점 등의 정보를 얻을 수 있다.

Apple은 **정확한 expirationDate를 얻으려면 항상 latest transaction을 사용**하라고 명시한다.

앱에서는 이 데이터를 다음 용도로 활용할 수 있다.

- entitlement 확인
- 남은 기간 UI
- 약정 진행 indicator
- 고객에게 다음 결제/약정 만료 정보 제공

---

# 🔁 RenewalInfo

`RenewalInfo`에도 새 필드가 추가된다.

- `renewalBillingPlanType`
- `commitmentInfo`

Transaction이 현재 billing period를 설명한다면, RenewalInfo는 **현재 12개월 commitment가 끝난 뒤 어떻게 갱신될지**를 설명하는 데 초점이 있다.

세션에서는 월별 약정이 끝난 뒤 다른 상품의 **BILLED_UPFRONT** plan으로 갱신하도록 변경한 예시를 보여준다.

이 필드들은 OS 26.4부터 제공된다.

---

# 🧪 StoreKit Testing in Xcode

Xcode 26.5부터 StoreKit configuration에서 1년 auto-renewable subscription을 선택하면 Billing Plan picker에서 다음을 구성할 수 있다.

- `Monthly with a 12-month commitment`
- 월별 가격
- billing plan별 offer

테스트 순서:

1. StoreKit configuration에서 annual subscription 선택
2. Billing Plan을 monthly commitment로 추가
3. 가격/offer 구성
4. 테스트 앱에서 구매
5. Transaction Manager에서 transaction 확인
6. Transaction inspector에서 `commitmentInfo` 검증

App Store Connect에 올리기 전에 로컬 StoreKit Testing으로 전체 구매 흐름을 반복 검증할 수 있다.

---

# 🌐 App Store Server API / Notifications

서버에서도 commitment 정보를 동일하게 추적할 수 있도록 signed transaction과 renewal info에 새 필드가 추가된다.

## JWSTransaction 예시

```json
{
    "expiresDate": 1783503660000,
    "price": 10990,
    "productId": "plus.pro.annual",
    "purchaseDate": 1780911660000,
    "type": "Auto-Renewable Subscription",
    "billingPlanType": "MONTHLY",
    "commitmentInfo": {
        "billingPeriodNumber": 1,
        "totalBillingPeriods": 12,
        "commitmentExpiresDate": 1812447660000,
        "commitmentPrice": 131880
    }
}
```

중요한 점은 `expiresDate`와 `price`가 **현재 billing period**를 나타내는 반면, `commitmentInfo`는 전체 약정을 설명한다는 것이다.

예:

- `billingPeriodNumber`: 현재 몇 번째 월별 결제인지
- `totalBillingPeriods`: 전체 결제 횟수
- `commitmentExpiresDate`: 전체 약정 만료 시점
- `commitmentPrice`: 전체 약정 금액

Subscription notification은 기존처럼 monthly renewal을 포함한 lifecycle event를 계속 전달한다.

## JWSRenewalInfo 예시

```json
{
    "renewalBillingPlanType": "MONTHLY",
    "commitmentInfo": {
        "commitmentAutoRenewProductId": "plus.standard.annual",
        "commitmentAutoRenewStatus": 0,
        "commitmentRenewalDate": 1812447660000,
        "commitmentRenewalPrice": 10990,
        "commitmentRenewalBillingPlanType": "BILLED_UPFRONT"
    }
}
```

Renewal info의 commitment 관련 필드는 **현재 subscription이 commitment 안에 있을 때** 제공된다.

서버 구현에서는 현재 한 달의 결제와 전체 약정의 갱신 계획을 구분해서 모델링하는 것이 중요하다.

---

# 📣 Retention Messaging과의 연동

WWDC26의 Retention Messaging API 역시 월별 12개월 약정 billing plan을 지원한다.

즉 cancellation/retention 전략을 구축한 앱은 새 payment option도 기존 retention infrastructure에 포함할 수 있다.

세션은 자세한 내용은 **Explore Retention Messaging in App Store Connect**를 참고하도록 안내한다.

---

# 📦 Bundles와 Suites

Apple은 subscription offering을 확장하기 위한 새로운 개념으로 **Bundles**와 **Suites**도 소개한다.

## Bundle

여러 subscription이 각각 독립적으로 구매 가능하지만, 함께 묶어 단일 구매로 판매한다.

특징:

- 각 subscription을 개별 구매 가능
- bundle로 함께 구매 가능
- 일반적으로 개별 합산보다 더 나은 가격 제공

## Suite

여러 subscription이 **Suite 안에서만 존재**한다.

특징:

- 포함 subscription을 개별 구매할 수 없음
- 관련 앱 세트에 하나의 통합 서비스로 제공하기 적합

Xcode 27에서 Bundles/Suites API 테스트를 시작할 수 있으며, Apple은 프로그램의 추가 세부사항을 2026년 후반에 제공한다고 설명한다.

따라서 이 세션 시점에는 실제 배포 정책 전체가 확정됐다고 가정하기보다 **테스트 가능한 신규 모델**로 보는 것이 정확하다.

---

# 🎟️ Offer Code Redemption API 개선

Offer code는 다음 product type에 사용할 수 있다.

- consumable
- non-consumable
- auto-renewable subscription
- non-renewing subscription

기존 redemption sheet는 코드 입력 UI를 제공했지만, 새 API는 **redemption 완료 결과를 직접 반환**한다.

변경점:

- `RedeemOption` 집합 전달 가능
- 완료 시 `VerificationResult` 반환
- 성공하면 transaction 획득
- 실패하면 error 획득

SwiftUI 예제:

```swift
struct OfferCodeRedemption: View {
    @State var presentingOfferCodeSheet: Bool = false

    var body: some View {
        Button("Redeem Offer Code") {
            presentingOfferCodeSheet = true
        }
        .offerCodeRedemption(
            options: [],
            isPresented: $presentingOfferCodeSheet
        ) { result in
            switch result {
            case .success(let verificationResult):
                switch verificationResult {
                    // Verify the transaction, give the customer access to
                    // the purchased content, and then finish the transaction
                }
            case .failure(let error):
                // Handle error
            }
        }
    }
}
```

UIKit에는 `presentOfferCodeRedeemSheet` variation이 있다.

Xcode 27에서는 지원되는 모든 해당 product type에 대해 이 redemption flow를 테스트할 수 있다.

### 구현 시 중요한 점

Offer code redemption이 성공했다고 해서 검증 없이 바로 콘텐츠를 해제하면 안 된다.

기본 순서는 일반 purchase와 동일하다.

1. Redemption result 수신
2. `VerificationResult` 확인
3. transaction 검증
4. entitlement 제공
5. transaction finish

즉 offer code도 별도 우회 경로가 아니라 **일반 StoreKit verification pipeline에 들어가야 한다.**

---

# 📤 App Review 제출 경험 통합

App Store Connect의 In-App Purchase 제출 흐름도 크게 바뀐다.

기존에는 IAP/구독을 각각 별도로 다루는 작업이 많았지만, 이제 여러 review item을 하나의 submission에 묶을 수 있다.

하나의 App Review submission에 결합 가능한 항목 예:

- 여러 In-App Purchase
- subscriptions
- in-app events
- custom product pages
- product page optimizations

App Store Connect에서는 draft submission을 만든 뒤 각 IAP에서 **Add for Review**로 해당 submission에 추가한다.

대량 상품은 IAP 목록에서 여러 항목을 선택해 한 번에 동일 submission에 추가할 수 있다.

모든 review item의 상태를 중앙 App Review 화면에서 확인할 수 있어 제출 관리가 일관적이다.

---

# 🔌 App Store Connect API 변화

App Store Connect API의 `reviewSubmissions`도 확장된다.

지원 범위가 다음 resource로 확대된다.

- In-App Purchase
- subscription
- subscription group

Apple은 기존 개별 In-App Purchase/subscription/subscription group 제출 관련 resource를 향후 deprecated하고, 다음 구조로 이전하도록 안내한다.

- `reviewSubmission`
- `reviewSubmissionItems`

즉 서버 자동화나 CI에서 App Store Connect API로 IAP 제출을 관리한다면 **새 reviewSubmission 기반 interface로 마이그레이션 계획을 잡아야 한다.**

---

# 🏗️ 구현 관점에서의 데이터 모델

새 월별 약정 플랜을 기존 단순 구독 모델에 끼워 넣을 때는 다음 개념을 분리하는 것이 중요하다.

## Product

같은 subscription product.

## Billing Plan

고객이 해당 product 가격을 어떻게 지불하는지 설명.

- upfront
- monthly commitment

## Billing Period Transaction

월별 plan에서는 매달 새로운 transaction이 발생한다.

## Commitment

12개월 전체 계약 단위.

따라서 서버/앱의 모델은 단순히 `expirationDate` 하나만 보고 “연간 구독 종료일”이라고 판단하면 안 된다.

월별 약정에서는:

- transaction expiration = 현재 월 billing period의 끝
- commitment expiration = 12개월 약정의 끝

이 둘을 명확히 구분해야 한다.

---

# ⚠️ 주의할 점

## `.monthly`가 항상 존재하지 않는다

Billing metadata는 고객 storefront에서 실제로 사용할 수 있을 때만 반환된다. UI는 `.monthly`가 없을 때 기존 upfront plan으로 자연스럽게 fallback해야 한다.

## 최신 Transaction 사용

Apple은 정확한 `expirationDate`를 얻기 위해 latest transaction을 사용하라고 명시한다.

## Server와 client의 의미 일치

클라이언트 `Transaction.commitmentInfo`와 server `JWSTransaction.commitmentInfo`는 같은 commitment lifecycle을 서로 다른 계층에서 표현한다. entitlement 판단이 양쪽에서 어긋나지 않도록 같은 상태 모델을 사용하는 것이 좋다.

## Billing period와 commitment renewal 구분

월별 결제가 성공했다고 해서 전체 12개월 commitment가 새로 갱신되는 것은 아니다. `RenewalInfo`는 현재 commitment 종료 이후의 renewal preference를 표현한다.

## Offer code도 검증 필요

새 API가 transaction을 직접 돌려줘도 verification을 생략해서는 안 된다.

## Bundles/Suites는 세션 시점에 추가 정보 대기

Xcode 27에서 API를 테스트할 수 있지만 프로그램의 세부사항은 2026년 후반에 공개될 예정이라고 Apple이 명시했다.

---

# 📋 적용 체크리스트

## App Store Connect

- [ ] 기존 1년 auto-renewable subscription 목록 확인
- [ ] 월별 12개월 약정 billing plan이 적합한 상품 선정
- [ ] availability 설정
- [ ] monthly price 설정
- [ ] billing plan별 offer 구성
- [ ] Sandbox storefront별 availability 확인

## StoreKit client

- [ ] `subscription.pricingTerms` 처리
- [ ] `.billingPlanType == .monthly` 안전하게 탐색
- [ ] `billingDisplayPrice` 표시
- [ ] 전체 commitment price 표시
- [ ] purchase에 `.billingPlanType(.monthly)` 전달
- [ ] purchase result transaction verification 유지
- [ ] latest `Transaction` 사용
- [ ] `Transaction.commitmentInfo` 지원
- [ ] `RenewalInfo.renewalBillingPlanType` 지원
- [ ] `RenewalInfo.commitmentInfo` 지원
- [ ] `.manageSubscriptionsSheet` 또는 UIKit 관리 UI 연결

## StoreKit Testing

- [ ] Xcode StoreKit configuration에서 billing plan 생성
- [ ] monthly pricing 설정
- [ ] billing plan별 offer 테스트
- [ ] Transaction Manager에서 월별 transaction 확인
- [ ] Transaction inspector의 commitmentInfo 검증
- [ ] upfront ↔ monthly UI fallback 테스트

## Server

- [ ] JWSTransaction의 `billingPlanType` 파싱
- [ ] JWSTransaction `commitmentInfo` 저장/처리
- [ ] billing period number / total periods 구분
- [ ] `commitmentExpiresDate` 처리
- [ ] JWSRenewalInfo의 renewal billing plan 처리
- [ ] commitment 이후 변경 상품/plan 처리
- [ ] App Store Server Notifications V2 월별 renewal 이벤트 테스트
- [ ] Retention Messaging 연동 확인

## Offer Codes

- [ ] 새 redemption API로 call site 이전
- [ ] `RedeemOption` 필요 여부 검토
- [ ] `VerificationResult` 검증
- [ ] 성공 transaction entitlement 처리
- [ ] 실패 error UI 처리
- [ ] Xcode 27에서 각 product type 테스트

## App Review / CI

- [ ] 여러 IAP를 하나의 review submission으로 묶는 흐름 검토
- [ ] 다른 review item과의 통합 제출 검토
- [ ] App Store Connect API 자동화 확인
- [ ] 기존 IAP/subscription 제출 resource 사용 여부 조사
- [ ] `reviewSubmission` / `reviewSubmissionItems`로 마이그레이션 계획 수립

---

# 🧠 핵심 메시지

이번 In-App Purchase 업데이트의 중심은 **상품 자체와 결제 방식의 분리**다. 하나의 연간 subscription product에 upfront와 monthly commitment라는 여러 billing plan을 둘 수 있고, StoreKit은 이를 `PricingTerms`로 상품화하며 Transaction/Server API는 전체 commitment lifecycle을 별도로 추적한다.

동시에 Apple은 In-App Purchase의 주변 작업도 한 단계 통합하고 있다. Offer code redemption은 결과 검증까지 StoreKit flow 안으로 들어오고, App Review submission은 IAP와 다른 review item을 하나의 제출 단위로 관리하는 구조로 이동한다.

즉 앱에서는 **billing plan-aware merchandising과 entitlement 모델**, 서버에서는 **billing period와 commitment를 분리한 lifecycle 처리**, 운영 측면에서는 **새 reviewSubmission 기반 자동화**가 핵심 변경점이다.

---

# 🔗 함께 보면 좋은 세션과 자료

- WWDC26 — Explore Retention Messaging in App Store Connect
- WWDC24 — Implement App Store Offers
- WWDC23 — Meet StoreKit for SwiftUI
- WWDC23 — What’s new in StoreKit 2 and StoreKit Testing in Xcode
- Apple Developer — Managing the life cycle of monthly subscriptions with a 12-month commitment
- Apple Developer — Supporting monthly subscriptions with a 12-month commitment
- Apple Developer — App Store Server Notifications V2
- Apple Developer — Supporting offer codes in your app
- Apple Developer — Implementing a store in your app using the StoreKit API
