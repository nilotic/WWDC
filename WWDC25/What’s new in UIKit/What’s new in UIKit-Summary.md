# What’s new in UIKit

Whatʼs new in UIKit 🖌 1. 새 디자인 시스템 + Liquid Glass Liquid Glass 라는 반투명 (translucent), 동적인 (material-specular+ 굴절 ) 시스템 머티리얼 도입 .

탐색 바 , 검색 필드 , 팝오버 , 알림 , 분할 뷰 등 주요 UI 요소에 일관되게 적용 .

스크롤 엣지 효과와 background extension view 로 시각적 연속성 유지 .

📱 2. 적응성 향상 UISplitViewController 가 inspector 뷰 ( 세부 정보 표시 ) 표준 지원 .

separator 드래그로 컬럼 크기 조절 가능 , 포인터 모양이 방향에 따라 변경됨 .

  - 기존 레이아웃 개념 ( 안전 영역 , 마진 등 ) 은 “Make your UIKit app more flexible” 세션에서 자세히 다룸 .

- 📋 3. iPadOS 에 macOS 스타일 메뉴 바 도입 키보드 없이도 화면 상단을 스와이프해 메뉴바 호출 가능 .

  - 서브메뉴 , 체크마크 , 이미지 , inline 섹션 완벽 지원

- UIMenuBuilder 및 새로운 메뉴 시스템 설정 API 로 커스텀 메뉴 작성 가능 :

- 기본 시스템 커맨드 포함 / 제외 선언 가능 Find → Search 통합 , 프린트 커맨드 포함 등 스타일링 지원

- focus-based deferred menu element 를 통해 포커스 기반 동적 메뉴 ( 예 : Safari 히스토리 ) 지원

- 표준 메뉴 항목 : Settings 열기 , 최근 문서 , 창 타일링 및 장면 전환 등 스토리보드 메뉴는 더 이상 지원되지 않으며 , 코드 기반 초기화 필수 .

- 🧱 4. 현대적인 아키텍처 업데이트 Swift Observable 통합 UIKit 내부에서 스위프트 Observable 객체 자동 추적 layoutSubviews 나 셀 구성 콜백 안에서 참조하는 Observable 의 변화 시 자동 업데이트 iOS 18 이상에서도 Info.plist 설정만으로 지원 .

- 새로운 updateProperties 메서드 UIView/UIViewController 에 추가된 콜백 layoutSubviews 전에 실행되며 , 속성 업데이트 전용 불필요한 레이아웃 연산 없이 성능 최적화 가능 (e.g. 배지 숫자 업데이트 ) 애니메이션 개선 (flushUpdates) UIView.animate 에 flushUpdates 옵션으로 레이아웃 호출 자동 처리 Observable 기반 변경 또는 제약 조건 변경 시 자동 애니메이션 처리 layoutIfNeeded 호출 생략 가능하고 안전하고 깔끔한 애니메이션 코드 작성 가능 .

- 🔄 5. SwiftUI 씬 호스팅 UIKit 앱에서 SwiftUI 씬을 UIHostingSceneDelegate 로 지원 iPhone/iPad 에선 일반 2D, visionOS 에선 immersive spaces/ 볼륨 지원 Scene-based delegate 와 함께 동작 .

- 🌈 6. HDR 강화 UIColor 에 SDR 색상 + 노출값 조정 가능 → HDR 색상 표현 지원 UIColorPickerViewController, UIColorWell 에 HDR 색상 선택 기능 이미지뿐 아니라 동영상 , 사용자 UI 에도 HDR- to-SDR fallback 지원 (UITraitHDRHeadroomUsage).

- 🛎 7. 더 나은 Notification API 문제 중심 NotificationCenter.Message 타입 도입 키보드 등장 같은 이벤트의 animation duration, frame 정보를 타입 안전하게 제공 .

- ⚠ 8. 장면 기반 생명 주기 전환

- 기존 UIApplicationDelegate 콜백들 deprecated 오직 UIScene 기반 라이프사이클만 지원됨 — 곧 필수화 예정 .

  - iOS 26 이후로는 scene 기반 전환이 필수적 !

  - 🔗 9. 파일 URL 및 OpenURL 확장

- openURL: 이 파일 URL 도 지원 ( 외부 앱 열기 가능 ) 기본 앱이 없으면 false 반환 → Quick Look 같은 대체 구현이 가능 .

- 🛠 10. SF Symbols 7 업그레이드 Draw On/Off 애니메이션 , 변수 경로 기반 draw 지원 UIButton 에 symbolContentTransition API 추가 → 상태 전이에 시각 효과 제공 Gradient 모드 추가로 심볼에 자동 그라데이션 적용 가능 .



## ✅ 요약


- 화면 스타일 갱신 : Liquid Glass 로 최신 디자인 구현

- 적응형 UI: UISplitViewController 활용 및 flexible layout 구성

- 메뉴 경험 : iPad 앱에 코드 기반 메뉴바 도입

- 반응형 레이아웃 : Observable + updateProperties + flushUpdates 조합

- SwiftUI 이행 : 점진적 통합 via UIHostingSceneDelegate

- HDR 및 심볼 사용 : HDR 색상 + Symbols 7 효과 활용

- 장면 생명주기 전환 : UIScene 전환 필수화에 대비

- OpenURL 확장 활용 : 파일 핸들링 지원

- Notification API 갱신 : 타입 안전한 이벤트 처리
