# WWDC26 Discover generated subtitles and subtitle styles 요약

- Session: 256
- Title: Discover generated subtitles and subtitle styles
- Source: https://developer.apple.com/videos/play/wwdc2026/256/
- Topic: AVFoundation, AVKit, Media Accessibility, Generated Subtitles, Caption Style Preview
- Chapters: Introduction, Media authoring, Subtitle generation methods, Availability and support, Presenting subtitles in your app, Subtitle style preview, Demo, Next steps

---

## 한 줄 요약

iOS 27, macOS 27, tvOS 27, visionOS 27에서는 지원되는 미디어 재생 환경에서 온디바이스 모델이 generated subtitles를 만들 수 있으며, 앱은 시스템 player UI 또는 `AVLegibleMediaOptionsMenuController`, `AVPlayerLayer`, Media Accessibility API를 이용해 자막 선택과 subtitle style preview를 제공할 수 있다.

---

## 핵심 요약

이번 세션은 비디오 앱의 접근성을 높이는 두 가지 기능을 설명한다.

- **Generated subtitles**
  - 재생 중 기기에서 로컬로 생성
  - Speech transcription: 오디오 → 자막
  - Language translation: 기존 자막 → 다른 언어 자막
  - Authored subtitles는 preferred 상태로 유지되며 변경되지 않음
  - generated subtitles 자체를 켜기 위한 앱의 별도 구현은 필요 없음
  - HLS live stream, VOD, file-based content 지원

- **Subtitle style preview**
  - 영상을 보는 중 caption style을 직접 비교
  - Settings에 있는 built-in/custom style 활용
  - `AVPlayerViewController`와 macOS `AVPlayerView`는 전체 UI 제공
  - 기존 custom player에는 `AVLegibleMediaOptionsMenuController`
  - `AVPlayerLayer`에서는 profile ID 기반 preview 직접 구현 가능

핵심은 **필요한 언어의 자막을 선택할 수 있게 하고, 동시에 자신이 읽기 쉬운 스타일을 재생 중 바로 선택하게 하는 것**이다.

---

# ♿ 자막이 중요한 이유

자막은 deaf 또는 hard of hearing 사용자와 기타 accessibility need가 있는 사용자에게 콘텐츠 이해를 위해 필수적일 수 있다.

또 다음 상황에서도 유용하다.

- spoken dialogue 이해 보조
- 공항처럼 오디오를 듣기 어려운 환경
- 익숙하지 않은 언어를 보조하거나 학습할 때

따라서 subtitle support는 특정 사용자를 위한 보조 기능에 그치지 않고 다양한 재생 환경에서 콘텐츠 접근성을 넓힌다.

---

# 🤖 Apple AI-generated Subtitles

Generated subtitles는 미디어가 재생되는 동안 **live로, 기기에서 로컬로** 만들어질 수 있다.

```text
Live generation
+
On-device models
```

서버에서 미리 자막을 생성해 콘텐츠에 포함하는 방식만을 의미하지 않는다.

---

# 🎬 기존 Media Authoring 흐름

일반적인 media authoring은 다음과 같다.

```text
Video / Audio 제작
      ↓
언어별 Authored subtitles 제작
      ↓
최종 Media
```

최종 콘텐츠에는 Video, Audio, 여러 audio language, 여러 authored subtitle language가 함께 포함될 수 있다.

하지만 모든 사용자가 이해하는 언어를 콘텐츠 제작자가 미리 제공하기는 어렵다.

Generated subtitles는 이 빈 영역을 보완한다.

---

# 🗣️ Speech Transcription

첫 번째 generated subtitle 방식은 source audio에서 직접 자막을 만드는 것이다.

```text
Source Audio
     ↓
On-device Speech-to-Text Model
     ↓
Generated Subtitles
```

세션에서는 이를 **Speech transcription**이라고 부른다.

---

# 🌐 Language Translation

두 번째 방식은 기존 subtitle을 다른 언어 subtitle로 변환하는 것이다.

```text
Source Subtitles
      ↓
On-device Translation Model
      ↓
Generated Subtitle in another language
```

세션의 예:

```text
English subtitles
      ↓
Italian subtitles
```

이를 **Language translation**이라고 한다.

---

# 📝 Authored Subtitles가 우선

Generated subtitles는 authored subtitle을 대체하거나 수정하지 않는다.

- Generated subtitles는 추가 언어 선택지
- Authored subtitles는 preferred
- 기존 authored subtitle은 그대로 유지

즉 콘텐츠 제작자가 직접 제공한 subtitle track이 있다면 우선적으로 유지되고, generated subtitle은 필요한 coverage를 늘리는 역할을 한다.

---

# ✨ 별도의 AI 구현은 필요 없음

Generated subtitles를 활성화하기 위해 앱에서 speech recognition이나 translation pipeline을 직접 만들 필요는 없다.

지원되는 환경에서는 playback 중 자동으로 사용할 수 있다.

개발자가 특히 신경 써야 하는 부분은 **사용자가 subtitle을 선택할 UI를 제공하는 것**이다.

---

# 📡 지원되는 Playback Scenario

Generated subtitles는 다음 재생 환경에 제공된다.

## HTTP Live Streaming

- Live streams
- TV channel 형태의 stream
- Video on demand
- Live events
- Sports

## File-based Content

- 앱 bundle에 포함된 video
- Download된 media

---

# 🎞️ 지원되는 Content 유형

세션에서는 다음을 예로 든다.

- Professional content: movies, series
- Customer-created content: iPhone camera capture, social media video

특정 방송용 콘텐츠에만 한정된 기능은 아니다.

---

# 📱 지원 기기와 언어

세션에서 설명한 범위는 다음과 같다.

## English Audio → English Generated Subtitles

iOS 27과 macOS 27에서 English audio로부터 English subtitle을 생성할 수 있다.

같은 speech transcription 지원은 다음에도 제공된다.

- tvOS 27
- visionOS 27

## English Subtitle → Multiple Languages

English subtitle을 source로 여러 subtitle language를 생성하는 translation 기능은 세션에서 다음 플랫폼에 대해 설명한다.

- iOS 27
- macOS 27

Speech transcription과 translation의 지원 범위를 동일하다고 가정하면 안 된다.

---

# 🎛️ Subtitle Selection UI가 중요

Generated subtitles 자체는 자동 제공될 수 있지만, 앱에는 **video playback 중 subtitle을 고를 수 있는 UI**가 필요하다.

사용자는 다음을 선택할 수 있어야 한다.

- Authored subtitle
- Generated subtitle
- 필요한 subtitle language
- Subtitle style

구현 방법은 player 구조에 따라 다르다.

---

# ▶️ `AVPlayerViewController`

iOS의 `AVPlayerViewController`는 다음을 완전히 구현한다.

- Player controls
- Subtitle selection
- Generated subtitle 선택
- Subtitle style preview

System player experience를 사용한다면 별도 subtitle UI 구현 부담이 크게 줄어든다.

---

# 🖥️ macOS의 `AVPlayerView`

macOS에서는 `AVPlayerView`가 유사한 역할을 한다.

Player controls와 subtitle 관련 UI를 시스템 경험으로 제공한다.

---

# 📋 `AVLegibleMediaOptionsMenuController`

이미 자체 player controls가 있다면 `AVLegibleMediaOptionsMenuController`를 사용할 수 있다.

제공 기능:

- Subtitle selection controls
- Selection behavior
- Subtitle style preview controls

전체 player controls는 제공하지 않으므로 기존 custom player UI에 subtitle menu만 추가하고 싶을 때 적합하다.

---

# 🎨 완전한 Custom Media Selection UI

앱의 다른 controls와 정확히 맞춘 UI가 필요하면 custom media selection controls를 만들 수도 있다.

세션 demo의 generated option은 다음처럼 표시된다.

- Sparkle symbol
- `Translated` 텍스트

Generated와 authored option을 사용자가 구분할 수 있게 만드는 것이 중요하다.

---

# 🖌️ Subtitle Style도 접근성의 일부

자막이 존재해도 실제로 읽기 어려우면 충분하지 않다.

Settings 앱에서는 오랫동안 caption/subtitle appearance를 조절할 수 있었다.

- Built-in styles
- Custom styles

발표자는 `Bold Yellow`라는 custom style을 예로 들며 노란색 text와 추가 border를 사용한다.

---

# 👀 Subtitle Style Preview

새 기능은 caption appearance 조절을 playback 안으로 가져온다.

사용자는 다음 흐름으로 style을 바꾼다.

1. Subtitles menu 열기
2. Style 선택
3. 사용 가능한 style 목록 확인
4. 실제 video 위에서 preview
5. 읽기 쉬운 style 선택

Settings 앱으로 이동하지 않고 재생 context 안에서 접근성 설정을 조절할 수 있다.

---

# 🧰 Style Preview 구현 방식

| 방식 | 역할 |
|---|---|
| `AVPlayerViewController` | iOS player + subtitle style preview 전체 제공 |
| `AVPlayerView` | macOS의 유사한 전체 player 경험 |
| `AVLegibleMediaOptionsMenuController` | 기존 player UI에 subtitle/style controls 추가 |
| `AVPlayerLayer` | API로 직접 preview 표시 |
| `AVCaptionRenderer` | Preview를 제공할 수 있지만 rendering은 앱 책임 |

---

# 🆔 Caption Style Profile ID

System의 각 subtitle style에는 profile ID가 있다.

먼저 사용 가능한 profile을 가져온다.

```swift
func updateProfileList() {
    subtitleStyleProfileIDs =
        MACaptionAppearanceCopyProfileIDs() as? [String] ?? []
}
```

이 profile IDs를 이용해 style selection UI를 구성할 수 있다.

---

# 👁️ `AVPlayerLayer`에서 Preview 표시

선택한 style의 profile ID를 player layer에 전달한다.

```swift
func showPreviewStyle(subtitleStyleProfileID: String) {
    playerLayer.setCaptionPreviewProfileID(
        subtitleStyleProfileID,
        position: .zero,
        text: nil
    )
}
```

주요 parameter:

- profile ID
- position
- preview text

---

# 📝 `text: nil`

Preview text에 `nil`을 전달하면 localized system text가 표시된다.

앱이 각 언어별 sample text를 직접 관리할 필요가 없다.

세션 demo에서는 Italian subtitle context에서 preview placeholder도 Italian으로 나타난다.

---

# 📍 Preview Position

`position` parameter는 preview text를 기본 위치에서 offset한다.

Custom player controls와 preview가 겹치는 경우 위치를 조절하는 데 사용한다.

---

# 🔄 여러 Style 빠르게 비교하기

사용자가 menu에서 다른 style을 선택할 때마다 `setCaptionPreviewProfileID`를 다시 호출할 수 있다.

호출 횟수에 제한된 일회성 API가 아니라, style 선택 중 필요한 만큼 반복 호출할 수 있는 preview API다.

---

# 🙈 Preview 중 기존 Subtitle 처리

Preview text와 현재 subtitle이 겹치지 않도록, style preview가 표시되는 동안 기존 subtitle은 자동으로 숨겨진다.

Preview가 끝나면 기존 활성 subtitle이 다시 복원된다.

---

# 🛑 Preview 종료

선택이 끝나면 다음을 호출한다.

```swift
func stopPreviewStyle() {
    playerLayer.stopShowingCaptionPreview()
}
```

이 호출은 preview text를 제거하고 기존 subtitle을 복원한다.

---

# ✅ 최종 Style 적용

선택한 profile을 active caption style로 지정한다.

```swift
func setSubtitleStyle(
    subtitleStyleProfileID: CFString
) {
    MACaptionAppearanceSetActiveProfileID(
        subtitleStyleProfileID
    )
}
```

세션에서는 이 style이 시스템의 subtitle에 사용된다고 설명한다.

---

# 🔗 전체 코드 흐름

```swift
import AVFoundation
import MediaAccessibility

func updateProfileList() {
    subtitleStyleProfileIDs =
        MACaptionAppearanceCopyProfileIDs() as? [String] ?? []
}

func showPreviewStyle(
    subtitleStyleProfileID: String
) {
    playerLayer.setCaptionPreviewProfileID(
        subtitleStyleProfileID,
        position: .zero,
        text: nil
    )
}

func stopPreviewStyle() {
    playerLayer.stopShowingCaptionPreview()
}

func setSubtitleStyle(
    subtitleStyleProfileID: CFString
) {
    MACaptionAppearanceSetActiveProfileID(
        subtitleStyleProfileID
    )
}
```

구현 순서:

```text
Profile 목록 조회
      ↓
Style menu 구성
      ↓
선택한 style Preview
      ↓
다른 style 선택 시 Preview 갱신
      ↓
선택 완료 시 Preview 종료
      ↓
최종 profile 활성화
```

---

# 🏕️ 세션 Demo

발표자는 이탈리아 camping trip을 준비하며 camping video를 본다.

Video에는 English subtitles가 있지만 Italian을 연습하기 위해 subtitle language를 바꾼다.

Subtitles menu에서 generated Italian subtitle을 선택한다.

Generated option은 sparkle symbol과 `Translated` 표시로 구분된다.

그 뒤 Style menu에서 `Large Text`를 preview하고, 이어서 자신이 만든 `Bold Yellow` custom style을 preview한다.

메뉴를 닫으면 실제 Italian subtitles가 선택한 style로 표시된다.

---

# 🔁 두 기능이 함께 만드는 Experience

```text
필요한 Language 선택
       ↓
Generated Subtitle 사용
       ↓
읽기 쉬운 Style 탐색
       ↓
Style Preview
       ↓
최종 Caption Appearance 적용
```

자막 접근성은 단순히 자막 track의 존재 여부만이 아니라 다음 두 축을 함께 고려해야 한다.

- 이해할 수 있는 언어
- 읽을 수 있는 표현

---

# 🧭 Player 구조별 선택

## System Player

- iOS: `AVPlayerViewController`
- macOS: `AVPlayerView`

장점:

- Subtitle selection UI 자동 제공
- Style preview 자동 제공
- Player controls 포함

## Existing Custom Player

- `AVLegibleMediaOptionsMenuController`

장점:

- 기존 player controls 유지
- Subtitle selection behavior 재사용
- Style preview controls 재사용

## Full Custom UI

- `AVPlayerLayer`
- Media Accessibility API
- 필요하면 `AVCaptionRenderer`

앱이 UI와 rendering responsibility를 더 많이 가져간다.

---

# 📋 체크리스트

## Generated Subtitles

- [ ] 앱의 playback scenario가 지원되는지 확인
- [ ] HLS live / VOD / file-based 여부 확인
- [ ] Generated subtitle AI pipeline을 별도로 구현하지 않기
- [ ] Authored subtitles를 변경하지 않기
- [ ] Authored subtitle이 preferred라는 전제 유지
- [ ] Playback 중 subtitle selection UI 제공
- [ ] Generated option을 이해하기 쉽게 표시

## Platform / Language

- [ ] iOS 27의 English audio → English subtitle 지원 확인
- [ ] macOS 27의 같은 speech transcription 지원 확인
- [ ] tvOS 27 지원 범위 확인
- [ ] visionOS 27 지원 범위 확인
- [ ] English subtitle 기반 multiple-language translation은 세션상 iOS/macOS로 구분
- [ ] 모든 플랫폼의 언어 지원이 동일하다고 가정하지 않기

## System Player

- [ ] `AVPlayerViewController` 사용 가능 여부 검토
- [ ] macOS에서는 `AVPlayerView` 검토
- [ ] Generated subtitle option 표시 확인
- [ ] Style menu와 preview 동작 확인

## Existing Custom Player

- [ ] `AVLegibleMediaOptionsMenuController` 적용 검토
- [ ] 전체 player controls는 기존 UI가 담당하는지 확인
- [ ] Subtitle selection과 style preview behavior 검증

## Custom Style Preview

- [ ] `MediaAccessibility` import
- [ ] `MACaptionAppearanceCopyProfileIDs()`로 style IDs 조회
- [ ] Style picker 구성
- [ ] `setCaptionPreviewProfileID` 호출
- [ ] `text: nil`의 localized system text 활용 여부 결정
- [ ] `position`으로 custom controls와 겹침 방지
- [ ] Style 변경마다 preview 즉시 갱신
- [ ] 선택 종료 시 `stopShowingCaptionPreview()` 호출
- [ ] 최종 선택은 `MACaptionAppearanceSetActiveProfileID()`로 적용
- [ ] Preview 중 기존 subtitle hide / restore 동작 확인

## Accessibility UX

- [ ] Language 변경이 playback 중 쉽게 가능한지 확인
- [ ] Settings 앱으로 이동하지 않고 style을 변경할 수 있는지 검토
- [ ] Preview가 실제 video context에서 충분히 잘 보이는지 확인
- [ ] Custom style도 목록에 나타나는지 확인
- [ ] Generated / authored option을 구분하기 쉬운지 확인

---

# 🧩 주요 API 정리

| API / Framework | 역할 |
|---|---|
| `AVPlayerViewController` | iOS player controls, subtitle selection, style preview |
| `AVPlayerView` | macOS player controls와 subtitle UI |
| `AVLegibleMediaOptionsMenuController` | 기존 player에 subtitle/style menu 추가 |
| `AVPlayerLayer` | Custom caption style preview |
| `AVCaptionRenderer` | 앱이 직접 caption rendering하는 경우 사용 가능 |
| `MediaAccessibility` | Caption appearance profile 관리 |
| `MACaptionAppearanceCopyProfileIDs()` | 사용 가능한 profile ID 조회 |
| `setCaptionPreviewProfileID` | 선택한 style preview |
| `stopShowingCaptionPreview()` | Preview 종료 및 기존 subtitle 복원 |
| `MACaptionAppearanceSetActiveProfileID()` | Active subtitle style 설정 |

---

# ⚠️ 구현 시 구분해야 할 것

## Generated와 Authored는 다르다

Generated subtitle은 authored subtitle을 덮어쓰지 않는다.

기존 authored track은 preferred 상태로 유지된다.

## 모든 플랫폼의 지원 범위가 같다고 가정하지 않는다

세션에서는 speech transcription과 translation의 플랫폼 범위를 서로 다르게 설명한다.

## Generated subtitle 자동 제공과 UI 제공을 혼동하지 않는다

Generated subtitle 자체를 켜기 위한 별도 구현은 필요하지 않지만, 사용자가 subtitle을 선택할 UI는 중요하다.

## Style Preview와 최종 Style 적용은 별도 단계다

Preview는 비교를 위한 임시 표시다.

선택이 끝나면 preview를 종료한 뒤 원하는 profile을 실제 active style로 지정한다.

---

# 핵심 메시지

이번 세션은 자막 접근성을 두 방향으로 확장한다.

첫 번째는 **언어의 접근성**이다. 지원되는 Apple 플랫폼은 on-device Speech-to-Text와 translation model을 이용해 원본 콘텐츠에 필요한 subtitle language가 없을 때 generated subtitles를 추가할 수 있다.

두 번째는 **표현의 접근성**이다. 사용자는 Settings 앱으로 이동하지 않고 영상을 보는 동안 자신이 읽기 편한 caption style을 직접 preview하고 선택할 수 있다.

개발자는 generated subtitle을 위한 별도의 AI pipeline을 구축할 필요는 없지만, 사용자가 subtitle을 선택할 UI를 제대로 제공해야 한다.

System player를 사용하면 `AVPlayerViewController` 또는 `AVPlayerView`가 많은 기능을 자동으로 처리하고, custom player에서는 `AVLegibleMediaOptionsMenuController`나 `AVPlayerLayer`와 Media Accessibility API를 조합할 수 있다.

결국 좋은 subtitle experience는 **필요한 언어를 제공하고, 사용자가 읽기 쉬운 형태로 즉시 바꿀 수 있게 하는 것**이다.

---

# 함께 보면 좋은 세션

- What's new in HTTP Live Streaming
