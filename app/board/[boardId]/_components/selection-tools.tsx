"use client";

import { useSelectionBounds } from "@/hooks/use-selection-bounds";
import { Camera, Color } from "@/types/canvas";
import { useSelf } from "@liveblocks/react";
import { memo } from "react";
import { ColorPicker } from "./color-picker";
import { useMutation } from "@liveblocks/react";
import { useDeleteLayers } from "@/hooks/use-delete-layers";
import { Hint } from "@/components/hints";
import { Button } from "@/components/ui/button";
import { BringToFront, SendToBack, Trash2 } from "lucide-react";

interface SelectionToolsProps {
    camera: Camera;
    setLastUsedColor: (color: Color) => void;
};

export const SelectionTools = memo(({
    camera,
    setLastUsedColor,
}: SelectionToolsProps) => {

    const selection = useSelf((me) => me.presence.selection);

    const moveToFront = useMutation((
        {storage}
    ) => {
        const liveLayerIds = storage.get("layerIds");
        const indices: number[] = [];

        const arr = liveLayerIds.toImmutable();

        for(let i = 0; i < arr.length; i++){
            if ((selection ?? []).includes(arr[i])) {
                indices.push(i);
            }
        }

        for(let i = indices.length - 1; i >= 0; i--) {
            liveLayerIds.move(indices[i], arr.length - 1 - (indices.length -1 -i));
        }

    }, [selection]);

    const moveToBack = useMutation((
        {storage}
    ) => {
        const liveLayerIds = storage.get("layerIds");
        const indices: number[] = [];

        const arr = liveLayerIds.toImmutable();

        for(let i = 0; i < arr.length; i++){
            if ((selection ?? []).includes(arr[i])) {
                indices.push(i);
            }
        }

        for(let i =0; i < indices.length; i++) {
            liveLayerIds.move(indices[i], i);
        }

    }, [selection]);

    const setFill = useMutation((
        {storage},
        fill: Color,
    ) => {
        const liveLayers = storage.get("layers");
        setLastUsedColor(fill);

        (selection ?? []).forEach((id) => {
            (liveLayers.get(id) as any)?.set("fill", fill);
        });
    }, [selection, setLastUsedColor])

    const deleteLayers = useDeleteLayers();
    const selectionBounds = useSelectionBounds();

    if(!selectionBounds) {
        return null ;
    }

    const x = selectionBounds.width / 2 + selectionBounds.x + camera.x;
    const y = selectionBounds.y + camera.y;

    return (
        <div
            className="absolute p-3 rounded-2xl flex select-none shadow-[0_8px_32px_rgba(0,0,0,0.4)]"
            style={{
                background: "rgba(15,17,23,0.85)",
                backdropFilter: "blur(20px)",
                border: "1px solid rgba(255,255,255,0.08)",
                transform: `translate(
                    calc(${x}px - 50%),
                    calc(${y - 16}px - 100%)
                )`
            }}
        >
            <ColorPicker onChange={setFill} />

            <div className="flex flex-col gap-y-1 pr-2">
                <Hint label="Bring to front">
                    <Button
                        onClick={moveToFront} 
                        variant="ghost"
                        size="icon"
                        className="w-8 h-8 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
                    >
                        <BringToFront className="w-4 h-4" />
                    </Button>
                </Hint>

                <Hint label="Send to back" side={"bottom" as any}>
                    <Button
                        onClick={moveToBack} 
                        variant="ghost"
                        size="icon"
                        className="w-8 h-8 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
                    >
                        <SendToBack className="w-4 h-4" />
                    </Button>
                </Hint>
            </div>
            
            <div className="flex items-center pl-2 ml-1 border-l border-white/10">
                <Hint label="Delete">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={deleteLayers}
                        className="w-8 h-8 rounded-lg text-rose-400 hover:text-white hover:bg-rose-500/80"
                    >
                        <Trash2 className="w-4 h-4" />
                    </Button>
                </Hint>
            </div>
        </div>
    )
});

SelectionTools.displayName = "SelectionTools";