# WWDC26 Build with the new Apple Foundation Model on Private Cloud Compute 요약

- Session: 319
- Title: Build with the new Apple Foundation Model on Private Cloud Compute
- Source: https://developer.apple.com/videos/play/wwdc2026/319/
- Topic: Apple Intelligence, Foundation Models framework, Private Cloud Compute, Server LLM, Usage Limits

---

## 한 줄 요약

WWDC26의 “Build with the new Apple Foundation Model on Private Cloud Compute” 세션은 **Foundation Models framework에서 Private Cloud Compute 기반 서버 모델을 사용하는 방법**, **온디바이스 모델과 PCC 모델의 차이**, **reasoning level과 context size**, 그리고 **사용량 제한을 앱에서 자연스럽게 처리하는 방법**을 설명한다.

---

## 핵심 요약

이번 세션은 Foundation Models framework가 기존 온디바이스 모델을 넘어, **Private Cloud Compute에서 실행되는 더 강력한 서버 모델**까지 동일한 Swift API로 다룰 수 있게 되었음을 소개한다.

주요 흐름은 다음과 같다.

1. **Private Cloud Compute 개요**
   - Apple 서버에서 실행되는 강력한 LLM 제공
   - 사용자 데이터는 저장되지 않고 요청 처리에만 사용
   - OS와 iCloud에 통합되어 별도 인증, API key, 계정 설정이 필요 없음
   - 개발자에게 token cost가 없음
   - 사용자별 일일 사용량 제한이 있으며 iCloud+로 한도 확장 가능

2. **Foundation Models framework 통합**
   - 기존 on-device model 코드에서 한 줄만 바꾸면 PCC 서버 모델 사용 가능
   - `LanguageModelSession`이 동일한 Swift API 제공
   - `Generable` 기반 structured output과 tool calling이 동일하게 동작
   - Apple Intelligence 지원 기기에서만 사용 가능하므로 availability check 필요

3. **모델 선택 기준**
   - 온디바이스 모델은 offline 동작과 무제한 요청에 적합
   - PCC 모델은 더 큰 context size, 복잡한 reasoning, 큰 입력/출력, 많은 tool call에 적합
   - 모델 선택은 감이 아니라 평가 결과를 기반으로 해야 함

4. **사용량 제한 처리**
   - PCC 요청은 사용자 iCloud 계정 기준으로 집계
   - 한도 초과 또는 한도 근접 상태를 앱 UI에서 지속적으로 표시해야 함
   - alert보다 버튼 비활성화, 안내 label, 한도 관리 버튼 같은 persistent UI가 권장됨
   - Xcode debug option으로 한도 초과/근접 상태를 시뮬레이션할 수 있음

---

# 1. Introduction

세션은 Foundation Models framework를 통해 앱에서 **Private Cloud Compute 기반 서버 LLM**을 사용할 수 있게 된 점을 소개하며 시작한다.

WWDC25에서는 Foundation Models framework를 통해 강력한 온디바이스 LLM을 사용할 수 있게 되었고, WWDC26에서는 이 온디바이스 모델도 더 개선되었다.

주요 개선은 다음과 같다.

- 이미지 입력 지원
- instruction following 개선
- custom tool calling 개선

하지만 더 복잡한 사용 사례에는 더 강력한 모델이 필요하다. 예를 들어 다음과 같은 기능은 서버 모델이 더 적합하다.

- 큰 사용자 입력을 기반으로 추론하는 assistant
- 많은 tool call을 수행하는 기능
- 큰 출력 결과가 필요한 작업
- watchOS에서도 호출 가능한 복잡한 AI 기능

이런 요구를 위해 Apple은 **Private Cloud Compute에서 실행되는 새로운 서버 모델**을 Foundation Models framework에 추가했다.

---

# 2. What is Private Cloud Compute

Private Cloud Compute는 Apple Intelligence의 시스템 기능에서 복잡한 작업을 Apple 서버로 보내 처리할 때 사용하는 기술이다. 이번 세션에서는 이 기능이 앱 개발자에게도 제공된다고 설명한다.

## 핵심 특징

| 항목 | 내용 |
|---|---|
| 실행 위치 | Apple 서버의 Private Cloud Compute |
| 개인정보 보호 | 사용자 데이터는 저장되지 않으며 요청 처리에만 사용 |
| 검증 | 외부 연구자에 의해 독립적으로 검증됨 |
| OS 통합 | OS 및 iCloud와 통합 |
| 인증 | 별도 계정 설정, 인증, API key 필요 없음 |
| 비용 | 개발자 token cost 없음 |
| 사용량 | 사용자별 일일 제한 존재 |
| 한도 확장 | iCloud+를 통해 더 높은 한도 가능 |
| 대상 | Apple Intelligence 지원 기기 필요 |
| 제공 조건 | 다운로드 200만 미만 앱 대상, Developer website에서 신청 가능 |

PCC는 일반적인 서버 모델 API와 달리 앱이 별도 서버 인증이나 API key를 관리하지 않아도 된다. 사용자는 Apple Intelligence를 지원하는 기기만 있으면 된다.

---

# 3. Integrating PCC with Foundation Models

기존 Foundation Models framework를 사용하는 앱은 아주 작은 변경으로 PCC 서버 모델을 사용할 수 있다.

## 온디바이스 모델 사용

```swift
import FoundationModels

let session = LanguageModelSession()
let response = try await session.respond(to: "Summarize this article: \(article)")
```

## PCC 서버 모델 사용

```swift
import FoundationModels

let session = LanguageModelSession(
    model: PrivateCloudComputeLanguageModel()
)
let response = try await session.respond(to: "Summarize this article: \(article)")
```

기존 코드에서 `LanguageModelSession`에 `PrivateCloudComputeLanguageModel()`을 지정하면 더 큰 서버 모델을 사용할 수 있다.

## 동일하게 동작하는 기능

PCC 모델도 Foundation Models framework의 통합 Swift API를 사용하므로 기존 기능이 동일하게 동작한다.

| 기능 | 설명 |
|---|---|
| `LanguageModelSession` | on-device / PCC 모델을 같은 방식으로 사용 |
| `Generable` | structured output 생성 |
| Tools | custom tool calling 지원 |
| Prompt / respond | 기존 prompt 응답 흐름 유지 |
| 모델 전환 | 코드 구조를 크게 바꾸지 않고 모델 교체 가능 |

예를 들어 `Generable`을 사용해 article summary를 구조화된 타입으로 받을 수 있고, 동시에 관련 기사를 찾는 tool을 함께 사용할 수 있다.

```swift
@Generable
struct ArticleSummary {
    let oneLineSummary: String
    let keyPoints: [String]
}

let session = LanguageModelSession(
    model: PrivateCloudComputeLanguageModel(),
    tools: [FindRelatedArticlesTool.self]
)

let response = try await session.respond(
    to: "Summarize this article: \(article)",
    generating: ArticleSummary.self
)
```

---

# 4. Availability 확인

PCC 모델은 온디바이스 모델과 마찬가지로 **Apple Intelligence 지원 기기**에서만 사용할 수 있다.

따라서 Foundation Models 기반 기능을 만들 때는 availability API를 확인하고, 사용할 수 없는 경우 graceful fallback을 제공해야 한다.

```swift
import FoundationModels

struct ArticleSummarizationView: View {
    private var model = PrivateCloudComputeLanguageModel()

    var body: some View {
        if model.isAvailable {
            // Show UI for making request
        } else {
            // Fall back
        }
    }
}
```

Availability를 확인하지 않으면 Apple Intelligence를 지원하지 않는 기기나 사용할 수 없는 환경에서 기능이 실패할 수 있다.

---

# 5. Deciding between on-device and PCC

Foundation Models framework에서 어떤 모델을 사용할지는 기능의 성격에 따라 달라진다.

## On-device model과 PCC model 비교

| 항목 | On-device model | PCC model |
|---|---|---|
| 개인정보 보호 | 지원 | 지원 |
| 실행 위치 | 기기 내부 | Private Cloud Compute |
| 네트워크 | offline 사용 가능 | 인터넷 연결 필요 |
| 요청 제한 | 없음 | 사용자별 일일 제한 |
| Context size | 4K | 32K |
| Reasoning | 미지원 또는 제한적 | 지원 |
| 적합한 작업 | 빠르고 가벼운 로컬 작업 | 큰 입력, 복잡한 추론, 큰 출력, 많은 tool call |

온디바이스 모델은 offline 동작과 무제한 요청이 장점이다. 반면 PCC 모델은 더 큰 context size와 reasoning을 제공하므로 더 복잡한 작업에 적합하다.

---

# 6. Reasoning levels and context size

PCC 모델은 reasoning을 지원한다. 일반적인 LLM 응답은 prompt를 읽고 바로 결과를 생성하지만, reasoning은 응답 전에 별도의 reasoning segment를 생성해 더 깊이 생각하도록 한다.

## Reasoning level

PCC 모델은 세 가지 reasoning level을 제공한다.

| Level | 설명 |
|---|---|
| `.light` | 약간의 추가 context를 수집 |
| `.moderate` | 더 깊은 reasoning 수행 |
| `.deep` | 응답보다 더 긴 reasoning segment가 생성될 수 있음 |

Reasoning level은 `respond` 호출 시 설정할 수 있다.

```swift
let response = try await session.respond(
    to: prompt,
    contextOptions: ContextOptions(reasoningLevel: .light)
)
```

Reasoning segment는 session transcript에 포함된다. 특히 `.deep` reasoning은 시간이 걸릴 수 있으므로 transcript를 observe해 진행 상황을 보여주는 것이 유용하다.

다만 reasoning은 모델이 추가 text를 생성하는 것이므로 token을 사용하며, context size limit에도 포함된다.

## Context size 확인

WWDC26에서는 모델의 context size를 programmatically 확인할 수 있는 API도 추가되었다.

```swift
SystemLanguageModel().contextSize
PrivateCloudComputeLanguageModel().contextSize
```

세션에서 소개된 context size는 다음과 같다.

| Model | Context size |
|---|---|
| SystemLanguageModel on 26.0 | 4096 |
| SystemLanguageModel on 27.0 newer devices | 8192 |
| PrivateCloudComputeLanguageModel | 32768 |

---

# 7. Evaluating and combining models

모델 선택과 reasoning level 선택은 단순한 감각이 아니라 평가 결과를 기반으로 해야 한다.

세션에서는 “vibes”가 아니라 data에 기반해 결정해야 한다고 강조한다. 특히 올해 개선된 온디바이스 모델은 특정 작업에서 예상보다 좋은 결과를 낼 수 있으므로, 모든 작업에 PCC를 기본으로 쓰기보다 실제 feature 품질을 평가해야 한다.

## Evaluations framework

Apple은 Foundation Models 기능을 평가하기 위한 새로운 **Evaluations framework**를 제공한다.

| 항목 | 내용 |
|---|---|
| 목적 | Foundation Models 기반 feature 품질 평가 |
| 통합 | Xcode에 통합 |
| 사용성 | 쉽게 시작 가능 |
| 관련 세션 | Meet the Evaluations framework |

또한 on-device model과 server model을 함께 사용하는 구성도 가능하다. 세션에서는 관련 내용으로 “Build agentic app experiences with Foundation Models” 세션을 참고하라고 안내한다.

---

# 8. Handling usage limits

PCC 모델은 사용자 iCloud 계정 기준으로 요청이 집계되며, 사용자별 일일 제한이 있다. 따라서 앱은 사용자가 한도에 도달했거나 한도에 가까워졌을 때를 잘 처리해야 한다.

## 한도 초과 처리

한도를 초과하면 PCC 요청은 error를 throw한다. 이 error를 단순히 alert나 일반 오류 UI로 보여주는 것은 좋지 않다. 사용자가 취할 수 있는 행동이 명확하지 않기 때문이다.

대신 `quotaUsage`를 확인해 UI 상태를 조정할 수 있다.

```swift
struct ArticleSummarizationView: View {
    private var model = PrivateCloudComputeLanguageModel()

    var body: some View {
        if model.quotaUsage.isLimitReached {
            Text("Usage limit exceeded.")
                .foregroundStyle(Color.red)
        }

        if let suggestion = model.quotaUsage.limitIncreaseSuggestion {
            Button("Show options") {
                suggestion.show()
            }
        }
    }
}
```

## 권장 UI

세션에서 권장하는 방식은 다음과 같다.

| 권장 | 비권장 |
|---|---|
| 버튼 비활성화 | 단순 alert 표시 |
| 버튼 아래 persistent label 표시 | dismiss 가능한 일회성 오류 표시 |
| 한도 관리/업그레이드 option 제공 | actionable하지 않은 에러 메시지 |
| 앱의 기존 UI에 자연스럽게 통합 | 요청 실패 후에만 오류 노출 |

사용량 제한 안내는 사용자가 닫아버릴 수 있는 alert보다, 요청 버튼 주변에 지속적으로 표시되는 UI가 더 적합하다.

## 한도 근접 상태 처리

한도에 도달하기 전, 사용자가 일일 제한에 가까워지는 상태도 감지할 수 있다.

```swift
if case .belowLimit(let info) = model.quotaUsage.status {
    if info.isApproachingLimit {
        Text("Nearing usage limit.")
            .foregroundStyle(Color.orange)
    }
}
```

이 정보를 보여주면 사용자는 남은 요청을 어떤 작업에 사용할지 더 신중하게 결정할 수 있다.

---

# 9. Xcode에서 usage limit 시뮬레이션

Xcode에는 Apple Foundation Models availability를 시뮬레이션하는 debug option이 있다.

Scheme의 Debug Options에서 다음 상태를 테스트할 수 있다.

| Debug option | 목적 |
|---|---|
| Quota Usage Limit Reached | 사용량 한도 초과 상태 테스트 |
| Nearing Usage Limit | 사용량 한도 근접 상태 테스트 |

이를 통해 실제 한도에 도달하지 않아도 앱의 UI와 fallback 동작을 검증할 수 있다.

---

# 10. Next steps

PCC 서버 모델을 앱에서 사용하려면 Developer website에서 신청할 수 있다.

세션에서 함께 참고하라고 안내한 관련 내용은 다음과 같다.

- What’s new in the Foundation Models framework
- Build agentic app experiences with Foundation Models
- Meet the Evaluations framework
- Debug and profile agentic app experiences with Instruments

---

# 개발자 체크리스트

- [ ] PCC 모델 사용 가능 조건 확인
- [ ] 앱이 Apple Intelligence 지원 기기에서만 PCC 기능을 노출하는지 확인
- [ ] `PrivateCloudComputeLanguageModel().isAvailable` 기반 fallback UI 구성
- [ ] on-device model과 PCC model의 역할 분리
- [ ] context size가 필요한 기능에서 `contextSize` API 활용
- [ ] reasoning level을 기능별로 분리해 선택
- [ ] reasoning segment가 길어질 때 transcript 기반 진행 상태 UI 고려
- [ ] reasoning이 context token을 소비한다는 점 반영
- [ ] `Generable` structured output이 PCC에서도 동일하게 동작하는지 검증
- [ ] custom tool calling을 PCC 모델에서 검증
- [ ] Evaluations framework로 모델 선택과 reasoning level 평가
- [ ] 사용량 한도 초과 상태에서 alert 대신 persistent UI 제공
- [ ] 사용량 한도 근접 상태 표시
- [ ] `limitIncreaseSuggestion` 버튼 제공 여부 검토
- [ ] Xcode debug option으로 quota 상태 시뮬레이션

---

# 함께 보면 좋은 후속 세션 후보

- What’s new in the Foundation Models framework
- Build agentic app experiences with Foundation Models
- Meet the Evaluations framework
- Debug and profile agentic app experiences with Instruments
- Build AI-powered scripts with the fm CLI and Python SDK
- Bring an LLM provider to the Foundation Models framework

---

## 정리

이 세션은 Foundation Models framework가 온디바이스 모델 중심에서 **Private Cloud Compute 기반 서버 모델까지 확장되는 흐름**을 보여준다. PCC 모델은 더 큰 context size, reasoning, 복잡한 tool calling, 큰 입력과 출력을 필요로 하는 기능에 적합하며, 기존 Foundation Models 코드와 거의 같은 방식으로 사용할 수 있다.

동시에 PCC는 네트워크 연결과 사용자별 일일 사용량 제한을 가지므로, 앱은 availability check, graceful fallback, quota 상태 표시, 한도 관리 UI를 함께 설계해야 한다. 모델 선택은 단순히 더 큰 모델을 고르는 문제가 아니라, feature 품질과 비용 없는 사용량 제한, offline 여부, context size, reasoning 필요성을 함께 고려하는 결정이다.
