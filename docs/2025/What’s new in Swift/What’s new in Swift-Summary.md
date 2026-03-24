# WWDC25 세션 245 — What’s new in Swift 요약

<br>
## ✨ 개요

* 이번 세션은 **Swift 6.2의 핵심 변화**를 한 번에 정리하는 업데이트 세션입니다.
* 큰 흐름은 네 가지입니다.
  * **개발 워크플로 개선**
  * **기본 라이브러리 확장과 현대화**
  * **Swift의 활용 범위 확장**
  * **성능과 동시성 관련 언어 진화**
* 단순히 문법 몇 개가 추가된 해가 아니라, **Swift를 더 쉽게 시작하고, 더 넓게 쓰고, 더 깊게 최적화할 수 있게 만든 업데이트**라는 점이 핵심입니다.

<br>
## 🛠️ 개발 워크플로 개선

* Swift 생태계 자체가 계속 정비되고 있습니다.
  * `swiftlang` GitHub 조직이 커졌고,
  * Xcode의 빌드 시스템인 **Swift Build**도 오픈소스로 공개되었습니다.
  * Swift toolchain 관리용 **swiftly 1.0** 도 macOS까지 지원하게 되었습니다.
* 개발 도구 측면에서는 **VS Code 지원이 더 실용적**으로 강화되었습니다.
  * Swift 확장이 Swift.org 공식 검증 배포 형태가 되었고,
  * background indexing,
  * 더 정확한 code completion,
  * LLDB 자동 포함,
  * Project Panel,
  * 실시간 DocC preview 같은 기능이 추가되었습니다.
* 빌드 쪽에서는 **macro 기반 프로젝트의 clean build 시간이 크게 개선**되었습니다.
  * `swift-syntax` 의 prebuilt dependency를 활용해,
  * 매번 무거운 매크로 의존성 빌드를 반복하지 않아도 되게 했습니다.
* 진단과 디버깅도 좋아졌습니다.
  * 경고/에러 메시지에 대한 **확장 설명 문서**가 늘어났고,
  * warning을 category별로 error 취급할 수 있게 되어 정책을 더 세밀하게 조정할 수 있습니다.
  * LLDB는 **async 코드 디버깅**을 더 잘 따라가고,
  * task 중심으로 현재 실행 중인 작업을 더 잘 보여주며,
  * Xcode 26에서는 **explicitly built modules** 가 기본 활성화되어 디버거 응답성도 좋아졌습니다.

<br>
## 📚 라이브러리 업데이트

* Swift 6.2는 기본 라이브러리 레벨에서도 꽤 실용적인 변화가 많습니다.

### Subprocess

* 새로운 **Subprocess 패키지**가 추가되었습니다.
* 이제 Swift에서 외부 프로세스를 실행할 때 더 자연스럽게
  * 실행 파일 경로 지정,
  * `$PATH` 기반 실행,
  * exit status 확인,
  * standard output 수집
  같은 작업을 처리할 수 있습니다.
* 스크립팅이나 개발 도구 작성, 로컬 자동화 작업에 특히 유용합니다.

### Foundation 현대화

* NotificationCenter 관련 API가 더 **타입 안전한 형태**로 발전했습니다.
* 기존에는 notification name 문자열과 `userInfo` dictionary에 의존해 실수하기 쉬웠는데,
  이제는 **구체 타입 기반 notification / payload 모델**을 써서
  * 잘못된 notification 등록을 컴파일 단계에서 줄이고,
  * payload 파싱 boilerplate도 줄일 수 있습니다.
* UIKit처럼 main actor가 중요한 환경에서 concurrency 관련 불편도 완화됩니다.

### Observation

* Observation 라이브러리에 **`Observations` 타입**이 추가되었습니다.
* 단일 프로퍼티 감시보다 더 일반적인 방식으로,
  **여러 observable state를 조합한 결과값의 변화를 추적**할 수 있습니다.
* 중요한 점은 업데이트가 **transactional** 하게 처리된다는 것입니다.
  * 여러 속성이 동기적으로 바뀌어도,
  * 중간 불일치 상태를 여러 번 흘려보내지 않고,
  * 일관된 갱신 결과를 AsyncSequence 형태로 다룰 수 있습니다.

### Swift Testing

* Swift Testing도 더 강력해졌습니다.
* **custom attachment** 를 테스트 실패 시 기록할 수 있어,
  CI 같은 원격 환경에서 실패 원인 파악이 쉬워집니다.
* 또 **exit test** 를 지원해,
  precondition 실패처럼 “프로세스가 종료되어야 정상”인 코드도 테스트할 수 있습니다.

<br>
## 🌐 Swift가 더 넓게 쓰이는 방향

* Apple은 Swift가 앱 언어를 넘어서 **소프트웨어 스택 전반의 언어**가 되고 있다는 점을 강조했습니다.

### Embedded Swift

* Embedded Swift는 제한된 환경을 위한 Swift subset으로,
  펌웨어나 커널 같은 저수준 영역까지 Swift를 가져가려는 흐름입니다.
* Apple도 이미 일부 iPhone의 매우 낮은 레벨 소프트웨어에 이를 활용하고 있다고 설명합니다.

### 보안과 시스템 영역

* 보안/시스템 쪽에서도 Swift 채택이 이어지고 있습니다.
* 세션에서는 low-level 보안 컴포넌트와 시스템 프로그래밍 영역에서의 Swift 활용이 소개되며,
  안전성을 유지하면서도 충분히 저수준 제어가 가능하다는 방향을 보여줍니다.

### 서버와 상호운용성

* Swift는 서버 쪽에서도 계속 확장되고 있습니다.
* Java 상호운용을 위한 **swift-java** 프로젝트가 소개되었고,
  Mac에서 Linux 컨테이너 기반 툴을 만들 수 있는 **containerization 라이브러리**도 공개되었습니다.
* 즉 Swift는 이제 앱 클라이언트뿐 아니라,
  **서버·툴링·인프라 영역까지 직접 연결되는 언어**로 포지셔닝되고 있습니다.

### 플랫폼 확장

* Swift 6.2는 **FreeBSD 공식 지원**을 추가했습니다.
* 또 **WebAssembly(Wasm)** 지원도 본격적으로 진전되고 있습니다.
* 세션에서는 Swift 코드가 브라우저에서 3D 모델을 렌더링하는 예시도 보여주며,
  Swift가 브라우저/서버/Wasm 런타임까지 이어질 수 있음을 강조했습니다.

<br>
## ⚡ 성능 관련 언어 진화

* 성능 측면에서 가장 눈에 띄는 키워드는 **InlineArray** 와 **Span** 입니다.

### InlineArray

* `InlineArray` 는 **고정 크기 배열**입니다.
* 기존 `Array` 는 동적 크기 조절을 위해 heap buffer를 사용하지만,
  InlineArray는 요소를 **inline storage** 에 직접 저장합니다.
* 그래서
  * heap allocation을 줄이고,
  * stack 또는 다른 타입 내부에 직접 담을 수 있으며,
  * 크기가 타입의 일부이기 때문에 더 공격적인 최적화도 가능합니다.
* 특히 hot path에서 배열 크기가 고정인 경우 유용합니다.

### Span

* `Span` 은 contiguous memory에 대한 **안전한 직접 접근 추상화**입니다.
* 과거에는 이런 작업을 위해 unsafe pointer로 내려가야 했지만,
  Span은 더 안전한 모델을 제공합니다.
* 핵심은
  * 원본 storage의 lifetime을 컴파일 타임에 추적하고,
  * use-after-free,
  * overlapping modification
  같은 메모리 안전성 문제를 구조적으로 줄인다는 점입니다.
* 즉 고성능 저수준 처리와 Swift의 안전성 철학을 더 잘 연결하려는 변화입니다.

<br>
## 🔄 동시성: 더 자연스럽고 덜 부담스럽게

* Swift 6의 data-race safety는 강력하지만,
  실제 프로젝트에서는 “가장 자연스럽게 쓴 코드”가 자주 에러를 일으킨다는 피드백이 있었습니다.
* Swift 6.2는 이를 반영해 **single-threaded by default에 더 가까운 방향**으로 접근성을 높였습니다.

### async 함수의 실행 방식 변화

* 이제 특정 actor에 묶이지 않은 async 함수도
  **무조건 백그라운드로 튀지 않고, 호출된 actor 위에서 계속 실행**될 수 있습니다.
* 이 변화 덕분에
  * mutable state를 가진 타입의 async 메서드를 더 자연스럽게 호출할 수 있고,
  * “별로 병렬 실행을 원한 것도 아닌데 data race 에러가 나는” 상황을 줄입니다.

### isolated conformance

* main actor 타입이 protocol conformance를 구현할 때의 제약도 완화되었습니다.
* **isolated conformance** 개념으로,
  해당 conformance가 특정 actor에서만 안전하게 쓰인다는 사실을 컴파일러가 이해할 수 있게 되었습니다.
* 그래서 UI 모델처럼 main actor에 묶인 타입이 protocol을 구현할 때 훨씬 현실적인 코드 작성이 가능합니다.

### main actor by default

* 전역/정적 mutable state 문제를 줄이기 위해,
  **main actor by default** 모드가 도입되었습니다.
* 앱처럼 대부분의 코드가 원래 main actor 중심으로 돌아가는 프로젝트에서는
  concurrency annotation 부담을 크게 줄이고,
  global/static 관련 경고도 더 자연스럽게 다룰 수 있습니다.
* 이 기능은 opt-in이며,
  Apple은 앱·스크립트·실행형 타깃에 특히 잘 맞는다고 설명합니다.

### @concurrent

* 반대로 정말로 병렬 실행이 필요할 때는,
  `@concurrent` 로 **명시적으로 concurrent thread pool에 offload** 할 수 있습니다.
* 즉 Swift 6.2의 방향은
  * 기본은 더 자연스럽고 단순하게,
  * 병렬화는 필요할 때 명시적으로
  가져가자는 쪽에 가깝습니다.

<br>
## ✅ 정리

* Swift 6.2는 도구, 라이브러리, 플랫폼, 언어 설계가 **한 방향으로 정리된 업데이트**입니다.
* 개발자 경험 관점에서는
  * VS Code와 build/debug workflow가 좋아졌고,
  * macro 프로젝트 빌드 부담이 줄었으며,
  * 진단 메시지와 테스트 도구가 더 실용적으로 바뀌었습니다.
* 코드 작성 관점에서는
  * Subprocess,
  * 타입 안전한 NotificationCenter,
  * Observations,
  * Swift Testing 강화가 눈에 띕니다.
* 언어와 런타임 관점에서는
  * InlineArray,
  * Span,
  * approachable concurrency,
  * isolated conformance,
  * main actor by default,
  * `@concurrent`
  같은 변화가 핵심입니다.
* 전체적으로 보면 이번 Swift 업데이트는
  **“더 쉽게 쓰게 만들고, 더 넓게 적용하게 만들고, 필요할 때는 더 깊게 최적화하게 만든다”** 는 방향이 아주 분명한 해라고 볼 수 있습니다.
