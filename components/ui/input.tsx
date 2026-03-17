import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "file:text-slate-200 placeholder:text-slate-500 selection:bg-indigo-500 selection:text-white bg-white/5 border-white/10 flex h-10 w-full min-w-0 rounded-xl border px-3 py-1 text-base shadow-sm transition-all outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        "focus-visible:border-indigo-500 focus-visible:ring-indigo-500/30 focus-visible:ring-4",
        className
      )}
      {...props}
    />
  )
}

export { Input }
