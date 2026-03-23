# WWDC25 세션 241 — What’s new in StoreKit and In-App Purchase 요약

---

<br>
## ✨ 개요

* 이번 세션은 **StoreKit과 In-App Purchase의 최신 업데이트**를 다룹니다.
* 큰 축은 세 가지입니다.
  * **StoreKit 2 핵심 모델 확장**
  * **JWS 기반 서명 요청과 App Store Server Library 활용**
  * **SwiftUI 기반 새로운 구독 머천다이징 경험**
* 특히 iOS 18.4를 중심으로 `AppTransaction`, `Transaction`, `RenewalInfo`가 확장되면서, 앱 다운로드 이력, 구독 상태, 오퍼 정보, Advanced Commerce 연동까지 더 풍부하게 다룰 수 있게 되었습니다.

<br>
## 🧾 AppTransaction 업데이트

* `AppTransaction`은 **앱 자체의 원래 구매 정보**를 나타냅니다.
* 원래도 앱 최초 구매일, 앱 버전, 프리오더 시점 같은 정보를 제공했는데, 올해 두 가지 주요 필드가 추가되었습니다.
  * `appTransactionID`
  * `originalPlatform`
* `appTransactionID`
  * iOS 18.4부터 제공되며 iOS 15까지 back deploy 됩니다.
  * 앱을 다운로드한 **Apple Account 기준의 전역 고유 값**입니다.
  * Family Sharing을 쓰는 경우에도 가족 구성원별로 고유합니다.
  * 서버 간 호출 없이도 여러 purchase 흐름을 같은 앱 다운로드 기준으로 연결하는 데 유용합니다.
* `originalPlatform`
  * 사용자가 앱을 **처음 구매한 플랫폼**을 나타냅니다.
  * iOS, macOS, tvOS, visionOS 값을 가질 수 있습니다.
  * watchOS에서 받은 앱은 iOS로 처리됩니다.
* 이 정보는 예를 들어 **유료 앱 → 무료 앱 + IAP 전환**처럼 비즈니스 모델이 바뀔 때, 기존 고객을 어떤 기준으로 entitlement 할지 정하는 데 도움이 됩니다.

<br>
## 💳 Transaction 업데이트

* `Transaction`은 **성공한 In-App Purchase 한 건**을 나타냅니다.
* StoreKit 2에서는 purchase 직후나 `Transaction.currentEntitlements` 같은 sequence를 통해 가져오더라도 항상 verification result로 감싸져 있어서, 앱이 직접 JWS 검증을 처리할 부담이 줄어듭니다.
* 올해 `Transaction`에는 세 가지 주요 확장이 추가되었습니다.
  * `appTransactionID`
  * `offerPeriod`
  * `advancedCommerceInfo`
* `appTransactionID`
  * `AppTransaction`에 들어가는 값과 동일한 앱 다운로드 기준 ID입니다.
* `offerPeriod`
  * 구독 오퍼가 적용된 경우, **사용자가 리딤한 오퍼의 기간 정보**를 나타냅니다.
* `advancedCommerceInfo`
  * **Advanced Commerce API**를 사용하는 앱에서만 의미가 있습니다.
  * 대규모 콘텐츠 카탈로그, 크리에이터 경험, optional add-on이 있는 구독처럼 복잡한 상거래 모델을 더 쉽게 표현할 수 있게 돕습니다.
* 또 하나 중요한 변경은 기존 `Transaction.currentEntitlement(for:)`가 deprecated 되고, **새로운 `Transaction.currentEntitlements(for:)` 비동기 시퀀스 API**가 권장된다는 점입니다.
* Apple이 이 API 전환을 권장하는 이유는, 한 고객이 같은 상품에 대해 **구독 + Family Sharing**처럼 여러 entitlement 경로를 동시에 가질 수 있기 때문입니다.

<br>
## 🔁 RenewalInfo 업데이트

* `RenewalInfo`는 **자동 갱신 구독 상태**를 표현하는 타입입니다.
* 이 객체에는 자동 갱신 여부, 다음 갱신일, 만료 사유 같은 정보가 들어 있어 구독 유지 전략에 매우 중요합니다.
* 예를 들어 만료 사유가 `didNotConsentToPriceIncrease`라면, 가격 인상 이후 이탈한 사용자에게 **win-back offer**를 노출하는 식의 전략을 세울 수 있습니다.
* 올해는 네 가지 필드가 강화되었습니다.
  * `appTransactionID`
  * `offerPeriod`
  * `advancedCommerceInfo`
  * `appAccountToken`
* `appAccountToken`
  * 앱이 purchase 시점에 넘긴 **서비스 계정 식별용 토큰**입니다.
  * App Store가 이 값을 RenewalInfo에 다시 실어주기 때문에, 앱 서비스 계정과 구독 상태를 더 자연스럽게 연결할 수 있습니다.
* 또한 iOS 18.4부터는 **Transaction ID 기반으로 SubscriptionStatus를 조회하는 API**도 추가되어, 특정 구독 트랜잭션을 기준으로 상태를 더 쉽게 추적할 수 있습니다.

<br>
## 🎟️ Offer Code 확장

* 기존 offer code는 주로 **auto-renewable subscription** 중심이었는데, 이제 범위가 넓어졌습니다.
* 이제 offer code는 아래 타입에도 사용할 수 있습니다.
  * consumables
  * non-consumables
  * non-renewing subscriptions
* 앱 안에서는 `offerCodeRedemption` API를 통해 리딤할 수 있고, UIKit 앱은 `presentOfferCodeRedeemSheet`를 사용할 수 있습니다.
* 지원 범위도 넓습니다.
  * 이 확장은 iOS 16.3까지 back deploy 됩니다.
  * auto-renewable subscription offer code는 더 오래된 OS에서도 지원됩니다.
* 이를 위해 `Transaction.Offer.PaymentMode`에 **`oneTime`** 이라는 새 payment mode가 추가되었습니다.
* 이 값은 구독형이 아닌 IAP offer code가 **한 번성 결제 방식으로 처리되는 경우**를 구분하는 데 중요합니다.
* 하위 OS 대응이 필요하면 `offerPaymentModeStringRepresentation`을 통해 문자열 기반으로도 접근할 수 있습니다.

<br>
## 🖼️ Purchase API와 UI Context 변화

* iOS 18.2부터는 일부 purchase API가 **구매가 시작된 UI context**를 요구합니다.
* 목적은 시스템이 payment sheet와 완료 UI를 **현재 활성 scene에서 가장 자연스러운 위치**에 표시하도록 하기 위함입니다.
* 플랫폼별로 필요한 context가 다릅니다.
  * iOS / macCatalyst / tvOS / visionOS: `UIViewController`
  * macOS: `NSWindow`
  * watchOS: 별도 context 불필요
* SwiftUI에서는 이 작업을 직접 계산하지 않고, **purchase environment value**에서 `PurchaseAction`을 받아 호출하면 됩니다.
* StoreKit views를 쓰는 경우에는 이 UI context 처리도 시스템이 자동으로 맡아줍니다.

<br>
## 🔐 JWS 기반 In-App Purchase 요청 서명

* 올해 가장 실무적인 변화 중 하나는 **JWS 기반으로 purchase 요청을 서명하는 흐름**입니다.
* 새 purchase option 두 가지가 대표적입니다.
  * `introductoryOfferEligibility`
  * `promotionalOffer`
* 둘 다 **compact JWS string**을 요구하며, iOS 15까지 back deploy 됩니다.
* Apple은 이 흐름을 쉽게 구현할 수 있도록 **App Store Server Library** 사용을 강하게 권장합니다.
* 기본 흐름은 다음과 같습니다.
  * App Store Connect에서 **In-App Purchase signing key**를 발급
  * issuer ID / key ID / signing key 확보
  * 서버에 App Store Server Library 추가
  * 서버에서 `PromotionOfferV2SignatureCreator`로 서명 생성
  * 앱은 productID, offerID 등을 서버에 보내고 compact JWS를 받아 purchase option에 사용
* Apple은 가능하면 서명 시 **Transaction ID 필드도 함께 넣는 것**을 권장합니다.
  * 이 값은 `appTransactionID`나 해당 고객의 어떤 `TransactionID`라도 사용할 수 있습니다.
* 이렇게 하면 App Store가 해당 promotional offer 또는 intro offer 요청이 **정말 앱이 승인한 요청인지** 더 신뢰성 있게 검증할 수 있습니다.

<br>
## 🛍️ 새로운 SwiftUI 뷰: SubscriptionOfferView

* 이번 세션의 UI 측 핵심은 **`SubscriptionOfferView`** 입니다.
* 이 뷰는 자동 갱신 구독을 앱 안에서 더 눈에 띄게 노출하고, 고객을 구독 스토어나 특정 플랜으로 자연스럽게 유도하기 위해 설계되었습니다.
* 선언 방식은 두 가지 축으로 볼 수 있습니다.
  * 이미 로드한 auto-renewable subscription으로 생성
  * `productID` 또는 subscription group ID로 생성
* 이 뷰는 App Store에서 메타데이터를 직접 불러오며, App Store Connect에 설정한 **subscription image**도 표시할 수 있습니다.
* 또는 custom icon / placeholder icon을 직접 넣어 브랜딩할 수도 있습니다.
* `subscriptionOfferViewDetailAction` modifier와 함께 쓰면, 단순히 한 플랜을 보여주는 수준을 넘어서 **앱 내부 구독 스토어로 보내는 진입점** 역할도 할 수 있습니다.

<br>
## 📈 구독 관계별 머천다이징 전략

* `SubscriptionOfferView`는 고객의 현재 구독 상태에 따라 어떤 플랜을 보여줄지 조절할 수 있습니다.
* 여기서 중요한 파라미터가 `visibleRelationship` 입니다.
* 관계는 다음 다섯 가지입니다.
  * `upgrade`
  * `downgrade`
  * `crossgrade`
  * `current`
  * `all`
* 예를 들면:
  * `upgrade`는 현재 플랜보다 한 단계 높은 플랜을 제안합니다.
  * `downgrade`는 더 저렴한 플랜을 보여줄 수 있어 이탈 방지에 유리합니다.
  * `crossgrade`는 같은 tier 안에서 더 나은 가치의 플랜을 선택합니다.
  * `current`는 현재 플랜 자체를 노출하며, 여기에 discount offer를 붙여 **갱신 유지**를 유도할 수 있습니다.
  * `all`은 그룹 안의 전체 플랜 가격 정보를 한 번에 보여줍니다.
* 이 전략을 잘 쓰려면 먼저 고객의 구독 상태를 제대로 알아야 합니다.
* 세션에서는 SwiftUI 앱에서 `subscriptionStatusTask`를 사용해 상태를 모델로 바꾸고, 이를 environment에 내려서 나머지 화면들이 참고하도록 구성하는 패턴을 보여줍니다.

<br>
## ✅ 정리

* 이번 StoreKit 업데이트는 단순한 문법 추가보다, **구매 데이터 모델 정교화 + 오퍼 운영 유연성 + 구독 UI 개선**에 초점이 맞춰져 있습니다.
* 핵심적으로 기억할 부분은 다음과 같습니다.
  * `AppTransaction`, `Transaction`, `RenewalInfo`에 새 필드가 추가되어 앱 다운로드와 구독 상태를 더 풍부하게 해석할 수 있습니다.
  * offer code가 consumable, non-consumable, non-renewing subscription까지 확장되었습니다.
  * JWS 기반 purchase signing과 App Store Server Library 조합이 이제 실무 표준에 가까워졌습니다.
  * `SubscriptionOfferView`로 SwiftUI 안에서 더 자연스럽고 전략적인 구독 머천다이징이 가능해졌습니다.
* 전체적으로 보면 Apple은 이번에도 **StoreKit 2 중심으로 modern purchase architecture를 강화**하고 있으며, 아직 구형 구매 흐름에 머물러 있다면 지금이 StoreKit 2 전환 시점이라는 메시지를 분명하게 주고 있습니다.
