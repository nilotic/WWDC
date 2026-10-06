# WWDC26 Best practices for integrating visual intelligence in your app 요약

- Session: 297
- Title: Best practices for integrating visual intelligence in your app
- Source: https://developer.apple.com/videos/play/wwdc2026/297/
- Topic: Visual Intelligence, App Intents, Image Search, Vision, EventKit, Contacts, HealthKit

---

## 한 줄 요약

WWDC26의 **Best practices for integrating visual intelligence in your app** 세션은 앱의 콘텐츠를 Visual Intelligence 검색 결과로 제공하고, Visual Intelligence가 추출한 정보를 EventKit, Contacts, HealthKit 같은 시스템 저장소를 통해 앱에서 활용하는 방법을 설명한다.

---

## 핵심 요약

이번 세션은 크게 두 가지 통합 지점을 중심으로 구성된다.

1. **Image Search 통합**
   - App Entity로 앱의 콘텐츠를 정의
   - `IntentValueQuery`로 `SemanticContentDescriptor` 기반 검색 구현
   - Vision framework의 feature print를 활용한 이미지 유사도 검색
   - `OpenIntent`로 검색 결과를 앱의 적절한 화면에 연결
   - iOS, iPadOS, macOS에서 동일한 API 활용

2. **System Store 통합**
   - Visual Intelligence가 인식한 이벤트, 연락처, 의료 기기 측정값을 시스템 저장소에 기록
   - 앱은 EventKit, Contacts, HealthKit을 통해 해당 데이터를 읽을 수 있음
   - 이미 시스템 저장소를 활용하는 앱이라면 Visual Intelligence가 새로운 입력 경로가 됨

---

# 1. Introduction

세션은 Visual Intelligence가 주변 환경이나 iPhone 화면 속 콘텐츠를 빠르게 이해하는 기능으로 소개되며 시작한다. WWDC26에서는 연락처 추가, 여러 캘린더 이벤트 저장, 의료 기기 기록 같은 새 기능이 추가되고, Visual Intelligence가 iPad와 macOS로 확장된다.

예제로는 음악 앱을 만든다. 사용자는 앨범 아트워크를 사진으로 찍거나 스크린샷으로 캡처한 뒤 Visual Intelligence의 Image Search를 실행할 수 있다. 그러면 앱은 해당 이미지와 일치하는 앨범과 관련 콘서트를 Visual Intelligence 결과 화면에 표시한다.

세션에서 다루는 흐름은 다음과 같다.

| 단계 | 내용 |
|---|---|
| 콘텐츠 정의 | App Entity로 앱에서 반환할 콘텐츠를 정의 |
| Query 구현 | Visual Intelligence가 앱 콘텐츠를 찾을 수 있도록 query 구현 |
| 플랫폼 확장 | iOS뿐 아니라 iPadOS와 macOS에서 동작하도록 확장 |
| 시스템 저장소 연동 | Visual Intelligence가 추출한 정보를 앱에서 자동으로 활용 |

---

# 2. Defining your content

Visual Intelligence의 Image Search 통합은 **App Intents**와 **Visual Intelligence** framework를 함께 사용한다. 먼저 앱이 반환할 콘텐츠를 App Entity로 정의해야 한다.

App Entity는 앱 안의 “명사”에 해당한다. 예제 음악 앱에서는 시각적으로 비슷한 앨범을 검색 결과로 반환하기 위해 `AlbumEntity`를 정의한다.

## AlbumEntity 구성

세션의 예제에서 앨범 엔티티는 다음 정보를 가진다.

| 항목 | 설명 |
|---|---|
| identifier | 앨범을 식별하는 값 |
| name | 앨범 이름 |
| artistName | 아티스트 이름 |
| thumbnail data | 앨범 아트워크 썸네일 |
| displayRepresentation | 검색 결과에 표시될 제목, 부제, 이미지 |
| default EntityQuery | identifier 기반으로 entity를 가져오는 query |
| typeDisplayRepresentation | entity 타입 이름 |

## DisplayRepresentation 설계

Visual Intelligence 검색 결과의 표시 영역은 제한적이다. 대략 세 줄 정도의 제목과 부제, 그리고 썸네일 이미지가 제공된다.

따라서 `displayRepresentation`에는 사용자가 결과를 식별하는 데 가장 중요한 정보를 넣어야 한다. 예제에서는 앨범명과 아티스트명을 사용한다.

이미지를 URL로 제공하는 경우에는 항상 원본 고해상도 이미지를 연결하기보다 상황에 맞는 썸네일 크기의 이미지를 제공하는 것이 좋다. 여러 결과가 반환되는 경우에는 작은 이미지가 더 빠르게 로드되고 2열 레이아웃에서도 충분히 보기 좋다. 반대로 단일 결과만 반환되는 경우에는 결과 sheet 전체 너비를 차지할 수 있다는 점을 고려해야 한다.

---

# 3. Implementing a query

App Entity를 정의한 뒤에는 Visual Intelligence가 앱의 콘텐츠를 실제로 검색할 수 있도록 query를 구현한다. 이때 사용하는 것이 `IntentValueQuery`다.

`IntentValueQuery`는 시스템에 entity 값을 제공하는 가벼운 query protocol이다. Siri나 App Intents를 이미 지원하는 앱이라면 비슷한 query 구조를 갖고 있을 수 있다.

Visual Intelligence 통합에서 중요한 차이는 입력값이다. 시스템은 캡처된 이미지에 대한 정보를 담은 `SemanticContentDescriptor`를 앱에 전달한다.

## Query 흐름

| 단계 | 설명 |
|---|---|
| `IntentValueQuery` 채택 | Visual Intelligence 검색 결과를 반환할 query 정의 |
| `SemanticContentDescriptor` 입력 수신 | 캡처된 이미지의 정보 전달 |
| `pixelBuffer` 추출 | 이미지 검색에 사용할 이미지 데이터 확보 |
| 앱 내부 검색 수행 | local catalog 또는 server 검색 실행 |
| 결과 반환 | App Entity 또는 VisualSearchResult 반환 |

예제 앱은 local catalog를 사용해 온디바이스에서 앨범을 검색한다. 이를 위해 Vision framework의 feature print를 사용한다.

## Vision feature print 기반 검색

Feature print는 이미지를 비교할 수 있도록 만든 작고 압축된 수치 표현이다. 앱은 앨범 catalog의 각 이미지에 대해 feature print를 미리 계산해 두고, 검색 시점에는 입력 이미지의 feature print만 새로 생성한다.

검색 흐름은 다음과 같다.

1. catalog의 각 앨범 이미지에 대해 feature print를 미리 계산
2. Visual Intelligence가 전달한 `pixelBuffer`를 `CGImage`로 변환
3. 입력 이미지의 feature print 생성
4. catalog의 feature print와 거리 비교
5. 최대 거리 threshold를 적용해 관련 없는 결과 제거
6. 유사도 순으로 정렬
7. 상위 결과만 반환

## 검색 성능과 관련성

세션은 검색 결과를 빠르고 관련성 있게 반환하는 것을 강조한다.

| 권장 사항 | 설명 |
|---|---|
| feature print 사전 계산 | query 시점의 계산량을 줄임 |
| similarity 기준 정렬 | 가장 관련 높은 결과가 먼저 보이게 함 |
| 결과 수 제한 | 너무 많은 결과보다 관련성 높은 소수 결과가 적합 |
| 빈 결과 허용 | 좋은 match가 없으면 빈 배열 반환 가능 |
| 서버 검색도 동일 원칙 적용 | 온디바이스든 서버든 빠르고 ranked된 결과가 중요 |

Vision framework는 feature print 외에도 텍스트 추출, barcode 스캔, 얼굴 감지, 이미지 분류 등 다양한 이미지 처리 기능을 제공하므로 앱의 visual search 능력을 확장하는 데 활용할 수 있다.

---

# 4. Opening results

Visual Intelligence 검색 결과를 탭했을 때 사용자를 앱의 적절한 화면으로 이동시키려면 `OpenIntent`가 필요하다.

예제에서는 앨범 검색 결과를 탭하면 `OpenAlbumIntent`가 호출되고, 앱은 해당 앨범의 상세 화면으로 이동한다.

## OpenIntent 설계 원칙

| 항목 | 설명 |
|---|---|
| 정확한 목적지 | 사용자가 선택한 콘텐츠 화면으로 바로 이동 |
| 기존 intent 재사용 | 이미 App Intents용 OpenIntent가 있으면 재사용 가능 |
| 가벼운 처리 | 앱 foreground 진입 시 실행되므로 heavy loading은 피함 |
| view 표시 후 로딩 | 무거운 데이터 로딩은 view가 나타난 뒤 수행 |

이 구성까지 완료하면 기본적인 Image Search 통합이 완성된다. App Entity, `IntentValueQuery`, `OpenIntent`가 함께 동작해 Visual Intelligence에서 앱 콘텐츠를 검색하고, 결과를 탭하면 앱의 특정 화면으로 이어진다.

---

# 5. Mac and iPad adoption

WWDC26부터 Visual Intelligence는 iPadOS와 macOS에서도 사용할 수 있다. Image Search 통합에 사용한 동일한 API가 새 플랫폼에서도 동작한다.

`IntentValueQuery`, App Entity, `OpenIntent`는 iOS, iPadOS, macOS에서 공통으로 사용할 수 있으며, 세션의 예제 앱도 같은 코드로 macOS에서 검색 결과를 반환한다.

## 플랫폼별 차이

| 플랫폼 | 주요 입력 경로 | 고려 사항 |
|---|---|---|
| iOS | 카메라, 스크린샷 | 실제 사물, 앨범, 포스터 등 물리적 객체 캡처가 많음 |
| iPadOS | 스크린샷 중심 | 디지털 콘텐츠 캡처가 많음 |
| macOS | 스크린샷 중심 | 입력 pixel buffer가 iPhone보다 훨씬 클 수 있음 |

Mac에서는 입력 이미지 크기가 클 수 있으므로, 검색 방식에 따라 resizing이 필요한지 검토해야 한다. 또한 iOS에서는 물리적 사물을 촬영하는 사용 사례가 많고, iPad와 Mac에서는 화면 속 디지털 콘텐츠를 캡처하는 사용 사례가 많기 때문에 두 종류의 입력 모두 잘 처리해야 한다.

---

# 6. Returning multiple result types

기본 예제는 시각적으로 비슷한 앨범만 반환했지만, 앱은 하나 이상의 결과 타입을 반환할 수도 있다.

세션에서는 앨범뿐 아니라 해당 앨범의 아티스트와 관련된 upcoming concerts도 함께 보여주는 예제로 확장한다.

## UnionValue 사용

앱은 `SemanticContentDescriptor`를 받는 `IntentValueQuery`를 하나만 가질 수 있다. 여러 entity 타입을 반환하려면 `@UnionValue` enum을 정의하고, 각 case를 다른 entity 타입에 연결한다.

예제에서는 다음 두 타입을 union으로 묶는다.

| Result type | 설명 |
|---|---|
| Album | 이미지와 시각적으로 비슷한 앨범 |
| Concert | 앨범 아티스트와 관련된 근처 콘서트 |

각 entity 타입에는 별도의 `OpenIntent`가 필요하다.

## Context 기반 결과 확장

세션의 중요한 포인트는 Visual Intelligence 결과가 단순히 이미지 pixel matching에만 머물 필요가 없다는 점이다.

예제 앱은 먼저 이미지 유사도로 앨범을 찾고, 그 앨범의 아티스트 정보를 이용해 근처 콘서트를 찾는다. 즉, 이미지 자체와 직접 일치하지 않는 다른 종류의 콘텐츠도 맥락을 바탕으로 함께 반환할 수 있다.

---

# 7. Continuing search in your app

Visual Intelligence 결과 화면에서 사용자가 원하는 결과를 바로 찾지 못할 수 있다. 이때 앱의 전체 검색 경험으로 자연스럽게 이어주는 방법이 `semanticContentSearch` schema다.

앱은 `semanticContentSearch` schema를 따르는 intent를 만들고, 시스템이 자동으로 제공하는 `semanticContent` property를 사용한다. 이 값은 앞서 query에서 받은 `SemanticContentDescriptor`와 같은 종류의 입력이다.

## More results 흐름

| 단계 | 설명 |
|---|---|
| 사용자가 More results 탭 | Visual Intelligence 결과 화면에서 앱 검색으로 이동 |
| semantic content 전달 | 캡처된 이미지 맥락이 앱에 전달됨 |
| 앱 검색 화면 표시 | 앱의 전체 검색 UI로 이동 |
| 결과 사전 구성 | 입력 맥락을 기반으로 검색 결과를 미리 채움 |
| 추가 탐색 제공 | filter, category, full catalog 등 앱 고유의 탐색 제공 |

Visual Intelligence 결과 sheet는 제한된 공간만 제공한다. 앱 안에서는 더 깊은 검색 경험, 필터, 카테고리, 전체 콘텐츠 탐색을 제공할 수 있으므로, `semanticContentSearch`를 통해 이어지는 흐름을 마련하는 것이 좋다.

---

# 8. System store integrations

세션 후반부는 앱이 Visual Intelligence에 결과를 제공하는 방향과 반대로, Visual Intelligence가 추출한 데이터를 앱이 읽어오는 방식도 설명한다.

Image Search는 앱이 Visual Intelligence에 결과를 제공하는 통합 방식이다. 반면 Visual Intelligence의 다른 action들은 데이터를 시스템 저장소에 기록할 수 있고, 앱은 이미 사용 중인 framework를 통해 이 데이터를 읽을 수 있다.

## 지원되는 시스템 저장소 예시

| Visual Intelligence action | System store | Framework |
|---|---|---|
| 이벤트 감지 및 추가 | Calendar | EventKit |
| 연락처 정보 추가 | Contacts | Contacts / CNContactStore |
| 의료 기기 측정값 기록 | Health | HealthKit / HKHealthStore |

예제 음악 앱에서는 소셜 미디어 포스트에서 upcoming concert 정보를 Visual Intelligence가 감지하고, 사용자가 이를 calendar에 추가한다. 이후 앱은 EventKit으로 upcoming events를 읽고, catalog의 아티스트와 일치하는 이벤트를 찾아 Upcoming Concerts 화면에 자동으로 표시한다.

HealthKit 예시에서는 혈압계, 혈당 측정기, 체중계 화면에서 Visual Intelligence가 읽은 의료 기기 측정값을 HealthKit에 기록하고, health 또는 fitness 앱이 이를 수동 입력 없이 활용할 수 있다고 설명한다.

---

# 9. 개발자 체크 포인트

- [ ] Visual Intelligence에 반환할 앱 콘텐츠를 App Entity로 정의
- [ ] `displayRepresentation`에 핵심 식별 정보를 간결하게 구성
- [ ] 이미지 결과에는 상황에 맞는 thumbnail-sized image 제공
- [ ] `IntentValueQuery`에서 `SemanticContentDescriptor` 입력 처리
- [ ] `pixelBuffer`가 없는 경우 빈 결과 반환 처리
- [ ] Vision feature print 또는 앱에 맞는 이미지 처리 방식 선택
- [ ] 자주 쓰는 catalog feature print는 query 전에 pre-compute
- [ ] 검색 결과는 관련성 기준으로 정렬
- [ ] 결과 수를 제한해 Visual Intelligence 결과 화면의 품질 유지
- [ ] 좋은 결과가 없을 때는 빈 배열 반환
- [ ] 결과 탭 시 적절한 화면으로 이동하는 `OpenIntent` 구현
- [ ] `OpenIntent`에서는 navigation만 가볍게 처리하고 heavy loading은 view 표시 후 수행
- [ ] iOS의 카메라 입력과 iPadOS/macOS의 스크린샷 입력을 모두 고려
- [ ] macOS의 큰 pixel buffer에 대한 resizing 필요성 검토
- [ ] 여러 결과 타입이 필요한 경우 `@UnionValue` 사용
- [ ] 각 entity 타입에 맞는 `OpenIntent` 제공
- [ ] `semanticContentSearch` schema로 More results 흐름 제공
- [ ] 앱의 전체 검색 화면을 semantic input으로 사전 구성
- [ ] EventKit, Contacts, HealthKit 등 시스템 저장소 사용 여부 점검
- [ ] Visual Intelligence가 생성한 시스템 저장소 변경을 앱에서 감지하도록 observer 구성

---

# 10. 관련 기술 / 프레임워크

| 기술 | 역할 |
|---|---|
| Visual Intelligence framework | Visual Intelligence Image Search 통합 |
| App Intents | App Entity, IntentValueQuery, OpenIntent, semanticContentSearch schema 제공 |
| SemanticContentDescriptor | 캡처된 이미지 또는 화면 맥락 전달 |
| Vision | feature print, OCR, barcode scan, face detection, image classification 등 이미지 처리 |
| VideoToolbox | `pixelBuffer`를 `CGImage`로 변환하는 예제에 사용 |
| EventKit | Visual Intelligence가 추가한 calendar event 읽기 |
| Contacts | Visual Intelligence가 추가한 contact 정보 읽기 |
| HealthKit | Visual Intelligence가 기록한 의료 기기 측정값 읽기 |

---

# 함께 보면 좋은 후속 세션 후보

- App Intents
- Visual Intelligence
- Vision framework
- Integrating your app with visual intelligence
- Foundation Models framework
- Spotlight semantic index
- Siri AI / App Intents 관련 세션

---

## 정리

이 세션은 Visual Intelligence를 앱과 연결하는 방법을 Image Search와 system store integration이라는 두 축으로 설명한다. 앱은 App Entity와 `IntentValueQuery`를 통해 Visual Intelligence에 검색 결과를 제공하고, `OpenIntent`를 통해 사용자를 선택한 콘텐츠의 정확한 화면으로 이동시킬 수 있다.

또한 Visual Intelligence는 iOS뿐 아니라 iPadOS와 macOS에서도 동작하므로, 카메라 입력과 스크린샷 입력, 작은 이미지와 큰 pixel buffer, 물리적 객체와 디지털 콘텐츠를 모두 고려해야 한다.

마지막으로 EventKit, Contacts, HealthKit 같은 시스템 저장소를 이미 사용하는 앱은 Visual Intelligence가 생성한 이벤트, 연락처, 의료 기록을 자연스럽게 새로운 입력으로 활용할 수 있다. 이를 통해 Visual Intelligence는 앱의 콘텐츠 발견뿐 아니라 데이터 입력과 후속 작업 흐름까지 확장하는 통합 지점이 된다.
