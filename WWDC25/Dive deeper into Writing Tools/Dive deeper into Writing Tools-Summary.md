# Dive deeper into Writing Tools

Dive deeper into Writing Tools https://developer.apple.com/videos/play/wwdc2025/265/



## ✨ 개요


Writing Tools 의 올해 업데이트를 한데 모은 심화 세션 . ChatGPT 연동, visionOS 지원, Shortcuts 자 동화, Follow-up 수정 요청 등 사용자 경험 확대와 함께 , 리치 텍스트 · 프레젠테이션 인텐트·커스텀 텍스트

엔진용 코디네이터 API까지 실전 통합법을 다룹니다 .

🆕 핵심 업데이트

- ChatGPT & 이미지 생성: 텍스트 생성 · 요약 · 재작성과 이미지 생성까지 도구 내부에서 호출 .

- Follow-up: 재작성 후 “ 더 따뜻하게 / 대화체로 ” 같은 후속 지시를 추가 .

- Shortcuts 지원 확대: Proofread/Rewrite/Summarize 를 자동화 액션으로 사용 .

- visionOS 전면 지원 .

- 🧭 네이티브 텍스트 뷰 통합 팁

- 툴바 버튼 추가 권장 ( 텍스트 중심 앱 ): UIBarButtonItem/NSToolbarItem.

- 메뉴 항목 자동 삽입: 커스텀 구성 시 automaticallyInsertsWritingToolsItems = false 후 writingToolsItems 사용 .

- Result Options로 동작 범위 제어 ( 작년의 Allowed Input Options → 용어 변경).

- 📝 결과 옵션 & 서식 (Plain/Rich/Presentation Intent)

- plainText: 평문 편집기 —NSAttributedString으로 오가지만 스타일 무시 가능 .

- richText(+lists/tables): 굵게 / 기울임 등 디스플레이 속성 중심 .

- presentationIntent: 제목 / 리스트 / 코드블럭 등 의미 기반 서식을 NSAttributedString의 프레젠 테이션 인텐트로 전달 (Notes 처럼 의미 스타일을 쓰는 앱에 적합 ). 일부 스타일은 여전히 디스플레이 속성 병행 .

- ⚙ 커스텀 텍스트 엔진 : 코디네이터 도입

- 기본 지원 ( 무료 ): 공통 편집 프로토콜을 채택하면 패널 기반 Writing Tools 사용 가능 (iOS UITextInteraction 등 , macOS NSServicesMenuRequestor).

- 풀 경험: UI/NSWritingToolsCoordinator + 델리게이트로 인라인 재작성 , 애니메이션 , 교정 밑줄 제공 .

- 컨텍스트 제공: 선택 범위와 전 / 후 문단을 포함한 NSAttributedString.

- 치환 적용: 제안된 변경을 스토리지에 반영 , 필요 시 선택 범위 갱신 .

- 애니메이션 프리뷰: iOS UITargetedPreview, macOS NSTextPreview( 라인 단위 가능 ).

- 교정 표시: 밑줄 / 클릭 반응을 위한 Bezier Path와 바운딩 제공 .

- 상태 변화 대응: 작업 전후 준비 / 정리 , 외부 변화는 updateRange…/updateForReflowedText 로 동기화 .



## ✅ 실무 체크리스트


- 텍스트 중심 화면에 툴바 버튼 배치 , 메뉴는 표준 항목 API 재사용

- 에디터 성격에 맞게 plain / rich / presentationIntent 결정

- Shortcuts로 교정 / 요약 플로우 자동화 , Follow-up 프롬프트 설계

- 커스텀 엔진은 코디네이터 도입 → 컨텍스트 / 치환 / 프리뷰 / 교정 경로 구현

- 레이아웃 변화 · 외부 편집 시 updateRange / updateForReflowedText 호출로 동기화 유지
