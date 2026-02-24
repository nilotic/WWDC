# Record, replay, and review_ UI automation with Xcode

- Record, replay, and review: UI automation with Xcode https://developer.apple.com/videos/play/wwdc2025/344/



## ✨ 개요


Xcode 의 **UI Automation(XCUIAutomation)** 을 활용해 한 번의 기록으로 여러 기기 · 언어 · 환경에서 앱을 자동 테스트하는 전체 워크플로우를 다룬 세션

핵심 메시지 UI 자동화는 단순 테스트가 아니라 UX· 접근성 · 현지화 · 플랫폼 통합 품질을 한 번에 검증하는 수 단 Record → Replay → Review 흐름이 완성도 높은 품질 루프를 만든다

🧠 UI Automation 의 위치와 역할 Xcode 테스트 프레임워크 Swift Testing / XCTest XCTest 를 import 하면 XCUIAutomation 자동 포함

테스트 구성

- Unit Test: 로직 · 모델 · 패키지 테스트

- UI Automation Test: 실제 사용자처럼 앱을 조작해 통합 UX 검증 UI 테스트는 개수보다 핵심 사용자 흐름 중심이 적절 👆 UI Automation 으로 가능한 것들 실제 사용자 입력 시뮬레이션 tap, swipe, scroll, hardware button 접근성 기반 검증 VoiceOver / Voice Control / Dynamic Type 환경 다국어 · 다지역 테스트 문자열 길이 변화 RTL 레이아웃 ( 아랍어 , 히브리어 ) 하드웨어 연동 테스트

- Action Button, Camera Button Apple TV Remote, Apple Watch Digital Crown 앱 런치 성능 검증 동일 자동화를 iPhone / iPad / Mac / visionOS(iPad 용 ) 에서 재사용 🔁 UI Automation 의 3 단계 워크플로우 1️⃣ Record 실제 앱을 조작하면 Xcode 가 Swift 코드로 자동 기록 2️⃣ Replay 여러 기기 · 언어 · 지역 · 회전 상태에서 자동 재생 로컬 + Xcode Cloud에서 동일하게 실행

- 3️⃣ Review 각 실행 결과에 대해 pass / fail 리포트 고화질 비디오 녹화 실패 시점 정확히 재생 · 분석 ♿ UI Automation 과 Accessibility 의 관계 UI Automation 은 Accessibility 프레임워크 위에서 동작 접근성이 잘 설계된 앱일수록 UI 자동화도 더 안정적 · 견고 중요한 접근성 속성 accessibilityIdentifier 자동화 전용 식별자 로컬라이즈되지 않음 사용자에게 노출되지 않음 accessibilityLabel / Value / Traits

- VoiceOver + UI Automation 모두에 도움 🏷 Accessibility Identifier 설계 원칙 앱 전체에서 유일 의미가 분명하고 정적 텍스트 변경 · 네트워크 데이터에 영향받지 않도록 반복 View 는 id 기반으로 식별자 구성 SwiftUI .accessibilityIdentifier("landmark.\(id)") UIKit

- view.accessibilityIdentifier = "…" ➡ UI 테스트 안정성의 핵심 기반 🔍 Accessibility Inspector 활용 Xcode > Open Developer Tool > Accessibility Inspector 모든 플랫폼 (iOS, macOS, tvOS 등 ) 지원 화면의 각 요소에 대해 type, label, identifier, traits 확인 누락된 접근성 정보는 어떤 속성을 추가해야 하는지까지 안내



## 🧪 UI 테스트 타깃 생성 & 기록


Xcode > Add Target > UI Testing Bundle 기본 템플릿 제공 UI Test 파일 열면 Record 버튼으로 바로 녹화 시작 시뮬레이터에서 앱 실행 → 상호작용 → 코드 자동 생성

✍ 기록된 코드 다듬기 ( 중요 ) UI 요소 접근 방식은 여러 옵션이 제공됨

- 선택 기준 로컬라이즈된 텍스트 → identifier 우선

- 깊이 중첩된 뷰 → 가장 짧은 쿼리 동적 콘텐츠 → generic query 또는 identifier

- 목표 앱 구조 변경에도 잘 깨지지 않는 테스트



## ✅ Validation 추가하기


단순 재생이 아니라 검증이 핵심 주요 API waitForExistence(timeout:) wait(for:toEqual:) XCTAssert(...) “ 기대 결과가 맞는지 ” 를 코드로 명시

⚙ 테스트 실행 전 환경 제어 setUp()에서 디바이스 상태 고정 orientation appearance(Dark Mode) locale / region simulated location

launchArguments / launchEnvironment custom URL scheme 으로 특정 화면 바로 진입 📋 Test Plan 으로 다중 구성 관리 Test Plan

어떤 테스트를 어떤 설정으로 몇 번 , 병렬로 실행할지 관리 언어별 configuration 분리 권장 독일어 ( 긴 문자열 ) 아랍어 / 히브리어 (RTL) UI Automation 전용 옵션

스크린샷 / 비디오 캡처 성공한 실행도 영상 보존 가능 ☁ Xcode Cloud 와의 결합 동일 Test Plan 을 클라우드에서 실행 팀 전체가 결과 로그 비디오 를 App Store Connect 에서 확인

로컬 환경 차이 제거 → 재현성 높은 품질 관리 🎞 Test Report 로 실패 분석 실패한 실행 클릭 시 실제 동작 영상 실패 시점으로 바로 점프 실패 프레임에서 당시 화면의 모든 UI 요소 오버레이

해당 요소를 가리키는 코드 추천 자동 제공 추천 코드를 바로 복사해 테스트 수정 가능 🧠 핵심 정리 UI Automation 은 테스트 접근성 현지화 Xcode Cloud Test Report

가 하나의 품질 파이프라인으로 연결된 시스템 좋은 UI 자동화의 출발점은 좋은 접근성 설계 “ 한 번 기록 → 모든 환경에서 재생 → 영상으로 검증 ” 는 수동 QA 로는 불가능한 레벨의 품질 보증을 제공
