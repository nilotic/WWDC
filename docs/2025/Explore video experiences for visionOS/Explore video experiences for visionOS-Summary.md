# Explore video experiences for visionOS

Explore video experiences for visionOS https://developer.apple.com/videos/play/wwdc2025/304/



## ✨ 개요


visionOS 26 에서 2D/3D/ 스페이셜 (Spatial)·180°·360°· 와이드 FOV·Apple Immersive Video까 지 전 스펙트럼의 미디어를 AVKit/RealityKit/QuickLook/Safari/WebKit으로 재생 · 스트리밍 (HLS)

하는 법과 각 포맷의 쓰임새를 정리합니다 .



## 🖼 2D·3D· 스페이셜 비디오 기본


2D/3D: 인라인 재생 가능 (3D 는 인라인 시 2D 로 폴백 )· 플로팅 스크린 ( 확장 경험 )· 가상 환경 도킹까 지 지원 . 3D 입체 재생은 확장 경험이 필수입니다 .

- Spatial Video: iPhone/Vison Pro 등으로 촬영한 스테레오 + 메타데이터 영상 . 기본은 창 (window) 안에 흐릿한 가장자리로 표시 , Immersive 모드에선 실제 스케일로 공간에 녹아듭니다 .

- 이제 AVKit·RealityKit·QuickLook·Safari/WebKit 전반에서 동일 스타일을 지원 (HLS 포함 ).

- 🆕 프레이밍 & 멀티뷰 업데이트

- Per-frame 동적 마스크: 2D/3D 비디오가 프레임마다 마스크 / 종횡비를 바꿔 레터박스 없이 전환 (“Rectangular Mask Payload Metadata”).

- 멀티뷰 (visionOS 2 도입 ) 도 지속 지원 — 여러 각도 / 소스를 동시에 .

- 🌐 APMP(Apple Projected Media Profile) — 180°·360°· 와이 드 FOV

- 신규 QuickTime 프로파일 (APMP) 로 180°( 하프 에퀴렉트 ), 360°( 에퀴렉트 ), Wide FOV( 파 라메트릭 투영 ) 를 네이티브 지원 . 인라인 재생은 비지원 , 확장 /Immersive 재생만 지원 .

- 자동 변환: Canon EOS VR(180°), GoPro MAX/Insta360 X5(360°), GoPro HERO13·Insta360 Ace Pro 2( 와이드 FOV) 등의 영상을 열 때 자동 APMP 변환. macOS avconvert로 일괄 변환 가능 .

- 와이드 FOV: 액션캠 렌즈 프로파일을 3D 곡면으로 재현하는 파라메트릭 이머시브 투영으로 어안 왜 곡을 공간 상에서 보정해 직선은 직선으로 보이게 표시 .

- 안정성: 고( ⾼ ) 모션 자동 감지로 장면 흔들림이 큰 구간에서 몰입도를 자동 완화 ( 설정 앱에서 민감도 조절 ).

- 🎥 Apple Immersive Video( 개발자 공개 ) 초고해상도 스테레오 이머시브 포맷을 올해 제작 · 편집 · 배포 가능 . Blackmagic URSA Cine Immersive(8160×7200/eye@90fps, 최대 210°×180°) 촬영 → DaVinci Resolve 편집 → Immersive Video Utility(macOS/visionOS) 검증 → Compressor로 HLS 세그먼트 .

- ImmersiveMediaSupport 프레임워크 로 읽기 / 쓰기 API 제공 , 샷별 에지 블렌드, 맞춤 백드롭 환 경, 새 Apple Spatial Audio 포맷, Vision Pro 라이브 프리뷰 지원 . ( 재생은 APMP 와 동일하게 확장 /Immersive 전용 ) 🧮 스테레오 코덱 — MV-HEVC 스테레오 ( 좌 / 우 ) 프레임 간 중복을 이용하는 MV-HEVC로 한 트랙에 두 눈 버퍼를 효율 압축 ( 특히 스트리 밍에 유리 ). 기존 사이드 - 바이 - 사이드 대비 용량 · 대역폭 절감 효과 .

- 🧭 어떤 포맷을 언제 쓸까 ?

- 2D/3D: 일반 콘텐츠 · 극장형 입체 → 인라인 / 확장 / 도킹 유연 , 3D 는 확장 필요 .

- Spatial Video: 일상 / 프라이빗 기록에 최적 — 창 표시로 시각 피곤함 완화 , 필요 시 Immersive 확 장 . 모든 Apple 디바이스에서 2D 폴백 공유 용이 .

- 180°: 몰입형 장소 체험( 전방 시야 가득 + 보통 스테레오 ).

- 360°: 주변 전체를 채우는 현장감( 모노 / 스테레오 ).

- 와이드 FOV: 액션캠 푸티지 — 렌즈 프로파일 그대로 재현해 가장 넓은 FOV와 가장 자연스러운 직선 동시 달성 .

- Apple Immersive: 프리미엄 내러티브 / 이벤트— 최고 해상도 · 정교한 샷 블렌드 · 전용 오디오 .



## ✅ 실무 체크리스트


- AVKit/RealityKit/QuickLook/Safari/WebKit 경로로 HLS 포함 재생 구성

- (Spatial/APMP/Immersive 지원 범위 상기 )

- Spatial Video: iPhone/Vision Pro 캡처 → 프레임워크 스타일로 윈도우 /Immersive 표시 , 타 플

- 랫폼 2D 폴백 확인

- APMP: 180°/360°/ 와이드 FOV 자동 변환 파이프라인 점검 (avconvert· 기기 내 자동 변환 ) + 인라

- 인 비지원 고려한 UX 설계

- Dynamic Mask 메타데이터로 샷별 프레이밍 전환 ( 레터 / 필러박스 제거 )

- 고모션 자동 완화 옵션 노출 ( 설정 연동 ) 로 멀미 위험 저감

- Immersive 제작: URSA Cine → Resolve → Immersive Video Utility → Compressor/HLS, 필요 시 ImmersiveMediaSupport로 툴체인 확장
