# Enhance child safety with PermissionKit

Enhance child safety with PermissionKit https://developer.apple.com/videos/play/wwdc2025/293/



## ✨ 개요


PermissionKit은 아이가 새 연락처 / 사용자와 소통하려 할 때 부모에게 메시지 한 번 탭으로 승인을 요청 · 수락하게 해 주는 프레임워크입니다 . 서드파티 앱도 채팅 · 팔로우 · 친구 추가 같은 커뮤니케이션 요청을 부모

승인 흐름에 연결할 수 있습니다 . Apple [WWDC 25] Enhance child safety … 🧠 PermissionKit 이 해결하는 것 일관된 ‘ 부모에게 묻기 ʼ UX: 시스템 수준 승인 / 거절 · 만료 처리로 앱마다 제각각이던 보호자 동의 경

험을 통일 . Apple

- 광범위한 적용: iOS 의 기본 전화 / 메시지뿐 아니라 서드파티 커뮤니케이션 / 소셜 앱도 같은 흐름을 채 택 가능 . Apple 🧭 사용자 흐름 ( 아이 ↔ 부모 )

- 아이가 앱에서 새 사용자에게 채팅 / 팔로우 / 친구 추가 시도 → PermissionKit 이 요청 생성.

- 부모는 메시지에서 한 탭 승인 / 거절.

- 앱은 콜백으로 결과를 수신해 허용 시 진행 / 거절 · 만료 시 차단 UI 를 표시 . Apple



## 🧩 개발 통합 포인트 ( 요약 )


- 요청 트리거 지점 정의: ‘ 새 번호 /IDʼ·‘ 상호 팔로우 전 DMʼ 등 민감 전환마다 PermissionKit 호출 .

- Apple

- 상태 저장: 승인된 상대방에 대한 허용 토글 / 타임스탬프를 보존해 재요청 과다를 방지 . ( 세션 권장 패 턴 )[WWDC 25] Enhance child safety …

- 나이대 기반 분기: Declared Age Range API로 아이의 연령대 ( 생년월일 노출 없이 ) 를 요청해 나 이 맞춤 UI/ 기능 제한에 반영 . Apple 🔒 프라이버시 & 보호 장치 연령대 공유는 부모가 제어( 항상 / 매번 / 절대 공유 안 함 ). 아이는 기본적으로 설정 변경 불가 . Apple

- 기존 보호 기능과 병행: Communication Safety( 노출물 블러 ), Screen Time, App Store 세분화 된 연령 등급 (13+/16+/18+) 과 함께 작동 . Apple



## ✅ 체크리스트


- ‘ 새 연락처 /ID 와 대화 / 팔로우 / 친추 ʼ 시 PermissionKit 요청 붙이기 Apple

- 승인 결과 콜백 처리 ( 허용 / 거절 / 만료 ) 후 UX 분기 [WWDC 25] Enhance child safety …

- Declared Age Range로 나이대 수신 → 기능 / 콘텐츠 가드 적용 Apple

- 재요청 억제 로직( 승인 캐시 · 쿨다운 ) 과 차단 화면 설계 [WWDC 25] Enhance child safety …

- Communication Safety/Screen Time 설정과 충돌 없는지 점검 ( 테스트 시나리오 포함 )
