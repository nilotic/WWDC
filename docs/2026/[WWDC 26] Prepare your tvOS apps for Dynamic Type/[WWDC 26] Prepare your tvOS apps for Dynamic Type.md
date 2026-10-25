# WWDC26 — Prepare your tvOS apps for Dynamic Type

- **Session:** 221
- **Title:** Prepare your tvOS apps for Dynamic Type
- **Source:** https://developer.apple.com/videos/play/wwdc2026/221/
- **Basis:** Apple Developer 공식 전체 transcript 및 Code 섹션
- **Platform:** tvOS 27
- **Topics:** Accessibility, Dynamic Type, Large Text, SwiftUI, UIKit

---

## 🎯 한 줄 요약

tvOS 27에서 **Large Text가 시스템 전반에 도입**되면서 tvOS 앱도 Dynamic Type을 본격적으로 지원해야 한다. 표준 UIKit/SwiftUI 컴포넌트는 대부분 자동으로 확장되므로, 앱에서는 **hard-coded font size와 고정 width/height를 제거하고**, 필요할 때 `dynamicTypeSize` 또는 `preferredContentSizeCategory`를 기준으로 **grid 수, stack 방향, 셀 크기**를 재구성하는 것이 핵심이다.

---

## 🧭 세션 구성

| 시간 | 챕터 |
|---|---|
| 0:01 | Introduction |
| 2:46 | Identify common issues |
| 6:13 | Adapt your layout |

Apple은 이 세션을 세 단계로 구성한다.

1. tvOS 27에서 Large Text가 어떻게 동작하는지 확인
2. 큰 텍스트에서 깨지는 일반적인 UI 패턴 식별
3. 단순 폰트 확대만으로 해결되지 않는 레이아웃을 동적으로 재구성

---

## ♿ tvOS 27의 Large Text

tvOS 27에서는 **Large Text가 system-wide로 지원**된다. 사용자는 Settings 앱에서 다음 경로로 텍스트 크기를 조절할 수 있다.

**Accessibility → Display → Text Size**

선택 가능한 크기는 Large부터 **Accessibility XXXL**까지 확장된다.

Dynamic Type의 기본 동작은 iOS와 동일하다. SwiftUI와 UIKit은 사용자의 선호 크기에 맞춰 텍스트를 자동으로 확장할 수 있다.

### 표준 컴포넌트는 상당 부분 자동 대응

세션의 미디어 앱 예제에서 Large Text를 켜면 다음 요소들이 자동으로 커진다.

- Navigation title
- Tab bar label
- `Text` / `Label`
- `Button`
- UIKit/SwiftUI의 표준 navigation 및 tab UI

즉, 모든 UI를 새로 작성할 필요는 없다. Apple이 강조하는 개발자의 역할은 **custom element와 hard-coded layout을 찾아 수정하는 것**이다.

### Accessibility Nutrition Labels

앱이 Larger Text를 제대로 지원하면 App Store의 **Accessibility Nutrition Labels**에서 tvOS용 Larger Text 지원을 표시할 수 있다. Large Text를 필요로 하는 사용자가 App Store에서 접근성 지원 여부를 확인하는 데 직접 활용된다.

---

## 🔎 Large Text에서 가장 먼저 찾을 문제

Apple은 세 가지 유형을 특히 강조한다.

### 1. 고정된 font size

다음과 같은 코드는 사용자 설정과 무관하게 항상 같은 크기로 렌더링된다.

```swift
.font(.system(size: 18))
```

또는 UIKit의:

```swift
titleLabel.font = UIFont.boldSystemFont(ofSize: 28)
```

이런 경우 Dynamic Type이 작동하지 않는다.

### 2. 고정 width/height

텍스트는 커지는데 container가 고정된 경우 다음 문제가 생긴다.

- truncation
- clipping
- 버튼이나 label overlap
- 예상하지 못한 line wrapping
- 주변 요소 사이의 spacing 부족

### 3. 커진 텍스트를 고려하지 않은 layout density

폰트 자체는 정상적으로 커져도 한 화면에 너무 많은 item을 유지하면 각 item에 제공되는 공간이 부족해진다.

세션에서는 대표적으로 다음 두 패턴을 보여준다.

- movie poster shelf의 열 수를 6개 → 4개로 감소
- horizontal card layout을 vertical layout으로 전환

---

## 🔤 Hard-coded font를 semantic text style로 변경

세션의 첫 번째 문제는 “Signup information” caption이다. 기존 구현은 고정 font와 고정 width를 사용한다.

공식 Code 섹션의 시작 형태:

```swift
VStack(spacing: 20) {
    Text("Signup information")
        .font(.caption.bold())
        .lineLimit(1)
        .foregroundStyle(.secondary)
        .frame(width: 300, alignment: .leading)

    HStack(alignment: .top, spacing: 40) {
        /* ... */
    }
}
```

세션 설명상 먼저 해야 할 일은 **semantic text style**을 사용하는 것이다. 여기서는 `.caption`을 사용한다.

```swift
Text("Signup information")
    .font(.caption.bold())
```

`caption`, `headline`, `body`, `title` 등 시스템 text style은 사용자의 Dynamic Type 설정에 맞춰 크기가 변한다.

### 왜 semantic style이 중요한가

고정 point size를 직접 계산하면 다음을 개발자가 모두 책임져야 한다.

- text scale
- accessibility category
- platform별 크기 차이
- 이후 시스템 디자인 변화

Semantic text style을 사용하면 이 책임을 시스템에 위임할 수 있다.

---

## 📏 고정 width를 flexible constraint로 변경

폰트를 semantic style로 바꿔도 예제에서는 caption이 잘린다. 원인은 `.frame(width: 300)`이다.

Apple의 수정 예제:

```swift
VStack(spacing: 20) {
    Text("Signup information")
        .font(.caption.bold())
        .lineLimit(1)
        .foregroundStyle(.secondary)
        .frame(maxWidth: .infinity, alignment: .leading)

    HStack(alignment: .top, spacing: 40) {
        /* ... */
    }
}
```

핵심은 다음 한 줄이다.

```swift
.frame(maxWidth: .infinity, alignment: .leading)
```

고정 폭 대신 컨테이너가 허용하는 공간까지 확장할 수 있게 한다.

### 앱 전체에서 점검할 것

- `.font(.system(size: ...))`
- `.frame(width: ...)`
- `.frame(height: ...)`
- 지나치게 작은 `maxWidth`
- 고정된 item size
- 텍스트를 1줄로 강제하는 `lineLimit(1)`의 필요성
- label 높이를 직접 지정한 Auto Layout constraint

세션은 특히 **hard-coded font와 hard-coded height/width를 검색**해 flexible layout으로 전환하라고 권한다.

---

## 🧱 UIKit에서 Dynamic Type 적용

UIKit에서도 원칙은 동일하다.

기존 고정 font:

```swift
titleLabel.font = UIFont.boldSystemFont(ofSize: 28)
```

Dynamic Type을 지원하는 형태:

```swift
titleLabel.font = UIFont.preferredFont(forTextStyle: .headline)
titleLabel.adjustsFontForContentSizeCategory = true
```

### 두 단계가 모두 필요

1. `UIFont.preferredFont(forTextStyle:)`로 semantic style 선택
2. `adjustsFontForContentSizeCategory = true`로 설정 변화에 자동 대응

`preferredFont`만 사용하고 `adjustsFontForContentSizeCategory`를 빠뜨리면 런타임에서 사용자가 텍스트 크기를 변경했을 때 자동 갱신되지 않는 구현이 될 수 있다.

---

## 🖼️ Grid/Carousel을 텍스트 크기에 맞춰 재구성

폰트와 constraint를 유연하게 만들어도 모든 문제가 해결되는 것은 아니다. 특히 미디어 앱의 poster shelf처럼 **한 화면에 고정 개수의 item을 보여주는 UI**는 큰 텍스트에서 밀도가 지나치게 높아질 수 있다.

세션 예제는 기본 크기에서 poster를 한 번에 6개 보여준다.

Accessibility size에서는 4개만 보여주도록 변경한다.

공식 SwiftUI 예제:

```swift
struct MovieShelf: View {
    @Environment(\.dynamicTypeSize) private var dynamicTypeSize

    var body: some View {
        ScrollView(.horizontal) {
            LazyHStack(spacing: 40) {
                ForEach(Asset.allCases) { asset in
                    Button {
                        /* ... */
                    } label: {
                        asset.portraitImage
                        Text(asset.title)
                    }
                    .containerRelativeFrame(
                        .horizontal,
                        count: dynamicTypeSize.isAccessibilitySize ? 4 : 6,
                        spacing: 40
                    )
                }
            }
        }
    }
}
```

### 핵심 포인트

```swift
@Environment(\.dynamicTypeSize) private var dynamicTypeSize
```

SwiftUI environment에서 현재 Dynamic Type 크기를 읽는다.

```swift
dynamicTypeSize.isAccessibilitySize
```

Accessibility category인지 판단한다.

```swift
count: dynamicTypeSize.isAccessibilitySize ? 4 : 6
```

큰 텍스트에서는 각 item의 폭을 넓히기 위해 화면에 표시하는 cell 수를 줄인다.

### 왜 단순한 폰트 축소가 아니라 item 수를 줄이는가

접근성 설정을 켠 사용자가 더 큰 글자를 선택했는데 앱이 공간을 확보하기 위해 다시 글자를 줄이면 사용자 의도를 무효화한다.

따라서 우선순위는:

1. 텍스트 크기는 유지
2. 주변 레이아웃을 변경
3. item density를 낮춤
4. 필요하면 cell을 더 크게 만듦

세션은 긴 텍스트에 대해 custom marquee 전략도 고려할 수 있다고 언급한다.

---

## 🔄 Horizontal → Vertical conditional layout

두 번째 예제는 이미지, title, subtitle이 함께 있는 content card다.

기본 크기에서는 horizontal 배치가 잘 동작하지만 Large Text에서는:

- text 영역이 너무 좁아짐
- title/subtitle truncation
- 요소 사이 padding이 부족해짐

SwiftUI에서는 `AnyLayout`으로 두 layout을 조건에 따라 전환한다.

공식 예제:

```swift
struct CardContentView: View {
    @Environment(\.dynamicTypeSize) private var dynamicTypeSize
    var asset: Asset

    var body: some View {
        let layout = dynamicTypeSize.isAccessibilitySize
            ? AnyLayout(VStackLayout(alignment: .leading, spacing: 10))
            : AnyLayout(HStackLayout(alignment: .top, spacing: 10))

        layout {
            /* ... */
        }
    }
}
```

### 기본 크기

```text
[ Image ]  Title
           Subtitle
```

### Accessibility size

```text
[ Image ]
Title
Subtitle
```

Vertical layout으로 바꾸면 텍스트가 cell 전체 너비를 사용할 수 있고, cell 높이도 자연스럽게 늘어난다.

### `AnyLayout`을 사용하는 이유

`HStack`과 `VStack`을 별도 `if` branch로 복제하지 않고 동일한 child content를 유지하면서 layout algorithm만 교체할 수 있다.

---

## 🧱 UIKit에서 conditional layout

UIKit에서는 `UIStackView.axis`를 변경하는 방식으로 같은 아이디어를 적용한다.

공식 Code 예제:

```swift
class AdaptiveLayoutViewController: UIViewController {
    let stackView = UIStackView()

    override func viewDidLoad() {
        super.viewDidLoad()
        updateLayout()

        let sizeTraits: [UITrait] = [UITraitPreferredContentSizeCategory.self]
        registerForTraitChanges(
            sizeTraits,
            action: #selector(updateLayout)
        )
    }

    private func updateLayout() {
        if traitCollection.preferredContentSizeCategory.isAccessibilityCategory {
            stackView.axis = .vertical
        } else {
            stackView.axis = .horizontal
        }
    }
}
```

### 핵심 API

```swift
traitCollection.preferredContentSizeCategory.isAccessibilityCategory
```

현재 content size category가 accessibility 영역인지 확인한다.

```swift
registerForTraitChanges(
    [UITraitPreferredContentSizeCategory.self],
    action: #selector(updateLayout)
)
```

앱 실행 중 사용자의 text size preference가 변경될 때 layout을 업데이트한다.

즉 UIKit에서도 초기 상태 한 번만 읽는 것이 아니라 **trait change에 반응하는 구조**가 필요하다.

---

## 🧠 Dynamic Type 대응의 두 단계

세션 전체를 구현 관점에서 나누면 두 단계다.

### 1단계 — Text scaling을 막는 요소 제거

- hard-coded font 제거
- semantic text style 적용
- `adjustsFontForContentSizeCategory` 활성화
- 고정 width/height 제거
- flexible constraints 적용

### 2단계 — Layout density 자체 조절

- grid column 수 감소
- carousel item 폭 확대
- horizontal stack → vertical stack 전환
- cell 높이 확장 허용
- 텍스트 우선 공간 확보

중요한 점은 **Dynamic Type 지원이 단순히 글자 크기를 키우는 작업으로 끝나지 않는다**는 것이다. 큰 글자가 실제로 읽을 수 있는 공간을 확보하도록 UI 구조도 바뀌어야 한다.

---

## 🧪 테스트 전략

세션은 Large Text를 켠 상태에서 앱을 체계적으로 검사하라고 권한다.

### 최소 점검 범위

- Large
- Accessibility category 진입점
- Accessibility XXXL

### 확인 항목

- [ ] 모든 주요 텍스트가 실제로 scale되는가
- [ ] 고정 font가 남아 있지 않은가
- [ ] title/label이 잘리지 않는가
- [ ] 버튼 텍스트가 clipping되지 않는가
- [ ] 이미지와 텍스트가 overlap하지 않는가
- [ ] grid item에 충분한 width가 있는가
- [ ] 카드 내부 spacing이 충분한가
- [ ] cell height가 content 증가에 맞춰 늘어나는가
- [ ] focus 이동 후 확대된 UI가 정상적으로 보이는가
- [ ] 런타임에 text size를 바꾸면 즉시 layout이 갱신되는가

### tvOS에서 특히 볼 부분

tvOS UI는 iPhone보다 멀리 떨어진 거리에서 보는 경우가 많고, focus-based interaction을 사용한다. 따라서 작은 truncation이나 spacing 문제도 실제 사용에서는 읽기 어려움으로 이어질 수 있다.

세션 자체는 focus API 변경을 다루지는 않지만, Large Text 검증 시 **확대된 content와 focus UI가 함께 잘 보이는지** 확인하는 것이 중요하다.

---

## 📋 마이그레이션 체크리스트

### Typography

- [ ] `.font(.system(size:))` 검색
- [ ] `UIFont.systemFont(ofSize:)` 검색
- [ ] `UIFont.boldSystemFont(ofSize:)` 검색
- [ ] 가능한 곳을 semantic style로 변경
- [ ] UIKit label에 `adjustsFontForContentSizeCategory = true` 적용
- [ ] custom font 사용 시 Dynamic Type scaling 지원 여부 점검

### Constraints

- [ ] 고정 width/height 검색
- [ ] text container에 불필요한 width 제한 제거
- [ ] flexible `maxWidth` 사용 검토
- [ ] Auto Layout의 compression resistance/hugging 확인
- [ ] content에 따라 높이가 늘어날 수 있게 구성

### Adaptive layout

- [ ] SwiftUI에서 `@Environment(\.dynamicTypeSize)` 활용
- [ ] `dynamicTypeSize.isAccessibilitySize` 분기 검토
- [ ] grid/carousel column 수 조절
- [ ] `AnyLayout`으로 HStack/VStack 전환 검토
- [ ] UIKit에서 `preferredContentSizeCategory.isAccessibilityCategory` 사용
- [ ] `UITraitPreferredContentSizeCategory` trait change 등록

### Validation

- [ ] Settings에서 Large Text 직접 변경
- [ ] Accessibility XXXL까지 테스트
- [ ] 주요 화면 모두 탐색
- [ ] truncation/clipping/overlap 점검
- [ ] 런타임 변경 시 즉시 반영 확인
- [ ] App Store Accessibility Nutrition Labels의 Larger Text 지원 표시 검토

---

## ⚠️ 세션에서 권장하지 않는 접근

### 큰 글자에서 font size를 다시 줄이는 방식

사용자가 더 큰 글자를 선택한 목적을 훼손한다. 레이아웃과 item density를 바꾸는 것이 우선이다.

### 고정 container를 유지한 채 lineLimit만 조절

근본적인 공간 부족은 해결되지 않는다. width/height와 전체 구조를 유연하게 만들어야 한다.

### Accessibility category만 최초 한 번 읽는 구현

사용자가 실행 중 텍스트 크기를 바꿀 수 있으므로 UIKit에서는 trait change에 반응해야 한다.

### 모든 화면을 별도 accessibility UI로 다시 만드는 방식

세션의 접근은 별도의 완전히 다른 UI가 아니라 **동일한 interface가 semantic text style과 adaptive layout을 통해 자연스럽게 변화**하도록 하는 것이다.

---

## 🧩 SwiftUI와 UIKit 대응 관계

| 목적 | SwiftUI | UIKit |
|---|---|---|
| Semantic font | `.font(.headline)` 등 | `UIFont.preferredFont(forTextStyle:)` |
| 자동 text scale | 기본 지원 | `adjustsFontForContentSizeCategory = true` |
| 현재 크기 확인 | `@Environment(\.dynamicTypeSize)` | `traitCollection.preferredContentSizeCategory` |
| Accessibility size 확인 | `.isAccessibilitySize` | `.isAccessibilityCategory` |
| 변화 감지 | Environment 자동 갱신 | `registerForTraitChanges` |
| Stack 방향 변경 | `AnyLayout(HStackLayout/VStackLayout)` | `UIStackView.axis` |
| Grid density 변경 | `containerRelativeFrame(count:)` 등 | collection layout 재구성 |

---

## 🧠 핵심 메시지

Apple이 이 세션에서 전달하는 메시지는 단순하다.

**Dynamic Type은 폰트 API 하나를 바꾸는 기능이 아니라, 사용자가 선택한 텍스트 크기를 끝까지 존중할 수 있도록 전체 레이아웃을 유연하게 만드는 작업이다.**

표준 UIKit/SwiftUI UI는 대부분 자동으로 처리되므로 custom UI에서 다음 원칙을 지키는 것이 핵심이다.

1. Semantic text style 사용
2. 고정 크기 제거
3. 텍스트가 커질 공간 확보
4. 필요하면 item 수와 layout 방향 변경
5. Large Text 전체 범위에서 실제 테스트
6. 지원 사실을 Accessibility Nutrition Labels에 표시

---

## 🔗 함께 보면 좋은 자료

- WWDC26 — Prepare your tvOS apps for Dynamic Type
  - https://developer.apple.com/videos/play/wwdc2026/221/
- WWDC24 — Get started with Dynamic Type
- Apple Developer Documentation — Applying custom fonts to text
- Apple Developer Documentation — Scaling fonts automatically
