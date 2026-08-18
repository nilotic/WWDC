# WWDC26 Explore advanced App Intents features for Siri and Apple Intelligence 요약

- Session: 343
- Title: Explore advanced App Intents features for Siri and Apple Intelligence
- Source: https://developer.apple.com/videos/play/wwdc2026/343/
- Topic: App Intents, Siri, Apple Intelligence, App Schemas, Spotlight, Onscreen Awareness, System Integrations
- Chapters: Introduction, Customize how Siri responds, Visual responses, Interaction donations, Confirmations and entity ownership, Semantic index with IndexedEntity, Structured search with IntentValueQuery, In-app search, Onscreen awareness, Leverage existing integrations, Next steps

---

## 한 줄 요약

고급 App Intents 경험은 단순히 Siri가 앱의 intent를 호출하게 만드는 것을 넘어, **앱만의 dialog와 visual response를 제공하고, UI에서 일어난 행동을 donate하며, shared/public entity의 ownership을 알려 confirmation을 더 안전하게 만들고, Spotlight·IntentValueQuery·searchInApp으로 콘텐츠를 찾게 하며, onscreen annotation과 Notification·Now Playing·AlarmKit의 entity annotation으로 사용자가 지금 보고 듣는 맥락까지 Siri가 이해하게 만드는 것**이다.

---

## 핵심 요약

이번 세션은 App Intents와 App Schemas의 기본 도입 이후 경험을 더 정교하게 만드는 방법을 다룬다.

- **Siri 응답 커스터마이징**
  - 빈 `IntentResult`를 반환하면 Siri가 응답을 구성
  - `ProvidesDialog`와 `IntentDialog`로 앱의 표현 방식에 맞는 응답 제공
  - `full` string은 AirPods 같은 voice-only 환경에서도 단독으로 의미가 완전해야 함
  - intent 실행 중 `$parameter.requestValue(...)`로 clarification 요청 가능

- **Visual response**
  - `DisplayRepresentation`에 title, subtitle, image 제공
  - response, disambiguation, Spotlight, Shortcuts 전반에 재사용
  - `ShowsSnippetView`로 특정 intent에 SwiftUI custom snippet 제공

- **Interaction Donations**
  - Siri/Shortcuts를 통해 수행된 intent는 시스템이 이미 알고 있음
  - 앱 UI에서 사용자가 수행한 action은 직접 `IntentDonationManager`로 donate해야 함
  - preference 학습과 ongoing activity context에 활용
  - 지나친 donation은 시스템이 무시할 수 있으므로 실제 user behavior만 정확하게 donate

- **Confirmation과 Entity Ownership**
  - side effect가 있는 action은 Siri가 confirmation을 수행할 수 있음
  - shared/public entity를 정확히 알려주기 위해 `OwnershipProvidingEntity` 사용
  - `.shared`, `.public`, `.unknown` 등 ownership state를 최신 상태로 제공

- **콘텐츠 발견**
  - Local content: `IndexedEntity` + `CSSearchableIndex.indexAppEntities`
  - Reindexing: 새 `IndexedEntityQuery`
  - Large/server/frequently changing content: `IntentValueQuery`
  - 앱 자체 검색 UI에서 결과를 보여주기: `.system.searchInApp`

- **Onscreen Awareness**
  - Primary item: `NSUserActivity`
  - 화면의 여러 item 중 하나: `.appEntityIdentifier`
  - List / Collection: `.appEntityIdentifier(forSelectionType:)`
  - Non-standard canvas: custom canvas annotation
  - 빠른 entity resolution을 위해 `displayRepresentations(...)` query 구현

- **기존 System Integration에 Entity 연결**
  - User Notifications: `UNMutableNotificationContent.appEntityIdentifiers`
  - Now Playing: `MusicContent.appEntityIdentifiers`
  - AlarmKit: `AlarmConfiguration.appEntityIdentifier`
  - Persistent entity만 가능하며 `TransientAppEntity`는 사용할 수 없음

---

# 🧭 세션의 전체 방향

App Intents 기본 도입 후 Siri experience를 더 자연스럽고 개인화하려면 세 가지를 생각해야 한다.

```text
Siri와 대화하는 방식
        ↓
Siri가 앱의 콘텐츠를 찾는 방식
        ↓
Siri가 사용자의 현재 맥락을 이해하는 방식
```

세션의 sample app은 세 개다.

- `CosmoTunes`: 음악 재생, playlist, alarm, timer
- `UnicornChat`: 메시징
- `CometCal`: 캘린더

이 sample들을 통해 App Schemas와 App Intents의 advanced integration pattern을 보여준다.

---

# 💬 Siri가 응답하게 둘지, 앱이 응답을 설계할지

가장 단순한 방식은 intent의 `perform()`에서 action만 수행하고 빈 result를 반환하는 것이다.

```swift
func perform() async throws -> some IntentResult {
    // Action 수행
    return .result()
}
```

이 경우 Siri가 자연어 응답을 직접 구성한다.

이는 기본 동작으로 충분한 경우가 많다.

하지만 앱이 사용하는 고유한 terminology나 tone을 응답에 반영하고 싶다면 직접 dialog를 제공할 수 있다.

---

# 🗣️ `ProvidesDialog`와 `IntentDialog`

CosmoTunes는 song을 `track`, playlist를 `mix tape`라고 부른다.

이런 product language를 Siri response에도 반영하려면 `ProvidesDialog`를 추가한다.

```swift
@AppIntent(schema: .audio.addToPlaylist)
struct AddToPlaylistIntent {

    func perform() async throws
        -> some IntentResult & ProvidesDialog {

        return .result(
            dialog: IntentDialog(
                full: """
                      Added \(song.title) to the \
                      \(playlist.title) mix tape.
                      """,
                supporting: "Added"
            )
        )
    }
}
```

`IntentDialog`에는 두 종류의 text가 있다.

## `full`

Voice-only device에서 전체 의미를 전달한다.

예:
- AirPods
- 화면이 없는 Siri interaction

따라서 이 문자열 하나만 들어도 **무슨 action이 완료됐는지 완전하게 이해할 수 있어야 한다.**

## `supporting`

Visual UI와 함께 짧게 표시할 수 있다.

즉 supporting string에만 중요한 의미를 넣으면 voice-only 환경이 불완전해질 수 있다.

---

# ❓ Intent 실행 중 Clarifying Question

응답은 꼭 intent 종료 시점에만 필요한 것은 아니다.

필요한 parameter가 없거나 ambiguity가 있다면 `perform()` 도중 값을 요청할 수 있다.

세션의 timer 예:

```swift
@AppIntent(schema: .clock.createTimer)
struct CreateTimerIntent {
    var duration: Duration
    var label: String?
    var isSleepTimer: Bool

    func perform() async throws
        -> some ReturnsValue<TimerEntity> {

        label = try await $label.requestValue(
            """
            You already have a timer running. \
            What should we call this one?
            """
        )

        return .result(value: timerEntity)
    }
}
```

기존 timer가 실행 중인데 새 timer에도 label이 없으면 사용자에게 이름을 물어본다.

---

# ⚖️ Clarification은 필요한 경우에만

Apple은 clarifying question을 가능한 적게 사용하라고 권장한다.

질문이 많아지면 Siri interaction의 장점인 friction 감소가 사라진다.

```text
충분한 정보 있음
→ 바로 실행

실제로 ambiguity 있음
→ Clarification
```

선택지 중 하나를 고르게 하거나 confirmation을 요청하는 다른 dialog request도 사용할 수 있다.

---

# 🎨 `DisplayRepresentation`

Siri experience는 음성만으로 구성되지 않는다.

Entity가 화면에 나타날 때 그 entity의 visual identity를 정의하는 기본 수단이 `DisplayRepresentation`이다.

기본:

```swift
DisplayRepresentation(
    title: "Song Title"
)
```

더 풍부하게 만들 수 있다.

```swift
@AppEntity(schema: .audio.song)
struct SongEntity {

    var displayRepresentation: DisplayRepresentation {
        DisplayRepresentation(
            title: "\(title)",
            subtitle: "\(artistName)",
            image: artworkImage
        )
    }
}
```

---

# 🧩 DisplayRepresentation이 사용되는 곳

`DisplayRepresentation`은 Siri response에만 사용되지 않는다.

- Entity create/update response
- Similar entity 사이의 disambiguation
- 앱 콘텐츠에 대한 질문 응답
- Spotlight
- Shortcuts
- Confirmation visual

즉 entity의 system-wide representation이다.

한 번 잘 정의해두면 여러 surface에서 일관된 visual identity를 제공한다.

---

# 🖼️ `ShowsSnippetView`

특정 action의 결과를 앱다운 visual로 표현하려면 custom SwiftUI snippet을 반환할 수 있다.

```swift
@AppIntent(schema: .audio.addToPlaylist)
struct AddToPlaylistIntent {

    var audioEntity: AudioEntity
    var playlist: PlaylistEntity

    func perform() async throws
        -> some IntentResult
            & ProvidesDialog
            & ShowsSnippetView {

        let view = PlaylistSnippetView(
            playlist: updatedEntity,
            tracks: updated.tracks
        )

        return .result(
            dialog: dialog,
            view: view
        )
    }
}
```

`ShowsSnippetView`를 return type에 포함하면 `IntentResult`에 SwiftUI view를 넣을 수 있다.

---

# 🧠 모든 Response를 Customizing할 필요는 없다

Apple이 권장하는 순서는 다음과 같다.

```text
기본 Siri response 테스트
        ↓
앱의 terminology와 맞는지 확인
        ↓
필요한 부분만 Dialog customize
        ↓
Visual identity가 중요한 action만 custom snippet
```

그리고 반드시 voice-only device에서도 자연스럽게 동작하는지 생각해야 한다.

---

# 🎁 Interaction Donations

Siri나 Shortcuts에서 App Intent가 실행되면 시스템은 이미 그 interaction을 알고 있다.

문제는 **앱 UI에서 사용자가 직접 수행한 action**이다.

예:

```text
UnicornChat 실행
      ↓
Compose UI에서 메시지 전송
      ↓
Apple Intelligence는 이 action을 자동으로 알지 못함
```

이럴 때 interaction donation을 사용한다.

---

# 🧠 Donation은 User Behavior Hint

각 donation은 다음 의미를 가진다.

> “이 사용자가 앱 UI에서 이 schema-conforming action을 실제로 수행했다.”

시스템은 이러한 donation을 temporary transcript에 저장한다.

시간이 지나면서 Siri는 user preference를 더 잘 판단할 수 있다.

예:

```text
특정 contact에게 UnicornChat으로 자주 메시지 전송
       ↓
UI interaction donate
       ↓
나중에 Home Screen에서
"이 사람에게 메시지 보내줘"
       ↓
Siri가 UnicornChat을 선호할 가능성 학습
```

---

# 📨 UI Interaction Donation 구현

UI와 intent가 동일한 helper를 사용하는 구조라면 helper에 donation 여부를 전달하는 방식이 편리하다.

```swift
@ModelActor
actor ModelManager {
    func sendMessage(
        _ /* ... */,
        donateIntent: Bool = false
    ) async throws -> [Message.ID] {

        if donateIntent {
            let intent = SendMessageIntent()

            intent.destination = .recipients(
                conversation.recipients.map(\.entity)
            )

            let result = messages.map(\.entity)

            Task {
                try await IntentDonationManager.shared.donate(
                    intent: intent,
                    result: .result(value: result)
                )
            }
        }
    }
}
```

중요한 포인트:

- UI에서 helper를 호출한 경우 donate
- Siri가 이미 intent를 호출한 경우 다시 donate하지 않음

Siri interaction은 시스템이 이미 알고 있기 때문이다.

---

# 🧭 Donation은 Preference뿐 아니라 Ongoing Activity도 표현

Interaction donation은 app preference 학습에만 쓰이지 않는다.

현재 앱 안에서 진행 중인 activity를 Siri가 이해하게 만들 수도 있다.

Maps domain 예:

```text
앱 UI에서 NavigationSession 시작
        ↓
Interaction Donation
        ↓
사용자가 차에 탑승
        ↓
"가는 길에 정류장 추가해줘"
        ↓
Siri가 현재 active NavigationSession을 이해
```

Clock domain에서도 다음 ongoing state에 적용된다.

- Start stopwatch
- Stop stopwatch
- Pause stopwatch
- Lap stopwatch

---

# 🚫 과도한 Donation 금지

Donation은 실제 user behavior를 정확하게 나타내야 한다.

Apple은 지나치게 많이 donate하면 시스템이 해당 donation을 무시할 수 있다고 설명한다.

따라서 다음은 피한다.

```text
UI가 표시됨
→ 실제 action 없음
→ Donate ❌

Background refresh
→ 사용자 행동 아님
→ Donate ❌
```

Donation은 실제 의도가 드러나는 사용자 action에 맞춘다.

---

# ✅ Confirmation과 Agentic Side Effect

Siri가 intent를 실행하기 전 마지막 단계 중 하나는 confirmation이다.

Large Language Model 기반 agentic experience에서는 unintended side effect 가능성을 고려해야 한다.

예:

- Calendar event 삭제
- 예약 취소
- Shared content 수정
- Public content 수정

이런 action은 confirmation이 특히 중요하다.

---

# 👥 Private Entity와 Shared Entity

Siri는 기본적으로 앱의 entity가 개인 소유라고 가정할 수 있다.

예를 들어:

```text
개인 calendar event 수정
→ confirmation을 생략할 수 있음
```

하지만 참석자가 있는 shared event를 수정한다면 다른 사람에게도 영향을 미친다.

```text
Crew Lunch 수정
→ 참석자 존재
→ 더 중요한 side effect
→ confirmation 가능성 증가
```

---

# 🔐 `OwnershipProvidingEntity`

Entity가 shared/public 상태일 수 있다면 새 protocol을 채택한다.

```swift
@AppEntity(schema: .calendar.event)
struct EventEntity: OwnershipProvidingEntity {

    var ownership: EntityOwnership {
        attendees.isEmpty
            ? .unknown
            : .shared
    }
}
```

가능한 ownership state에는 다음이 포함된다.

- `.shared`
- `.public`
- `.unknown`

---

# ⚠️ 모든 Entity에 OwnershipProvidingEntity를 붙이지 않는다

이 protocol은 실제로 사용자가 공유하거나 public으로 만들 수 있는 entity에만 적용한다.

또 entity가 query될 때 ownership 상태를 최신값으로 제공해야 한다.

잘못된 ownership 정보는 Siri의 confirmation 판단을 왜곡한다.

---

# 🖼️ Confirmation Visual에도 DisplayRepresentation 사용

앞에서 정의한 `DisplayRepresentation`은 confirmation에서도 사용될 수 있다.

따라서 entity visual을 잘 정의하면 Siri가 다음을 보여줄 때도 일관된 identity를 유지한다.

```text
"이 shared event를 수정할까요?"
      ↓
Event DisplayRepresentation
```

---

# 🔍 Siri가 Content를 찾는 세 가지 경로

세션은 content discovery를 세 경로로 나눈다.

```text
1. Semantic Index
2. Structured Search
3. In-App Search
```

모든 콘텐츠를 같은 방식으로 검색할 필요는 없다.

Dataset의 크기, 위치, 변경 빈도에 따라 선택한다.

---

# 🧠 Semantic Index와 `IndexedEntity`

CosmoTunes의 playlist는 모두 local device에 있고 전체 수량도 관리 가능하다.

따라서 playlist entity를 Spotlight에 index한다.

`IndexedEntity`를 채택하고 다음 API를 사용한다.

```swift
try await CSSearchableIndex(name: indexName)
    .indexAppEntities([entity])
```

예:

```swift
struct EntityIndexingHelper {
    func indexPlaylist(
        _ playlist: Playlist
    ) async throws {

        let entity = PlaylistEntity(
            playlist: playlist
        )

        try await CSSearchableIndex(
            name: indexName
        )
        .indexAppEntities([entity])
    }
}
```

---

# ✨ Semantic Search

App Intents domain에 따라 Spotlight indexing은 exact keyword matching보다 더 의미 기반의 검색을 제공할 수 있다.

예:

```text
"Play my WWDC playlist in CosmoTunes"
```

Siri가 indexed entity의 의미를 이해해 적절한 playlist를 찾을 수 있다.

Spotlight UI에서도 같은 entity를 검색할 수 있다.

---

# 🔄 Index를 최신 상태로 유지

Indexing은 한 번만 실행하고 끝나는 기능이 아니다.

## Entity 추가

새 content가 생기면 index한다.

## Entity 변경

특히 `DisplayRepresentation`에 쓰이는 중요한 property가 바뀌면 update한다.

## Entity 삭제

Spotlight index에서도 제거한다.

```text
App Data Lifecycle
      ↕
Spotlight Index Lifecycle
```

둘을 일치시켜야 한다.

---

# ♻️ `IndexedEntityQuery`

Spotlight가 앱에 reindex를 요청해야 할 수 있다.

이때 새 `IndexedEntityQuery`를 구현할 수 있다.

다만 이미 Core Spotlight-level API를 통해 reindexing을 지원하고 있다면 별도로 `IndexedEntityQuery`를 정의할 필요는 없다.

---

# 🗄️ 모든 Entity를 Index하면 안 되는 경우

다음 content는 upfront indexing이 적합하지 않을 수 있다.

- Dataset이 매우 큼
- Server에 있음
- 매우 자주 변경됨
- 모든 entity를 local에 유지하지 않음

CosmoTunes 예:

```text
Playlist
→ 전체 index

Song
→ 전체 index하지 않음
```

Song까지 모두 미리 index하지 않고도 Siri search를 지원하기 위해 `IntentValueQuery`를 사용한다.

---

# 🧩 `IntentValueQuery`

`IntentValueQuery`는 `EntityQuery`와 비슷하지만 중요한 차이가 있다.

- System이 structured search input을 전달
- 하나 이상의 entity type을 return 가능

CosmoTunes에서는 `AudioSearch`가 input이다.

```swift
struct AudioIntentValueQuery: IntentValueQuery {

    func values(
        for input: AudioSearch
    ) async throws -> [AudioEntity] {

        switch input.criteria {
        case .searchQuery(let query):
            return try await searchResults(
                for: query
            )

        case .unspecified:
            return try await likedSongResults()

        // .url case도 존재
        }
    }
}
```

---

# 🔀 여러 Entity Type을 하나의 Query에서 반환

`AudioEntity`는 song과 playlist를 포함하는 `UnionValue` type이다.

```text
AudioEntity
├─ SongEntity
└─ PlaylistEntity
```

Siri가 PlayAudioIntent의 `audioEntity`를 찾을 때 structured search를 앱에 전달하고 앱은 song 또는 playlist를 반환할 수 있다.

---

# 🔎 `AudioSearch.criteria`

세션이 다룬 주요 criteria:

## `.searchQuery`

사용자가 실제로 말한 검색어의 relevant part가 전달된다.

```text
"Play Night Drive in CosmoTunes"
→ query 기반 entity 검색
```

## `.unspecified`

사용자가 구체적인 대상을 말하지 않은 경우다.

예:

```text
"Play CosmoTunes"
```

앱은 이전에 좋아한 song을 바로 재생하는 식으로 fallback behavior를 정의할 수 있다.

## `.url`

앱의 link를 참조한 경우다.

예:

```text
"Glow가 보내준 그 playlist 재생해줘"
```

전체 criteria 종류는 domain-specific documentation을 확인해야 한다.

---

# 🔍 Action이 아니라 Search 자체를 원하는 경우

사용자가 꼭 content를 실행하려는 것은 아니다.

예:

```text
"Show me running playlists in CosmoTunes"
```

Siri가 entity result list를 직접 보여줄 수도 있다.

하지만 앱 자체의 search UI가 더 풍부하다면 동일한 query를 앱 안에서 다시 실행할 수 있다.

---

# 📱 `.system.searchInApp`

기존 iOS 17의 `.system.search` schema는 이제 `.system.searchInApp`으로 이름이 바뀌었다.

System App Schema domain에 속하며 다른 App Schema domain 채택 여부와 관계없이 사용할 수 있다.

또 entity를 Spotlight에 index하지 않아도 사용할 수 있다.

```swift
@AppIntent(schema: .system.searchInApp)
struct SearchAudioLibraryIntent {

    var criteria: StringSearchCriteria

    func perform() async throws
        -> some IntentResult {

        navigation.searchText = criteria.term
        navigation.selectedTab = .library

        return .result()
    }
}
```

Siri가 사용한 search string을 앱 안의 검색 UI에 그대로 반영한다.

---

# 🧭 세 가지 Search 방식 선택

| 방식 | 적합한 상황 |
|---|---|
| Spotlight / `IndexedEntity` | Local, index 가능한 content |
| `IntentValueQuery` | Large, server-backed, frequently changing content |
| `.system.searchInApp` | Siri search 결과를 앱 고유의 search UI로 보여주고 싶을 때 |

세 방식은 상호 배타적이지 않다.

앱의 content type에 따라 함께 사용할 수 있다.

---

# 👀 Onscreen Awareness

사용자는 항상 entity 이름을 정확히 말하지 않는다.

일상 대화처럼 다음 표현을 쓴다.

```text
"세 번째 거 재생해줘"
"저 대화에 답장해줘"
"이거 누구 노래야?"
```

Siri가 화면의 pixel text만 보는 것으로는 충분하지 않다.

화면에 보이는 structured entity와 그 위치를 알려주는 것이 onscreen awareness다.

---

# 🧠 Pixel Recognition만으로 부족한 이유

화면에 다음이 보인다고 가정한다.

```text
Track A
Track B
Track C
```

Pixel에서 title은 읽을 수 있어도 Siri는 다음을 모를 수 있다.

- 이 row가 실제 `SongEntity`라는 것
- Artist가 누구인지
- 재생 가능한 entity인지
- Playlist와 어떤 관계인지

Onscreen annotation을 추가하면 UI를 structured entity와 연결할 수 있다.

---

# 1️⃣ Primary Content: `NSUserActivity`

화면 전체가 하나의 primary entity를 나타내는 경우 `NSUserActivity`에서 시작한다.

예: Now Playing screen.

```swift
struct NowPlayingView: View {
    @Environment(PlaybackController.self)
    private var playback

    var body: some View {
        VStack {
            // Player UI
        }
        .userActivity(
            "cosmotunes.nowPlaying",
            isActive: playback.currentTrack
        ) { activity in
            activity.title =
                playback.currentTrack?.title

            activity.appEntityIdentifier =
                EntityIdentifier(
                    for: SongEntity.self,
                    identifier:
                        playback.currentTrack.id
                )
        }
    }
}
```

Screen 전체가 현재 song에 집중되어 있으므로 primary activity가 적합하다.

---

# 2️⃣ One Entity Among Many: View Annotation

한 화면에 album과 track 등 여러 entity가 보이면 개별 view에 entity identifier를 붙인다.

```swift
.appEntityIdentifier(
    EntityIdentifier(
        for: AlbumEntity.self,
        identifier: session.id.uuidString
    )
)
```

이렇게 하면 해당 visual component가 어떤 AppEntity를 표현하는지 시스템이 알 수 있다.

---

# 3️⃣ Lists와 Collections

Row가 매우 많다면 각 row에 annotation을 직접 붙이는 것은 비효율적이다.

Collection annotation을 사용하면 시스템이 필요할 때 identifier를 lazy하게 요청한다.

```swift
List {
    ForEach(playlist.tracks) { track in
        PlaylistTrackRow(track: track)
    }
}
.appEntityIdentifier(
    forSelectionType: GeneratedTrack.ID.self
) { trackID in
    EntityIdentifier(
        for: SongEntity.self,
        identifier: trackID
    )
}
```

---

# ✨ Collection Annotation의 추가 장점

Per-row annotation은 view가 hierarchy에서 사라지면 함께 사라진다.

Collection annotation은 **선택되었지만 scroll되어 화면 밖으로 나간 entity**도 Siri가 발견하는 데 도움을 줄 수 있다.

즉 selection state와 large collection에 더 적합하다.

---

# 4️⃣ Custom Canvas Annotation

Piano roll처럼 standard row/list가 아닌 custom drawing surface에도 entity context를 제공할 수 있다.

CosmoTunes의 PianoRollView는 현재 track의 note를 custom canvas로 표현한다.

이 canvas가 보일 때도 Siri가 관련 song entity를 이해하게 하려면 custom canvas view annotation을 사용한다.

---

# 🍎 SwiftUI뿐 아니라 UIKit / AppKit도 지원

세션은 onscreen awareness API가 SwiftUI에만 한정되지 않는다고 명확히 설명한다.

UIKit / AppKit 관련 API:

- `AppEntityAnnotatable`
- `UICollectionViewAppIntentsDataSource`
- `appEntityUIElementProvider`

기존 UIKit app도 같은 structured context model을 사용할 수 있다.

---

# ⚡ Onscreen Entity는 빠르게 Resolve되어야 한다

화면에 entity가 많을수록 Siri는 빠르게 판단해야 한다.

예:

```text
"세 번째 거 재생해줘"
```

Entity lookup이 느리면:

- Siri가 clarification을 요청할 수 있음
- 엉뚱한 content를 실행할 수 있음
- 사용자가 request를 포기할 수 있음

따라서 full entity를 모두 fetch하지 않고 display 정보만 빠르게 제공하는 path가 중요하다.

---

# 🏷️ Component-based Display Representation Query

Entity query에 `displayRepresentations(...)`를 구현한다.

```swift
extension PlaylistQuery {
    func displayRepresentations(
        for identifiers: [PlaylistEntity.ID],
        requestedComponents:
            DisplayRepresentation.Components = .text
    ) async throws
        -> [PlaylistEntity.ID: DisplayRepresentation] {

        let entities = try await model
            .playlistEntities(for: identifiers)

        var result:
            [PlaylistEntity.ID: DisplayRepresentation] = [:]

        for entity in entities {
            result[entity.id] = await entity
                .displayRepresentation(
                    with: requestedComponents
                )
        }

        return result
    }
}
```

Siri는 entity 전체 대신 필요한 text representation만 빠르게 요청할 수 있다.

Database에서 full object graph를 불러오는 비용을 피할 수 있다.

---

# 🌐 Entity를 System Integration의 공통 언어로 사용

Onscreen awareness는 사용자가 앱을 직접 보고 있을 때의 context다.

하지만 앱 content는 다른 system surface에도 나타난다.

예:

- Notification
- Now Playing
- Alarm

이 surface에도 AppEntity identifier를 붙이면 Siri가 사용자가 지금 마주한 시스템 이벤트와 앱 content를 연결할 수 있다.

---

# 🔔 User Notifications Entity Annotation

Notification에 persistent entity identifier를 추가한다.

```swift
import AppIntents
import UserNotifications

func scheduleNotification(
    message: Message,
    author: Contact,
    conversation: Conversation
) {
    let content = UNMutableNotificationContent()

    content.title = author.name
    content.body = message.body

    content.appEntityIdentifiers = [
        EntityIdentifier(
            for: MessageEntity.self,
            identifier: message.id
        )
    ]

    // Schedule notification
}
```

AirPods에서 notification이 announce된 직후 사용자가 다음처럼 말할 수 있다.

```text
"Reply, 'ok, ...'"
```

Siri는 바로 방금 announce한 message entity를 context로 사용할 수 있다.

---

# 🎵 Now Playing Entity Annotation

Now Playing에는 여러 관련 entity가 있을 수 있다.

세션에서는 가장 구체적인 것에서 덜 구체적인 것 순서로 identifier를 넣는다.

```swift
content.appEntityIdentifiers = [
    EntityIdentifier(
        for: SongEntity.self,
        identifier: track.id
    ),
    EntityIdentifier(
        for: ArtistEntity.self,
        identifier: track.session.artistName
    ),
    EntityIdentifier(
        for: PlaylistEntity.self,
        identifier: currentPlaylist.id
    )
]
```

순서:

```text
Song
 ↓
Artist
 ↓
Playlist
```

이 context가 있으면 현재 재생 중인 곡을 기준으로 다음 요청을 이해하기 쉬워진다.

```text
"Play the live version"
```

---

# ⏰ AlarmKit Entity Annotation

Alarm이나 timer를 만들 때 `AlarmConfiguration`에 entity identifier를 붙인다.

```swift
let configuration =
    AlarmManager
        .AlarmConfiguration<CosmoTunesAlarmMetadata>
        .alarm(
            schedule: schedule,
            attributes: attributes,
            appEntityIdentifier:
                EntityIdentifier(
                    for: AlarmEntity.self,
                    identifier: alarm.id
                ),
            stopIntent: DismissAlarmIntent(),
            secondaryIntent: SnoozeAlarmIntent(),
            sound: sound
        )
```

Alarm이 울릴 때 사용자가 다음처럼 말할 수 있다.

```text
"Snooze it"
```

Siri가 현재 firing alarm을 persistent entity로 이해할 수 있다.

---

# 🚫 `TransientAppEntity`는 System Integration Annotation에 사용할 수 없음

Notification, Now Playing, AlarmKit의 entity annotation에는 persistent identifier가 필요하다.

`TransientAppEntity`는 일시적인 model object이므로 persistent identifier가 없다.

따라서 이 세 integration에서는 사용할 수 없다.

```text
Persistent AppEntity ✅
TransientAppEntity ❌
```

---

# 🧩 기능별 문제와 해법

| 문제 | API / 패턴 |
|---|---|
| Siri 응답이 앱 terminology와 맞지 않음 | `ProvidesDialog`, `IntentDialog` |
| Intent 중간에 정보가 부족함 | `$parameter.requestValue(...)` |
| Entity visual이 밋밋함 | `DisplayRepresentation` |
| 특정 intent 결과를 앱답게 표현 | `ShowsSnippetView` |
| 앱 UI 행동을 Siri가 모름 | `IntentDonationManager` |
| Shared/public content side effect 판단 필요 | `OwnershipProvidingEntity` |
| Local content를 의미 기반 검색 | `IndexedEntity`, `indexAppEntities` |
| Reindex 요청 지원 | `IndexedEntityQuery` |
| Large/server content 검색 | `IntentValueQuery` |
| Siri 검색을 앱 UI에서 재실행 | `.system.searchInApp` |
| 화면의 primary entity 설명 | `NSUserActivity.appEntityIdentifier` |
| 개별 view entity 설명 | `.appEntityIdentifier` |
| Large list entity 설명 | `.appEntityIdentifier(forSelectionType:)` |
| Custom canvas entity 설명 | Custom canvas annotation |
| Onscreen entity의 빠른 text lookup | `displayRepresentations(...)` |
| Notification context | `UNMutableNotificationContent.appEntityIdentifiers` |
| Now Playing context | `MusicContent.appEntityIdentifiers` |
| Alarm context | `AlarmConfiguration.appEntityIdentifier` |

---

# 🔁 권장 도입 순서

세션 마지막에서 Apple이 제안하는 방향을 정리하면 다음과 같다.

```text
DisplayRepresentation 정교화
        ↓
Spotlight Semantic Index
        ↓
Index를 최신 상태로 유지
        ↓
IntentValueQuery
        ↓
searchInApp
        ↓
Onscreen Entity Annotation
        ↓
Notification / NowPlaying / Alarm Annotation
        ↓
Interaction Donations
```

앱의 entity를 시스템 전체에서 공통 identity로 사용하는 방향이다.

---

# 📋 체크리스트

## Siri Dialog

- [ ] 기본 Siri response로 충분한지 먼저 테스트
- [ ] 앱 고유 terminology를 써야 하는지 확인
- [ ] 필요하면 `ProvidesDialog` 추가
- [ ] `IntentDialog.full`만 들어도 결과가 완전히 이해되는지 확인
- [ ] `supporting` text는 visual UI와 함께 쓸 짧은 표현으로 작성
- [ ] AirPods 같은 voice-only 환경 테스트
- [ ] Clarification은 정말 필요한 경우에만 사용
- [ ] Optional parameter에 `requestValue` 적용 여부 검토

## DisplayRepresentation

- [ ] 모든 핵심 entity에 명확한 title 제공
- [ ] 필요하면 subtitle 추가
- [ ] 의미 있는 image 제공
- [ ] Siri response에서 확인
- [ ] Disambiguation UI에서 확인
- [ ] Spotlight에서 확인
- [ ] Shortcuts에서 확인
- [ ] Confirmation에서도 visual이 적절한지 확인

## Custom Snippet

- [ ] Custom visual이 실제로 user value를 더하는지 확인
- [ ] `ShowsSnippetView` 사용
- [ ] SwiftUI snippet의 layout을 다양한 system surface에서 검토
- [ ] Visual response만 이해 가능하고 음성 dialog는 불완전하지 않은지 확인
- [ ] App color/identity를 과도하게 의존하지 않기

## Interaction Donations

- [ ] Siri/Shortcuts interaction은 중복 donate하지 않기
- [ ] 앱 UI에서 실제 수행된 action만 donate
- [ ] Schema-conforming intent 생성
- [ ] 실제 parameter 채우기
- [ ] 필요하면 result도 함께 donate
- [ ] Shared helper에서 UI/Siri 호출 경로 구분
- [ ] Ongoing activity의 start/stop donation 검토
- [ ] 지나친 donation 피하기

## Ownership / Confirmation

- [ ] Side effect가 큰 intent 식별
- [ ] Entity가 실제로 shared/public일 수 있는지 확인
- [ ] 해당 entity에만 `OwnershipProvidingEntity` 적용
- [ ] `.shared`, `.public`, `.unknown` 상태 정확히 계산
- [ ] Entity query 시 최신 ownership 반환
- [ ] Shared content update confirmation 테스트
- [ ] DisplayRepresentation이 confirmation에서 명확한지 확인

## Spotlight Semantic Index

- [ ] Local에서 관리 가능한 entity인지 확인
- [ ] `IndexedEntity` 채택
- [ ] `CSSearchableIndex.indexAppEntities` 사용
- [ ] Entity 생성 시 index
- [ ] 주요 property 변경 시 update
- [ ] 삭제 시 index entry 제거
- [ ] DisplayRepresentation에 쓰이는 property change 특히 주의
- [ ] Reindex 요청 처리
- [ ] 이미 Core Spotlight reindex 구현이 있다면 `IndexedEntityQuery` 중복 구현하지 않기

## IntentValueQuery

- [ ] Dataset이 너무 크거나 server-backed인지 확인
- [ ] Upfront indexing이 적절하지 않은 content 식별
- [ ] System structured search type 확인
- [ ] `values(for:)` 구현
- [ ] `.searchQuery` 처리
- [ ] `.unspecified` fallback 정의
- [ ] `.url` 처리 필요 여부 확인
- [ ] 여러 entity type 반환이 필요하면 `UnionValue` 설계

## In-App Search

- [ ] 앱 자체 search UI가 Siri default result보다 더 유용한지 검토
- [ ] `.system.searchInApp` schema 채택
- [ ] `StringSearchCriteria.term`을 앱 검색 UI에 전달
- [ ] 적절한 tab/navigation state로 이동
- [ ] Spotlight indexing 여부와 관계없이 동작 확인
- [ ] 다른 domain schema와 함께 사용 테스트

## Onscreen Awareness

- [ ] Screen에 primary entity가 하나면 `NSUserActivity` 검토
- [ ] 여러 entity 중 하나면 `.appEntityIdentifier`
- [ ] List/Collection이면 selection-type annotation 검토
- [ ] Custom drawing/canvas면 custom canvas annotation 사용
- [ ] Entity identifier가 persistent/stable한지 확인
- [ ] SwiftUI뿐 아니라 UIKit/AppKit integration 확인
- [ ] "세 번째 거", "이 대화" 같은 deictic request 테스트

## Collection Annotation

- [ ] Row마다 annotation을 붙이는 비용 확인
- [ ] Large collection이면 lazy identifier lookup 사용
- [ ] Selected item이 off-screen이어도 resolve 가능한지 확인
- [ ] Selection ID와 AppEntity ID mapping 안정성 확인

## Display Representation Query Performance

- [ ] Onscreen entity가 많을 때 full entity fetch 비용 측정
- [ ] `displayRepresentations(for:requestedComponents:)` 구현 검토
- [ ] 기본 `.text` component만으로 충분한 path 제공
- [ ] 필요한 component만 fetch
- [ ] Database full object graph load를 피하기
- [ ] Siri contextual request latency 측정

## User Notifications

- [ ] `AppIntents` import
- [ ] Notification의 핵심 persistent entity 식별
- [ ] `appEntityIdentifiers` 설정
- [ ] Announce Notifications 후 follow-up Siri request 테스트
- [ ] Message/reminder 같은 actionable entity를 정확히 annotation

## Now Playing

- [ ] 기존 `MediaSessionRepresentable` integration 확인
- [ ] `MusicContent.appEntityIdentifiers` 설정
- [ ] 가장 구체적인 entity부터 배열
- [ ] Song → Artist → Playlist 등의 순서 검토
- [ ] "live version", "이 artist" 같은 contextual request 테스트

## AlarmKit

- [ ] Alarm/Timer를 대표하는 persistent AppEntity 정의
- [ ] `AlarmConfiguration.appEntityIdentifier` 설정
- [ ] Stop intent 확인
- [ ] Snooze/secondary intent 확인
- [ ] Alarm firing 중 "snooze it" 같은 request 테스트

## Entity Annotation 공통

- [ ] Persistent entity identifier 사용
- [ ] `TransientAppEntity` 사용하지 않기
- [ ] Entity identifier와 실제 model lifecycle 일치
- [ ] Deleted entity에 대한 stale annotation 처리 검토

---

# ⚠️ 구현할 때 주의할 점

## Custom dialog는 Voice-only 환경을 잊으면 안 된다

Supporting text와 snippet이 아무리 좋아도 AirPods에서는 보이지 않을 수 있다.

`full` dialog가 action 결과를 독립적으로 설명해야 한다.

## Interaction Donation은 Analytics Event가 아니다

모든 click이나 state change를 donate하는 것이 아니다.

Schema로 표현할 수 있는 **실제 사용자 action**을 donate하는 기능이다.

## Ownership은 Confirmation Logic의 입력이다

Entity가 shared인지 private인지 잘못 알려주면 Siri가 confirmation을 생략하거나 불필요하게 요구할 수 있다.

## Indexing과 Structured Search는 역할이 다르다

모든 content를 Spotlight에 억지로 넣을 필요는 없다.

Large/server/frequently-changing dataset은 `IntentValueQuery`가 더 적절할 수 있다.

## Onscreen Awareness는 OCR의 보완이다

Siri가 화면 text를 읽을 수 있다는 이유로 annotation을 생략하면 structured entity identity와 hidden metadata를 이해할 수 없다.

## System Integration Annotation에는 Stable Identity가 필요하다

Notification, Now Playing, AlarmKit은 temporary entity가 아니라 persistent entity와 연결해야 한다.

---

# 🎯 AppEntity를 Universal Language로 사용

이번 세션 전체를 관통하는 아이디어는 `AppEntity`를 앱 내부 model wrapper 정도로 보지 않는 것이다.

```text
App UI
   ↓
AppEntity
   ↓
Siri
Spotlight
Shortcuts
Onscreen Awareness
Notifications
Now Playing
AlarmKit
```

같은 entity identity를 여러 system surface에 연결할수록 Siri가 다음 세 가지를 더 잘 이해한다.

- 사용자가 무엇을 말했는가
- 사용자가 무엇을 보고 있는가
- 사용자가 지금 어떤 system event와 상호작용하고 있는가

---

# 핵심 메시지

고급 App Intents 경험은 intent 목록을 많이 만드는 것보다 **앱의 action, content, user behavior, onscreen context, system integration을 같은 entity와 schema로 연결하는 것**에 가깝다.

먼저 `DisplayRepresentation`과 `IntentDialog`를 다듬어 Siri의 말과 visual이 앱의 표현 방식과 일치하도록 한다.

그 다음 앱 UI에서 실제 사용자가 수행한 schema-conforming action을 interaction donation으로 알려 Apple Intelligence가 preference와 ongoing activity를 이해하게 한다.

Shared/public entity에는 `OwnershipProvidingEntity`로 ownership을 제공해 side effect가 있는 action에서 Siri가 적절한 confirmation을 할 수 있게 한다.

콘텐츠는 성격에 따라 Spotlight semantic index, `IntentValueQuery`, `.system.searchInApp`을 선택하거나 조합한다.

그리고 `NSUserActivity`, view/collection/canvas annotation을 통해 사용자가 현재 보고 있는 entity를 Siri에 알려 "세 번째 거", "이 대화" 같은 자연스러운 reference를 이해하게 한다.

마지막으로 같은 persistent `EntityIdentifier`를 User Notifications, Now Playing, AlarmKit에 연결하면 사용자가 앱을 보고 있지 않아도 Siri가 지금 마주한 content의 정체를 이해할 수 있다.

결국 App Intents에서 가장 강력한 설계는 다음과 같다.

```text
Action Schema
     +
Stable AppEntity Identity
     +
User Interaction Context
     +
System-wide Annotation
        ↓
Siri와 Apple Intelligence가
앱을 하나의 연속된 경험으로 이해
```

---

# 함께 보면 좋은 세션과 자료

- Build intelligent Siri experiences with App Schemas — WWDC26
- Code-along: Make your app available to Siri — WWDC26
- Discover new capabilities in the App Intents framework — WWDC26
- Secure your app: Mitigate risks to agentic features — WWDC26
- Modernize your UIKit app — WWDC26
- App Intents Testing
- Donating your app’s data and actions to the system
- Making app entities available in Spotlight
- Making actions and content discoverable by Apple Intelligence
- Providing contextual cues to Apple Intelligence and Siri
