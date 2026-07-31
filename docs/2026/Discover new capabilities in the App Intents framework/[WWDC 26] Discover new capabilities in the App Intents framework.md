# WWDC26 Discover new capabilities in the App Intents framework 요약

- Session: 345
- Title: Discover new capabilities in the App Intents framework
- Source: https://developer.apple.com/videos/play/wwdc2026/345/
- Topic: App Intents, App Entities, Siri, Shortcuts, Spotlight, Widgets, Apple Intelligence
- Chapters: Introduction, ValueRepresentation, RelevantEntities, EntityCollection, SyncableEntity, Richer parameter types, Union values, LongRunningIntent, ExecutionTargets, Next steps

---

## 한 줄 요약

2027 릴리스의 App Intents는 `ValueRepresentation`으로 구조화된 entity를 앱 사이에 전달하고, `RelevantEntities`로 상황에 맞는 콘텐츠를 선제적으로 제안하며, `EntityCollection`과 `SyncableEntity`로 대규모·기기간 entity 처리를 개선하고, `@UnionValue`, `LongRunningIntent`, `CancellableIntent`, `ExecutionTargets`로 parameter와 실행 모델을 더 유연하게 만든다.

---

## 핵심 요약

이번 세션은 App Intents의 새로운 기능을 세 영역으로 설명한다.

- **Entity 확장**
  - `ValueRepresentation`: 파일이나 `Data`로 표현하기 어려운 구조화된 값을 다른 앱으로 전달
  - `RelevantEntities`: 아직 검색되거나 사용되지 않은 콘텐츠도 특정 context에서 시스템에 제안
  - `EntityCollection`: entity 전체를 resolve하지 않고 identifier만 intent에 전달
  - `SyncableEntity`: 여러 기기에서 동일한 entity를 식별할 stable ID 선언

- **Parameter 표현력**
  - `Duration`, `PersonNameComponents` 등 더 많은 native type 지원
  - `@UnionValue`로 하나의 parameter가 서로 다른 여러 type 중 하나를 받을 수 있음

- **Intent 실행 제어**
  - `LongRunningIntent`로 기본 30초 제한을 넘어 실행
  - `CancellableIntent`로 사용자 취소·timeout·resource reclaim에 대응
  - 지원 기기에서 background GPU access
  - `ExecutionTargets`로 main app, App Intents extension, WidgetKit extension 중 실행 process를 명시

---

# 🧭 App Intents의 역할

App Intents는 앱의 action과 content를 시스템의 다른 영역에 자연스럽게 노출하는 framework다.

주요 통합 지점은 다음과 같다.

- Siri
- Shortcuts
- Spotlight
- Widgets
- Apple Intelligence

2027 릴리스에서는 개발자의 feature request를 반영해 더 많은 control, flexibility, smoother developer experience를 제공한다.

세션은 WWDC25의 Landmarks Travel Tracking sample을 기반으로 새로운 API를 적용한다.

---

# 📦 Entity는 앱 안에만 머물지 않는다

`AppEntity`는 Landmark, playlist, photo처럼 앱의 콘텐츠를 시스템에 표현한다.

하지만 사용자는 앱 사이를 이동한다.

```text
Travel app의 Landmark
        ↓
Mail로 친구에게 공유
        ↓
Maps에서 길 찾기
```

Entity가 여러 앱과 시스템 surface 사이를 자연스럽게 이동하려면 대상 앱이 이해할 수 있는 표현으로 변환되어야 한다.

---

# 🔄 기존 `Transferable`의 한계

Landmark entity가 `Transferable`을 준수하면 Mail로 공유할 수 있다.

PDF, image처럼 알려진 파일 형식은 file representation과 data representation으로 잘 전달된다.

하지만 좌표나 주소처럼 구조화된 값에는 항상 적절한 file format이 존재하는 것은 아니다.

Maps가 길 찾기를 시작하려면 coordinate, address, place metadata가 필요하다.

이런 구조화된 값을 전달하기 위해 `ValueRepresentation`이 추가됐다.

---

# 🗺️ `ValueRepresentation`

`ValueRepresentation`은 시스템이 이미 이해하는 구조화된 type을 공유하기 위한 새로운 representation이다.

세션에서는 Landmark를 GeoToolbox의 `PlaceDescriptor`로 변환한다.

```swift
struct LandmarkEntity: AppEntity, Transferable {
    var id: Int
    var landmark: Landmark

    static var transferRepresentation: some TransferRepresentation {
        ValueRepresentation(
            exporting: { entity in
                PlaceDescriptor(
                    representations: [
                        .coordinate(entity.landmark.locationCoordinate)
                    ],
                    commonName: entity.landmark.name
                )
            }
        )
    }
}
```

이제 Landmark entity가 Maps로 전달되면 Maps는 좌표와 이름을 이용해 길 찾기를 시작할 수 있다.

Entity에 이미 `PlaceDescriptor` property가 있다면 key path를 사용할 수 있다.

```swift
struct LandmarkEntity: AppEntity, Transferable {
    var id: Int

    @Property
    var placeDescriptor: PlaceDescriptor

    static var transferRepresentation: some TransferRepresentation {
        ValueRepresentation(exporting: \.placeDescriptor)
    }
}
```

핵심은 단순 serialization이 아니라 수신 앱이 의미를 이해하고 바로 행동할 수 있는 값을 전달하는 것이다.

---

# 💡 Entity를 발견하게 만드는 세 가지 방법

| 방식 | 목적 |
|---|---|
| Spotlight indexing | 검색 가능하게 만들고 Siri가 retrieve할 수 있게 함 |
| Interaction donation | 사용자의 반복 행동 pattern을 학습 |
| RelevantEntities | 특정 상황에서 어떤 콘텐츠가 지금 relevant한지 직접 알려줌 |

각 방식은 서로 대체 관계가 아니라 목적이 다르다.

---

# 🔎 Spotlight Indexing

Spotlight에 content를 index하면 다음이 가능하다.

- Spotlight UI에서 검색
- Semantic search
- Siri가 앱 콘텐츠 retrieve

검색 가능성과 장기적인 discoverability가 목적이라면 Spotlight를 사용한다.

---

# 🎁 Interaction Donation

사용자가 앱에서 action을 수행하면 `IntentDonationManager`로 interaction을 donate할 수 있다.

시스템은 시간이 지나면서 사용 pattern을 학습한다.

이를 통해 다음을 지원할 수 있다.

- 반복할 가능성이 있는 action 제안
- 개인화된 Siri experience
- 자주 사용하는 workflow 예측

하지만 한 번도 사용되지 않은 새 콘텐츠에는 interaction history가 없다.

---

# ✨ `RelevantEntities`

새로운 running playlist가 있어도 아무도 아직 검색하거나 재생하지 않았다면 Spotlight나 interaction donation만으로는 적절한 순간에 제안하기 어렵다.

`RelevantEntities`는 콘텐츠가 어떤 context에서 relevant한지 직접 알려준다.

```swift
let playlistEntities = [
    dailyRun,
    runningMix
]

let workoutContext =
    AppEntityContext.audio(
        .workout(activityType: .running)
    )

try await RelevantEntities.shared.updateEntities(
    playlistEntities,
    for: workoutContext
)
```

이제 해당 playlist는 과거 사용 기록이 없어도 running workout context에서 제안될 수 있다.

등록된 entity는 제거하기 전까지 유지된다.

```swift
try await RelevantEntities.shared
    .removeAllEntities(for: workoutContext)

try await RelevantEntities.shared
    .removeEntities(
        playlistEntities,
        from: workoutContext
    )

try await RelevantEntities.shared
    .removeAllEntities()
```

Content lifecycle과 relevance가 변할 때 등록 상태도 갱신해야 한다.

---

# 🧠 Discoverability 방식 선택

## Spotlight
- Content 검색
- Semantic retrieval
- Siri가 content를 찾아야 함

## Interaction Donation
- 사용자가 실제로 수행한 action 학습
- 반복 behavior 예측
- 개인화

## RelevantEntities
- 특정 context에서 지금 유용한 content를 제안
- 아직 사용되지 않은 새 content 추천
- app이 relevance를 명시적으로 알고 있음

---

# 🖼️ 대량 Entity 처리 문제

Travel app에 여러 사진에 keyword를 붙이는 intent를 만든다.

```swift
@Parameter
var photos: [PhotoEntity]

@Parameter
var tag: String
```

사진이 많아지자 여러 사진을 한 번에 tag하는 작업이 느려졌다.

Intent가 실행되기 전에 시스템은 모든 entity parameter를 resolve한다.

즉 entity query를 호출해 entity의 property를 채운다.

하지만 tag intent가 실제로 필요한 것이 각 photo의 ID뿐이라면 수백·수천 entity를 fully resolve하는 것은 낭비다.

```text
1,000 Photo IDs만 필요
        ↓
1,000 Photo Entities 전체 resolve
        ↓
불필요한 query와 property loading
```

---

# ⚡ `EntityCollection`

`EntityCollection`은 fully resolved entity array 대신 entity identifier 배열을 저장한다.

```swift
struct TagPhotosIntent: AppIntent {
    static let title: LocalizedStringResource =
        "Tag Travel Photos"

    @Parameter
    var photos: EntityCollection<PhotoEntity>

    @Parameter
    var tag: String

    func perform() async throws -> some IntentResult {
        modelData.tagPhotos(
            ids: photos.identifiers,
            tag: tag
        )

        return .result()
    }
}
```

시스템은 `perform()`에 identifier만 전달하고 entity 전체를 resolve하지 않는다.

세션에서는 1,000장의 사진을 tag하는 Shortcut이 일반 entity array에서는 느렸지만 `EntityCollection`으로 바꾼 뒤 거의 즉시 끝나는 모습을 보여준다.

적합한 경우:

- Parameter가 많은 entity를 받을 수 있음
- Intent가 entity의 모든 property를 필요로 하지 않음
- ID를 이용해 앱의 data model에서 직접 작업 가능
- Batch update, delete, tag, move

---

# 📱 기기간 Siri 대화와 Entity

2027 릴리스에서는 Siri conversation을 여러 기기에서 이어갈 수 있다.

```text
iPhone:
"이 사진을 앨범에 추가해 줘"

다른 기기:
"그 사진에 여행 태그를 붙여 줘"
```

두 번째 기기에서도 Siri가 같은 photo entity를 찾아야 한다.

---

# 🆔 Local ID 문제

Entity ID를 기기 로컬에서 생성하면 동일한 entity가 기기마다 서로 다른 ID를 가질 수 있다.

```text
같은 Photo

iPhone local ID: 123
iPad local ID: 987
```

이 경우 다른 기기에서 이전 conversation의 entity를 찾기 어렵다.

---

# 🔗 Stable ID와 `SyncableEntity`

기기간 같은 entity를 참조하려면 모든 기기에서 동일한 stable ID가 필요하다.

예:

- 서버가 발급한 UUID
- CloudKit record ID

`SyncableEntity`는 entity ID가 기기 간 stable하다는 사실을 시스템에 선언한다.

```swift
struct PhotoEntity:
    AppEntity,
    SyncableEntity {

    var id: Int
}
```

실제로 `id`가 모든 기기에서 같아야 한다. Protocol을 붙이는 것만으로 local ID가 stable해지는 것은 아니다.

---

# 🔀 Local ID와 Stable ID가 모두 필요한 경우

Core Data row ID처럼 앱 내부에서는 local identifier가 편할 수 있다.

이 경우 `SyncableEntityIdentifier`를 사용한다.

```swift
struct PhotoEntity:
    AppEntity,
    SyncableEntity {

    var id:
        SyncableEntityIdentifier<String, String>

    init(
        localID: String,
        stableID: String
    ) {
        self.id = SyncableEntityIdentifier(
            local: localID,
            stable: stableID
        )
    }
}
```

| 위치 | 사용하는 ID |
|---|---|
| On-device app code | Local ID |
| System across devices | Stable ID |

`SyncableEntity`는 storage sync 자체를 자동 구현하는 기능이라기보다 기기간 동일한 entity identity를 선언하는 API다.

---

# 🎛️ 더 많은 Native Parameter Type

`@Parameter`를 선언하면 시스템은 type에 따라 native picker, Siri understanding, localization, Shortcuts와 Widgets integration을 제공한다.

2027 릴리스에서는 더 많은 native type을 지원한다.

- `Duration`
- `PersonNameComponents`

`Duration`을 사용하면 custom time picker를 만들 필요가 줄고, `PersonNameComponents`를 사용하면 이름을 구조화된 값으로 받을 수 있다.

---

# 🧬 `@UnionValue`

하나의 Widget에서 다음 두 source 중 하나를 선택해야 할 수 있다.

- Landmark collection
- Photo album

Union value는 각 case가 서로 다른 type을 감싸는 Swift enum이다.

```swift
@UnionValue
enum TravelGalleryContent {
    case landmarkCollection(
        LandmarkCollectionEntity
    )

    case photoAlbum(
        PhotoAlbumEntity
    )

    static let typeDisplayRepresentation:
        TypeDisplayRepresentation =
            "Travel Gallery"

    static let caseDisplayRepresentations:
        [Cases: DisplayRepresentation] = [
            .landmarkCollection:
                "Landmark Collection",
            .photoAlbum:
                "Photo Album"
        ]
}
```

Macro가 생성하는 것:

- Type information
- Case metadata
- Picker support

Widget뿐 아니라 Shortcuts 등 App Intent가 쓰이는 모든 곳에서 사용할 수 있다.

---

# ⏳ Intent의 기본 30초 실행 제한

Siri, Shortcuts 또는 다른 system surface에서 실행된 intent는 일반적으로 30초 안에 완료해야 한다.

다음 작업은 더 오래 걸릴 수 있다.

- 대형 photo upload
- 여러 chunk upload
- 무거운 processing
- On-device inference

세션 예제에서는 Widget button으로 여행 사진을 shared album에 upload하지만 큰 파일은 30초 안에 끝나지 않아 실패한다.

---

# 🕐 `LongRunningIntent`

`LongRunningIntent`는 intent가 30초 제한을 넘어 실행되게 하고, background task lifecycle을 관리한다.

```swift
struct UploadPhotoIntent:
    LongRunningIntent {

    static let title:
        LocalizedStringResource =
            "Upload Photo"

    @Parameter
    var photo: IntentFile
}
```

장시간 작업은 `performBackgroundTask` 안에서 실행한다.

```swift
let result = try await performBackgroundTask {
    let chunks = calculateChunks(for: photo)

    progress.totalUnitCount =
        Int64(chunks)

    for chunk in 1...chunks {
        try Task.checkCancellation()
        try await uploadChunk(chunk)

        progress.completedUnitCount =
            Int64(chunk)
    }

    return "Upload complete!"
}
```

`LongRunningIntent`는 progress 보고가 필요하다.

진행 상태는 Live Activity로 자동 표시되고 사용자는 Stop button으로 작업을 취소할 수 있다.

---

# 🛑 `CancellableIntent`

Long-running 작업은 다음 이유로 취소될 수 있다.

- 사용자가 Stop button 탭
- 시스템 timeout
- Resource reclaim

`CancellableIntent`는 취소 시 cleanup할 기회를 제공한다.

```swift
struct UploadPhotoIntent:
    LongRunningIntent,
    CancellableIntent {

    func perform()
        async throws
        -> some IntentResult & ProvidesDialog {

        let result =
            try await performBackgroundTask {
                let chunks =
                    calculateChunks(for: photo)

                progress.totalUnitCount =
                    Int64(chunks)

                for chunk in 1...chunks {
                    try Task.checkCancellation()
                    try await uploadChunk(chunk)

                    progress.completedUnitCount =
                        Int64(chunk)
                }

                return "Upload complete!"
            } onCancel: { reason in
                cleanup(for: reason)
            }

        return .result(
            dialog: "\(result)"
        )
    }
}
```

Cleanup 예:

- Partial upload 삭제
- In-flight network request 취소
- Temporary file 정리
- Server-side upload session 종료
- Local state rollback

Loop 안에는 `Task.checkCancellation()` 같은 cooperative cancellation 지점이 필요하다.

---

# 🎮 Background GPU Access

`LongRunningIntent`는 지원 기기에서 background GPU access도 지원한다.

활용 예:

- Photo processing
- On-device inference
- GPU 기반 compute

사용하려면 앱 entitlement에 GPU access를 추가해야 한다.

---

# 🧱 App Intent가 존재할 수 있는 여러 Process

앱이 커지면 intent와 entity를 여러 target에서 공유할 수 있다.

- Main app
- Widget extension
- App Intents extension
- Shared Swift package
- Shared framework

동일한 intent code가 app과 extension 모두에 link되어 있다면 시스템은 heuristic으로 실행 target을 고른다.

예:

- Main app이 실행 중이면 app 선호
- 그렇지 않으면 extension 실행 가능

하지만 항상 앱의 data architecture와 일치하지는 않는다.

---

# ⚠️ Shared Data Store의 Write Conflict

Widget과 main app이 같은 data model을 공유하는 경우 두 process가 동시에 write하면 conflict가 생길 수 있다.

세션에서는 다음 구조를 선택한다.

- Widget extension: Read-only
- Main app: 모든 write 담당

Widget의 favorite button을 탭했을 때 intent는 main app process에서 실행돼야 한다.

---

# 🎯 `ExecutionTargets`

`ExecutionTargets`를 사용하면 어떤 process가 intent를 실행할지 명시할 수 있다.

## Main App

```swift
struct UpdateFavoriteIntent: AppIntent {
    static var allowedExecutionTargets:
        ExecutionTargets {
        .main
    }
}
```

## App Intents Extension

```swift
struct DownloadPhotoIntent: AppIntent {
    static var allowedExecutionTargets:
        ExecutionTargets {
        .appIntentsExtension
    }
}
```

## WidgetKit Extension

```swift
struct GetLandmarkStatusIntent: AppIntent {
    static var allowedExecutionTargets:
        ExecutionTargets {
        .widgetKitExtension
    }
}
```

## 여러 Target 허용

```swift
struct TagPhotosIntent: AppIntent {
    static var allowedExecutionTargets:
        ExecutionTargets {
        [
            .main,
            .appIntentsExtension
        ]
    }
}
```

허용된 target 안에서는 시스템이 적절한 process를 선택할 수 있다.

검토할 요소:

- Data store write ownership
- Extension resource limit
- Main app dependency
- UI 또는 foreground state 필요 여부
- 독립적으로 실행 가능한지
- 여러 process에서 동시에 실행해도 안전한지

---

# 🧩 새로운 기능별 문제와 해법

| 문제 | 새로운 API |
|---|---|
| 구조화된 entity를 다른 앱이 이해하지 못함 | `ValueRepresentation` |
| 아직 사용되지 않은 새 콘텐츠를 상황에 맞게 제안하기 어려움 | `RelevantEntities` |
| 수천 entity의 full resolution 비용 | `EntityCollection` |
| 같은 entity의 기기별 ID가 다름 | `SyncableEntity` |
| 하나의 parameter에 서로 다른 type 필요 | `@UnionValue` |
| Intent가 30초보다 오래 걸림 | `LongRunningIntent` |
| 장시간 작업을 안전하게 취소해야 함 | `CancellableIntent` |
| Shared intent가 잘못된 process에서 실행됨 | `ExecutionTargets` |

---

# 🔁 전체 도입 흐름

| 단계 | 작업 |
|---|---|
| Entity 공유 | `Transferable`에 `ValueRepresentation` 추가 |
| 검색 노출 | Spotlight indexing |
| 행동 학습 | Interaction donation |
| Contextual 추천 | `RelevantEntities` 등록 |
| Batch performance | 대량 entity parameter에 `EntityCollection` 검토 |
| Cross-device identity | Stable ID와 `SyncableEntity` 도입 |
| Native input | `Duration`, `PersonNameComponents` 활용 |
| Multi-type input | `@UnionValue` 정의 |
| Extended execution | `LongRunningIntent` 도입 |
| Progress | `progress` object 갱신 |
| Cancellation | `CancellableIntent`와 cleanup 구현 |
| GPU | 필요 시 entitlement 추가 |
| Process ownership | `ExecutionTargets` 명시 |
| Validation | Siri, Shortcuts, Spotlight, Widget에서 테스트 |

---

# 📋 체크리스트

## `ValueRepresentation`
- [ ] Entity가 `Transferable`을 준수하는지 확인
- [ ] File/Data representation만으로 의미 전달이 가능한지 검토
- [ ] 수신 앱이 이해하는 structured system type 확인
- [ ] Closure 또는 key path 선택
- [ ] Maps 등 대상 앱에서 실제 action으로 이어지는지 테스트

## `RelevantEntities`
- [ ] 상황별로 relevant한 콘텐츠 식별
- [ ] 적절한 `AppEntityContext` 구성
- [ ] `updateEntities` 호출 시점 정의
- [ ] 더 이상 relevant하지 않을 때 제거
- [ ] Spotlight indexing과 interaction donation을 대체하지 않기

## `EntityCollection`
- [ ] 수백·수천 entity가 들어올 수 있는지 확인
- [ ] Entity 전체 property가 실제로 필요한지 검토
- [ ] ID만 필요하면 `EntityCollection<Entity>` 사용
- [ ] `identifiers`로 data model 작업
- [ ] 일반 entity array와 성능 비교

## `SyncableEntity`
- [ ] 현재 ID가 기기간 stable한지 확인
- [ ] Server UUID 또는 CloudKit record ID 사용 검토
- [ ] Local ID가 필요하면 `SyncableEntityIdentifier` 사용
- [ ] Local ↔ Stable mapping 보존
- [ ] 다른 기기에서도 entity query가 가능한지 확인
- [ ] Protocol만 추가하고 local ID를 stable하다고 착각하지 않기

## Native Parameter
- [ ] Custom input UI 전에 native type 지원 여부 확인
- [ ] `Duration` 활용 검토
- [ ] 이름 입력에는 `PersonNameComponents` 검토
- [ ] Siri, Shortcuts, Widgets에서 동작 테스트

## `@UnionValue`
- [ ] 하나의 parameter가 여러 type을 받아야 하는지 확인
- [ ] 각 enum case가 서로 다른 supported type을 감싸도록 구성
- [ ] `typeDisplayRepresentation` 정의
- [ ] `caseDisplayRepresentations` 정의
- [ ] Widget과 Shortcuts에서 picker 테스트

## `LongRunningIntent`
- [ ] 작업이 30초를 넘을 가능성 확인
- [ ] `LongRunningIntent` 준수
- [ ] `performBackgroundTask` 사용
- [ ] `progress.totalUnitCount` 설정
- [ ] `completedUnitCount` 갱신
- [ ] Live Activity progress 확인
- [ ] 작업을 적절한 unit으로 분할

## `CancellableIntent`
- [ ] 사용자와 시스템 취소 모두 고려
- [ ] `Task.checkCancellation()` 추가
- [ ] `onCancel`에서 cancellation reason 처리
- [ ] Partial upload와 temporary data cleanup
- [ ] In-flight request 취소
- [ ] Cleanup을 idempotent하게 설계

## Background GPU
- [ ] GPU가 실제로 필요한지 검토
- [ ] 지원 기기 범위 확인
- [ ] 필요한 entitlement 추가
- [ ] CPU fallback 검토

## `ExecutionTargets`
- [ ] Intent code가 어떤 target에 link되는지 확인
- [ ] Main app과 extension의 data ownership 정의
- [ ] Write 작업 process 명시
- [ ] `.main`, `.appIntentsExtension`, `.widgetKitExtension` 중 선택
- [ ] 여러 target이 안전하면 조합 사용
- [ ] 동시 write conflict 테스트

---

# ⚠️ 구현할 때 주의할 점

## Relevant는 Searchable과 다르다

`RelevantEntities`에 등록했다고 Spotlight 검색용 index가 자동 생성되는 것은 아니다.

## Donation은 콘텐츠를 직접 추천하는 API가 아니다

Interaction donation은 사용자가 실제로 한 행동을 시스템이 학습하게 한다. 사용 기록이 없는 새 콘텐츠에는 `RelevantEntities`가 더 적합하다.

## EntityCollection은 Lazy Entity Array가 아니다

핵심은 fully resolved entity가 아니라 identifier를 전달하는 것이다. Full property가 필요하면 별도의 조회가 필요하다.

## SyncableEntity는 데이터 동기화 엔진이 아니다

Stable identity를 선언하지만 entity data 자체를 서버나 CloudKit에 sync하는 앱의 책임을 대체하지 않는다.

## LongRunningIntent도 Progress와 Cancellation 설계가 필요하다

시간 제한만 없애는 API가 아니다. 시스템이 작업 상태를 이해하도록 progress를 보고하고 취소 시 cleanup해야 한다.

## ExecutionTargets는 Architecture를 반영해야 한다

실행 process를 임의로 고르는 것이 아니라 data ownership과 side effect 정책에 맞게 지정해야 한다.

---

# 핵심 메시지

2027 App Intents 업데이트는 entity와 intent가 앱 바깥에서 더 자연스럽게 이동하고, 더 적절한 순간에 나타나며, 더 큰 규모와 더 긴 실행 시간을 처리하도록 확장한다.

`ValueRepresentation`은 file format이 없는 구조화된 값도 다른 앱이 이해할 수 있게 전달한다.

`RelevantEntities`는 검색이나 사용 기록이 없는 콘텐츠도 특정 context에서 시스템이 제안하게 한다.

`EntityCollection`은 대량 entity를 모두 resolve하는 비용을 없애고, `SyncableEntity`는 Siri conversation이 여러 기기로 이어질 때 동일한 entity를 stable하게 참조하게 한다.

`@UnionValue`와 새로운 native parameter type은 시스템 picker와 Siri understanding을 유지하면서 intent의 입력 표현력을 높인다.

`LongRunningIntent`, `CancellableIntent`, `ExecutionTargets`는 실행 시간, 취소, process ownership을 앱의 실제 작업과 architecture에 맞게 제어한다.

결국 App Intents를 잘 설계한다는 것은 action 하나를 노출하는 것을 넘어 **content identity, discoverability, scale, cross-device continuity, execution lifecycle을 시스템과 명확히 공유하는 것**이다.

---

# 함께 보면 좋은 세션과 자료

- Get to know App Intents — WWDC25
- Code-along: Make your app available to Siri
- Validate your App Intents adoption with AppIntentsTesting
- Explore advanced App Intents features for Siri and Apple Intelligence
- Adopting App Intents to support system experiences
- Landmarks Travel Tracking sample code
