# WWDC26 — Optimize custom machine learning operations with Metal tensors

- **Session:** 330
- **Title:** Optimize custom machine learning operations with Metal tensors
- **Source:** https://developer.apple.com/videos/play/wwdc2026/330/
- **Speaker:** Shiyao, GPU Software Engineer
- **Basis:** Apple Developer 공식 전체 transcript 및 Code 섹션
- **Topics:** Metal Tensor API, Metal Performance Primitives (MPP), TensorOps, quantization, multi-plane tensors, FlashAttention, Core AI

---

## 🎯 한 줄 요약

Apple의 **Metal Tensor API와 TensorOps**를 사용하면 M5/A19 GPU의 Neural Accelerator를 포함한 Apple Silicon의 하드웨어 가속을 직접 활용해 커스텀 ML 연산을 만들 수 있다. 이 세션은 **양자화 tensor와 scale plane 구성 → quantized matrix multiplication → cooperative tensor 기반 FlashAttention → Core AI 모델에 custom Metal kernel 삽입**까지의 전체 흐름을 보여준다.

---

## 🧭 세션 구성

| 시간 | 내용 |
|---|---|
| 0:00 | Introduction |
| 0:21 | Apple's ML software stack |
| 2:25 | Managing quantized data |
| 4:23 | Multi-plane tensors |
| 5:17 | Quantized matrix multiplication |
| 9:31 | Building advanced ops |
| 13:35 | Integrating custom ops into Core AI |
| 15:25 | Next steps |

---

# 🏗️ Apple ML software stack와 Metal의 위치

Apple 플랫폼의 ML stack은 고수준에서 저수준으로 대략 다음과 같이 이어진다.

- **Core AI / MLX**: 모델 배포와 실행을 쉽게 만드는 고수준 프레임워크
- **Metal Performance Shaders**: 최적화된 Metal kernel 제공
- **Metal Performance Primitives (MPP)**
- **TensorOps**: Metal Shading Language 수준의 tensor operation API
- **Metal GPU execution**

TensorOps는 matrix multiplication과 convolution 같은 tensor 연산을 GPU에서 가속한다. 중요한 점은 개발자가 GPU 세대별 차이를 직접 분기하지 않아도 TensorOps가 사용 가능한 하드웨어 가속을 자동 활용한다는 점이다.

특히 **M5 GPU의 Neural Accelerator**는 각 shader core 안에 배치된 새로운 하드웨어 블록으로, LLM prefill처럼 dense하고 compute-bound한 작업을 가속한다.

### Metal 수준까지 내려가야 하는 경우

Apple이 제시한 대표적인 이유는 다음과 같다.

- 최신 연구 논문에 등장한 연산을 빠르게 구현해야 할 때
- Core AI 같은 상위 프레임워크에 custom op를 삽입해야 할 때
- MLX, llama.cpp 같은 ML framework에 기여할 때
- Metal 기반 앱에서 직접 ML kernel을 작성해야 할 때

즉, TensorOps는 범용 모델 사용자보다는 **프레임워크/커널/연산 구현자**에게 특히 중요한 계층이다.

---

# 🧮 Quantized data를 다루는 이유

현대 ML 모델은 계속 커지고 있으며, inference는 흔히 **memory-bandwidth bound**가 된다. 따라서 weight를 압축하면 두 가지 이점이 있다.

1. 더 큰 모델을 같은 메모리에 넣을 수 있다.
2. 메모리 bandwidth 사용량을 줄일 수 있다.

가장 일반적인 방식이 **quantization**이다.

예를 들어 16-bit half precision weight를 4-bit 값으로 줄이고, 원래 범위를 복원하기 위한 **scale factor**를 함께 저장한다.

TensorOps는 기존 16-bit/32-bit floating point 외에도 quantized type을 직접 지원한다.

### 지원 범위

**iOS/macOS 26 업데이트**
- 4-bit integer
- 8-bit integer

**iOS/macOS 27 확장**
- 4-bit floating point
- 8-bit floating point
- 2-bit integer

따라서 앱에서 생성한 quantized tensor를 TensorOps에 그대로 전달하면 사용 가능한 하드웨어 가속을 자동 활용할 수 있다.

---

# 🧱 Quantized `MTLTensor` 생성

Quantized tensor도 일반 tensor와 동일하게 descriptor를 만든 뒤 `dataType`만 quantized 형식으로 지정한다.

공식 Code 섹션 예제:

```objc
// Creating a tensor with a quantized data type from device

#define RANK 2

MTLTensorDescriptor *tensorDesc = [MTLTensorDescriptor new];

tensorDesc.dataType = MTLTensorDataTypeMetalFloat8E4M3;
tensorDesc.usage = MTLTensorUsageCompute;

NSInteger dimensions[RANK] = {NumCols, NumRows};
tensorDesc.dimensions = [[MTLTensorExtents alloc] initWithRank:RANK values:dimensions];

NSError *err = nil;
id <MTLTensor> tensor = [device newTensorWithDescriptor:tensorDesc error:&err];
```

핵심은 `MTLTensorDataTypeMetalFloat8E4M3`처럼 quantized data type을 descriptor에 직접 지정한다는 점이다.

---

# 🧩 Multi-plane tensors: data와 scale을 하나의 tensor로

양자화된 값만 저장해서는 원래 범위를 복원할 수 없기 때문에 scale factor가 필요하다.

**iOS/macOS 27**부터 하나의 `MTLTensor`가 다음을 함께 표현할 수 있다.

- quantized data plane
- scale factor plane
- 관련 metadata

Scale plane은 **FP8 E8M0 block-wise scale factor format**을 지원한다. Scale plane의 한 원소가 data plane의 여러 원소 블록에 적용된다.

### 공식 예제

```objc
// Creating a tensor with a scales auxiliary plane from device

#define RANK 2

MTLTensorAuxiliaryPlaneDescriptor *planeDesc = [MTLTensorAuxiliaryPlaneDescriptor new];
planeDesc.dataType = MTLTensorDataTypeMetalFloat8UE8M0;

NSInteger blockFactors[RANK] = {32, 1};
planeDesc.blockFactors = [[MTLTensorExtents alloc] initWithRank:RANK values:blockFactors];

MTLTensorAuxiliaryPlaneDescriptorMap *auxiliaryPlanes =
    [MTLTensorAuxiliaryPlaneDescriptorMap new];
[auxiliaryPlanes setDescriptor:planeDesc forPlane:MTLTensorPlaneTypeScales];

MTLTensorDescriptor *tensorDesc = [MTLTensorDescriptor new];
tensorDesc.dataType = MTLTensorDataTypeMetalFloat8E4M3;
tensorDesc.usage = MTLTensorUsageCompute;

NSInteger dimensions[RANK] = {NumCols, NumRows};
tensorDesc.dimensions = [[MTLTensorExtents alloc] initWithRank:RANK values:dimensions];
tensorDesc.auxiliaryPlanes = auxiliaryPlanes;

NSError *err = nil;
id <MTLTensor> tensor = [device newTensorWithDescriptor:tensorDesc error:&err];
```

`blockFactors = {32, 1}`이면 data plane의 32개 원소 단위로 scale 하나를 공유하는 구조다.

이 방식의 장점은 quantized data와 scale을 서로 별도 객체로 관리하지 않아도 된다는 것이다.

---

# 🧬 MSL에서 MXFP8 tensor type 선언

Metal shader에서는 scale plane과 tensor format을 type alias로 정의할 수 있다.

```metal
#include <metal_tensor>
using namespace metal;

using scales_plane = tensor_blockwise<tensor_plane_scales,
                                      device metal_fp8_ue8m0_format,
                                      32, 1>;

using mxfp8_tensor = tensor<device metal_fp8_e4m3_format,
                            dextents<int, 2>,
                            tensor_handle,
                            scales_plane>;

kernel void matmul(mxfp8_tensor matrixA [[buffer(0)]],
                   mxfp8_tensor matrixB [[buffer(1)]],
                   tensor<device half, dextents<int, 2>> matrixC [[buffer(2)]])
{
    // ...
}
```

여기서는:

- 실제 data는 `metal_fp8_e4m3_format`
- scale은 `metal_fp8_ue8m0_format`
- block 크기는 `32 × 1`
- `tensor_handle`로 host에서 생성한 tensor를 shader에 binding

하는 형태다.

---

# 📦 Shader stack의 inline tensor

Host에서 `MTLTensor`를 만들지 않고 shader 내부에서 임시 tensor를 구성할 수도 있다.

핵심 변경은 `tensor_handle` 대신 **`tensor_inline`**을 사용하는 것이다.

```metal
using scales_plane = tensor_blockwise<tensor_plane_scales,
                                      device metal_fp8_ue8m0_format,
                                      32, 1>;

using mxfp8_tensor_inline = tensor<device metal_fp8_e4m3_format,
                                   dextents<int, 2>,
                                   tensor_inline,
                                   scales_plane>;

mxfp8_tensor_inline matrixA(dataBufferA,
                             dextents<int, 2>(K, M),
                             array<int, 2>({ 1, K }),
                             scales_plane(scalesBufferA));
```

Buffer pointer와 metadata로 shader stack에 tensor view를 구성한다.

---

# ⚡ Quantized matrix multiplication

TensorOps의 고성능 matmul 기본 전략은 input matrix를 tile로 나누고 여러 threadgroup이 병렬로 처리하는 것이다.

### Tile slicing

```metal
auto tA = matrixA.slice(0, tgid.y * TILEM);
auto tB = matrixB.slice(tgid.x * TILEN, 0);
auto tC = matrixC.slice(tgid.x * TILEN, tgid.y * TILEM);
```

Multi-plane tensor는 data plane뿐 아니라 scale plane도 block size 규칙에 맞춰 함께 slice된다.

### `matmul2d_descriptor`

```metal
constexpr auto descriptor = matmul2d_descriptor(TILEM,
                                                TILEN,
                                                dynamic_length_v<int>,
                                                false,
                                                false);

matmul2d<descriptor, execution_simdgroups<4>> op;

op.run(tA, tB, tC);
```

여기서 중요한 점은 **quantized tensor를 `op.run`에 그대로 전달**한다는 것이다. TensorOps가 dequantization을 처리한다.

Apple은 가능한 경우 직접 dequantize하지 말고 quantized input을 TensorOps에 그대로 전달하는 방식을 권장한다.

---

# 🔄 Custom format을 직접 dequantize해야 할 때

TensorOps가 직접 지원하지 않는 custom quantization format을 처리해야 할 수도 있다.

단순한 방식은:

1. 각 thread가 quantized data를 device memory에서 load
2. `f16`으로 dequantize
3. threadgroup memory에 저장
4. TensorOps에 inline threadgroup tensor로 전달

하지만 이 방식은 **threadgroup memory로 추가 load/store**가 필요하다.

더 효율적인 대안은 **cooperative tensor**다.

### Cooperative tensor의 역할

Cooperative tensor는 tensor 저장 공간을 matmul에 참여하는 여러 thread의 **private register memory**에 분산한다.

따라서 custom dequantization 결과를 cooperative tensor에 직접 저장하면:

- device → register
- register → TensorOps

경로로 처리할 수 있고, threadgroup memory를 거치는 round trip을 줄일 수 있다.

---

# ⚠️ Quantized type의 alignment

세션은 iOS/macOS 27의 새 quantized type, MX scaling format, E8M0 scale factor가 기존 큰 data type보다 **추가 alignment requirement**를 가진다고 명시한다.

따라서 low-level buffer layout을 직접 관리할 때는 Metal documentation의 alignment 조건을 확인해야 한다.

---

# 🧠 Advanced op: FlashAttention 구현

Attention은 Transformer와 LLM의 핵심 연산이다.

기본 흐름:

1. `Q × K`
2. intermediate matrix row마다 SoftMax
3. 결과 × `V`

FlashAttention은 이 연산들을 **하나의 fused kernel**로 묶어 중간 메모리 traffic을 줄인다.

TensorOps를 이용한 구현에서 중요한 요소는 다음과 같다.

- custom SIMD-group mapping
- cooperative tensors
- row-wise reductions
- `map_iterator`
- cooperative tensor의 direct matmul input 재사용

---

# 🧵 SIMD-group 단위 Q×K

각 SIMD group이 intermediate matrix의 완전한 row들을 소유하도록 mapping하면 SoftMax 단계에서 SIMD group끼리 데이터를 교환할 필요가 줄어든다.

이를 위해 **`execution_simdgroup` operation scope**를 사용한다.

```metal
constexpr auto mul_qk_op_desc = matmul2d_descriptor(/* ... */);
matmul2d<mul_qk_op_desc, execution_simdgroups> mul_qk_op;

auto tQSlice = tQ.slice<D, ROWS_PER_SIMD>(0, sgid * ROWS_PER_SIMD);
auto tKSlice = tK.slice<D, BK>(0, k);
auto tVSlice = tV.slice<D, BK>(0, k);

auto ctQK = mul_qk_op.get_destination_cooperative_tensor<decltype(tQSlice),
                                                         decltype(tKSlice),
                                                         float>();

mul_qk_op.run(tQSlice, tKSlice, ctQK);
```

`Q×K` 결과를 memory에 쓰지 않고 cooperative tensor인 `ctQK`에 직접 보관한다.

---

# 📉 Row-wise reduction과 SoftMax

SoftMax를 위해 각 row의 max를 계산한다.

TensorOps는 이를 위한 **`reduce_rows`**를 제공한다.

```metal
auto ctTileRowMax = mul_qk_op.get_row_reduction_destination_cooperative_tensor<
                        decltype(tQSlice),
                        decltype(tKSlice),
                        float>();

reduce_rows(ctQK, ctTileRowMax, reduction_operation::max, -INFINITY);
```

각 row의 reduction 결과도 cooperative tensor에 저장된다.

### `map_iterator`

원본 2D cooperative tensor와 reduction 결과 tensor는 shape이 다르다. 이 둘 사이의 대응 관계를 계산하기 위해 `map_iterator`를 사용한다.

```metal
#pragma clang loop unroll(full)
for (auto it = ctQK.begin(); it != ctQK.end(); it++) {
    auto row_it = ctRowMax.map_iterator(it);
    *it = exp(*it - *row_it);
}
```

원소를 순회하면서:

1. 해당 원소가 속한 row의 max 위치를 찾고
2. row max를 빼고
3. exponent를 계산하고
4. cooperative tensor에 다시 저장한다.

---

# 🚀 Cooperative tensor를 두 번째 matmul input으로 직접 재사용

macOS 26에서는 첫 matmul의 cooperative tensor 결과를 두 번째 matmul input으로 쓰려면:

1. threadgroup memory에 store
2. 다시 load
3. 다음 matmul 실행

과정이 필요했다.

새 API에서는 cooperative tensor를 **직접 matmul input으로 재사용**할 수 있다.

```metal
constexpr auto mul_sv_op_desc = matmul2d_descriptor(/* ... */);
matmul2d<mul_sv_op_desc, metal::execution_simdgroup> mul_sv_op;

if (mul_sv_op.is_compatible_as_left_input<float, half, float>(ctQK)) {
    auto ctQKIn = mul_sv_op.get_left_input_cooperative_tensor<float, half, float>(ctQK);
    mul_sv_op.run(ctQKIn, tVSlice, ctO);
} else {
    ctQK.store(tgTensor);
    simdgroup_barrier(mem_flags::mem_threadgroup);

    auto ctQKIn = mul_sv_op.get_left_input_cooperative_tensor<float, half, float>();
    ctQKIn.load(tgTensor);
    mul_sv_op.run(ctQKIn, tVSlice, ctO);
}
```

### 반드시 compatibility 확인

모든 cooperative tensor가 곧바로 다음 matmul의 input layout과 호환되는 것은 아니다.

사용 전:

- `is_compatible_as_left_input`
- `is_compatible_as_right_input`

으로 확인해야 한다.

호환되면 register-resident data를 바로 다음 op에 넘길 수 있다. 호환되지 않으면 기존 방식대로 threadgroup memory에 store/reload해야 한다.

이 최적화가 FlashAttention처럼 intermediate result를 연달아 소비하는 연산에서 중요하다.

---

# 🔌 Core AI에 custom Metal op 통합

세션 마지막에서는 custom FlashAttention kernel을 실제 **SAM3 image segmentation model**에 넣는다.

Core AI는 Python 개발자가 PyTorch 모델을 Core AI model로 변환할 수 있는 tooling을 제공하며 custom Metal kernel도 포함할 수 있다.

발표의 흐름:

1. Custom attention Metal kernel body를 Python 문자열로 정의
2. `TorchMetalKernel` 객체로 등록
3. Hugging Face 기본 attention 구현을 custom kernel 호출로 교체
4. Hugging Face model load
5. PyTorch에서 optimized Core AI asset으로 export
6. SAM3 inference 실행

데모에서는 image와 text prompt를 전달해 **car** 영역을 segmentation했고, custom FlashAttention kernel이 모델 안에 정상 통합되었음을 확인한다.

Custom op 통합 절차의 더 자세한 설명은 WWDC26 **Dive into Core AI model authoring and optimization** 세션으로 연결된다.

---

# 🧩 핵심 API/개념 정리

| API / 개념 | 역할 |
|---|---|
| `MTLTensor` | GPU tensor 표현 |
| `MTLTensorDescriptor` | Tensor shape/type/usage 정의 |
| `MTLTensorAuxiliaryPlaneDescriptor` | scale 등 auxiliary plane 정의 |
| `MTLTensorPlaneTypeScales` | scale plane 식별 |
| `tensor_handle` | Host에서 만든 tensor를 shader에 binding |
| `tensor_inline` | Shader stack에서 임시 tensor 생성 |
| `tensor_blockwise` | block-wise auxiliary plane 구조 정의 |
| `matmul2d` | TensorOps matrix multiplication |
| `execution_simdgroups` | Matmul 실행에 참여할 SIMD group 구성 |
| cooperative tensor | 여러 thread register에 분산된 tensor storage |
| `reduce_rows` | Cooperative tensor row reduction |
| `map_iterator` | 서로 다른 cooperative tensor layout/shape의 iterator mapping |
| `is_compatible_as_left_input` | Cooperative tensor를 matmul input으로 재사용 가능한지 확인 |
| `get_left_input_cooperative_tensor` | 기존 cooperative tensor를 다음 matmul input view로 변환 |

---

# 📋 구현 체크리스트

### Quantization
- [ ] Memory bandwidth가 bottleneck인지 확인
- [ ] 지원되는 native quantized type 우선 사용
- [ ] Scale plane이 필요한 block quantization인지 확인
- [ ] `blockFactors`가 실제 quantization block 구조와 일치하는지 확인
- [ ] 새 FP4/FP8/2-bit type의 alignment requirement 확인
- [ ] 직접 dequantize하기 전에 TensorOps native path 사용 가능 여부 확인

### Matmul
- [ ] Matrix를 적절한 tile 크기로 분할
- [ ] Threadgroup ID 기반 slice 적용
- [ ] Multi-plane tensor slice가 scale block과 일치하는지 확인
- [ ] `matmul2d_descriptor` tile 크기 조정
- [ ] TensorOps가 native dequantization을 수행하도록 quantized tensor 직접 전달

### Custom quantization
- [ ] Threadgroup memory round trip 비용 측정
- [ ] Register-resident cooperative tensor 사용 검토
- [ ] Custom dequantization 결과를 cooperative tensor에 직접 기록 가능한지 확인

### FlashAttention / fused ops
- [ ] 각 SIMD group이 완전한 row를 소유하도록 mapping
- [ ] Intermediate result를 cooperative tensor에 보존
- [ ] `reduce_rows`로 SoftMax reduction 수행
- [ ] `map_iterator`로 reduction 결과 매핑
- [ ] 다음 matmul 전에 cooperative tensor compatibility 검사
- [ ] 호환되지 않을 때 threadgroup memory fallback 구현

### Core AI integration
- [ ] Metal kernel을 `TorchMetalKernel`로 등록
- [ ] PyTorch op를 custom kernel call로 치환
- [ ] Core AI asset export 검증
- [ ] Reference implementation과 numerical correctness 비교
- [ ] 실제 device에서 latency/memory/performance 측정

---

# 🧠 핵심 메시지

Apple이 이 세션에서 강조하는 최적화 방향은 **tensor를 가능한 한 압축된 상태로 유지하고, intermediate 결과를 GPU register에 가까운 위치에 남기며, 불필요한 memory round trip을 제거하는 것**이다.

TensorOps는 단순한 matmul wrapper가 아니라:

- quantized tensor native execution
- scale plane metadata
- SIMD-group scoped execution
- cooperative tensor
- reduction
- fused custom op 구성

을 한 계층에서 제공한다.

그리고 이 low-level 최적화를 Core AI의 custom operation으로 연결함으로써, 연구 수준의 연산을 실제 앱에서 사용하는 모델까지 통합할 수 있게 한다.

---

# 🔗 함께 보면 좋은 공식 자료

- [WWDC26 — Optimize custom machine learning operations with Metal tensors](https://developer.apple.com/videos/play/wwdc2026/330/)
- [Tech Talk — Accelerate your machine learning workloads with the M5 and A19 GPUs](https://developer.apple.com/videos/)
- [WWDC25 — Combine Metal 4 machine learning and graphics](https://developer.apple.com/videos/)
- Apple Developer — Running inline ML operations in a shader with Metal 4
- Apple Developer — Machine learning passes
- Apple Developer — Metal Performance Primitives Programming Guide
- Apple Developer — Metal Performance Shaders
- WWDC26 — Dive into Core AI model authoring and optimization
