# Explore spatial accessory input on visionOS

Explore spatial accessory input on visionOS https://developer.apple.com/videos/play/wwdc2025/289/



## ✨ 개요


visionOS 에서 공간 액세서리 (spatial accessories) 를 GameController·RealityKit·ARKit 로 연결 / 추 적해 정밀 입력 · 햅틱을 활용하는 법을 소개합니다 . 데모 앱은 조각 ( 스컬프팅 ) 도구를 만들어 예측 / 정밀 추적

모드, 손잡이 ( 좌 / 우 ) 기반 UI 배치, 햅틱 피드백을 구현합니다 .

🎮 지원 액세서리 & 연결 PS VR2 Sense 컨트롤러, Logitech Muse( 가변 압력 · 강한 햅틱 ) 지원 .

GameController로 연결 · 해제 감지 (GCController/GCStylus), 제품 카테고리로 Spatial Controller/Spatial Stylus 여부 확인 .

Xcode Capabilities 에서 Spatial Gamepad 활성화 및 Accessory Tracking Usage 설명 추 가 .

🧭 추적 & 앵커링 (RealityKit/ARKit) RealityKit 의 AnchorEntity(accessory:location:mode:) 로 aim/grip 등 액세서리 정의 위치

에 앵커 .

Predicted( 저지연 · 오버슈트 가능 ) vs Continuous( 고정확 · 고지연 ) 모드 선택 .

SpatialTrackingSession에 .accessory 구성 추가 → 액세서리 앵커의 실시간 변환 수집 .

🖐 반응형 UI( 손잡이 기반 )

- RealityKit 앵커에서 ARKit AccessoryAnchor 획득 ( 신규 : ARKitAnchorComponent 경유 ) → held chirality( 좌 / 우 손 )로 툴바의 좌 / 우 오프셋을 결정 .

- relative motion/rotation, tracking state로 UI 표시 조건을 동적으로 제어 .

- 🔊 햅틱 피드백 액세서리에서 haptics 엔진 생성 · 시작 → 조각 시 재질 감각을 촉각 피드백으로 전달 ( 가공 / 가필 전환 등과 연동 ).

- 🧱 ARKit 직접 경로 ( 대체 ) Accessory Tracking Provider로 Accessory 객체를 추적 , 연결 변화 시 세션 재구성 필요.

- 정확 스트림 vs 온디맨드 예측 업데이트 선택 ( 사용 사례에 따라 성능 / 지연 트레이드오프 ).



## 🧰 디자인 가이드


SwiftUI 뷰에 게임 컨트롤러 이벤트 + 제스처 모두 전달 (receivesEventsInView).

풀스페이스 앱은 persistentSystemOverlays( 홈 인디케이터 숨김 ), upperLimbVisibility( 팔 / 액 세서리 숨김 ) 로 몰입 강화 .

- 적응형 입력: 손 + 액세서리 동시 지원 ( 올해 손 추적 속도 향상 ). App Store 배지로 “Spatial 지원 / 필 수 ” 노출 .

- 🛡 프라이버시 / 권한 포커스 + 승인된 앱만 액세서리 움직임 추적 가능 .

- 공간 액세서리는 활성 연결 중에만 관성 센서 데이터 전송 .



## ✅ 실무 체크리스트


- Capabilities: Spatial Gamepad 켜고 Tracking Usage 문구 작성

- 연결 처리 : GCStylus/GCControllerconnect/disconnect 구독 + Spatial 카테고리 확인

- 앵커링 : AnchorEntity(accessory:.aim, mode:.predicted|.continuous) 선택

- 세션 : SpatialTrackingSession에 .accessory 추가 → 변환 구독

- UI: ARKitAnchorComponent → AccessoryAnchor 로 handedness 읽어 툴바 좌 / 우 배치

- 햅틱 : 액세서리 haptics engine 시작 , 동작별 패턴 매핑

- ARKit 경로 : Accessory Tracking Provider 구성 , 연결 변화 시 세션 리런

- 몰입 : persistentSystemOverlays / upperLimbVisibility 적용 , 배지 표시 준비
