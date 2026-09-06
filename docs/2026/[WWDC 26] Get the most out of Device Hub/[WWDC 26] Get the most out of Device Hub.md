# WWDC26 Get the most out of Device Hub 요약

- Session: 260
- Title: Get the most out of Device Hub
- Source: https://developer.apple.com/videos/play/wwdc2026/260/
- Topic: Xcode 27, Device Hub, Devices, Simulators, Diagnostics, App Data Containers, Configuration, devicectl
- Chapters: Introduction, Device Hub overview, Control, Organize, Configure, Reproducing a bug, devicectl, Next steps

---

## 한 줄 요약

Device Hub는 Xcode 27과 함께 제공되는 **실제 Apple 기기와 Simulator를 동일한 UI와 workflow로 관리·제어·구성하는 독립 앱**으로, live screen control부터 appearance·location·audio·diagnostics·app data container·profile 관리까지 한곳에서 처리하고, 실기기에서 발생한 문제의 상태를 Simulator에 복제해 재현하며, 같은 기반 기술의 `devicectl`로 이를 script와 CI까지 확장할 수 있게 한다.

---

## 핵심 요약

이번 세션은 Device Hub를 세 가지 관점으로 설명한다.

- **Control**
  - 실제 기기와 Simulator를 같은 canvas에서 직접 조작
  - Click, drag, scroll, trackpad gesture
  - 기기별 contextual hardware control
  - Zoom, 1:1 physical size, resize mode, keyboard capture

- **Organize**
  - Sidebar에서 실제 기기와 Simulator inventory를 통합 관리
  - Filter, sort, group
  - Context menu quick actions
  - 여러 기기를 동시에 compact window 또는 tab으로 열어 비교

- **Configure**
  - Inspector에서 appearance, location, audio 등 device behavior 변경
  - Crash, spin, diagnostic report 확인
  - Device info 확인
  - App install/uninstall 및 data container download/replace
  - Configuration / provisioning profile 관리

세션 후반의 핵심 workflow는 다음과 같다.

```text
실제 Device에서 Bug 발견
      ↓
Device Hub로 Pairing
      ↓
Logging Profile 설치
      ↓
Screenshot + sysdiagnose 수집
      ↓
App Data Container 다운로드
      ↓
Simulator에서 동일 Device Model 선택
      ↓
실기기의 App Data Container로 교체
      ↓
Orientation + Location + Text Size 복제
      ↓
Bug 재현
      ↓
Fix 검증
```

또 CLI에서는 같은 기반 기술을 사용하는 `devicectl`로 device management와 automation을 수행한다.

---

# 🧭 Device Hub란?

Device Hub는 Xcode 27과 함께 설치되는 별도 앱이다.

중요한 점:

> Xcode를 실행하지 않아도 Device Hub를 직접 사용할 수 있다.

대상 사용자는 앱 개발자뿐 아니라 다음을 포함한다.

- Device configuration을 반복적으로 바꾸는 QA
- 여러 화면 크기에서 UI를 검증하는 개발자
- 실제 기기 inventory를 관리하는 팀
- Simulator와 physical device를 함께 쓰는 테스트 환경
- Diagnostics를 수집하는 엔지니어

Device Hub의 기본 철학은 매우 단순하다.

```text
Physical Device
       +
Simulator
       ↓
동일한 Control / Organize / Configure 경험
```

---

# 🧩 Xcode와의 관계

Xcode에서 Simulator로 앱을 Build & Run하면 Device Hub가 자동으로 실행된다.

화면에는 해당 Simulator의 live interactive display가 나타난다.

하지만 Device Hub는 Xcode의 단순 보조 창이 아니다.

독립 앱이므로:

- Xcode 없이 launch 가능
- 실제 Device 관리 가능
- 여러 Device와 Simulator를 동시에 관리 가능
- Diagnostics와 app container를 별도로 확인 가능
- Script automation은 `devicectl`로 연계 가능

---

# 🪟 Compact Mode

Xcode에서 Simulator를 실행했을 때 가장 먼저 보게 되는 형태다.

구성:

```text
┌─────────────────────────┐
│ Live Device Screen      │
│                         │
│                         │
├─────────────────────────┤
│ Contextual Controls     │
└─────────────────────────┘
```

Compact mode의 목적은 **화면과 핵심 control에 집중하는 것**이다.

---

# 🎛️ Contextual Device Controls

하단 control은 device type에 따라 달라진다.

## iPhone / iPad

예:

- Home
- Screenshot
- Rotation

## Apple TV

예:

- Play / Pause
- Navigation

## Apple Vision Pro

예:

- Environment
- Camera movement

## Apple Watch

예:

- Side button
- Digital Crown

즉 Device Hub가 generic simulator wrapper가 아니라 platform별 hardware interaction을 이해한다.

---

# 🖥️ Full Window

Compact mode 상단의 expand button을 누르면 full Device Hub window로 전환된다.

전체 UI는 크게 세 영역으로 이해하면 된다.

```text
┌──────────────┬──────────────────────┬──────────────┐
│ Sidebar      │ Canvas               │ Inspector    │
│              │                      │              │
│ Organize     │ Control              │ Configure    │
│              │                      │              │
└──────────────┴──────────────────────┴──────────────┘
```

세션 전체도 이 세 축으로 구성된다.

- Control
- Organize
- Configure

---

# 🎮 Control: Canvas

Full window 중앙에는 device canvas가 있다.

여기에서 device screen을 live로 보면서 직접 interaction할 수 있다.

지원되는 interaction:

- Click
- Drag
- Scroll
- Natural trackpad gestures

중요:

> Physical device와 Simulator가 같은 방식으로 동작한다.

세션에서는 실제 Apple Watch를 Mac 화면에서 직접 제어하는 예를 보여준다.

---

# 🔍 Zoom

Canvas 상단에는 확대/축소 control이 있다.

용도:

- 작은 UI detail 확인
- 특정 area 확대
- 화면 전체 비교

---

# 📏 1:1 Physical Size

실제 기기의 물리 크기와 동일한 크기로 화면을 표시하는 mode도 있다.

목적:

> 앱 UI가 실제 손에 든 기기에서 어느 정도 크기로 보이는지 확인

Pixel 단위 screenshot이 아니라 real-world physical dimension을 검토할 때 유용하다.

---

# ↔️ Resize Mode

Resize mode는 앱의 dimension을 자유롭게 변경할 수 있게 한다.

세션은 이 기능의 자세한 설명을 별도 WWDC26 세션인 **Modernize your UIKit app**으로 연결한다.

Resizable UI, adaptive layout 검증에 유용하다.

---

# ⌨️ Capture Keyboard

Capture Keyboard를 켜면 Mac keyboard input이 device로 직접 전달된다.

사용 예:

- Hardware keyboard shortcut 검증
- Key command 테스트
- Text input
- Keyboard navigation

```text
Mac Keyboard
     ↓
Device Hub
     ↓
Physical Device / Simulator
```

Mac에서 별도 focus 전환 없이 device의 hardware keyboard behavior를 테스트할 수 있다.

---

# 🪟 Compact Mode로 다시 전환

Full window에서도 언제든 compact mode로 돌아갈 수 있다.

따라서 workflow에 따라:

```text
Simple Interaction
→ Compact

Deep Configuration / Diagnostics
→ Full Window
```

처럼 전환할 수 있다.

---

# 🗂️ Organize: Sidebar

많은 device와 Simulator를 사용하는 개발자에게 sidebar는 전체 inventory의 중심이다.

하나의 sidebar에 다음이 함께 표시된다.

- Physical devices
- Simulators

즉 별도의 관리 화면을 오갈 필요가 없다.

---

# 🔎 Filter

Sidebar 상단 filter menu로 현재 표시할 device를 조절할 수 있다.

Device가 많을수록 다음과 같은 filtering이 중요해진다.

- Physical device만
- Simulator만
- 특정 platform
- 특정 model
- 특정 상태

세션은 구체 filter 목록 전체를 열거하지 않고, 여러 기준으로 filtering 가능하다고 설명한다.

---

# ↕️ Sort와 Group

Inventory를 여러 방식으로 정렬하거나 그룹화할 수 있다.

목적:

- Device 수가 많아도 원하는 대상에 빠르게 접근
- 테스트 matrix를 보기 쉽게 정리
- Physical device와 Simulator inventory를 체계화

---

# 🖱️ Context Menu

Device를 context-click하면 quick action을 수행할 수 있다.

세션에서 언급한 예:

- Restart
- iPhone / Apple Watch Simulator pairing

간단한 operation을 inspector까지 들어가지 않고 바로 수행할 수 있다.

---

# 🪟 여러 Device를 동시에 열기

Device Hub는 여러 device를 동시에 표시할 수 있다.

방법:

- Tabs
- Stand-alone compact windows

예:

```text
iPhone Small
      +
iPhone Medium
      +
iPhone Large
      ↓
동시에 App UI 비교
```

Sidebar에서 여러 기기를 선택하고 double-click하면 compact window를 각각 열 수 있다.

---

# 📱 Screen Size 비교 Workflow

iOS 앱 UI를 여러 phone size에서 확인한다고 가정한다.

기존 workflow:

```text
Simulator A 실행
확인
종료/전환
Simulator B 실행
확인
...
```

Device Hub:

```text
여러 Simulator 선택
      ↓
동시에 Compact Window Open
      ↓
Side-by-side 비교
```

UI regression 검증이 훨씬 빠르다.

---

# 🧰 Configure: Inspector

Full window 오른쪽 inspector는 device configuration과 diagnostics를 담당한다.

세션은 크게 다섯 panel로 설명한다.

---

# ⚙️ Device Settings

첫 번째 tab은 device가 어떻게 보이고 동작하는지를 변경한다.

세 가지 주요 영역:

```text
Appearance
Conditions
Audio
```

---

# 🎨 Appearance

예:

- Dark mode
- Text size
- 기타 appearance option

장점:

> Device Settings 앱으로 직접 들어가지 않아도 즉시 변경된다.

Accessibility 또는 visual configuration을 반복해서 바꾸는 테스트에서 매우 유용하다.

---

# 📍 Conditions

앱이 특정 environment에 어떻게 반응하는지 테스트한다.

세션의 대표 예:

```text
Location
```

실제 이동 없이 특정 도시나 위치 조건을 Simulator 또는 지원 device에 적용할 수 있다.

---

# 🔊 Audio

Audio 관련 configuration도 inspector에서 다룬다.

예:

- Sound level
- Audio input/output

Audio behavior까지 Device Hub 내부에서 한 workflow로 관리한다.

---

# 🩺 Diagnostic Reports

두 번째 tab은 diagnostics를 모아 보여준다.

앱이 다음 문제를 일으켰다면 investigation 시작점이 된다.

- Crash
- Hang
- Spin
- 기타 system diagnostic

```text
Device
      ↓
Logs / Diagnostics
      ↓
Device Hub Inspector
```

여러 종류의 report를 한곳에서 확인할 수 있다.

---

# ℹ️ Device Info

세 번째 tab에는 세 panel이 있다.

첫 번째는 Device Info다.

세션에서 언급한 정보:

- Storage
- Model
- Serial number

실제 device와 Simulator의 identity를 빠르게 확인할 수 있다.

---

# 📦 Apps Panel

Apps panel에서는 앱을 설치·제거·관리한다.

주요 기능:

- Install
- Uninstall
- Manage
- Data container download
- Data container replace

특히 **data container 관리**가 bug reproduction workflow에서 핵심 역할을 한다.

---

# 💾 App Data Container

Device Hub는 앱의 저장 상태를 파일처럼 다룰 수 있게 한다.

세션에서는 다음 operation을 설명한다.

- Saved state를 Finder에서 inspect
- Known baseline으로 restore
- Snapshot capture
- Device에서 data container download
- Simulator의 container replace

이를 이용해 실제 사용자 또는 QA device의 exact app state를 개발 환경으로 옮길 수 있다.

---

# 🪪 Profiles Panel

마지막 panel에서는 두 종류의 profile을 관리한다.

- Configuration profiles
- Provisioning profiles

세션 demo에서는 CoreLocation logging profile을 iPhone에 drag-and-drop으로 설치한다.

---

# 🐛 실전 Workflow: Real Device Bug 재현

세션 후반은 Device Hub의 개별 기능보다 더 중요한 내용을 보여준다.

**실제 기기에서 발견한 bug를 Simulator에 재현하는 end-to-end workflow**다.

앱은 Workout app이다.

새 feature:

```text
현재 Location의 Altitude
      ↓
Recovery Advice 생성
```

문제:

> Landscape mode에서 recovery recommendation text가 잘린다.

---

# ⌚ 실제 Device 구성

Workout app은 두 device에서 동작한다.

- iPhone
- Apple Watch

따라서 먼저 둘을 Mac과 연결한다.

---

# 🔗 Pair Nearby Device

Apple Watch pairing 과정:

```text
Sidebar
      ↓
Add
      ↓
Pair Nearby Device
      ↓
Watch에서 Mac 선택
      ↓
Pair
      ↓
Device Hub PIN 입력
```

한 번 pairing이 완료되면 이후 nearby 상태에서 Device Hub sidebar에 나타난다.

---

# 📡 Wireless Pairing

세션에서는 iPhone과 Watch를 Mac에 wireless pairing해서 사용한다.

즉 debugging을 위해 항상 cable을 꽂아둘 필요가 없다.

---

# 📍 CoreLocation Logging Profile 설치

Bug가 location-based feature에서 발생했으므로 CoreLocation logging을 추가한다.

```text
Profiles Panel
      ↓
Configuration Profile Drag & Drop
      ↓
iPhone에서 Install Confirm
      ↓
Reboot
```

세션에서는 privacy reason 때문에 installation 후 iPhone을 reboot한다고 설명한다.

---

# 📸 Screenshot 수집

Bug를 재현하기 위해 device를 landscape로 회전한다.

Recovery recommendation이 잘리는 것을 확인한 후 먼저 screenshot을 찍는다.

목적:

- UI engineer에게 정확한 시각적 상태 전달
- Orientation / text size 등 환경 단서 확인

---

# 🧪 sysdiagnose

Screenshot만으로 충분하지 않을 수 있으므로 system-level diagnostics도 수집한다.

```text
Bug 발생
      ↓
Start sysdiagnose
      ↓
System-level diagnostics capture
```

세션에서는 sysdiagnose가 시간이 걸리므로 실행해둔 동안 다른 정보를 수집한다.

---

# 📋 Device ↔ Mac Clipboard Workflow

화면에서 잘리는 실제 text도 전달한다.

Device Hub의 live screen에서 text를 선택한다.

```text
Device Text 선택
      ↓
Copy
      ↓
Mac File에 Paste
```

UI screenshot뿐 아니라 실제 content까지 바로 Mac으로 가져올 수 있다.

---

# 📦 Data Container 수집

UI bug의 재현 여부가 앱의 저장 데이터에 영향을 받을 수도 있다.

따라서 실제 iPhone에 저장된 app data 전체를 download한다.

```text
Apps Inspector
      ↓
App Data Container
      ↓
Download
```

이 파일을 다른 개발자에게 전달한다.

---

# 📤 Bug Report Package

세션의 실제 전달 자료는 사실상 다음 bundle이다.

```text
Screenshot
+
sysdiagnose
+
Problematic Text
+
App Data Container
```

이렇게 하면 bug를 받은 사람이 추측으로 환경을 재구성할 필요가 크게 줄어든다.

---

# 🧪 Simulator에서 재현

UI engineer는 performance issue가 아닌 UI 문제이므로 Simulator에서 reproduction을 시도한다.

재현을 위해 세 가지를 맞춘다.

```text
1. Device Model
2. App Data
3. Device Configuration
```

---

# 1️⃣ Device Model 맞추기

실제 bug device:

```text
iPhone 17e
```

동일한 physical device는 없지만 해당 Simulator가 있다.

Sidebar에서 Simulator를 선택하고 Info panel에서 model이 iPhone 17e인지 확인한다.

---

# 2️⃣ App Data 맞추기

Simulator의 앱은 빈 상태다.

실제 iPhone에서 받은 data container로 교체한다.

```text
Simulator App
      ↓
Apps Inspector
      ↓
Replace Data Container
      ↓
실제 iPhone Container 사용
```

앱을 다시 실행하면 실제 device에 있던 workout data가 그대로 나타난다.

---

# 3️⃣ Device Configuration 맞추기

다음으로 실제 device의 visual/environment configuration을 복제한다.

세션은 screenshot을 단서로 하나씩 확인한다.

---

# 🔄 Orientation

Screenshot에서 landscape임을 확인한다.

Device controls에서 Simulator를 landscape로 회전한다.

하지만 아직 bug는 재현되지 않는다.

---

# 📍 Location

실제 device location은 Johannesburg였다.

고도가 높은 지역에서 recovery recommendation string이 길어지는 것이 bug 조건 중 하나였다.

Settings inspector에서 Johannesburg를 선택해 location을 simulation한다.

그래도 아직 text truncation이 보이지 않는다.

---

# 🔠 Text Size

Screenshot을 다시 보니 실제 device는 text size가 매우 크다.

Appearance setting에서 text size를 최대로 올린다.

그 순간 bug가 재현된다.

```text
Landscape
      +
Johannesburg
      +
Large Text Size
      ↓
Recovery Text Truncation
```

---

# 🧠 복합 조건 Bug

이 demo가 중요한 이유는 하나의 setting만으로는 문제가 나타나지 않았기 때문이다.

필요 조건:

1. Landscape
2. Specific location
3. Very large text size

이 세 가지가 동시에 맞아야 bug가 발생했다.

Device Hub는 실기기와 Simulator의 configuration을 같은 interface에서 다룰 수 있기 때문에 이런 **configuration intersection bug**를 빠르게 재현하게 해준다.

---

# ✅ Fix Verification

Bug를 안정적으로 재현할 수 있게 되면 fix 검증도 쉬워진다.

```text
Known Reproduction State
      ↓
Code Fix
      ↓
Same Simulator State
      ↓
Regression Verification
```

핵심은 bug를 “한 번 본 상태”에서 “반복 가능한 테스트 상태”로 바꾸는 것이다.

---

# 🤝 Device와 Simulator의 동일한 Mental Model

세션이 반복해서 강조하는 지점:

> Device인지 Simulator인지에 따라 다른 도구를 배울 필요가 없다.

공통 기능:

- Live screen
- Hardware controls
- App management
- Appearance
- Location
- Diagnostics
- Profiles

이를 하나의 Device Hub workflow로 통합한다.

---

# ⌨️ `devicectl`

GUI 자동화가 아니라 script 또는 CI workflow가 필요하다면 `devicectl`을 사용한다.

Device Hub와 **같은 underlying technology** 위에 만들어진 command-line tool이다.

---

# 🧰 devicectl이 할 수 있는 일

세션에서 언급한 예:

- List devices
- Install app
- Change setting
- Dark ↔ Light mode 전환
- Device information 조회
- Capture diagnostics
- Test environment device management

즉 GUI Device Hub의 많은 작업을 CLI로 자동화할 수 있다.

---

# 📄 Structured JSON Output

Script나 CI에서는 human-readable output보다 machine-readable format이 필요하다.

`devicectl`은 JSON output option을 제공한다.

```text
devicectl
      ↓
--json-output
      ↓
Structured Result
      ↓
Script / CI Pipeline
```

Automation에서 parsing 안정성을 높일 수 있다.

---

# 🤖 CI Workflow 예

세션 내용을 기반으로 다음과 같은 automation을 구성할 수 있다.

```text
CI Job
  ↓
devicectl list
  ↓
Target Device 선택
  ↓
App Install
  ↓
Appearance / Setting 변경
  ↓
Test Run
  ↓
Diagnostics Capture
  ↓
JSON Result 수집
```

Device Hub가 manual testing용이라면 `devicectl`은 그 workflow를 automation으로 확장하는 도구다.

---

# 🧩 Device Hub 기능 지도

| 영역 | 기능 | 대표 사용 사례 |
|---|---|---|
| Compact Mode | Live screen + essential controls | 빠른 앱 interaction |
| Canvas | Click, drag, scroll, gesture | Mac에서 device 직접 제어 |
| Zoom | 화면 확대/축소 | UI detail 검사 |
| 1:1 Physical Size | 실제 물리 크기 표시 | Real-world UI size 확인 |
| Resize Mode | App dimension 변경 | Adaptive UI 검증 |
| Capture Keyboard | Mac keyboard 전달 | Key command 테스트 |
| Sidebar | Device/Simulator inventory | 다중 기기 관리 |
| Filter/Sort/Group | Inventory 정리 | 대규모 device pool |
| Multi-window | 여러 device 동시 표시 | Screen size 비교 |
| Appearance | Dark mode, text size | Visual/accessibility testing |
| Conditions | Location 등 | Environment simulation |
| Audio | Sound I/O 설정 | Audio testing |
| Diagnostics | Crash/spin/log 확인 | 문제 분석 |
| Info | Storage/model/serial | Device identity 확인 |
| Apps | Install/uninstall | App lifecycle 관리 |
| Data Container | Download/replace/snapshot | Bug reproduction |
| Profiles | Configuration/provisioning | Logging/test profile 관리 |
| devicectl | CLI automation | Scripts / CI |

---

# 📋 체크리스트

## Device Hub 시작

- [ ] Xcode 27 설치
- [ ] Device Hub 독립 실행 가능 여부 확인
- [ ] Xcode Build & Run 시 automatic launch 확인
- [ ] Compact mode와 full window 전환 익히기

## Physical Device

- [ ] Nearby device pairing
- [ ] Wireless connection 확인
- [ ] Apple Watch pairing flow 확인
- [ ] Device가 nearby일 때 sidebar에 표시되는지 확인
- [ ] Contextual hardware control 확인

## Simulator

- [ ] Simulator가 physical device와 같은 sidebar에 나타나는지 확인
- [ ] Model / OS configuration 확인
- [ ] 여러 Simulator를 동시에 compact window로 열기
- [ ] Screen size별 UI 비교

## Canvas

- [ ] Click interaction
- [ ] Drag interaction
- [ ] Scroll
- [ ] Trackpad gesture
- [ ] Zoom
- [ ] 1:1 physical size
- [ ] Resize mode
- [ ] Capture Keyboard
- [ ] Device-specific control 확인

## Inventory

- [ ] Filter 사용
- [ ] Sort 사용
- [ ] Group 사용
- [ ] Context menu quick action 확인
- [ ] Frequently used device 접근 방식 정리

## Appearance

- [ ] Light mode
- [ ] Dark mode
- [ ] Text size 변경
- [ ] Large accessibility size 테스트
- [ ] 변경이 즉시 앱에 반영되는지 확인

## Conditions

- [ ] Location simulation
- [ ] 특정 region-specific content 확인
- [ ] Location에 따라 text 길이가 바뀌는 UI 점검
- [ ] Orientation과 condition을 조합한 테스트

## Audio

- [ ] Sound level 설정
- [ ] Input/output configuration 확인
- [ ] Device와 Simulator에서 동일 workflow 확인

## Diagnostics

- [ ] Crash report 확인
- [ ] Spin report 확인
- [ ] Hang 발생 시 diagnostic 시작점 확인
- [ ] sysdiagnose capture workflow 익히기
- [ ] Screenshot 함께 수집

## Profiles

- [ ] Configuration profile drag-and-drop
- [ ] Device에서 installation confirm
- [ ] Logging profile별 reboot requirement 확인
- [ ] Provisioning profile 관리

## App Management

- [ ] App install
- [ ] App uninstall
- [ ] Data container download
- [ ] Data container replace
- [ ] Finder에서 saved state inspect
- [ ] Known baseline restore
- [ ] Snapshot capture

## Bug Reproduction

- [ ] 실제 device screenshot 확보
- [ ] sysdiagnose 확보
- [ ] Problematic text/content 확보
- [ ] App data container 확보
- [ ] 동일 Simulator model 선택
- [ ] Data container 교체
- [ ] Orientation 일치
- [ ] Location 일치
- [ ] Text size 일치
- [ ] Appearance/accessibility setting 일치
- [ ] 복합 조건에서 bug 재현되는지 확인
- [ ] Fix 후 동일 상태로 regression 검증

## devicectl

- [ ] Device list command 확인
- [ ] App install command 확인
- [ ] Device setting 변경 command 확인
- [ ] Device info query 확인
- [ ] Diagnostic capture 확인
- [ ] JSON output 사용
- [ ] Script / CI integration 검토

---

# ⚠️ 구현·테스트 시 주의할 점

## Device Model만 같다고 Bug가 재현되는 것은 아니다

세션의 example처럼 bug는 다음 조건의 조합일 수 있다.

```text
Model
+
Orientation
+
Location
+
Text Size
+
App Data
```

따라서 reproduction package에는 configuration 정보가 포함돼야 한다.

## Screenshot은 단순 증거가 아니라 Configuration 단서다

세션에서는 screenshot만 보고:

- Landscape
- Large text size

를 파악한다.

좋은 bug report screenshot은 UI 상태뿐 아니라 환경을 추론할 수 있게 한다.

## App Data Container가 Reproduction의 핵심일 수 있다

단순 test account나 fake data로는 동일 상태를 만들지 못할 수 있다.

Device Hub의 container download/replace는 실제 device state를 Simulator에 복제하는 데 매우 유용하다.

## Diagnostic Profile은 조건에 따라 Reboot가 필요하다

세션의 CoreLocation logging profile은 privacy reason 때문에 설치 후 iPhone reboot를 수행한다.

Profile별 requirement를 확인해야 한다.

## devicectl은 Device Hub와 별개의 철학이 아니다

둘은 같은 underlying technology를 공유한다.

```text
Manual Workflow
→ Device Hub

Automation
→ devicectl
```

두 도구를 서로 보완적으로 사용하는 것이 자연스럽다.

---

# 🧭 권장 팀 Workflow

## QA / Tester

```text
Device Hub에서 Bug 발견
      ↓
Screenshot
      ↓
Diagnostics
      ↓
App Data Container
      ↓
Configuration 기록
      ↓
Developer에게 전달
```

## Developer

```text
동일 Simulator 선택
      ↓
Data Container 복원
      ↓
Appearance / Location / Orientation 복제
      ↓
Bug 재현
      ↓
Fix
      ↓
같은 상태에서 검증
```

## CI

```text
devicectl
      ↓
Device/Simulator Setup
      ↓
App Install
      ↓
Setting 변경
      ↓
Test
      ↓
Diagnostics / JSON Output
```

---

# 🎯 세션 Demo의 핵심 교훈

실제 bug는 단순한 landscape bug가 아니었다.

필요 조건:

```text
Landscape
+
Johannesburg
+
Maximum Text Size
```

특정 location의 high elevation 때문에 recovery recommendation string이 길어지고, large text size와 landscape width가 동시에 만나면서 truncation이 발생했다.

이 bug를 빠르게 찾을 수 있었던 이유는 Device Hub가:

1. 실제 iPhone의 data와 diagnostics를 수집하고
2. 동일한 iPhone model Simulator를 선택하고
3. App data를 복원하고
4. Location과 accessibility appearance를 즉시 변경하게 해줬기 때문이다.

---

# 핵심 메시지

Device Hub의 가장 큰 변화는 Simulator를 보기 좋게 감싼 새로운 창이 생겼다는 것이 아니다.

**실제 Apple device와 Simulator를 하나의 동일한 개발·테스트 mental model로 통합했다는 점**이 중요하다.

개발자는 Device Hub에서 device를 직접 조작하고, 여러 기기를 side-by-side로 비교하며, dark mode·text size·location 같은 configuration을 빠르게 바꿀 수 있다.

문제가 발생하면 crash/spin diagnostic과 sysdiagnose를 수집하고, 앱의 data container까지 내려받아 다른 개발자의 Simulator에 그대로 복원할 수 있다.

세션의 Workout app example은 특히 중요하다.

UI truncation bug는 landscape 하나만으로는 재현되지 않았다.

```text
Landscape
+
Johannesburg
+
Large Text Size
```

라는 세 조건이 동시에 필요했다.

Device Hub는 실제 device에서 얻은 screenshot과 app data를 Simulator의 model, orientation, location, text size와 맞추면서 이 복합 조건을 반복 가능한 상태로 만들었다.

그리고 GUI workflow가 자동화돼야 할 때는 같은 기반 기술의 `devicectl`을 사용한다.

따라서 Device Hub와 `devicectl`을 함께 보면 Apple이 제안하는 새로운 device workflow는 다음과 같다.

```text
Explore / Diagnose / Reproduce
        → Device Hub

Repeat / Automate / CI
        → devicectl
```

즉 Xcode 27의 device workflow는 **Device와 Simulator를 따로 관리하는 방식에서, 동일한 상태·동일한 도구·동일한 자동화 모델로 다루는 방식**으로 이동하고 있다.

---

# 함께 보면 좋은 세션과 자료

- Modernize your UIKit app — WWDC26
- What’s new in Xcode 27 — WWDC26
- Getting the Most Out of Simulator — WWDC19
- Device Hub documentation
- `devicectl` documentation
