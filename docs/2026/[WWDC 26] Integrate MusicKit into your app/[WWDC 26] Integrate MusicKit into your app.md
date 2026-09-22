# WWDC26 Integrate MusicKit into your app 요약

- Session: 254
- Title: Integrate MusicKit into your app
- Source: https://developer.apple.com/videos/play/wwdc2026/254/
- Topic: MusicKit, Apple Music, SwiftUI, Music Picker, Music Players, Catalog Requests
- Chapters: Introduction, Project setup and authorization, Music items and music picker, Music players and playback, Catalog requests, Next steps

---

## 한 줄 요약

MusicKit은 Swift concurrency와 SwiftUI를 중심으로 **Apple Music 권한·구독 상태 확인, 새 Music Picker를 통한 라이브러리/카탈로그 통합 선택, `SystemMusicPlayer` 또는 `ApplicationMusicPlayer` 기반 재생, queue·playback state 관찰, `MusicCatalogResourceRequest` 기반 카탈로그 조회**를 하나의 Swift-native API로 제공한다.

---

## 핵심 요약

이번 세션은 운동 앱에 MusicKit을 붙이는 과정을 따라가며 MusicKit의 주요 개념을 순서대로 설명한다.

- **Project setup과 권한**
  - App ID에서 MusicKit service 활성화
  - Xcode가 같은 Apple developer account를 사용하도록 확인
  - `MusicAuthorization.request()`로 음악 접근 권한 요청
  - Media Library capability의 usage description으로 권한 알림 문구 제공
  - Apple Music 구독이 없어도 MusicKit 자체는 사용 가능하지만, 접근 가능한 콘텐츠는 purchased/synced library 중심으로 제한

- **구독 상태와 Subscription Offer**
  - `MusicSubscription.current`로 현재 상태 확인
  - `MusicSubscription.subscriptionUpdates`로 이후 변경도 관찰
  - 구독 가능 사용자에게 `.musicSubscriptionOffer(...)`를 통해 앱을 벗어나지 않고 가입 UI 제공
  - 메시지 목적에 따라 `MusicSubscriptionOffer.Options`의 `messageIdentifier` 사용

- **Music Item 모델**
  - `Song`, `Album`, `Playlist`, `Station`, `Genre` 등이 MusicKit의 value-type model
  - 각 item은 Attributes, Relationships, Associations로 구성

- **Music Picker**
  - SwiftUI `.musicPicker(...)` modifier로 Apple Music catalog와 개인 library를 하나의 UI에서 탐색
  - 구독자는 library + catalog를 볼 수 있음
  - 비구독자는 개인 library 항목만 표시
  - 단일 선택뿐 아니라 array binding을 이용한 다중 선택 가능
  - song뿐 아니라 album/playlist 전체도 선택 가능

- **Music Players**
  - `SystemMusicPlayer`: 시스템 Music 앱의 player 제어
  - `ApplicationMusicPlayer`: 앱 자체의 player, queue에 대한 전체 read/write 접근
  - `prepareToPlay()`로 playback latency를 줄일 수 있음
  - container type용 queue initializer는 item을 lazy load
  - `affectsListeningHistory`로 Music 앱의 Recently Played 반영 여부 제어

- **Playback UI**
  - ApplicationMusicPlayer의 queue와 state는 observable
  - 현재 entry의 artwork, title, subtitle 표시 가능
  - play/pause, previous/next control 가능

- **Catalog Requests**
  - `MusicCatalogResourceRequest`로 strongly typed Apple Music catalog query
  - relationships/associations prefetch 가능
  - item limit, pagination 지원
  - storefront나 content restriction에 따라 같은 곡이 다른 ID로 존재할 수 있음
  - `.findEquivalents` option으로 지역/clean-version 등 equivalent resource 탐색

---

# 🎵 MusicKit의 역할

MusicKit은 Apple 플랫폼에서 Apple Music과 사용자의 음악 library에 접근하고 재생하기 위한 Swift framework다.

세션에서는 다음 특징을 강조한다.

- Swift concurrency 친화적 API
- SwiftUI와 자연스럽게 통합
- Apple Music catalog 탐색
- 개인 media library 접근
- 음악 선택
- 음악 재생
- catalog request

앱이 자체적으로 음악 catalog UI와 playback infrastructure를 처음부터 구현하지 않고도 Apple Music 경험을 통합할 수 있다.

---

# 🚴 세션의 예제 앱

세션은 간단한 workout 앱에서 출발한다.

기존 상태:

```text
Bike Workout 시작
      ↓
Stopwatch 표시
      ↓
End Session 버튼
```

목표:

```text
Workout 시작
      ↓
운동 중 들을 음악 선택
      ↓
Playback 준비
      ↓
Artwork + Song 정보 표시
      ↓
Play / Pause / Previous / Next
      ↓
추천 Song shelf
```

MusicKit의 여러 기능을 이 흐름에 하나씩 추가한다.

---

# 🔐 Project Setup

MusicKit request를 사용하려면 먼저 project와 developer account가 올바르게 설정돼 있어야 한다.

## App ID의 MusicKit 활성화

Apple Developer portal에서 App ID의 App Services 항목에 있는 MusicKit을 활성화한다.

이 설정을 기반으로 developer token이 자동 생성된다.

중요한 점:

```text
Developer Portal Account
        =
Xcode에 로그인한 Developer Account
```

토큰이 developer account에 연결되므로 같은 account를 사용하는지 확인해야 한다.

---

# 🔑 MusicAuthorization

음악 library 및 MusicKit content에 접근하기 전에 사용자 권한을 요청한다.

개념적으로:

```swift
let status = await MusicAuthorization.request()
```

이 method는 비동기적으로 authorization 결과를 반환한다.

권한 요청 시 시스템 alert가 표시된다.

---

# 📝 Media Library Usage Description

권한 alert에 앱이 음악 접근을 왜 필요로 하는지 설명하려면 Xcode의 Signing & Capabilities에서 Media Library capability를 추가하고 설명 문구를 설정한다.

이 설명은 사용자가 permission prompt를 볼 때 함께 표시된다.

원칙:

> 사용자가 권한을 허용하기 전에 앱이 음악 데이터에 접근하는 이유를 이해할 수 있어야 한다.

---

# 🎟️ Apple Music 구독은 MusicKit 사용의 필수 조건이 아니다

세션에서 중요한 구분이다.

```text
MusicKit 사용 가능 여부
≠
Apple Music subscription 보유 여부
```

구독이 없어도 MusicKit API 자체는 사용할 수 있다.

다만 Apple Music catalog를 자유롭게 재생할 수 없고 사용자가 구매했거나 동기화한 음악 등 자신의 library content 중심으로 접근하게 된다.

---

# 💳 Music Subscription Offer

구독하지 않은 사용자가 Apple Music catalog를 듣고 싶어 한다면 앱 안에서 Apple Music subscription offer를 표시할 수 있다.

SwiftUI에서는 `.musicSubscriptionOffer(...)` modifier를 사용한다.

간단한 형태:

```swift
.musicSubscriptionOffer(
    isPresented: $showSubscriptionOffer,
    options: options
)
```

이 UI는 앱을 나가지 않고 Apple Music 가입 과정을 진행하게 한다.

---

# 💬 `MusicSubscriptionOffer.Options`

Subscription offer의 목적에 따라 UI message를 조정할 수 있다.

세션에서는 음악 재생 목적이므로 다음 의미의 설정을 사용한다.

```swift
let options = MusicSubscriptionOffer.Options(
    messageIdentifier: .playMusic
)
```

`messageIdentifier`는 앱의 use case에 맞춰 subscription offer의 문맥을 바꾸는 데 사용된다.

---

# 📈 Apple Services Performance Partner Program

앱을 통해 사용자가 Apple Music subscription에 가입하는 경우 Apple Services Performance Partner Program과 연결할 수도 있다.

관련 attribution 정보를 `MusicSubscriptionOffer.Options`에 포함할 수 있다.

세션에서는 이 프로그램을 통해 개발자가 subscription referral에 따른 commission을 받을 가능성이 있음을 안내한다.

---

# 🔄 Subscription 상태 관찰

단순히 앱 실행 시 한 번만 subscription 여부를 읽는 것보다 현재 값과 이후 변화 모두를 처리해야 한다.

구조:

```text
MusicSubscription.current
        ↓
현재 상태

MusicSubscription.subscriptionUpdates
        ↓
향후 상태 변경 stream
```

SwiftUI에서는 authorization 상태에 연결된 `.task` 안에서 이를 처리할 수 있다.

개념적으로:

```swift
subscription = try? await MusicSubscription.current

for await update in MusicSubscription.subscriptionUpdates {
    subscription = update
}
```

사용자가 앱을 사용하는 동안 subscription 상태가 바뀌어도 UI를 자동으로 갱신할 수 있다.

---

# 🧱 Music Item 모델

MusicKit의 핵심 데이터 구조는 Music Item이다.

대표 타입:

- `Song`
- `Album`
- `Playlist`
- `Station`
- `Genre`

세션은 `Album`을 예로 들어 세 가지 종류의 정보를 설명한다.

---

# 🏷️ Attributes

Music item 자체의 기본 property다.

Album 예:

- Title
- Content rating

Song이라면 title, artwork 등 직접적인 metadata가 여기에 해당한다.

---

# 🔗 Relationships

Item과 강하게 연결된 다른 MusicKit item을 표현한다.

예:

```text
Album
  ↓ relationship
Tracks
```

Album과 track처럼 domain상 직접적인 연결이 있는 관계다.

---

# 🪢 Associations

Associations도 related content를 가리키지만 relationships보다 상대적으로 약한 연결이다.

세션의 예:

```text
Album
  ↓ association
Other Versions
```

같은 album의 다른 version collection 등이 여기에 해당한다.

---

# 🎚️ 새 Music Picker

Music Picker는 사용자가 Apple Music catalog와 자신의 music library를 하나의 familiar UI에서 탐색하고 선택하게 한다.

이 picker가 중요한 이유:

```text
Catalog Search
Library Browse
Album Browse
Playlist Browse
Selection
```

을 앱이 직접 조립하지 않아도 된다.

---

# 🎼 SwiftUI `.musicPicker`

기본적으로 presentation 상태와 selection binding을 제공한다.

개념적인 단일 선택:

```swift
@State var showPicker = false
@State var selectedSong: Song?

Button("Pick Music") {
    showPicker = true
}
.musicPicker(
    isPresented: $showPicker,
    selection: $selectedSong
)
```

Picker가 dismiss되면 binding에 선택 결과가 반영된다.

---

# 👤 Subscription 여부에 따른 Picker 내용

Picker 자체는 subscription이 없어도 사용할 수 있다.

하지만 보여주는 content가 달라진다.

```text
Apple Music Subscriber
→ Library + Apple Music Catalog

Non-subscriber
→ User Library 중심
```

그래서 세션의 예제 UI에서는 picker button을 subscription 조건 밖에 둔다.

---

# ➕ Multi-selection

Workout처럼 여러 곡이 필요한 경우 selection type을 optional single item이 아니라 array로 바꾼다.

```text
Song?
  ↓
[Song]
```

같은 Music Picker가 여러 song selection을 처리한다.

---

# 💿 Album과 Playlist 전체 선택

Picker는 individual song만 선택하는 UI가 아니다.

사용자는 album이나 playlist detail page에서 해당 container 전체를 선택할 수 있다.

따라서 앱에서 선택 UI를 직접 만들지 않고도 다음을 지원한다.

- Single song
- Multiple songs
- Album
- Playlist

---

# ▶️ MusicKit의 두 MusicPlayer

MusicKit은 두 player를 제공한다.

```text
MusicPlayer
├─ SystemMusicPlayer
└─ ApplicationMusicPlayer
```

둘 다 재생 기능을 제공하지만 ownership과 queue 접근 범위가 다르다.

---

# 🎧 `SystemMusicPlayer`

SystemMusicPlayer는 시스템 Music 앱의 player를 제어한다.

특징:

- Music 앱과 playback context 공유
- Queue를 설정할 수 있음
- Queue 전체 내용을 자유롭게 읽는 것은 제한적
- 현재 재생 item 중심으로 접근
- 앱이 background나 종료 상태가 되어도 시스템 Music 앱 재생은 계속될 수 있음

사용자가 Music 앱과 자연스럽게 이어지는 playback을 기대하는 앱에 적합하다.

---

# 📱 `ApplicationMusicPlayer`

ApplicationMusicPlayer는 앱이 직접 소유하는 playback experience에 적합하다.

특징:

- Queue에 full read/write 접근
- 앱 UI에서 현재 queue 상태를 직접 구성하기 쉬움
- 앱 내부 playback experience에 적합

Background에서도 계속 재생하려면 Xcode project에서 Audio Background Mode capability를 활성화해야 한다.

---

# 🆚 Player 비교

| 항목 | SystemMusicPlayer | ApplicationMusicPlayer |
|---|---|---|
| Playback ownership | 시스템 Music 앱 | 현재 앱 |
| Queue 설정 | 가능 | 가능 |
| Queue 전체 read/write | 제한적 | 전체 접근 |
| 현재 entry | 접근 가능 | 접근 가능 |
| Repeat / Shuffle | 지원 | 지원 |
| Recently Played 제어 | 지원 | 지원 |
| 앱 종료 후 재생 | 시스템 Music 앱이 계속 가능 | Background Audio 설정 필요 |
| 앱 전용 player UI | 제한적 | 매우 적합 |

---

# 📚 Queue

MusicPlayer의 queue는 재생 가능한 Music Item의 collection이다.

예:

- Songs
- Album
- Playlist

Queue를 설정한 뒤 player가 필요한 audio asset을 load해야 실제 playback이 시작된다.

---

# ⏱️ `prepareToPlay()`

이미 다음에 재생할 content를 알고 있다면 `prepareToPlay()`를 사용해 실제 `play()` 호출 전 buffer 작업을 시작할 수 있다.

```text
Queue 설정
   ↓
prepareToPlay()
   ↓
Audio Asset 사전 준비
   ↓
play()
   ↓
Startup latency 감소
```

즉 user action 직후의 playback delay를 줄이는 최적화다.

---

# 📦 Container Queue의 Lazy Loading

Album이나 Playlist처럼 container type을 queue에 넣을 때 전용 initializer를 사용하면 내부 item을 lazy load할 수 있다.

장점:

- 전체 track metadata를 upfront로 가져올 필요 감소
- Queue 준비 시간 단축
- 큰 playlist에 유리

---

# 🕘 `affectsListeningHistory`

MusicKit으로 재생한 음악은 일반적으로 Music 앱의 listening history에 반영될 수 있다.

`affectsListeningHistory` property로 해당 queue가 Recently Played 등에 영향을 줄지 제어한다.

기본은 `true`이며 Music 앱의 “Use Listening History” 설정도 존중한다.

이 설정은 다음 종류의 앱에서 특히 중요하다.

- 집중 음악
- 수면 음악
- 운동용 자동 playlist
- 테스트 playback

사용자의 추천 알고리즘과 listening history에 영향을 주고 싶지 않은 playback이라면 별도 정책을 고려할 수 있다.

---

# 👀 Playback State 관찰

두 player 모두 playback state와 queue를 observable하게 제공한다.

ApplicationMusicPlayer에서는 SwiftUI view가 이를 직접 관찰해 UI를 구성할 수 있다.

대표적으로:

```text
Current Entry
Playback Status
Queue
```

을 UI state로 활용한다.

---

# 🖼️ `ArtworkImage`

현재 queue entry에 artwork가 있으면 MusicKit의 SwiftUI `ArtworkImage`를 사용해 직접 표시할 수 있다.

구조:

```text
ApplicationMusicPlayer.queue
        ↓
currentEntry
        ↓
artwork
        ↓
ArtworkImage
```

Artwork가 없는 경우 placeholder를 보여주는 식으로 구성한다.

---

# 📝 현재 Song 정보

현재 entry에서 다음 정보를 표시할 수 있다.

- Title
- Subtitle

세션은 artwork 아래에 title과 subtitle을 배치한다.

---

# ⏯️ Play / Pause

`ApplicationMusicPlayer.shared.state.playbackStatus`를 확인해 현재 재생 상태를 판단한다.

```text
.playing
→ Pause button

그 외
→ Play button
```

Playback command:

```swift
player.pause()
try await player.play()
```

`play()`는 async이므로 Task 안에서 호출하는 형태가 자연스럽다.

---

# ⏮️ Previous / Next

Queue navigation은 player API로 수행한다.

```swift
try await player.skipToPreviousEntry()
try await player.skipToNextEntry()
```

따라서 SwiftUI button을 queue control에 직접 연결할 수 있다.

---

# 🔍 Music Catalog Requests

Picker만으로 충분하지 않은 앱에서는 catalog를 직접 query할 수 있다.

예:

- 앱이 추천하는 특정 song shelf
- Curated workout music
- Search
- Personalized content
- 특정 ID의 music item lookup

MusicKit은 Apple Music API를 strongly typed Swift request로 감싼다.

---

# 🧱 `MusicCatalogResourceRequest`

특정 resource type을 가져오는 structured request다.

예:

```text
MusicCatalogResourceRequest<Song>
```

Request 구성 요소:

- Filter
- Options
- Relationships
- Associations
- Limit

`response()`를 async로 호출하면 strongly typed response를 받는다.

---

# 📥 `MusicCatalogResourceResponse`

Response에는 `MusicItemCollection`이 들어 있다.

Song request라면:

```text
MusicCatalogResourceResponse
        ↓
MusicItemCollection<Song>
```

Swift generic type을 통해 결과 type을 명확하게 유지한다.

---

# 📄 Pagination

Catalog response가 한 번에 모든 item을 반환하지 않을 수 있다.

`MusicItemCollection`은 pagination을 지원한다.

```text
hasNextBatch == true
      ↓
await nextBatch()
```

큰 catalog result를 page 단위로 처리할 수 있다.

---

# 🌍 Storefront와 Region 차이

Apple Music resource는 지역별로 availability가 달라질 수 있다.

예:

```text
US Storefront
Song ID A

KR Storefront
동일한 곡이지만 Song ID B
```

같은 음악 콘텐츠가 지역에 따라 다른 resource ID를 가질 수 있다.

또 explicit content가 제한된 account에서는 clean version이 equivalent resource로 제공될 수 있다.

---

# 🔁 `.findEquivalents`

세션의 catalog request 예제는 `.findEquivalents` option을 사용한다.

목적:

```text
Requested ID가 현재 storefront에서 unavailable
        ↓
같은 content의 equivalent resource 탐색
        ↓
지역별 ID 또는 clean version 대응
```

Cross-storefront song sharing이나 앱이 미리 정의한 curated song ID를 사용할 때 매우 중요하다.

---

# 🎯 특정 ID 목록으로 Song 가져오기

세션에서는 여러 song ID를 받고 첫 번째 곡을 featured song으로 취급하는 helper를 만든다.

흐름:

```text
[Song IDs]
     ↓
MusicCatalogResourceRequest<Song>
     ↓
.findEquivalents
     ↓
response()
     ↓
첫 ID → Featured
나머지 → Other Songs
```

중요:

> Catalog request가 요청한 모든 resource를 반드시 반환한다는 보장은 없다.

따라서 ID별 lookup 결과가 optional일 수 있다는 전제에서 코드를 작성해야 한다.

---

# 🧭 MusicKit 통합 전체 흐름

```text
App ID에서 MusicKit 활성화
        ↓
Media Library capability + 설명
        ↓
MusicAuthorization.request()
        ↓
MusicSubscription.current 관찰
        ↓
필요하면 Subscription Offer
        ↓
Music Picker로 Song/Album/Playlist 선택
        ↓
SystemMusicPlayer 또는 ApplicationMusicPlayer 선택
        ↓
Queue 구성
        ↓
prepareToPlay()
        ↓
play()
        ↓
Queue / State 관찰
        ↓
Artwork + Playback Controls
        ↓
Catalog Request로 추천 콘텐츠 확장
```

---

# 🧩 주요 API 정리

| API | 역할 |
|---|---|
| `MusicAuthorization.request()` | MusicKit 접근 권한 요청 |
| `MusicSubscription.current` | 현재 Apple Music 구독 상태 |
| `MusicSubscription.subscriptionUpdates` | 구독 상태 변경 async sequence |
| `.musicSubscriptionOffer(...)` | 앱 내부 Apple Music 가입 UI |
| `MusicSubscriptionOffer.Options` | Subscription offer 메시지/attribution 설정 |
| `.musicPicker(...)` | Apple Music + library 통합 선택 UI |
| `Song`, `Album`, `Playlist` 등 | MusicKit music item model |
| `SystemMusicPlayer` | 시스템 Music 앱 playback 제어 |
| `ApplicationMusicPlayer` | 앱 전용 playback |
| `prepareToPlay()` | 재생 전 buffer/asset 준비 |
| `affectsListeningHistory` | Listening history 반영 제어 |
| `ArtworkImage` | SwiftUI artwork 표시 |
| `MusicCatalogResourceRequest` | Strongly typed catalog query |
| `.findEquivalents` | Storefront/content-restriction equivalent 탐색 |
| `MusicItemCollection` | Catalog result collection + pagination |

---

# 📋 체크리스트

## Project Setup

- [ ] Developer Portal App ID에서 MusicKit 활성화
- [ ] Xcode가 같은 developer account를 사용하는지 확인
- [ ] Media Library capability 추가
- [ ] Music access usage description 작성
- [ ] Background playback이 필요하면 Audio Background Mode 검토

## Authorization

- [ ] `MusicAuthorization.request()` 호출 시점을 UX에 맞게 선택
- [ ] 권한 요청 전 사용 이유를 UI로 설명할지 검토
- [ ] Denied / restricted 상태 처리
- [ ] Authorization 이후에만 필요한 task 실행

## Subscription

- [ ] Apple Music subscription이 앱 전체 기능의 필수 조건인지 구분
- [ ] 비구독자에게 library 기능은 계속 제공할지 결정
- [ ] `MusicSubscription.current` 확인
- [ ] `subscriptionUpdates` 관찰
- [ ] `canBecomeSubscriber`에 따라 subscribe UI 표시
- [ ] `.musicSubscriptionOffer(...)` 적용
- [ ] 적절한 `messageIdentifier` 선택
- [ ] Performance Partner Program attribution 필요 여부 확인

## Music Picker

- [ ] `.musicPicker(...)` 적용
- [ ] Single selection인지 multi-selection인지 결정
- [ ] Song, Album, Playlist 중 허용 범위 검토
- [ ] 비구독자에서는 library만 노출될 수 있음을 반영
- [ ] Picker 결과가 dismiss 후 UI에 자연스럽게 반영되는지 확인
- [ ] 선택 결과가 비어 있는 경우 처리

## Player 선택

- [ ] Music 앱과 재생을 공유해야 하면 `SystemMusicPlayer` 검토
- [ ] 앱에서 queue를 완전히 제어해야 하면 `ApplicationMusicPlayer` 사용
- [ ] Background/termination 이후 playback 요구사항 확인
- [ ] Queue read/write 필요 수준 확인
- [ ] Listening history 영향 여부 정의

## Playback 준비

- [ ] Queue를 먼저 설정
- [ ] 다음에 재생할 content를 미리 안다면 `prepareToPlay()` 사용
- [ ] Album/Playlist container initializer의 lazy loading 활용 검토
- [ ] Network 상태에서 playback startup latency 측정
- [ ] 재생 실패/error handling 구현

## SwiftUI Playback UI

- [ ] Player state를 observable state로 연결
- [ ] `queue.currentEntry` 관찰
- [ ] Artwork가 없을 때 placeholder 제공
- [ ] Title / subtitle 표시
- [ ] `playbackStatus` 기반 Play/Pause 상태 동기화
- [ ] Previous / Next command 처리
- [ ] Rapid tap이나 async command race condition 검토

## Listening History

- [ ] 앱 playback이 사용자의 추천에 영향을 줘도 되는지 결정
- [ ] `affectsListeningHistory` 설정 검토
- [ ] Music 앱의 Use Listening History 설정과의 관계 이해

## Catalog Requests

- [ ] Picker가 아니라 앱 주도 recommendation이 필요한지 확인
- [ ] `MusicCatalogResourceRequest` resource type 정의
- [ ] 필요한 filter 구성
- [ ] Relationships/associations를 함께 fulfill할지 결정
- [ ] Result limit 설정
- [ ] `response()` error 처리
- [ ] Pagination 필요 시 `hasNextBatch` / `nextBatch()` 처리

## Storefront / Region

- [ ] Catalog ID가 모든 region에서 동일하다고 가정하지 않기
- [ ] `.findEquivalents` 사용 검토
- [ ] Explicit/clean content equivalency 고려
- [ ] 요청한 모든 item이 반환된다고 가정하지 않기
- [ ] Missing item fallback UI 정의

---

# ⚠️ 구현 시 주의할 점

## MusicKit authorization과 subscription은 다른 상태다

사용자가 MusicKit access를 허용했다고 해서 Apple Music subscriber라는 뜻은 아니다.

```text
Authorization
→ 앱이 음악 데이터에 접근 가능한가?

Subscription
→ Apple Music catalog를 구독 권한으로 재생할 수 있는가?
```

두 상태를 별도로 모델링해야 한다.

## Picker도 Subscription 없이 사용할 수 있다

비구독자를 위해 picker 자체를 숨길 필요는 없다.

개인 library content를 선택할 수 있으므로 picker는 subscription check와 별도로 제공할 수 있다.

## `SystemMusicPlayer`와 `ApplicationMusicPlayer`를 UX에 따라 선택한다

단순히 API 기능 차이만이 아니라 playback ownership의 차이다.

Music 앱과 이어지는 경험인지, 앱 자체 player인지 먼저 결정한다.

## Playback latency를 무시하지 않는다

Queue를 설정한 후 audio asset 준비 시간이 필요하다.

다음 content를 미리 알 수 있다면 `prepareToPlay()`를 사용한다.

## Catalog ID를 글로벌 identifier처럼 취급하지 않는다

Storefront와 content restriction에 따라 equivalent resource가 다른 ID를 가질 수 있다.

Cross-region sharing이나 curated catalog에서는 `.findEquivalents`가 중요하다.

---

# 🎯 어떤 API를 언제 사용할까?

## 사용자가 직접 음악을 고르게 하고 싶다

```text
.musicPicker(...)
```

## 구독하지 않은 사용자가 catalog 음악을 듣게 하고 싶다

```text
.musicSubscriptionOffer(...)
```

## 시스템 Music 앱과 같은 player를 제어하고 싶다

```text
SystemMusicPlayer
```

## 앱 안에서 queue를 완전히 제어하고 싶다

```text
ApplicationMusicPlayer
```

## 앱이 직접 특정 catalog song을 추천하고 싶다

```text
MusicCatalogResourceRequest<Song>
```

## 지역마다 ID가 다른 같은 음악을 찾고 싶다

```text
.findEquivalents
```

---

# 핵심 메시지

MusicKit의 장점은 Apple Music 기능을 각각 따로 붙이는 것이 아니라 **권한, 구독, 선택, 재생, catalog 조회를 하나의 Swift-native model로 연결할 수 있다는 점**이다.

세션의 흐름은 다음처럼 정리할 수 있다.

```text
Authorize
   ↓
Check Subscription
   ↓
Pick Music
   ↓
Choose Player
   ↓
Build Queue
   ↓
Prepare + Play
   ↓
Observe State
   ↓
Extend with Catalog Requests
```

새 Music Picker는 Apple Music catalog와 개인 library를 하나의 interface로 제공해 직접 검색/선택 UI를 만들 필요를 크게 줄인다.

그리고 구독 여부와 picker 사용 가능 여부를 분리해야 한다. Apple Music subscriber라면 catalog와 library를 모두 탐색할 수 있지만, subscription이 없어도 자신의 purchased/synced music을 picker에서 선택할 수 있다.

Playback에서는 `SystemMusicPlayer`와 `ApplicationMusicPlayer`의 차이를 queue API보다 **누가 playback experience를 소유하는가**라는 관점에서 선택해야 한다. 앱 내부에서 artwork와 queue, controls를 적극적으로 구성하려면 ApplicationMusicPlayer가 적합하다.

마지막으로 catalog request에서는 storefront 차이를 반드시 고려해야 한다. 같은 곡이 국가별로 다른 resource ID를 가질 수 있고 explicit content restriction 때문에 clean version이 반환될 수도 있으므로 `.findEquivalents`를 통해 동일 콘텐츠를 유연하게 찾는 것이 중요하다.

---

# 함께 보면 좋은 세션과 자료

- Explore more content with MusicKit — WWDC22
- Meet Apple Music API and MusicKit — WWDC22
- Discover Observation in SwiftUI — WWDC23
- Integrating MusicKit into your app sample
- MusicKit documentation
- Apple Services Performance Partner Program
