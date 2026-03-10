# WWDC25 세션 328 — What’s new in App Store Connect 요약

---

<br>

## ✨ 개요

* 이번 세션은 **App Store Connect의 2025년 주요 업데이트**를 한 번에 정리하는 세션입니다.
* 변화의 큰 축은 네 가지입니다.
  * **앱 관리와 빌드 배포 흐름 개선**
  * **앱 발견성 강화(App Store Tags, Custom Product Page 키워드, Offer Codes 확장)**
  * **사용자 신뢰를 높이는 정보 제공(Review Summaries, Age Ratings, Accessibility Nutrition Labels)**
  * **App Analytics, App Review 제출 흐름 등 운영 도구 전반 확장**
* 단순히 관리 콘솔 기능이 늘어난 수준이 아니라, **배포·테스트·검색 노출·신뢰 형성·운영 분석**까지 App Store Connect의 역할이 더 넓어졌다는 점이 핵심입니다.

<br>

## 🛠️ 앱 관리: Build Uploads와 배포 흐름 개선

* App Store Connect에는 **새로운 Build Uploads 영역**이 추가되어, 현재 진행 중인 앱 전달 상태를 더 명확하게 볼 수 있습니다.
* 이제 빌드가 처리 중인지, 에러가 났는지, 어떤 경고가 있었는지 등을 **팀 전체가 한눈에 확인**할 수 있습니다.
* 특히 중요한 변화는, **전달 실패한 빌드도 기록이 남는다**는 점입니다.
  * 예전에는 실패한 전달이 사라지거나 맥락 파악이 어려웠다면,
  * 이제는 실패 이력과 상세 메시지를 확인할 수 있어 원인 추적이 쉬워졌습니다.
* 또한 **빌드 전달이 실패한 경우 동일한 build number를 다시 사용할 수 있게** 되어 운영 유연성도 좋아졌습니다.
* 그리고 올해부터는 **App Store Connect API를 통한 build upload**도 지원되어, CI/CD나 사내 커스텀 배포 파이프라인과 더 자연스럽게 연결할 수 있습니다.
* 여기에 **Webhooks**가 추가되어 빌드 상태 변경을 실시간으로 받아 자동화하기 쉬워졌습니다.

<br>

## 📦 Apple-Hosted Background Assets

* 앱 크기 관리 측면에서는 **Apple-Hosted Background Assets**가 새롭게 강조됩니다.
* 이 기능을 사용하면 최대 **200GB 규모의 자산**을 Apple이 호스팅하는 형태로 배포할 수 있습니다.
* 지원 범위도 넓습니다.
  * iPhone
  * iPad
  * Mac
  * Apple TV
  * Apple Vision Pro
* 핵심 장점은, 앱 본체를 다시 올리지 않고도 **대용량 콘텐츠를 별도로 업데이트**할 수 있다는 점입니다.
* 게임이나 대형 미디어 앱처럼 에셋이 큰 경우, **앱 번들 크기 관리와 콘텐츠 운영 유연성**에서 특히 의미가 큽니다.

<br>

## 🧪 TestFlight 피드백과 알림 강화

* TestFlight 피드백 기능도 크게 확장되었습니다.
* 이제 **iPhone/iPad용 App Store Connect 앱**에서 tester 피드백과 알림을 직접 받을 수 있습니다.
* 개발자는 모바일 환경에서도 다음을 빠르게 확인할 수 있습니다.
  * 텍스트 피드백
  * 스크린샷 피드백
  * 크래시 로그
  * 피드백 당시의 기기/환경 정보
* 단순 조회만 되는 것이 아니라, **팀과 바로 공유**할 수 있어 대응 속도를 높일 수 있습니다.
* 알림이 너무 많아지는 문제를 줄이기 위해 **digest 방식의 notification scaling**도 제공합니다.
* 또한 App Store Connect API 측면에서는
  * **TestFlight feedback API**
  * **스크린샷/크래시 feedback용 Webhooks**
    가 추가되어 자동화 여지도 더 커졌습니다.
* 즉, 테스트 피드백이 더 이상 App Store Connect 웹에만 묶이지 않고, **모바일 운영 + API 자동화**까지 확장된 셈입니다.

<br>

## 🔍 발견성 강화 1: App Store Tags

* 올해 App Store의 큰 변화 중 하나는 **App Store Tags** 입니다.
* Apple은 앱의 설명, 카테고리, 스크린샷 등 다양한 메타데이터를 바탕으로 **앱의 특징과 기능을 더 잘 드러내는 태그**를 생성합니다.
* 이 태그는 **대규모 언어 모델(LLM)** 을 활용해 생성되지만, **human review**를 거쳐 품질을 관리합니다.
* 사용자는 태그를 눌러 **비슷한 특징을 가진 앱 컬렉션 화면**으로 이동할 수 있고,
  태그는 검색 결과나 카테고리 주변 등 App Store의 여러 위치에 노출됩니다.
* 중요한 점은 개발자에게도 제어권이 있다는 것입니다.
  * App Store Connect의 App Information에서 태그를 확인할 수 있고,
  * 필요하면 일부 태그를 제거해 앱과의 연결을 끊을 수 있습니다.
* 즉, 태그는 Apple이 자동 생성하지만, 최종적으로는 **앱 포지셔닝을 더 섬세하게 조정할 수 있는 발견성 레이어**로 볼 수 있습니다.

<br>

## 🎯 발견성 강화 2: Custom Product Page 키워드

* **Custom Product Pages**에도 중요한 확장이 들어왔습니다.
* 이제 커스텀 프로덕트 페이지에 **키워드(keyword)** 를 연결할 수 있어, 해당 페이지가 **검색 결과에 직접 노출**될 수 있습니다.
* 이는 기본 제품 페이지 하나로 모든 검색 의도를 커버하던 방식에서 벗어나,
  **검색어 의도별로 다른 페이지를 보여주는 전략**이 가능해졌다는 뜻입니다.
* 예를 들어 하나의 앱이 운동 추적, 식단 기록, 수면 분석을 모두 제공한다면,
  각 use case에 맞는 custom product page를 만들고 관련 키워드를 각각 연결할 수 있습니다.
* 키워드만 할당하는 경우에는 **리뷰 제출 없이 바로 반영 가능**하다는 점도 운영상 유용합니다.
* 또 **App Analytics에서 custom product page별 검색 트래픽**도 확인할 수 있어,
  마케팅과 ASO(App Store Optimization)를 더 세밀하게 최적화할 수 있습니다.

<br>

## 🎟️ 발견성 강화 3: Offer Codes 확장

* 기존에 구독(subscription) 중심으로 사용되던 **Offer Codes**가 이제 더 넓어졌습니다.
* 지원 대상이 다음까지 확장됩니다.
  * **Consumables**
  * **Non-consumables**
  * **Non-renewing subscriptions**
* 즉, 이제는 거의 모든 In-App Purchase 유형에 대해 **무료/할인 코드 발급**이 가능해졌습니다.
* 한 In-App Purchase당 **최대 10개의 활성 offer**, 앱 단위로 분기당 **최대 100만 개 코드**를 발급할 수 있습니다.
* 사용자 eligibility도 더 세밀하게 나눌 수 있습니다.
  * 아직 한 번도 구매하지 않은 사용자
  * 구매 이력이 있지만 최근 30일 내 결제는 없는 사용자
  * 최근 30일 내 결제한 사용자
* 추가로 **Sandbox 환경에서도 Offer Code 생성/검증**이 가능해져,
  앱과 서버의 redemption 로직을 미리 검증하기 쉬워졌습니다.
* 배포 방식도 다양합니다.
  * 딥링크
  * QR 코드
  * 앱 내 입력
* 사용자가 코드를 redeem하면 App Store가 설치/처리 흐름을 이어가며,
  개발자는 StoreKit으로 transaction을 인식하고 권한만 정확히 부여하면 됩니다.

<br>

## 📝 사용자에게 신뢰를 주는 정보 1: Review Summaries

* Apple은 이제 **Review Summaries**를 통해 사용자 리뷰를 짧은 요약 문단으로 보여줍니다.
* 이 요약은 **충분한 리뷰 수가 있는 앱/게임**에 대해 생성되며, 정기적으로 갱신됩니다.
* 핵심은 개별 리뷰를 하나하나 읽지 않아도,
  사용자가 **앱에 대한 전반적 인상과 반복적으로 언급되는 포인트**를 빠르게 파악할 수 있다는 것입니다.
* 개발자 입장에서는 App Store Connect에서
  * 현재 노출 중인 summary
  * 마지막 생성 시점
    등을 확인할 수 있습니다.
* 요약이 부정확하다고 느껴지면 **concern report**를 통해 이의를 제기할 수 있습니다.
* 즉, 별점과 개별 리뷰 사이에 **중간 해석 레이어**가 생긴 셈입니다.

<br>

## 👶 사용자에게 신뢰를 주는 정보 2: Age Ratings 개편

* **Age Ratings**도 큰 폭으로 개편되었습니다.
* 이제 연령 등급은 총 **5개 threshold**를 가지며, 그중 **3개가 신규 구간**입니다.
* 이 변화로 어린이, 프리틴, 십대 등 다양한 연령대를 더 세밀하게 구분할 수 있게 되었습니다.
* 또한 지역별 요구사항을 반영해 **국가/지역별로 다른 rating**이 적용될 수 있습니다.
* 개발자는 단순히 폭력성/선정성 같은 전통적인 문항만 답하는 것이 아니라,
  이제 다음 요소도 더 구체적으로 선언하게 됩니다.
  * parental controls 또는 age assurance 같은 **in-app controls**
  * **messaging / chat**
  * **user-generated content**
  * **advertising**
* 시스템이 기본 rating을 계산해주지만,
  앱 정책상 더 높게 잡아야 하면 **override로 상향 조정**할 수 있습니다.
* Apple은 기존 응답을 바탕으로 새 연령 등급을 자동 계산하므로,
  올해는 특히 **새 질문들을 다시 검토해 결과가 의도와 맞는지 확인하는 것**이 중요합니다.

<br>

## ♿ 사용자에게 신뢰를 주는 정보 3: Accessibility Nutrition Labels

* 이번 세션의 가장 인상적인 변화 중 하나는 **Accessibility Nutrition Labels** 입니다.
* 앱이 어떤 접근성 기능을 지원하는지 App Store 제품 페이지에서 **명확하게 선언**할 수 있게 됩니다.
* 예를 들면 다음과 같은 기능 지원 여부를 표시할 수 있습니다.
  * Larger Text
  * VoiceOver
  * 기타 접근성 기능
* 중요한 점은 이 선언이 **기기별로 독립적**이라는 것입니다.
  * 같은 앱이라도 iPhone, iPad, Mac 등에서 접근성 지원 수준이 다를 수 있기 때문에,
  * 기기별 draft를 따로 만들고 각각 정확하게 작성할 수 있습니다.
* 작성 과정에서도 각 기능에 대한 설명이 제공되고,
  마지막 단계에서 실제 product page에 어떻게 보일지 미리 볼 수 있습니다.
* 모든 라벨은 우선 **draft**로 저장되며,
  준비가 되면 개별 또는 여러 기기용 라벨을 함께 publish할 수 있습니다.
* 이후 앱이 더 많은 접근성 기능을 지원하게 되면, 언제든지 다시 수정할 수 있습니다.
* 결국 이 기능은 접근성을 “있으면 좋은 부가 기능”이 아니라,
  **사용자가 다운로드 전에 확인할 수 있는 공식 제품 정보**로 끌어올린 변화라고 볼 수 있습니다.

<br>

## 📊 추가 확장: App Analytics, App Review, Games 생태계

* 세션 마지막에는 앞에서 길게 다루지 않은 추가 업데이트도 소개됩니다.
* **App Analytics**에는 **100개 이상의 새로운 지표**가 추가됩니다.
  * 특히 구독과 수익화 관련 데이터가 강화되어,
  * 앱 비즈니스 성과를 더 깊게 분석할 수 있게 됩니다.
* 분석 UI도 새롭게 바뀌어 탐색, 필터링, 비교가 더 쉬워집니다.
* 게임 영역에서는
  * 새로운 **Games app**
  * Game Center의 활동/챌린지 개선
    등이 소개되며, 발견성과 참여를 함께 강화합니다.
* **App Review 제출 흐름**도 좋아집니다.
  * Apple-Hosted Background Assets 같은 새 submission item이 추가되고,
  * 여러 항목을 **draft submission으로 묶어 함께 리뷰 요청**할 수 있습니다.
  * In-App Event와 Custom Product Page처럼 함께 검토받고 싶은 항목 구성에 특히 유용합니다.

<br>

## ✅ 정리

* 이번 App Store Connect 업데이트는 단순 기능 추가보다, **운영 도구의 성격이 더 전략적으로 바뀐 것**에 가깝습니다.
* 개발자는 이제
  * build 업로드와 실패 이력을 더 투명하게 관리하고,
  * TestFlight 피드백을 더 빠르게 수집하고,
  * App Store Tags와 CPP 키워드로 발견성을 높이고,
  * Offer Codes로 프로모션 전략을 확장하고,
  * Review Summary / Age Rating / Accessibility Nutrition Labels로 사용자 신뢰를 더 구조적으로 전달할 수 있습니다.
* 특히 **Accessibility Nutrition Labels**, **CPP 키워드**, **Offer Codes 확장**은 실제 App Store 운영 전략에 바로 영향을 줄 만한 변화입니다.
* App Store Connect는 이제 단순 배포 포털을 넘어, **출시 이후 성장과 설명 책임까지 관리하는 운영 허브**로 더 진화하고 있습니다.
