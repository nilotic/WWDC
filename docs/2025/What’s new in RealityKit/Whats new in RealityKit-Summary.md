# WWDC25 세션 287 — What’s new in RealityKit 요약

---

<br>

## ✨ 개요

* 이번 세션은 **RealityKit의 2025년 업데이트**를 한 번에 정리하는 세션입니다.
* 핵심 방향은 두 가지입니다.
  * **현실 공간과 더 자연스럽게 연결되는 3D 경험**
  * **더 적은 코드로 더 풍부한 상호작용과 미디어 표현**
* 특히 올해는 **tvOS까지 RealityKit 지원이 확장**되었고, visionOS에서는 공간 추적·조작·장면 이해·환경 블렌딩·몰입형 미디어 관련 기능이 크게 강화되었습니다.
* 세션에서는 새 API들을 조합해, 테이블 위에 고정된 퍼즐 게임을 만드는 예제로 전체 흐름을 보여줍니다.

<br>

## 🧭 Anchoring 업데이트

* RealityKit는 이제 **ARKit anchoring data를 직접 노출**해서, AnchorEntity가 실제로 어떤 표면에 붙었는지 더 정교하게 다룰 수 있습니다.
* 이를 위해 먼저 **`SpatialTrackingSession`** 을 만들고, plane tracking 같은 설정을 실행합니다.
* 이후 `AnchorEntity(.plane(...))` 로 원하는 표면 조건을 정의하면, RealityKit가 가장 적절한 실제 표면을 찾았을 때 **`AnchorStateEvents`** 를 전달합니다.
* 특히 `DidAnchor` 이벤트를 통해:
  * anchor의 transform
  * extents
  * 실제 ARKit anchor 정보
    를 받아 게임 오브젝트를 정확한 위치에 배치할 수 있습니다.
* 즉, 예전보다 단순히 “붙었다” 수준이 아니라, **어디에 어떻게 붙었는지의 실제 공간 데이터**를 함께 활용하는 쪽으로 발전했습니다.

<br>

## ✋ ManipulationComponent

* 새 **`ManipulationComponent`** 는 RealityKit 엔티티를 손으로 집고 회전시키는 상호작용을 훨씬 쉽게 만들어줍니다.
* `configureEntity` 한 번으로 필요한 구성요소를 대부분 자동 추가할 수 있습니다.
  * `InputTarget`
  * `Collision`
  * `HoverEffect`
  * `Manipulation`
* 기본 동작에서는 손을 놓으면 원래 위치로 부드럽게 돌아가지만, `releaseBehavior = .stay` 로 바꾸면 놓은 자리에 그대로 둘 수 있습니다.
* 여기에 **`ManipulationEvents`** 를 결합하면 상호작용 중 상태 전환도 쉽게 처리할 수 있습니다.
  * `WillBegin` 때는 physics를 `kinematic` 으로 바꿔 사용자가 드래그하는 동안 물리 엔진이 개입하지 않게 하고,
  * `WillEnd` 때는 다시 `dynamic` 으로 바꿔 손에서 놓은 뒤 중력과 충돌이 다시 적용되도록 할 수 있습니다.
* 결과적으로 RealityKit만으로도 **자연스러운 집기, 회전, 손 전환, 낙하** 같은 상호작용을 더 적은 코드로 구현할 수 있습니다.

<br>

## 🧱 Scene Understanding

* **Scene Understanding mesh** 를 physics/collision에 참여시킬 수 있게 되어, 앱의 가상 오브젝트가 실제 공간과 더 자연스럽게 상호작용합니다.
* `SpatialTrackingSession.Configuration` 에서 **`sceneUnderstanding: [.collision, .physics]`** 를 활성화하면,
  * 방 구조를 기반으로 생성된 mesh가
  * 게임 물체의 충돌 대상이 되고
  * 바닥, 테이블 같은 실제 환경에 맞춰 떨어지거나 부딪히는 동작을 만들 수 있습니다.
* 즉, 가상 오브젝트가 공중에 뜬 채 따로 노는 것이 아니라, **실제 공간의 형태를 이해한 상태로 물리 시뮬레이션에 들어오는 것**이 핵심입니다.

<br>

## 🌫️ EnvironmentBlendingComponent

* 새 **`EnvironmentBlendingComponent`** 는 가상 오브젝트를 실제 정적인 환경 뒤로 자연스럽게 가려지게 만들어 줍니다.
* `preferredBlendingMode` 를 `.occluded(by: .surroundings)` 로 설정하면,
  * 실제 테이블, 벽, 가구 같은 **정적인 실세계 물체**가
  * 엔티티를 부분적 또는 완전히 가릴 수 있습니다.
* 이 기능은 현실과 가상 오브젝트가 한 공간에 섞여 보이는 느낌을 크게 개선합니다.
* 다만 세션에서 설명하듯, 이 컴포넌트를 쓰는 엔티티는 배경 환경 일부처럼 취급되므로 **다른 가상 오브젝트보다 항상 뒤에 그려진다**는 점은 설계 시 고려해야 합니다.

<br>

## 🪨 MeshInstancesComponent

* 새 **`MeshInstancesComponent`** 는 동일한 메쉬를 여러 번 효율적으로 그릴 수 있게 해줍니다.
* 단순 복제 방식으로 엔티티를 많이 만들면 ModelComponent 복사본이 늘어나 메모리와 처리 비용이 커질 수 있는데, 이 컴포넌트는 **하나의 메쉬 데이터로 여러 인스턴스**를 렌더링합니다.
* 개발자는 각 인스턴스에 대해 **transform 목록만 제공**하면 됩니다.
* 예제에서는 20개의 장식용 오브젝트를 배치하면서:
  * 위치
  * 회전
  * 스케일
    값을 랜덤하게 주어 장면을 자연스럽게 꾸밉니다.
* 장점은 다음과 같습니다.
  * GPU로 보내는 데이터 감소
  * 중복 모델/머티리얼 전송 최소화
  * 같은 리소스를 대량으로 배치할 때 성능 개선
* 다만 하나의 MeshInstancesComponent로 그려진 결과는 여전히 **하나의 엔티티**로 취급되므로, 넓은 영역을 덮는 경우에는 culling 효율을 위해 여러 엔티티로 나누는 전략이 유리할 수 있습니다.

<br>

## 🖼️ Immersive media: ImagePresentationComponent

* 올해 RealityKit에는 새 **`ImagePresentationComponent`** 가 추가되어, 이미지도 RealityKit 장면 안에서 일관된 방식으로 다룰 수 있게 되었습니다.
* 지원 대상은 세 가지입니다.
  * 일반 2D 이미지/사진
  * **Spatial Photo**
  * **Spatial Scene**
* Spatial Scene은 기존 2D 이미지를 기반으로 생성한 **깊이감 있는 3D 이미지 표현**입니다. 사진을 디오라마처럼 입체화한 느낌으로 이해하면 됩니다.
* 사용 흐름은 다음과 같습니다.
  * 2D 이미지는 URL로 바로 `ImagePresentationComponent` 를 비동기 생성
  * Spatial Photo는 `availableViewingModes` 를 확인하고 `desiredViewingMode` 를 `spatialStereo` 또는 `spatialStereoImmersive` 로 설정
  * Spatial Scene은 먼저 `Spatial3DImage` 를 만들고 `generate()` 를 호출해 생성한 뒤, `spatial3D` 또는 `spatial3DImmersive` 모드로 보여줌
* 이 덕분에 RealityKit 안에서 **평면 이미지, 스테레오 사진, 생성형 3D 사진 표현**까지 하나의 모델로 다룰 수 있게 되었습니다.

<br>

## 🎬 Immersive video 업데이트

* **`VideoPlayerComponent`** 가 다양한 몰입형 비디오 포맷을 지원하도록 확장되었습니다.
* 이제 다음 유형을 RealityKit 안에서 재생할 수 있습니다.
  * spatial video
  * Apple Immersive Video
  * Apple Projected Media Profile 기반 180° / 360° / wide field-of-view 비디오
* portal 모드와 immersive 모드를 포함해 여러 viewing mode를 지원하며,
* Apple Projected Media Profile 비디오의 경우 **comfort settings** 도 반영할 수 있어 재생 경험을 더 유연하게 조정할 수 있습니다.
* 즉, RealityKit가 단순 3D 엔진을 넘어 **몰입형 이미지/비디오 프레젠테이션 계층**까지 포괄하는 방향으로 확장되고 있습니다.

<br>

## 🎮 Accessories · SwiftUI · Entity 업데이트

* 이번 세션 후반부에는 여러 실무형 개선도 함께 소개됩니다.
* **Tracked Spatial Accessories**
  * 공유 공간과 전체 공간에서 사용할 수 있는 spatial accessory 추적 지원
  * **6DoF 추적과 haptics** 를 지원해 입력 장치 활용 폭이 넓어졌습니다.
* **SwiftUI 통합 강화**
  * `ViewAttachmentComponent` : SwiftUI view를 엔티티에 직접 부착
  * `PresentationComponent` : 엔티티 기준 popover 같은 modal presentation 제공
  * `GestureComponent` : SwiftUI gesture를 엔티티에 쉽게 연결
* **Entity 관련 개선**
  * 다른 엔티티의 pin에 엔티티를 붙이는 attach API 추가
  * skeleton joint에 메시를 붙일 때 정렬과 계층 변환 비용을 줄이는 데 유용
  * 메모리의 `Data` 로부터 Entity를 직접 로드하는 initializer 추가
  * 네트워크나 온라인 소스에서 RealityKit scene/USD를 불러오는 흐름이 쉬워짐
* **AVIF texture 지원**
  * JPEG와 유사한 화질에 더 작은 크기
  * 10-bit color 지원
* **HoverEffectComponent GroupID**
  * hover effect 활성화를 계층 구조 대신 **명시적 그룹 기준**으로 묶을 수 있음
* **RealityView post processing**
  * `customPostProcessing` 으로 bloom 같은 후처리 효과 추가 가능
  * Metal Performance Shaders, CIFilter, 커스텀 셰이더 활용 가능
  * iOS, iPadOS, macOS, tvOS 지원

<br>

## ✅ 정리

* 이번 RealityKit 업데이트는 “새 기능 몇 개 추가” 수준보다, **공간 경험을 만드는 전체 개발 흐름을 더 현실 친화적이고 생산적으로 만든 업데이트**에 가깝습니다.
* 핵심 변화는 다음과 같습니다.
  * **ARKit anchor 데이터 직접 활용**으로 더 정확한 공간 배치
  * **ManipulationComponent** 로 더 쉬운 상호작용 구성
  * **Scene Understanding / Environment Blending** 으로 현실과 더 자연스러운 결합
  * **MeshInstancesComponent** 로 더 효율적인 대량 렌더링
  * **ImagePresentationComponent / VideoPlayerComponent** 로 이미지·비디오의 몰입형 표현 강화
  * **SwiftUI, accessory, entity, hover, post-processing** 까지 폭넓은 실무 개선
* 특히 visionOS 중심 기능이 많지만, tvOS 지원 확대와 post-processing, instancing 같은 기능 덕분에 RealityKit는 이제 **여러 Apple 플랫폼에서 3D 앱을 공통 구조로 전개하기 더 좋은 프레임워크**가 되었습니다.
