# Better together_ SwiftUI and RealityKit

- Better together: SwiftUI and RealityKit



## ✅ 주요 기능 및 개선사항


- Model3D 개선 (visionOS 26) SwiftUI 에서 3D 모델을 손쉽게 표시 .

- 애니메이션 재생 가능 .

- ConfigurationCatalog로 외형을 동적으로 바꿀 수 있음 .

- Model3DAsset을 이용해 애니메이션 제어 가능 .

- RealityView 사용 시 이점 RealityView는 Model3D 보다 더 강력한 구성 제어 제공 .

- realityViewLayoutBehavior로 사이즈 조정 가능 :

- .fixedSize, .centered, .flexible 등 ParticleEmitter, Component 추가 등 고급 기능 사용 가능 .

- 애니메이션 컨트롤 AnimationPlaybackController는 이제 Observable.

- SwiftUI 에서 직접 재생 , 일시정지 , 위치 조절 가능 .

- RealityView 에서도 애니메이션 가능 , SwiftUI 애니메이션 API 로 암시적 전환 구현 .

- ✋ 상호작용 (Object Manipulation)

- 오브젝트 조작 기능 (Manipulation) 손으로 객체를 이동 , 회전 , 크기 조절 가능 .

- SwiftUI 에서는 .manipulable modifier 사용 .

- RealityKit 에서는 ManipulationComponent 사용 .

- 다양한 입력 방식 지원 ( 터치 , 응시 등 ).

- 커스텀 이벤트 핸들링 및 사운드 지정 가능 .

- 🔌 SwiftUI ↔ RealityKit 연결

- 데이터 흐름 양방향 @Observable한 Entity 속성을 통해 SwiftUI → RealityKit, RealityKit → SwiftUI 데이터 흐름 가 능 .

- 무한 루프를 방지하기 위한 주의점 설명 .

- SwiftUI 구성요소를 RealityKit 에 연결

- ViewAttachmentComponent: SwiftUI View 를 Entity 에 부착 .

- GestureComponent: SwiftUI 제스처를 Entity 에 적용 .

- PresentationComponent: RealityKit 내에서 SwiftUI 팝오버 표시 가능 .

- 🧭 위치 및 좌표 변환

- CoordinateSpace3D 프로토콜 RealityKit Entity 와 SwiftUI View 간의 위치 변환 지원 .

- 서로 다른 좌표계 간 거리 계산 가능 (e.g., Bolts 와 Sparky 간 거리 측정 ).

- 🎞 애니메이션 + 조작 통합

- SwiftUI 애니메이션으로 RealityKit 구성요소 애니메이션 Entity.animate()로 Transform, Audio, Model, Light 구성요소의 속성 암시적 애니메이션 지 원 .

- 오브젝트가 해제될 때 사용자 정의 애니메이션 동작 가능 .
