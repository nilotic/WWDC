# Tech Talk 111461 — Prepare your app for iPhone Duo 요약

- Session: Tech Talks 111461
- Title: Prepare your app for iPhone Duo
- Apple Developer: https://developer.apple.com/videos/play/tech-talks/111461/
- Official YouTube: https://www.youtube.com/watch?v=qsd-VwqmZvI
- Topic: iPhone Duo, adaptive layout, size classes, safe areas, navigation, Device Hub, ReservedRegion, App Resizability
- Chapters: Introduction, Build with the latest SDK, Get started in Xcode, Adopt flexible layouts, Use size classes, Avoid screen assumptions, Adopt standard navigation, Respect safe areas, Use reserved regions, Next steps

> Source note: Apple Developer 페이지에는 WWDC 세션처럼 전체 transcript가 텍스트로 노출되지 않는다. 공식 Apple Developer YouTube 영상이 존재하므로 이를 우선 영상 소스로 확인했고, 문서 내용은 Apple Developer 페이지에 공개된 공식 chapter summary와 code snippets를 기준으로 정리했다.

---

## 한 줄 요약

iPhone Duo 대응의 핵심은 **특정 기기나 방향을 감지해 예외 처리하는 것이 아니라, 최신 SDK를 사용하고 size class·scene·safe area·표준 navigation처럼 이미 존재하는 adaptive layout 체계를 제대로 따르는 것**이다. 특히 iOS 27.1에서는 inner display의 전체 영역과 새로운 시스템 배치를 활용할 수 있고, `UIScreen.main` 같은 전역 screen 가정을 제거하며, 비대칭 safe area와 reserved region을 각각 독립적으로 처리해야 한다.

---

## 핵심 요약

이번 세션은 기존 iPhone 앱을 iPhone Duo에서 자연스럽게 동작하도록 업데이트할 때 무엇을 우선 확인해야 하는지 단계별로 설명한다.

- **최신 SDK로 빌드**
  - 앱은 재컴파일하지 않아도 iPhone Duo에서 실행된다.
  - 하지만 최신 SDK를 사용할수록 inner display의 더 넓은 영역과 최신 시스템 UI 배치를 활용할 수 있다.
  - iOS 27 SDK와 iOS 27.1 SDK 사이에도 화면 사용 방식의 차이가 있다.

- **Xcode 27.1 + Device Hub로 모든 pose 테스트**
  - iPhone Duo simulator를 열고, 기기를 열고 닫고 회전하고 접는 상태를 직접 테스트한다.
  - 한 가지 고정 portrait/landscape만 검증해서는 충분하지 않다.

- **Flexible layout을 기본값으로**
  - user interface idiom이나 특정 screen size로 기능과 layout을 추론하지 않는다.
  - iPhone Duo는 새로운 screen shape, camera placement, foldable pose 때문에 기존의 hard-coded layout assumption을 쉽게 깨뜨린다.

- **Orientation 대신 Size Class**
  - outer display는 일반적인 iPhone과 유사하다.
  - inner display는 horizontal/vertical 모두 regular size class를 제공해 sidebar 같은 richer navigation을 사용할 공간이 생긴다.
  - inner display는 supported interface orientation을 layout 결정 기준으로 삼기에 적합하지 않으므로 size class를 사용한다.

- **`UIScreen.main` 가정 제거**
  - 두 display를 가진 device에서 “main screen”은 모호하다.
  - screen이 필요하면 window scene으로부터 동적으로 얻는다.
  - scale 같은 값도 `UIScreen.main.scale`이 아니라 현재 context의 trait/environment에서 얻는다.

- **표준 navigation component 적극 사용**
  - `NavigationSplitView`, `UISplitViewController`, `TabView`, `UITabBarController`는 pose에 맞게 자동 적응한다.
  - inner display에서는 sidebar placement를 활용할 수 있다.
  - sheet, popover, context menu, alert도 system adaptive behavior를 따른다.

- **Safe Area를 각 변별로 독립 처리**
  - status bar, camera, system UI 때문에 safe area가 좌우 대칭이라고 가정하면 안 된다.
  - foreground interactive content는 safe area 안에 둔다.
  - background artwork는 필요하면 safe area 밖까지 확장한다.
  - Split View에서도 다시 검증한다.

- **Reserved Region 사용**
  - iOS 27.1의 `ReservedRegion` / `UIViewReservedRegion`은 custom UI가 system UI와 충돌하지 않으면서 가능한 넓은 screen space를 사용할 수 있게 한다.

- **App Resizability skill**
  - Xcode 27.1에서 기존 app modernization skill은 App Resizability로 이름이 바뀌고 SwiftUI와 iPhone Duo까지 지원 범위가 확장된다.

---

# 📱 SDK에 따라 달라지는 iPhone Duo 화면 사용

Apple은 iPhone Duo에서 앱이 최신 SDK로 빌드되지 않아도 실행된다고 설명한다.

그러나 SDK 버전에 따라 inner display를 사용하는 수준이 달라진다.

```text
기존 App
   ↓
재컴파일하지 않아도 실행
   ↓
최신 SDK로 갈수록
더 많은 화면 영역 + 최신 system layout 활용
```

공식 chapter summary에 따르면:

- **iOS 27 SDK**
  - inner display에서 앱이 status bar 왼쪽 영역까지 확장된다.

- **iOS 27.1 SDK**
  - 앱이 screen edge까지 확장된다.
  - standard navigation과 toolbar button이 vertical arrangement를 활용한다.

따라서 첫 번째 대응은 특별한 Duo 전용 코드가 아니라 **Xcode 27.1과 최신 SDK로 빌드해 보는 것**이다.

---

# 🧪 Device Hub에서 모든 Pose 테스트

Apple은 Xcode 27.1의 Device Hub에서 iPhone Duo simulator를 실행하도록 권장한다.

Device Hub의 on-screen control로 다음 상태를 직접 테스트할 수 있다.

- Open
- Close
- Rotate
- Fold

이 접근의 핵심은 “portrait와 landscape”라는 두 상태만 보는 것이 아니다.

```text
Open
Close
Folded
Rotated
Split View
...
```

처럼 사용 가능한 공간이 계속 바뀌는 환경에서 앱이 재배치되는지 확인해야 한다.

---

# 🧩 Flexible Layout을 기본 설계로

Apple은 iPhone Duo를 완전히 새로운 예외 기기로 다루기보다, 기존 adaptive layout 원칙을 더 강하게 요구하는 device로 설명한다.

기존에도 Apple platform에서는 다음 상황 때문에 layout이 변해왔다.

- 화면 크기 차이
- 다양한 aspect ratio
- camera 위치
- multitasking
- iPhone mirroring on Mac

Duo는 여기에 foldable display와 multi-display 특성을 더한다.

따라서 피해야 할 접근:

```text
if device == Duo {
    specialLayout()
}
```

대신 현재 주어진 space와 traits를 기준으로 UI를 구성한다.

---

# 🚫 User Interface Idiom으로 Screen 능력을 추정하지 않기

`phone`이라는 idiom만 보고 다음을 추론하면 안 된다.

- compact width일 것이다
- sidebar가 들어갈 공간이 없을 것이다
- 특정 orientation만 사용될 것이다
- 특정 screen ratio일 것이다

Duo의 inner display는 일반적인 iPhone보다 더 넓은 공간을 제공할 수 있다.

즉 device family보다 **현재 environment가 제공하는 actual layout condition**이 중요하다.

---

# 📐 Size Class 사용

SwiftUI:

```swift
@Environment(\.horizontalSizeClass)
private var horizontalSizeClass

@Environment(\.verticalSizeClass)
private var verticalSizeClass
```

UIKit:

```swift
traitCollection.horizontalSizeClass
traitCollection.verticalSizeClass
```

Size class는 “이 device가 무엇인가?”가 아니라 “현재 available space에서 어떤 experience를 제공해야 하는가?”를 표현한다.

---

# 📱 Outer Display와 Inner Display

공식 summary 기준으로:

## Outer Display

일반 iPhone과 비슷한 size class behavior를 제공한다.

## Inner Display

```text
horizontalSizeClass = regular
verticalSizeClass   = regular
```

에 해당하는 더 넓은 공간을 제공해 sidebar 같은 richer navigation을 배치할 수 있다.

이 차이를 device model check가 아니라 size class로 자연스럽게 처리한다.

---

# 🔄 Interface Orientation을 Layout 조건으로 쓰지 않기

Apple은 inner display에서 supported interface orientations를 layout 결정의 기준으로 사용하지 말라고 강조한다.

즉 다음과 같은 패턴은 피한다.

```text
portrait → layout A
landscape → layout B
```

대신:

```text
compact width → layout A
regular width → layout B
```

처럼 size class와 available space를 기준으로 결정한다.

---

# 🖥️ `UIScreen.main` 가정 제거

두 display가 있는 device에서 “main screen”은 모호하다.

Apple은 screen이 필요할 때 현재 window가 속한 scene에서 가져오라고 한다.

```swift
// Avoid referencing the main screen on a two-display device.
// Access the screen dynamically from the window scene instead.
let screen = window?.windowScene?.screen
```

이렇게 하면 실제로 해당 window가 표시되는 screen context를 사용한다.

---

# 📏 Display Scale도 Context에서 얻기

세션의 마지막 code snippet은 `UIScreen.main.scale`을 제거한다.

기존:

```swift
func updateThumbnail(from image: UIImage) {
    let screenScale = UIScreen.main.scale
    // ...
}
```

변경:

```swift
func updateThumbnail(from image: UIImage) {
    let screenScale = traitCollection.displayScale
    // ...
}
```

즉 scale도 global screen singleton이 아니라 현재 view/controller context의 trait에서 읽는다.

---

# 🟢 Concentricity API

Screen corner와 content corner를 자연스럽게 맞추기 위해 iOS 26의 Concentricity API를 사용할 수 있다.

SwiftUI:

```swift
ConcentricRectangle()
    .fill(Color.green)
    .padding(8.0)
    .ignoresSafeArea()
```

UIKit에서는 `UICornerConfiguration`을 사용한다.

이 API들은 고정 radius 값을 직접 추정하기보다 현재 screen geometry에 맞는 corner relationship을 표현할 수 있게 한다.

---

# 🧭 표준 Navigation을 사용해야 하는 이유

Apple은 다음 system navigation component가 Duo의 pose 변화에 자동 적응한다고 설명한다.

SwiftUI:

- `NavigationSplitView`
- `TabView`

UIKit:

- `UISplitViewController`
- `UITabBarController`

Pose와 available space가 바뀌면 column이나 navigation presentation도 적절히 collapse, tile, overlay된다.

즉 custom navigation을 고정 frame으로 직접 만드는 것보다 system component를 사용할수록 Duo 대응 비용이 줄어든다.

---

# 📚 Inner Display에서 Sidebar 사용

Inner display에서는 richer navigation을 위해 sidebar placement를 사용할 수 있다.

SwiftUI:

```swift
TabView { … }
    .defaultTabBarPlacement(.sidebar)
```

UIKit:

```swift
tabBarController.sidebar.preferredPlacement = .sidebar
```

Outer display처럼 공간이 좁을 때는 기존 compact navigation experience로 적응하고, inner display에서는 sidebar를 활용할 수 있다.

---

# 🪟 Presentation도 System에 맡기기

Apple은 다음 UI도 pose와 available space에 맞춰 adapt한다고 설명한다.

- Sheets
- Popovers
- Context menus
- Alerts

따라서 custom position을 hard-code하기보다 standard presentation API를 사용해야 한다.

---

# 🛡️ Safe Area 기본 원칙

Duo에서는 status bar, camera, system UI 때문에 safe area geometry가 일반적인 iPhone과 다를 수 있다.

Apple의 권장 원칙은 명확하다.

## Foreground Interactive Content

Safe area 안에 둔다.

UIKit 예:

```swift
foreground.frame = view.bounds.inset(by: view.safeAreaInsets)
```

## Background Artwork

필요하면 safe area 밖까지 확장한다.

SwiftUI:

```swift
.ignoresSafeArea()
```

UIKit:

```swift
backgroundView.frame = view.bounds
```

---

# ↔️ Safe Area가 좌우 대칭이라고 가정하지 않기

잘못된 패턴:

```swift
let width = view.bounds.width - view.safeAreaInsets.left * 2
```

이 코드는 left와 right inset이 같다고 가정한다.

Duo에서는 safe area와 layout margin이 비대칭일 수 있다.

권장:

```swift
let width = view.bounds.inset(by: view.safeAreaInsets).width
```

각 side의 실제 inset을 독립적으로 반영한다.

---

# 🧠 비대칭 Insets가 중요한 이유

기존 코드에는 흔히 다음 가정이 숨어 있다.

```text
left == right

top == bottom
```

Duo에서는 camera와 system UI placement 때문에 이 가정이 쉽게 깨질 수 있다.

따라서 width를 계산할 때도:

```text
전체 width
- left inset
- right inset
```

처럼 양쪽 값을 실제로 사용해야 한다.

---

# 🪟 Split View에서도 테스트

Apple은 safe area와 adaptive layout을 iPhone Duo의 full-screen 상태만 보고 끝내지 말고 Split View multitasking에서도 테스트하라고 한다.

```text
Full Screen OK
≠
모든 Layout OK
```

Split View에서는 available width와 margin이 다시 달라진다.

따라서 flexible layout code가 실제로 공간 변화에 반응하는지 확인해야 한다.

---

# 🧱 Reserved Region

새 iOS 27.1에는 custom UI가 system UI와 충돌하지 않으면서 화면을 최대한 활용할 수 있도록 reserved region API가 추가된다.

SwiftUI:

```text
ReservedRegion
```

UIKit:

```text
UIViewReservedRegion
```

적합한 경우:

- Custom bar
- Edge-to-edge interface
- 화면 가장자리를 적극 활용하는 UI
- Standard bar가 아닌 app-specific control

목적은 단순히 safe area를 무시하는 것이 아니다.

```text
Custom UI가 필요한 영역
      +
System UI가 필요한 영역
      ↓
서로 충돌하지 않게 조정
```

하는 것이다.

---

# 🛠️ App Resizability Skill

세션의 마지막에는 Xcode의 modernization tooling도 업데이트된다.

기존 “Modernize your UIKit app”에서 소개된 app modernization skill은 Xcode 27.1에서:

```text
App Resizability
```

로 이름이 바뀐다.

지원 범위도 확대되어:

- UIKit
- SwiftUI
- iPhone Duo

대응을 도와준다.

Apple의 권장 next step은 Xcode 27.1에서 simulator와 App Resizability skill을 함께 사용하는 것이다.

---

# 🧩 주요 API / 개념 정리

| API / 개념 | 역할 |
|---|---|
| `horizontalSizeClass` | 현재 horizontal layout capability 표현 |
| `verticalSizeClass` | 현재 vertical layout capability 표현 |
| `window?.windowScene?.screen` | 현재 window가 실제 표시되는 screen 접근 |
| `traitCollection.displayScale` | 현재 context의 display scale |
| `ConcentricRectangle` | SwiftUI에서 screen corner와 조화되는 shape |
| `UICornerConfiguration` | UIKit corner configuration |
| `NavigationSplitView` | SwiftUI adaptive multi-column navigation |
| `UISplitViewController` | UIKit adaptive split navigation |
| `TabView` | SwiftUI adaptive tab/sidebar navigation |
| `UITabBarController` | UIKit tab/sidebar navigation |
| `.defaultTabBarPlacement(.sidebar)` | Inner display에서 sidebar placement |
| `safeAreaInsets` | System UI를 피해 interactive content 배치 |
| `.ignoresSafeArea()` | Background를 edge-to-edge 확장 |
| `ReservedRegion` | SwiftUI custom UI의 system-safe reserved area |
| `UIViewReservedRegion` | UIKit reserved region |
| Device Hub | Duo simulator의 pose 테스트 |
| App Resizability | Xcode 27.1 layout modernization skill |

---

# 🔁 권장 Migration 순서

```text
1. Xcode 27.1 + 최신 SDK로 Build
        ↓
2. Device Hub에서 모든 Pose 확인
        ↓
3. Hard-coded Screen / Orientation 가정 제거
        ↓
4. Size Class 기반 Layout
        ↓
5. UIScreen.main 사용 제거
        ↓
6. Standard Navigation 채택
        ↓
7. Safe Area를 각 Side별로 처리
        ↓
8. Split View 테스트
        ↓
9. Custom UI라면 Reserved Region 검토
        ↓
10. App Resizability skill로 추가 점검
```

---

# 📋 체크리스트

## SDK / Xcode

- [ ] Xcode 27.1로 빌드
- [ ] 최신 iOS 27.1 SDK 기준 동작 확인
- [ ] 이전 SDK build와 screen usage 차이 확인
- [ ] iPhone Duo simulator 설치
- [ ] Device Hub에서 실행

## Pose 테스트

- [ ] Closed state
- [ ] Open state
- [ ] Folded state
- [ ] Rotation
- [ ] Outer display
- [ ] Inner display
- [ ] Split View
- [ ] 각 상태 전환 중 layout continuity 확인

## Adaptive Layout

- [ ] Device model name으로 layout 분기하지 않기
- [ ] `userInterfaceIdiom`만으로 available space 추론하지 않기
- [ ] Fixed screen dimensions 제거
- [ ] Fixed aspect ratio 가정 제거
- [ ] Available space 변화에 따라 자연스럽게 resize되는지 확인

## Size Classes

- [ ] SwiftUI environment에서 size class 사용
- [ ] UIKit trait collection 사용
- [ ] Orientation 대신 size class로 layout 결정
- [ ] Inner display에서 regular/regular layout 확인
- [ ] Regular width에서 sidebar 가능 여부 검토

## Screen Access

- [ ] `UIScreen.main` 검색
- [ ] Window scene의 screen으로 대체
- [ ] `UIScreen.main.scale` 제거
- [ ] `traitCollection.displayScale` 사용 검토
- [ ] Global screen singleton에 의존하는 utility code 점검

## Corners

- [ ] Hard-coded corner radius 점검
- [ ] SwiftUI `ConcentricRectangle` 검토
- [ ] UIKit `UICornerConfiguration` 검토
- [ ] Edge-to-edge background와 screen corner 조화 확인

## Navigation

- [ ] `NavigationSplitView` 사용 검토
- [ ] `UISplitViewController` 사용 검토
- [ ] `TabView`가 adaptive하게 동작하는지 확인
- [ ] `UITabBarController` 확인
- [ ] Inner display sidebar placement 검토
- [ ] Closed/open 전환에서 column collapse 확인
- [ ] Sheet/popover/context menu/alert를 custom positioning하지 않는지 확인

## Safe Area

- [ ] Foreground interactive content가 safe area 안에 있는지 확인
- [ ] Background artwork는 필요 시 edge-to-edge 확장
- [ ] `safeAreaInsets.left == right` 가정 제거
- [ ] Top/bottom inset도 독립적으로 처리
- [ ] `bounds.inset(by:)` 패턴 활용
- [ ] Camera/status bar 주변 control overlap 테스트
- [ ] Split View에서도 safe area 재검증

## Reserved Region

- [ ] Custom bar가 system UI와 충돌하는지 확인
- [ ] `ReservedRegion` 검토
- [ ] `UIViewReservedRegion` 검토
- [ ] Edge-to-edge design에서 실제 usable region 테스트

## Final QA

- [ ] Outer display에서 기존 iPhone quality 유지
- [ ] Inner display에서 단순 확대가 아닌 richer layout 제공 여부 검토
- [ ] Fold/unfold 전환 시 state 유지
- [ ] Navigation hierarchy가 전환 중 깨지지 않는지 확인
- [ ] Text truncation 확인
- [ ] Touch target이 camera/system UI와 겹치지 않는지 확인
- [ ] App Resizability skill 실행

---

# ⚠️ 자주 발생할 수 있는 문제

## `UIScreen.main`을 계속 사용

두 display device에서는 어떤 screen을 의미하는지 모호하다.

현재 window/scene context에서 screen을 가져온다.

## Orientation만 보고 Layout 결정

Inner display의 layout behavior를 정확히 표현하지 못한다.

Size class와 actual available space를 사용한다.

## Safe Area를 대칭으로 가정

Camera와 system UI 때문에 좌우 inset이 달라질 수 있다.

각 side를 별도로 처리한다.

## Background까지 Safe Area 안에 가둠

Foreground interaction은 safe area에 맞추되 artwork와 background는 edge까지 확장할 수 있다.

## 모든 Navigation을 직접 구현

System navigation component가 이미 Duo pose에 적응한다.

가능하면 standard API를 먼저 사용한다.

## Full Screen만 테스트

Split View와 fold/open transition에서 문제가 드러날 수 있다.

Device Hub로 다양한 pose와 multitasking 상태를 검증한다.

---

# 🎯 실무적으로 가장 먼저 검색할 코드

기존 앱을 점검할 때 다음 패턴부터 검색하면 좋다.

```text
UIScreen.main

UIDevice.current.orientation

supportedInterfaceOrientations 기반 layout 분기

view.bounds.width - safeAreaInsets.left * 2

hard-coded screen width / height

manual navigation/sidebar positioning

fixed corner radius
```

이 패턴들이 iPhone Duo에서 잘못된 assumption으로 이어질 가능성이 높다.

---

# 핵심 메시지

iPhone Duo 대응에서 중요한 것은 새로운 device-specific layout layer를 하나 더 만드는 것이 아니다.

Apple이 오래전부터 제공해 온 adaptive UI 원칙을 정확하게 따르는 것이다.

```text
Device Detection
        ↓ 지양

Available Space
Size Classes
Scene Context
Safe Areas
Standard Navigation
        ↓ 사용
```

최신 SDK로 빌드하면 시스템이 더 많은 screen space와 Duo-specific system arrangement를 자동으로 제공한다.

그 위에서 앱은 orientation이나 `UIScreen.main`처럼 하나의 고정 screen을 전제로 한 코드를 제거하고, 현재 window scene과 trait/environment를 기준으로 layout을 결정해야 한다.

특히 inner display에서는 regular size class를 활용해 sidebar 같은 richer navigation을 제공할 수 있고, safe area는 camera와 system UI 때문에 비대칭일 수 있으므로 각 side를 독립적으로 처리해야 한다.

Custom edge-to-edge UI가 필요한 경우에는 iOS 27.1의 Reserved Region API를 사용해 system UI와 충돌하지 않게 공간을 확보한다.

결국 iPhone Duo 준비의 가장 중요한 기준은 다음과 같다.

```text
“Duo인지 확인해서 분기하는 앱”보다
“어떤 공간에서도 자연스럽게 resize되는 앱”을 만든다.
```

이 원칙을 지키면 iPhone Duo뿐 아니라 앞으로 등장할 새로운 screen size와 presentation environment에도 훨씬 강한 UI가 된다.

---

# 함께 보면 좋은 세션과 자료

- Design for iPhone Duo — Tech Talk 111466
- Raise the bar with iPhone Duo
- Strike a pose with adaptive layouts on iPhone Duo
- Leverage multiple displays and scenes on iPhone Duo
- Build a great camera experience for iPhone Duo
- Modernize your UIKit app — WWDC26
- Xcode 27.1 Device Hub
- App Resizability
