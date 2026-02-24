# Read documents using the Vision framework

Read documents using the Vision framework https://developer.apple.com/videos/play/wwdc2025/272/



## ✨ 개요


Vision 프레임워크에 2 개의 신규 Request가 추가되고 , Hand Pose 모델이 교체된 업데이트를 다 루는 세션

  - 신규 기능

- 문서 구조 인식: RecognizeDocumentsRequest

- 렌즈 오염 ( 지문 / 기름 ) 감지: DetectLensSmudgeRequest 추가로 손 포즈 (21 joints) 감지 모델이 더 작고 정확한 모델로 교체됨 📄 RecognizeDocumentsRequest: 문서 “ 구조 ” 까지 이해

- 기존 RecognizeTextRequest는 텍스트를 라인 단위로 뽑지만 , 문서의 구조 ( 문단 / 표 / 목록 ) 를 잃기 쉬 움

- 신규 RecognizeDocumentsRequest는 텍스트 26 개 언어 인식

- 문서 요소 감지 : 표(tables), 목록 (lists), 문단 (paragraphs), QR/ 바코드, 일반 텍스트 이메일 / 전화번호 /URL 같은 “ 중요 정보 ” 를 함께 식별해 파싱을 단순화 🧱 결과 타입 : DocumentObservation 의 계층 구조 RecognizeDocumentsRequest 결과는 DocumentObservation 문서는 container 이며 다음을 포함 가능 text, tables, lists, barcodes List item 도 container라서 내부에 텍스트 / 다른 요소가 중첩 가능

- 현재는 이미지 1 장당 DocumentObservation 1 개가 반환되는 구조 📋 Table 파싱이 쉬워진 이유 table 은 2D array of cells로 제공 row/column 로 접근 가능 table 은 boundingRegion으로 문서 내 좌표 제공 cell 은 row/column 소속 정보를 Range로 가짐 ( 병합 셀 지원 ) content 가 container 라서 텍스트 / 바코드 / 리스트 등 무엇이든 올 수 있음 결과적으로 “ 좌표 기반으로 행을 추정 ” 하는 후처리를 대부분 제거 가능

- 📝 Container 안의 Text 를 보는 다양한 방법

- transcript: 컨테이너 전체 텍스트를 단일 문자열로

- lines: 라인 배열

- paragraphs: 문단 단위 ( 라인을 더 자연스럽게 그룹화 )

- words: 단어 리스트 ( 단 , 중국어 / 일본어 / 한국어 / 태국어는 미지원)

- detectedData: 텍스트 내 의미 있는 데이터( 이메일 , URL 등 ) 목록



## 🔎 DataDetection 기반 “ 중요 정보 ” 추출


Vision 이 새로운 DataDetection 프레임워크로 문자열을 스캔 감지 가능한 대표 항목 전화번호 , 이메일 , 우편주소 URL( 링크 ) 날짜 / 시간 ( 캘린더 이벤트 )

측정값 + 단위 , 금액 + 통화 운송장 / 결제 식별자 / 항공편 번호 등 🧾 샘플 시나리오 : 신청서 ( 표 ) 에서 연락처 만들기 문서에서 table 을 찾고 row 단위로 순회하며 contact 생성

1 열 : 이름 (transcript)

- 나머지 열 : detectedData를 확인해 이메일 / 전화번호 추출 추가로 table 을 **TSV(Tab-separated)** 로 export 해서 Notes/Numbers 에 붙여넣기 가능 🧼 DetectLensSmudgeRequest: 렌즈 오염 감지 사진이 렌즈 오염 ( 지문 등 ) 으로 흐려졌는지 판별 결과는 smudge observation 의 confidence(0~1) 1 에 가까울수록 “ 오염일 확률 ” 높음 threshold 를 정해 특정 점수 이상은 “ 재촬영 유도 / 렌즈 닦기 안내 ”

- 특정 점수 이하는 처리 계속 ⚠ Smudge 판정 해석 시 주의점 smudge 가 아니어도 모션 블러 장노출 안개 / 구름 같은 케이스가 smudge 처럼 나올 수 있음 ( 오탐 가능 ) 반대로 smudge score 가 낮아도 “ 좋은 사진 ” 이라는 보장은 없음 함께 쓰면 좋은 API

- 얼굴이 있으면 : DetectFaceCaptureQualityRequest

- 일반 사진이면 : CalculateImageAestheticScoresRequest (utility image 판별 포함 ) ✋ Hand Pose Detection 모델 업데이트 DetectHandPoseRequest는 계속 21 개 관절을 제공 모델이 더 작고 현대화된 모델로 교체 정확도 향상 메모리 사용 감소 지연 시간 감소 단 , 관절 위치가 이전과 완전히 동일하지 않으므로 과거에 학습한 hand pose/action classifier 가 있다면 재학습 권장
