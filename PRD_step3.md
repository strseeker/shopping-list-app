# PRD Step 3: 구현 세부 계획 및 검증

> 이전 단계: PRD_step2.md (전략 수립 및 우선순위 매트릭스)

---

## 1. Phase 1 구현 세부 계획 (즉시 실행)

### 1-1. 케이스 스터디 작성 가이드

각 프로젝트마다 아래 템플릿으로 콘텐츠 작성:

```markdown
## 프로젝트명
**한 줄 요약**: [프로젝트를 한 문장으로]
**예상 읽기 시간**: X분

### 배경 & 동기
- 어떤 문제를 보았나?
- 왜 이 프로젝트를 만들기로 했나?

### 기술 스택
[사용 기술 배지 + 선택 이유]

### 개발 과정
1. 기획 단계: [주요 결정 사항]
2. 설계 단계: [아키텍처 다이어그램 또는 설명]
3. 개발 단계: [핵심 구현 내용]
4. 배포: [배포 방법]

### 기술적 도전 & 해결
- **문제**: [어려웠던 점]
- **해결**: [어떻게 해결했나]

### 결과 & 회고
- 성과: [정량적 지표 또는 달성 목표]
- 배운 점: [기술적 / 비기술적]
- 개선할 점: [솔직한 회고]
```

### 1-2. 내비게이션 개선 구현

```jsx
// 프로젝트 하단 내비게이션 컴포넌트 예시
const ProjectNav = ({ prev, next }) => (
  <div className="project-nav">
    {prev && <Link href={prev.url}>← {prev.title}</Link>}
    {next && <Link href={next.url}>{next.title} →</Link>}
  </div>
);
```

### 1-3. 예상 읽기 시간 계산

```js
// 평균 읽기 속도: 200단어/분 (한국어 기준)
const calcReadTime = (text) => {
  const wordCount = text.trim().split(/\s+/).length;
  return Math.ceil(wordCount / 200); // 분 단위
};
```

---

## 2. Phase 2 구현 세부 계획 (단기)

### 2-1. 읽기 진행률 바

```jsx
// scroll 이벤트 기반 진행률 바
const ReadingProgress = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const total = document.body.scrollHeight - window.innerHeight;
      setProgress((window.scrollY / total) * 100);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="reading-progress" style={{ width: `${progress}%` }} />
  );
};
```

### 2-2. TOC 사이드바 구현 방향

- `IntersectionObserver`로 현재 보고 있는 섹션 감지
- 사이드바에서 해당 항목 하이라이트
- 클릭 시 smooth scroll

### 2-3. 기술 스택 인터랙티브 호버

- 기술 아이콘 위에 마우스 올리면 툴팁 표시
- 툴팁 내용: 기술 이름, 사용 이유, 숙련도 표시

---

## 3. Phase 3 구현 세부 계획 (중기)

### 3-1. 블로그 섹션 구조

```
/blog
  /[slug]
    - 제목, 날짜, 예상 읽기 시간
    - 태그 (React, 성능 최적화, 회고 등)
    - 목차
    - 본문
    - 관련 포스트
```

콘텐츠 아이디어:
- 기술 심층 분석 (예: "왜 Zustand를 선택했나")
- 프로젝트 회고록
- 학습 노트 / 삽질 기록
- 포트폴리오 제작기

### 3-2. 방문자 유형별 경로

```
랜딩 페이지 → "저는 ___입니다" 선택
  ├── 채용 담당자 → 핵심 프로젝트 3개 + 이력서
  ├── 개발자     → 기술 블로그 + GitHub 통합
  └── 클라이언트 → 완성 결과물 쇼케이스
```

---

## 4. 측정 및 검증 계획

### 실험 설계
- **Before 기간**: 변경 전 2주 데이터 수집
- **After 기간**: 변경 후 2주 데이터 비교
- **유의 수준**: 방문자 수 50명 이상 시 유효

### 주간 체크리스트
- [ ] GA4 평균 세션 시간 확인
- [ ] Clarity 히트맵으로 주요 클릭 영역 확인
- [ ] 스크롤 깊이 분포 확인
- [ ] 이탈률 변화 확인

### 성공 기준 (2개월 후)

| 지표 | 현재 | 목표 |
|------|------|------|
| 평균 세션 지속 시간 | X분 | 2X분 |
| 페이지뷰/세션 | Y | 1.5Y |
| 이탈률 | Z% | Z-15% |
| 스크롤 깊이 70% 도달 | A% | A+20% |

---

## 5. 최종 요약

체류 시간 2배 달성의 핵심은:
1. **스토리텔링** - 단순 나열이 아닌 케이스 스터디
2. **연결** - 다음 콘텐츠로 자연스럽게 이어지는 흐름
3. **참여** - 읽고, 클릭하고, 탐색하게 만드는 요소
4. **측정** - 데이터 기반 반복 개선

> Phase 1+2 완료 시 체류 시간 2배 달성 가능 (예상)
