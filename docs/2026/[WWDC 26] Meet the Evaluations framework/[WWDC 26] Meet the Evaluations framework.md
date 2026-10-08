# WWDC26 Meet the Evaluations framework 요약

- Session: 298
- Title: Meet the Evaluations framework
- Source: https://developer.apple.com/videos/play/wwdc2026/298/
- Topic: Evaluations, Foundation Models, generative AI testing, Swift Testing, Metrics, Evaluators, Model Judge, ScoreDimension, hill-climbing, evaluation-driven development
- Chapters: Introduction, Manual evaluation, Building your first evaluation, Running and reading reports, Robust datasets, Refining metrics, Hill-climbing, Model judges, Score dimensions, Best practices

---

## 한 줄 요약

`Evaluations` framework는 생성형 AI처럼 **같은 입력에도 다른 출력이 나오는 확률적 기능을 기존 unit test만으로 검증할 수 없다는 문제를 해결**하기 위해, 데이터셋·정량/정성 metric·aggregate statistics·model judge를 하나의 Swift-native 평가 시스템으로 묶고, 이를 Swift Testing과 연결해 **evaluation-driven development**를 가능하게 한다.

---

## 핵심 요약

Apple이 이번 세션에서 강조하는 출발점은 단순하다.

전통적인 software는 보통 다음 계약을 전제로 테스트할 수 있다.

```text
Same Input
   ↓
Same Output
```

하지만 생성형 AI 기반 기능은 같은 입력에도 결과가 달라질 수 있다.

```text
Same Input
   ↓
Probabilistic Output
```

따라서 unit test만으로는 충분하지 않다.

Evaluations framework는 다음 질문에 답하기 위한 도구다.

- 얼마나 자주 예상 밖의 결과가 나오는가?
- agent가 얼마나 자주 예상하지 못한 경로를 선택하는가?
- 어떤 조건에서 unsafe 결과가 나오는가?
- 기능이 우리가 원하는 품질 기준을 실제로 만족하는가?

Framework는 language model 기반 기능뿐 아니라 classifier, linear regression 같은 다른 stochastic system에도 사용할 수 있다.

---

# 🧪 왜 Unit Test만으로 부족한가

기존 테스트는 deterministic behavior를 가정한다.

```swift
let output = function(input)
#expect(output == expected)
```

이 방식은 동일한 입력에서 동일한 출력이 보장될 때 강력하다.

하지만 generative AI에서는 결과가 확률적이기 때문에 다음과 같은 질문이 더 중요해진다.

```text
정답인가?
    ↓
얼마나 자주 기대를 만족하는가?
```

즉 single-output correctness가 아니라 **distribution과 frequency를 측정**해야 한다.

---

# 📚 Demo: Book Tracker

세션의 예제 앱은 `Book Tracker`다.

`BookTaggingService`는 사용자가 작성한 review를 바탕으로 책에 tag를 자동 생성한다.

처음 `#Playground`에서 결과를 확인했을 때 다음 문제가 발견된다.

- Tag 수가 너무 많음
- Book title 자체가 tag로 등장
- Multi-word tag가 UI에 부적합
- Genre는 잘 잡히는 경우도 있음
- Browsing에 유용한 category를 잘 생성하기도 함

이 단계는 사람이 직접 결과를 보고 기대 조건을 정의하는 **manual evaluation**이다.

---

# 🧠 Evaluation의 본질

Apple은 evaluation을 다음처럼 설명한다.

> Intelligent feature가 우리의 expectation을 얼마나 잘 만족하는지 측정하는 것

즉 먼저 expectation을 명시해야 한다.

예:

- Tag는 3~8개여야 함
- Multi-word tag는 없어야 함
- Genre가 포함되어야 함
- Reader의 개인 감정이 아니라 책 자체를 설명해야 함
- Library browsing에 유용해야 함

문제는 human judgment가 scale하지 않는다는 것이다.

그래서 Evaluations framework가 이 과정을 자동화한다.

---

# 🏗️ Evaluation을 만드는 5단계

세션은 evaluation을 만드는 과정을 다섯 단계로 설명한다.

```text
1. 무엇을 측정할지 정의
2. 어떤 데이터를 넣을지 정의
3. 무엇을 어떻게 측정할지 정의
4. 측정 결과를 aggregate
5. Test에서 evaluation 실행
```

---

# ️⃣1 Subject 정의

먼저 `Evaluation` protocol을 구현한다.

```swift
import Evaluations

struct BookTaggingEvaluation: Evaluation {
}
```

그리고 평가 대상 코드를 `subject(from:)`에서 호출한다.

개념적으로:

```swift
func subject(from sample: ModelSample<...>) async throws -> BookTags {
    try await BookTaggingService.tags(for: sample.prompt)
}
```

이 반환값이 evaluation의 subject가 된다.

---

# ️⃣2 Dataset 정의

입력 데이터는 `ModelSample`로 감싼다.

```swift
var dataset = ArrayLoader(samples: [
    ModelSample(
        prompt: "...review...",
        expected: BookTags(tags: ["classic", "romance", "wit", "regency"])
    ),
    ModelSample(
        prompt: "...review...",
        expected: BookTags(tags: ["classic", "gothic", "horror", "vampire", "suspense"])
    )
])
```

`expected`는 ideal answer/reference 역할을 한다.

전체 library를 그대로 dataset으로 만들 수도 있다.

```swift
var dataset = ArrayLoader(samples:
    Book.sampleBooks.map { book in
        ModelSample(
            prompt: book.review,
            expected: BookTags(tags: book.tags)
        )
    }
)
```

---

# ️⃣3 Metric과 Evaluator

`Metric`은 **무엇을 측정하는지**를 이름 붙인다.

```swift
let tagCount = Metric("TagCount")
```

`Evaluator`는 sample 하나에 대해 실제 측정 logic을 수행한다.

```swift
Evaluator { _, subject in
    let count = subject.value.tags.count

    if count >= 3 && count <= 8 {
        return tagCount.passing(rationale: "\(count) tags")
    }

    return tagCount.failing(
        rationale: "Got \(count) tags, expected 3–8"
    )
}
```

핵심은 `Evaluator`가 **sample 하나씩** 실행된다는 점이다.

---

# ️⃣4 Aggregate Metrics

개별 sample 결과만 보면 trend를 놓칠 수 있다.

그래서 모든 sample 결과를 aggregate한다.

```swift
func aggregateMetrics(using aggregator: inout MetricsAggregator) {
    aggregator.computeMean(of: tagCount)
}
```

예를 들어 `TagCount` passing ratio를 계산하면:

```text
80% passing
```

같은 optimization target을 만들 수 있다.

---

# ️⃣5 Swift Testing으로 실행

Evaluations는 Swift Testing과 통합된다.

```swift
@Test(
    "Book Tag Evaluations",
    .evaluates(evaluation, info: evaluationInfo)
)
func evaluateBookTagging() async throws {
    let result = EvaluationContext.current.result
    let metric = BookTagEvaluationTests.evaluation.tagCount

    #expect(
        result.aggregateValue(.mean(of: metric)) >= 0.8
    )
}
```

여기서 `0.8`은 optimization target이다.

즉:

```text
Tag count rule을
최소 80%의 sample에서 만족해야 한다.
```

---

# 📊 Evaluation Report

실행 결과는 일반 test failure로 끝나지 않는다.

Xcode의 Evaluation report에서 다음을 볼 수 있다.

- Aggregate metric
- Per-sample result
- Prompt
- Measurements
- Full model response
- Rationale

예제에서는:

```text
Pride & Prejudice → Fail
Dracula           → Pass

TagCount mean → 50%
```

즉 optimization target 80%보다 낮아 test가 실패한다.

---

# 🧗 Hill-Climbing

Evaluation이 실패하면 다음은 단순 bug fix가 아니라 hypothesis-driven iteration이다.

예제에서는 `BookTags`의 `@Guide`에 count constraint를 추가한다.

```swift
@Generable
struct BookTags: Codable {
    @Guide(
        description: "Descriptive tags capturing themes, genres, moods, and topics from the summary",
        .count(3...8)
    )
    var tags: [String]
}
```

그 뒤 evaluation을 다시 실행한다.

이 반복을 Apple은 **hill-climbing**이라고 부른다.

```text
Measure
  ↓
Analyze
  ↓
Hypothesis
  ↓
Change
  ↓
Re-run
  ↓
Compare
```

---

# ⚠️ Pass했다고 끝이 아니다

Constraint를 추가한 뒤 TagCount pass rate는 100%가 된다.

하지만 모든 sample에서 정확히 8개의 tag가 생성되는 새로운 이상 행동이 발견된다.

즉:

```text
Target Pass == Feature Quality Complete
```

가 아니다.

이것이 evaluation에서 dataset과 metric을 계속 확장해야 하는 이유다.

---

# 🗃️ Robust Dataset

초기 dataset은 2개 sample뿐이었다.

Apple은 좋은 evaluation에는 **수천 개의 sample**이 필요할 수 있다고 설명한다.

Dataset에는 variety가 있어야 한다.

- Genre 다양성
- 짧은 review / 긴 review
- Fiction / Non-fiction
- Novel / Short story / Essay
- Personal opinion 포함
- Different writing style
- Adversarial / ambiguous phrasing

즉 dataset은 production input distribution을 최대한 반영해야 한다.

---

# 🌱 처음부터 수천 개가 필요한 것은 아니다

세션 마지막 best practice에서는 **20~30개의 focused sample로 시작**하라고 권장한다.

중요한 것은:

```text
Small but intentional
→ Learn
→ Expand
```

이다.

---

# 🧬 SampleGenerator

Human-authored dataset은 scale하기 어렵다.

Framework는 seed sample로부터 synthetic sample을 만드는 `SampleGenerator`를 제공한다.

```swift
let samples: [ModelSample<String>] = [
    ModelSample(
        prompt: "The largest planet in our solar system...",
        expected: "Jupiter."
    ),
    ModelSample(
        prompt: "The capital of Thailand...",
        expected: "Bangkok."
    )
]
```

그리고:

```swift
for try await sample in samples.makeSamples(
    """
    Generate diverse sentence completions about the listed topics:
      - The Solar System
      - World Capitals
    """,
    targetCount: 1000
) {
    samples.append(sample)
}
```

이 방식으로 seed set을 larger dataset으로 확장할 수 있다.

---

# 📏 Pass/Fail보다 더 많은 Metric

Tag count가 3~8 범위인지 여부만으로는 behavior distribution을 볼 수 없다.

그래서 `TagTotal` 같은 scoring metric을 추가한다.

```swift
let tagTotal = Metric("TagTotal")
```

단순 pass/fail이 아니라 실제 tag count 값을 기록한다.

이렇게 하면:

- Mean
- Standard deviation
- Variance

를 볼 수 있다.

---

# 📈 Aggregate Distribution

```swift
func aggregateMetrics(using aggregator: inout MetricsAggregator) {
    aggregator.computeMean(of: tagCount)

    aggregator.group("Distribution of Tag Totals") { aggregator in
        aggregator.computeStandardDeviation(of: tagTotal)
        aggregator.computeMean(of: tagTotal)
        aggregator.computeVariance(of: tagTotal)
    }
}
```

이제 단순히 range 안에 들어오는지만 보는 것이 아니라 **output distribution 자체를 측정**할 수 있다.

---

# 🔤 Multi-word Tag Evaluator

```swift
let wordCount = Metric("WordCount")

Evaluator { _, subject in
    for tag in subject.value.tags {
        if tag.contains(" ") {
            return wordCount.failing(
                rationale: "Tag \(tag) contains multiple words"
            )
        }
    }

    return wordCount.passing()
}
```

Rule을 code로 직접 측정할 수 있으면 quantitative metric이다.

---

# 📚 Genre Evaluator

```swift
let hasGenreTag = Metric("HasGenreTag")

Evaluator { _, subject in
    let tags = subject.value.tags.map { $0.lowercased() }
    let knownGenres = await BookTaggingService.knownGenres

    for tag in tags {
        if knownGenres.contains(tag) {
            return hasGenreTag.passing(
                rationale: "Matched \(tag)"
            )
        }
    }

    return hasGenreTag.failing()
}
```

이런 heuristic evaluator는 빠르고 deterministic하다.

---

# 🔁 Evaluation-Driven Development

세션은 hill-climbing을 development process의 중심에 놓는 것을 **evaluation-driven development**라고 부른다.

```text
Define Expectations
      ↓
Build Evaluation
      ↓
Run
      ↓
Inspect Metrics + Rationales
      ↓
Modify Prompt / Guide / Logic
      ↓
Re-run
      ↓
Compare
```

기능 spec 자체가 evaluation으로 표현되는 셈이다.

---

# 🧠 Quantitative Metric의 한계

Book Tracker의 tag output이 다음 조건을 모두 만족한다고 하자.

- 6개 tag
- Single word / hyphenated
- Genre 포함

정량 metric은 모두 pass할 수 있다.

그런데 다음 tag가 섞일 수 있다.

```text
overrated
pretentious
whodunit
```

문제:

- `overrated`, `pretentious`는 책이 아니라 reader의 감정
- `whodunit`은 실제 genre와 무관

즉 **code로 정의하기 어려운 품질**이 남는다.

---

# ⚖️ Model Judge

이런 qualitative metric을 scale하기 위한 도구가 `ModelJudgeEvaluator`다.

Model Judge는 **두 번째 language model이 feature output을 평가**한다.

Apple의 원칙:

> Judge는 평가 대상 model만큼은 capable해야 한다.

예제에서는 feature는 on-device model로 실행하고, judge는 더 강력한 `PrivateCloudComputeLanguageModel`을 사용한다.

---

# 🏗️ Model Judge 구성 요소

Model judge에는 대략 다음 정보가 들어간다.

```text
Instructions
Feature Input
Feature Output
Scoring Guide
```

Framework가 boilerplate를 처리하므로 개발자는 scoring guide 정의에 집중할 수 있다.

---

# 🎚️ 첫 Model Judge

예제:

```swift
ModelJudgeEvaluator(
    "TagQuality",
    scale: .numeric([
        4: "Tags are relevant and helpful for browsing",
        3: "Mostly relevant, one tag too vague or generic",
        2: "Several tags are wrong or generic",
        1: "Unhelpful or irrelevant"
    ]),
    judge: PrivateCloudComputeLanguageModel()
)
```

Apple은 **even number의 score level**을 사용하는 이유도 설명한다.

중간 neutral score로 몰리는 것을 줄이기 위해서다.

4단계는 구분력이 충분하면서 의미가 희석되지 않는 수준으로 제시된다.

---

# 💡 ModelJudgeEvaluator도 그냥 Evaluator

중요한 설계 포인트:

`ModelJudgeEvaluator`도 framework 관점에서는 일반 `Evaluator`와 동일한 역할을 한다.

따라서 하나의 evaluation에서 다음을 자유롭게 섞을 수 있다.

```text
Heuristic Evaluator
+
Scoring Evaluator
+
Model Judge Evaluator
```

모두 동일한 `Metric` 체계로 report에 들어간다.

---

# 📝 Rationale이 중요한 이유

Model judge의 score만 보면 왜 그런 평가가 나왔는지 알 수 없다.

그래서 rationales가 핵심이다.

예제에서 judge는 `Alice in Wonderland` 결과를 3점으로 평가했는데, 개발자는 더 낮아야 한다고 생각한다.

Rationale을 읽어보면 judge는 실제로 작성된 scoring guide를 충실히 따르고 있었다.

즉 문제는 model이 아니라 **scoring definition이 너무 broad한 것**이었다.

---

# ✂️ Broad Question은 Split한다

초기 `TagQuality`는 사실 두 질문을 섞고 있었다.

```text
Relevant한가?
+
Browsing에 Useful한가?
```

이런 경우 Apple은 question을 나누라고 권장한다.

---

# 📐 ScoreDimension

예를 들어 `Relevance`를 별도 dimension으로 정의한다.

```swift
ScoreDimension(
    "Relevance",
    description: """
        Whether each tag describes a quality, theme, or tone
        of the book itself rather than incidental details or
        the reader's personal reactions.
        """,
    scale: .numeric([
        4: "Every tag describes the book itself",
        3: "Most tags describe the book",
        2: "Some tags describe personal reactions",
        1: "Tags don't meaningfully describe the book"
    ])
)
```

같은 방식으로 `Usefulness`를 정의한다.

---

# 🧭 Multiple Score Dimensions

```swift
ModelJudgeEvaluator(
    judge: PrivateCloudComputeLanguageModel(),
    dimensions: [relevance, usefulness]
)
```

이제 한 점수로 뭉개지 않고 서로 다른 diagnostic signal을 얻는다.

```text
Relevance
→ 어떤 tag가 책 자체를 제대로 설명하지 못하는가

Usefulness
→ 어떤 tag가 browsing에 도움이 되지 않는가
```

---

# 🧩 ModelJudgePrompt

Score dimension만으로도 부족할 수 있다.

Judge는 앱의 business context를 모른다.

예를 들어 reader의 비판을 valid descriptor로 볼 수도 있다.

그래서 `ModelJudgePrompt`로 app context를 제공한다.

```swift
ModelJudgeEvaluator(
    judge: PrivateCloudComputeLanguageModel(),
    dimensions: [relevance, usefulness],
    prompt: ModelJudgePrompt(
        instructions: """
            You are evaluating tags generated for a personal book-tracking app where users
            organize their library by browsing and filtering tags.
            """,
        evaluationTarget: { value in
            "\(value.tags.count) Generated tags: "
            + value.tags.joined(separator: ", ")
        },
        reference: { input, _ in
            let expectedTags = input.expected?.tags.joined(separator: ", ")
            return [
                "Expected Tags": expectedTags ?? "No expected tags defined"
            ]
        }
    )
)
```

`ModelJudgePrompt`는 judge에게 다음을 설명한다.

- 이 앱이 무엇인지
- Output을 어떤 문맥에서 평가해야 하는지
- Evaluation target을 어떻게 표현할지
- Expected/reference value를 어떻게 제공할지

---

# 🔎 Dimension 결과 읽기

Refined judge를 실행하면 하나의 `Quality` 점수 대신 다음이 나온다.

```text
Relevance Score
Usefulness Score
```

그리고 각 dimension마다 rationale이 따로 나온다.

이 separation이 중요한 이유:

```text
Relevance rationale
→ 무엇이 의미적으로 틀렸는지

Usefulness rationale
→ 왜 실제 browsing UX에 도움이 안 되는지
```

즉 다음 iteration에서 무엇을 고쳐야 할지 훨씬 명확해진다.

---

# 📋 Best Practices

## 작게 시작

처음에는 20~30개의 focused sample이면 충분하다.

중요한 것은 quantity보다 expectation coverage다.

## Quantitative vs Qualitative 구분

Apple의 rule of thumb:

```text
Code로 측정 가능
→ Quantitative

말로만 설명 가능
→ Qualitative / Model Judge
```

예:

```text
Tag count
→ Quantitative

Tag relevance
→ Qualitative
```

## Judge는 단순하게 시작

처음부터 복잡한 rubric을 만들지 않는다.

```text
1 Dimension
→ Run
→ Read rationale
→ Refine
```

## Rationale을 다음 변경의 입력으로 사용

Score보다 rationale이 더 중요한 경우가 많다.

## 점수가 모두 같으면 질문을 의심

모든 sample이 비슷한 score를 받으면 metric이 너무 broad할 수 있다.

## 문제를 분리할 수 없으면 Dimension을 split

Relevance와 usefulness처럼 독립된 질문으로 나눈다.

## Judge가 앱을 이해하지 못하면 Context 추가

`ModelJudgePrompt`로 product context를 제공한다.

---

# 🧩 Framework 구성 요소 정리

| Type | 역할 |
|---|---|
| `Evaluation` | 전체 평가 정의 |
| `ModelSample` | 입력 + expected/reference sample |
| `ArrayLoader` | Dataset loader |
| `Metric` | 측정 항목 이름/값 표현 |
| `Evaluator` | Sample별 measurement logic |
| `MetricsAggregator` | 전체 sample 통계 집계 |
| `.evaluates` | Swift Testing integration |
| `EvaluationContext` | 현재 evaluation 결과 접근 |
| `SampleGenerator` | Synthetic sample 생성 |
| `ModelJudgeEvaluator` | Model 기반 qualitative 평가 |
| `ScoreDimension` | Judge 평가 축 분리 |
| `ModelJudgePrompt` | App context와 target/reference 구성 |

---

# 🔁 전체 개발 루프

```text
Feature Idea
   ↓
Define Expected Behavior
   ↓
Build Small Dataset
   ↓
Create Metrics
   ↓
Run Evaluation
   ↓
Inspect Report
   ↓
Change Prompt / Guide / Logic
   ↓
Re-run
   ↓
Expand Dataset
   ↓
Add Quantitative Metrics
   ↓
Add Model Judge
   ↓
Split Score Dimensions
   ↓
Add Product Context
   ↓
Repeat
```

이것이 세션에서 말하는 **evaluation-driven development**다.

---

# 🎯 Optimization Target의 역할

Optimization target은 단순 pass/fail threshold가 아니다.

예:

```swift
#expect(result.aggregateValue(.mean(of: tagCount)) >= 0.8)
```

이 값은:

```text
"Feature가 release 가능한가?"
```

라는 최소 품질 기준으로 사용할 수 있다.

하지만 target 하나로 모든 품질을 대표하면 안 된다.

왜냐하면 100% pass인데도 output distribution이 이상할 수 있기 때문이다.

---

# 🧪 Quantitative + Qualitative 조합

좋은 evaluation은 두 종류를 함께 쓴다.

```text
Quantitative
- Count
- Range
- Length
- Known category match
- Distribution

Qualitative
- Relevance
- Helpfulness
- Usefulness
- Tone
- Semantic quality
```

이 조합이 feature behavior를 더 입체적으로 보여준다.

---

# ⚠️ Model Judge 사용 시 주의점

## Judge를 ground truth로 취급하지 않는다

Judge도 model이다.

Score가 개발자 판단과 다르면 rationale을 읽고 rubric을 개선해야 한다.

## Judge는 최소한 대상 model만큼 capable해야 한다

낮은 성능의 judge가 더 좋은 model을 평가하면 measurement quality 자체가 흔들릴 수 있다.

## Broad rubric을 피한다

여러 concept을 하나의 점수로 합치면 diagnostic value가 떨어진다.

## App context를 제공한다

Product-specific requirement는 generic model이 자동으로 이해하지 못한다.

---

# 📈 Dataset 설계 체크리스트

- [ ] Happy path 포함
- [ ] Short input 포함
- [ ] Long input 포함
- [ ] Different style 포함
- [ ] Ambiguous input 포함
- [ ] Personal opinion 포함
- [ ] Adversarial phrasing 포함
- [ ] Domain variety 포함
- [ ] Expected/reference value 정의
- [ ] Production traffic의 실제 분포 반영
- [ ] Synthetic data만으로 구성하지 않기
- [ ] Dataset expansion 후 distribution 재확인

---

# 📏 Metric 설계 체크리스트

- [ ] Expectation 하나당 metric이 명확한가
- [ ] Pass/fail로 충분한가
- [ ] Raw score를 기록해야 하는가
- [ ] Aggregate mean이 의미 있는가
- [ ] Variance / standard deviation이 필요한가
- [ ] Distribution을 보고 있는가
- [ ] Optimization target이 현실적인가
- [ ] 한 metric이 너무 많은 의미를 섞고 있지 않은가

---

# ⚖️ Model Judge 체크리스트

- [ ] Judge model이 충분히 capable한가
- [ ] Scoring scale 의미가 명확한가
- [ ] Neutral middle score 쏠림을 피했는가
- [ ] Rationale을 확인하는가
- [ ] Dimension이 너무 broad하지 않은가
- [ ] App context를 prompt로 주었는가
- [ ] Expected/reference 값을 제공했는가
- [ ] Human judgment와 periodically 비교하는가

---

# 🧭 실무적으로 가장 중요한 사고방식

기존 software에서는 테스트가 구현 뒤에 붙는 경우가 많다.

Evaluations에서는 반대로 **기대 behavior를 먼저 metric으로 명시하는 것 자체가 feature spec**이 된다.

```text
Expectation
→ Dataset
→ Metric
→ Evaluation
→ Implementation iteration
```

즉 evaluation이 단순 QA artifact가 아니라 development loop의 중심이 된다.

---

# 🔍 Xcode Report에서 봐야 할 것

Evaluation report에서는 단순 pass/fail만 보지 않는다.

다음 항목을 함께 본다.

- Aggregate metric trend
- 특정 sample failure
- Prompt
- Generated response
- Per-metric rationale
- Model judge rationale
- Distribution 변화
- 이전 run과 configuration notes 비교

특히 configuration note를 남기면 prompt나 model configuration이 달라진 run을 추적하기 좋다.

---

# 🪜 Hill-Climbing을 잘 쓰는 방법

좋은 iteration은 한 번에 하나의 가설을 검증한다.

```text
Problem:
Tag 수가 너무 많다

Hypothesis:
@Guide에 count range를 넣으면 해결된다

Change:
.count(3...8)

Evaluation:
TagCount ↑

Unexpected Behavior:
모든 sample이 8개로 수렴

Next Metric:
TagTotal distribution 추가
```

이렇게 metric이 새로운 behavior를 드러내고, 그 behavior가 다시 새로운 metric을 만든다.

---

# 🔬 Evaluation이 Feature Design을 바꾸는 방식

세션의 Book Tracker 예제는 중요한 패턴을 보여준다.

처음에는 단순히 “tag를 잘 생성한다”는 모호한 목표였다.

Evaluation을 만들면서 실제 requirement가 다음처럼 분해된다.

```text
Tag count
Single-word constraint
Known genre coverage
Relevance
Usefulness
```

즉 좋은 evaluation은 test를 추가하는 것이 아니라 **product requirement를 측정 가능한 언어로 바꾸는 작업**이다.

---

# 🧠 핵심 메시지

Evaluations framework는 생성형 AI를 기존 deterministic software처럼 억지로 unit test하려는 접근에서 벗어나게 한다.

핵심은 다음과 같다.

```text
Probabilistic Feature
        ↓
Diverse Dataset
        ↓
Quantitative Metrics
        ↓
Aggregate Statistics
        ↓
Optimization Target
        ↓
Hill-Climbing
        ↓
Qualitative Model Judge
        ↓
Score Dimensions + Rationales
        ↓
Evaluation-Driven Development
```

가장 중요한 구분은 이것이다.

```text
Code로 측정할 수 있다
→ Heuristic / Quantitative Evaluator

말로 설명해야 한다
→ ModelJudgeEvaluator
```

그리고 model judge의 score 자체보다 **rationale을 읽고 rubric을 개선하는 과정**이 더 중요하다.

결국 Evaluations framework의 목적은 AI output을 deterministic하게 만드는 것이 아니다.

대신 **확률적인 시스템의 behavior를 측정 가능하게 만들고, 반복 가능한 feedback loop를 구축해 release confidence를 높이는 것**이다.

---

# 함께 보면 좋은 세션과 자료

- Improve your prompts by hill climbing with Evaluations — WWDC26
- Create robust evaluations for agentic apps — WWDC26
- Designing datasets to test your feature
- Designing effective evaluations
- Evaluating language model responses
- Book Tracker: Using Evaluations to evaluate an intelligent feature
