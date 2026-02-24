# Explore Swift and Java interoperability

Explore Swift and Java interoperability https://developer.apple.com/videos/play/wwdc2025/307/ 요약



## ✨ 개요


Swift 팀이 Swift–Java 상호운용을 위한 오픈소스 프로젝트 SwiftJava를 공개했습니다 . 목표는 기존 Java/Swift 코드베이스에 ‘ 점진적으로 ʼ 서로를 도입하고 , 양쪽 라이브러리를 재사용하며 ,

Gradle·SwiftPM 등 생태계 빌드 도구와 통합하는 것입니다 .



## 🧩 구성 요소


- JavaKit(Swift 패키지 ): JNI 작업을 타입 세이프하게 만드는 래퍼 · 매크로 (@JavaImplementation, @JavaMethod).

- SwiftKit(Java 라이브러리 ): Java 쪽에서 Swift 객체를 다루기 위한 도우미 .

- swift-java CLI & 빌드 통합: SwiftPM 플러그인 /Gradle 연계로 브리지 코드 생성 · 의존성 해결 · 패 키징 자동화 .

- 🔁 양방향 사용 시나리오

- Swift 앱 → Java 호출( 라이브러리 재사용 )

- Java 앱 → Swift 호출( 비즈니스 로직을 Swift 로 구현한 뒤 Java 에서 사용 ) 두 방향을 동시에 한 프로젝트에서 쓸 수 있습니다 .

- 🛠 예시 1 — JNI 네이티브 메서드 ‘ 수기 ʼ → SwiftJava 자동화 전통적 JNI 는 보일러플레이트 · 오류 위험 · 수명 관리 복잡.

- SwiftJava 는 Java 타입 선언 → Swift 브리지 자동 생성( 프로토콜 준수 + 매크로 표기 ) 로 JNI 디 테일을 은닉하고 , 메모리 / 시그니처 안전성을 확보합니다 .



## 📦 예시 2 — Swift 에서 Java 라이브러리 쓰기


Gradle로 Java 의존성 좌표 (group:artifact:version) 자동 해결(SwiftPM 플러그인 또는 CLI resolve).

Swift 에서 JVM 을 기동하고 , 생성된 모듈을 임포트해 Java 컬렉션 등을 자연스럽게 사용 . ( 수명 관 리는 JavaKit 이 글로벌 참조 등으로 보강 ) 🔗 예시 3 — Java 에서 Swift 라이브러리 쓰기 (FFM, Java 22)

JNI 대신 Java 22 의 Foreign Function & Memory(FFM) API 사용 .

swift-java 가 Swift 라이브러리 전체를 Java 클래스로 래핑(+ Swift 동적 라이브러리 ) 하여 Java 의존성으로 배포.

- 메모리 관리: SwiftArena를 사용해 네이티브 값 타입의 수명을 제어 . try-with-resources + Scoped/Confined Arena로 예측 가능한 해제와 GC 부담 감소 권장 .

- 🧭 빌드 / 통합 포인트 Swift ↔ Java 시그니처 자동 생성으로 C 헤더 / 매직 스트링 관리 제거 .

- Gradle 연계로 전이 의존성까지 해결 , SwiftPM 샌드박스 환경에선 CLI 로 사전 해결 가능 .



## ✅ 실무 체크리스트


- SwiftJava 도입: JavaKit/SwiftKit + swift-java로 브리지 자동 생성

- Swift→Java: Gradle 좌표 지정 → 의존성 해결 →JVM 기동 → 사용

- Java→Swift: FFM 기반 래핑 라이브러리 생성 · 배포 , Arena 스코프로 수명 관리

- JNI 최소화: 매크로 · 생성 코드 활용해 안전성과 유지보수성 확보

- 📣 마무리

- 프로젝트는 swiftlang GitHub와 Swift Forums에서 공개 개발 중이며 , 기여 · 피드백을 환영합니다 .
