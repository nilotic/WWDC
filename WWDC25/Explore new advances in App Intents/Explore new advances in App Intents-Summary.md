# Explore new advances in App Intents

Explore new advances in App Intents https://developer.apple.com/videos/play/wwdc2025/275/ WWDC25 세션 275 — App Intents 최신 기능 총

정리



## ✨ 개요


App Intents 로 시스템 전반 (Shortcuts·Spotlight·Visual Intelligence·Siri/ChatGPT 연계 ) 에서

- 더 강력한 경험을 만들 수 있는 신기능을 묶어 소개합니다 : 인터랙티브 스니펫, 이미지 검색 연동, 온스크린 엔티티, Spotlight/IndexedEntity 강화, Undo/ 다중 선택, Supported Modes( 포그라운드 제어 ), View 제어 API, 다중 씬 활성화 조건, Computed/Deferred 속성, Swift Package 배포까지 .



## 🧩 인터랙티브 스니펫


SnippetIntent로 결과 / 확인 스니펫을 만들고 , 버튼 / 토글에 기존 App Intent 를 연결해 실시간 갱 신( 애니메이션은 SwiftUI contentTransition).

결과 스니펫 중 버튼이 다른 스니펫을 제시하면 원 스니펫을 교체 ( 확인 / 설정 UI 구현 ).

중간 상태 변화는 SnippetIntent.reload() 로 즉시 업데이트 .



## 🔎 이미지 검색 (Visual Intelligence) & OpenIntent


- IntentValueQuery( 입력 : SemanticContentDescriptor) 로 스크린샷 / 카메라 캡처에서 앱 엔티티 검색 결과 를 제공 .

- 결과 탭 시 해당 엔티티용 OpenIntent 로 앱을 열어 딥링크 . UnionValues 로 여러 엔티티 타입 혼 합 반환도 가능 .



## 🖼 온스크린 엔티티 & ChatGPT 연계


뷰에 userActivity 로 현재 화면 엔티티 식별자 를 연동 → 사용자가 “ 지금 보이는 것 ” 에 대해 Siri 가 ChatGPT 로 보내기 제안 .

- 엔티티를 Transferable( 예 : PDF/ 텍스트 / 리치 텍스트 ) 로 제공해 풍부한 컨텍스트를 전달 .

- 🔦 Spotlight & IndexedEntity 강화 엔티티를 IndexedEntity 로 기증하고 , 속성에 indexingKey/customIndexingKey 를 부여해 자연

- 어 필터링 지원 ( 예 : “Asia”).

- 보너스 : Shortcuts 가 Find 액션 자동 생성, 화면에 보이는 엔티티 우선 제안 , PredictableIntent 로 사용 맥락 기반 제안 품질 향상 .

- ↩ UndoableIntent & 🗳 다중 선택 (requestChoice) UndoableIntent 로 세 손가락 스와이프 등 시스템 Undo 제스처와 공유 Undo 스택 참여 .

- requestChoice(between:) 로 삭제 / 보관 같은 다중 선택 스니펫 제공 ( 취소는 오류 throw 로 즉시 종료 ).

- 🧭 Supported Modes( 포그라운드 제어 ) 인텐트가 백그라운드 / 포그라운드 동작 방식을 선언(immediate/dynamic/deferred).

- currentMode, continueInForeground(), systemContext.canForeground 로 언제 앱을 띄울지 세밀 제어 ( 닫힌 장소 등 조건에서 열지 않기 ).



## 🧰 View Control APIs( 뷰가 내비게이션 담당 )


인텐트를 TargetContentProvidingIntent 로 표시하고 , 뷰에 onAppIntentExecution 적용 → UI 내비게이션을 인텐트에서 분리( 의존성 / 싱글턴 제거 ).

여러 뷰가 동일 인텐트를 처리 가능 ( 전경화 직전 파라미터만 읽기 ).

🪟 다중 씬 / 윈도우 활성화 조건 인텐트의 contentIdentifier 와 handlesExternalEvents(Scene/ 뷰 ) 로 어떤 씬이 인텐트를 처 리할지 제어 ( 편집 중인 씬은 제외 등 ).

UIKit 은 UISceneAppIntent / AppIntentSceneDelegate 지원 .

🧮 Computed / Deferred 속성

- @ComputedProperty: 엔티티 값 중복 저장 없이 소스에서 즉시 계산( 오버헤드 낮음 ).

- @DeferredProperty: 비싼 값은 요청될 때만 비동기 계산(Shortcuts 등에서 필요 시 로드 ). 가능하 면 Computed 우선.



## 📦 Swift Packages 배포


App Intents 코드를 Swift Package/ 정적 라이브러리 로도 배포 가능 ( 프레임워크 외 옵션 추가 ).



## ✅ 실무 체크리스트


- 핵심 플로우에 인터랙티브 스니펫 적용 ( 버튼 / 토글은 기존 인텐트 재사용 )

- 이미지 검색: IntentValueQuery(SemanticContentDescriptor) + OpenIntent 준비

- 화면에 온스크린 엔티티 주석 추가 + Transferable(PDF/ 텍스트 ) 구현

- 엔티티를 IndexedEntity 로 기증 , indexingKey 정렬 → Spotlight/Shortcuts 품질 ↑

- 파괴적 작업은 UndoableIntent + requestChoice 대안 제시

- 인텐트는 Supported Modes 로 포그라운드 타이밍 제어 , 필요 시 continueInForeground()

- onAppIntentExecution 로 UI 내비를 뷰 쪽에서 처리

- 다중 씬은 handlesExternalEvents + contentIdentifier 로 라우팅

- 엔티티 속성은 Computed 우선, 고비용은 Deferred 로 지연

- 모듈화는 Swift Package 로 전환 검토
