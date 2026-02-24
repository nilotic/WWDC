# Explore Metal 4 games

Explore Metal 4 games https://developer.apple.com/videos/play/wwdc2025/254/



## ✨ 개요


Metal 4 의 명령 인코딩 단순화 ( 렌더 / 컴퓨트 2 종 ), 메모리 · 리소스 스케일 관리 (Argument Tables·Residency Sets·Sparse Placement), 파이프라인 로딩 최적화 ( 유연한 파이프라인 · 멀티스

레드 컴파일 · 사전 컴파일 ) 를 게임 엔진 관점에서 정리합니다 . 목표는 인코딩 핫패스 비용 ↓, 로딩 지연 ↓, 대 규모 자산 · 파이프라인을 안정적으로 처리하는 것 .

🔧 인코딩 효율 ( 핵심 테크닉 )

- 단일 컴퓨트 인코더: 디스패치 · 블릿 ·AS 빌드를 한 인코더에서 처리하고 , Pass Barrier로 순서 의존 만 표현 . 병렬성 극대화 .

- 컬러 어태치먼트 매핑: 파이프라인마다 다른 컬러 타깃이 필요해도 인코더 유지한 채 맵만 교체 → 인 코더 개수 · 패스 수 감소 .

- Command Allocator + 멀티 커맨드 버퍼: 스레드별 Allocator 로 동시 인코딩, GPU 완료 후 Reset해 메모리 재사용 . Suspend/Resume로 여러 렌더 인코더를 단일 패스로 병합 .

- 🧱 리소스 스케일 관리 Argument Tables × Argument Buffers: 바인드리스 스타일로 수천 리소스를 인덱스 기반 바 인딩 , 프레임 전 준비로 핫패스 부담 ↓.

- Residency Sets: 파이프라인 / 버퍼 / 텍스처 / 드로어블을 세트 단위로 GPU 가시화 . 큐에 부착 ( 안 변 함), 커맨드 버퍼에 부착 ( 자주 변함 ) 선택 . CAMetalLayer 의 동적 세트도 큐에 한 번만 추가 .

- Queue Barriers: 스테이지별(dispatch→fragment 등 ) 의존만 동기화해 과동기화 방지· 동시성 유지 .

- TextureViewPools: 사전 메모리 풀에 가벼운 뷰를 인덱스로 생성 → 동적 할당 없이 대량 뷰 스트 리밍 .

- Placement Sparse 리소스 /Heap: 힙의 타일을 버퍼 · 텍스처 영역에 매핑 / 해제해 메모리 발자국을 능동 제어 ( 맵핑 업데이트는 큐 API 로 동기화 ).

- 🚀 파이프라인 로딩 최적화

- 유연한 렌더 파이프라인 (Flexible States): 먼저 비특화 (unspecialized) 로 컴파일 → 필요 때 색상 출력 구성만 특화하여 대부분의 컴파일 결과 재사용. 중요 셰이더는 풀 스테이트 병행해 성능 회 복 .

- 멀티스레드 온디바이스 컴파일: GCD/ 전용 스레드풀로 동시 컴파일, QoS 는 Render 보다 낮게 설정 해 스터터 제거 .

- 사전 컴파일 (AOT): 런타임 파이프라인 스크립트 (JSON, .mtl4-json) 수확 → metal-tt 로 바이 너리 아카이브 생성 → 실행 시 아카이브 조회 ( 미스 시 온디바이스 폴백 ) → 로딩 거의 0**.



## 🧪 구현 스니펫 ( 개념 흐름 )


- Compute 통합 + Barrier: copyFromBuffer → pass barrier → dispatch ( 동일 인코더 ).

- Attachment Map: 렌더 패스는 슈퍼셋 어태치먼트로 열고 , 드로우마다 논리 → 물리 인덱스 맵 교 체 .

- Allocator 링: 프레임 N 인코딩용 A0, 프레임 N+1 은 A1… GPU 완료 신호 후 Reset.

- Queue Barrier 예시: dispatch( 대기권 ) → queue barrier(dispatch→fragment) → draw (vertex 는 동시 진행 허용 ).



## ✅ 체크리스트


- 컴퓨트 작업을 한 인코더로 통합 , Pass/Queue Barrier로 의존만 최소 동기화

- Attachment Map 도입으로 인코더 전환 감소

- Command Allocator 다중화 + Suspend/Resume로 긴 패스 병합

- 대규모 자산은 Argument Table + Residency Set로 일괄 가시화

- TextureViewPool 로 뷰 스트리밍 , Placement Sparse 로 메모리 타일링

- 파이프라인은 비특화 → 특화 흐름 + 멀티스레드 컴파일 + AOT 아카이브 조회 적용

- 원하시면 현재 렌더러 구조를 알려 주세요 . Barrier 배치도 , Residency 세트 설계 , 파이프라인 수

- 확/AOT 파이프라인까지 바로 맞춰 드릴게요 .
