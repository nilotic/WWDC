# WWDC26 Meet the Music Understanding framework 요약

- Session: 253
- Title: Meet the Music Understanding framework
- Source: https://developer.apple.com/videos/play/wwdc2026/253/
- Topic: Music Understanding, on-device audio analysis, rhythm, structure, pace, instrument activity, loudness, MusicUnderstandingSession, AVAsset, AsyncSequence
- Chapters: Introduction, Musical features, Framework integration, Music Understanding Lab

---

## 한 줄 요약

**Music Understanding**은 Apple 플랫폼에서 오디오를 완전히 온디바이스로 분석해 **key, rhythm, structure, pace, instrument activity, loudness**의 여섯 가지 음악적 특징을 반환하는 프레임워크이며, `MusicUnderstandingSession` 하나로 파일 기반 분석과 custom audio streaming을 모두 처리하고, 결과를 `CMTime`/`CMTimeRange` 기반의 `TimedValue`·`RangedValue`로 제공해 편집, 시각화, DJ, 게임, 음악 동기화 기능을 만들 수 있게 한다.

---

## 핵심 요약

Music Understanding의 핵심은 음악 분석에 필요한 신호 처리와 ML inference를 앱 개발자 대신 프레임워크가 처리한다는 점이다.

- 모든 처리는 **on-device**
- 분석 오디오는 기기 밖으로 나가지 않음
- 오프라인에서도 동작
- Signal processing 또는 ML 전문 지식 불필요
- Apple 전 플랫폼 대상
- `AVAsset` 또는 custom `AudioProvider`를 입력으로 사용
- `analyze()`로 전체 분석
- `analyze(for:)`로 필요한 분석만 선택 가능
- 결과는 모두 `Codable`
- 시간 기반 값은 `CMTime` / `CMTimeRange`로 표현
- Loudness는 `AsyncSequence` 기반 streaming API도 제공

Apple 내부에서는 이미 Final Cut Pro의 beat detection과 iPad용 montage 기능에 사용된다.

---

# 🎵 Music Understanding이 분석하는 여섯 영역

프레임워크가 제공하는 분석 영역은 다음 여섯 가지다.

```text
Key
Rhythm
Structure
Pace
Instrument Activity
Loudness
```

이 여섯 결과는 서로 독립적이지만, 실제 기능에서는 조합했을 때 가치가 커진다.

예를 들어:

```text
Structure
  +
Pace
  ↓
영상 컷 길이와 전환 위치 결정
```

또는:

```text
Rhythm
  +
Instrument Activity
  ↓
Beat / drum-reactive animation
```

---

# 🔐 온디바이스 분석

Music Understanding의 중요한 특성은 분석이 전부 기기에서 일어난다는 점이다.

Apple은 이를 두 가지 장점으로 설명한다.

- Privacy: 분석 대상 오디오가 기기 밖으로 전송되지 않음
- Offline: 네트워크 연결 없이 분석 가능

서버 기반 음악 분석 파이프라인을 별도로 운영하지 않아도 된다.

---

# 🎬 Apple 내부 사용 사례: Final Cut Pro

Apple은 Music Understanding을 실제 Final Cut Pro 기능에 사용한다.

## Beat Detection

Final Cut Pro는 곡의 rhythm과 structure를 분석해 beat grid를 표시한다.

이 grid는 편집자가 다음 요소에 맞춰 컷을 배치할 수 있게 한다.

- Song parts
- Bars
- Beats

## Montage in Final Cut Pro for iPad

Montage 기능은 다음 세 분석을 함께 사용한다.

```text
Rhythm
Pace
Structure
```

이를 기반으로 clip을 음악에 자동으로 동기화한다.

---

# 🥁 Rhythm의 계층

세션은 음악 구조를 아래처럼 설명한다.

```text
Beat
 ↓
Bar
 ↓
Phrase
 ↓
Segment
 ↓
Section
```

Beat는 음악의 pulse다.

여러 beat가 bar를 만들고, 여러 bar는 phrase를 이룬다.

Phrase는 musical sentence처럼 볼 수 있고, 여러 phrase가 segment를 만들며, segment가 모여 section을 만든다.

Section은 일반적으로 다음과 같은 구간에 해당할 수 있다.

- Intro
- Verse
- Chorus
- Bridge

---

# ⏱️ Tempo와 BPM

한 분 동안의 beat 개수를 **beats per minute**, 즉 BPM이라고 한다.

Music Understanding의 rhythm 분석에서는 전체 tempo를 `beatsPerMinute`으로 제공한다.

하지만 BPM은 optional이다.

그 이유는 분석된 오디오에서 최소 두 개의 beat를 찾기 전에는 tempo를 계산할 수 없기 때문이다.

---

# 🎼 Key

악기와 보컬은 공통된 음 체계 안에서 연주되며, 이를 key라고 한다.

Music Understanding에서 key는 다음 두 요소로 표현된다.

```text
KeySignature
├─ tonic
└─ mode
```

- `tonic`: root pitch
- `mode`: major 또는 minor

---

# ⚡ Pace

Pace는 단순 BPM과 다르다.

곡 전체의 tempo가 일정하더라도 어떤 구간은 더 빠르고 에너지가 높게 느껴지고, 다른 구간은 느리고 차분하게 느껴질 수 있다.

Music Understanding은 이 **perceived speed / energy**를 pace로 분석한다.

따라서 BPM이 동일한 곡 안에서도 구간별 pace는 달라질 수 있다.

---

# 🎸 Instrument Activity

Music Understanding은 특정 악기가 어느 시점에 존재하는지뿐 아니라, 해당 악기가 mix에서 얼마나 강하게 들리는지도 분석한다.

결과는 두 종류다.

```text
ranges
activity
```

`ranges`는 존재 여부 중심이고 `activity`는 강도 중심이다.

---

# 🔊 Loudness

Loudness는 단순 amplitude가 아니라 사람이 인지하는 음량을 모델링한다.

Music Understanding은 **LUFS (Loudness Units Full Scale)**를 사용한다.

주요 결과:

- Integrated loudness
- Momentary loudness
- Short-term loudness
- Peak

---

# 🧭 Framework의 기본 흐름

앱은 `MusicUnderstandingSession`을 중심으로 동작한다.

```text
Audio Input
   ↓
MusicUnderstandingSession
   ↓
analyze()
   ↓
SessionResult
```

Session은 두 가지 방식으로 초기화할 수 있다.

```text
AVAsset
or
Custom AudioProvider
```

---

# 📂 AVAsset으로 분석 시작

샘플 앱인 Music Understanding Lab은 SwiftUI의 `fileImporter`로 사용자가 오디오 파일을 선택하도록 한다.

선택한 URL에서 `AVURLAsset`을 만든다.

```swift
import MusicUnderstanding

.fileImporter(isPresented: $isPresented, allowedContentTypes: [.audio]) { result in
    switch result {
    case .success(let url):
        let asset = AVURLAsset(
            url: url,
            options: [
                AVURLAssetPreferPreciseDurationAndTimingKey: true
            ]
        )
        let session = try await MusicUnderstandingSession(asset: asset)
        let results = try await session.analyze()
    }
}
```

Apple은 정확한 분석 결과를 위해 `AVURLAssetPreferPreciseDurationAndTimingKey`를 `true`로 설정하라고 설명한다.

---

# 🎯 전체 분석과 Targeted Analysis

기본 `analyze()` 호출은 모든 분석 종류를 실행한다.

```swift
let results = try await session.analyze()
```

하지만 모든 결과가 필요하지 않다면 특정 분석만 요청하는 편이 더 효율적이다.

개념적으로:

```swift
try await session.analyze(for: [.loudness])
```

이 방식은 필요 없는 계산을 피할 수 있어 성능상 유리하다.

---

# 📦 `SessionResult`

전체 결과는 `SessionResult`에 모인다.

```swift
import MusicUnderstanding

public struct SessionResult: Codable, Sendable {
    public let instrumentActivity: InstrumentActivityResult?
    public let key: KeyResult?
    public let loudness: LoudnessResult?
    public let pace: PaceResult?
    public let rhythm: RhythmResult?
    public let structure: StructureResult?
}
```

모든 결과가 optional인 이유는 targeted analysis 때문이다.

`analyze()`를 사용하면 전체 결과가 채워진다.

`analyze(for:)`로 일부만 요청하면 요청하지 않은 필드는 `nil`이 된다.

---

# 🕒 시간 기반 데이터의 공통 모델

Music Understanding은 시간과 값을 연결하기 위해 두 가지 generic 타입을 사용한다.

```text
TimedValue
RangedValue
```

---

# ⏱️ `TimedValue`

특정 시점에 하나의 값을 연결한다.

```swift
public struct TimedValue<Value>: Codable, Equatable, Sendable
where Value: Codable & Equatable & Sendable {
    public let time: CMTime
    public let value: Value
}
```

예:

```text
12.4 sec → loudness -18.5 LUFS
```

---

# 🧱 `RangedValue`

하나의 시간 범위에 값을 연결한다.

```swift
public struct RangedValue<Value>: Codable, Equatable, Sendable
where Value: Codable & Equatable & Sendable {
    public let range: CMTimeRange
    public let value: Value
}
```

예:

```text
00:00 – 00:32 → D♭ Major
```

---

# 🎹 Key 분석

Key 분석 결과는 `KeyResult`다.

```swift
public struct KeyResult: Codable, Sendable {
    public let ranges: [MusicUnderstandingSession.RangedValue<KeySignature>]
}
```

한 곡에서 시간에 따라 key가 바뀔 수 있기 때문에 단일 값이 아니라 `RangedValue<KeySignature>` 배열을 반환한다.

---

# 🎼 `KeySignature`

```swift
public struct KeySignature: Codable, Hashable, Sendable {
    public let tonic: Tonic
    public let mode: Mode
}
```

`Tonic`은 chromatic pitch를 표현한다.

```swift
@frozen public enum Tonic: String, Codable, Hashable, Sendable {
    case aFlat, aSharp, a, bFlat, b,
         c, cSharp,
         d, dFlat, dSharp,
         eFlat, e,
         f, fSharp,
         g, gFlat, gSharp
}
```

Mode:

```swift
public enum Mode: String, Codable, Hashable, Sendable {
    case major, minor
}
```

---

# 🥁 Rhythm 분석

Rhythm 결과:

```swift
import MusicUnderstanding

public struct RhythmResult: Codable, Sendable {
    public let beats: [CMTime]
    public let bars: [CMTime]
    public let beatsPerMinute: Float?
}
```

세 가지 정보를 제공한다.

```text
beats → 각 beat의 timestamp
bars  → 각 bar의 timestamp
beatsPerMinute → 전체 global tempo
```

BPM은 최소 두 beat를 찾기 전까지 `nil`일 수 있다.

---

# 🧱 Structure 분석

곡의 구조는 세 단계로 제공된다.

```text
Sections
 ↓
Segments
 ↓
Phrases
```

API:

```swift
import MusicUnderstanding

public struct StructureResult: Codable, Sendable {
    public let sections: [CMTimeRange]
    public let segments: [CMTimeRange]
    public let phrases: [CMTimeRange]
}
```

각 항목이 단순한 timestamp가 아니라 `CMTimeRange`인 이유는 각 구조가 음악의 일정 구간을 차지하기 때문이다.

---

# ⚡ Pace 분석

Pace는 listener가 느끼는 곡의 빠르기 / 에너지다.

```swift
import MusicUnderstanding

public struct PaceResult: Codable, Sendable {
    public let ranges: [MusicUnderstandingSession.RangedValue<Double>]
}
```

Pace는 시간 범위별 값으로 제공된다.

높은 값은 상대적으로 빠르고 energetic한 구간을 의미하고, 낮은 값은 더 느리고 차분한 구간을 의미한다.

---

# 🎸 Instrument Activity 분석

결과:

```swift
import MusicUnderstanding

public struct InstrumentActivityResult: Codable, Sendable {
    public let ranges: [Instrument: [CMTimeRange]]
    public let activity: [Instrument: [MusicUnderstandingSession.TimedValue<Float>]]
}
```

두 property의 목적이 다르다.

---

# 📍 Instrument `ranges`

```text
Instrument
   ↓
[CMTimeRange]
```

어떤 악기가 언제 존재하는지만 알고 싶은 경우 적합하다.

예:

```text
Drums
00:12–00:48
01:03–01:40
```

---

# 📈 Instrument `activity`

```text
Instrument
   ↓
[TimedValue<Float>]
```

Float는 0~1 범위에서 해당 악기의 강도를 표현한다.

1에 가까울수록 mix에서 더 강하게 들린다.

이 데이터는 audio-reactive animation의 입력으로 사용하기 좋다.

---

# 🔊 Loudness 분석

`LoudnessResult`:

```swift
import MusicUnderstanding

public struct LoudnessResult: Codable, Sendable {
    public let integrated: MusicUnderstandingSession.TimedValue<Float>
    public let momentary: [MusicUnderstandingSession.TimedValue<Float>]
    public let shortTerm: [MusicUnderstandingSession.TimedValue<Float>]
    public let peak: MusicUnderstandingSession.TimedValue<Float>
}
```

---

# 📏 Integrated Loudness

곡 전체의 평균 loudness를 나타낸다.

UI에서 곡 전체의 전반적인 볼륨 수준을 한 값으로 보여줄 때 사용할 수 있다.

---

# ⚡ Momentary Loudness

Momentary 값은 매 100ms마다 제공된다.

계산 window:

```text
400ms
```

짧고 갑작스러운 loudness spike를 감지하는 데 적합하다.

---

# 🌊 Short-Term Loudness

Short-term 값 역시 매 100ms마다 제공된다.

계산 window:

```text
3 seconds
```

Momentary보다 부드럽게 변화하기 때문에 전체적인 loudness trend를 보기 좋다.

---

# 🚨 Peak

Peak는 트랙이 최대 레벨에 도달한 지점과 값을 나타낸다.

측정 단위는 decibel이다.

따라서 단순 평균 loudness와는 다른 용도다.

---

# 🌊 Loudness Streaming API

Music Understanding은 loudness에 대해 streaming API도 제공한다.

```swift
import MusicUnderstanding

public var loudnessResults:
    some AsyncSequence<LoudnessResult, any Error> & Sendable
```

분석이 끝날 때까지 기다리지 않고 결과를 계속 받을 수 있다.

값은 분석된 오디오 기준 약 100ms마다 전달된다.

---

# ⚙️ Streaming 예제

분석 task와 result 소비 task를 동시에 실행한다.

```swift
import MusicUnderstanding

let audioProvider = AudioProvider()
let session = MusicUnderstandingSession(audioProvider: audioProvider)

await withThrowingTaskGroup(of: Void.self) { taskGroup in
    taskGroup.addTask {
        for try await result in await session.loudnessResults {
            updateAudioLevel(result.momentary.value)
        }
    }

    taskGroup.addTask {
        try await session.analyze(for: [.loudness])
    }
}
```

구조는 다음과 같다.

```text
Task A
Consume loudnessResults

Task B
Run analysis
```

실시간 meter나 audio-reactive UI를 만들 때 적합하다.

---

# 🎤 Custom `AudioProvider`

`AVAsset` 대신 앱이 직접 audio buffer를 공급할 수도 있다.

AudioProvider는 `AsyncSequence` 역할을 한다.

```swift
import MusicUnderstanding

struct AudioProvider: AsyncSequence, AsyncIteratorProtocol {
    func makeAsyncIterator() -> Self {
        return self
    }

    mutating func next() async -> AVReadOnlyAudioPCMBuffer? {
        // Return the next audio buffer, or nil to signal completion
    }
}
```

각 iteration에서 `AVReadOnlyAudioPCMBuffer`를 반환한다.

모든 오디오를 전달한 뒤에는 최종 `nil`을 반환해 완료를 알려야 한다.

---

# 🔁 AVAsset vs AudioProvider

| 입력 방식 | 장점 | 적합한 경우 |
|---|---|---|
| `AVAsset` | 구현이 가장 단순 | 파일·미디어 자산 분석 |
| `AudioProvider` | custom stream 제어 | 실시간 pipeline, 자체 decoder, 특수 입력 |

둘 다 최종적으로 `MusicUnderstandingSession`을 사용한다.

---

# 🧪 Music Understanding Lab

Apple은 프레임워크 전체를 체험할 수 있는 sample app **Music Understanding Lab**을 제공한다.

앱은 오디오를 선택하면 분석 결과를 tile 형태로 시각화한다.

예:

```text
Key Tile
Rhythm Tile
Structure Tile
Pace Tile
Instrument Activity Tile
Loudness Tile
Video Tile
```

재생 중에는 playhead 위치에 맞춰 rhythm과 structure UI가 동적으로 업데이트된다.

---

# 🎹 Key Tile

현재 key를 표시한다.

예:

```text
D♭ Major
```

곡 중간에 modulation이 있다면 `RangedValue<KeySignature>`를 이용해 시간에 따른 key 변화를 표현할 수 있다.

---

# 🥁 Rhythm Tile

Rhythm tile은 다음을 시각화한다.

- BPM
- Beat indicators

재생할 때 각 beat timestamp에 맞춰 indicator를 점등할 수 있다.

---

# 🧱 Structure Tile

세 개의 row로 song hierarchy를 보여준다.

```text
Sections
Segments
Phrases
```

각 block은 `CMTimeRange`에 대응한다.

재생 중에는 현재 위치에 해당하는 section, segment, phrase가 highlight된다.

---

# ⚡ Pace Tile

Pace는 vertical bar graph처럼 표현된다.

```text
Higher bar → faster / more energetic
Lower bar  → slower / less energetic
```

BPM과 달리 구간별 perceived energy를 표현하는 것이 중요하다.

---

# 🎸 Instrument Activity Tile

두 종류 UI가 가능하다.

## Presence View

`ranges` 사용:

```text
Drums   █████   ███
Bass      ███████
Vocals ███    █████
```

## Activity Graph

`activity` 사용:

시간에 따른 0~1 강도를 그래프로 표시한다.

---

# 🔊 Loudness Tile

UI에는 다음 요소가 표시된다.

- Integrated loudness
- Momentary loudness graph
- Short-term trend
- Peak

Momentary와 short-term의 time window가 다르므로 시각적 성격도 다르다.

---

# 💾 모든 결과는 `Codable`

Music Understanding의 결과는 모두 `Codable`이다.

따라서 JSON export가 매우 간단하다.

```swift
import MusicUnderstanding

let session = try await MusicUnderstandingSession(asset: asset)
let results = try await session.analyze()

let encoder = JSONEncoder()
try encoder.encode(results)
```

이 특성은 여러 방식으로 활용할 수 있다.

- 분석 결과 cache
- preprocessing pipeline
- debugging
- dataset creation
- 게임 asset과 함께 bundle
- 편집 프로젝트 metadata 저장

---

# 🎞️ Structure + Pace로 음악 동기 영상 생성

Music Understanding Lab의 Video tile은 structure와 pace를 조합해 음악에 맞는 영상을 만든다.

알고리즘은 다음 순서다.

```text
1. Song section time ranges 식별
2. 각 section의 pace 계산
3. Pace를 이용해 section 내부 clip 수 결정
4. Clip duration 계산
5. Video clip retiming
6. Section 시작점에 맞춰 clip 배치
```

---

# 🧮 Pace를 Clip Duration으로 변환

세션의 간단한 공식:

```swift
let timePerClip = 60 / paceValue
```

Pace가 event-per-minute rate처럼 사용되기 때문에 60으로 나누면 한 event당 시간을 구할 수 있다.

결과:

```text
Higher pace
→ shorter clips
→ faster editing

Lower pace
→ longer clips
→ slower editing
```

---

# 🎬 Section Boundary를 활용하는 이유

단순히 일정 간격으로 컷을 나누는 대신 section boundary에서 clip을 시작한다.

즉:

```text
Intro 시작
Verse 시작
Chorus 시작
Bridge 시작
```

같은 음악적 구조가 영상 전환 기준이 된다.

이렇게 하면 편집이 음악 구조와 더 자연스럽게 맞는다.

---

# 🧠 분석 결과 조합의 의미

Music Understanding은 각 API를 독립적으로 사용할 수도 있지만 서로 결합할수록 강력해진다.

예:

```text
Rhythm + Structure
→ Beat-aware timeline editing
```

```text
Pace + Structure
→ Energy-aware montage
```

```text
Instrument Activity + Loudness
→ Audio-reactive graphics
```

```text
Key + Tempo
→ Music catalog organization
```

---

# 🎮 게임에서의 활용

Apple은 분석 결과를 미리 계산해 game asset과 함께 bundle하는 사용 사례를 제안한다.

예를 들면 게임 음악에 맞춰 다음을 동기화할 수 있다.

- Lighting
- Particle effects
- Camera motion
- Enemy spawn timing
- Environment animation

실행 중마다 분석하지 않고 사전 계산된 Codable 데이터를 사용할 수도 있다.

---

# 🎧 DJ / Music Catalog 활용

Key와 tempo를 이용하면 음악 catalog를 분석해 다음 기준으로 분류할 수 있다.

- BPM
- Key
- Major / minor
- Pace
- Instrument presence

DJ app에서는 곡 선택이나 transition 후보 추천에 사용할 수 있다.

---

# 🎨 Audio-Reactive Animation

`InstrumentActivityResult.activity`와 loudness stream은 animation input으로 특히 적합하다.

예:

```text
Drums activity
→ scale pulse

Bass activity
→ background distortion

Vocals activity
→ particle intensity

Momentary loudness
→ glow strength
```

값이 시간과 함께 제공되므로 playhead와 동기화하기 쉽다.

---

# ⚙️ Performance 관점

Apple이 명시적으로 권장하는 최적화 포인트는 **필요한 analysis type만 요청하는 것**이다.

```text
analyze()
→ 모든 분석 실행

analyze(for: ...)
→ 필요한 분석만 실행
```

예를 들어 loudness meter만 필요하다면 key, rhythm, structure까지 계산할 이유가 없다.

---

# 🧭 API Mental Model

Music Understanding을 이해하는 가장 단순한 구조는 다음과 같다.

```text
Input
 ├─ AVAsset
 └─ AudioProvider
      ↓
MusicUnderstandingSession
      ↓
Analyze
 ├─ analyze()
 └─ analyze(for:)
      ↓
SessionResult
 ├─ key
 ├─ rhythm
 ├─ structure
 ├─ pace
 ├─ instrumentActivity
 └─ loudness
```

---

# 🧱 결과 타입 전체 구조

```text
SessionResult
├─ KeyResult?
│  └─ RangedValue<KeySignature>
│      ├─ tonic
│      └─ mode
│
├─ RhythmResult?
│  ├─ beats: [CMTime]
│  ├─ bars: [CMTime]
│  └─ beatsPerMinute: Float?
│
├─ StructureResult?
│  ├─ sections: [CMTimeRange]
│  ├─ segments: [CMTimeRange]
│  └─ phrases: [CMTimeRange]
│
├─ PaceResult?
│  └─ RangedValue<Double>
│
├─ InstrumentActivityResult?
│  ├─ ranges
│  └─ activity
│
└─ LoudnessResult?
   ├─ integrated
   ├─ momentary
   ├─ shortTerm
   └─ peak
```

---

# 📋 구현 체크리스트

## 입력 준비

- [ ] 분석할 audio source 결정
- [ ] File 기반이면 `AVURLAsset` 사용
- [ ] `AVURLAssetPreferPreciseDurationAndTimingKey`를 `true`로 설정
- [ ] Custom stream이 필요하면 `AudioProvider` 구현
- [ ] AudioProvider 종료 시 `nil` 반환

## Session 생성

- [ ] `MusicUnderstandingSession(asset:)` 또는 `MusicUnderstandingSession(audioProvider:)` 선택
- [ ] Error handling 구성
- [ ] 분석 lifetime 관리

## Analysis Scope

- [ ] 모든 feature가 필요한지 판단
- [ ] 일부만 필요하면 `analyze(for:)` 사용
- [ ] 요청하지 않은 `SessionResult` 필드는 `nil`일 수 있음을 처리

## Key

- [ ] `KeyResult.ranges` 처리
- [ ] `KeySignature.tonic` 표시 방식 결정
- [ ] major/minor 처리
- [ ] 곡 중간 key change 고려

## Rhythm

- [ ] `beats` timestamp 처리
- [ ] `bars` timestamp 처리
- [ ] `beatsPerMinute`이 optional임을 고려
- [ ] 최소 beat 수 부족 시 UI fallback 준비

## Structure

- [ ] Sections 표시
- [ ] Segments 표시
- [ ] Phrases 표시
- [ ] Playback playhead와 `CMTimeRange` 비교
- [ ] Current hierarchy highlight 처리

## Pace

- [ ] Pace value normalization 필요 여부 검토
- [ ] Section별 평균 pace 계산 여부 결정
- [ ] Clip duration이나 animation speed에 mapping

## Instrument Activity

- [ ] Presence만 필요하면 `ranges` 사용
- [ ] 강도 변화가 필요하면 `activity` 사용
- [ ] 0~1 값을 UI parameter에 mapping
- [ ] 여러 instrument 동시 표시 전략 결정

## Loudness

- [ ] Integrated loudness 표시
- [ ] Momentary 400ms window 이해
- [ ] Short-term 3s window 이해
- [ ] Peak 처리
- [ ] Streaming이 필요한지 판단

## Streaming

- [ ] `loudnessResults` AsyncSequence 소비 task 구성
- [ ] Analysis task와 병렬 실행
- [ ] Task cancellation 처리
- [ ] UI update actor context 확인

## Codable / Persistence

- [ ] JSON export 필요 여부 확인
- [ ] Cache 전략 결정
- [ ] Precomputed result bundle 가능성 검토
- [ ] Versioning 전략 고려

## UX

- [ ] 분석 중 progress / loading state 제공
- [ ] 결과가 optional일 때 fallback UI 제공
- [ ] Playback position과 분석 time base 일치 확인
- [ ] Large result set rendering 성능 검토

---

# ⚠️ 구현 시 주의할 점

## BPM과 Pace를 같은 값으로 보지 않는다

BPM은 beat frequency이고 Pace는 청자가 느끼는 구간별 속도/에너지다.

두 값은 목적이 다르다.

## `analyze(for:)` 사용 시 모든 결과가 채워지지 않는다

`SessionResult`의 optional 설계를 반드시 존중해야 한다.

## `AVURLAssetPreferPreciseDurationAndTimingKey`를 놓치지 않는다

Apple은 정확한 timing 결과를 위해 이 option을 켜라고 명시한다.

## Instrument `ranges`와 `activity`의 의미가 다르다

Presence detection과 intensity graph는 서로 다른 API를 사용한다.

## Loudness 단위와 time window를 구분한다

Integrated, Momentary, Short-term, Peak는 같은 값의 다른 표현이 아니다.

## Streaming과 batch analysis를 혼동하지 않는다

Streaming loudness는 분석 완료 후의 결과 조회가 아니라 분석 진행 중 `AsyncSequence`로 값을 소비하는 방식이다.

---

# 🚀 활용 아이디어

Apple이 세션에서 제안하는 활용 방향은 크게 네 가지다.

## Video Editing

- Beat-aware cuts
- Section-aware transitions
- Pace-aware clip duration
- Auto montage

## Music Organization

- BPM 기반 정렬
- Key 기반 분류
- DJ workflow

## Visual Effects

- Beat reactive UI
- Loudness reactive animation
- Instrument activity visualization

## Games

- 음악 분석 데이터를 사전 계산
- Gameplay / lighting / effects를 음악에 동기화

---

# 🔁 실전 데이터 흐름 예시

```text
User selects song
      ↓
AVURLAsset
      ↓
MusicUnderstandingSession
      ↓
analyze(for: [.rhythm, .structure, .pace])
      ↓
SessionResult
      ↓
Sections + Beats + Pace
      ↓
Timeline Model
      ↓
Playback Sync
      ↓
Visual / Editing / Gameplay Output
```

---

# 🎯 가장 중요한 코드 모음

## Session 생성 및 전체 분석

```swift
let asset = AVURLAsset(
    url: url,
    options: [
        AVURLAssetPreferPreciseDurationAndTimingKey: true
    ]
)

let session = try await MusicUnderstandingSession(asset: asset)
let results = try await session.analyze()
```

## SessionResult

```swift
public struct SessionResult: Codable, Sendable {
    public let instrumentActivity: InstrumentActivityResult?
    public let key: KeyResult?
    public let loudness: LoudnessResult?
    public let pace: PaceResult?
    public let rhythm: RhythmResult?
    public let structure: StructureResult?
}
```

## Rhythm

```swift
public struct RhythmResult: Codable, Sendable {
    public let beats: [CMTime]
    public let bars: [CMTime]
    public let beatsPerMinute: Float?
}
```

## Structure

```swift
public struct StructureResult: Codable, Sendable {
    public let sections: [CMTimeRange]
    public let segments: [CMTimeRange]
    public let phrases: [CMTimeRange]
}
```

## Pace

```swift
public struct PaceResult: Codable, Sendable {
    public let ranges: [MusicUnderstandingSession.RangedValue<Double>]
}
```

## Instrument Activity

```swift
public struct InstrumentActivityResult: Codable, Sendable {
    public let ranges: [Instrument: [CMTimeRange]]
    public let activity: [Instrument: [MusicUnderstandingSession.TimedValue<Float>]]
}
```

## Loudness

```swift
public struct LoudnessResult: Codable, Sendable {
    public let integrated: MusicUnderstandingSession.TimedValue<Float>
    public let momentary: [MusicUnderstandingSession.TimedValue<Float>]
    public let shortTerm: [MusicUnderstandingSession.TimedValue<Float>]
    public let peak: MusicUnderstandingSession.TimedValue<Float>
}
```

## JSON Export

```swift
let encoder = JSONEncoder()
try encoder.encode(results)
```

## Pace → Clip Duration

```swift
let timePerClip = 60 / paceValue
```

---

# 🧠 세션의 핵심 설계 메시지

Music Understanding은 음악 AI를 앱 개발자에게 raw model 형태로 노출하지 않는다.

대신 Apple이 신호 처리와 model inference를 감싸고, 개발자가 곧바로 product feature에 연결할 수 있는 semantic result type을 제공한다.

```text
Raw Audio
   ↓
Apple-managed Signal Processing + ML
   ↓
Semantic Music Features
   ↓
Swift-native Time-based Data
   ↓
App Feature
```

개발자는 ML model architecture나 DSP pipeline을 이해하지 않아도 된다.

대신 `CMTime`, `CMTimeRange`, Swift Concurrency, Codable처럼 Apple 플랫폼 개발자가 익숙한 추상화로 결과를 소비한다.

---

# 🔐 Privacy와 Offline이 제품 설계를 바꾸는 지점

서버에 오디오를 업로드하지 않고도 분석할 수 있다는 점은 단순 구현 편의 이상의 의미가 있다.

```text
No upload
→ 사용자 오디오 privacy 유지

On-device
→ Offline workflow 가능

No server inference
→ 네트워크 latency 제거
```

특히 편집 앱, 개인 음악 라이브러리, 게임 asset 분석 같은 경우 자연스럽게 로컬 workflow를 만들 수 있다.

---

# 🧩 여섯 분석 축의 역할을 한 문장으로 정리하면

```text
Key
→ 어떤 음 체계를 중심으로 연주되는가

Rhythm
→ Beat와 bar가 언제 발생하는가

Structure
→ 곡의 section / segment / phrase가 어떻게 나뉘는가

Pace
→ 각 구간이 얼마나 빠르고 energetic하게 느껴지는가

Instrument Activity
→ 어떤 악기가 언제 얼마나 강하게 존재하는가

Loudness
→ 시간에 따라 사람이 인지하는 음량이 어떻게 변하는가
```

이 여섯 축을 합치면 음악을 단순 PCM waveform이 아니라 **시간 구조를 가진 semantic data**로 다룰 수 있다.

---

# 핵심 메시지

Music Understanding의 가장 큰 변화는 오디오 분석을 전문 DSP/ML 영역에서 일반 Apple 플랫폼 API 영역으로 옮겼다는 점이다.

개발자는 `MusicUnderstandingSession`에 `AVAsset` 또는 custom audio stream을 넣고, 필요한 분석 종류만 요청한 뒤 Swift-native 결과를 받아 사용하면 된다.

핵심 구조는 단순하다.

```text
Audio
  ↓
MusicUnderstandingSession
  ↓
Key / Rhythm / Structure / Pace / Instrument / Loudness
  ↓
TimedValue / RangedValue
  ↓
Editing / Visualization / DJ / Game / Animation
```

특히 `analyze(for:)`를 통한 선택적 계산, `AsyncSequence` 기반 loudness streaming, 모든 결과의 `Codable` 지원, `CMTime` 중심의 시간 표현은 실제 앱 통합을 매우 직접적으로 만든다.

Apple이 Final Cut Pro에서 이미 beat detection과 montage에 사용하고 있다는 사례도 이 프레임워크가 단순 demo API가 아니라 실제 편집 workflow를 위한 product-grade building block임을 보여준다.

---

# 함께 보면 좋은 자료

- Music Understanding framework documentation
- Creating visuals with Music Understanding analysis results
- Music Understanding Lab sample app
- AVFoundation timing APIs
- Swift Concurrency / AsyncSequence
