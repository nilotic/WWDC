# Get to know the new design system

Get to know the new design system 🌟 전체 개요 Liquid Glass 는 Apple 디자인 언어의 가장 큰 업데이트이며 , UI 와 콘텐츠의 관계를 재정의함 .

Apple 전 플랫폼 (iPhone, iPad, Mac) 을 아우르는 통합된 디자인 언어를 제공하며 , SwiftUI 와 Catalyst 등을 통해 구현 가능 .

핵심 철학은 일관성 (cohesion), 적응성 (adaptiveness), 표현력 (expressiveness).

🎨 1. 비주얼 디자인 (Visual Design) ‣ System Colors

- 기존 색상보다 더 정교하게 조정됨 (Light, Dark, Increased Contrast 모드 지원 ) 명도 , 채도 , 대비가 개선되어 Liquid Glass 와 더 잘 어울림

- ‣ 타이포그래피 왼쪽 정렬, 더 굵은 서체 사용 → 알림 , 온보딩 등 주요 순간에 가독성 향상

  - ‣ 모양과 레이아웃의 규칙 (Shapes & Geometry)

- 세 가지 형태 기반 시스템:

- fixedShape – 고정된 라운드

- capsule – 높이의 절반을 반지름으로 사용

- concentricShape – 부모의 패딩을 반영한 반지름 UI 구성 요소 간에 **concentricity ( 동심 구조 )** 를 통해 시각적 균형을 유지 🧭 2. 구조와 내비게이션 (Structure & Navigation) ‣ Liquid Glass 의 역할 UI 와 콘텐츠 사이에 반투명한 계층을 형성해 , 흐름을 방해하지 않으면서 명확한 구조 제공

- 예 : Action Sheet가 이제 트리거된 위치에서 등장하여 공간적 연속성을 표현 ‣ 상황에 맞는 명확성 강조

- Sheet 가 뜰 때는 dimming layer 로 집중 유도 Parallel task 에는 자연스럽게 분리감을 주며 흐름 유지

- ‣ Bar 정리 불필요한 배경 제거 → 계층은 배치와 그룹핑으로 표현

- Done 버튼은 색상 강조 (iOS 는 파란 체크 , macOS 는 텍스트 강조 ) ‣ 탭바 개선

- Search 탭이 고정 탭으로 추가됨 (iOS) Media control 등 액세서리 뷰 지원

- 콘텍스트별 액션은 탭 바에 두지 않기 🌀 3. 효과와 연속성 (Effects & Continuity)

- ‣ Scroll Edge Effects Scroll 중 나타나는 가장자리 효과 (blur 처리 )

- Soft: iOS, iPadOS 기본값

- Hard: macOS 의 텍스트나 고정된 헤더용 ‣ Sidebar 확장 이제 스크롤뷰가 사이드바 뒤로 자연스럽게 흐름 background extension effect로 콘텐츠 확장 🔄 4. 디바이스 간 연속성 (Cross-Device Continuity) ‣ 디바이스 맥락

- iPhone: 좁고 집중된 인터페이스

- iPad: 중간 계층 ( 확장성과 집중성의 균형 )

- Mac: 넓고 복잡한 레이아웃 ‣ 공통 컴포넌트 구조화 하나의 레이아웃 원칙 → 여러 플랫폼에서 재사용

- 예 : 메뉴 구조 , 팝업 , 탭바 등이 플랫폼별로 다르게 보이더라도 기능과 구성 요소는 동일 ‣ 기호 (SF Symbols) 활용

- 심볼 중심의 인터페이스 확산 ( 툴바 , 메뉴 등 ) Human Interface Guidelines 에서 권장 아이콘 목록 제공
