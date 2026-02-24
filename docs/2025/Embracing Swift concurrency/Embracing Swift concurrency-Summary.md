# Embracing Swift concurrency

Embracing Swift concurrency https://developer.apple.com/videos/play/wwdc2025/268/



## ✨ 개요


앱을 단일 스레드 → 비동기 (async/await) → 동시성 (@concurrent) → 액터 (actor) 순서로 점진 도입 하는 로드맵을 제시합니다 . 목표는 UI 응답성 유지, 데이터 레이스를 컴파일 타임에 차단 (Sendable 검사 ),

필요한 곳에만 동시성 적용입니다 .

🧭 도입 순서

- 한 스레드로 시작: UI 는 메인 스레드 (@MainActor) 에서 안전하게 .

- 대기 숨기기: 네트워크 · 디스크 I/O 는 async/await로 중단 · 재개만 도입 ( 라이브러리가 백그라운드 처 리 ).

- 연산이 무거우면 함수에 @concurrent 를 붙여 메인 밖에서 실행 .

- 병목 상태 분리: 네트워크 매니저처럼 비 -UI 상태는 actor 로 격리해 메인 왕복을 줄임 .

- 🔑 핵심 원칙

- 필요할 때만 동시성: 먼저 최적화 → 그래도 느리면 백그라운드로 .

- Task 는 “ 끝까지 ” 단위: 이벤트마다 하나의 Task 가 처음부터 끝까지 수행 ( 인터리빙으로 UI 유지 ).

- Main Actor 모드 추천: UI 모듈은 기본 격리를 메인 액터로 둬 안전한 기본값 확보 .

- 🧠 타입 & 안전 ( 데이터 레이스 방지 ) Sendable 만 스레드 간 전달 안전 . 값 타입 (String/Array/ 구조체 ) 은 대체로 OK.

- 클래스 / 클로저 는 기본 비 -Sendable → 동시 공유 금지, 필요 변경은 보내기 전 완료 .

- nonisolated: 호출한 컨텍스트 ( 메인 / 백그라운드 ) 를 따라가게 하는 범용 라이브러리 API 에 적합 .



## 🧩 설계 팁


작은 연산은 메인에서도 OK → 라이브러리 API 는 nonisolated 기본, 앱 내부 무거운 지점만 @concurrent.

- 액터는 비 -UI 서브시스템( 예 : 네트워킹 / 캐시 ) 에만 도입 , UI· 모델은 가능하면 메인에 유지 .



## 🧪 적용 시그널


- 대기 (I/O) 로 프리즈: async/await로 숨기기 .

- CPU 바운드로 스톨: 해당 함수 @concurrent 분리 .

- 메인 액터 체크 - 인 과다: 상태를 actor 로 이전해 병렬성 ↑.



## ✅ 체크리스트


- 우선 메인 + async/await 로 대기만 숨긴다

- CPU 헤비 구간만 @concurrent 로 이동 ( 메인 전용 상태 접근 제거 )

- 값 타입 우선 전달, 참조 타입은 보내기 전 변경 끝내기

- actor 로 비 -UI 상태 격리 , 메인 왕복 최소화

- Approachable Concurrency + Main Actor 기본 격리 빌드 설정 적용

- Instruments 로 메인 정체 지점 계측 후 국소 도입
