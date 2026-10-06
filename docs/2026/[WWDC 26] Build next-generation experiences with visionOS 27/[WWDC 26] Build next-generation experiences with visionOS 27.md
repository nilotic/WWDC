# WWDC26 Build next-generation experiences with visionOS 27 요약

- Session: 287
- Title: Build next-generation experiences with visionOS 27
- Source: https://developer.apple.com/videos/play/wwdc2026/287/
- Topic: visionOS 27, RealityKit, Reality Composer Pro 3, Spatial Preview, Foveated Streaming, Object Tracking, Spatial Accessories, Apple Immersive Video

---

## 한 줄 요약

WWDC26의 “Build next-generation experiences with visionOS 27”은 **visionOS 27에서 공간 경험을 만드는 여러 경로**, **RealityKit과 Reality Composer Pro 3의 3D 제작 흐름**, **Mac/PC 콘텐츠를 Apple Vision Pro로 확장하는 Spatial Preview와 Foveated Streaming**, 그리고 **object tracking, spatial accessories, immersive media pipeline**을 중심으로 차세대 visionOS 경험을 설명한 세션이다.

---

## 핵심 요약

이번 세션은 visionOS 27에서 공간 컴퓨팅 경험을 만드는 방법을 크게 세 흐름으로 정리한다.

1. **visionOS 경험을 만드는 경로**
   - 기존 iOS/iPadOS 앱을 Apple Vision Pro로 가져오기
   - SwiftUI, RealityKit, Reality Composer Pro, CompositorServices로 네이티브 공간 앱 만들기
   - Spatial Preview와 Foveated Streaming으로 Mac/PC 기반 공간 콘텐츠를 Apple Vision Pro로 확장하기

2. **3D 콘텐츠 제작과 렌더링**
   - RealityKit의 physical space lighting, projective textures, cloth simulation, custom reverb mesh, Gaussian Splatting
   - Reality Composer Pro 3의 AI 기반 Assistant, Animation Graph, Script Graph, Navigation Meshes, Shader Graph 확장
   - Unity, Unreal Engine, Godot, custom renderer 지원

3. **상호작용과 미디어 경험**
   - object tracking의 high-frame-rate tracking, extended training, metric pose API
   - iOS와 visionOS 양쪽에서 사용할 수 있는 object tracking
   - 직접 제작 가능한 spatial accessories
   - Apple Immersive Video, Immersive Media Support, wide-aspect-ratio portals, static foveation, ASAF Production Suite 개선
   - Spatial Web, Control Center, High Quality Capture, accessory widget 등 visionOS 27 추가 업데이트

---

# 1. Introduction

세션은 visionOS 플랫폼에서 만들어진 다양한 사례를 소개하며 시작한다. YouTube, Steam Link, Resolution Games 같은 소비자 경험부터 Kia, Innoactive, Laminar Research의 X-Plane처럼 기업·전문 분야에서 Apple Vision Pro를 활용하는 사례까지 언급된다.

Apple은 이러한 피드백이 visionOS의 다음 방향을 만드는 데 중요한 역할을 했다고 설명한다. visionOS 27과 최신 Apple Vision Pro는 M5 칩 기반의 데스크톱급 실시간 렌더링 성능, 눈당 4K가 넘는 초고해상도 디스플레이, 90Hz 손 추적, Apple 생태계와의 깊은 통합을 바탕으로 더 강력한 공간 경험을 제공한다.

---

# 2. visionOS overview

visionOS는 콘텐츠를 여러 방식으로 렌더링할 수 있다.

## Shared Space

Shared Space에서는 앱이 window 또는 volume으로 표시된다. 여러 앱이 동시에 공존할 수 있으며, 사용자는 무한 캔버스 위에 작업 공간을 구성할 수 있다.

## Immersive Space

Immersive Space에서는 앱이 독점적으로 실행되며, 2D와 3D 콘텐츠를 사용자의 시야 어디에나 배치할 수 있다.

Immersive Space에는 세 가지 immersion style이 있다.

| 스타일 | 설명 |
|---|---|
| Mixed | 3D 객체를 실제 공간에 고정해 현실 환경과 함께 보여줌 |
| Progressive | 사용자가 몰입 수준을 직접 조절 |
| Full | 완전히 가상 세계로 이동 |

이 scene model은 앱이 단순한 창 형태에서 완전한 몰입형 경험까지 다양한 스펙트럼으로 확장될 수 있게 한다.

---

# 3. visionOS 경험을 만드는 세 가지 경로

visionOS 경험을 만드는 방법은 크게 세 가지로 정리된다.

## 3.1 기존 iOS/iPadOS 앱 가져오기

이미 iPhone 또는 iPad에서 동작하는 앱은 비교적 적은 변경으로 Apple Vision Pro에서 실행될 가능성이 높다.

| 방식 | 설명 |
|---|---|
| Compatibility | App Store Connect에서 체크박스를 선택해 빠르게 플랫폼에 진입 |
| Recompile | Xcode에서 visionOS deployment target을 추가해 재컴파일 |

이 경로는 기존 앱과 게임을 낮은 마찰로 visionOS에 가져오는 방법이다.

## 3.2 공간 컴퓨팅용 앱 설계

두 번째 경로는 처음부터 공간 컴퓨팅을 위해 앱을 설계하는 것이다.

사용할 수 있는 도구와 프레임워크는 다음과 같다.

| 범주 | 기술 |
|---|---|
| Native frameworks | SwiftUI, RealityKit |
| Authoring tools | Reality Composer Pro |
| Custom rendering | CompositorServices |
| Third-party engines | Unity, Unreal Engine, Godot |

이 방식은 앱이 사용자의 환경과 자연스럽게 섞이고 반응하는 경험을 만들 때 적합하다.

## 3.3 Mac/PC 경험을 visionOS로 확장

visionOS 27은 기존 Mac 또는 PC 기반 경험을 Apple Vision Pro로 가져오는 세 번째 경로를 제공한다.

| 기술 | 설명 |
|---|---|
| Spatial Preview | Mac 앱의 이미지, 문서, 3D 콘텐츠를 Apple Vision Pro로 확장 |
| Foveated Streaming | PC 또는 클라우드의 OpenXR 콘텐츠를 Apple Vision Pro로 스트리밍 |

이 경로는 기존에 Mac이나 PC에서 렌더링하던 고성능 공간 콘텐츠를 visionOS 환경과 연결할 수 있게 한다.

---

# 4. RealityKit과 Reality Composer Pro

## 4.1 RealityKit 업데이트

RealityKit은 visionOS에서 네이티브 공간 경험을 만드는 핵심 렌더링 엔진이다. visionOS 27에서는 현실 공간과 가상 콘텐츠를 더 자연스럽게 연결하는 기능들이 추가된다.

### 주요 기능

| 기능 | 내용 |
|---|---|
| Physical space lighting | 가상 조명이 실제 공간의 표면과 어울리도록 표현 |
| Projective Textures API | spotlight에 텍스처를 투영해 별빛, 스테인드글라스, 물결 caustics 같은 효과 구현 |
| Cloth Simulation | 의상, 침구류 같은 천 소재를 실시간으로 자연스럽게 시뮬레이션 |
| Custom Reverb Mesh | 공간의 재질과 형태를 반영한 사실적인 공간 오디오 반향 |
| Gaussian Splatting | 실제 사물을 스캔해 디테일이 살아있는 3D Gaussian splat으로 렌더링 |

RealityKit의 새 기능들은 시각적 사실성뿐 아니라 공간 오디오와 실제 환경과의 조화를 함께 강화한다.

## 4.2 Reality Composer Pro 3

Reality Composer Pro 3는 RealityKit 기반 공간 콘텐츠를 시각적으로 제작하고 반복할 수 있는 도구로 크게 확장된다.

### 주요 기능

| 기능 | 내용 |
|---|---|
| Reality Composer Pro Assistant | 자연어 설명으로 3D 모델과 텍스처, 재질을 생성하고 scene에 배치 |
| Animation Graph | state machine 기반으로 animation 상태 전환을 시각적으로 구성 |
| Navigation Meshes | 캐릭터가 장애물을 피하고 점프, 사다리, 경로를 따라 이동하도록 mesh 생성 및 조정 |
| Script Graph | tap 같은 이벤트를 받아 scene logic을 node 기반으로 구성 |
| Live Preview | Apple Vision Pro에서 실시간으로 변경 사항 확인 |
| Shader Graph 개선 | subsurface scattering, 피부, 눈, 머리카락, portal 같은 재질 표현 강화 |
| Prototypes / Behavior Trees / Compute Graphs | 더 복잡한 scene logic과 상호작용 제작 지원 |

Reality Composer Pro 3는 Xcode를 열지 않고도 scene 제작, logic 구성, animation, shader, preview를 반복할 수 있는 방향으로 확장된다.

---

# 5. Third-party game engines

visionOS는 Unity, Unreal Engine, Godot 같은 서드파티 게임 엔진도 지원한다.

## Unity

Unity는 Apple Vision Pro 출시 초기부터 visionOS를 지원해왔다. Unity Pro 라이선스가 있으면 Unity 게임을 visionOS로 가져올 수 있다.

| 유형 | 렌더링 방식 |
|---|---|
| Windowed games | RealityKit 기반 네이티브 렌더링 |
| Immersive games | RealityKit 또는 CompositorServices 사용 가능 |

PSVR2 Sense controller 같은 spatial accessory 지원을 위한 플러그인도 제공된다.

## Unreal Engine

Unreal Engine은 immersive mode를 지원한다. 세션에서는 Glassbreakers가 Unreal Engine 기반 게임을 Apple Vision Pro로 가져오면서 static foveation을 사용해 더 선명한 visuals를 구현한 사례가 소개된다.

## Godot

Godot 기반 게임도 Apple Vision Pro에서 실행된다. Apple은 Godot rendering을 위한 CompositorServices 지원, RealityKit 렌더링 플러그인, PHASE 오디오 플러그인을 제공한다.

## Custom rendering engines

자체 렌더링 엔진을 사용하는 경우 CompositorServices framework를 통해 immersive space에 직접 콘텐츠를 렌더링할 수 있다.

---

# 6. Spatial Preview

Spatial Preview는 visionOS 27과 macOS 27에서 Mac의 공간 콘텐츠를 Apple Vision Pro로 확장하는 새로운 macOS framework다.

## 핵심 내용

Spatial Preview는 Mac 앱에서 3D 콘텐츠, spatial photo, Apple Immersive Video 같은 콘텐츠를 Apple Vision Pro에서 바로 preview하고, SharePlay로 협업할 수 있게 한다. 별도의 visionOS 앱을 만들지 않아도 Quick Look 기반으로 공간 콘텐츠를 확인하고 업데이트할 수 있다.

주요 기능은 다음과 같다.

| 기능 | 내용 |
|---|---|
| Mac to Vision Pro preview | Mac 앱의 공간 콘텐츠를 Apple Vision Pro에서 바로 확인 |
| Quick Look integration | spatial photo, Apple Immersive Video, 3D content preview |
| USD live editing | 3D 콘텐츠를 실시간으로 편집 |
| Spatial collaboration | SharePlay 기반 협업 |
| Annotation feedback | 공간 환경 안에서 annotation으로 피드백 |
| Preview app integration | macOS 27 Preview 앱에 3D 편집 도구 통합 |

Cinema4D, SketchUp 같은 앱은 이 기능을 통해 3D 작업물을 Apple Vision Pro 안에서 실시간으로 확인하고 협업할 수 있다.

---

# 7. Foveated Streaming

Foveated Streaming은 Apple Vision Pro가 PC나 클라우드 같은 외부 기기에 연결되어 OpenXR 콘텐츠를 스트리밍할 수 있게 하는 기술이다.

## 동작 방식

visionOS는 손, 컨트롤러 위치, 마이크 같은 입력 데이터를 외부 기기로 보내고, 외부 기기는 OpenXR 콘텐츠의 video와 audio를 Apple Vision Pro로 스트리밍한다. 사용자는 native app처럼 full-scale immersion을 경험한다.

## 주요 사례

| 사례 | 설명 |
|---|---|
| X-Plane 12 | ARKit으로 실제 공간과 장비를 이해하고, PC에서 시뮬레이션을 스트리밍 |
| iRacing | 물리적 racing wheel과 가상 cockpit 위치를 맞춰 몰입형 레이싱 경험 제공 |
| Autodesk VRED | 대규모 고품질 차량 모델을 1:1 scale로 시각화 |

## 기술적 특징

Foveated Streaming은 사용자가 바라보는 위치를 기준으로 video stream 품질을 최적화한다.

| 영역 | 처리 |
|---|---|
| 시선이 집중된 영역 | 높은 품질로 스트리밍 |
| 주변 시야 영역 | 낮은 bandwidth 사용 |
| 전송 기술 | NVIDIA CloudXR 기반 |
| 네트워크 | 로컬 PC 또는 클라우드에서 Wi‑Fi 기반 스트리밍 가능 |

Apple은 하루 만에 OpenXR 앱을 Apple Vision Pro로 스트리밍하기 시작할 수 있고, 일주일 안에 visionOS 고유 기능을 더할 수 있다고 설명한다.

---

# 8. Object tracking과 spatial accessories

## 8.1 Object tracking 개선

Object tracking은 물리적 객체를 가상 anchor로 만드는 기능이다. USDZ 모델로 시작해 Mac의 Create ML에서 reference object를 학습하고, 앱은 object tracking API를 통해 물리 객체의 위치와 방향 업데이트를 받는다.

visionOS 27의 개선 사항은 다음과 같다.

| 기능 | 설명 |
|---|---|
| High-frame-rate tracking | 움직이는 객체에 대해 더 자주 pose update 제공 |
| Extended training | 손에 들고 사용하는 객체에 대해 정확도와 안정성 개선 |
| Metric pose API | display correction이 없는 metric space pose 제공 |
| iOS support | visionOS와 동일한 object tracking 기능을 ARKit API로 iOS에도 제공 |
| Platform-agnostic reference object | Create ML에서 만든 reference object를 iOS와 visionOS 양쪽에서 사용 가능 |

이 기능은 의료 프로브 같은 손에 든 물체를 정확히 추적해 surgical navigation training 같은 고정밀 공간 측정 use case를 가능하게 한다.

## 8.2 Spatial accessories

visionOS 26에서는 Logitech Muse와 PSVR2 Sense controller 같은 spatial accessories가 소개되었다. visionOS 27에서는 직접 spatial accessory를 만들 수 있도록 지원이 확장된다.

Spatial accessory는 다음 구성 요소를 포함하는 전자 장치다.

| 구성 요소 | 역할 |
|---|---|
| LED constellation | Apple Vision Pro가 tracking할 수 있는 LED 패턴 |
| IMU | orientation과 acceleration 측정 |
| Bluetooth chip | Apple Vision Pro로 signal 전송 |
| Buttons / touchpads | 입력 장치 |
| Haptics | 촉각 피드백 |

DFRobot과 MikroE는 reference hardware와 development kit를 제공할 예정이다. 세션에서는 3D 프린트한 flashlight와 steering wheel에 spatial accessory를 탑재한 예시가 소개된다.

Spatial accessories는 낮은 지연 시간과 높은 tracking frequency를 제공하며, occlusion이나 low-light 조건에서도 robust하게 동작하도록 설계된다.

---

# 9. Immersive media

## 9.1 Apple Immersive Video

Apple Immersive Video(AIV)는 visionOS에서 제공되는 최고 품질의 immersive video experience다. 넓은 field-of-view, stereoscopic 180도 capture, fully immersive audio를 통해 현장에 있는 것 같은 경험을 제공한다.

AIV의 특징은 다음과 같다.

| 항목 | 내용 |
|---|---|
| 지원 방식 | Video-on-demand, live broadcast streaming |
| Capture | High-resolution, high-frame-rate, stereoscopic 180도 |
| Frame rate | 90fps |
| Visual acuity | 프레임당 100MP 이상 |
| Metadata | lens calibration 기반 projection 정확도 유지 |
| 처리량 | 초당 100억 픽셀 이상 |

## 9.2 Immersive Media Support framework

Immersive Media Support(IMS)는 Apple Immersive Video의 rich metadata를 읽고 쓰며, immersive content를 authoring하고 수정할 수 있게 하는 framework다.

visionOS 27의 IMS 관련 주요 변화는 다음과 같다.

| 기능 | 설명 |
|---|---|
| Camera presentation override commands | 라이브/복잡한 제작 환경에서 camera parameter를 실시간 override |
| ImmersivePreviewRenderer API | Mac에서 Apple Vision Pro로 AIV를 실시간 preview |
| Wide-aspect-ratio portals | full immersive mode에서 portal mode로 전환할 때 더 넓은 portal 유지 |
| Static foveation sample | streamable frame size 안에서 high-acuity immersive video를 제공하는 sample |
| ASAF Production Suite updates | spatial audio production workflow 개선 |

Wide-aspect-ratio portal은 AVKit의 `AVPlayerViewController` 또는 RealityKit의 `VideoPlayerComponent`에서 custom aspect ratio를 설정해 사용할 수 있다.

## 9.3 Static foveation과 spatial audio

전체 해상도의 AIV를 stereo 90fps로 스트리밍하는 것은 현실적인 네트워크 환경에서 어렵다. 단순히 4K로 축소하면 pixel density가 크게 손상된다.

Apple은 부드러운 static foveation function을 encode 전에 적용해 streamable frame size 안에서도 높은 해상감의 immersive video를 제공하는 sample project를 소개한다.

ASAF Production Suite도 업데이트되어 다음 기능을 제공한다.

- reference video 기준 object positioning
- ambisonics workflow 개선
- Scene Compressor plugin
- heat map drawing 개선
- spatial filtering algorithm 개선

---

# 10. Other visionOS 27 updates

visionOS 27에는 추가적인 플랫폼 개선도 포함된다.

## Spatial Web

Safari on visionOS 27에서는 window를 더 넓은 aspect ratio로 조정할 수 있다. 넓어진 window는 자연스럽게 curve되어 더 많은 콘텐츠를 편안한 시야 안에 배치한다.

Web Environments는 기본 활성화되어, 웹사이트도 앱처럼 배경 환경을 가질 수 있다.

## Control Center와 capture

Control Center는 notifications, system status, controls, environments를 한 곳에 모아 더 간결하게 개선된다.

High Quality Capture를 사용하면 Mac 없이 Apple Vision Pro 안에서 직접 앱을 4K video로 capture할 수 있다.

## Accessory widgets

visionOS는 accessory widget을 지원해 앱의 주요 정보를 작고 glanceable한 형태로 Apple Vision Pro에 표시할 수 있게 한다.

## 기타 업데이트

세션은 Siri 개선, Iceland environment, Spatial Panoramas, Personal Environments, Freeform 업데이트도 함께 언급한다.

---

# 개발자 체크리스트

- [ ] 기존 iOS/iPadOS 앱을 visionOS compatibility 또는 recompilation으로 가져올 수 있는지 확인
- [ ] 공간 컴퓨팅용 신규 앱은 window, volume, immersive space 중 어떤 scene model이 적합한지 정리
- [ ] RealityKit의 physical space lighting, cloth simulation, Gaussian Splatting 적용 가능성 검토
- [ ] Reality Composer Pro 3의 Assistant, Animation Graph, Script Graph, Navigation Meshes workflow 확인
- [ ] Unity, Unreal, Godot 또는 custom renderer를 사용하는 경우 visionOS 지원 방식 확인
- [ ] Mac 기반 3D/공간 콘텐츠 제작 앱은 Spatial Preview framework 적용 가능성 검토
- [ ] PC/OpenXR 기반 immersive experience는 Foveated Streaming 적용 가능성 검토
- [ ] Object tracking이 필요한 경우 Create ML reference object와 iOS/visionOS 공통 사용 흐름 확인
- [ ] Spatial accessory를 사용하는 경험은 Game Controller, ARKit, RealityKit 연동 방식 확인
- [ ] Apple Immersive Video를 다루는 앱은 IMS, ImmersivePreviewRenderer, wide-aspect-ratio portal, static foveation sample 확인
- [ ] visionOS Safari/Web Environment와 accessory widget 지원 여부 검토
- [ ] High Quality Capture를 활용한 앱 영상 제작/검증 workflow 확인

---

# 함께 보면 좋은 후속 세션 후보

- Explore advances in RealityKit
- Supercharge your spatial workflows with Reality Composer Pro 3
- Iterate your spatial scenes faster with Reality Composer Pro 3
- Design no-code games with Reality Composer Pro 3
- Extend Reality Composer Pro 3 functionality with Xcode
- Discover the Spatial Preview framework
- Use foveated streaming to bring immersive content to visionOS
- Explore enhancements to visionOS object tracking
- Build live production tools for Apple Immersive Video
- Learn about Apple Immersive Video technologies
- Support immersive video playback in visionOS apps
- Discover USDKit and what’s new in OpenUSD

---

# 정리

visionOS 27은 Apple Vision Pro에서 공간 경험을 만드는 경로를 크게 넓힌다. 기존 iOS/iPadOS 앱을 빠르게 가져오는 방식, RealityKit과 SwiftUI 기반으로 처음부터 공간 경험을 만드는 방식, 그리고 Mac/PC 기반의 기존 고성능 공간 콘텐츠를 Spatial Preview와 Foveated Streaming으로 확장하는 방식이 함께 제공된다.

RealityKit은 조명, 천 시뮬레이션, 공간 오디오, Gaussian Splatting을 통해 현실감 있는 scene을 만들 수 있도록 확장되고, Reality Composer Pro 3는 AI Assistant, graph 기반 animation과 logic, navigation mesh, shader 개선으로 제작 workflow를 크게 단축한다.

또한 object tracking과 spatial accessories는 물리 세계와 가상 콘텐츠의 연결을 더 정밀하고 반응성 있게 만들며, Apple Immersive Video와 IMS 업데이트는 고품질 immersive media 제작과 preview, streaming workflow를 강화한다. Spatial Web, Control Center, High Quality Capture, accessory widgets 같은 플랫폼 기능도 visionOS 27에서 더 풍부한 공간 경험을 구성하는 기반이 된다.
