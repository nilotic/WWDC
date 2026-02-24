# Create icons with Icon Composer

Create icons with Icon Composer https://developer.apple.com/videos/play/wwdc2025/361/ 🎨 아이콘 제작의 변화

- 과거: 해상도 · 플랫폼별로 다양한 사이즈 제작 필요 → 픽셀 그리드 맞춤 중요

- 현재: 해상도 향상 · 자동 스케일링으로 단일 이미지 제공 가능 2025: iOS·macOS·watchOS 에서 다크 · 틴트 모드 확장 , Liquid Glass 스타일 도입 🛠 Icon Composer 소개 하나의 파일로 iPhone, iPad, Mac, Watch 아이콘 제작 실시간 프리뷰 & 6 가지 모드 지원 Default, Dark, Clear Light, Clear Dark, Tinted Light, Tinted Dark 사이즈 변환 자동 처리 마케팅용 이미지도 손쉽게 추출

- 🖌 디자인 준비 벡터 기반 툴 추천 (Figma, Sketch, Photoshop, Illustrator) iOS·iPadOS·macOS: 1024px 캔버스

- watchOS: 1088px 캔버스 Z-depth 기반 레이어 구성 색상 · 요소별 분리 → 다크 모드 등 변형에 유리 📤 레이어 내보내기 SVG( 벡터 ) 또는 PNG( 투명 · 래스터 이미지 ) 글꼴은 아웃라인 처리 후 저장 둥근 사각형 / 원 마스크 포함하지 않음 ( 툴에서 자동 적용 ) ⚙ Icon Composer 작업 흐름

- 레이어 Import → 그룹 · 플랫폼 · 모드 설정

- 그룹별 Liquid Glass 속성 조정 투명도 , 스펙큘러 , 블렌드 모드 , 그림자 등

- 다크 · 모노 모드별 색상 대비 최적화

- 원형 / 사각형 플랫폼 간 시각적 보정 🔍 미리보기 & 테스트 다양한 배경 · 월페이퍼로 가독성 확인 아이콘 그리드 · 조명 효과 확인 확대 / 축소로 디테일 점검



## 📦 출시 & 전달


.icon 파일 저장 → Xcode 에 추가 플랫폼 · 모드별 자동 적용 📢 마무리 Icon Composer 베타 공개 , 피드백 환영 정적 이미지에서 다이나믹 · 적응형 아트워크로의 진화
