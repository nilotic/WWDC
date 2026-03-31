# WWDC25 세션 334 — What’s new in watchOS 26 요약

<br>
## ✨ 개요

* 이번 세션은 **watchOS 26의 핵심 변화**를 한 번에 정리하는 업데이트 세션입니다.
* 큰 흐름은 네 가지입니다.
  * **새 디자인 시스템과 arm64 아키텍처 전환**
  * **Controls, Smart Stack, MapKit을 통한 경험 확장**
  * **RelevanceKit 기반의 더 맥락적인 위젯**
  * **위젯 push 업데이트 지원**
* 전체적으로는 Apple Watch 앱이 단순한 보조 앱을 넘어, **더 많은 시스템 표면에서 더 적절한 순간에 더 빠르게 동작하도록 확장된 해**라고 볼 수 있습니다.

<br>
## 🎨 새 디자인 시스템과 앱 아이콘 변화

* watchOS 26은 OS 전반에 **새 디자인 시스템**이 적용됩니다.
* materials, controls, watch face, Control Center 같은 시스템 공간의 시각 표현이 업데이트되었고, 앱도 이 스타일 변화에 함께 맞춰집니다.
* watchOS 10 이상을 대상으로 빌드된 앱은 기본적으로 새 toolbar와 control 스타일을 자동 적용받습니다.
* 따라서 대부분의 앱은 별도 작업 없이도 시스템과 더 일관된 인상을 갖게 됩니다.
* 다만 커스텀 스타일을 쓴 경우에는
  * 가독성
  * 대비
  * 새 재질감 위에서의 시각 안정성
  을 직접 점검하는 것이 중요합니다.
* 앱 아이콘도 iOS 26 / watchOS 26 디자인에 맞게 바뀌며, Apple은 **Icon Composer** 로 아이콘을 업데이트할 것을 권장합니다.
* iPhone 앱 아이콘은 Watch로 전달된 알림에서, Watch 앱 아이콘은 앱 그리드와 Watch 직접 알림에서 표시됩니다.

<br>
## 🧱 arm64 아키텍처 전환

* watchOS 26의 중요한 기반 변화 중 하나는 **새 시스템 아키텍처**입니다.
* Apple Watch Series 9 이후 모델과 Apple Watch Ultra 2는 watchOS 26에서 **arm64 아키텍처**를 사용합니다.
* Xcode에서는 Apple Watch 타깃에 **Standard Architectures** 설정을 쓰면 모든 Watch 아키텍처를 함께 빌드할 수 있습니다.
* Apple은 특히 다음 차이를 유의하라고 안내합니다.
  * `Float`
  * `Int`
  * pointer 기반 연산
* 또 simulator와 실제 기기에서 모두 테스트할 것을 권장합니다.
* Apple Silicon 기반의 Apple Watch Simulator는 항상 arm64를 사용하므로, 이미 Standard Architectures와 시뮬레이터를 써 왔다면 상당 부분 준비가 되어 있는 셈입니다.

<br>
## 🎛️ Controls가 Apple Watch로 확장

* watchOS 26부터는 **Controls** 를 Apple Watch에서도 사용할 수 있습니다.
* 사용자는 앱의 control을
  * **Control Center**
  * **Smart Stack**
  * **Apple Watch Ultra의 Action button**
  에 배치할 수 있습니다.
* Controls는 WidgetKit 기반으로 만들어지며,
  * 앱을 열지 않고 빠른 액션을 수행하거나
  * 앱의 특정 화면으로 진입하게 만드는 데 적합합니다.
* control은 symbol, title, tint color, 추가 문맥 정보를 시스템에 제공하며, 시스템은 이를 각 공간에 맞게 표시합니다.
* 흥미로운 점은 **Watch 앱이 없어도 iPhone 앱의 control을 Apple Watch 시스템 공간에 추가할 수 있다**는 점입니다.
* 이 경우 Apple Watch에서 control을 탭하면 액션은 companion iPhone에서 수행됩니다.
* 반대로 Watch 앱이 있다면 같은 API로 Watch 전용 control도 만들 수 있고, 탭 시 액션은 Watch 자체에서 실행됩니다.

<br>
## 🧭 Smart Stack에서 Controls, Widgets, Live Activities 선택 기준

* Smart Stack은 이제
  * **Controls**
  * **Widgets**
  * **Live Activities**
  를 모두 지원합니다.
* 세션은 이를 구분하는 기준을 아주 명확하게 설명합니다.
* **Control** 은 주요 목적이 “행동 수행”일 때 적합합니다.
  * 예: 설정 변경, 인터넷 연결 기기 제어
* **Widget** 은 하루 동안 계속 참고할 정보 표시용입니다.
  * 예: 날씨, 예정된 이벤트
* **Live Activity** 는 시작과 끝이 분명한 진행 상황에 적합합니다.
  * 예: 경기 진행, 항공편 상태
* 즉 같은 Smart Stack 안에서도, **무엇을 보여주려는가보다 무엇을 하게 하려는가**에 따라 적절한 surface를 골라야 한다는 점이 중요합니다.

<br>
## ⚙️ Configurable Widgets와 Configurable Controls

* watchOS 26부터는 사용자가 Apple Watch에서도 **위젯과 control을 직접 구성(configure)** 할 수 있습니다.
* 위젯 쪽에서는 recommendations를 비워 두면, 시스템이 “미리 추천된 위젯” 대신 “사용자가 직접 설정할 수 있는 위젯”으로 인식합니다.
* 기존 위젯을 유지하면서 watchOS 26 이상에서만 configurable하게 하려면 availability check를 두고, 그 버전에서만 빈 recommendations 배열을 반환하면 됩니다.
* control 쪽에서는 iOS와 동일하게
  * `AppIntentControlConfiguration`
  * `AppIntentControlValueProvider`
  를 사용해 구성 가능한 control을 만들 수 있습니다.
* 이 변화는 Apple Watch의 작은 화면에서도 사용자가 **자신에게 맞는 빠른 액션과 정보 조합을 더 직접적으로 고를 수 있게 만든다**는 점에서 의미가 큽니다.

<br>
## 🏃 운동 앱 추천과 MapKit 확장

* watchOS 26은 앱을 더 많은 시스템 위치로 가져가기 위한 기능도 강화했습니다.
* 운동 앱이 HealthKit으로 workout을 기록한다면, 사용자의 루틴에 따라 **watch face / Smart Stack에서 추천**될 수 있습니다.
* 이 추천 품질을 높이려면
  * 올바른 `HKWorkoutActivityType`
  * 정확한 시작/종료 시각
  * `HKWorkoutRouteBuilder` 를 통한 위치 데이터
  를 기록하는 것이 중요합니다.
* MapKit도 크게 강화되었습니다.
* watchOS 26에서는 Watch 앱 안에서
  * 주변 관심 장소 검색
  * driving / walking / cycling 경로 탐색
  * SwiftUI map 위에 경로 overlay 표시
  를 iOS와 익숙한 API로 구현할 수 있습니다.
* 이는 특히 **독립형 Watch 앱**이 주변 장소 탐색과 길찾기를 직접 제공할 수 있다는 점에서 실용적입니다.

<br>
## 🧠 RelevanceKit: 더 적절한 순간에 뜨는 위젯

* 이번 watchOS 26의 핵심 프레임워크 중 하나가 **RelevanceKit** 입니다.
* 목적은 단순합니다. **사람이 지금 필요로 하는 정보가 필요할 때 Smart Stack에 뜨게 하는 것**입니다.
* RelevanceKit은 다양한 relevant context를 지원합니다.
  * date
  * sleep schedule
  * fitness information
  * location
* 특히 올해는 location 쪽에서 **point-of-interest category** 를 활용할 수 있게 되어,
  특정 장소 자체가 아니라 “beach”, “cafe”, “grocery store” 같은 범주에 따라 위젯을 relevant하게 만들 수 있습니다.
* 예를 들어 해변 앱이라면 사용자가 어느 특정 해변에 있느냐가 아니라, **어떤 해변이든 해변 카테고리에 있을 때** 바다 상태 위젯을 Smart Stack에 띄우는 식이 가능합니다.

<br>
## 🃏 Relevant Widget의 개념

* watchOS 26은 Smart Stack 전용의 새로운 위젯 구성 방식인 **Relevant widget** 을 도입합니다.
* 기존 timeline widget은 하나의 시간축 위에 entry를 배열해야 하므로, 같은 시각에 여러 정보가 겹치면 한 카드에 우겨 넣어야 하는 한계가 있습니다.
* 세션 예시에서는 같은 시간대에 이벤트가 세 개 겹칠 때, 일반 timeline widget은 한 화면에 모두 담지 못해 일부를 포기해야 합니다.
* Relevant widget은 이 문제를 다르게 풉니다.
* 여러 정보가 동시에 relevant 하면, Smart Stack이 **여러 카드를 동시에 제안**할 수 있습니다.
* 즉 하나의 카드 안에서 정보를 압축하는 대신, **관련성이 높은 단위를 카드 단위로 나눠 보여주는 방식**입니다.
* 이 접근은 Apple Watch처럼 화면이 작고 순간적 glance가 중요한 환경에서 특히 잘 맞습니다.

<br>
## 🛠️ Relevant Widget 구현 구조

* timeline widget의 기본 단위가 `TimelineEntry` 라면,
  relevant widget의 기본 단위는 **`RelevanceEntry`** 입니다.
* 이를 공급하는 타입은
  * `RelevanceEntriesProvider`
  * `RelevanceConfiguration`
  입니다.
* `relevance()` 메서드에서는 어떤 configuration이 어떤 RelevantContext에서 relevant 한지를 `WidgetRelevanceAttributes` 로 정의합니다.
* 이후 system은 relevant 한 configuration을 바탕으로 `entry` 를 요청하고, 앱은 그 구성에 맞는 entry를 반환합니다.
* preview entry와 placeholder entry 개념도 유지됩니다.
  * preview는 설정 화면이나 편집 화면에 보여줄 샘플
  * placeholder는 데이터 로딩 중 또는 최신 정보가 아직 없을 때 표시할 내용
* 기존 timeline widget과 relevant widget이 동시에 같은 내용을 표시해 중복 카드가 생길 수 있는데,
  이때는 `associatedKind` modifier로 둘을 연결해 **timeline widget을 relevant widget이 대체하도록** 만들 수 있습니다.

<br>
## 👀 Relevant Widget 미리보기와 개발 흐름

* 세션은 relevant widget 개발 시 **preview** 를 적극 활용할 것을 권장합니다.
* preview 방식은 크게 세 가지입니다.
  * `relevanceEntries` 를 사용해 다양한 entry와 디스플레이 크기에서 view 레이아웃 점검
  * `relevance` 를 사용해 특정 configuration에서 entry 생성 흐름 점검
  * 실제 `RelevanceProvider` 기반 preview로 여러 이벤트와 여러 display size를 한 번에 최종 확인
* relevant 조건을 시뮬레이션하지 않아도 Smart Stack에서의 모습을 빠르게 검증할 수 있기 때문에, watchOS 특유의 작은 화면 최적화에 특히 유용합니다.

<br>
## 📲 Widget push updates

* watchOS 26부터는 **APNs를 통한 widget push update** 가 지원됩니다.
* 이 기능은 watchOS뿐 아니라, WidgetKit을 지원하는 Apple 플랫폼 전반에 적용됩니다.
* 즉 앱이 직접 열리지 않아도 서버 측 이벤트에 맞춰 위젯 데이터를 빠르게 최신 상태로 바꿀 수 있습니다.
* Apple은 특히 ClockKit complication migration을 망설였던 경우, 이제 complication push update에 대한 우려가 줄어든 만큼 **WidgetKit으로 옮길 적기**라고 강조합니다.
* 결과적으로 watchOS 26의 위젯은 relevant suggestion과 push update를 함께 통해, **더 잘 뜨고 더 빨리 갱신되는 형태**로 진화했습니다.

<br>
## ✅ 정리

* watchOS 26은 디자인, 시스템 공간, 위젯, 아키텍처까지 전반적으로 손본 업데이트입니다.
* 핵심만 다시 보면
  * 새 디자인 시스템과 Icon Composer 기반 아이콘 정비
  * Series 9 이후의 arm64 전환
  * Apple Watch용 Controls 도입
  * configurable widget / control
  * 운동 앱 추천과 MapKit 확장
  * RelevanceKit과 Relevant widget
  * APNs 기반 widget push update
  가 큰 축입니다.
* 전체적으로 보면 이번 watchOS 업데이트는
  **“Apple Watch 앱을 더 많은 표면에 노출하고, 더 적절한 순간에 띄우고, 더 최신 상태로 유지하게 만든다”** 는 방향이 아주 분명한 해라고 볼 수 있습니다.
