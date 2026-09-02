# WWDC26 Find and fix performance issues in your Metal games 요약

- Session: 388
- Title: Find and fix performance issues in your Metal games
- Source: https://developer.apple.com/videos/play/wwdc2026/388/
- Topic: Metal, Instruments, metalperftrace, StateReporting, MetricKit, Game Performance
- Chapters: Introduction, Metal performance metrics, Trace collection, Analyze performance traces, Contextualize with StateReporting, Collect field data with MetricKit, Next steps

---

## 한 줄 요약

WWDC26의 Metal 성능 분석 workflow는 **게임을 몇 분간 캡처해 한 프레임만 보는 방식에서 벗어나, 시스템이 수시간~수일간 축적한 Metal 성능 데이터를 `metalperftrace`와 Instruments로 되돌아보고, 새 `StateReporting` API로 레벨·그래픽 옵션·네트워크 상태 같은 런타임 컨텍스트를 성능 지표에 겹쳐 원인을 바로 좁힌 뒤, 출시 후에는 MetricKit으로 실제 사용자 기기의 frame-rate 데이터를 state별로 수집하는 방향**으로 확장됐다.

---

## 핵심 요약

이번 세션은 Metal 게임의 성능 문제를 다음 사이클로 정리한다.

```text
Play Test
   ↓
Collect
   ↓
Analyze
   ↓
Contextualize
   ↓
Reproduce
   ↓
Deep Profile
   ↓
Fix
   ↓
Repeat
```

핵심은 **단일 프레임의 깊은 GPU 분석보다 먼저, 장시간 플레이에서 언제 문제가 발생했고 그때 게임이 어떤 상태였는지 찾아내는 것**이다.

- **Metal Performance HUD**
  - FPS
  - GPU time
  - Frame interval
  - Memory
  - Layer size
  - Composition mode
  - MetalFX metrics
  - 개발 중 즉석 상태 확인에 적합

- **Game Performance Overview / Instruments**
  - Desk testing에 적합
  - Aggregated Metal performance metrics
  - Time Profiler CPU samples
  - 수분 이상의 플레이 세션 분석

- **Always-on Metal performance capture**
  - iOS/macOS에서 시스템이 Metal 성능 및 resource metric을 항상 기록
  - Aggregated metric과 optional per-frame metric을 수일간 보관
  - 플레이가 끝난 뒤 과거 구간을 look-back 방식으로 trace로 추출 가능

- **`metalperftrace`**
  - macOS 27의 새 CLI
  - 지난 N시간 또는 start/end time으로 trace 수집
  - Overview 출력
  - Process filtering
  - JSON 출력
  - State transition 전체 출력
  - State별 metric aggregation

- **StateReporting**
  - 게임의 장기 성능 trace에 의미를 추가하는 새 API
  - Domain = 독립적인 finite-state machine
  - State = label + stable metadata + volatile metadata
  - 예: Level, Graphics, Network
  - Metal Performance HUD, `metalperftrace`, Instruments에 통합

- **MetricKit**
  - 출시 후 field monitoring
  - iOS/macOS 27에서 Metal frame-rate metric 제공
  - StateReporting state별 frame-rate breakdown 지원
  - Daily metric reports
  - Memory exception 등의 diagnostics도 제공

---

# 🎮 문제는 “한 프레임”이 아니라 “몇 시간짜리 세션”에서 나타난다

플레이어는 게임을 몇 초만 실행하지 않는다.

세션 중 다음 조건이 바뀔 수 있다.

- Device thermal state
- Graphics quality setting
- Game level
- Boss fight / combat intensity
- Network status
- Resolution / MetalFX mode
- Memory pressure

따라서 성능 문제도 특정 상황 조합에서만 나타날 수 있다.

예:

```text
Level 4
+
Graphics = High
+
Network degraded
+
15분 이상 플레이 후 thermal state 변화
        ↓
FPS drop
```

이런 문제는 짧은 trace만으로 놓치기 쉽다.

---

# 📊 Metal Performance Metrics

Apple의 Metal tool은 다양한 지표를 제공한다.

## Timing 계열

- Frames per second
- GPU time
- Frame interval

이 지표는 frame pacing과 GPU utilization을 이해하는 데 사용한다.

## Display / Presentation 계열

- Layer sizes
- Composition mode
- MetalFX-related metrics

Display 설정이 예상대로 구성돼 있는지 확인한다.

---

# 🖥️ Metal Performance HUD

Metal Performance HUD는 실행 중인 게임 위에 주요 성능 지표를 overlay한다.

대표 값:

- FPS
- Memory usage
- Frame interval

Configuration panel에서 metric을 직접 고르거나 preset을 사용할 수 있다.

적합한 용도:

```text
Play하면서 즉시 성능 확인
```

한계:

> 장시간 metric을 저장하고, 나중에 “12분 10초에 왜 FPS가 떨어졌는가?”를 되짚는 용도는 아니다.

이 문제를 해결하는 것이 이번 세션의 핵심 workflow다.

---

# 🧪 Instruments: Game Performance Overview

Desk testing에서는 Instruments의 **Game Performance Overview** template을 사용한다.

수집 내용:

- Aggregated Metal performance metrics
- Time Profiler CPU samples

사용 방법:

```text
Instruments
  ↓
Game Performance Overview
  ↓
Game Launch 또는 Running Process Attach
  ↓
Record
```

이 방식은 수분 이상의 플레이를 개발 환경에서 직접 관찰할 때 적합하다.

---

# 🕰️ Always-on Performance Recording

이번 세션의 가장 중요한 변화 중 하나는 다음이다.

> 게임이 실행되는 동안 시스템은 Metal performance와 resource usage metric을 계속 기록하고 저장한다.

저장되는 예:

- CPU
- GPU
- FPS
- Memory
- Aggregated Metal metrics
- Optional per-frame metrics

이 데이터는 수일간 효율적으로 저장될 수 있다.

따라서 다음 workflow가 가능하다.

```text
게임 5시간 플레이
      ↓
중간에 여러 설정/레벨/thermal 변화
      ↓
플레이 종료
      ↓
“마지막 5시간” 성능 데이터를 사후 추출
```

즉 trace capture를 미리 시작하지 않아도 된다.

---

# 💻 macOS 27: `metalperftrace`

macOS에서는 새 command-line tool인 `metalperftrace`를 사용한다.

추가 configuration 없이 최근 구간을 수집할 수 있다.

## 최근 5시간 수집

```bash
metalperftrace collect /tmp --last 5h
```

예시 출력:

```text
Metal performance traces collected to: /tmp
/tmp/MetalPerfTrace_20260401_094100_to_144100.atrc
```

---

# 🗓️ 특정 시간 범위 수집

`--start`, `--end`로 정확한 범위를 지정할 수 있다.

```bash
metalperftrace collect /tmp \
  --start 2026-04-01T09:41:00 \
  --end 2026-04-01T12:41:00
```

유용한 상황:

- QA가 문제 발생 시간을 기록해 둔 경우
- 특정 level playthrough 구간만 뽑고 싶은 경우
- Regression test window만 분석하고 싶은 경우

---

# 📱 iOS Look-back Collection

iOS에서는 한 번의 device setup이 필요하다.

절차:

```text
Developer Mode 활성화
      ↓
Developer Settings
      ↓
Enable Performance Trace
      ↓
Lookback Collection 선택
      ↓
보존/수집 구간 설정
      ↓
Control Center에 Performance Trace 추가
```

그 이후에는 평소처럼 게임을 플레이한다.

플레이가 끝난 뒤:

```text
Control Center
      ↓
Performance Trace 버튼
      ↓
선택 구간 Processing
      ↓
Notification
      ↓
Available Trace Files
      ↓
Mac으로 전송
```

---

# 🔎 `metalperftrace overview`

수집된 `.atrc` trace를 빠르게 확인한다.

```bash
metalperftrace overview /Data/MyGameTrace.atrc
```

예시 정보:

```text
Mem: 2146.1 MiB
Peak: 2343.9 MiB
Metal: 1199.4 MiB

59.7 FPS
17735 Frames
188 Skipped

Frame Time avg: 16.74ms
CPU Begin-to-Present avg: 3.99ms
On-GPU Time avg: 13.39ms
Next Drawable Wait avg: 0.26ms
```

또 다음 resource statistic도 포함된다.

- CPU time
- Disk activity
- Instructions
- Cycles
- Layer-specific performance
- Shader compilation information

---

# 🎯 여러 Process가 있을 때 Filtering

Trace에 여러 game session이나 Metal graphics app이 있을 수 있다.

Optional predicate를 사용해 원하는 process만 골라 볼 수 있다.

이 기능은 다음 상황에서 중요하다.

- Game + launcher
- Game + helper process
- 동일 trace에 여러 Metal app

---

# 🤖 JSON 출력

`metalperftrace` 결과를 structured output으로 만들 수 있다.

```bash
metalperftrace overview /Data/MyGameTrace.atrc --json
```

활용:

- Regression testing script
- CI performance gate
- Dashboard ingestion
- Automated anomaly detection
- AI agent 기반 triage

세션은 JSON이 AI agent에 자동 triage 입력으로도 적합하다고 직접 언급한다.

---

# 📈 Instruments에서 Timeline 분석

`.atrc`를 Instruments로 열면 metric을 시간축으로 볼 수 있다.

Instruments는 값이 크게 벗어난 구간을 다른 색으로 강조한다.

예:

```text
FPS
60 ────────────┐
               │
26             └─────────
                 yellow
```

Detail view에서는 다음 statistical value를 제공한다.

- Min
- Max
- Average
- Standard deviation

전체 trace뿐 아니라 선택한 time range에 대해서도 자동 재계산된다.

---

# ⚠️ Metric만으로는 원인을 알 수 없다

예제 trace에서는 특정 구간에서 평균 FPS가 26까지 떨어진다.

동시에 GPU usage도 낮다.

하지만 이 정보만으로는 다음을 알 수 없다.

- 어떤 Level이었는가?
- Boss fight였는가?
- Graphics setting이 High로 바뀌었는가?
- Network 상태가 바뀌었는가?

이때 새 **StateReporting**이 등장한다.

---

# 🧠 StateReporting

StateReporting은 게임의 runtime behavior를 trace에 설명하는 새 API다.

핵심 개념은 네 가지다.

```text
Domain
  ↓
State
  ├─ Label
  ├─ Stable Metadata
  └─ Volatile Metadata
```

---

# 🧩 Domain

Domain은 특정 기능 영역을 표현하는 finite state machine이다.

예:

```text
com.mygame.level
com.mygame.graphics
com.mygame.network
```

한 domain은 한 시점에 하나의 state만 가진다.

---

# 🏷️ State Label

예:

```text
Level Domain
├─ Level 1
├─ Level 2
└─ Level 3
```

Graphics Domain:

```text
Low
Medium
High
```

Network Domain:

```text
Offline
Wi-Fi
Cellular
Degraded
```

---

# 📦 Stable Metadata

State가 유지되는 동안 변하지 않는 structured information이다.

예:

```text
Level 1
├─ biome = forest
└─ id = 1001
```

특징:

- Immutable dictionary
- Serializable information
- State transition 시점의 context 설명

---

# 🔄 Volatile Metadata

같은 state 안에서 계속 바뀔 수 있는 값이다.

예:

- Player health
- Player position
- Current enemy count

State transition 없이 업데이트한다.

```text
Level 1 유지
      ↓
Player position만 계속 변화
```

---

# 🧑‍💻 StateReporting 기본 코드

세션의 Objective-C 예:

```objective-c
#import <StateReporting/StateReporting.h>

NSString *domain = @"com.mygame.level";
SRStateReporter *reporter =
    [SRStateReporter reporterForDomain:domain];

[reporter reportTransitionToStateLabel:@"Level 1"
                        stableMetadata:nil
                      volatileMetadata:nil];

[reporter reportTransitionToStateLabel:@"Level 1"
                        stableMetadata:@{ @"id": @1001 }
                      volatileMetadata:nil];

[reporter reportVolatileMetadataUpdate:@{
    @"health": @100
}];
```

Swift와 Objective-C 모두 지원한다.

---

# 🧭 여러 Domain은 서로 Orthogonal하게 설계

좋은 예:

```text
Level Domain
Graphics Domain
Network Domain
```

나쁜 접근:

```text
GameState Domain
→ Level2_HighGraphics_Wifi_PlayerLowHealth
```

한 domain에 너무 많은 dimension을 합치면 분석이 어려워진다.

Apple은 각 domain을 **conceptually orthogonal**하게 설계하라고 권장한다.

---

# 🖥️ Metal Performance HUD + StateReporting

StateReporting domain은 Metal Performance HUD의 metric configuration 목록에도 나타난다.

Enable하면 overlay에 다음이 표시된다.

- State label
- Stable metadata
- Volatile metadata

예:

```text
Level 2
biome: volcano
id: 1002
playerPosition: (52, 8, 109)
```

StateReporting adoption을 가장 빠르게 검증하는 방법이다.

---

# 📍 Volatile Player Position

세션 예에서는 player position을 초당 한 번 report한다.

HUD에서 플레이어 이동에 따라 position이 업데이트되는 것을 확인한다.

중요:

StateReporting은 high-frequency telemetry API가 아니다.

따라서 매 frame마다 player transform을 보내는 용도로 사용하면 안 된다.

---

# 📜 Trace Overview에서 State 확인

State가 포함된 trace를 `metalperftrace overview`로 보면 다음이 추가된다.

- Domain list
- Transition count
- Last known state

전체 transition을 보고 싶다면:

```bash
metalperftrace overview /Data/MyGameTrace.atrc \
  --include-state-transitions
```

예:

```text
[States]
com.mygame.graphics
  High (30.59%, 14.996s)
    raytracing: 1
    shadow: ultra

  Medium (69.38%, 34.012s)
    raytracing: 0
    shadow: medium

com.mygame.level
  Level 1 (20.47%, 10.033s)
    biome: forest
    id: 1001

  Level 2 (79.53%, 38.991s)
    biome: volcano
    id: 1002
```

---

# 📊 State별 Performance Aggregation

StateReporting의 가장 강력한 활용 중 하나다.

## 모든 Domain / State 기준

```bash
metalperftrace overview /Data/MyGameTrace.atrc \
  --aggregate
```

## 특정 Domain

```bash
metalperftrace overview /Data/MyGameTrace.atrc \
  --aggregate \
  --domain com.mygame.graphics
```

## 특정 State Label

```bash
metalperftrace overview /Data/MyGameTrace.atrc \
  --aggregate \
  --domain com.mygame.graphics \
  --state-label "High"
```

---

# 🔍 “High Graphics일 때 FPS는?”

세션 예제에서는 Graphics domain이 `High`인 구간만 aggregate한다.

결과:

```text
Average FPS ≈ 24
```

이제 다음 질문에 바로 답할 수 있다.

```text
FPS가 언제 떨어졌나?
      ↓
Graphics = High 구간
      ↓
문제가 반복되는가?
      ↓
해당 설정에서 집중 분석
```

이것이 단순 FPS timeline을 **actionable performance data**로 바꾸는 과정이다.

---

# 🔗 Overlapping State

State aggregation report는 다른 domain에서 동시에 활성화된 state도 보여준다.

예:

```text
Graphics = High
동안
Level = Level 2
Network = Wi-Fi
```

따라서 복합적인 조건을 이해하기 쉬워진다.

---

# 📉 Instruments + StateReporting

State transition이 포함된 trace를 Instruments에서 열면 Points of Interest instrument 아래에 domain별 track이 생성된다.

예:

```text
Metal FPS Track

Level Domain
| Level 1 | Level 2 |

Graphics Domain
| Medium | High | Medium |

Network Domain
| Wi-Fi  | Degraded |
```

State track은 다음을 보여준다.

- Transition
- Volatile update
- Duration

특정 state를 선택하면 sidebar에서 stable/volatile metadata를 볼 수 있다.

---

# 🎯 성능 문제를 Reproduce 가능한 Context로 변환

세션의 핵심 진단 흐름:

```text
FPS drop 발견
      ↓
State track 확인
      ↓
Graphics = High 전환과 일치
      ↓
해당 setting에서 문제 재현
      ↓
보다 깊은 CPU/GPU 분석
```

즉 StateReporting의 목적은 최종 원인을 자동으로 찾는 것이 아니다.

**깊게 profile할 지점을 빠르게 좁혀 주는 것**이다.

---

# 🔬 다음 단계: Metal System Trace

문제 구간과 재현 조건을 찾았다면 더 깊은 scheduling 데이터를 수집한다.

Instruments:

```text
Metal System Trace Template
```

확인:

- CPU scheduling
- GPU scheduling
- Command execution timing
- Resource contention

---

# 🧪 Xcode Metal Debugger

특정 frame 자체를 자세히 보고 싶다면 Xcode Metal debugger를 사용한다.

Workflow:

```text
Long-session trace
      ↓
Problem context 발견
      ↓
Reproduce
      ↓
Frame capture
      ↓
Metal Debugger
```

장기 telemetry와 single-frame deep analysis를 서로 연결하는 구조다.

---

# ✅ StateReporting Best Practices

Apple은 세 가지를 강조한다.

## 1. Domain을 먼저 설계

각 domain은 서로 독립적인 개념이어야 한다.

좋은 후보:

- Level
- Graphics
- Network
- Game mode
- Match phase

---

## 2. Transition을 너무 자주 보내지 않기

StateReporting은 장시간 trace의 context를 위한 API다.

적합한 cadence:

- User action
- Level transition
- Graphics setting change
- Network mode change

부적합:

```text
Every frame
Every physics tick
Every animation update
```

Transition rate가 너무 높으면 system이 throttle한다.

그 결과 중요한 state information을 놓칠 수 있다.

---

## 3. State correctness 검증

다음 도구로 확인한다.

- Metal Performance HUD
- Instruments

확인할 것:

- Transition이 예상 시점에 발생하는가?
- Stable metadata가 정확한가?
- Volatile update가 올바른가?
- Edge case에서 잘못된 state가 남지 않는가?

잘못된 telemetry는 성능 분석을 오히려 어렵게 만든다.

---

# 📦 출시 이후: MetricKit

장시간 play testing을 끝내고 App Store에 출시한 뒤에도 monitoring은 계속되어야 한다.

MetricKit은 두 종류의 데이터를 제공한다.

```text
MetricKit
├─ Metrics
└─ Diagnostics
```

앱 process가 직접 report를 받는다.

---

# 📅 Daily Report

플레이어가 게임을 사용하면 MetricKit이 background에서 지속적으로 data를 수집하고 daily report를 전달한다.

포함되는 내용:

- Performance metrics
- Power metrics
- Resource usage
- Frame-rate information

---

# 🎞️ iOS/macOS 27 Metal Frame Rate

iOS와 macOS 27에서 MetricKit이 Metal frame-rate 정보를 제공한다.

예:

- Overall average frame rate
- Time
- Number of frames

이제 출시된 게임의 실제 player device에서도 graphics smoothness를 정량적으로 확인할 수 있다.

---

# 🧠 MetricKit + StateReporting

MetricKit은 Metal frame rate를 StateReporting state별로도 aggregate한다.

예:

```text
Overall Average FPS: 57

Level Domain
├─ Level 1: 60 FPS
├─ Level 2: 54 FPS
└─ Level 3: 42 FPS
```

이것은 매우 중요하다.

개발 중 trace에서 사용한 state model을 field telemetry에도 그대로 사용할 수 있다.

---

# 🌍 Field Performance Monitoring

App process가 MetricKit report를 받으면 다음을 할 수 있다.

- Local analysis
- Off-device upload
- Backend aggregation
- Version별 비교
- Device class별 비교
- State별 regression detection

예:

```text
App Version 4.2
+
iPhone Model X
+
Graphics = High
+
Level 7
→ FPS regression
```

---

# 🚨 Diagnostics

MetricKit은 metric뿐 아니라 diagnostics도 제공한다.

예:

- Memory exception

게임이 memory limit 초과로 종료되면 어떤 일이 있었는지 더 많은 정보를 받을 수 있다.

따라서 frame rate뿐 아니라 code-path 수준의 문제 조사에도 도움을 준다.

---

# 🧩 도구별 역할 비교

| 도구 | 목적 | 시간 범위 | 주요 활용 |
|---|---|---:|---|
| Metal Performance HUD | 즉시 상태 확인 | 실시간 | 개발 중 FPS/Memory 빠른 확인 |
| Game Performance Overview | Desk profiling | 수분+ | CPU + Metal metric 동시 분석 |
| Always-on recording | Background telemetry | 시간~수일 | 사후 look-back |
| `metalperftrace collect` | Trace 추출 | 지정 구간 | 최근 N시간 / 특정 시간 범위 |
| `metalperftrace overview` | CLI 분석 | 전체/필터 구간 | 요약, JSON, state aggregation |
| Instruments | Timeline 분석 | 전체/선택 구간 | anomaly와 state 시각화 |
| StateReporting | Runtime context | 장기 세션 | level/graphics/network 의미 부여 |
| Metal System Trace | Deep scheduling | 문제 재현 구간 | CPU/GPU scheduling |
| Metal Debugger | Frame deep dive | 단일/소수 frame | GPU workload 분석 |
| MetricKit | 출시 후 field data | Daily | 실제 사용자 성능 추적 |

---

# 🧩 StateReporting Data Model

| 개념 | 의미 | 예 |
|---|---|---|
| Domain | 독립된 상태 머신 | `com.mygame.graphics` |
| State Label | 현재 상태 이름 | `High` |
| Stable Metadata | State 동안 고정 | `raytracing = true` |
| Volatile Metadata | State 안에서 변함 | `playerPosition` |
| Transition | 다른 state로 전환 | `Medium → High` |

---

# 🔁 개발 전 성능 Workflow

```text
Game Play Test
      ↓
HUD로 즉시 이상 확인
      ↓
Game Performance Overview 또는 Look-back Trace
      ↓
metalperftrace / Instruments
      ↓
FPS drop / Memory spike 발견
      ↓
StateReporting으로 Context 확인
      ↓
문제 State 재현
      ↓
Metal System Trace / Metal Debugger
      ↓
Fix
      ↓
Repeat
```

---

# 🔁 출시 후 Workflow

```text
Player Sessions
      ↓
MetricKit background collection
      ↓
Daily Report
      ↓
Overall Metal frame rate
      ↓
StateReporting별 breakdown
      ↓
Backend aggregation / regression detection
      ↓
문제 state 재현
      ↓
개발 중 profiling workflow로 복귀
```

---

# 📋 체크리스트

## Metal Performance HUD

- [ ] FPS 표시
- [ ] Memory 표시
- [ ] Frame interval 표시
- [ ] GPU 관련 metric 구성
- [ ] Layer / composition 설정 확인
- [ ] MetalFX metric 확인
- [ ] StateReporting domain 표시 활성화

## Game Performance Overview

- [ ] Instruments에서 template 선택
- [ ] Launch 또는 attach 방식 결정
- [ ] 실제 플레이 flow를 수분 이상 수행
- [ ] CPU sample과 Metal metric 함께 수집
- [ ] 문제 재현 조건 기록

## macOS Look-back

- [ ] macOS 27 확인
- [ ] `metalperftrace collect` 사용
- [ ] `--last`로 최근 구간 수집
- [ ] 필요한 경우 `--start` / `--end`
- [ ] 생성된 `.atrc` 보관

## iOS Look-back

- [ ] Developer Mode 활성화
- [ ] Enable Performance Trace
- [ ] Lookback Collection 설정
- [ ] 수집 기간 지정
- [ ] Control Center에 Performance Trace 추가
- [ ] 플레이 종료 후 trace 처리
- [ ] Available Trace Files 확인
- [ ] Mac으로 전송

## CLI 분석

- [ ] `metalperftrace overview` 실행
- [ ] Memory 확인
- [ ] FPS 확인
- [ ] Frame time 확인
- [ ] On-GPU time 확인
- [ ] Skipped frame 확인
- [ ] Process predicate 필요 여부 확인
- [ ] `--json` 자동화 검토

## Instruments 분석

- [ ] Timeline에서 anomaly 색상 확인
- [ ] FPS drop 구간 선택
- [ ] Min/max/avg/stddev 확인
- [ ] GPU utilization 확인
- [ ] Memory 변화 확인
- [ ] State tracks와 시간축 비교

## StateReporting 설계

- [ ] Domain 목록을 instrumentation 전에 정의
- [ ] Domain이 서로 orthogonal한지 확인
- [ ] Level domain
- [ ] Graphics domain
- [ ] Network domain
- [ ] 필요한 game-specific domain 정의
- [ ] State label naming 규칙 결정
- [ ] Stable metadata 정의
- [ ] Volatile metadata 정의

## Transition Cadence

- [ ] User action 수준의 변경만 transition
- [ ] Level transition report
- [ ] Graphics setting change report
- [ ] Network status transition report
- [ ] High-frequency transition 금지
- [ ] 매 frame reporting 금지
- [ ] Throttling 여부 테스트

## State Validation

- [ ] HUD에서 현재 state 확인
- [ ] Stable metadata 검증
- [ ] Volatile update 검증
- [ ] Instruments track 확인
- [ ] Edge case에서 stale state가 남지 않는지 확인

## State-aware CLI

- [ ] `--include-state-transitions` 사용
- [ ] Domain별 transition 확인
- [ ] `--aggregate` 사용
- [ ] 특정 `--domain` aggregate
- [ ] `--state-label` aggregate
- [ ] Overlapping state 확인

## Deep Profiling

- [ ] State로 문제 조건 충분히 좁혔는지 확인
- [ ] Metal System Trace capture
- [ ] CPU scheduling 분석
- [ ] GPU scheduling 분석
- [ ] Xcode Metal Debugger frame capture
- [ ] Fix 후 long-session retest

## MetricKit

- [ ] MetricKit integration
- [ ] Daily report 수신
- [ ] Metal frame-rate metric 파싱
- [ ] StateReporting breakdown 파싱
- [ ] Local analysis 필요 여부 결정
- [ ] Backend upload 정책 결정
- [ ] Privacy/telemetry policy 검토
- [ ] Version/device/state별 aggregation
- [ ] Regression alert 설계
- [ ] Memory diagnostic 처리

---

# ⚠️ 구현 시 주의할 점

## HUD는 장시간 분석 도구가 아니다

HUD는 현재 상태를 보는 데 매우 좋지만 시간축을 되돌아보거나 특정 5시간 세션의 통계를 저장하는 용도는 아니다.

장기 분석에는 trace workflow를 사용한다.

## 평균 FPS 하나만 보면 원인을 놓친다

```text
Average FPS = 55
```

이라는 값만으로는 다음을 알 수 없다.

- 어느 level이 느린가?
- 특정 graphics mode에서만 느린가?
- network 상태와 연관 있는가?

StateReporting이 필요한 이유다.

## StateReporting은 Logging API가 아니다

매 event를 기록하는 general telemetry 시스템으로 사용하면 안 된다.

장시간 performance context를 설명할 정도의 coarse-grained state에 집중한다.

## Transition이 너무 빠르면 Throttle된다

Transition rate가 높으면 system이 throttle하고 일부 중요한 context를 잃을 수 있다.

## Stable과 Volatile Metadata를 구분한다

State가 바뀌지 않았는데 자주 바뀌는 값을 stable metadata로 넣지 않는다.

예:

```text
Level ID → Stable
Player Position → Volatile
```

## Field Metric과 Local Trace를 같은 State Model로 연결한다

개발 환경과 출시 후 telemetry에서 domain 이름과 의미가 달라지면 분석 연결성이 떨어진다.

처음부터 장기적으로 유지 가능한 state model을 설계하는 편이 좋다.

---

# 🎯 추천 Domain 예시

## Level

```text
com.company.game.level

State:
- Tutorial
- Forest
- Volcano
- BossArena

Stable Metadata:
- levelID
- biome
- difficulty
```

## Graphics

```text
com.company.game.graphics

State:
- Low
- Medium
- High
- Ultra

Stable Metadata:
- raytracing
- shadowQuality
- upscalingMode
```

## Network

```text
com.company.game.network

State:
- Offline
- WiFi
- Cellular
- Degraded
```

이렇게 나누면 다음 질문을 바로 할 수 있다.

```text
High graphics에서 FPS?
Volcano level에서 FPS?
Degraded network와 frame pacing 관계?
```

---

# 🧭 실제 분석 예

```text
Trace 전체 평균 FPS = 59
```

겉으로는 문제 없어 보인다.

하지만 timeline에서 12분 구간을 선택하면:

```text
Average FPS = 26
GPU usage = Low
```

State track:

```text
Level = Level 2
Graphics = High
Network = Wi-Fi
```

`metalperftrace`로 Graphics=High만 aggregate:

```text
Average FPS ≈ 24
```

이제 조사 방향이 명확해진다.

```text
High Graphics 설정에서 재현
      ↓
Metal System Trace
      ↓
CPU / GPU scheduling 확인
      ↓
Metal Debugger frame capture
```

---

# 🤖 자동화 관점

`metalperftrace --json`은 성능 regression pipeline을 만들기 좋다.

예:

```text
Nightly automated playtest
      ↓
Look-back trace
      ↓
metalperftrace overview --json
      ↓
Script / CI / Agent
      ↓
Threshold 비교
      ↓
Regression report
```

검사 가능한 값:

- Average FPS
- Skipped frame count
- Memory peak
- On-GPU time
- State별 FPS

AI agent가 JSON을 받아 이상 구간을 triage하는 workflow도 세션에서 직접 언급한다.

---

# 핵심 메시지

이번 세션에서 Apple이 제안하는 Metal 성능 분석의 가장 큰 변화는 **“문제가 있을 것 같을 때 trace를 켠다”에서 “시스템이 이미 기록해 둔 장기 metric을 뒤에서 꺼내 보고, 그 위에 게임 state를 얹어 원인을 좁힌다”**로 분석 workflow가 바뀐다는 점이다.

Metal Performance HUD는 현재 성능을 빠르게 확인하고, Game Performance Overview는 desk testing에서 CPU와 GPU metric을 함께 본다.

macOS 27의 `metalperftrace`와 iOS의 Performance Trace look-back 기능은 몇 시간 전의 성능 data까지 사후에 trace로 추출하게 한다.

하지만 긴 trace에서 단순 FPS graph만 봐서는 actionable한 결론을 얻기 어렵다.

새 `StateReporting` API는 다음과 같은 runtime context를 trace의 시간축에 추가한다.

```text
Level
Graphics Quality
Network State
Game Mode
```

그 결과 다음 질문이 가능해진다.

```text
“FPS가 언제 떨어졌나?”
        ↓
“Graphics=High 상태에서 떨어진다.”
        ↓
“그 상태만 재현해서 Metal System Trace와 GPU capture로 깊게 본다.”
```

그리고 앱 출시 후에는 MetricKit이 Metal frame-rate metric을 daily report로 제공하고, 같은 StateReporting domain별로 frame rate를 aggregate해 실제 사용자 환경에서도 동일한 분석 vocabulary를 유지한다.

즉 전체 성능 분석 체계는 다음으로 연결된다.

```text
Development
HUD / Instruments / metalperftrace
        ↓
Context
StateReporting
        ↓
Deep Dive
Metal System Trace / Metal Debugger
        ↓
Production
MetricKit + StateReporting
```

이 구조를 사용하면 몇 시간짜리 telemetry를 수작업으로 뒤지는 대신 **“어떤 게임 상태에서 어떤 성능 문제가 반복되는가”를 먼저 찾고, 실제로 고칠 가치가 있는 재현 조건에 profiling effort를 집중**할 수 있다.

---

# 함께 보면 좋은 세션과 자료

- Discover new Metal profiling tools for M3 and A17 Pro — Tech Talks
- Understanding the Metal Performance HUD metrics
- Monitoring your Metal app’s graphics performance
- Getting started with StateReporting
- Metal debugger
- Meet the new MetricKit — WWDC26
