# WWDC26 Explore Retention Messaging in App Store Connect 요약

- Session: 309
- Title: Explore Retention Messaging in App Store Connect
- Source: https://developer.apple.com/videos/play/wwdc2026/309/
- Topic: App Store Connect, Subscriptions, Retention Messaging, Real-time Retention Messaging, Retention Offers, Promotional Offers, App Store Server APIs
- Chapters: Introduction, Retention Messaging in App Store Connect, Real-time Retention Messaging, Retention Messaging comparison

---

## 한 줄 요약

Retention Messaging은 구독자가 **Manage Subscriptions에서 취소를 확정하기 직전** App Store가 앱의 가치·이미지·할인 혜택·대체 플랜을 보여주는 이탈 방지 기능이며, 단순한 운영은 App Store Connect에 메시지와 retention offer를 설정하는 방식으로 처리하고, 고객별로 무엇을 보여줄지 실시간으로 결정해야 한다면 서버 기반 **Real-time Retention Messaging API**를 사용한다.

---

## 핵심 요약

이번 세션은 구독 해지 직전이라는 매우 중요한 순간에 App Store 자체의 취소 화면 안에서 앱이 고객에게 다시 가치를 설명할 수 있게 하는 두 가지 Retention Messaging 방식을 설명한다.

### Retention Messaging in App Store Connect

- 별도 서버가 없어도 사용 가능
- App Store Connect에서 message를 만들어 subscription에 연결
- 세 가지 presentation 지원
  - Message only
  - Message + image
  - Message + offer
- Image는 App Store Connect의 Asset Library에서 선택
- 여러 subscription을 하나의 retention message에 연결 가능
- 한 subscription에 여러 retention offer를 연결할 수 있음
- 고객이 offer 대상이면 App Store가 가장 적절한 offer를 자동 선택
- Offer가 표시되는 경우 image 대신 offer가 표시됨
- Sandbox에서 취소 flow 전체 테스트 가능
- App Store Connect UI뿐 아니라 App Store Connect API로도 구성 가능

### Real-time Retention Messaging

- 개발자 서버가 필요
- 사용자가 취소를 시도하는 순간 App Store가 개발자의 endpoint로 server-to-server HTTP request 전송
- Request에는 subscription 식별과 localization/trace에 필요한 값이 포함됨
  - `originalTransactionId`
  - `productId`
  - `userLocale`
  - `requestIdentifier`
  - environment 등
- 서버가 고객별로 실시간 응답을 선택
- 지원 response 유형
  - Message
  - Alternate product / switch plan
  - Promotional offer
- Message/image asset은 Retention Messaging API에서 관리 가능
- App Store Connect에 만들어 둔 retention message를 실시간 선호 메시지로 지정하는 것도 가능
- Sandbox performance test를 통과해야 production 사용 가능
- 서버가 응답하지 않거나 malformed response를 보내도 fallback path가 존재

### Fallback 우선순위

Real-time response가 실패하면 App Store가 바로 아무것도 보여주지 않는 것이 아니다.

```text
1. Real-time server response
        ↓ 실패 / timeout / malformed
2. App Store Connect Retention Messaging preference
        ↓ 미설정
3. Retention Messaging API의 default message
```

따라서 Apple은 real-time 방식을 사용하더라도 **App Store Connect 방식도 함께 설정해 fallback으로 활용**하라고 권장한다.

### 세션에서 공개한 효과 수치

Apple은 취소 확인 페이지까지 도달한 구독자 중 구독을 유지한 비율을 **save rate**라고 설명한다.

세션에서 소개한 관찰 결과:

- Retention Messaging 도입 subscription의 평균 save rate: **+1.4 percentage points**
- 상대 증가율로 환산하면 **+82%**
- Promotional offer가 포함된 메시지에서 가장 높은 관찰값: **+5.5 percentage points**
- 상대 증가율: **+223%**

Apple은 developer마다 결과가 달라질 수 있다고 명확히 언급한다.

---

# 🔄 취소 Flow에서 Retention Messaging이 들어가는 위치

사용자가 auto-renewable subscription을 취소한다고 가정한다.

기본 취소 흐름:

```text
Manage Subscriptions
      ↓
현재 Subscription 선택
      ↓
Cancel Subscription
      ↓
취소 영향 안내
      ↓
최종 Cancel Confirmation
```

Retention Messaging은 바로 이 **최종 취소 확정 직전**에 개입한다.

앱 안에서 띄우는 자체 modal이나 retention 화면이 아니라 **App Store의 subscription cancellation flow** 안에서 노출되는 점이 중요하다.

---

# 👨‍👩‍👧 취소 영향 안내와 가치 재설명

세션의 Exercise 앱에서는 고객이 Yoga+ subscription을 취소하려고 한다.

App Store는 먼저 취소로 인해 발생하는 영향을 설명한다.

예:

- Family가 더 이상 subscription benefit에 접근할 수 없음
- 현재 이용 중인 premium benefit이 종료됨

그 다음 retention message를 이용해 구독 가치 또는 추가 혜택을 보여줄 수 있다.

---

# 📨 세 가지 기본 View

Retention Messaging in App Store Connect는 세 가지 기본 presentation을 지원한다.

## Message only

```text
Title
Description
```

특징:

- 가장 단순한 형태
- 별도 visual 없이 subscription 가치 자체를 강조
- 신규 feature나 곧 출시될 benefit 안내에 적합

## Message + Image

```text
Title
Description
Image
```

특징:

- Asset Library에 등록된 image 사용
- Feature, brand, class, benefit을 시각적으로 강조

## Message + Offer

```text
Title
Description
Offer
```

특징:

- 취소 직전 직접적인 경제적 incentive 제공
- 세션 예에서는 Yoga+ 3개월 무료 offer를 보여줌

중요:

> 고객이 offer 대상이면 image는 offer로 대체된다.

따라서 image와 offer를 동시에 한 화면의 두 개 visual처럼 생각하면 안 된다.

---

# 📈 Save Rate

Apple은 Retention Messaging 성과를 **save rate**라는 metric으로 설명한다.

정의:

> Manage Subscriptions의 cancel confirmation page에 도달한 사용자 가운데, 최종적으로 subscription을 유지한 사용자의 비율

개념적으로:

```text
Cancel Confirmation Page 도달 사용자
              ↓
          일부 취소
          일부 유지
              ↓
구독 유지 비율 = Save Rate
```

이 metric은 일반적인 conversion rate와 달리 **이미 취소 의사가 매우 높은 사용자 집단**을 대상으로 한다.

---

# 📊 Apple이 소개한 관찰 결과

Retention Messaging을 도입한 subscription에서 Apple이 관찰한 평균 변화:

| 항목 | 관찰값 |
|---|---:|
| 평균 save rate 증가 | +1.4 points |
| 상대 증가율 | +82% |
| Promotional offer message의 최대 관찰 증가 | +5.5 points |
| 상대 증가율 | +223% |

주의:

- 모든 앱에서 동일한 결과를 보장하지 않음
- Developer별 결과는 다를 수 있음
- Offer economics와 churn behavior를 함께 분석해야 함

---

# 🛠️ App Store Connect에서 Retention Message 만들기

App Store Connect의 Subscriptions page에 새 Retention Messaging 영역이 생긴다.

기본 흐름:

```text
App Store Connect
      ↓
Subscriptions
      ↓
Retention Messaging
      ↓
Get Started
      ↓
Message 생성
```

세션에서는 Yoga subscription용 message를 만들고 이름을 **Yoga Message**로 지정한다.

---

# ✍️ Message Text

Retention message에는 **반드시 text가 있어야 한다.**

반면 다음은 optional이다.

- Image
- Offer

즉 최소 구성:

```text
Message Text: Required
Image: Optional
Offer: Optional
```

---

# 🌍 Localization

Retention message는 localization별로 구성할 수 있다.

세션은 영어 예제를 보여주지만 다른 language도 선택할 수 있다고 설명한다.

따라서 운영 시 다음을 단순 번역이 아니라 market별 retention message로 관리할 수 있다.

- Title
- Description
- Feature emphasis
- Seasonal campaign wording

---

# 👀 Live Preview

App Store Connect 화면 오른쪽에는 live preview가 있다.

Title이나 description을 편집하면 즉시 preview가 업데이트된다.

다음 상태를 확인할 수 있다.

- Text only
- Image 포함
- 특정 offer 포함
- Offer 없음

Offer dropdown에서 다른 offer를 선택해 presentation을 비교할 수도 있다.

---

# 🖼️ Asset Library와 Image

Image를 함께 사용하려면 Asset Library에서 이미지를 선택한다.

```text
Asset Library
      ↓
Approved / available image
      ↓
Retention Message
```

WWDC26의 별도 세션 **Enhance your presence on the App Store**에서 Asset Library를 자세히 설명한다.

Retention Messaging은 새 App Store marketing asset infrastructure와 연결되는 기능이다.

---

# 🔗 Subscription 연결

하나의 retention message는 여러 subscription에 연결할 수 있다.

예:

```text
Yoga Message
├─ Yoga+ Monthly
├─ Yoga+ Annual
└─ Yoga Family
```

따라서 message를 subscription별로 완전히 중복 생성할 필요는 없다.

다만 실제 메시지 내용이 각 product의 benefit과 맞는지는 별도로 검토해야 한다.

---

# 🎁 Retention Offers

이번 세션에서는 **retention offer**라는 새로운 offer type도 소개한다.

App Store Connect 기반 Retention Messaging에서 사용한다.

하나의 subscription에 여러 retention offer를 연결할 수 있다.

```text
Subscription
├─ Retention Offer A
├─ Retention Offer B
└─ Retention Offer C
```

고객이 offer 대상일 경우 App Store가 가장 적절한 offer를 자동으로 선택한다.

개발자가 cancel 순간에 직접 특정 offer를 결정하지 않아도 된다.

---

# 🧠 Offer Eligibility

App Store Connect UI는 선택 가능한 retention offer와 함께 다음 정보를 보여준다.

- Eligibility
- Availability

운영자는 여러 offer를 연결해 두고 App Store가 eligible customer에게 적합한 offer를 고르게 할 수 있다.

이 방식이 App Store Connect Retention Messaging과 real-time 방식의 가장 큰 decisioning 차이 중 하나다.

---

# 🧪 Sandbox 테스트

Retention Messaging은 Sandbox에서 전체 취소 flow를 테스트할 수 있다.

```text
Sandbox Subscription
      ↓
Cancel 시도
      ↓
Retention Message 확인
```

Offer까지 설정했다면 signed transaction 또는 renewal info에 offer 관련 field가 올바르게 반영되는지도 검증할 수 있다.

---

# 🆕 Signed Transaction의 `offerType = 5`

Retention offer가 실제로 redeem되면 signed transaction / renewal info에 새로운 offer type 값이 나타난다.

```text
offerType = 5
→ Retention Offer
```

같이 확인할 수 있는 대표 field:

- Offer identifier
- Offer discount type
- Offer period

세션 예시는 free-trial 형태의 3개월 retention offer를 보여준다.

즉 server-side subscription analytics에서도 retention offer redemption을 기존 promotional / introductory offer와 구분할 수 있다.

---

# 🧾 Retention Offer 추적 예

Conceptual payload:

```json
{
  "productId": "...",
  "offerType": 5,
  "offerIdentifier": "...",
  "offerDiscountType": "FREE_TRIAL",
  "offerPeriod": "P3M"
}
```

핵심은 exact sample ID가 아니라 **offerType 5를 retention offer 식별자로 사용한다는 것**이다.

---

# ⚡ Real-time Retention Messaging

App Store Connect 방식보다 더 직접적으로 고객별로 decisioning하고 싶다면 Real-time Retention Messaging을 사용한다.

구조:

```text
Customer presses Cancel
      ↓
App Store
      ↓ server-to-server request
Developer Retention Endpoint
      ↓
Customer-specific decision
      ↓ response
App Store
      ↓
Cancellation UI
```

이 방식은 앱 client가 request를 보내는 구조가 아니다.

**App Store 서버 ↔ 개발자 서버** 통신이다.

---

# 🎯 Real-time 방식이 필요한 경우

다음과 같은 조건이라면 real-time 방식이 적합하다.

- 고객별 churn risk가 다름
- Subscription history에 따라 message를 다르게 보여주고 싶음
- Offer eligibility를 개발자 backend에서 직접 결정하고 싶음
- Annual plan으로 switch를 제안하고 싶음
- 특정 customer segment에만 incentive 제공
- 실시간 campaign logic 필요

---

# 🧩 Real-time에서 가능한 네 번째 View

App Store Connect 방식과 동일하게 다음을 지원한다.

- Message only
- Message + image
- Message + offer

그리고 real-time 방식에는 추가로 다음이 있다.

```text
Message + Switch Plan
```

즉 취소 대신 같은 subscription group 안의 다른 product로 변경하도록 제안할 수 있다.

---

# 🔄 Switch Plan

Exercise 앱에서는 Yoga+ 고객에게 annual subscription을 대체 plan으로 제안한다.

```text
현재 Product
Yoga+ Monthly
      ↓ Cancel attempt
Alternate Product
Yoga+ Annual
```

조건:

- Alternate product는 **같은 subscription group** 안에 있어야 한다.

이 기능은 단순 할인보다 상품 구조 자체를 바꾸는 retention 전략이다.

---

# 🌐 Retention Messaging API

Real-time 기능은 server-to-server **Retention Messaging API**를 사용한다.

세션이 소개한 API 영역:

## Endpoint URL 관리

- Real-time callback URL 생성/변경
- 현재 URL 조회
- URL 제거

## Message 관리

- Message 생성/변경
- Message 삭제
- Message 목록 조회
- Product + locale별 default message 설정

## Image 관리

- Image upload/update
- Image delete
- Image list

## Performance Test

Sandbox 전용:

- Performance test 시작
- Test 결과 조회

---

# 🧪 Sandbox와 Production 분리

Retention Messaging API는 Sandbox와 Production environment를 구분한다.

권장 구축 순서:

```text
1. Sandbox에서 Message / Image 설정
        ↓
2. Sandbox Endpoint 설정
        ↓
3. 취소 Flow 기능 테스트
        ↓
4. Performance Test 실행
        ↓
5. Pass
        ↓
6. Production Message / Image 설정
        ↓
7. Production Endpoint 설정
        ↓
8. Production Real-time Response 시작
```

---

# 🚦 Performance Test가 Production 전 필수

Real-time Retention Messaging은 사용자가 취소 버튼을 누른 순간 response를 기다려야 한다.

따라서 server latency가 UX에 직접 영향을 준다.

Apple은 production 사용 전에 Sandbox의 performance test를 통과하도록 요구한다.

이 test는 단순 기능 검증이 아니라 **응답 속도와 안정성 요건**을 확인한다.

---

# 📩 App Store → Developer Server Request

취소 직전 App Store는 real-time endpoint로 필요한 subscription context를 전달한다.

대표 field:

- `originalTransactionId`
- `appAppleId`
- `productId`
- `userLocale`
- `requestIdentifier`
- `environment`
- `signedDate`

---

# 🆔 `originalTransactionId`

Subscription 관계를 식별하는 핵심 ID다.

Backend에서는 이를 이용해 해당 사용자의 subscription history 또는 내부 account mapping을 조회할 수 있다.

주의:

- Retention endpoint가 받는 ID와 내부 customer/account identifier의 연결 전략 필요
- Privacy와 최소 데이터 원칙을 고려해야 함

---

# 🌍 `userLocale`

App Store가 고객 locale을 전달한다.

이를 이용해 적절한 localization message를 선택할 수 있다.

```text
en-US → English message
ko-KR → Korean message
ja-JP → Japanese message
```

Locale 기반 real-time message 결정은 API가 의도한 대표 use case다.

---

# 🧾 `requestIdentifier`

각 real-time 요청을 추적하는 identifier다.

권장 활용:

- Request logging
- Latency measurement
- Error correlation
- Performance troubleshooting
- Duplicate request investigation

---

# 📨 Response 1: Message

가장 단순한 response다.

개발자가 미리 등록한 `messageIdentifier`를 지정한다.

```text
Real-time Request
      ↓
Message Identifier 선택
      ↓
App Store가 해당 Message 표시
```

Message가 image와 pair되어 있으면 message + image presentation이 가능하다.

---

# 🔀 Response 2: Alternate Product

같은 subscription group에서 다른 product를 제안한다.

Response에 다음을 지정한다.

- `messageIdentifier`
- Alternate `productId`

예:

```text
Yoga Monthly
      ↓
Yoga Annual
```

사용자가 완전히 이탈하는 대신 다른 billing option으로 이동하게 할 수 있다.

---

# 🎁 Response 3: Promotional Offer

Real-time 방식에서는 App Store Connect의 retention offer 대신 기존 **promotional offer**를 실시간으로 사용할 수 있다.

Response에 필요한 핵심:

- `messageIdentifier`
- Promotional offer signature

Promotional offer는 기존과 마찬가지로 signature가 필요하다.

즉 real-time Retention Messaging이 signature requirement를 없애주는 것은 아니다.

---

# ✍️ Promotional Offer Signature

세션은 real-time promotional offer response에 signed promotional offer를 포함하는 구조를 보여준다.

운영 서버는:

1. Customer 상태 결정
2. 적용할 promotional offer 선택
3. Signature 생성
4. Retention response 반환

을 매우 짧은 시간 안에 수행해야 한다.

따라서 latency-sensitive backend architecture가 필요하다.

---

# ⏱️ 빠른 Server가 중요한 이유

Real-time endpoint가 너무 느리면 cancellation UI 전체가 느려질 수 있다.

Apple은 이 때문에 performance test를 요구하고 fallback path를 제공한다.

Backend 설계 시 특히 피해야 할 구조:

```text
App Store Request
   ↓
DB Query 여러 번
   ↓
External API Call
   ↓
ML scoring remote service
   ↓
Offer signature service
   ↓
Response
```

이런 긴 dependency chain은 timeout 위험을 높인다.

---

# 🛡️ Fallback Messaging

서버가 항상 정상 응답한다고 가정하면 안 된다.

가능한 문제:

- Timeout
- Network issue
- Server outage
- Malformed JSON
- Invalid identifier
- Signature issue

App Store는 이 경우 fallback logic을 사용한다.

---

# 🪜 Fallback 우선순위 상세

```text
Real-time Retention Response
        ↓ unavailable / malformed
App Store Connect Retention Messaging preference
        ↓ not configured
Retention Messaging API Default Message
```

이 구조 때문에 Apple은 **real-time만 설정하고 App Store Connect는 비워두는 구성보다 둘을 함께 쓰는 것을 권장**한다.

---

# 🧠 왜 App Store Connect를 항상 함께 설정해야 하나

Real-time system은 개발자 backend에 dependency가 생긴다.

반면 App Store Connect message는 Apple이 직접 관리하므로 다음 failure와 독립적이다.

- Developer server outage
- Database incident
- Deployment issue
- High latency

따라서 base retention experience를 App Store Connect에서 먼저 설정하고 real-time으로 override하는 구조가 resilience 측면에서도 좋다.

---

# 📆 월간 결제 + 12개월 약정 Plan 지원

세션은 iOS 26.5에서 추가된 **monthly subscription with a 12-month commitment**를 언급한다.

Real-time Retention Messaging도 이 billing plan type을 switch plan으로 지원한다.

Alternate product response에 billing plan type을 함께 지정해 제안할 수 있다.

즉 사용자가 월간 billing을 유지하면서 12개월 commitment plan으로 이동하게 하는 retention option을 구성할 수 있다.

---

# ⚖️ 두 방식의 가장 큰 차이: Decisioning

## App Store Connect Retention Messaging

```text
미리 Configuration
      ↓
취소 시 App Store가 자동 표시
```

개발자가 cancel moment에 다시 개입하지 않는다.

## Real-time Retention Messaging

```text
취소 시 App Store → Developer Server
                  ↓
         Customer별 Decision
                  ↓
              Response
```

즉 가장 큰 차이는 **누가 무엇을 보여줄지 결정하느냐**다.

---

# 🆚 상세 비교

| 항목 | App Store Connect | Real-time |
|---|---|---|
| Server 필요 | 없음 | 필요 |
| Decision 시점 | 사전 설정 | 취소 순간 |
| Customer별 decisioning | 제한적 | 가능 |
| Message 관리 | App Store Connect / ASC API | Retention Messaging API |
| Image 관리 | Asset Library | Retention Messaging API |
| Offer | Retention Offer | Promotional Offer |
| Offer 선택 | App Store가 eligible offer 자동 선택 | Developer server가 결정 |
| Switch Plan | 지원 안 함 | 지원 |
| Performance test | 필요 없음 | Sandbox에서 필수 |
| Fallback 역할 | 자체적으로 동작 | App Store Connect message 권장 |
| Production 접근 | 일반 사용 | Interest form으로 access 요청 |

---

# 🎁 Retention Offer vs Promotional Offer

두 offer type을 혼동하면 안 된다.

## Retention Offer

사용 위치:

```text
App Store Connect Retention Messaging
```

특징:

- Subscription에 연결
- 여러 offer를 설정 가능
- App Store가 eligibility에 따라 최적 offer 선택
- Redeem 후 signed transaction에 `offerType = 5`

## Promotional Offer

사용 위치:

```text
Real-time Retention Messaging
```

특징:

- Developer backend가 고객별로 선택
- 기존 promotional offer mechanism 활용
- Signature 필요
- Real-time eligibility logic 가능

---

# 🖼️ Image 관리 방식도 다르다

## App Store Connect 방식

```text
Asset Library
      ↓
Retention Message
```

## Real-time 방식

```text
Retention Messaging API
      ↓
Image Configuration
      ↓
Message Identifier와 Pair
```

둘 다 image presentation을 지원하지만 asset management infrastructure가 다르다.

---

# 🤖 App Store Connect API 지원

App Store Connect UI에서 수작업으로만 설정할 필요는 없다.

App Store Connect API 역시 Retention Messaging setup을 지원한다.

자동화할 수 있는 영역:

- Retention message management
- Retention offer configuration
- Subscription mapping

다수 앱이나 localization을 운영한다면 API automation이 유용하다.

---

# 🔐 Real-time Access 요청

세션 시점의 real-time Retention Messaging은 일반적인 자동 활성화 기능이 아니다.

사용하려면 세션 Resource에 제공된 **interest form**을 제출해 access를 요청해야 한다.

따라서 구현 계획 전에 실제 account access 가능 여부를 먼저 확인해야 한다.

---

# 🧭 어떤 방식을 선택할까?

## 서버가 없다

추천:

```text
App Store Connect Retention Messaging
```

이유:

- 별도 backend 불필요
- App Store가 offer selection까지 관리
- 구축 복잡도 낮음

## 서버는 있지만 단순 운영이 목적

추천:

```text
App Store Connect Retention Messaging
+
App Store Connect API Automation
```

Backend가 있어도 real-time decisioning이 필요하지 않다면 굳이 latency-sensitive endpoint를 만들 필요가 없다.

## Customer Segment별 메시지가 다르다

추천:

```text
Real-time Retention Messaging
```

예:

- Long-term subscriber
- First-month subscriber
- High-value user
- Feature-specific usage segment

## 고객별 Offer를 직접 결정하고 싶다

추천:

```text
Real-time
+
Promotional Offer
```

## Annual 또는 다른 Plan으로 전환시키고 싶다

추천:

```text
Real-time
+
Alternate Product / Switch Plan
```

---

# 🧱 권장 Architecture

Real-time 방식을 사용할 경우 다음처럼 단순한 fast path를 구성하는 것이 적절하다.

```text
App Store
   ↓
Retention Endpoint
   ↓
Subscription Lookup
   ↓
Precomputed Retention Segment
   ↓
Rule / Offer Selection
   ↓
Optional Offer Signature
   ↓
Response
```

중요한 decision data는 가능한 한 미리 계산해 두고 request path에서 복잡한 analytics를 새로 수행하지 않는 편이 좋다.

---

# 📊 Retention Analytics 설계

Retention Messaging을 운영한다면 최소한 다음을 분리해 측정하는 것이 좋다.

```text
Cancel Confirmation Reached
        ↓
Retention View Type
        ↓
Message Identifier
        ↓
Offer / Switch Plan
        ↓
Subscription Saved?
        ↓
Offer Redeemed?
        ↓
Long-term Retained?
```

특히 단순 immediate save rate만 보면 할인으로 인한 단기 retention 효과와 실제 장기 LTV 영향을 구분하기 어렵다.

---

# 📋 체크리스트

## App Store Connect Retention Messaging 시작

- [ ] Auto-renewable subscription 사용 여부 확인
- [ ] 가장 중요한 churn point 정의
- [ ] App Store Connect의 Retention Messaging 영역 확인
- [ ] Retention message 이름 정의
- [ ] Title 작성
- [ ] Description 작성
- [ ] Localization 준비
- [ ] Live preview 확인
- [ ] 연결할 subscription 선택

## Image

- [ ] Asset Library에 사용할 image 준비
- [ ] Message text 없이 image만 사용할 수 없음을 확인
- [ ] Image가 실제 benefit을 설명하는지 검토
- [ ] Offer가 표시되면 image가 대체된다는 점 고려
- [ ] Localization별 image 필요 여부 검토

## Retention Offers

- [ ] Retention offer 생성
- [ ] Subscription에 연결
- [ ] Offer eligibility 확인
- [ ] 여러 offer를 연결할지 결정
- [ ] App Store가 eligible customer에게 offer를 선택한다는 점 반영
- [ ] Sandbox에서 redemption 테스트
- [ ] Signed transaction의 `offerType = 5` 확인
- [ ] Offer identifier 확인
- [ ] Discount type 확인
- [ ] Offer period 확인

## Sandbox

- [ ] Sandbox subscription 생성/구매
- [ ] 실제 cancel flow 진입
- [ ] Message-only view 테스트
- [ ] Message + image 테스트
- [ ] Message + offer 테스트
- [ ] Offer 없는 preview 테스트
- [ ] Signed transaction 확인
- [ ] Renewal info 확인

## Real-time 도입 전

- [ ] Customer별 decisioning이 실제로 필요한지 검토
- [ ] Server 운영 capability 확인
- [ ] Low-latency requirement 수용 가능 여부 확인
- [ ] Interest form 제출 / access 여부 확인
- [ ] Retention Messaging API documentation 검토
- [ ] Sandbox/Production credential 분리

## Real-time Endpoint

- [ ] App Store callback URL 준비
- [ ] HTTPS endpoint 구성
- [ ] `originalTransactionId` 처리
- [ ] `productId` 처리
- [ ] `userLocale` 기반 localization
- [ ] `requestIdentifier` logging
- [ ] Environment 구분
- [ ] Request validation 설계
- [ ] Timeout budget 설정
- [ ] Malformed response 방지

## Message Response

- [ ] Retention Messaging API에서 message 구성
- [ ] Message identifier 관리
- [ ] Image identifier 관리
- [ ] Locale별 default message 설정
- [ ] App Store Connect message를 real-time preference로 사용할지 검토

## Alternate Product

- [ ] Same subscription group인지 확인
- [ ] Appropriate alternate `productId` 선택
- [ ] Monthly → annual transition 검토
- [ ] 12-month commitment billing plan 지원 여부 확인
- [ ] `billingPlanType` 필요 여부 확인
- [ ] 고객에게 plan 차이가 명확한 message 제공

## Promotional Offer

- [ ] Promotional offer 생성
- [ ] Customer eligibility logic 정의
- [ ] Signature 생성 infrastructure 준비
- [ ] Signature latency 측정
- [ ] Expiration / replay handling 검토
- [ ] Offer economics 검증

## Performance Test

- [ ] Sandbox message/image 설정 완료
- [ ] Sandbox endpoint 연결
- [ ] Functionality test 완료
- [ ] Performance test 시작
- [ ] 결과 조회
- [ ] Pass 확인
- [ ] Fail 시 latency/error 원인 수정
- [ ] Pass 전 production rollout 금지

## Production

- [ ] Production message 등록
- [ ] Production image 등록
- [ ] Production default message 설정
- [ ] Production endpoint 설정
- [ ] Monitoring 구성
- [ ] Timeout rate 확인
- [ ] Invalid response rate 확인
- [ ] Fallback 사용률 확인
- [ ] Message/image freshness 주기적으로 검토

## Fallback

- [ ] App Store Connect Retention Messaging도 반드시 설정 검토
- [ ] Real-time failure 시 ASC message가 적절한지 확인
- [ ] API default message도 설정할지 검토
- [ ] Fallback 각 단계의 localization 확인
- [ ] 장애 상황에서 실제 cancel flow 테스트

## Analytics

- [ ] Cancel confirmation reached count
- [ ] Message shown count
- [ ] Message identifier별 save rate
- [ ] Offer별 redemption
- [ ] Switch plan conversion
- [ ] Immediate save rate
- [ ] 30/60/90-day retained subscription 추적
- [ ] Discount cost 대비 retained revenue 분석

---

# ⚠️ 구현·운영 시 주의할 점

## App Store Connect와 Real-time은 상호 배타적이지 않다

Real-time은 App Store Connect 방식을 대체하는 것이 아니라 그 위에 확장하는 구조다.

실시간 서버가 실패할 수 있으므로 Apple도 App Store Connect message를 fallback으로 함께 설정할 것을 권장한다.

## Save Rate만 보고 과도한 Offer를 사용하지 않는다

무료 기간이 길수록 immediate save rate는 높을 수 있지만 실제 revenue와 LTV가 좋아진다는 보장은 없다.

다음까지 같이 봐야 한다.

- Offer cost
- Subsequent renewal
- Long-term churn
- ARPU
- LTV

## Retention Offer와 Promotional Offer를 구분한다

App Store Connect 방식은 retention offer, real-time 방식은 promotional offer를 사용한다.

둘의 decisioning과 transaction semantics가 다르다.

## Real-time Endpoint는 일반 Analytics API처럼 느리게 만들면 안 된다

사용자가 cancel UI에서 기다리는 요청이다.

Heavy query와 외부 dependency를 최소화해야 한다.

## Message Localization을 Locale 문자열 비교만으로 단순 구현하지 않는다

지원 localization fallback, region variant, default message 전략을 함께 정의해야 한다.

## Fallback을 실제 Sandbox에서 의도적으로 테스트한다

- Endpoint timeout
- 5xx
- Invalid JSON
- Unknown message ID

같은 장애 시나리오를 만들어 어떤 message가 실제로 보이는지 확인하는 것이 좋다.

---

# 🧩 주요 용어 정리

| 용어 | 의미 |
|---|---|
| Retention Messaging | 취소 확정 직전에 subscription 가치를 전달하는 App Store 기능 |
| Save Rate | Cancel confirmation page 도달 후 구독을 유지한 비율 |
| Retention Offer | App Store Connect 방식에서 사용하는 전용 offer type |
| `offerType = 5` | Retention offer redemption 식별 값 |
| Real-time Retention Messaging | App Store가 개발자 server에 실시간 decision을 요청하는 방식 |
| Retention Messaging API | Real-time message/image/default/endpoint 등을 관리하는 server API |
| Alternate Product | 같은 subscription group의 다른 product로 switch 제안 |
| Promotional Offer | Real-time response에서 사용할 수 있는 기존 promotional offer |
| Performance Test | Production real-time 사용 전 Sandbox에서 통과해야 하는 성능 검증 |
| Fallback Messaging | Real-time 실패 시 App Store가 대신 보여주는 사전 구성 message |

---

# 🔁 App Store Connect 방식 전체 흐름

```text
App Store Connect
      ↓
Retention Message 생성
      ↓
Text + Optional Image + Optional Offers
      ↓
Subscription과 Mapping
      ↓
Sandbox Test
      ↓
Production
      ↓
Customer Cancel Attempt
      ↓
App Store가 자동으로 Message / Offer 결정
      ↓
Customer Stays or Cancels
```

---

# 🔁 Real-time 방식 전체 흐름

```text
Retention Messaging API
Messages / Images / Defaults 준비
          ↓
Sandbox Endpoint 설정
          ↓
Performance Test Pass
          ↓
Production Endpoint
          ↓
Customer Cancel Attempt
          ↓
App Store → Developer Server
          ↓
Customer / Subscription Lookup
          ↓
Message / Switch Plan / Promotional Offer 결정
          ↓
Developer Server → App Store
          ↓
Cancellation UI 표시
          ↓
Failure라면 Fallback
```

---

# 🎯 선택 가이드

## 가장 단순하고 안정적인 시작

```text
App Store Connect Retention Messaging
```

적합:

- 서버 없음
- Subscription별 동일 message로 충분
- App Store가 offer selection을 맡겨도 됨

## 자동화가 필요하지만 real-time decisioning은 필요 없음

```text
App Store Connect
+
App Store Connect API
```

적합:

- 여러 앱
- 많은 localization
- Campaign automation

## 고객별 메시지/offer가 달라야 함

```text
Real-time Retention Messaging
```

적합:

- Backend segmentation
- Churn scoring
- Customer-specific retention strategy

## Plan 자체를 바꾸고 싶음

```text
Real-time
+
Switch Plan
```

적합:

- Monthly → Annual
- Same-group alternate tier
- Monthly billing + 12-month commitment

---

# 핵심 메시지

Retention Messaging은 subscription cancellation을 앱 내부의 자체 retention popup으로 막는 기능이 아니다.

사용자가 실제 App Store subscription 관리 화면에서 취소를 확정하려는 **가장 마지막 순간**에 App Store가 앱의 가치를 다시 설명하고 적절한 대안을 제공하게 하는 기능이다.

가장 먼저 고려할 방식은 App Store Connect Retention Messaging이다.

```text
Message
+
Optional Image
+
Optional Retention Offer
```

서버 없이 구성할 수 있고, 여러 offer를 연결해 두면 App Store가 eligible customer에게 적절한 offer를 자동 선택한다.

더 세밀한 제어가 필요하면 Real-time Retention Messaging으로 확장한다.

App Store가 취소 순간 개발자 서버에 `originalTransactionId`, product, locale, request identifier 등을 전달하고, 서버는 고객별로 message, promotional offer, 또는 same subscription group의 alternate product를 선택한다.

하지만 real-time 방식은 서버 latency가 사용자 경험에 직접 영향을 주기 때문에 Sandbox performance test를 통과해야 production에 사용할 수 있다.

또 서버가 실패할 가능성을 고려해 fallback hierarchy가 설계되어 있다.

```text
Real-time Response
      ↓ 실패
App Store Connect Retention Message
      ↓ 미설정
API Default Message
```

그래서 Apple은 real-time을 사용하더라도 App Store Connect Retention Messaging을 기본 fallback으로 설정할 것을 권장한다.

세션의 가장 중요한 설계 판단은 결국 **decisioning을 어디에서 할 것인가**다.

```text
Subscription 단위의 안정적인 사전 설정
→ App Store Connect

Customer 단위의 실시간 decision
→ Real-time Retention Messaging
```

그리고 어느 방식을 사용하든 단기적인 save rate뿐 아니라 offer cost, subsequent renewal, long-term churn, LTV까지 함께 측정해야 실제 retention 효과를 판단할 수 있다.

---

# 함께 보면 좋은 세션과 자료

- What's new in Apple In-App Purchase — WWDC26
- Enhance your presence on the App Store — WWDC26
- Retention Messaging API
- Supporting monthly subscriptions with a 12-month commitment
- App Store Connect API
