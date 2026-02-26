# 🌐 Modern Networking with Swift Structured Concurrency

------------------------------------------------------------------------

## ✨ 개요

iOS / macOS 26에서 Network framework가 Swift의 Structured Concurrency와
완전히 통합되었습니다.

이제 네트워킹은:

-   더 이상 소켓 기반 저수준 코드가 아니라
-   SwiftUI처럼 선언형(declarative) 스타일
-   async/await 기반
-   자동 취소 & 상태 관리 내장

> 네트워크 코드가 이제 Swift 코드와 자연스럽게 어우러집니다.

------------------------------------------------------------------------

# 🧱 핵심 구성 요소 3가지

## 1️⃣ NetworkConnection

→ 서버/디바이스와 연결

## 2️⃣ NetworkListener

→ 들어오는 연결 수신

## 3️⃣ NetworkBrowser

→ 네트워크에서 디바이스 검색

------------------------------------------------------------------------

# 🔌 NetworkConnection

## 🎯 연결 구성 3요소

1.  Endpoint → 어디로 연결할지\
2.  Protocol Stack → 어떻게 연결할지\
3.  Parameters → 연결 조건

``` swift
let connection = NetworkConnection(
    to: endpoint,
    using: .tls
)
```

-   TCP / IP 자동 추론
-   TLS 기본 내장
-   Connect by Name
-   Happy Eyeballs (IPv4/IPv6 자동 최적 선택)
-   QUIC 지원
-   프록시 / 인터페이스 전환 자동 처리

------------------------------------------------------------------------

## 📶 네트워크 상태 머신

-   preparing
-   ready
-   waiting
-   failed
-   cancelled

중요한 점:

> send / receive 호출 시 자동으로 ready 상태까지 대기합니다.

UI 업데이트가 필요하면 state handler 등록 가능.

------------------------------------------------------------------------

# 📤 Send / 📥 Receive

## 기본 (Stream 기반: TCP / TLS)

``` swift
try await connection.send(data)
let data = try await connection.receive(exactly: 1024)
```

-   Byte Stream
-   메시지 경계 보장 안 됨
-   framing 필요

------------------------------------------------------------------------

# 🧩 TLV Framing (iOS 26 신규)

Type-Length-Value 구조로 메시지 단위 전송 가능

## 문제점 (Stream 프로토콜)

-   3번 send → 1번에 합쳐져서 올 수도 있음
-   메시지 경계 사라짐

## TLV 해결

-   보낸 메시지 = 받은 메시지
-   길이 자동 관리

``` swift
protocolStack.add(TLV())
```

receive 시 길이 지정 불필요

------------------------------------------------------------------------

# 🧠 Codable 직접 전송 (iOS 26 신규)

더 이상 JSONEncoder / Decoder 직접 호출할 필요 없음.

## Coder 프로토콜

``` swift
protocolStack.add(Coder<GameMessage>(format: .json))
```

이제:

``` swift
try await connection.send(gameMessage)
let message = try await connection.receive()
```

→ GameMessage 객체 그대로 수신

> 네트워크 코드 보일러플레이트 제거

------------------------------------------------------------------------

# 🎧 NetworkListener

서버 역할

``` swift
let listener = NetworkListener(using: protocolStack)
await listener.run { connection in
    ...
}
```

-   연결 수신 전용
-   각 연결마다 subtask 자동 생성
-   Structured Concurrency와 자연 통합

------------------------------------------------------------------------

# 🔎 NetworkBrowser

엔드포인트 검색

지원:

-   Wi-Fi Aware (iOS 26 신규)
-   Bonjour

``` swift
let browser = NetworkBrowser(
    for: .wifiAware("TicTacToe")
)
```

-   run 호출 시 endpoint 집합 반환
-   선택 후 .finish → 종료

> 사전 지식 없이 디바이스 발견 가능

------------------------------------------------------------------------

# 📡 Wi-Fi Aware (iOS 26 신규)

-   Cross-platform P2P 기술
-   Nearby device discovery
-   DeviceDiscoveryUI 연동 가능

------------------------------------------------------------------------

# 🧠 어떤 프로토콜을 써야 할까?

  상황              권장
  ----------------- -----------------------
  기존 서버         서버 프로토콜 따름
  자체 앱 간 통신   Coder + TLS 또는 QUIC
  HTTP 사용 중      URLSession 유지
  저수준 제어       Network framework

URLSession은 그대로 사용해도 최신 기능 자동 적용.

------------------------------------------------------------------------

# ⚙️ Swift Concurrency 통합의 의미

-   async/await 기반
-   task 취소 시 연결 자동 취소
-   structured task lifecycle
-   SwiftUI와 동일한 선언형 느낌

> 네트워크 코드가 UI 코드처럼 작성됩니다.

------------------------------------------------------------------------

# 🚀 이 세션의 진짜 핵심

### 과거

-   BSD sockets
-   복잡한 상태 관리
-   블로킹 I/O
-   직접 framing 구현
-   TLS 라이브러리 따로

### 현재 (iOS 26)

-   선언형 프로토콜 스택
-   TLS 기본 내장
-   TLV framing 기본 제공
-   Codable 직접 전송 지원
-   Wi-Fi Aware 검색
-   Swift Concurrency 네이티브

------------------------------------------------------------------------

# 🧠 핵심 정리

1.  NetworkConnection / Listener / Browser 도입
2.  TLV framing 기본 제공
3.  Codable 직접 전송 지원
4.  Swift Structured Concurrency 완전 통합
5.  Wi-Fi Aware 기반 P2P 검색 가능

------------------------------------------------------------------------

## 🔥 한 문장 요약

> iOS 26의 Network framework는 네트워킹을 "선언형 Swift 코드"로
> 재정의합니다.

이제 네트워크는\
저수준 소켓 프로그래밍이 아니라\
Swift 스타일의 구성 가능한 비동기 시스템입니다.
