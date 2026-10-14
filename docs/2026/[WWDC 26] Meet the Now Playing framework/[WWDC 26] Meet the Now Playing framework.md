# WWDC26 Meet the Now Playing framework 요약

- Session: 312
- Title: Meet the Now Playing framework
- Source: https://developer.apple.com/videos/play/wwdc2026/312/
- Topic: NowPlaying, MediaSession, RemoteMediaSession, Media Sharing Extensions, APNs, system media controls
- Chapters: Introduction / Media sessions / Remote media sessions / Media sharing extensions

---

## 한 줄 요약

WWDC26의 **Now Playing framework**는 앱의 로컬 미디어 재생과 외부 기기의 원격 재생 상태를 동일한 Swift 모델 중심 API로 시스템 Now Playing 경험에 연결하고, Lock Screen·Control Center·Dynamic Island·StandBy·CarPlay를 비롯한 Apple 플랫폼의 시스템 미디어 UI에서 콘텐츠 정보와 재생 명령을 일관되게 노출하도록 만든 새로운 프레임워크다.

---

## 핵심 요약

이번 세션은 크게 세 부분으로 구성된다.

1. **Media sessions**
   - 앱 자체가 iPhone 등 로컬 기기에서 재생하는 미디어를 시스템 Now Playing에 공개
   - `MediaSessionRepresentable`
   - `MediaSession`
   - `GenericContent` 및 콘텐츠별 표현 타입
   - `MediaPlaybackSnapshot`
   - `MediaCommand`

2. **Remote media sessions**
   - 앱이 직접 재생하지 않고 스마트 스피커 등 외부 기기의 재생을 제어하는 경우
   - `RemoteMediaSessionExtension`
   - `RemoteMediaSessionRepresentable`
   - `RemoteMediaSessionAttributes`
   - APNs를 통한 상태 전달
   - system UI에서 발생한 command를 extension → server → remote device로 전달
   - `MediaDevice`로 실제 재생 장치와 volume capability 표현

3. **Media Sharing Extensions**
   - 서드파티 media protocol SDK를 앱 bundle 안에 직접 포함하는 기존 구조에서 벗어남
   - protocol implementation을 system-managed extension으로 분리
   - 앱은 system device picker를 통해 여러 media protocol을 통합된 방식으로 사용
   - 앱은 playback transport 기술보다 **media content 자체에 집중**

---

# 🎧 System Now Playing 경험

Apple의 Now Playing UI는 하나의 특정 화면이 아니라 여러 시스템 surface에 걸쳐 존재한다.

세션에서 예로 든 surface:

- Lock Screen
- Control Center
- Dynamic Island
- StandBy
- CarPlay
- Apple Watch
- Apple Vision Pro
- Apple TV

즉 앱이 Now Playing framework를 통해 세션을 시스템에 공개하면 사용자는 앱을 직접 열지 않고도 현재 미디어 정보와 재생 controls를 사용할 수 있다.

핵심은 다음과 같다.

```text
App playback state
      ↓
NowPlaying framework
      ↓
System Now Playing experience
      ↓
Lock Screen / Control Center / Dynamic Island / CarPlay / ...
```

---

# 🧠 새로운 API의 중심: 모델을 시스템에 설명한다

세션의 로컬 플레이어 예제는 ambient sound 앱이다.

앱 내부에는 이미 다음 역할을 가진 모델이 있다.

```text
PlayerModel
├─ 실제 audio engine 참조
└─ 현재 재생 중인 Sound
```

이 모델을 새 Now Playing framework에 연결할 때 기존 player 로직을 시스템 UI에 맞춰 다시 작성하는 방식이 아니다.

대신 모델이 **`MediaSessionRepresentable`을 채택해 시스템에 다음 정보를 설명**한다.

- 이 세션의 identity
- 무엇을 재생 중인지
- 현재 playback state
- 어떤 command를 지원하는지

즉 기본 철학은 다음과 같다.

```text
기존 Playback Model
        +
MediaSessionRepresentable
        ↓
System이 이해 가능한 media session model
```

---

# 🪪 `MediaSessionRepresentable`

`MediaSessionRepresentable`은 앱의 playback model과 시스템 Now Playing 사이의 contract 역할을 한다.

필요한 핵심 구성은 다음과 같다.

```text
id
content
playbackSnapshot
commands
```

세션마다 unique identifier가 필요하다.

개념적인 구현은 다음과 같다.

```swift
extension PlayerModel: MediaSessionRepresentable {
    var id: String {
        "ambient-sound-session"
    }

    // content
    // playbackSnapshot
    // commands
}
```

여기서 중요한 점은 `PlayerModel` 자체가 이미 앱의 현재 상태를 표현하고 있다는 것이다.

Now Playing용 별도 상태 저장소를 하나 더 만드는 대신 동일한 observable model에서 시스템 표현을 파생한다.

---

# 🎵 `content`: 지금 무엇을 재생하고 있는가

`content`는 시스템 Now Playing UI에 표시할 현재 미디어를 설명한다.

NowPlaying framework는 콘텐츠 종류에 맞는 표현 타입을 제공한다.

세션에서 언급된 예:

- Music
- Podcast
- Movie
- Generic content

Ambient sound처럼 특정 미디어 category에 정확히 맞지 않는 경우에는 generic representation을 사용할 수 있다.

필요한 정보의 개념은 다음과 같다.

```text
Content ID
Title
Subtitle
Media type
Duration
Artwork
```

예를 들어 ambient sound라면:

```text
ID       → 현재 sound ID
Title    → sound name
Subtitle → short description
Type     → audio
Duration → continuous/live 성격
Artwork  → 현재 sound image
```

---

# 🖼️ Artwork는 필요할 때 비동기로 공급

Artwork는 고정된 하나의 이미지 크기만 넘기는 방식이 아니다.

시스템이 특정 size의 image를 필요로 할 때 사용할 수 있도록 asynchronous loader 형태로 제공한다.

개념적으로:

```swift
Artwork(id: sound.id) { requestedSize in
    let data = try await loadArtwork(size: requestedSize)
    return try makeArtworkRepresentation(data)
}
```

이 구조의 장점은 system surface마다 필요한 artwork 크기가 달라도 앱이 필요한 representation을 적절히 제공할 수 있다는 점이다.

---

# ⏱️ Content duration

세션의 ambient sound는 정해진 길이 없이 계속 재생된다.

따라서 duration을 continuous/live 성격으로 표현한다.

반면 podcast, song, movie처럼 명확한 길이가 있는 콘텐츠는 정해진 duration과 elapsed position을 함께 표현할 수 있다.

이 구분은 시스템 progress UI와 command 동작에 직접 영향을 준다.

---

# ▶️ `MediaPlaybackSnapshot`

`MediaPlaybackSnapshot`은 **현재 시점의 재생 상태**를 시스템에 전달한다.

Ambient sound 예제에서는 최소한 다음 정보가 중요하다.

```text
playing
paused
```

개념 예:

```swift
var playbackSnapshot: MediaPlaybackSnapshot? {
    MediaPlaybackSnapshot(
        state: player.isPlaying ? .playing() : .paused
    )
}
```

정해진 duration이 있는 media라면 elapsed time도 함께 제공해야 한다.

즉:

```text
Continuous content
→ playing/paused 중심

Finite-duration content
→ playing/paused + elapsedTime
```

---

# 🎛️ `MediaCommand`

Now Playing surface에서 사용자가 버튼을 누르면 framework가 앱이 선언한 command closure를 호출한다.

예:

- Play
- Pause
- Previous
- Next

개념적인 구조:

```swift
var commands: [MediaCommand] {
    [
        .play { player.play() },
        .pause { player.pause() },
        .previous { player.previous() },
        .next { player.next() }
    ]
}
```

사용자 관점에서는:

```text
Lock Screen의 Pause 탭
        ↓
MediaCommand.pause
        ↓
앱 player.pause()
        ↓
Model 상태 변경
        ↓
Now Playing UI 자동 반영
```

---

# 🔄 Command와 상태 업데이트는 하나의 loop

세션 예제의 중요한 부분은 UI command가 단방향 callback에서 끝나지 않는다는 것이다.

```text
System UI interaction
        ↓
Command closure
        ↓
Playback engine 변경
        ↓
Observable model 변경
        ↓
MediaSession이 변경 감지
        ↓
System UI 업데이트
```

예를 들어 Lock Screen에서 pause하면:

1. pause command가 실행된다.
2. player가 정지한다.
3. model이 paused state를 표현한다.
4. Now Playing surface의 button/state가 바뀐다.

다시 app에서 play해도 같은 model 변경을 통해 system UI가 따라온다.

---

# 🔌 `MediaSession`

`MediaSessionRepresentable`만 구현한다고 시스템과 연결되는 것은 아니다.

실제로 representation을 시스템에 연결하는 객체가 `MediaSession`이다.

개념적인 초기화:

```swift
let player = SoundPlayer()
let model = PlayerModel(player: player)
let session = MediaSession(model)
```

`MediaSession`이 model을 관찰하면서 Now Playing surface를 최신 상태로 유지한다.

구조를 정리하면:

```text
SoundPlayer
    ↓
PlayerModel (@Observable)
    ↓ conforms to
MediaSessionRepresentable
    ↓
MediaSession<PlayerModel>
    ↓
System Now Playing
```

---

# 🧩 기존 플레이어 구조에 최소 침투

이 API 디자인에서 눈에 띄는 부분은 재생 engine 자체를 특정 framework 타입으로 바꿀 필요가 없다는 점이다.

예제에서도 기존 `SoundPlayer`가 그대로 존재하고 그 위에 observable model과 session representation을 얹는다.

따라서 기존 playback architecture를 유지하면서 system integration layer를 추가하는 방식으로 적용할 수 있다.

---

# 🌐 Remote media sessions

세션 후반부는 **앱이 제어하는 media가 iPhone에서 직접 재생되지 않는 경우**로 확장한다.

예제:

```text
iPhone App
   ↕
Server
   ↕
Smart Speaker
```

앱은 smart speaker를 선택하고 server를 통해 다음을 수행한다.

- playback state 조회
- play/pause/next command 전송
- volume 변경

하지만 media가 iPhone에서 재생되는 것은 아니다.

이 경우에도 iPhone의 Lock Screen/Control Center 등에 현재 media와 playback controls를 표시하기 위해 **Remote Media Sessions**를 사용한다.

---

# 🔁 Remote session의 기본 데이터 흐름

Remote media session은 local session보다 하나의 중요한 요소가 더 있다.

**외부 기기 상태가 바뀌었을 때 iPhone의 system UI가 알아야 한다.**

세션에서 설명한 구조:

```text
Remote Speaker
      ↓ state changed
Server
      ↓ APNs push
Apple Push Notification service
      ↓
iPhone system
      ↓
Remote Media Session app extension
      ↓
Updated remote session representation
      ↓
Lock Screen / Control Center
```

---

# 📲 APNs가 remote playback state를 운반

Remote speaker에서 playback 상태가 바뀌면 server가 이를 알고 APNs push를 보낸다.

System은 해당 push를 받아 app extension을 실행하고, extension은 payload에 담긴 최신 상태를 기반으로 session representation을 갱신한다.

중요한 점은 **main app이 foreground에서 실행 중일 필요가 없다는 것**이다.

Remote Now Playing 경험은 extension과 push 기반으로 유지된다.

---

# 🔄 반대 방향: System UI → Remote device

사용자가 iPhone의 Control Center에서 play를 누르면 흐름이 반대로 진행된다.

```text
Control Center
      ↓
Remote session command handler
      ↓
App extension
      ↓
Server request
      ↓
Remote speaker
```

즉 framework는 remote device의 상태를 단순히 표시하는 데 그치지 않고 **system UI를 실제 remote control surface로 만든다.**

---

# 🧱 `RemoteMediaSessionExtension`

Remote session을 사용하려면 app extension을 만든다.

Extension은 `RemoteMediaSessionExtension`을 채택한다.

구성에는 NowPlaying이 제공하는 remote media extension configuration과 해당 extension point가 사용된다.

개념적인 구조:

```swift
@main
final class SampleAppExtension: RemoteMediaSessionExtension {
    var configuration: some AppExtensionConfiguration {
        // RemoteMediaSessionExtensionConfiguration
    }

    func session(_ state: RemotePlayerState) async throws -> RemotePlayerModel {
        RemotePlayerModel(state: state)
    }
}
```

System은 remote representation이 필요할 때 `session(...)`을 통해 model을 생성하거나 가져온다.

---

# 🧠 `RemotePlayerModel`

Remote player model도 local model과 마찬가지로 observable object로 구성된다.

예제의 핵심 상태:

```text
ServerClient
RemotePlayerState
```

즉 model이 직접 audio engine을 제어하는 대신 server와 통신한다.

구조:

```text
RemotePlayerModel
├─ client → server communication
└─ state  → latest server playback state
```

---

# 🪪 `RemoteMediaSessionRepresentable`

Remote model은 `RemoteMediaSessionRepresentable`을 채택한다.

흥미로운 점은 local `MediaSessionRepresentable`과 상당히 유사하다는 것이다.

공통적으로 표현하는 것:

- id
- content
- playback snapshot
- commands

차이는 command의 구현이다.

Local:

```text
.play → local player.play()
```

Remote:

```text
.play → serverClient.send(play)
```

즉 같은 Now Playing UI abstraction을 유지하면서 command transport만 달라진다.

---

# 🎵 Remote content 표현

Remote speaker에서 ambient sound가 재생되고 있어도 콘텐츠 표현 방식은 local과 크게 다르지 않다.

예:

```text
ID          → remote state의 sound ID
Title       → sound name
Subtitle    → sound description
Type        → audio
Duration    → continuous/live
Artwork     → sound artwork
```

이 때문에 사용자에게는 local playback과 remote playback이 모두 동일한 시스템 Now Playing 언어로 나타난다.

---

# ▶️ Remote playback snapshot

Remote model은 server state의 `isPlaying` 값을 기반으로 playback snapshot을 만든다.

```text
Server state
   ↓
isPlaying
   ↓
MediaPlaybackSnapshot
   ↓
System UI
```

Remote device에서 직접 상태가 바뀌면 APNs → extension update를 거쳐 이 값이 갱신된다.

---

# 🎛️ Remote commands

Remote session command도 system surface에서 동일하게 보인다.

예:

- Play
- Pause
- Previous
- Next

하지만 closure는 local engine 대신 server request를 전송한다.

개념 예:

```swift
.play {
    try await client.send(.play)
}
```

다시 말해 Now Playing framework는 **UI command semantic**을 제공하고 실제 transport는 app architecture가 책임진다.

---

# 🔊 `devices`: 실제 재생 장치를 시스템에 설명

Remote session만의 중요한 정보 중 하나가 `devices`다.

하나의 remote session에서 실제 media가 어떤 장치에서 재생되고 있는지를 시스템에 알려준다.

각 `MediaDevice`에는 다음 성격의 정보가 들어간다.

```text
Stable device identifier
Device name
Device type
Capabilities
```

세션에서는 smart speaker를 예로 든다.

Device ID는 다른 session에서도 일관되게 같은 물리 장치를 식별할 수 있도록 stable해야 한다.

---

# 🔉 Device capability와 Volume

`MediaDevice`는 단순히 "Living Room Speaker"라는 이름만 표시하는 객체가 아니다.

장치가 지원하는 기능도 표현한다.

세션의 대표 예는 **absolute volume control**이다.

```text
MediaDevice
└─ capability
   └─ absolute volume
```

Control Center에 device name과 volume slider가 표시되고, 사용자가 slider를 움직이면 volume change handler가 호출된다.

그 handler에서 server에 새로운 volume 값을 전달할 수 있다.

---

# 🔄 `update(_:)`

Remote session에서는 push notification으로 새로운 상태가 들어온다.

이를 model에 반영하는 지점이 `update(_:)`이다.

개념적으로:

```swift
func update(_ state: RemotePlayerState) {
    self.state = state
}
```

Model이 observable이므로 state가 바뀌면 NowPlaying framework가 변경을 감지하고 system UI를 갱신한다.

전체 흐름:

```text
APNs payload
    ↓
RemotePlayerState
    ↓
update(state)
    ↓
Observable state changed
    ↓
Now Playing UI refresh
```

---

# 📦 `RemoteMediaSessionAttributes`

세션의 `RemotePlayerState`는 remote session의 상태 표현이면서 push payload로 전달되는 데이터 구조다.

이 상태 타입은 `RemoteMediaSessionAttributes`와 연결된다.

역할은 크게 다음과 같다.

```text
Server-side session state
        ↕
APNs payload
        ↕
Extension-side representation
```

따라서 remote session을 설계할 때는 UI model뿐 아니라 **server payload schema까지 하나의 contract로 설계**해야 한다.

---

# 🏗️ Remote session 전체 구조

```text
┌─────────────────────┐
│    Remote Speaker   │
└──────────┬──────────┘
           │ state / command
           ↓
┌─────────────────────┐
│       Server        │
└──────┬────────┬─────┘
       │        │
   APNs push    │ command request
       │        ↑
       ↓        │
┌─────────────────────┐
│ Remote Media Session│
│    App Extension    │
└──────────┬──────────┘
           │
           ↓
┌─────────────────────┐
│ System Now Playing  │
│ Lock Screen / CC    │
└─────────────────────┘
```

이 구조는 iPhone 앱이 열려 있지 않아도 remote media를 system experience에 유지할 수 있게 한다.

---

# 🧩 Local과 Remote API의 의도적 대칭성

이번 프레임워크 설계에서 가장 눈에 띄는 부분 중 하나다.

Local:

```text
MediaSessionRepresentable
MediaSession
```

Remote:

```text
RemoteMediaSessionRepresentable
RemoteMediaSessionExtension
```

두 경우 모두 모델은 다음을 선언한다.

```text
What is playing?
What is the playback state?
What commands are supported?
```

Remote에서는 여기에 다음이 추가된다.

```text
Which devices are playing?
How does state arrive from the server?
How are commands sent back?
```

따라서 local playback을 이해하고 나면 remote playback도 같은 mental model로 확장할 수 있다.

---

# 📡 Media Sharing Extensions

마지막 주제는 Media Sharing Extensions다.

이 기능은 remote media session과 목적이 다르다.

Remote media session:

```text
외부 장치에서 이미 재생 중인 session을
System Now Playing에 표현하고 제어
```

Media Sharing Extensions:

```text
iPhone에서 선택한 media를
외부 speaker / TV 등으로 보내기 위한
device selection과 protocol integration 단순화
```

---

# 📦 기존 방식: SDK를 앱에 직접 포함

전통적으로 특정 media protocol을 지원하려면 protocol vendor의 SDK를 앱 bundle에 포함해야 했다.

```text
App Bundle
├─ App code
├─ Protocol A SDK
├─ Protocol B SDK
└─ Protocol C SDK
```

Protocol이 늘어날수록 앱은 다음 부담을 가진다.

- SDK integration
- SDK updates
- protocol-specific UI
- device discovery differences
- binary size와 maintenance complexity

---

# 🧩 Media Sharing Extensions 방식

Media Sharing Extensions에서는 protocol implementation이 앱 밖에 존재하고 시스템이 관리한다.

```text
App
   ↓
System media device picker
   ↓
Media Sharing Extensions
   ↓
Available playback protocols
   ↓
Speaker / TV / other device
```

앱은 각 protocol implementation을 직접 bundle하지 않아도 된다.

---

# 🎯 App은 Content에 집중

Apple이 세션에서 강조하는 메시지는 매우 명확하다.

기존:

```text
App = Content + Playback UX + Protocol SDK integration
```

Media Sharing Extensions 이후:

```text
App = Content + Playback UX
System = Protocol integration + Device picker
```

즉 playback transport technology를 system layer로 이동시킨다.

---

# 🖥️ System Device Picker

Media Sharing Extensions를 사용하면 앱은 통합된 system device picker를 사용할 수 있다.

사용자가 picker에서 장치를 선택하면 그 선택은 Control Center 같은 system surface에도 반영된다.

이 일관성은 매우 중요하다.

앱 안에서는 A 장치가 선택되어 있는데 Control Center에는 다른 상태가 보이는 식의 불일치를 줄일 수 있다.

---

# 🔮 향후 Protocol 확장성

세션에서는 Media Sharing Extensions의 또 다른 장점으로 protocol 확장성을 설명한다.

새로운 protocol implementation이 system에서 사용 가능해질 때 앱이 매번 새로운 SDK를 직접 통합하지 않아도 그 protocol을 활용할 수 있는 구조다.

즉 앱과 protocol implementation의 결합을 낮춘다.

---

# 📊 세 가지 API 영역 비교

| 영역 | 목적 | 실행 위치 | 핵심 API/구조 | State source |
|---|---|---|---|---|
| Media Sessions | 로컬 재생을 시스템에 노출 | App | `MediaSessionRepresentable`, `MediaSession` | Local player/model |
| Remote Media Sessions | 외부 장치 재생을 시스템에 노출·제어 | App Extension | `RemoteMediaSessionRepresentable`, `RemoteMediaSessionExtension` | Server + APNs |
| Media Sharing Extensions | iPhone media를 외부 장치로 route | System-managed extension | System device picker + sharing extensions | Device/protocol layer |

---

# 🔁 Local Media Session 구현 흐름

```text
Existing playback engine
       ↓
@Observable PlayerModel
       ↓
Adopt MediaSessionRepresentable
       ↓
Provide
- id
- content
- playbackSnapshot
- commands
       ↓
Create MediaSession(model)
       ↓
System surfaces observe session
```

---

# 🔁 Remote Media Session 구현 흐름

```text
Define server state payload
       ↓
RemoteMediaSessionAttributes
       ↓
Create app extension
       ↓
Adopt RemoteMediaSessionExtension
       ↓
Create @Observable RemotePlayerModel
       ↓
Adopt RemoteMediaSessionRepresentable
       ↓
Provide
- id
- content
- playbackSnapshot
- commands
- devices
- update(state)
       ↓
Server sends APNs updates
       ↓
System launches extension
       ↓
Now Playing surfaces update
```

---

# 🔄 Remote command round trip

```text
User taps Play in Control Center
        ↓
NowPlaying framework
        ↓
Remote command closure
        ↓
ServerClient.send(.play)
        ↓
Server
        ↓
Remote speaker starts playback
        ↓
Speaker state changes
        ↓
Server sends APNs
        ↓
Extension receives new state
        ↓
update(state)
        ↓
Control Center reflects playing state
```

이 round trip을 이해하는 것이 remote session 설계에서 가장 중요하다.

---

# 🧭 API 설계에서 읽을 수 있는 방향

이번 세션의 API는 Apple이 Now Playing integration을 **명령 중심 API에서 상태 모델 중심 API로 옮기고 있다는 점**을 보여준다.

핵심 단위는 command center 자체가 아니라 observable session representation이다.

```text
State
+ Content metadata
+ Supported commands
= Media session representation
```

System이 그 representation을 보고 각 surface를 구성한다.

---

# 💡 기존 Now Playing 구현과 비교할 때 볼 지점

이 세션은 새로운 framework 자체에 초점을 맞추기 때문에 이전 API migration을 상세히 설명하지는 않는다.

하지만 새 모델에서 눈에 띄는 특징은 다음과 같다.

- Swift-first protocol 기반 모델링
- Observation 기반 state propagation
- Local/remote session의 공통 mental model
- Artwork의 async representation
- Command closure를 model에 함께 정의
- System surfaces가 session state를 자동 관찰
- Remote playback을 app extension과 APNs로 공식 지원

즉 앱이 system now-playing metadata를 수동으로 계속 동기화하기보다 **하나의 상태 모델을 source of truth로 제공**하는 방향이다.

---

# 🧪 구현 시 체크해야 할 State 설계

NowPlaying integration에서 가장 먼저 정해야 할 것은 UI가 아니라 session state다.

## Content identity

- 현재 item의 stable ID가 있는가?
- item 변경 시 ID도 올바르게 바뀌는가?
- artwork cache와 연결 가능한가?

## Playback state

- playing / paused가 실제 engine과 일치하는가?
- finite media라면 elapsed time을 정확히 제공하는가?
- remote state latency가 UI를 오도하지 않는가?

## Commands

- 실제 지원하는 command만 노출하는가?
- command 실행 실패를 어떻게 처리할 것인가?
- remote command의 network error를 고려했는가?

## Remote devices

- device ID가 session을 넘어 stable한가?
- volume capability가 실제 device 특성과 맞는가?
- 여러 device가 한 session에 있을 수 있는가?

---

# 🧵 Observation과 동기화

Local/remote 예제 모두 `@Observable`을 사용한다.

이것은 단순 Swift syntax 선택이 아니라 framework 사용 방식의 핵심이다.

```text
Source of truth 변경
      ↓
Observation
      ↓
NowPlaying framework가 감지
      ↓
System UI 갱신
```

따라서 별도 "updateNowPlayingInfo()" 호출을 여기저기 흩어놓는 형태보다 model state consistency가 훨씬 중요해진다.

---

# 🌍 System surface별 UI를 앱이 직접 만들지 않는다

앱은 Lock Screen, Dynamic Island, CarPlay 각각을 위해 별도 media UI를 정의하는 것이 아니다.

앱이 제공하는 것은:

- Content
- Playback state
- Commands
- Device metadata

System은 이를 각 surface에 맞게 표현한다.

```text
App semantics
      ↓
System presentation
```

이 분리가 NowPlaying framework의 가장 큰 가치 중 하나다.

---

# 🚗 CarPlay와 다른 플랫폼으로 자연스럽게 확장

Now Playing system experience는 iPhone만의 기능이 아니다.

세션에서 Apple은 여러 플랫폼을 함께 언급한다.

따라서 올바르게 session을 제공하는 것이 단순 Lock Screen 개선에 그치지 않고 system media experience 전반에 영향을 준다.

특히 media app이라면 system integration 자체가 핵심 product surface가 된다.

---

# 🧱 Architecture 예시

앱 내부를 다음처럼 나눌 수 있다.

```text
Playback Engine
      ↓
Playback Domain Model (@Observable)
      ↓
Now Playing Representation
      ↓
MediaSession
      ↓
System Surfaces
```

Remote의 경우:

```text
Remote Device
      ↕
Backend
      ↕
Remote Session State
      ↕
Remote Media Session Extension
      ↕
System Surfaces
```

이때 핵심은 NowPlaying layer가 playback business logic 자체를 소유하지 않도록 하는 것이다.

---

# ⚠️ Remote Session에서 주의할 점

## Push state는 authoritative state여야 한다

Remote device에서 직접 조작된 변경도 server가 알아야 하고, 그 변경이 APNs를 통해 iPhone에 도달해야 한다.

그렇지 않으면 system UI가 stale state를 표시할 수 있다.

## Command 성공을 미리 가정하지 않는다

Control Center에서 play command를 보냈다고 remote speaker가 반드시 즉시 재생되는 것은 아니다.

Network/server/device failure 가능성이 있다.

최종 UI state는 가능한 한 remote authoritative state에 기반해야 한다.

## Device identifier는 stable하게

`MediaDevice` ID는 session마다 임의 생성하는 값이 아니라 동일한 장치를 지속적으로 식별할 수 있어야 한다.

## Volume capability를 실제 장치와 일치시킨다

Absolute volume을 지원하지 않는 장치에 absolute volume semantics를 억지로 부여하면 system UI와 실제 behavior가 어긋난다.

---

# 📋 Local Media Session 체크리스트

- [ ] 기존 playback model을 source of truth로 유지
- [ ] `MediaSessionRepresentable` 채택
- [ ] Stable session `id` 정의
- [ ] 콘텐츠 종류에 맞는 content representation 선택
- [ ] Stable content ID 제공
- [ ] Title/subtitle 제공
- [ ] Audio/video media type 지정
- [ ] Duration semantics 정확히 지정
- [ ] Artwork loader 구현
- [ ] Current playback snapshot 제공
- [ ] Finite content라면 elapsed time 제공
- [ ] 실제 지원하는 command만 등록
- [ ] `MediaSession(model)` 생성
- [ ] App 내 조작이 system surface에 반영되는지 검증
- [ ] System command가 app player에 반영되는지 검증

---

# 📋 Remote Media Session 체크리스트

- [ ] Remote state payload schema 정의
- [ ] `RemoteMediaSessionAttributes` 적용 검토
- [ ] Remote media app extension 생성
- [ ] `RemoteMediaSessionExtension` 채택
- [ ] Extension point/configuration 설정
- [ ] Observable remote model 생성
- [ ] `RemoteMediaSessionRepresentable` 채택
- [ ] Stable remote session ID 제공
- [ ] Current remote content 표현
- [ ] Remote playback snapshot 제공
- [ ] Commands를 server requests에 연결
- [ ] `MediaDevice` 목록 생성
- [ ] Stable device ID 사용
- [ ] Device type 지정
- [ ] Volume 등 capability 정의
- [ ] APNs server 구성
- [ ] Push payload → remote state 변환 검증
- [ ] `update(_:)`로 state 갱신
- [ ] Remote device 직접 조작 → system UI 갱신 검증
- [ ] System UI command → remote device 실행 검증

---

# 📋 Media Sharing Extensions 체크리스트

- [ ] 현재 앱이 media protocol SDK를 직접 bundle하고 있는지 확인
- [ ] System device picker 적용 가능성 검토
- [ ] Media Sharing Extension 지원 protocol 확인
- [ ] Device selection이 Control Center와 일치하는지 확인
- [ ] Protocol-specific UI를 줄일 수 있는지 검토
- [ ] 새 protocol 확장 시 앱 업데이트 의존성을 줄일 수 있는지 검토

---

# 🧪 테스트 시나리오

## Local playback

1. 앱에서 media 시작
2. Lock Screen 표시 확인
3. Artwork/title/subtitle 확인
4. Lock Screen에서 pause
5. 앱 state 확인
6. 앱에서 play
7. Lock Screen state 확인
8. Next/Previous 검증

## Remote playback

1. 앱에서 remote speaker 선택
2. Speaker에서 직접 play/pause
3. Server state 변경 확인
4. APNs 수신 확인
5. System Now Playing state 갱신 확인
6. Control Center에서 command 실행
7. Server request 확인
8. Remote speaker 동작 확인
9. 새 상태 push 후 system UI 최종 동기화 확인

## Device capability

1. Control Center에 device name 표시 확인
2. Volume slider 표시 확인
3. Slider 변경
4. Server request 확인
5. Speaker volume 변경 확인
6. Speaker 자체 volume 변경 시 reverse update 확인

---

# 🧭 어떤 경우 어떤 기능을 써야 하나

## 앱이 기기에서 직접 재생한다

```text
MediaSessionRepresentable
+
MediaSession
```

## 앱이 스마트 스피커/TV 등 다른 장치의 재생을 제어한다

```text
RemoteMediaSessionRepresentable
+
RemoteMediaSessionExtension
+
APNs
```

## 앱의 media를 다양한 외부 playback protocol로 보내고 싶다

```text
Media Sharing Extensions
+
System device picker
```

셋은 경쟁 API가 아니라 서로 다른 playback topology를 다룬다.

---

# 🎯 구현 우선순위

기존 media app에 단계적으로 도입한다면 다음 순서가 자연스럽다.

```text
1. Local playback model 정리
2. MediaSessionRepresentable 연결
3. Lock Screen / Control Center 검증
4. Remote device 제어가 있다면 remote session extension 도입
5. APNs state synchronization 구축
6. Device capabilities 연결
7. Media Sharing Extensions 적용 가능성 검토
```

---

# 🧠 핵심 설계 포인트

이번 세션에서 가장 중요한 설계 포인트를 압축하면 다음과 같다.

### 상태 중심

System UI를 직접 조작하지 않고 session state를 제공한다.

### Local/Remote 대칭 구조

Playback location이 달라도 content, snapshot, command라는 같은 개념을 사용한다.

### System-owned presentation

앱은 semantic information을 제공하고 각 system surface의 presentation은 OS가 담당한다.

### Remote는 extension + push

Main app의 실행 상태에 의존하지 않고 remote session을 유지한다.

### Protocol integration 분리

Media Sharing Extensions를 통해 protocol SDK를 app과 decouple한다.

---

# 🔍 세션에서 사용한 주요 API

```text
NowPlaying
Observation
ExtensionFoundation

MediaSessionRepresentable
MediaSession
MediaContentRepresentable
GenericContent
Artwork
ArtworkRepresentation
MediaPlaybackSnapshot
MediaCommand

RemoteMediaSessionExtension
RemoteMediaSessionExtensionConfiguration
RemoteMediaSessionRepresentable
RemoteMediaSessionAttributes
MediaDevice

Media Sharing Extensions
```

---

# 🧩 주요 API 관계도

```text
Local
─────
PlayerModel
  └─ MediaSessionRepresentable
        ├─ content
        ├─ playbackSnapshot
        └─ commands
             ↓
        MediaSession
             ↓
        System Now Playing

Remote
──────
RemotePlayerState
  └─ RemoteMediaSessionAttributes
             ↓
RemotePlayerModel
  └─ RemoteMediaSessionRepresentable
        ├─ content
        ├─ playbackSnapshot
        ├─ commands
        ├─ devices
        └─ update(state)
             ↓
RemoteMediaSessionExtension
             ↕ APNs / server
        Remote Device
```

---

# 🌟 핵심 메시지

Now Playing framework의 핵심은 "Lock Screen에 몇 개의 metadata field를 채운다"는 수준을 넘어선다.

Apple은 미디어 재생을 **하나의 observable session model**로 다루고, 그 모델을 운영체제의 다양한 media surface에 연결하는 구조를 제공한다.

로컬 재생에서는:

```text
Playback Model
→ MediaSessionRepresentable
→ MediaSession
→ System
```

원격 재생에서는:

```text
Remote Device
↔ Server
↔ APNs / Extension
↔ RemoteMediaSessionRepresentable
↔ System
```

그리고 외부 장치로 media를 보내는 protocol integration은:

```text
App
→ System Device Picker
→ Media Sharing Extensions
→ External Device
```

으로 분리된다.

결국 이번 프레임워크가 지향하는 구조는 다음과 같다.

```text
App owns media semantics and playback logic
              +
System owns consistent Now Playing presentation
              +
Extensions bridge remote devices and protocols
```

미디어 앱은 시스템 surface마다 별도 integration 코드를 반복하기보다 **무엇을 재생 중이고, 상태가 무엇이며, 어떤 명령을 지원하는지**를 정확한 모델로 제공하는 데 집중할 수 있다.

---

# 함께 보면 좋은 자료

Apple이 세션에서 연결한 관련 자료:

- Publishing media sessions
- Publishing remote media sessions
- Routing media to third-party devices
- Setting up a remote notification server

