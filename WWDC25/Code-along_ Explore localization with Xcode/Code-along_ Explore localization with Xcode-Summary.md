# Code-along_ Explore localization with Xcode

- Code-along: Explore localization with Xcode https://developer.apple.com/videos/play/wwdc2025/225/ 🧱 1. String Catalog 로 쉽게 시작하기 🛠 SwiftUI 의 Text, Button은 자동으로 지역화 가능 !



## 💬 String(localized:) 사용 시 코드 내 문자열도 지역화 가능 .


📁 String Catalog 생성하면 Xcode 가 문자열을 자동으로 추출 & 관리 .

🔢 복수형 처리도 쉬움 → "1 item" vs "2 items" 는 "Vary by Plural" 로 설정 .

🤝 2. 번역자와 협업하는 워크플로우 ➕ 프로젝트에 새로운 언어 추가는 버튼 클릭 한 번으로 !

🟢 번역 상태를 시각적으로 확인 가능 ( 예 : NEW → TRANSLATED).

📤 XLIFF 파일로 Export → 전문 번역가에게 전달 가능.

📥 번역 완료된 파일은 다시 Import 하면 자동 반영됨 .

💡 3. 번역 품질을 위한 ' 문맥 ' 제공 🧠 번역자는 UI 나 코드를 보지 못할 수 있음 → 좋은 주석 (Comment) 이 중요 !

🧾 예 : “Landmarks” 가 앱 이름인지 , 지도상의 지형인지 ?

🤖 Xcode 26 은 자동으로 주석 생성 가능 ! (Generate Comment)

  - 예 : " 삭제 취소 버튼의 라벨 " ➝ 번역자가 정확히 이해 가능 !

  - ✍ 자동 주석은 직접 수정도 가능하며 , 상세한 설명을 추가할 수 있음 .

  - 🧱 4. 대형 프로젝트를 위한 구조화



## 📦 여러 프레임워크 또는 Swift Package → Bundle 지정 필수


Bundle.main, #bundle로 구체적인 위치 지정 가능 .

📂 Table 단위로 문자열 그룹화: "Localizable", "Discover", 등

- table: 파라미터로 분리된 Catalog 에 문자열 저장 .



## ✨ 5. 기호 (Symbol) 기반 워크플로우


- 🪄 String Catalog 에 수동으로 추가한 문자열 → Xcode 가 자동으로 타입세이프 기호 생성

- 예 : .Discover.TITLE 또는 .SUBTITLE(friendsPosts: 3, curatedPosts: 2) ⚙ 코드 자동완성 + 오타 방지 + 유지보수에 탁월 !



## ✅ Xcode 26 부터 기본 활성화됨, 기존 프로젝트는 Build Setting 에서 켜기 가능 .


🔄 6. 두 가지 워크플로우 자유롭게 전환 방식 장점 ✍ 문자열 추출 기반 빠르고 직관적 , Xcode 가 주석 자동 생성 🧾 기호 기반 참조 코드에서 분리된 문자열 관리 , 유지보수와 오타 방지에 좋음



## 🧪 Refactor > Convert Strings to Symbols로 간편 전환 가능 !


🔍 Preview UI 로 변경 전후 코드 비교도 가능함 .

🏁 결론 & 추천 워크플로우 🚀 초기에는 문자열 추출 방식으로 빠르게 시작하세요 .



## 🧩 프로젝트가 커지면 기호 기반 관리로 전환하여 유지보수를 효율적으로 !


🧠 자동 주석 , 자동 기호 생성 기능을 적극 활용하세요 !

📚 추가 정보는 [Discover String Catalogs] 세션에서 확인 가능 .
