import { List } from "./list"
import { NewButton } from "./new-button"

export const Sidebar = () => {
    return(
        <aside className="fixed z-[1] left-0 h-full w-[60px] flex flex-col p-3 gap-y-4 text-white"
            style={{
                background: "linear-gradient(180deg, #0d1117 0%, #111827 100%)",
                borderRight: "1px solid rgba(255,255,255,0.05)"
            }}
        >
            <List />
            <NewButton />
        </aside>
    )
}