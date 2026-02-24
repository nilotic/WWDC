# Go further with Metal 4 games

Go further with Metal 4 games https://developer.apple.com/videos/play/wwdc2025/211/



## ✨ 개요


이 세션은 Metal 4 + MetalFX 를 활용해 고급 게임 / 프로 앱에서

- Temporal 업스케일링 품질 튜닝,

- 프레임 인터폴레이션으로 초고주사율 구현,

- 레이 트레이싱 + 디노이즈 업스케일러로 레이트 수 절감 까지 한 번에 묶는 “ 풀 파이프라인 ” 최적화 방법을 다룹니다 .

- 🧱 MetalFX 업스케일링 심화 포인트

- 업스케일러 위치: 지터 적용 후 → 포스트 이펙트 전이 이상적 ( 모션블러 · 톤매핑보다 앞 ).

- 노출 (Exposure) 파라미터 업스케일러 입력 / 출력은 linear color.

- exposure × 입력 컬러 ≒ 톤매퍼에서 쓰는 노출과 맞아야 함 .

- 값이 틀리면 깜빡임 · 고스팅 발생 , 맞으면 업스케일러가 “ 보이는 밝기 ” 를 잘 이해함 .

- Exposure Debugger 환경 변수 MTLFX_EXPOSURE_TOOL_ENABLED 로 켜면 프레임 위에 체커보드 패턴 표시 .

- 최종 화면에서 항상 일정한 mid-gray 로 보이면 노출 세팅이 잘 맞은 것 .

- Dynamic Resolution 지원 이제 프레임마다 입력 해상도 변경 가능 ( 스케일 ≤ 2x 권장 ).

- Reactive Mask 투명 / 파티클 효과 ( 모션 · 깊이 텍스처에 안 들어가는 것 ) 를 마스크로 표시 .

- 고배율 / 저해상도에서 배경과 섞이거나 고스팅되는 문제를 줄임 .

- 다른 업스케일러용 마스크를 그대로 가져오면 오히려 품질이 나빠질 수 있으니 MetalFX 전용 으로 튜닝 .

- 🎞 MetalFX 프레임 인터폴레이션 & UI 처리

- 위치: 톤매핑 뒤 , UI 렌더링 지점 근처에서 프레임 N-1 과 N 사이 중간 프레임 생성 .

- 입력:

- 두 렌더 프레임 ( 이전 / 현재 ), 모션 벡터 + 깊이( 업스케일러와 공유 가능 ).

  - UI 처리 3 패턴

- Composited UI N (UI 없음 ), N(UI 있음 ) 둘 다를 인터폴레이터에 제공 .

- 인터폴레이터가 UI 를 “ 빼고 / 옮겨 ” 보지만 완벽 언블렌드는 불가능 → 가장 쉬운 도입용 .

- Offscreen UI UI 를 별도 텍스처에 렌더 , 인터폴레이터가 인터폴레이트된 프레임 + UI 텍스처를 함께 합성.

- 추가 로드 / 스토어를 줄일 수 있는 균형안 .

- Every-Frame UI 인터폴 프레임용 UI 도 직접 렌더 ( 코드 변경은 가장 크지만 UI 까지 완전 120/240Hz 느낌).

- ⏱ 프레임 페이싱 & Metal HUD 렌더 스레드 – GPU – Present 스레드 구조에서 , N 프레임 렌더 후 → 그 사이 시간에 인터폴 프레임을 프레젠트 , 다음 인터벌에 가장 최근의 렌더 프레임을 프레젠트 .

- Metal HUD

- Frame Interval 그래프로 페이싱 이상 여부 확인 :

  - 패턴이 랜덤 · 히스토그램 버킷이 2 개 초과 → 페이싱 문제 .

- 안정 시 : 목표 주사율이면 평평한 선, 낮은 주사율이면 규칙적인 패턴 ( 버킷 최대 2 개 ).

- 샘플 코드에 나오는 presentHelper 클래스로 로우레즈 렌더 → 업스케일 → UI → 인터폴레이트 → 적절한 타이밍 프레젠트까지 한 번에 관 리 .

- 🌲 Ray Tracing: Intersection Function Buffer & AS 플래그 Intersection Function Buffer(IFB) 여러 재질 · 레이 타입 ( 예 : Primary / Shadow) 에 대해 함수 포인터 테이블을 구성하는 Argument Buffer.

- 인스턴스 / 지오메트리에 intersectionFunctionTableOffset를 지정해 “ 이 레이 타입이 이 지오메트리를 맞으면 이 함수로 ” 를 매핑 .

- geometryMultiplier = 레이 타입 수, baseId = 현재 레이 타입 인덱스 ( 예 : Primary=0, Shadow=1) 조합으로 올바른 엔트리 선택 .

- DirectX Shader Binding Table 을 써본 경우 , 개념을 그대로 Metal 로 옮기되 주소 /stride 설정이 쉐이더 쪽에 있다는 점만 다름 .

- 새 Acceleration Structure 플래그 빌드마다 “Fast Intersection” vs “Low Memory” 등 목적에 맞게 선택 가능 .

- 다른 AS 와 동일 값일 필요 없음 → 라이트맵용 , 동적 오브젝트용 등 용도별 최적화 .

- 🌈 MetalFX Denoised Upscaler ( 레이 트레이싱 + ML 디노이즈 )

- 기존 파이프라인 : 여러 레이 트레이싱 효과 ( 조명 / 반사 / 그림자 등 ) 를 각각 디노이즈 → 합성 → 업스케 일 .

- 신규 : MetalFX Denoised Upscaler 업스케일 + 디노이즈를 하나의 ML 기반 스텝으로 처리 ,

  - 아티스트별 파라미터 튜닝 없이 다양한 씬에서 안정적인 결과 제공 .

- 필수 추가 입력 ( 노이즈 프리 버퍼 ) World-space Normals

- Diffuse Albedo( 확산 기저 색 ) Roughness( 선형 값 )

  - Specular Albedo( 프레넬 포함된 스페큘러 방사 근사 )

- 선택 입력 Specular Hit Distance( 레이 길이 )

- Denoiser Strength Mask( 디노이즈 불필요 구역 제외 ) Transparency Overlay( 알파 기반 , 업스케일만 적용할 색 섞기 )

- 통합 난관 & 팁 입력 자체가 너무 노이즈 많으면 안 됨 → NEE, importance sampling, 다중 라이트 샘플링

  - 등 기본 샘플링 최적화 먼저 .

  - 랜덤 넘버 상관관계( 공간 / 시간 ) 줄이기 .

  - 금속 재질은 색을 Specular Albedo 에, Diffuse Albedo 는 더 어둡게 .

  - 노멀은 반드시 world-space + signed 포맷 텍스처 사용 .



## ✅ 실전 적용 체크리스트


- Temporal 업스케일러를 지터 후 · 포스트 이펙트 전 단계에 배치

- MTLFX_EXPOSURE_TOOL_ENABLED 로 exposure 디버깅 후 톤매퍼와 일치시키기

- Dynamic Resolution + Reactive Mask 로 파티클 / 투명 효과 품질 유지

- MetalFX Frame Interpolator 도입 후 , 프로젝트에 맞는 UI 전략 (Composited / Offscreen /

- Every-Frame)선택

- Metal HUD 로 Frame Interval 그래프 확인 , 페이싱 / 프레젠트 로직 교정

- 레이 트레이싱은 Intersection Function Buffer + 새 AS 플래그로 포팅 / 최적화

- 경로 추적 효과에는 MetalFX Denoised Upscaler 를 도입하고 , Normals / Albedo / Roughness / Specular 버퍼를 올바른 포맷으로 공급
