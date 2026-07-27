# WWDC26 Design intuitive search experiences 요약

- Session: 292
- Title: Design intuitive search experiences
- Source: https://developer.apple.com/videos/play/wwdc2026/292/
- Topic: Search, Human Interface Guidelines, iOS, iPadOS, macOS, Liquid Glass
- Chapters: Introduction, Search field, Patterns and placement, Best practices, Next steps

---

## 한 줄 요약

좋은 검색 경험은 단순히 검색 필드를 추가하는 것이 아니라, **앱의 내비게이션 구조와 검색 범위에 맞는 위치를 선택하고 최근 검색·예측 제안·scope bar·filters·tokens·empty state를 조합해 사용자가 최소한의 입력으로 원하는 콘텐츠에 도달하게 만드는 것**이다.

---

## 핵심 요약

이번 세션은 검색 UI를 설계할 때 고려해야 하는 세 가지 축을 설명한다.

- **Search Field 자체의 기본 구조**
  - 검색 아이콘
  - Placeholder
  - Clear button
  - iOS의 Cancel button
  - Toolbar와 content 영역에 따른 자동 presentation style
  - 커스텀 아이콘을 쓰더라도 검색이라는 의미가 유지되도록 설계

- **플랫폼과 내비게이션에 따른 배치**
  - iOS: bottom toolbar, top toolbar, Search Tab, inline field
  - iPadOS/macOS: toolbar trailing position, sidebar, dedicated Search section
  - 검색 위치가 활성화 애니메이션과 사용자의 검색 범위 인식에 직접 영향
  - Tab 기반 앱은 global search와 tab-scoped search를 명확히 구분

- **검색을 더 빠르고 명확하게 만드는 보조 기능**
  - Recent searches
  - Predictive suggestions
  - Scope bar
  - Contextual filters
  - Search tokens
  - No-results / ContentUnavailableView

검색 UI의 위치를 정할 때 Apple이 제시한 핵심 질문은 두 가지다.

1. **사람들이 이 앱을 어떻게 탐색하는가?**
2. **이 검색의 범위는 어디까지인가?**

---

# 🔍 Search는 앱 탐색의 핵심 도구

Search는 사용자가 앱 안에서 콘텐츠를 찾고, 다시 방문하고, 새로운 것을 발견하게 하는 핵심 도구다.

앱이 제공하는 콘텐츠와 기능이 많아질수록 검색은 사용자가 원하는 곳으로 빠르게 이동하게 해주는 일종의 superpower가 된다.

Apple은 Pages, Apple TV, Apple Music을 예로 들며 검색이 문서 재탐색, 영화 탐색, 아티스트·장르 발견 같은 핵심 흐름을 빠르게 만든다고 설명한다.

Liquid Glass와 함께 Apple은 다음 방향을 강화했다.

- iOS에서 더 ergonomic한 검색 배치
- iPad와 Mac의 넓은 화면 활용
- Search 활성화 시 자연스럽게 위치와 형태가 전환되는 패턴

---

# 🧩 Search Field의 기본 요소

Apple이 제공하는 Search Field에는 사용자가 검색에서 기대하는 핵심 요소가 포함된다.

## Leading Search Icon

돋보기 아이콘은 해당 UI가 검색 필드라는 것을 즉시 알려준다.

검색이라는 의미가 매우 강하게 학습된 symbol이므로 별도의 브랜드 아이콘으로 교체할 때도 기존 의미를 해치지 않아야 한다.

## Placeholder Text

사용자가 무엇을 입력할 수 있는지 알려준다.

단순히 `Search`라고 쓰기보다 검색 범위를 설명할 수도 있다.

예:

- Search Albums
- Search Mail
- Search Contacts

## Clear Button

텍스트가 입력되면 현재 검색어를 빠르게 지울 수 있는 버튼이 나타난다.

## Cancel Button

iOS에서 Search가 focus되면 Cancel button이 추가된다.

사용자는 이를 통해 Search를 종료하고 keyboard도 dismiss할 수 있다.

---

# 🪟 Search Field의 Presentation Style

Search Field는 어디에 배치했는지에 따라 적절한 presentation style을 자동으로 사용한다.

| 위치 | 스타일 |
|---|---|
| Toolbar | Glass 기반 표현 |
| Scroll content | 일반적인 content styling |

앱이 Search Field 자체를 과도하게 재설계하기보다 시스템 component의 기본 behavior를 유지하는 것이 좋다.

---

# 📱 iOS의 Search 배치 패턴

iOS에서는 Search를 여러 위치에 배치할 수 있다.

- Bottom Toolbar
- Top Toolbar
- Search Tab
- Top Toolbar 아래 field
- Content 내부의 inline field

Search의 위치는 단순한 layout 선택이 아니다.

**활성화될 때 Search Field가 어디로 움직이는지**와 **사용자가 어떤 범위를 검색한다고 인식하는지**를 결정한다.

---

# ⬇️ Bottom Toolbar Search

Search를 bottom toolbar에 배치하면 활성화 시 field가 keyboard 바로 위로 올라간다.

장점:

- 손가락 도달이 쉬움
- keyboard와 가까움
- 검색 입력에 최적화
- 다른 primary actions와 함께 배치 가능

Mail이 대표적인 예다.

Search가 mail list의 bottom toolbar에 위치하므로 사용자는 현재 메일을 검색한다는 범위를 자연스럽게 이해한다.

Toolbar에 adjacent item이 있으면 Search Field width도 자동으로 조정된다.

Toolbar item이 많다면 처음부터 field로 표시하지 않고 button으로 시작한 뒤 탭하면 field로 확장할 수도 있다.

---

# ⬆️ Top Toolbar Search

Bottom 영역을 사용할 수 없는 경우 top toolbar가 대안이다.

Stocks는 list 하단에 sheet가 있기 때문에 Search를 top toolbar에 둔다.

활성화되면 field가 keyboard 위로 이동해 입력하기 쉬운 상태가 된다.

---

# 🧭 Search 위치를 결정하는 두 질문

## 1. 사람들은 앱을 어떻게 탐색하는가?

확인할 요소:

- Tab Bar를 사용하는가?
- Sidebar가 있는가?
- Split View인가?
- 하나의 list 중심인가?
- 여러 top-level section이 있는가?

## 2. 검색 범위는 어디까지인가?

Search의 위치는 사용자가 검색 범위를 이해하는 데 직접 영향을 준다.

예:

- 앱 전체 검색
- 현재 tab만 검색
- 현재 sidebar만 검색
- 현재 mailbox만 검색
- 특정 collection만 검색

---

# 🗂️ Tab 기반 앱과 Search

Tabbed app에는 다양한 searchable content가 존재할 수 있다.

이런 경우 Apple은 Search를 위한 **primary entry point**를 만드는 것을 권장한다.

즉 앱 전체에서 검색 가능한 콘텐츠를 한곳에서 찾을 수 있도록 dedicated Search Tab을 사용할 수 있다.

---

# 🔎 Search Tab: Standard Tab

첫 번째 방식은 다른 tab과 동일한 standard tab으로 Search를 구성하는 것이다.

Search tab으로 이동하면 landing page와 Search Field가 표시된다.

검색 전에도 다음을 보여줄 수 있다.

- 추천 콘텐츠
- 장르
- 카테고리
- 탐색 UI

Apple TV가 대표적인 예다.

이 방식은 사용자가 구체적인 검색어 없이 exploratory mindset으로 들어오는 앱에 적합하다.

---

# 🔘 Search Tab: Prominent Button

두 번째 방식은 Search를 prominent tab처럼 사용한다.

탭하면 즉시 Search가 활성화되고 keyboard가 올라온다.

Phone 앱이 대표적이다.

적합한 상황:

- 사용자가 찾을 대상을 이미 알고 있음
- 가능한 한 빨리 검색을 시작해야 함
- 검색 전 landing content가 중요하지 않음

---

# 🌐 Global Search와 Scoped Search

Dedicated Search Tab은 앱 전체의 global search에 적합하다.

특정 tab의 콘텐츠만 검색한다면 Search Field를 해당 content 안에 inline으로 배치하는 것이 더 명확하다.

Apple Music의 Library에서는 title과 descriptive placeholder가 함께 검색 범위를 알려준다.

즉 사용자는 Apple Music 전체가 아니라 현재 Library의 Albums를 검색한다고 이해한다.

---

# 💻 iPad와 Mac의 Search

iPad와 Mac은 넓은 화면과 비슷한 navigation model을 공유한다.

Apple은 두 플랫폼의 Search 경험을 가능한 한 비슷하게 유지하는 것을 권장한다.

주요 배치:

- Toolbar trailing position
- Sidebar 상단
- Dedicated Search Tab / Section

---

# 🪟 Split View와 Toolbar Search

Mail처럼 여러 column을 동시에 보여주는 Split View에서는 Search를 top toolbar의 trailing position에 두는 것이 적합하다.

장점:

- 검색 결과를 탐색하면서 detail view 유지
- 넓은 화면 활용
- 익숙한 패턴

Notes와 Files도 유사한 배치를 사용한다.

Freeform처럼 검색 결과가 detail 영역에 직접 표시되는 경우에도 toolbar Search가 자연스럽다.

공간이 부족하면 Search Field가 button으로 collapse되고, 활성화되면 text input에 적합한 width로 확장된다.

---

# 📚 Sidebar Search

Sidebar에 있는 navigation이나 list를 필터링하는 검색이라면 Search를 sidebar에 둔다.

Settings와 Stocks가 대표적인 예다.

Search 위치가 Sidebar이므로 사용자는 해당 list를 검색한다고 자연스럽게 이해한다.

반대로 unrelated content 위에 Search를 배치하면 잘못된 scope expectation을 만들 수 있다.

---

# 🎶 Dedicated Search Section

Apple Music처럼 multi-section app에서는 Search를 dedicated sidebar item이나 section으로 만들 수 있다.

장점:

- 앱 전체 콘텐츠의 단일 Search entry point
- 더 큰 결과 canvas
- 여러 category 표현
- 탐색과 검색을 함께 구성

---

# 🕘 Recent Searches

사용자가 Search를 찾았다는 것은 처음 화면에서 원하는 콘텐츠를 찾지 못했거나 이전 결과로 돌아가려는 경우일 수 있다.

Recent searches를 제공하면 다시 입력하지 않고도 이전 검색으로 돌아갈 수 있다.

## iOS

Search Field가 focus되는 즉시 inline으로 보여주는 것이 좋다.

## iPad / Mac

Toolbar 또는 Sidebar Search라면 menu로 표시할 수 있다.

Search Tab이라면 다른 추천 콘텐츠와 함께 page에 배치할 수 있다.

모든 과거 query를 무조건 보여줄 필요는 없다.

앱에 따라 실제로 열거나 interaction한 결과만 표시하는 것도 적절하다.

사용자가 individual item을 swipe해 삭제하거나 Clear All로 전체를 제거할 수 있어야 한다.

---

# ✨ Predictive Suggestions

사용자가 검색어를 입력하기 시작하면 가능한 한 빠르게 관련 결과를 보여준다.

Predictive suggestion은 query 전체를 타이핑하지 않게 도와준다.

예:

```text
사용자 입력: "san"
Suggestion: "san francisco"
```

사용자가 직접 입력한 부분과 예측된 부분은 시각적으로 구분한다.

Suggestion이 너무 많으면 Search Results가 묻히므로 개수를 제한한다.

검색 결과와 suggestion ranking이 잘 작동한다면 사용자가 전체 query를 끝까지 입력하지 않아도 원하는 결과를 찾을 수 있어야 한다.

---

# 🎚️ Search Refinement

앱의 primary Search Field는 일반적으로 broad search로 시작하고 필요에 따라 결과를 좁히게 하는 것이 좋다.

---

# 📏 Scope Bar

가벼운 filtering에는 scope bar를 사용할 수 있다.

Mail에서는 다음 범위를 선택할 수 있다.

- All Mailboxes
- Current Mailbox

Scope bar는 결과를 좁히는 동시에 현재 검색 범위를 알려준다.

---

# 🧰 Contextual Filters

검색 대상이 여러 category에 걸쳐 있다면 더 다양한 filter가 필요할 수 있다.

하지만 모든 filter를 항상 보여주면 사용자가 압도될 수 있다.

따라서 현재 search context에 관련된 filter만 보여주는 것이 좋다.

Maps는 location type에 따라 restaurants, hiking trails 등 서로 다른 filter를 제공한다.

---

# 🏷️ Search Tokens

Search tokens는 특정 keyword를 Search Field 내부의 강조된 text 형태로 적용하는 방식이다.

예:

```text
Person: Alex
+
Place: Joshua Tree
+
Year: 2021
```

Photos처럼 여러 token을 결합해 자연어에 가까운 filter를 구성할 수 있다.

Tokens는 강력하지만 discoverability가 낮을 수 있으므로 scope bar나 다른 visible filter UI를 완전히 대체하지 않는 것이 좋다.

---

# 🚫 No Results를 빈 화면으로 두지 않기

검색 결과가 없을 때 완전히 blank view를 보여주면 사용자는 검색이 실행되었는지조차 알기 어렵다.

Apple은 content unavailable view를 제공한다.

Search용으로 구성하면 다음을 표시할 수 있다.

- Search symbol
- Title
- Subtitle

현재 search text를 함께 표시하면 사용자가 typo나 query error를 쉽게 발견할 수 있다.

---

# 🧠 Search 위치와 Scope의 관계

이번 세션 전체를 관통하는 핵심은 Search가 어디에 있느냐가 곧 scope의 일부라는 점이다.

| 위치 | 사용자가 기대하는 Scope |
|---|---|
| Dedicated Search Tab | 앱 전체 |
| Mail bottom toolbar | 현재 Mail experience |
| Library content 내부 | 현재 Library / collection |
| Sidebar | Sidebar navigation 또는 list |
| Detail toolbar | 현재 detail content |

Search 위치가 기능 범위와 어긋나면 사용자는 결과를 이해하기 어렵다.

---

# 🧭 플랫폼별 권장 패턴

## iOS

| 상황 | 권장 배치 |
|---|---|
| List 중심 앱 | Bottom toolbar |
| Bottom 영역 사용 불가 | Top toolbar |
| Global search가 중요한 tab 앱 | Search Tab |
| 바로 keyboard가 필요한 search | Prominent Search Tab |
| 현재 section만 검색 | Inline Search |

## iPadOS / macOS

| 상황 | 권장 배치 |
|---|---|
| Split View의 여러 column 검색 | Toolbar trailing |
| Detail content 직접 필터 | Toolbar |
| Sidebar navigation / list 검색 | Sidebar |
| 앱 전체 rich search | Dedicated Search section |

---

# 🔁 Search Experience 설계 흐름

| 단계 | 질문 |
|---|---|
| Navigation 분석 | 사람들은 앱을 어떻게 탐색하는가? |
| Scope 정의 | 앱 전체인가, 현재 section인가? |
| Placement 선택 | Toolbar, Tab, Sidebar, Inline 중 무엇인가? |
| Activation 확인 | Focus 시 field가 어디로 이동하는가? |
| Empty state | 검색 전 어떤 콘텐츠를 보여줄 것인가? |
| Recent Search | 이전 검색 복귀를 도울 것인가? |
| Suggestions | 입력을 얼마나 줄일 수 있는가? |
| Refinement | Scope bar / filter / token이 필요한가? |
| No Results | 실패를 어떻게 설명할 것인가? |
| Platform consistency | iPad와 Mac에서 유사한 구조를 유지하는가? |

---

# 📋 체크리스트

## Search Field
- [ ] System Search Field 사용 검토
- [ ] Magnifying glass 의미 유지
- [ ] Placeholder가 검색 범위를 설명하는지 확인
- [ ] Clear button 동작 확인
- [ ] iOS에서 Cancel button 흐름 확인
- [ ] Toolbar와 content 위치에 따른 presentation style 확인

## Placement
- [ ] 앱의 navigation model 먼저 분석
- [ ] Search scope 명확히 정의
- [ ] iOS에서 bottom toolbar 사용 가능 여부 검토
- [ ] Toolbar action이 많다면 Search button → field 전환 검토
- [ ] Tab 앱이면 global Search Tab 필요 여부 검토
- [ ] 즉시 입력이 중요하면 prominent Search Tab 검토
- [ ] 특정 section만 검색한다면 inline field 사용
- [ ] iPad/Mac Split View에서는 toolbar trailing Search 검토
- [ ] Sidebar filter에는 sidebar Search 사용
- [ ] Search 위치가 scope 인식과 일치하는지 확인

## Recent Searches
- [ ] Search focus 시 recent search 제공 여부 검토
- [ ] 유용한 기록만 선택적으로 노출
- [ ] 개별 삭제 지원
- [ ] Clear All 지원
- [ ] 플랫폼에 맞는 presentation 사용

## Suggestions
- [ ] 입력 시작 후 결과를 빠르게 표시
- [ ] Predictive suggestion 제공 여부 검토
- [ ] 사용자 입력과 예측 부분 시각적으로 구분
- [ ] Suggestion 수 제한
- [ ] Search Results가 suggestions보다 우선적으로 보이는지 확인
- [ ] Ranking 품질 확인

## Filtering
- [ ] Primary Search는 broad하게 시작
- [ ] 가벼운 scope 전환에는 scope bar 사용
- [ ] 현재 query에 관련된 contextual filter만 표시
- [ ] 복잡한 filtering에 token 사용 검토
- [ ] Token을 유일한 filtering UI로 사용하지 않기
- [ ] Scope bar와 token 조합 검토

## Empty State
- [ ] No-results 화면을 blank 상태로 두지 않기
- [ ] ContentUnavailableView 사용 검토
- [ ] Search icon / title / subtitle 제공
- [ ] 현재 search text 표시 검토
- [ ] typo를 발견하기 쉬운지 확인

---

# 핵심 메시지

Search는 검색어를 입력하는 field 하나로 끝나는 기능이 아니다.

사용자가 **어디에서 검색을 시작하는지**, **어떤 범위를 검색한다고 이해하는지**, **얼마나 적은 입력으로 원하는 결과에 도달하는지**까지 모두 Search experience의 일부다.

iOS에서는 reachability와 keyboard interaction을 고려해 bottom toolbar Search가 효과적일 수 있고, tab 기반 앱에서는 global Search Tab이 적합할 수 있다. iPad와 Mac에서는 toolbar와 sidebar라는 더 넓은 공간을 활용해 Search scope와 결과 구조를 명확하게 만들 수 있다.

Recent searches, predictive suggestions, scope bars, contextual filters, tokens를 적절히 조합하면 사용자가 전체 query를 입력하기 전에 원하는 결과에 도달하게 할 수 있다.

결과가 없을 때도 빈 화면으로 끝내지 말고 무엇이 일어났는지 명확하게 설명하는 empty state를 제공해야 한다.

---

# 함께 보면 좋은 세션

- Design foundations from idea to interface
- Get to know the new design system
- Meet Liquid Glass
