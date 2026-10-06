# WWDC26 Build real-time neural rendering pipelines with Metal 요약

- Session: 359
- Title: Build real-time neural rendering pipelines with Metal
- Source: https://developer.apple.com/videos/play/wwdc2026/359/
- Topic: Metal 4, MetalFX, Neural Rendering, Machine Learning, TensorOps, Real-time Rendering

---

## 한 줄 요약

이 세션은 Metal 4에서 머신러닝을 실시간 렌더링 파이프라인에 통합하는 방법을 **MetalFX Denoising**, **Metal 4 ML command encoder 기반 커스텀 네트워크 배포**, **TensorOps를 활용한 셰이더 내부 소형 신경망 실행**이라는 세 단계로 설명한다.

---

## 핵심 요약

이번 세션은 실시간 렌더링에서 머신러닝을 적용하는 세 가지 수준을 중심으로 구성된다.

1. **MetalFX Denoising**
   - 실시간 path tracing viewport의 노이즈를 줄이기 위한 플랫폼 통합 denoising/upscaling API
   - Maxon Redshift Live 사례를 통해 production-quality 결과를 얻기 위한 입력 구성과 best practice 설명
   - auxiliary input, transparency overlay, denoiser strength mask, primary surface replacement, motion vector 처리 강조

2. **Metal 4 ML command encoder**
   - PyTorch 등에서 학습한 모델을 `MTLPackage`로 내보내고 Metal command buffer 안에서 실행
   - 기존 multi-stage post-processing pipeline을 하나의 neural evaluation으로 대체 가능
   - neural tone mapper / HDRNet 예시를 통해 rendering pass와 ML pass를 같은 frame 안에서 실행하는 흐름 소개

3. **TensorOps API**
   - 작은 특화 신경망을 셰이더 안에 직접 구현하고 실행
   - cooperative tensor와 SIMD group execution scope를 활용해 tensor 연산을 빠른 thread storage에서 처리
   - online training을 통해 dynamic scene에 맞춰 매 frame 모델을 갱신하는 sky illumination 예시 소개

---

# 1. Introduction

세션은 Metal 4를 통해 머신러닝을 실시간 렌더링 파이프라인에 통합하는 방법을 소개한다.

머신러닝은 더 이상 연구 단계에 머무르지 않고 real-time rendering production pipeline으로 이동하고 있다. 기존에는 analytical method로 구현하던 여러 rendering technique도 머신러닝으로 구현할 수 있으며, neural denoising, neural texture, learned tone mapping 등이 대표적인 예다.

Apple 플랫폼에서는 렌더링을 위한 머신러닝 도구가 세 가지 수준으로 제공된다.

| 수준 | 기술 | 역할 |
|---|---|---|
| Platform-integrated | MetalFX | ready-to-use neural denoising / upscaling |
| Custom model deployment | Metal 4 ML command encoder | command buffer 안에서 학습된 모델 실행 |
| Shader-level flexibility | TensorOps API | 셰이더 내부에서 직접 소형 신경망 구성 및 실행 |

세션은 이 세 가지 수준을 순서대로 설명한다.

---

# 2. MetalFX Denoising

## 기본 개념

실시간 path tracer는 interactive frame rate를 유지하기 위해 frame budget상 one sample per pixel 또는 매우 적은 sample만 사용할 수 있다. 이 경우 이미지는 자연스럽게 noisy해진다.

MetalFX Denoising은 live viewport의 low-latency 요구사항에 맞춰 설계된 neural upscaler이자 denoiser다. Apple silicon에 최적화되어 있으며, rendering pipeline 안에 쉽게 통합할 수 있다.

기본 흐름은 다음과 같다.

1. Path tracer가 low-sample frame 생성
2. diffuse albedo, depth, motion vector 등 auxiliary input 생성
3. MetalFX에 noisy input과 auxiliary input 전달
4. MetalFX가 denoised/upscaled image 생성
5. post-processing 후 화면에 표시

## Redshift Live 사례

세션에서는 Maxon의 Redshift Live가 MetalFX Denoising을 적용한 사례로 소개된다.

Redshift Live는 Cinema 4D에서 동작하는 modern real-time path tracing viewport다. 카메라 이동 중 one sample per pixel 결과에서 노이즈가 보이지만, MetalFX denoiser를 켜면 이미지가 훨씬 안정적이고 noise-free하게 보인다.

이를 통해 real-time ray-traced lighting, shadow, global illumination을 viewport에서 near-final image quality에 가깝게 확인할 수 있다.

---

# 3. MetalFX Denoising best practices

## 3.1 입력 품질을 깨끗하게 유지하기

Denoiser의 결과 품질은 입력 품질에 직접적으로 의존한다. 특히 auxiliary input은 가능한 noise-free하게 유지해야 한다.

가장 중요한 입력 중 하나는 **diffuse albedo**다. diffuse albedo는 denoising에서 강한 signal로 사용되므로, 화면에 보고 싶은 최종 결과에 최대한 가까운 noise-free version으로 만드는 것이 좋다.

권장되는 점검 방법은 다음과 같다.

- 엔진 안에 각 auxiliary input용 debug view 구성
- GPU capture로 texture를 frame-by-frame 확인
- 모델이 기대하는 형태로 input이 들어가는지 검증

## 3.2 Transparency overlay와 denoiser strength mask 사용하기

장면에는 이미 noise-free이거나, 강하게 denoise하면 안 되는 layer가 있을 수 있다.

예시는 다음과 같다.

- particle
- fog
- volumetric effect
- sky
- 이미 noise-free하게 생성된 layer

이 경우 MetalFX의 두 가지 도구를 사용할 수 있다.

| 도구 | 역할 |
|---|---|
| Transparency overlay | noise-free layer를 denoise하지 않고 upscale/composite |
| Denoiser strength mask | 특정 pixel 영역에서 denoising 강도를 조절 |

Denoiser strength mask는 0에서 1까지 조절할 수 있다. 0은 denoising을 하지 않는 상태이고, 1은 최대 강도로 denoise하는 상태다.

## 3.3 Mirror와 glass를 위한 primary surface replacement

Mirror와 glass처럼 reflection/transmission이 중요한 material은 denoising input을 특별히 다뤄야 한다.

Mirror는 자체 색상이 아니라 반사된 표면을 보여준다. 따라서 mirror-like object의 input에는 viewer가 실제로 보는 reflected geometry의 albedo, normal, roughness 같은 property를 저장해야 한다.

Glass는 reflection과 transmission이 섞인다. 이 경우 Fresnel term을 사용해 reflected/refracted albedo를 blend하면 input noise를 크게 줄일 수 있다.

이 접근은 **primary surface replacement**로 설명되며, reflection과 refraction을 선명하게 유지하는 데 중요하다.

## 3.4 Motion vector를 정확히 계산하기

Temporal stability를 위해 motion vector는 매우 중요하다.

Motion vector는 각 pixel이 이전 frame에서 어디에 있었는지를 나타내는 screen-space displacement다. MetalFX는 scene의 motion과 temporal information을 이해하기 위해 motion vector를 사용한다.

MetalFX가 기대하는 것은 **dejittered motion vector**다. sub-pixel jitter가 제거되지 않으면 motion vector가 최대 1 pixel 정도 어긋날 수 있고, edge shimmering이 발생할 수 있다.

### Camera-only motion vector 계산 흐름

세션에서 소개된 camera-only motion vector 계산 흐름은 다음과 같다.

1. 현재 frame의 view-projection matrix로 vertex 위치를 projection
2. 이전 frame의 matrix로 같은 위치를 projection
3. 두 projected position의 차이를 motion vector로 계산
4. 현재/이전 frame의 jitter delta를 빼서 unjittered motion vector 생성

움직이거나 deforming되는 geometry의 경우 camera-only 방식으로는 충분하지 않다. 이런 object는 이전 frame의 world position을 저장하거나 skinning을 두 번 수행해 실제 motion vector를 계산해야 한다.

Alpha-blended particle처럼 motion이 본질적으로 불안정한 경우에는 reactive mask를 사용할 수 있다.

---

# 4. Metal 4로 커스텀 ML 네트워크 배포하기

## Neural tone mapping

세션의 두 번째 부분은 플랫폼 제공 solution을 넘어 직접 학습한 ML-powered rendering solution을 구축하는 방법을 다룬다.

예시로 사용된 것은 **neural tone mapper**다.

대부분의 renderer는 HDR image를 display 가능한 결과로 변환하고 artistic vision을 맞추기 위해 복잡한 post-processing pipeline을 가진다. Tone mapping, color grade, film emulation 같은 stage가 이어지고, 각 stage는 고유한 parameter와 output을 갖는다.

이 pipeline은 매우 복잡해질 수 있다. 세션은 이러한 복잡한 color transformation pipeline 전체 또는 일부를 하나의 neural network로 대체할 수 있다고 설명한다.

## HDRNet 기반 접근

예시로 언급된 구조는 HDRNet이다. HDRNet은 downsampled image를 입력으로 사용해 global analysis와 local analysis를 수행하고, 16x16 tile 단위의 color transformation을 만든다.

이 localized transformation은 edge-aware technique을 통해 최종 tone mapped image에 적용된다.

## 학습과 배포 흐름

커스텀 neural tone mapper를 Metal 4에서 실행하는 흐름은 다음과 같다.

1. PyTorch 등 원하는 framework에서 network 개발 및 학습
2. 기존 프로젝트에서 수동으로 tone mapped된 이미지 또는 renderer가 생성한 tone mapped 이미지로 training data 구성
3. 학습된 모델을 `MTLPackage`로 export
4. Metal 4에서 `MTLPackage` 로드
5. network function과 machine learning pipeline descriptor 설정
6. ML encoder 생성
7. argument table에 input/output 연결
8. command buffer에서 network dispatch

이렇게 하면 path tracer의 sample 생성, MetalFX denoising, neural tone mapper가 같은 command buffer 안에서 같은 frame에 실행될 수 있다.

결과적으로 기존 multi-stage post-processing chain을 하나의 neural evaluation으로 대체할 수 있다.

---

# 5. TensorOps로 셰이더 내부 신경망 구성하기

## TensorOps의 역할

세 번째 수준은 작은 neural network를 셰이더 안에 직접 구성하고 실행하는 방식이다.

앞선 ML command encoder 방식이 offline-trained general-purpose network를 command buffer 안에서 독립 step으로 실행하는 방식이라면, TensorOps는 작은 특화 모델을 shader code 안에 inline으로 넣는 방식이다.

이 방식은 다음과 같은 특성을 가진다.

- 몇 천 개 이하 parameter의 작은 network
- 특정 scene 또는 특정 task에 특화
- generalization보다 특정 상황의 signal 학습에 초점
- 몇 frame마다 또는 매 frame online training 가능
- ALU, texture sampling instruction과 함께 shader 내부에서 실행 가능

TensorOps는 rendering pipeline의 어느 stage에서든 사용할 수 있다.

---

# 6. Online training 예시: sky illumination model

세션에서는 image-based lighting에 사용되는 skybox 예시를 통해 online training 흐름을 설명한다.

Skybox는 scene geometry에 자연스러운 soft illumination을 제공한다. 보통 특정 지점에서 모든 visible direction에서 들어오는 평균 light를 offline으로 precompute하고 runtime에서 sample한다.

하지만 scene은 항상 static하지 않다. 예를 들어 day-night cycle이 있으면 offline으로 학습된 signal이 현재 scene condition과 맞지 않을 수 있다.

이 문제는 neural network가 학습할 수 있는 함수로 볼 수 있으며, online training을 통해 해결할 수 있다.

## Online training loop

Sky illumination model의 online training 흐름은 다음과 같다.

1. world 상태 업데이트
2. sample할 direction 생성
3. 현재 model로 inference 수행
4. analytical solution으로 ground truth 계산
5. 예측값과 ground truth 사이의 error 계산
6. back propagation pass 실행
7. frame을 거치며 model accuracy를 점진적으로 개선
8. 개선된 model을 shading pass에서 바로 사용

이 방식은 offline training workflow로는 어려운, dynamic world condition에 적응하는 neural rendering을 가능하게 한다.

---

# 7. TensorOps로 MLP 평가하기

## MLP 구조

세션에서 소개된 sky probe network는 작은 fully connected multilayer perceptron, 즉 MLP다.

구조는 다음과 같다.

| 구성 | 내용 |
|---|---|
| Input | direction을 나타내는 3 floats |
| Hidden layer 1 | 4 neurons |
| Hidden layer 2 | 4 neurons |
| Output | average illumination color를 나타내는 3 floats |
| Network form | 3 - 4 - 4 - 3 MLP |

Input tensor는 여러 direction을 batch로 처리할 수 있도록 2D matrix 형태로 준비하는 것이 좋다. Output tensor도 batch of colors 형태의 2D matrix가 된다.

## Forward pass 구현 흐름

MLP를 shader 안에서 평가하는 기본 흐름은 다음과 같다.

1. input tensor 준비
2. 첫 hidden layer weight tensor와 matrix multiplication 수행
3. pre-activation result 생성
4. activation function 적용
5. 다음 layer에 대해 matrix multiplication과 activation 반복
6. output layer 결과 생성
7. resulting tensor를 저장하거나 shader에서 즉시 사용

## Cooperative tensor와 SIMD group execution scope

TensorOps는 여러 execution scope를 지원한다.

Thread execution scope는 하나의 thread가 전체 tensor operation을 담당하는 방식이다. divergent work나 thread group을 완전히 제어하기 어려운 pipeline stage에서 유용하다.

Compute stage처럼 thread group을 제어할 수 있는 경우에는 **SIMD group execution scope**를 사용할 수 있다. 이 방식에서는 참여하는 모든 thread가 같은 matrix multiplication에 협력한다.

이때 cooperative tensor를 사용할 수 있다. Cooperative tensor storage는 여러 thread에 분산되어 있으며, matrix multiplication 결과를 main memory로 왕복하지 않고 빠른 thread storage memory에 유지할 수 있다.

이를 통해 다음 layer의 activation과 matrix multiplication을 더 효율적으로 이어갈 수 있다.

---

# 8. Next steps

세션의 마지막은 세 가지 수준의 neural rendering 통합을 다시 정리한다.

| 수준 | 기술 | 시작점 |
|---|---|---|
| 1 | MetalFX Denoising | 실시간 viewport / game / pro app에서 먼저 적용 |
| 2 | MTLPackage + ML command encoder | offline-trained model을 Metal command buffer 안에서 실행 |
| 3 | TensorOps API | tiny network를 shader 안에서 실행하고 neural accelerator 활용 |

Apple은 real-time 요구사항이 있는 viewport, pro app, game에서는 먼저 MetalFX Denoising과 Upscaling을 채택하라고 권장한다.

그다음 직접 학습한 neural tone mapper를 실험하고, 마지막으로 TensorOps API를 이용해 작은 특화 네트워크를 shader 내부에서 구성해보는 흐름을 제안한다.

---

# 구현 체크 포인트

- [ ] 실시간 렌더링 파이프라인에서 one sample per pixel 또는 low sample noise가 발생하는 구간 확인
- [ ] MetalFX Denoising / Upscaling 적용 가능성 검토
- [ ] diffuse albedo, depth, motion vector 등 auxiliary input 생성 상태 점검
- [ ] auxiliary input debug view 구성
- [ ] GPU capture로 MetalFX input texture 검증
- [ ] transparency overlay와 denoiser strength mask가 필요한 layer 분리
- [ ] mirror/glass material에서 primary surface replacement 적용 여부 검토
- [ ] motion vector에서 sub-pixel jitter 제거 여부 확인
- [ ] moving/deforming geometry의 previous-frame position 저장 방식 검토
- [ ] post-processing pipeline 중 neural network로 대체 가능한 stage 식별
- [ ] PyTorch 등에서 학습한 모델을 `MTLPackage`로 export하는 흐름 검토
- [ ] ML command encoder와 rendering/compute pass를 같은 command buffer에 통합
- [ ] TensorOps로 구현할 수 있는 작은 특화 네트워크 후보 정리
- [ ] cooperative tensor와 SIMD group execution scope 사용 가능 구간 확인
- [ ] online training이 유효한 dynamic scene signal 후보 검토

---

# 함께 보면 좋은 후속 세션 후보

- Combine Metal 4 machine learning and graphics
- Go further with Metal 4 games
- Understanding the Metal 4 core API
- Metal sample code library
- Metal Performance Primitives Programming Guide
- Training a neural network to render irradiance in real time

---

# 정리

이 세션은 Metal 4가 real-time rendering과 machine learning을 같은 pipeline 안에서 다룰 수 있도록 확장된 방향을 보여준다.

가장 즉시 적용 가능한 수준은 MetalFX Denoising이다. Path tracing viewport나 게임처럼 낮은 sample 수로 interactive frame rate를 유지해야 하는 환경에서 MetalFX는 denoising과 upscaling을 platform-integrated solution으로 제공한다.

그 다음 단계에서는 ML command encoder를 사용해 직접 학습한 모델을 command buffer 안에서 실행할 수 있다. Neural tone mapping 예시처럼 기존 복잡한 post-processing pipeline을 하나의 neural evaluation으로 대체할 수 있다.

가장 유연한 단계는 TensorOps다. TensorOps는 작은 neural network를 shader 내부에 직접 구현하고, cooperative tensor와 neural accelerator를 활용해 실시간 inference와 online training까지 가능하게 한다.

전체적으로 세션은 Metal 4에서 neural rendering이 단순한 별도 후처리 기능이 아니라, rendering pipeline 안에 자연스럽게 결합되는 실행 모델로 발전하고 있음을 설명한다.
