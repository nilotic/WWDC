# WWDC26 Make your game great with touch 요약

- Session: 358
- Title: Make your game great with touch
- Source: https://developer.apple.com/videos/play/wwdc2026/358/
- Topic: Games, Touch Controller, Game Controller, UIKit, Metal, adaptive touch UI, input design
- Chapters: Introduction, Set up a touch controller, Design flexible layouts, Design fluid interactions, Provide rich feedback, Next steps

---

## 한 줄 요약

`Touch Controller` framework는 기존 `GCController` 기반 게임 입력 구조에 touch input을 자연스럽게 연결하면서, 화면 전체를 활용한 adaptive control, contextual UI, multi-finger interaction 단순화, Metal 기반 rendering과 visual feedback까지 제공해 iPhone/iPad에서 물리 controller를 단순 복제하지 않고 **touch에 맞게 다시 설계된 게임 조작 경험**을 만들 수 있게 한다.

---

## 핵심 요약

이 세션은 Mac이나 console 중심으로 설계된 controller 기반 게임을 iPhone/iPad로 가져올 때, touch control을 어떻게 단순 overlay가 아니라 **별도의 interaction design layer**로 설계해야 하는지 단계별로 설명한다.

전체 흐름은 다음 네 단계다.

```text
1. Touch Controller 설정
2. Flexible layout 설계
3. Fluid interaction으로 재설계
4. Rich feedback 제공
```

핵심 포인트는 다음과 같다.

- `Touch Controller`는 `Game Controller` framework 위에서 동작한다.
- 활성화된 touch controller는 `GCController`처럼 보이므로 기존 controller game logic을 대부분 재사용할 수 있다.
- `TCTouchController`는 Metal과 직접 통합된다.
- control은 9개의 anchor point를 기준으로 adaptive하게 배치할 수 있다.
- `safeAreaInsets`를 반영해 Dynamic Island, rounded corner, home indicator와 겹치지 않게 해야 한다.
- physical controller button을 화면에 1:1로 복제하지 말고 touch에 맞게 역할을 합치거나 숨기고 재배치해야 한다.
- context에 따라 icon과 visibility를 바꾸는 dynamic control이 중요하다.
- thumbstick input 영역은 화면 절반까지 넓혀도 된다.
- camera는 right thumbstick보다 `TCTouchpad`가 더 자연스러울 수 있다.
- 여러 손가락을 요구하는 physical-controller interaction은 touch에서는 한두 손가락으로 단순화해야 한다.
- custom `TCControlContents`로 상태 feedback을 강화할 수 있다.

---

# 🎮 Touch Controller가 필요한 이유

Apple은 controller 기반 게임도 iPhone/iPad에서 언제 어디서든 바로 실행될 수 있다는 점을 강조한다.

하지만 사용자는 항상 물리 controller를 가지고 있지 않다.

따라서 모바일 환경에서는 controller가 없는 순간에도 게임의 핵심 experience가 유지되어야 한다.

Touch Controller의 목적은 단순히 virtual button을 화면에 띄우는 것이 아니라 다음 조건을 만족하는 것이다.

- responsive
- intuitive
- physically comfortable
- visually unobtrusive
- gameplay에 맞게 contextual

세션은 `Dredge`를 touch control이 자연스럽게 결합된 사례로 든다.

---

# 🧩 Game Controller 위에 Touch Controller를 얹기

기존 `Game Controller` framework의 핵심은 `GCController`다.

일반적인 구조는 다음과 같다.

```text
GCController 연결/해제 notification
          ↓
현재 controller 상태 polling
또는
value-changed handler 등록
          ↓
게임 입력 처리
```

Touch Controller는 이 구조를 바꾸지 않는다.

`Touch Controller`를 활성화하면 touch input도 하나의 `GCController`처럼 노출된다.

즉 이미 game controller를 지원하는 게임이라면 입력 abstraction을 다시 만들 필요가 적다.

---

# 🔄 Polling과 Change Handler

기존 `GCController`에서 쓰던 두 방식 모두 그대로 사용할 수 있다.

Polling:

```swift
if button.isPressed {
    // ...
}
```

Change handler:

```swift
pressedInput.pressedDidChangeHandler = {
    (element, input, pressed) in
    // ...
}
```

Touch Controller의 장점은 이 기존 pipeline과 연결된다는 점이다.

따라서 touch-specific UI를 추가해도 gameplay logic 자체는 가능하면 그대로 유지할 수 있다.

---

# 🛠️ `TCTouchController` 설정

세션에서 기본 setup은 다음 흐름이다.

```text
TCTouchControllerDescriptor 생성
        ↓
TCTouchController 지원 여부 확인
        ↓
TCTouchController 생성
        ↓
connect()
        ↓
UIKit touch event 전달
        ↓
Metal renderer에서 render()
```

핵심 코드는 다음 형태다.

```swift
private(set) var touchController: TCTouchController?

let descriptor = TCTouchControllerDescriptor(mtkView: mtkView)

if TCTouchController.isSupported {
    touchController = TCTouchController(descriptor: descriptor)
}

touchController?.connect()
touchController?.render(using: renderEncoder)
```

`TCTouchControllerDescriptor`에 `MTKView`를 넘기는 점이 중요하다.

Touch Controller의 visual rendering이 Metal rendering pipeline과 직접 연결되기 때문이다.

---

# 👆 UIKit touch event 전달

Touch Controller는 UIKit에서 발생한 raw touch를 전달받아야 한다.

예:

```swift
override func touchesBegan(_ touches: Set<UITouch>, with event: UIEvent?) {
    for touch in touches {
        touchControls.handleTouchBegan(
            at: touch.location(in: view),
            index: touch.hash
        )
    }
}
```

동일한 방식으로 다음 event도 연결한다.

- `touchesBegan`
- `touchesMoved`
- `touchesEnded`

결과적으로 architecture는 다음처럼 된다.

```text
UIKit Touch
    ↓
TCTouchController
    ↓
GCController abstraction
    ↓
기존 game input logic
```

---

# ⚡ Metal과 직접 통합

Touch Controller framework는 on-screen control rendering을 Metal과 연결한다.

```swift
touchController?.render(using: renderEncoder)
```

따라서 game의 기존 Metal renderer 안에서 touch controls를 함께 렌더링할 수 있다.

이 구조의 장점은 별도의 heavyweight UI layer를 겹치는 대신 game rendering과 가까운 pipeline에서 처리할 수 있다는 점이다.

---

# 🧭 Flexible Layout의 핵심: 9개의 Anchor

다음 단계는 화면 크기마다 안정적으로 동작하는 control layout이다.

Touch Controller는 각 layout에서 사용할 수 있는 **9개의 anchor point**를 제공한다.

개념적으로는 다음과 같다.

```text
Top Left      Top Center      Top Right

Center Left   Center          Center Right

Bottom Left   Bottom Center   Bottom Right
```

Control은 특정 anchor에 붙이고 그 anchor 기준 상대 offset으로 위치를 정한다.

---

# 🧱 Section 단위로 Anchor 공유

관련 control들을 하나의 section처럼 묶고 동일한 anchor를 지정할 수 있다.

예:

```text
Bottom Left
├─ Move thumbstick
└─ Context action

Bottom Right
├─ Attack
├─ Jump
└─ Power
```

Device aspect ratio가 달라져도 각 section은 anchor를 기준으로 비슷한 물리적 크기와 거리를 유지한다.

즉 absolute coordinate보다 device adaptation에 유리하다.

---

# 📱 Safe Area를 반드시 고려

Fullscreen game이라도 screen 전체를 무조건 control 영역으로 쓰면 안 된다.

iPhone/iPad에는 control을 가릴 수 있는 요소가 있다.

- rounded corners
- home indicator
- Dynamic Island
- 기타 system UI

UIKit에서는 `UIView.safeAreaInsets`를 읽을 수 있다.

이를 control offset 계산에 반영한다.

```swift
func adjustedOffset(
    _ offset: CGPoint,
    for anchor: TCControlLayoutAnchor
) -> CGPoint {
    // anchor별 safeArea 보정
}
```

Bottom-right control이라면 개념적으로:

```swift
x -= safeArea.right
y -= safeArea.bottom
```

처럼 조정한다.

---

# 🎯 Gameplay Area를 가리지 않는 배치

Safe area만 피한다고 좋은 touch layout이 되는 것은 아니다.

세션은 gameplay 자체를 방해하지 않는 위치 선정도 중요하다고 설명한다.

피해야 하는 영역:

- movement input 예상 영역
- camera control 영역
- 주인공/주요 object가 자주 위치하는 화면 중심

추천 배치:

```text
Thumb 근처
→ frequent / important actions

화면 상단
→ menu 등 낮은 빈도의 control

화면 중앙
→ gameplay를 위해 최대한 비워두기
```

---

# 🔘 `TCButtonDescriptor`로 Button 생성

Touch Controller control들은 대체로 같은 패턴을 따른다.

```text
Descriptor 생성
    ↓
Property 설정
    ↓
Control 생성/추가
    ↓
TCTouchController에 등록
```

Button B 예시:

```swift
let buttonBDesc = TCButtonDescriptor()
buttonBDesc.label = TCControlLabel.buttonB
buttonBDesc.anchor = .bottomRight
buttonBDesc.offset = adjustedOffset(
    CGPoint(x: -35, y: -106),
    for: buttonBDesc.anchor
)
```

Visual contents도 지정해야 한다.

```swift
buttonBDesc.contents = .buttonContents(
    forSystemImageNamed: "b.circle",
    size: buttonBDesc.size,
    shape: .circle,
    controller: touchController
)
```

마지막으로 등록한다.

```swift
touchController.addButton(descriptor: buttonBDesc)
```

---

# 🔗 `TCControlLabel`이 기존 Controller Logic과 연결

세션에서 중요한 포인트는 label mapping이다.

```swift
buttonBDesc.label = TCControlLabel.buttonB
```

이렇게 하면 on-screen button이 physical controller의 button B와 같은 semantic input으로 연결된다.

이미 button B에 대한 game logic이 있다면 touch 전용 game logic을 별도로 다시 작성할 필요가 없다.

```text
Physical Controller B
           ↘
             Existing Game Logic
           ↗
Touch Button B
```

---

# 🚫 물리 Controller를 화면에 그대로 복사하지 않기

초기 구현에서는 physical controller의 모든 button을 화면에 1:1로 만들 수 있다.

하지만 결과는 쉽게 cluttered UI가 된다.

문제:

- 화면 공간 경쟁
- gameplay content 가림
- 기능을 icon만 보고 이해하기 어려움
- 여러 손가락 요구
- touch에 맞지 않는 gesture

따라서 다음 단계는 **touch-native interaction으로 재설계**하는 것이다.

---

# 🎨 Dynamic Control Icon

Touch control은 physical button과 달리 visual appearance를 runtime에 바꿀 수 있다.

세션에서는 단순히 `B` 글자를 보여주는 대신 실제 action 의미를 icon으로 표현한다.

예:

```swift
buttonBDesc.contents = .buttonContents(
    forSystemImageNamed: "figure.fencing",
    size: buttonBDesc.size,
    shape: .circle,
    controller: touchController
)
```

즉:

```text
Button B
→ Strike icon
```

사용자는 controller mapping을 외울 필요 없이 바로 action 의미를 이해할 수 있다.

---

# 🔥 Context에 따라 Icon 변경

같은 button이 game state에 따라 서로 다른 action을 수행한다면 icon도 같이 바뀌어야 한다.

세션 예시:

```text
Strike
→ figure.fencing

Fireball
→ flame.fill

Water Power
→ drop.fill
```

예:

```swift
func setButtonBContents(symbolName: String) {
    for button in touchController.buttons {
        if button.label == TCControlLabel.buttonB {
            button.contents = .buttonContents(
                forSystemImageNamed: symbolName,
                size: buttonSize,
                shape: .circle,
                controller: touchController
            )
        }
    }
}
```

Context update:

```swift
switch currentPower {
case .strike:
    setButtonBContents(symbolName: "figure.fencing")
case .fireball:
    setButtonBContents(symbolName: "flame.fill")
case .waterBlaster:
    setButtonBContents(symbolName: "drop.fill")
}
```

---

# 👻 필요하지 않은 Control은 숨기기

Touch UI의 큰 장점은 필요할 때만 control을 보여줄 수 있다는 점이다.

세션의 원칙:

> 현재 사용할 수 없거나 의미 없는 action이라면 화면에서 제거한다.

예:

- thumbstick: 누를 때만 표시
- pickup button: pickup 가능한 item이 있을 때만 표시
- quick time event button: QTE 중에만 표시
- aim/release control: 특정 power 선택 시에만 표시

---

# 🕹️ Thumbstick 자동 숨김

```swift
let leftStickDesc = TCThumbstickDescriptor()
leftStickDesc.hidesWhenNotPressed = true
```

사용하지 않을 때 thumbstick이 사라진다.

이것만으로도 항상 떠 있는 controller overlay보다 화면이 훨씬 깨끗해진다.

---

# 👁️ Button 표시/숨김: `isEnabled`

항상 같은 위치에 존재하는 control이라면 매번 add/remove할 필요 없이 `isEnabled`를 사용할 수 있다.

```swift
escapeButton.isEnabled = true
```

```swift
escapeButton.isEnabled = false
```

특히 fixed-position QTE button에 적합하다.

---

# 📍 Dynamic Position Control

Pickup button처럼 game object 근처에 보여야 하는 control은 표시 시점마다 위치를 다시 계산할 수 있다.

```swift
func showPickupButton(at projectedPosition: CGPoint) {
    descriptor.offset = CGPoint(x: ptX, y: ptY)
    touchController.addButton(descriptor: descriptor)
}
```

필요 없어지면 제거한다.

```swift
func hidePickupButton() {
    for button in touchController.buttons {
        if button.label == TCControlLabel.buttonY {
            touchController.removeControl(button)
        }
    }
}
```

---

# 🔄 Touch Control은 Input이면서 Output

세션에서 매우 중요한 설계 포인트다.

Touch control은 단순 input surface가 아니라 visual output도 될 수 있다.

예를 들어 physical controller에서는 power wheel overlay를 띄우고 stick으로 선택할 수 있다.

Touch에서는 overlay를 따로 띄우는 대신 power option 자체를 직접 touch control로 보여줄 수 있다.

```text
Traditional
Button → Overlay → Selection

Touch-native
Button → Action controls directly on screen
```

---

# 🌀 Power Wheel을 Direct Touch로

Button X를 누르면 필요한 power control들을 바로 추가한다.

```swift
buttonX?.pressedChangedHandler = { _, _, pressed in
    if pressed {
        self.openPowerWheel()
    }
}
```

`openPowerWheel()`에서는 현재 사용할 수 있는 power만 control로 만든다.

그리고 일정 시간 동안 선택하지 않으면 자동으로 닫는다.

```swift
DispatchQueue.main.asyncAfter(deadline: .now() + 3.0) {
    guard self.powerWheelActive else { return }
    self.closePowerWheel()
}
```

---

# 🖐️ Touch에서는 Input Area를 크게 쓰기

Physical thumbstick은 고정된 물리적 위치와 크기가 있다.

Touchscreen에서는 손가락이 visual control 중심에서 얼마나 떨어졌는지 촉각으로 알 수 없다.

따라서 세션은 **input detection area를 가능한 크게 확장**하는 방식을 권장한다.

---

# ⬅️ 화면 왼쪽 절반을 Movement 영역으로

```swift
let leftStickDesc = TCThumbstickDescriptor()
leftStickDesc.colliderShape = .leftSide
```

Circle collider 대신 `.leftSide`를 쓰면 화면 왼쪽 절반 전체가 movement input 영역이 된다.

```text
┌─────────────────────┐
│ Left half │ Right   │
│ movement  │ camera  │
│ input     │ input   │
└─────────────────────┘
```

사용자는 정확히 thumbstick center를 찾아 누를 필요가 없다.

---

# 🏃 Sprint를 별도 Button에서 Tilt Magnitude로

Physical controller에서 sprint가 다음 조합이라고 하자.

```text
Thumbstick 이동
+
Thumbstick button 누르기
```

Touch에서 이 조합은 두 손가락을 요구할 수 있다.

세션에서는 이를 thumbstick tilt magnitude 하나로 합친다.

```text
Small tilt
→ normal movement

Large tilt
→ sprint
```

예:

```swift
func pollInput() {
    if let gamePad = gameController.extendedGamepad {
        let gamePadLeft = gamePad.leftThumbstick
        let moveInput = simd_make_float2(
            gamePadLeft.xAxis.value,
            -gamePadLeft.yAxis.value
        )

        let magnitude = simd_length(moveInput)

        if magnitude > 0.8 {
            self.runModifier = 1.3
        }

        self.characterDirection = moveInput
    }
}
```

Touch-specific behavior를 만들지만 input source는 여전히 `GCController` abstraction을 활용한다.

---

# 📷 Camera Control은 `TCTouchpad`

Physical controller에서는 right thumbstick이 camera에 적합하지만 touch에서 그대로 복제하면 문제가 생길 수 있다.

세션에서 지적하는 문제:

- over-rotation
- sluggishness
- gesture 시작/끝 drift
- 작은 virtual stick 영역

이를 `TCTouchpad`로 바꾼다.

---

# ➡️ 화면 오른쪽 절반을 Relative Touchpad로

```swift
let touchpadDesc = TCTouchpadDescriptor()
touchpadDesc.label = TCControlLabel.rightThumbstick
touchpadDesc.colliderShape = .rightSide
touchpadDesc.reportsRelativeValues = true

touchController.addTouchpad(descriptor: touchpadDesc)
```

중요한 property:

```swift
reportsRelativeValues = true
```

이렇게 하면 사용자가 오른쪽 영역의 어디서 touch를 시작했는지와 상관없이 finger movement delta를 camera input으로 활용할 수 있다.

그리고 visible camera stick이 필요 없어 화면 clutter도 줄어든다.

---

# 🧠 Physical Input Combination을 Touch에 맞게 다시 생각하기

세션은 modern game에 흔한 복잡한 input combination이 physical controller에서는 자연스럽지만 touch에서는 매우 어렵다고 설명한다.

특히:

- Quick Time Event
- Aim + Move + Release

같은 interaction을 예로 든다.

---

# ⚡ QTE: 두 Button을 하나로 합치기

Physical controller:

```text
L1 hold
+
R1 hold
+
Left stick movement
```

Touch에서는 너무 많은 손가락이 필요하다.

따라서:

```text
L1 + R1
→ 하나의 Escape button
```

으로 축약한다.

설정 시 한 번 만들고 평소에는 숨긴다.

```swift
let desc = TCButtonDescriptor()
desc.label = TCControlLabel(
    name: "escape_button",
    role: .button
)

touchController.addButton(descriptor: desc)
```

필요할 때:

```swift
escapeButton.isEnabled = true
```

끝나면:

```swift
escapeButton.isEnabled = false
```

---

# 🔥 Aim + Release를 하나의 Button으로

Fireball 같은 action에서 physical controller는 aim, movement, release가 여러 input으로 나뉠 수 있다.

Touch에서는 다음과 같이 통합한다.

```text
Hold Button B
    ↓
Drag while held
    ↓
Aim
    ↓
Release Button B
    ↓
Fire
```

Button B의 pressed state는 existing handler에서 처리한다.

```swift
buttonB?.valueChangedHandler = { _, _, pressed in
    self.releasePower(pressed: pressed)
}
```

하지만 drag delta는 button pressed state와 별개이므로 `touchesMoved`에서 raw touch movement를 추적한다.

```swift
override func touchesMoved(_ touches: Set<UITouch>, with event: UIEvent?) {
    for touch in touches {
        let point = touch.location(in: metalView)

        if let gc = gameController, gc.isAiming {
            let prev = touch.previousLocation(in: metalView)
            gc.aimTouchDelta += simd_float2(
                Float(point.x - prev.x),
                Float(point.y - prev.y)
            )
        }
    }
}
```

이 interaction은 movement를 유지하면서 한 손가락으로 aim/release를 처리할 수 있게 한다.

---

# ✨ 모든 Control에는 Feedback이 필요

화면 전체를 touch input 영역으로 쓸수록 사용자는 자신이 무엇을 누르고 있는지 알기 어려워진다.

따라서 모든 control에는 상태 feedback이 필요하다.

Touch Controller 기본 제공 feedback:

- button pressed highlight
- thumbstick movement animation

하지만 visually busy game에서는 더 강한 feedback이 필요할 수 있다.

---

# 🌟 `TCControlContents`로 Custom Feedback

세션에서는 sprint 상태를 더 명확하게 보여주기 위해 left thumbstick 주변에 glowing halo를 추가한다.

먼저 Metal texture로 `TCControlImage`를 만든다.

```swift
let haloLayer = TCControlImage(
    texture: haloTexture,
    size: haloSize,
    highlight: nil,
    offset: .zero,
    tintColor: tint
)
```

기본 thumbstick background layer와 합친다.

```swift
let normalBgImages =
    TCControlContents
        .thumbstickStickBackgroundContents(
            size: bgSize,
            controller: controller
        )
        .images
```

그 다음 layered contents 생성:

```swift
haloThumbstickBg = TCControlContents(
    images: [haloLayer] + normalBgImages
)
```

상태에 따라 교체한다.

```swift
thumbstick.backgroundContents = active
    ? haloThumbstickBg
    : normalThumbstickBg
```

즉 `TCControlContents`는 여러 visual image layer를 조합하는 container 역할을 한다.

---

# 🎨 Touch Control Contents의 의미

Touch controller UI는 단순 button asset 하나만 쓰는 구조가 아니다.

`TCControlContents`를 통해 여러 layer를 조합할 수 있다.

예:

```text
Halo Layer
+
Background Layer
+
Foreground / Glyph
+
Pressed State
```

이 덕분에 game art style에 맞는 custom control feedback을 만들 수 있다.

---

# 🔄 Before / After

세션의 초기 상태:

```text
Physical Controller
      ↓ 1:1 mapping
모든 virtual button 화면 표시
      ↓
Cluttered UI
```

최종 상태:

```text
Left half
→ hidden-until-used thumbstick

Right half
→ invisible relative touchpad

Nearby object
→ pickup button only when relevant

Power state
→ icon changes contextually

QTE
→ one temporary action button

Aim/release
→ hold + drag + release on one control

Sprint
→ thumbstick tilt + halo feedback
```

결과적으로 두 손가락만으로 대부분의 gameplay를 수행할 수 있다.

---

# 🧭 전체 Architecture

```text
UIKit Touch Events
        ↓
TCTouchController
        ↓
Touch Controls
(Button / Thumbstick / Touchpad)
        ↓
GCController abstraction
        ↓
Existing Game Input Logic
        ↓
Gameplay

Metal Renderer
        ↑
Touch Controller Render
```

이 architecture의 핵심은 input abstraction을 유지하면서 visual/interaction layer만 touch에 맞게 변화시키는 것이다.

---

# 🧰 주요 API 정리

| API | 역할 |
|---|---|
| `TCTouchController` | Touch controller 전체 관리 |
| `TCTouchControllerDescriptor` | controller 초기 설정 |
| `TCButtonDescriptor` | button 생성/설정 |
| `TCThumbstickDescriptor` | thumbstick 생성/설정 |
| `TCTouchpadDescriptor` | touchpad 생성/설정 |
| `TCControlLabel` | control semantic mapping |
| `TCControlLayoutAnchor` | adaptive anchor-based placement |
| `TCControlContents` | control visual layer 구성 |
| `TCControlImage` | Metal texture 기반 visual layer |
| `GCController` | game input abstraction |
| `safeAreaInsets` | system/hardware overlap 회피 |

---

# 🕹️ Control 유형별 역할

## `TCButton`

적합한 용도:

- action
- jump
- pickup
- QTE
- contextual power

## `TCThumbstick`

적합한 용도:

- character movement
- analog magnitude
- sprint threshold

## `TCTouchpad`

적합한 용도:

- camera movement
- relative drag
- invisible full-region gesture

---

# 📐 Adaptive Layout 원칙

세션에서 권장하는 layout 사고방식:

```text
Absolute Screen Coordinate
X

Anchor + Relative Offset
O
```

그 위에 다음을 더한다.

```text
Anchor
+
Safe Area
+
Gameplay Visibility
+
Thumb Reach
```

이 네 요소를 함께 고려해야 iPhone/iPad 화면 크기가 달라져도 안정적인 layout이 된다.

---

# 🖐️ Touch-native Interaction 원칙

Physical controller interaction을 touch로 가져올 때 다음 질문을 해야 한다.

```text
이 Action은 정말 별도 Button이 필요한가?
```

대안:

- state에 따라 같은 button icon 변경
- unavailable action 숨김
- input area를 크게 확대
- press + drag로 gesture 통합
- tilt magnitude로 mode 전환
- 여러 button을 하나로 collapse
- overlay 대신 direct touch control 사용

---

# 🚫 피해야 할 설계

## 모든 Physical Button을 그대로 표시

문제:

- clutter
- gameplay obstruction
- 작은 tap target
- 높은 cognitive load

## 고정된 작은 Touch Target

문제:

- 사용자가 촉각으로 위치를 찾을 수 없음
- 이동 중 정확한 touch 어려움

## Multi-finger Combination 강제

문제:

- mobile ergonomics에 부적합
- movement 중 다른 button 조작이 어려움

## 사용 불가능한 Control 계속 표시

문제:

- screen clutter
- 의미 없는 UI
- 사용자의 현재 action 판단 방해

---

# ✅ Touch-first 개선 방법

```text
Physical button label
→ Action glyph

Always visible thumbstick
→ hidesWhenNotPressed

Small movement collider
→ .leftSide

Right virtual stick
→ TCTouchpad + reportsRelativeValues

Two-button sprint
→ tilt magnitude

Two-button QTE
→ one contextual button

Aim + release controls
→ hold + drag + release

Passive state
→ custom halo feedback
```

---

# 🧪 구현 체크리스트

## 기존 Input Architecture

- [ ] 기존 game input이 `GCController` abstraction을 사용하고 있는지 확인
- [ ] polling과 handler 중 현재 구조 파악
- [ ] physical controller mapping을 유지할 수 있는지 확인
- [ ] touch-specific game logic을 불필요하게 분리하지 않기

## Touch Controller Setup

- [ ] `TCTouchController.isSupported` 확인
- [ ] `TCTouchControllerDescriptor` 생성
- [ ] `MTKView` 연결
- [ ] `connect()` 호출
- [ ] Metal render encoder에 `render(using:)` 연결
- [ ] `touchesBegan` 전달
- [ ] `touchesMoved` 전달
- [ ] `touchesEnded` 전달

## Layout

- [ ] 9개 anchor 기준으로 section 설계
- [ ] frequent action은 thumb 근처 배치
- [ ] menu는 상대적으로 상단 배치
- [ ] screen center를 gameplay에 확보
- [ ] `safeAreaInsets` 반영
- [ ] Dynamic Island overlap 확인
- [ ] home indicator overlap 확인
- [ ] iPhone/iPad 크기별 테스트

## Button Design

- [ ] `TCControlLabel`을 기존 controller input에 mapping
- [ ] physical button 이름 대신 action icon 사용 검토
- [ ] game state에 따라 icon 업데이트
- [ ] unavailable action 숨김
- [ ] fixed control은 `isEnabled` 활용
- [ ] dynamic-position control은 필요 시 add/remove

## Movement

- [ ] thumbstick collider를 충분히 크게 설정
- [ ] `.leftSide` 같은 full-region collider 고려
- [ ] `hidesWhenNotPressed` 적용 검토
- [ ] tilt magnitude를 action threshold로 활용 가능한지 검토
- [ ] 별도 sprint button 필요성 재평가

## Camera

- [ ] right thumbstick direct mapping이 자연스러운지 확인
- [ ] over-rotation 여부 테스트
- [ ] `TCTouchpad` 대안 검토
- [ ] `.rightSide` collider 사용 검토
- [ ] `reportsRelativeValues = true` 검토
- [ ] invisible touch region으로 clutter 줄이기

## Complex Actions

- [ ] 3개 이상의 동시 touch를 요구하지 않는지 확인
- [ ] 여러 physical button을 하나의 contextual control로 통합 가능한지 검토
- [ ] press + drag + release gesture 사용 가능성 검토
- [ ] temporary action은 context에만 표시
- [ ] overlay 대신 direct touch controls 사용 가능성 검토

## Feedback

- [ ] 모든 visible control에 pressed state가 있는지 확인
- [ ] thumbstick movement feedback 확인
- [ ] visually busy scene에서 feedback이 충분한지 검토
- [ ] `TCControlContents` custom layer 필요 여부 검토
- [ ] Metal texture를 visual control layer에 활용할지 결정
- [ ] sprint/charge/aim 등 mode 변화가 시각적으로 보이는지 확인

## 테스트

- [ ] 한 손 / 두 손 사용 모두 검토
- [ ] 작은 iPhone에서 테스트
- [ ] 큰 iPhone에서 테스트
- [ ] iPad에서 테스트
- [ ] 실제 gameplay 중 visibility 확인
- [ ] 빠른 camera turn 테스트
- [ ] 연속 movement + action 동시 수행 확인
- [ ] physical controller와 touch controller 전환 확인

---

# ⚠️ 구현 시 주의할 점

## Touch Controller는 Controller Overlay Builder가 아니다

Framework가 control을 쉽게 만들어 준다고 해서 physical controller layout을 그대로 복제하면 좋은 touch UX가 되는 것은 아니다.

세션의 대부분은 오히려 그 1:1 mapping을 제거하는 과정이다.

## Existing `GCController` Logic을 최대한 활용

Touch Controller는 기존 game controller abstraction과 연결되므로 input engine을 이중으로 만들 필요가 없다.

## Touch Area와 Visual Area는 같을 필요가 없다

화면에는 작은 thumbstick만 보이거나 아예 아무것도 보이지 않더라도 실제 collider는 화면 절반일 수 있다.

이것이 touch ergonomics에서 중요한 차이다.

## Contextual Visibility는 UX의 핵심

Touch UI는 물리 controller와 달리 필요할 때만 나타나고 역할에 따라 모습을 바꿀 수 있다.

이 capability를 적극적으로 쓰는 것이 화면 clutter를 줄이는 핵심이다.

## Multi-finger Gesture를 최소화

Controller에서는 자연스러운 chorded input이 touch에서는 부담스러울 수 있다.

가능하면 one-finger 또는 two-finger interaction으로 재구성한다.

---

# 🔁 세션 전체 구현 흐름

```text
Existing GCController Support
        ↓
Create TCTouchController
        ↓
Connect UIKit Touch Events
        ↓
Render Controls with Metal
        ↓
Add Controls via Descriptors
        ↓
Anchor + Safe Area Layout
        ↓
Replace Button Labels with Action Icons
        ↓
Hide Irrelevant Controls
        ↓
Expand Touch Detection Regions
        ↓
Thumbstick → Movement / Sprint
        ↓
Touchpad → Camera
        ↓
Collapse Multi-button Actions
        ↓
Add Rich Visual Feedback
        ↓
Test Across Devices
```

---

# 🎯 주요 코드 모음

## Touch Controller 생성

```swift
let descriptor = TCTouchControllerDescriptor(mtkView: mtkView)

if TCTouchController.isSupported {
    touchController = TCTouchController(descriptor: descriptor)
}

touchController?.connect()
touchController?.render(using: renderEncoder)
```

## Button 생성

```swift
let buttonBDesc = TCButtonDescriptor()
buttonBDesc.label = TCControlLabel.buttonB
buttonBDesc.anchor = .bottomRight
buttonBDesc.contents = .buttonContents(
    forSystemImageNamed: "figure.fencing",
    size: buttonBDesc.size,
    shape: .circle,
    controller: touchController
)

touchController.addButton(descriptor: buttonBDesc)
```

## Thumbstick 숨김

```swift
let leftStickDesc = TCThumbstickDescriptor()
leftStickDesc.hidesWhenNotPressed = true
```

## 왼쪽 절반 Movement

```swift
leftStickDesc.colliderShape = .leftSide
```

## Tilt 기반 Sprint

```swift
let magnitude = simd_length(moveInput)

if magnitude > 0.8 {
    runModifier = 1.3
}
```

## 오른쪽 Touchpad

```swift
let touchpadDesc = TCTouchpadDescriptor()
touchpadDesc.label = TCControlLabel.rightThumbstick
touchpadDesc.colliderShape = .rightSide
touchpadDesc.reportsRelativeValues = true
```

## QTE Button Show/Hide

```swift
escapeButton.isEnabled = true
escapeButton.isEnabled = false
```

## Aim Delta

```swift
let prev = touch.previousLocation(in: metalView)

gc.aimTouchDelta += simd_float2(
    Float(point.x - prev.x),
    Float(point.y - prev.y)
)
```

## Custom Halo

```swift
let haloLayer = TCControlImage(
    texture: haloTexture,
    size: haloSize,
    highlight: nil,
    offset: .zero,
    tintColor: tint
)

haloThumbstickBg = TCControlContents(
    images: [haloLayer] + normalBgImages
)
```

---

# 핵심 메시지

이 세션의 핵심은 touch controller를 물리 controller의 화면 버전으로 생각하지 않는 것이다.

좋은 touch control은 기존 `GCController` input abstraction을 그대로 이용하면서도 interaction 자체는 touch에 맞게 다시 디자인한다.

```text
기존 Game Controller Logic
          +
Touch Controller framework
          +
Adaptive Layout
          +
Contextual Controls
          +
Large Touch Regions
          +
Simplified Multi-action Gestures
          +
Strong Visual Feedback
```

특히 Apple이 보여주는 방향은 명확하다.

- 버튼 수를 줄인다.
- 필요한 control만 보여준다.
- control의 의미를 icon으로 직접 표현한다.
- 작은 virtual stick 대신 화면 전체를 input surface처럼 활용한다.
- physical controller의 복잡한 chorded input을 한두 손가락 동작으로 합친다.
- 사용자가 현재 어떤 상태인지 visual feedback으로 즉시 알 수 있게 한다.

결과적으로 touch control을 잘 설계하면 controller가 없는 상황에서도 게임의 품질을 유지하는 수준을 넘어, iPhone/iPad에서 오히려 더 직접적이고 자연스러운 interaction을 만들 수 있다.

---

# 함께 보면 좋은 세션과 자료

- Design great interfaces for handheld games — Meet with Apple
- Level up with Apple game technologies — Meet with Apple
- Game Controller framework documentation
- Touch Controller framework documentation
- Metal documentation
