# Finish tasks in the background

Finish tasks in the background https://developer.apple.com/videos/play/wwdc2025/227/



## ✨ 개요


iOS/iPadOS 26 의 백그라운드 실행 철학과 도구를 정리합니다 . 핵심은 배터리 · 성능 보호를 우선하며 , 일을 짧고 명확한 태스크로 설계하고 , 진행 저장 · 만료 대응 등 회복력을 갖추는 것 . 올해 신기능

BGContinuedProcessingTask 로 “ 사용자 시작 작업 ” 을 앱이 백그라운드로 내려가도 시스템 UI 와 함께 진 행 · 취소 · 완료까지 매끄럽게 이어갈 수 있습니다 .

🧭 백그라운드 설계 원칙 (5) Efficient / Minimal / Resilient / Courteous / Adaptive.

효율 · 경량: 충전 중으로 미뤄도 되는 일은 지연, 필요 시에도 짧게 수행 . 배터리 탭에 영향이 드러납니 다 .

- 회복력: 기회가 짧으니 자주 저장하고 만료 신호에 즉시 반응 .

- 예의: 저전력 모드 · 데이터 절약 · 백그라운드 새로고침 등 사용자 설정을 존중.

- 적응성: 네트워크 / 열 / 배터리 / 부하 등 상황에 맞춰 요구 조건을 낮추고 배치 처리 선호 .



## 🧰 기존 배경 실행 도구 모음


- BGAppRefreshTask: 사용 패턴에 맞춰 직전 시점에 콘텐츠 프리페치. SwiftUI 의 backgroundTask 로 등록 .

- 백그라운드 푸시: 서버가 “ 새 콘텐츠 ” 도착을 알려 주면 기회가 올 때 기상해 동기화 ( 항상 discretionary, 앱 강제 종료 시 전달 안 됨 ).

- BGProcessingTask: ML·DB 유지보수 등 무거운 처리. “ 충전 + 네트워크에서만 ” 등 조건 설정 권장 .

- 앱 런치 직후 등록 필수.

- beginBackgroundTask / endBackgroundTask: 포그라운드 종료 직전 필수 정리 ( 저장 / 핸들 닫기 ) 를 잠깐 더 수행 .

- ▶ BGContinuedProcessingTask( 신규 ) — 사용자 시작 작업 이어 달 리기

- 용도: 내보내기 / 업로드 / 액세서리 업데이트처럼 사용자가 버튼으로 시작한 작업을 , 앱이 백그라운드여 도 시스템 UI가 진행률 · 취소를 제공하며 계속 . 저널 앱 사례처럼 완료 후 자동 닫힘.

- 식별자: Info.plist 에 고정 ID 또는 와일드카드 (com.app.task.*) 등록 → 런타임에 동적 접미사 사 용 가능 . 핸들러는 동적으로 등록( 앱 런치 직후가 아님 ).

- 진행 보고: Progress Reporting으로 주기적 업데이트 — 없으면 만료 처리. 만료 핸들러로 그레이 스풀 중단 구현 , 완료 시 setTaskCompleted 호출 필수 .

- 제출 전략: 기본은 큐 대기. “ 지금 당장 시작 못 하면 실패 ” 전략으로 즉시성 보장도 가능 .

- 리소스 요구: Xcode 에서 Background GPU 권한 추가 가능 ( 지원 기기 ). 런타임에 supportedResources 조회해 가용성 확인 — 불가 리소스 요청은 제출 거부. 포그라운드 복귀 시 우선 순위 자동 부스트.

  - 주의: 자동 시작 ( 백업 · 동기화 등 ) 은 부적합 —명시적 사용자 행위가 있어야 함 .

- 🧱 작업 모델링 체크리스트 누가 시작했는가 ? → 사용자라면 BGContinuedProcessingTask, 시스템 주기라면

  - Refresh/Processing.

  - 얼마나 오래 걸리는가 ? → 짧음 / 중간 / 김으로 분류해 적절한 API 선택 .

  - 가치 대비 배터리 비용은 ? → 프리패치 ↑, 텔레메트리 ↓ 우선순위 . 충전 중 지연 가능한가 ?

  - 중단에 안전한가 ? → 원자적 단계로 쪼개고 부분 저장·재시도 설계 .



## ✅ 구현 스텝 ( 요약 )


- Info.plist: Permitted background task scheduler identifiers에 ID( 또는 와일드카드 ) 추 가 .

- 등록: 사용자가 액션을 시작할 때 런처 핸들러 동적 등록. 만료 핸들러 준비 .

- 제출: 로컬라이즈된 제목 / 부제와 제출 전략을 담아 요청 생성 → 스케줄러에 제출 .

- 진행률: Progress Reporting으로 주기 업데이트 , 완료 시 setTaskCompleted.

- 리소스: 필요 시 Background GPU 권한 추가 , supportedResources 확인 후 조건부 사용 .



## 🧪 베스트 프랙티스


작업은 작고 독립적으로 —배치와 재개 가능 설계.

조건 명시( 충전 / 네트워크 필요 등 ) 로 스케줄러 힌트 제공 .

- 사용자 투명성: 진행 · 취소를 시스템 UI에 맡기고 , 앱 내 로컬 로그 / 알림은 중복 최소화.
