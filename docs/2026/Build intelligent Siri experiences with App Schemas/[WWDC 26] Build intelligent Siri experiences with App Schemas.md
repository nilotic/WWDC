# WWDC26 Build intelligent Siri experiences with App Schemas 요약

- Session: 240
- Title: Build intelligent Siri experiences with App Schemas
- Source: https://developer.apple.com/videos/play/wwdc2026/240/
- Topic: Siri, Apple Intelligence, App Intents, App Entities, App Schemas, Spotlight, Transferable

---

## 한 줄 요약

WWDC26의 “Build intelligent Siri experiences with App Schemas”는 **App Intents를 기반으로 앱의 콘텐츠와 동작을 Siri와 Apple Intelligence에 연결하는 방법**을 설명하는 세션이다. App Entities, App Schemas, IndexedEntity, View Annotations, Transferable, AppIntentsTesting을 조합해 Siri가 앱의 데이터를 이해하고, 자연어로 동작을 실행하며, 화면 맥락과 앱 간 콘텐츠 이동까지 처리할 수 있게 만드는 흐름을 다룬다.

---

## 핵심 요약

이번 세션은 크게 다섯 가지 흐름으로 구성된다.

1. **Siri와 App Intents의 변화**
   - Siri는 iOS 27 세대에서 Apple Intelligence 기반으로 더 맥락적이고 개인화된 경험을 제공한다.
   - 앱은 App Intents framework를 통해 Siri와 Apple Intelligence에 참여한다.
   - Siri는 앱의 entity를 찾고, intent를 실행하고, 화면에 보이는 내용을 이해할 수 있다.

2. **App Entities와 App Schemas**
   - App Entity는 앱 안의 실제 콘텐츠를 구조화해 시스템에 설명하는 방식이다.
   - App Schema는 메시지, 연락처, 문서 같은 공통 개념을 Siri가 이해할 수 있게 해준다.
   - 기존 데이터 모델을 새로 만드는 것이 아니라, 앱의 기존 데이터를 시스템이 이해 가능한 형태로 설명한다.

3. **Entity resolution과 IndexedEntity**
   - Siri가 사용자의 자연어 표현을 실제 앱 entity로 연결하는 과정이 entity resolution이다.
   - IndexedEntity를 채택하면 Spotlight semantic index를 통해 의미 기반 검색이 가능하다.
   - 미리 색인하기 어려운 데이터는 EntityStringQuery로 앱이 직접 검색 결과를 반환할 수 있다.

4. **App Intents, App Schemas, App Schema Domains**
   - App Intents는 앱의 동작을 시스템에 노출한다.
   - App Schemas는 Siri가 실행할 수 있는 구조화된 action contract다.
   - App Schema Domain은 메시지, 메일, 사진 등 특정 작업 범주에 필요한 schema 묶음이다.

5. **화면 인지와 앱 간 콘텐츠 이동**
   - UserActivity와 View Annotations로 화면의 콘텐츠를 entity와 연결한다.
   - Transferable과 IntentValueRepresentation으로 앱의 entity를 다른 앱이 이해할 수 있는 값으로 내보낸다.
   - IntentValueQuery 또는 importing을 사용해 다른 앱에서 들어온 콘텐츠를 기존 entity로 연결하거나 새 entity로 생성한다.

---

# 1. Introduction

세션은 Swift Intelligence Frameworks 팀의 Dan Niemeyer가 진행한다. 주제는 Apple Intelligence로 더 강력해진 Siri에 앱을 연결하는 방법이다.

iOS 27 세대의 Siri는 다음과 같은 방향으로 발전한다.

| 변화 | 내용 |
|---|---|
| 더 유능한 Siri | 앱의 콘텐츠를 이해하고 관련 정보를 찾을 수 있음 |
| 더 맥락적인 Siri | 사용자가 보고 있는 화면과 요청의 맥락을 함께 이해 |
| 더 개인적인 Siri | 사용자의 앱 데이터와 작업 흐름에 맞춘 응답과 동작 제공 |
| App Intents 중심 | 앱이 Siri와 Apple Intelligence에 참여하는 기본 기반 |

이 세션에서는 샘플 앱 **UnicornChat**을 중심으로 App Entities, App Schemas, semantic search, onscreen awareness, content transfer, testing 흐름을 순서대로 설명한다.

---

# 2. What's new in Siri

Siri는 App Intents를 기반으로 세 가지 주요 능력을 갖는다.

## 2.1 앱의 entity 접근

Siri는 앱 안의 의미 있는 콘텐츠를 entity로 이해할 수 있다.

예를 들어 캘린더 앱에서 “다음 회의가 언제 어디서 열려?”라고 물으면 Siri는 다음을 이해해야 한다.

- 회의가 앱 안의 어떤 entity인지
- 어떤 회의가 “다음 회의”인지
- 시간과 위치 같은 어떤 property를 반환해야 하는지

즉 Siri가 앱을 단순한 실행 대상이 아니라 구조화된 데이터 공급원으로 이해하게 된다.

## 2.2 앱 intent 실행

Siri는 앱이 제공하는 App Intent를 실행할 수 있다.

예를 들어 “내 최신 리포트를 Mary에게 보내줘”라고 말하면 Siri는 자연어를 이해하고, 앱은 intent의 parameter와 동작 구현에 집중한다.

| 역할 | 담당 |
|---|---|
| Siri | 자연어 이해, 사용자 의도 파악, parameter 채우기 |
| 앱 | intent 정의, parameter 처리, 실제 동작 수행 |

## 2.3 화면 맥락 이해

Siri는 사용자가 현재 보고 있는 화면의 내용을 이해할 수 있다.

예를 들어 사용자가 “이 텍스트 설명해줘”, “이 제품 리뷰 찾아줘”라고 말하면, Siri는 화면의 어떤 콘텐츠를 가리키는지 파악해야 한다. 이를 위해 앱은 view를 entity와 연결해 화면에 보이는 의미 있는 항목을 시스템에 알려준다.

---

# 3. Contributing content with App Entities

App Entity는 앱 안의 콘텐츠를 구조화해 시스템에 설명하는 방식이다.

예시는 다음과 같다.

| 앱 종류 | Entity 예시 |
|---|---|
| 캘린더 앱 | 이벤트 |
| 메일 앱 | 메시지 |
| 사진 앱 | 사진, 앨범 |
| 메시징 앱 | 연락처, 대화, 메시지 |

App Entity는 세 가지를 설명한다.

| 요소 | 설명 |
|---|---|
| What | 이 콘텐츠가 무엇인지 |
| Identity | 어떻게 식별되는지 |
| Properties | 제목, 날짜, 본문 같은 의미 있는 속성 |

중요한 점은 App Entity가 새로운 데이터 모델이 아니라는 것이다. 앱이 이미 가지고 있는 데이터를 Siri와 시스템이 이해할 수 있도록 설명하는 층이다.

## App Schemas

Entity를 만들었다고 해서 Siri가 바로 그 entity의 의미를 이해하는 것은 아니다. Siri가 entity의 범주를 이해하려면 App Schema를 채택해야 한다.

App Schema는 다음과 같은 공통 개념을 시스템이 미리 이해하도록 만든다.

- 메시지
- 연락처
- 문서
- 사진
- 대화

UnicornChat에서는 다음 세 가지 entity가 App Schema에 맞춰 모델링된다.

| Entity | 의미 |
|---|---|
| Contact | 메시지를 보낼 대상 |
| Conversation | 대화 |
| Message | 대화 안의 메시지 |

이를 통해 Siri는 “Flare가 보낸 마지막 메시지 보여줘” 또는 “Glow와의 UnicornChat 열어줘” 같은 요청을 이해할 수 있다.

---

# 4. Entity resolution and IndexedEntity

Entity resolution은 Siri가 사용자의 자연어 표현을 앱의 실제 entity로 연결하는 과정이다.

예를 들어 사용자가 “Glow와의 UnicornChat 열어줘”라고 말하면 Siri는 다음 과정을 거친다.

1. “Glow”가 특정 연락처를 의미한다고 판단
2. 앱의 Contact entity 중 Glow를 찾음
3. 해당 entity의 identifier와 property를 채움
4. intent나 시스템 동작에 사용

## IndexedEntity

사용자는 항상 정확한 이름으로만 말하지 않는다. 의미나 설명으로 요청하는 경우가 많다.

예를 들어 “Flare와 영화에 대해 이야기한 메시지 보여줘”는 단순 문자열 검색이 아니다. 이 경우 Siri는 메시지의 의미와 관계를 이해해야 한다.

이를 위해 사용하는 것이 **IndexedEntity**다.

IndexedEntity를 채택하면 앱의 entity가 시스템 semantic index에 색인된다. 그러면 Siri는 다음을 할 수 있다.

| 기능 | 설명 |
|---|---|
| 의미 기반 매칭 | 단순 문자열이 아니라 의미 기반으로 검색 |
| 관계 이해 | entity 간 관계를 활용 |
| 콘텐츠 질의응답 | indexed content를 바탕으로 질문에 답변 |
| follow-up 감소 | 사용자가 덜 구체적으로 말해도 적절한 항목을 찾음 |

`indexingKey`는 Spotlight가 어떤 property를 searchable content로 사용할지 알려준다. 예를 들어 메시지 entity에서는 message body가 검색 대상이 될 수 있다.

## EntityStringQuery

모든 데이터를 미리 색인할 수 있는 것은 아니다.

다음과 같은 경우에는 IndexedEntity 대신 EntityStringQuery를 사용할 수 있다.

- 데이터가 매우 큼
- 서버에만 존재함
- 너무 자주 변경됨
- 앱이 직접 검색 로직을 제어해야 함

EntityStringQuery를 사용하면 Siri가 사용자의 입력 문자열을 앱에 넘기고, 앱이 직접 검색해 entity 목록을 반환한다. 의미 기반 검색의 장점은 줄어들지만, 검색 방식과 결과를 앱이 완전히 제어할 수 있다.

---

# 5. Making actions available

App Intents는 앱의 동작을 시스템에 노출하는 방법이다.

일반 App Intent를 정의하면 해당 동작은 다음 시스템 경험에 나타날 수 있다.

- Shortcuts
- Spotlight
- Widgets
- 기타 시스템 제안

앱은 action의 의미, parameter, 실행 동작을 정의하고, 시스템은 이를 다양한 위치에서 발견 가능하게 만든다.

## App Schemas for Siri

Siri가 자연어로 action을 안정적으로 실행하려면 intent가 App Schema에 맞게 정의되어야 한다.

App Schema는 Siri가 이해하는 action 구조다.

| 개념 | 설명 |
|---|---|
| App Intent | 앱의 동작을 시스템에 노출 |
| App Schema | Siri가 이해하고 실행할 수 있는 구조화된 action |
| App Schema Domain | 특정 범주의 schema 묶음 |

예를 들어 메시지 앱이라면 “메시지 보내기”, “메시지 초안 작성” 같은 action이 messages domain에 포함된다.

App Schema Domain은 앱과 Siri 사이의 계약처럼 작동한다. 앱이 domain을 채택하면 Siri는 해당 앱이 어떤 종류의 작업을 수행할 수 있는지, 어떤 parameter가 필요한지, 어떤 응답을 제공해야 하는지 이해한다.

---

# 6. Adopting a schema domain in UnicornChat

세션에서는 UnicornChat 앱이 messages domain의 `sendMessage` schema를 채택하는 과정을 보여준다.

UnicornChat에서 메시지를 보내려면 두 가지 entity가 필요하다.

| Entity | 역할 |
|---|---|
| Contact | 수신자 |
| Message | 전송할 메시지 내용 |

Xcode에서 messages domain의 `sendMessage` schema를 선택하면, 앱은 Siri가 이미 이해하는 구조에 기존 메시징 로직을 연결하게 된다.

구현 흐름은 다음과 같다.

1. schema parameter를 앱의 entity와 연결
2. recipient와 message content를 처리
3. 기존 메시지 전송 UI 또는 로직에 전달
4. 새로 보낸 메시지를 app entity로 반환

이렇게 하면 사용자가 “UnicornChat에서 Glow에게 ‘What movies do you recommend?’라고 메시지 보내줘”라고 말했을 때 Siri는 다음을 처리한다.

- Glow를 Contact entity로 resolve
- message content를 parameter로 전달
- sendMessage intent 실행
- 앱을 열지 않고 메시지 전송 완료

핵심은 앱이 자연어 처리를 직접 구현하지 않는다는 점이다. 앱은 schema에 맞게 entity와 action을 설명하고, Siri가 자연어와 실행 흐름을 담당한다.

---

# 7. Moving content across apps

실제 사용자 요청은 한 앱 안에서 끝나지 않는 경우가 많다.

예를 들어 “Bubbles가 보낸 이 답장을 아내에게 이메일로 보내줘”라는 요청은 다음 두 가지가 필요하다.

1. 현재 화면에서 “이 답장”이 무엇인지 이해
2. 그 콘텐츠를 다른 앱으로 넘겨 이메일 작성 action 수행

이때 필요한 개념이 **onscreen awareness**와 **content transfer**다.

---

# 8. Working across apps: onscreen awareness

Onscreen awareness는 화면에 보이는 콘텐츠를 Siri가 이해하도록 연결하는 기능이다.

앱은 화면의 view를 App Entity와 연결해 Siri가 다음과 같은 표현을 이해할 수 있게 한다.

- “이 메시지”
- “마지막 것”
- “저 대화”
- “이 연락처”

## UserActivity와 View Annotations

화면 콘텐츠를 연결하는 API는 두 가지다.

| API | 사용 상황 |
|---|---|
| UserActivity | 화면에 하나의 주요 콘텐츠가 있을 때 |
| View Annotations | 여러 의미 있는 항목이 동시에 보일 때 |

예를 들어 문서 하나를 보는 화면이라면 UserActivity가 적절하다. 반면 메시지 목록, 대화 thread, 리스트 화면처럼 여러 항목이 보인다면 View Annotations가 적절하다.

UnicornChat에서는 각 메시지 row를 해당 Message entity와 연결한다. 그러면 사용자가 “이 메시지 수정해줘”, “마지막 것 전달해줘”라고 말했을 때 Siri가 화면상의 entity를 직접 resolve할 수 있다.

---

# 9. Content transfer

Content transfer는 한 앱의 entity를 다른 앱의 action에서 사용할 수 있도록 전달하는 기능이다.

이를 위해 entity가 **Transferable**을 채택하고, **IntentValueRepresentation**을 제공한다.

예를 들어 UnicornChat의 ContactEntity는 `IntentPerson`으로 export될 수 있다. 그러면 다른 앱이나 시스템 action은 해당 연락처를 사람 정보로 이해하고 “이 연락처에게 전화해줘” 같은 작업을 수행할 수 있다.

## Importing content

다른 앱에서 콘텐츠가 들어올 때 앱은 두 가지 방식 중 하나를 선택할 수 있다.

| 방식 | 설명 |
|---|---|
| IntentValueQuery | 들어온 값을 기존 app entity와 매칭 |
| IntentValueRepresentation importing | 들어온 값을 바탕으로 새 app entity 생성 |

예를 들어 다른 앱에서 `IntentPerson`이 들어오면 UnicornChat은 이를 기존 ContactEntity와 매칭할 수도 있고, 기존 연락처가 없다면 새 unicorn contact로 생성할 수도 있다.

정리하면 다음과 같다.

- 이미 존재하는 콘텐츠라면 resolve
- 새로운 콘텐츠라면 import
- 앱은 콘텐츠가 어떻게 저장되고 관리될지 제어할 수 있음

---

# 10. Best practices

Siri 경험은 개별 schema 하나만 채택한다고 완성되지 않는다. 좋은 Siri 통합은 관련 schema, entity, action, 화면 맥락, content transfer가 함께 작동해야 한다.

## 관련 schema 세트 채택

세션에서는 UnicornChat이 `sendMessage` schema만 채택한 상태에서 build error가 발생하는 예시를 보여준다.

Xcode는 `sendMessage`를 채택했다면 관련된 `draftMessage` schema도 필요하다고 알려준다. 이는 confirmation이 필요한 메시징 흐름에서 초안 생성이 필요할 수 있기 때문이다.

중요한 점은 이 오류가 단순 컴파일 문제가 아니라 설계 힌트라는 점이다.

| 도구 지원 | 설명 |
|---|---|
| Build-time validation | 필요한 관련 schema 누락을 빌드 시점에 감지 |
| Fix-it | 누락된 schema adoption 샘플 생성 |
| Stub implementation | 필요한 parameter와 기본 구조 자동 생성 |
| Design guidance | 완성도 높은 Siri 흐름에 필요한 schema 안내 |

Xcode는 누락된 schema를 알려주고, fix-it으로 기본 구현을 만들어준다. 앱은 이후 entity 연결, dependency 주입, input 처리, UI 실행 같은 앱 고유 로직을 채우면 된다.

---

# 11. Testing your integration

Siri 통합은 단계적으로 테스트하는 것이 중요하다.

## 11.1 AppIntentsTesting

AppIntentsTesting은 intent를 Siri 없이 독립적으로 테스트할 수 있는 framework다.

| 테스트 대상 | 내용 |
|---|---|
| Business logic | intent 실행 로직 검증 |
| Parameters | 입력 parameter 전달 검증 |
| Result | 실행 결과 검증 |
| Reliability | Siri 전체 흐름 없이 빠르게 반복 테스트 |

가장 빠르고 안정적으로 intent의 기본 동작을 검증하는 단계다.

## 11.2 Shortcuts

Shortcuts 앱은 intent의 구조와 노출 방식을 확인하는 데 유용하다.

확인할 항목은 다음과 같다.

- parameter가 어떻게 표시되는지
- 사용자가 입력을 어떻게 조정하는지
- action이 어떤 이름과 설명으로 노출되는지
- intent shape이 자연스러운지

## 11.3 Spotlight

Spotlight에서는 content integration을 검증한다.

확인할 항목은 다음과 같다.

- entity가 제대로 색인되는지
- 검색 결과에 노출되는지
- indexed content가 linkable한지
- Siri가 필요한 데이터를 찾을 수 있는지

## 11.4 Siri

마지막 단계는 Siri를 통한 end-to-end 테스트다.

여기서는 자연어, entity resolution, onscreen context, cross-app workflow가 모두 함께 작동하는지 확인한다.

---

# 12. Next steps

세션의 마지막에서는 Siri 통합을 시작하기 위한 구체적인 순서를 제안한다.

1. 앱의 콘텐츠를 App Entities로 모델링한다.
2. entity를 App Schema에 맞춰 Siri가 이해할 수 있게 한다.
3. 가능한 entity는 Spotlight semantic index에 색인한다.
4. 앱의 핵심 경험과 맞는 App Schema Domain을 채택한다.
5. Transferable로 콘텐츠 import/export를 지원한다.
6. AppIntentsTesting으로 intent 로직을 먼저 검증한다.
7. Shortcuts, Spotlight, Siri 순서로 전체 경험을 테스트한다.

---

# 개발자 체크리스트

- [ ] 앱의 주요 콘텐츠를 App Entity로 모델링
- [ ] 각 entity에 적절한 App Schema 적용
- [ ] IndexedEntity 적용 가능 여부 검토
- [ ] `indexingKey`로 검색 대상 property 지정
- [ ] IndexedEntity가 어려운 데이터는 EntityStringQuery로 처리
- [ ] 일반 App Intent와 Siri용 App Schema의 역할 구분
- [ ] 앱의 핵심 기능에 맞는 App Schema Domain 선택
- [ ] 관련 schema 세트를 빠짐없이 채택
- [ ] Xcode build-time validation과 fix-it 확인
- [ ] UserActivity와 View Annotations 적용 위치 구분
- [ ] 여러 항목이 보이는 리스트/대화 화면에 View Annotations 적용
- [ ] Transferable과 IntentValueRepresentation으로 content export 지원
- [ ] IntentValueQuery로 incoming content를 기존 entity와 매칭
- [ ] importing으로 새 entity 생성 흐름 지원
- [ ] AppIntentsTesting으로 intent 로직 검증
- [ ] Shortcuts에서 intent shape 검증
- [ ] Spotlight에서 indexing과 discoverability 검증
- [ ] Siri에서 end-to-end 자연어 경험 검증

---

# 함께 보면 좋은 후속 세션 후보

- Code-along: Make your app available to Siri
- Explore advanced App Intents features for Siri and Apple Intelligence
- Validate your App Intents adoption with AppIntentsTesting
- Making app entities available in Spotlight
- Making actions and content discoverable by Apple Intelligence
- Providing contextual cues to Apple Intelligence and Siri
- Integrating your messaging app with Apple Intelligence
- Donating your app’s data and actions to the system

---

# 정리

이 세션은 Siri AI 시대의 App Intents 통합이 단순한 음성 명령 추가가 아니라, 앱의 콘텐츠와 동작을 시스템이 이해할 수 있게 구조화하는 작업임을 보여준다.

핵심은 App Entity로 콘텐츠를 설명하고, App Schema로 그 의미를 Siri가 이해하게 하며, IndexedEntity로 semantic search를 가능하게 하고, App Schema Domain으로 자연어 action을 실행 가능하게 만드는 것이다.

여기에 UserActivity, View Annotations, Transferable, IntentValueRepresentation을 더하면 Siri는 사용자가 보고 있는 화면의 콘텐츠를 이해하고, 그 콘텐츠를 다른 앱으로 넘겨 여러 앱을 넘나드는 작업을 수행할 수 있다.

따라서 좋은 Siri 통합은 entity, schema, intent, indexing, 화면 맥락, content transfer, testing이 함께 맞물려야 한다. Xcode의 schema validation과 AppIntentsTesting, Shortcuts, Spotlight, Siri를 통한 단계적 검증은 이러한 통합을 안정적으로 완성하는 데 중요한 역할을 한다.
