# Enhancing your camera experience with capture controls

Enhancing your camera experience with capture controls https://developer.apple.com/videos/play/wwdc2025/253/

WWDC25 세션 253 — 캡처 컨트롤로 ‘ 하드웨어 느 낌 ʼ 카메라 UX 만들기



## ✨ 개요


iOS 26 의 Capture Controls(AVCaptureEventInteraction / onCameraCaptureEvent) 로 볼륨 버 튼 · 액션 버튼 ·iPhone 16 의 Camera Control을 앱 카메라 동작에 직접 매핑하고 , AirPods(H2) 줄기

클릭으로 원격 촬영까지 지원하는 방법을 소개합니다 . 목표는 기본 카메라 앱처럼 물리적 조작감을 주는 일 관된 UX 입니다 .

🔘 지원 입력 & 이벤트 모델

- 물리 버튼: 볼륨 상 / 하 , 액션 버튼 , iPhone 16 Camera Control. primary/secondary 액션으로 분리 처리 가능 ( 볼륨 하 / 액션 /Camera Control=primary, 볼륨 상 =secondary). 앱이 카메라를 활 성 사용 중일 때만 이벤트 수신 .

- 이벤트 수명주기: began( 준비 ) → ended( 캡처 실행 ) (+ cancelled). 핸들링하지 않으면 해당 버튼이 먹통처럼 느껴질 수 있으므로 반드시 처리 .



## 🧩 SwiftUI / UIKit 통합


- SwiftUI: onCameraCaptureEvent { event in if event.phase == .ended { takePhoto() } } 만으로 물리 버튼 촬영 구현 .

- UIKit: AVCaptureEventInteraction 채택 . 둘 다 동일 동작을 제공 .

- 🎧 AirPods 원격 촬영 & 피드백

- iOS 26: H2 탑재 AirPods 줄기 클릭으로 primary 촬영 트리거 ( 설정 앱의 Remote Camera Capture 에서 제스처 선택 ).

- 사운드 제어: AirPods 로 트리거된 경우에만 shouldPlaySound==true. 기본음 존재 , 필요 시 defaultSoundDisabled로 끄고 playSound()로 커스텀 음 재생 . 화면을 보지 않아도 확인 피드백 제공 .

- 🎛 Camera Control(iPhone 16) 로 설정 조절

- 역할: 앱 실행 ( 잠금화면 확장 필요 ), 셔터 , 설정 조절 ( 라이트 프레스 · 슬라이드 · 더블 라이트 프레스 ).

- 클래스: AVCaptureControl( 추상 ) + 시스템 제공 줌/ 노출 보정 컨트롤 , 그리고 앱 정의 연속 / 이산 슬 라이더·피커. 세션에 컨트롤을 추가해 동작 연결 .

- UI 동기화: 시스템 컨트롤은 디바이스 속성에 바로 적용되므로 KVO나 action handler로 앱 UI/ 모 델을 즉시 갱신 ( 핀치 줌 모델과 값 불일치 방지 ).

- 🛠 커스텀 컨트롤 설계 팁 캡처 경험과 직접 관련된 효과 / 필터 등으로 한정 ( 전력 · 프라이버시 상 이유로 캡처 세션 없는 화면에서 남용 금지 ).

- 지원되지 않는 상태에선 비활성화 (disabled) 로 노출해 예측 가능성 유지 ( 숨기지 않기 ).

- 세션당 컨트롤 수 한도가 있으므로 maxControlsCount/canAddControl 확인 .



## ✅ 체크리스트


- 카메라 활성 시 onCameraCaptureEvent/AVCaptureEventInteraction 설치 , ended에서 촬영 실

- 행

- primary/secondary 핸들러 분리 설계 ( 셔터 vs 보조 동작 )

- AirPods: 기본음 필요 시 유지 , 아니면 defaultSoundDisabled + playSound()로 커스텀 피드백

- Camera Control: 시스템 줌 / 노출 보정 컨트롤 추가 → UI 는 KVO/handler 로 동기화

- 커스텀 슬라이더 / 피커는 캡처 파이프라인과 직접 연결 , 미지원 시 disabled 처리

- 세션 한도 (maxControlsCount) 및 중복 추가 금지 체크

- 원하시면 HomeCafe 카메라에 맞춰 AirPods 사운드 플로우, 핀치 ·Camera Control 동기화 코드, 줌/

- 필터 피커 컨트롤 구성을 바로 뽑아드릴게요 .
