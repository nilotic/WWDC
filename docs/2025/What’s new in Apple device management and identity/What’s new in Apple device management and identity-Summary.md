# WWDC25 세션 258 — What’s new in Apple device management and identity 요약

---

<br>
## ✨ 개요

* 이번 세션은 **Apple 조직용 배포·관리·인증 생태계 전반의 2025년 업데이트**를 다룹니다.
* 범위는 크게 네 가지입니다.
  * **Apple Business Manager / Apple School Manager 서비스 업데이트**
  * **Declarative Device Management 중심의 디바이스 관리 강화**
  * **앱 배포·업데이트·구성 관리 확장**
  * **Platform SSO와 공유 Mac 환경을 포함한 인증 통합 개선**
* 전체 방향성은 분명합니다.
  * IT 관리자는 더 적은 수작업으로 더 많은 기기를 관리할 수 있고,
  * 사용자는 더 자연스럽게 조직 계정으로 로그인하며,
  * 조직은 보안·배포·공유 기기 운영을 더 일관되게 가져갈 수 있도록 설계되었습니다.

<br>
## 🏢 Apple Services: Business Manager / School Manager 업데이트

* **Managed Apple Account** 도입 흐름이 더 쉬워졌습니다.
  * 관리자는 이제 조직 도메인에 연결된 **개인 Apple Account 목록을 다운로드**해 사용자와 전환 커뮤니케이션을 할 수 있습니다.
  * 또한 조직 소유 기기에서는 **개인 Apple Account 로그인 자체를 제한**할 수 있게 되어, 업무용 기기에 업무용 계정만 쓰도록 강제할 수 있습니다.
  * 이 동작은 MDM 의존 없이 조직 단위 정책으로 적용됩니다.
* **디바이스 인벤토리 정보가 더 풍부해졌습니다.**
  * 기존 Activation Lock 상태, 저장 공간, 셀룰러 정보에 더해,
  * release 기기의 release 주체와 시점,
  * 이후에는 iPhone / iPad의 Bluetooth / Wi‑Fi MAC 주소,
  * 그리고 **AppleCare 보장 정보**까지 확인할 수 있게 됩니다.
* 가장 큰 변화 중 하나는 **Apple Business Manager / Apple School Manager API 제공**입니다.
  * 조직은 이제 브라우저 수동 작업에만 의존하지 않고,
  * **기기 목록 조회, MDM 서버 할당, 배치 작업 상태 확인** 등을 API로 자동화할 수 있습니다.
  * 관리 자동화나 사내 IT 운영 도구를 만드는 팀에는 꽤 큰 변화입니다.
* **Vision Pro 등록 흐름도 확장**되었습니다.
  * Apple Configurator for iPhone으로 **Vision Pro를 조직에 추가**할 수 있게 되었고,
  * Setup Assistant에서 pairing code만 거치면 조직 자산으로 편입할 수 있습니다.
  * 또한 visionOS도 Setup Assistant skip key를 지원해 초기 설정 제어가 쉬워졌습니다.
* **Account-driven enrollment** 도입 장벽도 낮아졌습니다.
  * 원래는 조직 도메인에 well-known endpoint를 직접 구성해야 했지만,
  * 이제는 **MDM 서버가 service discovery URL을 구성**하고,
  * 기기가 조직 도메인에서 endpoint를 찾지 못하면 Apple Business Manager / School Manager를 통해 enrollment를 이어갈 수 있습니다.
* 그리고 이번 세션의 매우 큰 실무 기능으로 **MDM 간 device management migration** 이 소개되었습니다.
  * 인수합병, 온프레미스→클라우드 전환, 솔루션 교체처럼 MDM을 옮겨야 할 때,
  * 과거처럼 전체 wipe나 복잡한 수동 전환 없이 **기기를 새 관리 서비스로 재할당**할 수 있습니다.
  * 사용자는 마이그레이션 안내와 마감 기한을 받고,
  * 기한 내 미완료 시 자동으로 전환이 시작됩니다.
  * 완료 후에는 새 MDM이 Activation Lock과 FileVault 키 회전까지 이어받을 수 있습니다.
  * 앱과 데이터 보존을 위해서는 `await device configured` 흐름과 앱 재설치 전략을 함께 맞춰야 합니다.

<br>
## 🛠️ Device Management: Declarative 중심 전환 가속

* Apple은 이제 **소프트웨어 업데이트 관리의 중심을 Declarative Device Management(DDM)** 로 완전히 옮기고 있습니다.
  * 기존 iOS / iPadOS / macOS에서 제공하던 DDM 기반 업데이트 관리가
  * 이제 **Vision Pro와 Apple TV까지 확장**됩니다.
  * 관리자는 update deferral, cadence, deadline 같은 정책을 선언형으로 제어할 수 있습니다.
* 반대로, 기존의 오래된 **MDM 기반 소프트웨어 업데이트 관리 방식은 deprecated** 되었습니다.
  * 당장은 동작하지만 향후 릴리스에서 제거 예정이라는 점이 중요합니다.
  * 즉, 조직용 관리 솔루션은 이제 소프트웨어 업데이트 영역에서도 DDM 전환이 사실상 필수입니다.
* **Safari 관리도 DDM로 정리**되었습니다.
  * 새 declarative configuration으로 **북마크 관리**가 가능해졌고,
  * **기본 홈페이지 설정**도 지원합니다.
  * 또한 기존 restrictions payload에 흩어져 있던 Safari 관련 제어가 **DDM로 통합**되어 관리 모델이 더 일관적이 되었습니다.
* **Apple Intelligence 제어 범위가 visionOS까지 확대**되었습니다.
  * writing tools, notification summaries, image playground 같은 기능이 생산성을 높여주지만,
  * 조직 입장에서는 규정 준수와 내부 정책 제어가 필요합니다.
  * 그래서 기존 플랫폼에서 제공하던 관련 restriction이 **visionOS 2.4에도 적용**됩니다.
* **Return to Service** 도 크게 강화되었습니다.
  * iPhone / iPad는 초기화 시 **managed app을 보존**할 수 있습니다.
  * 사용자 데이터는 기존처럼 지워지지만 앱 자체는 남기 때문에,
  * 다음 사용자를 위한 준비 시간이 크게 줄고 네트워크 부담도 줄어듭니다.
  * 이를 위해 cloud configuration의 새 키와 `await device configured` 조합이 필요하며,
  * 재설정 이후에는 `InstallApplication` 명령 또는 ManagedApp declaration으로 앱 관리 상태를 다시 이어받아야 합니다.
* **Vision Pro도 Return to Service를 지원**합니다.
  * Control Center의 **Reset for Next User** 옵션으로 다음 사용자를 위한 초기화를 시작할 수 있고,
  * lock screen에서 Digital Crown으로도 재설정 흐름에 들어갈 수 있습니다.
  * 공유형 Vision Pro 운영, 특히 교육·리테일·헬스케어 같은 환경을 강하게 의식한 변화입니다.
* 그 외에도 부가 업데이트가 있습니다.
  * iPad 배터리 상태 정보,
  * 메시징·통화 기본 앱 설정,
  * SIM별 Messaging / FaceTime 제한,
  * AirPods / Beats 임시 사용,
  * network relay profile의 FQDN 지원,
  * 그리고 **Network Extension URL Filtering API** 추가가 소개되었습니다.

<br>
## 📦 App Management: 앱 배포와 제어가 더 세밀해짐

* 앱 관리 영역에서도 **DDM이 표준 경로**로 자리잡고 있습니다.
* **iOS / iPadOS의 managed app configuration** 은 이제 앱별 업데이트 정책을 세밀하게 제어할 수 있습니다.
  * 앱별로 **자동 업데이트 강제 / 비활성화**를 설정할 수 있고,
  * 특정 버전에 **pinning** 해서 검증된 버전만 유지할 수 있습니다.
  * status channel을 통해 설치 진행 상태와 버전 정보도 실시간에 가깝게 확인할 수 있습니다.
  * 셀룰러 다운로드 제한도 앱 단위 운영 관점에서 유용한 옵션입니다.
* **iOS 18.4 / iPadOS 18.4에서 managed apps가 beta를 벗어났고**,
  * **visionOS 2.4에서는 required apps 지원**이 추가되었습니다.
  * 즉 Vision Pro 역시 단순 기기 관리뿐 아니라 앱 배포 정책까지 점점 본격적인 조직 관리 대상이 되고 있습니다.
* **macOS Tahoe** 에서는 한 단계 더 나아갑니다.
  * App Store 앱, custom app, package를 **DDM으로 배포**할 수 있고,
  * required / optional 지정도 가능하며,
  * status channel로 설치 결과를 서버에 다시 전달할 수 있습니다.
  * 나중에는 Mac용 **ManagedAppDistribution framework** 도 제공되어, MDM 개발사가 self-service 앱 경험을 더 잘 만들 수 있게 됩니다.
* 앱 개발자 관점에서 중요한 변화는 **ManagedApp framework** 입니다.
  * iOS 18.4, iPadOS 18.4, visionOS 2.4에서 앱 내부에 이 프레임워크를 탑재할 수 있습니다.
  * 조직은 이를 통해 앱에 **설정, 비밀번호, 인증서, 신원 정보**를 안전하게 배포할 수 있습니다.
  * 활용 예시는 꽤 실용적입니다.
    * 앱 경험 커스터마이징
    * API access token의 안전한 전달
    * 커스텀 trust certificate 추가
    * hardware-bound key 기반의 강한 device posture 증명
* 정리하면, 단순히 “앱을 깐다” 수준을 넘어,
  * **버전 제어 + 배포 상태 추적 + 보안 구성 주입**까지 앱 관리 레이어가 한층 정교해졌습니다.

<br>
## 🔐 Identity Integrations: Platform SSO와 공유 Mac 경험 강화

* Apple은 **Platform SSO를 Mac 초기 설정 흐름에 더 깊게 통합**했습니다.
  * 기존에는 Mac 설정 후 로컬 사용자 생성 뒤 Platform SSO 등록이 이어졌다면,
  * 이제는 **Automated Device Enrollment 중 Setup Assistant 안에서 바로 Platform SSO 등록**이 진행됩니다.
  * 사용자는 조직의 identity provider로 인증해야 계속 진행할 수 있습니다.
* 이 흐름이 끝나면,
  * 인증된 상태로 MDM enrollment를 이어갈 수 있고,
  * 같은 identity provider와 federated 되어 있다면 Managed Apple Account 로그인까지 연결됩니다.
  * 로컬 계정은 identity provider 비밀번호와 동기화되거나,
  * Secure Enclave-backed key 기반으로 생성될 수 있습니다.
  * 프로필 사진 동기화까지 지원되어 사용자 경험도 더 자연스럽습니다.
* 1:1 배포뿐 아니라 **공유 Mac 배포**를 위한 새 기능도 추가되었습니다.
  * 바로 **Authenticated Guest Mode** 입니다.
  * 사용자는 로그인 창에서 자신의 cloud identity로 로그인하고,
  * 세션 종료 시 사용자 데이터가 모두 제거됩니다.
  * 병원, 리테일, 교육처럼 한 기기를 여러 사람이 번갈아 쓰는 환경에 특히 적합합니다.
* 여기에 **Tap to Login** 이 더해집니다.
  * Apple Wallet의 직원 배지나 학생증처럼,
  * iPhone 또는 Apple Watch를 Mac에 탭해 빠르게 로그인할 수 있습니다.
  * 이 기능은 Authenticated Guest Mode가 구성된 Mac에서 동작하며,
  * 사용자 자격 증명은 Wallet pass의 **Access Key** 로 provision 됩니다.
  * Access Key는 Secure Enclave에 저장되므로 하드웨어 보호를 받습니다.
  * Express Mode를 사용하면 기기를 깨우거나 잠금 해제하지 않아도 바로 탭 로그인할 수 있습니다.
  * 단, Mac 측에는 **외부 NFC reader** 가 필요합니다.
* 이 조합은 “공유 Mac + 클라우드 신원 + 빠른 무마찰 로그인”이라는 방향을 분명하게 보여줍니다.
  * 특히 교육, 의료, 현장 근무처럼 빠른 교대 사용이 잦은 환경에서 강력합니다.

<br>
## ✅ 정리

* 이번 세션의 핵심은 Apple의 조직용 관리 전략이 더 분명해졌다는 점입니다.
  * **서비스 관리 자동화는 API로**,
  * **기기·업데이트·Safari·공유기기 운영은 DDM으로**,
  * **앱 관리는 더 세밀한 버전/구성 제어로**,
  * **인증은 Platform SSO와 Wallet 기반 경험으로** 확장되고 있습니다.
* 특히 실무적으로 중요한 포인트는 아래와 같습니다.
  * Apple Business Manager / School Manager API 도입
  * MDM 간 device migration 지원
  * 소프트웨어 업데이트 관리의 DDM 전환 가속
  * managed app의 앱별 업데이트 정책과 Mac까지의 확장
  * ManagedApp framework를 통한 앱 내부 보안 구성 전달
  * Setup Assistant 안으로 들어온 Platform SSO
  * Authenticated Guest Mode + Tap to Login 조합
* 전체적으로 보면, Apple은 단순히 “기기 관리 기능 추가”가 아니라,
  * **배포 자동화, 사용자 경험, 보안, 공유 환경 운영 효율**을 하나의 흐름으로 묶어서 발전시키고 있습니다.
  * 대규모 Apple 기기 운영 조직이나 MDM / IDP 솔루션 개발사라면 이번 업데이트는 꽤 중요한 기준점이 됩니다.
