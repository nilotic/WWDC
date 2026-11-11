# WWDC26 — Supercharge your spatial workflows with Reality Composer Pro 3

- **Session:** 393
- **Speaker:** Vincent, Reality Composer Pro engineer
- **Source:** https://developer.apple.com/videos/play/wwdc2026/393/
- **Basis:** Apple Developer 공식 전체 transcript
- **Topic:** Reality Composer Pro 3, Animation Graph, Behavior Tree, Script Graph, Navigation Mesh, Compute Graph, Shader Graph

---

## 🎯 한 줄 요약

Reality Composer Pro 3는 캐릭터 애니메이션, 자율 행동, 사용자 상호작용, 경로 탐색, GPU 파티클 시뮬레이션, 재질 표현을 각각의 **visual node-based graph**로 구성하고 서로 연결함으로써, Swift 코드를 반복해서 빌드하지 않고도 에디터 안에서 상당한 수준의 spatial experience를 직접 제작·실험할 수 있게 한다.

---

## 🧭 세션 구성

| 시간 | Chapter | 핵심 |
|---|---|---|
| 0:00 | Introduction | Reality Composer Pro 3의 visual workflow 전체 개요 |
| 2:10 | Animation Graph | Idle/Walk state machine과 runtime parameter |
| 6:21 | Behavior Tree | 캐릭터의 자율적 multi-step routine 구성 |
| 11:22 | Script Graph | 이벤트 기반 상호작용과 Behavior Tree parameter 제어 |
| 14:46 | Navigation Mesh | obstacle avoidance와 off-mesh connection |
| 17:08 | Compute Graph | Metal 기반 GPU particle simulation |
| 19:43 | Shader Graph enhancements | PBR Surface 2, Hair, Portal 관련 개선 |
| 21:12 | Next steps | 관련 세션 및 Reality Composer Pro 3 활용 방향 |

---

## 🧩 Reality Composer Pro 3의 역할

Reality Composer Pro는 3D scene 구성, material 제작, visual effect, lighting, interactivity 등을 한 곳에서 다루는 visual editor다. 이번 세션의 메시지는 개별 기능을 따로 보여주는 데서 끝나지 않고, **여러 종류의 graph를 하나의 장면 안에서 어떻게 결합하는지**에 있다.

예제로 사용하는 것은 **Chaparral Village** 게임의 alchemy area다. 게임 자체는 Reality Composer Pro 3와 Swift를 이용해 제작되었고, 세션에서는 이 장면의 alchemist 캐릭터와 cauldron을 중심으로 다음 목표를 단계별로 구현한다.

- alchemist가 자연스럽게 idle ↔ walk animation을 전환한다.
- table로 이동해 ingredients를 준비한다.
- 사용자가 캐릭터를 tap하기 전까지 table에서 기다린다.
- tap하면 cauldron으로 이동해 potion을 만들기 시작한다.
- obstacle을 피해 자율적으로 이동할 수 있다.
- cauldron에서 GPU 기반 smoke particle을 렌더링한다.
- material 표현에는 새 Shader Graph 기능을 활용한다.

세션 전체를 관통하는 구분은 다음과 같다.

| 도구 | 담당 역할 |
|---|---|
| **Animation Graph** | 캐릭터가 *어떻게 움직여 보이는지* |
| **Behavior Tree** | 캐릭터가 *무슨 순서로 행동하는지* |
| **Script Graph** | 외부 event가 *언제 행동을 바꾸는지* |
| **Navigation Mesh** | 캐릭터가 *어떤 경로로 목적지에 도달하는지* |
| **Compute Graph** | GPU가 *particle simulation을 어떻게 수행하는지* |
| **Shader Graph** | surface/particle이 *어떻게 보이는지* |

즉, 하나의 거대한 visual script에 모든 책임을 몰아넣는 방식이 아니라, **책임별 graph를 나누고 runtime parameter와 event로 연결**한다.

---

## 🎞️ Animation Graph — 캐릭터의 동작 상태 만들기

Animation Graph는 Reality Composer Pro 3의 visual node-based animation editor다. 세션에서는 motion warping, blend space, inverse kinematics 같은 더 넓은 기능 범위가 있음을 언급하지만, 실제 데모는 **State Machine + Animation Clip + Transition Condition + Runtime Parameter**에 집중한다.

### Final Pose에서 시작

Animation Graph는 기본적으로 `Final Pose` node를 가지고 시작한다. 이 node로 흘러 들어온 pose가 최종적으로 캐릭터에 표시된다.

alchemist에는 두 상태가 필요하다.

- `Idle`
- `Walk`

`Final Pose` 앞에 `State Machine` node를 연결하고, 그 안에 두 개의 `Animation State` node를 만든다.

### State와 Transition

두 state만 만들면 서로 전환할 방법이 없다. 따라서 다음 두 transition을 만든다.

- `Idle → Walk`
- `Walk → Idle`

Transition이 실제로 언제 일어날지는 **runtime parameter**가 결정한다. Inputs Inspector에 Boolean `isWalking`을 만들고 transition condition에 연결한다.

- `isWalking == true` → Idle에서 Walk로 전환
- `isWalking == false` → Walk에서 Idle로 전환

State Machine 밖으로 돌아오면 Idle과 Walk 각각에 animation source가 필요하므로 `Animation Clip` node를 연결하고 각각 idle timeline과 walk timeline을 지정한다.

### Editor 안에서 바로 테스트

Play를 누른 상태에서 Inspector의 `isWalking` 값을 직접 바꾸면:

- false: idle animation 재생
- true: walk animation으로 blend
- 다시 false: 현재 walk cycle을 마친 뒤 idle로 blend

Graph Editor에서는 현재 active state가 highlight된다. Apple은 이 시각화가 state가 많아질수록 debugging에 특히 유용하다고 설명한다.

### 중요한 설계 포인트

Animation Graph는 **목적지나 행동 순서를 결정하지 않는다.** `isWalking`이라는 외부 입력을 받아 그 상태에 맞는 motion을 표현한다. 이후 Behavior Tree가 이 parameter를 제어하면서 실제 행동과 animation이 연결된다.

---

## 🌳 Behavior Tree — 자율적인 multi-step routine 구성

Behavior Tree는 autonomous behavior를 직접 에디터에서 만들기 위한 계층 구조다. 캐릭터가 patrol하거나 event에 반응하거나 일정한 routine을 수행하는 동작을 코드 없이 구성할 수 있다.

### 평가 순서

Tree는:

1. 위에서 아래로 평가하고
2. 같은 level에서는 왼쪽에서 오른쪽으로 평가한다.

즉, 더 위에 있고 더 왼쪽에 있는 node가 먼저 평가된다.

### 두 종류의 node

Behavior Tree node는 크게 둘로 나뉜다.

- **Composite node**: 실행 흐름을 제어
- **Action node**: 실제 동작 수행

Action node는 Composite node의 child로 배치되고, Composite가 실행 순서와 조건을 결정한다.

### 세 가지 Composite node

| Composite | 동작 |
|---|---|
| `Sequence` | child를 순서대로 실행. 하나라도 실패하면 sequence 전체를 즉시 중단 |
| `Selector` | child를 순서대로 평가하다 하나가 성공하면 중단 |
| `Parallel` | 모든 child를 동시에 실행 |

### 데모에서 사용한 Action node

- `Move To`
- `Rotate To Face`
- `Wait`
- `Parameter Setter`

이 밖에도 editor에는 여러 built-in action node가 제공된다고 설명한다.

---

## 🧪 Table routine 만들기

alchemist가 먼저 해야 할 일은:

1. table 방향을 본다.
2. table로 걸어간다.
3. 1초 기다리며 재료를 준비한다.

순서가 중요하므로 `Sequence`를 사용한다.

Sequence 안에:

- `Rotate To Face`
- `Move To`
- `Wait`

를 배치한다.

`Wait`은 1초로 설정한다.

Rotate와 Move에는 위치와 속도 입력이 필요하므로 다음 input을 만든다.

- `tablePosition`
- `rotationRate`
- `movementRate`

### Animation Graph와 연결

Behavior Tree가 character motion을 시작할 때 Animation Graph도 walk 상태로 바뀌어야 한다. 이를 위해 Behavior Tree 쪽에서도 `isWalking` input을 만들고 `Parameter Setter`를 넣는다.

흐름은:

1. 이동 시작 전 `isWalking = true`
2. Rotate To Face
3. Move To
4. 이동 완료 후 `isWalking = false`
5. Wait

이렇게 하면 **실제 이동 구간에서만 walk animation**이 재생된다.

### Cauldron routine

cauldron까지 이동하는 두 번째 sub-sequence도 같은 패턴을 사용한다.

- `cauldronPosition`
- Rotate To Face
- `isWalking = true`
- Move To
- `isWalking = false`

그리고 table sequence와 cauldron sequence를 상위 `Parent Sequence`에 연결해 **table → cauldron** 순서로 실행한다.

이 시점의 Behavior Tree는 행동의 순서는 정의하지만, 아직 scene의 실제 table/cauldron world position을 어떻게 넣을지, 사용자의 tap을 어떻게 받을지는 해결하지 않았다. 이 역할이 Script Graph로 넘어간다.

---

## ⚡ Script Graph — Event-driven interactivity 연결

Script Graph는 scene entity의 behavior와 interaction을 만드는 visual scripting system이다. Event-driven 구조이며, scene level 또는 특정 entity에서 발생한 event에 반응한다.

Apple이 강조하는 장점은 **에디터에서 곧바로 prototype하고 iterate할 수 있어 build cycle을 반복하지 않아도 된다**는 점이다.

### `On Initialize`로 초기화

먼저 `On Initialize` node를 사용한다. 이는 Scripting component가 최초로 initialize될 때 한 번 event를 내보내므로 setup logic에 적합하다.

Behavior Tree에는 실제 table/cauldron 위치가 필요한데, 이를 위해 팀원이 미리 만든 **`Setup Behavior Tree Position` subgraph**를 Project Browser에서 가져온다.

Subgraph는 함수처럼 재사용 가능한 logic이다. 이 subgraph는:

- scene에서 table entity 탐색
- cauldron entity 탐색
- 각 entity의 world position 계산
- Behavior Tree의 entity parameter에 position 기록

을 수행한다.

`On Initialize`의 event output을 이 subgraph의 event input에 연결한다.

Play하면 alchemist가 table로 가서 재료를 준비한 뒤 cauldron까지 이동한다.

---

## 👆 Tap할 때까지 기다리게 만들기

기본 routine은 table에서 잠깐 기다렸다가 자동으로 cauldron으로 이동한다. 세션에서는 이를 더 interactive하게 바꾼다.

목표:

> alchemist가 table에서 계속 ingredients를 준비하고 있다가 사용자가 tap했을 때만 cauldron으로 이동

### Behavior Tree 수정

1. table sequence의 `Wait` node 삭제
2. Boolean input `readyToBrew` 추가
3. 기본값은 `false`
4. cauldron sub-sequence에 `Bool Condition` precondition 추가
5. `readyToBrew == true`일 때만 cauldron sequence 진행

이제 Behavior Tree는 false 상태에서 table 이후 진행을 멈춘다.

### Script Graph에서 tap 연결

Script Graph에:

- `On Tap`
- `Set Entity Parameter`

node를 추가한다.

`Set Entity Parameter`가 변경할 이름은 Behavior Tree와 동일한 `readyToBrew`이며 값을 true로 설정한다.

흐름:

`On Tap → Set Entity Parameter(readyToBrew = true)`

결과적으로 사용자 tap event가 Script Graph를 통해 Behavior Tree의 실행 조건을 해제한다.

### 그래프 간 데이터 계약

이 사례에서 중요한 것은 `readyToBrew`라는 이름이 사실상 graph 간 contract 역할을 한다는 점이다.

- Behavior Tree: `readyToBrew`를 조건으로 소비
- Script Graph: `readyToBrew` 값을 변경

마찬가지로 `isWalking`도 Behavior Tree와 Animation Graph 사이의 contract다.

따라서 규모가 커질수록 parameter naming과 책임 분리가 중요해진다는 점을 데모 구조에서 읽을 수 있다.

---

## 🥽 Live Preview와 Apple Vision Pro

Script Graph interactivity는 Reality Composer Pro 3의 **Live Preview**와 Apple Vision Pro의 Reality Composer Pro Companion App으로 바로 확인한다.

세션에서는 Mac Virtual Display를 사용하면서 Apple Vision Pro에서 scene을 immersive하게 preview한다.

실행 결과:

1. alchemist가 table로 이동
2. table에서 계속 ingredients 준비
3. 사용자가 캐릭터를 tap
4. `readyToBrew = true`
5. cauldron을 향해 회전하고 이동
6. brewing 시작

즉, Animation Graph, Behavior Tree, Script Graph를 조합해 **animation + autonomous routine + interaction**을 코드 작성 없이 editor에서 결합한다.

---

## 🗺️ Navigation Mesh — 장애물을 피해 자율 이동

다음 목표는 character가 단순 직선 이동이 아니라 scene을 이해하고 obstacle을 피해 이동하는 것이다.

**Navigation Mesh**는 scene에서 걸을 수 있는 surface를 정의한다. Navigation controller는 이 mesh를 사용해 목적지까지 route를 계산하고 나무나 물 같은 obstacle을 자동으로 피한다.

### Shapes / Bounding box

Navigation Mesh component의 **Shapes** section에서 mesh generation용 bounding box를 정의한다.

- bounding box 내부 scene geometry가 navigation mesh 계산 대상
- 어떤 범위의 geometry를 walkable-space 계산에 포함할지 결정

### Off-Mesh Connections

Mesh가 자연스럽게 이어지지 않는 구간도 존재한다. 예를 들어 ladder처럼 지면과 rooftop이 직접 연결되지 않는 경우다.

이럴 때 **Off-Mesh Connection**을 사용한다.

각 connection은:

- start point
- end point

를 가진다. Viewport의 gizmo로 위치를 직접 조절할 수 있어 scene 변화에 맞춰 빠르게 수정할 수 있다.

세션의 ladder 예에서는 이 connection 덕분에 character가 **ladder를 통해 rooftop으로 이동할 수 있는 경로가 존재한다는 것**을 알 수 있다.

### Generation Parameters

Navigation Mesh가 scene geometry를 sampling하는 방식도 조정할 수 있다.

대표 예시는 `cell size`다.

- 작은 값 → 더 세밀한 detail 포착
- 큰 값 → 더 근사적인 mesh

Transcript는 이외에도 fine-tuning용 parameter가 더 많으며 자세한 값은 documentation을 참고하라고 안내한다.

### 다른 시스템과 연결

생성한 Navigation Mesh는:

- Behavior Tree
- Animation Graph
- custom Swift system

과 함께 사용할 수 있다. Custom Swift에서는 navigation component를 통해 활용한다.

즉 Navigation Mesh도 독립된 행동 시스템이라기보다는 **movement를 위한 spatial infrastructure**다.

---

## 💨 Compute Graph — Metal 기반 particle simulation

Cauldron smoke는 **Compute Graph**로 만든다.

Compute Graph는 Reality Composer Pro 내부에서 Metal로 구동되는 **GPU-driven particle simulation**을 구성하는 visual node-based tool이다.

Spawn, simulation, rendering을 모두 다룰 수 있고 custom shader도 지원한다.

### 네 개의 phase

모든 Compute Graph는 네 phase를 기본 template으로 갖는다.

| Phase | 역할 |
|---|---|
| **Emitter** | particle을 언제, 얼마나 생성할지 결정 |
| **Initialize** | particle 탄생 시 초기값 설정 |
| **Simulate** | 매 frame마다 force와 상태 변화 적용 |
| **Output** | 화면에 보이는 최종 형태 결정 |

### Emitter Phase

Cauldron smoke에서는 `Continuous Emit` node를 사용한다.

목표는:

- dense한 smoke flow 유지
- frame당 spawn count는 제어

즉 연속적인 smoke를 만들되 과도한 particle 생성은 피한다.

### Initialize Phase

각 particle이 만들어질 때 다음을 설정한다.

1. **Size** — 기본 크기 + random variation
2. **Lifetime** — 각 particle의 lifetime randomize
3. **Spawn in Sphere** — spherical volume 안에서 위치 분포
4. **Set Position** — Y 위치를 0으로 clamp

`Spawn in Sphere` node는 세션에서 **custom Compute Graph bundle**로 제공된 node다. Apple은 custom Compute Graph node를 bundle로 직접 만들 수 있다고 언급한다.

Y를 0으로 clamp하면서 sphere의 volume 전체가 아니라 표면에 가까운 원형 spawn 영역을 만들고, smoke가 liquid surface에서 올라오는 것 같은 출발 위치를 얻는다.

### Simulate Phase

Smoke에는 **negative gravity force**를 적용한다. 그 결과 particle이 아래로 떨어지는 대신 위로 올라가며 steam/smoke처럼 움직인다.

### Output Phase

Particle의 수명과 높이에 따라:

- fade in / fade out
- 위로 갈수록 scale down
- 높이에 따라 color shift

를 적용한다.

렌더링에는 Shader Graph material을 사용하며, 데모 material은 billboard 위에 circle을 그려 둥근 smoke appearance를 만든다.

### 구조적 의미

Compute Graph에서 simulation과 appearance를 완전히 한 덩어리로 처리하지 않는다.

- Compute Graph: particle life cycle과 simulation
- Shader Graph material: particle surface appearance

이라는 식으로 역할이 나뉜다.

---

## 🎨 Shader Graph enhancements

마지막 부분은 Reality Composer Pro 3의 Shader Graph 개선 사항을 빠르게 훑는다.

### RealityKit PBR Surface 2

기존 RealityKit PBR Surface node를 확장한 새 surface다.

새로 언급된 표현:

- **Sheen**
- **Subsurface Scattering**
- 더 정확한 **Diffuse shading**
- 더 정확한 **Occlusion shading**

세션은 Subsurface Scattering의 예로 Jupiter environment에서 ice realism을 높인 사례를 언급한다.

### Hair Surface

Hair/fur 전용 surface shader다.

가느다란 strand를 따라 빛이 반사되고 내부로 산란하는 특성을 모델링해 더 현실적인 hair/fur rendering을 목표로 한다.

### Portal Surface / Portal Geometry Modifier

Shader Graph에서도 portal 관련 표현을 더 세밀하게 제어할 수 있다.

- Portal Surface의 **per-pixel opacity** 수정
- vertex-animated portal geometry 구동

이를 통해 portal의 appearance와 geometry animation에 더 큰 자유도가 생긴다.

---

## 🔗 여섯 도구가 실제로 연결되는 방식

이번 세션은 개별 기능 소개보다 이 연결 구조가 특히 중요하다.

```text
User Tap
   │
   ▼
Script Graph
   │ readyToBrew = true
   ▼
Behavior Tree
   │ Move / Rotate / Parameters
   ├──────────────► Navigation Mesh
   │                pathfinding / obstacle avoidance
   │
   │ isWalking
   ▼
Animation Graph
   │ Idle ↔ Walk pose
   ▼
Character presentation

Cauldron
   │
   ▼
Compute Graph
   │ particle simulation
   ▼
Shader Graph material
   │ visual appearance
   ▼
Smoke effect
```

각 graph는 서로 다른 문제를 해결하고, event 또는 parameter를 경계로 연결한다.

---

## 🛠️ 제작 관점의 실무 체크리스트

### Animation Graph

- [ ] Character state를 시각적 state machine으로 분리
- [ ] State transition 조건을 명시적인 runtime parameter로 관리
- [ ] Idle/Walk 등 각 state에 올바른 Animation Clip 연결
- [ ] Play mode에서 active state highlighting으로 transition 검증
- [ ] 행동 판단 로직을 Animation Graph 안에 과도하게 넣지 않기

### Behavior Tree

- [ ] Sequence / Selector / Parallel의 의미에 맞춰 hierarchy 구성
- [ ] Failure가 sequence 전체에 미치는 영향 확인
- [ ] Move / Rotate / Wait / Parameter Setter 역할 분리
- [ ] Runtime parameter 이름을 graph 간 contract로 관리
- [ ] Preconditions로 행동 시작 조건을 명시

### Script Graph

- [ ] 초기화 logic은 `On Initialize`에서 분리
- [ ] 반복되는 setup은 subgraph로 추출
- [ ] Gesture/event는 `On Tap` 등 명확한 event node로 연결
- [ ] Behavior Tree parameter를 변경할 때 이름 일치 확인
- [ ] Live Preview로 build cycle 없이 interaction 검증

### Navigation Mesh

- [ ] Bounding box가 실제 navigation 대상 geometry를 포함하는지 확인
- [ ] `cell size`와 mesh detail 간 trade-off 검토
- [ ] Ladder/bridge 등 불연속 구간에 Off-Mesh Connection 필요 여부 확인
- [ ] Scene 변경 후 connection point를 gizmo로 재검토
- [ ] Behavior Tree 또는 Swift navigation component와 통합 테스트

### Compute Graph

- [ ] Emitter / Initialize / Simulate / Output 책임 분리
- [ ] Spawn rate가 frame별 particle 수를 과도하게 늘리지 않는지 확인
- [ ] Initial size/lifetime에 variation을 주어 반복감 감소
- [ ] Force가 의도한 motion을 만드는지 확인
- [ ] Custom Compute Graph node가 필요하면 bundle 확장 검토
- [ ] Output appearance와 Shader Graph material 역할 분리

### Shader Graph

- [ ] PBR Surface 2의 sheen / SSS가 필요한 material인지 판단
- [ ] Hair/fur는 Hair Surface 검토
- [ ] Portal에 per-pixel opacity 또는 vertex animation이 필요한지 확인
- [ ] Particle material과 scene material을 같은 graph logic에 불필요하게 결합하지 않기

---

## 💡 설계에서 읽을 수 있는 핵심 패턴

### 기능이 아니라 책임으로 graph를 나눈다

이 세션의 visual workflow는 "코드를 graph로 바꾸는 것"만이 아니다. 중요한 점은 **animation, decision, interaction, navigation, simulation, shading을 서로 다른 abstraction으로 유지**한다는 데 있다.

이렇게 하면 한 부분을 수정해도 다른 graph의 구조를 크게 건드리지 않고 iterate할 수 있다.

### Runtime parameter가 subsystem 사이를 연결한다

`isWalking`, `readyToBrew`, `tablePosition`, `cauldronPosition` 같은 값은 단순 설정값 이상이다. 각 graph가 서로의 내부 구조를 알지 않고도 협력하도록 만드는 interface 역할을 한다.

### 에디터 안의 즉시 feedback loop가 핵심이다

세션은 반복해서:

- Play
- Inspector 값 변경
- Active state 확인
- Live Preview
- Vision Pro에서 tap

같은 즉시 검증 과정을 보여준다. Reality Composer Pro 3의 가치 중 하나는 기능 자체뿐 아니라 **build-run cycle 없이 scene-level behavior를 빠르게 조정하는 작업 방식**에 있다.

### Visual authoring과 Swift는 경쟁 관계가 아니다

Chaparral Village 자체는 Reality Composer Pro 3와 Swift로 제작되었고, Navigation Mesh도 custom Swift system에서 navigation component를 통해 사용할 수 있다고 설명한다. 즉 visual authoring은 Swift를 없애기 위한 것이 아니라 **어떤 로직을 editor에 둘지, 어떤 로직을 code에 둘지 선택할 수 있는 범위를 넓힌다.**

---

## 🧠 핵심 메시지

Reality Composer Pro 3의 강점은 하나의 새 graph가 아니라, **여러 시각적 시스템을 조합해 spatial behavior를 end-to-end로 구성할 수 있다는 점**이다.

- Animation Graph는 character pose와 transition을 담당한다.
- Behavior Tree는 자율적 행동의 순서와 조건을 담당한다.
- Script Graph는 scene event와 상호작용을 연결한다.
- Navigation Mesh는 공간 안에서 실제 이동 가능한 경로를 제공한다.
- Compute Graph는 Metal 기반 particle simulation을 수행한다.
- Shader Graph는 surface와 particle의 최종 appearance를 만든다.

이 구조를 사용하면 designer와 developer가 scene 자체를 중심으로 빠르게 prototype하고, parameter와 event를 경계로 subsystem을 조립하며, 필요한 부분만 Swift로 확장하는 workflow를 만들 수 있다.

---

## 🔗 함께 보면 좋은 세션과 자료

- [Supercharge your spatial workflows with Reality Composer Pro 3](https://developer.apple.com/videos/play/wwdc2026/393/)
- WWDC26 — **Design no-code games with Reality Composer Pro 3**
- WWDC26 — **Explore advances in RealityKit**
- WWDC26 — **Extend Reality Composer Pro 3 functionality with Xcode**
- WWDC26 — **Iterate your spatial scenes faster with Reality Composer Pro 3**
- WWDC26 — **Build next-generation experiences with visionOS 27**
- WWDC23 — **Explore materials in Reality Composer Pro**
