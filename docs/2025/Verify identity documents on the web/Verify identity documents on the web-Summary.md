# 🪪 Verify identity documents on the web

------------------------------------------------------------------------

## ✨ 개요

이 세션은 **디지털 신원 증명(Digital Identity Documents)**을 이용해\
웹과 앱에서 **온라인 신원 확인(identity verification)**을 훨씬 간단하고
안전하게 구현하는 방법을 설명합니다.

기존 방식:

-   사용자가 **실물 신분증 사진 업로드**
-   OCR + 이미지 검증
-   위변조 판별

문제:

-   UX 나쁨
-   위조 위험
-   구현 복잡

해결 방법:

👉 **Mobile Documents (mdoc)** + **Digital Credentials API**

이를 통해 **Wallet 또는 문서 제공 앱에서 신원 정보를 직접 제공**할 수
있습니다. fileciteturn20file0

------------------------------------------------------------------------

# 🪪 Digital Identity Documents

Digital Identity Documents는

-   운전면허증
-   정부 발급 신분증

등을 **디지털 형태로 저장**하는 방식입니다.

대표 표준:

-   **ISO 18013‑5**
-   **ISO 18013‑7**
-   **W3C Digital Credentials API**

특징:

-   필요한 정보만 공유 가능 (Selective Disclosure)
-   발급 기관 서명 기반
-   위조 방지
-   플랫폼 간 상호 운용

------------------------------------------------------------------------

# 📱 Apple Wallet 기반 ID

Apple Wallet의 ID는

-   mdoc 기반
-   ISO 표준 준수

현재 사용 사례:

-   미국 공항 TSA
-   Apple Store
-   일부 앱
-   일부 웹 서비스

------------------------------------------------------------------------

# 🌐 Web Identity Verification Flow

웹에서 mdoc 검증 흐름:

1️⃣ 사용자 웹사이트 방문\
2️⃣ 서버가 **mdoc request 생성 및 서명**\
3️⃣ 웹이 **Digital Credentials API 호출**\
4️⃣ OS가 문서 제공 앱 선택 UI 표시\
5️⃣ 사용자가 Face ID 인증\
6️⃣ 암호화된 응답을 웹 서버로 전달

------------------------------------------------------------------------

# 💻 JavaScript Digital Credentials API

웹에서 사용하는 핵심 API:

``` javascript
navigator.credentials.get()
```

요청 시 필요한 설정:

``` javascript
protocol: "org-iso-mdoc"
```

주의:

-   **반드시 사용자 gesture 필요**
-   버튼 클릭 등

------------------------------------------------------------------------

# 🔐 Request 구성

mdoc 요청은 두 파트로 구성됩니다.

### 1️⃣ Device Request

요청할 문서와 필드 정의

예:

-   given name
-   family name
-   age over 21
-   portrait
-   driving privileges

------------------------------------------------------------------------

### 2️⃣ Encryption Information

응답 암호화에 사용

필요 요소:

-   nonce
-   recipient public key
-   recipient private key (서버 보관)

------------------------------------------------------------------------

# 🔏 Request Signing

요청은 반드시 **서명(Signing)** 해야 합니다.

서명 목적:

-   요청 사이트 인증
-   피싱 방지

Wallet 요청 시:

1️⃣ Apple Business Connect 인증서 발급\
2️⃣ signing key 생성\
3️⃣ Session Transcript 생성\
4️⃣ 요청 서명

------------------------------------------------------------------------

# 🔑 Cross‑Platform Verification

Mac 사용 시:

-   Mac Safari → iPhone Wallet 인증

Flow:

1️⃣ Mac에서 Verify 버튼 클릭\
2️⃣ iPhone 알림 표시\
3️⃣ Face ID 인증\
4️⃣ 결과 Mac 브라우저 전달

또는

QR 코드 스캔으로 다른 플랫폼에서도 인증 가능

------------------------------------------------------------------------

# 🔐 보안 구조

Digital Credentials Flow는 여러 보안 계층을 포함합니다.

### 1️⃣ Request Authentication

웹사이트 인증서 기반 요청 서명

------------------------------------------------------------------------

### 2️⃣ Response Encryption

응답은 **End‑to‑End Encryption**

브라우저도 내용 확인 불가

------------------------------------------------------------------------

### 3️⃣ Issuer Authentication

신분증 발급 기관 검증

------------------------------------------------------------------------

### 4️⃣ Device Authentication

문서가 발급된 **기기에서만 사용 가능**

------------------------------------------------------------------------

# 🔓 Response Decryption

응답은 **HPKE (Hybrid Public Key Encryption)** 방식 사용

필요 입력:

-   ciphertext
-   sender public key
-   recipient private key
-   session transcript

결과:

👉 Device Response

------------------------------------------------------------------------

# 📄 Mobile Security Object 검증

응답 데이터에는

**Mobile Security Object**가 포함됩니다.

검증 절차:

1️⃣ Document Signer Certificate 검증\
2️⃣ Issuer Root CA 확인\
3️⃣ Signature 검증\
4️⃣ Element hash 비교

이를 통해:

-   데이터 위변조 방지

------------------------------------------------------------------------

# 📱 Document Provider API

앱이 **디지털 ID 제공자**가 될 수 있습니다.

새로운 프레임워크:

    IdentityDocumentServices

기능:

-   앱에서 ID 제공
-   웹 인증 참여

------------------------------------------------------------------------

# 🧾 Document Registration

앱은 먼저 문서를 등록해야 합니다.

``` swift
IdentityDocumentProviderRegistrationStore
```

등록 정보:

-   mobileDocumentType (예: mDL)
-   trusted certificate authorities
-   document identifier

등록 후:

-   시스템 선택 UI에 표시

------------------------------------------------------------------------

# 🧩 App Extension

문서 제공 앱은

**Identity Document Provider Extension** 추가 필요

기능:

-   인증 UI 표시
-   요청 처리
-   응답 생성

------------------------------------------------------------------------

# 🪪 Authorization UI

Extension UI 구성 요소:

1️⃣ 요청 정보 표시 2️⃣ Accept 버튼 3️⃣ Decline 버튼

Accept 시:

``` swift
context.sendResponse()
```

------------------------------------------------------------------------

# 🔁 Verification Flow (App)

1️⃣ partial request 전달\
2️⃣ 사용자 승인\
3️⃣ raw ISO request 전달\
4️⃣ request signature 검증\
5️⃣ document response 생성\
6️⃣ response encryption\
7️⃣ 웹으로 반환

------------------------------------------------------------------------

# 🧠 핵심 장점

Digital Credentials 기반 인증의 장점

### 1️⃣ UX 개선

사진 업로드 불필요

------------------------------------------------------------------------

### 2️⃣ 보안 강화

-   cryptographic signatures
-   device binding

------------------------------------------------------------------------

### 3️⃣ 개인정보 보호

필요 정보만 공유

------------------------------------------------------------------------

### 4️⃣ Cross‑Platform

-   iPhone
-   iPad
-   Mac
-   다른 브라우저

------------------------------------------------------------------------

# 🚀 구현 시작 방법

### 웹 개발자

1️⃣ Apple Business Connect 등록\
2️⃣ mdoc request 생성\
3️⃣ Digital Credentials API 호출

------------------------------------------------------------------------

### 앱 개발자

1️⃣ Identity Document Provider extension 추가\
2️⃣ document registration 구현

------------------------------------------------------------------------

# 🧠 핵심 정리

이 세션에서 소개된 핵심 기술

1️⃣ **Mobile Documents (mdoc)**\
2️⃣ **ISO 18013 표준**\
3️⃣ **W3C Digital Credentials API**\
4️⃣ **IdentityDocumentServices**\
5️⃣ **Cross‑device identity verification**

------------------------------------------------------------------------

## 🔥 한 문장 요약

Digital Credentials API는

웹과 앱에서 **디지털 신분증 기반 인증을 안전하고 간단하게 구현할 수 있게
해주는 표준 기반 솔루션**입니다.
