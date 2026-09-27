# WWDC26 Iterate your spatial scenes faster with Reality Composer Pro 3 요약

- Session: 280
- Title: Iterate your spatial scenes faster with Reality Composer Pro 3
- Source: https://developer.apple.com/videos/play/wwdc2026/280/
- Topic: Reality Composer Pro 3, visionOS, RealityKit, Compute Simulation, Prototypes, Live Preview, Lightmaps, AI Assistant
- Chapters: Introduction, Overview, Entities and components, Prototypes and instances, Live preview, Lightmaps, Reality Composer Pro Assistant, Next steps

---

## 한 줄 요약

Reality Composer Pro 3는 **Xcode에 들어가기 전 단계에서 공간 콘텐츠를 최대한 완성할 수 있도록** standalone 앱, 실시간 simulation, reusable prototype/instance, Vision Pro Live Preview, static lighting을 위한 Lightmaps, 생성형 AI 기반 3D asset 제작을 하나의 editor 안에 통합해 spatial scene의 제작·검증·반복 시간을 크게 줄인다.

---

## 핵심 요약

이번 세션은 Reality Composer Pro 3에서 Chaparral Village의 Alchemy Area를 수정하는 과정을 통해 새 iterative workflow를 보여준다.

핵심 변화:

- **Standalone Reality Composer Pro 3**
  - 더 이상 Xcode developer tool로 제공되지 않음
  - developer.apple.com에서 별도로 다운로드
  - Applications 폴더에서 독립 실행
  - Xcode 없이도 spatial content 제작을 더 깊게 진행 가능

- **Entities and Components**
  - Scene의 기본 단위는 Entity
  - 기능은 Component로 추가
  - Transform, Light, Physics, Audio, Compute Simulation 등 조합
  - Hierarchy에서 entity를 중첩하고 Project Browser에서 asset 관리

- **Compute Simulation**
  - 새 Compute Simulation component
  - node-based Compute Graph를 사용
  - GPU programming을 시각적으로 구성
  - particle부터 fluid simulation까지 표현 가능
  - Simulation tab에서 실제 실행 상태를 보면서 authoring 가능

- **Prototypes and Instances**
  - Entity를 Project Browser로 drag해 reusable prototype 생성
  - 여러 instance에서 source를 공유
  - Instance별 property override 가능
  - Override reset 및 source로 propagate 가능

- **Live Preview**
  - 연결된 Vision Pro에서 scene simulation을 실행
  - Mac의 Reality Composer Pro에서 수정하면 headset에 즉시 반영
  - 실제 spatial scale과 physical-space lighting을 확인하면서 authoring
  - 배포 과정을 반복하지 않고 빠른 검증 가능

- **Lightmaps**
  - Static light 환경에서 indirect lighting을 precompute
  - Indirect Lighting, Ambient Occlusion, Beauty lightmap 지원
  - Preview tab에서 bake 전 결과를 확인
  - runtime global illumination 비용을 줄이면서 scene 품질 향상

- **Reality Composer Pro Assistant**
  - Editor 오른쪽 panel에서 항상 접근
  - 자연어 prompt로 3D object와 material 생성
  - Reality Composer Pro 관련 질문에도 응답
  - 외부 DCC tool로 나갔다 돌아오는 횟수를 줄임

---

# 🧭 Reality Composer Pro 3의 방향

Apple이 이번 버전에서 강조한 목표는 단순히 기능을 더 추가하는 것이 아니라 **friction을 줄이는 것**이다.

기존 spatial workflow는 종종 다음과 같은 반복을 포함한다.

```text
3D Tool
   ↓
Asset Export
   ↓
Xcode
   ↓
Build
   ↓
Vision Pro Deploy
   ↓
확인
   ↓
다시 수정
```

Reality Composer Pro 3의 목표:

```text
Reality Composer Pro 3
   ↓
Author
   ↓
Simulate
   ↓
Preview on Vision Pro
   ↓
Adjust
   ↓
Repeat
```

즉 spatial content 자체에 관한 반복 작업을 가능한 한 editor 안에서 끝내도록 설계됐다.

---

# 🖥️ Reality Composer Pro 3는 Standalone App

세션에서 가장 먼저 언급되는 변화는 배포 방식이다.

Reality Composer Pro 3는 더 이상 Xcode에 포함된 developer tool이 아니다.

developer.apple.com에서 별도로 다운로드해 Applications 폴더에서 직접 실행한다.

의미:

- Spatial artist가 Xcode workflow를 몰라도 editor를 직접 사용할 수 있음
- 3D content 제작 과정과 app code 개발을 더 독립적으로 진행 가능
- Reality Composer Pro 자체가 하나의 production tool로 분리

기본 사용법은 WWDC23의 **Meet Reality Composer Pro** 세션을 참고하도록 안내한다.

---

# 🏘️ Chaparral Village 예제

세션은 Chaparral Village sample의 **Alchemy Area**를 사용한다.

Scene의 object들은 Blender에서 제작된 뒤 USD로 export되어 Reality Composer Pro에서 layout됐다.

```text
Blender
   ↓
USD
   ↓
Reality Composer Pro
   ↓
Scene Composition
```

사용자는 Focus Mode를 이용해 특정 영역에 집중해 scene을 편집할 수 있다.

---

# 📦 Asset Import

예제에서는 Cauldron USD file을 Project Browser의 import asset 버튼으로 가져온다.

USD import 과정:

```text
USD File
   ↓
Import
   ↓
Import Bundle
   ├─ Geometry
   ├─ Materials
   ├─ Textures
   └─ Other resources
```

Reality Composer Pro는 import된 USD content를 **import bundle**로 정리하고 최적화한다.

Project Browser에서 bundle을 expand하면 내부 resource를 inspect할 수 있다.

이후 bundle을 viewport로 drag하면 scene hierarchy에 entity로 추가된다.

---

# 🧱 Entities and Components

Reality Composer Pro 3의 핵심 architecture는 entity-component model이다.

```text
Entity
  ├─ Transform Component
  ├─ Light Component
  ├─ Physics Component
  ├─ Audio Component
  ├─ Compute Simulation Component
  └─ ...
```

Entity는 scene 안의 object이며 Component가 실제 동작과 속성을 부여한다.

---

# 🌳 Hierarchy

Hierarchy panel은 scene을 구성하는 모든 entity를 보여준다.

Entity는:

- Reorder 가능
- Nest 가능
- Parent-child relationship 구성 가능

세션에서는 imported Cauldron을 Fireplace 아래 child로 이동한다.

```text
Fireplace
  └─ Cauldron
```

이후 Transform component에서 위치와 rotation을 조절한다.

---

# 📐 Transform Component

Import된 entity에는 기본적으로 Transform component가 존재한다.

Transform에서 제어:

- Position
- Rotation
- Scale

Scene authoring의 가장 기본적인 component다.

특정 entity를 viewport에 frame하려면 `f` key를 사용할 수 있다.

---

# ➕ Component 추가

Inspector의 **Add Component** 버튼으로 entity 기능을 확장한다.

예:

- Lights
- Physics
- Audio
- Simulation
- 기타 RealityKit capability

세션에서는 Table 아래에 `Magic Effect` entity를 만들고 그 아래 `Glow` child를 추가한다.

```text
Table
  └─ Magic Effect
       └─ Glow
```

Glow에는 Point Light component를 추가한다.

조절:

- Position
- Attenuation
- Color
- Intensity

---

# ✨ Compute Simulation Component

`Magic Effect` entity에 새 **Compute Simulation component**를 추가한다.

Inspector에서 Compute Graph를 선택한다.

Project에는 두 개의 graph가 있다.

```text
Magic Graph
Brewing Graph
```

처음에는 Magic Graph를 사용한다.

---

# 🧮 Compute Graph

Compute Graph는 node-based GPU programming environment다.

Apple 설명상:

> GPU programming을 더 넓은 사용자에게 접근 가능하게 하는 기능

활용 범위:

- Particle systems
- Procedural effect
- Complex fluid simulations
- GPU-driven visual effects

Graph는 simulation stage에서만 실행되므로 static editor viewport에서는 결과가 보이지 않는다.

실제로 확인하려면 Play를 눌러 simulation을 실행한다.

더 자세한 내용은 WWDC26의 **Supercharge your spatial workflows with Reality Composer Pro 3** 세션을 참고하도록 안내한다.

---

# ▶️ Simulation Tab

Play를 누르면 Reality Composer Pro 안에서 game/scene simulation이 시작된다.

세션에서 강조한 핵심은 simulation 결과만 보는 것이 아니라 **simulation이 실행 중인 상태에서 계속 authoring할 수 있다는 점**이다.

예:

```text
Scene Tab | Simulation Tab
```

두 tab을 나란히 dock할 수 있다.

그 상태로:

- Magic Effect 위치 변경
- Bowl 안으로 이동
- Compute Graph twist amount 조정

등을 바로 수행한다.

---

# ⚡ Real-time Iteration

Simulation tab이 지원하는 것:

- Physics simulation
- Script Graph
- Animations
- Compute Graph
- 기타 runtime behavior

기존 workflow:

```text
수정
→ Build
→ Deploy
→ Launch
→ 확인
```

Reality Composer Pro 3:

```text
수정
→ Simulation에 즉시 반영
```

Deployment process가 반복 작업을 막지 않는다.

---

# 🧬 Prototypes

다음 핵심 기능은 **Prototype**이다.

Prototype은 reusable entity definition이다.

생성 방법:

```text
Hierarchy의 Entity
      ↓ drag
Project Browser
      ↓
Prototype Asset
```

세션에서는 Magic Effect entity를 Project Browser로 drag해 prototype을 만든다.

---

# ♻️ Instance 생성

Prototype을 다시 viewport로 drag하면 instance가 생성된다.

```text
Magic Effect Prototype
      ↓
Instance 1: Magic Effect
Instance 2: Brewing Effect
```

세션에서는 새 instance 이름을 `Brewing Effect`로 변경한다.

---

# 🎛️ Instance Override

모든 instance가 prototype source와 완전히 같을 필요는 없다.

Instance별로 특정 property를 override할 수 있다.

Brewing Effect에서:

- Compute Graph: Magic → Brewing
- Glow color 변경
- Attenuation 변경
- Falloff 변경

이런 방식으로 하나의 reusable source를 유지하면서 개별 variant를 만들 수 있다.

---

# ↩️ Reset Override

특정 override 결과가 마음에 들지 않으면 context menu에서 Reset을 선택한다.

예:

```text
Brewing Effect
  Attenuation Falloff override
         ↓
Reset
         ↓
Prototype source value 복원
```

---

# ⬆️ Propagate Override

반대로 instance에서 만든 변경이 모든 instance에 적용돼야 한다면 override를 prototype source로 propagate할 수도 있다.

Prototype workflow의 핵심:

```text
Source
  ↓
Many Instances
  ↓
Local Overrides
  ├─ Reset 가능
  └─ Source로 Propagate 가능
```

Apple의 표현대로 “원하지 않는 이상 아무것도 영구적으로 바뀌지 않는다.”

---

# 🧠 Prototypes가 해결하는 문제

대규모 scene에서는 같은 object/effect가 반복될 수 있다.

Prototype이 없으면:

```text
Object A
Object A copy
Object A copy
Object A copy
```

각 copy가 독립적이라 유지보수가 어렵다.

Prototype 사용:

```text
Prototype A
 ├─ Instance 1
 ├─ Instance 2
 └─ Instance 3
```

장점:

- Source single point of truth
- Reuse
- Local customization
- Mass update
- 실수 복구

---

# 🥽 Live Preview

다음 핵심 기능은 Vision Pro **Live Preview**다.

Reality Composer Pro가 Mac에 연결된 Vision Pro를 simulation target으로 사용할 수 있다.

Launch Control panel에서 Live Preview session을 시작한다.

Apple은 세션 당시 이 기능이 later this year에 제공된다고 설명한다.

---

# 🔁 Live Preview Workflow

```text
Mac
Reality Composer Pro
      ↓
Authoring change
      ↓
Connected Vision Pro
      ↓
즉시 반영
```

Companion app이 visionOS에서 열리고, Mac editor의 변경 사항이 headset에 실시간 반영된다.

---

# 🌌 왜 On-device Authoring이 중요한가

Spatial content는 2D monitor에서만 확인하면 정확히 판단하기 어려운 요소가 많다.

예:

- Scale
- Depth
- Presence
- Lighting
- Spatial relationship
- Physical surroundings와의 interaction

세션에서는 blue fill light가 새로운 physical-space lighting feature를 사용한다.

이런 effect는 실제 Vision Pro에서 봐야 impact를 제대로 평가할 수 있다.

Live Preview는 다음 loop를 만든다.

```text
Edit on Mac
   ↓
See on Vision Pro
   ↓
Adjust
   ↓
See again immediately
```

즉 “what you see is what you get” 방식에 가까워진다.

---

# 💡 Lighting 수정 이후 발생하는 문제

Scene의 fill light를 변경했지만 기존 indirect lighting 결과는 이전 lighting configuration을 기준으로 만들어져 있다.

따라서 scene의 direct light와 baked indirect light 사이가 맞지 않게 된다.

이를 해결하기 위해 Reality Composer Pro 3의 **Lightmaps**를 사용한다.

---

# 🌤️ Indirect Lighting

Indirect lighting은 light가 surface에서 bounce해 direct light가 닿지 않는 곳까지 영향을 주는 현상이다.

예:

```text
Fireplace Light
       ↓
Wall / Floor에 반사
       ↓
Table 아래 공간에 약한 빛 도달
```

Direct light만 계산하면 이런 soft bounced light가 사라진다.

Alchemy Area의 대부분은 fireplace에 직접 노출되지 않는다.

Lightmap은 이런 영역을 더 자연스럽게 밝힌다.

---

# 🗺️ Lightmap

Static light는 runtime마다 indirect lighting을 다시 계산할 필요가 없다.

대신 precompute하고 texture로 저장할 수 있다.

```text
Static Scene + Static Lights
        ↓
Bake
        ↓
Lightmap Texture
        ↓
Runtime에서 사용
```

장점:

- 높은 visual fidelity
- Runtime GI cost 감소
- Spatial device에서 performance 절약

---

# 🧩 Lightmap Component

Alchemy Area entity에는 Lightmap component가 붙어 있다.

Inspector에서 제어:

- 어떤 lighting term을 bake할지
- Quality 설정
- 기타 bake parameter

세션에서는 quality를 Low → High로 변경한다.

---

# 👁️ Lightmap Preview Tab

Bake를 바로 시작하지 않고 **Lightmap Preview** tab으로 예상 결과를 확인할 수 있다.

```text
Settings 변경
      ↓
Preview
      ↓
결과 확인
      ↓
설정 조정
      ↓
최종 Bake
```

Full bake는 비용이 큰 작업이므로 preview 단계에서 설정을 검증하는 것이 iteration에 중요하다.

---

# 🌗 Lightmap Lighting Terms

Reality Composer Pro 3에서 지원하는 주요 lighting term:

## Indirect Lighting

Surface bounce를 통해 발생하는 간접광.

## Ambient Occlusion

각 point가 surrounding environment에 얼마나 노출되어 있는지를 표현한다.

주로 corner, crevice, 접촉 영역의 depth perception을 강화한다.

## Beauty

최종 point color를 표현한다.

```text
Direct Lighting
+
Indirect Lighting
→ Final Color
```

즉 최종 lighting appearance를 texture로 bake한다.

---

# ✅ Lightmap Bake 결과

설정을 결정한 뒤 bake를 실행한다.

Bake 완료 후 scene의 indirect lighting이 새 lighting configuration과 다시 맞춰지고 Alchemy Area의 전체 visual quality가 개선된다.

---

# 🤖 Reality Composer Pro Assistant

마지막으로 소개된 새 기능은 **Reality Composer Pro Assistant**다.

Editor 오른쪽 panel에서 항상 접근할 수 있다.

사용자는 자연어 prompt를 입력한다.

예제에서는 workbench 위를 채울 추가 object를 생성하고, 이어 candle도 추가한다.

---

# 🎨 생성 가능한 Content

Assistant는 generative model을 사용해 다음을 생성한다.

- 3D objects
- Materials

핵심 목적:

```text
Idea
  ↓
Prompt
  ↓
Generated 3D Content
  ↓
Scene에 바로 사용
```

외부 modeling tool에서 간단한 prop을 만들고 export/import하는 과정을 줄일 수 있다.

---

# 💬 Editor Q&A Assistant

Assistant는 asset generation만 제공하는 것이 아니다.

Reality Composer Pro 자체에 관한 질문에도 답변할 수 있다.

즉:

```text
Creation Assistant
+
Tool Knowledge Assistant
```

두 역할을 동시에 수행한다.

---

# 🚀 Reality Composer Pro 3의 Iteration Stack

이번 세션의 핵심 기능을 하나의 흐름으로 정리하면 다음과 같다.

```text
Asset Import
      ↓
Entities + Components
      ↓
Compute Simulation
      ↓
Simulation Tab
      ↓
Prototype / Instance
      ↓
Vision Pro Live Preview
      ↓
Lightmap Preview + Bake
      ↓
AI Assistant
      ↓
Spatial Scene 완성
```

모든 단계가 editor 안에 집중되어 있다.

---

# 🧭 기능별 역할

| 기능 | 역할 |
|---|---|
| Import Bundle | USD resource 정리·최적화 |
| Entity | Scene object 기본 단위 |
| Component | Entity에 기능 부여 |
| Compute Simulation | GPU 기반 visual simulation |
| Simulation Tab | Runtime behavior 즉시 확인 |
| Prototype | Reusable entity source |
| Instance | Prototype의 scene-level 사용본 |
| Override | Instance별 custom property |
| Live Preview | Vision Pro에서 실시간 spatial 검증 |
| Lightmap | Static lighting 사전 계산 |
| Lightmap Preview | Bake 전 lighting 검증 |
| Assistant | 3D object/material 생성 + editor 질문 |

---

# 📋 체크리스트

## Reality Composer Pro 3 시작

- [ ] developer.apple.com에서 standalone Reality Composer Pro 3 다운로드
- [ ] Applications 폴더에서 실행
- [ ] 기존 Reality Composer Pro/Xcode workflow와 차이 확인
- [ ] WWDC23 Meet Reality Composer Pro 기본 내용 복습
- [ ] Chaparral Village sample 확인

## Asset Import

- [ ] USD asset 준비
- [ ] Project Browser에서 import
- [ ] Import bundle 내부 resource 확인
- [ ] Geometry 확인
- [ ] Material 확인
- [ ] Texture 확인
- [ ] Import optimization 결과 확인
- [ ] Viewport로 drag해 entity 생성

## Entity / Component

- [ ] Hierarchy 구조 정리
- [ ] Parent-child 관계 정의
- [ ] Transform 조정
- [ ] `f` key로 selected entity framing
- [ ] 필요한 component만 추가
- [ ] Light component 설정
- [ ] Physics 필요 여부 확인
- [ ] Audio 필요 여부 확인

## Compute Simulation

- [ ] Compute Simulation component 추가
- [ ] 적절한 Compute Graph 선택
- [ ] Simulation stage에서 graph 동작 확인
- [ ] Play로 runtime simulation 실행
- [ ] Scene tab과 Simulation tab 나란히 배치
- [ ] Runtime 중 parameter 수정
- [ ] Particle/fluid 등 GPU workload 성능 확인
- [ ] 관련 Compute Graph 세션 참고

## Prototypes

- [ ] 반복되는 entity 식별
- [ ] Hierarchy entity를 Project Browser로 drag
- [ ] Prototype 생성
- [ ] Scene에 여러 instance 생성
- [ ] Instance name 정리
- [ ] Local override 적용
- [ ] 잘못된 override는 Reset
- [ ] 공통 변경은 source로 propagate할지 검토
- [ ] Prototype source를 single source of truth로 유지

## Live Preview

- [ ] Vision Pro와 Mac 연결
- [ ] Launch Control에서 target 확인
- [ ] Live Preview session 시작
- [ ] Companion app 실행 확인
- [ ] Mac 수정이 headset에 실시간 반영되는지 확인
- [ ] 실제 spatial scale 검증
- [ ] Lighting impact 검증
- [ ] Physical-space interaction 검증
- [ ] Xcode deployment 없이 반복 가능한 영역 최대화

## Lightmaps

- [ ] Static light인지 확인
- [ ] Indirect lighting bake 필요 여부 판단
- [ ] Lightmap component 추가/확인
- [ ] Bake quality 설정
- [ ] Preview tab으로 결과 미리 확인
- [ ] Indirect Lighting 선택
- [ ] Ambient Occlusion 필요 여부 확인
- [ ] Beauty map 필요 여부 확인
- [ ] Final bake 실행
- [ ] Runtime performance와 texture memory trade-off 확인

## Reality Composer Pro Assistant

- [ ] Right panel에서 Assistant 확인
- [ ] 간단한 prop을 prompt로 생성
- [ ] Material 생성 테스트
- [ ] Generated object 품질 검토
- [ ] Scale/orientation 검증
- [ ] Scene style과 일관성 확인
- [ ] Reality Composer Pro 사용법 질문 테스트
- [ ] Production asset으로 사용 전 optimization 검토

---

# ⚠️ 구현 시 주의할 점

## Simulation Preview와 Final Device Experience는 다르다

Mac에서 simulation이 잘 보여도 spatial scale과 lighting은 Vision Pro에서 다르게 느껴질 수 있다.

따라서 Live Preview 단계가 중요하다.

## Prototype Override를 무분별하게 사용하지 않는다

Instance별 override가 지나치게 많아지면 source와 instance 사이의 관계를 이해하기 어려워질 수 있다.

공통 변경은 source에 propagate하고 정말 필요한 차이만 local override로 유지하는 것이 좋다.

## Lightmap은 Static Lighting에 적합하다

Lighting이 실시간으로 크게 움직이는 scene에는 precomputed lightmap만으로 대응할 수 없다.

Static contribution과 dynamic contribution을 구분해야 한다.

## High-quality Bake는 Cost가 있다

Bake quality를 높이면:

- Bake time 증가
- Texture data 증가 가능
- Iteration time 증가

Preview 기능을 먼저 이용해 설정을 확정하는 이유다.

## AI-generated Asset은 Final QA가 필요하다

Assistant가 빠르게 3D object/material을 생성하더라도 production에 바로 사용하기보다 다음을 검토해야 한다.

- Polygon/detail level
- Material consistency
- Scale
- Pivot
- Performance
- Visual style

---

# 🎯 실무적인 Iteration Strategy

## 빠른 Prototype 단계

```text
Assistant / Imported Asset
      ↓
Entity + Component
      ↓
Simulation Tab
```

## Reuse 정리 단계

```text
Repeated Entity
      ↓
Prototype
      ↓
Instances + Overrides
```

## Spatial Validation 단계

```text
Vision Pro Live Preview
      ↓
Scale / Light / Presence 확인
```

## Visual Finalization 단계

```text
Lightmap Preview
      ↓
High Quality Bake
```

이렇게 단계별로 기능을 사용하면 build/deploy 중심 workflow보다 빠르게 scene을 완성할 수 있다.

---

# 🔗 Reality Composer Pro 3의 협업 관점

Apple은 Reality Composer Pro 3를 **fast, iterative, collaborative workflow**용으로 설계했다고 설명한다.

특히 standalone editor가 되면서 역할 분리가 쉬워진다.

```text
Spatial Artist
→ Asset / Layout / Lighting / Effect

Developer
→ RealityKit / Swift / App Logic
```

Editor 자체에서 scene을 더 깊게 완성할 수 있으므로 개발자가 Xcode에서 spatial content의 모든 시각적 조정을 담당할 필요가 줄어든다.

---

# 🧠 이전 Reality Composer Pro와 비교

| 항목 | 기존 중심 흐름 | Reality Composer Pro 3 |
|---|---|---|
| 배포 형태 | Xcode developer tool | Standalone app |
| Runtime preview | Deployment 의존도 높음 | Simulation tab |
| Reusable content | 기존 scene organization 중심 | Prototype + Instance |
| Device validation | Xcode build/deploy | Live Preview |
| Static GI | 외부 workflow 비중 | Lightmaps 내장 |
| Asset creation | 외부 3D tool 의존 | AI Assistant로 즉석 생성 가능 |
| Iteration | Tool 전환 많음 | Editor 안에서 반복 |

---

# 핵심 메시지

Reality Composer Pro 3의 가장 중요한 변화는 개별 기능 하나가 아니라 **spatial content 제작의 반복 주기를 editor 안으로 가져온 것**이다.

Standalone app으로 분리되면서 Xcode와 독립적인 spatial authoring tool이 되었고, entity-component model을 기반으로 scene을 구성한 뒤 Compute Simulation과 Simulation tab에서 runtime behavior를 즉시 확인할 수 있다.

Prototype과 Instance는 대규모 scene의 reusable content를 체계적으로 관리하고, local override와 reset/propagate workflow로 variation을 유지한다.

Live Preview는 Mac에서 수정한 scene을 Vision Pro에서 즉시 확인하게 해 spatial scale, lighting, physical-space effect 같은 요소를 실제 device에서 빠르게 검증하게 한다.

Lightmaps는 static scene의 indirect lighting, ambient occlusion, beauty lighting을 미리 계산해 높은 visual fidelity를 runtime cost 없이 제공한다.

마지막으로 Reality Composer Pro Assistant는 자연어만으로 3D object와 material을 생성하고 editor 사용법까지 도와줘 content authoring의 진입 장벽과 tool switching을 줄인다.

전체 흐름을 한 문장으로 정리하면:

```text
Create → Simulate → Reuse → Preview → Bake → Generate
```

즉 Reality Composer Pro 3는 spatial scene을 **Xcode에 넘기기 전에 훨씬 더 완성된 상태까지 빠르게 반복 제작할 수 있는 통합 authoring environment**로 발전했다.

---

# 함께 보면 좋은 세션과 자료

- Meet Reality Composer Pro — WWDC23
- Design no-code games with Reality Composer Pro 3 — WWDC26
- Explore advances in RealityKit — WWDC26
- Extend Reality Composer Pro 3 functionality with Xcode — WWDC26
- Supercharge your spatial workflows with Reality Composer Pro 3 — WWDC26
- Chaparral Village sample project
