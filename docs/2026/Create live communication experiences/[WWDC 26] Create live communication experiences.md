# Create live communication experiences

Create live communication experiences  
https://developer.apple.com/videos/play/wwdc2026/226/

## ✨ 개요

LiveCommunicationKit은 음성 및 영상 통화 앱을 iOS 시스템 경험과 자연스럽게 통합하기 위한 프레임워크입니다.

잠금 화면, Dynamic Island, 전화 앱의 최근 통화, Siri와 연동되는 통화 경험을 제공하며, 기존 CallKit 기반 통화 앱을 보다 현대적인 구조로 구현할 수 있도록 설계되었습니다.

이번 세션에서는 LiveCommunicationKit의 핵심 모델인 Conversation을 중심으로 통화 생성부터 종료까지의 생명주기, PushKit을 이용한 수신 통화, 발신 통화, 그룹 통화, 통화 병합 기능을 소개합니다.

## 🧱 Conversation 모델

Conversation은 하나의 실시간 통화를 나타내는 기본 객체입니다.

Conversation은 크게 두 가지 정보로 구성됩니다.

- Handle
  - 전화번호, 이메일 또는 문자열 형태의 참가자 식별 정보
  - 연락처와 연결되어 이름과 사진을 표시할 수 있음
  - 최근 통화에서 다시 통화를 시작할 때도 사용

- Capability
  - 해당 통화에서 지원하는 기능
  - 음성 / 영상 통화
  - Hold / Resume
  - 통화 병합
  - 통화 분리

Capability는 통화 중에도 변경할 수 있으며 시스템 UI 역시 함께 업데이트됩니다.

## 🔄 Conversation 생명주기

Conversation은 다음 상태를 거쳐 진행됩니다.

- Idle
- Joining
- Joined
- Leaving
- Left

사용자가 통화를 수락하면 앱은 서버 연결과 미디어 스트림을 준비한 뒤 Joined 상태를 보고합니다.

통화가 종료되면 연결을 정리하고 Conversation도 함께 종료됩니다.

Hold와 Resume 역시 동일한 상태 모델 안에서 처리됩니다.

## 🧩 ConversationManager

ConversationManager는 모든 Conversation을 관리하는 중심 객체입니다.

주요 역할은 다음과 같습니다.

- 새로운 Conversation 등록
- 상태 변경 보고
- 시스템 UI 업데이트
- 시스템 Action 전달

잠금 화면, Dynamic Island, 전화 앱에서 발생한 모든 동작은 Delegate를 통해 앱으로 전달됩니다.

앱 내부 UI에서 시작한 동작 역시 동일한 Action을 사용하기 때문에 하나의 처리 흐름으로 구현할 수 있습니다.

## 📲 수신 통화

수신 통화는 PushKit 기반으로 동작합니다.

전체 흐름은 다음과 같습니다.

- 서버가 VoIP Push 전송
- PushKit이 앱 실행
- Conversation 생성
- reportNewIncomingConversation 호출
- 시스템 수신 통화 UI 표시

Apple은 PushKit Delegate가 반환되기 전에 반드시 Conversation을 시스템에 보고해야 한다고 설명합니다.

사용자가 통화를 수락하면 JoinConversationAction이 전달되고 앱은 서버 연결과 미디어 연결을 완료한 뒤 Joined 상태를 보고합니다.

## 📤 발신 통화

발신 통화도 동일한 구조를 사용합니다.

StartConversationAction을 생성한 뒤 ConversationManager에서 수행하면 시스템 UI가 업데이트되고 Delegate에서 실제 통화 연결을 수행합니다.

앱에서 시작한 통화와 시스템에서 시작한 통화 모두 동일한 Action 기반으로 처리됩니다.

## 👥 그룹 통화

그룹 통화에서는 참가자 전체와 현재 실제로 미디어를 송수신 중인 참가자를 구분하여 관리합니다.

Conversation Update를 이용해 참가자 변경 사항을 계속 시스템에 전달하며 시스템 UI도 함께 갱신됩니다.

## 🔀 통화 병합

LiveCommunicationKit은 동시에 진행 중인 두 개의 Conversation을 하나의 그룹 통화로 병합할 수 있습니다.

MergeConversationAction이 Delegate로 전달되면 앱은 두 통화를 병합하고 변경된 참가자 정보를 다시 시스템에 보고합니다.

병합된 통화를 다시 분리하는 기능 역시 동일한 Action 기반으로 처리됩니다.

## 📱 최근 통화 및 Siri

Conversation이 종료된 이후에는 전화 앱의 최근 통화와 Spotlight를 통해 다시 통화를 시작할 수 있습니다.

이를 위해 앱은 Conversation 관련 Intent를 Donate해야 하며, 다시 연결 가능한 안정적인 Handle을 유지하는 것이 권장됩니다.

## ✅ 정리

이번 세션에서는 LiveCommunicationKit의 핵심 구조인 Conversation과 ConversationManager를 중심으로 통화의 전체 생명주기를 설명했습니다.

또한 PushKit을 이용한 수신 통화, 발신 통화, 그룹 통화, 통화 병합, 최근 통화 및 Siri 연동까지 LiveCommunicationKit이 제공하는 주요 기능과 동작 방식을 소개했습니다.
