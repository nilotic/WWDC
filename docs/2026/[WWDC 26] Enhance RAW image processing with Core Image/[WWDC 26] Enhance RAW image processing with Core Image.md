# WWDC26 Enhance RAW image processing with Core Image 요약

- Session: 305
- Title: Enhance RAW image processing with Core Image
- Source: https://developer.apple.com/videos/play/wwdc2026/305/
- Topic: Core Image, RAW 9, CIRAWFilter, Core ML, Apple Neural Engine, CIImageProcessor, Metal
- Chapters: Introduction, How Core Image supports RAW, The evolution of RAW support, RAW 9 overview, RAW 9 quality improvements, Enable and edit RAW 9 with CIRAWFilter API, RAW 9 performance overview, Interactive editing, Exporting to other formats, New CIImageProcessor features

---

## 한 줄 요약

RAW 9은 Core Image의 RAW 처리 파이프라인을 **tiled Core ML 기반 demosaic+denoise 모델**로 크게 개선해 선명도·색 정확도·고감도 노이즈 복원을 높이고, `CIRAWFilter`에서 명시적으로 opt-in할 수 있으며, 인터랙티브 편집에서는 intermediate cache를 적극 활용하고 대량 export에서는 cache를 끄는 식으로 workload에 맞는 `CIContext` 전략을 선택해야 한다.

---

## 핵심 요약

이번 세션은 Core Image의 RAW 처리 업데이트를 네 영역으로 설명한다.

- **RAW 9 품질**
  - Demosaic와 denoise를 하나의 tiled Core ML model로 처리
  - Apple Neural Engine에서 on-device 실행
  - 저노이즈 이미지의 fine detail과 text sharpness 향상
  - 고 ISO 이미지의 luma/chroma noise 복원 개선
  - 비표준 sensor pattern의 artifact 감소

- **RAW 9 활성화와 편집**
  - `CIRAWFilter`로 RAW 로드
  - `supportedDecoderVersions`에서 `.version9` 지원 여부 확인
  - `decoderVersion = .version9`로 opt-in
  - `supportedCameraModels` class method로 지원 모델 조회
  - Exposure, luminance noise reduction, sharpness, contrast 등 calibrated controls 활용
  - RAW 9에서는 일부 기존 property가 더 이상 필요하지 않음

- **성능 전략**
  - Interactive editing
    - `scaleFactor`로 화면 크기에 맞춰 축소
    - View당 하나의 `CIContext`
    - `cacheIntermediates = true`
    - Extended Virtual Addressing entitlement로 더 큰 cache memory 활용 가능
    - Metal-backed view로 직접 렌더링
  - Batch export
    - `cacheIntermediates = false`
    - `memoryLimit`을 512MB 또는 1024MB로 높여 성능 개선 가능
    - `heifRepresentation` / `jpegRepresentation` 사용으로 추가 메모리 절감

- **새 `CIImageProcessor` 기능**
  - Explicit output tile sizes
  - Temporary `CVPixelBuffer`
  - Core Image가 scratch buffer 수명과 reuse를 관리

---

# 📷 RAW 처리 단계

RAW는 camera sensor의 원본 데이터에 가깝기 때문에 바로 표시할 수 없다.

```text
RAW File
   ↓
Metadata parsing
   ↓
Sensor value unpacking
   ↓
Demosaic
   ↓
Denoise
   ↓
Sharpen / Local contrast
   ↓
White balance
   ↓
Exposure / Color / Tone
   ↓
Displayable Image
```

Sensor mosaic의 각 위치에는 red, green, blue 중 하나의 값만 있기 때문에 demosaic 단계에서 각 pixel의 RGB 값을 복원한다.

그 다음 photon noise, read noise, thermal noise를 줄이고 convolution 기반 sharpening과 local contrast를 적용한다.

마지막으로 white balance, exposure, color, tone을 조정한다.

이 algorithm들은 iOS, iPadOS, macOS, visionOS에 내장되어 있어 Finder, Preview, Freeform 같은 system app과 Image IO를 사용하는 앱이 RAW를 지원한다.

---

# 🎛️ `CIRAWFilter`

고급 RAW editing을 제공하려면 `CIRAWFilter`를 사용한다.

세션에서 언급한 사용 앱:

- Photos
- Pixelmator Pro
- Nitro
- Acorn

Apple RAW pipeline은 2006년 21개 camera model에서 시작해 이번 세션 기준 784개 모델까지 확대됐다.

RAW의 장점은 과거에 촬영한 사진도 새로운 decoder와 algorithm으로 다시 처리할 수 있다는 점이다.

---

# 🚀 RAW 9

RAW 9은 Apple이 지금까지 만든 RAW pipeline 중 가장 큰 업데이트로 소개된다.

핵심 구조:

```text
Demosaic
    +
Denoise
    ↓
Tiled Core ML Model
    ↓
Apple Neural Engine
```

Core ML model은 image를 tile 단위로 처리하고 Apple Neural Engine에서 실행된다.

---

# 🔎 품질 개선 사례

## Sony Alpha 7 II

저노이즈 이미지에서도 RAW 9은 다음을 개선한다.

- Edge sharpness
- Fine detail
- 작은 text legibility

## Canon 5D Mark III / ISO 51,200

심한 luma/chroma noise가 있는 image에서 RAW 9은 다음을 개선한다.

- Color accuracy
- Color separation
- Fine detail
- Specular highlight visibility

## Fujifilm X-T5 / ISO 12,800

Non-traditional sensor pattern에서도:

- Color artifact 감소
- 작은 text 가독성 향상
- Yarn texture 보존 향상

---

# ✅ RAW 9 활성화

RAW 9은 default가 아니다.

먼저 지원 여부를 확인해야 한다.

```swift
let rawFilter = CIRAWFilter(imageURL: url)

if rawFilter.supportedDecoderVersions.contains(.version9) {
    rawFilter.decoderVersion = .version9
}
```

지원 camera model 목록은 새 `supportedCameraModels` class method로 확인할 수 있다.

세션은 iOS, iPadOS, macOS, visionOS 27에서 주요 전문 camera vendor를 포함한 수백 개 모델이 RAW 9을 지원한다고 설명한다.

이 목록은 OS의 over-the-air update로 계속 늘어날 수 있다.

DNG를 native로 촬영하는 camera, 예를 들어 Apple iPhone도 RAW 9을 자동 지원한다.

---

# 🎚️ 주요 Editing Property

`CIRAWFilter`에는 현재 20개의 calibrated adjustable property가 있다.

세션이 강조한 핵심 control:

- `exposure`
- `luminanceNoiseReductionAmount`
- `sharpnessAmount`
- `contrastAmount`

RAW 9에서 더 이상 의미가 없는 항목:

- `colorNoiseReductionAmount`: Core ML model이 color noise reduction을 자동 처리하므로 효과 없음
- `detailAmount`: 더 이상 필요하지 않고 지원되지 않음
- `moireReductionAmount`: 더 이상 필요하지 않고 지원되지 않음

Filter instance에서 property support를 확인해야 한다.

---

# ⚡ RAW 9 성능 특성

RAW 9은 이전 버전보다 compute와 resource 사용량이 크다.

Core ML model을 한 image에서 수백 번 실행할 수 있다.

그럼에도 editing slider를 움직일 때 responsive한 이유는 Core Image가 intermediate result를 cache하기 때문이다.

Apple은 workload를 두 가지로 나눠 최적화할 것을 권장한다.

---

# 🎛️ Interactive Editing

특징:

```text
RAW 1개
×
여러 번 render
×
Screen resolution
```

예:
- Exposure slider
- Sharpness slider
- Noise reduction 조절

권장 사항:

## `scaleFactor`

화면 크기보다 훨씬 큰 RAW를 full resolution으로 처리하지 않는다.

`CIRAWFilter.scaleFactor`를 사용해 preview resolution으로 줄인다.

## View당 하나의 `CIContext`

같은 view가 반복 rendering하는 동안 context를 재사용한다.

## `cacheIntermediates = true`

```swift
let context = CIContext(
    options: [
        .cacheIntermediates: true
    ]
)
```

비싼 Core ML demosaic/denoise 결과를 재활용할 수 있다.

## Extended Virtual Addressing Entitlement

더 많은 memory를 cache에 사용할 수 있게 해 반복 render 성능을 높일 수 있다.

## Metal-backed View

`MTKView` 같은 Metal-backed view에 직접 render하면 다음 frame 작업을 앞선 frame과 overlap할 수 있다.

---

# 📤 Exporting

특징:

```text
RAW 여러 개
×
각각 1번
×
Full resolution
```

예:
- HEIF export
- JPEG export
- Batch conversion

권장 사항:

## `cacheIntermediates = false`

```swift
let exportContext = CIContext(
    options: [
        .cacheIntermediates: false
    ]
)
```

한 번만 render하는 image의 intermediate cache를 유지할 필요가 적다.

## `memoryLimit`

iOS 기본값은 보수적인 256MB다.

세션은 512MB 또는 1024MB로 높이면 성능이 크게 좋아질 수 있다고 설명한다.

```swift
let exportCtx = CIContext(
    options: [
        .cacheIntermediates: false,
        .memoryLimit: 512
    ]
)
```

## Core Image Representation API

Image IO를 직접 호출하는 대신 다음을 사용하면 추가 memory saving을 얻을 수 있다.

- `heifRepresentation`
- `jpegRepresentation`

---

# 🧩 Interactive와 Export 비교

| 항목 | Interactive Editing | Batch Export |
|---|---|---|
| RAW 개수 | 보통 1개 | 여러 개 |
| Render 횟수 | 같은 RAW 반복 | 각 RAW 보통 1회 |
| Resolution | Screen size | Full resolution |
| `scaleFactor` | 적극 활용 | 일반적으로 full scale |
| `cacheIntermediates` | `true` | `false` |
| Context | View와 함께 재사용 | Export 작업용 |
| Memory | Cache reuse에 투자 | Per-export memory 확보 |
| Output | Metal-backed view | HEIF / JPEG |

---

# 🧩 RAW 9과 `CIImageProcessor`

RAW 9은 Core ML과 여러 Core Image kernel을 함께 사용하기 때문에 `CIImageProcessor`를 사용한다.

이 작업 과정에서 Core Image team은 두 기능을 추가했다.

1. Explicit output tile sizes
2. Temporary buffers

---

# 📐 Explicit Output Tile Sizes

기존 `CIImageProcessorKernel`은 ROI와 process callback에서 `input.region`, `output.region`을 고려해야 한다.

Memory가 충분하면 Core Image가 전체 image를 한 번에 줄 수 있고, memory가 부족하면 작은 region으로 여러 번 callback할 수 있다.

새 API는 processor가 output tile을 직접 결정하게 한다.

세션은 512×512 tile 예제를 보여준다.

```swift
let extent = inImg.extent
let tileSize = 512.0
var tiles: [CIVector] = []

for y in stride(
    from: extent.minY,
    to: extent.maxY,
    by: tileSize
) {
    for x in stride(
        from: extent.minX,
        to: extent.maxX,
        by: tileSize
    ) {
        let tile = CGRect(
            x: x,
            y: y,
            width: min(
                tileSize,
                extent.maxX - x
            ),
            height: min(
                tileSize,
                extent.maxY - y
            )
        )

        tiles.append(CIVector(cgRect: tile))
    }
}
```

그리고 다음처럼 적용한다.

```swift
let result = try MyProcessor.apply(
    withTiledExtent: tiles,
    inputs: [inImg],
    arguments: [:]
)
```

Fixed-size Core ML model input이나 특정 GPU kernel geometry에 맞춰 tile 크기를 통제할 수 있다.

---

# 🧠 Temporary Buffer

Core Image의 interleaved image buffer를 Core ML용 planar data로 변환하는 등의 작업에서는 scratch buffer가 필요할 수 있다.

Tile callback마다 temporary buffer를 생성·삭제하면 allocation 비용이 커진다.

새 `CIImageProcessorOutput` API를 사용한다.

```swift
guard let scratch =
    output.temporaryPixelBuffer(
        identifier: "myScratch",
        format: kCVPixelFormatType_64RGBAHalf,
        width: Int(output.region.width),
        height: Int(output.region.height),
        pixelBufferAttributes: nil
    )
else {
    return
}
```

처리 흐름:

```text
Input CVPixelBuffer
      ↓
Temporary PixelBuffer
      ↓
In-place Processing
      ↓
Output CVPixelBuffer
```

Core Image가 temporary buffer를 적절한 시점에 release하고 다음 tile callback에서 recycle한다.

Identifier는 processor가 여러 scratch buffer를 사용할 때 각각을 구분하기 위해 중요하다.

---

# 📋 체크리스트

## RAW 9 활성화

- [ ] `CIRAWFilter`로 RAW 로드
- [ ] `supportedDecoderVersions` 확인
- [ ] `.version9` 지원 시에만 opt-in
- [ ] `decoderVersion = .version9`
- [ ] 미지원 camera fallback 유지
- [ ] `supportedCameraModels` 활용 검토
- [ ] OTA update로 지원 camera가 늘어날 수 있음을 고려
- [ ] DNG / Apple ProRAW 테스트

## Editing Controls

- [ ] Exposure 제공 검토
- [ ] `luminanceNoiseReductionAmount` 제공 검토
- [ ] `sharpnessAmount` 제공 검토
- [ ] `contrastAmount` 제공 검토
- [ ] RAW 9에서 `colorNoiseReductionAmount`를 사용하지 않기
- [ ] `detailAmount`를 RAW 9에서 사용하지 않기
- [ ] `moireReductionAmount`를 RAW 9에서 사용하지 않기
- [ ] Runtime property support 확인

## Interactive Editing

- [ ] `scaleFactor`로 preview 해상도 최적화
- [ ] View당 하나의 `CIContext`
- [ ] `cacheIntermediates = true`
- [ ] Context 재사용
- [ ] Extended Virtual Addressing entitlement 검토
- [ ] Cache memory 측정
- [ ] Metal-backed view 직접 rendering 검토
- [ ] Slider interaction frame time 측정

## Export

- [ ] Export 전용 `CIContext` 검토
- [ ] `cacheIntermediates = false`
- [ ] iOS 기본 256MB memory limit이 충분한지 측정
- [ ] 512MB / 1024MB 검토
- [ ] `heifRepresentation` 활용
- [ ] `jpegRepresentation` 활용
- [ ] Batch throughput 측정

## CIImageProcessor

- [ ] ROI callback 정확히 구현
- [ ] `input.region` / `output.region` 고려
- [ ] Whole-image callback을 가정하지 않기
- [ ] 적절한 tile size 정의
- [ ] Edge tile 처리
- [ ] `apply(withTiledExtent:)` 사용 검토

## Temporary Buffer

- [ ] Scratch allocation 비용 측정
- [ ] `temporaryPixelBuffer` 사용
- [ ] Buffer마다 안정적인 identifier 부여
- [ ] 적절한 pixel format 선택
- [ ] Output region 크기에 맞는 buffer dimension
- [ ] Core Image lifecycle 관리 활용

---

# ⚠️ 구현 시 주의할 점

## RAW 9은 자동 활성화가 아니다

OS가 지원하더라도 앱이 `decoderVersion`을 명시적으로 설정해야 한다.

## RAW 9은 더 무겁다

품질 향상은 더 높은 compute와 memory 사용을 동반한다.

## Interactive와 Export의 Cache 전략은 반대다

반복 편집은 cache가 중요하고, 일회성 full-resolution export는 cache를 끄는 것이 좋다.

## 모든 기존 `CIRAWFilter` Property가 RAW 9에서 유효하지 않다

Runtime support 확인이 필요하다.

## `CIImageProcessor`는 tile-aware해야 한다

Memory 상황에 따라 작은 output region으로 여러 번 호출될 수 있다.

---

# 🧩 주요 API 정리

| API / Property | 역할 |
|---|---|
| `CIRAWFilter` | RAW decoding과 editing |
| `supportedDecoderVersions` | 지원 decoder version 확인 |
| `decoderVersion` | RAW decoder version 설정 |
| `supportedCameraModels` | 지원 camera model 목록 |
| `scaleFactor` | Preview 처리 해상도 축소 |
| `exposure` | 밝기 |
| `luminanceNoiseReductionAmount` | Luma noise reduction |
| `sharpnessAmount` | Edge sharpening |
| `contrastAmount` | Local contrast |
| `CIContext.cacheIntermediates` | Intermediate cache 제어 |
| `CIContext.memoryLimit` | Context memory budget |
| `heifRepresentation` | HEIF export |
| `jpegRepresentation` | JPEG export |
| `CIImageProcessorKernel` | Custom processor |
| `apply(withTiledExtent:)` | Explicit output tile |
| `temporaryPixelBuffer` | Core Image-managed scratch buffer |

---

# 핵심 메시지

RAW 9의 핵심은 RAW processing pipeline 자체가 바뀌었다는 점이다.

Demosaic와 denoise를 tiled Core ML model로 결합하고 Apple Neural Engine에서 실행하면서, 오래된 RAW 파일도 최신 algorithm으로 다시 처리해 더 선명한 detail, 더 정확한 color, 더 나은 high-ISO noise recovery를 얻을 수 있다.

개발자는 `CIRAWFilter`에서 몇 줄의 코드로 RAW 9을 opt-in할 수 있지만 workload를 구분해 성능을 최적화해야 한다.

**Interactive editing은 intermediate cache를 재사용하고 preview resolution을 줄이는 방향**, **batch export는 cache를 끄고 full-resolution 작업에 memory를 집중하는 방향**이 적합하다.

또 `CIImageProcessor`의 explicit tiling과 temporary buffer API는 Core ML이나 custom image algorithm을 Core Image pipeline에 통합할 때 memory와 allocation cost를 더 정교하게 제어하게 한다.

---

# 함께 보면 좋은 세션과 자료

- Capture and process ProRAW images — WWDC21
- Display EDR content with Core Image, Metal, and SwiftUI — WWDC22
- Extended Virtual Addressing Entitlement
