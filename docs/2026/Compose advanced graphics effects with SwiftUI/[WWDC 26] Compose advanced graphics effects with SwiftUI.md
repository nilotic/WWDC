# WWDC26 Compose advanced graphics effects with SwiftUI 요약

- Session: 322
- Title: Compose advanced graphics effects with SwiftUI
- Source: https://developer.apple.com/videos/play/wwdc2026/322/
- Topic: SwiftUI, Shader, Metal, TimelineView, Alignment, Animation
- Chapters: Introduction, Design breakdown, Cover art and shader effects, Driving animation with time, Time-synced transcript view, Floating timestamps with alignment guides, Creative pipelines, Next steps

---

## 한 줄 요약

이 세션은 팟캐스트 앱을 예제로 사용해 SwiftUI의 레이아웃과 그래픽 API를 작은 처리 단계로 나누고, `layerEffect`, Metal 셰이더, `TimelineView`, 시간 동기화 스크롤, `alignmentGuide`를 연결하여 복잡한 시각 효과를 구성하는 방법을 설명한다.

---

## 핵심 요약

Apple은 복잡해 보이는 SwiftUI 그래픽 효과도 각각의 API를 독립적인 **파이프라인 단계**로 바라보면 단순한 조합으로 만들 수 있다고 설명한다.

세션의 구현은 크게 네 부분으로 구성된다.

1. **디자인 분해**
   - 완성된 화면을 배경, 전경, 시간, 레이아웃 단계로 분리
   - 기존 데이터가 어떤 변환 과정을 거쳐야 하는지 파악

2. **커버 아트 셰이더 효과**
   - 이미지에 blur 적용
   - `layerEffect`로 원본 레이어 샘플링
   - Noise texture와 domain warping으로 유기적인 배경 생성

3. **시간 기반 애니메이션과 자막 동기화**
   - `TimelineView(.animation)`으로 프레임별 시간 전달
   - 셰이더 애니메이션과 자막 스크롤을 같은 시간 흐름에 연결

4. **정렬 가이드를 이용한 부유 레이아웃**
   - 수동 offset 없이 timestamp를 텍스트 외곽에 배치
   - `alignmentGuide`로 의미 기반 레이아웃 구성

---

# 1. Creative Pipeline

세션은 SwiftUI의 고급 그래픽과 레이아웃을 **creative pipeline**이라는 관점으로 설명한다.

파이프라인은 데이터를 입력받아 변환하고, 그 결과를 다음 단계로 전달하는 일련의 처리 과정이다.

```text
Input Data
    ↓
Transformation
    ↓
Layout / Graphics Effect
    ↓
Animation / Interaction
    ↓
Final View
```

SwiftUI에서는 다음 요소들이 각각 하나의 파이프가 될 수 있다.

- View modifier
- Layout API
- Shader effect
- Timeline
- Scroll synchronization
- Alignment guide
- Overlay
- State transformation

각 API는 단독으로도 사용할 수 있지만, 여러 단계를 연결하면 훨씬 풍부한 경험을 만들 수 있다.

세션의 핵심 메시지는 고급 효과가 복잡한 단일 API에서 나오는 것이 아니라, 단순한 API의 연결 방식에서 만들어진다는 것이다.

---

# 2. 팟캐스트 앱 디자인 분해

예제 앱의 시작점은 단순한 팟캐스트 자막 화면이다.

이미 앱에는 다음 데이터가 존재한다.

- 커버 아트
- 재생 상태
- 현재 재생 시간
- 타임스탬프가 포함된 자막 텍스트

목표 화면은 Apple Music의 실시간 가사 화면과 유사하다.

구현할 주요 효과는 다음과 같다.

| 영역 | 목표 |
|---|---|
| 배경 | 커버 아트를 전체 화면의 유동적인 시각 효과로 변환 |
| 애니메이션 | 재생 상태와 시간에 따라 배경이 움직이도록 구성 |
| 자막 | 현재 재생 중인 문장을 강조하고 중앙으로 스크롤 |
| 타임스탬프 | 현재 문장 아래에 작은 시간을 부유하는 형태로 표시 |

완성된 디자인을 그대로 구현하려 하지 않고, 각 요구사항을 독립적인 처리 단계로 분해한다.

```text
Cover Art → Blur → Shader → Time Animation

Transcript Data → Current Line Selection → Styling → Scroll Synchronization

Timestamp → Overlay → Alignment Guide
```

---

# 3. 커버 아트 배경 만들기

## 원본 이미지

첫 단계는 단순한 커버 아트 이미지다.

```swift
Image("CoverArt")
```

이 이미지는 자막 뒤의 전체 화면 배경으로 사용된다.

하지만 원본 상태에서는 세부 묘사가 강해 전경의 텍스트와 경쟁한다.

## Blur 적용

배경의 시각적 강도를 줄이기 위해 blur를 적용한다.

```swift
Image("CoverArt")
    .blur(radius: 30)
```

Blur는 다음 역할을 한다.

- 배경의 세부 묘사를 낮춤
- 전경 텍스트의 가독성 확보
- 색상과 전체적인 분위기는 유지
- 이후 셰이더 왜곡을 더 자연스럽게 보이게 함

---

# 4. SwiftUI 셰이더 효과

GPU는 벡터 그래픽을 화면의 픽셀로 래스터라이즈한다.

셰이더는 이 픽셀 처리 단계에서 실행되는 GPU 프로그램이다.

SwiftUI는 세 종류의 셰이더 효과 modifier를 제공한다.

| 효과 | 입력 | 역할 | 적합한 사례 |
|---|---|---|---|
| `colorEffect` | 위치, 원본 색상 | 픽셀의 색상 변환 | 흑백 변환, 색조 조절 |
| `distortionEffect` | 새 위치, 원본 위치 샘플링 | 픽셀 위치 왜곡 | 기하학적 변형, shear, ripple |
| `layerEffect` | 전체 View layer | 주변 또는 넓은 영역 샘플링 | blur, warp, 복합 왜곡 |

## `colorEffect`

각 픽셀의 위치와 기존 색상을 전달받고 새로운 색상을 반환한다.

출력 픽셀을 계산할 때 원본 픽셀의 색상 정보가 직접 제공된다.

## `distortionEffect`

출력 위치에 사용할 원본 이미지의 샘플링 위치를 반환한다.

색상을 직접 변환하는 대신 다음과 같은 관계를 정의한다.

```text
출력 위치 P의 색상은 원본 위치 Q에서 가져온다.
```

## `layerEffect`

전체 View layer를 전달받아 임의의 위치를 샘플링할 수 있다.

주변 픽셀이나 넓은 영역의 정보를 함께 활용할 수 있어 세 가지 API 중 가장 유연하다.

세션에서는 `layerEffect`를 사용해 배경 warp 효과를 만든다.

---

# 5. 기본 `layerEffect` 구성

SwiftUI에서 셰이더 함수를 호출한다.

```swift
GeometryReader { proxy in
    CoverArtView()
        .layerEffect(
            ShaderLibrary.backgroundWarp(),
            maxSampleOffset: .zero
        )
}
.ignoresSafeArea()
```

Metal 셰이더의 초기 구현은 현재 위치의 픽셀을 그대로 반환한다.

```metal
[[stitchable]] half4 backgroundWarp(
    float2 position,
    SwiftUI::Layer layer
) {
    return layer.sample(position);
}
```

현재 위치를 그대로 샘플링하므로 출력은 원본과 같다.

이 단계의 목적은 SwiftUI View와 Metal 함수 사이의 연결을 먼저 구성하는 것이다.

---

# 6. 샘플 위치 이동

셰이더에 offset parameter를 추가한다.

```metal
[[stitchable]] half4 backgroundWarp(
    float2 position,
    SwiftUI::Layer layer,
    float2 offset
) {
    return layer.sample(position + offset);
}
```

SwiftUI에서는 동일한 순서와 타입으로 값을 전달한다.

```swift
ShaderLibrary.backgroundWarp(
    .float2(.init(x: 0, y: 0))
)
```

Offset이 커지면 모든 출력 픽셀이 원본의 더 멀리 떨어진 위치에서 색상을 가져온다.

하지만 모든 픽셀에 동일한 offset이 적용되므로 이미지 전체가 일정한 방향으로 이동한 것처럼 보인다.

유기적인 변형을 만들려면 픽셀마다 서로 다른 offset이 필요하다.

---

# 7. Noise Texture

세션에서는 픽셀마다 다른 값을 제공하기 위해 미리 계산된 Noise texture를 사용한다.

Noise texture는 부드럽게 연결되는 무작위 값을 가진 이미지다.

SwiftUI에서는 View 크기와 Noise texture를 셰이더에 전달한다.

```swift
GeometryReader { proxy in
    CoverArtView()
        .layerEffect(
            ShaderLibrary.backgroundWarp(
                .float2(proxy.size),
                .image(Image("NoiseTexture"))
            ),
            maxSampleOffset: .zero
        )
}
.ignoresSafeArea()
```

Metal에서는 이미지가 `texture2d`로 전달된다.

```metal
[[stitchable]] half4 backgroundWarp(
    float2 position,
    SwiftUI::Layer layer,
    float2 size,
    texture2d<half> noiseTex
) {
    // ...
}
```

---

# 8. UV 좌표

픽셀의 절대 좌표 대신 이미지 내부의 상대적인 위치를 사용하기 위해 UV 좌표를 계산한다.

```metal
float2 uv = position / size;
```

UV 좌표는 일반적으로 다음 범위를 사용한다.

```text
왼쪽 상단: (0, 0)
오른쪽 하단: (1, 1)
```

UV를 사용하면 View의 실제 픽셀 크기와 무관하게 동일한 방식으로 texture를 샘플링할 수 있다.

Noise texture의 Red와 Green 채널에는 서로 다른 노이즈 패턴이 들어 있다.

두 값을 각각 X축과 Y축 offset으로 사용할 수 있다.

---

# 9. Noise 기반 왜곡

Noise texture를 반복 모드로 샘플링한다.

```metal
constexpr sampler s(
    address::repeat,
    filter::linear
);
```

각 픽셀의 UV 위치에서 Noise 값을 읽는다.

```metal
half4 n = noiseTex.sample(s, uv);
```

Red와 Green 채널을 2차원 offset으로 변환한다.

```metal
float2 offset = (
    float2(n.r, n.g) - 0.5
) * 200.0;
```

계산한 offset을 원본 layer의 샘플 위치에 더한다.

```metal
return layer.sample(position + offset);
```

전체 구현은 다음과 같다.

```metal
[[stitchable]] half4 backgroundWarp(
    float2 position,
    SwiftUI::Layer layer,
    float2 size,
    texture2d<half> noiseTex
) {
    constexpr sampler s(
        address::repeat,
        filter::linear
    );

    float2 uv = position / size;

    half4 n = noiseTex.sample(s, uv);
    float2 offset = (
        float2(n.r, n.g) - 0.5
    ) * 200.0;

    return layer.sample(position + offset);
}
```

이제 픽셀마다 서로 다른 위치를 샘플링해 이미지가 유기적으로 뒤틀린다.

---

# 10. Domain Warping

한 번의 Noise 샘플링보다 더 복잡하고 자연스러운 패턴을 만들기 위해 Noise를 두 번 샘플링한다.

첫 번째 샘플은 중간 offset을 만든다.

```metal
half4 n = noiseTex.sample(s, uv);
float2 q = float2(n.r, n.g);
```

두 번째 샘플은 첫 번째 결과로 이동한 위치에서 수행한다.

```metal
n = noiseTex.sample(s, uv + q);
```

최종 offset은 두 번째 결과에서 계산한다.

```metal
float2 offset = (
    float2(n.r, n.g) - 0.5
) * 200.0;
```

전체 구조는 다음과 같다.

```metal
[[stitchable]] half4 backgroundWarp(
    float2 position,
    SwiftUI::Layer layer,
    float2 size,
    texture2d<half> noiseTex
) {
    constexpr sampler s(
        address::repeat,
        filter::linear
    );

    float2 uv = position / size;

    half4 n = noiseTex.sample(s, uv);
    float2 q = float2(n.r, n.g);

    n = noiseTex.sample(s, uv + q);

    float2 offset = (
        float2(n.r, n.g) - 0.5
    ) * 200.0;

    return layer.sample(position + offset);
}
```

이처럼 입력 좌표 자체를 다른 Noise 결과로 변형한 후 다시 Noise를 샘플링하는 방식을 **domain warping**이라고 한다.

Domain warping은 다음과 같은 결과를 만든다.

- 흐르는 액체와 유사한 패턴
- 유기적인 덩어리 형태
- 단순 노이즈보다 복잡한 공간 변화
- 반복 패턴이 덜 드러나는 왜곡

---

# 11. 셰이더 애니메이션

셰이더는 상태를 보관하지 않는다.

각 프레임의 결과는 현재 전달된 parameter만으로 계산된다.

따라서 애니메이션을 만들려면 외부에서 계속 변하는 값을 전달해야 한다.

세션에서는 시간을 셰이더 parameter로 사용한다.

## `TimelineView`

```swift
@State private var startDate = Date.now

TimelineView(.animation) { timeline in
    let elapsed = timeline.date.timeIntervalSince(startDate)

    CoverArtView()
        .layerEffect(
            ShaderLibrary.backgroundWarp(
                .float2(proxy.size),
                .image(Image("NoiseTexture")),
                .float(elapsed)
            ),
            maxSampleOffset: .zero
        )
}
```

`TimelineView(.animation)`은 애니메이션 프레임에 맞춰 closure를 다시 평가하고 현재 시간을 제공한다.

경과 시간을 셰이더에 전달하고 Noise sampling 위치에 더하면 패턴이 흐르기 시작한다.

```metal
float2 animatedUV = uv + timeOffset;
```

일반적인 SwiftUI animation이 이전 상태와 새로운 상태 사이를 보간하는 방식이라면, 이 셰이더 애니메이션은 매 프레임의 시간 값을 기반으로 완전히 새 결과를 계산한다.

---

# 12. 시간 동기화 자막

전경에는 `ScrollView`와 `LazyVStack`으로 구성된 자막이 있다.

```swift
ScrollView {
    LazyVStack(
        alignment: .leading,
        spacing: 12
    ) {
        ForEach(sampleTranscript) { line in
            Text(line.text)
                .font(.title)
                .fontWeight(.bold)
        }
    }
}
```

각 자막 데이터에는 다음 정보가 포함된다.

- 문장 텍스트
- 시작 시간
- 식별자
- 표시용 timestamp

## 현재 문장 결정

재생 시간을 사용해 현재 활성화된 자막 문장을 계산한다.

현재 문장은 선명하고 굵게 표시하고, 나머지 문장은 뒤로 물러나도록 표현한다.

```swift
Text(line.text)
    .transcriptLineStyle(
        isCurrent:
            line.id == playback.currentLineIndex
    )
```

현재 문장에 사용할 수 있는 스타일 예시는 다음과 같다.

- 높은 opacity
- bold weight
- foreground emphasis
- scale 변화
- blur 또는 saturation 차이

---

# 13. 현재 문장을 중앙으로 스크롤

`ScrollViewReader`를 사용해 현재 자막이 바뀔 때 해당 문장을 중앙으로 이동시킨다.

```swift
@State private var playback = PlaybackState()

ScrollViewReader { scrollProxy in
    ScrollView {
        LazyVStack(
            alignment: .leading,
            spacing: 12
        ) {
            ForEach(sampleTranscript) { line in
                Text(line.text)
                    .transcriptLineStyle(
                        isCurrent:
                            line.id == playback.currentLineIndex
                    )
            }
        }
    }
    .onChange(
        of: playback.currentLineIndex
    ) { _, index in
        scrollProxy.scrollTo(
            index,
            anchor: .center
        )
    }
}
```

전체 흐름은 다음과 같다.

```text
Playback Timestamp
    ↓
Current Transcript Line 계산
    ↓
활성 문장 스타일 변경
    ↓
현재 문장 ID 변화 감지
    ↓
ScrollView 중앙으로 이동
```

배경 셰이더와 자막 스크롤은 서로 다른 시각 요소지만 동일한 시간 데이터에 연결된다.

---

# 14. Timestamp Overlay

현재 문장에는 작은 timestamp를 표시한다.

각 행에 timestamp overlay를 미리 배치하고, 현재 문장인 경우에만 보이도록 한다.

```swift
Text(line.text)
    .overlay {
        Text(line.formattedTimestamp)
    }
```

Overlay는 원본 View의 layout 크기에 영향을 주지 않는다.

따라서 timestamp를 항상 View tree에 유지하면서 가시성만 변경할 수 있다.

하지만 기본 overlay는 두 View의 중앙을 정렬한다.

```swift
.overlay(alignment: .center)
```

Timestamp를 현재 문장의 왼쪽 아래 바깥에 배치하려면 정렬 방식을 바꿔야 한다.

---

# 15. SwiftUI 정렬 시스템

모든 SwiftUI View에는 가로와 세로 정렬 기준점이 있다.

Overlay container는 원본 View와 overlay View의 정렬 기준점을 같은 위치에 맞춘다.

이를 두 View를 관통하는 핀으로 생각할 수 있다.

```text
Container Alignment Point
           ●
           │
Subview Alignment Point
           ●
```

기본 `.center` 정렬에서는 두 View의 중앙이 겹친다.

```swift
.overlay(alignment: .bottomLeading)
```

`.bottomLeading`으로 변경하면 두 View의 왼쪽 아래 정렬점이 서로 맞춰진다.

하지만 목표는 timestamp의 **윗변**이 본문 텍스트의 **아랫변**에 닿는 것이다.

---

# 16. `alignmentGuide` 재정의

Subview가 `.bottom` 정렬을 요청받을 때 기본 아랫변이 아니라 윗변을 반환하도록 재정의한다.

```swift
Text(line.text)
    .overlay(alignment: .bottomLeading) {
        Text(line.formattedTimestamp)
            .alignmentGuide(.bottom) {
                $0[.top]
            }
    }
```

이 코드는 다음 의미를 가진다.

```text
이 Subview의 bottom alignment는
실제 bottom이 아니라 top 위치를 사용한다.
```

그 결과 timestamp의 윗변이 본문 View의 아랫변과 정렬된다.

## Offset과의 차이

수동 offset 방식은 두 View의 크기를 알고 있어야 하며, 글자 크기나 레이아웃이 바뀔 때 깨질 수 있다.

```swift
.offset(y: measuredHeight)
```

`alignmentGuide`는 실제 View 크기를 레이아웃 시스템에서 받아 의미 기반으로 위치를 결정한다.

장점은 다음과 같다.

- View 크기를 직접 측정할 필요 없음
- Dynamic Type에 더 잘 대응
- 부모와 자식의 관계를 명확히 표현
- 레이아웃 의도가 코드에 드러남
- 텍스트 길이와 크기가 달라져도 유지

---

# 17. Custom Alignment

SwiftUI는 기본 alignment뿐 아니라 사용자 정의 alignment도 만들 수 있다.

`alignmentGuide` closure에는 `ViewDimensions`가 전달된다.

이를 사용하면 View의 실제 크기와 alignment 위치를 기준으로 새로운 정렬 지점을 계산할 수 있다.

```swift
.alignmentGuide(customAlignment) { dimensions in
    dimensions[.leading] + dimensions.width * 0.25
}
```

Custom alignment는 다음과 같은 UI에 활용할 수 있다.

- 서로 다른 View 계층의 기준선 맞추기
- 차트의 데이터 지점과 레이블 연결
- 카드 외부에 badge 배치
- 가변 크기 View 사이의 연결선 정렬
- 특정 콘텐츠 기준점에 overlay 부착

---

# 18. 완성된 파이프라인

최종 앱은 두 개의 주요 파이프라인을 병렬로 구성한 뒤 하나의 화면으로 합친다.

## 배경 파이프라인

```text
Cover Art
    ↓
Blur
    ↓
Layer Effect
    ↓
Noise Texture Sampling
    ↓
Domain Warping
    ↓
TimelineView Time Input
    ↓
Animated Full-screen Background
```

## 자막 파이프라인

```text
Transcript Data
    ↓
Playback Timestamp
    ↓
Current Line Selection
    ↓
Visual Emphasis
    ↓
ScrollViewReader Synchronization
    ↓
Timestamp Overlay
    ↓
Alignment Guide
```

두 파이프라인을 Z축으로 합치면 전체 경험이 완성된다.

```text
Animated Background
        +
Time-synced Transcript
        ↓
Final Podcast Playback View
```

---

# 19. Creative Pipeline 확장

세션의 구현은 팟캐스트 앱을 위한 하나의 조합일 뿐이다.

입력과 처리 단계를 바꾸면 같은 API로 다른 경험을 만들 수 있다.

| 기존 파이프라인 | 대체 가능 요소 |
|---|---|
| 오디오 재생 시간 | 자이로스코프, 가속도, 사용자 드래그, 네트워크 상태 |
| 커버 아트 | 카메라 프레임, 지도, 사진, 차트 |
| Twist shader | Ripple, dissolve, chromatic shift, heat haze |
| ScrollView | Canvas, Grid, Timeline, 3D scene |
| Timestamp overlay | Badge, tooltip, annotation, action button |

핵심은 새 API를 계속 찾는 것이 아니라, 기존 API에 어떤 데이터를 넣고 어떤 순서로 연결할지를 설계하는 것이다.

---

# 20. 성능과 품질 고려사항

셰이더와 프레임 기반 애니메이션은 GPU와 렌더링 비용에 영향을 준다.

구현 시 다음 항목을 확인해야 한다.

## `maxSampleOffset`

`layerEffect`에서 셰이더가 원래 위치보다 멀리 떨어진 픽셀을 샘플링한다면 실제 최대 이동 범위를 제공해야 한다.

```swift
.layerEffect(
    shader,
    maxSampleOffset: CGSize(
        width: 200,
        height: 200
    )
)
```

잘못된 값을 사용하면 다음 문제가 생길 수 있다.

- View 가장자리 잘림
- 불필요하게 넓은 렌더링 영역
- 메모리와 GPU 비용 증가

## Timeline 빈도

모든 시각 효과가 매 프레임 갱신될 필요는 없다.

- 연속적인 셰이더 효과: `.animation`
- 초 단위 갱신: 주기적 timeline
- 비활성 상태: 업데이트 중지

재생이 멈췄거나 View가 화면에 없을 때 불필요한 갱신을 줄이는 것이 좋다.

## Noise Texture

- 필요한 해상도 이상으로 크게 만들지 않기
- 반복 시 경계가 드러나지 않도록 구성
- Linear filtering과 repeat mode 결과 확인
- 색 공간과 pixel format 점검

## 접근성

- Reduce Motion 활성화 시 효과 완화 또는 정지
- 자막의 충분한 대비 유지
- Dynamic Type에서 자막 레이아웃 검증
- 셰이더 배경이 텍스트 가독성을 해치지 않도록 조정

---

# 21. 개발자 체크 포인트

- [ ] 완성된 디자인을 배경, 전경, 시간, 레이아웃 단계로 분해
- [ ] 각 단계의 입력과 출력 데이터 타입 정의
- [ ] `colorEffect`, `distortionEffect`, `layerEffect` 중 목적에 맞는 API 선택
- [ ] SwiftUI와 Metal 함수 parameter의 순서와 타입 일치 확인
- [ ] 셰이더의 샘플 범위에 맞는 `maxSampleOffset` 지정
- [ ] Noise texture의 크기, 반복성, filtering 확인
- [ ] 절대 좌표보다 UV 좌표를 사용할 수 있는지 검토
- [ ] Domain warping parameter를 Preview에서 조정
- [ ] 셰이더 애니메이션에 절대 날짜 대신 안정적인 경과 시간 사용
- [ ] 재생 정지와 화면 비활성 상태에서 Timeline 갱신 최소화
- [ ] 자막 데이터와 playback timestamp의 경계 조건 검증
- [ ] `ScrollViewReader`의 대상 ID가 안정적으로 유지되는지 확인
- [ ] 자동 스크롤이 사용자의 수동 스크롤과 충돌하지 않는지 검토
- [ ] Overlay가 원본 View의 layout에 영향을 주지 않는 특성 활용
- [ ] 수동 offset보다 semantic alignment 사용 검토
- [ ] Dynamic Type에서 alignment guide 결과 확인
- [ ] Reduce Motion과 Increase Contrast 설정 대응
- [ ] 실제 기기에서 GPU, 프레임 속도, 에너지 사용량 측정
- [ ] 여러 Apple 플랫폼과 화면 크기에서 동일한 파이프라인 검증

---

# 함께 보면 좋은 세션과 자료

- Create custom visual effects with SwiftUI — WWDC24
- SwiftUI Shader documentation
- SwiftUI Alignment documentation
- Composing advanced graphics effects with SwiftUI sample code
- TimelineView documentation
- Metal Shading Language documentation
