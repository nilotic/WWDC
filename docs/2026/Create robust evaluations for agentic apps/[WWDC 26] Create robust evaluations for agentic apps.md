# WWDC26 Create robust evaluations for agentic apps 요약

- Session: 299
- Title: Create robust evaluations for agentic apps
- Source: https://developer.apple.com/videos/play/wwdc2026/299/
- Topic: Evaluations, Synthetic Data, Tool Calling, Foundation Models, Agentic Workflows
- Chapters: Introduction, The dataset problem in BookTracker, Generating synthetic data with makeSamples, Customizing generation with SampleGenerator, Sampling strategies, Validating synthetic samples, Comparing evaluation results, Tool calling and tool evaluations, Trajectory expectations, Building a tool call evaluation, Synthetic data for tool evaluations, Next steps

---

## 한 줄 요약

이 세션은 Evaluations framework의 합성 데이터 생성과 도구 호출 평가 기능을 이용해, 지능형 기능이 **다양한 현실 입력을 얼마나 안정적으로 처리하는지**와 **올바른 도구를 올바른 인자와 순서로 호출하는지**를 함께 검증하는 방법을 설명한다.

---

## 핵심 요약

이번 세션은 Evaluations framework를 규모가 커지고 복잡해지는 지능형 기능에 적용하는 두 가지 방법을 소개한다.

- **합성 데이터 생성**
  - 적은 수의 수동 샘플을 더 다양한 평가 데이터셋으로 확장
  - `makeSamples`와 `SampleGenerator` 사용
  - 온디바이스 모델, Private Cloud Compute 모델, 사용자 지정 모델 활용
  - Random과 Sliding Window 샘플링 전략
  - validator를 통한 생성 샘플 검증
  - 유효 샘플과 유효하지 않은 샘플 분리

- **도구 호출 평가**
  - 최종 응답뿐 아니라 작업 수행 과정까지 검증
  - 올바른 도구 호출 여부
  - 도구 인자 검증
  - 여러 도구의 호출 순서 검증
  - 호출하면 안 되는 도구 검증
  - `TrajectoryExpectation`과 `ToolCallEvaluator` 사용
  - 도구 평가 데이터셋도 합성 데이터로 확장

Evaluations framework는 Xcode 27에서 새롭게 제공되며 macOS, iOS, watchOS, visionOS를 지원한다.

---

# 🧭 평가 주도 개발의 위치

세션은 지능형 기능을 만들고 개선하는 과정을 hill-climbing 형태로 설명한다.

전체 과정은 다음 흐름을 반복한다.

- 기능 개발
- 평가
- 결과 분석
- 프롬프트·지시문·도구·데이터 개선
- 다시 평가
- 품질 확인 후 배포

이번 세션은 그중 **Develop**와 **Evaluate** 단계에 집중한다.

개발 초기에는 보통 몇 개의 예제만으로 평가를 시작하지만, 실제 기능은 초기 데이터셋보다 훨씬 복잡하다.

작은 데이터셋은 다음 문제를 가진다.

- 실제 입력의 다양성을 포착하지 못함
- 특정 장르나 문체에 편향될 수 있음
- 엣지 케이스가 부족함
- 결과가 좋아 보여도 실제 품질을 대표하지 못함
- 데이터 작성에 많은 수작업이 필요함
- 기능이 성장할수록 유지하기 어려움

평가 결과의 품질은 평가에 사용한 데이터의 품질과 대표성에 직접 영향을 받는다.

---

# 📚 BookTracker 예제

세션에서는 개인 도서 관리 앱인 BookTracker를 사용한다.

BookTracker에는 사용자가 작성한 리뷰를 바탕으로 책의 태그를 자동 생성하는 지능형 기능이 있다.

`Book` 모델에는 다음 정보가 포함된다.

- 제목
- 저자
- 리뷰
- 태그
- 평점
- 표지 디자인을 위한 추가 값

초기 평가 데이터셋은 13개의 책 샘플로 구성된다.

13개 샘플은 시작점으로는 충분해 보일 수 있지만 실제 환경에는 다음과 같은 다양성이 존재한다.

- 매우 많은 책
- 수백 개의 장르
- 서로 다른 분위기와 문체
- 짧거나 긴 리뷰
- 모호하거나 불완전한 요약
- 감정 중심 리뷰
- 줄거리 중심 리뷰
- 여러 장르가 혼합된 책
- 예상하기 어려운 사용자 표현

따라서 13개 샘플만으로 높은 평가 점수를 얻더라도 실제 성능이 좋다고 결론 내리기 어렵다.

---

# 🧪 합성 데이터가 필요한 이유

좋은 평가 데이터를 사람이 직접 만드는 작업은 어렵고 시간이 많이 든다.

합성 데이터는 모델을 이용해 기존 샘플을 바탕으로 새로운 평가 사례를 생성한다.

Evaluations framework의 합성 데이터 API는 다음 환경에서 사용할 수 있다.

- 앱 코드
- 명령줄 도구
- 기존 자동화 파이프라인
- CI 워크플로
- 로컬 평가 도구

텍스트 기반 데이터뿐 아니라 `@Generable` 매크로를 활용한 구조화된 데이터도 생성할 수 있다.

합성 데이터의 목적은 단순히 데이터 개수를 늘리는 것이 아니다.

핵심은 실제 기능 사용 방식의 의미 있는 다양성을 더 넓게 포함하는 것이다.

---

# 🌱 `makeSamples`로 데이터셋 확장

가장 간단한 합성 데이터 생성 방법은 `makeSamples` API다.

`makeSamples`에는 세 가지 주요 입력이 필요하다.

| 입력 | 역할 |
|---|---|
| Prompt | 어떤 종류의 새 샘플을 만들지 설명 |
| Dataset | 생성의 출발점이 되는 기존 샘플 |
| Target count | 기존 샘플을 포함한 최종 데이터셋 크기 |

BookTracker 예제에서는 모델에 더 다양한 책 리뷰 샘플을 제안하도록 요청한다.

초기 데이터셋은 13개의 `sampleBooks`다.

각 평가 샘플은 다음 구조를 사용한다.

- Prompt: 책 리뷰
- Expected output: 책 태그

목표 개수를 100으로 설정하면 모델이 100개의 새 샘플을 추가하는 것이 아니다.

`targetCount`는 초기 데이터셋을 포함한 최종 개수다.

따라서 초기 샘플이 13개라면 새로 생성되는 샘플은 87개다.

---

# 🎯 데이터 개수보다 Coverage

얼마나 많은 샘플이 필요한지는 기능마다 다르다.

100개는 BookTracker 예제에서도 최종 정답이 아니라 시작점이다.

적절한 데이터 크기는 다음 요소에 따라 달라진다.

- 기능이 수행하는 작업
- 대상 사용자
- 입력 형식
- 입력 가능한 언어와 문체
- 지원하는 도메인
- 기능의 위험도
- 가능한 엣지 케이스
- 사용자와 기능이 상호작용하는 방식

따라서 “몇 개의 샘플이 필요한가?”보다 다음 질문이 더 중요하다.

> 실제로 이 기능이 사용되는 의미 있는 다양한 상황을 충분히 포함했는가?

합성 데이터 생성은 반복적인 과정이다.

- 초기 데이터셋 정의
- 합성 데이터 생성
- 샘플 검증
- 대표성 분석
- 부족한 범주와 엣지 케이스 확인
- 프롬프트와 데이터 수정
- 다시 생성

충분한 coverage를 확보할 때까지 이 과정을 반복한다.

---

# 🌊 비동기 스트림으로 생성 결과 처리

`makeSamples`는 새로 생성된 샘플을 비동기 스트림으로 반환한다.

앱은 각 샘플이 생성되는 즉시 처리할 수 있다.

예제에서는 초기 데이터셋으로 `expandedDataset`을 만들고, 스트림에서 전달되는 샘플을 순서대로 추가한다.

이 방식은 다음 작업에 유용하다.

- 생성 진행 상황 표시
- 샘플을 점진적으로 저장
- 일정 개수마다 중간 검증
- 긴 생성 작업의 취소 처리
- 생성 결과를 바로 평가 파이프라인으로 전달

기본적으로 합성 데이터 생성에는 온디바이스 모델이 사용된다.

---

# ⚙️ `SampleGenerator`로 생성 과정 제어

기본 prompt, dataset, target count보다 더 많은 제어가 필요할 때는 `SampleGenerator`를 사용한다.

`SampleGenerator`는 다음 항목을 사용자화할 수 있다.

- 생성에 사용할 모델
- 시스템 수준의 지시문
- 세션 구성
- 샘플링 전략
- validation metric
- 초기 데이터셋
- 목표 데이터 크기

BookTracker 예제에서는 더 큰 context size를 활용하기 위해 `PrivateCloudComputeLanguageModel`을 사용한다.

사용자 지정 지시문에는 다음 내용을 포함할 수 있다.

- 생성할 책의 범위
- 장르
- 분위기
- 리뷰 스타일
- 리뷰 길이
- 태그 형식
- 생성 샘플이 따라야 할 규칙

---

# 🔌 `sessionProvider`

`sessionProvider`는 `LanguageModelSession`을 반환하는 closure다.

이 closure에서 다음을 결정한다.

- 어떤 모델을 사용할지
- 모델에 전달할 system-level instructions
- 생성 작업의 전체 맥락
- 사용할 도구 또는 추가 설정

Generator는 일반적으로 실행을 시작할 때 `sessionProvider`를 호출한 뒤, 같은 세션을 여러 batch에 걸쳐 재사용한다.

같은 세션을 재사용하면 생성 과정에서 모델이 이전 맥락을 어느 정도 유지할 수 있다.

하지만 세션에는 context window 제한이 있다.

다음 조건에서는 실행 중 context가 소진될 수 있다.

- 요청 횟수가 많음
- 입력 prompt가 큼
- 생성 출력이 큼
- 샘플 하나의 구조가 복잡함
- 목표 개수가 매우 큼

Context window가 소진되면 generator는 `sessionProvider`를 다시 호출해 새로운 세션으로 생성을 계속한다.

새 세션은 이전 세션의 맥락을 포함하지 않는다.

따라서 `sessionProvider`의 지시문은 다음 조건을 만족해야 한다.

- 자체적으로 완전한 설명을 포함
- 이전 세션에 의존하지 않음
- 첫 호출에만 필요한 정보라고 가정하지 않음
- 생성 규칙과 도구 설명을 매번 동일하게 제공

---

# 🪟 Sampling Strategy

Sampling strategy는 초기 데이터셋 중 어떤 샘플을 in-context example로 모델에 보여줄지 결정한다.

세션에서는 두 가지 전략을 소개한다.

## Random

초기 샘플에서 중복 없이 임의의 하위 집합을 선택한다.

장점은 다음과 같다.

- 생성 결과의 다양성을 높일 수 있음
- 초기 데이터의 순서를 따로 설계할 필요가 없음
- 서로 다른 예시 조합을 모델에 제공
- 일반적인 unordered dataset에 적합

BookTracker의 샘플은 의미 있는 순서가 없기 때문에 Random 전략을 사용한다.

Random은 기본 전략이므로 명시적으로 설정하지 않아도 된다.

## Sliding Window

초기 샘플을 순서대로 이동하며 선택한다.

중복은 건너뛴다.

다음과 같은 데이터에 적합하다.

- 시간 순서가 있는 데이터
- 난이도 순서
- 단계별 대화
- 특정 범주별로 정렬된 샘플
- 이전·이후 샘플의 관계가 중요한 데이터

데이터의 순서가 의미를 가진다면 Sliding Window를 고려할 수 있다.

---

# ✅ 생성 샘플 검증

좋은 지시문을 제공해도 모델이 모든 규칙을 항상 지킨다고 보장할 수는 없다.

`validator` closure는 새로 생성된 각 샘플을 받아들이거나 거부하는 로직을 정의한다.

BookTracker에서는 다음 규칙을 사용한다.

- 리뷰는 최소 100자
- 리뷰는 다양한 장르, 분위기, 문체를 포함
- 리뷰 길이는 서로 다양해야 함
- 태그는 3개 이상 8개 이하
- 모든 태그는 소문자

이 중 일부는 개별 샘플만으로 검증할 수 있다.

- 리뷰가 100자 이상인지
- 태그 개수가 3~8개인지
- 태그가 모두 소문자인지

반면 다음 항목은 개별 샘플 검증만으로 확인하기 어렵다.

- 전체 데이터셋의 장르 다양성
- 전체 데이터셋의 분위기 다양성
- 리뷰 길이의 전체 분포
- 특정 범주의 과도한 중복
- 데이터셋 전체의 대표성

Validator는 각각의 생성 샘플을 독립적으로 평가하며 다른 샘플의 맥락을 알지 못한다.

따라서 개별 구조 검증과 데이터셋 전체 분석을 구분해야 한다.

---

# 🗃️ 유효 샘플과 Invalid Samples

합성 데이터 생성 중 validation을 통과한 샘플은 generator의 `samples`에 저장된다.

검증에 실패한 샘플은 자동으로 `invalidSamples`에 분리된다.

두 컬렉션은 생성 과정 중 실시간으로 갱신된다.

따라서 다음 시점에 확인할 수 있다.

- 스트림을 순회하는 도중
- 중간 진행 상황 확인 시
- 생성 완료 후
- 저장 직전
- 평가 실행 전

Invalid sample을 버리는 것만으로 끝내지 않고 실패 이유를 분석하면 생성 prompt와 validator를 개선할 수 있다.

예를 들어 다음을 확인할 수 있다.

- 특정 규칙이 너무 자주 위반되는지
- 지시문이 모호한지
- 목표 형식이 지나치게 복잡한지
- 모델이 특정 항목을 잘 이해하지 못하는지
- validator가 지나치게 엄격한지

---

# 📊 Evaluations Report 비교

Xcode 27은 평가 결과를 시각화하는 Evaluations Report를 제공한다.

BookTracker의 초기 13개 샘플 평가에서는 태그의 관련성과 유용성 점수가 높게 나타난다.

하지만 100개의 확장 데이터셋으로 평가하면 점수가 낮아진다.

점수가 낮아졌다는 것은 평가가 나빠진 것이 아니라 이전 평가가 현실의 다양성을 충분히 반영하지 못했음을 보여줄 수 있다.

확장된 데이터셋에서 점수가 낮아지는 원인은 여러 가지일 수 있다.

- Prompt가 다양한 입력을 처리하지 못함
- System instructions가 충분하지 않음
- 지능형 기능 자체에 빈틈이 있음
- 평가 기준이 실제 목표와 맞지 않음
- 데이터셋의 일부 범주가 과도하게 어렵거나 편향됨
- 여전히 대표성이 부족함
- 더 많은 엣지 케이스가 필요함

Compare 기능을 사용하면 서로 다른 평가 실행의 점수 변화를 확인할 수 있다.

평가 점수 변화는 다음 개선 작업의 신호로 사용한다.

- Prompt 수정
- Instruction 수정
- 기능 로직 개선
- 평가 metric 조정
- 데이터셋 확대
- 누락된 입력 범주 추가
- 엣지 케이스 추가

---

# 🤖 Tool Calling 평가가 필요한 이유

지능형 기능은 최종 텍스트만 생성하지 않고 앱 안에서 여러 작업을 수행할 수 있다.

Tool은 모델이 실제 데이터와 앱 기능을 사용하도록 구조를 제공한다.

도구는 다음 작업을 할 수 있다.

- 앱의 실제 데이터 검색
- 비즈니스 로직 실행
- 사용자가 직접 실행할 수 있는 기능 호출
- 지능형 기능 전용 내부 로직 실행
- 여러 작업을 단계적으로 연결

최종 답변이 자연스럽고 맞아 보여도 올바른 도구를 사용했다고 보장할 수는 없다.

예를 들어 모델이 실제 데이터 검색 없이 추측한 답을 제공할 수 있다.

따라서 최종 결과인 **what**뿐 아니라 결과에 도달한 과정인 **how**도 평가해야 한다.

Tool evaluation은 다음을 확인한다.

- 올바른 도구를 호출했는가
- 필요한 도구를 빠뜨리지 않았는가
- 인자를 올바르게 제공했는가
- 여러 도구를 올바른 순서로 호출했는가
- 호출하면 안 되는 도구를 호출하지 않았는가
- 예상하지 못한 중간 도구 호출이 없었는가

---

# 🔎 BookTracker Library Assistant

BookTracker에는 사용자의 요청을 해석해 책을 검색하는 Library Assistant가 추가된다.

단순한 제목 문자열 필터링이 아니라 앱의 도구를 단계적으로 호출한다.

세션에서 사용하는 도구는 다음과 같다.

| Tool | 역할 |
|---|---|
| `searchBooks` | 태그, 장르, 분위기 등을 기준으로 책 후보 검색 |
| `getBookDetails` | 검색된 책의 출판일 등 상세 메타데이터 조회 |
| `findSimilarBooks` | 의미 기반 검색으로 유사한 책 탐색 |

여러 단계가 필요한 요청에서는 도구가 연결된다.

예를 들면 다음과 같다.

- `searchBooks`로 후보 검색
- 결과에서 book ID 확보
- `getBookDetails`로 상세 정보 조회
- 필요하면 `findSimilarBooks`로 유사 도서 검색

---

# 🧰 Tool 정의와 Argument

Tool은 `Tool` protocol을 채택한다.

모델이 도구를 이해할 수 있도록 다음을 정의한다.

- 도구 이름
- 도구를 사용해야 하는 상황을 설명하는 description
- 입력 argument
- 실행 로직

Argument는 `@Generable` 구조로 정의할 수 있다.

`SearchBooksTool`의 검색 조건은 모두 optional일 수 있다.

모델은 사용자의 표현에 따라 필요한 필드만 선택한다.

예:

| 사용자 요청 | 기대하는 argument |
|---|---|
| “Find gothic books” | tag에 `gothic` |
| “Show me something cheerful” | mood 관련 검색 값 |
| 특정 작가의 책 요청 | author 필드 |
| 최근 출판 도서 요청 | 날짜 또는 상세 조회 도구 |

도구 평가에서는 모델이 어떤 인자를 선택했는지도 검증한다.

---

# 🛤️ `TrajectoryExpectation`

Tool evaluation의 중심은 `TrajectoryExpectation`이다.

Language model session transcript에는 다음 정보가 함께 포함된다.

- 사용자 prompt
- 모델 응답
- 도구 호출
- 도구 argument
- 도구 결과
- 다음 도구 호출
- 최종 응답

Trajectory expectation은 이 transcript에 포함된 도구 호출의 종류와 순서를 검사한다.

이를 목적지뿐 아니라 경로를 검증하는 방식으로 이해할 수 있다.

같은 목적지에 도착하더라도 잘못된 교통수단이나 잘못된 순서를 사용했다면 실패로 볼 수 있다.

---

# 🔀 Unordered Expectation

간단한 경우에는 도구가 호출되기만 하면 되고 정확한 시점은 중요하지 않을 수 있다.

예를 들어 prompt가 다음과 같다고 가정한다.

> Find books tagged gothic.

기대 동작은 `searchBooks`가 한 번 호출되는 것이다.

Unordered expectation은 transcript의 어느 위치에서 호출되었는지보다 해당 호출이 존재하는지를 확인한다.

이 방식은 다음 상황에 적합하다.

- 도구 호출 순서가 결과에 영향을 주지 않음
- 단일 도구 호출
- 다른 부가 호출 사이에서 위치가 중요하지 않음

---

# 🎚️ Argument Matcher

도구 이름뿐 아니라 argument도 expectation에 포함할 수 있다.

`gothic` 태그 검색처럼 정확한 값이 중요한 경우에는 exact match를 사용할 수 있다.

하지만 자연어 기반 argument는 정확한 문자열보다 의미가 중요할 수 있다.

예를 들어 사용자가 “something cheerful”을 요청하면 모델은 다음 중 하나를 사용할 수 있다.

- cheerful
- happy
- uplifting

모두 사용자의 의도에 부합할 수 있다.

이 경우 `.naturalLanguage` matcher를 사용해 문자열 일치가 아니라 의도 일치를 검사할 수 있다.

세션에서 언급한 matcher 유형은 다음과 같다.

| Matcher | 용도 |
|---|---|
| Exact | 값이 정확히 일치해야 함 |
| Natural language | 의미와 의도가 일치하는지 검사 |
| Contains | 특정 값이나 부분이 포함되는지 검사 |
| One of | 허용된 여러 값 중 하나인지 검사 |
| Pattern | 지정 패턴에 맞는지 검사 |
| Range | 숫자가 허용 범위에 있는지 검사 |

Argument의 성격에 따라 적절한 matcher를 선택해야 한다.

---

# 🔗 Ordered Trajectory

여러 단계가 서로 의존한다면 도구 호출 순서가 중요하다.

예를 들어 다음 순서가 필요하다.

- 먼저 `searchBooks`
- 이후 `getBookDetails`

`getBookDetails`는 검색 결과에서 book ID를 얻은 뒤에만 실행할 수 있다.

모델이 상세 정보 도구를 먼저 호출하면 필요한 ID가 없으므로 잘못된 경로다.

Ordered trajectory expectation은 이러한 순서 오류를 포착한다.

다음과 같은 agentic workflow에 적합하다.

- 검색 후 상세 조회
- 인증 후 데이터 수정
- 파일 열기 후 편집
- 위치 조회 후 경로 계산
- 후보 검색 후 예약
- 입력 검증 후 결제

---

# 🚫 Disallowed Tools

어떤 도구를 사용하지 않아야 하는지도 중요한 평가 조건이다.

예를 들어 사용자 요청에 다음 조건이 포함될 수 있다.

> Do not look for similar books.

이때 모델이 `findSimilarBooks`를 호출하면 최종 답변이 그럴듯해도 사용자 지시를 위반한 것이다.

`disallowed`는 transcript에 나타나면 안 되는 도구를 지정한다.

이를 통해 다음을 검증할 수 있다.

- 사용자 거부 조건 준수
- 개인정보에 접근하는 도구 제한
- 비용이 높은 도구의 불필요한 호출 방지
- 읽기 전용 요청에서 수정 도구 호출 방지
- 승인 전 실행하면 안 되는 동작 차단
- 중복 호출이나 예기치 않은 우회 방지

---

# 🧾 `ToolCallEvaluator`

전체 Tool evaluation은 prompt와 `TrajectoryExpectation`을 포함한 샘플 데이터셋으로 구성한다.

`ToolCallEvaluator`는 다음 작업을 수행한다.

- 도구가 등록된 `LanguageModelSession` 생성
- 평가 prompt 실행
- 모델 응답 생성
- 구조화된 session transcript 수집
- 실제 도구 호출을 expectation과 비교
- 평가 결과와 실패 원인 기록

Tool call 평가 결과는 다른 평가 결과와 함께 Xcode의 평가 리포트에서 확인할 수 있다.

이를 통해 최종 출력 평가와 실행 과정 평가를 한곳에서 비교할 수 있다.

---

# 🧬 Tool Evaluation용 합성 데이터

도구 평가 샘플도 합성 데이터로 확장할 수 있다.

`ModelSample`과 `TrajectoryExpectation`은 생성 가능한 구조이므로 `SampleGenerator`를 동일하게 활용할 수 있다.

도구 평가용 합성 데이터를 만들 때는 모델이 앱의 도구를 자동으로 알고 있다고 가정하면 안 된다.

`sessionProvider`의 지시문에 다음 내용을 명확하게 제공해야 한다.

- 사용 가능한 도구 목록
- 각 도구의 목적
- 도구를 사용해야 하는 조건
- argument 의미
- 필요한 호출 순서
- 호출하면 안 되는 상황
- 기대하는 trajectory 형식

초기 tool evaluation dataset과 목표 개수를 제공해 더 많은 prompt와 expectation 쌍을 생성할 수 있다.

세션 예제에서는 목표를 100개로 설정한다.

---

# 🛡️ Tool Synthetic Sample 검증

도구 평가용 합성 샘플에도 validator를 적용한다.

예제의 검증 조건은 다음과 같다.

- 각 샘플에 trajectory expectation이 존재
- 최소 하나 이상의 도구가 expectation에 포함
- expectation에 포함된 도구가 앱에 실제로 정의된 도구
- 잘못된 도구 이름이나 존재하지 않는 도구가 포함되지 않음

추가로 다음 검증도 고려할 수 있다.

- 필수 argument가 expectation에 포함되는지
- ordered 작업의 순서가 유효한지
- disallowed와 required 도구가 충돌하지 않는지
- 인자 범위가 실제 API 제약과 맞는지
- prompt의 의도와 trajectory가 일치하는지

합성 데이터는 평가 작성 능력을 넘어 더 큰 데이터셋을 만들 수 있게 하지만, 생성 결과의 유효성과 대표성은 반드시 검증해야 한다.

---

# 🧩 Output Evaluation과 Tool Evaluation 결합

BookTracker의 태그 생성 평가는 모델이 **무엇을 만들었는지** 확인한다.

예:

- 태그 개수
- 장르 coverage
- 태그 관련성
- 태그 유용성
- 형식 규칙

Tool evaluation은 모델이 **어떻게 결과에 도달했는지** 확인한다.

예:

- 올바른 도구
- 올바른 argument
- 올바른 호출 순서
- 불필요하거나 금지된 도구가 없는지

두 평가를 하나의 suite에서 실행하면 다음을 함께 검증할 수 있다.

- 최종 품질
- 실행 과정
- 지시문 준수
- 실제 데이터 사용
- 도구 선택
- agentic workflow의 안정성

최종 결과와 과정 중 하나만 평가하면 중요한 문제를 놓칠 수 있다.

---

# 🔁 전체 개선 흐름

세션에서 제시한 평가 개선 흐름은 다음과 같다.

| 단계 | 작업 |
|---|---|
| 초기 샘플 작성 | 대표적인 소수 사례로 시작 |
| Synthetic generation | 데이터셋을 더 다양한 사례로 확장 |
| Validation | 생성 형식과 규칙을 자동 검증 |
| Dataset analysis | 전체 coverage와 분포 검토 |
| Output evaluation | 최종 결과의 품질 평가 |
| Tool evaluation | 도구, argument, 순서 평가 |
| Comparison | 이전 평가와 새 평가 비교 |
| Improvement | Prompt, instruction, tool, feature, dataset 수정 |
| Re-evaluation | 같은 suite로 다시 실행 |

이 과정을 반복하면서 실제 환경을 더 잘 대표하는 평가 체계를 만든다.

---

# 📋 체크리스트

## 합성 데이터

- [ ] 초기 데이터셋이 핵심 사용 사례를 포함하는지 확인
- [ ] `targetCount`가 기존 샘플을 포함한 최종 개수임을 반영
- [ ] 데이터 개수보다 coverage를 중심으로 목표 설정
- [ ] 실제 사용자의 문체와 불완전한 입력 포함
- [ ] 장르, 분위기, 길이, 난이도 다양성 검토
- [ ] `makeSamples`와 `SampleGenerator` 중 적절한 API 선택
- [ ] 모델과 system instructions를 `sessionProvider`에 완전하게 정의
- [ ] 새 세션이 이전 세션의 맥락을 갖지 않는다는 점 반영
- [ ] 대규모 생성 시 context window 소진 처리
- [ ] 데이터 순서에 맞는 sampling strategy 선택
- [ ] 개별 샘플에서 검증 가능한 규칙과 전체 데이터셋 규칙 분리
- [ ] validator 실패 이유 기록
- [ ] `samples`와 `invalidSamples`를 각각 검토
- [ ] 생성 후 데이터셋 전체의 대표성과 분포 분석
- [ ] 합성 데이터에 수동 검토 샘플을 포함할지 결정

## 평가 결과

- [ ] 작은 데이터셋의 높은 점수를 실제 품질로 단정하지 않기
- [ ] Xcode Evaluations Report에서 이전·이후 실행 비교
- [ ] 점수 변화가 prompt, instruction, 기능, 평가 기준, 데이터 중 어디에서 발생했는지 분석
- [ ] 낮은 점수를 단순 실패가 아니라 개선 신호로 활용
- [ ] 새로운 엣지 케이스를 지속적으로 데이터셋에 추가

## Tool Calling

- [ ] 각 Tool의 이름과 description이 명확한지 확인
- [ ] Argument를 모델이 이해할 수 있는 구조로 정의
- [ ] 사용자 요청별 기대 Tool을 지정
- [ ] 정확한 값과 의미 기반 값에 맞는 matcher 선택
- [ ] 여러 단계 작업은 호출 순서를 검증
- [ ] 결과에 필요한 선행 Tool이 빠지지 않았는지 확인
- [ ] 호출하면 안 되는 Tool을 `disallowed`로 지정
- [ ] 예상하지 못한 중간 Tool 호출 검토
- [ ] Tool failure와 빈 결과를 포함한 엣지 케이스 추가
- [ ] Tool evaluation prompt에 사용 가능한 도구와 규칙을 충분히 설명
- [ ] 합성 trajectory가 실제 정의된 Tool만 사용하는지 검증
- [ ] Output evaluation과 Tool evaluation을 같은 suite에서 실행

---

# 핵심 메시지

신뢰할 수 있는 지능형 기능을 만들려면 최종 답변만 평가해서는 충분하지 않다.

평가 데이터는 실제 사용 방식의 다양성을 대표해야 하며, 합성 데이터는 초기 데이터셋을 더 넓은 범위로 확장하는 데 도움을 준다.

Agentic workflow에서는 모델이 어떤 도구를 어떤 인자와 순서로 호출했는지도 검증해야 한다.

출력 평가와 도구 평가를 함께 사용하면 모델이 **올바른 결과를 만들었는지**와 **올바른 방식으로 그 결과에 도달했는지**를 모두 확인할 수 있다.

---

# 함께 보면 좋은 세션

- Meet the Evaluations framework
- Improve your prompts by hill climbing with Evaluations
- Build agentic app experiences with the Foundation Models framework
