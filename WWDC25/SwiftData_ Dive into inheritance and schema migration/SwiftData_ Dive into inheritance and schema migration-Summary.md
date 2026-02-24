# SwiftData_ Dive into inheritance and schema migration

- SwiftData: Dive into inheritance and schema migration https://developer.apple.com/videos/play/wwdc2025/291/



## ✨ 개요


iOS 26 에서 확장된 SwiftData 의 클래스 상속 (Class Inheritance), 스키마 마이그레이션, 쿼리 / 페치 최적화, 모델 변경 감지를 종합적으로 다룬 세션

- 핵심 메시지 :

- 상속은 신중하게 , 마이그레이션은 명시적으로 , 페치는 최소한으로 , 변경 감지는 히스토리 기반으로 🧬 SwiftData 클래스 상속 (iOS 26)

- SwiftData 에 클래스 상속 지원 추가 공통 속성과 동작을 가진 자연스러운 계층 구조에 적합

- 올바른 사용 조건 IS-A 관계가 명확할 것

- PersonalTrip IS-A Trip BusinessTrip IS-A Trip

- 상위 타입이 의미 있는 도메인일 것 상위 / 하위 타입 모두 실제로 쿼리 대상일 것 (deep + shallow search)

- 피해야 할 경우 단순히 속성 몇 개 공유 목적

- 자연스러운 계층이 아닌 경우 → protocol이 더 적합 항상 leaf 타입만 쿼리하는 경우 → 모델 플래튼 (flatten) 고려

- 🧱 상속 모델 구성 예시 Trip

- destination, startDate, endDate ( 공통 ) PersonalTrip

- 여행 목적 (reason enum) BusinessTrip

- perdiem( 출장 경비 ) 주의

- 서브클래스는 @available(iOS 26, *) 필요 modelContainer 에 모든 타입 등록 필수

- 🔍 상속 모델 쿼리 패턴 Query<Trip> → 모든 Trip + 서브클래스 포함

- 특정 타입 필터링 Predicate 에서 is PersonalTrip 사용

- UI 예 Segmented Control 로

- 전체 / Personal / Business 전환 🗂 스키마 버저닝 & 마이그레이션 전략

- Versioned Schema 버전별로 Schema 타입 명시

- 출시 순서대로 나열 iOS 26 (v4) 변경점

- 서브클래스 추가 Lightweight Migration Stage 추가

- Schema Migration Plan 구성 요소

- Versioned Schemas 배열

- Migration Stages 배열 ModelContainer 생성 시 명시적으로 주입 ⚙ 커스텀 마이그레이션 최적화 willMigrate에서 fetch 시 propertiesToFetch 실제 사용하는 프로퍼티만 로드 relationshipsToPrefetch 이후 접근할 관계만 미리 로드 결과 마이그레이션 성능 크게 개선 메모리 사용 감소



## 🔎 쿼리 & 페치 성능 최적화


Predicate 조합 검색어 + 타입 필터 compound predicate 활용 FetchDescriptor 최적화 fetchLimit

- 예 : 위젯에서 최신 Trip 1 개만 필요할 때 불필요한 전체 fetch 방지

- 👀 모델 변경 감지 : Local vs Remote Local 변경

- PersistentModel은 모두 Observable withObservationTracking

- 같은 프로세스 내 변경 감지 한계

- 다른 ModelContext / Widget / Extension 에서의 변경은 Observable 로 감지 불가 fetch 기반 코드는 자동 반영 ❌

- 🕰 Persistent History 활용 ( 핵심 ) SwiftData 는 모델 변경 히스토리 저장

- iOS 26 신규 History fetch 에 sortBy + fetchLimit 지원

  - 효율적인 변경 감지 흐름

- 최신 history token 을 limit 1 fetch로 획득

- token 저장 ( 북마크 역할 )

- 이후 fetch 시 token 이후 변경만 조회 관심 있는 entity 만 predicate 로 필터

- 변경 없으면 refetch 생략 preservedValueOnDeletion 삭제된 모델도 히스토리에서 식별 가능 🧠 핵심 정리 상속 도메인 계층이 명확할 때만 사용 쿼리 패턴과 함께 결정 마이그레이션 버저닝 + 명시적 플랜 필수 마이그레이션 fetch 도 최적화 대상 성능 필요한 데이터만 가져오기 fetchLimit / propertiesToFetch 적극 활용 변경 감지 Local → Observation Remote / Cross-process → Persistent History

- 결과 SwiftData 를 안전하고 , 진화 가능하며 , 성능 좋은 영속성 레이어로 운영 가능
