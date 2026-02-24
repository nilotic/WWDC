# Meet the Foundation Models framework

Meet the Foundation Models framework https://developer.apple.com/videos/play/wwdc2025/286/



## ✨ 개요


Foundation Models 프레임워크는 Apple Intelligence 를 구동하는 온디바이스 LLM을 Swift API 로 제공하는 새 프레임워크입니다 .

iOS / iPadOS / macOS / visionOS 에서 동작하며 , 요약 , 분류 , 추출 , 추천 같은 작업을 기기 안에서 처리하고 , 네트워크 없이 오프라인에서도 동작 ,

OS 에 내장되어 앱 용량 증가 없이 사용할 수 있습니다 .

🧠 온디바이스 LLM 의 특징 3B 파라미터 , 2-bit quantization 된 디바이스 스케일 모델입니다 .

- 잘하는 일 : 요약 , 컨텐츠 태깅 , 분류 , 간단한 생성 , 입력 분석 등 .

- 한계 : 거대한 세계 지식 , 깊은 추론은 서버 - 스케일 모델이 더 적합 → 작은 단위로 태스크를 쪼개서 사 용하는 것이 전제입니다 .



## 🧩 Guided Generation & @Generable


@Generable / @Guide @Generable로 “ 모델이 만들어 줄 Swift 타입 ” 을 정의합니다 .

@Guide로 각 프로퍼티에 자연어 설명 + 허용 값 제약을 줄 수 있습니다 .

이후에는 프롬프트만 주면 모델이 그 타입의 인스턴스를 생성해 줍니다 .

JSON 포맷 강요 , 후처리 파싱 , 구조 깨짐 방지용 해킹이 필요 없음 .

장점

- 구조적 정확성 보장: “constrained decoding” 으로 형식이 깨지지 않게 토큰 생성 자체를 제한 .

- 프롬프트를 “ 포맷 설명 ” 이 아니라 “ 원하는 행동 ” 에 집중해서 짤 수 있음 .

- 정확도와 성능 모두 향상 (OS + 훈련 + 런타임이 같이 설계됨 ).

- 🚿 Streaming: 델타가 아니라 스냅샷

- 일반 LLM 스트리밍 : 토큰 델타를 계속 붙여서 누적 → 구조화 데이터일 때 파싱이 매우 까다로움 .

- Foundation Models 는 PartiallyGenerated 스냅샷을 스트리밍합니다 .

- PartiallyGenerated @Generable를 확장하면 내부적으로 같은 구조지만 모든 프로퍼티가 Optional인 PartiallyGenerated 타입이 생성됩니다 .

- session.streamResponse(...)는 이 타입의 async sequence 를 반환 :

  - 각 요소가 “ 지금까지 채워진 필드가 반영된 스냅샷 ” 입니다 .

  - SwiftUI 에서 @State 로 들고 있다가 스냅샷이 올 때마다 UI 갱신하기 좋습니다 .

- 베스트 프랙티스 SwiftUI 애니메이션 / 트랜지션을 활용해 대기 시간을 ‘ 기다림 ʼ 이 아니라 ‘ 연출 ʼ 로 보이게 만들 것 .

  - 배열 생성 시 View identity 에 주의 .

  - 프로퍼티 선언 순서대로 생성되므로 ,

  - 예 : summary 품질을 위해 요약 필드를 struct 맨 뒤에 두는 방식도 고려 .

  - 🛠 Tool Calling

- Tool calling = 모델이 스스로 앱의 함수를 호출하게 만드는 기능 .

- 사용 예 :

- 여행 앱에서 MapKit/ 자체 데이터로 레스토랑 / 호텔 조회 , WeatherKit 으로 날씨 조회 ,

  - 도메인 지식 / 개인 데이터 / 최근 정보에 접근 .

  - Tool 정의

- Tool 프로토콜 채택 :

  - name + natural language description 으로 , 모델에게 언제 쓸지 설명 .

  - call(_:) 메서드에서 원하는 코드를 실행 .

- 인자는 반드시 @Generable 타입 → 유효하지 않은 인자 / 툴 이름이 생성되지 않게 guided generation 기반으로 보호 .

- 반환은 ToolOutput으로 , structured data(GeneratedContent) 또는

  - 단순 문자열 둘 다 지원 .

  - 동작 흐름

- 세션 초기화 시 사용할 Tool 목록 전달 ( 세션 수명 동안 고정 ).

- 프롬프트 입력 .

- 모델이 필요하다 판단하면 Tool call 생성 .

- 프레임워크가 Tool 실행 → 결과를 transcript 에 삽입 .

- 모델이 이를 포함해 최종 응답 생성 .



## 💬 상태 유지 세션 (Transcript) & 프롬프트 설계


프레임워크 중심 단위는 stateful session.

respond / streamResponse 호출 시마다 대화 내용이 transcript 에 쌓임.

같은 세션 안에서는 “ 이거 말고 다른 거 하나 더 ” 같은 맥락 이해가 가능 .

Instructions vs Prompt

- Instructions:

  - 개발자가 세션 생성 시 넣는 역할 / 스타일 / 톤 / 안전 규칙.

  - 상대적으로 정적 , 사용자 입력은 섞지 않는 게 원칙 .

- 모델은 prompt 보다 instructions 를 우선 따르도록 훈련됨 → prompt injection 방어에 도 움 .

- Prompt:

  - 매 요청마다 사용자가 보내는 구체적인 질문 / 요청 .

- 기타 isResponding 플래그로 모델이 응답 중인지 체크해 중복 요청 방지.

- 🏷 Content Tagging Adapter 자주 쓰는 컨텐츠 태깅 / 엔티티 추출 / 토픽 감지를 위한 전용 어댑터 제공 .

- Guided Generation 과 바로 연동되어 , @Generable struct 하나만 정의하면 텍스트에서 토픽 / 태그를 뽑아낼 수 있음 .

- 커스텀 instructions + 커스텀 Generable 타입 조합으로 행동 (action) / 감정 (emotion) 탐지 등으로 용도를 확장할 수 있습니다 .



## 🧰 개발자 도구 & 운영


Xcode Playgrounds 매크로 아무 Swift 파일에서나 새 playground macro 로 바로 모델을 호출해 프롬프트 실험 가능 .

이미 정의한 @Generable 타입을 그대로 테스트에 활용 .

Instruments 프로파일링 템플릿 모델 호출에 걸리는 세부 지연 (latency) 를 분석 .

프롬프트 길이 줄이기 , prewarm 호출 타이밍 조정 등 최적화에 활용 .

Feedback & Adapter Training Toolkit Encodable 피드백 payload 타입 제공 → Feedback Assistant 에 첨부 가능 .

ML 실무자는 별도 툴킷으로 커스텀 어댑터를 학습할 수 있으나 , Apple 이 베이스 모델을 개선할 때마다 재학습 책임이 생긴다는 점을 감안해야 합니다 .



## ✅ 정리


Foundation Models 프레임워크는 온디바이스 LLM + Guided Generation + Streaming + Tool Calling + Stateful Session 을 통합해 , Swift 타입 중심의 안정적인 생성 경험을 제공합니다 .
