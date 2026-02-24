# 🚗 CarPlay in iOS 26

## ✨ 개요

iOS 26에서 CarPlay는 단순한 “미러링 화면”을 넘어
**Widgets · Live Activities · 멀티 디스플레이 · Instrument Cluster · Ultra 통합 경험**까지 확장되었습니다.

핵심 변화는 세 가지입니다:

1. **CarPlay 앱이 없어도** 위젯과 Live Activity로 진입 가능
2. 기존 CarPlay 앱은 **더 표현력 있는 Template API** 제공
3. Navigation 앱은 **Instrument Cluster / HUD까지 확장**

즉, 이제 CarPlay는
👉 “앱을 위한 별도 플랫폼”이 아니라
👉 “iPhone 기능이 차량 전반으로 확장되는 시스템 레이어”입니다.



---

# 🧩 1️⃣ CarPlay 진입 방식 확장

## 📦 CarPlay 앱이 없어도 가능한 것

iOS 26부터:

* `systemSmall` 위젯 지원 → CarPlay 자동 노출
* Live Activity 지원 → CarPlay Dashboard 자동 표시

즉,

> CarPlay Entitlement 없이도
> “운전자 경험에 들어올 수 있음”

---

# 🧱 2️⃣ Widgets in CarPlay

## 📍 어디에 나타나나?

* CarPlay Dashboard 좌측 페이지
* 터치 차량에서는 상호작용 가능
* iPhone 잠금 상태에서도 표시

---

## ⚙️ 구현 조건

단 하나:

```swift
.supportedFamilies([.systemSmall])
```

systemSmall만 지원하면 CarPlay 자동 지원

---

## 🚫 CarPlay에 적합하지 않은 위젯 처리

```swift
.disfavoredLocations([.carPlay])
```

사용 사례:

* 게임 위젯
* 반복 탭 필요
* 고밀도 텍스트
* Data Protection A/B 필요 위젯 (잠금 중 접근 불가)

⚠️ disfavored 위젯은:

* CarPlay 설정에 그룹화 표시
* 상호작용 비활성화

---

## 🧠 CarPlay 위젯 설계 원칙

* Glanceable 정보만
* 시스템 폰트/컬러 사용
* `widgetContentMargins` 고려
* `containerBackgroundRemovable(true)` 설정 시 배경 제거

👉 iPhone 위젯 설계 원칙과 동일하지만
**운전 중 맥락을 최우선 고려**

---

# 🔔 3️⃣ Live Activities in CarPlay

iOS 26부터:

* iPhone에서 시작된 Live Activity
* CarPlay Dashboard에 자동 표시

Dashboard 미노출 시:

* 화면 하단 알림 형태로 표시

---

## 📐 표시 규격

CarPlay는:

```
activityFamily(.small)
```

사용

구현하지 않으면:

* Dynamic Island compactLeading/trailing fallback

---

## 🚫 상호작용 불가

CarPlay Live Activity는:

* 비인터랙티브
* 가장 중요한 상태만 표현

---

# 🎛 4️⃣ CarPlay App Framework 확장

CarPlay Entitlement가 필요한 앱 카테고리:

* Audio
* Communication (SiriKit)
* Navigation
* EV Charging
* Parking
* Fueling
* Food Ordering
* Driving Task

---

# 📋 5️⃣ List Template 확장

## CPListImageRowItem 강화

iOS 26 신규:

* Multiline 지원
* 요소 disable 가능
* 다양한 표현 스타일 추가

### Row Element

기존 스타일 유지

### Card Element

* 세로 카드형
* 전체 이미지 or 상단 정사각형
* title/subtitle/tint 지원

### Condensed Element

* 컴팩트 표현
* rounded square / circular 이미지
* trailing SF Symbol

### Grid Element

* full image 표현

### Image Grid Element

* 이미지 + 하단 title/SF Symbol

---

## 📌 Pinned Elements

```swift
listTemplate.headerGridButtons = [...]
```

* 상단 고정 버튼
* CPDashboardButton 기반

Communication 앱은:

```swift
CPMessageGridItemConfiguration
```

* conversationIdentifier
* unread indicator 표시

---

# 🎧 6️⃣ Audio App 강화 (Sports Mode)

Now Playing 템플릿 확장

### CPNowPlayingModeSports

표시 가능 정보:

* 팀 로고
* 점수
* 경기 시계
* possession
* standings

시계는:

```swift
eventClock
```

시스템이 자동 count up/down

⚠️ time-shifting 발생 시
반드시 새로운 메타데이터 전달

---

## 🎵 Audio Best Practice

* 재생 직전에만 Audio Session 활성화
* 종료 시 deactivate
* AirPlay enhanced buffering 지원
* Spatial Audio / Dolby Atmos 대응

CarPlay는:

* 차량 오디오와 iPhone 오디오 혼합 환경

---

# 🗺 7️⃣ Navigation App 진화

## Liquid Glass 버튼

CPMapTemplate 버튼이 자동 Liquid Glass 스타일 적용

아이콘 대비 확인 필수

---

## 🖐 Multitouch 지원

지원 차량에서:

* Pinch to zoom
* Double tap zoom
* Two-finger pitch
* Two-finger rotate

CPMapTemplate 콜백으로 처리

---

## 🖥 Multi-display 지원

* Center display
* Dashboard
* Secondary display
* Instrument Cluster
* Heads-up Display

---

# 🧭 8️⃣ Navigation Metadata (핵심)

CarPlay는 차량에 “의미 정보”만 전달
차량이 렌더링을 결정

---

## CPManeuver

54개 타입 제공

예:

* straightAhead
* slightLeft
* sharpLeft
* onRamp
* offRamp
* enterFerry
* arriveAtDestination

---

## Junction Metadata

* exitCount
* exitAngles
* recommendedExit

복잡한 교차로 표현 가능

---

## 메타데이터 흐름

1. `mapTemplateShouldProvideNavigationMetadata = true`
2. CPNavigationSession 시작 시

   * 다수 maneuver 미리 전달
3. reroute 시:

   * pause
   * CPRouteInformationObject 생성
   * resume

---

# 🌡 Navigation 성능 최적화

* thermal 상태 관찰
* detail level 감소
* overview mode 활용
* CADisplayLink frame rate 자동 조정 고려
* Center console / Cluster 다른 뷰 사용 권장

👉 두 화면이 반드시 동일한 내용일 필요 없음

---

# 🚘 CarPlay Ultra

* 차량 전 디스플레이 통합
* 앱 + 차량 UI 일관성
* CarPlay 경험이 계기판까지 확장

---

# 🧠 핵심 정리

iOS 26 CarPlay의 방향성은 명확합니다:

### 1️⃣ 앱이 없어도 진입 가능

Widgets + Live Activities

### 2️⃣ CarPlay 앱은 더 표현력 강화

Template API 확장

### 3️⃣ Navigation은 차량과 의미 기반 협력

메타데이터 중심 설계

### 4️⃣ 멀티 디스플레이 시대

Center / Cluster / HUD 동시 지원

---

CarPlay는 더 이상 “차량용 보조 화면”이 아닙니다.

👉 iPhone의 기능이
👉 차량 전체 UX로 확장되는 플랫폼입니다.

이제 설계 기준은:

> “이 기능이 운전 중 glanceable한가?”
> “운전자 인지 부하를 줄이는가?”

이 두 질문으로 정리됩니다.
