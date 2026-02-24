# Meet WebKit for SwiftUI

Meet WebKit for SwiftUI https://developer.apple.com/videos/play/wwdc2025/231/ 🔍 탐색 이벤트 관찰 (Navigation Observations)

WebPage.currentNavigationEvent는 Observable 프로퍼티 네비게이션은 하나의 이벤트가 아니라 여러 단계 이벤트의 시퀀스 startedProvisionalNavigation

receivedServerRedirect committed finished failed / failedProvisionalNavigation 새로운 네비게이션이 시작되면 currentNavigationEvent가 갱신됨

Swift 6.2 Observations 활용 Observations API 로 currentNavigationEvent를 AsyncSequence로 변환

- for await 루프를 통해 :

- 에러 처리 페이지 로딩 완료 시점 감지

- 사이드바 ( 목차 ) 데이터 갱신 ➡ 기존 WKNavigationDelegate 대비 훨씬 선언적이고 SwiftUI 친화적



## 🧩 WebPage 상태 프로퍼티 활용


- WebPage는 다양한 상태를 기본 제공 :

- title → navigationTitle에 바로 바인딩 가능 url

- estimatedProgress themeColor

- 그 외 다수 메타 정보 👉 SwiftUI 뷰가 별도 브리지 코드 없이 자동 반응

- 🧠 JavaScript 와의 통신 (callJavaScript) webPage.callJavaScript(_:) API 제공

- JavaScript 함수 실행 후 결과를 Swift 에서 수신 반환 타입은 Any? → Swift 타입으로 캐스팅 필요

- 활용 예 HTML 에서 섹션 id / title 파싱

- Table of Contents 생성 특정 섹션의 위치 계산

- ➡ JS ↔ Swift 통신이 매우 단순해짐 🚦 네비게이션 정책 제어 (NavigationDeciding)

- WebPage.NavigationDeciding 프로토콜 네비게이션 단계별 정책 정의 가능

- navigation action response

- authentication 예제 정책

- 내부 링크 (lakes://, lakes.apple.com) → WebView 내에서 허용 외부 링크 → WebView 취소 + Safari 로 열기

- SwiftUI 연동 취소된 URL 을 @Published urlToOpen으로 전달

- openURL 환경값으로 시스템 브라우저 실행 ➡ WKNavigationDelegate 보다 훨씬 명확한 책임 분리

- 🖱 스크롤 & 인터랙션 커스터마이징 스크롤 바운스 제어

  - scrollBounceBehavior

- 가로 : .basedOnSize

- 세로 : 기본 유지 visionOS 전용 webViewScrollInputBehavior look 기반 스크롤 활성화 가능



## 🔎 Find-In-Page 지원


- 기존 findNavigator modifier 그대로 사용 가능 플랫폼별 UI 위치 자동 처리

- iOS/iPadOS: 키보드 / 하단

- macOS/visionOS: 상단 ➡ WebView 가 SwiftUI 표준 검색 UX 와 자연스럽게 통합 📍 스크롤 위치 동기화 (Scroll Position Sync) 사이드바 → WebView JS 로 섹션 위치 계산 webViewScrollPosition + scrollTo(_:)로 이동 WebView → 사이드바 onScrollGeometryChange 스크롤 offset 기반으로 현재 섹션 계산 선택된 섹션 자동 업데이트 ➡ 양방향 스크롤 동기화 구현 가능



## 🧪 전체 아키텍처 요약


WebPage 로딩 상태 관찰 JS 통신 네비게이션 정책 WebView 표시 사용자 인터랙션 SwiftUI modifier 로 UX 제어 ➡ UIKit/AppKit 대비 완전히 SwiftUI 중심적인 WebKit 설계



## ✨ 정리 (Recap)


- WebKit for SwiftUI 는 :

- 선언적 Observable 기반

- Async / Swift Concurrency 친화적 주요 기능

- 다양한 로딩 방식 커스텀 URL scheme

- 네비게이션 이벤트 관찰 JavaScript 연동

  - 스크롤 / 검색 / 인터랙션 커스터마이징

  - 기존 WKWebView + Delegate 패턴에서 벗어날 수 있는 결정적 전환점
