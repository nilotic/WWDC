# Develop for Shortcuts and Spotlight with App Intents

Develop for Shortcuts and Spotlight with App Intents https://developer.apple.com/videos/play/wwdc2025/260/



## ✨ 개요


App Intents 로 앱의 핵심 기능을 시스템 전반 (Shortcuts·Spotlight·Automations) 에서 바로 실행 하게 만드는 방법을 소개합니다 . 특히 새로운 “Use Model” 액션으로 Apple Intelligence( 프라이빗 클

라우드 / 온디바이스 ) 와 ChatGPT를 단축어에 연결해 텍스트 파싱 · 요약 · 정형화까지 자동화할 수 있습니다 .

또한 Mac 의 Spotlight 에서 App Intent 바로 실행, Mac 개인 자동화가 추가되었습니다 .

🧠 Use Model 액션 핵심

- 모델 선택: Private Cloud Compute( 대규모 ), 온디바이스 ( 간단 ), 또는 ChatGPT. 한 플로우 안에 서 필요한 지식 · 개인정보 경계를 선택적으로 결합 .

- 출력 타입 자동 / 명시 지정: If 액션에 연결 시 Boolean 등으로 자동 캐스팅되며 , 필요 시 Text / Dictionary / App Entity로 명시 지정 가능 .

- Follow Up: 실행 후 추가 질문으로 결과를 조정 ( 예 : 레시피 재료 “ 두 배로 ”).

- 📝 Rich Text 대응 모델 출력은 Rich Text( 굵게 , 기울임 , 리스트 / 테이블 ) 일 수 있으므로 , 인텐트 텍스트 파라미터에

- AttributedString 지원을 권장 . 예 : ChatGPT 가 만든 일기 템플릿을 Bear 앱의 Create Note 인텐트 로 서식 손실 없이 전달 .

- 🧱 App Entity & Find 액션 Entity 는 ‘ 명사 ʼ, Intent 는 ‘ 동사 ʼ: 캘린더 앱이라면 Calendar/Event 같은 엔티티를 정의 . 모델에 엔티티 목록을 입력해 필터링 같은 추론을 시킬 수 있음 . ( 타입 이름 , 표시용 제목 / 부제 , 노출 프로퍼티 는 문자열로 JSON 포함됨 )

- 엔티티 획득 경로: Shortcuts 의 Find 액션 자동 / 수동 제공 EnumerableEntityQuery/EntityPropertyQuery 구현 , 또는 IndexedEntity 채택 후 Spotlight 속성 키와 매핑( 필요 시 custom indexing key). 이 렇게 하면 Find 액션을 시스템이 생성.



## 🔎 Spotlight on Mac 최적화


- 직접 실행: Spotlight 에서 인텐트를 바로 실행 . Parameter Summary에 필수 파라미터를 포함해 야 노출됨 ( 기본값 제공 · 옵셔널 처리로 유연성 확보 ).

제안 · 검색: SuggestedEntities/EnumerableEntityQuery로 추천 항목,

- EntityStringQuery/IndexedEntity로 심화 검색 제공 .

- NSUserActivity.appEntityIdentifier로 현재 화면 콘텐츠 기반 제안도 가능 .

- 실행 경험 분리: 백그라운드 인텐트( 예 : Create Event) 와 포그라운드 인텐트(Open Event) 를 Opens Intent로 페어링해 “ 빠른 실행 ↔ 앱 열기 ” 모두 지원 .

- ⚙ Automations on Mac Mac 에 개인 자동화가 도입 ( 폴더 / 외장 드라이브 트리거 등 ). iOS 앱이 macOS 에서 동작한다면 해당 App Intent 도 자동화에서 사용 가능 .



## ✅ 실무 체크리스트


- Use Model로 필요한 출력 타입 (Text/Dictionary/Entity) 을 명시하고 , 후속 액션 입력과 호환

- 확인

- AttributedString 지원으로 Rich Text 손실 없이 수신

- App Entity의 표시 문자열 · 핵심 프로퍼티를 모델이 추론하기 좋게 노출

- Find 액션: Query 구현 또는 IndexedEntity→Spotlight 키 매핑으로 자동 생성

- Parameter Summary에 필수 파라미터 포함해 Spotlight 노출 보장

- SuggestedEntities / StringQuery로 추천 · 검색 UX 강화

- Background/Foreground 인텐트 분리 + Opens Intent로 실행 맥락 최적화

- Mac Automations 트리거( 폴더 등 ) 로 반복 작업 무인화
