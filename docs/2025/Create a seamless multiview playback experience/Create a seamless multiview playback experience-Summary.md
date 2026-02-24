# Create a seamless multiview playback experience

Create a seamless multiview playback experience https://developer.apple.com/videos/play/wwdc2025/302/

🌟 개요

- 멀티뷰 플레이백 (Multiview): 하나의 앱에서 여러 오디오 · 비디오 스트림을 동시에 재생 .

- 활용 예시 :

- 동일 이벤트의 여러 시점 ( 예 : 스포츠 경기 , 콘서트 , 키노트 + 수어 )

- 서로 다른 이벤트 동시 재생 ( 예 : 올림픽 육상 + 수영 ) 🎯 주요 기능과 API 🔗 AVPlaybackCoordinationMedium 여러 AVPlayer 동기화 재생 지원 .

- 기능:

  - 재생 / 일시정지 , 시킹 (seek), 속도 변화 , 버퍼링 , 중단 , 시작 타이밍까지 동기화 .

  - 하나의 플레이어 상태 변화 → Coordination Medium → 다른 플레이어에 전달 .

- 구현 흐름:

- AVPlayer 각각에 AVPlaybackCoordinator 연결 Coordination Medium 생성

  - coordinate()로 플레이어 등록

- 활용 예시: 스포츠 경기 멀티 앵글 , 수어 스트림 , PiP, Now Playing 연동 .

- 📡 AVRoutingPlaybackArbiter AirPlay· 외부 재생 장치에서 올바른 스트림 선택 · 전송 .

- 기능:

  - 단일 영상 / 오디오만 재생 가능한 외부 장치 (Apple TV, HomePod) 에서 우선순위 지정 .

- preferredParticipantForExternalPlayback ( 영상 ) preferredParticipantForNonMixableAudioRoutes ( 오디오 )

- 활용 예시:

- Apple TV 에 조망 뷰 송출 , iPad 에 클로즈업 뷰 유지 HomePod 오디오 라우팅 시 특정 뷰 오디오만 재생 .

- 📶 네트워크 리소스 우선순위 (networkResourcePriority) 네트워크 제한 시 중요한 스트림 화질 우선 유지 .

- 설정:

- .high → 고품질 유지 필수 .low → 화질 저하 허용

- 활용 예시:

- 경기장 전체 조망 뷰는 High, 관중 클로즈업 뷰는 Low → 네트워크 제한 시 클로즈업 먼저 화 질 하락 .

- 🏁 결론 🔗 AVPlaybackCoordinationMedium → 멀티 플레이어 완벽 동기화

- 📡 AVRoutingPlaybackArbiter → AirPlay· 외부 재생 최적 라우팅 📶 networkResourcePriority → 중요한 스트림 화질 우선

  - 세 가지를 조합해 스포츠 경기 ·ASL 통역 · 콘서트 등 몰입감 있는 멀티스트림 구현 가능 .
