# WWDC25 세션 201 — What’s new in Apple Pay 요약

---

<br>

## ✨ 개요

* 이번 세션은 **Apple Pay, Wallet 주문 추적, FinanceKit**의 2025년 업데이트를 함께 다룹니다.
* 큰 흐름은 세 가지입니다.
  * **Apple Pay 결제 경험 개선**
  * **Wallet의 주문 추적 자동화**
  * **FinanceKit의 영국 확장 + 백그라운드 전달 지원**
* 단순히 UI가 바뀐 수준이 아니라, **상거래 경험 전체를 더 매끄럽게 만들고**, 결제 이후의 주문 관리와 금융 데이터 활용까지 확장하는 방향의 업데이트입니다.

<br>

## 💳 Apple Pay 결제 경험 개선

* 가장 눈에 띄는 변화는 **Apple Pay 버튼이 동적으로 바뀐 것**입니다.
* 이제 상황에 따라 사용자의 **기본 결제 수단과 카드 아트**가 버튼에 반영되어, 더 빠르게 결제로 진입할 수 있습니다.
* 이 경험을 잘 살리려면 결제 요청에 아래 정보를 정확히 넣는 것이 중요합니다.
  * `Merchant Category Code`
  * `supportedNetworks`
  * `merchantCapabilities`
* 특히 **Merchant Category Code**는 어떤 업종의 거래인지 나타내므로,
  사용자가 결제 전에 어떤 카드가 적합한지 더 잘 이해하도록 돕고,
  지원되지 않는 카드로 인한 실패 가능성도 줄여줍니다.
* Apple은 가능하면 **결제 요청을 만들 때 항상 MCC를 함께 제공**하길 권장합니다.
* SwiftUI와 UIKit 앱은 이 새로운 버튼 스타일을 **기본적으로 자동 적용**받습니다.
* 다만 예전 스타일을 유지하고 싶다면 `payWithApplePayButtonDisableCardArt` modifier로 기존 표현을 강제할 수 있습니다.
* 중요한 점은, 버튼이 더 풍부해졌더라도 **앱이 카드 정보나 카드 아트 데이터 자체에 접근하는 것은 여전히 불가능**하다는 점입니다.

<br>

## 🧾 Preauthorized Payments와 Merchant Branding 강화

* 이번 업데이트에서는 **preauthorized payments** 경험이 크게 강화되었습니다.
* 사용자는 Wallet 안에서 **자신의 선승인 결제들을 한 곳에서 모아 보고**, 곧 청구될 결제에 대한 알림도 받을 수 있습니다.
* 그리고 이제 merchant는 단순한 이름 표시를 넘어,
  **아이콘, 커스텀 merchant 이름, 설명, 이미지, 결제별 상세 정보**를 제공할 수 있습니다.
* 이 덕분에 사용자는 “이 결제가 어떤 브랜드의 어떤 구독/정기 결제인지”를 훨씬 명확하게 이해할 수 있습니다.
* Apple은 이 브랜딩 정보를 **Apple Business Connect**와 연결해 관리할 수 있게 했습니다.
  * 로고
  * 상호명
  * 이메일 주소
  * 기타 브랜드 정보
* 즉 Maps, Mail, Wallet 등 Apple 시스템 전반에서 **일관된 브랜드 표현**을 가져갈 수 있습니다.

<br>

## 🔐 Merchant Token 기반 구현 방식

* preauthorized payments의 기반은 **merchant tokens** 입니다.
* 이 기능은 iOS 16부터 제공되었고, 이번에는 그 위에 **더 풍부한 merchant 정보 제공 흐름**이 추가된 형태입니다.
* 구현 흐름은 대략 다음과 같습니다.
  * merchant public/private key pair 생성 및 보관
  * Apple Pay 서버에서 Merchant Token Public Key 조회
  * HPKE auth mode로 파생 키 생성
  * 인증 토큰과 web service URL을 암호화해 metadata 구성
  * Apple Pay 서버로 availability notification 전송
  * 이후 사용자 기기가 merchant 서버의 endpoint에 접근해 usage information bundle 수신
* 이 bundle은 보통 zip 형태이며 다음과 같은 요소를 담습니다.
  * usage information JSON
  * merchant logo
  * product images
  * optional localization 정보
* 세션에서 강조한 핵심은,
  이 정보가 없으면 사용자는 결제 네트워크가 주는 기본 merchant 이름만 보게 되지만,
  bundle을 제공하면 Wallet 안에서 훨씬 풍부한 브랜드 경험을 줄 수 있다는 점입니다.
* 또한 이 merchant token 정보는 **종단 간 암호화**되며,
  Apple조차도 preauthorized payment의 상세 내용을 볼 수 없도록 설계되어 있습니다.

<br>

## 📦 Wallet 주문 추적의 자동화

* 주문 추적도 크게 진화했습니다.
* 기존에는 다음과 같은 방식으로 주문 정보를 Wallet에 넣을 수 있었습니다.
  * Apple Pay flow 안에서 제공
  * 이메일 첨부 order bundle 제공
  * 앱 안의 “Add Order to Wallet” 버튼 제공
* 이제 여기에 **Automatic Order Tracking**이 추가됩니다.
* 이 기능은 **Apple Intelligence**를 활용해 Mail 앱 안의 주문 관련 이메일을 감지하고,
  이를 안전하고 프라이빗하게 Wallet 주문으로 변환합니다.
* 결과적으로 사용자는 여러 상점의 주문을 **Wallet 한 곳에서 통합 관리**할 수 있게 됩니다.
* 배송사에서 온 관련 이메일도 연결되어,
  주문 상태와 배송 추적이 더 자연스럽게 이어집니다.

<br>

## ✉️ 자동 주문 추적을 잘 동작시키는 방법

* 이 자동 추적이 잘 작동하려면, merchant가 보내는 이메일에 **핵심 주문 정보가 명확히 포함**되어 있어야 합니다.
* Apple이 권장한 주요 항목은 다음과 같습니다.
  * 이메일 본문 안의 merchant name
  * 모든 이메일에 포함된 order number
  * carrier 이메일 연결을 위한 tracking number
* 또한 실제 이메일로 ingestion 흐름을 테스트해,
  Wallet 안에서 올바른 값으로 들어오는지 검증하는 것이 중요합니다.
* 브랜딩 측면에서는 여기서도 **Apple Business Connect**가 중요합니다.
  * 이메일 주문 전반에 동일한 merchant name / logo 반영 가능
  * 주문 확인 등에 사용하는 이메일 주소를 등록해 신뢰성과 일관성을 높일 수 있음
* 이메일만으로 표현하기 어려운 상세 정보가 있다면,
  여전히 **order bundle 첨부**나 `webServiceURL` 기반 주문 추적을 병행할 수 있습니다.
* 이렇게 하면 이메일 기반 자동 추적보다 더 풍부한 기능,
  예를 들어 **추가 주문 정보, 통합 영수증, 반품 처리, 앱 열기 유도** 같은 경험도 제공할 수 있습니다.

<br>

## 🌍 FinanceKit의 영국 지원 확대

* FinanceKit도 중요한 확장이 있었습니다.
* 원래 FinanceKit은 iOS 17.4부터 Apple Card, Apple Cash 중심으로 활용되었고,
  영국에서는 Connected Cards가 Open Banking Standard 기반으로 제공되고 있었습니다.
* 올해는 이 흐름이 합쳐지면서, **FinanceKit API 자체가 영국에서도 사용 가능**해졌습니다.
* 즉 금융 관리 앱 개발자는 이제 영국 시장에서도,
  기기 안에 저장된 **계정, 잔액, 거래 내역** 데이터를 활용하는 기능을 만들 수 있습니다.
* 이 확장에서도 Apple은 기존과 동일하게,
  **사용자가 어떤 앱에 어떤 데이터 범위까지 허용할지 직접 제어**한다는 점을 강조했습니다.

<br>

## 🔄 FinanceKit Background Delivery Extension

* 가장 실무적인 변화 중 하나는 **FinanceKit background delivery extension** 입니다.
* 이제 앱이 실행 중이 아니어도,
  finance store의 데이터가 바뀌면 extension이 호출되어 필요한 처리를 수행할 수 있습니다.
* 활용 예시는 다음과 같습니다.
  * 위젯 실시간 업데이트
  * 주간 지출 요약 생성
  * 온디바이스 리포트 생성
  * 앱을 열지 않아도 최신 금융 상태 반영
* 세션 예제에서는 spending tracker 앱에 widget을 붙이고,
  거래 내역이 바뀌면 background delivery extension이 합계를 다시 계산해 저장한 뒤,
  widget을 갱신하는 흐름을 보여줬습니다.
* 이 구조를 쓰면 위젯 업데이트가 더 이상 메인 앱 실행에 의존하지 않게 됩니다.

<br>

## 🧩 Extension API 핵심 포인트

* background delivery extension은 두 가지 핵심 진입점을 가집니다.
  * `didReceiveData`
  * `willTerminate`
* `didReceiveData`는 어떤 종류의 데이터가 변경되었는지 나타내는 `BackgroundDataType` 배열을 받습니다.
* 여기서 다루는 타입은 FinanceKit의 queryable data type과 직접 대응합니다.
  * Accounts
  * AccountBalances
  * Transactions
* extension은 제한된 실행 시간 안에서 동작해야 하므로,
  `didReceiveData` 안에서는 필요한 작업만 빠르게 수행하고 종료해야 합니다.
* `willTerminate`는 시간이 끝나기 직전에 호출되며,
  진행 중인 계산이나 저장을 **안전하게 마무리**하는 용도로 사용합니다.
* 작은 예제에서는 단순 저장 정도로 끝나지만,
  대량 데이터를 처리하는 앱이라면 이 종료 훅이 데이터 유실 방지에 매우 중요합니다.

<br>

## ⏱️ Background Delivery 주기 설정

* 앱은 FinanceStore에 대해
  **어떤 데이터 타입을 어떤 주기로 받고 싶은지 등록**해야 합니다.
* 지원되는 갱신 주기는 세 가지입니다.
  * `hourly`
  * `daily`
  * `weekly`
* 이 값은 “정확히 그 주기마다 실행”을 뜻하기보다,
  **다음 extension 실행까지의 최소 간격**에 가깝습니다.
* 예를 들어 hourly를 선택하면,
  데이터가 바뀐 직후 한 번 호출될 수 있지만,
  같은 한 시간 안에 다시 데이터가 바뀌어도 재호출은 지연될 수 있습니다.
* 반대로 더 긴 주기를 선택하면,
  extension이 한 번 실행될 때 **더 긴 처리 시간 창**을 받을 수 있습니다.
* 따라서
  * 빠른 잔액/거래 반영이 중요한 경우에는 짧은 주기
  * 초기 히스토리 계산처럼 무거운 작업에는 긴 주기
  를 섞어서 설계하는 것이 좋습니다.
* 세션 예제도 이 패턴을 보여줍니다.
  * Transactions: hourly
  * Accounts: daily
* 이렇게 하면 새 거래는 자주 반영하고,
  계정 추가 같은 더 무거운 흐름은 더 긴 시간 창에서 처리할 수 있습니다.

<br>

## 🛠️ 앱 구성 시 필요한 설정

* FinanceKit background delivery를 쓰려면 앱 쪽 준비도 필요합니다.
* 핵심은 다음과 같습니다.
  * 사용자에게 FinanceKit 접근 권한 요청
  * app과 extension 모두에 **Financial Data entitlement** 추가
  * 앱 카테고리를 **Finance**로 설정
  * widget과 데이터 저장소를 app group 기반으로 구성
* 세션에서는 once-only authorization 개념도 강조했습니다.
* 메인 앱에서 받은 권한은 extension이 이어받기 때문에,
  authorization 흐름을 중복으로 만들 필요는 없습니다.

<br>

## ✅ 정리

* 이번 Apple Pay 세션은 단순 결제 API 소개를 넘어,
  **구매 전, 결제 중, 결제 후, 그리고 금융 데이터 활용까지** 전체 상거래 흐름을 넓게 다뤘습니다.
* Apple Pay 쪽에서는
  * dynamic button으로 결제 진입 경험을 개선했고,
  * preauthorized payments에서 merchant branding을 크게 강화했습니다.
* Wallet 쪽에서는
  * Apple Intelligence 기반 automatic order tracking으로
    이메일 중심의 주문 경험을 Wallet 안으로 자연스럽게 끌어왔습니다.
* FinanceKit 쪽에서는
  * 영국 시장 확장,
  * background delivery extension,
  * widget 연동 같은 실전 활용 패턴이 핵심이었습니다.
* 특히 실무적으로는,
  **Apple Business Connect 등록**,
  **merchant token usage information bundle 설계**,
  **주문 이메일 포맷 정비**,
  **FinanceKit background delivery 주기 설계**
  이 네 가지가 바로 적용 포인트로 보입니다.
