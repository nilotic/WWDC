# WWDC26 — Migrate to Swift Testing

- Session: 267
- Source: https://developer.apple.com/videos/play/wwdc2026/267/
- 근거: Apple 공식 전체 transcript 및 코드 예제

## 🎯 핵심 요약

기존 XCTest를 모두 다시 작성할 필요 없이 새 테스트부터 Swift Testing으로 작성하고, **test framework interoperability**를 통해 기존 assertion helper를 재사용하면서 점진적으로 이전한다. Xcode 27의 interoperability mode 설정은 테스트의 성공·실패 판정에 영향을 미치므로 특히 중요하다.

## 🧱 Swift Testing 기본

`@Test`로 테스트를 선언하고 `#expect`로 조건을 검사한다. `XCTFail`에 대응하는 API는 `Issue.record`다. 테스트 이름에는 백틱 raw identifier를 사용해 공백과 구두점을 넣을 수 있다.

```swift
import Testing
@testable import DemoApp

@Test func `Default climate: tropical`() async throws {
    let fruit = Fruit(name: "Coconut")
    #expect(fruit.climate == .tropical)
}
```

Swift Testing은 Swift concurrency를 고려해 설계되었고, 테스트 케이스를 기본적으로 병렬 실행한다.

**XCTest 유지가 필요한 영역:** UI automation, performance testing, Objective-C exception을 처리하는 Objective-C XCTest. Swift로 작성한 XCTest도 Objective-C exception을 안전하게 처리할 수 없다.

## 🪜 단계적 마이그레이션

- 기존 XCTest를 당장 수정하지 않고 자주 변경하는 테스트부터 이전한다.
- 새 테스트는 Swift Testing으로 작성한다.
- 두 프레임워크의 테스트는 같은 target, 같은 소스 파일에 공존할 수 있다.
- 다만 `@Test` 함수는 `XCTestCase` 클래스 안에 선언하지 않는다.
- 기존 XCTest assertion helper를 재사용하며 cross-framework issue를 관찰한다.

## 🔗 Framework interoperability

Cross-framework issue는 테스트가 속한 프레임워크와 issue를 보고하는 API의 프레임워크가 다른 경우다. 예를 들어 Swift Testing의 `@Test`에서 기존 helper를 호출하고, 그 helper가 `XCTFail`을 호출할 수 있다.

```swift
func assertUnique(
    _ fruits: [Fruit],
    file: StaticString = #filePath,
    line: UInt = #line
) {
    var uniqueNames = Set<String>()
    for name in fruits.map(\.name) {
        if !uniqueNames.insert(name).inserted {
            XCTFail("Duplicate name: \(name)", file: file, line: line)
        }
    }
}
```

### Interoperability modes

| Mode | XCTest → Swift Testing issue | 의미 |
|---|---|---|
| Limited | Warning | 실패가 경고로 바뀌어 테스트가 통과할 수 있음 |
| Complete | Error | 원래의 실패 판정을 유지하고 migration warning도 제공 |
| Strict | Fatal error | 해당 XCTest issue-reporting API 호출 지점에서 중단 |
| None | Cross-framework issue 보고하지 않음 | 잠재적 버그를 놓칠 수 있으므로 임시 사용만 권장 |

Xcode 27 이전에 생성된 Test Plan은 Limited를 상속하며, 새 프로젝트는 Complete를 기본 사용한다. **Test Plan Settings → Test Execution**에서 변경할 수 있다. 세션은 Complete 또는 Strict를 권장한다.

Swift Package에서는 Swift 6.4 toolchain으로 `swift-tools-version: 6.3` 프로젝트를 실행하면 Limited가 기본이며, tools version을 6.4 이상으로 올리면 Complete가 기본이다. 환경변수로 직접 변경할 수도 있다.

```bash
SWIFT_TESTING_XCTEST_INTEROP_MODE=strict swift test
```

세션에서 명시한 지원 API는 XCTest assertions, Swift Testing의 `Issue.record`, `#expect`, `#require`, known issue API 및 `Test.cancel`이다. 임의의 모든 API가 interoperability를 지원하는 것은 아니다.

## 🛠️ Assertion helper 이전

`XCTFail`을 `Issue.record`로 변경하고 파일·행 정보 대신 `SourceLocation`을 전달한다.

```swift
import Testing

func assertUnique(
    _ fruits: [Fruit],
    sourceLocation: SourceLocation = ...
) {
    var uniqueNames = Set<String>()
    for name in fruits.map(\.name) {
        if !uniqueNames.insert(name).inserted {
            Issue.record(
                "Duplicate name: \(name)",
                sourceLocation: sourceLocation
            )
        }
    }
}
```

위 `...`는 공식 영상 코드의 생략 표기이며 그대로 컴파일되는 기본값이 아니다.

변경 후 기존 XCTest와 새 Swift Testing 테스트 모두 의도한 실패를 기록하는지 확인한다. 반대 방향인 Swift Testing API → XCTest issue는 모든 interoperability mode에서 error로 처리된다.

## ⏭️ Skip과 중단 동작 이전

XCTest의 `XCTSkipIf`는 `Test.cancel`로 바꿀 수 있다.

```swift
if !isFall {
    try Test.cancel("Wrong season for migration")
}
```

새 테스트에서는 조건을 본문에서 분리한 trait가 더 적합하다.

```swift
@Test(.enabled(if: isFall, "Wrong season for migration"))
func `Swallow fall migration`() async throws {
    // ...
}
```

XCTest의 `continueAfterFailure = false` 대신 중단이 필요한 조건에는 `try #require`를 사용한다.

```swift
#expect(Fruit.banana.climate == .temperate)
try #require(Fruit.banana == Fruit.plantain)
```

`#expect`는 실패를 기록하고 계속 진행할 수 있지만, `#require`는 실패 시 throw하여 테스트를 중단한다.

## 🧪 Parameterized tests

기존 중첩 루프:

```swift
struct BirdTests {
    @Test func `Birds flap wings successfully`() async throws {
        for bird in Aviary.birds {
            for count in 40...100 {
                try await bird.flapWings(count: count)
            }
        }
    }
}
```

개별 조합을 테스트 케이스로 분리:

```swift
struct BirdTests {
    @Test(arguments: Aviary.birds, 40...100)
    func `Birds flap wings successfully`(
        bird: Bird, count: Int
    ) async throws {
        try await bird.flapWings(count: count)
    }
}
```

`bird × count` 조합마다 독립적인 케이스가 생성된다. 병렬 실행으로 빨라지고 Test navigator에서 실패 입력을 확인할 수 있다. 시연에서는 swallow가 43회 미만으로 날갯짓할 수 없는 경우를 찾아냈다.

## 💥 Exit tests

`preconditionFailure`처럼 프로세스를 종료하는 경로도 검증할 수 있다.

```swift
// Bird.init 내부
if name.isEmpty {
    preconditionFailure("Bird name cannot be empty")
}
```

```swift
extension BirdTests {
    @Test func `Bird with empty name crashes`() async throws {
        await #expect(processExitsWith: .failure) {
            _ = Bird(name: "")
        }
    }
}
```

Swift Testing은 본문을 **별도 child process**에서 실행하고 종료 상태를 검증한다. Crash가 다른 테스트에 영향을 주지 않으며, 기존에 실행하지 못했던 코드 경로를 coverage에 포함시킬 수 있다.

**지원 플랫폼:** macOS, Linux, FreeBSD, Windows. 공식 세션은 iOS 지원을 명시하지 않는다.

## 📋 마이그레이션 체크리스트

- [ ] XCTest UI automation / performance 테스트 유지
- [ ] 새 unit test부터 `@Test`와 `#expect` 도입
- [ ] `XCTestCase` 내부에 `@Test`를 선언하지 않기
- [ ] Test Plan interoperability mode 확인
- [ ] Limited를 Complete 또는 Strict로 전환 검토
- [ ] Cross-framework warnings와 failures 확인
- [ ] 공용 `XCTFail` helper를 `Issue.record`로 이전
- [ ] `SourceLocation`으로 오류 발생 위치 보존
- [ ] XCTest·Swift Testing 양쪽에서 helper 동작 검증
- [ ] Skip 로직은 `Test.cancel` 또는 trait로 이전
- [ ] 필수 조건은 `#require` 사용
- [ ] 반복 조합은 parameterized tests로 분리
- [ ] 지원 플랫폼에서 exit tests로 crash 경로 검증
- [ ] Swift Package tools version과 interop mode 검토

## 🧠 핵심 메시지

**기존 테스트를 보존하면서 새 테스트부터 Swift Testing을 도입하는 것이 권장 경로**다. Interoperability 덕분에 기존 helper를 재사용할 수 있지만 Limited mode에서는 실패가 warning으로 낮아져 테스트가 통과할 수 있다는 점에 주의해야 한다. Complete 또는 Strict를 사용해 검증의 의미를 유지하고, 이후 parameterized tests와 exit tests로 속도·진단·coverage를 확장한다.

## 🔗 함께 볼 자료

- [공식 영상 — Migrate to Swift Testing](https://developer.apple.com/videos/play/wwdc2026/267/)
- WWDC24 — Meet Swift Testing
- WWDC24 — Go further with Swift Testing
- Apple Developer Documentation — Migrating a test from XCTest
- SwiftLang GitHub — swift-testing
