# Get to know App Intents

Get to know App Intents https://developer.apple.com/videos/play/wwdc2025/244/



## ✨ 개요


App Intents 는 앱의 “ 동사 ( 인텐트 )· 명사 (App Enum/Entity)” 를 시스템 전역 (Spotlight, Siri, Action Button, 위젯 , Control Center 등 ) 으로 확장해 발견 · 가시성 · 실행 가능성을 높입니다 . 제목은 상수,

perform 는 결과 / 스니펫 / 대화를 반환하며 , Supported Modes로 포그라운드 실행도 제어합니다 .



## 🧩 핵심 개념


- Intent = 동사: 파라미터 / 리턴 타입 ( 네이티브 · 커스텀 ) 을 갖는 앱 동작 .

- App Enum / App Entity = 명사: 고정값은 Enum, 동적 데이터는 Entity(+Query 필요 ).

- Parameter Summary: 문장형 요약 UI. 모든 필수 파라미터 포함 시 macOS Spotlight 에서 바 로 실행 가능( 신규 ).



## 🔎 Spotlight·Siri·Action Button 노출


- App Shortcuts: 대표 인텐트를 문구 (phrases) 와 함께 전역에 노출 ( 설치 즉시 ). 문구에 앱 이름 플레이스홀더 필수 , 파라미터 1 개까지 포함 가능 .

- Spotlight 호출 ( 신규 ): Mac Spotlight 에서 인텐트 직접 실행 .



## 🏗 인텐트 설계 실무


타이틀은 상수( 컴파일 타임 처리 ).

- @MainActor perform: 내비게이션 등 메인 스레드 필요 시 .

- Supported Modes로 포그라운드 제어 (foreground 등 ).

- Dialog/View Snippet로 결과 가시화 ( 앱 전경화 없이도 피드백 ).



## 🗺 엔티티 · 쿼리


- App Entity: id, @Property( 표시용 ), Representation 필요 .

- Entity Query:

  - 필수 : IDs → Entities 복원 .

  - 선택 : 문자열 / 프로퍼티 검색, suggestedEntities( 즐겨찾기 등 추천 ), Enumerable( 전량 ).

  - @Dependency로 데이터 소스 주입 가능 .



## 🖼 Transferable & Spotlight 인덱싱 ( 강화 )


- Transferable: 엔티티의 이미지 / 파일 표현을 선언해 Show Content 등 액션과 상호운용 .

- IndexedEntity(+ 속성에 indexingKey 주석 ): Spotlight 가 자연어 검색 · 표시 품질 향상 , 탭 시 OpenIntent로 딥링크 .



## 🚪 내비게이션 전용 인텐트


- OpenIntent: 실행 전 자동 포그라운드 .

- TargetContentProvidingIntent( 신규 ): perform 없이 뷰에 onAppIntentExecution 로직을 붙여 스위프트 UI 네비게이션 분리 .



## 🧰 Xcode· 패키지화 워크플로


- 코드가 단일 소스 오브 트루스: 빌드 타임에 표현을 생성 · 탑재 .

- 멀티 타겟 / 패키지: App Intents Package 등록으로 런타임 인덱싱 / 검증을 보장 ( 앱 · 익스텐션 · 패키 지 조합 ).



## ✅ 체크리스트


- 핵심 플로우를 App Shortcuts 로 노출 ( 문구에 앱 이름 포함 )

- Parameter Summary 완비 → macOS Spotlight 즉시 실행 대응 ( 신규 )

- 동적 데이터는 App Entity + Entity Query 로 모델링 , suggestedEntities 제공

- 이미지 등은 Transferable로 공유 · 표시 경로 통합

- 검색 품질 ↑: IndexedEntity + indexingKey 주석 , OpenIntent/TargetContentProvidingIntent로 딥링크 / 네비게이션 분리

- 멀티 타겟 땐 App Intents Package 구성 / 포함 목록 정리
