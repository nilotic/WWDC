# Discover Apple-Hosted Background Assets

Discover Apple-Hosted Background Assets https://developer.apple.com/videos/play/wwdc2025/325/



## ✨ 개요


앱 첫 실행 전에 필요한 리소스를 기기에 자동으로 내려받고 , 앱 업데이트 없이도 자산만 교체할 수 있는 Managed Background Assets와 Apple 호스팅 (200GB 포함 ), 그리고 다운로더 확장 ( 시스템 기본

제공 ), 크로스플랫폼 패키징 / 모킹 툴 (ba-package/ba-serve) 이 소개됩니다 . 또한 On-Demand Resources(ODR) 는 폐기 예정이므로 Background Assets 로의 이전이 권장됩니다 .

🚀 주요 변화

- Apple-Hosted Background Assets: 자체 서버 없이 App Store Connect 에 에셋 팩을 업로 드 · 심사 · 배포 ( 회원 포함 200GB).

- Managed 모드: 시스템이 다운로드 / 업데이트 / 압축을 자동 관리 , 코드 없는 시스템 다운로더 확장을 바로 포함 가능 .

- 버전 / 컨텍스트 매칭: App Store·TestFlight( 내부 / 외부 ) 컨텍스트별 ‘ 라이브 ʼ 버전이 기기 빌드와 자 동 매칭 ( 자산 버전 갱신 시 이전 앱도 새 자산 사용 ).

- 크로스플랫폼 도구: ba-package( 패키징 ), ba-serve( 모크 서버 ) – macOS 포함 Linux/Windows 지원 예정 .



## 📦 다운로드 정책 (3 가지 )


- Essential: 설치 진행률에 포함되어 첫 실행 전까지 반드시 다운로드. ( 신규 설치에만 제한 가능 )

- Prefetch: 설치 중 시작하지만 , 설치 후 백그라운드로 이어질 수 있음.

- On-demand: API 호출 시에만 다운로드 .



## 🧩 통합 흐름 ( 요약 )


- 패키징: 리포지토리 기준 경로로 매니페스트 작성 → ba-package로 .aar 생성 .

- 앱 설정: Xcode 에서 Background Download 타겟 추가 ( 시스템 구현 사용 가능 ).

- 코드: AssetPackManager.shared ensureLocalAvailability(of:)( 필요 시 다운로드 & 진행 표시 ), statusUpdates(forAssetPackWithID:)(Swift async 시퀀스 / Obj-C delegate), 파일 접근 contents(at:searchingInAssetPackWithID:) 또는 descriptor(for:), 정리 remove(assetPackWithID:).

- 권한 / 설정: App Group 공유, Info.plist 에 BAAppGroupID, BAHasManagedAssetPacks(true), (Apple 호스팅 시 ) BAUsesAppleHosting 추가 . 자체 호스팅은 BAManifestURL 등 참고 .

- 로컬 테스트: 루트 CA 발급 → 기기 설치 →ba-serve로 모크 서버 구동 →Developer Settings 의 Development Overrides에서 서버 URL 지정 .

- ☁ 배포 (Apple 호스팅 )

- 업로드 경로: Transporter( 드래그 & 드롭 ) / iTMSTransporter(CLI) / App Store Connect API.

- ASC API 절차:

- ① backgroundAssets에 자산 팩 생성 (POST) → ② backgroundAssetVersions로 버전 생성 (POST) →

- ③ backgroundAssetUploadFiles로 업로드 예약 / 업로드 → ④ 처리 완료 후 내부 테스트 Ready, 외부 테스트 / 배포는 각 리소스로 제출 · 모니터링 .



## ✅ 체크리스트


- ODR 사용 중이면 Background Assets 로 마이그레이션 계획 수립

- 에셋 팩 단위로 논리적 그룹화 ( 예 : 튜토리얼 레벨 , ML 모델 , DLC)

- 첫 실행 필수는 Essential, 나머지는 Prefetch/On-demand로 분리

- 시스템 다운로더 확장 기본 구현부터 적용 ( 커스터마이즈는 shouldDownload(_:))

- 저장 공간 노출 고려해 사용 종료 팩은 remove() 로 정리

- Apple 호스팅 채택 시 버전 – 컨텍스트 매칭 규칙 숙지 ( 업데이트 시 구버전 앱에도 반영 ).
