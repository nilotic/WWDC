# WWDC26 Keynote 요약

- **Session**: Keynote
- **WWDC**: WWDC26
- **Video**: https://developer.apple.com/videos/play/wwdc2026/101/
- **Chapters**: Introduction, Platform improvements, Trust and safety, Apple Intelligence and Siri
- **작성 기준**: Apple Developer WWDC26 Keynote 페이지 및 제공된 한국어 스크립트 기준

## 한 줄 요약

WWDC26 Keynote는 새로운 플랫폼의 방향을 **더 빠르고 안정적인 OS**, **Liquid Glass 정제**, **자녀 안전 기능 강화**, 그리고 **Apple Intelligence와 Siri AI의 본격적인 시스템 통합**으로 제시했다. 개발자 관점에서는 App Intents, Spotlight 인덱싱, Foundation Model framework, Core AI, Xcode의 AI/Device Hub 개선이 핵심 변화다.

## 핵심 메시지

Apple은 이번 키노트에서 “새로운 기능을 더하는 것”보다 사용자가 매일 체감하는 기본 경험을 높이는 데 큰 비중을 두었다. 앱 실행, 사진 표시, AirDrop, 파일 전송, 네트워크 전환, 검색 인프라처럼 시스템의 바탕이 되는 영역을 다시 다듬었다.

동시에 WWDC25에서 시작된 Liquid Glass 디자인 방향은 유지하되, 가독성과 분리감을 보강하고 사용자가 투명도와 틴트를 직접 조절할 수 있게 하면서 한 단계 안정화하는 흐름을 보여준다.

가장 큰 주제는 Apple Intelligence와 Siri AI다. Apple은 Google과 협력해 Gemini 모델 시리즈 기술을 활용하고, Apple Foundation Model, 온디바이스 모델, Private Cloud Compute, 시스템 오케스트레이터, 개인 맥락, 화면 인지, 앱 동작, 웹 지식을 하나로 묶는 새로운 아키텍처를 발표했다.

## Chapter 1. Introduction

Tim Cook은 Apple Park에서 WWDC26을 시작하며 Apple 플랫폼과 개발자 커뮤니티의 성장세를 강조했다. App Store에는 매시간 1,000건이 넘는 앱이 제출되고 있으며, 전 세계 20곳의 Apple Developer Academy를 통해 수만 명의 학생들이 개발 여정을 시작했다고 설명했다.

Apple의 기본 철학은 여전히 “기술은 개인적이고, 강력하며, 쓰기 쉬워야 한다”는 것이다. 하드웨어와 소프트웨어의 긴밀한 통합, 그리고 플랫폼 전반의 공통 기반이 개발자들이 일관된 경험을 만들 수 있게 한다는 메시지가 반복된다.

Craig Federighi는 올해 Apple 플랫폼 업데이트의 세 가지 축을 소개했다.

1. 플랫폼 개선을 통한 더 빠르고 쉬운 일상 경험
2. 자녀와 가족을 위한 신뢰 및 안전 기능 강화
3. Apple Intelligence와 Siri의 큰 도약

macOS의 새 이름은 **macOS Golden Gate**로 발표되었다.

## Chapter 2. Platform improvements

### 2.1 플랫폼 개선의 방향

Apple은 제품이 일, 학업, 가정 등 일상 전반에 깊숙이 자리 잡은 만큼 사용자의 기대 수준도 높아졌다고 설명했다. 올해의 플랫폼 개선은 단순한 신기능보다 이미 자주 쓰는 기능을 더 안정적이고 빠르게 만드는 데 초점이 있다.

핵심 키워드는 다음과 같다.

- 반응성
- 안정성
- 사용성
- 디자인 정제
- 검색 인프라 재설계
- 네트워크 전환 개선
- 오래된 기기 지원 유지

### 2.2 Liquid Glass 정제

WWDC25에서 공개된 Liquid Glass는 Apple의 플랫폼 전반 디자인 업데이트의 중심이었다. WWDC26에서는 이 디자인을 유지하되, 사용자와 개발자의 피드백을 반영해 가독성과 실사용성을 개선했다.

Liquid Glass의 주요 변경점은 다음과 같다.

- 복잡한 배경 콘텐츠를 더 효과적으로 흐림 처리
- 전경 UI와 배경 사이의 깊이감 및 분리감 강화
- Liquid Glass 투명도 조절 슬라이더 추가
- 더 투명한 설정과 더 진한 색 틴트 설정 지원
- 이미 Liquid Glass를 적용한 앱에는 시스템 사용자화 옵션이 즉시 반영

### 개발자 관점

Liquid Glass 대응은 더 이상 단일 디자인 값에 맞추는 일이 아니다. 사용자가 투명도와 틴트를 조정할 수 있기 때문에 앱 내부 커스텀 카드, toolbar, bottom sheet, overlay, navigation background가 다양한 시스템 설정에서도 가독성을 유지하는지 확인해야 한다.

### 2.3 macOS Golden Gate 디자인 개선

macOS에서는 Liquid Glass를 보완하면서도 Mac 특유의 구조감을 다시 강화하는 방향이 제시되었다.

주요 변화는 다음과 같다.

- 앱 상단에 더 통일된 toolbar 제공
- 텍스트 레이블과 헤더 가독성 개선
- sidebar가 window edge까지 확장
- sidebar icon에 색상 복귀
- 전면 활성 window 구분성 개선
- 모든 window의 corner radius 일관화
- 앱 아이콘에 Liquid Glass layer 통합

### 개발자 관점

macOS 앱을 제공하는 경우 sidebar, toolbar, inspector, split view 구조를 다시 점검해야 한다. 특히 SwiftUI 기반 macOS 앱이라면 시스템 기본 component를 쓰는 쪽이 새 디자인 변화에 더 자연스럽게 따라갈 가능성이 높다.

### 2.4 성능 및 시스템 반응성 개선

Apple은 메모리 사용량, CPU 활용률, 네트워크 작업, 디스플레이 렌더링 등 시스템 기반 요소를 폭넓게 최적화했다고 설명했다.

발표된 수치는 다음과 같다.

| 영역 | 개선 내용 |
|---|---|
| 앱 실행 | iPhone 및 iPad 앱 실행 최대 30% 향상 |
| 사진 표시 | 새로 찍은 사진이 보관함에 최대 70% 더 빠르게 표시 |
| AirDrop | 사진 및 파일 전송 최대 80% 향상 |
| iPad 파일 전송 | 외장 드라이브 파일 탐색/전송 최대 5배 향상 |
| 시스템 애니메이션 | 홈 화면, Mission Control, Spaces 전환 부드러움 개선 |
| CPU 스케줄러 | iPhone 11까지 확장 적용 |

특히 iOS 27은 iOS 26을 지원하는 모든 모델에서 사용할 수 있으며, iPhone 11까지 포함된다.

### 개발자 관점

앱 실행 속도 개선은 시스템 차원의 preload 최적화와 연관되어 보인다. 하지만 개발자 앱의 실제 체감 속도는 여전히 다음 요소에 좌우된다.

- launch path에서 동기 I/O 제거
- SwiftData/CloudKit 초기화 지연 처리
- 홈 화면 첫 렌더링에 필요한 데이터만 우선 로딩
- 이미지 decode 및 network request 지연 실행
- actor/main actor 경계 최소화
- 앱 시작 시 analytics/config/auth 작업 분리

### 2.5 네트워크 전환 개선

iPhone은 Wi‑Fi와 Cellular 사이를 더 스마트하게 전환하도록 개선된다. 카페 앞을 지나가며 약한 Wi‑Fi에 붙거나, 비행기에서 내린 뒤 항공사 네트워크에 계속 연결되는 상황을 줄이는 것이 목표다.

### 개발자 관점

네트워크 전환이 개선되더라도 앱은 여전히 연결 상태 변화와 partial failure에 강해야 한다.

### 2.6 검색 인프라 재설계

Apple은 iOS, iPadOS, macOS에서 Spotlight, Photos, Mail을 구동하는 검색 기반을 처음부터 다시 설계했다고 설명했다. 핵심은 기기 내 콘텐츠를 기반으로 구축되는 search index다.

변경 방향은 다음과 같다.

- 검색 색인의 안정성 및 효율성 향상
- 기존 콘텐츠와 새 콘텐츠를 더 폭넓게 색인
- 업데이트 후 새로운 검색 인프라가 기기 콘텐츠를 다시 색인
- 새 콘텐츠가 거의 즉시 색인
- Mail의 ranking system 개선

### 개발자 관점

이 변화는 Spotlight indexing의 중요도가 더 커졌다는 뜻이다. 앱 내부 데이터를 시스템 검색에 잘 노출하면 Siri AI, Spotlight, Apple Intelligence 흐름과 자연스럽게 연결될 가능성이 높다.

## Chapter 3. Trust and safety

### 3.1 기본 방향

Apple은 개인정보 보호, 종단간 암호화, Safari 보호 기능, 앱 권한, 충돌 감지 같은 안전 기능을 언급하며, 특히 어린이와 청소년의 안전을 올해의 큰 주제로 다뤘다.

핵심 원칙은 두 가지다.

1. 모든 아이는 다르며, 가족에게 맞는 결정을 내릴 사람은 부모다.
2. 자녀 안전 기능은 임상 및 아동 발달 전문가의 연구를 기반으로 설계되어야 한다.

Apple은 미국 소아과 학회와 협력해 가족 미디어 계획을 Apple 자녀 안전 기능 가이드와 연결한다고 설명했다.

### 3.2 자녀 계정 강화

자녀 계정을 만들면 시스템 전반에 연령에 맞는 보호 기능이 활성화된다.

기능 예시는 다음과 같다.

- 성인 사이트 차단
- 연령에 맞는 미디어 허용
- App Store 콘텐츠 제한
- 기존 계정을 자녀 계정으로 전환 가능

### 3.3 콘텐츠와 웹 브라우징 승인

기존 Ask to Buy 흐름이 앱 다운로드 승인에 초점이 있었다면, 올해는 웹 브라우징까지 확장된다.

- 자녀가 새 웹사이트를 보려면 부모에게 요청
- 부모는 승인 전에 웹사이트를 검토 가능
- Safari에서 iPhone, iPad, Mac 전반에 작동
- 만 13세 미만은 Browsing Request와 Ask to Buy가 기본 활성화
- 청소년 계정에도 활성화 가능

### 3.4 Communication Safety 확장

Communication Safety는 기존에 신체 노출이 포함될 수 있는 이미지나 영상을 경고하고 blur 처리했다. 올해부터는 잔혹하거나 폭력적인 콘텐츠에도 확장된다.

### 3.5 Screen Time 재설계

Screen Time은 자녀가 기기를 어떻게 사용했는지 한눈에 보여주고, 부모가 빠르게 접근 권한을 조정할 수 있도록 재설계된다.

주요 변화는 다음과 같다.

- 엔터테인먼트, 게임, 소셜 미디어 중심의 카테고리
- 카테고리별 일일 권장 허용 시간
- 자녀 연령에 따른 권장 시간
- 학교 시간 등 일정 기반 앱 사용 제한
- 주말 등 가족 루틴에 맞춘 맞춤 일정

### 3.6 개발자 API

Apple은 개발자들이 더 안전한 자녀용 앱을 만들 수 있도록 API와 리소스를 제공한다.

주요 API/기능은 다음과 같다.

- 신체 노출 또는 폭력 콘텐츠 차단 지원
- 앱 내 새 연락처 추가 시 부모 승인 흐름
- Declared Age Range API
- 연령대 기반 앱 경험 제공
- 개인정보 보호 기반의 연령 정보 활용

### 개발자 관점

일반 생산성/라이프스타일 앱이라도 사용자 생성 콘텐츠, 커뮤니티, 메시징, AI 대화, 이미지 생성 기능이 들어가면 자녀 안전 요구사항과 연결될 수 있다.

## Chapter 4. Apple Intelligence and Siri

### 4.1 Apple Intelligence의 새 아키텍처

Apple은 차세대 Apple Intelligence를 “사용자와 사용자가 매일 쓰는 Apple 제품 중심”으로 설계했다고 설명했다.

핵심 구성은 다음과 같다.

| 구성 요소 | 설명 |
|---|---|
| Apple Foundation Model | Apple Intelligence의 핵심 모델 |
| Gemini 기술 협력 | Google과 협력해 Gemini 모델 시리즈 기술 활용 |
| On-device model | 음성, 텍스트, 이미지 이해 및 생성 지원 |
| Private Cloud Compute | 서버 기반 모델을 개인정보 보호 방식으로 실행 |
| System Orchestrator | 개인 맥락, 앱 동작, 화면 인지, 웹 지식 조율 |
| Semantic Index | Spotlight 기반 개인 데이터 검색 |
| App Actions | 앱 도구를 찾아 사용자 요청 수행 |
| Screen Awareness | 현재 화면과 작업 상황을 이해 |
| Web Knowledge | 최신 정보를 웹에서 찾아 답변 생성 |

Apple은 많은 AI 제공업체들이 개인정보 보호 책임을 사용자에게 떠넘긴다고 비판하며, Apple Intelligence는 온디바이스 처리와 Private Cloud Compute를 통해 Apple도 사용자 데이터를 저장하거나 접근할 수 없다고 강조했다.

### 4.2 Siri AI

새로운 Siri는 **Siri AI**로 소개되었다. Apple Intelligence 기반으로 동작하며, 기존처럼 “Siri야”로 호출할 수 있다.

Siri AI의 핵심 능력은 다음과 같다.

- 개인적 맥락 이해
- 앱 동작 수행
- 화면 내용 인지
- 이미지 이해
- 세계 지식 활용
- 대화 맥락 유지
- 풍부한 답변 제공
- 전용 Siri 앱에서 대화 기록 확인
- 시스템 전반의 글쓰기 및 편집 지원

### 4.3 Siri AI 예시

키노트에서 소개된 예시는 Siri가 단순 명령 수행을 넘어 개인 맥락, 화면 내용, 세계 지식, 앱 동작을 조합하는 방향을 보여준다.

예시 1: 콘서트 정보

- “샌프란시스코에서 열리는 Suki Waterhouse 공연은 언제야?”
- Siri가 최신 세계 지식으로 날짜 확인
- 티켓 추첨 정보를 확인
- 추첨 오픈 시 미리 알림 생성
- 관련 음악 재생

예시 2: 화면 속 사진과 친구 주소

- 사진 속 장소를 Siri가 인식
- 친구 Jeff의 새 주소를 개인 메시지에서 찾음
- “Jeff의 집에 들렀다가 아치 모양 바위로 가는 길 알려줘” 요청 수행

예시 3: 사진 검색과 공유

- “지난 주말에 샤스타에서 찍은 사진 보여줘”
- 특정 인물이 나온 사진만 가족 공유 앨범에 추가

예시 4: 월드컵 응원 파티 계획

- 경기 일정 확인
- 브라질/모로코 대표 요리 제안
- 딸이 말한 디저트를 메시지에서 검색
- 메뉴 구성
- 단체 대화방에 초대 메시지 작성 및 메뉴 첨부

예시 5: Mac 파일 비교와 이메일 작성

- 여러 견적 파일 선택
- Siri가 비교 표 생성
- 메시지/이메일에서 아들이 언급한 문제를 찾아 추천
- 계약업체에 보낼 정중한 이메일 초안 작성

### 4.4 Siri 앱과 플랫폼 확장

Siri AI는 iPhone, iPad, Mac, Apple Watch, Vision Pro 등 여러 플랫폼에 맞게 제공된다.

| 플랫폼 | Siri AI 경험 |
|---|---|
| iOS | Dynamic Island에서 대화 시작, 음성/타이핑 지원 |
| macOS | Spotlight 통합, quick menu, 파일/텍스트/이미지 질문 |
| iPadOS | 풍부한 대화 경험 지원 |
| watchOS | 손목에서 질문 및 동작 수행 |
| visionOS | 3D Siri 시각화, 바라보는 대상에 질문 |
| CarPlay / AirPods | Siri 업데이트 확장 |

Siri 앱은 대화 기록을 iCloud와 비공개로 동기화하여 iPhone에서 시작한 대화를 iPad와 Mac에서 이어갈 수 있다.

### 4.5 비주얼 인텔리전스

Siri는 모든 플랫폼에서 비주얼 인텔리전스를 제공한다.

주요 예시는 다음과 같다.

- iPhone 카메라 앱의 새로운 Siri 모드
- 눈앞의 대상에 관한 정보 제공
- 음식 접시를 비추면 영양 정보 표시
- 계산서를 비추고 Apple Cash로 비용 나누기
- macOS에서 화면 일부를 선택해 Siri에게 질문
- iPad 스크린샷 경험에 통합
- visionOS에서 바라보는 사물에 대해 질문

### 4.6 글쓰기 도구 통합

Siri는 타이핑 가능한 거의 모든 곳에서 글쓰기 도구로 동작한다.

가능한 작업은 다음과 같다.

- 자연어 설명으로 초안 작성
- Mail과 메시지에서 상대와의 평소 소통 방식 반영
- 작성한 글에 대한 피드백 제공
- 시스템 전반 자동 교정
- 대부분의 서드파티 앱 지원

### 개발자 관점

텍스트 입력을 제공하는 앱은 시스템 글쓰기 도구와 충돌하지 않도록 확인해야 한다. 커스텀 text editor, Markdown editor, rich text editor를 구현한 앱은 selection, focus, input accessory, undo/redo 흐름을 점검해야 한다.

## Apple Intelligence가 앱에 들어오는 방식

### 5.1 Safari

Safari는 Apple Intelligence를 활용해 탭을 주제별로 정리한다.

- 열린 탭을 분석해 공통 주제별로 그룹화
- 새 관련 탭을 자동으로 주제에 추가
- 주제 전체를 닫거나 탭 그룹으로 저장 가능

또한 Safari는 페이지 변경을 자동 모니터링하는 “알림 받기” 기능을 제공한다.

- 캠프 신청
- 제품 재입고
- 특정 페이지 업데이트

사용자는 자연어로 원하는 조건을 설명하고 탭을 닫아도 된다.

### 5.2 Safari 확장 프로그램 생성

사용자가 자연어로 원하는 웹페이지 조정을 설명하면 Safari가 맞춤형 확장 프로그램을 만들어준다.

예시:

- 레시피 저장 버튼 추가
- 평가 버튼 추가
- 웹페이지 도구 막대 커스터마이즈

### 5.3 암호 앱

암호 앱은 Apple Intelligence 및 Safari를 활용해 약하거나 유출된 암호를 자동으로 강력한 암호로 변경할 수 있게 된다.

### 5.4 메시지, Mail, 캘린더, 전화

Apple Intelligence는 커뮤니케이션과 일정 관리에도 깊이 통합된다.

| 앱 | 기능 |
|---|---|
| 메시지 | 대화 맥락 기반 제안, 미리 알림/메모 생성, 사진 검색 지원 |
| Mail | 맥락 기반 제안, 서드파티 앱과 연결된 대응 |
| 캘린더 | 자연어로 이벤트 추가 및 편집 |
| 전화 | 통화 상대방 기반으로 관련 정보 표시 |

전화 앱의 통화 맥락 기능은 대화 내용을 분석하는 것이 아니라 통화 상대방을 기반으로 관련 앱 정보를 불러오며, 온디바이스에서 실행된다고 설명했다.

### 5.5 홈 앱

홈 앱은 Apple Intelligence로 액세서리 알림과 카메라 경험을 개선한다.

- 관련 알림을 하나의 활동으로 묶어 업데이트
- 호환 카메라의 녹화 클립 내용 요약
- 여러 카메라의 관련 클립 연결
- 촬영 내용 기반 카메라 클립 검색
- 지원 카메라에서 4K 녹화 클립 지원

### 5.6 단축어

단축어는 자연어 설명만으로 자동화 작업을 생성할 수 있게 된다.

예시:

“퇴근할 때 ‘지금 가는 중’이라는 메시지와 도착 예정 시간을 Pedro에게 보내줘”

단축어는 다음을 조합한다.

- 직장 주소 이탈 감지
- 지도에서 집 도착 시간 계산
- 메시지 앱으로 전송
- 추가 요청에 따라 팟캐스트 재생 같은 작업 추가

### 개발자 관점

단축어의 자연어 생성이 강해질수록 App Intents 품질이 중요해진다. 앱이 제공하는 action이 명확하고, parameter가 자연어로 잘 설명되며, entity가 잘 정의되어 있어야 Siri와 Shortcuts가 사용자의 의도를 정확히 매핑할 수 있다.

## Image Playground와 사진 앱

### 6.1 Image Playground

Image Playground는 새로운 이미지 모델을 기반으로 완전히 새롭게 바뀐다.

주요 기능은 다음과 같다.

- 사진처럼 사실적인 이미지 생성
- 다양한 스타일의 고품질 이미지 생성
- 사진 보관함의 사람을 활용한 이미지 생성
- 자연어로 스타일 변환
- 선택한 객체를 터치로 수정
- 위치, 크기, 세부 요소 변경
- 가로형/세로형 등 사용 목적에 맞는 규격 선택
- 메시지 배경, 연락처 포스터, 잠금 화면 배경화면 생성
- Image Playground API 제공

일부 이미지 생성 기능은 서버 모델을 사용하므로 일일 사용량 제한이 있으며, 대부분의 iCloud+ 구독 요금제로 사용량 확대가 가능하다고 설명했다.

### 6.2 사진 앱 편집 기능

사진 앱은 Apple Intelligence 이미지 모델을 활용해 세 가지 주요 편집 기능을 제공한다.

1. Cleanup 개선
2. Expand
3. Spatial Reframing

Cleanup은 더 높은 품질과 사실적인 채우기 효과로 방해 요소를 제거한다.

Expand는 이미지 바깥 영역을 확장해 피사체 주변에 더 많은 공간을 만들거나 다른 종횡비에 대응한다.

Spatial Reframing은 사진 촬영 후에도 카메라 위치를 바꾼 것처럼 시점을 조정할 수 있는 기능이다. 온디바이스 공간 모델로 실시간 미리보기를 제공하고, Private Cloud Compute의 이미지 생성 모델로 부족한 영역을 채운다.

### 개발자 관점

사진과 이미지가 중요한 앱은 시스템 이미지 편집 기능의 발전으로 사용자의 기대 수준이 크게 올라갈 수 있다. 단순 crop/filter 수준의 편집 기능은 시스템 기능과 비교될 수 있으므로, 앱 고유의 맥락 기반 편집이나 워크플로 통합이 중요해진다.

## 개발자 도구와 프레임워크

### 7.1 App Intents와 Spotlight

Apple은 Siri AI가 앱의 정보를 찾고 작업을 수행하기 위해 기존 기술인 App Intents와 Spotlight 인덱싱을 활용한다고 설명했다.

예시로 Line은 콘텐츠를 Spotlight에 인덱스화하여 Siri가 Line 대화에서 정보를 찾을 수 있게 하고, Structured는 App Intents를 통해 Siri가 이벤트를 생성하고 타임라인에 추가할 수 있게 한다.

### 7.2 Foundation Model framework

Foundation Model framework는 온디바이스 모델을 앱에서 활용할 수 있게 해준다.

WWDC26에서 언급된 변화는 다음과 같다.

- 텍스트뿐 아니라 이미지 입력 지원
- 커스텀 스킬로 모델 역량 확장
- 서버에서 실행되는 모델도 동일한 Swift API로 사용 가능
- 보안이 우선인 앱에서 로컬 모델 활용 가능

### 7.3 Core AI framework

Core AI는 Apple Silicon의 성능을 활용해 다른 모델을 앱에서 로컬로 실행할 수 있게 하는 프레임워크로 소개되었다. 모든 Apple 플랫폼에서 지원된다.

### 7.4 Xcode

Xcode는 에이전틱 코딩 시대의 중심 도구로 소개되었다.

주요 변화는 다음과 같다.

- Coding Assistant가 앱 전체 현지화 지원
- 시뮬레이션 기기 제어
- 커스텀 스킬로 앱 기능 확장
- Gemini 포함 원하는 모델과 에이전트 선택
- Figma, GitHub 같은 도구 연결

### 7.5 Device Hub

새로운 Device Hub는 시뮬레이터와 실제 기기를 단일 통합 인터페이스로 가져온다.

기능 예시는 다음과 같다.

- 시뮬레이터/실기기 통합 관리
- 멀티터치 조작 시뮬레이션
- swipe, pinch 테스트
- 클릭 한 번으로 앱 외형 변경
- 동적 크기 조절
- 더 빠른 반복 테스트

## WWDC Archive용 짧은 설명

WWDC26 Keynote introduced Apple’s next major platform updates, focusing on refined system experiences, expanded child safety tools, and a major leap forward for Apple Intelligence and Siri. Apple refined Liquid Glass with improved readability and user customization, announced macOS Golden Gate, improved system responsiveness across app launch, photos, AirDrop, files, networking, and search, and continued broad device support with iOS 27.

The keynote’s main focus was the next-generation Apple Intelligence architecture and Siri AI. Apple described a system built around Apple Foundation Models, on-device intelligence, Private Cloud Compute, semantic indexing, screen awareness, app actions, and web knowledge. Siri AI gains richer conversations, personal context, visual intelligence, writing tools, and deeper integration across iPhone, iPad, Mac, Apple Watch, Vision Pro, CarPlay, and AirPods.

For developers, the most important changes are App Intents, Spotlight indexing, Foundation Model framework with image input, custom skills, Core AI for local model execution, Xcode’s expanded coding assistant, model and agent selection, Figma/GitHub integration, and the new Device Hub for testing across simulators and real devices.

## 개발자 체크리스트

- [ ] iOS 27 / iPadOS / macOS Golden Gate beta에서 앱 빌드 확인
- [ ] Liquid Glass 투명도/틴트 설정별 UI 가독성 확인
- [ ] App Intents 후보 정의
- [ ] Spotlight indexing 대상 모델 정리
- [ ] Foundation Model framework 세션 확인
- [ ] Core AI framework 세션 확인
- [ ] Siri AI / App Intents 연동 세션 확인
- [ ] Shortcuts 자연어 생성 흐름 확인
- [ ] Xcode Device Hub 테스트 플로우 확인
- [ ] Image Playground API 활용 가능성 검토
- [ ] 사진 앱 편집 기능 변화가 이미지 workflow에 주는 영향 검토
- [ ] 자녀 안전 API / Declared Age Range API 필요성 검토

## 관련 후속 세션 우선순위

1. Platforms State of the Union
2. Apple Intelligence overview
3. Siri AI / App Intents 관련 세션
4. Foundation Model framework
5. Core AI framework
6. Spotlight / semantic indexing 관련 세션
7. SwiftUI / Liquid Glass design 세션
8. Xcode / Device Hub 세션
9. Shortcuts / App Intents automation 세션
10. Privacy / Private Cloud Compute 세션

## 정리

WWDC26 Keynote는 WWDC25에서 제시된 Liquid Glass와 Apple Intelligence 방향을 더 현실적인 제품 경험으로 확장하는 발표였다. Liquid Glass는 가독성과 사용자 설정을 통해 안정화 단계에 들어갔고, 플랫폼 성능과 검색 인프라는 일상적인 체감 품질을 높이는 방향으로 개선됐다.

가장 큰 변화는 Siri AI다. Siri가 개인 맥락, 화면 내용, 앱 동작, 웹 지식, 이미지 이해를 조합하는 시스템 레벨 인터페이스로 확장되면서, 앱이 App Intents와 Spotlight에 얼마나 잘 연결되어 있는지가 앞으로 더 중요해질 가능성이 높다.
