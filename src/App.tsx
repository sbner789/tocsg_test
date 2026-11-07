import CalculateShuttleBusCosts from "@/feature/CalculateShuttleBusCosts"
import CalculateWarehouseOutflows from "@/feature/CalculateWarehouseOutflows"
import clsx from "clsx"

const App = () => {
  return (
    <main 
      className={clsx(
        "p-12.5",
        "flex",
        "flex-wrap",
        "justify-between",
        "gap-10"
      )}
    >
      <section className={clsx("flex", "flex-col", "gap-5")}>
        <h2 className={clsx( "text-[28px]" )}>문제1: 셔틀버스 운행</h2>
        <CalculateShuttleBusCosts />
      </section>
      <section className={clsx("flex", "flex-col", "gap-5")}>
        <h2 className={clsx( "text-[28px]" )}>문제2: 창고에서 물건 가져오기</h2>
        <CalculateWarehouseOutflows />
      </section>
    </main>
  )
}
export default App
