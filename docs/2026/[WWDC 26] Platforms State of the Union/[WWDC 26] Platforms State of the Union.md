# WWDC26 Platforms State of the Union 요약

- Session: 102
- Title: Platforms State of the Union
- Source: https://developer.apple.com/videos/play/wwdc2026/102/
- Topic: Apple Intelligence, Platform Improvements, Swift/SwiftUI, Xcode 27, Developer Productivity

---

## 한 줄 요약

WWDC26 Platforms State of the Union은 **Apple Intelligence를 앱에 직접 연결하는 방법**, **Liquid Glass 이후의 플랫폼 적응성**, **SwiftUI/Swift 6.4 개선**, 그리고 **Xcode 27의 에이전틱 코딩 경험**을 중심으로 Apple 플랫폼 개발의 다음 방향을 설명한 세션이다.

---

## 핵심 요약

이번 Platforms State of the Union은 크게 세 가지 흐름으로 구성된다.

1. **Apple Intelligence**
   - Foundation Models framework 확장
   - 이미지 입력, 서버 모델, Private Cloud Compute 지원
   - App Intents, Spotlight semantic index, View Annotations API
   - Core AI를 통한 온디바이스 커스텀 모델 실행

2. **Platform Improvements**
   - Liquid Glass 개선
   - iOS 앱 resizability 확대
   - SwiftUI interaction, performance, toolbar, document API 개선
   - Swift 6.4 생산성 개선
   - Apple silicon-only Mac 전환

3. **Developer Productivity**
   - Xcode 27 개선
   - Device Hub
   - Xcode agentic coding
   - Xcode Cloud, Previews, localization, crash fixing 자동화
   - Reality Composer Pro 3, Game Porting Toolkit 개선

---

# 1. Apple Intelligence

## Foundation Models framework 확장

Apple Intelligence의 중심에는 Apple Foundation Models가 있다. Apple은 Google과 협력하여 Gemini 계열 기술을 활용한 최신 Apple Foundation Models를 만들었고, 이를 온디바이스와 Private Cloud Compute에서 실행할 수 있도록 조정했다.

이번 세션에서 Foundation Models framework는 앱 개발자가 Apple Intelligence 기반 기능을 직접 만들 수 있는 핵심 API로 소개된다.

### 주요 변화

| 항목 | 내용 |
|---|---|
| Image input | 텍스트뿐 아니라 이미지를 prompt에 첨부 가능 |
| Vision integration | OCR, barcode reader 같은 Vision 도구를 모델이 활용 가능 |
| Server models | Claude, Gemini 등 서버 모델 호출 가능 |
| LanguageModel protocol | 모델 제공자가 Swift package로 통합 가능 |
| Private Cloud Compute | 일부 개발자는 Apple Foundation Model 서버 모델을 클라우드 API 비용 없이 사용 가능 |
| Dynamic Profiles | 모델, tool, instruction을 앱 상태에 따라 동적으로 전환 |
| Evaluations framework | prompt와 AI 기능의 안정성 검증 |
| Foundation Models instrument | 모델 동작 시각화 및 디버깅 |
| FM command line tool | 터미널에서 모델 prompt 실행 |
| RAG tool | Core Spotlight 기반 앱 전용 private RAG |
| Open source 예정 | Foundation Models framework가 향후 open source 예정 |

## Dynamic Profiles

Dynamic Profiles는 Foundation Models framework의 새로운 선언형 API다. 기존 `LanguageModelSession`을 고정된 모델/도구/지시문으로 구성하는 방식에서 벗어나, 앱 상태에 따라 profile을 바꾸고 같은 session transcript를 유지할 수 있다.

예시로 세션에서는 Origami 앱을 사용했다.

| Profile | 역할 | 모델 선택 |
|---|---|---|
| Brainstorming Profile | 사진과 재료 기반 아이디어 생성 | Private Cloud Compute |
| Tutorial Profile | 단계별 튜토리얼 생성 | Private Cloud Compute, deep reasoning |
| Explanation Profile | 용어 설명 | On-device model |

개발자 관점에서 중요한 점은 Dynamic Profiles가 agent, skill, sub-agent 같은 상위 추상화를 만들 수 있는 기반이라는 점이다.

## Core AI

Core AI는 앱 안에서 커스텀 모델을 온디바이스로 실행하기 위한 새로운 framework다.

### 특징

| 항목 | 내용 |
|---|---|
| API | memory-safe Swift API |
| 모델 변환 | PyTorch 모델을 Core AI runtime으로 변환/최적화하는 Python 도구 제공 |
| 성능 | Apple silicon 최적화 |
| 디버깅 | tensor 값을 Python source까지 추적하는 visual debugger |
| 실행 범위 | iPhone의 compact vision model부터 Mac의 multi-billion parameter LLM까지 |
| 비용 | 서버 의존성 없음, token cost 없음 |

Foundation Models framework가 Apple Foundation Model 및 외부 LLM을 앱 기능에 통합하는 API라면, Core AI는 개발자가 직접 가져온 모델을 Apple 기기에서 효율적으로 실행하는 기술로 이해하면 된다.

---

# 2. App Intents와 Siri AI 통합

Apple Intelligence는 앱의 개인 맥락, 화면 내용, 앱 action을 이해하고 실행할 수 있다. 이를 앱과 연결하는 핵심은 App Intents framework다.

## 주요 구성

| 구성 | 역할 |
|---|---|
| App Intents | 앱의 action을 시스템에 노출 |
| Entity schemas | 앱의 content/concept를 Siri가 이해할 수 있게 설명 |
| Intent schemas | 앱이 수행할 수 있는 action을 Siri가 이해할 수 있게 설명 |
| IndexedEntity | 앱 content를 Spotlight semantic index에 제공 |
| View Annotations API | 화면에 보이는 view와 entity를 연결 |

## 중요한 변화

기존 SiriKit/App Intents는 사용자가 정해진 phrase에 가까운 명령을 해야 하는 느낌이 강했다. 이번 방향은 다르다.

사용자는 “두 번째 메시지”, “이 사진”, “Richard에게 이걸 보내줘”처럼 자연스럽게 말하고, 앱은 View Annotations API와 App Intents schema를 통해 화면의 항목을 실제 action으로 연결한다.


---

# 3. Liquid Glass와 Design Refinements

Liquid Glass는 WWDC25의 큰 디자인 변화였고, WWDC26에서는 이를 정제하고 안정화하는 방향이다.

## 주요 개선

| 항목 | 내용 |
|---|---|
| Readability | 복잡한 배경 콘텐츠를 더 효과적으로 diffuse |
| Depth | 어두운 edge와 밝은 specular highlight로 분리감 강화 |
| Personalization | 사용자가 Liquid Glass를 ultra clear부터 fully tinted까지 조절 가능 |
| Accessibility | Reduce Transparency, Increase Contrast 등에 자동 대응 |
| macOS show borders | macOS 27도 show borders environment value 지원 |
| Sidebar | Mac/iPad sidebar가 edge까지 확장 |
| Sidebar icons | 앱 accent color 기반 컬러 복귀 |
| Toolbar | scroll edge에서 통일된 toolbar 효과 |
| Icons | Liquid Glass layer/refraction을 icon artwork에 적용 |
| Icon Composer | multi-layer Liquid Glass icon 제작 및 preview 지원 |

## 개발자 체크 포인트

- 커스텀 Liquid Glass UI가 접근성 설정에 제대로 반응하는지 확인
- `show borders` 환경값 대응
- sidebar icon tint 확인
- standard toolbar / scroll edge effect 사용 여부 확인
- icon asset을 Icon Composer 기준으로 재검토
- 투명도/틴트 사용자 설정에서 텍스트 가독성 확인

---

# 4. iOS 앱 Resizability

iOS 앱은 이제 iPad의 iPhone app mode나 iPhone Mirroring 등 더 다양한 크기와 맥락에서 실행된다.

WWDC26에서는 iOS 앱이 iPad와 iPhone Mirroring에서 resize를 지원하는 방향이 소개됐다.

## 핵심 내용

| 항목 | 내용 |
|---|---|
| 자동 opt-in | 최신 SDK로 rebuild하면 기본적으로 resizability 대상 |
| SwiftUI | scene lifecycle과 표준 framework 지원을 쓰면 유리 |
| UIKit | Auto Layout, trait collection 기반 layout decision 필요 |
| Xcode | resizable iOS simulator와 Previews 제공 |
| Agent skill | coding agent가 resizability 문제를 찾고 수정하는 skill 제공 |


---

# 5. SwiftUI 업데이트

SwiftUI는 이번 세션에서 interaction, speed, capability 세 축으로 소개됐다.

## Interaction

| 기능 | 내용 |
|---|---|
| `.reorderable()` | List 외 grid/stack 등 모든 container에서 drag reorder 지원 |
| `.reorderContainer()` | reorder 가능한 container 지정 |
| `.swipeActionsContainer()` | custom row/container에서도 swipe action 지원 |
| Text selection | iOS에서 TextField/TextEditor 수준의 full-fidelity selection |
| macOS text | custom text renderer, text vibrancy, vertical text 지원 |

## Performance

| 항목 | 내용 |
|---|---|
| Shared foundation | SwiftUI, AppKit, UIKit control foundation 통합 |
| Nested stack layout | resize가 최대 2배 빨라짐 |
| State object | lazy initialization, macro 기반으로 변경 |
| AsyncImage | HTTP cache 기반 자동 caching |
| Type checking | content builder type checking performance 개선 |

## Capability

| 기능 | 내용 |
|---|---|
| `visibilityPriority` | toolbar item 중요도 지정 |
| Toolbar overflow menu container | 덜 중요한 action을 overflow로 그룹화 |
| `topBarPinnedTrailing` | trailing edge 고정 placement |
| Prominent tab role | 중요한 tab을 trailing edge에 고정 |
| New document infrastructure | URL 직접 접근, 부분 read/write, observable configuration |
| Spatial Preview framework | Mac 앱이 Apple Vision Pro 착용자 주변 공간으로 3D 모델 preview 확장 |
| Alert binding API | alert binding 개선 |
| Cross-fade transition | cross-fade 조정 지원 |


---

# 6. Swift 6.4

Swift 6.4는 대형 문법 변화보다 일상 개발 생산성 개선에 초점이 있다.

## 주요 변화

| 기능 | 내용 |
|---|---|
| Warning control | 특정 영역 warning suppress 가능 |
| Warning to error | 특정 영역에서 warning을 error로 승격 가능 |
| `anyAppleOS` | 여러 Apple platform availability를 간단히 표현 |
| async in defer | `defer` 안에서 `await` 가능 |
| Type checker | “unable to type check in reasonable time” 상황 개선 |
| Diagnostics | 더 actionable한 compiler error 제공 |

## 의미

Swift 6 strict concurrency migration이나 대규모 코드베이스 점진 개선에 유리하다. 특히 SwiftData, CloudKit, BackgroundTask, BLE, Swift concurrency가 함께 사용되는 대규모 앱에서는 warning enforcement scope를 나눠 점진적으로 안정화할 수 있다.

---

# 7. Apple Silicon-only Mac 전환

macOS Tahoe가 Intel Mac을 지원하는 마지막 macOS였고, macOS 27부터 Apple silicon 전환이 완료된다.

## 개발자 영향

| 항목 | 내용 |
|---|---|
| Mac App Store | Apple silicon-only binary 배포 가능 |
| Download size | Intel slice 제거로 다운로드 크기 감소 |
| Testing scope | 단일 아키텍처 중심으로 테스트 가능 |
| Liquid Glass | Xcode 27로 recompile하면 old design opt-out 제거, Liquid Glass 자동 적용 |

Mac 앱이 있거나 Mac Catalyst / iPad app on Mac을 고려하는 앱은 Apple silicon-only 전환 기준으로 빌드/테스트 전략을 다시 세울 수 있다.

---

# 8. Xcode 27

Xcode 27은 두 축이 강하다.

1. 매일 쓰는 IDE 경험 개선
2. Agentic coding 확장

## IDE 경험 개선

| 항목 | 내용 |
|---|---|
| Project loading | 더 빠른 project load |
| Crash/spin | 주요 crash, spin 수정 |
| Debugging | expression evaluation 개선 |
| Console | 대량 logging에서도 hitch 감소 |
| App size | Xcode 27은 30% 더 작아짐 |
| Apple silicon-only | Xcode 자체가 Apple silicon-only |
| iCloud settings | Xcode 설정이 iCloud에 저장/복원 |
| Quick project start | bundle ID/file name 없이 빠르게 새 project 시작 가능 |
| Toolbar customization | toolbar 재배치/개인화 가능 |
| Themes | editor뿐 아니라 앱 전체 theme 지원 |

## Xcode Cloud

- Xcode에서 바로 Cloud build 시작 가능
- App Store Connect 설정 없이 시작 가능
- build 최대 2배 빨라짐
- Apple Vision Pro와 Metal on Apple silicon 앱 지원

## Previews

- accessibility size, orientation, localization뿐 아니라 임의 property variation preview 가능
- enum state를 넘겨 여러 UI 상태를 grid로 한 번에 확인 가능

## Device Hub

Device Hub는 기존 Simulator를 대체하고 simulator와 실제 device를 통합한다.

| 기능 | 내용 |
|---|---|
| Simulator 대체 | 기존 rotate, screenshot, home screen 이동 지원 |
| System settings | dark mode, font size 등 시스템 설정 변경 테스트 |
| Multi-touch | pinch to zoom, two-finger scrolling |
| Dynamic resize | iOS app 다양한 크기 테스트 |
| Physical device | 실제 iPhone을 같은 UI에서 관리/실행/상호작용 |


---

# 9. Xcode Agentic Coding

Xcode 27은 agentic coding을 개발 과정 전체에 통합한다.

## 지원 범위

| 단계 | Agent 역할 |
|---|---|
| Planning | `/plan`으로 구현 계획, diagram 생성 |
| Implementation | 프로젝트 구조를 이해하고 코드 수정 |
| Preview | light/dark, orientation, text size, localization별 preview 확인 |
| Simulator interaction | Device Hub에서 tap, swipe, type 수행 |
| Localization | String Catalog에 언어 추가 후 context 기반 번역 |
| Crash fixing | Organizer crash log 분석, 재현, 수정, 검증 |
| API adoption | 새 API 적용 지원 |
| Accessibility | 접근성 개선 지원 |
| PR workflow | GitHub PR 생성 가능 |
| Figma workflow | Figma design을 SwiftUI 구현으로 연결 가능 |

## Agent ecosystem

| 항목 | 내용 |
|---|---|
| Built-in agents | Anthropic, OpenAI, Google integration |
| ACP | Agent Client Protocol 지원 |
| MCP | Model Context Protocol로 Figma, GitHub 등 연결 |
| Plugins | skill, MCP tool, agent를 plugin으로 설치 가능 |
| Skills | SwiftUI, Accessibility, Universal sizing, Testing, Performance specialist 제공 |

## 개발 문화 영향

Xcode agent는 단순 코드 자동완성보다 “계획 → 구현 → 실행 → 검증 → 개선” 전체 workflow에 들어온다. 특히 iOS 앱 개발에서 반복적으로 시간이 걸리던 localization, crash triage, UI variant 검증, resizability 대응을 agent에게 맡길 수 있다는 점이 크다.

---

# 10. 기타 개발 도구

## Reality Composer Pro 3

Reality Composer Pro 3는 RealityKit 기반 production-ready 3D experience 제작을 위해 완전히 재구성됐다.

주요 기능:

- character animation 지원
- 더 현실적인 lighting
- Mac Virtual Display 기반 live preview

## Game Porting Toolkit

Game Porting Toolkit도 크게 업데이트됐다.

- Apple 플랫폼으로 게임 이식 시간 단축
- coding agent용 AI skill 추가
- Metal command line tools로 agent가 개발/디버깅을 직접 제어 가능


---

---


# 함께 보면 좋은 후속 세션 후보

- Foundation Models framework
- App Intents
- Core AI
- SwiftUI
- Liquid Glass / Design
- Xcode 27
- Device Hub
- Spotlight semantic index
- Shortcuts / Siri AI
- Vision framework + Foundation Models
