# WWDC26 — Refine accessibility for custom controls

- **Session:** 220
- **Title:** Refine accessibility for custom controls
- **Source:** https://developer.apple.com/videos/play/wwdc2026/220/
- **Basis:** Apple Developer 공식 전체 transcript 및 Code 섹션
- **Topics:** Accessibility, SwiftUI, VoiceOver, custom controls, passthrough gesture, custom actions, Direct Touch

---

## 🎯 한 줄 요약

커스텀 컨트롤을 접근 가능하게 만들려면, 시각적으로 자연스럽게 전달되던 정보를 **컨트롤의 목적(Purpose), 현재 값(Value), 가능한 동작(Actions), 동작 결과의 피드백(Feedback)**으로 명시적으로 제공해야 한다. 1차원 값 조절에는 `adjustable`, 정밀한 직접 조작에는 passthrough gesture, 다축/복합 동작에는 custom actions, 제스처 자체가 핵심인 인터랙티브 영역에는 Direct Touch를 활용한다.

---

## 🧭 세션 구성

| 시간 | 내용 |
|---|---|
| 0:01 | Introduction |
| 1:02 | Guiding principles |
| 8:41 | Complex controls |

Apple은 커스텀 UI가 앱만의 독특한 경험을 만들 수 있지만, VoiceOver·Switch Control 등 보조 기술을 사용하는 사람도 그 경험에 접근할 수 있어야 한다고 강조한다.

---

## 👁️ 시각 정보가 암묵적으로 전달하는 것

세션은 표준 SwiftUI `Slider`를 예로 시작한다. 화면을 볼 수 있는 사람은 별도의 설명이 없어도 다음을 즉시 이해한다.

- 트랙과 핸들의 형태를 보고 **무엇을 조절하는 컨트롤인지** 짐작한다.
- 핸들의 위치로 **현재 값**을 파악한다.
- 핸들이 움직일 것처럼 보이기 때문에 **드래그가 가능한 동작**임을 이해한다.
- 드래그하면 트랙이 채워지고 핸들이 움직이므로 **동작 결과에 대한 즉각적인 피드백**을 얻는다.

VoiceOver는 동일한 정보를 시각이 아닌 음성으로 전달한다.

> “Brightness, 50%, adjustable.”

그리고 사용자가 수행할 수 있는 동작까지 안내한다.

> “Swipe up or down with one finger to adjust the value.”

Apple이 이 예제에서 추출한 접근성 설계 원칙은 다음 네 가지다.

| 원칙 | 질문 |
|---|---|
| **Purpose** | 이 컨트롤이 무엇을 하는지 이해할 수 있는가? |
| **Value** | 컨트롤이 값을 표현한다면 현재 값을 알 수 있는가? |
| **Actions** | 어떤 동작을 할 수 있고 어떻게 실행하는지 알 수 있는가? |
| **Feedback** | 동작 이후 무엇이 바뀌었는지 알 수 있는가? |

시각적으로 자연스럽게 전달되는 정보를 보조 기술에서도 같은 수준으로 전달하는 것이 핵심이다.

---

## ☕ Coffee Dispenser: 기본 커스텀 컨트롤 개선

세션의 첫 번째 커스텀 예제는 커피 추출량을 위아래 드래그로 조절하는 `CoffeeDispenserView`다. 화면에서는 컵의 채워진 높이로 온스를 표현하지만, 초기 구현에는 별도 접근성 정보가 없다.

VoiceOver가 컨트롤의 목적·값·조작 방법을 제대로 전달하지 못하는 상태에서 다음 순서로 개선한다.

### 🏷️ 접근성 요소·Label·Value 제공

공식 Code 섹션 예제:

```swift
// Improve accessibility for coffee dispenser

import SwiftUI

struct CoffeeDispenserView: View {
    @State var coffee: Double = 0.0
    var body: some View {
        CoffeeSlider(value: coffee)
            .accessibilityElement()
            .accessibilityLabel("Coffee Dispenser")
            .accessibilityValue("\(Int(coffee)) ounces")
            .accessibilityAddTraits(.adjustable)
            .accessibilityAdjustableAction { direction in
                switch direction {
                case .increment:
                    increaseCoffeeAmount()
                case .decrement:
                    decreaseCoffeeAmount()
                }
            }
    }
}
```

적용한 정보:

- `.accessibilityElement()` — 커스텀 슬라이더를 하나의 접근성 요소로 표시
- `.accessibilityLabel("Coffee Dispenser")` — 목적 설명
- `.accessibilityValue(...)` — 현재 값 노출
- `.accessibilityAddTraits(.adjustable)` — VoiceOver에 조절 가능한 컨트롤임을 알림
- `.accessibilityAdjustableAction` — 증가/감소 동작 정의

VoiceOver 사용자는 이제 컨트롤을 선택했을 때 다음과 같은 정보를 얻는다.

> “Coffee dispenser, 6 ounces, adjustable.”

그리고 한 손가락 위/아래 스와이프로 1온스씩 값을 조절할 수 있다.

### ↕️ `adjustable`이 잘 맞는 경우

`adjustable`은 기본적으로 한 축에서 값을 증감시키는 컨트롤에 잘 맞는다.

- Slider
- Stepper와 비슷한 연속/단계형 값
- 밝기, 볼륨, 양 등

핵심은 `.increment` / `.decrement` 두 방향으로 의미 있게 모델링할 수 있는가이다.

---

## 🎯 Passthrough gesture: 정밀한 직접 조작

1온스 단위보다 더 세밀하게 조절하고 싶을 때 VoiceOver의 **passthrough gesture**를 사용할 수 있다.

동작 방식:

1. VoiceOver 사용자가 **double tap and hold**로 활성화한다.
2. 제스처는 컨트롤의 `accessibilityActivationPoint`에서 시작한다.
3. 손가락을 움직이는 동안 VoiceOver가 터치 이벤트를 컨트롤에 직접 전달한다.
4. 일반적인 VoiceOver 증감 액션보다 세밀한 직접 조작이 가능하다.

### 📍 Activation point를 현재 값 위치로 이동

기본 activation point는 컨트롤 중앙이다. Coffee Dispenser에서는 현재 커피 수위가 있는 위치에서 직접 조작이 시작되는 편이 자연스럽다.

공식 코드:

```swift
// Set the accessibility activation point

import SwiftUI

struct CoffeeDispenserView: View {
    @State var coffee: Double = 0.0

    var body: some View {
        CoffeeSlider(value: coffee)
            .accessibilityActivationPoint(
                UnitPoint(x: 0.5, y: 1 - coffee)
            )
    }
}
```

현재 값에 맞춰 activation point를 이동시키면, 사용자가 어느 방향으로든 조절할 충분한 공간을 확보할 수 있다.

---

## 🔊 Passthrough 중 피드백: Announcement throttling

Passthrough gesture에서는 값이 연속적으로 바뀔 수 있다. 모든 미세 변화마다 VoiceOver announcement를 발생시키면 지나치게 시끄럽고 실제로 필요한 정보를 듣기 어렵다.

세션은 다음 조건을 둔다.

- 이전에 말한 값과 실제 값이 달라졌는가?
- 마지막 announcement 후 **최소 0.3초**가 지났는가?

이 두 조건을 만족할 때만 새 값을 읽는다.

공식 코드:

```swift
// Post accessibility announcements

import SwiftUI

struct CoffeeDispenserView: View {
    @State var coffee: Double = 0.0

    var body: some View {
        CoffeeSlider(value: coffee)
            // ...
            .onChange(of: coffee) { _, newValue in
                if sufficientTimeSinceLastAnnouncement() && valueHasChanged() {
                    cacheLastSpokenValue(newValue)
                    AccessibilityNotification
                        .Announcement(newValue)
                        .post()
                }
            }
    }
}
```

여기서 `sufficientTimeSinceLastAnnouncement()`, `valueHasChanged()`, `cacheLastSpokenValue(_:)`는 세션의 예제 helper이며 구현은 Code 섹션에 포함되지 않는다.

### 🎧 피드백 설계의 핵심

접근성 피드백은 “많을수록 좋다”가 아니다.

- 지나치게 자주 말하면 정보가 서로 덮인다.
- 사용자가 조작 결과를 파악할 수 있는 수준으로만 제공한다.
- 값 변화가 빠른 컨트롤은 rate limiting / throttling을 고려한다.

Coffee Dispenser는 label, value, action, announcement까지 추가하면서 네 가지 guiding principle을 모두 충족한다.

---

## 🎚️ 2차원 컨트롤: Custom Actions

다음 예제는 iOS Accessibility Settings의 Background Sounds에 있는 2차원 equalizer pad다.

- 가로축: frequency
- 세로축: amplitude
- 중앙 핸들을 2차원 공간에서 자유롭게 이동

`adjustable`은 `.increment` / `.decrement`의 **한 축**만 표현하기 때문에 이런 2D 컨트롤에는 적합하지 않다.

Apple은 이 경우 **custom actions**를 사용한다.

### 🧭 Custom action이 적합한 이유

Custom action은 개발자가 임의의 이름과 동작을 정의할 수 있다.

- Move Up
- Move Right
- Move Down
- Move Left

각 action은 하나의 축을 고정된 step만큼 이동하고 값의 범위를 벗어나지 않도록 clamp한다.

공식 Code 섹션에는 다음과 같이 제시된다.

```swift
// Add custom actions

import SwiftUI

struct EqualizerView: View {
    var body: some View {
        EqualizerPad()
            .accessibilityActions("Move Up") {
                increaseY(by: 10)
            }
            .accessibilityActions("Move Right") {
                increaseX(by: 10)
            }
            .accessibilityActions("Move Down") {
                decreaseY(by: 10)
            }
            .accessibilityActions("Move Left") {
                decreaseX(by: 10)
            }
     }
 }
```

> 위 코드는 Apple 공식 Code 섹션의 표기를 그대로 옮긴 것이다. Transcript 설명에서는 `accessibilityAction` modifier라고 표현한다.

VoiceOver 사용자는 액션 목록에서 원하는 방향을 선택하고 double tap으로 실행한다. 컨트롤의 음향 변화 자체도 중요한 피드백이 된다.

### 🧩 Custom actions가 잘 맞는 경우

- 2차원 또는 다차원 컨트롤
- 기본 VoiceOver gesture 하나로 표현하기 어려운 동작
- 버튼을 화면에 추가하면 UI가 복잡해지지만 보조 기술에는 명확한 별도 액션을 노출하고 싶은 경우
- 반복적으로 수행하는 명시적 command

---

## 🐈 제스처 자체가 경험의 핵심이라면 Direct Touch

마지막 예제 `VirtualCat`은 고양이를 직접 만지는 인터랙션을 갖는다.

- 쓰다듬기 → purr
- tap → meow
- pinch → hiss

초기 상태에서는 VoiceOver가 단순한 이미지로만 인식해 이러한 제스처를 알 수 없다.

먼저 접근성 label과 현재 반응 value를 제공한다.

```swift
.accessibilityLabel("Virtual Cat")
.accessibilityValue(cat.currentReaction.description)
```

그다음 컨트롤의 제스처 자체를 사용할 수 있도록 **Direct Touch**를 적용한다.

공식 코드:

```swift
// Customize accessibility for the interactive cat surface

import SwiftUI

struct VirtualCat: View {
    var cat: CatModel
    var body: some View {
        InteractiveCatSurface()
            .accessibilityLabel("Virtual Cat")
            .accessibilityValue(cat.currentReaction.description)
            .accessibilityDirectTouch([.requiresActivation])
     }
}
```

---

## ✋ Passthrough gesture와 Direct Touch의 차이

두 기능 모두 VoiceOver가 터치 이벤트를 컨트롤에 직접 전달할 수 있게 하지만 사용 경험이 다르다.

| 항목 | Passthrough gesture | Direct Touch |
|---|---|---|
| 활성화 | double tap and hold | Direct Touch 영역 활성화 |
| 지속 시간 | 해당 passthrough gesture 동안 | focus가 다른 요소로 이동할 때까지 유지 가능 |
| 용도 | 한 번의 세밀한 직접 조작 | 제스처를 반복하거나 여러 종류의 gesture를 사용하는 영역 |
| 예제 | Coffee Dispenser 정밀 조절 | Virtual Cat의 pat/tap/pinch |

### `.requiresActivation`

Direct Touch 옵션 중 `.requiresActivation`을 사용하면 사용자가 **double tap으로 명시적으로 활성화하기 전에는** 직접 터치가 전달되지 않는다.

이렇게 하면 화면을 탐색하기 위해 손가락을 움직이는 과정에서 해당 컨트롤이 실수로 작동하는 일을 줄인다.

### `.silentOnTouch`

또 다른 옵션은 `.silentOnTouch`다.

- 직접 터치하는 동안 VoiceOver가 말하지 않는다.
- 컨트롤 자체가 풍부한 오디오 피드백을 제공하는 경우 유용하다.
- VoiceOver 음성이 앱의 오디오 결과를 덮는 상황을 피한다.

세션의 Virtual Cat 예제는 `.requiresActivation`을 사용한다.

---

## ⚠️ Direct Touch만으로 끝내면 안 되는 이유

Apple은 **모든 사람이 Direct Touch gesture를 수행할 수 있는 것은 아니다**라고 강조한다.

따라서 가능하면 같은 기능을 다른 방식으로도 제공한다.

- Custom actions
- 명시적인 accessible button/action
- Switch Control로 실행 가능한 경로
- Voice Control로 호출 가능한 경로

Direct Touch는 기존 gesture experience를 접근 가능하게 만드는 중요한 수단이지만, 유일한 경로가 되어서는 안 된다.

---

## 🧠 컨트롤 유형별 접근성 전략

| 컨트롤 형태 | 우선 고려할 접근성 방식 |
|---|---|
| 단순 버튼/토글 | Label, trait, standard action |
| 1차원 연속/단계 값 | `adjustable` + `accessibilityAdjustableAction` |
| 세밀한 직접 이동 | Passthrough + `accessibilityActivationPoint` |
| 값 변화가 빠름 | Throttled accessibility announcement |
| 2D/다축 조절 | Custom actions |
| 여러 gesture가 핵심 | Direct Touch |
| 자체 오디오가 핵심 | Direct Touch + `.silentOnTouch` 검토 |
| Direct Touch가 어려운 사용자까지 지원 | Custom actions 등 대체 경로 병행 |

---

## 🧪 VoiceOver로 직접 검증하기

세션의 마지막 권고는 매우 실용적이다.

> VoiceOver를 켜고 앱을 직접 사용해 보라.

커스텀 컨트롤마다 다음을 확인한다.

### Purpose
- [ ] VoiceOver가 무엇을 조절하는 컨트롤인지 말해 주는가?
- [ ] 단순히 “image”, “button”처럼 의미 없는 설명으로 끝나지 않는가?

### Value
- [ ] 현재 값이 있다면 노출되는가?
- [ ] 단위가 필요한 경우 함께 전달되는가?
- [ ] 값 변경 후 최신 상태가 읽히는가?

### Actions
- [ ] 사용자가 무엇을 할 수 있는지 알 수 있는가?
- [ ] `adjustable`, custom actions, Direct Touch 중 인터랙션 모델에 맞는 수단을 사용했는가?
- [ ] 다축 컨트롤을 억지로 increment/decrement 한 축에 축소하지 않았는가?

### Feedback
- [ ] 동작 직후 결과를 알 수 있는가?
- [ ] 시각 변화만 존재하고 VoiceOver에는 아무것도 전달되지 않는 경우가 없는가?
- [ ] 연속 값에서는 announcement가 너무 자주 발생하지 않는가?
- [ ] 자체 오디오가 있다면 VoiceOver와 충돌하지 않는가?

### Alternative interaction
- [ ] Direct Touch를 사용할 수 없는 사용자도 동일 기능에 접근 가능한가?
- [ ] Custom actions 등 대체 경로가 있는가?
- [ ] Switch Control·Voice Control에서도 핵심 기능에 접근 가능한가?

---

## 📋 구현 체크리스트

- [ ] 커스텀 컨트롤마다 Purpose / Value / Actions / Feedback 정의
- [ ] `.accessibilityElement()` 필요 여부 확인
- [ ] 명확한 `.accessibilityLabel` 제공
- [ ] 값이 있는 경우 `.accessibilityValue` 제공
- [ ] 1축 값에는 `.adjustable` trait 검토
- [ ] `.accessibilityAdjustableAction`으로 increment/decrement 구현
- [ ] Passthrough가 필요한 경우 `accessibilityActivationPoint`를 실제 핸들/현재 값 위치에 맞춤
- [ ] 연속 변화 announcement에 throttling 적용
- [ ] 다축 컨트롤은 custom actions로 의미 있는 방향/명령 제공
- [ ] gesture-rich surface는 Direct Touch 검토
- [ ] Direct Touch의 `.requiresActivation` 필요 여부 검토
- [ ] 자체 오디오가 중요한 경우 `.silentOnTouch` 검토
- [ ] Direct Touch 외 대체 접근 경로 제공
- [ ] VoiceOver를 켜고 실제 gesture 흐름 전체 테스트
- [ ] Switch Control / Voice Control 등 다른 보조 기술의 접근 경로도 확인

---

## 💡 핵심 메시지

커스텀 컨트롤의 접근성은 기존 시각 디자인에 label 하나를 붙이는 작업이 아니다. 사용자가 화면을 보면서 자연스럽게 얻는 **목적, 값, 가능한 동작, 결과 피드백** 전체를 보조 기술이 이해할 수 있는 인터랙션으로 다시 표현해야 한다.

`adjustable`, passthrough gesture, custom actions, Direct Touch는 각각 다른 상호작용 문제를 해결한다. 컨트롤의 실제 조작 모델에 맞는 방식을 선택하고, Direct Touch처럼 일부 사용자에게 어려울 수 있는 방식에는 반드시 대체 액션을 함께 제공하는 것이 세션의 핵심이다.

---

## 🔗 관련 공식 자료

- [Refine accessibility for custom controls — WWDC26](https://developer.apple.com/videos/play/wwdc2026/220/)
- [Accessible controls](https://developer.apple.com/design/human-interface-guidelines/accessibility#Accessible-controls)
- [Accessible descriptions](https://developer.apple.com/design/human-interface-guidelines/accessibility#Accessible-descriptions)
- [Accessibility fundamentals](https://developer.apple.com/documentation/accessibility/accessibility-fundamentals)
- [Creating accessible views](https://developer.apple.com/documentation/accessibility/creating-accessible-views)
- WWDC24 — Catch up on accessibility in SwiftUI
