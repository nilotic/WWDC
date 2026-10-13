# WWDC26 Meet the new MetricKit 요약

- Session: 222
- Title: Meet the new MetricKit
- Source: https://developer.apple.com/videos/play/wwdc2026/222/
- Topic: MetricKit, StateReporting, performance metrics, diagnostics, crashes, hangs, memory, Metal frame rate, app state, server aggregation
- Chapters: Introduction, Metrics, Diagnostics, Context

---

## 한 줄 요약

iOS 27의 MetricKit은 **현실 사용 환경의 성능 지표와 문제 진단을 Swift-first API로 수집하고, StateReporting이 제공하는 앱 상태와 교차해 “어디서·어떤 조건에서 성능이 나빠졌는가”까지 분석할 수 있도록 재설계**되었다.

---

## 핵심 요약

MetricKit은 실제 사용자의 실제 기기에서 앱 성능을 모니터링하기 위한 프레임워크다.

Apple이 제시하는 성능 개선 흐름은 다음과 같다.

```text
Collect
  ↓
Analyze
  ↓
Identify problem
  ↓
Triage
  ↓
Find root cause
  ↓
Fix
  ↓
Monitor again
```

MetricKit은 이 흐름에서 **collection**을 담당한다.

MetricKit이 제공하는 데이터는 크게 두 가지다.

- **Metrics**: 앱 성능이 전체적으로 좋아지고 있는지 나빠지고 있는지 보여주는 건강 지표
- **Diagnostics**: crash, hang 같은 특정 문제를 일으킨 코드 경로를 추적할 수 있는 진단 정보

그리고 iOS 27에서는 여기에 **StateReporting**을 결합해 metric과 diagnostic을 앱의 실제 상태와 연결할 수 있다.

---

# 🆕 iOS 27의 새로운 MetricKit

Apple은 iOS 27에서 MetricKit을 **ground-up rewrite**했다고 설명한다.

핵심 변화는 다음과 같다.

- 새로운 Swift-first API
- `MetricManager`
- `AsyncSequence` 스타일의 report 전달
- richer contextual data
- StateReporting integration
- 새로운 Metal frame rate metric
- 새로운 memory exception diagnostics
- crash diagnostic의 `terminationCategory`
- state-aware metric aggregation

Apple은 이 새로운 API가 MetricKit의 미래라고 명시하며, 세션에서 소개하는 새로운 기능들은 모두 새 API에서만 제공된다고 설명한다.

기존 `MXMetricManager`를 사용하고 있다면 새로운 `MetricManager` API로 migration하는 것이 권장된다.

---

# 📈 Metrics와 Diagnostics의 역할 차이

두 데이터 타입은 같은 문제를 서로 다른 각도에서 본다.

## Metrics

Metrics는 다음 질문에 답한다.

```text
"우리 앱의 성능은 전반적으로 좋아지고 있는가?"
```

예:

- launch time
- hangs
- animation smoothness
- CPU usage
- GPU usage
- memory
- disk writes
- network transfers
- Metal frame rate

Metrics는 많은 사용자의 데이터를 aggregation해 추세를 보는 데 적합하다.

## Diagnostics

Diagnostics는 다음 질문에 답한다.

```text
"문제가 발생한 정확한 코드 경로는 어디인가?"
```

예:

- crash diagnostic
- hang diagnostic
- memory exception diagnostic

Diagnostics에는 backtrace와 termination metadata처럼 triage에 직접 사용할 수 있는 정보가 포함된다.

---

# 🚀 Responsiveness Metrics

MetricKit은 앱 responsiveness를 보여주는 다양한 metric을 제공한다.

대표적으로:

- launch time
- hangs
- animation metrics

Apple은 launch time을 예로 든다.

빠른 launch는 사용자를 앱의 핵심 경험으로 빠르게 진입시키지만 느린 launch는 사용자를 이탈시킬 수 있다.

MetricKit의 **time to first draw** metric은 launch 시간을 histogram으로 제공한다.

예를 들어 하루 동안 발생한 launch가 다음 bucket에 분포할 수 있다.

```text
480–510 ms
510–540 ms  ← 대부분
540–570 ms
570–600 ms
```

단순 평균값 하나가 아니라 distribution을 볼 수 있기 때문에 outlier까지 확인할 수 있다.

---

# ⚙️ Resource Consumption Metrics

MetricKit은 앱이 시스템 리소스를 얼마나 사용하는지도 보여준다.

대표적인 metric group:

- CPU
- GPU
- Memory
- Disk writes
- Network transfers
- Display

이 값은 단순 성능뿐 아니라 device health와도 연결된다.

예를 들어 CPU나 GPU를 과도하게 사용하면:

- battery consumption 증가
- thermal pressure 증가
- sustained performance 저하

등으로 이어질 수 있다.

---

# 📊 Metric에서 직접 파생 지표 만들기

MetricKit이 모든 분석 값을 직접 제공하는 것은 아니다.

MetricKit 데이터에서 별도의 지표를 계산할 수도 있다.

세션 예제:

```text
Total hang time = 3 seconds
App use duration = 30 minutes
```

이를 시간당으로 환산하면:

```text
Average hang rate = 6 seconds/hour
```

이 값을 여러 기기에서 aggregation하면 앱 버전별 성능 trend를 추적할 수 있다.

즉 MetricKit report는 최종 분석 결과라기보다 **server-side analytics의 원재료**에 가깝다.

---

# 🎮 새 Metal Frame Rate Metric

iOS 27 MetricKit에는 **Metal frame rate**가 새 metric으로 추가된다.

게임 개발자가 실제 사용 환경에서 render performance를 확인하기 위한 핵심 지표다.

이 metric은 다음과 같은 질문을 분석하는 데 도움이 된다.

```text
특정 버전에서 frame rate가 떨어졌는가?

특정 device family에서만 문제가 있는가?

특정 game state에서 frame rate가 떨어지는가?
```

StateReporting과 결합하면 마지막 질문까지 분석할 수 있다.

---

# 📦 Metric Report 전달 방식

사용자가 하루 동안 앱을 사용하는 동안 MetricKit은 다음 데이터를 지속적으로 수집한다.

- launches
- hangs
- memory
- CPU
- 기타 performance metrics

이 데이터는 **daily report** 형태로 앱에 전달된다.

Report 내부에는 두 종류의 interval entry가 있다.

```text
MetricReport
├─ Full-day aggregated entry
└─ Smaller interval entries
   ├─ 몇 시간 단위
   ├─ metric이 존재할 때만 생성
   └─ 더 세밀한 분석에 사용
```

각 interval 안에서는 metric이 group으로 정리된다.

예:

```text
.cpu
.memory
.display
.gpu
```

각 group 안에 개별 metric이 존재한다.

---

# 🧩 `MetricManager`로 Metrics 수신

새 API의 entry point는 `MetricManager`다.

Apple 예제:

```swift
import MetricKit

let manager = MetricManager()

for await report in manager.metricReports {
    processReport(report)
}
```

중요한 운영 포인트가 있다.

## 앱 시작 시 바로 subscribe

Apple은 report stream subscription을 **앱 startup 시점에 구성**할 것을 권장한다.

이유는 subscription이 늦어질 경우 데이터 손실 가능성이 있기 때문이다.

## `MetricManager`를 계속 유지

`MetricManager` instance를 살아 있게 유지해야 이후 report도 stream으로 계속 전달된다.

따라서 일시적인 local variable보다 전용 service object나 app-level long-lived object로 관리하는 것이 적합하다.

---

# 🌐 Report를 서버로 보내기

실제 앱에서는 한 기기의 report만 보는 것보다 여러 기기의 데이터를 aggregation하는 것이 중요하다.

`MetricReport`는 `Codable`이다.

따라서 JSON으로 바로 변환할 수 있다.

```swift
import MetricKit

for await report in manager.metricReports {
    let jsonData = try JSONEncoder().encode(report)
    sendToServer(jsonData)
}
```

이를 통해 서버에서 다음과 같은 분석을 구성할 수 있다.

- 앱 버전별 비교
- 기기별 비교
- OS 버전별 비교
- release 전후 regression 분석
- percentile 계산
- long-term trend monitoring

---

# 🔎 특정 Metric만 직접 읽기

전체 report를 서버로 보내지 않고 앱에서 특정 metric만 접근할 수도 있다.

Apple 예제는 memory group에서 `peakMemory`를 추출한다.

```swift
import MetricKit

for await report in manager.metricReports {
    let intervalEntries = report.intervalEntries
    let fullDayEntry = intervalEntries.fullDayEntry

    for entry in intervalEntries {
        let memoryMetrics = entry.values.filter { $0.metricGroup == .memory }
        for metric in memoryMetrics {
            switch metric {
            case .peakMemory(let peak):
                processPeakMemory(peak)
            default:
                break
            }
        }
    }
}
```

구조는 다음과 같다.

```text
MetricReport
  ↓
intervalEntries
  ↓
entry.values
  ↓
metricGroup filter
  ↓
switch metric case
  ↓
concrete value
```

Apple은 이러한 처리 작업을 앱 startup 후 **detached task 또는 dedicated service class**에서 수행할 것을 권장한다.

---

# 📊 Metric 분석은 Data Science 문제

여러 기기에서 전달된 metric을 aggregation하는 것은 단순 로그 저장 문제가 아니다.

Apple은 이를 명확히 **data science problem**이라고 설명한다.

서버에서는 분석 목적에 따라 적절한 statistical analysis를 결정해야 한다.

예:

- mean
- median
- percentile
- histogram distribution
- rate
- version-to-version change
- device segmentation

먼저 baseline을 만든 다음 이후 metric이 개선되는지 악화되는지 모니터링한다.

---

# 🩺 Diagnostics

Metric이 문제의 존재를 알려준다면 diagnostic은 문제의 원인을 찾는 데 사용한다.

앱에 문제가 발생하면 시스템이 device에서 diagnostic을 capture한다.

예:

- crash
- hang
- memory exception

Diagnostic report는 MetricKit을 통해 앱에 **즉시 전달**된다.

Daily metric report와 달리 특정 문제가 발생한 직후 triage에 사용할 수 있는 데이터라는 점이 중요하다.

---

# 💥 Crash Diagnostics

Crash diagnostic에는 단순 crash 발생 사실보다 훨씬 많은 정보가 포함된다.

대표적으로:

- backtrace
- termination reason
- exception type
- termination category

Backtrace를 symbolicate하면 crash 당시 실제 코드 호출 흐름을 확인할 수 있다.

세션 예에서는 execution path를 따라 내려가다가 앱의 다음 함수에서 멈춘다.

```text
submitReport()
```

즉 이 함수가 crash site로 식별되고 이 지점을 중심으로 수정할 수 있다.

---

# 🆕 Crash `terminationCategory`

iOS 27 crash diagnostic에는 새로운 **termination category**가 추가된다.

이 값은 각각의 crash가 MetricKit metric에서 어떤 termination category로 집계되었는지를 연결해 준다.

예를 들어 aggregation 결과에서:

```text
Abnormal terminations ↑
```

라는 trend를 발견했다면 해당 category와 연결된 individual diagnostic들을 추적할 수 있다.

즉:

```text
Metric regression
    ↓
terminationCategory
    ↓
matching diagnostics
    ↓
backtrace
    ↓
root cause
```

처럼 metric과 diagnostic을 연결할 수 있다.

---

# 🧠 Memory Exception Diagnostics

iOS 27 MetricKit은 **memory exception diagnostics**를 새로 제공한다.

앱 또는 extension이 memory limit을 초과해 종료되었을 때 더 구체적인 진단 정보를 받을 수 있다.

이 기능은 peak memory metric과 함께 사용하면 특히 유용하다.

```text
Peak memory trend 증가
      +
Memory exception diagnostic
      ↓
실제 종료 문제 조사
```

---

# 📥 Diagnostics 수신

Metrics와 거의 동일한 방식으로 `diagnosticReports`를 await한다.

```swift
import MetricKit

let manager = MetricManager()

for await report in manager.diagnosticReports {
    processReport(report)
}
```

이 stream 역시 앱 시작 시 가능한 빨리 subscribe하는 것이 권장된다.

Metrics와 diagnostics를 하나의 전용 monitoring service에서 관리하는 구조가 자연스럽다.

---

# 🌐 Diagnostic Report 서버 전송

`DiagnosticReport` 역시 `Codable`이다.

```swift
import MetricKit

for await report in manager.diagnosticReports {
    let jsonData = try JSONEncoder().encode(report)
    sendToServer(jsonData)
}
```

서버에서 symbolication과 grouping을 수행하면 동일 crash signature를 묶어 분석할 수 있다.

---

# 🔬 Diagnostic 종류별 처리

Structured diagnostic report는 종류별로 직접 처리할 수도 있다.

```swift
import MetricKit

for await report in manager.diagnosticReports {
    switch report.result {
    case .crash(let crash):
        let backtrace = crash.callStackTree
        let reason = crash.terminationReason
        let category = crash.terminationCategory
        processCrash(
            backtrace: backtrace,
            reason: reason,
            category: category
        )

    case .hang(let hang):
        processHangDiagnostic(hang)

    default:
        break
    }
}
```

이렇게 하면 diagnostic type마다 별도의 processing pipeline을 구성할 수 있다.

---

# 🧭 왜 Context가 필요한가

Metrics와 diagnostics만으로는 앱 전체의 평균적인 상태만 보일 수 있다.

하지만 실제 성능 문제는 특정 화면이나 특정 설정에서만 발생할 수 있다.

예를 들어 expense reporting 앱이 있다고 하자.

앱에는:

- Reports tab
- Spending tab

이 있다.

전체 scroll hitch metric만 보면:

```text
Total hitch time = 4.5 sec
Scrolling time = 5 min
Hitch rate = 15 ms/s
```

이라는 평균값만 나온다.

하지만 이 값은 두 tab을 모두 섞은 결과다.

어느 tab이 문제인지 알 수 없다.

---

# 🏷️ StateReporting Framework

이 문제를 해결하기 위해 iOS 27 MetricKit은 **StateReporting**과 연결된다.

State는 앱의 configuration이나 behavior를 설명하는 개발자 정의 정보다.

예:

```text
Active tab = Reports
Active tab = Spending
Experiment = Enabled
Experiment = Disabled
List size = Large
Sorting = Enabled
```

앱이 상태 변경을 report하면 MetricKit은 metric과 diagnostic을 해당 state와 교차할 수 있다.

---

# 📉 State-aware Metric의 효과

전체 average:

```text
Scroll hitch rate = 15 ms/s
```

StateReporting 적용 후:

```text
Spending tab = 1 ms/s
Reports tab  = 71 ms/s
```

이제 결론이 완전히 달라진다.

```text
Spending tab → 정상
Reports tab  → 심각한 hitch
```

따라서 optimization effort를 Reports tab에 집중할 수 있다.

이것이 StateReporting integration의 가장 중요한 목적이다.

---

# 🗂️ Domain

State는 **domain**에 속한다.

Domain은 앱의 특정 기능이나 영역을 설명한다.

한 domain에서는 한 번에 하나의 state만 active할 수 있다.

예:

```text
Domain: tabs
Active state: Reports
```

이후 사용자가 Spending으로 이동하면:

```text
Domain: tabs
Active state: Spending
```

이전 state를 별도로 end하지 않는다.

새 state로 transition하면 된다.

---

# 🔀 여러 Domain을 동시에 사용

서로 다른 관심사를 separate domain으로 분리하면 여러 state가 동시에 active할 수 있다.

세션 예:

```text
Domain A: tab
- Reports
- Spending

Domain B: database batch experiment
- SmallBatch
- LargeBatch
```

이 구조에서는 MetricKit이 다음을 각각 분석할 수 있다.

```text
Reports vs Spending
Small batch vs Large batch
```

두 dimension을 하나의 거대한 state enum으로 합칠 필요가 없다.

---

# 🔄 State는 Transition Model

StateReporting은 start/end event pair 모델이 아니다.

앱은 단순히 현재 상태가 무엇인지 report한다.

```text
Reports
  ↓ transition
Spending
  ↓ transition
Reports
```

MetricKit은 각 state가 얼마 동안 유지되었는지를 추적한다.

따라서 다음처럼 이벤트를 일일이 pair로 관리할 필요가 없다.

```text
startReports()
endReports()
```

대신:

```text
"현재 Reports 상태"
```

를 report한다.

---

# 🧩 StateReporting 기본 코드

먼저 framework를 import한다.

```swift
import MetricKit
import StateReporting
```

Domain을 생성한다.

Apple은 일반적으로 reverse-DNS style identifier를 사용한다.

```swift
let domain = StateReportingDomain(
    "com.metrickitsample.tabs"
)
```

그 다음 `MetricManager`를 생성할 때 사용할 domain을 등록한다.

```swift
let manager = MetricManager(
    enabledStateReportingDomains: [domain]
)
```

그리고 reporter를 얻는다.

```swift
let reporter = StateReporter.reporter(
    for: domain.rawValue
)
```

상태 변경 시 transition을 report한다.

```swift
reporter.reportTransition(to: "Reports")
```

---

# 🧱 Structured Metadata

State label만으로 정보가 부족하다면 structured metadata를 추가할 수 있다.

세션의 expense app에서는 Reports 화면에 대해 다음 정보가 필요하다.

- list size
- sorted 여부

이를 `@ReportableMetadata` macro로 정의한다.

```swift
import StateReporting

@ReportableMetadata
struct ViewConfiguration {
    let listSize: String
    let isSorted: Bool
}
```

그 다음 해당 type을 사용하는 reporter를 만든다.

```swift
let reporter = StateReporter.reporter(
    for: domain.rawValue,
    stableMetadata: ViewConfiguration.self
)
```

Transition할 때 metadata도 함께 전달한다.

```swift
reporter.reportTransition(
    to: "Reports",
    stableMetadata: ViewConfiguration(
        listSize: "large",
        isSorted: false
    )
)
```

이렇게 하면 같은 Reports state 안에서도 실제 UI configuration을 더 세밀하게 이해할 수 있다.

---

# 📦 `stateEntries`

StateReporting을 사용하지 않는 경우 metric report는 broad metrics를 제공한다.

State를 report하기 시작하면 `MetricReport`에 `StateEntry`가 추가된다.

```text
MetricReport
├─ intervalEntries
└─ stateEntries
```

`stateEntries`에는 각 state에서 머문 시간 동안 aggregation된 metric이 포함된다.

따라서 동일 metric을 두 관점에서 볼 수 있다.

```text
시간 interval 기준
vs
앱 state 기준
```

---

# 🌐 State 기준 JSON Encoding

서버로 데이터를 보낼 때 state reporting domain별로 report를 group할 수 있다.

```swift
import MetricKit

for await report in manager.metricReports {
    let encoder = JSONEncoder()

    let formatKey = MetricReport.encodingFormatKey
    encoder.userInfo[formatKey] =
        MetricReport.EncodingFormat.byStateReportingDomain

    let jsonData = try encoder.encode(report)
    sendToServer(jsonData)
}
```

이 format을 사용하면 encoded report 안에서 interval entry와 state entry가 domain/state 기준으로 정리된다.

서버 analytics pipeline에서 state dimension을 해석하기가 쉬워진다.

---

# 🧪 Experiment 분석에도 활용 가능

StateReporting은 화면 구분만을 위한 기능이 아니다.

세션에서는 database fetch batch size experiment를 예로 든다.

```text
Experiment OFF
→ Large batches

Experiment ON
→ Small batches
```

이를 별도 domain으로 두면 실제 production device에서 두 조건의 성능 metric을 비교할 수 있다.

즉 StateReporting은 다음에도 사용할 수 있다.

- A/B testing
- feature flag
- rendering mode
- caching strategy
- list size category
- data source mode
- experimental implementation

단, 이후 best practice에서 설명하듯 state를 지나치게 세분화하면 안 된다.

---

# ⚠️ State 설계 Best Practices

Apple은 StateReporting을 사용할 때 몇 가지 중요한 원칙을 제시한다.

## Domain은 좁고 명확하게

Domain은 앱의 특정 area나 concern을 표현해야 한다.

좋은 예:

```text
navigation-tab
network-mode
rendering-mode
experiment-batch-size
```

너무 많은 서로 다른 의미를 하나의 domain에 넣지 않는다.

## State는 안정적이고 의미 있는 phase

State transition은 transient UI event가 아니라 **stable meaningful phase**여야 한다.

피해야 할 예:

```text
buttonTapped
animationStarted
cellAppeared
```

더 적합한 예:

```text
Reports tab active
Editing mode
Large dataset loaded
Experiment enabled
```

## Regression을 발견했을 때 원인을 좁힐 수 있어야 함

State는 이후 performance regression이 나타났을 때 investigation 방향을 줄 수 있어야 한다.

## State가 너무 많아도 문제

State를 과도하게 세분화하면 data가 지나치게 sparse해지고 해석하기 어려워진다.

Apple은 overhead를 제한하기 위해 state 수에도 upper limit이 있다고 설명한다.

따라서 가능한 모든 값을 metric dimension으로 넣는 방식은 피해야 한다.

---

# 🔬 Points of Interest Instrument로 검증

StateReporting을 production에 넣기 전에 Instruments의 **Points of Interest** instrument로 실제 transition을 검증할 수 있다.

확인해야 할 것:

```text
예상한 시점에 transition이 발생하는가?

state가 너무 짧게 유지되지 않는가?

누락된 transition은 없는가?

동시에 활성화된 domain이 의도한 구조인가?
```

즉 StateReporting instrumentation 자체도 profiling 대상으로 취급해야 한다.

---

# 🏗️ 권장 아키텍처

세션 내용에서 자연스럽게 구성되는 구조는 다음과 같다.

```text
App startup
   ↓
PerformanceMonitoringService
   ├─ MetricManager
   │   ├─ metricReports AsyncSequence
   │   └─ diagnosticReports AsyncSequence
   │
   ├─ StateReporting domains
   │   ├─ UI state
   │   └─ experiment/configuration state
   │
   └─ Analytics uploader
       └─ JSON / Codable
```

MetricKit processing을 UI layer에 흩어놓는 것보다 dedicated service로 분리하는 것이 report stream lifetime 관리와 server upload에 적합하다.

---

# 🔁 MetricKit을 이용한 전체 Performance Workflow

```text
Real-world Devices
       ↓
MetricKit Collection
       ↓
┌───────────────┬────────────────┐
│ Metrics       │ Diagnostics    │
│ trend         │ root cause     │
└───────────────┴────────────────┘
       ↓
StateReporting Context
       ↓
Server Aggregation
       ↓
Regression Detection
       ↓
Diagnostic Triage
       ↓
Fix
       ↓
Release
       ↓
Monitor Again
```

MetricKit의 가치는 한 번 report를 보는 것이 아니라 이 cycle을 지속하는 데 있다.

---

# 📋 구현 체크리스트

## MetricManager

- [ ] 기존 `MXMetricManager` 사용 여부 확인
- [ ] iOS 27 새 `MetricManager` migration 검토
- [ ] 앱 startup 시 manager 생성
- [ ] `metricReports` stream 즉시 subscribe
- [ ] `diagnosticReports` stream 즉시 subscribe
- [ ] manager lifetime을 앱 lifetime과 맞춤
- [ ] UI thread를 막지 않는 processing 구조 구성

## Metrics

- [ ] Launch time 수집
- [ ] Hang metric 수집
- [ ] CPU 확인
- [ ] GPU 확인
- [ ] Memory 확인
- [ ] Disk write 확인
- [ ] Network transfer 확인
- [ ] Metal app/game이면 frame rate metric 검토
- [ ] histogram을 단순 average로 축소하지 않기
- [ ] 필요한 파생 rate 정의

## Server Pipeline

- [ ] `MetricReport` JSON encoding
- [ ] `DiagnosticReport` JSON encoding
- [ ] 앱 버전 저장
- [ ] OS version dimension 설계
- [ ] device segmentation 설계
- [ ] baseline 정의
- [ ] percentile 및 histogram 분석
- [ ] regression threshold 정의
- [ ] release 전후 비교

## Diagnostics

- [ ] Crash diagnostic 처리
- [ ] Hang diagnostic 처리
- [ ] Memory exception diagnostic 처리
- [ ] Backtrace symbolication pipeline 준비
- [ ] termination reason 저장
- [ ] exception type 저장
- [ ] `terminationCategory` 저장
- [ ] metric regression과 diagnostic category 연결

## StateReporting

- [ ] Performance 문제를 설명할 실제 state 후보 정의
- [ ] Domain을 concern별로 분리
- [ ] Domain identifier naming 규칙 정의
- [ ] `MetricManager`에 domain 등록
- [ ] `StateReporter` 생성
- [ ] meaningful phase에서만 transition report
- [ ] transient UI event를 state로 사용하지 않기
- [ ] 필요한 경우 `@ReportableMetadata` 사용
- [ ] metadata cardinality가 과도하지 않은지 확인
- [ ] `stateEntries` server 분석 지원
- [ ] `byStateReportingDomain` encoding 검토

## Validation

- [ ] Points of Interest instrument로 state transition 검증
- [ ] 실제 navigation flow 테스트
- [ ] 앱 background/foreground 전환 검증
- [ ] experiment state 전환 검증
- [ ] state 수가 지나치게 많지 않은지 검토
- [ ] state별 sample size가 충분한지 확인

---

# ⚠️ 구현 시 주의할 점

## MetricKit report는 analytics 결과가 아니다

MetricKit은 raw/structured performance data를 제공한다.

여러 device를 aggregation하고 통계적으로 해석하는 것은 별도의 server analytics 문제다.

## 평균만 보면 문제를 놓칠 수 있다

세션의 scroll hitch 예처럼 전체 평균은 특정 화면의 심각한 regression을 숨길 수 있다.

```text
Overall = 15 ms/s
Spending = 1 ms/s
Reports = 71 ms/s
```

따라서 meaningful state dimension이 중요하다.

## StateReporting을 analytics event system처럼 쓰지 않는다

모든 tap이나 animation을 state로 만들면 안 된다.

State는 일정 시간 유지되는 meaningful condition이어야 한다.

## State cardinality를 통제한다

metadata 값을 무제한으로 만들면 state data가 너무 잘게 나뉘어 의미 있는 aggregation이 어려워진다.

## Manager subscription을 늦추지 않는다

Apple은 startup 시점에 report streams를 listening하도록 권장한다.

## Diagnostic은 symbolication pipeline까지 고려한다

Backtrace 자체만 서버에 저장하고 symbolication이 없다면 triage 가치가 크게 줄어든다.

---

# 🎯 코드 모음

## Metric report 수신

```swift
import MetricKit

let manager = MetricManager()

for await report in manager.metricReports {
    processReport(report)
}
```

## Metric report 서버 전송

```swift
import MetricKit

for await report in manager.metricReports {
    let jsonData = try JSONEncoder().encode(report)
    sendToServer(jsonData)
}
```

## Peak memory 읽기

```swift
import MetricKit

for await report in manager.metricReports {
    let intervalEntries = report.intervalEntries
    let fullDayEntry = intervalEntries.fullDayEntry

    for entry in intervalEntries {
        let memoryMetrics = entry.values.filter {
            $0.metricGroup == .memory
        }

        for metric in memoryMetrics {
            switch metric {
            case .peakMemory(let peak):
                processPeakMemory(peak)
            default:
                break
            }
        }
    }
}
```

## Diagnostic report 수신

```swift
import MetricKit

let manager = MetricManager()

for await report in manager.diagnosticReports {
    processReport(report)
}
```

## Diagnostic report 서버 전송

```swift
import MetricKit

for await report in manager.diagnosticReports {
    let jsonData = try JSONEncoder().encode(report)
    sendToServer(jsonData)
}
```

## Diagnostic 종류별 처리

```swift
import MetricKit

for await report in manager.diagnosticReports {
    switch report.result {
    case .crash(let crash):
        let backtrace = crash.callStackTree
        let reason = crash.terminationReason
        let category = crash.terminationCategory

        processCrash(
            backtrace: backtrace,
            reason: reason,
            category: category
        )

    case .hang(let hang):
        processHangDiagnostic(hang)

    default:
        break
    }
}
```

## StateReporting 시작

```swift
import MetricKit
import StateReporting

let domain = StateReportingDomain(
    "com.metrickitsample.tabs"
)

let manager = MetricManager(
    enabledStateReportingDomains: [domain]
)

let reporter = StateReporter.reporter(
    for: domain.rawValue
)

reporter.reportTransition(to: "Reports")
```

## Structured metadata

```swift
import StateReporting

@ReportableMetadata
struct ViewConfiguration {
    let listSize: String
    let isSorted: Bool
}

let reporter = StateReporter.reporter(
    for: domain.rawValue,
    stableMetadata: ViewConfiguration.self
)

reporter.reportTransition(
    to: "Reports",
    stableMetadata: ViewConfiguration(
        listSize: "large",
        isSorted: false
    )
)
```

## State 기준 JSON encoding

```swift
import MetricKit

for await report in manager.metricReports {
    let encoder = JSONEncoder()

    let formatKey = MetricReport.encodingFormatKey
    encoder.userInfo[formatKey] =
        MetricReport.EncodingFormat.byStateReportingDomain

    let jsonData = try encoder.encode(report)
    sendToServer(jsonData)
}
```

---

# 🧠 세션이 전달하는 핵심 구조

이번 MetricKit 개편의 가장 중요한 변화는 API 문법이 Swift답게 바뀐 것만이 아니다.

이전처럼 앱 전체의 성능을 하나의 숫자로 보는 방식에서 벗어나 다음 세 단계를 연결한다.

```text
Metrics
"문제가 있는가?"

Diagnostics
"어떤 코드에서 문제인가?"

StateReporting
"어떤 사용자 흐름과 설정에서 문제인가?"
```

세 가지를 조합하면 단순히 "scroll performance가 나빠졌다"가 아니라 다음과 같은 분석이 가능해진다.

```text
Reports tab
+
Large list
+
Unsorted configuration
+
Scroll hitch rate 급증
+
관련 diagnostic
```

이렇게 performance regression을 실제 앱 경험의 의미 있는 context에 연결하는 것이 새 MetricKit의 핵심 방향이다.

---

# 핵심 메시지

MetricKit은 실제 사용자 환경에서 성능을 지속적으로 관찰하기 위한 production monitoring framework다.

iOS 27에서는 새로운 `MetricManager`를 중심으로 Swift-first API가 도입되고 metrics와 diagnostics가 `AsyncSequence` 형태로 전달된다.

Metrics는 launch, hang, CPU, GPU, memory 같은 앱의 장기적인 health signal을 제공하고, diagnostics는 crash와 hang의 backtrace 및 termination metadata를 통해 root cause를 좁힌다.

새 Metal frame rate metric과 memory exception diagnostic은 각각 game rendering 성능과 memory limit termination 분석을 강화한다.

하지만 이번 개편에서 가장 큰 변화는 **StateReporting과의 결합**이다.

앱의 tab, configuration, experiment 같은 meaningful state를 report하면 MetricKit이 performance data를 해당 state별로 aggregation한다.

따라서 전체 평균 뒤에 숨겨진 특정 화면이나 특정 configuration의 regression을 발견할 수 있다.

Apple이 제시하는 최종 흐름은 명확하다.

```text
Collect metrics
→ Detect regression
→ Inspect diagnostics
→ Add app context with StateReporting
→ Find focused root cause
→ Fix
→ Monitor again
```

그리고 기존 `MXMetricManager`를 사용하고 있다면 새로운 기능을 활용하기 위해 `MetricManager`로 migration하는 것이 권장된다.

---

# 함께 보면 좋은 세션과 자료

- Find and fix performance issues in your Metal games — WWDC26
- Profile, fix, and verify: Improve app responsiveness with Instruments — WWDC26
- Getting started with StateReporting — Apple Developer Documentation
- Analyzing app performance with MetricKit — Apple Developer Documentation
- Monitoring app performance with MetricKit — Apple Developer Documentation
- Track performance by app state using MetricKit — Apple Developer Documentation
- MetricKit — Apple Developer Documentation
