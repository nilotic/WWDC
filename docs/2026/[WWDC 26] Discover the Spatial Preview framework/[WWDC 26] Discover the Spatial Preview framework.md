# WWDC26 Discover the Spatial Preview framework 요약

- Session: 282
- Title: Discover the Spatial Preview framework
- Source: https://developer.apple.com/videos/play/wwdc2026/282/
- Topic: Spatial Preview, visionOS, macOS, Quick Look, USDKit, OpenUSD, Mac Virtual Display, SharePlay
- Chapters: Introduction, Learn about Spatial Preview, Document Preview, USD Preview, Editing Features, Next steps

---

## 한 줄 요약

Spatial Preview는 Mac 앱의 문서와 3D 콘텐츠를 Vision Pro의 Quick Look로 직접 보내고, 문서 교체·USD 장면 실시간 동기화·양방향 편집·주석·오브젝트 조작·애니메이션 재생·SharePlay 협업까지 지원해 macOS 제작 도구를 공간형 검토 환경으로 확장하는 프레임워크다.

---

## 핵심 요약

Spatial Preview는 macOS 앱의 콘텐츠를 Vision Pro로 보내 공간형 검토 및 편집 워크플로를 만들 수 있게 한다.

- **Endpoint 선택**
  - Mac Virtual Display로 연결된 Vision Pro 사용
  - 또는 `SpatialPreviewDevicePicker`로 같은 iCloud 계정의 근처 Vision Pro 선택

- **Document Preview**
  - Spatial photo, video, Apple Immersive Video frame, PDF, 일반 이미지와 파일
  - `start(endpoint:)`, `updateContents(url:)`, session state 관찰, `close()`
  - 같은 scene을 유지하면서 gallery 콘텐츠 교체

- **USD Preview**
  - `USDKit`의 `USDStage` 사용
  - Bounded volume과 immersive full-scale view
  - Camera viewpoints, wireframe material override
  - 자동 mesh decimation, texture downsampling, 필요 시 scene reconstruction
  - `.unmodified`로 optimization opt-out 가능

- **양방향 편집**
  - Mac에서 USDKit으로 수정한 stage가 visionOS에 자동 반영
  - Vision Pro에서 변경한 variant, annotation, object transform이 Mac으로 반영
  - Standard USD notice로 바뀐 prim path 관찰

- **협업**
  - Annotation, object manipulation, USD export
  - Animation time과 playback state event
  - Session progress
  - SharePlay 기반 실시간 공동 검토

Vision Pro 측 companion 앱은 별도로 만들 필요가 없다. Mac 앱이 session을 시작하면 visionOS Quick Look가 콘텐츠와 기본 편집 기능을 제공한다.

---

# 🥽 Spatial Preview란?

Spatial Preview는 Mac에서 작업 중인 콘텐츠를 visionOS의 공간 안으로 확장하는 framework다.

Mac Virtual Display로 Mac을 계속 조작하면서 Vision Pro에서는 다음을 할 수 있다.

- 3D scene을 실제 scale에 가깝게 확인
- 여러 camera viewpoint로 이동
- Geometry를 wireframe으로 검토
- Material과 layout 변경을 실시간 확인
- Scene에 annotation 추가
- Object를 직접 이동

Mac은 authoring surface, Vision Pro는 spatial review와 interaction surface 역할을 한다.

---

# 🔄 기본 동작 구조

기본 단계는 다음과 같다.

```text
Spatial Preview Endpoint 선택
        ↓
Preview Session 생성
        ↓
Session 시작
        ↓
visionOS Quick Look 실행
        ↓
Content 표시와 편집
```

Session은 콘텐츠 종류에 따라 두 가지다.

- `DocumentPreviewSession`
- `USDPreviewSession`

---

# 📡 Endpoint 선택

## Mac Virtual Display Endpoint

사용자가 이미 Mac Virtual Display를 사용 중이면 `ConnectedSpatialEndpointObserver`에서 연결된 endpoint를 얻을 수 있다.

## Device Picker

Mac Virtual Display가 활성화되지 않았을 수 있으므로 `SpatialPreviewDevicePicker`를 앱에 제공하는 것이 좋다.

```swift
@State private var showDevicePicker = false

.sheet(isPresented: $showDevicePicker) {
    SpatialPreviewDevicePicker(
        isPresented: $showDevicePicker
    ) { endpoint in
        showDevicePicker = false
        Task {
            try await startPreview(
                contentURL: contentURL,
                endpoint: endpoint
            )
        }
    }
}
```

같은 iCloud 계정의 근처 Vision Pro 중에서 사용자가 대상을 고를 수 있다.

---

# 📄 Document Preview Session

문서와 파일 형태의 콘텐츠에 사용한다.

지원 예:

- Spatial photos
- Apple Immersive Video frames
- Standard video
- PDF
- Standard image
- 일반 파일

기본 코드는 다음과 같다.

```swift
import SpatialPreview

let previewSession = DocumentPreviewSession(
    name: "Immersive.aivu",
    contentType: .aivu
)

func startPreview(
    contentURL: URL,
    endpoint: SpatialPreviewEndpoint
) async throws {
    try await previewSession.start(endpoint: endpoint)
    try await previewSession.updateContents(url: contentURL)
}
```

Session이 시작되면 Vision Pro에서 Quick Look scene이 열리고 콘텐츠가 표시된다.

---

# 🖼️ 같은 Scene에서 Gallery 구성

여러 rendering을 순서대로 보여줄 때마다 새 session을 만들면 새로운 scene이 열린다.

같은 scene을 유지하려면 `updateContents(url:)`를 사용한다.

```swift
ForEach(contentURLs, id: \.self) { url in
    Button {
        Task {
            try await previewSession?
                .updateContents(url: url)
        }
    }
}
```

| 동작 | 결과 |
|---|---|
| 새 session 생성 후 `start()` | 새로운 scene 실행 |
| 기존 session에서 `updateContents()` | 같은 scene의 콘텐츠 교체 |

Architectural rendering gallery나 여러 spatial image 비교에 적합하다.

---

# 👀 Session State 관찰

사용자가 Vision Pro에서 scene을 닫으면 session이 invalidated된다.

```swift
.task(id: previewSession.map { ObjectIdentifier($0) }) {
    guard let session = previewSession else { return }

    for await state in Observations({ session.state }) {
        if state.isInvalidated {
            previewSession = nil
            break
        }
    }
}
```

Mac UI의 상태도 실제 visionOS session lifecycle에 맞춰 정리할 수 있다.

사용이 끝났다면 다음을 호출한다.

```swift
try await previewSession?.close()
```

Quick Look scene도 자동으로 닫힌다.

---

# 🧊 USD Preview Session

3D 콘텐츠는 `USDPreviewSession`을 사용한다.

```swift
import SpatialPreview
import USDKit

func shareStage(
    to endpoint: SpatialPreviewEndpoint
) async throws -> USDPreviewSession {
    let stageURL = Bundle.main.url(
        forResource: "sampleScene",
        withExtension: "usdz"
    )!

    let stage = try USDStage.open(stageURL)
    let session = USDPreviewSession(stage: stage)

    try await session.start(endpoint: endpoint)
    return session
}
```

Vision Pro에서는 먼저 bounded volumetric view에 나타난다.

사용자는 scene을 회전해 살펴본 다음 immersive view로 전환해 full scale에서 확인할 수 있다.

---

# 🎥 Built-in Camera Viewpoints

USD scene에 camera가 포함되어 있으면 Quick Look에서 camera viewpoint를 선택할 수 있다.

Mac 앱에서 visionOS용 camera UI를 별도로 구현하지 않아도 된다.

Architecture와 interior scene의 주요 검토 위치를 미리 제공할 수 있다.

---

# 🕸️ Material Override

Quick Look는 material override도 제공한다.

세션에서는 wireframe mode를 사용해 geometry를 자세히 확인한다.

활용 예:

- Mesh topology
- Geometry density
- Scene structure
- Object intersection

이 역시 기본 Spatial Preview experience에 포함된다.

---

# ⚙️ 자동 Asset Optimization

고품질 USD scene은 Vision Pro에서 직접 렌더링하기에 너무 복잡할 수 있다.

Spatial Preview는 기본적으로 다음 최적화를 수행한다.

- Mesh decimation
- Texture downsampling
- 필요 시 full scene reconstruction

목적은 Vision Pro에서 안정적으로 표시하는 것이다.

Scene이 reconstruction되면 원본 USD object 단위 편집은 불가능할 수 있지만, scene viewing과 annotation은 계속 가능하다.

---

# 🚫 Optimization 비활성화

원본 USD를 수정 없이 보내려면 `.unmodified`를 전달한다.

```swift
do {
    try await usdSession.start(
        endpoint: endpoint,
        parameters: .unmodified
    )
} catch USDPreviewSession.Error.assetUnshareable {
    // 원본 상태로 공유할 수 없는 asset 처리
}
```

원본 scene이 Vision Pro의 rendering budget을 넘으면 `assetUnshareable` 오류가 발생할 수 있다.

| 전략 | 장점 | 주의점 |
|---|---|---|
| 기본 optimization | 높은 공유 성공률과 성능 | Reconstruction 시 editability 제한 가능 |
| `.unmodified` | 원본 fidelity와 structure 유지 | 복잡한 scene은 공유 실패 가능 |

---

# 🔄 Live USD Stage

USD Preview는 live stage를 사용한다.

Mac의 일반 USDKit API로 stage를 수정하면 visionOS에 자동 동기화된다.

Vision Pro에서 발생한 변경도 Mac의 stage로 돌아온다.

```text
macOS USDKit Stage
        ⇅
Spatial Preview Session
        ⇅
visionOS Quick Look
```

---

# 🧱 USD Stage와 Prim

USD stage는 하나 이상의 layer로 구성되고, layer는 USD prim을 포함한다.

Prim은 다음을 표현할 수 있다.

- Transform
- Mesh
- Camera
- Material
- Annotation 관련 데이터

Variant set은 하나의 prim에 여러 대체 구성을 제공한다.

---

# 🔀 Layout Variants

Living room scene은 furniture layout을 variant로 구성한다.

```usda
over "furniture" (
    variantSets = "Layout"
    variants = { string Layout = "LayoutA" }
)
{
    variantSet "Layout" = {
        "LayoutA" {
            # 기본 배치
        }
        "LayoutB" {
            # 다른 위치와 회전
        }
    }
}
```

Mac 앱에서 variant를 바꾸는 예:

```swift
func applyLayoutVariant(named name: String) throws {
    let prim = stage.prim(
        at: SdfPath("/root/furniture")
    )

    try prim.variantSets?
        .setSelection(
            "Layout",
            variantName: name
        )
}
```

변경된 furniture layout은 Vision Pro에 즉시 반영된다.

Vision Pro Quick Look에서 variant를 선택한 경우에도 Mac에 반영된다.

---

# 👂 Vision Pro의 변경 관찰

Stage 변경은 자동 동기화되며, Mac 앱은 standard USD notice를 관찰할 수 있다.

```swift
observerToken = stage.addObserver(
    for: UsdStage.ObjectsDidChange.self
) { notice in
    for path in notice.resyncedPaths {
        let prim = notice.stage.prim(at: path)
        guard prim.isValid else { continue }

        if prim.isAnnotation {
            // Mac UI의 annotation 목록 갱신
        }
    }
}
```

Live stage 자체는 동기화되지만 annotation list나 inspector 같은 앱 UI는 notice를 받아 갱신해야 한다.

---

# 📝 Annotation

Text annotation에는 다음 정보가 포함될 수 있다.

```text
AppleTextAnnotation {
    string text
    uniform string author
    uniform string identifier
}
```

필요 정보:

- 실제 note text
- Author
- 앱의 tracking system에서 사용하는 unique ID

Annotation prim은 지정된 document annotation group의 child여야 Vision Pro에 표시된다.

```text
/__documentAnnotationGroup__
```

Mac에서 추가한 annotation은 Vision Pro에 나타나고, Vision Pro에서 작성한 comment는 Mac 앱으로 돌아온다.

---

# ✋ Object Manipulation

Vision Pro에서 gesture로 prim을 이동하려면 spatial editable metadata가 필요하다.

```usda
customData = {
    dictionary apple = {
        bool spatialEditable = 1
    }
}
```

이 metadata가 있는 prim은 Quick Look에서 선택하고 움직일 수 있다.

Vision Pro에서 변경된 transform은 Mac의 stage에도 반영된다.

macOS Preview 앱으로 asset에 이 metadata를 설정할 수도 있다.

---

# ⚙️ Session Options

USD Preview를 시작할 때 Quick Look에서 허용할 feature를 제어할 수 있다.

기본적으로 다음이 활성화된다.

- Annotations
- Per-object manipulation
- USD export

명시적 설정 예:

```swift
try await session.start(
    endpoint: endpoint,
    options: [
        .annotations,
        .perObjectManipulation,
        .export
    ]
)
```

앱의 review 정책에 따라 사용 가능한 기능을 제한할 수 있다.

---

# ▶️ Animation Events

Spatial Preview session은 USD notice 외의 event도 제공한다.

예:

- Playback time 변경
- Playback state 변경

```swift
func listenForEvents(
    session: USDPreviewSession
) async {
    for await event in session.events {
        if case .timeChanged(let time) = event {
            playbackModel.timeCode = time
        } else if case
            .playbackStateChanged(let isPlaying) = event {
            playbackModel.playbackStateChanged(isPlaying)
        }
    }
}
```

Mac과 Vision Pro가 같은 animation time과 play/pause 상태를 공유할 수 있다.

---

# 📊 Session Progress

대형 scene 동기화에는 시간이 걸릴 수 있다.

Session의 progress를 관찰해 Mac UI에 loading bar를 표시할 수 있다.

```swift
@State private var sessionProgress = 0.0

.task(id: usdSession.map { ObjectIdentifier($0) }) {
    guard let session = usdSession else { return }

    for await fraction in Observations({
        session.progress.fractionCompleted
    }) {
        sessionProgress = fraction
    }
}
.overlay(alignment: .bottom) {
    ProgressView(value: sessionProgress)
        .padding()
}
```

---

# 👥 SharePlay Collaboration

Spatial Preview의 visionOS experience에는 SharePlay 지원이 내장되어 있다.

여러 사용자가 같은 live session에 참여해 다음을 할 수 있다.

- 같은 scene 검토
- Annotation 추가
- Layout variant 변경
- Object 이동
- 실시간 수정 결과 공유

한 참가자가 layout 문제를 표시하고 다른 참가자가 바로 수정하면 모든 participant의 view가 즉시 업데이트된다.

Traditional asset review의 파일 전달과 반복적인 feedback cycle을 줄일 수 있다.

---

# 🔌 기존 USD Runtime 연동

Spatial Preview는 `USDKit`과 가장 자연스럽게 동작한다.

Mac 앱이 이미 자체 USD runtime이나 별도 USD installation을 사용한다면, 해당 runtime의 edit와 USDKit stage 사이에 bridge를 구성할 수 있다.

Apple은 이를 위한 별도 developer documentation을 제공한다.

---

# 🧩 Document Preview와 USD Preview 비교

| 항목 | Document Preview | USD Preview |
|---|---|---|
| 입력 | File URL | `USDStage` |
| 콘텐츠 | Image, PDF, video, spatial media | 3D USD scene |
| 콘텐츠 갱신 | `updateContents(url:)` | USDKit stage edit |
| 같은 scene 재사용 | 지원 | Live stage 자체가 유지 |
| Camera viewpoint | 콘텐츠 유형 의존 | Built-in |
| Wireframe/material override | 해당 없음 | Built-in |
| Object manipulation | 해당 없음 | Metadata 기반 |
| Variant | 해당 없음 | USD variant set |
| Annotation | Quick Look 지원에 따름 | USD annotation structure |
| 양방향 editing | 문서 교체 중심 | Stage level live sync |
| Optimization | 콘텐츠 유형별 | Mesh, texture, reconstruction |

---

# 🔁 구현 흐름

## Document Preview

```text
Endpoint 선택
      ↓
DocumentPreviewSession 생성
      ↓
start(endpoint:)
      ↓
updateContents(url:)
      ↓
state 관찰
      ↓
close()
```

## USD Preview

```text
Endpoint 선택
      ↓
USDKit으로 Stage load
      ↓
USDPreviewSession 생성
      ↓
start(endpoint:)
      ↓
Bounded / Immersive Review
      ↓
Mac ↔ Vision Pro Live Editing
      ↓
Events / Progress
      ↓
SharePlay Collaboration
```

---

# 📋 체크리스트

## Endpoint

- [ ] Mac Virtual Display endpoint 사용 가능 여부 확인
- [ ] 연결되지 않은 경우 Device Picker 제공
- [ ] 같은 iCloud 계정의 Vision Pro 선택 흐름 테스트
- [ ] Picker endpoint와 observer endpoint 사용 경로 구분
- [ ] 연결 해제와 device disappearance 처리

## Document Preview

- [ ] 올바른 `contentType` 지정
- [ ] 의미 있는 session name 설정
- [ ] `start(endpoint:)` 호출
- [ ] `updateContents(url:)`로 콘텐츠 전달
- [ ] Gallery에서 새 session을 반복 생성하지 않기
- [ ] Session invalidation 관찰
- [ ] 사용 종료 시 `close()`
- [ ] 지원할 실제 image, PDF, video, spatial media 테스트

## USD Preview

- [ ] `USDKit`으로 stage load
- [ ] `USDPreviewSession(stage:)` 생성
- [ ] Bounded view와 immersive view 테스트
- [ ] Camera viewpoint 노출 확인
- [ ] Material override 확인
- [ ] Scene complexity 측정

## Optimization

- [ ] 기본 optimization 결과 확인
- [ ] Mesh decimation의 품질 영향 확인
- [ ] Texture downsampling 영향 확인
- [ ] Reconstruction 발생 가능성 검토
- [ ] Reconstruction 시 editing 제한 반영
- [ ] `.unmodified` 필요 여부 검토
- [ ] `assetUnshareable` 오류 처리
- [ ] 원본 공유가 필요하면 rendering cost 직접 절감

## Live Editing

- [ ] Mac edit가 Vision Pro에 반영되는지 확인
- [ ] Vision Pro edit가 Mac에 반영되는지 확인
- [ ] Variant set 구성과 selection 테스트
- [ ] `ObjectsDidChange` notice 처리
- [ ] 변경된 prim path 기반 Mac UI 갱신
- [ ] 동시 edit conflict 정책 검토

## Annotation

- [ ] Text, author, identifier 구성
- [ ] Document annotation group에 포함
- [ ] Mac → visionOS sync
- [ ] visionOS → Mac sync
- [ ] Annotation 수정과 삭제 lifecycle 처리

## Object Manipulation

- [ ] 조작 가능한 prim에 `spatialEditable` metadata 설정
- [ ] 조작하면 안 되는 prim은 제외
- [ ] Gesture 이동 결과의 transform sync 확인
- [ ] Scene constraint와 허용 범위 검토

## Session Options와 Events

- [ ] Annotation 허용 여부 결정
- [ ] Per-object manipulation 허용 여부 결정
- [ ] USD export 허용 여부 결정
- [ ] Playback time event 처리
- [ ] Playback state event 처리
- [ ] Large session progress UI 제공
- [ ] 전송 실패와 취소 처리

## Collaboration

- [ ] SharePlay 참가 흐름 테스트
- [ ] Participant별 annotation author 표시
- [ ] 여러 participant edit 반영 확인
- [ ] 실시간 layout update 검증
- [ ] Collaboration conflict 정책 검토

---

# ⚠️ 구현 시 주의할 점

## Vision Pro 앱을 별도로 만들 필요가 없다

Mac 앱이 Spatial Preview session을 시작하면 visionOS Quick Look가 콘텐츠를 표시하고 기본 기능을 제공한다.

## `start`와 `updateContents`는 목적이 다르다

`start`는 scene을 실행하고, `updateContents`는 기존 document scene의 콘텐츠를 교체한다.

## Optimization과 Editability는 trade-off다

복잡한 scene은 reconstruction될 수 있고 object-level editing이 제한될 수 있다. `.unmodified`를 사용하면 원본을 유지하지만 공유 자체가 실패할 수 있다.

## USD Stage 동기화와 앱 UI 갱신은 다르다

Stage는 자동 동기화되지만 annotation list 같은 Mac UI는 USD notice를 관찰해 직접 갱신해야 한다.

## Object manipulation은 metadata opt-in이다

모든 prim이 자동으로 편집 가능하지 않다. `spatialEditable` metadata가 있는 prim만 Quick Look에서 gesture로 조작할 수 있다.

---

# 핵심 메시지

Spatial Preview는 Mac의 authoring workflow와 Vision Pro의 scale, depth, spatial interaction을 하나의 live session으로 연결한다.

Document Preview는 이미지, PDF, video, spatial media를 Quick Look로 보내고 같은 scene에서 콘텐츠를 교체한다.

USD Preview는 `USDKit` stage를 공유하며 camera viewpoints, material override, variants, annotations, object manipulation, animation event를 제공한다.

Mac에서 변경한 USD는 Vision Pro에 즉시 반영되고, Vision Pro에서 이동한 object나 작성한 annotation은 다시 Mac stage로 돌아온다.

SharePlay까지 사용하면 여러 사용자가 같은 scene을 동시에 검토하고 수정할 수 있다.

핵심은 파일을 단순히 Vision Pro로 복사하는 것이 아니라 **Mac의 제작 도구와 visionOS의 공간형 검토·편집을 실시간으로 결합하는 것**이다.

---

# 함께 보면 좋은 세션과 자료

- Collaborate on structured 3D models in visionOS
- Discover USDKit and what’s new in OpenUSD
- Understand USD fundamentals
- Bridging an application’s custom USD runtime to Spatial Preview
- Working with content from your Mac app using Spatial Preview
- Reducing the rendering cost of RealityKit content on visionOS
