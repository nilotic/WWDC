# WWDC26 Code-along: Add persistence with SwiftData 요약

- Session: 275
- Title: Code-along: Add persistence with SwiftData
- Source: https://developer.apple.com/videos/play/wwdc2026/275/
- Topic: SwiftData, SwiftUI, Persistence, Model schema, Query, Relationships

---

## 한 줄 요약

WWDC26의 “Code-along: Add persistence with SwiftData”는 기존 SwiftUI 앱의 인메모리 상태를 SwiftData 기반 영속성 계층으로 전환하는 과정을 따라가며, 모델 스키마 정의, 관계 설정, SwiftUI 뷰의 쿼리 적용, 오류 처리와 상태 갱신까지 설명하는 실습형 세션이다.

---

## 핵심 요약

이번 세션은 여행 계획 앱인 Wishlist를 예제로 사용해, 메모리 기반 데이터 흐름을 SwiftData의 `ModelContext`, `@Model`, `@Query`, relationship, predicate 기반 fetch로 바꾸는 흐름을 보여준다.

주요 흐름은 다음과 같다.

1. **저장해야 할 상태 식별**
   - 여행, 활동, 목표, 검색 결과 등 앱의 동적 데이터를 파악한다.
   - 기존 DataSource는 데이터를 메모리에 보관하고, 필터링과 정렬도 메모리에서 수행한다.
   - 앱을 종료하고 다시 실행하면 새로 추가한 데이터가 사라지는 문제가 있다.

2. **SwiftData 모델 스키마 정의**
   - 기존 `@Observable` 타입을 `@Model` 타입으로 전환한다.
   - SwiftData가 Observable conformance를 자동 생성한다.
   - 저장될 속성은 Codable이어야 하며, 데이터베이스에서 다시 채워질 수 있도록 mutable해야 한다.

3. **관계 모델링**
   - Trip과 Activity 사이의 to-many relationship을 정의한다.
   - 배열 프로퍼티와 `@Relationship`을 사용해 모델 간 연결을 명시한다.
   - 삭제 규칙을 설정해 Trip 삭제 시 관련 Activity도 정리되도록 구성한다.

4. **뷰 계층 업데이트**
   - DataSource 환경 객체를 제거하고 `@Query`를 사용한다.
   - predicate와 sort descriptor, fetch limit을 사용해 필요한 데이터만 가져온다.
   - SwiftUI 뷰는 쿼리 결과가 바뀌면 자동으로 업데이트된다.

5. **오류 처리와 실시간 상태 갱신**
   - 런타임 오류를 상태로 잡아 telemetry와 alert에 연결한다.
   - Observation의 Continuous Observation을 사용해 모델 속성 변경 시 `dateEdited` 같은 파생 상태를 갱신한다.

---

# 1. Introduction

세션은 SwiftData 팀의 Matthew Turk가 Wishlist라는 SwiftUI 앱을 예제로 소개하면서 시작한다. Wishlist는 여행 계획을 정리하는 앱으로, 여행 아이디어를 저장하고 계절별 컬렉션으로 묶으며, 목표와 검색 기능을 제공한다.

초기 앱은 `DataSource` 클래스를 SwiftUI environment로 주입해 데이터를 제공한다. 이 구조에서는 다음과 같은 특징이 있다.

| 항목 | 기존 구조 |
|---|---|
| 데이터 저장 | 메모리 기반 |
| 데이터 제공 | `DataSource` environment object |
| 정렬/필터링 | 메모리에서 필요할 때 수행 |
| 새 데이터 저장 | 앱 실행 중에만 유지 |
| 앱 재실행 | 새로 추가한 데이터가 사라짐 |

이 문제를 해결하기 위해 SwiftData를 사용해 동적 데이터를 영속 저장소와 연결한다. 목표는 인메모리 `DataSource`를 지속 가능한 `ModelContext`, 모델 스키마, relationship, database query 기반 구조로 대체하는 것이다.

---

# 2. 저장해야 할 상태 식별

SwiftData 전환의 첫 단계는 앱에서 어떤 상태가 영속 저장되어야 하는지 식별하는 것이다.

Wishlist 앱에서 중요한 상태는 다음과 같다.

| 상태 | 설명 |
|---|---|
| Trip | 사용자가 저장한 여행 계획 |
| Activity | 각 여행에 포함된 활동 |
| Goal | 여행 또는 활동 완료에 따라 달성되는 목표 |
| Goal status | 목표 달성 여부와 진행도 |
| Search results | 여행과 활동을 검색해 보여주는 결과 |

세션에서는 먼저 기존 데이터 타입들이 코드 어디에 있는지 확인하고, SwiftData 모델로 바꿀 수 있는 타입을 찾아간다. 이를 통해 메모리에만 존재하던 동적 데이터를 실제 저장소에 연결할 수 있게 된다.

---

# 3. SwiftData 모델 스키마 정의

## Activity를 `@Model`로 전환

첫 번째 예시는 `Activity` 타입이다. 기존 Observable 타입을 SwiftData 모델로 만들기 위해 `SwiftData`를 import하고, `@Observable` 대신 `@Model`을 사용한다.

```swift
import Foundation
import SwiftData

@Model
class Activity {
    var name: String
    var isComplete: Bool = false
    var dateCreated = Date.now
    var dateEdited = Date.now
}
```

SwiftData는 `@Model` 타입에 대해 Observable conformance를 자동 생성한다. 따라서 SwiftUI 뷰는 SwiftData 모델의 변경을 관찰할 수 있다.

## property observer 제거

기존 `Activity`에는 `name` 또는 `isComplete`가 바뀔 때 `dateEdited`를 갱신하는 `didSet` observer가 있었다. 그러나 SwiftData 모델에서는 property observer와 computed property가 항상 잘 맞지 않을 수 있으므로, 세션에서는 우선 `didSet`을 제거하고 나중에 Observation 기능으로 같은 동작을 다시 구현한다.

## Trip 모델 전환

`Trip`도 같은 방식으로 `@Model`로 전환한다. 이 과정에서 몇 가지 빌드 오류가 발생한다.

| 오류/요구사항 | 이유 |
|---|---|
| `creationDate`가 mutable이어야 함 | SwiftData가 데이터베이스에서 값을 로드해 런타임에 채울 수 있어야 함 |
| 모델 프로퍼티가 Codable이어야 함 | SwiftData가 값을 데이터베이스 column으로 serialize해야 함 |
| enum 타입에 Codable 추가 필요 | `TripCollection` 같은 enum도 저장 대상이면 Codable이어야 함 |

`TripCollection`은 여행의 계절 테마를 나타내는 값이므로 스키마에 포함되어 저장되어야 한다. 따라서 명시적으로 Codable conformance를 추가한다.

---

# 4. Goal 모델 재설계

`Goal`은 단순히 `@Model`로 바꾸기 어려운 타입이다. 기존 앱에서 Goal은 enum으로 정의되어 있었고, 총 18개의 고정된 목표를 표현했다.

하지만 SwiftData에서 영속 모델로 다루려면 class가 적합하다. class는 저장 프로퍼티를 가질 수 있고, 필요한 만큼 인스턴스를 만들 수 있기 때문이다.

## 기존 Goal 구조의 한계

| 기존 구조 | 한계 |
|---|---|
| enum 기반 | 고정된 값 집합만 표현 |
| stored property 없음 | 진행도 같은 동적 상태를 직접 저장하기 어려움 |
| completed count 별도 관리 | 목표 자체와 진행 상태가 분리됨 |

## 새 Goal 모델

세션에서는 Goal을 class로 바꾸고 다음 프로퍼티를 둔다.

| 프로퍼티 | 설명 |
|---|---|
| `name` | 목표 이름 |
| `targetCount` | 달성에 필요한 수치 |
| `completedCount` | 현재 완료한 수치 |
| `isComplete` | 목표 달성 여부 |

`isComplete`는 `completedCount`가 `targetCount` 이상일 때 true가 된다. 저장 프로퍼티로 두면 쿼리 시 완료된 목표와 예정 목표를 분리하기 쉽다.

## 모델 상속

기존 Goal에는 여행 완료 목표와 활동 완료 목표를 구분하는 `kind`가 있었다. 세션에서는 이 차이를 `kind` 프로퍼티 대신 SwiftData의 모델 상속으로 표현한다.

| 모델 | 역할 |
|---|---|
| `Goal` | 공통 목표 속성을 가진 superclass |
| `TripGoal` | 여행 완료 기준 목표 |
| `ActivityGoal` | 활동 완료 기준 목표 |

상속은 여러 타입이 같은 개념을 공유하면서도 세부 차이가 명확할 때 적합한 설계로 소개된다.

---

# 5. 모델 관계 정의

SwiftData 전환에서 중요한 단계는 모델 간 관계를 명시하는 것이다.

Wishlist에서는 하나의 Trip에 여러 Activity가 연결된다. 이는 to-many relationship이다.

## Trip과 Activity 관계

기존 앱은 dictionary와 배열 순회 함수로 Trip과 Activity를 연결했다. SwiftData에서는 `Trip` 모델에 activities 배열을 선언해 관계를 표현한다.

```swift
@Relationship(deleteRule: .cascade)
var activities: [Activity]
```

이 방식은 다음을 의미한다.

| 항목 | 설명 |
|---|---|
| 배열 프로퍼티 | 하나의 Trip이 여러 Activity를 참조 |
| `@Relationship` | SwiftData에게 관계임을 명시 |
| cascade delete | Trip 삭제 시 연결된 Activity도 함께 삭제 |
| 자동 traversal | Activity 중심 뷰에서도 parent Trip 정보를 참조 가능 |

## 이미지 저장 방식 조정

기존 `photoURL`은 단순 파일 경로였다. 하지만 파일명이 바뀌거나 위치가 이동하면 의미를 잃을 수 있다. 또한 전체 해상도 이미지는 필요할 때만 로드하는 것이 좋다.

세션에서는 이미지 저장을 다음처럼 나눈다.

| 데이터 | 저장 방식 |
|---|---|
| 썸네일 | low-resolution image data를 database에 inline 저장 |
| 원본 이미지 | 별도 `TripImage` 모델을 통해 persistent external file reference로 저장 |

이후 `photoURL`은 `photo`로 rename된다. Xcode의 rename refactoring과 multi-cursor editing을 사용해 여러 파일의 참조를 함께 수정한다.

---

# 6. DataSource 제거와 ModelContainer 적용

SwiftData 스키마와 relationship이 정의되면 기존 구조의 상당 부분이 불필요해진다.

세션에서는 다음 파일/구조를 제거한다.

| 제거 대상 | 이유 |
|---|---|
| `TripEditModel` | SwiftUI view가 SwiftData 모델에 직접 bind 가능 |
| `DataSource` | ModelContext, query, relationship이 역할을 대체 |
| 수동 필터링/정렬 코드 | predicate와 query로 대체 |
| 수동 관계 traversal | SwiftData relationship으로 대체 |

결과적으로 수백 줄의 상태 관리, 저장 로직, 필터링, 정렬, 검색 관련 코드가 사라진다.

마지막으로 `WindowGroup`에 `modelContainer` scene modifier를 추가해 SwiftUI가 새 스키마를 사용하도록 설정한다.

```swift
WindowGroup {
    ContentView()
}
.modelContainer(for: [
    Trip.self,
    Activity.self,
    Goal.self
])
```

이 단계 이후 SwiftData의 automatic saving이 기본으로 활성화된다.

---

# 7. 뷰 계층 업데이트

모델 계층이 준비되면 SwiftUI 뷰를 SwiftData 모델과 연결한다.

핵심은 environment의 `DataSource`를 제거하고, 각 뷰에서 필요한 데이터를 `@Query`로 직접 가져오는 것이다.

## 쿼리 설계 원칙

세션은 SwiftData 앱에서 필터링을 설계할 때 두 가지를 기억하라고 설명한다.

| 개념 | 설명 |
|---|---|
| `FetchDescriptor` | 어떤 모델을 로드할지 계획하는 방법 |
| 저장소 I/O | 데이터는 앱 메모리 밖의 저장소에서 로드되므로 메모리 접근보다 느릴 수 있음 |

따라서 모든 데이터를 가져와 메모리에서 걸러내는 방식보다, predicate를 사용해 필요한 데이터만 저장소에서 가져오는 방식이 중요하다.

## GoalsView

`GoalsView`에서는 achieved goals와 remaining goals를 각각 `@Query`로 가져온다.

| 쿼리 | 설명 |
|---|---|
| 완료된 목표 | 달성된 목표를 달성 시점 기준으로 정렬 |
| 남은 목표 | 아직 완료되지 않은 관련 목표 조회 |

`@Query`를 사용하면 query result가 변경될 때 SwiftUI view가 자동으로 업데이트된다.

## RecentTripsPageView

최근 여행 목록에서는 최신순으로 정렬하고 fetch limit을 5로 설정한다.

| 설정 | 내용 |
|---|---|
| 정렬 | reverse chronological order |
| 제한 | fetch limit 5 |
| 목적 | 최근 여행 5개만 표시 |

## TripCollectionView

`TripCollectionView`는 계절별 여행 컬렉션을 보여준다. 어떤 season을 표시할지는 initializer에서 결정되므로, initializer parameter를 predicate에 캡처해 동적으로 query를 구성한다.

## SearchResultsListView

검색 화면에서는 검색어에 따라 다른 쿼리를 수행한다.

| 상태 | 동작 |
|---|---|
| 검색어 없음 | 최근 여행 3개 표시 |
| 검색어 있음 | 이름이 검색어와 일치하는 Trip 조회 |
| Activity 검색 | Activity 이름이 검색어와 일치하는 항목 조회 |
| 결과 없음 | `ContentUnavailableView` 표시 |

이제 검색 결과도 DataSource 조건이 아니라 `trips.isEmpty`, `activities.isEmpty` 같은 실제 쿼리 결과를 기준으로 판단한다.

---

# 8. 저장 동작 확인

뷰 계층 전환 후 앱을 실행해 새 Trip을 추가한다. 기존 구조에서는 앱을 다시 실행하면 새 Trip이 사라졌지만, SwiftData 적용 후에는 “Northern Lights” Trip이 그대로 남아 있다.

이는 다음 변화가 정상적으로 작동한다는 의미다.

| 변화 | 결과 |
|---|---|
| `@Model` 적용 | 모델이 SwiftData 저장 대상이 됨 |
| `modelContainer` 적용 | 앱 scene이 SwiftData 저장소와 연결됨 |
| `@Query` 적용 | 저장된 데이터를 SwiftUI 뷰가 자동 조회 |
| automatic saving | 새 데이터가 앱 재실행 후에도 유지됨 |

---

# 9. 오류 처리

SwiftData 전환 후에도 런타임 오류를 고려해야 한다. 예를 들어 활동 완료 상태를 바꾸면서 목표 진행도를 업데이트하는 `updateGoalAchievements` 메서드는 오류를 던질 수 있다.

세션에서는 다음 방식으로 처리한다.

| 처리 | 설명 |
|---|---|
| state variable | 오류를 SwiftUI state에 저장 |
| telemetry | 오류를 telemetry system에 전달 |
| alert | 사용자가 복구할 수 있는 경우 alert 표시 |

예상 가능한 오류 예시는 다음과 같다.

- low disk capacity
- unsupported predicate
- 저장소 접근 실패
- 데이터 업데이트 실패

---

# 10. Continuous Observation으로 상태 갱신

초기 모델 전환 과정에서 제거했던 `didSet` 기반 `dateEdited` 갱신은 마지막에 Observation framework의 Continuous Observation 기능으로 다시 구현된다.

문제 상황은 다음과 같다.

1. Activity 목록을 `dateEdited` 기준으로 정렬한다.
2. 사용자가 Activity의 완료 상태를 변경한다.
3. `dateEdited`가 갱신되지 않으면 해당 Activity가 최신 항목으로 이동하지 않는다.

이를 해결하기 위해 `ActivityItemView`의 initializer에서 `withContinuousObservation`을 설정한다. 사용자가 Activity의 `isComplete` 또는 `name`을 변경하면 observation 코드가 실행되고, `dateEdited`가 현재 시간으로 갱신된다.

이 방식은 다음 side effect에도 활용된다.

| 변경 | side effect |
|---|---|
| Activity 완료 상태 toggle | parent Trip의 전체 완료 여부 갱신 |
| Activity 추가/삭제 | Trip의 `isComplete` 상태 재계산 |
| Activity 이름 변경 | `dateEdited` 갱신 |

---

# 11. 정리

이 세션은 SwiftData를 실제 SwiftUI 앱에 적용하는 전체 흐름을 코드와 함께 보여준다. 핵심은 단순히 `@Model`을 붙이는 것이 아니라, 앱의 상태를 영속 모델로 재설계하고, 모델 간 관계를 명확히 하며, 뷰가 필요한 데이터만 쿼리하도록 바꾸는 것이다.

SwiftData 전환의 기본 순서는 다음과 같다.

1. 앱에서 영속화할 상태를 식별한다.
2. 해당 타입을 `@Model` 기반 SwiftData 모델로 변환한다.
3. enum이나 임시 상태 관리 구조는 필요에 따라 class 모델로 재설계한다.
4. 관계는 배열과 `@Relationship`으로 명시한다.
5. Scene에 `modelContainer`를 연결한다.
6. View에서는 DataSource 대신 `@Query`와 predicate를 사용한다.
7. 저장소 I/O 비용을 고려해 필요한 데이터만 가져온다.
8. 런타임 오류를 state, telemetry, alert로 처리한다.
9. 모델 변경에 따른 부가 상태는 Continuous Observation으로 갱신한다.

결과적으로 SwiftData는 상태 관리, 저장, 관계 탐색, 검색, 정렬을 SwiftUI와 자연스럽게 연결해 주며, 앱이 더 안정적이고 확장 가능한 영속성 구조를 갖도록 돕는다.

---

# 함께 보면 좋은 후속 세션 후보

- What’s new in SwiftData
- SwiftData: Dive into inheritance and schema migration
- SwiftUI
- Observation framework
- Data Essentials in SwiftData
- Build document-based apps with SwiftUI
