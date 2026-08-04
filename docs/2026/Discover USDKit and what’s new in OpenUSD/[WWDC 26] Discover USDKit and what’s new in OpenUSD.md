# WWDC26 Discover USDKit and what’s new in OpenUSD 요약

- Session: 285
- Title: Discover USDKit and what’s new in OpenUSD
- Source: https://developer.apple.com/videos/play/wwdc2026/285/
- Topic: USDKit, OpenUSD, MaterialX, OpenVDB, Gaussian Splats, Spatial Preview, Safari Model Tag
- Chapters: Introduction, OpenUSD: Industry Foundation and New Standards, Gaussian Splats and Particle Fields, Introducing USDKit, 3D Editing in Preview and New Renderers, Spatial Preview, USD on the Web, USDKit Swift API, Accessibility Metadata, Asset Compression, Integration Paths, Next steps

---

## 한 줄 요약

Apple은 OpenUSD·MaterialX·OpenVDB를 최신화하고 Gaussian Splats용 `Particle Fields`를 표준화하는 한편, Swift에서 USD scene을 열고 조합·수정·접근성 메타데이터 추가·압축 export할 수 있는 새 시스템 프레임워크 `USDKit`을 도입해 Mac Preview, Spatial Preview, Safari의 Model 태그까지 하나의 USD 기반 workflow로 연결한다.

---

## 핵심 요약

이번 세션은 Apple 플랫폼의 USD 지원이 다음 영역에서 확장된 내용을 설명한다.

- **OpenUSD 생태계와 표준화**
  - OpenUSD, MaterialX, OpenVDB 최신 버전 지원
  - Apple의 Academy Software Foundation 및 Alliance for OpenUSD 참여
  - 최초의 USD core formal specification 공개
  - Geometry, materials, physics domain specification 진행

- **Gaussian Splats와 Particle Fields**
  - 수백만 개의 fuzzy particle로 장면을 표현
  - Position, color, opacity를 이용해 실제 환경의 미묘한 빛을 재현
  - NVIDIA, Adobe, Pixar와 함께 새 USD primitive type인 `Particle Fields` 도입
  - Gaussian Splats를 mesh·material과 같은 USD scene 안에서 표현

- **USDKit**
  - Swift 앱을 위한 first-party system framework
  - RealityKit과 Spatial Preview에 깊게 통합
  - USD Stage 열기, hierarchy 순회, prim 정의, reference 추가, transform 수정
  - 접근성 metadata 작성
  - Mesh와 texture 압축을 적용한 USDZ export

- **Mac Preview의 3D 기능**
  - Object 조작
  - Property와 lighting 편집
  - Scene hierarchy 작업
  - Asset 변환과 압축
  - RealityKit, Storm, 새 Raytracer renderer 선택
  - 세 renderer 모두 OpenPBR 지원

- **Spatial Preview**
  - Mac과 Vision Pro Quick Look 사이의 live link
  - Scene 변경 실시간 반영
  - SharePlay를 통한 공동 공간 리뷰

- **USD on the Web**
  - Safari의 새 Model 태그
  - macOS와 iOS 웹페이지에서 interactive 3D
  - visionOS에서는 모델이 페이지 밖으로 나와 사용자의 공간에 표시

- **압축과 통합 경로**
  - 새 mesh compression으로 mesh 크기를 최대 90% 축소
  - AVIF texture compression과 결합해 평균 asset 7배 축소
  - USDKit, Preview, `usdcrush`에서 사용 가능
  - Apple 앱은 USDKit, 고급 Swift workflow는 SwiftUSD, cross-platform C++은 OpenUSD framework 사용

---

# 🌐 USD는 Apple 공간 경험의 기반

Apple은 USD를 공간형 경험의 backbone으로 설명한다.

Apple 플랫폼의 앱과 콘텐츠에서 사용하는 spatial scene이 USD 위에 구축된다.

USD는 Pixar가 만든 기술이며, Apple은 초기부터 가능성을 인식하고 Pixar와 협력해 왔다.

USD의 활용 범위는 특정 3D 제작 영역에 한정되지 않는다.

세션에서 제시한 사례는 다음과 같다.

- Award-winning films
- AAA games
- Factory floors
- Surgical suites
- Autonomous vehicles
- AI-driven simulations

USD는 여러 산업에서 공통 3D 언어로 자리 잡고 있다.

---

# 🧱 OpenUSD, MaterialX, OpenVDB

USD의 open-source project는 `OpenUSD`다.

OpenUSD는 3D scene을 설명하는 industry-standard library이며, 다음 기술과 함께 동작한다.

## MaterialX

Lucasfilm에서 시작한 material description 기술이다.

Rich material representation을 제공한다.

## OpenVDB

DreamWorks에서 시작한 volumetric data 기술이다.

이번 해 Apple 플랫폼의 USD stack에는 OpenVDB도 포함된다.

세 기술은 각각 세계적인 VFX와 animation studio에서 시작했고, 함께 composable 3D foundation을 구성한다.

Apple은 이번 릴리스에서 Apple 플랫폼의 OpenUSD, MaterialX, OpenVDB를 모두 업데이트했다.

---

# 🤝 Open-source 생태계에서 Apple의 역할

Apple은 Academy Software Foundation의 member다.

Foundation에는 MaterialX와 OpenVDB 같은 open-source project가 속해 있다.

Apple은 코드를 사용하는 데 그치지 않고 project에 직접 기여해 Apple 플랫폼과 전체 3D ecosystem에 도움이 되는 방향으로 발전시키고 있다.

Apple은 Alliance for OpenUSD의 founding member이기도 하다.

목표는 USD를 사실상의 standard를 넘어 formal industry standard로 만드는 것이다.

---

# 📜 최초의 USD Core Formal Specification

이번 해 Apple은 USD core의 첫 formal specification 공개에 기여했다.

이어 다음 영역의 domain specification도 진행 중이다.

- Geometry
- Materials
- Physics

표준은 공개된 working group에서 만들어진다.

세션은 3D content를 만드는 방식과 교환 format의 미래에 영향을 주고 싶은 개발자와 creator가 working group에 참여하도록 권장한다.

---

# ✨ Gaussian Splats

Gaussian Splats는 최근의 중요한 3D representation 기술이다.

Traditional geometry 대신 수백만 개의 fuzzy하고 겹치는 particle을 이용한다.

각 particle에는 다음 정보가 들어 있다.

- Position
- Color
- Opacity

이 데이터를 조합해 실제 환경을 재구성한다.

Gaussian Splats의 장점은 real-world scene의 미묘한 lighting response를 포착하고 사실적으로 표현할 수 있다는 점이다.

---

# 🌌 새 USD Primitive: Particle Fields

Apple은 Alliance for OpenUSD의 NVIDIA, Adobe, Pixar와 협력해 새로운 USD primitive type을 도입한다.

이름은 `Particle Fields`다.

Particle Fields는 다음 표현을 설명할 수 있다.

- Gaussian Splats
- 이와 관련된 빠르게 발전하는 다른 particle-based representation

중요한 변화는 Gaussian Splats를 별도 format으로 고립시키지 않고 USD scene 안에 포함할 수 있다는 점이다.

```text
USD Scene
├── Meshes
├── Materials
├── Cameras
├── Traditional 3D Data
└── Particle Fields
    └── Gaussian Splats
```

Gaussian Splats와 전통적인 3D data를 같은 scene에서 조합할 수 있다.

---

# 🧰 새 시스템 프레임워크 USDKit

세션의 중심은 `USDKit`이다.

USDKit은 Swift 앱에 first-class USD support를 제공하는 새 system framework다.

주요 특성:

- System provided
- Swift-native
- RealityKit 통합
- Spatial Preview 통합
- 기존 USD 사용자가 이해하기 쉬운 개념 유지
- USD를 처음 접하는 Swift 개발자에게 익숙한 pattern 제공

USD 처리의 복잡한 부분을 framework가 담당해 개발자는 콘텐츠와 앱 logic에 집중할 수 있다.

---

# 🖼️ Mac Preview의 3D 편집

Preview는 Mac에서 image, PDF, 3D content를 보는 기본 앱이다.

기존에는 image와 PDF에 강력한 편집 도구를 제공했다.

이번 릴리스에서는 같은 철학을 3D에 적용한다.

Preview의 3D 편집 기능:

- Scene에서 object 직접 조작
- Property 편집
- Lighting 편집
- 전체 scene hierarchy 작업
- Asset 변환
- Asset 압축

별도의 전문 3D 앱을 배우지 않아도 자주 사용하는 기본 작업을 처리할 수 있다.

---

# 🖥️ 세 가지 Renderer

Mac의 Preview와 Quick Look에서 renderer를 선택할 수 있다.

| Renderer | 역할 |
|---|---|
| RealityKit | Mac, iPhone, iPad, Vision Pro 사이의 일관성 |
| Storm | 기존 production pipeline을 위한 renderer |
| Raytracer | 가장 복잡한 scene의 고품질 결과 |

새 Raytracer는 다음을 제공한다.

- Accurate reflections
- Precise shadows
- Physically correct lighting

Architecture visualization과 product imagery처럼 높은 fidelity가 필요한 장면에 적합하다.

Apple은 이를 모든 Mac에 제공되는 production-quality ground-truth renderer로 설명한다.

---

# 🎨 OpenPBR

RealityKit, Storm, Raytracer 세 renderer 모두 `OpenPBR`을 지원한다.

OpenPBR은 기존 `USDPreviewSurface`보다 발전한 material model이다.

더 풍부하고 물리적으로 정확한 material 표현을 제공한다.

---

# 🥽 Spatial Preview

macOS 27의 새 Spatial Preview framework는 Mac과 Vision Pro의 Quick Look를 직접 연결한다.

Mac Preview에서 USD scene을 수정하면 Vision Pro의 Quick Look에서 변경 내용이 live로 보인다.

사용자는 자신의 실제 공간에서 3D scene을 검토할 수 있다.

---

# 👥 SharePlay 기반 공동 리뷰

Spatial Preview는 SharePlay를 통해 여러 사람의 spatial review를 지원한다.

Creative director와 artist가 같은 scene을 함께 걸어 다니며 다음을 실시간으로 검토할 수 있다.

- Lighting
- Composition
- Spatial scale

이 workflow는 Preview에만 한정되지 않는다.

Spatial Preview framework를 이용해 자체 Mac 앱에도 같은 live collaboration experience를 추가할 수 있다.

---

# 🌐 Safari의 Model 태그

USD는 이제 웹의 native content가 된다.

Safari의 새 `Model` 태그는 USD model을 image나 video처럼 웹페이지에 embed하게 한다.

## macOS와 iOS

웹페이지 안에서 fully interactive 3D experience를 제공한다.

## visionOS

같은 model이 웹페이지 경계를 벗어나 사용자의 실제 공간에 spatially 표시된다.

---

# 🧠 USD 핵심 개념

USDKit API를 이해하기 위해 세션은 USD의 주요 개념을 정리한다.

## Layer

하나의 data file이다.

## Composition

여러 layer를 결합하는 기능이다.

## Stage

하나 이상의 layer가 composition된 결과다.

전체 scene에 접근하는 window 역할을 한다.

## Prim

Scene의 모든 요소는 USD Prim으로 표현된다.

## Schema

Prim의 type을 정의한다.

## Attributes

Prim의 실제 data를 저장한다.

## Metadata

Prim 자체를 설명하는 추가 정보를 저장한다.

---

# 📂 USD Stage 만들기와 열기

새 빈 stage를 memory에 만들 수 있다.

```swift
import USDKit

let stage = USDStage()
```

디스크의 기존 scene을 열 수도 있다.

```swift
let url = URL(
    fileURLWithPath: "/ALab/entry.usda"
)

let stage = try USDStage.open(url)
```

File access가 포함되므로 `USDStage.open`은 throw할 수 있다.

---

# 🌳 Stage Hierarchy 순회

세션 예제에서는 scene에 oscilloscope가 있는지 찾는다.

```swift
for prim in stage.descendants {
    if prim.name == "scope" {
        // Oscilloscope 발견
    }
}
```

`stage.descendants`를 이용해 stage hierarchy의 prim을 순회할 수 있다.

찾으려는 asset이 없다면 새 prim을 정의한다.

---

# ➕ 새 Transform Prim 정의

Oscilloscope가 없기 때문에 원하는 path에 새 Xform prim을 만든다.

```swift
let scope = stage.definePrim(
    at: "/World/scope",
    type: "Xform"
)
```

Xform prim은 referenced asset의 transform container 역할을 한다.

---

# 🔗 Composition과 File Reference

Asset의 모든 데이터를 현재 stage에 복사하지 않고 다른 USD file을 reference한다.

```swift
try scope.references.add(
    "/ALab/assets/scope.usda"
)
```

Reference의 장점:

- Main stage가 가벼움
- Asset author의 file을 그대로 사용
- 여러 사람이 각자 scene의 일부 작업 가능
- Referenced file이 업데이트되면 main stage에도 반영

이것이 USD composition의 핵심이다.

---

# 📍 Transform Operation으로 Prim 이동

Referenced oscilloscope가 원하는 위치에 있지 않기 때문에 translation을 적용한다.

먼저 transform operation을 추가한다.

```swift
scope.addTransformOperation(
    type: .translate
)
```

이 API는 다음을 자동 처리한다.

- `xformOp:translate` attribute 생성
- `xformOpOrder` 업데이트

그 다음 translation value를 설정한다.

```swift
scope[
    "xformOp:translate",
    as: USDValue.Vec3d.self
] = [2.5, 0.0, -1.0]
```

Asset이 workbench 위의 원하는 위치로 이동한다.

---

# ♿ 3D Accessibility Metadata

좋은 3D experience는 모든 사용자가 접근할 수 있어야 한다.

Apple은 3D object의 assistive label과 description을 USD 안에서 정의하도록 accessibility metadata 표준화를 주도했다.

특징:

- USD native metadata
- Industry-wide standardization
- 향후 확장 가능
- 모든 USD API에서 authoring 가능
- Blender와 Maya에서 직접 지원

---

# 🏷️ AccessibilityAPI 적용

Prim에 accessibility data를 추가하려면 먼저 `AccessibilityAPI` schema를 적용한다.

```swift
try scope.applyAPISchema(
    "AccessibilityAPI",
    instanceName: "default"
)
```

Multi-apply API schema에 `default` instance name을 사용한다.

---

# 📝 Label과 Description Attribute

USDKit이 모든 schema-specific convenience API를 제공하는 것은 아니다.

따라서 specification에 정의된 정확한 attribute name을 사용해 직접 생성한다.

```swift
scope.makeAttribute(
    named: "accessibility:default:label",
    as: .string
)

scope.makeAttribute(
    named: "accessibility:default:description",
    as: .string
)
```

그 다음 값을 설정한다.

```swift
scope[
    "accessibility:default:label",
    as: String.self
] = "Oscilloscope"

scope[
    "accessibility:default:description",
    as: String.self
] = "Vintage signal analyzer with a 3D wireframe display, topped by a color bar test monitor"
```

Label은 간결한 이름을, description은 object를 context 안에서 이해할 수 있는 풍부한 설명을 제공한다.

---

# 📦 대형 USD Asset 문제

High-quality production USD scene은 수 GB까지 커질 수 있다.

세션의 ALab scene도 큰 asset의 예다.

큰 파일의 문제:

- 느린 delivery
- 높은 storage cost
- 다운로드와 공유 지연
- 여러 플랫폼에서 불편한 user experience

이를 해결하기 위해 mesh와 texture compression을 강화했다.

---

# 🗜️ 새 Mesh Compression

Apple은 Alliance for Open Media와 협력해 최신 mesh compression codec을 추가했다.

효과:

- Mesh 크기 최대 90% 감소

기존 AVIF texture compression과 함께 사용하면 평균 asset 크기를 7배 줄일 수 있다.

세션은 시각적 품질을 손상시키지 않으면서 이 결과를 얻는다고 설명한다.

---

# 🖼️ AVIF Texture Compression

Texture에는 기존 AVIF compression을 사용한다.

Mesh compression과 texture compression을 함께 적용해 scene의 geometry와 image data를 모두 줄인다.

결과:

- Faster delivery
- Lower storage cost
- 더 나은 cross-platform experience

---

# 📤 `exportPackage`로 압축 USDZ 내보내기

USDKit은 compression을 `exportPackage` API에 통합한다.

```swift
let output = URL(
    fileURLWithPath:
        "/ALab/alab_compressed.usdz"
)

try stage.exportPackage(
    to: output,
    options: [
        .preferSmallTextureFiles(
            quality: .standard
        ),
        .preferSmallMeshFiles
    ]
)
```

Option 역할:

| Option | 역할 |
|---|---|
| `.preferSmallTextureFiles(quality:)` | Texture compression |
| `.preferSmallMeshFiles` | Mesh geometry compression |

몇 줄의 코드로 compressed USDZ package를 만들 수 있다.

---

# 🖥️ 코드 없이 압축하기

Compression은 USDKit 코드에서만 사용할 수 있는 기능이 아니다.

같은 결과를 다음 도구에서도 얻을 수 있다.

- Mac Preview
- `usdcrush` command-line tool

Apple은 Pixar와 함께 이 compression support를 OpenUSD project에도 가져오기 위해 작업하고 있다.

---

# 🧭 USD 통합 경로

USD integration의 요구 수준에 따라 세 가지 접근을 사용할 수 있다.

## USDKit

Apple 플랫폼의 앱 개발자에게 권장되는 기본 선택이다.

- System provided
- Swift-native
- RealityKit 통합
- Spatial Preview 통합

## SwiftUSD

USDKit 범위를 넘어서는 고급 요구나 open-source Swift workflow가 필요한 경우 사용할 수 있다.

- Open-source Swift bindings
- Swift Package Manager 제공

## Embedded OpenUSD Framework

Cross-platform C++ codebase에서 OpenUSD를 framework로 직접 embed할 수 있다.

세 경로는 같은 USD foundation 위에 있으므로 file interoperability를 유지한다.

---

# 🧩 기능별 정리

| 영역 | 핵심 업데이트 |
|---|---|
| OpenUSD | 최신 library와 formal specification |
| MaterialX | 최신 rich material support |
| OpenVDB | Volumetric data stack 통합 |
| Gaussian Splats | Particle Fields primitive |
| USDKit | Swift용 first-party system framework |
| Preview | 3D editing, hierarchy, property, lighting, conversion |
| Renderer | RealityKit, Storm, Raytracer |
| Material | OpenPBR |
| Spatial Preview | Mac ↔ Vision Pro live review와 SharePlay |
| Safari | Model 태그로 native web 3D |
| Accessibility | USD-native label과 description metadata |
| Compression | 최대 90% mesh reduction, AVIF texture, 평균 7× smaller |
| Tooling | USDKit, Preview, usdcrush |
| Integration | USDKit, SwiftUSD, embedded OpenUSD |

---

# 🔁 USDKit 기본 Workflow

```text
USDStage 생성 또는 열기
        ↓
Stage hierarchy 순회
        ↓
필요한 Prim 찾기
        ↓
새 Prim 정의
        ↓
외부 Asset Reference 추가
        ↓
Transform Operation 적용
        ↓
Accessibility Metadata 추가
        ↓
Mesh / Texture Compression 설정
        ↓
USDZ Package Export
```

---

# 📋 체크리스트

## OpenUSD와 Asset 구조

- [ ] Scene을 하나의 큰 file로 복사하지 않고 composition 활용 검토
- [ ] Layer와 Stage 역할 구분
- [ ] External asset은 reference로 연결할지 결정
- [ ] Referenced asset update가 main stage에 미치는 영향 확인
- [ ] Prim path naming convention 정의
- [ ] Schema, attribute, metadata 역할 구분

## USDKit 도입

- [ ] Apple 플랫폼 앱이면 USDKit을 첫 선택으로 검토
- [ ] 새 empty stage와 existing file open 흐름 구분
- [ ] File access error 처리
- [ ] `stage.descendants` hierarchy 순회 비용 검토
- [ ] `definePrim`의 path와 type 확인
- [ ] Reference 경로가 packaging 후에도 유효한지 확인
- [ ] RealityKit과 Spatial Preview 통합 테스트

## Transform

- [ ] 올바른 transform operation type 선택
- [ ] `addTransformOperation` 후 value 설정
- [ ] Coordinate system과 unit 확인
- [ ] 기존 `xformOpOrder`와 충돌하지 않는지 확인
- [ ] Referenced asset의 local transform 고려

## Accessibility

- [ ] 중요한 3D object에 accessibility metadata 제공
- [ ] `AccessibilityAPI` schema 적용
- [ ] 올바른 instance name 사용
- [ ] Specification의 정확한 attribute name 사용
- [ ] Label은 간결하게 작성
- [ ] Description은 object의 외형과 context를 충분히 설명
- [ ] Blender와 Maya authoring workflow도 검토
- [ ] Assistive technology에서 실제 결과 테스트

## Compression

- [ ] Original USD scene size 측정
- [ ] Mesh compression 적용
- [ ] AVIF texture compression 적용
- [ ] 품질별 texture option 검토
- [ ] Compressed asset의 visual quality 비교
- [ ] Delivery time과 storage 감소 측정
- [ ] USDKit `exportPackage` 사용 검토
- [ ] 비개발 workflow에는 Preview 사용 검토
- [ ] Automated pipeline에는 `usdcrush` 검토

## Preview와 Renderer

- [ ] Preview의 object editing workflow 검토
- [ ] Property와 lighting 편집 테스트
- [ ] Scene hierarchy 확인
- [ ] RealityKit renderer 결과 확인
- [ ] 기존 production pipeline에는 Storm 비교
- [ ] Ground-truth 결과가 필요하면 Raytracer 검토
- [ ] OpenPBR material 호환성 확인

## Spatial Preview

- [ ] Mac 수정이 Vision Pro Quick Look에 live 반영되는지 확인
- [ ] Spatial scale과 composition review workflow 설계
- [ ] SharePlay collaboration 테스트
- [ ] Team participant의 review 역할 정의
- [ ] 자체 Mac 앱에 Spatial Preview framework 도입 검토

## Safari Model 태그

- [ ] USD model을 web page에 embed할 use case 검토
- [ ] macOS와 iOS의 interactive 3D 확인
- [ ] visionOS에서 spatial breakout 동작 확인
- [ ] Model의 web delivery size 최적화
- [ ] 접근성 metadata가 web context에서도 유용한지 검토

## Integration Path

- [ ] Apple 앱이면 USDKit 선택
- [ ] USDKit 범위를 넘는 Swift API가 필요하면 SwiftUSD 검토
- [ ] Cross-platform C++이면 embedded OpenUSD 검토
- [ ] 동일 USD file의 tool 간 interoperability 테스트
- [ ] 프로젝트에서 여러 path를 혼합할 필요가 있는지 확인

---

# ⚠️ 구현 시 주의할 점

## USDKit과 OpenUSD 전체 API는 동일하지 않다

USDKit은 Apple 플랫폼 앱에 적합한 first-party Swift framework지만, 모든 schema-specific API를 convenience API로 제공하는 것은 아니다.

필요하면 specification의 attribute 이름을 사용해 직접 접근해야 한다.

## Reference는 Copy가 아니다

Asset reference를 사용하면 main stage에 모든 data가 복사되지 않는다.

Referenced file 경로와 배포 구조를 올바르게 관리해야 한다.

## Accessibility는 별도 후처리가 아니다

3D object의 label과 description은 USD metadata 자체에 포함시킬 수 있다.

Asset authoring 단계부터 접근성을 고려해야 한다.

## Compression은 Geometry와 Texture를 함께 본다

Mesh만 줄이거나 texture만 줄이는 것보다 두 데이터를 함께 압축해야 전체 asset size를 효과적으로 줄일 수 있다.

## Renderer 선택은 목적에 따라 달라진다

RealityKit은 플랫폼 일관성, Storm은 기존 production workflow, Raytracer는 ground-truth fidelity에 강점이 있다.

---

# 핵심 메시지

USD는 Apple의 spatial experience 전체를 연결하는 공통 scene language다.

이번 업데이트는 open-source 표준, authoring tool, application framework, web, spatial collaboration을 하나의 foundation 위에 모은다.

OpenUSD·MaterialX·OpenVDB의 최신 지원과 formal specification은 industry interoperability를 강화한다.

Particle Fields는 Gaussian Splats를 기존 mesh와 material이 있는 USD scene 안으로 가져온다.

USDKit은 Swift 개발자가 Stage, Prim, Composition, Transform, Accessibility, Compression을 first-class API로 다룰 수 있게 한다.

Mac Preview는 3D editing과 RealityKit·Storm·Raytracer를 제공하고, Spatial Preview는 그 scene을 Vision Pro에서 live로 검토하고 협업하게 한다.

Safari의 Model 태그는 같은 USD content를 웹의 interactive 3D와 visionOS 공간 경험으로 확장한다.

결국 Apple의 방향은 명확하다.

**USD file 하나가 authoring, 앱, Mac Preview, Vision Pro collaboration, 웹을 자유롭게 이동하고, USDKit이 그 workflow를 Swift 앱 안에서 연결하는 중심 framework가 된다.**

---

# 함께 보면 좋은 세션과 자료

- Discover the Spatial Preview framework
- Bring 3D content to the web with the Model element
- Build rich spatial experiences with RealityKit
- Reality Composer Pro 관련 WWDC26 세션
- Alliance for OpenUSD
- Academy Software Foundation
