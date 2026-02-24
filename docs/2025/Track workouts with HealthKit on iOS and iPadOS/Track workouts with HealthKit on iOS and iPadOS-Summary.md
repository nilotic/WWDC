# Track workouts with HealthKit on iOS and iPadOS

Track workouts with HealthKit on iOS and iPadOS https://developer.apple.com/videos/play/wwdc2025/322/



## ✨ 개요


iOS 26 / iPadOS 26 에서 HealthKit Workout API가 대폭 확장됨 Apple Watch 와 동일한 Workout Session + Builder 구조를 이제 iPhone / iPad 에서도 안정적으로 사용 가능

핵심 주제 워크아웃 세션 실행 흐름 Watch 와의 차이점 잠금 화면 ·Siri 연동 Crash Recovery 베스트 프랙티스 🏃 기본 구조 : Workout Session 실행 흐름

1️⃣ 설정

- HKWorkoutConfiguration

- activityType ( 예 : running)

- locationType ( 예 : outdoor)

- HKWorkoutSession 생성

- session 에서 HKWorkoutBuilder 획득

- HKLiveWorkoutDataSource 연결 2️⃣ 시작 흐름

- prepare() 호출

- 3 초 카운트다운 ( 센서 준비 시간 확보 )

- startActivity()

- beginCollection() 👉 Anchored Query 불필요 → Builder delegate 가 자동으로 UI 업데이트 제공 3️⃣ 종료 흐름

- stopActivity()

- session 이 stop 상태 전환

- endCollection()

- builder finishWorkout()

- session end()

- Summary 표시 ⌚ Apple Watch 와의 차이점 1️⃣ 센서 차이 iPhone/iPad 에는 심박 센서 ❌ 대신 Bluetooth HR monitor Powerbeats Pro 2 등 HealthKit 이 자동으로 HR 샘플 저장 2️⃣ Generated Types vs Collected Types Generated Types 시스템이 자동 생성 칼로리 거리 심박 ( 외부 센서 있을 때 ) Collected Types 앱이 직접 추가해야 하는 샘플

- 예 : 운동 중 물 섭취량 수집 타입 제어

- DataSource 에서 enableCollection(for:)

- disableCollection(for:) 원하는 타입만 활성화 가능

- 📊 운동 후 데이터 읽기 요약 통계

- workout.statistics(for:) 구간별 차트

- HKStatisticsCollectionQuery 원하는 interval 지정

- 초정밀 데이터 샘플 count > 1 이면

- HKQuantitySeriesSampleQuery 사용 👉 Apple Watch 워크아웃과 동일 패턴

- 🔒 잠금 화면 동작 ( 중요 ) 기본 동작

- iPhone 은 운동 중 잠길 가능성 높음 최초 세션 시작 시

- “ 잠금 상태에서도 데이터 접근 허용 ” 프롬프트 표시 Live Activity 활용

- 잠금 화면에서 핵심 메트릭 표시 가능

- 데이터 접근 불가 시 메트릭 숨기고 운동 시간만 표시

  - 🗣 Siri Lock Screen 지원

- iOS 26 부터 :

- 잠금 해제 없이 시작

- 일시정지 재개

- 취소 가능

  - 구현 흐름

- Intent Handler 정의

- StartWorkoutIntent 등 정의

- 현재 세션 존재 여부 확인

- 성공 / 실패 응답 반환

- AppDelegate 에서 Intent delegate 연결 👉 반드시 앱 내부에서 처리해야 Lock Screen 동작 💥 Crash Recovery ( 중요 ) Watch 에 있던 기능이 iPhone/iPad 에도 확장 시스템 동작 앱 크래시 시 자동 재실행 WorkoutSession + Builder 상태 복원 개발자가 해야 할 것 DataSource 만 다시 생성 새 SceneDelegate 에서 복구 처리 shouldHandleActiveWorkoutRecovery

- healthStore.recoverActiveWorkoutSession WorkoutManager 로 전달 DataSource 재설정 👉 세션 자체는 자동 복구됨 🧠 베스트 프랙티스 1️⃣ Watch 앱이 있다면 가능하면 Watch 에서 워크아웃 시작 iPhone 으로 미러링 2️⃣ 권한 최소 요청 필요한 데이터 타입만 authorization 요청 불필요한 타입 요청 금지 3️⃣ 반드시 Workout Builder 사용 직접 샘플 생성 ❌ Builder API 사용

- Activity Rings 정상 반영 보장 🧠 핵심 정리 iPhone/iPad 에서도 Watch 급 워크아웃 API 제공 Builder 기반 구조는 UI 동기화 데이터 일관성 Crash Recovery Activity Ring 연동 모두 자동 처리 Lock Screen + Siri + Live Activity 조합으로 실제 사용자 경험 완성

- 기존 Watch 앱이 있다면 거의 동일 코드로 iOS 확장 가능
