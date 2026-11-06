# WWDC26 — Secure your apps with App Attest

- **Session:** 201
- **Title:** Secure your apps with App Attest
- **Source:** https://developer.apple.com/videos/play/wwdc2026/201/
- **Basis:** Apple Developer 공식 전체 transcript 및 Code 섹션
- **Framework:** DeviceCheck / App Attest
- **Platforms:** Apple 주요 플랫폼, macOS 27+ 포함

---

## 🎯 한 줄 요약

App Attest는 앱이 **정상적인 Apple 기기에서 실행되고 있는지**, 앱의 **identity·launch environment·bundle version이 기대한 값인지**, 그리고 앱이 서버로 보내는 **payload가 변조되지 않았는지**를 서버가 암호학적으로 검증할 수 있게 한다. iOS 27에서는 attestation/assertion의 authenticator data에 **launch validation category**와 **bundle version**이 추가되고, macOS 27에서는 **key access control property(ACL Blob OID)**를 통해 Full Security와 System Integrity Protection(SIP) 조건까지 검증할 수 있다.

---

## 🧭 세션 구성

| 시간 | Chapter |
|---|---|
| 0:00 | Introduction |
| 1:35 | Protections |
| 4:04 | Availability |
| 5:02 | Key generation |
| 6:12 | Attestation |
| 12:10 | Assertion |
| 14:58 | Common pitfalls |
| 16:27 | Fraud metric |
| 19:07 | Next steps |

---

# 🛡️ App Attest가 방어하려는 위협

Apple은 App Attest를 단순한 “탈옥 탐지 API”가 아니라, **변조된 앱 인스턴스가 서버에 정상 요청처럼 보이는 요청을 보내는 문제**를 방어하기 위한 메커니즘으로 설명한다.

세션의 대표적인 위협 시나리오는 다음과 같다.

- 퀴즈/시험 앱을 reverse engineering하고 변조해 **위조된 답안**을 서버로 제출
- 게임 앱에 cheat menu를 삽입해 **조작된 점수**를 서버로 제출
- 앱의 source/resource bundle을 수정한 뒤 다시 서명해 **개발자가 배포하지 않은 기능이나 콘텐츠**를 포함
- 공격자가 앱을 변조하면서 provisioning profile, bundle version, 실행 환경까지 바꾸는 경우

App Attest의 목적은 서버가 이런 요청을 단순히 “정상 앱에서 온 것처럼 보인다”는 이유로 신뢰하지 않게 하는 것이다.

## App Attest가 제공하는 네 가지 핵심 신호

### 1. Genuine Apple hardware

Attestation은 해당 App Attest key가 **정상 Apple 하드웨어에서 생성됐다는 암호학적 증거**를 제공한다.

### 2. App identity

앱은 **relying party identifier**로 식별된다.

```text
Team Identifier + Bundle Identifier
```

공격자가 다른 Team Identifier로 앱을 다시 서명하면 서버는 기대한 relying party identifier와 비교해 차이를 감지할 수 있다.

### 3. Launch environment / bundle version

**iOS 27부터** App Attest는 다음 값을 추가로 노출한다.

- launch validation category
- bundle version

예를 들어 App Store로 배포한 앱인데 attestation이 TestFlight launch validation category를 보여주면, 서버는 이를 예상하지 못한 실행 환경으로 판단할 수 있다.

### 4. Payload integrity

한 번 attested key가 만들어지면 앱은 그 key로 **assertion**을 생성해 서버 payload와 함께 보낼 수 있다. 서버는 assertion을 검증해 payload가 변조되지 않았는지 확인한다.

---

# 🌐 Availability

App Attest는 Apple의 주요 플랫폼에서 사용할 수 있으며, **macOS 27 이상도 새롭게 지원**된다.

다만 “해당 OS에서 지원된다”와 “모든 앱 유형에서 사용할 수 있다”는 의미는 다르다. 모든 extension type이 App Attest를 지원하는 것은 아니다.

Apple은 반드시 `isSupported` API를 통해 런타임에서 지원 여부를 확인하라고 한다.

세션에서 언급한 예:

- Action app extension: 지원
- SSO app extension: 지원
- 기타 일부 app extension: 미지원

## `isSupported`도 risk signal이 될 수 있음

앱이 원래 App Attest를 지원하는 OS/배포 환경에 있는데 특정 사용자에게서 `isSupported == false`가 비정상적으로 반복된다면, 그 자체를 **tampering 가능성을 시사하는 fraud signal**로 활용할 수 있다.

하지만 지원 불가 결과만으로 즉시 사용자를 차단하라는 뜻은 아니다. 앱의 비즈니스 정책과 risk assessment에 포함해야 한다.

---

# 🔑 Key generation

App Attest 통합의 첫 단계는 key 생성이다.

공식 Code 섹션:

```swift
import DeviceCheck

let keyID = try await DCAppAttestService.shared.generateKey()
```

## 내부 흐름

1. 앱이 App Attest에 key ID 생성을 요청
2. App Attest가 앱을 위해 **Secure Enclave-bound key pair** 생성
3. Private key는 Secure Enclave 내부에 유지
4. 앱에는 public key의 hash에 해당하는 key ID가 반환됨
5. 앱은 key ID를 Keychain에 저장

## Key 관리 원칙

Apple이 강조한 규칙:

- Account 기반 앱: 일반적으로 **사용자당 1 key**
- 비계정 앱: 해당 기기의 앱 인스턴스에 대해 **1 key**
- 사용자 전체가 하나의 key를 공유하면 안 됨
- Key ID는 반드시 **Keychain에 저장**
- Key는 device별이며 다른 기기로 sync되지 않음

## Key lifetime

Key ID는 앱 업데이트를 거쳐도 유지되지만 다음 상황에서는 invalidation될 수 있다.

- 앱 재설치
- 기기 restore
- iCloud backup에서 restore

즉, 서버는 “한 사용자에게 항상 하나의 영구 key만 존재한다”고 가정해서는 안 된다.

---

# 🧾 Attestation

Attestation은 key가 genuine Apple hardware에서 생성됐는지, 그리고 attestation 시점의 앱/환경 상태가 기대한 값인지 서버가 검증하게 한다.

공식 Code 섹션:

```swift
import DeviceCheck

let keyId: String = ...
let clientDataHash: Data = ...
let attestation = try await DCAppAttestService.shared.attestKey(
    keyId: keyId,
    clientDataHash: clientDataHash
)
```

`...`는 Apple 공식 예제의 생략 표기다.

## Attestation 전체 흐름

1. 앱이 Keychain에서 key ID를 읽음
2. 앱이 서버에 attestation 시작 요청
3. 서버가 **challenge**를 발급
4. 앱이 key ID + challenge를 포함해 App Attest attestation API 호출
5. App Attest가 Secure Enclave에서 key와 기기 attestation data를 가져옴
6. 이 데이터는 기기 boot 시점의 hardware properties에 기반하며 임의로 변경할 수 없음
7. Apple service가 device data를 검증
8. App Attest가 attestation object를 앱에 반환
9. 앱이 attestation을 서버에 전송
10. **서버가 attestation을 검증**
11. 서버가 attestation과 user를 연관해 저장

## Attestation은 서버가 시작해야 함

Apple은 **서버가 attestation initiation을 제어**해야 한다고 강조한다.

이유:

- App Attest attestation service에는 전역 rate limit이 존재
- 앱이 자체적으로 재시도 횟수/주기를 결정하면 traffic spike를 제어하기 어려움
- 공격자도 앱 내부 retry logic을 이용할 수 있음

권장 패턴:

- 서버가 언제 attestation을 수행할지 결정
- 실패하면 나중에 다시 시도
- exponential backoff 사용
- 앱 내부에 공격적으로 hard-coded retry loop를 두지 않기

## 사용자 흐름 밖에서 수행

Attestation은 가능한 한 로그인 버튼을 누른 직후처럼 사용자 흐름을 직접 막는 위치보다 **background task 등 비동기적인 흐름**에서 수집하는 것이 권장된다.

그리고 검증은 반드시 **서버에서** 한다.

> 앱이 이미 공격자에게 변조된 상태라면 앱 내부 검증 결과는 신뢰할 수 없다.

---

# 🧱 Attestation object 구조

Attestation은 크게 세 부분으로 구성된다.

1. **format**
2. **attestation statement**
3. **authenticator data**

## Format

Apple anonymized attestation임을 나타내는 고정 문자열이다.

## Attestation statement

다음 요소를 포함한다.

- cryptographic certificate chain
- receipt

### Certificate chain

Certificate chain은 key가 genuine Apple hardware에서 생성되었음을 증명한다.

서버는 Developer Documentation의 검증 절차를 따라 leaf certificate 안의 다음 값을 검증한다.

- nonce
- key ID
- relying party identifier

---

# 🖥️ macOS 27: Key access control property / ACL Blob OID

macOS 27 이상에서는 leaf certificate에 **key access control property**, 즉 **ACL Blob OID**가 포함된다.

이 값은 App Attest key를 생성/사용할 때 Secure Enclave가 강제한 보안 조건을 나타낸다.

App Attest는 macOS에서 생성한 key에 다음 정책을 적용한다.

- **Full Security mode 필요**
- **System Integrity Protection(SIP) 필요**

## Full Security

운영체제의 무결성을 가장 강하게 검증하는 macOS 보안 모드다.

## System Integrity Protection

허가되지 않은 코드 실행과 중요한 system path 수정 등을 방지한다.

두 기능은 일반적인 Mac에서 기본 활성화되어 있다.

서버가 key access control property를 검증하면 **attestation 시점에 Secure Enclave가 어떤 보안 조건을 실제로 적용했는지** 확인할 수 있다.

## 공격 예시

세션의 macOS 공격 시나리오:

1. 공격자가 SIP 비활성화
2. 앱 수정
3. 다른 provisioning profile로 재서명
4. system path의 App Attest 관련 framework까지 변조

이 경우 서버가 받은 attestation에는 다음 이상 신호가 나타날 수 있다.

- SIP 비활성 상태가 key access control property에 드러남
- 예상과 다른 Team Identifier
- 예상과 다른 launch validation category
- 예상과 다른 bundle version

서버는 이 신호들을 종합해 변조된 앱과의 통신을 거부하거나 사용자 risk score에 반영할 수 있다.

---

# 🧾 Attestation receipt

Attestation statement에는 App Store receipt와 유사한 형식의 receipt가 포함된다.

서버는 receipt에서 다음을 검증해야 한다.

- relying party ID
- attested key
- 서버 challenge

이 receipt는 이후 **fraud metric 조회**에도 사용되므로 서버가 저장해야 한다.

---

# 🧩 Authenticator data

Authenticator data는 앱 및 attestation과 관련된 정보를 담는다.

서버는 Developer Documentation에 따라 구조를 unpack하고 각 필드를 검증해야 한다.

## iOS 27: authenticator data extensions

**iOS 27 이상**에서 authenticator data 끝에 새로운 **extensions** 구조가 추가된다.

Web Authentication 표준의 authenticator model 형식을 따른다.

새 extension identifiers:

- **launch validation category**
- **bundle version**

### Launch validation category

앱이 예상한 distribution/launch 환경에서 실행 중인지 판단할 수 있는 신호다.

예:

- App Store 배포 앱인데 TestFlight category 관측

### Bundle version

서버가 실제 실행 중인 앱 version이 개발자가 배포한 버전인지 검증하는 데 사용한다.

Apple은 이 값을 개별적인 pass/fail 하나로만 사용하기보다:

- expected values를 모니터링하고
- unexpected values를 식별하고
- 최종 risk assessment의 일부로 사용

하라고 권장한다.

---

# ✍️ Assertion

Attestation이 “이 key와 앱 인스턴스가 신뢰 가능한가?”를 확인하는 단계라면 assertion은 **실제 서버 요청 payload를 보호**하는 단계다.

공식 Code 섹션:

```swift
import DeviceCheck

let keyId: String = ...
let clientDataHash: Data = ...
let assertion = try await DCAppAttestService.shared.generateAssertion(
    keyId: String,
    clientDataHash: Data
)
```

공식 transcript의 코드 표기에는 parameter 위치가 축약되어 있으므로 실제 구현에서는 SDK signature에 맞춰 작성해야 한다.

## Assertion 흐름

1. 앱이 서버에 보낼 data 준비
2. 서버가 challenge를 발급
3. 앱이 key ID + challenge를 사용해 assertion 생성
4. App Attest가 encoded assertion object 반환
5. 앱이 assertion을 payload에 포함
6. 앱 → 서버 전송
7. 서버가 assertion 검증
8. 결과에 따라 payload 수락/거부

## Assertion은 Apple server round trip이 없음

Attestation과 달리 assertion은 **기기 내부에서 로컬로 생성**된다.

따라서 필요한 시점에 on-demand로 생성할 수 있다.

하지만 cryptographic operation이므로 CPU 비용이 있다.

- 모든 작은 요청마다 무조건 assertion 생성
- 짧은 시간에 대량 assertion 생성

같은 패턴은 피해야 한다.

---

# 🔢 Assertion counter와 anti-replay

서버는 assertion 안의 **counter**를 반드시 추적해야 한다.

정상적인 경우 동일 key에서 생성되는 assertion counter는 **strictly increasing** 해야 한다.

서버 측 개념:

```text
previousCounter < newCounter
```

반복되거나 감소하는 값이 관찰되면:

- replay attack
- 변조된 앱이 서버가 기록한 최신 상태를 모르는 상황

등을 의심할 수 있다.

이 counter는 App Attest의 anti-replay protection에서 핵심적인 서버 상태다.

## Assertion 구조

Assertion object는 두 부분으로 구성된다.

1. signature
2. authenticator data

서버는 다음 값을 사용해 signature를 검증한다.

- authenticator data
- server challenge
- attestation에서 저장한 public key

**iOS 27 이상**에서는 assertion의 authenticator data에도 attestation과 마찬가지로 extensions가 추가되며 동일 방식으로 처리한다.

---

# ⚠️ Common pitfalls

## 새 key를 무조건 공격으로 간주하지 않기

기존 사용자에게 새 attestation/key가 나타났다고 즉시 거부하면 안 된다.

정상적인 key rotation 원인:

- 앱 재설치
- 기기 restore
- iCloud backup restore

따라서:

- 새 key를 무조건 reject하지 않기
- 새 key가 생성됐다고 이전 key를 즉시 invalidate하지 않기
- 사용자와 관련된 attestation/key 집합 자체를 risk signal로 활용

하는 방향이 권장된다.

## Attestation/assertion 실패 시 graceful degradation

서버가 attestation/assertion을 reject했다고 해서 즉시 계정을 완전히 차단하지 않는 것이 좋다.

Apple 권장 방식:

- App Attest에 연결된 일부 기능만 제한
- 제한된 access 허용
- 더 강한 monitoring 적용
- 비즈니스 상황에 맞는 risk assessment 수행

왜냐하면 정상 사용자도 예상치 못한 복구·기기 상태·키 회전 등으로 false positive를 겪을 수 있기 때문이다.

## 사용자 차단은 종합 risk assessment 이후

App Attest는 강력한 signal이지만, Apple은 반복해서 **App Attest 하나만으로 곧바로 사용자 전체를 차단하는 방식**을 피하라고 한다.

판단 요소는 앱 종류, fraud impact, 사용자 behavior, key history, fraud metric 등 비즈니스별 기준을 종합해야 한다.

---

# 📊 Fraud metric

정상 Apple device라도 공격자에게 이용될 수 있다.

예를 들어 compromised device가 **attestation broker**처럼 동작해 다른 변조된 앱 인스턴스를 대신해 valid attestation을 생성할 수 있다.

이를 식별하기 위한 signal이 **fraud metric**이다.

## Fraud metric의 의미

특정 기기에서 해당 앱과 연관된 **unique attested keys의 최근 30일 approximate count**다.

이 값이 비정상적으로 높으면 하나의 기기가 많은 key를 생성하며 broker 역할을 하고 있을 가능성을 조사할 수 있다.

## 조회 흐름

1. 서버가 사용자 attestation에 저장한 receipt 조회
2. 해당 receipt를 App Attest data server에 POST
3. Data server가 fraud metric이 포함된 새 receipt 반환
4. 서버는 새 receipt를 다음 fetch에 사용

## Fraud metric receipt 구조

App Store receipt와 비슷한 형식이며 다음으로 구성된다.

- signature
- certificate chain
- receipt payload

Receipt payload에는:

- attested key 관련 정보
- fraud metric

이 포함된다.

### 주요 필드

- **risk metric**: fraud metric count
- **not before**: receipt를 다시 refresh할 수 있는 가장 이른 시점
- **expiration time**: receipt가 만료되어 더 이상 refresh할 수 없는 시점

## 주의: 정상적인 key rotation도 count에 포함됨

다음 정상 사용자 행동도 fraud metric을 증가시킬 수 있다.

- 앱 재설치
- device restore
- key regeneration
- re-attestation

따라서 fraud metric 값 자체를 차단 조건으로 사용하면 false positive 위험이 크다.

Apple 권장 방식:

1. 평상시 baseline 관찰
2. 사용자/서비스별 정상 분포 파악
3. 갑작스러운 spike 확인
4. suspicious activity investigation signal로 활용
5. 다른 App Attest/비즈니스 signal과 결합

---

# 🏗️ 권장 서버 아키텍처

세션 내용을 구현 관점에서 정리하면 다음 책임 분리가 중요하다.

## Client

- `isSupported` 확인
- Secure Enclave-bound key 생성
- key ID를 Keychain에 저장
- 서버 challenge를 받아 attestation/assertion 생성
- failure를 graceful하게 처리
- key 재생성 상황에 대비

## Server

- attestation initiation 제어
- challenge 생성 및 one-time validation
- certificate chain 검증
- relying party ID 검증
- nonce/key ID 검증
- macOS ACL Blob / 보안 조건 검증
- iOS 27 extensions 검증
- public key 저장
- attestation receipt 저장
- assertion signature 검증
- assertion counter 추적
- fraud metric 조회 및 baseline 분석
- 최종 risk assessment 수행

## Apple App Attest service

Attestation 단계에서 device/security data를 검증하고 attestation을 발급한다.

Assertion 생성은 Apple server round trip 없이 기기에서 처리된다.

---

# 🔄 전체 요청 흐름

```text
[앱 최초 설치/초기화]
      ↓
generateKey()
      ↓
Secure Enclave key 생성
      ↓
key ID → Keychain 저장
      ↓

[서버가 attestation 요청]
      ↓
server challenge
      ↓
attestKey(...)
      ↓
Apple App Attest service 검증
      ↓
attestation object
      ↓
서버로 전송
      ↓
서버 검증 + public key/receipt 저장
      ↓

[보호할 API request]
      ↓
server challenge
      ↓
generateAssertion(...)
      ↓
assertion + payload 전송
      ↓
서버 signature/counter/extensions 검증
      ↓
risk assessment
      ↓
accept / limited access / reject
```

---

# 🧪 구현 시 테스트해야 할 시나리오

## Key lifecycle

- [ ] 첫 설치 후 key 생성
- [ ] 앱 update 후 key 유지
- [ ] 앱 삭제/재설치 후 key 회전
- [ ] device/iCloud restore 후 새로운 key 처리
- [ ] 동일 사용자의 여러 device에서 각각 다른 key 처리

## Attestation

- [ ] server-issued challenge 검증
- [ ] invalid/replayed challenge 거부
- [ ] Team ID / bundle ID 불일치 감지
- [ ] iOS 27 launch validation category 확인
- [ ] iOS 27 bundle version allowlist 확인
- [ ] macOS 27 ACL Blob OID 검증
- [ ] SIP/Full Security 조건 이상 처리
- [ ] Apple service failure 후 exponential backoff

## Assertion

- [ ] 정상 counter 증가
- [ ] 동일 counter replay 거부
- [ ] 감소한 counter 거부/flag
- [ ] payload 변경 후 signature failure
- [ ] challenge mismatch
- [ ] assertion 생성 빈도 및 CPU 비용 측정

## Risk handling

- [ ] `isSupported == false`를 단일 차단 조건으로 사용하지 않기
- [ ] 새 key를 기존 사용자에서 자동 차단하지 않기
- [ ] reject 시 limited mode / heightened monitoring 검토
- [ ] fraud metric baseline 수집
- [ ] fraud metric spike alerting
- [ ] key rotation이 fraud metric을 높이는 정상 시나리오 테스트

---

# 📋 도입 체크리스트

### 앱 측

- [ ] 최신 SDK로 rebuild
- [ ] App Attest 지원 여부를 `isSupported`로 gate
- [ ] key ID를 Keychain에 저장
- [ ] 사용자 전체에 key 공유 금지
- [ ] 사용자당/기기당 key 정책 정의
- [ ] attestation을 user flow 밖에서 수행
- [ ] failure retry에 exponential backoff 적용
- [ ] assertion은 필요한 요청에 on-demand 생성
- [ ] CPU 비용 때문에 과도한 assertion 생성 피하기

### 서버 측

- [ ] attestation initiation을 서버가 제어
- [ ] server challenge 발급/만료/재사용 방지
- [ ] certificate chain 검증
- [ ] nonce / key ID / relying party ID 검증
- [ ] receipt 검증 및 저장
- [ ] iOS 27 extensions 파싱
- [ ] launch validation category 정책 수립
- [ ] bundle version 정책 수립
- [ ] macOS ACL Blob OID 검증
- [ ] assertion signature 검증
- [ ] assertion counter를 사용자/key별로 저장
- [ ] fraud metric receipt refresh 관리

### 운영/보안 정책

- [ ] 새로운 key를 무조건 공격으로 간주하지 않기
- [ ] App Attest 실패만으로 계정 즉시 차단하지 않기
- [ ] limited access / heightened monitoring 전략 설계
- [ ] fraud metric baseline 구축
- [ ] App Attest 신호를 다른 fraud signal과 결합
- [ ] user suspension/deactivation에 명확한 risk assessment 정책 수립

---

# 🧠 핵심 메시지

App Attest의 핵심은 **앱 내부에서 보안 판정을 내리는 것이 아니라, 서버가 cryptographic evidence를 검증해 요청을 신뢰할지 결정하는 구조**다.

구현을 세 부분으로 나누면 명확하다.

1. **Attestation** — 이 key와 앱 인스턴스가 신뢰 가능한 환경에서 만들어졌는가?
2. **Assertion** — 이 요청 payload가 attested key를 가진 앱에서 생성됐고 replay되지 않았는가?
3. **Fraud metric** — 하나의 기기가 비정상적으로 많은 attestation key를 생성하고 있지 않은가?

그리고 iOS/macOS 27의 새 signal은 이 모델을 더 세밀하게 만든다.

- iOS 27: launch validation category, bundle version
- macOS 27: key access control property / ACL Blob OID, Full Security, SIP

하지만 Apple의 권장 운영 원칙은 동일하다. **App Attest signal 하나만으로 사용자를 즉시 차단하지 말고, 서버 측의 종합적인 risk assessment에 포함하라.**

---

# 🔗 함께 보면 좋은 자료

- [WWDC26 — Secure your apps with App Attest](https://developer.apple.com/videos/play/wwdc2026/201/)
- Apple Developer Documentation — DeviceCheck / App Attest
- W3C — Authenticator Data
- Apple Support — About System Integrity Protection on your Mac
