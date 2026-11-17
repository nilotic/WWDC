# WWDC26 — Use foveated streaming to bring immersive content to visionOS

- **Session:** 286
- **Source:** https://developer.apple.com/videos/play/wwdc2026/286/
- **Basis:** Apple Developer 공식 전체 transcript 및 Code 섹션
- **Platforms:** visionOS 26.4+, Apple Vision Pro, Windows/OpenXR streaming endpoint
- **Key technologies:** FoveatedStreaming, SwiftUI, RealityKit, ARKit, NVIDIA CloudXR, OpenXR, Bonjour, Xcode Instruments

---

## 🎯 한 줄 요약

Foveated Streaming은 Apple Vision Pro에서 **시선이 향한 영역만 더 높은 품질로 전송하는 동적 foveation**을 visionOS가 직접 처리하면서, 외부 PC나 클라우드에서 렌더링된 OpenXR 콘텐츠를 **무선·저지연 스트리밍**하는 프레임워크다. 앱은 Vision Pro의 native SwiftUI/ARKit/RealityKit 경험과 Windows/OpenXR 콘텐츠를 하나의 immersive experience 안에서 결합할 수 있다.

---

## 🧭 세션 구성

| 시간 | 내용 |
|---|---|
| 0:00 | Introduction |
| 4:08 | How Foveated Streaming works |
| 4:46 | Set up the streaming endpoint |
| 5:18 | Create a visionOS receiver app |
| 8:02 | Integrate with the streaming endpoint |
| 11:28 | Measure performance |
| 11:56 | Enhance with visionOS features |
| 13:56 | Next steps |

---

## 🌐 Foveated Streaming이 해결하는 문제

기존 spatial app 중에는 다음과 같은 이유로 외부 장치가 필요하다.

- PC에서만 실행되는 고사양 시뮬레이션/게임
- OpenXR 등 다른 spatial stack으로 만들어진 기존 앱
- 거대한 3D 모델 또는 시뮬레이션을 로컬 Vision Pro에서 모두 렌더링하기 어려운 워크로드

Foveated Streaming은 이런 콘텐츠를 Vision Pro로 가져오기 위해 **외부 endpoint에서 렌더링하고, Vision Pro가 입력·표시·native UI를 담당하는 분산 구조**를 제공한다.

Apple이 소개한 실제 사례:

- **X-Plane 12**: PC flight simulator를 Vision Pro로 스트리밍하고 ARKit으로 실제 조종 장비 위치를 virtual cockpit과 정렬
- **iRacing**: physical racing wheel과 virtual cockpit을 정렬하고 손 추적을 결합
- **Innoactive + Autodesk VRED**: Kia 디자인 팀이 대형 3D 자동차 자산을 1:1 크기로 검토

---

## 👁️ Foveated Streaming의 핵심: 시선 기반 품질 최적화

Vision Pro는 eye tracking 정보를 사용해 사용자가 보고 있는 영역을 더 높은 품질로 전송한다.

중요한 점은 **앱이 직접 eye tracking 데이터를 받아 foveation logic을 구현하는 구조가 아니라는 것**이다. visionOS가 stream processing을 담당하고, 사용자의 시선 정보는 시스템 내부에서 품질 최적화에 사용된다.

효과:

- 중심 시야에 더 높은 detail 유지
- 주변부 대역폭 절감
- 전체 스트림의 bandwidth 효율 개선
- 낮은 latency 유지
- eye tracking 자체를 앱/endpoint가 직접 다룰 필요 없음

이 구조 덕분에 Apple은 고품질을 유지하면서도 프라이버시 친화적인 구현을 제공한다.

---

## 🏗️ 전체 아키텍처

Foveated Streaming 경험은 크게 두 앱과 세 가지 핵심 기술로 구성된다.

### Vision Pro receiver app

- `FoveatedStreaming.framework`
- SwiftUI
- ARKit
- RealityKit

### Streaming endpoint

- Windows PC 또는 cloud machine
- OpenXR application
- Apple **Foveated Streaming Protocol** 구현
- NVIDIA CloudXR OpenXR runtime

### 역할 분담

```text
Apple Vision Pro
  └─ visionOS receiver app
       ├─ FoveatedStreaming.framework
       ├─ SwiftUI UI
       ├─ ARKit
       └─ RealityKit
              ↕
     Foveated Streaming Protocol
              ↕
Windows / Cloud endpoint
  ├─ OpenXR app
  └─ NVIDIA CloudXR runtime
```

Foveated Streaming Protocol은 **pairing/authentication/session state**를 담당하고, NVIDIA CloudXR은 **실제 immersive video/audio/input streaming**을 담당한다.

---

## 🖥️ Streaming endpoint 구성

Apple은 GitHub에 end-to-end 샘플과 reference implementation을 제공한다.

샘플에는 다음이 포함된다.

- Windows용 Foveated Streaming Protocol reference implementation
- OpenXR sample application
- NVIDIA CloudXR runtime 설정 가이드

Apple은 이 샘플을 기반으로 하면 기본 streaming setup을 **몇 시간~하루 안에 구성할 수 있다**고 설명한다.

---

## 🥽 visionOS receiver app 만들기

receiver app은 사용자를 경험으로 진입시키는 native visionOS 앱이다.

### `FoveatedStreamingSession`

Foveated Streaming framework는 session-based API다.

```swift
import SwiftUI
import FoveatedStreaming

struct ConnectView: View {
    let session: FoveatedStreamingSession

    var body: some View {
        Button("Connect") {
            Task {
                try await session.connect()
            }
        }
    }
}
```

`connect()` 호출 시 framework가 연결 가능한 endpoint 목록을 자동으로 표시한다.

---

## 🔐 Endpoint discovery와 QR pairing

연결 흐름은 다음과 같다.

1. Endpoint가 **Bonjour**를 통해 local network에 노출된다.
2. 사용자가 endpoint를 선택한다.
3. visionOS가 endpoint와 Foveated Streaming Protocol 연결을 만든다.
4. 아직 pairing되지 않았다면 visionOS가 pairing barcode를 요청한다.
5. Endpoint는 QR code를 표시한다.
6. 사용자는 Vision Pro에서 QR code를 바라본다.
7. visionOS가 자동으로 스캔 UI를 제공한다.
8. Pairing이 완료되면 secure stream이 시작된다.
9. `connect()`가 반환된다.

### Barcode payload

Foveated Streaming Protocol 메시지는 JSON으로 encode되고 request/acknowledge pattern을 사용한다.

Pairing barcode에는 다음 두 정보가 들어간다.

- **client token**
- secure connection certificate의 **hash**

두 값 모두 NVIDIA CloudXR SDK가 제공한다.

---

## 📡 Foveated Streaming Protocol

이 프로토콜은 streaming 자체가 아니라 **authentication, pairing, session state**를 담당하는 lightweight TCP connection이다.

주요 역할:

- Endpoint discovery 이후 연결 관리
- Pairing barcode 전달
- Secure stream 인증 보조
- visionOS ↔ endpoint session state 동기화
- streaming ready 상태 전달

### 세션 상태를 반드시 모니터링해야 하는 이유

사용자가 Vision Pro를 벗으면 device가 sleep 상태로 들어간다.

이 직전에 visionOS는 endpoint에 streaming session이 pause된다는 상태를 전달한다. Sleep 상태에서는 모든 연결이 끊어진다.

따라서 endpoint는 다음을 해야 한다.

- pause 상태를 올바르게 처리
- 연결이 끊겨도 endpoint 자체는 계속 discoverable 상태 유지
- 사용자가 Vision Pro를 다시 착용하면 재연결 가능하게 준비

---

## 🪟 ImmersiveSpace에 stream 표시

`FoveatedStreamingSession`을 `ImmersiveSpace`에 넘기면 streamed content가 immersive scene에 포함된다.

```swift
import SwiftUI
import FoveatedStreaming

@main
struct FoveatedStreamingSampleApp: App {
    private let session = FoveatedStreamingSession()

    var body: some SwiftUI.Scene {
        ImmersiveSpace(foveatedStreaming: session)
    }
}
```

이 방식의 중요한 장점은 streamed content를 표시하면서도 **일반 visionOS SwiftUI scene을 그대로 사용할 수 있다는 점**이다.

---

## 🪟 SwiftUI와 함께 구성하기

일반 window와 immersive content를 함께 사용할 수 있다.

```swift
import SwiftUI
import FoveatedStreaming

@main
struct FoveatedStreamingSampleApp: App {
    private let session = FoveatedStreamingSession()
    private let appModel = AppModel()

    var body: some SwiftUI.Scene {
        Window("Main", id: appModel.mainWindowId) {
            ContentView(session: session)
                .environment(appModel)
                .environment(session)
                // ...
        }

        ImmersiveSpace(foveatedStreaming: session) {
            SpatialContainer {
                ReopenMainWindowView().environment(appModel)
                TransformStreamWidgetView().environment(session)
            }
        }
    }
}
```

가능한 조합:

- 일반 2D window
- volumetric window
- immersive space 내부 SwiftUI view
- native spatial gestures
- progressive immersion

Apple 샘플은 session pause/resume window와 main window를 다시 여는 widget을 immersive space에 배치한다.

---

## 🌗 Progressive immersion이 잘 맞는 이유

Apple은 Foveated Streaming에 **progressive immersion**을 특히 권장한다.

이 방식은 사용자가 streamed world를 하나의 portal처럼 보면서 physical environment와의 연결을 유지할 수 있게 한다.

즉, streamed OpenXR world와 visionOS의 real-world blending을 앱이 경험 설계에 맞게 조절할 수 있다.

---

## 🎮 NVIDIA CloudXR와 OpenXR

Streaming endpoint는 NVIDIA CloudXR SDK가 제공하는 **OpenXR runtime for Windows**를 사용한다.

OpenXR application은 이 runtime에 연결되고 CloudXR이 실제 streaming detail을 처리한다.

CloudXR가 자동으로 전달하는 입력 예:

- visionOS hand tracking → OpenXR hand tracking extension
- PlayStation VR2 Sense Controllers passthrough
- 기타 supported controller/input data

즉, controller와 hand tracking을 위한 별도 custom transport를 만들 필요가 없다.

---

## 🌊 Depth와 alpha channel

Apple은 최상의 경험을 위해 두 가지를 권장한다.

### Depth buffer 제공

Depth를 제공하면 Vision Pro가 streamed scene과 native scene의 spatial relationship을 더 자연스럽게 처리할 수 있다.

### Alpha channel 제공

Alpha channel을 사용하면 streamed content와 사용자의 실제 환경을 합성할 수 있다.

이는 progressive immersion, ARKit alignment, RealityKit content compositing에서 특히 중요하다.

---

## 📈 성능 측정: Foveated Streaming Instrument

Xcode에는 **Foveated Streaming instrument**가 제공된다.

측정 항목 예:

- Stream bandwidth
- Pose latency
- Frame rate
- 기타 streaming statistics

이 instrument를 사용해 다음 문제를 분석할 수 있다.

- Bandwidth 부족
- Latency 증가
- Frame rate 하락
- Endpoint/네트워크 병목

스트리밍 품질은 단순 FPS만 볼 것이 아니라 **pose latency와 bandwidth를 함께 확인**해야 한다.

---

## 📬 Message Channels

Foveated Streaming 경험은 Vision Pro receiver와 OpenXR host 두 앱으로 구성되기 때문에, 두 앱 사이에 application-specific data를 주고받을 방법이 필요하다.

이를 위해 **message channels API**가 제공된다.

- visionOS: `FoveatedStreamingSession`의 message channels API
- OpenXR side: NVIDIA CloudXR가 제공하는 OpenXR extension

메시지 payload는 **opaque data blob**이므로 앱이 원하는 형식을 정의할 수 있다.

활용 예:

- SwiftUI에서 level 선택 → OpenXR app에 load command 전송
- OpenXR app → visionOS로 loading progress 보고
- ARKit spatial data를 PC로 전달
- App-specific control/status synchronization

---

## 🧭 ARKit과 coordinate conversion

FoveatedStreamingSession은 **OpenXR coordinate frame과 ARKit coordinate frame 사이를 변환하는 API**를 제공한다.

이를 통해 visionOS에서 인식한 실제 공간 좌표를 OpenXR host와 공유할 수 있다.

X-Plane 사례:

1. visionOS app이 ARKit으로 실제 flight simulator의 위치를 찾는다.
2. 위치 정보를 message channel로 PC에 전달한다.
3. PC의 OpenXR scene이 동일 좌표에 virtual cockpit을 맞춘다.
4. 실제 조종 장치와 가상 cockpit이 정확히 정렬된다.

이 방식은 training, simulation, industrial visualization 등에 특히 유용하다.

---

## 🧊 RealityKit과 streamed content 합성

Foveated Streaming은 OpenXR 화면만 보여주는 것이 아니다. 같은 ImmersiveSpace 안에 native RealityKit content를 함께 배치할 수 있다.

```swift
import SwiftUI
import RealityKit
import FoveatedStreaming

@main
struct FoveatedStreamingSampleApp: App {
    private let session = FoveatedStreamingSession()
    private let appModel = AppModel()

    var body: some SwiftUI.Scene {
        ImmersiveSpace(foveatedStreaming: session) {
            RealityView { content in
                // ...
            }
        }
    }
}
```

OpenXR scene이 depth를 제공하면 streamed content와 RealityKit content 사이에 **올바른 occlusion**도 가능하다.

즉, 하나의 immersive space에서 다음 세 가지를 동시에 구성할 수 있다.

- streamed OpenXR content
- native RealityKit 3D content
- SwiftUI spatial interface

---

## 🔒 Privacy 관점

Foveated Streaming의 핵심 최적화는 eye tracking을 사용하지만, 시선 기반 compression/foveation은 visionOS가 담당한다.

앱 개발자는 eye tracking raw data를 직접 받아 stream quality를 조절할 필요가 없다. 따라서:

- 앱이 사용자의 시선 정보를 직접 처리할 필요 없음
- endpoint가 gaze data를 직접 해석할 필요 없음
- system-managed foveation을 통해 privacy를 유지하면서 bandwidth 이점 확보

이는 단순한 streaming API보다 visionOS integration이 중요한 이유다.

---

## 🧪 구현 순서 체크리스트

### Endpoint
- [ ] Windows/OpenXR application 준비
- [ ] Apple GitHub reference implementation 검토
- [ ] Foveated Streaming Protocol 구현
- [ ] Bonjour discovery 지원
- [ ] QR pairing payload 생성
- [ ] NVIDIA CloudXR OpenXR runtime 설정
- [ ] Session state pause/reconnect 처리
- [ ] Depth buffer 제공 검토
- [ ] Alpha channel 제공 검토

### visionOS receiver
- [ ] `FoveatedStreaming` import
- [ ] `FoveatedStreamingSession` 생성
- [ ] `connect()` UI 구현
- [ ] `ImmersiveSpace(foveatedStreaming:)` 구성
- [ ] Progressive immersion 검토
- [ ] Pause/resume/reconnect UI 제공
- [ ] SwiftUI spatial controls 추가

### Integration
- [ ] Message channels payload protocol 정의
- [ ] ARKit → OpenXR coordinate conversion 필요 여부 확인
- [ ] RealityKit native content 조합 검토
- [ ] Depth 기반 occlusion 테스트
- [ ] Controller/hand tracking passthrough 검증

### Performance
- [ ] Foveated Streaming Instrument trace 수집
- [ ] Bandwidth 확인
- [ ] Pose latency 확인
- [ ] Frame rate 확인
- [ ] Wi-Fi 및 cloud 환경별 비교
- [ ] 장시간 session에서 sleep/reconnect 안정성 테스트

---

## ⚠️ 운영 시 주의점

- Foveated Streaming Protocol과 CloudXR streaming connection은 **서로 별개의 연결**이다.
- Pairing message는 JSON 기반 request/acknowledge 방식이다.
- Device sleep 시 connection이 끊기므로 endpoint가 계속 재연결 가능 상태여야 한다.
- Hand tracking과 controller transport를 별도로 중복 구현할 필요가 없다.
- RealityKit과 streamed content를 정확히 occlude하려면 OpenXR side depth 제공이 중요하다.
- Native UI와 streamed scene을 함께 쓸 때는 latency뿐 아니라 coordinate alignment도 검증해야 한다.
- Eye tracking 기반 foveation은 시스템이 담당하므로 직접 gaze pipeline을 만들지 않는다.

---

## 🧠 핵심 메시지

Foveated Streaming은 Vision Pro를 단순한 wireless display로 사용하는 기술이 아니다. **PC/OpenXR의 고사양 렌더링 성능을 활용하면서도 Vision Pro의 SwiftUI, ARKit, RealityKit, hand tracking, controller input, progressive immersion을 그대로 결합할 수 있게 하는 hybrid spatial architecture**다.

개발 관점에서 가장 중요한 구분은 다음과 같다.

- **Foveated Streaming Protocol**: discovery, pairing, authentication, session state
- **NVIDIA CloudXR**: OpenXR runtime과 low-latency media/input streaming
- **FoveatedStreaming.framework**: visionOS receiver와 native integration
- **Message channels**: 앱별 custom data 교환
- **ARKit/RealityKit**: real-world alignment와 native spatial composition
- **Xcode Foveated Streaming Instrument**: bandwidth/latency/frame rate 검증

이 구조를 이해하면 기존 Windows/OpenXR 콘텐츠를 전부 RealityKit으로 다시 작성하지 않고도 Vision Pro에 가져오면서, 동시에 visionOS만의 native spatial 기능을 단계적으로 추가할 수 있다.

---

## 🔗 공식 자료

- WWDC26 — Use foveated streaming to bring immersive content to visionOS
  - https://developer.apple.com/videos/play/wwdc2026/286/
- Apple Developer — Analyzing the performance of a foveated streaming session
- Apple Developer — Establishing foveated streaming sessions with Apple Vision Pro
- Apple Developer — Streaming a CloudXR application to Apple Vision Pro with foveation
- Apple Developer — Creating a foveated streaming client on visionOS
- Apple Developer — Foveated Streaming framework
- Apple GitHub — StreamingSession sample
