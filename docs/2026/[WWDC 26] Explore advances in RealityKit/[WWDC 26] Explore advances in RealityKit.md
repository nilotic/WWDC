# WWDC26 Explore advances in RealityKit 요약

- Session: 279
- Title: Explore advances in RealityKit
- Source: https://developer.apple.com/videos/play/wwdc2026/279/
- Topic: RealityKit, Reality Composer Pro 3, Lighting, Navigation Mesh, Cloth Simulation, LOD, Gaussian Splats, Immersive Audio
- Chapters: Introduction, Lighting and shadows, Navigation mesh, Cloth simulation, Performance, 3D Gaussian splats, Immersive audio, Next steps

---

## 한 줄 요약

RealityKit은 올해 **lightmap·soft shadow·projective texture·physical space lighting**, **navigation mesh와 off-mesh connection**, **고급 cloth simulation**, **Level of Detail와 thermal 대응**, **3D Gaussian splats**, **custom reverb mesh 기반 immersive audio**를 추가해 spatial app과 game의 시각·물리·이동·성능·오디오 품질을 한 단계 끌어올렸다.

---

## 핵심 요약

이번 세션은 Chaparral Village라는 데모 게임을 중심으로 RealityKit의 새로운 기능을 단계적으로 설명한다.

- **Lighting and shadows**
  - Reality Composer Pro 3 light baker로 indirect lighting lightmap 생성
  - RealityKit API로 indirect lighting, ambient occlusion, beauty lightmap 사용 가능
  - Dynamic light에 soft shadow 추가
  - `lightSize`와 `quality`로 penumbra와 품질 조절
  - `ProjectiveTexture`로 spotlight에 image pattern 투사
  - `SurroundingsLight`로 virtual light가 실제 환경의 scene understanding mesh에 투사

- **Navigation mesh**
  - Traversable area 정의
  - Area별 traversal cost와 custom flags
  - Off-mesh connection으로 서로 분리된 navigation region 연결
  - `NavigationMeshResource` → `NavigationComponent` → `NavigationController`
  - Sync/async path calculation

- **Cloth simulation**
  - Mesh vertex를 particle, edge를 spring으로 시뮬레이션
  - `ClothBodyComponent`, `ClothColliderComponent`, `ClothSimulationComponent`
  - Material별 spring stiffness, friction 등 설정
  - 특정 vertex를 `.kinematic`으로 만들어 cloth pin 구현

- **Performance**
  - `LevelOfDetailComponent`
  - Camera distance 기반 LOD
  - Screen area 기반 LOD
  - `thermalStateDidChange` 감지 후 shadow 품질과 LOD threshold를 동적으로 조정

- **3D Gaussian splats**
  - Real-world volumetric capture를 높은 품질로 렌더링
  - File format을 강제하지 않고 buffer 기반 API 제공
  - Position, scale, rotation, opacity, spherical harmonics 필요
  - `GaussianSplatResource` + `GaussianSplatComponent`

- **Immersive audio**
  - Raytraced geometrical acoustics
  - `ReverbMeshResource`로 custom acoustic geometry 생성
  - Built-in material preset 또는 absorption/scattering 기반 custom material 정의
  - Custom reverb mesh는 immersive space에서만 사용
  - Shared space에서는 system room-sense reverb geometry 사용

---

# 🌍 RealityKit의 위치

RealityKit은 2019년에 도입된 Apple의 3D spatial framework다.

한 번 만든 경험을 다음 플랫폼에 배포할 수 있다.

- visionOS
- iOS
- iPadOS
- macOS
- tvOS

이번 해에는 Reality Composer Pro 3도 크게 업데이트되어 scene editing과 graph-based behavior authoring이 강화됐다.

RealityKit의 새 기능들은 이 authoring tool과 함께 사용할 때 특히 잘 맞는다.

---

# 💡 Lighting과 Shadows

Chaparral Village의 alchemy area는 전체적으로 괜찮지만 구석이 너무 어둡다.

이 문제를 해결하기 위해 Reality Composer Pro 3의 light baker로 indirect lighting lightmap을 만든다.

Lightmap이 적용되면 직접 빛을 받지 않는 corner도 reflected light의 기여를 받아 자연스럽게 밝아진다.

RealityKit API에서 직접 연결할 수 있는 lightmap 유형:

- Indirect lighting
- Ambient occlusion
- Beauty

Apple은 best experience를 위해 Reality Composer Pro 3의 light baker 사용을 권장한다.

---

# 🌗 Static Lightmap과 Dynamic Soft Shadow

Lightmap은 복잡한 조명 효과를 저렴하게 제공하지만 static lighting에 적합하다.

Dynamic light에는 soft shadow가 추가됐다.

기본 RealityKit shadow는 hard edge다.

이는 light source가 매우 작은 point source라면 물리적으로 자연스럽다.

하지만 실제 light source는 면적을 가지므로 일부 영역에서는 light가 부분적으로 가려진다.

이 영역이 **penumbra**다.

```text
작은 Light Source
→ 작은 Penumbra
→ 더 Hard한 Shadow

큰 Light Source
→ 큰 Penumbra
→ 더 Soft한 Shadow
```

---

# 🌤️ Soft Shadow 설정

세션에서는 hearth spotlight에 soft shadow를 적용한다.

```swift
guard var shadow = hearthSpotlight.components[
    SpotLightComponent.Shadow.self
] else {
    // handle error
}

shadow.lightSize = 0.7
shadow.quality = .medium

hearthSpotlight.components.set(shadow)
```

핵심 property:

- `lightSize`
  - Meter 단위 light diameter
  - 기본값 0
  - 0이면 hard shadow

- `quality`
  - Soft shadow sampling 품질
  - `.medium` 또는 `.high`에서 soft shadow 지원
  - `.low`이면 `lightSize`와 무관하게 hard shadow

Quality가 높을수록 품질은 좋아지지만 performance cost도 증가한다.

---

# 📽️ Projective Textures

Projective texture는 flashlight 앞에 film을 놓고 빛을 비추는 것과 비슷하다.

Texture pattern이 light가 닿는 surface에 투사된다.

활용 예:

- 창살 사이의 빛 pattern
- Animated underwater caustics
- Planetarium stars와 nebulae

세션의 planetarium은 rotating spotlight에 stars/nebulae texture를 붙인다.

```swift
let spotLightEntity = Entity()

spotLightEntity.components.set(
    SpotLightComponent(
        color: .white,
        intensity: intensity,
        innerAngleInDegrees: innerAngle,
        outerAngleInDegrees: outerAngle,
        attenuationRadius: attenuationRadius
    )
)

let projectiveTexture:
    TextureResource = generateStarsAndNebulaeTexture()

spotLightEntity.components.set(
    SpotLightComponent.ProjectiveTexture(
        texture: projectiveTexture
    )
)
```

White light를 사용하면 texture 자체의 색에 추가 tint를 입히지 않는다.

Room이 클수록 wall에서 texture가 잘 보이게 intensity를 높여야 할 수 있다.

---

# 🏠 Physical Space Lighting

Projective texture를 virtual wall뿐 아니라 실제 room wall에 투사하려면 physical space lighting을 사용한다.

이 기능은 RealityKit의 scene understanding mesh를 이용해 virtual light가 system environment 또는 real world와 상호작용하게 한다.

지원되는 light type:

- Spotlight
- Point light

활성화는 매우 간단하다.

```swift
spotLightEntity.components.set(
    SpotLightComponent.SurroundingsLight()
)
```

이 component를 추가하면 virtual spotlight가 실제 room geometry에도 빛을 투사할 수 있다.

---

# 🧭 Navigation Mesh

RealityKit은 NPC와 player character가 scene 안을 이동할 수 있도록 navigation mesh를 제공한다.

기본 개념:

```text
Scene Geometry
      ↓
Traversable Area 정의
      ↓
Navigation Mesh
      ↓
Start → Goal Path 계산
```

Navigation mesh는 단순히 이동 가능/불가능만 표현하지 않는다.

각 area에 traversal cost를 줄 수 있다.

예:

```text
Road cost = 1
Forest cost = 5
```

Forest도 지나갈 수 있지만 느리다는 의미를 cost로 표현한다.

Pathfinder는 총 cost가 더 낮은 경로를 선택한다.

---

# 🌉 Off-mesh Connection

Scene이 두 개의 disconnected navigation region으로 나뉠 수 있다.

이 경우 bridge, ladder, jump 같은 특별한 connection으로 연결한다.

이것이 off-mesh connection이다.

```text
Navigation Mesh A
      ↓
Off-mesh Connection
      ↓
Navigation Mesh B
```

Off-mesh connection이 생기거나 위치가 바뀌면 path를 다시 계산해야 한다.

---

# 🗺️ Navigation API 구조

RealityKit navigation은 다음 구조를 사용한다.

```text
NavigationMeshResource
        ↓
NavigationComponent
        ↓
NavigationController
        ↓
Path 계산
```

## `NavigationMeshResource`

포함 정보:

- Navigation geometry
- Labeled areas
- Custom flags
- Area connections

Swift API 또는 Reality Composer Pro 3에서 만들 수 있다.

## `NavigationComponent`

Filter를 사용해 다음을 정의한다.

- Area별 traversal cost
- Flag에 따른 include/exclude

## `NavigationController`

Path를 sync 또는 async 방식으로 계산한다.

---

# 🚶 Async Path Query

세션의 `Entity.navigate` extension은 async path calculation을 사용한다.

```swift
extension Entity {
    public func navigate(/* ... */) async {
        let navigator = try! NavigationController(
            entity: self
        )

        guard let result = await navigator.computePath(
            from: fromPosition,
            to: toPosition
        ) else {
            return
        }

        if result.isEmpty {
            return
        }

        for node in result {
            switch node.category {
            case .meshPoint:
                finalPath.append(node.position)

            case .offMeshConnection:
                // ladder 등 별도 처리
                break
            }
        }
    }
}
```

결과의 각 node는 일반 navigation mesh point일 수도 있고 off-mesh connection일 수도 있다.

앱은 category에 따라 animation이나 traversal logic을 다르게 처리할 수 있다.

---

# 🪡 Cloth Simulation

RealityKit의 cloth simulation은 cloth를 mesh 기반 particle-spring system으로 표현한다.

```text
Mesh Vertex
→ Particle

Mesh Edge
→ Spring
```

충분히 세밀한 mesh가 있으면 다음처럼 다양한 fabric을 real-time으로 표현할 수 있다.

- Dress
- Bed cover
- Curtain
- Furnishing fabric

---

# 🧵 Cloth Simulation Component 구조

Cloth simulation에는 세 가지 주요 구성 요소가 있다.

## `ClothBodyComponent`

Cloth 자체를 나타낸다.

포함 정보:

- Cloth material reference
- Cloth mesh resource
- Particle/spring layout

## `ClothColliderComponent`

Cloth가 충돌할 rigid object를 나타낸다.

예:

- Bed
- Mannequin
- Furniture

## `ClothSimulationComponent`

실제 simulation 설정을 관리한다.

포함 정보:

- Materials
- Solver
- Gravity
- Time step
- Descendant cloth simulation settings

---

# 🧶 Cloth Material

Cloth body와 collider는 material property를 사용한다.

예:

- Spring stiffness
- Friction

실제 property는 cloth material인지 collider material인지에 따라 다르다.

---

# 📌 Cloth Pinning

Chaparral Village의 curtain은 ring에 매달려 있어야 한다.

특정 vertex를 움직이지 않도록 만들어 pin을 구현한다.

```swift
for (pin, pinComponent) in pins {
    let position = pin.position(
        relativeTo: event.entity
    )

    let selectionSphere = ClothSphereShape(
        radius: pinComponent.radius
    )

    let vertices = clothMesh.vertices(
        in: .sphere(selectionSphere),
        center: position
    )

    clothBody.motionTypes.set(
        vertexIndices: vertices,
        value: .kinematic
    )
}
```

`kinematic` vertex는 cloth simulation 자체로는 움직이지 않는다.

Entity transform으로만 움직일 수 있다.

따라서 curtain ring 위치에 고정된 것처럼 동작한다.

---

# ⚡ Performance: Mesh Level of Detail

고급 lighting, cloth, splat 같은 기능은 performance cost가 있을 수 있다.

RealityKit은 LOD를 이용해 geometry complexity를 줄일 수 있다.

LOD는 distance나 screen coverage가 작아졌을 때 더 단순한 geometry를 사용한다.

```text
LOD 0
가장 높은 Detail

LOD 1
중간

LOD 2
낮음

...
```

멀리 있는 object에서는 high-detail mesh와 low-detail mesh의 visual 차이가 작지만 rendering cost는 줄어든다.

---

# 📏 Camera Distance 기반 LOD

```swift
let lod0 = [ModelEntity(mesh: lodMesh0)]
let lod1 = [ModelEntity(mesh: lodMesh1)]
let lod2 = [ModelEntity(mesh: lodMesh2)]

let entity = Entity()

LevelOfDetailComponent.addByCameraDistance(
    to: entity,
    levels: [
        (entities: lod0, maxDistance: 1.0),
        (entities: lod1, maxDistance: 5.0),
        (entities: lod2, maxDistance: .infinity)
    ]
)
```

각 LOD에 최대 camera distance를 지정한다.

마지막 LOD는 `.infinity`로 두어 이전 threshold를 넘어선 모든 거리에 사용한다.

---

# 🖥️ Screen Area 기반 LOD

Distance 대신 화면에서 object가 차지하는 area를 기준으로 전환할 수 있다.

```swift
LevelOfDetailComponent.addByScreenArea(
    to: entity,
    levels: [
        (entities: lod0, minArea: 0.2),
        (entities: lod1, minArea: 0.1),
        (entities: lod2, minArea: 0.01)
    ]
)
```

`minArea`는 전체 screen area의 fraction이다.

Object가 화면에서 차지하는 비중이 줄어들수록 더 낮은 detail level로 전환한다.

---

# 🌡️ Thermal State 대응

성능 최적화는 static tuning만으로 끝나지 않는다.

실행 중 device thermal state를 관찰해 runtime quality를 낮출 수 있다.

```swift
NotificationCenter.default.addObserver(
    of: ProcessInfo.self,
    for: .thermalStateDidChange
) { _ in
    switch ProcessInfo.processInfo.thermalState {
    case .nominal, .fair:
        // 유지

    case .serious, .critical:
        // 더 aggressive한 LOD
        // shadow quality 감소
        break

    @unknown default:
        break
    }
}
```

Serious 또는 critical 상태에서는 다음 같은 mitigation이 가능하다.

- LOD switching threshold를 더 공격적으로 조정
- Soft shadow quality 감소

사용자의 thermal comfort도 spatial experience 품질의 일부로 봐야 한다.

---

# 🌫️ 3D Gaussian Splats

RealityKit은 3D Gaussian splats를 직접 렌더링할 수 있다.

Gaussian splatting은 real-world volumetric capture를 높은 품질과 성능으로 표현하는 방식이다.

Scene은 많은 3D Gaussian으로 구성된다.

각 Gaussian은 opacity를 가진 ellipsoid처럼 생각할 수 있다.

---

# 📦 RealityKit은 특정 Splat File Format을 강제하지 않는다

RealityKit API는 특정 file format을 전제로 하지 않는다.

개발자가 buffer를 직접 제공한다.

필요한 buffer:

- Position
- Scale
- Rotation
- Opacity
- Spherical harmonics

Spherical harmonics는 viewing direction에 따른 ellipsoid color variation을 표현한다.

Degree가 0이면 모든 방향에서 동일한 color다.

Degree가 높을수록 viewing direction에 따른 color 표현이 richer해진다.

---

# 🧮 GaussianSplatResource 생성

```swift
let resource = try GaussianSplatResource.BufferResource(
    count: splatCount,
    position: positionBuffer,
    scale: scaleBuffer,
    rotation: rotationBuffer,
    opacity: opacityBuffer,
    sphericalHarmonics: (
        sphericalHarmonicsBuffer,
        degree
    )
)

let splatResource = GaussianSplatResource(resource)

let splatComponent = GaussianSplatComponent(
    splatResource
)

splatEntity.components.set(splatComponent)
```

흐름:

```text
Capture Data Buffers
      ↓
BufferResource
      ↓
GaussianSplatResource
      ↓
GaussianSplatComponent
      ↓
Entity
```

RealityKit이 render optimization을 담당한다.

---

# 🎧 Immersive Audio

Spatial computing에서는 sound direction뿐 아니라 direct path와 reflection path의 timing이 중요하다.

사용자와 sound source가 움직이면 timing과 orientation이 계속 바뀌어야 자연스럽다.

또 공간의 geometry와 material도 sound에 큰 영향을 준다.

예:

- 작은 living room
- 큰 museum

같은 sound source라도 reverb 특성이 전혀 다르다.

---

# 🔊 Raytraced Geometrical Acoustics

RealityKit은 environment geometry를 이용해 reflection과 reverb를 시뮬레이션한다.

세션의 kitchen/dining room에서는 다음 surface를 서로 다른 acoustic property로 모델링한다.

- Wood floor
- Plaster wall
- Stone countertop

사용자와 sound source의 위치에 따라 적절한 reverb가 달라진다.

---

# 🧱 Custom Reverb Mesh

Custom reverb mesh는 `ReverbMeshResource`로 만든다.

Mesh descriptor 또는 mesh resource로 만들 수 있고, 가장 간단한 시작점은 inward-facing shoebox다.

세션 예:

```swift
let mesh: ReverbMeshResource = .shoebox(
    size: [5, 4, 6]
)

let reverb: Reverb = .simulated(
    mesh: mesh,
    materials: [.dryWall]
)

entity.components.set(
    ReverbComponent(reverb: reverb)
)
```

크기:

- Width 5m
- Height 4m
- Depth 6m

---

# 🪵 Audio Material

Built-in material preset을 사용할 수 있다.

예:

- Dry wall
- Carpet

하지만 custom material도 만들 수 있다.

Acoustic material의 핵심 값:

- Absorption coefficients
- Scattering coefficients

Frequency별로 sound energy가 얼마나 흡수되거나 산란되는지를 나타낸다.

---

# 🧶 Custom Carpet Material

기존 carpet preset을 기반으로 absorption을 늘릴 수 있다.

```swift
let thickCarpet: Audio.Material =
    .carpet.scalingAbsorption { freq in
        0.1
    }
```

세션의 목적은 기본 carpet보다 더 sound absorbent한 material을 만드는 것이다.

---

# 📚 Custom Bookshelf Material

Bookshelf material은 scratch에서 만든다.

Absorption은 10-band center frequency를 사용한다.

```swift
let bookshelfAbsorption = Audio.Absorption([
    0.10, 0.15, 0.28, 0.20, 0.15,
    0.10, 0.10, 0.07, 0.07, 0.05
])
```

대응 frequency:

- 31.5Hz
- 63Hz
- 125Hz
- 250Hz
- 500Hz
- 1kHz
- 2kHz
- 4kHz
- 8kHz
- 16kHz

Scattering은 일부 frequency만 알고 있어도 된다.

```swift
let bookshelfScattering = Audio.Scattering([
    500: 0.5,
    1000: 0.6,
    4000: 0.7
])
```

RealityKit이 나머지 audible spectrum으로 extrapolate한다.

```swift
let bookshelf = Audio.Material(
    absorption: bookshelfAbsorption,
    scattering: bookshelfScattering
)
```

---

# 🥽 Immersive Space 제한

Custom reverb mesh는 immersive space에서만 동작한다.

Shared space에서는 system의 room-sense reverb geometry가 사용된다.

즉 Apple Vision Pro가 실제 환경을 바탕으로 구축한 acoustic mesh를 시스템이 대신 사용한다.

---

# 🎶 추가 Audio 업데이트

세션 마지막에는 RealityKit의 다른 신규 기능도 언급된다.

## Coordinated multi-source audio

여러 entity의 audio source를 정밀하게 동기화해 playback할 수 있다.

## High-quality character rendering

다음 기능으로 character realism을 개선한다.

- Subsurface scattering
- Advanced hair shaders

## Portal customizations

Custom portal material을 사용해 다음을 조절할 수 있다.

- Opacity
- Shape

이번 세션에서는 상세 API까지 다루지 않고 추가 기능으로만 소개한다.

---

# 🧩 기능별 정리

| 영역 | 핵심 API / 기능 | 목적 |
|---|---|---|
| Static Lighting | Lightmaps | Indirect lighting, AO, beauty |
| Dynamic Shadows | `SpotLightComponent.Shadow` | Soft shadow |
| Projective Lighting | `ProjectiveTexture` | Texture pattern projection |
| Mixed Reality Lighting | `SurroundingsLight` | Real-world geometry에 virtual light 투사 |
| Navigation | `NavigationMeshResource` | Traversable geometry 정의 |
| Navigation | `NavigationComponent` | Cost / flag filter |
| Navigation | `NavigationController` | Path 계산 |
| Cloth | `ClothBodyComponent` | Cloth body |
| Cloth | `ClothColliderComponent` | Cloth collision |
| Cloth | `ClothSimulationComponent` | Solver, gravity, material |
| Performance | `LevelOfDetailComponent` | Geometry complexity 감소 |
| Performance | `thermalStateDidChange` | Runtime quality adaptation |
| Gaussian Splats | `GaussianSplatResource` | Splat data resource |
| Gaussian Splats | `GaussianSplatComponent` | Scene rendering |
| Audio | `ReverbMeshResource` | Custom acoustic geometry |
| Audio | `Audio.Material` | Absorption / scattering |
| Audio | `ReverbComponent` | Simulated reverb 적용 |

---

# 🔁 RealityKit 고급 Feature 적용 흐름

```text
Scene Authoring
      ↓
Reality Composer Pro 3
      ↓
Lighting / NavMesh / Cloth
      ↓
RealityKit Runtime
      ↓
LOD + Thermal Monitoring
      ↓
Gaussian Splats / Immersive Audio
      ↓
High-fidelity Spatial Experience
```

---

# 📋 체크리스트

## Lighting

- [ ] Static lighting은 lightmap 사용 검토
- [ ] Indirect lighting lightmap 적용
- [ ] Ambient occlusion lightmap 필요 여부 검토
- [ ] Beauty lightmap 필요 여부 검토
- [ ] Reality Composer Pro 3 light baker 활용
- [ ] Dynamic shadow에서 `lightSize` 설정
- [ ] Soft shadow에는 `.medium` 또는 `.high` quality 사용
- [ ] `.low`에서는 hard shadow가 된다는 점 반영
- [ ] Shadow quality performance 측정

## Projective Texture

- [ ] Spotlight/scene에 맞는 texture 생성
- [ ] Light color tint가 texture color를 왜곡하지 않는지 확인
- [ ] Room size에 맞춰 intensity 조정
- [ ] Animated texture performance 측정
- [ ] Sea caustics, window pattern 등 활용 가능성 검토

## Physical Space Lighting

- [ ] Spotlight 또는 point light인지 확인
- [ ] `SurroundingsLight` 추가
- [ ] Scene understanding mesh와 interaction 확인
- [ ] Real-world wall/floor에서 projection 검증
- [ ] Mixed reality에서 light intensity 튜닝

## Navigation Mesh

- [ ] Traversable geometry 정의
- [ ] Area label 설계
- [ ] Custom flag 정의
- [ ] Area별 traversal cost 정의
- [ ] Include/exclude filter 구성
- [ ] Off-mesh connection 필요 여부 확인
- [ ] Ladder/bridge/jump animation 별도 처리
- [ ] Sync/async path query 선택
- [ ] Path result `nil` 처리
- [ ] Empty path 처리

## Cloth

- [ ] 충분한 cloth mesh density 확보
- [ ] `ClothBodyComponent` 설정
- [ ] `ClothColliderComponent` 설정
- [ ] Cloth material stiffness 조정
- [ ] Friction 조정
- [ ] Solver 선택
- [ ] Gravity 설정
- [ ] Time step 설정
- [ ] Pin 영역 정의
- [ ] Pin vertex를 `.kinematic`으로 변경
- [ ] Cloth quality와 frame time 측정

## LOD

- [ ] High/medium/low mesh 준비
- [ ] Camera distance 기반인지 screen area 기반인지 결정
- [ ] 가장 낮은 LOD threshold 설계
- [ ] 마지막 distance LOD에 `.infinity` 검토
- [ ] Screen area fraction 실제 기기에서 테스트
- [ ] LOD pop-in이 눈에 띄지 않는지 확인
- [ ] Distant object geometry cost 측정

## Thermal 대응

- [ ] `.thermalStateDidChange` observer 등록
- [ ] `.nominal` / `.fair` 처리
- [ ] `.serious` / `.critical` mitigation 정의
- [ ] LOD threshold를 동적으로 조정
- [ ] Shadow quality 감소 전략 정의
- [ ] 긴 immersive session에서 thermal behavior 테스트

## Gaussian Splats

- [ ] Position buffer 준비
- [ ] Scale buffer 준비
- [ ] Rotation buffer 준비
- [ ] Opacity buffer 준비
- [ ] Spherical harmonics buffer 준비
- [ ] SH degree 결정
- [ ] `BufferResource` 생성
- [ ] `GaussianSplatResource` 생성
- [ ] `GaussianSplatComponent` Entity에 추가
- [ ] 특정 file format에 API를 종속시키지 않기
- [ ] Apple Vision Pro 실제 렌더링 품질 검증

## Immersive Audio

- [ ] Scene geometry를 acoustic model로 정의
- [ ] `ReverbMeshResource` 생성
- [ ] Built-in material preset 활용 검토
- [ ] Surface별 absorption 값 설계
- [ ] Surface별 scattering 값 설계
- [ ] 일부 frequency만 입력할 때 extrapolation 결과 확인
- [ ] `ReverbComponent` 적용
- [ ] User/source 이동 시 reverb 변화 확인
- [ ] Immersive space와 shared space behavior 구분

---

# ⚠️ 구현 시 주의할 점

## Soft Shadow는 품질 설정이 필수다

`lightSize`만 키워도 `.low` quality라면 soft shadow가 되지 않는다.

`.medium` 또는 `.high`를 사용해야 한다.

## Physical Space Lighting은 모든 Light가 지원되는 것이 아니다

세션 기준으로 spotlight와 point light만 지원된다.

## Navigation Mesh Cost는 단순 거리와 다르다

Pathfinder는 거리만 짧은 경로가 아니라 traversal cost를 고려한다.

Forest 같은 느린 영역을 완전히 막지 않고 비싼 경로로 표현할 수 있다.

## Cloth Pin은 Vertex Motion Type으로 구현한다

Visual transform만 고정하는 것이 아니라 해당 cloth vertex를 `.kinematic` 상태로 설정한다.

## High-fidelity Feature와 Performance를 함께 설계해야 한다

Soft shadow, cloth, Gaussian splats 같은 기능은 quality만 높이면 끝나지 않는다.

LOD와 thermal 대응까지 함께 설계해야 한다.

## Custom Reverb Mesh는 Immersive Space 전용이다

Shared space에서는 Vision Pro의 system room-sense reverb geometry가 사용된다.

---

# 핵심 메시지

이번 RealityKit 업데이트는 단순히 새로운 rendering feature 몇 개를 더한 것이 아니다.

Lighting, navigation, cloth, performance, volumetric rendering, spatial audio를 하나의 runtime 안에서 연결해 **scene의 시각적 사실감뿐 아니라 움직임·상호작용·열 상태·음향까지 함께 관리하는 framework**로 RealityKit을 확장한다.

Static scene에는 lightmap을 사용하고, dynamic light에는 soft shadow와 projective texture를 적용할 수 있다.

Physical space lighting을 켜면 virtual light가 실제 room geometry에도 영향을 준다.

Navigation mesh는 cost와 flag, off-mesh connection을 포함해 NPC 이동을 더 정교하게 만들고, cloth simulation은 spring-particle mesh와 kinematic pinning으로 furnishing과 character fabric을 real-time으로 처리한다.

성능은 LOD와 thermal state monitoring으로 동적으로 관리할 수 있다.

Gaussian splat은 captured real world detail을 high fidelity로 scene에 넣고, custom reverb mesh는 geometry와 material 특성을 기반으로 spatial audio reflection을 시뮬레이션한다.

결국 이번 세션의 방향은 다음과 같다.

```text
More Realistic Rendering
        +
More Physical Interaction
        +
Smarter Navigation
        +
Adaptive Performance
        +
More Realistic Spatial Audio
```

이 기능들을 Reality Composer Pro 3와 함께 사용하면 high-fidelity spatial app과 game을 더 빠르게 제작할 수 있다.

---

# 함께 보면 좋은 세션과 자료

- Design no-code games with Reality Composer Pro 3
- Extend Reality Composer Pro 3 functionality with Xcode
- Iterate your spatial scenes faster with Reality Composer Pro 3
- Supercharge your spatial workflows with Reality Composer Pro 3
- Gaussian splats on visionOS sample
