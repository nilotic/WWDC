# WWDC26 Modernize your AppKit app 요약

- Session: 289
- Title: Modernize your AppKit app
- Source: https://developer.apple.com/videos/play/wwdc2026/289/
- Topic: AppKit, input handling, gesture recognizers, control events, keyboard navigation, status items, state restoration, Liquid Glass, concentric corners
- Chapters: Introduction, Modern input, Modern event handling with gesture recognizers, Selection/context menus/drag and drop, Text selection in custom views, Control events and gesture recognizers, Keyboard navigation and status items, Continuity across launches, Graceful app termination, State restoration, Design updates, Liquid Glass updates in macOS 27, Concentricity, Next steps

---

## 한 줄 요약

현대적인 AppKit 앱은 오래된 `mouseDown` override와 tracking loop를 줄이고 **view 기반 API·control events·gesture recognizers**로 입력 처리를 옮기며, 키보드 탐색과 status item focus를 시스템과 맞추고, `NSWindowRestoration`으로 종료/재실행을 끊김 없이 만들고, macOS 27의 Liquid Glass 및 `NSViewCornerConfiguration`을 활용해 시스템 UI와 조화를 맞춘다.

---

## 핵심 요약

Apple이 이번 세션에서 말하는 “modern AppKit app”은 단순히 최신 API를 쓰는 앱이 아니다. 세 가지 축에서 macOS와 자연스럽게 연결되는 앱이다.

- **Input**: 사용자 입력을 시스템의 현대적인 event handling 모델에 맞춘다.
- **Continuity**: 앱이 종료되어도 다시 열었을 때 이전 상태를 자연스럽게 복원한다.
- **Look and feel**: macOS 27의 Liquid Glass와 corner concentricity 등 최신 디자인 언어를 따른다.

세션에서 가장 반복적으로 강조하는 전환은 다음과 같다.

```text
mouseDown override / tracking loop
              ↓
Dedicated view API
Control events
Gesture recognizers
```

즉, 직접 이벤트를 계속 추적하는 방식보다 **사용자의 의도에 맞는 시스템 수준 API를 선택**하는 것이 현대 AppKit의 방향이다.

---

# 🖱️ Modern input

Mac은 처음부터 keyboard와 mouse를 중심으로 발전했고, AppKit의 전통적인 interaction 구현 방식에는 `mouseDown` override와 tracking loop가 많이 사용되어 왔다.

하지만 현재 Mac에는 다음 UI framework가 함께 존재한다.

- AppKit
- SwiftUI
- UIKit through Mac Catalyst

이 세 framework가 공통적으로 사용하는 interaction 언어가 **gesture recognizer**다.

Apple은 modern AppKit event handling을 다음 세 단계로 나눈다.

1. 가능한 경우 **view 자체가 제공하는 전용 API** 사용
2. 표준 control interaction이면 **control events** 사용
3. 더 복잡한 interaction이면 **gesture recognizer** 사용

필요하다면 custom `NSGestureRecognizer` subclass까지 만들 수 있다.

---

# 🧭 `mouseDown` override를 먼저 찾아야 하는 이유

기존 AppKit 코드에서 `mouseDown`을 override하는 대표 목적은 다음과 같다.

- Selection
- Context menu
- Drag and drop
- Text selection

하지만 이 네 영역 모두 현대 AppKit에는 더 적합한 dedicated API가 있다.

따라서 modernization을 시작할 때 codebase 전체에서 `mouseDown` override를 찾고, 각각의 의도를 파악한 뒤 전용 API로 치환하는 것이 좋은 출발점이다.

---

# ✅ Selection은 view 상태와 delegate callback으로

Selection을 추적하기 위해 직접 `mouseDown`을 처리할 필요가 없다.

예를 들어 다음 타입은 selection 상태를 자체적으로 관리한다.

- `NSCollectionViewItem`
- `NSTableRowView`

해당 타입의 `selected` property를 관찰하거나 delegate callback을 사용한다.

대표 delegate:

- `NSTableViewDelegate`
- `NSOutlineViewDelegate`

핵심은 “마우스가 눌렸다”가 아니라 **“selection이 바뀌었다”**라는 사용자 의도 수준의 변화를 관찰하는 것이다.

---

# 🧾 Context menu는 전용 menu API로

View에서 context menu를 제공하는 방법은 세 가지다.

## 모든 instance가 같은 menu를 사용할 때

`NSView.defaultMenu`

## 각 responder마다 다른 menu가 필요할 때

`NSResponder.menu`

## event마다 동적으로 menu를 구성할 때

`NSView.menuForEvent`

즉 context menu를 표시하기 위해 직접 right-click을 해석하는 대신, AppKit의 menu presentation 경로를 이용한다.

---

# 📦 Drag and drop은 modern dragging delegate로

Collection 계열 UI에서 drag를 시작하기 위해 직접 mouse tracking을 하지 않고 modern dragging delegate를 사용한다.

세션의 `NSTableView` 예제:

```swift
func tableView(
    _ tableView: NSTableView,
    pasteboardWriterForRow row: Int
) -> (any NSPasteboardWriting)? {
    let pasteboardItem = NSPasteboardItem()
    pasteboardItem.setString(..., forType: .string)
    return pasteboardItem
}
```

비슷한 API가 다음에도 제공된다.

- `NSCollectionView`
- `NSOutlineView`
- `NSBrowser`

AppKit에게 “이 row를 drag할 때 어떤 pasteboard data를 제공하는가”를 알려주는 형태다.

---

# ✍️ Custom view의 text selection: `NSTextSelectionManager`

macOS 27에서는 `NSTextView` 밖의 custom view에도 classic macOS text selection behavior를 붙일 수 있는 새 API가 추가된다.

**`NSTextSelectionManager`**

View에 연결하고 text selection data source를 구성하면 다음과 같은 동작을 가져올 수 있다.

- Bidirectional selection
- Text drag and drop
- Selection toggling
- 기타 macOS 표준 text selection behavior

직접 `mouseDown` / drag loop로 selection gesture를 재구현하는 대신 system behavior를 재사용할 수 있다.

---

# 🎛️ AppKit의 Control Events

UIKit의 control events에 익숙하다면 AppKit에서도 같은 사고방식을 사용할 수 있다.

Control event는 standard Mac control의 tracking state 변화에 반응한다.

예:

```swift
let button = NSButton()
button.addTarget(
    self,
    action: #selector(trackingEndedOutsideHandler),
    for: .trackingEndedOutside
)
```

중요한 점은 이 interaction을 구현하기 위해 `NSButton` subclass가 필요하지 않다는 것이다.

세션은 상당수 control event가 실제로 **OS X 10.11부터 사용 가능**했다고 설명한다. 즉 새로 생긴 개념이라기보다, 기존 AppKit 앱이 오래된 tracking code에서 벗어나도록 다시 강조되는 현대적 패턴이다.

---

# 👆 Gesture recognizer를 사용할 때

표준 control event만으로 충분하지 않으면 standard gesture recognizer를 view에 추가한다.

더 세밀한 interaction이 필요하면 custom gesture recognizer subclass를 만든다.

Apple은 gesture recognizer를 AppKit뿐 아니라 SwiftUI/UIKit과도 통하는 공통 interaction model로 설명한다.

---

# ⚠️ Overlapping sibling view와 hit testing

Gesture recognizer는 view와 subview를 대상으로 동작한다. 그런데 sibling view가 겹쳐 있으면 예상치 못하게 mouse event를 가로막을 수 있다.

Control이 click에 반응하지 않는다면 먼저 overlapping sibling view를 확인해야 한다.

가능한 해결책:

1. View frame을 조정해 overlap을 없앤다.
2. Overlay 성격의 view라면 `hitTest`를 override하여 아래 content로 event가 통과하도록 한다.

```swift
override func hitTest(_ point: NSPoint) -> NSView? {
    return nil
}
```

이 경우 overlay 자체는 hit target이 되지 않는다.

---

# ⌨️ Keyboard navigation

현대적인 Mac 앱은 mouse만 잘 동작해서는 부족하다. Keyboard input은 속도와 accessibility 양쪽에서 중요하다.

System Settings에서 control keyboard navigation이 활성화되어 있으면 사용자는 `Tab` / `Shift-Tab`으로 focus를 이동한다.

AppKit에서 이 순서를 **key view loop**라고 한다.

View hierarchy가 동적으로 바뀌는 앱에서는 window에 다음 설정을 켜는 것이 중요하다.

```swift
window.autorecalculatesKeyViewLoop = true
```

이 값을 켜면 view가 추가되거나 제거될 때 AppKit이 key view loop를 다시 계산한다.

끄거나 설정하지 않으면 앱이 직접 key view loop를 유지해야 한다.

---

# 🧭 Status item keyboard navigation

Keyboard navigation은 앱 window 안에서 끝나지 않는다. Menu bar와 status item까지 이어진다.

Status item이 일반 menu를 보여주는 경우는 menu bar item과 비슷하게 동작한다.

하지만 status item이 다음 역할을 할 수도 있다.

- Action trigger
- Transient UI trigger
- Custom window trigger

---

# 🔘 Action을 수행하는 `NSStatusItem`

`NSStatusItem.button`에 target/action을 설정하면 일반 button처럼 동작한다.

Keyboard navigation으로 status item에 focus가 간 상태에서 Return을 누르면 action이 자동으로 실행된다.

Custom view를 쓰는 경우 `NSStatusItem.view`에 view를 설정하고 status item에 target/action을 연결한다.

---

# 🪟 Expanded Interface Session

Status item이 custom window 같은 임시 UI를 표시한다면 AppKit이 해당 UI의 활성 상태를 알아야 keyboard focus를 올바르게 관리할 수 있다.

이를 위해 **expanded interface session API**를 사용한다.

설정:

```swift
@main
class LightAppDelegate: NSObject, NSApplicationDelegate {
    lazy var lightStatusItem: NSStatusItem = { ... }()

    func applicationDidFinishLaunching(_ notification: Notification) {
        // ...
        lightStatusItem.expandedInterfaceDelegate = self
    }
}
```

Delegate 구현:

```swift
extension LightAppDelegate: NSStatusItemExpandedInterfaceDelegate {
    func statusItem(
        _ statusItem: NSStatusItem,
        didBegin session: NSStatusItemExpandedInterfaceSession
    ) {
        // Show window
    }

    func statusItemDidEndExpandedInterfaceSession(
        _ statusItem: NSStatusItem,
        animated: Bool
    ) {
        // Hide window
    }
}
```

AppKit이 session 시작/종료를 알리고 앱은 window를 show/hide한다.

---

# ❌ Expanded session 종료

사용자가 custom UI에서 action을 선택해 더 이상 window가 필요 없으면 session을 cancel한다.

```swift
lightStatusItem.expandedInterfaceSession?.cancel()
```

Focus가 자연스럽게 다른 곳으로 이동하면 AppKit이 session을 대신 cancel할 수도 있다.

SwiftUI의 menu bar extras는 이런 lifecycle 관리 상당 부분을 대신해준다.

---

# 🔄 Continuity across launches

Apple이 말하는 좋은 Mac 앱은 quit과 relaunch가 거의 끊김 없이 느껴져야 한다.

사용자는 언제든 앱을 종료할 수 있어야 하고, 시스템 역시 overnight software update 같은 이유로 restart가 필요할 수 있다.

따라서 앱은 **정말 필요한 경우가 아니면 종료를 막지 않아야 한다.**

---

# 🚪 Graceful application termination

Window가 sheet나 modal을 띄우고 있으면 window가 닫히지 못하고, 결국 앱 종료도 막힐 수 있다.

`NSWindow.preventsApplicationTerminationWhenModal`의 기본값은 `true`다.

Document save처럼 사용자의 intervention이 반드시 필요한 경우에는 이 기본값이 안전하다.

반대로 단순 정보성 sheet처럼 종료를 막을 이유가 없다면:

```swift
window.preventsApplicationTerminationWhenModal = false
```

로 설정한다.

핵심 판단:

```text
이 modal이 해결되지 않으면 data loss가 발생하는가?

Yes → 종료 차단 유지
No  → 종료 허용 검토
```

---

# 💾 State restoration 전체 흐름

AppKit state restoration은 세 단계다.

```text
1. Opt in
2. Encode UI state
3. Decode + reconstruct UI
```

세션은 `NSWindowRestoration` 기반으로 이 흐름을 설명한다.

---

# 🆔 Window identifier와 autosave name

먼저 window가 복원 대상임을 식별할 수 있어야 한다.

```swift
@MainActor
class MainWindowController: NSWindowController, NSWindowDelegate {
    convenience init() {
        let window = NSWindow(...)

        window.identifier = NSUserInterfaceItemIdentifier(
            WindowIdentifiers.mainWindow
        )
        window.setFrameAutosaveName(WindowIdentifiers.mainWindow)
        window.isRestorable = true
        window.restorationClass = WindowRestorationHandler.self
    }
}
```

일반적인 main/preferences window는 autosave name을 지정하면 같은 active space와 frame으로 복원하는 데 도움이 된다.

Document window에는 별도의 autosave name이 필요하지 않다고 세션에서 설명한다.

---

# ♻️ `isRestorable`

```swift
window.isRestorable = true
```

를 켜면 AppKit이 window와 responder의 restorable state encoding/restoration path를 사용할 수 있다.

AppKit이 자동으로 복원하는 window 상태 예:

- Minimized 여부
- Frontmost window
- Full screen 여부

---

# 🏗️ `restorationClass`

```swift
window.restorationClass = WindowRestorationHandler.self
```

App이 다시 실행될 때 이 class가 window 자체를 복원하는 역할을 맡는다.

---

# 📦 `encodeRestorableState`

UI를 재구성하는 데 필요한 상태를 coder에 저장한다.

```swift
override func encodeRestorableState(with coder: NSCoder) {
    super.encodeRestorableState(with: coder)

    coder.encode(
        selectedProduct?.identifier.uuid,
        forKey: RestorationKeys.productIdentifier
    )
}
```

반드시 `super` 구현도 호출해야 한다.

---

# ⚠️ State restoration에 저장하지 말아야 할 것

Apple은 document나 database 자체에 이미 존재하는 data를 다시 state restoration archive에 복제하지 말라고 설명한다.

State restoration의 목적은:

> 앱의 전체 data를 다시 serialize하는 것

이 아니라

> 이전 UI 상태를 재구성할 수 있을 만큼의 정보만 저장하는 것

이다.

예를 들어 selected product 전체 model을 저장하기보다 identifier만 저장하고, 복원할 때 실제 data source에서 다시 가져오는 식이다.

---

# 🧩 View 단위 state restoration

모든 `NSResponder`는 restorable state encoding method를 override할 수 있다.

따라서 window controller뿐 아니라 view 수준에서도 필요한 상태를 보존할 수 있다.

---

# 🔔 `invalidateRestorableState()`

`encodeRestorableState`는 상태가 invalidated되었을 때 호출된다.

UI hierarchy 또는 복원해야 할 상태가 변하면 다음을 호출한다.

```swift
splitViewController.onProductSelected = { [weak self] product in
    self?.invalidateRestorableState()
}
```

이후 적절한 시점에 AppKit이 invalidated object의 state를 다시 encode한다.

즉 매 변경마다 즉시 archive를 직접 쓰는 방식이 아니다.

---

# 🪟 `restoreWindow(withIdentifier:)`

앱 재실행 후 먼저 window를 복구해야 한다.

```swift
class WindowRestorationHandler: NSObject, NSWindowRestoration {
    static func restoreWindow(
        withIdentifier identifier: NSUserInterfaceItemIdentifier,
        state: NSCoder,
        completionHandler: @escaping (NSWindow?, Error?) -> Void
    ) {
        if identifier == .mainWindow,
           let window = appDelegate.mainWindowController?.window {
            completionHandler(window, nil)
        } else if identifier == .imageWindow {
            let controller = ImageWindowController()
            appDelegate.imageWindowControllers.append(controller)
            completionHandler(controller.window, nil)
        } else {
            completionHandler(nil, error)
        }
    }
}
```

가장 중요한 운영 규칙은 **completion handler를 반드시 호출하는 것**이다.

AppKit은 모든 restorable window를 기다린다.

즉 즉시 호출할 수 없다면 handler를 보관했다가 나중에라도 반드시 호출해야 한다.

Window 생성 실패 역시 error와 함께 completion handler로 알려야 한다.

---

# 🔓 `restoreState(with:)`

Window 자체가 복원된 다음 UI state를 복구한다.

```swift
override func restoreState(with coder: NSCoder) {
    super.restoreState(with: coder)

    if let productId = coder.decodeObject(
        of: [NSString.self],
        forKey: RestorationKeys.productIdentifier
    ) as? String {
        splitViewController?.selectedProductId = productId
    }
}
```

여기서 identifier를 decode하고, 필요한 실제 data를 fetch해 이전 UI 상태를 재구성한다.

---

# 🧠 State restoration의 mental model

```text
Quit 이전

UI state changes
      ↓
invalidateRestorableState()
      ↓
encodeRestorableState()
      ↓
Restoration archive

Relaunch

Window identifier
      ↓
NSWindowRestoration
      ↓
restoreWindow(...)
      ↓
Window 생성
      ↓
restoreState(...)
      ↓
UI 재구성
```

이 패턴을 제대로 구현하면 user가 직접 quit했든 Mac이 restart되었든 이전 상태로 자연스럽게 돌아올 수 있다.

---

# 🎨 macOS 27 디자인 업데이트

macOS 26에서 도입된 Liquid Glass는 macOS 27에서도 계속 발전한다.

AppKit 앱이 macOS 26에서 이미 Liquid Glass를 채택했다면 macOS 27에서 여러 개선을 자동으로 받는다.

세션에서 언급한 변화:

- Free-floating text가 있는 title bar에서 automatic `NSScrollEdgeEffectStyle`이 hard-edge effect로 resolve
- Sidebar가 window edge까지 확장
- Sidebar selection text가 semi-bold emphasis 사용
- Content는 sidebar 뒤로 계속 흐름
- Sidebar 위 bordered toolbar item도 Liquid Glass 채택

즉 일부 변화는 새로운 코드를 작성하지 않아도 system update로 반영된다.

---

# 🫧 Interactive Glass effect

macOS 27에서는 glass가 클릭되었을 때 미세하게 bounce하는 새로운 interactive effect가 추가된다.

Apple Maps의 일부 custom control이 이 동작을 사용한다.

다만 모든 glass surface에 적용하는 것은 적절하지 않다.

적합한 대상:

- Controls
- Buttons
- Interactive controls를 포함한 glass container

세션의 표현대로 **“A little goes a long way.”** 즉 과도하게 사용하지 않는 것이 중요하다.

---

# ⭕ Concentricity

Apple platform의 rounded rectangle은 hardware bezel부터 control/container까지 오랫동안 반복되어 온 형태다.

문제는 container corner 근처에 있는 child view의 radius가 container 곡률과 따로 놀면 시각적으로 어색해진다는 것이다.

macOS 27 AppKit은 이를 해결하기 위한 **concentricity API**를 제공한다.

원칙:

> Container corner에 가까운 view일수록 자신의 corner radius도 container 곡률을 따라야 한다.

---

# 🧩 `NSViewCornerConfiguration`

Custom view에서 `cornerConfiguration`을 override한다.

```swift
class LocalWeatherView: NSView {
    override var cornerConfiguration: NSViewCornerConfiguration? {
        let radius: NSViewCornerRadius =
            .containerConcentric(minimumCornerRadius)

        return .uniformCorners(radius: radius)
    }
}
```

핵심 API:

```swift
NSViewCornerRadius.containerConcentric(...)
```

이 값은 enclosing container를 기준으로 적절한 corner radius를 계산한다.

Minimum radius도 지정할 수 있어서 container geometry와 무관하게 최소 둥근 정도를 유지할 수 있다.

`uniformCorners`를 사용하면 네 corner에 동일 radius를 적용하는 rounded rectangle을 구성한다.

---

# 🧱 Modern AppKit 입력 패턴 비교

| 기존 접근 | 현대 접근 | 이유 |
|---|---|---|
| `mouseDown`으로 selection 직접 추적 | `selected` property / delegate | 사용자 의도 수준 API |
| 우클릭 직접 해석 | `menu`, `defaultMenu`, `menuForEvent` | 시스템 context menu 흐름 활용 |
| Drag tracking 직접 구현 | pasteboard writer delegate | Collection container API 활용 |
| Custom text drag-selection | `NSTextSelectionManager` | 표준 macOS text selection behavior |
| Control tracking loop | `NSControl.Events` | tracking state event 직접 수신 |
| Raw event handling | `NSGestureRecognizer` | AppKit/SwiftUI/UIKit 공통 interaction model |

---

# ⌨️ Keyboard/Status Item 체크 포인트

- Window hierarchy가 변하면 `autorecalculatesKeyViewLoop` 사용 검토
- Tab / Shift-Tab으로 모든 주요 control을 접근 가능한지 확인
- Status item button에 target/action 연결
- Custom status item UI는 expanded interface session 사용
- Session 종료 시 필요하면 `cancel()` 호출
- Mouse로만 가능한 interaction이 남아 있지 않은지 점검

---

# 💾 State restoration 체크 포인트

- Window identifier 지정
- 일반 window에는 autosave name 검토
- `window.isRestorable = true`
- `window.restorationClass` 지정
- `encodeRestorableState`에서 UI reconstruction 정보 저장
- `super.encodeRestorableState` 호출
- DB/document data 자체를 중복 serialize하지 않기
- 상태 변화 시 `invalidateRestorableState()` 호출
- `restoreWindow` completion handler 반드시 호출
- `restoreState`에서 identifier 기반으로 실제 data를 다시 연결
- Minimized/fullscreen/frontmost 같은 자동 복원 동작도 확인

---

# 📋 AppKit Modernization 체크리스트

## Input

- [ ] `mouseDown` override 검색
- [ ] Selection code를 dedicated API로 이전
- [ ] Context menu를 `menu` / `menuForEvent`로 이전
- [ ] Drag code를 modern pasteboard delegate로 이전
- [ ] Custom text selection에 `NSTextSelectionManager` 검토
- [ ] Standard controls에 control event 사용 가능 여부 확인
- [ ] Custom interaction은 gesture recognizer로 이전
- [ ] Overlapping sibling view의 hit testing 확인
- [ ] Overlay가 interaction을 막는다면 `hitTest` 전략 검토

## Keyboard

- [ ] Keyboard navigation 활성 상태에서 테스트
- [ ] `Tab` / `Shift-Tab` focus 순서 검증
- [ ] Dynamic hierarchy에 `autorecalculatesKeyViewLoop` 적용 검토
- [ ] Menu bar/status item keyboard interaction 확인
- [ ] Custom status item UI의 expanded session 구현

## Termination

- [ ] 앱 종료를 막는 modal/sheet 목록 확인
- [ ] 실제 user intervention이 필요한 modal만 termination 차단
- [ ] 불필요한 modal에 `preventsApplicationTerminationWhenModal = false` 적용 검토

## Restoration

- [ ] Main/preferences window identifier 지정
- [ ] Autosave frame 이름 설정
- [ ] Restorable 여부 활성화
- [ ] Restoration class 구현
- [ ] UI identifier/state encoding
- [ ] State invalidation path 구현
- [ ] Window recreation path 구현
- [ ] Completion handler 누락 여부 점검
- [ ] UI state decode 및 data fetch 구현

## Design

- [ ] macOS 27에서 기존 Liquid Glass UI 재검증
- [ ] Sidebar/titlebar/toolbar 자동 변화 확인
- [ ] Interactive glass effect가 실제 control에만 사용되는지 확인
- [ ] Container corner 주변 custom view의 concentricity 검토
- [ ] `NSViewCornerConfiguration` 적용 대상 확인

---

# ⚠️ 구현 시 주의점

## `mouseDown`을 무조건 gesture recognizer로 바꾸는 것이 아니다

Apple이 제시한 우선순위는 다음에 가깝다.

```text
Dedicated view API
        ↓
Control event
        ↓
Gesture recognizer
        ↓
Custom gesture recognizer
```

이미 selection, context menu, dragging처럼 목적에 맞는 API가 있다면 그것을 먼저 사용한다.

## Hit testing 문제를 gesture recognizer bug로 착각하지 않는다

Sibling view overlap 때문에 event가 가로막힐 수 있다. Gesture recognizer 자체보다 hierarchy/hit testing을 먼저 점검해야 한다.

## Restoration archive를 앱 data store로 사용하지 않는다

복원을 위한 최소 UI identity/state만 저장하고 실제 business data는 document/database에서 다시 가져온다.

## `restoreWindow` completion handler를 잊지 않는다

AppKit이 모든 restorable window의 completion을 기다리기 때문에 누락 시 복원 흐름이 막힐 수 있다.

## 모든 glass에 interactive effect를 넣지 않는다

Control이나 interactive container에 제한적으로 사용한다.

---

# 🔁 전체 현대화 흐름

```text
Legacy AppKit codebase
        ↓
Find mouseDown / tracking loops
        ↓
Map each intent
        ↓
View API / Control Events / Gestures
        ↓
Keyboard navigation audit
        ↓
Status item focus lifecycle
        ↓
Graceful termination audit
        ↓
NSWindowRestoration
        ↓
macOS 27 visual audit
        ↓
Liquid Glass + Concentricity
```

---

# 🧠 세션의 핵심 메시지

이번 세션의 메시지는 AppKit을 SwiftUI로 교체하라는 것이 아니다.

오히려 **AppKit 자체가 현대 macOS와 조화를 이루도록 제공하는 최신 API를 활용하라**는 내용이다.

세션의 마지막 권장 사항을 압축하면 네 가지다.

1. `mouseDown` override를 찾아 **view API, control events, gesture recognizers**로 옮긴다.
2. 앱을 **mouse와 keyboard 모두에서 완전하게 사용 가능**하게 만든다.
3. Quit/relaunch가 끊기지 않도록 **graceful termination과 state restoration**을 구현한다.
4. macOS 27 UI에서는 **Liquid Glass와 concentric corner geometry**를 시스템과 일치시킨다.

결국 현대적인 AppKit 앱은 오래된 codebase를 전면 재작성하지 않고도, 입력·복원·디자인 경계에서 시스템 기능을 더 많이 맡김으로써 크게 개선할 수 있다.

---

# 함께 보면 좋은 자료

- Use SwiftUI with AppKit and UIKit — WWDC26
- Restoring your app’s state with AppKit
- Gestures documentation
- TN3212: Adopting gesture recognizers for Sidecar touch support
- `NSControl.Events`
