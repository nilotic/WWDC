# WWDC26 Dive into Core AI model authoring and optimization 요약

- Session: 325
- Title: Dive into Core AI model authoring and optimization
- Source: https://developer.apple.com/videos/play/wwdc2026/325/
- Topic: Core AI, PyTorch, Model Optimization, Core AI Debugger, Metal 4, On-device AI
- Chapters: Introduction, Models and skills, Python workflow, Model optimization, Core AI Debugger, Advanced authoring, Custom Metal kernels, Model re-authoring, Next steps

---

## 한 줄 요약

Core AI는 PyTorch 모델을 `.aimodel`로 변환하고 Apple silicon에서 실행하는 기본 파이프라인부터, `coreai-opt` 기반 압축, Core AI Debugger의 operation 단위 비교, custom Metal 4 kernel 삽입, iOS 하드웨어 특성에 맞춘 모델 재저작까지 하나의 Python 중심 workflow로 제공한다.

---

## 핵심 요약

이번 세션은 Core AI의 전체 배포 lifecycle 중 Python 생태계에 집중한다.

- **Core AI models와 Skills**
  - `coreai-models` open-source repository
  - 바로 사용할 수 있는 generative architecture와 reusable component
  - Swift package를 통한 앱 내 LLM 실행 예제
  - Coding assistant에 설치할 수 있는 Core AI Skills
  - 목표 하드웨어, 모델, latency·memory 제약을 바탕으로 conversion·optimization·authoring 계획 수립

- **기본 Python workflow**
  - `pip install coreai-torch`
  - PyTorch model을 `torch.export`로 `ExportedProgram` 생성
  - `TorchConverter`로 Core AI program 변환
  - optimize 후 `.aimodel` asset 저장
  - `AIModel.load`와 function loading으로 Python에서 직접 inference

- **Model optimization**
  - `coreai-opt`의 config-driven compression
  - int4, int8, FP4, FP8 weight compression
  - Per-channel 등 flexible granularity
  - Calibration 기반 quantization 또는 quantization-aware training
  - macOS와 iOS에 서로 다른 compression strategy 적용 가능

- **SAM3 사례**
  - 850M parameter prompt-based image segmentation model
  - Baseline asset: 3GB 이상
  - 4-bit per-channel symmetric quantization 후 약 430MB
  - 하지만 가려진 꽃 하나가 검출되지 않는 품질 저하 발생
  - Core AI Debugger로 detector decoder에서 divergence 집중 확인
  - 전체 parameter의 4%인 detector는 압축에서 제외
  - Baseline 품질 회복과 작은 모델 크기 동시 달성

- **Core AI Debugger**
  - PyTorch module hierarchy 기반 Navigator
  - Operation graph를 보여주는 Structure Viewer
  - 원본 Python line을 보여주는 Source Viewer
  - Tensor와 input/output detail을 보여주는 Inspector
  - 실제 Apple hardware에서 model specialize·실행
  - PyTorch intermediate file과 specialized model의 sync point 비교
  - PSNR 같은 similarity metric으로 divergence 정렬

- **Advanced authoring**
  - 여러 operation을 하나의 kernel dispatch로 fuse
  - Scaled Dot Product Attention 같은 pre-packaged primitive 활용
  - Custom Metal 4 kernel을 `.aimodel` 안에 직접 포함
  - iOS에 맞게 static shape, channels-first layout, convolutional pattern 등으로 model re-authoring

- **Multi-function model**
  - SAM3를 `image_encode`, `text_encode`, `detect` 세 entry point로 분리
  - Image와 prompt를 서로 다른 cadence로 처리
  - Encoder만 4-bit palettization
  - Detector는 uncompressed 유지
  - Prompt만 변경할 때 text encoder와 detector만 다시 실행
  - Warmup 이후 두 번째 inference 76% 단축

---

# 🧭 Core AI의 전체 역할

Core AI는 모델 배포 lifecycle 전체를 다루는 기술 묶음이다.

```text
Model Authoring
      ↓
Optimization
      ↓
Conversion
      ↓
Debugging / Verification
      ↓
Apple Silicon Specialization
      ↓
App Integration
```

이번 세션은 이 가운데 Python과 PyTorch에서 시작해 Apple silicon의 on-device execution까지 이어지는 workflow를 설명한다.

Core AI의 목표는 단순히 기존 모델 format을 변환하는 데 있지 않다.

모델이 실제 대상 기기의 latency, memory, power, quality 요구를 만족하도록 압축하고, 내부 동작을 검증하며, 필요하면 PyTorch source 자체를 하드웨어 특성에 맞게 다시 구성하는 것까지 포함한다.

---

# 📚 `coreai-models` Repository

Core AI 생태계의 출발점은 `coreai-models` open-source repository다.

Repository에는 다음이 포함된다.

- Apple silicon에서 실행하도록 준비된 model architecture
- 최신 large language model을 포함한 generative model 예제
- 다양한 use case와 constraint에 맞게 engineering된 구현
- Bring-your-own-model workflow에 재사용할 component
- 앱에서 LLM을 실행할 수 있는 Swift package
- Core AI 활용을 돕는 agent skills

개발자는 모든 model architecture와 최적화 pattern을 처음부터 만들지 않고, 이미 제공되는 implementation과 component를 출발점으로 사용할 수 있다.

---

# 🤖 Core AI Skills

`coreai-models`에는 coding assistant에 설치할 수 있는 Core AI Skills가 포함된다.

Skills는 단순한 code completion template이 아니다.

사용자의 요구를 수집해 다음 단계의 deployment plan으로 변환한다.

예를 들어 coding agent는 다음을 확인할 수 있다.

- 어떤 model을 배포하는가?
- 어느 Apple hardware family를 target하는가?
- iPhone, Mac 중 어디가 우선인가?
- Latency 목표는 무엇인가?
- Memory 또는 app size 제한은 무엇인가?
- 품질 저하를 어느 정도 허용할 수 있는가?

이 요구가 다음 선택에 영향을 준다.

- PyTorch code를 그대로 변환할지
- 특정 operation을 rewrite할지
- 어떤 compression을 적용할지
- Custom kernel이 필요한지
- 하나의 function 또는 여러 entry point로 나눌지
- 어떤 hardware에서 검증할지

세션의 많은 code도 Core AI Skills를 사용하는 agent와 공동 작성되었다.

---

# 🐍 Core AI Python 설치

Python workflow의 주요 entry point는 Core AI PyTorch Extensions다.

설치는 다음 한 줄로 시작한다.

```bash
pip install coreai-torch
```

이 package는 다음을 함께 설치한다.

- `coreai`
- `coreai-torch`

`coreai-torch`는 PyTorch exported program을 Core AI program으로 변환하는 역할을 한다.

---

# 🔁 기본 변환 Pipeline

기본 pipeline은 다음과 같다.

```text
PyTorch nn.Module
      ↓
torch.export
      ↓
ExportedProgram
      ↓
Core AI TorchConverter
      ↓
Core AI Program
      ↓
Optimize / Specialize
      ↓
.aimodel Asset
      ↓
Apple Silicon Inference
```

`torch.export`가 만든 `ExportedProgram`에는 다음 정보가 포함된다.

- Weights
- Operations
- Tensor shapes
- Computational graph

Core AI converter는 이 graph를 Apple silicon에서 실행 가능한 Core AI representation으로 변환한다.

---

# 🧪 PyTorch Model Export

세션의 첫 예제는 두 개의 linear layer와 ReLU를 사용하는 간단한 MLP다.

```python
import torch
import torch.nn as nn

class MLP(nn.Module):
    def __init__(self):
        super().__init__()
        self.fc1 = nn.Linear(256, 512)
        self.fc2 = nn.Linear(512, 10)

    def forward(self, x):
        return self.fc2(torch.relu(self.fc1(x)))

model = MLP().eval()
example_input = (torch.randn(1, 256),)
exported_program = torch.export.export(
    model,
    example_input
)
```

Example input은 graph capture 과정에서 tensor shape와 operation path를 결정하는 데 사용된다.

---

# 🏗️ `TorchConverter`

Exported program을 Core AI model로 바꾸기 위해 `TorchConverter`를 사용한다.

```python
import coreai
import coreai_torch
from coreai.runtime import NDArray

converter = coreai_torch.TorchConverter()
converter.add_exported_program(
    exported_program,
    input_names=["features"],
    output_names=["logits"]
)

core_ai_program = converter.to_coreai()
```

Input과 output에 이름을 부여하면 이후 function invocation에서 dictionary key로 사용할 수 있다.

---

# 📦 `.aimodel` Asset

변환된 program은 optimize한 후 `.aimodel` asset으로 저장한다.

```python
core_ai_program.optimize()
asset = core_ai_program.save_asset(
    "mlp.aimodel"
)
```

`.aimodel`은 Apple silicon에서 실행할 수 있는 on-device format이다.

Core AI는 실행 전에 target hardware에 맞는 specialization을 수행할 수 있다.

---

# ▶️ Python에서 직접 Inference

변환과 저장뿐 아니라 Python에서 바로 model을 load하고 실행할 수 있다.

```python
specialized_model = await AIModel.load(
    "mlp.aimodel"
)

specialized_function = \
    specialized_model.load_function("main")

result = await specialized_function({
    "features": NDArray(
        example_input[0].numpy()
    )
})
```

Input name과 NumPy tensor를 mapping한 dictionary만 전달하면 된다.

즉 conversion, optimization, execution verification을 notebook 또는 Python environment 안에서 연속적으로 수행할 수 있다.

---

# 🧰 Advanced Conversion 기능

`coreai-torch`는 단순 변환 외에 다음 advanced authoring 기능도 제공한다.

- 여러 model 또는 function을 하나의 asset에 조합
- 특정 operation을 위한 custom lowering 등록
- Metal 4 kernel을 model asset 안에 inline
- Specialization option 지정
- Python에서 native inference

따라서 단순한 one-model-one-function 구조에 제한되지 않는다.

---

# 🗜️ `coreai-opt` Model Optimization

모델 크기와 실행 비용을 줄이기 위해 `coreai-opt`를 사용한다.

`coreai-opt`는 config-driven compression library다.

개발자는 다음을 설정할 수 있다.

- 어떤 module을 압축할지
- 어떤 layer를 제외할지
- 어느 bit width를 사용할지
- Granularity를 어떻게 적용할지
- macOS와 iOS에 다른 scheme을 사용할지

지원되는 weight compression 예:

- int4
- int8
- FP4
- FP8

또한 다음 quantization workflow를 지원한다.

- 소량의 calibration data를 사용하는 quantization
- 더 큰 dataset을 이용한 quantization-aware training

---

# 🎯 Platform-aware Compression

최적의 compression은 모든 target에서 같지 않다.

예를 들어 Mac과 iPhone은 다음 제약이 다를 수 있다.

- Available memory
- Compute capability
- Power budget
- Thermal budget
- App size
- Latency target

`coreai-opt` config를 이용하면 target platform에 맞는 compression policy를 선택할 수 있다.

즉 모델 전체에 하나의 universal quantization scheme을 무조건 적용하기보다 실제 배포 대상에 맞춰 조정한다.

---

# 🌸 SAM3 사례

세션의 주요 optimization 예제는 SAM3다.

SAM3의 특징:

- 약 850 million parameters
- Prompt-based image segmentation
- 사용자의 text prompt를 바탕으로 image object mask 생성

모델의 주요 구조는 세 부분이다.

```text
Image Encoder
      +
Text Encoder
      ↓
Detector + Mask Decoder
      ↓
Segmentation Mask
```

Image encoder와 text encoder가 전체 parameter의 약 96%를 차지한다.

Detector block은 parameter 비중은 작지만 최종 detection quality에 민감하다.

---

# 🧩 Export Wrapper와 Decomposition

SAM3를 export하기 위해 wrapper를 만든다.

Wrapper는 `torch.export`가 capture할 model interface를 정의한다.

Conversion helper에서는 Core AI custom decomposition table을 적용한다.

목적은 attention처럼 Core AI가 고수준 semantic으로 이해하는 operation을 graph에서 보존하는 것이다.

일반 decomposition이 모든 high-level op를 작은 primitive로 풀어버리면 Core AI runtime이 optimized attention implementation으로 mapping하기 어려울 수 있다.

따라서 Core AI용 decomposition table은 의미 있는 semantic을 유지한다.

필요하면 `coreai-opt` helper를 이용해 program을 16-bit floating point로 cast할 수도 있다.

---

# 📏 Baseline Model

Baseline은 32-bit converted SAM3 model이다.

세션의 baseline asset 크기:

```text
3GB 이상
```

Image에서 모든 꽃을 segmentation하도록 요청하면 가려진 꽃까지 정상적으로 검출된다.

이 결과가 compression 이후에도 유지해야 할 quality baseline이다.

---

# 4️⃣ 4-bit Quantization

`coreai-opt`는 preset configuration을 제공한다.

세션에서는 `presets.w4`를 사용한다.

특징:

- 4-bit
- Per-channel
- Symmetric quantization

Weight compression에는 `ExecutionMode.EAGER`를 사용한다.

Activation을 대상으로 할 때는 `GRAPH` mode를 사용한다.

Quantizer에 config와 example input을 전달한 뒤 finalize하면 compressed model을 얻는다.

---

# 📉 압축 결과

압축 후 model asset 크기:

```text
약 430MB
```

3GB 이상에서 약 430MB로 크게 줄었다.

하지만 output quality를 확인하자 가려진 꽃 하나가 더 이상 검출되지 않는다.

문제는 모든 layer에 동일한 aggressive compression을 적용한 것이다.

Layer마다 quantization sensitivity가 다르기 때문에 model size만 보고 성공으로 판단할 수 없다.

---

# 🔬 Core AI Debugger

Core AI Debugger는 모델을 inspect, execute, compare하는 standalone application이다.

주요 기능:

- Graph structure 시각화
- PyTorch source와 operation 연결
- Apple device에서 실제 실행
- Intermediate tensor 확인
- Reference run과 specialized run 비교
- Quantization이나 conversion divergence 진단

복잡한 model에서 output만 보고 원인을 추측하는 대신 graph 내부로 들어갈 수 있다.

---

# 🧭 Debugger Workspace

Workspace는 여러 영역으로 구성된다.

## Navigator

- Model operation 목록
- PyTorch module hierarchy로 grouping
- Large model을 familiar한 module 구조로 탐색

## Structure Viewer

- Graphical operation graph
- Connectivity
- Execution order
- Data dependency

## Source Viewer

- Original Python code
- 선택한 operation과 구체적인 source line 연결

## Inspector

- Operation description
- Inputs와 outputs
- Tensor detail
- Runtime output preview

이 네 view를 함께 사용하면 graph, source, runtime result 사이를 빠르게 오갈 수 있다.

---

# 🖥️ 실제 Hardware에서 실행

Debugger의 scheme settings에서 target device를 선택한다.

세션에서는 Mac을 선택하고 다음 input을 제공한다.

- Pixel values
- Input IDs
- Attention mask

Run을 실행하면 model이 해당 Mac에 맞게 specialize된다.

이후 structure viewer는 Mac에서 실제 실행되는 specialized model을 보여준다.

각 operation을 선택하면 별도의 instrumentation code 없이 output tensor를 Inspector에서 볼 수 있다.

---

# 🖼️ Final Mask 확인

Model 마지막 operation의 tensor preview를 열면 segmentation mask를 시각적으로 볼 수 있다.

Quantized model에서도 notebook과 동일하게 가려진 꽃 하나가 빠져 있음을 확인한다.

이제 문제를 PyTorch baseline과 operation 단위로 비교해야 한다.

---

# 💾 Save Intermediates API

Python notebook에서 새로운 save intermediates API를 사용한다.

이 API는 PyTorch model을 실행하면서 각 operation의 intermediate tensor value를 저장한다.

세션에서는 다음 두 model을 함께 사용한다.

- Original SAM3
- int4 compressed SAM3

저장된 intermediates file을 Core AI Debugger의 reference run으로 불러온다.

---

# 🔗 Sync Points

Comparison session을 시작하면 Navigator에 operation pair가 나타난다.

각 pair는 다음 두 결과를 연결한다.

- Specialized Core AI model operation
- Original PyTorch model operation

이 operation pair를 `sync point`라고 한다.

Sync point는 두 실행 결과가 일치할 것으로 예상되는 지점이다.

Debugger가 graph 전체에서 sync point를 자동 식별한다.

---

# 📐 Similarity Metric

각 sync point에는 두 tensor의 유사도를 나타내는 metric이 표시된다.

기본 metric은 PSNR이다.

```text
PSNR = Peak Signal-to-Noise Ratio
```

Model 특성에 따라 다른 similarity indicator를 선택할 수도 있다.

Debugger는 상태를 색으로도 표현한다.

- Green: 매우 유사
- Yellow: 중간 정도 divergence
- Red: 큰 차이

Similarity 기준으로 정렬하면 divergence가 큰 operation부터 조사할 수 있다.

---

# 🕵️ Detector Decoder 문제 발견

Low-PSNR sync point를 하나씩 살펴보자 대부분 detector decoder에서 발생한다.

즉 quantization이 detector 결과를 손상시키고 있었다.

중요한 관찰:

- Detector는 전체 parameter의 약 4%
- 압축으로 얻는 size benefit이 작음
- 하지만 output quality에는 민감함

따라서 detector를 aggressive compression 대상에서 제외하는 것이 합리적이다.

---

# ✅ Selective Compression

Quantization scheme을 변경해 detector를 무시한다.

```text
Image Encoder → 압축
Text Encoder  → 압축
Detector      → 압축 제외
```

새 scheme으로 model을 다시 export하고 실행하자 모든 꽃이 baseline과 동일하게 검출된다.

동시에 model은 원본보다 훨씬 작은 크기를 유지한다.

이 사례는 compression을 model 전체에 균일하게 적용하지 말아야 하는 이유를 보여준다.

---

# 🧠 Debugger가 바꾼 Workflow

Debugger가 없다면 다음 작업이 필요할 수 있다.

- Intermediate tensor 직접 instrumentation
- Operation별 output 저장
- PyTorch와 device output 수동 mapping
- Difference 계산 script 작성
- Module별 원인 추적

Core AI Debugger는 이를 visual comparison workflow로 통합한다.

세션에서는 output의 missing detection에서 시작해 몇 분 안에 revised quantization scheme에 도달한다.

---

# 🧬 Advanced Model Authoring

일반적인 end-to-end conversion은 많은 모델에 충분하다.

하지만 latency, memory, power 요구가 엄격하면 computational graph 자체를 더 깊게 조정해야 한다.

Advanced authoring의 대표적인 접근:

- Operation fusion
- Optimized primitive 사용
- Custom Metal kernel
- Tensor layout 변경
- Model interface 변경
- Function split
- Target-specific PyTorch rewrite

---

# 🔗 Operation Fusion

여러 연속 operation을 하나의 operation으로 fuse할 수 있다.

```text
Op A
  ↓
Op B
  ↓
Op C
```

을 다음처럼 바꾼다.

```text
Fused Kernel
```

효과:

- Kernel dispatch 수 감소
- Intermediate memory traffic 감소 가능
- Hardware utilization 향상

Core AI는 Scaled Dot Product Attention처럼 Transformer에서 자주 사용하는 heavy operation을 위한 pre-packaged fast kernel과 primitive를 제공한다.

---

# ⚙️ Custom Metal 4 Kernel

기본 primitive로 충분하지 않다면 custom Metal 4 kernel을 model asset 안에 넣을 수 있다.

Converter의 input은 두 가지가 된다.

```text
PyTorch Exported Program
        +
Custom MSL Kernel Source
        ↓
TorchConverter
        ↓
Kernel이 포함된 하나의 .aimodel
```

Metal source는 model asset 내부에 embed된다.

별도의 shader file로 배포하는 것이 아니라 kernel이 model과 함께 이동한다.

---

# 🧪 SiLU Reference와 MSL Kernel

세션 예제는 Sigmoid Linear Unit, SiLU activation이다.

PyTorch reference:

```python
def silu_torch(x):
    return x * torch.sigmoid(x)
```

MSL kernel body:

```metal
float val = float(x[gid]);
float sig = 1.0f / (1.0f + exp(-val));
y[gid] = TYPE(val * sig);
```

`torch.export`는 PyTorch reference semantics를 본다.

Core AI는 이를 등록된 custom Metal kernel과 연결해 실제 실행에서는 GPU kernel을 사용한다.

---

# 🧰 `TorchMetalKernel`

```python
from coreai_torch.dsl import (
    TorchMetalKernel,
    MetalParameter
)

silu_kernel = TorchMetalKernel(
    name="fused_silu",
    input_names=["x"],
    result_names=["y"],
    src=SILU_MSL,
    torch_defn=silu_torch,
    metal_params=[
        MetalParameter(
            "gid",
            "uint",
            "thread_position_in_grid"
        )
    ],
    template_dtypes={"x": "TYPE"},
)
```

구성 요소:

- Kernel name
- Input과 output name
- MSL source
- PyTorch reference function
- Metal builtin parameter
- Template data type

---

# 🧵 Model에서 Custom Kernel 호출

Custom kernel은 Python function처럼 model 안에서 호출한다.

```python
class MyModel(torch.nn.Module):
    def __init__(self):
        super().__init__()
        self.linear = torch.nn.Linear(
            256,
            256
        )

    def forward(self, x):
        h = self.linear(x)
        n = h.numel()

        return silu_kernel(
            h,
            threads_per_grid_size=(n, 1, 1),
            threads_per_thread_group=(
                min(n, 256),
                1,
                1
            ),
            result_shapes=[h.shape],
        )
```

`result_shapes`를 각 instantiation에 전달한다.

Dynamic-shaped input을 사용하는 경우에도 Core AI가 input shape로부터 kernel output shape 계산을 asset에 포함할 수 있게 한다.

---

# 📦 Custom Kernel 등록과 변환

```python
exported_program = torch.export.export(
    MyModel(),
    (torch.randn(1, 256),)
)

converter = coreai_torch.TorchConverter()
converter.register_custom_kernels([
    silu_kernel
])

converter.add_exported_program(
    exported_program,
    input_names=["x"],
    output_names=["y"]
)

deployable = converter.to_coreai()
```

등록된 MSL source가 최종 model asset에 통합된다.

---

# ✍️ Model Re-authoring

Operation fusion보다 더 큰 최적화가 필요하면 model source 자체를 target에 맞춰 다시 작성한다.

Model re-authoring은 단순한 graph optimization pass가 아니다.

다음이 바뀔 수 있다.

- Operation 종류
- Tensor layout
- Static/dynamic shape 정책
- Model interface
- Function boundary
- Cache update 방식
- Module architecture

결과적으로 원본과 의미는 같지만 implementation은 크게 다른 PyTorch model이 된다.

---

# 📱 iOS에 맞는 Pattern

세션에서 iOS target을 위해 언급한 pattern:

- Static tensor shapes
- Channels-first tensor layouts
- Convolutional operation patterns
- In-place Key-Value cache update semantic
- Hardware primitive에 mapping 가능한 구조

이 pattern은 Core AI runtime이 적절한 compute unit의 native primitive를 활용하는 데 도움을 준다.

---

# 🧪 Rigorous Testing

Model re-authoring은 implementation이 크게 달라지므로 testing이 필수다.

필요한 test level:

- Module unit test
- End-to-end integration test
- Original model과 numerical comparison
- Task-level quality evaluation
- Target hardware execution validation

각 building block뿐 아니라 전체 model이 동일한 의미와 품질을 유지하는지 확인해야 한다.

`coreai-models`에는 재사용 가능한 component와 best practice example이 포함된다.

Core AI Skills도 Apple silicon 친화적인 PyTorch code 작성을 coding assistant에 안내할 수 있다.

---

# 🧩 SAM3 Multi-function Re-authoring

SAM3를 하나의 end-to-end function으로 유지하지 않고 세 function으로 나눈다.

```text
image_encode
text_encode
detect
```

각 function의 역할:

| Function | 역할 |
|---|---|
| `image_encode` | Image feature 계산 |
| `text_encode` | Prompt embedding 계산 |
| `detect` | Detection과 mask post-processing |

---

# ⏱️ 서로 다른 Cadence

Function을 분리하면 각 계산을 필요한 빈도로만 실행할 수 있다.

예:

- Image가 바뀌지 않으면 `image_encode` 결과 재사용
- Prompt만 바뀌면 `text_encode`와 `detect`만 실행
- 같은 prompt를 여러 image에 쓸 수도 있음

하나의 monolithic function에서는 모든 input 변경 때 전체 graph를 다시 실행하기 쉽다.

Function split은 application interaction pattern을 model interface에 반영한다.

---

# 🔧 Encoder Re-authoring

Image encoder attention block을 iOS에서 power-efficient하게 실행하도록 다시 작성한다.

대표적인 변화:

- Standard Linear layer 대신 convolutional projection
- Channels-first layout
- Static shape 활용
- Core AI가 native hardware primitive로 mapping하기 쉬운 operation pattern

Text encoder도 유사하게 변경한다.

Detector는 compute와 parameter 비중이 작아 re-authoring benefit이 제한적이므로 대부분 그대로 유지한다.

---

# 🎨 4-bit Palettization

두 encoder에는 4-bit palettization과 per-channel scale을 적용한다.

Palettization은 lookup table 기반 compression이다.

세션에서는 iOS의 power efficiency에 적합한 방식으로 설명한다.

`KMeansPalettizer`에 model과 config를 전달하고 prepare와 finalize를 수행한다.

Detector는 이전 Debugger 분석에서 compression-sensitive하다는 사실을 알았으므로 uncompressed 상태로 둔다.

---

# 🖼️ Input Size 변경

iPhone에서 실행하기 위해 input image size를 줄인다.

```text
1008 pixels → 336 pixels
```

Model compression뿐 아니라 input resolution도 latency와 memory에 큰 영향을 준다.

Target device에 맞는 end-to-end constraint를 고려한 결정이다.

---

# 🧮 하나의 Asset, 세 Entry Point

세 module을 각각 `torch.export`한다.

모든 exported program은 half precision으로 cast한다.

하나의 `TorchConverter`에 세 program을 각 entry point 이름과 함께 추가한다.

```text
TorchConverter
├── image_encode
├── text_encode
└── detect
```

저장 결과는 세 callable function이 들어 있는 하나의 `.aimodel` asset이다.

배포와 versioning은 하나의 artifact로 유지하면서 execution boundary는 세분화된다.

---

# 🚀 76% 빠른 두 번째 Inference

첫 실행에서는 flowers prompt로 모든 꽃을 segmentation한다.

그 다음 prompt를 butterfly로 변경한다.

Image는 동일하므로 `image_encode`를 다시 실행하지 않는다.

다음만 실행한다.

```text
text_encode
    ↓
detect
```

Warmup 이후 두 번째 inference는 76% 더 빨라진다.

이 개선은 단순 quantization이 아니라 application workflow에 맞게 model function을 재설계한 결과다.

---

# 🧩 단계별 Optimization 전략

세션의 흐름은 최적화를 점진적으로 수행하는 방법을 보여준다.

```text
1. PyTorch Model 그대로 변환
        ↓
2. Baseline 품질과 크기 측정
        ↓
3. Global Compression 적용
        ↓
4. 품질 저하 발견
        ↓
5. Debugger로 민감한 Module 식별
        ↓
6. Selective Compression
        ↓
7. 필요하면 Custom Kernel
        ↓
8. Target-specific Re-authoring
        ↓
9. Multi-function Asset 구성
        ↓
10. 실제 Device에서 검증
```

처음부터 가장 복잡한 re-authoring으로 시작하기보다 baseline conversion에서 출발해 constraint에 따라 깊이를 늘린다.

---

# 📋 체크리스트

## Core AI 시작

- [ ] `coreai-models`에 유사 architecture가 있는지 확인
- [ ] Reusable component와 sample 검토
- [ ] Core AI Skills를 coding assistant에 설치할지 검토
- [ ] Target hardware family 명확히 정의
- [ ] Latency, memory, power, app size, quality 목표 기록
- [ ] Python environment에 `coreai-torch` 설치

## PyTorch Export

- [ ] Model을 evaluation mode로 설정
- [ ] Representative example input 준비
- [ ] `torch.export`가 전체 graph를 capture하는지 확인
- [ ] Dynamic shape 필요 여부 검토
- [ ] Input과 output interface 명확히 정의
- [ ] Core AI custom decomposition table 사용 검토
- [ ] Attention 같은 high-level semantic 보존 확인

## Conversion

- [ ] `TorchConverter` 생성
- [ ] Input/output name 지정
- [ ] Converted program 생성
- [ ] Optimize와 specialization option 검토
- [ ] `.aimodel` asset 저장
- [ ] Python에서 function load와 inference 검증
- [ ] NumPy/NDArray input mapping 확인

## Baseline

- [ ] Compression 전 asset size 측정
- [ ] Target device latency 측정
- [ ] Task-level quality baseline 저장
- [ ] Representative edge case 포함
- [ ] Intermediate reference output 보존
- [ ] Baseline 없이 compression 결과를 판단하지 않기

## `coreai-opt`

- [ ] Target platform별 compression policy 분리 검토
- [ ] int4, int8, FP4, FP8 중 후보 선택
- [ ] Per-channel 등 granularity 결정
- [ ] Weight와 activation compression 구분
- [ ] Weight compression에는 EAGER mode 검토
- [ ] Activation에는 GRAPH mode 검토
- [ ] Calibration data 품질 확인
- [ ] 필요하면 quantization-aware training 적용
- [ ] Preset을 baseline으로 시작하고 config 세분화

## Compression 품질

- [ ] Asset size만으로 성공 판단하지 않기
- [ ] Task output을 baseline과 비교
- [ ] Occlusion, 작은 object 등 어려운 sample 포함
- [ ] Layer별 sensitivity가 다름을 전제
- [ ] Parameter 비중이 작은 민감 module은 압축 제외 검토
- [ ] Selective compression 후 재검증

## Core AI Debugger

- [ ] Model structure를 PyTorch module hierarchy로 탐색
- [ ] Structure Viewer에서 connectivity 확인
- [ ] Source Viewer로 원본 Python line 연결
- [ ] Inspector에서 input/output tensor 확인
- [ ] 실제 target hardware 선택
- [ ] Representative input으로 specialize·run
- [ ] Final output tensor preview 확인
- [ ] PyTorch save intermediates file 생성
- [ ] Comparison session 시작
- [ ] Sync point와 similarity metric 확인
- [ ] PSNR이 모델에 적절한지 검토
- [ ] Low-similarity point를 module별로 분석

## Custom Metal Kernel

- [ ] 기존 Core AI primitive로 충분한지 먼저 확인
- [ ] PyTorch reference function 작성
- [ ] MSL kernel source 작성
- [ ] Input/output name 일치 확인
- [ ] Thread grid와 threadgroup size 설정
- [ ] Dynamic input이면 result shape 전달
- [ ] `TorchMetalKernel` 등록
- [ ] Converter에 custom kernel 등록
- [ ] Kernel이 `.aimodel`에 포함되는지 확인
- [ ] Numerical correctness와 GPU performance 측정

## Model Re-authoring

- [ ] End-to-end conversion이 constraint를 만족하는지 먼저 평가
- [ ] Static shape 적용 가능 여부 검토
- [ ] Channels-first layout 검토
- [ ] Linear을 convolutional pattern으로 바꾸는 이점 측정
- [ ] KV cache in-place update semantic 활용 검토
- [ ] Function boundary를 app interaction에 맞게 설계
- [ ] Module unit test 작성
- [ ] End-to-end integration test 작성
- [ ] Original implementation과 numerical 비교
- [ ] 실제 device에서 power와 latency 측정

## Multi-function Asset

- [ ] 서로 다른 cadence로 실행할 계산 식별
- [ ] Cache 가능한 encoder output 식별
- [ ] 각 function에 clean interface 정의
- [ ] Function별 compression policy 적용
- [ ] 각 module을 별도로 `torch.export`
- [ ] Entry point name 명확히 지정
- [ ] 하나의 converter에 여러 exported program 추가
- [ ] 하나의 asset에서 모든 function load 테스트
- [ ] Partial recomputation latency 측정

---

# ⚠️ 구현 시 주의할 점

## Compression은 균일하게 적용하지 않는다

모든 layer가 동일한 bit width를 견디지 않는다.

Parameter가 적어도 output quality에 민감한 module은 압축에서 제외하는 편이 더 효율적일 수 있다.

## Model size와 task quality를 함께 측정한다

Asset이 작아져도 실제 application output이 나빠지면 성공이 아니다.

Task-specific evaluation을 반드시 유지해야 한다.

## Device runtime result를 확인한다

Python reference와 converted graph가 유사해 보여도 실제 specialization과 hardware execution에서 차이가 발생할 수 있다.

Core AI Debugger의 device execution과 intermediate comparison을 활용한다.

## Custom Metal kernel은 마지막 수단에 가깝다

Core AI의 pre-packaged primitive와 optimized pattern으로 해결 가능한지 먼저 확인한다.

Custom kernel은 correctness, shape inference, thread configuration, performance validation 책임이 더 크다.

## Re-authoring은 conversion option이 아니다

Re-authoring은 source implementation 자체를 새로 설계하는 작업이다.

Module-level과 model-level test가 없으면 semantic regression을 발견하기 어렵다.

## Function split은 앱 workflow와 함께 설계한다

Entry point를 많이 만드는 것이 자동으로 빠른 것은 아니다.

어떤 input이 자주 바뀌고 어떤 intermediate를 재사용할 수 있는지를 기준으로 boundary를 정해야 한다.

---

# 🔁 API와 도구 정리

| 도구 / API | 역할 |
|---|---|
| `coreai-models` | Model example, reusable component, Swift package, agent skills |
| Core AI Skills | Coding assistant에 deployment best practice 제공 |
| `torch.export` | PyTorch model computational graph capture |
| `coreai-torch` | PyTorch exported program을 Core AI로 변환 |
| `TorchConverter` | Program과 custom kernel, multiple entry point 조합 |
| `.aimodel` | Apple silicon용 on-device model asset |
| `coreai-opt` | Config-driven compression과 quantization |
| `Quantizer` | Quantization prepare/finalize workflow |
| `KMeansPalettizer` | Lookup-table 기반 palettization |
| Core AI Debugger | Structure, runtime tensor, reference comparison |
| Save Intermediates API | PyTorch operation별 tensor reference 저장 |
| Sync Point | Specialized model과 PyTorch operation 비교 지점 |
| PSNR | 기본 tensor similarity metric |
| `TorchMetalKernel` | PyTorch reference와 custom MSL kernel 연결 |
| Metal 4 | Custom GPU operation 실행 |
| Multi-function Asset | 하나의 `.aimodel`에 여러 callable function 포함 |

---

# 핵심 메시지

Core AI의 Python workflow는 단순한 model conversion tool이 아니다.

먼저 PyTorch model을 `torch.export`하고 `TorchConverter`를 이용해 `.aimodel`로 만든 뒤, Python에서 Apple silicon inference까지 검증할 수 있다.

그 다음 `coreai-opt`로 model을 압축하되, 모든 layer에 동일한 scheme을 적용하지 않고 실제 task quality를 기준으로 선택적으로 최적화해야 한다.

Core AI Debugger는 specialized model과 PyTorch reference의 intermediate tensor를 sync point 단위로 비교해 quantization이나 conversion의 divergence가 어느 module에서 시작되는지 보여준다.

더 높은 성능이 필요하면 operation fusion과 custom Metal 4 kernel을 사용하고, iOS의 power·memory constraint가 강하다면 static shape, channels-first layout, convolutional pattern, multi-function interface를 적용해 model 자체를 재저작할 수 있다.

SAM3 사례의 최종 결과는 이 접근을 잘 보여준다.

- 3GB 이상의 baseline을 약 430MB로 압축
- Detector의 품질 민감도를 Debugger로 발견
- Detector를 compression에서 제외해 baseline 품질 회복
- Image, text, detect를 세 entry point로 분리
- Prompt만 바뀐 두 번째 inference를 76% 단축

즉 Core AI의 핵심 workflow는 **convert → measure → compress → inspect → selectively optimize → re-author → validate on device**다.

---

# 함께 보면 좋은 세션과 자료

- Meet Core AI
- Optimize custom machine learning operations with Metal tensors
- Explore distributed inference and training with MLX
- Explore numerical computing in Swift with MLX
- Run local agentic AI on the Mac using MLX
- Core AI PyTorch Extensions
- Core AI Python
- Core AI Optimization
- Inspecting, debugging, and profiling Core AI models
- Inspecting Core AI models with Core AI Debugger
