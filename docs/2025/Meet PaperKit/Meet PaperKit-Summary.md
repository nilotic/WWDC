# Meet PaperKit

Meet PaperKit https://developer.apple.com/videos/play/wwdc2025/285/



## ✨ 개요


PaperKit 은 Notes, 스크린샷 , Quick Look, Journal에 들어간 그 마크업 경험을 서드파티 앱에서도 그 대로 쓸 수 있게 해주는 프레임워크입니다 .

그리기 (PencilKit) + 도형 · 텍스트 · 이미지 같은 마크업 요소를 한 캔버스에서 동시에 다루는 게 핵심이고 , iOS / iPadOS / visionOS 26 에 이어 macOS Tahoe에서도 동일한 경험을 제공합니다 .

🧱 PaperKit 구성요소 3 가지

- PaperMarkupViewController ( 마크업 컨트롤러 ) 실제 그리기 · 마크업을 보여주고 편집하는 뷰 컨트롤러 .

- 제스처 , 선택 , 편집 등 인터랙션을 담당 .

- PaperMarkup ( 데이터 모델 컨테이너 ) PencilKit 드로잉 + PaperKit 마크업 요소를 모두 담는 모델 .

- 저장 / 로딩 , 썸네일 렌더링까지 맡아서 , 파일 포맷을 직접 신경 안 써도 됨 .

- 삽입 UI (MarkupEditViewController / MarkupToolbarViewController)

- iOS / iPadOS / visionOS: MarkupEditViewController ( 팝오버 삽입 메뉴 ).

- macOS: MarkupToolbarViewController ( 툴바 기반 삽입 + 그리기 도구 ).

- 🛠 iOS·iPadOS·visionOS 통합 흐름

- 뷰 컨트롤러에서 마크업 준비 viewDidLoad에서 PaperMarkup 모델 생성 → 뷰 bounds 기준 렌더 컨텍스트 설정.

- 전체 기능을 쓰고 싶으면 FeatureSet.latest 로 구성한 feature set 사용 .

- PaperMarkupViewController 임베드 일반적인 child view controller 패턴으로 서브뷰에 추가 .

- PencilKit Tool Picker 연결 PencilKit tool picker 생성 후 , markup 컨트롤러를 observer로 등록 .

UIResponder의 새 속성인 activeToolPicker 에 tool picker 를 지정하면 , 어느 responder 가 현재 “ 도구 선택 UI” 를 쓸지 제어할 수 있고 ,

- toolPickerVisibility 로 화면에 보이진 않지만 제스처 ( 더블탭 , squeeze) 에는 반 응하는 mini picker 지원 .

- 삽입 메뉴 버튼 추가 tool picker accessory 아이템 ( 버튼 ) 을 하나 추가 → 탭 시 삽입 메뉴 표시 .

콜백에서 MarkupEditViewController 생성 ( 같은 FeatureSet 공유 ),

- delegate 를 markup VC 로 지정하고 , bar button item 에 anchored 팝오버로 띄운 뒤 모 달로 present.

- 🖥 macOS 통합 흐름 PaperMarkup 모델 + PaperMarkupViewController 설정 방식은 iOS 와 거의 동일.

- 삽입 UI 는 팝오버 대신 MarkupToolbarViewController 를 만들고 delegate 를 markup 컨트롤러로 지정 , 일반적인 NSViewController 임베딩으로 툴바를 붙이면 끝 .



## 🧩 SwiftUI 와 함께 쓰기


PaperKit 구성요소 (UIKit 기반 VC) 를 UIViewControllerRepresentable 로 감싼 다음 , SwiftUI body 안에 넣으면 SwiftUI 레이아웃에서도 동일한 마크업 경험을 사용할 수 있습니다 .

💾 저장 · 버전 호환 & 썸네일 전략 디스크에서 PaperMarkup 데이터를 다시 열 때는 content version 을 반드시 확인해야 합니다 .

- 버전이 안 맞는 경우 두 가지 패턴 :

- “ 업데이트 필요 ” 알럿을 띄우고 편집 불가 처리 .

- 미리 렌더해 둔 썸네일 이미지를 보여주기(Notes 가 쓰는 방식 ).

- 썸네일 생성 절차 :

- 썸네일 크기의 CGContext 생성 .

- PaperMarkup 모델의 draw API 로 그 안에 렌더 .

- 결과 이미지를 원본 markup 데이터와 함께 저장 → 버전 mismatch 시 이 이미지를 표시 .

- 🎨 FeatureSet·HDR· 도구 커스터마이즈 FeatureSet

- PaperKit 의 모든 기능 집합 = FeatureSet.latest.

- 여기서 remove / insert 로 특정 도형 / 텍스트 / 이미지 도구 제거 , 필요 도구만 남기는 식으로 도구 · 상호작용을 제한 / 추가할 수 있음 .

- HDR 잉크 지원 colorMaximumLinearExposure 를 1 보다 크게 설정하면 HDR 마크업 활성화 .

- SDR: 1

- HDR: 예시로 4 정도를 사용 ( 디자이너가 원하는 느낌에 맞춰 조정 ).

- 동일 값을 tool picker 쪽에도 설정해야 HDR 잉크가 일관되게 보입니다 .

이 값은 디스플레이의 HDR headroom 에 맞춰 톤매핑되며 ,

- UIScreen / NSScreen 에서 지원 값을 그대로 가져다 써도 됨 .

- 새 도구 : Reed ( 캘리그래피 펜 ) PencilKit 쪽에서 추가된 Reed 도구도 FeatureSet.latest + HDR 설정으로 자동 사용 가능 .

- 배경 커스터마이즈 (contentView) PaperMarkupViewController 의 contentView 를 아무 UIView 로나 교체 가능 .

  - 예 : 레시피 템플릿 이미지를 contentView 에 깔고 , 그 위에 마크업과 드로잉을 렌더 .



## ✅ 실무용 체크리스트


- iOS/ 아이패드용 마크업 캔버스는 PaperMarkup + PaperMarkupViewController 구조로 구

- 성

- PencilKit Tool Picker 를 activeToolPicker 로 연결하고 mini picker 제스처까지 켜기

- 삽입 메뉴 ( 또는 macOS 툴바 ) 는 MarkupEditViewController /

- MarkupToolbarViewController 로 구현

- FeatureSet.latest 를 기준으로 도구 · 기능을 커스터마이즈하고 , 동일 FeatureSet 을

- markup·insertion 양쪽에 사용

- HDR 이 필요하면 colorMaximumLinearExposure 를 화면 특성에 맞춰 설정 + tool picker 에도 동

- 일 값 적용

- PaperMarkup 저장 시 버전 필드 + 썸네일 이미지를 함께 저장해서 , 버전 mismatch 시 썸네일

- fallback 제공

- SwiftUI 화면에서는 UIViewControllerRepresentable 래퍼로 PaperKit 경험을 그대로 가져오기
