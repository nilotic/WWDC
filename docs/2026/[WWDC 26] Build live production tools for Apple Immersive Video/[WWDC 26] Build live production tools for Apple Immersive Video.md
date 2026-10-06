# WWDC26 Build live production tools for Apple Immersive Video 요약

- Session: 338
- Title: Build live production tools for Apple Immersive Video
- Source: https://developer.apple.com/videos/play/wwdc2026/338/
- Topic: Apple Immersive Video, Live Production, SMPTE 2110, ProRes, Spatial Audio, AVFoundation, VideoToolbox, Immersive Media Support

---

## 한 줄 요약

WWDC26의 “Build live production tools for Apple Immersive Video”는 Apple Immersive Video를 라이브 방송 제작 워크플로에 통합하기 위해 필요한 **라이브 제작 파이프라인**, **몰입형 라이브 포맷**, **SMPTE 2110 기반 실시간 전송**, 그리고 **AVFoundation과 Immersive Media Support를 활용한 녹화 및 재생 방식**을 설명한 세션이다.

---

## 핵심 요약

이 세션은 Apple Immersive Video를 단순한 재생 포맷이 아니라 **라이브 제작 도구와 방송 워크플로에서 다룰 수 있는 프로덕션 포맷**으로 설명한다.

핵심 흐름은 다음과 같다.

1. **Live production overview**
   - 라이브 제작은 production domain과 delivery domain으로 나뉜다.
   - 카메라, 그래픽 시스템, 리플레이 시스템, 비디오 스위처, 마이크, 오디오 콘솔, 미디어 라우터가 함께 동작한다.
   - 모든 제작 도구는 실시간으로 미디어를 주고받으며 최종 라이브 스트림을 만든다.

2. **What makes immersive live different**
   - Apple Immersive Video는 사용자를 이벤트 현장 안으로 데려가는 경험을 목표로 한다.
   - 기존 2D 방송보다 훨씬 큰 해상도와 높은 프레임레이트가 필요하다.
   - Apple Spatial Audio Format, ASAF는 64개 이상의 채널을 포함할 수 있다.
   - 이 규모와 품질 요구사항 때문에 기존 방송 도구와 전송 방식만으로는 충분하지 않다.

3. **Immersive live format**
   - 라이브 몰입형 제작 포맷은 세 가지 미디어 요소로 구성된다.
   - ProRes 기반 immersive video
   - PCM 기반 ASAF spatial audio
   - 프레임 단위 JSON metadata
   - 세 요소가 함께 Apple Immersive Live production format을 구성한다.

4. **Real-time media transport**
   - 제작 장비 사이의 실시간 미디어 교환에는 SMPTE 2110 표준을 사용한다.
   - 비디오는 2110-22, 오디오는 2110-30, 메타데이터는 2110-41로 전송된다.
   - Immersive ProRes video는 왼쪽 눈과 오른쪽 눈 데이터를 하나의 2110-22 스트림 안에 별도 essence로 담는다.

5. **Recording and playback**
   - 라이브 미디어는 이미 ProRes 기반이므로 추가 인코딩/디코딩 없이 MOV 파일에 저장할 수 있다.
   - AVAssetWriter를 사용해 video, audio, metadata track을 기록한다.
   - Immersive Media Support framework는 Apple Immersive Video에 필요한 metadata를 읽고 쓰는 데 사용된다.

---

# 1. Introduction

세션은 Apple Immersive Video 라이브 스트리밍이 스포츠, 음악, 엔터테인먼트 이벤트를 Apple Vision Pro에서 현장감 있게 경험하게 만든다는 소개로 시작한다.

Apple은 이미 Spectrum SportsNet 및 NBA 앱을 통해 일부 LA Lakers 경기를 Apple Vision Pro에서 라이브로 제공한 사례를 언급한다. 팬들은 실제 경기장에 있는 것처럼 코트사이드 시점에서 경기를 볼 수 있었고, 라이브 immersive camera, 데이터 기반 그래픽, spatial audio가 함께 사용되었다.

이 세션의 목적은 Apple Immersive Video를 위한 차세대 제작 도구, 워크플로, 라이브 경험을 만들 수 있도록 필요한 기술적 기반을 설명하는 것이다.

---

# 2. Live production overview

라이브 제작 파이프라인은 크게 두 영역으로 나뉜다.

| 영역 | 설명 |
|---|---|
| Production domain | 비디오, 오디오, 데이터가 캡처되고 제작되는 영역 |
| Delivery domain | 제작된 콘텐츠가 인코딩되고 시청자에게 실시간 스트리밍되는 영역 |

이 세션은 주로 **production domain**에 집중한다.

## 라이브 제작을 구성하는 주요 도구

| 구성 요소 | 역할 |
|---|---|
| Live cameras | 이벤트 장면을 다양한 각도에서 캡처 |
| Graphics systems | 이름, 점수판, 애니메이션 등 그래픽 요소 생성 |
| Replay systems | 라이브 미디어를 기록하고 다시 재생 |
| Video switchers | 카메라 전환, 그래픽 오버레이, 최종 화면 구성 |
| Microphones | 해설, 인터뷰, 음악, 현장음을 수집 |
| Audio consoles | 여러 오디오 소스를 조합해 최종 mix 생성 |
| Media router | 모든 장비가 신호를 주고받는 중앙 네트워크 계층 |

라이브 제작에서는 각 장비가 독립적으로 동작하는 것이 아니라, 미디어 라우터를 통해 서로의 비디오, 오디오, 데이터 신호를 실시간으로 교환한다.

---

# 3. What makes immersive live different

Apple Immersive Video 라이브 제작은 기존 2D 방송과 같은 기반을 공유하지만 요구사항은 훨씬 크다.

## 주요 차이

| 항목 | 내용 |
|---|---|
| Fidelity | 사용자를 콘텐츠 안으로 데려가기 때문에 품질 손실에 더 민감 |
| Presence | 현장 안에 있는 듯한 존재감을 유지해야 함 |
| Video resolution | 일반적인 2D 방송 제작보다 약 32배 큰 해상도 |
| Frame rate | 일반적인 2D 방송보다 2배 높은 프레임레이트 |
| Spatial audio | ASAF mix는 64개 이상의 채널을 포함 가능 |
| Workflow | 기존 도구, 전송 방식, 포맷만으로는 규모를 감당하기 어려움 |

몰입형 라이브에서는 작은 품질 저하도 사용자가 체감하는 현장감에 큰 영향을 줄 수 있다. 따라서 미디어 포맷, 제작 도구, 장비 간 전송 방식까지 기존 2D 방송과 다른 접근이 필요하다.

---

# 4. Immersive live format

Apple Immersive Live Video 제작 포맷은 세 가지 기존 표준을 조합해 구성된다.

| 미디어 유형 | 포맷 | 설명 |
|---|---|---|
| Video | Streamed ProRes frames | 비압축 프레임 대신 ProRes 프레임을 스트리밍 |
| Audio | PCM audio tracks | ASAF spatial audio mix를 구성하는 uncompressed PCM |
| Metadata | Per-frame JSON objects | 렌즈 보정, creative event, spatial audio behavior 등 |

## ProRes video

Apple Immersive Live Video는 일반 방송 카메라에서 흔히 사용하는 비압축 비디오 프레임 대신 **streamed ProRes frames**로 구성된다.

ProRes는 높은 이미지 품질과 실용적인 대역폭 사이의 균형을 제공한다. Apple Silicon은 ProRes 처리에 최적화되어 있기 때문에 Apple Immersive Video 제작 도구와 파이프라인을 만들기에 적합하다.

## ASAF audio

ASAF, Apple Spatial Audio Format의 오디오 믹스는 표준 uncompressed PCM audio track으로 구성된다. 여기에는 high-order ambisonic bed와 spatial audio object channel이 포함될 수 있다.

## Per-frame JSON metadata

메타데이터는 프레임 단위 JSON 객체로 전달된다.

예시는 다음과 같다.

- lens calibration
- creative event
- spatial audio behavior
- camera ID
- motion data
- 관련 비디오/오디오 feed 속성

이 metadata는 비디오와 오디오만으로는 표현할 수 없는 몰입형 제작 정보를 실시간으로 전달한다.

---

# 5. Real-time media transport

라이브 제작 장비 사이의 실시간 미디어 교환에는 **SMPTE 2110** 표준을 사용한다.

SMPTE 2110은 IP 네트워크 위에서 전문 미디어를 전송하기 위한 업계 표준이며, 방송 시설과 전문 도구 생태계에서 널리 사용된다.

## SMPTE 2110과 RTP

SMPTE 2110은 multicast RTP, Real-time Transport Protocol을 사용해 네트워크에서 미디어를 이동시킨다. RTP stream은 주 미디어 payload와 함께 timing information, user flag, metadata 등을 전달한다.

## 미디어 유형별 전송 방식

| 미디어 | SMPTE 2110 표준 | 설명 |
|---|---|---|
| Immersive ProRes video | 2110-22 | compressed media over IP |
| ASAF audio | 2110-30 | standard audio transport |
| JSON metadata | 2110-41 | user-defined metadata over IP |

## 2110-22 video flow

Immersive ProRes video는 2110-22 stream으로 전송된다.

중요한 점은 왼쪽 눈과 오른쪽 눈의 immersive content가 각각 별도의 data essence로 존재하지만, 하나의 2110-22 stream 안에 포함된다는 것이다.

이 방식의 장점은 다음과 같다.

- left/right eye를 하나의 side-by-side raster로 frame packing할 필요가 없음
- left eye와 right eye를 별도 IP stream으로 관리할 필요가 없음
- production architecture에서 양안 비디오 feed 관리 복잡도가 줄어듦

## 2110-30 audio flow

ASAF audio는 2110-30 stream으로 전송된다. 이 stream에는 ASAF spatial audio mix를 구성하는 high-order ambisonics와 audio object channel이 포함된다.

## 2110-41 metadata flow

JSON metadata는 2110-41 stream으로 전송된다.

이 metadata는 lens calibration, creative event, motion data 같은 정보를 video/audio feed와 함께 실시간으로 전달한다.

---

# 6. Recording and playback

라이브 방송에서 feed를 기록하고 다시 재생하는 기능은 필수다. 예를 들어 instant replay, archive, editorial, post production workflow가 모두 여기에 포함된다.

기존 2D workflow에서는 라이브 비디오를 파일로 저장할 때 인코딩, 디코딩, 재인코딩이 반복되며 품질 손실이 생길 수 있다. Apple Immersive Video에서는 이러한 손실이 몰입감에 더 크게 영향을 줄 수 있다.

Apple Immersive Video live format은 이 문제를 ProRes 기반 구조로 해결한다.

## 핵심 아이디어

라이브 미디어가 이미 file-friendly ProRes payload로 생성되기 때문에, 디스크에 저장할 때 추가 인코딩이나 디코딩이 필요하지 않다.

즉, 같은 ProRes frame을 그대로 MOV 파일에 복사하고, 재생 시 다시 2110 stream으로 내보낼 수 있다.

이 구조의 장점은 다음과 같다.

- 카메라에서 생성된 live content를 그대로 전송
- 중간 장비에서 기록 가능
- MOV 파일로 저장 가능
- 편집 및 후반 작업에 활용 가능
- live playout으로 다시 출력 가능
- 반복적인 압축/해제에 따른 품질 저하 방지

---

# 7. AVAssetWriter와 MOV 저장

Apple Immersive Video live stream을 파일로 저장할 때는 AVFoundation의 `AVAssetWriter`를 사용한다.

## Video track

비디오 feed는 QuickTime MOV의 video track에 저장한다.

MOV video track에는 live stream과 동일한 해상도, 프레임레이트, stereo image data가 유지된다.

비디오 track을 쓸 때는 VideoToolbox의 새 compression property를 설정해야 한다.

```swift
import VideoToolbox

let compressionProperties: [String: Any] = [
    kVTCompressionPropertyKey_ProjectionKind as String: kVTProjectionKind_AppleImmersiveVideo
]
```

이 설정은 MOV 파일에 Apple Immersive Video임을 나타내는 video extended usage, `vexu` static metadata를 추가한다.

## Audio track

오디오 feed는 일반적인 방식으로 MOV의 audio track에 저장한다. 2110 stream에 포함된 uncompressed PCM audio가 그대로 기록된다.

## Metadata track

streamed JSON data는 MOV container 안의 Metadata Box Exchange, MEBX track에 저장한다.

저장 전에 JSON data를 deserialize하고 parse한 뒤, Immersive Media Support framework를 사용해 lens calibration object, camera ID, 기타 metadata object를 만들어 video/audio와 동기화해 기록한다.

---

# 8. Immersive Media Support framework

Immersive Media Support, IMS는 visionOS 26에서 처음 소개된 framework다.

IMS는 Apple Immersive Video에 필요한 핵심 metadata를 읽고 쓰기 위한 기능을 제공하며, creative workflow에서 콘텐츠 preview를 지원한다.

## IMS의 역할

| 역할 | 설명 |
|---|---|
| Metadata parsing | streamed JSON data를 Apple Immersive Video metadata로 변환 |
| Metadata writing | lens calibration, camera ID 등 metadata를 MOV track에 기록 |
| Synchronization | video/audio와 metadata를 시간적으로 맞춤 |
| Preview support | creative workflow에서 immersive content preview 지원 |

AVFoundation, VideoToolbox, Core Audio가 immersive video/audio 처리의 기반이라면, IMS는 Apple Immersive Video 전용 metadata와 creative workflow를 다루는 핵심 framework로 소개된다.

---

# 9. Playback workflow

파일 재생 시에는 녹화 과정을 반대로 수행한다.

| 단계 | 내용 |
|---|---|
| 1 | MOV의 video, audio, metadata track 읽기 |
| 2 | ProRes video frame을 그대로 추출 |
| 3 | PCM audio track 읽기 |
| 4 | MEBX metadata track에서 immersive metadata 읽기 |
| 5 | 각 media type을 다시 2110 output stream으로 전송 |
| 6 | production workflow 안의 다른 장비가 live feed처럼 사용 |

이 방식은 instant replay나 live playout에서 중요하다. 저장된 콘텐츠가 다시 라이브 제작 파이프라인에 들어가도 품질 손상이 발생하지 않는 구조이기 때문이다.

---

# 10. 주요 프레임워크와 표준

## Apple frameworks

| Framework | 역할 |
|---|---|
| AVFoundation | MOV 기록/재생, AVAssetWriter 기반 파일 처리 |
| VideoToolbox | ProRes video 및 Apple Immersive Video projection metadata 설정 |
| AudioToolbox / Core Audio | PCM audio 및 spatial audio 관련 처리 |
| Immersive Media Support | Apple Immersive Video metadata 읽기/쓰기 및 preview 지원 |

## Media standards

| 표준 | 역할 |
|---|---|
| Apple ProRes | 고품질 video codec |
| ASAF | Apple Spatial Audio Format |
| SMPTE 2110 | IP 네트워크 기반 professional media transport |
| SMPTE 2110-22 | compressed video transport |
| SMPTE 2110-30 | audio transport |
| SMPTE 2110-41 | user-defined metadata transport |
| QuickTime MOV | video/audio/metadata 저장 container |
| MEBX | metadata track 저장 형식 |

---

# 11. 구현 체크 포인트

- Apple Immersive Live Video 포맷을 ProRes video, PCM ASAF audio, per-frame JSON metadata의 조합으로 이해한다.
- 실시간 장비 간 전송은 SMPTE 2110 기반으로 설계한다.
- video stream은 2110-22, audio stream은 2110-30, metadata stream은 2110-41을 사용한다.
- left/right eye video를 별도 stream으로 분리하거나 frame packing하지 않고, 하나의 2110-22 stream 안에 별도 essence로 담는 구조를 고려한다.
- live feed 저장 시 추가 인코딩/디코딩 없이 ProRes frame을 MOV video track에 기록한다.
- `kVTCompressionPropertyKey_ProjectionKind`에 `kVTProjectionKind_AppleImmersiveVideo`를 설정해 MOV 파일에 올바른 immersive metadata를 추가한다.
- ASAF audio는 PCM audio track으로 기록한다.
- per-frame JSON metadata는 IMS를 통해 MEBX metadata track으로 변환 및 기록한다.
- playback 시 MOV의 video/audio/metadata track을 읽어 다시 2110 output stream으로 전송한다.
- AVFoundation, VideoToolbox, AudioToolbox/Core Audio, Immersive Media Support의 역할을 분리해 설계한다.

---

# 함께 보면 좋은 후속 세션 후보

- Learn about Apple Immersive Video technologies
- Support immersive video playback in visionOS apps
- Decode ProRes with AVFoundation and VideoToolbox
- AVFoundation 관련 세션
- VideoToolbox 관련 세션
- visionOS immersive media 관련 세션
- Spatial Audio / ASAF 관련 세션
- SMPTE 2110 관련 외부 표준 문서

---

# 정리

이 세션은 Apple Immersive Video를 라이브 제작 환경에서 다루기 위한 기본 구조를 설명한다. 핵심은 기존 방송 제작의 production domain을 이해한 뒤, Apple Immersive Video가 요구하는 고해상도, 고프레임레이트, ASAF spatial audio, 프레임 단위 metadata를 실시간 제작 워크플로 안에서 어떻게 교환하고 기록할지 이해하는 것이다.

Apple은 이를 위해 ProRes video, PCM audio, JSON metadata를 조합한 immersive live format을 제시하고, SMPTE 2110을 통해 장비 간 실시간 전송을 수행한다. 녹화와 재생은 AVAssetWriter, VideoToolbox, Immersive Media Support를 사용해 MOV container 안에 video, audio, metadata를 품질 손실 없이 저장하고 다시 live stream으로 내보내는 방식으로 구성된다.

결과적으로 Apple Immersive Video live workflow는 전통적인 라이브 방송의 기반 위에 구축되지만, 포맷과 전송, metadata, 녹화/재생 방식 전반에서 몰입형 경험을 보존하기 위한 새로운 제작 구조를 요구한다.
