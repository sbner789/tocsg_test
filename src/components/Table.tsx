import type { ReactNode } from "react";
import clsx from "clsx";

export type TableColumn<T> = {
    key: keyof T;
    header: string;
    width?: number;                 
    render?: (row: T) => ReactNode;
};

type TableProps<T extends Record<string, unknown>> = {
    columns: TableColumn<T>[];
    rows: T[];
    rowKey: keyof T;
    emptyText?: string;
};

const Table = <T extends Record<string, unknown>>({ columns, rows, rowKey, emptyText = "없음" }: TableProps<T>) => {
    const cellClass = (column: TableColumn<T>) => (column.width !== undefined ? ColFixed : ColContent);
    const cellStyle = (column: TableColumn<T>) => (column.width !== undefined ? { width: `${column.width}px` } : undefined);

    return (
        <table className={clsx("block", "w-full")}>
            <thead className={clsx("block", "w-full")}>
                <tr className={TableHeadRow}>
                    {columns.map((column) => (
                        <th
                            key={String(column.key)}
                            scope="col"
                            className={clsx(cellClass(column), "text-left")}
                            style={cellStyle(column)}
                        >
                            {column.header}
                        </th>
                    ))}
                </tr>
            </thead>
            <tbody className={clsx("block", "w-full")}>
                {rows.length === 0 ? (
                    <tr className={clsx("flex", "px-[8px]")}>
                        <td className={EmptyRow}>{emptyText}</td>
                    </tr>
                ) : (
                    rows.map((row) => (
                        <tr key={String(row[rowKey])} className={TableBodyRow}>
                            {columns.map((column) => (
                                <td
                                    key={String(column.key)}
                                    className={cellClass(column)}
                                    style={cellStyle(column)}
                                >
                                    {column.render ? column.render(row) : String(row[column.key])}
                                </td>
                            ))}
                        </tr>
                    ))
                )}
            </tbody>
        </table>
    );
};
export default Table;

//style configuration
const RowLayout = clsx(
    "flex",
    "gap-[8px]",
    "px-[8px]"
);
const TableHeadRow = clsx(
    RowLayout,
    "bg-[#EBEFF3]",
    "border-t border-t-[#2563BA]",
    "border-b border-b-[#2563BA]",
    "h-[32px]",
    "items-center",
    "font-bold",
    "text-[14px]"
);
const TableBodyRow = clsx(
    RowLayout,
    "items-center",
    "border-b border-b-[#EBEFF3]",
    "min-h-[32px]",
    "py-[4px]",
    "text-[14px]"
);
const ColFixed = clsx(
    "shrink-0",
    "whitespace-nowrap"
);
const ColContent = clsx(
    "flex-1",
    "min-w-0",
    "break-all"
);
const EmptyRow = clsx(
    "py-[8px]",
    "text-[14px]",
    "text-[#8A94A0]"
);
