# WWDC26 Explore numerical computing in Swift with MLX 요약

- Session: 328
- Title: Explore numerical computing in Swift with MLX
- Source: https://developer.apple.com/videos/play/wwdc2026/328/
- Topic: MLX Swift, Numerical Computing, Array Computing, GPU Acceleration, Lazy Evaluation, Automatic Differentiation, Convolution, Optimization
- Chapters: Introduction, MLX Swift and the Apple ecosystem, MLX Swift, Mandelbrot, Heat distribution, Faster convergence with SOR, Curve fitting, The full MLX toolkit and ecosystem, Next steps

---

## 한 줄 요약

MLX Swift는 **NumPy처럼 n차원 배열을 중심으로 수학식을 거의 그대로 Swift 코드로 표현하면서, lazy evaluation을 통해 GPU 실행과 automatic differentiation을 제공**하고, fractal·PDE·curve fitting 같은 numerical computing을 짧고 type-safe한 Swift 코드로 구현하게 해준다.

---

## 핵심 요약

이번 세션은 MLX Swift를 “Swift에서 사용하는 또 하나의 ML 라이브러리”가 아니라 **일반 numerical computing framework**로 설명한다.

핵심 포인트:

- MLX Swift의 중심 abstraction은 `MLXArray`
- NumPy와 매우 유사한 array-oriented API
- 대부분의 NumPy 코드는 최소한의 변경으로 MLX Swift로 옮길 수 있음
- 연산은 즉시 실행되지 않고 compute graph를 만든 뒤 `eval` 또는 value read 시 실행
- Lazy evaluation 덕분에:
  - GPU execution
  - Function transformations
  - Automatic differentiation
  을 자연스럽게 제공
- Plain Swift scalar loop보다 문제의 수학적 구조를 코드에 더 직접적으로 표현
- Mandelbrot처럼 embarrassingly parallel한 문제에서는 GPU 병렬화로 큰 성능 향상 가능
- Neighbor dependency가 있는 heat diffusion은 `conv2d` 하나로 stencil computation 표현
- Jacobi보다 더 나은 알고리즘인 SOR을 선택하면 같은 framework 안에서도 훨씬 빠른 convergence 가능
- `grad`를 사용하면 손으로 derivative를 작성하지 않고 curve fitting과 gradient descent 구현 가능
- MLX ecosystem은 linear algebra, FFT, convolution, reduction, scan, indexing, random, optimizer까지 포함
- Swift / Python / C++ / C frontend가 같은 개념과 lazy-evaluation model을 공유
- Python에서 prototype하고 Swift로 ship하는 workflow가 가능
- MLX와 MLX Swift ecosystem은 open source이며 MIT license

---

# 🧮 Numerical Computing이란

세션은 numerical computing을 수학 문제를 계산적으로 푸는 기법과 알고리즘의 집합으로 설명한다.

Symbolic하게 풀거나 손으로 계산하기 어려운 문제를 대량 계산으로 해결한다.

적용 분야:

- Chemistry simulation
- Biology simulation
- Physics simulation
- Financial systems
- Audio processing
- Signal processing
- Rendering
- Ray tracing
- Fractals
- Curve fitting
- Machine learning training

특히 large-scale gradient descent는 임의의 curve fitting 문제를 풀 수 있고, 이것이 machine learning model training의 핵심 아이디어와 연결된다.

---

# 🍎 Apple Numerical Computing Ecosystem

Apple platform에는 이미 여러 numerical computing 기술이 있다.

| Framework | 역할 |
|---|---|
| Accelerate | CPU의 hand-tuned vector primitives |
| BNNS | Neural network building blocks |
| Metal Performance Shaders | GPU kernel을 직접 활용 |
| Swift Numerics | `Complex` type과 generic numeric protocol |
| MLX Swift | 수학 표현에 가까운 array computing + GPU + autodiff |

MLX Swift는 특히 **수학 코드를 성능을 고려하면서도 수식에 가깝게 작성하고 싶은 경우**에 적합하다.

---

# ✨ MLX Swift를 선택하는 이유

Plain Swift로 numerical algorithm을 작성할 수도 있다.

하지만 scalar 중심 구현에서는 다음 bookkeeping이 늘어난다.

- 직접 loop 작성
- Index 관리
- Buffer 관리
- Point-by-point 계산
- CPU/GPU execution을 별도로 고려

MLX Swift에서는 scalar보다 array가 중심이다.

```text
Scalar-at-a-time
      ↓
Array-at-a-time
      ↓
수학 표현 그대로
      ↓
GPU 병렬 실행
```

세션은 NumPy 경험이 있다면 MLX Swift API가 매우 익숙할 것이라고 설명한다.

---

# 🧱 `MLXArray`: 핵심 Abstraction

MLX Swift의 중심은 n-dimensional array다.

Mathematician이나 numerical analyst가 vector와 matrix로 사고하는 것과 동일한 방식으로 코드를 작성한다.

예:

```swift
import MLX

let n = 100
let steps = 10

let B = MLXRandom.normal([n, n])
var v = MLXRandom.normal([n])

let A = B.T + B
```

`B.T`는 transpose이고 `+`는 matrix addition이다.

코드가 수식과 거의 같은 모양을 유지한다.

---

# 🔄 Power Iteration

세션의 첫 예제는 symmetric matrix의 dominant eigenvector를 찾는 power iteration이다.

수학적 형태:

```text
v ← Av / ||Av||
```

MLX Swift:

```swift
for _ in 0 ..< steps {
    let Av = matmul(A, v)
    v = Av / norm(Av)
    eval(v)
}
```

Eigenvalue 복원:

```swift
let lambda = matmul(
    matmul(v.T, A),
    v
)
```

핵심은 array operation이 알고리즘 수식과 일대일로 대응한다는 점이다.

---

# ⏳ Lazy Evaluation

MLX의 핵심 feature 중 하나다.

```text
Array Operation 호출
      ↓
즉시 계산하지 않음
      ↓
Compute Graph 구성
      ↓
`eval` 또는 값 읽기
      ↓
실제 실행
```

예:

```swift
let Av = matmul(A, v)
v = Av / norm(Av)
```

이 시점에는 compute graph가 구성된다.

```swift
eval(v)
```

호출 시 실제 computation을 실행한다.

---

# ⚠️ Loop 안에서 `eval`이 중요한 이유

Iteration마다 `eval`을 호출하지 않으면 graph가 계속 커질 수 있다.

```text
Iteration 1 graph
      ↓
Iteration 2 graph
      ↓
Iteration 3 graph
      ↓
...
```

따라서 iterative numerical algorithm에서는 적절한 시점에 evaluation을 강제한다.

세션의 power iteration과 gradient descent 모두 loop마다 `eval`을 호출한다.

---

# 🧠 Lazy Evaluation이 가능하게 하는 것

세션은 array computing과 lazy evaluation이 두 가지 중요한 기능의 기반이라고 설명한다.

## Automatic GPU Execution

Framework가 computation graph를 보고 GPU에서 효율적으로 실행할 수 있다.

## Automatic Differentiation

Function transformation인 `grad`를 통해 derivative computation을 자동으로 만들 수 있다.

이 두 기능이 numerical computing과 machine learning을 같은 programming model 안에서 연결한다.

---

# 🌀 Mandelbrot Set

두 번째 예제는 Mandelbrot fractal이다.

정의는 단순하다.

```text
z = z² + c
```

각 complex point `c`에 대해 반복하고, magnitude가 2를 넘지 않으면 set 내부에 속한다.

Divergence하는 point는 얼마나 빨리 escape하는지에 따라 색칠할 수 있다.

---

# 🧑‍💻 Plain Swift Mandelbrot

Plain Swift에서는 pixel마다 직접 loop를 작성한다.

```swift
for y in 0 ..< h {
    for x in 0 ..< w {
        let c = Complex(
            xMin + Float(x) * xStep,
            yMin + Float(y) * yStep
        )

        var z = Complex<Float>.zero
        var limit = maxIterations

        for i in 0 ..< maxIterations {
            z = z * z + c

            if z.lengthSquared > radiusSquared {
                limit = i
                break
            }
        }

        counts[x, y] = limit
    }
}
```

동작하지만 많은 bookkeeping이 문제의 수학과 직접 관련되지 않는다.

또 기본적으로 CPU에서 point-by-point로 실행된다.

---

# ⚡ MLX Swift Mandelbrot

MLX Swift에서는 complex number grid 전체를 하나의 array로 처리한다.

```swift
import MLX

let x = linspace(
    Float(-2.0),
    0.5,
    count: w
)

let y = linspace(
    Float(-1.25),
    1.25,
    count: h
).reshaped(h, 1)

let c = x + y.asImaginary()

var z = MLXArray.zeros(like: c)
var counts = MLXArray.zeros(
    c.shape,
    dtype: .int16
)

for _ in 0 ..< maxIterations {
    z = z * z + c
    counts = counts + (abs(z) .< 2)
}
```

핵심 loop는 사실상 두 줄이다.

```swift
z = z * z + c
counts = counts + (abs(z) .< 2)
```

Grid의 모든 point에 같은 operation이 동시에 적용된다.

---

# 🚀 Mandelbrot 성능

Mandelbrot는 각 point가 서로 독립적인 embarrassingly parallel problem이다.

따라서 GPU에 매우 잘 맞는다.

세션은 정확한 성능은 algorithm에 따라 다르지만 **10배 수준의 속도 향상도 충분히 가능하다**고 설명한다.

장점은 성능만이 아니다.

```text
더 짧은 코드
+
수학과 가까운 표현
+
GPU 병렬화
```

을 동시에 얻는다.

---

# 🔥 Heat Distribution

다음 문제는 각 cell이 이웃과 상호작용한다.

이 패턴은 다음 영역에서 자주 나온다.

- Physics
- Image processing
- Neural networks

세션은 방 안의 steady-state temperature distribution을 계산한다.

---

# 🧱 2D Temperature Grid

온도를 2D grid로 모델링한다.

각 iteration에서 한 cell의 새 temperature는 상하좌우 네 이웃의 평균이다.

Stencil:

```text
0    1/4   0
1/4   0   1/4
0    1/4   0
```

이 계산은 convolution과 정확히 같은 형태다.

---

# 🧩 Jacobi Iteration을 `conv2d`로 표현

Kernel:

```swift
let kernel = MLXArray(
    converting: [
        0,    0.25, 0,
        0.25, 0,    0.25,
        0,    0.25, 0,
    ]
).reshaped(1, 3, 3, 1)
```

초기값:

```swift
var temperature = heatSources
```

Iteration 핵심:

```swift
let next = conv2d(
    temperature,
    kernel,
    padding: 1
)

temperature = which(
    heatMask,
    heatSources,
    next
)
```

`conv2d`는 네 이웃의 평균을 계산한다.

`which`는 boundary condition을 적용한다.

```text
Heat source / wall
→ 고정값 유지

그 외 cell
→ 새 convolution 결과 사용
```

---

# 🧠 “Convolution as Physics”

세션의 중요한 메시지다.

Heat diffusion을 위해 특별한 custom kernel을 직접 작성하지 않는다.

수학적으로 정의된 local stencil을 standard `conv2d` operation으로 그대로 표현한다.

```text
Physics Equation
      ↓
Local Stencil
      ↓
Convolution
```

이 패턴은 image processing과 neural network의 convolution과 같은 계산 primitive를 공유한다.

---

# 🐢 Jacobi의 Convergence 문제

Jacobi iteration은 각 iteration 계산 자체는 빠르다.

하지만 heat가 grid에서 한 cell씩 퍼지는 형태라 convergence가 느리다.

세션은 side length가 `N`인 grid의 경우 일반적으로 steady state까지 **N² iteration**이 필요하다고 설명한다.

즉 framework의 연산 속도뿐 아니라 algorithm 선택 자체가 중요하다.

---

# 🚄 Successive Over-Relaxation, SOR

더 빠른 방법으로 SOR을 사용한다.

핵심은 Jacobi update를 그대로 쓰되 `ω`를 사용해 변화 방향으로 조금 더 멀리 이동하는 것이다.

```swift
let ω: Float =
    2.0 /
    (1.0 + sin(
        Float.pi /
        Float(max(M, N))
    ))
```

Update:

```text
new = ω × neighborAverage
    + (1 - ω) × old
```

일부러 조금 overshoot한 뒤 다음 iteration에서 correction한다.

---

# 📉 N² → N Iterations

세션은 optimal `ω`를 사용하면 SOR이 약 **N iteration**에 convergence할 수 있다고 설명한다.

비교:

```text
Jacobi
≈ N² iterations

SOR
≈ N iterations
```

같은 MLX API를 사용하더라도 algorithm 선택만으로 큰 차이가 난다.

---

# ♟️ Red / Black Checkerboard

SOR은 in-place update 효과가 중요하다.

MLX는 일반적으로 기존 array를 직접 수정하기보다 새 array를 만든다.

이를 해결하기 위해 checkerboard pattern을 사용한다.

```text
R B R B
B R B R
R B R B
B R B R
```

먼저 red cell을 업데이트한다.

그 다음 black cell을 업데이트하면 이미 갱신된 red neighbor 값을 사용할 수 있다.

---

# 🔴 Red Update

```swift
let sorRed =
    ω * conv2d(
        temperature,
        kernel,
        padding: 1
    )
    + (1 - ω) * temperature

 temperature = which(
    redMask,
    sorRed,
    temperature
)

temperature = which(
    heatMask,
    heatSources,
    temperature
)
```

---

# ⚫ Black Update

```swift
let sorBlack =
    ω * conv2d(
        temperature,
        kernel,
        padding: 1
    )
    + (1 - ω) * temperature

temperature = which(
    blackMask,
    sorBlack,
    temperature
)

temperature = which(
    heatMask,
    heatSources,
    temperature
)
```

Black update 시점에는 red neighbor가 이미 최신값이다.

이 방식으로 in-place algorithm과 비슷한 효과를 얻는다.

---

# 🌊 SOR의 Overshoot Pattern

SOR animation에서는 ripple 형태가 나타난다.

이는 update를 목표값 방향으로 일부러 overshoot한 뒤 반복하면서 correction하기 때문이다.

결국 Jacobi와 SOR 모두 같은 steady-state configuration에 수렴한다.

세션 데모에서는 SOR이 너무 빨라 시각적으로 비교할 수 있도록 **100배 느리게 표시**했다고 설명한다.

이 부분은 framework 최적화보다 **알고리즘 선택의 영향이 얼마나 큰지**를 강조한다.

---

# 📈 Curve Fitting

앞의 예제들은 input에서 output을 계산하는 forward computation이었다.

Curve fitting은 반대 방향 문제다.

```text
Data Points 존재
      ↓
이 데이터를 잘 설명하는
Parameter를 찾음
```

세션에서는 quadratic polynomial을 fitting한다.

---

# 🧮 Quadratic Function

```swift
func f(
    _ θ: MLXArray
) -> MLXArray {
    θ[0]
        + θ[1] * x
        + θ[2] * x ** 2
}
```

Parameter:

```text
θ₀
θ₁
θ₂
```

이 세 값을 조정해 data point에 가까운 parabola를 찾는다.

---

# 🎯 Mean Squared Error Loss

Loss:

```swift
func loss(
    _ θ: MLXArray
) -> MLXArray {
    mean(
        (f(θ) - y) ** 2
    )
}
```

즉 predicted value와 actual value 차이의 제곱 평균이다.

이 구조는 machine learning training과 동일한 핵심 아이디어다.

---

# ✨ `grad` Automatic Differentiation

MLX의 function transformation을 이용한다.

```swift
let gradLoss = grad(loss)
```

개발자가 derivative를 손으로 계산하지 않는다.

MLX가 loss function에서 parameter에 대한 정확한 gradient function을 만든다.

```text
loss(θ)
      ↓
`grad`
      ↓
∇loss(θ)
```

---

# 🔁 Gradient Descent

```swift
var θ = zeros([numParams])
let gradLoss = grad(loss)

for _ in 0 ..< steps {
    let g = gradLoss(θ)
    θ = θ - learningRate * g
    eval(θ)
}
```

각 iteration:

```text
현재 θ
  ↓
Gradient 계산
  ↓
Gradient 반대 방향으로 이동
  ↓
새 θ
```

Parabola가 data에 점점 가까워진다.

---

# 🧠 Machine Learning과의 연결

세션에서 curve fitting은 작은 예제지만 구조는 neural network training과 같다.

```text
Model Function
      ↓
Loss
      ↓
Automatic Differentiation
      ↓
Gradient
      ↓
Optimizer
      ↓
Parameter Update
```

따라서 MLX Swift의 numerical computing API와 machine learning API가 같은 계산 모델을 공유한다.

---

# 📐 Direct Solver도 가능

세션은 이 quadratic fitting 문제 자체는 linear algebra package의 QR decomposition을 사용해 직접 풀 수도 있다고 설명한다.

하지만 `grad`의 장점은 다음과 같다.

> Function이 얼마나 복잡하든 differentiable computation이면 같은 방식으로 gradient를 얻을 수 있다.

이 때문에 neural network 같은 매우 복잡한 모델에도 같은 mechanism을 적용할 수 있다.

---

# 🛠️ Optimizer Ecosystem

MLX는 gradient뿐 아니라 optimizer도 제공한다.

세션에서 언급한 예:

- SGD
- Adam
- RMSprop

즉 직접 gradient descent loop를 작성하는 것보다 더 정교한 optimization algorithm도 사용할 수 있다.

---

# 🧰 전체 Numerical Computing Toolkit

세션에서 소개한 MLX의 범위:

- Linear algebra
- FFT
- N-dimensional convolution
- Reductions
- Scans
- Indexing
- Random number generation
- Automatic differentiation
- Optimizers
- Array transformations

즉 LLM framework 이전에 일반 numerical computing foundation이다.

---

# 📦 Swift Ecosystem

세션은 Swift 쪽 주요 open-source package를 소개한다.

## `mlx-swift`

Core framework.

이번 세션의 array computing, convolution, grad 같은 기능이 들어 있다.

## `mlx-swift-lm`

Swift language model implementation.

Local LLM integration 등에 사용한다.

## `mlx-swift-examples`

Sample program collection.

다루는 예:

- LLM integration
- Stable Diffusion
- Model training
- Fine-tuning
- 이번 세션의 numerical computing examples

Swift Package Manager로 설치할 수 있다.

---

# 🌐 MLX는 하나의 Framework, 네 Frontend

MLX는 Swift 전용 framework가 아니다.

세션 기준 공식 frontend:

```text
MLX Core Concepts
      ↓
┌────────┬────────┬────────┬────────┐
│ Swift  │ Python │ C++    │ C      │
└────────┴────────┴────────┴────────┘
```

공유하는 것:

- 같은 operation
- 같은 concept
- 같은 lazy-evaluation model

따라서 언어가 달라도 mental model이 유지된다.

---

# 🐍 Prototype in Python, Ship in Swift

Python은 research ecosystem이 더 넓다.

세션은 예로 다음 프로젝트를 언급한다.

- `mlx-lm`
- `mlx-vlm`

Prototype을 Python으로 만들고, production Apple app에서는 Swift frontend를 사용할 수 있다.

```text
Research / Prototype
Python
      ↓
Shared MLX Concepts
      ↓
Production App
Swift
```

Cross-language friction을 줄이는 것이 중요한 장점이다.

---

# 🔓 Open Source

`mlx-swift`와 MLX ecosystem은 open source다.

License:

```text
MIT License
```

Apple은 다음 참여를 장려한다.

- Issue 등록
- 질문
- Bug fix
- Pull request
- Example 추가

---

# ⚖️ Plain Swift vs MLX Swift

| 항목 | Plain Swift | MLX Swift |
|---|---|---|
| 중심 abstraction | Scalar | N-dimensional array |
| Loop | 직접 작성 | Array operation으로 대체 가능 |
| 수학 표현 | Bookkeeping이 섞일 수 있음 | 수식에 가까움 |
| GPU | 별도 구현 필요 | 기본적으로 자동 활용 가능 |
| Autodiff | 직접 구현 필요 | `grad` |
| Convolution | 직접 loop/kernel | `conv2d` |
| Lazy evaluation | 없음 | 기본 execution model |
| Numerical toolkit | 조합 필요 | 통합 API |

---

# 🧭 어떤 Framework를 선택할까

## Accelerate

적합:

- CPU vector/matrix primitive
- 성숙한 hand-tuned CPU performance

## BNNS

적합:

- Neural network low-level building block

## Metal Performance Shaders

적합:

- GPU kernel 수준 control
- Lower-level performance engineering

## Swift Numerics

적합:

- Generic numeric protocol
- Complex number type

## MLX Swift

적합:

- 수학적 array code
- Numerical simulation
- GPU acceleration
- Automatic differentiation
- ML model 구현
- Python/Swift 간 concept 공유

---

# 🧩 예제별 핵심 Primitive

| 예제 | 핵심 MLX 기능 | 계산 패턴 |
|---|---|---|
| Power iteration | `matmul`, `norm`, `.T`, `eval` | Linear algebra |
| Mandelbrot | Complex array, broadcasting, comparison | Embarrassingly parallel grid |
| Jacobi heat solver | `conv2d`, `which` | Local stencil / PDE |
| SOR | `conv2d`, checkerboard masks | Faster iterative solver |
| Curve fitting | `grad`, `mean`, array math | Automatic differentiation |

---

# 📋 체크리스트

## MLX Swift 도입

- [ ] Swift Package Manager에 `mlx-swift` 추가
- [ ] 최소 deployment requirement 확인
- [ ] 기존 NumPy/Python algorithm과 API 대응 확인
- [ ] Scalar loop를 array operation으로 표현 가능한지 검토
- [ ] Input/output shape를 명확히 정의
- [ ] `MLXArray` dtype 확인

## Lazy Evaluation

- [ ] 연산이 즉시 실행되지 않는다는 점 이해
- [ ] 값을 실제로 읽는 지점 확인
- [ ] Iterative loop에서 `eval` 호출 위치 결정
- [ ] Graph가 무한히 커지지 않도록 관리
- [ ] Performance measurement 시 evaluation boundary를 정확히 포함

## GPU 활용

- [ ] Array 전체 operation으로 표현
- [ ] 불필요한 scalar extraction 최소화
- [ ] CPU↔GPU synchronization 지점 확인
- [ ] GPU가 유리한 충분한 workload인지 확인
- [ ] Algorithm 특성에 따라 실제 speedup 측정

## Mandelbrot / Grid Computing

- [ ] Pixel loop를 array grid로 변환
- [ ] Broadcasting shape 확인
- [ ] Complex array 활용 검토
- [ ] Iteration mask 처리 검증
- [ ] Plain Swift baseline과 성능 비교

## Convolution-based Solver

- [ ] Local stencil을 convolution kernel로 표현 가능한지 확인
- [ ] Kernel shape 확인
- [ ] Padding semantics 확인
- [ ] Boundary condition을 `which`로 표현 가능한지 검토
- [ ] Fixed wall/source mask 정확성 검증

## Algorithm 선택

- [ ] Framework 최적화보다 algorithm complexity 먼저 검토
- [ ] Jacobi와 SOR처럼 convergence rate 비교
- [ ] Optimal parameter 계산 가능 여부 확인
- [ ] In-place requirement를 mask/pattern으로 대체 가능한지 검토
- [ ] Accuracy와 speed의 tradeoff 측정

## Automatic Differentiation

- [ ] Parameterized function 정의
- [ ] Scalar loss 정의
- [ ] `grad(loss)` 사용
- [ ] Gradient shape 확인
- [ ] Learning rate tuning
- [ ] Loop마다 `eval` 적용
- [ ] Analytical derivative와 sample test 비교

## Optimizer

- [ ] 단순 gradient descent로 충분한지 확인
- [ ] SGD 검토
- [ ] Adam 검토
- [ ] RMSprop 검토
- [ ] Optimizer state memory 고려

## Swift / Python Workflow

- [ ] Python prototype과 Swift implementation의 operation 대응 확인
- [ ] Shape/dtype convention 일치
- [ ] 동일 algorithm result 비교
- [ ] Research code를 Swift production code로 옮길 boundary 정의
- [ ] Swift-specific app integration과 UI layer 분리

## Open Source 활용

- [ ] `mlx-swift` docs 확인
- [ ] Tests를 API usage example로 활용
- [ ] `mlx-swift-examples` 확인
- [ ] `mlx-swift-lm` 확인
- [ ] Python `mlx-lm`, `mlx-vlm` 생태계 확인

---

# ⚠️ 구현 시 주의할 점

## MLX Swift가 모든 numerical workload에서 자동으로 최적은 아니다

세션도 Apple ecosystem의 기존 framework 각각이 자신이 설계된 목적에 강하다고 설명한다.

CPU vector primitive가 핵심이면 Accelerate가 더 적합할 수 있고, custom GPU kernel이 필요하면 MPS나 Metal을 고려해야 한다.

## Array code라고 무조건 빠른 것은 아니다

GPU benefit은 algorithm, shape, workload size에 따라 달라진다.

Mandelbrot처럼 병렬성이 높은 문제는 큰 이득을 얻을 수 있지만 작은 array나 synchronization이 많은 작업은 다를 수 있다.

## `eval`이 너무 늦으면 Graph가 커질 수 있다

특히 반복 algorithm에서는 evaluation boundary를 의도적으로 관리한다.

## Framework 선택보다 Algorithm 선택이 더 큰 차이를 만들 수 있다

Heat example에서 Jacobi와 SOR은 거의 같은 operation을 사용하지만 convergence characteristic이 완전히 다르다.

세션은 SOR demo를 보기 위해 100배 늦춰야 할 정도였다고 설명한다.

## Autodiff는 손으로 derivative를 쓰지 않게 해주지만 optimization 설계는 여전히 필요하다

Loss function, learning rate, optimizer, parameterization은 개발자가 설계해야 한다.

---

# 🔁 Numerical Computing Workflow

```text
수학 문제 정의
      ↓
Vector / Matrix / Grid로 표현
      ↓
MLXArray로 모델링
      ↓
Array operation 사용
      ↓
Lazy compute graph 생성
      ↓
GPU 실행
      ↓
필요 시 `grad`
      ↓
Optimization / Simulation
      ↓
Swift app에 통합
```

---

# 🎯 세션의 예제 흐름이 보여주는 것

세션의 세 주요 예제는 MLX Swift의 서로 다른 강점을 단계적으로 보여준다.

## Mandelbrot

```text
Scalar Loop
→ Array Computing
→ GPU Parallelism
```

## Heat Distribution

```text
Neighborhood Physics
→ Convolution Primitive
→ Algorithm Improvement with SOR
```

## Curve Fitting

```text
Forward Function
→ Loss
→ Automatic Differentiation
→ Gradient Descent
```

즉 MLX Swift는 단순 matrix library가 아니라 simulation, scientific computing, optimization, machine learning까지 이어지는 통합 계산 모델이다.

---

# 핵심 메시지

MLX Swift의 가장 큰 장점은 “Swift에서 GPU를 쓸 수 있다”는 사실 하나가 아니다.

더 중요한 것은 **수학에서 사용하는 vector·matrix·grid 표현을 코드 구조로 그대로 유지하면서, performance execution과 differentiation은 framework가 맡는다는 점**이다.

Plain Swift는 numerical code를 자연스럽게 표현할 수 있지만 scalar 중심이라 반복문과 index bookkeeping이 문제의 본질을 가릴 수 있다.

MLX Swift에서는 n-dimensional array를 중심으로 다음처럼 표현한다.

```text
Math
      ↓
Array Operations
      ↓
Lazy Graph
      ↓
GPU
      ↓
Autodiff
```

Mandelbrot에서는 전체 complex grid를 한 번에 계산해 plain scalar Swift보다 훨씬 간결한 코드로 GPU parallelism을 얻는다.

Heat distribution에서는 local neighbor average를 `conv2d` 하나로 표현하고, 같은 framework 안에서도 Jacobi 대신 SOR을 선택해 algorithmic complexity 자체를 줄이는 것이 얼마나 중요한지 보여준다.

Curve fitting에서는 `grad`가 loss function의 derivative를 자동으로 만들어 gradient descent를 구현하고, 이 구조가 그대로 machine learning training으로 확장된다.

또 MLX는 Swift만의 library가 아니라 Python, C++, C frontend가 동일한 개념과 lazy-evaluation model을 공유하는 하나의 framework다.

따라서 연구와 빠른 실험은 Python에서 하고, Apple platform product는 Swift에서 구현하는 식으로 언어를 바꿔도 계산 모델과 mental model을 유지할 수 있다.

결국 이번 세션의 메시지는 다음으로 정리할 수 있다.

```text
수학을 수학처럼 작성하고,
배열 단위로 생각하고,
GPU와 autodiff는 MLX에 맡긴다.
```

---

# 함께 보면 좋은 세션과 자료

- Explore distributed inference and training with MLX — WWDC26
- Run local agentic AI on the Mac using MLX — WWDC26
- Explore large language models on Apple silicon with MLX — WWDC25
- Get started with MLX for Apple silicon — WWDC25
- MLX Framework
- MLX Swift
- MLX Swift LM
- MLX Swift Examples
- MLX LM — Python
- MLX Explore — Python
