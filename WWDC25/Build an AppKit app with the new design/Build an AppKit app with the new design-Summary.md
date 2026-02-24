# Build an AppKit app with the new design

Build an AppKit app with the new design https://developer.apple.com/videos/play/wwdc2025/310/

- Liquid Glass 소재:

  - 투명하고 빛을 반사 / 굴절시키는 새로운 소재로 , UI 에 깊이와 역동성을 부여 .

  - 툴바 , 사이드바 , 컨트롤 등에서 사용되며 , 콘텐츠의 밝기에 따라 적응적으로 외관 변화 .

- 앱 구조 변화:

- 툴바: 유리 소재 위에 배치되어 콘텐츠 위에 떠 있는 듯한 효과 . 버튼은 자동으로 그룹화되며 , NSToolbarItemGroup 이나 스페이서를 사용해 커스터마이징 가능 . isBordered 속성을 false 로 설정해 유리 배경 제거 가능 . 강조를 위해 prominent 스타일과 backgroundTintColor 로 색상 조정 가능 .

- 사이드바 / 인스펙터: NSSplitViewController 로 유리 소재 자동 적용 . 사이드바는 콘텐츠 위에 떠 있고 , automaticallyAdjustsSafeAreaInsets 를 true 로 설정해 콘텐츠가 사이드바 아래 로 확장되도록 설정 가능 .

- NSBackgroundExtensionView: 콘텐츠를 사이드바 아래로 확장하며 블러 효과로 시각적 연속성 제공 .

- Scroll Edge 효과:

  - NSScrollView 에서 콘텐츠와 유리 요소 간 시각적 분리를 위해 소프트 / 하드 엣지 스타일 제공 .

  - 툴바 , 타이틀바 액세서리 , 새로운 스플릿 아이템 액세서리와 함께 자동 적용 .

- 컨트롤 업데이트:

- macOS, iOS, iPadOS 간 일관된 디자인 . 새로운 'extra large' 크기 추가 , 기존 크기는 약간 더 커짐 .

  - prefersCompactControlSizeMetrics 로 이전 macOS 버전과 호환되는 크기 유지 가능 .

- 버튼 , 슬라이더 등에 캡슐 형태와 유리 베젤 스타일 적용 가능 . tintProminence 로 색상 강도 조절 .

- 메뉴 개선:

  - 메뉴 바와 컨텍스트 메뉴에 아이콘 추가로 가독성과 접근성 향상 .

- Liquid Glass 통합:

- NSGlassEffectView 로 주요 UI 요소에 유리 소재 적용 . NSGlassEffectContainerView 로 여러 유리 요소 그룹화해 시각적 일관성과 성능 최적화 .

  - 콘텐츠는 contentView 로 설정해 가독성 유지 , Auto Layout 으로 레이아웃 관리 .

- 권장 사항:

  - Xcode 26 으로 빌드해 새로운 디자인 즉시 적용 .

- 콘텐츠를 엣지 - 투 - 엣지로 확장하고 , 고정된 컨트롤 높이를 피하며 , 메뉴에 심볼 아이콘 추가 , 주요 요소에 Liquid Glass 적용 .
