# WWDC26 Improve your prompts by hill-climbing with Evaluations 요약

- Session: 335
- Title: Improve your prompts by hill-climbing with Evaluations
- Source: https://developer.apple.com/videos/play/wwdc2026/335/
- Topic: Evaluations framework, Prompt Engineering, Model-as-Judge, Cohen's Kappa, Comparative Evaluation, Few-shot Examples, Tools
- Chapters: Introduction, BookTracker's tagging problem, Analyzing the evaluation results, Drift between judge and human, Measuring drift with Cohen's kappa, Building a judge alignment evaluation, Analyzing alignment failures, Comparative evaluation: control vs experimental, Refining the scoring dimensions, Adding few-shot examples to the judge, Going beyond prompts: adding a tool, Next steps

---

## 한 줄 요약

Evaluations의 **hill-climbing**은 `개발 → 평가 실행 → 결과 분석`을 반복하면서 intelligence-powered feature를 점진적으로 개선하는 과정이며, 좋은 실험처럼 **한 번에 하나의 변수만 바꾸고**, model judge와 human expert 사이의 **drift를 Cohen's kappa로 측정·보정**한 뒤, prompt·score dimension·few-shot example·tool 같은 변경을 baseline과 experimental evaluation으로 비교해 품질을 끌어올리는 것이 핵심이다.

---

## 핵심 요약

이번 세션은 이미 Evaluation pipeline을 만든 상태에서 그 평가 결과를 이용해 실제 기능을 체계적으로 개선하는 방법을 다룬다.

핵심 흐름:

```text
Develop
  ↓
Run Evaluation
  ↓
Pass expectations?
  ↓
Analyze
  ↓
One controlled change
  ↓
다시 Evaluation
```

중요한 포인트:

- **Hill-climbing**
  - Evaluation score를 방향표로 사용해 기능을 반복 개선
  - 성공한 실험뿐 아니라 실패한 실험도 정보가 됨
  - 한 번에 하나의 변수만 바꿔야 원인을 해석할 수 있음

- **Model judge drift**
  - Model judge와 human expert가 같은 output을 다르게 평가하는 현상
  - Dataset이 커질수록 judge를 신뢰하려면 alignment를 따로 검증해야 함

- **Cohen's kappa**
  - 단순 accuracy가 우연한 일치를 과대평가하는 문제를 보완
  - Expert score와 judge score의 agreement를 측정
  - 세션에서는 0.6을 meaningful agreement의 기대값으로 설정

- **Comparative Evaluation**
  - Baseline = control group
  - Experimental = 하나의 변경만 포함한 experimental group
  - Xcode 27 evaluation report의 comparison view에서 두 결과를 side-by-side 비교

- **Prompt 개선 순서**
  1. Judge prompt에 더 많은 context 제공
  2. Score dimension description을 더 구체화
  3. 소수의 few-shot worked example 추가
  4. Alignment 기준을 넘으면 judge calibration 완료

- **Prompt 밖의 hill-climbing**
  - Feature에 tool을 추가해 더 많은 context 제공
  - Tool이 있는 버전과 없는 버전을 같은 Evaluation 구조로 비교

---

# 🧗 Hill-climbing이란?

Apple은 hill-climbing을 **evaluation score를 가이드로 사용해 intelligence-powered feature를 반복적으로 개선하는 과정**으로 설명한다.

세 단계로 볼 수 있다.

```text
Develop
- Feature 또는 Evaluation에 변경

Run
- Evaluation 실행
- Expectations 통과 여부 확인

Analyze
- 실패/차이를 자세히 분석
- 다음 변경점 결정
```

세션은 이 과정을 과학 실험처럼 다루라고 강조한다.

핵심 원칙:

> 한 번의 iteration에서는 가능한 한 하나의 변수만 변경한다.

그래야 결과가 좋아지거나 나빠졌을 때 무엇이 영향을 주었는지 알 수 있다.

---

# 📚 Book Tracker의 Tagging 문제

예제 앱 Book Tracker는 사용자가 작성한 book review를 기반으로 model이 tag를 생성한다.

문제 사례:

- `Treasure Island`
  - 전체 theme는 어느 정도 잡았지만 `tense`, `morally grey`처럼 story의 성격을 나타내는 tag가 부족

- `Little Women`
  - `poignant`처럼 reader의 감정에 가까운 표현이 포함
  - `quiet-steadiness`처럼 review 문구에서 직접 가져온 지나치게 구체적인 표현은 library search term으로 유용하지 않음

즉 tag generator의 문제는 크게 두 축이다.

```text
Relevance
→ Book 자체를 잘 설명하는가?

Usefulness
→ Library search/browse term으로 유용한가?
```

---

# 🧪 기존 BookTaggingEvaluation

Evaluation은 dataset, subject, evaluator, aggregate metric으로 구성된다.

세션의 기본 구조:

```swift
struct BookTaggingEvaluation: Evaluation {
    func subject(
        from sample: ModelSample<BookTags>
    ) async throws -> ModelSubject<BookTags> {
        let result = try await BookTaggingService.generateTags(
            for: sample.promptDescription
        )
        return ModelSubject(value: result)
    }

    var dataset = ArrayLoader(
        samples: Book.sampleBooks.map { book in
            ModelSample(
                prompt: book.review,
                expected: BookTags(tags: book.tags)
            )
        }
    )
}
```

Evaluation에는 heuristic metric과 qualitative judge가 함께 있다.

예:

- Tag count가 3~8개인지
- Genre tag가 있는지
- Duplicate가 없는지
- Relevance
- Usefulness

---

# 🎚️ ScoreDimension

Qualitative score는 `ScoreDimension`으로 정의한다.

세션의 초기 Relevance 정의는 대략 다음 의미를 가진다.

```text
4 → 모든 tag가 book 자체를 설명
3 → 대부분 적절, 한두 개 minor issue
2 → 대부분 surface detail 또는 reader reaction
1 → Book을 의미 있게 설명하지 못함
```

Usefulness는 tag가 browse/search granularity에 맞는지를 본다.

```text
4 → 여러 책을 묶으면서도 검색 범위를 잘 줄임
3 → 대부분 적절, 하나 정도 너무 넓거나 좁음
2 → 대부분 너무 넓거나 너무 좁음
1 → Browsing에 도움되지 않음
```

---

# 🤖 ModelJudgeEvaluator

`ModelJudgeEvaluator`는 score dimensions와 prompt를 이용해 model output을 평가한다.

예제 구조:

```swift
ModelJudgeEvaluator(
    judge: .default,
    dimensions: [relevance, usefulness],
    prompt: ModelJudgePrompt(
        instructions: """
        You are evaluating automatically generated tags...
        """,
        evaluationTarget: { output in
            output.tags.joined(separator: ", ")
        }
    )
)
```

이 judge가 생산한 score를 human expert의 판단과 비교하는 것이 이번 세션의 핵심 출발점이다.

---

# ✅ 테스트는 통과했는데 결과는 마음에 들지 않는 경우

`Treasure Island`와 `Little Women`을 dataset에 추가하고 Evaluation을 실행한다.

Swift Testing의 `#expect` 기준은 모두 통과한다.

하지만 실제 결과를 사람이 보면 tag 품질은 만족스럽지 않다.

이것은 중요한 신호다.

```text
Automated Expectations: Pass
Human Review: Not Good Enough
```

즉 현재 Evaluation이 실제 원하는 품질을 충분히 반영하지 못하고 있을 수 있다.

---

# 🔍 Xcode Evaluation Report 분석

Xcode의 evaluation report에서 다음을 확인한다.

- Aggregate metric chart
- Result table
- Assistant Editor의 sample detail
- Expected tags와 generated tags
- Judge score

`Treasure Island`에서 human과 judge의 평가:

```text
Human
Relevance  = 4
Usefulness = 2

Model Judge
Relevance  = 4
Usefulness = 4
```

`Little Women`에서도 같은 pattern이 나타난다.

즉 judge가 usefulness를 human보다 높게 평가하는 경향이 있다.

---

# 🌫️ Drift

Model judge와 human expert의 score가 벌어지는 현상을 세션에서는 **drift**라고 부른다.

예:

```text
Sample 1 → Human 2 / Judge 4
Sample 2 → Human 3 / Judge 4
Sample 3 → Human 2 / Judge 3
...
```

Dataset이 커지면 이 차이가 aggregate score에도 누적된다.

문제:

> Judge가 실제 human standard와 맞지 않으면 Evaluation score 자체를 신뢰할 수 없다.

따라서 feature를 평가하기 전에 judge를 expert opinion에 맞춰야 한다.

---

# 📊 Accuracy만으로는 부족한 이유

가장 단순한 alignment metric은 두 raters가 같은 값을 준 비율이다.

```text
Accuracy
= 두 평가자가 동일 score를 준 비율
```

하지만 score distribution이 불균형하면 accuracy가 misleading할 수 있다.

예를 들어 dataset에 high-quality output이 많으면 human도 high score를 자주 준다.

Judge가 단순히 high score를 자주 주는 성향을 가져도 우연히 많은 sample에서 human과 일치할 수 있다.

따라서 **우연히 일치할 확률을 보정하는 metric**이 필요하다.

---

# 📐 Cohen's Kappa

세션은 judge와 expert의 alignment를 측정하기 위해 Cohen's kappa를 사용한다.

개념적으로:

```text
Observed Agreement
      ↓
우연한 Agreement를 제외
      ↓
Chance-corrected Agreement
```

세션 설명을 식으로 표현하면:

```text
Kappa
= (Accuracy - Chance Agreement)
  / (1 - Chance Agreement)
```

즉 단순 accuracy보다 **우연히 같은 점수를 준 경우를 보정한 agreement**를 측정한다.

---

# 🧪 Judge Alignment Evaluation 만들기

Judge calibration도 하나의 독립 Evaluation으로 만든다.

필요한 네 부분:

```text
Dataset
Subject
Evaluators
Aggregation
```

---

# 📦 Alignment Dataset

Judge와 human이 정확히 같은 output을 평가해야 한다.

기존 BookTaggingEvaluation 실행 결과에는 Xcode attachment로 Evaluation data가 저장된다.

그 attachment에서 다음 pair를 추출한다.

```json
{
  "input": "Book review...",
  "response": "[generated tags...]"
}
```

여기에 expert rating을 추가해 calibration dataset으로 사용한다.

중요:

> Judge calibration에서는 feature를 다시 실행하지 않고 이미 생성한 같은 response를 human과 judge가 평가한다.

---

# 🎯 Alignment Evaluation의 Subject

Generated response 자체가 dataset에 있으므로 subject에서는 API를 다시 호출할 필요가 없다.

```swift
func subject(
    from sample: ModelSample<BookTagJudgmentValue>
) async throws -> ModelSubject<BookTagJudgmentValue> {
    ModelSubject(
        value: sample.expected ?? BookTagJudgmentValue(
            tags: [],
            expertRelevanceScore: 0,
            expertUsefulnessScore: 0
        )
    )
}
```

---

# 📈 Custom Aggregation

Aggregation 단계에서는 judge score와 expert score의 Cohen's kappa를 계산한다.

세션 코드 구조:

```swift
func aggregateMetrics(
    using aggregator: inout MetricsAggregator
) {
    aggregator.group("Relevance") { group in
        group.computeMean(of: relevance.metric)
        group.computeStandardDeviation(of: relevance.metric)
        group.custom(
            of: relevance.metric,
            label: "Relevance Alignment Score"
        ) { judge in
            cohensKappa(
                ratings1: expertRelevance,
                ratings2: judge
            ) ?? 0
        }
    }
}
```

함께 계산하는 값:

- Mean
- Standard deviation
- Cohen's kappa alignment score

Mean/standard deviation은 judge score가 전반적으로 높아지는지 낮아지는지도 파악하게 해준다.

---

# 🎯 Alignment Expectation

세션에서는 judge calibration test에 다음 expectation을 둔다.

```swift
#expect(
    result.aggregateValue(
        .custom(label: "Relevance: Judge vs Expert")
    ) > 0.6
)

#expect(
    result.aggregateValue(
        .custom(label: "Usefulness: Judge vs Expert")
    ) > 0.6
)
```

세션에서는 `0.6`을 meaningful level of agreement의 기준으로 선택한다.

첫 실행 결과는 이 기대값을 통과하지 못한다.

즉 judge가 아직 human standard와 정렬되지 않았다.

---

# 🔎 Alignment 실패 분석

Evaluation report에서 sample별 차이를 확인한다.

## Frankenstein

Judge는 다음 tag를 story와 관련 있다고 판단한다.

- self-help
- self-improvement

하지만 human expert는 적절하지 않다고 본다.

## Ramakien

Relevance는 judge와 human이 대체로 동의한다.

하지만 usefulness에서 차이가 난다.

예:

- visual-dimension
- quaint-dignity

너무 구체적이어서 library search term으로는 적절하지 않다.

분석 결과:

> Judge prompt가 좋은 tag와 나쁜 tag를 구분할 충분한 context를 제공하지 않는다.

---

# 🧪 Comparative Evaluation

Xcode 27에서는 두 Evaluation 결과를 직접 비교할 수 있다.

Apple은 이를 science experiment처럼 설명한다.

```text
Control Group
= Baseline Evaluation

Experimental Group
= 하나의 변경을 적용한 Evaluation
```

핵심 원칙:

> 두 Evaluation 사이의 차이는 단 하나여야 한다.

그래야 score 변화의 원인을 설명할 수 있다.

---

# 📝 첫 번째 실험: Judge Prompt에 Context 추가

Baseline은 기존 prompt를 그대로 사용한다.

Experimental prompt에는 다음을 더 명확히 설명한다.

- Book Tracker가 어떤 앱인지
- Judge가 무엇을 평가하는지
- 좋은 tag의 예
- 나쁜 tag의 패턴

예제 prompt의 구조:

```text
You are an experienced reader and librarian...

What a good tag looks like
- Genre/form
- Theme/subject
- Tone/atmosphere
- Setting/era

Common failure modes
- Reader reactions
- Meta commentary
- Author facts
- Genre contradictions
```

---

# 📉 첫 번째 비교 결과

Experimental prompt 실행 후:

```text
Relevance alignment ↑
Usefulness alignment ↓
```

즉 하나의 dimension은 좋아졌지만 다른 dimension은 더 나빠졌다.

세션은 이런 tradeoff가 실제 hill-climbing에서 흔하다는 점을 보여준다.

중요:

> 모든 변경이 모든 metric을 동시에 개선하지 않는다.

---

# ↔️ Xcode Comparison View

Evaluation report의 comparison 기능으로 baseline과 experimental result를 side-by-side로 본다.

`Picture of Dorian Gray` sample에서는 experimental judge의 usefulness score가 전반적으로 2 또는 3에 몰려 있다.

분석:

> Experimental judge가 usefulness에 지나치게 harsh하다.

따라서 다음 iteration은 prompt 전체가 아니라 **score dimension definition**을 개선한다.

---

# 🎚️ 두 번째 실험: Score Dimension을 더 구체화

공정한 비교를 위해 직전 experimental prompt를 baseline에 먼저 반영한다.

즉 다음 비교에서 바뀌는 변수는 score dimension description 하나다.

Refined relevance:

- Genre, themes, tone, setting 등 **book 자체**를 설명해야 함
- Reader reaction, review meta-commentary, author facts는 제외
- Genre mislabeling은 serious failure

Refined usefulness:

- 여러 book이 공유할 수 있을 만큼 넓어야 함
- Search를 좁힐 만큼 구체적이어야 함
- Standard genre/theme는 적절
- Made-up phrase, character name, hyper-specific descriptor, 지나치게 generic한 word는 부적절

---

# 📈 Score Dimension 개선 결과

새 score dimension으로 다시 실행한다.

결과:

```text
Relevance alignment ↑↑
Usefulness alignment ↑↑
```

Baseline보다 크게 개선된다.

하지만 아직 expectation threshold를 완전히 넘지는 못한다.

따라서 다음 iteration으로 넘어간다.

---

# 🎯 세 번째 실험: Few-shot Worked Examples

`Moby Dick`에서는 relevance가 많이 맞아가지만 usefulness는 여전히 개선 여지가 있다.

`Frankenstein`은 계속 judge가 어려워한다.

분석:

> Judge가 human expert가 실제로 어떻게 점수를 주는지 pattern을 직접 봐야 한다.

그래서 prompt에 few-shot worked example을 추가한다.

---

# 🧩 Worked Example 구조

세션 코드 예:

```text
Example A — clean fit (Pride and Prejudice)
Tags:
romance, historical-fiction, love, redemption, passion

Librarian:
Relevance 4
Usefulness 4

Example E — genre contradiction (Frankenstein)
Tags:
horror, science-fiction, ..., self-help, self-improvement

Librarian:
Relevance 2
Usefulness 3
```

Judge에게 human rating pattern을 직접 보여준다.

---

# ⚠️ Few-shot Example을 너무 많이 넣지 않는다

세션은 worked example을 **소수만** 제공한다.

이유:

> Example을 너무 많이 주면 현재 calibration dataset에 overfit할 수 있다.

Overfit된 judge는 alignment score는 높지만 새로운 sample에서 실제 human standard를 잘 일반화하지 못할 수 있다.

따라서 example 수를 제한한다.

---

# ✅ Judge Alignment 통과

Few-shot example까지 반영한 뒤 Evaluation을 다시 실행한다.

결과:

```text
Relevance alignment > expected threshold
Usefulness alignment > expected threshold
```

이제 test가 통과한다.

의미:

> Model judge가 human expert의 scoring 기준과 충분히 정렬되었으므로 이후 Book Tagging Service 평가에 신뢰할 수 있는 evaluator로 사용할 수 있다.

---

# 🔁 Prompt Hill-climbing 전체 흐름

```text
Initial Judge
   ↓
Drift 발견
   ↓
Cohen's Kappa baseline
   ↓
Prompt Context 추가
   ↓
Relevance ↑ / Usefulness ↓
   ↓
Score Dimension 구체화
   ↓
둘 다 크게 개선
   ↓
Few-shot Examples 추가
   ↓
Alignment threshold 통과
```

---

# 🧰 Prompt 밖의 Hill-climbing

Hill-climbing은 prompt만 바꾸는 것이 아니다.

세션은 feature 자체에 **Tool**을 추가한다.

Book Tracker는 on-device model을 사용한다.

이유:

- 사용자가 어디서든 book을 catalog할 수 있음
- Network가 없어도 tag generation 가능

하지만 review만으로는 book context가 부족할 수 있다.

Book Tracker는 이미 다음 정보를 저장한다.

- Book title
- Author

이를 활용하기 위해 lookup tool을 추가한다.

---

# 🔎 `BookLookupTool`

Tool의 역할:

> Review 안의 character, setting, quote, plot point 같은 distinguishing detail을 이용해 book title과 author를 찾는다.

구조:

```swift
struct BookLookupTool: Tool {
    let name = "lookupBook"

    @Generable
    struct Arguments {
        var details: String
    }

    @Generable
    struct Output {
        var title: String
        var author: String
    }

    func call(
        arguments: Arguments
    ) async throws -> Output {
        // Matching logic
    }
}
```

Tool이 추가 context를 제공하면 tag generator가 더 relevant/useful한 결과를 만들 수 있을지 평가한다.

---

# 🧩 BookTaggingService에 Tools Parameter 추가

기존 call site를 깨지 않도록 default는 빈 배열이다.

```swift
struct BookTaggingService {
    static func generateTags(
        for review: String,
        tools: [any Tool] = []
    ) async throws -> BookTags {
        let session = LanguageModelSession(
            model: SystemLanguageModel(
                guardrails: .permissiveContentTransformations
            ),
            tools: tools,
            instructions: instructions
        )

        let response = try await session.respond(
            to: tagsPrompt(review: review),
            generating: BookTags.self
        )

        return response.content
    }
}
```

이제 같은 service를 tool 없이도, tool과 함께도 실행할 수 있다.

---

# 🧪 Tool 유무 비교 Evaluation

Baseline:

```text
BookTaggingService
Tools = []
```

Experimental:

```text
BookTaggingService
Tools = [BookLookupTool()]
```

Evaluation 구조는 거의 동일하다.

차이:

```swift
let result = try await BookTaggingService.generateTags(
    for: sample.promptDescription,
    tools: [BookLookupTool()]
)
```

두 Evaluation을 같은 test suite에 넣어 비교한다.

---

# ✅ Tool 추가 결과

Tool을 사용하는 service는 모든 expectation을 통과한다.

또 evaluation result에서도 tool을 사용하는 version이 더 좋은 성능을 보인다.

하지만 세션은 여기서 바로 ship 판단을 끝내지 않는다.

두 가지 한계를 발견한다.

---

# ⚠️ 한계 1: Dataset이 너무 작다

Book Tracker의 dataset에는 **13개의 book/review pair**만 있다.

문제:

> 실제 사용자가 입력할 수 있는 매우 다양한 book/review pattern을 충분히 커버하지 못한다.

즉 expectation을 통과해도 dataset coverage가 좁으면 confidence는 제한된다.

---

# ⚠️ 한계 2: Tool Call이 적절한 상황에서 호출됐는가?

Tool이 있는 version의 결과는 더 좋아졌지만 tool이 필요한 모든 상황에서 호출되고 있는지는 확신할 수 없다.

다음 질문이 남는다.

```text
Tool이 너무 적게 호출되는가?
Tool이 필요 없는 곳에서 호출되는가?
필요한 sample을 dataset이 포함하고 있는가?
```

이 문제는 별도 세션 **Create robust evaluations for agentic apps**에서 다룬다.

연결되는 기능:

- Tool call evaluators
- Sample Generator API

---

# 🧠 Hill-climbing에서 바꿀 수 있는 것

세션 마지막에 Apple은 거의 모든 요소가 실험 대상이라고 정리한다.

## Feature 쪽

- Instructions
- Tools
- Model / Models

## Evaluation 쪽

- Dataset
- Aggregation method
- Evaluators

즉 prompt engineering은 hill-climbing의 한 부분일 뿐이다.

---

# 🧪 Scientific Thinking 원칙

이번 세션의 핵심 철학은 Evaluation을 science experiment처럼 다루는 것이다.

## 하나씩 바꾼다

```text
Bad Experiment
Prompt + Model + Dataset 동시에 변경
→ 무엇이 영향을 줬는지 모름

Good Experiment
Prompt만 변경
→ 결과 차이의 원인을 해석 가능
```

## 실패도 정보다

모든 변화가 score를 올리는 것은 아니다.

하지만 score가 나빠진 이유를 분석하면 다음 iteration의 방향을 찾을 수 있다.

## 비교 가능한 Baseline을 유지한다

새 experiment 전에 직전 winner를 baseline으로 승격한다.

그래야 항상:

```text
Current Best
vs
One New Change
```

구조를 유지할 수 있다.

---

# 🌫️ Evaluator도 평가해야 한다

AI feature의 품질을 model judge로 평가한다면 judge 자체도 calibration이 필요하다.

```text
Feature Output
      ↓
Model Judge
      ↓
Evaluation Score
```

Judge가 drift하면 마지막 score가 의미를 잃는다.

따라서:

```text
Human Expert Rating
        ↕
Model Judge Rating
        ↓
Alignment Evaluation
```

을 별도로 운영한다.

세션은 이를 다소 meta하게 느낄 수 있지만 장기적으로는 큰 시간을 절약한다고 설명한다.

Model judge는 human보다 훨씬 빠르게 대량의 sample을 평가할 수 있기 때문에, 한번 잘 alignment해두면 dataset이 커질수록 가치가 커진다.

---

# 📋 체크리스트

## Hill-climbing 시작 전

- [ ] 기존 Evaluation pipeline이 있는지 확인
- [ ] Dataset이 feature의 핵심 사용 사례를 포함하는지 확인
- [ ] Subject가 실제 feature path를 호출하는지 확인
- [ ] Evaluator와 aggregate metric 정의
- [ ] Swift Testing expectation 정의
- [ ] 현재 version의 baseline result 저장

## Analysis

- [ ] Aggregate chart 확인
- [ ] Sample-level result 확인
- [ ] Assistant Editor로 expected/generated output 비교
- [ ] Human score와 judge score 비교
- [ ] Relevance/usefulness 같은 qualitative dimension별 차이 확인
- [ ] 실패 sample의 공통 pattern 분류

## Judge Drift

- [ ] Human expert rating 확보
- [ ] Judge가 같은 exact output을 평가하도록 dataset 구성
- [ ] 단순 accuracy만 보지 않기
- [ ] Cohen's kappa 계산
- [ ] Mean과 standard deviation도 함께 확인
- [ ] Alignment threshold expectation 설정
- [ ] Judge calibration을 별도 Evaluation으로 관리

## Comparative Evaluation

- [ ] Baseline 정의
- [ ] Experimental version 정의
- [ ] 두 version의 차이를 하나만 유지
- [ ] 동일 dataset 사용
- [ ] 동일 aggregation/evaluator 사용
- [ ] Xcode comparison view로 side-by-side 확인
- [ ] Tradeoff가 있는 dimension을 분리해 분석

## Prompt 개선

- [ ] App context를 충분히 설명
- [ ] Judge가 무엇을 평가하는지 명시
- [ ] Good output의 조건 정의
- [ ] Failure mode 정의
- [ ] Score dimension description을 구체화
- [ ] 각 score level의 의미를 명확히 정의
- [ ] Few-shot example은 소수만 사용
- [ ] Calibration dataset overfitting을 피하기

## Tool Experiment

- [ ] Tool 추가 전 baseline 평가
- [ ] Service API에 tools parameter 추가
- [ ] Default 빈 배열로 기존 behavior 유지
- [ ] Tool 포함 Evaluation 별도 작성
- [ ] 동일 dataset에서 with/without 비교
- [ ] Quality metric 개선 확인
- [ ] Tool이 필요한 상황에서 실제 호출되는지 추가 평가

## Dataset Coverage

- [ ] Sample 개수만으로 confidence를 과대평가하지 않기
- [ ] 다양한 book/review pattern 포함
- [ ] Edge case 추가
- [ ] Common failure pattern 포함
- [ ] Agentic feature라면 tool call scenario 포함
- [ ] 필요하면 Sample Generator API 검토

---

# ⚠️ 자주 발생할 수 있는 문제

## Test Pass = Feature가 충분히 좋다는 뜻은 아니다

Book Tracker의 첫 Evaluation은 모든 expectation을 통과했지만 human review에서는 품질 부족이 분명했다.

Expectation과 evaluator 자체를 계속 검증해야 한다.

## Judge score를 ground truth처럼 취급하지 않는다

Model judge도 틀릴 수 있다.

Human expert와의 alignment를 측정해야 한다.

## Accuracy만으로 Judge Alignment를 판단하지 않는다

Score distribution이 불균형하면 우연한 agreement를 과대평가할 수 있다.

세션에서는 Cohen's kappa를 사용한다.

## 여러 변수를 동시에 바꾸지 않는다

Prompt와 score dimension을 동시에 바꾸면 어느 쪽이 개선을 만든 것인지 알 수 없다.

## Few-shot Example을 너무 많이 넣지 않는다

Calibration set에 overfit할 위험이 있다.

## Prompt만 계속 고치지 않는다

때로는 더 좋은 context를 제공하는 tool, 다른 model, dataset 변경, evaluator 변경이 더 효과적일 수 있다.

---

# 🧩 주요 API / 개념 정리

| API / 개념 | 역할 |
|---|---|
| `Evaluation` | Dataset, subject, evaluators, aggregation으로 평가 구성 |
| `ModelSample` | Prompt/expected value를 포함한 sample |
| `ModelSubject` | 평가 대상 feature output |
| `Metric` | 정량 metric |
| `ScoreDimension` | Qualitative scoring dimension |
| `ModelJudgeEvaluator` | Model-as-judge evaluator |
| `ModelJudgePrompt` | Judge instruction과 평가 target/reference 정의 |
| `MetricsAggregator` | Mean, stddev, custom aggregate 계산 |
| `#expect` | Swift Testing expectation |
| Xcode Evaluations Report | Aggregate/sample result 분석 |
| Comparison View | Baseline과 experimental evaluation 비교 |
| Cohen's kappa | Human과 judge의 chance-corrected alignment |
| `Tool` | Intelligence feature에 추가 context/ability 제공 |
| `LanguageModelSession` | Tools를 포함한 model session |

---

# 🔁 전체 Workflow

```text
Feature Evaluation 구축
        ↓
Baseline 실행
        ↓
Human Review
        ↓
Judge Drift 발견
        ↓
Expert Rating Dataset 생성
        ↓
Judge Alignment Evaluation
        ↓
Cohen's Kappa 측정
        ↓
Prompt Context 개선
        ↓
Comparative Evaluation
        ↓
Score Dimension 개선
        ↓
Comparative Evaluation
        ↓
Few-shot Example 추가
        ↓
Alignment Threshold 통과
        ↓
Calibrated Judge로 Feature 평가
        ↓
Tool 추가 실험
        ↓
With / Without 비교
        ↓
Dataset Coverage / Tool Usage 평가로 확장
```

---

# 🎯 이번 세션의 핵심 실험 순서

| 단계 | 변경 | 결과 |
|---|---|---|
| Baseline | 초기 judge prompt | Human과 usefulness drift 큼 |
| Alignment baseline | Cohen's kappa 측정 | Expectation 0.6 미달 |
| Experiment 1 | Judge prompt context 강화 | Relevance 개선, Usefulness 악화 |
| Experiment 2 | Score dimension 구체화 | 두 dimension 크게 개선 |
| Experiment 3 | Few-shot worked examples | Alignment threshold 통과 |
| Feature experiment | BookLookupTool 추가 | Tool 사용 version이 expectations 통과 |
| Next problem | Dataset 13개, tool call coverage 부족 | Robust agentic evaluation 필요 |

---

# 핵심 메시지

이번 세션의 가장 중요한 메시지는 “좋은 prompt를 쓰는 방법” 자체보다 **prompt를 개선하는 과정을 측정 가능한 실험으로 만드는 방법**이다.

Hill-climbing은 단순 반복 수정이 아니다.

```text
Current Best
      ↓
One Controlled Change
      ↓
Evaluation
      ↓
Comparison
      ↓
Analysis
      ↓
Keep or Reject
```

그리고 이 loop가 믿을 만하려면 evaluator가 믿을 만해야 한다.

Model judge가 human expert와 drift하고 있다면 feature score도 잘못된 방향을 가리킬 수 있다.

그래서 Book Tracker 예제는 feature를 개선하기 전에 judge 자체의 calibration evaluation을 만든다.

Cohen's kappa로 judge와 expert의 alignment를 측정하고, prompt context → refined score dimensions → few-shot examples 순으로 한 번에 하나씩 바꾸며 alignment를 높인다.

이 과정에서 한 metric은 좋아지고 다른 metric은 나빠질 수 있다. 그 실패 자체가 다음 실험을 설계하는 정보가 된다.

Judge가 충분히 alignment된 뒤에는 prompt만 바꾸지 않고 feature architecture 자체도 실험한다.

BookLookupTool을 추가해 model이 book title과 author context를 얻도록 만들고, tool이 없는 baseline과 tool이 있는 experimental feature를 동일한 Evaluation으로 비교한다.

세션의 최종 원칙은 다음 네 가지로 정리할 수 있다.

```text
1. 한 번에 하나만 바꾼다.
2. 실패한 실험도 학습 신호로 사용한다.
3. Prompt뿐 아니라 tool, model, dataset, evaluator도 실험한다.
4. Model judge의 drift를 계속 감시한다.
```

Evaluation을 test gate로만 쓰는 것이 아니라 **intelligence feature를 지속적으로 hill-climb하기 위한 개발 도구**로 사용하라는 것이 이번 세션의 핵심이다.

---

# 함께 보면 좋은 세션과 자료

- Meet the Evaluations framework — WWDC26
- Create robust evaluations for agentic apps — WWDC26
- Book Tracker: Using Evaluations to evaluate an intelligent feature
- Designing effective model-as-judge evaluators
- Designing specific, measurable criteria in an evaluation suite
