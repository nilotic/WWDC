# Tech Talk 111466 — Design for iPhone Duo 요약

- Session: Tech Talks 111466
- Title: Design for iPhone Duo
- Primary video: Apple Developer YouTube — https://www.youtube.com/watch?v=do3UqxfYc3I
- Apple Developer page: https://developer.apple.com/videos/play/tech-talks/111466/
- Speakers: Marcos, Vince — Apple Design team
- Duration: 약 10분 45초
- Topic: iPhone Duo, adaptive design, size classes, vertical controls, safe areas, inner/outer display, sheets, fold avoidance
- Chapters: Introduction, Design principles, Adapting your design, Positioning controls, Designing for the outer display, Designing for the inner display, Sheet behavior, Fold avoidance, Conclusion

---

## 소스 기준

Apple Developer 페이지에는 WWDC 세션처럼 전체 transcript가 노출되지 않는다.

따라서 이번 문서는 다음 순서로 작성했다.

1. **Apple Developer 공식 YouTube 영상**을 primary video source로 사용
2. Apple Developer 페이지의 공식 chapter summary로 구조와 핵심 메시지를 확인
3. YouTube 영어 subtitle을 시점과 함께 인용한 공개 자료를 이용해 세부 발언을 교차 확인

즉 공식 transcript가 없는 경우에 적용하는 **YouTube 우선 workflow**의 첫 적용 사례다.

---

## 한 줄 요약

iPhone Duo용 앱은 각 fold pose마다 별도 레이아웃을 만드는 것이 아니라 **outer display의 compact width와 inner display의 regular width라는 두 size class를 중심으로 resizable UI를 만들고**, 시스템이 제공하는 safe area·navigation container·toolbar·sheet 동작을 활용해 control을 바깥쪽 edge에 배치하고 fold 위의 interactive element를 자동으로 피하도록 설계해야 한다.

---

## 핵심 요약

Apple의 디자인 원칙은 의외로 단순하다.

```text
Pose별 Custom Layout
❌

Compact / Regular Size Class
+
Resizable Layout
+
Safe Area / Layout Margins
+
System Navigation & Presentation Components
✅
```

핵심은 다음과 같다.

- iPhone Duo는 닫힘, 완전 펼침, 부분 접힘, 책처럼 사용, 테이블에 세움 등 다양한 pose를 가진다.
- 각 pose마다 별도의 UI를 만들지 않는다.
- **Outer display = compact width**
- **Inner display = regular width**
- fixed width, 특정 screen breakpoint, 특정 pose에 종속된 magic number를 피한다.
- navigation bar, toolbar, tab bar 같은 controls는 필요한 경우 display의 바깥 edge로 이동한다.
- content는 safe area inset을 사용하면 이동한 controls를 자동으로 피한다.
- fold 위의 button 같은 interactive element는 시스템 component가 자동으로 밀어낸다.
- 반면 article, feed, document, list처럼 **연속적으로 scroll되는 content는 fold를 피한다고 억지로 이동시키지 않는다.**
- inner display에서는 단순 확대보다 split view, sidebar, two-column rearrangement로 정보 밀도를 높인다.
- sheet도 현재 display와 fold 상태에 맞게 axis와 위치가 바뀐다.
- 앱 전체 hierarchy와 기능은 outer/inner display 사이에서 일관되게 유지해야 한다.

---

# 📱 iPhone Duo는 하나의 고정된 화면이 아니다

세션의 출발점은 iPhone Duo가 단순히 “펼치면 커지는 iPhone”이 아니라는 점이다.

사용자는 기기를 다음처럼 사용할 수 있다.

```text
Closed
Fully Open
Partially Folded
Book-like
Flat on a Surface
Standing on an Edge
Split View
Picture in Picture
```

따라서 앱이 만나는 aspect ratio와 usable region도 계속 달라진다.

그렇다고 pose를 일일이 감지해 다음과 같이 만드는 것은 Apple이 권장하는 접근이 아니다.

```text
if closed { ... }
else if bookPose { ... }
else if tabletop { ... }
else if fullyOpen { ... }
...
```

이런 방식은 device-specific layout을 과도하게 늘리고 앱의 일관성을 깨뜨린다.

---

# 🧭 두 Size Class에 집중

Apple이 강조하는 핵심 rule은 다음이다.

```text
Outer Display
→ Compact Width

Inner Display
→ Regular Width
```

즉 개발자가 직접 pose taxonomy를 만드는 대신 기존 Apple platform adaptive layout model을 따른다.

Subtitle 기반 공개 인용 자료에서 Vince는 대략 다음 원칙을 강조한다.

> 사람들은 여러 pose로 iPhone Duo를 쓰지만, pose마다 custom layout을 만들 필요는 없다. outer display의 compact width와 inner display의 regular width에 집중하라.

함께 피해야 할 것:

- Fixed width
- Device-specific breakpoint
- 특정 screen size에만 맞는 숫자
- pose 이름에 직접 의존하는 UI hierarchy

대신 사용할 것:

- Size classes
- Layout margins
- Safe area insets
- System navigation containers
- Resizable content

---

# 🔄 앱은 자유롭게 Resize될 수 있어야 한다

Duo에서는 다음 이유로 app size가 변할 수 있다.

- Outer ↔ Inner display 전환
- Device fold state 변화
- Split View multitasking
- Picture in Picture
- 다른 scene configuration

따라서 Apple의 결론은 사실상 다음과 같다.

```text
Design for Resizability First
```

이미 size class와 safe area를 중심으로 잘 만들어진 앱이라면 Duo 대응의 상당 부분은 시스템이 처리한다.

---

# 🕹️ Controls가 Side로 이동하는 이유

Outer display는 전통적인 iPhone과 비교해 더 넓고 상대적으로 짧은 형태다.

이 환경에서 화면 상단과 하단에 horizontal bar를 계속 두면 vertical content area를 크게 잡아먹는다.

그래서 iPhone Duo는 여러 핵심 control을 display의 바깥 edge로 이동시킨다.

예:

- Tab bar
- Toolbar
- Back / navigation controls
- Status bar
- Dynamic Island 영역

기본적인 시각 구조:

```text
┌───────────────────────────────┬──────┐
│                               │ Back │
│                               │      │
│            Content            │ Tool │
│                               │ Bar  │
│                               │      │
│                               │ Tabs │
└───────────────────────────────┴──────┘
```

이렇게 하면 content가 사용할 vertical dimension이 늘어난다.

또 control이 오른쪽 edge에 모이면 오른손으로 잡았을 때 thumb reachability가 좋아진다.

---

# 🧩 Side Controls는 모든 Pose에서 항상 같은 방향이 아니다

핵심은 “무조건 오른쪽 vertical bar”가 아니다.

상황에 따라 시스템이 적절한 axis를 선택한다.

대표적인 pattern:

```text
Outer Display
→ Vertical controls

Inner Display Landscape
→ Vertical controls

Inner Display Portrait
→ Horizontal bars
```

Inner portrait는 vertical space가 충분하기 때문에 기존 iPhone/iPad 스타일의 horizontal bar가 자연스럽다.

또 Split View에서 app이 왼쪽에 배치되면 controls 역시 **device 바깥쪽 edge**에 맞춰 왼쪽으로 이동할 수 있다.

중요한 것은 leading/trailing language direction보다 **physical device outer edge**와 ergonomics다.

---

# 🧱 System Navigation Container를 사용해야 하는 이유

이 adaptive behavior는 시스템이 navigation structure를 이해할 때 가장 잘 동작한다.

따라서 다음 같은 system container를 사용하는 것이 중요하다.

- SwiftUI `NavigationStack`
- SwiftUI `TabView`
- UIKit navigation / toolbar system

직접 만든 임의의 bar를 화면 특정 위치에 고정하면 시스템이 Duo의 vertical control behavior로 자연스럽게 변환하기 어렵다.

즉:

```text
System-semantic UI
→ Duo adaptation 가능

Pixel-positioned custom chrome
→ 직접 대응 필요 증가
```

---

# 📍 Positioning Controls

Vertical bar의 공간은 무한하지 않다.

여기에는 다음 요소들이 함께 존재할 수 있다.

- Navigation controls
- Toolbar items
- Tab destinations
- Status information
- Live Activities
- Dynamic system content

따라서 공간이 부족하면 일부 item은 overflow menu로 들어간다.

Apple의 design rule:

- Side bar에 맞는 control은 주로 symbol 중심의 compact action
- 너무 넓은 control은 vertical bar로 억지로 보내지 않는다.

예:

```text
적합
✓ Back icon
✓ Share icon
✓ Favorite icon
✓ Compact action

부적합할 수 있음
✗ Wide text button
✗ Segmented control
✗ Large custom control
```

---

# 🔝 Vertical Bar의 Hierarchy

세부 design guidance에서는 top area를 navigation에 우선 사용한다.

개념적으로:

```text
Top
↓
Back / Close
Prominent action (예: Done)
────────────
Other actions
────────────
Destinations / Tabs
↓
Bottom
```

사용자가 어디에 있고 어떻게 빠져나갈 수 있는지가 가장 먼저 보여야 한다.

---

# 🧯 Overflow는 Failure가 아니라 System Behavior

공간이 부족하면 item을 억지로 축소하거나 겹치게 만들지 않는다.

System toolbar는 overflow menu로 이동시킬 수 있다.

따라서 각 toolbar item에는 symbol만 설정하는 것으로 끝내지 말고 **의미 있는 title**을 제공해야 한다.

Overflow menu에서는 이 title이 사용자에게 action의 의미를 설명한다.

---

# 🖼️ Outer Display에서 Content 배치

Controls가 오른쪽 edge에 있다면 content를 screen 전체 width 기준으로 무조건 center하면 controls 뒤에 가려질 수 있다.

일반적인 UI에서는 safe area를 따라야 한다.

```text
Full Display
┌───────────────────────────────┬──────┐
│ Safe Content Area             │ Bars │
│                               │      │
│ Text / List / Controls        │      │
└───────────────────────────────┴──────┘
```

Horizontal safe area inset을 사용하면 이러한 offset이 자동으로 적용된다.

---

# 🎨 Full-width Visual은 예외가 될 수 있다

모든 content를 inset할 필요는 없다.

특히 다음 경우에는 display 전체를 사용하는 것이 적합할 수 있다.

- Immersive visual experience
- Photo
- Video
- Game surface
- Non-scrolling hero interface

조건:

> Interactive element가 side controls 뒤에 가려지지 않아야 한다.

---

# 🧩 Full-width Background + Inset Foreground

Apple이 보여주는 실용적인 혼합 방식:

```text
Full-width Background Image
        +
Safe-area Inset Foreground Content
```

예:

```text
┌──────────────────────────────────────┐
│          Full-width Photo            │
│   ┌──────────────────────┐    │Bar│ │
│   │ Scrollable Text      │    │   │ │
│   │ Buttons              │    │   │ │
│   └──────────────────────┘    │   │ │
└──────────────────────────────────────┘
```

배경 visual은 full display를 활용하고 실제 interaction은 safe area 안에 둔다.

---

# 🖥️ Inner Display는 단순히 UI를 늘리는 공간이 아니다

Inner display가 넓다고 기존 compact interface를 그대로 stretch하면 정보 밀도가 낮아지고 공간을 낭비한다.

Apple의 표현을 정리하면:

```text
Don't just make an iPhone app wider.
```

Inner display에서는 추가 공간을 이용해 hierarchy를 더 많이 동시에 보여줄 수 있어야 한다.

---

# 🪟 Inner Display 전략 1 — Split View

가장 대표적인 방법은 split view다.

예:

```text
Outer Display
┌─────────────────┐
│ List            │
│                 │
└─────────────────┘

Inner Display
┌──────────────┬──────────────────────┐
│ List         │ Detail               │
│              │                      │
└──────────────┴──────────────────────┘
```

중요:

> 앱 hierarchy 자체는 outer/inner display에서 달라지지 않는다.

Outer에서는 한 단계씩 탐색하고, Inner에서는 같은 hierarchy의 여러 단계를 동시에 보여주는 것이다.

이렇게 해야 사용자가 fold/unfold를 반복해도 mental model이 유지된다.

---

# 📰 Inner Display 전략 2 — Two-column Rearrangement

Split navigation hierarchy가 없어도 layout을 재배치할 수 있다.

예:

```text
Compact
┌─────────────────┐
│ Artwork         │
├─────────────────┤
│ Metadata        │
├─────────────────┤
│ Controls        │
└─────────────────┘

Regular
┌────────────────┬────────────────┐
│ Artwork        │ Metadata       │
│                │ Controls       │
└────────────────┴────────────────┘
```

즉 vertical stack을 horizontal/two-column arrangement로 바꿀 수 있다.

기능은 같고 hierarchy도 같지만 공간 활용 방식이 달라진다.

---

# 🗂️ Inner Display 전략 3 — Sidebar

정보 밀도가 높은 앱은 inner display에서 tab bar를 sidebar 형태로 표현할 수도 있다.

적합:

- Health-like data-heavy app
- Mail
- Productivity
- Library/browser style app

목적:

```text
추가 Width
→ Navigation + Content를 동시에 노출
```

---

# 📑 Sheet Behavior

Sheet 역시 하나의 고정 presentation으로 취급하지 않는다.

Duo의 display와 pose에 따라 시스템이 sheet presentation을 바꾼다.

대표적인 동작:

```text
Outer Display
→ Vertical controls와 조화되는 presentation

Inner Display
→ Standard horizontal bars

Partially Folded
→ Fold 위에 놓이지 않도록 side로 이동
```

따라서 standard sheet presentation을 사용하면 system이 fold geometry를 고려해준다.

---

# 🪢 Fold Avoidance

Partially folded 상태에서는 중앙 fold region이 interaction에 불리하다.

특히 button이 fold 정확히 위에 놓이면 손가락으로 누르기 어렵다.

그래서 system component는 interactive element를 fold에서 밀어낸다.

예:

- Forms
- Alerts
- Menus
- Popovers
- Toolbar buttons
- Sheets

개념:

```text
Before

[ Button ]
    ↑
   Fold

After

Fold │     [ Button ]
```

---

# 📜 Scrollable Content는 Fold를 피하지 않는다

이 부분은 중요한 예외다.

다음 콘텐츠는 일반적으로 fold를 피한다고 좌우 또는 상하로 이동시키지 않는다.

- Article
- Feed
- Document
- List
- Continuous scrolling content

이유:

스크롤 자체가 content 이동의 자연스러운 메커니즘이기 때문이다.

Fold 때문에 continuous content 전체를 한쪽으로 옮기면 오히려 reading continuity가 깨진다.

따라서 원칙은 다음과 같다.

```text
Interactive Element
→ Fold avoidance

Continuous Scroll Content
→ 그대로 흐르게 둠
```

---

# 📚 Book-like Pose

기기를 책처럼 부분적으로 접으면 화면은 fold를 기준으로 좌우 영역처럼 느껴진다.

Contextual UI나 alert 같은 요소는 fold 위가 아니라 한쪽 영역으로 이동한다.

Apple은 trailing side로 이동하는 pattern을 보여준다.

이는 기기를 닫아 outer display로 전환할 때 UI가 나타날 위치와도 자연스럽게 이어진다.

---

# 💻 Tabletop / Laptop-like Pose

기기를 테이블에 놓고 절반 정도 접으면 다음처럼 역할을 분리할 수 있다.

```text
Upper Region
→ Media / information / long-distance viewing

Lower Region
→ Controls / touch interaction
```

예:

```text
┌──────────────────────────────┐
│          Video               │
│                              │
├────────── Fold ──────────────┤
│ Play    Seek    Volume       │
│                              │
└──────────────────────────────┘
```

하단이 물리적으로 지지되기 때문에 touch control에 안정적이다.

다만 이런 bespoke layout을 만들더라도 다른 pose와 **같은 핵심 controls와 hierarchy**를 유지해야 한다.

---

# 🧠 Custom Pose Layout을 만들 때의 기준

Apple은 custom layout을 완전히 금지하지 않는다.

하지만 조건이 있다.

특정 pose에 특화된 layout이 있다면:

- 기능을 빼지 않는다.
- hierarchy를 바꾸지 않는다.
- 다른 pose의 control location과 mental model을 크게 깨지 않는다.
- adaptive layout을 보완하는 용도로 사용한다.

즉:

```text
Same Experience
Different Arrangement
```

이어야 한다.

---

# 🧭 Safe Area를 신뢰해야 하는 이유

Duo에서는 safe area가 단순히 notch를 피하는 개념보다 중요하다.

보호해야 할 수 있는 영역:

- Side controls
- Camera
- System UI
- Split View의 반대쪽 app controls
- 기타 dynamic system regions

따라서 geometry를 직접 계산하기보다 system safe area를 layout의 기본 경계로 사용한다.

---

# 🪄 System Component를 쓰면 자동으로 얻는 것

표준 component를 사용하면 다음 adaptive behavior 상당수를 system에서 받을 수 있다.

```text
NavigationStack
TabView
Toolbar
Sheet
Alert
Menu
Popover
Split View
```

결과:

- Axis adaptation
- Safe placement
- Overflow
- Fold avoidance
- Display-aware positioning

Duo 대응을 위해 custom component를 늘리는 것보다 system semantic component를 더 잘 활용하는 것이 중요하다.

---

# 🧩 디자인 의사결정 표

| 상황 | 권장 방식 |
|---|---|
| Outer display | Compact width layout |
| Inner display | Regular width layout |
| Pose 변화 | Pose별 custom layout보다 resizability |
| Side controls 존재 | Safe area inset 사용 |
| Immersive visual | Background는 full display 가능 |
| Interactive content | Safe area 안에 배치 |
| Wide inner screen | Split / sidebar / two-column 활용 |
| Fold 위 button | System fold avoidance 활용 |
| Scrollable article/list | Fold 때문에 content 자체를 밀지 않음 |
| Sheet | System sheet 사용 |
| Tabletop pose | Media 위 / controls 아래 custom arrangement 가능 |
| Too-wide toolbar control | Horizontal placement 유지 고려 |

---

# 📋 체크리스트

## 기본 Layout

- [ ] Outer display를 compact width로 처리
- [ ] Inner display를 regular width로 처리
- [ ] Pose별 hard-coded layout 제거
- [ ] Fixed width 최소화
- [ ] Device-specific breakpoint 최소화
- [ ] Window resize에 자연스럽게 반응
- [ ] Split View에서도 UI가 깨지지 않는지 확인
- [ ] PiP 등 aspect ratio 변화 테스트

## Navigation / Toolbar

- [ ] `NavigationStack` 등 system navigation container 사용
- [ ] `TabView` 또는 system tab structure 사용
- [ ] Custom bar가 꼭 필요한지 재검토
- [ ] Symbol-based action에 meaningful title 제공
- [ ] Wide text control을 vertical bar에 억지로 넣지 않기
- [ ] Overflow 상태 테스트
- [ ] Back / Close가 hierarchy상 명확한지 확인

## Outer Display

- [ ] Side controls 때문에 content가 가려지지 않는지 확인
- [ ] Horizontal safe area inset 적용
- [ ] Scrolling foreground는 safe area 안에 배치
- [ ] Full-width background와 inset foreground 조합 검토
- [ ] Full-screen visual의 interactive element 위치 확인

## Inner Display

- [ ] Compact UI를 단순 stretch하지 않기
- [ ] Split view 적용 가능성 검토
- [ ] Master/detail을 동시에 보여줄 수 있는지 확인
- [ ] Vertical stack → two-column rearrangement 검토
- [ ] Sidebar가 정보 구조에 적합한지 확인
- [ ] Outer/inner에서 hierarchy 자체는 유지

## Fold

- [ ] Interactive element가 fold 위에 놓이지 않는지 확인
- [ ] System alerts / menus / sheets 활용
- [ ] Custom control의 fold avoidance 필요 여부 검토
- [ ] Scrollable content는 불필요하게 이동시키지 않기
- [ ] Book-like pose 테스트
- [ ] Tabletop pose 테스트

## Sheet

- [ ] Standard system sheet 우선
- [ ] Outer display vertical control presentation 확인
- [ ] Inner display horizontal bar 확인
- [ ] Partial fold에서 fold avoidance 확인
- [ ] Sheet 안의 controls가 reachable한지 확인

## Consistency

- [ ] Fold/unfold 후 사용자가 위치를 잃지 않는지 확인
- [ ] Core actions가 pose마다 사라지지 않는지 확인
- [ ] Navigation hierarchy가 pose마다 달라지지 않는지 확인
- [ ] Same experience / different arrangement 원칙 유지

---

# ⚠️ 피해야 할 접근

## Pose를 전부 Enumerate하기

```text
Closed
Book
Tent
Tabletop
Landscape Open
Portrait Open
...
```

각 pose별 별도 layout을 만들면 상태 조합이 폭발한다.

대신 size class와 resizable layout을 중심으로 설계한다.

## Screen Width에 직접 숫자를 박기

Duo뿐 아니라 Split View에서도 쉽게 깨진다.

## 모든 걸 Center에 고정하기

Side controls가 있는 display에서는 시각적 center와 usable content center가 다를 수 있다.

## Fold를 무조건 빈 공간으로 만들기

Fold 위에 interactive control은 피해야 하지만 scrollable content까지 모두 비울 필요는 없다.

## Inner Display를 단순 확대하기

넓어진 canvas는 hierarchy나 content를 더 많이 보여줄 기회다.

---

# 🎯 세션의 가장 중요한 원칙

Apple의 design guidance를 한 문장으로 압축하면:

```text
Design one adaptive app,
not one app per pose.
```

Duo의 hardware 특성은 분명 새롭지만 해결 방법은 기존 Apple adaptive UI 원칙의 연장선에 있다.

```text
Size Classes
+ Safe Areas
+ System Containers
+ Resizability
+ Stable Hierarchy
```

이 기반이 잘 갖춰져 있으면 많은 Duo-specific behavior를 시스템이 자동으로 처리한다.

---

# 핵심 메시지

iPhone Duo 대응의 가장 큰 실수는 foldable hardware 자체를 중심으로 UI architecture를 새로 만드는 것이다.

Apple이 권장하는 방향은 반대다.

Outer display는 compact width, inner display는 regular width로 보고 기존 adaptive layout system에 맞춘다.

Controls는 더 많은 vertical content를 확보하고 thumb reachability를 높이기 위해 필요할 때 device edge로 이동하며, safe area를 따른 content는 자동으로 이를 피한다.

Inner display에서는 split view, sidebar, two-column rearrangement를 사용해 넓어진 공간을 활용하지만 outer display와 동일한 navigation hierarchy를 유지한다.

Fold는 interactive element에는 피해야 할 region이지만 continuous scroll content까지 억지로 분리할 필요는 없다.

Sheet, alert, menu, toolbar 같은 standard system component를 사용하면 axis 변화와 fold avoidance의 상당 부분을 시스템이 처리한다.

결국 Duo에 잘 맞는 앱은 “Duo만을 위해 특수하게 만든 앱”이 아니라 **어떤 크기와 pose에서도 자연스럽게 resize되는 잘 설계된 adaptive iOS 앱**이다.

---

# 함께 보면 좋은 Tech Talks

- Prepare your app for iPhone Duo
- Raise the bar with iPhone Duo
- Strike a pose with adaptive layouts on iPhone Duo
- Leverage multiple displays and scenes on iPhone Duo
- Build a great camera experience for iPhone Duo
