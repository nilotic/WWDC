# WWDC26 — Use SwiftUI with AppKit and UIKit

- **Session:** 272
- **Speaker:** David Nadoba, UI Frameworks Engineer
- **Source:** https://developer.apple.com/videos/play/wwdc2026/272/
- **Basis:** Apple Developer 공식 전체 transcript 및 Code 섹션
- **Primary demo:** macOS / AppKit
- **Scope:** AppKit·UIKit 앱에 SwiftUI를 점진적으로 도입하는 방법

---

## 🎯 한 줄 요약

기존 AppKit/UIKit 앱을 SwiftUI로 전면 재작성할 필요는 없다. 먼저 **Observation으로 기존 view를 자동 갱신**하고, 새로 만드는 컴포넌트는 **hosting view**로 SwiftUI를 삽입하며, 기존 gesture recognizer는 representable로 재사용하고, 메뉴와 완전한 SwiftUI scene까지 단계적으로 추가할 수 있다.

---

## 🧭 세션 구성

| 시간 | 챕터 |
|---|---|
| 0:00 | Introduction |
| 2:33 | Observation in AppKit |
| 5:41 | Hosting SwiftUI in AppKit |
| 7:48 | AppKit gestures in SwiftUI |
| 9:16 | SwiftUI in the main menu |
| 11:30 | SwiftUI scenes in AppKit |
| 13:04 | Next steps |

세션의 실제 데모는 AppKit 기반 조명 제어 앱이다. 하지만 Apple은 같은 원칙이 UIKit을 포함한 다른 Apple 플랫폼에도 적용된다고 설명한다.

---

# 🧩 SwiftUI 도입은 “재작성”이 아니라 “혼합”

SwiftUI는 처음부터 AppKit/UIKit과 함께 사용하도록 설계되었다. Apple 내부 앱도 같은 방식으로 점진적으로 도입하고 있다.

세션이 보여주는 단계는 다음과 같다.

1. 기존 AppKit/UIKit 모델을 `@Observable`로 전환
2. 기존 `NSView`/`UIView`의 자동 업데이트에 Observation 활용
3. 새 컴포넌트를 SwiftUI로 작성
4. `NSHostingView`/대응 UIKit hosting API로 기존 view hierarchy에 삽입
5. 기존 gesture recognizer를 SwiftUI에서 재사용
6. 앱의 기존 main menu 일부를 SwiftUI로 구성
7. 기존 AppDelegate를 유지하면서 SwiftUI `Scene` 추가

핵심은 **아키텍처 경계를 한 번에 바꾸지 않는 것**이다.

---

# 👀 Observation을 AppKit/UIKit에서 먼저 사용하기

세션의 첫 번째 예제는 SwiftUI를 쓰지 않고도 Observation을 도입하는 방법이다.

조명 앱의 color picker는 hue, saturation, brightness 세 값을 사용한다. 한 slider 값이 바뀌면 그 slider 자신뿐 아니라 다른 slider의 gradient와 knob도 다시 그려야 한다.

기존 AppKit 구현에서는 다른 slider에 직접 `needsDisplay = true`를 설정해야 한다. 값이 늘어나거나 외부 변경 경로가 추가될수록 수동 invalidation 코드가 계속 증가한다.

## `@Observable` 모델

```swift
import Observation

@Observable @MainActor
final class ColorModel {
    var hue: Double = 0.6
    var saturation: Double = 1.0
    var brightness: Double = 1.0
}
```

`@Observable`을 붙이면 mutable property가 Observation 시스템에 참여한다.

### AppKit의 자동 dependency tracking

`NSSliderCell`의 `drawKnob`, `drawBar` 같은 drawing 메서드 안에서 `ColorModel`의 property를 읽으면 AppKit이 어떤 값이 사용되었는지를 추적한다. 이후 해당 값이 바뀌면 필요한 drawing path가 자동으로 다시 실행된다.

즉 다음 형태의 코드가 줄어든다.

```swift
otherSlider.needsDisplay = true
```

중요한 점은 Observation 지원이 `NSView.draw(_:)` 하나에만 한정되지 않는다는 것이다.

AppKit에서 세션이 언급한 자동 tracking 지점:

- `draw(_:)`
- `NSSliderCell.drawKnob`
- `NSSliderCell.drawBar`
- `updateConstraints()`
- `layout()`
- `updateLayer()`
- 대응되는 `NSViewController` lifecycle/update 메서드

UIKit은 `UIView`, `UIViewController`를 넘어 `UIButton`, `UICollectionViewCell` 등 더 많은 영역에서 Observation tracking을 지원한다.

## 이전 OS로 back-deploy

2026 OS부터는 이 통합이 기본 활성화된다. 이전 OS로 back-deploy하려면 Info.plist 설정을 사용할 수 있다.

| Framework | Back-deployment | Info.plist key |
|---|---:|---|
| AppKit | macOS 15 | `NSObservationTrackingEnabled` |
| UIKit | iOS 18 | `UIObservationTrackingEnabled` |

### 실무 의미

SwiftUI를 당장 도입하지 않아도 모델을 먼저 `@Observable`로 바꾸면 이점이 있다.

- 기존 AppKit/UIKit view의 수동 invalidation 감소
- 동일 모델을 나중에 SwiftUI view에서 그대로 재사용 가능
- UI framework 사이의 model layer 공유가 쉬워짐
- 점진적 마이그레이션의 첫 단계로 위험이 작음

---

# 🎨 새 컴포넌트는 SwiftUI로 작성하기

세션의 color picker를 기존 세 개의 linear slider에서 완전히 다른 circular UI로 다시 설계한다.

- 바깥 ring: Hue
- 내부 왼쪽 semicircle: Saturation
- 내부 오른쪽 semicircle: Brightness
- 중앙 circle: 최종 color preview

기존 drawing/interaction 구현과 거의 공유할 부분이 없으므로 Apple은 이런 시점을 **새 컴포넌트를 SwiftUI로 옮기기 좋은 순간**으로 제시한다.

## `Canvas`

SwiftUI의 `Canvas`는 immediate-mode drawing API다.

개념적으로 AppKit/UIKit의 custom drawing과 비슷하다.

```swift
Canvas { context, size in
    let metrics = PickerMetrics(size: size)
    drawPicker(
        in: &context,
        metrics: metrics,
        hue: hue,
        saturation: saturation,
        brightness: brightness
    )
}
```

각 redraw마다 새로운 `GraphicsContext`를 받고 다음과 같은 drawing operation을 수행할 수 있다.

- stroke
- fill
- transform
- filter

기존 Core Graphics 코드를 계속 사용해야 하는 경우 `withCGContext`를 활용할 수 있다.

### Migration 판단 기준

기존 컴포넌트를 SwiftUI로 옮기기 좋은 시점:

- 새 UI를 처음 구현할 때
- 기존 UI를 대규모로 재설계할 때
- interaction model까지 함께 바뀔 때
- 모델은 유지할 수 있지만 view 구현은 대부분 다시 작성해야 할 때

반대로 안정적으로 동작하는 AppKit/UIKit view를 단순히 “SwiftUI 비율을 높이기 위해” 다시 작성할 필요는 없다.

---

# 🪟 `NSHostingView`로 기존 hierarchy에 삽입

새 `HSBColorPicker`를 만들었어도 앱 전체가 AppKit인 상황은 그대로다.

SwiftUI view를 `NSHostingView`로 감싸면 일반 `NSView`처럼 기존 hierarchy에 넣을 수 있다.

```swift
NSHostingView(
    rootView: HSBColorPicker(model: model)
)
```

`NSHostingView` 자체가 `NSView` subclass이므로 기존 layout, container, window hierarchy를 유지할 수 있다.

여기에서 앞 단계의 `@Observable`이 중요하다. AppKit view와 SwiftUI view가 **같은 `ColorModel` instance**를 공유할 수 있기 때문이다.

### 권장 migration boundary

```text
Existing AppKit/UIKit hierarchy
        │
        ├── legacy native views
        │
        └── Hosting View
              │
              └── new SwiftUI component
                     │
                     └── shared @Observable model
```

즉, 화면 전체가 아니라 **컴포넌트 경계**를 migration boundary로 사용할 수 있다.

---

# 👆 기존 AppKit gesture를 SwiftUI에서 재사용

Circular color picker에는 trackpad의 force click으로 saturation과 brightness를 100%로 복구하는 동작이 있다.

기존 앱에는 이미 custom `NSGestureRecognizer`가 있으므로 이를 다시 작성하지 않고 SwiftUI에 연결한다.

## `NSGestureRecognizerRepresentable`

```swift
struct ForceClickReset: NSGestureRecognizerRepresentable {
    var model: ColorModel

    func makeNSGestureRecognizer(context: Context) -> ForceClickGestureRecognizer {
        ForceClickGestureRecognizer()
    }

    func handleNSGestureRecognizerAction(
        _ recognizer: ForceClickGestureRecognizer,
        context: Context
    ) {
        withAnimation {
            model.saturation = 1
            model.brightness = 1
        }
    }
}
```

Custom recognizer 자체는 기존 AppKit 구현을 유지한다.

```swift
final class ForceClickGestureRecognizer: NSGestureRecognizer {
    private var didActivate = false

    override func pressureChange(with event: NSEvent) {
        if event.stage >= 2 && !didActivate {
            didActivate = true
            state = .ended
        }
    }
}
```

SwiftUI에서는 일반 gesture처럼 `.gesture(...)` modifier에 추가한다.

세션에서는 이 custom force-click gesture가 기존 drag gesture와 함께 동작한다.

## Representable의 의미

새 API 때문에 기존 native 구현을 모두 버릴 필요가 없다.

SwiftUI는 다음과 같은 bridge pattern을 제공한다.

- `NSGestureRecognizerRepresentable`
- `NSViewRepresentable`
- UIKit의 대응 representable 패턴

따라서 SwiftUI로 이동하는 중에도 검증된 native component와 input 처리 코드를 계속 활용할 수 있다.

---

# ♿ 특정 입력 장치에만 의존하지 않기

Force Click은 모든 Mac 입력 장치에서 사용할 수 없다. 세션은 Magic Mouse나 일부 MacBook trackpad처럼 force click을 지원하지 않는 상황을 언급한다.

따라서 동일 기능에 다음 대체 접근을 제공한다.

- Main menu item
- Keyboard shortcut

이 부분은 migration 기술 이상의 중요한 디자인 원칙이다.

**특수 gesture는 shortcut일 수 있지만 유일한 접근 경로여서는 안 된다.**

---

# ☰ 기존 `NSMenu`에 SwiftUI 메뉴 넣기

앱 전체 main menu는 여전히 AppKit의 `NSMenu`로 관리하면서 특정 submenu만 SwiftUI로 만들 수 있다.

SwiftUI에서는 `Button`, `Divider`, `Picker`, `keyboardShortcut`을 이용해 `ColorMenu`를 구성한다.

예를 들어:

```swift
Button("Full Intensity") {
    withAnimation {
        model.saturation = 1
        model.brightness = 1
    }
}
.keyboardShortcut(.upArrow, modifiers: [.command, .shift])
```

그리고 AppKit 쪽에서는 `NSHostingMenu`로 bridge한다.

```swift
let colorMenu = NSHostingMenu(
    rootView: ColorMenu(model: colorModel)
)
colorMenu.title = "Color"

let colorMenuItem = NSMenuItem()
colorMenuItem.submenu = colorMenu
mainMenu.addItem(colorMenuItem)
```

`NSHostingMenu`는 `NSMenu` subclass이므로 기존 AppKit menu hierarchy에 그대로 삽입할 수 있다.

### 이 접근의 장점

- 메뉴 command의 상태와 view 상태가 같은 `@Observable` model을 공유
- SwiftUI의 `Button`, `Picker`, animation, keyboard shortcut API 사용
- 기존 main menu 전체를 바꿀 필요 없음
- AppKit 메뉴와 SwiftUI 메뉴가 동시에 공존 가능

세션의 palette picker는 Red, Yellow, Green, Cyan, Blue, Purple 같은 common color를 빠르게 선택하는 용도로 사용된다.

---

# 🪟 기존 `NSApplicationDelegate`에 완전한 SwiftUI Scene 추가

컴포넌트나 메뉴 수준을 넘어 이제 SwiftUI의 완전한 `Scene`을 기존 AppKit 앱에 추가한다.

예제에서는 조명을 빠르게 조작할 수 있는 **Menu Bar Extra**와 설정 화면을 추가한다.

핵심 bridge는 `NSHostingSceneRepresentation`이다.

```swift
func applicationWillFinishLaunching(_ notification: Notification) {
    let scenes = NSHostingSceneRepresentation {
        LightMenuBarExtra(appModel: model)
        LightSettings(appModel: model)
    }

    NSApplication.shared.addSceneRepresentation(scenes)
}
```

이 방식은 앱의 기존 `NSApplicationDelegate` architecture를 유지하면서 SwiftUI scene lifecycle을 추가한다.

Apple은 scene을 추가하기 좋은 지점으로 `applicationWillFinishLaunching`을 사용한다.

---

# 💡 `MenuBarExtra`를 동적으로 추가·제거

SwiftUI의 `MenuBarExtra` scene을 사용하면 적은 코드로 menu bar interface를 만들 수 있다.

```swift
struct LightMenuBarExtra: Scene {
    var appModel: AppModel

    var body: some Scene {
        MenuBarExtra(
            "Light Mix",
            systemImage: "lightbulb.fill",
            isInserted: Bindable(appModel).showMenuBarExtra
        ) {
            MenuBarContent(appModel: appModel)
        }
        .menuBarExtraStyle(.window)
    }
}
```

`isInserted` binding을 사용하면 Settings의 toggle로 menu bar extra를 넣거나 제거할 수 있다.

이 점은 기존 AppKit window/menu architecture를 건드리지 않고 SwiftUI scene의 동적 lifecycle을 사용할 수 있다는 의미다.

---

# ⚙️ SwiftUI `Settings` Scene 추가

같은 `NSHostingSceneRepresentation` 안에 `Settings` scene도 넣는다.

```swift
struct LightSettings: Scene {
    var appModel: AppModel

    var body: some Scene {
        Settings {
            SettingsView(appModel: appModel)
        }
    }
}
```

예제의 Settings 화면은 `TabView`로 General / Output / About 세 탭을 구성한다.

General 탭에서는 menu bar extra 표시 여부와 DMX 설정을 바꾸고, Output에서는 max brightness를 조절한다.

즉 Settings도 별도의 AppKit window/controller를 새로 구현하지 않고 SwiftUI scene으로 추가할 수 있다.

---

# 🔗 AppKit action에서 SwiftUI environment action 호출

기존 main menu의 AppKit `IBAction`에서 SwiftUI의 Settings window를 열어야 한다.

`NSHostingSceneRepresentation`은 SwiftUI environment에 접근할 수 있다.

```swift
openSettingsAction = {
    scenes.environment.openSettings()
}
```

기존 AppKit action에서는 저장한 closure를 호출한다.

```swift
@IBAction func openSettings(_ sender: Any?) {
    openSettingsAction?()
}
```

이 패턴의 의미는 크다.

- 기존 responder/action architecture 유지
- 실제 destination UI는 SwiftUI Scene
- SwiftUI environment action을 AppKit에서 호출 가능

즉 framework 경계가 반드시 일방향일 필요가 없다.

---

# 🔄 세션 전체의 점진적 전환 전략

```text
1. Existing AppKit/UIKit app
        ↓
2. Model을 @Observable로 전환
        ↓
3. Native views의 자동 Observation tracking 활용
        ↓
4. 새 component를 SwiftUI로 구현
        ↓
5. HostingView로 기존 hierarchy에 삽입
        ↓
6. 기존 native GestureRecognizer 재사용
        ↓
7. HostingMenu로 menu 일부 SwiftUI화
        ↓
8. HostingSceneRepresentation으로 SwiftUI Scenes 추가
```

이 과정 어디에서도 “기존 앱을 SwiftUI App lifecycle로 전환해야만 한다”는 전제가 없다.

---

# 🧱 경계별 적합한 도구

| 필요한 작업 | 권장 bridge/API |
|---|---|
| 기존 AppKit/UIKit view 자동 갱신 | `@Observable` + framework Observation tracking |
| 기존 hierarchy 안에 SwiftUI view 삽입 | `NSHostingView` / UIKit hosting counterpart |
| SwiftUI 안에서 기존 AppKit gesture 사용 | `NSGestureRecognizerRepresentable` |
| SwiftUI 안에서 native view 재사용 | `NSViewRepresentable` / UIKit counterpart |
| AppKit `NSMenu` 안에 SwiftUI menu 삽입 | `NSHostingMenu` |
| AppKit 앱에 SwiftUI Scene 추가 | `NSHostingSceneRepresentation` |
| 기존 AppKit action에서 SwiftUI Settings 열기 | `scenes.environment.openSettings()` |

---

# 🧠 왜 `@Observable`이 migration의 출발점인가

세션의 모든 단계에서 같은 `ColorModel`이 계속 재사용된다.

```text
NSSliderCell
    └─ reads ColorModel

SwiftUI HSBColorPicker
    └─ reads/writes same ColorModel

ColorMenu
    └─ reads/writes same ColorModel

MenuBarExtra
    └─ reads/writes model through AppModel
```

따라서 UI framework 변경과 model 변경을 동시에 수행하지 않아도 된다.

이 패턴은 큰 앱에서 특히 중요하다.

- Model/data layer는 유지
- 컴포넌트 단위로 UI만 교체
- AppKit/UIKit와 SwiftUI가 한동안 장기간 공존 가능
- migration을 작은 PR/작은 release 단위로 나눌 수 있음

---

# 🎯 언제 SwiftUI를 도입할 것인가

세션이 직접 권장하는 방향은 명확하다.

### 좋은 후보

- 새 기능
- 새 UI component
- 기존 UI를 대규모 재설계하는 시점
- 새 Scene / Settings / MenuBarExtra
- 기존 manual update 코드가 많아 Observation의 이점이 큰 영역

### 반드시 바꿀 필요가 없는 영역

- 안정적으로 동작하는 기존 AppKit/UIKit 화면
- native framework API가 이미 문제를 잘 해결하는 영역
- 단순히 “SwiftUI 비율을 높이기 위한” 재작성

SwiftUI를 사용하는 앱인지 아닌지를 binary하게 볼 필요가 없다.

---

# 📱 UIKit에 적용할 때의 해석

세션의 구현 데모는 거의 전부 macOS/AppKit이지만 Apple은 동일한 개념이 UIKit에도 적용된다고 명시한다.

특히 공통적인 핵심은:

- `@Observable` model 공유
- UIKit의 automatic observation tracking
- Hosting controller/view를 통한 SwiftUI embedding
- UIKit view를 representable로 SwiftUI에 삽입
- 기존 architecture를 유지한 점진적 도입

UIKit에서는 세션의 AppKit 전용 타입(`NSHostingMenu`, `NSHostingSceneRepresentation`, `NSGestureRecognizerRepresentable`)을 그대로 사용하는 것이 아니라 UIKit/SwiftUI가 제공하는 대응 integration point를 선택해야 한다.

즉 이 세션의 가장 중요한 부분은 특정 AppKit 클래스 이름보다 **migration boundary를 작게 유지하는 설계 원칙**이다.

---

# ⚠️ 구현 시 주의점

## `@Observable`만 붙인다고 모든 메서드가 자동 추적되는 것은 아님

Framework가 Observation tracking을 통합한 lifecycle/update point에서 property access가 추적된다. Custom cache나 tracking 밖의 작업은 별도의 invalidation 전략이 필요할 수 있다.

## Model의 actor isolation

예제 모델은 `@MainActor`다. UI에서 읽고 쓰는 state이므로 concurrency isolation을 명시한다.

## Gesture 접근성/입력 장치 다양성

Force Click처럼 특정 하드웨어에서만 가능한 입력은 keyboard/menu 같은 대체 경로가 필요하다.

## Hosting boundary를 너무 세분화하지 않기

작은 subview 하나마다 AppKit↔SwiftUI bridge를 만드는 것보다 독립적인 기능 단위로 hosting boundary를 잡는 편이 이해·테스트·lifecycle 관리에 유리하다.

## State ownership 명확화

AppKit/UIKit view와 SwiftUI view가 동일 모델을 공유할 때 어느 레이어가 instance를 생성하고 ownership을 가지는지 명확히 한다. 세션에서는 AppDelegate/AppModel이 공유 모델을 소유한다.

---

# 📋 실무 적용 체크리스트

## Observation

- [ ] 기존 KVO/manual invalidation이 많은 model 후보 확인
- [ ] Swift class에 `@Observable` 적용 검토
- [ ] UI state model의 `@MainActor` isolation 확인
- [ ] AppKit drawing/layout/update method가 model property를 직접 읽도록 정리
- [ ] 불필요한 `needsDisplay`/manual refresh 제거
- [ ] macOS 15 back-deploy 시 `NSObservationTrackingEnabled` 확인
- [ ] iOS 18 back-deploy 시 `UIObservationTrackingEnabled` 확인

## SwiftUI component adoption

- [ ] 신규/대규모 재설계 component부터 SwiftUI 검토
- [ ] 기존 model을 그대로 재사용 가능한지 확인
- [ ] Custom drawing은 `Canvas` 검토
- [ ] 기존 Core Graphics 자산이 있으면 `withCGContext` 검토
- [ ] `NSHostingView`/UIKit hosting boundary를 기능 단위로 배치

## Native interoperability

- [ ] 재사용 가치가 있는 기존 gesture recognizer 확인
- [ ] `NSGestureRecognizerRepresentable` 또는 플랫폼 대응 API 검토
- [ ] 기존 native view는 representable로 재사용 가능한지 확인
- [ ] 특수 gesture의 keyboard/menu 대체 접근 제공

## Menu

- [ ] 기존 main menu 전체를 바꾸지 않고 submenu 단위 migration 검토
- [ ] `NSHostingMenu`에서 동일 `@Observable` model 공유
- [ ] SwiftUI `keyboardShortcut` 활용
- [ ] menu action과 화면 상태가 동일한 source of truth를 사용하도록 정리

## Scenes

- [ ] 새 MenuBarExtra/Settings/window를 SwiftUI Scene으로 구현 가능한지 검토
- [ ] 기존 `NSApplicationDelegate` 유지 여부 결정
- [ ] `NSHostingSceneRepresentation`을 launch 단계에서 추가
- [ ] 동적으로 scene을 삽입/제거할 필요가 있는지 확인
- [ ] AppKit action에서 `environment.openSettings()` 같은 SwiftUI action bridge 검토

---

# 🔍 코드 리뷰 시 확인할 포인트

다음 패턴이 있다면 이 세션의 migration 후보가 될 수 있다.

```swift
needsDisplay = true
needsLayout = true
```

→ Observation tracking으로 제거 가능한지 확인.

```swift
class NewCustomView: NSView {
    // 대규모 custom drawing + interaction 신규 구현
}
```

→ 새 component라면 SwiftUI `Canvas` + gesture로 구현하는 편이 나은지 검토.

```swift
// 기존 AppKit 앱 전체를 SwiftUI App으로 먼저 전환하려는 계획
```

→ 실제로 필요한지 재검토. `NSHostingSceneRepresentation`으로 새 Scene만 추가할 수 있다.

```swift
// 기존 검증된 NSGestureRecognizer를 SwiftUI용으로 다시 구현
```

→ representable bridge로 그대로 재사용할 수 있는지 확인.

---

# 🧪 테스트 전략

혼합 UI에서는 framework별 테스트뿐 아니라 **경계 자체**를 테스트해야 한다.

### State synchronization

- AppKit control 변경 → SwiftUI view가 즉시 반영되는지
- SwiftUI control 변경 → AppKit view가 즉시 반영되는지
- network/model update → 양쪽 UI가 동시에 갱신되는지

### Lifecycle

- Hosting view 삽입/제거 반복
- Window close/reopen
- MenuBarExtra disable/enable
- Settings open/close

### Input

- Drag gesture + native custom recognizer 동시 사용
- Trackpad force click
- Force click이 없는 input device
- Keyboard shortcut
- Main menu

### Animation

동일 `@Observable` state를 AppKit/UIKit와 SwiftUI가 동시에 읽을 때 SwiftUI의 `withAnimation`이 의도한 영역에만 영향을 주는지 확인한다.

---

# 🧠 핵심 메시지

이 세션에서 Apple이 보여주는 SwiftUI adoption 전략은 **rewrite가 아니라 coexistence**다.

가장 먼저 할 일은 SwiftUI view를 만드는 것이 아니라 **공유 가능한 observable model을 만드는 것**일 수 있다. 그 다음 새로운 UI나 대규모 재설계가 필요한 component부터 SwiftUI로 옮기고, hosting view로 기존 hierarchy에 연결한다.

기존 AppKit/UIKit 자산도 버릴 이유가 없다. Gesture recognizer와 native view는 representable을 통해 재사용하고, menu는 `NSHostingMenu`, 완전한 scene은 `NSHostingSceneRepresentation`을 사용해 기존 AppDelegate 구조 안으로 가져올 수 있다.

결과적으로 하나의 앱 안에서 다음이 동시에 존재할 수 있다.

```text
AppKit / UIKit lifecycle
+ AppKit / UIKit views
+ @Observable shared models
+ hosted SwiftUI components
+ native gestures inside SwiftUI
+ SwiftUI-powered menus
+ complete SwiftUI scenes
```

Apple은 앱이 **전부 SwiftUI일 필요가 전혀 없다**는 점을 명확히 강조한다. 문제에 맞는 framework와 migration boundary를 선택하는 것이 더 중요하다.

---

# 🔗 함께 보면 좋은 세션과 자료

- [WWDC26 — Use SwiftUI with AppKit and UIKit](https://developer.apple.com/videos/play/wwdc2026/272/)
- Apple Developer — Updating views automatically with observation tracking in AppKit
- Apple Developer — Updating views automatically with observation tracking in UIKit
- WWDC26 — Compose advanced graphics effects with SwiftUI
- WWDC25 — What’s new in UIKit
- WWDC22 — Use SwiftUI with AppKit
- WWDC22 — Use SwiftUI with UIKit
- WWDC22 — Bring multiple windows to your SwiftUI app
- WWDC21 — Add rich graphics to your SwiftUI app
