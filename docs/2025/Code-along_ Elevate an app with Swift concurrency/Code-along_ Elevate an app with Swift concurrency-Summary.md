# Code-along_ Elevate an app with Swift concurrency

- Code-along: Elevate an app with Swift concurrency https://developer.apple.com/videos/play/wwdc2025/270/ 🧭 세션 목적 Swift 와 SwiftUI 앱에서 동시성 처리의 필요성을 이해하고 , async/await, @concurrent, TaskGroup, nonisolated, @Sendable 등의 Swift 6 최신 동시성 기 능을 실전에서 어떻게 사용하는지를 학습합니다 .

- 🎯 예제 앱 개요 사용자가 사진을 선택하면 , 스티커를 추출하고 , 해당 사진의 주요 색상으로 배경 그라데이션을 생성한 뒤 , 이를 캐러셀 (Carousel) 과 그리드 (Grid) 로 표시하고 공유하는 기능을 갖춘 앱입니다 .



## 🧩 단계별 구현 및 최적화 과정


- 📷 사진 불러오기 ( 비동기 처리 도입 ) PhotosPickerItem을 통해 사진을 선택하고 , loadTransferable을 통해 Data를 비동기로 가져옵니다 .

- loadPhoto() 함수에 async 키워드 추가 , await로 데이터 로딩 처리 → UI 가 멈추지 않음

- ✂ 이미지 처리 ( 스티커 추출 + 색상 추출 ) 기존에는 단순히 Data → Image로 표시했지만 , PhotoProcessor를 사용해 스티커와 색상 정보를 추출한 뒤 ProcessedPhoto로 반환합니다 .

- 이를 기반으로 GradientSticker 뷰로 표시

- 🧵 이미지 처리 성능 문제 발생 스티커 및 색상 추출 작업이 PhotoProcessor 내부에서 메인 스레드에서 수행됨 Instruments 로 분석해 보니 심각한 UI 멈춤 (Hangs) 발생

- 해결책 : PhotoProcessor를 메인 스레드에서 분리

- 🧯 메인 스레드 분리하기 PhotoProcessor 타입에 nonisolated를 적용 → MainActor 에 묶이지 않도록 설정 process() 메서드에 @concurrent async 적용 → 항상 백그라운드 스레드에서 실행

- 🏎 병렬 처리로 속도 향상 (async let) 스티커 추출과 색상 추출은 서로 독립적 → async let을 사용해 병렬 처리

  - 예 :

- swift CopyEdit

- async let sticker = extractSticker(data) async let colors = extractColors(data)

- let processed = try await ProcessedPhoto(sticker: sticker, colors: colors)

- 🚨 Data Race 문제 해결 PhotoProcessor 내부에 있던 ColorExtractor 인스턴스가 공유되며 Data Race 발생 Swift 6 에서 컴파일 타임에 Data Race 감지

- 해결책 : ColorExtractor 인스턴스를 extractColors() 내부 로컬 변수로 이동 → 인스턴스 간 공 유 제거

- 🎨 visualEffect 적용 중 발생한 Data Race visualEffect는 SwiftUI 가 백그라운드에서 처리함 → 클로저가 @Sendable로 선언됨 클로저에서 ViewModel 의 상태 (selection) 를 직접 참조하면서 에러 발생

- 해결 : 클로저 캡처 리스트로 값 복사본을 전달 → swift CopyEdit visualEffect { [selection] in ... }

- 🧪 TaskGroup 도입 ( 여러 사진 일괄 처리 ) processAllPhotos()에서 여러 사진을 동시에 병렬 처리해야 함 TaskGroup 사용 → 유연하게 임의 개수의 비동기 작업을 생성하고 결과 수집 가능

  - 예 :

- swift CopyEdit

- await withTaskGroup(of: ProcessedPhoto.self) { group in for item in unprocessedPhotos { group.addTask { let data = try await

- item.loadTransferable(type: Data.self) return try await processor.process(data) } } for await processed in group { self.processedPhotos[processed.id] = processed } }

- 🔗 Share 기능 추가 StickerGrid에서 스티커가 모두 처리된 후 ShareLink로 스티커를 한 번에 공유할 수 있음 UI 는 finishedLoading 상태 값으로 로딩 여부를 판단하여 처리 중에는 ProgressView 표시



## ✅ 최종 정리 : Swift Concurrency 최적화 전략


최적화 방법 설명 async/await 도입 비동기 데이터 로딩으로 UI 멈춤 제거 @concurrent + nonisolated 사용자 정의 타입을 백그라운드에서 실행 가능하게 분리

async let 독립 작업 ( 스티커 / 색상 추출 ) 을 병렬 처리 TaskGroup 유동적인 개수의 비동기 작업 처리 @Sendable 인지하기 백그라운드에서 실행되는 SwiftUI 클로저는 값 복사로 해결

Data Race 사전 감지 Swift 6 의 컴파일 타임 검사를 통해 런타임 충돌 방지 🧠 함께 보면 좋은 세션 Analyze hangs with Instruments Beyond the basics of structured concurrency

Explore concurrency in SwiftUI Swift Migration Guide
