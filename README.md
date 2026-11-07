# TOCSG 코딩 테스트

React 19 + TypeScript + Vite + Tailwind CSS 로 두 문제(셔틀버스 운행, 창고에서 물건 가져오기)를 하나의 화면에서 입력·계산·확인할 수 있게 구현했습니다.
계산 로직은 UI 와 분리된 **순수 함수**로 두어 화면과 무관하게 검증할 수 있도록 했습니다.

## 1. 실행 방법

```bash
pnpm install
pnpm dev        # http://localhost:5173
pnpm build      # 타입 검사 + 프로덕션 빌드
pnpm lint       # ESLint (any 금지)
```

## 2. 프로젝트 구조

```
src/
├─ App.tsx                                  # 두 문제 섹션 배치
├─ components/
│   ├─ Table.tsx                            # 공용 제네릭 테이블 컴포넌트
│   └─ index.ts                             # barrel export
└─ feature/
    ├─ CalculateShuttleBusCosts.tsx         # 문제 1 화면 (입력·검증·결과 표시)
    ├─ shuttleBus/calculateShuttleBusRevenue.ts   # 문제 1 계산 로직 (순수 함수)
    ├─ CalculateWarehouseOutflows.tsx       # 문제 2 화면
    └─ warehouse/maxWarehouseValue.ts       # 문제 2 계산 로직 (순수 함수)
```

- 화면 컴포넌트는 입력 수집, 제한사항 검증, 결과 렌더링만 담당합니다.
- 계산 로직은 입력 객체를 받아 결과를 반환하는 함수이며 React 에 의존하지 않습니다.
