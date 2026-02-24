# Filter and tunnel network traffic with NetworkExtension

Filter and tunnel network traffic with NetworkExtension https://developer.apple.com/videos/play/wwdc2025/234/



## ✨ 개요


iOS·macOS 26 의 Network Extension 으로 네트워킹 확장 · 보안 · 필터링을 시스템과 조화롭게 구현하는 방법을 총정리합니다 . 특히 URL 기반 콘텐츠 필터 ( 신규 ), MASQUE 릴레이, VPN 라우팅 강제 옵션,

MDM 배포가 핵심입니다 .

🧭 무엇을 만들 수 있나 Wi-Fi 관리 / 핫스팟(iOS 26 의 NEHotspotHelper 포함 ), 로컬 푸시(APNs 불가 환경 ), DNS 구성 / 프록시, 투명 프록시 (macOS), 보안 원격 접속 ( 릴레이 ·VPN), 콘텐츠 필터 ( 데이터 / 패킷 /URL). 목

적에 맞는 정식 API 만 쓰는 것이 원칙입니다 .

🔁 릴레이 vs VPN 선택 가이드

- 네트워크 릴레이 (MASQUE): 특정 TCP/UDP 앱 트래픽을 클라우드 경유로 터널링 . 시스템에 내장 된 릴레이 지원을 **NERelayManager** 나 MDM 프로파일로 바로 구성 ( 확장 불필요 ). 클라우드 앱 접근에 최적 .

- IP 기반 VPN: 모든 IP 트래픽을 터널링 ( 사내망 확장 / 규제 환경 / 개인 프라이버시 ).

- NEVPNManager(IKEv2/IPsec) 또는 NEPacketTunnelProvider( 커스텀 프로토콜 ) 사용 . 포함 / 제외 라우트로 스플릿 / 풀 터널을 정의합니다 .

- 🛣 VPN 라우팅 강제 옵션

- enforceRoutes( 스플릿 ): 포함 · 제외 라우트를 항상 우선 적용 .

- includeAllNetworks( 풀 ): 모든 트래픽 강제 터널, 이때 제외 라우트는 무시 .

- 필요 서비스 예외 : 로컬 네트워크 (AirDrop/AirPlay), 통화 · 메시지, APNs 등은 선택적으로 터널 우회 . macOS 에선 관리자 변경 라우트로 충돌 시에도 우선순위 보장 가능 .

- 🛑 하지 말아야 할 것 Packet Filter 조작이나 라우팅 테이블 직접 수정 (macOS) 으로 VPN/ 필터를 구현하지 마세요 . 시스템 / 타 앱 정책과 충돌합니다 . VPN 은 Network Extension 만 사용해야 합니다 .

- 🛡 콘텐츠 필터 3 종

- 데이터 필터 (NEFilterDataProvider): TCP/UDP/ICMP 흐름 단위 판정 .

- 패킷 필터 (macOS, NEFilterPacketProvider): L2 패킷 단위 판정 .

- URL 필터 ( 신규 ): 완전한 URL 기반 HTTP/HTTPS 요청을 시스템이 프라이버시 보존 방식으로 차 단 / 허용 . 앱은 트래픽에 직접 접근하지 않습니다 .

- 🔒 URL 필터의 프라이버시 설계 Bloom 필터 ( 온디바이스 프리필터 ) → 음성 ( 미포함 ) 확정 / 양성 ( 후속 확인 ).

- PIR(Private Information Retrieval): 암호화된 질의 / 응답으로 서버 조회 ( 서버는 질의 / 결과를 알 수 없음 ).

- Privacy Pass: 익명 인증으로 합법 디바이스만 조회 가능 ( 개별 추적 불가 ).

- Oblivious HTTP Relay: IP 비식별화 프록시 (Apple 릴레이 ↔ 개발자 게이트웨이 ).

이 조합으로 정확한 URL 판정을 하면서도 앱· 서버가 URL/ 사용자 식별 정보를 알 수 없습니다. 관리 ·

- 비관리 기기 모두 지원됩니다 .



## 🧩 URL 필터 아키텍처 & 참여 API


- 앱/ 확장 구성만: 데이터셋 (Bloom) 과 PIR 서버 주소를 제공하면 시스템이 전 과정 수행.

브라우저 등 WebKit/URLSession 비사용 앱은 전역 자동 검사에 포함되지 않으므로 ,

- NEURLFilter.verdictForURL(_:) 를 호출해 참여해야 합니다 .

- 🛠 구축 단계 ( 요약 )

- PIR 서버 +Privacy Pass Issuer 준비 ( 샘플 제공 ). 키– 값 DB의 키는 URL 문자열 , 값은 정수 1.

- use-case 이름은 your.bundle.id.url.filtering 접두사 형식 .

- Bloom 필터 생성: 문서의 지정 해시 / 방법으로 빌드 . 정적이면 앱 번들 포함, 동적이면 주기적 페치.

- 앱: url-filter-provider 엔타이틀먼트 , NEURLFilterManager 로 서버 파라미터 · 옵션 설정 → 활 성화 / 저장 . MDM 으로 대규모 배포 가능 ( 감독 기기 ).

- 앱 확장: Xcode 의 URL Filter Extension 템플릿으로 NEURLFilterControlProvider.fetchPrefilter 구현 ( 번들 / 서버에서 Bloom 제공 ).

- Oblivious HTTP Relay 사용 신청: 문서의 양식으로 승인 후 App Store/TestFlight/ 엔터프라이 즈 배포 가능 ( 개발자 서명 빌드는 면제 ).



## 🧰 기타 유용 API


DNS 보호( 암호화 DNS/ 프록시 ), 투명 프록시 (macOS) 로 특정 도메인만 보안 서비스 경유 , 로컬 푸시로 오프라인망 ( 선박 / 병원 ) 에서도 메시징 /VoIP 유지 .



## ✅ 실무 체크리스트


- 목적별 선택 : 릴레이 (MASQUE) ↔ IP VPN(IKEv2/IPsec/PacketTunnel) 구분 적용

- VPN 은 enforceRoutes / includeAllNetworks 로 라우팅 우선순위 확정 + 서비스 예외 점검

- URL 필터: PIR 서버 ·Bloom·Privacy Pass·Oblivious HTTP 구성 , 참여 API( 비 -WebKit 앱 ) 적

- 용

- MDM 프로파일로 대규모 설정 배포 ( 감독 기기 )

- 비권장: Packet Filter/ 수동 라우팅 — NE 기반으로 마이그레이션

- 원하시면 현재 앱 시나리오를 알려 주세요 . 릴레이 vs VPN 결정표, URL 필터 서버 / 확장 샘플 스캐폴드, MDM 키 맵, 참여 API 적용 지점까지 바로 뽑아드릴게요 .
