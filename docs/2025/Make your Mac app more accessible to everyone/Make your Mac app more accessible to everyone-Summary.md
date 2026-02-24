# Make your Mac app more accessible to everyone

Make your Mac app more accessible to everyone https://developer.apple.com/videos/play/wwdc2025/229/



## ✨ 개요


이 세션은 Mac 용 SwiftUI 앱에서 레이아웃 구조를 접근성에 어떻게 표현할지 , VoiceOver 탐색을 어떻게 빠르게 만들지 , 마우스 / 포인터 중심 상호작용을 어떻게 모두에게 열어 줄지

를 단계별로 보여줍니다 .

핵심 키워드는 컨테이너 구조, 정렬 · 기본 포커스, Rotor, 접근성 액션입니다 .

🧱 Mac 앱 접근성 구조 이해하기 Mac 앱은 키보드 · 마우스 + 조밀한 UI + 멀티태스킹이 기본이라 , 같은 화면 안에 많은 요소와 중첩된 컨테이너가 생기기 쉽습니다 .

SwiftUI 는 각 View 를 접근성 요소 (accessibility element) 로 노출하고 , VoiceOver 는 이를 트리 구조로 탐색합니다 .

Mac 용 VoiceOver 는 주로 키보드 단축키로 다음 / 이전 요소를 이동하기 때문에 , “ 마우스로 한번에 훑는 ” 것보다 더 많은 키 입력이 필요할 수 있습니다 .

→ 그래서 적절한 컨테이너 그룹화가 중요합니다 .

🧱 컨테이너와 accessibilityChildren 다루기 SwiftUI 의 accessibilityChildren 수정자로 컨테이너 표현 방식을 조절합니다 .

- 동작 모드 3 가지 :

- contain 이 View 를 “ 컨테이너 ” 로 보고 , 자식들을 그 안의 요소로 노출

- combine 이 View + 자식들을 하나의 요소로 합쳐서 노출

- ignore 이 View 만 요소로 보고 , 자식들은 완전히 무시

- 예시 1: 스타일 프리셋 목록 Inspector 안에 VStack 으로 스타일 프리셋 (Title/Subtitle/Heading/Body …) 이 나열된 경우 :

  - 처음엔 VoiceOver 가 프리셋을 하나씩 전부 지나가야 Bold 토글까지 도달해야 했음 .

- VStack 에 accessibilityChildren(.contain) + accessibilityLabel("Style Presets") 를 적용해서

- Inspector → “Style Presets 그룹 ” → Bold 토글 순서로 한 번에 건너뛸 수 있게 개 선 .

  - 예시 2: 프리셋 항목 하나를 하나의 요소로 합치기

- 각 스타일 프리셋은 HStack( 제목 + Apply 버튼 ) 으로 구성 :

  - 처음에는 제목과 버튼이 별도 요소라 , 프리셋 하나를 두 번씩 지나가야 함 .

- HStack 에 accessibilityChildren(.combine) 을 적용해서 “Title, Apply 버튼 ” 처럼 한 요소로 읽히게 변경 .

- 정리 :

- 큰 덩어리는 contain 으로 “ 섹션 ” 처럼 묶고 , 하나로 취급해야 하는 행 · 항목은 combine 으로 합치기 .

  - 너무 많은 중첩 컨테이너는 오히려 탐색을 복잡하게 만듭니다 .

- 🎯 읽히는 순서 다듬기 : accessibilitySortPriority 시각적으로는 작가 이름 → 책 제목 순서지만 ,

  - 스크린 리더로는 책 제목이 먼저 읽히는 편이 스캔하기 좋을 때가 있습니다 .

  - accessibilitySortPriority(_:) 로 우선순위를 조정 :

- 기본 값은 0 우선순위가 높은 요소가 먼저 읽히고 ,

  - 같은 값끼리는 화면 배치 순서대로 정렬 .

  - VoiceOver 로 탐색해 봤을 때 “ 순서가 미묘하게 어색하다 ” 싶으면 이 우선순위를 조정하면 됩니다 .

- 🧭 Rotor 로 “ 북마크만 빠르게 건너뛰기 ” 북마크된 페이지를 시각적으로는 한눈에 보지만 ,

  - VoiceOver 사용자는 모든 페이지를 하나씩 지나가며 북마크 여부를 들어야 하는 문제가 있습니다 .

- 해결 : Accessibility Rotor accessibilityRotor("Bookmarks") 로 “ 북마크 ” Rotor 를 추가하고 , 조건 (isBookmarked == true) 에 맞는 페이지들만 Rotor 대상에 포함 .

- VoiceOver 에서 Rotor 메뉴를 열면 “Bookmarks: Page 2, Page 5, Page 8 …” 식으로 북마크만 빠르게 이동 가능 .

- Rotor 는 “ 특정 조건에 맞는 요소만 건너뛰며 탐색 ” 하기 위한 필수 도구입니다 .

- 🎯 초기 포커스 추천 : accessibilityDefaultFocus VoiceOver 등 접근성 기술은 자신만의 포커스 상태를 따로 가지고 있습니다 .

- macOS / iOS 26 부터 SwiftUI 에서 accessibilityDefaultFocus 로 새 scene 이 나타날 때 “ 처음 포커스되면 좋은 요소 ” 를 제안할 수 있습니다 .

실제 포커스 여부는 사용자 설정에 따라 조정되지만 ,

- “ 이 화면에 들어오면 여기부터 읽어주면 좋겠다 ” 는 힌트를 줄 수 있습니다 .



## 🧩 Hover 전용 UI 를 모두에게 열어 주기 : accessibilityAction


- 예시 : 페이지 썸네일 위에 마우스를 올렸을 때만 보이는 북마크 버튼 시각적으로는 깔끔하지만 ,

  - VoiceOver 사용자는 포인터를 움직이지 않으므로 버튼을 영원히 못 만남.

- 해결 : 썸네일 View 에 accessibilityAction 추가

- 예 ) “Bookmark Page 3” 액션 VoiceOver 에서 해당 썸네일에 포커스 후 Action 메뉴를 열면

  - “Bookmark page 3” 항목이 나타나고 , 키보드로 북마크 수행 가능 .

  - 이 액션은 Switch Control, Voice Control 등 다른 보조기술도 함께 사용합니다 .

- ⌨ 키보드 단축키 & 커스텀 컨트롤 흔한 작업에 키보드 단축키를 붙이는 것은

  - 파워 유저 기능일 뿐 아니라 마우스를 쓰기 어려운 사용자에게 큰 도움이 됩니다 .

- 직접 만든 커스텀 컨트롤에는 기본 UIKit/AppKit 컨트롤이 가진 접근성 정보가 없을 수 있으니 ,

  - SwiftUI 접근성 심화 세션 (2021) 을 참고해 레이블 · 역할 · 액션을 꼭 정의해야 합니다 .



## ✅ Mac 용 SwiftUI 앱 접근성 체크리스트


- 컨테이너 구조 설계

- 관련 요소들을 accessibilityChildren(.contain) 으로 묶고 , 항목 하나는 combine 으로 합쳐 탐색 단계를 줄였나요 ?

- 읽기 순서

- 중요한 정보에 accessibilitySortPriority 를 줘서

- “ 목록을 훑기 좋은 순서 ” 로 맞췄나요 ?

- Rotor

- 북마크 , 에러 , 중요 섹션 등 별도로 건너뛰면 좋은 것들에 Rotor 를 추가했나요 ?

- 초기 포커스

- 새 화면에서 가장 먼저 읽히면 좋은 View 에 accessibilityDefaultFocus 를 붙였나요 ?

- Hover· 제스처 의존 상호작용

- 마우스 hover/ 트랙패드 제스처로만 가능한 기능에

- accessibilityAction 과 키보드 단축키를 제공했나요 ?

- 커스텀 컨트롤

- 직접 만든 컨트롤에도 레이블 · 역할 · 액션을 정의해 , VoiceOver / Voice Control / Switch Control 에서 잘 동작하나요 ?
