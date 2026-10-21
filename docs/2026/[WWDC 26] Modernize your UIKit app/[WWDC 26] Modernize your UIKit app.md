# WWDC26 — Modernize your UIKit app

- **Session:** 278
- **Speaker:** Michael Ochs (UI Frameworks)
- **Source:** https://developer.apple.com/videos/play/wwdc2026/278/
- **Basis:** Apple official full transcript and Code examples
- **Platforms:** iOS 27, iPadOS 27, macOS 27, Xcode 27

## 🎯 핵심 요약

iOS/macOS 27에서 iPhone Mirroring의 iPhone 앱과 iPad에서 실행하는 iPhone 앱이 자유롭게 리사이즈된다. UIKit 앱은 `UIScreen.main`, `userInterfaceIdiom`, interface orientation에 의존한 레이아웃을 제거하고 scene lifecycle, trait collection, 실제 view bounds에 맞춰 반응해야 한다. Tab/sidebar/navigation/menu API, Siri 통합, Xcode 27의 modernization skill도 소개한다.

## 🧭 세션 순서

| Time | Chapter |
|---|---|
| 0:00 | Introduction |
| 0:34 | App adaptivity |
| 2:10 | Legacy API: App lifecycle |
| 2:51 | Legacy API: Main screen |
| 5:46 | Full-screen mode for games |
| 6:17 | Legacy API: User interface idiom |
| 6:50 | Legacy API: Interface orientation |
| 7:55 | UIView Body protocols for motion & location |
| 8:19 | Test your resizable iPhone app |
| 9:18 | Tab bars and sidebars |
| 10:52 | Navigation bars |
| 12:37 | Menus |
| 13:01 | Integrate with Apple Intelligence |
| 14:07 | Agentic coding |
| 15:32 | Next steps |

## 📐 App adaptivity와 Scene lifecycle

iPhone Mirroring의 창 크기를 Mac에서 조절할 수 있고, iPhone-only 앱도 iPad에서 자유롭게 크기를 바꿀 수 있다. 런타임의 실제 가용 scene 크기에 맞춰 UI를 조정해야 한다.

**점검할 네 가지 레거시 패턴:**
- App lifecycle 대신 `UIScene` lifecycle 사용
- `UIScreen.main` 참조 제거
- `userInterfaceIdiom`을 레이아웃 조건으로 사용하지 않기
- interface orientation을 레이아웃 조건으로 사용하지 않기

최신 SDK에서는 `UIScene` lifecycle이 필수다. 이를 채택하지 않으면 앱이 실행되지 않는다. `UISceneDelegate` 채택 여부를 먼저 확인한다.

## 🖥️ Main screen 대신 scene-local screen

앱의 scene이 Mac/iPad 외부 화면에 있으면 main screen이 해당 scene의 화면을 의미하지 않는다.

```swift
let screen = window?.windowScene?.screen

func generateThumbnail(_ image: UIImage, screen: UIScreen) -> UIImage {
    // ...
}
```

필요한 곳에는 해당 window scene의 screen을 전달하되, 더 좋은 방법은 screen 의존성 자체를 제거하는 것이다.

### Display scale은 trait 사용

```swift
override func layoutSubviews() {
    super.layoutSubviews()
    let displayScale = traitCollection.displayScale
    // ...
}
```

`layoutSubviews`, `updateProperties`, `drawRect` 등 공통 override 지점은 사용한 trait의 변경을 자동 추적한다. 변경 시 다시 호출되므로 명시적인 observer가 불필요한 경우가 많다. 캐시처럼 직접 invalidation해야 하는 데이터는 등록한다.

```swift
let displayScaleTrait: [UITrait] = [UITraitDisplayScale.self]
registerForTraitChanges(displayScaleTrait) {
    (view: GalleryView, previousTraitCollection: UITraitCollection) in
    view.cache.invalidate()
}
```

### Screen bounds 대신 effective geometry와 view bounds

전체 screen bounds가 앱의 가용 영역과 일치하지 않는다.

```swift
// UIWindowSceneDelegate
func windowScene(
    _ windowScene: UIWindowScene,
    didUpdateEffectiveGeometry previousEffectiveGeometry: UIWindowScene.Geometry
) {
    let geometry = windowScene.effectiveGeometry
    let availableSpace = geometry.coordinateSpace.bounds
    // ...
}
```

뷰 컨트롤러 내부에서는 자기 view의 실제 크기를 사용하는 편이 더 범용적이다.

```swift
override func viewDidLayoutSubviews() {
    super.viewDidLayoutSubviews()
    let availableSpace = view.bounds.size
    // ...
}
```

Split view나 재사용되는 child view controller에서도 정확히 동작한다.

## 🎮 Full-screen games: discrete resizing

iOS 27에서 `UIRequiresFullscreen`은 resizable iPhone 환경에서도 적용된다. 앱을 완전히 resize 불가로 만드는 대신 지원 interface orientation에 대응하는 **discrete resizing**으로 동작한다. 사용자가 창 크기를 바꾸면 해당 크기에 맞는 screen configuration으로 전환해 게임의 렌더링 품질을 유지한다.

## 📱 Idiom과 orientation은 레이아웃 조건이 아님

iPhone 앱은 iPad나 Mac에서 큰 창으로 실행되어도 **phone idiom**을 유지한다. `userInterfaceIdiom == .phone`은 창이 좁다는 뜻이 아니다. 대신 **size class**와 실제 view size를 사용한다.

iOS 27의 resizable 환경에서 supported interface orientation은 선호도일 뿐이다. 특히 Mac의 iPhone Mirroring은 창의 가로세로 비율과 관계없이 **portrait interface orientation**을 보고한다. 따라서 orientation 기반 레이아웃 분기를 size class나 view bounds 기반으로 바꿔야 한다.

발표는 WWDC2014의 표현 “A device rotation is only an animated bounds change.”를 다시 강조한다.

## 🧭 UIView의 Body protocols

iOS 27에서 `UIView`는 CoreMotion과 CoreLocation의 새로운 Body protocols를 지원한다. Motion/heading 데이터를 표시하는 view에 manager를 연결하면 interface orientation과 관계없이 올바른 좌표계로 데이터를 표현할 수 있다.

```swift
override func viewDidLoad() {
    super.viewDidLoad()
    motionManager.deviceMotionBody = view
    locationManager.headingBody = view
}
```

## 🧪 Resize 테스트

Xcode 27의 **Device Hub**와 **Xcode Previews**에서 Enter Resize Mode를 선택하고 가장자리를 드래그하면 임의 크기의 화면을 테스트할 수 있다. 최종적으로는 실제 iPad와 Mac의 iPhone Mirroring에서도 검증해야 한다.

확인할 조합:
- phone idiom이지만 넓은 창
- portrait orientation이지만 가로로 넓은 창
- 작은 폭과 큰 폭 사이의 연속 리사이징
- 외부 디스플레이 이동
- split view에 포함된 child view controller
- display scale 변경에 따른 이미지 캐시 갱신

## 🗂️ Tab bars와 sidebars

iPad에서는 tab bar가 sidebar로 확장될 수 있다. iPhone은 기본적으로 bottom tab bar를 유지하지만, iOS 27부터 앱이 sidebar를 선택할 수 있다.

```swift
tabBarController.sidebar.preferredPlacement = .sidebar
```

채택 후 사용자가 UI에서 sidebar/tab bar를 직접 토글하는 방식은 아니다. 실제 sidebar 표시 가능 여부는 시스템이 가용 공간(예: regular horizontal size class)을 보고 결정한다.

```swift
let canShowSidebar = tabBarController.sidebar.isAvailable
```

Sidebar가 없을 때 nested tab 내부 기능에 접근할 수 있는 대체 경로를 제공한다.

### Prominent tab

스크롤 중 tab bar가 접혀도 특정 tab을 항상 노출할 수 있다.

```swift
let tabs = [
    // ...
]
let tabBarController = UITabBarController(tabs: tabs)
tabBarController.prominentTabIdentifier = "cart"
```

## 🧭 Navigation bar minimization

Navigation bar는 스크롤에 따라 상호작용하며 사라져 콘텐츠 공간을 늘릴 수 있다. 기본 조건은 시스템이 결정한다. 동작과 safe area 조정을 변경하는 공식 코드:

```swift
override init(
    nibName nibNameOrNil: String?,
    bundle nibBundleOrNil: Bundle?
) {
    super.init(nibName: nibNameOrNil, bundle: nibBundleOrNil)
    navigationItem.navigationBarMinimization.minimizationBehavior = .onScrollDown
    navigationItem.navigationBarMinimization.safeAreaAdjustment = .disabled
}
```

Transcript는 minimization behavior를 강제할 때 `.always`와 `.never`도 설명한다. 앱이 safe area를 직접 처리한다면 자동 inset 조정을 비활성화할 수 있으나, 콘텐츠 가림 여부를 테스트해야 한다.

### Scroll edge effect

`.automatic`은 이전의 soft/hard 자동 전환이 아니라 새로운 독립적인 시각 효과를 제공한다. 과거 `.soft`를 명시한 경우 iOS 27 기본 디자인과 다를 수 있으므로 재검토한다.

## ☰ Menu image visibility

Liquid Glass 개선으로 iPadOS/macOS의 menu bar 등 일부 상황에서 메뉴 이미지가 기본적으로 표시되지 않을 수 있다. 이미지가 필요한 경우 `preferredImageVisibility`로 시스템 기본 동작을 재정의할 수 있다. Apple은 HIG 기준으로 이미지 필요성부터 검토하라고 권한다.

## ✨ Apple Intelligence: Ask Siri와 View Annotations

iOS 27의 메뉴에는 Siri와 관련된 콘텐츠가 있으면 **Ask Siri** 버튼이 자동으로 나타난다. 새로운 **View Annotations API**를 사용해 특정 view에 `AppEntity`를 연결하면 Siri에 앱 맥락을 더 정확하게 제공할 수 있다. 상세 구현은 *Explore advanced App Intents features for Siri and Apple Intelligence* 세션을 참고한다.

### Drag-and-drop handler의 새 호출 경로

Apple Intelligence가 context menu에서 실행될 때 Siri가 앱의 drag delegate 메서드를 호출해 콘텐츠를 가져올 수 있다. 이때 drag session은 **사용자의 실제 드래그 제스처 없이 시작될 수 있다**.

- `sessionWillBegin`에서 애니메이션을 시작하거나 modal UI를 띄우지 않는다.
- 사용자 드래그를 전제로 한 stateful UI는 `sessionDidMove`로 이동한다.
- 데이터 로딩과 사용자 피드백을 같은 delegate callback에서 처리하는 기존 코드를 점검한다.

## 🤖 Xcode 27 modernization skill

Xcode 27에는 앱의 적응형 UI 마이그레이션을 돕는 agentic coding skill이 있다. 프로젝트 문맥을 활용해:
- main screen 호출을 trait collection 또는 scene bounds로 전환
- 필요 시 invalidation 추가
- orientation 기반 분기를 size class로 전환
- scene lifecycle 도입
- 복잡한 변경에 대해 질문하거나 후속 작업 주석 남기기

다른 agent 도구에서 사용하려면 skill을 Markdown으로 내보낼 수 있다.

```bash
xcrun agent skills export
```

자동 변경 후에도 실제 resize 환경에서 테스트해야 한다.

## 📋 점검 체크리스트

### Lifecycle/Geometry
- [ ] `UIScene` lifecycle 채택 확인
- [ ] `UIScreen.main` 참조 제거
- [ ] 화면 배율을 `traitCollection.displayScale`로 전환
- [ ] screen bounds 대신 scene effective geometry/view bounds 사용
- [ ] trait tracking과 캐시 invalidation 확인
- [ ] idiom 기반 layout 분기 제거
- [ ] orientation 기반 layout 분기 제거
- [ ] size class와 view size 기반으로 교체
- [ ] 게임의 discrete resizing 필요성 검토

### UI/Navigation
- [ ] iPhone sidebar 채택 여부 검토
- [ ] `sidebar.isAvailable`에 따른 대체 탐색 경로 제공
- [ ] prominent tab 설정 검토
- [ ] navigation bar minimization 및 safe area 테스트
- [ ] `.automatic` scroll edge effect와 기존 `.soft` override 재검토
- [ ] 메뉴 이미지 노출 정책 확인

### Siri/Testing
- [ ] View Annotations 및 AppEntity 연결 검토
- [ ] `sessionWillBegin`의 애니메이션/modal 부작용 제거
- [ ] 사용자 드래그 UI를 `sessionDidMove`로 이전
- [ ] Device Hub/Previews Resize Mode에서 테스트
- [ ] 실제 iPad 및 iPhone Mirroring에서 검증
- [ ] Xcode modernization skill의 변경 사항 리뷰

## 🧠 핵심 메시지

현대적인 UIKit 앱은 기기의 종류와 방향이 아니라 **실제 scene·trait·view가 제공하는 환경**을 기준으로 동작해야 한다. 이 원칙이 iPhone 앱의 리사이징을 가능하게 하고, 새로운 sidebar/navigation UI 및 Siri의 콘텐츠 접근과도 자연스럽게 연결된다.

## 🔗 공식 참고 자료

- https://developer.apple.com/videos/play/wwdc2026/278/
- WWDC25 — Make your UIKit app more flexible
- Apple Developer — Transitioning to the UIKit scene-based life cycle
- Apple Developer — Automatic trait tracking
- Apple Developer — Adapting your app when traits change
- Apple Developer — TN3210: Optimizing your app for iPhone Mirroring
- WWDC26 — Get the most out of Device Hub
- WWDC26 — Explore advanced App Intents features for Siri and Apple Intelligence
