# Tech Talk 111463 Strike a pose with adaptive layouts on iPhone Duo 요약

- Session: Tech Talks 111463
- Title: Strike a pose with adaptive layouts on iPhone Duo
- Source: https://developer.apple.com/videos/play/tech-talks/111463/
- Topic: iPhone Duo, Adaptive Layout, Reserved Regions, Displacement, SwiftUI, UIKit, ArrangementView, UIArrangementViewController
- Chapters: Reserved regions on iPhone Duo, Designing around the hinge, Displacement patterns, Query reserved regions, System containers, Arrangements, Split, Overlay, Next steps

---

## 한 줄 요약

iPhone Duo에서 좋은 적응형 레이아웃의 핵심은 **힌지와 카메라를 reserved region으로 인식하고, 필요한 요소만 displacement로 이동·크기 조정하며, 가능한 경우 시스템 컨테이너의 자동 적응을 활용하고, 두 개의 콘텐츠 영역을 직접 조합해야 할 때는 iOS 27.1의 새 `ArrangementView` / `UIArrangementViewController`를 사용해 split 또는 overlay 패턴으로 대응하는 것**이다.

---

## 핵심 요약

이번 세션은 iPhone Duo의 접힘 상태와 하드웨어 제약을 단순한 예외 처리로 보지 않고, 기존 responsive layout의 연장선에서 다루는 방법을 설명한다.

핵심 원칙:

- iPhone Duo의 각 display는 각자의 size class를 가진다.
- Hinge와 camera는 **reserved regions**로 모델링된다.
- 모든 콘텐츠를 접힘 상태마다 재배치할 필요는 없다.
- 스크롤이 자연스러운 콘텐츠는 그대로 유지하는 것이 좋다.
- 중요한 요소만 **displacement**로 옮긴다.
- Alert, popover, split view 같은 시스템 component는 많은 경우 자동으로 reserved region을 피한다.
- Custom layout에서는 SwiftUI `GeometryProxy.reservedRegions(...)` 또는 UIKit `UIView.reservedRegions(...)`를 사용한다.
- Reserved region은 크게:
  - `.division`
  - `.occlusion`
  두 종류로 나뉜다.
- inactive region도 `.includeInactive`로 가져올 수 있다.
- 새 `ArrangementView`는 두 view를 다양한 device pose에 맞춰 자동 배치하는 layout container다.
- `split`과 `overlay` 두 arrangement가 대표적이다.
- Arrangement는 navigation container도 아니고 scroll container도 아니다.

---

# 📱 iPhone Duo의 Layout 환경

iPhone Duo는 단순히 넓어진 iPhone 화면이 아니다.

세션은 다음 세 요소가 layout을 결정한다고 설명한다.

```text
Multiple Displays
      +
Each Display's Size Class
      +
Hardware Reserved Regions
      ↓
Available Layout Space
```

Reserved region의 대표 예:

- Outer display camera
- Inner display FaceTime camera
- Fold / hinge

이들은 iPadOS의 window control처럼 **이미 존재하는 layout 제약의 또 다른 형태**로 다루는 것이 기본 접근이다.

---

# 🧩 Reserved Region

Apple은 hinge와 camera 같은 hardware 영역을 **reserved regions**라고 부른다.

```text
View Bounds
   ↓
Reserved Region
   ↓
실제로 콘텐츠가 자유롭게 사용할 수 있는 영역 조정
```

두 가지 종류가 중요하다.

## Division Region

더 큰 영역을 여러 개의 usable region으로 나눈다.

대표 예:

```text
Inner Display Fold
```

기기가 book-like pose로 접히면 중앙 fold가 화면을 두 usable region으로 나눈다.

## Occlusion Region

영역을 나누지는 않고 특정 frame을 가린다.

대표 예:

```text
FaceTime Camera
```

---

# 📖 힌지를 가로지르는 콘텐츠의 문제

세션은 책의 두 페이지를 가로지르는 사진을 비유로 사용한다.

```text
Left Page | Spine | Right Page
```

사진이 spine을 가로지르면 중앙 일부가 읽기 어렵듯, 앱의 콘텐츠와 control도 fold를 가로지르면 동일한 문제가 생긴다.

따라서 중요한 content가 hinge 중앙에 걸리지 않도록 layout이 적절히 적응해야 한다.

---

# ↔️ Displacement 패턴

모든 layout을 새로 만드는 대신 Apple은 **displacement**라는 design pattern을 제안한다.

정의:

> Available space에 따라 기존 element의 frame을 조정해서 중요한 콘텐츠와 control을 visible, reachable, unobstructed 상태로 유지하는 것.

가장 단순한 예:

```text
Device Open
      ↓
Element centered
      ↓
Device Folded
      ↓
Purpose에 적합한 usable region으로 이동
```

---

# 🎯 Displacement의 Scope

Displacement는 반드시 작은 버튼 하나에만 적용되는 것이 아니다.

가능한 범위:

- Single button
- Context menu
- Container
- Large section of layout

원칙:

```text
독립적으로 적응 가능한 요소
→ 독립적으로 이동

서로 관계가 강한 요소
→ 함께 이동
```

예를 들어 photo와 context menu가 함께 의미를 가진다면 둘을 같이 이동해 관계를 유지한다.

---

# ⚠️ Excessive Movement를 피하기

요소를 원래 위치에서 너무 멀리 이동시키면 visual relationship이 약해진다.

따라서 displacement는:

- 필요한 경우에만
- 최소 범위로
- 관련 요소끼리 함께

적용하는 것이 좋다.

---

# 📜 스크롤 콘텐츠는 Displace하지 않는다

Apple은 다음 콘텐츠를 특별히 언급한다.

- Articles
- Feeds
- Documents
- Lists

이런 콘텐츠는 이미 scrolling을 통해 layout 변화에 자연스럽게 적응한다.

따라서:

```text
Continuous Scrolling Content
→ Displacement하지 않음
```

스크롤 흐름을 region 사이로 강제로 옮기면 reading continuity가 깨질 수 있다.

---

# 🧭 어디로 이동시킬 것인가

Displacement의 destination은 단순히 왼쪽/오른쪽 규칙으로 정하면 안 된다.

**Element의 purpose와 현재 device pose**가 기준이다.

---

# 📖 Book-like Pose

기기가 책처럼 접혀 있을 때 alert 같은 element는 trailing side로 이동할 수 있다.

이유:

- Device가 닫히면 outer display로 experience가 이어질 수 있음
- Trailing region이 그 transition에 더 자연스러운 위치가 될 수 있음

---

# 🪑 Tabletop Pose

기기가 table 위에 세워진 경우 두 region은 다른 역할을 가질 수 있다.

```text
Top Region
→ 멀리서 보는 Content

Bottom Region
→ Touch Controls
```

예:

- Top: video, status, visual content
- Bottom: media controls, buttons

Interactive control은 안정적인 touch surface에 두는 것이 좋다.

---

# 🔍 Context를 유지하는 배치

여러 region 중 어느 쪽도 사용할 수 있다면 **contextual relationship을 우선**한다.

세션의 Search 예:

```text
Search Field
      ↓
Keyboard와 검색 대상 View의 context 유지
```

Open state에서는 넓은 공간을 활용하고, folded state에서는 실제 검색 대상 view 위로 위치와 width가 적응한다.

---

# 📐 새로운 Region에 맞춘 Adaptation

Element를 새 region으로 옮긴 뒤에는 위치만 바꾸는 것이 아니라 추가 adaptation도 고려한다.

가장 흔한 변화:

- Position
- Size

그 외 visual property도 변경 가능하다.

---

# 🪟 System Presentation은 자동으로 대응

다음 lightweight contextual component는 system이 reserved region을 피하도록 자동 배치한다.

- Action sheets
- Alerts
- Menus
- Popovers

목표:

```text
Reserved Region과 겹쳐도
→ 전체 UI가 visible하도록 재배치
```

---

# 🧱 Split View의 자동 대응

Reminders 같은 split view에서는 system이 양쪽 column을 visible하게 유지하도록 width와 position을 조정한다.

예:

```text
Open
Left | Right

Folded
Left 50% | Fold | Right 50%
```

---

# 🔲 Grid의 Hinge 대응

Fitness grid 예에서는 outer margin을 유지하면서 fold 주변 spacing을 늘린다.

```text
Outer Margin 유지
+
Hinge 주변 Gutter 증가
+
각 Cell을 각 Region 안에 유지
```

중요한 것은 새 콘텐츠를 만드는 것이 아니라 **기존 콘텐츠를 move / resize / reorganize**하는 것이다.

---

# 🧑‍💻 SwiftUI에서 Reserved Region 조회

SwiftUI에서는 `GeometryReader` 또는 `onGeometryChange`에서 얻은 `GeometryProxy`를 사용한다.

공식 코드:

```swift
GeometryReader { proxy in
    let regions = proxy.reservedRegions(
        kind: .division
    )
}
```

`.division`은 fold처럼 큰 영역을 여러 usable region으로 나누는 hardware feature를 나타낸다.

---

# 🧑‍💻 UIKit에서 Reserved Region 조회

UIKit에서는 `UIView`의 API를 사용한다.

```swift
let regions = view.reservedRegions(
    kind: .division
)

let frames = regions.map(\.frame)
```

각 reserved region의 `frame`을 custom layout 계산에 사용할 수 있다.

---

# 🟢 Active / Inactive Region

Reserved region에는 state가 있다.

```text
Active
Inactive
```

기본 query는 active region만 반환한다.

Fold 예:

```text
Device Folded
→ Division Region Active

Device Flat
→ Division Region Inactive
→ Width = 0
```

---

# 👀 Inactive Region도 Query하기

SwiftUI 예:

```swift
GeometryReader { proxy in
    let regions = proxy.reservedRegions(
        kind: .division,
        options: .includeInactive
    )

    let frames = regions.map(\.frame)
}
```

Inactive region은 현재 layout을 막지는 않지만 **device capability에 따른 high-level decision**에 사용할 수 있다.

예:

```text
Division Region이 존재하는 Device
→ Grid column을 짝수로 선호
```

Device가 지금 flat이어도 fold capability를 고려한 layout policy를 미리 선택할 수 있다.

---

# 📷 Occlusion Region

FaceTime camera는 `.occlusion` reserved region으로 표현된다.

```swift
GeometryReader { proxy in
    let regions = proxy.reservedRegions(
        kind: .occlusion
    )

    let frames = regions.map(\.frame)
}
```

특징:

- Display를 둘로 나누지 않음
- 특정 frame을 가림
- Camera active state에 따라 region도 active/inactive

---

# 🧰 System Container를 우선 사용

Apple은 custom region query를 쓰기 전에 system container가 자동 적응하는지 확인할 것을 권장한다.

Navigation container:

- `NavigationStack`
- `NavigationSplitView`
- `TabView`

Content container:

- `List`
- `ScrollView`

이 component들은 iPhone Duo의 fold에 많은 behavior를 자동으로 제공한다.

---

# 🆕 Arrangement라는 Layout Container

Navigation container와 content container 사이에 새로운 유형이 추가됐다.

```text
Navigation Container
      ↓
Arrangement Container
      ↓
Content Views
```

Arrangement는 **두 view를 일련의 규칙에 따라 배치하는 layout container**다.

---

# 🎧 Podcasts 예제

Podcast 앱의 Now Playing과 Transcript를 예로 든다.

Wide layout:

```text
Now Playing | Transcript
```

iPhone Duo가 fold된 상태에서도 이 split 관계가 자연스럽다.

그러나 Transcript를 숨긴 경우 Now Playing view는 전체 화면 중앙으로 돌아가지 않고 **fold가 정의한 왼쪽 region 안에 머문다.**

이렇게 하면 control이:

- Reachable
- Unobstructed

상태를 유지한다.

---

# 📐 Arrangement는 Inputs → Outputs 함수

Apple은 arrangement를 다음과 같이 정의한다.

Inputs:

- Horizontal size class
- Vertical size class
- Width / height aspect ratio
- Active division regions

Outputs:

- View를 보여줄지 여부
- View frame
- View 관계

개념적으로:

```text
Arrangement(
  sizeClasses,
  aspectRatio,
  reservedRegions
)
    ↓
View Visibility + Frames
```

System-provided arrangement는 **iOS 27.1**부터 앱에서 사용할 수 있다.

---

# 🧱 SwiftUI `ArrangementView`

공식 예:

```swift
var body: some View {
    NavigationStack {
        ArrangementView {
            PlayerView()
        } secondary: {
            UpNextView()
        }
    }
}
```

두 역할:

```text
Primary
Secondary
```

여기서는:

- Primary → `PlayerView`
- Secondary → `UpNextView`

---

# 🧱 UIKit `UIArrangementViewController`

```swift
let arrangementVC = UIArrangementViewController()
let navController = UINavigationController(
    rootViewController: arrangementVC
)

let playerVC = PlayerViewController()
arrangementVC.setViewController(
    playerVC,
    for: .primary
)

let upNextVC = UpNextViewController()
arrangementVC.setViewController(
    upNextVC,
    for: .secondary
)
```

SwiftUI와 동일하게 primary / secondary view controller를 설정한다.

---

# ↔️ Split Arrangement

기본 arrangement style은 `split`이다.

```swift
.arrangementViewStyle(.split)
```

기본 규칙:

```text
Width > Height
→ Horizontal Split

Height > Width
→ Vertical Split
```

즉 device orientation과 container aspect ratio에 따라 자동 적응한다.

---

# 🔒 Split Axis 제한

특정 UI에서는 split direction을 제한할 수 있다.

```swift
.arrangementViewStyle(
    .split.axes(.horizontal)
)
```

이 경우 horizontal split만 허용된다.

만약 현재 primary axis와 허용 axis가 맞지 않아 split이 불가능하면 ArrangementView는 single view만 표시할 수 있다.

세션에서는 PlayerView만 보이도록 처리된다.

---

# 🧱 UIKit Split 설정

```swift
let arrangementVC = UIArrangementViewController()

arrangementVC.updateArrangement(
    .split.axes(.horizontal)
)
```

SwiftUI의 `.split.axes(.horizontal)`과 같은 개념이다.

---

# 🪟 Overlay Arrangement

두 번째 system arrangement는 `overlay`다.

```swift
.arrangementViewStyle(.overlay)
```

Split이 side-by-side를 우선하는 반면 overlay는 content를 위/아래 또는 foreground/background 관계로 배치하는 데 적합하다.

---

# 🔄 Fold 상태에서 Overlay의 변화

Open state에서는 overlay relationship을 유지하다가 device가 fold되면 two-region layout을 활용해 side-by-side로 전환할 수 있다.

```text
Open
Foreground over Background

Folded
Primary | Secondary
```

이때 secondary view가 더 큰 공간을 얻을 수 있다.

---

# 🧭 `overlayArrangementZIndex`

SwiftUI에서 overlay arrangement의 현재 placement state를 읽을 수 있다.

```swift
enum UpNextMinimization {
    case collapsed
    case expanded
}

struct UpNextView: View {
    @Environment(\.overlayArrangementZIndex)
    private var zIndex: Int

    var body: some View {
        UpNextList(
            minimization: minimization
        )
    }

    var minimization: UpNextMinimization {
        zIndex > 0
            ? .collapsed
            : .expanded
    }
}
```

이 값을 통해 device가 fold/unfold될 때 view representation도 함께 바꿀 수 있다.

예:

```text
Overlay foreground 상태
→ Collapsed

Side-by-side 상태
→ Expanded
```

---

# 🧱 UIKit에서 Z Index 읽기

```swift
let arrangementVC = UIArrangementViewController()

let primaryState = arrangementVC.state(
    for: .primary
)

myModel.minimization =
    (primaryState?.zIndex ?? 0) > 0
        ? .collapsed
        : .expanded
```

`state(for:)`에서 view placement state를 얻고 `zIndex`를 읽는다.

---

# 🤔 Split과 Overlay 중 무엇을 선택할까

Apple은 기존 앱 pattern을 먼저 보라고 권장한다.

## 기존 HStack / VStack 패턴

```text
→ Split Arrangement
```

## 기존 ZStack 패턴

```text
→ Overlay Arrangement
```

새 component를 도입하더라도 앱의 기존 visual model과 일관성을 유지하는 것이 우선이다.

---

# 🪟 Overlay가 적합한 경우

Foreground / background relationship이 명확한 경우.

세션 예:

```text
Accessibility Reader
```

- Foreground → Controls
- Background → Readable content

Background content가 부분적으로 가려져도 scroll할 수 있기 때문에 overlay가 자연스럽다.

---

# ↔️ Split이 적합한 경우

Main / detail relationship이 있는 경우.

세션 예:

```text
Podcast Now Playing
+
Transcript
```

Transcript는 현재 playing content에 대한 detail이다.

두 view 모두 가려지면 안 되므로 split이 적합하다.

Audio Note 예에서도:

- Player → Main
- Up Next → Detail

관계이므로 split을 선택한다.

---

# 🚫 ArrangementView를 사용하지 말아야 할 경우

ArrangementView는 모든 two-pane UI의 대체재가 아니다.

---

# 🧭 Navigation Infrastructure가 아니다

ArrangementView 자체는 navigation을 제공하지 않는다.

따라서:

```text
ArrangementView 안에 NavigationSplitView
→ 피하기
```

Navigation과 layout responsibility를 섞지 않는다.

---

# 📜 Scroll Container 내부에도 넣지 않는다

Apple은 다음 내부에 ArrangementView를 넣지 말라고 권장한다.

- `List`
- `ScrollView`

Scroll container의 layout 특성과 ArrangementView의 adaptive placement가 충돌할 수 있다.

---

# 🧭 권장 Audit 순서

세션 마지막에 Apple은 기존 앱을 다음 순서로 점검하라고 제안한다.

## 1. Centered Layout 찾기

```text
현재 중앙 정렬 UI
→ Fold 시 적절한가?
```

검토:

- Two-column으로 만들 수 있는가?
- Displacement가 필요한가?

## 2. Standard System Container 확인

NavigationStack, NavigationSplitView, TabView, List, ScrollView 등을 사용 중이면 많은 adaptive behavior를 자동으로 얻는다.

## 3. Custom Split / Overlay 찾기

현재 `HStack`, `VStack`, `ZStack` 등으로 직접 구현한 two-view layout이 있다면:

```text
ArrangementView 도입 검토
```

## 4. Manual Layout Control 점검

특히 중요한 control을 직접 배치하고 있다면:

```text
ReservedRegions API
→ Custom Displacement
```

을 적용한다.

---

# 🧩 Division vs Occlusion 정리

| Kind | 의미 | iPhone Duo 예 | Layout 영향 |
|---|---|---|---|
| `.division` | 하나의 큰 영역을 여러 usable region으로 분리 | Fold / hinge | Content를 region 단위로 배치 |
| `.occlusion` | 일부 frame을 가림 | FaceTime camera | 해당 frame을 피해서 배치 |

---

# 🟢 Active vs Inactive 정리

| State | 의미 | 기본 Query | 활용 |
|---|---|---|---|
| Active | 현재 layout에 실제 영향 | 반환됨 | 즉시 layout 계산 |
| Inactive | 현재 영향 없음 | 기본 제외 | Device capability 기반 high-level decision |

Inactive region을 포함하려면:

```swift
options: .includeInactive
```

---

# ↔️ Split vs Overlay 정리

| 항목 | Split | Overlay |
|---|---|---|
| 기본 관계 | Main / Detail | Foreground / Background |
| Content occlusion | 피함 | 일부 허용 가능 |
| 기존 패턴 | HStack / VStack | ZStack |
| Wide layout | Side by side | Overlay 또는 adaptive |
| Folded layout | Region별 분할 | Side by side로 전환 가능 |
| 예 | Podcasts transcript | Accessibility Reader controls |

---

# 🧩 주요 API 정리

| API | 역할 |
|---|---|
| `GeometryProxy.reservedRegions(kind:)` | SwiftUI에서 reserved region 조회 |
| `UIView.reservedRegions(kind:)` | UIKit에서 reserved region 조회 |
| `.division` | 영역을 여러 usable region으로 나누는 reserved region |
| `.occlusion` | 일부 frame을 가리는 reserved region |
| `.includeInactive` | inactive reserved region까지 query |
| `ArrangementView` | SwiftUI two-view adaptive layout container |
| `UIArrangementViewController` | UIKit arrangement container |
| `.arrangementViewStyle(.split)` | Split arrangement |
| `.split.axes(...)` | Split 가능 axis 제한 |
| `.arrangementViewStyle(.overlay)` | Overlay arrangement |
| `overlayArrangementZIndex` | SwiftUI overlay placement state 확인 |
| `state(for:)` | UIKit view placement state 조회 |
| `updateArrangement(...)` | UIKit arrangement 변경 |

---

# 🧑‍💻 공식 코드 모음

## SwiftUI Division Region

```swift
GeometryReader { proxy in
    let regions = proxy.reservedRegions(
        kind: .division
    )
}
```

## UIKit Division Region

```swift
let regions = view.reservedRegions(
    kind: .division
)

let frames = regions.map(\.frame)
```

## Include Inactive

```swift
GeometryReader { proxy in
    let regions = proxy.reservedRegions(
        kind: .division,
        options: .includeInactive
    )

    let frames = regions.map(\.frame)
}
```

## Occlusion Region

```swift
GeometryReader { proxy in
    let regions = proxy.reservedRegions(
        kind: .occlusion
    )

    let frames = regions.map(\.frame)
}
```

## ArrangementView

```swift
var body: some View {
    NavigationStack {
        ArrangementView {
            PlayerView()
        } secondary: {
            UpNextView()
        }
    }
}
```

## UIArrangementViewController

```swift
let arrangementVC = UIArrangementViewController()
let navController = UINavigationController(
    rootViewController: arrangementVC
)

let playerVC = PlayerViewController()
arrangementVC.setViewController(
    playerVC,
    for: .primary
)

let upNextVC = UpNextViewController()
arrangementVC.setViewController(
    upNextVC,
    for: .secondary
)
```

## Split Style

```swift
ArrangementView {
    PlayerView()
} secondary: {
    UpNextView()
}
.arrangementViewStyle(.split)
```

## Horizontal-only Split

```swift
.arrangementViewStyle(
    .split.axes(.horizontal)
)
```

## UIKit Split Update

```swift
arrangementVC.updateArrangement(
    .split.axes(.horizontal)
)
```

## Overlay

```swift
ArrangementView {
    UpNextView()
} secondary: {
    PlayerView()
}
.arrangementViewStyle(.overlay)
```

## SwiftUI Overlay Z Index

```swift
@Environment(\.overlayArrangementZIndex)
private var zIndex: Int
```

## UIKit Placement State

```swift
let primaryState = arrangementVC.state(
    for: .primary
)

myModel.minimization =
    (primaryState?.zIndex ?? 0) > 0
        ? .collapsed
        : .expanded
```

---

# 📋 체크리스트

## 기존 앱 Layout Audit

- [ ] 중앙 정렬된 주요 UI 목록화
- [ ] Fold 중앙에 걸리는 content 확인
- [ ] Two-column layout으로 자연스럽게 바꿀 수 있는지 검토
- [ ] Displacement가 필요한 요소만 선별
- [ ] Continuous scrolling content는 displacement 대상에서 제외
- [ ] Visual relationship이 강한 요소는 함께 이동
- [ ] 과도한 movement 피하기

## Reserved Region

- [ ] `.division` region 확인
- [ ] `.occlusion` region 확인
- [ ] Active state만 필요한지 판단
- [ ] `.includeInactive` 활용 여부 검토
- [ ] Frame 기반 custom layout 계산
- [ ] Fold가 flat일 때 width 0인지 고려
- [ ] Camera active/inactive 변화 대응

## Pose별 UX

- [ ] Book-like pose에서 trailing region 활용 검토
- [ ] Tabletop pose에서 top = viewing, bottom = controls 구조 검토
- [ ] Contextual element가 관련 content와 가까운지 확인
- [ ] Outer display transition과 placement continuity 확인

## System Container

- [ ] `NavigationStack` 우선 활용
- [ ] `NavigationSplitView` 우선 활용
- [ ] `TabView` 우선 활용
- [ ] `List` / `ScrollView`가 자동 적응하는지 확인
- [ ] System presentation이 reserved region을 자동 피하는지 테스트

## ArrangementView

- [ ] 기존 HStack/VStack pattern이면 split 검토
- [ ] 기존 ZStack pattern이면 overlay 검토
- [ ] Main/detail이면 split 우선
- [ ] Foreground/background이면 overlay 우선
- [ ] Primary/secondary role 명확히 정의
- [ ] Orientation별 split axis 테스트
- [ ] 필요한 경우 `.split.axes(.horizontal)` 적용
- [ ] Overlay에서 Z index에 따른 representation 변경 검토

## UIKit

- [ ] `UIArrangementViewController` 적용 검토
- [ ] Primary/secondary view controller 지정
- [ ] `updateArrangement`으로 style/axis 구성
- [ ] `state(for:)`로 placement state 읽기
- [ ] Navigation controller와 responsibility 분리

## 피해야 할 구성

- [ ] ArrangementView 안에 NavigationSplitView 넣지 않기
- [ ] List 안에 ArrangementView 넣지 않기
- [ ] ScrollView 안에 ArrangementView 넣지 않기
- [ ] 모든 콘텐츠를 fold마다 무조건 이동시키지 않기
- [ ] 스크롤 continuity를 displacement로 끊지 않기

## 테스트

- [ ] Device flat
- [ ] Partially folded book pose
- [ ] Tabletop pose
- [ ] Width > Height
- [ ] Height > Width
- [ ] Camera active
- [ ] Camera inactive
- [ ] Outer display continuation
- [ ] Split / overlay 각각의 visual continuity
- [ ] Touch reachability
- [ ] Important content occlusion 여부

---

# ⚠️ 구현 시 주의할 점

## Reserved Region은 iPhone Duo 전용 사고방식이 아니다

Apple은 기존에 resizable layout을 잘 구성했다면 같은 adaptive design 원칙의 연장으로 접근하라고 설명한다.

즉 Duo 전용 hard-coded frame보다 일반적인 responsive rule이 우선이다.

## Displacement는 콘텐츠 추가가 아니다

Displacement의 본질은:

```text
Move
Resize
Reorganize
```

이다.

기능을 삭제하거나 다른 experience로 바꾸는 것이 아니다.

## Continuous Scroll은 그대로 두는 것이 좋다

Article이나 feed가 fold를 만난다고 두 region 사이를 강제로 jump시키면 reading continuity가 무너진다.

## Inactive Region도 중요하다

현재 flat 상태에서 width 0이라고 해서 쓸모없는 정보가 아니다.

Device capability 기반 layout policy를 선택하는 데 사용할 수 있다.

## ArrangementView는 Navigation이나 Scroll의 대체재가 아니다

두 view를 배치하는 layout container라는 역할에 집중한다.

---

# 🎯 실전 선택 흐름

```text
현재 Layout이 System Container인가?
      │
      ├─ Yes
      │    → 자동 적응을 먼저 활용
      │
      └─ No
           ↓
     두 View 관계인가?
           │
           ├─ HStack/VStack 또는 Main/Detail
           │    → Split Arrangement
           │
           ├─ ZStack 또는 Foreground/Background
           │    → Overlay Arrangement
           │
           └─ Custom Manual Layout
                ↓
          ReservedRegions API
                ↓
          필요한 Element만 Displacement
```

---

# 핵심 메시지

iPhone Duo 대응의 가장 중요한 원칙은 **접힘 상태별로 완전히 다른 UI를 만드는 것이 아니라, 기존 interface를 가능한 한 그대로 유지하면서 실제로 문제가 되는 요소만 적응시키는 것**이다.

Fold와 camera는 reserved region으로 제공되며, 대부분의 system container와 presentation은 이 영역을 자동으로 고려한다.

Custom layout에서는 `reservedRegions`를 통해 division과 occlusion 영역을 읽고 필요한 요소만 displacement한다.

새 `ArrangementView`와 `UIArrangementViewController`는 기존 HStack/VStack 또는 ZStack 기반 two-view layout을 iPhone, iPad, iPhone Duo의 다양한 size class와 fold pose에 맞춰 자동 적응시키는 중간 수준의 layout abstraction이다.

```text
System Containers
      ↓
가능하면 그대로 사용

Custom Two-view Layout
      ↓
ArrangementView

Manual High-priority Controls
      ↓
ReservedRegions + Displacement
```

그리고 split과 overlay의 선택 기준은 기술적인 것이 아니라 content relationship이다.

```text
Main / Detail
→ Split

Foreground / Background
→ Overlay
```

결국 Apple이 제안하는 방향은 명확하다.

**모든 것을 움직이지 말고, 필요한 것만 움직이며, 가능한 곳에서는 시스템의 adaptive behavior를 활용한다.**

---

# 함께 보면 좋은 세션과 자료

- Raise the bar with iPhone Duo — Tech Talks
- Leverage multiple displays and scenes on iPhone Duo — Tech Talks
- Prepare your app for iPhone Duo — Tech Talks
- Reserved Regions API
- ArrangementView
- UIArrangementViewController
