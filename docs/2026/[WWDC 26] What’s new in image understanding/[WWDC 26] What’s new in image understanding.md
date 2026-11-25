# WWDC26 — What’s new in image understanding

- **Session:** 237
- **Source:** https://developer.apple.com/videos/play/wwdc2026/237/
- **Basis:** Apple Developer 공식 전체 transcript 및 Code 섹션
- **Topics:** Vision, Foundation Models, image inputs, tap-to-segment, image-based tool calling, watchOS

---

## 🎯 한 줄 요약

WWDC26의 image understanding은 크게 네 방향으로 확장된다. **Vision의 새로운 tap-to-segment API로 이미지의 임의 객체를 인터랙티브하게 분리**하고, **Foundation Models가 이미지를 직접 입력으로 받아 LLM 기반 시각 이해를 수행**하며, **`ImageReference`를 이용한 tool calling으로 Vision 같은 전문 이미지 분석 도구를 모델과 결합**하고, 마지막으로 **Vision이 watchOS까지 확장되어 작은 화면에서도 saliency 기반 이미지 처리**를 사용할 수 있게 된다.

---

## 🧭 세션 구성

| 시간 | 내용 |
|---|---|
| 0:00 | Introduction |
| 1:36 | Segment images with tap-to-segment |
| 5:50 | Image inputs for Foundation Models |
| 7:57 | Image-based tool calling |
| 13:09 | Vision on watchOS |
| 14:39 | Next steps |

---

# ✂️ Vision의 새로운 tap-to-segment

기존 Vision에도 사람처럼 특정 범주를 분리하는 segmentation 기능은 있었지만, WWDC26에서는 **사용자가 이미지의 임의 객체를 지정해 바로 분리할 수 있는 tap-to-segment API**가 추가된다.

예를 들어 카페 사진에서 다음과 같은 대상을 선택할 수 있다.

- 커피잔 하나
- 커피잔 + 접시
- 크루아상
- 여러 개의 객체를 한 번에
- 바닥이나 의류처럼 기존 고정 segmentation category가 아닌 대상

핵심은 “어떤 객체인지 사전에 category를 정의”하는 방식이 아니라, **사용자 입력을 seed로 주고 그 입력을 기준으로 object mask를 생성**한다는 점이다.

## 🖱️ 객체를 지정하는 방법

Transcript에서 소개한 입력 방식은 여러 가지다.

- 하나의 **point**를 탭
- 대상 전체를 둘러싸는 **bounding box**
- 객체 외곽을 따라 그리는 **lasso**
- 여러 객체 위를 지나가는 **scribble**

단일 point는 단순한 객체에는 충분하지만, 객체가 복잡하거나 여러 물체를 하나의 결과로 묶고 싶다면 bounding box, lasso, scribble 같은 더 풍부한 입력을 사용할 수 있다.

## ➕➖ 기존 mask를 계속 refine

한 번 segmentation mask를 만든 뒤에도 계속 수정할 수 있다.

예를 들어:

1. 커피잔 내부를 point로 지정해 cup을 segmentation
2. 접시를 included point로 추가해 cup + plate로 확장
3. cup 영역을 excluded point로 지정해 coffee liquid만 남기기

즉, tap-to-segment는 한 번 요청하고 끝나는 API라기보다 **초기 결과를 반복적으로 보정하는 interactive segmentation workflow**를 지원한다.

---

## 🧱 기본 API 흐름

세션의 공식 코드:

```swift
// Generate a segmentation mask of an object with a seed point
let handler = ImageRequestHandler(image)
let request = GenerateIterativeSegmentationRequest(seed: point)
let observation = try await handler.perform(request)
let mask = observation?.pixelBuffer

// Refine the mask with a new point
request.addIncludedPoint(newPoint)
let refinedObservation = try await handler.perform(request)
```

처리 순서는 다음과 같다.

1. 원본 image를 `ImageRequestHandler`에 전달
2. `GenerateIterativeSegmentationRequest` 생성
3. 객체 내부의 seed point를 전달
4. `handler.perform(request)` 실행
5. observation에서 segmentation mask 획득
6. 필요한 경우 point를 추가해 request를 다시 수행

결과 mask는 `PixelBuffer`이며, 각 pixel이 segmentation 대상에 속하는지를 나타낸다.

---

## 📐 좌표계 주의사항

Vision의 좌표는 일반적인 UIKit pixel 좌표를 그대로 쓰지 않는다.

### Normalized coordinates

- 원점은 **왼쪽 아래(lower-left)**
- X/Y 값은 **0...1 범위**
- 실제 image width/height를 기준으로 정규화해야 함

따라서 UIKit/SwiftUI에서 얻은 터치 좌표를 Vision request에 바로 넘기면 안 되고, **image coordinate로 변환한 뒤 normalized coordinate로 변환**해야 한다.

이 부분은 custom cropping/zooming/scroll view가 포함될수록 더 중요하다.

---

## ✏️ Lasso와 scribble의 stroke width

Apple은 lasso나 scribble을 사용할 때 너무 얇은 stroke를 피하라고 명시한다.

**권장 최소 line width는 전체 image width의 1% 이상**이다.

얇은 stroke는 segmentation 품질을 떨어뜨릴 수 있으므로, 사용자 화면에서 보기 좋은 선 굵기만 고려해서는 안 되고 **실제 이미지 해상도에 맞춘 최소 입력 폭**도 보장해야 한다.

---

## 📦 Segmentation model 다운로드

Tap-to-segment는 첫 실행부터 항상 즉시 사용 가능한 것은 아니다.

해당 기기에서 segmentation request를 처음 수행하기 전에 **필요한 model asset 다운로드**가 필요하다.

세션에서 언급한 API:

- `downloadAssets`
- `assetStatus`

따라서 실제 앱에서는 다음 상태를 UI와 함께 설계해야 한다.

- 아직 model이 없는 상태
- model 다운로드 중
- model 사용 준비 완료
- 다운로드 실패

특히 사용자가 segmentation UI를 처음 연 순간부터 다운로드를 시작하면 체감 latency가 커질 수 있으므로, 적절한 시점에 asset 상태를 확인하고 준비하는 것이 좋다.

---

# 🖼️ Foundation Models의 image input

WWDC26의 Foundation Models framework는 **이미지를 직접 prompt input으로 받을 수 있다.**

세션에서는 다음 예를 보여준다.

- 손으로 쓴 sticky note 사진으로 agenda 생성
- 사진 caption 생성
- living room 사진을 보고 interior decorating 제안
- 냉장고 사진을 보고 recipe 생성

LLM은 이미지에 대해 정형화된 하나의 task만 수행하는 것이 아니라 **자연어 prompt로 다양한 분석 목적을 정의**할 수 있다.

---

## 🧾 이미지 caption 생성

공식 코드:

```swift
// Generate an image caption with Foundation Models
import FoundationModels

let prompt = Prompt {
    "Generate a caption for this image"
    Attachment(image)
}
let response = try await session.respond(to: prompt)
let caption = response.content
```

핵심은 `Prompt` builder 안에 다음 두 가지가 함께 들어간다는 점이다.

- 모델이 수행해야 할 task를 설명하는 text instruction
- `Attachment(image)`

이후 기존 text prompt와 동일하게 `LanguageModelSession`에 response를 요청한다.

---

# ⚖️ Vision과 Foundation Models는 경쟁 관계가 아님

Apple은 두 프레임워크의 역할을 명확히 구분한다.

## Foundation Models

- 자연어 기반의 유연한 분석
- descriptive task에 강함
- 사용자가 요구하는 다양한 해석/생성 작업 수행
- fixed computer-vision API를 넘어서는 general reasoning 가능

## Vision

- 특정 computer-vision task에 최적화
- 전문화된 fixed API 제공
- 빠른 실행 속도
- 경우에 따라 **video frame을 실시간 분석할 정도의 성능**

따라서 “Vision 대신 Foundation Models를 써야 하는가?”가 아니라, **LLM의 유연성과 Vision의 전문성을 결합하는 구조**가 중요하다.

그 연결 지점이 바로 **tool calling**이다.

---

# 🛠️ Image-based tool calling

Foundation Models의 tool calling은 model이 직접 처리하기 어려운 문제를 외부 코드에 위임할 수 있게 한다.

일반적인 tool calling은:

1. 사용자가 prompt 입력
2. model이 외부 기능이 필요하다고 판단
3. tool argument 생성
4. tool 호출
5. tool result가 model에 반환
6. model이 그 결과를 이용해 최종 응답 생성

WWDC26에서는 여기에 **image argument**가 추가된다.

---

## 🌱 `ImageReference`를 사용하는 custom tool

예를 들어 사용자가 plant 사진을 첨부하고 식물 종류를 묻는다고 하자.

모델 자체가 식물을 정확히 식별하지 못한다면 앱이 plant classifier tool을 제공할 수 있다.

중요한 점은 **tool argument로 전체 image data를 다시 복사해 전달하지 않는다는 것**이다.

대신 model은 현재 conversation의 image를 가리키는 **`ImageReference`**를 생성한다.

공식 코드:

```swift
// Create an image-based tool
struct PlantIdentifierTool: Tool {
    @SessionProperty(\.history) var history

    @Generable
    struct Arguments {
        var image: ImageReference
    }

    func call(arguments: Arguments) async throws -> String {
        let imageReference = arguments.image
        let transcript = Transcript(history)
        guard let imageAttachment = imageReference.resolve(in: transcript) else {
            throw AppError.imageNotFound
        }
        let image = try imageAttachment.pixelBuffer()
        return classifyPlant(image)
    }
}
```

---

## 🔍 `ImageReference` 해석 과정

`ImageReference`는 독립적인 이미지 객체가 아니다.

Apple이 강조하는 중요한 제약:

> 각 `ImageReference`는 **그 reference가 만들어진 transcript의 context 안에서만 유효**하다.

따라서 tool 안에서는:

1. `@SessionProperty(\.history)`로 session history 접근
2. history로부터 `Transcript` 생성
3. `imageReference.resolve(in: transcript)` 실행
4. 실제 `ImageAttachment` 획득
5. 필요하면 `pixelBuffer()`로 변환
6. Vision/custom ML/classifier 등에 전달

이 구조 때문에 image tool은 단순히 `ImageReference` 값만 저장해서 나중에 임의의 다른 session에서 재사용할 수 있는 개념이 아니다.

---

# 🔎 Vision이 제공하는 Foundation Models용 built-in tools

일반적인 image understanding task는 매번 custom tool을 직접 작성할 필요가 없다.

Vision은 Foundation Models와 함께 사용할 수 있는 도구를 제공한다.

세션에서 직접 소개한 두 가지:

- **Barcode reader tool**
- **OCR tool**

## Barcode reader

LLM은 QR code나 barcode를 안정적으로 읽지 못할 수 있다.

세션 예제에서는 행사 flyer 이미지를 모델에 주고 다음 정보를 요청한다.

- 날짜
- 장소
- registration website

모델 자체는 날짜와 장소를 읽지만 QR code는 해석하지 못한다. 여기에 Vision barcode reader tool을 추가하면 model이 필요할 때 해당 tool을 호출해 QR code에서 URL을 얻고 최종 응답에 포함할 수 있다.

## OCR tool

OCR tool은 **매우 작거나 밀도가 높은 텍스트**를 읽을 때 유용하다.

Transcript에서는 OCR tool이 **30개 이상의 언어**를 읽을 수 있다고 설명한다.

---

## 🧩 Vision tool을 session에 등록

공식 코드:

```swift
// Use Vision tools
import FoundationModels
import Vision

let session = LanguageModelSession(model: model, tools: [BarcodeReaderTool()])
let response = try await session.respond(generating: EventInfo.self) {
    "Get the date, location, and website from this flyer"
    Attachment(image)
        .label("flyer")
}
```

핵심은 `LanguageModelSession` 초기화 시 `tools` 배열에 Vision tool을 제공하는 것이다.

---

## 🏷️ Image label이 중요

Image-based tool calling을 사용할 때 Apple이 별도로 강조한 항목이다.

```swift
Attachment(image)
    .label("flyer")
```

Tool call에 이미지를 전달하려면 **attachment에 label을 지정**하는 것이 중요하다.

이 label이 model이 “어떤 image를 tool에 넘겨야 하는지” 식별하는 기준이 된다.

특히 prompt에 이미지가 여러 개 존재한다면 label 없이 정확한 이미지 selection을 기대해서는 안 된다.

---

# 🧰 Vision으로 직접 만드는 custom image tool

Built-in barcode/OCR 외에도 Vision 자체에는 다양한 image-analysis API가 있으므로 이를 custom tool로 연결할 수 있다.

세션에서 언급한 예:

- image segmentation
- facial analysis
- pose estimation
- detection
- image classification
- trajectory analysis
- object tracking

즉, Foundation Models는 **언제 어떤 분석이 필요한지 결정하는 orchestration/reasoning layer**, Vision은 **정확하고 빠른 specialized visual analysis layer**로 사용할 수 있다.

이 조합은 Foundation Models만으로 모든 visual task를 해결하려는 것보다 더 예측 가능하고 전문적인 결과를 만들 수 있다.

---

# ⌚ Vision on watchOS

WWDC26부터 Vision은 watchOS에서도 사용할 수 있다.

세션에서는 hiking 중 wildlife 정보를 보여 주는 Watch app을 예로 든다.

Apple Watch 화면은 작기 때문에 동물 사진 전체를 그대로 축소하면 실제 관심 대상이 너무 작게 보일 수 있다.

이를 해결하기 위해 **saliency analysis**로 사진에서 관심도가 높은 대상을 찾고, 그 영역을 기준으로 crop해 표시한다.

---

## 🦌 Saliency 기반 crop

공식 코드:

```swift
// Create a crop that highlights a prominent subject
func generateImageCrop(in image: CGImage) async throws -> NormalizedRect? {
    let request = GenerateObjectnessBasedSaliencyImageRequest()
    let observation = try await request.perform(on: image)
    let prominentObjects = observation.salientObjects
    return prominentObjects.first
}
```

처리 과정:

1. `GenerateObjectnessBasedSaliencyImageRequest` 생성
2. image에 request 수행
3. saliency observation 획득
4. `salientObjects`에서 bounding box 목록 획득
5. 가장 prominent한 첫 번째 영역 선택
6. 해당 영역으로 crop

Watch처럼 표시 공간이 제한된 UI에서는 단순 center-crop보다 **실제 subject를 기준으로 crop**하는 편이 훨씬 효과적이다.

---

# 🧠 어떤 기술을 언제 선택할까

| 요구사항 | 우선 고려 |
|---|---|
| 사용자가 특정 객체를 직접 선택해 분리 | Vision tap-to-segment |
| 사진을 자연어로 설명/요약 | Foundation Models image input |
| 자유로운 질의/추론 | Foundation Models |
| QR/barcode 정확한 판독 | Vision `BarcodeReaderTool` |
| 작고 밀집된 글자 인식 | Vision OCR tool |
| 실시간 video frame 분석 | Vision |
| LLM이 필요할 때 전문 CV 기능 호출 | Foundation Models + Vision tool calling |
| Watch의 작은 화면에 맞춘 subject crop | Vision saliency |

핵심은 하나의 기술로 통일하는 것이 아니라 **task 성격에 맞게 조합하는 것**이다.

---

# ⚠️ 구현 시 놓치기 쉬운 포인트

## Tap-to-segment

- Vision 좌표 원점은 lower-left
- point를 0...1 normalized coordinate로 변환
- lasso/scribble은 image width 대비 최소 1% 정도의 stroke width 확보
- 최초 사용 전에 segmentation model asset 다운로드 필요
- `assetStatus`로 준비 상태 확인
- mask refinement를 처음부터 데이터 모델에 고려

## Foundation Models image input

- image는 `Attachment`로 prompt에 포함
- prompt text에서 image 처리 목적을 명확히 기술
- general reasoning은 가능하지만 fixed CV task의 정확도/속도는 Vision이 더 적합할 수 있음

## Image tool calling

- tool argument에는 `ImageReference` 사용
- reference는 생성된 transcript context에 종속
- `@SessionProperty(\.history)`와 `Transcript`로 resolve
- 실제 분석 전 `ImageAttachment`를 `pixelBuffer` 등으로 변환
- tool에서 사용할 image attachment에는 명확한 `.label(...)` 지정

## Vision on watchOS

- 작은 화면에서는 원본 이미지 전체를 단순 축소하지 말고 saliency crop 검토
- `salientObjects`가 여러 개일 수 있다는 점 고려
- 첫 object만 사용해야 하는지는 앱 UX에 따라 결정

---

# 📋 적용 체크리스트

### Interactive segmentation

- [ ] 객체 선택 UX를 point / rectangle / lasso / scribble 중 어떤 방식으로 제공할지 결정
- [ ] UIKit/SwiftUI 좌표를 Vision normalized coordinate로 변환
- [ ] included/excluded point를 이용한 refinement UX 설계
- [ ] lasso/scribble의 최소 stroke width 확보
- [ ] `downloadAssets` 기반 model 준비 흐름 구현
- [ ] `assetStatus`에 따른 loading/error UI 구현
- [ ] mask `PixelBuffer` 후처리/합성 경로 구현

### Foundation Models

- [ ] `Attachment(image)`를 prompt에 포함
- [ ] 모델에게 요구하는 image task를 명확하게 작성
- [ ] Vision과 Foundation Models 중 task에 적합한 쪽 선택
- [ ] 정확도/latency가 중요한 fixed CV task는 Vision 우선 검토

### Image tool calling

- [ ] custom `Tool`의 argument를 `ImageReference`로 정의
- [ ] `@SessionProperty(\.history)`로 history 접근
- [ ] `Transcript(history)`에서 reference resolve
- [ ] resolve 실패 처리
- [ ] attachment를 `pixelBuffer()` 등 필요한 형식으로 변환
- [ ] prompt image에 `.label(...)` 지정
- [ ] barcode/OCR는 직접 구현 전에 Vision built-in tool 검토

### watchOS

- [ ] 작은 화면용 이미지 crop 전략 검토
- [ ] `GenerateObjectnessBasedSaliencyImageRequest` 활용 가능성 확인
- [ ] salient bounding box를 실제 crop 좌표로 변환
- [ ] 여러 salient object 처리 정책 결정

---

# 💡 핵심 메시지

WWDC26의 image understanding은 **전문화된 computer vision과 범용 multimodal LLM을 하나로 대체하는 방향이 아니라 서로 결합하는 방향**으로 발전한다.

Vision은 tap-to-segment, OCR, barcode, saliency처럼 정확하고 빠른 전문 분석을 담당하고, Foundation Models는 이미지와 자연어를 함께 이해해 더 유연한 reasoning과 orchestration을 담당한다.

특히 `ImageReference` 기반 tool calling을 사용하면 LLM이 필요할 때 Vision의 전문 기능을 호출할 수 있으므로, 앱은 **LLM의 유연성 + Vision의 정확성과 속도**를 동시에 활용할 수 있다.

또한 Vision이 watchOS까지 확장되면서 이러한 image-processing 기능을 iPhone/iPad/Mac에 한정하지 않고 작은 wearable UI에서도 직접 사용할 수 있게 됐다.

---

# 🔗 함께 보면 좋은 세션과 자료

- [What’s new in image understanding — WWDC26](https://developer.apple.com/videos/play/wwdc2026/237/)
- [Segmenting objects using taps, scribbles or rectangles](https://developer.apple.com/documentation/vision/segmenting-objects-using-taps-scribbles-or-rectangles)
- [Implementing saliency-based image cropping in iOS and watchOS](https://developer.apple.com/documentation/vision/implementing-saliency-based-image-cropping-in-ios-and-watchos)
- WWDC26 — What’s new in the Foundation Models framework
- WWDC25 — Deep dive into the Foundation Models framework
- WWDC24 — Discover Swift enhancements in the Vision framework
