# WWDC25 세션 278 — What’s new in widgets 요약

<br>
## ✨ 개요

* 이번 세션은 **WidgetKit의 2025년 업데이트**를 정리하는 세션입니다.
* 큰 흐름은 네 가지입니다.
  * **iOS / macOS의 새로운 accented rendering 대응**
  * **visionOS로 확장되는 위젯 경험**
  * **watchOS Smart Stack용 relevance widgets**
  * **push notification 기반 widget 업데이트**
* 전체적으로는 위젯이 더 많은 시스템 표면으로 확장되고, 더 적절한 순간에 노출되며, 더 빠르게 최신 상태를 반영하도록 진화한 것이 핵심입니다.

<br>
## 🎨 accented rendering과 새 위젯 스타일

* iOS 26과 macOS Tahoe에서는 홈 화면, 데스크톱, 알림 센터에서 위젯이 **glass 또는 tint 기반 표현**으로 표시될 수 있습니다.
* 이 표현은 기본적으로 위젯 콘텐츠를 **accented rendering mode** 로 렌더링한 뒤, 배경을 제거하고 유리 질감이나 tint 효과를 얹는 방식입니다.
* 단순 텍스트 중심 위젯은 별도 수정 없이도 잘 동작할 수 있지만, 이미지나 그라디언트를 적극적으로 쓰는 위젯은 추가 대응이 필요할 수 있습니다.
* 세션은 특히 큰 이미지와 반투명 gradient가 있는 위젯은 accented mode에서 가독성이 떨어질 수 있다고 설명합니다.

<br>
## 🖼️ widgetAccentedRenderingMode 활용

* 이미지가 accented mode에서 어떻게 보일지 제어하려면 **`widgetAccentedRenderingMode`** modifier를 사용할 수 있습니다.
* 주요 선택지는 다음과 같습니다.
  * `nil`
  * `accented`
  * `desaturated`
  * `accentedDesaturated`
  * `fullColor`
* 일반적인 위젯 이미지에는 **`desaturated`** 또는 **`accentedDesaturated`** 가 잘 맞고,
  앨범 아트나 책 표지처럼 원색 자체가 중요한 콘텐츠에는 **`fullColor`** 가 적합합니다.
* 다만 watchOS에서는 시계 페이스와의 조화를 위해 `fullColor` 가 무시될 수 있습니다.
* 큰 레이아웃 변경이 필요할 때는 **`widgetRenderingMode` environment 값**을 읽어 accented mode일 때 다른 뷰 구성을 보여줄 수 있습니다.

<br>
## 🥽 visionOS로 확장되는 위젯

* visionOS 26부터는 **visionOS 앱도 위젯을 가질 수 있고**, 이미 호환되는 iPhone/iPad 위젯이 있다면 그것도 visionOS에서 사용할 수 있습니다.
* iOS와 macOS의 system family 크기들이 visionOS에서도 지원되며, 상호작용과 애니메이션도 유지됩니다.
* visionOS 위젯은 방 안에 배치한 뒤 표면에 **pin** 할 수 있고,
  기본적으로는 표면 위에 떠 있는 **elevated** 스타일로 보입니다.
* 또 **recessed** 스타일도 지원해, 벽이나 표면 안에 살짝 들어간 포스터 같은 느낌을 만들 수 있습니다.

<br>
## 🧱 mounting style과 texture 선택

* 위젯이 어떤 설치 스타일을 지원할지는 **`supportedMountingStyles`** modifier로 제어할 수 있습니다.
* visionOS에서는 위젯 표면 질감도 선택할 수 있습니다.
  * 기본은 **glass texture**
  * 대안으로 **paper texture**
* paper texture를 쓰면 좀 더 포스터형, 인쇄물 같은 느낌의 위젯을 만들 수 있습니다.
* 또 visionOS 전용으로 **`systemExtraLargePortrait`** family가 추가되어, 세로형 대형 위젯 구성도 가능해졌습니다.

<br>
## 🎯 levelOfDetail로 거리 기반 적응형 위젯 만들기

* visionOS 위젯의 핵심 변화 중 하나는 **거리 기반 적응형 UI**입니다.
* 공간에 고정된 위젯은 사용자가 멀리 떨어져 봐도 계속 보이기 때문에, 가까이 있을 때와 멀리 있을 때 필요한 정보 밀도가 달라집니다.
* 이를 위해 새 **`levelOfDetail` environment 값**이 추가되었습니다.
* 값은 크게 두 가지입니다.
  * `default`
  * `simplified`
* 멀리 있는 상황에서는 `simplified` 로 바뀌며,
  개발자는 이 값을 사용해
  * 더 큰 숫자 표시
  * 버튼 숨김
  * 보조 정보 제거
  같은 식으로 더 glanceable 한 UI를 만들 수 있습니다.

<br>
## ⌚ watchOS용 relevance widgets

* 세션의 두 번째 큰 축은 **watchOS Smart Stack용 relevance widgets** 입니다.
* 목적은 단순합니다. 사용자가 지금 필요한 정보가 있다면 **그 순간 Smart Stack에 더 적절하게 surfaced** 되게 만드는 것입니다.
* 기존 timeline widget은 같은 시간대에 여러 개의 중요한 정보가 겹치면 한 카드 안에 내용을 압축해야 했습니다.
* relevance widget은 이 문제를 다르게 풀어,
  relevant 한 항목이 여러 개면 **여러 카드를 각각 제안**할 수 있게 합니다.
* 즉 작은 화면에서 억지로 정보를 합치는 대신, **관련성이 높은 단위를 카드 단위로 분리**하는 방식입니다.

<br>
## 🧠 RelevanceKit 기반 문맥 판단

* relevance widget은 **RelevanceKit** 과 연결되어 작동합니다.
* 시스템은 다양한 relevant context를 기준으로 어떤 위젯이 지금 중요한지 판단할 수 있습니다.
* 예를 들어
  * 날짜
  * 위치
  * 수면 스케줄
  * 피트니스 정보
  같은 문맥을 활용할 수 있습니다.
* 올해는 특히 **point-of-interest category** 기반 relevance가 강조됩니다.
* 즉 특정 고정 좌표가 아니라, “카페”, “해변”, “식료품점” 같은 카테고리 수준으로 문맥을 줄 수 있어, 실제 생활 패턴과 더 잘 맞는 relevance 구성이 가능해졌습니다.

<br>
## 🛠️ relevance widget 구현 구조

* relevance widget의 기본 데이터 단위는 **`RelevanceEntry`** 입니다.
* 이를 공급하는 쪽에서는
  * `RelevanceEntriesProvider`
  * `RelevanceConfiguration`
  를 사용합니다.
* `relevance()` 에서는 어떤 configuration이 어떤 문맥에서 relevant 한지를 정의하고,
  시스템은 그 결과에 따라 실제 entry를 요청합니다.
* preview entry와 placeholder entry 개념도 유지되므로, 설정 화면과 로딩 상태 대응도 기존 WidgetKit 흐름과 자연스럽게 이어집니다.
* 기존 timeline widget과 함께 쓸 때는 **`associatedKind`** 로 연결해, relevance widget이 있을 때 일반 timeline 카드가 중복 노출되지 않도록 정리할 수 있습니다.

<br>
## 🚗 widgets, controls, Live Activities가 더 많은 곳으로

* 세션은 위젯뿐 아니라 **Live Activities와 controls도 더 많은 위치로 확장**된다고 설명합니다.
* 위젯은 visionOS로 확장되고,
  관련 세션과 리소스를 통해 **CarPlay에서도 앱 경험을 더 풍부하게 확장**할 수 있는 흐름이 함께 소개됩니다.
* 즉 WidgetKit은 더 이상 홈 화면용 보조 UI가 아니라, **여러 플랫폼의 시스템 표면을 연결하는 공통 계층**으로 커지고 있습니다.

<br>
## 📲 push notifications로 위젯 업데이트

* 마지막 큰 변화는 **widget push update** 입니다.
* 이제 APNs를 통해 위젯을 **서버 이벤트 기반으로 더 빠르게 갱신**할 수 있습니다.
* 앱이 직접 열리지 않아도, 서버가 새로운 상태를 푸시하면 WidgetKit이 더 신속하게 최신 정보를 반영할 수 있습니다.
* 이는 일정, 스포츠, 배송, 상태 추적처럼 **시간 민감성이 높은 위젯**에 특히 중요합니다.
* 세션은 이 기능이 watchOS를 포함한 Apple 플랫폼 전반의 WidgetKit 경험을 더 실시간에 가깝게 만든다고 강조합니다.

<br>
## ✅ 정리

* 올해 widgets 업데이트는 디자인 적응, 플랫폼 확장, relevance, 실시간성이라는 네 축으로 정리할 수 있습니다.
* 핵심만 다시 보면
  * accented rendering 대응과 이미지 표시 제어
  * visionOS의 mounting style / texture / levelOfDetail
  * watchOS Smart Stack용 relevance widgets
  * APNs 기반 widget push update
  가 큰 축입니다.
* 전체적으로 보면 이번 변화는
  **“위젯을 더 많은 장소에 배치하고, 더 적절한 순간에 띄우고, 더 빠르게 최신 상태로 유지하게 만드는 진화”** 라고 볼 수 있습니다.