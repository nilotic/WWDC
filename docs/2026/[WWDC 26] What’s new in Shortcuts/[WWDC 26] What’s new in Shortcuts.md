# WWDC26 — What’s new in Shortcuts

- **Session:** 310
- **Source:** https://developer.apple.com/videos/play/wwdc2026/310/
- **Basis:** Apple Developer official full transcript and Code section
- **Topics:** Shortcuts, Automations, App Intents, Use Model, Apple Intelligence, Storage

---

## 🎯 한 줄 요약

Shortcuts의 2026 업데이트는 **자동화 진입점 확대**, **Use Model의 입력 가시성 개선**, **Shortcut 내부 영속 저장소 추가**라는 세 축으로 구성된다. 앱 개발자 관점에서는 **알림의 구조와 표현 품질**, **AppEntity가 모델에 노출하는 속성**, **여러 기기에서 일관된 entity identity**가 Shortcuts 통합 품질을 직접 결정한다.

---

## 🧭 세션 구성

| 시간 | 챕터 |
|---:|---|
| 0:01 | Introduction |
| 0:57 | Automations |
| 3:25 | Use Model |
| 6:58 | Storage |

세션은 Soup Chef라는 샘플 앱을 중심으로 진행된다. 이 앱은 수프를 조회하고 주문하는 App Intents를 제공하며, 알림·Use Model·Storage를 하나의 자동화 흐름으로 연결한다.

---

# ⚡ Automations

## Shortcuts 편집기 안으로 이동한 자동화

Automations는 이제 Shortcuts 편집기에서 액션과 함께 직접 구성할 수 있다. 사용자는 별도의 영역을 찾아가지 않고, Shortcut을 편집하는 흐름 안에서 Automation 섹션을 통해 트리거를 추가할 수 있다.

새로 추가된 automation 유형은 세 가지다.

- **Screenshot automation** — 스크린샷이 저장될 때 실행
- **Keyboard automation** — 외장 키보드가 연결되거나 연결 해제될 때 실행
- **Notification automation** — 특정 앱에서 알림이 도착할 때 실행

이 중 세션의 핵심 예제는 Notification automation이다.

## Notification automation과 알림 설계

Soup Chef 앱은 배달이 가까워지면 다음 정보를 담은 알림을 보낸다.

- 배달 기사 이름
- 배달이 곧 도착한다는 상태
- 예상 도착까지 남은 시간

사용자는 이 알림을 트리거로 삼아 다음 Shortcut을 실행한다.

1. 현관 조명 켜기
2. HomePod으로 배달이 곧 도착한다고 알리기

모든 Soup Chef 알림에 반응할 필요는 없으므로, Notification automation에 `arriving`이라는 문자열 필터를 추가한다. 알림 본문에 해당 단어가 들어간 경우에만 Shortcut이 실행된다.

### 알림 내용이 왜 중요한가

Apple은 이 예제를 통해 **Notification automation의 품질은 앱이 보내는 알림 자체의 품질에 달려 있다**고 설명한다.

좋은 알림은 다음 특징을 가진다.

- **Distinct** — 다른 알림과 구분되는 정보가 있음
- **Specific** — 사용자가 무엇이 일어났는지 분명히 이해할 수 있음
- **Actionable** — 다음 행동을 결정할 수 있는 정보가 있음

Soup Chef 예제에서는 기사 이름이 distinct한 정보, `arriving`이라는 동사가 구체적인 상태, 도착까지의 시간이 actionable한 정보다.

즉, 알림은 단순히 사용자에게 보여 주는 문자열이 아니라 **Shortcut이 해석할 수 있는 자동화 입력**이 된다.

### 개발 체크포인트

- 알림 title/body에 실제 상태를 표현하는 명확한 단어를 사용한다.
- 의미가 지나치게 모호한 마케팅 문구만 사용하지 않는다.
- 사용자가 자동화 필터로 사용할 만한 상태·대상·시간 정보를 포함한다.
- Human Interface Guidelines의 notification best practices를 따른다.

---

# 🧠 Use Model

## Shortcuts 안에서 LLM 사용

Use Model action은 Shortcut에서 대규모 언어 모델을 직접 사용할 수 있게 한다. 이번 업데이트에서는 더 강력한 Apple Intelligence 모델과 연결되며, 최신 정보를 얻기 위한 **web retrieval**도 활용할 수 있다.

중요한 점은 모델이 단순 텍스트만 받는 것이 아니라 **앱이 App Intents를 통해 제공한 AppEntity를 입력으로 받을 수 있다**는 것이다.

세션에서는 여행 일정 목록을 모델에 전달해 특정 여행과 관련된 이벤트를 찾는 예제를 먼저 보여준다.

## Soup of the Day 예제

Soup Chef에는 이미 다음 App Intents 기반 액션이 있다.

- **Find Soups** — `EntityPropertyQuery`를 통해 수프 목록 조회 및 필터링
- **Order Soup** — 선택된 수프를 인자로 받아 확인 후 주문

사용자는 다음 Shortcut을 만든다.

1. 오늘 주문 가능한 수프 조회
2. Use Model에 수프 목록 전달
3. 사용자의 매운맛 선호에 맞는 수프 선택
4. 선택된 수프를 Order Soup으로 전달

첫 실행에서 모델은 Chicken Tortilla Soup을 고른다. 하지만 실제로는 맵지 않은 메뉴다.

문제는 모델 자체가 아니라 **모델이 받은 entity 정보가 부족했다는 것**이다.

---

## 🔎 Model transcript inspector

이번 업데이트의 중요한 변화 중 하나가 **Use Model transcript를 직접 확인할 수 있게 된 것**이다.

모델의 출력이 예상과 다를 때, 이제 Shortcut에서 Use Model 결과의 `Transcript` property를 확인할 수 있다.

세션에서는 Use Model 뒤에 Show Content action을 배치하고, 출력에서 Transcript를 선택한다.

이 transcript에는 다음이 보인다.

- 모델에 실제로 전달된 AppEntity
- 각 entity의 구조화된 표현
- 모델이 볼 수 있었던 property 목록

SoupEntity를 확인해 보니 모델이 볼 수 있는 값은 사실상 다음뿐이었다.

- 이름
- 오늘 판매 가능 여부

매운맛을 판단할 정보가 없었기 때문에 모델의 선택이 기대와 달랐던 것이다.

### 중요한 디버깅 원칙

모델이 잘못된 결과를 냈을 때 바로 prompt부터 바꾸는 것이 아니라, 먼저 **“모델이 실제로 무엇을 봤는가?”**를 확인한다.

Use Model transcript는 AppEntity 설계와 prompt 문제를 분리해서 진단하는 도구가 된다.

---

## 🧩 AppEntity 표현 개선

세션의 `SoupEntity`는 다음과 같다.

```swift
import AppIntents

struct SoupEntity: AppEntity, Identifiable {
    static var typeDisplayRepresentation = TypeDisplayRepresentation(
        name: "Soup",
        numericFormat: "\(placeholder: .int) soups"
    )
    static var defaultQuery = SoupEntityQuery()

    var id: Soup.ID

    @Property var name: String

    @Property(title: "Available Today")
    var isAvailableToday: Bool

    @Property(title: "Ingredients")
    var ingredients: String

    var displayRepresentation: DisplayRepresentation {
        DisplayRepresentation(
            title: "\(name)",
            subtitle: SoupStore.description(for: id)
        )
    }
}
```

초기 버전에는 `name`과 `isAvailableToday`만 있었다. 여기에 `ingredients`를 추가해 모델이 음식의 성격을 더 잘 판단하도록 한다.

세션 설명에서는 각 ingredient와 1인분 기준 양을 문자열로 포함하도록 구성한다.

Entity 속성을 추가한 뒤 같은 Shortcut을 다시 실행하면 모델은 Tom Yum을 선택한다. 즉, **모델 성능을 높인 것은 더 복잡한 prompt가 아니라 더 좋은 entity representation**이었다.

### AppEntity 설계 원칙

Use Model에서 AppEntity를 사용할 때는 다음을 확인한다.

- 모델이 의사결정에 필요한 property가 실제로 노출되어 있는가?
- property 이름이 의미를 잘 설명하는가?
- display representation만 보고 충분하다고 착각하고 있지 않은가?
- 모델 transcript에서 entity가 원하는 구조로 전달되는가?
- 너무 적은 정보 때문에 모델이 추측을 강요받고 있지 않은가?

---

# 💾 Storage

## Shortcut 실행 간 데이터 유지

Storage는 Shortcut 안에 값을 저장해 **다음 실행에서도 다시 사용할 수 있게 하는 기능**이다.

Shortcuts 편집기에는 저장된 값을 생성·조회·편집할 수 있는 화면이 추가된다.

저장 범위는 두 종류로 나뉜다.

### Shortcut-local storage

특정 Shortcut에서만 사용하는 값이다.

### Global storage

여러 Shortcut에서 공유하는 값이다. 세션에서는 API key처럼 여러 Shortcut에서 참조할 수 있는 데이터를 예로 든다.

Storage에는 값을 가져오고 갱신하기 위한 액션이 제공된다. 이를 이용하면 단순 카운터부터 복잡한 AppEntity 목록까지 유지할 수 있다.

---

## 🏎️ Use Model에 “기억” 추가하기

세션에서는 매일 모터스포츠 기술 사실을 보여 주는 Shortcut을 예로 든다.

Use Model은 예측 가능한 출력을 내도록 설계되어 있기 때문에, 같은 입력을 반복하면 비슷한 결과가 나올 수 있다. 하지만 이 Shortcut의 목적은 매일 다른 내용을 보여 주는 것이다.

Storage를 사용해 다음 흐름을 만든다.

1. `Previous Facts`라는 저장 값을 읽는다.
2. 지금까지 사용한 사실 목록을 모델에 전달한다.
3. 모델에게 이전 사실을 피하라고 요청한다.
4. 새 사실을 결과로 받는다.
5. Add to List로 기존 목록에 새 사실을 추가한다.
6. 갱신된 목록을 Storage에 다시 저장한다.

이 방식으로 모델 자체의 deterministic 성격을 바꾸지 않고, **외부 상태를 추가해 매 실행마다 다른 결과를 유도**한다.

---

## 🍲 Soup of the Day에 기억 추가

같은 방식을 Soup of the Day에 적용한다.

문제:
- Use Model이 며칠 연속 같은 수프를 선택할 수 있음

해결:
1. 최근 선택된 수프 목록을 Storage에서 가져옴
2. 목록을 Use Model 입력에 포함
3. 이전 선택을 피하도록 요청
4. 새 선택을 Storage에 추가

이후 Storage 화면에서는 실제 AppEntity인 수프 목록을 볼 수 있다.

중요한 점은 Storage가 문자열이나 숫자뿐 아니라 **AppEntity 자체도 저장할 수 있다**는 것이다.

---

# ☁️ 기기 간 동기화

Shortcut의 저장 값은 iCloud를 통해 사용자의 여러 기기에 동기화된다.

예를 들어 iPhone에서 Soup of the Day를 여러 번 실행해 최근 선택 목록을 저장했다면, iPad에서 같은 Shortcut을 실행해도 그 기록을 이어서 사용할 수 있다.

이 기능은 AppEntity 설계에 새로운 요구사항을 만든다.

## AppEntity identifier는 기기마다 동일해야 함

저장된 entity는 iPhone에서 생성되었더라도 iPad나 Mac 앱이 같은 entity로 인식할 수 있어야 한다.

따라서 identifier는 다음 특성을 가져야 한다.

- 특정 기기에 종속되지 않음
- 앱 재설치 또는 로컬 캐시 재생성으로 바뀌지 않음
- 같은 논리적 객체에 대해 모든 기기에서 동일함

Soup Chef는 온라인 데이터베이스를 사용하므로 **database row ID를 stable entity identifier**로 사용한다.

### 피해야 할 identifier 예

- 기기 로컬에서 매번 새로 생성한 UUID
- Core Data object의 기기별 임시 identifier
- 설치마다 달라지는 내부 row number
- cache 순서나 array index

### 권장되는 identifier 소스

- 서버의 immutable primary key
- 사용자 계정 범위에서 고정된 canonical ID
- 여러 기기에서 동일하게 재현 가능한 stable key

---

# 🔄 전체 통합 흐름

Soup Chef 예제를 하나의 파이프라인으로 보면 다음과 같다.

```text
App Notification
      ↓
Notification Automation
      ↓
Shortcut 실행
      ↓
Find Soups (App Intent / EntityPropertyQuery)
      ↓
SoupEntity 목록
      ↓
Storage에서 Previous Soups 조회
      ↓
Use Model
  ├─ 현재 가능한 수프
  ├─ ingredients
  └─ 이전 선택 기록
      ↓
새 SoupEntity 선택
      ↓
Order Soup Intent
      ↓
선택한 SoupEntity를 Storage에 추가
```

이 흐름에서 앱이 직접 담당하는 것은 세 가지다.

1. **자동화하기 좋은 알림 생성**
2. **LLM이 이해하기 좋은 AppEntity 설계**
3. **기기 간 재식별 가능한 stable identity 제공**

Shortcuts가 orchestration을 담당하고, 앱은 의미 있는 데이터와 액션을 제공한다.

---

# 🧪 디버깅 체크리스트

## Notification automation

- [ ] 알림이 구체적인 상태를 표현하는가?
- [ ] 필터에 사용할 수 있는 안정적인 키워드가 있는가?
- [ ] title/body가 너무 모호하지 않은가?
- [ ] 같은 앱의 다른 알림과 구분 가능한가?
- [ ] 실제 Notification automation에서 원하는 이벤트만 트리거되는가?

## Use Model

- [ ] 예상과 다른 결과가 나오면 Transcript부터 확인했는가?
- [ ] 모델에 필요한 AppEntity property가 모두 노출되어 있는가?
- [ ] property 이름과 데이터가 의미를 충분히 설명하는가?
- [ ] displayRepresentation과 실제 model-visible properties를 혼동하지 않았는가?
- [ ] 같은 entity를 전달했을 때 모델 transcript가 기대한 구조인지 확인했는가?

## Storage

- [ ] 저장 값의 scope가 shortcut-local인지 global인지 명확한가?
- [ ] 목록 갱신 시 이전 값을 읽고 새 값을 append한 뒤 다시 저장하는가?
- [ ] Storage에 저장된 AppEntity가 다른 기기에서도 resolve되는가?
- [ ] entity identifier가 device-local 값이 아닌가?
- [ ] iPhone/iPad/Mac 사이에서 동기화 후 동일 entity로 인식되는가?

---

# 🏗️ App Intents 설계 관점

이 세션은 새로운 App Intents API 자체를 깊게 설명하지는 않지만, Shortcuts에서 App Intents를 사용할 때의 설계 기준을 명확히 보여준다.

### EntityPropertyQuery

Find Soups처럼 사용자가 앱 콘텐츠를 검색·필터링할 수 있게 만든다. 해당 결과는 Shortcuts에서 그대로 Use Model 입력이 될 수 있다.

### AppEntity

단순히 Shortcuts 목록에 표시되는 데이터 구조가 아니라, 이제는 LLM 입력 표현이기도 하다. 따라서 property 설계가 모델의 reasoning 품질에 영향을 준다.

### AppIntent

Order Soup처럼 실제 side effect를 수행한다. 세션에서는 주문 전에 confirmation을 요청하는 구조를 사용한다.

즉, App Intents는 다음 세 역할을 동시에 수행한다.

- Shortcut 액션 노출
- Structured app content 제공
- LLM이 이해할 수 있는 semantic interface 제공

---

# 💡 실무에서 중요한 포인트

## 1. 모델 문제처럼 보여도 데이터 모델 문제일 수 있음

Soup 예제의 실패 원인은 prompt가 아니라 `SoupEntity`에 ingredients가 없었던 것이다. Use Model transcript를 먼저 확인하면 이런 문제를 빠르게 찾을 수 있다.

## 2. Notification은 automation API의 입력이 됨

알림은 더 이상 화면에 띄우는 UI copy만이 아니다. Shortcuts의 notification automation이 내용을 필터링하기 때문에, 알림 문구는 **machine-readable automation surface** 역할도 한다.

## 3. Storage가 Shortcut에 상태를 추가함

기존의 일회성 pipeline에서 벗어나, Shortcut이 이전 실행 결과를 기억할 수 있다. 이로써 반복 방지, history, counters, logs, recent selections 같은 패턴을 만들 수 있다.

## 4. AppEntity identifier는 distributed identity가 됨

Storage가 기기 간 동기화되면서 entity ID는 로컬 UI용 식별자가 아니라 **여러 기기에서 동일 객체를 재구성하기 위한 분산 identity**가 된다.

---

# 📋 적용 체크리스트

### App notifications
- [ ] 상태·대상·시간을 구체적으로 표현
- [ ] Shortcut filter에 활용 가능한 명확한 텍스트 사용
- [ ] HIG notification best practices 준수

### AppEntity
- [ ] Use Model에서 필요한 semantic property 노출
- [ ] 모델 transcript로 실제 representation 확인
- [ ] stable identifier 사용
- [ ] 모든 사용자 기기에서 동일 ID 보장

### App Intents
- [ ] Find/Query intent 제공 여부 검토
- [ ] side-effect intent에는 confirmation 필요성 검토
- [ ] Shortcut 체인에서 entity가 자연스럽게 다음 action으로 전달되는지 확인

### Storage
- [ ] 반복 실행 간 기억이 필요한 사용 사례 발굴
- [ ] global과 local storage scope 구분
- [ ] AppEntity 저장 후 여러 기기에서 resolve 테스트
- [ ] iCloud sync 후 state continuity 확인

---

# 🧠 핵심 메시지

Shortcuts의 이번 업데이트는 단순히 새 automation 몇 개를 추가한 것이 아니다. 앱이 제공하는 **알림, AppEntity, App Intent가 시스템 자동화와 LLM의 입력으로 직접 사용되는 구조**가 한층 더 강해졌다.

개발자가 준비해야 할 핵심은 다음 세 가지다.

- 사람이 읽기 좋고 자동화가 해석하기도 좋은 **알림**
- LLM이 올바른 판단을 내릴 수 있는 **풍부한 AppEntity representation**
- 여러 기기에서 동일 객체를 재식별할 수 있는 **stable entity identity**

그리고 Shortcuts의 Storage가 이 세 요소 사이에 지속성을 추가하면서, 단발성 automation이 아니라 **기억을 가진 개인 자동화 workflow**를 만들 수 있게 된다.

---

# 🔗 함께 보면 좋은 자료

- WWDC26 — What’s new in Shortcuts  
  https://developer.apple.com/videos/play/wwdc2026/310/
- WWDC25 — Develop for Shortcuts and Spotlight with App Intents
- Apple Developer — Shortcuts
- Apple Developer — App Intents
- Human Interface Guidelines — Notifications

