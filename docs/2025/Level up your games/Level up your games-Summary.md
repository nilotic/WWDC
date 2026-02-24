# Level up your games

Level up your games https://developer.apple.com/videos/play/wwdc2025/209/



## ✨ 개요


Apple Silicon + Metal 4 + 새로운 게임 프레임워크들을 이용해 성능 · 플레이 경험 · 그래픽 품질을 한 번에 끌어올리는 방법을 정리한 세션입니다 .

시스템 모드 (Game Mode, Low Power/ Sustained Execution) Game Center + Apple Games 앱 연동 Background Assets / Managed Background Assets

새 GameSave 프레임워크 (iCloud 세이브 ) Touch Controls / Game Controller Metal 4 + MetalFX + Game Porting Toolkit 3 + Metal Performance HUD 를 모두 다룹

니다 .

🚀 시스템 성능 기능 (Game Mode / Sustained / Low Power) Game Mode 풀스크린에서 실행 시 자동 활성화 ( 배너 표시 ).

백그라운드 작업을 줄여 CPU 타임 ·Bluetooth 입력 / 오디오 레이턴시 개선 .

- Info.plist 에 LSSupportsGameMode = true 만 추가하면 지원 .

- Sustained Execution Mode 초반부터 지속 가능한 성능 레벨로 제한해서 , 플레이 내내 일정한 프레임레이트 / 품질 유지 .

- Xcode 에서 관련 entitlement 추가 + 프로비저닝 프로파일에 포함 .

- Low Power Mode 연동 (macOS 26) 배터리에서 게임이 많은 전력을 쓰면 시스템이 경고 및 게이밍용 저전력 모드 제안 .

- NSProcessInfoPowerStateDidChange 를 구독해 저전력 모드 시 그래픽 / 이펙트 옵션을 자동 하향해 플레이 시간을 늘릴 수 있음 .

- 🎮 소셜 · 발견성 : Game Center + Apple Games 앱 Game Center 업적 , 리더보드 , 챌린지 , 액티비티 등으로 재방문 · 경쟁 · 친구 초대 유도 .

- Xcode 26 에서 설정 (.gamekit 번들 ) + 로컬라이즈 + 챌린지 구성을 코드와 함께 버전 관리 가능 .

- Game Progress Manager 로 로컬에서 submit/test 가능 .

- Apple Games 앱 iPhone/iPad/Mac 기본 탑재 , 게임 허브 + 친구 활동 + 랭킹 확인.

- Game Center 통합된 게임은 Games 앱 · 위젯 · 알림 ·App Store 전반에서 자동 노출.

- Game Overlay 에서 리더보드 순위를 게임 나가지 않고 바로 확인 가능 .



## 📦 콘텐츠 배포 : Background Assets / Managed Background


Assets 첫 설치가 거대한 게임 ( 텍스처 · 오디오 수 GB) 일 경우 , 튜토리얼 / 초기 구간에 필요한 최소 리소스만 먼저 다운로드 나머지는 플레이 중 백그라운드로 점진적 다운로드 → 빠른 첫 플레이 .

Background Assets 프레임워크 다운로드 우선순위 / 조건을 시스템에 알려 첫 실행 경험 최적화 .

DLC, 선택 다운로드 , 메인 번들 외부의 에셋 업데이트 지원 .

Managed Background Assets( 신규 ) API 단순화 + TestFlight/App Store 워크플로에 통합 .

Apple 호스팅으로 최대 200GB 사용 가능 .

앱 업데이트 없이 에셋만 별도 갱신 가능 .

☁ GameSave: iCloud 클라우드 세이브 새로운 GameSave 프레임워크로 iCloud 기반 자동 게임 세이브 동기화 제공 .

집에서 Mac → 버스에서 iPhone → 카페에서 iPad 로 이어서 플레이 가능 .

오프라인 / 로그아웃 상태도 고려 ( 다시 로그인 시 동기화 재개 ).

- 기본 제공 UI:

- 동기화 진행 표시 , 세이브 충돌 감지 및 선택 UI,

  - iCloud 로그아웃 알림 .

- 통합 절차 :

- Xcode 에서 iCloud Documents 활성화 + 컨테이너 설정 .

- Developer 계정에서 해당 entitlement 를 프로비저닝 프로파일에 추가 .

- 코드에서 openDirectoryForContainer(id:) 호출 → 백그라운드 동기화 시작 .

- completion 에서 상태 · 에러 확인 후 , 내려받은 디렉터리 URL 로 세이브 파일 로드 / 저장 .

- 🎛 입력 : Game Controller & Touch Controls Game Controller 프레임워크 키보드 , 마우스 , 다양한 게임패드 (PS DualSense 포함 ) 를 단일 API 로 지원 .

- 콜백 방식 · 폴링 방식 모두 제공 .

- Touch Controls( 신규 프레임워크 ) 패드가 없는 대부분의 iPhone/iPad 유저를 위해 가상 버튼 / 스틱 UI를 쉽게 붙이는 API.

- 여러 버튼 타입 · 동작 제공 , 외형 커스터마이즈 가능 .

- Metal 과 직접 통합돼 입력 처리 오버헤드 최소화.

- 🎨 그래픽 : Metal 4, MetalFX, 포팅 툴킷 Metal 4 리소스 · 셰이더 컴파일 관리 복잡도를 줄이고 , CPU 인코딩 오버헤드 감소 .

- 렌더 파이프라인에 ML 활용도 쉽게 통합 가능 .

- MetalFX 공간 / 시공간 업스케일링으로 낮은 렌더 해상도 → 출력 해상도로 확장 , 성능과 품질 균형 .

- Frame Interpolation 으로 중간 프레임 생성 → 고주사율 체감 .

- Denoising Upscaler 로 레이트레이싱 시 적은 레이로 렌더 + 업스케일 과정에서 노이즈 제 거.

- 세션 예시 : Cyberpunk 2077 이 MetalFX 로 눈에 띄게 높은 / 부드러운 프레임률 달성 .

- Game Porting Toolkit 3 + metal-cpp

  - 기존 C++ 엔진에 Metal 을 붙이기 위한 래퍼로 Metal 4·MetalFX 기능 전체 지원.

- Metal Shader Converter 로 HLSL → Metal 변환 , Intersection Function Buffer( 레이 트레이싱 ),

- Function constants( 효율적인 분기 ), Framebuffer fetch( 프로그래머블 블렌딩 ) 등을 HLSL 코드에서 직접 활용 가능 .



## 🧪 프로파일링 & 디버깅 도구


Metal Runtime API & Shader Validation 바인딩 안 된 리소스 접근 , 빠진 플래그 등 런타임 이슈를 탐지 .

Metal Debugger (Xcode) GPU 작업 타임라인 · 패스별 상세 성능 · 픽셀 단위 디버깅 .

Metal System Trace (Instruments) CPU vs GPU 활용도 · 버틀넥 위치 파악 .

Metal Performance HUD ( 업데이트 ) 실시간 성능 HUD, Windows 평가 환경에서도 사용 가능 .

- 새 기능:

- Performance Insights: API 사용 패턴을 분석해 최적화 추천(예 : 런타임 셰이더 컴파 일 감지 ).

- Shader compilation count, 기타 메트릭 추가 .

- 수집 데이터로 Performance Report 생성 ( 오프라인 분석용 ).

- 표시 항목 · 위치 커스터마이즈 가능 .



## ✅ 정리 & 실무용 체크리스트


- Info.plist 에 LSSupportsGameMode 추가 + Sustained Execution Mode/ 저전력 모드 대응 로직

- 구현

- Game Center & Apple Games 앱 연동으로 업적 / 리더보드 / 챌린지 / 액티비티 설계

- Managed Background Assets 로 초기 설치 최소화 + DLC/ 콘텐츠 업데이트 구조 잡기

- 새 GameSave 프레임워크로 iCloud 세이브 구현 , 충돌 / 오프라인 UX 포함

- Game Controller + Touch Controls 로 패드 / 터치 하이브리드 입력 지원

- Metal 4 + MetalFX( 업스케일 · 인터폴 · 디노이즈 ) + Game Porting Toolkit 3 고려

- Metal Performance HUD/Debugger/System Trace 로 프레임 타임 · 셰이더 ·GPU 병목 점검
