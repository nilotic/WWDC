# Meet SwiftUI spatial layout

Meet SwiftUI spatial layout https://developer.apple.com/videos/play/wwdc2025/273/



## ✨ 개요


이 세션은 visionOS 26 에서 SwiftUI 만으로 3D 레이아웃을 짜는 방법을 소개합니다 .

RealityKit 없이도 , 기존 2D 레이아웃 개념을 확장해서 3D 뷰 · 깊이 정렬 · 회전 · 오버레이를 제어할 수 있 게 된 것이 핵심입니다 .

🧱 3D SwiftUI 레이아웃 기본 개념 이제 SwiftUI 는 폭(width), 높이 (height) 뿐 아니라 깊이 (depth), Z 위치까지 계산합니다 .

- 뷰 타입별 깊이 특성 :

- Image, Color, Text 등은 depth = 0 → 기존 iOS 와 같은 2D 처럼 동작 Model3D( 기본 ) → 3D 이미지처럼 고정된 width/height/depth Model3D().resizable(), GeometryReader3D, RealityView 등은 제안된 깊이를 꽉 채우는 flexible depth 새 scaledToFit3D resizable()로 늘어난 3D 모델을 w/h/d 비율 유지하면서 컨테이너에 맞춰 스케일링합니다 .

- 윈도우 / 볼륨의 depth

- 윈도우 : 루트 depth 제안은 고정 ( 밖은 시스템이 클리핑 )

- 볼륨 : width/height/depth 모두 리사이즈 가능 🧊 DepthAlignment – 깊이 정렬 커스터마이즈 visionOS 에서 HStack, VStack, ZStack도 사실은 3D 스택입니다 .

  - 예 : ZStack은 자식들의 depth 를 쌓아서 자신의 depth 를 정함 .

- 기본 depth 정렬 :

  - 스택들은 기본적으로 back 정렬을 사용 ( 모든 뷰의 “ 뒤 ” 면을 맞춤 ).

- 새 DepthAlignment API:

- VStackLayout().depthAlignment(.front) 처럼 , .front, .center, .back 중 선택 가능 .

  - 카드가 모델 뒤에 묻히는 문제 → .front로 바꿔 카드 가독성을 확보하는 식 .

  - 커스텀 DepthAlignment

- DepthAlignmentID 프로토콜을 구현해 새 정렬 기준 정의 :

- 예 : “ 좋아하는 로봇일수록 더 앞에 보이는 podium 정렬 ” 1 등 : 가장 앞 , 2 등 : 중간 , 3 등 : 뒤에 배치

- 각 로봇 뷰에서 .depthAlignmentGuide를 프론트 / 센터 / 백 중 원하는 포인트로 매핑해 podium 효과 구현 .

  - 🔄 rotation3DLayout — 레이아웃까지 함께 도는 회전

- 기존 rotation3DEffect는 시각 효과만 바뀌고 , 레이아웃 ( 프레임 ) 은 그대로라서 회전한 3D 모델이 옆 카드와 겹치거나 , 볼륨 밖으로 튀어나가는 문제 발생 .

- 새 rotation3DLayout는 회전 후의 bounding box 를 기준으로 레이아웃 프레임을 다시 계산합니다 .

  - HStack, VStack 이 회전된 기하에 맞춰 간격 / 배치 공간을 재조정할 수 있음 .

- 디버그 예시 :

- 빨간 테두리 : 실제 회전된 모델

- 파란 테두리 : 레이아웃이 인식하는 axis-aligned bounding box rotation3DLayout 적용 후 , 파란 박스가 빨간 박스를 꼭 맞게 감싸도록 바뀜 .

- 🎠 Radial Carousel 예제 2D 예제에서 쓰던 커스텀 RadialLayout을 그대로 가져와 , Model3D 로봇들을 원형으로 배치 → 3D 에서도 잘 동작 .

- 볼륨 안에서 카루셀을 수평으로 눕히기:

- RadialLayout 전체에 rotation3DLayout(.degrees(90), axis: .x) 적용

  - 기존 높이가 이제 depth 역할 .

- 각 로봇 뷰에 rotation3DEffect로 역회전 (-90°) 적용해 로봇은 다시 똑바로 세움 .

- VStack + Spacer()를 이용해 카루셀을 볼륨 아래쪽으로 붙이기.

- 이 조합으로 , 하단에 붙어 있는 3D 로봇 회전 카루셀을 구현합니다 .



## 🧩 SpatialContainer & spatialOverlay


- 문제 : 로봇 위에 같은 3D 공간을 공유하는 선택 링 (Model3D) 을 겹쳐야 하는데 , 단순 Stack 으로 쌓으면 축 기준으로 앞뒤로 분리됨 .

- SpatialContainer 여러 뷰를 완전히 동일한 3D 공간 안에 겹쳐서 배치하는 컨테이너 .

- bottomFront, topTrailingBack 같은 3D alignment 를 적용 가능 .

- spatialOverlay 한 뷰 위에 단일 뷰를 같은 3D 공간에 오버레이할 때 사용 .

  - 예 : 선택된 로봇에만 spatialOverlay 로 링 모델을 덧씌움

- robotView.spatialOverlay(alignment: .bottom) { if isSelected { RingModelView().resizable() } } 링은 로봇 크기에 맞춰 리사이즈되고 , 로봇과 완전히 같은 공간을 공유합니다 .



## 🧪 debugBorder3D 구현 요약


- debugBorder3D는 3D 프레임을 시각화하는 커스텀 modifier 입니다 . 구현 아이디어 :

- View 익스텐션으로 debugBorder3D() 정의 .

- 원본 컨텐츠에 spatialOverlay를 적용해 , 같은 3D 공간 안에 보더용 ZStack 을 겹침 .

- 내부 ZStack 에 앞 / 뒤 면용 2D border + Spacer 배치 .

- 또 하나의 ZStack 을 rotation3DLayout과 함께 써서 , leading/trailing 면에 보더를 배치 ( 회전으로 옆면 생성 ).

- 결과적으로 6 면 모두에 border 를 그려 , 3D bounding box 를 한눈에 보는 도구 완성 .



## ✅ 정리


visionOS 26 에서 SwiftUI 는 깊이 (depth) & DepthAlignment, rotation3DLayout, SpatialContainer / spatialOverlay

를 통해 완전한 3D 레이아웃 시스템으로 확장되었습니다 .

- 기존 2D 레이아웃 지식 (HStack, VStack, alignment, custom layout) 을 그대로 활용하면서 , 로봇 카루셀 , podium-style depth, 3D 오버레이 같은 경험을 SwiftUI 만으로 만들 수 있습

  - 니다 .
