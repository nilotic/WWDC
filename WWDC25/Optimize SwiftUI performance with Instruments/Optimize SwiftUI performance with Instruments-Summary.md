# Optimize SwiftUI performance with Instruments

Optimize SwiftUI performance with Instruments https://developer.apple.com/videos/play/wwdc2025/306/



## ✨ 개요


SwiftUI 앱에서 발생하는 성능 병목을 식별하고 제거하는 방법을 다루는 세션 Instruments 26 에 추가된 차세대 SwiftUI Instrument를 중심으로 느린 View body

불필요한 View 업데이트 업데이트의 원인과 전파 경로 를 분석하는 방법 소개



## 🧪 SwiftUI 성능 문제의 대표 증상


스크롤이 끊김 애니메이션이 멈추거나 튐 UI 반응 지연 (hitch / hang)

- 원인은 반드시 SwiftUI 가 아닐 수도 있으므로 :

  - SwiftUI 문제가 아니면 Hangs / CPU Instruments 사용 권장



## 🧰 Instruments 26: SwiftUI Instrument 구성


SwiftUI Instrument Update Groups Long View Body Updates Long Representable Updates Other Long Updates

Time Profiler View body 실행 중 CPU 사용 분석 Hangs & Hitches 프레임 미스 여부 확인 ➡ Update Groups 가 비어 있는데 CPU 사용이 높다면 SwiftUI 외부가 원인

🧱 Long View Body Updates 문제 View body는 메인 스레드에서 실행 느린 body 는 프레임 데드라인 미스 → hitch로 직결 분석 흐름

- Long View Body Updates 트랙에서 빨강 / 주황 업데이트 확인

- 특정 View 선택 → Inspection Range 설정

- Time Profiler 로 body 내부 CPU 사용 확인 ⛔ 사례 1: View body 안에서 무거운 계산 문제 View body 에서 NumberFormatter MeasurementFormatter 생성 및 문자열 포맷 수행 body 가 실행될 때마다 반복 계산 해결 계산을 모델 계층으로 이동 formatter 재사용 결과 문자열 캐싱 결과 스크롤 중 발생하던 long body update 제거 실제 사용자 인터랙션 중 hitch 해소 ⏱ SwiftUI 렌더 루프 관점에서의 문제

- 매 프레임 :

- 이벤트 처리

- View body 업데이트

- 렌더링

- body 실행이 길어지면 :

- 프레임 제출 실패 이전 프레임이 한 프레임 더 유지 → hitch 발생

- ⚠ 두 번째 성능 문제 : 불필요한 View Body 업데이트 각 body 는 빠르지만

  - 너무 많은 body 가 한 프레임에 실행되면 hitch 발생



## 🧩 Cause & Effect Graph 소개


SwiftUI 업데이트의 원인과 결과를 시각화

- 질문의 핵심 :

  - ❌ “ 왜 body 가 실행됐지 ?”



## ✅ “ 무엇이 body 를 outdated 로 만들었지 ?”


그래프 구성 노드 State 변경 Gesture Environment 변경 View body 업데이트 엣지 Creation Update ❌ 사례 2: @Observable + 컬렉션 의존성

문제 각 LandmarkListItemView가 modelData.isFavorite(landmark) 호출 내부에서 favorites 배열 전체를 참조 결과 배열 변경 시 모든 아이템 View body 재실행

Cause & Effect Graph 에서 확인 한 번의 버튼 탭 → 다수 View 업데이트 발생



## ✅ 해결 : View 단위 ViewModel 분리


각 아이템 View 마다 개별 Observable ViewModel 생성 isFavorite 상태를 ViewModel 에 귀속 View 는 자기 ViewModel 에만 의존 결과 버튼 탭 → 해당 View body 만 업데이트

불필요한 업데이트 제거 🌍 Environment 의존성 주의점 @Environment 접근 시 View 는 EnvironmentValues 전체에 의존

- 환경 값 변경 시 :

- 실제 사용 여부와 무관하게 업데이트 체크 비용 발생

- 권장 사항 자주 변하는 값 ( 타이머 , geometry 등 ) 을

- Environment 에 넣지 말 것 Environment 의존 View 수 최소화

- 🧠 핵심 정리 SwiftUI 성능의 핵심은 두 가지

- View body 는 빠르게

- View body 는 꼭 필요할 때만 최적화 순서 Long View Body 제거 불필요한 업데이트 제거 데이터 의존성 최소화 Cause & Effect Graph는 SwiftUI 업데이트를 이해하는 가장 강력한 도구 Instruments 는 개발 초반부터 반복적으로 사용해야 효과가 큼
