# Optimize your custom environments for visionOS

Optimize your custom environments for visionOS https://developer.apple.com/videos/play/wwdc2025/305/



## ✨ 개요


visionOS 에서 몰입형 (Immersive) 환경을 고품질로 구현하면서도 실시간 성능을 유지하는 최적화 전략을 다루는 세션 목표는 “ 실사급 (pre-rendered) 비주얼 ” 을 실시간 렌더링이 가능한 자산으로 변환하는 것

- 핵심 키워드 : Immersive Boundary, 절차적 최적화 , Baking, USD 구조화 🎥 전체 최적화 워크플로우 개요

- 프리렌더 (pre-rendered) 환경 제작

- 실제 사용자가 보고 경험하는 범위 기준으로 지오메트리 · 텍스처 최적화

- 프리렌더 이미지를 최적화된 환경에 베이킹

- Reality Composer / Unity 등 실시간 엔진으로 조립 ➡ “ 보이지 않는 것은 계산하지 않는다 ” 가 핵심 철학 🧭 Immersive Boundary 의 역할 사용자가 실제로 이동 · 회전할 수 있는 물리적 공간의 경계 완전 몰입 (full immersion) 에서는 모든 픽셀을 렌더링해야 하므로 성능 부담이 큼 Immersive Boundary 를 기준으로

- 가까운 영역: 고해상도 · 고밀도

- 먼 영역: 공격적 단순화 그래픽 예산을 가장 중요한 영역에 집중 가능 🧱 Geometry 최적화 전략

- Adaptive Polygon Reduction 단일 오브젝트 LOD 가 아닌 시점 기반 삼각형 단위 최적화 여러 시점에서의 실루엣 중요도를 계산 결과 디테일은 자연스럽게 유지 갑작스러운 low-poly 전환 방지

- Billboard (Vista Billboard) Immersive Boundary 기준 1~3km 이상 원거리는 깊이 인식이 거의 없음 3D 지오메트리를 실루엣을 유지한 평면 메시로 변환 투명 머티리얼 없이 실제 지오메트리 실루엣 사용 수백만 폴리곤 → 수천 폴리곤 수준으로 감소

- Occlusion & Backface Culling ( 사전 제거 ) 런타임이 아닌 지오메트리 단계에서 직접 제거

- Backface Culling: 항상 Boundary 반대 방향을 향하는 면 제거

- Occlusion Culling: 모든 샘플 시점에서 보이지 않는 삼각형 제거 최종 결과 약 100M → 180K triangles



## 🧩 절차적 (Houdini) 워크플로우의 의미


Houdini + HDA(Houdini Digital Asset) 노드 기반 파라미터 조절로 품질 ↔ 성능 트레이드오프 조절 장점 반복 작업 자동화 환경마다 다른 요구사항에 유연 대응

“ 한 번 만들고 끝 ” 이 아닌 조절 가능한 파이프라인 🧵 UV & Texture 최적화 Boundary 내부 ( 근거리 ) 면적 기반 UV 일정한 texel density 유지 → 근접 시 품질 보장

Boundary 외부 ( 원거리 ) 스크린 스페이스 기반 UV 구면 (spherical) 투영 활용 사람이 실제로 보는 크기에 맞춰 texel 밀도 자동 스케일 문제와 해결 단일 투영 → UV 겹침 , texel 왜곡 , 정보 손실

해결 방식

- Mesh Partition: 메시를 최소 단위로 분할

- Multi-Projection: 각 파티션을 가장 잘 보이는 시점에서 UV 투영 최종 UV atlas 로 패킹 결과 전체 환경을 단 2 장의 텍스처로 표현 가능 수십 GB → 수백 MB 수준으로 압축 🎨 Baking 전략 프리렌더 결과를 최적화된 UV 에 베이킹 두 가지 접근 조합 시점 기반 구면 렌더 베이킹 고폴리 → 저폴리 표면 투영 베이킹 결과 조명 · 재질 정보가 포함된 Unlit 머티리얼 복잡한 셰이딩 비용 제거



## 📦 USD 구조 최적화 (Frustum Culling)


단일 거대 메시로 export 하면 화면 밖 지오메트리도 GPU 로 전송됨 해결 USD 계층 구조로 메시 분할 Bounding Box 기반 Frustum Culling 활성화 두 가지 분할 전략

- Boundary 내부 : Boundary Partition

- Boundary 외부 : Frustum Partition ( 타일 단위 ) 효과 화면에 보이지 않는 파티션은 GPU 에서 자동 제외 실제 한 프레임에 그려지는 삼각형 수 10 만 미만 📊 최종 성능 지표 (Moon 사례 ) Geometry 100M+ triangles → <200K 화면 내 <100K Texture 수십 GB → ~250MB Runtime Entity <200 Draw call <100 🧠 핵심 정리 visionOS 환경 최적화의 본질은 사람의 경험 기준 최적화

- Immersive Boundary 는 안전 장치이자 가장 강력한 그래픽 최적화 도구 절차적 파이프라인을 구축하면 품질과 성능을 연속적으로 조절 가능 고품질 비주얼 ≠ 고비용 의도적인 최적화 설계가 핵심
