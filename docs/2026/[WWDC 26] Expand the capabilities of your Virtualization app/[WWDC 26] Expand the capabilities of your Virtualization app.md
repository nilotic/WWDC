# WWDC26 Expand the capabilities of your Virtualization app 요약

- Session: 224
- Title: Expand the capabilities of your Virtualization app
- Source: https://developer.apple.com/videos/play/wwdc2026/224/
- Topic: Virtualization, Accessory Access, vmnet, DiskImageKit, Virtio, macOS guest provisioning
- Chapters: Introduction, macOS guest provisioning, Accessory Access, Advanced network topologies, DiskImageKit, Custom Virtio

---

## 한 줄 요약

macOS 27의 Virtualization은 **macOS guest의 첫 부팅 계정 provisioning 자동화, 사용자가 직접 승인하는 USB passthrough, `vmnet` 기반 custom network topology와 port forwarding, DiskImageKit의 sparse layered disk image, Linux guest용 custom Virtio device**를 추가해 VM 앱을 단순 desktop virtualization에서 자동화·테스트·고성능 host/guest integration 플랫폼으로 확장한다.

---

## 핵심 요약

이번 세션은 Virtualization 앱을 더 강력하게 만드는 다섯 가지 영역을 다룬다.

- **macOS guest provisioning**
  - 첫 부팅 Setup Assistant를 programmatic하게 자동화
  - Full name, username, password 지정
  - Auto-login과 SSH Remote Login 선택적 활성화
  - `VZMacGuestProvisioningOptions`
  - `VZMacOSVirtualMachineStartOptions`
  - 이미 setup이 끝난 guest에는 이후 provisioning option이 무시됨

- **Accessory Access**
  - USB accessory를 macOS/Linux VM에 runtime passthrough
  - 사용자가 어떤 device를 어떤 앱에 연결할지 직접 제어
  - Device hot plugging 지원
  - `AAUSBAccessoryManager`, `AAUSBAccessoryListener`
  - `VZUSBPassthroughDeviceConfiguration`
  - Xcode의 **Claim USB Accessory** capability 필요

- **Advanced network topology with `vmnet`**
  - 여러 VM 간 custom network 구성
  - DHCP 설정
  - TCP/UDP host port forwarding
  - 여러 VM이 같은 `vmnet` network object 공유 가능
  - Network는 app 종료 후 자동 persist되지 않으므로 설정은 앱이 별도 보존해야 함
  - XPC 간 network serialization 가능

- **DiskImageKit**
  - macOS 27의 새 disk image framework
  - ASIF(Apple Sparse Image Format) 지원
  - Base / Cache / Overlay layer 구성
  - Copy-on-write snapshot
  - Slow backing storage 앞단 cache
  - Read-only layer를 여러 concurrent stack에서 공유
  - Shallow stack이 더 좋은 성능

- **Custom Virtio**
  - Linux VM에 custom paravirtualized device 구현
  - Low-latency / high-throughput host↔guest communication
  - Custom protocol, crypto coprocessor, ML accelerator access 같은 use case
  - `VZCustomVirtioDeviceConfiguration`
  - `VZCustomVirtioDevice`
  - Virtio queue와 interrupt 활용
  - Guest 쪽 custom driver 필요

---

# 🧭 Virtualization 앱이 다루는 범위

Virtualization framework는 단순히 macOS나 Linux desktop을 띄우는 데만 쓰이는 것이 아니다.

세션이 제시한 use case는 다음과 같다.

- Full desktop experience
- Collaborative Mac app testing
- 여러 VM / device 간 networking test
- Command-line virtualization tool
- Controlled test environment automation

이번 업데이트는 이런 고급 workflow를 위해 VM의 setup, hardware access, networking, storage, custom device integration을 확장한다.

---

# 👤 macOS Guest Provisioning

Virtual Mac에 macOS를 설치한 뒤 처음 부팅하면 일반 물리 Mac과 동일하게 Setup Assistant를 사용한다.

일반적인 수동 흐름:

```text
macOS Install
    ↓
First Boot
    ↓
Setup Assistant
    ↓
User Account 생성
    ↓
Settings 구성
```

자동화 환경에서는 이 과정을 사람이 직접 처리하는 것이 비효율적이다.

macOS 27의 Virtualization framework는 첫 부팅 시 provisioning option을 전달할 수 있게 한다.

---

# 🧾 지정 가능한 Provisioning 정보

세션에서 직접 언급한 항목:

- Full name
- Username
- Password
- Automatic login
- Remote login via SSH

즉 테스트용 VM을 boot한 직후 바로 자동 로그인된 상태로 만들고 SSH까지 활성화할 수 있다.

---

# 🧩 `VZMacGuestProvisioningOptions`

먼저 provisioning 설정을 만든다.

```swift
import Virtualization

let provisioningOptions = VZMacGuestProvisioningOptions()
provisioningOptions.fullName = fullName
provisioningOptions.username = username
provisioningOptions.password = password
provisioningOptions.logsInAutomatically = true
provisioningOptions.enablesRemoteLogin = true
```

이 객체는 Setup Assistant에 전달할 초기 user configuration을 표현한다.

---

# ▶️ `VZMacOSVirtualMachineStartOptions`

Provisioning option은 VM static configuration에 넣는 것이 아니라 **start option**에 연결한다.

```swift
let startOptions = VZMacOSVirtualMachineStartOptions()
try startOptions.setGuestProvisioning(provisioningOptions)

try await virtualMachine.start(options: startOptions)
```

전체 흐름:

```text
VZMacGuestProvisioningOptions 생성
        ↓
VZMacOSVirtualMachineStartOptions에 연결
        ↓
VM start
        ↓
Guest first boot
        ↓
Setup Assistant가 자동 provisioning
```

---

# 🖥️ 세션 Demo

Apple sample app을 수정해 provisioning API를 적용한다.

상태:

- macOS 설치 완료
- 아직 첫 boot는 하지 않음

App이 remembered provisioning option을 보여준다.

예:

```text
Full Name: Jane Appleseed
Username: jappleseed
Auto Login: Enabled
Remote Login: Enabled
```

OK를 누르고 VM을 boot하면 Setup Assistant를 직접 조작하지 않아도 계정이 만들어진다.

이후:

- Finder sidebar의 username이 `jappleseed`
- Automatic login 완료
- System Settings의 Remote Login이 enabled

즉 **boot 한 번으로 자동화된 macOS guest가 ready 상태**가 된다.

---

# ⚠️ Provisioning은 First Setup에만 적용

중요한 제한:

> Guest에 이미 user가 생성되어 setup이 끝났다면 이후 boot에서 전달한 provisioning option은 무시된다.

따라서 이 API는 기존 계정을 재구성하는 API가 아니다.

적합한 목적:

- Fresh VM image
- Test environment bootstrap
- CI / automation VM creation
- Reproducible guest setup

---

# 🔐 Password 보안

Apple은 password 처리의 보안 implications를 명시적으로 강조한다.

피해야 할 방식:

```text
Source Code에 Password hardcode
```

검토할 수 있는 대안:

- Keychain
- Configuration file
- Environment variable

자동화 편의성 때문에 credential handling을 약하게 만들지 않아야 한다.

---

# 🔌 Accessory Access

일부 VM workload는 host Mac에 연결된 물리 USB accessory를 guest에서 직접 사용해야 한다.

예:

```text
USB Drive
   ↓
Host Mac
   ↓
Virtual Machine
```

하지만 host app이 사용자의 허락 없이 USB device를 가져가서는 안 된다.

Accessory Access는 **사용자가 accessory ownership을 명확히 통제하는 방식으로 USB passthrough를 제공**한다.

---

# 👤 Accessory Access의 핵심 원칙

사용자가 직접 결정한다.

- 어떤 USB device를 앱에 붙일지
- 언제 detach할지
- 어떤 앱이 현재 device를 사용 중인지

Device hot plugging도 지원한다.

VM의 static configuration을 바꾸지 않고 runtime에 accessory를 attach할 수 있다.

---

# 💾 USB Drive Demo

세션 흐름:

```text
USB Drive를 Host Mac에 연결
        ↓
Host Desktop에 Drive 표시
        ↓
Accessory menu extra 등장
        ↓
사용자가 VM app에 Drive attach
        ↓
Host가 Drive unmount
        ↓
Guest가 Drive mount
        ↓
Guest에서 사용
```

Guest에서 drive를 eject한 뒤 Accessory Access menu를 통해 host로 돌려보낸다.

```text
Release from VM app
        ↓
Host가 다시 Drive mount
```

물리 accessory가 host와 guest 사이에서 사용자의 명시적인 선택에 따라 이동한다.

---

# 🔎 USB Matching Criteria

App은 자신이 관심 있는 USB device 유형을 등록한다.

Filtering 기준 예:

- Device class
- Device subclass
- Vendor ID
- Product ID
- 기타 matching criteria

모든 USB accessory에 관심이 있으면 빈 criteria array를 사용할 수 있다.

```swift
import AccessoryAccess

let criteria: [AAUSBAccessoryMatchingCriteria] = []

let accessories = try await
    AAUSBAccessoryManager.shared.registerListener(
        self,
        matchingCriteria: criteria
    )
```

`registerListener`는 이전에 이미 앱에 attach돼 있던 accessory도 반환한다.

---

# 🎧 `AAUSBAccessoryListener`

Listener는 다음 protocol을 구현한다.

```swift
AAUSBAccessoryListener
```

새 device가 앱에 attach되면 다음 callback이 호출된다.

```swift
usbAccessoryDidConnect(_:)
```

이 지점에서 VM에 passthrough device를 붙일 수 있다.

---

# 🧵 VM Queue에서 Device 변경

`VZVirtualMachine` modification은 VM 자체 queue에서 수행해야 한다.

세션 code:

```swift
class AccessoryListener: NSObject,
                         AAUSBAccessoryListener {

    func usbAccessoryDidConnect(
        _ usbAccessory: AAUSBAccessory
    ) {
        virtualMachine.queue.async {
            do {
                let configuration =
                    VZUSBPassthroughDeviceConfiguration(
                        device: usbAccessory
                    )

                let device = try
                    VZUSBPassthroughDevice(
                        configuration: configuration
                    )

                self.virtualMachine
                    .usbControllers.first?
                    .attach(device: device) { error in
                        // Handle error
                    }
            } catch {
                // Handle error
            }
        }
    }
}
```

---

# 🧷 Claim USB Accessory Capability

Accessory Access를 사용하려면 Xcode target에 다음 capability를 추가해야 한다.

```text
Claim USB Accessory
```

또한 사용자는 언제든지 accessory를 attach/detach할 수 있으므로 앱은 이 lifecycle을 정상적으로 처리해야 한다.

---

# 🌐 Advanced Networking with `vmnet`

Virtualization framework 자체도 기본 network mode를 제공한다.

예:

- Isolated network
- NAT
- Bridge networking

하지만 복잡한 테스트에서는 더 세밀한 topology가 필요하다.

예:

```text
Client VM A ─┐
             ├─ Custom Network ─ Server VM
Client VM B ─┘

Host Port
   ↓ forwarding
Specific VM Port
```

이때 `vmnet` framework를 사용한다.

---

# 🗺️ `vmnet`으로 할 수 있는 것

세션에서 언급한 기능:

- 여러 macOS/Linux VM 사이 통신 구조 제어
- Custom network topology
- DHCP configuration
- TCP host port forwarding
- UDP host port forwarding

즉 단순히 VM에 network interface 하나를 붙이는 것이 아니라 **가상 network 자체를 app이 구성**한다.

---

# 🔧 `vmnet` 구성 흐름

```text
vmnet network configuration
        ↓
vmnet network object
        ↓
VZVmnetNetworkDeviceAttachment
        ↓
VZVirtioNetworkDeviceConfiguration
        ↓
VZVirtualMachineConfiguration.networkDevices
        ↓
VZVirtualMachine
```

두 VM을 같은 virtual network에 넣고 싶다면 **같은 `vmnet` network object를 사용**한다.

---

# 🧪 `vmnet` 코드

```swift
import Virtualization
import vmnet

var status: vmnet_return_t = .VMNET_FAILURE

guard let networkConfiguration =
    vmnet_network_configuration_create(
        .VMNET_SHARED_MODE,
        &status
    ) else {
    // Handle error
    fatalError()
}

guard let network =
    vmnet_network_create(
        networkConfiguration,
        &status
    ) else {
    fatalError()
}

let attachment =
    VZVmnetNetworkDeviceAttachment(
        network: network
    )

let networkDeviceConfiguration =
    VZVirtioNetworkDeviceConfiguration()

networkDeviceConfiguration.attachment = attachment

virtualMachineConfiguration.networkDevices = [
    networkDeviceConfiguration
]

let virtualMachine =
    VZVirtualMachine(
        configuration: virtualMachineConfiguration
    )
```

`networkConfiguration`을 만든 뒤 DHCP, port forwarding 등의 parameter를 추가할 수 있다.

---

# ♻️ `vmnet` Network Lifetime

`vmnet` network object는 reference-counted Objective-C object다.

마지막 reference가 release되면 network도 사라진다.

중요한 결과:

> 앱이 종료돼도 network object 자체가 persistence되는 것은 아니다.

따라서 재현 가능한 network configuration이 필요하다면 앱이 설정을 직접 저장하고 다음 실행에서 다시 구성해야 한다.

---

# 🔀 XPC Process 사이 Network 공유

여러 VM을 서로 다른 process에서 실행하면서 같은 network에 연결하고 싶을 수 있다.

이때 사용하는 API:

```text
vmnet_network_copy_serialization
vmnet_network_create_with_serialization
```

Network를 serialize해 XPC connection을 통해 다른 process에 전달할 수 있다.

이 기능은 multi-process virtualization architecture에 유용하다.

---

# 💽 Raw Disk Image의 한계

Virtualization framework는 standard raw disk image를 VM storage backing으로 사용할 수 있다.

Raw image의 장점:

- 단순한 format
- Disk block과 file block의 1:1 mapping
- 기존 software와 높은 호환성

하지만 단점도 크다.

예:

```text
100 GB Virtual Disk
      ↓
100 GB Raw File
```

Raw format 자체는 sparsity를 표현하지 못한다.

또 snapshot을 만들 때 전체 disk copy가 필요해 비용이 크다.

---

# 🆕 DiskImageKit

DiskImageKit은 macOS 27의 새 framework다.

목표:

- High-performance disk image management
- Space-efficient storage
- Layering
- Efficient snapshot
- Shared base image reuse

DiskImageKit은 macOS 26에서 도입된 **ASIF — Apple Sparse Image Format**을 지원한다.

Raw disk image도 base로 사용할 수 있다.

---

# 🧱 Layered Disk Image

DiskImageKit은 여러 image를 stack으로 구성한다.

```text
Top
┌────────────────┐
│ Overlay Layer  │
├────────────────┤
│ Cache Layer    │
├────────────────┤
│ Base Layer     │
└────────────────┘
Bottom
```

각 layer의 역할이 다르다.

---

# 🗄️ Base Layer

Stack의 가장 아래 layer다.

DiskImageKit이 지원하는 어떤 format도 base가 될 수 있다.

예:

- Raw disk image
- ASIF

Base를 read-only로 두면 여러 VM stack이 같은 content를 공유할 수 있다.

---

# ⚡ Cache Layer

Underlying layer가 느린 storage에 있을 때 read performance를 높인다.

예:

- Remote network filesystem

Read miss 흐름:

```text
Read Request
    ↓
Cache에 block 없음
    ↓
아래 layer에서 읽음
    ↓
Cache layer에 copy 저장
    ↓
Caller에 반환
```

다음번 같은 block read는 cache layer에서 해결한다.

---

# ✍️ Overlay Layer

Overlay는 copy-on-write semantics를 제공한다.

Write가 발생하면 base를 수정하지 않고 overlay에 저장한다.

```text
Base Image (Read Only)
        ↓
Overlay A → VM A writes
Overlay B → VM B writes
```

Shared base를 유지하면서 각 VM의 변경을 독립적으로 저장할 수 있다.

Snapshot 구현에 매우 유용하다.

---

# ♻️ Read-only Layer 공유

DiskImageKit은 read-only layer를 여러 concurrent stack에서 공유할 수 있다.

예:

```text
               ┌─ VM 1 Overlay
Shared Base ───┼─ VM 2 Overlay
               └─ VM 3 Overlay
```

공통 OS image나 development environment를 여러 VM에서 재사용하면서 각 VM의 write는 분리한다.

---

# 🕳️ ASIF의 Sparsity

ASIF image는 sparse하다.

논리적으로는 큰 block range를 표현할 수 있지만 실제 file에는 사용된 block만 저장한다.

저장되지 않은 block을 읽으면 zero-filled block처럼 취급한다.

```text
Logical Disk: 100 GB
Actual Changed Data: 3 GB
        ↓
ASIF file은 필요한 block 중심으로 저장
```

---

# 🧮 DiskImageKit Read Example

예제 stack:

```text
Overlay:
- block 4 updated
- block 5 exists

Cache:
- empty

Base:
- block 0
- block 1
- block 4
```

Block 0 read:

```text
Overlay miss
   ↓
Cache miss
   ↓
Base hit
   ↓
Cache에 block 0 저장
   ↓
Caller 반환
```

다음 block 0 read는 cache에서 바로 처리된다.

---

# ✍️ DiskImageKit Write Example

Block 2 write:

```text
Write block 2
      ↓
Top writable Overlay 발견
      ↓
Overlay에 block 2 저장
```

Base는 변경되지 않는다.

---

# 🔧 Virtualization과 DiskImageKit 연결

먼저 `DiskImage` object를 만든다.

Layered image라면 여러 image를 순서대로 append한다.

```swift
import DiskImageKit
import Virtualization

let baseImage = try DiskImage(
    opening: .open(
        url: baseLayerURL,
        mode: .readOnly
    )
)

let cacheImage = try baseImage.appending(
    .asifLayer(
        url: cacheLayerURL,
        type: .cache
    )
)

let overlayImage = try DiskImage(
    opening: .open(
        url: overlayLayerURL
    )
)

let stackedImage = try cacheImage.appending(
    overlayImage
)

let storageDeviceAttachment = try
    VZDiskImageStorageDeviceAttachment(
        diskImage: stackedImage
    )

let storageDeviceConfiguration =
    VZVirtioBlockDeviceConfiguration(
        attachment: storageDeviceAttachment
    )

virtualMachineConfiguration.storageDevices = [
    storageDeviceConfiguration
]
```

---

# 📉 Stack Depth와 성능

DiskImageKit stack은 무한히 깊게 쌓는 것이 좋은 것이 아니다.

Apple의 권장:

> **Shallow stacks perform better.**

Layer depth가 깊어질수록 block을 찾기 위해 더 많은 layer를 검사할 수 있다.

Snapshot chain을 계속 누적하는 구조라면 depth 관리 전략이 필요하다.

---

# 🧳 VM Clone에서 Disk Image만 복제하면 안 된다

VM은 disk image만으로 구성되지 않는다.

Virtual Mac의 예:

- Auxiliary storage file

EFI boot loader를 쓰는 VM:

- EFI variable store file

Shared base image를 이용해 VM을 clone할 때 이런 부가 파일도 각각 duplicate해야 한다.

---

# ⚙️ Custom Virtio

Virtualization framework는 이미 여러 standard virtual device class를 제공한다.

하지만 일부 workload에는 custom host↔guest protocol이 필요하다.

세션 예:

- Performance-critical custom communication
- Virtio crypto coprocessor
- Guest의 ML accelerator access

macOS 27에서는 custom Virtio device API로 이를 구현할 수 있다.

---

# 🚄 Virtio란?

Virtio는 paravirtualized device를 위한 industry standard protocol이다.

Virtualization framework의 여러 built-in device도 Virtio를 사용한다.

특징:

- Guest와 host가 memory buffer 공유
- Buffer는 Virtio queue로 구성
- Context switch 최소화
- Low latency
- High throughput

---

# 🔄 Virtio Queue 동작

```text
Guest Driver
    ↓ enqueue
Virtio Queue
    ↓ notification
Host Device
```

반대 방향:

```text
Host Device
    ↓ enqueue
Virtio Queue
    ↓ interrupt
Guest Driver
```

Shared memory queue 중심의 protocol이라 performance-critical communication에 적합하다.

---

# 🧩 `VZCustomVirtioDeviceConfiguration`

Custom device를 구성할 때 지정하는 항목:

- Virtio device identity
- PCI class
- PCI subclass
- Virtio queue count
- Delegate provider

세션 예제는 entropy / crypto 관련 device identity를 사용한다.

```swift
let deviceConfiguration =
    VZCustomVirtioDeviceConfiguration()

deviceConfiguration.deviceID = 4
deviceConfiguration.pciClassID = 0x10
deviceConfiguration.pciSubclassID = 0x00
deviceConfiguration.virtioQueueCount = 1

deviceConfiguration.provider =
    VZCustomVirtioDeviceDelegateProvider(
        deviceQueue: deviceQueue,
        delegate: provider
    )

virtualMachineConfiguration.customVirtioDevices = [
    deviceConfiguration
]
```

---

# 🏗️ Device 생성 시 Delegate 연결

VM이 start되면 실제 `VZCustomVirtioDevice`가 생성된다.

Configuration delegate의 callback:

```swift
class DeviceConfigurationDelegate:
    NSObject,
    VZCustomVirtioDeviceConfigurationDelegate {

    func customVirtioConfiguration(
        _ deviceConfiguration:
            VZCustomVirtioDeviceConfiguration,
        didCreateDevice device:
            VZCustomVirtioDevice
    ) {
        device.delegate = deviceDelegate
        self.device = device
    }
}
```

이때 actual device에 delegate를 연결하고 필요하면 reference를 보관한다.

Device reference를 가지고 있으면 guest interrupt를 trigger할 수 있다.

---

# 📬 Virtio Queue 처리

핵심 callback:

```swift
customVirtioDevice(
    _:didReceiveNotificationFor:
)
```

세션 code:

```swift
class DeviceDelegate:
    NSObject,
    VZCustomVirtioDeviceDelegate {

    func customVirtioDevice(
        _ device: VZCustomVirtioDevice,
        didReceiveNotificationFor queue:
            VZVirtioQueue
    ) {
        while let element = queue.nextElement() {
            // Process element...
            element.returnToQueue()
        }
    }
}
```

흐름:

```text
Guest가 queue에 element enqueue
        ↓
Host delegate callback
        ↓
queue.nextElement()
        ↓
Process
        ↓
returnToQueue()
```

---

# 🧑‍💻 Guest Driver가 반드시 필요

Custom Virtio device는 host side API만 구현한다고 동작하지 않는다.

Linux guest가 device를 사용하려면 **해당 Virtio protocol을 이해하는 custom guest driver**가 필요하다.

Apple은 queue를 효율적으로 사용하도록 Virtio best practice를 따를 것을 권장한다.

---

# 🚀 Custom Virtio가 적합한 경우

- Host/guest 간 low-latency data path
- High-throughput stream
- 일반 socket / file channel보다 device semantics가 적합한 경우
- Custom crypto service
- Hardware accelerator abstraction
- ML accelerator exposure
- Specialized coprocessor

일반적인 앱 메시징 용도라면 반드시 custom Virtio가 필요한 것은 아니다.

---

# ☁️ 기타 Virtualization 개선

세션 마지막에는 다른 Virtualization 발전도 간단히 언급한다.

## iCloud support

Desktop experience에서 VM 내부에서도 사용자의 iCloud data와 service를 활용할 수 있다.

## EFI Secure Boot

Linux VM을 modern secure boot feature로 강화한다.

## Metal Improvements for macOS Guests

macOS guest가 다음 Metal feature를 사용할 수 있다.

- Argument buffers
- Indirect command buffers

이러한 기능은 Virtual Mac의 graphics capability와 desktop experience를 강화한다.

---

# 🧩 기능별 API 정리

| 영역 | 핵심 API / Framework | 역할 |
|---|---|---|
| Guest provisioning | `VZMacGuestProvisioningOptions` | 초기 macOS account와 login 설정 |
| VM start | `VZMacOSVirtualMachineStartOptions` | Provisioning option을 start에 전달 |
| USB discovery | `AccessoryAccess` | 사용자가 승인한 USB accessory 관리 |
| USB manager | `AAUSBAccessoryManager` | Listener 등록과 accessory 상태 획득 |
| USB callback | `AAUSBAccessoryListener` | Attach event 수신 |
| USB passthrough | `VZUSBPassthroughDeviceConfiguration` | Accessory를 VM device로 변환 |
| Custom network | `vmnet` | Virtual network topology 구성 |
| VM network attach | `VZVmnetNetworkDeviceAttachment` | vmnet network를 Virtualization에 연결 |
| Disk images | `DiskImageKit` | Layered sparse disk image 관리 |
| VM disk attach | `VZDiskImageStorageDeviceAttachment` | DiskImageKit image를 VM storage로 연결 |
| Custom device | `VZCustomVirtioDeviceConfiguration` | Custom Virtio device 정적 구성 |
| Runtime device | `VZCustomVirtioDevice` | Host-side custom device instance |
| Virtio queue | `VZVirtioQueue` | Guest↔host shared queue communication |

---

# 🔁 전체 고급 Virtualization Workflow

```text
Fresh macOS VM
      ↓
Guest Provisioning
- account
- auto login
- SSH
      ↓
Accessory Access
- USB passthrough
      ↓
vmnet
- multi-VM topology
- DHCP
- port forwarding
      ↓
DiskImageKit
- shared base
- cache
- overlay
      ↓
Custom Virtio
- Linux guest custom high-performance device
```

각 기능은 독립적으로 사용할 수 있지만 함께 조합하면 자동화된 테스트 lab이나 개발 환경을 만들 수 있다.

---

# 📋 체크리스트

## macOS Guest Provisioning

- [ ] Fresh macOS guest인지 확인
- [ ] First boot 이전에 provisioning option 준비
- [ ] Full name 지정
- [ ] Username 지정
- [ ] Password 지정
- [ ] Auto-login 필요 여부 결정
- [ ] SSH Remote Login 필요 여부 결정
- [ ] `VZMacGuestProvisioningOptions` 생성
- [ ] `VZMacOSVirtualMachineStartOptions`에 연결
- [ ] Guest setup 완료 후 subsequent boot에는 option이 무시됨을 고려
- [ ] Password를 source code에 hardcode하지 않기
- [ ] Keychain / config / environment variable 활용 검토

## Accessory Access

- [ ] Guest에서 실제 USB passthrough가 필요한지 확인
- [ ] 관심 device의 class/subclass 정의
- [ ] Vendor ID / Product ID filter 검토
- [ ] 모든 USB가 필요하면 빈 criteria array 사용
- [ ] `AAUSBAccessoryManager` listener 등록
- [ ] Previously attached accessory 처리
- [ ] `usbAccessoryDidConnect` 구현
- [ ] VM queue에서 device modification 수행
- [ ] `VZUSBPassthroughDeviceConfiguration` 사용
- [ ] USB controller에 runtime attach
- [ ] Detach / release event 처리
- [ ] Xcode의 Claim USB Accessory capability 추가
- [ ] 사용자가 언제든 ownership을 바꿀 수 있다는 점 고려

## vmnet

- [ ] Basic NAT/bridge로 충분한지 먼저 검토
- [ ] Custom topology가 필요할 때 vmnet 도입
- [ ] Network mode 설정
- [ ] DHCP 설정 필요 여부 확인
- [ ] TCP port forwarding rule 정의
- [ ] UDP port forwarding rule 정의
- [ ] 같은 network의 VM은 동일 network object 사용
- [ ] App 종료 시 network object가 사라짐을 고려
- [ ] Network 설정 persistence 구현
- [ ] Multi-process VM이면 serialization API 검토
- [ ] XPC transport 구조 테스트

## DiskImageKit

- [ ] Raw disk image의 size/snapshot 비용 측정
- [ ] ASIF 활용 검토
- [ ] Base layer를 read-only로 사용할지 결정
- [ ] Slow backing storage에는 cache layer 검토
- [ ] Snapshot / clone에는 overlay layer 검토
- [ ] Shared base를 여러 VM에서 재사용
- [ ] Overlay별 independent writes 확인
- [ ] Sparse behavior 확인
- [ ] `VZDiskImageStorageDeviceAttachment` 연결
- [ ] Stack depth를 얕게 유지
- [ ] Clone 시 auxiliary storage도 duplicate
- [ ] EFI VM이면 EFI variable store도 duplicate

## Custom Virtio

- [ ] Built-in device class로 해결 가능한지 먼저 검토
- [ ] Custom high-performance protocol 필요 여부 확인
- [ ] Virtio device ID 정의
- [ ] PCI class / subclass 정의
- [ ] Queue count 결정
- [ ] Delegate provider 설정
- [ ] VM configuration의 `customVirtioDevices`에 추가
- [ ] Runtime device creation callback 처리
- [ ] `VZCustomVirtioDeviceDelegate` 설정
- [ ] Queue element dequeue / process / return 구현
- [ ] Guest interrupt 필요 여부 구현
- [ ] Linux guest custom driver 개발
- [ ] Virtio queue best practice 준수
- [ ] Throughput / latency 측정

## Security와 Lifecycle

- [ ] VM credentials 안전하게 저장
- [ ] USB device ownership 변화 처리
- [ ] VM stop 중 accessory detach 처리
- [ ] Network configuration 재생성 가능하도록 보존
- [ ] Shared base image의 read-only 보장
- [ ] Custom Virtio input validation
- [ ] Guest driver와 host protocol version 관리

---

# ⚠️ 구현 시 주의할 점

## Guest Provisioning은 일반 Account Management API가 아니다

첫 setup 전 guest를 자동화하기 위한 기능이다.

이미 setup된 VM에 같은 option을 다시 전달해도 기존 account가 변경되지 않는다.

## USB Passthrough의 최종 Control은 사용자에게 있다

Accessory Access는 host app이 device를 독점하는 API가 아니다.

사용자가 attach와 detach를 직접 선택할 수 있고 앱은 그 결정을 따라야 한다.

## `vmnet` Network는 App 종료 후 자동 복원되지 않는다

Network object가 reference-counted이기 때문에 마지막 reference가 없어지면 network도 사라진다.

Reproducible topology를 원하면 configuration을 앱이 직접 persist해야 한다.

## DiskImage Stack을 너무 깊게 만들지 않는다

Copy-on-write layer를 계속 누적하면 read path의 비용이 증가할 수 있다.

Shallow stack을 유지하는 snapshot management 전략이 필요하다.

## Shared Base만으로 VM Clone이 완성되지 않는다

Virtual Mac auxiliary storage와 EFI variable store 같은 VM ancillary file도 고려해야 한다.

## Custom Virtio는 Guest Driver까지 하나의 기능이다

Host-side `VZCustomVirtioDevice`만 구현해서는 guest가 device를 사용할 수 없다.

Linux guest 쪽 driver와 protocol 설계가 함께 필요하다.

---

# 🎯 Use Case별 조합

## Automated macOS Test VM

```text
macOS Install Image
      ↓
Fresh VM
      ↓
Provisioning
- Test account
- Auto Login
- SSH
      ↓
Automated Tests
```

## Hardware Integration Test

```text
Physical USB Device
      ↓
Accessory Access
      ↓
Linux / macOS VM
      ↓
Guest-side validation
```

## Multi-VM Network Lab

```text
Client VM 1 ─┐
Client VM 2 ──┼─ vmnet ─ Server VM
Client VM 3 ─┘
             ↑
       Host Port Forwarding
```

## Efficient VM Farm

```text
Shared Read-only Base ASIF
        ↓
 ┌──────┼──────┐
 ↓      ↓      ↓
VM A   VM B   VM C
Overlay Overlay Overlay
```

## Specialized Linux Accelerator

```text
Host Service / Accelerator
        ↓
Custom Virtio Device
        ↓
Virtio Queue
        ↓
Linux Guest Driver
```

---

# 핵심 메시지

이번 Virtualization 업데이트는 VM을 단순히 boot하는 API를 넘어 **VM lifecycle 전체를 앱이 정교하게 설계할 수 있게 하는 방향**으로 확장된다.

`VZMacGuestProvisioningOptions`는 fresh Virtual Mac을 first boot 시점부터 자동화된 개발·테스트 환경으로 만들 수 있게 한다.

Accessory Access는 USB passthrough를 지원하면서도 device ownership의 최종 결정권을 사용자에게 남긴다.

`vmnet`은 기본 NAT와 bridge보다 복잡한 multi-VM topology, DHCP, host port forwarding을 구성하게 한다.

DiskImageKit은 raw image의 비효율을 해결하고 ASIF, cache layer, overlay layer를 통해 sparse storage, copy-on-write snapshot, shared base image reuse를 제공한다.

그리고 custom Virtio API는 Linux guest와 host 사이에 low-latency, high-throughput custom device channel을 만들 수 있게 한다.

결국 이번 세션의 방향은 다음과 같다.

```text
Provisioning
     +
Physical Device Access
     +
Custom Networking
     +
Efficient Storage
     +
High-performance Custom Devices
```

이 기능들을 조합하면 Virtualization framework를 desktop VM 앱뿐 아니라 **CI automation, multi-machine integration testing, virtual network lab, shared VM farm, specialized host/guest compute environment**의 기반으로 사용할 수 있다.

---

# 함께 보면 좋은 세션과 자료

- Discover container machines — WWDC26
- DiskImageKit
- Accessory Access
- vmnet
- Virtualization framework
- Virtual I/O Device (VIRTIO) Version 1.4
