# WWDC25 세션 276 — What’s new in BNNS Graph 요약

---

<br>

## ✨ 개요

* 이번 세션은 **BNNSGraph의 2025년 확장점**, 특히 새롭게 추가된 **BNNSGraphBuilder**를 소개합니다.
* 핵심 메시지는 간단합니다.
  * 이제 **Swift만으로** 작은 모델이나 연산 그래프를 직접 작성할 수 있습니다.
  * BNNSGraph는 여전히 **CPU 기반의 고성능·저지연 추론**에 적합합니다.
  * 특히 **오디오처럼 실시간성과 latency가 중요한 작업**, 그리고 **이미지 전·후처리**에 잘 맞습니다.
* 작년에는 Core ML package와 file-based API 중심이었다면, 올해는 **Swift 코드 안에서 그래프를 바로 정의하고 context를 생성하는 방식**으로 훨씬 즉시성 있는 워크플로를 제공합니다.

<br>

## 🧠 BNNSGraph가 왜 중요한가

* BNNS는 Apple의 **CPU 기반 머신 러닝 라이브러리**로, 실시간 오디오 처리처럼 지연 시간에 민감한 작업에 적합합니다.
* BNNSGraph는 여러 레이어와 데이터 흐름을 **하나의 그래프 단위로 통합**해서 처리합니다.
* 이 구조 덕분에 개발자는 각 레이어와 중간 텐서를 일일이 직접 연결하는 부담이 줄고, 런타임에서는 다음 같은 최적화를 자동으로 얻을 수 있습니다.
  * **수학적 변환 최적화**
  * **layer fusion**
  * **copy elision**
  * **메모리 공유 최적화**
  * **weight repacking**
* 결과적으로 BNNSGraph는 **실행 시간, 메모리 사용량, 에너지 효율**을 함께 개선해줍니다.

<br>

## 🆕 올해 핵심: BNNSGraphBuilder

* 올해 추가된 핵심 API는 **BNNSGraphBuilder** 입니다.
* 이 API를 사용하면 **Swift 언어로 직접** 그래프를 정의할 수 있습니다.
* 활용 대상은 크게 두 가지입니다.
  * **전처리 / 후처리용 그래프**
  * **작은 머신 러닝 모델**
* 가장 큰 변화는 **중간 파일 없이 context를 바로 생성**할 수 있다는 점입니다.
  * 기존 file-based 방식은 Core ML package → `mlmodelc` → graph 생성 순서였다면,
  * GraphBuilder는 **Swift closure 안에서 그래프를 정의하고 `makeContext` 한 번으로 실행 가능한 context를 만듭니다.**
* Apple은 기존 PyTorch 모델을 그대로 가져오는 경우에는 여전히 file-based API가 적합하지만,
  **새 프로젝트나 작은 그래프는 GraphBuilder가 훨씬 간단하다**고 설명합니다.

<br>

## 🛠️ 새로운 작성 방식: makeContext

* 올해 BNNSGraph에는 **`makeContext`** 라는 새 type method가 추가되었습니다.
* 개발자는 이 method에 closure를 넘겨서 그래프를 정의합니다.
* closure 안에서는:
  * 입력 argument를 만들고,
  * 텐서 연산을 조합하고,
  * 최종 output tensor들을 return 합니다.
* 이렇게 만들어진 context는 보통 **앱 시작 시 한 번만 생성**하고,
  이후 필요할 때마다 실행하는 방식으로 사용합니다.
* 이 구조의 장점은 다음과 같습니다.
  * 그래프가 앱 코드와 **같은 Swift 문맥 안에 존재**
  * 컴파일 시점에 **type-check**
  * 런타임 전에 알 수 있는 shape 같은 값을 그래프 정의에 반영 가능
  * intermediate tensor의 shape / data type 등을 확인하며 **디버깅 가능**
  * Xcode 자동완성과 정적 검사 도움

<br>

## 🔤 Swift다운 API와 Strong Typing

* BNNSGraphBuilder는 Swift 개발자에게 익숙한 문법을 적극적으로 사용합니다.
* 예를 들어:
  * `+`, `-`, `*`, `/` 같은 산술 연산자
  * 비교 연산자
  * 논리 연산자
  * slicing을 위한 **Swift subscript / range 스타일**
  등을 그대로 활용할 수 있습니다.
* 세션에서 Apple은 **strong typing**을 특히 강조합니다.
  * 텐서 data type이 맞지 않으면 **컴파일 단계에서 오류를 잡을 수 있습니다.**
  * 예를 들어 integer exponent를 FP16으로 cast하지 않으면 context 생성이 컴파일되지 않습니다.
  * Boolean 결과를 다른 연산에 쓰려면 적절한 cast가 필요합니다.
* 즉, 예전이라면 런타임에서 발견했을 실수를 이제는 **더 이른 단계에서 차단**할 수 있습니다.

<br>

## ✂️ Tensor Slicing과 이미지 크롭

* GraphBuilder의 또 다른 큰 포인트는 **tensor slicing** 입니다.
* BNNSGraph는 slice를 **복사본이 아니라 기존 데이터에 대한 참조**로 다루기 때문에,
  추가 메모리 할당이나 불필요한 복사가 줄어듭니다.
* 세션에서는 다람쥐 사진의 중앙 정사각형 영역을 잘라내는 예제를 보여줍니다.
  * source / destination을 **vImage pixel buffer**로 준비하고,
  * height / width를 flexible shape로 둔 뒤,
  * `SliceRange`와 Swift subscript 문법으로 중앙 영역을 지정합니다.
* channel 차원은 `fillAll`로 유지하고,
  margin을 기준으로 시작점과 끝점을 계산해 crop을 수행합니다.
* 이 예제는 GraphBuilder가 단순 ML 추론뿐 아니라 **이미지 전처리 파이프라인**에도 자연스럽게 들어갈 수 있음을 보여줍니다.

<br>

## 🖼️ vImage.PixelBuffer와의 연결

* 올해는 **vImage pixel buffer**와 BNNSGraph를 더 쉽게 연결하는 방식도 소개됩니다.
* 새로 추가된 **`withBNNSTensor`** method를 사용하면,
  pixel buffer와 **메모리를 공유하는 임시 BNNSTensor**를 만들 수 있습니다.
* 이 방식의 장점은 분명합니다.
  * 이미지 크기, 채널 수 같은 속성을 자연스럽게 공유
  * 별도 복사 없이 입력/출력 텐서를 전달 가능
  * 이미지 처리에서 성능 손실을 줄이기 좋음
* 세션 전반에서 이 연결 방식은 이미지 crop, thresholding 같은 예제의 핵심 기반으로 사용됩니다.

<br>

## ⚪ 이미지 전처리 예제: Thresholding

* GraphBuilder의 대표적인 전처리 예제로 **thresholding** 이 소개됩니다.
* 흐름은 다음과 같습니다.
  * 단일 채널 FP16 grayscale image를 입력으로 받음
  * 전체 이미지의 평균값을 계산
  * 각 픽셀이 평균보다 큰지 비교
  * 결과 Boolean 값을 destination pixel buffer의 bit depth에 맞게 cast
* 최종 결과는 연속적인 grayscale 이미지를 **흑/백 binary 이미지**로 바꾸는 형태입니다.
* 이 예제는 GraphBuilder가 **간단한 전처리 그래프를 매우 짧고 명확한 Swift 코드로 표현할 수 있다**는 점을 잘 보여줍니다.

<br>

## 📤 후처리 예제: Softmax + TopK

* GraphBuilder는 **모델 출력 후처리**에도 잘 맞습니다.
* 세션 예제에서는:
  * 입력 tensor에 `softmax`를 적용하고,
  * 이어서 `topK`로 상위 결과값과 index를 추출합니다.
* 이 작은 후처리 그래프를 **함수 안에서 즉석으로 생성**하고,
  결과를 다시 Swift array로 변환해 반환합니다.
* 여기서 중요한 점은:
  * 모델 자체를 BNNSGraph로 작성하지 않아도,
  * **모델 전후의 계산 파이프라인만 GraphBuilder로 묶을 수 있다**는 것입니다.
* 즉 GraphBuilder는 “모델 대체 API”라기보다,
  **ML 주변의 전처리/후처리 레이어를 Swift 안에서 정리하는 도구**로도 매우 유용합니다.

<br>

## 🎛️ Bitcrusher 예제 업데이트

* 세션 후반부에서는 작년의 **Bitcrusher Audio Unit 예제**를 GraphBuilder 방식으로 다시 보여줍니다.
* 작년 버전은 PyTorch 코드와 Core ML package를 바탕으로 했지만,
  이번에는 같은 효과를 **Swift GraphBuilder 코드만으로** 구현합니다.
* Apple이 보여주는 비교 포인트는 다음과 같습니다.
  * Swift 코드도 PyTorch와 비슷한 구조로 읽힘
  * `let` / `var`로 intermediate tensor를 명확하게 관리 가능
  * 연산들이 tensor method 또는 Swift operator 형태라 읽기 쉬움
  * `makeContext` closure에서 **여러 output tensor를 한 번에 return** 가능
* 즉, 새 API는 “Swift스럽고 간단하지만 성능은 유지되는” 방향으로 BNNSGraph 경험을 개선합니다.

<br>

## ⚡ FP16 지원과 성능 이점

* 세션에서는 Bitcrusher 예제를 통해 **FP16 지원의 이점**도 보여줍니다.
* precision을 type alias 하나로 바꾸면 그래프를 FP32 대신 FP16으로 전환할 수 있고,
  예제에서는 **FP16이 FP32보다 훨씬 빠르게 동작**하는 모습을 보여줍니다.
* 이는 BNNSGraph가 원래 지향하던
  * **고성능**
  * **에너지 효율**
  * **실시간 처리 적합성**
  을 GraphBuilder에서도 그대로 살리고 있다는 의미입니다.

<br>

## ✅ 정리

* 이번 세션의 핵심은 **BNNSGraphBuilder로 BNNSGraph가 훨씬 Swift 친화적으로 확장되었다**는 점입니다.
* 이제 개발자는:
  * 작은 그래프와 모델을 **Swift 코드로 직접 정의**할 수 있고,
  * 전처리 / 후처리 / 실시간 오디오 처리 같은 작업을
    **중간 변환 단계 없이 context로 바로 컴파일**할 수 있습니다.
* 특히 강점은 다음과 같습니다.
  * **strong typing 기반 안정성**
  * **Swift operator / slicing 기반 가독성**
  * **vImage pixel buffer와의 자연스러운 연동**
  * **FP16 활용을 포함한 성능 최적화**
* 요약하면 BNNSGraphBuilder는
  **“CPU 기반의 저지연 ML/신호처리를 Swift에서 더 쉽게 쓰게 해주는 실전형 API”** 로 보는 것이 가장 정확합니다.
