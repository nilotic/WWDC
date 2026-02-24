# Get to know the ManagedApp Framework

Get to know the ManagedApp Framework https://developer.apple.com/videos/play/wwdc2025/203/



## ✨ 개요


ManagedApp은 MDM( 선언적 관리 ) 하에서 앱 / 확장에 구성값과 시크릿 ( 비밀번호 · 인증서 · 아이덴티티 ) 을 안전하게 전달해 첫 실행부터 즉시 사용 가능하게 만드는 프레임워크입니다 . 앱은 구성 디코더만 구현하

면 되고 , 관리자는 MDM 으로 값을 바꾸면 실시간 갱신이 앱에 통지됩니다 . iOS 18.4 / iPadOS 18.4 / visionOS 2.4 부터 지원합니다 .



## 🧩 무엇을 전달하나


- App-specific configuration: 앱이 정의한 임의의 설정 / 옵션 / 소형 에셋 ( 킬로바이트 권장 ).

- Secrets(3 종 ): password( 문자열 ), SecCertificate, SecIdentity(PKCS#12/SCEP/ACME; 하 드웨어 바운드 키 · 어테스테이션 지원 ). 모든 데이터는 해당 앱 / 확장에만 안전 제공 .

- 🔐 왜 안전한가 구성 · 시크릿은 추출 / 조작 방지 설계로 보관 · 전달 .

- 라이선스 토큰 대신 ‘ 라이선스 키 ( 아이덴티티 )ʼ 를 권장 → 개인키는 디바이스에서 생성 / 유지, 서버엔 인증서만 전달 . 기존 “Managed App Configuration” 보다 보안 ↑· 확장 지원 ↑.



## 🧰 대표 시나리오


- 라이선싱: 조직별 아이덴티티로 요청을 귀속 ( 토큰 대체 ).

- VPN 확장: Managed Device Attestation으로 증명된 하드웨어 바운드 키를 확장에만 제공해 mTLS 인증 .

- IdP(SSO): 디바이스 확인용 아이덴티티 · 초기 임시 비밀번호 · 조직 바인딩 토큰 등 필요한 비밀 재료 를 조합.

- 🧱 API 구성 (4 클래스 )

- ConfigurationProvider: 앱이 정의한 Decodable 구조로 async sequence 수신 (for await 루프 , 값 또는 nil).

- Passwords / Certificates / Identities Provider: 식별자 (ID) 로 조회하거나 식별자 목록 async sequence 구독 . 필요 시마다 즉시 조회 ( 캐시 지양 ).

- 🛠 통합 흐름 ( 개발자 관점 )

- 구성 스키마 정의( 예 : ManagedConfig: Decodable + 유효성 검사 ).

- 앱 시작 초기에 구성 async sequence 를 시작하여 모델에 반영 ( 업데이트 자동 반영 ).

- mTLS 등 시크릿 사용 지점에서 필요 시마다 ID 로 조회 → 없으면 실패 / 취소 처리.

- 관리자용 스펙 문서 제공 : 지원 키 / 값 , 시크릿 식별자 , 오류코드 , 예시 PLIST 등 .



## 📦 배포 / 요건 · 제한


선언적 MDM 으로 관리되는 앱 ( 설치 시점 또는 ‘ 인수 ʼ 시점부터 동작 ).

대부분의 앱 확장 지원 ( 단 , 매우 제한된 환경 — 예 : 키보드 확장은 “ 전체 접근 ” 필요 ).

- 대용량 데이터 금지: 구성은 킬로바이트급 , 대용량은 서버 URL을 구성으로 내려받아 앱이 다운로드 .

- 🔄 마이그레이션 가이드

- 기존 Managed App Configuration 사용 앱은 동시에 둘 다 지원하되 , ManagedApp 우선으로 처리 하여 무중단 전환을 유도하세요 .



## ✅ 베스트 프랙티스 체크리스트


- 구성은 세분화 옵션으로 설계 (“ 관리됨 ” 스위치 한 개 금지 ).

- 앞 / 뒤 호환: 구버전 키 처리 , 미지 키 무시 .

- 시크릿은 보관하지 말고 매번 조회( 항상 최신 / 안전 ).

- 라이선싱 ·mTLS 등은 아이덴티티 기반으로 전환 .

- 리뷰 / 데모 대비: 데모 모드 · 동영상 · 검수용 관리 지침 제공 .
