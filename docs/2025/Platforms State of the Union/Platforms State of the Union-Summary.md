# Platforms State of the Union

Platforms State of the Union 🍎 1. 새로운 UI 디자인 : Liquid Glass 애플 역사상 가장 큰 UI 개편.

- Liquid Glass: 깊이감 있고 생동감 있는 유리질 UI. 반투명 효과 , 조명 반사 , 상호작용 시의 유동감 제공 .

- 디자인 원칙: 계층 구조 확립 , 조화로운 구성 , 플랫폼 간 일관성 유지 .

- UIKit, SwiftUI, AppKit 모두에서 자동 적용되며 , 커스터마이징은 선택적 .

- 새로운 API 제공 :

  - glassEffect, glassButtonStyle 등으로 커스텀 UI 적용 가능 .

  - 자동 컬러 반영 , 스크롤 시 UI 축소 등 동적 변화 포함 .

- 🎨 2. 앱 아이콘 & Icon Composer 앱 아이콘도 Liquid Glass 스타일에 맞게 변화.

  - Icon Composer라는 새로운 툴을 통해 레이어링 및 다양한 렌더링 모드 지원 .

  - 클래식 / 틴트 / 클리어 모드 등 다양한 아이콘 스타일 제공 .

  - 모든 플랫폼 (iOS, macOS, etc.) 에서 일관된 아이콘 경험 제공 .

  - 🧠 3. Apple Intelligence ( 온디바이스 AI 프레임워크 )

- Foundation Models Framework:

  - LLM 기반 API. 완전한 온디바이스 실행 .

  - 텍스트 요약 , 구조화된 데이터 생성 , 툴 호출 등 가능 .

  - Swift 와의 완벽 통합 (@Generable, streamResponse, tool calling 등 ).

- Writing Tools, GenMoji, Image Playground 등 시스템 수준 기능을 개발자 앱에 자동 적용하 거나 API 로 통합 가능 .

- 🧑‍💻 4. Xcode 26 + ChatGPT 통합 ChatGPT 가 Xcode 에 기본 내장 (OpenAI 와 공식 협업 ).

  - 새로운 " 코딩 어시스턴트 ", 자연어로 기능 생성 , UI 설계 , 테스트 생성 , 버그 수정 등 가능 .

  - Playground 매크로, 히스토리 타임라인, 코드 문서 자동 생성 (DocC) 지원 .

  - Anthropic (Claude), 로컬 모델 등 모델 선택 자유화.

- 🦅 5. Swift & SwiftUI 주요 업데이트 Swift 6.2

  - Inline arrays, span 타입 → 성능 대폭 향상 .

  - C, C++, Java, JavaScript 와 상호운용 강화.

  - WebAssembly 지원 → Swift 를 웹에서 실행.

- 컨테이너화 도구 (Containerization): Swift 로 만든 서버 코드를 컨테이너로 배포 가능 .

- SwiftUI Rich Text Editor, 3D Charts with RealityKit, 웹뷰 (WebView) API 내장.

- 리스트 성능 향상: 10 만 개 아이템도 수월하게 렌더링 .

- Idle Prefetching으로 스크롤 부드러움 향상 .

- macOS 에서 6 배 빠른 리스트 초기 로딩, 16 배 빠른 삽입 속도.

- 🥽 6. visionOS 26 3D 레이아웃 확장, 볼륨 인터페이스, 앵커링 시스템 개선 .

- 공간 공유 (SharePlay, window sharing) 및 실시간 협업 가능 .

- 180°, 360° 미디어 포맷 (APMP) 지원 .

- 이미지 → 3D 공간화 (AI 활용 ) 기능 추가 .

- 🎮 7. Metal 4 & 게임 개발

- Metal 4: 머신러닝 기반 렌더링 (Neural Rendering), MetalFX 프레임 보간.

- Game Porting Toolkit 2 → Windows 게임을 Mac 에 손쉽게 이식 가능 .

- PlayStation VR2 Sense 컨트롤러 지원, 3 배 빠른 Vision Pro 핸드 트래킹.

- GameSave Framework, Game Center 챌린지 API 등 게임 기능 강화 .

- 💻 8. Intel Mac 종료 예정 macOS Tahoe가 마지막 Intel 지원 macOS.

- Apple Silicon 전용 최적화 강조 → 향후 앱은 이에 맞춰 준비 필요 .

- ⚙ 9. 기타 주목할 기능들 iPad 메뉴바용 Command/Menu API.

- iOS 백그라운드 작업 API 개선 ( 예 : 영상 렌더링 ).

- CarPlay 의 Live Activities 지원.

- 터미널 재설계, Powerline 폰트, 웹 HTML 3D 모델 지원.

- Look to Scroll ( 시선 기반 스크롤 ) – visionOS.

- Visual Intelligence 와 App Intents 통합.

- 앱 접근성 기능 App Store 에 강조 가능.
