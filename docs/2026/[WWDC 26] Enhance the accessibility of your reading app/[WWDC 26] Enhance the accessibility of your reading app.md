# WWDC26 Enhance the accessibility of your reading app 요약

- Session: 219
- Title: Enhance the accessibility of your reading app
- Source: https://developer.apple.com/videos/play/wwdc2026/219/
- Topic: Accessibility, VoiceOver, Speak Screen, UITextInput, UITextView, TextEditor, NSTextView
- Chapters: Introduction, Characteristics, Standard views, Custom text

---

## 한 줄 요약

읽기 앱의 접근성은 단순히 UI 요소를 순서대로 탐색하게 만드는 문제가 아니라, **문장과 줄 사이를 세밀하게 이동하고, 여러 paragraph와 페이지를 끊김 없이 이어 읽으며, assistive technology로 텍스트를 정확히 선택할 수 있게 만드는 것**이며, 표준 text view를 우선 사용하고 필요할 때 text navigation API·`accessibilityLinkedGroup`·`.causesPageTurn`·edit rotor·`UITextInput`을 조합하는 것이 핵심이다.

---

## 핵심 요약

이번 세션은 long-form reading experience의 접근성을 세 가지 목표로 정리한다.

- **Granular text navigation**
  - VoiceOver가 line, word, character 단위로 이동
  - 여러 개의 독립 text element 사이에서도 line navigation이 끊기지 않도록 연결
  - UIKit: `accessibilityNextTextNavigationElement`, `accessibilityPreviousTextNavigationElement`
  - SwiftUI: `accessibilityLinkedGroup(id:in:)`
  - AppKit: `accessibilitySharedTextUIElements`

- **Continuous reading**
  - Speak Screen과 VoiceOver의 read-all이 페이지 끝에서 멈추지 않게 구성
  - 마지막 element에 `.causesPageTurn` trait 적용
  - `accessibilityScroll`과 결합해 다음/이전 페이지로 자동 이동
  - 페이지 이동 후 `.pageScrolled` notification으로 상태 전달

- **Comprehensive text selection**
  - `UITextView`, `TextEditor`, selectable `Text`, `NSTextView`는 native selection 제공
  - 선택 텍스트에 적용되는 custom action은 VoiceOver edit rotor에 노출
  - `UIAccessibilityCustomAction.editCategory` 사용

표준 text view를 사용할 수 없다면 custom-rendered text에도 `UITextInput`을 **완전히 구현**해야 한다.

대표적으로 필요한 요소:

- Text range 처리
- `selectionRects(for:)`
- `text(in:)`
- Tokenizer
- `selectedTextRange`
- `UITextInputDelegate`
- 필요하면 `UITextInteraction`

이렇게 구현하면 scanned page나 직접 그린 text도 VoiceOver, Speak Screen, Accessibility Reader에서 native text처럼 탐색·선택할 수 있다.

---

# 📖 Reading Experience는 일반 UI Navigation과 다르다

Long-form content를 읽는 경험은 button이나 control 사이를 이동하는 일반적인 UI navigation과 본질적으로 다르다.

일반 UI의 focus 이동:

```text
Button
  ↓
Text Field
  ↓
Toggle
```

Reading experience:

```text
Character
   ↓
Word
   ↓
Line
   ↓
Paragraph
   ↓
Page
```

사용자는 단순히 element 단위로 focus를 이동하는 것이 아니라 text 자체를 유동적으로 탐색해야 한다.

Apple framework는 기본적으로 accessible text를 고려해 만들어져 있지만, long-form content에서는 앱 구조에 맞는 추가 작업이 필요할 수 있다.

---

# 🎯 Accessible Reading의 세 가지 목표

## Granular Text Navigation

Assistive technology가 다음 단위로 자유롭게 이동할 수 있어야 한다.

- Character
- Word
- Line
- Paragraph

특히 화면에 paragraph가 여러 개의 별도 view로 나뉘어 있더라도 navigation이 끊기면 안 된다.

## Continuous Reading

사용자가 read-all 기능을 시작했을 때 페이지 경계 때문에 읽기가 중단되면 안 된다.

```text
Page 1
   ↓
Page 2
   ↓
Page 3
```

Audiobook처럼 자연스럽게 다음 페이지로 넘어가야 한다.

## Comprehensive Text Selection

VoiceOver 사용자가 text selection rotor를 이용해 범위를 선택하고, 선택한 text에 대해 앱의 action을 실행할 수 있어야 한다.

---

# 🔊 VoiceOver와 Speak Screen

VoiceOver는 Apple의 built-in screen reader다. Reading app에서는 line-by-line touch exploration, rotor 기반 navigation, text selection을 제공할 수 있다.

Speak Screen은 현재 화면의 콘텐츠를 위에서 아래까지 읽고, 읽는 text를 highlight한다. Long-form reading app에서는 특히 **페이지 끝 이후에도 계속 읽을 수 있는가**가 중요하다.

세션은 이 두 기술을 중심으로 앱의 읽기 경험을 검증한다.

---

# 🧰 표준 Text View를 먼저 사용

Apple은 가능한 경우 항상 framework가 제공하는 native text view를 우선 사용하라고 권장한다. 표준 view는 이미 `UITextInput` 기반의 rich text experience를 제공한다.

## UIKit

```text
UITextView
```

## SwiftUI

```text
TextEditor
```

또는:

```swift
Text(content)
    .textSelection(.enabled)
```

## AppKit

```text
NSTextView
```

이 view들은 기본적으로 다음을 제공한다.

- Line navigation
- Word navigation
- Character navigation
- VoiceOver interaction
- Speak Screen
- Accessible text selection

세션은 기존의 `UIAccessibilityReadingContent`도 여전히 유효하다고 언급하지만, 이번 발표의 초점은 native text view가 채택하는 더 높은 fidelity의 `UITextInput`이다.

---

# 🧱 여러 Paragraph를 별도 Text View로 구성했을 때

Travel Guide 앱은 unique layout 때문에 한 페이지 안의 paragraph를 각각 별도의 `UITextView`로 구성한다.

```text
Page
├─ Paragraph UITextView 1
├─ Paragraph UITextView 2
└─ Paragraph UITextView 3
```

각 paragraph 자체는 accessible하다. 하지만 VoiceOver의 line rotor가 한 paragraph 끝에 도달했을 때 다음 paragraph의 첫 line으로 자동 이동하지 못한다.

---

# 🔄 UIKit Text Navigation API

iOS 18부터 separate text element 사이를 연결하는 text navigation API가 제공된다.

```swift
paragraph.accessibilityNextTextNavigationElement
paragraph.accessibilityPreviousTextNavigationElement
```

세션 코드:

```swift
class TravelGuidePageController: UIViewController {

    var paragraphs: [TravelGuideParagraph]

    func configureNavigationElements() {
        for (index, paragraph) in paragraphs.enumerated() {
            if index + 1 < paragraphs.count {
                paragraph.accessibilityNextTextNavigationElement =
                    paragraphs[index + 1]
            }

            if index - 1 >= 0 {
                paragraph.accessibilityPreviousTextNavigationElement =
                    paragraphs[index - 1]
            }
        }
    }
}
```

이후 VoiceOver line rotor로 paragraph 1의 마지막 line을 지나면 paragraph 2의 첫 line으로 자연스럽게 이동한다.

이 API는 다음 구조에서 특히 중요하다.

- 한 문서가 여러 `UITextView`로 나뉨
- Column 또는 card layout 때문에 text block이 별도 view
- Paginated reader
- Inline media 사이에 text view가 분리됨

중요한 것은 visual hierarchy가 아니라 **읽기 순서**를 명시하는 것이다.

---

# ✨ SwiftUI의 `accessibilityLinkedGroup`

iOS 27부터 SwiftUI에서는 여러 selectable text element를 linked group으로 묶을 수 있다.

```swift
struct PageView: View {
    @Namespace private var pageNamespace

    var paragraphs: [String]
    var pageNumber: Int

    var body: some View {
        Text(paragraphs[0])
            .textSelection(.enabled)
            .accessibilityLinkedGroup(
                id: pageNumber,
                in: pageNamespace
            )

        Text(paragraphs[1])
            .textSelection(.enabled)
            .accessibilityLinkedGroup(
                id: pageNumber,
                in: pageNamespace
            )
    }
}
```

같은 `id`와 namespace를 사용한 text element들이 하나의 연속적인 text navigation group으로 동작한다.

macOS에서는 AppKit의 `accessibilitySharedTextUIElements`가 유사한 목적을 제공한다.

---

# 📚 Continuous Reading 문제

Paginated content는 visual layout 측면에서는 자연스럽지만 read-all experience에서는 문제가 될 수 있다.

기본 상태:

```text
Speak Screen 시작
      ↓
Page 1 읽음
      ↓
Page 1 끝
      ↓
중지
```

좋은 경험:

```text
Speak Screen 시작
      ↓
Page 1
      ↓
자동 page turn
      ↓
Page 2
      ↓
Page 3
```

---

# 📄 `.causesPageTurn` Trait

페이지의 마지막 paragraph에 `.causesPageTurn` trait를 적용한다.

```swift
override func viewDidLoad() {
    super.viewDidLoad()

    lastParagraphView
        .accessibilityTraits
        .insert(.causesPageTurn)
}
```

이 trait는 현재 accessibility element 뒤에 새로운 페이지가 이어진다는 의미를 시스템에 전달한다.

---

# ↔️ `accessibilityScroll`

`.causesPageTurn`은 실제 page 변경 동작과 함께 사용해야 한다.

```swift
override func accessibilityScroll(
    _ direction: UIAccessibilityScrollDirection
) -> Bool {

    moveToPage(direction)

    let scrollString =
        "Page \(currentPage) of \(pages.count)"

    UIAccessibility.post(
        notification: .pageScrolled,
        argument: scrollString
    )

    return true
}
```

Assistive technology가 page turn을 요청하면 앱이 실제로 다음/이전 page로 이동한다.

페이지를 바꾼 뒤 `.pageScrolled` notification으로 현재 페이지 정보를 전달한다.

이렇게 구성하면 Speak Screen과 VoiceOver의 continuous reading이 페이지 경계를 자연스럽게 넘어간다.

---

# ✂️ Accessible Text Selection

`UITextView`는 이미 accessible text selection을 제공한다. 같은 경험을 `TextEditor`, `.textSelection(.enabled)`가 적용된 SwiftUI `Text`, `NSTextView`에서도 얻을 수 있다.

VoiceOver 사용자는 text selection rotor를 사용해 selection granularity를 바꿀 수 있다.

예:

- Word
- Line
- Character

---

# 💾 선택한 Text를 저장하는 Custom Action

Travel Guide 앱에는 사용자가 선택한 문장을 저장하는 기능이 있다. Visual UI에서는 toolbar button으로 제공하지만 VoiceOver 사용자에게도 이 기능을 discoverable하게 만들어야 한다.

이를 위해 custom accessibility action을 **edit rotor**에 추가한다.

```swift
class TravelGuideParagraph: UITextView {

    override var accessibilityCustomActions:
        [UIAccessibilityCustomAction]? {

        get {
            let saveAction =
                UIAccessibilityCustomAction(
                    name: "Save Recommendation"
                ) { _ in
                    self.saveRecommendation()
                }

            saveAction.category =
                UIAccessibilityCustomAction.editCategory

            return
                (super.accessibilityCustomActions ?? [])
                + [saveAction]
        }

        set { }
    }
}
```

Text selection과 관련된 action은 generic action으로 두지 말고 `editCategory`를 사용한다.

사용자 흐름:

```text
Text Selection Rotor
      ↓
Selection 범위 확대
      ↓
Edit Rotor
      ↓
Save Recommendation
```

---

# 📰 Accessibility Reader

세션은 iOS 26부터 제공되는 Accessibility Reader도 언급한다.

앞서 설명한 accessible text practice는 다음 기술이 함께 혜택을 얻는다.

- VoiceOver
- Speak Screen
- Accessibility Reader

즉 특정 assistive technology 하나만을 위한 workaround가 아니라, text semantics를 시스템에 올바르게 제공하는 것이 중요하다.

---

# 🖼️ Custom-rendered Text 문제

Dedicated reading app에서는 다음 이유로 custom text를 사용할 수 있다.

- Advanced typography
- 여러 앱에서 shared rendering code 사용
- Scanned page
- Handwritten notes
- Image 안의 text

Travel Guide 앱은 handwritten notebook scan으로 text view를 교체한다.

Visual 사용자는 내용을 볼 수 있지만 VoiceOver 입장에서는 단순 image가 된다.

```text
Morning. Heading. Image.
```

Text의 실제 의미와 geometry가 accessibility system에 전달되지 않았기 때문이다.

---

# 🧩 해결책: `UITextInput`

Custom-rendered text를 native text view와 같은 수준으로 접근 가능하게 만드는 가장 좋은 방법은 `UITextInput`을 채택하는 것이다.

```swift
class ScannedPage: UIView, UITextInput {
    // ...
}
```

Fully implement하면 다음이 가능해진다.

- VoiceOver line-by-line touch exploration
- Rotor 기반 line/word/character navigation
- Speak Screen
- Text selection
- Range-based text query

Apple은 `UITextInput`의 accessibility benefit을 온전히 얻으려면 protocol을 **전체적으로 구현해야 한다**고 강조한다.

---

# 📐 `selectionRects(for:)`

Assistive technology가 특정 range를 highlight할 때 필요한 geometry를 제공한다.

```swift
func selectionRects(
    for range: UITextRange
) -> [UITextSelectionRect] {

    var rects: [UITextSelectionRect] = []

    let startLine =
        lineIndex(for: range.start)

    let endLine =
        lineIndex(for: range.end)

    for line in startLine...endLine {
        let rect =
            selectionRectFromImage(
                for: range,
                in: line
            )

        rects.append(rect)
    }

    return rects
}
```

Handwriting image의 각 line width와 height를 알고 있다면 selection range에 해당하는 approximate rectangle을 계산할 수 있다.

---

# 🔤 `text(in:)`

Assistive technology가 특정 range의 실제 text를 요청하면 해당 substring을 반환해야 한다.

```swift
func text(
    in range: UITextRange
) -> String? {

    let nsRange =
        nsRange(from: range)

    guard let range =
        Range(nsRange, in: scannedText)
    else {
        return nil
    }

    return String(scannedText[range])
}
```

Visual image만 가지고 있어서는 안 되고, 그 image에 대응하는 searchable/selectable text model이 필요하다.

---

# 🧭 Tokenizer

Tokenizer는 navigation granularity를 이해하는 핵심 요소다.

Assistive technology가 다음 단위로 이동할 때 사용된다.

- Character
- Word
- Sentence
- Line

세션 예제는 UIKit의 tokenizer를 subclass한다.

```swift
var tokenizer: any UITextInputTokenizer {
    CustomHandwritingTokenizer(
        textInput: self
    )
}
```

Custom rendering 방식에 맞게 line boundary와 text position을 해석하도록 구현한다.

---

# 🔄 `UITextInputDelegate`

Selection이 assistive technology에 의해 변경되면 시스템 UI도 그 변화를 알아야 한다.

```swift
weak var inputDelegate:
    UITextInputDelegate?

var selectedTextRange: UITextRange? {
    willSet {
        inputDelegate?
            .selectionWillChange(self)
    }

    didSet {
        inputDelegate?
            .selectionDidChange(self)
    }
}
```

Selection state를 내부적으로 바꾸는 것만으로 끝내지 않고 delegate에 변경을 알린다.

---

# ✋ `UITextInteraction`

세션은 custom page에 다음 interaction을 추가한다.

```swift
let interaction =
    UITextInteraction(
        for: .nonEditable
    )

interaction.textInput = self
addInteraction(interaction)
```

이것은 `UITextInput` protocol 자체의 필수 조건은 아니다.

하지만 selection handles와 highlight 같은 visual experience를 system text view와 유사하게 만들 수 있다.

---

# 🔗 Custom Text도 Navigation과 Page Turn API 사용 가능

`UITextInput` 기반 custom accessibility element 역시 앞에서 설명한 API와 함께 사용할 수 있다.

- `accessibilityNextTextNavigationElement`
- `accessibilityPreviousTextNavigationElement`
- `.causesPageTurn`
- `accessibilityScroll`

따라서 custom text라고 해서 별도의 완전히 다른 reading model을 만들 필요는 없다.

---

# 🧩 Standard Text와 Custom Text 비교

| 항목 | Standard Text View | Custom-rendered Text |
|---|---|---|
| 대표 API | `UITextView`, `TextEditor`, `NSTextView` | Custom `UIView` 등 |
| `UITextInput` | 기본 제공 | 직접 구현 |
| Line/word/character navigation | 기본 제공 | 구현 후 지원 |
| Text selection | 기본 제공 | 직접 구현 |
| Selection geometry | Framework 처리 | 직접 계산 |
| Tokenizer | Framework 제공 | 필요 시 custom 구현 |
| Selection handles | 기본 제공 | `UITextInteraction` 활용 |
| Cross-element navigation | Navigation API 추가 | 동일 API 사용 가능 |
| Page turn | `.causesPageTurn` + scroll | 동일 |
| 권장 우선순위 | 가능하면 우선 사용 | 필요한 경우만 사용 |

---

# 🧭 Accessible Reading 구현 전략

## 1. 먼저 Native Text Component를 선택

```text
SwiftUI → Text / TextEditor
UIKit   → UITextView
AppKit  → NSTextView
```

Framework가 이미 제공하는 accessibility를 최대한 활용한다.

## 2. 여러 Text View라면 연결

```text
UIKit
→ next / previous text navigation element

SwiftUI
→ accessibilityLinkedGroup

AppKit
→ accessibilitySharedTextUIElements
```

## 3. Pagination이라면 Read-All을 연결

```text
마지막 Element
→ causesPageTurn

Accessibility Scroll
→ 실제 Page 변경

pageScrolled
→ 현재 Page 안내
```

## 4. Selection Action을 Edit Rotor에 추가

```text
UIAccessibilityCustomAction
→ editCategory
```

## 5. Custom Text라면 UITextInput 전체 구현

```text
Text model
+
Geometry
+
Range
+
Tokenizer
+
Selection
+
Interaction
```

---

# 📋 체크리스트

## Reading Experience Audit

- [ ] VoiceOver를 실제로 켜고 테스트
- [ ] 화면을 터치해 line 단위 읽기 확인
- [ ] Lines rotor로 위/아래 이동
- [ ] Words rotor 확인
- [ ] Characters rotor 확인
- [ ] Text Selection rotor 확인
- [ ] Speak Screen read-all 테스트
- [ ] Accessibility Reader 확인
- [ ] Page 경계에서 focus가 끊기지 않는지 테스트

## Standard Text View

- [ ] 가능한 경우 `UITextView` 사용
- [ ] SwiftUI라면 `TextEditor` 검토
- [ ] 읽기 전용 text는 `.textSelection(.enabled)` 검토
- [ ] macOS라면 `NSTextView` 검토
- [ ] Native selection behavior 유지
- [ ] 불필요하게 custom renderer를 만들지 않기

## Granular Navigation

- [ ] 한 페이지에 text view가 여러 개인지 확인
- [ ] Paragraph 사이 line navigation 테스트
- [ ] UIKit에서 `accessibilityNextTextNavigationElement` 설정
- [ ] UIKit에서 `accessibilityPreviousTextNavigationElement` 설정
- [ ] SwiftUI에서 같은 group id/namespace로 `accessibilityLinkedGroup`
- [ ] AppKit에서 `accessibilitySharedTextUIElements` 검토
- [ ] 실제 읽기 순서와 navigation 순서 일치 확인

## Continuous Reading

- [ ] Speak Screen이 page bottom에서 멈추는지 테스트
- [ ] 마지막 paragraph에 `.causesPageTurn`
- [ ] `accessibilityScroll` 구현
- [ ] 이전/다음 page 방향 처리
- [ ] Page 변경 성공 시 `true` 반환
- [ ] `.pageScrolled` notification 전달
- [ ] “Page X of Y”와 같은 상태 정보 제공
- [ ] VoiceOver continuous reading도 함께 테스트

## Text Selection

- [ ] VoiceOver Text Selection rotor 테스트
- [ ] Word selection 확장/축소 테스트
- [ ] Line selection 테스트
- [ ] 앱의 selected-text action이 VoiceOver에서 발견 가능한지 확인
- [ ] `UIAccessibilityCustomAction` 활용
- [ ] Text editing/selection action에는 `editCategory` 사용
- [ ] `super.accessibilityCustomActions` 보존
- [ ] Action 실행 후 결과 feedback 제공

## Custom-rendered Text

- [ ] Custom text가 정말 필요한지 재검토
- [ ] `UITextInput` 전체 구현 계획 수립
- [ ] Text와 visual image 사이의 position mapping 정의
- [ ] `selectionRects(for:)` 구현
- [ ] Range별 `text(in:)` 구현
- [ ] Text position / range 변환 구현
- [ ] Tokenizer 제공
- [ ] Character / word / sentence / line navigation 테스트
- [ ] `selectedTextRange` 유지
- [ ] `UITextInputDelegate` notification 호출
- [ ] VoiceOver selection highlight 확인

## `UITextInteraction`

- [ ] Non-editable text에 `.nonEditable` interaction 검토
- [ ] `interaction.textInput = self`
- [ ] Selection handle UI 확인
- [ ] Highlight가 custom rendering 위치와 일치하는지 확인
- [ ] Assistive technology가 selection을 바꿨을 때 UI 갱신

## Paginated Custom Text

- [ ] Custom `UITextInput` element끼리 navigation 연결
- [ ] 마지막 custom element에 page-turn behavior 추가
- [ ] Scanned page에서도 read-all이 다음 page로 이어지는지 확인
- [ ] Page 교체 후 accessibility focus가 올바른 위치로 이동하는지 확인

---

# ⚠️ 구현 시 주의할 점

## Accessible Label만 추가하는 것으로 충분하지 않다

Long-form text에서는 한 element 전체를 하나의 accessibility label로 읽어주는 것만으로는 충분하지 않다.

사용자가 줄, 단어, 글자 단위로 이동하고 선택할 수 있어야 한다.

## 여러 Text View를 Visual Order만 맞추면 끝나지 않는다

VoiceOver line rotor가 view boundary를 자동으로 넘어가는 것은 아니다.

Text navigation 관계를 명시적으로 연결해야 한다.

## `.causesPageTurn`만 넣어서는 실제 Page가 바뀌지 않는다

Trait은 page turn 의미를 시스템에 알려준다.

실제 page 변경은 `accessibilityScroll` 같은 app logic으로 구현해야 한다.

## Custom Action은 적절한 Rotor Category를 사용한다

Text selection과 관련된 action을 generic action으로 만들면 discoverability가 떨어진다.

Edit-related action에는 `editCategory`를 사용한다.

## `UITextInput`은 일부만 구현하지 않는다

Selection rectangle과 tokenizer 몇 개만 작성하고 끝내는 protocol이 아니다.

Native text view 수준의 accessibility를 얻으려면 전체 contract를 구현해야 한다.

---

# 🧩 주요 API 정리

| API | 역할 |
|---|---|
| `UITextView` | UIKit의 native accessible text view |
| `TextEditor` | SwiftUI long-form text editing |
| `Text.textSelection(.enabled)` | SwiftUI Text selection 활성화 |
| `NSTextView` | AppKit native text view |
| `UITextInput` | High-fidelity text interaction protocol |
| `accessibilityNextTextNavigationElement` | 다음 accessible text element 연결 |
| `accessibilityPreviousTextNavigationElement` | 이전 text element 연결 |
| `accessibilityLinkedGroup(id:in:)` | SwiftUI text element들을 연속 navigation group으로 연결 |
| `accessibilitySharedTextUIElements` | AppKit의 text element 연결 |
| `.causesPageTurn` | 현재 element 뒤의 page turn 의미 제공 |
| `accessibilityScroll` | Accessibility 요청에 따른 실제 page 이동 |
| `.pageScrolled` notification | Page 변경 상태 알림 |
| `UIAccessibilityCustomAction.editCategory` | Selection 관련 action을 edit rotor에 노출 |
| `selectionRects(for:)` | Text range의 visual selection geometry |
| `text(in:)` | 특정 range의 text 반환 |
| `UITextInputTokenizer` | Character/word/sentence/line navigation |
| `UITextInteraction` | Standard text selection visual interaction |

---

# 🧪 세션이 권장하는 최종 검증

앱을 실제 assistive technology로 audit한다.

반드시 다음을 직접 수행한다.

```text
VoiceOver ON
   ↓
Read All
   ↓
Lines Rotor
   ↓
Text Selection
```

즉 accessibility API가 코드상 존재한다는 것보다 **실제 읽기 흐름이 자연스러운가**를 검증해야 한다.

---

# 핵심 메시지

Accessible reading app은 “VoiceOver가 이 view를 읽을 수 있는가?”만 확인해서는 충분하지 않다.

좋은 reading experience에는 다음 세 가지가 모두 필요하다.

```text
Granular Navigation
        +
Continuous Reading
        +
Comprehensive Selection
```

표준 `UITextView`, `TextEditor`, selectable `Text`, `NSTextView`는 이 기반을 이미 제공하므로 가능한 경우 항상 먼저 선택하는 것이 좋다.

여러 text element로 문서가 나뉘었다면 UIKit의 next/previous navigation API, SwiftUI의 `accessibilityLinkedGroup`, AppKit의 shared text element API로 읽기 흐름을 연결한다.

Paginated content에서는 `.causesPageTurn`과 `accessibilityScroll`을 결합해 Speak Screen과 VoiceOver의 read-all이 다음 페이지로 자연스럽게 이어지게 한다.

선택 텍스트에 대한 앱의 기능은 `UIAccessibilityCustomAction.editCategory`를 사용해 edit rotor에서 발견 가능하게 만든다.

그리고 custom-rendered text, scanned page, handwriting처럼 native text view를 사용할 수 없는 경우에는 `UITextInput`을 전체적으로 구현해 text range, geometry, tokenizer, selection을 accessibility system에 제공한다.

결국 목표는 assistive technology 사용자가 앱의 시각적 구조를 우회하는 것이 아니라, **다른 사용자와 동일하게 텍스트 자체를 탐색하고, 계속 읽고, 선택하고, 행동할 수 있게 만드는 것**이다.

---

# 함께 보면 좋은 세션과 자료

- Creating an Accessible Reading Experience — WWDC19
- `UITextInput`
- `accessibilityNextTextNavigationElement`
- `accessibilityLinkedGroup(id:in:)`
- `.causesPageTurn`
- Accessibility for UIKit
