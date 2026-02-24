# Build a UIKit app with the new design

Build a UIKit app with the new design [image omitted: wwdc2025heroglass.jpg] Build a UIKit app with t…

🍸 Liquid Glass 란 ?

iOS 26 에서 도입된 새로운 소재 (Material) 반투명하고 생동감 있는 시각 효과 시스템 전반에 걸쳐 적용되어 있으며 , UIKit 을 사용하는 앱은 SDK 만 새로 컴파일해도 자동 적용됨

📱 주요 UIKit 컴포넌트 적용 방법 요약

- 탭 바 & 스플릿 뷰 (TabBar, SplitView) 탭 바가 콘텐츠 위에 떠 있는 형태로 표시 스크롤 시 자동 축소되도록 설정 가능 (tabBarMinimizeBehavior)

- Accessory View 추가 가능 : 예 ) 음악 앱의 미니플레이어 iPad 에서는 사이드바와 탭 바가 유동적으로 전환 (UITab + UITabGroup 사용 )

- 배경 확장 효과 (UIBackgroundExtensionView) 사이드바 아래 콘텐츠가 자연스럽게 확장된 것처럼 보이도록 만드는 효과 확장 대상은 이미지 뷰 등 , 뷰 계층 구조에서 별도 sibling 으로 추가해야 함 automaticallyPlacesContentView 비활성화 후 , 오토레이아웃으로 수동 위치 조정 가능

- 네비게이션 바 & 툴바 기본적으로 투명하며 , 액션 그룹마다 유리 배경 제공 버튼 그룹에 따라 자동으로 유리 배경 분리

- 예 : 이미지 버튼은 한 그룹 , 텍스트 버튼은 별도 그룹 fixedSpace로 그룹 구분 가능

- 색상 강조 시 : tintColor 설정 , 버튼 배경 강조 시 prominent 스타일 사용

- 스크롤과 엣지 효과 (Edge Effects) 바 아래 스크롤 콘텐츠에 자동으로 대비 효과 (legibility treatment) 적용 커스텀 컨테이너에도 ScrollEdgeElementContainerInteraction로 엣지 효과 추가 가능 복잡한 UI 에서는 .hard 스타일로 더 명확한 경계 제공 가능

- 제스처와 전환 콘텐츠 어디서나 뒤로 스와이프 가능 즉시 반응하는 전환 (interruptible transitions) 적용

- 예 : 스와이프 중 다른 제스처 동작 가능 커스텀 제스처가 우선순위를 갖도록 interactiveContentPopGestureRecognizer에 failure 설정

- 프레젠테이션과 시트 줌 전환이 더 자연스럽고 매끄럽게 연결됨 ( 버튼 → 팝업 / 시트로 자연스러운 전환 ) 액션 시트는 iPad 뿐 아니라 iPhone 에서도 소스 뷰 위에 나타남 시트는 높이에 따라 자동 적응하며 배경 제거 시 유리 효과 자동 적용

- 검색 (Search)

- iPhone: 툴바 내에서 자연스럽게 검색 필드 배치

- iPad: macOS 처럼 네비게이션 바 끝에 검색 배치 가능 TabBar 에 전용 검색 탭 추가 가능, 탭 클릭 시 검색 필드 자동 활성화 (automaticallyActivateSearch)

- 컨트롤 요소들 ( 버튼 , 슬라이더 , 스위치 등 ) 전반적으로 유리 효과 스타일 채택

- 버튼 : glass(), prominentGlass() 설정 가능

- 슬라이더 :

- 유리 스타일 손잡이 틱 마크, 중립값 (anchor) 설정 가능

  - Thumb 없는 스타일로 진행 바처럼 표시 가능

- 커스텀 뷰에서 Liquid Glass 적용 UIVisualEffectView에 UIGlassEffect를 적용하여 사용 materialize() 애니메이션으로 자연스럽게 등장 캡슐형 기본 모양, cornerConfiguration으로 모서리 자동 적응 크기 / 배경 / 다크모드에 따라 투명도와 색상 자동 조절 내부에 라벨 / 이미지 등 콘텐츠 추가 시 자동 대비 색상 적용됨



## ✅ 개발 팁 요약


- 배경색이나 UIBarAppearance 커스터마이징 제거: Liquid Glass 와 충돌함 시스템 기본 구성 요소 사용 시 자동 적용됨 커스텀 UI 는 시스템 가이드를 따라 적절하게 적용 필요
