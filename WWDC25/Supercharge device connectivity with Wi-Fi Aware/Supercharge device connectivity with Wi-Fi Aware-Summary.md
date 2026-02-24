# Supercharge device connectivity with Wi-Fi Aware

Supercharge device connectivity with Wi-Fi Aware https://developer.apple.com/videos/play/wwdc2025/228/



## ✨ 개요


iOS 26 / iPadOS 26 에서 새롭게 도입된 Wi-Fi Aware 프레임워크 소개 세션 라우터 · 서버 없이 근거리 기기 간 직접 (P2P) 연결을 안전하고 고성능으로 구성하는 방법을 다룸

핵심 포인트는 페어링 → 연결 → 성능 최적화의 단순한 2- 단계 모델 📡 Wi-Fi Aware 란 ?

진짜 Peer-to-Peer 통신 AP, 인터넷 , 중앙 서버 불필요 런타임에 기기 발견 → 즉시 보안 연결

- 기존 Wi-Fi 와 동시에 동작 인터넷 연결 유지 + Wi-Fi Aware 병행 사용 가능

- Wi-Fi Alliance 표준 크로스 플랫폼 , 타사 디바이스 · 액세서리와 상호운용 가능

- 적합한 사용 사례 파일 전송 , 미디어 스트리밍 , 화면 공유 , 액세서리 제어 , 임시 로컬 경험

  - 🧠 Wi-Fi Aware 의 기본 개념 : Service

- Service = 발견과 연결의 단위 서비스 이름 규칙 최대 15 자 영문 , 숫자 , -만 허용 name.protocol 형태 (tcp 또는 udp) 충돌 방지를 위해 IANA 등록 권장 Service Role Publisher 서비스를 제공 , 서버 역할 Subscriber 서비스를 소비 , 클라이언트 역할 하나의 앱이 동시에 Publisher + Subscriber 가능 📄 Info.plist 설정 WiFiAwareServices 키 추가 서비스별 설정

- Publishable Subscribable 선언된 서비스만 사용 가능 전형적 패턴 앱 ↔ 앱 : Publishable + Subscribable 앱 ↔ 액세서리 : Subscribable only 🔐 Flow 1: 기기 페어링 (1 회성 ) 시스템이 보안 · 키 교환 · 암호화 전부 처리 한 번 페어링되면 이후 근처에 있을 때 자동 재연결 가능 페어링 UI 옵션 DeviceDiscoveryUI 앱 ↔ 앱 , 앱 ↔ 타사 기기 흐름 기기 선택 → PIN 입력 → 페어링 완료

- Publisher: Advertiser UI

- Subscriber: Device Picker UI

- AccessorySetupKit ( 권장 : 하드웨어 ) 액세서리 온보딩 특화 Bluetooth + Wi-Fi Aware 동시 설정 가능 결과로 ASAccessoryWiFiAwarePairedDeviceID 제공



## 📦 Paired Device 관리


WAPairedDevice vendor, model 등 메타데이터 포함 allDevices API 제공 필터링 가능 async sequence로 변경 사항 감지 도달 가능 여부와 무관하게 반환됨

🔗 Flow 2: 연결 구성 (Network framework) 역할 분리 Publisher 서비스 publish + listener 생성 Subscriber 서비스 browse + browser 생성

연결 절차

- Paired device 필터 정의

- NetworkListener 생성 (Publisher)

- NetworkBrowser 생성 (Subscriber)

- endpoint 발견

- NetworkConnection으로 연결

- 데이터 송수신

- 완료 후 listener / browser 중단 → 전력 절약 ⚙ 성능 튜닝 Performance Mode bulk 낮은 전력 , 높은 지연 realTime 낮은 지연 , 전력 소모 증가 Traffic Service Class bestEffort ( 기본 ) background interactiveVideo interactiveVoice 권장 조합

- 대용량 전송 : bulk + bestEffort / background

- 실시간 통신 : realTime + interactive ⚠ realTime 사용 시 배터리 영향 반드시 고려 📊 성능 모니터링 Connection 별 Performance Report 제공 신호 세기 처리량 지연 시간 혼잡한 Wi-Fi 환경에서 반드시 테스트 권장 TCP 등 상위 프로토콜 피드백과 함께 사용 🧠 핵심 정리 Wi-Fi Aware 는 로컬 · 임시 · 고성능 디바이스 간 경험을 위한 차세대 연결 인프라 개발자는 보안 , 키 관리 , 암호화 신경 쓸 필요 없음

- 페어링 + 연결이라는 단순한 모델만 다루면 됨 Accessory· 멀티 디바이스 · 근거리 협업 앱에 매우 강력 Network framework 기반이라

  - 기존 네트워크 코드 재사용 가능
