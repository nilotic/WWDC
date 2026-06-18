# WWDC26 Build a responsive camera app that launches quickly 요약

- Session: 303
- Title: Build a responsive camera app that launches quickly
- Source: https://developer.apple.com/videos/play/wwdc2026/303/
- Topic: Camera performance, AVFoundation, launch optimization, preview rendering, sustained performance, deterministic video file writing

---

## 한 줄 요약

WWDC26의 “Build a responsive camera app that launches quickly”는 카메라 앱에서 사용자가 결정적인 순간을 놓치지 않도록 **첫 preview frame을 최대한 빨리 표시하는 방법**, **preview frame drop을 줄이는 렌더링 전략**, **장시간 사용 중 성능을 유지하는 API**, 그리고 **고대역폭 비디오 캡처를 위한 deterministic file writing**을 설명하는 세션이다.

---

## 핵심 요약

이 세션은 카메라 앱의 성능을 네 가지 흐름으로 나누어 설명한다.

1. **Fast Launch**
   - 카메라 앱 launch sequence를 네 단계로 분해
   - preview 표시 전 필요한 작업과 나중에 해도 되는 작업을 분리
   - `AVCaptureSession` 생성과 `startRunning()`을 main thread에서 피하는 방법 설명

2. **Deferred Start**
   - iOS 26 이후 제공되는 Deferred Start API 소개
   - preview에 필요하지 않은 capture output 초기화를 preview 이후로 미룸
   - 자동 모드와 수동 모드의 차이 설명
   - `isResponsiveCaptureEnabled`로 deferred output 상태에서도 빠른 사진 촬영 가능

3. **Steady Preview와 Sustained Performance**
   - `AVCaptureVideoPreviewLayer`와 `AVCaptureVideoDataOutput`의 선택 기준 설명
   - frame drop을 줄이고 preview cadence를 안정적으로 유지하는 방법 소개
   - hardware cost, system pressure cost, system pressure state를 통해 장시간 성능을 관리

4. **Deterministic File Writing**
   - iOS 27의 `AVProVideoStorage` 소개
   - ProRes 같은 고대역폭 비디오 캡처에서 안정적인 file I/O를 제공
   - `AVCaptureMovieFileOutput`과 `AVAssetWriter`에서 사용할 수 있는 opt-in 방식 설명

---

# 1. Introduction

세션은 카메라 앱에서 launch가 느리면 사용자가 바로 체감한다는 설명으로 시작한다. 발표자는 Apple 기본 카메라 앱을 최적화한 경험을 바탕으로, 카메라 launch가 빠르게 느껴지는 가장 중요한 요소는 **preview frame이 화면에 얼마나 빨리 나타나는가**라고 설명한다.

예시로 도미노가 쓰러지는 순간을 촬영하려는 상황을 보여준다. 앱 launch 후 preview가 비어 있는 시간이 길면, 사용자는 이미 중요한 순간을 놓치게 된다. 따라서 카메라 앱의 launch 성능은 단순히 앱이 켜지는 시간이 아니라, preview가 실제로 렌더링되기까지의 시간을 중심으로 봐야 한다.

세션은 이후 네 가지 주제를 다룬다.

- camera launch sequence 가속
- preview rendering best practice
- 지속 가능한 성능을 위한 API
- 고대역폭 비디오 캡처를 위한 deterministic file write API

---

# 2. Fast Launch

## Camera app launch sequence

카메라 앱의 launch sequence는 네 단계로 나뉜다.

| 단계 | 설명 |
|---|---|
| 1. App launch | linker가 binary를 load하고 static initializer를 실행하며 UI scene을 생성하는 단계 |
| 2. Session configuration and start | `AVCaptureSession`을 초기화하고 configuration을 commit한 뒤 session을 시작하는 단계 |
| 3. Capture output initialization | session 시작 후 capture output들이 초기화되는 단계 |
| 4. Preview streaming | preview frame이 앱으로 흘러 들어오고 화면에 표시되기 시작하는 단계 |

카메라 앱을 빠르게 만들려면 각 단계에서 preview 표시 전에 꼭 필요한 작업과 나중으로 미룰 수 있는 작업을 나누어야 한다.

## UI 작업을 두 단계로 분리하기

발표자는 AVCam 샘플 앱을 예로 들어 카메라 UI를 분해한다.

| UI 요소 | launch 전에 필요한가 |
|---|---|
| Camera preview | 필요함 |
| Shutter button | 필요함 |
| Image well | preview 이후로 미룰 수 있음 |
| Mode picker | preview 이후로 미룰 수 있음 |

사용자가 앱을 열었을 때 가장 먼저 필요한 것은 preview다. image well이나 mode picker처럼 preview가 뜨기 전에는 필요하지 않은 UI는 preview 시작 후 fade-in하는 방식으로 처리할 수 있다.

## Capture session 구성 최적화

`AVCaptureSession`과 관련 객체 생성은 launch 성능에 직접 영향을 준다. 특히 session을 구성하고 시작하는 과정은 많은 시스템 리소스와 allocation을 사용한다.

중요한 원칙은 다음과 같다.

- `AVCaptureSession`은 가능한 빨리 생성하되 main thread를 막지 않도록 한다.
- UI 초기화와 병렬로 session setup을 background에서 수행한다.
- launch 중 여러 번 configuration을 commit하지 말고, 한 번의 configuration으로 구성한다.
- `startRunning()`과 `stopRunning()`은 blocking call이므로 main thread에서 호출하지 않는다.

---

# 3. Adopt deferred start

## Deferred Start의 목적

카메라 launch에서 가장 비용이 큰 부분은 capture output 초기화다. preview를 보여주기 위해서는 preview layer 또는 preview용 output 하나만 있으면 된다. 사진 촬영용 output이나 movie file output은 preview가 표시된 후 초기화해도 된다.

iOS 26 이후 제공되는 Deferred Start API는 preview에 필요하지 않은 output 초기화를 launch 이후로 미룰 수 있게 한다.

## Deferred Start 적용 방식

Deferred Start를 사용하면 launch sequence가 다음과 같이 바뀐다.

1. 앱 launch
2. session 구성
3. session start
4. preview에 필요한 output만 초기화
5. 첫 preview frame 표시
6. 나머지 deferred output 초기화

`AVCaptureOutput`과 `AVCaptureVideoPreviewLayer`에는 `isDeferredStartEnabled` 속성이 있다. preview에 필요한 output은 deferred 대상에서 제외하고, launch에 필요하지 않은 output은 deferred 대상으로 설정한다.

## Automatic deferred start

iOS 26 이후 SDK로 다시 빌드한 앱은 automatic deferred start가 기본으로 적용된다. 이 모드에서는 시스템이 preview가 표시된 직후 적절한 시점에 deferred output을 초기화한다.

관련 delegate callback은 두 가지다.

| Callback | 호출 시점 |
|---|---|
| `sessionWillRunDeferredStart(_:)` | deferred output 초기화가 시작되기 전 |
| `sessionDidRunDeferredStart(_:)` | deferred output 초기화가 끝난 뒤 |

`sessionWillRunDeferredStart(_:)`에서는 앱이 필요한 background resource를 준비할 수 있고, `sessionDidRunDeferredStart(_:)` 이후에는 모든 capture output이 초기화되어 사용할 수 있다.

## Manual deferred start

더 세밀한 제어가 필요한 앱은 manual mode를 사용할 수 있다. 이 경우 앱이 `runDeferredStartWhenNeeded()`를 호출해 deferred start를 시작할 시점을 알려준다.

Manual mode는 다음과 같은 경우에 유용하다.

- preview 이후 preference를 읽거나 UI를 먼저 구성하고 싶은 경우
- `AVCaptureVideoDataOutput`으로 preview를 직접 렌더링하는 경우
- 첫 frame이 실제로 표시된 뒤 heavy initialization을 시작하고 싶은 경우

## Deferred Start의 효과

세션의 실험에서는 deferred start를 적용한 기기가 preview를 훨씬 빨리 표시했다. Deferred start가 없는 경우 launch가 거의 1초에 가까웠지만, deferred start를 적용한 경우 launch 시간이 절반으로 줄어 약 2배 빠른 launch를 보였다.

복잡한 capture session을 사용하는 앱은 더 큰 개선을 볼 수 있다.

## Responsive capture

사진 output을 deferred하면 preview는 빨리 시작되지만, 첫 촬영까지 걸리는 시간은 그대로일 수 있다. photo output 초기화가 아직 끝나지 않았다면 사용자는 preview는 보면서도 바로 촬영하지 못할 수 있다.

이를 보완하기 위해 `AVCapturePhotoOutput`의 `isResponsiveCaptureEnabled`를 `true`로 설정할 수 있다. 이 속성은 capture 시작과 processing 사이에 buffering을 추가해, photo output이 완전히 준비되지 않은 상태에서도 결정적인 순간을 놓치지 않도록 돕는다.

---

# 4. Steady preview

첫 preview가 빠르게 표시된 뒤에는 frame rate와 cadence를 안정적으로 유지하는 것이 중요하다. preview가 끊기거나 frame drop이 발생하면 카메라 앱은 느리고 불안정하게 느껴진다.

## AVCaptureVideoPreviewLayer

`AVCaptureVideoPreviewLayer`는 카메라가 보는 화면을 앱 UI에 직접 표시하는 가장 간단한 방법이다.

장점은 다음과 같다.

| 장점 | 설명 |
|---|---|
| 최적화된 preview rendering | 앱이 직접 frame을 처리하지 않아도 됨 |
| HDR tone mapping 처리 | 까다로운 rendering 상황을 시스템이 처리 |
| 낮은 CPU/GPU overhead | 전력 사용을 줄이고 UI headroom 확보 |
| 낮은 latency | 카메라가 보는 장면을 짧은 지연으로 표시 |
| automatic deferred start | iOS 26 이후 SDK로 다시 빌드하면 자동 deferred start에 유리 |

단점은 per-frame access를 제공하지 않는다는 점이다.

## AVCaptureVideoDataOutput

preview frame에 직접 접근해야 하는 앱은 `AVCaptureVideoDataOutput`을 사용할 수 있다.

적합한 경우는 다음과 같다.

- 개별 frame을 처리해야 하는 경우
- frame마다 custom UI overlay를 적용해야 하는 경우
- Metal과 통합해야 하는 경우
- frame data 분석이 필요한 경우

다만 `AVCaptureVideoDataOutput`을 사용할 경우 deferred start가 자동으로 적용되지 않으므로, 동일한 launch 개선을 얻으려면 manual deferred start를 직접 적용해야 한다.

## 선택 기준

| 목적 | 권장 방식 |
|---|---|
| 단순히 camera feed 표시 | `AVCaptureVideoPreviewLayer` |
| frame 단위 처리, 분석, Metal 통합 | `AVCaptureVideoDataOutput` |

preview를 직접 렌더링하는 경우에는 frame당 처리 시간을 짧게 유지해야 한다. 그래야 frame drop을 줄이고 유동적인 preview 경험을 유지할 수 있다.

---

# 5. Sustained performance

카메라 앱은 launch 이후에도 장시간 안정적인 성능을 유지해야 한다. device가 뜨거워지면 system throttling이 발생하고, 복잡한 capture session일수록 성능 유지가 어려워진다.

## Hardware cost

Hardware cost API는 capture session이 hardware resource를 얼마나 사용하고 있는지를 0에서 1 사이 값으로 나타낸다.

| 값 | 의미 |
|---|---|
| 0 ~ 1 | device가 현재 configuration을 지원 가능 |
| 1 초과 | system이 configuration을 지원할 수 없음 |

hardware cost에 영향을 주는 요소는 다음과 같다.

- 사용하는 camera 수
- source device의 active format
- 1080p / 4K 등 해상도
- source format의 frame rate
- binned format 사용 여부

format의 최대 frame rate를 기준으로 hardware cost가 계산되므로, 실제로 더 낮은 frame rate로 동작한다면 frame rate override property를 사용해 cost를 낮출 수 있다.

## System pressure cost와 system pressure state

System pressure cost API도 0에서 1 사이 값을 반환하며, 현재 capture session configuration의 지속 가능성을 나타낸다. 값이 1을 넘으면 configuration이 지속 가능하지 않다는 의미다.

앱은 `AVCaptureDevice`의 `systemPressureState`를 관찰해 system pressure 변화에 대응할 수 있다.

system pressure가 올라갈 때 고려할 수 있는 대응은 다음과 같다.

- capture device frame rate 낮추기
- GPU 사용량 줄이기
- Apple Neural Engine 사용량 줄이기
- UI 작업 최소화

권장 흐름은 다음과 같다.

1. 초기 session setup 후 hardware cost 확인
2. configuration commit 후 hardware cost가 1 이하인지 확인
3. `systemPressureState`를 observe
4. pressure state 변화에 따라 frame rate, GPU/ANE 사용량, UI workload 조정

---

# 6. Deterministic file writing

고대역폭 비디오 캡처에서는 file I/O 성능도 중요하다. ProRes 같은 high data rate video capture는 지속적이고 안정적인 storage bandwidth가 필요하다. 기존 file system I/O는 다른 작업, memory fragmentation, storage wear 등 여러 요인 때문에 비결정적일 수 있다.

## AVProVideoStorage

iOS 27에서 새롭게 도입된 `AVProVideoStorage`는 고대역폭 비디오 캡처를 위해 pre-allocated storage를 추적하고 관리하는 클래스다.

특징은 다음과 같다.

| 항목 | 내용 |
|---|---|
| 도입 버전 | iOS 27 |
| 목적 | high data rate video capture의 안정적인 file write 성능 제공 |
| 방식 | pre-allocated storage 관리 |
| 범위 | system-wide shared resource |
| 지원 API | `AVCaptureMovieFileOutput`, `AVAssetWriter` |
| 사용자 설정 | Camera settings에서 allocated storage 용량 제어 가능 |

앱은 `AVCaptureMovieFileOutput`이나 `AVAssetWriter`에서 Pro Video Storage를 opt in할 수 있다. 시스템이 allocation과 file I/O를 처리하므로, 고대역폭 codec에서도 write performance를 더 일관되게 유지할 수 있다.

## 사용 흐름

`AVProVideoStorage`를 사용하기 위한 기본 흐름은 다음과 같다.

1. Pro Video Storage 지원 여부 확인
2. singleton shared instance 획득
3. `AVCaptureMovieFileOutput`, `AVCaptureSession`, connection, recording format 구성
4. `isProVideoStorageSupported`로 compatibility 확인
5. storage가 resize, file creation, deletion 요청 처리 중인지 확인
6. Movie File Output에서 Pro Video Storage 활성화
7. recording 시작

녹화 중에는 recording이 pre-allocated storage에 기록되고, capture가 끝나면 지정된 위치로 이동된다.

`remainingCapacity`를 통해 남은 storage 용량을 확인할 수 있으며, 필요하면 `openSettings()`로 사용자를 관련 Settings UI로 이동시킬 수 있다.

---

# 7. 정리

이 세션의 핵심은 카메라 앱 성능을 “앱 launch 시간” 하나로 보지 않고, 사용자가 실제로 체감하는 **첫 preview frame**, **첫 capture 가능 시점**, **preview 안정성**, **장시간 성능**, **비디오 file write 안정성**으로 나누어 최적화하는 것이다.

요약하면 다음과 같다.

- preview 표시 전에 꼭 필요한 UI와 resource만 준비한다.
- `AVCaptureSession` 생성, configuration, `startRunning()`을 main thread에서 피한다.
- preview에 필요하지 않은 capture output은 Deferred Start로 미룬다.
- deferred photo output과 빠른 촬영을 함께 제공하려면 responsive capture를 활성화한다.
- 단순 preview는 `AVCaptureVideoPreviewLayer`를 사용하고, frame 처리나 분석이 필요하면 `AVCaptureVideoDataOutput`을 사용한다.
- hardware cost와 system pressure state를 관찰해 장시간 사용 중 성능을 조절한다.
- ProRes 같은 고대역폭 비디오 녹화에는 iOS 27의 `AVProVideoStorage`를 활용해 deterministic file writing을 제공한다.

카메라 앱의 성능은 단일 기능이 아니라 전체 capture pipeline의 품질이다. 빠른 preview, 안정적인 frame cadence, 지속 가능한 system resource 사용, 예측 가능한 file writing이 함께 맞물릴 때 사용자는 중요한 순간을 놓치지 않고 촬영할 수 있다.

---

# 함께 보면 좋은 후속 세션 후보

- Implement high resolution photo capture
- Create a more responsive camera experience
- AVCam: Building a camera app
- Performance and metrics
- AVFoundation 관련 세션
- Instruments / Xcode performance 분석 세션
