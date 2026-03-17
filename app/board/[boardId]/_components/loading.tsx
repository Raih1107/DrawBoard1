import { Loader } from "lucide-react"
import { InfoSkeleton } from "./info";
import { ParticipantsSkeleton } from "./participants"
import { ToolbarSkeleton } from "./toolbar"

export const Loading = () => {
    return(
        <main 
            className="h-full w-full relative touch-none flex items-center justify-center"
            style={{
                backgroundColor: "#0f1117",
                backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.05) 1px, transparent 0)`,
                backgroundSize: "32px 32px"
            }}
        >
            <Loader className="h-10 w-10 text-indigo-500 animate-spin" />
            <InfoSkeleton />
            <ParticipantsSkeleton />
            <ToolbarSkeleton />
        </main>
    )
}