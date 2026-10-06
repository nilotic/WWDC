# WWDC26 Bring an LLM provider to the Foundation Models framework 요약

- Session: 339
- Title: Bring an LLM provider to the Foundation Models framework
- Source: https://developer.apple.com/videos/play/wwdc2026/339/
- Topic: Foundation Models framework, LanguageModel protocol, LLM provider integration, Core AI, Private Cloud Compute, MLX

---

## 한 줄 요약

WWDC26의 “Bring an LLM provider to the Foundation Models framework” 세션은 Foundation Models framework가 Apple의 온디바이스 모델을 넘어 **Private Cloud Compute, Core AI, MLX, 외부 LLM 제공자 모델**까지 같은 Swift API로 다룰 수 있도록 확장되는 구조를 설명한다.

---

## 핵심 요약

이번 세션은 Foundation Models framework에 새로운 언어 모델을 연결하려는 모델 제공자와, 다양한 모델을 앱에서 동일한 방식으로 사용하려는 개발자를 위한 내용이다.

핵심 흐름은 다음과 같다.

1. **Foundation Models framework의 확장**
   - 기존 Apple 온디바이스 모델 외에 Private Cloud Compute, Core AI, MLX, 외부 모델을 지원
   - 모든 모델은 `LanguageModel` protocol을 통해 같은 방식으로 사용
   - Anthropic과 Google도 Swift package 형태로 Claude와 Gemini 모델을 제공할 예정

2. **LLM provider package 구성**
   - Swift Package Manager 기반 배포 권장
   - iOS, macOS, visionOS, watchOS, Linux 지원 고려
   - dependency 크기와 배포 방식 관리

3. **LanguageModel / LanguageModelExecutor protocol 구현**
   - `LanguageModel`은 모델의 capability와 executor configuration을 설명
   - `LanguageModelExecutor`는 실제 모델 실행, prewarm, transcript 변환, streaming response를 담당
   - executor는 configuration을 기준으로 session 내부에서 캐시됨

4. **Transcript와 streaming response 처리**
   - transcript entry를 모델 고유 message 형식으로 변환
   - context option과 generation option을 모델 요청에 반영
   - metadata, usage, text delta 순서로 응답을 streaming
   - KV cache나 persistent state를 활용해 반복 요청 비용 절감

5. **인증과 customization**
   - API key 문자열 직접 전달보다 token provider나 sign-in flow 권장
   - Keychain 저장과 App Attest 기반 device attestation 고려
   - response metadata, custom segment, server-side tools로 모델 고유 기능 확장

---

# 1. Introduction

세션은 Foundation Models framework가 Apple의 온디바이스 언어 모델을 앱에서 사용할 수 있게 해주던 단계에서, 이제 거의 모든 LLM을 같은 framework 위에 연결할 수 있도록 열리는 변화로 시작한다.

새로운 구조에서는 다음 모델 옵션을 같은 `LanguageModelSession` API로 사용할 수 있다.

| 모델 옵션 | 설명 |
|---|---|
| System Language Model | Apple의 온디바이스 Foundation Model |
| Private Cloud Compute | Apple Intelligence 기능에 사용되는 서버 기반 모델 |
| Core AI | 앱에 포함한 커스텀 로컬 모델 실행 |
| MLX | Hugging Face의 MLX Community 모델 활용 |
| External provider models | Claude, Gemini 등 외부 LLM provider 모델 |

온디바이스 System Language Model은 새로 설계되어 instruction following이 향상되었고, prompt에 이미지를 직접 포함할 수 있다. Private Cloud Compute 모델은 reasoning과 32K token context window를 지원하며, Apple의 privacy guarantee를 제공한다.

세션은 이 모든 모델이 같은 `LanguageModel` protocol을 따르기 때문에 앱 개발자는 모델을 교체하더라도 같은 방식으로 session을 만들고 `respond`를 호출할 수 있다고 설명한다.

---

# 2. 모델 선택과 동일한 API

Foundation Models framework의 목표는 모델 선택을 단순화하는 것이다. 앱 개발자는 Apple 온디바이스 모델, Private Cloud Compute 모델, Core AI 모델, MLX 모델 중 하나를 선택하고 같은 방식으로 `LanguageModelSession`에 전달한다.

예시 흐름은 다음과 같다.

```swift
let model = SystemLanguageModel()
let session = LanguageModelSession(model: model)
let response = try await session.respond(to: "...")
```

필요한 모델이 바뀌면 session에 전달하는 model 객체만 교체한다.

| 필요 | 선택 가능한 모델 |
|---|---|
| 온디바이스 처리 | `SystemLanguageModel` |
| 더 큰 추론 성능 | `PrivateCloudComputeLanguageModel` |
| 앱에 포함한 커스텀 모델 | `CoreAILanguageModel` |
| 오픈소스 모델 실험 | `MLXLanguageModel` |

이 방식의 핵심은 모델 제공자가 자신의 모델을 `LanguageModel` protocol에 맞춰 제공하면, 앱 개발자는 Foundation Models framework의 Dynamic Profiles 같은 기능도 동일하게 사용할 수 있다는 점이다.

---

# 3. Packaging

모델 제공자가 Foundation Models framework에 모델을 연결하려면 먼저 Swift package로 모델 integration을 제공하는 것이 권장된다.

## Package 구성 권장 사항

| 항목 | 내용 |
|---|---|
| 배포 방식 | Swift Package Manager 사용 권장 |
| 지원 플랫폼 | iOS, macOS, visionOS, watchOS 지원 고려 |
| 서버 Swift | Foundation Models framework가 open source로 제공될 예정이므로 Linux 지원도 고려 |
| dependency | 앱에 포함되는 byte 수에 영향을 주므로 신중하게 선택 |
| release | git tag를 생성해 release 배포 |
| integration | 개발자는 repo URL을 Xcode에 붙여 넣어 package 추가 가능 |

Swift Package Manager는 중앙 registry에 의존하지 않는 분산 구조이므로, 모델 제공자의 repository URL 자체가 배포 채널이 된다.

---

# 4. Protocol

모델과 Foundation Models framework를 연결하는 핵심은 두 protocol이다.

| Protocol | 역할 |
|---|---|
| `LanguageModel` | 모델이 무엇을 할 수 있는지 설명하고 executor configuration 제공 |
| `LanguageModelExecutor` | 실제 모델 실행, resource 준비, transcript 변환, response streaming 담당 |

## LanguageModel

`LanguageModel`은 모델의 capability를 선언하고, framework가 executor를 만들 때 사용할 configuration을 제공한다.

Capability에는 tool calling, guided generation, reasoning 같은 모델 기능이 포함될 수 있다.

## LanguageModelExecutor

`LanguageModelExecutor`는 실제 작업이 일어나는 곳이다.

주요 역할은 다음과 같다.

- configuration 기반 초기화
- `prewarm`을 통한 사전 준비
- transcript를 모델 고유 message 형식으로 변환
- context option과 generation option 적용
- 모델 inference 실행
- 결과를 Foundation Models transcript event로 streaming

---

# 5. Executor configuration과 lifecycle

Foundation Models framework는 executor를 model 객체 자체가 아니라 **configuration** 기준으로 찾는다.

동작 방식은 다음과 같다.

1. session이 executor store를 가진다.
2. model이 들어오면 framework가 model의 configuration을 확인한다.
3. 같은 configuration을 가진 executor가 있으면 재사용한다.
4. configuration이 다르면 새 executor를 만든다.
5. session이 해제되면 executor store도 함께 해제되고 resource가 정리된다.

이 구조 덕분에 model 객체는 가볍게 만들 수 있고, weights나 connection 같은 무거운 resource는 executor에 보관할 수 있다.

## Prewarm

`prewarm`은 첫 요청 전에 비용이 큰 준비 작업을 미리 수행하기 위한 hook이다.

예시는 다음과 같다.

- model weights load
- network connection open
- runtime resource 준비

다만 `prewarm`은 항상 호출된다는 보장이 없으므로, `respond`에서도 필요한 resource를 안전하게 준비할 수 있어야 한다.

---

# 6. Transcript 변환

`LanguageModelExecutor`는 Foundation Models framework의 transcript entry를 모델이 이해하는 native message 형식으로 변환해야 한다.

Transcript는 지금까지의 대화를 entry sequence로 표현한다.

| Transcript entry | 의미 |
|---|---|
| Instructions | 개발자가 설정한 지시문 |
| Prompt | 사용자의 입력 |
| Tool calls | 모델이 호출한 tool |
| Tool outputs | tool 실행 결과 |
| Response | 모델이 생성한 응답 |
| Reasoning | 모델의 reasoning 관련 내용 |

모델마다 role 체계가 다르기 때문에 executor가 mapping을 결정한다. 예를 들어 instructions, prompt, response를 system, user, assistant role로 변환할 수 있고, tool call이나 reasoning을 assistant role에 포함할 수도 있다.

---

# 7. ContextOptions와 GenerationOptions

각 요청에는 transcript뿐 아니라 개발자가 원하는 응답 방식을 설명하는 option도 함께 들어온다.

| Option | 역할 |
|---|---|
| `ContextOptions` | prompt 구성 방식 제어 |
| `GenerationOptions` | decoder loop 제어 |

`ContextOptions`에는 reasoning level이나 response schema 같은 정보가 포함될 수 있다. `GenerationOptions`에는 sampling strategy, temperature, maximum response length 같은 값이 포함된다.

Executor는 이 option들을 읽어 모델의 native request에 반영해야 한다.

---

# 8. Streaming response

Foundation Models framework의 응답 구현은 기본적으로 streaming 방식이다. One-shot API도 내부적으로는 delta를 모아 결과를 반환한다.

세션은 response streaming의 권장 순서를 설명한다.

| 순서 | 내용 | 목적 |
|---|---|---|
| 1 | metadata update | model ID, request ID 등 logging/debugging 정보 제공 |
| 2 | usage update | prompt token count 등 비용/사용량 정보 제공 |
| 3 | text delta | 생성되는 token을 즉시 streaming |

이 순서를 따르면 개발자는 전체 응답이 끝나기 전에도 요청 비용과 디버깅 정보를 확인할 수 있고, 사용자는 응답이 한 번에 나타나는 대신 단어 단위로 생성되는 경험을 볼 수 있다.

---

# 9. Stateful executor와 KV cache

Executor가 KV cache나 persistent session state를 유지하는 경우, configuration 기반 executor caching을 활용해 반복 요청 비용을 줄일 수 있다.

Executor는 매번 전체 transcript를 받지만, 이전에 처리한 transcript와 새 transcript를 비교해 추가된 entry만 처리할 수 있다.

## 일반적인 흐름

1. 이전 transcript 저장
2. 다음 request에서 새 transcript와 비교
3. 단순히 entry가 append된 경우 기존 state 유지
4. 새 entry만 처리
5. 중간 entry가 삭제/수정된 경우 divergence 지점까지 state invalidate

이 방식은 network churn을 줄이고, 동일한 context를 반복 처리하는 비용을 줄이는 데 도움이 된다.

---

# 10. Error handling

모델이 개발자의 요청을 정확히 수행할 수 없는 경우 executor는 두 가지 선택을 할 수 있다.

1. 가능한 범위에서 근사적으로 처리
2. 정직하게 error를 throw

예를 들어 sampling option을 모델이 직접 지원하지 않지만 temperature로 비슷하게 표현할 수 있다면 근사할 수 있다. 반면 token limit이 너무 작아 required schema를 만족할 수 없다면 error를 던지는 것이 맞다.

Foundation Models framework는 공통 error로 `LanguageModelError`를 제공한다.

| Error | 의미 |
|---|---|
| `contextSizeExceeded` | transcript가 context window를 초과 |
| `rateLimited` | 짧은 시간에 너무 많은 요청 |
| `refusal` | 모델이 응답 거부 |
| `guardrailViolation` | safety guardrail 위반 |
| `unsupportedCapability` | 요청한 기능을 모델이 지원하지 않음 |
| `unsupportedTranscriptContent` | 처리할 수 없는 transcript content |
| `unsupportedGenerationGuide` | 지원하지 않는 generation guide |
| `unsupportedLanguageOrLocale` | 지원하지 않는 언어/locale |
| `timeout` | 응답 생성 전 timeout |

서비스 고유의 실패가 있는 경우 custom error를 정의할 수 있지만, 가능하면 built-in `LanguageModelError`를 우선 사용하는 것이 권장된다.

---

# 11. Authentication

서버 기반 모델 package를 제공할 때 인증 설계는 중요하다. 세션은 API key 문자열을 initializer에 직접 전달하는 방식은 개발자가 안전하지 않은 구현을 선택하도록 만들 수 있다고 설명한다.

권장되는 방향은 다음과 같다.

| 항목 | 권장 방식 |
|---|---|
| 인증 입력 | plain API key string보다 token provider 또는 sign-in flow 제공 |
| token 저장 | Keychain에 안전하게 저장 |
| cloud model 보호 | App Attest 기반 device attestation 고려 |
| tampered build 대응 | device verification, signed payload, fraud signal 활용 |

특히 cloud-based LanguageModel package는 서비스 비용과 abuse risk가 있으므로, App Attest를 통해 정상 앱과 정상 device에서 온 요청인지 확인하는 흐름이 중요하다.

---

# 12. Customization

기본 protocol 구현 이후에는 모델 고유의 기능을 Foundation Models framework 안에서 자연스럽게 노출할 수 있다.

## Response metadata

Response metadata는 응답에 추가 정보를 붙이는 가벼운 방식이다.

예시는 다음과 같다.

- `tokensPerSecond`
- `timeToFirstToken`
- provider-specific model ID
- request ID
- citation 정보

metadata는 dictionary 형태이지만, 개발자가 쉽게 사용할 수 있도록 명확한 key, typed accessor, 문서화를 제공하는 것이 좋다.

## Custom segments

Custom segment는 새로운 modality나 구조화된 데이터를 transcript에 넣고 streaming 결과로 받을 수 있게 하는 확장 지점이다.

가능한 예시는 다음과 같다.

- audio
- video
- image generation result
- web search result
- code execution output
- provider-specific structured content

Custom segment는 `PromptRepresentable`이어야 하므로, 개발자는 text와 함께 prompt에 직접 포함할 수 있다. Executor는 transcript에서 custom segment를 읽고, 응답에서도 custom segment update를 streaming할 수 있다.

---

# 13. Server-side tools

Server-side tool은 모델이 자체적으로 사용하는 기능이다. 예를 들어 web search, code execution, image generation 같은 기능이 여기에 해당한다.

세션은 server-side tool 결과를 앱에 노출하는 세 가지 수준을 설명한다.

| 수준 | 설명 |
|---|---|
| Private grounding | tool은 내부적으로만 사용하고 최종 text만 streaming |
| Metadata-enriched response | text delta에 citation 같은 metadata를 함께 전달 |
| Surfaced tool output | custom segment로 tool의 structured output까지 앱에 전달 |

이 구조를 통해 모델 제공자는 도구의 작업을 얼마나 앱에 드러낼지 선택할 수 있다. 단순한 답변만 보여줄 수도 있고, citation이나 검색 결과 같은 중간 산출물을 함께 제공할 수도 있다.

---

# 14. Privacy considerations

세션 마지막에서는 모델 package를 선택하거나 제공할 때 privacy 특성을 명확히 이해해야 한다고 강조한다.

온디바이스 모델과 클라우드 기반 모델은 privacy 특성이 크게 다르다. 사용자는 어떤 모델이 사용되는지, 데이터가 어디에서 처리되는지 알 권리가 있다.

따라서 모델 제공자와 앱 개발자는 다음을 고려해야 한다.

- 모델이 온디바이스인지 서버 기반인지 명확히 안내
- cloud request에서 어떤 데이터가 전송되는지 이해
- authentication과 credential storage를 안전하게 설계
- App Attest 등으로 서비스 남용을 방지
- response metadata나 custom segment가 privacy-sensitive data를 포함하지 않도록 주의

---

# 15. 함께 보면 좋은 후속 세션 후보

- What’s new in the Foundation Models framework
- Build with the new Apple Foundation Model on Private Cloud Compute
- Build agentic app experiences with the Foundation Models framework
- Build AI-powered scripts with the fm CLI and Python SDK
- Integrate on-device AI models into your app using Core AI
- Secure your apps with App Attest
- Creating Swift Packages

---

# 정리

이 세션은 Foundation Models framework가 단일 Apple 모델 API를 넘어, 다양한 LLM provider와 local model runtime을 담을 수 있는 공통 인터페이스로 확장되는 흐름을 보여준다.

핵심은 모든 모델이 `LanguageModel` protocol을 따르고, 실제 실행은 `LanguageModelExecutor`가 담당한다는 점이다. 모델 제공자는 Swift package로 모델을 배포하고, executor에서 transcript 변환, option 처리, streaming response, resource lifecycle, error handling, authentication, customization을 구현한다.

이 구조가 자리 잡으면 Swift 개발자는 Apple 온디바이스 모델, Private Cloud Compute, Core AI, MLX, Claude, Gemini 같은 모델을 같은 `LanguageModelSession` 흐름 안에서 선택해 사용할 수 있다. Foundation Models framework는 Apple 플랫폼에서 다양한 AI 모델 생태계를 연결하는 공통 계층으로 확장되고 있다.
