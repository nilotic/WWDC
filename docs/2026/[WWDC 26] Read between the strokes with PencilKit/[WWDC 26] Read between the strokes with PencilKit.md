# WWDC26 — Read between the strokes with PencilKit

- **Session:** 203
- **Title:** Read between the strokes with PencilKit
- **Source:** https://developer.apple.com/videos/play/wwdc2026/203/
- **Basis:** Apple Developer 공식 전체 transcript 및 Code 섹션
- **Platforms:** iOS 27, iPadOS 27, macOS 27, visionOS 27
- **Topics:** PencilKit, Handwriting Recognition, Search, Accessibility, Bézier Conversion, Stroke Identity, Selection, Stroke Slicing

---

## 🎯 한 줄 요약

iOS 27의 PencilKit은 기존의 “그리기 프레임워크”를 넘어 **손글씨를 인식·검색·인덱싱하고, 기존 Bézier 기반 캔버스와 연결하며, 개별 stroke를 안정적으로 추적·선택·분할할 수 있는 데이터 모델 API**를 제공한다. 핵심 출발점은 actor 기반 `PKStrokeRecognizer`이며, 모든 인식은 온디바이스에서 동작한다.

---

## 🧭 세션 구성

| 시간 | 내용 |
|---|---|
| 0:00 | Introduction |
| 3:25 | Handwriting recognition |
| 8:38 | Path conversion |
| 10:21 | Improved model access |
| 11:25 | Stroke slicing |
| 13:48 | Next steps |

세션은 Apple의 Notes와 Freeform에서 이미 사용하던 손글씨 인식 기능을 PencilKit API로 공개하면서, 이를 단순한 `PKCanvasView` 사용 사례를 넘어 **임의의 drawing model과 custom canvas**에서도 활용할 수 있도록 확장하는 방향을 보여준다.

---

# ✍️ PencilKit의 역할 확장

PencilKit은 Apple 플랫폼에서 freehand drawing을 위한 핵심 프레임워크다. 기존에도 다음을 제공했다.

- 낮은 latency의 drawing canvas
- expressive ink
- Apple Pencil 지원
- drawing의 underlying data model 접근

Apple은 iOS 26에서 PencilKit 위에 **PaperKit**을 도입해 시스템 전반의 drawing 경험을 구성했고, 이번 세션에서 소개하는 PencilKit의 새 API도 PaperKit과 함께 사용할 수 있다고 설명한다.

이번 변화의 중요한 지점은 PencilKit이 더 이상 단순히 “그린 stroke를 보관하고 렌더링하는 프레임워크”에 머물지 않는다는 것이다. iOS 27부터는 앱이 손글씨의 **의미 자체**를 다룰 수 있다.

- 손글씨를 텍스트로 인식
- 문서 전체를 검색 가능한 문자열로 변환
- 특정 단어의 위치를 찾아 highlight
- VoiceOver가 손글씨를 읽도록 연결
- Bézier path 기반 자체 drawing engine에서 PencilKit recognition 활용
- stroke별 stable identity 추적
- selection state 접근/제어
- stroke의 일부분을 잘라내거나 재생

---

# 🧠 `PKStrokeRecognizer`: 손글씨 인식의 중심

`PKStrokeRecognizer`는 **Swift actor**다. 따라서 thread-safe하게 설계되어 있고, 인식에 시간이 걸릴 수 있으므로 주요 메서드는 asynchronous하다.

기본 흐름은 drawing을 recognizer에 전달한 뒤 결과를 비동기로 요청하는 방식이다.

```swift
import PencilKit

let recognizer = PKStrokeRecognizer()
await recognizer.updateDrawing(drawing)
myLabel.text = await recognizer.recognizedText()
```

Apple은 handwriting recognition 경험을 구성하는 핵심 기능을 세 가지로 나눈다.

1. **Recognized text** — 가장 가능성이 높은 하나의 인식 결과
2. **Indexable content** — 검색 인덱스에 넣기 위한 전체 drawing의 후보 문자열
3. **Search** — 특정 문자열이 drawing 어디에 있는지 찾아내는 결과

이 세 가지는 목적이 서로 다르므로 같은 데이터처럼 취급하면 안 된다.

---

# 📝 Recognized text

`recognizedText()`는 사용자가 쓴 내용을 가장 가능성 높은 **하나의 문자열 결과**로 반환한다.

```swift
import PencilKit

let recognizer = PKStrokeRecognizer()
await recognizer.updateDrawing(drawing)
myLabel.text = await recognizer.recognizedText()
```

세션의 중국어/영어 학습 앱에서는 사용자가 쓴 중국어 문자를 인식하고, flashcard의 정답과 비교해 맞았는지 판정한다.

## 언어 선택

기본적으로 `PKStrokeRecognizer`는 **기기의 언어 설정**을 활용해 손글씨를 해석한다. 앱의 문맥이 명확한 경우 `preferredLanguages`를 직접 지정할 수 있다.

예를 들어 영어 학습 화면과 중국어 쓰기 연습 화면이 구분되어 있다면 해당 화면의 language context를 recognizer에 전달하는 방식이 더 적합할 수 있다.

## 전체 drawing 또는 특정 stroke만 인식

앱은 전체 drawing을 한 번에 인식할 수도 있고, 특정 `strokeID` 집합만 전달해 제한된 영역을 인식할 수도 있다. 즉, recognition 범위를 앱의 interaction에 맞게 좁힐 수 있다.

## 지원 언어

세션 기준 iOS 27의 `PKStrokeRecognizer`는 **29개 언어**를 지원한다. 실제 지원 목록은 recognizer의 `supportedLanguages` property를 통해 확인한다.

단, Simulator의 handwriting recognition은 **Latin character를 사용하는 언어만 지원**한다. 따라서 중국어와 같이 Latin 이외의 writing system은 실제 기기에서 검증해야 한다.

---

# 🔒 완전한 온디바이스 인식

PencilKit handwriting recognition은 **전적으로 기기에서 실행**된다.

- recognition model은 OS에 포함됨
- offline에서도 작동
- 별도 network round trip 불필요
- iOS 27을 지원하는 모든 기기에서 동작

따라서 손글씨 데이터를 서버로 보내야만 recognition이 가능한 구조가 아니다. Privacy-sensitive한 메모나 drawing을 다루는 앱에서도 중요한 특성이다.

Apple은 인식이 빠르다고 설명하지만, recognizer API 자체는 async로 제공된다. UI thread에서 동기 결과를 기대하는 구조로 만들지 않는 것이 맞다.

---

# 🔎 Indexable content: 검색을 위한 문자열

`indexableContent`는 drawing 전체의 내용을 하나의 문자열로 제공하며, Spotlight 같은 검색 기능에 적합하다.

```swift
import PencilKit

let recognizer = PKStrokeRecognizer()
await recognizer.updateDrawing(drawing)
if let indexedContent = await recognizer.indexableContent {
    index(text: indexedContent)
}
```

## `recognizedText`와 다른 점

`recognizedText`는 **가장 가능성 높은 하나의 해석**을 제공한다.

반면 `indexableContent`는 검색 가능성을 높이기 위해 **여러 후보 해석을 함께 포함**할 수 있다. 여러 언어가 활성화된 경우 서로 다른 언어의 후보도 섞일 수 있다.

세션의 예시는 손글씨가 다음처럼 모호한 경우다.

- 숫자 `1`인지 소문자 `l`인지
- `101`인지 `lol`인지

사용자에게 정답 하나를 보여줄 때는 recognized text가 적합하지만, 검색 인덱스에는 여러 후보가 들어가야 나중에 사용자가 어느 표현으로 검색하더라도 문서를 찾을 수 있다.

즉:

| 목적 | API 성격 |
|---|---|
| 화면에 인식 결과 표시 / 정답 판정 | `recognizedText()` |
| Spotlight / 앱 내부 검색 인덱스 구축 | `indexableContent` |

---

# 🔄 `recognizerVersion`과 재색인 전략

Handwriting recognition model은 OS 업데이트와 함께 개선될 수 있다. 따라서 `indexableContent`를 disk에 영구 저장한다면 과거에 생성한 결과가 현재 model보다 품질이 낮을 수 있다.

이를 위해 `PKStrokeRecognizer`는 `recognizerVersion`을 제공한다.

권장 전략:

1. `indexableContent` 저장
2. 함께 `recognizerVersion` 저장
3. 다음 로드 시 현재 recognizer version과 비교
4. version이 달라졌다면 drawing을 다시 인식해 index 재생성

이 구조는 “인덱스 문자열”을 원본 데이터로 취급하지 않고, **drawing에서 다시 만들어낼 수 있는 derived data**로 취급하게 한다.

## 호출 빈도 조절

Apple은 indexing을 위해 stroke가 하나 추가될 때마다 매번 recognizer를 호출할 필요는 없다고 지적한다. 과도한 recognition 호출은 불필요한 전력 소비로 이어질 수 있다.

따라서 실무에서는 다음과 같은 throttling/debouncing 전략이 적절하다.

- 사용자가 일정 시간 필기를 멈췄을 때
- 문서를 닫을 때
- background로 넘어갈 때
- 검색 index를 갱신해야 할 때

세션이 강조하는 핵심은 **기능의 요구 수준에 맞게 인식 빈도를 조절하라**는 것이다.

---

# 🔍 `search()`: 손글씨 안에서 특정 단어 찾기

`search()`는 특정 target string이 drawing의 어디에 있는지 찾아낸다.

```swift
import PencilKit

let recognizer = PKStrokeRecognizer()
await recognizer.updateDrawing(drawing)
let results = await recognizer.search("apple")
for result in results {
    highlight(bounds: result.bounds)
}
```

각 search result는 해당 단어가 있을 가능성이 높은 영역을 나타내며, 세션에서는 `result.bounds`를 이용해 일치 영역 주위에 box를 표시한다.

검색은 단일 recognized text만 보는 것이 아니라 여러 recognition candidate를 고려해 matching한다. 따라서 모호한 필기도 interactive search에서 발견될 가능성을 높인다.

---

# 🔎 `UIFindInteraction`과 결합

`search()`는 `UIFindInteraction`과 자연스럽게 연결된다.

앱이 `UIFindInteractionDelegate`를 구현하고 내부 검색 엔진으로 `PKStrokeRecognizer.search()`를 사용하면 시스템의 find UI를 drawing canvas에도 적용할 수 있다.

얻을 수 있는 사용자 경험:

- 시스템 표준 Find UI
- 다음/이전 결과 navigation
- drawing 위 matching 영역 highlight
- typed text와 유사한 검색 경험

이는 custom canvas를 만들면서도 검색 UI 자체를 다시 구현할 필요가 없다는 의미다.

---

# ♿ 손글씨 접근성

Apple은 handwriting recognition을 단지 검색 기능으로 보지 않고 **accessibility bridge**로도 설명한다.

Recognition 결과를 VoiceOver와 연결하면 screen reader를 사용하는 사용자가 손글씨 내용을 들을 수 있다. Search API는 특정 단어가 drawing 안의 어디에 있는지 찾을 수 있으므로 assistive feature가 해당 content로 이동하는 데도 활용할 수 있다.

즉 typed text에는 당연하게 존재하던:

- 읽기
- 검색
- 특정 단어로 이동

같은 기능을 handwriting에도 제공할 수 있게 된다.

---

# 🧩 Path conversion: PencilKit을 자체 캔버스로 확장

PencilKit은 stroke path를 **cubic uniform B-spline**으로 표현한다. 하지만 많은 그래픽 시스템과 기존 앱은 Bézier path를 사용한다.

iOS 27에서 `PKStrokePath`는 **PencilKit path와 Bézier path 사이의 변환**을 지원한다.

## 왜 중요한가

기존에 자체 drawing canvas를 가진 앱이 stroke를 Bézier 형태로 저장하고 있었다면 과거에는 PencilKit handwriting recognition을 직접 활용하기 어려웠다.

이제는 다음 흐름이 가능하다.

1. 앱의 Bézier stroke data 확보
2. 이를 `PKStrokePath`로 변환
3. `PKDrawing` 구성
4. `PKStrokeRecognizer`에 전달
5. handwriting recognition / indexing / search 사용

즉 **`PKCanvasView`를 사용하지 않는 앱도 PencilKit recognition을 사용할 수 있다.**

## Fidelity

Bézier path에는 PencilKit이 관리하는 다음 stroke property가 없다.

- size
- opacity
- force

따라서 Bézier → PencilKit 변환 시 control point에 이러한 속성을 앱이 제공해야 한다.

반대로 `PKStrokePath`를 Bézier로 바꾼 뒤 다시 PencilKit path로 변환하면 **control point 위치는 동일하게 유지**된다. 이를 통해 Bézier 기반 저장 포맷을 사용하면서도 PencilKit stroke를 fidelity 손실 없이 다시 구성할 수 있다.

---

# 🆔 Stable stroke identity

iOS 27에서는 `PKStroke`와 `PKStrokePath`가 모두 `Identifiable`을 준수한다.

Stroke identity는 **stable UUID**다. 이 ID는 다음 작업 이후에도 stroke를 추적할 수 있게 한다.

- transform
- edit
- undo

이전처럼 배열의 index나 임시 참조에 의존하지 않고 “이 stroke가 동일한 stroke인가”를 안정적으로 판단할 수 있다.

활용 예:

- 특정 stroke에 annotation 연결
- 서버/로컬 metadata와 stroke 연결
- custom selection model
- 편집 전후 stroke 추적
- undo/redo 이후 selection 복원

세션은 stable identity를 기반으로 drawing model에 더 깊게 접근하는 방향을 보여준다.

---

# 🖱️ Selection state 제어

iOS 27에서는 `PKCanvasView`의 **selection state를 앱에서 제어**할 수 있다.

또한 새 delegate callback인:

`canvasViewSelectionDidChange`

가 추가되어 사용자가 selection을 바꿀 때 앱이 이를 감지할 수 있다.

이는 custom inspector, contextual controls, selection metadata UI 등과 PencilKit의 selection을 동기화하는 기반이 된다.

예를 들어:

- 선택한 stroke의 속성 panel 표시
- 선택 영역에 custom action 제공
- app model의 selection과 canvas selection 동기화

등이 가능해진다.

---

# 🎨 Wet-ink rendering과 `renderGroupID`

PencilKit은 사용자가 특정 ink를 빠르게 연속해서 그릴 때 아직 마르지 않은 잉크처럼 보이도록 여러 stroke를 합성할 수 있다.

이러한 stroke에는 동일한 `renderGroupID`가 사용된다.

iOS 27에서는 이 `renderGroupID`를 앱이 제어할 수 있다. 따라서 PencilKit의 wet-ink compositing에 더 직접적으로 관여할 수 있다.

Transcript는 이 API의 존재와 제어 가능성을 소개하며, 구체적인 rendering algorithm이나 모든 설정 조합까지 설명하지는 않는다.

---

# ✂️ Stroke slicing

마지막 큰 주제는 stroke를 부분적으로 분할하는 API다. Apple은 두 가지 형태를 설명한다.

1. **Programmatic erasing**
2. **Substroke extraction**

둘은 결과와 목적이 다르다.

---

# 🧽 Programmatic erasing

PencilKit은 기존부터 stroke의 일부가 지워진 상태를 **stroke mask**로 표현했다. 사용자가 pixel eraser로 stroke의 일부를 지우면 남아 있는 영역이 mask로 정의된다.

iOS 27에서는 동일한 동작을 앱이 programmatically 수행할 수 있다.

앱은 **eraser 역할을 하는 `PKStrokePath`**를 전달하고, 이 path가 drawing을 가로지르며 stroke를 잘라낸다.

한 개의 stroke가 잘리면 여러 개의 독립된 stroke로 나뉘며 각각 자신의 mask를 가진다. 사용자 손으로 eraser tool을 사용한 것과 유사한 모델 결과를 얻는다.

## 성능 주의

Apple은 slicing이 복잡한 drawing에서 **비용이 클 수 있다**고 명시한다.

Stroke 수가 많은 drawing이라면 UI를 block하지 않도록 background thread에서 erasing을 수행하는 방식을 고려해야 한다.

중요한 점은 PencilKit의 API가 편리하다고 해서 복잡도 비용이 사라지는 것은 아니라는 것이다. 특히 대규모 drawing editor에서 batch erase를 구현한다면 responsiveness를 실제 데이터 규모에서 측정해야 한다.

---

# ✂️ Substroke extraction

Programmatic erasing이 원본 drawing을 시각적으로 잘라내는 작업이라면, **substroke extraction**은 stroke의 일부분을 효율적으로 새 stroke 또는 path로 얻는 기능이다.

iOS 27에서 `PKStroke`와 `PKStrokePath`는 **path상의 parametric range를 subscript로 접근**할 수 있다.

이를 통해 다음을 정확히 제어한다.

- slice 시작 위치
- slice 종료 위치
- stroke 일부만 추출

## Texture consistency

PencilKit ink에는 전체 stroke를 기준으로 배치되는 pencil texture particle 같은 rendering feature가 있다.

Substroke를 만들더라도 PencilKit은 이러한 particle의 일관성을 유지한다. 따라서 원본 stroke의 일부를 잘라 애니메이션하거나 재생해도 texture가 갑자기 달라지는 것을 방지한다.

---

# 🈶 Stroke order replay 예제

발표자는 중국어 글쓰기 학습 앱에서 **획순(stroke order)**을 검사하기 위해 substroke 기능을 사용한다.

중국어 문자는 단순히 최종 모양만 맞으면 되는 것이 아니라 stroke를 쓰는 순서가 중요하다. 앱은 작성한 stroke 일부를 순서대로 재생해 사용자가 어떻게 글자를 썼는지 보여준다.

PencilKit의 rendering은 Metal로 구현되어 있고 이러한 애니메이션이 부드럽게 동작하도록 최적화되어 있다고 설명한다.

이 예시는 substroke API가 단순한 “부분 복사” 용도를 넘어 다음에도 쓸 수 있음을 보여준다.

- handwriting replay
- drawing animation
- stroke-order education
- progressive reveal
- timeline scrubbing

---

# 🔗 전체 데이터 흐름 정리

PencilKit의 새 API를 기능별로 연결하면 다음 구조다.

```text
PKDrawing / strokes
      │
      ├─ PKStrokeRecognizer
      │     ├─ recognizedText()    → 가장 가능성 높은 결과
      │     ├─ indexableContent    → 검색 인덱스용 후보 문자열
      │     └─ search()            → 단어 위치와 bounds
      │
      ├─ PKStroke / PKStrokePath
      │     ├─ stable Identifiable ID
      │     ├─ Bézier path conversion
      │     └─ parametric substroke slicing
      │
      └─ PKCanvasView
            ├─ selection state control
            └─ canvasViewSelectionDidChange
```

이 구조의 핵심은 **recognition layer와 drawing model layer가 분리되어 있으면서 연결 가능하다**는 점이다.

따라서 PencilKit canvas를 직접 사용해도 되고, 자체 canvas에서 Bézier path를 관리하면서 recognition 부분만 PencilKit을 활용해도 된다.

---

# 📋 실무 적용 체크리스트

## Handwriting recognition

- [ ] `PKStrokeRecognizer`를 actor/async API로 다루기
- [ ] 앱의 언어 문맥이 명확하면 `preferredLanguages` 검토
- [ ] 실제 지원 언어는 `supportedLanguages`로 확인
- [ ] 비-Latin 언어는 Simulator만 믿지 말고 실제 기기에서 검증
- [ ] 전체 drawing 또는 특정 stroke ID 집합 중 필요한 범위를 선택
- [ ] UI 표시에는 `recognizedText()` 사용
- [ ] 검색 인덱스에는 `indexableContent` 사용

## Indexing

- [ ] `indexableContent`와 `recognizerVersion` 함께 저장
- [ ] recognizer version 변경 시 재색인
- [ ] derived data로 취급하고 원본 drawing을 보존
- [ ] 모든 stroke 변경마다 무조건 recognition하지 않기
- [ ] debounce/throttle 전략 수립

## Search / Accessibility

- [ ] `search()` 결과 bounds highlight 지원
- [ ] 필요 시 `UIFindInteractionDelegate`와 연결
- [ ] VoiceOver가 recognition result를 읽을 수 있도록 접근성 모델 구성
- [ ] 검색 결과를 assistive navigation과 연결할 수 있는지 검토

## Path conversion

- [ ] 기존 Bézier drawing 데이터를 `PKStrokePath`로 변환 가능한지 검토
- [ ] Bézier에 없는 size/opacity/force 값을 어떻게 공급할지 정의
- [ ] `PKCanvasView` 없이도 recognition을 활용할 수 있는 구조 고려
- [ ] round-trip 시 control point fidelity 요구사항 검증

## Drawing model

- [ ] `PKStroke`/`PKStrokePath`의 stable ID를 데이터 모델 key로 활용
- [ ] undo/transform 이후에도 stroke metadata 연결 유지
- [ ] canvas selection과 custom UI를 동기화
- [ ] `canvasViewSelectionDidChange`로 selection 변화 감지
- [ ] wet-ink 동작을 직접 제어해야 한다면 `renderGroupID` 검토

## Stroke slicing

- [ ] programmatic erasing과 substroke extraction의 목적 구분
- [ ] 복잡한 drawing에서 slicing 성능 측정
- [ ] 큰 drawing의 erase는 background 처리 검토
- [ ] parametric range를 이용한 animation/replay 설계
- [ ] substroke에서도 ink texture continuity 확인

---

# ⚠️ 구현 시 특히 주의할 점

### 1. `recognizedText`와 `indexableContent`를 같은 용도로 사용하지 않기

사용자에게 보여줄 “최선의 결과”와 검색 인덱스에 저장할 “가능한 후보”의 요구사항은 다르다.

### 2. 인덱싱 결과를 영구적인 정답으로 취급하지 않기

Recognition model은 OS와 함께 개선될 수 있으므로 `recognizerVersion`을 저장해 재색인할 수 있어야 한다.

### 3. Simulator의 언어 지원 범위를 실제 기기와 동일하다고 가정하지 않기

Simulator handwriting recognition은 Latin-character 언어에 제한된다.

### 4. Search 결과는 단순 문자열 matching이 아님

PencilKit은 handwriting candidate를 고려해 drawing 내부 위치를 찾고 bounds를 제공한다. Interactive highlight는 이 geometry를 활용한다.

### 5. Stroke slicing은 성능 비용이 있다

많은 stroke를 가진 drawing에서 programmatic erasing을 UI thread에 그대로 실행하면 responsiveness 문제가 생길 수 있다.

### 6. Bézier conversion이 모든 PencilKit 속성을 자동 보존하는 것은 아님

Control point geometry는 round-trip fidelity를 유지할 수 있지만, Bézier path 자체에는 size/opacity/force 같은 PencilKit-specific property가 없으므로 앱이 제공해야 한다.

---

# 🧠 세션이 전달하는 핵심 메시지

이번 PencilKit 업데이트의 가장 큰 의미는 **handwriting을 단순한 pixel/curve가 아니라 searchable, recognizable, interactive content로 취급할 수 있게 되었다는 것**이다.

`PKStrokeRecognizer`를 통해 손글씨가 텍스트 의미를 얻고, Bézier path conversion을 통해 PencilKit 외부의 custom drawing engine까지 recognition 범위가 확장된다. Stable stroke identity와 selection access는 custom editor 구축에 필요한 모델 수준의 제어를 제공하고, slicing API는 erase와 animation 같은 고급 편집을 가능하게 한다.

Apple이 세션 마지막에 제시하는 방향도 이 네 축으로 정리할 수 있다.

- `PKStrokeRecognizer`를 채택해 handwriting recognition 추가
- 기존 Bézier 기반 drawing도 PencilKit recognition에 연결
- stable identity와 selection으로 drawing model을 깊게 활용
- programmatic erasing과 substroke로 stroke-level editing/animation 확장

결국 iOS 27의 PencilKit은 **“그리는 UI”에서 “손글씨를 이해하고 조작하는 플랫폼”으로 범위를 넓힌다.**

---

# 🔗 함께 보면 좋은 공식 자료

- [Read between the strokes with PencilKit — WWDC26](https://developer.apple.com/videos/play/wwdc2026/203/)
- Apple Developer — Recognizing handwriting and converting it to text
- Apple Developer — Building a handwriting recognition experience with PencilKit
- Apple Developer — Importing Bézier path data into PencilKit
- Apple Developer — Controlling stroke rendering for animation and editing
- Apple Developer — PencilKit
- WWDC26 — Unwrap PaperKit
- WWDC25 — Meet PaperKit
- WWDC20 — Inspect, modify, and construct PencilKit drawings
