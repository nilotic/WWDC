# WWDC26 — Unlock in-game content with StoreKit and Background Assets

- **Session:** 378
- **Title:** Unlock in-game content with StoreKit and Background Assets
- **Source:** https://developer.apple.com/videos/play/wwdc2026/378/
- **Basis:** Apple Developer official full transcript and Code section
- **Speaker:** Sam, StoreKit team
- **Topics:** Background Assets, localized asset packs, Steam asset conversion, Unity plug-ins, StoreKit, StoreKit Testing, App Store presence

---

## 🎯 한 줄 요약

WWDC26 세션 378은 Apple 플랫폼용 게임에서 **대용량 게임 자산을 필요한 시점에만 내려받고**, **Unity 프로젝트에서 StoreKit 기반 In-App Purchase를 네이티브 흐름 그대로 연결**하는 전체 파이프라인을 보여준다. iOS 27의 **localized asset packs**, Steam depot 변환 도구, 새 **Background Assets / StoreKit Unity plug-ins**, 구매 검증과 entitlement 복구, 구매 후 asset pack 확보, Xcode 테스트 환경까지 하나의 배포·구매·콘텐츠 전달 흐름으로 묶는 것이 핵심이다.

---

## 🧭 세션 구성

| 시간 | 주제 |
|---|---|
| 0:01 | Introduction |
| 0:33 | Background Assets |
| 1:35 | Localized asset packs |
| 3:14 | Convert Steam depots to asset packs |
| 4:15 | Unity plug-ins |
| 5:52 | StoreKit and Background Assets sample code |
| 8:25 | Game presence |
| 9:10 | Next steps |

---

## 📦 Managed Background Assets가 해결하는 문제

게임은 실행 파일 외에도 오디오, 비디오, 텍스처, 머신러닝 모델처럼 큰 자산을 포함한다. 하지만 모든 자산이 처음부터 필요한 것은 아니다. Apple이 제시하는 기본 전략은 **초기 앱 다운로드 크기를 줄이고, 플레이 시점에 필요한 asset pack만 내려받는 것**이다.

Managed Background Assets를 사용하면 시스템이 필요한 asset pack을 자동으로 내려받고 관리한다. App Store 배포 앱은 Apple이 앱당 최대 **200GB**의 asset을 호스팅할 수 있으며, 이 호스팅은 Apple Developer Program 멤버십에 포함된다.

이 기능 자체는 iOS, iPadOS, macOS, tvOS, visionOS 26부터 Apple-Hosted Background Assets로 제공되었고, WWDC26에서는 여기에 **현지화된 asset pack**과 Unity 연동이 추가됐다.

### 게임 구조에서의 의미

초기 다운로드에는 다음처럼 항상 필요한 구성만 남길 수 있다.

- 메인 실행 파일
- 첫 화면과 기본 UI
- 초반 튜토리얼 또는 공용 리소스
- 자산 다운로드를 위한 manifest/메타데이터

그 외 콘텐츠는 사용 시점에 분리할 수 있다.

- 특정 챕터/지역의 텍스처
- 특정 언어의 음성
- 컷신 비디오
- 특정 레벨에만 필요한 ML 모델
- DLC와 연결된 콘텐츠

핵심은 “앱 번들 크기”와 “플레이어가 실제로 필요로 하는 저장 공간”을 분리하는 것이다.

---

## 🌍 iOS 27의 localized asset packs

WWDC26에서 가장 큰 Background Assets 변화는 **language-aware asset delivery**다. Asset pack manifest에 언어를 지정하면 시스템이 사용자의 Settings 언어에 맞는 pack만 설치한다.

예를 들어 게임이 다음 세 언어를 제공한다고 가정한다.

- English — primary language
- French
- German

기존 방식에서는 세 언어 자산이 모두 내려갈 수 있었다. Localized asset pack을 사용하면 독일어 사용자는 독일어 pack만 받는다. 음성·영상처럼 언어별 용량이 큰 게임에서는 저장 공간 절감 효과가 특히 크다.

### 언어 fallback

시스템은 exact match가 없더라도 자동으로 가장 가까운 언어를 선택한다.

- 사용자가 `en-GB`를 선택했지만 해당 pack이 없다면 base English variant로 fallback
- 사용자가 Spanish를 선택했지만 Spanish 계열 pack 자체가 없다면 앱의 primary language로 fallback

즉, 앱이 모든 locale 조합을 별도로 제공하지 않아도 시스템이 적절한 fallback을 수행한다.

### Manifest 구조

공식 예제는 asset pack manifest에 `language`를 추가한다.

```json
{
  "assetPackID": "voice-english",
  "downloadPolicy": { },
  "language": "en-US",
  "sourceRoot": ".",
  "fileSelectors": [ ],
  "platforms": [ ]
}
```

실제 프로젝트에서는 `downloadPolicy`, `fileSelectors`, `platforms` 등에 게임의 배포 규칙을 채운다.

### 설계 포인트

Localized asset packs는 단순 번역 문자열이 아니라 **용량이 큰 locale-specific binary assets**에 특히 적합하다.

- 더빙 음성
- 지역별 시네마틱
- 지역별 튜토리얼 동영상
- 언어별 speech/ML resource

String Catalog 같은 앱 내 텍스트 현지화와는 목적이 다르다.

---

## 🔄 Steam depot → Apple asset pack 변환

Steam에서 이미 depot 기반으로 자산을 관리하는 게임을 Apple 플랫폼으로 포팅할 때 같은 자산 구성을 다시 만들 필요를 줄이기 위해 Apple은 **Steam Asset Converter**를 제공한다.

Xcode 27이 설치된 macOS에서 `ba-package convert`를 사용한다.

```bash
xcrun ba-package convert \
  --asset-pack-id voice-english \
  -l en-US \
  --on-demand voice-english.vdf \
  -o voice-english.json
```

핵심 입력은 다음과 같다.

- asset pack ID
- language ID — 해당 시
- download policy
- Steam manifest build script

출력은 Apple Background Assets용 manifest JSON이다.

### Manifest → asset pack archive

변환된 manifest로 실제 archive를 만든다.

```bash
xcrun ba-package voice-english.json -o voice-english.aar
```

이렇게 생성한 archive를 게임에서 사용할 수 있다.

발표 시점 기준으로 converter는 macOS에서 사용할 수 있고, Apple은 Linux와 Windows 지원도 예정이라고 설명했다.

### 포팅 관점의 장점

기존 Steam depot의 논리적 분할을 유지할 수 있으므로 다음 구조를 재사용하기 쉽다.

- 언어별 depot → localized asset pack
- DLC depot → on-demand asset pack
- 레벨별 depot → level asset pack
- 고해상도 리소스 depot → 플랫폼/정책별 pack

즉, Apple 플랫폼을 위해 완전히 별도의 콘텐츠 파이프라인을 새로 설계하는 부담을 줄인다.

---

## 🧩 새 Apple Unity plug-ins

WWDC26에서 Apple은 기존 Apple Unity Plug-Ins 포트폴리오에 두 가지를 추가했다.

- **Background Assets**
- **StoreKit**

두 plug-in 모두 C# API를 제공하며, 내부적으로 네이티브 Apple framework를 연결한다.

### 빌드·테스트 요구사항

세션에서 제시한 환경은 다음과 같다.

- Xcode 27
- Python 3
- Unity 2022 LTS 이상

Plug-in은 Apple의 GitHub 저장소에서 내려받아 기존 Apple Unity plug-in과 같은 Python build script로 빌드할 수 있다.

### 왜 이 구성이 중요한가

Unity 게임 개발자는 Swift/Objective-C bridge를 직접 작성하지 않고도 C# 코드에서 Apple 네이티브 서비스에 접근할 수 있다.

게임 코드 관점에서는:

```text
Unity gameplay code
        ↓
Apple C# plug-in API
        ↓
Native StoreKit / Background Assets
        ↓
App Store / system service
```

구조가 된다.

---

## 🛒 StoreKit Unity plug-in: 상품 조회

StoreKit plug-in은 In-App Purchase의 일반적인 흐름을 C#으로 노출한다.

상품 조회의 기본 형태:

```csharp
using Apple.StoreKit;

var products = await Product.FetchProducts(new[] {
    "com.thecoast.capecod"
});
```

이 단계에서 얻은 `Product`를 게임 UI에 표시하고 구매 버튼과 연결한다.

StoreKit plug-in의 중요한 점은 Unity 전용 별도 commerce model을 만드는 것이 아니라 Apple 네이티브 StoreKit 개념을 C#으로 노출한다는 것이다.

---

## 💳 구매 실행과 transaction verification

상품 구매는 `Product.Purchase()`로 시작한다.

```csharp
var result = await product.Purchase();

if (result.Result == PurchaseResult.ResultEnum.Success &&
    result.TransactionVerification.IsVerified) {
    // purchased content unlock
    result.TransactionVerification.SafePayload.Finish();
}
```

핵심 순서는 다음과 같다.

1. 구매 요청
2. 시스템 payment sheet 표시
3. `PurchaseResult` 확인
4. 구매 성공 여부 확인
5. transaction verification 확인
6. 콘텐츠 제공
7. `Finish()` 호출

### 왜 `IsVerified`가 중요한가

구매 성공 상태만 보고 콘텐츠를 지급하지 않는다. 세션은 **transaction이 verified인지 확인한 뒤** 콘텐츠를 전달하도록 구성한다.

즉, entitlement 부여의 기준은 “결제가 성공했다는 UI 이벤트”가 아니라 “검증된 transaction”이다.

### `Finish()` 호출 위치

콘텐츠 지급 또는 entitlement 처리 이후 verified transaction에 `Finish()`를 호출한다. 처리 이전에 transaction을 끝내면 앱이 entitlement를 정상적으로 반영하지 못할 수 있다.

---

## 🔁 `Transaction.Updates`: 앱 밖에서 일어난 구매까지 추적

구매 흐름은 현재 앱 세션에서 직접 시작한 구매만으로 끝나지 않는다. 다른 기기나 앱 외부에서 transaction이 생성·갱신될 수 있으므로 게임 수명주기 전반에서 `Transaction.Updates`를 listening해야 한다.

공식 예제의 핵심 구조:

```csharp
Transaction.Updates += OnUpdate;
```

Handler에서는 먼저 verification을 확인한다.

```csharp
if (!result.IsVerified) return;
var transaction = result.SafePayload;
```

그 다음 product type에 따라 처리 방식이 달라진다.

---

## 🍎 Consumable과 entitlement 상품의 처리 차이

세션은 consumable과 non-consumable/subscription의 처리 모델을 분명히 나눈다.

### Consumable

Consumable은 `CurrentEntitlements`에 포함되지 않는다. 따라서 update로 들어온 transaction 자체를 처리해야 한다.

- revoked 여부 확인
- 문제가 없다면 consumable 지급
- 이후 `Finish()`

### Non-consumable / subscription

이 경우 세션은 **CurrentEntitlements를 source of truth로 다시 읽으라**고 설명한다.

`CurrentEntitlements`는 non-consumable과 subscription에 대해 refunded, revoked, expired 상태를 이미 필터링한 entitlement view를 제공한다.

따라서 update를 받았다고 그 transaction 하나만 보고 상태를 결정하지 않고, 전체 entitlement를 다시 계산한다.

개념적으로:

```text
Transaction update
      ↓
verified?
      ↓
consumable ────────→ transaction 기반 지급
      │
      └ non-consumable/subscription
                  ↓
          CurrentEntitlements 재조회
                  ↓
          현재 entitlement 재구성
```

이 구분은 복원, 환불, revoke, 만료가 가능한 상품에서 특히 중요하다.

---

## 🔗 구매와 Background Assets를 연결하는 방법

세션의 핵심 실전 패턴은 **StoreKit에서 entitlement가 확인된 뒤 Background Assets로 콘텐츠를 확보**하는 것이다.

예를 들어 사용자가 새로운 지역/챕터를 구매했다고 하자.

1. StoreKit 구매 시작
2. transaction verification
3. entitlement 부여
4. 해당 상품과 매핑된 asset pack 확인
5. 로컬에 없다면 다운로드
6. 다운로드 progress를 UI에 표시
7. local availability가 확보되면 콘텐츠 시작

즉, “구매 성공”과 “실제 바이너리 콘텐츠가 로컬에 존재함”을 별개의 상태로 관리한다.

---

## ⬇️ Background Assets Unity plug-in 사용 흐름

공식 예제에서는 먼저 manifest를 얻고, asset pack ID로 pack을 찾는다.

```csharp
AssetPackManifest manifest = await AssetPackManager.GetManifestAsync();
AssetPack assetPack = manifest.GetAssetPack(assetPackId);
```

그 다음 필요한 pack의 local availability를 보장한다.

```csharp
await AssetPackManager.EnsureLocalAvailabilityOfAssetPackAsync(assetPack);
```

필요한 다운로드가 있으면 시스템이 수행한다.

### 다운로드 progress

진행률은 async status sequence로 관찰한다.

```csharp
await foreach (var statusUpdate in
    AssetPackManager.DownloadStatusUpdatesAsync(assetPackId)) {
    // update game UI
}
```

공식 예제는 다운로드 status listener와 `EnsureLocalAvailabilityOfAssetPackAsync`를 함께 실행하고, 완료 후 listener용 cancellation token을 종료한다.

### 권장 상태 모델

게임 UI에서는 적어도 다음 상태를 분리하는 것이 좋다.

```text
Locked
Purchased / asset missing
Downloading
Ready
Download failed
```

세션이 직접 enum을 정의하지는 않지만, StoreKit entitlement와 Background Assets availability가 별개라는 구조에서 자연스럽게 필요한 상태다.

---

## 🧪 Xcode에서 StoreKit + Background Assets 함께 테스트

Unity 프로젝트에서 plug-in 구성을 완료한 뒤 Xcode 프로젝트로 export하면 Apple의 네이티브 테스트 도구를 그대로 사용할 수 있다.

### StoreKit Testing

1. StoreKit configuration file 생성
2. 테스트 상품 추가
3. Scheme 편집
4. Run 설정에서 StoreKit Configuration 선택

이렇게 하면 실제 App Store 구매 없이도 로컬 환경에서 상품/transaction 흐름을 테스트할 수 있다.

### Background Assets mock server

같은 Scheme 설정에서 packaged asset pack이 들어 있는 폴더를 지정한다. Xcode 27에서 실행하면 **Background Assets mock server가 자동으로 시작되어 debug session에 attach**하고 게임에 asset을 전달한다.

즉, 한 번의 로컬 실행에서 다음을 함께 검증할 수 있다.

- 상품 목록
- purchase sheet 흐름
- verified transaction 처리
- entitlement unlock
- asset pack 요청
- 실제 다운로드 진행률 UI
- local availability 이후 콘텐츠 로딩

### Sandbox Testing

App Store Connect에 설정한 상품의 실제 사용자 경험을 검증하기 위한 Sandbox Testing도 사용할 수 있다.

---

## 🏪 App Store와 Apple Games에서의 game presence

기술 구현이 끝난 뒤 Apple은 배포 화면의 시각적 표현도 함께 개선하라고 안내한다.

App Store product page header와 search results에 새로운 image/video assets를 추가할 수 있고, search results에 등록한 이미지와 비디오는 **Apple Games 앱에도 표시**된다.

즉, 하나의 시각 자산 구성이 App Store discovery와 Apple Games discovery 양쪽에 영향을 준다.

세션은 자세한 설정 방법을 WWDC26의 **Enhance your presence on the App Store** 세션으로 연결한다.

---

## 💳 iOS 27의 redesigned payment sheet

세션 마지막에는 iOS 27의 redesigned system payment sheet도 소개한다. 게임처럼 landscape가 중요한 앱에서도 자연스럽게 동작하도록 설계되어, 플레이어가 콘텐츠를 구매한 뒤 게임 흐름으로 돌아오기 쉽다.

앱에서 직접 payment UI를 복제하는 것이 아니라 StoreKit의 시스템 sheet를 사용하는 구조는 그대로 유지된다.

---

## 🧱 전체 아키텍처

이 세션의 내용을 게임 런타임 구조로 단순화하면 다음과 같다.

```text
App Store Connect
 ├─ IAP products
 └─ hosted asset packs
         │
         ▼
Unity game
 ├─ StoreKit plug-in
 │   ├─ Product.FetchProducts
 │   ├─ Product.Purchase
 │   ├─ Transaction.Updates
 │   └─ CurrentEntitlements
 │
 └─ Background Assets plug-in
     ├─ GetManifestAsync
     ├─ GetAssetPack
     ├─ EnsureLocalAvailability...
     └─ DownloadStatusUpdatesAsync
         │
         ▼
verified entitlement + locally available assets
         │
         ▼
      unlock gameplay
```

구매 시스템과 콘텐츠 다운로드 시스템은 독립적으로 설계되지만, 게임에서는 entitlement가 두 시스템을 연결하는 기준점이 된다.

---

## ⚠️ 구현 시 놓치기 쉬운 부분

### `Purchase()` 성공만으로 콘텐츠를 열지 않기

`TransactionVerification.IsVerified`를 먼저 확인한다.

### `Finish()`를 너무 일찍 호출하지 않기

구매 콘텐츠를 정상 반영한 뒤 transaction을 끝낸다.

### 앱 시작 시 `Transaction.Updates` listener 활성화

현재 세션에서 직접 발생하지 않은 transaction도 놓치지 않아야 한다.

### Non-consumable/subscription은 `CurrentEntitlements` 재조회

Update 하나를 source of truth로 사용하지 않는다.

### Consumable은 별도 처리

Consumable은 `CurrentEntitlements`에 들어오지 않는다.

### 구매 상태와 asset availability를 분리

Entitlement가 있어도 콘텐츠 pack이 아직 내려오지 않았을 수 있다.

### Localized asset pack fallback을 감안

정확한 locale pack이 없을 때 base language 또는 primary language가 사용될 수 있다.

### Unity 테스트를 네이티브 테스트 도구와 연결

Unity Editor 안에서만 확인하지 말고 Xcode export 후 StoreKit Testing과 Background Assets mock server를 함께 활용한다.

---

## 📋 적용 체크리스트

### Background Assets

- [ ] 큰 게임 자산을 asset pack 단위로 분리
- [ ] 처음부터 필요한 자산과 on-demand 자산 구분
- [ ] 언어별 대용량 자산을 localized asset pack으로 분리
- [ ] manifest의 `language` tag 설정
- [ ] locale fallback 결과 검증
- [ ] App Store Connect에 asset pack 업로드
- [ ] Steam depot 사용 중이라면 `ba-package convert` 검토
- [ ] manifest → `.aar` archive 생성 파이프라인 자동화

### Unity StoreKit

- [ ] StoreKit Unity plug-in 설치
- [ ] `Product.FetchProducts`로 상품 조회
- [ ] `Product.Purchase()` 결과 확인
- [ ] transaction verification 확인
- [ ] verified transaction에서만 entitlement 부여
- [ ] 처리가 끝난 뒤 `Finish()` 호출
- [ ] 앱 시작 시 `Transaction.Updates` listener 설정
- [ ] Consumable과 entitlement 상품 로직 분리
- [ ] Non-consumable/subscription은 `CurrentEntitlements` 재조회

### 구매 후 콘텐츠

- [ ] product ↔ asset pack 매핑 정의
- [ ] 구매 확인 후 `GetManifestAsync()` 호출
- [ ] pack의 local availability 확인
- [ ] 필요 시 `EnsureLocalAvailabilityOfAssetPackAsync` 실행
- [ ] `DownloadStatusUpdatesAsync`를 UI와 연결
- [ ] 다운로드 실패/취소 상태 처리
- [ ] Ready 상태에서만 실제 게임 콘텐츠 진입

### Testing

- [ ] StoreKit configuration file 작성
- [ ] Scheme의 StoreKit Configuration 연결
- [ ] packaged asset pack 폴더를 mock server에 지정
- [ ] Xcode 27에서 debug 실행
- [ ] 구매 → entitlement → 다운로드 → unlock 전체 플로우 테스트
- [ ] App Store Connect Sandbox에서도 검증

### Distribution

- [ ] Product page header용 visual asset 준비
- [ ] Search results image/video 준비
- [ ] Apple Games 앱에서의 노출도 함께 검토
- [ ] iOS 27 landscape payment sheet UX 확인

---

## 🧠 핵심 메시지

이 세션의 핵심은 단순히 Unity용 StoreKit wrapper가 추가됐다는 것이 아니다. Apple은 **구매, entitlement, 대용량 콘텐츠 전달, 테스트, 스토어 노출을 하나의 게임 운영 파이프라인으로 연결**하고 있다.

가장 중요한 설계 원칙은 다음 세 가지다.

1. **구매와 entitlement를 분리해서 검증한다.**
2. **Entitlement와 asset availability도 분리해서 관리한다.**
3. **게임이 실제로 필요한 자산만, 필요한 언어로, 필요한 시점에 내려받는다.**

이 구조를 따르면 Unity 게임에서도 Apple 네이티브 StoreKit과 Background Assets의 장점을 유지하면서 초기 다운로드 크기와 저장 공간을 줄이고, 구매 콘텐츠의 전달 신뢰성을 높일 수 있다.

---

## 🔗 함께 보면 좋은 세션과 자료

- [WWDC26 — Unlock in-game content with StoreKit and Background Assets](https://developer.apple.com/videos/play/wwdc2026/378/)
- WWDC25 — Discover Apple-Hosted Background Assets
- Meet with Apple — Chart your game's course to Apple platforms
- WWDC22 — Plug-in and play: Add Apple frameworks to your Unity game projects
- WWDC26 — Enhance your presence on the App Store
- Apple Unity Plug-Ins on GitHub
- Apple Developer Documentation — Background Assets
- Apple Developer Documentation — StoreKit
