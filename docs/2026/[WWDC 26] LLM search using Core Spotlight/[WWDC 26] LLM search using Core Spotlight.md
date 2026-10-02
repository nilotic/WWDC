# WWDC26 LLM search using Core Spotlight 요약

- Session: 246
- Title: LLM search using Core Spotlight
- Source: https://developer.apple.com/videos/play/wwdc2026/246/
- Topic: Core Spotlight, Foundation Models, SpotlightSearchTool, LanguageModelSession, Tool Calling, RAG, Search Pipelines, Evaluations
- Chapters: Introduction, Grounding answers with Spotlight tool-calling, Configure and add SpotlightSearchTool, Displaying results and partial replies, Provide full items with an index delegate, Customizing with guidance profiles, Reference resolution with a contact resolver, Custom pipeline stages, Evaluating response quality, Next steps

---

## 한 줄 요약

`SpotlightSearchTool`은 앱이 이미 Core Spotlight에 색인한 데이터를 Foundation Models의 tool-calling에 연결해, 모델이 앱 콘텐츠를 직접 검색하고 그 결과를 근거로 답변하도록 만드는 API다. 여기에 index delegate 기반 item hydration, GuidanceProfile, ContactResolver, custom pipeline stage, async search reply, Evaluations까지 결합하면 단순 semantic search를 넘어 앱 내부 데이터를 대상으로 하는 온디바이스 RAG형 검색 경험을 구성할 수 있다.

---

## 핵심 요약

이번 세션의 출발점은 간단하다.

Foundation Models의 `LanguageModelSession`만 사용하면 모델은 자신의 일반적인 world knowledge를 기반으로 답한다. 하지만 앱이 알고 있는 hiking trail, 사용자 메모, 완료 날짜처럼 **앱 내부 데이터만 근거로 답하게 하려면** 별도의 grounding 계층이 필요하다.

Apple이 이번에 제공하는 연결 고리가 `SpotlightSearchTool`이다.

```text
User Prompt
   ↓
LanguageModelSession
   ↓
Model decides to call a tool
   ↓
SpotlightSearchTool
   ↓
Core Spotlight Index
   ↓
Search results / pipeline outputs
   ↓
Model reasoning
   ↓
Grounded response
```

핵심은 다음과 같다.

- 앱이 Core Spotlight에 searchable content를 먼저 donate해야 함
- `SpotlightSearchTool`은 Foundation Models의 `Tool` 프로토콜을 채택
- 모델이 필요할 때 직접 검색 query를 생성하고 tool을 호출
- Spotlight가 검색 결과를 반환
- 모델이 그 결과를 기반으로 최종 응답 생성
- searchable item의 compact metadata가 모델에게 직접 복원되지 않는 경우 index delegate로 full item 제공
- 검색 중 partial replies를 async sequence로 받을 수 있음
- `queryToken`으로 한 response 안에서 여러 search call을 구분
- `GuidanceProfile`로 모델에게 노출할 search capability와 attribute 범위를 줄일 수 있음
- `ContactResolver`로 사람 reference resolution 지원
- custom pipeline stage로 검색 결과 위에서 계산/변환 수행 가능
- Evaluations framework로 tool call trajectory와 result coverage 측정 가능

---

# 🧭 출발점: Foundation Models만으로는 앱 데이터에 접근할 수 없다

세션의 예제는 hiking trails 앱이다.

앱에는 다음과 같은 데이터가 있다.

- State parks
- Trails
- Trail name
- Location
- Completion date
- 사용자가 작성한 hike notes

Foundation Models를 붙이면 일반적인 질문은 바로 가능하다.

```swift
let response = try await session.respond(
    to: "What are some nice hikes near water?"
)
```

하지만 이 session은 기본적으로 모델 자신의 knowledge를 사용한다.

사용자가 묻는 질문이 다음처럼 바뀌면 문제가 생긴다.

```text
“What hikes have I gone on?”
```

이 답은 일반 world knowledge에 없다.

앱이 가지고 있는 완료 날짜, location, 개인 notes 같은 데이터에 접근해야 한다.

---

# 🔍 Core Spotlight를 Grounding 계층으로 사용

앱은 이미 trail 데이터를 Core Spotlight에 donate하고 있다.

따라서 별도의 새로운 vector store를 만들기보다 기존 Core Spotlight index를 Foundation Models의 context source로 사용할 수 있다.

세션에서는 이를 다음 구조로 설명한다.

```text
App Content
   ↓ donate
Core Spotlight Index
   ↓ search
SpotlightSearchTool
   ↓ tool output
Language Model
   ↓ reasoning
Grounded Response
```

`SpotlightSearchTool`은 Foundation Models의 Tool protocol을 사용한다.

Tool은 기본적으로 다음을 정의한다.

- Arguments
- Output
- Tool instructions

모델은 필요하다고 판단하면 tool arguments를 생성하고 tool을 호출한 뒤, output을 사용해 응답을 만든다.

---

# 🛠️ `SpotlightSearchTool` 만들기

가장 간단한 설정은 한 줄이다.

```swift
import CoreSpotlight
import FoundationModels

let tool = SpotlightSearchTool()
```

이 상태에서 tool은 앱의 Core Spotlight index를 검색할 수 있다.

특정 source를 지정할 수도 있다.

```swift
let fileTool = SpotlightSearchTool(
    configuration: .init(
        sources: [
            .files
        ]
    )
)
```

세션의 예시는 앱 sandbox의 file path를 대상으로 검색하는 configuration이다.

---

# 🤖 LanguageModelSession에 Tool 추가

모델은 `SystemLanguageModel`을 사용할 수도 있고 새로운 Model Provider API를 통해 다른 model을 선택할 수도 있다.

선택한 모델과 tool을 `LanguageModelSession`에 넣는다.

```swift
import CoreSpotlight
import FoundationModels

let tool = SpotlightSearchTool()

let session = LanguageModelSession(
    model: model,
    tools: [tool],
    instructions: instructions
)

let response = try await session.respond(
    to: "What hikes have I gone on?"
)
```

이제 model은 필요할 경우 `SpotlightSearchTool`을 사용한다.

---

# 🔄 실제 Tool-Calling Trajectory

사용자 질문:

```text
What hikes have I gone on?
```

가능한 trajectory는 다음과 같다.

```text
1. Model receives prompt
2. Model decides Spotlight search is needed
3. Model generates a Spotlight query
4. SpotlightSearchTool executes query
5. Spotlight returns result-set description
6. Model reasons over tool output
7. Model generates final response
```

즉 개발자가 직접 자연어를 Core Spotlight query syntax로 변환하지 않아도 된다.

세션 마지막의 메시지도 이 지점에 집중한다.

```text
We're not writing search queries anymore.
We're providing the content, and letting intelligence do the rest.
```

---

# 📦 검색 가능한 Metadata와 모델이 읽을 수 있는 Metadata는 다르다

중요한 함정이 하나 있다.

Core Spotlight에 donate된 metadata 중 일부는 **검색은 가능하지만 원문 형태로 다시 복원할 수 없다.**

세션에서 예로 든 항목:

- Text content
- HTML

이런 metadata는 index 내부에서 compact representation으로 저장될 수 있다.

따라서 Spotlight search 자체는 가능하지만, Foundation Model이 결과 item의 전체 텍스트를 reasoning에 사용할 수 없을 수 있다.

이때 index delegate가 필요하다.

---

# 💧 Full Item Hydration: `CSSearchableIndexDelegate`

기존 Core Spotlight 앱이라면 `CSSearchableIndexDelegate`를 reindex request 처리에 이미 사용할 수 있다.

이번 integration을 위해 delegate에 새로운 흐름이 추가된다.

```swift
func searchableItems(
    forIdentifiers identifiers: [String]
) async -> [CSSearchableItem]
```

예제:

```swift
import CoreSpotlight

class IndexDelegate: NSObject, CSSearchableIndexDelegate {

    func searchableItems(
        forIdentifiers identifiers: [String]
    ) async -> [CSSearchableItem] {
        let entries = await mystore.fetchEntries(ids: identifiers)
        return entries.map { makeSearchableItem(from: $0) }
    }
}
```

이 메서드는 Spotlight가 identifier를 기준으로 **complete `CSSearchableItem`을 다시 가져오게 한다.**

---

# 🧠 왜 Hydration이 중요한가

세션에서는 이 구조가 potentially millions of results에도 대응할 수 있도록 설계되었다고 설명한다.

전체 원문을 처음부터 index에 모델 친화적인 형태로 중복 저장하는 대신:

```text
Search Index
→ 빠른 candidate retrieval

Identifiers
→ delegate 요청

App Store / DB
→ complete item hydration

Complete Item
→ model reasoning
```

으로 분리할 수 있다.

또 검색용으로 donate할 이유는 없지만 모델 reasoning에 유용한 metadata가 있다면 이 hydration 시점에 attribute를 추가할 수 있다.

---

# 🖥️ UI: Final Response와 Search Results를 분리해서 생각

`LanguageModelSession`이 반환하는 response는 검색 결과 전체를 나열하기 위한 형태라기보다 **result set을 요약한 concise response**에 가깝다.

Assistant-style UI라면 이 final response를 보여주는 것이 자연스럽다.

반대로 list UI라면 `SpotlightSearchTool`에서 직접 search result를 가져오는 편이 낫다.

```text
Assistant UI
→ session response

List / Search Results UI
→ SpotlightSearchTool.searchResults
```

---

# 🌊 Partial Search Replies는 Async Sequence

검색 결과는 한꺼번에 끝에서만 오는 것이 아니다.

`SpotlightSearchTool`은 search reply를 async sequence 형태로 제공한다.

```swift
for await reply in tool.searchResults {

    if reply.queryToken != currentToken {
        currentToken = reply.queryToken
    }

    switch reply.content {
    case .items(let searchItems):
        break
    }
}
```

각 reply에는 result batch가 포함될 수 있다.

이 구조를 사용하면 검색이 진행되는 동안 UI를 점진적으로 갱신할 수 있다.

---

# 🪪 `queryToken`이 필요한 이유

하나의 user prompt에 대해 모델이 `SpotlightSearchTool`을 한 번만 호출한다는 보장은 없다.

예를 들어 모델이:

```text
Search A
→ 결과 분석
→ Search B
→ 최종 응답
```

처럼 여러 번 검색할 수 있다.

따라서 각 reply의 `queryToken`을 확인해 새로운 search query가 시작됐는지 판단해야 한다.

```swift
if reply.queryToken != currentToken {
    // New query — start a new display section
    currentToken = reply.queryToken
}
```

UI에서는 이를 활용해 query별 section을 새로 시작하거나 이전 결과와 구분할 수 있다.

---

# 🧩 SpotlightSearchTool의 Search Capability

세션에서 언급된 search 범위:

- Semantic text search
- Structured metadata search
- Dates
- Persons
- Locations
- Other metadata attributes

하지만 모든 앱이 이 기능 전체를 필요로 하는 것은 아니다.

특히 on-device model은 context size가 더 제한적이므로 tool guidance를 필요한 범위로 줄이는 것이 중요하다.

---

# 🎛️ `GuidanceProfile`

`SpotlightSearchTool`은 전체 search capability를 model에게 guided generation 형태로 제공한다.

앱이 실제로 쓰지 않는 기능까지 모두 노출하면 불필요한 context를 소비할 수 있다.

예를 들어 hiking app에 author / recipient relationship 데이터가 없다면 person search guidance 일부는 필요하지 않을 수 있다.

```swift
let profile = SpotlightSearchTool.GuidanceProfile(
    textMatch: true,
    dates: true,
    people: false,
    attributes: [
        .title,
        .altitude,
        .completionDate
    ]
)

let tool = SpotlightSearchTool(
    configuration: .init(
        guide: .init(
            level: .dynamic(profile)
        )
    )
)
```

이렇게 필요한 capability와 attribute만 지정할 수 있다.

---

# 🎯 On-device Model에는 Focused Guidance

세션은 on-device model의 context가 더 작기 때문에 더 focused한 guidance를 권장한다.

```swift
let focusedTool = SpotlightSearchTool(
    configuration: .init(
        guide: .init(
            level: .focused(.items)
        )
    )
)
```

즉 tool 설계에서도 "가능한 모든 기능을 모델에게 보여주기"보다 **현재 앱과 task에 필요한 search vocabulary만 노출하는 것**이 중요하다.

---

# 👤 Reference Resolution: `ContactResolver`

검색 질문에는 명확한 literal value 대신 reference가 들어올 수 있다.

예:

```text
Who did I go hiking with?
```

여기서 "I"가 누구인지 search index만 보고 알기 어려울 수 있다.

앱이 로그인 계정이나 profile을 통해 사용자의 identity를 이미 알고 있다면 `ContactResolver`를 사용한다.

```swift
import CoreSpotlight
import FoundationModels

struct MyContactResolver: ContactResolver {

    func userIdentity() -> ResolvedContact {
        var contact = ResolvedContact(
            displayName: "Jane Doe"
        )
        contact.emailAddresses = [
            "jane@example.com",
            "jdoe@work.com"
        ]
        contact.names = ["Jane", "JD"]
        return contact
    }
}

tool.contactResolver = MyContactResolver()
```

Contact resolver가 반환한 정보는 index metadata와 matching하는 데 사용된다.

---

# 🧮 Simple Search를 넘어 Search Pipeline으로

복잡한 질문은 단순 retrieval만으로 비효율적일 수 있다.

예:

```text
How many trails have I hiked this year,
and for each month,
how many miles have I gone on average?
```

모델이 모든 item을 가져와 memory에서 직접 count와 average를 계산할 수도 있다.

하지만 result set이 크다면 Spotlight 자체가 **search + computation pipeline**을 수행하는 편이 효율적이다.

가능한 pipeline:

```text
Search completed hikes
   ↓
Group / count by month
   ↓
Compute averages
   ↓
Return compact computed result
   ↓
Model reasoning
```

---

# 🧱 Pipeline Stage

Pipeline stage는 search result set 위에서 computation이나 transformation을 수행한다.

세션은 앱이 자신의 custom stage를 등록할 수 있다고 설명한다.

중요한 특징:

- Stage는 `Generable`
- 모델이 user prompt에 맞춰 stage를 on-demand로 생성 가능
- Stage는 입력 data type과 출력 data type을 정의
- 모델이 적절하다고 판단하면 stage output을 app으로 partial result 형태로 반환 가능

---

# 😊 Custom `HappinessStage`

세션 예제 질문:

```text
I remember being really happy on some of my hikes.
Which ones were they?
```

개별 note를 모델이 직접 읽고 happiness를 추측할 수도 있다.

하지만 앱이 sentiment model이나 자체 rating logic을 갖고 있다면 custom stage에서 score를 계산할 수 있다.

```swift
import CoreSpotlight
import FoundationModels

@Generable
struct HappinessStage: CustomStage {
    static var name = "happiness"
    static var description = "Scores hike by how happy the author was"
    static var inputTypes: [SearchPipelineDataType] = [.items]
    static var outputTypes: [SearchPipelineDataType] = [.scoredItems]

    @Guide(
        description: "Minimum happiness score (0.0-1.0) to include in results"
    )
    var threshold: Double?

    func execute(
        on input: SearchPipelineData
    ) async throws -> SearchPipelineData {
        return SearchPipelineData(
            payload: .scoredItems(sorted)
        )
    }
}
```

Stage는 configuration에 등록한다.

```swift
let tool = SpotlightSearchTool(
    configuration: .init(
        customStages: [
            .happinessBoost(threshold: 0.5)
        ]
    )
)
```

---

# 📊 Pipeline Output도 UI에 표시 가능

`SpotlightSearchTool`의 search reply는 단순 `CSSearchableItem`만 담는 것이 아니다.

세션에서 제시한 reply data types:

```swift
case .items(let searchItems)
case .scoredItems(let scored)
case .groupedItems(let groups)
case .count(let count)
case .table(let table)
case .statistic(let statistic)
case .text(let text)
```

또 reply마다 LLM-generated label이 포함된다.

```swift
let label = reply.label
```

따라서 UI는 generic result renderer를 만들 수도 있다.

```text
Items       → List
ScoredItems → Ranked Cards
Grouped     → Sections
Count       → Summary Badge
Table       → Grid/Table UI
Statistic   → Metric Card
Text        → Explanatory Block
```

세션의 요지는 app이 model의 final prose만 보여줄 필요가 없다는 것이다.

검색과 computation 중간 결과를 앱 UI에 직접 표현할 수 있다.

---

# 🧪 왜 Evaluations가 필요한가

Tool-calling 기반 검색은 단순히 "답변이 자연스러운가"만 보면 부족하다.

검증해야 할 대상이 여러 개다.

```text
Did the model call the tool?
Did it construct a useful search?
Did the expected items appear?
Did the final response use the right items?
How does guidance configuration affect quality?
```

이 세션에서는 특히 **Result Coverage**를 평가 지표로 사용한다.

---

# 📚 `ModelSampleProtocol` 기반 Dataset

평가 sample에는 다음이 들어간다.

- Natural language input
- Model output
- Expected trajectory
- Expected searchable item identifiers
- Optional sample response

예제:

```swift
import Evaluations

struct TrailRequest: ModelSampleProtocol {

    typealias ExpectedValue = String
    typealias Expectation = TrajectoryExpectation

    var input: ModelSampleInput
    var output: ModelSampleOutput<
        String,
        TrajectoryExpectation
    >

    var expectedIdentifiers: [String]
}
```

Sample은 `Codable` 형식으로 serialize할 수 있고 세션에서는 JSON을 예로 든다.

---

# 🌱 Sample Generation으로 Dataset 확장

실제 test data가 충분하면 그대로 쓰면 된다.

그렇지 않다면 Sample Generation API를 사용해 seed sample을 다양한 표현으로 확장할 수 있다.

```text
Seed Prompt
   ↓
Sample Generation
   ↓
Many natural-language variations
   ↓
Broader evaluation coverage
```

즉 같은 intent를 사용자가 어떻게 다르게 표현할 수 있는지 대규모로 테스트할 수 있다.

---

# 🛤️ Tool Trajectory Expectation

평가에서는 response trajectory에 `SpotlightSearchTool` 호출이 포함될 것으로 기대할 수 있다.

```swift
TrajectoryExpectation(
    unordered: [
        ToolExpectation(
            "searchSpotlight",
            arguments: [
                .keyOnly(argumentName: "query")
            ]
        )
    ]
)
```

이렇게 하면 최종 텍스트만 비교하는 것이 아니라 **어떤 tool을 거쳤는지**까지 검증할 수 있다.

---

# 📈 Result Coverage 평가

테스트 흐름:

```text
Load indexed items
   ↓
Load evaluation samples
   ↓
Donate items to Core Spotlight
   ↓
Configure SpotlightSearchTool
   ↓
Run evaluation
   ↓
Compare returned identifiers
with expected identifiers
   ↓
Aggregate ResultCoverage
```

세션의 예제 test:

```swift
@Test("Trail search evaluation meets quality thresholds")
func trailSearchEval() async throws {

    let items = try Self.loadItems()
    let samples = try Self.loadSamples()

    try await Self.indexDelegate.indexSearchableItems(items)
    let tool = Self.makeSearchTool()

    let evaluation = TrailSearchEvaluation(
        tool: tool,
        dataset: ArrayLoader(samples: samples)
    )

    let result = try await evaluation.run()

    let coverageMean = result.aggregateValue(
        .mean(of: Metric("ResultCoverage"))
    )

    #expect(
        coverageMean >= 0.5,
        "Result coverage should be at least 50% across queries"
    )
}
```

이렇게 search quality를 CI/Test target의 정량적 기준으로 만들 수 있다.

---

# 🏗️ 전체 Architecture

이번 세션을 하나의 구조로 합치면 다음과 같다.

```text
                 ┌──────────────────────┐
                 │      App Content     │
                 └──────────┬───────────┘
                            │ donate
                            ▼
                 ┌──────────────────────┐
                 │ Core Spotlight Index │
                 └──────────┬───────────┘
                            │
                     SpotlightSearchTool
                            │
          ┌─────────────────┼─────────────────┐
          │                 │                 │
          ▼                 ▼                 ▼
  GuidanceProfile    ContactResolver    Custom Stages
          │                 │                 │
          └─────────────────┼─────────────────┘
                            ▼
                 LanguageModelSession
                            │
              ┌─────────────┴─────────────┐
              ▼                           ▼
       Final Response               Partial Replies
                                          │
                                 queryToken / label
                                          │
                                          ▼
                                      App UI
```

여기에 별도 quality loop가 붙는다.

```text
Samples
   ↓
Evaluations
   ↓
Trajectory + Result Coverage
   ↓
Adjust Index Metadata / Guidance / Stages
```

---

# 🧠 Core Spotlight가 단순 App Search를 넘어서는 지점

기존 Core Spotlight의 주 역할은 앱의 콘텐츠를 시스템 검색에 노출하고 structured/semantic search를 제공하는 것이었다.

이번 세션에서는 동일한 index가 **Foundation Models를 위한 retrieval layer**가 된다.

따라서 기존 search investment를 다시 활용할 수 있다.

```text
Searchable Content Donation
          ↓
      Core Spotlight
       ↙        ↘
Traditional Search   Foundation Models Tool Calling
```

즉 Spotlight index가 사람에게 직접 결과를 찾게 하는 검색 계층이면서 모델이 reasoning context를 얻는 retrieval 계층이 된다.

---

# 🧰 앱에서 준비해야 할 것

`SpotlightSearchTool`을 사용하기 전에 앱이 먼저 Core Spotlight integration을 잘 해두어야 한다.

세션에서 전제로 두는 항목:

- Searchable content donation
- Searchable metadata 정의
- Index delegate
- Reindex support
- Structured search에 사용할 attribute 설계
- Semantic index에 적합한 content 제공

이 기반이 부실하면 모델도 좋은 retrieval을 할 수 없다.

---

# 🧹 Metadata Quality가 중요한 이유

세션 전체에서 반복되는 메시지는 검색 quality가 model만의 문제가 아니라는 점이다.

응답 품질은 다음 요소의 조합이다.

```text
Indexed Content Quality
        ×
Metadata Coverage
        ×
Hydrated Full Item Quality
        ×
Guidance Scope
        ×
Model Choice
        ×
Custom Pipeline Logic
```

그래서 Evaluations를 통해 어떤 configuration이 실제 result coverage를 높이는지 측정해야 한다.

---

# ⚡ On-device Model에서 특히 중요한 최적화

세션에서 명시적으로 강조하는 부분은 context size다.

On-device model은 context가 더 제한적이므로 다음이 중요하다.

- 사용하지 않는 search capability를 guidance에서 제외
- 필요한 metadata attribute만 노출
- focused guidance 사용
- search result를 무작정 많이 모델 context에 넣지 않기
- pipeline stage에서 computation을 먼저 수행하고 compact result를 반환

즉 retrieval quality만큼 **context budget management**도 중요하다.

---

# 🎨 UI 구성 패턴

이번 API를 UI 관점에서 세 가지로 나눌 수 있다.

## Assistant-style

```text
Prompt
→ Model + Spotlight Tool
→ Final concise answer
```

`LanguageModelSession` response를 중심으로 표시한다.

## Search-results style

```text
Prompt
→ Spotlight Tool
→ async batches
→ List / Cards
```

`tool.searchResults`의 item batch를 직접 표시한다.

## Hybrid style

```text
Prompt
   ↓
Partial search results
   ↓
Grouped / scored / table data
   ↓
Final model explanation
```

세션에서 제공하는 reply data type과 labels를 활용하면 hybrid UI도 자연스럽게 만들 수 있다.

---

# 🔒 개인 데이터와 앱 내부 데이터

세션의 hiking 예제에는 개인 hike notes와 completion history가 포함된다.

이 session의 기술적 핵심은 이러한 앱 데이터가 Core Spotlight index와 app-provided hydration을 통해 model grounding에 사용된다는 것이다.

다만 이번 transcript는 별도의 privacy architecture나 policy를 상세하게 다루는 세션은 아니다.

따라서 이 문서에서는 transcript가 설명한 검색/모델 integration 범위만 정리한다.

---

# 🧪 권장 구현 순서

세션 흐름에 맞춰 실제 적용 순서를 정리하면 다음과 같다.

```text
1. Core Spotlight donation 정리
2. Searchable metadata 품질 점검
3. SpotlightSearchTool 생성
4. LanguageModelSession에 tool 추가
5. 기본 grounded response 확인
6. Index delegate full-item hydration 구현
7. Async partial result UI 구현
8. queryToken으로 search call 구분
9. GuidanceProfile 축소
10. 필요하면 ContactResolver 추가
11. 복잡한 계산은 custom pipeline stage로 이동
12. Evaluation dataset 작성
13. Tool trajectory 검증
14. Result coverage 측정
15. Index / guidance / stage 반복 개선
```

---

# 📋 체크리스트

## Core Spotlight 준비

- [ ] 앱 콘텐츠가 Core Spotlight에 donate되어 있는가
- [ ] unique identifier가 안정적으로 유지되는가
- [ ] title/location/date/person 등 structured metadata가 적절한가
- [ ] semantic search에 필요한 text가 충분한가
- [ ] index delegate가 설정되어 있는가
- [ ] reindex/migration recovery가 가능한가

## Foundation Models 연결

- [ ] `CoreSpotlight` import
- [ ] `FoundationModels` import
- [ ] `SpotlightSearchTool()` 생성
- [ ] 필요한 경우 custom sources configuration 적용
- [ ] 적절한 model 선택
- [ ] `LanguageModelSession`에 tools 배열 전달
- [ ] grounded prompt로 동작 확인

## Full Item Hydration

- [ ] compact representation 때문에 모델이 읽지 못하는 metadata가 있는지 확인
- [ ] `searchableItems(forIdentifiers:)` 구현
- [ ] identifier에서 실제 app storage item 조회 가능
- [ ] complete `CSSearchableItem` 재생성
- [ ] reasoning에만 필요한 추가 attribute가 있다면 hydration 시점에 추가

## Partial Result UI

- [ ] `tool.searchResults` async sequence 처리
- [ ] `.items` batch 처리
- [ ] `queryToken` 저장
- [ ] token 변경 시 새로운 query section 처리
- [ ] 한 model response 안의 multiple tool calls 고려
- [ ] final answer와 raw result UI를 분리할지 결정

## Guidance

- [ ] 앱이 쓰지 않는 search capability 제외
- [ ] 필요한 attribute만 profile에 지정
- [ ] on-device model에서는 focused guidance 우선 검토
- [ ] context budget이 불필요하게 커지지 않는지 확인

## Reference Resolution

- [ ] user prompt에 self-reference/person reference가 있는지 확인
- [ ] 앱에 identity source가 있는지 확인
- [ ] 필요한 경우 `ContactResolver` 구현
- [ ] display name, emails, aliases 등 index matching 정보 제공

## Custom Pipeline

- [ ] simple retrieval로 처리하기 어려운 query인지 확인
- [ ] aggregate/count/score/table computation이 필요한지 확인
- [ ] `@Generable` custom stage 설계
- [ ] input/output `SearchPipelineDataType` 지정
- [ ] 필요한 parameter에 `@Guide` 적용
- [ ] tool configuration에 custom stage 등록
- [ ] partial reply로 반환되는 stage output UI 처리

## Evaluations

- [ ] `ModelSampleProtocol` dataset 정의
- [ ] expected identifiers 포함
- [ ] expected tool trajectory 정의
- [ ] seed sample 준비
- [ ] 필요하면 Sample Generation으로 variation 확장
- [ ] evaluation run에서 Core Spotlight test data donate
- [ ] result coverage metric 측정
- [ ] 최소 threshold 정의
- [ ] guidance/index metadata 변경 후 regression 비교

---

# ⚠️ 구현 시 주의할 점

## Searchable하다고 Model-readable한 것은 아니다

Core Spotlight가 검색에 사용할 수 있는 metadata가 반드시 Foundation Model에게 원문 그대로 전달되는 것은 아니다.

Text/HTML처럼 compact representation으로 저장되는 항목은 index delegate hydration이 필요할 수 있다.

## 하나의 Prompt가 여러 검색을 만들 수 있다

모델이 한 response 안에서 tool을 여러 번 호출할 수 있으므로 result stream을 단일 query라고 가정하면 안 된다.

`queryToken`을 기준으로 구분한다.

## Tool Capability를 모두 노출할 필요는 없다

특히 on-device model에서는 context가 제한적이다.

`GuidanceProfile`을 통해 실제 앱이 사용하는 search capability와 metadata만 노출하는 편이 좋다.

## 복잡한 계산을 Model Memory에 맡기지 않는다

대규모 result set에서 count, grouping, average, scoring이 필요하다면 pipeline stage를 이용해 retrieval layer에서 계산을 수행할 수 있다.

## 자연스러운 답변만 보고 품질을 판단하지 않는다

모델 응답은 그럴듯해도 기대한 item을 검색하지 못했을 수 있다.

Evaluations에서 expected identifiers와 result coverage를 함께 측정한다.

---

# 🧩 주요 API 관계

```text
CSSearchableItem
      │
      ▼
CSSearchableIndex
      │
      ├── CSSearchableIndexDelegate
      │       └── searchableItems(forIdentifiers:)
      │
      ▼
SpotlightSearchTool
      │
      ├── GuidanceProfile
      ├── ContactResolver
      ├── CustomStage
      └── searchResults AsyncSequence
      │
      ▼
LanguageModelSession
      │
      ▼
Foundation Model Response
```

Evaluation side:

```text
ModelSampleProtocol
      ↓
TrajectoryExpectation
      ↓
Evaluation Run
      ↓
Metric("ResultCoverage")
```

---

# 🎯 주요 코드 모음

## 기본 SpotlightSearchTool

```swift
let tool = SpotlightSearchTool()
```

## Session에 연결

```swift
let session = LanguageModelSession(
    model: model,
    tools: [tool],
    instructions: instructions
)
```

## Full-item Hydration

```swift
func searchableItems(
    forIdentifiers identifiers: [String]
) async -> [CSSearchableItem]
```

## Partial Search Result

```swift
for await reply in tool.searchResults {
    if reply.queryToken != currentToken {
        currentToken = reply.queryToken
    }

    switch reply.content {
    case .items(let searchItems):
        break
    }
}
```

## Dynamic Guidance

```swift
let profile = SpotlightSearchTool.GuidanceProfile(
    textMatch: true,
    dates: true,
    people: false,
    attributes: [
        .title,
        .altitude,
        .completionDate
    ]
)
```

## Contact Resolver

```swift
struct MyContactResolver: ContactResolver {
    func userIdentity() -> ResolvedContact {
        // app identity → ResolvedContact
    }
}
```

## Custom Pipeline Stage

```swift
@Generable
struct HappinessStage: CustomStage {
    static var inputTypes: [SearchPipelineDataType] = [.items]
    static var outputTypes: [SearchPipelineDataType] = [.scoredItems]
}
```

## Trajectory Expectation

```swift
TrajectoryExpectation(
    unordered: [
        ToolExpectation(
            "searchSpotlight",
            arguments: [
                .keyOnly(argumentName: "query")
            ]
        )
    ]
)
```

---

# 🧠 세션이 보여주는 RAG 패턴

이번 구조는 전형적인 retrieval-augmented generation의 구성과 닮아 있다.

```text
User Query
   ↓
LLM decides retrieval is needed
   ↓
Retriever
   ↓
Relevant app data
   ↓
LLM reasoning
   ↓
Grounded response
```

Apple 플랫폼에서는 retrieval layer를 Core Spotlight와 `SpotlightSearchTool`로 구성한다.

여기에 다음이 추가된다.

```text
Hydration
→ full source content 제공

Guidance
→ search grammar/context 축소

Resolver
→ ambiguous references 해결

Pipeline
→ retrieval + computation

Evaluations
→ end-to-end 품질 측정
```

즉 단순 "LLM에게 검색 결과를 넘기는" 수준보다 훨씬 구조화된 시스템이다.

---

# 🔬 Search와 Reasoning의 역할 분리

세션에서 가장 중요한 architectural point 중 하나는 계산과 reasoning을 어디에 둘 것인지다.

단순 질문:

```text
What hikes have I gone on?
```

→ retrieval 결과를 모델이 reasoning하면 충분하다.

복잡한 질문:

```text
For each month, how many miles did I hike on average?
```

→ search pipeline에서 grouping/count/average를 먼저 처리할 수 있다.

이렇게 하면 model context에 대규모 raw item을 넣지 않고 compact한 computed result만 전달할 수 있다.

---

# 📐 Quality Loop

세션의 전체 개발 흐름은 일회성 integration이 아니라 반복 개선 구조다.

```text
Index Content
      ↓
SpotlightSearchTool
      ↓
Model Response
      ↓
Evaluation
      ↓
Coverage / Trajectory Metrics
      ↓
Index Metadata / Guidance / Pipeline 수정
      ↺
```

이 구조를 통해 search tuning과 model prompt/guidance tuning을 같은 evaluation loop에 넣을 수 있다.

---

# 핵심 메시지

WWDC26의 `SpotlightSearchTool`은 Core Spotlight를 단순한 앱 검색 인덱스에서 **Foundation Models의 retrieval substrate**로 확장한다.

개발자는 더 이상 모든 자연어 요청을 직접 Spotlight query로 변환할 필요가 없다.

대신:

```text
좋은 콘텐츠를 Index에 제공하고
       ↓
필요한 Metadata를 잘 설계하고
       ↓
모델이 Tool을 통해 검색하게 하고
       ↓
복잡한 작업은 Pipeline Stage로 처리하고
       ↓
Evaluation으로 실제 Coverage를 측정한다.
```

`SpotlightSearchTool` 자체는 몇 줄로 연결할 수 있지만 실제 품질은 다음 요소에서 결정된다.

- Index metadata quality
- Full-item hydration
- Guidance scope
- Reference resolution
- Search pipeline design
- Evaluation coverage

특히 이번 세션은 Foundation Models 기반 검색을 "모델에게 모든 데이터를 넣고 답하게 하는 방식"이 아니라, **검색 → 선택적 hydration → 계산 → reasoning**으로 나누어 설계한다는 점에서 중요하다.

마지막 메시지는 이 변화를 가장 간결하게 요약한다.

```text
콘텐츠를 제공하고,
검색 query 작성 자체는 intelligence에 맡긴다.
```

---

# 함께 보면 좋은 세션과 자료

- Deep dive into the Foundation Models framework — WWDC26
- Supporting semantic search with Core Spotlight
- Create robust evaluations for an agentic app — WWDC26
- Spotlight search tool documentation
- Making your indexed content available to Foundation Models
