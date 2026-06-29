# WWDC26 Build real-time apps and services with gRPC and Swift 요약

- Session: 265
- Title: Build real-time apps and services with gRPC and Swift
- Source: https://developer.apple.com/videos/play/wwdc2026/265/
- Topic: gRPC, Swift, Swift on Server, Protobuf, SwiftNIO, Swift Concurrency, Streaming RPC

---

## 한 줄 요약

WWDC26 `Build real-time apps and services with gRPC and Swift`는 **Protobuf로 서비스 API를 정의하고, gRPC Swift로 클라이언트와 서버 코드를 생성해, 단순 요청부터 양방향 스트리밍 기반 실시간 경험까지 Swift 앱과 백엔드에서 구현하는 흐름**을 설명한 세션이다.

---

## 핵심 요약

이번 세션은 Swift 앱과 서버가 gRPC로 통신하는 전체 흐름을 단계적으로 보여준다.

1. **gRPC와 Protobuf**
   - gRPC는 원격 함수 호출을 위한 오픈소스 RPC 프레임워크다.
   - 서비스 API는 `.proto` 파일에 함수, 요청 메시지, 응답 메시지 형태로 정의한다.
   - Protobuf는 필드 이름 대신 고유 필드 번호를 사용해 데이터를 binary format으로 직렬화한다.

2. **Xcode에서 gRPC 코드 생성**
   - `grpc-swift-nio-transport`와 `grpc-swift-protobuf` 패키지를 추가한다.
   - `GRPCProtobufGenerator` build tool plugin으로 `.proto` 파일에서 Swift 코드를 생성한다.
   - 앱에서는 messages와 clients만 생성하고, 서버 코드 생성은 끌 수 있다.

3. **gRPC 클라이언트 구성**
   - `withGRPCClient`로 서버에 연결하고, 생성된 service client로 RPC를 호출한다.
   - 뷰가 나타날 때마다 새 client를 만드는 대신, 앱 전역에서 공유되는 client manager를 두어 연결을 재사용한다.
   - 앱이 background로 들어갈 때 client를 graceful shutdown하여 리소스를 정리한다.

4. **Protobuf와 메시지 효율성**
   - SwiftProtobuf는 `.proto` 메시지를 Swift type으로 다룰 수 있게 한다.
   - gRPC는 메시지를 binary representation으로 직렬화한다.
   - 같은 데이터를 JSON으로 보낼 때보다 메시지 크기를 줄일 수 있어 모바일 네트워크와 서비스 간 통신에 유리하다.

5. **Streaming RPC**
   - gRPC는 unary RPC뿐 아니라 client streaming, server streaming, bidirectional streaming을 지원한다.
   - 세션에서는 경주 실시간 위치와 순위를 보여주는 `FollowRace` bidirectional streaming RPC를 구현한다.
   - 클라이언트는 관심 이벤트를 서버에 계속 전달하고, 서버는 그에 맞는 실시간 이벤트를 계속 전송한다.

6. **Swift 서버 구현과 배포**
   - 서버도 Swift로 작성하고, 생성된 service protocol을 구현한다.
   - streaming RPC에서는 request async sequence와 response writer를 사용한다.
   - Swift 서버를 container image로 패키징한 뒤 cloud service에 배포하고, 앱은 배포된 endpoint를 TLS로 호출한다.

---

# 1. Introduction

세션은 동적인 앱 경험이 서버 데이터에 의존하는 경우가 많다는 문제에서 시작한다. 서버 API를 직접 문서만 보고 손으로 구현하면 시간이 오래 걸리고, 문서가 오래되었거나 구현 과정에서 실수가 생기면 예상과 다르게 동작할 수 있다.

이를 해결하는 방법은 서비스 API를 별도의 specification으로 정의하고, 그 specification을 기준으로 필요한 클라이언트/서버 코드를 생성하는 것이다. HTTP 기반 API에서는 OpenAPI가 널리 쓰이고 Swift에서도 좋은 지원이 있다. 이 세션은 그 대안으로 gRPC를 소개한다.

---

# 2. Meet gRPC

gRPC는 remote procedure call을 만들기 위한 프레임워크다. CNCF 프로젝트이며, 널리 채택된 업계 표준으로 소개된다.

OpenAPI처럼 specification에서 코드를 생성한다는 점은 비슷하지만, gRPC는 API를 HTTP endpoint 중심이 아니라 **입력과 출력을 가진 함수**로 정의한다.

세션의 예시는 `SwiftKart`라는 가상의 고카트 리그 앱이다. 앱은 경주 일정과 상세 정보를 보여주며, 처음에는 예시 데이터로 채워져 있다. 이후 gRPC를 사용해 서버에서 실제 경주 데이터를 받아오도록 바꾼다.

---

# 3. ListRaces RPC 정의

첫 번째 예시는 경주 목록을 가져오는 `ListRaces` RPC다.

`.proto` 파일에는 service와 message가 함께 정의된다.

| 구성 | 설명 |
|---|---|
| `SwiftKartService` | 경주 정보를 제공하는 gRPC service |
| `ListRaces` | 경주 목록을 반환하는 unary RPC |
| `ListRacesRequest` | 요청 메시지 |
| `limit` | 응답에 포함할 최대 경주 수 |
| `ListRacesResponse` | 응답 메시지 |
| `repeated Race` | 여러 개의 경주 정보를 담는 필드 |
| `Race` | 경주 이름, 위치, 시작 시간, 랩 수, 챔피언십 정보를 담는 메시지 |
| `google.protobuf.Timestamp` | Protobuf Well Known Type으로 제공되는 시간 타입 |

각 message field에는 고유 field number가 붙는다. Protobuf 직렬화에서는 이 field number가 중요한 식별자로 사용된다.

---

# 4. Xcode에서 gRPC 코드 생성 설정

세션은 Xcode 프로젝트에 gRPC Swift를 추가하는 과정을 보여준다.

## 필요한 패키지

| 패키지 | 역할 |
|---|---|
| `grpc-swift-nio-transport` | SwiftNIO 기반 고성능 HTTP/2 networking transport 제공 |
| `grpc-swift-protobuf` | `.proto` 파일에서 gRPC Swift 코드를 생성하는 build plugin 제공 |
| `SwiftProtobuf` | 생성된 Protobuf message type 사용 |

## Build Tool Plugin

Xcode target의 Build Phases에서 `Run Build Tool Plug-ins`에 `GRPCProtobufGenerator`를 추가한다.

이 plugin은 target directory의 `.proto` 파일을 스캔하고, JSON 설정 파일을 기준으로 Swift 코드를 생성한다.

앱 target에서는 일반적으로 다음처럼 구성한다.

| 생성 항목 | 설정 |
|---|---|
| messages | 생성 |
| clients | 생성 |
| servers | 생성하지 않음 |

서버 target에서는 반대로 server 코드도 생성할 수 있다.

---

# 5. gRPC 클라이언트 호출

앱에서는 다음 모듈을 import한다.

| 모듈 | 역할 |
|---|---|
| `GRPCCore` | 공통 gRPC runtime component |
| `GRPCNIOTransportHTTP2` | HTTP/2 기반 SwiftNIO transport |
| `SwiftProtobuf` | 생성된 Protobuf message type 사용 |

초기 구현에서는 SwiftUI view의 `.task` 안에서 `withGRPCClient`를 사용해 로컬 서버에 연결한다. 이후 생성된 `SwiftKartService.Client`를 만들고 `listRaces` RPC를 호출한다. 서버 응답은 앱의 view model/data model에 맞게 mapping된다.

이 방식은 동작하지만, view가 나타날 때마다 새 gRPC client를 만들면 매번 서버 연결을 새로 만들어야 해서 불필요한 latency가 생긴다.

---

# 6. gRPC 클라이언트 생명주기 관리

세션에서는 gRPC client를 앱 전체에서 공유하기 위해 `ClientManager`를 도입한다.

핵심 흐름은 다음과 같다.

| 단계 | 설명 |
|---|---|
| 앱 시작 | `ClientManager` instance 생성 |
| 환경 주입 | SwiftUI environment로 하위 view에 전달 |
| lazy connection | 실제 요청이 필요할 때 client 생성 및 연결 |
| connection reuse | 여러 view에서 같은 client를 재사용 |
| background 전환 | scene이 background로 가면 client disconnect |
| graceful shutdown | client의 연결을 정상적으로 종료 |

이 구조를 사용하면 view마다 새 연결을 만들지 않고, 앱이 active 상태일 때 필요한 연결을 재사용할 수 있다.

---

# 7. Protobuf 메시지 포맷과 binary 효율성

Protobuf는 `.proto` 정의를 바탕으로 Swift type을 생성한다. 개발자는 Swift type에 값을 채우고, 이를 binary format으로 직렬화할 수 있다.

gRPC가 클라이언트와 서버 사이에서 메시지를 보낼 때는 field name이 아니라 field number를 사용한다. 이 방식은 JSON처럼 문자열 key를 반복해서 보내는 방식보다 더 작고 효율적이다.

세션에서는 Protobuf 메시지가 동등한 JSON 메시지보다 대략 절반 정도의 크기라고 설명한다. 메시지 크기를 줄이는 것은 모바일 앱에서 네트워크 전송량을 줄이고, 네트워크 상태가 좋지 않을 때의 성능에도 도움이 된다.

Apple 내부에서도 gRPC Swift는 다양한 영역에서 사용된다.

| 사용 영역 | 설명 |
|---|---|
| Containerization | host OS와 Linux VM 사이의 virtual socket 통신 |
| Private Cloud Compute | 클라우드 기반 Apple Intelligence 인프라 |
| iCloud Keychain / Photos | Apple cloud service |
| SharePlay file sharing | SharePlay 기반 파일 공유 |
| OS build/release systems | Apple 내부 빌드 및 릴리스 인프라 |

---

# 8. Streaming RPC

gRPC의 중요한 특징 중 하나는 streaming RPC를 first-class로 지원한다는 점이다.

## RPC 유형

| 유형 | 요청 | 응답 | 예시 |
|---|---|---|---|
| Unary RPC | 단일 요청 | 단일 응답 | 경주 목록 가져오기 |
| Client streaming RPC | 여러 요청 | 단일 응답 | 여러 고카트가 telemetry를 서버로 전송 |
| Server streaming RPC | 단일 요청 | 여러 응답 | 실시간 텍스트 commentary feed |
| Bidirectional streaming RPC | 여러 요청 | 여러 응답 | 실시간 경주 이벤트 구독 및 업데이트 |

세션에서는 `FollowRace`라는 bidirectional streaming RPC를 추가한다.

---

# 9. FollowRace RPC 설계

`FollowRace`는 클라이언트와 서버가 모두 여러 메시지를 주고받는 bidirectional streaming RPC다.

요청 메시지는 클라이언트가 어떤 경주를 보고 싶은지, 어떤 이벤트를 구독할지를 서버에 알린다. 응답 메시지는 실제 경주 이벤트를 담는다.

## 요청 메시지

| 필드 | 설명 |
|---|---|
| `race_name` | 팔로우할 경주 이름 |
| `event_types` | 구독할 이벤트 유형 목록 |

## 이벤트 유형

| 이벤트 | 설명 |
|---|---|
| `KART_LOCATIONS` | 각 고카트의 실시간 위치 |
| `STANDINGS` | 현재 순위 정보 |

## 응답 메시지

`FollowRaceResponse`는 `oneof` field를 사용한다. Swift enum의 associated value처럼, 응답은 여러 유형 중 하나를 담을 수 있다.

| 응답 유형 | 설명 |
|---|---|
| `locations` | 고카트 위치 목록 |
| `standings` | 현재 순위 목록 |

---

# 10. 서버에서 streaming RPC 구현

Swift 서버는 gRPC build plugin이 생성한 service protocol을 구현한다.

기존 `ListRaces` RPC는 async function으로 요청을 받고 응답을 반환하면 된다. 반면 `FollowRace`는 streaming 구조이기 때문에 모양이 다르다.

## streaming 구현 요소

| 요소 | 설명 |
|---|---|
| request parameter | 요청 메시지의 async sequence |
| response parameter | 클라이언트로 응답 메시지를 쓰는 writer |
| task group | 요청 수신과 이벤트 전송을 동시에 처리 |
| async iterator | 첫 번째 요청을 읽어 race name과 초기 구독 이벤트 파악 |
| Mutex | 여러 task가 공유하는 구독 이벤트 set 보호 |
| tracker events | 실시간 race event async sequence |
| response.write | 필터링된 이벤트를 클라이언트에 전송 |
| request stream end | 클라이언트가 더 이상 이벤트를 원하지 않는 signal로 사용 |
| group cancel | request stream 종료 시 이벤트 전송 task 취소 |

이 구조를 통해 서버는 클라이언트가 구독 이벤트를 변경할 때마다 필터를 갱신하고, 현재 관심 있는 이벤트만 계속 전송한다.

---

# 11. 앱에서 bidirectional streaming RPC 호출

앱에서는 `LiveStreamView`가 실시간 지도와 leaderboard를 표시한다.

구현 흐름은 다음과 같다.

1. `ClientManager`를 environment에서 가져온다.
2. 생성된 `SwiftKartService.Client`로 `FollowRace` RPC를 호출한다.
3. RPC의 첫 번째 closure에서 서버로 request message를 계속 보낸다.
4. 두 번째 closure에서 서버 응답 message를 계속 읽는다.
5. `showLeaderboard` 값 변화를 `AsyncStream`으로 추적한다.
6. leaderboard 표시 여부에 따라 `STANDINGS` 이벤트 구독을 request에 포함한다.
7. 서버 응답의 `locations`와 `standings`를 앱 상태에 mapping한다.
8. 지도 annotation과 leaderboard UI를 실시간으로 갱신한다.

이 예시는 Swift concurrency의 `AsyncStream`, async sequence, task 기반 구조가 gRPC streaming과 자연스럽게 연결되는 모습을 보여준다.

---

# 12. 서비스 배포

세션의 마지막 단계는 로컬에서 실행하던 Swift 서버를 클라우드에 배포하는 것이다.

발표에서는 Google Cloud Platform을 사용하지만, AWS나 Fly.io 같은 다른 플랫폼도 유사한 흐름을 따른다고 설명한다.

## 배포 흐름

| 단계 | 설명 |
|---|---|
| Containerfile 작성 | Swift 서버를 container image로 빌드하기 위한 단계 정의 |
| build stage | `swift:latest` image에서 서버를 release mode로 빌드 |
| runtime stage | `swift:slim` runtime image에 실행 파일만 복사 |
| port expose | 서버가 사용할 port 공개 |
| entry point 설정 | container 실행 시 Swift 서버 시작 |
| image registry publish | cloud provider의 container registry에 image 업로드 |
| deployment 생성 | cloud service에 image 배포 |
| HTTP/2 설정 | gRPC 통신을 위해 HTTP/2 사용 |
| client endpoint 수정 | 앱의 target을 배포된 DNS 이름으로 변경 |
| TLS 활성화 | production endpoint에서는 plaintext 대신 TLS 사용 |

multi-stage build를 사용하면 Swift toolchain 전체를 runtime image에 포함하지 않아도 되어 image 크기를 줄일 수 있다.

---

# 13. Next steps

세션은 gRPC Swift가 prototype에서 production으로 이어질 수 있도록 여러 기능과 생태계 통합을 제공한다고 설명한다.

## 확장 포인트

| 항목 | 설명 |
|---|---|
| Swift OTel | observability 연동 |
| Swift service lifecycle | 서버 lifecycle 관리 |
| custom transports | 고급 transport 구성 |
| name resolvers | 서비스 이름 해석 전략 |
| client-side load balancing | 클라이언트 측 부하 분산 |
| tutorials/examples | GitHub repository의 학습 자료 |
| open source contribution | 문서 개선, 질문, 기능 제안 및 구현 참여 |

---

# 주요 코드/설정 흐름 요약

| 단계 | 핵심 작업 |
|---|---|
| 1 | `.proto` 파일에 service와 message 정의 |
| 2 | Xcode에 gRPC Swift 패키지 추가 |
| 3 | `GRPCProtobufGenerator` build plugin 설정 |
| 4 | 앱 target에서는 messages/clients 생성 |
| 5 | 생성된 client로 unary RPC 호출 |
| 6 | client manager로 gRPC connection 재사용 |
| 7 | scene background 전환 시 client disconnect |
| 8 | streaming RPC를 `.proto`에 추가 |
| 9 | 서버에서 async sequence와 response writer로 streaming 구현 |
| 10 | 앱에서 AsyncStream으로 request stream 구성 |
| 11 | response stream을 읽어 UI state 갱신 |
| 12 | Swift 서버를 container image로 패키징 |
| 13 | cloud service에 HTTP/2/TLS 기반으로 배포 |

---

# 개발자 체크 포인트

- `.proto` 파일을 서비스 API의 source of truth로 관리한다.
- Protobuf field number는 compatibility에 중요하므로 신중하게 설계한다.
- 단순 요청/응답에는 unary RPC를 사용한다.
- 실시간 feed, telemetry, live collaboration에는 streaming RPC를 검토한다.
- Xcode build plugin 설정에서 app target과 server target의 생성 범위를 구분한다.
- view마다 client를 새로 만들지 말고, 앱 단위로 connection을 재사용한다.
- 앱 background 전환 시 gRPC client를 graceful shutdown한다.
- streaming RPC에서는 request stream 종료와 task cancellation 흐름을 명확히 처리한다.
- production 환경에서는 TLS를 사용한다.
- cloud 배포 시 HTTP/2 지원 여부를 반드시 확인한다.
- Swift 서버 container image는 multi-stage build로 runtime image 크기를 줄인다.
- prototype 이후 observability, service lifecycle, load balancing, name resolving 같은 production 요소를 검토한다.

---

# 관련 리소스

- About gRPC
- gRPC Swift
- gRPC Swift NIO Transport
- gRPC Swift Protobuf
- gRPC Swift Extras
- Swift on Server

---

# 함께 보면 좋은 후속 세션 후보

- Meet Swift OpenAPI Generator
- Explore the Swift on Server ecosystem
- Meet Containerization
- Swift Concurrency 관련 세션
- Swift on Server 관련 세션

---

# 정리

이 세션은 gRPC Swift를 사용해 Swift 앱과 Swift 서버 사이의 통신을 정의, 생성, 호출, 스트리밍, 배포까지 연결하는 전체 흐름을 보여준다.

핵심은 서비스 API를 `.proto` 파일에 명확히 정의하고, 그 정의에서 클라이언트와 서버 코드를 생성하는 것이다. 이를 통해 수작업 네트워킹 코드와 오래된 문서 의존을 줄일 수 있다.

또한 gRPC의 streaming RPC는 실시간 앱 경험에 적합하다. 세션의 `SwiftKart` 예시처럼 클라이언트가 관심 이벤트를 서버에 전달하고, 서버가 실시간 위치와 순위 데이터를 계속 보내는 구조를 Swift concurrency와 자연스럽게 결합할 수 있다.

마지막으로 Swift 서버를 container image로 패키징하고 cloud service에 배포하는 흐름까지 소개하면서, gRPC Swift가 앱 내부 prototype뿐 아니라 실제 서비스 운영까지 이어질 수 있는 도구임을 보여준다.
