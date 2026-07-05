# WWDC26 Code-along: Build powerful drag and drop in SwiftUI 요약

- Session: 271
- Title: Code-along: Build powerful drag and drop in SwiftUI
- Source: https://developer.apple.com/videos/play/wwdc2026/271/
- Topic: SwiftUI, Drag and Drop, Reordering, Transferable
- Chapters: Introduction, Reordering, Drag multiple items, Drag configuration, Next steps

---

## 한 줄 요약

이 세션은 Solitaire 게임을 직접 구현하면서 SwiftUI의 새로운 드래그 앤 드롭 API를 활용해 **콘텐츠 재정렬**, **여러 항목 동시 이동**, **드래그 미리보기 구성**, **복사·이동 방식과 드롭 허용 조건 제어**를 구현하는 방법을 설명한다.

---

## 핵심 요약

SwiftUI의 드래그 앤 드롭 기능은 기존 `draggable`과 `dropDestination`에서 한 단계 확장되었다.

이번 세션에서 소개된 핵심 변화는 다음과 같다.

1. **Reordering**
   - `reorderable`로 개별 항목을 재정렬 가능하게 구성
   - `reorderContainer`로 여러 컬렉션을 하나의 재정렬 범위로 묶음
   - 재정렬이 끝난 뒤 전달되는 difference를 데이터 모델에 반영

2. **Drag multiple items**
   - `dragContainer`로 하나의 드래그에 여러 항목을 포함
   - `dragPreviewsFormation`과 `dropPreviewsFormation`으로 여러 항목의 표시 방식 제어

3. **Drag configuration**
   - `dragConfiguration`으로 drag source의 이동 의도 지정
   - `dropConfiguration`으로 실제 복사·이동 방식과 드롭 가능 여부 결정
   - 앱의 규칙에 따라 허용되지 않는 드롭을 차단

---

# 1. 기존 SwiftUI 드래그 앤 드롭

SwiftUI는 iOS 16부터 `draggable`과 `dropDestination`을 통해 드래그 앤 드롭을 지원해 왔다.

| API | 역할 |
|---|---|
| `draggable` | 뷰의 데이터를 시스템이나 다른 앱으로 드래그 |
| `dropDestination` | 특정 `Transferable` 타입의 데이터를 드롭으로 수신 |
| `Transferable` | 데이터가 시스템에서 전달될 수 있는 표현 방식을 정의 |

데이터 타입을 `Transferable`에 적합하게 만들면 텍스트, 이미지, 사용자 정의 모델 등을 앱 내부뿐 아니라 다른 앱과도 주고받을 수 있다.

WWDC26에서는 이 기반 위에 다음 세 가지 기능이 추가되었다.

- 콘텐츠 순서를 바꾸는 재정렬 API
- 여러 항목을 동시에 이동하는 Drag Container API
- 데이터가 복사되거나 이동되는 방식을 제어하는 Drag Configuration API

---

# 2. Solitaire 예제 구조

세션에서는 Solitaire 게임을 예제로 사용한다.

게임의 주요 동작은 다음과 같다.

- 카드를 같은 pile 안에서 재정렬
- 카드를 다른 pile로 이동
- 중간 카드를 선택하면 그 위의 카드들도 함께 이동
- 뒤집힌 카드는 이동 불가
- 게임 규칙에 맞는 위치에만 카드 드롭 허용
- remainder deck의 카드는 복사가 아니라 이동으로 처리

프로젝트는 크게 두 영역으로 나뉜다.

| 폴더 | 역할 |
|---|---|
| Game | SwiftData 모델과 게임 상태 변경 로직 |
| Views | SwiftUI 화면과 드래그 앤 드롭 상호작용 |

---

# 3. Reordering

## `reorderable`

재정렬 가능한 항목을 만드는 가장 간단한 방법은 해당 항목을 생성하는 `ForEach`에 `reorderable`을 추가하는 것이다.

```swift
ForEach(cards) { card in
    CardFaceView(card: card)
}
.reorderable()
```

항목을 드래그하면 다음 과정이 자동으로 처리된다.

1. 원래 위치에서 항목이 들어 올려짐
2. 원래 위치에 placeholder가 표시됨
3. 다른 항목 위로 이동하면 항목들이 공간을 만듦
4. placeholder가 최종 삽입 위치를 표시
5. 드롭하면 새로운 위치로 이동

## `reorderContainer`

`reorderable`만으로는 재정렬할 항목을 정의하고, `reorderContainer`는 재정렬의 범위와 결과 처리 방식을 정의한다.

```swift
HStack {
    ForEach(cards) { card in
        CardFaceView(card: card)
    }
    .reorderable()
}
.reorderContainer(for: CardValue.self) { difference in
    cards.apply(difference: difference)
}
```

재정렬이 끝나면 closure에 `difference`가 전달된다. 앱은 이 차이를 배열이나 데이터 모델에 반영한다.

## 여러 컬렉션을 하나의 컨테이너로 구성

Solitaire에는 여러 pile이 있으므로 각 pile을 같은 `reorderContainer` 안에 포함해야 한다.

```swift
.reorderContainer(
    for: CardValue.self,
    in: Card.Group.self
) { difference in
    game.moveCards(difference: difference)
}
```

여러 컬렉션을 구분하기 위해 `Card.Group` 같은 컬렉션 식별자를 사용한다.

각 `reorderable`에는 자신이 속한 컬렉션의 ID를 제공한다.

```swift
.reorderable(collectionID: Card.Group.pile(index))
```

이 구조를 사용하면 하나의 pile 안에서의 이동뿐 아니라 서로 다른 pile 사이의 이동도 같은 재정렬 흐름으로 처리할 수 있다.

---

# 4. 재정렬할 수 없는 항목 분리

Solitaire 규칙상 뒤집힌 카드는 이동할 수 없다.

세션에서는 복잡한 조건 API를 추가하는 대신, 뒤집힌 카드와 앞면 카드의 `ForEach`를 분리한다.

```swift
ForEach(cards[..<firstFaceUpIndex]) { card in
    CardView(card: card)
}

ForEach(cards[firstFaceUpIndex...], id: \.value) { card in
    CardView(card: card)
}
.reorderable(collectionID: Card.Group.pile(index))
```

첫 번째 `ForEach`에는 `reorderable`을 적용하지 않고, 두 번째 `ForEach`에만 적용한다.

이 방식의 장점은 다음과 같다.

- 이동 불가능한 항목을 구조적으로 분리
- 불필요한 조건 검사 감소
- UI 계층 자체가 게임 규칙을 표현
- 드래그 제스처가 시작되지 않도록 자연스럽게 차단

---

# 5. 여러 항목 동시에 드래그

## `dragContainer`

Solitaire에서는 중간에 있는 카드를 드래그하면 그 위에 놓인 카드들도 함께 이동해야 한다.

`reorderContainer`는 내부적으로 drag container와 drop destination을 제공하지만, `dragContainer`를 직접 추가하면 어떤 항목들을 함께 이동할지 지정할 수 있다.

```swift
.dragContainer(for: CardValue.self) { cardID in
    game.cardStack(startingAt: cardID)
}
```

closure에는 사용자가 드래그를 시작한 항목의 식별자가 전달된다.

앱은 이 값을 기준으로 함께 이동할 `Transferable` 항목들을 반환한다.

예제에서는 선택한 카드부터 pile 위쪽에 놓인 카드 전체를 반환한다.

## 선택 기반 다중 드래그

세션에서는 Solitaire 외의 일반적인 앱에서 사용할 수 있는 선택 기반 다중 드래그도 설명한다.

예를 들어 여러 항목을 탭해 선택한 다음, 선택된 항목 중 하나를 드래그하면 모든 선택 항목을 동시에 이동할 수 있다.

다중 드래그 대상은 앱의 상호작용 모델에 따라 다음과 같이 결정할 수 있다.

- 현재 선택된 항목
- 같은 그룹의 항목
- 연속된 항목
- 계층상 하위 항목
- 앱 규칙에 따라 자동으로 묶인 항목

---

# 6. Drag Preview 구성

여러 항목을 드래그하면 SwiftUI는 기본적으로 항목을 pile 형태로 표시한다.

`dragPreviewsFormation`을 사용하면 드래그 중 미리보기 형식을 변경할 수 있다.

```swift
.dragPreviewsFormation(.stack)
```

지원되는 구성 예시는 다음과 같다.

| Formation | 표시 방식 |
|---|---|
| `pile` | 항목이 겹쳐진 pile 형태 |
| `list` | 여러 항목이 목록처럼 펼쳐진 형태 |
| `stack` | 간결하게 쌓인 stack 형태 |

Solitaire 예제에서는 카드의 시각적 성격에 맞춰 `stack`을 사용한다.

## Drop Destination 위에서의 Preview

드래그 중인 항목이 drop destination 위로 이동하면 destination의 preview 설정이 적용될 수 있다.

일관된 표현을 유지하기 위해 루트 레이아웃에 `dropPreviewsFormation`을 적용한다.

```swift
.dropPreviewsFormation(.stack)
```

이를 통해 drag source에서 이동할 때와 drop destination 위에 있을 때 같은 형태를 유지할 수 있다.

---

# 7. Drag Configuration

## 복사와 이동

SwiftUI의 기본 drag operation은 일반적으로 복사를 제안한다.

이 방식은 다음 경우에 적합하다.

- 다른 앱에서 새 콘텐츠 가져오기
- 기존 데이터를 유지한 채 복제
- 이미지나 텍스트를 새 위치에 삽입

하지만 Solitaire에서는 카드를 복사하면 안 되며, 기존 위치에서 새로운 위치로 이동해야 한다.

## `dragConfiguration`

drag source는 `dragConfiguration`을 통해 이동을 지원한다는 의도를 표현할 수 있다.

```swift
.dragConfiguration(
    DragConfiguration(allowMove: true)
)
```

중요한 점은 drag source가 이동 의도를 제안할 뿐, 최종 operation은 drop destination이 결정한다는 것이다.

---

# 8. 외부 항목을 Reorder Container에 삽입

`reorderContainer`는 기본적으로 컨테이너 내부의 항목 이동만 처리한다.

Remainder deck처럼 컨테이너 외부에 있는 카드를 pile로 이동하려면 별도의 `dropDestination`이 필요하다.

```swift
.dropDestination(for: CardValue.self) { newCards, session in
    if let destination = session.reorderDestination(
        for: CardValue.self,
        in: Card.Group.self
    ) {
        game.insertCards(newCards, to: destination)
    }
}
```

`session.reorderDestination`을 사용하면 현재 드롭 위치에 해당하는 재정렬 destination을 가져올 수 있다.

이 정보를 이용해 외부에서 들어온 항목을 올바른 pile과 위치에 삽입한다.

---

# 9. Drop Configuration

`dropConfiguration`은 drop destination이 데이터를 어떻게 받을지 최종적으로 결정한다.

세션의 구현은 크게 세 단계를 수행한다.

## 1. 드롭 위치 계산

현재 drag 위치를 기준으로 어느 pile이 대상인지 계산한다.

```swift
let alignedX = session.location.x - 0.5 * spacing
let pile = Int(alignedX / (cardWidth + spacing))
```

이후 해당 pile의 마지막 위치를 destination으로 만든다.

```swift
let destination =
    ReorderDifference<CardValue, Card.Group>.Destination(
        position: .end,
        collectionID: .pile(pile)
    )
```

## 2. 이동 operation 지정

카드 게임에서는 복사가 의미 없기 때문에 move operation만 허용한다.

일반적인 앱에서는 move를 우선하고, 사용할 수 없을 때 copy를 fallback으로 허용할 수 있다.

## 3. 앱 규칙 검증

게임 규칙에 맞지 않는 이동이면 forbidden operation을 반환한다.

그 결과 SwiftUI는 destination이 해당 항목을 받지 못하도록 처리하고, 항목은 원래 위치로 돌아간다.

검증에 사용할 수 있는 조건의 예시는 다음과 같다.

- 대상 컬렉션의 종류
- 현재 drag 위치
- 데이터 타입
- 항목의 상태
- source와 destination 관계
- 앱의 비즈니스 규칙
- 허용되는 copy/move operation

---

# 10. API 조합 방식

이번 세션의 핵심은 각각의 API를 독립적으로 사용하는 것보다 서로 조합하는 방식에 있다.

| 목적 | API |
|---|---|
| 항목을 재정렬 가능하게 구성 | `reorderable` |
| 재정렬 범위 및 데이터 변경 처리 | `reorderContainer` |
| 여러 항목을 한 번에 이동 | `dragContainer` |
| 드래그 중 미리보기 형태 지정 | `dragPreviewsFormation` |
| destination 위 미리보기 형태 지정 | `dropPreviewsFormation` |
| source의 이동 의도 설정 | `dragConfiguration` |
| 외부 항목 수신 | `dropDestination` |
| operation, destination, 허용 여부 결정 | `dropConfiguration` |

세션에서는 처음에 `reorderable`과 `reorderContainer`만으로 기본 재정렬을 구현한 뒤, 필요한 기능에 따라 drag와 drop modifier를 단계적으로 추가한다.

이처럼 기본 API로 시작하고 앱의 규칙에 맞춰 modifier를 합성하는 것이 권장되는 접근이다.

---

# 11. 플랫폼 지원

세션에서 설명한 플랫폼 지원 범위는 다음과 같다.

| API | 지원 범위 |
|---|---|
| Reordering API | Drag and drop을 지원하는 모든 Apple 플랫폼의 최신 릴리스 |
| `dragContainer` | iOS 27, iPadOS 27, visionOS 27 |
| Drag preview formation | macOS 26 이상 포함 |
| Drag Configuration API | 2027 플랫폼 릴리스 |

정확한 API별 availability는 실제 적용 시 Xcode의 SDK 선언과 Apple Developer Documentation에서 다시 확인해야 한다.

---

# 12. 개발자 체크 포인트

- [ ] 드래그할 데이터 타입이 `Transferable`을 올바르게 구현하는지 확인
- [ ] `reorderable`과 `reorderContainer`의 item type이 일치하는지 확인
- [ ] 여러 컬렉션을 사용할 경우 collection ID가 고유한지 확인
- [ ] 재정렬 결과 difference가 데이터 모델에 정확하게 반영되는지 확인
- [ ] 이동할 수 없는 항목을 별도의 view hierarchy로 분리할 수 있는지 검토
- [ ] 여러 항목을 드래그할 때 항목 순서가 유지되는지 확인
- [ ] drag와 drop preview formation이 일관적인지 확인
- [ ] copy와 move operation의 의미를 명확히 구분
- [ ] 외부 source에서 들어오는 항목에 별도 `dropDestination`이 필요한지 확인
- [ ] `dropConfiguration`에서 위치와 앱 규칙을 검증
- [ ] 허용되지 않는 드롭이 명확한 시각적 피드백과 함께 차단되는지 확인
- [ ] 플랫폼별 API availability 확인
- [ ] VoiceOver, Switch Control, 키보드 등 드래그 외의 대체 조작 방법도 제공

---

# 함께 보면 좋은 세션

- Meet Transferable — WWDC22
- Drag and drop
- Making a card game with drag, drop, and reordering in SwiftUI
