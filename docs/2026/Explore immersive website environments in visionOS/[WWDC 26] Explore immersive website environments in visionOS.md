# WWDC26 Explore immersive website environments in visionOS 요약

- Session: 320
- Title: Explore immersive website environments in visionOS
- Source: https://developer.apple.com/videos/play/wwdc2026/320/
- Topic: Safari, visionOS, Spatial Web, HTML Model Element, Immersive API, Fullscreen API, USDZ, RealityKit Annotations, Spatial Photos
- Chapters: Introduction, Meet the immersive API, Preview environments inline, Go immersive, Optimize the experience, Image controls, Next steps

---

## 한 줄 요약

visionOS Safari의 새 Immersive API는 HTML `<model>` 요소에 `requestImmersive()`를 호출하는 것만으로 **웹페이지는 그대로 유지하면서 USDZ 환경을 Safari 창 바깥의 실제 공간 규모로 펼칠 수 있게 하며**, inline/immersive 좌표계 전환, fullscreen video docking, model animation, Safari window shadow, spatial image controls까지 일반 웹 API와 결합해 앱 설치 전에도 강력한 spatial experience를 제공한다.

---

## 핵심 요약

이번 세션은 웹사이트에서 immersive environment를 만드는 전체 흐름을 두 가지 예제로 설명한다.

- Theater ticket sales site
  - 좌석을 고르면 theater environment를 inline `<model>`로 미리보기
  - 선택한 좌석의 실제 시점으로 `entityTransform` 조정
  - `requestImmersive()`로 같은 모델을 실제 공간 크기의 immersive environment로 확장
- Escape game marketing site
  - inline preview를 아예 숨기고 버튼 클릭 시에만 environment 로드
  - fullscreen video를 environment 내부 TV에 docking
  - video 종료 이벤트로 model animation 실행
  - Safari window가 environment에 shadow를 cast하도록 RealityKit annotation 적용

주요 API와 개념:

- HTML `<model>` element
- `environmentmap`
- `entityTransform`
- `DOMMatrix`
- `document.immersiveEnabled`
- `model.requestImmersive()`
- `document.immersiveElement`
- `immersivechange`
- Fullscreen API와 동시 사용
- `:immersive` CSS pseudo-class
- Image `controls` attribute
- RealityKit annotation 기반 video docking / Scene Understanding
- `usdcrush`를 이용한 USDZ texture compression

---

# 🌐 Immersive API의 기본 아이디어

기존 웹의 Fullscreen API와 매우 비슷한 사용 패턴을 가진다.

Fullscreen:

```javascript
video.requestFullscreen()
```

Immersive:

```javascript
model.requestImmersive()
```

차이는 presentation 방식이다.

```text
Fullscreen API
→ 웹페이지 content를 fullscreen element로 대체

Immersive API
→ 웹페이지는 그대로 남김
→ model만 Safari 창 바깥의 공간으로 확장
```

두 API는 동시에 active일 수 있다.

예를 들어:

```text
Immersive Room
      +
Fullscreen Video
```

이 조합이 escape-room demo의 핵심이다.

---

# 🧊 출발점: HTML Model Element

기본 3D model:

```html
<model src="teapot.usdz">
</model>
```

Environment map까지 추가:

```html
<model src="teapot.usdz"
       environmentmap="kitchen.hdr">
</model>
```

`environmentmap`은 360-degree image를 사용해 scene의 surrounding light를 표현한다.

특히 반사율이 높은 물체의:

- Reflection
- Lighting
- Surface realism

을 크게 향상시킨다.

3D asset은 Blender를 포함해 USDZ export가 가능한 다양한 tool에서 만들 수 있다.

---

# 🎟️ 예제 1: Theater Ticket Sales

웹사이트에서 사용자가 좌석을 선택하면 해당 좌석의 view를 3D로 미리 보여준다.

```text
Seat Selection
      ↓
Inline Theater Preview
      ↓
Immersive Preview Button
      ↓
실제 Theater 안으로 진입
```

---

# 🖼️ Theater Environment를 Inline으로 표시

```html
<div class="seat-preview">
    <model id="theater"
           src="theater-model.usdz"
           environmentmap="theater-lighting.hdr">
    </model>
</div>
```

기본 상태에서는 model이 element bounds에 맞게 자동으로 scale된다.

하지만 environment model에서는 이 default fitting이 부적절할 수 있다.

Theater 전체를 바깥에서 보는 대신 사용자가 내부 좌석에 앉아 있는 view를 만들어야 한다.

---

# 🧮 `entityTransform`

Model의 position, rotation, scale은 `entityTransform`으로 제어한다.

먼저 default transform을 identity로 reset한다.

```javascript
const theater = document.getElementById("theater");

async function updateModelTransform() {
    await theater.ready;

    const identity = new DOMMatrix();
    theater.entityTransform = identity;
}

updateModelTransform();
```

`await theater.ready`로 model이 load되어 transform 가능한 상태인지 보장한다.

---

# 👁️ Inline Preview의 Eye Level 맞추기

Theater model의 origin이 floor에 있다.

Inline layer에서는 model origin이 layer center에 오기 때문에 그대로 두면 floor가 화면 가운데 온다.

세션에서는 seated human eye level을 약 1m로 보고 model을 아래로 이동한다.

```javascript
transform.translateSelf(
    0,
    -1.0,
    0
);
```

즉:

```text
Model Floor Origin
      ↓ 1m
Inline Camera Eye Level
```

---

# 💺 좌석별 Point of View

좌석마다 별도 JSON data를 가진다.

각 항목에는:

- `x`
- `y`
- `z`
- `ry`

가 들어 있다.

의미:

- Model origin에서 seat bottom까지 translation
- Stage를 바라보는 yaw rotation

Web convention:

```text
Right-handed
Y-up coordinate system
```

Seat transform:

```javascript
function buildTransform(seat) {
    const transform = new DOMMatrix();
    const { x, y, z, ry } = seat;

    transform.rotateSelf(0, -ry, 0);
    transform.translateSelf(-x, -y, -z);
    transform.translateSelf(0, -1.0, 0);

    return transform;
}
```

좌석이 바뀔 때마다 해당 transform을 적용하면 실제 좌석 위치의 preview가 된다.

이 inline preview는 visionOS만이 아니라 macOS와 iOS에서도 동작한다.

---

# 🥽 Immersive API 지원 여부 확인

먼저 현재 browser가 Immersive API를 지원하는지 확인한다.

```javascript
if (document.immersiveEnabled) {
    immersiveButton.hidden = false;
}
```

이 방식으로 지원되는 platform에서만 immersive UI를 노출할 수 있다.

---

# 🚪 `requestImmersive()`

Immersive transition은 반드시 user interaction에 대한 response로 호출해야 한다.

```javascript
immersiveButton.addEventListener("click", async () => {
    await model.requestImmersive();
});
```

즉 자동으로 immersive mode에 진입시키는 것이 아니라 button tap 같은 명시적인 사용자 행동이 필요하다.

---

# 📐 Inline과 Immersive의 Reference Frame은 다르다

이 세션에서 가장 중요한 개념 중 하나다.

## Inline

```text
Origin
→ Inline layer center

Scale
→ CSS convention
```

## Immersive

```text
Origin
→ 사용자의 발 위치 / floor

Scale
→ 실제 world scale
```

따라서 inline에서 사용하던 transform을 그대로 immersive mode에 적용하면 의도한 공간 위치가 나오지 않을 수 있다.

---

# 🪟 Safari Window 뒤에서 Environment가 열린다

Immersive environment는 Safari window를 없애는 것이 아니라 **그 뒤에서 열린다.**

따라서 scene의 주요 focus point를 Safari 창 뒤에 숨기지 않는 것이 중요하다.

Theater demo에서는 immersive mode일 때 model을 약간 회전해 stage가 Safari window 뒤에 가리지 않게 한다.

```javascript
if (immersive) {
    transform.rotateSelf(
        0,
        45,
        0
    );
}
```

또 inline에서 사용하던 eye-level translation은 immersive mode에서는 사용하지 않는다.

---

# 🔄 `immersivechange`

Model의 immersive state가 바뀔 때마다 transform과 web UI를 업데이트한다.

```javascript
theater.addEventListener("immersivechange", () => {
    const isImmersive = !!document.immersiveElement;
    const transform = buildTransform(currentSeat, isImmersive);

    theater.entityTransform = transform;
    document.body.classList.toggle("immersive", isImmersive);
});
```

중요:

- Immersive entry
- Immersive exit
- Digital Crown으로 사용자 직접 종료

모두 발생할 수 있으므로 state 변화는 event 기반으로 처리해야 한다.

UI가 immersive state에 의존한다면 앱처럼 internal boolean만 믿지 말고 실제 document state를 확인해야 한다.

---

# 🚪 명확한 Exit UI

Apple은 immersive experience에 명확한 exit affordance를 제공하라고 권장한다.

사용자는 Vision Pro의 Digital Crown으로 언제든 environment를 dismiss할 수 있지만 웹 UI에도 종료 기능이 있는 것이 좋다.

---

# 🕵️ 예제 2: Escape Game Marketing Site

두 번째 예제는 앱의 escape-room environment를 마케팅 사이트에서 체험시키는 구조다.

```text
Marketing Website
      ↓
Enter Room Button
      ↓
Immersive Escape Room
      ↓
Video plays on TV
      ↓
Door opens
      ↓
App download 유도
```

핵심은 앱 asset을 웹에서도 재사용해 앱 설치 전 spatial teaser를 제공한다는 점이다.

---

# 🙈 Inline Preview를 숨기기

Escape room은 surprise를 위해 inline preview를 보여주지 않는다.

```html
<model id="escapeRoom"
       src="escape-room.usdz"
       environmentmap="room-lighting.hdr"
       style="display: none">
</model>
```

`display:none`의 중요한 성능 특성:

> Inline에서 사용되지 않는 model은 immersive request가 실제로 발생하기 전까지 download와 decode를 지연할 수 있다.

Heavy environment의 경우:

- Bandwidth 절약
- Memory 절약
- 방문자가 실제로 immersive experience를 쓰지 않는 경우 불필요한 work 방지

가 가능하다.

---

# ⏳ Loading Feedback

Model을 미리 inline preload하지 않으면 immersive request가 완료되기까지 시간이 걸릴 수 있다.

특히:

- Large USDZ
- Complex textures
- Slow network

에서 더 그렇다.

따라서 loading indicator를 제공한다.

```javascript
enterButton.addEventListener("click", async () => {
    showLoadingAnimation();

    try {
        await escapeRoom.requestImmersive();
    } catch (error) {
        console.log(error);
    } finally {
        hideLoadingAnimation();
    }
});
```

---

# 📺 Video Docking

Immersive room 안의 TV screen에 웹 video를 docking할 수 있다.

기본 idea:

```text
HTML Video
      ↓ requestFullscreen()
Fullscreen API
      ↓
USDZ의 Video Docking Region
      ↓
Environment 내부 TV Screen
```

Video docking region은 USDZ 안에 RealityKit annotation으로 표시한다.

---

# 🛠️ Blender Add-on

세션 발표자는 Blender extension을 사용해 다음 RealityKit annotation을 authoring한다.

- Video docking region
- Video light spill 관련 material metadata
- Scene Understanding component

이 annotation들은 아직 web standard 자체가 아니라 RealityKit-specific metadata다.

Session resource에 Blender용 immersive model add-on이 제공된다.

---

# 🖥️ Fullscreen API가 Environment 내부 Video를 이동시킨다

```javascript
const trailerVideo = document.getElementById("trailerVideo");
const demoButton = document.getElementById("demoButton");

demoButton.addEventListener("click", async () => {
    await trailerVideo.requestFullscreen();
});
```

USDZ에 docking annotation이 되어 있으면 fullscreen video가 자동으로 해당 surface로 이동한다.

동시에 Safari window가 숨겨진다.

---

# 💡 Video Light Spill

TV video의 빛이 바닥과 벽에 반사되는 것처럼 만들 수 있다.

효과:

```text
TV 영상
   ↓
환경 Material에 diffuse / reflected light
   ↓
Scene realism 향상
```

세션에서는 이 lighting effect를 Blender 단계에서 material에 bake한다.

---

# 🚪 Model Animation

Escape-room door opening animation은 Blender에서 이미 authoring해 USDZ에 포함한다.

Web에서는 animation timing만 제어한다.

```javascript
trailerVideo.addEventListener("ended", async () => {
    await document.exitFullscreen();
    escapeRoom.play();
});
```

Video가 끝나면:

1. Fullscreen video 종료
2. Video undock
3. Safari window 복귀
4. Model animation 재생

---

# ⏱️ Animation Timeline 제어

Model element에는 `currentTime` property도 있다.

따라서 하나의 animation timeline에 여러 scene state를 만들고 웹에서 timeline position을 변경할 수 있다.

가능한 예:

```text
Stage 1
Door Closed
      ↓
Stage 2
Lights Change
      ↓
Stage 3
Door Opens
      ↓
Stage 4
Hidden Room Revealed
```

---

# 🌑 Safari Window Shadow

Immersive environment에서도 Safari window는 공간 안에 존재한다.

세션에서는 Safari window가 floor와 wall에 shadow를 cast하게 한다.

이 shadow는 단순 장식이 아니라 spatial cue 역할을 한다.

```text
Window
  ↓ Shadow
Environment Surface
  ↓
사용자가 Window의 공간 위치를 이해
```

Safari window가 environment에 실제로 놓인 물체처럼 느껴지게 한다.

---

# 🧩 Scene Understanding Annotation

Shadow를 받을 mesh에 Scene Understanding component를 태그한다.

세션에서는 shadow receiver용 mesh를 별도로 low-poly로 만든다.

이유:

> 복잡한 environment mesh 전체에 shadow calculation을 수행하면 resource cost가 커질 수 있다.

즉:

```text
Detailed Visual Mesh
        +
Low-poly Shadow Receiver Mesh
```

를 분리한다.

---

# ⚡ Performance 최적화

Environment model은 일반 3D object보다 훨씬 무겁다.

최적화 목표:

```text
Download Time 감소
        +
Memory 감소
        +
Runtime Rendering Cost 감소
```

Apple은 네 가지를 강조한다.

---

# 1️⃣ Vertex Count 줄이기

사용자가 origin에서 절대 볼 수 없는 geometry는 export하지 않는다.

Escape room 예:

- Environment 바깥쪽 mesh
- 완전히 가려진 구조
- 사용자 시점에서 볼 수 없는 surface

를 제거한다.

이렇게 하면 visual quality를 유지하면서 vertex count를 크게 줄일 수 있다.

---

# 2️⃣ Entity Count 줄이기

각 object를 별도 entity로 유지하면 runtime overhead가 증가한다.

세션에서는 desk와 그 위의 decoration을 merge한다.

```text
Desk
Cup
Paper
Lamp
Decoration
      ↓ Merge
Single Entity
```

Entity 수를 줄이면 scene graph cost를 줄일 수 있다.

---

# 3️⃣ Low-poly Mesh 사용

Visual fidelity가 직접 필요하지 않은 용도에는 low-poly geometry를 쓴다.

대표 예:

- Scene Understanding shadow receiver
- Collision / helper geometry
- Invisible support mesh

---

# 4️⃣ Shader 단순화

Escape room에서는 lighting과 shadow를 texture에 bake한다.

결과적으로 runtime material을 unlit로 만들 수 있다.

```text
Complex Runtime Lighting
      ↓ Bake
Texture에 Light + Shadow 포함
      ↓
Unlit Material
```

장점:

- Shader computation 감소
- Runtime rendering cost 감소
- Mobile/spatial hardware에서 안정적인 performance

---

# 🗜️ `usdcrush`

Texture와 USDZ asset을 압축한다.

```bash
usdcrush model.usdz -o optimized.usdz
```

`usdcrush`는 Mac의 command-line tool로 제공된다.

효과:

- USDZ file size 감소
- Download time 감소
- Slow connection에서 immersive entry latency 감소

---

# 🖼️ Image Controls API

세션 마지막에는 `<image>` element의 `controls` attribute도 소개한다.

```html
<img src="panorama.jpg" controls>
```

Browser가 platform-specific native controls를 제공한다.

visionOS에서는:

- Panorama fullscreen
- Spatial photo immersive viewing

같은 experience가 가능하다.

Spatial photo는:

- Apple Vision Pro
- iPhone

에서 촬영할 수 있다.

---

# 🧩 Immersive API와 Fullscreen API 비교

| 항목 | Fullscreen API | Immersive API |
|---|---|---|
| 대상 | Video 등 DOM element | HTML `<model>` |
| 핵심 API | `requestFullscreen()` | `requestImmersive()` |
| Presentation | Page content를 fullscreen으로 대체 | Page 유지 + model을 공간으로 확장 |
| Safari window | 대체됨/숨김 | 기본적으로 남아 있음 |
| 두 API 동시 사용 | 가능 | 가능 |
| 대표 사용 | Video fullscreen | USDZ environment |

---

# 🧩 Inline vs Immersive 비교

| 항목 | Inline Model | Immersive Model |
|---|---|---|
| Origin | Inline layer center | 사용자의 feet/floor |
| Scale | CSS convention | Real-world scale |
| Platform | macOS/iOS/visionOS 등 | visionOS 지원 browser |
| 주요 목적 | Preview | Full environment |
| Transform | Screen framing 중심 | Physical-space framing 중심 |
| Main UI | 웹페이지 안 | Safari window 바깥 environment |

---

# 🔁 Theater Site Workflow

```text
Seat 선택
      ↓
Seat JSON position lookup
      ↓
DOMMatrix 생성
      ↓
Inline entityTransform
      ↓
사용자 좌석 시점 Preview
      ↓
immersiveEnabled 확인
      ↓
Button tap
      ↓
requestImmersive()
      ↓
immersivechange
      ↓
Immersive transform 적용
      ↓
Theater 안에서 실제 규모 체험
```

---

# 🔁 Escape Game Workflow

```text
Hidden <model>
display:none
      ↓
사용자가 Enter 버튼 탭
      ↓
Loading UI
      ↓
requestImmersive()
      ↓
Asset Download / Decode
      ↓
Escape Room 진입
      ↓
Video requestFullscreen()
      ↓
TV Docking
      ↓
Video Light Spill
      ↓
Video ended
      ↓
exitFullscreen()
      ↓
model.play()
      ↓
Door Animation
```

---

# 📋 체크리스트

## HTML Model Element

- [ ] USDZ environment 준비
- [ ] `<model src="...">` 구성
- [ ] 필요하면 `environmentmap` 제공
- [ ] `model.ready` 대기
- [ ] `entityTransform` 적용 전 load 상태 확인
- [ ] Inline preview가 iOS/macOS에서도 의미 있는지 테스트

## Inline Environment Preview

- [ ] Default auto-fit이 environment에 적절한지 확인
- [ ] 필요하면 identity transform으로 reset
- [ ] Eye-level translation 정의
- [ ] User viewpoint data 모델링
- [ ] Right-handed Y-up coordinate convention 확인
- [ ] Translation / rotation 순서 검증
- [ ] 좌석·위치 선택 변화에 transform 업데이트

## Immersive Transition

- [ ] `document.immersiveEnabled` 확인
- [ ] 지원 platform에서만 immersive button 노출
- [ ] `requestImmersive()`는 user interaction 안에서 호출
- [ ] Error handling 추가
- [ ] Loading indicator 제공
- [ ] Clear exit affordance 제공
- [ ] Digital Crown exit 가능성 고려

## Coordinate System

- [ ] Inline origin이 layer center임을 고려
- [ ] Immersive origin이 floor/feet임을 고려
- [ ] Inline CSS scale과 real-world immersive scale 구분
- [ ] Inline eye-level transform을 immersive에 그대로 적용하지 않기
- [ ] Main focus가 Safari window 뒤에 가려지지 않게 배치
- [ ] `immersivechange`마다 transform 재계산

## UI State

- [ ] `document.immersiveElement`를 source of truth로 사용
- [ ] `immersivechange` event listen
- [ ] CSS class 또는 `:immersive` 상태 활용 검토
- [ ] Enter/Exit UI 동기화
- [ ] 외부 dismiss에도 UI가 정상 복구되는지 확인

## Heavy Environment Loading

- [ ] Inline preview가 꼭 필요한지 결정
- [ ] Surprise/marketing experience라면 `display:none` 검토
- [ ] 사용 전 download/decode 지연 효과 측정
- [ ] Heavy USDZ에 loading feedback 제공
- [ ] Network throttling 환경에서 테스트

## Video Docking

- [ ] USDZ에 video docking region annotation
- [ ] Blender add-on 또는 RealityKit annotation workflow 구성
- [ ] HTML video element 준비
- [ ] User gesture에서 `requestFullscreen()` 호출
- [ ] Video가 target screen surface에 정확히 docking되는지 확인
- [ ] Safari window hide/show behavior 확인
- [ ] Audio behavior 테스트

## Video Lighting

- [ ] Video light spill이 필요한 material 정의
- [ ] Bake 전략 검토
- [ ] Runtime dynamic lighting과 비용 비교
- [ ] Dark environment에서 realism 확인

## Model Animation

- [ ] Blender에서 animation authoring
- [ ] USDZ export 후 playback 검증
- [ ] `model.play()` event timing 연결
- [ ] Video `ended` event와 transition 연결
- [ ] `currentTime` 기반 multi-stage timeline 검토
- [ ] Animation 중 performance 측정

## Safari Window Shadow

- [ ] Shadow receiver mesh 정의
- [ ] Scene Understanding component annotation
- [ ] Visual mesh와 low-poly receiver 분리 검토
- [ ] Window shadow가 spatial orientation에 도움 되는지 확인
- [ ] Complex mesh에 불필요한 shadow calculation 피하기

## Asset Optimization

- [ ] 사용자 origin에서 보이지 않는 geometry 제거
- [ ] Vertex count 측정
- [ ] Entity count 측정
- [ ] Merge 가능한 object 통합
- [ ] Helper geometry를 low-poly로 구성
- [ ] Runtime shader를 단순화
- [ ] Lighting/shadow texture bake 검토
- [ ] Unlit material 사용 가능성 검토
- [ ] `usdcrush` 실행
- [ ] 압축 전후 file size 비교
- [ ] 압축 전후 visual quality 비교
- [ ] Slow network에서 load latency 비교

## Image Controls

- [ ] Panorama image에 `controls` 활용 검토
- [ ] Spatial photo에 `controls` 활용 검토
- [ ] visionOS native fullscreen behavior 확인
- [ ] 다른 platform에서 controls fallback 확인

---

# ⚠️ 구현 시 주의할 점

## Inline Transform과 Immersive Transform은 공유하면 안 된다

Reference frame과 scale이 다르다.

동일 transform을 재사용하면 immersion 진입 시 position이 크게 어긋날 수 있다.

## Immersive State를 앱 내부 Boolean로만 관리하지 않는다

사용자는 Digital Crown으로도 environment를 종료할 수 있다.

`immersivechange`와 `document.immersiveElement`를 기준으로 UI를 갱신해야 한다.

## Heavy Asset를 무조건 Preload하지 않는다

마케팅 페이지처럼 immersive entry가 선택 사항이라면 `display:none` model로 lazy loading을 활용하는 것이 bandwidth와 memory에 유리할 수 있다.

## Fullscreen Video와 Immersive Environment는 경쟁 관계가 아니다

두 API는 동시에 active될 수 있다.

이 조합을 활용하면 웹 video를 environment 내부 physical screen처럼 보이게 할 수 있다.

## Environment Asset은 일반 Object보다 공격적으로 최적화해야 한다

Real-world-scale scene은 geometry, entity, shader, texture 비용이 모두 커지기 쉽다.

Asset authoring 단계의 최적화가 immersive entry latency와 runtime smoothness에 직접 영향을 준다.

---

# 🧩 주요 API 정리

| API / Element | 역할 |
|---|---|
| `<model>` | 웹페이지에 USDZ 3D model 표시 |
| `environmentmap` | 360° environment lighting map |
| `model.ready` | Model load/ready 상태 대기 |
| `entityTransform` | Model position/rotation/scale 제어 |
| `DOMMatrix` | Transform matrix 구성 |
| `document.immersiveEnabled` | Immersive API 지원 여부 확인 |
| `requestImmersive()` | Model을 immersive environment로 전환 |
| `document.immersiveElement` | 현재 immersive element 확인 |
| `immersivechange` | Immersive state 변경 감지 |
| `:immersive` | CSS immersive state styling |
| `requestFullscreen()` | Video 등을 fullscreen presentation으로 전환 |
| `document.exitFullscreen()` | Fullscreen 종료 |
| `model.play()` | Model animation playback |
| `model.currentTime` | Animation timeline position |
| Image `controls` | Platform-specific immersive image controls |
| `usdcrush` | USDZ texture/asset compression |

---

# 🎯 적합한 Use Case

## Venue / Ticket Sales

```text
Seat / Room / Zone 선택
      ↓
Inline Preview
      ↓
Immersive Viewpoint 체험
```

예:

- Theater seat
- Stadium seat
- Concert venue
- Hotel room
- Exhibition booth

## App Marketing

```text
Web Campaign
      ↓
App Environment Teaser
      ↓
Immersive Experience
      ↓
App Download
```

특히 visionOS 앱이 이미 보유한 3D environment를 웹 마케팅에 재사용할 수 있다.

## Product / Architecture Preview

```text
Inline 3D Preview
      ↓
Real-world-scale Immersive View
```

예:

- Interior design
- Showroom
- Real estate
- Vehicle interior
- Museum / exhibition

---

# 핵심 메시지

이번 세션의 가장 중요한 변화는 웹의 3D model이 더 이상 브라우저 안의 작은 viewport에만 갇혀 있지 않다는 점이다.

HTML `<model>` 요소에 `requestImmersive()`를 호출하면 같은 USDZ environment가 Safari window 바깥의 실제 공간 크기로 확장된다.

그 과정에서 기존 웹 개발 경험을 크게 바꿀 필요도 없다.

```text
HTML
+
JavaScript
+
CSS
+
USDZ
```

그리고 이미 널리 쓰이는 Fullscreen API와 유사한 pattern을 사용한다.

Inline preview에서는 `DOMMatrix`와 `entityTransform`으로 좌석이나 viewpoint를 정밀하게 맞추고, immersive mode에서는 floor-origin과 real-world scale에 맞게 별도 transform을 적용해야 한다.

`immersivechange` event를 통해 외부 dismiss까지 포함한 실제 state 변화를 따라가고, Safari window가 environment 뒤가 아니라 앞에 존재한다는 점을 고려해 scene의 main focus를 배치해야 한다.

Escape-room demo는 Immersive API가 단순한 3D viewer가 아니라는 점을 보여준다.

Fullscreen video를 USDZ 내부 TV에 docking하고, video light spill을 material에 반영하며, video 종료 후 model animation을 실행하고, Safari window가 environment surface에 shadow를 cast하도록 만들 수 있다.

또 heavy environment는 inline preview를 숨겨 실제 immersive request 시점까지 download/decode를 미루고, invisible geometry 제거, entity merge, low-poly helper mesh, baked lighting, unlit material, `usdcrush`를 통해 적극적으로 최적화해야 한다.

결국 visionOS Safari의 Immersive API는 **앱을 설치하지 않은 웹 방문자에게도 웹페이지 하나에서 실제 공간 규모의 제품·장소·게임 환경을 체험시킬 수 있는 새로운 spatial web surface**를 제공한다.

---

# 함께 보면 좋은 세션과 자료

- Design immersive environments for visionOS apps and the spatial web — WWDC26
- Get started with the HTML Model Element — WWDC26
- What’s new in WebKit for Safari 27 — WWDC26
- Optimize your custom environments for visionOS — WWDC25
- What’s new for the spatial web — WWDC25
- Immersive model add-on for Blender
- Theater Ticket Sales immersive website environment demo
- Escape Game immersive website demo
- Spatial Backdrop explainer
