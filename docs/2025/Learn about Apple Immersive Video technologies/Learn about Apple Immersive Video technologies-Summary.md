# Learn about Apple Immersive Video technologies

Learn about Apple Immersive Video technologies https://developer.apple.com/videos/play/wwdc2025/403/



## ✨ 개요


Apple Immersive Video 는 Vision Pro 전용 최고 품질 이머시브 영상 포맷이고 , macOS·visionOS 26 에서는 이를 만들고 검증 · 스트리밍하기 위한 Immersive Media Support 프레임워크와 새 Spatial

Audio 포맷 (ASAF/APAC) 을 제공합니다 . 이 세션은

- 메타데이터 구조 ( 카메라 / 샷 / 연출 )

- AIVU 파일 작성 / 검증

- HLS 스트리밍 규칙

- Mac↔Vision Pro 원격 프리뷰

- Apple Spatial Audio Format & APAC 코덱 을 한 번에 묶어서 설명합니다 .

- 🧱 메타데이터 & 구조 Apple Immersive Video Vision Pro 에서 최고 해상도 · 완전 몰입형 경험을 제공하는 포맷 .

- Blackmagic URSA Cine Immersive 같은 전용 스테레오 카메라와 , 렌즈 곡면에 맞춘 공 장 출하 캘리브레이션 데이터가 필요합니다 . 이 보정 정보가 메타데이터에 포함돼 정확한 투영 에 사용됩니다 .

- VenueDescriptor & AIMEData 하나의 “ 공간 (venue)” 안에 사용된 여러 카메라 구성을 묶는 타입이 VenueDescriptor.

- 이 안에 각 카메라의 캘리브레이션 , 엣지 블렌드 · 마스크( 알파로 경계 부분 제거 ), 카메라 원점 / 포지션 , 커스텀 백드롭 환경 등의 정보를 담습니다 .

- VenueDescriptor 는 AIMEData(Apple Immersive Media Embedded) 로 직렬화되 어 비디오 파일 메타데이터에 저장됩니다 .

- PresentationDescriptor & PresentationCommand 매 프레임마다 어떤 카메라 보정 / 마스크 / 연출을 쓸지 정의하는 동적 메타데이터.

- 주요 커맨드 예 :

  - 카메라 캘리브레이션 선택

- Shot flop: Y 축 기준 좌우 반전 ( 양안 스테레오를 자동으로 교정 ).

- Fade in/out: 비디오에 직접 굽는 것이 아니라 동적으로 렌더링.

- 🎬 제작 · 저장 워크플로 (AIVU 파일 ) AIVU(Apple Immersive Video Universal) 파일

- 최종 출력용 단일 파일 포맷 :

- 영상 트랙 + PresentationDescriptor가 섞인 메타데이터 트랙 +

- VenueDescriptor(AIMEData) 메타데이터 를 모두 포함하는 컨테이너입니다 .

  - visionOS 에서 Files 앱 → Quick Look 만으로 재생 가능 .

  - 다른 앱 / 서비스에 제작 결과를 넘길 때의 표준 교환 포맷으로 권장 .

  - Immersive Media Support + AVFoundation 읽기

- AIVU 에서 VenueDescriptor 읽기 :

- AVAsset 메타데이터 중 quickTimeMetadataAIMEData 식별자로 필터 → AIMEData 디코딩 → VenueDescriptor로 로드 .

- PresentationDescriptor 읽기 :

- 각 프레임 타임스탬프에 맞는 메타데이터 그룹을 얻고 , quickTimeMetadataPresentationImmersiveMedia 식별자로 필터 →

  - PresentationDescriptor 로 디코딩 .

- AIVU 쓰기 ( 저자 도구 / 편집 앱 ) 비디오 트랙의 projection kind를 AppleImmersiveVideo( 파라메트릭 프로젝션 ) 로 지정해

  - 야 함 .

  - VenueDescriptor에서 AIMEData 를 추출해 AIME 메타데이터 아이템으로 기록 .

- PresentationDescriptor에서 시간별 PresentationCommand 를 뽑아 , 각 프레임 타임에 맞는 타임드 AVMetadataItem 으로 기록 .

  - 완료 후 AIVUValidator.validate(url:) 로 유효성 검사 ( 에러 throw or true 반환 ).

- 🌐 HLS 스트리밍 & 배포 권장 비디오 스펙

- 코덱 : MV-HEVC

- 권장 해상도 : 4320×4320 per eye, 90 fps, 색공간 P3-D65-PQ.

- HLS 비트레이트 tier 예 :

- 평균 25–100 Mbps, 피크 50–150 Mbps ( 화질 vs 용량을 고려해 자체 프로파일 설계 ).

  - HLS 플로우

- AIVU( 또는 QuickTime 원본 ) 에서 비디오 + 메타데이터 트랙을 유지한 채 세그먼트로 쪼갠다 .

- (PresentationDescriptor 메타데이터 트랙이 반드시 따라가야 함 )

- VenueDescriptor.save(url:) 로 AIME 파일 생성 → HLS playlist 와 함께 배포 .

- 멀티 variant playlist 에서 :

- HLS 버전 12 이상 venue description data ID 태그로 AIME 파일 경로 지정

  - CONTENT-TYPE=immersive (fully immersive)

- 비디오 레이아웃 : stereo video + Apple Immersive Video projection 오디오는 APAC 코덱 ( 아래 참고 ) 을 사용해야 함 .

- 👀 Mac↔Vision Pro 원격 프리뷰 ImmersiveMediaRemotePreviewSender / Receiver Mac 에서 편집 중인 Apple Immersive Video 프레임을 Vision Pro 로 실시간 전송해 미리 보기할 수 있는 API.

- 다수의 Vision Pro 수신기를 동시에 지원 가능 .

- 이 경로는 저비트레이트 · 에디팅용 프리뷰 전용이며 , 최종 고품질 감상용은 아님 .

- visionOS 앱에서는 커스텀 컴포지터와 연결해 라이브 프리뷰 UI 를 구성 .

- 🔊 Apple Spatial Audio Format & APAC ASAF(Apple Spatial Audio Format) 선형 PCM + 풍부한 메타데이터로 구성된 새로운 Spatial Audio 포맷 .

- 특징 :

  - 수많은 포인트 소스 , 고차 앰비소닉스 (HOA) 등 고해상도 사운드 씬 지원 .

- 소스 위치 / 방향 + 리스너 위치 / 방향에 따라 런타임에서 완전히 적응적 렌더링 ( 사전 베이 크 없음 ).

  - Broadcast Wave 파일 (BWF) 내부에 담겨 제작 파이프라인에서 사용 .

- APAC(Apple Positional Audio Codec) 스트리밍 · 배포용 ASAF 전용 코덱.

- 모든 Apple 플랫폼 (Watch 제외 ) 에서 재생 가능하며 , Channels, Objects, HOA, Dialogue, Binaural, 인터랙티브 요소 및 확장 메타데이

  - 터까지 지원 .

  - 효율적이라 64 kbps 정도의 낮은 비트레이트에서도 이머시브 사운드 제공 가능 .

- HLS 에서는 #EXT-X-MEDIA 에 오디오 채널 정보 ,

  - #EXT-X-STREAM-INF 등에 APAC 오디오 코덱을 명시해야 함 .

- 제작 도구 ASAF→APAC 인코딩은

- Apple 의 Pro Tools 플러그인, Blackmagic DaVinci Resolve Studio 에서 지원 .



## ✅ 실무 체크리스트


- 촬영 : URSA Cine Immersive 등 Apple Immersive Video 대응 카메라 사용 + 카메라별 캘리브

- 레이션 유지

- 메타데이터 : VenueDescriptor + PresentationDescriptor 로

- 카메라 · 엣지 블렌드 · 샷 플랍 · 페이드를 모델링하고 AIMEData 및 프레임별

- PresentationCommand 로 기록

- 출력 : AIVU 파일 생성 후 AIVUValidator.validate 로 검증

- 스트리밍 : MV-HEVC(4320×4320@90fps) + 권장 비트레이트 tier +

- HLS playlist 에 버전 12 / AIME 파일 / fully immersive / stereo layout /

- AppleImmersiveVideo projection / APAC 오디오 태그 추가

- 프리뷰 : 편집툴 ↔ Vision Pro 간 ImmersiveMediaRemotePreviewSender/Receiver 로

- 로우 비트레이트 미리보기 구성

- 오디오 : 제작 중엔 ASAF, 배포 시엔 APAC 로 인코딩하여 HLS 에 통합
