# WWDC25 세션 256 — What’s new in SwiftUI 요약

<br>
## ✨ 개요

* 이번 세션은 **SwiftUI의 2025년 핵심 업데이트**를 한 번에 정리하는 세션입니다.
* 큰 흐름은 다섯 가지입니다.
  * **새 디자인 시스템과 Liquid Glass**
  * **프레임워크 성능 및 개발 도구 개선**
  * **visionOS를 포함한 공간 레이아웃 확장**
  * **SwiftUI의 시스템 전반 확장**
  * **웹 콘텐츠와 리치 텍스트 같은 뷰 기능 확장**
* 단순한 UI 스타일 변화가 아니라, **디자인·성능·플랫폼 확장·콘텐츠 표현력**까지 함께 넓힌 해라는 점이 핵심입니다.

<br>
## 🎨 새로운 디자인과 Liquid Glass

* SwiftUI 앱은 새 OS에 다시 빌드하는 것만으로도 **새 디자인 시스템의 기본 외형**을 자연스럽게 얻습니다.
* navigation container, sidebar, tab bar, toolbar가 전반적으로 **Liquid Glass 기반의 밝고 유동적인 표현**으로 업데이트되었습니다.
* iPhone의 검색 UI는 **하단 정렬**로 더 손이 잘 닿는 위치로 바뀌고, iPad에서는 상단 코너에 더 자연스럽게 배치됩니다.
* tab 기반 앱에서 검색이 하나의 목적지라면, **search role이 있는 탭**이 검색 필드처럼 분리되어 보이는 새로운 표현도 지원됩니다.
* toolbar 쪽에서는
  * **ToolbarSpacer**
  * toolbar item tint
  * morphing transition
  같은 API와 동작이 추가되어, 도구 버튼 구성과 강조를 더 세밀하게 제어할 수 있습니다.
* 커스텀 뷰에도 glass effect를 적용할 수 있어, 시스템 컨트롤뿐 아니라 **자체 UI도 새 디자인 언어에 맞춰 통일감 있게 확장**할 수 있습니다.

<br>
## 🧭 iPad와 macOS 인터랙션 개선

* iPadOS 26에서는 앱 상단에 **menu bar**가 나타나 공통 액션에 더 빠르게 접근할 수 있습니다.
* 기존 macOS용 `commands` API가 iPad에서도 같은 결과를 만들 수 있어, 메뉴 구조를 여러 플랫폼에서 더 자연스럽게 공유할 수 있습니다.
* iPad의 창 크기 조절도 더 유연해졌고, split view 기반 앱은 **가용 공간에 따라 시스템이 컬럼을 자동 조정**합니다.
* Apple은 이 변화에 맞춰 `UIRequiresFullscreen` 같은 **전체 화면 고정 API에서 벗어날 것**을 권장합니다.
* macOS에서는 콘텐츠 크기 변화로 인해 창 크기가 바뀔 때, **콘텐츠와 창 리사이즈 애니메이션을 동기화**해 더 자연스러운 전환을 제공합니다.
* 새 **window resize anchor** 로 애니메이션 기준점을 더 세밀하게 제어할 수 있습니다.

<br>
## ⚡ 프레임워크 성능과 개발 도구 개선

* SwiftUI 자체 성능도 꽤 크게 좋아졌습니다.
* 특히 macOS에서 **10만 개 이상의 항목을 가진 리스트**는 로딩이 더 빨라졌고, 업데이트 성능도 크게 향상되었습니다.
* 스크롤링 쪽에서는 SwiftUI가 프레임 준비를 더 잘 스케줄링해, 고주사율 환경에서 **빠르게 스크롤할 때 dropped frame 가능성**을 줄입니다.
* lazy stack을 중첩한 scroll view에서도 지연 로딩 동작이 더 잘 적용되어, 사진 캐러셀 같은 UI를 더 효율적으로 구성할 수 있습니다.
* Xcode에는 새 **SwiftUI performance instrument** 가 추가되었습니다.
  * 긴 view body 업데이트
  * platform view 업데이트
  같은 병목 구간을 더 빠르게 확인할 수 있어, 성능 분석 흐름이 훨씬 실전적이 되었습니다.
* 세션은 또 Swift concurrency와 SwiftUI의 결합도 강조합니다. 구조화된 동시성은 데이터 경쟁 문제를 컴파일 타임에 더 빨리 발견하게 해주고, SwiftUI 코드와도 점점 더 자연스럽게 연결됩니다.

<br>
## ✨ 애니메이션과 레이아웃 개선

* 애니메이션 쪽에서는 **Animatable macro** 가 추가되었습니다.
* 예전에는 `Animatable` 채택 시 `animatableData` 를 직접 길게 작성해야 했지만, 이제는 매크로를 통해 이를 자동 합성할 수 있습니다.
* 함께 제공되는 **AnimatableIgnored** 로는 애니메이션에서 제외할 속성을 명시할 수 있어, 커스텀 애니메이션 코드가 훨씬 단순해집니다.
* 레이아웃은 3D 방향으로도 확장되었습니다.
* SwiftUI는 기존 2D 정렬과 오버레이 개념을 확장한
  * **Alignment3D**
  * **Spatial Overlay**
  같은 API를 통해 **깊이 개념이 있는 배치**를 직접 표현할 수 있게 되었습니다.
* 즉, SwiftUI가 이제 평면 UI를 넘어 **volumetric layout을 직접 다루는 프레임워크**로 더 확장되고 있습니다.

<br>
## 🥽 visionOS와 공간 경험 확장

* visionOS 26에서는 SwiftUI로 **공간 배치와 볼류메트릭 상호작용**을 더 직접 만들 수 있습니다.
* 새 **manipulable** modifier를 통해 사용자가 오브젝트를 집고 옮기는 상호작용을 줄 수 있습니다.
* scene snapping 관련 API도 추가되어, 오브젝트가 특정 표면이나 위치에 붙었는지 같은 상태를 environment에서 읽고 UI를 바꿀 수 있습니다.
* 세션 예시에서는 snapped 상태일 때 pedestal을 보여주는 식으로 시각 피드백을 제공합니다.
* 이 변화는 SwiftUI가 visionOS에서 단지 2D 창을 만드는 도구가 아니라, **공간 객체와 레이아웃을 설계하는 주 도구**로 커지고 있다는 점을 보여줍니다.

<br>
## 🌐 SwiftUI가 시스템 전반으로 확장

* SwiftUI는 앱 내부 뷰 계층을 넘어서 **시스템 전반의 진입점**으로 더 넓게 확장되고 있습니다.
* 가장 큰 변화 중 하나는 **scene bridging** 입니다.
* 이제 UIKit / AppKit lifecycle 기반 앱에서도 SwiftUI scene을 직접 요청할 수 있어,
  SwiftUI 전용 scene type이나 modifier를 기존 앱 구조와 섞어 쓸 수 있습니다.
* 이를 통해
  * `MenuBarExtra`
  * `ImmersiveSpace`
  * `RemoteImmersiveSpace`
  * `AssistiveAccess`
  같은 scene을 더 유연하게 도입할 수 있습니다.
* 특히 **RemoteImmersiveSpace** 는 macOS 앱이 Apple Vision Pro에서 stereo content를 렌더링하게 해주는 새 scene입니다.
* AppKit과의 연결도 좋아졌습니다.
  * SwiftUI view를 포함한 sheet 표시
  * `NSGestureRecognizerRepresentable`
  * Interface Builder에서의 `NSHostingView`
  같은 브리징이 강화되었습니다.
* RealityKit과의 결합도 강화되어,
  * Entity의 `Observable` 채택
  * 좌표 변환 개선
  * RealityKit entity에서 SwiftUI presentation을 띄우는 지원
  등이 추가되었습니다.

<br>
## ⌚ Widgets와 Controls의 확장

* SwiftUI 기반 widgets는 올해 **visionOS와 CarPlay** 로 확장됩니다.
* visionOS에서는 shared space 안에서 widget 표현을 더 풍부하게 만들 수 있고,
  새 **levelOfDetail** environment 값으로 사용자의 거리나 맥락에 따라 내용을 달리 보여줄 수 있습니다.
* 세션 예시처럼 멀리서는 간단한 카운트다운만 보이고, 가까이 가면 더 많은 콘텐츠를 확장해 보여주는 식의 구성이 가능합니다.
* 세션에서는 이와 함께
  * CarPlay의 Live Activities
  * push 기반 widget 업데이트
  * watchOS relevance API
  도 함께 언급하며, SwiftUI 기반 시스템 표면이 더 많아졌음을 강조합니다.

<br>
## 🌍 WebKit for SwiftUI

* 올해 SwiftUI에서 가장 반가운 변화 중 하나는 **WebKit의 본격적인 SwiftUI 지원**입니다.
* 새 **WebView** 로 앱 안에 웹 콘텐츠를 직접 표시할 수 있습니다.
* 단순히 URL만 띄우는 수준이 아니라, **WebPage** 라는 새 observable 모델 타입을 통해 페이지를 더 능동적으로 제어할 수 있습니다.
* 이를 통해
  * 프로그래밍 방식 navigation
  * page property 접근
  * 사용자 에이전트 설정
  * JavaScript 호출
  * custom URL scheme 처리
  같은 작업까지 Swift다운 흐름으로 확장할 수 있습니다.
* 즉 웹 콘텐츠 임베딩이 이제 UIKit wrapper 수준을 넘어서, **SwiftUI 생태계 안으로 본격 편입**된 셈입니다.

<br>
## 📊 새로운 뷰 기능: 3D Charts와 Drag & Drop

* SwiftUI 뷰 기능도 더 풍부해졌습니다.
* Swift Charts는 **Chart3D** 와 Z축 관련 스케일 API를 통해, 3차원 데이터 시각화를 직접 표현할 수 있게 되었습니다.
* 단순한 2D 차트 확장이 아니라, **공간 좌표를 가진 데이터 표현**으로 확장된 점이 중요합니다.
* Drag & Drop도 강화되었습니다.
  * 여러 아이템 drag
  * drag container 개념
  * drag operation 커스터마이징
  * drag session 업데이트 관찰
  같은 기능이 추가되어, macOS 중심의 생산성 앱 경험을 더 정교하게 만들 수 있습니다.

<br>
## ✍️ 리치 텍스트 편집

* 텍스트 편집 쪽도 한 단계 올라갔습니다.
* 이제 `TextEditor` 에 **`AttributedString` 바인딩**을 전달해, SwiftUI 안에서 리치 텍스트 편집 경험을 만들 수 있습니다.
* 즉 굵게/기울임꼴 같은 포맷팅 제어뿐 아니라,
  paragraph style,
  attribute transformation,
  허용 가능한 attribute 제한
  같은 정책도 더 세밀하게 다룰 수 있습니다.
* 이 변화로 SwiftUI는 단순 텍스트 입력을 넘어, **문서 편집·코멘트 작성·포맷된 콘텐츠 작성**까지 더 자연스럽게 담당할 수 있게 되었습니다.

<br>
## ✅ 정리

* 올해 SwiftUI는 단순한 UI 프레임워크 업데이트가 아니라, **디자인 시스템·성능·공간 컴퓨팅·시스템 통합·콘텐츠 표현력**을 모두 넓힌 해였습니다.
* 핵심만 다시 보면
  * Liquid Glass 기반 새 디자인과 toolbar/search 개선
  * 리스트·스크롤 성능 향상과 새 performance instrument
  * Animatable macro와 3D spatial layout
  * scene bridging, widgets, RealityKit 연동 강화
  * WebView / WebPage, Chart3D, rich text editing
  이 큰 축입니다.
* 전체적으로 보면 SwiftUI는 이제
  **“Apple 플랫폼 전반의 기본 UI 도구”를 넘어서, 공간 경험과 시스템 통합까지 담당하는 중심 프레임워크**로 더 분명하게 자리 잡고 있다고 볼 수 있습니다.
