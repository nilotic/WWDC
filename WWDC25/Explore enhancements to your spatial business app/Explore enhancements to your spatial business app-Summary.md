# Explore enhancements to your spatial business app

Explore enhancements to your spatial business app https://developer.apple.com/videos/play/wwdc2025/223/



## ✨ 개요


visionOS 엔터프라이즈 영역에 접근성 확대 (UVC/Neural Engine 일반화 ), 라이선스 관리 간소화, 윈도 우 · 협업 · 보안 UX 강화(Window Follow Mode, 공유 좌표 공간 , 캡처 보호 ), 환경 시각화 확장( 개별 메인

카메라 ·Camera Regions) 등이 추가되었습니다 .



## 🧰 접근성 확대 & 개발 편의


UVC 외부 영상(Developer Strap) 과 Neural Engine 사용이 모든 개발자에게 개방( 엔터프라이 즈 라이선스 / 엔타이틀먼트 불필요 ).

객체 추적 (Object tracking) 모델을 CLI 에서 직접 학습해 파이프라인에 자동화로 통합 가능 .

🪪 라이선스 관리 & 점검 Vision Entitlement Services 프레임워크로 앱 내에서 라이선스 유효 / 만료 · 승인 상태와 특정 기

- 능 ( 예 : 메인 카메라 접근 , Increased Performance Headroom) 사용 가능 여부를 확인 . 개발자 계 정에서 라이선스 파일 접근 및 자동 갱신 (OTA) 지원 .

- 🪟 Window Follow Mode 작업 중 이동해도 선택한 윈도우가 사용자 위치를 따라오는 모드. window-body-follow 엔타이틀 먼트 ( 라이선스형 ) 필요 . 긴 작업 중 계기판 · 지시서 모니터링에 적합 .

- 👥 공유 좌표 공간 ( 협업 ) SharePlay 기반 고수준 API로 근거리 사용자 간 공유 좌표 공간 손쉽게 구성 .

- 고급 / 사내용 요구에 맞춰 ARKit 의 SharedCoordinateSpaceProvider 추가 : 장치 간 CoordinateSpaceData를 네트워크로 교환 (push/nextCoordinateSpaceData) 해 공통 월드 좌 표 정렬 . 세션 이벤트는 **eventUpdates** 로 수신 .

- 🔒 콘텐츠 캡처 보호 SwiftUI contentCaptureProtected 수정자를 ( 보호 엔타이틀먼트 필요 ) 2D/RealityKit 뷰에 적용 하면 스크린샷 · 녹화 · 미러링 · 공유에 자동 블러 / 마스킹 처리 . 단 , 기기 착용자에겐 정상 표시. Optic ID/SSO 와 연계 가능 .

- 📷 카메라 접근 확장 CameraFrameProvider가 좌 / 우 메인 카메라 개별 또는 스테레오 접근을 제공 .

- Immersive/Shared Space 모두 사용 가능 . 분석 · 스테레오 처리 시 유용 .

- 🔍 Camera Regions( 세부 영역 모니터링 )

- VisionKit CameraRegionView: 윈도우를 실세계 특정 영역 위에 배치하면 그 영역의 안정화 · 대비 / 채도 향상 영상을 전용 피드로 제공 ( 클로저로 프레임 가공 가능 ).

- ARKit CameraRegionProvider/CameraRegionAnchor: 앵커 변환 · 물리 크기 ( 미터 ) 로 가상 창을 정의하고 해당 영역의 안정화 / 향상 픽셀 버퍼 업데이트를 수신 . 대형 영역은 메모리 / 연산 부담 ↑ → 화 면의 약 1/6 이하 권장 . 향상 모드 선택에 따라 프레임레이트 차이 발생 ( 안정화가 더 고 FPS).

- 🧭 안전 · 프라이버시 가이드 작업 안전성( 착용 중 동작 환경 ), 데이터 최소 수집 · 투명성, 엔터프라이즈 적격성 충족 및 필요한 엔타 이틀먼트만 요청을 권장 .



## ✅ 체크리스트


- UVC·Neural Engine 활용 범위 재점검 ( 일반화된 접근 경로 반영 )

- Object tracking CLI 학습을 CI 파이프라인에 통합

- Vision Entitlement Services로 라이선스 / 엔타이틀먼트 런타임 검증

- Window Follow Mode: 작업 보조용 윈도우에 적용 ( 엔타이틀먼트 포함 )

- 팀 현장 협업은 SharePlay 우선 , 사내망 · 커스텀 요구는 SharedCoordinateSpaceProvider

- 민감 화면에 contentCaptureProtected 적용 ( 보호 정책 · 인증 연동 )

- 분석 · 검사 앱은 개별 메인 카메라 / 스테레오 입력 도입

- 정밀 관찰엔 CameraRegionView/Provider 채택 + 영역 크기 ·FPS· 리소스 예산 가이드 준수
