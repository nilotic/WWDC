# WWDC26 Live Activities essentials 요약

- Session: 223
- Title: Live Activities essentials
- Source: https://developer.apple.com/videos/play/wwdc2026/223/
- Topic: ActivityKit, WidgetKit, Live Activities, Dynamic Island, StandBy, Apple Watch, CarPlay, App Intents, Push Notifications
- Chapters: Introduction, Create and update, Optimize

---

## 한 줄 요약

Live Activities는 **`ActivityAttributes`에 변하지 않는 정적 데이터, `ContentState`에 시간에 따라 바뀌는 동적 데이터를 분리**하고, WidgetKit의 `ActivityConfiguration`으로 Lock Screen·Dynamic Island를 구성한 뒤 ActivityKit 또는 push notification으로 상태를 업데이트하는 구조이며, iOS 27에서는 landscape Dynamic Island의 제한된 폭, StandBy의 배경 처리, Apple Watch·CarPlay의 `.small` family, `LiveActivityIntent` 기반 인터랙션까지 각 presentation별 최적화가 중요하다.

---

## 핵심 요약

이번 세션은 커피 주문 앱을 예제로 Live Activity를 처음부터 끝까지 구현한다.

전체 흐름은 다음과 같다.

```text
Design
  ↓
Data Model
ActivityAttributes + ContentState
  ↓
WidgetKit UI
Lock Screen + Dynamic Island
  ↓
Start / Update
ActivityKit or Push
  ↓
Optimize
Landscape / StandBy / Watch / CarPlay
  ↓
Interactivity
LiveActivityIntent
```

핵심 포인트:

- Live Activities는 진행 중인 작업이나 이벤트의 상태를 **timely, glanceable**하게 보여주는 기능
- iOS 27에서는 Dynamic Island가 portrait뿐 아니라 landscape에서도 표시됨
- iPhone에서 시작된 Live Activity는 Apple Watch Smart Stack, macOS menu bar, CarPlay Dashboard 등에도 나타날 수 있음
- 정적 데이터와 동적 데이터를 분리해야 업데이트가 효율적
- Lock Screen과 Dynamic Island UI는 WidgetKit으로 구현
- 시작은 ActivityKit, 예약 시작, push notification 등 여러 방식이 가능
- 대규모 동일 이벤트는 broadcast channel, 개인별 상태는 targeted push가 적합
- landscape Dynamic Island는 폭이 제한될 수 있으므로 `isDynamicIslandLimitedInWidth`로 대응
- StandBy는 Lock Screen view를 200% 확대해 사용하므로 background 처리 필요
- Apple Watch/CarPlay는 `.small` activity family를 지원해 별도 UI 최적화 가능
- 버튼에는 `LiveActivityIntent`를 연결해 즉시 액션을 제공할 수 있음

---

# 🔴 Live Activities가 나타나는 곳

Live Activity는 앱 안에만 존재하지 않는다.

세션에서 언급한 주요 surface:

- Lock Screen
- Dynamic Island
- StandBy
- Apple Watch Smart Stack
- macOS menu bar
- CarPlay Dashboard

특히 iOS 27에서는 Dynamic Island가 **portrait와 landscape 모두에서 Live Activity를 표시**한다.

이 때문에 하나의 디자인만 만든 뒤 끝내는 것이 아니라, 각 surface의 크기와 맥락에 맞게 내용을 축약하거나 재배치해야 한다.

---

# 👀 Glanceable Information이 우선

Live Activity의 목적은 상세 화면을 그대로 복제하는 것이 아니다.

사용자가 잠깐 보는 순간 필요한 정보를 얻는 것이 핵심이다.

커피 주문 예제에서는 다음과 같은 단계가 있다.

```text
Order placed
      ↓
Preparing
      ↓
Ready for pickup
      ↓
Rating opportunity
```

각 단계에서 사용자가 가장 궁금한 정보는 달라진다.

예:

- 어떤 음료를 주문했는가
- 지금 준비 중인가
- 몇 분 남았는가
- 픽업 준비가 완료됐는가
- 완료 후 평가를 남길 수 있는가

따라서 처음부터 디자인을 만들고 **시간 흐름에 따라 어떤 정보가 바뀌는지** 정리해야 한다.

---

# 🧩 Static vs Dynamic Data

Live Activity data model의 가장 중요한 개념이다.

## Static Data

Live Activity가 시작된 후 끝날 때까지 바뀌지 않는다.

`ActivityAttributes`에 둔다.

커피 주문 예:

- Coffee shop name
- Ordered drink
- Order ID

## Dynamic Data

Live Activity의 lifetime 동안 바뀔 수 있다.

`ContentState`에 둔다.

예:

- Order phase
- Estimated ready date
- Rating

---

# 🧱 `ActivityAttributes`

세션 코드:

```swift
import ActivityKit
import Foundation

public struct DrinkOrderAttributes: ActivityAttributes {
    let shopName: String
    let drink: Drink
    let orderID: UUID

    public struct ContentState: Codable, Hashable {
        var phase: DrinkOrder.Phase = .waiting
        var estimatedReadyDate: Date
        var rating: DrinkOrder.Rating?
    }
}
```

핵심 설계:

```text
DrinkOrderAttributes
├─ shopName        ← static
├─ drink           ← static
├─ orderID         ← static
└─ ContentState
   ├─ phase        ← dynamic
   ├─ readyDate    ← dynamic
   └─ rating       ← dynamic
```

Live Activity lifetime 중에는 **dynamic data만 update 가능**하다.

따라서 서버 상태나 UI 변화 가능성을 고려해 처음부터 static/dynamic 경계를 정확히 잡는 것이 중요하다.

---

# ⚠️ Static Data에 바뀔 값을 넣으면 안 되는 이유

예를 들어 `phase`를 `ActivityAttributes`에 넣어버리면:

```text
.waiting
→ .preparing
→ .ready
```

처럼 바꾸고 싶어도 동일 Live Activity에서 갱신할 수 없다.

반대로 절대 바뀌지 않는 `shopName`을 `ContentState`에 넣으면 매 update마다 같은 값을 반복 전달하게 된다.

효율적인 Live Activity는 이 둘을 정확히 분리한다.

---

# 🧰 Widget Extension

Live Activity UI는 WidgetKit으로 만든다.

앱에 widget extension이 없다면 먼저 추가한다.

`ActivityConfiguration`이 각 presentation의 view를 정의한다.

```swift
struct DrinkOrderLiveActivity: Widget {
    var body: some WidgetConfiguration {
        ActivityConfiguration(
            for: DrinkOrderAttributes.self
        ) { context in
            ActivityView(context: context)
        } dynamicIsland: { context in
            DynamicIsland {
                // expanded regions
            } compactLeading: {
                // compact leading
            } compactTrailing: {
                // compact trailing
            } minimal: {
                // minimal
            }
        }
    }
}
```

---

# 🖥️ Lock Screen View

`ActivityConfiguration`의 첫 content closure는 Lock Screen presentation을 구성한다.

```swift
ActivityConfiguration(
    for: DrinkOrderAttributes.self
) { context in
    ActivityView(context: context)
}
```

`context`에는 다음이 포함된다.

- `context.attributes`
- `context.state`

즉 static + 최신 dynamic state를 모두 사용할 수 있다.

---

# 🏝️ Dynamic Island Presentation

Dynamic Island는 여러 형태가 있다.

## Compact Leading

예:

- Ordered drink symbol

## Compact Trailing

예:

- Current phase
- Estimated remaining time

## Minimal

여러 Live Activity가 동시에 실행될 때 나타날 수 있다.

가장 핵심적인 정보만 보여줘야 한다.

세션의 커피 주문 예제에서는 circular gauge로 남은 시간을 보여준다.

## Expanded

사용자가 long press하거나 alerting update가 발생하면 표시될 수 있다.

더 많은 정보를 보여줄 수 있다.

---

# 🧭 Expanded Dynamic Island Regions

Expanded view는 sensor 주변에 여러 region을 배치한다.

세션 코드:

```swift
DynamicIsland {
    DynamicIslandExpandedRegion(.leading) {
        ExpandedLeadingView(context: context)
    }

    DynamicIslandExpandedRegion(.center) {
        ExpandedCenterView(context: context)
    }

    DynamicIslandExpandedRegion(.trailing) {
        ExpandedTrailingView(context: context)
    }

    DynamicIslandExpandedRegion(.bottom) {
        ExpandedBottomView(context: context)
    }
}
```

사용 가능한 핵심 region:

- `.leading`
- `.center`
- `.trailing`
- `.bottom`

각 영역을 반드시 모두 사용할 필요는 없다.

필요한 정보 hierarchy에 맞게 선택한다.

---

# ▶️ Live Activity 시작

Live Activity를 시작하는 가장 단순한 방법은 ActivityKit이다.

먼저 authorization을 확인한다.

```swift
guard ActivityAuthorizationInfo().areActivitiesEnabled else {
    return
}
```

그 다음 static attributes를 만든다.

```swift
let attributes = DrinkOrderAttributes(
    shopName: "Coffee Shop",
    drink: order.drink,
    orderID: order.id
)
```

---

# 🕒 Initial Content State

초기 dynamic state도 함께 만든다.

```swift
let estimatedReadyDate = Date.now + (15 * 60)

let contentState = DrinkOrderAttributes.ContentState(
    phase: .waiting,
    estimatedReadyDate: estimatedReadyDate
)
```

그리고 `ActivityContent`로 감싼다.

```swift
let activityContent = ActivityContent(
    state: contentState,
    staleDate: nil
)
```

---

# 🚀 `Activity.request`

```swift
let activity = try Activity.request(
    attributes: attributes,
    content: activityContent
)
```

이 호출로 시스템에 Live Activity 생성을 요청한다.

---

# 🕰️ `staleDate`

`ActivityContent`에는 `staleDate`를 줄 수 있다.

의미:

> 이 시점 이후에는 현재 표시 중인 content가 최신 상태라고 확신할 수 없다.

예:

```text
Latest server update: 10:00
staleDate: 10:05

10:05 이후
→ UI가 오래된 정보라는 것을 표현 가능
```

커피 주문 예제에서는 단순화를 위해 `nil`을 사용한다.

---

# 🔄 Live Activity 업데이트

Running Live Activity는 `.update`로 갱신한다.

```swift
await activity.update(
    ActivityContent(
        state: DrinkOrderAttributes.ContentState(
            phase: .preparing,
            estimatedReadyDate: estimatedReadyDate
        ),
        staleDate: nil
    )
)
```

업데이트 시 바뀌는 것은 `ContentState`다.

`ActivityAttributes`는 그대로 유지된다.

---

# 📡 Remote Update 전략

앱이 foreground에 없을 때도 Live Activity를 갱신해야 할 수 있다.

세션에서는 두 가지 remote update 전략을 설명한다.

```text
1. Broadcast channel
2. Targeted push notification
```

---

# 📣 Broadcast Updates

많은 사용자가 같은 이벤트를 보고 있을 때 유리하다.

예:

- 스포츠 경기
- 대규모 이벤트
- 공통 운행 상황
- 동일한 live score

구조:

```text
Server
   ↓
Broadcast Channel
   ↓
Hundreds / Thousands of Live Activities
```

각 Live Activity는 해당 channel을 subscribe한다.

장점:

- 동일 데이터를 대규모 사용자에게 효율적으로 전송

---

# 🎯 Targeted Push Notifications

개인별로 다른 데이터가 필요한 일반적인 use case에 적합하다.

예:

- 개인 주문
- 배달 상태
- 개별 탑승 정보
- 개인 예약

구조:

```text
Live Activity
   ↓
Push Token
   ↓
Server stores token
   ↓
Targeted update
```

서버가 Live Activity push token을 이용해 특정 device/activity만 업데이트한다.

---

# 🧠 Broadcast vs Targeted Push

| 상황 | 권장 방식 |
|---|---|
| 수천 명이 같은 경기 점수 | Broadcast |
| 한 사람의 커피 주문 | Targeted Push |
| 대중교통 공통 운행 상황 | Broadcast 가능 |
| 개인 택배 위치 | Targeted Push |
| 대규모 live event | Broadcast |
| 개인 checkout 상태 | Targeted Push |

---

# 📱 iOS 27 Landscape Dynamic Island

iOS 27에서는 compact/minimal Live Activity가 portrait뿐 아니라 landscape Dynamic Island에도 나타난다.

하지만 landscape에서는 compact view가 사용할 수 있는 horizontal space가 제한된다.

즉 portrait에서 잘 보이던 긴 label이나 timer가 잘릴 수 있다.

---

# 📏 `isDynamicIslandLimitedInWidth`

새 environment value를 이용한다.

```swift
@Environment(\.isDynamicIslandLimitedInWidth)
var isDynamicIslandLimitedInWidth
```

세션 코드:

```swift
struct CompactTrailingView: View {
    @Environment(\.isDynamicIslandLimitedInWidth)
    var isDynamicIslandLimitedInWidth

    var context: ActivityViewContext<DrinkOrderAttributes>

    var body: some View {
        if isDynamicIslandLimitedInWidth {
            StepProgressIconView(context: context)
        } else if context.state.phase.showsTimer {
            EstimatedReadyView(
                context: context,
                font: .system(.body).monospacedDigit()
            )
        } else {
            OrderPhaseLabelView(
                context: context,
                font: .caption2.bold(),
                color: .brown
            )
        }
    }
}
```

---

# 🧩 Landscape 대응 전략

Portrait:

```text
"7 min"
"Ready"
```

Landscape limited width:

```text
Compact Progress Icon
```

즉 동일한 정보를 억지로 축소하지 않고, 더 좁은 공간에 적합한 alternate presentation을 제공한다.

---

# 🌙 StandBy

StandBy는 iPhone을 landscape로 두고 charging할 때 나타날 수 있다.

Live Activity에서는 Lock Screen view가 사용되지만 **약 200% 확대**돼 표시된다.

Lock Screen에서 자연스러운 배경이 StandBy에서는 주변에 빈 공간을 남길 수 있다.

---

# 🎨 `showsWidgetContainerBackground`

환경 값을 사용한다.

```swift
@Environment(\.showsWidgetContainerBackground)
var showsWidgetContainerBackground
```

세션 예제:

```swift
struct ActivityView: View {
    @Environment(\.showsWidgetContainerBackground)
    var showsWidgetContainerBackground

    var context: ActivityViewContext<DrinkOrderAttributes>

    var body: some View {
        DetailView(context: context)
            .background {
                if showsWidgetContainerBackground {
                    LinearGradient.barista
                }
            }
            .activityBackgroundTint(.espresso)
    }
}
```

---

# 🟫 `activityBackgroundTint`

StandBy처럼 container background가 다르게 처리되는 presentation에서는 `activityBackgroundTint`를 사용한다.

```swift
.activityBackgroundTint(.espresso)
```

결과:

- Lock Screen: custom gradient
- StandBy: edge-to-edge tint

presentation에 맞춰 더 자연스럽게 보인다.

---

# ⌚ Apple Watch와 CarPlay

Live Activity는 iPhone에서 시작해도 다른 Apple device에 자동으로 forwarding될 수 있다.

세션이 강조하는 두 surface:

- Apple Watch Smart Stack
- CarPlay Dashboard

기본 Lock Screen용 UI가 그대로 가면 공간이 맞지 않을 수 있다.

---

# 🧩 `.small` Activity Family

먼저 지원 선언:

```swift
.supplementalActivityFamilies([.small])
```

세션 코드:

```swift
struct DrinkOrderLiveActivity: Widget {
    var body: some WidgetConfiguration {
        ActivityConfiguration(
            for: DrinkOrderAttributes.self
        ) { context in
            ActivityView(context: context)
        } dynamicIsland: { context in
            // ...
        }
        .supplementalActivityFamilies([.small])
    }
}
```

---

# 🧭 `activityFamily`

View에서 현재 family를 확인한다.

```swift
@Environment(\.activityFamily)
var activityFamily
```

그리고 `.small`이면 별도 UI를 사용한다.

```swift
@ViewBuilder
var contentView: some View {
    if activityFamily == .small {
        SmallView(context: context)
    } else {
        DetailView(context: context)
    }
}
```

---

# 🚗 CarPlay 최적화

CarPlay에서는 glanceability가 특히 중요하다.

Lock Screen용 detailed view를 그대로 사용하면:

- 정보가 너무 많음
- text가 작아짐
- glanceability 저하

따라서 `.small` family를 통해 핵심 상태만 보여주는 UI가 적합하다.

---

# ⌚ Apple Watch 최적화

Apple Watch Smart Stack 역시 작은 공간이다.

보여줄 내용 우선순위를 다시 정한다.

예:

```text
Drink Symbol
Phase
Remaining Time
```

세부 주문 설명이나 긴 텍스트는 제거한다.

---

# 🎛️ Live Activity Interactivity

Live Activity는 단순 표시만 하는 UI가 아니다.

App Intent와 연결하면 빠른 action을 제공할 수 있다.

커피 주문 예제에서는 주문이 끝난 뒤 평가한다.

```text
👎 Not Good
👍 Great
```

---

# 🧩 `LiveActivityIntent`

세션 코드:

```swift
struct RateDrinkIntent: LiveActivityIntent {
    static var title: LocalizedStringResource = "Rate Drink"

    @Parameter(title: "Order ID")
    var orderID: String

    @Parameter(title: "Positive")
    var isPositive: Bool

    func perform() async throws -> some IntentResult {
        await updateLocalDatastore(
            rating: isPositive ? .great : .poor,
            dismissPolicy: .after(.now + 15)
        )
        return .result()
    }
}
```

Intent가 받는 정보:

- Order ID
- Positive/negative rating

`perform()` 안에서 실제 logic을 실행한다.

---

# 🔘 Intent를 Button에 연결

```swift
struct RatingButtons: View {
    var context: ActivityViewContext<DrinkOrderAttributes>

    var body: some View {
        HStack(spacing: 12) {
            Button(
                intent: RateDrinkIntent(
                    orderID: context.attributes.orderID.uuidString,
                    isPositive: false
                )
            ) {
                Label(
                    "Not Good",
                    systemImage: "hand.thumbsdown.fill"
                )
            }

            Button(
                intent: RateDrinkIntent(
                    orderID: context.attributes.orderID.uuidString,
                    isPositive: true
                )
            ) {
                Label(
                    "Great",
                    systemImage: "hand.thumbsup.fill"
                )
            }
        }
    }
}
```

사용자가 버튼을 누르면 앱을 직접 열지 않고 associated intent가 실행된다.

---

# 🔄 전체 Lifecycle

```text
User starts action
      ↓
App creates ActivityAttributes
      ↓
Initial ContentState
      ↓
Activity.request
      ↓
System presents Live Activity
      ↓
Local update or remote push
      ↓
ContentState changes
      ↓
WidgetKit re-renders
      ↓
Activity completes
      ↓
Optional interaction / feedback
```

---

# 🧠 Data Flow를 단순하게 유지

좋은 Live Activity는 UI가 server model 전체를 직접 들고 있지 않는다.

예:

```text
Server Order Model
- user
- payment
- address
- full product data
- internal metadata
- timestamps
- analytics data
       ↓
Live Activity Model
- orderID
- shopName
- drink
- phase
- ETA
- rating
```

사용자에게 필요한 glanceable 정보만 전달하는 것이 좋다.

---

# 📡 Remote Update 설계 체크

서버 연동 시 다음을 결정해야 한다.

```text
이 정보는 모두에게 동일한가?
      ↓ yes
Broadcast Channel

개인별로 다른가?
      ↓ yes
Push Token
```

Push payload와 update frequency도 최소화한다.

---

# ⏱️ Timer 표현

Ready time처럼 시간 기반 정보는 absolute timestamp를 state에 전달하는 것이 유리하다.

예:

```swift
estimatedReadyDate: Date
```

앱이 매초 새 push를 보내는 대신 UI가 시스템 clock을 기준으로 remaining time을 계산하도록 구성할 수 있다.

---

# 🎯 Presentation별 정보 우선순위

## Lock Screen

가장 많은 정보 제공 가능.

- Drink
- Shop
- Phase
- ETA
- Progress
- Rating action

## Dynamic Island Compact

- Symbol
- Status / timer

## Dynamic Island Minimal

- 가장 핵심적인 progress 한 가지

## Landscape Dynamic Island

- 폭 제한 대응
- Icon-centric alternate UI

## StandBy

- 큰 scale
- edge-to-edge background 고려

## Apple Watch / CarPlay

- `.small`
- glanceability 최우선

---

# 📋 체크리스트

## Data Model

- [ ] Static와 dynamic data 구분
- [ ] 변하지 않는 값은 `ActivityAttributes`
- [ ] 변경 값은 `ContentState`
- [ ] `ContentState`는 `Codable`, `Hashable`
- [ ] Payload를 가능한 작게 유지
- [ ] Server model 전체를 그대로 넣지 않기
- [ ] Absolute time을 전달할 수 있는 값은 `Date` 검토

## Widget Extension

- [ ] Widget extension 추가
- [ ] `ActivityConfiguration` 구현
- [ ] Correct `ActivityAttributes` type 지정
- [ ] Lock Screen view 구현
- [ ] Dynamic Island 구현
- [ ] Preview를 presentation별로 확인

## Dynamic Island

- [ ] `compactLeading` 구현
- [ ] `compactTrailing` 구현
- [ ] `minimal` 구현
- [ ] Expanded regions 필요한 만큼 구성
- [ ] Compact UI에 핵심 정보만 유지
- [ ] Multiple Live Activities 상황에서 minimal 확인

## Start

- [ ] `ActivityAuthorizationInfo().areActivitiesEnabled` 확인
- [ ] Static attributes 생성
- [ ] Initial content state 생성
- [ ] `ActivityContent` 생성
- [ ] `staleDate` 필요 여부 결정
- [ ] `Activity.request` error handling

## Update

- [ ] Local `.update` flow 구현
- [ ] 최신 `ContentState`만 전달
- [ ] `staleDate` update 필요 여부 검토
- [ ] Update frequency 최소화
- [ ] Duplicate updates 방지

## Remote Update

- [ ] Broadcast가 적합한지 판단
- [ ] Targeted push가 적합한지 판단
- [ ] Push token 저장/갱신 처리
- [ ] Broadcast channel subscription 관리
- [ ] Server retry 정책 설계
- [ ] Push payload 크기 최소화

## Landscape Dynamic Island

- [ ] iOS 27 landscape에서 직접 테스트
- [ ] `isDynamicIslandLimitedInWidth` 확인
- [ ] 긴 timer/label 대신 alternate icon UI 제공
- [ ] Portrait와 landscape 모두 검증

## StandBy

- [ ] Lock Screen view가 200% scale될 때 확인
- [ ] `showsWidgetContainerBackground` 사용
- [ ] Lock Screen 전용 background 분기
- [ ] `activityBackgroundTint` 지정
- [ ] Edge-to-edge appearance 확인

## Apple Watch / CarPlay

- [ ] `.supplementalActivityFamilies([.small])`
- [ ] `@Environment(\.activityFamily)` 사용
- [ ] `.small` 전용 `SmallView` 구현
- [ ] Apple Watch Smart Stack 확인
- [ ] CarPlay Dashboard 확인
- [ ] 작은 화면에서 text overflow 점검

## Interactivity

- [ ] Quick action이 실제로 필요한지 검토
- [ ] `LiveActivityIntent` 구현
- [ ] 필요한 parameter만 전달
- [ ] `perform()` 로직 비동기 처리
- [ ] Button에 intent 연결
- [ ] Action 이후 UI update/dismiss policy 설계
- [ ] Network failure 시 behavior 정의

## Design

- [ ] Glanceable한지 확인
- [ ] 각 단계의 핵심 정보 정의
- [ ] 모든 presentation에 같은 정보를 억지로 넣지 않기
- [ ] Status color에만 의존하지 않기
- [ ] Accessibility label 검토
- [ ] Dynamic Type / localization 테스트

---

# ⚠️ 구현 시 주의할 점

## Static/Data 구분을 나중에 바꾸기 어렵다

Live Activity가 시작된 뒤 `ActivityAttributes`는 바뀌지 않는다.

처음 modeling 단계가 중요하다.

## Dynamic Island는 Presentation마다 크기가 다르다

Expanded view를 compact에 축소해서 넣는 방식은 좋지 않다.

각 presentation마다 별도로 정보 hierarchy를 잡는다.

## Landscape는 Portrait의 단순 회전이 아니다

Dynamic Island compact area의 available width가 다르다.

`isDynamicIslandLimitedInWidth`를 이용해 실제로 다른 UI를 제공해야 할 수 있다.

## StandBy는 Lock Screen 그대로 두면 어색할 수 있다

200% scale 때문에 background와 margin 문제가 더 잘 보인다.

## `.small` 지원 선언만으로 끝나지 않는다

실제 small presentation에 맞는 content를 `activityFamily`로 분기해 제공해야 한다.

## Push와 Broadcast를 같은 문제로 보지 않는다

같은 data를 대규모에 전달하는 경우와 개인별 상태 update는 비용 구조가 다르다.

---

# 🧩 주요 API 정리

| API | 역할 |
|---|---|
| `ActivityAttributes` | Live Activity의 static data 정의 |
| `ContentState` | lifetime 중 변경 가능한 dynamic data |
| `ActivityConfiguration` | Lock Screen / Dynamic Island UI 구성 |
| `ActivityViewContext` | attributes + 최신 state 접근 |
| `ActivityAuthorizationInfo` | Live Activities 사용 가능 여부 확인 |
| `Activity.request` | Live Activity 시작 |
| `Activity.update` | Running activity 상태 갱신 |
| `ActivityContent` | state + staleDate 묶음 |
| `staleDate` | content가 오래된 것으로 간주되는 시점 |
| `isDynamicIslandLimitedInWidth` | landscape 등 제한된 Dynamic Island 폭 감지 |
| `showsWidgetContainerBackground` | system container background 표시 여부 |
| `activityBackgroundTint` | Live Activity background tint |
| `supplementalActivityFamilies([.small])` | 작은 presentation 지원 선언 |
| `activityFamily` | 현재 presentation family 확인 |
| `LiveActivityIntent` | Live Activity interactive action 정의 |

---

# 🔁 권장 구현 순서

```text
1. Design
      ↓
2. Static / Dynamic Data Modeling
      ↓
3. Widget Extension
      ↓
4. Lock Screen View
      ↓
5. Dynamic Island Views
      ↓
6. ActivityKit Local Lifecycle
      ↓
7. Push / Broadcast Updates
      ↓
8. Landscape Dynamic Island
      ↓
9. StandBy
      ↓
10. Watch / CarPlay Small Family
      ↓
11. LiveActivityIntent Interactivity
```

---

# 🎯 커피 주문 예제를 한눈에 보기

```text
Static
├─ Shop Name
├─ Drink
└─ Order ID

Dynamic
├─ Phase
├─ Ready Date
└─ Rating

Presentation
├─ Lock Screen
├─ Dynamic Island Compact
├─ Dynamic Island Minimal
├─ Dynamic Island Expanded
├─ StandBy
├─ Apple Watch
└─ CarPlay

Update
├─ Local ActivityKit
├─ Targeted Push
└─ Broadcast Channel

Interaction
└─ RateDrinkIntent
```

---

# 핵심 메시지

Live Activities를 잘 만드는 핵심은 API를 많이 쓰는 것이 아니라 **정보의 시간적 성격과 presentation별 우선순위를 정확히 설계하는 것**이다.

먼저 변하지 않는 데이터와 계속 변하는 데이터를 나눈다.

```text
Static → ActivityAttributes
Dynamic → ContentState
```

그 다음 WidgetKit으로 각 surface에 적합한 SwiftUI view를 만든다.

```text
Lock Screen
Dynamic Island
StandBy
Apple Watch
CarPlay
```

상태 update는 앱이 foreground에 있을 때 ActivityKit으로 처리할 수 있고, background에서는 push notification을 사용할 수 있다. 많은 사람이 같은 데이터를 받는 경우에는 broadcast channel이 효율적이다.

그리고 iOS 27에서는 landscape Dynamic Island가 추가되면서 compact/minimal UI가 제한된 width에서도 동작해야 한다. `isDynamicIslandLimitedInWidth`를 이용해 긴 text 대신 icon 같은 alternate presentation을 제공하는 것이 좋다.

StandBy에서는 Lock Screen view가 크게 확대되므로 `showsWidgetContainerBackground`와 `activityBackgroundTint`로 background를 조정한다.

Apple Watch와 CarPlay에서는 `.small` family를 지원하고 `activityFamily`에 따라 훨씬 간결한 UI를 제공한다.

마지막으로 `LiveActivityIntent`를 통해 사용자가 앱을 열지 않고도 평가·확인·완료 같은 빠른 행동을 수행하게 만들 수 있다.

결국 좋은 Live Activity는 다음 네 가지를 함께 만족해야 한다.

```text
Efficient Data Model
        +
Glanceable Presentation
        +
Timely Updates
        +
Contextual Interaction
```

이 원칙을 지키면 하나의 Live Activity가 iPhone Lock Screen에서 시작해 Dynamic Island, StandBy, Apple Watch, macOS, CarPlay까지 자연스럽게 확장되는 시스템 경험을 만들 수 있다.

---

# 함께 보면 좋은 세션과 자료

- Human Interface Guidelines: Live Activities
- Starting and updating Live Activities with ActivityKit push notifications
- ActivityKit documentation
- Design dynamic Live Activities — WWDC23
- Bring your Live Activity to Apple Watch — WWDC24
- SwiftUI essentials — WWDC24
