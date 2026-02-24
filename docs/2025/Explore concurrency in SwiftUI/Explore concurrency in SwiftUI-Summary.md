# Explore concurrency in SwiftUI

Explore concurrency in SwiftUI https://developer.apple.com/videos/play/wwdc2025/266/



## ✨ 개요


SwiftUI 가 @MainActor 기본 격리와 선택적 백그라운드 실행을 통해 UI 를 부드럽게 유지하면서 데이터 레이스를 사전에 차단하는 방법을 투어 형식으로 정리합니다 . 핵심은 UI 코드는 동기 (synchronous) 로 ,

무거운 연산만 비동기 / 백그라운드로 분리하는 것 .

🧭 큰 그림

- Main Actor 가 기본값: View/UIViewRepresentable 등은 암묵적으로 @MainActor 격리 → 대부 분의 UI 코드는 별도 표기 없이 안전 .

- SwiftUI 가 “ 필요 시 ” 백그라운드에서 호출: 프레임마다 비싼 계산은 메인에서 떼어냄 ( 애니메이션 중간값 · 지오메트리 등 ).

- 주요 목표: 프레임 드롭 방지 ( 응답성 ) + 데이터 레이스 방지 ( 정합성 ).



## 🧪 백그라운드에서 불릴 수 있는 API (Sendable 필요 )


Shape.path(in:), visualEffect 클로저, Layout의 요구 메서드, onGeometryChange 첫 번째 인 자 클로저는 백그라운드에서 호출될 수 있음 → Sendable 제약을 준수해야 안전 .

🧷 안전 패턴 ( 데이터 레이스 회피 )

- 참조 대신 값 복사: @MainActor 격리된 뷰의 상태 (self.pulse) 를 Sendable 클로저에서 쓰고 싶다

- 면 캡처 리스트로 값 타입 복사(let pulse = self.pulse) 후 사용 .

- 공급형 인자 활용: SwiftUI 가 클로저 인자로 넘겨주는 값들로 계산을 끝내고 외부 상태 접근 최소화.

- 모두 nonisolated 로 만들기( 대안 ): 읽을 값들을 액터 격리 밖으로 빼서 동시 접근 가능하게 설계 .

- ⏱ UI 업데이트는 “ 동기 ”, 비동기는 경계 밖으로 왜 Button 이 async 가 아닌가 ? 사용자 입력 직후 동기 상태 변경( 예 : withAnimation {

- isLoading = true }) 이 같은 프레임에 반영되어야 랙이 없음 .

- await는 서스펜션 포인트: 제때 재개되지 않으면 애니메이션 타이밍이 어긋날 수 있음 → 동기 콜백 에서 UI 상태 전환, 비동기 작업은 Task { ... }로 분리.



## 🧩 구조화 요령


- 경계 나누기: 뷰 ( 동기 , 시간 민감 ) ↔ 모델 / 서비스 ( 비동기 , 오래 걸림 ). 상태를 브리지로 사용해 “ 완료 시 동기 mutation” 만 전달 .

- 테스트 용이성 ↑: UI 와 분리된 비동기 로직은 SwiftUI 없이도 단위 테스트 가능 .

- 🛠 실전 체크리스트 UI 이벤트 직후 동기 상태 변경 ( 로딩 / 애니메이션 트리거 ) → 그 다음 Task { await … } 백그라운드 가능 API(Shape/visualEffect/Layout/onGeometryChange) 엔 Sendable 준수 Sendable 클로저에서 뷰 상태 복사 캡처로 참조 제거 값 타입 우선 전달 , 참조 타입 공유 최소화 무거운 계산 / 디코딩은 메인 밖에서 수행 , 결과만 동기 반영 Swift 6.2 의 모듈 @MainActor 기본 모드 시도 → 불필요한 주석 제거

- Mutex 등 동기화 도구로 Sendable 클래스를 안전하게 만들기 검토 비동기 로직 UI 와 분리해 독립 테스트 구축
