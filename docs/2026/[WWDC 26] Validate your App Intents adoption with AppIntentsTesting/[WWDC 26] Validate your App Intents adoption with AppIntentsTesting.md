# WWDC26 — Validate your App Intents adoption with AppIntentsTesting

- **Session:** 295
- **Source:** https://developer.apple.com/videos/play/wwdc2026/295/
- **Framework:** AppIntentsTesting
- **Basis:** Apple Developer 공식 전체 transcript, Code 섹션, App Intents Testing 공식 문서
- **Sample app:** CometCal

---

## 🎯 한 줄 요약

`AppIntentsTesting`은 App Intent를 앱 코드와 직접 링크한 unit test가 아니라 **XCUITest 번들에서 앱을 별도 프로세스로 실행하고 실제 App Intents infrastructure를 통과시켜 검증하는 out-of-process integration testing framework**다. Intent 실행뿐 아니라 entity/query resolution, 여러 intent chaining, test-only intent를 이용한 상태 준비, Spotlight indexing, View Annotations까지 자동화할 수 있다.

---

## 🧭 세션 구성

| 시간 | 내용 |
|---|---|
| 0:16 | Introduction |
| 2:01 | Meet CometCal: your first test |
| 2:29 | How AppIntentsTesting works |
| 9:39 | Testing entity queries |
| 13:49 | Combining multiple intents |
| 16:27 | Test-only intents |
| 18:22 | Testing Spotlight indexing |
| 20:56 | Testing view annotations |
| 24:00 | The App Intents testing workflow |
| 25:19 | Next steps |

---

## 🧩 왜 AppIntentsTesting이 필요한가

App Intents는 앱 내부 기능에만 머물지 않는다. 동일한 intent/entity/query가 다음과 같은 시스템 경험을 구성한다.

- Siri
- Shortcuts
- Spotlight
- Widgets 및 기타 system surfaces

문제는 앱 UI 자체가 정상이어도 App Intents integration만 조용히 깨질 수 있다는 점이다. 예를 들어 entity query가 잘못되면 Siri나 Shortcuts가 올바른 엔티티를 찾지 못하고, Spotlight donation 코드가 빠지면 앱 안에서는 데이터가 정상인데 시스템 검색에는 나타나지 않는다.

`AppIntentsTesting`은 이러한 경로를 mock으로 흉내 내는 것이 아니라 **사용자가 실제로 거치는 App Intents stack과 같은 경로**로 실행한다.

---

# 🏗️ 테스트 구조: UI Testing target + 별도 앱 프로세스

가장 중요한 구조적 특징은 테스트 target이 앱 target을 import하지 않는다는 점이다.

- 테스트는 **표준 UI Testing bundle(XCUITest bundle)** 안에 둔다.
- 테스트 runner와 앱은 서로 다른 프로세스에서 동작한다.
- 테스트는 앱의 bundle identifier로 App Intents 정의를 찾는다.
- App Intent는 실제 앱 프로세스에서 실행된다.
- test target은 앱의 Swift 타입이나 내부 state를 직접 공유하지 않는다.

따라서 일반 unit test와 달리 앱 내부 구현 구조에 덜 결합된다. UI hierarchy에도 의존하지 않기 때문에 화면 리디자인이 App Intents 테스트를 바로 깨뜨리지 않는다.

### Code signing 주의

AppIntentsTesting을 사용하려면 **test runner와 앱이 동일한 development team으로 code signing**되어야 한다. 새 UI Testing target을 만들 때 Team 설정을 앱과 맞춘다.

---

# 🚀 첫 번째 테스트: `IntentDefinitions`

테스트의 시작점은 `IntentDefinitions`다.

```swift
import AppIntentsTesting

let definitions = IntentDefinitions(
    bundleIdentifier: "com.example.apple-samplecode.CometCal"
)
```

이 객체를 통해 앱이 등록한 intent, entity, enum, query 정의에 접근한다. 앱을 직접 import하지 않으므로 대부분 **문자열 이름**으로 찾는다.

예를 들어 `CreateCalendarIntent`를 실행하는 흐름은 다음과 같다.

```swift
let createCalendar = definitions.intents["CreateCalendarIntent"]

let result = try await createCalendar
    .makeIntent(
        name: "Occupy Saturn",
        color: "red"
    )
    .run()

XCTAssertEqual(try result.value.title, "Occupy Saturn")
```

핵심 단계는 네 가지다.

1. `IntentDefinitions`에서 intent definition을 찾는다.
2. `makeIntent(...)`로 parameter를 채운다.
3. `run()`으로 실제 앱에서 intent를 실행한다.
4. 반환값을 assertion한다.

`run()` 결과는 dynamic member lookup을 지원하므로 앱의 실제 `CalendarEntity` 타입을 import하지 않아도 `result.value.title`처럼 property 이름으로 결과를 검사할 수 있다.

---

## 🔤 Parameter 변환과 문자열 기반 API

App Intents Testing은 test target이 앱 타입을 직접 참조하지 않기 때문에 parameter 이름과 custom type에 compile-time autocomplete가 없다. 따라서 **intent에 선언된 parameter label을 정확히 써야 한다.**

기본 타입은 framework가 알아서 변환한다.

- `String`
- `Date`
- `Bool`
- 기타 지원 primitive
- `AppEnum`의 raw string value

세션 예제에서는 enum color에 `"red"`를 넘기면 runtime이 올바른 enum 값으로 변환한다.

Custom type을 직접 넘겨야 하는 경우에는 Apple 문서의 `IntentValueConvertibleWrapper`를 확인한다.

---

# 🔄 실제 infrastructure를 거치는 integration test

`AppIntentsTesting`의 의미는 단순히 `perform()`을 직접 호출하는 것과 다르다.

- Siri/Shortcuts가 사용하는 것과 같은 App Intents infrastructure를 통과한다.
- mock이나 stub이 필요하지 않다.
- app/test runner 간 shared state가 없다.
- 앱 내부 코드의 재구성에 영향을 덜 받는다.
- UI automation target이므로 기존 CI pipeline에서도 함께 실행할 수 있다.

Apple은 이 테스트를 App Intents adoption의 foundational behavior를 검증하는 **integration-oriented testing layer**로 설명한다.

---

# 🔎 Entity query 테스트

Entity는 Siri, Shortcuts, Spotlight가 앱의 데이터를 찾는 핵심 단위다. Query가 잘못되면 시스템에서 올바른 대상을 resolve할 수 없다.

CometCal 예제에서는 `EventEntity`의 string query를 test-driven 방식으로 구현한다.

```swift
let results = try await eventEntityDefinition
    .entities(matching: "Cosmic Ray")

XCTAssertEqual(results.count, 1)
XCTAssertEqual(
    try results[0].title,
    "Cosmic Ray Calibration"
)
```

처음에는 `EntityStringQuery`가 구현되어 있지 않기 때문에 테스트가 실패한다. 그런 다음 실제 앱 코드에 `EntityStringQuery` conformance와 `entities(matching:)` 구현을 추가하고 테스트를 다시 실행한다.

```swift
struct EventEntityQuery: EntityStringQuery {
    func entities(matching string: String) async throws -> [EventEntity] {
        try calendarManager.fetchEvents()
            .filter { $0.title.localizedCaseInsensitiveContains(string) }
            .map(\.entity)
    }

    // identifiers / suggestedEntities 구현은 앱 요구사항에 맞게 제공
}
```

이 테스트가 통과하면 앱 내부 함수 하나만 검증한 것이 아니라, App Intents를 통해 **실제 string query가 on-device에서 resolve되는 전체 경로**를 확인한 것이다.

### Query testing이 중요한 이유

Shortcuts에서 entity parameter를 선택하거나 Siri가 이름을 바탕으로 대상을 찾을 때 query가 사용된다. 즉 query regression은 앱 UI 테스트로 잘 드러나지 않는다.

---

# 🔗 여러 Intent를 하나의 테스트에서 연결하기

실제 Shortcut은 하나의 intent만 실행하는 경우보다, 앞 단계의 결과를 다음 intent에 넘기는 경우가 많다. AppIntentsTesting도 이러한 chaining을 그대로 테스트할 수 있다.

CometCal 예제:

1. `CreateEventIntent` 실행
2. 반환된 `EventEntity`를 획득
3. 그 entity를 `UpdateEventIntent`의 parameter로 직접 전달
4. 변경된 결과를 assertion

```swift
let createResult = try await createEventDefinition
    .makeIntent(
        title: "Asteroid Dodgeball Practice",
        startDate: Date(),
        isAllDay: false,
        calendar: "Deep Space"
    )
    .run()

let updateResult = try await updateEventDefinition
    .makeIntent(
        title: "Asteroid Dodgeball Rules Overview",
        event: createResult.value
    )
    .run()

XCTAssertEqual(
    try updateResult.value.title,
    "Asteroid Dodgeball Rules Overview"
)
```

### Entity parameter에 문자열을 넘길 수도 있음

`calendar` parameter가 `CalendarEntity`를 받더라도 예제처럼 `"Deep Space"` 문자열을 넘길 수 있다. Runtime은 연결된 entity string query를 사용해 일치하는 entity를 resolve한다.

이 기능을 이용하면 다음을 한 테스트에서 검증할 수 있다.

- Entity query resolution
- Intent parameter resolution
- 첫 intent 결과 전달
- 두 번째 intent의 entity 입력 처리
- 최종 결과

즉 Shortcut composition과 상당히 비슷한 실제 흐름을 자동화한다.

---

# 🧪 Test-only intents

Integration test가 안정적이려면 매 테스트가 동일한 초기 상태에서 시작해야 한다. UI automation으로 앱 화면을 여러 번 눌러 seed data를 만드는 방식은 느리고 UI 변경에도 취약하다.

Apple은 이 문제에 **test-only intent**를 사용한다.

```swift
#if DEBUG
struct SeedSampleEventsIntent: AppIntent {
    static let isDiscoverable = false

    func perform() async throws -> some IntentResult {
        // 테스트에 필요한 known data 생성
        return .result()
    }
}
#endif
```

두 가지 보호 장치를 함께 사용한다.

### `isDiscoverable = false`

이 intent가 Siri나 Shortcuts 등 일반 system surface에 노출되지 않게 한다.

### `#if DEBUG`

Release build에는 test-only intent 자체가 포함되지 않게 한다.

### 활용 예

- Database reset
- Known seed data 생성
- 특정 화면으로 바로 navigation
- 테스트용 state 변경
- 아직 App Intents로 공개하지 않은 내부 기능을 testing hook으로 감싸기

이렇게 하면 UI hierarchy와 무관한 deterministic setup이 가능하다.

---

# 🔦 Spotlight indexing 테스트

앱의 데이터가 정상적으로 존재한다고 해서 Spotlight에도 반드시 존재하는 것은 아니다. 세션의 실제 버그는 event 생성 코드에서 Spotlight indexing 호출을 임시로 주석 처리한 뒤 다시 복구하지 않은 상황이다.

앱 자체는 정상처럼 보이지만 Spotlight에서만 검색이 실패한다.

AppIntentsTesting은 `spotlightQuery(_:)`를 통해 이 integration을 직접 검사한다.

```swift
let before = try await eventEntityDefinition
    .spotlightQuery("Supernova Viewing Party")

XCTAssertTrue(before.isEmpty)

// CreateEventIntent로 event 생성

let after = try await eventEntityDefinition
    .spotlightQuery("Supernova Viewing Party")

XCTAssertEqual(after.count, 1)
XCTAssertEqual(
    try after[0].title,
    "Supernova Viewing Party"
)
```

좋은 regression test 흐름은 다음과 같다.

1. 생성 전 Spotlight 결과가 비어 있는지 확인
2. 실제 App Intent로 entity 생성
3. 다시 Spotlight를 query
4. 결과 count와 entity property 확인

`spotlightQuery(nil)`을 사용하면 해당 entity type의 전체 indexed entities를 확인하는 방식도 공식 문서에서 제공한다.

---

# 👁️ View Annotations 테스트

View Annotation은 Siri가 현재 화면에 어떤 `AppEntity`가 보이는지 이해하도록 돕는다. 사용자가 “이 이벤트 몇 시야?”처럼 모호한 표현을 써도 현재 화면 annotation이 있으면 Siri가 대상을 resolve할 수 있다.

CometCal 예제에서는 다음 흐름을 검증한다.

1. Test-only/open intent를 이용해 특정 event 화면으로 이동
2. 필요하면 XCUI Automation으로 실제 화면을 간단히 확인
3. 해당 entity definition에서 `viewAnnotations()` 호출
4. annotation 개수 확인
5. annotation의 `entity` property를 통해 정확한 대상인지 검사

```swift
try await openEventDefinition
    .makeIntent(target: "Morning Launch Briefing")
    .run()

let annotations = try await eventEntityDefinition
    .viewAnnotations()

XCTAssertEqual(annotations.count, 1)
XCTAssertEqual(
    try annotations[0].entity.title,
    "Morning Launch Briefing"
)
```

세션에서는 이 테스트가 실제로 실패하면서 `EntityIdentifier`에 event id 대신 calendar id가 들어간 버그를 발견한다. Identifier를 올바른 event id로 수정한 뒤 테스트가 통과한다.

공식 문서에 따르면 `ViewAnnotation`에는 entity 외에도 `isSelected`가 있어 UI에서 현재 선택된 entity인지까지 검사할 수 있다.

---

# 📦 Entity와 enum을 다루는 방식

`IntentDefinitions`는 intent 외에도 entity와 enum definition을 제공한다.

### Entity string lookup

```swift
let calendarDefinition = definitions.entities["CalendarEntity"]
let calendars = try await calendarDefinition.entities(matching: "Work")
```

반환되는 entity 표현도 dynamic member lookup을 지원한다.

### Known identifier로 entity reference 생성

공식 문서에서는 `makeReference(identifier:)`를 통해 이미 아는 identifier에서 entity reference를 만들 수 있다.

```swift
let calendar = definitions.entities["CalendarEntity"]
    .makeReference(identifier: "work-calendar-id")
```

### Enum case 구성

Enum definition에서는 raw string에서 case를 만들 수 있다.

```swift
let priority = definitions.enums["EventPriority"]
    .makeCase("high")
```

---

# 📤 Transferable까지 검증 가능

공식 App Intents Testing 문서는 세션에서 다루는 범위를 넘어 `Transferable` conformance도 테스트할 수 있음을 설명한다.

Entity를 export한 후 다시 resolve하여 필요한 property가 보존되는지 확인하는 방식이다.

이 검증은 다음과 같은 기능과 관련된 serialization regression을 찾는 데 유용하다.

- drag and drop
- copy/paste
- 앱 간 데이터 전달
- Siri multi-turn interaction에 필요한 entity transfer

이 부분은 **세션 transcript의 핵심 데모가 아니라 공식 App Intents Testing 문서에서 확장되는 기능**이다.

---

# 🧠 App Intents 테스트를 층으로 나누기

세션 마지막은 AppIntentsTesting을 전체 개발 workflow에서 어디에 놓을지 정리한다.

## 1. Fundamental types 검증

먼저 앱의 핵심 App Intents 모델을 확인한다.

- Actions / intents
- Data / entities
- Queries
- Enums

여기서는 intent가 실행되고 entity/query가 올바르게 resolve되는지 자동화한다.

## 2. System integration 검증

기본 동작이 안정화되면 시스템과 연결되는 integration을 테스트한다.

- Spotlight indexing
- View annotations
- Intent chaining
- Cross-app/entity transfer

## 3. 최종 사용자 경험은 수동 테스트도 필요

자동화 테스트만으로 끝내지 않는다. 실제 사용자가 경험하는 방식으로 다음을 직접 확인한다.

- Siri
- Shortcuts app

AppIntentsTesting은 이 수동 검증을 대체하기보다, regression을 빠르게 잡아주는 자동화 layer로 사용한다.

---

# ⚙️ CI에 적용할 때의 설계 포인트

세션의 구조를 실제 프로젝트에 적용하면 다음 패턴이 유용하다.

### 공통 `IntentDefinitions` 재사용

테스트마다 bundle identifier와 entity/intent definition을 반복 생성하기보다 `setUp`에서 준비한다.

### 매 테스트의 상태 독립성

테스트끼리 데이터가 누적되면 결과가 순서에 따라 달라진다. Seed/reset intent를 만들어 모든 테스트가 known state에서 시작하도록 한다.

### 문자열 이름을 상수화

Test target이 앱 타입을 import하지 않기 때문에 intent/entity 이름 오타는 중요한 실패 원인이 된다. 반복 문자열은 테스트 쪽 상수로 정리하면 관리가 쉽다.

### UI automation은 필요한 곳에만 혼합

App Intents 자체 검증에는 UI가 필요 없다. 다만 View Annotation 테스트처럼 “올바른 화면이 실제로 표시되었다”는 보조 확인에는 같은 XCUITest bundle의 `XCUIApplication`을 사용할 수 있다.

### 시스템 integration regression을 commit 단위로 확인

Apple은 이 테스트들이 가볍고 빠르며 CI에서 자주 실행하기에 적합하다는 점을 강조한다. 특히 Spotlight와 query 문제처럼 앱 내부 테스트만으로 놓치기 쉬운 regression을 commit 단계에서 잡는 것이 가치가 크다.

---

# ⚠️ 주의할 점

- UI Testing target을 사용한다. 일반 unit test target이 아니다.
- Test runner와 앱의 signing team이 같아야 한다.
- Test target은 앱 module을 import하지 않는다.
- Intent/entity를 문자열 이름으로 찾으므로 parameter 이름과 type 정보를 직접 정확히 맞춰야 한다.
- Dynamic member lookup도 property 이름이 틀리면 테스트가 실패한다.
- Test-only intent는 `isDiscoverable = false`와 `#if DEBUG`로 production 노출을 막는다.
- 각 테스트는 seed/reset을 통해 self-contained하게 만든다.
- Spotlight나 View Annotation처럼 시스템 상태가 개입되는 기능은 앱 내부 저장소만 검사해서는 충분하지 않다.
- 자동화가 성공해도 Siri/Shortcuts의 최종 interaction은 별도로 직접 확인한다.

---

# 📋 도입 체크리스트

## 테스트 target
- [ ] XCUITest bundle 생성 또는 기존 UI Testing target 사용
- [ ] 앱과 동일한 development team 설정
- [ ] `AppIntentsTesting` import
- [ ] Bundle identifier로 `IntentDefinitions` 생성

## Intent
- [ ] Intent 이름 lookup 테스트
- [ ] `makeIntent(...)` parameter label 확인
- [ ] Primitive / AppEnum parameter conversion 확인
- [ ] `run()` 결과 검사
- [ ] 반환 entity property를 dynamic member lookup으로 assertion

## Entity / Query
- [ ] `entities(matching:)`로 string query 테스트
- [ ] identifier 기반 resolve가 필요한 경우 reference 테스트
- [ ] suggested/query behavior에 regression test 추가
- [ ] Query 변경이 Siri/Shortcuts resolution에 미치는 영향 확인

## Workflow
- [ ] 여러 intent의 result → parameter chaining 테스트
- [ ] 실제 Shortcut에서 중요한 multi-step flow를 end-to-end로 검증

## Test-only intent
- [ ] Reset/seed intent 작성
- [ ] `isDiscoverable = false`
- [ ] `#if DEBUG`로 release build 제외
- [ ] UI navigation 대신 테스트 전용 navigation intent 검토

## System integration
- [ ] `spotlightQuery()`로 indexing 검증
- [ ] 생성 전/후 Spotlight 결과 비교
- [ ] `viewAnnotations()`로 onscreen entity 확인
- [ ] 필요 시 `isSelected` 상태 확인
- [ ] Transferable 사용 앱은 export/resolve round trip 검토

## 운영
- [ ] CI에 AppIntentsTesting suite 포함
- [ ] 테스트별 known state 보장
- [ ] 문자열 식별자를 테스트 상수로 관리
- [ ] 실제 Siri/Shortcuts 수동 검증 병행

---

# 💡 이 세션이 강조하는 핵심

App Intents adoption을 제대로 검증하려면 `perform()` 함수만 unit test해서는 충분하지 않다. 실제 제품에서 중요한 것은 **시스템이 intent를 찾고, parameter를 resolve하고, entity query를 실행하고, Spotlight와 View Annotation 같은 system integration까지 연결하는 전체 경로**다.

`AppIntentsTesting`은 이 경로를 테스트 target에서 앱 내부 타입을 직접 가져오지 않은 채 실제 infrastructure를 통해 실행한다. 그 결과 App Intents의 내부 구현보다 **사용자가 Siri·Shortcuts·Spotlight에서 실제로 겪는 계약(contract)**에 가까운 테스트를 만들 수 있다.

특히 이 세션의 패턴은 다음 세 가지로 요약할 수 있다.

1. **Intent를 문자열 기반으로 실제 앱 프로세스에서 실행한다.**
2. **Test-only intent로 환경을 deterministic하게 만든다.**
3. **앱 바깥에서 보이는 Spotlight/View Annotation까지 regression test로 끌어온다.**

---

# 🔗 함께 보면 좋은 자료

- [WWDC26 — Validate your App Intents adoption with AppIntentsTesting](https://developer.apple.com/videos/play/wwdc2026/295/)
- [Apple Developer — App Intents Testing](https://developer.apple.com/documentation/AppIntentsTesting)
- [Apple Developer — Testing your App Intents code](https://developer.apple.com/documentation/AppIntentsTesting/testing-your-app-intents-code)
- WWDC26 — Build intelligent Siri experiences with App Schemas
- WWDC26 — Code-along: Make your app available to Siri
- WWDC26 — Explore advanced App Intents features for Siri and Apple Intelligence

