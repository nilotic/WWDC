# Tech Talk 111465 Build a great camera experience for iPhone Duo 요약

- Session: Tech Talk 111465
- Title: Build a great camera experience for iPhone Duo
- Source: https://developer.apple.com/videos/play/tech-talks/111465/
- Topic: iPhone Duo, AVFoundation, Virtual Front Camera, AVCaptureDeviceDirectionCoordinator, SceneAccessories, AVCaptureDeviceDescriptor, Camera Preview, Rotation
- Chapters: Introduction, Meet the new front cameras, Discover the virtual front camera, Access each camera individually, Track camera direction, Create a direction coordinator, Use both displays at once, Work with device descriptors, Handle a direction change, Polish your camera preview, Handle rotation, Next steps

---

## 한 줄 요약

iPhone Duo의 카메라 앱은 **outer/inner front camera를 자동으로 전환해 주는 Virtual Front Camera를 가장 단순한 기본값으로 사용**할 수 있고, 각 카메라의 4K·120fps·depth 같은 개별 기능이 필요하면 physical camera를 직접 선택한 뒤 `AVCaptureDeviceDirectionCoordinator`로 현재 앱 UI가 놓인 디스플레이를 기준으로 어떤 카메라가 실제로 사용자를 향하는지 추적해 세션·미러링·UI를 다시 구성해야 한다.

---

## 핵심 요약

이번 Tech Talk은 iPhone Duo의 두 전면 카메라를 카메라 앱에서 어떻게 다뤄야 하는지 설명한다.

핵심은 단순히 `position == .front`를 보는 것만으로는 충분하지 않다는 점이다.

iPhone Duo는 펼친 상태와 접힌 상태에서 디스플레이의 방향이 바뀌며, 앱 UI가 어느 디스플레이에 있는지에 따라 **같은 전면 카메라도 사용자 기준으로 forward-facing 또는 backward-facing이 될 수 있다.**

Apple은 이를 위해 다음 구조를 제공한다.

```text
가장 단순한 앱
→ Virtual Front Camera
→ outer / inner 자동 전환

카메라별 고급 기능이 필요한 앱
→ Individual Physical Camera
→ AVCaptureDeviceDirectionCoordinator
→ 현재 UI 기준 카메라 방향 추적
→ AVCaptureSession 재구성
```

주요 포인트:

- iPhone Duo에는 두 개의 square ultrawide front camera가 있음
  - Outer ultrawide camera
  - Inner ultrawide camera
- `AVCaptureDeviceDiscoverySession`에서 `.front` + wide/ultrawide를 요청하면 새로운 **Virtual Front Camera**가 발견됨
- Virtual Front Camera는 device를 열고 닫을 때 outer/inner camera를 자동 전환
- 각 physical camera를 직접 쓰면 더 많은 capability에 접근 가능
  - Inner: 최대 1080p / 60fps
  - Outer: 최대 4K / 120fps
  - Virtual Front Camera: 공통 기능만 노출 → 최대 1080p / 60fps
  - Depth는 개별 카메라 접근 시에만 지원
- Physical camera를 직접 쓸 때는 `AVCaptureDeviceDirectionCoordinator`로 open/close와 display 이동에 따른 camera direction 변화를 추적
- Coordinator는 `UIView`를 기준으로 방향을 판단
- Dual-display camera app은 각 display의 view마다 별도 coordinator 필요
- Change handler는 main actor에 묶이므로 AVFoundation object를 직접 만지지 않고 `AVCaptureDeviceDescriptor`를 camera actor로 넘김
- 방향 변경 시:
  - `AVCaptureSession` 재구성
  - preview mirroring 재판단
  - 관련 UI 갱신
- Preview polish:
  - `videoGravity`
  - `dynamicAspectRatio`
  - square sensor 활용
- Rotation:
  - `AVCaptureDeviceRotationCoordinator`
  - display 이동 시에도 rotation 일관성 유지
  - 적용 후 front camera의 sensor orientation compensation을 끄면 성능 개선 가능

---

# 📱 iPhone Duo의 두 전면 카메라

iPhone Duo는 Apple이 설명하는 첫 번째 **두 개의 front camera를 가진 iPhone**이다.

두 카메라는 모두:

- Square sensor
- Ultrawide field of view

를 사용한다.

배치:

```text
Device Closed
┌─────────────────────┐
│ Outer Display       │
│ Outer Ultra Wide    │
└─────────────────────┘

Device Open
┌────────────┬────────────┐
│ Outer Side │ Inner Side │
│            │ Inner UWA  │
│            │ Under-Disp │
└────────────┴────────────┘
```

Inner camera는 **iPhone 최초의 under-display camera**다.

---

# 🔎 기본 접근: AVCaptureDeviceDiscoverySession

기존 iPhone과 마찬가지로 AVFoundation discovery session을 사용한다.

검색 조건:

```text
position = .front
+
Wide 또는 Ultra Wide device type
```

iPhone Duo에서는 이 검색으로 새로운 **Virtual Front Camera**가 나타난다.

---

# 🎥 Virtual Front Camera

Virtual Front Camera는 새로운 `AVCaptureDevice`다.

역할:

```text
Device Open
→ Inner Front Camera 사용

Device Closed
→ Outer Front Camera 사용
```

즉 앱이 physical camera switch logic을 직접 구현하지 않아도 된다.

Apple의 표현대로라면 Virtual Front Camera는 앱 상황에서 **가장 relevant한 front camera**를 자동 선택한다.

---

# ✅ Virtual Front Camera가 적합한 경우

다음 요구라면 Virtual Front Camera가 가장 단순하다.

- 일반적인 selfie/video call
- Open/close 시 자동 전환이 중요
- 두 카메라의 공통 capability만으로 충분
- Camera switch state machine을 직접 관리하고 싶지 않음

구조:

```text
App
 ↓
Virtual Front Camera
 ↓
System chooses outer / inner
```

---

# 🎛️ Physical Camera를 직접 선택해야 하는 경우

각 front camera에는 고유한 `AVCaptureDevice` type이 있다.

- Built-in outer ultrawide
- Built-in inner ultrawide

세션 코드에서 사용하는 type:

```swift
.builtInOuterUltraWideCamera
.builtInInnerUltraWideCamera
```

이 방식의 장점은 각 카메라의 전체 capability를 사용할 수 있다는 것이다.

---

# 📊 Front Camera Capability 차이

| Camera | 최대 Video | Depth |
|---|---:|---|
| Inner Ultra Wide | 1080p / 60fps | 개별 접근 시 지원 가능 |
| Outer Ultra Wide | 4K / 120fps | 개별 접근 시 지원 가능 |
| Virtual Front Camera | 1080p / 60fps | 지원하지 않음 |

Virtual camera는 두 physical camera가 공통으로 제공할 수 있는 기능만 노출한다.

따라서:

```text
편의성 우선
→ Virtual Front Camera

최대 resolution / fps / depth 우선
→ Individual Camera
```

---

# 🧭 `AVCaptureDevicePosition`만으로 부족한 이유

기존 AVFoundation에서는 카메라 위치를 다음처럼 표현했다.

```swift
enum AVCaptureDevicePosition: Int {
    case unspecified
    case back
    case front
}

extension AVCaptureDevice {
    var position: AVCaptureDevicePosition { get }
}
```

기존 slab형 iPhone에서는 `.front`는 거의 곧 “사용자를 향하는 카메라”를 의미했다.

하지만 iPhone Duo에서는 그렇지 않다.

두 front camera 모두 `position == .front`다.

그러나 펼침 상태와 현재 앱이 놓인 display에 따라 실제 방향은 달라진다.

---

# 🔄 Front Camera가 항상 사용자를 향하는 것은 아니다

예를 들어 앱이 inner display에 있고 사용자가 inner display를 보고 있다고 하자.

이때:

- Inner front camera → 사용자 쪽
- Outer front camera → 반대쪽

둘 다 AVFoundation의 fixed `position` 값은 `.front`다.

즉:

```text
AVCaptureDevice.position
≠
현재 앱 UI 기준 실제 Camera Direction
```

이 차이를 해결하는 API가 direction coordinator다.

---

# 🧭 `AVCaptureDeviceDirectionCoordinator`

개별 camera를 사용하는 앱은 새로운 direction coordinator를 사용한다.

Coordinator가 알려주는 것:

> 현재 **앱의 view를 기준으로** 어떤 camera가 forward-facing이고 어떤 camera가 backward-facing인지.

따라서 device open/close뿐 아니라 display 이동과 flip에도 대응할 수 있다.

---

# 🧩 Coordinator 생성에 필요한 세 가지

Apple이 설명하는 입력은 세 가지다.

1. 앱의 `UIView`
2. 감시할 device types
3. Change handler

세션 코드:

```swift
directionCoordinator = AVCaptureDeviceDirectionCoordinator(
    view: view,
    deviceTypes: [
        .builtInOuterUltraWideCamera,
        .builtInInnerUltraWideCamera,
        .builtInDualWideCamera,
    ],
    changeHandler: { [weak self] map in
        self?.updateCameraSession(map)
    }
)
```

---

# 🖥️ 왜 `UIView`가 필요한가

Direction은 device 전체의 절대 방향이 아니라 **UI가 있는 display를 기준으로 계산**된다.

예:

## App view가 Outer Display에 있을 때

```text
Outer Front Camera
→ Forward-facing

Rear Cameras
→ Backward-facing
```

## Device를 열고 View가 Inner Display로 이동

Change handler가 호출된다.

이후:

```text
Inner Front Camera
→ Forward-facing

Outer Front Camera
→ Backward-facing

Rear Cameras
→ Backward-facing
```

---

# 🔃 펼친 상태에서 Device를 뒤집는 경우

Device가 open 상태일 때 사용자가 반대쪽으로 뒤집으면 camera app을 outer display에 둘 수 있다.

이 경우:

```text
Outer Front Camera
→ Forward-facing

Rear Camera
→ Forward-facing
```

즉 서로 다른 물리적 방향에 있는 camera라도 현재 `UIView` 기준으로는 모두 사용자 쪽을 볼 수 있다.

따라서 `.front`/`.back`보다는 **현재 UI relative direction**이 중요한 개념이다.

---

# 🖥️🖥️ 두 Display를 동시에 사용하는 Camera App

iPhone Duo camera app은 outer와 inner display를 동시에 사용할 수도 있다.

Apple이 제시한 예:

- Group video call
- 아이 사진을 찍는 동안 반대편 display에 재미있는 콘텐츠 표시

이 경우 동시에 두 개의 `UIView`가 존재한다.

```text
Outer Display
→ UIView A

Inner Display
→ UIView B
```

---

# 🧭 Display마다 별도 Direction Coordinator

각 view에 별도 coordinator를 생성한다.

```text
UIView A
→ Direction Coordinator A

UIView B
→ Direction Coordinator B
```

왜냐하면 같은 camera라도 **어느 display의 view에서 바라보느냐에 따라 방향 판단이 다르기 때문**이다.

예:

Outer display coordinator:

```text
Rear Camera
→ Forward-facing
```

Inner display coordinator:

```text
Rear Camera
→ Backward-facing
```

Camera direction은 view-relative 개념이다.

---

# 🧩 SceneAccessories와 연결

두 display를 동시에 사용하는 camera app은 **SceneAccessories API**를 사용할 수 있다.

이 내용은 앞선 Tech Talk:

> Leverage multiple displays and scenes on iPhone Duo

와 직접 연결된다.

즉 camera API만으로 multi-display UI를 구성하는 것이 아니라 SceneAccessories로 second-display scene을 만들고 각 scene의 view에 독립적인 direction coordinator를 둔다.

---

# 🧵 Main Actor와 Camera Actor 분리

Direction coordinator는 `UIView`에 연결되어 있기 때문에 main actor에 격리된다.

그 결과 change handler에서 AVFoundation capture session을 직접 조작하는 것은 권장되지 않는다.

Apple은 이를 위해 `AVCaptureDeviceDescriptor`를 제공한다.

---

# 📦 `AVCaptureDeviceDescriptor`

Coordinator는 직접 `AVCaptureDevice`를 주는 대신 descriptor를 제공한다.

Descriptor 특성:

- Main-actor safe
- Sendable
- `AVCaptureDevice`를 다시 만드는 데 필요한 정보 포함

구조:

```text
Direction Coordinator
(Main Actor)
      ↓
AVCaptureDeviceDescriptor
      ↓ Sendable
Camera Actor
      ↓
AVCaptureDevice / AVCaptureSession
```

UI actor와 capture actor를 분리할 수 있게 해 준다.

---

# 🔄 Direction Change 시 해야 할 일

사용자가 device를 열거나 닫으면 change handler가 호출된다.

Apple은 크게 세 가지를 권장한다.

## 1. Capture Session 재구성

새로 forward-facing이 된 카메라로 계속 stream하도록 `AVCaptureSession` input을 변경한다.

```text
Direction Changed
      ↓
Find forward-facing descriptor
      ↓
Camera Actor
      ↓
Resolve AVCaptureDevice
      ↓
Reconfigure AVCaptureSession
```

---

# 🪞 2. Preview Mirroring 재판단

카메라가 물리적으로 rear camera라고 해서 항상 “rear-camera style preview”가 자연스러운 것은 아니다.

Device를 펼쳐 뒤집어 rear camera가 사용자 쪽을 바라보고 있다면 Apple은 **preview를 mirror하는 것**을 권장한다.

이유:

```text
Camera가 사용자 자신을 촬영
→ 자연스러운 selfie 경험 필요
→ Mirrored preview
```

즉 mirroring 판단도 camera type이 아니라 **camera direction과 UX context**를 기준으로 한다.

---

# 🎛️ 3. UI 갱신

카메라가 변경되면 UI 역시 조정해야 할 수 있다.

예:

- Resolution option
- Frame-rate option
- Depth control
- Camera label
- Zoom range
- Preview placement

Physical camera별 capability가 다르므로 switch 이후 사용 가능한 control set이 바뀔 수 있다.

---

# 📚 Direction Coordinator의 Framework 위치

세션에서는 direction coordinator를 **AVKit**에서 찾을 수 있다고 설명한다.

Apple Developer Documentation의 관련 문서:

> Choosing a Camera by the Direction it Faces

이 API는 iPhone Duo의 physical configuration 변화와 camera selection을 연결하는 핵심 layer다.

---

# 🎞️ Camera Preview를 다듬기

카메라를 올바르게 전환하는 것만으로 끝나지 않는다.

iPhone Duo는 display 형태와 camera field of view가 기존 iPhone과 다르기 때문에 preview layout을 따로 고려해야 한다.

---

# 📷 Rear Camera의 Full Field of View

Inner display에서 rear camera의 full field of view를 표시하면 preview 주변에 추가 공간이 생길 수 있다.

Apple은 두 접근 모두 가능하다고 설명한다.

## Option A: Preview를 Offset

```text
┌───────────────────────────┐
│ Controls │                │
│ Controls │ Camera Preview │
│ Controls │                │
└───────────────────────────┘
```

남는 공간에 control을 묶는다.

## Option B: Preview가 전체 Display를 채움

```text
┌───────────────────────────┐
│                           │
│       Camera Preview      │
│                           │
└───────────────────────────┘
```

앱의 UX에 맞춰 선택한다.

---

# 🖼️ `AVCaptureVideoPreviewLayer.videoGravity`

Preview layer 내부에서 영상이 어떻게 배치될지 결정하는 기존 API다.

```swift
class AVCaptureVideoPreviewLayer {
    var videoGravity: AVLayerVideoGravity { get set }
}
```

Preview를:

- Aspect fit
- Aspect fill
- Resize

중 어떤 방식으로 표현할지 선택할 수 있다.

---

# ⬜ Square Sensor의 장점

두 front camera가 square sensor이기 때문에 display 방향에 맞춰 crop/format을 유연하게 바꿀 수 있다.

특히 inner display에서 landscape-style framing을 만들 때 유용하다.

---

# 📐 `dynamicAspectRatio`

세션은 ultrawide front camera로 display를 채우기 위해 새로운 dynamic aspect ratio 기능을 사용한다.

```swift
class AVCaptureDevice {
    var dynamicAspectRatio: AVCaptureDevice.AspectRatio? { get }
}
```

Inner display에서 landscape aspect ratio를 선택해 square sensor의 area를 효율적으로 사용할 수 있다.

관련 WWDC26 세션:

> Support the Center Stage front camera in your iOS app

Square sensor의 장점과 dynamic aspect ratio를 더 깊게 설명한다.

---

# 🔄 Rotation 처리

iPhone Duo는 app이 display 사이를 이동할 수 있으므로 기존 device orientation만으로 preview rotation을 관리하는 방식은 충분하지 않을 수 있다.

Apple은 **rotation coordinator** 사용을 권장한다.

```text
AVCaptureDeviceRotationCoordinator
```

목표:

- Camera preview upright 유지
- Captured photo upright 유지
- Display 이동 후에도 rotation 일관성 유지

---

# 🧭 Display 이동과 Rotation

App이 outer display에서 inner display로 이동하면 rotation coordinator도 업데이트된다.

따라서 app이 직접 physical device geometry를 해석하지 않고 coordinator의 값을 사용해 preview와 output rotation을 일관되게 적용할 수 있다.

---

# ⚡ Camera Sensor Orientation Compensation 비활성화

Rotation coordinator를 채택한 뒤에는 camera sensor orientation compensation을 끄는 것을 권장한다.

세션 코드:

```swift
// Disable for improved performance
class AVCapturePhotoOutput: AVCaptureOutput {
    var isCameraSensorOrientationCompensationEnabled: Bool { get set }
}
```

Apple 설명:

- 이 compensation은 iPhone Duo의 모든 front camera에서 기본적으로 활성화
- Rotation coordinator를 사용한 뒤 disable하면 성능 개선 가능

---

# 🧩 Virtual Front Camera vs Individual Camera

| 항목 | Virtual Front Camera | Individual Physical Camera |
|---|---|---|
| Open/close 자동 전환 | 자동 | 앱이 직접 처리 |
| Direction coordinator 필요 | 기본적으로 불필요 | 권장/필수에 가까움 |
| Inner 최대 Video | 공통 capability로 제한 | 1080p / 60fps |
| Outer 최대 Video | 공통 capability로 제한 | 4K / 120fps |
| Virtual max | 1080p / 60fps | 해당 없음 |
| Depth | 지원하지 않음 | 개별 camera에서 지원 |
| Implementation complexity | 낮음 | 높음 |
| Capability control | 제한적 | 최대 |
| Mirroring/UI switch | 대부분 system이 단순화 | 앱이 직접 처리 |

---

# 🧩 Camera Position vs Direction

| 개념 | 의미 |
|---|---|
| `AVCaptureDevice.position` | Hardware의 고정된 front/back 분류 |
| Direction Coordinator 결과 | 현재 `UIView` 기준 실제 camera facing direction |

핵심:

```text
Position = Device의 고정 속성
Direction = 현재 UI와 물리 상태에 따라 변하는 상대 속성
```

이 구분이 iPhone Duo camera architecture의 가장 중요한 개념이다.

---

# 🔁 권장 Architecture

고급 camera app이라면 다음 구조가 자연스럽다.

```text
Main Actor
UIView / Scene
      ↓
AVCaptureDeviceDirectionCoordinator
      ↓
AVCaptureDeviceDescriptor
      ↓ Sendable
Camera Actor
      ↓
AVCaptureSession
      ↓
Selected Physical Camera
```

그리고 별도로:

```text
UIView / Preview
      ↓
AVCaptureDeviceRotationCoordinator
      ↓
Preview Rotation
Photo Rotation
```

---

# 📋 체크리스트

## Camera Discovery

- [ ] iPhone Duo에서 `.front` discovery 동작 확인
- [ ] Virtual Front Camera 발견 여부 확인
- [ ] `.builtInOuterUltraWideCamera` 지원 확인
- [ ] `.builtInInnerUltraWideCamera` 지원 확인
- [ ] 앱이 Virtual camera만으로 충분한지 먼저 판단

## Virtual Front Camera

- [ ] Device open 시 inner camera 사용 확인
- [ ] Device close 시 outer camera 사용 확인
- [ ] 1080p / 60fps 제한이 요구사항에 맞는지 확인
- [ ] Depth가 필요한지 확인
- [ ] Physical camera capability가 필요하지 않으면 우선 Virtual camera 사용

## Individual Camera

- [ ] Outer 4K / 120fps가 필요한지 확인
- [ ] Inner 1080p / 60fps 요구 확인
- [ ] Depth 사용 여부 확인
- [ ] Open/close camera switch state machine 설계
- [ ] Capture session 재구성 비용 테스트

## Direction Coordinator

- [ ] App의 `UIView` 제공
- [ ] Monitoring할 device type 정의
- [ ] `AVCaptureDeviceDirectionCoordinator` 생성
- [ ] Change handler 등록
- [ ] Open/close transition 테스트
- [ ] Device flip 테스트
- [ ] View가 display 사이를 이동할 때 결과 확인

## Main Actor / Camera Actor

- [ ] Change handler에서 AVFoundation object 직접 조작하지 않기
- [ ] `AVCaptureDeviceDescriptor` 사용
- [ ] Descriptor를 camera actor로 전달
- [ ] Actor에서 `AVCaptureDevice` resolve
- [ ] Session reconfiguration을 camera actor에 격리

## Direction Change

- [ ] 새로운 forward-facing camera 결정
- [ ] `AVCaptureSession` input 변경
- [ ] Preview mirroring 다시 계산
- [ ] Rear camera가 forward-facing일 때 selfie-style mirror 검토
- [ ] Camera capability 변화에 따라 UI 갱신
- [ ] Resolution / FPS / Depth option 재평가

## Dual Display

- [ ] SceneAccessories 사용 여부 확인
- [ ] Outer display용 UIView 준비
- [ ] Inner display용 UIView 준비
- [ ] 각 view에 별도 direction coordinator 생성
- [ ] 같은 camera의 방향이 coordinator별로 다르게 보고되는지 테스트
- [ ] 두 display의 capture UI가 독립적으로 올바른지 확인

## Preview Layout

- [ ] Rear camera full FOV에서 남는 display 공간 확인
- [ ] Preview offset + controls 배치 검토
- [ ] Full-bleed preview 검토
- [ ] `videoGravity` 선택
- [ ] Aspect fit/fill 시 crop 확인
- [ ] Inner display layout 테스트

## Square Sensor / Aspect Ratio

- [ ] Front ultrawide square sensor 활용
- [ ] `dynamicAspectRatio` 지원 확인
- [ ] Inner display에서 landscape aspect ratio 적용 검토
- [ ] Aspect ratio 변경 시 capture output과 preview 일치 확인

## Rotation

- [ ] `AVCaptureDeviceRotationCoordinator` 채택
- [ ] Preview upright 여부 확인
- [ ] Photo output orientation 확인
- [ ] Outer → Inner display 이동 테스트
- [ ] Inner → Outer display 이동 테스트
- [ ] Rotation consistency 확인
- [ ] Coordinator 적용 후 sensor orientation compensation 비활성화 검토

## Performance

- [ ] Physical camera switch latency 측정
- [ ] 4K / 120fps에서 thermal/power 확인
- [ ] Preview reconfiguration hitch 확인
- [ ] Camera sensor orientation compensation disable 전후 측정
- [ ] Dual-display preview 성능 측정

---

# ⚠️ 구현 시 주의할 점

## `.front`는 “사용자를 향한다”는 의미가 아니다

iPhone Duo에서는 front camera가 반대편을 향할 수 있다.

Camera selection logic을 `position`에만 의존하면 잘못된 camera를 선택할 수 있다.

---

## Virtual Front Camera는 최고 사양의 합집합이 아니다

Virtual camera는 두 physical camera의 **공통 capability**만 노출한다.

따라서 outer camera의 4K / 120fps를 Virtual camera로 얻을 수 없다.

---

## Physical Camera를 쓰면 전환 책임도 앱이 가진다

개별 camera 선택은 capability를 더 주는 대신:

- Open/close tracking
- Direction 판단
- Capture session 변경
- Mirroring
- UI update

를 앱이 처리해야 한다.

---

## Direction은 View-relative다

Dual-display에서는 같은 camera가 한 view에는 forward-facing, 다른 view에는 backward-facing일 수 있다.

Coordinator를 device 전체에 하나만 만들지 말고 각 display의 view별로 생성해야 한다.

---

## Change Handler에서 AVFoundation 세션을 직접 만지지 않는다

Coordinator가 main actor에 격리되므로 `AVCaptureDeviceDescriptor`를 통해 camera actor로 넘기는 구조가 권장된다.

---

## Mirroring을 Camera Type만으로 결정하지 않는다

Rear camera라도 현재 사용자 쪽을 향하면 selfie preview처럼 mirror하는 것이 더 자연스러울 수 있다.

---

# 🧩 주요 API 정리

| API | 역할 |
|---|---|
| `AVCaptureDeviceDiscoverySession` | Front camera discovery |
| Virtual Front Camera | Outer/inner front camera 자동 전환 |
| `.builtInOuterUltraWideCamera` | Outer front physical camera |
| `.builtInInnerUltraWideCamera` | Inner front physical camera |
| `AVCaptureDevice.position` | Fixed front/back hardware position |
| `AVCaptureDeviceDirectionCoordinator` | Current view 기준 camera facing direction 추적 |
| `AVCaptureDeviceDescriptor` | Main-actor-safe, Sendable camera descriptor |
| `SceneAccessories` | 두 display를 동시에 사용하는 scene 구성 |
| `AVCaptureVideoPreviewLayer.videoGravity` | Preview layer layout 방식 |
| `AVCaptureDevice.dynamicAspectRatio` | Square sensor를 이용한 dynamic aspect ratio 선택 |
| `AVCaptureDeviceRotationCoordinator` | Preview/output rotation 일관성 유지 |
| `isCameraSensorOrientationCompensationEnabled` | Sensor orientation compensation 제어 |

---

# 🔁 가장 단순한 구현 흐름

Virtual Front Camera만 사용:

```text
Discovery Session
      ↓
Virtual Front Camera
      ↓
AVCaptureSession
      ↓
System handles open/close switch
```

---

# 🔁 고급 구현 흐름

Physical camera 직접 사용:

```text
UIView
  ↓
Direction Coordinator
  ↓
Current Forward-facing Camera Descriptor
  ↓
Camera Actor
  ↓
Resolve Physical AVCaptureDevice
  ↓
Reconfigure AVCaptureSession
  ↓
Update Mirroring
  ↓
Update UI
```

---

# 🔁 Dual-display 구현 흐름

```text
SceneAccessories
      ↓
┌──────────────────────┐
│ Outer Display UIView │
│  ↓                   │
│ Direction Coord A    │
└──────────────────────┘

┌──────────────────────┐
│ Inner Display UIView │
│  ↓                   │
│ Direction Coord B    │
└──────────────────────┘

각 Coordinator
→ 자신의 View 기준 Direction 제공
```

---

# 🎯 선택 가이드

## 일반 Selfie / Video Call

```text
Virtual Front Camera
```

이유:

- 자동 open/close switch
- 구현 단순
- 공통 1080p / 60fps로 충분한 경우가 많음

## 최고 화질 Front Capture

```text
Outer Ultra Wide Camera
+
Direction Coordinator
```

이유:

- 최대 4K / 120fps

## Depth 필요

```text
Individual Camera
```

Virtual Front Camera는 depth를 제공하지 않는다.

## 두 Display 동시 Camera UX

```text
SceneAccessories
+
Display별 Direction Coordinator
```

## Device 형태 변화에 민감한 Camera App

```text
Individual Camera
+
Direction Coordinator
+
Rotation Coordinator
```

---

# 핵심 메시지

iPhone Duo의 camera architecture에서 가장 중요한 변화는 **“front camera”와 “사용자를 향하는 camera”가 더 이상 같은 개념이 아니라는 점**이다.

기존 slab형 iPhone에서는 `AVCaptureDevice.position == .front`만으로도 대부분 올바른 UX를 만들 수 있었다.

하지만 iPhone Duo에서는 device를 열고 닫고, 펼친 상태에서 뒤집고, app scene을 outer/inner display로 옮기거나 두 display를 동시에 사용하면서 camera의 실제 facing direction이 계속 달라진다.

Apple은 이를 두 단계로 해결한다.

첫째, 단순한 앱에는 **Virtual Front Camera**를 제공한다.

```text
Open
→ Inner Camera

Closed
→ Outer Camera
```

시스템이 자동으로 전환하므로 대부분의 앱은 새로운 hardware topology를 직접 관리하지 않아도 된다.

둘째, 4K·120fps·depth처럼 physical camera의 전체 기능이 필요한 앱에는 `AVCaptureDeviceDirectionCoordinator`를 제공한다.

Coordinator는 fixed front/back position이 아니라 **현재 앱의 UIView를 기준으로 어떤 camera가 forward-facing인지** 알려준다.

그 결과 앱은 device open/close나 display 이동 시:

```text
Camera Direction 변화
        ↓
Capture Session 재구성
        ↓
Mirroring 결정
        ↓
UI 갱신
```

이라는 일관된 workflow를 구축할 수 있다.

Dual-display 앱에서는 각 display의 view에 별도 coordinator를 둔다. Coordinator가 view-relative라는 점 때문에 같은 rear camera도 outer display에서는 forward-facing이고 inner display에서는 backward-facing으로 판단될 수 있다.

Preview 쪽에서는 `videoGravity`와 square sensor 기반 `dynamicAspectRatio`를 사용해 iPhone Duo의 넓은 display 공간을 활용하고, `AVCaptureDeviceRotationCoordinator`로 display 이동 후에도 preview와 photo가 upright 상태를 유지하게 한다.

결국 iPhone Duo용 camera app의 설계 기준은 다음처럼 정리할 수 있다.

```text
단순한 Camera Switching
→ Virtual Front Camera

Physical Camera Capability 필요
→ Individual Camera
→ Direction Coordinator

Dual-display Camera UX
→ SceneAccessories
→ View별 Direction Coordinator

Preview 품질
→ videoGravity + dynamicAspectRatio

Rotation 일관성
→ Rotation Coordinator
```

즉 새로운 camera API의 핵심은 **folding hardware 상태 자체를 앱에서 추측하게 하지 않고, 앱의 현재 UI와 사용자를 기준으로 camera의 의미를 다시 정의해 주는 것**이다.

---

# 함께 보면 좋은 세션과 자료

- Leverage multiple displays and scenes on iPhone Duo — Tech Talk 111464
- Support the Center Stage front camera in your iOS app — WWDC26
- Choosing a Camera by the Direction it Faces
- Supporting Device Rotation in Your Camera App
- AVFoundation Documentation
