# Go further with MapKit

Go further with MapKit https://developer.apple.com/videos/play/wwdc2025/204/



## ✨ 개요


PlaceDescriptor( 신규 , GeoToolbox), MapKit 지오코딩 ( 신규 ), 사이클링 경로, Look Around 의 JS 지원, 통합 Maps URL, watchOS MapKit 등 지도를 찾고 ( 검색 / 지오코딩 )· 보여주고 (Place Card/

주소 표현 )· 이동시키는 ( 경로 /ETA) 전 과정을 업그레이드합니다 .

🧭 PlaceDescriptor(GeoToolbox) 이게 왜 필요 ? Place ID 가 없어도 정확히 하나의 장소를 찾고 싶을 때 사용 ( 앱 외부 시스템과의 교환 에도 적합 ).

- 구성: commonName( 공용명 ) + representations( 주소 문자열 / 좌표 / 기기 위치 순서 우선도 ) + supportingRepresentations( 서비스 식별자들 ).

- 동작: MKMapItemRequest(descriptor)로 MapItem 획득 → Place Card, 지도 마커 , 기타 MapKit API 와 동일하게 사용 . MapKit ID 가 있으면 우선 사용 , 실패 시 다른 표현으로 폴백.



## 🗺 지오코딩 , 이제 MapKit 로


CLGeocoder 폐기 예정 (soft) → MKReverseGeocodingRequest / MKGeocodingRequest 로 좌 표 ↔ 주소 변환 .

- 주소 표현: MKMapItem.address(full/short) + addressRepresentations( 국가 표시 포함 / 제외 , cityWithContext 등 ) 로 UI 친화적 포맷 제공 .

- 🚴 경로 & 내비게이션

- Directions API: 출발 · 도착에 대해 복수 경로, 거리 / 시간 / 알림 / 폴리라인 제공 .

- 사이클링 경로 ( 신규 ): 자전거 전용 길 · 차로를 고려한 경로와 ETA 제공 (JS 도 지원). 선택한 MapItem 에 대해 한 줄 설정으로 활성화 .

- 👀 Look Around & 웹

- MapKit 앱: 기존 iOS 에서 제공되던 Look Around( 가로 360°) 확인 / 미리보기 / 전체 화면 API 재확 인 .

- MapKit JS( 신규 ): Interactive LookAroundView & Preview 추가 ( 전체 화면 전환 , 로딩 / 에 러 / 닫힘 이벤트 처리 가능 ). 웹에서도 거리 수준 사전 답사를 손쉽게 내장 .

- 🔗 통합 Maps URL iOS 18.4 부터 Maps URL 파라미터 일원화 — 검색 / 장소 / 길찾기 등 범용 링크를 안정적으로 구성 ( 설치된 기기엔 앱 , 미설치 플랫폼은 http://maps.apple.com 으로 연결 ).

- ⌚ watchOS 지원 확대 watchOS SDK 에 20+ MapKit API 추가 , 시계에서도 길찾기 가능 .



## ✅ 실무 체크리스트


- PlaceDescriptor로 CRM/ 외부 시스템의 “ 이름 + 주소 / 좌표 ” 를 MapItem으로 정규화

- 지오코딩 전환: CLGeocoder → MapKit 지오코딩 API

- 주소 UI: addressRepresentations로 화면 맥락에 맞는 요약표시 적용

- 사이클링 경로 옵션 추가 ( 앱 / 웹 둘 다 )

- Look Around(JS) 내장으로 경로 사전 검토 UX 강화

- 통합 Maps URL로 딥링크 정비

- 필요 시 watchOS MapKit으로 손목 내비게이션 제공
