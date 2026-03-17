import { Button } from "@/components/ui/button"
import { api } from "@/convex/_generated/api";
import { useApiMutation } from "@/hooks/use-api-mutation";
import { useOrganization } from "@clerk/nextjs";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";



export const EmptyBoards = () => {

    const router = useRouter();

    const { organization } = useOrganization();

    const { mutate, pending} = useApiMutation(api.board.create);

    const onClick = () => {

        if(!organization) return ;

        mutate({
            orgId: organization?.id,
            title: "Untitled",
        })
        .then((id) => {
            toast.success("Board created");
            router.push(`/board/${id}`);
            // todo : redirect to board{id}
        })
        .catch(() => toast.error("Failed to create board"))
    };

    return(
        <div className="h-full flex flex-col items-center justify-center">
            <div className="relative w-[200px] h-[200px] mb-6">
                <div className="absolute inset-0 bg-indigo-500/10 rounded-full blur-[60px]" />
                <Image 
                    src="/Saly-26.svg"
                    fill
                    alt="Empty"
                    className="object-contain filter drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]"
                />
            </div>
            <h2 className="text-2xl font-bold text-white mt-2">
                Create your first board
            </h2>
            <p className="text-slate-400 text-sm mt-3 max-w-[300px] text-center">
                Start plotting your ideas by creating a new board for your organization
            </p>

            <div className="mt-8">
                <Button 
                    disabled={pending} 
                    onClick={onClick} 
                    size="lg"
                    className="bg-indigo-600 hover:bg-indigo-500 text-white border-0 shadow-[0_0_20px_rgba(99,102,241,0.3)] transition-all hover:shadow-[0_0_30px_rgba(99,102,241,0.5)]"
                >
                    Create board
                </Button>
            </div>
        </div>
    )
}