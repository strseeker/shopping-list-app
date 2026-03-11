# 🛒 쇼핑 리스트 앱

바닐라 JS로 만든 쇼핑 리스트 웹 앱입니다.

## 기능

- 아이템 추가 (버튼 클릭 또는 Enter 키)
- 완료 체크 / 해제
- 아이템 삭제
- 완료 항목 일괄 삭제
- 전체 / 미완료 / 완료 필터
- localStorage로 데이터 저장 (새로고침 후에도 유지)

## 사용 방법

`shopping-list.html` 파일을 브라우저에서 열면 바로 실행됩니다.

## 테스트 실행

```bash
npm install
npx playwright install chromium
node test-shopping.mjs
```

## 파일 구조

```
├── shopping-list.html   # 메인 앱
├── test-shopping.mjs    # Playwright 자동 테스트
├── package.json
├── PRD_step1.md         # 문제 정의 및 현황 분석
├── PRD_step2.md         # 전략 수립 및 우선순위 매트릭스
└── PRD_step3.md         # 구현 세부 계획 및 검증
```
