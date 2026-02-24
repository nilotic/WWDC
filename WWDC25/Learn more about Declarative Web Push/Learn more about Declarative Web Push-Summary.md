# Learn more about Declarative Web Push

Learn more about Declarative Web Push https://developer.apple.com/videos/play/wwdc2025/235/



## ✨ 개요


- 기존 Web Push 는 Service Worker + JavaScript 가 필수라서 , 성능 · 버그 · 프라이버시 측면 부 담이 컸습니다 .

- Declarative Web Push 는 표준 JSON 포맷만으로 알림을 표현해서 , JS 실행을 최소화하고 ,

  - 브라우저가 알림 표시 · 클릭 처리까지 자동으로 해 주는 방식입니다 .

- 기존 Web Push 와 완전 호환되도록 설계되어 , 이미 Web Push 를 쓰고 있어도 점진적으로 전환할 수 있습니다 .

  - 🧱 기존 Web Push 흐름 ( 복습 )

  - 필수 요소 :

- Service Worker 등록 PushManager 로 push subscription 생성 ( 서버가 푸시를 보낼 URL· 키 정보 포함 )

- 푸시 수신 시 흐름 :

- 브라우저가 Service Worker 를 깨움

- push 이벤트로 메시지 전달

- JS 가 JSON 파싱 → registration.showNotification(title, options) 호출

- 사용자가 알림을 탭하면 notificationclick 이벤트에서 대부분 어떤 URL 을 열지 처리



## 📦 Declarative Web Push 핵심 아이디어


푸시 메시지 자체에 표준 JSON 알림 구조를 넣어서 , 브라우저가 JS 없이 바로 알림을 띄우도록 하자는 것 .

  - 필수 요소:

- 최상위에 web_push: 8030 (IETF Web Push RFC 번호를 magic value 로 사용 )

- notification 객체 :

- 최소 : title + navigate_to_url ( 탭 시 이동할 URL) 그 외 body, tag, sound 등 NotificationOptions 사양에 있는 모든 옵션 사용 가능

- 브라우저 처리 순서:

- 메시지에서 JSON 파싱 시도

- 실패 → 기존 Web Push 로 폴백(Service Worker 에 전달 )

- JSON 성공 but web_push: 8030 없음 → 역시 기존 Web Push

- magic key 있음 but 유효한 notification 아님 → 조용히 버림 (drop)

- 모두 OK → 브라우저가 자동으로 알림 표시 + 클릭 시 URL 오픈



## 🧩 JavaScript 는 어디까지 줄었나 ?


- Declarative-only 라면 딱 한 가지 JS 만 필요:

- window.PushManager 로 push subscription 요청(Service Worker 필요 없음 ) 알림 표시 / 클릭 처리 / 배지 업데이트 등은 브라우저가 알아서 처리합니다 .

- 🔐 “mutable” 알림과 Service Worker 연동 완전 선언형만으로는 부족한 경우 ( 정밀 제어 ) 도 지원합니다 .

  - JSON 에 "mutable": true 를 넣으면 , 브라우저는 :

- JSON 으로 알림을 검증한 뒤 ,

- Service Worker 를 실행하고 push 이벤트에 브라우저가 구성한 알림 객체 (notification) 를 함께 넘겨줌 .

- Service Worker 는 이 notification 을 보고 :

- 읽지 않은 카운트 등 상태를 최신으로 반영해서 내용을 수정하거나 , E2E 암호화된 메시지 내용을 복호화한 뒤 , 새로운 showNotification 을 호출해 교체할 수 있

  - 습니다 .

- 처리 실패 /Service Worker 실행 불가 시에는 원래 declarative 알림 그대로 사용하므로 회복력이 높습니다 .

  - ♻ 기존 Web Push 에서 점진적 전환하기

- 세션 예시인 Browser Pets 처럼 , 이미 Web Push JSON 을 만들어 쓰는 서비스라면 :

- 푸시 JSON 구조 정리

- 기존 ad-hoc JSON 에서 notification 객체를 NotificationOptions 와 같은 구조로 재정렬

  - title / body / tag / icon / data 등 이름을 표준 키로 변경

- 최상위에 web_push: 8030 추가

- Service Worker 쪽도 단순화 :

- event.data.json() → json.notification 꺼내서 showNotification(json.notification.title, json.notification) 처럼 그대로 전달

- 이렇게 하면 :

- 새 브라우저: Declarative Web Push 로 자동 알림

- 구형 / 미지원 브라우저: 기존 Web Push 처럼 Service Worker 코드 실행 → 한 번의 JSON 포맷 정리로 모든 브라우저를 커버하는 “ 프로그레시브 인핸스먼트 ” 구조가 됩니다 .



## ✅ 실무 적용 체크리스트


  - 기존 푸시 JSON 을 NotificationOptions 호환 구조로 재정렬

- 최상위에 web_push: 8030 추가해 declarative 포맷 표시

- 최소 title + navigate_to_url 보장 , 필요 시 body, tag, badge, sound 등 옵션 추가

- 특별 케이스 ( 암호화 DM, 정밀 카운트 ) 는 "mutable": true + Service Worker 에서 후처리

- Service Worker 는 fallback + mutable 전용 코드만 남기고 단순화

- Safari 18.5(macOS) / iOS·iPadOS 18.4 홈 화면 웹앱에서 동작 확인
