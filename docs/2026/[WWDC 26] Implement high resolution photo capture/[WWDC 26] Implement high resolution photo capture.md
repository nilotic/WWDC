# WWDC26 Implement high resolution photo capture 요약

- Session: 304
- Title: Implement high resolution photo capture
- Source: https://developer.apple.com/videos/play/wwdc2026/304/
- Topic: AVFoundation, AVCaptureSession, AVCapturePhotoOutput, 24MP, 48MP, RAW, ProRAW, Responsive Capture, Deferred Photo Processing
- Chapters: Introduction, High-resolution photos, Types of captures, Configure a capture session, Responsive capture best practices

---

## 한 줄 요약

고해상도 사진 촬영은 단순히 `maxPhotoDimensions`를 크게 설정하는 문제가 아니라, **12/24/48MP마다 다른 센서·컴퓨테이셔널 포토그래피 경로와 `photoQualityPrioritization` 제약을 이해하고**, 세션 구성 단계에서 필요한 리소스를 미리 준비한 뒤 `responsiveCapture`, deferred photo processing, fast capture prioritization을 함께 사용해 **화질과 shot-to-shot responsiveness의 균형**을 설계하는 문제다.

---

## 핵심 요약

이번 세션은 AVFoundation으로 iPhone의 고해상도 사진을 촬영할 때 필요한 전체 의사결정 흐름을 설명한다.

- **12MP**
  - 일반적인 고해상도 사진의 기본 범주
  - `.speed`, `.balanced`, `.quality` 모두 지원
  - 가장 폭넓은 prioritization 선택 가능

- **24MP**
  - iPhone 15부터 지원
  - 12MP multi-frame fused HDR 이미지와 full-sensor 48MP 이미지를 Photonic Engine이 결합
  - 12MP 대비 약 2배 해상도이면서 파일 크기는 약 50% 증가
  - multi-frame fused capture이므로 `.quality` 필요

- **48MP**
  - iPhone 14 Pro / 14 Pro Max의 48MP Quad sensor부터 시작
  - full sensor resolution의 single-frame capture
  - 12MP 대비 4배 해상도
  - `.balanced` 또는 `.quality`에서 가능

- **18MP**
  - 세션 기준 iPhone 17 Center Stage front camera에서 제공
  - multi-frame fused capture
  - `.quality` 필요

- **고해상도 capture type 네 가지**
  - Fully processed photo
  - Exposure brackets
  - Bayer RAW
  - Apple ProRAW

- **세션 구성 핵심**
  - 반드시 `AVCaptureSession.Preset.photo`
  - `AVCapturePhotoOutput.maxPhotoQualityPrioritization`을 먼저 결정
  - `device.activeFormat.supportedMaxPhotoDimensions`에서 지원 크기 확인
  - `photoOutput.maxPhotoDimensions`를 session commit 전에 설정
  - 실제 촬영마다 `AVCapturePhotoSettings.maxPhotoDimensions`와 `photoQualityPrioritization` 설정

- **중요한 특성**
  - `maxPhotoDimensions`는 요청이지 보장이 아님
  - 실제 크기는 장면, 조도, 처리 리소스에 따라 시스템이 결정
  - 실제 결과는 `AVCaptureResolvedSettings`에서 확인

- **리소스 사전 준비**
  - `setPreparedPhotoSettingsArray` 사용
  - 48MP 같은 모드를 활성화하는 순간 미리 준비
  - prepare용 `AVCapturePhotoSettings`는 실제 capture에 재사용하면 안 됨
  - 실제 촬영용 새 settings를 만들되 configuration은 일치시켜야 함

- **반응성 향상**
  - Responsive Capture: 이전 사진의 processing이 끝나기 전에 다음 capture 시작 가능
  - Deferred Processing: 빠른 proxy를 먼저 전달하고 최종 처리는 나중에 수행
  - Fast Capture Prioritization: 연속 촬영을 감지하면 quality → balanced로 동적으로 조정
  - iOS 27의 iPhone 16/17에서는 balanced fast capture도 deferred processing으로 후처리 가능

---

# 📸 왜 고해상도 사진이 필요한가

카메라 preview stream은 화면에 표시하기에 적합한 screen-resolution image다.

하지만 실제 사진 기능에서는 다음이 필요하다.

- 더 많은 fine detail
- 낮은 noise
- Crop 후에도 남는 해상도
- Zoom-in 시 detail 유지
- Image analysis를 위한 더 높은 pixel density

따라서 preview frame과 final photo capture는 목적이 다르다.

```text
Preview Stream
→ 화면 표시용
→ 낮은 지연이 중요

Photo Capture
→ 저장 / 편집 / 분석용
→ 더 높은 해상도와 품질이 중요
```

---

# 🧩 iPhone의 12MP, 24MP, 48MP 차이

## 12MP

일반적인 고해상도 photo capture의 기준이 되는 해상도다.

12MP는 세 가지 quality prioritization에서 모두 사용할 수 있다.

```text
.speed
.balanced
.quality
```

즉 빠른 전달이 필요한 앱부터 최대 품질을 중시하는 앱까지 가장 유연하게 사용할 수 있다.

---

# 🟦 48MP: Full Sensor Single-frame Capture

iPhone 14 Pro와 iPhone 14 Pro Max부터 48MP Quad sensor가 도입됐다.

Quad-pixel sensor는 두 가지 방식으로 사용할 수 있다.

```text
Full Resolution
→ 각 sensor pixel을 최대한 활용
→ 48MP
→ 최대 detail

2 × 2 Pixel Grouping
→ 같은 color의 4개 pixel을 묶음
→ 더 많은 light 확보
→ 낮은 noise / HDR에 유리
```

세션의 중요한 포인트는 **48MP가 single-frame capture**라는 점이다.

```text
Sensor Full Resolution
      ↓
Single Frame
      ↓
48MP Image
```

따라서 24MP의 multi-frame fusion과 처리 특성이 다르다.

48MP는 standard 12MP 대비 4배의 pixel count를 가지며, 먼 곳의 바위나 산의 표면 패턴 같은 미세 detail을 더 잘 유지한다.

---

# 🟩 24MP: Multi-frame HDR + 48MP Detail Fusion

iPhone 15부터 24MP capture가 지원된다.

24MP는 단순히 sensor를 24MP로 읽는 방식이 아니다.

처리 과정은 개념적으로 다음과 같다.

```text
Quad Sensor
   │
   ├─ Pixel grouping
   │     ↓
   │   12MP multi-frame fused HDR
   │
   └─ Full sensor resolution
         ↓
       48MP high-detail image

        두 결과
          ↓
     Photonic Engine
          ↓
        24MP
```

즉 24MP는 다음 두 장점을 동시에 노린다.

- 12MP multi-frame fusion의 dynamic range와 light gathering
- 48MP full-sensor capture의 fine detail

Apple이 세션에서 제시한 특징:

```text
12MP 대비
해상도 ≈ 2배
파일 크기 증가 ≈ 50%
```

따라서 저장·공유 부담을 48MP보다 낮게 유지하면서 detail을 크게 높이는 compromise다.

iPhone 15부터 Camera 앱의 기본 capture mode도 24MP다.

---

# 📱 Camera별 24MP / 48MP 확장

세션에서 언급한 확대 흐름:

- iPhone 14 Pro / Pro Max
  - Main camera에 48MP Quad sensor
- iPhone 15
  - 24MP photo support
- iPhone 16 Pro
  - Telephoto camera로 24/48MP 계열 고해상도 지원 확대
- iPhone 17
  - Ultra Wide camera까지 고해상도 지원 확대

즉 고해상도 capture는 Main camera에만 국한되지 않고 camera system 전체로 확장되고 있다.

---

# 🎞️ 고해상도 Capture의 네 가지 유형

AVFoundation으로 요청할 수 있는 고해상도 capture는 크게 네 종류다.

---

# 🖼️ Fully Processed Photo

가장 일반적인 capture 방식이다.

```text
Multiple Frames
      ↓
Fusion
      ↓
Photonic Engine
      ↓
Extended Dynamic Range
+ Fine Detail
```

장점:

- 사용자가 바로 볼 수 있는 완성된 image
- Computational photography의 이점
- HDR과 detail 개선

일반 camera 앱에서 가장 흔히 선택하는 방식이다.

---

# 🌗 Exposure Brackets

같은 장면을 여러 exposure로 촬영한다.

```text
Underexposed
Normal
Overexposed
      ↓
App-side Selection / HDR Processing
```

적합한 용도:

- 직접 HDR 합성
- 여러 exposure 중 선택
- 특수 imaging workflow

---

# 🧪 Bayer RAW

Sensor의 minimally processed data에 가까운 결과를 제공한다.

적합:

- Professional post-processing
- Custom demosaic / color processing
- 최대한 많은 sensor 정보를 직접 활용

장점은 편집 자유도이고, 완성된 JPEG/HEIF 같은 결과를 즉시 얻는 방식과는 목적이 다르다.

---

# 🍎 Apple ProRAW

ProRAW는 RAW의 편집 자유도와 iPhone computational photography를 결합한다.

편집할 때 다음을 더 유연하게 조절할 수 있다.

- Exposure
- Color
- Detail

즉 Bayer RAW와 fully processed photo 사이의 다른 tradeoff를 제공한다.

---

# ⚙️ AVCaptureSession 구성

고해상도 capture를 사용하려면 먼저 `AVCaptureSession`을 구성한다.

가장 중요한 제약:

> 24MP와 48MP를 지원하는 preset은 `.photo`다.

```swift
let session = AVCaptureSession()

session.beginConfiguration()
session.sessionPreset = .photo
```

다른 session preset을 사용하면 24MP/48MP capture를 사용할 수 없다.

---

# 🎚️ `maxPhotoQualityPrioritization`

`AVCapturePhotoOutput`에서 session이 준비해야 할 최대 quality prioritization을 지정한다.

```swift
photoOutput.maxPhotoQualityPrioritization = .quality
```

세 가지 level:

## `.speed`

- 가장 빠른 delivery
- 최소 processing
- 품질 향상을 위한 긴 processing을 줄임

## `.balanced`

- 중간 delivery speed
- 일반적인 경우에 좋은 품질

## `.quality`

- 가장 긴 processing time
- 가장 높은 image quality

`maxPhotoQualityPrioritization = .quality`로 설정하면 session은 speed, balanced, quality 세 수준 모두에 필요한 resource를 준비할 수 있다.

---

# 📐 지원 가능한 최대 Photo Dimension 확인

iOS 16부터 현재 active format에서 지원하는 최대 photo dimension 목록을 확인할 수 있다.

```swift
let dimensions = device.activeFormat.supportedMaxPhotoDimensions
```

세션 예제에서는 가장 큰 dimension을 선택하지만 실제 앱에서는 use case에 맞춰 고른다.

개념적으로:

```swift
let largest = dimensions.max {
    Int($0.width) * Int($0.height)
        < Int($1.width) * Int($1.height)
}
```

그 다음 `AVCapturePhotoOutput`에 설정한다.

```swift
photoOutput.maxPhotoDimensions = largestDimension
```

---

# ⛔ Session Commit 전에 설정 완료

세션이 강조하는 성능 포인트 중 하나다.

```text
beginConfiguration
      ↓
Preset
Photo Output
Quality Prioritization
Max Photo Dimensions
      ↓
commitConfiguration
```

`commitConfiguration()` 이후에 이러한 pipeline-level setting을 변경하면 긴 pipeline reconfiguration이 발생할 수 있다.

따라서 가능한 한 session configuration 단계에서 미리 결정한다.

---

# 📷 촬영마다 `AVCapturePhotoSettings` 설정

Session은 지원 가능한 전체 범위를 준비하고, 실제 capture에서는 그 안에서 개별 요청을 지정한다.

```swift
let settings = AVCapturePhotoSettings()
settings.maxPhotoDimensions = selectedDimensions
settings.photoQualityPrioritization = .quality

photoOutput.capturePhoto(
    with: settings,
    delegate: delegate
)
```

이 구조 덕분에 같은 session 안에서 서로 다른 resolution과 quality를 사용할 수 있다.

예:

```text
Capture 1
12MP + speed

Capture 2
48MP + balanced

Capture 3
24MP + quality
```

매번 session을 다시 구성할 필요가 없다.

---

# ⚠️ `maxPhotoDimensions`는 요청이지 보장이 아니다

매우 중요한 API semantics다.

앱이 48MP를 요청했다고 항상 48MP가 전달되는 것은 아니다.

시스템은 다음을 고려한다.

- Light level
- Scene
- Available processing resources
- 현재 camera configuration

그리고 가능한 최적의 path를 선택한다.

실제 capture 결과의 dimension은 `AVCaptureResolvedSettings`에서 확인한다.

```text
Requested Settings
       ↓
System Decision
       ↓
Resolved Settings
```

따라서 앱의 UI와 후속 processing은 요청값이 아니라 resolved result를 기준으로 해야 한다.

---

# 🧠 고해상도 Capture는 리소스를 미리 준비해야 한다

고해상도 capture에는 resolution과 prioritization 조합에 맞는 resource allocation이 필요하다.

미리 allocation하지 않으면 shutter를 누른 순간 resource를 준비하게 되어 capture latency가 증가할 수 있다.

해결책:

```text
setPreparedPhotoSettingsArray
```

---

# 🚀 `setPreparedPhotoSettingsArray`

앱이 앞으로 사용할 capture configuration을 미리 시스템에 알려준다.

예를 들어 사용자가 48MP mode를 켰다면 그 순간부터 resource를 준비한다.

```swift
let prepareSettings = AVCapturePhotoSettings()
prepareSettings.maxPhotoDimensions = photoOutput.maxPhotoDimensions
prepareSettings.photoQualityPrioritization = .quality

photoOutput.setPreparedPhotoSettingsArray(
    [prepareSettings]
) { prepared, error in
    // 준비 결과 처리
}
```

---

# ⚠️ Prepared Settings를 실제 Capture에 재사용하지 않는다

세션이 명시적으로 강조하는 부분이다.

```text
prepareSettings
→ resource preparation 전용

captureSettings
→ 실제 capture용 새 객체
```

실제 capture 시에는 새 `AVCapturePhotoSettings`를 만든다.

```swift
let captureSettings = AVCapturePhotoSettings()
captureSettings.maxPhotoDimensions = photoOutput.maxPhotoDimensions
captureSettings.photoQualityPrioritization = .quality

photoOutput.capturePhoto(
    with: captureSettings,
    delegate: self
)
```

단, configuration은 prepared settings와 맞춰야 preallocation 이점을 얻는다.

---

# 🕒 고해상도 처리에는 수 초가 걸릴 수 있다

고해상도 capture는 수많은 pixel을 처리한다.

특히:

- Multi-frame fusion
- Photonic Engine
- High-quality denoise
- HDR
- High-resolution detail reconstruction

등이 결합되면 processing에 몇 초가 걸릴 수 있다.

문제는 단순히 한 사진의 처리 시간이 아니라 **다음 사진을 언제 찍을 수 있는가**다.

---

# ⏱️ Capture Stage와 Processing Stage

사진 요청은 크게 두 단계로 나뉜다.

```text
Shutter Request
      ↓
Capture Stage
      ↓
Processing Stage
      ↓
Final Photo
```

`AVCapturePhotoCaptureDelegate`는 진행 과정에서 callback을 받는다.

대표적으로:

- `didCapturePhotoFor`
- `didFinishCaptureFor`

이를 이용해 shutter UI나 progress 상태를 업데이트할 수 있다.

---

# 📊 Resolution × Quality Prioritization 관계

세션의 핵심 compatibility를 표로 정리하면 다음과 같다.

| Resolution | Capture 특성 | `.speed` | `.balanced` | `.quality` |
|---|---|---:|---:|---:|
| 12MP | 일반 photo | ✅ | ✅ | ✅ |
| 18MP | Multi-frame fused, Center Stage front camera | ❌ | ❌ | ✅ |
| 24MP | Multi-frame fused | ❌ | ❌ | ✅ |
| 48MP | Single-frame full sensor | ❌ | ✅ | ✅ |

이 차이는 implementation에서 매우 중요하다.

예를 들어 24MP를 요청하면서 `.balanced`를 사용하도록 설계하면 기대한 path가 성립하지 않는다.

---

# 📱 18MP

세션에서 18MP는 iPhone 17의 Center Stage front camera 전용 high-resolution mode로 소개된다.

특성:

- Multi-frame fused
- Processing time이 길 수 있음
- `.quality` prioritization만 지원

Center Stage front camera에 대한 자세한 내용은 별도 WWDC26 세션에서 다룬다.

---

# ⏳ `photoProcessingTimeRange`

`AVCaptureResolvedSettings.photoProcessingTimeRange`를 통해 capture 결과가 delegate에 전달되기까지 예상 processing 시간을 알 수 있다.

```text
Capture 요청
      ↓
Resolved Settings
      ↓
photoProcessingTimeRange
      ↓
UI에서 예상 처리 시간 활용 가능
```

고해상도 camera UI에서 shutter feedback이나 progress indicator를 설계할 때 유용하다.

---

# 🥱 기본 Shot-to-shot Delay

Responsive capture를 사용하지 않는 기본 구조에서는 다음 사진을 찍으려면 이전 사진 processing이 끝나야 한다.

```text
Photo 1 Capture
      ↓
Photo 1 Processing
      ↓
Photo 1 Complete
      ↓
Photo 2 Capture
```

이 대기 시간이 **shot-to-shot delay**다.

고해상도 + quality capture에서는 이 delay가 길어질 수 있다.

---

# ⚡ Responsive Capture

`AVCapturePhotoOutput`에서 responsive capture를 활성화하면 capture와 processing을 겹칠 수 있다.

```text
Photo 1 Capture
      ↓
Photo 1 Processing ──────────┐
                            │
Photo 2 Capture ─────────────┘
```

핵심:

> 이전 사진의 processing이 끝날 때까지 기다릴 필요가 없고, **capture stage가 끝나면 다음 capture를 시작할 수 있다.**

---

# 🚦 `captureReadiness`

다음 사진을 언제 촬영할 수 있는지 확인하려면 `AVCapturePhotoOutput.captureReadiness`를 관찰한다.

UI에서는 이 상태를 이용해 shutter button을 활성화하거나 capture 요청을 조절할 수 있다.

```text
captureReadiness
      ↓
Ready?
├─ Yes → shutter enabled
└─ No  → 잠시 제한
```

Responsive Capture는 shot-to-shot delay를 줄이지만 **각 사진 자체의 processing duration을 줄이지는 않는다.**

---

# 💤 Deferred Photo Processing

더 큰 개선은 deferred photo processing에서 나온다.

기본 processing:

```text
Capture
   ↓
Full Processing
   ↓
Final Photo
```

Deferred processing:

```text
Capture
   ↓
Light Processing
   ↓
Deferred Photo Proxy 즉시 전달
   ↓
Final Processing은 나중에
```

Proxy는 delegate callback으로 받을 수 있다.

```text
didFinishCapturingDeferredPhotoProxy
```

---

# 🗂️ Final Photo는 언제 처리되는가

Deferred processing의 최종 처리는 두 가지 방식으로 진행된다.

## On-demand

사용자가 Photo Library에서 최종 photo를 요청할 때 처리한다.

## Background

시스템이 유리한 조건이라고 판단할 때 처리한다.

예:

- Device가 idle
- Capture session의 immediate workload가 줄어든 시점

---

# 💾 왜 Deferred Processing이 중요한가

Deferred work는 capture session과 같은 순간에 memory를 공유하지 않도록 background에서 수행될 수 있다.

이 때문에 processing-heavy한 multi-frame fusion capture를 하면서도 다음 촬영을 빨리 받을 수 있다.

특히:

- 18MP
- 24MP

같은 multi-frame fused high-quality capture를 responsive하게 만드는 핵심이다.

---

# 📉 Deferred Processing이 줄이는 것

Deferred processing은 sensor exposure나 실제 capture stage를 줄이지 않는다.

줄이는 것은 **즉시 block되는 processing stage**다.

```text
Before
Capture ───── Processing ───────── Next Capture

Deferred
Capture ─ Proxy ─ Next Capture
          │
          └──── Background Final Processing
```

따라서 연속 촬영 경험이 크게 좋아진다.

---

# 🏎️ Fast Capture Prioritization

사용자가 빠르게 여러 장을 연속 촬영할 때 최우선 목표는 매 사진마다 최고 품질을 유지하는 것보다 순간을 놓치지 않는 것일 수 있다.

이를 위해 `AVCapturePhotoOutput`의 fast capture prioritization을 활성화한다.

동작:

```text
처음 Capture
→ Quality

빠른 연속 촬영 감지
→ Balanced로 동적 전환

연속 촬영 종료
→ 다시 품질 중심 path
```

Balanced capture는 capture와 processing 모두 더 짧은 시간이 필요하다.

---

# 🆕 iOS 27의 Fast Capture + Deferred Processing

세션 기준:

```text
iOS 27
+
iPhone 16 / iPhone 17
```

에서는 fast capture prioritization으로 발생한 balanced capture도 나중에 deferred processing을 이용해 처리할 수 있다.

즉 빠른 연속 촬영 상황에서 즉시 processing 시간을 더 줄이면서도 최종 품질 처리를 뒤로 미룰 수 있다.

---

# 🏀 Basketball Demo

Apple은 실제 연속 촬영 demo로 세 기능을 비교한다.

## 기능을 끈 경우

- Deferred Processing: Off
- Responsive Capture: Off
- Fast Capture Prioritization: Off

결과:

```text
Shutter
→ Processing 동안 button blocked
→ 한 장만 촬영
```

중요한 순간을 놓친다.

## 기능을 켠 경우

- Deferred Processing: On
- Responsive Capture: On
- Fast Capture Prioritization: On

Capture session은 처음에는 quality photo를 촬영한다.

사용자가 빠르게 shutter를 누르는 것이 감지되면 balanced capture로 전환한다.

결과:

```text
기존: 1장
개선: 5장
```

같은 순간에 훨씬 더 많은 candidate frame을 확보할 수 있다.

---

# 🧠 세 기능의 역할을 구분해야 한다

세 기능은 비슷해 보이지만 서로 다른 문제를 해결한다.

| 기능 | 해결하는 문제 | 핵심 동작 |
|---|---|---|
| Prepared Photo Settings | 첫 capture latency | 리소스를 미리 allocation |
| Responsive Capture | 이전 processing이 다음 capture를 막음 | capture와 processing overlap |
| Deferred Processing | immediate processing이 너무 오래 걸림 | proxy 먼저, final은 나중에 |
| Fast Capture Prioritization | 빠른 연사 중 quality processing이 병목 | quality → balanced 동적 조정 |

이들을 함께 사용해야 최상의 UX를 얻을 수 있다.

---

# 🔁 전체 고해상도 Capture Workflow

```text
1. AVCaptureSession.beginConfiguration()
        ↓
2. sessionPreset = .photo
        ↓
3. Camera Device / Active Format 선택
        ↓
4. supportedMaxPhotoDimensions 확인
        ↓
5. photoOutput.maxPhotoQualityPrioritization 설정
        ↓
6. photoOutput.maxPhotoDimensions 설정
        ↓
7. session.commitConfiguration()
        ↓
8. 필요 모드의 Prepared Settings 사전 등록
        ↓
9. Capture마다 새 AVCapturePhotoSettings 생성
        ↓
10. maxPhotoDimensions + photoQualityPrioritization 지정
        ↓
11. capturePhoto(with:delegate:)
        ↓
12. AVCaptureResolvedSettings로 실제 결과 확인
        ↓
13. Responsive / Deferred / Fast Capture로 연속 촬영 최적화
```

---

# 🧩 Recommended Architecture

## Session-level Configuration

세션 생성 시 바뀌기 어려운 큰 범위를 정의한다.

```text
Preset
Maximum supported quality
Maximum photo dimensions
Photo output capabilities
```

## Mode-level Preparation

사용자가 모드를 선택하는 시점에 필요한 resource를 준비한다.

```text
12MP Mode
24MP Mode
48MP Mode
RAW Mode
ProRAW Mode
```

각 모드에 맞는 prepared settings를 등록한다.

## Capture-level Settings

셔터를 누를 때 실제 요청값을 정의한다.

```text
Resolution
Quality prioritization
RAW / processed mode
Other per-shot settings
```

이렇게 세 계층으로 나누면 session reconfiguration을 최소화할 수 있다.

---

# 🎯 해상도 선택 기준

## 12MP를 선택할 때

적합:

- 빠른 capture
- 저장 공간 최소화
- 일반적인 social / sharing use case
- `.speed`가 필요한 상황

## 24MP를 선택할 때

적합:

- Detail과 file size 균형
- Crop 여유 필요
- Camera 앱 수준의 general photography
- Multi-frame fusion 품질이 중요

주의:

- `.quality` 필요
- Processing이 더 길다

## 48MP를 선택할 때

적합:

- 최대 fine detail
- 큰 crop
- Landscape
- 후처리
- Image analysis

주의:

- Memory / file size 증가
- Processing cost 증가
- `.balanced` 또는 `.quality`

---

# 🎚️ Quality Prioritization 선택 기준

## `.speed`

우선순위:

```text
Latency > Quality
```

적합:

- 빠른 shutter feedback
- 12MP
- Moment capture가 중요

## `.balanced`

우선순위:

```text
Latency ≈ Quality
```

적합:

- 일반적인 capture
- 48MP single-frame에서 responsiveness가 중요
- Fast Capture의 fallback/transition target

## `.quality`

우선순위:

```text
Quality > Latency
```

필수 또는 적합:

- 18MP
- 24MP
- 최고 품질 48MP
- Multi-frame fusion

---

# 📋 체크리스트

## Session Configuration

- [ ] `AVCaptureSession` 생성
- [ ] `beginConfiguration()` 사용
- [ ] `sessionPreset = .photo`
- [ ] Camera device 선택
- [ ] Active format 확인
- [ ] `supportedMaxPhotoDimensions` 읽기
- [ ] 앱 use case에 맞는 최대 dimension 선택
- [ ] `maxPhotoQualityPrioritization` 결정
- [ ] `photoOutput.maxPhotoDimensions` 설정
- [ ] 모든 설정 후 `commitConfiguration()`
- [ ] Commit 후 pipeline-level setting을 불필요하게 변경하지 않기

## Resolution Strategy

- [ ] 12MP / 24MP / 48MP 중 필요한 mode 정의
- [ ] Camera별 실제 지원 여부 runtime 확인
- [ ] 24MP가 multi-frame fused임을 고려
- [ ] 48MP가 single-frame capture임을 고려
- [ ] 18MP Center Stage front camera 필요 여부 검토
- [ ] UI에 unsupported mode를 숨기거나 비활성화

## Quality Prioritization

- [ ] 12MP: speed / balanced / quality 가능
- [ ] 24MP: quality 필요
- [ ] 48MP: balanced / quality 가능
- [ ] 18MP: quality 필요
- [ ] 앱 UX에 맞는 기본 prioritization 결정
- [ ] fast capture 상황의 dynamic downgrade 허용 여부 결정

## Per-shot Capture

- [ ] 새 `AVCapturePhotoSettings` 생성
- [ ] `maxPhotoDimensions` 설정
- [ ] `photoQualityPrioritization` 설정
- [ ] Capture delegate 지정
- [ ] `capturePhoto(with:delegate:)` 호출
- [ ] 요청값과 실제 result dimension이 다를 수 있음을 고려
- [ ] `AVCaptureResolvedSettings` 확인

## Prepared Photo Settings

- [ ] 고해상도 mode 진입 시 가능한 한 빨리 prepare
- [ ] `setPreparedPhotoSettingsArray` 사용
- [ ] Resolution과 prioritization 모두 일치시킴
- [ ] Prepare 완료 callback 처리
- [ ] Error 처리
- [ ] Prepare settings 객체를 실제 capture에 재사용하지 않기
- [ ] 실제 capture용 새 settings 생성
- [ ] Prepared configuration과 capture configuration 일치 확인

## Processing UX

- [ ] `didCapturePhotoFor` 활용
- [ ] `didFinishCaptureFor` 활용
- [ ] `photoProcessingTimeRange` 활용 검토
- [ ] Processing spinner가 shutter를 불필요하게 막지 않는지 확인
- [ ] Shot-to-shot delay 실제 기기에서 측정
- [ ] 12/24/48MP 별 processing time 측정

## Responsive Capture

- [ ] Responsive capture 활성화 검토
- [ ] `captureReadiness` 관찰
- [ ] Ready 상태에 따라 shutter enable/disable
- [ ] Capture와 processing overlap이 정상 동작하는지 확인
- [ ] 연속 capture에서 memory pressure 관찰

## Deferred Processing

- [ ] High-quality capture에서 deferred processing 활성화 검토
- [ ] `didFinishCapturingDeferredPhotoProxy` 처리
- [ ] Proxy를 UI에 즉시 표시할지 결정
- [ ] Final asset delivery workflow 확인
- [ ] Photo Library on-demand processing 동작 확인
- [ ] Background final processing 고려
- [ ] Deferred final image와 proxy 차이에 대한 UX 검토

## Fast Capture Prioritization

- [ ] Rapid shutter use case가 있는지 확인
- [ ] fast capture prioritization 활성화 검토
- [ ] Quality → balanced 전환을 UX가 허용하는지 확인
- [ ] iOS 27 / iPhone 16·17의 deferred balanced processing 활용 검토
- [ ] Burst-like 사용에서 실제 shot count 비교

## RAW / ProRAW

- [ ] Fully processed photo가 필요한지 확인
- [ ] Exposure bracket이 필요한지 확인
- [ ] Bayer RAW가 필요한지 확인
- [ ] ProRAW가 필요한지 확인
- [ ] RAW workflow의 storage / processing 비용 고려
- [ ] Post-processing pipeline 정의

## Device Testing

- [ ] iPhone 14 Pro 계열 48MP 확인
- [ ] iPhone 15 이상 24MP 확인
- [ ] iPhone 16 Pro Telephoto 지원 확인
- [ ] iPhone 17 Ultra Wide 지원 확인
- [ ] iPhone 17 Center Stage front camera 18MP 확인
- [ ] Low-light에서 resolved dimension 변화 테스트
- [ ] Thermal / memory pressure 상황 테스트
- [ ] Rapid capture stress test

---

# ⚠️ 구현 시 주의할 점

## 24MP와 48MP를 같은 방식으로 생각하지 않는다

24MP는 multi-frame fused image이고 48MP는 full-sensor single-frame capture다.

따라서 processing path와 prioritization 지원이 다르다.

---

## `maxPhotoDimensions`가 실제 결과를 보장하지 않는다

앱은 48MP를 요청할 수 있지만 시스템은 환경에 따라 다른 path를 선택할 수 있다.

후속 처리와 metadata 기록은 `AVCaptureResolvedSettings`를 기준으로 해야 한다.

---

## Session commit 이후 큰 설정 변경을 반복하지 않는다

`maxPhotoDimensions` 같은 설정을 commit 이후 바꾸면 pipeline reconfiguration이 길어질 수 있다.

앱의 전체 supported range는 session 구성 시 준비하고, per-shot 차이는 `AVCapturePhotoSettings`에서 조정하는 것이 좋다.

---

## Prepared Settings는 실제 Capture Settings가 아니다

Prepare object는 resource reservation을 위한 신호다.

실제 capture에는 새 settings object를 만든다.

---

## Responsive Capture가 Processing Time을 줄이는 것은 아니다

Responsive capture는 processing과 다음 capture를 겹치게 한다.

한 사진의 processing 자체가 빨라지는 것은 아니다.

---

## Deferred Processing은 Proxy와 Final Image가 구분된다

즉시 전달되는 것은 lightly processed proxy다.

최종 quality image는 나중에 처리된다.

앱 UI와 저장 workflow에서 이 차이를 명확하게 다뤄야 한다.

---

## Fast Capture는 Quality Tradeoff가 있다

연속 촬영 중 시스템이 quality에서 balanced로 바꿀 수 있다.

앱이 항상 최종 최고 품질만을 요구한다면 이 behavior가 적합한지 검토해야 한다.

---

# 🧩 주요 API 정리

| API / Property | 역할 |
|---|---|
| `AVCaptureSession` | Camera capture pipeline 구성 |
| `.photo` preset | 24MP / 48MP를 위한 필수 session preset |
| `AVCapturePhotoOutput` | Photo capture output |
| `maxPhotoQualityPrioritization` | Session이 준비할 최대 prioritization |
| `supportedMaxPhotoDimensions` | 현재 active format에서 지원 가능한 photo dimensions |
| `maxPhotoDimensions` | Output / per-shot 최대 dimension 요청 |
| `AVCapturePhotoSettings` | 각 capture의 설정 |
| `photoQualityPrioritization` | `.speed`, `.balanced`, `.quality` 선택 |
| `setPreparedPhotoSettingsArray` | 향후 capture resource 사전 준비 |
| `AVCaptureResolvedSettings` | 실제 capture에서 시스템이 선택한 설정 확인 |
| `photoProcessingTimeRange` | 예상 processing duration |
| `captureReadiness` | 다음 capture 가능 상태 |
| Responsive Capture | Capture와 processing overlap |
| Deferred Photo Processing | Proxy 먼저, final processing 나중에 |
| Fast Capture Prioritization | 빠른 연속 capture에서 quality → balanced 조정 |

---

# 🔁 화질 중심 Camera Mode 예

```text
User selects 24MP
      ↓
Check device support
      ↓
Prepared Settings
24MP + quality
      ↓
Resources preallocated
      ↓
Shutter
      ↓
New Capture Settings
24MP + quality
      ↓
Responsive Capture
      ↓
Deferred Proxy
      ↓
Next Shutter 가능
      ↓
Final Image background processing
```

---

# 🔁 48MP Detail Mode 예

```text
User selects 48MP
      ↓
Check supportedMaxPhotoDimensions
      ↓
Prepared Settings
48MP + balanced/quality
      ↓
Shutter
      ↓
Single-frame Full Sensor Capture
      ↓
Resolved Settings 확인
      ↓
48MP 또는 시스템이 선택한 실제 결과 처리
```

---

# 🔁 빠른 순간 포착 Mode 예

```text
Default Quality Capture
      ↓
Rapid Shutter Input 감지
      ↓
Fast Capture Prioritization
      ↓
Balanced Capture
      ↓
Responsive Capture로 overlap
      ↓
Deferred Processing으로 final work 뒤로 이동
      ↓
Shot-to-shot delay 최소화
```

---

# 🎯 설계 결론

고해상도 camera app을 설계할 때 먼저 결정해야 하는 것은 “최대 몇 MP를 지원할까?”가 아니다.

더 중요한 질문은 다음이다.

```text
사용자는 무엇을 우선하는가?

최대 Detail?
빠른 Shutter?
작은 File?
빠른 연속 촬영?
Professional Editing?
```

이 답에 따라 resolution과 processing strategy가 달라진다.

### 최대 detail

```text
48MP
+
Balanced 또는 Quality
```

### 일반적인 high-quality photo

```text
24MP
+
Quality
+
Deferred Processing
```

### 가장 빠른 capture

```text
12MP
+
Speed
```

### 순간을 놓치지 않는 고품질 camera UX

```text
High-quality mode
+
Prepared Settings
+
Responsive Capture
+
Deferred Processing
+
Fast Capture Prioritization
```

---

# 핵심 메시지

고해상도 capture의 핵심은 **resolution, quality, processing latency를 각각 독립적인 knob로 생각하지 않는 것**이다.

24MP와 48MP는 처리 방식 자체가 다르다.

24MP는 12MP multi-frame fused HDR과 48MP full-resolution detail을 Photonic Engine이 결합하는 방식이므로 품질은 뛰어나지만 processing 시간이 길고 `.quality` prioritization이 필요하다.

반면 48MP는 full-sensor single-frame capture이므로 `.balanced` 또는 `.quality`에서 사용할 수 있고, 최대 detail이 필요한 use case에 적합하다.

AVFoundation에서는 session 구성 시 `.photo` preset과 최대 prioritization, 최대 dimensions를 미리 설정하고, capture마다 `AVCapturePhotoSettings`에서 실제 resolution과 prioritization을 선택한다.

`maxPhotoDimensions`는 요청일 뿐 실제 결과를 보장하지 않으므로 `AVCaptureResolvedSettings`를 반드시 확인해야 한다.

또한 고해상도 capture가 느린 가장 큰 이유는 sensor capture 자체보다 **대량의 pixel processing과 multi-frame fusion**이다.

따라서 production camera app에서는 다음 네 가지를 함께 고려해야 한다.

```text
Prepared Settings
        +
Responsive Capture
        +
Deferred Processing
        +
Fast Capture Prioritization
```

Prepared settings는 shutter 순간의 resource allocation 비용을 줄이고, responsive capture는 이전 photo의 processing 중에도 다음 capture를 시작하게 하며, deferred processing은 final quality work를 뒤로 미뤄 shot-to-shot delay를 더 줄인다.

그리고 사용자가 연속으로 빠르게 촬영하면 fast capture prioritization이 quality capture를 balanced로 동적으로 전환해 순간을 놓치지 않게 한다.

세션의 basketball demo에서 이러한 기능을 모두 끈 경우 한 장밖에 찍지 못했지만, 활성화한 경우 같은 순간에 다섯 장을 촬영할 수 있었다.

결국 Apple이 제안하는 camera UX의 방향은 분명하다.

**평소에는 최고 화질을 제공하되, 사용자가 순간을 빠르게 포착하려 할 때는 시스템이 처리 경로를 유연하게 조정해 shutter responsiveness를 유지한다.**

---

# 함께 보면 좋은 세션과 자료

- Build a responsive camera app that launches quickly — WWDC26
- Support the Center Stage front camera in your iOS app — WWDC26
- Create a more responsive camera experience — WWDC23
- Capture and process ProRAW images — WWDC21
- Capture high-quality photos using video formats — WWDC21
- AVCam: Building a camera app
- Capturing photos in RAW and Apple ProRAW formats
