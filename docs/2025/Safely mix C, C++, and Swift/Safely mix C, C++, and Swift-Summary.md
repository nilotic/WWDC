# Safely mix C, C++, and Swift

Safely mix C, C++, and Swift https://developer.apple.com/videos/play/wwdc2025/311/



## ✨ 개요


Swift 6.2 에서 도입된 Strict Memory Safety와 C / C++ 코드에 주석 (annotation) 을 추가해 Swift 와 안전하게 상호 운용하는 방법을 다루는 세션

핵심 목표 Swift 의 기본 안전성 보장이 C/C++ 혼용으로 깨지지 않도록 방지 포인터 기반 C/C++ API 를 Swift Span 기반의 안전한 API 처럼 사용 C/C++ 코드 자체도 부분적으로 더 안전하게 만드는 도구 제공

🔐 왜 문제가 되는가 : Swift + C/C++ 혼용 Swift 는 safe-by-default 하지만 C/C++ 는 raw pointer 사용 bounds 정보 없음 lifetime 정보 없음

결과 buffer overflow use-after-free 같은 치명적 보안 / 안정성 버그 위험 Swift 에서 C 포인터는 의도적으로 UnsafePointer, UnsafeMutablePointer로 import 됨

🚨 Strict Memory Safety (Swift 6.2) 새로운 컴파일러 모드 활성화 시 Swift 코드 내 모든 unsafe construct에 경고 발생 특히 C/C++ interop 에서의 위험 호출을 집중적으로 노출

기본값은 OFF → 보안 민감 앱은 적극 opt-in 권장 Xcode 설정 Build Settings → Strict Memory Safety = Yes 🧠 핵심 아이디어 : “ 부족한 정보 ” 를 C/C++ 에 명시하라

Swift 가 포인터를 안전하게 다루지 못하는 이유는 C/C++ 함수가 암묵적으로 가정하는 정보를 컴파일러가 모르기 때문입니다 .

필요한 정보 2 가지

- Bounds: 포인터가 가리키는 메모리 크기

- Lifetime: 포인터가 언제까지 유효한지 → 이 정보를 annotation 으로 명시하면 Swift 가 raw pointer 를 Swift Span으로 취급 가능



## 📦 Swift Span 요약


Span<T> / MutableSpan<T> 특징 bounds 자동 추적 lifetime 보장 non-escapable ( 함수 밖으로 탈출 불가 ) 결과 out-of-bounds use-after-free

원천 차단 🏷 C/C++ 함수 주석 (annotation) 핵심 정리 1️⃣ counted_by — bounds 정보 제공 포인터가 가리키는 요소 수를 명시 void invertImage(

uint8_t *imageData __attribute__((counted_by(imageSize))), size_t imageSize ); 효과 Swift 에서 (UnsafePointer, size) 대신

Span 하나로 호출 가능 2️⃣ noescape — lifetime 정보 ( 파라미터 ) 함수가 포인터 /Span 을 저장하지 않음을 보장 void applyGrayscale(ImageView imageView __attribute__((noescape)));

효과 C++ Span → Swift Span 으로 안전하게 import dangling pointer 방지 3️⃣ lifetimebound — 반환값 lifetime 연결 반환 포인터의 lifetime 이 특정 파라미터에 종속됨을 명시

Span scanImageRow( ImageView imageView __attribute__((lifetimebound)) ); 효과 반환값도 Swift Span 으로 import 가능

반환 후 use-after-free 차단 🧱 C++ 타입을 Swift 에서 안전하게 쓰기 🔹 View 타입 ( 메모리 소유 안 함 ) 조건 내부에 pointer/reference 포함

메모리 소유 ❌ 주석 SWIFT_NONESCAPABLE 결과 Swift 에서 non-escapable 타입으로 import lifetime 안전성 확보 🔹 Reference-counted 타입 ( 메모리 소유 )

조건 내부 메모리 소유 retain/release 개념 존재 주석 SWIFT_SHARED_REFERENCE retain / release 함수 지정 추가 반환 규칙 SWIFT_RETURNS_RETAINED

SWIFT_RETURNS_UNRETAINED 결과 Swift ARC 가 자동으로 lifetime 관리 🛡 C/C++ 코드 자체를 더 안전하게 만드는 도구 🔧 C++ Standard Library Hardening

기능 vector, span 등 표준 타입에 bounds check 추가 Xcode 옵션

- Enforce Bounds-Safe Buffer Usage in C++ = Yes 🔧 Unsafe Buffer Usage 에러 raw pointer 사용 시 컴파일 에러 발생 의도 raw pointer → C++ Span / container 로 교체 유도 🔧 C Bounds Safety Extension ( 신규 ) C 언어용 bounds safety 확장 counted_by 같은 annotation 을 기반으로 런타임 bounds check 자동 삽입 C 에도 “ 부분적 메모리 안전성 ” 제공

- 🧠 핵심 정리 Swift 6.2 의 방향성 “C/C++ 를 없애라 ” ❌ “가정을 명시하라” ⭕ 실천 가이드

- Strict Memory Safety 활성화

- C/C++ API 에 bounds + lifetime annotation 추가

- Swift 에서 Span 기반 호출로 unsafe 제거

- C/C++ 자체도 bounds-safe 옵션 활성화 결과 성능 유지 보안 강화 unsafe boilerplate 제거 Swift ↔ C/C++ interop 의 질적 전환
