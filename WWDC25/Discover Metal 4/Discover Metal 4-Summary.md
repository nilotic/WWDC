# Discover Metal 4

Discover Metal 4 https://developer.apple.com/videos/play/wwdc2025/205/



## ✨ 개요


Metal 4 는 명령 인코딩 · 메모리 · 리소스 · 컴파일 전 과정을 재설계해 더 높은 성능 · 병렬성 · 이식성을 제공합니 다 . 새 명령 구조, 명시적 메모리 관리, 리소스 레지던시 세트, Placement Sparse 리소스, Barrier API,

유연한 파이프라인, 텐서 ·ML 인코더, 그리고 MetalFX( 프레임 보간 · 디노이즈 ) 가 핵심 업데이트입니다 .

기기는 M1 이상 ·A14 이상에서 지원됩니다 .

🧱 명령 구조 & 메모리 MTL4CommandQueue / MTL4CommandBuffer / MTL4CommandAllocator로 재구

- 성 : 커맨드 버퍼를 큐와 분리 생성해 병렬 인코딩이 쉬워지고 , Allocator로 버퍼 메모리를 직접 관리 합니다 .

- 통합 컴퓨트 인코더( 블릿 ·AS 빌드 포함 ) 와 MTL4RenderCommandEncoder의 Attachment Map으로 하나의 인코더에서 색상 첨부 전환을 유연하게 처리합니다 .



## 📦 리소스 모델 ( 대규모 씬 대비 )


- MTL4ArgumentTable: 바인드리스 패턴을 쉽게 구성 ( 필요 바인딩만 테이블에 정의 , 스테이지 간 공유 가능 ).

- Residency Set: GPU 가 접근할 리소스 집합을 선언해 레지던시 관리 비용을 크게 절감 ( 큐에 부착 해 프레임마다 재사용 ).

- Placement Sparse 리소스 + Placement Heap: 필요한 페이지만 매핑해 메모리 발자국을 탄 력적으로 제어( 스트리밍에 유리 ).

- 🔒 동기화 (Barrier API)

- 스테이지 간 ( 예 : Dispatch → Fragment) 종속을 저오버헤드 배리어로 선언해 올바른 순서와 데이터 일 관성을 보장합니다 . 샘플 시나리오 ( 그레이스케일 변환 후 렌더 ) 처럼 공유 텍스처를 안전하게 넘겨줄 수 있습 니다 .

- 🧵 셰이더 컴파일 & 파이프라인

- MTL4Compiler( 컴파일 컨텍스트 ): 디바이스와 분리돼 언제 / 어디서 컴파일할지 명시적 제어 (QoS 상속 · 우선순위 반영 ).

- Flexible Render Pipeline States: 공통 Metal IR을 한 번 컴파일하는 비특화 파이프라인을 만 든 뒤 , 색상 상태 등으로 빠르게 특화해 재컴파일 비용 절감.

- 파이프라인 수확 ( 하베스팅 ) 흐름 개선으로 온디바이스 컴파일 제거 /AOT 최적화를 쉽게 구성 .

- 🤖 ML 통합 ( 그래픽스 + 러닝 ) 텐서가 1 급 리소스로 추가되어 다차원 데이터 접근을 간단화 .

- 머신러닝 커맨드 인코더로 Core ML 패키지를 Metal 네트워크로 변환 · 실행 ( 배리어 · 아규먼트 테이블 과 동일 모델 ).

- 소형 네트워크는 셰이더 내 텐서 연산 (Metal Performance Primitives 기반 ) 으로 한 번의 디스 패치에 통합해 캐시 / 스레드 메모리를 공유 , 오버헤드를 최소화 .



## 🖼 MetalFX 업데이트


업스케일링에 더해 프레임 보간으로 초고주사율 달성 가능 .

레이트레이싱 저샘플 이미지를 업스케일 단계에서 디노이즈해 고품질 / 고성능을 양립 .

🛠 도구 & 도입 경로 Metal Debugger/Validation/HUD/System Trace가 Metal 4 를 지원 .

Xcode 26 템플릿(Metal 4 게임 ) 과 샘플 코드 제공 — 기존 앱은 컴파일러 → 명령 인코딩 → 리소스 관리 순으로 점진 도입 권장 .

MTLEvent로 기존 Metal 큐와 Metal 4 큐 간 작업을 동기화하며 Placement Sparse 업데이트 를 삽입 가능 .



## ✅ 실무 체크리스트


- 커맨드 버퍼 생성을 디바이스 기원으로 전환하고 Allocator로 메모리 사용 추적

- Argument Table + Residency Set으로 드로우당 바인딩 · 레지던시 오버헤드 절감

- Barrier API로 스테이지 종속을 명시 ( 특히 컴퓨트 → 렌더 파이프라인 )

- MTL4Compiler + Flexible Pipelines로 재컴파일 / 런타임 지연 최소화

- 대형 네트워크는 ML 인코더, 소형은 셰이더 내 텐서 연산으로 통합

- MetalFX( 보간 · 디노이즈 ) 로 해상도 · 프레임레이트 목표 달성
