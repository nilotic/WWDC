# WWDC25 세션 233 — What’s new in Safari and WebKit 요약

---

<br>
## ✨ 개요

* 이번 세션은 Safari와 WebKit에 추가된 최신 웹 기술을 소개합니다.
* 큰 흐름은 네 가지입니다.
  * **Animation**: Scroll-driven Animations, Cross-document View Transitions
  * **Layout**: Anchor Positioning
  * **Visual effects**: `background-clip`, `shape()`, `text-wrap: pretty`
  * **Media**: SVG icons, HDR images, 오디오/비디오 포맷 확장
* 전체 방향은 단순히 기능 추가가 아니라, **더 적은 JavaScript로 더 풍부한 UI를 만들고**, **상호운용성과 성능**, **배터리 효율**, **접근성**까지 함께 챙기게 해주는 데 있습니다.

<br>
## 🎞️ Scroll-driven Animations

* Safari 19에서는 **scroll-driven animations**를 지원합니다.
* 기존에는 스크롤과 연결된 애니메이션을 만들려면 보통 JavaScript가 필요했지만, 이제는 **CSS만으로** 스크롤과 애니메이션을 연결할 수 있습니다.
* 핵심은 새로운 timeline 개념입니다.
  * **scroll timeline**: 페이지의 스크롤 진행도에 따라 애니메이션 진행
  * **view timeline**: 특정 요소가 viewport 안으로 들어오고 나가는 시점에 맞춰 애니메이션 진행
* 예시로는
  * 페이지 하단 진행 바처럼 스크롤 양에 따라 커지는 UI
  * 카드/블록이 화면에 들어올 때만 조립되듯 등장하는 효과
  가 소개되었습니다.
* 장점은 분명합니다.
  * JavaScript 의존도 감소
  * 더 나은 성능과 배터리 효율
  * 선언형 CSS 기반으로 유지보수 용이
* 다만 Apple은 애니메이션을 넣을 때마다 **접근성**, 특히 **motion discomfort** 가능성을 함께 검토해야 한다고 강조합니다.

<br>
## 🔀 Cross-document View Transitions

* Safari는 **cross-document view transitions**도 지원합니다.
* 이 기능은 한 페이지에서 다른 페이지로 이동할 때, 단순히 화면이 툭 바뀌는 대신 **부드러운 전환 애니메이션**을 줄 수 있게 해줍니다.
* 중요한 포인트는 이 기능이 **enhancement**라는 점입니다.
  * 지원되는 브라우저에서는 더 자연스러운 경험을 제공하고
  * 지원되지 않아도 사이트 기능 자체는 그대로 동작합니다.
* 기본 형태는 `@view-transition { navigation: auto; }`처럼 간단하게 시작할 수 있습니다.
* 더 나아가면
  * 특정 요소에 id를 부여해 같은 객체처럼 이어지는 전환을 만들고
  * `prefers-reduced-motion` 미디어 쿼리와 함께 써서
  * 모션 축소 설정을 존중하는 방식으로 고급 전환을 구성할 수 있습니다.
* 또 하나의 제약은 **same-origin 페이지 사이에서만 동작**한다는 점입니다. 이는 사용자 안전과 프라이버시를 위한 제한입니다.

<br>
## 📐 Anchor Positioning

* Layout 파트의 핵심은 **anchor positioning**입니다.
* 이 기능은 어떤 요소를 다른 요소에 **상대적으로 고정**해서 배치할 수 있게 해줍니다.
* 대표적인 예시는 프로필 버튼을 눌렀을 때 뜨는 메뉴입니다.
  * 예전에는 popover를 띄워도 원하는 버튼 바로 아래에 자연스럽게 배치하려면 JavaScript 계산이 자주 필요했습니다.
  * 이제는 CSS에서 anchor를 지정하고, target이 그 anchor를 기준으로 붙도록 선언할 수 있습니다.
* 세션에서는
  * **`anchor-name`** 으로 기준 요소에 이름을 붙이고
  * **`position-anchor`** 로 대상 요소를 연결한 뒤
  * **`position-area`** 로 어디에 놓을지 정하는 흐름을 보여줍니다.
* 여기에 **`position-try`** 를 사용하면, 화면 폭이 줄어들었을 때 다른 배치 대안을 자동으로 시도할 수 있습니다.
* 더 복잡한 정렬이나 애니메이션에는 **`anchor()` function** 도 사용할 수 있습니다.
* 정리하면 anchor positioning은 **popover, menu, tooltip, callout** 같은 UI를 JavaScript 없이 더 반응형이고 자연스럽게 만들 수 있게 해줍니다.

<br>
## 🎨 Visual Effects 개선

* 시각 효과 영역에서는 세 가지가 강조됩니다.
  * **`background-clip` 확장**
  * **`shape()` function**
  * **`text-wrap: pretty`**

### `background-clip` 확장

* 기존 `background-clip: text`처럼 텍스트 내부에 gradient나 이미지를 비추는 방식에 더해, 이제 **border 영역에도 배경을 적용**할 수 있습니다.
* `background-clip: border-area`를 사용하면 버튼 테두리나 장식 요소에 gradient border를 자연스럽게 줄 수 있습니다.
* 함께 `border-color: transparent`, `background-origin: border-box` 등을 조합해 더 정교한 결과를 얻을 수 있습니다.

### `shape()` function

* Safari 18.4에서는 **`shape()` function** 지원이 추가되었습니다.
* 복잡한 도형을 더 유연하고 반응형으로 정의할 수 있어, 단순 박스에서 벗어난 카드나 말풍선, 장식형 섹션을 CSS만으로 만들기 쉬워집니다.
* 특히 고정된 좌표 대신 더 유연한 레이아웃 단위와 결합해 반응형 디자인에 잘 맞습니다.

### `text-wrap: pretty`

* Safari 19에는 **`text-wrap: pretty`** 가 들어옵니다.
* 이 기능은 텍스트 줄바꿈을 더 보기 좋게 조정합니다.
  * 마지막 줄이 너무 짧게 끝나는 문제
  * 과도한 하이픈 처리
  * 전체 문단의 rag가 들쭉날쭉해 보이는 문제
  를 완화해 가독성을 높입니다.
* 적용은 간단하지만 효과는 꽤 실용적입니다. 문단, 제목, 카드 텍스트 같은 곳에서 특히 유용합니다.
* 이것도 enhancement라서, 지원 브라우저에서는 더 예쁜 줄바꿈을 얻고, 미지원 브라우저에서도 기본 경험은 유지됩니다.

<br>
## 🖼️ Media 지원 확대

* Media 파트에서도 실무적으로 유용한 변화가 많습니다.

### SVG icons

* Safari는 **SVG icons**를 지원합니다.
* SVG는 단순 favicon을 넘어서
  * bookmarklets
  * Safari 시작 페이지
  * add to dock 등
  다양한 맥락에서 활용됩니다.
* PNG 기반 아이콘보다 **더 유연하게 스케일링**되고, **파일 크기도 더 작을 수 있어** 웹 앱 배포 측면에서도 장점이 있습니다.

### HDR images

* WebKit과 Safari에는 **HDR images** 지원도 추가됩니다.
* 기존 HDR video 지원에 이어, 이제 웹에서도 더 밝고 풍부한 색 표현의 HDR 이미지를 다룰 수 있습니다.
* 다만 HDR과 SDR을 함께 보여줄 때는 시각적 균형이 중요하기 때문에, Apple은 **`dynamic-range-limit`** CSS 속성을 소개합니다.
  * `no-limit`: HDR을 있는 그대로 표시
  * `standard`: SDR처럼 제한해 표시
  * `constrained`: HDR의 장점은 살리되 너무 튀지 않게 조정
* 브라우저가 HDR을 지원하지 않아도 별도 fallback 없이 SDR 범위로 매핑되기 때문에, 개발자는 더 좋은 원본을 우선 사용할 수 있습니다.

### 오디오/비디오 포맷과 Recording

* Safari 19에서는 **Ogg Opus** 와 **Ogg Vorbis** 지원이 추가됩니다.
* 또한 Safari 18.4에서는 **MediaRecorder API에서 WebM 지원**이 보강되어,
  * Opus 오디오
  * VP8 / VP9 비디오
  조합으로 WebM 파일을 만들 수 있습니다.
* 이는 웹 앱에서 **실시간 팟캐스트 녹음**, **비디오 레코딩 기능** 같은 시나리오를 구현할 때 꽤 중요합니다.

<br>
## 🌐 더 넓어진 웹 플랫폼 방향성

* 세션 전반을 보면 Apple의 방향은 분명합니다.
* 단순히 Safari 전용 장식을 늘리는 것이 아니라,
  * 최신 CSS 기능 보강
  * 복잡한 레이아웃과 애니메이션의 선언형 처리
  * 미디어 포맷 상호운용성 향상
  * 접근성과 privacy-first 원칙 유지
  쪽으로 웹 플랫폼을 꾸준히 밀고 있습니다.
* 특히 “JavaScript 없이도 가능한 것은 CSS와 웹 표준으로 더 쉽게”라는 철학이 강하게 드러납니다.

<br>
## ✅ 정리

* 이번 Safari / WebKit 업데이트의 핵심은 **표현력 강화 + 구현 단순화**입니다.
* 개발자는 이제
  * scroll과 viewport 기반 애니메이션을 CSS로 구현하고
  * 페이지 전환을 더 자연스럽게 만들며
  * anchor positioning으로 복잡한 UI 배치를 단순화하고
  * 텍스트/테두리/도형 표현을 더 정교하게 다루고
  * SVG, HDR, WebM, Ogg 계열 등 더 다양한 미디어를 활용할 수 있습니다.
* 웹 앱이나 웹사이트를 만드는 입장에서는, 특히 **Safari 대응 품질**을 높이면서도 더 풍부한 경험을 더 적은 코드로 만들 수 있다는 점이 가장 큰 변화입니다.
