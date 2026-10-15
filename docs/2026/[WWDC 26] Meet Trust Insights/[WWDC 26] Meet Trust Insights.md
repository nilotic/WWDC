# WWDC26 Meet Trust Insights 요약

- Session: 379
- Title: Meet Trust Insights
- Source: https://developer.apple.com/videos/play/wwdc2026/379/
- Topic: Trust Insights, Social Engineering, Coercion Detection, Privacy, Risk Signals, Swift, App Security, Fraud Prevention
- Chapters: Introduction, Generating insights, Feedback requirements, Privacy, Best practices, Next steps

---

## 한 줄 요약

Trust Insights는 iOS 27에서 도입된 새로운 프레임워크로, 사용자가 정상적으로 인증된 상태에서도 **사회공학적 사기나 실시간 코칭에 의해 강요된 행동을 하고 있을 가능성**을 privacy-preserving machine learning으로 평가해 앱의 기존 risk decision logic에 추가 신호를 제공한다.

---

## 핵심 요약

Trust Insights가 해결하려는 문제는 전통적인 인증과 보안 시스템으로는 탐지하기 어려운 **사회공학적 강요(coercion)** 다.

공격자는 계정 탈취나 시스템 침입 대신 사용자의 심리와 판단을 공격한다.

대표 사례:

- Tech support scam
- Bank / government / law enforcement impersonation
- Family emergency fraud
- AI-generated deepfake를 이용한 긴급 송금 요구
- Voice call, chat, messaging을 통한 real-time coaching

이 경우 사용자는 실제 본인이며 인증도 정상적으로 통과한다.

```text
Authentication
→ "이 사람이 누구인가?"

Trust Insights
→ "이 사람이 지금 자유로운 의사로 행동하고 있는가?"
```

따라서 biometrics나 MFA가 정상 작동해도 coercion risk는 남는다.

Trust Insights의 목적은 이 behavioral context를 앱에 추가 신호로 제공하는 것이다.

---

# 🧠 왜 새로운 Signal이 필요한가

기존 보안 시스템은 일반적으로 다음을 확인한다.

- 올바른 계정인가
- 올바른 device인가
- 올바른 credential인가
- biometric authentication을 통과했는가
- 요청이 legitimate app instance에서 왔는가

하지만 social engineering에서는 공격자가 이 시스템들을 우회할 필요가 없다.

사용자에게 직접 행동하도록 설득하기 때문이다.

예:

```text
Attacker
  ↓
"지금 계좌를 보호하려면 이 계좌로 돈을 보내야 합니다"
  ↓
User
  ↓
Face ID 인증
  ↓
정상 송금 요청
```

시스템 관점에서는 정상적인 user action이다.

하지만 실제 intent는 coercion의 영향을 받을 수 있다.

Trust Insights는 이런 상황을 식별하기 위해 **behavioral context**를 제공한다.

---

# 🛡️ Trust Insights의 기본 역할

Trust Insights는 device와 cloud infrastructure를 함께 사용하는 framework다.

그러나 앱의 integration point는 전부 client-side Swift API다.

전체 흐름:

```text
App action 발생
      ↓
Insight request 구성
      ↓
InsightContext 생성
      ↓
Authorization 확인
      ↓
requestEvaluation()
      ↓
Insight result
unknown / medium / high
      ↓
App risk logic에 결합
      ↓
reportConsumption()
      ↓
필요 시 offline fraud feedback
```

---

# ⚙️ Entitlement과 Capability 설정

Trust Insights를 사용하려면 entitlement가 필요하다.

Xcode의 app target에서 Trust Insights capability를 선언해야 한다.

그 후 framework를 import한다.

```swift
import TrustInsights
```

Trust Insights는 일반 API처럼 아무 앱에서나 즉시 호출하는 기능이 아니라, entitlement를 전제로 하는 보호된 capability다.

---

# 📦 Insight Request 구성

Insight를 요청하려면 먼저 parameter pack을 만든다.

세션에서 사용하는 insight는:

```swift
IsLikelyBeingCoachedInsight
```

예:

```swift
let request = IsLikelyBeingCoachedInsight.request(
    schema: .version1,
    modelVersion: .current
)
```

여기서:

- `schema`는 필수
- `modelVersion`은 optional

이다.

---

# 🧬 Schema와 Model Version

Apple은 schema와 model version을 분리한다.

이 구조를 사용하면 model governance를 더 안정적으로 수행할 수 있다.

예를 들어:

```text
Same insight
├─ Current model
└─ Previous model
```

두 model version의 결과를 함께 비교하면 신규 모델이 기존 decision logic에 어떤 영향을 주는지 확인할 수 있다.

특히 fraud/risk system에서는 모델 업데이트 자체가 사용자 경험이나 false positive rate를 바꿀 수 있기 때문에 version comparison이 중요하다.

---

# 🧭 `InsightContext`

`InsightEvaluator`는 여러 insight를 평가할 수 있다.

평가에 필요한 핵심 context는 `InsightContext`다.

세션 예제:

```swift
let context = InsightEvaluator.InsightContext(
    operationCategory: .resourceUse,
    requestedEvaluations: request
)
```

`operationCategory`는 사용자가 지금 수행하려는 operation의 성격을 나타낸다.

이 category가 어떤 model logic을 적용할지 결정한다.

---

# 🗂️ Operation Category 5종

Trust Insights는 다섯 가지 operation category를 제공한다.

## `payment`

자산, 콘텐츠, 돈의 교환.

예:

- P2P 송금
- 결제
- In-game purchase
- Digital asset exchange

## `account`

Account detail이나 security information의 변경.

예:

- Password 변경
- Recovery information 변경
- Security setting 변경
- Account ownership 관련 변경

## `resourceUse`

비용이 높거나 제한된 infrastructure 사용.

예:

- AI inference
- Expensive compute
- Constrained resource allocation

## `communication`

외부로 information이나 intent를 전달하는 action.

예:

- Message 전송
- Form 제출
- Document 서명

## `other`

위 category에 명확히 해당하지 않는 operation.

Apple은 use case가 `other`에 자주 해당한다면 Feedback Assistant를 통해 feedback을 제출할 것을 권장한다.

---

# 🧪 `InsightEvaluator` 생성

Context를 만든 뒤 evaluator를 생성한다.

```swift
let evaluator = InsightEvaluator()
```

그 다음 authorization 상태를 확인한다.

```swift
guard try await evaluator.requestAuthorization(for: context) == .authorized else {
    return
}
```

Trust Insights 사용 여부는 사용자가 통제한다.

따라서 앱은 authorization을 당연히 있다고 가정해서는 안 된다.

---

# 🔐 Authorization은 사용자 통제 대상

사용자는 Settings에서 Trust Insights를 비활성화할 수 있다.

앱은 evaluation 전에 authorization 상태를 확인해야 한다.

Unauthorized라면 앱 UX에 따라:

- 기능을 그대로 진행
- 다른 risk mechanism 사용
- 필요하면 사용자에게 안내

등을 선택할 수 있다.

Trust Insights 자체가 앱 기능의 필수 전제 조건이 되어서는 안 된다.

---

# 📡 Evaluation 요청

실제 평가 요청:

```swift
let assessment = try await evaluator.requestEvaluation(context: context)
```

이 API는 asynchronous하다.

Apple이 강조하는 운영 특성:

- 결과까지 수 초 걸릴 수 있음
- Internet reachability 필요
- UX flow 내에서 호출 위치를 신중히 선택해야 함

즉 payment confirmation button을 누른 즉시 blocking spinner를 몇 초 동안 보여주는 방식은 좋지 않을 수 있다.

Apple은 다음과 같은 기존 UX interval을 활용할 수 있다고 설명한다.

- Animation
- Interstitial screen
- Confirmation flow
- Existing processing stage

---

# ⏱️ Latency를 UX에 숨기는 전략

Trust Insights는 즉시 local synchronous API가 아니다.

따라서 integration에서는 latency budget이 중요하다.

개념적으로:

```text
User action
   ↓
이미 존재하는 transition / animation
   ↓       ↘
UI 진행   Trust Insights request
   ↓       ↙
Decision point
```

가능하면 evaluation latency를 기존 UX 흐름과 overlap시키는 방식이 좋다.

---

# 🧪 Sandbox와 Production

Development 중에는 request가 sandbox environment로 전송된다.

App Store에 배포된 앱은 production models와 production servers를 사용한다.

```text
Development build
→ Sandbox evaluation

App Store distribution
→ Production models / servers
```

따라서 development 결과를 production fraud behavior와 동일하게 해석해서는 안 된다.

---

# 🛠️ Xcode Scheme을 이용한 테스트

실제 coercion 상황을 재현하지 않고도 decision logic과 UX를 테스트할 수 있다.

Xcode build scheme customization을 이용해:

- Insight value override
- Error override

를 수행할 수 있다.

이를 이용하면 다음 UI를 deterministic하게 검증할 수 있다.

```text
unknown → normal flow
medium  → warning + friction
high    → stronger intervention
error   → fallback flow
```

지원되는 launch argument는 Trust Insights developer documentation에서 확인한다.

---

# 📊 `IsLikelyBeingCoachedInsight` 결과

`IsLikelyBeingCoachedInsight`는 세 가지 값을 반환한다.

- `unknown`
- `medium`
- `high`

---

# ❓ `unknown`

`unknown`은:

> 시스템에 scam risk를 판단할 evidence가 없다.

는 의미다.

가장 중요한 점:

**unknown은 low risk가 아니다.**

잘못된 해석:

```text
unknown = safe
```

올바른 해석:

```text
unknown = sufficient evidence 없음
```

따라서 existing risk system에서 unknown을 safety signal처럼 사용하면 안 된다.

---

# 🟠 `medium`

`medium`은 coaching risk에 대한 일부 evidence가 있다는 의미다.

가능한 대응:

- 추가 verification
- Additional friction
- Warning
- Delay
- Risk score adjustment
- Manual review trigger

실제 대응은 앱의 business context에 따라 달라진다.

---

# 🔴 `high`

`high`는 significant evidence of coaching risk를 의미한다.

Apple은 사용자가 operation을 계속하기 전에 **identified risk를 알려주는 것**을 권장한다.

하지만 high 하나만으로 operation을 outright block하는 패턴은 권장하지 않는다.

Trust Insights는 single source of truth가 아니라 기존 risk system에 추가되는 하나의 signal이다.

---

# 💻 결과 처리 코드

세션 예제:

```swift
func handleAssessment(
    _ assessment: InsightEvaluation<IsLikelyBeingCoachedInsight>
) throws {
    switch try assessment.insight.outcome.get() {
    case .unknown:
        // No evidence, but not equivalent to low risk

    case .medium:
        // Consider additional verification or friction

    case .high:
        // Inform the user and increase safeguards

    @unknown default:
        break
    }
}
```

중요한 점은 `outcome.get()` 자체가 error를 throw할 수 있다는 것이다.

즉 result value뿐 아니라 insight-level failure도 처리해야 한다.

---

# ⚠️ Evaluation Error와 Insight Error를 분리

Apple은 error handling을 두 level로 나눠야 한다고 강조한다.

```text
Evaluation-level error
vs
Insight-level error
```

둘은 의미가 다르므로 동일한 fallback으로 뭉개면 안 된다.

예:

- 전체 evaluation request 실패
- 특정 insight만 결과 생성 실패

앱은 각각을 독립적으로 처리해야 한다.

---

# 🧠 Behind the Result: ML Processing

세 가지 결과 값 뒤에는 ML model이 동작한다.

Apple이 설명한 중요한 privacy architecture:

```text
Device-sourced data
      ↓
Local processing
      ↓
Evaluation 완료
      ↓
Input 즉시 폐기
      ↓
Single output value만 device 밖으로 이동
```

최종 output에는 additional context로:

- Apple Account signals
- Velocity checks

가 반영될 수 있다.

---

# 🔄 Feedback Loop가 필수인 이유

Trust Insights integration은 evaluation을 호출하는 것으로 끝나지 않는다.

두 종류의 feedback이 있다.

1. Real-time consumption feedback
2. Offline feedback

이 둘은 성격과 전달 경로가 다르다.

---

# 🔁 Real-time Consumption Feedback

각 insight evaluation request 후 앱이 실제로 결과를 어떻게 사용했는지 report해야 한다.

```swift
assessment.reportConsumption(.usedIncreasedFriction)
```

이 호출은 **mandatory**다.

Apple은 생략하면 app이 rate limited될 수 있다고 명시한다.

---

# 📋 Consumption Value 6종

## `usedReducedFriction`

Insight가 operation을 더 쉽게 진행하도록 하는 데 기여함.

예:

```text
기존 additional check 예정
+
낮은 risk interpretation
→ 일부 friction 완화
```

## `usedUnchangedFriction`

Insight를 평가했지만 UX나 decision flow는 바뀌지 않음.

## `usedIncreasedFriction`

Insight 때문에 추가 friction이나 check를 적용함.

예:

- Additional confirmation
- Warning
- Delay
- Secondary verification

Apple은 Trust Insight만으로 outright blocking하는 것은 권장하지 않는다.

## `notUsedNotNeeded`

사용자가 operation을 취소해 decision이 필요 없어짐.

## `notUsedError`

Technical failure 때문에 insight를 사용하지 못함.

예:

- Result가 너무 늦게 도착
- Flow가 이미 종료
- Technical error

## `usedEvaluationOnly`

사용자 경험에는 반영하지 않고 internal evaluation이나 benchmarking에만 사용함.

---

# 💻 전체 Integration Code

세션의 핵심 흐름을 합치면 다음과 같다.

```swift
import TrustInsights

let request = IsLikelyBeingCoachedInsight.request(
    schema: .version1,
    modelVersion: .current
)

let context = InsightEvaluator.InsightContext(
    operationCategory: .resourceUse,
    requestedEvaluations: request
)

let evaluator = InsightEvaluator()

guard try await evaluator.requestAuthorization(for: context) == .authorized else {
    return
}

let assessment = try await evaluator.requestEvaluation(context: context)

do {
    try handleAssessment(assessment)
} catch {
    // Handle insight-level error
}

assessment.reportConsumption(.usedIncreasedFriction)
```

---

# 🗃️ Offline Fraud Feedback

Real-time feedback와 별도로, transaction이 나중에 fraud로 확인되는 경우 offline label을 제공할 수 있다.

Fraud 판정은 즉시 이루어지지 않을 수 있다.

```text
Evaluation
  ↓
Transaction
  ↓
Days / weeks / months
  ↓
Confirmed fraud
```

이 장기 feedback이 model의 real-world performance 개선에 중요하다.

---

# 🌐 Apple Business Register

Offline fraud label은 앱에서 직접 보내는 것이 아니라 **Apple Business Register의 server-to-server API**를 통해 제출한다.

Submission에는 original evaluation을 식별할 수 있는 insight identifier가 포함된다.

개념:

```text
App evaluation
      ↓
Insight identifier 저장
      ↓
Later confirmed fraud
      ↓
Backend
      ↓
Apple Business Register
Partner Data Services
```

---

# 🔏 Offline Label Privacy

Apple은 offline submission에 surplus information을 넣지 말라고 강조한다.

특히:

- PII를 추가하지 않기
- Fingerprinting에 사용될 수 있는 값 최소화
- Remaining values에도 privacy-preserving technique 적용

즉 model improvement를 위해 fraud label을 보낼 때도 최소한의 정보만 전송해야 한다.

---

# ℹ️ Offline Feedback은 Optional

Offline fraud label submission은 Trust Insights를 사용하기 위한 필수 조건은 아니다.

하지만 제공하면 전체 ecosystem의 model quality 향상에 기여한다.

반면 real-time `reportConsumption`은 필수다.

```text
Real-time consumption feedback → Required
Offline fraud labels            → Optional, recommended
```

---

# 🔐 Privacy Architecture

Trust Insights에서 가장 중요한 설계 원칙 중 하나는 data minimization이다.

Framework는 필요한 data만 처리하고, input을 evaluation 직후 폐기하며, device-sourced data를 device 밖으로 보내지 않는다.

Apple은 다음과 같은 신호를 분석한다고 설명한다.

- Interaction patterns
- Timing
- Context
- Basic sensor data

하지만 다음 content는 분석하지 않는다.

- Photos content
- Messages content
- Mail content

---

# 🚫 Content Inspection Framework가 아니다

Trust Insights는 message나 photo content를 읽어 scam message인지 판별하는 content moderation API가 아니다.

핵심은 behavioral signal이다.

```text
Not:
"이 메시지가 사기 문구인가?"

Instead:
"현재 사용자의 행동 패턴이 coercion context와 부합하는가?"
```

이 구분은 privacy 설계의 핵심이다.

---

# 🏠 Device-derived Signal은 Device에 남는다

Apple의 설명에 따르면 device-derived signal은 Apple이나 third party에 공유되지 않는다.

Local processing 후 단일 output value만 external evaluation context에 사용된다.

따라서 앱도 raw behavioral telemetry를 전달받지 않는다.

앱이 받는 것은 high-level insight 결과다.

---

# 🎛️ 사용자 Control

사용자는 Settings에서 Trust Insights를 disable할 수 있다.

앱은 authorization status를 query해 실제 사용 가능 여부를 확인해야 한다.

Apple은 사용자가 coercion을 받아 Trust Insights를 끄도록 유도될 가능성도 고려한다.

그래서 disable 이후 **cooldown period가 적용될 수 있다**고 설명한다.

---

# 🧯 사례: 고액 송금

세션은 하나의 example을 든다.

사용자가 가족을 치료 중이라고 주장하는 사람에게 큰 금액을 송금하려 한다.

뒤에서는 Trust Insights가 evaluation을 수행한다.

결과:

```text
.medium
```

앱은 flow를 조정한다.

예:

- Warning 표시
- Transaction delay 추가

다른 앱에서는 다음 선택도 가능하다.

- Server-side risk handling
- Manual review
- Risk score adjustment
- 추가 confirmation

---

# 🧩 결과를 어떻게 사용할지는 Product Context에 달려 있다

Apple은 하나의 fixed UX를 요구하지 않는다.

올바른 response는:

- App type
- User population
- Operation sensitivity
- Existing risk system
- Business policy

에 따라 다르다.

핵심은 **Trust Insights signal을 단독 결정자로 쓰지 않는 것**이다.

---

# 🎯 언제 호출해야 하는가

Trust Insights는 모든 action마다 호출하는 API가 아니다.

Apple은 높은 가치 또는 되돌리기 어려운 critical moment를 중심으로 사용하는 것을 권장한다.

대표적인 시점:

## High-value financial transaction

- P2P payment
- Large transfer

## Irreversible action

- Account deletion
- Personal data export

## Permission grant

- Remote access
- New device authorization

## Sensitive data sharing

- Credentials
- Personal documents

---

# 🧠 기존 Risk Logic과 결합

Trust Insights를 새로운 독립 보안 시스템처럼 만들기보다 기존 risk engine 안에 signal로 통합해야 한다.

예:

```text
Existing signals
├─ Device reputation
├─ Authentication strength
├─ Account history
├─ Transaction velocity
├─ Fraud rules
└─ Trust Insight
        ↓
Combined decision
```

Trust Insight 하나만으로 final decision을 내려서는 안 된다.

---

# 🚫 Trust Insight만으로 Blocking하지 않는다

Apple이 명확히 권장하지 않는 방식:

```text
if insight == .high {
    blockTransaction()
}
```

대신:

```text
if insight == .high {
    increaseRiskScore()
    showWarning()
    requireAdditionalVerification()
}
```

같이 additional context와 결합하는 접근이 적절하다.

---

# 🧪 Model Version을 Sampling에 활용

`modelVersion`을 선택할 수 있기 때문에 newer model을 즉시 production decision에 반영하지 않고 먼저 비교할 수 있다.

예:

```text
Current model
→ 실제 user decision에 사용

New model
→ Evaluation only
→ 결과 비교
→ Impact 분석
```

그 후 decisioning logic을 업데이트할 수 있다.

이는 model governance 관점에서 중요한 기능이다.

---

# ⚠️ Unknown이나 Missing을 Low Risk로 해석하지 않기

세션 전체에서 가장 중요한 운영 원칙 중 하나다.

```text
unknown ≠ low risk
missing ≠ low risk
error   ≠ low risk
```

왜냐하면 이 상태들은 risk가 낮다는 의미가 아니라 **판단할 evidence가 부족하거나 결과를 얻지 못했다**는 의미일 수 있기 때문이다.

---

# 🔄 Feedback이 Rate Limit과 Model Quality에 연결된다

Real-time feedback은 단순 telemetry가 아니다.

각 evaluation이 실제 UX에서 어떻게 사용됐는지 system이 이해하게 해준다.

따라서:

```text
requestEvaluation()
      ↓
Decision
      ↓
reportConsumption()
```

을 하나의 완결된 lifecycle로 생각해야 한다.

`reportConsumption`을 생략하면 rate limiting이 발생할 수 있다.

---

# 🧭 Integration Lifecycle

전체 integration을 한 번에 보면:

```text
Capability / Entitlement
        ↓
Import TrustInsights
        ↓
Insight request 구성
schema + optional modelVersion
        ↓
InsightContext
operationCategory + requestedEvaluations
        ↓
requestAuthorization
        ↓
requestEvaluation
        ↓
Handle evaluation error
        ↓
Handle insight error
        ↓
unknown / medium / high
        ↓
Existing risk logic과 결합
        ↓
User experience 조정
        ↓
reportConsumption
        ↓
Later confirmed fraud?
        ↓
Apple Business Register offline label
```

---

# 🧪 Testing Matrix

실제 제품에서는 최소 다음 경우를 테스트해야 한다.

| Case | 기대 동작 |
|---|---|
| Authorization denied | Trust Insights 없이 기존 flow 유지 |
| `unknown` | Low-risk로 간주하지 않고 기존 logic 적용 |
| `medium` | Warning / additional verification 등 검토 |
| `high` | Stronger intervention, risk 안내 |
| Evaluation-level error | Fallback risk path |
| Insight-level error | 해당 insight만 제외하거나 fallback |
| Slow result | UX를 block하지 않는 latency handling |
| User cancels | `notUsedNotNeeded` feedback |
| Result too late | `notUsedError` feedback |
| Internal benchmark | `usedEvaluationOnly` feedback |

---

# 📐 Architecture 예시

앱 내부에서는 Trust Insights를 UI layer에 직접 얹기보다 risk decision layer 안에 넣는 편이 자연스럽다.

```text
UI Action
   ↓
Operation Context
   ↓
Risk Coordinator
   ├─ Existing rules
   ├─ Account signals
   ├─ Server risk
   └─ Trust Insights
          ↓
      Risk Decision
          ↓
UX Policy
   ├─ Normal
   ├─ Warning
   ├─ Delay
   ├─ Additional verification
   └─ Manual review
```

이 구조는 Trust Insights를 single-source decision engine으로 오용하지 않도록 돕는다.

---

# ⏱️ Latency-aware Architecture

Evaluation이 수 초 걸릴 수 있기 때문에 UI action 직전에 API를 처음 호출하면 UX가 느려질 수 있다.

가능한 흐름:

```text
User begins sensitive flow
      ↓
Trust Insight request 시작
      ↓
User fills confirmation UI
      ↓
Evaluation result 도착
      ↓
Final confirmation 전에 적용
```

하지만 요청 시점은 실제 operation과 충분히 가까워야 한다.

너무 일찍 요청하면 behavioral context가 final action과 달라질 수 있기 때문이다.

따라서 **latency hiding과 contextual relevance 사이의 균형**이 필요하다.

---

# 🔐 Privacy Checklist

- [ ] Trust Insights entitlement 설정
- [ ] Authorization status 확인
- [ ] Raw behavioral signal을 직접 수집하려 하지 않기
- [ ] Device-derived data가 framework 밖으로 노출되지 않는 설계 이해
- [ ] Photos/Messages/Mail content 분석 기능으로 오해하지 않기
- [ ] User setting disable 상태 처리
- [ ] Offline label에 PII 포함하지 않기
- [ ] Fingerprinting 가능한 값 최소화
- [ ] 필요한 fraud identifier만 보존

---

# 🛠️ Integration Checklist

## Setup

- [ ] Xcode target에 Trust Insights capability 추가
- [ ] `import TrustInsights`
- [ ] 사용할 insight schema 결정
- [ ] `modelVersion` 지정 여부 결정
- [ ] 필요한 operation category 정의

## Request

- [ ] `InsightEvaluator.InsightContext` 구성
- [ ] Authorization 확인
- [ ] `requestEvaluation`을 async context에서 호출
- [ ] Internet reachability가 필요하다는 점 고려
- [ ] 몇 초 latency가 UX에 미칠 영향 검토

## Result Handling

- [ ] `.unknown` 처리
- [ ] `.medium` 처리
- [ ] `.high` 처리
- [ ] `@unknown default` 처리
- [ ] Evaluation-level error 처리
- [ ] Insight-level error 처리
- [ ] Missing result를 low risk로 해석하지 않기

## Risk Logic

- [ ] 기존 risk engine과 결합
- [ ] Trust Insights 단독으로 block하지 않기
- [ ] Warning policy 정의
- [ ] Additional verification policy 정의
- [ ] Delay / manual review 여부 정의
- [ ] Server-side risk logic과 결합할지 결정

## Feedback

- [ ] 모든 evaluation에 `reportConsumption` 호출
- [ ] 실제 UX outcome과 맞는 consumption value 사용
- [ ] User cancel → `notUsedNotNeeded`
- [ ] Technical failure → `notUsedError`
- [ ] Evaluation-only experiment → `usedEvaluationOnly`
- [ ] Offline confirmed fraud pipeline 검토
- [ ] Apple Business Register integration 검토

---

# 🧪 Development Checklist

- [ ] Sandbox와 production 차이 이해
- [ ] Xcode scheme override를 이용해 result variation 테스트
- [ ] `unknown` UX 테스트
- [ ] `medium` UX 테스트
- [ ] `high` UX 테스트
- [ ] Evaluation error 테스트
- [ ] Insight error 테스트
- [ ] Slow network / latency 테스트
- [ ] Offline / no reachability 테스트
- [ ] Authorization denied 테스트
- [ ] Trust Insights disabled 상태 테스트

---

# ⚠️ 구현 시 주의할 점

## `unknown`은 안전 판정이 아니다

가장 위험한 구현 실수다.

```swift
if outcome == .unknown {
    allowWithoutChecks()
}
```

처럼 사용하면 안 된다.

## High만 보고 차단하지 않는다

Trust Insights는 risk signal이다.

Final policy는 다른 signal과 결합해야 한다.

## Feedback 호출을 빼먹지 않는다

`reportConsumption`은 mandatory이며 생략하면 rate limiting 가능성이 있다.

## Async latency를 무시하지 않는다

수 초가 걸릴 수 있으므로 UI flow 설계 단계에서 integration point를 선택해야 한다.

## Error를 Risk Low로 fallback하지 않는다

Evaluation error와 insight error 모두 별도 의미가 있다.

## PII를 offline label에 넣지 않는다

Fraud model 개선을 위해 불필요한 개인정보를 더 보내서는 안 된다.

---

# 🧩 App Attest와의 관계

세션 마지막에서 Apple은 App Attest도 함께 살펴볼 수 있다고 언급한다.

두 framework는 해결하는 문제가 다르다.

```text
App Attest
→ Server request가 legitimate app instance에서 왔는지 검증

Trust Insights
→ Legitimate user action이 coercion의 영향을 받는지 behavioral context 제공
```

즉 둘은 대체 관계가 아니라 서로 다른 threat layer를 다룬다.

---

# 🧭 Threat Model 비교

| Threat | Authentication | App Attest | Trust Insights |
|---|---|---|---|
| Stolen credential | 도움 | 제한적 | 직접 목적 아님 |
| Modified/fake app | 제한적 | 핵심 | 직접 목적 아님 |
| Bot / illegitimate client | 제한적 | 핵심 | 직접 목적 아님 |
| User가 공격자에게 실시간 코칭 받음 | 대부분 탐지 어려움 | 탐지 어려움 | 핵심 use case |
| 정상 사용자에게 fraud pressure | 탐지 어려움 | 탐지 어려움 | 핵심 use case |

Trust Insights는 기존 security primitive가 잘 다루지 못했던 인간 중심 threat model을 보완한다.

---

# 🎯 적용 가치가 높은 순간

Apple이 제시한 critical moment들을 기준으로 정리하면:

```text
High value
+ Irreversible
+ Permission escalation
+ Sensitive information
```

에 해당할수록 Trust Insights 적용 가치가 높다.

예:

- 큰 금액 송금
- Account deletion
- Personal data export
- Remote access permission
- New device authorization
- Credentials 공유
- Personal document 공유

반대로 위험도가 낮은 일반 navigation이나 단순 조회 action마다 호출할 필요는 없다.

---

# 🧠 Model Governance Pattern

`modelVersion`을 이용하면 model upgrade를 product change와 분리해서 검증할 수 있다.

```text
Version N
→ Production decision

Version N+1
→ Evaluation only
→ Compare distribution
→ False positive / friction impact 분석
→ Decision policy update
→ Gradual adoption
```

Risk-sensitive application에서 중요한 운영 패턴이다.

---

# 🔁 Feedback Ecosystem

Trust Insights가 장기적으로 개선되는 과정은 다음과 같이 볼 수 있다.

```text
Evaluation
   ↓
App decision
   ↓
Real-time consumption feedback
   ↓
Real-world outcome
   ↓
Confirmed fraud labels
   ↓
Model improvement
   ↓
New model versions
   ↓
Evaluation / sampling
```

앱이 단순 소비자가 아니라 feedback ecosystem에 참여하는 구조다.

---

# 🧭 권장 구현 순서

```text
1. Critical operation 식별
      ↓
2. Existing risk logic 정리
      ↓
3. Trust Insights entitlement 설정
      ↓
4. Operation category mapping
      ↓
5. Evaluation integration
      ↓
6. Latency-aware UX 구성
      ↓
7. unknown / medium / high policy 정의
      ↓
8. Error policy 정의
      ↓
9. reportConsumption 연결
      ↓
10. Xcode override로 UX 테스트
      ↓
11. Production sampling / model governance
      ↓
12. 가능하면 offline fraud label pipeline 구축
```

---

# 📌 핵심 API 정리

## Framework

```swift
import TrustInsights
```

## Insight Request

```swift
IsLikelyBeingCoachedInsight.request(
    schema: .version1,
    modelVersion: .current
)
```

## Context

```swift
InsightEvaluator.InsightContext(
    operationCategory: .resourceUse,
    requestedEvaluations: request
)
```

## Evaluator

```swift
let evaluator = InsightEvaluator()
```

## Authorization

```swift
try await evaluator.requestAuthorization(for: context)
```

## Evaluation

```swift
try await evaluator.requestEvaluation(context: context)
```

## Outcome

```swift
try assessment.insight.outcome.get()
```

Possible values:

```swift
.unknown
.medium
.high
```

## Consumption Feedback

```swift
assessment.reportConsumption(.usedIncreasedFriction)
```

---

# 🔍 세션에서 강조한 운영 원칙

1. Trust Insights는 authentication replacement가 아니다.
2. Social engineering과 coercion이라는 다른 threat dimension을 다룬다.
3. Behavioral context는 privacy-preserving 방식으로 처리된다.
4. Device-sourced raw signal은 device에 남는다.
5. Photos, Messages, Mail content는 분석하지 않는다.
6. 사용자는 Settings에서 기능을 제어할 수 있다.
7. Authorization을 항상 확인한다.
8. Evaluation은 수 초 걸릴 수 있다.
9. Internet reachability가 필요하다.
10. `unknown`은 low risk가 아니다.
11. Trust Insight만으로 operation을 차단하지 않는다.
12. Existing risk logic에 결합한다.
13. Evaluation-level과 insight-level error를 모두 처리한다.
14. Real-time consumption feedback은 필수다.
15. Offline fraud feedback은 optional이지만 ecosystem 개선에 도움된다.
16. Model version sampling으로 새로운 model 영향을 검증할 수 있다.

---

# 핵심 메시지

Trust Insights는 “사용자가 올바르게 인증되었는가?”에서 한 단계 더 나아가 **“사용자가 지금 자유로운 의사로 이 행동을 하고 있는가?”**라는 질문에 필요한 behavioral context를 제공한다.

Social engineering은 정상 credential, 정상 device, 정상 biometric authentication을 그대로 통과할 수 있기 때문에 기존 보안 체계만으로는 탐지하기 어렵다.

Trust Insights는 이 공백을 메우지만, 결과를 절대적인 fraud verdict로 제공하지 않는다.

앱은 `unknown`, `medium`, `high`라는 고수준 signal을 기존 risk logic에 결합하고, warning, delay, additional verification, manual review 같은 intervention을 상황에 맞게 선택해야 한다.

특히 다음 세 가지 원칙이 가장 중요하다.

```text
unknown ≠ low risk
Trust Insight ≠ sole decision factor
Evaluation → reportConsumption까지가 하나의 lifecycle
```

Privacy 측면에서는 device-derived behavioral data를 local에서 처리하고 input을 즉시 폐기하며, Photos, Messages, Mail의 content를 분석하지 않는다.

운영 측면에서는 model version sampling과 feedback loop를 통해 새로운 모델의 영향을 검증하고, 가능하면 나중에 fraud로 확인된 transaction의 offline label까지 Apple Business Register를 통해 제공할 수 있다.

결과적으로 Trust Insights는 기존 authentication, fraud detection, App Attest와 경쟁하는 기능이 아니라, 기존 security stack이 다루기 어려웠던 **human coercion과 real-time social engineering**이라는 새로운 threat layer를 보완하는 프레임워크다.

---

# 함께 보면 좋은 세션과 자료

- Secure your apps with App Attest — WWDC26
- Trust Insights developer documentation
- Apple Business Register / Partner Data Services
- Feedback Assistant
