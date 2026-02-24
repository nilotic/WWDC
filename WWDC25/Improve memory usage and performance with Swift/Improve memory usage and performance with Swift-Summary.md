# Improve memory usage and performance with Swift

Improve memory usage and performance with Swift https://developer.apple.com/videos/play/wwdc2025/312/



## ✨ 개요


Swift 6 에서 성능 문제를 찾고 (Profiling) → 알고리즘 수정 → 메모리 ·ARC 부담 제거까지 가는 전체 흐 름을 , QOI 이미지 파서 예제로 보여주는 세션입니다 .

여기서 새로 등장하는 핵심은 InlineArray, Span(RawSpan/OutputSpan), 그리고 이를 활용한 Swift Binary Parsing 오픈소스 라이브러리입니다 .

🔍 문제 발견 : Instruments 로 병목 찾기 작은 이미지는 금방 열리는데 , 큰 이미지는 몇 초씩 걸리는 상황에서 시작합니다 .

- Time Profiler + Allocations로 테스트 코드를 직접 프로파일링 :

- Flame graph 에서 platform_memmove 가 크게 잡히며 , Data 복사에 대부분의 시간이 쓰이고 있음 .

- Call tree 를 따라가면 , 매번 앞에서 1 바이트 잘라내려고 Data 를 새로 생성하는 readByte 구 현이 원인 .

- 해결 : Data는 앞에서 줄이는 컬렉션이므로 popFirst() 를 사용해 복사 없이 맨 앞 요소를 꺼내도록 수정 → memmove 막대가 사라지고 , 시간 복잡도도 O(n²) → O(n) 으로 바뀜 .

- ⚙ 알고리즘 · 할당 최적화

- 다음 병목은 엄청난 수의 Array 할당:

- 파이프라인 : readEncodedPixels → decodePixels( 각 픽셀마다 [RGBA] 배열 생성 ) → flatMap 두 번 → 최종 Data 로 복사 .

- 즉 , 픽셀마다 작은 배열을 만들고 (flatMap 으로 합치고 또 복사 ) 있어서 transient allocation 이 폭발 .

- 해결 전략 : “ 우아한 체이닝 ” 대신 한 번만 Data 를 크게 잡고 , 거기에 바로 써 넣기

- 최종 바이트 수 totalBytes 계산

- 그 크기만큼 pixelData Data 를 한 번에 할당

- 파싱하면서 바로 switch 로 각 픽셀을 해석 → 곧바로 Data 에 기록

- 결과 : 중간 배열 할당이 사라지고 , 실행 시간이 절반 이하로 감소 . 이제 대부분의 비용은 실제 파싱 작 업에만 쓰임 .

- 🧱 Swift 6 새 타입으로 런타임 체크 없애기

- InlineArray 로 고정 크기 캐시 최적화 파서의 상태 (State) 안에 있던 previousPixel, pixelCache 때문에 swift_beginAccess / swift_endAccess 런타임 exclusivity 체크가 계속 발생 .

- 해결 단계 :

  - 상태를 클래스에서 값 타입 ( 파서 자체의 프로퍼티 ) 로 옮겨서 exclusivity 체크 제거 .

- pixelCache는 항상 64 개 원소를 가지는 고정 크기이므로 , 새 InlineArray<Element, N> 로 교체 .

- InlineArray 특징 :

  - 크기가 타입의 일부(value generics) 라서 append/remove 불가 , 대신 항상 고정 크기.

  - 항상 인라인 저장 ( 별도 힙 할당 없음 ), CoW· 참조 카운트 · 유니크 체크 없음 .

- 복사 시 요소를 그대로 복사하지만 , 이 예제처럼 “ 한 군데서 in-place 수정만 ” 하는 경우엔 이 상적인 선택 .

- Span(RawSpan/OutputSpan) 으로 ARC· 포인터 제거 여전히 flame graph 상단엔 swift_retain / swift_release 가 보임 → 원인은 Data 사용 자체 .

- 기존 대안인 withUnsafeBufferPointer 는 포인터 생명주기 · 초기화 상태를 직접 관리해야 해서 위 험 .

- Swift 6.2 의 Span 패밀리:

  - 컬렉션의 연속 메모리에 대한 뷰를 제공 .

- non-escapable 타입이라 , 스팬의 생명주기가 원본 컬렉션에 안전하게 묶임 → 컴파일러가 “ 절대 밖으로 못 나감 ” 을 보장.

  - 그래서 unsafe 포인터처럼 빠르면서도 , ARC· 유니크 체크 없이 안전하게 사용 가능 .

- 적용 예 :

- readByte 를 위해 Data 대신 RawSpan 확장으로 구현 :

- 첫 바이트 unsafeLoad → span 앞을 1 바이트 줄인 후 값 반환 (Data+popFirst 와 같 은 동작 ).

- 파싱 함수 시그니처를 Data → RawSpan 으로 변경 , 호출부에서는 data.bytes 로 RawSpan 획득 .

- 출력쪽은 Data(rawCapacity:) + OutputSpan 으로 , 0 으로 채운 Data 대신 “ 초기화되지 않은 버퍼 + OutputSpan” 을 받고 ,

  - append 호출로 채우면서 오프셋 변수 없이count 로 진행 상황 관리 .

  - 📊 성능 결과 & Swift Binary Parsing 라이브러리

- 최종 결과 :

  - 알고리즘 수정 ( 복사 제거 + 할당 제거 ) → 큰 폭 속도 향상 .

  - 여기에 InlineArray + Span 적용으로 런타임 메모리 관리 비용을 사실상 제거.

  - 전체적으로 초기 구현 대비 700 배 이상 빠른 파서를 달성 .

- 이 세션에서 다룬 기술은 모두 새 오픈소스 라이브러리 “Swift Binary Parsing” 에 녹아 있습니 다 .

- QOI 헤더 파서를 예로 , Overflow 방지 , 엔디안 / 부호 / 비트 폭 지정 , RawSpan 기반 파서 타 입 (ParserSpan) 등을 제공 .

  - 커스텀 RawRepresentable 검증 , 안전한 계산용 연산자 등도 포함 .



## ✅ 실무에서 써먹기 체크리스트


- Time Profiler + Allocations 로 진짜 병목 ( 복사 · 할당 ·ARC) 을 먼저 찾기

- Data/Array 반복 슬라이싱 ·flatMap 체인 → 단일 버퍼 선할당 + 직접 쓰기로 교체

- 고정 크기 캐시는 InlineArray<Element, N> 로 옮겨 힙 /CoW/Exclusivity 제거

- tight loop 안 Data/Array 접근은 Span(RawSpan/Span/OutputSpan) 으로 바꾸어

- unsafe 포인터 없이 ARC· 유니크 체크를 없애기

- 바이너리 포맷 파서는 Swift Binary Parsing 도입 검토
