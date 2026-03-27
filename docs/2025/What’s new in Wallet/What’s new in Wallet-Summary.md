# WWDC25 세션 202 — What’s new in Wallet 요약

<br>
## ✨ 개요

* 이번 세션은 **Wallet의 2025년 주요 업데이트**를 다룹니다.
* 큰 흐름은 세 가지입니다.
  * **이벤트 티켓의 Upcoming Events 지원**
  * **항공권(Boarding Pass)의 대규모 업그레이드**
  * **앱에서 패스를 자동 추가할 수 있는 새 PKPassLibrary API**
* 전체적으로는 Wallet 패스가 단순 저장 수단을 넘어, **상황에 따라 자동 업데이트되고 더 풍부한 시스템 경험과 연결되는 방향**으로 확장된 것이 핵심입니다.

<br>
## 🎟️ 이벤트 티켓: Upcoming Events 지원

* 작년 iOS 18에서 Poster Event Ticket과 semantic tag 기반 이벤트 경험이 도입되었고, 올해는 여기에 **Upcoming Events** 가 추가되었습니다.
* 이제 하나의 티켓으로 연결된 여러 이벤트를 Wallet 안에서 쉽게 보여줄 수 있습니다.
* 사용자가 upcoming event를 탭하면, 해당 이벤트만을 위한 **별도 상세 화면**이 열립니다.
* 이 화면은 Poster Event Ticket과 비슷한 구조를 가지며,
  * 이벤트용 아트워크
  * 장소 정보
  * Event Guide
  * 해당 이벤트 전용 세부 정보
  를 담을 수 있습니다.

<br>
## 🧩 pass.json에서 Upcoming Events 구성

* Upcoming event는 `pass.json` 안의 새 **`upcomingPassInformation` 배열**로 정의합니다.
* 각 항목에는 기본적으로 다음 정보가 들어갑니다.
  * `type = event`
  * 고유 식별자
  * 이벤트 표시 이름
  * 이벤트 날짜
* 이 객체는 사실상 Poster Event Ticket과 같은 구조를 재사용합니다.
* 따라서 event별로
  * `semantics`
  * `additionalInfoFields`
  * `backFields`
  * `URLs`
  * `images`
  를 각각 넣어 세부 구성을 할 수 있습니다.
* 중요한 점은 **패스 본문과 upcoming event가 자동으로 값을 공유하지는 않는다는 것**입니다.
* 예를 들어 pass event guide에 넣은 URL을 upcoming event guide에도 보여주고 싶다면, **같은 값을 upcoming event 쪽에도 다시 넣어야 합니다.**

<br>
## 🖼️ Upcoming Event의 이미지와 장소 정보

* Upcoming event 화면 상단에는 이벤트를 대표하는 **header image** 가 표시됩니다.
* 기본적으로는 pass의 background image를 사용하지만, event별로 별도 `headerImage` URL을 지정할 수 있습니다.
* iPhone과 Apple Watch 등 여러 기기에서 보이므로, 해상도별 이미지를 제공하는 것이 좋습니다.
* 장소 정보는 semantics 안의
  * `venueName`
  * `venuePlaceID`
  * `venueLocation`
  으로 구성합니다.
* 좌석 정보처럼 중요한 일부 semantics는 상세 화면에 바로 강조되어 보이고, 그 외 정보는 주로 Event Guide 쪽에 반영됩니다.

<br>
## 🗺️ Event Guide와 URL 구성

* Upcoming event guide는 pass의 event guide와 유사하지만, **그 이벤트 전용 데이터**로 따로 구성됩니다.
* 여기에는
  * 빠른 액션 버튼
  * 날씨 타일
  * venue map
  * 기타 이벤트 관련 semantics
  를 넣을 수 있습니다.
* `URLs` 객체로는 그 이벤트에 대해 보여줄 액션을 지정합니다.
* venue map도 URL 기반으로 별도 구성할 수 있으며, 기존 pass의 venue map을 재사용하려면 **`reuseExisting = true`** 를 명시해야 합니다.
* URL도 없고 `reuseExisting` 도 설정하지 않으면, Wallet은 해당 upcoming event에 venue map을 표시하지 않습니다.

<br>
## 🔄 Upcoming Event 운영 팁

* 모든 upcoming event를 처음부터 한 번에 넣을 필요는 없습니다.
* 시간이 지나며 새 이벤트가 생기면 **pass update** 로 추가할 수 있습니다.
* `isActive` 속성은 해당 이벤트가 현재 사용자에게 relevant 한지를 Wallet에 알려주는 역할을 합니다.
* 따라서 이벤트 시작과 종료 시점에 맞춰 `isActive` 값을 잘 업데이트해야 합니다.
* 취소되었거나 더 이상 의미 없는 이벤트는 `pass.json` 에서 제거하는 것이 좋습니다.
* 핵심은 upcoming event 목록이 항상 **짧고, 정확하고, 현재 유효한 정보만 담도록 관리하는 것**입니다.

<br>
## ✈️ 업그레이드된 Boarding Pass

* 올해 Wallet boarding pass는 **디자인과 기능 모두 대폭 업그레이드**되었습니다.
* 새 boarding pass는 더 동적이고 설정 가능성이 높아졌으며, Apple의 **flight service** 와 통합됩니다.
* 이 통합 덕분에 항공편의 지연이나 게이트 변경이 생겨도, 개발자가 매번 수동으로 pass update를 보내지 않아도 **Wallet이 자동으로 최신 상태를 반영**할 수 있습니다.
* 또 새로운 **Live Activity** 가 추가되어, 사용자가 잠금 화면이나 다른 시스템 표면에서도 핵심 비행 정보를 쉽게 확인할 수 있습니다.
* 이 Live Activity는 Messages를 통해 공유할 수도 있어, 가족이나 지인이 자신의 기기에서 비행 상황을 볼 수 있습니다.

<br>
## 🛫 항공편 추적과 semantics의 역할

* 업그레이드된 boarding pass는 패스가 추가되는 순간부터 항공편을 추적합니다.
* 이를 위해 Wallet은 `pass.json` 의 semantics에서 다음 값을 읽습니다.
  * `airlineCode`
  * `flightNumber`
  * `originalDepartureDate`
* Wallet은 이 정보로 Apple flight service에서 해당 항공편을 찾고, 이후 상태 변화를 pass와 live activity 모두에 반영합니다.
* 공동 운항편(code share)이라면 일반적으로 marketing airline 기준 코드를 넣는 것이 흔하지만, operating flight number를 넣는 것도 가능합니다.
* 어느 쪽이든 flight service가 올바른 편을 찾을 수 있으면 됩니다.

<br>
## 🕒 출발 시간, 도착 시간, 탑승 시간 처리

* Wallet은 boarding pass 상단과 주요 영역에서 항공편 번호, 출발일, 도시, 공항 코드, gate time 등을 표시합니다.
* 여기서 중요한 점은 semantics가 **단순 표시값이 아니라 Wallet이 비행 맥락을 이해하는 재료**라는 것입니다.
* 출발/도착 시간 semantics는 gate time을 기준으로 넣어야 하고,
  탑승 시간은 별도의 prominent field로 표시되며
  * `originalBoardingDate`
  * `currentBoardingDate`
  semantics를 사용합니다.
* Wallet은 boarding time과 departure time의 차이를 이용해 **boarding duration** 을 계산합니다.
* 그래서 항공편이 예를 들어 3시간 지연되면, Wallet은 그 차이를 유지해 boarding time도 자동으로 뒤로 밀어줍니다.
* 개발자가 새 `currentBoardingDate` 를 보내면, Wallet은 boarding duration을 다시 계산해 필요한 경우 탑승 시간도 재조정합니다.
* 반면 `originalDepartureDate` 와 `originalArrivalDate` 는 **공식적인 스케줄 재조정이 아닌 한 바꾸지 않는 것**이 중요합니다.

<br>
## 🧭 추가 시스템 통합

* 업그레이드된 boarding pass는 단순한 비행 정보 표시를 넘어 더 많은 시스템 기능과 연결됩니다.
* 예를 들어
  * Maps를 통한 공항 길찾기
  * Find My를 통한 수하물 추적
  * 항공사 서비스와 업그레이드 정보
  같은 요소가 포함됩니다.
* 항공사 서비스 영역에서는 승객이 여정 중 할 수 있는 액션과 그와 관련된 요약 정보를 함께 보여줄 수 있습니다.
* 즉 boarding pass가 단순 QR 코드 보관용이 아니라, **여행 흐름 전체를 안내하는 인터페이스**로 바뀌는 방향입니다.

<br>
## ➕ 패스 자동 추가 API

* 세션 마지막 업데이트는 **새 PKPassLibrary API** 입니다.
* 이 API를 사용하면 iOS 앱이 사용자의 **일회성 승인(one-time authorization)** 후에 패스를 Wallet에 자동으로 추가할 수 있습니다.
* 즉 매번 사용자가 직접 Wallet 추가 플로우를 반복하지 않아도 되는 시나리오를 만들 수 있습니다.
* 이는 앱과 Wallet 사이 연결을 더 자연스럽게 만들고, 특히 반복적으로 패스를 발급하는 서비스에서 UX를 크게 개선할 수 있습니다.

<br>
## ✅ 정리

* 올해 Wallet 업데이트는 이벤트 티켓과 boarding pass를 모두 **더 맥락적이고 동적인 경험**으로 확장한 것이 핵심입니다.
* 이벤트 티켓에서는
  * `upcomingPassInformation`
  * event별 semantics / URLs / images
  * `isActive` 기반 운영
  이 중요합니다.
* boarding pass에서는
  * Apple flight service 연동
  * 자동 업데이트
  * Live Activity
  * Maps / Find My / 항공사 서비스 통합
  이 핵심 축입니다.
* 여기에 새 PKPassLibrary API까지 더해지면서, Wallet은 올해 한층 더 **앱과 시스템을 잇는 실시간 패스 플랫폼**에 가까워졌다고 볼 수 있습니다.
