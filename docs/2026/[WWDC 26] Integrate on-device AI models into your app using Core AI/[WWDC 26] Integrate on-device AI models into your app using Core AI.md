# WWDC26 Integrate on-device AI models into your app using Core AI 요약

- Session: 326
- Title: Integrate on-device AI models into your app using Core AI
- Source: https://developer.apple.com/videos/play/wwdc2026/326/
- Topic: Core AI, Core AI Models, Foundation Models, SAM3, Qwen, Background Assets, AOT Compilation, Instruments, Multiplatform
- Chapters: Introduction, Camera-based vocab app, Model discovery, Core AI Models repo, Integration, Swift code, Specialization latency, Deployment, AOT compilation, iOS demo, Multiplatform, Next steps

---

## 한 줄 요약

Core AI는 **오픈소스 모델을 `.aimodel`로 가져오고, `coreai-models`의 Swift runtime wrapper로 전처리·후처리를 숨기며, Foundation Models의 `LanguageModelSession` API로 custom LLM을 동일한 방식으로 호출**할 수 있게 한다. 실제 배포에서는 모델을 앱 번들에 넣기보다 Background Assets로 선택적 다운로드하고, 첫 실행 specialization은 `coreai-build`의 ahead-of-time compilation으로 크게 줄이는 것이 핵심이다.

---

## 핵심 요약

이번 세션은 “모델을 고르는 단계”부터 “실제 앱에 배포하는 단계”까지 Core AI workflow 전체를 한 번에 보여준다.

- **App concept**
  - 카메라로 실물 object 촬영
  - SAM3가 prompt 기반 segmentation 수행
  - 영어 label을 Qwen이 받아 Mandarin vocab card 생성
  - 모든 처리는 on-device

- **Model discovery**
  - Image segmentation: SAM3
  - Language generation: Qwen 0.6B
  - 두 모델 모두 1B parameter 미만 variant 사용
  - Task-specific model을 분리해 quality, size, independent upgrade 측면의 이점을 얻음

- **Core AI Models repository**
  - Popular open-source model catalog
  - Export recipe 제공
  - Python conversion utility 제공
  - Swift runtime package 제공
  - Model-specific preprocessing/postprocessing wrapper 제공

- **Swift integration**
  - `CoreAIImageSegmenter`
  - `CoreAILanguageModels`
  - Foundation Models의 `LanguageModelSession`
  - `@Generable` structured output

- **Specialization latency**
  - 첫 load에서 Core AI model specialization 발생
  - 큰 model은 시간이 오래 걸릴 수 있음
  - 이후에는 cache에서 load되어 빠름
  - Core AI Instruments로 specialization event 확인 가능

- **Deployment strategy**
  - 모델을 앱 번들에 포함하면 update size가 1GB 이상 증가
  - 기능을 쓰지 않는 사용자도 비용을 부담
  - Background Assets로 opt-in download
  - 첫-run onboarding 중 download + specialization 수행

- **AOT compilation**
  - `coreai-build`로 development machine에서 compile
  - architecture-specific compiled asset 생성
  - 실제 device에서는 마지막 specialization만 수행
  - 첫 실행 준비 시간이 크게 감소

- **Multiplatform**
  - iOS 코드 재사용 가능
  - macOS에서는 더 큰 Qwen 8B로 교체
  - batch processing, richer prompts, longer context, curriculum generation까지 확장

---

# 🧠 Core AI가 해결하려는 문제

Core AI는 advanced on-device AI를 앱에 직접 넣기 위한 새로운 기술 집합이다.

Apple이 세션 초반에 강조한 장점:

```text
On-device AI
      ↓
User data stays on device
      ↓
No server
No per-token cost
No cloud latency
```

즉 모델 추론 자체를 앱의 local capability로 가져온다.

---

# 📱 예제 앱: 카메라 기반 단어 학습

기존에는 vocabulary card를 사람이 직접 만든다.

카드 구조:

- Word
- Translation
- Example usage

하지만 curated deck은 규모 확장이 어렵다.

새 아이디어:

```text
Camera
  ↓
실물 Object
  ↓
AI Segmentation
  ↓
English Label
  ↓
LLM
  ↓
Target-language Vocab Card
```

학생이 정원, 거리, 사무실에서 직접 본 대상을 찍으면 그 object로 단어 카드가 생성된다.

이렇게 하면 학습 콘텐츠가 사용자의 실제 생활에서 나온다.

---

# 🎯 먼저 AI Requirement를 정의한다

Apple은 모델을 먼저 고르지 않고 앱 요구사항부터 정의한다.

세션의 세 가지 requirement:

## Content

실제 생활 장면을 다뤄야 한다.

예:

- Kitchen
- Street
- Office

## Language

처음부터 multilingual architecture가 필요하다.

Initial release:

```text
Target language: Mandarin Chinese
```

## Device constraints

iPhone에서 전부 on-device로 실행해야 한다.

따라서:

- Storage footprint 작아야 함
- Runtime memory 작아야 함
- Model 개수도 신중히 선택

---

# 🧩 문제를 두 개의 작은 모델로 분해

세션의 중요한 판단은 하나의 큰 multimodal model로 모든 일을 하지 않는 것이다.

대신:

```text
Model 1
Vision segmentation
        ↓
Model 2
Multilingual language generation
```

장점:

- Task-specific quality
- Smaller individual model size
- Independent upgrade
- On-device footprint 관리 용이

목표는 두 모델 모두 1B parameter 미만 variant다.

---

# 👁️ Vision Model: SAM3

세션은 Segment Anything Model 3, SAM3를 사용한다.

역할:

```text
Image
+
Text Prompt
      ↓
SAM3
      ↓
Segmentation Mask
```

예:

```text
Prompt: "flower"
```

결과:

- Object mask
- Bounding box
- Confidence

최종 vocab card의 graphic에 clean object cutout을 사용할 수 있다.

---

# 🗣️ Language Model: Qwen

SAM3가 segmentation과 함께 영어 label을 제공하면 Qwen이 vocab card를 생성한다.

필요한 특성:

- Multilingual
- Reasoning
- Structured output
- Compact size

Apple은 Qwen이 119개 language/dialect를 지원한다고 설명한다.

세션의 starting point:

```text
Qwen 0.6B
```

이 크기면 vision model과 함께 iPhone에 넣기 적합하다.

---

# 🧠 왜 Reasoning Model인가

단순 번역만 필요한 것이 아니다.

예를 들어:

```text
Input: Hummingbird
```

원하는 출력:

- Target-language word
- English meaning
- Natural example sentence
- 그 sentence의 English meaning

Reasoning model은 단순 translation보다 문맥에 맞는 예문 생성에 유리하다.

---

# 🛠️ Core AI로 Model을 가져오는 두 경로

Core AI는 model conversion과 optimization을 직접 수행할 수 있다.

## 직접 변환

- PyTorch model
- Core AI PyTorch Extensions
- Core AI Optimization

이 경로는 model authoring을 직접 통제하고 싶을 때 적합하다.

## Core AI Models repository

Popular model이면 더 쉬운 경로가 있다.

```text
coreai-models repo
      ↓
Model catalog
      ↓
Export recipe
      ↓
Optimized .aimodel
```

이번 세션은 SAM3와 Qwen 모두 이 repository에서 export한다.

---

# 📦 Core AI Models Repository 구조

Repository는 크게 세 부분으로 이해할 수 있다.

## `models/`

Model catalog.

예:

- SAM3
- Qwen family
- 기타 popular open-source model

각 model마다 export recipe가 있다.

## `python/`

Export와 conversion에 재사용할 수 있는 primitive와 utility.

## Swift Package

Runtime integration용 library.

특히 model-specific preprocessing/postprocessing을 숨겨준다.

---

# 🔍 `.aimodel`을 Xcode에서 Inspection

Model export 후 `.aimodel` 파일을 Xcode로 열 수 있다.

확인 가능:

- File size
- Platform target
- Metadata
- Functions
- Input shape
- Output shape
- Tensor type

세션의 SAM3 model:

```text
Size: 623 MB
Target: iOS 27.0, macOS 27.0
```

---

# 🧩 Multi-function Model

SAM3 `.aimodel`에는 여러 function이 들어 있다.

예:

```text
imageEncode
textEncode / related input processing
detect
```

`imageEncode`는 image tensor를 받아 dense feature embedding을 만든다.

`detect`는 feature와 text prompt를 받아 다음 raw output을 생성한다.

- Masks
- Bounding boxes
- Confidence scores

---

# ⚠️ Raw Tensor API의 부담

Model interface를 직접 사용하면 app developer가 처리해야 할 것이 많다.

예:

- Camera frame preprocessing
- Tensor shape conversion
- Text encoding
- Mask extraction
- Result labeling
- Post-processing

즉 `.aimodel`이 있다고 해서 바로 app-friendly API가 되는 것은 아니다.

---

# ✅ Swift Runtime Library가 이 복잡성을 숨긴다

Core AI Models repository의 Swift package는 model-specific runtime helper를 제공한다.

예:

```text
Tensor API
      ↓
Core AI Models Swift Runtime
      ↓
Clean Swift API
```

세션에서는 project에 Swift Package로 추가한 뒤 다음 product를 선택한다.

- `CoreAILM`
- `CoreAISegmentation`

---

# 🌸 SAM3 Swift Integration

세션 코드:

```swift
import CoreAIImageSegmenter

// Load
let segmenter = try await ImageSegmenter(
    resourcesAt: sam3ModelURL
)

// Use
let response = try await segmenter.segment(
    image: inputImage,
    prompt: "flower"
)

let mask = response.segments.first?.mask
```

핵심은 app developer가 raw tensor shape를 다루지 않는다는 것이다.

---

# 🗣️ Qwen Swift Integration

```swift
import FoundationModels
import CoreAILanguageModels

// Create model instance
let model = try await CoreAILanguageModel(
    resourcesAt: qwen3ModelURL
)

// Create session using the model
let session = LanguageModelSession(
    model: model
)

// Generate response
let response = try await session.respond(
    to: "..."
)
```

여기서 가장 중요한 포인트는 `LanguageModelSession`이다.

---

# 🔁 Foundation Models API 재사용

Core AI custom model에서도 Foundation Models framework의 familiar API를 그대로 쓴다.

```text
Apple On-device Model
        ↘
         LanguageModelSession
        ↗
Custom Core AI Model
```

즉 개발자 경험이 통일된다.

사용 가능한 특성:

- `respond(to:)`
- Streaming
- Structured output
- Guided generation

---

# 🧱 `@Generable` Structured Output

Vocabulary card를 free-form text로 받지 않고 typed structure로 받는다.

```swift
import FoundationModels
import CoreAILanguageModels

@Generable
struct VocabCard {
    let chineseWord: String
    let englishMeaning: String
    let exampleSentence: String
}

let model = try await CoreAILanguageModel(
    resourcesAt: modelURL
)

let session = LanguageModelSession(
    model: model
)

let response = try await session.respond(
    to: "Create a vocab card for flower",
    generating: VocabCard.self
)

let card: VocabCard = response.content
```

장점:

- Parsing 불필요
- Typed result
- UI binding이 쉬움
- Schema에 맞는 generation 유도

---

# 🐢 첫 실행에서 Model이 느린 이유

실제 demo에서 segmentation이 오래 걸린다.

Apple은 Core AI Instruments trace를 확인한다.

결과:

```text
Model Load
   ↓
Specialization
   ↓
Large latency
```

---

# ⚙️ Specialization이란

Core AI model은 device에서 실행되기 전에 특정 device용 executable form으로 준비되어야 한다.

흐름:

```text
.aimodel
   ↓
Model Load
   ↓
Cache 확인
   ↓
없으면 Specialization
   ↓
Device-specific executable artifact
```

큰 model에서는 시간이 상당히 걸릴 수 있다.

---

# 💾 이후 Load는 빠르다

Specialization 결과는 cache된다.

```text
First Load
→ Slow specialization

Subsequent Loads
→ Cached specialized asset
→ Fast
```

따라서 중요한 것은 첫 경험을 어떻게 설계하느냐다.

---

# 🧭 Specialization을 어디서 할 것인가

잘못된 선택:

```text
User taps camera feature
      ↓
Spinner
      ↓
Long specialization
```

더 나은 방식:

```text
First-run feature introduction
      ↓
Download
      ↓
Specialization
      ↓
Interactive flow에서는 이미 준비 완료
```

세션은 feature onboarding을 specialization의 자연스러운 위치로 사용한다.

---

# 📦 모델을 App Bundle에 넣지 않는 이유

두 model을 bundle에 넣으면 앱 update download가 1GB 이상 늘어난다.

문제:

- 기능을 쓰지 않는 사용자도 download
- App update size 증가
- Storage cost 증가

따라서 feature를 optional하게 유지한다.

---

# ☁️ Background Assets 사용

Feature introduction screen에서 사용자가 기능을 원한다고 선택했을 때만 model을 다운로드한다.

```text
Feature Intro
      ↓
User Opt-in
      ↓
Background Assets Request
      ↓
Download Progress
      ↓
Model Ready
```

이렇게 하면 기존 앱 사용자는 AI feature 때문에 update size를 강제로 부담하지 않는다.

---

# 🧠 하지만 Specialization은 여전히 오래 걸릴 수 있다

Background Assets로 download 문제는 해결했지만 specialization 자체는 device에서 수행된다.

큰 model이면 여전히 onboarding 중 wait가 길다.

이를 해결하는 것이 ahead-of-time compilation이다.

---

# ⚙️ Specialization의 두 단계

Apple은 specialization을 크게 두 단계로 설명한다.

```text
1. Core compilation steps
2. Executable artifact generation
```

이 중 compilation이 가장 비싸다.

Executable artifact는 device와 OS version에 종속된다.

---

# 🚀 Ahead-of-Time Compilation

Core AI toolchain은 expensive compilation을 development machine에서 미리 수행할 수 있다.

```text
Development Mac
      ↓
AOT Compilation
      ↓
Compiled Core AI Model
      ↓
User Device
      ↓
Final device specialization only
```

결과:

- First-run preparation 시간 크게 감소
- User device에서 할 일이 적어짐

---

# 🛠️ `coreai-build`

세션 코드:

```bash
xcrun coreai-build compile MyModel.aimodel --platform iOS
```

이 command는 model을 특정 platform/device architecture용 compiled model로 만든다.

옵션에 따라 여러 architecture용 artifact를 생성할 수 있다.

---

# 📦 Architecture-specific Background Asset

세션에서는 compiled model을 architecture별 Background Asset으로 만든다.

```text
Compiled Model A
→ Architecture A

Compiled Model B
→ Architecture B
```

앱에서는 현재 device architecture를 감지한 뒤 적합한 asset을 요청한다.

```text
Device Architecture Detect
      ↓
Matching Background Asset Request
```

---

# ⚡ AOT 적용 후 User Experience

이전:

```text
Download
      ↓
Long specialization
      ↓
Feature ready
```

AOT 적용 후:

```text
Download compiled asset
      ↓
Short final specialization
      ↓
Feature ready quickly
```

Apple demo에서 preparation step이 크게 줄어든다.

---

# 🧪 Core AI Instruments

이번 세션에서 Instruments는 중요한 deployment tool이다.

확인 가능:

- Model load
- Specialization event
- Runtime latency
- First-load bottleneck

즉 AI integration은 단순 API 사용뿐 아니라 실제 device에서 profiling해야 한다.

---

# 📸 iOS Demo Flow

AOT 적용 후 전체 flow:

```text
Camera
   ↓
Object image
   ↓
SAM3 segmentation
   ↓
English object label / cutout
   ↓
Qwen
   ↓
Mandarin vocab card
   ↓
Save to collection
```

세션에서는:

- Rock
- Wood
- Sunflower

같이 사용자에게 의미 있는 물체를 사용한다.

---

# 💾 Subsequent Inference

Model이 한번 specialization되고 cache되면 이후 추론은 훨씬 자연스럽다.

```text
First run
→ Download + specialization

Later runs
→ Cached asset
→ Seamless inference
```

---

# 🖥️ Multiplatform 확장

같은 feature를 macOS로 확장한다.

핵심:

> Swift integration code를 그대로 재사용할 수 있다.

Core AI model abstraction과 Foundation Models API가 platform 공통이기 때문이다.

---

# 📁 Mac에서는 Batch Processing

iPhone:

```text
한 번에 하나의 Object
```

Mac:

```text
Folder of Photos
      ↓
Parallel Segmentation
      ↓
Multiple Objects per Photo
      ↓
Batch Card Generation
```

Mac의 더 큰 memory와 compute를 활용한다.

---

# 🧠 더 큰 Qwen Variant 사용

iPhone:

```text
Qwen 0.6B
```

Mac:

```text
Qwen3 8B
```

같은 API를 유지하면서 model만 더 큰 variant로 교체한다.

장점:

- Better reasoning
- Higher output quality
- Richer prompts
- Multiple example sentences
- Pinyin generation

---

# 🧾 Longer Context 활용

Mac의 더 큰 model과 context를 사용하면 개별 card를 넘어 curriculum generation도 가능하다.

예:

```text
Category of words
      ↓
LLM
      ↓
Simple → Complex ordering
      ↓
Lesson grouping
      ↓
Examples that reuse earlier vocab
```

한 prompt로 structured lesson plan을 생성할 수 있다.

---

# 🦋 Road Trip Demo

세션 후반의 macOS demo:

사진 안의 여러 object를 병렬로 segmentation한다.

예:

- Butterfly
- Rock
- Flower
- Lake
- Bird

그 다음 Qwen3 8B가 vocab card와 curriculum을 만든다.

같은 사진을 여러 card에 재사용할 수도 있다.

---

# 🧩 API / Tool 정리

| API / Tool | 역할 |
|---|---|
| Core AI | On-device custom AI model runtime |
| Core AI Models repo | Popular model catalog, export recipe, runtime helper |
| Core AI PyTorch Extensions | PyTorch → Core AI conversion |
| Core AI Optimization | Compression / optimization |
| `.aimodel` | Core AI deployable model format |
| `CoreAIImageSegmenter` | SAM3 runtime abstraction |
| `CoreAILanguageModels` | Custom LLM runtime abstraction |
| `LanguageModelSession` | Foundation Models style LLM session |
| `@Generable` | Typed structured generation |
| Core AI Instruments | Load / specialization / runtime profiling |
| Background Assets | Optional large model download |
| `coreai-build` | Ahead-of-time model compilation |

---

# 🔁 전체 Integration Workflow

```text
Use Case 정의
      ↓
Model Requirement 정의
      ↓
Model Discovery
      ↓
Core AI Models repo
      ↓
Export .aimodel
      ↓
Xcode에서 Interface Inspection
      ↓
Swift Runtime Package 추가
      ↓
SAM3 + Qwen 통합
      ↓
Foundation Models API 재사용
      ↓
Instruments로 First-load 진단
      ↓
Background Assets로 Optional Download
      ↓
AOT Compilation
      ↓
Fast First-run Specialization
      ↓
iOS / macOS Multiplatform 확장
```

---

# 📋 체크리스트

## Use Case 설계

- [ ] 실제 AI task를 명확하게 분해
- [ ] 하나의 큰 model보다 task-specific model 조합 검토
- [ ] Content domain 정의
- [ ] Target language 정의
- [ ] Device memory/storage constraint 정의
- [ ] On-device requirement 명확화

## Model Discovery

- [ ] Core AI Models repo에서 model 먼저 검색
- [ ] Model documentation 확인
- [ ] Parameter count 확인
- [ ] Supported language 확인
- [ ] Reasoning 필요 여부 확인
- [ ] Structured output suitability 확인
- [ ] Platform-specific variant 확인

## Export / Conversion

- [ ] Existing export recipe 활용
- [ ] 직접 conversion 필요 시 Core AI PyTorch Extensions 사용
- [ ] Compression 필요 시 Core AI Optimization 검토
- [ ] `.aimodel` 생성 후 Xcode에서 inspect
- [ ] Model size 확인
- [ ] Minimum OS target 확인
- [ ] Function input/output shape 확인

## Swift Integration

- [ ] `coreai-models` Swift Package 추가
- [ ] 필요한 runtime product 선택
- [ ] Segmentation wrapper 사용 검토
- [ ] Language model wrapper 사용 검토
- [ ] Raw tensor API 직접 handling 최소화
- [ ] `LanguageModelSession(model:)` 사용
- [ ] Streaming 필요 여부 확인
- [ ] Structured output 필요 시 `@Generable`

## Segmentation

- [ ] Input image format 확인
- [ ] Prompt language 정의
- [ ] Best segment 선택 기준 정의
- [ ] Confidence threshold 검토
- [ ] Mask extraction 확인
- [ ] Cutout rendering quality 확인

## LLM Generation

- [ ] Prompt schema 정의
- [ ] Typed output struct 정의
- [ ] `@Generable` 적용
- [ ] Translation quality 검증
- [ ] Example sentence naturalness 검증
- [ ] Unsupported language fallback 설계

## Performance

- [ ] First model load trace 수집
- [ ] Core AI Instruments 사용
- [ ] Specialization event 확인
- [ ] Specialization latency 측정
- [ ] Subsequent cached load와 비교
- [ ] Interactive path에서 specialization 제거

## Deployment

- [ ] AI 기능이 optional인지 판단
- [ ] Model을 앱 bundle에 포함할 필요가 있는지 검토
- [ ] Download size 증가량 측정
- [ ] Background Assets 활용
- [ ] Feature opt-in 후에만 model download
- [ ] Progress UI 제공
- [ ] Download cancellation/retry 처리

## First-run Experience

- [ ] Feature 설명 화면 마련
- [ ] Download와 specialization을 interactive flow 밖으로 이동
- [ ] 준비 상태 명확히 표시
- [ ] User가 기능을 쓰지 않으면 cost가 없도록 구성

## AOT Compilation

- [ ] `coreai-build` 사용 검토
- [ ] Platform 지정
- [ ] Architecture별 compiled model 생성
- [ ] Compiled asset 크기 확인
- [ ] Background Asset와 매핑
- [ ] Device architecture detection 구현
- [ ] First-run specialization 시간 재측정

## Caching

- [ ] First specialization 이후 cache behavior 검증
- [ ] OS update 이후 cache invalidation 가능성 고려
- [ ] Model version 변경 시 behavior 검토
- [ ] Storage cleanup policy 검토

## Multiplatform

- [ ] iOS 코드의 macOS 재사용 가능 여부 확인
- [ ] Platform별 더 큰 model variant 검토
- [ ] Batch processing 추가
- [ ] Parallel segmentation 검토
- [ ] Longer context 활용
- [ ] Curriculum generation 같은 higher-level workflow 검토

---

# ⚠️ 구현 시 주의할 점

## `.aimodel`만 있다고 Integration이 끝나는 것이 아니다

Raw tensor interface는 실제 app API와 거리가 있다.

Model-specific preprocessing/postprocessing을 직접 구현하면 많은 코드가 필요하다.

가능하면 Core AI Models runtime wrapper를 사용한다.

## First Load 비용을 무시하지 않는다

Large model의 specialization은 user experience를 망칠 수 있다.

반드시 실제 device에서 Instruments로 측정한다.

## 모델을 Bundle에 넣는 것이 항상 좋은 선택은 아니다

이번 example에서는 model 때문에 update size가 1GB 이상 증가한다.

Optional feature라면 Background Assets가 더 적합하다.

## AOT Compile이 Specialization을 완전히 없애는 것은 아니다

Development Mac에서 expensive compilation을 미리 하지만 최종 device-specific specialization은 여전히 필요하다.

다만 작업량이 크게 줄어든다.

## Platform별 Model Size 전략을 다르게 할 수 있다

iPhone에서는 0.6B, Mac에서는 8B처럼 같은 API에 다른 model variant를 연결할 수 있다.

Core AI의 multiplatform 장점을 적극 활용할 수 있는 부분이다.

---

# 🎯 세션에서 보여준 Model Strategy

```text
iPhone
├─ SAM3
└─ Qwen 0.6B

Mac
├─ SAM3
└─ Qwen3 8B
```

같은 Swift API를 유지하면서 hardware capability에 따라 model만 교체한다.

---

# 핵심 메시지

이번 세션은 Core AI의 가치가 단순히 “custom model을 실행할 수 있다”에 그치지 않는다는 점을 보여준다.

실제 production 앱에는 다음 전체 workflow가 필요하다.

```text
Model Discovery
      +
Optimized Export
      +
Swift Runtime Abstraction
      +
Foundation Models API
      +
Profiling
      +
Optional Download
      +
AOT Compilation
      +
Multiplatform Model Strategy
```

SAM3와 Qwen을 예로 들면 vision model과 language model을 분리해 task-specific quality와 작은 footprint를 얻고, `coreai-models` repository의 export recipe와 Swift package를 이용해 raw tensor handling을 피할 수 있다.

Custom language model도 `LanguageModelSession`에 넘기면 Apple on-device model을 사용할 때와 같은 API 경험을 얻는다. `@Generable` structured output도 그대로 사용할 수 있어 custom open-source LLM과 Foundation Models의 developer ergonomics가 연결된다.

Deployment에서는 첫 specialization latency가 가장 현실적인 문제다. Core AI Instruments로 원인을 확인하고, Background Assets로 model download를 opt-in으로 만들며, `coreai-build`로 expensive compilation을 미리 수행해 first-run wait를 줄인다.

그리고 이 architecture는 iOS에서 끝나지 않는다. 같은 Swift integration code를 Mac으로 가져가 더 큰 model, parallel batch processing, longer context를 활용할 수 있다.

즉 Core AI의 핵심은 **custom open-source model을 Apple platform의 native app lifecycle과 deployment model 안으로 자연스럽게 통합하는 end-to-end stack**이라는 점이다.

---

# 함께 보면 좋은 세션과 자료

- Meet Core AI — WWDC26
- Dive into Core AI model authoring and optimization — WWDC26
- Discover Apple-Hosted Background Assets — WWDC25
- Compiling Core AI models ahead of time
- Core AI PyTorch Extensions
- Core AI Python
- Core AI Optimization
- Core AI Models repository
