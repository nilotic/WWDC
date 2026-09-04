# WWDC26 Get started with the HTML Model Element 요약

- Session: 215
- Title: Get started with the HTML Model Element
- Source: https://developer.apple.com/videos/play/wwdc2026/215/
- Topic: WebKit, Safari, HTML Model Element, USDZ, AR Quick Look, visionOS, Web Standards
- Chapters: Introduction, Prepare the USDZ model asset, Loading and fallbacks, Model background, Interactions, Transition animation, Animation playback, AR and spatial, Optimize assets for production, Next steps

---

## 한 줄 요약

HTML `<model>` 요소는 3D 콘텐츠를 이미지처럼 간단히 웹에 넣을 수 있게 하는 네이티브 웹 요소로, 이제 **visionOS뿐 아니라 iOS·iPadOS·macOS Safari까지 확장**되었고, USDZ 기반 asset을 fallback·polyfill·interaction·animation·AR Quick Look·spatial web까지 하나의 표준화된 흐름으로 연결한다.

---

## 핵심 요약

이번 세션은 웹에서 3D 모델을 넣기 위한 가장 단순한 경로를 처음부터 production 최적화까지 순서대로 설명한다.

- **HTML Model Element**
  - visionOS에서 먼저 도입된 네이티브 HTML 요소
  - 이제 iOS, iPadOS, macOS까지 확장
  - 추가 JavaScript library 없이 Safari가 직접 렌더링
  - visionOS에서는 stereoscopic rendering을 기본 지원
  - W3C에서 표준화가 진행 중인 emerging web standard

- **Asset format**
  - Apple은 USDZ를 권장
  - 하나의 파일 안에 geometry, materials, textures, animations를 패키징
  - Scan / Convert / Create / generative AI 등 다양한 방식으로 생성 가능

- **Loading / fallback**
  - `<model src="...">`
  - `<source type="model/vnd.usdz+zip">`
  - 내부에 `<img>`를 넣어 미지원 브라우저 fallback 제공
  - `model.ready` promise로 실제 display 준비 시점 감지
  - 미지원 브라우저는 polyfill 가능
  - visionOS stereoscopic rendering 같은 platform-native 기능은 polyfill 불가

- **Presentation / interaction**
  - model 자체에 `background-color` 적용
  - `stagemode="orbit"`로 간단한 회전 interaction
  - `entityTransform` + `DOMMatrix`로 custom orientation
  - `requestAnimationFrame`으로 부드러운 transform transition
  - USDZ 내부 animation은 `play()`와 `playbackRate`로 제어

- **AR / spatial**
  - `<a rel="ar">`로 iOS/iPadOS AR Quick Look 연결
  - visionOS에서는 stereoscopic model rendering
  - Immersive website environments와 연결 가능

- **Production optimization**
  - `usdcrush`: USDZ 크기 크게 축소
  - 세션 demo: 7.9 MB → 1.9 MB, 시각적 품질 차이 없음
  - `usdrecord`: 3D 파일에서 thumbnail/fallback 이미지 생성
  - 두 도구 모두 macOS에 기본 포함

---

# 🧭 Model Element가 필요한 이유

웹에서 3D를 보여주는 대표적 기존 방법은 JavaScript library를 사용하는 것이었다.

세션은 특히 `model-viewer`를 언급한다.

`model-viewer`는 널리 쓰이는 JavaScript 기반 3D solution이지만 HTML Model Element의 차이는 분명하다.

```text
JavaScript Library
      vs
Native HTML Element
```

Model Element의 장점:

- 별도 library 없음
- Browser가 직접 렌더링
- visionOS stereoscopic rendering
- HTML semantics 안에 통합
- emerging standard
- Apple 플랫폼 전체에서 같은 markup 사용

즉 다음 코드를 그대로 여러 Apple 플랫폼에서 사용할 수 있다.

```html
<model src="mallet.usdz"></model>
```

---

# 🌍 Apple 플랫폼 전체로 확장

처음에는 visionOS에서 제공됐지만 이제 같은 요소가 다음에서 동작한다.

- iOS
- iPadOS
- macOS
- visionOS

사용자 입장에서는:

```text
Safari on iPhone
Safari on iPad
Safari on Mac
Safari on Vision Pro
```

모두 같은 3D asset을 사용할 수 있다.

visionOS만의 추가 장점은 stereoscopic depth다.

---

# 📦 USDZ를 기본 Asset으로 사용

HTML Model Element는 USDZ를 지원한다.

USDZ는 Universal Scene Description을 하나의 압축 package로 묶은 형식이다.

포함 가능한 내용:

- Geometry
- Materials
- Textures
- Animations

웹 배포 관점에서 중요한 장점은 **하나의 파일로 전달 가능**하다는 점이다.

---

# 🛠️ 3D Asset을 만드는 방법

세션은 다음 접근을 권장한다.

```text
Capture
Convert
Create
```

## Capture

iPhone으로 실물 object를 scan한다.

## Convert

기존 3D 파일을 USDZ로 변환한다.

## Create

Blender 같은 3D authoring tool에서 처음부터 만든다.

또한 generative AI를 이용한 생성도 소개한다.

- 실제 물체 이미지 → 비슷한 3D model 생성
- Text prompt → creative 3D model 생성

세션에서 예로 든 서비스:

- Tripo3D
- Meshy.ai

중요한 점은 생성 방식보다 최종적으로 **웹에서 쓸 수 있는 USDZ**를 확보하는 것이다.

---

# 🧱 가장 단순한 `<model>` 사용

기본 형태:

```html
<model src="mallet.usdz"></model>
```

`<img>`처럼 source를 지정하면 Safari가 loading과 rendering을 처리한다.

---

# 🧩 `<source>` Child 사용

MIME type을 명시하려면 `<source>`를 넣을 수 있다.

```html
<model>
    <source src="mallet.usdz" type="model/vnd.usdz+zip">
</model>
```

Asset type을 명확히 표현할 수 있다.

---

# 🖼️ Fallback Image

모든 browser가 Model Element를 지원하는 것은 아니다.

가장 간단한 fallback은 `<model>` 안에 `<img>`를 넣는 것이다.

```html
<model id="mallet" src="mallet.usdz">
    <img src="mallet.png"
         alt="Rubber mallet with wooden handle">
</model>
```

미지원 browser에서는 image가 표시된다.

장점:

- Progressive enhancement
- 3D가 안 돼도 제품 정보 유지
- Accessibility용 alt text 제공 가능

---

# ⏳ `ready` Promise

3D asset은 이미지보다 훨씬 클 수 있다.

세션은 수십 MB 이상이 될 수도 있다고 설명한다.

따라서 `<model>`이 DOM에 존재한다고 해서 즉시 렌더링 가능한 것은 아니다.

`ready` promise를 사용한다.

```html
<model id="mallet" src="mallet.usdz"></model>

<script>
    const model = document.getElementById("mallet");

    model.ready.then(result => {
        // Hide loading indicator
    }).catch(error => {
        // Show fallback
    });
</script>
```

권장 UX:

```text
Model Load 시작
      ↓
Spinner 표시
      ↓
ready resolve
      ↓
Spinner 숨김
      ↓
3D 표시
```

실패하면 fallback content를 보여준다.

---

# 🧯 Polyfill

Native support가 없는 browser에서도 Model Element API를 최대한 비슷하게 제공할 수 있다.

```html
<script type="module">
    if (!window.HTMLModelElement) {
        import("model-element-polyfill.js").then(() => {
            // Polyfill ready
        });
    }
</script>
```

W3C Model Element sample이 이런 접근을 보여준다.

단, 모든 native capability를 polyfill할 수 있는 것은 아니다.

대표적인 예:

- visionOS stereoscopic rendering

즉 polyfill은 API compatibility를 높일 수는 있지만 platform-native spatial rendering까지 복제하지는 못한다.

---

# 🎨 Model Background

Model Element는 자기만의 virtual space에서 렌더링된다.

즉 페이지 background를 자동으로 상속하지 않는다.

따라서 model 자체에 background를 지정해야 한다.

```html
<model id="mallet" src="mallet.usdz"></model>

<style>
    model {
        background-color: #f4f1ec;
    }
</style>
```

주의:

> background는 항상 opaque로 렌더링된다.

투명도가 포함된 color를 지정해도 최종적으로 opaque compositing 된다.

---

# 🎮 `stagemode="orbit"`

가장 쉬운 interaction은 orbit mode다.

```html
<model id="mallet"
       src="mallet.usdz"
       stagemode="orbit">
</model>
```

사용자가 할 수 있는 것:

- 좌우 회전
- 위아래 tilt

위아래 tilt는 자연스럽게 원래 angle로 spring-back한다.

또 orbit mode를 켜면 회전 중 clipping을 줄이기 위해 model이 약간 축소된다.

즉 한 줄 attribute로 interactive product viewer를 만들 수 있다.

---

# ⚠️ Orbit과 Custom Transform은 같이 쓰지 않는다

`entityTransform`을 직접 제어하려면 orbit을 끈다.

방법:

- `stagemode` 제거
- 또는 `stagemode="none"`

둘을 같이 쓰면 framework interaction과 custom transform이 충돌할 수 있다.

---

# 🧭 `entityTransform`

특정 angle을 보여주고 싶다면 JavaScript로 transform을 직접 지정한다.

```html
<model id="boot" src="boot.usdz"></model>
<button id="button-side">Side</button>
<button id="button-reset">Reset</button>

<script>
    const model = document.getElementById("boot");
    const initialTransform = model.entityTransform;

    document.getElementById("button-side")
        .addEventListener("click", () => {
            const transform = new DOMMatrix();
            transform.rotateSelf(0, 135, 0);
            model.entityTransform = transform;
        });

    document.getElementById("button-reset")
        .addEventListener("click", () => {
            model.entityTransform = initialTransform;
        });
</script>
```

핵심 API:

- `DOMMatrix`
- `rotateSelf`
- `entityTransform`

---

# 📐 Custom Transform의 주의점

Manual transform에서는 browser가 clipping을 자동으로 보정해주지 않는다.

따라서 회전 후 model이 visible region 밖으로 나갈 수 있다.

필요할 수 있는 작업:

- Position adjustment
- Bounding box 고려
- Scale 조정
- Clipping 확인

간단한 interaction이면 orbit mode가 훨씬 적은 코드로 안정적이다.

---

# 🎞️ Transform Transition Animation

Instant transform 대신 부드럽게 회전하려면 `requestAnimationFrame`을 사용한다.

세션 예시는 500ms transition이다.

```html
<script>
    const model = document.getElementById("boot");
    const duration = 500;
    let currentAngle = 0;
    let animationId = null;

    function animateTo(targetAngle) {
        if (animationId) {
            cancelAnimationFrame(animationId);
        }

        const startAngle = currentAngle;
        const startTime = performance.now();

        function step(now) {
            const progress = Math.min(
                (now - startTime) / duration,
                1
            );

            const ease = 1 - Math.pow(1 - progress, 3);

            currentAngle =
                startAngle +
                (targetAngle - startAngle) * ease;

            model.entityTransform =
                new DOMMatrix()
                    .rotateSelf(0, currentAngle, 0);

            if (progress < 1) {
                animationId = requestAnimationFrame(step);
            }
        }

        requestAnimationFrame(step);
    }
</script>
```

---

# 🧠 Animation Pattern의 핵심

세션의 구현은 네 부분으로 나뉜다.

## 기존 Animation 취소

```javascript
if (animationId) {
    cancelAnimationFrame(animationId);
}
```

연속 버튼 입력 시 transform animation이 겹치지 않게 한다.

## 시작 상태 저장

```javascript
const startAngle = currentAngle;
const startTime = performance.now();
```

## Easing 계산

```javascript
const ease = 1 - Math.pow(1 - progress, 3);
```

끝부분이 자연스럽게 감속한다.

## 다음 Frame 예약

```javascript
requestAnimationFrame(step);
```

Browser refresh cycle에 맞춰 transform을 갱신한다.

---

# 🎬 USDZ 내부 Animation 재생

USDZ 안에 Blender나 Maya에서 authored animation이 들어 있다면 Model Element가 이를 재생할 수 있다.

세션은 첫 animation track을 사용한다.

```html
<model id="bottle" src="bottle.usdz"></model>

<button onclick="play(5)">Play</button>
<button onclick="play(-5)">Reverse</button>

<script>
    const model = document.getElementById("bottle");

    function play(rate) {
        model.playbackRate = rate;
        model.play();
    }
</script>
```

---

# ▶️ `playbackRate`

`playbackRate`은 direction과 speed를 함께 제어한다.

```text
Positive
→ Forward

Negative
→ Reverse

Absolute value 증가
→ Faster playback
```

세션 예시는 다음을 사용한다.

```text
5
-5
```

---

# 📱 AR Quick Look

iOS와 iPadOS에서는 Model Element를 AR Quick Look과 연결할 수 있다.

```html
<a rel="ar" href="bottle.usdz">
    <model id="boot" src="bottle.usdz"></model>
</a>
```

사용자가 model을 탭하면 실제 환경에서 object를 볼 수 있다.

```text
Web Product Model
      ↓
AR Quick Look
      ↓
Real-world Placement
```

---

# 🥽 visionOS

visionOS에서는 Model Element가 stereoscopic rendering을 지원한다.

즉 flat webpage 안에 있는 단순 WebGL image가 아니라 실제 depth를 가진 3D object처럼 보인다.

사용자는 model을 page 밖으로 꺼내 손앞에서 살펴보는 경험을 할 수 있다.

---

# 🌌 Immersive Website Environments

visionOS에서는 Model Element가 immersive website environment에도 사용된다.

이는 단순 object viewer보다 한 단계 더 나아가 사용자를 전체 scene 안으로 이동시킨다.

관련 세션:

```text
Explore immersive website environments in visionOS
WWDC26 Session 320
```

215번은 Model Element 자체의 기본기를 다루고, 320번은 environment 전체를 spatial experience로 확장하는 흐름이다.

---

# ⚡ Production에서 가장 중요한 것: Asset Size

로컬에서는 잘 작동해도 실제 인터넷에서는 USDZ 크기가 문제가 된다.

3D asset은 일반 image보다 훨씬 무거울 수 있다.

따라서 production 배포 전 반드시 최적화해야 한다.

---

# 🗜️ `usdcrush`

macOS에 기본 포함된 command-line tool이다.

목적:

- USDZ file size 축소
- 시각적 품질 최대한 유지

세션 demo:

```text
Before: 7.9 MB
After:  1.9 MB
```

약 4배 이상 감소했다.

Safari에서 side-by-side 비교했을 때 시각적으로 차이가 없었다.

---

# 🖼️ `usdrecord`

3D model은 있지만 fallback image가 없다면 `usdrecord`를 사용할 수 있다.

가능한 작업:

- Thumbnail 생성
- Fallback image 생성
- Output format 지정
- Custom camera 사용

장점:

- 수동 screenshot 필요 없음
- Script automation 가능
- 대규모 catalog에 적용 가능

---

# 🤖 Catalog Automation

E-commerce처럼 model이 많다면 다음 pipeline을 자동화할 수 있다.

```text
USDZ Input
      ↓
usdcrush
      ↓
Optimized USDZ
      ↓
usdrecord
      ↓
Fallback Image / Thumbnail
      ↓
Website Publish
```

이 pipeline은 shell script나 build pipeline으로 자동화하기 적합하다.

---

# 🌐 Web Standard로서의 Model Element

Model Element는 Apple 전용 독자 기술로 끝나는 것이 목표가 아니다.

Apple은 W3C Model Element specification에 적극 참여하고 있다.

세션에서 언급한 ecosystem:

- W3C Immersive Web Community Group
- Alliance for OpenUSD
- Model element sample repository
- WebKit issue tracker

목표는 다른 browser와 platform에서도 같은 markup이 동작하는 표준으로 발전시키는 것이다.

---

# 🧩 Model Element vs `model-viewer`

| 항목 | HTML `<model>` | `model-viewer` |
|---|---|---|
| 구현 방식 | Native browser element | JavaScript library |
| 추가 library | 불필요 | 필요 |
| Safari 통합 | Native | Library 기반 |
| visionOS stereo | Native 지원 | 동일 수준 polyfill 불가 |
| Web standard | Emerging standard | Library API |
| Fallback | Native HTML 구조 | Library별 구현 |
| Interaction | `stagemode`, transform API | Library API |

---

# 🧩 Orbit vs Custom Transform

| 항목 | `stagemode="orbit"` | `entityTransform` |
|---|---|---|
| 구현 난이도 | 매우 낮음 | 높음 |
| Free rotation | 기본 제공 | 직접 구현 |
| Spring-back | 제공 | 직접 구현 |
| Clipping 보호 | 더 잘 처리 | 직접 관리 |
| Precise view angle | 제한적 | 매우 유연 |
| Animation | 기본 interaction | 직접 구현 |

원칙:

```text
단순 제품 탐색
→ Orbit

정확한 Camera/View Preset
→ entityTransform
```

---

# 🧩 전체 구현 흐름

```text
3D Asset 생성
      ↓
USDZ Export
      ↓
<model> Embed
      ↓
Fallback Image
      ↓
ready Promise
      ↓
Orbit 또는 Custom Transform
      ↓
Animation
      ↓
AR Quick Look / visionOS Spatial
      ↓
usdcrush
      ↓
usdrecord
      ↓
Production Deploy
```

---

# 📋 체크리스트

## Asset 준비

- [ ] 대상 object 또는 scene 정의
- [ ] iPhone scan 가능성 검토
- [ ] 기존 3D format conversion 검토
- [ ] Blender 등 authoring tool 사용 여부 결정
- [ ] Generative AI 기반 3D 생성 검토
- [ ] 최종 asset을 USDZ로 export
- [ ] Geometry / material / texture / animation 확인

## HTML Embed

- [ ] `<model src="...">` 사용
- [ ] 필요 시 `<source>`와 MIME type 명시
- [ ] Width / height / layout 확인
- [ ] Page design과 model 영역 크기 조화 확인

## Fallback

- [ ] `<img>` fallback 추가
- [ ] 의미 있는 `alt` 제공
- [ ] Model 미지원 browser에서 실제 fallback 확인
- [ ] Network failure fallback 확인
- [ ] Polyfill 적용 여부 결정
- [ ] Native / polyfill 양쪽 테스트

## Loading

- [ ] `model.ready` 사용
- [ ] Loading spinner 제공
- [ ] Promise resolve 후 spinner 숨김
- [ ] Promise reject 처리
- [ ] 매우 큰 USDZ에서 UX 확인

## Background

- [ ] `model { background-color: ... }` 설정 검토
- [ ] Model virtual space가 page background를 자동 상속하지 않음을 고려
- [ ] Background가 opaque임을 고려
- [ ] Dark/light page에서 appearance 확인

## Interaction

- [ ] 단순 product viewer면 `stagemode="orbit"` 우선 검토
- [ ] Custom view preset이 필요하면 orbit 비활성화
- [ ] `entityTransform` 사용
- [ ] `DOMMatrix` 기반 orientation 정의
- [ ] Reset transform 보관
- [ ] Rotation 후 clipping 확인
- [ ] Position/scale 보정 필요 여부 검토

## Transition Animation

- [ ] `requestAnimationFrame` 사용
- [ ] 진행 중 animation 취소
- [ ] 시작 angle 추적
- [ ] Duration 정의
- [ ] Easing 적용
- [ ] 연속 input에서 transition 충돌 테스트

## USDZ Animation

- [ ] USDZ에 animation track 포함 여부 확인
- [ ] `model.play()` 사용
- [ ] `playbackRate` 설정
- [ ] 음수 rate reverse 동작 확인
- [ ] 고속 playback에서 quality 확인

## AR

- [ ] iOS/iPadOS에서 `<a rel="ar">` 적용
- [ ] `href`와 `<model src>`가 같은 USDZ를 가리키는지 확인
- [ ] AR Quick Look 실제 device 테스트
- [ ] Object physical scale 확인

## visionOS

- [ ] Stereo appearance 확인
- [ ] Model을 page 밖으로 꺼낼 때 scale 확인
- [ ] Spatial interaction 테스트
- [ ] 필요하면 immersive website environment 세션 연계

## Production Optimization

- [ ] `usdcrush` 실행
- [ ] Before/after file size 비교
- [ ] Visual quality side-by-side 비교
- [ ] `usdrecord`로 fallback image 생성
- [ ] Custom camera 필요 여부 검토
- [ ] Catalog batch automation 구성
- [ ] CDN/cache header 전략 검토

## Standards / Compatibility

- [ ] Native Model Element support 확인
- [ ] Polyfill fallback 확인
- [ ] Stereo 같은 native-only feature 차이 문서화
- [ ] W3C spec 변화 모니터링
- [ ] WebKit issue / feedback 필요 시 제출

---

# ⚠️ 구현 시 주의할 점

## Model Element는 Page Background를 그대로 사용하지 않는다

자체 virtual space에서 렌더링되므로 background를 model에 직접 지정해야 한다.

## Transparent Background를 기대하지 않는다

Background color의 alpha는 최종적으로 opaque 처리된다.

## `ready` 없이 즉시 표시 가능하다고 가정하지 않는다

USDZ는 큰 파일일 수 있으므로 loading state를 반드시 고려해야 한다.

## Custom Transform에서는 Clipping을 직접 관리한다

Orbit mode가 해주던 scaling/protection을 더 이상 기대할 수 없다.

## Polyfill은 모든 기능을 복제하지 못한다

특히 spatial stereoscopic rendering은 native platform integration이 필요하다.

## Production에서는 Asset Size가 매우 중요하다

세션 demo처럼 같은 visual quality에서도 몇 배의 size 차이가 날 수 있다.

---

# 🎯 어떤 API를 선택할까

## 단순 3D 제품 Viewer

```text
<model>
+
stagemode="orbit"
```

## 특정 Angle Preset

```text
entityTransform
+
DOMMatrix
```

## 부드러운 View 전환

```text
requestAnimationFrame
+
entityTransform
```

## USDZ 내부 Animation

```text
play()
+
playbackRate
```

## 실제 공간 배치

```text
<a rel="ar">
```

## visionOS Spatial Experience

```text
Model Element
+
Stereo Rendering
+
Immersive Website Environments
```

---

# 핵심 메시지

HTML Model Element의 가장 중요한 변화는 **3D를 웹에서 더 이상 별도 JavaScript framework 중심으로만 다루지 않아도 된다는 것**이다.

```html
<model src="product.usdz"></model>
```

이 하나의 native HTML element가 iPhone, iPad, Mac, Vision Pro의 Safari에서 같은 3D asset을 표현한다.

단순한 상품 탐색은 `stagemode="orbit"` 한 줄로 만들 수 있고, 더 정교한 제품 view는 `entityTransform`과 `DOMMatrix`로 제어할 수 있다.

USDZ에 animation이 포함돼 있다면 `play()`와 `playbackRate`로 forward/reverse playback을 제공할 수 있고, iOS/iPadOS에서는 `<a rel="ar">`로 AR Quick Look까지 이어진다.

visionOS에서는 같은 Model Element가 stereoscopic object와 immersive website environment의 기반으로 확장된다.

하지만 production에서 가장 중요한 문제는 asset 크기다.

세션의 `usdcrush` demo는 7.9 MB USDZ를 1.9 MB로 줄이면서 시각적 품질을 유지했고, `usdrecord`는 3D asset에서 thumbnail과 fallback image를 자동 생성한다.

결국 권장 workflow는 다음과 같다.

```text
USDZ Asset 준비
      ↓
Native <model> Embed
      ↓
Fallback + ready Handling
      ↓
Orbit / Custom Transform
      ↓
Animation / AR / Spatial
      ↓
USD Toolchain으로 최적화
      ↓
Production Web 배포
```

그리고 이 요소는 Apple 전용 API가 아니라 W3C에서 표준화 중인 웹 기술이라는 점이 장기적으로 가장 중요한 의미다.

---

# 함께 보면 좋은 세션과 자료

- Explore immersive website environments in visionOS — WWDC26
- What’s new in WebKit for Safari 27 — WWDC26
- What’s new for the spatial web — WWDC25
- What’s new in USD and MaterialX — WWDC24
- W3C Model Element
- Alliance for OpenUSD
- WebKit Model Element resources
