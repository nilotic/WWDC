# WWDC26 — Run local agentic AI on the Mac using MLX

- **Session:** 232
- **Source:** https://developer.apple.com/videos/play/wwdc2026/232/
- **Basis:** Apple Developer 공식 전체 transcript 및 Code 섹션
- **Topics:** MLX, MLX-LM, MLX-LM Server, local agents, OpenCode, Xcode, Neural Accelerators, continuous batching, distributed inference

---

## 🎯 한 줄 요약

Apple은 Mac에서 agentic AI를 완전히 로컬로 실행하기 위한 스택을 **MLX → MLX-LM → MLX-LM Server → agent**의 네 계층으로 설명한다. 클라우드 API 없이도 모델 추론과 agent loop를 Mac에서 수행할 수 있고, M5 Neural Accelerators, continuous batching, multi-Mac distributed inference를 통해 prompt processing·동시 요청·대형 모델 실행을 확장한다.

---

## 🧭 세션 구성

| 시간 | 내용 |
|---|---|
| 0:00 | Introduction |
| 0:32 | The chat and agentic loop |
| 2:42 | Local agentic AI stack |
| 4:36 | Setting up your own agent |
| 5:39 | Making agents fast |
| 6:53 | Concurrency and distributed inference |
| 9:20 | More examples |
| 13:01 | Next steps |

---

## 🤖 Chat과 agentic loop의 차이

일반적인 chat에서는 사용자가 prompt를 보내면 모델이 응답한다. 그 응답을 바탕으로 명령을 실행하거나 파일을 확인하고 오류를 수정하는 후속 작업은 사용자가 직접 수행한다.

Agent에서는 이 흐름이 달라진다.

1. 사용자가 agent에게 목표를 전달한다.
2. agent가 language model에게 다음 행동을 결정하도록 요청한다.
3. 모델이 tool 호출을 선택한다.
4. agent가 명령 실행, 파일 읽기, API 호출 등의 tool을 수행한다.
5. 결과를 다시 모델에게 전달한다.
6. 모델이 새 상태를 바탕으로 다음 작업을 결정한다.
7. 목표가 완료될 때까지 이 loop가 반복된다.

즉 세션에서 말하는 agentic loop는 다음 관계다.

**User → Agent → Model → Tools → Agent → Model → …**

Apple이 강조한 점은 이 전체 loop가 Apple silicon 위에서 **로컬로 동작할 수 있다는 것**이다.

- 모델 추론이 Mac에서 수행됨
- 코드와 로컬 데이터가 cloud model로 전달되지 않음
- 인터넷이 없는 상황에서도 모델과 agent를 사용할 수 있음
- 외부 API 사용료 없이 로컬 하드웨어로 추론 가능

다만 agent가 사용하는 tool 자체가 네트워크를 사용할 수는 있다. 발표의 GitHub pull request 예제에서는 모델 추론은 로컬이지만 GitHub CLI가 PR 데이터를 가져오는 과정은 네트워크를 사용한다.

---

## 🧱 로컬 agentic AI의 4계층 스택

Apple은 Mac에서 로컬 agent를 구성하는 스택을 네 계층으로 나눈다.

### 1. MLX

가장 아래에는 **MLX**가 있다.

MLX는 Apple silicon에 최적화된 오픈소스 array framework다. 주요 역할은 다음과 같다.

- 저수준 tensor/array 연산
- Metal 기반 가속
- 메모리 관리
- Apple silicon 하드웨어 활용

상위의 language model runtime과 agent server는 MLX의 계산 계층 위에서 동작한다.

### 2. MLX-LM

그 위에는 **MLX-LM**이 있다.

MLX-LM은 large language model을 다루기 위한 계층으로 다음 작업을 제공한다.

- 모델 로딩
- 추론
- quantization
- fine-tuning
- CLI
- Python API

Apple은 Hugging Face의 수천 개 모델을 사용할 수 있다고 설명한다.

### 3. MLX-LM Server

Agent를 연결하려면 단순 모델 호출 API보다 **지속적으로 실행되는 표준 HTTP server**가 필요하다. 이 역할을 MLX-LM Server가 담당한다.

세션에서 강조한 특징은 다음과 같다.

- OpenAI-compatible HTTP API
- OpenAI chat completions protocol과 호환
- structured tool calling 지원
- reasoning model 지원
- 로컬 모델을 cloud LLM API와 유사한 방식으로 노출

즉 agent framework 입장에서는 cloud provider 대신 localhost endpoint를 사용하면 된다.

### 4. Agent

맨 위에는 agent가 있다.

OpenAI chat completions protocol을 지원하는 도구라면 MLX-LM Server와 연결할 수 있다. 세션에서 예로 든 도구는 다음과 같다.

- Xcode
- OpenCode
- Pi agent
- custom script

또한 Apple은 여러 앱과 도구가 MLX/MLX-LM 생태계를 활용한다고 설명하며 Ollama, LM Studio, vLLM을 언급한다.

---

## ⚙️ 로컬 agent를 설정하는 세 단계

세션은 로컬 agent 환경 구축을 세 단계로 단순화한다.

### Step 1 — MLX-LM 설치

```bash
pip install mlx-lm
```

### Step 2 — 로컬 server 실행

```bash
mlx_lm.server --model mlx-community/Qwen-3.5-4B-8bit
```

Apple은 처음에는 **tool calling을 지원하는 작은 모델**로 환경을 검증하는 것을 권장한다.

Server가 시작되면 모델이 로드되고 localhost에서 요청을 받을 준비가 된다.

### Step 3 — agent를 server에 연결

먼저 HTTP endpoint가 정상 동작하는지 직접 확인할 수 있다.

```bash
curl -X POST \
  http://127.0.0.1:8080/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{"model":"default_model","messages":[{"role":"user","content":"Hello!"}]}'
```

핵심은 agent가 cloud endpoint 대신 `http://127.0.0.1:8080/v1`을 사용하도록 만드는 것이다.

---

## 🧩 OpenCode 연결 예제

공식 Code 섹션의 OpenCode 설정은 다음과 같다.

```json
{
  "$schema": "https://opencode.ai/config.json",
  "model": "mlx/default_model",
  "small_model": "mlx/default_model",
  "provider": {
    "mlx": {
      "npm": "@ai-sdk/openai-compatible",
      "name": "MLX (local)",
      "options": {
        "baseURL": "http://127.0.0.1:8080/v1"
      },
      "models": {
        "default_model": {
          "name": "Default MLX Model"
        }
      }
    }
  }
}
```

설정의 핵심은 세 가지다.

- local MLX provider 정의
- `baseURL`을 localhost의 MLX-LM Server로 지정
- OpenCode의 기본/소형 모델 모두 해당 provider의 local model을 사용하도록 지정

Agent framework는 실제 모델이 cloud인지 local인지 알 필요가 없다. 표준 API가 동일하기 때문이다.

---

## 🚀 Agent workload에서 가장 중요한 성능 문제: prompt processing

Agent는 일반적인 chat보다 prompt processing 비중이 훨씬 크다.

Tool을 한 번 호출할 때마다 결과가 새 context로 들어오고, 모델은 다시 그 context를 읽은 뒤 다음 행동을 결정해야 한다. 이 과정은 agent loop가 반복될수록 계속 누적된다.

세션은 agentic session이 **수십만 개의 token**으로 커질 수 있으며, 이 중 대부분은 모델이 새로 생성하는 token이 아니라 **기존 context와 tool output을 읽는 token**이라고 설명한다.

따라서 agent 성능에서 generation speed만큼 중요한 것이 **prompt processing speed**다.

---

## ⚡ M5 Neural Accelerators와 MLX

M5에는 Neural Accelerators가 도입되며 MLX는 이를 prompt processing에 활용할 수 있다.

세션에서 제시한 수치:

- M5의 matrix multiplication은 M4 대비 **4배 빠름**
- MLX의 specialized multiplication/attention kernel을 통해 prompt processing 역시 거의 동일한 수준의 speedup을 얻음

즉 agent가 코드베이스를 읽거나 긴 tool result를 처리하는 시간이 크게 감소한다.

중요한 점은 개발자가 별도의 flag나 코드를 추가하지 않아도 된다는 것이다.

MLX가 실행 중인 하드웨어에 맞춰 적절한 kernel을 자동 선택한다.

---

## 🔀 Continuous batching으로 multi-agent concurrency 처리

Agentic workflow에서는 하나의 agent가 여러 subagent를 동시에 실행하는 패턴이 흔하다.

예를 들어:

- 한 subagent는 문서를 읽음
- 다른 subagent는 code search 수행
- 또 다른 subagent는 test 작성

이 경우 여러 inference request가 동시에 local model server에 들어온다.

MLX-LM Server는 이를 **continuous batching**으로 처리한다.

### 일반적인 순차 처리

```text
Request A → 완료
Request B → 완료
Request C → 완료
```

각 요청이 앞의 요청을 기다려야 한다.

### Continuous batching

```text
A ────────────────
    B ────────────
       C ─────────
```

- 도착한 요청을 동적으로 batch에 포함
- 이미 실행 중인 batch에도 새로운 요청을 추가 가능
- GPU에서 여러 요청을 함께 처리
- subagent들이 긴 queue에 직렬로 대기하는 상황을 줄임

결과적으로 multi-agent workflow 전체의 throughput이 개선된다.

---

## 🖥️ 한 대의 Mac에 모델이 들어가지 않는 경우

세 번째 문제는 모델 크기다.

세션은 최신 DeepSeek 모델의 예를 들며:

- 약 **1.6 trillion parameters**
- weight만 **800GB 이상 메모리 필요**

이라고 설명한다.

512GB 메모리를 가진 한 대의 Mac으로도 이런 모델은 모두 담을 수 없다.

MLX의 distributed inference는 하나의 모델을 여러 Mac에 나누어 실행한다.

장점은 두 가지다.

1. 한 대에 들어가지 않는 더 큰 모델을 실행 가능
2. prompt processing을 여러 device에서 병렬화해 agent loop를 가속

---

## 🌐 Multi-Mac distributed inference

공식 Code 섹션의 예제:

```bash
mlx.launch --hostfile hosts.json \
  --backend jaccl \
  /remote/path/to/mlx_lm.server \
  --model mlx-community/Qwen-3.5-122B-A3B-8bit
```

구성 요소:

- `mlx.launch`: 여러 노드에서 MLX process 실행
- `--hostfile hosts.json`: 참여하는 Mac과 연결 정보를 정의
- `--backend jaccl`: distributed communication backend
- `mlx_lm.server`: distributed 환경에서 실행할 server
- `--model`: 여러 Mac에 shard할 모델

모델은 available device에 자동으로 sharding된다.

Agent 쪽에서는 여전히 하나의 MLX-LM Server endpoint만 사용하면 된다.

---

## ⚡ Thunderbolt RDMA

macOS 26.2부터 MLX distributed inference는 **Thunderbolt RDMA**를 지원한다.

목적은 Mac 간 통신의 latency를 낮추고 bandwidth를 높이는 것이다.

세션에서는 distributed inference가 **4-node 환경에서 최대 3배 속도 향상**을 보였다고 설명한다.

지원 연결은 Thunderbolt뿐만 아니라 Ethernet도 포함하지만, Thunderbolt RDMA가 특히 low-latency/high-bandwidth 경로로 강조된다.

세부 구성은 별도 WWDC26 세션 **Explore distributed inference and training with MLX**에서 다룬다.

---

## 🛠️ 데모 1 — 로컬 agent로 GitHub PR 요약

첫 데모에서는 OpenCode agent와 MLX가 같은 Mac에서 실행된다.

요청:

- MLX repository의 최근 pull request 조회
- 변경 사항 요약
- 개발자가 확인해야 할 내용 식별

Agent 흐름:

1. 요청을 모델에 전달
2. 모델이 GitHub CLI 호출 결정
3. GitHub CLI로 PR 데이터 조회
4. diff 읽기
5. 변경 내용 분석
6. 요약 생성

여기서 **model inference는 로컬**이고, network access는 GitHub CLI가 PR 정보를 가져올 때만 발생한다.

이 예제는 “local agent”가 반드시 “network를 전혀 사용하지 않는 agent”를 뜻하지 않는다는 점도 보여준다.

---

## 🎨 데모 2 — SwiftUI drawing app을 처음부터 생성

두 번째 데모에서는 빈 Xcode project에서 iPad용 drawing app을 만들도록 agent에게 요청한다.

Agent는 다음 과정을 자동 수행한다.

1. 현재 directory와 project structure 확인
2. 구현 계획 작성
3. source file 작성
4. project build
5. compile error 분석
6. 코드 수정
7. 다시 build
8. 성공할 때까지 반복

발표에서 첫 버전은 약 2분 만에 생성된다.

이후 사용자가 line의 end cap을 rounded 형태로 바꿔 달라고 요청한다.

Agent는 코드를 수정하고 다시 compile해 오류가 없는 상태까지 작업한다.

핵심은 모델이 단순히 코드 text를 출력하는 데서 끝나지 않고 **표준 개발 도구를 직접 사용하는 agentic loop**를 수행한다는 점이다.

세션에서는 `xcodebuild`가 실제 build verification에 사용되는 도구로 언급된다.

---

## 🧑‍💻 데모 3 — Xcode에 로컬 MLX provider 연결

마지막 데모는 동일한 local MLX-LM Server를 Xcode와 직접 연결한다.

Xcode 설정 흐름:

1. Xcode Settings 열기
2. **Intelligence** 탭 이동
3. **Add Chat Provider…** 선택
4. **Locally Hosted** provider 선택
5. MLX-LM Server의 port 입력 — 데모에서는 `8080`

설정 후 Xcode가 local model과 직접 통신한다.

발표에서는 일부러 drawing app에 bug를 넣은 뒤 Xcode의 agentic coding 기능으로 수정한다.

Agent는:

- bug 확인
- 관련 code inspection
- 수정 코드 작성
- project build/run 검증

을 수행한다.

Apple이 강조한 장점은 **프로젝트 코드가 cloud model로 나가지 않는다는 것**이다.

---

## 🔐 Local AI의 privacy 특성

세션에서 local inference의 장점으로 반복해서 강조하는 것이 privacy다.

로컬 MLX stack에서는:

- prompt가 local server에 전달됨
- 모델 weights와 inference가 Mac에 존재
- 프로젝트 파일 분석이 로컬에서 수행됨
- cloud LLM API key가 필요하지 않음

하지만 agent가 사용하는 외부 tool의 network activity까지 차단되는 것은 아니다.

예를 들어 GitHub CLI를 실행하면 GitHub와 통신한다. 따라서 실제 privacy/security 검토에서는 **model endpoint와 agent tool의 network behavior를 구분**해야 한다.

---

## 🧠 Agentic workload를 위한 세 가지 최적화 축

세션의 성능 논리를 정리하면 다음과 같다.

### 1. Prompt processing

**문제:** 긴 tool result와 code context를 반복해서 읽어야 함

**해결:**
- M5 Neural Accelerators
- MLX optimized matrix multiplication
- optimized attention kernels

### 2. Concurrency

**문제:** 여러 subagent가 동시에 inference request 전송

**해결:**
- MLX-LM Server continuous batching

### 3. Model size

**문제:** 모델 weights가 한 대의 Mac 메모리를 초과

**해결:**
- multi-Mac distributed inference
- Thunderbolt/Ethernet
- macOS 26.2 Thunderbolt RDMA

이 세 축은 각각 latency, throughput, capacity 문제에 대응한다.

---

## 🏗️ 전체 아키텍처

```text
┌──────────────────────────────────────┐
│               Agent                  │
│ Xcode / OpenCode / Pi / custom tool  │
└───────────────────┬──────────────────┘
                    │ OpenAI-compatible API
                    ▼
┌──────────────────────────────────────┐
│          MLX-LM Server               │
│ HTTP • tool calling • reasoning      │
│ continuous batching                  │
└───────────────────┬──────────────────┘
                    ▼
┌──────────────────────────────────────┐
│              MLX-LM                  │
│ load • run • quantize • fine-tune    │
└───────────────────┬──────────────────┘
                    ▼
┌──────────────────────────────────────┐
│                MLX                   │
│ Apple silicon • Metal • memory       │
└──────────────────────────────────────┘
```

Distributed 환경에서는 가장 아래 계산 계층이 여러 Mac으로 확장되지만, agent에서 바라보는 API 인터페이스는 동일하게 유지된다.

---

## 📋 실제 적용 체크리스트

### 기본 환경

- [ ] Apple silicon Mac 준비
- [ ] Python 환경에서 `mlx-lm` 설치
- [ ] tool calling 지원 모델 선택
- [ ] 작은 모델로 local server 먼저 검증
- [ ] `mlx_lm.server` 실행
- [ ] `/v1/chat/completions` endpoint 응답 확인

### Agent 연결

- [ ] agent가 OpenAI-compatible endpoint를 지원하는지 확인
- [ ] base URL을 `http://127.0.0.1:8080/v1` 형태로 지정
- [ ] agent의 model identifier와 server model 이름 일치 확인
- [ ] tool calling 동작 확인
- [ ] tool이 사용하는 별도 network access도 검토

### 성능

- [ ] agent session의 prompt/context 크기 모니터링
- [ ] M5에서는 Neural Accelerators 자동 활용 여부 확인
- [ ] 여러 subagent workload에서는 continuous batching 활용
- [ ] 한 대의 메모리를 넘는 모델은 distributed inference 검토
- [ ] multi-Mac 환경은 Thunderbolt/Ethernet 연결 구조 설계
- [ ] macOS 26.2 이상에서 Thunderbolt RDMA 검토

### Xcode 연결

- [ ] Xcode Settings → Intelligence 확인
- [ ] Add Chat Provider → Locally Hosted 선택
- [ ] MLX-LM Server port 설정
- [ ] 실제 프로젝트에서 file read/build/fix 흐름 테스트
- [ ] `xcodebuild` 등 tool permission 확인

### 보안/운영

- [ ] Local model inference와 외부 tool network access를 별도로 구분
- [ ] agent가 실행 가능한 shell/tool 범위 검토
- [ ] repository write permission 최소화 검토
- [ ] 중요한 변경은 diff/code review 후 적용

---

## 🧩 세션에서 사용한 핵심 명령 모음

### Install

```bash
pip install mlx-lm
```

### Local server

```bash
mlx_lm.server --model mlx-community/Qwen-3.5-4B-8bit
```

### HTTP request

```bash
curl -X POST \
  http://127.0.0.1:8080/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{"model":"default_model","messages":[{"role":"user","content":"Hello!"}]}'
```

### Distributed server

```bash
mlx.launch --hostfile hosts.json \
  --backend jaccl \
  /remote/path/to/mlx_lm.server \
  --model mlx-community/Qwen-3.5-122B-A3B-8bit
```

---

## 🧠 핵심 메시지

이 세션의 핵심은 “Mac에서도 작은 local model을 돌릴 수 있다”는 수준을 넘어선다. Apple은 **agentic AI 전체 stack을 local-first 구조로 구성**하고, 실제 개발 도구와 결합해 반복적인 tool-use loop를 실행하는 형태를 보여준다.

핵심 구조는 단순하다.

**MLX가 하드웨어 계산을 담당하고, MLX-LM이 모델 실행을 제공하며, MLX-LM Server가 표준 OpenAI-compatible API로 이를 노출하고, Xcode나 OpenCode 같은 agent가 그 위에서 tool을 사용한다.**

Agent workload의 병목도 명확히 나눈다.

- 긴 context → Neural Accelerators와 optimized kernels
- 여러 agent 요청 → continuous batching
- 너무 큰 모델 → distributed inference

이 때문에 local agent는 단순한 offline chatbot이 아니라, **코드 읽기·파일 수정·build·오류 수정·외부 tool 호출까지 수행하는 로컬 자동화 계층**으로 확장된다.

---

## 🔗 함께 보면 좋은 공식 자료

- [Run local agentic AI on the Mac using MLX — WWDC26](https://developer.apple.com/videos/play/wwdc2026/232/)
- [Explore distributed inference and training with MLX — WWDC26](https://developer.apple.com/videos/play/wwdc2026/233/)
- [Explore numerical computing in Swift with MLX — WWDC26](https://developer.apple.com/videos/play/wwdc2026/328/)
- MLX Swift LM on GitHub
- MLX Swift Examples on GitHub
- MLX Examples on GitHub
- MLX Swift on GitHub
- MLX LM Python API
- MLX Explore Python API
- MLX Framework

