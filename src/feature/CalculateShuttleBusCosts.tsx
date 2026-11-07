import { useEffect, useState } from "react";
import clsx from "clsx";
import { Table } from "@/components";
import type { TableColumn } from "@/components";
import { simulateShuttleBus } from "@/feature/shuttleBus/calculateShuttleBusRevenue";
import type { ShuttleBusResult } from "@/feature/shuttleBus/calculateShuttleBusRevenue";

const MAX_BOARD = 10000;        // K 상한
const MAX_FREQUENCY = 1000000;  // R 상한
const MAX_GROUP = 100;          // N 상한

type BusSetting = {
    runs: number;       // R: 운행 횟수
    capacity: number;   // K: 최대 탑승 인원
};

const INITIAL_BUS_SETTING: BusSetting = {
    runs: 0,
    capacity: 0,
};

type QueueRow = {
    order: number;
    size: number;
};

type RunRow = {
    runLabel: string;
    queueBefore: string;
    boarded: string;
    load: number;
    queueAfter: string;
};

const QUEUE_COLUMNS: TableColumn<QueueRow>[] = [
    { key: "order", header: "순번", width: 60 },
    { key: "size", header: "일행 인원", width: 100 },
];

const RUN_COLUMNS: TableColumn<RunRow>[] = [
    { key: "runLabel", header: "운행", width: 120 },
    { key: "queueBefore", header: "운행 전 줄" },
    { key: "boarded", header: "탑승 일행" },
    { key: "load", header: "탑승 인원", width: 90 },
    { key: "queueAfter", header: "운행 후 줄" },
];

const joinQueue = (queue: number[]) => queue.join(", ");

// 실제로 돌린 운행 기록 사이에 "반복 구간" 행을 끼워 넣는다
const toRunRows = ({ runLogs, repeat }: ShuttleBusResult): RunRow[] => {
    const logRows: RunRow[] = runLogs.map((log) => ({
        runLabel: `${log.runIndex}회`,
        queueBefore: joinQueue(log.queueBefore),
        boarded: joinQueue(log.boarded),
        load: log.load,
        queueAfter: joinQueue(log.queueAfter),
    }));

    if (!repeat) return logRows;

    const repeatRow: RunRow = {
        runLabel: `${repeat.fromRun}~${repeat.toRun}회`,
        queueBefore: "-",
        boarded: `${repeat.cycleLength}회 주기 반복 (주기당 ${repeat.cycleRevenue}명)`,
        load: repeat.revenue,
        queueAfter: "-",
    };
    const before = logRows.filter((_, index) => runLogs[index].runIndex < repeat.fromRun);
    const after = logRows.filter((_, index) => runLogs[index].runIndex > repeat.toRun);

    return [...before, repeatRow, ...after];
};

const toNumber = (value: string) => Number(value.replace(/\D/g, ""));

const CalculateShuttleBusCosts = () => {
    const [group, setGroup] = useState<number[]>([]);
    const [groupState, setGroupState] = useState<number>(0);
    const [busSetting, setBusSetting] = useState<BusSetting>(INITIAL_BUS_SETTING);
    const [result, setResult] = useState<ShuttleBusResult | null>(null);
    const [errorMessage, setErrorMessage] = useState<string>("");

    const validate = (): string => {
        if (busSetting.runs < 1 || busSetting.runs > MAX_FREQUENCY) return `운행 횟수는 1 이상 ${MAX_FREQUENCY} 이하여야 합니다.`;
        if (busSetting.capacity < 1 || busSetting.capacity > MAX_BOARD) return `최대 탑승 인원은 1 이상 ${MAX_BOARD} 이하여야 합니다.`;
        if (group.length < 1 || group.length > MAX_GROUP) return `일행은 1개 이상 ${MAX_GROUP}개 이하여야 합니다.`;
        if (group.some((size) => size > busSetting.capacity)) return "최대 탑승 인원보다 많은 일행이 있습니다.";
        return "";
    };

    const shuttleBusOperation = () => {
        const message = validate();
        if (message) {
            setErrorMessage(message);
            setResult(null);
            return;
        }
        setErrorMessage("");
        setResult(simulateShuttleBus({
            runs: busSetting.runs,
            capacity: busSetting.capacity,
            groups: group,
        }));
    };

    const handleBusSettingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setBusSetting((prev) => ({
            ...prev,
            [id]: toNumber(value),
        }));
    };

    const addGroupCount = () => {
        setGroupState((prev) => prev + 1);
    };

    const subtractGroupCount = () => {
        if (groupState <= 0) return;
        setGroupState((prev) => prev - 1)
    };

    const addGroupHandler = () => {
        if (groupState <= 0) return;
        setGroup((prev: number[]) => [...prev, groupState]);
    };

    useEffect(() => {
        console.log({ group });
    }, [groupState, group])

    const busSettingInputs = [
        { id: "runs", labelText: "운행 횟수 (R)", value: busSetting.runs },
        { id: "capacity", labelText: "최대 탑승 인원 (K)", value: busSetting.capacity },
    ];

    const queueRows: QueueRow[] = group.map((size, index) => ({ order: index + 1, size }));
    const runRows: RunRow[] = result ? toRunRows(result) : [];

    return <div className={clsx(
        "flex",
        "flex-col",
        "gap-4"
    )}>
        <table className={clsx("block", "w-full")}>
            <thead className={clsx("block", "w-full")}>
                <tr className={InputHeadRow}>
                    {
                        busSettingInputs.map((el) => {
                            return (
                                <th key={el.id} scope="col" className={InputColSetting}>{el.labelText}</th>
                            )
                        })
                    }
                    <th scope="col" className={InputColSelect}>탑승 인원 선택</th>
                    <th scope="col" className={InputColAction}>Actions</th>
                </tr>
            </thead>
            <tbody className={clsx("block", "w-full")}>
                <tr className={InputBodyRow}>
                    {
                        busSettingInputs.map((el) => {
                            return (
                                <td key={el.id} className={InputColSetting}>
                                    <input
                                        id={el.id}
                                        type="text"
                                        inputMode="numeric"
                                        aria-label={el.labelText}
                                        value={el.value}
                                        onChange={handleBusSettingChange}
                                        className={clsx(
                                            "border border-[#2563BA] rounded-[2.8px]",
                                            "w-50 h-7.5",
                                            "p-[0px_6px] box-border",
                                        )}
                                    />
                                </td>
                            )
                        })
                    }
                    <td className={InputColSelect}>
                        <div className={clsx(
                            "flex",
                            "items-center"
                        )}>
                            <input
                                type="text"
                                aria-label="탑승 인원 선택"
                                value={groupState}
                                onChange={(e) => setGroupState(Number(e.target.value))}
                                className={clsx(
                                    "border border-[#2563BA] rounded-[2.8px_0px_0px_2.8px] border-r-0",
                                    "w-50 h-7.5",
                                    "p-[0px_6px] box-border",
                                )}
                            />
                            <button
                                type="button"
                                className={clsx(
                                    "border border-[#2563BA] border-r-0",
                                    "w-7.5 h-7.5",
                                    "cursor-pointer",
                                    "select-none"
                                )}
                                onClick={addGroupCount}
                            >+</button>
                            <button
                                type="button"
                                className={clsx(
                                    "border border-[#2563BA] rounded-[0px_2.8px_2.8px_0px]",
                                    "w-7.5 h-7.5",
                                    "cursor-pointer",
                                    "select-none"
                                )}
                                onClick={subtractGroupCount}
                            >-</button>
                        </div>
                    </td>
                    <td className={InputColAction}>
                        <button
                            type="button"
                            className={clsx(
                                "w-50 h-7.5 bg-[#2563BA]",
                                "text-[#FFFFFF]",
                                "rounded-[2.8px]",
                                "cursor-pointer",
                                "select-none"
                            )}
                            onClick={addGroupHandler}
                        >
                            탑승 일행 추가
                        </button>
                    </td>
                </tr>
            </tbody>
        </table>

        <div className={clsx(
            "flex",
            "flex-col",
            "gap-1",
            "w-100"
        )}>
            <p className={clsx(
                "text-[14px]",
                "font-bold"
            )}>
                현재 줄 (N={group.length})
            </p>
            <Table columns={QUEUE_COLUMNS} rows={queueRows} rowKey="order" emptyText="추가된 일행이 없습니다." />
        </div>

        <button
            type="button"
            className={clsx(
                "w-50 h-7.5 bg-[#2563BA]",
                "text-[#FFFFFF]",
                "rounded-[2.8px]",
                "cursor-pointer",
                "select-none"
            )}
            onClick={shuttleBusOperation}>
                총 수익 구하기
            </button>
        {errorMessage && (
            <p className={clsx(
                "text-[14px]",
                "text-[#FF3B30]"
            )}>
                {errorMessage}
            </p>
        )}
        {result && (
            <div className={clsx(
                "flex",
                "flex-col",
                "gap-1"
            )}>
                <p className={clsx(
                    "text-[16px]",
                    "font-bold"
                )}>
                    총 수익: {result.revenue} 유로
                </p>
                <Table columns={RUN_COLUMNS} rows={runRows} rowKey="runLabel" />
            </div>
        )}
    </div>
}
export default CalculateShuttleBusCosts;

//style configuration
const InputRowLayout = clsx(
    "flex", 
    "gap-2", 
    "px-2"
);
const InputHeadRow = clsx(
    InputRowLayout, 
    "bg-[#EBEFF3]",
    "border-t border-t-[#2563BA]",
    "border-b border-b-[#2563BA]",
    "h-8", 
    "items-center",
    "font-bold", 
    "text-[14px]"
);
const InputBodyRow = clsx(
    InputRowLayout, 
    "py-2"
);
const InputColSetting = clsx(
    "w-50", 
    "shrink-0", 
    "text-left"
);
const InputColSelect = clsx("w-65", "shrink-0", "text-left");
const InputColAction = clsx("w-[50", "shrink-0", "text-left");
