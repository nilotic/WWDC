# Bring Swift Charts to the third dimension

Bring Swift Charts to the third dimension https://developer.apple.com/videos/play/wwdc2025/313/



## ✅ Swift Charts 의 새로운 기능 : 3D 차트 (Chart3D)


  - 기존 2D 차트를 3D 로 확장하여 데이터의 입체적 이해 가능 .

  - Chart → Chart3D로 교체하면 3D 차트 구현 가능 .

  - PointMark 등 기존 마크는 3D 에서도 그대로 사용되며 , Z 값 추가 필요 .

  - 🐧 예제 데이터 : 펭귄 데이터셋

- 항목 : 부리 길이 , 날개 길이 , 체중 .

- 종류 : Chinstrap, Gentoo, Adélie.

- 2D 차트를 통해 각 속성 간 관계 시각화 후 , 3D 차트로 통합하여 세 속성 간의 상관관계를 한눈에 파 악 가능 .

- 🌄 주요 3D 시각화 요소

- SurfacePlot: 수학적 함수나 회귀분석 결과를 연속된 표면으로 시각화 .

  - 예 : flipper length 와 beak length 로 체중 예측하는 선형 회귀 결과를 surface 로 표현 .

- Chart3DPose: 초기 시점 설정 (azimuth: 좌우 회전 , inclination: 상하 기울기 ).

- chart3DCameraProjection: 카메라 투영 설정

- orthographic: 깊이에 상관없이 동일한 크기

- perspective: 원근감을 주어 몰입감 향상

- foregroundStyle: 표면 색상 설정 heightBased, normalBased 등 추가 .

- 🛠 커스터마이징

  - 기존 2D 차트에서 사용하던 RuleMark, RectangleMark 등도 3D 에서 지원 .

  - 포즈 , 스타일 , 카메라 각도 , 도메인 , 축 등 다양한 Modifier로 시각적 개선 가능 .

- 👓 Vision Pro 에서의 활용 3D 차트는 Vision Pro 와 특히 잘 어울림, 직관적인 3D 데이터 탐색 제공 .

  - 📚 참고 자료

- Swift Charts: Vectorized and function plots (WWDC24) Design app experiences with charts (WWDC22)
