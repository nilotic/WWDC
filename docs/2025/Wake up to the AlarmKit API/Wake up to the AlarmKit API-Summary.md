# ⏰ Build Powerful System Alarms with AlarmKit

------------------------------------------------------------------------

## ✨ 개요

AlarmKit은 iOS에서 앱이 시스템 수준의 알람을 생성할 수 있도록 해주는
새로운 프레임워크입니다.

AlarmKit으로 만들 수 있는 알람은:

-   특정 고정 시점 또는 카운트다운 기반
-   Silent 모드 및 Focus를 뚫고 표시
-   Snooze / Stop 버튼 제공
-   StandBy, Dynamic Island, Apple Watch 연동
-   Live Activity 기반 커스텀 카운트다운 UI 지원

> 단순 알림(Notification)이 아니라 "시스템급 알람 경험"입니다.

------------------------------------------------------------------------

# 🔐 Authorization 설정

## 1️⃣ Info.plist 설정

NSAlarmKitUsageDescription

-   알람 사용 목적을 명확히 설명
-   사용자 동의 필요

------------------------------------------------------------------------

## 2️⃣ 권한 요청

``` swift
await AlarmManager.requestAuthorization()
```

또는 첫 알람 생성 시 자동 요청

------------------------------------------------------------------------

## 3️⃣ 권한 상태 확인

``` swift
AlarmManager.authorizationState
```

-   notDetermined
-   authorized
-   denied

denied 시 UI에서 명확히 안내 필요

------------------------------------------------------------------------

# 🧱 Alarm 구성 요소

알람 생성 시 필요한 핵심 요소:

1.  Countdown Duration (pre / post)
2.  Schedule (fixed / relative)
3.  Appearance
4.  Custom Action
5.  Sound

------------------------------------------------------------------------

# ⏳ Countdown 구조

-   Pre-alert duration → 알람 울리기 전 카운트다운
-   알람 발생
-   Snooze 시
-   Post-alert duration → 다시 카운트다운 후 재알림

예시: - 10분 타이머 - 재알림 시 5분 카운트다운

------------------------------------------------------------------------

# 📅 Schedule 종류

## 1️⃣ Fixed Schedule

-   특정 날짜/시간
-   타임존 변경 영향 없음

AlarmSchedule.fixed(date)

------------------------------------------------------------------------

## 2️⃣ Relative Schedule

-   특정 시각
-   반복 패턴 지원
-   타임존 변경 반영

예: - 매주 월/수/금 오전 7시

------------------------------------------------------------------------

# 🎨 Alert Appearance 커스터마이징

## AlarmButton

``` swift
AlarmButton(
    title: "Dismiss",
    textColor: .white,
    systemImage: "xmark"
)
```

설정 가능:

-   Title
-   Text color
-   SF Symbol
-   Secondary button behavior

------------------------------------------------------------------------

## Secondary Button 동작

-   .countdown → Snooze / Repeat
-   .custom → AppIntent 실행

------------------------------------------------------------------------

# 🏝 Live Activity 기반 Countdown UI

카운트다운을 지원하는 알람은 Live Activity 필수

표시 위치:

-   Lock Screen
-   Dynamic Island
-   StandBy

구현 흐름:

1.  Widget Extension 추가
2.  ActivityConfiguration 설정
3.  AlarmAttributes 지정
4.  Countdown / Paused 상태 분기 처리

------------------------------------------------------------------------

# 🧠 AlarmMetadata 활용

커스텀 데이터 전달 가능

struct CookingData: AlarmMetadata

예:

-   조리 방식 (frying / grilling)
-   아이콘 생성
-   Live Activity UI 반영

------------------------------------------------------------------------

# 🎛 System Countdown Presentation

Live Activity 표시 불가 상황 대비:

-   Countdown system presentation
-   Paused presentation
-   Resume / Pause 버튼 정의

------------------------------------------------------------------------

# 🎨 Tint Color

AlarmAttributes에서 설정

적용 위치:

-   Secondary 버튼 배경
-   Lock Screen 타이틀
-   Countdown 텍스트
-   Dynamic Island UI

앱 아이덴티티와 연결되는 핵심 요소

------------------------------------------------------------------------

# ⚙️ Custom Action (App Intent)

알람 버튼에서 앱 코드 실행 가능

secondaryButtonBehavior: .custom

## App Intent 설정

-   alarm identifier 전달
-   openAppWhenRun = true 설정 가능

예:

-   "Open" 버튼 → 앱 열기
-   특정 알람 상세 화면 표시

------------------------------------------------------------------------

# 🔊 Sound 설정

기본 시스템 사운드 사용 가능\
또는 커스텀 사운드 지정

AlertSound(named: "alarm.wav")

-   Main bundle
-   Library/Sounds

------------------------------------------------------------------------

# 🔄 Alarm Lifecycle 관리

AlarmManager 사용

-   schedule
-   cancel
-   stop
-   pause
-   resume
-   transition to countdown

고유 identifier로 관리

------------------------------------------------------------------------

# 📌 Best Practices

사용 적합 사례:

-   요리 타이머
-   기상 알람
-   정기 반복 알림

사용 부적합:

-   Critical Alert 대체용
-   Time-sensitive notification 대체용

------------------------------------------------------------------------

## UX 권장사항

-   명확한 타이틀
-   명확한 액션 버튼
-   Countdown 지원 시:
    -   남은 시간 표시
    -   Dismiss
    -   Pause/Resume 포함

------------------------------------------------------------------------

# 🧠 핵심 정리

1.  AlarmKit은 시스템급 알람 생성 API
2.  Authorization 필수
3.  Fixed / Relative schedule 지원
4.  Live Activity 기반 Countdown UI
5.  AlarmMetadata로 커스텀 데이터 전달
6.  App Intent로 커스텀 액션 실행 가능
7.  AlarmManager로 전체 lifecycle 제어

------------------------------------------------------------------------

## 🔥 한 문장 요약

AlarmKit은 앱이 시스템 알람 경험을 직접 설계할 수 있게 해주는
프레임워크입니다.

단순 알림을 넘어서\
Lock Screen, Dynamic Island, Apple Watch까지 확장되는\
완전한 알람 시스템을 구축할 수 있습니다.
