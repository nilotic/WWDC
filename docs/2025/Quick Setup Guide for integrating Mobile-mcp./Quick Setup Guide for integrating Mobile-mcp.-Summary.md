# Quick Setup Guide for integrating Mobile-mcp.

Quick Setup Guide for integrating Mobile- mcp.

목표 Mobile-mcp를 적용해서 LLM 으로 KurlyApp 을 제어하고자 함 .

해당 문서는 Claude 에 Mobile-mcp 를 적용하고 iOS Simulator 안에서 실행되는 KurlyApp 을 제 어하는 방법을 기술 함 .

적용 방법 Mobile-mcp 는 mcpserver 로 Claude, Cursor, Cline 등등 기본적인 AI agent 에 적용할 수 있도 록 지원함 .

(WindSurf 는 현재 MCP error -32602 에러가 발생하는 듯 ..

[image omitted: (blue star)] )→ 버그 수정 됨 .

- Claude 설치 https://claude.ai/download

- MCP Server 환경 설정 Claude > Settings > Developer tab > Edit Config 를 눌러 claude_desktop_config.json 파 일을 연다 .

- claude_desktop_config.json 파일에 아래 json 설정을 넣어 “filesystem”, “mobile-mcp” 를 추가한다 .

- { "mcpServers": { "filesystem": { "command": "npx", "args": [ "-y", "@modelcontextprotocol/server-filesystem", "/Users/{username}/Desktop", // username 에는 개인 PC 정보 "/Users/{username}/Downloads" // username 에는 개인 PC 정보 ] }, "mobile-mcp": { "command": "npx", "args": ["-y", "@mobilenext/mobile-mcp@latest"]

- } } }

- WebDriverAgent 설치 원하는 디렉토리에 WebDriverAgent 를 설치하고 git clone --depth 1 https://github.com/appium/WebDriverAgent.git cd WebDriverAgent command 를 통해 WebDriverAgentRunnder 를 실행한다 .

- xcodebuild -project WebDriverAgent.xcodeproj -scheme WebDriverAgentRunner - destination 'platform=iOS Simulator,name=iPhone 16 Pro' test # 주의할 점은 “name=iPhone 16 Pro” 전달인자에는 실제 테스트할 시뮬레이터명을 넣어함 .

- 사용 방법 Claude 를 재실행하고 , iOS Simulator 실행하고 , WebDriverAgent 를 실행했다면 LLM 으로 KurlyApp 을 제어하는 준비는 끝남 .

- 먼저 Claude Prompt 를 통해 사용 가능한 시뮬레이터 목록을 조회한다 .

- 실행가능한 iOS 시뮬레이터에서 컬리 앱을 실행시켜줘 .

- 정상적으로 연동 됐다면 , Simulator 에 KurlyApp 이 실행되어 Splash 화면이 뜨는 것을 확인할 수 있다 .

- Claude Prompt 를 이용해서 버튼 터치 , 스와이프 , 스크롤링 등등 원하는 동작을 제어하면 된다 .

- 나는 앱에서 서브탭 이동하는 기능 , 안정성 테스트를 하고 싶거든 ?

- 앱 상단에 보면 컬리추천 , 베스트 , 신상품 , 알뜰쇼핑 , 특가 / 혜택 서브탭이 있거든 ? 이 5 개 서브탭을 1000 회 계속 랜덤하게 계속 서브탭 변경을 해줘 서브탭 변경하는 시간은 0.1 초에서 0.5 초 사이로 해주고 , 중간중간에 스크롤도 쭉 내렸다가 올렸다가 , 살짝 내렸다가 올렸다가 서브탭 변경하는 식으로 테스트 해줘 시작 !

- [image omitted: test2.mov]
