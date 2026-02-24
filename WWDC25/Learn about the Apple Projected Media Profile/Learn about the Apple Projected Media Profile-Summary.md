# Learn about the Apple Projected Media Profile

Learn about the Apple Projected Media Profile https://developer.apple.com/videos/play/wwdc2025/297/



## ✨ 개요


visionOS 26 에서 Apple Projected Media Profile(APMP) 로 180°/360°/ 와이드 FOV 영상을 표 준 형식으로 다루고 , APAC(Apple Positional Audio Codec) 으로 이머시브 오디오를 붙이는 전체 흐

름을 설명하는 세션입니다 .

QuickTime/MP4 안에서의 투영 메타데이터 구조, Core Media·VideoToolbox·AVFoundation 업데 이트, APMP 변환 · 재생 · 편집 ·HLS 스트리밍까지 한 번에 다룹니다 .

🌐 투영 방식 & APMP 기본 투영 종류 2D/3D/Spatial: rectilinear( 일반 투영 ) 360°: equirectangular(–180°~180°, –90°~90°)

180°: half-equirectangular(–90°~90° 시야 )

- Wide FOV: ParametricImmersive( 카메라 intrinsics + 렌즈 왜곡 파라미터 기반 ) ParametricImmersive 에서는 3×3 카메라 행렬 (K) 로 초점거리 · 광학 중심 · 기울기 등을 표현하고 반지름 왜곡 (radial), 접선 왜곡 (tangential), 시야 제한 , 프레임 보정 등을 포함해 광각 / 어안 렌즈의 곡선을 정확히 펴 준 투영을 구성합니다 .



## 📦 QuickTime/MP4 내 APMP 시그널링


QuickTime/ISOBMFF(MP4) 구조 안에서 APMP 는 확장 박스 (box) 로 표현됩니다 .

vexu(Video Extended Usage) 안에 새로운 박스들이 추가됨 .

- projection box: equirectangular / half-equirectangular / ParametricImmersive 중 어떤 투영인지 표시 .

- lens collection box: ParametricImmersive 용 intrinsics·extrinsics· 렌즈 왜곡 파라미 터 .

- view packing box: 스테레오 프레임 패킹 (side-by-side / over-under) 방식 .

- 예시 360 모노 : projectionKind = equirectangular 하나로 충분 .

- 180 스테레오 : projectionKind = half-equirectangular + stereo view 박스 필요 .

- 🎥 캡처 · 편집 · 변환 워크플로 캡처 디바이스 예시 180 스테레오 : Canon EOS VR 360: GoPro MAX, Insta360 X5

- 와이드 FOV: GoPro HERO 13, Insta360 Ace Pro 2 등 APMP- 지원 워크플로

- 카메라 / 벤더 소프트웨어에서 180/360/ 와이드 FOV 캡처 및 스티칭 · 안정화 · 스테레오 보정.

- 에디터가 APMP 를 지원한다면 MOV/MP4 를 APMP 시그널 포함해 직접 내보내기.

- AirDrop·iCloud 로 Vision Pro 로 전달 .

- APMP 미지원 워크플로

- 기존 spherical metadata( 메타데이터 V1/V2) 로 180/360 equirectangular 파일을 만 든 후

  - macOS avconvert 유틸리티로 APMP 포맷으로 변환 → Vision Pro 전송 .



## 🧰 APMP 읽기 · 편집 · 작성 API


📥 읽기 & 식별 AVFoundation/CoreMedia 가 APMP 투영을 직접 인식하도록 업데이트됨 .

- 기존 구형 spherical 컨텐츠는 AVAsset 생성 시 옵션 ShouldParseExternalSphericalTags 를 주면

  - 자동으로 APMP 와 동등한 formatDescription extension 을 합성해 줌 .

  - convertedFromExternalSphericalTags 존재 여부로 변환 여부 확인 .

  - 🔁 wide-FOV 변환

- ImmersiveMediaSupport.ParametricImmersiveAssetInfo 사용 :

- GoPro/Insta360 같은 카메라 메타데이터를 읽어 ParametricImmersive projection + 렌즈 파라미터가 포함된 format description 을

  - 생성 .

  - isConvertible로 지원 카메라인지 확인 → 가능하면 트랙의 format description 을 교체 .

- ✂ 편집 ( 스테레오 지원 ) CMTaggedDynamicBuffer + CMTag

- 버퍼 ( 예 : CVPixelBuffer) 에 왼쪽 눈 / 오른쪽 눈 , StereoView 등 태그 부여 .

- 스테레오 샘플을 태그된 버퍼 쌍으로 그룹화 .

- AVVideoComposition 출력 버퍼 형식 (outputBufferDescription) 을 “ 스테레오 태그 버퍼 쌍 ” 으로 선언 .

- 컴포지터가 태그된 버퍼를 생성 후 finish(with: taggedBuffers) 식으로 전달 .

- ✍ 쓰기 AVAssetWriter 사용 시

- AVVideoCompressionPropertiesKey 안에 projection kind( 예 : equirectangular) 를 지정 해 작성 시부터 APMP 투영 정보를 포함.

- 📡 HLS 스트리밍 & 인코딩 설정 권장 인코딩 (visionOS 재생 기준 )

- 코덱 : HEVC Main / Main10 (4:2:0)

- 색영역 : Rec.709 또는 P3-D65

- 해상도 :

- 모노 360: 7680×3840@10bit

- 스테레오 : 4320×4320 per eye

- 프레임레이트 : 8K 모노 10bit 또는 4K 스테레오 10bit 는 30fps 권장

- 비트레이트 : 피크 150 Mbps 이하 권장 .

- HLS 매니페스트 ( 예 : 180 스테레오 ) EXT-X-STREAM-INF 의 REQ-VIDEO-LAYOUT 으로 stereo + half-equirectangular 등 투영 / 스테레오 정보를 명시 .

- 초기 map 세그먼트에도 projectionKind + stereo view 가 들어간 formatDescription 확장 필요 .

- AVQT(Advanced Video Quality Tool) 3D/Spatial/APMP(180/360) 지원으로 업그레이드 .

- equirectangular/half-equirectangular 를 이해하는 품질 측정 → HLS tier 튜닝에 활용 .

- 🔊 APAC(Apple Positional Audio Codec) & 앰비소닉스 APAC Ambisonics 포함 풀 스피어 Spatial Audio 를 효율적으로 인코딩하는 새 코덱 .

- 모든 Apple 플랫폼 (Watch 제외 ) 에서 디코드 지원 .

- Ambisonics 기본 다수의 마이크 배열로 3D 음장을 캡처 → 구면조화 (spherical harmonics) 성분으로 변환 .

- 차수 (order) 에 따라 채널 수 증가 :

- 1 차 : 4 채널 ( 무지향 + 3 축 방향 ) 2 차 : 9 채널

- 3 차 : 16 채널 ( 공간 해상도 ↑) AVAssetWriter 로 APAC 인코딩

  - 1·2·3 차 앰비소닉스 모두 지원 .

- 권장 비트레이트 ( 앰비소닉스 + APMP 조합 ):

- 1 차 : 약 384 kbps 3 차 : 약 768 kbps

  - APAC 오디오는 HLS 로 세그먼트 스트리밍 가능 .



## ✅ 실무 적용 체크리스트


- 180/360/ 와이드 FOV 캠으로 촬영 시 APMP 시그널 유지하는 워크플로 ( 벤더 유틸 + FCP 등 ) 정립

  - 기존 180/360 equirectangular 자산은

- spherical metadata → AVFoundation 변환 옵션 → APMP formatDescription 으로 마

- 이그레이션

- 와이드 FOV 액션캠 자산은 ParametricImmersiveAssetInfo.isConvertible 검사 후

- 렌즈 파라미터가 포함된 ParametricImmersive projection 으로 변환

- 스테레오 편집 파이프라인에 CMTaggedDynamicBuffer + AVVideoComposition 도입

- HLS 매니페스트에 REQ-VIDEO-LAYOUT( 투영 + 스테레오 ), map 세그먼트의

- projection/stereo 확장 포함

- Spatial Audio 는 APAC + (1~3 차 ) 앰비소닉스 로 인코딩 , 비트레이트는 384~768 kbps 범위로

- 설계
