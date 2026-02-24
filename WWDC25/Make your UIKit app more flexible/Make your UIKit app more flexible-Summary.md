# Make your UIKit app more flexible

Make your UIKit app more flexible https://developer.apple.com/videos/play/wwdc2025/282/ WWDC25 세션 282 — UIKit 앱을 더 유연하게 만

들기



## ✨ 개요


이 세션은 여러 크기 · 플랫폼에서 잘 동작하는 UIKit 앱을 만들기 위한 세 가지 축을 다룹니다 :

- 씬(UIScene) 라이프사이클

- 컨테이너 뷰 컨트롤러 (UISplitViewController, UITabBarController)

- 레이아웃 가이드 · 윈도우 컨트롤 · 리사이즈 대응 API

- 핵심 메시지 :

- “ 씬 기반 라이프사이클 + 컨테이너 VC + 레이아웃 가이드를 쓰면 , 별도 분기 없이도 크기와 플랫폼에 잘 적응하는 앱을 만들 수 있다 .”

  - 🧱 씬 (UIScene) 라이프사이클

- 씬 = 앱 UI 의 인스턴스 각 씬은 자기만의 뷰 컨트롤러 · 상태 · 라이프사이클을 가짐 .

- URL 딥링크 등 외부 데이터도 씬 단위로 전달 가능 .

- 씬마다 상태 저장 · 복원을 별도로 수행 → “ 전에 보던 그대로 ” 복귀 .

- 여러 씬 & 전용 씬 타입

  - 예 : 메시지 앱의 “ 새 메시지 작성 ” 전용 씬 , 외부 디스플레이용 씬 등 .

  - iOS 26 부터 SwiftUI 씬 + UIKit 씬을 한 앱에서 혼합해 사용 가능 .

- UIScene 라이프사이클 채택이 곧 필수 iOS 26 이후 다음 메이저 릴리즈에서 , 최신 SDK 로 빌드 시 반드시 UIScene 기반이어야 함 .

  - “ 여러 씬 지원 ” 은 권장 , 필수는 ‘ 씬 라이프사이클로 이사 가는 것 ʼ.

  - 마이그레이션은 Tech Note “Migrating to the UIKit scene-based life cycle” 참고 .

- 예제 플로우 ( 타이머 + AirPlay 외부 디스플레이 ) AppDelegate 의 configurationForConnectingSceneSession 에서

- 외부 디스플레이용 씬 역할이면 별도 SceneConfiguration 리턴 , 그 외에는 기본 씬 설정 사용 .

- SceneDelegate 의 scene(_:willConnectTo:) 에서 UIWindow(windowScene:) 생성 후 rootViewController 주입 ,

- 씬마다 다른 모델 ( 예 : timer model) 전달 .

- sceneDidEnterBackground 에서 타이머 일시정지 등 상태 관리 .

- stateRestorationActivity 제공 → 재연결 시 restoreInteractionState 에서 복원 .



## 🧩 컨테이너 뷰 컨트롤러로 유연한 구조 만들기


🪟 UISplitViewController 여러 컬럼을 나란히 보여주는 네비게이션 허브 가로 공간이 좁으면 내비게이션 스택으로 자동 collapse, 넓으면 컬럼 병렬 표시 .

- 새 기능 : 컬럼 ‘ 드래그 리사이즈 ʼ 사용자가 분할선 (separator) 을 드래그해서 컬럼 폭을 인터랙티브하게 조절.

- 포인터 모양이 방향에 맞게 바뀜 .

- 각 컬럼마다 min / max / preferred 폭을 커스터마이즈 가능 .

- 너무 넓은 min 을 요구하면 “ 동시 표시 가능 컬럼 수 ” 가 줄어 , 유연성이 오히려 떨어질 수 있음 .

- expanded / collapsed 상태에 따른 UI 분기 Mail 처럼 collapse 되었을 때는 Disclosure indicator 를 표시해 “ 더 들어갈 수 있다 ” 는 시 그널 제공 .

- 이를 위해 새 trait: split view controller layout environment 로 현재 상태 ( 확장 / 접 힘 ) 확인 .

- Inspector 컬럼 1 급 지원 선택한 콘텐츠의 메타데이터 · 속성 등을 보여주는 Inspector 컬럼을 공식 패턴으로 지원 .

- 확장 상태 : Secondary 옆 trailing 컬럼으로 표시 .

- collapse 상태 : Inspector 는 sheet 로 자동 표시.

- 구현은 inspector 용 viewController 를 지정하고 , 필요 시 show 호출로 나타나게 하면 끝 .

- 🧭 UITabBarController 플랫폼에 따라 탭바 위치 · 형태 자동 적응

- iPhone: 하단 탭바

- iPad: 상단 탭 + 네비게이션 옆

- Mac: 툴바 안 / 사이드바

- Vision Pro: 씬의 leading 측 오너먼트에 표시 탭 → 사이드바로의 적응 (Tab groups) 탭 그룹을 정의해 , 사이드바가 있을 땐 그룹 안의 목적지들을 사이드바에서, 사이드바가 없을 땐 그룹 자체를 하나의 탭으로 .

  - 예 : iPad Music 앱의 Library 그룹 (Artists, Albums 등 ).

- 탭 그룹 내 내비게이션 커스터마이즈 탭 그룹에 managing UINavigationController 를 지정 .

  - leaf 탭 선택 시 , 그 탭 + 상위 그룹 탭들이 한 번에 네비게이션 스택에 push.

  - UITabBarControllerDelegate.displayedViewControllers(for:) 로

- 상황에 따라 스택에 올릴 VC 목록을 커스터마이즈 ( 예 : Library 탭이 선택 불가면 아예 생략 ).

- 📐 안전 영역 · 레이아웃 가이드 · 윈도우 컨트롤 Safe Area 유지가 적응형 UI 의 출발점 네비게이션바 · 툴바 · 상태바 ·Dynamic Island· 사이드바 등이 safe area 밖에 위치 .

- “ 중요 컨텐츠 ” 는 safe area 안에 , 배경은 그 밖까지 확장해서 사용 .

- 레이아웃 마진 & Layout Guide 활용 각 뷰는 layoutMarginsGuide 를 제공 → safe area 에서 한 번 더 inset 된 영역 .

이 가이드를 기준으로 제약을 잡으면 ,

- 사이드바가 붙거나 , 윈도우 컨트롤이 추가되어도 일관된 여백 확보 가능 .

- iPadOS 26: macOS 같은 윈도우 컨트롤 씬 상단에 close / minimize / arrange 버튼이 붙음 .

- UIWindowSceneDelegate.preferredWindowingControlStyle 로 콘텐츠와 조화되는 스타일을 제안할 수 있음 .

UINavigationBar 등 시스템 컴포넌트는 자동으로 피해서 배치되지만 ,

- 직접 만든 바 / 툴바는 window control 을 고려한 layout guide 를 사용해야 함 .

- 📱 방향 잠금 & 리사이즈 대응 방향 잠금 (interface orientation lock)

- 일부 앱 ( 예 : 레이싱 게임 ) 은 기기 회전을 입력으로 쓰기 때문에 회전 잠금이 유리할 수 있음 .

- 표시 중인 view controller 에서 prefersInterfaceOrientationLocked 를 override → 필 요 시 true.

- 값이 바뀌면 setNeedsUpdateOfPrefersInterfaceOrientationLocked() 호출 .

- 실제 잠금 상태는 UIWindowSceneDelegate.didUpdateEffectiveGeometry에서 isInterfaceOrientationLocked 를 보고 확인 .

- 리사이즈 중 부담 줄이기 창 드래그로 크기가 바뀔 때 , 매 픽셀마다 비싼 연산을 다시 할 필요는 없음.

  - 예 : 게임에서 리사이즈 시마다 텍스처 / 타일을 재생성하는 것은 낭비 .

- isInteractivelyResizing 를 체크해서 리사이즈 중에는 최소 업데이트만,

  - 사용자가 사이즈 조정을 끝냈을 때 한 번 제대로 리렌더링 .

- 🧹 레거시 모드 정리 & 체크리스트 UIRequiresFullscreen 는 폐기 예정

  - iOS 9 시절 도입된 “ 풀스크린 강제 ” 호환 키 .

  - 앞으로는 무시될 예정이므로 Info.plist 에서 제거 권장 .

- 새 디바이스 스크린 크기 호환 모드 종료 예전에는 “ 새 디바이스 해상도 ” 가 나오면 , 앱을 재빌드 하기 전까지 스케일 / 레터박스로 보여줬

  - 음 .

- 이제 iOS 26 SDK 로 한 번 빌드해 제출하면 , 새로운 스크린 크기에서도 더 이상 스케일링 / 레터박스 없이 실제 크기에 맞춰 렌더링 .



## ✅ 마이그레이션 / 실무 체크리스트


- 앱 전체를 UIScene 라이프사이클로 이전

- ( 가능하면 ) 여러 씬 타입 도입 : 메인 씬 / 외부 디스플레이 / 편집 전용 등

- 주요 화면 구조를 UISplitViewController, UITabBarController 기반으로 재구성

- safe area + layoutMarginsGuide + window control 대응 layout guide 로 제약 다시 점검

- 비싼 렌더링 ( 게임 / 그래프 등 ) 은 isInteractivelyResizing 로 리사이즈 처리 최적화

- Info.plist 에서 UIRequiresFullscreen 제거 , 최신 SDK 로 재빌드해 새 스크린 크기 대응
