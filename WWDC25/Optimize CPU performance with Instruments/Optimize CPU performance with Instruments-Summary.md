# Optimize CPU performance with Instruments

Optimize CPU performance with Instruments https://developer.apple.com/videos/play/wwdc2025/308/



## ✨ 개요


Apple silicon CPU 에서 코드 성능을 체계적으로 최적화하는 방법 Instruments 를 단계적으로 사용해 거친 병목 → 정밀 병목 → CPU 마이크로 병목 을 추적하는 접근법 소개

- 핵심 메시지 : 추측하지 말고 , 반드시 측정하라 🧠 성능 분석을 시작하는 올바른 사고방식 성능 저하는 예상 밖의 지점에서 발생하는 경우가 많음 먼저 확인할 것 CPU 문제인지 ?

- 스레드가 block 상태인지 ?

- QoS / 과도한 스레드 생성 문제인지 ?

- 가능한 경우 작업 자체를 제거 지연 실행 사전 계산 캐싱 그래도 안 되면 CPU 를 더 빠르게 쓰는 문제로 이동 📊 1 단계 : 거친 CPU 사용 분석 사용 도구 Xcode CPU Gauge System Trace ( 스레드 block 분석 ) Hangs Instrument (UI/ 메인 스레드 ) 주의점 무분별한 마이크로 최적화는 코드 가독성 저하 컴파일러 최적화 의존 증가 임팩트가 큰 코드부터 최적화 🔍 예제 문제 : Binary Search 최적화 이미 O(log n) 알고리즘

하지만 크리티컬 패스에 존재

- 목표 : Search throughput ( 초당 검색 횟수 ) 증가 성능 측정 방식 ContinuousClock 사용 OS Signpost 로 측정 구간 지정 1 초 동안 반복 실행 ⏱ Time Profiler vs CPU Profiler Time Profiler 타이머 기반 샘플링 Aliasing 문제 존재 특정 함수가 과대 대표될 수 있음 CPU Profiler ( 권장 ) CPU cycle counter 기반 Apple silicon 의 비대칭 코어 주파수 스케일링

- 을 정확히 반영 CPU 최적화 시 항상 우선 사용 🧱 Collection → Span 전환 병목 원인 Collection 프로토콜 witness table Objective-C 타입 검사 Span 연속 메모리 base address + count escape 방지 결과 약 4 배 성능 향상 알고리즘 변경 없음 🧬 Processor Trace ( 정밀 분석 ) 특징 모든 명령어 실행을 100% 기록 샘플링 아님 → 편향 없음 오버헤드 약 1% 지원 기기 M4 Mac / iPad Pro

- A18 iPhone 활용 단 한 번 실행된 함수도 분석 가능 실제 실행된 함수 호출과 cycle 수 확인



## 🧩 Generic specialization 문제


병목 원인 Comparable 제네릭 미특화 프레임워크 코드라 specialization 불가 해결 @inlinable 또는 타입 특화 함수 (Int 전용 ) 결과 약 1.7 배 추가 개선

범용성 감소 🧠 CPU 동작 모델 이해 CPU 실행 단계

- Instruction Delivery

- Instruction Processing 파이프라이닝 Instruction-level parallelism Branch prediction Cache hierarchy (L1 → L2 → DRAM) ➡ Swift 코드는 직접 제어 불가, 컴파일러가 최적화 가능한 형태로 작성해야 함 📈 CPU Counters & Bottleneck Analysis CPU Counters 하드웨어 이벤트 카운트 병목을 퍼센트로 분해 Bottleneck Analysis 흐름

- CPU Bottlenecks

- Discarded (Branch misprediction)

- Instruction Processing

- L1D Cache Miss Sampling 🌿 Branchless Binary Search 문제 if 분기 → branch misprediction 해결 조건 분기를 conditional move로 변경 early return 제거 unchecked arithmetic 사용 결과 약 2 배 성능 향상 단점 안전성 감소 유지보수 어려움 🧠 메모리 병목과 Cache Binary Search 의 본질적 문제 접근 패턴이 cache 에 매우 비우호적 반복적으로 cache miss 발생

- 해결 : Eytzinger Layout 이진 탐색 트리를 breadth-first 배열로 재배치 상위 노드가 같은 cache line 에 위치 결과 추가 2 배 성능 향상 트레이드오프 순차 탐색 성능 저하 🏁 최종 결과 Collection → Span Generic specialization Branch 제거 Cache 친화적 메모리 레이아웃 ➡ 총 약 25 배 성능 개선 📌 핵심 정리 성능 최적화 순서가 중요

- 측정

- 거친 병목 제거

- 소프트웨어 오버헤드 제거

- CPU 마이크로 병목 분석 Instruments 는 CPU Profiler Processor Trace CPU Counters 를 점진적으로 사용 Swift 의 추상화 비용은 눈에 보이지 않지만 측정하면 반드시 드러남
