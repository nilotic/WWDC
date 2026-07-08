# WWDC26 visionOS에서 구조화된 3D 모델에 대해 협업하기 요약

- Session: 284
- Title: Collaborate on structured 3D models in visionOS
- Korean Title: visionOS에서 구조화된 3D 모델에 대해 협업하기
- Source: https://developer.apple.com/kr/videos/play/wwdc2026/284/
- Topic: visionOS, RealityKit, 3D Assets, Manipulation, Clipping, Spatial Collaboration
- Chapters: Introduction, Asset preparation, Manipulating the hierarchy, Interactive clipping, Autoexpansion, Next steps

---

## 한 줄 요약

이 세션은 복잡한 3D 어셈블리의 계층 구조를 보존하고, RealityKit 컴포넌트를 계층 내에서 이동시켜 전체 모델과 개별 부품을 전환하며 조작하고, 클리핑 평면과 자동 분해 애니메이션으로 모델 내부 구조를 직관적으로 탐색하는 방법을 설명한다.

---

## 핵심 요약

세션은 Apple Vision Pro에서 구조화된 3D 모델을 공동 검토하는 경험을 네 단계로 설명한다.

1. **에셋 구조 준비**
   - USDZ 내 깊은 계층 구조 보존
   - 부품과 하위 어셈블리를 이름과 그룹으로 구분
   - 개별 부품을 런타임에 선택하고 조작할 수 있도록 준비

2. **계층 구조 조작**
   - `ManipulationComponent`와 `InputTargetComponent` 사용
   - 컴포넌트를 루트와 자식 사이에서 이동
   - 전체 어셈블리 조작과 개별 부품 조작을 전환

3. **상호작용형 클리핑**
   - visionOS 27의 `ClippingComponent` 사용
   - 여섯 개의 클리핑 평면으로 모델 내부 노출
   - 여러 좌표 프레임 사이의 변환과 벡터 투영으로 자연스러운 드래그 구현

4. **자동 확장**
   - 하위 어셈블리를 한 축을 따라 자동으로 펼침
   - 부피 가중 위치 분산으로 가장 자연스러운 확장 축 선택
   - `FromToBy` 애니메이션으로 분해도 구성

---

# 1. 공간 협업 경험

세션은 SharePlay 통화 중 여러 사람이 AirPods Pro 모델을 함께 검토하는 사례로 시작한다.

참여자는 동일한 3D 에셋을 같은 공간과 같은 품질로 보면서 다음 작업을 수행한다.

- 전체 모델을 가까이 가져오기
- 어셈블리 잠금 해제
- 상단과 하단 부품 분리
- 개별 부품 회전과 이동
- 내부 회로 구조 확인
- 클리핑 단면 활성화
- 특정 부품을 꺼내 다른 참여자에게 보여주기
- 전체 모델을 다시 닫기

이 경험을 가능하게 하는 핵심은 세 가지다.

| 요소 | 설명 |
|---|---|
| 실시간 협업 | 여러 사람이 같은 공간에서 같은 모델을 동시에 조작 |
| 풍부한 공간 조작 | 평면 화면보다 많은 차원의 정보를 직접 탐색 |
| 환경 조명 | 실제 공간의 조명과 가상 모델을 자연스럽게 결합 |

이 방식은 CAD뿐 아니라 도시 계획, 물류, 부동산, 프로덕션 디자인처럼 복잡한 다차원 정보를 다루는 분야에도 적용할 수 있다.

---

# 2. 3D 에셋 계층 구조 준비

## 구조를 보존해야 하는 이유

복잡한 3D 모델은 단일 메시가 아니라 여러 부품과 하위 어셈블리로 이루어진다.

모델을 내보낼 때 모든 노드를 루트에 평탄화하면 렌더링은 정상적으로 보일 수 있지만, 런타임에서 부품의 의미와 관계를 파악하기 어려워진다.

평탄화된 모델의 문제는 다음과 같다.

- 개별 부품을 이름으로 찾기 어려움
- 관련 부품을 하나의 하위 어셈블리로 다루기 어려움
- 일부 영역만 숨기거나 강조하기 어려움
- 특정 부품만 애니메이션하기 어려움
- 사용자에게 독립적인 조작 대상으로 제공하기 어려움
- 코드가 모델의 부분과 전체 관계를 이해할 수 없음

## 깊은 계층 구조

세션에서는 엔진 모델을 예로 들어 구조가 보존된 에셋을 보여준다.

구조화된 모델에서는 다음이 가능하다.

- 외부 케이스만 숨기기
- 피스톤과 크랭크샤프트만 표시
- 특정 피스톤을 독립적으로 이동
- 하위 어셈블리를 하나의 단위로 조작
- 의미 있는 이름으로 엔티티 검색
- 부품 간 관계를 유지한 채 전체 모델 이동

좋은 계층 구조는 각 부품이 자체 노드로 존재하고, 의미 있는 이름과 그룹을 가지며, 부분과 전체의 관계가 트리 형태로 표현되는 구조다.

---

# 3. 계층 구조 조작하기

## `ManipulationComponent`

RealityKit의 `ManipulationComponent`는 엔티티를 자연스러운 손 동작으로 이동하고 회전하고 크기를 조절할 수 있게 한다.

전체 어셈블리를 하나의 물체로 조작하려면 루트 엔티티에 컴포넌트를 추가한다.

```swift
components.set(InputTargetComponent())

var manipulation = ManipulationComponent()
manipulation.releaseBehavior = .stay
manipulationComponent = manipulation
```

`releaseBehavior`를 `.stay`로 설정하면 사용자가 물체를 놓았을 때 해당 위치에 그대로 남는다.

## 어셈블리 열기

개별 부품을 조작하게 하려면 루트에서 조작 관련 컴포넌트를 제거하고 각 자식 엔티티에 추가한다.

```swift
func openAssembly() {
    components[ManipulationComponent.self] = nil
    components[InputTargetComponent.self] = nil

    for child in assemblyChildren {
        child.components.set(InputTargetComponent())

        var manipulation = ManipulationComponent()
        manipulation.releaseBehavior = .stay
        child.manipulationComponent = manipulation
    }
}
```

이 구조에서는 다음이 가능하다.

- 상단 케이스만 분리
- 한쪽 이어버드만 회전
- 서로 다른 사람이 각각 다른 부품 조작
- 전체 계층 구조를 유지한 채 부분 단위 탐색

## 어셈블리 닫기

어셈블리를 다시 하나의 물체로 다루려면 반대 과정을 수행한다.

```swift
func closeAssembly() {
    for child in assemblyChildren {
        child.manipulationComponent = nil
        child.components[InputTargetComponent.self] = nil
    }

    components.set(InputTargetComponent())

    var manipulation = ManipulationComponent()
    manipulation.releaseBehavior = .stay
    manipulationComponent = manipulation
}
```

핵심은 모델의 지오메트리나 계층을 변경하지 않고 컴포넌트의 위치만 바꾼다는 점이다.

| 컴포넌트 위치 | 동작 |
|---|---|
| 루트 엔티티 | 전체 어셈블리를 하나의 물체로 조작 |
| 자식 엔티티 | 각 부품을 독립적으로 조작 |

## 충돌 컴포넌트

입력 이벤트가 엔티티에 도달하려면 `CollisionComponent`도 필요하다.

세션의 핵심 코드에서는 충돌 설정이 생략되어 있지만, 실제 프로젝트에서는 조작 대상에 적절한 collision shape를 제공해야 한다.

---

# 4. 상호작용형 클리핑

## `ClippingComponent`

visionOS 27의 RealityKit에는 복잡한 모델의 내부를 볼 수 있는 `ClippingComponent`가 추가된다.

클리핑 경계 밖의 지오메트리는 렌더링에서 제외되어 모델의 단면과 내부 구조를 볼 수 있다.

```swift
var clipping = ClippingComponent()
clipping.bounds = bounds
clipping.shouldClipSelf = true
clipping.shouldClipChildren = true
```

주요 속성은 다음과 같다.

| 속성 | 설명 |
|---|---|
| `bounds` | 엔티티 로컬 공간에서의 축 정렬 경계 상자 |
| `shouldClipSelf` | 엔티티 자신을 클리핑할지 결정 |
| `shouldClipChildren` | 자식 엔티티까지 클리핑할지 결정 |

`shouldClipChildren`의 기본값은 `false`이므로 전체 어셈블리를 클리핑하려면 명시적으로 활성화해야 한다.

---

# 5. 클리핑 상태 머신

세션은 클리핑을 세 가지 상태로 관리한다.

| 상태 | 동작 |
|---|---|
| `.off` | 모델을 클리핑하지 않음 |
| `.on` | 저장된 bounds를 사용해 모델을 클리핑 |
| `.editing` | 클리핑 평면을 표시하고 사용자가 bounds를 편집 |

## 상태별 구성 요소

### `.off`

- `ClippingComponent` 제거
- 마지막으로 편집한 bounds는 커스텀 `ClippingBoundsCache`에 저장

### `.on`

- 저장된 bounds로 `ClippingComponent` 생성
- bounds 외부 지오메트리 제거

### `.editing`

- `ClippingComponent` 유지
- 여섯 개의 시각적 클리핑 평면 표시
- `ClippingTransformSync`로 모델 변환 추적
- `ClippingControl` 엔티티로 편집 UI 관리

이 구조를 사용하면 클리핑을 끄더라도 사용자가 마지막으로 조정한 경계를 보존할 수 있다.

---

# 6. 여섯 개의 클리핑 평면

축 정렬 경계 상자는 총 여섯 면을 가진다.

| 축 | 평면 |
|---|---|
| X | +X, -X |
| Y | +Y, -Y |
| Z | +Z, -Z |

각 평면은 bounds의 스칼라 값 하나를 제어한다.

사용자가 특정 평면을 당기거나 밀면 해당 축 방향의 최소값 또는 최대값이 변경된다.

예를 들어 +X 평면을 이동하면 X축의 최대 경계가 바뀌고, 모델에서 보이는 영역도 즉시 변경된다.

전체 상호작용 모델은 다음과 같이 정리할 수 있다.

- 여섯 개의 시각적 평면
- 여섯 개의 bounds 값
- 각 평면은 하나의 값만 제어
- 이동은 해당 평면의 법선 방향으로 제한

---

# 7. 네 개의 좌표 프레임

클리핑 평면을 드래그해 bounds를 변경하려면 여러 좌표계 사이의 변환이 필요하다.

세션에서는 네 개의 좌표 프레임을 사용한다.

| 좌표 프레임 | 역할 |
|---|---|
| World | 모든 엔티티가 배치되는 기준 공간 |
| Model | `ClippingComponent.bounds`가 표현되는 모델 로컬 공간 |
| Clipping Control | 편집 평면을 관리하는 엔티티의 공간 |
| Clipping Plane | 드래그 제스처 입력이 표현되는 각 평면의 공간 |

계층 구조는 대략 다음과 같다.

```text
World
├── Model
└── Clipping Control
    └── Clipping Plane
```

드래그 입력은 Clipping Plane 공간에서 발생하지만, 클리핑 bounds는 Model 공간에서 변경해야 한다.

따라서 드래그 변화량을 다음 순서로 변환한다.

1. Clipping Plane 공간
2. World 공간
3. Model 공간
4. 평면 법선 방향으로 제한
5. Model의 bounds 갱신
6. 다시 Clipping Plane 공간으로 변환
7. 시각적 평면 위치 갱신

---

# 8. 벡터 투영

사용자의 손은 임의의 3차원 방향으로 움직일 수 있지만, 각 클리핑 평면은 자신의 법선 방향으로만 이동해야 한다.

이를 위해 드래그 델타를 평면의 법선 벡터에 투영한다.

벡터 `v`를 방향 벡터 `n`에 투영하는 과정은 다음과 같다.

```text
projection(v, n) = n × dot(v, n) / dot(n, n)
```

법선 벡터가 단위 벡터라면 식은 다음처럼 단순해진다.

```text
projection(v, n) = n × dot(v, n)
```

예를 들어 +X 평면의 법선은 `{1, 0, 0}`이다.

사용자의 드래그 변화량에서 X 방향 성분만 추출하면 Y와 Z 방향의 손 움직임은 무시되고, 평면은 X축으로만 움직인다.

## 두 번의 투영

세션에서는 두 목적을 위해 투영을 사용한다.

1. **Model 공간에서 bounds 변경**
   - 드래그 델타를 Model 공간으로 변환
   - 평면 법선 방향으로 투영
   - clipping bounds 갱신

2. **Clipping Plane의 시각적 위치 변경**
   - 제한된 델타를 Clipping Plane 공간으로 변환
   - 해당 평면의 법선 방향으로 다시 투영
   - 시각적 평면 위치 갱신

이렇게 하면 모델의 클리핑 결과와 사용자가 보는 평면 위치가 일치한다.

---

# 9. 자동 확장

자동 확장은 모델의 하위 어셈블리를 한 축을 따라 펼쳐 내부 구조를 드러내는 기능이다.

확장 전에는 모든 부품이 실제 제품과 같은 위치에 겹쳐 있다.

확장 후에는 부품 사이에 간격이 생겨 다음이 가능해진다.

- 각 부품을 개별적으로 확인
- 부품 간 조립 관계 이해
- 특정 하위 어셈블리 선택
- 부품을 직접 잡아 이동
- 전체 구조를 분해도 형태로 검토

문제는 모델마다 가장 자연스러운 확장 방향이 다르다는 점이다.

사용자에게 축을 직접 선택하게 하는 대신, 코드가 모델의 공간적 분포를 분석해 확장 축을 결정한다.

---

# 10. 분산

분산은 값들이 평균에서 얼마나 퍼져 있는지를 나타낸다.

값 `x₁ ... xₙ`과 평균 `μ`가 있을 때 일반적인 분산은 다음과 같다.

```text
variance = Σ(xᵢ - μ)² / n
```

| 분산 | 의미 |
|---|---|
| 낮은 분산 | 값들이 서로 가까이 모여 있음 |
| 높은 분산 | 값들이 넓게 퍼져 있음 |

3D 모델에서는 각 하위 어셈블리의 X, Y, Z 위치를 사용해 축별 분산을 계산할 수 있다.

가장 큰 분산을 가진 축은 부품들이 원래부터 가장 넓게 배치된 방향이므로, 분해도를 펼치기에 자연스러운 후보가 된다.

---

# 11. 부피 가중 위치 분산

모든 부품을 같은 비중으로 계산하면 아주 작은 나사나 자석도 큰 케이스와 동일한 영향력을 가진다.

세션에서는 각 하위 어셈블리의 부피를 가중치로 사용한다.

가중 평균과 가중 분산의 개념은 다음과 같다.

```text
weightedMean = Σ(wᵢxᵢ) / Σwᵢ
```

```text
weightedVariance = Σ(wᵢ(xᵢ - weightedMean)²) / Σwᵢ
```

여기서:

- `xᵢ`: 해당 축에서 부품의 위치
- `wᵢ`: 부품의 부피

이를 X, Y, Z축 각각에 적용한다.

## 축 선택 과정

1. 각 하위 어셈블리의 위치 계산
2. 각 하위 어셈블리의 부피 계산
3. X축 부피 가중 분산 계산
4. Y축 부피 가중 분산 계산
5. Z축 부피 가중 분산 계산
6. 가장 큰 값을 가진 축 선택
7. 선택한 축을 따라 부품의 목표 위치 계산

AirPods Pro 모델 예제에서는 큰 부품들이 Y축을 따라 더 멀리 퍼져 있고 부피도 크기 때문에 Y축의 가중 분산이 가장 크게 나온다.

---

# 12. 분해 애니메이션

확장 축을 결정하면 각 하위 어셈블리를 해당 축 위의 새로운 위치로 이동시킨다.

세션에서는 `FromToBy` 애니메이션을 조합해 부품을 펼친다.

애니메이션의 일반적인 흐름은 다음과 같다.

1. 현재 로컬 위치 저장
2. 확장 축을 기준으로 목표 offset 계산
3. 각 하위 어셈블리에 애니메이션 정의
4. 여러 애니메이션을 하나의 시퀀스 또는 그룹으로 구성
5. 전체 어셈블리를 동시에 펼침
6. 닫을 때는 저장된 원래 위치로 복귀

계층 구조가 잘 보존되어 있기 때문에 개별 메시가 아니라 의미 있는 하위 어셈블리 단위로 애니메이션할 수 있다.

---

# 13. 전체 구현 구조

| 기능 | 핵심 구성 |
|---|---|
| 3D 구조 준비 | 깊은 USDZ 계층, 의미 있는 노드 이름 |
| 전체 모델 조작 | 루트의 `ManipulationComponent` |
| 개별 부품 조작 | 자식의 `ManipulationComponent` |
| 입력 처리 | `InputTargetComponent`, `CollisionComponent` |
| 클리핑 | `ClippingComponent` |
| bounds 보존 | `ClippingBoundsCache` |
| 평면 동기화 | `ClippingTransformSync` |
| 클리핑 편집 UI | `ClippingControl`과 여섯 개 평면 |
| 제스처 제한 | 좌표 변환과 평면 법선 투영 |
| 확장 축 선택 | 부피 가중 위치 분산 |
| 분해 애니메이션 | `FromToBy` 애니메이션 조합 |

---

# 14. 개발자 체크 포인트

- [ ] USDZ를 내보낼 때 원본 계층 구조가 유지되는지 확인
- [ ] 부품과 하위 어셈블리에 의미 있는 이름을 부여
- [ ] 개별 조작 단위와 전체 조작 단위를 미리 설계
- [ ] `ManipulationComponent`와 `InputTargetComponent`의 위치를 명확히 관리
- [ ] 조작 대상에 적절한 `CollisionComponent`와 collision shape 제공
- [ ] 어셈블리를 열고 닫을 때 컴포넌트 중복이나 잔존 여부 확인
- [ ] `releaseBehavior`가 경험에 적합한지 검토
- [ ] `shouldClipChildren` 설정 확인
- [ ] 클리핑 bounds를 모델 로컬 좌표로 관리
- [ ] 제스처가 발생하는 좌표계와 bounds 좌표계를 구분
- [ ] 위치와 벡터 변환을 혼동하지 않도록 타입과 함수 분리
- [ ] 드래그 델타를 평면 법선 방향으로 제한
- [ ] 클리핑 평면과 실제 bounds가 항상 동기화되는지 확인
- [ ] 모델 이동·회전·크기 변경 후 편집 평면이 정상 추적되는지 확인
- [ ] 클리핑의 `.off`, `.on`, `.editing` 상태 전환 검증
- [ ] 부품 부피 계산이 모델 scale과 좌표계에 맞는지 확인
- [ ] 확장 축 계산에서 작은 부품이 과도한 영향을 주지 않는지 확인
- [ ] 분해 애니메이션 종료 후 원래 위치로 정확히 복원되는지 확인
- [ ] SharePlay 환경에서 모델 상태와 조작 결과가 일관되게 동기화되는지 확인
- [ ] 복잡한 모델에서 렌더링, collision, gesture 성능 측정

---

# 함께 보면 좋은 세션

- Manipulating models with RealityKit
- Explore the Spatial Preview framework
- Explore enhancements to object tracking for visionOS
- Share visionOS experiences with people nearby
- Better together: SwiftUI and RealityKit
- What’s new in RealityKit
- Optimize 3D assets for spatial computing
