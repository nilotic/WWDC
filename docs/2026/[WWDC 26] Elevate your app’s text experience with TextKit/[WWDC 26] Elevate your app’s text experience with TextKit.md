# WWDC26 Elevate your app’s text experience with TextKit 요약

- Session: 370
- Title: Elevate your app’s text experience with TextKit
- Source: https://developer.apple.com/videos/play/wwdc2026/370/
- Topic: TextKit, UITextView, NSTextView, TextEditor, NSTextViewportLayoutController, NSTextViewportRenderingSurface, Text Attachments
- Chapters: Introduction, TextKit architecture, What's new in TextKit, Extending framework text views, Code editor with line numbers, Collapsible recipe sections, Text attachments and view provider reuse, Next steps

---

## 한 줄 요약

TextKit의 2027 업데이트는 `UITextView`와 `NSTextView`가 직접 `NSTextViewportLayoutControllerDelegate`에 conform하도록 확장하고, 새 `NSTextViewportRenderingSurface` abstraction과 text attachment reuse policy를 추가해 **framework text view가 제공하는 입력·선택·접근성·undo/redo의 편의성을 그대로 유지하면서 viewport layout과 paragraph rendering을 직접 확장할 수 있게 한다.**

---

## 핵심 요약

이번 세션은 TextKit을 사용할 때 오랫동안 존재했던 두 선택지 사이의 간극을 줄이는 데 초점을 맞춘다.

### 기존 두 선택지

**Framework text view**

- UIKit: `UITextView`
- AppKit: `NSTextView`
- SwiftUI: `TextEditor`

장점:
- Text input
- Selection
- Accessibility
- Undo / Redo
- Dictation
- Inline predictions
- 기타 기본 편집 기능

단점:
- TextKit 내부 구현이 대부분 숨겨져 있음
- 개별 paragraph rendering과 viewport 동작을 세밀하게 제어하기 어려움

**Custom TextKit view**

- `NSTextContentStorage`
- `NSTextLayoutManager`
- `NSTextViewportLayoutController`
- 직접 만든 `UIView`, `NSView`, `CALayer` 등에 rendering

장점:
- Storage, layout, viewport를 완전히 제어

단점:
- Framework text view가 기본 제공하는 편집 경험을 직접 다시 구현해야 함
- Production-quality editor 구현 비용이 매우 큼

### 2027 릴리스의 방향

이제 `UITextView`와 `NSTextView` 자체의 TextKit viewport hook을 공개적으로 사용할 수 있다.

따라서 다음과 같은 기능을 framework text view 위에 직접 만들 수 있다.

- Code editor line numbers
- Collapsible multi-paragraph sections
- Custom viewport decoration
- Paragraph별 visual UI
- Stateful inline attachment reuse
- Attachment cache
- Custom rendering surface 관리

---

# 📝 TextKit은 Apple 플랫폼의 Text Engine

TextKit은 Apple의 차세대 text engine이며 Apple 플랫폼의 text layout과 rendering 기반이다.

다음 UI framework의 text control이 모두 TextKit을 사용한다.

- SwiftUI
- UIKit
- AppKit

즉 `TextEditor`, `UITextView`, `NSTextView` 역시 내부적으로 TextKit 위에서 동작한다.

---

# ⚖️ Convenience와 Control의 긴장

Text editing 앱을 만들 때 기존에는 크게 두 길이 있었다.

## Framework Text View 사용

`UITextView`, `NSTextView`, `TextEditor`를 사용한다.

기본적으로 많은 기능을 제공한다.

```text
Text Input
Selection
Accessibility
Undo / Redo
Dictation
Inline Prediction
...
```

대신 내부 TextKit 구성과 viewport rendering은 대부분 framework가 관리한다.

## TextKit으로 Custom View 제작

직접 다음을 구성한다.

```text
NSTextContentStorage
      ↓
NSTextLayoutManager
      ↓
NSTextViewportLayoutController
      ↓
UIView / NSView / CALayer
```

Storage부터 rendering까지 제어할 수 있지만 text editing UI 전체를 직접 책임져야 한다.

이번 세션은 **framework text view에서 TextKit의 제어력을 더 많이 사용할 수 있게 하는 것**이 핵심이다.

---

# 🧱 TextKit의 4계층 Architecture

TextKit은 text rendering을 네 계층으로 나눈다.

```text
┌──────────────────────────┐
│ View Layer               │
├──────────────────────────┤
│ Viewport Layer           │
├──────────────────────────┤
│ Layout Layer             │
├──────────────────────────┤
│ Text Storage Layer       │
└──────────────────────────┘
```

각 계층은 서로 다른 책임을 가진다.

---

# 📦 Text Storage Layer

가장 아래에는 text storage layer가 있다.

이 계층은 render할 모든 text data를 관리한다.

`NSAttributedString`을 사용하는 기본 구성에서는 다음 객체가 사용된다.

- `NSTextContentStorage`
- `NSTextParagraph`

`NSTextContentStorage`는 attributed string을 paragraph 단위의 `NSTextParagraph`로 나눈다.

```text
NSAttributedString
      ↓
NSTextContentStorage
      ↓
NSTextParagraph
NSTextParagraph
NSTextParagraph
...
```

---

# 🧩 Custom Backing Storage

반드시 `NSAttributedString`을 사용해야 하는 것은 아니다.

자체 storage format을 사용한다면 abstract class를 subclass할 수 있다.

| 기본 concrete type | Abstract base |
|---|---|
| `NSTextContentStorage` | `NSTextContentManager` |
| `NSTextParagraph` | `NSTextElement` |

즉 앱의 domain-specific document storage를 TextKit architecture에 연결할 수 있다.

---

# 📐 Layout Layer

Text storage가 paragraph를 만들면 `NSTextLayoutManager`가 실제 layout을 준비한다.

주요 작업:
- Glyph metrics 계산
- Paragraph layout 측정
- `NSTextLayoutFragment` 생성

```text
NSTextParagraph
      ↓
NSTextLayoutManager
      ↓
NSTextLayoutFragment
```

`NSTextLayoutFragment`는 paragraph의 계산된 layout 정보를 담는다.

---

# 🔒 Text Element와 Layout Fragment의 Immutability

`NSTextParagraph`와 `NSTextLayoutFragment`는 immutable object다.

Paragraph가 수정되면 기존 객체를 수정하지 않고 새 객체를 만든다.

예:

```text
Before:
"Make a sandwich"

Edit:
sandwich → slider

After:
새 NSTextParagraph
새 NSTextLayoutFragment
```

이 특성은 attachment reuse 문제와도 연결된다.

---

# 👁️ Viewport Layer

Text view는 문서 전체 크기를 가질 수 있지만 사용자가 실제로 보는 것은 그 중 일부다.

이 visible 영역이 viewport다.

TextKit은 성능을 위해 **사용자가 볼 수 있는 text 중심으로 layout과 rendering을 수행한다.**

Viewport layer의 핵심 클래스:

```swift
NSTextViewportLayoutController
```

세션에서는 이를 간단히 viewport controller라고 부른다.

---

# 🖥️ View Layer

가장 위에서는 실제 text가 앱 화면에 나타난다.

Custom TextKit view에서는 rendering destination으로 다음을 사용할 수 있다.

- `UIView`
- `NSView`
- `CALayer`
- 기타 UI framework가 제공하는 drawable element

즉 TextKit은 text storage와 layout은 공통으로 제공하면서 실제 visual surface는 UI framework에 연결한다.

---

# 🔁 Viewport Layout Process

Viewport controller는 `NSTextLayoutManager`와 text view 사이를 조율한다.

흐름은 다음과 같다.

```text
Text View
Scroll position + viewport size
        ↓
NSTextViewportLayoutController
        ↓
NSTextLayoutManager
        ↓
Viewport와 겹치는 Layout Fragment 요청
        ↓
Text View에서 Rendering
```

이 과정은 viewport state가 변경될 때 반복된다.

예:
- Scroll
- Edit
- Selection change

이 전체 과정을 **viewport layout process**라고 한다.

TextKit 성능의 중심이 되는 과정이다.

---

# 🏗️ Custom Text View의 최소 구성

Custom text view를 직접 만들려면 기본적으로 다음을 구성한다.

```swift
NSTextContentStorage
NSTextLayoutManager
NSTextViewportLayoutController
```

그리고 UI framework가 제공하는 visual element에 layout fragment를 직접 render한다.

이는 최대한의 control을 제공한다.

---

# 🔗 하나의 Storage를 여러 Presentation에 연결

TextKit의 flexible layering을 이용하면 같은 storage에 여러 layout manager를 연결할 수 있다.

```text
                 ┌─ NSTextLayoutManager A ─ View A
Text Storage ────┤
                 └─ NSTextLayoutManager B ─ View B
```

한 presentation에서 수정하면 shared storage를 통해 다른 presentation도 자동 업데이트된다.

같은 document를 서로 다른 방식으로 표현해야 하는 editor에 유용하다.

---

# 🆕 `NSTextViewportRenderingSurface`

2027 이전에는 TextKit에서 layout fragment는 추적할 수 있었지만 **그 fragment를 실제로 그리는 destination view를 공통 TextKit abstraction으로 참조할 방법이 없었다.**

새 protocol:

```swift
NSTextViewportRenderingSurface
```

Viewport 내부에서 layout fragment의 text를 실제로 그릴 visual element를 나타낸다.

다음 type을 conform시킬 수 있다.

- `UIView`
- `NSView`
- `CALayer`

예:

```swift
class MyView: UIView,
              NSTextViewportRenderingSurface {
}
```

Custom TextKit renderer를 만들 때 viewport의 visible rendering surface를 TextKit API로 직접 관리할 수 있다.

---

# 🔑 `NSTextViewportRenderingSurfaceKey`

Rendering surface와 함께 새로운 key protocol도 제공된다.

```swift
NSTextViewportRenderingSurfaceKey
```

역할:

> Viewport layout cycle 사이에서도 특정 rendering surface를 고유하게 식별한다.

`NSTextLayoutFragment`가 대표적인 key로 사용될 수 있다.

예:

```swift
class MyView: UIView,
              NSTextViewportRenderingSurface {}

var cache:
    NSMapTable<NSTextLayoutFragment, MyView>
```

Layout fragment를 key로 사용해 rendering surface를 dictionary나 map table에 cache할 수 있다.

---

# 🗺️ Key → Rendering Surface Mapping

Viewport layout process 내부에서는 다음 mapping이 중요한 역할을 한다.

```text
Rendering Surface Key
        ↓
Rendering Surface
```

Delegate method에서 key에 rendering surface를 할당할 수 있다.

그리고 `didLayout` 단계에서 viewport controller에 특정 key의 rendering surface를 다시 질의할 수 있다.

Mapping은 viewport layout process 시작 시 clear된다.

즉 한 layout cycle에서 어떤 fragment가 어떤 visual surface에 대응되는지 명시적으로 관리할 수 있게 됐다.

---

# 🧰 Framework Text View를 확장하는 새로운 길

Apple의 기본 text experience는 framework text view 위에 구축되어 있다.

예:
- Messages
- TextEdit
- Notes
- Journal

UIKit에서는 `UITextView`, AppKit에서는 `NSTextView`가 중심이다.

SwiftUI에서 long-form text editing에는 `TextEditor`가 가장 간단하다.

하지만 더 많은 제어가 필요하면 SwiftUI에서도 `UIViewRepresentable` 또는 `NSViewRepresentable`을 통해 UIKit/AppKit text view를 사용할 수 있다.

---

# 🧩 SwiftUI에서 UITextView / NSTextView 사용

기본 pattern:

```swift
import SwiftUI

struct MyTextView: View {
    var body: some View {
        TextViewRepresentable()
    }
}

#if os(macOS)

struct TextViewRepresentable:
    NSViewRepresentable {

    func makeNSView(
        context: Context
    ) -> NSTextView {
        NSTextView()
    }

    func updateNSView(
        _ nsView: NSTextView,
        context: Context
    ) {
    }
}

#else

struct TextViewRepresentable:
    UIViewRepresentable {

    func makeUIView(
        context: Context
    ) -> UITextView {
        UITextView()
    }

    func updateUIView(
        _ uiView: UITextView,
        context: Context
    ) {
    }
}

#endif
```

SwiftUI 앱에서도 framework text view와 새 TextKit hook을 함께 사용할 수 있다.

---

# 🎉 가장 큰 변화: UITextView와 NSTextView가 Viewport Delegate를 직접 제공

2027 릴리스부터:

```text
UITextView
NSTextView
    ↓
NSTextViewportLayoutControllerDelegate
```

즉 `UITextView`와 `NSTextView`가 공개적으로 `NSTextViewportLayoutControllerDelegate`에 conform한다.

이제 subclass에서 viewport delegate method를 override할 수 있다.

세션이 사용하는 핵심 세 method:

1. `textViewportLayoutControllerWillLayout`
2. `configureRenderingSurfaceFor`
3. `textViewportLayoutControllerDidLayout`

이 세 지점을 이용해 framework의 기본 text rendering은 유지하면서 추가 동작을 삽입한다.

---

# 💻 예제 1: Code Editor Line Numbers

첫 번째 예제는 iPad용 간단한 code editor다.

먼저 `UITextView` subclass를 만들고 monospaced font를 적용한다.

```swift
class TextView: UITextView {}

class ContainerView: UIView {
    let textView = TextView()
    let lineNumberView = UIView()
}
```

Container에는 두 영역이 있다.

```text
┌─────────┬────────────────────┐
│ Line No │ UITextView         │
│ 1       │ code...            │
│ 2       │ code...            │
│ 3       │ code...            │
└─────────┴────────────────────┘
```

---

# 🔄 Line Number 업데이트 시점

Line number는 다음 변화가 있을 때 다시 계산해야 한다.

- Scroll
- Edit
- Viewport 변경

Viewport layout delegate hook을 사용하면 정확히 이 시점에 paragraph 정보를 얻을 수 있다.

---

# 🧹 `WillLayout`

첫 번째 override는 layout 전 준비 단계다.

```swift
override func textViewportLayoutControllerWillLayout(
    _ textViewportLayoutController:
        NSTextViewportLayoutController
) {
    super.textViewportLayoutControllerWillLayout(
        textViewportLayoutController
    )

    // 이전 layout cycle의 수집 정보 초기화
}
```

중요:

> 이 delegate method들을 override할 때 `super`를 호출해야 한다.

세션은 모든 override에서 이를 기억하라고 강조한다.

---

# 🔢 Viewport의 시작 Line Number 계산

Viewport 안의 첫 paragraph가 문서 전체에서 몇 번째 paragraph인지 계산해야 한다.

세션에서는 `enumerateTextElements(from:)`를 사용한다.

```swift
func startingLineNumber(
    for viewportRange: NSTextRange?
) -> Int {
    guard let viewportRange,
          let storage =
            textLayoutManager?
                .textContentManager
                as? NSTextContentStorage
    else {
        return 0
    }

    let startLocation =
        storage.documentRange.location

    var count = 1

    storage.enumerateTextElements(
        from: startLocation
    ) { element in
        guard let range =
            element.elementRange
        else {
            return true
        }

        if range.location.compare(
            viewportRange.location
        ) != .orderedAscending {
            return false
        }

        count += 1
        return true
    }

    return count
}
```

문서 시작부터 viewport 시작 위치까지 paragraph를 세어 starting line number를 구한다.

Sample code에서는 이 비용을 매 layout pass마다 지불하지 않도록 caching을 추가한다.

---

# 📐 `configureRenderingSurfaceFor`

다음 단계는 viewport에 실제 layout되는 각 paragraph의 위치를 수집하는 것이다.

```swift
override func textViewportLayoutController(
    _ textViewportLayoutController:
        NSTextViewportLayoutController,
    configureRenderingSurfaceFor
        textLayoutFragment:
        NSTextLayoutFragment
) {
    super.textViewportLayoutController(
        textViewportLayoutController,
        configureRenderingSurfaceFor:
            textLayoutFragment
    )

    lines.append(
        textLayoutFragment.layoutFragmentFrame
    )
}
```

이 method는 viewport에 들어오는 각 paragraph마다 호출된다.

`layoutFragmentFrame`으로 paragraph의 frame을 얻는다.

---

# 📤 `DidLayout`

Layout이 끝나면 수집한 paragraph frame을 ContainerView로 전달한다.

다만 fragment frame은 text container coordinate 기준이므로 viewport coordinate로 바꿔야 한다.

```swift
override func textViewportLayoutControllerDidLayout(
    _ controller:
        NSTextViewportLayoutController
) {
    super.textViewportLayoutControllerDidLayout(
        controller
    )

    let origin =
        controller.viewportBounds.origin

    onDidLayout?(
        startingLineNumber,
        lines.map {
            $0.offsetBy(
                dx: 0,
                dy: -origin.y
            )
        }
    )
}
```

Viewport origin을 빼서 화면 기준 좌표로 맞춘다.

---

# 🔢 ContainerView에서 Line Number 그리기

ContainerView는 전달받은 starting line number와 frame으로 실제 숫자를 그린다.

```swift
textView.onDidLayout = {
    startingLineNumber,
    lines in

    for (index, frame)
        in lines.enumerated() {

        let lineNumber =
            startingLineNumber + index

        // frame.minY 위치에 line number rendering
    }
}
```

결과적으로 framework `UITextView`에 매우 적은 추가 코드만으로 line number column을 붙일 수 있다.

---

# ✅ Line Number 예제가 보여주는 핵심

Framework text view의 viewport layout process를 이용하면 다음 데이터를 직접 사용할 수 있다.

- 현재 화면에 있는 paragraph
- Paragraph layout frame
- Viewport coordinate
- 현재 viewport 이전의 paragraph 수

하지만 text input, cursor, selection, accessibility 등은 여전히 `UITextView`가 제공한다.

이것이 이번 TextKit update의 핵심 가치다.

---

# 🍳 예제 2: Collapsible Recipe Sections

두 번째 예제는 여러 paragraph로 구성된 recipe document다.

요구사항:

```text
Recipe Heading
Paragraph
Paragraph
Paragraph

        ↓ Collapse

Recipe Heading
```

Collapsed section의 paragraph는 단순히 숨기는 것이 아니라 **layout 자체를 건너뛰고 싶다.**

---

# 📚 `NSTextContentStorageDelegate`

이 기능을 위해 text view가 다음 delegate에도 conform한다.

```swift
NSTextContentStorageDelegate
```

중요 method:

```swift
textContentManager(
    _:shouldEnumerate:options:
)
```

이를 통해 특정 `NSTextElement`가 enumeration과 layout에 포함될지 결정한다.

---

# 🗂️ Collapsed State 관리

세션 예제는 paragraph offset을 integer로 저장한다.

```swift
var collapsedSections: Set<Int> = []
```

Paragraph offset을 section identity처럼 사용해 어떤 recipe section이 collapsed 상태인지 추적한다.

---

# ⏭️ Collapsed Paragraph의 Layout 생략

`textContentManager(_:shouldEnumerate:options:)`에서 현재 paragraph가 collapsed section에 속하는지 판단하고 필요하면 enumeration을 건너뛴다.

개념적으로:

```text
NSTextContentStorage
      ↓
shouldEnumerate?
      ├─ true  → Layout 수행
      └─ false → Layout Skip
```

단순 visual hiding보다 TextKit layout 단계에서 제거하는 방식이다.

---

# 🔘 Section Toggle

사용자가 disclosure button을 탭하면 set을 변경한다.

```swift
func toggleSection(
    headerOffset: Int
) {
    if collapsedSections
        .contains(headerOffset) {
        collapsedSections
            .remove(headerOffset)
    } else {
        collapsedSections
            .insert(headerOffset)
    }

    guard let textLayoutManager
    else {
        return
    }

    let controller =
        textLayoutManager
            .textViewportLayoutController

    controller.delegate?
        .textViewportLayoutControllerReceivedSetNeedsLayout?(
            controller
        )
}
```

State가 변경된 뒤 viewport layout을 다시 요청한다.

---

# 🧠 Collapsible Section에 사용된 두 종류의 Hook

이 예제는 두 방향의 TextKit hook을 함께 사용한다.

## `NSTextContentStorageDelegate`

무엇을 layout할지 제어한다.

```text
Collapsed paragraph
→ layout 자체를 skip
```

## `NSTextViewportLayoutControllerDelegate`

실제로 layout된 paragraph를 관찰한다.

```text
Visible / active paragraph
→ Rendering surface와 UI 처리
```

Content enumeration과 viewport presentation을 분리해 제어한다.

---

# 📎 Text Attachments

Text view는 text만 표시하지 않는다.

예:
- Messages inline photo와 sticker
- Notes drawing
- Document scan
- Inline animation

TextKit에서 이런 non-text content는 **text attachment**다.

---

# 🧩 Text Attachment Architecture

Attachment도 일반 text와 같은 TextKit architecture를 따른다.

Storage layer:

```swift
NSTextAttachment
```

Text storage 안에서는 attachment도 character처럼 존재한다.

Layout manager가 attachment를 만나면 다음 객체를 요청한다.

```swift
NSTextAttachmentViewProvider
```

View provider는 attachment를 text view 안에 어떻게 표현할지 필요한 정보를 제공한다.

---

# ⚠️ Immutable Paragraph가 Attachment에 만드는 문제

TextKit의 paragraph와 layout object는 immutable하다.

Paragraph를 편집하면 해당 paragraph와 관련된 객체가 다시 생성된다.

Inline animation attachment가 있다면 문제가 생길 수 있다.

```text
Animated Attachment
      ↓
같은 paragraph에서 key 입력
      ↓
Paragraph recreation
      ↓
Attachment View Provider recreation
      ↓
Animation restart
```

메시징 UI에서 사용자가 text를 수정할 때마다 animation이 처음부터 다시 시작될 수 있다.

---

# ♻️ Text Attachment View Provider Reuse Policy

이 문제를 해결하기 위해 `UITextView`에 새로운 registration API가 추가됐다.

세션 예제:

```swift
textView.register(
    [.onEditingInlineParagraphs],
    forTextAttachmentViewProviderType:
        AnimatedAttachmentViewProvider.self
)
```

특정 `NSTextAttachmentViewProvider` subclass에 reuse policy를 등록한다.

---

# ✏️ `.onEditingInlineParagraphs`

첫 번째 reuse policy:

```swift
.onEditingInlineParagraphs
```

같은 paragraph를 편집할 때 view provider를 유지한다.

효과:
- Keyboard 입력으로 attachment provider가 재생성되지 않음
- View provider 내부 state 유지
- Animation restart 방지

---

# 📜 `.onScrollingOutOfViewport`

두 번째 reuse policy:

```swift
.onScrollingOutOfViewport
```

Attachment가 viewport 밖으로 scroll될 때 rendering surface를 cache하고, 다시 화면에 들어오면 복원한다.

적합한 경우:
- Stateful attachment
- Expensive custom view
- Animation
- Media preview
- Recreating cost가 큰 rendering surface

---

# 🔗 Reuse Policy 결합

두 정책은 scenario에 따라 함께 사용할 수 있다.

```swift
textView.register(
    [
        .onEditingInlineParagraphs,
        .onScrollingOutOfViewport
    ],
    forTextAttachmentViewProviderType:
        MyAttachmentViewProvider.self
)
```

편집 중에도 유지하고, scroll out/in 과정에서도 rendering surface를 재활용하는 전략을 구성할 수 있다.

---

# 🧠 Reuse와 Immutable TextKit Model의 관계

TextKit의 immutable element model을 없애는 것이 아니다.

Paragraph나 layout fragment는 필요하면 새로 생성된다.

하지만 attachment의 stateful visual provider는 reuse policy를 통해 그 lifecycle과 분리할 수 있다.

```text
Text Model
Immutable / recreated
        ↓

Attachment Visual Provider
Reuse policy에 따라 유지 가능
```

이 separation으로 layout correctness와 visual continuity를 동시에 얻는다.

---

# 🧩 새 API 정리

| API | 역할 |
|---|---|
| `NSTextViewportRenderingSurface` | Viewport의 drawable rendering destination abstraction |
| `NSTextViewportRenderingSurfaceKey` | Rendering surface를 layout cycle 간 식별하는 key |
| `NSTextViewportLayoutControllerDelegate` | Viewport layout lifecycle 관찰 및 확장 |
| `UITextView` / `NSTextView` delegate conformance | Framework text view에서 직접 viewport hook override |
| `NSTextContentStorageDelegate` | Text element enumeration과 layout 참여 여부 제어 |
| `register(_:forTextAttachmentViewProviderType:)` | Attachment provider reuse policy 등록 |
| `.onEditingInlineParagraphs` | Paragraph edit 중 provider 재사용 |
| `.onScrollingOutOfViewport` | Off-screen attachment rendering surface cache |

---

# 🏗️ TextKit 계층과 주요 Type 매핑

| Layer | 주요 Type | 역할 |
|---|---|---|
| Text Storage | `NSTextContentManager`, `NSTextContentStorage` | Text data 관리 |
| Text Element | `NSTextElement`, `NSTextParagraph`, `NSTextAttachment` | Document 구성 요소 |
| Layout | `NSTextLayoutManager`, `NSTextLayoutFragment`, `NSTextAttachmentViewProvider` | 측정 및 layout 정보 |
| Viewport | `NSTextViewportLayoutController` | Visible fragment layout orchestration |
| View / Surface | `UIView`, `NSView`, `CALayer`, `NSTextViewportRenderingSurface` | 실제 rendering destination |

---

# 🔁 Framework Text View 확장 흐름

```text
UITextView / NSTextView subclass
        ↓
Viewport delegate method override
        ↓
WillLayout
- 이전 상태 초기화
- viewport 시작 정보 계산
        ↓
ConfigureRenderingSurface
- 각 visible fragment 정보 수집
        ↓
DidLayout
- Viewport coordinate 변환
- 외부 decoration / UI 업데이트
```

Code editor의 gutter, paragraph marker, custom overlay 같은 기능을 이 pattern으로 만들 수 있다.

---

# 🧭 어떤 접근을 선택할까?

## `TextEditor`

적합:
- SwiftUI에서 기본 long-form text editing
- 높은 수준의 custom rendering이 필요하지 않음

## `UITextView` / `NSTextView`

적합:
- Framework 편집 기능 유지
- Paragraph별 UI, viewport decoration, attachment behavior 추가
- 이번 세션의 새 delegate hook 활용

SwiftUI에서는 `ViewRepresentable`로 감싼다.

## Custom TextKit View

적합:
- Text rendering surface 전체 직접 제어
- Framework text view로 구현하기 어려운 독특한 layout/rendering
- Storage, layout, viewport architecture를 직접 구성해야 함

---

# 📋 체크리스트

## Architecture 이해
- [ ] Text storage, layout, viewport, view layer 역할 구분
- [ ] `NSTextContentStorage`와 `NSTextParagraph` 관계 이해
- [ ] `NSTextLayoutManager`와 `NSTextLayoutFragment` 관계 이해
- [ ] Viewport layout process가 scroll/edit/selection마다 실행됨을 고려
- [ ] Immutable paragraph와 fragment lifecycle 이해
- [ ] Custom storage가 필요하면 abstract base type subclass 검토

## Framework Text View 선택
- [ ] 기본 editor 기능이 필요하면 `UITextView` / `NSTextView` 우선 검토
- [ ] SwiftUI long-form text는 `TextEditor` 우선 검토
- [ ] SwiftUI에서 더 많은 hook이 필요하면 `ViewRepresentable` 사용
- [ ] Custom TextKit renderer가 정말 필요한지 먼저 판단

## Viewport Delegate
- [ ] `UITextView` / `NSTextView` subclass 사용
- [ ] `textViewportLayoutControllerWillLayout` override
- [ ] `configureRenderingSurfaceFor` override
- [ ] `textViewportLayoutControllerDidLayout` override
- [ ] 각 override에서 `super` 호출
- [ ] Layout cycle마다 임시 수집 데이터 초기화
- [ ] Viewport coordinate 변환 필요 여부 확인

## Rendering Surface
- [ ] Custom surface에 `NSTextViewportRenderingSurface` conform
- [ ] Stable key로 `NSTextViewportRenderingSurfaceKey` 사용
- [ ] `NSTextLayoutFragment`를 cache key로 사용할지 검토
- [ ] Viewport cycle별 mapping lifecycle 이해
- [ ] `didLayout`에서 필요한 surface를 query하는 구조 검토

## Line Number / Gutter
- [ ] 현재 viewport 이전 paragraph 수 계산
- [ ] `enumerateTextElements` 비용 측정
- [ ] 반복 계산은 cache 적용
- [ ] 각 layout fragment frame 수집
- [ ] Text container coordinate → viewport coordinate 변환
- [ ] Scroll과 edit 시 gutter redraw
- [ ] Dynamic Type와 paragraph spacing 변화 테스트

## Collapsible Content
- [ ] Collapsed section identity 정의
- [ ] `NSTextContentStorageDelegate` 사용
- [ ] `shouldEnumerate`에서 layout skip
- [ ] Toggle 후 viewport layout invalidation
- [ ] Header는 유지하고 body paragraph만 제외
- [ ] Selection이 collapsed range와 겹치는 경우 처리 검토
- [ ] Undo/redo와 collapse UI state의 관계 정의

## Text Attachment
- [ ] Inline non-text content에 `NSTextAttachment` 사용
- [ ] `NSTextAttachmentViewProvider` lifecycle 이해
- [ ] Paragraph edit에서 provider recreation 문제가 있는지 확인
- [ ] Animation이나 stateful view가 restart되는지 테스트
- [ ] Appropriate reuse policy 등록

## Attachment Reuse Policy
- [ ] Edit 중 유지가 필요하면 `.onEditingInlineParagraphs`
- [ ] Scroll off/on 재사용이 필요하면 `.onScrollingOutOfViewport`
- [ ] 두 policy 조합 필요 여부 검토
- [ ] Reused provider가 stale state를 보이지 않는지 확인
- [ ] Cache된 rendering surface memory 비용 측정
- [ ] Attachment type별로 policy를 다르게 설정할지 검토

## Performance
- [ ] Viewport 안의 fragment만 대상으로 작업
- [ ] Paragraph 전체 enumeration을 매 layout cycle마다 반복하지 않기
- [ ] Line number 시작점 계산에 cache 적용
- [ ] Expensive attachment surface는 reuse 검토
- [ ] Custom decoration이 scroll performance를 해치지 않는지 Instruments로 확인
- [ ] Long document에서 editing latency 테스트

---

# ⚠️ 구현할 때 주의할 점

## Viewport delegate는 framework behavior를 대체하는 것이 아니다

`UITextView`나 `NSTextView`가 제공하는 기본 TextKit 동작 위에 추가 behavior를 넣는 구조다.

Override할 때 `super` 호출을 빼먹으면 기본 text view behavior를 깨뜨릴 수 있다.

## Layout Fragment Frame의 Coordinate를 그대로 외부 UI에 쓰지 않는다

`layoutFragmentFrame`은 text container 좌표다.

Gutter나 외부 overlay에서 사용하려면 viewport origin을 고려해 coordinate를 변환해야 한다.

## Line Number 계산을 매 Pass마다 처음부터 하지 않는다

세션의 간단한 코드는 document 시작부터 viewport까지 paragraph를 센다.

Sample code는 caching을 적용해 반복 비용을 줄인다.

긴 문서 editor라면 이 부분은 반드시 최적화해야 한다.

## Collapsing은 단순 `hidden` 처리와 다르다

`NSTextContentStorageDelegate`에서 enumeration을 건너뛰면 layout work 자체를 하지 않는다.

큰 section을 접는 editor라면 성능상 중요한 차이다.

## Attachment Provider State와 Text Model Lifecycle을 분리한다

Paragraph는 immutable model 때문에 재생성될 수 있다.

Animation이나 video state가 text edit와 함께 재시작하면 reuse policy가 필요하다.

---

# 🎯 세 가지 예제가 보여주는 TextKit 확장 범위

## Code Editor

```text
Viewport fragment
        ↓
Frame + paragraph index
        ↓
External gutter
        ↓
Line Number
```

## Collapsible Recipe

```text
Section state
        ↓
shouldEnumerate
        ↓
Collapsed paragraph layout skip
```

## Inline Animation Attachment

```text
Paragraph edit / scroll
        ↓
Reuse Policy
        ↓
Attachment visual state 유지
```

즉 TextKit의 새 API는 **rendering, layout participation, stateful attachment lifecycle**이라는 서로 다른 수준을 모두 확장한다.

---

# 핵심 메시지

TextKit을 이용한 rich text experience에는 이제 framework text view와 완전한 custom renderer 사이의 중간 선택지가 훨씬 강력해졌다.

`UITextView`와 `NSTextView`가 공개적으로 viewport layout delegate hook을 제공하면서, 기본 입력·선택·접근성·dictation·undo/redo를 그대로 유지한 채 paragraph 단위 layout 정보를 직접 사용할 수 있다.

새 `NSTextViewportRenderingSurface`와 `NSTextViewportRenderingSurfaceKey`는 custom TextKit view가 layout fragment와 실제 visual surface를 명확하게 연결하고 cache할 수 있게 한다.

Framework text view에서는 viewport delegate를 이용해 code editor line number를 붙이고, `NSTextContentStorageDelegate`로 multi-paragraph section의 layout 자체를 생략할 수 있다.

Text attachment에는 reusable view provider 정책이 추가되어 paragraph edit나 scroll로 provider가 불필요하게 재생성되면서 animation이나 상태가 끊기는 문제를 해결한다.

결국 이번 업데이트의 방향은 분명하다.

**먼저 `UITextView` 또는 `NSTextView`가 제공하는 완성도 높은 text editing experience에서 시작하고, 필요한 부분만 TextKit viewport와 storage hook으로 확장한다. 정말 전체 rendering pipeline의 제어가 필요한 경우에만 custom TextKit view를 선택한다.**

---

# 함께 보면 좋은 세션과 자료

- Meet TextKit 2 — WWDC21
- What's new in TextKit and text views — WWDC22
- Enhance the accessibility of your reading app — WWDC26
- Enriching your text in text views
- TextKit documentation
