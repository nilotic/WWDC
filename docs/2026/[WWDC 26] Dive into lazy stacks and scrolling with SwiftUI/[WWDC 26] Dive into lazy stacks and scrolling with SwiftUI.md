# WWDC26 Dive into lazy stacks and scrolling with SwiftUI 요약

- Session: 321
- Title: Dive into lazy stacks and scrolling with SwiftUI
- Source: https://developer.apple.com/videos/play/wwdc2026/321/
- Topic: SwiftUI, LazyVStack, LazyHStack, ScrollView, Layout, Prefetching, Programmatic Scrolling
- Chapters: Introduction, Layout, Subview loading, Prefetching, Programmatic scrolling, Next steps

---

## 한 줄 요약

SwiftUI의 lazy stack은 보이지 않는 모든 subview를 미리 배치하지 않고 **이전에 배치한 view의 평균 크기로 전체 크기와 off-screen 위치를 추정**한다. 따라서 정확한 절대 offset에 의존하지 말고, leaf view가 항상 하나의 안정적인 subview로 resolve되도록 구성하며, prefetching이 재사용될 수 있게 `onAppear` 이전에 합리적인 초기 상태를 준비하고, 화면 표시 후 layout을 크게 바꾸지 않아야 부드럽고 신뢰할 수 있는 스크롤을 만들 수 있다.

---

## 핵심 요약

이번 세션은 `LazyVStack`과 `LazyHStack`의 동작을 네 가지 관점에서 설명한다.

- **Layout**
  - Lazy stack은 visible rect가 채워질 때까지만 subview를 평가하고 배치한다.
  - Off-screen subview의 크기는 이전에 배치한 view의 평균 크기로 추정한다.
  - 새로운 view를 만나며 추정치가 바뀌므로 전체 content size와 content offset은 정확하고 고정된 값이 아니다.
  - `LazyVStack`의 ideal width는 첫 번째 subview의 width를 기준으로 한다.
  - `LazyHStack`의 ideal height도 첫 번째 subview를 기준으로 한다.

- **Subview loading**
  - SwiftUI view 하나가 lazy stack 입장에서 항상 subview 하나로 보이는 것은 아니다.
  - `body`가 top-level view 여러 개를 반환하면 각각 별도 subview로 resolve될 수 있다.
  - 조건에 따라 0개 또는 1개의 subview를 반환하면 index 안정성을 위해 off-screen leaf view가 예상보다 오래 살아 있을 수 있다.
  - 필터링은 view body의 조건문이 아니라 data level에서 수행해야 한다.

- **Prefetching과 상태**
  - Lazy stack은 frame deadline 안에 여유가 있을 때 아직 화면에 들어오지 않은 view의 body evaluation과 layout 일부를 미리 수행한다.
  - `body`는 호출됐지만 scroll 방향이 바뀌어 `onAppear`가 호출되지 않을 수도 있다.
  - `onAppear`에서 view 전체를 다시 구성하거나 크기를 크게 바꾸면 prefetch 결과가 버려진다.
  - 화면 밖 view의 local state는 나중에 제거될 수 있으므로 오래 유지해야 하는 상태는 model이나 상위 view로 이동해야 한다.

- **Programmatic scrolling**
  - Off-screen target으로 스크롤할 수 있지만 target 위치는 추정된다.
  - `ForEach`의 각 item이 항상 하나의 subview로 resolve되면 ID lookup과 counting이 가장 효율적이다.
  - 표시 후 `onGeometryChange`로 state를 갱신해 layout을 다시 바꾸면 target 위치가 흔들린다.
  - SwiftUI layout primitive로 해결하기 어렵다면 custom `Layout`을 사용한다.

---

# 🦢 예제: Origami 앱

세션은 종이접기 단계를 보여주는 Origami 앱을 사용한다.

```swift
struct ContentView: View {
    var body: some View {
        ScrollView {
            LazyVStack {
                ForEach(steps) { step in
                    StepView(step: step)
                }
            }
        }
    }
}
```

`ScrollView` 안에 `LazyVStack`을 배치하고 각 단계를 `StepView`로 표현한다. 일반 `VStack`과 달리 lazy stack은 모든 단계를 즉시 평가하고 렌더링하지 않는다.

---

# 🧱 LazyVStack의 기본 Layout

화면에 세 개의 단계가 완전히 보이고 네 번째 단계의 일부만 보인다고 가정한다.

```text
Visible Rect
├─ Step 1
├─ Step 2
├─ Step 3
└─ Step 4 일부

Off-screen
├─ Step 5
├─ Step 6
└─ ...
```

Lazy stack은 visible rect가 채워질 때까지만 view를 배치한다. 스크롤하면 필요한 view를 추가하고 화면 밖으로 나간 view를 제거한다.

이 방식은 큰 콘텐츠를 모두 즉시 로드하는 `VStack`보다 효율적일 수 있다.

---

# 📏 효율성의 대가: 추정값

Lazy stack은 아직 로드하지 않은 subview의 실제 크기를 알 수 없다.

따라서 다음 정보를 이용해 off-screen 영역을 추정한다.

- 지금까지 배치한 view의 평균 크기
- 남아 있다고 추정되는 subview 수

```text
Estimated Remaining Height
≈
Average Height of Placed Views
×
Estimated Remaining View Count
```

새로운 view가 화면에 나타날 때마다 실제 크기를 학습하고 전체 높이 추정치를 수정한다.

따라서 다음 값은 처음부터 정확하지 않다.

- 전체 content height
- 현재 item 위쪽의 누적 공간
- ScrollView의 절대 content offset

---

# ↔️ 첫 번째 Subview가 Ideal Size의 기준

모든 subview를 미리 로드하지 않으므로 lazy stack은 전체 view 중 최대 크기를 찾을 수 없다.

- `LazyVStack`의 ideal width: 첫 번째 subview 기준
- `LazyHStack`의 ideal height: 첫 번째 subview 기준

수평 gallery의 첫 사진 설명은 한 줄인데 뒤쪽 설명은 세 줄이라면, `LazyHStack`은 뒤쪽 view의 더 큰 높이를 미리 알 수 없다. 긴 text가 잘릴 수 있으므로 height를 고정하거나 line limit으로 공간을 예약해야 한다.

```swift
Text(photo.description)
    .lineLimit(3, reservesSpace: true)
```

---

# 📱 회전과 Content Offset 보정

Portrait에서 landscape로 회전하면 text가 적은 줄에 들어가면서 `StepView` 높이가 줄어든다.

회전 중 lazy stack은 현재 가장 위에 보이는 view를 anchor로 유지한다. 하지만 위쪽 off-screen view의 새 높이는 아직 알 수 없다.

이후 위로 스크롤하면서 lazy stack은 위쪽 공간 추정을 수정하고 ScrollView의 content offset도 같은 양만큼 보정한다.

목표는 다음과 같다.

- 추정값은 변경 가능
- 현재 보이는 view의 상대 위치는 갑자기 튀지 않음
- 맨 위에 도착하면 content offset은 0

절대 offset을 장기적으로 안정적인 값으로 간주하면 안 되는 이유다.

---

# 🧩 Lazy Stack 중첩

Origami 완성 사진을 가로로 보여주기 위해 `LazyVStack` 안에 `LazyHStack`을 넣을 수 있다.

```swift
struct Showcase: View {
    var body: some View {
        ScrollView(.horizontal) {
            LazyHStack {
                ForEach(photos) { photo in
                    PhotoView(photo: photo)
                }
            }
        }
    }
}
```

중첩 lazy stack은 사용자가 아래까지 스크롤하지 않거나 horizontal gallery 전체를 탐색하지 않는 경우 불필요한 view 생성을 피한다.

---

# 📌 Section Header 고정

```swift
LazyVStack(pinnedViews: [.sectionHeaders]) {
    ForEach(steps) { step in
        StepView(step: step)
    }

    Section {
        ForEach(photos) { photo in
            PhotoView(photo: photo)
        }
    } header: {
        ShowcaseHeader()
    }
}
```

`pinnedViews`를 사용하면 showcase section header를 스크롤 상단에 고정할 수 있다.

---

# 🎞️ Scroll Transition과 원래 Frame

Lazy stack은 transform 후의 appearance가 아니라 **원래 layout position**을 기준으로 view를 로드한다.

다음처럼 rotation과 scale로 view를 원래 frame 밖으로 크게 밀면 실제로 보여야 할 view가 너무 일찍 사라질 수 있다.

```swift
.scrollTransition { effect, phase in
    effect
        .rotationEffect(.degrees(phase.value * 20))
        .scaleEffect(1 + phase.value * 0.2)
}
```

보다 안전한 transition은 원래 visible rect 판단을 깨지 않는다.

```swift
.scrollTransition { effect, phase in
    effect
        .scaleEffect(1 - abs(phase.value) * 0.1)
}
```

원칙:

> 원래 보이지 않는 view를 transform으로 visible rect 안으로 끌어오거나, 원래 보여야 하는 view를 원래 frame 밖으로 크게 밀어내지 않는다.

---

# 📐 절대 Content Offset보다 상대 Visibility

버튼을 상단 근처에서만 보이게 하기 위해 절대 offset을 사용할 수 있다.

```swift
.onScrollGeometryChange(for: Bool.self) { geometry in
    geometry.contentOffset.y <= 100
} action: { _, newValue in
    isScrollToShowcaseVisible = newValue
}
```

하지만 lazy stack의 content offset은 추정치가 보정될 때 바뀔 수 있다.

대신 어떤 target이 실제로 보이는지 관찰한다.

```swift
.onScrollTargetVisibilityChange(
    idType: Step.ID.self,
    threshold: 0.8
) { visibleIDs in
    isScrollToShowcaseVisible =
        shouldShowScrollButton(visibleIDs: visibleIDs)
}
```

현재 visible item의 관계는 전체 content size 추정보다 안정적이다.

---

# 🧬 View와 Resolved Subview

코드에서 선언한 `View` 하나가 lazy stack의 subview 하나와 항상 일치하는 것은 아니다.

기본 구조는 다음과 같다.

```text
ForEach item 1개
    ↓
StepView 1개
    ↓
Resolved subview 1개
```

이 경우 lazy stack이 index와 ID를 효율적으로 처리할 수 있다.

---

# ✌️ 하나의 View가 여러 Subview로 Resolve되는 경우

`StepView.body`가 layout container 없이 top-level view 두 개를 반환하면 각각 별도 subview로 resolve될 수 있다.

```swift
struct StepView: View {
    let step: Step

    var body: some View {
        StepDiagram(step: step)
        StepInstructions(step: step)
    }
}
```

LazyVStack 입장에서는 하나의 item이 `StepDiagram`과 `StepInstructions` 두 subview로 나뉜다.

---

# 🔀 Dynamic Number of Subviews

더 주의해야 할 패턴은 조건에 따라 0개 또는 1개의 subview를 반환하는 leaf view다.

```swift
struct StepView: View {
    let step: Step

    @Environment(\.detailLevel)
    var detailLevel

    var body: some View {
        if step.isVisible(in: detailLevel) {
            VStack {
                // ...
            }
        }
    }
}
```

Lazy stack은 visible subview를 index로 다룬다. 앞쪽 item의 subview 수가 바뀌면 뒤쪽 index도 달라진다.

따라서 environment가 바뀔 가능성에 대비해 이전 `StepView`를 예상보다 오래 유지해야 할 수 있다.

그 결과:

- Off-screen view body가 다시 평가될 수 있음
- Unrelated environment change도 비용 유발
- Leaf view의 state가 예상보다 오래 유지될 수 있음
- ID lookup과 programmatic scrolling 비용 증가

---

# ✅ Data Level에서 필터링

Leaf body의 조건문으로 item을 제거하지 말고 데이터 자체를 미리 필터링한다.

```swift
let visibleSteps = steps.filter {
    $0.isVisible(in: detailLevel)
}

LazyVStack {
    ForEach(visibleSteps) { step in
        StepView(step: step)
    }
}
```

SwiftData라면 `Query`의 `Predicate`를 사용한다.

이렇게 하면 lazy stack은 item 수와 index를 view construction 없이 즉시 이해할 수 있다.

---

# ⚠️ Optional Unwrapping도 같은 문제

Leaf view에서 optional을 unwrap하고 값이 있을 때만 content를 반환하는 것도 dynamic subview count를 만든다.

```swift
@Environment(\.apiToken)
private var apiToken

var body: some View {
    if let apiToken {
        StepContent(token: apiToken)
    }
}
```

더 나은 구조:

- Authentication은 model object가 관리
- 인증되지 않았다면 상위 hierarchy에서 `ContentUnavailableView` 표시
- Lazy stack 자체를 만들지 않음

Leaf item은 데이터 하나당 안정적으로 하나의 subview를 반환하도록 유지한다.

---

# ⚡ Lazy Stack의 최소 Diff

Lazy stack은 전체 데이터를 메모리에 유지하지 않으므로 매 업데이트마다 전체 content를 diff하지 않는다.

Visible 영역에 필요한 최소 변경만 확인한다.

이 효율성은 item과 resolved subview 구조가 안정적일수록 잘 작동한다.

---

# 🚀 Prefetching이 필요한 이유

ScrollView는 일정한 frame rate로 다음 작업을 제한된 시간 안에 수행해야 한다.

- Content offset 업데이트
- View의 새 위치 렌더링
- Scroll change에 대한 앱 logic
- 새 view body 평가
- Layout
- Rendering

새 view를 화면에 올리는 작업이 frame deadline을 넘으면 frame drop과 scrolling hitch가 발생한다.

---

# ⏩ Lazy Stack Prefetching

Lazy stack은 다음 view가 visible rect에 들어오기 전에 일부 작업을 미리 수행한다.

- View body 평가
- Layout 일부 계산
- Nested lazy stack 준비
- Rendering 준비

```text
Frame N
└─ 다음 View body 평가

Frame N+1
└─ Layout 일부 수행

Frame N+2
└─ View가 화면에 표시
```

실제 표시 시점의 비용을 여러 frame으로 분산한다.

---

# 🕰️ `body`와 `onAppear`는 같은 시점이 아니다

Prefetching 때문에 `body`는 화면에 나타나기 전에 호출될 수 있다.

```text
Prefetch로 body 호출
        ↓
사용자가 스크롤 방향을 반대로 전환
        ↓
View가 화면에 나타나지 않음
        ↓
onAppear 호출 안 됨
```

`body` 호출을 실제 표시와 동일하게 취급하면 안 된다.

---

# ♾️ Infinite Scrolling과 `onAppear`

`onAppear`는 마지막 loading view가 실제로 보일 때 다음 page를 요청하는 trigger로 사용할 수 있다.

```swift
ProgressView()
    .onAppear {
        loadNextPage()
    }
```

이런 용도는 적절하다.

하지만 모든 row가 `onAppear`에서 전체 setup을 수행하고 size와 content를 크게 바꾸면 prefetch 결과가 폐기된다.

문제:

- Prefetch 작업 재수행
- Layout 재계산
- 필요 이상으로 많은 view load
- Scroll hitch와 위치 변화

---

# ✅ 표시 전 합리적인 초기 상태 준비

가능하면 initializer 단계부터 view가 화면에 나타날 수 있는 합리적인 상태를 준비한다.

- 예상 image aspect ratio 확보
- Text line 수 예약
- Stable placeholder 사용
- Observable loader를 먼저 생성

Remote content는 cache와 연결된 loader를 initializer에서 만들면 prefetch 시점부터 요청을 시작할 수 있다.

---

# 🧠 Off-screen View의 메모리 수명

화면 밖 view는 즉시 삭제되지 않고 몇 차례 update 동안 유지될 수 있다.

하지만 나중에 실제로 삭제되면 해당 view의 `@State`도 함께 사라진다.

```swift
@State private var isHighlighted = false
```

이 상태를 영구적인 사용자 선택으로 사용하면 다시 스크롤했을 때 초기화될 수 있다.

오래 유지해야 하는 상태는 다음으로 옮긴다.

- Model object
- 상위 view state
- Binding
- Persistent store

Lazy view의 수명과 앱 데이터의 수명을 분리해야 한다.

---

# 🎯 Programmatic Scrolling

`ScrollPosition` binding을 사용하면 off-screen target으로도 스크롤할 수 있다.

Target이 아직 로드되지 않았다면 위치는 추정된다.

Animated scroll에서는 매 frame마다 새롭게 학습한 크기를 반영해 target 위치를 갱신한다.

가장 효율적인 구조는 다음과 같다.

```text
ForEach item 1개
        ↓
항상 resolved subview 1개
```

이 경우 lazy stack은 실제 view를 모두 생성하지 않고도 `ForEach`에서 target ID를 찾고 앞쪽 subview 수를 빠르게 계산할 수 있다.

---

# 📐 표시 후 Layout을 바꾸는 Geometry 패턴

다음 패턴은 scrolling을 불안정하게 만든다.

```swift
struct StepView: View {
    @State private var subtitleHeight: CGFloat = 0

    var body: some View {
        Text(step.subtitle)
            .onGeometryChange(for: CGFloat.self) { geometry in
                geometry.size.height
            } action: { _, newHeight in
                subtitleHeight = newHeight
            }

        StepDiagram()
            .frame(
                height: calculateDiagramHeight(
                    subtitleHeight: subtitleHeight
                )
            )
    }
}
```

과정:

1. Lazy stack이 원래 높이를 측정
2. View가 화면에 나타남
3. Geometry callback이 state 변경
4. Body 재평가
5. 전체 row 높이 변경
6. 아래 content가 밀림
7. Programmatic scroll target 위치 변경

---

# 🧰 Custom Layout 사용

여러 child의 크기 관계를 계산해야 한다면 state를 통한 두 번째 layout pass 대신 SwiftUI `Layout` protocol을 사용한다.

Custom layout은 geometry를 layout system 안에서 계산하므로 화면 표시 후 state를 변경해 다시 layout하는 패턴을 피할 수 있다.

---

# 🧭 주요 권장 사항

| 문제 | 피해야 할 방식 | 권장 방식 |
|---|---|---|
| Scroll 위치 판단 | Absolute content offset | Visible target 관계 |
| Item 필터링 | Leaf body의 `if` | Data level filter / Predicate |
| Optional content | Leaf에서 0/1 subview | 상위 hierarchy에서 상태 분기 |
| View 초기화 | `onAppear`에서 전체 구성 | 표시 전 합리적 초기 상태 |
| Remote loading | 화면 표시 후에만 시작 | Prefetch 시점 loader + cache |
| 장기 상태 | Row의 local `@State` | Model / parent / Binding |
| Programmatic scroll | Dynamic subview count | Item당 단일 subview |
| 크기 계산 | Geometry → State → Relayout | SwiftUI primitives / Custom Layout |
| Scroll transition | 원래 frame 밖으로 큰 이동 | Visible 판단을 깨지 않는 transform |

---

# 📋 체크리스트

## Layout

- [ ] `LazyVStack`의 ideal width가 첫 subview 기준임을 확인
- [ ] `LazyHStack`의 ideal height가 첫 subview 기준임을 확인
- [ ] 가변 높이 수평 콘텐츠에 fixed height 또는 line limit 적용
- [ ] Orientation 변경 후 absolute offset을 보존값으로 사용하지 않기
- [ ] Nested lazy stack의 크기 안정성 확인

## Scroll Transition

- [ ] Transform이 원래 visible rect 판단을 깨지 않는지 확인
- [ ] Off-screen view를 transform으로 화면 안으로 끌어오지 않기
- [ ] Visible view를 원래 frame 밖으로 과도하게 밀지 않기
- [ ] Rotation, offset, scale을 실제 스크롤에서 테스트

## Scroll Observation

- [ ] 절대 content offset 의존 최소화
- [ ] `onScrollTargetVisibilityChange` 활용 검토
- [ ] Item visibility threshold를 UI 요구에 맞게 설정
- [ ] 현재 visible ID 기반으로 상태 계산

## Subview 구조

- [ ] `ForEach` item이 항상 하나의 subview로 resolve되는지 확인
- [ ] Leaf body에 top-level view 여러 개가 있는지 점검
- [ ] Leaf body가 조건에 따라 0개 또는 1개 view를 반환하지 않는지 확인
- [ ] Optional unwrap으로 dynamic subview count를 만들지 않기
- [ ] Authentication과 empty state는 상위 hierarchy에서 처리

## Data Filtering

- [ ] View body 조건문 대신 data level에서 filter
- [ ] SwiftData라면 `Predicate` 사용
- [ ] Lazy stack이 item 수를 view 생성 없이 알 수 있게 구성
- [ ] Filter 변경 시 stable ID 유지

## Prefetching

- [ ] `body`가 `onAppear`보다 먼저 호출될 수 있음을 고려
- [ ] `body`가 호출돼도 실제로 화면에 나타나지 않을 수 있음을 고려
- [ ] `onAppear`에서 view 전체 구조를 바꾸지 않기
- [ ] Placeholder와 최종 content의 size 차이 최소화
- [ ] Infinite scroll trigger 용 `onAppear`는 별도로 관리
- [ ] Remote loader를 cache와 함께 조기 생성할지 검토

## State

- [ ] Scroll 밖으로 나간 view가 나중에 제거될 수 있음을 고려
- [ ] 오래 유지해야 하는 데이터를 local `@State`에만 두지 않기
- [ ] Model object, parent state, binding 사용
- [ ] View 재생성 후에도 선택·강조 상태가 복원되는지 테스트

## Programmatic Scrolling

- [ ] Stable ID 사용
- [ ] Item당 resolved subview 하나 유지
- [ ] Target 앞의 subview 수를 빠르게 count할 수 있는지 확인
- [ ] Data filtering을 view body 바깥에서 수행
- [ ] Off-screen target으로 animated scroll 테스트
- [ ] Target 도달 중 layout 변화가 없는지 확인

## Layout 변경

- [ ] `onGeometryChange`로 state를 설정하고 다시 layout하는 패턴 점검
- [ ] View가 나타난 뒤 height가 크게 바뀌지 않는지 확인
- [ ] SwiftUI layout primitive로 해결 가능한지 검토
- [ ] 필요하면 custom `Layout` 구현
- [ ] Dynamic Type과 rotation에서도 layout 안정성 테스트

---

# ⚠️ 자주 발생하는 오해

## Lazy stack의 content size는 처음부터 정확하지 않다

Off-screen view를 모두 측정하지 않기 때문에 전체 높이와 target 위치는 추정된다.

## 화면 밖 view가 즉시 deinit되는 것은 아니다

일정 기간 유지될 수 있지만 결국 삭제될 수 있다. 중요한 상태의 영속성을 view 수명에 의존하면 안 된다.

## `body` 호출은 `onAppear`가 아니다

Prefetching으로 body가 먼저 평가되고 실제 표시가 취소될 수 있다.

## 조건문으로 숨긴 view는 비용이 0이 아니다

Leaf view의 dynamic subview count는 index와 lifetime 관리 비용을 증가시킬 수 있다.

## Programmatic scrolling은 모든 구조에서 같은 비용이 아니다

Item당 하나의 안정적인 subview로 구성할 때 ID 검색과 위치 추정이 가장 효율적이다.

---

# 핵심 메시지

Lazy stack의 성능은 단순히 `VStack`을 `LazyVStack`으로 바꾸는 것만으로 완성되지 않는다.

Lazy stack은 필요한 view만 로드하는 대신 보이지 않는 영역의 크기와 위치를 추정한다. 따라서 절대 content offset과 정확한 전체 size에 의존하는 UI는 불안정할 수 있다.

또한 SwiftUI의 source-level `View`와 lazy stack이 다루는 resolved subview가 항상 일대일이라는 보장은 없다. Leaf item이 조건에 따라 다른 수의 subview를 만들면 lazy stack은 index 안정성을 위해 view를 오래 유지하고, ID lookup과 programmatic scrolling을 위해 더 많은 work를 해야 한다.

Prefetching은 view가 보이기 전에 body와 layout 일부를 수행해 frame hitch를 줄인다. 하지만 `onAppear`에서 전체 content와 size를 바꾸면 그 작업이 폐기된다.

화면 밖 view의 state는 영구 저장소가 아니므로 중요한 상태는 model과 상위 hierarchy에 둬야 한다.

가장 안정적인 lazy stack 구조는 다음과 같다.

```text
Filtered, stable data
        ↓
ForEach의 stable ID
        ↓
Item당 하나의 resolved subview
        ↓
표시 전 준비된 안정적인 layout
        ↓
Prefetching 재사용
        ↓
Relative visibility 기반 scroll logic
```

이 구조를 지키면 lazy stack의 추정·prefetch·programmatic scrolling 메커니즘을 방해하지 않고 긴 SwiftUI 콘텐츠를 부드럽게 제공할 수 있다.

---

# 함께 보면 좋은 세션

- Code-along: Build powerful drag and drop in SwiftUI
- Compose custom layouts with SwiftUI — WWDC22
- Stacks, Grids, and Outlines in SwiftUI — WWDC20
