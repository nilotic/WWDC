# WWDC26 Learn CSS Grid Lanes 요약

- Session: 314
- Title: Learn CSS Grid Lanes
- Source: https://developer.apple.com/videos/play/wwdc2026/314/
- Topic: Safari, WebKit, CSS, Grid Lanes, Masonry Layout, Grid, Flexbox, Subgrid, Accessibility, Web Inspector
- Chapters: Introduction, CSS Flexbox and Grid, CSS Grid Lanes, Build a Grid Lanes container, Implement brick variation, Experiment with different layouts, Control individual items, Flow Tolerance, Web Inspector, Next steps

---

## 한 줄 요약

CSS Grid Lanes는 기존에 JavaScript masonry library나 복잡한 우회 구현이 필요했던 **waterfall/masonry·brick-wall 레이아웃을 `display: grid-lanes`와 기존 CSS Grid 문법으로 구현**하는 새로운 layout mode이며, 한 축은 Grid처럼 track으로 구조화하고 다른 축은 콘텐츠 크기에 따라 자유롭게 흐르게 하며, `flow-tolerance`로 시각적 packing과 DOM/tab order의 접근성 균형까지 조정할 수 있다.

---

## 핵심 요약

이번 세션에서 소개하는 **CSS Grid Lanes**는 Grid와 Flexbox 사이에 위치하는 새로운 layout mode다.

- Masonry / waterfall style layout을 CSS만으로 구현
- Horizontal brick-wall layout 가능
- 한 축만 track으로 구조화하고 다른 축은 content-driven
- 이미지의 원래 aspect ratio 유지
- Text, card, mixed content 모두 사용 가능
- `grid-template-columns`, `grid-template-rows`, `gap`, `fr`, `repeat()`, `minmax()`, `auto-fill` 등 기존 Grid 문법 활용
- `grid-column`으로 individual item의 span과 placement 제어
- `subgrid`와 결합 가능
- `flow-tolerance`로 shortest-lane placement를 완화해 visual order와 source order 차이를 줄일 수 있음
- Safari Web Inspector에 Grid Lanes overlay 지원
- Safari 26.4에서 사용 가능
- 다른 browser에서는 당시 flag 뒤에서 제공

가장 단순한 형태:

```css
.container {
  display: grid-lanes;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}
```

---

# 🌊 Masonry Layout을 CSS로

Grid Lanes는 흔히 **masonry layout**이라고 부르는 패턴을 native CSS로 만든다.

Vertical 형태는 waterfall과 비슷하다. 각 item은 자신의 자연스러운 높이를 유지하면서 현재 가장 짧은 column에 배치된다.

방향을 90도 돌리면 brick-wall 형태가 된다.

---

# 🧱 왜 기존 CSS로는 어려웠나

기존에는 masonry layout을 만들기 위해 흔히 다음을 사용했다.

- JavaScript masonry library
- Float 기반 workaround
- Flexbox 조합
- Column layout hack

하지만 content의 aspect ratio와 ordering, responsive behavior가 복잡해지면 쉽게 한계가 드러난다.

Grid Lanes는 이 패턴 자체를 browser layout engine이 이해하도록 만든다.

---

# 🔄 Layout Mode가 답하는 두 질문

세션은 layout mode를 이해할 때 두 질문을 보라고 설명한다.

```text
1. Item은 어디에 배치되는가?
2. Item은 얼마나 많은 공간을 받는가?
```

Flexbox, Grid, Grid Lanes는 이 두 질문에 서로 다른 방식으로 답한다.

---

# ↔️ Flexbox

Flexbox는 기본적으로 한 축을 중심으로 배치한다.

Item은 한 방향으로 순서대로 흐르고 wrap되면 다음 line으로 넘어간다.

---

# 🧭 Grid

CSS Grid는 두 축을 모두 구조화한다.

```text
Columns × Rows → Cell
```

이 구조는 명확하지만 서로 다른 aspect ratio의 content에서는 빈 공간이 생길 수 있다.

이미지를 cell에 억지로 맞추면 stretch, crop, overflow 같은 trade-off가 생긴다.

---

# 🛣️ Grid Lanes는 Grid와 Flex 사이

```text
Grid
→ 2개 축을 모두 구조화

Flex
→ 1개 lane에 item을 순서대로 흐르게 함

Grid Lanes
→ 1개 축만 track으로 구조화
→ 다른 축은 자유롭게 content size에 따라 흐름
→ 여러 lane에 item 배분
```

따라서 item은 자연스러운 비율을 유지하면서 촘촘히 packing된다.

---

# 📍 Item Placement Rule

기본 rule:

> 다음 item은 현재 가장 짧은 lane에 배치된다.

Vertical waterfall이면:

```text
가장 짧은 Column → 다음 Item
```

이 때문에 earlier item은 대체로 위쪽에 있고 later item이 빈 공간을 채우며 아래로 내려간다.

---

# 📝 이미지뿐 아니라 모든 Content에 사용 가능

Grid Lanes는 image 전용 기능이 아니다.

가능한 content:

- Text
- Cards
- Images
- Mixed content
- Headline
- Nested layouts

Text block은 column width에 맞게 wrap되고 browser가 자연스러운 높이를 계산한다.

---

# 🛠️ 기본 Container

```css
.container {
  display: grid-lanes;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}
```

`fr`은 available space를 fraction으로 나누는 단위다.

`repeat(3, 1fr)`는 동일한 세 개의 column을 만든다.

---

# 🧱 Brick Variation

Waterfall이 아니라 horizontal brick-wall pattern을 원한다면 column 대신 row를 정의한다.

```css
.container {
  display: grid-lanes;
  grid-template-rows: repeat(3, 1fr);
  gap: 10px;
}
```

중요한 점은 **한 방향만 선택한다는 것**이다.

Grid처럼 column과 row를 동시에 rigid하게 정의하는 방식이 아니다.

---

# 🎛️ Unequal Track Sizes

Column width가 모두 같을 필요는 없다.

```css
.container {
  display: grid-lanes;
  grid-template-columns: 1fr 2fr 1fr;
  gap: 10px;
}
```

중앙 lane이 양쪽의 두 배 너비를 갖는다.

---

# 📱 Responsive Layout with `auto-fill`

```css
.container {
  display: grid-lanes;
  grid-template-columns:
    repeat(
      auto-fill,
      minmax(200px, 1fr)
    );
  gap: 10px;
}
```

각 column은 최소 200px을 유지하고 container에 들어가는 만큼 browser가 column 수를 자동으로 정한다.

---

# 🔁 반복되는 Narrow / Wide Pattern

Track pattern 자체를 반복할 수도 있다.

```css
.container {
  display: grid-lanes;
  grid-template-columns:
    repeat(
      auto-fill,
      minmax(8rem, 1fr)
      minmax(14rem, 2fr)
    );
  gap: 10px;
}
```

동일한 column만 반복하는 대신 좁고 넓은 column pattern을 만들 수 있다.

---

# 🟧 Individual Item 제어

Grid Lanes는 기존 CSS Grid item property를 재사용한다.

두 column span:

```css
.item {
  grid-column: span 2;
}
```

특정 column에서 시작:

```css
.item {
  grid-column: 2 / span 2;
}
```

Vertical Grid Lanes에서는 column placement는 직접 지정할 수 있지만 row 위치는 Grid Lanes가 결정한다.

---

# 🧩 Nested Content와 Subgrid

Recipe card가 두 column을 span하고 내부에 image와 text가 있다고 하자.

기본적으로 child는 parent Grid Lanes의 item이 아니다.

하지만 card에도 Grid Lanes를 적용하고 `subgrid`를 쓰면 child가 parent track에 맞춰 배치된다.

```css
.item {
  display: grid-lanes;
  grid-template-columns: subgrid;
  grid-column: span 2;
}
```

Grid Lanes 안에 Grid를 넣거나 Grid 안에 Grid Lanes를 넣는 것도 가능하다.

---

# ♿ 가장 중요한 접근성 이슈: Visual Order

Grid Lanes는 기본적으로 가장 짧은 lane을 선택한다.

그래서 DOM order와 visual order가 달라질 수 있다.

예:

```text
DOM:
1 → 2 → 3 → 4

Visual:
1  2
4  3
```

Keyboard tab order나 assistive technology는 source order를 따른다.

이 차이는 사용자에게 혼란을 줄 수 있다.

---

# 🌊 `flow-tolerance`

이 문제를 완화하기 위해 Grid Lanes에는 `flow-tolerance`가 있다.

기본 shortest-column rule을 얼마나 엄격하게 적용할지 조정한다.

브라우저는 새 item을 배치할 때 대략 다음을 판단한다.

```text
Taller Lane Height
<
Shorter Lane Height + Flow Tolerance
?
```

차이가 tolerance 안이면 absolute shortest lane만 고집하지 않고 earlier lane을 선택할 수 있다.

---

# 📏 기본 Flow Tolerance

기본값:

```css
flow-tolerance: 1em;
```

세션에서는 content에 맞춰 값을 실험하라고 권장한다.

예:

```css
.container {
  display: grid-lanes;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  flow-tolerance: 2.1em;
}
```

---

# 🎚️ Flow Tolerance의 Trade-off

Tolerance가 작으면:

- Packing efficiency가 높음
- Shortest-lane rule이 강함
- Visual/source order divergence 가능

Tolerance가 크면:

- Source order에 더 가까운 배치 가능
- Lane balance가 덜 완벽할 수 있음

즉 디자인과 접근성 사이를 조정하는 control이다.

---

# ♿ 접근성 관점의 핵심

`flow-tolerance`는 단순한 visual tweak가 아니다.

목적 중 하나는 다음 차이를 줄이는 것이다.

```text
DOM / Keyboard Order
vs
Visual Item Order
```

Masonry layout을 만들 때 visual packing만 보고 끝내지 말고 keyboard navigation과 reading order를 실제로 테스트해야 한다.

---

# 🔎 Web Inspector 지원

Safari Web Inspector는 Grid Lanes를 직접 디버깅할 수 있다.

Overlay를 켜면 다음이 표시된다.

- Column lines
- Row lines
- Gaps
- Item order number

특히 order number를 보면 DOM order와 visual placement 차이를 바로 확인할 수 있다.

---

# 🧪 Debugging Workflow

```text
Grid Lanes 작성
      ↓
실제 Content 사용
      ↓
Web Inspector Overlay
      ↓
Order Number 확인
      ↓
DOM vs Visual Order 비교
      ↓
flow-tolerance 조정
      ↓
Responsive Size 재검증
```

---

# 📱 Responsive Gallery 예시

```css
.gallery {
  display: grid-lanes;
  grid-template-columns:
    repeat(
      auto-fill,
      minmax(200px, 1fr)
    );
  gap: 12px;
}

.gallery img {
  width: 100%;
  height: auto;
}
```

Grid Lanes가 실제 높이를 기준으로 다음 item을 배치한다.

---

# 📰 Editorial Layout 예시

```css
.feed {
  display: grid-lanes;
  grid-template-columns:
    repeat(3, 1fr);
  gap: 16px;
}

.featured {
  grid-column: span 2;
}
```

Content type이 섞여 있어도 된다.

- Image
- Text
- Recipe Card
- Headline
- Video Thumbnail
- Quote

---

# 🧩 Flexbox / Grid / Grid Lanes 비교

| 항목 | Flexbox | Grid | Grid Lanes |
|---|---|---|---|
| 주 구조 | 1축 | 2축 | 1축 구조 + 1축 자유 |
| Lane 수 | 기본 1개 | Row × Column | 여러 lane |
| Content flow | 순차 | Cell 기반 | Shortest lane 기반 |
| Mixed aspect ratio | Wrap 가능 | 빈 공간 발생 가능 | 자연 비율 유지하며 packing |
| Masonry | 직접 지원 아님 | 전통 Grid만으로 어려움 | 핵심 use case |
| Explicit item placement | 제한적 | 강력 | Structured axis에서 가능 |
| Subgrid | 해당 없음 | 지원 | 지원 |
| 접근성 order | 비교적 직관적 | 보통 명확 | Visual/source order 차이 주의 |
| 주요 보정 도구 | order 등 | grid placement | `flow-tolerance` |

---

# ✅ Grid Lanes가 적합한 경우

- Photo gallery
- Pinterest-style feed
- Recipe cards
- News / editorial feed
- Portfolio
- Variable-height product cards
- Mixed text/image content
- Dynamic CMS content
- Aspect ratio가 일정하지 않은 media

---

# ⚠️ 일반 Grid가 더 나은 경우

- Row alignment가 중요
- Table-like structure
- Exact row/column placement
- 2차원 coordinate가 semantic하게 중요

Grid Lanes는 모든 Grid layout의 대체재가 아니다.

---

# ⚠️ Flexbox가 더 나은 경우

- Navigation bar
- Toolbar
- Chip row
- 단순 one-dimensional stack
- Item ordering이 가장 중요

---

# 🧭 Browser Support 전략

세션 시점 기준:

```text
Safari 26.4 → Available
Other Browsers → Behind a flag
```

Production에서는 browser support를 확인하고 fallback을 고려해야 한다.

---

# 🛟 Progressive Enhancement

```css
.gallery {
  display: grid;
  grid-template-columns:
    repeat(
      auto-fill,
      minmax(200px, 1fr)
    );
  gap: 12px;
}

@supports (display: grid-lanes) {
  .gallery {
    display: grid-lanes;
  }
}
```

지원 browser에서는 Grid Lanes를 쓰고 그렇지 않은 환경에서는 일반 Grid로 fallback할 수 있다.

---

# 📋 체크리스트

## Layout 선택

- [ ] Masonry / waterfall가 실제 요구인지 확인
- [ ] Brick-wall horizontal layout 필요 여부 확인
- [ ] Grid의 strict row alignment가 더 적절한지 비교
- [ ] Flexbox의 단순 flow로 충분한지 확인
- [ ] Mixed aspect ratio content인지 확인

## Container

- [ ] `display: grid-lanes` 적용
- [ ] `grid-template-columns` 또는 `grid-template-rows` 중 하나만 사용
- [ ] Track 수 결정
- [ ] `fr` unit 검토
- [ ] `gap` 설정
- [ ] Responsive behavior 확인

## Responsive Tracks

- [ ] `repeat()` 활용
- [ ] `auto-fill` 필요 여부 검토
- [ ] `minmax()`로 minimum width 설정
- [ ] Small viewport에서 column count 확인
- [ ] Large viewport에서 지나치게 넓은 lane이 생기지 않는지 확인
- [ ] Unequal track size 필요 여부 검토

## Item Placement

- [ ] Featured item의 span 정의
- [ ] `grid-column: span N` 사용 검토
- [ ] Explicit column start 필요 여부 확인
- [ ] Row position을 직접 지정하려 하지 않기
- [ ] Span item 주변 packing 확인

## Nested Layout

- [ ] Nested card가 parent lane과 정렬돼야 하는지 확인
- [ ] `subgrid` 활용 검토
- [ ] Grid inside Grid Lanes 필요 여부 검토
- [ ] Grid Lanes inside Grid 가능성 검토
- [ ] Nested content의 semantic order 확인

## Accessibility

- [ ] DOM order가 logical reading order인지 확인
- [ ] Keyboard tab order 테스트
- [ ] Screen reader reading order 테스트
- [ ] Visual placement가 source order와 크게 달라지는지 확인
- [ ] `flow-tolerance` 조정
- [ ] Responsive size마다 ordering 재확인

## `flow-tolerance`

- [ ] 기본 `1em`에서 시작
- [ ] Smaller value 테스트
- [ ] Larger value 테스트
- [ ] Packing density 비교
- [ ] DOM/visual order divergence 비교
- [ ] 실제 keyboard navigation으로 검증

## Web Inspector

- [ ] Grid Lanes overlay 활성화
- [ ] Column / row lines 확인
- [ ] Gap visualization 확인
- [ ] Order number 확인
- [ ] Unexpected placement 원인 추적
- [ ] `flow-tolerance` 변경 후 overlay 비교

## Browser Compatibility

- [ ] Safari 26.4 이상 확인
- [ ] Target browser support 조사
- [ ] `@supports` 사용
- [ ] Fallback Grid 정의
- [ ] Unsupported browser에서도 content 접근 가능하게 유지

---

# ⚠️ 구현 시 주의할 점

## Grid Lanes는 두 축 Grid가 아니다

`grid-template-columns`와 `grid-template-rows`를 동시에 정의해 일반 Grid처럼 쓰는 개념이 아니다.

한 축만 lane 구조를 가진다.

## Visual Order를 Source Order로 착각하지 않는다

Shortest-lane algorithm 때문에 화면에서 보는 순서가 DOM 순서와 달라질 수 있다.

이는 aesthetic issue가 아니라 접근성 문제다.

## `flow-tolerance`는 magic number가 아니다

Content마다 적절한 값이 다르다.

Image height 분포, text length, viewport width에 따라 실제 데이터로 테스트해야 한다.

## Span이 많으면 Masonry 효과가 달라진다

여러 item을 강제로 span하거나 explicit placement하면 natural packing 결과가 크게 달라질 수 있다.

## Responsive Layout에서는 항상 재검증한다

Desktop에서 source order와 visual order가 괜찮아도 mobile에서 column 수가 바뀌면 placement 결과가 달라질 수 있다.

---

# 🔁 전체 구현 흐름

```text
Content Requirements
      ↓
Grid Lanes 적합 여부 결정
      ↓
display: grid-lanes
      ↓
Structured Axis 선택
Columns or Rows
      ↓
Track Sizing
fr / auto-fill / minmax
      ↓
Individual Span / Placement
      ↓
Subgrid 필요 여부
      ↓
Web Inspector 확인
      ↓
flow-tolerance 조정
      ↓
Keyboard / Screen Reader 검증
      ↓
Fallback 적용
```

---

# 🎯 주요 코드 모음

## 3-column Waterfall

```css
.container {
  display: grid-lanes;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}
```

## Brick Wall

```css
.container {
  display: grid-lanes;
  grid-template-rows: repeat(3, 1fr);
  gap: 10px;
}
```

## Unequal Columns

```css
.container {
  display: grid-lanes;
  grid-template-columns: 1fr 2fr 1fr;
  gap: 10px;
}
```

## Responsive Auto-fill

```css
.container {
  display: grid-lanes;
  grid-template-columns:
    repeat(
      auto-fill,
      minmax(200px, 1fr)
    );
  gap: 10px;
}
```

## Item Span

```css
.item {
  grid-column: span 2;
}
```

## Explicit Column Placement

```css
.item {
  grid-column: 2 / span 2;
}
```

## Subgrid

```css
.item {
  display: grid-lanes;
  grid-template-columns: subgrid;
  grid-column: span 2;
}
```

## Flow Tolerance

```css
.container {
  display: grid-lanes;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  flow-tolerance: 2.1em;
}
```

---

# 🧠 이번 세션의 설계 메시지

Grid Lanes의 가장 큰 장점은 단순히 masonry를 CSS로 구현한다는 것만이 아니다.

새 layout mode임에도 기존 CSS Grid의 mental model과 property를 최대한 재사용한다.

```text
grid-template-columns
grid-template-rows
gap
fr
repeat()
minmax()
auto-fill
grid-column
subgrid
```

이미 Grid를 알고 있다면 대부분의 syntax를 그대로 사용할 수 있다.

---

# ♿ Flow Tolerance가 중요한 이유

Masonry layout에서 가장 쉽게 놓치는 문제는 visual beauty와 document semantics가 다를 수 있다는 것이다.

```text
Algorithm:
"가장 짧은 Column에 넣자"

Accessibility:
"사용자는 DOM 순서로 이동한다"
```

두 원칙이 충돌할 수 있다.

`flow-tolerance`는 browser에 더 많은 flexibility를 제공해 source order와 visual order가 가까워질 가능성을 높인다.

따라서 Grid Lanes를 사용할 때 접근성 검증은 선택 사항이 아니다.

---

# 🔎 Web Inspector의 역할

Masonry placement는 item 크기에 따라 결과가 달라질 수 있기 때문에 code만 보고 layout을 예상하기 어렵다.

Grid Lanes overlay는 다음 정보를 바로 보여준다.

```text
Track geometry
+
Gap
+
Placement order
```

특히 visual order 문제가 생겼을 때 가장 먼저 사용할 도구다.

---

# 🚀 Safari에서의 상태

세션에서는 Grid Lanes가 **Safari 26.4에서 이미 사용 가능**하다고 설명한다.

WebKit 팀은 별도의 **CSS Grid Lanes Field Guide**도 제공한다.

Field Guide에서는 세션에서 다룬 property를 interactive demo로 직접 조절할 수 있다.

---

# 핵심 메시지

CSS Grid Lanes는 JavaScript에 의존하던 masonry layout을 browser의 native layout engine으로 옮기는 기능이다.

Flexbox처럼 한 방향의 흐름을 가지지만 하나의 lane이 아니라 여러 lane에 content를 분배하고, Grid처럼 track sizing과 item placement property를 사용할 수 있지만 두 축을 모두 rigid하게 구조화하지 않는다.

그래서 서로 다른 aspect ratio의 이미지와 text block을 억지로 crop하거나 stretch하지 않고 자연스러운 크기를 유지하면서 촘촘한 layout을 만들 수 있다.

가장 기본적인 구현은 단 세 줄이다.

```css
.container {
  display: grid-lanes;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}
```

하지만 production에서는 단순 packing만 보면 안 된다.

Shortest-lane placement 때문에 visual order가 DOM 순서와 달라질 수 있고, 이것은 keyboard 사용자와 assistive technology 사용자에게 혼란을 줄 수 있다.

그 문제를 조정하기 위해 `flow-tolerance`가 제공된다.

결국 Grid Lanes의 핵심은 다음 네 가지다.

```text
Native Masonry Layout
        +
Existing Grid Syntax Reuse
        +
Flexible Content-driven Sizing
        +
Accessibility-aware Flow Control
```

이미 Grid를 사용하는 개발자라면 적은 학습 비용으로 image-heavy gallery, editorial feed, recipe cards, portfolio, dynamic CMS layout을 훨씬 간단하게 구현할 수 있다.

---

# 함께 보면 좋은 세션과 자료

- What's new in WebKit for Safari 27 — WWDC26
- Rediscover the HTML select element — WWDC26
- CSS Grid Lanes Field Guide — WebKit
- WebKit bug tracker
