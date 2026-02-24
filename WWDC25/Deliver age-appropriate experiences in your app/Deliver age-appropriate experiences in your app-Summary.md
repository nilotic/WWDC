# Deliver age-appropriate experiences in your app

Deliver age-appropriate experiences in your app https://developer.apple.com/videos/play/wwdc2025/299/

🧭 개요

- iOS 26 의 Declared Age Range (DAR): 생년월일 대신 나이 구간만 공유해 기능을 연령에 맞게 게이팅 .

- 배경 : 2025-02 백서 , 2025-03 아동 계정 설정 개선 , App Store 연령 등급 4+/9+/13+/16+/18+ 개편 .

- 🔄 동작 흐름 & 사용자 경험

- 앱이 특정 나이 ( 예 : 16+) 여부를 질의 → 사용자가 공유 / 거부 → 결과로 기능 온 / 오프 .

- 한 번에 최대 3 개 기준 나이 요청 (→ 4 개 구간 ). 각 구간 최소 2 년 폭, 상한은 지역별 성인 연령까지 .

- 🔐 정책 · 프라이버시

- 공유 모드 : Always Share / Ask First / Never Share.

- 기념일 규칙: 처음 동의한 기준일에만 새 구간 공개 ( 생일 유추 방지 ). 필요 시 앱별 재프롬프트 / 캐시 초기화가능 .

- 🔁 캐시 · 동기화 & 추가 시그널 DAR 응답은 시스템 캐시 및 기기간 동기화.

- 상한이 성인 미만이면 보호자 통제 요약( 예 : 커뮤니케이션 제한 ) 도 함께 제공 .

- 🛠 통합 체크리스트 ( 코드 관점 ) Target 에 Declared Age Range Capability 추가 .

- requestAgeRange로 컨텍스트 / 지역별 기준 나이 배열 전달 .

- 응답 처리 : share/decline, lower/upper(nil 가능 ). 예 ) lower ≥ 16 ⇒ “16+”.

- ageRangeDeclaration(guardianDeclared/selfDeclared) 로 선언 주체 파악 .

- 오류 : invalidRequest( 구간 폭 규칙 등 ), notAvailable( 환경 미준비 등 ).

- 💡 실무 팁 기준 나이는 “ 무엇을 보여줄 / 숨길지 ” 에서 역산해 설계 .

- iPad/Mac 멀티 윈도우에선 알럿 표시 윈도우 명시 .

- 온보딩에서 모드 차이 · 기념일 규칙을 명확히 안내 .



## ✅ 정리


DAR 는 프라이버시 보존형 나이 검증으로 연령 적합 경험을 안전하게 제공하게 함 .

3 개 기준 ·2 년 구간 · 성인 상한 규칙 + 캐시 / 보호자 시그널을 활용해 간결하게 구현 가능 .
