# WWDC26 Meet Core AI 요약

- Session: 324
- Title: Meet Core AI
- Source: https://developer.apple.com/videos/play/wwdc2026/324/
- Topic: Core AI, on-device AI, PyTorch conversion, Swift inference, NDArray, Instruments, model states, KV cache, specialization, AOT compilation
- Chapters: Introduction, What is Core AI, Model conversion, App integration, Profiling with Instruments, Optimizing performance, Additional features, Specialization, Next steps

---

## 한 줄 요약

Core AI는 Apple Intelligence의 온디바이스 추론을 구동하는 프레임워크를 개발자에게 개방한 것으로, **PyTorch 모델 변환 → `.aimodel` 검증 → Swift 앱 통합 → Instruments 기반 성능 분석 → state/KV cache 최적화 → device specialization과 AOT compilation**까지 모델 배포 생명주기를 하나의 도구 체계로 연결한다.

---

## 핵심 요약

이번 세션은 Core AI의 전체 흐름을 Snake 게임용 Transformer 모델 하나로 보여준다.

흐름은 다음과 같다.

```text
PyTorch 모델
    ↓
torch.export
    ↓
coreai-torch 변환
    ↓
.aimodel
    ↓
Python에서 numerical verification
    ↓
Xcode Model Viewer
    ↓
CoreAI Swift framework
    ↓
AIModel → InferenceFunction → NDArray
    ↓
Instruments profiling
    ↓
state / KV cache 최적화
    ↓
Specialization / Cache / AOT compilation
```

Core AI는 단순한 runtime API가 아니라 다음을 함께 제공하는 생태계로 소개된다.

- PyTorch 기반 변환 도구
- Python authoring API
- 모델 최적화 도구
- Swift inference API
- CPU / GPU / Neural Engine 활용
- Core AI Instruments
- Core AI Debugger
- Xcode debug gauge
- Device specialization 관리
- Ahead-of-time compilation
- Custom Metal 4 kernels
- Core AI Models repository
- Foundation Models와 연결 가능한 custom language model API

---

# 🧠 Core AI란 무엇인가

Apple은 Core AI를 **Apple Intelligence의 온디바이스 inference를 구동하는 프레임워크**라고 설명한다.

개발자 관점에서 중요한 차이는 단순히 새로운 ML runtime 하나가 추가된 것이 아니라는 점이다.

Core AI는 다음 세 영역을 하나로 묶는다.

```text
Model authoring / conversion
        +
Runtime integration
        +
Profiling / debugging / deployment
```

즉 모델을 만들고, Apple device에서 실행하고, 성능과 numerical correctness를 검증하고, 실제 사용자 기기에 맞게 specialization하는 전체 사이클을 지원한다.

---

# 🍎 Apple Silicon 전체 활용

Core AI는 Apple Silicon의 주요 compute unit을 대상으로 한다.

- CPU
- GPU
- Neural Engine

세션은 작은 speaker diarization 모델부터 vision-language model, 매우 큰 LLM 기반 agent까지 같은 Core AI 기술 기반 위에서 확장할 수 있다고 설명한다.

중요한 점은 모두 **온디바이스 실행**을 전제로 한다는 것이다.

```text
No server inference requirement
No per-token serving cost
Local execution
```

---

# 🐍 데모: AI Snake Game

세션의 예제는 두 명이 플레이하는 Snake 게임이다.

한 snake의 다음 이동 방향을 Transformer 모델이 결정한다.

모델 입력은 현재 board의 feature와 이전 history다.

출력은 다음 방향을 선택하기 위한 logits다.

각 time step에서 사용하는 feature는 다음과 같다.

- AI snake head에서 각 wall까지의 normalized distance
- nearest food까지의 relative X/Y distance
- 현재 이동 방향의 one-hot encoding
- 상대 snake까지의 normalized X/Y distance
- 상대 snake의 이동 방향

즉 모델은 raw image를 보는 것이 아니라 board state를 feature vector로 받아 action을 예측한다.

---

# 🔁 Core AI가 지원하는 반복 개발 흐름

세션에서 강조하는 전제는 AI 기능 개발이 반복적이라는 점이다.

```text
Idea
 ↓
Model 선택 / 작성
 ↓
Evaluation
 ↓
App 통합
 ↓
Performance 분석
 ↓
Model 수정
 ↓
재변환
 ↓
다시 평가
```

Core AI의 Python과 Swift, Xcode tooling이 모두 이 반복 cycle을 빠르게 돌리기 위한 구성으로 소개된다.

---

# 🐍 PyTorch 모델을 Core AI로 변환

Snake Transformer는 먼저 PyTorch로 작성하고 학습한다.

그 다음 `coreai-torch` package를 이용해 Core AI 형식으로 변환한다.

핵심 단계:

```text
PyTorch checkpoint load
      ↓
example input 준비
      ↓
torch.export
      ↓
dynamic_shapes 지정
      ↓
Core AI decomposition 적용
      ↓
TorchConverter
      ↓
input/output 이름 지정
      ↓
.aimodel 저장
```

---

# 📐 Dynamic Shape 지정

Snake 게임에서는 history length가 계속 늘어난다.

따라서 example input의 sequence length를 그대로 고정해서 trace하면 안 된다.

세션에서는 `torch.export.Dim`을 이용해 sequence dimension을 dynamic하게 표현한다.

개념적인 변환 코드는 다음과 같다.

```python
seq_len = torch.export.Dim("seq_len", min=1, max=256)

exported = torch.export.export(
    model,
    args=(example_input,),
    dynamic_shapes={"features": {1: seq_len}},
)
```

그리고 Core AI용 decomposition을 적용한 뒤 converter로 넘긴다.

```python
exported = exported.run_decompositions(
    coreai_torch.get_decomp_table()
)
```

---

# 📦 `.aimodel`

변환 결과는 Core AI model asset으로 저장한다.

```text
SnakeTransformer.aimodel
```

이 파일이 Swift app runtime에서 로드되는 source representation이다.

나중에 실제 device에서는 이 source representation이 해당 device와 OS에 맞게 specialization된다.

---

# ✅ 변환 후 Numerical Verification

변환이 성공했다고 바로 앱에 넣는 것이 아니라, Python 환경에서 **원본 PyTorch 모델과 변환된 Core AI 모델의 출력이 충분히 가까운지 검증**한다.

검증 흐름:

```text
동일한 input
  ├─ PyTorch model
  └─ Core AI model
        ↓
두 output 비교
        ↓
max absolute difference 확인
```

세션 예시는 use case에 맞는 tolerance를 두고 차이가 충분히 작다는 것을 assert한다.

이 단계가 중요한 이유는 conversion 과정에서 graph decomposition이나 operator 변환 때문에 numerical difference가 생길 가능성을 초기에 잡을 수 있기 때문이다.

---

# 🔍 Xcode Model Viewer

`.aimodel`을 Xcode에 추가한 뒤 직접 열면 model metadata를 확인할 수 있다.

세션에서 확인하는 정보:

- Model size
- Operation distribution
- Functions
- 각 function의 정확한 signature
- Input/output shape
- Dynamic dimension 여부

Snake 모델은 하나의 main function을 가지고 있고:

```text
features → logits
```

형태다.

NDArray shape에서 `?`로 표시되는 dimension은 dynamic shape임을 의미한다.

---

# 🧩 CoreAI Swift Framework

Core AI의 Swift API는 처음에는 간단하게 사용할 수 있지만 필요하면 더 낮은 수준의 성능 제어까지 내려갈 수 있는 **progressive disclosure** 형태다.

핵심 type은 세 가지다.

```text
AIModel
InferenceFunction
NDArray
```

---

# 📦 `AIModel`

`AIModel`은 `.aimodel` URL에서 생성한다.

역할:

- Model inspection
- 하나 이상의 inference function load

개념적인 사용:

```swift
let model = try await AIModel(contentsOf: modelURL)
let function = try model.loadFunction(named: "main")
```

보통 AI feature를 준비하는 시점, 예를 들어 app initialization이나 feature preparation 단계에서 생성한다.

---

# ⚙️ `InferenceFunction`

`InferenceFunction`은 실제 실행 가능한 compute graph다.

대부분의 단순 model은 main function 하나만 가진다.

하지만 하나의 model asset 안에 여러 function을 포함하도록 변환할 수도 있다.

실행 방식은 다음과 같다.

```text
Inputs 준비
   ↓
InferenceFunction.run(...)
   ↓
Outputs dictionary
```

---

# 🧮 `NDArray`

`NDArray`는 Core AI에서 multi-dimensional input/output data를 담는 type이다.

Snake 모델에서는 input shape이 개념적으로 다음과 같다.

```text
[sequenceLength, hiddenDimension]
```

Scalar type은 `float32`를 사용한다.

예:

```swift
var input = NDArray(
    shape: [stepCount, hiddenDim],
    scalarType: .float32
)
```

---

# 🛡️ `NDArray.MutableView`

입력 데이터를 채울 때 세션은 `NDArray.MutableView`를 사용한다.

이 type은 non-escapable type으로 소개된다.

목표는 두 가지다.

```text
Memory safety
+
Backing storage에 대한 효율적인 접근
```

즉 Swift의 modern language feature를 활용해 copy나 unsafe buffer handling을 최소화하면서 저수준 데이터 접근 성능을 유지한다.

---

# ▶️ Swift에서 Inference 실행

Snake player의 action 결정 흐름은 다음과 같다.

```text
Game state
   ↓
NDArray 생성
   ↓
feature write
   ↓
InferenceFunction.run
   ↓
logits NDArray 추출
   ↓
logit이 가장 큰 direction 선택
```

구조를 단순화하면:

```swift
var inputs = NDArray(
    shape: [game.stepCount, hiddenDim],
    scalarType: .float32
)

writeFeatures(of: game, into: inputs.mutableView())

var outputs = try await function.run(
    inputs: ["features": inputs]
)

let logits = outputs.remove("logits")?.ndArray
```

---

# 📊 첫 구현의 성능 문제

모델이 정상 작동한 뒤 두 AI snake끼리 게임을 실행하면 시간이 갈수록 게임이 느려진다.

Core AI Instruments에서 inference interval을 보면 latency가 계속 증가한다.

원인은 Transformer의 sequence length 증가다.

Snake 구현에서 매 step마다 전체 game history를 다시 입력하고 있기 때문이다.

Transformer attention의 계산 비용은 sequence length 증가에 따라 크게 늘어난다.

세션에서는 이를 quadratic complexity 문제로 설명한다.

---

# 🔬 Core AI Instruments

Xcode에는 Core AI 전용 Instrument가 제공된다.

여기서 앱이 수행하는 Core AI inference interval과 latency를 관찰할 수 있다.

Snake 예제에서는:

```text
Step 증가
  ↓
Sequence length 증가
  ↓
Inference latency 증가
```

패턴이 명확하게 보인다.

즉 단순히 UI가 느려진 것만 보는 것이 아니라 실제 model inference가 병목인지 확인할 수 있다.

---

# 🚀 해결책: KV Cache

Transformer decoder loop에서 일반적으로 사용하는 최적화는 **Key/Value cache**다.

기존 구현:

```text
step 1 → history 1개 전체 계산
step 2 → history 2개 전체 재계산
step 3 → history 3개 전체 재계산
...
```

KV cache 적용:

```text
past K/V → cache 유지
new step → 새 K/V만 계산
          ↓
cache update
```

그러면 이전 token/step에 대한 key/value embedding을 매 inference마다 다시 계산하지 않아도 된다.

---

# 🔄 Core AI `states`

Core AI는 KV cache 같은 값을 **state**로 표현한다.

State는 일반 input과 다르게 inference 중에:

```text
읽고
+
같은 storage에 업데이트
```

된다.

즉 in-place mutable model state다.

KV cache를 state로 넣으면 두 가지 이점이 생긴다.

- 과거 K/V를 다시 계산하지 않음
- 매번 전체 history를 input으로 전달하지 않아도 됨

첫 input 이후에는 새 board state의 feature만 넣으면 된다.

---

# 🐍 PyTorch에서 KV Cache를 Buffer로 정의

원래 PyTorch module로 돌아가 key/value cache tensor를 buffer로 등록한다.

개념:

```python
self.register_buffer("k_cache", ...)
self.register_buffer("v_cache", ...)
```

이 buffer는 exported program에서 mutable buffer로 표현되고, Core AI conversion에서 state로 전환할 수 있다.

---

# 🔁 Forward Pass 변경

Transformer forward pass는 각 layer에서 이전 cache를 읽고 새 K/V를 계산한 뒤 cache를 갱신하는 형태로 바뀐다.

```text
Read k_cache / v_cache
       ↓
새 query/key/value 계산
       ↓
previous cache와 함께 attention
       ↓
updated K/V 생성
       ↓
cache overwrite
```

---

# 🧾 `state_names`

재변환 시 converter에 state 이름을 알려준다.

개념:

```python
converter.add_exported_program(
    exported,
    input_names=["features", "position_ids"],
    state_names=["keyCache", "valueCache"],
    output_names=["logits"],
)
```

이렇게 하면 key/value cache가 Core AI function의 state argument가 된다.

---

# 📦 Swift에서 State Storage 유지

`ModelPlayer`는 이제 cache를 stored property로 갖는다.

```swift
var keyCache: NDArray
var valueCache: NDArray
```

세션에서는 maximum context length에 맞춘 fixed-size NDArray로 초기화한다.

핵심은 inference call 사이에서 이 배열이 계속 유지된다는 점이다.

---

# 🧬 `InferenceFunction.MutableViews`

Inference할 때 cache NDArray의 mutable view를 state collection에 넣는다.

개념:

```swift
var states = InferenceFunction.MutableViews()
states.insert(&keyCache, for: "keyCache")
states.insert(&valueCache, for: "valueCache")

let outputs = try await function.run(
    inputs: ["features": inputFeatures],
    states: states
)
```

Inference가 실행되면서 cache가 읽히고 동시에 갱신된다.

---

# 📉 KV Cache 적용 결과

KV cache를 적용한 버전에서는 게임이 시간이 지나도 훨씬 일정한 속도를 유지한다.

Instruments에서도 latency 증가가 이전보다 크게 완화된 것을 확인할 수 있다.

즉 세션의 성능 최적화 흐름은 매우 명확하다.

```text
문제 체감
 ↓
Instrument로 latency 확인
 ↓
Algorithmic cause 파악
 ↓
Model state 구조 변경
 ↓
재변환
 ↓
Swift state handling 추가
 ↓
Instrument로 다시 검증
```

---

# 🧰 더 깊은 Model Authoring

Snake 예제에서는 `coreai-torch`로 PyTorch model을 직접 변환했다.

하지만 Core AI Python package는 이보다 더 낮은 수준도 지원한다.

세션에서 언급하는 확장 영역:

- Core AI API로 직접 model authoring
- Apple Silicon용 model optimization
- Metal 4 custom kernel implementation

복잡한 model이나 performance-critical operator가 있다면 단순 converter 사용보다 더 깊게 제어할 수 있다.

---

# 🔬 Core AI Debugger

Performance만큼 중요한 것이 numerical debugging이다.

Core AI Debugger는 변환된 model을 시각화하고 중간 tensor value를 검사할 수 있다.

또한 converted graph의 operation을 원래 Python source와 연결해 추적할 수 있다.

용도:

```text
PyTorch에서는 정상
Core AI 변환 후 output 이상
          ↓
중간 tensor 비교
          ↓
어느 operation에서 차이가 생겼는지 추적
          ↓
원래 Python source 위치 확인
```

---

# 📟 Xcode Core AI Debug Gauge

앱을 Xcode에서 실행하는 동안 streaming Core AI activity를 보여주는 debug gauge도 제공된다.

이 도구는 Instruments까지 열기 전에 빠르게 이상 징후를 확인하는 시작점으로 소개된다.

```text
Debug Gauge
   ↓
문제 징후 확인
   ↓
필요 시 Instruments
```

---

# ⚙️ Model Specialization

`.aimodel`을 app에 포함했다고 해서 그대로 실행되는 것은 아니다.

배포되는 model은 여러 Apple device에서 사용할 수 있는 source representation이다.

실제 실행 전에는 현재 device와 OS에 맞게 **specialization**되어야 한다.

```text
.aimodel source representation
        ↓
Device/OS specific specialization
        ↓
Executable artifacts
```

대형 model은 specialization에 상당한 시간이 걸릴 수 있다.

---

# ⚠️ First Load Latency

한 번 specialization이 끝나 cache되면 이후 load는 빠르다.

문제는 최초 실행이다.

Apple의 권장 방향은 명확하다.

> 사용자가 즉시 결과를 기다리는 interactive flow 안에서 큰 model의 specialization이 처음 발생하지 않도록 설계한다.

즉 버튼을 누른 뒤 몇 초 또는 그 이상 block시키는 구조보다 미리 준비하는 것이 낫다.

---

# 🗃️ `AIModelCache`

Core AI는 app의 default model cache에 programmatic access를 제공한다.

대표적인 흐름:

```text
Cache에 model 존재?
   ├─ Yes → 바로 load
   └─ No  → specialization 필요
```

이를 이용하면 UI에서 feature availability를 조절하거나 모델 준비가 필요하다는 사실을 사용자에게 알려줄 수 있다.

개념적인 코드는 다음과 같다.

```swift
let cache = AIModelCache.default

if try cache.model(for: modelURL, options: .default) == nil {
    // Model preparation is required.
}
```

---

# 🧰 Explicit Specialization

Model을 실제로 load하는 순간까지 기다리지 않고 app이 직접 specialization을 요청할 수도 있다.

```swift
try await AIModel.specialize(contentsOf: modelURL)
```

좋은 trigger 예:

- Model asset download 직후
- 사용자가 AI feature를 opt-in한 직후
- onboarding 중 background preparation
- 해당 기능 화면으로 들어오기 전 preparation stage

---

# 🎛️ `SpecializationOptions`

Core AI는 specialization 전략을 조절하기 위한 `SpecializationOptions`를 제공한다.

즉 단순히 “specialize or not”만 있는 것이 아니라 inference 목적에 맞게 최적화 방법을 구성할 수 있다.

---

# 🧹 Cache Lifecycle 관리

`AIModelCache`에서는 다음을 제어할 수 있다.

- 더 이상 필요 없는 cache entry 삭제
- entry persistence policy 설정
- App Group 안의 여러 앱이 cache 공유

대형 모델은 storage footprint도 크므로 cache lifecycle이 제품 설계의 일부가 될 수 있다.

---

# 🏗️ Specialization 내부 단계

세션에서는 specialization을 크게 두 단계로 설명한다.

```text
1. Compilation
   - segmentation
   - planning
   - compute optimization

2. Executable artifact generation
   - target compute units용 artifact 생성
```

특히 첫 번째 compilation 단계가 latency의 대부분을 차지한다.

생성된 artifact는 해당 device와 OS version에 연결된다.

---

# ⚡ Ahead-of-Time Compilation

사용자 device에서 해야 할 specialization 작업을 줄이기 위해 일부 compilation을 개발 machine에서 미리 수행할 수 있다.

```text
Development machine
       ↓
AOT compilation
       ↓
Compiled model asset
       ↓
User device
       ↓
남은 device-specific specialization만 수행
```

완전히 specialization을 제거하는 것은 아니지만 device에서 해야 할 작업량을 줄여 first-run 준비 시간을 단축한다.

---

# 🧮 Tight Inference Loop 최적화

Core AI의 high-level inference API로 대부분의 use case를 처리할 수 있다.

그러나 매우 tight한 inference loop나 복잡한 compute pipeline에서는 더 낮은 수준의 API를 사용할 수 있다.

세션에서 소개하는 세 가지 최적화 방향:

- Optimal NDArray memory layout 확인
- Output value pre-allocation
- Asynchronous values를 이용한 inference pipeline 구성

---

# 🧱 Optimal NDArray Layout

Argument마다 framework가 선호하는 memory layout을 확인하고 그 layout으로 NDArray를 미리 할당할 수 있다.

목적:

```text
Inference 직전 layout conversion 제거
```

높은 빈도로 반복 실행되는 inference에서는 작은 conversion overhead도 누적될 수 있기 때문에 유용하다.

---

# ♻️ Output Pre-allocation

기본적으로 inference마다 새 output buffer를 만들면 allocation 비용이 반복된다.

Core AI는 output storage를 미리 준비하고 framework가 그 buffer에 결과를 쓰게 하는 형태를 지원한다.

```text
Allocate once
   ↓
Repeated inference
   ↓
Reuse output storage
```

---

# 🔗 Asynchronous Values

여러 inference function이 pipeline으로 연결되는 경우 asynchronous value를 이용해 실행을 효율적으로 이어갈 수 있다.

개념:

```text
Function A
   ↓ async value
Function B
   ↓ async value
Function C
```

중간 synchronization이나 unnecessary copy를 줄이는 데 활용할 수 있다.

---

# 📚 Core AI Models Repository

세션 마지막에는 Core AI Models repository가 소개된다.

제공 내용:

- Popular model examples
- 명령 한 번으로 conversion/optimization 가능한 구성
- Core AI model authoring / optimization / conversion을 돕는 AI skills
- 특정 model family를 위한 Swift package
- 저수준 inference optimization이 이미 포함된 higher-level API

처음부터 모든 runtime glue code를 직접 구현하지 않고 reference implementation을 출발점으로 삼을 수 있다.

---

# 🧠 Foundation Models와 연결

Repository와 Core AI API는 custom model을 Foundation Models framework와 연결하는 경로도 제공한다.

세션에서는 **Core AI Language model**을 만들 수 있으며 Foundation Models에 plug-in하여 custom model과 token sampling strategy를 사용할 수 있다고 설명한다.

즉 구조적으로:

```text
Custom Core AI language model
        ↓
Foundation Models framework
        ↓
Higher-level language model experience
```

이 가능하다.

---

# 🧩 Core AI 생태계 정리

| 영역 | 핵심 도구 / API | 역할 |
|---|---|---|
| Model 작성 | PyTorch / Core AI Python | 모델 정의 |
| 변환 | `coreai-torch` | PyTorch → Core AI |
| 검증 | Core AI Python runtime | PyTorch와 numerical 비교 |
| Asset | `.aimodel` | 배포 가능한 model source representation |
| Xcode | Model Viewer | Size, op distribution, function signature 확인 |
| Swift Runtime | `AIModel` | Model load/inspection |
| Swift Runtime | `InferenceFunction` | Compute graph 실행 |
| Tensor | `NDArray` | Input/output/state data |
| Mutable access | `NDArray.MutableView` | 안전하고 효율적인 backing storage 접근 |
| Stateful inference | States | KV cache 같은 in-place state 유지 |
| Profiling | Core AI Instruments | Inference latency 분석 |
| Numeric debugging | Core AI Debugger | Intermediate tensor와 source mapping |
| Quick diagnostics | Core AI debug gauge | 실시간 activity 확인 |
| Deployment | Specialization | Device-specific executable preparation |
| Cache | `AIModelCache` | Specialized model lifecycle 관리 |
| Deployment optimization | AOT compilation | On-device preparation 작업 감소 |
| Low-level optimization | Layout / pre-allocation / async values | Tight loop overhead 감소 |

---

# 🔁 Snake 데모 전체 흐름

```text
SnakeTransformer 작성 / 학습
        ↓
torch.export
        ↓
Dynamic sequence dimension 지정
        ↓
Core AI decomposition
        ↓
TorchConverter
        ↓
SnakeTransformer.aimodel
        ↓
PyTorch vs Core AI numerical check
        ↓
Xcode Model Viewer
        ↓
AIModel load
        ↓
InferenceFunction load
        ↓
NDArray input 생성
        ↓
Inference 실행
        ↓
게임 시간이 지날수록 latency 증가
        ↓
Core AI Instruments
        ↓
전체 history 재계산이 병목임을 확인
        ↓
PyTorch model에 K/V buffer 추가
        ↓
state_names 지정하여 재변환
        ↓
Swift에서 cache NDArrays 유지
        ↓
MutableViews를 states로 전달
        ↓
steady inference 성능 확보
```

---

# 📋 구현 체크리스트

## Model Conversion

- [ ] PyTorch model checkpoint 준비
- [ ] Representative example input 준비
- [ ] Dynamic dimension이 있다면 `torch.export.Dim` 정의
- [ ] `torch.export.export` 시 `dynamic_shapes` 지정
- [ ] Core AI decomposition table 적용
- [ ] Converter에 input/output name 명확히 지정
- [ ] `.aimodel` 저장

## Numerical Validation

- [ ] 동일 input을 PyTorch와 Core AI에 전달
- [ ] Output shape 일치 확인
- [ ] Max absolute difference 측정
- [ ] Use case에 맞는 tolerance 정의
- [ ] 변환 후 regression test 자동화

## Xcode Inspection

- [ ] Model size 확인
- [ ] Operation distribution 확인
- [ ] Function list 확인
- [ ] Input/output signature 확인
- [ ] Dynamic dimension이 의도대로 표현됐는지 확인

## Swift Integration

- [ ] `AIModel`을 적절한 preparation 시점에 load
- [ ] 필요한 `InferenceFunction` load
- [ ] `NDArray` shape/scalar type 검증
- [ ] `MutableView` 기반 input writing 검토
- [ ] Missing output에 대한 error handling
- [ ] Model object/function lifetime을 inference loop와 분리

## Performance Profiling

- [ ] 실제 device에서 Core AI Instruments 사용
- [ ] Inference interval 확인
- [ ] Sequence/context 길이에 따른 latency 추적
- [ ] Warm-up과 steady-state 성능 구분
- [ ] Optimizing 전/후 동일 조건 비교

## Stateful Model

- [ ] 반복 계산되는 state가 있는지 확인
- [ ] PyTorch에서 mutable buffer로 표현
- [ ] Conversion 시 `state_names` 지정
- [ ] Swift에서 state NDArray lifetime 유지
- [ ] `InferenceFunction.MutableViews` 구성
- [ ] State reset 시점 정의
- [ ] Maximum context length 정책 정의

## Specialization

- [ ] First-use specialization latency 측정
- [ ] Interactive path에서 최초 specialization 피하기
- [ ] `AIModelCache` lookup으로 준비 상태 확인
- [ ] Asset download 후 proactive specialization 고려
- [ ] `SpecializationOptions` 검토
- [ ] Cache deletion/persistence policy 결정
- [ ] App Group cache sharing 필요 여부 검토

## AOT Compilation

- [ ] Model 규모가 큰 경우 AOT 필요성 측정
- [ ] Device에서 발생하는 specialization time 비교
- [ ] AOT 적용 후 first-run latency 재측정
- [ ] OS/device-specific remaining specialization 고려

## Tight Loop Optimization

- [ ] Optimal NDArray memory layout 확인
- [ ] Layout conversion overhead 측정
- [ ] Output pre-allocation 검토
- [ ] Buffer reuse 정책 정의
- [ ] 여러 function pipeline에서 async values 검토

## Debugging

- [ ] Xcode Core AI debug gauge로 activity 확인
- [ ] Numeric mismatch 시 Core AI Debugger 사용
- [ ] Intermediate tensor 검사
- [ ] Converted operation → Python source trace 확인
- [ ] Performance issue는 Instruments로 이동

---

# ⚠️ 설계 시 주의할 점

## `.aimodel` load 비용과 specialization 비용을 구분

Model file을 읽는 것과 device용 specialization은 같은 문제가 아니다.

첫 실행이 느리다면 단순 file I/O만 의심하지 말고 model이 cache에 specialized되어 있는지 확인해야 한다.

## Dynamic shape는 conversion 시 의도를 명확히 해야 함

Example input의 shape만 보고 static graph가 만들어지지 않도록 실제 runtime에서 변하는 dimension을 export 단계에서 지정해야 한다.

## Numerical verification을 생략하지 않기

Conversion 성공은 output correctness를 보장하지 않는다.

원본 model과 converted model의 output을 같은 sample로 비교해야 한다.

## State는 lifetime 설계가 중요

KV cache처럼 inference 사이에 유지되어야 하는 state는 model invocation local variable로 매번 다시 만들면 최적화 효과가 사라진다.

반대로 session이나 game이 종료되면 적절히 reset해야 한다.

## High-level API부터 시작

세션은 대부분의 use case에서는 high-level inference API로 충분하다고 설명한다.

Memory layout, output pre-allocation, async pipeline 같은 low-level optimization은 profiling 결과가 필요성을 보여줄 때 적용하는 편이 자연스럽다.

---

# 🧭 API 선택 흐름

```text
단순 model inference가 필요
       ↓
AIModel + InferenceFunction + NDArray
       ↓
성능 문제 없음
       └─ 완료
       ↓
성능 문제 있음
       ↓
Instruments
       ↓
반복 계산 문제?
  ├─ Yes → states / KV cache
  └─ No
       ↓
Allocation/layout overhead?
  ├─ Yes → optimal layout / pre-allocation
  └─ No
       ↓
Multi-stage pipeline?
  └─ async values 검토
```

---

# 🎯 주요 API 요약

## Model load

```swift
let model = try await AIModel(contentsOf: modelURL)
let function = try model.loadFunction(named: "main")
```

## Input NDArray

```swift
var input = NDArray(
    shape: [sequenceLength, hiddenDim],
    scalarType: .float32
)
```

## Inference

```swift
var outputs = try await function.run(
    inputs: ["features": input]
)
```

## Stateful inference

```swift
var states = InferenceFunction.MutableViews()
states.insert(&keyCache, for: "keyCache")
states.insert(&valueCache, for: "valueCache")

let outputs = try await function.run(
    inputs: ["features": input],
    states: states
)
```

## Cache check

```swift
let cache = AIModelCache.default
let cachedModel = try cache.model(
    for: modelURL,
    options: .default
)
```

## Explicit specialization

```swift
try await AIModel.specialize(contentsOf: modelURL)
```

---

# 🧠 세션이 보여주는 Core AI의 위치

Core AI는 Foundation Models와 역할이 다르다.

Foundation Models가 language model을 higher-level API로 활용하는 경험을 제공한다면, 이번 세션의 Core AI는 **개발자가 직접 준비한 모델을 Apple Silicon에 효율적으로 배포하고 제어하는 범용 inference layer**에 더 가깝다.

세션 마지막에 custom Core AI language model을 Foundation Models에 연결할 수 있다고 설명하는 것도 두 계층이 경쟁 관계가 아니라 연결될 수 있는 구조임을 보여준다.

```text
Custom model
   ↓
Core AI runtime
   ↓
필요하면 Foundation Models higher-level integration
```

---

# 🔑 핵심 메시지

Core AI의 핵심은 “새로운 모델 형식” 하나가 아니다.

모델이 실제 앱 기능이 되기까지 필요한 전체 chain을 하나의 ecosystem으로 제공한다.

```text
PyTorch ecosystem
       ↓
Conversion
       ↓
Numerical verification
       ↓
Xcode inspection
       ↓
Modern Swift inference
       ↓
Instrumentation
       ↓
Stateful optimization
       ↓
Device specialization
       ↓
AOT deployment optimization
```

Snake 게임 데모는 작지만 같은 API와 도구가 더 큰 vision model이나 language model로 확장된다는 것이 세션의 중심 메시지다.

특히 실제 제품에서 중요한 부분은 단순히 inference가 “된다”는 것보다 다음 네 가지다.

```text
Correctness
+
Latency
+
Memory / compute efficiency
+
First-use experience
```

Core AI는 각각에 대응하는 도구를 제공한다.

- Correctness → Python numerical comparison + Core AI Debugger
- Latency → Core AI Instruments
- Runtime efficiency → states, layout, pre-allocation, async values
- First-use experience → AIModelCache, specialization control, AOT compilation

따라서 Core AI를 도입할 때는 model conversion만 끝내는 것이 아니라 **변환 → 검증 → 프로파일링 → specialization 전략**까지 함께 설계하는 것이 중요하다.

---

# 함께 보면 좋은 세션과 자료

- Dive into Core AI model authoring and optimization — WWDC26
- Integrate on-device AI models into your app using Core AI — WWDC26
- Optimize custom machine learning operations with Metal tensors — WWDC26
- Core AI PyTorch Extensions
- Core AI Python
- Core AI Optimization
- Compiling Core AI models ahead of time
- Managing model specialization and caching
