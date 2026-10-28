# WWDC26 — Profile, fix, and verify: Improve app responsiveness with Instruments

- **Session:** 268
- **Source:** https://developer.apple.com/videos/play/wwdc2026/268/
- **Basis:** Apple Developer 공식 전체 transcript 및 Code 섹션
- **주제:** Instruments 27, Time Profiler, Swift Concurrency, Swift Executors, System Trace, OSSignpost, Run Comparisons

---

## 🎯 한 줄 요약

앱이 끊기거나 멈출 때 바로 코드를 추측해 고치는 대신, **먼저 main thread의 CPU 사용량을 보고 문제를 `CPU saturation`, `execution contention`, `system blocking`으로 분류한 뒤**, Time Profiler·Swift Executors·System Trace를 선택해 원인을 찾고, 수정 전후를 **Run Comparisons**로 정량 검증하는 것이 이 세션의 핵심이다.

---

## 🧭 세션 구성

| 시간 | 내용 |
|---|---|
| 0:00 | Introduction |
| 1:12 | Diagnostic flow |
| 7:06 | Sampling data visualization |
| 16:01 | Execution contention |
| 20:29 | System blocking |
| 26:07 | Next steps |

발표는 하나의 메모 앱에서 발견한 세 가지 문제를 순서대로 해결한다.

1. Lasso selection 중 UI hang
2. Note 목록 스크롤 중 끊김
3. Note 저장 시 Pencil 입력이 잠깐 멈춤

세 문제를 각각 다른 종류의 병목으로 분류하고, 그에 맞는 Instruments 도구를 사용한다.

---

## 🧠 먼저 가져야 할 성능 진단 모델

앱 코드가 실행될 때는 Swift 코드만 존재하는 것이 아니다.

- Swift compiler/runtime이 dynamic dispatch, safety checks, reference counting 등을 삽입한다.
- OS가 memory allocation, process scheduling, I/O routing 등을 담당한다.
- 마지막으로 platform/hardware가 실제 실행을 담당한다.

즉, UI가 멈췄다는 동일한 증상도 실제 원인은 전혀 다를 수 있다. Apple은 먼저 **CPU가 무엇을 하고 있는지** 확인하라고 설명한다.

### Main thread CPU가 높을 때

Main thread가 거의 100%에 가깝게 CPU를 사용한다면 코드는 실제로 계속 실행 중이다.

가능한 해결책:

- 알고리즘/구현을 더 빠르게 최적화
- 피할 수 없는 무거운 작업이라면 background task로 이동

### Main thread CPU가 낮을 때

UI가 멈췄는데 CPU 사용량이 낮다면 코드를 느리게 실행하는 것이 아니라 **thread가 무언가를 기다리고 있을 가능성**이 높다.

대표적인 원인:

- File I/O
- synchronization lock
- IPC(Inter-Process Communication)

이때 Time Profiler만 보면 원인을 놓칠 수 있다. Time Profiler는 active CPU cycles를 중심으로 보여 주기 때문이다.

### 세션 전체의 진단 흐름

```text
UI hang / frame drop
        ↓
Time Profiler로 main thread CPU 확인
        ↓
┌────────────────────┬─────────────────────┐
│ CPU 높음           │ CPU 낮음            │
├────────────────────┼─────────────────────┤
│ 코드가 너무 느림   │ thread가 blocked    │
│ 또는 executor 경합 │                     │
├────────────────────┼─────────────────────┤
│ Top Functions      │ System Trace        │
│ Swift Executors    │ Inspector           │
└────────────────────┴─────────────────────┘
        ↓
수정
        ↓
Run Comparisons / 새 trace로 검증
```

---

## 🎥 반드시 Release build를 프로파일링

Xcode의 **Product > Profile**로 프로파일링을 시작하면 release build가 만들어진다.

Apple은 debug build가 디버깅 편의를 위해 런타임 성능을 희생하므로, debug profiling 결과는 실제 성능과 다를 수 있다고 강조한다.

따라서 성능 분석의 기본 전제는 다음과 같다.

- **Release configuration으로 프로파일링**
- 재현 가능한 동일 workflow 사용
- 가능하면 `OSSignpost`로 분석 구간을 명확하게 표시

Swift Concurrency를 사용하는 앱이라면 Swift Concurrency template를 선택할 수 있고, 그 안에서도 Time Profiler를 함께 사용할 수 있다.

---

## 🏷️ OSSignpost로 문제 구간을 표시

세션에서는 lasso selection 구간을 정확히 찾기 위해 `OSSignposter`를 사용한다.

```swift
import os.signpost

let signposter = OSSignposter(
    subsystem: "Demo App",
    category: .pointsOfInterest
)

var lassoIntervalState: OSSignpostIntervalState? = nil

func lassoSelectionUpdated() {
    lassoIntervalState = signposter.beginInterval("Lasso Selection")
    // Update selection in canvas…
}

func lassoSelectionEnded() {
    // Finalize lasso selection...
    signposter.endInterval("Lasso Selection", lassoIntervalState!)
}
```

`category: .pointsOfInterest`로 지정하면 Instruments가 이 데이터를 **Points of Interest track**에 자동으로 노출한다.

이렇게 하면:

- 사용자 동작과 hang을 정확히 매칭할 수 있고
- 해당 interval만 필터링할 수 있으며
- 이후 Run Comparisons에서도 baseline/optimized trace를 동일 범위로 비교할 수 있다.

성능 비교에서 중요한 것은 전체 trace가 아니라 **동일한 작업 구간을 동일하게 비교하는 것**이다.

---

# 🔥 사례 1 — CPU saturation: Lasso selection

## 문제 확인

Lasso selection 구간에서 Hangs instrument가 여러 hang을 보고한다.

Process track을 펼쳐 main thread를 확인하자 CPU 사용량이 약 **100%**를 유지한다.

이 상황은 main thread가 blocked된 것이 아니라 **계속 실행 중이지만 작업량이 너무 많다**는 뜻이다.

따라서 다음 도구는 **Time Profiler**다.

---

## 📊 Time Profiler가 sampling하는 방식

Time Profiler는 기본적으로 약 **1ms 간격**으로 실행 상태를 sampling한다.

예를 들어 세 번 sampling한다고 가정하면:

```text
Sample 1: main → saveNote
Sample 2: main → renderCanvas → drawStroke
Sample 3: main → renderCanvas
```

각 sample에서 stack에 등장한 함수는 weight를 얻는다.

가장 아래에서 실제 instruction을 실행 중인 함수는 **self weight**도 얻는다.

짧게 실행되고 다음 sample 전에 끝나는 함수는 관찰되지 않을 수도 있다. 예를 들어 `swift_retain` 호출 하나가 sample 사이에서 끝나면 보이지 않는다. 하지만 호출 빈도가 높아질수록 sampling될 가능성이 커진다.

이 sampling 결과가 call tree의 원본 데이터가 된다.

---

## 🌳 Call Tree와 Flame Graph

### Call Tree

Call Tree는 호출 관계를 계층적으로 보여 준다.

장점:

- 어떤 함수가 어떤 경로로 호출됐는지 이해하기 좋음
- 특정 call path를 따라가기에 적합

단점:

- 동일 함수가 여러 경로에서 호출되면 비용이 여러 branch로 분산되어 보임

### Flame Graph

Flame Graph는 call tree를 시각적인 block으로 표현한다.

- **세로축:** call stack, caller가 위쪽, callee가 아래쪽
- **가로 폭:** aggregated CPU time / sample weight
- 넓은 block일수록 더 많은 CPU sample을 차지

중요한 점은 가로축이 chronological timeline이 아니라 **집계된 CPU 시간**이라는 것이다.

Lasso 예제에서는 rendering code의 여러 branch가 조금씩 비싸서 전체적으로 hang을 만든다. 특정 한 branch가 압도적으로 커 보이지 않는다.

---

## 🆕 Instruments 27 — Top Functions

Flame Graph의 약점은 동일 runtime/helper 함수가 많은 call path에 흩어져 있을 때 전체 비용을 파악하기 어렵다는 것이다.

Instruments 27은 이를 위해 **Top Functions** 모드를 추가한다.

Top Functions는:

- call hierarchy를 제거하고
- 같은 함수의 모든 node를 합친 뒤
- **self metric** 기준으로 정렬한다.

즉, “전체 앱에서 실제 instruction을 가장 많이 실행한 함수가 무엇인가?”를 바로 볼 수 있다.

### Lasso 사례의 Top Function

가장 비싼 함수는:

```text
swift_project_boxed_opaque_existential
```

이 Swift runtime 함수는 existential의 underlying value에 접근하기 위해 사용된다.

---

## 🧩 Existential이 왜 비용을 만들었나

예제:

```swift
protocol Foo { }

struct TypeA: Foo { }
struct TypeB: Foo { }

func bar(_ foo: any Foo) {
}
```

`any Foo`는 어떤 concrete type이 들어올지 compile time에 확정되지 않는 existential이다.

가능한 타입의 size/layout이 다르므로 runtime에서 underlying value를 다루기 위한 추가 작업이 필요할 수 있다.

이 예제에서는 그 overhead가 그림 렌더링의 hot path에 충분히 많이 발생해 성능 문제로 나타났다.

Apple이 제시한 대안:

- concrete types
- generics
- 경우에 따라 enums

### Concrete types

```swift
func bar(_ a: TypeA) {
}

func bar(_ b: TypeB) {
}
```

### Generics

```swift
func bar<T: Foo>(_ generic: T) {
}
```

### Enum으로 가능한 타입을 닫기

```swift
enum Foo {
    case a(TypeA)
    case b(TypeB)
}

struct TypeA { }
struct TypeB { }

func bar(_ value: Foo) {
}
```

이 방식들은 compiler에 더 많은 타입 정보를 제공해 최적화 가능성을 높인다.

### 중요한 해석

이 세션의 결론은 **existential은 항상 나쁘다**가 아니다.

정확한 메시지는:

> 프로파일에서 existential runtime overhead가 실제 hot path의 큰 비용으로 확인됐을 때, concrete type/generic/enum이 적절한 대안이 될 수 있다.

즉, 타입 시스템 선택도 반드시 측정 결과를 기반으로 해야 한다.

---

## 📈 Run Comparisons — 수정 효과를 정량 검증

코드를 수정한 다음 “느낌상 빨라졌다”로 끝내지 않는다.

Instruments 27의 **Run Comparisons**는 baseline trace와 optimized trace의 sampling data를 직접 비교한다.

### 동작 방식

- baseline의 함수와 optimized run의 대응 함수를 매칭
- stack의 각 node를 비교
- 실행 비용 delta 계산
- 차이를 기준으로 정렬

시각적으로:

- **Red:** regression
- **Green:** improvement

### 정확한 비교를 위한 조건

두 run을 모두 동일한 `OSSignpost` interval로 필터링한 뒤 비교한다.

Lasso 사례에서는 두 trace 모두 `Lasso Selection` interval만 남기고 main thread를 선택한다.

Comparison 결과는:

- 별도 comparison tab으로 저장
- document 안에 여러 comparison 생성 가능
- textual call tree, flame graph, Top Functions 모두 비교 가능
- 협업 시 trace document에 비교 정보가 같이 보존됨

수정 후 `swift_project_boxed_opaque_existential` 호출이 완전히 사라졌고, 새 generic 관련 함수 일부는 regression처럼 보이지만 전체 improvement가 더 크다는 것을 확인한다.

**핵심:** 새 함수가 생겼다는 사실 자체가 regression의 의미는 아니다. 전체 delta를 보고 판단한다.

---

# ⚙️ 사례 2 — Execution contention: Main Actor 포화

## 문제 상황

노트 목록을 스크롤할 때 UI가 부드럽지 않다.

해당 hang에는 Points of Interest 로그가 없으므로, Main Actor에서 어떤 task가 실행 중인지 확인한다.

Instruments 27의 새 **Swift Executors instrument**는 다음 executor를 timeline에 시각화한다.

- Main Actor
- global concurrent executor
- custom executors

각 hang 구간에서 Main Actor에 `renderThumbnail` task가 수백 ms씩 실행되고 있었다.

---

## 🧵 왜 async인데도 Main Actor를 막았나

Thumbnail rendering 자체는 async 형태로 작성됐지만, **SwiftUI에서 호출된 context를 상속**해 Main Actor에서 실행되고 있었다.

기존 코드:

```swift
let drawingData = note.drawingData
let canvasImages = note.decodeCanvas()

thumbnail = await Task(name: "Render Thumbnail") {
    await renderThumbnail(
        drawingData: drawingData,
        canvasImages: canvasImages,
        size: CGSize(width: 300, height: 240)
    )
}.value
```

`Task { ... }`를 썼다는 이유만으로 자동으로 background executor로 이동하는 것은 아니다.

이 task가 Main Actor context를 상속하면 UI update/input handling과 같은 executor를 경쟁하게 된다.

---

## 🚀 `@concurrent`로 global executor에 이동

공식 수정 코드:

```swift
let drawingData = note.drawingData
let canvasImages = note.decodeCanvas()

thumbnail = await Task(name: "Render Thumbnail") { @concurrent in
    await renderThumbnail(
        drawingData: drawingData,
        canvasImages: canvasImages,
        size: CGSize(width: 300, height: 240)
    )
}.value
```

`@concurrent`를 추가하면 해당 작업을 Main Actor에서 떼어 **global executor**로 이동시킨다.

Swift compiler는 이 변경이 data race를 만들지 않는지 검사한다.

새 trace의 Swift Executors instrument에서는:

- `renderThumbnail` task가 Main Actor track에서 사라지고
- global executor track으로 이동하며
- 여러 thumbnail을 병렬 처리할 수 있게 된다.

결과적으로 UI 이벤트가 Main Actor를 사용할 수 있게 되어 스크롤 hang이 사라진다.

### 중요한 교훈

```text
async ≠ automatically off-main
```

비동기 함수라는 사실만으로 Main Actor의 점유 문제가 해결되는 것은 아니다. 실제 executor placement를 Instruments로 확인해야 한다.

---

# 💾 사례 3 — System blocking: 동기 File I/O

## 증상

Note를 저장할 때 Pencil 입력이 잠깐 멈춘다.

`Writing To File` signpost interval로 해당 구간을 찾는다.

그런데 이번에는 main thread CPU 사용량이 약 **20%**밖에 되지 않는다.

이는 CPU가 느리게 계산 중인 것이 아니라 main thread가 **실행 자체를 못 하고 기다리는 상태**임을 시사한다.

---

## ⏸️ Running → Blocked → Runnable

System Trace를 이해하려면 thread 상태를 구분해야 한다.

### Running

Thread가 실제 CPU core에서 instruction을 실행 중이다.

### Blocked

System call이 어떤 resource를 기다리는 동안 kernel이 thread를 CPU에서 내린다.

이 시간에는 app code가 실행되지 않는다.

### Runnable

Resource는 준비됐지만 scheduler가 아직 CPU core를 할당하지 못한 상태다.

따라서 resource가 준비됐다고 즉시 다시 실행되는 것은 아니다.

### 왜 낮은 CPU 사용률이 오해를 부르나

Thread가 짧게 실행됐다가 오랫동안 blocked되고 다시 잠깐 실행되는 패턴이면 평균 CPU 사용률은 낮게 보인다.

하지만 사용자 관점에서는 main thread가 UI를 처리하지 못하므로 hang이다.

이 상황에서 algorithm optimization은 효과가 없다. **실행 중인 코드가 없기 때문**이다.

---

## 🔬 System Trace + Inspector

System Trace는:

- on-core/off-core 상태
- system calls
- scheduler 상태
- thread blocking

을 보여 준다.

세션에서는 write syscall interval을 선택한다.

시각화에서:

- opaque segment: on-core에서 실제 실행
- translucent segment: off-core에서 blocked

새 Inspector panel을 보면 system call의 실제 argument도 확인할 수 있다.

예제에서는:

- target file descriptor
- buffer memory address
- write size

를 확인한다.

### 발견된 실제 문제

Main thread가 **1.7GB 이상**의 데이터를 write하려 하고 있었다.

단일 operation이:

- 전체 500ms 이상
- 그중 거의 300ms를 off-core 상태에서 disk를 기다림

따라서 CPU 최적화 문제가 아니라 **동기 file write가 main thread를 막은 것**이다.

---

## ❌ 수정 전 — Main Actor의 synchronous write

```swift
let encoder = PropertyListEncoder()
encoder.outputFormat = .binary

guard let data = try? encoder.encode(snapshots) else { return }

let id = signposter.beginInterval("Writing To File")
try? data.write(to: fileURL, options: .atomic)
signposter.endInterval("Writing To File", id)
```

`PropertyListEncoder`로 serialization한 뒤 `data.write(..., .atomic)`을 main thread에서 동기 실행한다.

병목의 핵심은 단순히 `write` API가 느리다는 것이 아니라 **UI thread가 storage completion을 기다려야 하는 구조**다.

---

## ✅ 수정 후 — background concurrent task

```swift
Task { @concurrent in
    let encoder = PropertyListEncoder()
    encoder.outputFormat = .binary

    guard let data = try? encoder.encode(snapshots) else { return }

    let id = signposter.beginInterval("Writing To File")
    try? data.write(to: fileURL, options: .atomic)
    signposter.endInterval("Writing To File", id)
}
```

Serialization과 file write를 concurrent thread pool로 이동시킨다.

새 System Trace에서:

- main thread에는 해당 write syscall이 더 이상 없음
- 같은 syscall이 background thread에 나타남

저장 작업은 계속 수행되지만 UI thread가 그 완료를 기다리지 않아 Pencil interaction이 유지된다.

---

# 🧰 Instruments 27에서 특히 중요한 새 기능

## 🆕 Inspector panel

우측 Inspector는 선택한 timeline/detail item에 맞춰 추가 정보와 action을 보여 준다.

세션에서 실제 활용한 예:

- main thread pinning
- system call argument 확인
- write size 확인
- 선택 구간 zoom/filter

이전처럼 여러 detail view를 오가며 정보를 찾는 대신 선택 객체를 중심으로 원인 분석을 이어갈 수 있다.

## 🆕 Top Functions

Call hierarchy를 무시하고 동일 함수의 self cost를 모두 합친다.

적합한 문제:

- Swift runtime 함수
- allocator/helper
- 여러 branch에서 반복적으로 호출되는 공용 함수
- flame graph에서 비용이 조각나 보이는 함수

## 🆕 Run Comparisons

Baseline과 optimized profile을 동일 document 안에서 비교한다.

적합한 용도:

- 최적화 효과 검증
- 새 regression 파악
- 팀원과 before/after trace 공유
- 느낌이 아닌 measured delta로 판단

## 🆕 Swift Executors instrument

Actor/executor 관점의 contention을 시각화한다.

볼 수 있는 대상:

- Main Actor
- global concurrent executor
- custom executor
- 그 위에서 실행되는 Swift tasks

UI hang과 Swift concurrency가 관련되어 있을 때 단순 thread 관점보다 훨씬 직접적인 설명을 제공한다.

---

# 🔄 세션의 세 문제를 한 표로 정리

| 증상 | Main thread CPU | 실제 원인 | 핵심 도구 | 수정 |
|---|---:|---|---|---|
| Lasso hang | 약 100% | existential runtime overhead가 hot path에 누적 | Time Profiler → Top Functions | concrete types / generics |
| Note list 스크롤 끊김 | 약 100% | thumbnail task가 Main Actor를 점유 | Swift Executors | `Task { @concurrent in ... }` |
| Save 시 UI freeze | 약 20% | synchronous 1.7GB file write, disk wait | System Trace + Inspector | encoding/write를 background task로 이동 |

세 사례는 “UI가 멈춘다”는 동일한 사용자 증상도 실제 해결법은 전혀 다르다는 것을 보여 준다.

---

# 📋 실무 프로파일링 체크리스트

## 재현 준비

- [ ] Release build로 Profile 실행
- [ ] 문제를 재현하는 사용자 workflow를 짧고 명확하게 정의
- [ ] 반복 가능한 동작에 `OSSignposter` interval 추가
- [ ] `.pointsOfInterest` category를 활용해 Instruments에서 쉽게 찾기
- [ ] 수정 전 baseline trace 저장

## Hang이 발생했을 때

- [ ] 먼저 Time Profiler에서 main thread CPU 사용량 확인
- [ ] CPU가 높으면 active work / saturation을 의심
- [ ] CPU가 낮으면 blocking / system wait를 의심
- [ ] Main Actor task가 원인인지 Swift Executors로 확인
- [ ] File I/O / syscall / lock 대기는 System Trace로 전환

## CPU가 높을 때

- [ ] Flame Graph로 큰 call path 확인
- [ ] 여러 branch에 비용이 흩어지면 Top Functions 확인
- [ ] self weight가 큰 runtime/helper 함수 확인
- [ ] existential, ARC, allocation 등 runtime overhead가 실제 병목인지 측정
- [ ] 최적화 후 동일 signpost interval로 다시 capture

## Swift Concurrency

- [ ] `Task {}`가 어느 actor/executor를 상속하는지 확인
- [ ] UI와 무관한 CPU-heavy task가 Main Actor에 남아 있지 않은지 확인
- [ ] 필요 시 `@concurrent`로 global executor 이동 검토
- [ ] compiler의 isolation/data-race diagnostics 확인
- [ ] executor 이동 후 병렬성이 실제로 개선됐는지 trace에서 확인

## System blocking

- [ ] System Trace에서 on-core / off-core 구간 비교
- [ ] Inspector에서 syscall arguments 확인
- [ ] main thread의 synchronous file/network/IPC 작업 검색
- [ ] CPU 사용률이 낮다는 이유로 성능 문제가 없다고 판단하지 않기
- [ ] background로 옮긴 뒤 main thread에서 syscall이 사라졌는지 재검증

## 수정 검증

- [ ] Baseline과 optimized run의 동일 interval 필터링
- [ ] Run Comparisons 생성
- [ ] Call Tree/Flame Graph/Top Functions 모두 필요에 따라 확인
- [ ] Green improvement뿐 아니라 새 Red regression도 검토
- [ ] 개별 함수가 아닌 전체 workflow latency도 함께 확인
- [ ] 실제 앱에서 interaction 체감까지 마지막으로 확인

---

# ⚠️ 오해하기 쉬운 포인트

## “CPU가 낮으니 성능 문제는 아니다”

틀린 판단이다. 낮은 CPU는 thread가 blocked되어 아무 일도 못 하고 있다는 뜻일 수 있다.

## “async면 Main Actor를 막지 않는다”

틀릴 수 있다. Task가 actor context를 상속하면 async 작업도 Main Actor에서 오래 실행될 수 있다.

## “Flame Graph만 보면 가장 비싼 함수가 보인다”

항상 그렇지는 않다. 동일 함수가 다양한 call path에 흩어지면 비용이 조각나므로 Top Functions가 더 적합하다.

## “최적화 후 앱이 빨라 보이면 성공이다”

세션의 방식은 반드시 baseline과 optimized run을 비교해 성능 delta를 확인하는 것이다.

## “Existential은 느리므로 사용하면 안 된다”

그렇게 일반화할 수 없다. 이 세션에서는 profiling 결과 특정 hot path에서 existential projection이 실제 top cost였기 때문에 대체한 것이다.

---

# 🧠 핵심 메시지

이 세션이 강조하는 것은 특정 Instruments 기능 하나가 아니라 **진단 순서 자체**다.

1. **Profile** — 증상을 정확히 capture한다.
2. **Classify** — main thread CPU 상태로 active work인지 blocking인지 구분한다.
3. **Choose the right view/tool** — Top Functions, Swift Executors, System Trace 등 원인에 맞는 도구를 사용한다.
4. **Fix** — 알고리즘 최적화, executor 이동, blocking I/O 이동 등 원인에 맞게 수정한다.
5. **Verify** — Run Comparisons와 새 trace를 사용해 수정이 실제 improvement인지 확인한다.

Apple의 마지막 메시지는 명확하다.

**성능 문제를 추측하지 말고, 데이터를 따라가라.**

---

# 🔗 함께 보면 좋은 세션과 자료

- **WWDC26 — Profile, fix, and verify: Improve app responsiveness with Instruments**  
  https://developer.apple.com/videos/play/wwdc2026/268/
- **WWDC25 — Optimize CPU performance with Instruments**
- **WWDC25 — Embracing Swift concurrency**
- **WWDC23 — Analyze hangs with Instruments**
- **WWDC22 — Embrace Swift generics**
- Apple Developer Documentation — *Analyzing CPU profiles with call tree views*
