# WWDC26 Explore enhancements to visionOS object tracking 요약

- Session: 283
- Title: Explore enhancements to visionOS object tracking
- Source: https://developer.apple.com/videos/play/wwdc2026/283/
- Topic: visionOS, ARKit, Object Tracking, Spatial Accessories, Create ML, RealityKit, GameController
- Chapters: Introduction, Object tracking, Spatial accessories, Creating a spatial accessory, Plug-and-play accessories, Implementing in your app, Next steps

---

## 한 줄 요약

visionOS 27의 object tracking은 **handheld object를 위한 high-frame-rate tracking, Create ML의 extended training, display correction을 제거한 metric-space pose, iOS 27 지원**으로 확장되며, spatial accessory는 **LED constellation + IMU + Bluetooth + 버튼·햅틱**을 갖춘 직접 제작 가능한 하드웨어로 확장되어 초저지연·고주사율 tracking과 물리적 입력을 하나의 ARKit workflow로 제공한다.

---

## 핵심 요약

### Object Tracking

- **High frame rate tracking**
  - 움직이는 물체, 특히 handheld object tracking 강화
  - reference object별 runtime opt-in
- **Extended training mode**
  - Create ML의 새 학습 모드
  - accuracy와 robustness 향상
  - high-frame-rate tracking과 함께 사용 권장
  - standard mode보다 학습 시간이 훨씬 길어짐
- **Metric-space pose**
  - 기본 rendered pose는 display correction이 적용됨
  - `.none` correction을 사용하면 보정 없는 metric-space transform 획득
  - spatial measurement에 적합
- **iOS 27 Object Tracking**
  - 같은 reference object 파일을 iOS와 visionOS에서 공유
  - stationary object와 moving object를 각각 detection/tracking object로 구성

### Spatial Accessories

visionOS 27에서는 third-party developer와 hardware maker가 직접 spatial accessory를 만들 수 있다.

필수 구성:

- LED constellation
- IMU
- Bluetooth
- 선택 사항: button, touchpad, haptics 등

장점:

- Full display rate 수준의 높은 tracking frequency
- Low latency
- 빠른 움직임에 적합
- 일시적 occlusion에서도 tracking 유지
- 낮은 조도에서도 더 robust
- 버튼과 햅틱으로 physical interaction 확장

---

# 🧭 visionOS의 Object Tracking

Object tracking은 실제 물체를 ARKit anchor로 변환하는 기능이다.

```text
실물 Object
      ↓
Photorealistic USDZ
      ↓
Create ML Object Tracking Training
      ↓
.referenceobject
      ↓
ARKit Object Tracking
      ↓
Position + Orientation
      ↓
RealityKit / App Behavior
```

visionOS 2.0부터 앱은 reference object를 이용해 실제 object의 pose를 얻고 virtual content를 정확히 정렬할 수 있다.

---

# 🧪 Reference Object Training

추적할 물체의 USDZ model을 준비하고 Create ML의 Object Tracking template에서 학습한다.

```text
flashlight.usdz
      ↓
Create ML
      ↓
flashlight.referenceobject
```

이 reference object를 ARKit session에 전달해 실제 물체를 인식하고 추적한다.

---

# 🚀 High Frame Rate Tracking

visionOS 27에서는 moving object와 handheld item을 더 정확히 추적하기 위한 high-frame-rate tracking이 추가된다.

예:

- Medical probe
- Flashlight
- Handheld tool
- Assembly guide object
- Remodeling measurement tool

`ReferenceObject.Configuration`에서 reference object별로 활성화한다.

```swift
var configuration = ReferenceObject.Configuration()
configuration.highFrameRateTrackingEnabled = true

let refObjURL = Bundle.main.url(
    forResource: "flashlight",
    withExtension: ".referenceobject"
)

let refObject = try? await ReferenceObject(
    from: refObjURL!,
    configuration: configuration
)
```

중요한 점은 high-frame-rate tracking이 **training option이 아니라 runtime configuration**이라는 것이다. 이미 만들어진 reference object에도 적용할 수 있다.

---

# 🧠 Create ML Extended Training

Create ML Object Tracking template에는 새 training mode가 추가된다.

```text
Standard
Extended
```

Extended mode:

- Tracking accuracy 증가
- Robustness 증가
- Handheld object에 더 적합
- High-frame-rate tracking과 함께 사용 권장
- Standard보다 학습 시간이 상당히 길어짐

CLI에서도 설정할 수 있다.

```bash
xrun createml objecttracker \
    --source flashlight.usdz \
    --output flashlight.referenceobject \
    --training-mode extended \
    --all-angles
```

CLI를 사용하면 remote Mac, automation, batch training workflow에도 연결할 수 있다.

---

# 📐 Rendered Pose와 Metric-space Pose

기본 object anchor transform은 mixed immersion에서 virtual content가 real object와 시각적으로 잘 맞도록 보정된다.

```text
Physical Object Pose
      ↓
Display Correction
      ↓
Rendered Pose
```

Visual overlay에는 좋지만 spatial measurement에서는 절대 world coordinate 정확도에 영향을 줄 수 있다.

visionOS 27의 coordinate-space correction API:

```swift
let renderingPose =
    myObjectAnchor.coordinateSpace(
        correction: .rendered
    )

let metricPose =
    myObjectAnchor.coordinateSpace(
        correction: .none
    )
```

## `.rendered`

적합:

- Visual overlay
- Digital replacement
- Mixed immersion alignment

## `.none`

적합:

- Physical measurement
- Object-to-object distance
- Calibration
- Real-world coordinate calculation

---

# 🩺 Medical Probe 예

세션에서는 handheld medical probe로 physical spine model의 vertebrae 사이 거리를 측정한다.

```text
High-frame-rate tracking
        +
Extended training
        +
Metric-space pose
```

활용 가능 영역:

- Surgical training
- Home remodeling
- Guided assembly
- Inspection
- Calibration

---

# 🔦 Flashlight Demo와 Marker Strategy

Photorealistic flashlight model을 reference object로 사용하면 RealityKit의 Physical Surroundings Light와 결합해 physical flashlight 방향에 따라 공간 lighting을 실시간으로 바꿀 수 있다.

손이 일부를 가려도 tracking이 유지된다.

Photorealistic 3D model을 구할 수 없다면 별도의 marker를 3D print해 물체에 부착할 수도 있다.

```text
3D Printed Marker
      ↓
Reference Object Training
      ↓
Marker를 실제 Tool에 장착
      ↓
Tool Tracking
```

---

# 📱 iOS 27 Object Tracking

Reference object training은 platform specific이 아니다.

한 번 만든 `.referenceobject` 파일을 iOS와 visionOS에서 모두 사용할 수 있다.

`ARWorldTrackingConfiguration`에서 두 종류로 나눈다.

```text
detectionObjects
→ Mostly stationary
→ Low frame rate

trackingObjects
→ Moving object
→ High frame rate
```

예:

```swift
import ARKit
import RealityKit

class ObjectTrackingARSessionDelegate:
    NSObject,
    ARSessionDelegate {

    let arView = ARView(frame: .zero)
    var entities: [UUID: AnchorEntity] = [:]

    func start() throws {
        let stationaryObject = try ARReferenceObject(
            archiveURL: Bundle.main.url(
                forResource: "stationary",
                withExtension: "referenceobject"
            )!
        )

        let movingObject = try ARReferenceObject(
            archiveURL: Bundle.main.url(
                forResource: "moving",
                withExtension: "referenceobject"
            )!
        )

        let configuration = ARWorldTrackingConfiguration()
        configuration.detectionObjects = [stationaryObject]
        configuration.trackingObjects = [movingObject]

        arView.session.delegate = self
        arView.session.run(configuration)
    }
}
```

Lifecycle:

- `didAdd`: `ARObjectAnchor` 인식 시 entity 생성
- `didUpdate`: 최신 pose와 `isTracked` 상태 갱신
- `didRemove`: scene과 local mapping에서 cleanup

---

# 🎮 Spatial Accessory란?

Spatial accessory는 Apple Vision Pro와 통신하고 Vision Pro가 실제 공간에서 위치와 방향을 추적하는 electronic physical device다.

```text
Spatial Accessory
├─ LED constellation
├─ IMU
├─ Bluetooth
├─ Optional Buttons
├─ Optional Touchpad
└─ Optional Haptics
```

---

# 💡 LED Constellation

Vision Pro는 accessory의 LED pattern을 이용해 위치를 추적한다.

좋은 설계:

- 여러 angle에서 unique pattern
- LED 간 충분한 구분
- 사용자의 손으로 가려지지 않는 위치
- symmetry를 피한 distinct geometry

Handheld device에서는 grip 영역을 피해서 LED를 배치하는 것이 중요하다.

---

# 🧭 IMU와 Bluetooth

IMU는 다음을 측정한다.

- Orientation
- Acceleration
- Motion

LED와 IMU는 board에 rigid하게 고정해야 한다.

Bluetooth는 tracking 관련 signal과 함께 button, touchpad, haptics 같은 input/output을 Vision Pro로 전달한다.

---

# ⚡ Spatial Accessory의 장점

세션에서 강조한 특성:

- Full display rate 수준의 tracking
- Low latency
- Fast motion에 적합
- Temporary occlusion에도 robust
- Lower-light condition에서도 tracking
- Physical button / haptic 지원

예:

- Racing simulator
- Flight simulator
- Vehicle interior design
- Specialized controller
- Training hardware

---

# 🔦 Spatial Accessory Flashlight Demo

Flashlight 안에 LED, IMU, Bluetooth, physical button을 내장한다.

빠르게 흔들어도 digital beam이 부드럽게 따라오고, physical button으로 digital light를 on/off할 수 있다.

```text
IMU
→ Low-latency motion

LED
→ Vision-based pose tracking

Bluetooth
→ Input / device communication
```

---

# 🏎️ Steering Wheel Example

Spatial accessory를 physical steering wheel에 장착하면 Vision Pro가 accessory를 기준으로 full-scale digital vehicle을 정렬할 수 있다.

사용자는 실제 steering wheel을 잡으면서 digital cockpit 안에 있는 것 같은 physical feedback을 얻는다.

---

# 🧰 Custom Accessory 설계 원칙

## LED Pattern

- 여러 viewing angle에서 distinct
- 충분히 분산
- hand grip과 겹치지 않게 배치

## Rigidity

LED와 IMU의 상대 위치가 바뀌면 tracking model과 실제 sensor geometry가 달라진다.

## Ergonomics

Handheld accessory:

- Battery 크기/위치
- 무게 중심
- Grip
- LED visibility

## Large Accessory

Arm's reach 밖에서 사용하는 큰 accessory:

- LED 개수
- LED 크기
- LED spacing

멀리서도 pattern이 명확해야 한다.

---

# 🧪 ARKit Accessory Tracking Debug View

Accessory를 Vision Pro에 Bluetooth로 연결한 뒤 Developer Mode의 ARKit accessory tracking debug view에서 검증할 수 있다.

세 가지 주요 기능:

## 1. LED 검증

Vision Pro IR camera로 확인:

- Brightness
- Distinctness
- Synchronization

## 2. IMU 검증

Live metrics:

- Frequency
- Latency
- Per-axis values
- Scale
- Alignment
- Motion response

## 3. Timing Debug

Vision Pro IR illuminator를 synchronization reference로 이용해 accessory와 headset 사이 timing을 분석한다.

---

# 🧠 Reference Accessory Training

Spatial accessory는 object appearance뿐 아니라 LED와 IMU geometry도 학습에 포함한다.

```text
Photorealistic Device USDZ
        +
LED Positions
        +
IMU Position
        ↓
Annotated USDZ
        ↓
CLI Training
        ↓
.referenceaccessory
```

---

# 📤 Manufacturer와 Third-party App의 UTType

## Accessory Manufacturer

Reference accessory file을 app에 bundle하고 `Info.plist`에 exported UTType으로 선언한다.

```text
Manufacturer App
      ↓
Exported UTType
      ↓
System-wide Accessory Registration
      ↓
다른 visionOS App도 사용 가능
```

## Third-party App Developer

외부 제조사의 accessory를 사용하는 앱은 reference accessory bundle을 직접 포함하고 imported type으로 선언할 수 있다.

이렇게 하면 manufacturer app에 의존하지 않고 독립적으로 동작할 수 있다.

---

# 🔌 Plug-and-play Accessories

Hardware를 처음부터 직접 만들지 않아도 된다.

세션은 DFRobot과 MIKROE가 off-the-shelf reference hardware와 development kit을 출시할 예정이라고 소개한다.

활용:

- Testing
- Prototyping
- visionOS app development

세션의 seeMote Cap처럼 tracking module을 기존 물체에 장착해 빠르게 spatial accessory prototype을 만들 수 있다.

---

# 🎮 `GCSpatialAccessory`

App에서는 새 `GCSpatialAccessory` class로 accessory를 검색한다.

```swift
import ARKit
import GameController

if let device =
    GCSpatialAccessory
        .spatialAccessories
        .first {

    let accessory =
        try await Accessory(
            device: device
        )

    let provider =
        AccessoryTrackingProvider(
            accessories: [accessory]
        )

    try await arkitSession.run(
        [provider]
    )
}
```

`Accessory(device:)`를 호출하면 ARKit이 대응되는 `.referenceaccessory` bundle을 자동으로 resolve한다.

---

# 🔄 `updateAccessories`

visionOS 27에서는 session을 재시작하지 않고 추적할 accessory를 교체할 수 있다.

```swift
try await provider.updateAccessories(
    [newAccessory]
)
```

장점:

- Tracking interruption 감소
- Hot swap
- Multiple-accessory workflow
- 사용자 device 교체 UX 개선

---

# 🧭 네 가지 Tracking 접근법

| 방식 | 장점 | 적합한 상황 |
|---|---|---|
| Object tracking + 3D model | 정밀 tracking, 별도 electronics 불필요 | Measurement, known physical object |
| Marker-based object tracking | Model 없어도 구현 가능 | Existing tool, prototype |
| Off-the-shelf spatial accessory | 저지연·고주사율, 빠른 prototyping | App development, testing |
| Custom spatial accessory | 버튼·햅틱·custom form factor | Simulator, specialized input |

---

# 🧩 주요 API / Tool

| API / Tool | 역할 |
|---|---|
| `ReferenceObject.Configuration` | Reference object별 tracking 설정 |
| `highFrameRateTrackingEnabled` | Moving object용 고주사율 tracking |
| Create ML Extended Training | Object tracking robustness 향상 |
| `coordinateSpace(correction:)` | Rendered / metric-space pose 선택 |
| `.rendered` | Display correction이 적용된 visual alignment pose |
| `.none` | Display correction 없는 metric-space pose |
| `ARWorldTrackingConfiguration.detectionObjects` | Stationary object detection |
| `ARWorldTrackingConfiguration.trackingObjects` | Moving object high-rate tracking |
| `GCSpatialAccessory` | Generic spatial accessory discovery |
| `Accessory(device:)` | Reference accessory 자동 resolve |
| `AccessoryTrackingProvider` | Spatial accessory tracking provider |
| `updateAccessories` | Session 재시작 없이 accessory 교체 |
| ARKit Accessory Tracking Debug View | LED/IMU/timing validation |
| `.referenceobject` | Object tracking reference asset |
| `.referenceaccessory` | Spatial accessory reference bundle |

---

# 🔁 Object Tracking Workflow

```text
USDZ 확보
      ↓
Create ML Training
      ↓
.referenceobject
      ↓
Optional Extended Training
      ↓
Optional High Frame Rate
      ↓
ARKit Session
      ↓
Object Anchor
      ↓
Rendered or Metric-space Pose
      ↓
RealityKit / App Logic
```

---

# 🔁 Custom Spatial Accessory Workflow

```text
Accessory Concept
      ↓
LED + IMU + Bluetooth 설계
      ↓
Buttons / Haptics 추가
      ↓
Hardware 제작
      ↓
Bluetooth 연결
      ↓
ARKit Debug View 검증
      ↓
Annotated USDZ
      ↓
Reference Accessory Training
      ↓
.referenceaccessory
      ↓
UTType 등록
      ↓
GCSpatialAccessory Discovery
      ↓
AccessoryTrackingProvider
      ↓
App Experience
```

---

# 📋 체크리스트

## Object Tracking

- [ ] 추적할 real-world object 정의
- [ ] Photorealistic USDZ 확보
- [ ] Create ML Object Tracking template 사용
- [ ] `.referenceobject` 생성
- [ ] visionOS / iOS 재사용 여부 검토
- [ ] Moving object라면 high-frame-rate tracking 검토
- [ ] Handheld use case라면 extended training 검토

## Coordinate Space

- [ ] Visual alignment가 목적이면 `.rendered`
- [ ] Physical measurement가 목적이면 `.none`
- [ ] 실제 measurement error 검증
- [ ] Object-to-object distance calculation 테스트

## iOS

- [ ] iOS 27 deployment target 확인
- [ ] Stationary object는 `detectionObjects`
- [ ] Moving object는 `trackingObjects`
- [ ] `ARSessionDelegate` lifecycle 구현
- [ ] `didAdd` / `didUpdate` / `didRemove` cleanup 검증

## Marker Tracking

- [ ] Photorealistic model 확보가 어려운지 확인
- [ ] 3D printable marker 제작 검토
- [ ] Marker mounting transform 고정
- [ ] Marker 자체를 reference object로 학습

## Spatial Accessory Hardware

- [ ] Unique LED constellation 설계
- [ ] IMU 선택
- [ ] Bluetooth chipset 선택
- [ ] LED와 IMU rigid mounting
- [ ] 여러 angle에서 LED visibility 확인
- [ ] Hand grip과 LED overlap 방지
- [ ] Battery, 무게, ergonomics 검토
- [ ] Large accessory라면 LED size/spacing 검토

## Debugging

- [ ] Vision Pro Developer Mode 활성화
- [ ] Bluetooth pairing 확인
- [ ] Debug View에서 LED brightness/distinctness 확인
- [ ] IMU frequency / latency 확인
- [ ] Per-axis alignment 검증
- [ ] IR illuminator 기반 timing debug

## Reference Accessory

- [ ] Photorealistic USDZ 생성
- [ ] LED position annotation
- [ ] IMU position annotation
- [ ] `.referenceaccessory` 생성
- [ ] Manufacturer는 exported UTType
- [ ] Third-party app은 imported UTType

## App Integration

- [ ] `GCSpatialAccessory.spatialAccessories` discovery
- [ ] `Accessory(device:)` 사용
- [ ] Reference bundle 자동 resolution 확인
- [ ] `AccessoryTrackingProvider` 생성
- [ ] ARKitSession에 provider 실행
- [ ] `updateAccessories`로 hot swap 테스트

---

# ⚠️ 구현 시 주의할 점

## High-frame-rate Tracking과 Extended Training은 다르다

High-frame-rate tracking은 runtime configuration이고, extended training은 Create ML training 설정이다. 서로 대체하지 않는다.

## Rendered Pose와 Metric Pose를 구분한다

Rendered pose는 visual alignment에 최적화되고, measurement에는 `.none`이 적합하다.

## Spatial Accessory는 Object Tracking의 단순 상위 기능이 아니다

Object tracking은 electronics 없이 existing object를 추적하는 데 강점이 있다. Spatial accessory는 dedicated hardware가 필요하지만 더 낮은 latency와 더 높은 tracking frequency, physical input/output을 제공한다.

## LED는 많기만 해서는 안 된다

여러 viewing angle에서 unique하고 distinct한 geometry를 만드는 것이 중요하다.

---

# 🎯 선택 기준

## 정밀한 Measurement

```text
Object Tracking
+
Extended Training
+
High Frame Rate
+
Metric Pose
```

## 기존 Object의 빠른 Prototype

```text
Mounted Marker
+
Object Tracking
```

## 빠른 Motion Tracking

```text
Spatial Accessory
```

## Physical Button / Haptics까지 필요

```text
Custom Spatial Accessory
```

---

# 핵심 메시지

visionOS 27의 object tracking은 단순히 물체를 인식해 virtual content를 붙이는 기능에서 더 나아가 **움직이는 physical tool을 빠르고 정밀하게 추적하고, 실제 metric coordinate를 이용해 측정하며, 같은 reference object를 iOS에서도 사용할 수 있는 범용 spatial tracking 기술**로 확장된다.

High-frame-rate tracking은 handheld object의 빠른 움직임을 더 잘 따라가고, Create ML의 extended training은 accuracy와 robustness를 높인다.

새 coordinate-space correction API는 visual alignment를 위한 `.rendered` pose와 실제 physical measurement를 위한 `.none` pose를 구분하게 한다.

동시에 visionOS 27에서는 spatial accessory 생태계가 third-party hardware maker에게 열렸다.

LED constellation, IMU, Bluetooth를 이용하면 Vision Pro가 accessory를 full display rate 수준으로 낮은 latency에서 추적할 수 있고, 버튼이나 햅틱을 추가하면 물리적 input device 자체가 spatial interface가 된다.

결국 선택 기준은 다음처럼 명확하다.

```text
정밀한 Existing Object Tracking
        → Object Tracking

빠른 Handheld Object
        → High Frame Rate + Extended Training

Absolute Measurement
        → Metric-space Pose

최고의 Refresh Rate + Physical Input
        → Spatial Accessory

Custom Buttons / Haptics / Form Factor
        → Custom Spatial Accessory
```

이 업데이트는 surgical training, remodeling, guided assembly 같은 전문적인 spatial measurement부터 racing·flight simulation과 physical controller 기반 immersive experience까지, **실물과 디지털 world를 연결하는 방식 자체를 훨씬 넓혀준다.**

---

# 함께 보면 좋은 세션과 자료

- Explore object tracking for visionOS — WWDC24
- Explore spatial accessory input on visionOS — WWDC25
- Implementing object tracking in your app
- Working with generic spatial accessories
- Preparing spatial accessories for tracking in your visionOS app
- Spatial accessory design guidelines for Apple devices
- Exploring object tracking with ARKit sample
