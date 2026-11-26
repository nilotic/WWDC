# WWDC26 — What’s new in managing Apple devices

- **Session:** 206
- **Speaker:** Cyrus Daboo, Device Management
- **Source:** https://developer.apple.com/videos/play/wwdc2026/206/
- **Basis:** Apple Developer 공식 전체 transcript
- **Topic:** Apple Business / Apple School Manager, declarative device management, app management, Platform SSO, education

---

## 🎯 한 줄 요약

Apple은 2026년 기기 관리의 기준을 **declarative device management**로 명확히 전환하고, Apple Business 확장, 새 Mac의 Managed Migration, credential/status 기반 관리, macOS 27의 app/privacy/binary control, 강화된 Platform SSO, Shared iPad와 Classroom 기능까지 **배포·보안·인증·교육 관리 전반을 선언형 모델 중심으로 확장**했다.

---

## 🧭 세션 구성

| Time | Chapter |
|---|---|
| 0:00 | Introduction |
| 0:41 | Apple services |
| 2:34 | Device management |
| 9:33 | App management |
| 14:56 | Identity Integrations |
| 19:46 | Education |

Apple이 세션에서 반복해서 강조한 메시지는 단순하다.

> **“The standard for device management is declarative management.”**

과거의 “미래는 declarative management”가 아니라, 이제는 실제 운영 환경에서 표준으로 사용해야 할 현재형 모델이라는 선언이다.

---

# 🏢 Apple services

## Apple Business의 통합 플랫폼화

Apple Business는 기업 규모와 관계없이 조직 운영에 필요한 기능을 한곳에서 제공하는 **all-in-one platform**으로 확장되며, 200개가 넘는 국가 및 지역에서 제공된다.

주요 기능:

- Zero-touch deployment
- Managed Apple Accounts
- Built-in device management
- 조직·사용자·기기·앱 관리

즉, 기존 Apple Business Manager의 단순한 배포/등록 도구 성격을 넘어 더 폭넓은 비즈니스 관리 플랫폼으로 확장되는 방향이다.

### 새 Apple Business APIs

새 API로 다음 작업을 자동화할 수 있다.

- Blueprints 생성
- Configurations 생성
- Users 수정
- Groups 수정
- App license 정보 조회
- Audit events 조회

기존 API와 함께 사용할 수 있다.

- Servers 목록
- Devices 목록
- Inventory 조회
- Inventory를 device management server에 할당
- AppleCare warranty 정보 조회

조직이나 MDM 제품이 Apple Business를 직접 자동화하는 범위가 넓어진다.

## App Store subscription volume licensing

App Store 앱의 **subscription에 대한 새로운 volume licensing** 메커니즘도 도입된다.

IT 관리자는:

- 앱 구독을 대량 구매하고
- 조직에서 관리하며
- 기존 managed app 배포와 동일한 흐름으로 device management service를 이용해 subscription을 할당할 수 있다.

세션 시점에는 Apple Business와 Apple School Manager에 이후 제공될 예정이라고 설명한다.

관련 세션: **Offer subscriptions to groups and organizations**

---

# 🧩 Declarative device management가 표준

Apple은 declarative management가 더 이상 roadmap 기능이 아니라 실제 fleet에서 운영 중인 표준임을 강조한다.

기존 imperative MDM 방식은 서버가 지속적으로 device state를 확인하고 명령을 보내야 했다. Declarative management에서는:

- 서버가 원하는 상태를 선언하고
- 기기가 자체적으로 상태를 적용하며
- 상태 변화는 status channel을 통해 서버에 알린다.

이를 통해 서버의 polling과 상태 동기화 부담을 크게 줄일 수 있다.

---

# 💻 Managed Migration for Mac

새 Mac으로 이동할 때 데이터를 옮기면서도 **device management enrollment와 settings를 유지**하는 managed migration 기능이 추가된다.

## 동작 흐름

1. 새 Mac이 device management enrollment를 완료한다.
2. 서버가 새로운 declarative configuration을 즉시 배포한다.
3. IT 관리자가 허용한 migration 범위가 적용된다.
4. Migration Assistant가 해당 정책을 사용자에게 보여준다.
5. 사용자는 설정을 바꿀 수 없으며 Continue만 선택해 migration을 시작한다.
6. Migration 진행 상태는 declarative management status를 통해 서버에 보고된다.

## 관리자가 제어할 수 있는 항목

- Accounts
- Files
- Security settings
- Privacy settings

따라서 조직은 새 Mac으로 전환할 때 사용자 데이터와 업무 환경은 유지하면서도 관리 정책과 enrollment continuity를 보존할 수 있다.

---

# 🍎 Apple Intelligence / Siri / Keyboard 관리

26.4 release에서 Apple Intelligence, Siri, keyboard 관련 declarative configurations가 추가되었고, 최신 release에서는 더욱 세분화된다.

IT 관리자는 Apple Intelligence와 Siri 전체를 하나의 on/off 상태로 다루는 대신 **개별 기능별로 granular control**을 제공할 수 있다.

이는 enterprise 환경에서 기능 허용 범위를 보다 세밀하게 정책화할 수 있다는 의미다.

---

# 🔐 Credential management

기존 configuration profile은 credential 참조 방식에 한계가 있어 하나의 인증서를 여러 설정에 재사용하려면 큰 profile을 구성하는 경우가 많았고, credential 갱신도 비효율적이었다.

Declarative model은 **many-to-many relationship**을 지원한다.

따라서:

- 하나의 credential asset을 여러 configuration이 참조할 수 있고
- certificate / identity / password를 declarative asset으로 관리하며
- credential refresh 시 서버는 asset만 갱신하면 된다.

이후 device가 해당 asset을 참조하는 모든 configuration에 변경 사항을 자체 적용한다.

### 의미

Credential lifecycle 관리가 configuration 단위가 아니라 **공유 asset 단위**로 바뀐다.

이는 대규모 fleet에서 certificate rotation과 credential refresh 비용을 크게 줄이는 구조다.

---

# 📡 Declarative Status Channel

Declarative status channel은 서버가 device state를 계속 polling할 필요를 줄인다.

서버가 필요한 status item을 subscribe하면, 값이 바뀔 때 device가 변경 사항을 서버에 전달한다.

## 새 status items

세션에서 언급된 신규 항목:

- Enrollment type
- Awaiting device configuration
- Return to Service state
- Shared iPad state
- Current push token
- Lockdown Mode 활성화 여부
- Device system health
- Enhanced log collection status
- Content Caching service status
- 기타 여러 device state

이 구조는 대규모 fleet monitoring에서 특히 중요하다.

---

# 🩺 Device system health monitoring

기존 iOS/iPadOS에서는 Settings 앱을 통해 hardware component 문제를 사용자에게 알려줄 수 있었다.

**iOS/iPadOS 27**에서는 같은 정보를 declarative management status item으로 IT 관리자에게도 제공한다.

예시 hardware components:

- Baseband
- Camera
- Face ID
- Touch ID
- 기타 시스템 구성 요소

### 운영 효과

IT 관리자는 fleet 전체의 hardware health를 중앙에서 확인하고, 사용자가 문제를 보고하기 전에 선제 대응할 수 있다.

예를 들어 특정 기기의 Face ID나 camera component 문제가 status로 올라오면 service desk가 먼저 사용자를 지원할 수 있다.

---

# 🧾 Enhanced log collection

AppleCare support가 제공하는 링크를 통해 사용자가 enhanced log를 수집하던 흐름이 device management에서도 직접 가능해진다.

지원 OS:

- iOS 27
- iPadOS 27
- tvOS 27
- macOS 27

조직 소유 기기에서 IT 관리자가 다음 새 command를 사용할 수 있다.

```text
TriggerEnhancedLogCollection
```

## 흐름

1. IT 관리자가 command 전송
2. Device가 enhanced logs 수집
3. AppleCare 분석 흐름으로 전달
4. Declarative status를 통해 진행 상태 모니터링

따라서 remote support와 AppleCare escalation 과정에서 사용자가 직접 복잡한 로그 수집 단계를 수행할 필요가 줄어든다.

---

# 🌐 Content Caching 관리 강화

Content Caching은 local network의 Mac에 다음 콘텐츠를 캐시해 bandwidth 사용을 줄이고 배포 속도를 높인다.

- Software updates
- Applications
- Apple Intelligence content
- 기타 Apple content

macOS 27에서는:

- Content Caching service를 제어하는 새 declarative configuration
- 서비스 상태를 보고하는 새 declarative status items
- Content Cache server가 임의의 HTTPS endpoint로 직접 report를 전송하는 기능

이 추가된다.

### 의미

조직은 여러 cache server를 단순히 켜고 끄는 수준을 넘어, 중앙 모니터링 시스템과 연계해 **cache fleet health dashboard**를 구축할 수 있다.

---

# 📦 App management

## Declarative app configuration이 macOS 27로 확대

기존 iOS, iPadOS, visionOS에서 제공되던 declarative app configuration이 **macOS 27**에도 도입된다.

Managed apps에 다음을 안전하게 제공할 수 있다.

- Credentials
- App configuration
- Hardware-bound keys
- Managed Device Attestation 기반 인증

Apple은 enterprise app 개발자에게 **ManagedApp framework** 채택을 권장한다.

### 보안 효과

기업 서비스는 앱이 실제로 관리되는 조직 기기에서 실행 중인지 더 강하게 검증할 수 있다.

Hardware-bound key와 Managed Device Attestation을 조합하면 앱/extension이 enterprise service에 접근할 때 신뢰도를 높일 수 있다.

---

# 🧹 Declarative package cleanup

macOS 27에서는 declarative management package를 제거할 때 해당 package가 설치했던 **모든 파일과 디렉터리도 함께 제거**하도록 선택할 수 있다.

기존에는 package configuration만 제거하고 실제 파일이 남을 수 있었지만, 이제 IT 관리자가 cleanup 정책을 선택할 수 있다.

이는:

- 보안 도구 제거
- 앱 uninstall
- 임시 deployment
- 정책 폐기

등에서 orphaned files를 줄이는 데 유용하다.

---

# 🔏 Consolidated privacy consent

Apple은 privacy에서 disclosure와 user consent 원칙을 유지하면서, 관리 환경에서 반복 prompt로 인해 사용자가 잘못된 선택을 하는 문제를 줄이려 한다.

**iOS / iPadOS / macOS 27**에서 관리 앱이나 Safari website가 처음 접근할 때 **consolidated privacy consent prompt**를 표시할 수 있다.

## Prompt에 포함되는 정보

- Organization name
- App name 또는 website
- IT 관리자가 제공한 justification string
- 권장 privacy components
- 각 privacy permission에 대한 앱 자체 justification

버튼:

- **Allow**
- **Not Now**

### Allow

관리자가 지정한 권장 privacy defaults가 적용되고, 이후 앱이 해당 component를 사용할 때 추가 prompt가 나타나지 않는다.

### Not Now

기존 unmanaged app과 동일하게 실제 접근 시점마다 일반 privacy consent prompt가 나타난다.

Apple은 **Allow를 default/highlighted button**으로 표시한다고 설명한다.

이는 관리자가 사용자의 consent를 강제로 우회하는 방식이 아니라, **권장 설정을 한 번에 명확하게 제시하고 사용자가 동의할 수 있게 하는 방식**이다.

## 관리 가능한 범위

세션은 앱과 Safari website 모두에 privacy component를 지정할 수 있다고 설명한다. 관리자는 app/website와 허용을 권장할 component를 declarative configuration에 선언한다.

---

# 🚫 macOS 27 Binary Execution Control

macOS 조직 환경에는 App Store 앱뿐 아니라 다양한 executable과 binary가 존재한다.

규정 준수와 보안을 위해 macOS 27은 **declarative management 기반 binary execution control**을 제공한다.

기술적 기반:

- Endpoint Security framework

가능한 동작:

- 특정 binary 실행 허용
- 특정 binary 실행 거부
- 거부된 binary와 관련된 실행 중 process 종료

## Matching rules

Binary rule은 **code signing properties**를 이용해 일치 여부를 판단한다.

이는 단순 file path나 filename보다 신뢰도가 높고, 실제 서명된 소프트웨어 identity를 기준으로 정책을 적용할 수 있다.

추가 옵션:

- 모든 managed app을 자동 허용

이를 사용하면 관리 앱 각각에 개별 allow rule을 작성하지 않아도 된다.

## 관련 configuration

새 app privacy control과 binary blocking restriction은 다음 새 declarative configuration 일부다.

```text
app.settings
```

Safari website privacy permissions는 기존 다음 configuration에 포함된다.

```text
safari.settings
```

---

# 🪪 Platform SSO

Apple은 Platform SSO의 방향을 다음 목표로 설명한다.

- 로그인 경험 단순화
- 높은 보안성
- Phishing resistant authentication
- Shared workflow 지원

macOS 27에서는 이 영역이 크게 확장된다.

---

# 👆 Touch ID를 조직 정책으로 요구

기존에는 Touch ID 사용이 선택 사항이었지만 macOS 27에서는 IT 관리자가 **조직 기기에서 Touch ID를 필수 second factor로 요구**할 수 있다.

적용 시점:

- Login
- Screen unlock
- FileVault unlock

사용자는 조직 credential(password 등)을 입력한 뒤 Touch ID를 사용한다.

이는 일반적인 password-only login보다 phishing-resistant하고 기기 소유 여부를 추가로 확인할 수 있는 인증 구조다.

---

# 🌍 Web-based authentication for Platform SSO

macOS 27은 Platform SSO에 **secure web-based authentication**을 추가한다.

Login window와 screen unlock 화면 안에 OS가 관리하는 secure web view를 제공하고, identity provider는 현대적인 authentication flow를 그대로 구현할 수 있다.

지원 가능한 사례:

- One-time codes
- Multi-factor authentication
- Conditional access
- Push notification workflow
- QR code 기반 passwordless sign-in
- Custom challenge-response
- Organization branding
- Localization
- Accessibility-optimized login flow
- Device state에 따른 conditional prompting

### Secure execution context

Web view는 OS가 제어하는 제한된 환경에서 동작한다.

QR scan의 경우:

1. Scan 시작
2. Camera는 **system process**에서만 동작
3. Web page에는 decoded QR data만 전달
4. Raw camera feed나 image data는 web view에 전달되지 않음

따라서 web login page가 사용자의 주변이나 얼굴을 촬영할 수 없다.

## 적용 범위

Web authentication은:

- Login window
- Screen unlock
- FileVault unlock

에서 사용할 수 있다.

또한 **offline authentication**도 지원해 네트워크가 없는 환경에서도 접근 continuity를 유지할 수 있다.

세션에서 언급된 관련 업체:

- Authentik
- ClassLink
- Identity Automation

이들이 새 web-login/QR 기능을 제품에 지원하기 위해 작업 중이라고 설명한다.

---

# 👥 Authenticated Guest Mode + FileVault

Authenticated Guest Mode는 병원·소매·물류처럼 여러 사용자가 shared Mac을 잠깐 사용하는 환경을 위한 기능이다.

예:

- 간호사/의사가 병실을 이동하며 shared Mac 사용
- 물류 직원이 공용 Mac에서 임시 session 사용

macOS 27에서는 Authenticated Guest user가 **FileVault로 보호된 Mac 자체를 unlock**할 수 있다.

즉:

- Full disk encryption 유지
- Temporary guest workflow 유지
- Guest session과 security/compliance를 동시에 충족

추가 configuration 없이 Authenticated Guest Mode가 설정된 기기에 자동 제공된다.

---

# 🎓 Education

## Shared iPad에 Authenticated Guest Mode

Authenticated Guest Mode가 Shared iPad에도 추가된다.

동작 흐름:

1. iPad가 temporary session으로 부팅
2. Login screen 표시
3. 사용자가 Managed Apple Account로 로그인
4. Native authentication 또는 federated identity provider 사용 가능
5. Single Sign-On 지원
6. Temporary session에 사용자 이름 표시
7. 로그아웃 시 local data와 Managed Apple Account 제거

### Storage 모델

Temporary session은 시스템과 device capacity를 공유하며 **hard quota가 없다**.

Shared iPad의 저장 공간을 더 유연하게 사용할 수 있다.

---

# 🌐 Classroom Guided Browsing

Classroom 앱에 새로운 **guided browsing** 기능이 추가된다.

교사가 학생을:

- 지정한 여러 website/tab에 제한하거나
- 하나의 tab에 고정할 수 있다.

## 교사가 지정할 수 있는 것

- 직접 입력한 website
- 미리 준비한 bookmarks
- Website 내부 navigation 허용 범위
- 외부 website navigation 여부
- Camera access
- Microphone access

학생은 camera와 microphone을 계속 사용할지에 대한 agency를 가진다.

교사는 한 명 또는 여러 학생의 device를 선택한 website로 이동시킬 수 있다.

목적은 classroom에서 웹 기반 수업을 진행하면서도 학생이 다른 사이트나 앱으로 벗어나 집중을 잃는 문제를 줄이는 것이다.

---

# 🔄 기능별 운영 흐름 요약

## New Mac onboarding

```text
Device enrollment
    ↓
Managed Migration configuration
    ↓
Allowed accounts/files/security/privacy settings
    ↓
Migration Assistant
    ↓
Declarative status updates
```

## Credential lifecycle

```text
Credential Asset
    ↓
Referenced by multiple configurations
    ↓
Server updates asset once
    ↓
Device updates every dependent configuration
```

## Device health monitoring

```text
Hardware health changes
    ↓
Declarative status item
    ↓
MDM service
    ↓
IT dashboard / proactive support
```

## Privacy consent

```text
Declarative app.settings / safari.settings
    ↓
App or website first use
    ↓
Consolidated privacy consent
    ├─ Allow → recommended defaults applied
    └─ Not Now → normal per-access prompts
```

## Platform SSO web auth

```text
Login / unlock / FileVault
    ↓
System-managed secure web view
    ↓
Identity provider authentication
    ├─ OTP / MFA
    ├─ Push / Conditional access
    ├─ QR code
    └─ Custom challenge-response
```

---

# 📋 MDM / Enterprise 개발 체크리스트

## Apple Business / Services

- [ ] 새 Apple Business APIs 검토
- [ ] Blueprint/Configuration 자동화 필요 여부 확인
- [ ] Users/Groups provisioning 연동
- [ ] App license API 지원
- [ ] Audit event 수집
- [ ] Subscription volume licensing 지원 준비

## Declarative management

- [ ] 기존 imperative profile/command 중심 구조의 declarative 전환 범위 점검
- [ ] Managed Migration configuration 지원
- [ ] Credential을 reusable declarative asset으로 모델링
- [ ] 필요한 declarative status items subscribe
- [ ] Device system health dashboard 연동
- [ ] `TriggerEnhancedLogCollection` 지원
- [ ] Content Caching configuration/status 반영
- [ ] Content Cache HTTPS report endpoint 구축 검토

## App management

- [ ] macOS 27 declarative app configuration 지원
- [ ] ManagedApp framework를 enterprise app에 적용
- [ ] Hardware-bound key 사용 검토
- [ ] Managed Device Attestation 연동
- [ ] Package removal 시 files/directories cleanup 옵션 처리
- [ ] `app.settings` privacy 정책 지원
- [ ] Binary execution allow/deny 정책 모델링
- [ ] Code signing property 기반 rule UI 설계
- [ ] Managed app auto-allow 옵션 제공
- [ ] `safari.settings` website privacy 정책 반영

## Identity / Platform SSO

- [ ] Touch ID required second factor 정책 지원
- [ ] Login / unlock / FileVault 모든 경로 테스트
- [ ] Web-based authentication 구현 가능성 검토
- [ ] QR/passwordless flow 지원
- [ ] Offline authentication 시나리오 검증
- [ ] Conditional access와 device state 연동
- [ ] Authenticated Guest Mode + FileVault 지원 확인

## Education

- [ ] Shared iPad Authenticated Guest Mode 지원
- [ ] Temporary session cleanup 검증
- [ ] Federated authentication / SSO 연동
- [ ] Classroom guided browsing 정책 지원 여부 확인

---

# ⚠️ 구현 시 특히 주의할 점

## Declarative status는 polling 대체 수단

새 status item을 지원하면서도 기존 주기적 inventory polling만 유지하면 declarative model의 장점을 살리지 못한다. 필요한 status item을 명시적으로 subscribe하고 **change-driven architecture**로 전환하는 것이 핵심이다.

## Privacy recommendation ≠ 강제 consent

Consolidated privacy prompt는 관리자가 직접 사용자 동의를 우회하는 기능이 아니다. 사용자가 Allow를 선택하면 권장 default가 적용되고, Not Now를 선택하면 기존처럼 정상적인 consent flow가 계속된다.

## Binary control은 signing identity 중심

파일 경로나 이름만으로 차단 정책을 만드는 방식보다 code signing property를 기반으로 실제 binary identity를 검증하는 것이 새로운 모델의 핵심이다.

## Platform SSO web view에 camera feed는 노출되지 않음

QR auth에서 web content가 받는 것은 **decoded QR result**뿐이다. Raw camera image나 feed는 system process 밖으로 나가지 않는다.

## Shared workflow와 encryption을 동시에 유지

Authenticated Guest Mode와 FileVault 지원 확대는 임시 사용 계정 편의성을 위해 disk encryption을 포기하는 것이 아니라, **full disk encryption과 temporary session을 동시에 유지하는 방향**이다.

---

# 🧠 핵심 메시지

WWDC26의 device management 변화는 개별 기능 추가보다 **관리 모델 자체의 전환**에 가깝다.

- **Declarative management**가 표준이 되고
- credential과 status가 reusable/subscribe-based model로 이동하며
- Mac의 app configuration·binary control·privacy consent가 선언형 정책에 편입되고
- Platform SSO는 Touch ID, secure web authentication, QR, FileVault까지 확장되고
- Shared iPad와 Classroom도 같은 identity/security 원칙을 따른다.

MDM 벤더와 identity provider 입장에서는 단순히 새 payload 몇 개를 추가하는 수준이 아니라, 서버 architecture를 **desired state + assets + subscribed status** 중심으로 재설계하는 것이 장기적으로 중요한 방향이다.

---

# 🔗 함께 보면 좋은 세션과 자료

- [What’s new in managing Apple devices — WWDC26](https://developer.apple.com/videos/play/wwdc2026/206/)
- [Offer subscriptions to groups and organizations — WWDC26](https://developer.apple.com/videos/play/wwdc2026/391/)
- [Secure your apps with App Attest — WWDC26](https://developer.apple.com/videos/play/wwdc2026/201/)
- [What’s new in assessment on macOS — WWDC26](https://developer.apple.com/videos/play/wwdc2026/230/)
- Apple Developer — Device Management documentation
- Apple Open Source GitHub — Device management object schema
