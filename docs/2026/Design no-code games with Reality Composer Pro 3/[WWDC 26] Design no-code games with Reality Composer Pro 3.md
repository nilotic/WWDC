# WWDC26 Design no-code games with Reality Composer Pro 3 요약

- Session: 252
- Title: Design no-code games with Reality Composer Pro 3
- Source: https://developer.apple.com/videos/play/wwdc2026/252/
- Topic: Reality Composer Pro 3, ScriptGraph, RealityKit, visionOS, Visual Scripting, SwiftUI
- Chapters: Introduction, Meet ScriptGraph, A wish..., Build the game, Advanced techniques, Next steps

---

## 한 줄 요약

Reality Composer Pro 3의 **ScriptGraph**를 이용하면 코드를 직접 작성하지 않고도 event-driven 로직, drag interaction, physics, reusable subgraph, custom event, material 변경을 구성할 수 있고, 필요할 때 Xcode와 SwiftUI를 연결해 더 복잡한 UI와 네이티브 동작까지 확장할 수 있다.

---

## 핵심 요약

이번 세션은 Reality Composer Pro 3의 ScriptGraph를 사용해 visionOS용 간단한 게임을 처음부터 만드는 과정을 보여준다.

예제 게임의 핵심 아이디어는 다음과 같다.

- 잠든 다람쥐가 들고 있는 도토리를 사용자가 집어 듦
- 도토리를 자유롭게 움직여 다람쥐를 집으로 유도
- 다람쥐는 도토리의 위치를 따라봄
- 도토리를 뺏기면 표정이 바뀜
- SwiftUI speech bubble로 다람쥐가 반응
- 이후 점프, 이동, draggable leaves, level navigation 등으로 확장 가능

세션에서 다루는 주요 기능은 다음과 같다.

- ScriptGraph의 event-driven 구조
- `On Drag`와 `Set Transform`
- public input variable과 override
- Physics Body와 `Add Force`
- ScriptGraph 변수와 delta 계산
- Runtime component 변경
- Subgraph / Prototyped Subgraph
- Custom Node Library와 Custom Event
- 여러 ScriptGraph 사이 이벤트 전달
- Material parameter 변경
- Reality Composer Pro에서 Vision Pro live preview
- Xcode project 자동 생성
- Scene Event와 SwiftUI attachment 연결
- Coding Intelligence로 glue code 작성

---

# 🎮 Reality Composer Pro 3와 빠른 프로토타이핑

세션의 출발점은 빠른 반복이다.

아이디어를 만들 때 중요한 것은 처음부터 완벽한 시스템을 설계하는 것이 아니라 다음 과정을 빠르게 반복하는 것이다.

```text
Idea
 ↓
Mock up
 ↓
Test
 ↓
Adjust
 ↓
Repeat
```

Reality Composer Pro 3는 이 흐름을 코드 없이 수행할 수 있도록 ScriptGraph를 제공한다.

특히 spatial interaction은 실제 기기에서 느껴지는 감각이 중요하기 때문에, logic을 만들고 바로 Vision Pro에서 테스트하는 짧은 iteration loop가 큰 장점이다.

---

# 🧩 ScriptGraph란?

ScriptGraph는 Reality Composer Pro의 **node-based visual scripting** 시스템이다.

핵심은 event-driven logic이다.

즉 어떤 event가 발생하면 node graph가 동작한다.

예:

- Pinch event → 잎 열기
- Drag gesture → 물체 이동
- Custom event → level scroll
- 특정 상태 변경 → 다른 entity 반응

기본 구조는 다음과 같다.

```text
Event Node
   ↓
Logic / Math
   ↓
Set Node
   ↓
Component 변경
```

ScriptGraph를 사용하면 RealityKit entity와 component의 상태를 시각적으로 연결해 게임 로직을 만들 수 있다.

---

# 🌰 예제 게임의 시작점

게임의 주인공은 작은 다람쥐다.

다람쥐는 도토리를 가지고 잠들어 있다.

사용자는 도토리를 집어서 자유롭게 움직이고, 그 도토리로 다람쥐를 집으로 유도한다.

세션은 매우 단순한 한 가지 상호작용에서 시작한다.

> 사용자가 도토리를 집고 움직일 수 있게 만들기

복잡한 게임 전체를 한 번에 구현하지 않고 핵심 interaction부터 만들어 감각을 확인한다.

---

# 🎨 Cut-out 스타일

다람쥐와 도토리는 복잡한 3D model이 아니라 texture가 적용된 단순한 plane으로 구성한다.

즉 3D 공간 안에 2D illustration이 존재하는 cut-out 스타일이다.

이 접근은 다음 장점이 있다.

- Asset 제작 비용 감소
- 강한 시각적 스타일
- 빠른 prototyping
- Material 교체로 표정 변경이 쉬움

게임 mechanics와 style을 동시에 빠르게 실험하기에 적합하다.

---

# 🎯 Interaction을 위한 Entity Components

도토리를 gaze target과 draggable object로 만들기 위해 여러 component를 추가한다.

## Input Target Component

Entity를 interaction 대상으로 만든다.

사용자의 gaze나 gesture가 해당 entity를 대상으로 할 수 있다.

## Collision Component

Interaction target의 물리적 영역을 정의한다.

도토리를 실제로 쉽게 선택할 수 있는 hit area를 구성한다.

## Hover Effect Component

사용자가 도토리를 바라볼 때 highlight effect를 보여준다.

시각적으로 interaction 가능하다는 피드백을 제공한다.

---

# 🧱 첫 ScriptGraph 만들기

Project Browser에서 새 ScriptGraph를 만든다.

세션에서는 이름을 다음과 같이 지정한다.

```text
dragNut
```

그 다음 도토리 entity에 `Scripting Component`를 추가하고 `dragNut` ScriptGraph를 연결한다.

이렇게 하면 해당 graph의 logic이 도토리 entity에서 실행된다.

---

# 🖐️ `On Drag` Event

모든 ScriptGraph logic은 event에서 시작한다.

도토리를 움직이기 위해 `On Drag` event node를 사용한다.

`On Drag`는 drag gesture의 정보를 제공한다.

예:

- Scene Location
- Scene Translation
- Drag state

가장 단순한 구현에서는 drag gesture의 위치를 그대로 entity transform에 적용한다.

---

# 📍 `Set Transform`

Set node는 component 또는 다른 data에 값을 쓰는 역할을 한다.

도토리 위치를 바꾸기 위해 `Set Transform` node를 사용한다.

흐름은 다음과 같다.

```text
On Drag
   │
   ├─ Trigger ───────→ Set Transform
   │
   └─ Scene Location → Translation
```

사용자가 drag할 때마다 `Set Transform`이 실행되고 도토리의 position이 drag 위치를 따라간다.

---

# ▶️ Reality Composer Pro 안에서 즉시 테스트

ScriptGraph를 만든 뒤 별도의 Xcode build 없이 Reality Composer Pro viewport에서 바로 테스트할 수 있다.

상단의 Play button을 누르면 interaction을 실행할 수 있다.

즉 다음 loop가 매우 짧다.

```text
Node 수정
 ↓
Play
 ↓
Interaction 확인
 ↓
Node 수정
```

세션에서 강조하는 핵심 workflow 중 하나다.

---

# 🥽 Vision Pro Live Preview

Spatial interaction은 Mac 화면에서만 확인해서는 충분하지 않을 수 있다.

Reality Composer Pro 3는 Vision Pro에서 직접 preview하는 기능을 제공한다.

세션에서는 다음 흐름을 사용한다.

1. Simulation Mode 변경
2. `Preview on Device` 선택
3. Vision Pro 선택
4. Play 실행

Scene이 실제 공간에 나타나고 사용자는 gaze와 hand interaction으로 직접 조작할 수 있다.

이 기능은 세션에서 later this year 제공 예정인 기능으로 소개된다.

---

# 🎚️ Public Input Variable

Vision Pro에서 테스트해 보니 도토리를 움직이기 위해 손을 너무 많이 움직여야 했다.

이를 조절하기 위해 drag translation에 multiplier를 적용한다.

```text
On Drag Scene Translation
          ↓
Multiply by Number
          ↓
Movement
```

하지만 multiplier 값을 node 안에 고정하면 반복 조정이 불편하다.

그래서 ScriptGraph에 public input variable을 만든다.

```text
dragSpeed
Type: Number
Default: 1.3
Public: Yes
```

---

# 🧪 실시간 Parameter Tuning

Public variable은 entity의 Scripting Component inspector에 노출된다.

따라서 Vision Pro에서 interaction을 테스트하면서 Mac Virtual Display를 열어 값을 바로 변경할 수 있다.

세션에서는 다음처럼 여러 값을 시도한다.

- 1.5
- 1.1
- 1.15

그리고 interaction의 느낌이 가장 좋은 값을 선택한다.

이 workflow의 핵심은 숫자를 이론적으로 결정하는 것이 아니라 실제 hand interaction을 느끼며 조정하는 것이다.

---

# 📝 Override

Public variable 값을 특정 Scripting Component에서 변경하면 이름이 bold로 표시된다.

이는 해당 값이 ScriptGraph 자체의 default가 아니라 **Override**라는 뜻이다.

Override는 각 Scripting Component에 고유하다.

따라서 여러 entity가 같은 ScriptGraph를 공유하면서 서로 다른 parameter를 사용할 수 있다.

예:

```text
Nut A: dragSpeed = 1.0
Nut B: dragSpeed = 1.4
Nut C: dragSpeed = 0.8
```

Logic은 하나지만 tuning 값은 entity별로 다르게 설정할 수 있다.

---

# ⚙️ Transform 기반 이동에서 Physics 기반 이동으로

단순히 transform을 직접 변경하면 움직임이 다소 기계적으로 느껴질 수 있다.

세션에서는 도토리를 던질 수 있고 더 물리적으로 느껴지게 만들기 위해 physics를 추가한다.

먼저 도토리에 `Physics Body Component`를 추가한다.

그 다음 drag gesture가 transform을 직접 바꾸는 대신 physics force를 발생시키도록 변경한다.

---

# 💥 `Add Force` Node

`Add Force` node는 physics simulation에 힘을 추가한다.

단순 위치 변경과 달리 다음 효과가 생긴다.

- inertia
- momentum
- toss
- gravity
- physical response

사용자는 도토리를 끌다가 놓아 실제처럼 던질 수 있다.

---

# 📐 Drag Delta 계산

`Add Force`에는 단순한 위치보다 **시간에 따른 이동 변화량**이 필요하다.

하지만 drag event가 이 delta를 직접 제공하지 않는다.

그래서 ScriptGraph 안에서 직접 계산한다.

1. 현재 drag translation 저장
2. 이전 translation 기억
3. 두 값의 차이를 계산
4. `dragDelta` 변수에 저장
5. multiplier 적용
6. `Add Force`에 전달

```text
Current Position
-
Previous Position
=
Drag Delta
```

---

# 🗃️ ScriptGraph Variable

세션에서는 drag 관련 정보를 저장하기 위해 변수들을 사용한다.

예:

- `targetPosition`
- `dragDelta`

`Set Variable` node를 사용하면 graph 내부에서 값을 저장하고 이후 logic에서 재사용할 수 있다.

---

# 🌍 Gravity 문제

Physics 기반 drag를 적용하면 도토리를 던지는 느낌은 좋아진다.

하지만 잡고 들어 올리는 동안 gravity가 계속 작용하기 때문에 위로 움직이기 어려워진다.

이 문제를 해결하기 위해 drag 중에는 Physics Body 설정을 동적으로 변경한다.

---

# 🧲 `Set PhysicsBodyComponent`

`Set PhysicsBodyComponent` node는 runtime에서 Physics Body Component의 parameter를 바꾼다.

세션에서는 drag 중 다음 변경을 적용한다.

- Gravity 영향 비활성화
- Linear damping 증가

효과:

- 잡고 있는 동안 gravity가 방해하지 않음
- movement가 덜 민감하고 안정적
- 놓으면 다시 자연스럽게 physics 적용

---

# 🔁 Pickup과 Drop 상태 처리

Drag 시작과 종료에 따라 physics setting을 다르게 적용한다.

```text
Pickup
 ↓
Gravity Off
Damping Up

Drop
 ↓
Gravity Restore
Damping Restore
```

이렇게 하면 direct manipulation과 physics simulation의 장점을 함께 사용할 수 있다.

---

# 🧠 ScriptGraph의 기본 패턴

세션은 여기까지의 구조를 ScriptGraph의 기본 개념으로 정리한다.

```text
Event Node
    ↓
Logic / Math
    ↓
Set Node
    ↓
Component Modification
```

이 단순한 패턴으로도 다양한 게임 mechanics를 구성할 수 있다.

---

# 🧹 복잡해지는 Graph 정리하기

Logic이 커지면 node graph가 빠르게 복잡해질 수 있다.

세션에서는 반복 logic과 복잡한 node 묶음을 정리하기 위해 Subgraph를 사용한다.

예제로 drag event의 `isEnd` boolean 값이 변했는지 확인하는 logic을 사용한다.

여러 node를 그대로 두면 나중에 graph를 다시 열었을 때 의도를 이해하기 어려울 수 있다.

---

# 🧩 Compose Subgraph

관련 node들을 선택하고 `Compose Subgraph`를 실행하면 하나의 작은 graph로 묶을 수 있다.

세션에서는 다음 이름을 사용한다.

```text
Check for Change
```

장점:

- Graph readability 개선
- Intent 명확화
- 복잡한 logic 숨김
- 유지보수 쉬움

---

# ♻️ Prototyped Subgraph

특정 Subgraph가 여러 ScriptGraph에서 반복 사용된다면 `Prototyped Subgraph`로 변환할 수 있다.

```text
Subgraph
 ↓
Convert to Prototyped Subgraph
 ↓
Asset Browser 등록
 ↓
다른 ScriptGraph에서도 사용
```

생성된 Prototyped Subgraph는 Add Node menu에서 일반 node처럼 사용할 수 있다.

---

# 🧱 Reusable Visual Logic

Prototyped Subgraph는 visual scripting에서도 재사용 가능한 작은 building block을 만들 수 있게 한다.

예:

- Bool change detection
- Common animation trigger
- State transition
- Distance check
- Interaction filter

중복 logic을 줄이고 graph를 간결하게 유지할 수 있다.

---

# 🐿️ 다람쥐가 도토리를 바라보게 만들기

현재 상태에서는 사용자가 도토리를 움직여도 다람쥐가 반응하지 않는다.

더 살아 있는 캐릭터처럼 보이도록 다람쥐가 도토리의 위치를 따라보게 만든다.

이를 위해 다람쥐에도 별도의 ScriptGraph를 추가한다.

문제는 두 ScriptGraph 사이에서 정보를 전달해야 한다는 것이다.

---

# 📡 Custom Event

ScriptGraph 사이의 통신에는 Custom Event를 사용할 수 있다.

먼저 Project Browser에서 Custom Node Library를 만든다.

그리고 Custom Event를 추가한다.

세션에서는 다음 이름을 사용한다.

```text
nutIsDragged
```

다람쥐가 도토리 위치를 알아야 하므로 event에 property를 추가한다.

```text
nutPosition
```

---

# 🔄 Sync Nodes

Custom Event를 정의한 뒤 `Sync Nodes`를 실행하면 해당 event node가 ScriptGraph에서 사용할 수 있게 된다.

이후 다음 두 종류의 node가 생성된다.

- Send `nutIsDragged`
- On `nutIsDragged`

---

# 📤 Nut ScriptGraph에서 Event 보내기

도토리의 ScriptGraph는 drag 중 다음 event를 보낸다.

```text
Send "nutIsDragged"
```

Event payload에는 도토리의 world position을 넣는다.

```text
nutPosition = Nut World Position
```

---

# 📥 Squirrel ScriptGraph에서 Event 받기

다람쥐 ScriptGraph에는 다음 event node를 사용한다.

```text
On "nutIsDragged"
```

Event에서 받은 `nutPosition`으로 다람쥐의 rotation을 계산한다.

그 결과 다람쥐는 움직이는 도토리를 따라 고개를 돌린다.

---

# 🎭 캐릭터 스타일과 반응

세션에서는 단순히 정확한 rotation을 만드는 것보다 게임의 visual style에 맞는 반응을 선택한다.

다람쥐는 부드럽게 회전하기보다 cut-out 스타일을 강조하는 빠르고 snappy한 flip을 사용한다.

Interaction design과 visual style이 일치하도록 만드는 것이 중요하다.

---

# 😠 Material 변경으로 표정 바꾸기

도토리를 뺏기면 다람쥐가 화난 표정으로 바뀌게 한다.

다람쥐 Material의 Shader Graph에 public input variable을 추가한다.

```text
isNutDragged
Type: Bool
```

이 값에 따라 두 개의 squirrel texture 중 하나를 선택한다.

```text
false → 기본 표정
true  → 화난 표정
```

---

# 🎨 `Set Material Parameter`

ScriptGraph에서 Material parameter를 변경하기 위해 `Set Material Parameter` node를 사용한다.

설정:

- Parameter type: Bool
- Parameter name: `isNutDragged`
- Target entity: Squirrel Model Component

Drag 상태에 따라 true / false를 전달하면 Material이 즉시 변경된다.

---

# 💬 SwiftUI Speech Bubble

다람쥐의 감정을 더 명확하게 표현하기 위해 speech bubble을 추가한다.

세션에서는 SwiftUI를 사용한다.

SwiftUI는 이런 interface를 만들기 쉽고 platform-native appearance를 제공한다.

다만 SwiftUI를 사용하려면 게임을 Xcode와 함께 실행해야 한다.

---

# 🛠️ Reality Composer Pro에서 Xcode 프로젝트 생성

처음에는 Xcode project 없이 Reality Composer Pro 안에서 작업했다.

SwiftUI가 필요해지면 preview mode를 다음으로 변경한다.

```text
Run with Xcode
```

Xcode project가 없는 경우 Reality Composer Pro 3가 자동으로 project를 생성할 수 있다.

즉 no-code prototype으로 시작했다가 필요해지는 순간 code-based project로 확장할 수 있다.

---

# 📣 Scene Event로 Swift와 연결

ScriptGraph와 Swift 코드 사이의 통신에도 event를 사용할 수 있다.

세션에서는 `Send Scene Event` node를 사용한다.

Event 이름:

```text
squirrelTalk
```

Event에는 문자열 variable을 추가한다.

```text
sayThis
```

예:

```text
Hey, that's my nut!
```

---

# 🤖 Coding Intelligence 활용

발표자는 디자이너 입장에서 필요한 Swift glue code를 직접 작성하는 대신 Coding Intelligence에 요청한다.

요청 내용은 개념적으로 다음과 같다.

- `squirrelTalk` Scene Event 구독
- `sayThis` variable 읽기
- 값을 state에 저장
- 다람쥐 entity 위에 SwiftUI attachment 표시
- Speech Bubble의 text로 `sayThis` 사용

---

# 🧑‍💻 Swift에서 Scene Event 구독

세션의 예제 코드는 다음과 같은 흐름을 가진다.

```swift
if let scene = entity.scene {
    scene.subscribe(forEventName: "squirrelTalk", on: { event in
        if let sayThis: String = try? event.value("sayThis") {
            self.sayThis = sayThis
        }
    }).store(in: &cancellables)
}
```

Scene Event의 string payload를 읽어 SwiftUI state에 저장한다.

---

# 🪧 SwiftUI Attachment

Speech bubble은 RealityView의 attachment로 표시한다.

```swift
Attachment(id: "squirrelTalk") {
    SquirrelTalkAttachmentView(text: sayThis)
}
```

이 attachment를 다람쥐 entity 위에 배치해 character dialogue UI로 사용한다.

---

# 🔗 ScriptGraph와 Swift의 역할 분리

| 영역 | 역할 |
|---|---|
| Reality Composer Pro | Scene 구성 |
| ScriptGraph | Gameplay logic, events, component control |
| Shader Graph | Material reaction |
| Swift | Native event handling |
| SwiftUI | Speech bubble과 UI |
| Coding Intelligence | 필요한 glue code 생성 지원 |

이 방식은 디자이너가 visual scripting 중심으로 작업하면서 필요한 부분만 native code로 확장하게 해준다.

---

# 🚀 더 확장할 수 있는 Gameplay

세션에서는 같은 구조를 사용해 다음 기능까지 확장할 수 있다고 설명한다.

- 다람쥐 걷기
- 점프
- 도토리 되찾기
- Draggable leaves
- 전체 level 이동
- Waypoint 기반 level scroll
- visionOS ornament를 이용한 level jump

즉 처음의 간단한 drag interaction에서 점진적으로 전체 게임 mechanics를 만들 수 있다.

---

# 🧭 ScriptGraph 사용 흐름

| 단계 | 작업 |
|---|---|
| Scene 구성 | Entity와 visual asset 배치 |
| Interaction target | Input Target, Collision, Hover Effect 추가 |
| ScriptGraph 생성 | Entity에 Scripting Component 연결 |
| Event | Drag, pinch 등 interaction 수신 |
| Logic | Math, variable, condition 구성 |
| Set | Transform / Physics / Material 변경 |
| Test | Reality Composer Pro viewport |
| Device Preview | Vision Pro에서 interaction 확인 |
| Parameter tuning | Public input variable로 조절 |
| Physics | Add Force와 Physics Body 사용 |
| Refactor | Subgraph 구성 |
| Reuse | Prototyped Subgraph 생성 |
| Communication | Custom Event 사용 |
| Character reaction | Material parameter 변경 |
| Native extension | Xcode project 생성 |
| SwiftUI | Scene Event와 Attachment 연결 |

---

# 📋 체크리스트

## Scene과 Interaction
- [ ] Interaction 대상에 Input Target Component 추가
- [ ] 적절한 Collision Component 설정
- [ ] Hover Effect가 필요한지 검토
- [ ] ScriptGraph를 실행할 entity에 Scripting Component 연결
- [ ] Event node가 예상 interaction과 일치하는지 확인

## Drag Interaction
- [ ] `On Drag` event 사용
- [ ] Scene Location과 Scene Translation 차이 이해
- [ ] 단순 이동이면 `Set Transform` 사용 검토
- [ ] Drag sensitivity를 public input variable로 노출
- [ ] Vision Pro에서 실제 hand movement로 tuning
- [ ] Entity별 override가 필요한지 확인

## Physics
- [ ] Physics Body Component 추가
- [ ] Transform 직접 변경 대신 `Add Force` 사용 필요 여부 검토
- [ ] 이전 / 현재 drag position 저장
- [ ] Drag delta 계산
- [ ] Force multiplier tuning
- [ ] Drag 중 gravity 비활성화 필요 여부 확인
- [ ] Linear damping 조절
- [ ] Pickup / Drop에서 physics setting 복원

## Graph 구조
- [ ] 복잡한 logic을 Subgraph로 정리
- [ ] Subgraph 이름이 동작 의도를 설명하는지 확인
- [ ] 반복 logic은 Prototyped Subgraph로 전환
- [ ] 여러 graph에서 reusable logic 활용

## Custom Event
- [ ] Custom Node Library 생성
- [ ] Custom Event 정의
- [ ] 필요한 event payload property 추가
- [ ] Sync Nodes 실행
- [ ] Send / On event node 연결
- [ ] World position 등 coordinate space 확인
- [ ] 여러 ScriptGraph 간 event 흐름 테스트

## Material
- [ ] Shader Graph에 public input parameter 구성
- [ ] ScriptGraph의 parameter 이름과 일치하는지 확인
- [ ] `Set Material Parameter` target entity 확인
- [ ] Interaction state에 따라 material reaction 검증

## Xcode / SwiftUI
- [ ] SwiftUI가 필요한 시점에 `Run with Xcode` 사용
- [ ] Reality Composer Pro에서 Xcode project 생성
- [ ] Scene Event 이름 정의
- [ ] Event payload type 정의
- [ ] Swift에서 event subscription 처리
- [ ] Subscription lifecycle 관리
- [ ] SwiftUI attachment를 올바른 entity에 배치
- [ ] Coding Intelligence로 glue code 생성 시 결과 검토

## Iteration
- [ ] Reality Composer Pro에서 빠르게 Play 테스트
- [ ] Spatial interaction은 Vision Pro에서도 확인
- [ ] Mac Virtual Display를 이용한 실시간 parameter tuning 검토
- [ ] Visual style과 interaction animation이 일치하는지 확인
- [ ] Logic이 커질 때 graph readability 유지

---

# 핵심 메시지

Reality Composer Pro 3의 ScriptGraph는 코드를 쓰지 않고도 RealityKit 기반 게임 로직을 만드는 visual scripting 도구다.

기본 구조는 매우 단순하다.

**Event를 받고, logic을 수행하고, component를 변경한다.**

하지만 이 패턴에 physics, public variable, subgraph, custom event, material parameter를 결합하면 상당히 복잡한 gameplay도 구성할 수 있다.

가장 중요한 장점은 빠른 iteration이다.

Reality Composer Pro에서 logic을 수정하고 바로 실행하며, Vision Pro에서 interaction을 직접 느끼면서 parameter를 조절할 수 있다.

그리고 visual scripting의 범위를 넘어서는 UI나 native behavior가 필요해지는 순간에는 Reality Composer Pro가 Xcode project를 생성하고, Scene Event를 통해 Swift와 ScriptGraph를 연결할 수 있다.

즉 **no-code prototype → visual gameplay logic → native SwiftUI integration**으로 자연스럽게 확장할 수 있는 workflow다.

---

# 함께 보면 좋은 세션

- Explore advances in RealityKit
- Extend Reality Composer Pro 3 functionality with Xcode
- Iterate your spatial scenes faster with Reality Composer Pro 3
- Supercharge your spatial workflows with Reality Composer Pro 3
