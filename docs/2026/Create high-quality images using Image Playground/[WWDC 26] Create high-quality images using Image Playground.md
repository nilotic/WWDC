# WWDC26 Create high-quality images using Image Playground 요약

- Session: 375
- Title: Create high-quality images using Image Playground
- Source: https://developer.apple.com/videos/play/wwdc2026/375/
- Topic: Image Playground, Apple Intelligence, SwiftUI, UIKit, AppKit
- Chapters: Introduction, Capabilities, Adopt Image Playground, Options, Availability

---

## 한 줄 요약

Image Playground는 Private Cloud Compute에서 실행되는 새로운 생성형 이미지 모델을 앱에 통합해, 사실적인 이미지부터 일러스트·스케치·Genmoji까지 다양한 스타일과 비율의 이미지를 생성하도록 지원한다.

---

## 핵심 요약

이번 세션은 Image Playground를 앱에 적용하는 전체 흐름을 네 부분으로 설명한다.

- **Capabilities**
  - 사실적인 이미지 포함 다양한 스타일 지원
  - 여러 인물과 사진 보관함 기반 개인화
  - 가로·세로·정사각형 등 다양한 비율
  - Private Cloud Compute 기반 처리

- **Adopt Image Playground**
  - SwiftUI의 `imagePlaygroundSheet`
  - UIKit·AppKit의 `ImagePlaygroundViewController`
  - 텍스트, 기존 이미지, PencilKit 드로잉으로 초기 맥락 제공

- **Options**
  - 이미지 크기와 비율 지정
  - 허용 스타일과 기본 스타일 설정
  - 외부 이미지 제공자 지원
  - Genmoji용 Adaptive Image Glyph 생성
  - 개인화 기능 활성화·비활성화

- **Availability**
  - `supportsImageGeneration` 환경값 사용
  - 미지원 기기·언어·지역에 대체 UI 제공
  - 사용량 제한과 서버 인프라는 시스템이 관리

---

# 🎨 Image Playground의 새 이미지 생성 경험

Image Playground는 Messages, Freeform, 그리고 서드파티 앱에서 개인화된 이미지를 만들기 위한 시스템 경험이다.

WWDC26에서는 새로운 생성형 이미지 모델을 중심으로 품질이 크게 향상됐다.

주요 변화는 다음과 같다.

- 사실적인 사진 스타일 생성
- 다양한 미술 스타일 지원
- 여러 사람을 한 장면에 포함
- 사진 보관함의 인물을 활용한 개인화
- 텍스트 설명을 통한 자유로운 이미지 생성
- 가로·세로·정사각형 비율 지원
- 앱 안에서 시스템과 동일한 생성 UI 제공

Image Playground 앱은 iOS, iPadOS, macOS, visionOS에서 제공되며, 같은 플랫폼에서 `ImagePlayground.framework`를 사용할 수 있다.

---

# 🧠 Private Cloud Compute 기반 생성

새로운 이미지 생성 모델은 Private Cloud Compute에서 실행된다.

Apple은 다음 특성을 강조한다.

- 사용자 데이터는 저장되지 않음
- Apple을 포함한 제3자가 데이터에 접근할 수 없음
- 생성 요청 처리에만 데이터 사용
- 앱 개발자가 별도의 서버를 운영할 필요 없음
- API 키나 서버 엔드포인트 설정 불필요
- 사용량 제한 UI를 앱이 직접 만들 필요 없음

이미지 생성에는 강력한 서버 모델이 사용되므로 일일 사용량 제한이 있다. 대부분의 iCloud+ 구독에서는 사용량을 더 늘릴 수 있다. 앱은 시스템의 사용량 정책이나 구독 상태를 직접 관리하지 않는다.

---

# 🖼️ 지원되는 이미지 스타일

Image Playground는 텍스트 설명만으로 이미지를 생성할 수 있다. 스타일을 명시하지 않고 시스템에 맡길 수도 있고, 텍스트로 원하는 스타일을 설명할 수도 있다.

| 스타일 | 특징 |
|---|---|
| Animation | 장난스럽고 생동감 있는 표현 |
| Illustration | 정제된 편집 일러스트 스타일 |
| Sketch | 손으로 그린 듯한 표현 |
| Emoji | 텍스트에 삽입 가능한 표현형 캐릭터 |
| Photorealistic | 실제 사진처럼 사실적인 이미지 |

---

# 👥 사람과 개인화

Image Playground는 한 이미지 안에 여러 사람을 포함할 수 있다.

개인화를 활성화하면 사용자는 다음 방법으로 인물을 추가할 수 있다.

- Photos 보관함에서 사람 선택
- 텍스트로 외모 설명
- 기존 사진을 시작 이미지로 사용

개인화가 필요하지 않은 제품 이미지 생성, 배경 이미지 생성, 일반적인 일러스트 제작 등의 맥락에서는 해당 기능을 비활성화할 수 있다.

---

# 📐 크기와 종횡비

Image Playground는 여러 이미지 크기와 종횡비를 지원한다.

| 용도 | 권장 형태 |
|---|---|
| 배너 | 가로형 |
| iPhone 전체 화면 | 세로형 |
| 썸네일 | 정사각형 |
| 카드 표지 | 카드 레이아웃에 맞는 비율 |
| 프로필 이미지 | 정사각형 또는 세로형 |

앱은 원하는 `CGSize`를 제공하고, 시스템은 가장 가까운 지원 해상도와 비율을 선택한다.

```swift
var options = ImagePlaygroundOptions()
options.sizeSpecification = .closest(to: card.format.size)
```

---

# 🧩 SwiftUI에 Image Playground 추가

SwiftUI에서는 `imagePlaygroundSheet` modifier를 사용한다.

```swift
@State private var showingPlayground = false

var body: some View {
    Button("Create image") {
        showingPlayground = true
    }
    .imagePlaygroundSheet(
        isPresented: $showingPlayground,
        onCompletion: { url in
            store.saveImage(url)
        }
    )
}
```

시트가 열리면 시스템이 이미지 생성 UI, 텍스트 입력, 스타일 선택, 인물 선택, 결과 미리보기, 확정과 취소를 모두 처리한다.

---

# 💾 임시 URL 저장

completion closure로 전달되는 URL은 앱 컨테이너 안의 임시 위치를 가리킨다. 세션 종료 전에 앱이 영구 위치로 복사하거나 저장해야 한다.

```swift
onCompletion: { url in
    var updated = currentCard
    store.saveImage(url, for: &updated)
}
```

---

# 💡 앱의 맥락으로 초기 프롬프트 제공

`ImagePlaygroundConcept`를 사용하면 앱이 알고 있는 정보를 시트의 시작점으로 전달할 수 있다.

## 직접 텍스트

```swift
.text(card.theme)
```

## 긴 텍스트에서 핵심 추출

```swift
.extracted(from: card.message, title: card.theme)
```

## 여러 개념 조합

```swift
var concepts: [ImagePlaygroundConcept] {
    [
        .text(card.theme),
        .extracted(from: card.message, title: card.theme)
    ]
}
```

---

# 📷 기존 이미지를 시작점으로 사용

`sourceImage`에 SwiftUI `Image`를 전달하면 기존 이미지를 시각적 참고 자료로 사용할 수 있다.

```swift
.imagePlaygroundSheet(
    isPresented: $showingPlayground,
    concepts: concepts,
    sourceImage: sourceImage,
    onCompletion: { url in
        store.saveImage(url)
    }
)
```

시작 이미지는 결과를 고정하는 제약이 아니라 초기 영감으로 사용된다.

---

# ✏️ PencilKit 드로잉 활용

`ImagePlaygroundConcept.drawing`을 사용하면 `PKDrawing`을 이미지 생성의 시각적 제안으로 전달할 수 있다.

```swift
if !drawing.strokes.isEmpty {
    result.append(.drawing(drawing))
}
```

모델은 선을 그대로 복제하는 것이 아니라 구도와 분위기를 위한 힌트로 사용한다.

---

# 🪟 UIKit과 AppKit 지원

UIKit과 AppKit에서는 `ImagePlaygroundViewController`를 사용한다.

```swift
let viewController = ImagePlaygroundViewController()
viewController.concepts = [
    .text(card.theme),
    .extracted(from: card.message)
]
viewController.delegate = self
present(viewController, animated: true)
```

결과는 delegate의 `didCreateImageAt`을 통해 전달된다.

---

# ⚙️ ImagePlaygroundOptions

`ImagePlaygroundOptions`로 크기, 종횡비, 개인화 등을 설정한다.

SwiftUI에서는 `imagePlaygroundOptions` modifier로 전달한다.

```swift
.imagePlaygroundOptions(options)
```

---

# 🎭 기본 스타일과 허용 스타일

`imagePlaygroundGenerationStyle`로 기본 스타일과 허용 스타일을 설정한다.

```swift
.imagePlaygroundGenerationStyle(
    preset.defaultStyle,
    in: preset.allowedStyles
)
```

허용 목록에 한 개의 스타일만 전달하면 스타일 선택기가 해당 스타일로 고정된다.

---

# 🌐 외부 이미지 제공자

`externalProvider` 스타일을 허용하면 사용자가 설정에서 지정한 외부 이미지 생성 제공자를 사용할 수 있다.

```swift
.imagePlaygroundGenerationStyle(
    preset.defaultStyle,
    in: preset.allowedStyles + [.externalProvider]
)
```

앱은 제공자 설정 여부를 직접 확인하지 않으며, 시스템이 현재 사용 가능한 환경에 맞춰 UI를 조정한다.

---

# 😀 Emoji 스타일과 Adaptive Image Glyph

`ImagePlaygroundStyle.emoji`는 텍스트 안에 삽입하기 위한 표현형 캐릭터에 맞춰 조정된 스타일이다.

일반 이미지 URL과 별도로 `NSAdaptiveImageGlyph` 결과를 받을 수 있다.

```swift
.imagePlaygroundSheet(
    isPresented: $showingIconPlayground,
    concepts: concepts,
    onCompletion: { _ in },
    onAdaptiveImageGlyphCreation: { glyph in
        store.saveIcon(glyph)
    }
)
.imagePlaygroundGenerationStyle(.emoji, in: [.emoji])
```

---

# 🙋 개인화 비활성화

개인화는 기본적으로 활성화된다. 앱 맥락에 맞지 않으면 다음과 같이 비활성화할 수 있다.

```swift
options.personalization = .disabled
```

비활성화하면 Photos 인물 선택기와 이름 감지 기능이 시트에서 사라진다.

---

# ✅ 이미지 생성 지원 여부 확인

SwiftUI에서는 `supportsImageGeneration` 환경값 하나로 지원 여부를 확인할 수 있다.

```swift
@Environment(\.supportsImageGeneration)
private var supportsImageGeneration
```

```swift
if supportsImageGeneration {
    CardEditorView(card: card)
} else {
    CardPickerView(card: card)
}
```

별도의 entitlement나 복잡한 capability 검사는 필요하지 않다.

---

# 🔄 미지원 환경의 대체 경험

지원되지 않는 기기·언어·지역에서는 Photos picker나 기본 이미지 선택 등 대체 흐름을 제공해야 한다.

| 지원 상태 | 표시 화면 |
|---|---|
| 지원됨 | Image Playground 기반 편집기 |
| 지원 안 됨 | Photos picker 등 대체 화면 |

미지원 환경에서도 앱의 핵심 작업을 계속 수행할 수 있어야 한다.

---

# ⚠️ ImageCreator 지원 중단

기존의 UI 없는 이미지 생성 API인 `ImageCreator`는 deprecated 되었다.

이제 이미지 생성은 새로운 Image Playground API를 중심으로 제공된다.

새 API는 더 높은 이미지 품질, Private Cloud Compute 기반 개인정보 보호, 시스템 생성 UI, 스타일·개인화 기능, 사용량 제한 처리를 제공한다.

---

# 🧭 적용 흐름 정리

| 단계 | 작업 |
|---|---|
| 1 | 앱에서 이미지가 필요한 맥락 정의 |
| 2 | `supportsImageGeneration`으로 기능 지원 확인 |
| 3 | `imagePlaygroundSheet` 또는 `ImagePlaygroundViewController` 적용 |
| 4 | 앱의 텍스트, 이미지, 드로잉을 concepts로 제공 |
| 5 | 크기와 비율 설정 |
| 6 | 기본 스타일과 허용 스타일 결정 |
| 7 | 개인화 사용 여부 설정 |
| 8 | 생성 결과 URL을 영구 저장 |
| 9 | Emoji 스타일이면 Adaptive Image Glyph 처리 |
| 10 | 미지원 환경에 대체 경험 제공 |

---

# 📋 체크리스트

- [ ] 이미지 생성이 앱의 실제 기능과 자연스럽게 연결되는지 확인
- [ ] `supportsImageGeneration`을 기준으로 지원 여부 처리
- [ ] 미지원 기기·언어·지역을 위한 대체 경험 제공
- [ ] completion의 임시 URL을 영구 위치에 저장
- [ ] 앱이 알고 있는 텍스트 맥락을 `ImagePlaygroundConcept`으로 제공
- [ ] 긴 텍스트에는 `.extracted` 사용 검토
- [ ] 기존 이미지를 `sourceImage`로 제공할지 검토
- [ ] PencilKit 드로잉 활용 여부 검토
- [ ] 사용처에 맞는 크기와 종횡비 지정
- [ ] 앱 목적에 맞는 스타일만 허용
- [ ] 외부 제공자 지원 여부 결정
- [ ] Emoji 결과에는 `NSAdaptiveImageGlyph` 처리
- [ ] 사람 기반 개인화가 앱 맥락에 적합한지 확인
- [ ] 불필요한 경우 개인화 비활성화
- [ ] 생성 실패·취소 상황 처리
- [ ] 결과 이미지 저장 공간과 삭제 정책 정의
- [ ] 생성 이미지에 접근성 레이블 제공
- [ ] 기존 `ImageCreator` 사용 코드를 새 API로 이전

---

# 핵심 메시지

Image Playground는 생성 모델과 시스템 UI를 함께 제공해, 앱이 별도의 이미지 생성 서버나 복잡한 설정 없이 고품질 생성 경험을 추가하도록 한다.

모델과 개인정보 보호 인프라는 Apple이 제공하지만, 어떤 맥락을 전달하고 어떤 크기와 스타일을 허용하며 생성 결과를 앱 경험에 어떻게 연결할지는 앱이 결정한다.

Image Playground가 모델을 제공한다면, 앱은 그 이미지가 필요한 이야기를 제공한다.

---

# 함께 보면 좋은 세션

- Build with the new Apple Foundation Model on Private Cloud Compute
- Read between the strokes with PencilKit
- Bring expression to your app with Genmoji
