# 🌐 Unlock GPU Power on the Web with WebGPU

## ✨ 개요

WebGPU는 웹에서 GPU의 병렬 연산 능력을 직접 활용할 수 있게 해주는 차세대 그래픽 & 컴퓨트 API입니다.

* WebGL을 완전히 대체할 수 있는 그래픽 성능
* 브라우저 안에서 **범용 GPU 연산(General-purpose compute)** 가능
* Apple 플랫폼에서는 **Metal과 거의 1:1 매핑**
* 지원 플랫폼: **Mac · iPhone · iPad · Vision Pro**

즉,

> WebGPU는 “웹용 Metal”에 가장 가까운 API입니다.



---

# 🧠 WebGPU 아키텍처 구조

## 🔄 전체 파이프라인 흐름

웹 앱 → WebKit → Metal → GPU 하드웨어

1. 웹이 이미지·데이터 로드
2. WebKit이 GPU 리소스로 변환
3. Metal이 실제 GPU 리소스 생성
4. GPU에서 셰이더 실행

---

## 🧱 핵심 리소스 유형

Metal 기준으로 보면:

* **Buffer** → `MTLBuffer`
* **Texture** → `MTLTexture`
* **Sampler`
* **Bind Group** → Metal Argument Buffer

Bind Group은:

> GPU가 효율적으로 리소스를 묶어 사용하는 단위

---

## 🎛 WebGPU 주요 인터페이스 구조

* `GPU` / `GPUAdapter`
* `GPUDevice` (가장 중요한 엔트리 포인트)
* Resources (Buffer / Texture / Sampler)
* Pipelines

  * RenderPipeline
  * ComputePipeline
* Encoders
* BindGroups
* ShaderModules

---

# ⚙️ 기본 사용 흐름

## 1️⃣ Device 생성

```javascript
const adapter = await navigator.gpu.requestAdapter()
const device = await adapter.requestDevice()
```

Metal의 `MTLDevice`와 유사

---

## 2️⃣ Buffer 생성

```javascript
device.createBuffer({
  size,
  usage
})
```

* usage 모드는 데이터 레이스 방지용
* 데이터는 `queue.writeBuffer()`로 업로드

---

## 3️⃣ Texture 생성

```javascript
device.createTexture({
  size,
  format,
  usage
})
```

이미지 업로드:

```javascript
queue.copyExternalImageToTexture(...)
```

---

# 🏗 Pipeline 생성

## 🎨 Render Pipeline

* Vertex Shader
* Fragment Shader

Metal의 `MTLRenderPipelineState` 대응

---

## 🧮 Compute Pipeline

* Compute Shader 전용
* Metal의 `MTLComputePipelineState` 대응
* WebGL에서는 불가능했던 범용 연산 가능

---

# 🧬 WGSL (WebGPU Shading Language)

## 왜 새로운 언어인가?

* 웹 환경에 안전하도록 설계
* Apple이 설계에 적극 참여
* Metal과 친숙한 구조

---

## 지원 프로그램 타입

* Vertex
* Fragment
* Compute

---

## 🔺 Vertex Shader

* `@builtin(position)` 사용
* 삼각형 위치 계산

---

## 🎨 Fragment Shader

* 색상 계산
* depth 계산
* storage texture 접근 가능
* atomic 연산 가능

---

## ⚡ Compute Shader (WebGPU의 핵심 차별점)

* GPU에서 범용 계산 수행
* 시각화 필요 없음
* 병렬 실행

### 핵심 개념

* `workgroup_size`
* `global_invocation_id`

예: 100,000 파티클 물리 시뮬레이션

---

# 🚀 성능 최적화 (Apple 플랫폼 기준)

## 🧠 1️⃣ 메모리 사용 최소화

### Half precision 사용

WGSL 타입:

```wgsl
enable f16;
```

* f16은 메모리 절감
* 대역폭 감소
* iOS / visionOS에서 메모리 압박 방지에 매우 중요

⚠️ 단점:

* 최대 값 약 65,000
* 알고리즘 안정성 확인 필요

---

## 📉 2️⃣ 불필요한 버퍼 업데이트 방지

특히 비싼 경우:

* index buffer
* indirect buffer
* read/write bind group

가능하면:

> read-only 접근 사용

---

## ♻️ 3️⃣ Render Bundle 재사용

* draw 명령을 한 번 encode
* 여러 번 execute

장점:

* 매 프레임 validation 비용 제거
* Metal indirect command buffer와 유사

---

## 🧱 4️⃣ 리소스 개수 줄이기

최소화 대상:

* Command buffers
* Passes
* Bind groups
* Layouts

---

### Command Buffer 전략

* 가능하면 **하나만 사용**
* unified memory sync는 비용 큼
* 분리 필요한 경우만 분리

---

### Tile-based Renderer 고려

Apple GPU는:

> Tile-based Deferred Renderer

Pass 수 줄이면:

* 메모리 대역폭 절감
* 성능 향상

---

## 📦 5️⃣ Dynamic Offsets 활용

대신:

❌ 10개의 작은 bind group 생성
⭕ 하나의 큰 buffer + dynamic offset

예:

* 64바이트 × 10개
* → 640바이트 하나로 관리

결과:

* Metal buffer 생성 9개 감소
* validation 비용 감소

---

# 🧠 WebGPU의 본질적 의미

## WebGL과의 차이

| WebGL   | WebGPU      |
| ------- | ----------- |
| 그래픽 전용  | 그래픽 + 범용 연산 |
| 제한적 API | Metal 수준 제어 |
| CPU 중심  | GPU 중심 설계   |

---

# 🧠 핵심 정리

WebGPU는:

* 웹에서 **진짜 GPU 병렬 연산 가능**
* Metal과 거의 1:1 매핑
* iPhone / iPad / Mac / Vision Pro 지원
* WebGL을 대체할 차세대 표준

Apple 플랫폼에서 최적 성능을 내려면:

1. f16 적극 활용
2. Render Bundle 재사용
3. Command Buffer 최소화
4. Dynamic Offset 활용
5. 리소스 수 줄이기

---
