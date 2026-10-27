# WWDC26 — Principles of great design

- **Session:** 250
- **Speakers:** Linda, Doug — Design Evangelists at Apple
- **Source:** https://developer.apple.com/videos/play/wwdc2026/250/
- **Basis:** Apple Developer 공식 전체 transcript
- **Topic:** Apple 플랫폼을 위한 기본 디자인 원칙
- **Chapters:** Intro, Purpose, Agency, Responsibility, Familiarity, Flexibility, Simplicity, Craft, Delight

---

## 🎯 한 줄 요약

Apple이 말하는 좋은 디자인은 단순히 보기 좋거나 사용하기 편한 UI가 아니라, **사람의 시간·주의·신뢰를 존중하면서 의도적으로 무엇을 만들고 무엇을 만들지 않을지 결정하는 과정**이다. 이를 위해 Purpose, Agency, Responsibility, Familiarity, Flexibility, Simplicity, Craft, Delight라는 원칙을 함께 고려해야 한다.

---

## 🧭 디자인이란 무엇인가

세션은 “디자인이란 무엇인가?”라는 질문에서 시작한다. 흔히 디자인을 “무엇이 어떻게 보이는가” 또는 “무엇이 어떻게 동작하는가”로 생각하지만, Apple은 이를 불완전한 정의라고 본다.

이 세션에서 제시하는 핵심 정의는 다음과 같다.

> **Design is making something with intention.**

즉, 디자인은 의도를 가지고 무언가를 만드는 일이다. 사람에게 무엇이 가장 중요한지 집중하고, 그 결과 정말 가치 있다고 느낄 경험을 만드는 과정이다.

모든 기능은 사용자에게 무언가를 요구한다.

- 시간
- 주의
- 신뢰

이 셋은 모두 낭비해서는 안 되는 자원이다. 따라서 무엇을 추가할지 고민하는 것만큼 **무엇을 넣지 않을지 결정하는 것**도 중요하다.

Apple은 하나의 완벽한 공식이나 정답 조합이 있다고 말하지 않는다. 한 원칙을 강하게 적용하면 다른 원칙과 충돌하는 것처럼 보일 수도 있다. 결국 제품과 사용자 맥락을 이해하고, 지식과 직관을 사용해 적절한 균형점을 찾아야 한다.

---

# 🎯 Purpose — 목적

Purpose는 모든 디자인 원칙의 출발점이다.

코드를 작성하거나 첫 스케치를 그리기 전에 먼저 물어야 한다.

- 이 기능은 왜 존재하는가?
- 사용자의 실제 문제를 해결하는가?
- 이 경험이 사람에게 진짜 가치를 제공하는가?
- 단순히 “만들 수 있기 때문에” 추가하고 있지는 않은가?

좋은 경험은 사람을 위해 존재한다.

Apple이 설명한 좋은 경험의 특징은 다음과 같다.

- 사람의 삶을 존중한다.
- 상황에 맞춰 적응한다.
- 명확하다.
- 세심하게 고려되어 있다.
- 잘 설계되었을 때 사용 자체가 즐겁다.

Purpose는 기능 목록을 늘리는 원칙이 아니다. 오히려 **제품의 핵심 목적과 관계없는 요소를 제거하는 판단 기준**에 가깝다.

### 실무 질문

- 이 기능이 없으면 핵심 경험이 약해지는가?
- 사용자가 이 기능을 이해하기 위해 추가 학습을 해야 하는가?
- 기능을 추가함으로써 얻는 가치가 복잡성보다 큰가?
- 같은 문제를 더 단순한 방식으로 해결할 수 있는가?

---

# 🕹️ Agency — 주도권

Agency는 **사람이 자신의 경험을 통제할 수 있게 하는 것**이다.

Apple은 사용자를 미리 정해진 경로로 밀어 넣기보다, 스스로 원하는 것을 탐색하고 자신의 속도로 움직일 수 있게 해야 한다고 설명한다.

## 선택권 제공

Agency를 제공하는 가장 직접적인 방법은 선택권을 주는 것이다.

좋은 인터페이스는 사용자가 하려는 일을 방해하지 않는다.

- 불필요한 온보딩으로 진입을 막지 않는다.
- 반드시 특정 순서를 따라야만 기능을 사용할 수 있게 하지 않는다.
- 사용자가 원하는 곳으로 바로 이동할 수 있게 한다.
- 탐색 속도를 사용자가 결정할 수 있게 한다.

사용자가 경험을 통제할 수 있을 때 참여도도 높아진다.

## Forgiveness — 실수를 회복할 수 있게 하기

자유에는 실수가 따른다.

사용자는 실수로 다음과 같은 일을 자주 한다.

- 전송
- 변경
- 삭제

따라서 좋은 인터페이스는 **forgiveness**, 즉 실수를 회복할 수 있는 구조를 제공해야 한다.

대표적인 방법:

- Undo 제공
- 삭제 취소
- 이전 상태 복구
- destructive action 전 확인

Apple은 확인창 자체를 많이 띄우라고 말하지 않는다. **큰 실수가 발생할 수 있는 순간에만 interruption을 사용**하라고 강조한다.

너무 잦은 확인창은 오히려 사용자의 흐름을 방해하고 확인 메시지를 무시하게 만든다.

### Agency와 forgiveness의 관계

Undo와 복구 기능이 있으면 사용자는 새로운 기능을 더 자유롭게 탐색할 수 있다.

사용자는 다음과 같은 감정을 갖게 된다.

- 자신감
- 안정감
- 자유로움

즉, “실수해도 돌아올 수 있다”는 확신이 Agency를 강화한다.

### 실무 체크

- [ ] 사용자가 원하는 기능으로 바로 이동할 수 있는가?
- [ ] 불필요한 강제 흐름은 없는가?
- [ ] 실수로 삭제한 내용을 복구할 수 있는가?
- [ ] Undo가 필요한 작업에 제공되고 있는가?
- [ ] destructive confirmation이 정말 필요한 순간에만 나오는가?

---

# 🛡️ Responsibility — 책임

자유를 제공하는 것만으로는 충분하지 않다. 사람의 안전과 이익도 보호해야 한다.

Apple이 말하는 Responsibility는 **사람의 최선의 이익을 위해 행동하는 것**이다.

## Privacy is a human right

Responsibility는 privacy에서 시작한다.

세션은 현실 세계에서 처음 만난 사람이 이유도 설명하지 않고 전화번호를 요구하는 상황을 예로 든다.

인터페이스에서도 비슷한 일이 흔히 발생한다.

- 앱 실행 직후 permission prompt 표시
- 왜 필요한지 설명하기 전에 개인 정보 요청
- 실제 기능에 필요하지 않은 정보까지 요구

책임 있는 디자인은 개인 정보를 현실 세계의 관계처럼 존중한다.

### 올바른 권한 요청

- 적절한 맥락에서 요청한다.
- 꼭 필요한 정보만 요구한다.
- 왜 필요한지 명확히 설명한다.
- 사용자가 기능의 가치를 이해한 뒤 요청한다.

권한 요청 타이밍 자체가 신뢰 형성의 일부다.

## Safety — 기능이 악용될 가능성까지 고려

Responsibility는 privacy만이 아니다.

기능을 설계할 때 다음 질문을 해야 한다.

- 이 기능은 어떻게 악용될 수 있는가?
- 누가 피해를 볼 수 있는가?
- 어떤 잘못된 결과가 발생할 수 있는가?
- 어떻게 예방할 수 있는가?

## AI 기능의 책임

Apple은 AI 기능을 구체적인 사례로 든다.

AI 모델은 예상하지 못한 결과나 부정확한 답을 생성할 수 있다.

예를 들어 레시피 앱에서 사용자가 알레르기를 등록했는데, 모델이 해당 알레르기를 유발하는 재료를 추천하면 실제 신체적 피해가 발생할 수 있다.

따라서 “모델이 대부분 맞는다”는 기대만으로는 충분하지 않다.

고려할 수 있는 safeguard:

- 결과 preview
- 확인 절차
- disclaimer
- 위험한 입력 또는 결과 제한
- 사람의 검증 단계

그리고 가장 중요한 기준:

> 기능의 위험이 제공하는 가치보다 크다면 기능 자체를 제거할 수도 있어야 한다.

Responsibility는 제품의 신뢰와 직접 연결된다.

### 실무 체크

- [ ] 앱 시작 직후 불필요한 permission을 요청하지 않는가?
- [ ] 요청 이유가 사용자에게 명확한가?
- [ ] 최소한의 데이터만 수집하는가?
- [ ] 기능 오용 시 피해를 받을 사람을 고려했는가?
- [ ] AI 결과가 틀렸을 때 발생할 수 있는 최악의 결과를 검토했는가?
- [ ] 위험이 크다면 기능 제거까지 고려했는가?

---

# 🧠 Familiarity — 익숙함

사용자는 앱을 처음 사용하더라도 아무것도 모르는 상태가 아니다.

이미 다음과 같은 경험을 가지고 있다.

- 현실 세계 경험
- 다른 앱의 사용 경험
- Apple 플랫폼의 convention
- 공통 아이콘과 interaction pattern

Familiarity는 이 기존 지식을 활용하는 것이다.

## Metaphor

초기 GUI부터 software는 현실 세계의 metaphor를 사용해 왔다.

대표 사례는 **Trash**다.

현실에서 필요 없는 물건을 버리는 장소라는 개념을 software의 삭제 동작에 연결한다.

그리고 실수했다면 Trash에서 복구할 수 있다는 동작 역시 현실 세계 metaphor와 연결된다.

좋은 metaphor는 다음 두 극단 사이의 균형을 찾는다.

- 너무 literal
- 너무 abstract

너무 literal하면 software의 실제 개념을 표현하지 못할 수 있고, 너무 abstract하면 사용자가 의미를 이해하지 못한다.

좋은 metaphor는 기존 지식을 이용해 **다음에 무슨 일이 일어날지 예측하게 한다.**

## Convention을 깨지 않기

Trash 아이콘을 삭제가 아닌 다른 기능에 사용하면 사용자 expectation과 충돌한다.

마찬가지로 흔한 delete action을 독창적으로 표현하려고 전혀 새로운 symbol을 만들면 즉시 인식하기 어렵다.

공통 동작에는 굳이 새로운 규칙을 만들 필요가 없다.

## Consistency

Familiarity는 consistency에서도 나온다.

> Things that look the same should behave the same.

모양이 같은 버튼이 각각

- 다른 화면으로 이동
- 토글
- modal 표시

처럼 완전히 다른 동작을 한다면 패턴을 학습하기 어렵다.

동작뿐 아니라 위치도 일관되어야 한다.

세션은 Mac window의 close button이 항상 왼쪽 위에 있다는 예를 든다. 같은 action이 여러 화면과 기기에서 같은 위치에 있으면 사용자는 생각할 필요 없이 바로 사용할 수 있다.

### 실무 체크

- [ ] 표준 아이콘을 예상되는 의미로 사용하고 있는가?
- [ ] 같은 모양의 control은 같은 유형의 동작을 하는가?
- [ ] 공통 action이 화면마다 다른 위치로 이동하지 않는가?
- [ ] 새로운 interaction을 도입할 이유가 충분한가?
- [ ] 사용자가 기존 지식으로 다음 동작을 예측할 수 있는가?

---

# 🔀 Flexibility — 유연성

사용자는 모두 같은 상황에서 앱을 사용하지 않는다.

Flexibility는 사람의 실제 삶과 사용 환경이 다양하다는 사실을 인정하는 원칙이다.

## Context에 맞춰 변화하기

세션은 음악을 예로 든다.

같은 음악 경험도 상황에 따라 interaction이 완전히 달라진다.

- 집: 스피커 제어
- 달리기: AirPods + Apple Watch
- 운전: hands-free 경험

좋은 인터페이스는 특정 상황 하나만 가정하지 않는다.

## 플랫폼별 강점 사용

모든 Apple 기기에 동일한 UI를 복사하는 것이 flexibility는 아니다.

- iPhone: 빠르고 touch 중심 interaction
- Mac: 깊은 workflow, 정밀한 pointer control

Apple은 **각 기기가 가진 고유한 강점을 활용하는 solution**을 만들라고 강조한다.

즉, cross-platform consistency와 platform-specific optimization은 동시에 고려해야 한다.

## 사람의 능력과 다양성

Flexibility는 hardware만의 문제가 아니다.

사용자 자체도 다양하다.

- 연령
- 언어
- 숙련도
- novice / pro
- accessibility 기능 사용 여부

처음부터 모든 사람을 완벽히 지원하지 못하더라도, 누가 사용하고 있는지 적극적으로 이해하고 더 포용적으로 개선할 기회를 찾아야 한다.

## Personalization

모든 사용자에게 하나의 최적 UI를 제공할 수 없는 문제도 있다.

이때 좋은 해법은 personalization이다.

예:

- control 재배치
- 사용하지 않는 control 숨기기
- 개인 workflow에 맞는 구성

Flexibility는 구현 비용이 드는 투자지만, 사용자 입장에서는 “나를 고려해서 만든 제품”이라는 느낌을 준다.

### 실무 체크

- [ ] iPhone, iPad, Mac에서 동일 UI를 단순 확대/축소하고 있지 않은가?
- [ ] 각 플랫폼의 input model을 활용하는가?
- [ ] novice와 power user 모두를 고려하는가?
- [ ] accessibility 기능과 함께 사용할 수 있는가?
- [ ] 개인화가 유용한 영역이 있는가?
- [ ] control layout을 사용자가 조절할 필요가 있는가?

---

# ✂️ Simplicity — 단순함

Apple은 Simplicity와 Minimalism을 명확히 구분한다.

> **Simple does not mean minimal.**

기능을 한 메뉴 안에 전부 숨기면 화면은 더 minimal하게 보일 수 있지만, 사용하기 더 단순해지는 것은 아니다.

Simplicity는 **불필요한 friction을 제거해서 핵심 목적을 드러내는 것**이다.

## Concise

간결한 interface는 plain language를 사용한다.

- jargon 제거
- 자연스러운 표현
- 중복 제거
- 핵심을 직접 전달
- 작업 단계 감소

간결함은 사용자의 시간을 존중하는 방식이다.

## Clear

명확한 디자인은 무엇을 할 수 있는지 제대로 전달한다.

Clarity는 hierarchy에서 나온다.

- 순서
- spacing
- contrast

이를 이용해 가장 중요한 요소가 가장 먼저 보이게 한다.

좋은 interface는 사용자에게 다음 질문의 답을 즉시 제공한다.

- 무엇을 봐야 하는가?
- 무엇과 상호작용할 수 있는가?
- 어떻게 상호작용하는가?

## 모든 요소는 존재 이유가 있어야 한다

화면의 각 요소는 자신의 자리를 “얻어야” 한다.

검토할 수 있는 것:

- 복잡한 숫자 데이터를 그래프로 바꿀 수 있는가?
- 긴 정보를 요약할 수 있는가?
- 사용자가 실제로 신경 쓰는 정보에 집중할 수 있는가?

## 때로는 더 추가하는 것이 더 단순하다

Apple은 video play/pause control을 사례로 든다.

Play/pause 버튼 하나만 있으면 minimal하지만, 사용자가 나중에 돌아왔을 때 현재 재생 위치와 남은 시간을 모를 수 있다.

진행률과 시간 정보를 추가하면 화면 요소는 늘어나지만 **판단하기 쉬워져 전체 경험은 더 단순**해진다.

즉, 좋은 simplicity는 무조건 제거하는 것이 아니다.

정확히 필요한 만큼만 제공하는 것이다.

### 실무 체크

- [ ] Minimalism을 simplicity로 착각하고 있지 않은가?
- [ ] 사용자가 필요한 기능을 쉽게 발견할 수 있는가?
- [ ] jargon과 내부 용어가 노출되고 있지 않은가?
- [ ] 한 작업에 불필요하게 많은 단계가 필요한가?
- [ ] 화면의 visual hierarchy가 명확한가?
- [ ] 판단에 필요한 context가 부족하지 않은가?

---

# 🛠️ Craft — 완성도

Craft는 작은 디테일을 통해 “이 경험을 정말 신경 써서 만들었다”는 느낌을 주는 것이다.

현실 세계에서 허술하게 만들어진 물건은 바로 느낄 수 있다.

- 닫히지 않는 문
- 세탁 후 풀리는 옷

Software도 마찬가지다.

낮은 완성도의 신호:

- 버튼을 눌렀는데 반응이 늦음
- scrolling이 끊김
- icon 정렬이 맞지 않음
- device rotation 후 layout이 깨짐
- UI 상태가 예측하지 못하게 변함

이런 경험은 단순히 UI 품질 문제로 끝나지 않는다. 사용자는 제품이 제공하는 **결과 자체의 품질도 의심**하게 된다.

## 좋은 materials

Apple이 언급한 구성 요소:

- 기기 전반에서 좋은 typography
- light/dark 환경에 자연스럽게 적응하는 color
- 명확한 graphics와 iconography
- 즉각적이고 자연스러운 feedback을 제공하는 fluid animation
- 신뢰할 수 있고 안전한 SDK 기반

## Iteration

Craft는 한 번의 polishing 단계가 아니다.

품질을 높이려면 반복적으로 다듬어야 한다.

- 구현
- 확인
- 수정
- 다시 확인

그리고 제품이 출시된 뒤에도 계속된다.

## Longevity

좋은 디자인은 오래 유지된다.

새로운 기능이나 hardware가 등장했을 때 제품에 의미가 있는지 검토하고, 적절한 경우 경험을 발전시켜야 한다.

사용자는 제품이 플랫폼 변화와 함께 계속 개선될 때 자신이 지속적으로 지원받고 있다는 느낌을 받는다.

### 실무 체크

- [ ] touch/click feedback이 즉각적인가?
- [ ] scrolling과 animation이 부드러운가?
- [ ] typography와 icon alignment가 정교한가?
- [ ] light/dark mode에서 모두 자연스러운가?
- [ ] 회전·resize·다양한 화면에서 layout이 안정적인가?
- [ ] 새 OS/hardware에 맞춰 경험을 지속적으로 개선하는가?

---

# ✨ Delight — 즐거움

Delight는 정의하기 어렵지만 경험하면 바로 알 수 있는 품질이다.

Delightful interface는

- 만족스럽고
- 풍부하며
- 사람과 감정적 연결을 만든다.

## Delight는 장식이 아니다

Apple이 특히 강조하는 부분이다.

Delight는 마지막에 confetti나 화려한 animation을 붙이는 것으로 만들어지지 않는다.

먼저 사용자가 어떤 감정을 느끼기를 원하는지 정해야 한다.

예:

- 편안함
- 자신감
- 설렘

그리고 디자인 전반에서 그 감정을 강화할 기회를 찾아야 한다.

## Delight는 다른 원칙의 결과

Delight를 별도의 visual effect로 생각하면 안 된다.

Apple은 Delight를 **다른 디자인 원칙을 제대로 적용했을 때 자연스럽게 생기는 결과**로 설명한다.

- Purpose가 명확하고
- Agency를 제공하고
- Responsibility를 지키며
- Familiarity를 활용하고
- Flexibility를 제공하고
- Simplicity를 만들고
- Craft를 끝까지 다듬으면

그 결과 사용자는 진정한 즐거움을 느끼게 된다.

---

# 🔗 7가지 원칙의 관계

| 원칙 | 핵심 질문 | 잘못 적용했을 때 |
|---|---|---|
| Purpose | 왜 이것을 만드는가? | 목적 없는 기능 증가 |
| Agency | 사용자가 통제권을 갖는가? | 강제 흐름, 되돌릴 수 없는 작업 |
| Responsibility | 사람의 이익과 안전을 보호하는가? | privacy 침해, AI 오작동 피해 |
| Familiarity | 기존 지식을 활용할 수 있는가? | 예측 불가능한 UI |
| Flexibility | 다양한 상황과 사람을 지원하는가? | 한 환경에만 최적화 |
| Simplicity | 필요한 것을 쉽게 찾고 이해할 수 있는가? | minimal하지만 어려운 UI |
| Craft | 디테일과 품질을 끝까지 다듬었는가? | 느림, 깨짐, 불안정함 |
| Delight | 어떤 감정을 남기는가? | 장식적 gimmick에 의존 |

원칙들은 독립적 checklist가 아니다.

예를 들어:

- Agency를 높이면 자유가 증가하지만 Responsibility를 함께 고려해야 한다.
- Simplicity를 추구하면서 정보를 너무 제거하면 Agency나 Clarity가 약해질 수 있다.
- Familiarity를 유지하되 Flexibility를 위해 새로운 패턴이 필요할 수 있다.
- Delight를 과하게 추구하면 Purpose와 Simplicity를 해칠 수 있다.

Apple은 이 균형에 정답이 없으며, 제품 맥락에 맞춰 판단해야 한다고 설명한다.

---

# 📋 디자인 리뷰 체크리스트

## Purpose
- [ ] 이 기능의 존재 이유를 한 문장으로 설명할 수 있는가?
- [ ] 사용자가 실제로 얻는 가치가 있는가?
- [ ] 제거해도 경험이 나빠지지 않는 기능은 없는가?

## Agency
- [ ] 사용자가 원하는 경로를 선택할 수 있는가?
- [ ] 실수를 Undo/복구할 수 있는가?
- [ ] destructive confirmation이 적절한가?

## Responsibility
- [ ] 데이터 요청 시점과 이유가 자연스러운가?
- [ ] 최소한의 데이터만 요구하는가?
- [ ] 기능이 악용되거나 잘못 동작했을 때 피해를 검토했는가?
- [ ] AI 기능에 충분한 safeguard가 있는가?

## Familiarity
- [ ] 표준 symbol과 pattern을 예상되는 방식으로 사용하는가?
- [ ] 같은 형태의 control은 같은 방식으로 동작하는가?
- [ ] action 위치가 일관적인가?

## Flexibility
- [ ] 각 Apple 기기의 강점을 활용하는가?
- [ ] 다양한 연령·언어·숙련도·accessibility 요구를 고려했는가?
- [ ] 개인화가 필요한 영역을 지원하는가?

## Simplicity
- [ ] Minimalism이 아니라 friction 감소에 집중했는가?
- [ ] plain language를 사용하는가?
- [ ] hierarchy가 명확한가?
- [ ] 판단에 필요한 context를 충분히 제공하는가?

## Craft
- [ ] interaction feedback이 즉각적인가?
- [ ] scrolling/animation이 안정적인가?
- [ ] typography/color/iconography 완성도가 높은가?
- [ ] 다양한 화면과 상태에서 깨지지 않는가?

## Delight
- [ ] 사용자가 어떤 감정을 느끼길 원하는지 명확한가?
- [ ] 그 감정이 전체 경험에서 일관되게 강화되는가?
- [ ] Delight를 단순한 장식 효과로 처리하고 있지 않은가?

---

# 🧠 핵심 메시지

Apple이 이 세션에서 설명하는 좋은 디자인의 출발점은 **의도**다.

기능 하나를 추가할 때도 사람의 시간, 주의, 신뢰를 사용한다는 사실을 인식해야 한다. 좋은 제품은 더 많은 기능을 넣는 제품이 아니라, 사람에게 실제로 가치 있는 것만 선택하고 그 경험을 세심하게 완성한 제품이다.

Purpose가 방향을 정하고, Agency가 사용자의 통제권을 보장하며, Responsibility가 안전과 신뢰를 지킨다. Familiarity는 학습 부담을 줄이고, Flexibility는 다양한 상황과 사람에게 적응하게 한다. Simplicity는 friction을 걷어내고, Craft는 디테일까지 완성한다. 그리고 이 모든 것이 제대로 맞물릴 때 Delight가 자연스럽게 나타난다.

즉, **Delight는 목표라기보다 좋은 디자인을 끝까지 수행한 결과**다.

---

# 🔗 함께 보면 좋은 공식 자료

- [WWDC26 — Principles of great design](https://developer.apple.com/videos/play/wwdc2026/250/)
- [Human Interface Guidelines — Design principles](https://developer.apple.com/design/human-interface-guidelines/design-principles)
- [WWDC26 — Craft clear names for features and labels in your app](https://developer.apple.com/videos/play/wwdc2026/290/)
- WWDC17 — Essential Design Principles

