type WarehouseInput = {
    boxes: number[][];   // boxes[i][j] = i번째 상자의 위에서 j번째 물건 가치
    pick: number;        // P: 꺼낼 물건 수
};

// 상자 하나의 누적합: prefix[j] = 위에서 j개 꺼낼 때 가치 (prefix[0] = 0)
// "위에 있는 물건부터 순서대로" 제약이 이 값 하나로 표현된다.
const toPrefixSums = (box: number[]): number[] => {
    const prefix: number[] = [0];
    for (const value of box) {
        prefix.push(prefix[prefix.length - 1] + value);
    }
    return prefix;
};

export const maxWarehouseValue = ({ boxes, pick }: WarehouseInput): number => {
    const totalItems = boxes.reduce((acc, box) => acc + box.length, 0);
    if (pick < 1 || pick > totalItems) {
        throw new Error("꺼낼 물건 수는 1 이상 전체 물건 수 이하여야 합니다.");
    }

    // dp[p] = 지금까지 본 상자들에서 정확히 p개를 꺼냈을 때의 최대 가치 (-Infinity = 불가능)
    let dp: number[] = Array.from({ length: pick + 1 }, () => Number.NEGATIVE_INFINITY);
    dp[0] = 0;

    for (const box of boxes) {
        const prefix = toPrefixSums(box);
        const next: number[] = Array.from({ length: pick + 1 }, () => Number.NEGATIVE_INFINITY);

        for (let p = 0; p <= pick; p++) {
            if (dp[p] === Number.NEGATIVE_INFINITY) continue;

            for (let j = 0; j < prefix.length && p + j <= pick; j++) {
                const candidate = dp[p] + prefix[j];
                if (candidate > next[p + j]) next[p + j] = candidate;
            }
        }

        dp = next;
    }

    return dp[pick];
};
