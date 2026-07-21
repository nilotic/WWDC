# WWDC26 Create web extensions for Safari 요약

- Session: 216
- Title: Create web extensions for Safari
- Source: https://developer.apple.com/videos/play/wwdc2026/216/
- Topic: Safari, Web Extensions, WebExtensions API, Content Blocking, Content Scripts, App Store Connect, Native Messaging
- Chapters: Introduction, Get started, Block content, Modify webpages, Package and distribute, Communicate with your app, Next steps

---

## 한 줄 요약

Safari Web Extension은 HTML, CSS, JavaScript와 표준 WebExtensions API를 이용해 Safari의 탐색 경험을 확장할 수 있으며, Safari 27에서는 Xcode 없이 개발·테스트를 시작하고 App Store Connect로 패키징한 뒤 필요하면 Xcode와 native messaging을 통해 네이티브 앱 기능까지 연결할 수 있다.

---

## 핵심 요약

이번 세션은 Safari Web Extension을 처음부터 만들어 배포하는 전체 흐름을 설명한다.

예제 확장 기능 `Shiny OnTrack`은 사용자가 지정한 방해 사이트를 제한하며 두 가지 모드를 제공한다.

- **Light mode**
  - 사이트 접근은 허용
  - 페이지에 10분 카운트다운 표시

- **Full mode**
  - 대상 사이트 접근 시 즉시 리디렉션
  - 일반 오류 페이지 대신 확장 기능의 커스텀 페이지 표시

핵심 기술은 다음과 같다.

- `manifest.json`
- Action popup / Options page
- Permissions
- `declarativeNetRequest`
- Dynamic rules
- Host permissions
- Registered content scripts
- Storage API
- Background page / Service worker
- App Store Connect의 Safari Web Extension Packager
- TestFlight
- Native messaging

---

# 🌐 Safari Web Extension

Safari Web Extension은 Safari의 웹 탐색 경험을 확장하는 기능이다.

대표적인 사용 사례는 다음과 같다.

- 광고 차단
- 트래커 차단
- 새 탭 페이지 사용자화
- 재생 경험 개선
- 생산성 도구
- 콘텐츠 수정
- 특정 사이트 제한

Safari Web Extension은 HTML, CSS, JavaScript로 구성되며 표준 WebExtensions API를 사용한다.

다른 브라우저용 확장 기능을 Safari로 가져오는 것도 가능하다.

동일한 확장 기능 코드를 Safari의 다음 플랫폼에서 사용할 수 있다.

- iOS
- iPadOS
- macOS
- visionOS

---

# 🧭 세션 예제: Shiny OnTrack

세션에서는 방해되는 사이트를 관리하는 확장 기능을 만든다.

사용자는 Options page에서 다음 작업을 수행한다.

- Light / Full mode 전환
- 사이트를 block list에 추가
- 등록된 사이트 확인

두 모드는 서로 다른 API를 이용한다.

| 모드 | 동작 | 주요 기술 |
|---|---|---|
| Light | 사이트를 허용하고 10분 타이머 표시 | Registered content scripts |
| Full | 사이트를 커스텀 차단 페이지로 리디렉션 | Declarative Net Request |

---

# 📁 기본 프로젝트 구조

초기 개발은 Xcode 없이 시작할 수 있다.

예:

```text
ShinyOnTrack/
├── manifest.json
├── options.html
├── options.js
├── options.css
├── background.html
├── timer.js
├── timer.css
├── images/
│   └── icon.svg
└── utilities/
    ├── rules.js
    ├── scripting.js
    └── storage.js
```

각 파일 이름은 자유롭게 정할 수 있지만 manifest의 올바른 key와 연결되어야 한다.

---

# 🪪 Manifest

모든 Web Extension에는 manifest가 필요하다.

Manifest는 JSON 형식이며 브라우저에 다음 정보를 알려준다.

- 이름
- 설명
- 버전
- 아이콘
- UI 리소스
- Permission
- Background page
- Content scripts
- Host permissions

기본 예시는 다음과 같다.

```json
{
  "manifest_version": 3,
  "name": "Shiny OnTrack",
  "description": "Stay on track while you browse the web",
  "version": 1.0
}
```

Manifest는 확장 기능의 기본 정의와 capability를 설명하는 핵심 파일이다.

---

# 🖼️ Extension Icon

확장 기능 아이콘은 Safari toolbar나 Extensions Settings 등에 표시된다.

세션 예제에서는 SVG를 사용한다.

```json
{
  "icons": {
    "512": "images/icon.svg"
  }
}
```

SVG를 사용하면 Safari가 필요한 크기에 맞게 scaling할 수 있다.

---

# 🧪 Xcode 없이 Safari에서 테스트

macOS Safari에서 개발 중인 extension을 임시로 로드할 수 있다.

기본 흐름은 다음과 같다.

1. Safari Settings 열기
2. Advanced Settings 이동
3. `Show features for web developers` 활성화
4. Unsigned extensions 허용
5. Extension 리소스가 있는 폴더 선택
6. Temporary extension 로드

변경 사항을 적용한 뒤 extension을 reload하면 수정 결과를 확인할 수 있다.

---

# 🖱️ Action Button과 Popup

Safari toolbar의 extension action button을 클릭하면 popup UI를 표시할 수 있다.

```json
{
  "action": {
    "default_popup": "popup.html"
  }
}
```

Popup은 다음처럼 간단한 UI에 적합하다.

- On / Off
- 현재 페이지 액션
- 빠른 설정
- 간단한 상태 표시

---

# ⚙️ Options Page

설정 내용이 많다면 popup보다 Options page가 적합하다.

```json
{
  "options_ui": {
    "page": "options.html"
  }
}
```

Shiny OnTrack에서는 Options page에서 다음 기능을 제공한다.

- Blocking mode 선택
- Block list 관리
- 새 사이트 등록

Options page도 일반 HTML, CSS, JavaScript로 구현한다.

---

# 🛡️ Permissions

Extension이 Safari의 특정 기능에 접근하려면 manifest에서 permission을 선언해야 한다.

예:

- Storage
- Scripting
- Declarative Net Request
- Native Messaging

콘텐츠 차단에는 `declarativeNetRequest` permission을 사용한다.

```json
{
  "permissions": [
    "declarativeNetRequest"
  ]
}
```

---

# 🚫 Declarative Net Request

`declarativeNetRequest` API는 네트워크 요청을 규칙 기반으로 처리한다.

가능한 action의 예:

- Block
- Modify
- Redirect

Rule은 일반적으로 다음 정보를 가진다.

- ID
- Priority
- Action
- Condition

예:

```javascript
{
  id: 1,
  priority: 1,
  action: {
    type: "block"
  },
  condition: {
    urlFilter: "||webkit.org",
    resourceTypes: ["main_frame"]
  }
}
```

---

# 📌 Static Rules와 Dynamic Rules

Rule은 두 방식으로 구성할 수 있다.

## Static Rules

미리 알고 있는 규칙을 extension에 포함한다.

적합한 경우:

- 고정 차단 목록
- 항상 동일한 redirect
- 버전에 포함된 기본 필터

## Dynamic Rules

JavaScript를 사용해 런타임에 추가하거나 제거한다.

적합한 경우:

- 사용자가 사이트를 직접 추가
- 사용자 설정에 따라 규칙 변경
- 실행 중 block list 변경

Shiny OnTrack은 사용자가 대상 사이트를 정하기 때문에 dynamic rules를 사용한다.

---

# 🔢 Dynamic Rule ID

각 dynamic rule에는 고유한 ID가 필요하다.

세션에서는 host 값을 unique integer ID로 변환하는 helper를 사용한다.

사이트가 추가되면 다음 흐름으로 처리한다.

1. Host에서 rule ID 생성
2. Rule 생성
3. `updateDynamicRules` 호출
4. Dynamic rule 추가

Rule ID 충돌을 방지하는 것이 중요하다.

---

# ➡️ Block에서 Redirect로

단순 block은 일반적인 오류 페이지를 보여줄 수 있다.

더 자연스러운 경험을 위해 custom extension page로 redirect할 수 있다.

```javascript
{
  id: ruleID,
  priority: 1,
  action: {
    type: "redirect",
    redirect: {
      extensionPath: "/blocked/index.html"
    }
  },
  condition: {
    urlFilter: host,
    resourceTypes: ["main_frame"]
  }
}
```

커스텀 페이지에서는 다음을 제공할 수 있다.

- 차단 이유
- 남은 시간
- 설정 이동
- 행동 변경 안내

---

# 🔐 Host Permissions

사이트를 단순히 block하는 것과 extension이 해당 사이트에 접근하는 것은 권한 요구가 다르다.

Redirect처럼 host access가 필요한 경우 세션에서는 다음 permission을 사용한다.

- `declarativeNetRequestWithHostAccess`

Host permission은 match pattern으로 범위를 표현한다.

구성 요소:

- Scheme
- Host
- Path

---

# 🔏 Optional Host Permissions

Shiny OnTrack은 어떤 사이트가 등록될지 미리 알 수 없으며, 시작부터 모든 사이트 접근 권한이 필요하지 않다.

그래서 optional host permissions를 사용한다.

사용자가 사이트를 추가할 때만 해당 domain과 subdomain에 대한 권한을 요청한다.

흐름:

1. 사용자 사이트 추가
2. Extension이 권한 요청
3. Safari가 permission alert 표시
4. 사용자가 허용 또는 거부
5. 허용 시 해당 사이트에 access 부여

Safari의 extension permission 모델은 사용자가 자신의 browsing data에 대한 접근 범위를 직접 제어하도록 설계되어 있다.

---

# 📝 Content Scripts

Light mode에서는 사이트를 막지 않고 페이지 자체를 수정한다.

페이지의 DOM을 읽거나 변경하려면 content script를 사용한다.

활용 예:

- UI 삽입
- CSS 적용
- 페이지 콘텐츠 수정
- 사용자 interaction 감지

Shiny OnTrack에서는 페이지에 10분 타이머를 추가한다.

---

# 📜 Static Content Scripts와 Registered Content Scripts

대상 사이트를 미리 알고 있다면 manifest에서 static content script를 정의할 수 있다.

하지만 Shiny OnTrack은 런타임에 사용자가 사이트를 추가한다.

따라서 registered content scripts API를 사용한다.

Registered script는 다음 정보를 포함할 수 있다.

- ID
- JavaScript 파일
- CSS 파일
- Match patterns
- Persistence flag

이를 사용하려면 `scripting` permission이 필요하다.

---

# ⏳ Light Mode의 Timer

사이트가 block list에 추가되면 해당 사이트에 content script를 등록한다.

Light mode에서 사이트에 접속하면 다음 동작이 발생한다.

- 페이지 정상 로드
- Content script 실행
- 10분 timer UI 삽입

Full mode에서는 redirect rule이 페이지 로드 전에 실행되므로 차단 페이지로 이동한다.

---

# 💾 Storage API

초기 구현에서 block list와 mode를 메모리에만 저장하면 extension reload 후 데이터가 사라진다.

이를 해결하기 위해 Storage API를 사용한다.

Safari는 대표적으로 다음 storage area를 제공한다.

## Session Storage

- 임시 데이터
- 세션 동안만 필요한 상태

## Local Storage

- 디스크에 저장
- Extension reload 이후에도 유지해야 하는 상태

Shiny OnTrack은 local storage에 다음을 저장한다.

- Block list
- Blocking mode

---

# 🗄️ Storage Helper

Storage 관련 로직을 별도 utility로 분리할 수 있다.

예:

```text
utilities/
└── storage.js
```

담당 작업:

- Host 저장
- Host 목록 조회
- Mode 저장
- Mode 조회

새 host를 추가하면 storage를 갱신하고, Options page는 저장된 목록을 읽어 UI를 다시 구성한다.

---

# ⚠️ Extension Update와 Registered Script

Registered content script는 Safari restart 이후 유지될 수 있지만 extension update 이후에는 다시 등록해야 할 수 있다.

따라서 update event를 감지하고 저장된 host 목록을 읽어 script를 복원해야 한다.

---

# 🔁 Background Page와 Service Worker

Extension lifecycle을 처리하려면 background page 또는 service worker를 사용할 수 있다.

두 방식은 다음 역할을 할 수 있다.

- Lifecycle event 처리
- Browser event listener 등록
- Extension 내부 메시지 전달

세션에서는 DOM 접근이 가능한 background page를 선택한다.

Extension이 업데이트되면 `onInstalled` event에서 다음 작업을 수행한다.

1. Storage에서 hosts 읽기
2. 필요한 content scripts 재등록

---

# 📦 App Store Connect로 패키징

Safari Web Extension은 containing app 안에 패키징되어 App Store에서 배포된다.

Safari 27에서는 App Store Connect의 Safari Web Extension Packager를 사용할 수 있다.

기본 흐름:

1. Apple Developer Program 가입
2. App Store Connect에서 앱 생성
3. 대상 플랫폼 설정
4. Bundle Identifier 설정
5. Safari Web Extension Packager에서 리소스 업로드
6. Packager가 extension을 containing app에 패키징
7. Build 결과 확인

이 작업은 브라우저에서 진행할 수 있으며 초기 패키징에 Mac이나 Xcode가 필수는 아니다.

---

# 🍎 지원 플랫폼

세션에서는 iOS와 macOS를 선택해 다음 환경을 대상으로 한다.

- iPhone
- iPad
- Mac
- Apple Vision Pro의 compatible app

Web Extension은 공통 HTML, CSS, JavaScript 코드베이스를 사용할 수 있다.

---

# 🧪 TestFlight

패키징된 build는 TestFlight로 beta 배포할 수 있다.

검증 항목 예:

- Permission flow
- Content blocking
- Content script
- Storage persistence
- 다양한 기기
- 실제 사용 피드백

충분히 검증한 후 App Store에 제출한다.

---

# 🚀 App Store 제출

Distribution 단계에서는 다음 정보를 준비한다.

- Extension screenshot
- 기능 설명
- Build 선택
- App Store 메타데이터

준비가 끝나면 review에 제출한다.

기존 다른 브라우저용 확장 기능을 Safari로 가져와 배포할 때도 같은 흐름을 사용할 수 있다.

---

# 🔗 Native Messaging

WebExtensions API만으로 부족한 기능이 있다면 containing app과 연결할 수 있다.

Native messaging은 다음 세 요소를 연결한다.

```text
Web Extension JavaScript
        ↓
Safari Web Extension Handler
        ↓
Native App
```

Native app의 처리 결과는 같은 경로를 거꾸로 돌아와 extension에 전달된다.

---

# 🛠️ Xcode 프로젝트로 확장

Native messaging을 사용하려면 Xcode 프로젝트가 필요하다.

Safari Web Extension Packager command-line tool을 사용하면 기존 extension 리소스를 기반으로 Xcode 프로젝트를 생성할 수 있다.

프로젝트에는 다음이 포함된다.

- Containing app
- Safari Web Extension
- Extension resources
- `SafariWebExtensionHandler`

기존 웹 코드를 유지하면서 필요한 native 기능만 추가한다.

---

# 📡 `nativeMessaging` Permission

Extension에서 native app과 통신하려면 manifest에 `nativeMessaging` permission을 추가한다.

Extension의 background page에서 native app으로 메시지를 전송하고 결과를 받을 수 있다.

---

# 🔐 생체 인증 예제

세션에서는 block list 변경 전에 native app에서 생체 인증을 수행한다.

전체 흐름:

1. 사용자가 사이트 추가
2. Extension이 native app에 `requestBioAuth` 메시지 전송
3. `SafariWebExtensionHandler`가 메시지 수신
4. Native app이 시스템 인증 API 호출
5. Touch ID 등으로 사용자 인증
6. 성공 여부 반환
7. 성공하면 사이트를 block list에 추가

이 방식으로 Web Extension에서 Apple 플랫폼 네이티브 기능을 활용할 수 있다.

---

# 📨 `SafariWebExtensionHandler`

Packager가 생성한 Xcode 프로젝트에는 extension과 native app 사이 메시지를 처리하는 handler 템플릿이 포함된다.

역할 분리는 다음과 같다.

| 구성 | 역할 |
|---|---|
| JavaScript | Browser UI와 extension workflow |
| `SafariWebExtensionHandler` | Extension과 native app 사이 bridge |
| Native app | Apple 플랫폼 API 실행 |

---

# 🏗️ Xcode에서 최종 배포

Native 기능을 추가한 뒤에는 Xcode에서 build와 archive를 생성한다.

기존 App Store Connect Packager에서 build를 이미 만들었다면 새로운 Xcode build number를 더 높게 설정해야 한다.

기본 흐름:

1. Xcode build
2. Safari에서 extension 활성화
3. Native messaging 테스트
4. Archive 생성
5. Organizer에서 배포

---

# 🧩 기능별 API 정리

| 목적 | API / 기능 |
|---|---|
| Extension 정의 | Manifest |
| Toolbar UI | Action / Popup |
| 전체 설정 | Options page |
| 네트워크 요청 제어 | `declarativeNetRequest` |
| Host access 포함 요청 제어 | `declarativeNetRequestWithHostAccess` |
| 런타임 권한 | Optional host permissions |
| 런타임 규칙 | Dynamic rules |
| 페이지 수정 | Content scripts |
| 동적 script 등록 | Registered content scripts |
| 설정 저장 | Storage API |
| Lifecycle | Background page / Service worker |
| 웹 기반 패키징 | Safari Web Extension Packager |
| Beta | TestFlight |
| Native 통신 | Native messaging |
| Extension ↔ App bridge | `SafariWebExtensionHandler` |

---

# 🔁 전체 개발 흐름

| 단계 | 작업 |
|---|---|
| 기본 구성 | 폴더와 manifest 생성 |
| 로컬 테스트 | Safari에 temporary extension 로드 |
| UI | Popup 또는 Options page 구성 |
| Permissions | 필요한 권한 추가 |
| Blocking | Declarative Net Request 적용 |
| Runtime rules | Dynamic rules 구성 |
| Privacy | Host permission을 필요 시점에 요청 |
| Page modification | Content script 적용 |
| Persistence | Storage API로 설정 저장 |
| Lifecycle | Update 후 runtime 상태 복원 |
| Packaging | App Store Connect Packager 사용 |
| Beta | TestFlight |
| Release | App Store 제출 |
| Native extension | Xcode 프로젝트 생성 |
| Messaging | Native messaging 연결 |
| Final distribution | Xcode Archive와 Organizer |

---

# 📋 체크리스트

## 기본 구조

- [ ] Manifest version 확인
- [ ] 이름, 설명, 버전 정의
- [ ] 아이콘 리소스 제공
- [ ] UI 리소스 경로 확인
- [ ] Safari temporary extension으로 테스트

## UI

- [ ] 간단한 기능은 Action popup 검토
- [ ] 복잡한 설정은 Options page 사용
- [ ] Extension reload 후 UI 동작 확인

## Permissions

- [ ] 필요한 permission만 요청
- [ ] Host access 필요 여부 구분
- [ ] 가능하면 optional host permissions 사용
- [ ] Permission 거부 상황 처리

## Content Blocking

- [ ] Static / Dynamic rule 선택
- [ ] Rule ID 충돌 방지
- [ ] Block / Redirect 전략 결정
- [ ] Custom redirect page 검증
- [ ] Domain 및 subdomain matching 확인

## Content Scripts

- [ ] Static / Registered script 선택
- [ ] `scripting` permission 확인
- [ ] Match pattern 검증
- [ ] Persistence 설정
- [ ] Extension update 후 재등록

## Storage

- [ ] 임시·영구 데이터 구분
- [ ] Block list 저장
- [ ] Mode 저장
- [ ] Reload 후 상태 복원 확인

## Lifecycle

- [ ] Background page 또는 service worker 선택
- [ ] Update event 처리
- [ ] 저장된 데이터로 runtime 상태 복원

## 배포

- [ ] App Store Connect 앱 생성
- [ ] Bundle Identifier 설정
- [ ] 대상 플랫폼 확인
- [ ] Safari Web Extension Packager 사용
- [ ] TestFlight 검증
- [ ] Screenshot과 설명 준비
- [ ] Review 제출

## Native Messaging

- [ ] Native 기능 필요성 확인
- [ ] `nativeMessaging` permission 추가
- [ ] 메시지 payload 구조 정의
- [ ] `SafariWebExtensionHandler` 구현
- [ ] Native 작업 성공·실패 처리
- [ ] 인증 취소 상황 처리
- [ ] 기존 build보다 높은 build number 사용

---

# 핵심 메시지

Safari Web Extension은 표준 WebExtensions 기술을 이용해 HTML, CSS, JavaScript만으로 개발을 시작할 수 있다.

Manifest와 permissions를 기반으로 네트워크 요청을 제어하고, content scripts로 웹페이지를 수정하며, storage와 lifecycle 처리를 통해 사용자 설정을 유지할 수 있다.

Safari 27에서는 Xcode 없이도 개발·테스트와 App Store Connect 패키징을 시작할 수 있고, 더 깊은 시스템 통합이 필요한 시점에 Xcode와 native messaging을 추가할 수 있다.

---

# 함께 보면 좋은 자료

- What’s new in WebKit for Safari 27
- W3C WebExtensions Community Group
- MDN Web Docs - Web Extensions API
- Packaging and distributing Safari Web Extensions with App Store Connect
- WebKit.org
