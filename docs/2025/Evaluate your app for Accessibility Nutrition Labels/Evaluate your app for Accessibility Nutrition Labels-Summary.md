# Evaluate your app for Accessibility Nutrition Labels

Evaluate your app for Accessibility Nutrition Labels https://developer.apple.com/videos/play/wwdc2025/224/



## ✨ 개요


App Store 제품 페이지에 Accessibility Nutrition Labels( 접근성 라벨 ) 을 추가하는 절차와 평가 기 준을 소개합니다 . 핵심은 앱의 ‘ 공통 작업 (common tasks)ʼ 을 정의하고 , 각 접근성 기능 ( 콘트라스트 , 다

크 인터페이스 , 큰 글자 , 색상에만 의존하지 않기 , 감쇠된 동작 , Voice Control, VoiceOver, 캡션 , 화면 해 설 ) 을 그 작업들로 실제 테스트해 “ 지원 / 비지원 / 비해당 ” 을 정확히 표기하는 것입니다 .

🧭 평가 흐름

- 공통 작업 정의: 첫 실행 / 로그인 / 구매 / 설정 등 핵심 플로우 나열 .

- 기능별 테스트 계획: 각 기능 × 각 공통 작업 매트릭스로 전 기기 (iPhone/iPad/Mac/Watch 등 ) 에서 점검 .

- 정확 표기 원칙: 기능이 실제 사용 흐름 전반에서 충족될 때만 “ 지원 ” 으로 표기 , 비해당이면 표시하지 않음 .

- 🎨 디자인 · 테스트 기본기

- 고대비 / 색상: 기본 · 다크 모드 모두에서 최소 대비 확보 , Increase Contrast 켜서도 점검 . 색상만으 로 의미 전달 금지 ( 아이콘 / 텍스트 병행 ).

- 큰 글자: 200% 이상 ( 가능하면 310%) 크기까지 레이아웃 깨짐 · 잘림 없이 확대 (Dynamic Type 권장 ).

- 모션: Reduce Motion 켠 상태에서 현기증 유발 애니메이션 ( 자동 재생 · 줌 / 패럴랙스 등 ) 제거 / 완화 .

- 🗣 보조 기술 지원

- Voice Control: 모든 터치 가능한 요소가 레이블 · 역할을 제공해 음성만으로 공통 작업 완료 가능해 야 함 .

- VoiceOver: 포커스 이동 시 이름 · 역할 · 값이 정확히 읽히고 , 제스처 / 키보드 명령만으로 작업 완료 가 능 . 실제 사용자 테스트를 권장 .

- 🎬 미디어 접근성

- Captions( 자막 ): 앱에 영상 / 오디오가 있다면 자막을 켜고 끌 수 있어야 함 .

- Audio Descriptions( 화면 해설 ): 시각 정보가 중요한 영상에 대해 탐색 · 설정이 가능해야 함 .

- 비해당의 정직성: 미디어가 없다면 두 항목은 표시하지 않음.



## ✅ 기능별 체크 예시


- Sufficient Contrast: 라이트 / 다크 ·Increase Contrast 에서 텍스트 / 아이콘 가독성 합격 .

- Dark Interface: 다크 모드 + Smart Invert 점검 ( 미디어 색 반전 금지 ).

- Larger Text: 200%+ 에서 필드 / 라벨 줄바꿈 · 높이 증가로 정보 손실 없음 .

- Differentiate Without Color Alone: 색 외의 아이콘 / 텍스트로 상태 전달 .

- Reduced Motion: 트리거 애니메이션 제거 · 완화 완료 .

- Voice Control / VoiceOver: 터치 없이 전 공통 작업 수행 가능 .

- Captions / Audio Descriptions: 관련 미디어가 있을 때만 지원 표기 .

- 🧾 App Store Connect 제출 평가를 마치면 ASC 의 제품 페이지에서 지원 기능을 선택하고 ( 필요 시 접근성 웹페이지 링크 추가 ) 공개합 니다 . 라벨은 표준화된 평가 기준에 따라 일관된 사용자 기대를 형성합니다 .
