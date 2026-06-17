# WWDC26 Bringing Cyberpunk 2077 to Mac 요약

- Session: 356
- Title: Bringing Cyberpunk 2077 to Mac
- Source: https://developer.apple.com/videos/play/wwdc2026/356/
- Topic: Games, macOS, Apple silicon, Metal, Game Porting Toolkit, MetalFX, EDR, Spatial Audio
- 작성 기준: Apple Developer 공식 세션 transcript 기준

---

## 한 줄 요약

WWDC26의 **Bringing Cyberpunk 2077 to Mac** 세션은 CD PROJEKT RED가 Cyberpunk 2077: Ultimate Edition을 Mac으로 가져오기 위해 Game Porting Toolkit으로 가능성을 평가하고, Metal 기반 네이티브 렌더링 파이프라인과 Apple silicon 최적화, MetalFX, “For this Mac” 프리셋, EDR HDR, 공간 오디오, iCloud Drive 저장 연동 등을 적용한 과정을 설명한다.

---

## 핵심 요약

이 세션은 크게 다섯 가지 흐름으로 구성된다.

1. **Cyberpunk 2077의 기술적 특성**
   - 거대한 오픈 월드 RPG
   - 로딩 없는 대규모 월드 스트리밍
   - 군중, 교통, AI, 물리, 애니메이션, 퀘스트 시스템이 병렬로 동작
   - 네온, 반사, 볼류메트릭, 레이 트레이싱, 패스 트레이싱 등 높은 그래픽 부하

2. **Mac 이식의 판단 기준**
   - Apple silicon의 성능이 Cyberpunk 2077 규모의 게임을 진지한 품질 수준으로 실행할 수 있을 만큼 성장
   - CD PROJEKT RED의 Apple 플랫폼 출시 경험
   - 더 많은 플레이어에게 게임을 제공하려는 목적

3. **Game Porting Toolkit 기반 사전 평가**
   - Windows 빌드를 macOS의 translated environment에서 실행해 가능성 검증
   - CPU/GPU 병목, 프레임 타임, 스레드별 부하, shader translation 문제를 조기 파악
   - 평가 결과를 네이티브 Mac 빌드의 production roadmap으로 전환

4. **네이티브 Mac 구현**
   - Apple silicon용 네이티브 빌드와 macOS toolchain 적용
   - 데이터 파이프라인에 macOS target 추가
   - CPU architecture 차이 검증
   - Metal Shader Converter와 네이티브 Metal rendering foundation 구축
   - MetalFX Upscaling과 Dynamic Resolution Scaling으로 다양한 Mac에서 성능 확장

5. **Mac에서 돋보이는 완성도**
   - “For this Mac” 그래픽 프리셋
   - macOS windowing/app switching 대응
   - Game Mode, Game Controller framework, Magic Mouse/Trackpad 입력 지원
   - EDR 기반 HDR 자동 보정
   - AirPods head-tracked Spatial Audio
   - iCloud Drive와 cross-progression 저장 연동

---

# 1. Cyberpunk 2077이란 무엇인가

Cyberpunk 2077은 Night City를 배경으로 하는 오픈 월드 RPG다. 플레이어는 사이버펑크 용병 V가 되어 도시와 주변 지역을 탐험하고, 다양한 인물과 관계를 맺으며, 선택에 따라 예기치 못한 결과를 마주한다.

이 게임은 거대한 월드와 복잡한 시스템 때문에 업계에서 새로운 하드웨어가 등장할 때마다 성능 벤치마크로 자주 활용된다.

## 기술적으로 demanding한 이유

| 요소 | 설명 |
|---|---|
| 대규모 오픈 월드 | 로딩 화면 없이 거대한 도시와 주변 지역을 계속 스트리밍 |
| CPU 부하 | 군중, 교통, AI, 물리, 애니메이션, 퀘스트, 시스템 상호작용이 병렬로 실행 |
| 복합 조명 | 네온, 간판, 물웅덩이, 반사 표면, 헤드라이트, emissive light, volumetrics가 함께 등장 |
| 고급 그래픽 모드 | 레이 트레이싱과 패스 트레이싱 지원 |
| 확장성 | 다양한 하드웨어에서 동작하도록 설계된 구조 |
| 지속 업데이트 | Ultimate Edition, Metro system, romance 확장, vehicle customization 등 지속적인 콘텐츠 업데이트 |

---

# 2. 왜 Mac으로 가져왔는가

CD PROJEKT RED는 Apple 플랫폼에 게임을 출시해 온 경험이 있으며, Apple silicon의 성능 발전으로 Cyberpunk 2077 규모의 게임을 Mac에서 진지한 품질 수준으로 제공할 수 있다고 판단했다.

Mac 버전을 만드는 목적은 단순히 실행 가능하게 만드는 것이 아니라, CD PROJEKT RED가 이름을 걸고 출시할 수 있는 수준의 품질을 달성하는 것이었다.

## 품질 기준

| 기준 | 설명 |
|---|---|
| Visual fidelity | Cyberpunk 2077 특유의 조명, 재질, 색감, 정체성을 유지 |
| Stable performance | CPU/GPU 부하가 큰 장면에서도 안정적인 프레임 유지 |
| Native feel | macOS에서 자연스럽게 느껴지는 플랫폼 고유 기능과 동작 지원 |

---

# 3. Game Porting Toolkit으로 가능성 평가

Mac 네이티브 구현을 시작하기 전, CD PROJEKT RED는 Apple의 **Game Porting Toolkit**을 사용해 Windows 빌드를 macOS translated environment에서 평가했다.

이 단계의 목적은 최종 성능을 측정하는 것이 아니라, Mac 이식이 설정한 품질 기준에 도달할 수 있는지, 어떤 부분이 CPU/GPU 병목이 되는지, 네이티브 구현 시 어떤 영역을 우선해야 하는지 파악하는 것이었다.

## 평가에서 확인한 항목

| 항목 | 설명 |
|---|---|
| Feasibility | 목표 품질 수준으로 Mac 이식이 가능한지 확인 |
| CPU/GPU pressure | 실제 gameplay에서 CPU와 GPU 중 어디에 부하가 집중되는지 확인 |
| Hotspot sequence | 미리 정한 고부하 장면을 반복 실행 |
| Frame time statistics | in-engine profiler로 일관된 프레임 타임 데이터 비교 |
| Metal HUD | trace, loading, shader translation, save event 등과 scene 상황을 연결 |
| Thread profiling | CPU thread별 활성 시스템과 spike 원인 파악 |

## 평가 결과

초기 평가에서 high-spec Mac의 GPU time은 예상보다 건강한 수준이었고, 네이티브 Metal rendering pipeline으로 옮기면 목표 성능에 도달할 현실적인 경로가 있다고 판단했다.

반면 실제 gameplay, 특히 교통·군중·액션이 밀집된 도시 주행 장면에서는 CPU pressure가 크게 나타났다. Game Porting Toolkit 평가 환경에서는 live shader translation으로 인한 frame time oscillation과 audio middleware 부하도 보였지만, 이는 네이티브 바이너리로 이동하면서 해결될 수 있는 artifact로 파악되었다.

---

# 4. Mac을 실제 target으로 만들기

평가 이후에는 Mac을 production pipeline 안의 실제 target으로 만들었다.

## 핵심 작업

| 작업 | 설명 |
|---|---|
| Native builds | macOS toolchain으로 Apple silicon용 game executable과 개발 도구 빌드 |
| Data pipeline | 기존 플랫폼별 build pipeline에 macOS를 병렬 플랫폼으로 추가 |
| Platform-specific output | archive, shader cache 등 macOS 전용 결과물 생성 |
| Architecture bridge | 다른 CPU architecture 전제에서 온 코드와 엔진 가정을 unit testing으로 검증 |

이 단계가 완료된 뒤 Metal rendering과 shader pipeline 구축으로 넘어갔다.

---

# 5. Metal Shader Converter와 네이티브 Metal 렌더링

기본 Metal path가 frame을 표시할 수 있게 된 뒤, 팀은 **Metal Shader Converter**를 활용해 광범위한 shader coverage를 빠르게 확보했다.

## Shader pipeline 작업 흐름

1. Metal Shader Converter를 shader build에 통합
2. 일반 build 과정에서 Metal shader output 생성
3. 반복 가능한 scene에서 lighting response, material, post effect 차이 검증
4. 변환 결과가 기대와 다른 advanced shader나 edge case를 정제
5. build/test pipeline 안에서 이 과정을 반복

## Metal rendering foundation 구축

네이티브 Metal rendering foundation은 단계적으로 구축되었다.

| 단계 | 설명 |
|---|---|
| Unit tests | Metal backend를 작은 단위로 가져오고 기본 출력 검증 |
| Stationary scenes | lighting stack, post effect, scene-level behavior 검증 |
| Dynamic scenes | camera movement, streaming, gameplay edge case 확인 |
| Ray/path tracing | 다른 플랫폼과 visual output을 유지하면서 성능 최적화 |

---

# 6. MetalFX와 Dynamic Resolution Scaling

네이티브 Metal 기반이 안정된 뒤, 다양한 Mac에서 성능을 확장하기 위해 **MetalFX Upscaling**을 사용했다.

MetalFX는 낮은 내부 해상도로 렌더링한 뒤 더 높은 해상도의 출력으로 재구성해 heavy scene에서 성능 여유를 제공한다.

또한 **Dynamic Resolution Scaling**을 함께 사용해 부하 상황에서 안정적인 성능을 유지했다. temporal upscaler로 동작하기 때문에 빠른 이동이나 VFX가 많은 장면에서도 이미지 품질을 유지하는 데 도움이 되었다.

---

# 7. “For this Mac” 프리셋

게임이 playable한 상태가 된 후, 팀은 Mac에서 첫 실행부터 좋은 경험을 제공하기 위해 **“For this Mac”** 프리셋을 만들었다.

“For this Mac”은 Mac의 하드웨어를 감지해 해당 기기에 적합한 그래픽 설정을 자동 구성하는 device-based graphics preset이다.

## 프리셋 구성 요소

| 항목 | 설명 |
|---|---|
| Hardware detection | 지원 Mac의 하드웨어를 감지 |
| Target FPS | 기기별로 30fps 또는 60fps 목표 설정 |
| MetalFX | Dynamic Resolution Scaling과 함께 사용 |
| Resolution boundaries | 목표 FPS 달성을 위해 최소/최대 내부 해상도 조정 |
| Video settings | 최종 출력 해상도, VSync, HDR 등을 함께 조정 |
| Per-device tuning | 각 Mac에서 설정을 하나씩 튜닝하고 재검증 |

세션에서는 M5 Max MacBook Pro에서 Ultra preset을 기반으로 60fps를 목표로 설정하고, MetalFX Dynamic Resolution Scaling이 목표 출력 해상도의 50~80% 사이에서 렌더링하도록 설정된 예시를 보여주었다.

HDR capable display에서는 HDR이 기본 활성화되며, Apple의 EDR API를 사용해 별도 calibration screen 없이 자동 보정된다.

---

# 8. macOS에서 네이티브처럼 느껴지게 만들기

CD PROJEKT RED는 설정 최적화에 그치지 않고 macOS의 플랫폼 기능을 적극적으로 적용했다.

## 적용 범위

| 영역 | 내용 |
|---|---|
| Windowing / App switching | macOS notification을 활용해 focus, occlusion, display 변경 대응 |
| Game Mode | 게임 앱으로 분류되면 자동 활성화되어 CPU/GPU 우선순위와 무선 입력 지연 개선 |
| Game Controller | Game Controller framework로 서드파티 controller와 고급 controller 기능 지원 |
| Native input | Magic Mouse와 trackpad 지원 |
| Display | EDR 기반 HDR 자동 보정 |
| Audio | AirPods head-tracked spatial audio 지원 |
| Saves | iCloud Drive와 자체 cross-progression으로 저장 파일 이동 지원 |

---

# 9. Windowing과 app switching 대응

macOS는 window 상태나 display 설정 변경을 notification으로 알려준다. Cyberpunk 2077 Mac 버전은 이러한 notification을 활용해 시스템과 자연스럽게 어울리는 경험을 제공한다.

## 사용한 notification 예시

| Notification | 활용 방식 |
|---|---|
| `NSWindowDidChangeOcclusionStateNotification` | window가 보이지 않을 때 rendering을 줄이거나 중단 |
| `NSApplicationDidChangeScreenParametersNotification` | display 설정 변경 시 새로운 resolution을 반영 |
| `NSWindowDidChangeScreenNotification` | game window가 다른 display로 이동했을 때 display 정보 갱신 |
| `NSWindowDidResignKeyNotification` | focus를 잃으면 game cursor를 숨기고 system cursor 표시 |
| `NSWindowDidBecomeKeyNotification` | focus를 얻으면 system cursor를 숨기고 game cursor 표시 |

게임이 background에 있거나 보이지 않을 때는 렌더링이 필요하지 않으므로 CPU/GPU 활동을 줄인다. 이는 플레이어의 시스템 자원을 절약하고 macOS의 multitasking 환경에 더 잘 맞는 동작이다.

---

# 10. 입력 장치와 Game Mode

Game Mode는 Apple 플랫폼에서 게임에 CPU/GPU 우선 접근을 제공하고 background task의 영향을 줄여 더 부드러운 경험을 만든다. 또한 Bluetooth sampling rate를 두 배로 높여 무선 controller와 AirPods의 latency를 줄인다.

Cyberpunk 2077은 Game Controller framework를 통해 다양한 서드파티 controller를 지원하고, touchpad와 adaptive trigger 같은 고급 controller 기능도 기존 구현과 쉽게 연결했다.

Mac 고유 입력 장치인 Magic Mouse와 trackpad도 지원한다. 예를 들어 trackpad가 있는 Mac laptop에서는 toggle aiming을 자동 활성화하고, modifier key와 mouse click을 사용해 middle mouse button의 대체 동작을 제공한다.

---

# 11. EDR 기반 HDR 자동 보정

Cyberpunk 2077의 Night City는 네온, 어두운 골목, 밝은 간판, 반사 표현이 중요한 게임이기 때문에 HDR 표현이 매우 중요하다.

Mac 버전은 Apple의 **Extended Dynamic Range** pipeline을 사용해 display 정보를 기반으로 HDR presentation을 자동 보정한다.

## EDR 활용 방식

| API / 값 | 역할 |
|---|---|
| `maximumExtendedDynamicRangeColorComponentValue` | 현재 display의 최대 EDR 값을 확인하고 tone mapper에 전달 |
| `maximumPotentialExtendedDynamicRangeColorComponentValue` | display의 잠재 EDR headroom 확인 |
| 기준값 2.0 초과 | HDR을 기본 활성화할 수 있는 display로 판단 |

이 방식 덕분에 플레이어는 HDR calibration screen을 거치지 않아도 Apple display에서 적절한 HDR 출력을 얻을 수 있다.

---

# 12. Spatial Audio와 저장 연동

Cyberpunk 2077의 사운드스케이프는 공간 오디오와 잘 맞도록 설계되어 있다. Mac 버전은 Apple의 spatial audio API를 활용해 AirPods 사용자를 위한 head-tracked spatial audio를 지원한다.

구현은 audio middleware가 AVAudioEngine을 통해 Apple의 spatial audio API를 사용하는 방식이며, `AVAudioEnvironmentNode`의 `listenerHeadTrackingEnabled`를 `true`로 설정해 head tracking을 활성화한다.

저장 파일 측면에서는 iCloud Drive integration을 지원해 Apple 기기 간 저장 파일을 옮길 수 있고, CD PROJEKT RED의 자체 cross-progression 솔루션을 통해 다른 플랫폼과도 진행 상황을 이어갈 수 있다.

---

# 13. 결과

Cyberpunk 2077은 Apple silicon Mac에서 네이티브 경험을 제공하게 되었고, 시각적 정체성, 안정적인 성능, macOS 고유 기능을 함께 갖춘 버전으로 완성되었다.

세션에서는 Cyberpunk 2077이 전체 플랫폼에서 3,500만 장, Phantom Liberty가 1,000만 장 판매되었다고 언급했다. 또한 Cyberpunk 2077: Ultimate Edition은 Apple의 2025 App Store Awards에서 **Mac Game of the Year**로 선정되었다.

---

# 개발자 체크리스트

- [ ] Game Porting Toolkit evaluation environment로 Windows build를 먼저 평가
- [ ] Metal HUD로 translated environment와 native build의 frame time을 비교
- [ ] 고부하 hotspot scene을 미리 정의하고 반복 측정
- [ ] CPU/GPU pressure를 구분해 production roadmap 작성
- [ ] macOS를 build/data/shader pipeline 안의 실제 target으로 추가
- [ ] Apple silicon native build와 toolchain 검증
- [ ] architecture-specific assumption을 unit test로 확인
- [ ] Metal Shader Converter를 shader build pipeline에 통합
- [ ] stationary scene과 dynamic scene을 나눠 rendering fidelity 확인
- [ ] MetalFX Upscaling과 Dynamic Resolution Scaling으로 성능 확장
- [ ] 기기별 first-launch graphics preset 설계
- [ ] target FPS, VSync, internal resolution range, HDR 기본값을 기기별로 조정
- [ ] window occlusion, focus, display 변경 notification 대응
- [ ] background 상태에서 CPU/GPU 활동 줄이기
- [ ] Game Controller framework와 Mac native input device 지원
- [ ] EDR API를 사용해 HDR output 자동 보정
- [ ] AirPods head-tracked spatial audio 지원 검토
- [ ] iCloud Drive 또는 cross-progression으로 저장 파일 이동 경험 제공

---

# 함께 보면 좋은 후속 세션 후보

- Find and fix performance issues in your Metal games
- Speedrun your game port with agentic coding
- Download the Game Porting Toolkit
- Performing your own tone mapping
- Personalizing spatial audio in your app
- Metal Shader Converter 관련 세션
- MetalFX 관련 세션
- Game Controller framework 관련 세션

---

# 정리

이 세션은 Cyberpunk 2077: Ultimate Edition의 Mac 이식 과정을 통해, 대규모 AAA 게임을 Apple silicon Mac에서 네이티브 품질로 제공하기 위해 필요한 흐름을 보여준다.

핵심은 먼저 Game Porting Toolkit으로 가능성과 병목을 파악하고, 그 결과를 바탕으로 네이티브 build pipeline, Metal rendering, shader conversion, 성능 확장 전략을 구축하는 것이다. 이후에는 “For this Mac” 프리셋처럼 첫 실행부터 좋은 설정을 제공하고, macOS의 windowing, input, display, audio, save 기능을 통합해 Mac에서 자연스럽게 느껴지는 완성도를 더한다.

Cyberpunk 2077 사례는 Mac 게임 이식이 단순히 코드를 실행시키는 작업이 아니라, 성능 측정, 렌더링 품질 보존, 하드웨어별 설정 최적화, 플랫폼 고유 기능 통합을 함께 수행하는 과정임을 보여준다.
