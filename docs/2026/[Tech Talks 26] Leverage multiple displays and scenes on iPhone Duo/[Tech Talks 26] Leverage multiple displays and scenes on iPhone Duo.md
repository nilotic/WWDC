# Tech Talk 111464 Leverage multiple displays and scenes on iPhone Duo 요약

- Session: Tech Talks 111464
- Title: Leverage multiple displays and scenes on iPhone Duo
- Source: https://developer.apple.com/videos/play/tech-talks/111464/
- Topic: iPhone Duo, Hinge API, Multitasking, Multiple Scenes, Scene Accessories, CameraCaptureAccessory
- Chapters: Introduction, Respond to the hinge, Drive a pitch bend with hinge angle, Hinge data versus layout APIs, Split view multitasking, Support multiple scenes, Scene accessories, The camera capture accessory, Build a teleprompter accessory, Next steps

---

## 한 줄 요약

iPhone Duo에서는 **hinge angle을 실시간 interaction/effect에 활용하고, split view multitasking과 multiple scenes를 지원하며, `SceneAccessory`와 `CameraCaptureAccessory`로 inner/outer display에 서로 다른 UI를 동시에 보여줄 수 있다.** 다만 hinge data는 layout 용도가 아니라 interaction/effect 용도이고, layout은 arrangement·region API를 사용해야 한다.

---

## 핵심 요약

이번 세션은 iPhone Duo의 두 화면과 hinge를 활용해 앱을 더 풍부하게 만드는 세 가지 축을 설명한다.

- **Hinge interaction**
  - SwiftUI: `onHingeChange`
  - UIKit: `UIHingeInteraction`
  - 상태: closed / partially open / fully open
  - 연속적인 hinge angle도 제공
  - Interaction, visual effect, gesture-like control에 적합
  - Layout에는 사용하지 말고 arrangement/region API 사용

- **Split view multitasking / multiple scenes**
  - 모든 앱은 iPhone Duo multitasking에 참여
  - 두 앱을 side-by-side로 표시 가능
  - video + app stack 형태도 동일한 resize 원칙으로 처리
  - size class와 scene geometry 사용
  - iPhone Duo는 multiple app scene을 지원하는 첫 iPhone
  - 단, 새 window 생성은 inner display에서만 가능
  - outer display에서는 새 scene creation이 불가능할 수 있으므로 error handling 필요
  - `UIWindowSceneActivationAction`은 새 window를 만들 수 없는 상황에서는 자동으로 숨겨짐

- **Scene accessories**
  - 하나의 앱이 여러 display에 동시에 supplementary UI를 표시
  - accessory availability는 system이 동적으로 관리
  - 상태 변화는 observation tracking 또는 availability callback으로 처리
  - camera app은 `CameraCaptureAccessory`로 outer display에 별도 UI를 제공 가능
  - 예제에서는 camera UI는 inner display, teleprompter는 outer display에 표시

---

# 📱 iPhone Duo의 새로운 UI 조건

Apple은 iPhone Duo를 “익숙하면서도 고유한 기능을 가진 새로운 기기”로 설명한다.

앱이 기본적으로 고려해야 할 요소는 다음 세 가지다.

```text
Hinge
  +
Split View Multitasking
  +
Multiple Displays / Scenes
```

이미 iPad resizing 또는 iPhone Mirroring에 대응한 앱이라면 기반은 잘 준비된 상태다.

---

# 🪟 Hinge를 Interaction Source로 사용

SwiftUI와 UIKit은 각각 hinge 상태를 읽는 API를 제공한다.

## SwiftUI

```swift
.onHingeChange { previous, current in
    // ...
}
```

## UIKit

```text
UIHingeInteraction
```

두 API 모두 다음을 제공한다.

```text
High-level Status
- closed
- partiallyOpen
- fullyOpen

Continuous Data
- hinge angle
```

즉 discrete state와 continuous angle을 함께 사용할 수 있다.

---

# 🎸 예제: Hinge Angle로 Pitch Bend 만들기

세션의 예제는 playable guitar app이다.

기본 상태:

```swift
struct InstrumentView: View {
    /// Normalized bend, 0 is no bend, 1 is deepest bend
    @State private var pitchBend: Double = 0

    var body: some View {
        GuitarView(pitchBend: pitchBend)
    }
}
```

여기에 `onHingeChange`를 추가한다.

```swift
struct InstrumentView: View {
    @State private var pitchBend: Double = 0

    var body: some View {
        GuitarView(pitchBend: pitchBend)
            .onHingeChange { _, context in

            }
    }
}
```

---

# 🧩 Hinge가 없는 Device 처리

`context.hinge`가 `nil`이면 hinge가 없는 device에서 실행 중이라는 의미다.

따라서 반드시 optional handling을 해야 한다.

```swift
var body: some View {
    GuitarView(pitchBend: pitchBend)
        .onHingeChange { _, context in
            // A null hinge means the device doesn't have one
            if let hinge = context.hinge,
               hinge.status == .partiallyOpen {

            }
        }
}
```

세션의 예제는 `partiallyOpen` 상태에서만 angle을 사용한다.

---

# 🔄 Hinge 상태가 바뀌면 Effect를 Reset

부분적으로 열려 있을 때만 hinge angle을 읽는다면, 그 외 상태에서는 이전 값이 남지 않게 초기화해야 한다.

```swift
var body: some View {
    GuitarView(pitchBend: pitchBend)
        .onHingeChange { _, context in
            if let hinge = context.hinge,
               hinge.status == .partiallyOpen {

            }
            else {
                pitchBend = 0
            }
        }
}
```

이 pattern은 pitch bend뿐 아니라 hinge 기반 animation/effect 전반에 적용할 수 있다.

---

# 🎚️ Hinge Angle → Normalized Value

마지막으로 hinge angle을 앱에서 필요한 control value로 변환한다.

```swift
struct InstrumentView: View {
    @State private var pitchBend: Double = 0

    var body: some View {
        GuitarView(pitchBend: pitchBend)
            .onHingeChange { _, context in
                if let hinge = context.hinge,
                   hinge.status == .partiallyOpen {
                    pitchBend = calculatePitchBend(
                        angle: hinge.angle
                    )
                }
                else {
                    pitchBend = 0
                }
            }
    }

    private func calculatePitchBend(
        angle: Angle
    ) -> Double {
        // Normalize angle to 0...1
        // ...
    }
}
```

세션 예제에서는 hinge가 physical whammy bar처럼 동작한다.

---

# ⚠️ Hinge Data는 Layout용이 아니다

Apple이 이번 세션에서 특히 강조한 점이다.

```text
Hinge API
→ Live interaction / effect

Arrangement / Region APIs
→ Layout
```

`onHingeChange`는 빠르게 업데이트되는 live state를 제공하므로 다음에 적합하다.

- Visual effect
- Motion-driven interaction
- Audio control
- Gesture-like behavior

반면 view 위치나 overall layout을 hinge angle에 직접 매달면 unstable한 layout logic을 만들 수 있다.

Layout은 별도 arrangement 및 reserved region API를 사용한다.

이 부분은 관련 Tech Talk **“Strike a pose with adaptive layouts on iPhone Duo”**가 자세히 다룬다.

---

# 🪟 Split View Multitasking

모든 앱은 iPhone Duo에서 multitasking에 참여한다.

대표 layout:

```text
┌───────────────┬───────────────┐
│ App A         │ App B         │
│               │               │
│               │               │
└───────────────┴───────────────┘
```

또 새로운 layout으로 video와 app을 stack해서 보여주는 형태도 있다.

```text
┌───────────────────────────────┐
│ Video                         │
├───────────────────────────────┤
│ App                           │
└───────────────────────────────┘
```

앱은 두 경우를 특별한 별도 system으로 처리할 필요가 없다.

기본 원칙은 resizing에 대응하는 것이다.

---

# 📐 Layout 판단에 사용하는 System API

세션은 다음을 언급한다.

- Size classes
- Scene geometry

즉 iPhone Duo라고 해서 device model을 하드코딩해 분기하는 것보다 현재 scene의 실제 geometry에 맞춰 layout을 구성해야 한다.

---

# 🧭 Multiple Scenes

iPhone Duo는 **multiple instances of your app's UI를 지원하는 첫 번째 iPhone**이다.

이미 iPad에서 multiple scenes를 지원한다면 같은 architecture가 iPhone Duo에서도 동작한다.

```text
iPad Multiple Scenes
        ↓
같은 Scene Architecture
        ↓
iPhone Duo
```

---

# ⚠️ Outer Display에서는 새 Window를 만들 수 없다

중요한 차이점이 하나 있다.

```text
Inner Display
→ New Window Creation 가능

Outer Display
→ New Window Creation 불가
```

즉 scene creation availability가 device posture/display에 따라 동적으로 바뀔 수 있다.

이 동작은 iPhone Duo에 특화된 중요한 차이다.

---

# 🧯 Scene Request Error Handling

새 scene을 요청하는 코드는 반드시 실패 가능성을 고려해야 한다.

```text
Request New Scene
      ↓
현재 Scene이 Outer Display?
      ↓ Yes
Scene Creation unavailable
      ↓
Error handling
```

새 window를 항상 만들 수 있다고 가정하면 안 된다.

---

# ✅ `UIWindowSceneActivationAction`

Apple은 window creation UI에는 `UIWindowSceneActivationAction`을 사용할 것을 권장한다.

장점:

> 새로운 window를 만들 수 없는 상황에서는 action이 자동으로 숨겨진다.

즉 앱이 availability 조건을 직접 반복적으로 체크해 menu/button을 숨기는 logic을 줄일 수 있다.

---

# 🖥️ Scene Accessories

Split view는 여러 scene을 사용하는 한 방법이다.

하지만 한 앱이 두 display에 동시에 complementary content를 보여주려면 **Scene Accessories**를 사용할 수 있다.

개념:

```text
Main Scene
      +
Accessory Scene
      ↓
Multiple Displays
```

---

# 🎮 기존 Scene Accessory 활용 예

Apple은 iPhone/iPad의 일반적인 예로 다음을 든다.

```text
External Display
→ Game

iPhone
→ Controller UI
```

즉 accessory는 앱의 main UI를 복제하는 것이 아니라 supplementary UI를 pairing하는 구조다.

---

# 🔄 Accessory Availability는 Dynamic

System이 accessory 사용 가능 여부를 관리한다.

세션 설명:

- Accessory는 기본적으로 enabled
- 그러나 system condition에 따라 언제든 toggle 가능

따라서 availability를 observe해야 한다.

```text
Accessory Available
      ↓
Show related controls

Accessory Unavailable
      ↓
Disable / hide related controls
```

---

# 📷 `CameraCaptureAccessory`

Camera app을 위한 새로운 accessory다.

구조:

```text
Inner Display
→ Main Camera UI

Outer Display
→ CameraCaptureAccessory UI
```

이 기능을 사용하면 촬영 대상자에게 별도 content를 보여줄 수 있다.

예:

- Self preview
- Cue
- Countdown
- Teleprompter
- Pose guide
- Recording status

---

# ✅ CameraCaptureAccessory Availability 조건

세션은 accessory가 다음 조건에서 사용 가능하다고 설명한다.

```text
App is full screen on inner display
        +
Active camera session
```

그리고 accessory는 **camera UI와 동일한 view에 등록**한다.

---

# 🎤 Teleprompter 예제

Camera app의 outer display에 teleprompter를 보여준다.

Model:

```swift
@State private var model = TeleprompterModel()
```

Camera UI에 accessory를 추가한다.

```swift
struct CameraRootView: View {
    @State private var model = TeleprompterModel()

    var body: some View {
        CameraView(model: model)
            .sceneAccessory {
                CameraCaptureAccessory {
                    TeleprompterView(model: model)
                }
            }
    }
}
```

이 코드만으로:

```text
CameraView visible on inner display
        ↓
TeleprompterView appears on outer display
```

Camera view가 사라지면 accessory도 함께 사라진다.

---

# 🎛️ Accessory Enable/Disable Toggle

사용자가 teleprompter를 필요할 때만 켤 수 있게 한다.

```swift
struct CameraRootView: View {
    @State private var model = TeleprompterModel()

    var body: some View {
        CameraView(model: model)
            .sceneAccessory {
                CameraCaptureAccessory(
                    isEnabled: $model.isEnabled
                ) {
                    TeleprompterView(model: model)
                }
            }
            .toolbar {
                TeleprompterToggle(
                    isEnabled: $model.isEnabled
                )
            }
    }
}
```

`isEnabled` binding을 통해 accessory visibility와 main UI control을 연결한다.

---

# 👁️ Accessory Availability 관찰

기기가 닫히거나 system condition이 바뀌면 accessory를 사용할 수 없게 될 수 있다.

이때 toolbar button도 비활성화해야 한다.

```swift
struct CameraRootView: View {
    @State private var model = TeleprompterModel()

    var body: some View {
        CameraView(model: model)
            .sceneAccessory {
                CameraCaptureAccessory(
                    isEnabled: $model.isEnabled
                ) {
                    TeleprompterView(model: model)
                }
                .onAvailabilityChange { newValue in
                    model.isAvailable = newValue
                }
            }
            .toolbar {
                TeleprompterToggle(
                    isEnabled: $model.isEnabled
                )
                .disabled(!model.isAvailable)
            }
    }
}
```

---

# 🧠 Availability와 Enabled State는 다르다

둘은 구분해야 한다.

```text
isAvailable
→ System condition
→ 지금 accessory를 쓸 수 있는가?

isEnabled
→ App/User state
→ 사용자가 accessory를 켜고 싶은가?
```

따라서 UI logic은 보통 다음과 같다.

```text
isAvailable == false
→ Toggle disabled

isAvailable == true
→ User can control isEnabled
```

---

# 🧩 Scene Accessory의 핵심 설계 패턴

```text
Main UI State Model
       ↓
Shared State
       ↓
┌─────────────────────┐
│ Main Scene          │
│ Inner Display       │
└─────────────────────┘
       +
┌─────────────────────┐
│ Scene Accessory     │
│ Outer Display       │
└─────────────────────┘
```

같은 model을 공유하면 main UI와 accessory UI가 자연스럽게 sync된다.

---

# 🎯 Hinge / Layout / Scene Accessories의 역할 구분

| 기능 | 목적 | 대표 API |
|---|---|---|
| Hinge status/angle | Interaction, effect | `onHingeChange`, `UIHingeInteraction` |
| Adaptive layout | Hinge/region을 고려한 layout | Arrangement / Region APIs |
| Split view | 다른 앱과 side-by-side | Size classes, scene geometry |
| Multiple scenes | 같은 앱 UI 여러 instance | Scene APIs |
| New window action | Scene creation UI | `UIWindowSceneActivationAction` |
| Supplementary display UI | 여러 display에 연결된 UI | `sceneAccessory` |
| Camera outer-display UI | 촬영 대상자용 supplementary UI | `CameraCaptureAccessory` |
| Availability observation | Accessory 상태 대응 | `onAvailabilityChange` |

---

# 📋 체크리스트

## Hinge

- [ ] `onHingeChange` 또는 `UIHingeInteraction` 사용
- [ ] `context.hinge == nil` 처리
- [ ] `.closed` 처리
- [ ] `.partiallyOpen` 처리
- [ ] `.fullyOpen` 처리
- [ ] Continuous angle 범위 normalize
- [ ] Effect가 끝나면 state reset
- [ ] Hinge state를 layout에 직접 사용하지 않기
- [ ] 빠른 angle update가 UI performance에 미치는 영향 확인

## Adaptive Layout

- [ ] Arrangement API 사용 검토
- [ ] Region API 사용 검토
- [ ] Device model 하드코딩 피하기
- [ ] Scene geometry 기반으로 layout 판단
- [ ] Size class 변화 대응
- [ ] Inner/outer display size 변화 테스트

## Split View Multitasking

- [ ] 앱이 임의 width에서도 동작하는지 확인
- [ ] Side-by-side에서 content clipping 점검
- [ ] Video + app stacked layout에서도 테스트
- [ ] iPad resizing 대응 코드 재사용 가능성 확인
- [ ] iPhone Mirroring 대응 코드 검토
- [ ] Fixed width assumption 제거

## Multiple Scenes

- [ ] iPad scene support가 있다면 iPhone Duo에서도 검증
- [ ] 새 scene request 실패 처리
- [ ] Outer display에서 scene creation 불가 조건 고려
- [ ] Inner display에서만 window creation 가능한 상황 테스트
- [ ] `UIWindowSceneActivationAction` 활용
- [ ] Scene별 state 분리 여부 검토

## Scene Accessories

- [ ] Main UI와 supplementary UI 역할 정의
- [ ] Accessory availability 동적 변화 고려
- [ ] Availability 관찰
- [ ] Main scene model과 accessory state 공유 여부 검토
- [ ] Accessory가 사라져도 app state가 깨지지 않는지 확인

## CameraCaptureAccessory

- [ ] Camera session active 조건 확인
- [ ] Inner display full-screen 조건 확인
- [ ] Accessory를 camera UI와 같은 view에 등록
- [ ] Outer display에 실제로 필요한 정보만 표시
- [ ] 촬영 대상자 관점에서 readability 확인
- [ ] Device close/open에서 availability 변화 테스트
- [ ] Camera interruption과 accessory state 연동

## Teleprompter Pattern

- [ ] Shared model 준비
- [ ] `sceneAccessory` 추가
- [ ] `CameraCaptureAccessory` 구성
- [ ] `isEnabled` binding 연결
- [ ] Toolbar toggle 제공
- [ ] `onAvailabilityChange` 처리
- [ ] unavailable일 때 toggle disable
- [ ] Main view 사라질 때 accessory가 같이 정리되는지 확인

---

# ⚠️ 구현 시 주의할 점

## Hinge Angle을 Layout Engine처럼 쓰지 않는다

Hinge update는 interaction/effect에 이상적이다.

Layout은 arrangement와 region API로 해결해야 한다.

## Multiple Scene Availability는 고정값이 아니다

Inner/outer display에 따라 window creation 가능 여부가 달라진다.

`requestSceneSessionActivation`류의 호출이 항상 성공한다고 가정하면 안 된다.

## Accessory Availability와 Enabled State를 분리한다

Accessory를 system이 제공할 수 있는 상태와 사용자가 지금 accessory를 켜고 싶은 상태는 서로 다르다.

## Camera accessory는 단순 second window가 아니다

카메라 main UI와 pairing된 supplementary scene이다.

따라서 lifecycle을 별도의 독립 window처럼 다루기보다 camera UI의 lifecycle과 연결해야 한다.

---

# 🧪 테스트 Matrix

## Device Posture

```text
Closed
Partially Open
Fully Open
```

## Display Context

```text
Inner Display
Outer Display
Split View
Video + App Stack
```

## Scene State

```text
Single Scene
Multiple Scenes
New Scene Request Available
New Scene Request Unavailable
```

## Accessory State

```text
Available + Enabled
Available + Disabled
Unavailable
```

## Camera State

```text
Camera Active
Camera Inactive
App Full Screen
App Not Full Screen
```

이 조합을 실제 device에서 모두 테스트해야 한다.

---

# 🔁 전체 흐름

```text
App starts on iPhone Duo
        ↓
Current scene geometry 확인
        ↓
Adaptive layout 적용
        ↓
Hinge present?
  ├─ No → Normal interaction
  └─ Yes
       ↓
    onHingeChange
       ↓
    Effect / Interaction

Multitasking / Multiple Scenes
        ↓
Scene creation availability 확인
        ↓
Inner display에서 필요 시 new scene

Camera workflow
        ↓
Camera session active + inner full screen
        ↓
CameraCaptureAccessory available
        ↓
Outer display supplementary UI
```

---

# 핵심 메시지

iPhone Duo의 multi-display experience는 단순히 “화면이 두 개라서 layout을 두 배로 만든다”는 접근이 아니다.

각 기능은 역할이 분명히 나뉜다.

```text
Hinge
→ Interaction / Effect

Arrangement + Regions
→ Layout

Split View
→ 다른 앱과 Multitasking

Multiple Scenes
→ 같은 앱의 여러 UI Instance

Scene Accessories
→ 하나의 앱이 여러 Display에 Complementary UI 표시
```

`onHingeChange`와 `UIHingeInteraction`은 hinge를 실시간 input source로 만들어 pitch bend 같은 expressive interaction을 구현한다.

그러나 layout을 hinge angle에 직접 묶지 않고 dedicated layout API를 사용해야 한다.

Split view에서는 기존 iPad/iPhone Mirroring과 같은 resizing 원칙을 적용하고, multiple scenes를 지원한다면 iPhone Duo에서도 자연스럽게 확장된다.

다만 새 window creation은 inner display에만 허용될 수 있으므로 scene request failure를 정상적인 상태로 취급해야 한다.

`SceneAccessory`는 더 독특한 경험을 만든다.

Camera app은 `CameraCaptureAccessory`로 inner display의 camera UI와 outer display의 teleprompter 같은 supplementary UI를 하나의 app state 안에서 연결할 수 있다.

결국 iPhone Duo에서 좋은 multi-display app은 두 화면을 억지로 모두 채우는 앱이 아니라, **현재 posture·scene·display availability에 맞춰 필요한 UI만 적절한 화면에 제공하는 앱**이다.

---

# 함께 보면 좋은 세션과 자료

- Prepare your app for iPhone Duo — Tech Talk 111461
- Raise the bar for your app on iPhone Duo — Tech Talk 111462
- Strike a pose with adaptive layouts on iPhone Duo — Tech Talk 111463
- Build a great camera experience for iPhone Duo
- Supporting multiple windows on iPad
- Scene lifecycle documentation
