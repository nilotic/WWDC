# Optimize home electricity usage with EnergyKit

Optimize home electricity usage with EnergyKit https://developer.apple.com/videos/play/wwdc2025/257/



## ✨ 개요


EnergyKit은 사람의 지역 전력망 (Grid) 상태를 기반으로 , 기기 전력 사용을 더 깨끗하고 ( 탄소 배출 낮음 ) 잠재적으로 더 저렴한 ( 요금제 반영 시 ) 시간대로 줄이거나 / 옮기도록 돕는 프레임워크입니다 .

Home 앱의 Grid Forecast 및 에너지 경험을 구동하던 기술을 주거용 (residential) 앱에도 제공 하는 것이 목표입니다 .

- 대표 활용 : 전기차 (EV) 충전, 스마트 온도조절기 등 .

- 🏠 온보딩 : Clean Energy Charging + EnergyVenue 선택 통합 시작은 사용자가 Clean Energy Charging에 옵트인하는 것부터입니다 .

- EnergyVenue는 전력망을 공유하는 ** 물리적 장소 ( 충전 위치 / 주거지 등 )** 이며 , 소유자는 Home 앱 또는 EnergyKit 온보딩 플로우로 Home 을 설정합니다 .

- 사용 흐름 충전 위치별로 토글 제공 → 활성화 시 근처 EnergyVenue 목록 조회 사용자가 venue 선택 → 충전 위치 ↔ venue 매핑을 로컬에 저장 권장 사항 venue 의 unique identifier를 로컬에 저장 앱 실행 시마다 저장된 identifier 로 venue 가 여전히 존재하는지 확인 후 사용 🧭 Electricity Guidance: Reduce vs Shift Clean Energy Charging 스케줄 생성에는 Electricity Guidance( 예측 / 가이드 ) 가 필요합니다 .

- 가이드는 다음을 조합해 생성됩니다 .

- Home 위치 그리드 상태 ( 탄소 배출 , 재생에너지 발전 등 ) 유틸리티 계정 / 요금제 정보 ( 가능한 경우 ) 액션 타입 2 가지

- Reduce: 전력 사용량 자체를 줄이는 기기 ( 예 : 스마트 온도조절기 )

- Shift: 같은 전력량을 시간만 이동 가능한 기기 ( 예 : EV 충전 ) 가이드 값 (0~1) 낮을수록 더 깨끗하고 ( 및 요금제 있을 경우 더 저렴할 가능성 ) 🔄 Guidance 스트리밍 조회 (AsyncSequence)

- EV 사례 : action type 은 보통 Shift ElectricityGuidance.sharedService로 guidance 를 조회하며 , 결과는 AsyncSequence로 지속 업데이트됩니다 .

- 필요 시 계속 업데이트를 듣지 않아도 되면 첫 값만 받고 loop 탈출 가능 앱 백그라운드에서도 업데이트가 필요하면 Background Task에서 수행 권장 위젯이 있다면 위젯을 활용해 앱이 떠 있어도 guidance 최신 유지 가능 🗓 충전 스케줄 생성 개념

- 충전 윈도우 ( 예 : 18:30 ~ 다음날 09:00) 에서

- 바로 충전하면 ( 즉시 시작 ) 비싼 / 더러운 구간 ( 예 : 16~21 시 TOU 고가 ) 과 겹칠 수 있음 guidance 를 이용해 더 깨끗하고 ( 및 잠재적으로 저렴한 ) 시간대에 충전하도록 시간 슬롯을 선택 / 최적화합니다 .

- 📊 Insights: “ 얼마나 잘 옮겼는가 ” 를 보여주는 요약 EnergyKit 은 사용자에게 보여주기 쉬운 형태의 Insights를 제공합니다 .

- 그리드 청정도 기반 분류

- 전력 사용을 3 가지 카테고리로 분류 : clean / reduce / avoid

- 요금제 ( 있을 때 ) 기반 분류

- 전력 사용을 5 가지 카테고리로 분류 : super off peak / off peak / partial peak / on peak / critical peak

- rate plan = rate tariff 🧾 LoadEvents: Insights 생성을 위한 피드백 ( 필수 ) Insights 를 생성하려면 앱이 EnergyKit 에 LoadEvents를 제출해야 합니다 .

- 개념적으로 “ 기기가 실제로 어떻게 / 언제 전력을 썼는지 ” 를 EnergyKit 에 알려주는 로그입니다 .

- 이벤트 생성 가이드

- 세션 시작 : 충전 시작 시점의 상태 이벤트

- 세션 진행 : 충전 중 15 분마다 1 회( 정상적인 steady rate 기준 ) 권장 추가 이벤트가 필요한 경우 일시정지 새 guidance 적용으로 스케줄 변경 전력 소비 급변 등 중요한 상태 변화

- 세션 종료 : 최종 상태 이벤트로 세션 닫기

- 주의 : 세션과 세션 사이에는 이벤트 제출 금지 제출 방식

- 실시간 제출도 가능하지만 성능을 위해 배치 제출 권장 샘플 앱은 이벤트를 캐시했다가 배치로 제출

- 🔐 데이터 저장 / 공유 / 프라이버시 제출된 이벤트는 Apple 프라이버시 정책에 따라 저장됩니다 .

- 온디바이스 Core Data 저장 CloudKit E2E 암호화 백업

  - 해당 EnergyVenue와 연결된 HomeKit Home 을 공유하는 사용자들 간에 공유됩니다 .

- 📈 Insights 조회 Insights 조회 시 query 에서 관심 항목 ( 청정도 , 가능하면 비용 ) 을 지정

  - 결과는 AsyncStream으로 제공되며

- 예 : 특정 “ 하루 ” 요약이 필요하면 스트림을 필터링해 해당 날짜 인사이트를 사용 이렇게 받은 인사이트로 “ 어제 충전이 얼마나 깨끗 / 저렴했는지 ” 같은 요약 UX 구성 가능



## 🧩 전체 통합 흐름


(1) 사용자 옵트인 → (2) EnergyVenue 선택 / 저장 → (3) Guidance 스트리밍 수신 → (4) 스케줄 생성 / 적용 → (5) 충전 중 LoadEvents 생성 / 배치 제출 → (6) Insights 조회 / 표시
