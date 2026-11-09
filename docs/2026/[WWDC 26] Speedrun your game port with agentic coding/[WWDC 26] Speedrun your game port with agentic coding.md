# WWDC26 — Speedrun your game port with agentic coding

- **Session:** 357
- **Title:** Speedrun your game port with agentic coding
- **Speaker:** David Srour, Metal Ecosystem Team
- **Source:** https://developer.apple.com/videos/play/wwdc2026/357/
- **Basis:** Apple Developer 공식 전체 transcript 및 Code 섹션
- **Main technologies:** Game Porting Toolkit 4, Metal 4, Metal Shader Converter, MetalFX, GCController, `gpucapture`, `gpudebug`

---

## 🎯 한 줄 요약

Game Porting Toolkit 4는 단순한 문서 묶음이 아니라 **코딩 에이전트가 실제 게임 포팅 작업을 계획·실행·검증하도록 만드는 agentic skills와 porting assistant**를 제공한다. 세션은 Microsoft MiniEngine을 D3D12/Windows에서 native macOS/Metal 4로 옮기는 과정을 통해, GPU 리소스·셰이더 바인딩·동기화·GPU 디버깅·게임 컨트롤러·MetalFX까지 에이전트가 어떻게 플랫폼 지식을 적용하고 검증하는지 보여준다.

---

## 🧭 세션 구성

| 시간 | 내용 |
|---|---|
| 0:00 | Introduction |
| 1:06 | Porting assistant workflow |
| 6:25 | Windowing and frame pacing |
| 8:28 | Scene rendering with Metal 4 |
| 15:16 | Debugging with GPU command-line tools |
| 19:09 | Game controllers and MetalFX |
| 25:11 | Next steps |

---

## 🤖 Game Porting Toolkit 4의 핵심: agentic skills

Apple은 기존 게임 포팅이 보통 다음 단계로 이어진다고 설명한다.

- 포팅 범위 파악
- 빌드 성공
- 셰이더 변환
- renderer bring-up
- 입력 remapping
- Apple 플랫폼에 맞는 polish
- 성능 최적화

이 과정은 기존에는 수작업 비중이 높고, 플랫폼별 경험이 부족하면 디버깅에 많은 시간이 걸렸다. Game Porting Toolkit 4는 여기서 **agentic skills**를 중심에 놓는다.

### 두 종류의 skill

- **Expert skills**: 특정 기술 영역에 대한 도메인 지식과 best practice 제공
- **Workflow skills**: 포팅을 어떤 순서와 절차로 진행할지 구조화

그리고 이 둘을 연결하는 것이 **porting assistant agent**다.

Expert skill은 단순히 “API를 알려주는 문서”가 아니다. 에이전트에게:

- Apple 플랫폼의 구체적 구현 지식
- 권장 패턴
- 흔한 anti-pattern
- 검증 시 확인해야 할 항목

을 제공한다.

이 덕분에 모델이 우연히 올바른 API를 떠올리는 데 의존하지 않고, 반복적으로 좋은 구현을 생성할 가능성을 높인다.

### 필요한 skill을 assistant가 강제로 로드

중요한 점은 **모델이 알아서 skill을 사용할지 말지 결정하는 구조가 아니라는 것**이다. Porting assistant가 milestone마다 필요한 expert skill을 자동으로 로드한다.

즉:

> milestone 정의 → 필요한 skill 연결 → 실행 → skill의 anti-pattern/best-practice 기준으로 validation

이라는 구조다.

에이전트가 milestone 사이에서 학습한 정보도 저장되어 다음 작업에 이어진다.

---

## 🧪 데모 대상: Microsoft MiniEngine

세션은 Microsoft의 오픈소스 D3D12 엔진인 **MiniEngine**을 Windows에서 macOS로 포팅한다.

발표에 사용된 코딩 에이전트는 **Claude Code**다. 다만 핵심은 특정 모델이 아니라 Game Porting Toolkit 4의 skill/plugin 구조다.

Skill과 assistant는 Game Porting Toolkit GitHub marketplace의 plugin으로 제공된다.

```text
/plugin marketplace add apple/game-porting-toolkit
/plugin install game-porting-skills@game-porting-toolkit
```

설치가 끝나면 porting assistant에게 무엇부터 해야 하는지 물을 수 있다.

---

## 🗺️ Porting assistant workflow

Porting assistant는 전체 포팅을 크게 세 단계로 나눈다.

### 🔎 Discover

Discover workflow skill은:

- 코드베이스 분석
- 평가 환경(evaluation environment)에서 reference capture 확보
- 개발자의 선호와 목표에 대한 질문

을 수행한다.

여기서 reference capture가 매우 중요하다. 이후 validation에서 **원래 Windows/D3D12 버전의 ground truth와 macOS/Metal 버전을 비교**할 수 있기 때문이다.

### 📝 Plan

게임 전체를 한 번의 agent session에서 옮기려 하지 않는다. 개발자와 assistant가:

- goal
- milestone
- milestone별 필요한 expert skill

을 나눈다.

MiniEngine에서는 대표적으로:

1. Window 생성과 frame pacing
2. Metal 4 renderer bring-up
3. Scene rendering
4. Post-processing
5. Dynamic lighting
6. Controller support
7. MetalFX

등으로 분리한다.

### ⚙️ Execute and Validate

각 milestone마다 agent가 변경을 수행하고 개발자가 중요한 의사결정을 검토한다.

그 다음 validation workflow가 다중 체크리스트를 실행한다.

- 앱이 정상적으로 launch하는가
- Metal API 사용이 올바른가
- shader validation이 통과하는가
- screen capture가 reference와 시각적으로 맞는가
- skill이 알려준 anti-pattern이 남아 있지 않은가
- memory 문제가 없는가
- milestone의 ground truth와 결과가 일치하는가

이 validation 단계가 agentic workflow의 핵심 안전장치다.

---

## 🪟 Windowing과 frame pacing

처음 MiniEngine 포트는 빌드/실행은 되지만 화면이 없다. 첫 milestone은 창과 render loop를 만드는 것이다.

이 단계에서는 여러 skill이 함께 쓰인다.

- Window skill
- D3D12 swap chain → Metal 개념 변환 skill
- Presenting drawables skill
- `metal-cpp` skill

### Window skill이 다루는 내용

- Window 생성
- Lifecycle
- Focus 변화
- Full screen 전환
- Metal layer의 해상도
- Color space
- Metal Display Link 기반 render loop

### Presentation skill이 다루는 내용

- Direct-to-display presentation
- 낮은 latency
- Drawable lifetime 관리
- Stutter 방지
- Texture residency 유지

잘못 구현하면:

- blank frame
- dropped frame
- broken window behavior
- unstable frame pacing

같은 문제가 생길 수 있다.

Agent 적용 후 Metal HUD에서 안정적인 frame pacing이 확인되고, renderer 작업 전에 presentation 기반을 먼저 검증한다.

---

## 🎨 Metal 4 renderer bring-up

첫 playable 목표에는:

- Lighting
- Shadows
- SSAO
- Tone mapping

이 포함된다.

Metal 4는 explicit memory management와 새로운 command structure를 사용하기 때문에 기존 D3D12 코드를 단순 치환하기 어렵다.

세션은 rendering을 다음 세 milestone으로 나눈다.

1. GPU resources
2. Shader pipelines
3. Command encoding

---

## 🧱 GPU resources와 residency

GPU resource skill은:

- GPU memory
- Texture
- Render target
- Storage mode
- Apple silicon tile architecture에 적합한 옵션
- Constant buffer allocation
- Residency set

을 다룬다.

Metal 4에서는 constant가 buffer를 통해 전달된다. 또한 GPU가 리소스를 사용할 수 있게 **residency set**에 적절히 등록해야 한다.

공식 코드 예제:

```cpp
// With skill
residencySet->addAllocation(texture);
residencySet->commit();
// ...
argumentTable->setAddress(texture->gpuAddress(), bindPoint);

// Without skill
argumentTable->setAddress(texture->gpuAddress(), bindPoint);
```

Skill을 사용한 구현은 texture를 훨씬 앞선 시점에 residency set에 등록하고 commit한다.

Skill 없이 단순히 코드를 “컴파일되게” 만들면 argument table에는 주소를 넣어도 GPU가 해당 texture에 제대로 접근하지 못해 **에러 메시지 없이 잘못된 결과**가 나올 수 있다.

이 세션에서 반복해서 등장하는 주제는 바로 이것이다.

> 컴파일 성공 ≠ 올바른 GPU 프로그램

---

## 🔌 Shader pipeline과 argument buffer offset

D3D12의 root signature와 descriptor table을 Metal로 옮길 때 **Metal Shader Converter runtime**을 사용한다.

Skill은:

- Metal 4 compiler로 pipeline state 생성
- Descriptor table encoding
- D3D12 root signature 변환
- Metal argument buffer layout

을 가이드한다.

특히 argument buffer offset을 임의로 계산하면 안 된다.

공식 예제:

```cpp
// With skill
IRRootSignatureGetResourceLocations(m_MtlCurIRRootSig, locations);
size_t offset = locations[i].topLevelOffset;

// Without skill
size_t offset = paramIndex * descriptorSize;
```

D3D12 코드에서 흔히 쓰는 `index * size` 방식은 Metal Shader Converter가 만든 실제 layout과 다를 수 있다.

이 경우도 crash가 나지 않고 **잘못된 리소스가 bind되어 렌더링이 틀어지는 형태**로 나타난다.

즉 skill은 “컴파일되는 포팅”이 아니라 **shader runtime이 실제로 기대하는 layout을 조회하는 포팅**으로 유도한다.

---

## 🔄 Metal 4 explicit synchronization

Metal 4는 synchronization이 완전히 explicit하다.

하나의 command buffer 안에 여러 encoder가 있을 때 올바른 barrier가 필요하며, D3D12의 resource state와 Metal 4의 barrier 모델은 직접 대응하지 않는다.

Skill은 D3D12 상태를 Metal 4의 **producer / consumer stage model**로 변환한다.

공식 예제:

```cpp
// With skill
m_MtlPendingProducerStages |= MtlProducerStageFromD3D12(OldState);
m_MtlPendingConsumerStages |= MtlConsumerStageFromD3D12(NewState);
// ...
m_ComputeEncoder->barrierAfterStages(
    m_MtlPendingProducerStages,
    m_MtlPendingConsumerStages,
    MTL4::VisibilityOptionDevice);

// Without skill
m_ComputeEncoder->barrierAfterStages(
    MTL::StageDispatch,
    MTL::StageAll,
    MTL4::VisibilityOptionDevice);
```

Skill이 없으면 에이전트가 encoder boundary마다 넓은 blanket barrier를 넣을 수 있다.

간단한 workload에서는 우연히 동작할 수 있지만 pipeline이 복잡해질수록:

- 잘못된 stage dependency
- 과도한 synchronization
- 향후 추가 pass에서 silent failure

로 이어질 수 있다.

---

## 🖼️ Geometry passes 검증

첫 GPU workload가 실행되면 agent는 evaluation environment의 reference와 결과를 비교한다.

세션에서는 depth/shadow/color의 세 geometry pass가 reference와 맞는지 먼저 검증한다.

아직 post-processing이 없어 화면에 최종 결과를 present할 수 없더라도, 중간 pass를 ground truth와 비교해 다음 단계로 넘어간다.

이 접근은 큰 포팅 작업을 한번에 끝내려 하지 않고 **중간 GPU 산출물을 checkpoint로 사용하는 방식**이다.

---

## 🌫️ SSAO와 tone mapping

Post-processing은 두 부분으로 나뉜다.

- SSAO chain: 여러 compute dispatch
- Tone mapping: compute → render 전환

기존에 사용한 resource/synchronization/shader converter skill을 그대로 재사용한다.

이 단계부터 skill은 단순 구현 가이드가 아니라 **guardrail** 역할도 한다.

### Synchronization skill

Apple silicon의 tile memory 특성을 고려하지 못한 barrier 설정을 잡아낸다.

### Resource skill

점진적으로 포팅하는 과정에서 아직 bind되지 않은 resource에 안전한 default를 제공한다.

### Shader converter skill

Engine과 shader 사이의 data alignment mismatch를 탐지한다.

---

## 🔍 Shader reflection으로 parameter count 확인

MiniEngine 원본은 root parameter 수를 5개로 가정한다. 하지만 변환된 HLSL shader가 실제로 선언하는 것은 4개다.

이 차이를 반영하지 않으면 sampler table이 잘못된 offset으로 밀린다.

공식 코드 예제:

```cpp
// With skill
IRShaderReflection* refl = IRShaderReflectionCreate();
IRObjectGetReflection(compiledObj, IRShaderStageCompute, refl);
// ...
s_RootSignature.Reset(4, 2); // Reflection reveals: 4 params

// Without skill
s_RootSignature.Reset(5, 2);
```

핵심은 hard-coded metadata보다 **converter/reflection이 실제 shader에서 얻은 정보를 신뢰**하는 것이다.

---

## 🐛 첫 화면의 문제: SSAO는 보이지만 조명과 texture가 틀림

Post-processing 후 처음으로 화면에 픽셀이 나타난다.

- Drapes에서 SSAO는 보인다.
- 하지만 전체 lighting이 잘못되어 있다.
- Wall texture가 늘어나 보인다.

기존 방식이라면 개발자가 Xcode에서 GPU frame capture를 열고 직접 resource binding, shader constant, texture 등을 조사해야 한다.

macOS 27은 이 과정을 agent가 수행할 수 있는 두 개의 command-line GPU tool을 제공한다.

---

## 🛠️ `gpucapture`와 `gpudebug`

### `gpucapture`

실행 중인 앱의 GPU frame을 command-line에서 capture한다.

### `gpudebug`

Capture된 GPU trace를 분석한다.

Agent는 `gpudebug`로 Xcode GPU debugger에서 사람이 확인하던 항목을 검사할 수 있다.

- Resource bindings
- Constants
- Resource contents
- Pipeline state
- Dispatch calls
- Dispatch dimensions
- Pipeline을 따라가는 data flow

세션에서 developer는 눈으로 본 증상만 agent에게 전달한다.

Agent는 **debugging rendering issues skill**을 로드하고:

1. 증상 분류
2. `gpucapture`로 frame trace 확보
3. `gpudebug`로 trace 분석
4. Evaluation environment와 divergence 확인
5. Root cause 파악
6. 수정
7. 다시 GPU capture로 검증

을 수행한다.

중요한 점은 “코드를 보고 추측”하는 것이 아니라 **실제 GPU capture를 evidence로 사용하는 agentic debugging**이라는 것이다.

수정 후 lighting과 texture mapping이 reference output과 일치한다.

---

## ✅ GPU validation의 자동화

수정이 끝난 뒤에도 agent는 GPU tool을 다시 사용한다.

- 원본 evaluation trace와 dispatch call 비교
- Pipeline 비교
- Dispatch dimension 확인
- Resource flow 확인

사람이 매 milestone마다 여러 capture를 Xcode에서 열어 비교하면 매우 번거롭지만, macOS 27의 command-line GPU tooling을 이용하면 agent가 반복 작업을 수행할 수 있다.

---

## 💡 Dynamic lighting

마지막 first-playable 목표는 **128개의 point/spot light**다.

Compute 기반 light culling pass가 필요하며:

- Buffer
- Texture
- Light data용 새로운 GPU resource
- 새로운 synchronization pattern

이 추가된다.

여기서 이전 milestone에서 만든 패턴이 재사용된다.

- Residency pattern 덕분에 새 light resource도 GPU-visible하게 등록
- Synchronization skill이 compute encoder에 잘못 사용된 render stage flag 탐지
- Shader converter skill이 mixed resource type binding을 올바르게 구성

그 결과 Sponza scene에:

- Directional light
- Dynamic point/spot lights
- Shadow
- SSAO
- Tone mapping

이 모두 적용된 first playable이 완성된다.

---

## 🎮 Game controller 지원

키보드/마우스로 테스트하던 앱에 gamepad를 추가한다.

Agent는 **game controller skill**을 로드한다.

Windows의 XInput은 고정된 controller layout을 가정하기 쉽지만 Apple의 Game Controller framework에서는 실제 연결된 device가 어떤 element를 제공하는지 확인해야 한다.

Skill은:

- `GCController` discovery
- Device별 input model 조회
- 실제 지원하는 button/axis 확인
- Connect event
- Disconnect event
- Thumbstick mapping

을 올바른 패턴으로 구현하게 한다.

핵심은 고정 button map을 하드코딩하지 않는 것이다.

Controller는 실행 중 언제든 나타나거나 사라질 수 있으므로 lifecycle도 함께 처리한다.

---

## ✨ MetalFX: temporal upscaling

다음 목표는 MetalFX다.

Temporal upscaling은 낮은 해상도로 렌더링한 결과를 고품질 고해상도 이미지로 재구성한다.

Skill은 까다로운 integration 항목을 처리한다.

### Jitter

Jitter는 **pixel space**로 설정한다.

Normalized value를 잘못 사용하면 temporal accumulation이 사실상 무력화될 수 있다.

### Motion vector

- 올바른 scale
- 올바른 axis convention
- Ghosting 방지

### MIP bias

Scale factor에 맞는 적절한 시작값을 제공해 튜닝의 기준점을 만든다.

### History reprojection

이전 frame의 정보를 재사용해 시간축으로 detail을 축적할 수 있게 한다.

---

## 🎞️ MetalFX frame interpolation

Frame interpolation은 렌더링 frame 사이의 frame을 생성해 **effective frame rate를 두 배로 높일 수 있다.**

단, 일부 input latency가 증가하는 trade-off가 있다.

Skill은:

- Dedicated present thread 생성
- Rendering과 presentation 분리
- Interpolated/rendered frame의 정확한 timing
- 올바른 presentation order

을 구성한다.

Render thread에서 직접 present하면 frame spacing이 고르지 않을 수 있다.

세션은 temporal upscaling과 frame interpolation을 동시에 실행하고, Metal HUD에서 두 기능이 실제로 사용 중인지 확인한다.

---

## 📊 macOS 27 Metal HUD의 MetalFX 진단 기능

macOS 27의 Metal HUD는 MetalFX integration을 검증하기 위한 정보를 더 많이 표시한다.

### Exposure

Upscaler에 전달되는 exposure parameter가 올바른지 확인할 수 있다.

### Jitter sequence

- Jitter 값 표시
- 허용 범위를 벗어난 jitter는 빨간색으로 표시
- Scatter plot으로 위치 분포 확인

### Override

실행 중 다음 값을 override할 수 있다.

- Jitter multipliers
- Motion vector scales

HUD override로 결과가 정상화된다면 그 값 자체가 root cause를 좁히는 강력한 단서가 된다.

세션 예시에서는 움직이는 카메라에서 wobbling artifact가 보였고, HUD에서 motion vector의 X-scale이 반전된 것을 확인한다. X scale override를 양수로 바꾸자 artifact가 사라진다.

그 다음 texture가 흐릿하게 보이는 문제는 jitter multiplier를 조정해 개선한다.

중요한 운영 방식:

> HUD에서 override로 임시로 고쳐보고 → 원래 값을 계산하는 코드로 돌아가 실제 버그를 수정한다.

HUD는 최종 해결책이 아니라 **diagnostic probe**로 사용한다.

---

## 🏗️ MiniEngine 포트에서 확인된 expert skills의 역할

| 영역 | Skill이 제공한 핵심 지식 |
|---|---|
| Window | 창 lifecycle, fullscreen, focus, Metal Display Link |
| Presentation | direct-to-display, drawable lifetime, frame pacing |
| metal-cpp | 올바른 Metal object lifetime |
| GPU resources | storage mode, tile architecture, residency set |
| Shader converter | root signature, descriptor tables, argument buffer layout |
| Synchronization | D3D12 state → Metal producer/consumer barrier mapping |
| GPU debugging | 증상 → capture → 분석 → root cause 절차 |
| Controller | `GCController`, 실제 capability 조회, connect/disconnect |
| MetalFX upscaling | jitter, motion vectors, MIP bias, history reprojection |
| MetalFX interpolation | dedicated present thread, timing, presentation order |

---

## 🧠 Agent가 잘하는 일과 개발자가 계속 맡는 일

Apple의 데모에서도 포팅은 **완전 자동**으로 묘사되지 않는다.

Agent/skills가 주로 담당하는 일:

- 플랫폼 API 지식
- 반복 구현
- 알려진 anti-pattern 방지
- GPU capture 수집과 비교
- Validation checklist 실행
- Milestone별 세부 작업 수행

개발자가 담당하는 일:

- Architecture 결정
- Porting 목표와 우선순위
- Milestone 승인
- Agent output 리뷰
- 게임에 대한 맥락 제공
- 시각적/제품적 기대 결과 판단

발표자가 강조하는 핵심은 agent가 개발자를 대체한다는 것이 아니라 **플랫폼 지식과 반복 검증을 agent에게 넘겨 개발자가 중요한 판단에 집중하도록 만드는 것**이다.

---

## 🏭 Production engine에도 적용 가능한가?

세션 마지막에는 더 큰 사례로 **Godot**을 언급한다.

기존 Metal 3 backend가 있는 production engine에 **Metal 4 backend를 병행 추가**하도록 porting assistant를 적용했다.

MiniEngine과 같은 workflow:

- Discover
- Plan
- Skill 기반 실행
- Ground truth validation
- Best-practice validation

을 사용했고, 발표에서는 며칠 내에 동작하는 상태까지 올렸다고 설명한다.

이는 workflow가 작은 샘플 엔진에만 국한되지 않고 production-grade codebase에도 확장될 수 있음을 보여주기 위한 사례다.

---

## 📋 실무 적용 체크리스트

### 시작 전

- [ ] Game Porting Toolkit 4 설치
- [ ] Game Porting Toolkit marketplace/plugin 설치
- [ ] Porting assistant로 discovery 실행
- [ ] Evaluation environment에서 reference capture 확보
- [ ] 전체 포트를 작은 goal/milestone으로 분리
- [ ] Milestone마다 필요한 expert skill 매핑 확인

### Window / Presentation

- [ ] Metal Display Link 기반 render loop 구성
- [ ] Focus/fullscreen lifecycle 처리
- [ ] Layer resolution과 color space 점검
- [ ] Direct-to-display presentation 검토
- [ ] Drawable lifetime 점검
- [ ] Metal HUD로 frame pacing 확인

### Metal 4 GPU resources

- [ ] Storage mode를 Apple silicon 특성에 맞게 선택
- [ ] Constants용 buffer allocation 패턴 확인
- [ ] 모든 필요한 GPU resource를 residency set에 등록
- [ ] Residency set commit 시점 확인
- [ ] Argument table에 GPU address를 넣는 것만으로 충분하다고 가정하지 않기

### Shader pipeline

- [ ] Metal Shader Converter runtime 사용
- [ ] Root signature 변환 확인
- [ ] Descriptor table encoding 점검
- [ ] Argument buffer offset을 runtime에서 query
- [ ] `index * descriptorSize` 식의 수동 계산 제거
- [ ] Reflection으로 실제 shader parameter count 확인
- [ ] Hard-coded root parameter 수 제거

### Synchronization

- [ ] Metal 4 explicit synchronization 모델 이해
- [ ] D3D12 resource state를 producer/consumer stage로 매핑
- [ ] Encoder 사이 barrier dependency 확인
- [ ] 무조건 `StageAll`로 넓히는 blanket barrier 피하기
- [ ] Apple silicon tile memory 관련 barrier 조건 점검

### GPU debugging

- [ ] 시각적 증상을 먼저 기술
- [ ] `gpucapture`로 GPU frame capture
- [ ] `gpudebug`로 resource/pipeline/data flow 분석
- [ ] Evaluation ground truth와 dispatch/pipeline 비교
- [ ] 수정 뒤 같은 capture 기반으로 다시 validation

### Controller

- [ ] `GCController` discovery 구현
- [ ] Fixed XInput layout 가정 제거
- [ ] 연결된 device의 실제 capability query
- [ ] Connect/disconnect event 처리
- [ ] Thumbstick/button mapping 검증

### MetalFX

- [ ] Jitter를 pixel space로 전달
- [ ] Motion vector axis/scale 검증
- [ ] MIP bias 시작값 설정
- [ ] History reprojection 구성
- [ ] Frame interpolation에 dedicated present thread 사용
- [ ] Interpolated/rendered frame timing 확인
- [ ] Metal HUD exposure/jitter/motion-vector 상태 확인
- [ ] HUD override로 원인을 찾은 뒤 source code에서 실제 수정

### Validation

- [ ] App launch
- [ ] Metal API validation
- [ ] Shader validation
- [ ] Screen capture 비교
- [ ] Ground truth 비교
- [ ] Anti-pattern review
- [ ] Memory issue 검사
- [ ] Milestone이 끝날 때마다 validation 완료 후 다음 단계로 진행

---

## 🧩 이 세션에서 특히 중요한 포팅 패턴

### “Compile-first” 포팅의 한계

다음과 같은 코드는 컴파일될 수 있지만 틀릴 수 있다.

- Residency set 누락
- Argument buffer offset 수동 계산
- Blanket barrier
- Shader parameter count hard-code
- Fixed controller mapping
- Normalized jitter

즉 게임 포팅에서 compiler success는 매우 약한 검증이다.

### Ground truth 기반 milestone 검증

최종 화면만 비교하지 않는다.

- Geometry pass
- Dispatch call
- Pipeline
- Resource binding
- Dispatch dimension

같은 중간 결과도 reference와 비교한다.

### Agent의 자율성을 검증 가능한 범위로 제한

Porting assistant가 milestone과 validation checklist를 구조화하고, expert skill이 best practice와 anti-pattern을 제공한다.

이 구조 덕분에 “agent에게 전체 게임을 포팅해 달라고 한 번에 맡기는 방식”보다:

- 오류 범위가 작고
- 검증 기준이 명확하며
- 이전 milestone의 지식이 다음 단계로 이어지고
- 잘못된 구현을 빨리 발견할 수 있다.

---

## 🔗 관련 자료

- [Speedrun your game port with agentic coding — WWDC26](https://developer.apple.com/videos/play/wwdc2026/357/)
- Game Porting Toolkit on GitHub
- Game Porting Toolkit 4
- WWDC25 — Go further with Metal 4 games
- Metal Shader Converter
- Game Controller framework
- MetalFX

---

## 🏁 핵심 메시지

Game Porting Toolkit 4의 변화는 게임 포팅을 단순히 더 많은 API 예제나 자동 변환 도구로 해결하려는 것이 아니다. Apple은 **포팅 지식을 skill로 구조화하고, 작업을 milestone으로 쪼개며, 실제 GPU capture와 ground truth를 통해 agent의 결과를 반복 검증하는 workflow**를 제안한다.

이 방식에서 agent는 플랫폼 지식·반복 구현·검증을 담당하고, 개발자는 아키텍처·우선순위·품질 판단에 집중한다. MiniEngine 데모는 이 접근이 windowing부터 Metal 4 renderer, GPU 디버깅, controller, MetalFX까지 하나의 일관된 포팅 프로세스로 이어질 수 있음을 보여준다.
