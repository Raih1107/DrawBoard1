"use client";

import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { ChangeEvent, useEffect, useState } from "react";
import { useDebounceValue } from "usehooks-ts";
import qs  from "query-string";



export const SearchInput = () => {

    const router = useRouter();
    const [value, setValue] = useState("");
    const [debouncedValue] = useDebounceValue(value, 500);

    const handleChange = (e: ChangeEvent<HTMLInputElement> ) => {
        setValue(e.target.value);
    }

    useEffect(() => {
        const url = qs.stringifyUrl({
            url: "/",
            query: {
                search: debouncedValue,
            },
        }, {skipEmptyString: true, skipNull: true});

        router.push(url);

    }, [debouncedValue, router]);


    return(
        <div className="w-full relative">
            <Search 
                className="absolute top-1/2 left-3.5 transform -translate-y-1/2 text-slate-400 h-4 w-4"
            />
            <input 
                className="w-full max-w-[516px] pl-10 pr-4 py-2 rounded-xl text-sm text-slate-200 placeholder:text-slate-500 outline-none transition-all duration-200 focus:ring-2 focus:ring-indigo-500/50"
                style={{
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.08)",
                }}
                onFocus={e => (e.target.style.background = "rgba(255,255,255,0.09)")}
                onBlur={e => (e.target.style.background = "rgba(255,255,255,0.06)")}
                placeholder="Search boards..."
                onChange={handleChange}
                value={value}
            />
        </div>
    )
}