import { useState } from "react";
import clsx from "clsx";
import { Table } from "@/components";
import type { TableColumn } from "@/components";
import { maxWarehouseValue } from "@/feature/warehouse/maxWarehouseValue";

const MAX_PRODUCT = 50;   // N 상한: 상자 수
const MAX_CARRY = 30;     // K 상한: 상자당 물건 수
const MAX_VALUE = 100;    // vi 상한: 물건 가치

type BoxItemRow = {
    order: number;
    value: number;
};

type BoxRow = {
    boxNo: number;
    values: string;
    count: number;
};

const BOX_ITEM_COLUMNS: TableColumn<BoxItemRow>[] = [
    { key: "order", header: "순번 (위→아래)", width: 110 },
    { key: "value", header: "물건 가치", width: 100 },
];

const BOX_COLUMNS: TableColumn<BoxRow>[] = [
    { key: "boxNo", header: "상자", width: 80 },
    { key: "values", header: "물건 가치 (위→아래)" },
    { key: "count", header: "물건 수", width: 80 },
];

const toNumber = (value: string) => Number(value.replace(/\D/g, ""));

const CalculateWarehouseOutflows = () => {
    const [productGroup, setProductGroup] = useState<number[][]>([]);
    const [valueGroup, setValueGroup] = useState<number[]>([]);
    const [valueState, setValueState] = useState<number>(0);
    const [pickCount, setPickCount] = useState<number>(0);
    const [maxValue, setMaxValue] = useState<number | null>(null);
    const [errorMessage, setErrorMessage] = useState<string>("");

    const boxSize = productGroup[0]?.length ?? 0;         // K: 첫 상자의 물건 개수
    const totalItems = productGroup.length * boxSize;     // N·K

    const totalValue = () => {
        if (productGroup.length < 1) {
            setErrorMessage("상자를 1개 이상 추가해주세요.");
            setMaxValue(null);
            return;
        }
        if (valueGroup.length > 0) {
            setErrorMessage("작성 중인 상자가 있습니다. 출고 목록에 추가하거나 비워주세요.");
            setMaxValue(null);
            return;
        }
        if (pickCount < 1 || pickCount > totalItems) {
            setErrorMessage(`출고 품목 수는 1 이상 ${totalItems} 이하여야 합니다.`);
            setMaxValue(null);
            return;
        }
        setErrorMessage("");
        setMaxValue(maxWarehouseValue({ boxes: productGroup, pick: pickCount }));
    };

    const addValueGroupHandler = () => {
        if (valueState <= 0) return;
        if (valueState > MAX_VALUE) {
            setErrorMessage(`물건 가치는 1 이상 ${MAX_VALUE} 이하여야 합니다.`);
            return;
        }
        if (valueGroup.length >= MAX_CARRY) {
            setErrorMessage(`상자 하나에는 물건을 ${MAX_CARRY}개까지만 넣을 수 있습니다.`);
            return;
        }
        if (productGroup.length > 0 && valueGroup.length >= boxSize) {
            setErrorMessage(`모든 상자의 물건 수는 첫 상자와 같은 ${boxSize}개여야 합니다.`);
            return;
        }
        setErrorMessage("");
        setValueGroup((prev: number[]) => [...prev, valueState]);
    };

    const addProductGroupHandler = () => {
        if (valueGroup.length <= 0) return;
        if (productGroup.length >= MAX_PRODUCT) {
            setErrorMessage(`상자는 ${MAX_PRODUCT}개까지만 추가할 수 있습니다.`);
            return;
        }
        if (productGroup.length > 0 && valueGroup.length !== boxSize) {
            setErrorMessage(`모든 상자의 물건 수는 첫 상자와 같은 ${boxSize}개여야 합니다. (현재 ${valueGroup.length}개)`);
            return;
        }
        setErrorMessage("");
        setProductGroup((prev: number[][]) => [...prev, valueGroup])
        setValueGroup([]);
    };

    const boxItemRows: BoxItemRow[] = valueGroup.map((value, index) => ({ order: index + 1, value }));
    const boxRows: BoxRow[] = productGroup.map((box, index) => ({
        boxNo: index + 1,
        values: box.join(", "),
        count: box.length,
    }));

    return <div className={clsx(
        "flex",
        "flex-col",
        "gap-4"
    )}>
        <table className={clsx("block", "w-full")}>
            <thead className={clsx("block", "w-full")}>
                <tr className={InputHeadRow}>
                    <th scope="col" className={InputColSetting}>출고 품목 수 (P)</th>
                    <th scope="col" className={InputColSetting}>가치 입력 (위에서부터 순서대로)</th>
                    <th scope="col" className={InputColAction}>Actions</th>
                </tr>
            </thead>
            <tbody className={clsx("block", "w-full")}>
                <tr className={InputBodyRow}>
                    <td className={InputColSetting}>
                        <input
                            id="pick_product"
                            type="text"
                            inputMode="numeric"
                            aria-label="출고 품목 수 (P)"
                            value={pickCount}
                            onChange={(e) => setPickCount(toNumber(e.target.value))}
                            className={clsx(
                                "border border-[#2563BA] rounded-[2.8px]",
                                "w-50 h-7.5",
                                "p-[0px_6px] box-border",
                            )}
                        />
                    </td>
                    <td className={InputColSetting}>
                        <input
                            id="item_value"
                            type="text"
                            inputMode="numeric"
                            aria-label="가치 입력 (위에서부터 순서대로)"
                            value={valueState}
                            onChange={(e) => setValueState(toNumber(e.target.value))}
                            className={clsx(
                                "border border-[#2563BA] rounded-[2.8px]",
                                "w-50 h-7.5",
                                "p-[0px_6px] box-border",
                            )}
                        />
                    </td>
                    <td className={InputColAction}>
                        <div className={clsx(
                            "flex",
                            "items-center",
                            "gap-2"
                        )}>
                            <button
                                type="button"
                                className={clsx(
                                    "w-50 h-7.5 bg-[#2563BA]",
                                    "text-[#FFFFFF]",
                                    "rounded-[2.8px]",
                                    "cursor-pointer",
                                    "select-none"
                                )}
                                onClick={addValueGroupHandler}
                            >
                                출고 품 추가
                            </button>
                            <button
                                type="button"
                                className={clsx(
                                    "w-50 h-7.5 bg-[#2563BA]",
                                    "text-[#FFFFFF]",
                                    "rounded-[2.8px]",
                                    "cursor-pointer",
                                    "select-none"
                                )}
                                onClick={addProductGroupHandler}
                            >
                                출고 목록 추가
                            </button>
                        </div>
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
                작성 중인 상자 (물건 {valueGroup.length}개)
            </p>
            <Table columns={BOX_ITEM_COLUMNS} rows={boxItemRows} rowKey="order" emptyText="추가된 물건이 없습니다." />
        </div>

        <div className={clsx(
            "flex",
            "flex-col",
            "gap-1"
        )}>
            <p className={clsx(
                "text-[14px]",
                "font-bold"
            )}>
                출고 목록 (N={productGroup.length}, K={boxSize})
            </p>
            <Table columns={BOX_COLUMNS} rows={boxRows} rowKey="boxNo" emptyText="추가된 상자가 없습니다." />
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
            onClick={totalValue}
        >
            최대 가치 구하기
        </button>
        {errorMessage && (
            <p className={clsx(
                "text-[14px]",
                "text-[#FF3B30]"
            )}>
                {errorMessage}
            </p>
        )}
        {maxValue !== null && (
            <p className={clsx(
                "text-[16px]",
                "font-bold"
            )}>
                최대 가치: {maxValue}
            </p>
        )}
    </div>
}
export default CalculateWarehouseOutflows;

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
const InputColAction = clsx("w-102", "shrink-0", "text-left");
