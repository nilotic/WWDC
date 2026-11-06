# WWDC26 — Secure your app: mitigate risks to agentic features

- **Session:** 347
- **Source:** https://developer.apple.com/videos/play/wwdc2026/347/
- **Basis:** Apple Developer 공식 전체 transcript 및 Code 섹션
- **Topics:** Agentic security, indirect prompt injection, threat modeling, Foundation Models, App Intents, confirmations, authentication

---

## 🎯 한 줄 요약

Agentic 기능의 핵심 보안 문제는 **외부에서 들어온 신뢰할 수 없는 컨텍스트가 LLM의 제어 흐름을 바꾸고, 그 결과 실제 side effect가 있는 tool/intent가 실행될 수 있다는 것**이다. Apple은 이를 완전히 해결된 문제로 보지 않고, **untrusted context와 action side effect를 먼저 위협 모델링한 뒤, deterministic checkpoint를 기본 방어선으로 두고 probabilistic prompt mitigation을 보조적으로 결합**하라고 권장한다.

---

## 🧭 세션 구성

| Time | Chapter |
|---|---|
| 0:00 | Introduction |
| 2:06 | Risks |
| 6:32 | Threat modeling |
| 11:56 | Implementing mitigations |
| 12:03 | Foundation Models |
| 17:55 | App Intents |

이 세션은 **model safety**나 모델의 유해 출력 자체를 다루는 발표가 아니다. 또한 guardrail 우회 자체를 주제로 삼지도 않는다. 초점은 **외부 공격자가 앱의 agentic 기능을 악용해 사용자의 데이터·돈·시스템 자원·물리 장치 등에 영향을 미치는 상황**이다.

---

# 🧨 Agentic 기능이 만드는 새로운 공격면

전통적인 앱은 입력을 처리하고 미리 정의된 코드를 실행한다. Agentic 앱은 여기에 **확률적 의사결정을 하는 LLM**이 들어온다.

일반적인 agentic loop는 다음과 같은 형태다.

1. 앱이 instructions를 제공한다.
2. 사용자의 요청을 prompt에 포함한다.
3. Calendar, feed, document, tool result 같은 추가 context를 붙인다.
4. LLM이 action/tool을 선택한다.
5. Executor가 action을 실행한다.
6. 그 결과를 다시 LLM에 넣는다.
7. 필요한 만큼 반복한 뒤 최종 응답을 만든다.

이 구조에서 모델은 단순 텍스트 생성기가 아니라 **실제 행동을 선택하는 제어 요소**가 된다.

Apple의 예제 앱 **Loose Leaf**는 차를 중심으로 한 소셜 앱이며, 새로운 “Organize a tea party” 기능에서 다음을 한다.

- Calendar를 읽어 적절한 시간을 찾음
- 친구 프로필과 feed를 참고해 초대 대상을 결정
- 취향에 맞는 차를 결정
- 필요한 차를 실제로 주문

즉, 이 기능은 두 가지 특성을 가진다.

- 여러 위치의 context를 모델에 공급한다.
- 모델이 서로 다른 side effect를 가진 action을 호출한다.

이 두 특성이 결합되면 agentic 보안 문제가 크게 확대된다.

---

# 🧬 Indirect prompt injection

Apple은 **indirect prompt injection**을 추가 context 안에 공격자가 삽입한 지시가 들어 있고, 그 지시가 모델의 제어 흐름을 바꾸려는 공격으로 설명한다.

직접 사용자가 입력창에 공격성 prompt를 넣는 상황만을 뜻하지 않는다. 예를 들어 사용자가 단순히 “tea party를 준비해 줘”라고 요청했는데, 모델에 포함된 Calendar event 내용 자체가 다음 행동을 유도할 수 있다.

- 민감한 사용자 데이터 삭제
- 공격자에게 데이터 전송
- 원치 않는 구매
- 외부 URL 호출
- 물리 장치 제어

주요 주입 지점은 다음 두 군데다.

- 최초 prompt를 만들 때 포함되는 extra context
- agent loop 도중 tool에서 반환되는 결과

즉, **모델이 읽는 텍스트 중 사용자가 직접 쓴 내용만 신뢰 경계가 아니다.** 외부 시스템이나 다른 사용자가 영향을 줄 수 있는 모든 데이터가 공격 표면이 된다.

---

## 🧪 Data poisoning과 action poisoning

Apple은 indirect prompt injection이 실제 action 실행에 영향을 줄 때 두 가지 관점으로 나눈다.

### Data poisoning

실행할 action의 **파라미터**를 공격자가 바꾸는 경우다.

예:

- 사용자는 “엄마에게 메시지를 보내 줘”라고 요청
- 공격 context가 recipient를 공격자 자신으로 변경

즉, action 자체는 원래 의도와 같지만 **인자 값이 변조**된다.

### Action poisoning

공격자가 **어떤 action을 실행할지 자체를 바꾸는 경우**다.

예:

- 사용자는 이메일 요약만 요청
- 이메일 본문 속 injection이 모델을 유도
- 모델이 이메일 내용을 공격자 지정 URL에 붙여 웹 페이지를 여는 action을 실행

이 경우에는 단순 parameter 변조보다 더 근본적으로 agent의 control flow가 변경된다.

---

## ☠️ Lethal Trifecta 관점

세션은 Simon Willison의 **Lethal Trifecta** 개념을 참조한다.

사용자가 특히 위험한 상황은 agent가 동시에 다음을 가질 때다.

1. **Private data access** — 민감한 사용자 데이터에 접근 가능
2. **Untrusted content exposure** — 외부 공격자가 조작할 수 있는 입력을 읽음
3. **External communication** — 외부에 데이터를 보낼 수 있음

Apple은 마지막 항목을 더 일반화해 **side effect가 있는 모든 action**까지 포함해 생각할 수 있다고 설명한다.

여기서 중요한 전제는 다음과 같다.

> Indirect prompt injection을 완전히 해결하는 것은 아직 active research 영역이다.

따라서 현재 실무적 접근은 “모델이 알아서 injection을 무시할 것”이라고 믿는 것이 아니라, **앱이 얼마나 위험한 구조인지 파악하고 피해를 줄이는 방어 계층을 설계하는 것**이다.

---

# 🔎 Threat modeling: 먼저 데이터 흐름부터 그리기

Apple이 제시하는 첫 번째 작업은 **agentic loop input, 즉 prompt에 대한 data flow analysis**다.

## 🧱 Prompt를 구성하는 데이터 소스 식별

Loose Leaf 예시에는 다음이 들어간다.

- 앱이 정한 system/model instructions
- 사용자의 현재 prompt
- 과거 주문 내역
- 저장된 tea recipe
- Calendar events
- 친구들의 public feed

이후 각 source가 **trusted인지 untrusted인지** 구분한다.

실무적 rule of thumb은 간단하다.

> 외부 entity에서 오는 입력은 공격 표면으로 본다.

예를 들어:

- Calendar event는 누구든 초대를 보낼 수 있으므로 untrusted
- Friend feed는 다른 사용자가 자유롭게 내용을 올릴 수 있으므로 untrusted

반면 앱 자체에서 고정한 instructions는 같은 방식의 외부 공격면은 아니다.

---

# ⚠️ Action별 side effect 분류

다음 단계는 agent에게 제공한 모든 tool/intent를 나열하고 **실행됐을 때 어떤 side effect가 생기는지 평가**하는 것이다.

Loose Leaf의 예시는 다음과 같다.

| Action | 위험 | 설명 |
|---|---|---|
| `OrderTeaTool()` | Financial impact | 의도치 않게 실행되면 사용자의 돈이 지출됨 |
| `PostAndFetchPublicFeedTool()` | Data exfiltration | 모델이 민감 정보를 public post로 유출할 수 있음 |
| `BrewingTimerIntent()` | Context poisoning | label에 공격자-controlled 문자열이 들어가 이후 컨텍스트에 재유입될 수 있음 |
| Delete Photo | Data loss | 특히 undo가 없으면 파괴적 영향이 큼 |

여기서 중요한 점은 **겉으로 사소해 보이는 action도 위험할 수 있다**는 것이다.

예를 들어 timer 생성은 데이터 삭제나 송금보다 무해해 보인다. 하지만 label 필드에 공격자 문자열이 저장되고, 나중에 “timer 목록”을 읽을 때 그 문자열이 다시 모델 context에 들어간다면 **지속적인 prompt injection 저장소**가 될 수 있다.

따라서 side effect 평가는 즉시 보이는 결과뿐 아니라 **나중에 모델 context로 다시 들어오는 데이터 흐름**까지 포함해야 한다.

---

# 🛡️ Mitigation의 기본 원칙

Apple은 **deterministic mitigation을 baseline으로 우선**하라고 강조한다.

이유는 간단하다.

- 결과가 예측 가능하다.
- 감사(audit)하기 쉽다.
- security guarantee를 추론하기 쉽다.

반면 모델 prompt를 이용한 방어는 모델의 동작에 의존하므로 probabilistic하다.

세션이 제시한 mitigation은 크게 두 층으로 나뉜다.

## Prompt-level mitigation

- 민감 데이터 redaction
- untrusted context를 명시적으로 구분하는 spotlighting

## Action-execution mitigation

- side effect가 큰 action에 user confirmation
- 위험한 action은 인증/잠금 해제된 상태에서만 허용

둘 중 하나만 선택하는 것이 아니라 **prompt 단계와 실행 단계에 겹겹이 배치**한다.

---

# 🧽 Sensitive data redaction

모델이 필요로 하지 않는 PII나 민감 정보는 **애초에 모델 입력으로 보내지 않는 것**이 가장 강한 방어다.

예를 들어 과거 주문 데이터에 개인 식별 정보가 들어 있지만 agent의 작업 수행에는 필요하지 않다면 이를 제거한다.

효과:

- 데이터가 모델 context에 들어가지 않음
- prompt injection이 성공해도 모델이 그 정보를 외부로 보낼 수 없음
- exfiltration 가능한 데이터 자체를 줄임

핵심은 “모델에게 비밀을 알려준 뒤 잘 지키라고 요청”하는 대신 **필요하지 않은 비밀은 모델에게 주지 않는 것**이다.

---

# 🚨 Spotlighting untrusted context

Spotlighting은 모델에게 특정 구간이 **명령이 아니라 신뢰할 수 없는 데이터**라는 사실을 구조적으로 표시하는 방법이다.

예:

```text
<<UNTRUSTED>>
... public feed content ...
<</UNTRUSTED>>
```

단, Apple은 이 기법을 **probabilistic mitigation**이라고 명시한다.

왜냐하면 공격 prompt가 delimiter의 의미를 무력화하거나, 모델이 표시를 완전히 따르지 않을 가능성이 있기 때문이다.

따라서 spotlighting은 권장되지만 **confirmation이나 authentication 같은 deterministic boundary를 대체하지 않는다.**

---

# 🧱 Foundation Models: lifecycle event modifier를 보안 checkpoint로

Foundation Models framework로 직접 agent를 만들 때 Apple이 강조하는 도구는 **lifecycle event modifiers**다.

이 modifier들은 session execution의 특정 지점에서 **결정적으로 호출되는 callback**이다. 따라서 security policy를 주입할 checkpoint로 사용할 수 있다.

세션에서 자세히 다룬 것은 두 가지다.

- `.onToolCall`
- `.historyTransform`

---

## 🔧 Tool 정의와 Profile

세션의 agent는 두 개의 tool을 사용한다.

```swift
struct OrderTeaTool: Tool {
    let name = "orderTeaTool"
    let description: String = "Orders a particular quantity of a tea from the store."
    // Arguments
    // Implementation
}

struct PostAndFetchPublicFeedTool: Tool {
    let name = "postAndFetchPublicFeedTool"
    let description: String = "Posts a message to the public feed."
    // Arguments
    // Implementation
}
```

Tool의 `name`, `description`, arguments metadata는 모델이 tool의 목적과 호출 방식을 이해하는 데 사용된다.

다음으로 `LanguageModelSession.DynamicProfile`을 구성한다.

```swift
class LooseLeafAgent {
    struct DefaultProfile: LanguageModelSession.DynamicProfile {
        var body: some DynamicProfile {
            Profile {
                Instructions("You are a helpful, tea-loving assistant ... ")

                OrderTeaTool()
                PostAndFetchPublicFeedTool()
            }
            .model(SystemLanguageModel())
        }
    }
}
```

그리고 profile로 session을 만든다.

```swift
class LooseLeafAgent {
    // DefaultProfile ...

    let session: LanguageModelSession

    public init() {
        self.session = LanguageModelSession(profile: DefaultProfile())
    }
}
```

세션 예제는 on-device `SystemLanguageModel()`을 사용한다.

---

# ✅ `.onToolCall`: 실행 직전의 deterministic gate

`.onToolCall`은 모델이 tool call을 출력한 뒤 **Executor가 실제 tool을 실행하기 전에** 호출된다.

중요한 특성:

- 모든 tool call 전에 실행됨
- callback이 반환되어야 tool이 실행됨
- callback이 error를 throw하면 tool은 실행되지 않음
- 따라서 user confirmation 같은 security gate에 적합

Financial impact가 있는 `OrderTeaTool`에 confirmation을 거는 예시:

```swift
var body: some DynamicProfile {
    Profile {
        Instructions("You are a helpful, tea-loving assistant ... ")

        OrderTeaTool() // Financial impact; risky tool.
        // Other Tools
    }
    .onToolCall { call in
        guard call.toolName == "orderTeaTool" else {
            return
        }

        guard ConfirmationAction.confirmWithUser() else {
            throw LooseLeafError.userConfirmationDenied
        }
    }
}
```

`confirmWithUser()`는 발표용 placeholder이며 앱에서 실제 confirmation UI/flow로 구현해야 한다.

이 패턴의 장점은 **tool implementation 각각에 confirmation 로직을 중복 삽입하지 않고 profile의 한 checkpoint에서 전체 호출을 통제**할 수 있다는 점이다.

보안적으로 중요한 사고방식은 다음과 같다.

> 모델이 어떤 tool을 골랐는지 신뢰한 뒤 실행하는 것이 아니라, 실행 직전에 앱의 deterministic policy가 다시 승인한다.

---

# 🧹 `.historyTransform`: 모델 입력 직전의 context sanitization

`.historyTransform`은 transcript가 모델에 렌더링되어 inference로 들어가기 **직전** 실행된다.

호출 시점:

- 새로운 user request가 들어올 때
- agent loop의 각 iteration마다

즉, model input에 들어가는 transcript tail을 변환할 수 있다.

세션에서는 두 가지 용도로 사용한다.

- spotlighting
- PII redaction

---

## 🚧 Public feed 결과에 spotlighting 적용

`PostAndFetchPublicFeedTool`은 public feed를 읽으므로 결과가 untrusted다.

Apple 예제의 구조:

```swift
.historyTransform { entries in
    entries.map { entry in
        guard case .toolOutput(var toolOutput) = entry,
              toolOutput.toolName == "postAndFetchPublicFeedTool"
        else {
            return entry
        }

        toolOutput.segments = toolOutput.segments.map { segment in
            delimit(
                segment: segment,
                startDelimiter: "<<UNTRUSTED>>",
                endDelimiter: "<</UNTRUSTED>>"
            )
        }

        return .toolOutput(toolOutput)
    }
}
```

핵심 순서:

1. transcript entries를 순회
2. `toolOutput`인 항목만 찾음
3. 해당 tool 이름인지 확인
4. 그 output segment만 delimiter로 감쌈
5. 나머지는 변경하지 않고 반환

`delimit(...)`의 구현은 세션에서 생략된다. 사용하는 모델에 맞는 marker를 선택해야 한다.

---

## 🫥 같은 구조로 PII redaction

같은 위치에서 delimiter 대신 redaction 함수를 적용할 수 있다.

```swift
.historyTransform { entries in
    entries.map { entry in
        guard case .toolOutput(var toolOutput) = entry,
              toolOutput.toolName == "postAndFetchPublicFeedTool"
        else {
            return entry
        }

        toolOutput.segments = toolOutput.segments.map { segment in
            redactPII(
                segment: segment,
                placeHolder: "[REDACTED]"
            )
        }

        return .toolOutput(toolOutput)
    }
}
```

여기서도 `redactPII(...)`의 실제 구현은 발표에서 생략한다.

---

## ⚠️ Transform은 현재 inference iteration에만 적용

이 부분은 실무에서 놓치기 쉽다.

`.historyTransform`으로 변경한 entry는 **현재 inference iteration에만 유효**하다.

즉:

- underlying session history 자체가 영구 수정되는 것이 아님
- 다음 inference call에서는 다시 transform해야 함

따라서 매 iteration마다 동일한 security transform이 적용되어야 한다.

Apple은 비용이 큰 변환을 지속적으로 유지해야 할 때 **`@SessionProperty`**를 사용해 stateful transformation을 session history에 적용하는 방식을 언급한다.

또한 framework에는 이 둘 외에도 다른 lifecycle modifier가 있고, 자체 profile modifier를 만들어 reusable security component로 패키징할 수 있다.

---

# 🧠 Deterministic vs probabilistic 방어의 역할 분리

세션의 전체 맥락을 Foundation Models 관점에서 정리하면 다음과 같다.

### Probabilistic layer

- spotlighting
- prompt instructions
- 모델에게 untrusted data임을 설명

### Deterministic layer

- `.onToolCall`에서 실행 차단
- 사용자 confirmation
- 앱의 authentication/authorization 확인
- 민감 데이터 자체를 model input에서 제거

실제 side effect를 막는 마지막 경계는 **모델의 prompt obedience가 아니라 앱 코드**여야 한다.

---

# 🧰 App Intents: Siri tool로 노출될 때의 보안

App Intent가 intent schema를 채택하면 해당 intent는 Siri 모델이 사용할 수 있는 **tool**이 된다.

예를 들어 photo domain의 `deleteAssets` schema를 채택한 `DeletePhotoIntent`는 Siri Toolbox에 들어간다.

이 구조의 장점은 Siri가 사용자 요청을 이해하고 올바른 앱 action을 호출할 수 있다는 것이다.

하지만 보안 관점에서는 **어떤 intent를 호출할지 모델이 결정**하므로 indirect prompt injection이 app intent까지 이어질 수 있다.

특히 다음 종류의 action이 공격자에게 가치가 높다.

- 외부에서 보이는 side effect
- 데이터 삭제
- 외부로 데이터 전송
- 공유 데이터 변경

Apple은 App Intents 시스템에 이미 여러 방어가 있고, 이 세션에서는 두 가지를 집중적으로 다룬다.

- risk-based contextual confirmation
- lock-screen authentication

---

# ✅ Risk-based contextual confirmations

App Intents에서는 고위험 action에 대해 시스템이 자동으로 confirmation을 요구할 수 있다.

Risk Evaluation은 크게 두 정보를 사용한다.

1. **Static action metadata** — intent/schema의 side effect 특성
2. **Dynamic system state** — 현재 실행 문맥

동작 흐름:

1. Siri/model이 intent를 선택
2. 실행 전 Risk Evaluation 수행
3. intent risk metadata와 현재 system state 결합
4. risk가 높으면 사용자 confirmation 요청
5. 승인하면 intent 실행
6. 거부하면 intent 자체가 호출되지 않음

이 confirmation은 모든 intent에 동일하게 적용되는 단순 고정 정책이 아니라 **risk-based + contextual** 방식이다.

---

# 🧾 Risk metadata와 App Schemas

Schema를 채택한 App Intent는 해당 schema가 가진 **side effect/risk metadata를 자동으로 상속**한다.

예:

- `photos.deleteAssets` → destructive side effect
- 따라서 이를 채택한 Delete Photo action은 높은 위험을 가질 수 있음

개발자가 schema 기반 intent마다 별도로 risk metadata를 붙이는 구조가 아니라, **schema가 의미와 side effect를 함께 전달**한다.

이것이 App Schema를 쓰는 보안상의 중요한 장점 중 하나다.

---

## ⏲️ 무해해 보이는 createTimer도 context에 따라 위험할 수 있음

Timer 생성 자체는 돈을 쓰거나 데이터를 삭제하지 않는다.

하지만 schema에 optional `String` label이 있다면 모델이 공격자-controlled 문자열을 label에 기록할 수 있다.

이후 사용자가 “현재 timer를 보여 줘”라고 하면 저장된 malicious label이 새 context로 읽혀 **새 agent loop를 다시 poison**할 수 있다.

따라서 “create action이니까 안전하다”처럼 action 이름만 보고 고정적으로 분류해서는 안 된다.

Apple의 Risk Evaluation은 이런 중간 지대에서 **dynamic system state**까지 사용해 현재 문맥에서 confirmation이 필요한지 판단한다.

---

# 🔒 Lock-screen authentication

Siri는 기기가 잠긴 상태에서도 사용할 수 있다. 편리하지만, 물리적으로 잠긴 기기를 가진 공격자가 Siri를 통해 app intent를 실행할 가능성도 생긴다.

위험한 action은 **기기 잠금 해제/인증 이후에만 실행**되도록 해야 한다.

## Custom App Intent

Custom intent에서는 `authenticationPolicy`를 직접 지정할 수 있다.

```swift
struct DeletePhotoIntent: DeleteIntent {
    var entities: [LooseLeafPhoto]

    static var authenticationPolicy: IntentAuthenticationPolicy = .requiresAuthentication

    func perform() async throws -> some IntentResult {
        // Implementation
    }
}
```

파괴적인 action은 `.requiresAuthentication`으로 제한해 잠금 상태에서 실행되지 않게 할 수 있다.

---

## App Schema 기반 intent

Schema 자체가 기본 `authenticationPolicy`를 가진다.

```swift
@AppIntent(schema: .photos.deleteAssets)
struct DeletePhotoIntent {
    var entities: [LooseLeafPhoto]

    // Example: Schema default authentication policy is .requiresAuthentication

    func perform() async throws -> some IntentResult {
        // Implementation
    }
}
```

Schema의 기본 policy는 해당 schema가 다루는 데이터의 민감도와 side effect에 따라 정해진다.

중요한 규칙:

- Schema의 기본 authentication policy는 자동 상속
- 앱이 명시적으로 override할 수 있음
- 단, **더 엄격하게만 변경 가능**
- 더 약한 policy를 설정하면 build error

즉, schema가 요구하는 최소 보안 수준을 앱이 낮출 수 없다.

---

# 🔄 Foundation Models와 App Intents의 역할 비교

| 영역 | Foundation Models | App Intents |
|---|---|---|
| Agent 제어 | 앱이 직접 agent/profile/tool 구성 | Siri/Apple Intelligence가 schema 기반 intent를 tool로 사용 |
| Tool 실행 전 gate | `.onToolCall` | 시스템 Risk Evaluation + confirmation |
| 모델 입력 변환 | `.historyTransform` | 이 세션에서는 해당 형태의 개발자 API를 다루지 않음 |
| Untrusted context 표식 | Spotlighting 직접 구현 | 시스템의 contextual risk 판단 활용 |
| 민감 데이터 제거 | `.historyTransform` 등에서 직접 구현 | 앱/intent 데이터 설계에서 최소화 필요 |
| Authentication | 앱이 직접 policy/check 설계 | `authenticationPolicy`, schema default |
| 보안 기준의 위치 | 앱 profile의 deterministic lifecycle hook | App Schema metadata + system state |

두 접근 모두 공통점이 있다.

> 실제 side effect가 있는 action은 모델의 선택만으로 바로 실행하지 않고, 실행 경로에 deterministic security boundary를 둔다.

---

# 🧩 Threat model 작성 템플릿

세션의 방법론을 그대로 적용하면 각 agentic feature를 다음 순서로 검토할 수 있다.

## 1. Asset 확인

공격자가 노릴 수 있는 것을 나열한다.

- 개인 데이터
- 금융 자산
- 사용자 계정 상태
- 사진/파일
- 카메라/마이크
- 위치
- 스마트 홈/물리 장치
- 외부 서비스에 게시·전송할 권한

## 2. Prompt data flow 그리기

모델 입력에 무엇이 들어가는지 나열한다.

- instructions
- user prompt
- local DB
- Calendar/Mail/Contacts
- web/API result
- RAG 문서
- social feed
- tool output
- 이전 agent result

## 3. Trust boundary 표시

외부 entity가 내용에 영향을 줄 수 있으면 untrusted로 본다.

특히:

- 다른 사용자가 만든 콘텐츠
- 외부 웹 페이지
- 이메일/메시지
- 공유 문서
- calendar invite
- remote API의 자유 텍스트
- agent가 만든 저장형 문자열

## 4. Tool/Intent inventory 작성

각 action에 대해 다음을 기록한다.

- 읽기 전용인지
- state를 변경하는지
- 돈을 쓰는지
- 삭제하는지
- 외부 통신하는지
- 공개 게시하는지
- 물리 장치를 움직이는지
- 결과가 향후 model context에 다시 들어오는지

## 5. Deterministic mitigation 지정

각 위험 action에 최소 하나 이상의 확정적 방어를 둔다.

- user confirmation
- authentication/unlock
- authorization/permission check
- allowlist
- amount/range limit
- undo/recovery
- sensitive-data minimization
- execution-time validation

## 6. Probabilistic mitigation 추가

- spotlighting
- role/instruction hardening
- structured prompt separation

단, 이 층이 deterministic gate를 대체하지 않도록 한다.

---

# 📋 구현 체크리스트

### Prompt / Context

- [ ] 모델에 들어가는 모든 데이터 source를 목록화
- [ ] 외부 entity가 조작할 수 있는 source를 untrusted로 표시
- [ ] Tool output도 다시 prompt로 들어오는 untrusted source인지 검토
- [ ] 불필요한 PII를 모델 입력 전에 redaction
- [ ] Untrusted context에 spotlighting 적용 검토
- [ ] Spotlighting을 유일한 방어선으로 사용하지 않기
- [ ] `.historyTransform`이 iteration마다 다시 적용되는지 확인
- [ ] 지속 상태가 필요한 경우 `@SessionProperty` 검토

### Tool execution

- [ ] 모든 tool의 side effect 분류
- [ ] 금전·삭제·외부 게시·물리 제어 action은 고위험으로 취급
- [ ] `.onToolCall`에서 고위험 tool에 confirmation 적용
- [ ] Confirmation 거부 시 error를 throw해 실행 차단
- [ ] Tool 내부 파라미터도 실행 직전에 validation
- [ ] 저장한 문자열이 이후 context poisoning에 사용될 수 있는지 검토

### App Intents

- [ ] 채택한 App Schema의 side effect 의미 확인
- [ ] Risk-based confirmation을 전제로 destructive/exfiltration action 검토
- [ ] Lock screen에서 intent가 호출될 때의 위험 평가
- [ ] Custom intent의 `authenticationPolicy` 지정 검토
- [ ] Schema 기본 policy가 요구하는 최소 수준 확인
- [ ] Override가 필요하면 더 엄격한 방향으로만 설정

### Threat modeling

- [ ] 공격자가 원하는 asset 정의
- [ ] Data flow diagram 작성
- [ ] Trust boundary 표시
- [ ] Action inventory와 side-effect matrix 작성
- [ ] Prompt-level mitigation과 action-level mitigation을 분리해 기록
- [ ] Deterministic mitigation을 baseline으로 배치
- [ ] 새로운 tool/schema/context source 추가 시 threat model 갱신

---

# 🧠 세션의 핵심 메시지

Agentic 앱에서 가장 위험한 가정은 **“모델이 올바른 의도를 이해했으니 action도 안전할 것”**이라고 보는 것이다.

Apple의 접근은 반대다.

- 모델이 읽는 외부 context는 공격자가 조작할 수 있다고 가정한다.
- 모델이 선택한 tool/action도 공격의 영향을 받았을 수 있다고 가정한다.
- 따라서 실제 side effect가 발생하기 전 **결정적이고 감사 가능한 코드 경계**를 둔다.
- 모델 prompt 기반 방어는 추가적인 완화책으로 사용한다.
- Foundation Models에서는 lifecycle modifier가 이 경계를 제공한다.
- App Intents에서는 App Schema의 risk metadata, system context, confirmation, authentication policy가 이 역할을 한다.

Indirect prompt injection은 아직 완전히 해결된 문제가 아니므로, 보안 목표는 “prompt injection을 100% 탐지”하는 것이 아니라 **공격자가 모델을 흔들더라도 실제 피해로 이어지는 경로를 좁히는 것**이다.

---

# 🔗 함께 보면 좋은 세션과 자료

- [Secure your app: mitigate risks to agentic features — WWDC26](https://developer.apple.com/videos/play/wwdc2026/347/)
- WWDC26 — Build agentic app experiences with the Foundation Models framework
- WWDC26 — Build intelligent Siri experiences with App Schemas
- WWDC26 — Explore advanced App Intents features for Siri and Apple Intelligence
- WWDC25 — Explore prompt design & safety for on-device foundation models
- WWDC20 — Secure your app: threat modeling and anti-patterns
- Apple Developer — Security Overview
