# Get started with MLX for Apple silicon

Get started with MLX for Apple silicon https://developer.apple.com/videos/play/wwdc2025/315/



## ✨ 개요


MLX는 Apple Silicon 용으로 설계된 오픈소스 배열 /ML 프레임워크입니다 . NumPy 와 유사한 간단한 Python API(Swift·C++·C 도 제공 ), 통합 메모리 기반 가속 , 지연 (lazy) 실행, 함수 변환 ( 자동 미분 · 컴파

일 ), 양자화, 분산 실행 (mx.distributed) 등을 통해 로컬에서 대규모 모델 추론 · 미세조정까지 수행할 수 있습니다 . pip 한 줄로 시작하고 ( pip3 install mlx ), MLX-LM/Swift API· 예제도 함께 제공됩니다 .

🧠 핵심 개념

- 통합 메모리 & 디바이스 지정 실행: 배열은 CPU/GPU 가 공유하는 통합 메모리에 할당 , 연산 호출 시 CPU/GPU 중 어디서 돌릴지 지정합니다 ( 동시에 병렬 실행 가능 ).

- 지연 실행: 연산 호출 시 즉시 계산하지 않고 그래프만 구성, 필요 시 평가 (mx.eval) 하여 불필요 계산 을 제거합니다 .

- 함수 변환: mx.grad( 자동 미분 , 합성 가능 ), mx.compile( 커널 퓨전으로 실행 최적화 ) 등 함수 → 함수 변환으로 성능 · 개발 생산성을 동시에 확보합니다 .

- 🚀 고성능 도구

- mx.fast: Transformer 핵심 블록 ( 스케일드 어텐션 , 정규화 등 ) 의 고튜닝 구현을 제공 — 일반 구현 대비 노드 수 ↓· 속도 ↑. 필요 시 사용자 Metal 커널을 추가해 JIT 로 실행할 수 있습니다 .

- 양자화: mx.quantize/mx.quantized_matmul로 4–16bit까지 메모리 · 대역폭 요구를 크게 줄이고 TPS 를 높입니다 . 모듈 단위 양자화 (nn.quantize) 와 혼합 정밀 제어도 지원합니다 .

- 분산 실행: mx.distributed의 all_sum 등 통신 연산과 mlx.launch 런처로 Thunderbolt/ 이더넷 다중 머신에 연산을 분산합니다 .

- 💻 사용 시작 ( 파이썬 /Swift)

- Python: pip3 install mlx → 배열 연산 , 자동 미분 , mx.fast/ 양자화 / 분산까지 NumPy·PyTorch 유사 감각으로 사용 .

- Swift: Xcode 에서 MLX Swift 패키지 추가만으로 동일 철학 ( 통합 메모리 · 가속 · 예제 ) 을 활용 , Python API 와 유사한 사용성을 제공합니다 .



## 🧩 LLM 워크플로


MLX-LM 패키지로 텍스트 생성 / 미세조정 (LoRA 포함 ), KV 캐시로 대화 맥락 유지 · 지연 감소 , 혼합 양자화로 메모리 / 속도 최적화 . 대형 모델도 Apple Silicon 로컬에서 처리 가능 ( 메모리 용량에 따라

규모 선택 ).



## ✅ 체크리스트


- pip3 install mlx 후 기본 배열 · 자동 미분 확인

- 병목 함수는 mx.compile 적용 → 부족하면 mx.fast 대체 검토

- 양자화 (4–16bit) 로 메모리 ·TPS 개선 , 모듈 선택적 적용

- 멀티 머신이면 mx.distributed + mlx.launch 구성

- Mac 앱 · 멀티 플랫폼이면 MLX Swift 패키지 연동
