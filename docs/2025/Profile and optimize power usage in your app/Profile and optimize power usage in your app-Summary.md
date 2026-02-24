# Profile and optimize power usage in your app

Profile and optimize power usage in your app https://developer.apple.com/videos/play/wwdc2025/226/



## ✨ 개요


앱의 배터리 소모 ( 전력 사용 ) 를 정량적으로 측정하고 , 원인을 찾아 고치는 방법을 다루는 세션 핵심 도구는 Instruments 의 Power Profiler 책상에서 재현 가능한 이슈뿐 아니라 , 현장 ( 야외 / 이동 / 장시간 백그라운드 ) 에서만 나타나는 이슈도 온

디바이스 트레이스로 수집 · 분석 가능



## 🧰 Power Profiler 가 제공하는 것


시스템 레벨 전력 사용량 + 앱별 (power impact) 전력 지표를 타임라인으로 기록 전력 영향 (power impact) 을 서브시스템별로 분해 CPU / GPU / Display / Networking 등

“어떤 서브시스템이 문제인지 ” 를 먼저 좁힌 뒤 , Time Profiler/CPU Profiler 로 원인 함수까지 추적 하는 흐름



## 🧪 데스크에서 재현 가능한 문제 해결 흐름


- Xcode 에서 Profile 로 Instruments 실행 디바이스 ( 유선 / 무선 ) 연결 후 Product > Profile 템플릿에서 Power Profiler CPU Profiler( 또는 Time Profiler) 를 함께 추가해 원인 추적까지 한 번에 수행

- Power Profiler 트랙 읽기

- System Power Usage: 전체 에너지 소비 수준 ( 높을수록 전력 사용 가능성 증가 ) 앱별 CPU Power Impact 등 지표에서 스파이크 구간 선택 Summary 에서 평균값 비교로 “ 회귀 (regression)” 를 숫자로 확인 🧱 사례 1: SwiftUI 에서 ‘ 한 번에 너무 많은 작업 ʼ 문제 Library 화면에서 VStack로 비디오 목록을 구성 수백 ~ 수천 아이템이라면 화면이 열리는 순간 모든 썸네일 생성 모든 아이템 View 생성

- 을 한꺼번에 수행 → CPU power impact 급증 + UI hang 해결 VStack → **LazyVStack** 로 변경 화면에 보이는 ( 또는 곧 보일 ) 아이템만 생성 / 렌더링 결과 ( 측정으로 검증 ) CPU power impact 평균이 21 → 4.3 수준으로 감소 Library 오픈 시 hang 해소 🧭 “ 현장에서만 ” 터지는 문제 : 온디바이스 Power Profiling 개발 환경에서 재현이 어려운 케이스 예시 이동 중 (CarPlay/ 통근 ) 위치 변화로만 발생

- 야외 AR 장시간 백그라운드 배터리 소모 해결은 “ 재현 ” 이 아니라 현장 데이터 수집으로 접근 수집 방법 ( 개발자 모드 ) Settings > Developer > Performance Trace 활성화 Power Profiler 토글 ON 프로파일링할 앱 선택 ( Xcode 설치 / TestFlight / Enterprise 설치 앱만 대상 ) Control Center 의 Performance Trace 버튼으로 기록 시작 / 종료 생성된 trace 파일을 공유받아 Mac 의 Instruments 에서 그대로 분석

- 📍 사례 2: 위치 변화에 의해 주기적으로 반복되는 CPU 스파이크 관찰 ( 온디바이스 트레이스 ) CPU impact 가 주기적으로 높았다가 낮아지는 패턴으로 반복 Time Profiler 에서 상위 함수로 videoSuggestionsForLocation 확인 원인 위치가 바뀔 때마다 호출되는 함수가 RecommendationRules 파일을 매번 읽고 큰 JSON 을 매번 JSONDecoder로 파싱 “ 데스크에서는 위치가 거의 안 바뀌니 ” 재현이 어려웠던 케이스

- 해결 방향 규칙 파일은 런타임 동안 바뀌지 않으므로 한 번만 로드 / 파싱 캐시 ( 메모리 보관 ) 필요 시 lazy-load 수정 후 동일 조건에서 다시 트레이스를 받아 개선 여부를 비교해 폐루프를 닫음 ⚖ 구현 방식 비교 : “ 어느 쪽이 더 배터리를 덜 쓰나 ” Power Profiler 로 Approach 1 vs Approach 2를 각각 여러 번 측정하고 비교 고려해야 할 변동 요인 thermals, 시스템 압력 , 디바이스 상태 앱 데이터 규모 , 설정 / 기능 상태

- 권장 다양한 조건에서 여러 번 실행 → 평균으로 판단 CPU 가 줄어도 네트워크 / 디스플레이가 늘 수 있으니 총합 관점으로 비교



## 🧩 에너지 최적화 툴체인 전체 그림


- 개발 중 즉시 피드백 : Xcode Energy Gauges

- 깊은 분석 / 원인 추적 : Instruments (Power Profiler + CPU/Time Profiler)

- 자동 탐지 : XCTest 기반 테스트 배포 후 모니터링 Xcode Organizer 에너지 리포트 MetricKit App Store Connect API 🧠 핵심 정리 에너지 최적화는 “ 감 ” 이 아니라 측정 → 원인 규명 → 수정 → 재측정의 반복 Power Profiler 는 어떤 서브시스템이 문제인지 빠르게 좁히고 스파이크 구간을 기준으로 CPU/Time Profiler 로 원인 함수까지 연결하는 “ 허브 ” 역할 데스크 재현이 안 되는 문제는 온디바이스 트레이스로 현장 데이터를 먼저 확보하는 것이 가장 빠른

- 해법
