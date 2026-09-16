# Apple Tech Talk 111462 — Raise the bar with iPhone Duo 요약

- Session: Tech Talks 111462
- Title: Raise the bar with iPhone Duo
- Source: https://developer.apple.com/videos/play/tech-talks/111462/
- YouTube: https://www.youtube.com/watch?v=2y6xvya0b8M
- Topic: iPhone Duo, SwiftUI, UIKit, Navigation, Toolbars, Tab Bars, Vertical Bars, Overflow
- Chapters: Introduction, Why bars move to the side, Agenda, Opt in to vertical bars, Understand the shared bar region, Order items in a vertical bar, Prepare toolbar content, Control the axis of an item, Prefer symbol-only items, Adapt custom views, Manage the overflow menu, Prioritize item visibility, When to opt out, Next steps

---

## 한 줄 요약

iPhone Duo에서는 넓어진 가로 공간을 활용하고 세로 콘텐츠 공간과 엄지 접근성을 확보하기 위해 **navigation bar·toolbar·tab bar의 주요 controls가 inner display의 측면 vertical bar로 이동**하며, 최신 SDK와 system navigation container를 사용하면 대부분 자동 적응하지만 custom toolbar item은 axis, 표현 방식, overflow 우선순위를 명시적으로 준비해야 한다.

---

## 핵심 요약

이번 세션은 iPhone Duo에서 기존 bar UI를 vertical layout으로 자연스럽게 적응시키는 방법을 설명한다.

- **왜 vertical bar인가**
  - iPhone Duo의 inner display는 넓은 가로 공간을 제공한다.
  - 상단/하단 controls를 측면으로 옮기면 세로 콘텐츠 공간을 더 확보할 수 있다.
  - 주요 controls가 손이 닿기 쉬운 위치에 유지된다.
  - landscape에서는 inner display의 같은 측면에 bar가 유지되고, portrait에서는 익숙한 horizontal bar로 돌아간다.

- **System container를 사용하면 대부분 자동 적용**
  - SwiftUI: `NavigationStack` / `NavigationSplitView` + `.toolbar`
  - UIKit: `UINavigationController` / `UITabBarController`
  - 직접 만든 `UIToolbar`, `UINavigationBar`, `UITabBar`의 content는 vertical bar 대상으로 자동 고려되지 않는다.

- **Navigation, toolbar, tab bar가 하나의 shared region을 사용**
  - 세 bar가 독립적으로 공간을 차지하는 것이 아니라 vertical shared region에서 함께 배치된다.
  - Split view에서는 detail column만 이 region에 참여한다.
  - Inspector에는 별도 bar가 생기지 않는다.

- **아이템 순서와 의미 유지**
  - 상단에는 back/close 같은 primary navigation.
  - 그 다음 done 같은 prominent action.
  - 기존 container 의미를 유지해야 시스템이 적절히 재배치한다.

- **Vertical bar는 symbol 중심**
  - 고정 width + 가변 height 구조라 symbol-only item이 가장 적합하다.
  - title은 overflow menu와 expanded representation 때문에 항상 제공해야 한다.
  - text-only item은 horizontal에 남는 경향이 있다.

- **새 AxisBehavior API**
  - `.verticalPreferred`
  - `.horizontalOnly`
  - Custom/complex view는 기본적으로 horizontal에 남고, vertical 표현을 지원한다면 명시적으로 opt-in한다.

- **Custom view 적응**
  - `toolbarVerticalEdge` 환경값/trait로 어느 edge에 vertical bar가 있는지 읽을 수 있다.
  - fixed-width vertical region에 맞는 layout을 제공해야 한다.

- **Overflow 관리**
  - outer display landscape나 keyboard 표시 시 공간이 줄어 overflow가 더 자주 발생한다.
  - system overflow menu 사용 권장.
  - Toolbar와 tab bar 중 어느 쪽을 더 오래 유지할지 compression behavior로 선택.
  - `visibilityPriority`로 중요한 item을 끝까지 남길 수 있다.

- **Opt-out은 제한적으로**
  - 대부분의 앱은 vertical bar가 적합하다.
  - Calculator처럼 single-page, bottom-heavy UI이거나 close 하나만 있는 sheet처럼 vertical bar 이점이 작은 경우에만 disable을 고려한다.

---

# 📱 왜 Bar가 측면으로 이동하는가

iPhone Duo의 inner display는 일반 iPhone보다 훨씬 넓다.

기존 iPhone UI는 controls를 주로 위와 아래에 둔다.

```text
┌───────────────────────┐
│ Navigation Bar        │
├───────────────────────┤
│                       │
│       Content         │
│                       │
├───────────────────────┤
│ Toolbar / Tab Bar     │
└───────────────────────┘
```

Duo에서는 가로 공간은 충분하지만 세로 공간은 여전히 중요하다.

따라서 landscape inner display에서는 controls를 측면으로 이동한다.

```text
┌───┬───────────────────┐
│   │                   │
│ B │                   │
│ A │      Content      │
│ R │                   │
│   │                   │
└───┴───────────────────┘
```

이렇게 하면:

- 콘텐츠의 vertical space 보존
- controls에 대한 thumb reach 개선
- 여러 bar가 화면을 위아래로 쪼개는 문제 감소

---

# 🔄 Pose에 따른 Bar 방향

Bar 방향은 항상 vertical인 것이 아니다.

## Inner display — Landscape

```text
Vertical Bar
```

## Portrait

```text
Familiar Horizontal Bar
```

즉 동일한 navigation/toolbar item이 device pose와 available geometry에 따라 system에 의해 재배치된다.

---

# 🧭 Shared Bar Region

Duo에서 navigation, toolbar, tab bar는 하나의 shared region을 사용한다.

개념적으로 기존 horizontal bars를 90도 회전시킨 것과 비슷하다.

```text
Navigation controls
        ↓
Prominent actions
        ↓
Toolbar items
        ↓
Tab bar items
```

중요한 점은 **각 control이 원래 어떤 container에 속하는지는 유지된다는 것**이다.

시스템은 container semantics를 바탕으로 순서와 표현을 결정한다.

---

# 🧱 Split View에서의 동작

`NavigationSplitView` 또는 UIKit split layout에서는 모든 column이 vertical bar를 갖는 것이 아니다.

Apple의 설명:

- Detail column만 shared bar region에 참여
- Inspector에는 별도 vertical bar를 만들지 않음

이를 통해 화면 측면에 여러 bar가 중첩되는 것을 방지한다.

---

# 🌐 RTL에서도 Hardware 기준 위치 유지

Vertical bar는 hardware alignment와 연결된다.

따라서 right-to-left language라고 해서 bar가 반대쪽으로 자동 mirror되는 구조가 아니다.

즉 text/layout direction보다 물리적 display edge와의 관계가 우선된다.

Custom UI를 bar edge에 맞춰 배치한다면 이 점을 고려해야 한다.

---

# ✅ Vertical Bar에 Opt-in하기

가장 먼저 해야 할 일:

> 최신 SDK로 앱을 rebuild한다.

그 다음 system bar/container를 사용한다.

---

# 🍎 SwiftUI

권장 구조:

```swift
var body: some View {
    NavigationStack {
        ContentView()
            .toolbar {
                ToolbarItem(placement: .bottomBar) {
                    ...
                }
            }
    }
}
```

핵심은 `.toolbar`를 단독으로 사용하는 것이 아니라 navigation container와 함께 사용하는 것이다.

사용 가능한 대표 container:

- `NavigationStack`
- `NavigationSplitView`

---

# 🧰 UIKit

UIKit에서는 navigation container를 사용한다.

권장:

- `UINavigationController`
- `UITabBarController`

주의:

```swift
// Content from a custom bars (UINavigationBar, UITabBar, UIToolbar)
// won't be considered. Prefer UINavigationController
// and UITabBarController, which manage their own bars.
let toolbar = UIToolbar()
toolbar.items = [...]
```

직접 생성한 custom `UIToolbar`, `UINavigationBar`, `UITabBar`의 item은 system vertical bar composition에 자동으로 참여하지 않는다.

---

# 🧠 Container Semantics가 중요한 이유

System container는 각 item의 역할을 이해한다.

예:

```text
Back
Close
Done
Compose
Search
Tabs
```

Custom bar를 직접 구성하면 이러한 의미를 system이 해석하기 어려워진다.

따라서 Duo 대응에서는 visual recreation보다 **semantic container 사용**이 더 중요하다.

---

# ⬆️ Vertical Bar의 Item Ordering

Vertical bar에서 위쪽 영역은 가장 중요한 navigation/action에 사용된다.

권장 순서:

```text
Top
│
├─ Back / Close
├─ Done / Prominent Action
├─ Toolbar Actions
├─ Less Important Actions
└─ Tab / Overflow-related Items
Bottom
```

기존 앱의 toolbar item placement를 점검해 실제 의미와 placement가 맞는지 audit해야 한다.

---

# ❌ Back / Close를 임의 Toolbar Placement로 두지 않기

Close나 cancel은 cancellation action 의미로 선언한다.

SwiftUI:

```swift
.toolbar {
    ToolbarItem(placement: .cancellationAction) {
        ...
    }
}
```

UIKit:

```swift
navigationItem.leftItemsSupplementBackButton = false
navigationItem.leadingItemGroups = [
    UIBarButtonItemGroup(...)
]
```

시스템이 이 item을 primary navigation 위치에 올바르게 배치할 수 있다.

---

# ⭐ Prominent Action 배치

Done, Finish처럼 중요한 action은 pinned trailing placement를 사용한다.

SwiftUI:

```swift
.toolbar {
    ToolbarItem(placement: .topBarPinnedTrailing) {
        ...
    }
}
```

UIKit:

```swift
navigationItem.pinnedTrailingGroup =
    UIBarButtonItemGroup(...)
```

Vertical bar에서도 prominent action으로 유지된다.

---

# 📏 Vertical Bar의 Geometry

Vertical bar는 다음 특성을 가진다.

```text
Width  → Fixed
Height → Flexible
```

이 차이가 toolbar item design에 매우 중요하다.

Horizontal bar에서는 text와 image를 좌우로 펼치기 쉽지만 vertical bar는 width가 제한된다.

따라서 **symbol-only representation**이 가장 자연스럽다.

---

# 🖼️ Symbol + Title을 계속 제공해야 한다

Vertical bar에서 화면에는 symbol만 표시될 수 있지만 title을 제거하면 안 된다.

Title은 다음에서 필요하다.

- Overflow menu
- Expanded representation
- Accessibility/semantic context
- 다른 axis의 representation

즉:

```text
Visual representation: Symbol only
Semantic representation: Symbol + Title
```

---

# 📝 Text-only Item의 동작

System은 item content가 vertical layout에 적합한지도 판단한다.

대략적인 기본 동작:

```text
Icon 있음
→ Vertical 배치 가능

Text-only
→ Horizontal 유지 가능성 높음
```

따라서 title-only toolbar item이 많으면 vertical bar가 충분히 활용되지 않을 수 있다.

---

# 🧭 AxisBehavior API

새 AxisBehavior API로 개별 item의 axis preference를 조절할 수 있다.

대표 값:

```text
.verticalPreferred
.horizontalOnly
```

---

# ↕️ `.verticalPreferred`

Custom view가 vertical bar에서도 적절히 표현될 수 있다면 명시적으로 허용한다.

SwiftUI:

```swift
ToolbarItem {
    ProfileView()
}
.axisBehavior(.verticalPreferred)
```

UIKit:

```swift
let item = UIBarButtonItem(
    customView: ProfileView()
)

item.axisBehavior = .verticalPreferred
```

---

# ↔️ `.horizontalOnly`

Vertical 표현이 의미를 잃는 item은 horizontal bar에 남긴다.

예:

```swift
ToolbarItem {
    SelectOrDoneButton()
}
.axisBehavior(.horizontalOnly)
```

UIKit:

```swift
item.axisBehavior = .horizontalOnly
```

---

# 🔄 표현이 바뀌는 Control

세션은 custom select button처럼 상태에 따라 표현이 달라지는 control을 예로 든다.

예:

```text
Normal
→ Symbol

Selection mode
→ "Done" Text
```

이런 item은 같은 기능인데 axis에 따라 전혀 다른 표현이 될 수 있다.

Apple은 관련 item들을 같은 axis에서 일관되게 유지하도록 권장한다.

필요하면 `.horizontalOnly`를 사용한다.

---

# 🧩 Custom View는 기본적으로 Horizontal

System이 custom view 내부 구조를 충분히 이해하기 어렵기 때문에 complex/custom view는 기본적으로 horizontal bar에 남는다.

Vertical bar에 맞는 표현을 직접 준비했다면:

```swift
.axisBehavior(.verticalPreferred)
```

를 사용해 opt-in한다.

---

# 🎯 Symbol-only Item 우선

Apple은 title-only item과 image+text를 동시에 항상 표시하는 custom item을 줄이라고 권장한다.

이유:

```text
Vertical width 제한
      ↓
Text가 많음
      ↓
Horizontal item 증가
      ↓
Vertical bar 활용 감소
      ↓
Overflow 증가
```

---

# 🏷️ Badge 사용

iOS 26에서 추가된 badge API는 vertical bar에서도 유용하다.

SwiftUI:

```swift
ToolbarItem(...) {
    InboxButton()
        .badge(7)
}
```

UIKit:

```swift
let item = UIBarButtonItem(...)
item.badge = .count(7)
```

Text로 상태를 표현하는 대신 symbol + badge로 표현하면 vertical bar에 더 적합하다.

---

# 🧠 Text가 꼭 필요한 경우

모든 text를 제거하라는 의미는 아니다.

Apple이 제시하는 판단 기준:

> Text가 symbol을 단순히 보강하는가, 아니면 독립적으로 중요한 정보를 전달하는가?

예:

```text
Inbox + "7"
→ Badge로 대체 가능

Cart + "$123.45"
→ 금액 자체가 중요한 정보
→ Horizontal representation 유지
```

---

# 🎨 Custom View 적응

Custom view는 vertical bar의 fixed width에 맞아야 한다.

두 가지 전략:

1. 기존 view가 fixed width에서도 자연스럽게 동작
2. Vertical bar 전용 representation 제공

---

# 📍 Vertical Bar Edge 읽기

SwiftUI:

```swift
struct ContentView: View {
    @Environment(\.toolbarVerticalEdge)
    var edge

    var body: some View {
        switch edge {
        case .some(...):
            ...
        default:
            ...
        }
    }
}
```

UIKit:

```swift
switch traitCollection.verticalBarEdge {
case ...:
    ...
default:
    ...
}
```

이를 통해 custom view의 padding, alignment, shape 등을 실제 bar 위치에 맞춰 조절할 수 있다.

---

# 🌫️ Scroll Edge와 Reduce Transparency

세션에서 언급한 vertical bar의 특성:

- 기본적으로 scroll edge effect 없음
- Reduce Transparency가 켜지면 background가 생김

따라서 custom decoration이나 background를 직접 그릴 때 system appearance와 중복되지 않는지 확인해야 한다.

---

# ↕️ Spacer 동작

Vertical layout에서는 spacer behavior도 달라진다.

- Flexible spacer → vertical에서 크기 0
- Fixed spacer → minimum size 유지

Horizontal toolbar용 spacing hack이 vertical bar에서 그대로 동작할 것이라고 가정하면 안 된다.

---

# 📦 Overflow가 더 자주 발생하는 상황

다음 상황에서는 available bar space가 감소한다.

- Outer display landscape
- Keyboard 표시
- 많은 navigation items
- Tab bar와 toolbar가 shared region에서 경쟁

따라서 Duo에서는 overflow를 first-class behavior로 다뤄야 한다.

---

# ⚖️ Toolbar vs Tab Bar Compression

공간이 부족할 때 어느 영역이 먼저 줄어들지를 정할 수 있다.

기본적으로 toolbar가 먼저 compress된다.

이 기본값은 navigation 중심 앱에 적합하다.

하지만 task-oriented app에서는 toolbar action이 더 중요할 수 있다.

---

# 🧰 Compression Behavior 설정

SwiftUI:

```swift
TabView {
    Tab("Recents", systemImage: "clock") {
        ContentView()
            .toolbarVerticalCompressionBehavior(
                .prefersToolbarItems
            )
    }
}
```

UIKit:

```swift
navigationItem.verticalBarCompressionBehavior =
    .prefersBarItems
```

이 설정으로 toolbar item을 더 오래 visible하게 유지하도록 system에 preference를 전달할 수 있다.

---

# ⋯ System Overflow Menu 사용

Custom overflow button을 직접 만들기보다 system overflow menu에 통합한다.

SwiftUI:

```swift
.toolbar {
    ToolbarOverflowMenu {
        Button("Scan") { ... }
        Button("Connect") { ... }
    }
}
```

UIKit:

```swift
navigationItem.additionalOverflowItems =
    UIDeferredMenuElement { provider in
        provider(
            self.persistentOverflowItems()
        )
    }
```

---

# ⚠️ Ellipsis는 Overflow 전용

Apple은 ellipsis symbol을 custom arbitrary menu button으로 사용하지 말고 overflow 의미에만 사용하도록 권장한다.

Duo에서는 system overflow가 더욱 중요한 navigation behavior가 되기 때문이다.

---

# ⬇️ Default Overflow Order

기본적으로 item은 아래쪽부터 overflow된다.

```text
Top
A  ← 가장 오래 남음
B
C
D  ← 먼저 overflow
Bottom
```

하지만 중요도와 실제 사용 빈도는 항상 이 순서와 일치하지 않는다.

---

# ⭐ Visibility Priority

새 visibility priority API로 어떤 item을 더 오래 visible하게 유지할지 지정할 수 있다.

SwiftUI:

```swift
ToolbarItem {
    Button(...) { ... }
}
.visibilityPriority(.high)
```

UIKit:

```swift
let item = UIBarButtonItem(...)
item.visibilityPriority = .high
```

---

# 🎯 Priority 설계 기준

High priority에 적합한 예:

- Compose
- New Note
- Add Item
- Frequently used action
- Status를 전달하는 badged item

낮은 priority:

- 드물게 사용하는 secondary action
- overflow menu에서 발견 가능해도 큰 문제가 없는 기능

---

# 👀 Glanceability 보호

Apple은 badge처럼 상태 정보를 한눈에 전달하는 control을 가능한 visible하게 유지하라고 설명한다.

예:

```text
Inbox badge
Unread status
Connection state
```

이 item이 overflow되면 사용자는 앱 상태를 한눈에 확인하지 못하게 된다.

따라서 action frequency뿐 아니라 **glanceability**도 priority 기준이다.

---

# 🧩 Group과 Item Priority

Priority는 item 단위뿐 아니라 group 구조를 고려해야 한다.

권장 접근:

```text
1. Group 중요도 결정
2. 같은 Group 안의 Item 중요도 결정
```

관련 control이 서로 다른 시점에 흩어져 overflow되지 않도록 전체 구조를 함께 설계한다.

---

# 🚫 Vertical Bar를 비활성화해야 하는 경우

Apple은 대부분의 앱에서 vertical bar를 권장한다.

하지만 일부 UI에서는 opt-out이 더 나을 수 있다.

---

# 🧮 Calculator 같은 Single-page UI

Calculator처럼 화면 아래쪽이 핵심이고 navigation hierarchy가 거의 없는 앱은 side bar가 오히려 content expansion을 방해할 수 있다.

```text
Single Page
+
Bottom-heavy Control Layout
→ Vertical Bar 이점 작음
```

---

# 📄 Control 하나뿐인 Sheet

Sheet에 close button 하나만 있는 경우에도 vertical bar를 만드는 비용이 더 클 수 있다.

```text
Sheet
└─ Close only
```

이 경우 기존 horizontal presentation이 더 자연스러울 수 있다.

---

# 🔕 Vertical Bar 비활성화

SwiftUI:

```swift
NavigationStack {
    ContentView()
        .toolbarVerticalBehavior(.disabled)
}
```

UIKit:

```swift
class MyViewController: UIViewController {
    override var preferredVerticalBarBehavior:
        UIVerticalBarBehavior {
        .disabled
    }
}
```

Opt-out은 전체 앱의 기본 전략보다는 특정 screen/context의 예외로 사용하는 것이 적절하다.

---

# 🧩 주요 API 정리

| 목적 | SwiftUI | UIKit |
|---|---|---|
| System navigation container | `NavigationStack`, `NavigationSplitView` | `UINavigationController`, `UITabBarController` |
| Back/Close 의미 | `.cancellationAction` | `leadingItemGroups`, `leftItemsSupplementBackButton` |
| Prominent action | `.topBarPinnedTrailing` | `pinnedTrailingGroup` |
| Vertical 선호 | `.axisBehavior(.verticalPreferred)` | `axisBehavior = .verticalPreferred` |
| Horizontal 유지 | `.axisBehavior(.horizontalOnly)` | `axisBehavior = .horizontalOnly` |
| Badge | `.badge()` | `badge = .count()` |
| Vertical edge 읽기 | `@Environment(\.toolbarVerticalEdge)` | `traitCollection.verticalBarEdge` |
| Compression | `.toolbarVerticalCompressionBehavior(...)` | `verticalBarCompressionBehavior` |
| Overflow | `ToolbarOverflowMenu` | `additionalOverflowItems` |
| Visibility priority | `.visibilityPriority(...)` | `visibilityPriority` |
| Disable vertical bar | `.toolbarVerticalBehavior(.disabled)` | `preferredVerticalBarBehavior` |

---

# 🔁 System Adaptation 흐름

```text
Existing App
      ↓
Latest SDK로 Rebuild
      ↓
System Navigation Containers 사용
      ↓
Existing Toolbar Placements Audit
      ↓
Symbol + Title 제공
      ↓
Custom Item Axis 설정
      ↓
Vertical Edge에 맞춰 Custom View Adapt
      ↓
Overflow Menu 통합
      ↓
Visibility Priority 설정
      ↓
필요한 화면만 Opt-out
```

---

# 📋 체크리스트

## 기본 구조

- [ ] 최신 SDK로 rebuild
- [ ] SwiftUI navigation container 사용
- [ ] UIKit navigation/tab controller 사용
- [ ] 직접 만든 `UIToolbar` 의존 여부 확인
- [ ] Custom `UINavigationBar` / `UITabBar` 사용 여부 확인
- [ ] System container semantics로 이동 가능한지 검토

## Navigation Item

- [ ] Back/Close가 primary navigation 의미로 선언됐는지 확인
- [ ] SwiftUI에서는 `.cancellationAction` 사용 검토
- [ ] UIKit에서는 leading item group 점검
- [ ] Done/Finish 같은 action은 prominent placement 사용
- [ ] Item의 container 의미를 유지

## Symbol / Text

- [ ] Toolbar item에 symbol 제공
- [ ] Title은 항상 제공
- [ ] Title-only item 최소화
- [ ] Symbol과 text가 중복 의미인지 확인
- [ ] 독립적으로 중요한 text는 horizontal 유지
- [ ] Badge로 대체 가능한 상태 표시인지 검토

## Axis Behavior

- [ ] Custom/complex view의 기본 horizontal behavior 확인
- [ ] Vertical representation을 지원하면 `.verticalPreferred`
- [ ] Text 전환이 중요한 control은 `.horizontalOnly` 검토
- [ ] Related item이 서로 다른 axis로 갈라지지 않는지 확인
- [ ] Portrait/landscape 전환 테스트

## Custom View

- [ ] Fixed vertical bar width에서 clipping 없는지 확인
- [ ] Vertical layout variant 필요 여부 검토
- [ ] `toolbarVerticalEdge` / `verticalBarEdge` 읽기
- [ ] Edge에 따른 padding/alignment 조정
- [ ] Reduce Transparency 상태 확인
- [ ] Scroll-edge background 중복 확인
- [ ] Flexible/fixed spacer 차이 테스트

## Overflow

- [ ] Outer display landscape에서 테스트
- [ ] Keyboard 표시 상태 테스트
- [ ] Toolbar와 tab bar 경쟁 상황 확인
- [ ] Default compression behavior가 앱 목적에 맞는지 확인
- [ ] Task-oriented app은 toolbar 우선 유지 검토
- [ ] Custom overflow를 system menu로 이동
- [ ] Ellipsis를 overflow 외 목적으로 사용하지 않기

## Visibility Priority

- [ ] 자주 쓰는 action에 high priority
- [ ] Compose/New 같은 primary task action 보호
- [ ] Badge/status item의 glanceability 보호
- [ ] Secondary item은 낮은 priority 검토
- [ ] Group 우선순위 먼저 결정
- [ ] Group 내부 item priority 세분화

## Opt-out

- [ ] 실제로 vertical bar가 content를 방해하는지 확인
- [ ] Single-page bottom-heavy UI인지 확인
- [ ] Sheet에 control이 하나뿐인지 확인
- [ ] App 전체 disable보다 screen 단위 disable 우선
- [ ] Opt-out 후 portrait/landscape 일관성 확인

---

# ⚠️ 구현 시 주의할 점

## Custom Bar를 그대로 두고 자동 대응을 기대하지 않는다

`UIToolbar`, `UINavigationBar`, `UITabBar`를 직접 만든 경우 그 item은 navigation container가 관리하는 vertical bar에 자동으로 통합되지 않는다.

Duo 대응에서는 system container로 이동하는 것이 가장 중요하다.

## Symbol-only UI라도 Title은 삭제하지 않는다

Visual은 symbol만 보여도 overflow menu와 expanded form에서는 title이 필요하다.

## RTL이라고 Vertical Edge가 Mirror된다고 가정하지 않는다

Vertical bar는 hardware alignment를 따르기 때문에 custom layout도 실제 `toolbarVerticalEdge`를 읽는 것이 안전하다.

## Overflow를 실패 상태로 생각하지 않는다

Duo에서는 available space가 pose, display, keyboard에 따라 크게 변한다.

Overflow는 예외가 아니라 정상적인 adaptive behavior다.

## Visibility Priority를 모든 Item에 High로 설정하지 않는다

모든 control을 high priority로 만들면 system이 우선순위를 판단할 수 없다.

정말 중요한 item만 보호해야 한다.

---

# 🎯 Design Decision 예

## Mail-like App

```text
Back
Compose
Search
Inbox Badge
Secondary Actions
Tabs
```

권장:

- Back → top
- Compose → high visibility priority
- Inbox badge → glanceability 때문에 보호
- Secondary actions → overflow 허용

## Shopping App

```text
Cart ($123.45)
```

금액이 중요한 독립 정보이므로 symbol-only로 축약하지 않고 horizontal representation 유지가 적절할 수 있다.

## Notes App

```text
New Note
Format
Share
Delete
```

`New Note`는 자주 사용하는 primary action이므로 마지막까지 visible하도록 priority를 높일 수 있다.

---

# 핵심 메시지

iPhone Duo의 vertical bar는 별도의 새로운 navigation system을 다시 만드는 기능이 아니다.

Apple의 방향은 기존 SwiftUI/UIKit의 semantic toolbar와 navigation container를 그대로 사용하면서, system이 device pose와 display geometry에 맞춰 horizontal과 vertical 표현을 자동 선택하게 하는 것이다.

따라서 좋은 Duo 대응은 다음 세 단계로 요약된다.

```text
System Container 사용
        +
Item의 Axis/Representation 준비
        +
Overflow Priority 설계
```

첫째, 최신 SDK로 rebuild하고 `NavigationStack`, `NavigationSplitView`, `UINavigationController`, `UITabBarController`처럼 system이 이해하는 container를 사용해야 한다.

둘째, toolbar item은 symbol과 title을 모두 제공하고, custom view는 vertical representation을 지원하는지 명확히 해야 한다. 필요하면 `AxisBehavior`를 사용해 `.verticalPreferred` 또는 `.horizontalOnly`를 선택한다.

셋째, Duo의 bar 공간은 pose, display, keyboard에 따라 달라지므로 overflow를 정상적인 adaptive layout의 일부로 설계해야 한다. System overflow menu를 사용하고, `visibilityPriority`로 primary action과 glanceable status item을 오래 남긴다.

대부분의 앱은 vertical bar에 자연스럽게 적응할 수 있으며, Calculator 같은 매우 특수한 single-page UI나 control이 하나뿐인 sheet에서만 opt-out을 고려하면 된다.

결국 핵심은 bar를 직접 재설계하는 것이 아니라 **기존 UI의 의미를 system에 정확히 전달해, iPhone Duo가 그 의미를 새로운 axis에 맞춰 재구성하게 만드는 것**이다.

---

# 함께 보면 좋은 자료

- Prepare your app for iPhone Duo — Tech Talks
- What’s new in SwiftUI — WWDC26
- Get to know the new design system — WWDC25
- Designing for iPhone Duo — Human Interface Guidelines
