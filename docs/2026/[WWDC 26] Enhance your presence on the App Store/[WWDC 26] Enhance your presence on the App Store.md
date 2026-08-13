# WWDC26 Enhance your presence on the App Store 요약

- Session: 205
- Title: Enhance your presence on the App Store
- Source: https://developer.apple.com/videos/play/wwdc2026/205/
- Topic: App Store, App Store Connect, Product Page Header, Search Results, Asset Library, Custom Product Pages, Product Page Optimization, Apple Ads
- Chapters: Introduction, New asset placements, Meet Asset Library, Next steps

---

## 한 줄 요약

iOS 27과 iPadOS 27의 App Store에서는 **Product Page Header와 Search Results에 기존 앱 스크린샷·앱 미리보기와 별도로 마케팅용 이미지·비디오를 배치**할 수 있으며, App Store Connect의 새 **Asset Library**에서 creative asset을 미리 심사받아 보관한 뒤 새 앱 버전 제출 없이 Header와 Search Results에 바로 교체·게시할 수 있다.

---

## 핵심 요약

이번 세션은 App Store에서 앱의 첫인상을 만드는 visual asset 사용 방식이 크게 확장되는 내용을 설명한다.

- **Product Page Header**
  - 앱 제품 페이지의 첫 visual element
  - screenshot / app preview와 별도 이미지·비디오 사용
  - visual identity, brand, core value를 더 직접적으로 표현

- **Search Results**
  - 기본 screenshot 대신 별도의 이미지·비디오를 표시 가능
  - 검색 결과에서 앱의 core value와 핵심 기능을 더 빠르게 전달
  - Custom Product Pages와 조합해 검색 키워드별 다른 visual을 보여줄 수 있음

- **Creative Asset 재사용**
  - Product Page Header
  - Search Results
  - Custom Product Pages
  - Apple Ads Today tab / Search Results
  - 같은 marketing creative를 여러 discovery surface에 재사용

- **Product Page Optimization**
  - Logo, core value, new feature 등 서로 다른 visual을 실험
  - audience가 어느 asset에 더 반응하는지 테스트

- **Asset Library**
  - App Store Connect 안의 중앙 asset 관리 공간
  - screenshots, preview videos, in-app event media, 새 marketing images/videos를 한곳에서 관리
  - creative asset만 앱 버전과 별도로 standalone review 가능
  - 승인된 asset은 이후 추가 review 없이 Product Page Header와 Search Results에 사용 가능
  - 승인 asset 교체를 새 앱 버전 제출 없이 직접 publish 가능

- **자동화**
  - App Store Connect API로 Asset Library 업로드·제출 자동화
  - Apple Ads Platform API로 광고 setup 자동화
  - Swift 등을 위한 open-source client library도 소개

---

# 👀 App Store의 첫 몇 초

사용자가 App Store에서 앱을 발견했을 때 처음 몇 순간에 보는 것이 다음 행동에 큰 영향을 준다.

```text
App 발견
   ↓
첫 visual 인상
   ↓
더 알아볼지?
또는
스크롤해 지나갈지?
```

기존 Product Page에는 screenshot과 app preview가 있었고 Search Results에서도 기본적으로 screenshot과 preview가 표시됐다.

이번 업데이트는 이 두 위치에 **스크린샷과 별개의 새로운 visual placement**를 추가한다.

---

# 🆕 Product Page Header

Product Page Header는 앱 페이지에 진입했을 때 처음 보이는 visual element다.

사용 가능한 asset:

- Image
- Video

기존 app screenshot이나 preview에 제한되지 않는다.

따라서 다음을 더 자유롭게 표현할 수 있다.

- Brand identity
- 앱의 분위기
- Core value
- 현재 campaign
- 중요한 feature
- 사용자가 기대하게 될 experience

Video를 사용하면 앱을 어떤 narrative로 인식하게 할지도 더 적극적으로 설계할 수 있다.

---

# 🧩 Header, Icon, Screenshot의 역할

Apple은 Header를 screenshot의 대체물로 설명하지 않는다.

```text
Product Page Header
        +
App Icon
        +
Screenshots
        ↓
앱이 무엇인지 더 분명하게 전달
```

Header는 brand와 첫 인상, screenshot은 실제 앱 경험과 기능 설명이라는 식으로 역할을 나눌 수 있다.

---

# 🔎 Search Results의 새 Visual

Search Results에서도 기본 app screenshot 대신 별도의 image 또는 video를 사용할 수 있다.

목표:

- 검색 결과 목록에서 눈에 띄기
- 앱의 core value를 빠르게 전달
- 사용자가 상세 페이지를 탭하게 만들기

검색 결과에서는 사용자가 긴 설명을 읽지 않기 때문에 visual 자체가 핵심 메시지를 즉시 전달해야 한다.

---

# 🎯 Header와 Search Results의 차이

## Product Page Header

사용자가 이미 앱 상세 페이지에 진입했다.

목표:
- Brand 강화
- 더 풍부한 storytelling
- 페이지 전체의 첫 인상 형성

## Search Results

사용자가 여러 앱을 비교하는 단계다.

목표:
- 목록에서 attention 획득
- Core value를 즉시 전달
- Product Page 방문 유도

같은 asset을 사용할 수 있지만 두 placement의 context는 다르다.

---

# 📣 Apple Ads에도 같은 Asset 사용

새 이미지와 video는 App Store organic placement뿐 아니라 Apple Ads campaign에도 사용할 수 있다.

세션에서 언급한 광고 placement:

- Today tab
- Search Results

즉 하나의 creative asset을 organic discovery와 paid acquisition에 함께 활용할 수 있다.

---

# 🧭 Custom Product Pages와 연결

Custom Product Pages와 새 visual placement를 결합하면 특정 audience나 campaign에 맞는 experience를 만들 수 있다.

---

# 🧘 Yoga Campaign 예제

Exercise App의 website가 yoga class를 홍보한다고 가정한다.

```text
Website
Yoga campaign banner
        ↓
Custom Product Page
        ↓
같은 Yoga visual의 Header
        ↓
Install
        ↓
Yoga offering으로 deep link
```

웹사이트에서 본 visual을 App Store에서도 이어가고 설치 후에는 앱 안의 해당 Yoga offering으로 직접 연결한다.

즉 discovery에서 installation 이후까지 campaign message를 유지할 수 있다.

---

# 🔤 Search Keyword별 Visual

Custom Product Pages를 이용하면 서로 다른 search keyword에 맞춰 다른 creative asset을 보여줄 수도 있다.

```text
Keyword A
→ Creative A
→ Custom Product Page A

Keyword B
→ Creative B
→ Custom Product Page B
```

검색 의도와 더 관련성 높은 visual을 제공하는 방식이다.

---

# 🔄 Search Result와 Header의 일관성

Apple은 Search Results와 Product Page Header에서 같은 marketing visual을 사용하는 것도 제안한다.

```text
Search Result Visual
        ↓
Product Page Header
        ↓
Screenshots
```

Discovery 단계와 detail page의 visual language가 이어지면 사용자는 자신이 탭한 앱과 campaign이 맞다는 확신을 얻기 쉽다.

---

# 🧪 Product Page Optimization

어떤 visual이 실제로 효과적인지는 직감만으로 결정하기 어렵다.

App Store Connect의 Product Page Optimization으로 다음을 테스트할 수 있다.

- App logo 중심 visual
- Core value 중심 visual
- New feature 중심 visual
- 다른 campaign creative

Audience가 어떤 asset에 더 반응하는지 데이터로 검증하는 데 사용한다.

---

# 🏕️ 카테고리별 활용 예

Apple은 모든 App Store category가 새 image/video placement를 사용할 수 있다고 설명한다.

## Outdoor App
- Aspirational imagery
- Hiking
- Mountain scenery

## Travel App
- Popular destinations
- City
- Resort
- Landmark

## Games
- Gameplay
- Characters
- Game world

즉 단순 UI 설명용 screenshot을 넘어 marketing storytelling의 폭이 넓어진다.

---

# 📱 지원 Platform

세션에서는 Product Page Header와 Search Result visual을 다음에서 업데이트할 수 있다고 설명한다.

- iOS 27
- iPadOS 27

---

# 🛠️ App Store Connect 제출 방식 2가지

새 rich media asset은 두 경로로 App Review에 제출할 수 있다.

```text
1. App Version Submission
2. Asset Library Standalone Submission
```

---

# 1️⃣ 기존 Version Submission Flow

기존 앱 버전 제출 과정에서 creative asset을 함께 올릴 수 있다.

```text
App Version Page
      ↓
Assets Upload
      ↓
Preview
      ↓
Version + Assets Submit
      ↓
App Review
      ↓
Version Release
      ↓
Header / Search Visual Live
```

---

# 👁️ 새 Preview 기능

Version page에 asset을 업로드한 뒤 새로운 Preview 기능으로 App Store에서 실제로 어떻게 보일지 확인할 수 있다.

확인 범위:

- iPhone
- iPad
- Different orientations
- Different languages

배포 전에 Header, icon, screenshot을 함께 보며 visual composition을 점검할 수 있다.

---

# 2️⃣ Asset Library

이번 세션의 핵심 새 기능이다.

**Asset Library**는 App Store Connect 안에서 앱의 visual asset을 중앙 집중식으로 관리하는 공간이다.

포함되는 asset:

- Existing screenshots
- Preview videos
- In-app event media
- New marketing images
- New marketing videos

새 marketing visuals는 App Store Connect에서 **creative assets**라고 부른다.

---

# 🗃️ Asset Library의 관리 축

Asset Library는 asset을 다음 기준으로 관리한다.

- Platform
- Size
- Placement

앱의 visual inventory를 한곳에서 관리할 수 있다.

---

# 📤 Creative Asset Standalone Review

Asset Library에서는 앱 버전을 업데이트하지 않고 creative asset만 별도로 review에 제출할 수 있다.

```text
Asset Library
      ↓
Creative Asset Upload
      ↓
Standalone Review Submit
      ↓
App Review
      ↓
Approved Asset Library
```

이때 미래에 어느 placement에서 사용할지 미리 지정하지 않아도 된다.

---

# 🔀 두 Approval Flow

Creative asset은 다음 두 방식으로 승인될 수 있다.

## Version Submission
```text
New App Version
+
Creative Assets
→ Review
```

## Asset Library
```text
Creative Assets only
→ Review
```

어느 방식으로 승인되든 최종적으로 승인된 asset은 Asset Library에서 사용할 수 있다.

---

# 🚀 Asset Library의 가장 큰 장점

한번 승인된 creative asset은 이후 Product Page Header와 Search Results에 적용할 때 추가 review가 필요하지 않다.

```text
Asset A
Asset B
Asset C
      ↓
미리 Review
      ↓
Approved Asset Library
      ↓
필요한 순간 바로 사용
```

Marketing campaign timing을 binary release timing과 분리할 수 있다.

---

# ❄️ Summer → Winter 교체 예

세션의 outdoor app 예제:

현재:
```text
Summer Hiking Header
```

Asset Library에는 이미 승인된:
```text
Winter Hiking Asset
```

관리자가 Winter asset을 선택해 Summer asset을 교체한다.

```text
Summer Hiking
      ↓
Approved Winter Hiking 선택
      ↓
Direct Publish
      ↓
Winter Hiking Header
```

새 앱 버전 제출이 필요 없다.

---

# ⚡ Real-time Update

Apple은 사전 승인된 asset을 사용하면 Product Page Header와 Search Results를 **real-time으로 업데이트할 수 있는 flexibility**를 얻는다고 설명한다.

중요한 전제:

> 새 미심사 asset을 바로 게시하는 것이 아니라, **이미 승인된 asset을 placement에 적용**하는 것이다.

---

# 📅 Seasonal Campaign 운영

Asset Library를 이용하면 seasonal asset을 미리 준비하고 심사받아 둘 수 있다.

```text
봄 Asset
여름 Asset
가을 Asset
겨울 Asset
      ↓
사전 심사
      ↓
Approved Library
      ↓
시즌 시작에 맞춰 즉시 교체
```

App binary release 일정과 marketing visual update 일정을 분리할 수 있다.

---

# 🤖 App Store Connect API

Asset Library workflow는 App Store Connect UI에만 한정되지 않는다.

세션에서는 다음을 API로 자동화할 수 있다고 설명한다.

- Creative asset upload
- Asset Library submission

자동화된 asset management pipeline을 구성할 수 있다.

---

# 📢 Apple Ads Platform API

Apple Ads campaign setup도 Apple Ads Platform API로 자동화할 수 있다.

세션에서는 다음도 언급한다.

- Open-source client libraries
- Swift 포함

Asset Library와 Apple Ads를 함께 자동화하는 workflow도 가능하다.

---

# 🔄 Creative Asset 재사용 구조

```text
                   ┌─ Product Page Header
                   ├─ Search Results
Creative Asset ────┼─ Custom Product Page
                   ├─ Today Tab Ads
                   └─ Search Results Ads
```

하나의 approved creative를 여러 discovery surface에서 재사용할 수 있다.

---

# 🧭 일관된 Customer Journey

세션 예시를 연결하면 다음과 같은 흐름을 만들 수 있다.

```text
External Campaign / Website
          ↓
Search Result Creative
          ↓
Custom Product Page Header
          ↓
Screenshots / App Preview
          ↓
Install
          ↓
Deep-linked In-App Experience
```

각 단계의 visual과 message를 일치시키는 것이 중요하다.

---

# 🧩 Placement별 목적

| Placement | 목적 |
|---|---|
| Product Page Header | 앱 페이지의 첫 인상, brand, narrative |
| Screenshots | 실제 앱 experience와 feature 설명 |
| App Preview | 앱 동작을 video로 전달 |
| Search Results Creative | 검색 목록에서 core value를 빠르게 전달 |
| Custom Product Page | Audience / campaign별 tailored message |
| Apple Ads Today Tab | Paid discovery |
| Apple Ads Search Results | 검색 기반 paid acquisition |
| Website / External Campaign | App Store 이전 단계의 campaign message |

---

# 🔁 Review Flow 비교

## Version-based

```text
Version 준비
      ↓
Assets 추가
      ↓
Preview
      ↓
Version + Assets Review
      ↓
Version Release
      ↓
Assets Live
```

## Asset Library-based

```text
Creative Asset 준비
      ↓
Asset Library Upload
      ↓
Asset-only Review
      ↓
Approved
      ↓
나중에 Placement 선택
      ↓
Additional Review 없이 Publish
```

---

# 📋 체크리스트

## Product Page Header
- [ ] Header의 핵심 message 정의
- [ ] Image와 video 중 적합한 format 결정
- [ ] Screenshot과 역할이 중복되지 않는지 검토
- [ ] Brand identity가 명확한지 확인
- [ ] App icon과 시각적으로 조화되는지 확인
- [ ] Different language에서 visual 적합성 확인

## Search Results
- [ ] 검색 목록에서 core value가 즉시 보이는지 확인
- [ ] Product Page로 탭할 이유가 있는지 검토
- [ ] Default screenshot보다 creative가 실제로 더 효과적인지 테스트
- [ ] Header와 visual continuity 확인
- [ ] Keyword별 Custom Product Page 활용 여부 검토

## Custom Product Pages
- [ ] Campaign별 audience 정의
- [ ] External website와 동일한 visual 사용 검토
- [ ] Search keyword별 tailored creative 검토
- [ ] Install 후 적절한 in-app destination으로 deep link
- [ ] Discovery부터 in-app experience까지 message continuity 확인

## Product Page Optimization
- [ ] 테스트할 visual hypothesis 정의
- [ ] Logo 중심 variation
- [ ] Core value 중심 variation
- [ ] New feature 중심 variation
- [ ] Audience response 비교
- [ ] 결과를 Header/Search strategy에 반영

## App Store Connect Preview
- [ ] Version page에 asset 업로드
- [ ] Preview 기능 사용
- [ ] iPhone 확인
- [ ] iPad 확인
- [ ] Orientation별 확인
- [ ] Language별 확인
- [ ] Header, icon, screenshot을 함께 검토

## Asset Library
- [ ] Existing screenshot과 preview inventory 확인
- [ ] In-app event media 확인
- [ ] Marketing image/video를 creative asset으로 정리
- [ ] Platform/size/placement별 관리
- [ ] Future campaign asset 사전 업로드
- [ ] Standalone review 활용 여부 결정
- [ ] Approval 상태 관리
- [ ] Approved asset을 reusable inventory로 관리

## Review 전략
- [ ] Version submission과 함께 심사할 asset 구분
- [ ] Asset Library standalone review할 asset 구분
- [ ] Campaign 전에 미리 승인
- [ ] 심사 시 future placement를 미리 지정할 필요가 없음을 활용
- [ ] Approved와 unapproved asset 명확히 구분

## Seasonal Update
- [ ] Seasonal asset 사전 제작
- [ ] 여러 creative 미리 승인
- [ ] 캠페인 시작 시 approved asset으로 교체
- [ ] Binary release와 marketing schedule 분리
- [ ] Product Page와 Search Result를 함께 업데이트할지 결정

## Automation
- [ ] App Store Connect API로 asset upload 자동화 검토
- [ ] Asset Library submission 자동화 검토
- [ ] Marketing pipeline 연결 검토
- [ ] Apple Ads Platform API 사용 검토
- [ ] Swift client library 활용 가능성 확인

---

# ⚠️ 운영 시 주의할 점

## Header는 Screenshot의 대체물이 아니다

Header는 brand와 narrative를 전달하는 새로운 공간이고, screenshot은 실제 앱 experience를 보여준다.

## Search Result Creative는 더 즉각적이어야 한다

검색 화면에서는 긴 설명보다 core value를 빠르게 전달해야 한다.

## Approved Asset과 즉시 Publish를 혼동하지 않는다

Asset Library의 장점은 **사전에 승인된 asset**을 추가 review 없이 placement에 적용할 수 있다는 것이다. Asset 자체의 최초 review가 사라진 것은 아니다.

## Custom Product Page의 Visual만 맞추고 끝내지 않는다

External campaign → Search Result → Product Page → Install → In-app deep link까지 연결해야 완전한 funnel이 된다.

## Product Page Optimization을 사용한다

어떤 이미지가 효과적인지 intuition만으로 결정하기보다 audience response로 검증한다.

---

# 🧩 이번 업데이트 전후 비교

| 항목 | 기존 | 새 기능 |
|---|---|---|
| Product Page 상단 | App icon, screenshot 중심 | 별도 Header image/video |
| Search Results | 기본 screenshot/preview | 별도 marketing image/video |
| Asset 관리 | Placement/version별 관리 부담 | Asset Library 중앙화 |
| Creative review | Version flow 중심 | Standalone review 가능 |
| 승인 후 재사용 | 제한적 | 여러 placement에서 활용 |
| Seasonal 교체 | Version 일정 영향 가능 | 승인 asset을 직접 교체 |
| Product Page 검토 | 제한된 사전 확인 | 새 Preview 기능 |
| Automation | 기존 submission flow | Asset Library API + Ads API |

---

# 핵심 메시지

이번 App Store 업데이트는 단순히 새로운 이미지 위치 하나를 추가한 것이 아니다.

Product Page Header와 Search Results가 앱 screenshot의 연장이 아니라 **독립적인 marketing storytelling surface**로 확장됐다.

같은 visual asset을 Custom Product Pages, Product Page Header, Search Results, Apple Ads에 재사용할 수 있어 discovery funnel 전체의 visual consistency를 만들기 쉬워졌다.

App Store Connect의 Asset Library는 visual asset을 앱 version release에서 분리하는 새로운 운영 모델을 제공한다.

Creative asset을 미리 심사받아 승인해 두면 실제 campaign 시점에 새 binary 제출이나 추가 review 없이 승인된 asset을 Header와 Search Results에 적용할 수 있다.

따라서 운영 방식도 다음처럼 바뀔 수 있다.

```text
App Release 중심 운영
        ↓
Approved Creative Pool 기반
Campaign 중심 운영
```

Product Page Optimization으로 visual을 실험하고, Asset Library를 reusable approved inventory로 운영하며, App Store Connect API와 Apple Ads Platform API로 자동화하면 App Store marketing surface를 훨씬 더 민첩하게 운영할 수 있다.

---

# 함께 보면 좋은 자료

- App Store — What's New
- Creating your Product Page
- Design your own ads with creative assets
- App Store Connect API
- Apple Ads Platform API
