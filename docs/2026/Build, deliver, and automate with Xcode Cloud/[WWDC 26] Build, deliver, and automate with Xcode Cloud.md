# WWDC26 Build, deliver, and automate with Xcode Cloud 요약

- Session: 261
- Title: Build, deliver, and automate with Xcode Cloud
- Source: https://developer.apple.com/videos/play/wwdc2026/261/
- Topic: Xcode Cloud, CI/CD, TestFlight, App Store Connect, Webhooks, Repository Management

---

## 한 줄 요약

WWDC26의 **Build, deliver, and automate with Xcode Cloud** 세션은 Xcode Cloud를 사용해 앱 빌드, 테스트, 배포, 자동화를 Xcode 안에서 빠르게 설정하는 방법을 소개하고, TestFlight 배포, webhook 연동, 추가 repository 관리까지 이어지는 기본 워크플로를 설명한다.

---

## 핵심 요약

이번 세션은 Xcode Cloud의 기본 개념과 실제 설정 흐름을 중심으로 구성된다.

1. **Xcode Cloud 기본 개념**
   - Apple 개발자를 위해 Xcode에 통합된 CI/CD 서비스
   - 클라우드에서 앱을 빌드하고 테스트
   - 여러 기기와 OS 버전에서 병렬 실행
   - TestFlight 및 App Store 배포와 자연스럽게 연결

2. **Getting Started**
   - Xcode의 Report navigator > Cloud 탭에서 시작
   - Onboarding assistant로 제품 선택, repository 연결, 기본 workflow 생성
   - iOS 앱과 macOS 앱을 같은 workspace에서 각각 onboarding 가능
   - Xcode Cloud build는 ephemeral virtual machine에서 실행

3. **Distribution**
   - Xcode 안에서 TestFlight 배포 설정 가능
   - App Store Connect 앱 record 생성에 필요한 속성 입력
   - Bundle ID, SKU, 앱 이름 충돌 여부를 Assistant에서 확인
   - archive action이 포함된 distribution workflow 생성

4. **Automation**
   - Webhook으로 build lifecycle event를 외부 서비스에 전달
   - build created, build started, build completed 단계별 payload 지원
   - dashboard, bug tracking, notification workflow 등과 연동 가능

5. **Repository Management**
   - 주 repository 외에 추가 Git repository 연결 가능
   - 별도 repository로 분리된 framework나 공유 dependency를 Xcode Cloud build에 포함
   - 이미 source provider 권한을 부여한 경우 추가 인증 없이 연결 가능

---

# 1. Introduction

세션은 Xcode Cloud가 Xcode에 내장된 Apple 개발자용 continuous integration and delivery 서비스라는 설명으로 시작한다. Xcode Cloud는 앱을 클라우드에서 빌드하고 테스트하며, TestFlight 또는 App Store로 배포할 수 있는 흐름을 제공한다.

올해 Xcode Cloud의 초점은 기본기의 개선이다. 처음 앱 아이디어를 시작하는 개발자부터 이미 Xcode Cloud를 사용하고 있는 개발자까지, 빌드와 테스트, 배포 전반에서 더 매끄러운 경험을 제공하는 것이 목표다.

세션의 구성은 다음과 같다.

| 순서 | 내용 |
|---|---|
| 1 | Xcode Cloud의 핵심 개념 |
| 2 | 새 앱을 Xcode Cloud에 연결하는 방법 |
| 3 | TestFlight 배포 설정 |
| 4 | Webhook과 repository 관리로 workflow 확장 |

---

# 2. Essential concepts

앱 개발은 더 빠르게 변화하고 있으며, Xcode에 agent 지원이 들어오면서 개발자는 이전보다 더 많은 코드를 작성하고 빠르게 기능을 반복할 수 있게 되었다. 하지만 속도가 빨라질수록 품질을 유지하고, 버그와 성능 문제를 고객 기기에 도달하기 전에 발견하는 과정이 중요해진다.

Xcode Cloud는 이 지점에서 품질을 위한 동반자 역할을 한다.

## Xcode Cloud의 역할

| 항목 | 설명 |
|---|---|
| Build | 앱을 클라우드에서 빌드 |
| Test | 여러 기기와 OS 버전에서 병렬 테스트 |
| Distribution | TestFlight 및 App Store 배포와 연결 |
| Automation | webhook과 workflow로 외부 시스템과 연동 |
| Quality | 변경 사항이 사용자에게 도달하기 전 문제 발견 |

로컬 개발과 비교하면, Xcode Cloud는 build와 test를 개발자의 로컬 머신에 묶어두지 않고 클라우드에서 병렬로 실행한다. 이를 통해 기능 개발, 사용자 피드백 대응, 품질 검증을 더 효율적으로 병행할 수 있다.

---

# 3. Getting started

세션에서는 iOS 앱을 Xcode Cloud에 onboarding하는 흐름을 보여준다.

## 기본 onboarding 흐름

| 단계 | 내용 |
|---|---|
| 1 | Xcode에서 Report navigator 열기 |
| 2 | Cloud 탭 선택 |
| 3 | Get Started 선택 |
| 4 | workspace 안의 product 선택 |
| 5 | Developer Team 확인 |
| 6 | source repository 연결 |
| 7 | 기본 workflow 생성 |
| 8 | 첫 cloud build 시작 |

Xcode Cloud가 앱을 빌드하려면 source code에 접근해야 한다. Onboarding assistant는 repository를 불러오고, source provider에 따라 필요한 연결 단계를 안내한다.

## Source code와 보안

세션에서는 Xcode Cloud build가 ephemeral virtual machine에서 실행된다고 설명한다.

| 항목 | 설명 |
|---|---|
| Source fetch | build가 시작될 때만 source code를 가져옴 |
| VM lifecycle | build가 끝나면 VM은 폐기됨 |
| Source storage | source code는 저장되지 않음 |
| Apple access | Apple은 source code에 접근할 수 없음 |

즉, Xcode Cloud는 build를 위해 필요한 시점에만 source code를 가져오고, build가 끝난 뒤에는 해당 환경을 폐기한다.

## 여러 product onboarding

세션에서는 같은 workspace 안에 iOS 앱과 macOS 앱이 함께 있는 경우도 다룬다. iOS 앱을 먼저 onboarding한 뒤, macOS 앱에 대해서는 Cloud navigator의 More 버튼에서 **Create Workflow**를 선택해 별도 workflow를 만들 수 있다.

이미 repository 접근 권한을 부여한 상태라면, 같은 repository를 사용하는 다른 product를 onboarding할 때 repository 연결 단계를 다시 거치지 않는다.

---

# 4. Distribution

빌드와 테스트가 Xcode Cloud의 핵심이라면, distribution은 사용자와 테스터에게 앱을 전달하는 단계다. Xcode Cloud는 TestFlight 배포 설정을 Xcode 안에서 처리할 수 있게 한다.

## TestFlight 배포 설정 흐름

| 단계 | 내용 |
|---|---|
| 1 | Cloud navigator에서 앱 선택 |
| 2 | secondary click 후 Set Up Distribution 선택 |
| 3 | App Store Connect 앱 record 생성에 필요한 속성 입력 |
| 4 | 앱 이름, Bundle ID, SKU 확인 |
| 5 | Xcode Cloud가 app record 생성 및 Bundle ID/SKU 등록 |
| 6 | internal TestFlight용 distribution workflow 생성 |

Xcode Cloud Assistant는 앱 이름이나 identifier가 이미 사용 중인지 확인하고, 필요한 경우 Xcode를 벗어나지 않고 수정할 수 있도록 안내한다.

## Archive action

macOS 앱처럼 아직 배포 설정이 없는 product에 대해 새 workflow를 만들 때는 archive action이 필요하다. Archive action은 TestFlight 배포를 위한 필수 단계로 소개된다.

Assistant는 archive action이 필요한 상황에서 자동으로 setup 흐름을 제안하며, 필요한 속성을 확인한 뒤 배포 가능한 workflow를 구성한다.

---

# 5. Webhooks

Xcode Cloud는 기본적인 build, test, distribution뿐 아니라 webhook을 통해 고급 자동화 workflow를 구성할 수 있다.

Webhook은 Xcode Cloud build와 관련된 정보를 사용자가 지정한 서비스로 자동 전달하는 기능이다.

## Webhook event

| Event | 설명 |
|---|---|
| Build created | build가 생성되었을 때 |
| Build started | build가 시작되었을 때 |
| Build completed | build가 완료되었을 때 |

Webhook이 설정되면 Xcode Cloud는 build lifecycle에 맞춰 payload를 외부 endpoint로 보낸다. 이 payload는 dashboard, notification service, bug tracking, internal tooling 등과 연결할 수 있다.

## Webhook 설정 흐름

| 단계 | 내용 |
|---|---|
| 1 | Cloud navigator에서 앱 선택 |
| 2 | Manage Webhooks 선택 |
| 3 | 새 webhook 추가 |
| 4 | webhook 이름 입력 |
| 5 | publicly resolvable Payload URL 입력 |
| 6 | build 실행 후 delivery history 확인 |

세션에서는 build가 완료된 뒤 webhook delivery history에서 각 lifecycle event가 성공적으로 전달되었는지 확인하는 장면을 보여준다.

---

# 6. Additional repositories

앱이 성장하면 기능을 별도 repository로 분리하거나, 여러 앱이 공유하는 framework를 따로 관리하는 경우가 많다. Xcode Cloud는 이런 구조를 지원하기 위해 product에 추가 Git repository를 연결할 수 있다.

## 추가 repository가 필요한 경우

| 상황 | 설명 |
|---|---|
| Shared framework | 여러 앱이 공유하는 framework를 별도 repository로 분리 |
| Modular codebase | 코드베이스를 모듈 단위로 관리 |
| Dependency sync | cloud build가 필요한 모든 dependency에 접근해야 함 |
| Scale | 앱 규모가 커지면서 repository 구조가 복잡해짐 |

## 추가 repository 연결 흐름

| 단계 | 내용 |
|---|---|
| 1 | Cloud navigator에서 앱 선택 |
| 2 | Manage Repositories 선택 |
| 3 | Additional section에서 Add 선택 |
| 4 | Git remote URL 입력 |
| 5 | repository 추가 |
| 6 | Xcode Cloud build가 해당 dependency에 접근 가능 |

이미 source provider에 권한을 부여했다면, 추가 repository를 연결할 때 다시 인증할 필요가 없다. 연결 후에는 Xcode Cloud가 필요한 dependency를 포함해 build를 수행할 수 있다.

---

# 7. 개발자 체크 포인트

## Xcode Cloud 도입 전 확인할 것

- Xcode workspace와 scheme 구성이 cloud build에 적합한지 확인
- unit test와 UI test가 로컬뿐 아니라 cloud 환경에서도 안정적으로 실행되는지 확인
- signing & distribution 설정이 Developer Team과 일치하는지 확인
- build에 필요한 dependency가 repository 안에 있거나 접근 가능한지 확인
- TestFlight 배포를 위해 app record, Bundle ID, SKU 정보를 정리

## Workflow 설계 시 확인할 것

- build, test, archive action을 어떤 branch나 trigger에 연결할지 결정
- iOS, macOS 등 product별 workflow를 분리할지 통합할지 결정
- pull request, main branch, release branch에 서로 다른 workflow를 적용할지 검토
- TestFlight internal testing과 App Store release workflow를 분리
- webhook payload를 받을 endpoint와 보안 정책 준비

## Repository 관리 시 확인할 것

- 추가 repository가 build에 필요한 모든 shared framework와 package를 포함하는지 확인
- repository 접근 권한 변경 시 Xcode Cloud 설정도 함께 점검
- dependency가 private repository에 있을 경우 권한 설정 확인
- monorepo와 multi-repo 구조 중 cloud build에 더 적합한 방식을 선택

---

# 8. WWDC Archive용 짧은 설명

WWDC26 session 261, **Build, deliver, and automate with Xcode Cloud**, introduces the latest updates to Xcode Cloud for building, testing, distributing, and automating Apple app workflows. The session explains core Xcode Cloud concepts, shows how to onboard iOS and macOS apps directly from Xcode, and demonstrates how to configure TestFlight distribution without leaving the IDE.

The session also covers webhook-based automation and additional repository management. Webhooks allow Xcode Cloud build events to be sent to custom services, while additional repositories let cloud builds access shared frameworks or dependencies split across multiple Git repositories. Together, these features help teams scale build, test, distribution, and automation workflows as their apps grow.

---

# 9. 개발자 체크리스트

- [ ] Xcode Cloud를 사용할 product와 scheme 확인
- [ ] Report navigator의 Cloud 탭에서 onboarding 흐름 확인
- [ ] source repository 연결 상태 확인
- [ ] 첫 cloud build 실행 및 결과 확인
- [ ] unit test / UI test가 cloud 환경에서 정상 동작하는지 확인
- [ ] iOS, macOS 등 product별 workflow 구성 검토
- [ ] TestFlight distribution workflow 생성
- [ ] App Store Connect app record 생성에 필요한 app name, Bundle ID, SKU 확인
- [ ] archive action이 필요한 workflow 확인
- [ ] webhook으로 받을 build lifecycle event 정의
- [ ] webhook payload endpoint 준비
- [ ] webhook delivery history로 성공/실패 확인
- [ ] shared framework나 dependency용 추가 repository 연결
- [ ] repository access 권한 변경 시 Xcode Cloud 설정 재점검

---

# 10. 관련 후속 세션 우선순위

1. What’s new in Xcode 27
2. Connect your project to Xcode Cloud
3. Extend your Xcode Cloud workflows
4. Create practical workflows in Xcode Cloud
5. Simplify distribution in Xcode and Xcode Cloud
6. App Store Connect 관련 세션
7. TestFlight 배포 관련 세션
8. Xcode Cloud workflow / automation 관련 문서

---

# 정리

이 세션은 Xcode Cloud를 처음 시작하는 흐름부터, 배포와 자동화까지 이어지는 기본 workflow를 단계별로 보여준다. Xcode 안에서 product를 선택하고 repository를 연결하면 기본 workflow를 만들 수 있으며, cloud build를 통해 로컬 머신에 의존하지 않고 앱을 빌드하고 테스트할 수 있다.

또한 TestFlight 배포 설정, App Store Connect app record 생성, archive action 구성까지 Xcode Cloud Assistant가 안내한다. 앱이 커지고 workflow가 복잡해질수록 webhook과 additional repository 기능을 통해 Xcode Cloud를 외부 dashboard, automation service, shared dependency 구조와 연결할 수 있다.
