# Code-along_ Cook up a rich text experience in SwiftUI with AttributedString

- Code-along: Cook up a rich text experience in SwiftUI with AttributedString https://developer.apple.com/videos/play/wwdc2025/280/



## ✨ 1. TextEditor → AttributedString 지원


TextEditor는 이제 AttributedString 지원 → 다양한 서식 가능 볼드 , 이탤릭 , 색상 , 밑줄 , 취소선 , 폰트 크기 Genmoji, 다크모드, Dynamic Type

문단 정렬 , 줄 간격 , 작성 방향 등도 지원 기존의 Text와 속성 호환 → 편집 후 바로 Text로 표시 가능 🧠 2. AttributedString 기본 개념

- AttributedString = 텍스트 + 속성 runs 값 타입 , UTF-8 저장 , Codable/Hashable 등 지원 커스텀 속성 정의 가능 (IngredientAttribute 등 ) RangeSet으로 여러 구간 선택 가능 → 다국어 · 양방향 텍스트 대응 🍽 3. 선택된 단어를 재료로 등록 TextEditor의 selection 속성 사용 → 선택된 텍스트 추출 "butter" 같은 단어를 클릭 후 버튼 누르면 재료 리스트에 자동 등록 SwiftUI 의 PreferenceKey를 사용하여 상위 뷰로 값 전달



## 🧩 4. 커서가 갑자기 이동하는 문제 해결


- AttributedString은 트리 구조 기반 → 수정 시 인덱스 무효화됨



## ✅ 해결 : transform(updating:) API 사용해 selection 도 안전하게 갱신


🧑‍🍳 5. 커스텀 속성 추가 (IngredientAttribute) 특정 단어에 ID 기반의 커스텀 속성 부여 텍스트 내에서 해당 단어 강조 → 나중에 시각적으로 식별 가능 🎨 6. 포맷팅 제어 : AttributedTextFormattingDefinition

편집기에서 허용할 속성과 값 제어

  - 예 : foreground color, Genmoji, IngredientAttribute 만 허용

- UI 에도 영향 :

- 나머지 속성은 숨김 처리됨 (ex. 정렬 , 줄간격 등 ) 시스템 색상 선택기도 제한됨



## ✅ 7. 속성 값 제한 : AttributedTextValueConstraint


- 예 : 재료에만 초록색 허용 , 나머지는 기본 색상 붙여넣기 , 드래그 앤 드롭 시에도 속성 일관성 유지

- 복사한 재료 붙여넣기 → 속성 유지됨 (CodableAttribute 지원 ) 🧱 8. 속성 무효화 및 확장 방지

- inheritedByAddedText = false → 입력 시 속성 확장 방지

- invalidationConditions = [.textChanged] → 텍스트 변경 시 전체 속성 제거

- 예 : “milk” 에 "y" 추가 → "y" 는 초록색이 아님 , 삭제 시 전체 속성 제거됨 🧭 9. 추가 속성 동작 제약

- 문단 정렬 같은 속성은 단어 단위로 나뉘지 않도록 runBoundaries = .paragraph 설정 가능 변경 시 자동으로 문단 전체에 적용됨



## 📦 10. 추가 리소스 & 팁


- 샘플 프로젝트 다운로드 가능 SwiftUI 의 Transferable, SwiftData, RTFD Export 활용 AttributedString은 Swift 오픈소스 Foundation 의 일부 → GitHub/Swift Forums 통해 참여 가능 🎉 결론

- SwiftUI 의 새로운 TextEditor + AttributedString 조합은 :

- 강력한 텍스트 편집 기능 정교한 UI 제약 및 시각 표현

  - 커스터마이징 가능성을 갖춘 완성도 높은 편집기 개발을 가능하게 합니다 .
