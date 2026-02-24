# Code-along_ Bring on-device AI to your app using the Foundation Models framework

- Code-along: Bring on-device AI to your app using the Foundation Models framework https://developer.apple.com/videos/play/wwdc2025/259/



## ✅ 개요


FoundationModels 프레임워크를 사용하면 Apple 기기의 온디바이스 LLM에 직접 접근할 수 있 어 , 개인정보 보호와 고성능, 오프라인 작동이 가능 .

iOS, macOS, iPadOS, visionOS 에서 모두 작동 .

앱 크기 증가 없이 내장된 모델을 사용함 .

💡 예제 앱 : 여행 일정 플래너

- 랜딩 페이지에서 여러 랜드마크 ( 예 : Joshua Tree) 를 선택하고 "Generate" 버튼을 누르면 , 모델이 일정을 자동 생성 .

- Tool calling을 통해 외부 데이터 ( 예 : MapKit 의 관광지 정보 ) 를 자동으로 불러와 사용 .

- 🧠 핵심 기능 및 구현 단계

- 프롬프트 엔지니어링 Xcode 의 Playground + Canvas로 실시간 프롬프트 결과 확인 및 수정 .

- #Playground 구문을 이용하여 반복적인 실행 없이 테스트 가능 .

- Guided Generation ( 가이드 생성 ) Generable 프로토콜을 통해 원하는 데이터 구조를 모델이 직접 생성 .

- Guide를 사용해 프로퍼티에 조건 추가 ( 예 : 배열 개수 , 값 제한 등 ).

  - 예 : Itinerary, DayPlan 등의 커스텀 타입 정의 .

- Instruction 기반 프롬프트 Session 생성 후 모델에게 역할과 예시 데이터를 줘서 더 정확한 출력 유도 .

- builder API 로 프롬프트를 구성하고 , 구조화된 응답을 받음 .

- Tool Calling ( 외부 도구 호출 ) MapKit 을 활용해 선택한 랜드마크 근처의 관광지를 자동으로 검색 .

- Tool 프로토콜 구현 → 이름 , 설명 , 입력 파라미터 , call() 메서드 정의 .

- 모델이 도구 사용 시기와 횟수를 스스로 판단함 .

- 모델 가용성 확인 일부 기기에서는 Apple Intelligence 및 모델이 미지원 / 비활성일 수 있음 .

- availability API 를 통해 상태 확인하고 UI 동적으로 대응 :

- 지원 안됨 → 버튼 숨김 , 정보만 제공 비활성 → 사용자에게 알림

  - 준비 중 → " 잠시 후 다시 시도 "

- 스트리밍 응답 처리 respond 대신 respondStream 사용으로 실시간으로 결과 출력 가능 .

- PartiallyGenerated<T> 타입을 통해 점진적으로 응답 처리 .

- SwiftUI 에서 속성 하나씩 애니메이션으로 자연스럽게 표현 가능 .

- 성능 최적화

- Prewarming: 사용자가 액션을 취하기 직전에 세션 미리 준비 → 초기 지연 최소화 .

- IncludeSchemaInPrompt = false:

- 구조가 이미 충분히 명확할 경우 , 프롬프트 내 schema 생략 → 토큰 수 및 응답 지연 감 소 .

- Instruments로 분석 :

  - 모델 로딩 시간 , 추론 시간 , 툴 호출 시간 등을 시각적으로 분석 가능 .

- 🔚 마무리 이 세션을 통해 SwiftUI 앱에 FoundationModels 를 쉽게 통합하고 , 개인정보 보호를 유지하면서도

  - 강력한 LLM 기능을 제공할 수 있는 방법을 익힐 수 있음 .

- 추천 세션 :

- Meet FoundationModels Deep Dive into Guided Generation

  - Prompt Design & Safety
