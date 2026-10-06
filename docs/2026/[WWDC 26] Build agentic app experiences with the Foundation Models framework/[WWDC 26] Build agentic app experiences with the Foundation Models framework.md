# WWDC26 Build agentic app experiences with the Foundation Models framework 요약

- Session: 242
- Title: Build agentic app experiences with the Foundation Models framework
- Source: https://developer.apple.com/videos/play/wwdc2026/242/
- Topic: Foundation Models framework, Dynamic Profiles, Agentic Workflows, Transcript Management, Tool Calling, Evaluations
- 작성 기준: Apple Developer 공식 transcript 기준

---

## 한 줄 요약

WWDC26 세션 242는 Foundation Models framework의 **Dynamic Profiles**를 중심으로, 하나의 `LanguageModelSession` 안에서 모델·도구·지시문·컨텍스트를 동적으로 전환하며 agentic app experience를 구성하는 방법을 설명한 세션이다.

---

## 핵심 요약

이번 세션은 agentic experience를 만들 때 필요한 세 가지 문제를 중심으로 진행된다.

1. **Context management**
   - 긴 세션에서 transcript를 유지하되, 모델의 context window에 맞게 history를 trim하거나 summarize하는 방법
   - `historyTransform`, `history` session property, lifecycle modifier 활용

2. **Model boundaries**
   - 작업 단계에 따라 on-device model, Private Cloud Compute model, server model을 구분해 사용하는 방법
   - 비용, 성능, 개인정보 보호, 모델 capability에 따라 profile을 나누는 구조

3. **Agentic orchestration**
   - Dynamic Profile로 agent/skill 같은 추상화를 만드는 방식
   - baton-pass, phone-a-friend, tool calling mode, transcript error handling, evaluation 전략

---

# 1. Introduction

세션은 Foundation Models framework에 추가된 **Dynamic Profiles**를 소개하며 시작한다.

Dynamic Profiles는 장시간 이어지는 language model session에서 다음 문제를 해결하기 위한 API다.

| 문제 | 설명 |
|---|---|
| Context management | 긴 transcript를 trim 또는 summarize하여 model context window 안에 유지 |
| Boundaries | 여러 모델을 capability, cost, privacy 기준으로 분리 |
| Flexibility | agent, skill, sub-agent 같은 다양한 agentic architecture를 구성할 수 있는 primitive 제공 |

Apple은 이와 함께 **Foundation Models framework utilities**라는 새로운 open source Swift package도 소개한다. 이 패키지는 agentic experience를 만들 때 필요한 유틸리티 컴포넌트를 제공하며, OS release 사이에도 업데이트되어 emerging/experimental pattern을 더 빠르게 제공하는 역할을 한다.

---

# 2. The example app and agents

세션의 예시는 **Origami**라는 craft app이다.

이 앱은 사용자가 이미지를 업로드하면, 이미지에서 영감을 받아 origami 또는 crochet 프로젝트 아이디어를 제안한다. 사용자가 아이디어를 선택하면 tutorial을 생성하고, 진행 중 사진을 업로드하면 technique에 대한 조언도 받을 수 있다.

앱의 각 단계는 같은 사용자 맥락을 공유하지만, 필요한 모델과 설정은 다르다.

| 단계 | 역할 | 필요한 특성 |
|---|---|---|
| Brainstorming | 사진과 재료를 바탕으로 craft project idea 제안 | 창의성, 넓은 craft 지식 |
| Planning | 선택된 프로젝트의 tutorial 생성 | 깊은 추론, 구조화된 설명 |
| Reviewing | 진행 중 사진을 보고 technique 조언 | 빠른 응답, on-device 처리 가능 |

세션에서는 이러한 각 단계를 **agent**로 설명한다. 각 agent는 앱을 대신해 특정 목표를 수행하며, 고유한 instructions, tools, model configuration을 가진다.

---

# 3. Declaring a dynamic profile

`DynamicProfile`은 하나의 `LanguageModelSession` 안에서 서로 다른 configuration state를 선언하는 API다.

Profile은 다음 요소로 구성된다.

| 구성 요소 | 설명 |
|---|---|
| Instructions | 모델에게 줄 지시문 |
| Tools | 모델이 호출할 수 있는 도구 |
| Model | 사용할 language model |
| Generation options | temperature, sampling mode, reasoning level 등 |
| Modifiers | history transform, lifecycle hook, tool calling mode 등 |

세션의 Origami 예시에서는 `CraftOrchestrator`라는 observable class가 앱의 현재 phase를 추적하고, phase에 따라 profile의 성격이 바뀐다.

중요한 점은 `DynamicProfile`의 body가 모델에 prompt를 보낼 때마다 다시 평가된다는 것이다. 따라서 앱의 mode가 바뀌면 같은 session 안에서도 모델의 persona와 capability가 바뀐다.

---

# 4. Dynamic Instructions

`DynamicInstructions`는 관련 instructions와 tools를 하나의 재사용 가능한 구성 요소로 묶는 API다.

예를 들어 origami와 관련된 지식과 도구가 여러 profile에서 필요하다면, 이를 `OrigamiExpert` 같은 `DynamicInstructions`로 만들 수 있다.

`DynamicInstructions`의 특징은 다음과 같다.

| 특징 | 설명 |
|---|---|
| Reusable | 여러 profile에서 같은 instructions/tools를 재사용 가능 |
| Composable | 다른 `DynamicInstructions` 안에 중첩 가능 |
| Conditional | 앱 상태에 따라 특정 instructions/tools만 포함 가능 |
| Cleaner profile | profile 선언부를 더 읽기 쉽게 정리 |

세션에서는 `BrainstormFacilitator`가 brainstorming profile의 지시문을 담고, origami 프로젝트일 때만 `OrigamiExpert`를 함께 포함하는 방식으로 설명한다.

---

# 5. Configuring models per phase

Dynamic Profiles의 핵심은 단계별로 적합한 모델과 generation option을 선택하는 것이다.

Origami 예시에서는 세 가지 profile이 등장한다.

| Profile | 역할 | 모델 / 설정 |
|---|---|---|
| Brainstorming | craft project idea 생성 | `PrivateCloudComputeLanguageModel`, 높은 temperature |
| Planning | 선택된 프로젝트 tutorial 생성 | `PrivateCloudComputeLanguageModel`, deep reasoning |
| Reviewing | 진행 중 사진 기반 조언 | `SystemLanguageModel` |

Brainstorming은 창의성이 중요하므로 temperature를 높게 설정한다. Planning은 tutorial을 만드는 복잡한 작업이므로 deep reasoning을 사용한다. Reviewing은 불필요한 server call을 줄이기 위해 on-device model을 사용한다.

이 구조는 하나의 기능 안에서도 모델을 고정하지 않고, 작업의 성격에 따라 모델과 비용 구조를 바꾸는 방식을 보여준다.

---

# 6. Transcript management and history transforms

여러 모델을 오갈 때 중요한 문제는 transcript 관리다.

모델마다 context size limit이 다르고, 각 단계에 필요한 정보도 다르다. 따라서 하나의 session transcript를 그대로 모든 모델에 전달하는 것은 비효율적이거나 부적절할 수 있다.

Transcript를 조정하는 이유는 다음과 같다.

| 이유 | 설명 |
|---|---|
| Context size | 작은 context window를 가진 모델에 맞게 history trim |
| Focus | 현재 요청과 무관한 entry 제거 |
| Privacy | 더 낮은 privacy boundary로 이동할 때 private information redaction |
| Cost/latency | 불필요한 context를 줄여 비용과 지연 감소 |

`historyTransform`은 prompt를 보내기 직전에 profile별로 history를 변환하는 기능이다. 이 transform은 session transcript를 영구적으로 변경하지 않고, 해당 prompt에만 적용된다.

세션에서는 reviewing profile에 `historyTransform`을 적용해 tool call entry를 제거하고, on-device model의 context window에 맞게 history를 줄이는 예시를 보여준다.

---

# 7. Custom modifiers

History transform이 복잡해지면 profile 선언부가 읽기 어려워질 수 있다. 이를 해결하기 위해 세션은 `DynamicProfileModifier`를 사용한 custom modifier 패턴을 소개한다.

Custom modifier는 반복되는 profile configuration을 재사용 가능한 형태로 감싸는 방식이다.

| 장점 | 설명 |
|---|---|
| Reuse | 여러 profile에 같은 transform/configuration 적용 |
| Encapsulation | 복잡한 history transform 로직 숨김 |
| Readability | profile declaration을 간결하게 유지 |
| Consistency | 동일한 정책을 여러 agent에 일관되게 적용 |

Foundation Models framework utilities package에도 유용한 modifier들이 포함되어 있으며, 세션은 이를 agentic architecture를 구성하는 기본 재료로 소개한다.

---

# 8. Lifecycle modifiers and session properties

Transcript를 다루는 또 다른 방식은 lifecycle modifier와 session property를 사용하는 것이다.

Lifecycle modifier는 session 진행 중 특정 시점에 imperative code를 실행할 수 있게 한다. 예를 들어 모델 response가 끝난 직후 `onResponse`에서 이전 transcript를 요약하고, 오래된 entry를 줄이는 방식이 가능하다.

세션에서 설명한 주요 요소는 다음과 같다.

| 요소 | 역할 |
|---|---|
| Lifecycle modifiers | response boundary 등 특정 lifecycle event에서 코드 실행 |
| `history` property | session history를 직접 수정할 수 있는 built-in session property |
| Custom session properties | 모든 tools/profiles가 공유할 수 있는 mutable state |
| `@SessionPropertyEntry` | session property 선언용 macro |

`historyTransform`과 `history` property는 차이가 있다.

| 방식 | 특징 |
|---|---|
| `historyTransform` | profile별 local/lossless transform. 원본 transcript는 유지 |
| `history` property | session 전체 history를 직접 변경. lossy하며 모든 profile에 영향 |

세션에서는 summary를 custom session property에 저장하고, 이후 profile instructions에서 이 summary를 참조하도록 구성한다. 이렇게 하면 오래된 transcript entry를 줄이면서도 필요한 맥락은 유지할 수 있다.

---

# 9. Orchestration: baton-pass

세션 후반부는 agent orchestration pattern을 다룬다. 첫 번째 패턴은 **baton-pass**다.

Baton-pass는 여러 profile이 하나의 작업을 이어받아 처리하는 협업 구조다.

필요한 구성은 다음과 같다.

| 구성 | 설명 |
|---|---|
| Multiple profiles | 서로 다른 역할/모델을 가진 profile들 |
| Active profile variable | 현재 어떤 profile이 active인지 나타내는 상태 |
| Handoff tool | 모델이 active profile을 바꿀 수 있는 tool |
| Shared transcript | handoff 전후의 profile이 같은 transcript history를 공유 |

예를 들어 사용자가 brainstorming 단계에서 “종이학 접는 법을 알려줘”라고 요청하면, brainstorming profile은 tutorial profile로 baton을 넘기는 tool을 호출한다. 이후 tutorial profile이 최종 답변을 만든다.

Baton-pass의 핵심 특징은 다음과 같다.

- 전체 transcript history가 양쪽 profile에 모두 보인다.
- baton을 받은 profile이 최종 응답까지 책임진다.
- 하나의 session 안에서 agent 간 handoff가 일어난다.

---

# 10. Orchestration: phone-a-friend and skills

두 번째 패턴은 **phone-a-friend**다.

Phone-a-friend는 parent profile이 필요한 순간 다른 profile을 잠깐 호출해 조언을 얻고, 최종 응답은 parent profile이 계속 담당하는 구조다.

| 항목 | Baton-pass | Phone-a-friend |
|---|---|---|
| 관계 | 협업 / handoff | consultation |
| Transcript | 공유 | parent와 child session이 분리 |
| Child profile 역할 | 최종 응답 가능 | 도구처럼 짧게 호출되어 결과 반환 |
| Final response | baton을 받은 profile | parent profile |

예를 들어 사용자가 “아이들이 할 만한 재미있는 프로젝트를 추천해줘”라고 요청하면, parent model이 프로젝트 제목 생성이 필요하다고 판단하고 title profile을 호출한다. Child session은 독립 transcript로 짧게 실행된 뒤 결과를 tool output으로 parent에게 전달하고 사라진다.

Foundation Models framework utilities package에는 **Skills** 타입도 포함된다. Skills는 절차적으로 context를 load하는 agentic pattern을 구성하는 데 사용할 수 있다.

---

# 11. Tool calling mode

Tool calling mode는 모델이 tool을 언제 호출할 수 있는지를 제어하는 설정이다.

세션에서는 세 가지 mode를 설명한다.

| Mode | 설명 |
|---|---|
| `allowed` | 기본값. 모델이 tool call을 할 수도 있고 직접 응답할 수도 있음 |
| `disallowed` | tool call을 금지 |
| `required` | 모델이 반드시 tool call만 하도록 강제 |

`disallowed`는 특정 앱 상태에서 session의 tool들이 더 이상 관련 없을 때 유용하다.

`required`는 모든 action을 tool call로 표현하는 agentic system에서 유용할 수 있다. 다만 required mode에서는 모델이 사실상 while loop 안에 있는 것과 같으므로, 반드시 exit condition을 설계해야 한다.

세션에서 제안한 exit 방법은 다음과 같다.

| 방법 | 설명 |
|---|---|
| Conditional tool calling mode | 특정 변수 조건에 따라 required mode 해제 |
| Final answer tool | 최종 답변용 tool이 error를 throw하여 tool loop 중단 |

Profile을 사용할 때는 modifier로 tool calling mode를 설정할 수 있고, profile을 사용하지 않을 때는 `respond(to:)` 호출 시 `GenerationOptions`로 설정할 수 있다.

---

# 12. Transcript error handling

기본적으로 tool에서 error를 throw하거나 response가 cancel되면, session transcript는 이전 상태로 rollback된다.

WWDC26에서는 advanced use case를 위해 transcript error handling policy가 추가되었다.

| Policy | 설명 |
|---|---|
| `.revertTranscript` | 기본 동작. error/cancel 시 transcript를 이전 상태로 되돌림 |
| `.preserveTranscript` | error/cancel 이후에도 transcript 상태를 유지 |

`preserveTranscript`를 사용할 때는 transcript를 계속 사용 가능한 상태로 되돌리는 책임이 앱에 있다.

또한 session의 `transcript` property가 mutable해졌다. 다만 transcript는 session의 `isResponding`이 false일 때만 수정할 수 있다. 응답 중 transcript를 변경하는 것은 programmer error로 간주된다.

---

# 13. Performance, accuracy, and evaluations

Transcript를 수정하면 성능과 정확도에 영향을 줄 수 있다.

## KV cache와 성능

Large language model은 KV cache를 사용해 이전 context 계산을 재사용한다. 일반적으로 transcript에 새 entry를 append하는 방식은 cache를 유지하기 쉽고, time-to-first-token을 줄인다.

반대로 다음 작업은 cache invalidation을 일으킬 수 있다.

- history entry 제거
- attached tools 변경
- instructions 변경
- transcript 재작성

세션은 이러한 영향을 측정하기 위해 Xcode의 개선된 **Foundation Models Instrument**를 사용하라고 권장한다.

## 정확도와 평가

History를 바꾸면 모델이 혼란스러워질 수 있다. 예를 들어 이전에는 tool 없이 title을 생성하다가, 나중에 title generation tool을 추가하면 모델이 과거 패턴을 보고 tool 없이 계속 생성하려 할 수 있다.

따라서 context engineering 전략은 감으로 판단해서는 안 되고, **Evaluations framework**를 사용해 eval set을 만들고 데이터 기반으로 검증해야 한다.

세션의 메시지는 명확하다.

- transcript mutation은 강력하지만 조심해서 사용해야 한다.
- 성능은 Instruments로 측정해야 한다.
- 정확도는 Evaluations framework로 검증해야 한다.
- 데이터 기반 최적화가 agentic system 품질을 높이는 핵심이다.

---

# 14. Next steps

세션의 마지막에서는 다음 단계를 제안한다.

- sample app을 직접 실행해 보기
- Private Cloud Compute model을 Dynamic Profiles와 함께 실험하기
- 개선된 Xcode Foundation Models Instrument로 성능을 측정하기
- Foundation Models framework utilities package 확인하기
- Evaluations framework 관련 세션 함께 보기

---

# 개발자 체크 포인트

- [ ] Dynamic Profiles로 앱 기능을 단계별 profile/agent로 나눌 수 있는지 검토
- [ ] 단계별로 on-device model, Private Cloud Compute model, server model을 구분
- [ ] 장시간 session에서 transcript trim/summarize 전략 설계
- [ ] `historyTransform`과 `history` property의 차이 이해
- [ ] 반복되는 profile 설정은 custom modifier로 분리
- [ ] summary 같은 공유 상태는 custom session property로 관리
- [ ] baton-pass와 phone-a-friend 중 적합한 orchestration pattern 선택
- [ ] tool calling mode 사용 시 exit condition을 반드시 설계
- [ ] error/cancel 후 transcript rollback 또는 preserve 정책 결정
- [ ] transcript mutation이 KV cache와 latency에 미치는 영향 측정
- [ ] Evaluations framework로 context engineering 전략 검증

---

# 함께 보면 좋은 후속 세션 후보

- Foundation Models framework
- Private Cloud Compute in Foundation Models
- Evaluations framework
- Debugging and profiling Foundation Models
- Bring an LLM provider to the Foundation Models framework
- App Intents
- Spotlight semantic index
- Xcode Instruments
- Core AI
- Apple Intelligence overview

---

## 정리

이 세션은 Foundation Models framework가 단순한 단일 prompt API를 넘어, 여러 모델과 도구를 조합하는 agentic workflow의 기반으로 확장되고 있음을 보여준다.

Dynamic Profiles는 session 안에서 모델, instructions, tools, generation options를 동적으로 바꿀 수 있게 해주며, 이를 통해 brainstorming, planning, reviewing처럼 성격이 다른 단계를 하나의 흐름 안에서 구성할 수 있다.

세션의 핵심은 “agent”라는 단어 자체보다, agentic experience를 안정적으로 만들기 위한 primitive다. Transcript를 어떻게 관리할지, 어떤 모델에 어떤 context를 전달할지, tool call을 언제 허용할지, error/cancel 이후 상태를 어떻게 복구할지, 그리고 이러한 설계가 성능과 정확도에 어떤 영향을 주는지를 체계적으로 다루는 것이 중요하다.
