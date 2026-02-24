# Say hello to the new look of app icons

Say hello to the new look of app icons https://developer.apple.com/videos/play/wwdc2025/220/



## ✨ 개요


iOS·iPadOS·macOS·watchOS 전반에 적용되는 ** 새로운 앱 아이콘 디자인 언어 (Liquid Glass)** 를 소개하는 세션 핵심 변화 visionOS 의 레이어드 아이콘에서 영감

실제 유리 (glass) 물성 연구 기반의 새로운 머티리얼 아이콘이 “ 그려진 그림 ” 이 아니라 빛을 반사하고 내부에서 발광하는 오브젝트처럼 동작



## 🧪 Liquid Glass: 새 아이콘 머티리얼의 본질


구성 요소 edge highlight( 가장자리 하이라이트 ) translucency( 투명도 ) frostiness( 서리 낀 질감 ) 효과 아이콘이 내부에서 빛나는 듯한 깊이감 자이로 입력 기반으로 홈 화면에서 빛이 움직임

Light / Dark Mode 모두에서 자연스럽게 동작 🎨 새로운 Appearance Modes 기본 glass 외에 반투명 모드 확장 Monochrome Glass (Light / Dark)

Tinted Glass

- Dark Tint: 전경에 컬러

- Light Tint: 유리에 컬러를 주입 Lock Screen 의 tint 와 조합 시 시각적 일관성 강화 모든 모드는 iPhone, iPad, Mac, Apple Watch에서 지원 App Store 상품 페이지에도 동일한 아이콘 반영 🧱 통합된 아이콘 디자인 시스템 🔹 플랫폼별 분리 디자인 → 통합 언어 과거 iOS / macOS / watchOS 별 아이콘 아트워크 차이 현재 단일 아이콘 언어로 rounded rectangle + circle 모두 대응

- 🔹 Rounded Rectangle Grid 업데이트 1024px 캔버스 유지 더 단순하고 균등한 그리드 더 둥근 corner radius UI, 하드웨어와의 시각적 정합성 향상 🔹 Circular Grid (watchOS 포함 ) 원형 아트워크용 프레임 명확화 breathing room 증가 → 광학적 밸런스 개선 watchOS 1088px 캔버스 rounded rectangle 을 overshoot → 플랫폼 간 전환 용이 🖥 macOS 아이콘 처리 방식 변화

- 새로운 규칙 캔버스 자체가 마스크 역할 아이콘 외곽으로 튀어나오는 요소 제거

- 기존 macOS 아이콘 rounded rectangle 계열 → 자동 마스킹 + 새 머티리얼 적용

- 특이한 실루엣 → drop shadow 제거 후 자동 스케일 권장

  - 자동 보정도 가능하지만 , 캔버스를 적극 활용해 재디자인이 최선



## 🧩 아이콘을 그릴 때의 핵심 원칙


1️⃣ Layering 이 핵심 최소 구조 background 1 + foreground 1 foreground 는 여러 레이어로 분리 가능 레이어를 쌓을수록 깊이 그림자 반사 효과가 자연스럽게 드러남

- 예 : Podcasts 스텐실 느낌 → 실제 레이어 스택으로 전환

- 2️⃣ 일러스트 스타일은 “ 단순하게 ” 사실적인 3D, 원근 강조 → 머티리얼과 충돌

- 권장 정면 뷰

- 플랫한 형태 디테일은 그림이 아니라 머티리얼이 만든다

- 3️⃣ Translucency & Blur 적극 활용 투명도 + 블러는

- Light / Dark Mode Transparent Mode

- 모두에서 자연스럽게 동작 배경이 glass 이기 때문에

- 월페이퍼가 은은하게 투과됨 4️⃣ “Less is more”

- 겹침 , 효과를 줄일수록 재질의 반사

- 엣지 하이라이트 가 더 잘 드러남

- Photos 아이콘 사례 레이어 수 감소

- 컬러는 유지하되 틴티드 글래스 느낌 강화 5️⃣ 소스 아트워크의 효과는 제거

- 기존 아이콘에 흔한 문제 drop shadow

- bevel baked-in lighting

- 새 시스템에서는 이런 효과를 머티리얼이 대신 제공

- Home 아이콘 사례 레이어 축소 + 형태 단순화 → glass 적용 후 완성도 상승

- ✏ 디테일 가이드 날카로운 엣지 , 얇은 선 ❌

- 둥근 모서리 ⭕ 빛이 가장자리를 따라 자연스럽게 흐름

- 머티리얼을 적용하는 요소는 굵은 선 사용 → 작은 사이즈에서도 디테일 유지

- 🌈 Background 설계 가이드 순수 white / black ❌

- 권장 System Light / System Dark gradient

- 이유 실제 광원 방향과 조화

- 대비 유지 + 머티리얼 효과 극대화 Dark Mode 시대

- 무채 배경보다 컬러 배경을 더 적극적으로 사용 권장 🧠 핵심 정리

- 이번 아이콘 변화는 단순한 스타일 변경 ❌

- 머티리얼 중심의 새로운 표현 체계 ⭕ 아이콘의 역할

- 단순 식별자 → 브랜드와 스토리의 시작점 실천 포인트

- 레이어를 의식적으로 설계 그림 효과는 줄이고 , 머티리얼에 맡기기

- 단순한 형태일수록 결과는 더 고급스러움 결과

- 모든 플랫폼에서 일관되고 살아 있는 듯한

  - “ 한 눈에 기억되는 ” 아이콘
