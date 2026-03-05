# What’s new for the spatial web

`<br>`{=html}`<br>`{=html}

## 개요

visionOS Safari는 웹을 **Spatial Web**로 확장합니다.\
웹 페이지에서 **3D 모델, immersive media, 환경(environment)**을 제공할
수 있습니다.

이 세션에서는 다음을 소개합니다.

-   HTML **model element**
-   immersive media (180°, 360°, spatial video)
-   website environments

이를 통해 웹 페이지가 **평면 UI를 넘어 공간 경험으로 확장**됩니다.
fileciteturn21file0

`<br>`{=html}`<br>`{=html}

## HTML Model Element

웹 페이지에 **3D 모델을 직접 embed**할 수 있는 새로운 HTML 요소입니다.

``` html
<model src="model.usdz"></model>
```

특징

-   Safari visionOS 기본 지원
-   stereoscopic rendering
-   depth perception
-   페이지와 함께 inline 렌더링

모델은 페이지 표면 뒤의 **virtual space**에 렌더링됩니다.

`<br>`{=html}`<br>`{=html}

## 지원 포맷

Model element는 **USDZ** 포맷을 사용합니다.

USDZ 생성 방법

-   iPhone Object Capture
-   Reality Composer
-   Blender / Maya / Houdini
-   Reality Composer Pro
-   macOS Preview 변환

`<br>`{=html}`<br>`{=html}

## 모델 최적화

3D 모델은 용량이 크기 때문에

-   텍스처 압축
-   폴리곤 최적화

등을 통해 **파일 크기를 줄이는 것이 중요**합니다.

`<br>`{=html}`<br>`{=html}

## Fallback 지원

모든 브라우저가 model element를 지원하지 않습니다.

Fallback 예시

``` html
<model src="camera.usdz">
  <img src="camera.png">
</model>
```

또는

-   Three.js
-   Babylon.js
-   model-viewer

같은 라이브러리 사용 가능

`<br>`{=html}`<br>`{=html}

## Feature Detection

User Agent가 아니라 **Feature detection** 사용

``` javascript
if (window.HTMLModelElement) {
}
```

`<br>`{=html}`<br>`{=html}

## Model Loading

USDZ 파일은 보통 **10MB 이상**일 수 있습니다.

모델 로딩 완료 확인

``` javascript
model.ready.then(() => {
})
```

ready는 Promise를 반환합니다.

`<br>`{=html}`<br>`{=html}

## Model Styling

Model element는 CSS 스타일 적용 가능

``` css
model {
  background-color: #000;
}
```

주의

-   model 자체에 적용해야 함

`<br>`{=html}`<br>`{=html}

## Image Based Lighting (IBL)

모델 조명은 **environment map**으로 제어합니다.

``` html
<model environmentmap="studio.hdr">
```

추천 포맷

-   OpenEXR
-   Radiance HDR

JPEG IBL은 조명 품질이 떨어집니다.

`<br>`{=html}`<br>`{=html}

## Model Interaction

기본 interaction

-   pinch drag
-   rotate
-   drag & drop
-   Quick Look AR

모델을 페이지 밖으로 drag 하면

👉 **AR Quick Look**으로 실제 공간에서 볼 수 있습니다.

`<br>`{=html}`<br>`{=html}

## Stage Mode

모델 회전 활성화

``` html
<model stagemode="orbit">
```

특징

-   Y-axis rotation
-   slight tilt

`<br>`{=html}`<br>`{=html}

## Custom Transform

JavaScript로 모델 위치 제어 가능

``` javascript
model.entityTransform
```

지원

-   scale
-   rotation
-   translation

`<br>`{=html}`<br>`{=html}

## Model Animation

USDZ는 animation을 지원합니다.

자동 재생

``` html
<model autoplay loop>
```

JavaScript 제어

``` javascript
model.play()
model.pause()
```

`<br>`{=html}`<br>`{=html}

## Animation Timeline

USDZ animation timeline 접근

``` javascript
model.currentTime
```

예

``` javascript
model.currentTime = 3
```

이를 통해

-   제품 데모
-   인터랙티브 UI

구현 가능

`<br>`{=html}`<br>`{=html}

## Dynamic Model Generation

Three.js를 사용하면

브라우저에서 **동적으로 USDZ 생성** 가능

흐름

1.  THREE.Scene 생성
2.  USDZ exporter
3.  Blob 생성
4.  model element src 지정

`<br>`{=html}`<br>`{=html}

## Immersive Media

visionOS는 새로운 immersive media 지원

-   spatial video
-   180° video
-   360° video
-   wide field-of-view video
-   Apple Immersive Video

웹에서는 **video element 그대로 사용**합니다.

`<br>`{=html}`<br>`{=html}

## APMP

immersive media는

**Apple Projected Media Profile (APMP)**

메타데이터 포함해야 합니다.

이 정보는

-   camera parameters
-   projection info

를 제공합니다.

`<br>`{=html}`<br>`{=html}

## Fullscreen Immersion

immersive media는

**fullscreen에서 immersive playback**됩니다.

``` javascript
video.requestFullscreen()
```

`<br>`{=html}`<br>`{=html}

## Spatial Photos

spatial photo는

-   inline → 2D
-   fullscreen → spatial

새로운 attribute

    controls

Spatial photo badge 제공

(visionOS developer preview)

`<br>`{=html}`<br>`{=html}

## Website Environments

웹 페이지에 **공간 환경 제공 가능**

``` html
<link rel="spatial-backdrop" href="environment.usdz">
```

특징

-   Safari UI와 함께 표시
-   Digital Crown으로 immersion 조절

`<br>`{=html}`<br>`{=html}

## Spatial Web 정리

이번 세션 핵심 기능

1.  HTML **model element**
2.  immersive media 지원
3.  spatial photos
4.  website environments

`<br>`{=html}`<br>`{=html}

## 한 줄 요약

visionOS Safari는 웹을 **2D 페이지에서 Spatial Experience로 확장**하며\
3D 모델, immersive media, 환경을 통해 완전히 새로운 웹 경험을
제공합니다.
