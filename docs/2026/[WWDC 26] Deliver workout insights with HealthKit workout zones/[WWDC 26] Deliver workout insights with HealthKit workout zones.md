# WWDC26 Debug and profile agentic app experiences with Instruments 요약

- Session: 243
- Title: Debug and profile agentic app experiences with Instruments
- Source: https://developer.apple.com/videos/play/wwdc2026/243/
- Topic: Foundation Models, Instruments, DynamicInstructions, Tool Calling, Agentic Workflows, Performance
- Chapters: Introduction, LLM app development mindset, Inspect and diagnose an agentic experience, Recording a trace with Instruments, Navigating the Instruments UI, Performance metrics, Next steps

---

## 한 줄 요약

향상된 Foundation Models Instrument를 사용하면 agentic workflow의 session, request, model inference, instructions, prompt, response, tool call을 하나의 trace에서 추적하고, 잘못된 tool 구성이나 instruction 전환 실패 같은 논리 문제부터 Time to First Token·Tokens per Second·Total Latency 같은 성능 문제까지 분석할 수 있다.

---

## 핵심 요약

이번 세션은 Foundation Models framework로 만든 agentic 기능을 Instruments에서 추적하고 디버깅하는 방법을 설명한다.

- **LLM 앱의 세 가지 어려움**
  - 같은 입력에서도 결과가 달라질 수 있는 probabilistic output
  - 여러 모델 또는 session 사이의 데이터 전달
  - 복잡한 agentic flow에서의 observability

- **Foundation Models Instrument**
  - Xcode의 Product > Profile에서 Foundation Models template 선택
  - prompt와 response를 포함한 trace 기록
  - 민감한 정보가 포함될 수 있으므로 trace 파일을 안전하게 관리

- **Agentic flow 분석**
  - Instructions lane에서 활성 instruction set 확인
  - Model Inference lane에서 prompt 처리와 response 생성 시간 확인
  - Tree view에서 session → request → inference → tool call 흐름 추적
  - DynamicInstructions와 tool configuration 문제 진단

- **성능 분석**
  - Time to First Token
  - Tokens per Second
  - Total Latency
  - Token usage

세션의 예제에서는 brainstorming mode에서 tutorial mode로 전환되지 않는 silent failure를 Instruments로 찾아내고, 누락된 `SwitchToTutorialModeTool`을 toolset에 추가한 뒤 다시 trace를 기록해 수정 결과를 검증한다.

---

# 🧭 Foundation Models Instrument

Foundation Models framework는 온디바이스와 서버 기반 생성형 AI를 앱에서 사용할 수 있게 한다.

이를 이용해 다음과 같은 기능을 만들 수 있다.

- 자연어 이해
- 콘텐츠 생성
- 사용자의 현재 상황에 반응하는 기능
- Tool calling
- 여러 단계의 agentic workflow

`DynamicInstructions`는 요청 전마다 다시 평가되어 현재 상황에 맞는 instructions와 tools를 모델에 제공한다.

이 유연성은 기능을 더 동적으로 만들지만 동시에 디버깅을 어렵게 만든다.

예를 들어 다음 문제가 발생할 수 있다.

- 모델에 필요한 tool이 제공되지 않음
- 잘못된 instruction set이 계속 유지됨
- instruction 전환 시점이 예상과 다름
- 여러 request 사이에 필요한 context가 전달되지 않음
- tool call은 수행되지만 잘못된 경로로 진행
- 명시적 오류 없이 기능만 잘못 동작

Foundation Models Instrument는 이런 내부 실행 흐름을 trace로 확인하는 도구다.

---

# 🎲 Probabilistic Output

전통적인 함수는 동일 입력에 대해 예측 가능한 출력을 반환한다.

LLM은 같은 prompt를 여러 번 실행해도 서로 다른 response가 나올 수 있다.

따라서 정확한 문자열을 hardcode해서 비교하는 전통적인 unit test만으로는 충분하지 않다.

대신 다음 요소를 평가해야 한다.

- 응답의 품질
- 의도 충족 여부
- 지시사항 준수
- 필요한 정보 포함 여부
- 기능 목적에 적합한 결과인지

---

# 🔗 Model-to-Model Communication

복잡한 기능에서는 하나의 모델만 사용하는 것이 아니라 여러 모델이 함께 작업할 수 있다.

세션에서는 다음과 같은 예를 든다.

1. 한 모델이 사진에서 재료를 식별
2. 다른 모델이 그 결과를 이용해 레시피 생성

이 경우 중요한 것은 모델 간 데이터 전달이다.

확인해야 하는 항목은 다음과 같다.

- 이전 단계의 결과가 올바르게 전달되는가
- 다음 모델이 필요한 context를 받았는가
- 중간 결과가 예상 형식과 일치하는가
- 실패했을 때 어느 단계에서 문제가 발생했는가

여러 `LanguageModelSession` 또는 instruction profile이 연결되는 agentic workflow에서는 이런 흐름을 직접 추적할 수 있는 도구가 필요하다.

---

# 🔍 Observability

여러 모델과 도구가 연결된 pipeline에서는 최종 결과만 보고 원인을 찾기 어렵다.

다음 정보에 대한 가시성이 필요하다.

- 모델이 어떤 prompt를 받았는가
- 어떤 instructions가 활성화되어 있었는가
- 어떤 tools를 사용할 수 있었는가
- 어떤 tool을 실제로 호출했는가
- 어떤 argument가 전달되었는가
- instruction set이 언제 변경되었는가
- 어느 request 또는 inference가 오래 걸렸는가

Foundation Models Instrument는 이런 정보를 trace 안에서 확인할 수 있게 한다.

---

# 🔄 기본 LLM Flow와 Tool Calling

간단한 LLM 기능은 다음 흐름을 가진다.

```text
사용자 Prompt
      ↓
Model reasoning
      ↓
Response
```

Tool calling이 필요하면 흐름이 길어진다.

```text
사용자 Prompt
      ↓
Model reasoning
      ↓
Tool call
      ↓
Tool 실행
      ↓
Tool result
      ↓
Model reasoning
      ↓
Response
```

이 loop는 필요에 따라 반복될 수 있다.

단계가 추가될수록 다음도 늘어난다.

- Latency
- Failure point

따라서 agentic 기능에서는 최종 response만 보는 것이 아니라 전체 loop를 추적해야 한다.

---

# 🧶 예제 앱: Craft

세션에서는 craft project를 관리하는 companion app을 예제로 사용한다.

앱은 다음 기능을 제공한다.

- Craft progress 기록
- 특정 craft에 관한 질문
- Tutorial 생성
- 새로운 craft 아이디어 brainstorming

새로운 brainstorming 기능은 사용자가 모델과 대화하면서 아이디어를 좁혀가고, 만들 craft를 결정하면 상세 tutorial을 생성한다.

이 경험에는 두 instruction set이 사용된다.

| Instruction | 역할 |
|---|---|
| Brainstorming instructions | Craft 아이디어 탐색 |
| Tutorial generation instructions | 선택한 craft의 상세 tutorial 생성 |

Brainstorming instructions에는 원래 다음 두 tools가 필요하다.

- `GenerateCraftIdeaTool`
- `SwitchToTutorialModeTool`

두 instruction set 모두 Private Cloud Compute의 server model을 사용한다.

---

# ⚠️ 발생한 문제

앱은 처음에 다음 craft 아이디어를 제안한다.

- Yarn PomPom
- Fabric Pouch
- Paper Butterfly

사용자가 Paper Butterfly를 선택하면 tutorial mode로 전환되어야 한다.

하지만 실제로는 모델이 계속 새로운 아이디어를 제안했다.

즉 brainstorming loop에서 벗어나지 못했다.

중요한 점은 명확한 runtime error가 발생하지 않았다는 것이다.

모델은 계속 입력을 받고 tool call도 수행했다.

이런 문제는 일반 로그만으로 원인을 찾기 어렵다.

---

# 🎥 Instruments Trace 기록

Xcode에서 profiling을 시작하는 흐름은 다음과 같다.

1. **Product** 메뉴 열기
2. **Profile** 선택
3. 앱 build
4. Instruments template chooser에서 **Foundation Models** 선택
5. **Record** 시작

Foundation Models Instrument는 기기에서 발생하는 prompt와 response 데이터를 기록한다.

---

# 🔐 Trace 파일과 민감한 데이터

Foundation Models Instrument의 trace에는 prompt와 response가 포함될 수 있다.

따라서 사용자나 앱의 민감한 정보가 포함될 가능성이 있다.

세션에서는 다음 사항을 강조한다.

- Production에서는 logging이 꺼져 있음
- Trace recording 중에는 logging이 활성화됨
- Trace 파일을 안전하게 보관해야 함

즉 `.trace` 파일을 일반 로그처럼 무심코 공유하거나 공개 저장소에 올리지 않아야 한다.

---

# 🪟 Instruments UI 구조

Foundation Models Instrument는 여러 영역으로 구성된다.

## Tracks

화면 상단에는 timeline activity를 보여주는 tracks가 있다.

각 track은 여러 lane을 포함할 수 있다.

## Detail View

Timeline 아래에는 현재 선택한 범위의 summary 정보를 보여주는 detail view가 있다.

## Inspector

Timeline의 bar 또는 detail view의 row를 선택하면 오른쪽 inspector에서 해당 항목의 세부 내용을 확인할 수 있다.

---

# 🛤️ 6개의 Timeline Lane

Foundation Models Instrument에는 timeline에 6개의 lane이 있다.

이를 통해 다음을 빠르게 확인할 수 있다.

- Session 구조
- Instructions 변화
- Model inference
- Latency
- Request 흐름

세션에서는 특히 다음 두 lane을 중심으로 설명한다.

- Instructions
- Model Inference

---

# 📋 Instructions Lane

Instructions lane은 특정 instruction set과 tool set이 얼마나 오랫동안 활성화되어 있었는지 보여준다.

하나의 instruction set은 여러 request에 걸쳐 유지될 수 있다.

Craft 예제에서는 원래 두 instruction set이 사용되어야 했다.

- Brainstorming
- Tutorial generation

하지만 첫 번째 trace에서는 전체 session 동안 하나의 instruction set만 활성화되어 있었다.

즉 tutorial mode로 handoff가 일어나지 않았다는 것을 timeline만으로 빠르게 알 수 있었다.

---

# 🟡 Model Inference Lane

Model Inference lane에는 서로 다른 색상의 bar가 표시된다.

| 색상 | 의미 |
|---|---|
| Yellow | 입력 prompt를 처리하는 데 걸린 시간 |
| Orange | response를 생성하는 데 걸린 시간 |

이를 통해 하나의 request 안에서도 입력 처리와 출력 생성 시간이 어떻게 나뉘는지 확인할 수 있다.

---

# 🌳 Tree View

Timeline은 전체 구조를 빠르게 확인하는 데 유용하고, 더 자세한 분석은 tree view에서 수행한다.

Tree view는 recording에서 수집한 데이터를 계층 구조로 보여준다.

대표적인 구조는 다음과 같다.

```text
Session
 └─ Request
     ├─ Instructions
     ├─ Model Inference
     │   ├─ Prompt
     │   └─ Response / Error
     └─ Tool Call
```

이 구조를 따라가면 agentic flow 전체를 위에서 아래로 추적할 수 있다.

---

# 🧩 Session과 Request 분석

예제의 첫 번째 session에는 두 개의 request가 있었다.

첫 번째 request는 다음 prompt로 시작된다.

> Please generate 3 craft ideas.

이 request에는 여러 model inference와 tool call이 포함된다.

각 model inference는 기본적으로 다음 정보를 가진다.

- Instructions
- Prompt
- Response 또는 Error

Tree에서 node를 선택하면 inspector에서 해당 내용을 자세히 확인할 수 있다.

---

# 🔎 Root Cause 찾기

Timeline에서는 instruction set이 바뀌지 않았다는 사실을 확인했다.

Tree view에서 해당 inference의 Instructions node를 선택하면 실제 tool configuration을 볼 수 있다.

여기서 문제가 드러난다.

Prompt에서는 `switchToTutorialMode` tool을 언급하고 있었다.

하지만 실제 instruction에 등록된 tool은 하나뿐이었다.

- `GenerateCraftIdeasTool`

필요한 다음 tool이 빠져 있었다.

- `SwitchToTutorialModeTool`

즉 모델은 tutorial mode로 바꿔야 한다는 지시는 받았지만 실제로 그 작업을 수행할 tool을 사용할 수 없었다.

---

# 🕳️ Silent Failure

이 버그는 crash나 exception 형태로 나타나지 않았다.

모델은 계속해서 다음 작업을 수행했다.

- 입력 수신
- 응답 생성
- 사용 가능한 tool 호출

하지만 tutorial mode로 전환할 방법이 없기 때문에 brainstorming loop에서 빠져나오지 못했다.

이것이 세션에서 보여주는 silent failure다.

Foundation Models Instrument를 사용하면 실제 tool configuration과 instruction flow를 확인해 이런 문제를 발견할 수 있다.

---

# 🛠️ 코드 수정

Instruments에서 원인을 찾은 뒤 Xcode로 돌아간다.

`BrainstormDynamicInstructions` 정의를 확인한다.

Prompt에는 `SwitchToTutorialMode`가 언급되어 있지만 toolset에는 `GenerateCraftIdeasTool`만 있다.

따라서 누락된 tool을 추가한다.

수정 후 다시 build하고 Foundation Models Instrument로 trace를 기록한다.

UI 동작뿐 아니라 내부 flow까지 다시 검증하는 것이 중요하다.

---

# ✅ 수정 결과 확인

수정된 앱에서는 사용자가 necklace를 선택했을 때 다음 흐름이 정상적으로 동작한다.

1. Brainstorming
2. 사용자가 craft 선택
3. `switchToTutorialMode` 호출
4. Tutorial mode 전환
5. 선택한 craft를 context로 전달
6. 상세 tutorial 생성

수정된 trace의 Instructions lane에는 이제 두 개의 instruction set이 나타난다.

- Brainstorming instructions
- Tutorial generation instructions

---

# 🧰 Tool Configuration 확인

수정된 첫 번째 instruction set에는 필요한 tools가 모두 나타난다.

- `generateCraftIdea`
- `switchToTutorialMode`

Tree view에서는 instruction change가 발생한 시점도 확인할 수 있다.

세션 예제에서는 Request 2의 두 번째 model inference 이후 instruction이 변경된다.

그 inference에서 `switchToTutorialMode`가 호출되고 선택한 craft가 argument로 전달된다.

다음 request에서는 tutorial generator instructions가 활성화되고 선택한 craft가 context로 전달된다.

---

# ℹ️ Info Column

Tree view의 Info column은 자세히 볼 가치가 있는 node를 빠르게 찾는 데 유용하다.

예:

- Errors
- 긴 duration
- 큰 token count

논리적인 문제가 해결된 뒤에는 이 신호를 이용해 성능과 효율을 분석한다.

---

# 📊 성능 Metrics

Model inference node의 inspector에서는 duration과 token usage 관련 정보를 확인할 수 있다.

세션에서는 세 가지 주요 성능 metric을 설명한다.

- Time to First Token
- Tokens per Second
- Total Latency

---

# ⏱️ Time to First Token

Time to First Token은 모델이 prompt를 받은 뒤 첫 token을 생성하기 시작하기까지 걸리는 시간이다.

TTFT가 길면 사용자는 빈 화면을 오래 보게 된다.

세션에서 제시한 핵심 개선 방향은 다음과 같다.

> Prompt를 줄인다.

불필요하게 긴 prompt와 instructions는 첫 응답 시작 시간을 늘릴 수 있다.

---

# ⚡ Tokens per Second

Tokens per Second는 response 생성 속도를 측정한다.

이를 이용해 다음을 할 수 있다.

- 서로 다른 prompt configuration 비교
- 변경 전후 성능 비교
- regression 감지
- configuration benchmark

---

# 🕐 Total Latency

Total Latency는 request를 보낸 시점부터 최종 response 전체를 받을 때까지의 시간이다.

사용자가 가장 직접적으로 느끼는 성능 지표다.

세션에서 제시한 주요 개선 전략은 다음과 같다.

> Streaming을 사용해 partial result를 더 일찍 보여준다.

전체 시간이 비슷하더라도 사용자가 결과를 먼저 보기 시작하면 체감 대기 시간을 줄일 수 있다.

---

# 🧮 Token Usage

Model inference node에서는 token usage도 확인할 수 있다.

이를 통해 다음을 판단할 수 있다.

- Prompt가 지나치게 큰지
- 특정 request가 유난히 많은 token을 사용하는지
- Instruction 변경으로 context가 커졌는지
- 느린 request의 원인이 입력 크기인지

---

# 🔁 전체 Debugging 흐름

| 단계 | 작업 |
|---|---|
| 문제 재현 | 실제 agentic flow에서 잘못된 동작 발생 |
| Trace 시작 | Xcode Product > Profile |
| Template 선택 | Foundation Models Instrument |
| 사용자 흐름 실행 | 실제 문제가 발생하는 interaction 재현 |
| Timeline 확인 | Instructions와 Model Inference lane 관찰 |
| Tree 탐색 | Session → Request → Inference → Tool Call 분석 |
| Instructions 확인 | 활성 instruction과 toolset 검사 |
| Root cause 파악 | Prompt와 실제 tool configuration 차이 확인 |
| 코드 수정 | 누락된 tool 추가 |
| 다시 profiling | 동일한 흐름 재실행 |
| Handoff 검증 | instruction change와 tool call 확인 |
| 성능 분석 | TTFT, Tokens/s, Total Latency, token usage 확인 |
| 최적화 | Prompt 축소 또는 streaming 적용 |

---

# 📋 체크리스트

## Trace 준비

- [ ] Xcode 27 사용
- [ ] Profiling 대상 기기에 최신 OS 설치
- [ ] Product > Profile에서 Foundation Models template 선택
- [ ] 실제 문제가 발생하는 사용자 흐름 재현
- [ ] Trace에 민감한 prompt와 response가 포함될 수 있음을 확인
- [ ] `.trace` 파일을 안전한 위치에 보관

## Agentic Flow 디버깅

- [ ] Instructions lane에서 기대한 instruction set이 모두 활성화되는지 확인
- [ ] Instruction이 변경되는 정확한 시점 확인
- [ ] 각 instruction에서 필요한 tools가 실제로 등록되어 있는지 확인
- [ ] Prompt에서 언급한 tool과 실제 toolset이 일치하는지 확인
- [ ] Tree view에서 request와 model inference 순서 확인
- [ ] 각 inference의 prompt와 response 또는 error 확인
- [ ] Tool call의 argument 확인
- [ ] Tool result가 다음 request의 context로 전달되는지 확인
- [ ] 명시적 error가 없는 silent failure 가능성 검토
- [ ] 여러 `LanguageModelSession` 사이의 handoff 확인

## 수정 후 검증

- [ ] 코드 수정 후 동일한 시나리오를 다시 기록
- [ ] UI 결과뿐 아니라 trace 내부 흐름까지 확인
- [ ] 예상한 instruction set이 모두 나타나는지 확인
- [ ] Tool call이 올바른 위치에서 발생하는지 확인
- [ ] 다음 instruction에 필요한 context가 전달되는지 확인

## 성능 분석

- [ ] Info column에서 긴 duration node 확인
- [ ] 높은 token count가 있는 inference 확인
- [ ] Time to First Token 측정
- [ ] TTFT가 높으면 prompt 크기 검토
- [ ] Tokens per Second를 configuration 간 비교
- [ ] 변경 후 성능 regression 확인
- [ ] Total Latency 측정
- [ ] 긴 결과에는 streaming 적용 검토
- [ ] Model inference별 token usage 확인

---

# 핵심 메시지

Agentic 기능은 최종 response만 보고는 문제의 원인을 찾기 어렵다.

여러 instructions, tools, requests, model inferences가 이어지는 흐름에서는 모델이 무엇을 받았고 어떤 tool을 사용할 수 있었으며 언제 instruction이 변경되었는지를 직접 확인할 수 있어야 한다.

Foundation Models Instrument는 이 전체 실행 흐름을 timeline과 tree view로 보여주며, 명시적인 오류 없이 기능이 잘못 동작하는 silent failure까지 추적할 수 있게 한다.

기능이 올바르게 동작한 뒤에는 Time to First Token, Tokens per Second, Total Latency, token usage를 이용해 응답성을 분석하고 최적화할 수 있다.

---

# 함께 보면 좋은 세션

- What’s new in the Foundation Models framework
- Build agentic app experiences with the Foundation Models framework
- Meet the Evaluations framework
- Bring an LLM provider to the Foundation Models framework
- Build AI-powered scripts with the fm CLI and Python SDK
- Build with the new Apple Foundation Model on Private Cloud Compute
