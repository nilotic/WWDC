# Customize your app for Assistive Access

Customize your app for Assistive Access https://developer.apple.com/videos/play/wwdc2025/238/ 🧠 Assistive Access 란 ?

- 대상: 인지 장애가 있는 사용자를 위한 iOS/iPadOS 인터페이스

- 목적: 앱과 컨트롤을 본질만 남긴 형태로 간소화해 사용자가 쉽게 디바이스를 탐색하고 독립적으로 사용할 수 있도록 함

- 도입 시점: iOS/iPadOS 17 부터 시작 📱 iOS 26 에서 Assistive Access 지원 방식

- 기존 앱을 그대로 전체화면 표시

- UISupportsFullScreenInAssistiveAccess = true 설정 앱 레이아웃은 변경하지 않으며 , 전체 화면으로만 표시됨 AAC 앱처럼 이미 인지장애 사용자를 고려한 앱에 적합

- 새로운 Assistive Access Scene 사용 ( 권장 )

- UISupportsAssistiveAccess = true 설정 SwiftUI 에서 새로운 AssistiveAccess scene 정의 카메라 , 메시지 등 기본 앱 스타일의 UI 자동 적용 ( 큰 버튼 , 간단한 인터페이스 , 아이콘 중심 디 자인 ) UIKit 에서도 SwiftUI scene 브리징 가능 🛠 개발 시 주요 구현 포인트 Scene 구성 Assistive Access 전용 scene 을 생성해 핵심 기능만 포함 UI 요소는 자동으로 커지고 명확한 레이아웃 적용됨 (row/grid)

- Preview SwiftUI 의 preview macro 에서 Assistive Access trait 사용 가능



## 🧩 디자인 원칙 및 모범 사례


- 핵심 기능만 제공 가장 중요한 1~2 개 기능만 포함 ( 예 : 그림 그리기 , 갤러리 보기 ) 나머지 기능은 Assistive Access 외에서만 제공

- 단순하고 명확한 흐름

  - 예 : 캔버스에 들어가기 전에 색 선택 화면을 따로 구성 ( 색상만 선택 , 옵션 최소화 )

- 지연 없는 탐색과 명시적 제어 타이머 기반 인터랙션 지양 제스처 대신 눈에 보이는 버튼 사용

- 시각적 보조 제공 텍스트만 사용하지 말고 아이콘 + 라벨 형태로 의미 전달 내비게이션 바에도 아이콘 추가 (assistive access navigation icon modifiers 사용 )

- 안전성

- 되돌리기 어려운 행동 ( 예 : 삭제 , undo 등 ) 은 제거하거나 확인을 두 번 요구



## ✅ 정리


Assistive Access 는 인지장애 사용자를 위한 전용 UI 환경 SwiftUI 에서 쉽게 구현 가능하며 UIKit 도 지원 핵심은 기능 단순화, 시각적 보조, 명확한 흐름, 사용자 안전 보장

앱을 전환할 때는 커뮤니티 사용자 피드백이 중요
