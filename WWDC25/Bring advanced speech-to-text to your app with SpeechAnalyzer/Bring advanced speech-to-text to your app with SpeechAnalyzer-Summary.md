# Bring advanced speech-to-text to your app with SpeechAnalyzer

Bring advanced speech-to-text to your app with SpeechAnalyzer https://developer.apple.com/videos/play/wwdc2025/277/



## ✅ 새로운 SpeechAnalyzer API 소개


- Speech-to-Text 기술의 진화: 기존 SFSpeechRecognizer의 한계를 보완하여 , iOS 26에서 새롭 게 도입 .

- Swift 기반 비동기 처리: SpeechAnalyzer와 Transcriber 클래스를 통해 오디오를 비동기적으로 분석하고 , 결과를 AsyncSequence로 전달 .

- 모듈 구조: SpeechAnalyzer에 분석 모듈 (Transcriber) 을 추가하여 음성을 텍스트로 변환 .

- 시간코드 기반 처리: 오디오 타임라인 기준으로 결과를 정렬하고 업데이트 가능 .

- 🆕 모델 특징 (SpeechTranscriber)

- 장거리 오디오 / 긴 대화 지원: 회의 , 강의 , 전화 등 다양한 음성 상황에 적합 .

- 저지연 / 고정확도 실시간 처리: 즉각적인 피드백 제공이 가능하며 , 시간이 지나며 정확도 향상됨 .

- 온디바이스 모델: 개인정보 보호 보장 . AssetInventory API 로 다운로드 가능 .

- 자동 업데이트 및 스토리지 최적화: 앱 용량이나 메모리 사용량에 영향을 주지 않음 .

- 🔁 실시간 변환의 두 가지 결과

- Volatile Result: 실시간 빠른 추정 결과 , 정확도 낮음 .

- Finalized Result: 더 많은 오디오를 분석해 얻은 최종 결과 . Volatile 결과를 대체 .

- 🧑‍💻 실습 데모 : 아이들을 위한 동화 녹음 앱

- 기능: 실시간 녹음 및 텍스트 변환 , 음성과 텍스트 싱크 맞춰 재생 시 하이라이팅 .

- 구성 요소:

- Recorder & SpokenWordTranscriber: 녹음 및 변환 관리

- Story 모델 : 트랜스크립트 저장

- TranscriptView: 녹음 / 재생 및 결과 표시 UI

- 통합 방법:

- SpeechTranscriber 설정 ( 언어 , 옵션 , 모델 다운로드 등 )

- 오디오 입력 스트림 연결 (AVAudioEngine)

- 결과 처리 및 뷰에 연결 (SwiftUI 의 AttributedString 사용해 하이라이트 ) 🧠 Apple Intelligence 와 통합 변환된 텍스트에 대해 요약 / 변환 등의 AI 처리를 추가 가능 .

  - 예 : FoundationModels API 로 이야기 제목 자동 생성 .

- 📎 결론 SpeechAnalyzer 는 더 빠르고 정확하며 , 온디바이스에서 개인 정보 보호까지 보장하는 음성 인식

  - 솔루션.

  - 적은 코드로도 강력한 음성 기능을 쉽게 구현 가능 .

  - Notes, Voice Memos, Journal 등 Apple 의 앱에서도 이미 사용 중 .
