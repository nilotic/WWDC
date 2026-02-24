# Explore large language models on Apple silicon with MLX

Explore large language models on Apple silicon with MLX https://developer.apple.com/videos/play/wwdc2025/298/



## ✨ 개요


MLX/MLX-LM 으로 Apple Silicon 에서 대형 언어 모델 (LLM) 을 로컬 실행 · 양자화 · 미세조정 (LoRA)· 배 포까지 한 흐름으로 처리하는 방법을 소개합니다 . Python/CLI/Swift API 를 모두 제공하며 , 통합 메모리 +

Metal 가속을 활용합니다 .

🧠 MLX 핵심 포인트

- 언어 / 인터페이스: Python·Swift·C++·C API + CLI 툴 (mlx_lm).

- 아키텍처 장점: 통합 메모리로 CPU/GPU 가 동일 버퍼를 공유 , Metal 로 GPU 가속 .

- 규모 예시: 670B 모델 (4.5-bit) ≈ 380GB 메모리 요구 → M3 Ultra 512GB에서 상호작용 생성 데모 .

- 📝 텍스트 생성 ( 시작하기 )

- CLI: pip install mlx-lm 후 mlx_lm.generate -m <hf/model> -p "< 프롬프트 >" (temperature, top-p, max-tokens 등 옵션 지원 ).

- Python: from mlx_lm import load, generate → model, tokenizer = load(...) → generate(model, tokenizer, prompt, ...).



## 💬 대화 유지 : KV 캐시


**make_prompt_cache()** 로 캐시 생성 → 다회 호출에서 문맥을 이어받아 토큰 생성 비용 절감 ( 멀 티턴 챗봇에 적합 ).

🧮 양자화 · 변환 ( 한 줄 명령 )

- 명령형: mlx_lm.convert -m <hf/model> -q <bits> -o <out> → 다운로드 · 변환 · 저장을 원스텝 처리 .

- 미세 제어: 레이어별 다른 비트수 적용 ( 예 : 임베딩 / 최종 투영 =6-bit, 나머지 =4-bit) 같은 predicate 지정 가능 .



## 🧪 미세조정 ( 로컬 학습 )


- 방식: 풀 파인튜닝 또는 LoRA( 저랭크 어댑터 ).

- 명령형 LoRA: mlx_lm.lora -m <model> -d <dataset> --epochs ... ( 양자화된 4-bit 모델 위에서도 학습 가능 ).

- 구성 파일로 배치 크기 / 스케줄 / 옵티마이저 등 세부 튜닝 지원 .

- 배포: mlx_lm.fuse로 어댑터 융합 → 단일 모델 생성 ( 양자화 상태 유지 ).



## 🧰 Swift 통합


수십 줄 예제로 양자화 모델 로드 → 토크나이즈 → 생성 루프 구현 .

KV 캐시 / 토큰 이터레이터로 멀티턴 대화와 세밀 제어 지원 .



## ✅ 실무 체크리스트


- 빠른 시작 : pip install mlx-lm → mlx_lm.generate로 로컬 추론 검증

- 모델 최적화 : mlx_lm.convert로 4~6-bit 혼합 양자화 적용

- 대화 제품화 : KV 캐시 도입 , 프롬프트 길이 · 지연 최적화

- 도메인 적응 : mlx_lm.lora로 사내 데이터 기반 미세조정 ( 클라우드 불필요 )

- 배포 간소화 : mlx_lm.fuse로 융합 모델 산출 후 Hugging Face 업로드

- 앱 연동 : Swift 예제 참고해 Mac 앱에 온디바이스 LLM 삽입
