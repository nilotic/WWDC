# WWDC25 세션 294 — What’s new in Metal rendering for immersive apps 요약

---

<br>
## ✨ 개요

* 이번 세션은 **visionOS의 Metal + Compositor Services 기반 immersive rendering** 업데이트를 다룹니다.
* 핵심은 다섯 가지입니다.
  * **새 render loop API와 multiple drawables 지원**
  * **interactive object를 위한 hover effects**
  * **foveated rendering 기반 dynamic render quality**
  * **Digital Crown으로 조절하는 progressive immersion**
  * **Mac에서 Vision Pro로 직접 렌더링하는 macOS spatial rendering**
* 전체적으로 보면, 이번 변화는 **상호작용 강화**, **화질과 성능 균형 조절**, **새로운 몰입 방식**, **Mac 연동 확장**에 초점이 맞춰져 있습니다.

<br>
## 🔁 새로운 Render Loop APIs

* 기존에는 한 프레임마다 보통 **하나의 drawable**만 가져와 렌더링했습니다.
* 이제는 `queryDrawables()`를 사용해 **배열 형태의 drawables**를 받습니다.
* 대부분은 하나의 drawable이 오지만, 예를 들어 **Reality Composer Pro로 고화질 비디오를 캡처**할 때는 두 개가 올 수 있습니다.
  * `.builtIn` : Vision Pro 디스플레이용
  * `.capture` : 녹화용
* 따라서 렌더러는 더 이상 단일 drawable만 가정하지 말고, **반환된 모든 drawable에 대해 렌더링**하는 구조로 바꿔야 합니다.
* Xcode의 visionOS 템플릿에서도 이 흐름을 바로 확인할 수 있으며, Immersive Space Renderer 선택 시 최신 Metal 템플릿을 사용할 수 있습니다.

<br>
## 🖱️ Hover Effects와 Tracking Areas

* 올해부터 interactive object를 더 명확하게 보여주기 위한 **hover effects**를 Metal immersive app에서도 적용할 수 있습니다.
* 핵심 개념은 **tracking area** 입니다.
  * interactive object마다 tracking area를 등록합니다.
  * 각 tracking area에는 **고유 object identifier**를 연결해야 합니다.
  * 시스템은 사용자의 시선을 추적해, 해당 object에 자동으로 hover effect를 적용할 수 있습니다.
* hover effect를 쓰지 않더라도 tracking area는 유용합니다.
  * object를 pinch 대상으로 식별할 수 있고,
  * spatial event에서 넘어오는 tracking area identifier로 어떤 오브젝트가 선택되었는지 쉽게 매핑할 수 있습니다.
* 구현 측면에서는 layer configuration에 **tracking areas texture**를 켜야 하며,
  * 8-bit format 기준으로 최대 255개의 동시 interactive object를 지원합니다.
* shader에서는 color texture와 함께 **tracking area render value**를 출력해, 시스템이 어느 영역에 hover effect를 입혀야 하는지 알 수 있도록 해야 합니다.

<br>
## 🎨 Tracking Areas Texture와 MSAA 주의점

* drawable은 이제 단순히 color / depth texture만 주는 것이 아니라, **tracking areas texture**도 제공합니다.
* 이 texture에는 interactive region을 구분하는 값들을 그려 넣고,
  * 시스템은 사용자의 시선이 향한 위치를 기준으로
  * 어떤 interactive 영역인지 판별한 뒤,
  * color texture의 해당 부분에 hover effect를 적용합니다.
* 주의할 점은 **MSAA를 사용할 때**입니다.
  * color texture는 multisample resolve로 평균값을 내도 되지만,
  * tracking area value는 평균을 내면 유효하지 않은 값이 되어버릴 수 있습니다.
* 따라서 tracking areas texture는 일반 color resolve처럼 처리하면 안 되고,
  * **custom tile resolver**를 구현해
  * 샘플 윈도우 안에서 가장 많이 등장한 render value를 고르는 방식이 권장됩니다.

<br>
## 📈 Dynamic Render Quality

* 이번 업데이트의 또 다른 핵심은 **dynamic render quality** 입니다.
* 이 기능은 **foveated rendering**과 함께 동작합니다.
  * 중심부에 더 높은 픽셀 밀도를 배치해 시선이 집중될 가능성이 큰 영역의 품질을 높입니다.
* 이제 앱은
  * 먼저 **maximum render quality**를 정하고,
  * 런타임에는 그 범위 안에서 scene 특성에 맞게 quality를 조절할 수 있습니다.
* 예를 들면,
  * 텍스트나 UI가 많은 메뉴 화면은 품질을 높게,
  * 복잡한 3D 월드는 품질을 조금 낮게 설정해
  * 선명도와 전력/메모리/성능 사이의 균형을 맞출 수 있습니다.
* quality를 올리면 high relevance area가 커지고 texture size도 커지므로,
  * **메모리 사용량과 전력 소모가 증가**합니다.
* Apple은 Instruments와 Metal debugger로 가장 무거운 장면까지 포함해 프로파일링하고,
  * steady frame pacing을 유지할 수 있는 최소한의 상한값을 정하라고 권장합니다.
* runtime에서 quality를 바꾸면 즉시 바뀌는 것이 아니라, 시스템이 **부드럽게 전환**합니다.

<br>
## 🌀 Progressive Immersion

* 새로 추가된 **progressive immersion style**은 사용자가 **Digital Crown으로 immersion level을 조절**할 수 있는 방식입니다.
* 완전 몰입(full immersion)과 달리,
  * 현실 세계와의 연결감을 조금 더 유지할 수 있어
  * 움직임이 많은 복잡한 장면에서도 부담을 줄이는 데 도움이 됩니다.
* 중요한 점은 시스템이 현재 immersion level 안쪽의 콘텐츠만 보여준다는 것입니다.
  * 즉, portal 바깥쪽처럼 보이지 않는 영역은 굳이 렌더링하지 않아도 됩니다.
  * 결과적으로 **연산량을 줄이고 성능을 절약**할 수 있습니다.
* 이를 위해 시스템은 **portal stencil**을 제공합니다.
  * stencil buffer를 마스크처럼 사용해 현재 포털 내부만 렌더링합니다.
  * 실제 fade edge 처리는 시스템이 command buffer의 마지막 단계에서 적용합니다.
* 구현 시에는 compositor layer에서 지원되는 **stencil format**을 설정하고,
  * drawable에 **render context**를 추가한 뒤,
  * portal mask를 stencil attachment에 그려야 합니다.
* 또한 encoding 종료도 command encoder가 아니라 **drawable render context를 통해 마무리**해야 포털 효과가 효율적으로 적용됩니다.

<br>
## 🧩 SwiftUI와 Progressive App 구성

* SwiftUI의 Immersive Space에서 이제 **progressive immersion style**을 선택지로 제공할 수 있습니다.
* 다만 progressive style은 **layered layout에서만 동작**합니다.
* stencil format과 sample count도 scene 구성에 맞게 설정해야 하며,
  * MSAA를 쓰는 경우에는 해당 sample count를 맞춰야 합니다.
* Xcode의 visionOS Metal app template에서 progressive 옵션을 선택하면,
  * 이 구조를 바로 확인할 수 있는 working example을 얻을 수 있습니다.

<br>
## 💻 macOS Spatial Rendering

* 이번 세션에서 가장 확장성이 큰 변화 중 하나는 **Mac에서 Vision Pro로 immersive content를 직접 렌더링하고 스트리밍**할 수 있게 된 점입니다.
* 이 기능으로
  * 기존 Mac 앱에 immersive preview를 붙이거나,
  * 아예 Mac의 성능을 활용하는 고성능 immersive app을 만들 수 있습니다.
* 예를 들어 3D 모델링 앱이 Mac에서 렌더링한 장면을 Vision Pro에서 바로 확인하도록 만들 수 있습니다.
* 구조는 기본적으로 visionOS immersive app과 비슷합니다.
  * SwiftUI에서 **Remote Immersive Space**를 사용하고,
  * Compositor Services + ARKit + Metal을 조합해,
  * 최종 immersive scene은 Vision Pro에 직접 표시됩니다.
* Immersive Space를 열면 Vision Pro 쪽에서 연결 수락을 받게 되고,
  * 이후 Mac에서 렌더링한 immersive content가 Vision Pro로 전달됩니다.

<br>
## 📡 Remote Device Identifier와 ARKit 연동

* macOS spatial rendering에서는 Vision Pro의 센서/디스플레이와 연결하기 위해
  * 새로운 **Remote Device Identifier** SwiftUI environment object를 사용합니다.
* 이 값을 ARKit session initializer에 넘기면,
  * Mac의 ARKit session이 Vision Pro 쪽 장치와 연결됩니다.
* 또한 macOS에서도 이제 **ARKit world tracking provider**를 사용할 수 있어,
  * Vision Pro의 위치와 자세를 읽고,
  * 그 pose를 기반으로 scene과 drawables를 업데이트한 뒤 렌더링할 수 있습니다.

<br>
## 🎮 입력 처리와 기존 앱 확장

* macOS spatial app은 Mac에 연결된 **키보드, 마우스, 게임패드** 등 다양한 입력 장치를 그대로 활용할 수 있습니다.
* immersive scene 내부 interactive element에는 **pinch 이벤트**도 받을 수 있으며,
  * `onSpatialEvent` modifier를 통해 처리할 수 있습니다.
* 또한 올해는 기존 **AppKit 또는 UIKit 앱 안에서도 SwiftUI scene을 생성**할 수 있게 되어,
  * 이미 존재하는 Mac 앱에 새로운 immersive experience를 추가하기가 훨씬 쉬워졌습니다.
* 렌더링 엔진이 C 또는 C++로 작성된 경우를 위해,
  * Compositor Services와 ARKit의 주요 기능에는 **C API 대응 버전**도 제공됩니다.

<br>
## ✅ 정리

* 이번 업데이트는 Metal immersive app 개발을 한 단계 확장했습니다.
* 렌더 루프는 **multiple drawables**를 지원하면서 더 유연해졌고,
* **tracking areas + hover effects**로 상호작용 표현과 입력 처리가 쉬워졌으며,
* **dynamic render quality**로 장면 성격에 맞는 화질/성능 밸런스를 조정할 수 있게 되었습니다.
* 여기에 **progressive immersion**이 추가되면서, 몰입도를 자연스럽게 조절하는 portal형 경험도 만들 수 있게 되었습니다.
* 그리고 가장 크게는 **macOS spatial rendering** 덕분에,
  * Mac의 성능을 활용해 Vision Pro로 immersive content를 직접 보내는 새로운 앱 구조가 열렸습니다.
* 즉 이번 세션은 visionOS native immersive app뿐 아니라,
  * **Mac 기반 immersive workflow**까지 포함해 Metal 렌더링의 적용 범위를 넓힌 업데이트라고 볼 수 있습니다.
