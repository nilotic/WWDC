# WWDC26 Find your accessory with Bluetooth Channel Sounding 요약

- Session: 369
- Title: Find your accessory with Bluetooth Channel Sounding
- Source: https://developer.apple.com/videos/play/wwdc2026/369/
- Topic: Bluetooth Channel Sounding, Core Bluetooth, Nearby Interaction, AccessorySetupKit, Direction Finding, Bluetooth 6.3
- Chapters: Introduction, Overview, Core Bluetooth API, Nearby Interaction API, Hardware tips

---

## 한 줄 요약

Bluetooth Channel Sounding은 기존 RSSI처럼 신호 세기를 근거로 거리를 **추정**하는 방식이 아니라, iPhone과 Bluetooth 액세서리 사이에서 2.4GHz 여러 채널의 phase 변화를 측정해 **실제 거리를 계산**하는 기술이며, iOS 27에서는 Core Bluetooth로 거리만 얻거나 Nearby Interaction과 카메라 입력을 결합해 거리와 방향을 함께 제공할 수 있다.

---

## 핵심 요약

이번 세션은 Bluetooth 전용 액세서리에서도 UWB 없이 더 정밀한 근거리 탐색 경험을 만들 수 있는 **Bluetooth Channel Sounding**을 소개한다.

핵심은 다음과 같다.

- **Core Bluetooth**
  - 거리만 필요할 때 가장 단순한 방법
  - `CBCentralManager.supportsFeatures(.channelSounding)`으로 기기 지원 여부 확인
  - 연결된 `CBPeripheral`에서 `startChannelSoundingSession` 시작
  - 각 procedure가 끝날 때 delegate callback으로 meter 단위 거리 수신
  - 종료 시 `cancelChannelSoundingSession`

- **Nearby Interaction**
  - 거리뿐 아니라 방향까지 필요한 경우 사용
  - `NISession.deviceCapabilities.supportsBluetoothChannelSounding` 확인
  - `NINearbyAccessoryConfiguration`에 Core Bluetooth의 `peripheral.identifier` 전달
  - 방향을 얻으려면 Camera Assistance 활성화 필요
  - 액세서리가 움직이는지 정지 상태인지 앱이 알 수 있다면 `updateMotionState`로 전달
  - 결과는 UWB 사용 때와 동일한 `NINearbyObject` 형태로 수신

- **시스템 동작**
  - iOS가 raw Channel Sounding 결과와 camera input을 fusion
  - Outlier filtering과 smoothing을 자동 적용
  - 거리와 방향은 optional
  - iOS 27에서는 foreground에서만 사용
  - background로 가면 session pause
  - Bluetooth/Wi-Fi traffic이 많아지면 측정 빈도가 줄 수 있음

- **하드웨어 요구사항**
  - Bluetooth 6.3
  - inline PCT 필수
  - Phase-based ranging을 위해 mode 0, mode 2 지원
  - `T_FCS` 최소 100µs 지원
  - iPhone 측은 N1 chip 지원 기기에서 사용 가능

---

# 📍 왜 Channel Sounding이 필요한가

세션은 여러 Bluetooth 온도계를 사용하는 상황으로 시작한다.

예를 들어 집 안 오븐과 뒷마당 smoker에 각각 Bluetooth thermometer를 두었다고 하자.

```text
Thermometer A
→ Indoor oven

Thermometer B
→ Backyard smoker
```

어느 probe가 목표 온도에 도달했다는 알림이 와도 이름이나 RSSI만으로는 어떤 probe인지 직관적으로 알기 어려울 수 있다.

Channel Sounding을 사용하면 앱이 다음처럼 알려줄 수 있다.

```text
Probe is 8 meters to your right
```

즉 단순히 “가까움/멀음”이 아니라 **실제 거리와 방향**을 이용해 물리적인 위치를 안내할 수 있다.

---

# 📶 RSSI와 Channel Sounding의 차이

기존 Bluetooth 앱에서는 RSSI를 이용해 거리를 대략적으로 추정하는 경우가 많았다.

RSSI 기반 접근:

```text
Received Signal Strength
      ↓
Path-loss 가정
      ↓
거리 추정
```

문제:

- 벽
- 사람
- 물체
- 반사
- 안테나 방향
- 주변 RF 환경

에 따라 signal strength가 크게 변한다.

따라서 RSSI는 실제 거리와 1:1 대응하지 않는다.

Channel Sounding은 다른 접근을 사용한다.

```text
2.4GHz Channel별 Tone
      ↓
Phase 변화 측정
      ↓
거리 계산
```

Apple은 이를 “estimate distance”가 아니라 **measure distance**할 수 있는 방식으로 설명한다.

---

# 📡 UWB와 Bluetooth Channel Sounding

Third-party accessory와 거리·방향을 측정하는 대표 선택지는 두 가지다.

## UWB

가장 높은 accuracy가 필요하다면 accessory에 Ultra Wideband chipset을 추가하고 Nearby Interaction을 사용한다.

적합:

- 매우 높은 정밀도
- UWB hardware를 넣을 수 있음
- 위치/방향이 제품 핵심 기능

## Bluetooth Channel Sounding

Accessory가 Bluetooth chipset만 사용하는 경우 더 현실적인 선택이다.

적합:

- Bluetooth-only accessory
- RSSI보다 더 나은 거리 정확도 필요
- Hardware BOM을 UWB까지 늘리고 싶지 않음

---

# 🧭 Channel Sounding의 기본 역할

세션에서는 iPhone과 accessory의 역할을 다음처럼 정의한다.

```text
iPhone
= Initiator

Accessory
= Reflector
```

Initiator가 signal 또는 tone을 보내면 reflector가 이를 반사한다.

```text
iPhone
  ↓ Tone
Accessory
  ↑ Reflected Tone
iPhone
```

iPhone은 왕복 과정에서 signal이 어떻게 변했는지 측정한다.

---

# 🌐 여러 Bluetooth Channel을 사용하는 이유

한 채널만 측정하지 않는다.

2.4GHz band의 여러 channel에 걸쳐 같은 과정을 반복한다.

```text
Channel 1 → Phase observation
Channel 2 → Phase observation
Channel 3 → Phase observation
...
```

iPhone은 channel이 변할 때 reflected tone의 변화율을 관찰해 initiator와 reflector 사이 거리를 계산한다.

이 하나의 거리 측정 단위를 Apple은 **procedure**라고 부른다.

---

# 🔁 Channel Sounding Procedure

개념적인 흐름:

```text
Session 시작
    ↓
Procedure 1
    ↓
Distance Result
    ↓
Procedure 2
    ↓
Distance Result
    ↓
Procedure 3
    ↓
Distance Result
    ↓
...
```

iOS가 session 동안 여러 procedure를 반복 실행한다.

---

# 🧰 사전 준비: AccessorySetupKit + Core Bluetooth

Channel Sounding을 시작하기 전에 accessory가 iPhone과 정상적으로 설정되어 있어야 한다.

Apple 권장 흐름:

```text
AccessorySetupKit
      ↓
Accessory Pairing / Setup
      ↓
Core Bluetooth Connection
      ↓
Channel Sounding
```

즉 Channel Sounding이 pairing과 연결 과정을 대체하는 것이 아니다.

기존 Bluetooth accessory lifecycle 위에 ranging 기능을 추가하는 구조다.

---

# 📏 Core Bluetooth로 거리만 얻기

거리만 필요하다면 Core Bluetooth가 가장 간단하다.

---

# ✅ Local Device 지원 여부 확인

먼저 현재 iOS device가 Channel Sounding을 지원하는지 확인한다.

```swift
import CoreBluetooth

func isChannelSoundingSupported() -> Bool {
    guard centralManager.state == .poweredOn else {
        return false
    }

    if #available(iOS 27.0, *) {
        return CBCentralManager.supportsFeatures(
            .channelSounding
        )
    }

    return false
}
```

중요:

- Bluetooth powered on 상태 확인
- iOS 27 availability 확인
- `.channelSounding` feature support 확인

---

# ▶️ Core Bluetooth Session 시작

Connected `CBPeripheral`이 있어야 한다.

```swift
func startChannelSounding(
    _ peripheral: CBPeripheral
) {
    guard peripheral.isConnected else {
        return
    }

    if #available(iOS 27.0, *) {
        let configuration =
            CBChannelSoundingSessionConfiguration(
                role: .initiator
            )

        peripheral.startChannelSoundingSession(
            configuration
        )
    }
}
```

iPhone이 initiator 역할이므로 configuration role은 `.initiator`다.

---

# 📥 거리 결과 받기

각 Channel Sounding procedure가 끝날 때 delegate callback이 호출된다.

```swift
func peripheral(
    _ peripheral: CBPeripheral,
    didReceive results:
        CBChannelSoundingProcedureResults?,
    error: Error?
) {
    guard let results else {
        return
    }

    let distance = results.distance

    // meter 단위 distance 사용
}
```

`distance`는 meter 단위다.

앱에서는 이 값을 다음에 사용할 수 있다.

- Accessory finder
- Proximity UI
- Distance label
- Threshold-based action
- Nearby device ranking

---

# ⏹️ Core Bluetooth Session 종료

더 이상 ranging이 필요하지 않으면 cancel한다.

```swift
func cancelChannelSounding(
    _ peripheral: CBPeripheral,
    configuration:
        CBChannelSoundingSessionConfiguration
) {
    guard peripheral.isConnected else {
        return
    }

    if #available(iOS 27.0, *) {
        peripheral.cancelChannelSoundingSession(
            configuration
        )
    }
}
```

Session 종료 callback:

```swift
func peripheral(
    _ peripheral: CBPeripheral,
    didCompleteChannelSoundingSession error: Error?
) {
    // Session complete
}
```

---

# 🧭 거리와 방향이 모두 필요하면 Nearby Interaction

Core Bluetooth Channel Sounding은 거리만 제공한다.

사용자가 accessory가 **어느 방향에 있는지**까지 알아야 한다면 Nearby Interaction을 사용한다.

예:

```text
8 meters away
        ↓
8 meters to your right
```

---

# ✅ Nearby Interaction 지원 확인

```swift
import NearbyInteraction

if #available(iOS 27.0, *) {
    guard NISession.deviceCapabilities
        .supportsBluetoothChannelSounding
    else {
        return
    }
}
```

Core Bluetooth의 feature check와는 별도다.

---

# 🔗 Core Bluetooth Identifier 연결

Nearby Interaction configuration은 이미 연결된 `CBPeripheral`의 identifier를 사용한다.

```swift
let config = NINearbyAccessoryConfiguration(
    bluetoothChannelSoundingIdentifier:
        peripheral.identifier,
    previousChannelSoundingIdentifier: nil
)
```

즉 두 framework가 다음 값으로 연결된다.

```text
Core Bluetooth
CBPeripheral.identifier
       ↓
Nearby Interaction
bluetoothChannelSoundingIdentifier
```

---

# 📷 Direction을 위해 Camera Assistance 활성화

방향을 얻으려면 Camera Assistance가 필요하다.

```swift
if NISession.deviceCapabilities
    .supportsCameraAssistance {

    config.isCameraAssistanceEnabled = true
}
```

즉 Channel Sounding으로 얻은 RF 측정만으로 방향을 계산하는 것이 아니라 camera input까지 fusion한다.

---

# ▶️ NISession 실행

```swift
let session = NISession()
session.delegate = self
session.run(config)
```

기존 UWB Nearby Interaction workflow와 매우 유사하다.

이것이 중요한 이유:

> 이미 Nearby Interaction을 사용하고 있는 앱은 Bluetooth Channel Sounding accessory도 비슷한 delegate model로 통합할 수 있다.

---

# 🏃 Accessory Motion State

앱이 accessory가 움직이는지 정지 상태인지 알고 있다면 Nearby Interaction에 알려줄 수 있다.

```swift
func updateAccessoryMotionState(
    _ isMoving: Bool,
    object: NINearbyObject
) {
    let motionState: NIMotionActivityState =
        isMoving ? .moving : .stationary

    session.updateMotionState(
        motionState,
        forObjectWithToken:
            object.discoveryToken
    )
}
```

---

# 🧱 `.stationary`

예:

```text
Wall-mounted tag
Fixed appliance
Stationary sensor
```

정지 상태라는 정보를 주면 direction estimate가 더 안정적으로 계산될 수 있다.

---

# 🚶 `.moving`

예:

```text
Handheld accessory
Moving luggage
Portable sensor
```

움직이는 accessory임을 알려 시스템이 적절한 filtering model을 사용할 수 있게 한다.

---

# 📥 Nearby Interaction 결과

Delegate callback은 UWB Nearby Interaction에서 사용하던 형태와 동일하다.

```swift
func session(
    _ session: NISession,
    didUpdate nearbyObjects: [NINearbyObject]
) {
    guard let object = nearbyObjects.first else {
        return
    }

    if let distance = object.distance {
        // Distance 사용
    }

    if let direction = object.horizontalAngle {
        // Horizontal angle 사용
    }
}
```

얻을 수 있는 핵심 정보:

- Distance
- Horizontal direction / angle

---

# 🧠 Sensor Fusion

Nearby Interaction 경로에서는 결과가 단순 Channel Sounding raw measurement가 아니다.

Apple은 다음을 fusion한다고 설명한다.

```text
Bluetooth Channel Sounding
Raw Measurement
        +
Camera Input
        ↓
Sensor Fusion
        ↓
Distance + Direction
```

거리 자체도 camera input의 도움을 받을 수 있다.

---

# 🧹 Outlier Filtering과 Smoothing

iOS는 결과를 그대로 앱에 내보내지 않는다.

자동으로:

- Outlier 제거
- Result smoothing

을 수행한다.

목표:

> 사람이 accessory를 찾을 때 숫자와 방향 indicator가 지나치게 흔들리지 않는 경험 제공

따라서 앱에서 별도의 aggressive smoothing을 추가하면 오히려 latency를 증가시킬 수 있으므로 실제 결과를 먼저 측정한 뒤 결정하는 것이 좋다.

---

# ⚠️ Distance와 Direction은 Optional

결과는 항상 존재한다고 가정하면 안 된다.

예:

```swift
if let distance = object.distance {
    // 사용 가능
}
```

거리 측정 procedure가 실패하면 `distance == nil`이 될 수 있다.

Direction도 optional이다.

UI는 반드시 missing measurement를 처리해야 한다.

예:

```text
Distance available
→ "4.2 m"

Distance unavailable
→ "Locating…"
```

---

# 📱 Foreground Only — iOS 27

중요한 runtime 제한이다.

> iOS 27에서 Channel Sounding은 앱이 foreground에 있을 때 사용한다.

앱이 background로 이동하면:

```text
Foreground
Channel Sounding Active
      ↓
Background
Session Paused
```

따라서 background continuous ranging을 전제로 기능을 설계하면 안 된다.

---

# 📶 Bluetooth / Wi-Fi Activity와 측정 빈도

Channel Sounding은 2.4GHz radio resource를 사용한다.

다른 Bluetooth 또는 Wi-Fi activity가 증가하면 iOS가 Channel Sounding procedure frequency를 낮출 수 있다.

즉 앱이 받는 measurement update rate는 항상 고정되지 않는다.

다음 상황을 고려해야 한다.

- Busy Wi-Fi transfer
- 여러 Bluetooth peripheral 연결
- Audio streaming
- 주변 RF congestion

UI나 animation을 measurement callback frequency와 직접 1:1 연결하지 않는 것이 좋다.

---

# 📲 지원 iPhone

Apple은 Channel Sounding이 **N1 chip을 탑재한 iPhone**에서 제공된다고 설명한다.

따라서 software version만 확인하는 것으로 충분하지 않다.

반드시 runtime capability API를 사용해야 한다.

---

# 🔧 Accessory Hardware 요구사항

Accessory 측 Bluetooth chipset도 Channel Sounding 조건을 충족해야 한다.

---

# 🟦 Bluetooth 6.3

Accessory는 **Bluetooth 6.3**을 지원해야 한다.

즉 기존 Bluetooth LE chipset이라고 해서 firmware update만으로 항상 대응 가능한 것은 아니다.

제품 설계 단계에서 chipset capability를 확인해야 한다.

---

# 🧩 Inline PCT

`inline PCT` feature가 필수다.

Accessory chipset vendor와 module 선정 시 이 기능 지원 여부를 확인해야 한다.

---

# 📐 Phase-based Ranging

iOS는 phase-based ranging을 사용한다.

따라서 Bluetooth specification의 다음 Channel Sounding mode를 accessory chipset이 지원해야 한다.

- Mode 0
- Mode 2

---

# ⏱️ `T_FCS`

`T_FCS`는 tone 사이의 interspace timing이다.

Apple 요구사항:

```text
T_FCS ≥ 100 µs
```

Accessory가 최소 100 microseconds를 지원해야 한다.

---

# 🧩 Hardware Checklist

```text
Bluetooth 6.3
    +
Inline PCT
    +
Mode 0
    +
Mode 2
    +
T_FCS >= 100µs
```

이 조건이 accessory-side Channel Sounding 구현의 핵심이다.

---

# 🎯 Core Bluetooth vs Nearby Interaction

| 항목 | Core Bluetooth | Nearby Interaction |
|---|---|---|
| Distance | Yes | Yes |
| Direction | No | Yes |
| Camera Assistance | 필요 없음 | Direction에 필요 |
| API 복잡도 | 낮음 | 상대적으로 높음 |
| `CBPeripheral.identifier` | 직접 peripheral 사용 | Configuration 연결에 사용 |
| Motion state hint | 없음 | `.moving` / `.stationary` |
| Result type | `CBChannelSoundingProcedureResults` | `NINearbyObject` |
| UWB workflow와 유사성 | 낮음 | 높음 |
| 적합 | Proximity / ranging | Find-my-accessory UI |

---

# 🧭 어떤 API를 선택할까

## 거리만 필요한 경우

예:

- 1m 안에 들어오면 action
- 가까운 probe 순서 정렬
- Device proximity 표시

선택:

```text
Core Bluetooth
```

## 거리와 방향 모두 필요한 경우

예:

- “오른쪽 8m” 안내
- Finder arrow
- Accessory locating UI

선택:

```text
Nearby Interaction
+
Camera Assistance
```

## 가장 높은 정밀도가 필요한 accessory

Hardware 변경이 가능하다면:

```text
UWB
+
Nearby Interaction
```

---

# 🧩 API 흐름 비교

## Core Bluetooth

```text
AccessorySetupKit
      ↓
Core Bluetooth Connect
      ↓
Feature Support 확인
      ↓
CBChannelSoundingSessionConfiguration
      ↓
startChannelSoundingSession
      ↓
Procedure 반복
      ↓
didReceive results
      ↓
Distance
      ↓
cancelChannelSoundingSession
```

## Nearby Interaction

```text
AccessorySetupKit
      ↓
Core Bluetooth Connect
      ↓
NI Channel Sounding 지원 확인
      ↓
CBPeripheral.identifier
      ↓
NINearbyAccessoryConfiguration
      ↓
Camera Assistance
      ↓
NISession.run
      ↓
Optional Motion State
      ↓
didUpdate nearbyObjects
      ↓
Distance + Direction
```

---

# 🔋 Power 관점에서의 설계

세션 제목과 소개에서는 power consumption 최적화도 중요한 목표로 제시된다.

Channel Sounding은 계속 RF procedure를 실행하는 기능이므로 사용자가 실제로 accessory를 찾는 시점에만 session을 유지하는 것이 자연스럽다.

권장 lifecycle:

```text
Finder 화면 진입
      ↓
Channel Sounding Start
      ↓
Accessory 탐색
      ↓
Finder 화면 종료
      ↓
Cancel Session
```

Foreground 제한과도 잘 맞는 구조다.

---

# 📉 Update Rate를 고정 Frame Rate처럼 사용하지 않기

Bluetooth/Wi-Fi activity에 따라 measurement frequency가 줄 수 있기 때문에 다음 방식은 피하는 것이 좋다.

```text
Measurement Callback
→ UI animation frame 하나
```

대신:

```text
Latest Measurement State
      ↓
UI Rendering Loop
      ↓
Interpolation / Smoothing
```

처럼 측정과 UI update를 분리하는 편이 안정적이다.

---

# 🧪 실패 상태 처리

Distance와 direction이 optional이므로 다음 상태를 명확하게 정의해야 한다.

```text
Searching
Measurement Available
Measurement Temporarily Missing
Session Paused
Disconnected
Unsupported Device
```

Finder UI라면 예를 들어:

| 상태 | UI 예 |
|---|---|
| Searching | “Locating…” |
| Distance only | “4.3 m away” |
| Distance + direction | “4.3 m to your right” |
| Temporary nil | 이전 안정값 유지 또는 locating 표시 |
| Background | 탐색 일시 중지 |
| Disconnected | 재연결 안내 |

---

# 🔄 기존 RSSI 구현에서 Migration

기존 accessory finder가 RSSI 기반이라면 대략 다음 구조일 수 있다.

```text
RSSI
  ↓
Custom Path-loss Formula
  ↓
Estimated Distance
```

Channel Sounding 도입 후:

```text
Channel Sounding
      ↓
Measured Distance
```

따라서 다음 custom logic을 줄일 수 있다.

- RSSI calibration constant
- Device별 path-loss coefficient
- RSSI averaging logic
- Environment-specific threshold tuning

다만 기존 RSSI는 Channel Sounding unsupported device의 fallback으로 남길 수 있다.

---

# 🧠 Capability-driven Architecture

제품 코드에서는 OS version이나 iPhone model name보다 capability check를 기준으로 분기하는 것이 좋다.

```text
Supports NI Bluetooth Channel Sounding?
        │
        ├─ Yes → Distance + Direction
        │
        └─ No
             ↓
Supports Core Bluetooth Channel Sounding?
        │
        ├─ Yes → Distance
        │
        └─ No → RSSI / 기존 fallback
```

---

# 📋 체크리스트

## Accessory Setup

- [ ] AccessorySetupKit으로 pairing/setup flow 구성
- [ ] Core Bluetooth 연결 확인
- [ ] 연결된 `CBPeripheral` 확보
- [ ] `peripheral.identifier` lifecycle 이해
- [ ] Reconnection flow 구현

## Core Bluetooth Channel Sounding

- [ ] iOS 27 availability 확인
- [ ] Bluetooth powered-on 상태 확인
- [ ] `CBCentralManager.supportsFeatures(.channelSounding)` 확인
- [ ] Peripheral connected 여부 확인
- [ ] `CBChannelSoundingSessionConfiguration(role: .initiator)` 생성
- [ ] `startChannelSoundingSession` 호출
- [ ] `didReceive` callback 구현
- [ ] `results.distance` 사용
- [ ] Error와 nil result 처리
- [ ] Finder UI 종료 시 session cancel
- [ ] `didCompleteChannelSoundingSession` 처리

## Nearby Interaction

- [ ] `supportsBluetoothChannelSounding` 확인
- [ ] `CBPeripheral.identifier` 전달
- [ ] `NINearbyAccessoryConfiguration` 생성
- [ ] Direction 필요 시 Camera Assistance 활성화
- [ ] Camera Assistance capability 확인
- [ ] `NISession.delegate` 설정
- [ ] `session.run(config)` 호출
- [ ] `didUpdate nearbyObjects` 구현
- [ ] `object.distance` optional 처리
- [ ] `object.horizontalAngle` optional 처리

## Motion State

- [ ] Accessory가 stationary인지 moving인지 앱이 판단 가능한지 확인
- [ ] Wall-mounted/fixed accessory에는 `.stationary`
- [ ] Portable/handheld accessory에는 `.moving`
- [ ] `discoveryToken`으로 대상 object 지정
- [ ] Motion state 변경 시 업데이트

## Foreground / Lifecycle

- [ ] Foreground에서만 Channel Sounding 사용
- [ ] Background 진입 시 pause되는 동작 고려
- [ ] Foreground 복귀 시 UI state 복구
- [ ] 앱 lifecycle과 session lifecycle 연결
- [ ] 사용자가 finder 화면을 떠날 때 session 종료

## Measurement UX

- [ ] Distance meter 단위 formatting
- [ ] Direction 표현 방식 정의
- [ ] Measurement nil 상태 정의
- [ ] Sudden outlier에 대한 UI behavior 확인
- [ ] iOS built-in smoothing 결과 먼저 평가
- [ ] Measurement frequency 변화에 UI가 흔들리지 않는지 확인
- [ ] Threshold-based action에 hysteresis 필요 여부 검토

## RF 환경

- [ ] Wi-Fi traffic이 많은 환경 테스트
- [ ] Bluetooth audio와 동시 사용 테스트
- [ ] 여러 peripheral 동시 연결 테스트
- [ ] Measurement rate 감소 시 UX 확인
- [ ] 복잡한 실내 multipath 환경 테스트

## Hardware

- [ ] Bluetooth 6.3 chipset 확인
- [ ] Inline PCT 지원 확인
- [ ] Channel Sounding mode 0 지원
- [ ] Channel Sounding mode 2 지원
- [ ] `T_FCS >= 100µs` 지원 확인
- [ ] Vendor SDK/firmware의 Channel Sounding support 확인
- [ ] 안테나와 PCB layout 영향 검증

## Device Compatibility

- [ ] N1 chip 지원 iPhone 여부 runtime 확인
- [ ] Model-name hardcoding 피하기
- [ ] Unsupported device fallback 정의
- [ ] RSSI fallback 필요 여부 결정
- [ ] UWB accessory가 있다면 별도 Nearby Interaction path 유지

## Power

- [ ] Finder 화면에서만 session 활성화 검토
- [ ] 불필요한 장시간 ranging 방지
- [ ] Accessory battery impact 측정
- [ ] Measurement responsiveness와 power 간 trade-off 측정

---

# ⚠️ 구현 시 주의할 점

## RSSI와 같은 의미로 생각하지 않는다

RSSI는 radio strength를 기반으로 거리를 추정한다.

Channel Sounding은 phase 변화 기반 ranging procedure로 실제 거리를 계산한다.

기존 RSSI calibration logic을 그대로 적용할 필요가 없다.

## Core Bluetooth와 Nearby Interaction의 역할이 다르다

Core Bluetooth는 distance 중심이다.

Nearby Interaction은 camera fusion과 motion state 정보를 이용해 distance와 direction을 제공한다.

## Direction에는 Camera Assistance가 필요하다

단순히 Channel Sounding을 켠다고 방향이 자동으로 제공되는 것은 아니다.

## Result는 항상 존재하지 않는다

Distance와 direction 모두 optional이다.

Measurement failure를 정상적인 runtime state로 다뤄야 한다.

## Background 지속 측정을 전제로 하지 않는다

iOS 27에서는 background로 이동하면 session이 pause된다.

## Measurement rate는 고정되지 않는다

다른 Bluetooth/Wi-Fi activity가 늘면 Channel Sounding 빈도가 감소할 수 있다.

## Bluetooth version만 확인해서는 안 된다

Accessory에는 Bluetooth 6.3뿐 아니라 inline PCT, mode 0/2, T_FCS 요구사항이 모두 필요하다.

---

# 🧩 주요 API 정리

| API | 역할 |
|---|---|
| `AccessorySetupKit` | Accessory pairing/setup |
| `CBCentralManager.supportsFeatures(.channelSounding)` | Core Bluetooth Channel Sounding 지원 확인 |
| `CBChannelSoundingSessionConfiguration` | Core Bluetooth ranging session 설정 |
| `startChannelSoundingSession` | Channel Sounding 시작 |
| `CBChannelSoundingProcedureResults.distance` | Meter 단위 거리 결과 |
| `cancelChannelSoundingSession` | Session 종료 |
| `didCompleteChannelSoundingSession` | Session completion callback |
| `NISession.deviceCapabilities.supportsBluetoothChannelSounding` | NI Channel Sounding 지원 확인 |
| `NINearbyAccessoryConfiguration` | Bluetooth Channel Sounding용 NI 설정 |
| `isCameraAssistanceEnabled` | Direction을 위한 camera fusion |
| `NISession.run` | Nearby Interaction session 실행 |
| `updateMotionState` | Accessory moving/stationary hint |
| `NINearbyObject.distance` | Fusion된 거리 |
| `NINearbyObject.horizontalAngle` | 방향 정보 |

---

# 🔁 전체 Architecture

```text
AccessorySetupKit
      ↓
Bluetooth Pairing
      ↓
Core Bluetooth Connection
      ↓
Capability Check
      ↓
┌──────────────────────┬────────────────────────┐
│ Distance Only        │ Distance + Direction   │
│                      │                        │
│ Core Bluetooth       │ Nearby Interaction     │
│                      │ + Camera Assistance    │
└──────────────────────┴────────────────────────┘
      ↓
Bluetooth Channel Sounding
      ↓
Phase-based Ranging
      ↓
Distance / Direction UI
```

---

# 🎯 적용하기 좋은 제품

세션의 thermometer 예를 확장하면 다음 accessory에 적합하다.

- Bluetooth thermometer
- Luggage tag
- Camera accessory
- Portable sensor
- Tool locator
- Smart-home accessory
- Fitness accessory
- Equipment finder
- Medical device locator
- Pet accessory

특히 기존에 RSSI 기반 “near/far” UI를 제공하던 제품은 Channel Sounding의 직접적인 개선 후보가 된다.

---

# 핵심 메시지

Bluetooth Channel Sounding은 Bluetooth accessory의 근거리 탐색 경험을 한 단계 바꾸는 API다.

기존 RSSI는 signal strength와 환경 모델을 이용해 거리를 추정했지만, Channel Sounding은 iPhone과 accessory가 2.4GHz 여러 채널에서 tone을 주고받으며 phase 변화를 측정해 거리를 계산한다.

앱이 거리만 필요하다면 Core Bluetooth에서 session을 시작하고 각 `CBChannelSoundingProcedureResults`의 distance를 사용하면 된다.

방향까지 필요하다면 같은 `CBPeripheral.identifier`를 `NINearbyAccessoryConfiguration`에 연결하고 Nearby Interaction을 사용한다. Camera Assistance를 켜면 Channel Sounding raw measurement와 camera input을 fusion해 거리와 방향을 제공하고, accessory가 moving인지 stationary인지 알려주면 direction estimate를 더 개선할 수 있다.

실제 제품에서는 다음 제약이 중요하다.

```text
Foreground Only
      +
Variable Measurement Rate
      +
Optional Results
      +
Hardware Capability Check
```

또 accessory hardware는 단순 Bluetooth LE만 지원하면 되는 것이 아니라 Bluetooth 6.3, inline PCT, Channel Sounding mode 0/2, 최소 100µs의 T_FCS 조건을 만족해야 한다.

따라서 구현 전략은 다음처럼 정리할 수 있다.

```text
Distance only
→ Core Bluetooth Channel Sounding

Distance + Direction
→ Nearby Interaction + Camera Assistance

Highest precision + UWB hardware 가능
→ UWB + Nearby Interaction

Legacy hardware
→ RSSI fallback
```

결국 Channel Sounding의 가장 큰 의미는 **기존 Bluetooth-only accessory에서도 UWB를 추가하지 않고 RSSI보다 훨씬 신뢰도 높은 거리 기반 UX를 만들 수 있게 됐다는 점**이다.

---

# 함께 보면 좋은 세션과 자료

- Measuring distance between devices using Channel Sounding
- AccessorySetupKit
- Nearby Interaction
- Core Bluetooth
- Explore Nearby Interaction with third-party accessories — WWDC21
- Meet AccessorySetupKit — WWDC24
