# WWDC26 Design immersive environments for visionOS apps and the spatial web 요약

- Session: 234
- Title: Design immersive environments for visionOS apps and the spatial web
- Source: https://developer.apple.com/videos/play/wwdc2026/234/
- Topic: visionOS, Immersive Environments, Spatial Web, 3D Design, Spatial Audio, Real-time Rendering
- Chapters: Introduction, Pre-production, Production, Post-production, Next steps

---

## 한 줄 요약

visionOS의 몰입형 환경은 단순한 360° 파노라마가 아니라 **깊이와 시차를 가진 3D 공간에 사실적인 텍스처, 움직임, 조명, Spatial Audio를 결합한 경험**이며, 좋은 결과를 얻으려면 pre-production에서 의도와 구도를 명확히 하고, production에서 고품질 소스와 측정 자료를 확보한 뒤, post-production에서 시각적 충실도와 실시간 렌더링 비용을 함께 관리해야 한다.

---

## 핵심 요약

이번 세션은 visionOS 앱, 웹사이트, SharePlay 경험에 사용할 photorealistic immersive environment를 만드는 전체 디자인 과정을 설명한다.

- **Pre-production**
  - 환경을 왜 만드는지 목적 정의
  - 사용자가 공간을 어떻게 사용할지 결정
  - 실제 장소라면 사전 답사
  - 주요 시점, 뒤쪽 시야, 제거할 요소까지 계획
  - 참고 사진·영상·측정 자료 수집
  - 배경 → 중경 → 전경의 layer 구조 설계
  - 움직임과 Spatial Audio가 필요한 요소 미리 식별

- **Production**
  - 고품질 primary photography 촬영
  - 360° stitched panorama 제작을 고려한 카메라 rig
  - 충분한 해상도와 dynamic range 확보
  - secondary photography, photogrammetry, LiDAR, Macbeth chart, chrome/gray sphere 촬영
  - motion reference와 현장 audio 기록

- **Post-production**
  - 파노라마 cleanup
  - Digital matte painting과 CG asset으로 구도 정리
  - panorama를 3D mesh texture로 이전
  - A/B 비교로 texture fidelity 유지
  - Spatial Audio, shader motion, lighting effect 추가
  - precomputed texture, UV flow map, vertex animation 등으로 실시간 비용 절감

Apple이 강조하는 가장 중요한 원칙은 **모든 선택에 의도가 있어야 한다는 것**이다.

---

# 🌄 visionOS의 Immersive Environment

visionOS의 system environment는 단순한 배경 이미지가 아니다.

평면 이미지나 일반적인 파노라마와 달리 다음 특성을 가진다.

- 실제 깊이
- 사용자의 위치 변화에 반응하는 parallax
- 공간 전체를 둘러볼 수 있는 구성
- motion
- Spatial Audio
- 실시간 lighting effect

이 차이가 실제 공간에 있는 듯한 몰입감을 만든다.

---

# 🧭 전체 제작 프로세스

세션은 immersive environment 제작을 세 단계로 구분한다.

| 단계 | 핵심 목적 |
|---|---|
| Pre-production | 환경의 목적과 구도, 촬영 계획 결정 |
| Production | 3D 제작에 필요한 고품질 source와 reference 확보 |
| Post-production | 파노라마를 정리하고 3D, sound, motion 결합 |

사례로 Mount Hood, Moon, Jupiter, Yosemite, Thorsmork, Bora Bora의 system environment를 사용한다.

---

# 🎯 Pre-production: 먼저 의도를 정의하기

새 environment를 시작할 때 먼저 다음을 질문한다.

- 왜 이 environment를 만드는가?
- 어떤 특징을 살리고 싶은가?
- 사용자는 이 공간을 어떻게 사용할 것인가?
- 가장 중요한 시야는 어디인가?
- 사용자가 뒤를 돌아보면 무엇이 보여야 하는가?
- 어떤 요소는 제거하거나 바꾸어야 하는가?

초기에 목적을 명확히 하면 production 단계의 큰 수정 비용을 줄일 수 있다.

---

# 🎬 사용 목적이 구도를 결정한다

대형 media 감상을 위한 environment라면 virtual screen과 cinematic composition이 중요하다.

반면 Keynote environment는 발표 연습이 목적이므로 다음처럼 설계한다.

- 불필요한 sound 제거
- 발표에 집중할 수 있는 환경
- stage 중심 lighting
- audience 앞에 서 있는 듯한 spatial composition

같은 immersive environment라도 목적에 따라 시각적·음향적 디자인이 달라진다.

---

# 🗺️ 실제 장소라면 사전 답사

Mount Hood처럼 실제 위치를 재현할 때는 location scouting이 중요하다.

확인할 내용은 다음과 같다.

- primary viewpoint
- 전면 시야
- 사용자가 뒤를 돌았을 때의 모습
- foreground obstruction
- 제거 대상
- vegetation density
- 촬영 장비 배치
- 시간대와 빛의 방향

visionOS에서 완전히 immersive한 상태의 사용자는 한 번에 약 **81°** 정도의 scene을 시야에 담는다.

따라서 정면뿐 아니라 전체 360° 공간을 설계해야 한다.

---

# ✂️ 무엇을 보여주지 않을지도 결정하기

현실의 모든 요소를 유지할 필요는 없다.

Mount Hood 환경에서는 도로와 지나치게 밀집된 vegetation을 교체하거나 제거했다.

Immersive environment는 현실을 그대로 복제하는 것이 아니라 사용 목적에 맞게 편집된 공간이다.

---

# 🌕 직접 갈 수 없는 장소의 Reference

Moon environment는 Apollo mission photography를 참고해 제작했다.

Reference material은 다음 역할을 한다.

- 기존 가정 확인
- 실제 자료와 설계의 불일치 수정
- texture, lighting, geometry 제작의 추측 감소

---

# ☀️ Yosemite Lighting Study

Yosemite 환경에서는 Digital Elevation Model과 Earth orbit를 이용해 lighting study를 만들고 촬영할 날짜와 시간을 결정했다.

즉 촬영 단계 전에 지형과 태양 조건을 이용해 최적의 빛을 계획했다.

---

# 🧱 Environment를 Layer로 생각하기

Environment를 다음처럼 layer로 나누어 생각한다.

```text
Background
    ↓
Mid-ground
    ↓
Foreground
```

이를 통해 다음을 판단할 수 있다.

- panorama texture로 처리할 부분
- 실제 3D geometry가 필요한 부분
- foreground detail이 필요한 위치
- parallax가 크게 보일 요소

Foreground는 depth와 parallax를 느끼게 하는 데 특히 중요하다.

---

# 🔊 Motion과 Spatial Audio 미리 계획하기

Pre-production에서 움직일 요소를 미리 식별한다.

예:

- 물
- 구름
- 나뭇잎
- 파도
- 바람
- 그림자

그리고 움직임과 연결되는 sound도 함께 계획한다.

```text
위치
+
움직임
+
Spatial Audio
```

이 관계를 미리 정의하면 shader와 audio 제작에서 불필요한 수정을 줄일 수 있다.

---

# 🪐 계획은 반복하며 바뀔 수 있다

Jupiter 환경에서는 태양이 moons를 어떻게 비추는지 이해하기 위해 solar system scale model을 만들었다.

그 과정에서 시간의 흐름을 표현하는 시스템이 필요하다는 사실을 발견했고, 이것이 final environment의 핵심 requirement가 되었다.

Pre-production은 처음 계획을 고정하는 단계가 아니라, reference와 실험으로 더 나은 방향을 발견하는 단계다.

---

# 📷 Production: 좋은 Source 확보

고품질 source photography는 이후 3D 제작을 쉽게 만든다.

Yosemite에서는 사전 답사를 통해 정확한 촬영 viewpoint를 먼저 정했다.

좋은 framing은 다음 특징을 가진다.

- mid-distance가 잘 보임
- foreground가 지나치게 가리지 않음
- scene의 깊이가 분명함
- 필요하면 CG foreground element를 추가할 공간이 있음

촬영 단계에서 시야를 가린 물체를 나중에 제거하는 것은 어렵다.

---

# 🌅 촬영 일정과 자연 조건

환경의 외형은 계절, 날씨, 시간, 일출·일몰 등에 크게 영향을 받는다.

특히 sunrise와 sunset 부근에는 lighting이 빠르게 변한다.

Apple은 필요한 것보다 더 오래 현장에 머물고, 필요하다고 생각하는 것보다 더 많은 사진을 촬영하라고 권장한다.

---

# 📐 Primary Photography 가이드

세션에서 소개하는 기본 촬영 가이드는 다음과 같다.

- tripod 사용
- camera level 유지
- primary camera 약 1m 높이
- deep depth of field
- 가능하면 약 2m 높이의 두 번째 camera
- 두 camera 동시 trigger
- 360° 전체를 촬영할 rig와 lens
- stitched panorama 생성

두 번째 카메라는 primary view에서 보이지 않는 영역을 채우는 데 유용하다.

---

# 🌈 Bracketed Exposure와 Dynamic Range

Immersive environment에는 태양처럼 매우 밝은 영역과 깊은 그림자가 동시에 존재할 수 있다.

따라서 bracketed exposure를 촬영해 넓은 dynamic range를 확보한다.

---

# 🖥️ visionOS 권장 해상도

visionOS environment는 약 **40 pixels per degree** 수준에서 sharp하게 보인다.

360° panorama의 이상적인 target으로 Apple은 다음 해상도를 예로 든다.

```text
14,400 × 7,200 pixels
```

최종 출력보다 여유 있는 resolution으로 source를 확보하는 것이 좋다.

---

# 📏 Secondary Photography와 측정 자료

Primary panorama 외에 다음 reference도 확보한다.

- detail 사진
- 다른 높이의 사진
- photogrammetry
- LiDAR
- 거리 측정 자료
- lighting reference
- material reference

Photogrammetry와 LiDAR point cloud는 mesh 제작뿐 아니라 거리와 terrain slope를 파악하는 데도 유용하다.

---

# 🎨 Lighting Reference

CG asset을 실제 촬영 환경에 자연스럽게 통합하려면 다음 reference를 primary photography와 같은 시점에 촬영한다.

- Macbeth chart
- chrome sphere
- gray sphere

이를 통해 color, white balance, light direction, light intensity, reflection을 맞춘다.

---

# 🎥 Motion Reference와 Audio

파도, 물, 나무, 구름처럼 움직이는 자연 요소는 video reference를 촬영한다.

실제 움직임은 shader의 속도, 방향, 계층적 motion을 설계하는 데 중요한 자료가 된다.

움직임과 연결된 sound도 함께 기록한다.

---

# 🖥️ Rendered Panorama

실제 촬영이 불가능한 환경은 digital content creation tool로 rendered panorama를 만들 수 있다.

장점은 다음을 완전히 제어할 수 있다는 것이다.

- lighting
- geometry
- 시간
- 날씨
- composition
- scene element

Production 방법은 팀 규모와 환경에 맞게 조정할 수 있다.

---

# 🧹 Post-production: Cleanup

Production이 끝나면 source panorama를 cleanup한다.

Thorsmork 예제에서는 다음을 제거했다.

- camera rig
- footprints
- people
- 지나치게 복잡한 vegetation
- 화면에서 너무 강하게 보이는 bush

Cleanup은 장비 제거뿐 아니라 pre-production에서 발견한 composition 문제를 해결하는 과정이다.

---

# 🖌️ Digital Matte Painting과 CG

불필요한 요소 제거와 scene 정리에 다음 방법을 사용한다.

- digital matte painting
- CG rendering
- texture editing

이때 color balance와 lighting consistency가 특히 중요하다.

---

# 🕸️ Panorama에서 3D Mesh로

Parallax와 depth를 위해 최종 environment에는 3D mesh가 필요하다.

정리된 panorama는 UV space texture로 변환되어 mesh에 적용된다.

파노라마에서 보이지 않은 surface는 secondary photography나 CG render로 보완한다.

---

# 🔍 A/B Comparison

Texture를 mesh로 옮기는 과정에서는 source panorama와 3D asset을 지속적으로 A/B 비교한다.

확인할 항목:

- sharpness
- color
- contrast
- detail
- scale
- lighting
- texture resolution

가까운 scene element끼리 sharpness가 다르면 실제 scale이 잘못 느껴질 수 있다.

---

# 🔄 Scene을 뒤집어 보기

같은 장면을 오래 보면 composition 문제를 놓치기 쉽다.

Scene을 좌우로 flop해 새로운 관점에서 확인하면 익숙함 때문에 보이지 않았던 문제를 발견할 수 있다.

---

# 🌗 Extreme Gamma와 Gain

Extreme gamma와 gain을 적용하면 다음 문제를 찾기 쉽다.

- color inconsistency
- value inconsistency
- texture transfer 중 data loss
- 다른 display에서 더 눈에 띌 결함

---

# 🔊 Spatial Audio

Textured mesh가 완성되어도 완전한 몰입에는 sound와 motion이 필요하다.

Thorsmork 강에서는 물이 바위 주변을 흐르는 위치에 rippling water sound emitter를 배치했다.

Spatial Audio를 특정 scene element와 연결하면 sound가 실제 위치에서 발생하는 것처럼 느껴진다.

---

# 🌊 Motion

Bora Bora에서는 다음 요소가 계속 변화한다.

- clouds
- cloud shadows
- palm trees
- waves
- lighting interaction

중요한 것은 움직임이 서로 연결된 현상처럼 느껴지게 하는 것이다.

---

# ☁️ UV Flow Maps로 구름 움직임

구름은 UV flow map을 사용해 저렴한 비용으로 지속적인 움직임을 만든다.

영역별 flow speed의 weight를 다르게 적용해 direction, depth, scale을 표현한다.

---

# 🌥️ Cloud Shadow의 착시

Dynamic light 대신 terrain texture를 어둡게 만드는 scrolling mask를 사용할 수 있다.

Mask의 방향과 속도를 cloud flow에 맞추면 독립적인 두 효과가 하나의 현상처럼 보인다.

---

# 🌴 Pre-rendered Flipbook Shadow

Palm tree 아래의 shadow는 pre-rendered flipbook texture로 표현한다.

실시간 soft shadow 비용을 줄이면서도 충분히 설득력 있는 결과를 만든다.

---

# 🪶 Mesh Complexity 줄이기

Palm frond는 mesh complexity를 크게 줄이고 UV flow map으로 wind motion을 표현한다.

Geometry와 animation 비용의 일부를 texture 기반 표현으로 이전하는 방식이다.

---

# 🌬️ Hierarchical Vertex Animation

Palm tree의 trunk, frond, leaflet는 서로 다른 크기와 속도로 움직인다.

Hierarchical vertex animation과 여러 sine wave를 겹쳐 자연스러운 variation을 만든다.

```text
Low-frequency motion
+
High-frequency motion
=
복합적이고 반복감이 적은 움직임
```

---

# 🌊 Water Shader

Water는 하나의 복잡한 simulation 대신 여러 간단한 효과를 layering한다.

- hue modulation
- saturation modulation
- brightness modulation
- normal map
- scrolling texture

작은 효과를 합쳐 subsurface scattering과 wave motion을 설득력 있게 표현한다.

---

# ⚡ Real-time Rendering Budget

Motion과 lighting은 몰입감을 높이지만 비용이 크다.

세션에서 반복되는 최적화 전략은 다음과 같다.

- dynamic simulation을 꼭 사용하지 않기
- shading을 precomputed texture로 이동
- flow map 활용
- flipbook animation 활용
- mesh 단순화
- texture compositing
- layered sine wave
- shader parameterization

핵심은 가장 복잡한 기술이 아니라 **시각적 의도를 가장 효율적으로 만족하는 방법**을 선택하는 것이다.

---

# 🎥 Reference를 Shader 설계에도 활용

Visual reference를 사용해 다음을 정의한다.

- 움직임 속도
- direction
- 밝기 변화
- shadow density
- wave rhythm
- wind response

Reference는 디자이너와 technical artist가 필요한 shader control을 논의하는 공통 언어가 된다.

---

# 🔁 전체 제작 흐름

| 단계 | 작업 |
|---|---|
| Intent | Environment의 목적과 use case 정의 |
| Scouting | 실제 위치와 시야 조사 |
| Reference | Photo, video, measurement 자료 확보 |
| Composition | Background, mid-ground, foreground 설계 |
| Motion plan | 움직임과 audio source 정의 |
| Primary shoot | 360° high-resolution photography |
| Secondary capture | 다른 높이, LiDAR, color, lighting reference |
| Panorama | High-resolution source panorama 생성 |
| Cleanup | 불필요한 요소 제거 |
| 3D asset | Mesh와 UV texture 구성 |
| Fidelity | Panorama와 3D A/B 비교 |
| Sound | Spatial Audio source 배치 |
| Motion | Shader와 animation 적용 |
| Optimization | Precomputed data와 layering으로 비용 절감 |
| Review | 의도와 composition을 다시 검증 |

---

# 📋 체크리스트

## Pre-production
- [ ] Environment의 목적을 한 문장으로 설명할 수 있는지 확인
- [ ] 사용자가 이 공간에서 무엇을 할지 정의
- [ ] Primary viewpoint 선정
- [ ] 사용자가 뒤를 돌아봤을 때의 scene도 설계
- [ ] 실제 장소라면 사전 답사
- [ ] 제거하거나 교체할 요소 표시
- [ ] 충분한 photo / video reference 확보 계획
- [ ] Lighting study 필요 여부 검토
- [ ] Background / mid-ground / foreground 구조 설계
- [ ] 움직임과 audio source가 필요한 요소 식별

## Production
- [ ] Camera를 tripod에 level로 설치
- [ ] Primary camera 높이 약 1m 검토
- [ ] 가능하면 alternate height camera 추가
- [ ] Deep depth of field 확보
- [ ] 360° 전체가 촬영되는 rig 구성
- [ ] Bracketed exposure 촬영
- [ ] 최종 display를 고려해 충분한 resolution 확보
- [ ] visionOS용 약 40 pixels/degree 기준 검토
- [ ] 14,400 × 7,200 수준 panorama target 검토
- [ ] Secondary photography 촬영
- [ ] Photogrammetry / LiDAR reference 확보 검토
- [ ] Macbeth chart 촬영
- [ ] Chrome / gray sphere 촬영
- [ ] Motion reference video 촬영
- [ ] 현장 sound 기록

## Post-production
- [ ] Camera rig, people, footprints 등 제거
- [ ] Composition을 방해하는 요소 제거
- [ ] Matte painting과 CG의 color balance 확인
- [ ] Lighting consistency 확인
- [ ] Panorama를 3D mesh texture로 이전
- [ ] 보이지 않았던 surface를 secondary reference로 보완
- [ ] Panorama와 3D asset을 지속적으로 A/B 비교
- [ ] 주변 asset 사이 sharpness 일관성 확인
- [ ] Scene flop으로 composition 재검토
- [ ] Extreme gamma / gain으로 texture 결함 검사
- [ ] Spatial Audio source 위치 검토
- [ ] Motion과 audio가 하나의 현상처럼 연결되는지 확인

## Real-time Effects
- [ ] Motion이 실제 reference와 비슷한지 확인
- [ ] Dynamic lighting이 꼭 필요한지 검토
- [ ] UV flow map 활용 가능성 검토
- [ ] Scrolling mask로 shadow를 대체할 수 있는지 검토
- [ ] Flipbook texture 활용 검토
- [ ] Mesh complexity 감소 가능성 검토
- [ ] Hierarchical vertex animation 활용
- [ ] 여러 frequency의 sine wave layering 검토
- [ ] Normal map과 scrolling texture 조합 검토
- [ ] Precomputed data로 shader cost를 줄일 수 있는지 확인
- [ ] 전체 scene이 real-time rendering budget 안에 들어오는지 확인

---

# 핵심 메시지

좋은 immersive environment는 사실적인 asset 하나만으로 만들어지지 않는다.

먼저 사용자가 왜 그 공간에 들어가는지 정의하고 그 목적에 맞게 구도를 설계해야 한다. 촬영 단계에서는 필요한 것보다 더 많은 source와 reference를 확보하고, post-production에서는 panorama의 photorealistic fidelity를 유지하면서 깊이와 parallax를 위한 3D mesh를 구성한다.

마지막으로 sound, motion, lighting을 서로 연결해 하나의 살아 있는 공간처럼 느껴지게 해야 한다.

실시간 렌더링에서는 flow map, precomputed texture, compositing, hierarchical animation처럼 **적은 비용으로 설득력 있는 착시를 만드는 방법**이 효과적일 수 있다.

모든 단계에서 중요한 것은 의도다. 환경에 무엇을 추가했는지뿐 아니라 무엇을 제거했는지까지 설명할 수 있어야 하며, 하나의 아이디어에 너무 집착하지 않고 예상하지 못한 결과도 받아들이며 반복해야 한다.

---

# 함께 보면 좋은 세션

- Optimize your custom environments for visionOS
- Create a spatial audio experience in visionOS
- Enhance your spatial computing app with RealityKit audio
