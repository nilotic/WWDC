# WWDC25 세션 317 — What’s new in visionOS 26 요약

<br>
## ✨ 개요

* 이번 세션은 **visionOS 26의 전체 플랫폼 업데이트**를 폭넓게 정리하는 세션입니다.
* 큰 흐름은 여덟 가지입니다.
  * **볼류메트릭 UI와 3D 레이아웃 확장**
  * **SwiftUI·RealityKit·ARKit 통합 강화**
  * **시스템 기능과 공간 복원, 위젯 개선**
  * **게임, 액세서리, 렌더링 기능 확장**
  * **SharePlay와 Nearby Window Sharing**
  * **몰입형 미디어와 APMP**
  * **Spatial Web과 Safari 개선**
  * **엔터프라이즈 전용 API와 배포 기능 강화**
* 전체적으로 보면 visionOS 26은 단순히 기능 몇 개를 추가한 버전이 아니라, **공간 UI·게임·미디어·웹·엔터프라이즈까지 플랫폼 전반을 한 단계 확장한 업데이트**라고 볼 수 있습니다.

<br>
## 🧱 볼류메트릭 기능과 SwiftUI 3D 레이아웃

* visionOS 26에서는 SwiftUI가 **더 본격적인 3D UI 프레임워크**로 확장됩니다.
* 기존 레이아웃에 **depth alignment** 가 추가되어, 2D 스택과 유사한 방식으로 3D 정렬을 만들 수 있습니다.
* `rotation3DLayout` 같은 도구를 사용하면, 레이아웃 시스템 안에서 3D 회전을 처리하면서 그 결과를 다시 뷰 쪽 상태와 연결할 수 있습니다.
* 즉 2D UI를 구성하던 익숙한 방식으로, **깊이 개념이 있는 공간 배치**를 만들 수 있게 된 점이 핵심입니다.
* 또 volume 안에서도
  * alert
  * sheet
  * menu
  * popover
  같은 **일시적 UI presentation** 을 직접 표시할 수 있게 되었습니다.
* 앱 경계 밖으로 일부 콘텐츠를 자연스럽게 내보내는 **dynamic bounds restrictions** 도 추가되어, 앱 크기를 바꾸지 않고도 더 몰입감 있는 공간 표현이 가능합니다.

<br>
## 🖐️ 오브젝트 조작과 3D 콘텐츠 표현

* 가상 오브젝트를 더 자연스럽게 다루기 위한 **Object Manipulation API** 도 도입되었습니다.
* SwiftUI에서는 뷰 modifier 하나로, RealityKit에서는 `ManipulationComponent` 로 이 기능을 적용할 수 있습니다.
* Quick Look으로 미리 보는 3D 모델도 이 조작 방식을 기본 지원합니다.
* 손으로 실제 물체를 잡고 돌리는 것 같은 **직관적인 회전과 재배치 경험**을 쉽게 줄 수 있게 된 셈입니다.
* `Model3D` 도 더 강력해졌습니다.
  * 애니메이션 재생/일시정지/재개/정지
  * 재생 시간 제어
  * USD variant 선택
  * `.reality` 파일 구성 선택
  등이 가능해졌습니다.
* `RealityView` 에는 `realityViewSizingBehavior` 가 추가되어, 3D 콘텐츠 크기와 뷰 레이아웃의 관계를 더 세밀하게 조정할 수 있습니다.

<br>
## 🔗 SwiftUI · RealityKit · ARKit 통합 강화

* visionOS 26은 세 프레임워크의 연결을 훨씬 더 부드럽게 만들었습니다.
* 가장 중요한 변화 중 하나는 **Unified Coordinate Conversion API** 입니다.
* 이제 SwiftUI view, RealityKit entity, ARKit accessory anchor 사이 좌표 변환이 더 직접적이고 단순해졌습니다.
* RealityKit의 `Entity` 와 애니메이션도 **observable** 로 다룰 수 있어, SwiftUI 상태 갱신 흐름 안에 자연스럽게 편입됩니다.
* SwiftUI gesture를 RealityView를 거치지 않고 **직접 RealityKit entity에 부착**할 수 있는 것도 큰 변화입니다.
* 또 기존의 RealityView attachment 방식 대신, 씬 코드 안에 바로 UI를 선언하는 **ViewAttachmentComponent** 가 추가되어 구성 방식도 더 간결해졌습니다.
* 즉 visionOS 앱 개발이 이제 프레임워크별 단절보다 **하나의 통합된 공간 앱 개발 경험**에 더 가까워졌다고 볼 수 있습니다.

<br>
## 🔊 공간 오디오와 RealityKit 환경 반응

* 오디오도 더 공간적으로 정교해졌습니다.
* 기존에는 AudioToolbox나 AVFoundation 기반 사운드가 앱의 첫 번째 window 기준으로 spatialize 되었는데,
  이제는 **Spatial Audio Experience API** 로 사운드마다 개별 window 또는 volume 기준 공간화를 할 수 있습니다.
* 장면 간 사운드 이동도 더 자연스럽게 처리됩니다.
* RealityKit 쪽에서는 **Environment Occlusion** 이 강화되어, 실제 정적인 물체가 가상 오브젝트를 가리는 표현을 만들 수 있습니다.
* 이는 pin widget이나 Quick Look 3D 모델에는 자동 적용되며, immersive RealityKit 앱에서는 `EnvironmentBlendingComponent` 로 사용할 수 있습니다.
* `MeshInstancesComponent` 를 통해 적은 수의 원본 에셋으로 많은 변형 객체를 효율적으로 렌더링할 수 있어, 장면 품질과 성능을 함께 끌어올릴 수 있습니다.
* 여기에 AV1 이미지 파일 포맷 텍스처와 `ImagePresentationComponent` 같은 요소까지 더해져, **공간 장면의 시각 품질과 표현 범위**가 확장되었습니다.

<br>
## 🧠 시스템 기능과 Apple Intelligence

* 시스템 기능 측면에서는 Apple Intelligence와 온디바이스 모델 접근성이 더 넓어졌습니다.
* **Foundation Models framework** 로 온디바이스 LLM에 직접 접근할 수 있고, guided generation과 tool calling도 지원됩니다.
* Image Playground는 더 많은 스타일과 생성 옵션을 지원하게 되었고, ChatGPT 기반 생성 흐름도 들어왔습니다.
* 또 새로운 **SpeechAnalyzer** 와 `SpeechTranscriber` 모델이 추가되어, 더 빠르고 유연한 온디바이스 음성 인식과 전사가 가능해졌습니다.
* 이 기능들은 단순히 visionOS 전용 변화라기보다, visionOS 앱이 **생성형 AI와 음성 처리 기능을 자연스럽게 통합**할 수 있게 만든다는 점에서 의미가 큽니다.

<br>
## 🪟 공간 복원과 위젯 강화

* visionOS 26에서는 공간에 둔 콘텐츠가 더 잘 **기억되고 복원**됩니다.
* window, scene, Quick Look의 2D/3D 콘텐츠까지 재시작 후 같은 자리에 다시 나타날 수 있습니다.
* SwiftUI restoration API를 통해
  * 어떤 scene을 복원할지 지정하고,
  * snap surface 상태를 읽고,
  * launch 시 자동 생성 여부를 제어
  할 수 있습니다.
* 이를 통해 앱은 특정 surface type에 맞춰 동적으로 UI를 바꾸거나, 다음 방문 시 필요한 창만 다시 띄우는 식의 동작을 구성할 수 있습니다.
* widget도 크게 강화되었습니다.
  * 벽이나 테이블에 자연스럽게 snap 되고,
  * iOS/iPadOS용 WidgetKit + SwiftUI 위젯이 visionOS에서도 더 입체적으로 보이며,
  * `levelOfDetail` API로 거리 기반 UI 변형이 가능하고,
  * `widgetTexture` 로 glass부터 paper 같은 재질감도 조절할 수 있습니다.
* 즉 위젯이 단순 부가 요소가 아니라, **공간 안에 배치되는 가벼운 정보 객체**로 더 완성도 있게 진화했습니다.

<br>
## 🎮 게임과 공간 액세서리

* 게임 관련 업데이트도 상당히 큽니다.
* 빠른 손동작이 필요한 immersive 게임에서는 **hand tracking 속도가 최대 3배** 빨라졌습니다.
* 또 두 가지 새로운 spatial accessory 입력을 지원합니다.
  * **PlayStation VR2 Sense controller**
  * **Logitech Muse**
* VR2 Sense는 6DoF 추적, hand breakthrough, system navigation, system gesture를 지원해 게임용 입력 장치로 유용합니다.
* Logitech Muse는 정밀 드로잉이나 조형 같은 작업에 적합하며, 여러 센서와 햅틱 피드백을 활용할 수 있습니다.
* GameController 프레임워크로 Bluetooth 연결을 찾고, RealityKit 또는 ARKit을 통해 추적 정보를 가져올 수 있습니다.
* 게임 이식 측면에서는
  * visionOS의 **메모리 한도 증가**
  * App Store Connect를 통한 고급 iPad 게임 포팅
  * progressive immersion style 확장
  도 중요한 변화입니다.
* progressive immersion은 새 portrait / landscape 비율을 지원하게 되었고, Compositor Services로도 확장되었습니다.

<br>
## 🖥️ Metal, Compositor Services, Mac 공간 렌더링

* Compositor Services는 두 가지 큰 기능이 추가되었습니다.
  * **privacy-preserving hover effects**
  * **dynamic render quality**
* hover effect는 Metal 기반 immersive 앱에서도 사용자의 시선 기반 인터랙션 강조를 구현할 수 있게 해줍니다.
* dynamic render quality는 장면 품질을 더 세밀하게 조절하게 해주며, 고해상도 UI나 텍스트를 렌더링할 때 특히 유용합니다.
* 다만 품질을 올릴수록 메모리와 전력 사용이 늘어나므로, 시각 품질과 리소스 사용의 균형이 중요합니다.
* 또 인상적인 변화로 **macOS spatial rendering** 이 추가되었습니다.
* 이제 Mac의 렌더링 성능을 활용해 immersive 콘텐츠를 Vision Pro로 스트리밍할 수 있습니다.
* `RemoteImmersiveSpace` 와 함께 Compositor Services, ARKit가 Mac에서도 동작해, 기존 Mac 앱에 공간 경험을 더하거나 완전한 immersive 게임을 만드는 흐름이 가능해졌습니다.

<br>
## 👥 SharePlay와 Nearby Window Sharing

* visionOS 26은 **같은 공간에 있는 사람과의 공유 경험**도 강화했습니다.
* 기존 SharePlay 앱은 추가 코드 없이도 **Nearby Window Sharing** 을 활용할 수 있습니다.
* 즉 멀리 있는 사람뿐 아니라, **같은 방에 있는 사람들과도** 공간 앱을 함께 경험할 수 있게 됩니다.
* ARKit의 **shared world anchors** 로 공유 콘텐츠를 방 안 특정 위치에 정확히 고정할 수 있고, SharePlay 세션 중 앱과 콘텐츠를 이동·크기 조절·snap 할 수 있습니다.
* Quick Look에서는 가상 오브젝트를 서로 주고받는 것처럼 전달할 수도 있습니다.
* Spatial Persona도 이제 beta를 벗어나며, 머리카락, 피부 표현, 표정, 전반적인 재현 품질이 좋아졌습니다.
* 즉 visionOS의 협업 경험이 단순 화상 공유가 아니라, **같은 공간을 함께 쓰는 느낌**에 더 가까워졌습니다.

<br>
## 🎲 TabletopKit 개선

* TabletopKit에도 실용적인 확장이 들어갔습니다.
* 새 **CustomEquipmentState** 로 게임 말이나 장비 객체에 사용자 정의 상태 필드를 추가할 수 있고, 이 상태는 자동으로 네트워크 동기화됩니다.
* **CustomActions** 로는 소유권 변경, 색상 변경 같은 동작을 직접 정의할 수 있으며, 이것도 네트워크를 자동 처리합니다.
* 즉 개발자는 네트워킹이나 입력 처리보다 **게임 규칙과 플레이 경험 자체**에 더 집중할 수 있게 됩니다.

<br>
## 🎥 몰입형 미디어와 APMP

* 미디어 쪽은 visionOS 26의 가장 큰 축 중 하나입니다.
* RealityKit의 **ImagePresentationComponent** 는 온디바이스 생성형 AI를 활용해, mono 또는 spatial stereo 이미지를 **여러 시점에서 자연스럽게 보이는 3D 장면**으로 표현할 수 있게 해줍니다.
* 또 이번 버전은 세 가지 새로운 몰입형 미디어 형식을 본격 지원합니다.
  * **180º**
  * **360º**
  * **wide field-of-view**
* 이를 가능하게 하는 핵심이 **Apple Projected Media Profile(APMP)** 입니다.
* APMP는 QuickTime / MPEG-4 파일에 projection 관련 메타데이터를 넣어, 해당 영상이 180º, 360º, Wide-FoV 인지를 시스템이 이해하고 올바르게 재생·편집하게 해줍니다.
* action camera처럼 왜곡된 wide-angle 영상은 APMP를 통해 lens distortion을 보정해, **기존 2D footage를 몰입형 콘텐츠처럼 재구성**할 수 있습니다.
* visionOS는 일부 서드파티 카메라용 APMP 메타데이터도 자동 생성합니다.
* 이 모든 미디어 형식은 Quick Look, AVKit, RealityKit, WebKit 등 익숙한 API로 재생할 수 있고, progressive immersion도 지원합니다.
* Apple Immersive Video 쪽은 Blackmagic URSA Immersive Camera, DaVinci Resolve, 새 **Immersive Media Support framework** 와 연결되며, 자체 제작·처리·공유 파이프라인도 더 넓어졌습니다.

<br>
## 🌐 Safari와 Spatial Web

* Safari도 크게 달라집니다.
* **Spatial Browsing** 으로 웹 페이지를 단순한 평면 문서가 아니라, 주변으로 펼쳐지는 공간형 콘텐츠처럼 볼 수 있습니다.
* 풀스크린에서 spatial media가 페이지와 함께 살아나는 식으로 표현되며, 비디오를 보면서 다른 페이지 정보를 함께 참고하는 흐름도 더 자연스러워졌습니다.
* 웹 개발자용으로는 새 **HTML `model` element** 가 추가되었습니다.
* 이를 통해 USDZ 모델을 선언적으로 삽입하고, CSS 스타일링과 JavaScript 제어를 적용하며, Quick Look으로 실제 공간에 끌어내 배치할 수 있습니다.
* 기존 `video` element로도 spatial video와 Apple Immersive Video를 포함한 여러 형식을 다룰 수 있게 됩니다.
* 또 **Web Backdrop** developer preview로, HTML 마크업을 통해 웹사이트 자체가 custom immersive environment를 제공하는 방향도 열렸습니다.
* 여기에 **Look to Scroll** 이 추가되어, 눈동자만으로 웹과 콘텐츠를 스크롤하는 상호작용도 가능해졌고, 이 API는 SwiftUI와 UIKit 앱에서도 채택할 수 있습니다.

<br>
## 🏢 엔터프라이즈 API와 배포 관리

* 엔터프라이즈용 기능도 상당히 강화되었습니다.
* 승인된 enterprise entitlement가 있으면, 앱이 **main camera 접근을 shared space와 함께 사용**할 수 있게 됩니다.
* 한 개의 main camera 또는 좌우 두 카메라 feed에 동시에 접근할 수 있습니다.
* ARKit의 **CameraRegionProvider** 로는 관심 영역만 잘라낸 안정화된 영상 피드를 받아, 시야 주변 정보를 중앙으로 가져오거나 원격 사용자와 공유하는 식의 경험을 만들 수 있습니다.
* contrast, vibrancy 같은 추가 보정도 가능합니다.
* 또 새 **Protected Content** API로 뷰 단위 보호를 설정하면, 해당 콘텐츠에 대해 screenshot, screen recording, AirPlay, SharePlay를 막을 수 있습니다.
* 라이선스 entitlement가 있는 앱은 **Window Follow Mode** 로 사용자를 따라다니는 창도 만들 수 있습니다.
* 배포 쪽에서는 **Return to Service** 가 추가되어, 조직 내 여러 사람이 Vision Pro를 돌려 쓰는 환경을 더 쉽게 관리할 수 있습니다.
* MDM으로 설치한 앱은 유지하면서 민감 정보만 세션 사이에 지우는 흐름이며, Apple Business Manager 구성과 함께 사용합니다.
* Apple Configurator for iOS도 Vision Pro의 Apple Business Manager 등록을 더 쉽게 하도록 개선되었습니다.
* Quick Start 개선으로 iCloud 또는 iPhone에 저장된 setup 데이터를 가져와 손/눈 재등록 없이 더 빠르게 시작할 수도 있습니다.
* SharePlay/FaceTime을 쓰지 않는 기업을 위해서는 **SharedCoordinateSpaceProvider** 기반으로 로컬 인프라를 활용한 co-located shared experience 구성도 가능해졌습니다.

<br>
## ✅ 정리

* visionOS 26은 SwiftUI, RealityKit, ARKit의 통합을 더 깊게 만들고, 볼류메트릭 UI와 immersive 콘텐츠 제작의 기준을 끌어올린 업데이트입니다.
* 핵심만 다시 보면
  * 3D 레이아웃과 object manipulation
  * 공간 복원과 고도화된 위젯
  * 더 빠른 hand tracking과 새 spatial accessory
  * SharePlay + Nearby Window Sharing
  * APMP 기반 180º / 360º / Wide-FoV 미디어
  * Safari의 spatial web
  * 엔터프라이즈용 camera / protected content / return to service
  가 큰 축입니다.
* 전체적으로 이번 visionOS 업데이트는
  **“공간 앱을 더 쉽게 만들고, 더 풍부하게 공유하고, 더 넓은 산업과 콘텐츠 영역으로 확장한다”** 는 방향이 아주 분명한 해라고 볼 수 있습니다.
