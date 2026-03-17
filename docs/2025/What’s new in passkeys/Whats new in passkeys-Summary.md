# WWDC25 세션 279 — What’s new in passkeys 요약

---

<br>

## ✨ 개요

* 이번 세션은 **passkeys의 2025년 업데이트**를 다룹니다.
* 핵심은 다섯 가지입니다.
  * **새로운 account creation API**
  * **passkey 정보 최신 상태 유지**
  * **automatic passkey upgrades**
  * **passkey management endpoints**
  * **passkey의 안전한 import/export**
* 전체 방향은 명확합니다. Apple은 비밀번호 기반 계정을 점진적으로 줄이고, **처음 가입부터 비밀번호 없는 인증 경험**으로 이동할 수 있도록 흐름을 더 매끄럽게 만들었습니다.

<br>

## 🛤️ Passkey Journey

* Apple은 passkeys를 단순한 로그인 수단이 아니라, **비밀번호를 완전히 대체해 가는 여정**으로 설명합니다.
* 과거에는 대부분의 계정이 비밀번호나 SMS·이메일 코드처럼 **phishable factor** 에 의존했습니다.
* 지금은 여기에 passkey가 추가되는 단계로 이동했고, 최종 목표는 **phishable factor가 전혀 없는 계정 상태**입니다.
* 세션에서는 업계 전반에서 passkey 채택이 빠르게 늘고 있고, 실제 로그인 성공률도 비밀번호보다 훨씬 높다고 설명합니다.
* 이번 OS 업데이트는 이 여정을 더 앞당기기 위해, **생성·업데이트·전환·관리** 전 과정을 강화합니다.

<br>

## 🚀 새로운 Account Creation API

* 가장 큰 변화는 **새 account creation API** 입니다.
* 기존 회원가입은 이메일, 이름, 비밀번호를 여러 단계로 입력해야 했지만, 새 API는 시스템 시트를 통해 **이름 + 연락처 식별자 + passkey 생성**을 한 번에 처리합니다.
* 사용자는 미리 채워진 정보를 확인하고 계속 진행하면 되고, 인증은 Face ID 같은 로컬 인증으로 마무리됩니다.
* 결과적으로 가입은 더 짧아지고, 시작부터 passkey가 생기므로 **처음부터 더 안전한 계정**이 됩니다.
* 이 흐름은 iOS, iPadOS, macOS, visionOS에서 동작하며, Passwords 앱뿐 아니라 **서드파티 credential manager** 와도 연동됩니다.

<br>

## 🧩 Account Creation API 구현 포인트

* 구현은 `ASAuthorizationAccountCreationProvider` 로 시작합니다.
* 핵심 요청에는 다음 정보가 들어갑니다.
  * 허용할 contact identifier 종류
  * 이름 요청 여부
  * relying party
  * 서버에서 받은 single-use challenge
  * 계정의 stable user ID
* 이후 `ASAuthorizationController` 로 요청을 수행하면, 성공 시
  * 선택된 contact identifier
  * 요청했다면 이름
  * 생성된 passkey 객체
    를 받을 수 있습니다.
* 앱은 이 결과를 이용해 서버에 계정을 만들고 바로 로그인 상태로 진입하면 됩니다.

<br>

## ⚠️ Account Creation API 에러 처리

* 세션에서 특히 강조한 예외는 세 가지입니다.
* `deviceNotConfiguredForPasskeyCreation`
  * 기기에 passcode가 없거나 현재 passkey 생성이 불가능한 상태입니다.
  * 이 경우 기존 회원가입 폼으로 자연스럽게 fallback 하면 됩니다.
* `canceled`
  * 사용자가 시스템 시트를 닫은 경우입니다.
  * 마찬가지로 일반 회원가입 폼을 보여주면 됩니다.
* `preferSignInWithApple`
  * 사용자가 이미 **Sign in with Apple 계정**을 갖고 있는 경우 발생할 수 있습니다.
  * 중복 계정 생성을 막기 위한 흐름이며, 이 에러를 받으면 **Sign in with Apple 로그인 요청**으로 이어주는 것이 권장됩니다.
* 또 하나의 베스트 프랙티스로, 앱 실행 직후 **즉시 사용 가능한 자격 증명만 우선 제안**하는 sign-in 요청을 사용하면, 기존 계정이 있는 사용자를 더 부드럽게 로그인시킬 수 있습니다.

<br>

## 🔄 Passkey 정보를 최신 상태로 유지하기

* 계정 정보는 고정되어 있지 않습니다.
* 이메일이나 사용자 이름이 바뀌기도 하고, 특정 passkey를 철회할 수도 있습니다.
* credential manager가 예전 정보를 계속 들고 있으면, 로그인 시 사용자 혼란이 생기거나 잘못된 passkey가 제시될 수 있습니다.
* 이를 해결하기 위해 Apple은 **Signal API** 성격의 새로운 업데이트 API를 추가했습니다.
* 목적은 앱이나 웹사이트가 계정 변경 사실을 credential manager에 알려, **표시 정보와 실제 서버 상태를 맞추는 것**입니다.

<br>

## ✍️ 사용자 이름 변경과 Passkey 철회 신호

* 앱에서는 `ASCredentialUpdater` 를 통해 특정 변경을 보고할 수 있습니다.
* 사용자 이름이나 이메일처럼 계정 표시 이름이 바뀌면, `reportPublicKeyCredentialUpdate` 로 credential manager에 알릴 수 있습니다.
* 웹에서는 같은 목적을 위해 WebAuthn의 `signalCurrentUserDetails` 를 사용합니다.
* 특정 passkey가 철회된 경우에는 `reportAllAcceptedPublicKeyCredentials` 를 사용해 **현재도 유효한 credential ID 집합**을 전달합니다.
* 그러면 credential manager는 그 목록에 없는 passkey를 제거해, 더 이상 잘못된 passkey를 로그인 후보로 보여주지 않게 됩니다.
* 이 호출은 일회성 정리뿐 아니라 **주기적인 health check** 성격으로도 활용할 수 있습니다.

<br>

## 🔐 비밀번호 없는 계정으로의 최종 전환

* Apple은 가장 안전한 계정을 **비밀번호가 완전히 없는 계정**으로 봅니다.
* 새 account creation API로 만든 계정은 애초에 비밀번호가 없기 때문에 처음부터 이상적인 상태에 가깝습니다.
* 기존 비밀번호 기반 계정이 완전히 password-free 상태가 되었다면, `reportUnusedPasswordCredential` API로 이 사실을 credential manager에 알릴 수 있습니다.
* 즉 이제는 단순히 passkey를 추가하는 것을 넘어, **비밀번호가 더 이상 필요 없는 상태**까지 시스템에 반영할 수 있습니다.

<br>

## ⬆️ Automatic Passkey Upgrades

* 기존 비밀번호 계정을 passkey로 옮기는 데 가장 중요한 기능이 **automatic passkey upgrades** 입니다.
* 사용자가 비밀번호로 로그인한 직후, 앱이나 웹사이트가 **추가 UI 없이 조용히 passkey를 생성**할 수 있습니다.
* 사용자는 로그인 직후 “passkey가 생성되었다”는 알림만 받게 되고, 별도의 업셀 화면이나 전환 플로우를 거치지 않아도 됩니다.
* 중요한 점은 이 과정이 **비밀번호를 즉시 없애는 것은 아니라는 점**입니다.
* 우선은 passkey를 안전한 로그인 수단으로 추가하고, 이후 더 나은 인증 경험으로 옮겨가는 발판을 만드는 방식입니다.

<br>

## ⚙️ Automatic Upgrade 구현 방식

* 비밀번호 로그인 후, 해당 계정에 아직 passkey가 없는지 먼저 확인합니다.
* 없다면 일반적인 passkey registration request를 만들고, 여기에 **request style을 conditional** 로 설정합니다.
* 그러면 시스템과 credential manager가 백그라운드에서 다음 조건을 확인합니다.
  * 사용 가능한 credential manager가 있는지
  * 해당 계정의 비밀번호가 방금 사용되었는지
  * 기기가 passkey 생성 가능한 상태인지
* 조건이 모두 맞으면 passkey가 생성되고, 앱은 이를 저장할 수 있습니다.
* 조건이 맞지 않으면 이 호출은 **조용히 실패**하며, 별도 에러 UI를 만들 필요가 없습니다.
* 세션에서는 **비밀번호 로그인 때마다 passkey가 아직 없는 경우 매번 시도**하는 것을 권장합니다.

<br>

## 🔗 Passkey Management Endpoints

* Apple은 credential manager 안에서 passkey 업그레이드를 더 잘 노출하기 위해 **well-known URL 기반의 passkey management endpoints** 를 소개합니다.
* 이를 구현하면 Passwords 앱 같은 credential manager가, 저장된 계정 항목 안에서
  * passkey 추가 페이지
  * passkey 관리 페이지
    로 바로 연결할 수 있습니다.
* 즉 사용자가 앱을 따로 탐색하지 않아도, **credential manager 안에서 바로 passkey 도입 경로를 발견**할 수 있게 됩니다.

<br>

## 🌐 Endpoint 응답 규칙

* 서버는 well-known path에서 JSON 응답을 직접 제공해야 합니다.
* 이 응답은 **redirect 없이 해당 경로에서 바로** 반환되어야 합니다.
* 응답 조건은 다음과 같습니다.
  * HTTP `200 OK`
  * `application/json` content type
* JSON에는 주로 두 URL을 담습니다.
  * `enroll` : passkey를 새로 추가하는 페이지
  * `manage` : 기존 passkey를 관리하거나 revoke/add 하는 페이지
* 두 필드는 optional 이지만, 세션에서는 **둘 다 제공하는 것**을 권장합니다.
* 또한 이 URL은 비로그인 상태로 들어오는 사용자를 처리할 수 있어야 하며, 인증이 필요하면 로그인 후 **원래 요청한 페이지로 다시 돌아오게** 설계해야 합니다.
* 이 endpoint는 브라우저뿐 아니라 credential manager 같은 앱도 호출할 수 있으므로, **모든 user agent에서 접근 가능**해야 합니다.

<br>

## 📦 Passkey Import / Export

* 또 하나의 큰 변화는 **passkey를 credential manager 앱 사이에서 안전하게 이동**할 수 있게 된 점입니다.
* iOS, iPadOS, macOS, visionOS 26에서는 참여하는 credential manager끼리 passkeys를 직접 전송할 수 있습니다.
* 이는 기존의 CSV/JSON 파일 export/import 방식과 다르게,
  * 사용자가 직접 시작하고
  * 앱 간 직접 전송되며
  * Face ID 같은 로컬 인증으로 보호됩니다.
* 디스크에 평문 export 파일을 남기지 않기 때문에, 기존 방식보다 훨씬 안전합니다.
* 이 전송 포맷은 FIDO Alliance와 협력해 만든 schema를 기반으로 하며, passkeys뿐 아니라 passwords, verification codes 등도 포함할 수 있습니다.
* 일반 앱이나 웹사이트는 이 전송을 위해 별도 대응이 필요하지 않고, **credential manager 앱**이 관련 API를 채택하면 됩니다.

<br>

## ✅ 정리

* 이번 passkeys 업데이트는 단순한 로그인 개선이 아니라, **가입부터 비밀번호 제거까지 전체 인증 여정**을 한 단계 더 밀어주는 변화입니다.
* 핵심은 다음과 같습니다.
  * 새 account creation API로 **처음 가입부터 passkey 중심 흐름** 제공
  * Signal API로 **credential manager와 계정 상태 동기화**
  * automatic upgrades로 **기존 비밀번호 계정의 무마찰 passkey 전환**
  * management endpoints로 **credential manager 안에서 업그레이드 경로 노출**
  * import/export로 **credential manager 간 안전한 이동 지원**
* 전체적으로 보면 Apple은 passkeys를 “선택 기능”이 아니라, **passwordless future로 가는 기본 경로**로 더 강하게 밀고 있습니다.
