# Enhance your app’s audio recording capabilities

Enhance your appʼs audio recording capabilities https://developer.apple.com/videos/play/wwdc2025/251/



## ✨ 개요


- iOS 26 의 오디오 업데이트를 한 번에 정리합니다 : 앱 내 입력 장치 선택 UI(AVInputPickerInteraction), AirPods 고품질 녹음 모드, FOA(First-Order Ambisonics) 기 반 공간 오디오 캡처 / 파일 포맷, MovieFileOutput+AudioDataOutput 동시 사용, 그리고 Cinematic 프레임워크 / 오디오 유닛을 통한 Audio Mix( 대화 ↔ 배경 분리 ) 입니다 . wwdc2025-251

- 🎛 입력 장치 선택 (UI 내장 ) AVInputPickerInteraction으로 설정 앱으로 가지 않고 앱 안에서 입력 장치를 고를 수 있습니다 . 목록에 는 실시간 레벨 미터와 마이크 모드 선택이 포함되고 , 선택은 세션 간 기억됩니다 . 사용 전 오디오 세션 구성 이 선행되어야 합니다 . wwdc2025-251 🎧 AirPods 고품질 녹음 콘텐츠 제작자를 위해 고샘플레이트 · 고품질 블루투스 녹음 옵션이 추가되었습니다 .

- AVAudioSession: bluetoothHighQualityRecording 카테고리 옵션 추가 ( 지원 안 되면 HFP 로 폴백 ).

- AVCaptureSession: 전용 프로퍼티로 세션 차원에서 활성화 가능 .

- 활성화 시 시스템 입력 메뉴에 고품질 AirPods가 표시되며 , AirPods 스템 제스처로 녹음 시작 / 정지 도 지원됩니다 . wwdc2025-251 🌐 공간 오디오 (FOA) 캡처 & 포맷 iPhone 마이크 어레이로 녹음한 3D 소리를 Ambisonics(FOA, W+XYZ) 로 저장합니다 .

- AVAssetWriter 경로에선 스테레오 +FOA 두 개의 오디오 트랙과 메타데이터 트랙이 필요하며 , FOA/ 스 테레오용 두 개의 AudioDataOutput(ADO) 를 병행해 받아야 합니다 .

- spatialAudioChannelLayoutTag(Stereo/FOA) 와 AVCaptureSpatialAudioMetadataSampleGenerator로 타임드 메타데이터를 생성합니다 . wwdc2025- 251 🗂 파일 컨테이너 & 코덱

- QTA(.qta): 오디오 전용 QuickTime 포맷 ( 오디오 트랙 다중 / 대체 트랙 그룹 지원 ).

- 트랙 구성 예 : AAC 스테레오 + APAC(Apple Positional Audio Codec) 공간 오디오 + 메타데 이터, ProRes 녹화 시엔 PCM. 스테레오는 호환성을 위한 백업 경로입니다 . wwdc2025-251 🔁 캡처 파이프라인 동시 사용 iOS 26 에선 AVCaptureMovieFileOutput과 AVCaptureAudioDataOutput을 동시에 운용할 수 있습니다 .

- 즉 , 파일 기록과 실시간 파형 / 효과 처리를 병행해 “ 보여주는 ” 녹음 경험을 만들 수 있습니다 . wwdc2025- 251 🎚 재생 · 편집 : Audio Mix( 대화 / 배경 분리 ) Cinematic 프레임워크로 대화와 배경 음을 가르는 Audio Mix를 제어합니다 .

- 파라미터: effectIntensity(0…1), CNSpatialAudioRenderingStyle(Cinematic/Studio/In- Frame + 6 개 추가 모드 ).

- AVPlayer: CNAssetSpatialAudioInfo.audioMix() 로 AVAudioMix 생성해 AVPlayerItem.audioMix에 적용 .

- 오디오 유닛: AUAudioMix로 플레이어 없이 처리 가능 ( 입력 =FOA 4ch, 출력 = 대화 1ch + FOA 4ch 또는 5.1/7.1.4 등 ). EnableSpatialization/SpatialMixerOutputType로 출력 레이아웃을 제어합 니다 .

- 메타데이터 적용: 녹음 종료 시 생성된 튜닝 파라미터(CFData) 를 파일에서 읽어 SpatialAudioMixMetadata로 AU 에 주입 . wwdc2025-251



## ✅ 실무 체크리스트


- 앱에 입력 선택 버튼 추가 → AVInputPickerInteraction.present()

- AirPods HQ 녹음: AVAudioSession/AVCaptureSession 에서 옵션 활성화

- FOA 캡처: ADO 2 개 (FOA+Stereo) + AVAssetWriter 2 inputs + 메타데이터 트랙

- 동시 운용: MovieFileOutput + AudioDataOutput 로 기록 · 실시간 처리 병행

- Audio Mix: UI 로 스타일 / 강도 노출 , AVPlayer 또는 AUAudioMix 파이프라인 구성 , 메타데이터 주

- 입 잊지 않기 wwdc2025-251
