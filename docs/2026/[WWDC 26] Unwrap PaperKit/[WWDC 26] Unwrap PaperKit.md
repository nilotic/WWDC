# WWDC26 — Unwrap PaperKit

- **Session:** 372
- **Title:** Unwrap PaperKit
- **Source:** https://developer.apple.com/videos/play/wwdc2026/372/
- **Basis:** Apple Developer 공식 전체 transcript 및 Code 섹션
- **Platforms:** iOS 27, macOS 27, visionOS 27
- **Frameworks:** PaperKit, PencilKit, ImagePlayground

---

## 🎯 한 줄 요약

iOS, macOS, visionOS 27의 PaperKit은 Notes·Preview·Freeform에서 사용되던 캔버스 경험을 앱 개발자에게 더 깊게 개방한다. 핵심은 **`PaperMarkup.subelements`로 캔버스의 모든 요소를 읽고 수정하고, `MarkupInteractions`로 요소별 편집 권한을 제한하며, `MarkupAdornment`로 저장되지 않는 인터랙티브 UI를 캔버스 위에 얹는 것**이다.

---

## 🧭 세션 구성

| 시간 | 내용 |
|---|---|
| 0:00 | Introduction |
| 1:22 | Data model |
| 3:41 | Elements |
| 5:17 | Adornments |
| 7:11 | Next steps |

세션은 comic book editor 예제를 중심으로 진행된다. 템플릿 패널을 PaperKit 데이터로 만들고, 템플릿을 읽기 전용으로 고정하고, 색상을 바꾸고, 각 패널 위에 이미지 생성 버튼을 얹은 뒤 Image Playground에서 생성된 결과를 다시 PaperKit의 `ImageMarkup`으로 삽입한다.

---

# 🧩 PaperKit이 제공하는 캔버스

PaperKit은 Apple 플랫폼에서 이미 여러 앱의 캔버스 경험을 구성하는 기반이다.

- Notes에서 스케치, 이미지, 도형, 텍스트를 함께 다루는 캔버스
- Preview에서 PDF에 서명, 형광펜, 원 등의 markup을 추가하는 경험
- Freeform에서 자유롭게 객체를 배치하는 캔버스

WWDC26에서는 이 캔버스의 **data model과 interaction layer를 앱이 직접 제어할 수 있는 API**를 소개한다.

세션의 중심 객체는 `PaperMarkup`이다. 기존에는 PaperKit의 캔버스를 제공하는 수준에 가까웠다면, 새 API에서는 캔버스에 포함된 실제 요소를 읽고, 생성하고, 수정할 수 있다.

---

# 🗂️ Data model — `PaperMarkup.subelements`

## `PaperMarkup`의 새 `subelements`

`PaperMarkup`의 새 `subelements` 프로퍼티는 캔버스의 모든 요소를 `MarkupOrderedSet`으로 노출한다.

`MarkupOrderedSet`은:

- 순서를 보존하고
- 읽기 가능하며
- 쓰기도 가능한 컬렉션이다.

즉 PaperKit 캔버스를 단순한 렌더링 결과가 아니라 **수정 가능한 문서 모델**로 다룰 수 있다.

공식 예제는 comic page의 각 panel frame을 `ShapeMarkup`으로 만든다.

```swift
import PaperKit

func generateMarkup(
    pageSize: CGSize,
    panelFrames: [CGRect],
    configuration: ShapeConfiguration
) -> PaperMarkup {
    var markup = PaperMarkup(
        bounds: CGRect(origin: .zero, size: pageSize)
    )

    var subelements: MarkupOrderedSet = markup.subelements

    for panelFrame: CGRect in panelFrames {
        let shape = ShapeMarkup(
            frame: panelFrame,
            configuration: configuration
        )
        subelements.append(shape)
    }

    markup.subelements = subelements
    return markup
}
```

여기서 중요한 패턴은 다음과 같다.

1. `PaperMarkup` 생성
2. `markup.subelements`를 로컬 mutable 값으로 가져오기
3. 요소 생성 및 추가
4. 수정된 `subelements`를 다시 `markup.subelements`에 대입

세션의 다른 예제에서도 같은 패턴이 반복된다.

---

# 🔒 요소별 편집 권한 — `MarkupInteractions`

comic editor의 template panel은 사용자가 이동·삭제하면 안 된다. 기본 PaperKit canvas에서는 사용자가 패널도 선택하고, 이동하고, 삭제할 수 있기 때문에 템플릿 요소에 제한이 필요하다.

모든 canvas element는 `Markup` protocol을 따른다. 이 protocol은 공통적인 속성을 제공한다.

예:

- frame
- rotation
- allowed interactions

새 `allowedInteractions`는 `MarkupInteractions` option set이며, 요소별로 허용할 동작을 세밀하게 지정할 수 있다.

세션에서 언급한 제어 범위:

- moving
- resizing
- rotating
- deleting
- styling
- selecting

각 동작을 독립적으로 조합할 수 있고, 모든 편집을 한 번에 막고 싶다면 `.readOnly`를 사용한다.

공식 예제:

```swift
import PaperKit

func generateMarkup(
    pageSize: CGSize,
    panelFrames: [CGRect],
    configuration: ShapeConfiguration
) -> PaperMarkup {
    var markup = PaperMarkup(
        bounds: CGRect(origin: .zero, size: pageSize)
    )

    var subelements: MarkupOrderedSet = markup.subelements

    for panelFrame: CGRect in panelFrames {
        var shape = ShapeMarkup(
            frame: panelFrame,
            configuration: configuration
        )
        shape.allowedInteractions = .readOnly
        subelements.append(shape)
    }

    markup.subelements = subelements
    return markup
}
```

이렇게 하면 템플릿 panel은 고정되지만, 사용자가 추가한 speech bubble이나 다른 markup은 여전히 선택·이동·스타일 변경이 가능하다.

### 실무적으로 의미하는 점

`PaperMarkup` 전체를 read-only로 잠그는 방식이 아니라 **문서 내부 요소마다 interaction policy를 다르게 둘 수 있다.**

예를 들어:

- 배경 템플릿: `.readOnly`
- 사용자 이미지: 이동/크기 변경 허용
- 텍스트 label: 선택·스타일 변경 허용
- 시스템 annotation: 선택만 허용

같은 캔버스 안에서도 역할에 따라 behavior를 구분할 수 있다.

---

# 🎨 Elements — concrete markup type 다루기

`MarkupOrderedSet` 안의 모든 요소는 `Markup` protocol을 따르지만 실제 객체는 구체적인 타입을 가진다.

세션에서 언급된 element type:

- shapes
- images
- links
- loupes
- Pencil strokes

공통 속성은 `Markup`으로 접근하지만, 타입별 세부 속성은 concrete type으로 내려가서 수정한다.

예를 들어 shape는:

- stroke color
- fill color
- corner radius
- control points

같은 자체 속성을 가진다.

## Template shape의 색상 변경

comic panel은 rectangle `ShapeMarkup`으로 만들어져 있으므로 `ShapeMarkup`으로 cast한 뒤 stroke/fill을 수정한다.

공식 예제:

```swift
import PaperKit

func updatePanelColor(_ selectedColor: CGColor) {
    guard var markup: PaperMarkup = paperMarkupViewController.markup else {
        return
    }

    var subelements: MarkupOrderedSet = markup.subelements

    for element in subelements {
        guard var shape = element as? ShapeMarkup else {
            continue
        }

        shape.strokeColor = selectedColor
        shape.fillColor = selectedColor.copy(alpha: 0.15)
        subelements.updateOrAppend(shape)
    }

    markup.subelements = subelements
    markup.backgroundColor = selectedColor.copy(alpha: 0.15)
    paperMarkupViewController.markup = markup
}
```

중요한 부분은 `subelements.updateOrAppend(shape)`이다. 컬렉션 안의 기존 요소를 수정한 새 value로 반영한다.

이 예제에서는 panel의 stroke/fill과 `PaperMarkup.backgroundColor`를 함께 맞춰 comic page 전체의 색감을 변경한다.

---

# ✏️ PencilKit과의 연결

PaperKit은 PencilKit 위에 구축되어 있다. 사용자가 Apple Pencil로 그린 stroke 역시 PaperKit의 markup element가 된다.

따라서 PencilKit의 모델 API를 그대로 활용할 수 있다.

세션은 WWDC26에서 PencilKit 모델 API가 다음 기능을 지원한다고 연결해서 설명한다.

- character recognition
- Bézier path conversion

이에 대한 자세한 내용은 관련 세션 **Read between the strokes with PencilKit**에서 다룬다.

즉 PaperKit canvas 안에서 Pencil stroke도 다른 markup element와 함께 프로그램적으로 다룰 수 있다.

---

# 🧷 Adornments — 저장되지 않는 인터랙티브 오버레이

세션 후반의 핵심 기능은 `MarkupAdornment`다.

comic editor에서는 각 panel 가운데에 **이미지 생성 버튼**을 띄우고 싶다. 하지만 이 버튼은 document content가 아니다.

즉:

- 저장되면 안 되고
- 인쇄되면 안 되고
- export 결과에도 포함되면 안 되며
- 편집 중에만 canvas 위에 보여야 한다.

이 역할을 `MarkupAdornment`가 담당한다.

## Adornment의 성격

Adornment는 canvas coordinate에 anchor되는 visual overlay다.

적합한 용도:

- 버튼
- annotation UI
- collaboration UI
- temporary editing controls

그리고 중요한 특징이 있다.

- zoom을 따라간다.
- scroll을 따라간다.
- persisted markup과 완전히 분리된다.

즉 문서 모델에 섞이지 않는 **editor-only interaction layer**다.

---

# ➕ Panel마다 `MarkupAdornment` 추가

공식 예제에서는 각 panel 중앙에 `photo.badge.plus` SF Symbol을 표시하는 adornment를 생성한다.

```swift
import PaperKit

func addPanelAdornments(for page: Page) {
    var adornments: [MarkupAdornment] = []

    for (panelIndex, panel) in page.panels.enumerated() {
        let adornmentID = UUID()
        adornmentPanelMapping[adornmentID] = panelIndex

        let center = CGPoint(
            x: panel.midX,
            y: panel.midY
        )

        let adornment = MarkupAdornment(
            id: adornmentID,
            anchor: .canvas(location: center),
            imageConfiguration: .systemImage("photo.badge.plus"),
            dragRegion: .fixed,
            scalesWithZoom: false
        )

        adornments.append(adornment)
    }

    paperMarkupViewController.adornments = adornments
}
```

### 코드에서 볼 수 있는 설정

- `id`: adornment를 구분하기 위한 UUID
- `anchor: .canvas(location:)`: canvas 좌표에 고정
- `imageConfiguration`: SF Symbol 사용
- `dragRegion: .fixed`: drag 영역 고정
- `scalesWithZoom: false`: zoom 시 버튼 자체 크기는 확대하지 않음

그리고 `adornmentPanelMapping`으로 각 adornment ID를 실제 comic panel index와 연결한다.

이렇게 editor-specific UI와 document element를 분리하면서도 canvas 내부 위치와 안정적으로 연결할 수 있다.

---

# 👆 Adornment tap 처리

Adornment가 눌리면 `PaperMarkupViewController` delegate callback으로 이벤트를 받는다.

공식 예제:

```swift
import ImagePlayground
import PaperKit

func paperMarkupViewController(
    _ paperMarkupViewController: PaperMarkupViewController,
    didTapAdornmentWithID id: UUID
) {
    guard let panelIndex = adornmentPanelMapping[id] else {
        return
    }

    activeImageGenerationPanelIndex = panelIndex

    let imagePlaygroundViewController = ImagePlaygroundViewController()
    imagePlaygroundViewController.delegate = self
    present(imagePlaygroundViewController, animated: true)
}
```

흐름은:

1. tap된 adornment ID 확인
2. 대응하는 panel 찾기
3. 현재 이미지 생성 대상 panel 저장
4. `ImagePlaygroundViewController` 표시

Adornment가 단순한 시각적 overlay가 아니라 앱의 action entry point가 되는 구조다.

---

# 🖼️ Image Playground 결과를 `ImageMarkup`으로 삽입

Image Playground에서 결과가 돌아오면, 생성된 이미지를 PaperKit 문서에 실제 content로 넣는다.

공식 예제:

```swift
import ImagePlayground
import PaperKit

func imageViewController(
    _ imageViewController: ImagePlaygroundViewController,
    didCreateImageAt imageURL: URL
) {
    guard let panelFrame = activeGenerationPanelFrame,
          let paperMarkupViewController = pageViewController.paperViewController,
          var markup = paperMarkupViewController.markup,
          let image = UIImage(contentsOfFile: imageURL.path) else {
        return
    }

    let imageMarkup = ImageMarkup(
        frame: panelFrame,
        image: image
    )

    markup.subelements.append(imageMarkup)
    paperMarkupViewController.markup = markup
}
```

여기서 editor-only adornment와 persisted content가 명확히 구분된다.

- `MarkupAdornment`: 편집 UI, document에 저장되지 않음
- `ImageMarkup`: 실제 document content, markup에 저장됨

이 분리가 PaperKit 기반 custom editor를 설계할 때 중요한 구조적 포인트다.

---

# 🔄 세션 전체 데이터 흐름

```text
Template data
   ↓
PaperMarkup(bounds:)
   ↓
MarkupOrderedSet
   ↓
ShapeMarkup 생성
   ↓
allowedInteractions = .readOnly
   ↓
PaperMarkupViewController.markup
   ↓
사용자 편집
   ├─ Pencil stroke → markup element
   ├─ shape/image/text 등 수정
   └─ adornment tap
          ↓
  ImagePlaygroundViewController
          ↓
      생성 이미지
          ↓
       ImageMarkup
          ↓
   markup.subelements.append(...)
```

---

# 🧠 API별 역할 정리

| API | 역할 |
|---|---|
| `PaperMarkup` | PaperKit 문서/캔버스 데이터 모델 |
| `PaperMarkup.subelements` | 캔버스 요소 전체를 읽고 수정하는 ordered set |
| `MarkupOrderedSet` | markup element의 순서를 유지하는 mutable collection |
| `Markup` | 모든 markup element의 공통 protocol |
| `MarkupInteractions` | move/resize/rotate/delete/style/select 등의 허용 여부 |
| `.readOnly` | 편집 interaction 전체를 한 번에 차단 |
| `ShapeMarkup` | shape element |
| `ImageMarkup` | image element |
| `MarkupAdornment` | document와 분리된 canvas overlay |
| `PaperMarkupViewController.adornments` | 현재 표시할 adornment 목록 |
| `didTapAdornmentWithID` | adornment tap callback |
| `ImagePlaygroundViewController` | Image Playground UI |

---

# 🏗️ 설계 관점에서 중요한 점

## Document model과 editor UI를 분리한다

PaperKit의 새 API는 두 레이어를 명확히 나눈다.

### Persisted model

- ShapeMarkup
- ImageMarkup
- Pencil stroke
- Link
- Loupe
- 그 밖의 실제 문서 content

### Ephemeral editor UI

- `MarkupAdornment`
- contextual buttons
- collaboration marker
- temporary controls

이 구분 덕분에 editor UI가 print/export/save 결과를 오염시키지 않는다.

## 요소 자체에 interaction policy를 둔다

템플릿인지 사용자 content인지에 따라 별도의 container를 만들 필요 없이 각 markup element의 `allowedInteractions`에서 권한을 제어할 수 있다.

## `subelements`를 중심으로 일관된 mutation 모델을 사용한다

세션 코드에서는 반복적으로:

1. markup 가져오기
2. subelements 복사
3. element 수정
4. subelements 반영
5. markup 재할당

패턴을 사용한다.

PaperKit custom editor에서 state mutation을 추적할 때 이 흐름을 기준으로 구조화하기 좋다.

---

# 📋 구현 체크리스트

## Data model

- [ ] `PaperMarkup(bounds:)`로 문서 좌표계 정의
- [ ] `subelements`를 통해 template/content element 생성
- [ ] 요소의 ordering이 중요하면 `MarkupOrderedSet` 순서 유지
- [ ] concrete type으로 cast할 때 지원 타입별 처리 분리
- [ ] 수정된 element는 collection에 다시 반영
- [ ] 변경 후 controller의 `markup`을 갱신

## Interaction policy

- [ ] Template/guide element의 `allowedInteractions` 검토
- [ ] 완전히 고정해야 하는 element는 `.readOnly`
- [ ] 선택만 허용할지, 스타일 변경도 허용할지 구분
- [ ] 사용자 생성 content와 app-owned template의 권한 차등

## Adornments

- [ ] document에 저장되면 안 되는 UI인지 먼저 판단
- [ ] canvas 좌표 anchor 설정
- [ ] zoom 시 크기 유지 여부 결정
- [ ] adornment ID와 앱 model 간 mapping 유지
- [ ] `didTapAdornmentWithID`에서 실제 action 연결
- [ ] export/print/save 결과에서 adornment가 빠지는지 확인

## Image Playground 연동

- [ ] 선택한 panel/context를 generation 시작 전에 저장
- [ ] callback에서 image URL을 안전하게 읽기
- [ ] 결과를 `ImageMarkup`으로 변환
- [ ] 원하는 frame에 삽입
- [ ] `subelements` 갱신 후 controller에 반영

## PencilKit 연동

- [ ] Pencil stroke가 markup element로 들어오는 구조 이해
- [ ] character recognition이 필요한 경우 PencilKit API 검토
- [ ] Bézier path 변환이 필요한 경우 관련 PencilKit 세션/API 검토

---

# ⚠️ 세션이 명확히 보여주는 제약과 주의점

### Adornment는 document content가 아니다

Adornment는 저장·print·export 대상으로 만들려는 기능이 아니다. 실제 문서 요소가 필요하면 `ShapeMarkup`, `ImageMarkup` 등의 concrete markup type을 사용해야 한다.

### 모든 요소가 같은 concrete type은 아니다

`MarkupOrderedSet`은 여러 타입을 함께 담는다. 따라서 style 변경 시 예제처럼 `as? ShapeMarkup` 등으로 원하는 concrete type만 처리해야 한다.

### Template과 content를 interaction policy로 구분한다

세션은 별도의 overlay document를 만드는 대신 `allowedInteractions`로 template 요소를 고정한다. 즉 custom editor에서의 편집 가능 여부는 데이터 모델 레벨에서 표현할 수 있다.

---

# 🔗 함께 보면 좋은 세션

## WWDC26 — Read between the strokes with PencilKit

PaperKit이 PencilKit 위에 만들어져 있기 때문에 다음 기능을 함께 이해하면 좋다.

- handwriting/character recognition
- stroke model 접근
- Bézier path conversion

## WWDC26 — Create high-quality images using Image Playground

PaperKit adornment에서 Image Playground를 실행하고, 생성 결과를 `ImageMarkup`으로 삽입하는 예제와 직접 연결된다.

## WWDC25 — Meet PaperKit

PaperKit 자체의 기본적인 canvas integration과 framework introduction을 먼저 보고, 이번 WWDC26 세션에서 새 data model과 adornment 제어를 확장해서 보는 흐름이 좋다.

---

# 🧠 핵심 메시지

PaperKit의 WWDC26 변화는 **“완성된 canvas UI를 가져다 쓰는 framework”에서 “canvas 내부 데이터와 편집 정책까지 앱이 직접 설계하는 framework”로 확장된 것**으로 볼 수 있다.

특히 세 가지가 중요하다.

1. **`PaperMarkup.subelements`** — canvas 전체 요소를 실제 문서 모델로 읽고 수정
2. **`MarkupInteractions`** — 각 요소별로 편집 가능 범위를 세밀하게 지정
3. **`MarkupAdornment`** — document와 분리된 interactive editing UI 구축

이 세 가지를 조합하면 템플릿 기반 편집기, annotation 도구, collaboration canvas, custom design tool처럼 PaperKit의 기본 UX를 유지하면서도 앱 목적에 맞는 전문적인 canvas 경험을 만들 수 있다.
