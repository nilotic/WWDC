# WWDC25 세션 221 — What’s new in AdAttributionKit 요약

---

<br>

## ✨ 개요

* 이번 세션은 **AdAttributionKit의 2025년 업데이트**를 다룹니다.
* 핵심은 네 가지입니다.
  * **겹치는 re-engagement conversion 측정**
  * **attribution rule 커스터마이징**
  * **postback에 country code 추가**
  * **iOS Settings 기반 테스트 기능 강화**
* Apple은 이 기능들을 통해, **개인정보 보호를 유지하면서도** 광고 성과 측정과 운영 최적화를 더 정교하게 할 수 있도록 확장했습니다.

<br>

## 🔖 겹치는 Re-engagement Conversion 측정

* iOS 18.3까지는 앱에서 **동시에 하나의 re-engagement conversion만 활성 상태**로 가질 수 있었습니다.
* **iOS 18.4부터는 여러 개의 re-engagement conversion window가 동시에 활성화**될 수 있습니다.
* 이를 위해 새로 **conversion tag** 개념이 추가되었습니다.
  * conversion tag는 특정 conversion을 가리키는 일종의 북마크입니다.
  * re-engagement가 발생하면 AdAttributionKit이 앱으로 전달하는 URL에 이 tag가 함께 붙습니다.
  * 앱은 URL query parameter에서 tag를 추출한 뒤, 나중에 특정 conversion에 대해 직접 `updateConversionValue`를 호출할 수 있습니다.
* Apple은 이 tag를 **로컬 또는 서버에 저장**하고, 어떤 캠페인/딥링크/유저 액션이 어떤 conversion과 연결되는지 추적하는 방식을 권장합니다.
* 이 기능을 쓰려면 `Info.plist`에 **`EligibleForAdAttributionKitOverlappingConversions = YES`** 를 설정해 opt-in 해야 합니다. 그렇지 않으면 예전처럼 overlapping conversion이 lock되는 동작을 유지합니다.

<br>

## ⚙️ Attribution Rule 커스터마이징

* 이번 업데이트로 광고주는 `Info.plist`에서 **attribution flow 자체를 조정**할 수 있습니다.
* 첫 번째는 **configurable attribution window** 입니다.
  * install ad에 대해 ad network별, interaction type별(click / view)로 attribution window를 지정할 수 있습니다.
  * 예를 들어 어떤 네트워크는 click 2일, view 1일처럼 세밀하게 다르게 줄 수 있습니다.
  * `global` 설정으로 공통 기본값을 두고, 특정 ad network 설정으로 override할 수도 있습니다.
  * `ignoreInteractionType`을 통해 특정 네트워크에서는 click 또는 view를 아예 attribution 경쟁에서 제외할 수도 있습니다.
  * 이 개념은 **install ads에만 적용**되고, re-engagement ads에는 적용되지 않습니다.
* 두 번째는 **configurable attribution cooldown** 입니다.
  * conversion 직후 일정 시간 동안 다른 conversion이 attribution되지 않도록 막아, 측정값이 잘못된 conversion으로 들어가는 문제를 줄입니다.
  * 예를 들어 install 직후 곧바로 re-engagement가 발생하면, 원래 install에 귀속되어야 할 In-App Purchase가 re-engagement로 가버릴 수 있는데, cooldown이 이런 상황을 완화합니다.
  * cooldown도 conversion type별로 설정할 수 있으며, 세션 예시는 **install 6시간 / re-engagement 1시간** 입니다.
* 중요한 점은, 이런 설정을 추가해도 **impression/postback의 JWS 포맷 자체는 유지**된다는 점입니다.

<br>

## 🌍 Postback의 Geography Data

* 새 버전에서는 postback에 **`country-code` 필드**가 추가됩니다.
* App Store 설치의 경우 이 값은 **사용자 Account Settings의 storefront 국가**를 기반으로 정해집니다.
* re-engagement conversion은 **최초 설치 시점의 위치 정보**를 그대로 사용합니다.
* alternative app marketplace도 install verification token에 **country code를 포함**할 수 있고, Apple이 이를 검증한 뒤 postback에 반영합니다.
* 다만 이 필드는 항상 오는 것은 아닙니다.
  * country code는 **crowd anonymity 조건을 만족할 때만** postback에 포함됩니다.
  * Apple은 이 country code 노출 조건이 기존 anonymity tier 위에 추가되는 보너스 tier라고 설명하며, 이로 인해 **기존에 받던 데이터를 잃는 일은 없다**고 안내합니다.
* 즉 이제 광고주/네트워크는 source identifier에 과도하게 의존하지 않고도, **국가별 캠페인 성과를 더 직접적으로 해석**할 수 있게 됩니다.

<br>

## 🧪 AdAttributionKit 테스트 기능 강화

* **iOS 18.4부터는 Settings 앱 안에서 development postback을 직접 생성**할 수 있습니다.
* 기존처럼 반드시 publisher app에서 광고를 노출하고 install / re-engagement flow를 끝까지 재현하지 않아도, 테스트를 훨씬 빠르게 돌릴 수 있습니다.
* 개발 흐름은 대략 다음과 같습니다.
  * 기기에서 **Developer Mode 활성화**
  * Settings > Developer > **Ad Attribution Testing** 이동
  * 새로 추가된 **Development Postbacks** 화면에서 bundle identifier 입력
  * postback destination URL, conversion type, country code, granularity 등을 설정
  * 생성한 뒤 앱에서 `updateConversionValue(_:)` 호출
  * conversion window 종료 후 자동 전송 또는 수동 transmit
* 이 기능으로
  * Xcode 실행 앱이나 ad-hoc 배포 앱도 테스트할 수 있고,
  * 서버가 다양한 data tier의 postback을 제대로 처리하는지도 검증할 수 있습니다.
* 개발용 postback은 production과 몇 가지 차이가 있습니다.
  * **새로운 signing key**를 사용합니다.
  * `ad-network-identifier`는 항상 **`development.adattributionkit`** 으로 들어갑니다.
  * 테스트 방식에 따라 `advertised-item-identifier`가 `0`일 수도 있습니다.

<br>

## ✅ 정리

* 이번 AdAttributionKit 업데이트는 단순한 API 추가가 아니라, **측정 정확도·운영 유연성·테스트 생산성**을 함께 끌어올리는 변화입니다.
* 앱 개발자 입장에서는
  * overlapping re-engagement를 conversion tag로 더 정밀하게 측정할 수 있고,
  * attribution window / cooldown을 비즈니스 모델에 맞게 조정할 수 있으며,
  * country code가 포함된 postback으로 지역별 성과 해석도 강화할 수 있습니다.
* 특히 Settings 기반 development postback은 실제 운영 전 단계에서 서버와 앱 로직을 더 빨리 검증할 수 있게 해주기 때문에, 실무적으로 꽤 큰 개선입니다.
* Apple은 마지막에 **SKAdNetwork를 사용 중이라면 AdAttributionKit으로 마이그레이션할 좋은 시점**이라고도 언급했습니다.
