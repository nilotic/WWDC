# WWDC26 Code-along: Make your app available to Siri 요약

- Session: 344
- Title: Code-along: Make your app available to Siri
- Source: https://developer.apple.com/videos/play/wwdc2026/344/
- Topic: Siri, Apple Intelligence, App Intents, App Schemas, Spotlight
- Chapters: Introduction, App Schemas and the plan, Build the CalendarEntity, Build the AttendeeEntity, Build the EventEntity, Open events with OpenIntent, Onscreen awareness, Create events with Siri, Update events, Custom snippet views, Delete events, Next steps

---

## 한 줄 요약

이 세션은 SwiftUI 캘린더 앱인 CometCal을 예제로 사용해, App Schemas와 App Intents를 적용하여 Siri가 앱의 일정·캘린더·참석자를 이해하고, 화면의 맥락을 파악하며, 일정 생성·수정·삭제까지 자연어 대화로 수행하도록 만드는 과정을 단계별로 설명한다.

---

## 핵심 요약

이번 코드 따라하기의 목표는 기존 앱을 Siri와 Apple Intelligence에 연결하는 것이다.

세션은 크게 네 단계로 구성된다.

1. **앱 콘텐츠를 Siri가 이해하도록 구성**
   - Calendar, Attendee, Event를 App Entity로 표현
   - Calendar 도메인의 App Schemas 채택
   - IndexedEntity와 Spotlight semantic index 활용

2. **화면과 앱 콘텐츠를 연결**
   - OpenIntent로 특정 콘텐츠 열기
   - `appEntityIdentifier`와 `userActivity`로 화면 인지 제공

3. **Siri가 앱 동작을 수행하도록 구성**
   - 일정 생성
   - 일정 수정
   - 일정 삭제
   - 확인과 명확화는 Siri가 처리

4. **결과 표현 개선**
   - custom snippet view로 Siri 결과 카드 사용자화
   - AppIntentsTesting을 통한 자동화 테스트 준비

---

# 1. Siri와 App Intents

Siri는 Apple Intelligence를 기반으로 동작하며, 앱은 App Intents framework를 통해 Siri와 시스템 기능에 콘텐츠와 동작을 제공한다.

App Intents를 적용하면 앱의 기능이 다음과 연결될 수 있다.

- Siri
- Spotlight
- Shortcuts
- Apple Intelligence
- 시스템 검색과 제안

세션에서는 Siri가 다음과 같은 대화를 처리하는 상황을 목표로 삼는다.

- “내 소풍에 누가 와?”
- “일정을 오전 11시 30분으로 바꿔줘.”
- “소풍 참석자 모두에게 변경 내용을 문자로 알려줘.”
- “내가 소풍에 무엇을 가져가야 했지?”
- “그 장소까지 운전해서 얼마나 걸려?”

이러한 작업을 위해 앱이 직접 자연어를 분석하거나 학습 문구를 정의할 필요는 없다.

앱은 자신의 콘텐츠와 동작을 App Schemas로 설명하고, Siri가 자연어 해석과 대화 흐름을 담당한다.

---

# 2. App Schemas

App Schemas는 앱의 콘텐츠와 동작을 Siri가 이미 이해하는 공통 개념으로 설명한다.

스키마는 다음 요소를 정의한다.

| 요소 | 역할 |
|---|---|
| Entity | 앱이 다루는 콘텐츠와 개념 |
| Property | Entity가 가진 데이터 |
| Intent | 앱이 수행할 수 있는 동작 |
| Parameter | Intent가 필요로 하는 입력 |
| Output | 동작 결과 |

App Schemas는 도메인별로 구성된다.

이번 세션에서는 Calendar 도메인을 사용한다.

Calendar 도메인은 다음과 같은 개념을 제공한다.

- Calendar
- Event
- Attendee
- Recurrence
- Location
- Alarm
- 일정 생성·수정·삭제 동작

Xcode에서는 도메인과 스키마 이름을 입력하면 관련 코드 snippet을 자동 완성으로 선택할 수 있다.

예를 들어 `calendar_`를 입력하면 Calendar 도메인에서 사용할 수 있는 Entity와 Intent 스키마가 표시된다.

---

# 3. CometCal 프로젝트

CometCal은 SwiftUI와 SwiftData로 만든 캘린더 앱이다.

기본 기능은 다음과 같다.

- 오늘의 일정 표시
- 일정 상세 조회
- 일정 생성과 수정
- 여러 캘린더 관리
- 참석자와 일정 정보 관리

초기 상태에서는 화면을 통해서만 사용할 수 있다.

세션에서는 CometCal을 다음과 같이 확장한다.

1. Siri가 앱의 콘텐츠를 이해
2. Siri가 앱 콘텐츠에 관한 질문에 답변
3. Siri가 일정 생성·수정·삭제 수행
4. Siri가 현재 화면의 일정 인식
5. Siri 결과에서 앱의 시각적 표현 제공

---

# 4. CalendarEntity 만들기

## App Schema 적용

기존 `CalendarModel`을 Siri가 이해하도록 `CalendarEntity`를 만든다.

Xcode에서 `calendar_calendar` snippet을 선택하면 다음 요소가 생성된다.

- `@AppEntity`
- 스키마 연결
- Entity properties
- `DisplayRepresentation`
- Entity query 기본 구조

```swift
@AppEntity(schema: .calendar.calendar)
struct CalendarEntity {
    typealias DefaultQuery = CalendarEntityQuery

    var id: UUID
    var title: String
}
```

ID는 기존 SwiftData 모델과 맞도록 `UUID`를 사용한다.

## `IndexedEntity`

`CalendarEntity`는 `IndexedEntity`를 채택한다.

```swift
struct CalendarEntity: IndexedEntity {
    // ...
}
```

`IndexedEntity`는 앱 콘텐츠가 Spotlight index에 제공될 수 있는 형태임을 나타낸다.

인덱스에 등록된 콘텐츠는 Siri가 다음 기준으로 찾을 수 있다.

- 이름
- 속성
- 의미
- 대화 맥락
- 화면 맥락

별도의 자연어 검색 코드를 작성하지 않아도 semantic index의 이점을 사용할 수 있다.

---

# 5. 데이터 모델과 Entity 변환

앱 내부의 SwiftData 모델과 App Entity 사이에는 변환 로직이 필요하다.

```swift
extension CalendarEntity {
    init(model: CalendarModel) {
        id = model.id
        title = model.title
    }
}

extension CalendarModel {
    var entity: CalendarEntity {
        CalendarEntity(model: self)
    }
}
```

이 변환은 다음 위치에서 사용된다.

- Entity Query
- Spotlight index 등록
- Intent 결과 반환
- 앱 내부 탐색 연결

App Entity는 앱의 전체 데이터 모델을 그대로 복제하기보다 Siri와 시스템이 이해하고 표시하는 데 필요한 데이터만 포함할 수 있다.

---

# 6. Entity Query와 Dependency

App Intents는 Entity Query를 통해 앱의 데이터를 조회한다.

## `@Dependency`

공유 데이터 계층은 `@Dependency`를 통해 주입한다.

```swift
@Dependency
private var calendarManager: CalendarManager
```

이 방식은 intent나 query가 데이터 관리 객체를 직접 새로 만드는 대신, 앱에서 한 번 등록한 동일한 인스턴스를 사용하게 한다.

## `@MainActor`

`CalendarManager`가 Main Actor에 격리되어 있다면 Query도 `@MainActor`로 지정한다.

```swift
@MainActor
struct CalendarEntityQuery: EntityQuery {
    @Dependency
    private var calendarManager: CalendarManager
}
```

## ID 기반 조회

`EntityQuery`는 시스템이 이미 Entity ID를 알고 있을 때 해당 객체를 가져오는 데 사용된다.

```swift
func entities(for identifiers: [UUID]) async throws -> [CalendarEntity] {
    calendarManager
        .calendars(with: identifiers)
        .map(\.entity)
}
```

## 전체 Entity 제공

일정을 생성할 때 Siri가 사용할 수 있는 캘린더 목록을 제시하려면 `EnumerableEntityQuery`를 채택한다.

```swift
func allEntities() async throws -> [CalendarEntity] {
    calendarManager.calendars.map(\.entity)
}
```

---

# 7. DisplayRepresentation

`DisplayRepresentation`은 Siri와 Spotlight가 Entity를 표시할 때 사용하는 제목과 이미지를 정의한다.

```swift
var displayRepresentation: DisplayRepresentation {
    DisplayRepresentation(
        title: "\(title)",
        image: .init(systemName: "calendar")
    )
}
```

표시 정보는 다음 위치에서 사용된다.

- Spotlight 검색 결과
- Siri 결과 카드
- Shortcuts parameter 선택
- 시스템의 Entity 선택 UI

---

# 8. Spotlight에 Entity 등록

`IndexedEntity`를 채택하는 것만으로 콘텐츠가 자동 등록되지는 않는다.

데이터가 생성·수정·삭제될 때 Spotlight index도 함께 갱신해야 한다.

세션에서는 고유 이름을 가진 `CSSearchableIndex`를 생성한다.

```swift
let searchableIndex = CSSearchableIndex(name: "CometCal")
```

## 생성 시 등록

```swift
try await searchableIndex.indexAppEntities([calendar.entity])
```

## 수정 시 갱신

```swift
try await searchableIndex.indexAppEntities([updatedCalendar.entity])
```

## 삭제 시 제거

```swift
try await searchableIndex.deleteAppEntities(
    identifiedBy: [calendar.id],
    ofType: CalendarEntity.self
)
```

앱의 데이터와 시스템 index 사이의 동기화를 유지하는 것이 중요하다.

---

# 9. AttendeeEntity 만들기

참석자는 `IndexedEntity`가 아닌 `TransientAppEntity`로 구성한다.

```swift
@AppEntity(schema: .calendar.attendee)
struct AttendeeEntity: TransientAppEntity {
    // ...
}
```

## TransientAppEntity를 사용하는 이유

CometCal의 참석자는 독립적인 사람이 아니라 특정 일정에 참여하는 상태를 표현한다.

같은 사람이 여러 일정에 참석할 수 있으므로 각 참석 기록을 별도로 Spotlight에 등록하면 중복 결과가 생길 수 있다.

`TransientAppEntity`는 다음과 같은 경우에 적합하다.

- 임시적인 Entity
- 독립적인 검색 경로가 필요 없는 데이터
- 다른 Entity를 통해서만 접근하는 데이터
- 고유 ID와 Query가 필요 없는 데이터
- Spotlight index에 등록할 필요가 없는 데이터

참석자는 항상 EventEntity를 통해 접근되므로 별도의 query나 index를 만들지 않는다.

---

# 10. IntentPerson과 Schematized Enum

## `IntentPerson`

참석자의 사람 정보는 시스템 표준 타입인 `IntentPerson`으로 표현한다.

`IntentPerson`은 다음 정보를 앱과 시스템 사이에서 전달할 수 있다.

- 이름
- 이메일
- 전화번호
- 연락처 식별 정보

이를 통해 일정 참석자를 Mail이나 Messages 같은 다른 앱의 동작으로 전달할 수 있다.

## Schematized `AppEnum`

Calendar 도메인은 참석자의 상태와 종류를 표현하는 enum 스키마를 제공한다.

```swift
@AppEnum(schema: .calendar.attendeeStatus)
enum AttendeeStatus {
    // ...
}
```

```swift
@AppEnum(schema: .calendar.attendeeType)
enum AttendeeType {
    case person
}
```

앱 내부 모델의 용어가 스키마와 다르더라도 해당 의미에 맞는 schema case로 매핑하면 된다.

---

# 11. EventEntity 만들기

`EventEntity`는 이번 예제의 중심 Entity다.

```swift
@AppEntity(schema: .calendar.event)
struct EventEntity: IndexedEntity {
    // ...
}
```

EventEntity를 Spotlight에 등록하면 Siri가 다음과 같은 질문을 처리할 수 있다.

- “Crew Lunch는 언제야?”
- “메모에 oxygen이 포함된 일정이 있어?”
- “소풍 참석자는 누구야?”
- “이 일정은 어느 캘린더에 있어?”

## Entity 간 관계

EventEntity는 앞에서 만든 Entity를 조합한다.

```swift
var calendar: CalendarEntity
var attendees: [AttendeeEntity]
```

App Schemas를 사용하면 Siri가 Event, Calendar, Attendee 사이의 관계를 이해할 수 있다.

## 필수와 선택 속성

스키마가 정의하는 모든 속성을 앱에서 사용할 필요는 없다.

- 필수 속성은 앱 모델과 연결
- 사용하지 않는 선택 속성은 비워둘 수 있음
- 앱에만 있는 고유 속성도 Entity에 추가 가능

예를 들어 앱에서 사용하지 않는 `travelTime`이나 `virtualLocation`은 설정하지 않아도 된다.

반대로 앱 모델에만 있는 `isFavorite` 같은 속성은 추가로 포함할 수 있다.

---

# 12. 반복 일정과 Union Value

## Recurrence

반복 일정은 Foundation의 `Calendar.RecurrenceRule`로 표현한다.

```swift
var recurrence: Calendar.RecurrenceRule?
```

앱 내부의 단순한 반복 주기 enum과 다음과 같이 변환할 수 있다.

- daily
- weekly
- monthly
- yearly

## Union Value

스키마의 일부 property는 여러 타입 중 하나를 받을 수 있다.

예를 들어 일정 위치는 다음 중 하나가 될 수 있다.

- `PlaceDescriptor`
- `String`

알람은 다음 중 하나로 표현할 수 있다.

- `Duration`
- `Date`

이런 property를 union value라고 한다.

App Schema snippet은 union value를 구현하는 기본 타입과 구조를 제공한다.

---

# 13. Siri에서 콘텐츠 검색하기

CalendarEntity, AttendeeEntity, EventEntity를 구성하고 Spotlight에 등록하면 Siri가 앱 콘텐츠에 관한 질문에 답할 수 있다.

세션의 예시는 다음과 같다.

- “Meteor Shower Party가 곧 열려?”
- “그 장소의 날씨는 어때?”
- “관측하기 가장 좋은 시간은 언제야?”

Siri는 앱의 Entity와 property를 사용해 답변하고, 결과를 탭하면 앱으로 이동할 수 있다.

앱이 자연어 검색이나 질문별 코드를 작성하는 것이 아니라, Entity와 App Schemas가 의미 구조를 제공한다.

---

# 14. OpenIntent로 특정 콘텐츠 열기

Siri나 Spotlight에서 Event를 탭했을 때 앱의 메인 화면이 아니라 해당 일정의 상세 화면을 열어야 한다.

이를 위해 `system.open` schema를 채택한 Intent를 만든다.

```swift
@AppIntent(schema: .system.open)
struct OpenEventIntent {
    var target: EventEntity

    @Dependency
    private var navigationManager: NavigationManager

    func perform() async throws -> some IntentResult {
        navigationManager.openEvent(target.id)
        return .result()
    }
}
```

이 Intent는 다음 상황에서 호출될 수 있다.

- Siri 결과의 일정 탭
- Spotlight 검색 결과 탭
- “이 일정 열어줘” 요청
- 다른 시스템 경험에서 Entity 열기

OpenIntent는 시스템의 Entity와 앱 내부 navigation 사이를 연결한다.

---

# 15. 화면 인지

Siri가 “이 일정”, “세 번째 일정”처럼 화면의 콘텐츠를 자연스럽게 참조하려면 View와 Entity를 연결해야 한다.

세션에서는 두 개의 modifier를 사용한다.

## 목록 화면: `appEntityIdentifier`

일정 목록의 각 항목에 Entity identifier를 연결한다.

```swift
.appEntityIdentifier(
    EntityIdentifier(for: event.entity)
)
```

이를 통해 Siri는 화면에 어떤 일정들이 표시되어 있는지 이해한다.

사용자는 다음처럼 말할 수 있다.

- “세 번째 일정 열어줘.”
- “이 목록에서 오후 일정만 알려줘.”
- “두 번째 일정 참석자에게 메시지 보내줘.”

## 상세 화면: `userActivity`

상세 화면에서는 현재 중심 콘텐츠를 `userActivity`로 제공한다.

```swift
.userActivity(
    EntityIdentifier(for: event.entity)
)
```

이를 통해 Siri는 현재 화면의 Event를 정확히 식별한다.

사용자는 전체 제목을 말하지 않고도 다음과 같이 요청할 수 있다.

- “이 일정 참석자에게 이메일 보내줘.”
- “이 일정을 한 시간 늦춰줘.”
- “여기에 메모를 추가해줘.”

---

# 16. Siri로 일정 생성하기

일정 생성은 `calendar_createEvent` schema를 사용한다.

Xcode snippet은 다음 요소를 생성한다.

- `@AppIntent`
- Calendar create-event schema
- 필요한 parameter
- `perform()` stub

```swift
@AppIntent(schema: .calendar.createEvent)
struct CreateEventIntent {
    var title: String
    var startDate: Date
    var calendar: CalendarEntity
    // ...
}
```

## perform의 일반적인 구조

1. Intent parameter를 앱 데이터 형식으로 변환
2. union value와 recurrence 변환
3. 데이터 계층에서 일정 생성
4. 생성 결과를 EventEntity로 반환

```swift
@MainActor
func perform() async throws -> some IntentResult & ReturnsValue<EventEntity> {
    let event = try calendarManager.createEvent(
        title: title,
        startDate: startDate
    )

    return .result(value: event.entity)
}
```

Siri는 App Schema를 바탕으로 다음 작업을 처리한다.

- 사용자의 자연어 해석
- 누락된 parameter 질문
- 애매한 값 명확화
- 실행 전 확인
- 결과 전달

앱은 일정 생성 로직에 집중하면 된다.

---

# 17. Siri로 일정 수정하기

수정 Intent는 `calendar_updateEvent` schema를 사용한다.

```swift
@AppIntent(schema: .calendar.updateEvent)
struct UpdateEventIntent {
    var event: EventEntity
    var title: String?
    var startDate: Date?
    var recurrence: Calendar.RecurrenceRule?
}
```

생성 Intent와 달리 대부분의 parameter가 optional이다.

사용자는 한 번에 일부 속성만 수정할 수 있다.

- 시간만 변경
- 제목만 변경
- 캘린더 이동
- 반복 일정 추가
- 반복 설정 제거

---

# 18. Optional Parameter의 상태 구분

수정 Intent에서 `nil`은 두 가지 의미를 가질 수 있다.

1. 해당 속성을 변경하지 않음
2. 기존 값을 명시적으로 제거

단순한 nil 검사로는 두 상황을 구분할 수 없다.

`@AppIntent` macro는 parameter를 `IntentParameter`로 감싸고 `valueState`를 제공한다.

| 상태 | 의미 |
|---|---|
| `.set(value)` | 새로운 값으로 변경 |
| `.set(nil)` | 기존 값을 명시적으로 제거 |
| `.unset` | 이번 요청에서 해당 속성을 변경하지 않음 |

예를 들어 반복 일정을 수정할 때 다음을 구분할 수 있다.

- “매주 반복해줘” → `.set(recurrence)`
- “반복하지 않게 해줘” → `.set(nil)`
- 반복에 대한 언급 없음 → `.unset`

이 패턴은 값을 지우는 동작이 의미 있는 모든 optional parameter에 적용할 수 있다.

---

# 19. Custom Snippet View

Intent가 결과를 반환하면 Siri는 기본적으로 Entity의 `DisplayRepresentation`을 사용해 결과 카드를 구성한다.

앱의 개성과 더 많은 정보를 보여주려면 custom snippet view를 사용할 수 있다.

```swift
func perform() async throws
    -> some IntentResult
    & ReturnsValue<EventEntity>
    & ShowsSnippetView {
    // ...
}
```

결과와 함께 SwiftUI view를 반환한다.

```swift
return .result(
    value: updatedEvent.entity,
    view: EventSnippetView(event: updatedEvent.entity)
)
```

Custom snippet view를 통해 다음을 표현할 수 있다.

- 앱의 색상과 스타일
- 핵심 정보 배치
- 아이콘
- 일정 시간과 장소
- 업데이트 결과

Snippet view는 간결하고 가볍게 구성하는 것이 권장된다.

---

# 20. Siri로 일정 삭제하기

삭제 Intent는 일정과 반복 범위를 parameter로 받는다.

```swift
@AppIntent(schema: .calendar.deleteEvent)
struct DeleteEventIntent {
    var event: EventEntity
    var span: EventSpan?
}
```

`perform()`에서는 대상 일정을 찾아 삭제한다.

위험하거나 되돌리기 어려운 동작에 대해서는 Siri가 자동으로 확인을 요청한다.

세션에서는 다음 흐름을 보여준다.

- “그 파티 삭제해줘.”
- Siri가 삭제 확인 요청
- 사용자가 승인하면 삭제
- 여러 일정이 일치하면 Siri가 대상을 명확히 확인
- 사용자가 취소하면 동작하지 않음

앱이 별도의 자연어 확인 대화를 구현할 필요 없이 schema와 intent 구성을 통해 시스템이 처리한다.

---

# 21. 구현 흐름 정리

이번 세션의 전체 구현 흐름은 다음과 같다.

| 단계 | 구성 |
|---|---|
| 1 | 기존 앱 데이터 모델 확인 |
| 2 | 적절한 App Schema Domain 선택 |
| 3 | CalendarEntity 생성 |
| 4 | IndexedEntity와 EntityQuery 적용 |
| 5 | Spotlight에 생성·수정·삭제 동기화 |
| 6 | AttendeeEntity를 TransientAppEntity로 구성 |
| 7 | EventEntity와 관련 Entity 관계 연결 |
| 8 | OpenIntent로 상세 화면 이동 |
| 9 | 화면의 View와 Entity 연결 |
| 10 | CreateEventIntent 구현 |
| 11 | UpdateEventIntent와 optional state 처리 |
| 12 | Custom snippet view 구성 |
| 13 | DeleteEventIntent 구현 |
| 14 | Siri 대화와 Spotlight 검색 테스트 |
| 15 | AppIntentsTesting으로 자동화 테스트 |

---

# 22. 개발자 체크 포인트

- [ ] 앱 콘텐츠에 맞는 App Schema Domain이 있는지 확인
- [ ] 데이터 모델과 App Entity 사이의 변환 경계를 명확히 구성
- [ ] 독립적으로 검색할 Entity만 `IndexedEntity`로 정의
- [ ] 임시적이거나 상위 Entity에 종속된 데이터는 `TransientAppEntity` 검토
- [ ] Entity 생성·수정·삭제 시 Spotlight index를 함께 갱신
- [ ] `DisplayRepresentation`에 명확한 제목과 이미지 제공
- [ ] Entity Query에서 앱의 동일한 데이터 계층을 `@Dependency`로 사용
- [ ] Main Actor 격리된 데이터 계층과 Query의 actor isolation 일치
- [ ] Entity 간 관계가 schema property에 정확히 반영되는지 확인
- [ ] 사용하지 않는 optional schema property는 불필요하게 채우지 않기
- [ ] OpenIntent가 앱의 실제 navigation과 연결되는지 확인
- [ ] 목록과 상세 화면에 적절한 화면 인지 modifier 적용
- [ ] 생성·수정 Intent에서 schema parameter를 앱 모델로 안전하게 변환
- [ ] 수정 Intent의 optional parameter에서 `.set(nil)`과 `.unset` 구분
- [ ] 삭제와 같은 위험 동작의 확인 흐름 테스트
- [ ] Custom snippet view를 단순하고 빠르게 렌더링되도록 구성
- [ ] Siri 결과의 접근성, Dynamic Type, localization 확인
- [ ] AppIntentsTesting으로 Entity resolution과 Intent 실행 테스트

---

# 함께 보면 좋은 세션

- Build intelligent Siri experiences with App Schemas
- Explore advanced App Intents features for Siri and Apple Intelligence
- Get to know App Intents
- Making app entities available in Spotlight
- Making actions and content discoverable by Apple Intelligence
- Providing contextual cues to Apple Intelligence and Siri
