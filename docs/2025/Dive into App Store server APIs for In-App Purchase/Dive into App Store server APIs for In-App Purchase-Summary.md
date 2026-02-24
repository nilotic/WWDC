# Dive into App Store server APIs for In-App Purchase

Dive into App Store server APIs for In-App Purchase https://developer.apple.com/videos/play/wwdc2025/249/



## ✨ 개요


앱 서버의 3 대 역할 (IAP 관리, 요청 서명, 환불 의사결정 참여) 을 최신 API 로 단순화 · 고도화하는 방법을 소 개합니다 . 특히 appTransactionId( 신규 통합 식별자 ), Set App Account Token( 신규 엔드포인트 ),

JWS 서명 포맷 통일, ** 환불 참여 V2( 부분 환불 지원 )** 가 핵심입니다 .

🧭 핵심 변경점 요약

- 식별자 체계 강화:

  - offerPeriod(ISO 8601 기간 ) 추가로 프로모션 기간을 명확히 전달 .

- **appTransactionId** 를 모든 거래 객체에 포함해 다운로드 ~ 후속 IAP를 하나로 엮는 “ 원스 톱 ” 식별자 제공 ( 패밀리 공유 포함 ).

- 고객 계정 매핑 유연화:

- Set App Account Token: 앱 외부 구매 ( 프로모 코드 / 프로모트 구매 ) 나 과거 거래에도 appAccountToken(UUID)을 서버에서 설정 · 갱신 가능 . 자동갱신형 구독의 향후 갱신에도 승 계 .

- 서명 포맷 통일 (JWS):

  - 모든 서명 (use cases) → JWS로 일원화 .

  - 프로모션 오퍼 서명 V2(JWS), 인트로 오퍼 JWS 서명 ( 사용자 / 트랜잭션별 자격 제어 ) 지원 .

  - Advanced Commerce API 에도 JWS 사용 .

- 환불 참여 V2( 간소화 + 부분 환불 ):

- Send Consumption Information V2: 입력 필드 12→5로 축소 , 비소모형 / 비갱신 구독까 지 범위 확대 , GRANT_PRORATED로 부분 환불 의향 전송 가능 . 결정 결과엔 refundPercentage, **revocationType** 가 포함 .

  - 신규 조회:

- Get App Transaction Info: 서버에서 직접 AppTransaction(JWS) 을 조회 ( 원래는 디바 이스 전송 필요 ). 금년 내 제공 예정.

- 🔐 식별자 전략 ( 정리 )

- appTransactionId: 계정 × 앱당 고정 · 전역 유일 → 다운로드 식별 및 모든 IAP 와 연계 ( 복수 구독이 같은 사용자 소유인지 판별에 유용 ).

- originalTransactionId: 자동갱신형 구독의 원 결제 식별 ( 수명주기 관리 ).

- transactionId: 개별 결제 이벤트 식별 .

- appAccountToken: 개발자 생성 UUID로 고객 계정 ↔ 트랜잭션 연결 ( 패밀리 공유에는 미포함 ). 서 버 엔드포인트로 사후 설정 · 정정 가능 .

- 🧾 서명 · 오퍼 운영 팁 서버에서 JWS 한 가지 포맷만 유지해 StoreKit/ 상거래 호출 전반 재사용 .

- 프로모 / 인트로 오퍼는 거래 · 사용자 단위 자격을 JWS 페이로드로 제어해 남용 방지 .

- 💸 환불 의사결정 참여 (Consumption V2)

- 고객 환불 요청 → CONSUMPTION_REQUEST 수신 .

- V2 엔드포인트로 응답 : customerConsented( 필수 ), deliveryStatus, sampleContentProvided, ( 선택 ) refundPreference(FULL / NONE / GRANT_PRORATED), consumptionPercentage( 밀리퍼센트 ).

- 결과 통지 : REFUND / REFUND_DECLINED(+ refundPercentage, revocationType=FULL|PRORATED|FAMILY_REVOKE). PRORATED면 환불 비율만큼 컨텐츠 회수 / 차감 . ( 자동갱신 구독은 남은 기간으로 소비율 산정 )



## ✅ 실무 체크리스트


- ** 앱 첫 실행 시 appTransactionId** 를 고객 계정과 1 회 매핑 → 모든 IAP 처리에 재사용

- Set App Account Token으로 앱 외부 / 과거 거래까지 appAccountToken 보강

- 서명 로직 JWS 로 통일( 프로모 / 인트로 오퍼 포함 )

- 환불 참여는 V2 로 이행, 부분 환불 시 consumptionPercentage 반드시 포함

- 웹훅 ( 서버 노티 ) 파이프라인에 refundPercentage/revocationType 처리 추가

- 새 Get App Transaction Info 도입 시 서버만으로 다운로드 메타 관측 가능 ( 출시 후 적용 )
