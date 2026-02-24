# Meet Containerization

Meet Containerization https://developer.apple.com/videos/play/wwdc2025/346/



## ✨ 개요


Containerization은 macOS 에서 리눅스 컨테이너를 네이티브 앱처럼 다룰 수 있게 해 주는 오픈소스 Swift 프레임워크입니다 .

이미지 관리 · 컨테이너 실행 · 경량 VM(init 시스템 vminitd) 까지 전부 Swift 로 구현해서 , 보안 · 프라이버시 · 성능을 동시에 잡는 것이 목표입니다 .



## 📦 컨테이너 기본 개념 정리


- 컨테이너 = 애플리케이션 + 의존성 ( 바이너리 , 라이브러리 , 에셋 ) 을 하나로 패키징한 배포 단위입니 다 .

- 여러 환경 ( 로컬 · 스테이징 · 프로덕션 ) 에서 똑같이 돌아가고 , 호스트 · 다른 컨테이너와 프로세스 / 네트워 크 / 리소스가 격리됩니다 .

- 서버 사이드 앱을 대규모로 배포할 때 , 환경 복제 + 독립 스케일링 (CPU/ 메모리 / 디스크 ) 이 핵심 장 점입니다 .

- 🛡 설계 목표 : 보안 · 프라이버시 · 성능 Containerization 팀이 macOS 에 리눅스 컨테이너를 가져올 때 세운 목표는 세 가지입니다 .

- 보안 (Security)

- 기존 “ 큰 VM 하나에 컨테이너 여러 개 ” 구조 수준의 격리를 , → 컨테이너 하나당 경량 VM 으로 그대로 유지 .

- VM 안에 들어가는 core utils / libc / 동적 라이브러리 수를 최소화해서 공격 표면 · 유지 비용 을 줄이기 .

- 프라이버시 (Privacy) macOS 디렉터리 공유는 컨테이너 단위로 제한 .

- 요청한 컨테이너만 해당 디렉터리 내용을 볼 수 있게 설계 .

- 성능 (Performance & 효율 ) VM 을 컨테이너마다 띄우지만 sub-second( 수백 ms) 수준의 시작 시간 유지 .

- 컨테이너가 없으면 CPU/ 메모리 할당 0에 가깝게 , 사용량에 비례해 리소스를 쓰도록 구현 .



## 🧩 이미지 관리 & EXT4 블록 디바이스


이미지 (Image)

- 컨테이너 생성의 템플릿 :

- 파일 시스템 내용 ( 앱 파일 · 디렉터리 ) + 기본 설정 ( 실행할 프로세스 , working directory, 실행 사용자 등 ) 을 포함합니다 .

  - Containerization API 가 레지스트리 (Registry) 에서 이미지를 가져와 로컬에 저장합니다 .

- 블록 디바이스 기반 EXT4 파일 시스템 이미지를 빠르게 다루기 위해 , 큰 파일 하나를 블록 디바이스처럼 만들고 EXT4 로 포맷합니다 .

- Swift 패키지로 EXT4 파일 시스템 생성 · 디렉터리 구조 만들기 · 파일 채우기를 지원해서 , Swift 코드만으로 리눅스가 이해하는 파일 시스템을 구성할 수 있습니다 .

- 경량 VM 구조 각 컨테이너는 자기만의 작은 Linux VM 안에서 실행됩니다 .

- 이 VM 은 이미지의 EXT4 블록 디바이스를 마운트하고 , 컨테이너별 전용 IP 주소를 가집니다 → NAT/ 포트 포워딩 없이도 서비스 접근이 쉬워집

  - 니다 .

- ⚙ vminitd: Swift 로 만든 init 시스템 VM 이 부팅되면 , 가장 먼저 minimal filesystem 안에 있는 vminitd 바이너리가 실행됩니다 .

- vminitd는 Swift 로 작성된 init 시스템으로 , VM 내부에서 :

- 네트워크 인터페이스에 IP 주소 할당, EXT4 블록 디바이스를 포함한 각종 파일 시스템 마운트,

- 컨테이너 안에서 돌아갈 모든 프로세스의 실행 · 감시, 그리고 호스트에서 프로세스 관리 요청을 받을 수 있는 API까지 담당합니다 .

- 완전 정적 링크 환경 보안 · 공격 표면 축소를 위해 , 이 minimal filesystem 에는

- core utils 없음 (cd, cp, ls 등 ), 동적 라이브러리 없음 ,

  - 일반적인 libc 구현도 없습니다 .

- 대신 Swift 의 Static Linux SDK + musl libc( 정적 링크에 강한 구현 ) 를 사용해 vminitd를 정적으로 링크된 Linux 실행 파일로 ,

  - 맥에서 크로스 컴파일해서 만들어 넣습니다 .

- 🖥 container CLI: 실행 경험 Containerization API 위에 올라가는 예제로 , container라는 CLI 도구가 제공됩니다 .

- 내부는 XPC 서비스로 나뉘어 있고 , 각각 Storage,

- 이미지 관리 , 네트워크 (IP/DNS),

- 컨테이너 런타임 관리 를 담당합니다 .

- 사용 흐름 예시 :

- 이미지 가져오기 container image pull alpine:latest 레지스트리에서 이미지 내용 · 설정을 내려받고 , EXT4 블록 파일까지 생성 .

- 컨테이너 실행 container run -ti alpine:latest sh 경량 VM 이 뜨고 , 몇백 ms 안에 리눅스 쉘 프롬프트가 열립니다 .

uname -a를 치면 리눅스 커널 환경 ,

- ps aux에서는 해당 컨테이너 안의 프로세스만 보이는 것을 확인할 수 있습니다 .



## ✅ 정리 & 활용 포인트


Containerization은 Swift 코드에서 이미지 →EXT4→VM→ 컨테이너 실행까지 전 과정을 제어할 수 있는 macOS 용 리눅스 컨테이너 프레임워크입니다 .

컨테이너마다 개별 VM + 개별 IP + 개별 디렉터리 권한을 가짐으로써 ,

  - 기존 “ 큰 VM 하나 ” 보다 더 세밀한 보안 · 프라이버시 제어가 가능합니다 .

- Swift Static Linux SDK 와 musl 을 활용한 vminitd 구조 덕분에 , coreutils· 동적 라이브러리 없는 초미니 런타임에서도 컨테이너를 완전히 제어할 수 있습니

  - 다 .
