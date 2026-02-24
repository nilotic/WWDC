# Discover machine learning & AI frameworks on Apple platforms

Discover machine learning & AI frameworks on Apple platforms https://developer.apple.com/videos/play/wwdc2025/360/



## ✨ 개요


Apple Intelligence 를 **UI 컴포넌트 (Writing Tools, Genmoji, Image Playground)** 와 프로그래매 틱 API로 앱에 녹이는 전체 경로를 소개합니다 . iOS 26 의 Foundation Models 프레임워크 ( 온디바이스

LLM), iOS 18.4 의 ImageCreator·Smart Reply, 그리고 Core ML·MLX·BNNSGraph까지 이어지 는 도구 지형을 하나로 정리합니다 . 핵심은 프라이버시 ( 온디바이스 · 오프라인 ), 간단한 통합, 비용 없이 광범

위한 활용입니다 .



## 🧰 지금 바로 붙일 수 있는 시스템 AI


- Image Playground / ImageCreator(iOS 18.4): 프롬프트 · 스타일만으로 이미지 생성 시트를 띄우거나 코드로 바로 생성 .

- Smart Reply API(iOS 18.4): 메시지 / 메일 컨텍스트를 키보드에 기증해 온디바이스 자동 응답 제

- 안 . ( 메신저 = 즉시 삽입 , 메일 =delegate 로 전달 ) 🧠 Foundation Models 프레임워크 (iOS 26)

- 용도: 요약 · 추출 · 분류 등 일상 작업 특화 LLM 을 앱 전반에서 오프라인 사용 . 계정 / 키 불필요 , 비용 없 음 .

- Guided Generation: 앱 타입을 “generable” 로 표시해 구조화 응답을 타입 안전하게 생성 ( 스키 마 대신 Swift 타입 ).

- Tool Calling: 날씨 · 캘린더 등 라이브 / 개인 데이터 접근 · 인용 · 행동 수행까지 확장 .

- 추가: 스트리밍 , 상태 유지 세션 , Xcode 통합 소개 .

- 👁 Vision & 📣 Speech 최신 업데이트

- Vision: 문서 인식( 레이아웃 단위 그룹화 ) 과 렌즈 오염 ( 얼룩 ) 감지 추가 .

- Speech: 새 SpeechAnalyzer API 와 고성능 STT 모델로 장문 · 원거리 음성 인식에 유리 .



## 🧪 모델 가져오기 · 최적화 워크플로


- Core ML / coremltools: 변환 + 연산 결합 · 중복 제거 같은 자동 최적화, 양자화 / 미세조정 등 압축 기법 제공 .

- Xcode: 디바이스별 지연 / 로드 시간, 연산 배치 위치 (CPU/GPU/ANE), 전체 그래프 시각화로 디버 깅 · 튜닝 강화 .

- BNNSGraph: Graph Builder로 CPU 실시간 전처리 / 후처리 파이프라인을 손쉽게 구성 .

- ⚡ MLX & Apple Silicon 생태계

- MLX: 통합 메모리 모델에 맞춘 수치 /ML 프레임워크 —로컬 LLM 추론 · 파인튜닝을 한 줄로 실행 , 병 렬 CPU/GPU 운용 .

- Hugging Face MLX 커뮤니티: 최신 프런티어 모델을 손쉽게 실행 . PyTorch/JAX 는 Metal 백엔 드로 지원 .



## ✅ 실무 체크리스트


- 텍스트 기능엔 Writing Tools/Smart Reply 먼저 접목 → UX 변화 최소로 AI 효익 제공

- 요약 / 추출 / 분류는 Foundation Models로 오프라인 처리 , Tool Calling으로 최신 / 개인 데이터 보

- 강

- 커스텀 모델은 coremltools→Xcode 프로파일링 후 , 필요 시 양자화 ·BNNSGraph 전처리 적용

- Mac 개발 환경에선 MLX로 대형 모델 실험 → 제품화 땐 Core ML 경로로 이식
