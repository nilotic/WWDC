# Build a SwiftUI app with the new design

Build a SwiftUI app with the new design 📱 새로운 디자인 핵심

- Liquid Glass: 유리 같은 시각 효과 , 상호작용 시 생동감 있는 UI 제공 버튼 , 슬라이더 , 세그먼트 등 주요 컨트롤이 상호작용 시 Liquid Glass 로 변형 🧱 구조적 UI 구성 NavigationSplitView, TabView, Sheet 등 기본 컴포넌트의 디자인 업데이트

- 사이드바: 반투명 Liquid Glass 효과로 콘텐츠 위에 떠 있음

- backgroundExtensionEffect: 콘텐츠가 SafeArea 밖까지 자연스럽게 확장 🧭 탭과 시트

- TabView: 콘텐츠 위에 떠 있고 , 스크롤 시 자동 축소 (tabBarMinimizeBehavior)

- tabViewBottomAccessory: 탭 하단에 미니 플레이어 같은 UI 추가 가능

- Sheet: Liquid Glass 배경 기본 적용, 버튼과 자연스럽게 연결됨 (navigation zoom 전환 ) 🛠 툴바 개선 항목 자동 그룹화 , ToolbarSpacer로 그룹 간 거리 조정 badge로 간단한 알림 표시 아이콘은 ** 단색 (monochrome)** 으로 일관 배경은 흐림 효과만 사용 → 불필요한 어두운 배경 제거 권장 🔍 검색 UI 개선

- iPhone: 검색창이 하단에 위치

- iPad/Mac: 툴바 우측 상단

- 멀티탭 앱 : 검색 전용 탭 구성 가능 (searchToolbarBehavior, search role) 🎛 컨트롤 스타일 통일

- 버튼: 캡슐형 , extraLarge, glass, glassProminent 스타일 추가

- 슬라이더: 눈금 표시 , 중립값 (neutralValue) 시작점 가능

- 컨테이너 동심성: containerConcentric 설정으로 모서리 일관성 확보



## ✨ 커스텀 Liquid Glass UI


glassEffect + interactive로 유리 효과 커스터마이징

- 다수 요소 조합 시 : GlassEffectContainer 사용

- 전환 애니메이션 : glassEffectID와 Namespace로 구현



## ✅ Next steps


Xcode 26 로 빌드 시 자동 반영됨 시트 / 툴바에 기존 배경색 제거 검토 새 디자인 시스템에 맞는 컴포넌트와 구조로 업데이트 추천
