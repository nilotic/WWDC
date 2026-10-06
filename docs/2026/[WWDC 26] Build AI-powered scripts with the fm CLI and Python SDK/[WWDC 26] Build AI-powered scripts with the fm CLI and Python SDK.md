# WWDC26 Build AI-powered scripts with the fm CLI and Python SDK 요약

- Session: 334
- Title: Build AI-powered scripts with the fm CLI and Python SDK
- Source: https://developer.apple.com/videos/play/wwdc2026/334/
- Topic: Foundation Models, fm CLI, Python SDK, Prompt Prototyping, Evaluation Pipeline

---

## 한 줄 요약

WWDC26 세션 334는 macOS 27에서 Apple Foundation Models를 Swift 앱 밖에서도 활용할 수 있도록 새롭게 제공되는 **fm CLI**와 **Foundation Models SDK for Python**을 소개하고, 터미널 자동화와 Python 기반 평가 파이프라인을 통해 프롬프트를 빠르게 실험·검증하는 방법을 설명한 세션이다.

---

## 핵심 요약

이번 세션은 크게 세 가지 흐름으로 구성된다.

1. **fm CLI**
   - macOS 27에 기본 탑재되는 Foundation Models command line tool
   - 터미널에서 on-device model과 Private Cloud Compute model 호출
   - `fm chat`, `fm respond`, `fm schema` 등 제공
   - 이미지 입력, structured output, automation script 지원

2. **Foundation Models SDK for Python**
   - Python 코드에서 Apple Foundation Models 접근
   - Swift Foundation Models framework와 유사한 API
   - text/image prompt, streaming, guided generation, tool calling 지원
   - Python ML/data science 생태계와 결합 가능

3. **Prompt evaluation workflow**
   - Python Notebook에서 여러 prompt 구현을 비교
   - evaluation dataset 생성
   - model output 생성 및 DataFrame 저장
   - judge model로 결과 채점
   - Pandas, matplotlib 등을 활용한 시각화와 반복 개선

---

# 1. Introduction

세션은 Apple Foundation Models를 macOS에서 활용하는 새로운 방법을 소개하는 것으로 시작한다.

WWDC25에서 Apple은 Swift 기반 Foundation Models framework를 소개했고, 앱에서 on-device Apple Foundation Model을 prompt할 수 있게 했다. 이 프레임워크는 guided generation을 통한 structured output 생성과 tool calling을 통한 앱 context 활용을 지원했다.

WWDC26에서는 Foundation Models framework에 여러 기능이 추가된다.

| 항목 | 내용 |
|---|---|
| Image prompt | prompt에 이미지를 함께 전달 가능 |
| Server models | 동일한 Swift API로 서버 모델 사용 가능 |
| Private Cloud Compute | 더 큰 Apple Foundation Model 활용 |
| Advanced workflows | 단순 텍스트 추출부터 agentic workflow까지 확장 |

하지만 기존에는 이 모델을 Swift 코드에서만 사용할 수 있었다. 이번 세션은 Apple Foundation Models를 Swift 앱 밖에서도 사용할 수 있게 하는 두 가지 새로운 도구를 소개한다.

| 도구 | 설명 |
|---|---|
| `fm` CLI | macOS 27에 기본 탑재되는 command line tool |
| Foundation Models SDK for Python | Python 코드에서 on-device model을 사용할 수 있는 SDK |

---

# 2. Introducing the fm CLI and Python SDK

## fm CLI

`fm` command line tool은 macOS 27부터 기본 제공된다. 터미널에서 바로 Foundation Models를 호출할 수 있으며, Xcode 프로젝트를 다시 빌드하지 않고도 prompt를 빠르게 테스트할 수 있다.

주요 사용 목적은 다음과 같다.

- 터미널에서 빠른 prompt 테스트
- interactive chat
- script와 automation에 모델 호출 통합
- structured output 생성
- image prompt 테스트
- on-device model과 Private Cloud Compute model 비교

## Foundation Models SDK for Python

Foundation Models SDK for Python은 Python 코드에서 Apple Foundation Models를 사용할 수 있게 한다.

지원 기능은 다음과 같다.

| 기능 | 설명 |
|---|---|
| Text input | 텍스트 prompt 처리 |
| Image input | 이미지 prompt 처리 |
| Streaming | 응답 streaming |
| Guided generation | 구조화된 output 생성 |
| Tool calling | 모델이 Python 코드와 상호작용 |
| Evaluation workflow | Python 생태계 기반 평가 파이프라인 구성 |

Swift 개발자에게는 Foundation Models framework와 비슷한 API로 느껴지고, ML 엔지니어에게는 익숙한 Python 환경에서 on-device model을 사용할 수 있다는 장점이 있다.

---

# 3. Command line tool

## 기본 사용

터미널에서 `fm`을 입력하면 사용할 수 있는 command 목록을 볼 수 있다.

주요 command는 다음과 같다.

| Command | 역할 |
|---|---|
| `fm chat` | 터미널에서 interactive conversation 시작 |
| `fm respond` | prompt를 입력하고 inline response 출력 |
| `fm schema` | structured output용 schema 생성 |

`fm chat`은 터미널에서 on-device model과 대화할 수 있는 interactive interface다. 대화 중 `/model` 명령으로 Private Cloud Compute model로 전환할 수 있고, `/save` 명령으로 현재 대화를 저장해 나중에 이어갈 수 있다.

`fm respond`는 script에서 사용하기 좋은 방식이다. prompt를 입력하면 모델 응답이 표준 출력으로 반환되므로 shell script, automation, file processing workflow에 자연스럽게 넣을 수 있다.

## 모델 선택

`fm`은 기본적으로 macOS에 포함된 on-device model을 사용한다. 이 모델은 항상 사용할 수 있다.

더 복잡한 문제에는 Private Cloud Compute의 Apple Foundation Model을 사용할 수 있다. 이는 on-device model보다 큰 모델이지만 사용량 제한이 있다.

| 모델 | 특징 |
|---|---|
| On-device model | 기본값, 항상 사용 가능, 로컬 실행 |
| Private Cloud Compute model | 더 큰 모델, 복잡한 문제에 적합, 사용량 제한 있음 |

---

# 4. fm respond and structured output

`fm respond`는 단순한 텍스트 응답뿐 아니라 이미지 입력과 structured output도 지원한다.

예를 들어 다음과 같은 작업이 가능하다.

- Swift 이메일 정규식 생성
- Private Cloud Compute model로 더 복잡한 답변 생성
- screenshot 이미지를 함께 전달해 어떤 앱을 사용 중인지 식별
- schema를 지정해 JSON 형태의 구조화된 결과 생성

structured output을 만들 때는 `fm schema object`로 schema 파일을 만들고, `fm respond`의 `--schema` 옵션으로 해당 schema를 전달한다.

이 방식은 script에서 모델 결과를 안정적으로 후처리할 때 중요하다. 모델이 자유 텍스트가 아니라 미리 정의한 필드 구조로 결과를 반환하므로, `jq` 같은 command line tool과 결합해 자동화할 수 있다.

---

# 5. Automating file management with fm

세션에서는 `fm`을 활용한 실제 자동화 예시로 파일 정리 script를 보여준다.

상황은 다음과 같다.

- 발표 자료 프로젝트를 끝낸 상태
- asset folder에 draft 파일과 final 파일이 뒤섞여 있음
- final 파일은 backup directory에 복사
- draft 파일은 archive disk로 이동
- 파일 이름이 제각각이라 규칙 기반 정렬이 어렵고, 모델 판단이 필요함

## 자동화 흐름

| 단계 | 내용 |
|---|---|
| 1 | working directory의 파일 목록을 읽음 |
| 2 | `fm respond`에 파일 목록과 instruction 전달 |
| 3 | `fm schema object`로 final/draft 파일 목록 schema 정의 |
| 4 | 모델이 final files와 draft files를 JSON으로 반환 |
| 5 | final files는 backup directory로 복사 |
| 6 | draft files는 archive directory로 이동 |

이 예시는 command line에서 Foundation Models를 사용하는 핵심 장점을 보여준다. 단순한 shell script만으로는 파일 이름의 의미를 추론하기 어렵지만, `fm`을 사용하면 모델이 파일명을 해석해 draft와 final을 구분할 수 있다.

---

# 6. Python SDK

Foundation Models SDK for Python은 Python 환경에서 Apple Foundation Models를 사용할 수 있는 SDK다.

## 설치 조건

세션에서 설명한 기본 조건은 다음과 같다.

| 조건 | 내용 |
|---|---|
| Python version | Python 3.10 이상 |
| Xcode | Xcode 설치 필요 |
| Mac | Apple Silicon Mac 필요 |
| 설치 방법 | `pip` 또는 원하는 Python package manager 사용 |

설치 예시는 다음과 같다.

```bash
pip install apple_fm_sdk
```

## 기본 사용

Python SDK는 Swift Foundation Models framework와 유사한 구조를 제공한다.

기본 흐름은 다음과 같다.

1. `apple_fm_sdk` import
2. `LanguageModelSession` 생성
3. 필요한 경우 instruction 설정
4. `session.respond()`로 prompt 전달
5. 모델 응답 사용

Python SDK는 text input뿐 아니라 image input과 streaming response도 지원한다.

---

# 7. Prompting, tool calling and guided generation

세션에서는 grocery ordering app을 예시로 Python SDK의 주요 기능을 설명한다.

## Tool calling

모델이 사용자 context를 활용해야 할 때 tool calling을 사용할 수 있다.

예를 들어 grocery app에서 사용자의 최근 주문 내역을 참고해야 한다면, Python 코드로 `get_past_orders` 같은 tool을 정의하고 모델이 필요할 때 이를 호출하도록 할 수 있다.

| 구성 | 설명 |
|---|---|
| Tool class | 모델이 호출할 수 있는 Python 도구 정의 |
| name | tool 이름 |
| description | tool이 하는 일 설명 |
| Arguments | 모델이 tool 호출 시 전달할 인자 구조 |

이를 통해 모델은 단순한 prompt 응답을 넘어 앱 또는 script의 실제 데이터와 상호작용할 수 있다.

## Guided generation

Guided generation은 모델 output을 특정 구조로 제한하는 기능이다.

Python SDK에서는 `fm.generable` decorator를 사용해 원하는 output 구조를 정의하고, `respond` 호출 시 해당 구조를 지정할 수 있다.

예를 들어 grocery ordering app에서는 모델이 추천할 장바구니 항목을 `ItemsSuggestion` 같은 구조로 반환하도록 만들 수 있다.

이 방식은 앱이나 자동화 script에서 모델 결과를 안정적으로 사용하기 위해 중요하다.

---

# 8. Building an evaluation pipeline in Python

세션 후반부는 Python SDK를 활용한 evaluation pipeline 구축을 다룬다.

예시는 grocery ordering app의 “다음 주문 준비” 기능이다. 목표는 사용자의 과거 주문과 현재 장바구니를 바탕으로 다음에 추가할 가능성이 높은 항목을 예측하는 것이다.

## 평가 목표

모델 output이 다음 조건을 만족하는지 확인한다.

- 이전 주문 내역을 잘 반영하는가
- 현재 장바구니에 이미 있는 항목을 중복으로 추가하지 않는가
- 예상해야 할 항목을 누락하지 않는가
- 불필요한 항목을 과도하게 추가하지 않는가
- hallucinated item을 생성하지 않는가

## 평가 파이프라인 구성

| 단계 | 내용 |
|---|---|
| 1 | server model로 evaluation data 생성 |
| 2 | input과 expected output 준비 |
| 3 | 여러 prompt implementation 작성 |
| 4 | 각 implementation으로 output 생성 |
| 5 | 결과를 Pandas DataFrame에 저장 |
| 6 | judge model로 각 output 채점 |
| 7 | metric을 DataFrame에 저장 |
| 8 | matplotlib으로 chart 생성 |
| 9 | 결과를 보고 prompt 반복 개선 |

## 세 가지 prompt 구현 비교

세션에서는 세 가지 prompt 구현을 비교한다.

| 구현 | 특징 |
|---|---|
| Minimal prompt | 가장 단순한 prompt |
| Descriptive prompt | 작업을 더 자세히 설명 |
| Comprehensive prompt | 규칙 목록까지 포함한 가장 상세한 prompt |

분석 결과는 단순히 “긴 prompt가 항상 좋다”가 아니라는 점을 보여준다.

| 관찰 | 의미 |
|---|---|
| 상세 prompt에서 generation error 증가 | max context window size에 가까워지는 경우 발생 가능 |
| 덜 상세한 prompt는 excess item이 많음 | 불필요한 항목을 더 많이 추가할 수 있음 |
| 더 상세한 prompt는 excess item이 적음 | 규칙이 output을 제어하는 데 도움 |
| 더 상세한 prompt는 expected item 누락 증가 | 너무 제한적이면 필요한 항목을 놓칠 수 있음 |
| 가장 단순한 prompt는 hallucinated item 증가 | 맥락이 부족하면 존재하지 않는 항목 생성 가능 |

이 예시는 prompt 품질을 감각적으로 판단하는 대신, dataset과 metric을 통해 정량적으로 비교하는 방법을 보여준다.

---

# 9. Python 생태계와의 결합

Python SDK의 중요한 장점은 Python의 기존 open-source 생태계와 결합할 수 있다는 점이다.

세션에서는 다음 도구들이 자연스럽게 활용된다.

| 도구 | 역할 |
|---|---|
| Jupyter Notebook | prompt 실험과 분석 |
| Pandas | input/output/metric 저장과 분석 |
| matplotlib | 평가 결과 시각화 |
| Server model judge | output 품질 채점 |

이를 통해 Swift 앱에 기능을 넣기 전에 Python에서 prompt를 빠르게 실험하고, 결과를 수치화해 더 나은 prompt를 선택할 수 있다.

---

# 10. Next steps

세션의 마지막에서는 다음 단계가 제안된다.

1. Terminal에서 `fm` command line tool을 직접 사용해 보기
2. `fm`의 command와 option을 살펴보기
3. Foundation Models SDK for Python GitHub repository와 documentation 확인하기
4. Python SDK로 advanced workflow 만들어 보기
5. prompt가 어느 정도 동작하면 evaluation dataset을 만들고 결과를 정량화하기
6. 평가 결과를 바탕으로 prompt를 반복 개선하기

---

# 11. 개발자 체크 포인트

- `fm chat`으로 prompt 아이디어를 빠르게 검토
- `fm respond`를 shell script와 automation에 통합
- `fm schema object`와 structured output을 함께 사용
- 이미지 prompt가 필요한 경우 `--image` 옵션 검토
- 복잡한 문제는 Private Cloud Compute model과 on-device model 결과 비교
- Python SDK로 Swift 구현 전 prompt prototype 작성
- tool calling으로 모델이 실제 context를 조회하도록 구성
- guided generation으로 결과 구조를 안정화
- Jupyter Notebook 기반 evaluation pipeline 구축
- Pandas/DataFrame에 input, output, metric 저장
- judge model과 chart를 활용해 prompt별 성능 비교
- context window, generation error, hallucination, excess/missing item을 metric으로 추적

---

# 함께 보면 좋은 후속 세션 후보

- What’s new in the Foundation Models framework
- Build agentic app experiences with the Foundation Models framework
- Bring an LLM provider to the Foundation Models framework
- Build with the new Apple Foundation Model on Private Cloud Compute
- Code-along: Bring on-device intelligence to your app using Foundation Models
- Evaluate your AI-powered app
- Core AI 관련 세션

---

## 정리

이 세션은 Apple Foundation Models 활용 범위가 Swift 앱 내부에서 macOS command line과 Python workflow로 확장되었음을 보여준다.

`fm` CLI는 터미널에서 prompt를 빠르게 테스트하고 자동화 script에 모델 판단을 넣는 도구다. `fm chat`은 아이디어 탐색에 적합하고, `fm respond`는 script에서 inline response를 받아 처리하는 데 적합하다. schema 기반 structured output을 사용하면 모델 결과를 JSON으로 안정적으로 후처리할 수 있다.

Foundation Models SDK for Python은 Python 환경에서 on-device model을 사용할 수 있게 하며, tool calling과 guided generation을 지원한다. 특히 Jupyter Notebook, Pandas, matplotlib 같은 Python 생태계와 결합해 prompt를 정량적으로 평가하고 반복 개선할 수 있다는 점이 핵심이다.

결국 이 세션의 메시지는 Foundation Models를 앱 기능 구현에 바로 넣기 전에, `fm`과 Python SDK를 활용해 prompt를 빠르게 실험하고, 자동화하고, 평가한 뒤 더 안정적인 AI 기능을 만들라는 것이다.
