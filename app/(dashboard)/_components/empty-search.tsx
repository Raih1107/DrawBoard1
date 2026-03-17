import Image from "next/image";

export const EmptySearch = () => {


    return(
        <div className="h-full flex flex-col items-center justify-center gap-y-4">
            <div className="relative w-[180px] h-[180px] mb-2">
                <div className="absolute inset-0 bg-indigo-500/10 rounded-full blur-[50px]" />
                <Image 
                    src="/empty-search.svg"
                    fill
                    alt="Empty Search"
                    className="object-contain filter drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]"
                />
            </div>
            <h2 className="text-2xl font-bold text-white mt-2">
                No results found
            </h2>
            <p className="text-slate-400 text-sm">
                Try searching for something else
            </p>
            
        </div>
    )
}