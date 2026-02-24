# Enhance your app’s multilingual experience

Enhance your appʼs multilingual experience https://developer.apple.com/videos/play/wwdc2025/222/



## ✨ 개요


iOS 26 의 다국어 · 다문자 환경 강화를 총정리 : Locale.preferredLocales( 신규 ) 로 개인화 , 언어 발견 (Language discovery), 대체 달력 추가, ** 양방향 텍스트 ‘Natural Selectionʼ** 과 동적 문단 글쓰기

방향이 핵심입니다 . wwdc2025-222 🌍 언어 발견 & 개인화 Siri 제안으로 사용자 사용 언어를 온디바이스로 파악해 UI 언어 · 양방향 키보드 · 콘텐츠 추천을 자동 설정 .

앱은 Locale.preferredLocales로 사용자의 선호 로케일 목록을 받아 언어 우선 정렬 · 맞춤 추천 구 현 ( 기존 preferredLanguages는 향후 폐기 가능 ). wwdc2025-222

🔤 키보드 업데이트 Arabizi 변환 키보드( 라틴 → 아랍 문자 ), 이중언어 제안( 예 : 힌디 키보드에서 영 → 힌 자동 제안 ), 아랍 어– 영어 다문자 키보드 자동 감지, 24 키 태국어 레이아웃. wwdc2025-222



## 🧰 국제화 기본기 ( 리마인드 )


TextKit2로 복잡 스크립트 · 문단 처리 , 포맷터 ( 숫자 / 통화 / 날짜 ) 로 로케일별 표기 자동화 .

- 입력 UX: inputAccessoryView, textInputContextIdentifier 등으로 키보드 상태 보존 · 전환.

- wwdc2025-222 ↔ 양방향 텍스트 : Natural Selection

  - 선택 범위가 커서 흐름을 따르도록 개선 → 화면상 자연스러운 선택 .

- UITextView.selectedRanges( 배열 ) 도입 , selectedRange는 향후 폐기 예정. 관련 델리게이트도 범위 배열을 사용 .

- TextKit2 필수: textView.layoutManager 접근 시 TextKit1 로 강등되므로 textLayoutManager 사용 .

- SwiftUI 리치 텍스트 에디터도 범위 집합으로 지원 . wwdc2025-222 📝 글쓰기 방향 자동화 문단 글쓰기 방향을 내용 기반으로 동적 결정( 영문 시작 →LTR, 우르두가 이어지며 문장 형성 →RTL 로 전환 ).

- 커스텀 텍스트 엔진은 Language Introspector 샘플을 참고해 방향 판정 API 적용 .

- wwdc2025-222 🗓 대체 달력 추가

- 기존 16 종에 더해 구자라티 · 마라티 · 한국식 등 11 종 달력 식별자가 Foundation.Calendar.Identifier에 추가 . 앱 전반에서 날짜 표기 현지화 폭 확대 . wwdc2025-

  - 222



## ✅ 체크리스트


- Locale.preferredLocales 채택 , 언어 선택 리스트 상단 매칭 우선 정렬

- TextKit2 유지(textLayoutManager 사용 ) + selectedRanges 기반 편집 로직 전환

- 키보드 : Arabizi/ 다문자 / 이중언어 제안 활용 , textInputContextIdentifier로 상태 기억

- 대체 달력 옵션 노출 및 포맷터로 날짜 · 숫자 현지화 일관성 확보

- 커스텀 엔진은 글쓰기 방향 API로 동적 RTL/LTR 지원
