# WWDC26 Explore distributed inference and training with MLX 요약

- Session: 233
- Title: Explore distributed inference and training with MLX
- Source: https://developer.apple.com/videos/play/wwdc2026/233/
- Topic: MLX, MLX LM, JACCL, RDMA over Thunderbolt 5, Distributed Inference, Distributed Fine-tuning, Tensor Parallelism, Pipeline Parallelism, Data Parallelism
- Chapters: Introduction, Distributed communication, Setting up your cluster, Distributed inference and fine-tuning, Model parallelism strategies, Distributed fine-tuning, CLI/Python/Swift/C++ APIs, Next steps

---

## 한 줄 요약

MLX는 **macOS 26.2의 Thunderbolt 5 RDMA와 Apple의 오픈소스 collective communication library JACCL**을 이용해 여러 Mac을 하나의 로컬 AI 클러스터로 묶고, `mlx.launch`만으로 대형 LLM을 여러 기기에 shard해 추론하거나 data-parallel fine-tuning을 수행하며, 같은 기능을 CLI뿐 아니라 Python·Swift·C++ API에서도 사용할 수 있게 한다.

---

## 핵심 요약

이번 세션은 여러 대의 Apple silicon Mac을 하나의 분산 머신러닝 환경으로 구성하는 전체 stack을 설명한다.

```text
Physical Link
Thunderbolt 5
      ↓
Transport
RDMA over Thunderbolt
      ↓
Collective Communication
JACCL
      ↓
Machine Learning Framework
MLX
      ↓
LLM Layer
MLX LM
```

핵심 내용:

- **RDMA over Thunderbolt 5**
  - macOS 26.2부터 지원
  - 한 Mac의 memory에서 다른 Mac의 memory로 data를 직접 이동
  - CPU와 OS overhead를 크게 줄임
  - 분산 inference/training에 필요한 high-bandwidth, low-latency communication 제공

- **JACCL**
  - Apple이 만든 open-source collective communication library
  - RDMA over Thunderbolt를 사용
  - point-to-point와 group collective primitive 제공
  - ML이 아닌 일반 distributed workload에도 사용 가능

- **MLX**
  - Apple silicon용 open-source ML framework
  - JACCL을 distributed backend로 사용
  - cluster orchestration, model sharding, inference, training 지원

- **Topology**
  - Full mesh: 낮은 latency
  - Ring: 적은 port/cable, 여러 cable을 같은 neighbor에 묶어 bandwidth 증가 가능
  - JACCL은 operation과 message size에 따라 적절한 topology를 선택

- **Cluster setup**
  - 4대의 M3 Ultra를 Thunderbolt 5로 연결
  - RDMA 활성화 후 reboot
  - `mlx.distributed_config`로 hostfile 생성
  - `mlx.launch`가 SSH로 각 node에 프로그램 시작

- **Distributed inference**
  - Qwen 3.6 27B: 4대 M3 Ultra에서 single M3 Ultra 대비 거의 3배 token generation rate
  - Kimi 2.6: 1 trillion total parameters
  - 8-bit quantization 기준 weight만 약 1TB
  - 한 대의 M3 Ultra에는 들어가지 않지만 4대에 분산 가능

- **Parallelism**
  - Tensor parallelism: layer width 방향 분할, MLX LM 기본값, 속도 향상 가능, communication 빈도 높음
  - Pipeline parallelism: layer depth 방향 분할, capacity 확장에 유리, inference 자체를 빠르게 하지는 않음

- **Distributed fine-tuning**
  - Data parallelism
  - 모델을 모든 Mac에 복제
  - 각 Mac이 다른 batch를 처리하고 gradient average
  - Qwen 3.5 9B example:
    - single M3 Ultra: 약 180 tokens/s
    - 4-node cluster: 약 600 tokens/s
    - 3배 이상 speedup

- **API**
  - CLI
  - Python
  - Swift
  - C++
  - JACCL standalone C++ API

---

# 🧠 왜 여러 Mac에 분산해야 하는가

Local LLM은 계속 커지고 있다. 모델이 커질수록 memory, compute, bandwidth가 한 기기의 한계에 도달한다.

또 workload도 커진다.

- Longer context
- Harder reasoning
- More complex workflows
- Local AI agents
- Fine-tuning

여러 Mac을 묶으면 두 가지를 얻을 수 있다.

```text
Single Mac 한계
      ↓
여러 Mac에 분산
      ↓
1. 더 큰 Model 실행
2. 같은 Model을 더 빠르게 실행
```

---

# 🧱 Distributed ML의 전체 Stack

## Physical / Transport

Mac 사이에 실제로 byte를 전달하는 계층이다.

```text
Thunderbolt 5
+
RDMA
```

## Collective Communication

여러 node에서 data를 보내고 결과를 결합하는 고수준 primitive가 필요하다.

```text
JACCL
```

## ML Framework

Model과 tensor를 node에 분배하고 inference/training을 수행한다.

```text
MLX
+
MLX LM
```

---

# ⚡ RDMA over Thunderbolt 5

macOS 26.2부터 **Remote Direct Memory Access, RDMA**가 Thunderbolt 5에서 지원된다.

```text
Mac A Memory
      ↓
직접 전송
      ↓
Mac B Memory
```

RDMA는 CPU와 운영체제 overhead를 줄여 high-bandwidth, low-latency communication을 제공한다.

특히 tensor parallelism처럼 매 layer와 token마다 machine 간 synchronization이 필요한 workload에서 latency가 중요하다.

---

# 🔗 JACCL

RDMA 자체는 raw data movement만 제공한다. Distributed program에는 send, receive, broadcast, all-reduce 같은 collective operation이 필요하다.

Apple의 **JACCL**이 이 역할을 담당한다.

```text
Distributed Program
        ↓
Collective Operation
        ↓
JACCL
        ↓
RDMA over Thunderbolt
```

JACCL은 open source이며 MLX 없이 독립적으로 build할 수 있으므로 non-ML distributed application에도 사용할 수 있다.

---

# 🧠 MLX

MLX는 Apple이 만든 Apple silicon용 open-source machine learning framework다.

Distributed mode에서는 JACCL을 communication backend로 사용한다.

주요 역할:

- Distributed group initialization
- Model sharding
- Distributed tensor operation
- Inference
- Training
- Fine-tuning
- Cluster job orchestration

---

# 🖥️ 세션의 Cluster 구성

Apple은 4대의 M3 Ultra를 사용한다.

```text
M3 Ultra 0
M3 Ultra 1
M3 Ultra 2
M3 Ultra 3
```

이 Mac들을 Thunderbolt 5 cable로 연결해 하나의 cluster로 만든다.

---

# 📡 Communication Time의 두 요소

## Latency

고정 비용이다. Data가 작더라도 communication operation마다 발생한다.

```text
작은 Message
→ Latency가 지배적
```

## Transfer Time

실제 data를 link로 보내는 시간이다. Message size가 클수록 증가하고 bandwidth에 의존한다.

```text
큰 Message
→ Bandwidth / Transfer Time이 지배적
```

이 차이가 topology 선택에 직접 영향을 준다.

---

# 🕸️ Mesh Topology

Full mesh에서는 모든 machine이 서로 직접 연결된다.

```text
A ───── B
|\     /|
| \   / |
|  \ /  |
|  / \  |
| /   \ |
|/     \|
C ───── D
```

장점:
- 모든 node pair가 direct hop
- Group communication latency 최소
- Tensor parallelism에 적합

단점:
- Node가 늘수록 cable과 port 요구량 증가
- Scale-out이 어려움

---

# 🔄 Ring Topology

Ring에서는 각 node가 두 neighbor와만 연결된다.

```text
A ─ B
|   |
D ─ C
```

장점:
- Node당 connection 수가 적음
- 많은 node로 확장하기 쉬움
- 남는 Thunderbolt port를 같은 neighbor에 2~3개 cable로 연결해 link bandwidth를 높일 수 있음

단점:
- Non-adjacent node communication은 intermediate machine을 지나야 하므로 latency 증가

---

# 🧠 JACCL의 Topology 선택

Mac이 물리적으로 mesh로 연결되어 있으면 JACCL은 communication을 mesh 또는 ring으로 route할 수 있다.

Apple은 message size와 operation에 따라 적합한 topology를 자동 선택한다고 설명한다.

```text
Latency 중요
→ Mesh

Bandwidth 중요
→ Ring
```

세션에서는 이 유연성을 위해 4대 M3 Ultra를 full mesh로 연결한다.

---

# ⚙️ RDMA 활성화

각 Mac에서:

```text
System Settings
      ↓
Search "RDMA"
      ↓
Enable RDMA over Thunderbolt
      ↓
Reboot
```

모든 machine에서 활성화해야 한다.

---

# 🚀 Distributed Program 실행

Distributed program 자체를 시작할 때는 local network의 SSH를 사용할 수 있다.

```text
Control MacBook
      ↓ SSH
M3 Ultra 0
M3 Ultra 1
M3 Ultra 2
M3 Ultra 3
```

프로그램이 시작된 뒤 실제 ML communication은 Thunderbolt RDMA link를 사용한다.

---

# 🛠️ `mlx.launch`

MLX는 distributed process launch helper를 제공한다.

```text
mlx.launch
```

역할:

1. Hostfile 읽기
2. 각 node hostname 확인
3. SSH 접속
4. 각 node에 executable 실행
5. Distributed job 시작

---

# 📄 Hostfile 구조

세션의 4-node hostfile:

```json
[
  {
    "ssh": "m3-ultra-0",
    "ips": ["192.168.1.10"],
    "rdma": [null, "rdma_en5", "rdma_en4", "rdma_en3"]
  },
  {
    "ssh": "m3-ultra-1",
    "ips": ["192.168.1.11"],
    "rdma": ["rdma_en5", null, "rdma_en4", "rdma_en3"]
  },
  {
    "ssh": "m3-ultra-2",
    "ips": ["192.168.1.12"],
    "rdma": ["rdma_en5", "rdma_en4", null, "rdma_en3"]
  },
  {
    "ssh": "m3-ultra-3",
    "ips": ["192.168.1.13"],
    "rdma": ["rdma_en5", "rdma_en4", "rdma_en3", null]
  }
]
```

| Field | 의미 |
|---|---|
| `ssh` | `mlx.launch`가 node에 접속할 hostname |
| `ips` | JACCL initial coordination에 사용하는 local IP |
| `rdma` | Thunderbolt peer별 RDMA device name |

---

# 🤖 `mlx.distributed_config`

Hostfile을 직접 작성하지 않아도 된다.

```bash
mlx.distributed_config \
    --hosts m3-ultra-0,m3-ultra-1,m3-ultra-2,m3-ultra-3 \
    --output "m3-ultra-jaccl.json" \
    --env MLX_METAL_FAST_SYNCH=1 \
    --auto-setup \
    --backend jaccl
```

---

# ⚡ `MLX_METAL_FAST_SYNCH=1`

세션은 distributed workload에서 이 environment variable을 중요하게 설명한다.

```text
MLX_METAL_FAST_SYNCH=1
```

이유:

- Compute는 GPU에서 실행
- Communication은 CPU에서 실행
- GPU → CPU synchronization이 자주 필요

Fast synchronization은 distributed task에서 이 비용을 줄이는 데 중요하다.

---

# 🔧 `--auto-setup`

`--auto-setup`을 사용하면 helper가 자동으로 다음 작업을 한다.

1. 모든 host SSH reachability 확인
2. Thunderbolt port probe
3. 물리 topology map 생성
4. Thunderbolt Bridge 비활성화
5. 각 Thunderbolt link를 RDMA용으로 구성
6. JSON hostfile 생성

`--auto-setup`을 사용하지 않으면 필요한 configuration command를 출력하므로 검토 후 직접 실행할 수 있다.

---

# 🔀 Backend 선택

Mesh:

```bash
--backend jaccl
```

Ring:

```bash
--backend jaccl-ring
```

---

# 💬 MLX LM

Distributed LLM workload의 가장 쉬운 진입점은 **MLX LM**이다.

MLX 위에 구축된 open-source Python package로 CLI와 Python API를 제공한다.

---

# 🖥️ Single-device Inference

Qwen 3.6 27B example:

```bash
mlx_lm.chat \
    --model "Qwen/Qwen3.6-27B" \
    --max-tokens 2048
```

---

# 🌐 Distributed Inference

동일 command를 `mlx.launch`로 감싼다.

```bash
mlx.launch \
    --hostfile "m3-ultra-jaccl.json" -- \
    /remote/path/to/mlx_lm.chat \
    --model "Qwen/Qwen3.6-27B" \
    --max-tokens 2048
```

MLX LM이 자동으로 model을 shard하고 distributed inference를 coordination한다.

---

# ⚠️ 각 Node에 Software가 있어야 한다

`mlx.launch`는 dependency를 자동 설치하지 않는다.

각 Mac에 필요한 항목:

- MLX
- MLX LM
- Python environment
- Remote executable

Executable은 각 machine에서 접근 가능한 path에 있어야 한다.

---

# 📈 Qwen 3.6 27B 성능

Apple demo prompt:

```text
Implement a transformer model in MLX.
```

비교:

```text
Single M3 Ultra
vs
4 × M3 Ultra Cluster
```

결과:

> Cluster는 Qwen 3.6에서 single machine 대비 **거의 3배의 token generation rate**를 보였다.

정확한 speedup은 model size와 architecture에 따라 달라진다.

---

# 🧠 더 큰 Model을 돌리는 이유

Distributed inference는 속도 향상만을 위한 것이 아니다.

어떤 model은 single-machine memory에 아예 들어가지 않는다.

세션 예:

```text
Kimi 2.6
Total parameters: 1 trillion
8-bit quantized weights: 약 1TB
```

한 대의 M3 Ultra에는 들어가지 않지만 4대에 분산하면 실행할 수 있다.

---

# 🧩 Model Parallelism

Model 자체를 여러 machine에 나누는 대표 방법:

```text
Model Parallelism
├─ Pipeline Parallelism
└─ Tensor Parallelism
```

---

# 🧱 Pipeline Parallelism

Model을 depth 방향, 즉 layer group으로 나눈다.

```text
Mac 0
Layers 0–7
    ↓
Mac 1
Layers 8–15
    ↓
Mac 2
Layers 16–23
    ↓
Mac 3
Layers 24–31
```

각 token은 layer group을 순차적으로 통과한다.

장점:
- Communication은 layer group 경계에서만 발생
- 매우 큰 model을 memory에 나누어 넣기 쉬움

한계:
- Token이 모든 layer group을 순차 통과하므로 inference 자체를 빠르게 만들지는 않음

---

# ↔️ Tensor Parallelism

Model을 width 방향으로 나눈다.

각 machine은 모든 layer의 일부를 보유한다.

```text
Layer N
Mac 0: Part 0
Mac 1: Part 1
Mac 2: Part 2
Mac 3: Part 3
```

모든 Mac이 같은 token을 동시에 처리한다.

장점:
- Layer 내부 computation 병렬화
- Inference throughput 향상 가능
- MLX LM 기본 sharding strategy

비용:
- 매 layer와 token마다 communication 발생
- Low-latency interconnect가 중요

---

# 🔀 Pipeline Mode 선택

Tensor parallelism은 default다.

```bash
mlx.launch --hostfile "m3-ultra-jaccl.json" -- \
    /remote/path/to/mlx_lm.chat \
    --model "moonshotai/Kimi-K2.6" \
    --max-tokens 2048
```

Pipeline parallelism:

```bash
mlx.launch --hostfile "m3-ultra-jaccl.json" -- \
    /remote/path/to/mlx_lm.chat \
    --model "moonshotai/Kimi-K2.6" \
    --max-tokens 2048 \
    --pipeline
```

모든 model이 pipeline parallelism을 지원하는 것은 아니다.

---

# 🧠 1T Parameter Model Demo

Apple은 4-node cluster에서 Kimi 2.6을 tensor parallelism으로 실행한다.

```text
mlx.launch
      ↓
각 Node 연결
      ↓
MLX LM model load
      ↓
Weight shard
      ↓
Chat 시작
```

Prompt:

```text
Implement machine learning architecture for GPT in Python with MLX
```

1-trillion-parameter model이 로컬 4-Mac cluster에서 실행된다.

---

# 🔐 Local Distributed AI의 의미

Inference와 fine-tuning을 사용자가 소유한 hardware에서 수행한다.

장점:

- Fast
- Efficient
- Fully private
- Data가 cloud로 나갈 필요 없음
- Hardware you own

---

# 🎓 Distributed Fine-tuning

Single machine training:

```text
Training Dataset
      ↓
Batch
      ↓
Forward / Backward
      ↓
Gradient
      ↓
Weight Update
      ↓
Repeat
```

여러 machine에서는 data parallelism을 사용한다.

---

# 📊 Data Parallelism

Model을 각 node에 복제한다.

```text
Mac 0: Full Model + Batch A
Mac 1: Full Model + Batch B
Mac 2: Full Model + Batch C
Mac 3: Full Model + Batch D
```

각 machine이 local gradient를 계산한 뒤 gradient를 평균한다.

```text
Gradient A
Gradient B
Gradient C
Gradient D
      ↓
Distributed Average
      ↓
Same Weight Update on All Macs
```

N개의 machine을 사용하면 이론적으로 한 step에서 최대 N배의 data를 처리할 수 있다.

---

# 🛠️ Distributed LoRA Fine-tuning

Single-device:

```bash
mlx_lm.lora \
    --model "Qwen/Qwen3.5-9B" \
    --data "mlx-community/wikisql" \
    --train \
    --batch-size 4
```

4-node cluster:

```bash
mlx.launch --hostfile "hostfile.json" -- \
    /remote/path/to/mlx_lm.lora \
    --model "Qwen/Qwen3.5-9B" \
    --data "mlx-community/wikisql" \
    --train \
    --batch-size 16
```

4대이므로 global batch size를 16으로 늘려 각 Mac이 4 sample씩 처리한다.

---

# 📈 Fine-tuning 성능

Qwen 3.5 9B demo:

```text
Single M3 Ultra
약 180 tokens/s
```

```text
4-node Cluster
약 600 tokens/s
```

결과:

> **3배 이상의 fine-tuning speedup**

---

# 🐍 Python API

Distributed backend 초기화:

```python
import mlx.core as mx
from mlx_lm import stream_generate
from mlx_lm.utils import sharded_load

group = mx.distributed.init(
    strict=True,
    backend="jaccl"
)
```

Parallelism group 정의:

```python
tensor_group = group
pipeline_group = None
```

Model shard:

```python
model, tokenizer = sharded_load(
    "moonshotai/Kimi-K2.6",
    pipeline_group,
    tensor_group
)
```

이후 generation은 single-device code와 거의 동일하다.

```python
for response in stream_generate(
    model,
    tokenizer,
    prompt,
    max_tokens=1024
):
    if group.rank() == 0:
        print(response.text, end="", flush=True)
```

---

# 🧱 Low-level Layer Sharding

Individual layer도 직접 shard할 수 있다.

```python
import mlx.core as mx
import mlx.nn as nn

group = mx.distributed.init(
    strict=True,
    backend="jaccl"
)

layer = nn.Linear(1024, 1024)

sharded_layer = nn.layers.distributed.shard_linear(
    layer,
    strategy="all-to-sharded",
    group=group
)

data = mx.random.normal((1, 1, 1024))
output = sharded_layer(data)
mx.eval(output)
```

Custom architecture와 parallelism을 만들 때 사용할 수 있다.

---

# ➕ All-reduce / All-sum

## Python

```python
import mlx.core as mx

world = mx.distributed.init(
    strict=True,
    backend="jaccl"
)

data = mx.full(
    (4,),
    float(world.rank()),
    dtype=mx.float32
)

result = mx.distributed.all_sum(
    data,
    group=world
)

mx.eval(result)
```

---

# 🍎 Swift API

Swift에서도 distributed collective operation을 사용할 수 있다.

```swift
let group = try DistributedGroup(strict: .ring)

let data = rank == 0
    ? MLXArray(converting: [1.0, 2.0, 3.0])
    : MLXArray(converting: [5.0, 6.0, 7.0])

let result = try group.allSum(data)
```

즉 distributed ML workflow를 Swift 앱에 직접 embed할 수 있다.

---

# 💻 C++ API

```cpp
namespace mx = mlx::core;

auto world = mx::distributed::init(
    true,
    "jaccl"
);

mx::array data = mx::full(
    {4},
    static_cast<float>(world.rank()),
    mx::float32
);

mx::array result = mx::distributed::all_sum(
    data,
    world
);

mx::eval(result);
```

---

# 🔌 JACCL Standalone API

JACCL은 MLX 없이도 사용할 수 있다.

```cpp
#include <jaccl/jaccl.h>
#include <iostream>

int main() {
    auto group = jaccl::init();

    float data[10] = {
        1.0f, 2.0f, 3.0f, 4.0f, 5.0f,
        6.0f, 7.0f, 8.0f, 9.0f, 10.0f
    };

    float output[10];

    group->all_sum(
        data,
        output,
        sizeof(data),
        jaccl::Float32
    );

    return 0;
}
```

Scientific computing이나 non-ML distributed workload에도 활용할 수 있다.

---

# 🧭 API 계층 선택

| 계층 | 사용 목적 |
|---|---|
| MLX LM CLI | 가장 빠르게 distributed LLM 실행 |
| MLX LM Python | LLM workflow를 Python에서 제어 |
| MLX Python | Layer/tensor 단위 sharding과 custom parallelism |
| MLX Swift | Apple platform 앱에 distributed ML embed |
| MLX C++ | C++에서 distributed tensor operation |
| JACCL C++ | MLX 없이 collective communication 직접 사용 |

---

# 🧩 Tensor vs Pipeline Parallelism

| 항목 | Tensor Parallelism | Pipeline Parallelism |
|---|---|---|
| 분할 방향 | Layer width | Model depth |
| 각 Node | 모든 layer의 일부 | 특정 layer group |
| Token 처리 | 모든 node 동시 | node를 순차 통과 |
| Inference speedup | 가능 | 기본적으로 없음 |
| Communication | 매우 빈번 | Layer group 경계 중심 |
| Latency sensitivity | 높음 | 상대적으로 낮음 |
| Mesh 중요도 | 높음 | 상대적으로 낮음 |
| 주요 목적 | Speed + Capacity | Capacity |
| MLX LM default | Yes | No |
| 활성화 | 기본 | `--pipeline` |

---

# 🧩 Mesh vs Ring

| 항목 | Mesh | Ring |
|---|---|---|
| Direct connection | 모든 node pair | Neighbor만 |
| Latency | 낮음 | non-neighbor에서 높음 |
| Cable/port 요구 | 높음 | 낮음 |
| Scale-out | 어려움 | 쉬움 |
| Multiple cable bandwidth | 제한적 | Neighbor link에 활용 가능 |
| Tensor parallelism | 매우 적합 | workload에 따라 불리 |
| Large transfer | JACCL이 ring routing 활용 가능 | 유리할 수 있음 |

---

# 🧩 Single Mac vs Cluster

| 항목 | Single Mac | Multi-Mac Cluster |
|---|---|---|
| Setup | 간단 | RDMA/topology/SSH 필요 |
| Memory | 한 machine 한계 | 여러 machine에 model 분산 |
| Model size | 제한 | Trillion-scale 가능 |
| Inference throughput | baseline | model에 따라 향상 |
| Fine-tuning throughput | baseline | data parallel speedup |
| Privacy | Local | Local |
| Cloud dependency | 없음 | 없음 |
| Communication overhead | 없음 | 있음 |

---

# 📋 체크리스트

## Hardware
- [ ] Thunderbolt 5 지원 Mac 확인
- [ ] 모든 node의 Thunderbolt port 수 확인
- [ ] Mesh 또는 ring topology 선택
- [ ] Tensor parallelism이 중요하면 direct-hop latency 고려
- [ ] Ring에서 multiple cable per neighbor 활용 여부 검토

## macOS / RDMA
- [ ] macOS 26.2 이상 확인
- [ ] 모든 Mac에서 RDMA over Thunderbolt 활성화
- [ ] RDMA 활성화 후 reboot
- [ ] Thunderbolt Bridge와 RDMA setup 확인
- [ ] 각 RDMA device name 확인

## SSH / Network
- [ ] Control machine에서 모든 node SSH 가능
- [ ] Hostname resolution 확인
- [ ] Authentication 구성
- [ ] 각 node local IP 확인
- [ ] SSH launch와 Thunderbolt ML communication 역할 구분

## Software
- [ ] 모든 node에 MLX 설치
- [ ] 모든 node에 MLX LM 설치
- [ ] Executable path 접근 가능
- [ ] Python environment alignment
- [ ] Library version alignment

## Hostfile
- [ ] `ssh` hostname 확인
- [ ] `ips` coordination IP 확인
- [ ] `rdma` peer mapping 확인
- [ ] `mlx.distributed_config` 우선 사용 검토
- [ ] 환경별 hostfile 관리

## `mlx.distributed_config`
- [ ] 모든 host 지정
- [ ] Output JSON path 지정
- [ ] `MLX_METAL_FAST_SYNCH=1` 설정
- [ ] 필요 시 `--auto-setup`
- [ ] Mesh는 `--backend jaccl`
- [ ] Ring은 `--backend jaccl-ring`

## Distributed Inference
- [ ] Single-device baseline 측정
- [ ] 동일 model/parameter로 cluster 비교
- [ ] `mlx.launch --hostfile` 사용
- [ ] Remote executable path 검증
- [ ] Tensor parallelism 기본값 확인
- [ ] Pipeline 필요 시 `--pipeline`
- [ ] Model의 pipeline support 확인
- [ ] Token generation rate 측정

## Large Model Capacity
- [ ] Quantized weight size 계산
- [ ] 전체 cluster memory budget 계산
- [ ] KV cache memory 고려
- [ ] Context length에 따른 memory 증가 고려
- [ ] Model shard distribution 확인

## Fine-tuning
- [ ] Model을 각 node에 replicate할 memory 확인
- [ ] Data parallelism 적용
- [ ] Per-device batch size 유지
- [ ] Device 수에 따라 global batch size 조정
- [ ] Gradient synchronization overhead 측정
- [ ] Dataset이 모든 node에서 accessible한지 확인

## Python / Swift / C++
- [ ] `mx.distributed.init`로 backend 초기화
- [ ] `sharded_load` 사용 검토
- [ ] Custom layer는 `shard_linear` 검토
- [ ] Swift `DistributedGroup` 테스트
- [ ] `allSum` 등 collective operation 검증
- [ ] JACCL standalone이 필요한 non-ML workload 검토

---

# ⚠️ 구현 시 주의할 점

## 여러 Mac의 Memory가 하나로 자동 합쳐지는 것은 아니다

각 Mac에는 독립 memory가 있고 MLX가 model weight와 computation을 shard한다.

## Tensor Parallelism은 Communication 비용이 크다

모든 layer와 token마다 coordination이 발생할 수 있어 low-latency RDMA와 mesh topology가 중요하다.

## Pipeline Parallelism의 핵심은 Capacity

Pipeline parallelism은 model을 depth로 분할해 memory 문제를 해결하지만 token이 layer group을 순차 통과하기 때문에 inference를 자동으로 빠르게 하지는 않는다.

## Fine-tuning의 Batch Size는 Device 수를 반영한다

세션에서는 4-node cluster에서 single-device batch 4를 global batch 16으로 늘려 각 device가 같은 수의 sample을 처리하도록 한다.

## `mlx.launch`는 Remote Environment를 설치하지 않는다

필요한 library와 executable은 각 Mac에 준비되어 있어야 한다.

## 실제 Speedup은 Model마다 다르다

Qwen 3.6의 거의 3배 inference와 Qwen 3.5의 3배 이상 fine-tuning은 세션 demo 결과이며 모든 model이 같은 비율로 scale되지는 않는다.

---

# 🔁 전체 구축 흐름

```text
Mac Hardware 준비
      ↓
Thunderbolt 5 Topology 구성
      ↓
RDMA 활성화
      ↓
SSH Connectivity 확보
      ↓
mlx.distributed_config
      ↓
Hostfile 생성
      ↓
mlx.launch
      ↓
MLX / MLX LM Distributed Job
      ↓
Tensor / Pipeline / Data Parallelism 선택
      ↓
CLI → Python / Swift / C++로 확장
```

---

# 🎯 세션의 핵심 수치

| 항목 | 세션 결과 |
|---|---|
| Cluster | 4 × M3 Ultra |
| Interconnect | Thunderbolt 5 |
| Transport | RDMA |
| Collective backend | JACCL |
| Qwen 3.6 model | 27B parameters |
| Qwen 3.6 inference | Cluster가 single M3 Ultra 대비 거의 3× token rate |
| Kimi 2.6 | 1 trillion total parameters |
| Kimi 2.6 8-bit weight | 약 1TB |
| Qwen 3.5 fine-tune model | 9B parameters |
| Single fine-tune | 약 180 tokens/s |
| 4-node fine-tune | 약 600 tokens/s |
| Fine-tune speedup | 3× 이상 |

---

# 핵심 메시지

Apple의 distributed ML stack은 단순히 여러 Mac에서 Python process를 동시에 실행하는 수준이 아니다.

Thunderbolt 5 위의 RDMA가 low-latency memory transfer를 제공하고, JACCL이 collective communication을 추상화하며, MLX가 그 위에서 model과 tensor를 shard한다.

```text
Thunderbolt 5
      ↓
RDMA
      ↓
JACCL
      ↓
MLX
      ↓
MLX LM
```

한 대의 Mac에서 사용하던 MLX LM command를 `mlx.launch`로 감싸는 것만으로 distributed inference와 fine-tuning으로 확장할 수 있다.

Tensor parallelism은 모든 machine이 같은 token의 layer computation을 동시에 처리해 inference를 빠르게 만들 수 있지만 communication 빈도가 높다.

Pipeline parallelism은 layer를 machine별로 나눠 큰 model을 memory에 넣기 쉽게 만들지만 token이 layer group을 순차적으로 통과하므로 inference 자체를 빠르게 하지는 않는다.

Training에서는 model을 각 node에 복제하고 다른 batch를 처리한 뒤 gradient를 평균하는 data parallelism으로 throughput을 높인다.

세션의 4대 M3 Ultra cluster에서는 Qwen 3.6 27B inference가 single M3 Ultra 대비 거의 3배 빨라졌고, Qwen 3.5 9B fine-tuning은 약 180 tokens/s에서 약 600 tokens/s로 3배 이상 향상됐다.

또 weight만 약 1TB인 1-trillion-parameter Kimi 2.6을 4대 Mac에 분산해 로컬에서 실행하는 demo를 통해 **distributed ML의 가장 큰 장점이 속도뿐 아니라 single-device memory limit 자체를 넘어설 수 있다는 점**을 보여준다.

이 기능은 CLI에 한정되지 않는다. Python에서 model sharding을 직접 조절하고, Swift 앱에서 `DistributedGroup`과 collective operation을 사용할 수 있으며, C++ 또는 standalone JACCL을 통해 더 낮은 계층까지 접근할 수 있다.

결국 MLX의 방향은 **몇 대의 Apple silicon Mac을 desk-side local cluster로 묶어 cloud에 data를 보내지 않고도 대형 LLM inference·agent·fine-tuning·custom distributed workload를 실행하는 것**이다.

---

# 함께 보면 좋은 세션과 자료

- Run local agentic AI on the Mac using MLX — WWDC26
- Explore numerical computing in Swift with MLX — WWDC26
- Explore large language models on Apple silicon with MLX — WWDC25
- Get started with MLX for Apple silicon — WWDC25
- MLX Framework
- MLX LM
- MLX Swift
- MLX Swift LM
- JACCL
