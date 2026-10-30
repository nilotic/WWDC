# WWDC26 — Rediscover the HTML select element

- **Session:** 315
- **Title:** Rediscover the HTML select element
- **Speaker:** Tim, Safari Engineering
- **Source:** https://developer.apple.com/videos/play/wwdc2026/315/
- **Basis:** Apple Developer 공식 전체 transcript 및 Code 섹션
- **Platforms / Browsers:** Safari 27, Chrome 135 이상에서 Customizable Select 지원

---

## 🎯 한 줄 요약

기존 `<select>`의 **semantic HTML, keyboard navigation, screen reader 접근성, 플랫폼 기본 동작**은 그대로 유지하면서, 새로운 **Customizable Select** 기능을 통해 버튼·드롭다운·체크마크·선택 옵션·rich content까지 HTML/CSS만으로 자유롭게 디자인할 수 있게 되었다.

---

## 🧭 세션 구성

| Time | Chapter |
|---|---|
| 0:00 | Introduction |
| 2:32 | Style the select button |
| 3:47 | Customize the drop-down |
| 5:00 | Go beyond text options |
| 6:50 | The selectedcontent element |
| 7:46 | Fallback for unsupported browsers |
| 8:49 | Next steps |

---

## 🧩 왜 Customizable Select인가

기존 웹 개발에서 `<select>`를 디자인 시스템에 맞게 바꾸는 일은 제한적이었다. 기본 플랫폼 UI를 벗어나려면 JavaScript 기반 커스텀 드롭다운이나 수많은 `<div>`를 조합하는 구현을 사용하곤 했고, 그러면 다음을 직접 책임져야 했다.

- keyboard navigation
- focus handling
- screen reader semantics
- selected state
- menu open/close state
- pointer / touch interaction
- browser별 예외 처리

Apple은 이 문제를 해결하는 방향으로 **기존 semantic `<select>` 자체를 확장**한다. 즉, 새로운 UI component를 만드는 것이 아니라 이미 접근성과 플랫폼 동작을 갖춘 HTML 요소에 스타일링 자유도를 추가한다.

세션의 핵심 철학은 다음과 같다.

> **native semantics를 버리지 않고 customization만 확장한다.**

기존 `<select>`는 여전히 label과 연결되고, keyboard로 option을 이동할 수 있으며, screen reader와 함께 동작한다.

---

# 🎨 Select 버튼 스타일링

## `appearance: base-select`

Customizable Select로 진입하는 핵심 opt-in은 다음과 같다.

```css
select {
    appearance: base-select;
}
```

`base-select`는 완전히 unstyled 요소가 아니라, **select의 기능과 semantics는 유지하면서 웹 개발자가 바꿀 수 있는 기본 스타일 집합을 제공하는 appearance 값**이다.

이 상태에서는 일반 CSS처럼 다음을 조정할 수 있다.

- font
- background
- border
- padding
- foreground color
- open state

세션에서는 photographer portfolio의 “Sort by” 메뉴를 예제로 사용한다. body의 font가 select 버튼에 상속되고, background·border·padding을 적용해 사이트 디자인에 맞춘다.

### 핵심 포인트

기존 native select를 완전히 재구현하는 것이 아니라 **플랫폼 control을 디자인 시스템에 가까운 형태로 조정**하는 접근이다.

---

## `::picker-icon`

드롭다운 버튼의 기본 화살표도 새로운 pseudo-element로 스타일링할 수 있다.

```css
select::picker-icon {
    /* custom icon */
}
```

세션에서는 `content`를 SVG로 바꾸고 너비를 조절한다.

이 pseudo-element 덕분에 별도의 wrapper element나 JavaScript 없이 select의 disclosure icon을 디자인할 수 있다.

---

## `:open`

드롭다운이 열린 상태에는 `:open` pseudo-class를 사용할 수 있다.

```css
select:open {
    background-color: var(--green-100);
    color: white;
}
```

열린 상태에서:

- button background 변경
- foreground 변경
- picker icon 변경

같은 state-aware styling을 적용할 수 있다.

즉, 예전처럼 JavaScript로 `isOpen` class를 직접 붙이지 않아도 된다.

---

# 🪟 드롭다운 메뉴 자체 꾸미기

Select 버튼뿐 아니라 **펼쳐진 picker UI 자체**도 스타일링할 수 있다.

## `::picker(select)`

드롭다운 메뉴 영역은 다음 pseudo-element로 대상으로 지정한다.

```css
::picker(select) {
    appearance: base-select;
}
```

세션에서는 이 영역에 다음 스타일을 적용한다.

- padding
- margin
- border
- border radius
- box shadow

중요한 점은 picker에도 `appearance: base-select`를 적용해 **native menu presentation에서 customizable picker presentation으로 opt-in**한다는 것이다.

---

## 선택된 옵션 강조: `:checked`

현재 선택된 `<option>`은 `:checked`로 스타일링한다.

예를 들어:

- selected option → semibold/bold
- 나머지 option → subdued text color
- selected option → 배경색 및 foreground 변경

을 적용할 수 있다.

이렇게 selected state를 별도 JavaScript state와 동기화할 필요 없이 브라우저가 관리하는 selection state를 CSS에서 직접 사용한다.

---

## `::checkmark`

선택된 option에 표시되는 기본 checkmark 역시 pseudo-element로 변경할 수 있다.

```css
option::checkmark {
    /* custom checkmark */
}
```

필요하면:

- 다른 glyph 사용
- 크기 변경
- 완전히 숨김

도 가능하다.

세션의 두 번째 예제에서는 checkmark를 제거하고 selected option의 background 자체를 강조한다.

---

# 🖼️ Text-only option에서 rich content로

Customizable Select의 가장 큰 변화 중 하나는 `<option>` 내부가 더 이상 단순 텍스트만을 전제로 하지 않는다는 점이다.

세션은 option 안에 다음 요소를 넣는 예제를 보여준다.

- SVG
- image
- label/span
- emoji
- video 등 rich content

대표 구조:

```html
<option value="flower">
    <img src="flowers.svg" alt="">
    <span class="text">Flowers</span>
</option>
```

### 접근성 포인트: decorative image의 `alt=""`

세션에서 SVG의 alt text는 빈 문자열로 둔다.

이유는 option 안에 이미 “Flowers”라는 텍스트 label이 존재하므로, screen reader가 이미지 이름과 label을 **중복으로 읽지 않게 하기 위해서**다.

즉, rich content를 추가해도 semantic accessibility를 함께 고려해야 한다.

---

# 🧱 Drop-down에 Grid layout 사용

Customizable Select는 option의 내용만 풍부해지는 것이 아니라 **picker 레이아웃 자체도 CSS layout system을 사용할 수 있다.**

세션에서는 길어진 카테고리 목록을 단순 세로 리스트 대신 grid로 재구성한다.

```css
::picker(select) {
    display: grid;
    gap: 1rem;
}
```

실제 예제에서는 `grid-template`을 이용해 여러 행과 열을 구성한다.

이것이 중요한 이유는 select가 더 이상 “한 줄 버튼 + 세로 텍스트 목록”에 제한되지 않는다는 점이다.

예를 들면 다음과 같은 UI를 native select semantics 위에 구성할 수 있다.

- icon grid picker
- color palette
- thumbnail category picker
- image-based sort/filter chooser

세션 후반에는 **radial color picker도 customizable select로 구현 가능**함을 보여준다.

---

# 🔘 Select 내부의 커스텀 button

기본 select button은 선택된 option의 **텍스트**를 표시한다. 하지만 option에 SVG나 이미지 같은 rich content가 들어 있으면 그것까지 자동으로 버튼에 표시되지는 않는다.

Customizable Select에서는 `<select>`의 **첫 번째 자식으로 `<button>`을 배치**할 수 있다.

```html
<select>
    <button>
        ...
    </button>
    <option>...</option>
</select>
```

과거 HTML에서는 이런 구조가 허용되지 않았지만, customizable select에서는 select trigger 자체를 커스터마이즈하는 용도로 사용된다.

이 구조를 통해 button 안에 자체 label이나 선택된 option의 rich content를 배치할 수 있다.

---

# 🪄 `<selectedcontent>`

새로운 `<selectedcontent>` 요소는 **현재 선택된 option의 내용을 select button 안에 표현**하기 위한 요소다.

```html
<select>
    <button>
        <selectedcontent></selectedcontent>
    </button>
    <option>...</option>
</select>
```

이를 사용하면 선택된 option에 들어 있는:

- SVG
- image
- text
- 기타 rich content

를 button UI에서도 표현할 수 있다.

세션의 사진 카테고리 picker에서는 선택된 항목의 아이콘과 label이 button에 그대로 나타나는 효과를 구현한다.

### 왜 중요한가

이전에는 비슷한 UI를 구현하기 위해:

1. native select의 값을 감시하고
2. 별도 button DOM을 만들고
3. 선택된 option 내용을 복제하고
4. 두 state를 JavaScript로 동기화

하는 패턴이 필요했다.

`<selectedcontent>`는 이 역할을 native select model 안에서 처리한다.

---

# ♿ Accessibility를 유지하는 방식

이 세션에서 가장 반복적으로 강조되는 장점은 **customizable select가 기존 `<select>`를 계속 사용한다는 것**이다.

따라서 기본적으로 다음 이점을 유지한다.

- semantic form control
- `<label>`과의 연결
- keyboard navigation
- screen reader support
- selection semantics
- platform control behavior

커스텀 div 기반 listbox를 재구현할 때 필요했던 많은 접근성 로직이 브라우저의 native implementation에 남는다.

하지만 rich content를 추가할 때는 여전히 개발자의 책임이 있다.

예:

- decorative image에 빈 alt 사용
- 의미 있는 이미지에는 적절한 alternative text 제공
- 색상만으로 selection을 구분하지 않기
- assistive technology로 실제 테스트하기

---

# 🛡️ Progressive enhancement와 fallback

Customizable Select의 중요한 설계 목표는 **지원하지 않는 브라우저에서도 control이 망가지지 않는 것**이다.

지원 브라우저:

- customizable presentation 표시

미지원 브라우저:

- native select popup으로 fallback

즉, 기능의 기반이 여전히 semantic `<select>`이기 때문에 기존 브라우저에서도 **사용 가능한 form control**이 남는다.

세션은 이를 progressive enhancement의 장점으로 설명한다.

### 실무적으로 확인할 것

- unsupported browser에서 native fallback이 정상인지
- custom rich content가 fallback에서 의미를 잃지 않는지
- keyboard navigation
- VoiceOver / screen reader
- focus ring
- selected state
- high contrast / zoom 등 접근성 환경

---

# 🌐 지원 환경

세션에서 명시한 지원 시점:

- **Safari 27**
- **Chrome 135**

Safari에서는 정식 Safari 27 이전에도 **Safari Technology Preview 또는 Safari Beta**를 통해 시험할 수 있다고 설명한다.

기능 자체는 progressive enhancement를 전제로 하므로 feature adoption 시 미지원 브라우저 동작을 반드시 확인한다.

---

# 🧠 기존 커스텀 select 구현과의 차이

| 기존 커스텀 구현 | Customizable Select |
|---|---|
| div/button/listbox 직접 조합 | 기존 semantic `<select>` 유지 |
| JS로 open state 관리 | `:open` 사용 |
| JS로 selected style 관리 | `:checked` 사용 |
| arrow DOM 직접 추가 | `::picker-icon` |
| menu container 직접 구현 | `::picker(select)` |
| selected check UI 직접 구현 | `::checkmark` |
| rich selected UI 수동 동기화 | `<selectedcontent>` |
| keyboard/focus 직접 구현 필요 | native select behavior 유지 |
| 접근성 semantics 직접 구성 | select의 내장 semantics 활용 |
| fallback 별도 구현 | 미지원 브라우저에서 native select |

---

# 📋 적용 체크리스트

## 기본 구조

- [ ] 가능한 경우 기존 semantic `<select>` 유지
- [ ] `<label for>` 연결 유지
- [ ] `appearance: base-select` 적용 범위 결정
- [ ] 기존 custom dropdown JS가 실제로 필요한지 재검토

## Select button

- [ ] font / background / border / padding 디자인 시스템에 맞춤
- [ ] `::picker-icon` 사용 검토
- [ ] `:open` 상태 스타일 제공
- [ ] focus visibility가 사라지지 않는지 확인

## Drop-down

- [ ] `::picker(select)`에 `appearance: base-select` 적용
- [ ] picker spacing / border / shadow 설정
- [ ] `:checked` 상태가 명확한지 확인
- [ ] 필요 시 `::checkmark` 커스터마이즈

## Rich content

- [ ] option 내부 image/SVG 사용 시 alt text 검토
- [ ] decorative image는 중복 announcement 방지
- [ ] grid 등 CSS layout 적용 시 keyboard navigation 확인
- [ ] 작은 viewport에서 picker가 잘리는지 테스트

## Selected content

- [ ] rich option을 button에도 표시해야 하는지 결정
- [ ] 필요한 경우 select 첫 child에 `<button>` 사용
- [ ] `<selectedcontent>`로 현재 option 내용 반영

## 호환성과 접근성

- [ ] Safari 27 / Chrome 135 이상 테스트
- [ ] unsupported browser native fallback 확인
- [ ] keyboard-only navigation 테스트
- [ ] VoiceOver / screen reader 테스트
- [ ] zoom / large text 환경 확인
- [ ] hover 없이 touch/pointer 모두 사용 가능한지 확인

---

# 🔑 핵심 메시지

Customizable Select의 가장 큰 의미는 **“더 자유로운 디자인” 자체보다, 디자인 자유도를 얻기 위해 native HTML semantics를 포기하지 않아도 된다는 것**이다.

`appearance: base-select`, `::picker(select)`, `::picker-icon`, `::checkmark`, `:open`, `:checked`, `<selectedcontent>`를 조합하면 JavaScript 중심의 커스텀 dropdown을 대체할 수 있는 범위가 크게 넓어진다.

동시에 기존 `<select>`를 유지하기 때문에 keyboard navigation, screen reader support, native fallback 같은 웹 플랫폼의 장점을 계속 활용할 수 있다.

Apple이 권장하는 적용 방식 역시 **progressive enhancement**다. 먼저 semantic select로 기능을 완성한 뒤 customization을 추가하고, 미지원 브라우저 및 assistive technology에서 반드시 테스트한다.

---

# 🔗 함께 보면 좋은 자료

- [WWDC26 — Rediscover the HTML select element](https://developer.apple.com/videos/play/wwdc2026/315/)
- WebKit.org — The golden rule of Customizable Select
- WebKit.org — Customizable Select demo
- WWDC26 — Learn CSS Grid Lanes
- WWDC26 — What’s new in WebKit for Safari 27

