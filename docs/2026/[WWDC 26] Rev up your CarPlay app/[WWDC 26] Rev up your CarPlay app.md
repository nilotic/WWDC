# WWDC26 — Rev up your CarPlay app

- **Session:** 212
- **Title:** Rev up your CarPlay app
- **Source:** https://developer.apple.com/videos/play/wwdc2026/212/
- **Basis:** Apple Developer 공식 전체 transcript 및 Code 섹션
- **Platforms:** iOS 27, CarPlay, CarPlay Ultra

---

## 🎯 한 줄 요약

iOS 27의 CarPlay는 기존 오디오·메시징·내비게이션 앱을 넘어 **지원 차량에서의 비디오 탐색/재생**, 더 풍부한 **thumbnail·details header·playback metadata**, 자동 **MiniPlayer**, 모든 CarPlay 앱 카테고리에서 사용할 수 있는 **Voice Control template**, 그리고 내비게이션 앱을 위한 **panels와 Route Sharing**을 제공한다. 앱은 여전히 CarPlay framework의 템플릿을 사용해 다양한 차량 화면과 입력 장치를 시스템에 맡기고, 지원 여부와 주행 상태에 따라 적절히 기능을 조절해야 한다.

---

## 🧭 세션 구성

| 시간 | 챕터 |
|---|---|
| 0:00 | Introduction |
| 0:42 | Apps in CarPlay |
| 2:51 | CarPlay framework |
| 11:54 | Navigation apps |
| 15:19 | CarPlay Simulator |

---

# 🚘 CarPlay 앱의 확장된 범위

CarPlay는 운전 중 iPhone을 직접 조작하지 않고 핵심 기능을 사용할 수 있도록 설계된 환경이다. 기존 주요 카테고리는 다음과 같다.

- **Audio apps**: 음악, 팟캐스트 등 재생
- **Communication apps**: 메시지 송수신 및 전화
- **Navigation apps**: 턴바이턴 길 안내
- **Live Activities / widgets**: CarPlay 전용 앱이 아니어도 관련 정보를 노출
- **Voice-based conversational apps**: 음성으로 질문하고 동작을 수행하는 앱
- **Video apps**: iOS 27에서 새롭게 CarPlay 화면 자체에서 콘텐츠를 탐색하고 비디오를 재생

모든 CarPlay 앱의 공통점은 **사람이 iPhone을 꺼내지 않고도 차량 안에서 중요한 작업을 수행할 수 있도록 한다는 것**이다.

---

# 🎬 CarPlay video apps

## 기존 AirPlay video streaming에서 한 단계 확장

기존에도 앱이 AirPlay video streaming을 지원하면, 사용자는 iPhone에서 재생 중인 영상을 지원 차량의 CarPlay 화면으로 보낼 수 있었다. iOS 27에서는 여기서 더 나아가 **CarPlay 화면에서 직접 비디오 목록을 탐색하고 선택**할 수 있다.

이를 위해 앱은 두 가지를 충족해야 한다.

1. **AirPlay video streaming 지원**
2. **CarPlay framework를 이용한 browsing UI 제공**

즉, 영상 자체의 전송은 AirPlay 기반이고, CarPlay framework는 차량 화면에서 콘텐츠를 탐색하고 선택할 수 있는 UI를 제공한다.

## 차량의 video-in-car 지원 여부

CarPlay video 앱은 **video in car 기능을 지원하는 차량**에서만 동작한다. 앱은 `CPSessionConfiguration`의 video 지원 여부를 확인해 비디오 UI를 조건부로 제공할 수 있다.

세션의 Landmarks 예제는 video가 지원될 때만 Videos 탭을 추가한다.

### 주행 중 영상 사용 불가 시

차량은 언제든 video playback을 사용할 수 없다고 시스템에 알릴 수 있다. 이 경우 콘텐츠는 **audio-only**로 재생된다.

이 동작은 다음과 같은 콘텐츠에서 특히 자연스럽다.

- 비디오 팟캐스트
- 스포츠 중계
- 영상이 없어도 오디오만으로 계속 소비할 수 있는 콘텐츠

앱은 영상 재생이 항상 가능하다고 가정하면 안 된다.

## Entitlement 구성

CarPlay video entitlement만 가진 앱은 **video in car를 지원하는 차량에서만 CarPlay 홈 화면에 표시**된다.

콘텐츠가 비디오뿐 아니라 오디오로도 적합하다면 Apple은 다음 두 entitlement를 함께 포함하라고 안내한다.

- CarPlay audio app entitlement
- CarPlay video app entitlement

이렇게 하면 차량이 video in car를 지원하지 않는 경우에도 오디오 앱으로 계속 표시될 수 있다.

---

# 🧩 CarPlay framework가 담당하는 것

CarPlay framework를 사용하면 iOS가 UI 요소의 표시와 차량과의 입력 인터페이스를 관리한다.

앱은 다양한 차량 환경을 직접 구현할 필요가 없다.

- 여러 해상도
- touchscreen
- rotary knob
- touch pad
- 차량별 화면 크기와 배치 차이

대신 **template 기반 UI**를 구성하면 시스템이 실제 차량 환경에 맞게 표현한다.

이 원칙은 CarPlay 및 CarPlay Ultra에서 동일하게 중요하다.

---

# 🖼️ List와 thumbnail 개선

## 다양한 이미지 비율

CarPlay의 list는 이제 기존보다 다양한 aspect ratio의 이미지를 보여줄 수 있다.

- portrait
- landscape

비디오/미디어 브라우징 UI에서 콘텐츠 특성에 맞는 썸네일 비율을 사용할 수 있다.

## Thumbnail과 overlay

Card 형태의 요소는 단순 이미지보다 더 많은 정보를 담을 수 있는 **thumbnail**을 지원한다.

Thumbnail에 표현 가능한 정보:

- overlay
- playback progress
- sports information
- custom badge image

Landmarks 예제에서는 overlay로 다음 상태를 보여준다.

- newly added
- live streaming

텍스트뿐 아니라 custom badge 이미지를 overlay로 사용할 수도 있다.

---

# ▶️ `CPPlaybackConfiguration`

`CPPlaybackConfiguration`은 **재생 가능한 아이템의 메타데이터를 CarPlay framework에 전달**하는 핵심 API다.

## Preferred presentation

콘텐츠가 비디오로 재생되는 것을 선호한다면 preferred presentation을 video로 설정하고, 그렇지 않다면 audio를 사용한다.

이는 콘텐츠의 **선호 표현 방식**이지, 현재 환경에서 비디오 재생이 항상 가능하다는 보장은 아니다. 차량이 영상 재생을 허용하지 않으면 audio-only로 전환될 수 있다.

## Progress 정보

Playback configuration의 다음 값이 UI에 반영된다.

- elapsed time
- duration

CarPlay는 이를 사용해 playable item의 progress bar를 표시한다.

## Playback action

Playback action은 선택했을 때 어떤 동작이 수행될지 표현한다.

- play
- pause
- replay

### 상태 변화 시 반드시 갱신

재생 상태가 바뀌면 thumbnail의 playback configuration도 함께 업데이트해야 한다.

그렇지 않으면 사용자가 다시 해당 UI를 볼 때 progress나 play/pause 상태가 실제 플레이어와 다르게 보일 수 있다.

---

# 🏟️ Sports overlay

스포츠 콘텐츠는 thumbnail 위에 별도의 sports overlay를 표시할 수 있다.

구성 요소:

- left team
- right team
- event status

세션의 예제에서는 팀과 스코어를 썸네일에 직접 표시한다.

이 기능은 스포츠 비디오나 라이브 이벤트 브라우징에서 사용자가 세부 화면을 열기 전에 현재 경기 상황을 빠르게 파악하게 해준다.

---

# 📑 Details header

`details header`는 하나의 항목을 리스트 상단에서 크게 강조하면서, 아래에는 관련 아이템을 계속 보여주고 싶을 때 사용한다.

적합한 사례:

- 현재 에피소드 + 다른 에피소드 목록
- 영화 정보 + bonus content
- 메인 비디오 + 관련 비디오

Details header는 다음 요소를 하나로 결합한다.

- single thumbnail
- title
- subtitle/body text
- playback configuration
- action buttons

Landmarks 예제에서는 다음을 구성한다.

- 큰 thumbnail
- landmark 설명
- playback state
- Play 버튼
- Add to Playlist 버튼

Playback configuration의 current progress는 첫 번째 action button과 자동으로 결합되어 표시된다.

Thumbnail과 마찬가지로 playback 상태가 바뀔 때 details header의 playback configuration도 갱신해야 한다.

---

# 🎵 MiniPlayer

iOS 27에서는 Now Playing template에 **MiniPlayer**가 추가된다.

MiniPlayer의 목적:

- 현재 재생 중인 콘텐츠를 항상 빠르게 확인
- 큰 화면에서는 play/pause/skip 등 주요 재생 제어
- 브라우징 중 Now Playing 화면으로 이동하지 않아도 기본 제어 제공

Now Playing을 사용하는 앱은 **자동으로 MiniPlayer가 표시**된다.

### MiniPlayer 비활성화

앱이 MiniPlayer를 원하지 않으면 다음과 같이 끌 수 있다.

```swift
// Disable the MiniPlayer
CPNowPlayingTemplate.shared.allowsMiniPlayer = false
```

이 경우 MiniPlayer 대신 navigation bar에 기존 Now Playing icon이 표시된다.

Apple은 MiniPlayer를 CarPlay의 Now Playing 표현에 가장 적합한 기본 선택으로 소개한다.

---

# 🗣️ Voice Control template

Voice-based conversational app 지원에 이어 iOS 27에서는 **Voice Control template을 모든 CarPlay 앱 카테고리에서 사용**할 수 있다.

Voice Control template이 제공하는 요소:

- conversation 상태를 보여주는 prompt
- animated icon
- 최대 2개의 action button
- leading navigation bar button
- trailing navigation bar button

Prompt와 icon은 모두 optional이다.

## Action button 활용

예를 들어 사용자가 음성으로 다음을 질문할 수 있다.

- 특정 목적지 정보
- 연락처 정보

이 경우 action button에서 바로:

- navigation 시작
- 전화 걸기

등을 제공할 수 있다.

URL 기반 동작을 수행할 때는 `CPTemplateApplicationScene`으로 URL을 열어 CarPlay 환경에서 해당 요청을 수행한다.

---

# 🪟 Voice Control overlay

Voice Control template은 화면 전체를 차지하는 형태뿐 아니라 **overlay**로도 사용할 수 있다.

예:

- Navigation 앱의 Map Template 위에 음성 UI를 겹쳐 표시
- 현재 list/template을 그대로 보존하면서 음성 상호작용 제공

Overlay는 `CPInterfaceController`를 사용해 표시한다.

Full-screen presentation과 동일하게 text/button을 제공하지만 overlay의 공간은 더 작기 때문에 **더 짧은 text variant를 제공**하는 것이 권장된다.

---

# 🔊 Voice conversation의 audio feedback

음성 중심 인터랙션에서는 시각적 UI만으로 상태를 전달하면 부족할 수 있다. 세션은 다음과 같은 **audio feedback**을 권장한다.

- waiting sound: conversation 준비 중
- processing sound: 응답 생성 중

AVAudioSession 설정 권장값:

- category: play and record
- mode: default
- mixing disabled

사용자가 화면을 계속 보지 않아도 현재 대화 상태를 이해할 수 있도록 하는 것이 목적이다.

---

# 🧭 Navigation apps: Panels

내비게이션 앱은 iOS 27에서 Map Template의 **primary interface area를 더 직접적으로 제어**할 수 있다.

기존에는 trip과 route options를 보여주는 흐름에 UI가 강하게 연결되어 있었지만, 이제 **panel**을 직접 구성하고 push할 수 있다.

Panel은 기존 CarPlay framework 객체를 조합한다.

예:

- trips
- grids
- route choices
- route details
- waypoints
- list items

Panel은 여러 UI 요소를 함께 포함할 수 있어 navigation UI를 더 유연하게 만들 수 있다.

## Panel button configuration

Panel의 button configuration은 panel 하단에 나타날 주요 action을 정의한다.

예:

- Go
- End

Map은 계속 보이는 상태에서 panel을 push해 추가 콘텐츠와 제어를 제공할 수 있다.

---

# 🛣️ Route Sharing

Route Sharing은 navigation app이 계산한 경로를 차량과 공유해 차량의 driver assistance 기능과 앱의 길 안내를 함께 사용할 수 있게 한다.

**요구 사항:**

- iOS 26.4 이상
- Route Sharing을 지원하는 차량

## 차량에서 활용 가능한 정보

차량은 공유된 route를 기반으로 다음과 같은 기능을 더 잘 수행할 수 있다.

- automatic lane changes
- 차량 guidance를 앱의 route와 일치시키기
- EV의 배터리/주행 가능 거리를 고려한 charging stop 제안

## Route representation

앱은 route를 **route segment 배열**로 차량에 제공한다.

각 segment는 geographic coordinates를 포함하며, trip이 변경될 때 차량에 다시 전송된다.

세션 예제:

1. coffee shop
2. campground

두 목적지를 포함한 trip이 두 개의 route segment로 구성되어 차량에 공유된다.

---

# ⚡ EV charging waypoint 제안 흐름

세션의 전기차 예제에서는 차량이 공유된 route를 분석한 뒤 배터리 사용량을 계산한다.

원래 route:

1. Coffee shop
2. Campground

차량이 도착 전 충전이 필요하다고 판단하면 적절한 충전소를 찾고, 그 destination을 iOS로 제안한다.

Navigation app은 이 waypoint를 Map Template을 통해 받는다.

그 후 앱은 두 가지 방식 중 하나를 선택할 수 있다.

### 1. Map Template에 confirmation 처리 위임

앱이 updated travel estimates를 반환하면 Map Template이 driver에게 추가 waypoint 수락 여부를 자동으로 묻는다.

### 2. 앱이 직접 confirmation UI 관리

Travel estimates를 반환하지 않고 앱 자체가 추가 waypoint 확인 흐름을 처리할 수 있다.

사용자가 waypoint를 수락하면:

1. 앱이 trip에 새 route segment 추가
2. 업데이트된 trip을 차량에 다시 공유

즉, Route Sharing은 한 번의 전달로 끝나는 정적 데이터가 아니라 **route 변경에 따라 반복적으로 동기화되는 구조**다.

---

# 🔐 Route Sharing의 사용자 승인과 opt-in

Route Sharing은 앱만 결정하는 기능이 아니다.

## 운전자 승인

차량과 처음 pairing할 때 운전자가 해당 차량에 대해 Route Sharing을 승인한다.

이 승인은 **특정 navigation app 하나가 아니라, 해당 차량에 연결된 navigation apps가 route를 공유할 수 있도록 허용**한다.

## 앱의 opt-in

운전자 승인이 있더라도 앱은 Map Template에서 Route Sharing에 opt-in해야 한다.

공식 Code 섹션 예제:

```swift
// Enable route sharing
func mapTemplateShouldProvideRouteSharing(_ mapTemplate: CPMapTemplate) -> Bool {
    true
}
```

## 개별 trip 단위 비활성화

앱이 특정 trip을 Route Sharing에 적합하지 않다고 판단하면 trip 단위로 끌 수 있다.

```swift
// Disable route sharing for this trip
trip.routeSegmentsAvailableForRegion = false
```

즉, 제어 수준은 다음과 같이 나뉜다.

1. 운전자의 차량별 승인
2. navigation app의 기능 opt-in
3. 개별 trip의 eligibility 판단

---

# 🧪 CarPlay Simulator

CarPlay Simulator는 Mac에 연결해 실제 차량과 유사한 CarPlay 환경을 테스트할 수 있게 한다.

테스트 가능한 항목:

- 다양한 화면 크기
- 서로 다른 vehicle configuration
- video in car 지원 여부
- CarPlay UI template 동작
- navigation app의 route sharing diagnostics

## Device Hub 통합

CarPlay Simulator는 이제 **Device Hub**에서도 사용할 수 있다.

Navigation app 개발자는 Route Sharing을 위한 새 diagnostic tools를 활용할 수 있다.

Video app 개발자는 **Additional Tools for Xcode** 패키지에서 CarPlay Simulator를 다운로드해 사용할 수 있다.

---

# 🎞️ 비디오 재생 UX에서의 추가 고려사항

세션의 Simulator 데모는 실제 비디오 플레이어가 다음 기능을 제공하는 모습을 보여준다.

- subtitles
- audio language selection
- Do Not Disturb Focus 활성화

따라서 Apple은 영상 콘텐츠에 가능하면 다음을 포함하도록 권장한다.

- subtitles
- additional audio languages

차량 안에서는 notification이 영상 위에 나타날 수 있으므로, 시스템은 영상 화면을 떠나지 않고 Focus를 켤 수 있는 진입점도 제공한다.

---

# 🧠 API별 역할 정리

| API/개념 | 역할 |
|---|---|
| `CPSessionConfiguration` | 현재 CarPlay 세션의 video 지원 여부 등 기능 확인 |
| `CPPlaybackConfiguration` | playable item의 presentation, progress, action 등 재생 메타데이터 전달 |
| Details header | 하나의 미디어 아이템을 리스트 상단에 강조하고 action 제공 |
| Thumbnail overlay | badge, progress, sports info 등 시각 정보 추가 |
| `CPNowPlayingTemplate.shared.allowsMiniPlayer` | MiniPlayer 사용 여부 제어 |
| Voice Control template | 음성 대화의 prompt/icon/actions 표현 |
| `CPInterfaceController` | Voice Control 등 template presentation/overlay 제어 |
| `CPTemplateApplicationScene` | CarPlay에서 URL 기반 요청 수행 |
| Navigation panel | Map을 유지한 채 primary UI 영역에 조합형 UI 제공 |
| `mapTemplateShouldProvideRouteSharing` | Navigation app의 Route Sharing opt-in |
| `trip.routeSegmentsAvailableForRegion` | 개별 trip 단위 Route Sharing eligibility 제어 |

---

# 📋 구현 체크리스트

## Video apps

- [ ] AirPlay video streaming 지원 확인
- [ ] CarPlay video entitlement 구성
- [ ] 오디오도 유효한 콘텐츠라면 audio entitlement 병행 검토
- [ ] `CPSessionConfiguration`에서 video 지원 여부 확인
- [ ] video 미지원/주행 중 audio-only 전환을 고려한 playback 설계
- [ ] portrait/landscape thumbnail 비율 검토
- [ ] overlay/badge 필요 여부 결정
- [ ] `CPPlaybackConfiguration`에 elapsed time/duration/action 반영
- [ ] 재생 상태 변경 시 playback configuration 지속 갱신
- [ ] details header의 state/progress도 동기화
- [ ] subtitles와 추가 audio languages 제공 검토

## Now Playing / Voice

- [ ] 자동 MiniPlayer 동작 확인
- [ ] 정말 필요한 경우에만 `allowsMiniPlayer = false`
- [ ] Voice Control template의 prompt/icon/action 구성
- [ ] Overlay에서는 짧은 text variant 제공
- [ ] URL action은 CarPlay scene을 통해 실행
- [ ] 대화 상태를 waiting/processing audio feedback으로 보완
- [ ] AVAudioSession을 play-and-record/default/non-mixing으로 구성

## Navigation

- [ ] 기존 trip/route UI와 별개로 panel 사용 필요성 검토
- [ ] Panel에 route choice/details/waypoint/list item 조합
- [ ] Panel bottom action 구성
- [ ] Route Sharing 지원 차량 및 iOS 26.4+ 조건 확인
- [ ] Map Template에서 Route Sharing opt-in
- [ ] Trip 변경 시 route segments 다시 전달
- [ ] 차량이 제안한 waypoint 처리 방식 결정
- [ ] Travel estimates 반환 시 시스템 confirmation 흐름 검증
- [ ] 앱 자체 confirmation 흐름도 검증
- [ ] 특정 trip의 Route Sharing 비활성화 필요성 검토

## Testing

- [ ] Device Hub의 CarPlay Simulator 사용
- [ ] 다양한 차량 화면 크기 테스트
- [ ] video in car 지원/미지원 configuration 테스트
- [ ] video unavailable → audio-only 전환 테스트
- [ ] Route Sharing diagnostic tools 확인
- [ ] 실제 차량에서 entitlement/지원 여부 최종 검증

---

# ⚠️ 설계 시 주의할 점

## Video entitlement만으로 모든 CarPlay에서 노출되지 않음

Video-only 앱은 video in car를 지원하는 차량에서만 CarPlay 홈에 나타난다. 콘텐츠가 오디오로도 의미가 있다면 audio entitlement를 함께 고려해야 한다.

## Video playback 가능 여부는 런타임에 바뀔 수 있음

차량은 현재 video가 허용되지 않는다고 언제든 표시할 수 있다. 앱은 콘텐츠가 audio-only로 계속될 가능성을 고려해야 한다.

## Playback metadata는 일회성 설정이 아님

Thumbnail과 details header의 progress/playback state는 실제 재생 상태 변화에 맞춰 계속 업데이트해야 한다.

## Voice UI는 시각적 피드백만으로 충분하지 않음

차량 환경에서는 사용자가 화면을 주시하지 않는다. Waiting/processing sound 같은 audio cue가 중요하다.

## Route Sharing은 차량과 앱이 함께 제어

운전자 승인, 앱 opt-in, 개별 trip eligibility라는 여러 단계가 존재한다. 앱이 단독으로 route sharing을 강제할 수 없다.

---

# 🧩 세션의 전체 구조

이 세션은 CarPlay 앱을 다음 네 단계로 확장하는 흐름으로 볼 수 있다.

### 1. 더 많은 앱 카테고리

기존 audio/communication/navigation에서 voice conversation과 video browsing까지 확장한다.

### 2. 더 풍부한 CarPlay UI

Thumbnail, overlay, details header, playback metadata, MiniPlayer로 미디어 콘텐츠를 더 풍부하게 표현한다.

### 3. 더 자연스러운 음성 인터랙션

Voice Control template을 모든 카테고리에 개방하고 overlay와 audio feedback으로 운전 중 상호작용을 개선한다.

### 4. 차량과 navigation app의 협력

Panels로 navigation UI 구성을 유연하게 만들고, Route Sharing을 통해 차량의 driver assistance 및 EV route planning과 앱의 경로를 연결한다.

---

# 🔗 함께 보면 좋은 자료

- [Rev up your CarPlay app — WWDC26](https://developer.apple.com/videos/play/wwdc2026/212/)
- WWDC25 — Turbocharge your app for CarPlay
- Apple Developer — CarPlay for developers
- CarPlay Developer Guide
- Xcode Additional Tools — CarPlay Simulator

---

# 핵심 메시지

iOS 27의 CarPlay는 단순히 차량 화면에 기존 앱 기능을 옮기는 수준을 넘어, **비디오·음성·navigation·차량 자체 기능을 하나의 템플릿 기반 경험으로 연결**한다. 앱은 UI 레이아웃이나 차량 입력 하드웨어를 직접 관리하기보다 CarPlay framework의 template과 metadata를 제공하고, 시스템이 현재 차량과 주행 상태에 맞는 표현을 선택하도록 해야 한다. 특히 비디오 앱은 audio fallback을, navigation 앱은 운전자 승인과 차량의 waypoint 제안을 포함한 Route Sharing lifecycle을 설계의 일부로 다뤄야 한다.
