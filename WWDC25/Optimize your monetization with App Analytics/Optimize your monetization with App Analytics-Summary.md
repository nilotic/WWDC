# Optimize your monetization with App Analytics

Optimize your monetization with App Analytics https://developer.apple.com/videos/play/wwdc2025/252/



## ✨ 개요


App Store Connect 의 App Analytics에 추가된 신규 기능을 소개하는 세션 핵심 변화 App Analytics 의 새로운 위치 ( 홈 ) 및 정보 구조 개편 필터 확장 ( 최대 7 개 )

payer( 결제 사용자 ) 중심 지표 + 벤치마크 구독 (Subcriptions) 분석 대규모 확장 (50+ 지표 ) 오퍼 (Offers) 성과 지표 신설 Reports API 리포트 확장 ( 구독 state/event 리포트 추가 )

🧭 App Analytics “ 새 홈 ” 으로 이동 App Store Connect 의 Apps 탭 내부로 App Analytics 가 이동 앱 관리 워크플로우와 더 가깝게 배치되어 인사이트 → 액션 연결이 쉬워짐

Overview 페이지가 Customer Journey( 획득 → 전환 → 수익화 / 유지 ) 흐름으로 재구성

- App Store feature analytics( 예 : Custom Product Page, In-App Events) 의 영향이 Overview 중간에 바로 노출



## 🧰 필터링 기능 대폭 확장


어떤 지표든 최대 7 개 필터까지 적용 가능 ( 기존 대비 2 배 이상 ) 각 필터에서 복수 값 선택 가능

- 예 : 국가 (US/CA) + 디바이스 (iPhone/iPad) + OS(iOS 18) + 유입 소스 + 특정 Custom Product Page 등 조합 분석

- 💰 Monetization 섹션 신설 (IAP 앱 대상 ) IAP 가 있는 앱은 사이드바에 Monetization 섹션이 추가

- Sales 뷰에 기존 지표 ( 예 : proceeds, paying users, IAP 수 ) 외에 신규 코호트 지표 추가

- 신규 코호트 지표 Download-to-Paid Conversion

- 다운로드 후 얼마나 빨리 결제로 전환되는지 Average Proceeds per Download

- 다운로드 기반으로 유저당 수익이 시간에 따라 어떻게 누적되는지 📊 Cohorts 페이지 ( 신규 )

- Download-to-Paid Conversion / Average Proceeds per Download 를 코호트 테이블로 심층 분석

  - 셀 선택 시

- 특정 월 ( 예 : 9 월 다운로드 코호트 ) 의 N 일 후 결제 전환율 확인 상단 row 는 시간 경과에 따른 평균 누적 전환을 요약 색상으로 “ 결제자 누적 속도 ” 를 직관적으로 표현



## 🧪 Benchmarks ( 피어 그룹 비교 )


각 핵심 코호트 지표 아래에 peer group benchmark( 퍼센타일 ) 제공 내 성과가 25th~50th, 50th~75th 등 어느 수준인지 즉시 파악 가능 해석 포인트 전환율이 평균 이하라도

지출이 높은 (ARPD 가 높은 ) 사용자군이 있을 수 있어 “ 어느 단계가 병목인지 ” 를 분리해서 볼 수 있음 🎯 Custom Product Page 별 퍼널 분석

- 필터로 특정 Custom Product Page( 예 : Running/Biking) 를 걸어 전환 (Download→Paid) 차이 수익 (ARPD) 차이 구독 유지율 차이 를 퍼널 단계별로 비교 가능

- 예시 인사이트 러너 유입은 결제 전환이 낮지만

- 구독으로 들어오면 유지율이 더 길 수 있음 → 병목이 “Retention” 이 아니라 “ 초기 전환 ” 임을 확인

- 🔁 Subscriptions 분석 대규모 업데이트 Subscriptions 섹션 신설

- 요약에서 핵심 지표 제공 active plans, paid plans, MRR 등

- Net Paid Plans 그래프 plan starts(activation + reactivation)

- churn( 자발 / 비자발 ) 을 분해해 성장 / 정체 원인을 빠르게 파악

- 50+ 신규 구독 지표 (Inline Metrics) 두 분류로 제공

- State metrics: 특정 시점의 상태 스냅샷 (offer 기간 , 정상 결제 , billing issue, churn 등 )

- Event metrics: 기간 중 상태 전이 ( 활성 / 재활성 / 이탈 등 ) 구독 코호트 (Subscription Retention) “ 구독 시작 후 N 개월 ” 시점의 잔존율을 코호트로 확인 Custom Product Page 필터로 “ 어떤 유입이 더 오래 남는지 ” 까지 연결 가능 🎁 Offers 지표 신설 Offers 는 특정 IAP/ 구독에 특가 / 무료 체험 등을 붙여 획득 (acquire) 유지 (retain) 복귀 (win-back) 를 노리는 수단

- Offers 섹션에서 제공하는 것 active/new offers 현황 오퍼 시작 → 유료 전환율 (fully paid conversion) 등 성과 지표 오퍼 코호트 분석 “Subscription Retention by offer start” 로 오퍼 시작자 중 유료 전환 비율 N 개월 유지율 을 함께 확인 가능 📤 Analytics Reports API 업데이트 Analytics Reports API 로 App Analytics 데이터를 ** 대규모 (export)** 로 가져올 수 있음

- (2025 년 6 월 기준 ) 8 개 카테고리 리포트 지원 추가 예정 신규 리포트 subscription state report subscription event report

- 기존 Sales/Trends 구독 리포트는 대체 예정 목적

- 다운로드 정보와 구독 성과를 프라이버시 친화적으로 연결 오프라인 분석 / 사내 대시보드 구축 용이

- 🧠 핵심 정리 이번 업데이트는 “ 지표 추가 ” 가 아니라 수익화 퍼널을 end-to-end 로 분해해 볼 수 있게 만든 변화

- 특히 강점 필터 7 개로 유입 → 전환 → 구독 → 오퍼까지 세그먼트 분석

- payer/ 구독 / 오퍼에 대해 코호트 + 벤치마크를 기본 제공 API 로 대규모 데이터 추출까지 연결
