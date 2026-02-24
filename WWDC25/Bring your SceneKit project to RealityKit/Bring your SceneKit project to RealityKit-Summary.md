# Bring your SceneKit project to RealityKit

Bring your SceneKit project to RealityKit https://developer.apple.com/videos/play/wwdc2025/288/ 🧭 1. SceneKit 의 역사와 deprecation 발표

SceneKit 은 13 년 전 (OS X Mountain Lion) 부터 제공된 3D 프레임워크 .

최근 생태계 변화 (iOS, visionOS, SwiftUI, 멀티 플랫폼 등 ) 로 인해 SceneKit 은 공식 deprecated 됨 .



## ✅ 기존 앱 : 계속 작동 (soft deprecation).


❌ 새로운 앱 / 대규모 업데이트 : SceneKit 비추천 .

🛠 유지보수 모드 (bug fix 만 진행 , 기능 추가 없음 ).

앞으로의 3D 앱 개발은 RealityKit 이 표준.



## 🧰 2. RealityKit 소개


- 현대적인 고수준 3D 엔진.

- visionOS 의 핵심이며 , SwiftUI 와 통합 .

- 멀티 플랫폼 지원: visionOS, iOS, iPadOS, macOS, tvOS( 신규 ).

- Swift Charts, Quick Look, App Store 태그 등 시스템 기능에서도 RealityKit 사용 .

- 🧠 SceneKit ↔ RealityKit 핵심 차이점 항목 SceneKit RealityKit 아키텍처 Node 기반 ( 노드 + 속성 조합 ) Entity-Component-System (ECS) 구조

- 좌표계 동일 (x: 오른쪽 , y: 위 , z: 카메라 방향 )동일 에셋 포맷 SCN ( 비표준 , 혼합 포맷 ) USD (Pixar 개발 , 업계 표준 ) 뷰 시스템 SCNView / SceneView / ARSCNView RealityView (SwiftUI 기반 , 멀티플랫폼 대 응 ) 🧱 3. SceneKit vs RealityKit 핵심 구조 비교 ① 아키텍처

- SceneKit: Node 기반 ( 노드에 geometry, animation, light 등 속성 할당 ).

- RealityKit: Entity-Component-System(ECS) 기반 (Entity 에 Component 를 붙여 기능 부 여 ).

- ② 좌표계

- 동일 : +x 오른쪽 , +y 위쪽 , +z 카메라 방향 .

- ③ 에셋 포맷

- SceneKit: SCN ( 비표준 , 혼합 포맷 ).

- RealityKit: USD (Pixar 개발 산업 표준 , Apple 전 플랫폼 표준 ).

- ④ View 시스템

- SceneKit: SCNView, ARSCNView 등 .

- RealityKit: RealityView (SwiftUI 기반 , 플랫폼별 자동 최적화 ).

- 🧳 4. 에셋 변환 (SCN → USD)

  - 기존 SCN 모델 파일을 USD 로 변환 :

  - Xcode → File → Export.

  - 또는 xcrun scntool --convert 커맨드라인 도구 사용 .

  - 애니메이션도 .scn 파일에서 .usdz로 append 가능 .

- 추천 : 원본 3D 툴 (Blender 등 ) 에서 직접 USD 로 export.

- 🎨 5. Reality Composer Pro 를 통한 씬 구성 USD 에셋을 시각적으로 배치하고 구성할 수 있는 툴 .

- 머티리얼 , 라이트 , 파티클 , 셰이더 등을 시각적으로 설정 .

- Swift Package 형태로 프로젝트에 추가 → RealityView 에서 로드하여 사용 .

- 🕺 6. 애니메이션 적용 USD 파일 내 애니메이션은 AnimationLibraryComponent를 통해 접근 가능 .

- 코드에서 entity 를 찾고 , 애니메이션을 이름으로 참조하여 재생 .

- SceneKit 보다 훨씬 간단하고 직관적인 구조 .

- 🔊 7. 오디오 구성 AudioLibraryComponent로 오디오를 RealityKit 에서 구성 .

- AmbientAudioComponent를 함께 써서 비공간 음향 설정 가능 .

- 스트리밍 / 루프 등 설정은 Reality Composer Pro 에서 미리 가능.
