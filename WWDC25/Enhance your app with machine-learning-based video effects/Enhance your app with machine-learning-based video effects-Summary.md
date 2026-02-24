# Enhance your app with machine-learning-based video effects

Enhance your app with machine-learning- based video effects https://developer.apple.com/videos/play/wwdc2025/300/



## ✨ 개요


Video Toolbox 가 VTFrameProcessor API로 iOS 26 까지 확장되었습니다 . ML 기반 프레임 보간 · 슈 퍼해상도 · 모션 블러 · 시계열 노이즈 제거 등을 저지연 / 고품질로 제공하며 , 앱은 프레임 단위로 입력 · 출력을

주고받는 세션 기반 처리를 사용합니다 . wwdc2025-300 🎛 제공 효과 ( 무거운 편집 ↔ 실시간 )

- 편집용: 프레임레이트 변환 ( 슬로모션 포함 ), 슈퍼 레졸루션 ( 이미지 / 비디오용 2 종 ), 모션 블러 , 시계열 노이즈 필터 .

- 실시간용 ( 저지연 ): 프레임 보간 ( 옵션으로 업스케일 ), 저지연 슈퍼 레졸루션 ( 화상회의 품질 개선 ).

- wwdc2025-300 🔧 통합 흐름 (2 단계 )

- 세션 시작: 효과에 맞는 Configuration 생성 ( 입출력 크기 · 품질 · 리비전 등 ) → VTFrameProcessor 획득 .

- 프레임 처리: Parameters에 소스 / 타깃 버퍼 세팅 후 process 호출 . 버퍼는 호출자가 마련하며 , CVPixelBuffer 풀로 관리합니다 . wwdc2025-300



## 🧩 편집 시나리오 팁


- 프레임레이트 변환: VTFrameRateConversionConfiguration + …Parameters 사용 .

- interpolationPhase 배열 크기로 삽입 프레임 수 제어 , submissionMode로 순차 / 랜덤 전송 지 정 . wwdc2025-300

- 모션 블러: VTMotionBlurConfiguration/Parameters; 이전 / 다음 프레임( 클립 끝단은 nil) 제공 , 강도 1–100. wwdc2025-300 ⚡ 실시간 ( 컨퍼런싱 / 스트리밍 ) 팁

- 저지연 슈퍼 해상도: LowLatencySuperResolutionScalerConfiguration/Parameters— 입력 크 기와 스케일 비율만 지정하면 됨 .

- 저지연 프레임 보간: LowLatencyFrameInterpolationConfiguration/Parameters—프레임률 배 가 + 업스케일 결합 필터도 제공 . wwdc2025-300 👀 옵티컬 플로우 선택지

- 사전 계산으로 렌더 단계 성능 확보 : VTOpticalFlowConfiguration/Parameters.

- 온더플라이 계산: Configuration 에서 pre-computed flow = false로 두면 프레임 처리 시 내부 계산 . wwdc2025-300



## 🗺 API 클래스 맵 ( 요약 )


- 공통 : VTFrameProcessor, …Configuration, …Parameters( 효과별 페어 ).

- 편집 : VTFrameRateConversion…, VTMotionBlur…, ( 슈퍼 레졸루션 , TNR 등 ).

- 실시간 : LowLatencySuperResolutionScaler…, LowLatencyFrameInterpolation….

- wwdc2025-300



## ✅ 실무 체크리스트


- 목표에 맞는 효과 ( 편집 / 실시간 ) 를 우선 선택

- CVPixelBuffer 풀로 입 · 출력 버퍼 수명 주기 관리

- 프레임 보간 시 interpolationPhase·submissionMode 적절히 설정

- 컨퍼런싱은 저지연 슈퍼 레졸루션 / 보간 조합 검토

- 옵티컬 플로우는 사전 계산 vs 온더플라이 중 워크플로에 맞게 선택 wwdc2025-300
