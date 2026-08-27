# WWDC26 Extend Reality Composer Pro 3 functionality with Xcode 요약

- Session: 281
- Title: Extend Reality Composer Pro 3 functionality with Xcode
- Source: https://developer.apple.com/videos/play/wwdc2026/281/
- Topic: Reality Composer Pro 3, Xcode, Plugins, RealityKit, Custom Components, Systems, Sequencer, EntityAction, Script Graph, @Scriptable
- Chapters: Introduction, Extending the editor, Custom components and systems, Controlling the water surface, Custom animation actions, Custom Script Graph nodes, Next steps

---

## 한 줄 요약

Reality Composer Pro 3의 새 플러그인 시스템은 **Xcode에서 작성한 RealityKit component·system·animation action·Script Graph schema를 editor 안에 직접 로드해 실행**할 수 있게 하며, 엔지니어가 만든 Swift 로직을 아티스트와 디자이너가 inspector·sequencer·Script Graph에서 실시간으로 조정하고 검증하는 협업 구조를 제공한다.

---

## 핵심 요약

이번 세션은 Reality Composer Pro 3를 단순한 3D scene editor에서 **프로젝트별 도메인 로직을 직접 이해하는 extensible authoring environment**로 확장하는 방법을 설명한다.

주요 내용:

- **Reality Composer Pro 3 plugin system**
  - Xcode project와 Reality Composer Pro project를 연결
  - 같은 Git repository에서 engineer·artist·designer가 협업
  - Xcode에서 dynamic framework/plugin을 build
  - Reality Composer Pro가 plugin을 load하고 Swift code를 editor 내부에서 실행

- **Custom Component + System**
  - `Component` + `Codable`로 editor에서 직렬화 가능한 component 생성
  - `System`으로 runtime behavior 구현
  - `RealityComposerProPlugin`의 `setup(context:)`에서 등록
  - Inspector에서 property를 바꾸면 system이 즉시 반응

- **ShaderGraph 제어**
  - Custom component의 값을 `ShaderGraphMaterial` parameter로 전달
  - Water level, vortex coefficient, rotation speed 등을 editor에서 조정

- **Custom Animation Action**
  - `EntityAction` + `Codable`
  - Sequencer timeline에 프로젝트 전용 action 추가
  - `.updated` event를 subscribe하여 normalized animation time으로 값을 보간

- **Custom Script Graph Node**
  - `@Scriptable` macro로 component schema 생성
  - `RealityKitScripting`에 module/configuration 등록
  - Script Graph에서 custom component getter/setter node 자동 노출

- **Team workflow**
  - RCP scene은 internal JSON 기반으로 저장
  - Git merge 가능
  - editor 전용 custom merge tool 제공
  - 최종 content는 Reality File로 export되어 앱에 포함

---

# 🧭 Reality Composer Pro 3의 역할

Reality Composer Pro 3는 RealityKit용 3D content editor다.

이번 버전은 다음을 강화한다.

- Larger scenes
- Artist-friendly iterative workflows
- Headset preview
- Script Graph 기반 no-code authoring
- Xcode plugin을 통한 code-based extension

세션의 중심은 마지막 항목이다.

> 프로젝트별 Swift 코드를 Reality Composer Pro 3의 editor 안으로 가져와, 아티스트와 디자이너가 그 기능을 직접 사용할 수 있게 한다.

---

# 👥 Engineer와 Artist의 협업 구조

세션의 Chaparral Village 프로젝트는 다음 두 프로젝트를 함께 사용한다.

```text
Reality Composer Pro Project
        ↓
3D scenes / level content
        ↓
Artists / Designers

Xcode Project
        ↓
Game app
Custom components
Custom systems
Plugin framework
        ↓
Engineers
```

두 프로젝트는 연결되어 있으며 같은 Git repository에 존재한다.

---

# 🔗 Xcode와 Reality Composer Pro 연결

Reality Composer Pro의 simulation bar에 있는 **Run With Xcode**를 이용해 editor project와 Xcode project를 연결한다.

이 연결을 통해:

- Xcode project에서 app build
- Reality Composer Pro plugin build
- Editor에서 app launch
- Custom Swift type 등록

이 가능해진다.

Reality Composer Pro 관련 Swift package도 이 과정에서 자동으로 Xcode project에 추가된다.

---

# 🗂️ Git 기반 Team Workflow

Reality Composer Pro 3에서 파일을 import하면 내부 format으로 변환되고 disk에 JSON 형태로 저장된다.

따라서 source control에 넣어 팀이 공유할 수 있다.

```text
Artist A change
Engineer change
Designer change
      ↓
Git commit / push
      ↓
Team sync
```

일반 Git merge tool도 사용할 수 있고, Reality Composer Pro는 충돌을 줄이도록 설계된 custom merge tool도 제공한다.

---

# 📦 Runtime으로 가져가는 형식: Reality File

Reality Composer Pro에서 만든 scene은 최종적으로 Reality File로 export된다.

```text
Reality Composer Pro Scene
      ↓
Export
      ↓
Reality File
      ↓
Xcode App Bundle
      ↓
RealityKit Runtime
```

Reality File은 RealityKit의 serialization format이다.

즉 editor content와 runtime app 사이의 전달 경로가 명확하다.

---

# 🧩 Plugin Framework 구조

Xcode project는 두 schema를 가진다.

```text
ChaparralVillage
→ 실제 App build

RCPCustomComponents
→ Reality Composer Pro plugin framework build
```

Custom component와 system code는 두 schema에서 공유한다.

따라서 같은 Swift code가:

```text
Reality Composer Pro Editor
        +
Final RealityKit App
```

두 환경에서 동일하게 사용된다.

---

# 🧪 예제: Cauldron Water Level

Potion cauldron의 water surface를 제어한다고 가정한다.

요구사항:

- Water level 변경
- Potion이 섞일 때 swirl/vortex 생성
- 향후 floating ingredient system과 연결

단순한 behavior라면 Script Graph로도 만들 수 있다.

하지만 이 예제에서는 custom Swift code가 더 적합하다.

---

# 🆚 Script Graph vs Custom Swift

세션은 둘 중 하나가 절대적으로 우월하다고 말하지 않는다.

둘 다 유사한 behavior를 만들 수 있다.

## Script Graph가 좋은 경우

- Simple interaction
- Artist/designer 주도 authoring
- Code 없이 빠른 iteration

## Swift가 좋은 경우

- Graph가 매우 커지고 복잡해짐
- 유지보수 어려움
- 다른 system과 깊게 연결
- SwiftUI 등 Script Graph에서 접근할 수 없는 Apple API 사용

Cauldron은 향후 ingredient simulation 등과 연결될 예정이므로 Swift implementation을 선택한다.

---

# 🧱 Custom Component 만들기

첫 번째 custom component는 water level 값 하나만 가진다.

```swift
import RealityKit

public struct Cauldron: Component, Codable {
    public var waterLevel: Float

    enum CodingKeys: CodingKey {
        case waterLevel
    }
}
```

중요한 점:

```text
Component
+
Codable
```

`Codable`이 필요한 이유:

- Reality Composer Pro가 component를 표현
- Inspector에 property 표시
- Reality File에 serialize

Runtime에서만 필요한 property가 있다면 `CodingKeys`를 사용해 editor에 노출하지 않을 수도 있다.

---

# ⚙️ Custom System 만들기

Cauldron component 값을 실제 scene behavior로 연결한다.

```swift
import RealityKit

public struct CauldronSystem: System {
    let query = EntityComponentQuery(Cauldron.self)

    public init(scene: Scene) {}

    public func update(context: SceneUpdateContext) {
        for (entity, cauldron) in context.entities(matching: query) {
            guard let water = entity.findEntity(
                named: "Cauldron_Water_mesh"
            ) else { continue }

            water.setPosition(
                SIMD3<Float>(0, 1, 0) * cauldron.waterLevel,
                relativeTo: entity
            )
        }
    }
}
```

System은 `Cauldron` component를 가진 entity를 찾고 water mesh의 Y position을 `waterLevel`에 따라 변경한다.

---

# 🔍 `EntityComponentQuery`

세션은 component 기반 query를 사용한다.

```swift
let query = EntityComponentQuery(Cauldron.self)
```

그 다음 update에서:

```swift
for (entity, cauldron)
    in context.entities(matching: query) {
    // ...
}
```

즉 system이 특정 component를 가진 entity만 효율적으로 처리한다.

---

# 🔌 `RealityComposerProPlugin`

Custom component와 system을 작성했다고 editor가 자동으로 아는 것은 아니다.

Plugin class를 만든다.

```swift
import RealityComposerPro

final class RCPCustomComponentsPlugin:
    RealityComposerProPlugin {

    public func setup(
        context: any RealityComposerProContext
    ) {
        context.registerComponent(Cauldron.self)
        context.registerSystem(CauldronSystem.self)
    }
}
```

`setup(context:)`가 editor extension의 registration point다.

---

# 🧠 Editor에 등록하는 대상

이번 세션에서 `context`에 등록하는 type은 세 종류다.

```text
Component
System
Action
```

그리고 Script Graph schema는 RealityKitScripting configuration을 통해 별도로 등록한다.

---

# 🧩 Plugin Entry Point

Reality Composer Pro plugin loader가 framework 안의 plugin object를 찾을 수 있어야 한다.

세션에서는 C-compatible exported function을 만든다.

```swift
@_cdecl("createRealityComposerProPlugin")
public func createRealityComposerProPlugin()
    -> UnsafeMutableRawPointer {

    return RCPCustomComponentsPlugin()
        .passRetained()
}
```

왜 raw pointer인가?

- Dynamic library interface를 통해 export
- Plugin loader가 symbol을 찾아야 함
- C ABI 형태의 entry point가 필요

---

# 🔐 Plugin Trust

Plugin을 포함한 Reality Composer Pro project를 열면 editor가 plugin load 여부를 묻는다.

```text
Project Open
      ↓
Plugin detected
      ↓
Trust?
```

사용자가 Trust를 선택해야 custom code가 editor process 안에서 실행된다.

이는 프로젝트에 포함된 arbitrary code 실행에 대한 보안 경계다.

---

# 📂 Custom Components Folder

Plugin에서 component가 등록되면 editor project 안에서 Custom Components folder에 나타난다.

그 다음 일반 component처럼 entity에 추가할 수 있다.

```text
Cauldron Entity
      ↓
Add Component
      ↓
Custom Components
      ↓
Cauldron
```

---

# 🎛️ Inspector에서 Runtime Logic 직접 조정

Cauldron component를 entity에 추가하면 `waterLevel` property가 inspector에 나타난다.

Artist가 slider/value를 바꾸면:

```text
Inspector Property Change
      ↓
Cauldron Component Update
      ↓
CauldronSystem.update
      ↓
Water Mesh Position 변경
```

앱을 build/deploy하지 않아도 editor에서 즉시 결과가 보인다.

이게 plugin system의 가장 큰 생산성 이점이다.

---

# 🐞 Editor 안의 Custom System Debugging

Custom system은 Reality Composer Pro process 안에서 실제 Swift code로 실행된다.

따라서 Xcode debugger를 editor process에 attach할 수 있다.

```text
Breakpoint 설정
      ↓
Attach to Reality Composer Pro
      ↓
Editor에서 system 실행
      ↓
Xcode Breakpoint hit
```

즉 editor preview에서도 일반 runtime code처럼 debug 가능하다.

---

# 🌪️ Water Vortex 확장

다음 단계는 water surface에 vortex effect를 추가하는 것이다.

Tech artist가 Shader Graph로 custom shader를 만든다.

Component에 property를 추가한다.

```swift
public struct Cauldron: Component, Codable {
    public var waterLevel: Float
    public var rotationSpeed: Float
    public var minWaterLevel: Float
    public var maxWaterLevel: Float
    public var vortexCoeff: Float
}
```

---

# 🎨 Shader Graph와 Swift System 연결

System에서 `ShaderGraphMaterial`을 가져온다.

```swift
guard var model =
    water.components[ModelComponent.self]
else { continue }

guard var mat =
    model.materials.first
        as? ShaderGraphMaterial
else { continue }
```

그 다음 component 값을 이용해 water surface parameter를 계산한다.

---

# 🧪 Shader Parameter 설정

세션 코드:

```swift
let surface = computeSurface(
    cauldron: cauldron
)

try? mat.setParameter(
    name: "Level Radius",
    value: .float(surface.levelRadius)
)

try? mat.setParameter(
    name: "Lowest Point",
    value: .float(
        cauldron.waterLevel
        - surface.lowestPoint
    )
)

try? mat.setParameter(
    name: "Height Change",
    value: .float(surface.heightChange)
)

try? mat.setParameter(
    name: "Level Coeff",
    value: .float(surface.levelCoeff)
)

try? mat.setParameter(
    name: "Is Level",
    value: .bool(surface.isLevel)
)
```

마지막으로 material을 model에 다시 넣는다.

```swift
model.materials[0] = mat
water.components.set(model)
```

---

# 🤝 Engineer와 Tech Artist의 경계

이 구조가 중요한 이유:

```text
Tech Artist
→ Shader Graph 작성

Engineer
→ Shader parameter 계산 / system 연결

Artist / Designer
→ Inspector에서 실제 값 조정
```

각 역할이 자신에게 익숙한 tool을 사용하면서 하나의 behavior를 함께 만든다.

---

# 🔄 Plugin 재빌드와 Editor Restart

세션에서는 plugin을 변경한 뒤 Reality Composer Pro를 재시작해야 변경사항이 반영된다고 설명한다.

```text
Swift Code 변경
      ↓
Plugin Framework Rebuild
      ↓
Reality Composer Pro Restart
      ↓
Plugin Reload
```

Component schema가 변경되면 editor가 변경사항 dialog를 보여준다.

사용자는 import된 custom component 변경을 확인하고 accept한다.

---

# 🎞️ Sequencer와 Custom Animation Action

Reality Composer Pro 3의 animation sequencer는 plugin이 정의한 custom animation action도 timeline에 배치할 수 있다.

Cauldron에서는 water level을 시간에 따라 바꾸는 action을 만든다.

---

# 🧱 `EntityAction`

```swift
import RealityKit

public struct SetWaterLevelAction:
    EntityAction,
    Codable {

    public let startWaterLevel: Float
    public let endWaterLevel: Float

    public var animatedValueType:
        (any AnimatableData.Type)? {
        Transform.self
    }
}
```

필수 요소:

- `EntityAction`
- `Codable`
- Action parameter
- `animatedValueType`

---

# 🔢 Start / End Parameter

Action은 두 값을 가진다.

```text
startWaterLevel
endWaterLevel
```

Timeline의 normalized time을 이용해 현재 water level을 보간한다.

---

# 🔔 Action Update Subscribe

Action이 실제로 실행되게 하려면 animation event를 subscribe한다.

```swift
extension SetWaterLevelAction {
    static func subscribe() {
        Task { @MainActor in
            SetWaterLevelAction.subscribe(
                to: .updated
            ) { event in
                // ...
            }
        }
    }
}
```

---

# ⏱️ Normalized Animation Time

세션은 현재 playback time을 0~1 범위로 계산한다.

```swift
let normalizedTime =
    (event.playbackController.time
        - event.startTime)
    / event.duration
```

이 값으로 start와 end를 interpolation한다.

```swift
let currentLevel =
    action.startWaterLevel
    + Float(normalizedTime)
    * (
        action.endWaterLevel
        - action.startWaterLevel
    )
```

---

# 🔄 Entity Component 업데이트

Event의 target entity에서 Cauldron component를 가져온다.

```swift
guard let entity = event.targetEntity
else { return }

guard var cauldron =
    entity.components[Cauldron.self]
else { return }

cauldron.waterLevel = currentLevel
entity.components.set(cauldron)
```

즉 animation timeline이 component state를 직접 움직인다.

---

# 📝 Custom Action 등록

Plugin setup에 action을 추가한다.

```swift
context.registerAction(
    SetWaterLevelAction.self
)

SetWaterLevelAction.subscribe()
```

전체 구조:

```swift
final class RCPCustomComponentsPlugin:
    RealityComposerProPlugin {

    public func setup(
        context: any RealityComposerProContext
    ) {
        context.registerComponent(Cauldron.self)
        context.registerSystem(CauldronSystem.self)
        context.registerAction(
            SetWaterLevelAction.self
        )

        SetWaterLevelAction.subscribe()
    }
}
```

---

# 🕒 Sequencer에서 사용하는 방법

Plugin reload 후 custom action이 editor에 나타난다.

세션 workflow:

```text
Create Sequence
      ↓
Set Root Entity
      ↓
Add Animation Track
      ↓
Choose Cauldron Entity
      ↓
Drag SetWaterLevelAction
      ↓
Set Start/End Values
      ↓
Playback
```

예제 값:

```text
Start = 0.3
End   = 0.5
```

Timeline에서 playback하면 water level이 부드럽게 변한다.

---

# 🧠 Custom Animation Action의 의미

기존 animation은 transform, material 등 일반적인 property 중심이다.

Custom EntityAction을 사용하면 프로젝트 특유의 domain behavior를 timeline에 직접 넣을 수 있다.

예:

```text
OpenPortalAction
ChargeWeaponAction
SetWeatherAction
SpawnParticlesAction
ChangeWaterLevelAction
```

즉 sequencer가 단순 motion tool이 아니라 gameplay/domain orchestration tool이 된다.

---

# 🧩 Script Graph Custom Node

Reality Composer Pro 3의 Script Graph는 no-code gameplay scripting tool이다.

Built-in node만으로도 많은 기능을 만들 수 있지만 plugin으로 custom node를 추가할 수 있다.

가장 빠른 방법:

```swift
@Scriptable
```

---

# 📦 필요한 Module

```swift
import RealityKit
import RealityKitScripting
import RealityKitScriptingMacros
```

Reality Composer Pro에서 Xcode project를 연결하면 필요한 package가 자동으로 설정된다.

---

# 🏷️ `@Scriptable` Macro

Component에 macro를 적용한다.

```swift
@Scriptable
public struct Cauldron:
    Component,
    Codable {

    public var waterLevel: Float
    public var rotationSpeed: Float
    public var minWaterLevel: Float
    public var maxWaterLevel: Float
    public var vortexCoeff: Float
}
```

Macro는 scripting system에 사용할 schema를 생성한다.

```text
Cauldron
      ↓
@Scriptable
      ↓
Cauldron.SchemaProvider.schema
```

---

# 🧠 Scripting Configuration

Plugin setup에서 scripting module을 등록한다.

세션은 scripting configuration을 main thread에서 등록해야 한다고 강조한다.

```swift
Task { @MainActor in
    let config = RKS.Configuration(
        id: "ChaparralVillage"
    )
    .onInitialize { _ in
        [
            Module("ChaparralVillage") {
                Cauldron
                    .SchemaProvider
                    .schema
            }
        ]
    }

    try! RKS.addConfiguration(config)
}
```

---

# ⚠️ Scripting Registration은 Main Thread

세션에서 명시적으로 언급한다.

```text
Scripting modules
→ Main thread에서 register
```

따라서 `Task { @MainActor in ... }`로 감싼다.

---

# 🧬 Schema 기반 Node 생성

등록된 schema를 Reality Composer Pro가 읽으면 Script Graph에서 custom component 관련 node를 생성한다.

예:

```text
Get Cauldron Water Level
Set Cauldron Water Level
```

아티스트와 디자이너는 custom Swift type을 몰라도 visual node로 사용할 수 있다.

---

# 🎮 Script Graph Demo

세션은 keyboard input으로 cauldron water level을 바꾼다.

Flow:

```text
Update Node
      ↓
If Node
      ↓
Key Press?
      ↓
Set Cauldron Water Level
```

첫 번째 key:

```text
"a"
→ waterLevel = 0.25
```

두 번째 key:

```text
"z"
→ waterLevel = 0.5
```

Simulation view에서 key를 누르면 water level이 실제로 오르내린다.

---

# 🎯 Swift Code와 Script Graph의 연결 지점

이번 세션의 구조를 한 줄로 정리하면:

```text
Swift Component
      ↓ @Scriptable
Schema
      ↓
Script Graph Node
      ↓
Designer Logic
      ↓
Component Value
      ↓
Swift System
      ↓
RealityKit Behavior
```

즉 code와 no-code가 동일 component를 중심으로 연결된다.

---

# 🧠 Domain Model을 중심으로 한 Authoring

Cauldron component가 전체 authoring workflow의 중심이다.

```text
Inspector
→ Property 직접 수정

Sequencer
→ Custom EntityAction으로 시간 기반 수정

Script Graph
→ Node로 event 기반 수정

System
→ 실제 Runtime behavior 실행
```

하나의 component schema가 여러 editor tool을 연결한다.

---

# 🧩 Plugin이 Editor를 어떻게 바꾸는가

Plugin이 없을 때:

```text
Reality Composer Pro
→ 일반 RealityKit asset / component / Script Graph
```

Plugin 적용 후:

```text
Reality Composer Pro
→ 프로젝트 전용 Component
→ 프로젝트 전용 System
→ 프로젝트 전용 Animation Action
→ 프로젝트 전용 Script Graph Node
```

즉 editor가 generic 3D tool에서 프로젝트-specific authoring tool로 바뀐다.

---

# 🧱 전체 Architecture

```text
Xcode Project
├─ App Target
│   └─ Runtime App
│
└─ Plugin Target
    └─ RCPCustomComponents.framework
         ├─ Cauldron Component
         ├─ CauldronSystem
         ├─ SetWaterLevelAction
         └─ Scriptable Schema

Reality Composer Pro 3
├─ Scene Authoring
├─ Inspector
├─ Sequencer
├─ Script Graph
└─ Plugin Loader

Reality Composer Pro Output
      ↓
Reality File
      ↓
Final App
```

---

# 🔁 개발자 변경 Flow

```text
Swift Code 변경
      ↓
Plugin Build
      ↓
Reality Composer Pro Restart
      ↓
Plugin Reload
      ↓
Schema Change 확인
      ↓
Editor에서 기능 테스트
      ↓
App Build
```

---

# 🎨 콘텐츠 변경 Flow

```text
Artist / Designer 변경
      ↓
Reality Composer Pro Scene Update
      ↓
Git Commit
      ↓
Reality File Export
      ↓
App에 포함
      ↓
Final Runtime Test
```

---

# 🐞 Debugging Workflow

```text
Xcode
→ Breakpoint
      ↓
Attach to Reality Composer Pro
      ↓
Editor interaction
      ↓
Custom System 실행
      ↓
Breakpoint hit
```

Editor 자체가 plugin runtime이기 때문에 code를 그대로 디버깅할 수 있다.

---

# 📋 체크리스트

## 프로젝트 구조

- [ ] Reality Composer Pro project와 Xcode project 연결
- [ ] 같은 Git repository에서 관리
- [ ] App schema와 plugin schema 분리
- [ ] Shared source target 구성
- [ ] Run With Xcode 연결 확인
- [ ] RealityComposerPro package 자동 추가 여부 확인

## Source Control

- [ ] Reality Composer Pro internal JSON source control 포함
- [ ] Team merge workflow 정의
- [ ] Standard Git merge와 custom merge tool 비교
- [ ] Binary asset 관리 전략 정의
- [ ] Reality File export를 build pipeline에 포함할지 결정

## Custom Component

- [ ] `Component` conform
- [ ] `Codable` conform
- [ ] Editor에 보여줄 property만 serialize
- [ ] Runtime-only property는 `CodingKeys` 검토
- [ ] Inspector에서 property type이 적절히 표현되는지 확인
- [ ] Schema 변경 시 migration 영향 검토

## Custom System

- [ ] `System` 구현
- [ ] `EntityComponentQuery` 사용
- [ ] 필요한 component만 query
- [ ] Child entity 이름 의존성 검토
- [ ] `update(context:)` 비용 측정
- [ ] Editor와 runtime에서 behavior 동일성 테스트

## Plugin

- [ ] `RealityComposerProPlugin` conform
- [ ] `setup(context:)` 구현
- [ ] `registerComponent` 호출
- [ ] `registerSystem` 호출
- [ ] 필요 시 `registerAction` 호출
- [ ] C ABI entry point 추가
- [ ] `@_cdecl("createRealityComposerProPlugin")` 확인
- [ ] Plugin framework export 설정 검증

## Plugin Security

- [ ] Team member가 plugin source를 검토 가능하도록 관리
- [ ] Project Trust dialog behavior 이해
- [ ] Plugin load 전에 신뢰 여부 확인
- [ ] Third-party project에서 임의 plugin 실행 주의

## Editor Iteration

- [ ] Inspector에서 custom property 노출 확인
- [ ] Property 변경이 system에 즉시 반영되는지 확인
- [ ] App rebuild 없이 visual tuning 가능한지 테스트
- [ ] Plugin rebuild 후 Reality Composer Pro restart
- [ ] Component schema diff dialog 확인

## Debugging

- [ ] Xcode breakpoint 설정
- [ ] Reality Composer Pro process attach
- [ ] Custom system breakpoint hit 확인
- [ ] Runtime app과 editor 결과 비교
- [ ] Editor-only crash handling 검토

## Shader Graph

- [ ] Tech artist와 parameter naming 합의
- [ ] `ShaderGraphMaterial` cast 확인
- [ ] Parameter type 일치 확인
- [ ] `setParameter` 실패 처리
- [ ] Material 수정 후 `ModelComponent`에 다시 set
- [ ] Component property와 shader parameter coupling 문서화

## Animation Action

- [ ] `EntityAction` conform
- [ ] `Codable` conform
- [ ] Timeline에서 필요한 parameter 정의
- [ ] `animatedValueType` 설정
- [ ] `.updated` subscription 구현
- [ ] Normalized time 계산 검증
- [ ] Interpolation formula 검증
- [ ] Target entity가 없을 때 처리
- [ ] Component update 후 다시 set
- [ ] Plugin에서 action 등록
- [ ] Subscription 시작 호출

## Sequencer

- [ ] Sequence 생성
- [ ] Root entity 설정
- [ ] Animation track 추가
- [ ] Custom action이 palette에 나타나는지 확인
- [ ] Inspector parameter 편집 확인
- [ ] Playback preview 확인
- [ ] Runtime export 후 동일 결과 검증

## Script Graph

- [ ] `RealityKitScripting` import
- [ ] `RealityKitScriptingMacros` import
- [ ] Component에 `@Scriptable` 추가
- [ ] Generated schema 확인
- [ ] Scripting module 정의
- [ ] `RKS.Configuration` 생성
- [ ] MainActor에서 registration 수행
- [ ] `RKS.addConfiguration` 호출
- [ ] Script Graph에서 generated node 확인
- [ ] Get/Set node behavior 검증

## Team Collaboration

- [ ] Engineer가 component/system API 안정적으로 유지
- [ ] Artist가 inspector에서 튜닝 가능한 범위 정의
- [ ] Tech artist가 shader parameter 계약 관리
- [ ] Designer가 Script Graph node 사용법 이해
- [ ] Plugin version과 Reality File compatibility 정책 수립

---

# ⚠️ 구현 시 주의할 점

## `Codable`은 단순 선택 사항이 아니다

Reality Composer Pro에서 custom component를 표현하고 Reality File에 저장하려면 serialization이 필요하다.

따라서 editor에 노출할 custom component는 `Codable` 구현이 핵심이다.

## Component schema 변경은 Editor 데이터 구조 변경이다

새 property를 추가하면 plugin reload 시 editor가 schema change를 감지한다.

즉 일반 Swift type 변경 이상의 영향이 있으므로 content migration 관점에서 관리하는 것이 좋다.

## Plugin은 Editor Process 안에서 실행된다

무한 loop, crash, expensive system update는 앱뿐 아니라 Reality Composer Pro의 authoring experience도 망가뜨릴 수 있다.

Editor runtime performance도 고려해야 한다.

## Plugin Update에는 Editor Restart가 필요하다

이번 세션 기준으로 plugin을 rebuild한 뒤 Reality Composer Pro를 restart해야 새 code가 load된다.

## Script Graph가 복잡해지면 Code로 옮길 수 있다

Apple은 Script Graph와 Swift를 경쟁 관계가 아니라 선택 가능한 두 authoring 방식으로 설명한다.

큰 graph가 유지보수하기 어렵다면 custom code로 이동할 수 있다.

## Scripting Module 등록은 Main Thread

`RKS.Configuration`과 module registration은 main thread에서 수행해야 한다.

---

# 🧩 핵심 API 정리

| API / Type | 역할 |
|---|---|
| `Component` | RealityKit entity 데이터 모델 |
| `Codable` | Editor/Reality File serialization |
| `System` | Component 기반 runtime behavior |
| `EntityComponentQuery` | 특정 component entity 검색 |
| `RealityComposerProPlugin` | Editor plugin entry type |
| `RealityComposerProContext` | Component/System/Action registration |
| `registerComponent` | Custom component 등록 |
| `registerSystem` | Custom system 등록 |
| `registerAction` | Custom EntityAction 등록 |
| `@_cdecl` | Plugin loader용 C ABI function export |
| `ShaderGraphMaterial` | Shader Graph parameter runtime 제어 |
| `EntityAction` | Sequencer custom animation action |
| `EntityAction.subscribe(to:)` | Custom action animation event 처리 |
| `@Scriptable` | Component schema를 Script Graph에 노출 |
| `RealityKitScripting` | Script Graph runtime/schema registration |
| `RKS.Configuration` | Scripting module 구성 |
| `RKS.addConfiguration` | Script Graph configuration 등록 |

---

# 🔁 Custom Component 전체 흐름

```text
Swift Component
      ↓
Component + Codable
      ↓
Plugin registerComponent
      ↓
Reality Composer Pro Inspector
      ↓
Artist Property Editing
      ↓
Custom System
      ↓
RealityKit Scene Update
```

---

# 🔁 Shader Graph 전체 흐름

```text
Tech Artist Shader Graph
      ↓
ShaderGraphMaterial
      ↓
Swift Cauldron Component
      ↓
CauldronSystem
      ↓
setParameter(...)
      ↓
Editor 실시간 Preview
```

---

# 🔁 Sequencer 전체 흐름

```text
EntityAction + Codable
      ↓
Plugin registerAction
      ↓
Action subscribe
      ↓
Reality Composer Pro Sequencer
      ↓
Timeline에 Custom Action 배치
      ↓
Normalized Time
      ↓
Component Value Update
```

---

# 🔁 Script Graph 전체 흐름

```text
Component
      ↓
@Scriptable
      ↓
Generated Schema
      ↓
RKS Module
      ↓
RKS.Configuration
      ↓
Script Graph Custom Nodes
      ↓
Designer-authored Logic
```

---

# 🎯 어떤 방식으로 구현할까?

## Inspector Property만 필요

```text
Component + System
```

아티스트가 값을 직접 조정하고 실시간 결과를 보면 되는 경우.

## 시간 기반 Animation 필요

```text
EntityAction + Sequencer
```

Timeline에서 프로젝트 전용 behavior를 animation처럼 편집해야 하는 경우.

## Event / Logic 기반 Gameplay 필요

```text
@Scriptable + Script Graph
```

Designer가 no-code로 logic을 조립해야 하는 경우.

## 복잡한 Runtime Logic 필요

```text
Swift System
```

큰 Script Graph가 복잡해지거나 다른 Apple framework와 통합해야 하는 경우.

---

# 🧠 이 세션의 가장 중요한 구조

Reality Composer Pro 3에서 프로젝트별 domain type을 editor 자체의 language로 끌어올린다.

예제에서 그 domain type은 `Cauldron`이다.

```text
Cauldron Component
      ↓
Inspector
→ 수동 property tuning

      ↓
Sequencer
→ 시간 기반 변화

      ↓
Script Graph
→ event 기반 변화

      ↓
CauldronSystem
→ 실제 RealityKit behavior
```

이 패턴을 다른 프로젝트로 확장하면:

```text
Door
Vehicle
NPC
Weapon
Weather
Portal
Machine
Puzzle
```

같은 domain concept를 editor의 first-class authoring primitive로 만들 수 있다.

---

# 핵심 메시지

Reality Composer Pro 3의 plugin system은 단순히 editor에 menu item을 추가하는 extension이 아니다.

Xcode에서 만든 **실제 RealityKit component와 system이 Reality Composer Pro 안에서 그대로 실행**되며, 그 schema가 inspector·sequencer·Script Graph의 authoring surface로 연결된다.

이 때문에 엔지니어는 runtime logic을 Swift로 유지하면서도 아티스트와 디자이너가 코드 수정 없이 값을 튜닝하고, 애니메이션을 만들고, gameplay logic을 조합하게 할 수 있다.

세션의 전체 구조는 다음과 같다.

```text
Engineer
Swift Component / System / Action
        ↓
Reality Composer Pro Plugin
        ↓
Artist / Designer
Inspector / Sequencer / Script Graph
        ↓
Reality File
        ↓
Final RealityKit App
```

Custom component는 `Component + Codable`로 editor와 runtime 양쪽에서 공유되고, `RealityComposerProPlugin`의 `setup(context:)`에서 component와 system을 등록한다.

`EntityAction`을 사용하면 프로젝트 전용 behavior를 sequencer timeline에 넣을 수 있고, `@Scriptable` macro를 사용하면 같은 component를 Script Graph의 custom node로 노출할 수 있다.

결국 Reality Composer Pro 3는 generic scene editor를 넘어, **각 프로젝트의 domain model을 이해하는 custom authoring tool로 변환할 수 있는 editor platform**으로 확장되고 있다.

---

# 함께 보면 좋은 세션

- Iterate your spatial scenes faster with Reality Composer Pro 3 — WWDC26
- Design no-code games with Reality Composer Pro 3 — WWDC26
- Explore advances in RealityKit — WWDC26
- Supercharge your spatial workflows with Reality Composer Pro 3 — WWDC26
