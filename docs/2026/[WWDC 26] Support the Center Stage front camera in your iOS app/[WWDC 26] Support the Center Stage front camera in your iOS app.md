# WWDC26 — Support the Center Stage front camera in your iOS app

- **Session:** 341
- **Title:** Support the Center Stage front camera in your iOS app
- **Source:** https://developer.apple.com/videos/play/wwdc2026/341/
- **Basis:** Apple Developer 공식 전체 transcript 및 Code 섹션
- **Framework:** AVFoundation
- **Platforms:** iOS 26+
- **Key devices:** iPhone 17, iPhone Air, iPhone 17 Pro

---

## 🎯 한 줄 요약

새 Center Stage 전면 카메라의 **정사각형 센서와 95° 시야각**을 활용하면, 기기를 돌리지 않고도 세로·가로 프레이밍을 바꿀 수 있다. 앱에서는 `AVCaptureDevice.dynamicAspectRatio`, `AVCaptureSmartFramingMonitor`, Center Stage API, sensor orientation compensation, low-latency stabilization을 조합해 사진·영상·영상 통화의 프레이밍을 시스템 수준으로 확장할 수 있다.

---

## 🧭 세션 구성

| 시간 | 내용 |
|---|---|
| 0:00 | Introduction |
| 1:07 | Center Stage front camera |
| 2:09 | Center Stage for photos |
| 3:09 | Capture session setup |
| 3:56 | Dynamic aspect ratio |
| 6:47 | Smart framing monitor |
| 9:24 | Sensor orientation compensation |
| 11:53 | Center Stage for video recordings |
| 13:16 | Center Stage for video calls |

---

# 📷 Center Stage 전면 카메라의 하드웨어 특성

기존 스마트폰 전면 카메라는 일반적으로 **4:3 센서**를 사용한다. 기기 방향에 따라 자연스럽게 얻을 수 있는 구도가 제한되기 때문에, 세로 사진과 가로 사진을 바꾸려면 대개 기기를 직접 회전해야 한다.

Center Stage 전면 카메라는 이 전제를 바꾼다.

- **정사각형 이미지 센서**
- **95° field of view**
- 카메라가 기기 중앙에 위치
- Face/gaze detection과 결합한 자동 프레이밍

정사각형 센서 덕분에 기기를 돌리지 않고도 동일한 센서 영역에서 여러 aspect ratio를 잘라낼 수 있다. Apple은 이를 통해 한 손으로 기기를 안정적으로 잡은 상태에서도 portrait/landscape 셀피 전환이 가능하며, 넓은 FOV는 그룹 셀피, 영상 안정화, 영상 통화의 자동 Center Stage에 유리하다고 설명한다.

---

# 🧱 기본 Capture Session 구성

사진 촬영을 기준으로 한 기본 구조는 일반적인 AVFoundation capture pipeline과 같다.

1. `AVCaptureSession` 생성
2. Center Stage 전면 카메라 선택
3. `AVCaptureDeviceInput` 생성
4. `AVCaptureVideoPreviewLayer`로 프리뷰 표시
5. `AVCapturePhotoOutput` 추가

Center Stage 전면 카메라는 API상 **front-facing `.builtInUltraWideCamera`**로 찾는다.

입력과 출력을 session에 추가하면 AVFoundation이 호환 가능한 media type 사이에 `AVCaptureConnection`을 자동으로 만든다.

---

# 🔄 Dynamic Aspect Ratio

## 개념

`AVCaptureDevice.dynamicAspectRatio`는 iOS 26부터 제공된다. 정사각형 센서에서 원하는 aspect ratio를 crop해 사용하며, **capture session을 다시 구성하거나 preview를 끊지 않고** 빠르게 전환할 수 있다.

세션에서 설명한 지원 조건:

- Front-facing `.builtInUltraWideCamera`
- Square sensor format
- 해상도 범위: **1280 ~ 4032**
- 지원 비율:
  - `3x4`
  - `4x3`
  - `9x16`
  - `16x9`
  - `1x1`

### ⚠️ 4032 photo format의 제한

4032 photo format은 최고 해상도 사진 촬영을 위해 **3x4와 4x3만 지원**한다. 따라서 `9x16`, `16x9`, `1x1`을 쓰려면 다른 지원 format을 선택해야 한다.

---

## Tap to Rotate 구현

먼저 Center Stage 전면 카메라를 찾는다.

```swift
import AVFoundation

let deviceDiscoverySession = AVCaptureDevice.DiscoverySession(
    deviceTypes: [.builtInUltraWideCamera],
    mediaType: .video,
    position: .front
)

guard let camera = deviceDiscoverySession.devices.first else {
    print("Failed to find the capture device")
    return
}
```

원하는 aspect ratio를 지원하는 format을 찾는다.

```swift
for format in camera.formats {
    if format.supportedDynamicAspectRatios.contains(.ratio4x3) {
        try! camera.lockForConfiguration()
        camera.activeFormat = format
        camera.unlockForConfiguration()
        break
    }
}
```

그 다음 비율을 변경한다.

```swift
try! camera.lockForConfiguration()
let timestamp = try! await camera.setDynamicAspectRatio(.ratio4x3)
print("Applied dynamic aspect ratio at timestamp: \(timestamp)")
camera.unlockForConfiguration()
```

`setDynamicAspectRatio`는 **변경이 처음 반영되는 buffer의 timestamp**를 반환한다. 이 timestamp는 특히 녹화 중 aspect ratio 전환을 다룰 때 중요하다.

### 구현 포인트

- Format이 실제로 원하는 aspect ratio를 지원하는지 먼저 검사한다.
- `activeFormat` 설정 시 configuration lock이 필요하다.
- 비율 변경 자체는 preview/session 재구성 없이 적용된다.
- 반환 timestamp를 recording boundary에 활용할 수 있다.

---

# 🤖 Smart Framing Monitor

`AVCaptureSmartFramingMonitor`는 자동 face/gaze detection을 바탕으로 **주기적인 프레이밍 추천**을 제공한다.

각 추천은 두 가지 핵심 값을 가진다.

- Aspect ratio
- Zoom factor

앱은 추천을 그대로 적용할 수도 있고 무시할 수도 있다.

## 중요한 지원 조건

Smart framing monitor는 **사진 촬영용**으로 설계되어 있으며, 세션 설명상 **4032 photo format에서만 추천을 제공**한다.

즉, Dynamic Aspect Ratio와 Smart Framing을 함께 쓰려면 원하는 framing과 smart framing을 모두 지원하는 format을 선택해야 한다.

---

## Smart framing 설정

```swift
import AVFoundation

for format in camera.formats {
    if format.isSmartFramingSupported {
        try! camera.lockForConfiguration()
        camera.activeFormat = format
        camera.unlockForConfiguration()
        break
    }
}
```

Monitor를 가져오고 어떤 framing을 추천할지 설정한다.

```swift
let monitor = camera.smartFramingMonitor!

try! camera.lockForConfiguration()
monitor.enabledFramings = monitor.supportedFramings
camera.unlockForConfiguration()
```

모든 지원 framing 대신 일부만 활성화할 수도 있다. 예를 들어 4x3에서 narrow/wide zoom만 허용하는 식으로 UX를 제한할 수 있다.

---

## 추천 관찰 및 적용

```swift
observation = monitor.observe(
    \.recommendedFraming,
    options: [.new]
) { monitor, change in
    if let framing = monitor.recommendedFraming {
        Task {
            try! camera.lockForConfiguration()
            try! await camera.setDynamicAspectRatio(framing.aspectRatio)
            camera.videoZoomFactor = CGFloat(framing.zoomFactor)
            camera.unlockForConfiguration()
        }
    }
}
```

Apple은 preview transition을 부드럽게 하기 위해 **aspect ratio를 먼저 적용하고 그 다음 zoom factor를 적용**하라고 설명한다.

Monitor는 capture session이 실행 중인 상태에서도 시작할 수 있다.

```swift
try! monitor.startMonitoring()
```

자동 프레이밍을 끌 때는 observation과 monitoring을 모두 정리한다.

```swift
observation?.invalidate()
observation = nil
monitor.stopMonitoring()
```

### Auto Zoom + Auto Rotate

Smart Framing Monitor의 추천값을 Dynamic Aspect Ratio와 zoom에 연결하면 다음 자동화가 가능하다.

- 한 명일 때 좁은 framing
- 사람이 추가되면 자동 zoom out
- 그룹의 배치가 바뀌면 자동 aspect-ratio 전환
- 기기 자체를 회전하지 않고도 landscape-like framing 제공

---

# 🧭 Sensor Orientation Compensation

기존 iPhone 전면 카메라 센서는 **Landscape Left 방향으로 장착**되어 있었다. Portrait으로 촬영하더라도 실제 buffer는 센서 native orientation으로 전달되고, EXIF orientation metadata가 재생 시 필요한 회전을 표시한다.

Center Stage 전면 카메라는 다르다.

- iPhone 17
- iPhone Air
- iPhone 17 Pro

이 기기들의 Center Stage 전면 센서는 **Portrait orientation으로 장착**된다.

따라서 과거 전면 카메라를 전제로 한 회전값을 그대로 적용하면 사진이 옆으로 눕거나 뒤집힐 수 있다.

---

## AVCapturePhotoOutput의 기본 보정

`AVCapturePhotoOutput`은 기본적으로 **sensor orientation compensation**을 적용한다.

이 과정에서:

- 사진 pixel data를 실제로 회전
- EXIF metadata 업데이트
- 앱에는 과거 전면 카메라처럼 Landscape Left 기준 결과 제공

결과적으로 기존 앱의 회전 처리 로직을 유지할 수 있도록 호환성을 제공한다.

### 보정 적용 대상

- HEIC
- JPEG
- Uncompressed processed photo

### 보정이 적용되지 않는 대상

- Bayer RAW
- Apple ProRAW

RAW 계열에서는 앱이 orientation을 직접 정확하게 처리해야 한다.

---

## 성능 관점

iOS 26부터 sensor orientation compensation 동작을 제어할 수 있다.

세션에서는 `AVCapturePhotoOutput`을 사용하는 앱이라면 **보정을 끈 상태도 테스트해 성능을 최적화**하고, 대신 사진의 최종 orientation이 정확한지 반드시 검증하라고 권장한다.

즉:

> 성능을 위해 compensation을 끌 수 있지만, 그 순간 orientation 책임은 앱으로 돌아온다.

회전 처리의 더 일반적인 방법은 `AVCaptureRotationCoordinator` 관련 WWDC23 세션을 참고한다.

---

# 🎥 Center Stage 전면 카메라와 영상 녹화

Dynamic Aspect Ratio는 video recording에도 사용할 수 있다. 예를 들어 녹화 전이나 녹화 도중 사용자에게 Tap to Rotate UI를 제공할 수 있다.

하지만 사진과 달리 중요한 제약이 있다.

## ⚠️ QuickTime movie track의 sample dimensions

QuickTime movie track은 모든 sample이 **같은 dimensions**를 가져야 한다.

따라서 녹화 도중 Dynamic Aspect Ratio를 변경하면 dimensions가 바뀌고, 현재 recording을 그대로 유지할 수 없다.

### `AVCaptureMovieFileOutput`

Photo output 대신 `AVCaptureMovieFileOutput`을 사용하면, aspect ratio가 바뀔 때 **recording이 자동으로 종료**된다.

### `AVCaptureVideoDataOutput` + `AVAssetWriter`

더 세밀한 제어가 필요하면:

1. `AVCaptureVideoDataOutput`으로 buffer stream 수신
2. `AVAssetWriter`로 파일 기록
3. `setDynamicAspectRatio`가 반환한 timestamp 사용
4. 해당 timestamp를 경계로 기존 recording 종료
5. 새 dimensions로 새로운 recording 시작

이 방식은 aspect ratio change와 movie segmentation을 앱이 직접 제어할 때 유용하다.

---

# 🎞️ Cinematic Stabilization

Center Stage 전면 카메라는 다음 stabilization mode도 지원한다.

- `cinematicExtended`
- `cinematicExtendedEnhanced`

이 두 모드는 Center Stage 전면 카메라에서 **face-aware**하게 동작한다. 배경보다 **피사체의 안정적인 위치 유지**를 우선한다.

걷거나 이동하면서 셀프 영상을 촬영하는 경우 특히 효과적이다.

---

# 📞 Center Stage for Video Calls

영상 통화 앱에서는 사진과 다른 output 구성이 일반적이다.

- `AVCaptureVideoDataOutput`
- 앱이 buffer를 직접 수신
- 앱이 rendering, encoding, transmission 처리

## Voice over IP background mode를 이미 사용하는 앱

통화 연결 유지를 위해 **Voice over IP background mode**를 사용하는 video conferencing 앱은 Center Stage가 이미 지원된다.

사용자는 Control Center의 **Video Effects** 메뉴에서 Center Stage를 직접 켜고 끌 수 있다.

## Voice over IP background mode를 사용하지 않는 앱

이 경우에도 iPhone 17 / iPhone Air / iPhone 17 Pro의 전면 카메라에서 Center Stage API를 직접 채택할 수 있다.

---

# 🎛️ Center Stage 제어 모드

Center Stage는 Portrait, Studio Light, Gestures와 마찬가지로 **process 단위의 system-wide video effect**다.

한 번 활성화되면 앱 프로세스 안의 지원 camera에 적용된다.

먼저 Center Stage를 지원하는 format을 고른다.

```swift
import AVFoundation

for format in camera.formats {
    if format.isCenterStageSupported {
        try! camera.lockForConfiguration()
        camera.activeFormat = format
        camera.unlockForConfiguration()
        break
    }
}
```

그 다음 control mode와 활성화를 설정한다.

```swift
AVCaptureDevice.centerStageControlMode = .cooperative
AVCaptureDevice.isCenterStageEnabled = true
```

### `.cooperative`

- Control Center에서 사용자가 제어 가능
- 앱 내부 버튼에서도 제어 가능

세션은 기본적으로 사용자가 Control Center에서 Center Stage를 제어하며, 앱 내 UI도 제공하려면 cooperative mode를 사용할 수 있다고 설명한다.

---

# 🚶 Low-Latency Stabilization for Video Calls

Center Stage 전면 카메라는 iOS 26부터 **실시간 저지연 안정화 모드**를 지원한다.

기본값은 off다.

```swift
connection.preferredVideoStabilizationMode = .lowLatency
```

영상 통화에서는 일반적인 고품질 후처리보다 **낮은 latency와 실시간성**이 중요하다. 이 모드는 걷는 중 통화처럼 흔들림이 큰 상황에서도 실시간 프레임을 안정시키는 데 목적이 있다.

---

# 🧩 사진·영상·통화별 API 선택

| 사용 사례 | 핵심 API/구성 | 중요한 제약 |
|---|---|---|
| 수동 셀피 회전 | `dynamicAspectRatio` | 지원 format 확인 필요 |
| Auto Zoom / Auto Rotate | `AVCaptureSmartFramingMonitor` + `dynamicAspectRatio` + zoom | Smart framing은 4032 photo format 기반 |
| 고해상도 사진 | `AVCapturePhotoOutput` | 4032는 3x4/4x3만 지원 |
| 영상 녹화 | `AVCaptureMovieFileOutput` | 비율 변경 시 recording 중단 |
| 세밀한 영상 녹화 | `AVCaptureVideoDataOutput` + `AVAssetWriter` | timestamp로 파일 분할 필요 |
| 영상 통화 | `AVCaptureVideoDataOutput` | app layer가 encode/transmit 담당 |
| 자동 Center Stage | `isCenterStageEnabled` | 지원 format + control mode 필요 |
| 저지연 통화 안정화 | `.lowLatency` stabilization | 기본 off |

---

# ⚠️ 구현 시 주의할 점

## Format 선택이 기능을 결정한다

기능이 카메라 device 자체에만 달려 있는 것이 아니다. 선택한 `activeFormat`이 다음을 실제로 지원해야 한다.

- Dynamic aspect ratio
- Smart framing
- Center Stage

따라서 기능마다 format capability query가 선행되어야 한다.

## 4032 format의 aspect-ratio 범위

최고 해상도 4032 format은 **3x4 / 4x3만** 지원한다. UI에서 16:9 등 모든 비율을 항상 활성화하면 안 된다.

## Smart framing은 앱이 결정권을 가진다

Monitor가 주는 값은 **recommendation**이다. 앱은:

- 무시 가능
- 일부 framing만 활성화 가능
- 사용자 preference에 따라 자동 기능을 끌 수 있음

즉 Smart Framing Monitor는 강제 시스템 정책이 아니라 앱이 소비하는 추천 엔진이다.

## 녹화 중 Dynamic Aspect Ratio 변경

사진 preview는 seamless하지만 movie track은 그렇지 않다. 해상도 변경이 발생하므로 현재 movie segment를 끝내고 새 segment를 만들어야 한다.

## Orientation compensation과 RAW

HEIC/JPEG의 자동 보정이 잘 된다고 해서 RAW/ProRAW도 같은 결과를 낸다고 가정하면 안 된다.

## Process-wide Center Stage

Center Stage는 특정 `AVCaptureConnection` 하나만의 effect가 아니라 process 수준 video effect라는 점을 염두에 둔다.

---

# 🛠️ 실무 적용 패턴

## 수동 framing UI

- Portrait / Landscape toggle
- 1:1 지원 여부 표시
- 지원하지 않는 ratio는 format query 결과에 따라 비활성화
- 비율 전환에 `setDynamicAspectRatio` 사용

## 자동 framing UI

- Auto Zoom toggle
- Auto Rotate toggle
- Smart framing monitor의 `enabledFramings`를 UI 설정과 연동
- `recommendedFraming` observation lifecycle 관리

## 영상 통화 UI

- Center Stage toggle
- `.cooperative` control mode 고려
- Control Center 상태와 앱 상태가 충돌하지 않도록 설계
- `.lowLatency` stabilization 옵션 테스트

## 사진 orientation 테스트

- Compensation on/off 모두 확인
- HEIC/JPEG와 RAW/ProRAW를 별도로 검증
- Portrait/landscape device orientation 조합 확인

---

# ✅ 테스트 체크리스트

## 카메라 및 포맷

- [ ] `.builtInUltraWideCamera` + `.front` discovery 확인
- [ ] 해당 기기에서 device 존재 여부 안전 처리
- [ ] `supportedDynamicAspectRatios` 기반 UI 구성
- [ ] `isSmartFramingSupported` 확인
- [ ] `isCenterStageSupported` 확인
- [ ] 4032 photo format의 3x4/4x3 제한 검증

## Dynamic Aspect Ratio

- [ ] `activeFormat` 설정 후 비율 변경
- [ ] Preview가 끊기지 않는지 확인
- [ ] 반환 timestamp가 예상 buffer 경계와 맞는지 확인
- [ ] 3x4 ↔ 4x3 수동 전환 테스트
- [ ] 지원하지 않는 비율 요청 방지

## Smart Framing

- [ ] `enabledFramings` 정책 결정
- [ ] `recommendedFraming` KVO 등록/해제
- [ ] Aspect ratio를 zoom보다 먼저 적용
- [ ] 사람 수 변화 시 Auto Zoom 테스트
- [ ] 피사체 배치 변화 시 Auto Rotate 테스트
- [ ] 자동 기능 off 시 `stopMonitoring()` 호출

## Orientation

- [ ] Sensor orientation compensation on/off 테스트
- [ ] HEIC/JPEG orientation 검증
- [ ] Uncompressed processed photo orientation 검증
- [ ] Bayer RAW / ProRAW 별도 처리 확인
- [ ] 기존 rotation constant를 무조건 가정하지 않기

## Video Recording

- [ ] `AVCaptureMovieFileOutput`에서 ratio 변경 시 recording 종료 확인
- [ ] `AVAssetWriter` 사용 시 timestamp 기준 segment 분리
- [ ] `cinematicExtended` 품질 확인
- [ ] `cinematicExtendedEnhanced` 품질 확인

## Video Calls

- [ ] VoIP background mode 사용 여부 점검
- [ ] Control Center의 Center Stage와 앱 내부 제어 상호작용 확인
- [ ] `.cooperative` mode 동작 검증
- [ ] `isCenterStageEnabled` process-wide 영향 확인
- [ ] `.lowLatency` stabilization on/off 비교

---

# 🧠 핵심 메시지

Center Stage 전면 카메라 지원의 핵심은 단순히 “새 카메라를 하나 더 선택하는 것”이 아니다. **정사각형 센서가 제공하는 가변 crop 공간을 앱이 프레이밍 UX로 활용하는 것**이 핵심이다.

이를 위해 Apple은 세 단계의 API를 제공한다.

1. **Dynamic Aspect Ratio**로 원하는 프레임을 직접 선택
2. **Smart Framing Monitor**로 face/gaze 기반 자동 추천 적용
3. **Center Stage**로 video call의 system-wide 자동 프레이밍 활성화

여기에 sensor orientation compensation, recording segmentation, cinematic/low-latency stabilization을 함께 고려해야 사진·영상·통화 전반에서 일관된 경험을 만들 수 있다.

---

# 🔗 함께 보면 좋은 세션과 자료

- [Support the Center Stage front camera in your iOS app](https://developer.apple.com/videos/play/wwdc2026/341/)
- [Implement high resolution photo capture — WWDC26](https://developer.apple.com/videos/play/wwdc2026/304/)
- [Support external cameras in your iPadOS app — WWDC23](https://developer.apple.com/videos/play/wwdc2023/10106/)
- [What’s new in camera capture — WWDC21](https://developer.apple.com/videos/play/wwdc2021/10047/)
- Apple Developer Documentation — AVFoundation
- Apple Sample Code — AVCam: Building a camera app
