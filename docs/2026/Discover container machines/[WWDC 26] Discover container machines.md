# WWDC26 Discover container machines 요약

- Session: 389
- Title: Discover container machines
- Source: https://developer.apple.com/videos/play/wwdc2026/389/
- Topic: Containerization, Container, Linux, Virtualization, OCI Images, macOS, Vapor
- Chapters: Introduction, Containerization, Design principles, Container machine, Demo, Next steps

---

## 한 줄 요약

`container machine`은 Apple의 open-source **Containerization** 프레임워크 위에 구축된 새로운 Linux 개발 환경으로, container처럼 빠르고 가벼우면서 virtual machine처럼 상태를 유지하고, **OCI image·자동 사용자 매핑·현재 작업 디렉터리 공유·macOS와의 파일시스템 통합**을 통해 Mac에서 Linux 개발을 별도 복사 과정 없이 이어갈 수 있게 한다.

---

## 핵심 요약

이번 세션은 `container machine`이 기존 Linux container와 virtual machine 사이에서 어떤 역할을 하는지 설명한다.

핵심 개념은 다음과 같다.

- `Containerization`
  - Swift로 작성된 open-source framework
  - macOS에서 Linux container 실행
  - Storage, networking, execution, Linux init system API 제공
  - Container마다 VM 기반 isolation 사용
  - Lightweight VM과 sub-second start time 지향

- `container` CLI
  - Linux container image 생성
  - Distribution
  - Lifecycle management
  - 이번 WWDC26에서 `container machine`을 first-class feature로 제공

- `container machine`
  - Container처럼 빠르고 가벼움
  - Virtual machine처럼 persistent
  - OCI container image를 시작점으로 사용
  - 상태 변경을 보존
  - macOS username 자동 mapping
  - 현재 작업 디렉터리 자동 공유
  - Linux shell 진입 시 Mac에서 작업하던 path를 그대로 사용
  - 프로젝트 파일 복사 없이 macOS와 Linux 사이를 오갈 수 있음

세션 데모에서는 Alpine 기반 machine을 만들고, Swift toolchain이 설치된 machine에서 Vapor 서버를 실행하며, Xcode와 Icon Composer로 Mac 쪽 파일을 수정하면 Linux 환경에 즉시 반영되는 흐름을 보여준다.

---

# 🐧 Container machine이란?

Container machine은 Linux 개발 환경을 Mac에 통합하기 위한 새로운 기능이다.

Apple은 이를 다음 두 특성의 결합으로 설명한다.

```text
Container의
빠름 + 가벼움

        +

Virtual Machine의
지속성(Persistence)
```

Container machine은 일회성 작업용 container보다 오래 유지되는 개발 환경을 제공한다.

프로젝트별 toolchain과 dependency를 설치한 뒤 machine을 stop했다가 나중에 다시 시작해도 상태를 이어갈 수 있다.

---

# 🧱 기반: Containerization

Container machine은 WWDC25에서 open source로 공개된 `Containerization` 프레임워크 위에 만들어졌다.

Containerization은 Swift framework이며 macOS에서 Linux container를 실행할 수 있게 한다.

프레임워크가 제공하는 주요 API 영역은 다음과 같다.

- Storage
- Networking
- Execution
- Linux init system

각 container는 lightweight virtual machine 안에서 실행된다.

이 구조를 통해 container마다 VM 기반 isolation을 제공한다.

---

# ⚡ Lightweight VM과 시작 속도

Containerization의 VM은 전통적인 heavyweight VM보다 가볍게 설계된다.

세션에서는 다음 특징을 강조한다.

- VM-based isolation
- Lightweight
- Performant
- Sub-second start times

즉 container의 빠른 시작 경험을 유지하면서 VM 수준의 격리를 제공하는 것이 기반 설계의 중요한 목표다.

---

# 🧰 `container` CLI

Containerization과 함께 `container` command-line tool도 open source로 제공된다.

이 도구는 Linux container의 다음 lifecycle을 관리한다.

- Image creation
- Distribution
- Creation
- Execution
- Stop / start
- Lifecycle management

WWDC26에서 `container machine`은 이 기존 `container` tool 안에 first-class feature로 추가된다.

따라서 별도의 완전히 다른 virtualization tool을 배우기보다 이미 사용하던 `container` CLI 흐름을 유지할 수 있다.

---

# 🎯 Container machine의 설계 원칙

Apple은 Container machine을 만들 때 네 가지 원칙을 두었다.

---

# ⚡ Fast and Lightweight

개발 workflow에 자연스럽게 들어가려면 환경 생성과 실행이 빨라야 한다.

Linux 환경을 사용하기 위해 무거운 VM을 오래 부팅해야 한다면 macOS와 Linux를 자주 오가는 workflow가 불편해진다.

Container machine은 container 수준의 빠른 사용성을 목표로 한다.

---

# 🧰 Simple to Manage

새 환경을 빠르게 만들 수 있어야 한다.

프로젝트마다 필요한 다음 항목이 다를 수 있다.

- Toolchain
- Dependency
- Build tool
- Library
- Runtime

Machine을 프로젝트별로 쉽게 만들 수 있다면 서로 다른 프로젝트의 dependency가 충돌하는 문제를 줄일 수 있다.

---

# 💾 Persistent

개발 환경은 시간이 지나면서 변한다.

예:

- 추가 package 설치
- 새로운 compiler 추가
- Debugging tool 설치
- Project-specific dependency 설치

일회성 container라면 이런 변경을 매번 다시 만들어야 할 수 있다.

Container machine은 stateful 환경이므로 작업 중 추가한 변경을 보존한다.

Machine을 stop했다가 나중에 다시 시작해도 이전 상태를 이어갈 수 있다.

---

# 🍎 macOS의 확장처럼 느껴져야 함

가장 중요한 경험 목표 중 하나는 macOS와 Linux 사이의 context switch를 최소화하는 것이다.

Container machine은 Linux 환경을 별도의 외부 시스템이라기보다 Mac 개발 환경의 연장선처럼 보이게 한다.

이를 위해 다음 통합을 제공한다.

- Automatic user mapping
- Shared filesystem
- Current working directory mirroring
- Terminal에서 바로 Linux environment 진입

---

# 🏗️ Container machine의 구조

각 Container machine은 자체 lightweight virtual machine 안에서 실행된다.

그리고 일반 container와 동일한 image format을 사용한다.

즉 OCI image를 machine 생성의 시작점으로 사용할 수 있다.

```text
macOS
  │
  ├─ container CLI
  │
  └─ Containerization
       │
       └─ Lightweight VM
            │
            └─ Container machine
                 └─ Linux environment
```

---

# 📦 OCI Image를 그대로 사용

Container machine은 container에서 사용하는 것과 동일한 OCI image를 사용한다.

따라서 기존 image를 새로운 machine의 base environment로 사용할 수 있다.

세션에서는 Alpine image를 사용한다.

```bash
container machine create --name demo --set-default alpine
```

이 명령은 다음 작업을 한다.

- 새 machine 생성
- 이름을 `demo`로 지정
- 기본 machine으로 설정
- Alpine OCI image를 초기 environment로 사용

---

# ⭐ Default Machine

Machine을 default로 설정하면 이후 command에서 매번 machine 이름을 지정하지 않아도 된다.

예:

```bash
container machine run echo hi
```

명시적으로 machine 이름을 넣지 않아도 default machine 안에서 command가 실행된다.

---

# ▶️ Linux Command 직접 실행

Machine 내부에서 command 하나만 실행할 수도 있다.

```bash
container machine run echo hi
```

출력은 Linux 환경 안에서 실행된 결과다.

---

# 🧪 `uname`으로 Runtime 확인

세션은 macOS와 Linux의 차이를 보여주기 위해 `uname`을 실행한다.

macOS에서:

```bash
uname
```

결과:

```text
Darwin
```

Container machine에서:

```bash
container machine run uname
```

결과:

```text
Linux
```

즉 사용자는 같은 Mac terminal에서 명령하지만 실제 실행 환경은 Linux machine이다.

---

# 👤 Automatic User Mapping

Container machine은 macOS 사용자의 username을 자동으로 mirror한다.

Mac의 `whoami`와 Container machine의 interactive shell 안에서 `whoami` 결과가 동일하게 유지된다.

이렇게 하면 Linux 환경에 들어갈 때 별도의 user account 이름을 의식할 필요가 없다.

---

# 📂 Current Working Directory Mirroring

Username뿐 아니라 현재 작업 디렉터리도 자동으로 공유된다.

```bash
container machine run
```

Interactive shell에 들어간 뒤 `pwd`를 실행하면 Mac에서 작업하던 동일한 path를 볼 수 있다.

```text
Mac Terminal
현재 project directory
      ↓
container machine run
      ↓
Linux shell
같은 project directory
```

---

# 🖥️ Interactive Shell

추가 argument 없이 다음 명령을 실행하면 interactive shell을 시작한다.

```bash
container machine run
```

Automatic filesystem sharing 덕분에 Mac의 프로젝트 파일을 Linux 환경에서 그대로 사용할 수 있다.

---

# 🔄 macOS ↔ Linux Workflow

Container machine이 해결하려는 핵심 문제는 cross-platform development의 context switch다.

세션 예제에서는 하나의 Vapor web server project를 두 환경에서 동시에 다룬다.

## macOS에서 하는 작업

- Xcode로 source 편집
- Icon Composer로 image asset 편집
- Safari로 결과 확인

## Linux에서 하는 작업

- Swift compile
- Vapor server 실행

파일을 수동으로 복사하지 않고 같은 프로젝트를 공유한다.

---

# 🧑‍💻 예제: Vapor Web Server

Project에는 다음이 있다.

```text
Package.swift
Sources/
Public/
```

개발 workflow는 다음과 같다.

```text
Xcode on macOS
      ↓
source 수정

Shared filesystem
      ↓

Container machine on Linux
      ↓
build + run

Isolated network
      ↓

Safari on macOS
      ↓
결과 확인
```

---

# 🧰 Swift Toolchain이 설치된 Machine

발표자는 Swift toolchain이 설치된 Container machine을 사용한다.

Machine은 persistent하기 때문에 toolchain을 설치한 상태를 계속 유지할 수 있다.

이것이 일반적인 ephemeral container보다 개발 환경으로 사용하기 편한 이유 중 하나다.

---

# 📋 `container machine list`

생성된 machine을 확인하려면 다음 명령을 사용한다.

```bash
container machine list
```

세션에서는 다음 정보를 표시한다고 설명한다.

- Machine name
- IP address
- Resource information

Vapor 서버에 macOS Safari에서 접근하기 위해 이 IP address를 사용한다.

---

# 🌐 Isolated Networking

Container machine은 isolated network를 가진다.

따라서 machine 안에서 실행되는 서버를 macOS에서 접속하려면 서버가 외부 interface에서 listen하도록 구성해야 한다.

세션에서는 Vapor의 hostname configuration을 Container machine의 IP address로 변경한다.

---

# ✏️ Xcode에서 Linux 서버 설정 수정

발표자는 Linux machine 내부에서 configuration file을 직접 수정하지 않는다.

Mac의 Xcode에서 파일을 열어 Vapor server hostname을 앞에서 복사한 Container machine IP로 변경한다.

파일 저장 후 별도의 copy 과정이 없다.

Shared filesystem 덕분에 Linux machine에서 수정된 파일이 즉시 보인다.

---

# 🔨 Linux에서 Build 및 Run

설정 변경 후 interactive shell에서 project를 build하고 실행한다.

```bash
swift run
```

Vapor server가 Container machine 안의 Linux 환경에서 실행된다.

---

# 🌍 macOS Safari에서 Linux Server 접속

Server가 실행되면 macOS의 Safari에서 Container machine IP와 port 8080으로 접속한다.

```text
Safari on macOS
      ↓
Container machine IP : 8080
      ↓
Vapor on Linux
```

이를 통해 Linux에서 실제로 실행되는 서버를 Mac에서 바로 테스트할 수 있다.

---

# 🎨 Icon Composer와 Shared Filesystem

세션 후반에는 static asset을 수정한다.

발표자는 Icon Composer에서 storage icon의 background를 gradient로 변경한다.

그 다음 새 icon을 project에 export하고 기존 파일을 덮어쓴다.

---

# 🚫 파일 복사가 필요하지 않음

수정된 icon을 Container machine에 별도로 복사하지 않는다.

Project directory 자체가 공유되어 있기 때문에 Mac에서 덮어쓴 파일이 Linux environment에서도 같은 파일로 보인다.

Safari를 refresh하면 새 icon이 바로 표시된다.

---

# 🔁 Demo 전체 흐름

```text
container machine create
        ↓
Alpine 기반 Linux 환경 생성
        ↓
default machine 설정
        ↓
container machine run
        ↓
macOS username / directory 자동 공유
        ↓
Xcode에서 project 수정
        ↓
Linux machine에서 swift run
        ↓
Safari에서 Linux server 접속
        ↓
Icon Composer에서 asset 수정
        ↓
파일 복사 없이 Linux에 즉시 반영
        ↓
Safari refresh
```

---

# 🧩 Container와 Container machine 비교

| 특성 | Container | Container machine |
|---|---|---|
| 빠르고 가벼움 | O | O |
| OCI image 사용 | O | O |
| VM 기반 isolation | Containerization 기반 | Containerization 기반 |
| 상태 지속 | 일반 workflow에 따라 다름 | 핵심 설계 목표 |
| 장기 개발 환경 | 일회성 작업에 더 자연스러울 수 있음 | 적합 |
| Tool 설치 후 재사용 | image/container 관리 필요 | machine state에 지속 |
| macOS user mapping | - | 자동 |
| 현재 디렉터리 공유 | - | 자동 integration |
| Interactive Linux 개발 환경 | 가능 | 핵심 경험 |

Container machine의 핵심 차별점은 단순히 Linux process를 실행하는 것이 아니라 **지속적으로 돌아오는 개발 환경**이라는 점이다.

---

# 🧪 프로젝트별 전용 환경

Machine을 빠르게 만들 수 있다는 것은 프로젝트별로 독립된 환경을 만들 수 있다는 뜻이다.

```text
Project A
└─ Swift toolchain A
└─ Dependencies A

Project B
└─ Swift toolchain B
└─ Dependencies B
```

서로 다른 toolchain이나 dependency를 한 환경에 섞지 않아도 된다.

---

# 💾 Persistence가 중요한 이유

개발 lifecycle 동안 필요한 도구는 계속 변할 수 있다.

초기에는 compiler만 필요하다가 이후 다음 도구를 설치할 수 있다.

- Debugger
- Database client
- Deployment utility
- Additional package manager
- Test dependency

Container machine에서는 이런 변경이 machine에 유지된다.

다음 작업 때 같은 환경으로 돌아갈 수 있다.

---

# 🍎 Mac Tool과 Linux Runtime을 함께 사용

세션 demo에서는 다음 조합이 사용된다.

| 작업 | 도구 / 환경 |
|---|---|
| Source editing | Xcode / macOS |
| Asset editing | Icon Composer / macOS |
| Server build | Swift / Linux |
| Server runtime | Vapor / Linux |
| Browser testing | Safari / macOS |

즉 각 작업에 가장 적합한 platform tool을 선택하면서 같은 project directory를 공유한다.

---

# 🔐 Isolation과 Integration의 균형

Container machine은 두 가지 요구를 동시에 만족하려 한다.

## Isolation

- 각각 독립된 lightweight VM
- Linux runtime
- Isolated network
- 프로젝트별 환경

## Integration

- macOS username mapping
- Shared filesystem
- Current directory mirroring
- 같은 CLI workflow
- Mac tool에서 수정한 파일 즉시 반영

Linux execution은 격리하면서 개발 experience는 Mac에 밀접하게 연결한다.

---

# 🧰 세션에서 사용한 주요 명령

## 전체 command overview

```bash
container machine
```

## 새 machine 생성

```bash
container machine create --name demo --set-default alpine
```

## Command 실행

```bash
container machine run echo hi
```

## Linux runtime 확인

```bash
container machine run uname
```

## Interactive shell

```bash
container machine run
```

## Machine 목록

```bash
container machine list
```

## Vapor application 실행

```bash
swift run
```

---

# 🔁 권장 개발 Workflow

| 단계 | 작업 |
|---|---|
| Base 선택 | 필요한 OCI image 선택 |
| Machine 생성 | `container machine create` |
| Default 설정 | 필요하면 `--set-default` |
| 환경 준비 | Toolchain과 dependency 설치 |
| Mac에서 작업 | Xcode, editor, asset tool 사용 |
| Linux 진입 | `container machine run` |
| Build / Test | Linux target에서 실행 |
| Network 확인 | 필요하면 machine IP 사용 |
| Mac에서 검증 | Safari 등 host tool 사용 |
| Stop | 작업 종료 |
| Revisit | Persistent state 그대로 재사용 |

---

# 📋 체크리스트

## Machine 생성
- [ ] 사용할 OCI image 결정
- [ ] 프로젝트별 machine 이름 결정
- [ ] `container machine create`로 환경 생성
- [ ] 자주 사용할 machine이면 default 설정 검토
- [ ] 필요한 toolchain 설치

## macOS Integration
- [ ] macOS username이 예상대로 mapping되는지 확인
- [ ] `pwd`로 working directory 공유 확인
- [ ] 프로젝트 파일이 Linux environment에서 보이는지 확인
- [ ] 불필요한 수동 file copy workflow가 남아 있지 않은지 검토

## Linux Build
- [ ] Interactive shell에서 runtime 확인
- [ ] `uname`으로 Linux 환경 검증
- [ ] 필요한 compiler / package manager 설치
- [ ] macOS에서 편집한 변경 사항이 바로 반영되는지 확인
- [ ] Linux에서 실제 production target과 가까운 방식으로 build

## Networking
- [ ] `container machine list`에서 IP 확인
- [ ] 서버가 machine 외부에서 접근 가능한 interface에 listen하는지 확인
- [ ] 필요한 port 확인
- [ ] macOS host에서 machine IP로 접근 테스트
- [ ] Network isolation을 고려해 개발 server 구성

## Persistence
- [ ] Toolchain 설치 후 stop/start 사이에 상태가 유지되는지 확인
- [ ] 프로젝트별 dependency를 독립 machine에 분리할지 검토
- [ ] 장기적으로 재사용할 환경과 일회성 container를 구분

## Workflow
- [ ] Mac native editor와 Linux runtime 역할 분리
- [ ] Xcode로 source editing 유지 가능 여부 확인
- [ ] macOS asset tool 결과가 즉시 Linux build에 반영되는지 확인
- [ ] Host browser를 이용한 테스트 흐름 구성
- [ ] 불필요한 context switch를 줄이는 방향으로 command 정리

---

# 핵심 메시지

`container machine`의 핵심은 Linux를 Mac 안에 단순히 실행하는 것이 아니다.

Apple은 **container의 빠르고 가벼운 사용성**, **OCI image 생태계**, **virtual machine의 persistence**, 그리고 **macOS와의 긴밀한 integration**을 하나의 개발 환경으로 결합하려 한다.

각 machine은 lightweight VM에 격리되지만, 사용자는 자신의 macOS username과 현재 작업 디렉터리를 그대로 사용한다.

따라서 Xcode에서 코드를 수정하고 Icon Composer에서 asset을 바꾸면서, 같은 파일을 Linux에서 build하고 Safari로 즉시 검증할 수 있다.

프로젝트별 toolchain을 오래 유지해야 하면서도 전통적인 VM처럼 큰 context switch를 원하지 않는 cross-platform 개발 workflow가 Container machine이 해결하려는 핵심 문제다.

---

# 함께 보면 좋은 세션

- Meet Containerization — WWDC25
