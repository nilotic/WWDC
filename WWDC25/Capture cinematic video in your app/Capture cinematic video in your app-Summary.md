# Capture cinematic video in your app

Capture cinematic video in your app https://developer.apple.com/videos/play/wwdc2025/319/ 🚀 Cinematic Video API 개요 (iOS 26)

AVCaptureDeviceInput.isCinematicVideoCaptureEnabled 설정만으로 세션 전체가 Cinematic 영상으로 구성됨 .

- 출력 :

- Movie file output: 비파괴 편집 가능한 원본 + 심도 데이터 포함 .

- Preview Layer / Video Output: 실시간 또는 처리된 보케 효과 포함 .

- 기존의 캡처 세션 구성 방식 유지하며 쉽게 Cinematic 적용 가능 .

- 🧱 구성 방법 요약

- 장치 구성

- 카메라 찾기 : AVCaptureDevice.DiscoverySession 사용 .

- builtInDualWideCamera, builtInTrueDepthCamera 지원 .

- 포맷 필터링 : isCinematicVideoCaptureSupported 사용 .

- 오디오 입력도 추가 (Spatial Audio 지원 가능 ).

- 출력 설정 AVCaptureMovieFileOutput 사용 .

- 영상 안정화: cinematicExtendedEnhanced 모드 설정 .

- Preview layer 구성 : SwiftUI 와 연동하기 위해 UIViewRepresentable로 래핑 .

- 보케 조절 simulatedAperture로 보케 강도 조절 (f-number).

- 슬라이더 UI 로 사용자 제어 제공 .

- 👁 포커스 제어 및 메타데이터

- 메타데이터 사용 AVCaptureMetadataOutput 사용해 얼굴 , 사물 감지 .

- 필수 metadataObjectTypes: requiredMetadataObjectTypesForCinematicVideoCapture에 명 시됨 .

  - Delegate 에서 받아 SwiftUI 와 연동 (ObservableObject 활용 ).

- 수동 포커스 제어

- 세 가지 방식 제공 :

- Detected Object ID 로 포커스: setCinematicVideoTrackingFocus weak, strong, none 모드 있음 .

- 지점 (Point) 기반 포커스: 관심 객체 자동 탐색 .

- 지점 기반 고정 포커스: 깊이 정보로 특정 평면에 고정 .

- SwiftUI 에서 탭 & 롱프레스 제스처로 제어 .

- UI 구현 각 포커스 상태 ( 강 , 약 , 없음 ) 에 따라 사각형 스타일 구분 표시 .

- 탭 동작 :

  - 약한 포커스 → 강한 포커스로 전환 .

  - 다른 대상 → 약한 포커스 설정 .

  - 감지 없음 → 살리언트 객체 자동 포커스 .

  - 롱프레스 → 고정 강한 포커스 .



## ✨ 고급 기능


AVCapturePhotoOutput 추가 시 스틸 이미지도 Cinematic 효과 적용됨 .

- 조도 부족 시 알림 기능 :

  - cinematicVideoCaptureSceneMonitoringStatuses (KVO 활용 ).

  - notEnoughLight 상태 감지 가능 .



## ✅ 결론


Apple 의 Cinematic Video API 는 앱에서 전문가 수준의 영화 영상 캡처를 간편하게 구현할 수 있 게 해줌 .

자동화된 포커스 , 실시간 보케 효과 , 다양한 수동 제어 방식 제공 .

SwiftUI 와의 연동도 자연스럽고 유연함.
