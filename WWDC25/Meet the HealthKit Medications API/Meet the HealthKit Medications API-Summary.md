# Meet the HealthKit Medications API

Meet the HealthKit Medications API https://developer.apple.com/videos/play/wwdc2025/321/



## ✨ 개요


iOS / iPadOS / visionOS 의 Health 앱 ‘ 복약 ʼ 기능이 HealthKit API 로 개방되었습니다 .

앱에서 사용자가 등록한 약 정보 (HKUserAnnotatedMedication) 와 복용 / 건너뜀 기록 (HKMedicationDoseEvent) 을 읽어 복약 관리 , 부작용 모니터링 , 차트 등 다양한 경험을 만들 수 있습니다 .

💊 새로운 약물 데이터 모델 HKUserAnnotatedMedication 사용자가 Health 앱에 추가한 “ 약 + 개인화 정보 ” 를 나타내는 객체 주요 속성

- isArchived : 복용 종료 / 보관 상태 여부

- hasSchedule : 리마인더 스케줄 존재 여부

- nickname : 긴 약 이름 대신 쓰는 친숙한 이름

- medicationConcept : 실제 약 개념을 나타내는 HKMedicationConcept HKMedicationConcept 특정 약에 대한 “ 개념 ” ( 처방전 레코드가 아니라 약 자체 정보 )

- 속성 :

- identifier : 기기 · 시간을 넘어 유일한 ID

- displayText : 예 ) “Amoxicillin Trihydrate 500mg Oral Tablet”

- generalForm : tablet, capsule, liquid 등 제형

- relatedCodings : RxNorm 등 표준 코드 세트 → 다른 시스템과 상호운용에 사용



## 🧪 복용 기록 : HKMedicationDoseEvent


HKMedicationDoseEvent 새로 추가된 HKSample 타입 한 번의 “ 복용 / 스킵 / 스누즈 등 이벤트 ” 를 표현합니다 .

- 주요 정보 :

  - 어떤 medicationConcept.identifier 에 대한 기록인지

- logStatus : taken / skipped / snoozed / noInteraction 등

- doseQuantity : 실제 복용량

- scheduledDate, scheduledQuantity : 원래 계획된 시간 · 용량 이 정보로 “ 스케줄 대비 실제 복용 준수도 ”, “ 규정보다 많이 / 적게 먹은 경우 ” 등을 앱에서 계산할 수 있습니다 .

- 📥 읽기 & 권한 흐름 Per-object authorization 약 정보는 객체 단위 권한으로 관리됩니다 .

- HKUserAnnotatedMedicationType 에 대해 authorization 요청 시 시스템이 Health 앱에 등록된 약 목록을 보여주고 , 사용자가 앱과 공유할 약만 토글로 선택할 수 있습니다 .

- 한 번 약에 대해 권한이 허용되면 :

- 그 약의 HKUserAnnotatedMedication + 모든 HKMedicationDoseEvent 를 함께 읽을 수 있습니다 .

  - Dose event 에 대해서는 별도 권한 요청이 필요 없습니다 .

- 증상 ( 두통 , 메스꺼움 등 ) 은 기존처럼 카테고리 샘플 (HKCategorySample) 로 , 여러 sample type 을 묶어 authorization 요청을 보냅니다 .

- 📊 쿼리 : Medications & Dose Events 약 목록 쿼리

- HKUserAnnotatedMedicationQueryDescriptor / HKUserAnnotatedMedicationQuery isArchived, hasSchedule 용 새 프레디케이트 제공

- limit 없이 실행하면 활성 + 아카이브 약 전체 조회 가능 복용 이벤트 쿼리

- HKMedicationDoseEvent 는 일반 샘플이므로 HKSampleQuery, HKAnchoredObjectQuery, HKObserverQuery 모두 사용 가능

- 새 프레디케이트들로 특정 medication concept

- 특정 logStatus ( 예 : taken 만 ) 날짜 범위 ( 오늘 , 차트 윈도우 등 ) 를 조합해 필터링합니다 .

- 🤕 RxNorm 을 활용한 부작용 매핑 약마다 RxNorm 코드가 HKMedicationConcept.relatedCodings 에 들어 있습니다 .

- 세션 예제 앱에서는 :

- 내부에 “RxNorm 코드 → 증상 목록 ” 매핑 딕셔너리 정의

- MedicationConcept 의 relatedCodings 중 RxNorm 코드만 추출

- 해당 코드에 매핑된 증상 (category type) 을 UI 에 표시 이렇게 하면 “ 이 약을 먹을 때 흔한 부작용 리스트 ” 를 보여주고 , 각 증상을 이모지 기반 강도 (SymptomIntensity enum) 로 선택 → HKCategorySample 로 HealthKit 에 저장하는 경험을 만들 수 있습니다 .

- 🔁 Anchored Object Query & 차트 복용 차트 ( 도수 vs 날짜 ) 를 위해 HKAnchoredObjectQuery 를 사용해 증분 업데이트를 받는 패턴을 권장합니다 .

- 특징 & 주의점 :

- 최초 실행 시 : 현재 스냅샷 ( 추가된 샘플 + 삭제된 샘플 없음 )

- 이후 업데이트 시 :

- 새로 추가된 dose events 삭제된 샘플 목록 ( 이전 데이터의 수정 / 삭제 반영 )

- Dose event 는 과거 날짜에 소급 저장되거나 ,

- 수정 시 “ 삭제 후 재저장 ” 이 일어날 수 있어 → 삭제 / 추가 둘 다 반영하지 않으면 차트가 틀어질 수 있습니다 .

- 베스트 프랙티스 :

- query anchor 를 항상 저장 · 재사용해 중복 처리 방지 결과를 받으면

- deleted objects 를 기존 차트 데이터에서 제거

- 새 samples 를 차트 포인트에 반영 iOS 18 의 async 인터페이스를 사용하면 dose event 스트림을 async/await 로 처리하면서 차트를 실시간 업데이트 할 수 있습 니다 .

- ➕ Health 앱과의 연동된 권한 갱신 앱 설치 후 이미 Medications 권한을 한 번 받아 둔 상태라면 , 사용자가 Health 앱에서 새 약을 추가할 때 완료 화면에 “ 이 앱과도 공유할까요 ?” 스위치가 함께 표시됩니다 .

- 개발자가 별도 작업을 하지 않아도 사용자가 스위치를 켜고 저장하면 다음번 앱 쿼리에서 새 약 + 그 Dose Events 가 바로 보입니다 .



## ✅ 정리


- 새로운 Medications API 로 :

- 사용자 맞춤 약 정보 (HKUserAnnotatedMedication) 복약 행태 (HKMedicationDoseEvent)

  - 를 앱에서 직접 다룰 수 있습니다 .

- RxNorm 를 이용하면 약 → 부작용 / 교육 콘텐츠 / 주의사항 등과 연결하는 임상적 맥락도 붙일 수 있습니다 .

- Anchored Object Query 와 async 인터페이스를 활용하면 Health 앱에서 수정 · 추가된 최신 복약 데이터를

  - 앱의 차트 · 리마인더 · 인사이트 화면에 실시간으로 동기화할 수 있습니다 .
