# WWDC26 What’s new in assessment on macOS 요약

- Session: 230
- Title: What’s new in assessment on macOS
- Source: https://developer.apple.com/videos/play/wwdc2026/230/
- Framework: Automatic Assessment Configuration
- Platform: macOS 27
- Basis: Apple Developer 공식 전체 transcript 및 Code 섹션

---

## 🎯 한 줄 요약

macOS 27의 Automatic Assessment Configuration(AAC)은 시험 앱이 직접 보안 기능을 재구현하는 대신, **시험 시작 전 시스템 상태를 검증하고, 허용할 접근성·Menu Bar·Dock·Finder·입력 방식·실행 프로세스를 `AEAssessmentConfiguration` 하나로 선언**해 시스템이 안전한 평가 환경을 구성하도록 확장됐다.

---

## 🧭 세션 전체 흐름

세션은 AAC를 다섯 영역으로 나눈다.

1. **Precondition checks** — 시험 시작 전 Mac의 보안 상태 검증
2. **Accessibility restrictions** — 허용된 보조 기능만 유지
3. **System experience customization** — Menu Bar, Dock, 입력 방식, 파일 시스템 접근 제어
4. **Application launch restrictions** — 참가 앱과 필수 시스템 프로세스 외 실행 차단
5. **Best practices** — 최소 제한, transition callback, beta 검증 등 운영 원칙

AAC 사용에는 **restricted Automatic Assessment Configuration entitlement**가 필요하며, Apple Developer portal을 통해 요청해야 한다.

---

## 🛡️ Precondition checks: 시험 시작 전 Mac 상태 검증

시험 보안은 session을 연 뒤가 아니라 **시작 전에 Mac이 신뢰 가능한 상태인지 확인하는 것부터** 시작한다. macOS 27의 AAC는 다음 조건을 `AEAssessmentConfiguration`에 선언할 수 있다.

- System Integrity Protection(SIP) 활성화 요구
- MDM 관리 기기 요구
- 한 명의 사용자만 로그인되어 있을 것
- 로그인 계정 유형 제한(예: standard account)
- Lockdown Mode 비활성화 요구
- iCloud Private Relay 비활성화 요구

Apple은 SIP, MDM, 단일 사용자, 계정 유형 검사를 함께 사용하면 시험 시작 시점부터 기기가 **hardened / tamper-resistant state**에 있는지 확인하는 데 도움이 된다고 설명한다.

Lockdown Mode와 Private Relay는 일반적으로 보안·프라이버시 기능이지만, 시험 제공자의 네트워크나 평가 인프라 동작을 방해할 수 있으므로 AAC에서는 시험 요구에 따라 비활성 상태를 요구할 수 있다.

### 공식 코드

```swift
import AutomaticAssessmentConfiguration

func makeAssessmentConfiguration() -> AEAssessmentConfiguration {
    let configuration = AEAssessmentConfiguration()

    configuration.allowLockdownMode = false
    configuration.allowPrivateRelay = false
    configuration.requiresSIP = true
    configuration.requiresManagedDevice = true
    configuration.requiresSingleUser = true
    configuration.requiresUserAccountType = .standard

    return configuration
}
```

조건 중 하나라도 충족되지 않으면 시스템이 학생에게 **어떤 문제를 해결해야 시험을 계속할 수 있는지 알림**을 표시한다.

### 설계 포인트

AAC의 precondition은 단순한 앱 내부 체크가 아니다. 시험 앱이 임의로 “안전해 보인다”고 판단하는 대신, **운영체제가 제공하는 상태를 기반으로 session 진입 여부를 결정**하게 한다는 점이 중요하다.

---

## ♿ Accessibility restrictions: 접근성을 예외가 아니라 요구사항으로

macOS의 VoiceOver, Switch Control, Zoom, Voice Control 등 접근성 기능은 시험에서도 그대로 필요할 수 있다. 기본적으로 AAC session이 시작되면 Menu Bar와 Dock은 숨겨지지만, **이미 활성화된 접근성 기능은 계속 동작**한다.

다만 일부 접근성 기능은 사용자 생성 콘텐츠나 사용자 설정을 활용할 수 있기 때문에, 특정 학생에게 승인된 accommodation이 아니라면 시험 보안 관점에서 제한해야 할 수 있다.

AAC의 접근성 관련 Boolean 속성은 다음 의미를 가진다.

> `true`는 해당 기능을 시험 중 자동으로 켜는 것이 아니라, **사용자가 이미 켜 둔 기능을 session 중 사용할 수 있도록 허용**한다.

`false`로 설정하면 해당 기능은 session 시작 시 종료되고, assessment session 중 다시 실행할 수 없다.

### 공식 코드

```swift
import AutomaticAssessmentConfiguration

func makeAssessmentConfiguration() -> AEAssessmentConfiguration {
    let configuration = AEAssessmentConfiguration()

    configuration.allowsAccessibilityVoiceOver = true
    configuration.allowsAccessibilitySwitchControl = false
    configuration.allowsAccessibilityAlternativeInputMethods = true
    configuration.allowsAccessibilityBackgroundSounds = true
    configuration.allowsAccessibilityHoverText = true
    configuration.allowsAccessibilityLiveSpeech = true
    configuration.allowsAccessibilitySpokenContent = true
    configuration.allowsAccessibilityVoiceControl = true
    configuration.allowsAccessibilityZoom = true

    return configuration
}
```

이 예제에서는 대부분의 접근성 기능을 허용하지만 Switch Control은 차단한다. 사용 중이던 Switch Control은 session 시작 시 자동으로 종료된다.

### 운영 원칙

Apple은 접근성을 “보안을 위해 나중에 예외 처리하는 기능”으로 보지 말라고 강조한다. **처음부터 시험 설계 요구사항으로 포함**하고, 필요한 학생이 정상적인 보조 기술을 사용할 수 있도록 설계해야 한다.

---

## 🖥️ System experience customization

macOS 27에서는 assessment session 동안 학생이 경험하는 시스템 UI를 더 세밀하게 구성할 수 있다.

주요 대상은 다음과 같다.

- Menu Bar
- Menu Bar extras
- Apple menu
- Dictation
- AutoFill
- Structural Input
- Emoji & Symbols
- Dock
- Finder
- Open/Save panel
- 접근 가능한 디렉터리 및 파일

목표는 단순히 시스템 UI를 모두 숨기는 것이 아니라, **시험에 필요한 최소 기능은 남기면서 정보 유출 경로만 제거**하는 것이다.

---

## 📋 Menu Bar와 Menu Bar items 제어

AAC는 기본적으로 Menu Bar를 숨기지만, 앱 기능 또는 시험 진행에 필요하다면 다시 허용할 수 있다.

또한 Menu Bar 전체를 허용하면서도 표시 가능한 menu extra를 allowlist할 수 있다.

### 공식 코드

```swift
import AutomaticAssessmentConfiguration

func makeAssessmentConfiguration() -> AEAssessmentConfiguration {
    let configuration = AEAssessmentConfiguration()

    configuration.allowsMenuBar = true
    configuration.allowedMenuBarItems = [
        .battery,
        .clock,
        .volume
    ]
    configuration.allowedAppleMenuItems = [
        .sleep
    ]

    return configuration
}
```

위 설정은 Battery, Clock, Volume을 허용하고 Apple menu에는 Sleep만 노출한다.

### 중요한 의미

`allowedMenuBarItems`는 지정한 항목을 강제로 추가하는 API가 아니다. **원래 Menu Bar에 존재하던 항목 중 어떤 항목을 session 중 계속 사용할 수 있는지 제한**한다.

`allowedAppleMenuItems`를 빈 배열로 설정하면 Apple menu에서 `About This Mac`을 제외한 항목을 모두 숨길 수도 있다.

이 기능은 Wi-Fi나 Volume처럼 시험에 필요한 시스템 기능은 남기면서, 시험 콘텐츠 유출이나 외부 정보 접근에 이용될 수 있는 항목은 제거하는 용도다.

---

## ⌨️ 입력 방식 제한

일부 입력 기능은 일반 사용 환경에서는 편리하지만 평가에서는 정답이나 힌트를 제공할 수 있다.

세션이 든 예시는 다음과 같다.

- **Dictation** — 올바른 철자를 자동으로 생성할 수 있음
- **Emoji & Symbols** — 검색 가능한 기호 라이브러리 제공
- **Structural Input** — 문자 구성에 대한 단서 제공 가능
- **AutoFill** — Contacts 등 기존 데이터에서 답안·메모·참고 정보를 채워 넣을 수 있음

### 공식 코드

```swift
import AutomaticAssessmentConfiguration

func makeAssessmentConfiguration() -> AEAssessmentConfiguration {
    let configuration = AEAssessmentConfiguration()

    configuration.allowsDictation = false
    configuration.allowsAutoFill = false
    configuration.allowsStructuralInput = false
    configuration.allowsEmojiKeyboard = false

    return configuration
}
```

이렇게 설정하면 관련 기능은 메뉴에서도 사라지고, 일반적으로 이를 제공하던 UI control에서도 사용할 수 없게 된다.

---

## 🧱 Dock 허용

평가 환경이라고 해서 Dock이 반드시 위험한 것은 아니다. 허용된 앱이 여러 개라면 Dock은 학생이 앱을 이해하고 전환하는 데 익숙한 인터페이스다.

```swift
import AutomaticAssessmentConfiguration

func makeAssessmentConfiguration() -> AEAssessmentConfiguration {
    let configuration = AEAssessmentConfiguration()

    configuration.allowsDock = true

    return configuration
}
```

Dock을 허용하면 session에서는 **허용된 앱만** 표시된다.

Finder와 Trash는 Dock의 anchor 요소로 존재할 수 있지만, **Finder가 Dock에 보인다는 사실만으로 Finder 사용이 허용되는 것은 아니다.** Finder를 사용하려면 명시적으로 participant로 추가해야 한다.

---

## 📁 Finder, Open/Save panel, 파일 시스템 allowlist

파일을 직접 열거나 scratch paper를 저장해야 하는 시험이라면 Finder와 표준 Open/Save panel을 완전히 제거하는 대신 **제한된 디렉터리만 보이도록 구성**할 수 있다.

### 공식 코드

```swift
import AutomaticAssessmentConfiguration

func makeAssessmentConfiguration() -> AEAssessmentConfiguration {
    let configuration = AEAssessmentConfiguration()

    configuration.allowedDirectoriesAndFiles = [
        URL(fileURLWithPath: "~/Documents/")
    ]

    return configuration
}
```

이 예제는 Documents 디렉터리만 허용한다.

같은 allowlist가 다음 모두에 반영된다.

- Finder에서 보이는 위치
- Open panel
- Save panel
- 앱이 접근할 수 있는 시험 관련 파일 영역

즉 별도의 커스텀 file picker를 구현하지 않고도 **macOS 표준 파일 UI를 유지하면서 접근 범위를 제한**할 수 있다.

---

## 🚫 Application launch restrictions

시험 앱이 안전해도 동시에 실행되는 다른 프로세스가 다음과 같은 일을 할 수 있다.

- 화면 캡처
- 키 입력 기록
- 외부 전송
- 시스템 또는 시험 앱과 상호작용
- 자동화 수행

macOS 27의 AAC는 허용된 participant 외 사용자 프로세스를 종료하고 재실행을 막을 수 있다.

### 공식 코드

```swift
import AutomaticAssessmentConfiguration

func makeAssessmentConfiguration() -> AEAssessmentConfiguration {
    let configuration = AEAssessmentConfiguration()

    configuration.allowOnlyParticipantsToRun = true
    configuration.allowsUserScriptExecution = false

    return configuration
}
```

`allowOnlyParticipantsToRun = true`이면 session 시작 시 다음만 실행할 수 있다.

- 메인 assessment 앱
- 명시적으로 allowlist된 participant 앱
- 시스템 동작에 필수적인 프로세스

그 외 사용자 프로세스는 종료된다.

`allowsUserScriptExecution = false`는 **Shortcuts와 Automator script 실행을 차단**한다.

세션 데모에서는 Safari, Notes, 장시간 실행 중인 Shortcut이 있었지만 assessment 시작 후에는 assessment 앱과 participant인 Finder만 남고 Shortcut도 중단된다.

---

## 🧩 `AEAssessmentConfiguration`을 하나의 정책 객체로 보기

이번 세션의 여러 API는 모두 `AEAssessmentConfiguration`에 모인다.

```swift
let configuration = AEAssessmentConfiguration()
```

이 객체가 표현하는 정책을 개념적으로 나누면 다음과 같다.

| 영역 | 대표 속성 |
|---|---|
| 시스템 사전 조건 | `requiresSIP`, `requiresManagedDevice`, `requiresSingleUser`, `requiresUserAccountType` |
| 보안·프라이버시 기능 상태 | `allowLockdownMode`, `allowPrivateRelay` |
| 접근성 | `allowsAccessibilityVoiceOver`, `allowsAccessibilitySwitchControl`, `allowsAccessibilityZoom` 등 |
| 시스템 UI | `allowsMenuBar`, `allowedMenuBarItems`, `allowedAppleMenuItems`, `allowsDock` |
| 입력 기능 | `allowsDictation`, `allowsAutoFill`, `allowsStructuralInput`, `allowsEmojiKeyboard` |
| 파일 시스템 | `allowedDirectoriesAndFiles` |
| 프로세스 실행 | `allowOnlyParticipantsToRun`, `allowsUserScriptExecution` |

핵심은 시험 앱이 시스템 각 영역을 직접 감시하고 차단하는 것이 아니라, **필요한 정책을 선언하면 AAC가 시스템과 통합된 방식으로 실행 환경을 구성**한다는 것이다.

---

## ✅ Best practices

Apple은 기능 소개보다 이 운영 원칙들을 중요하게 강조한다.

### 1. AAC가 할 수 있는 일을 직접 재구현하지 않기

Assessment framework는 macOS와 깊게 통합되어 있다. 기존 앱에 자체 프로세스 감시, Menu Bar 조작, 제한 UI 등이 있다면 framework API로 대체하고 **중복 코드를 제거**하는 방향을 권장한다.

직접 구현은 OS 업데이트에 취약하고, 시스템이 알고 있는 상태를 앱이 불완전하게 추정하게 될 가능성이 크다.

### 2. 최소한만 제한하기

제약을 많이 추가할수록 보안은 강해 보일 수 있지만 학생 경험과 접근성을 저해할 수 있다.

Apple의 권장 방향은:

> **start permissive and tighten deliberately**

즉 먼저 가능한 한 허용적인 환경으로 시작하고, 실제 시험 요구사항이 있는 항목만 의도적으로 잠근다.

### 3. Accessibility를 처음부터 설계에 포함하기

보조 기술을 사용하는 학생을 “예외 케이스”로 나중에 추가하지 않는다. 평가 환경에서도 동등한 사용 경험을 제공하도록 **accessibility accommodation을 초기 보안 정책 설계와 함께 결정**한다.

### 4. Begin/end 호출 직후 상태를 확정하지 않기

AAC의 session transition은 `begin`이나 `end` API를 호출한 순간 즉시 완료되는 것이 아니다.

반드시 framework의 **transition callbacks**를 등록하고 다음 상태를 callback을 기준으로 처리한다.

- 실제로 session이 시작된 시점
- 실제로 session이 종료된 시점
- 예기치 않게 종료된 경우

앱의 시험 화면, 타이머, 서버 상태, 답안 기록 등을 단순히 `begin` 호출 직후 변경하면 실제 시스템 transition과 불일치할 수 있다.

### 5. 모든 macOS beta에서 즉시 회귀 테스트

평가 시스템은 OS와 깊게 통합되므로 Apple은 **새 macOS beta가 공개되는 날부터 전체 assessment test matrix를 실행**하라고 권장한다.

문제가 있으면 정식 릴리스 전 Feedback Assistant로 즉시 보고해야 한다. 정식 버전 출시 후 발견하면 사용자가 먼저 문제를 겪게 된다.

---

## 🧪 권장 테스트 매트릭스

세션 내용을 실무 테스트 항목으로 변환하면 다음과 같다.

### Precondition

- [ ] SIP 활성/비활성 Mac
- [ ] MDM enrolled / unmanaged Mac
- [ ] 한 명/복수 사용자 로그인
- [ ] Standard/admin 계정
- [ ] Lockdown Mode 활성/비활성
- [ ] iCloud Private Relay 활성/비활성
- [ ] 여러 조건 동시 실패 시 사용자 안내 확인

### Accessibility

- [ ] VoiceOver 허용 상태
- [ ] Switch Control 차단 상태
- [ ] Zoom/Voice Control 등 각각의 허용 정책
- [ ] session 시작 전 활성 기능이 정책에 따라 유지/종료되는지 확인
- [ ] session 중 차단된 기능 재실행 불가 확인

### System UI

- [ ] Menu Bar 전체 숨김
- [ ] Menu Bar 허용 + 일부 menu extra allowlist
- [ ] Apple menu 필터링
- [ ] Dock 표시/숨김
- [ ] Dock에 participant만 표시되는지 확인

### Input

- [ ] Dictation 차단
- [ ] AutoFill 차단
- [ ] Structural Input 차단
- [ ] Emoji & Symbols 차단
- [ ] 메뉴뿐 아니라 실제 text field/control에서도 차단되는지 확인

### File system

- [ ] Finder participant 등록 여부
- [ ] 허용 디렉터리만 Finder에서 표시되는지 확인
- [ ] Open/Save panel에 동일 필터 적용 확인
- [ ] 허용되지 않은 경로 접근 차단 확인

### Processes

- [ ] Safari/Notes 등 일반 앱 실행 상태에서 assessment 시작
- [ ] allowlisted participant 유지 확인
- [ ] 비허용 사용자 프로세스 종료 확인
- [ ] Shortcut/Automator 실행 중 session 진입 테스트
- [ ] session 중 재실행 시도 차단 확인

### Lifecycle

- [ ] 정상 begin transition callback
- [ ] 정상 end transition callback
- [ ] unexpected termination callback
- [ ] transition 진행 중 UI/타이머/server state 일관성 확인

---

## 🧠 설계 관점에서 중요한 변화

### 보안 체크와 사용자 경험을 분리하지 않는다

이 세션은 보안 기능을 늘리는 동시에 Menu Bar, Dock, Finder, 접근성 기능을 **필요한 만큼 다시 열 수 있게** 한다. 즉 “시험 모드 = 모든 것을 숨김”이 아니다.

좋은 assessment 환경은:

- 보안상 필요 없는 기능은 차단하고
- 학생이 익숙한 UI는 가능한 한 유지하며
- 접근성 accommodation을 존중하고
- 시험에 필요한 파일·앱만 안전하게 허용한다.

### 시스템 기능이 보안 경계다

AAC가 제공하는 precondition, process restriction, input restriction은 앱이 임의로 감지하는 heuristic보다 강한 시스템 통합을 가진다. Apple은 이를 근거로 **custom lockdown 구현을 줄이고 framework에 의존**하라고 권장한다.

### 보안 정책은 선언형으로 구성한다

`AEAssessmentConfiguration`은 “현재 어떤 프로세스를 죽일까?” 같은 절차적 제어보다 **어떤 상태와 기능을 허용할 것인가**를 선언한다.

이 구조는 시험 제공자의 정책을 코드에서 명확히 드러내며, 운영체제가 실제 enforcement를 담당하게 한다.

---

## 📋 도입 체크리스트

- [ ] Automatic Assessment Configuration entitlement 요청 여부 확인
- [ ] `AEAssessmentConfiguration` 생성 경로를 한 곳으로 정리
- [ ] SIP / MDM / single-user / account type 요구사항 결정
- [ ] Lockdown Mode / Private Relay 정책 결정
- [ ] 학생별 accessibility accommodation 정책 모델링
- [ ] Menu Bar 필요 여부 결정
- [ ] 필요한 Menu Bar extras만 allowlist
- [ ] Apple menu 항목 최소화
- [ ] Dictation / AutoFill / Structural Input / Emoji 정책 설정
- [ ] Dock이 시험 흐름에 유용한지 결정
- [ ] Finder가 필요한 경우 participant로 명시적으로 등록
- [ ] 필요한 디렉터리와 파일만 `allowedDirectoriesAndFiles`에 등록
- [ ] `allowOnlyParticipantsToRun` 적용 검토
- [ ] Shortcuts/Automator 차단 필요 시 `allowsUserScriptExecution = false`
- [ ] session transition callback 중심으로 앱 상태 머신 구성
- [ ] 기존 custom lockdown 코드와 중복 제거
- [ ] 최소 제한 원칙으로 정책 재검토
- [ ] macOS beta마다 전체 평가 시나리오 회귀 테스트
- [ ] 실제 시험 workflow로 end-to-end 검증

---

## 🔑 핵심 메시지

macOS 27의 Automatic Assessment Configuration은 assessment 앱이 더 강력하게 시스템을 잠그도록 만드는 API라기보다, **시험에 필요한 보안 조건과 허용 범위를 시스템에 선언하고 macOS가 일관되게 enforcement하도록 하는 프레임워크**다.

가장 중요한 방향은 세 가지다.

1. **시험 시작 전에 기기 무결성 조건을 검증한다.**
2. **필요한 접근성과 시스템 경험은 유지하고, 위험한 기능만 최소한으로 제한한다.**
3. **참가 앱과 필수 시스템 프로세스만 실행하도록 런타임을 통제하고, session transition을 시스템 callback 기준으로 관리한다.**

이 원칙을 따르면 자체 lockdown 코드를 줄이면서도 더 안전하고, 접근 가능하며, macOS 업데이트에 대응하기 쉬운 평가 환경을 만들 수 있다.

---

## 🔗 함께 보면 좋은 자료

- Apple Developer — Automatic Assessment Configuration
- WWDC26 — Secure your apps with App Attest
- Apple Developer — Automatic Assessment Configuration entitlement
