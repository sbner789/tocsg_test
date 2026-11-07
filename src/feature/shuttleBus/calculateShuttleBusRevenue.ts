type ShuttleBusInput = {
    runs: number;        // R: 운행 횟수
    capacity: number;    // K: 최대 탑승 인원
    groups: number[];    // g0 … gN-1 (줄 앞부터)
};

type RunResult = {
    load: number;        // 이번 운행 탑승 인원 (= 수익)
    boarded: number[];   // 탑승한 일행 (순서대로)
    nextQueue: number[]; // 운행 후 줄
};

type ShuttleBusRunLog = {
    runIndex: number;      // 1부터 시작하는 운행 번호
    queueBefore: number[];
    boarded: number[];
    load: number;
    queueAfter: number[];
};

// 같은 줄 상태가 반복되어 실제로 돌리지 않고 건너뛴 구간
type ShuttleBusRepeat = {
    fromRun: number;       // 건너뛴 첫 운행 번호
    toRun: number;         // 건너뛴 마지막 운행 번호
    cycleLength: number;   // 반복 주기 (운행 횟수)
    cycleRevenue: number;  // 주기당 수익
    revenue: number;       // 건너뛴 구간의 총 수익
};

export type ShuttleBusResult = {
    revenue: number;
    runLogs: ShuttleBusRunLog[];   // 실제로 돌린 운행만 기록 (최대 2N 안팎)
    repeat: ShuttleBusRepeat | null;
};

// 운행 1회: 줄 앞에서부터 탑승시키다가 못 타는 일행이 나오면 즉시 출발.
// 탑승한 일행은 순서를 유지한 채 줄 맨 뒤로 이동한다.
const runOnce = (queue: number[], capacity: number): RunResult => {
    let load = 0;
    let boardedCount = 0;

    while (boardedCount < queue.length && load + queue[boardedCount] <= capacity) {
        load += queue[boardedCount];
        boardedCount += 1;
    }

    return {
        load,
        boarded: queue.slice(0, boardedCount),
        nextQueue: [...queue.slice(boardedCount), ...queue.slice(0, boardedCount)],
    };
};

export const simulateShuttleBus = ({ runs, capacity, groups }: ShuttleBusInput): ShuttleBusResult => {
    if (groups.some((size) => size < 1 || size > capacity)) {
        throw new Error("일행 인원은 1 이상 K 이하여야 합니다.");
    }

    const seen = new Map<string, { runIndex: number; revenue: number }>(); // 줄 상태 → 처음 본 시점
    const runLogs: ShuttleBusRunLog[] = [];
    let repeat: ShuttleBusRepeat | null = null;
    let queue = [...groups];
    let revenue = 0;
    let runIndex = 0;

    while (runIndex < runs) {
        const key = queue.join(",");
        const prev = seen.get(key);

        if (prev) {
            // 같은 줄 상태가 다시 나왔다 → 이후는 같은 패턴 반복
            const cycleLength = runIndex - prev.runIndex;
            const cycleRevenue = revenue - prev.revenue;
            const skippedCycles = Math.floor((runs - runIndex) / cycleLength);

            if (skippedCycles > 0) {
                repeat = {
                    fromRun: runIndex + 1,
                    toRun: runIndex + skippedCycles * cycleLength,
                    cycleLength,
                    cycleRevenue,
                    revenue: skippedCycles * cycleRevenue,
                };
                revenue += repeat.revenue;
                runIndex += skippedCycles * cycleLength;
            }
            seen.clear(); // 나머지(cycleLength 미만)는 그대로 돌린다
            if (runIndex >= runs) break;
        } else {
            seen.set(key, { runIndex, revenue });
        }

        const { load, boarded, nextQueue } = runOnce(queue, capacity);
        runLogs.push({ runIndex: runIndex + 1, queueBefore: queue, boarded, load, queueAfter: nextQueue });
        revenue += load;
        queue = nextQueue;
        runIndex += 1;
    }

    return { revenue, runLogs, repeat };
};
