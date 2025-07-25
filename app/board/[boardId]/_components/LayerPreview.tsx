"use client";

import { LayerType } from "@/types/canvas";
import { useStorage } from "@liveblocks/react";
import { memo } from "react";
import { Rectangle } from "./rectangle";
import { Ellipse } from "./ellipse";
import { Text } from "./text";
import { Note } from "./note";
import { Arrow } from "./arrow";
import { Path } from "./path";
import { colorToCss } from "@/lib/utils";


interface LayerPreviewProps {
    id: string;
    onLayerPointerDown: ( e: React.PointerEvent, layerId: string) => void; 
    selectionColor?: string;
};


export const LayerPreview = memo(({

    id,
    onLayerPointerDown,
    selectionColor,

}: LayerPreviewProps) => {

    const layer = useStorage((root) => root.layers.get(id));



    if(!layer){
        return null;
    };

    switch (layer.type) {

        case LayerType.Path:
            return(
                <Path 
                    key={id}
                
                    points={layer.points}
                    onPointerDown={(e) => onLayerPointerDown(e, id)}
                    x={layer.x}
                    y={layer.y}
                    fill={layer.fill ? colorToCss(layer.fill) : "#FFF"}
                    stroke={selectionColor}
                />
            )



        case LayerType.Note:
            return (
                <Note 
                    id={id}
                    layer={layer}
                    onPointerDown={onLayerPointerDown}
                    selectionColor={selectionColor}
                />
            )

        case LayerType.Text:
            return (
                <Text 
                    id={id}
                    layer={layer}
                    onPointerDown={onLayerPointerDown}
                    selectionColor={selectionColor}
                />
            )

        case LayerType.Ellipse:
            return (
                <Ellipse 
                    id={id}
                    layer={layer}
                    onPointerDown={onLayerPointerDown}
                    selectionColor={selectionColor}
                />
            )
        case LayerType.Rectangle:
        return (
            <Rectangle 
                id={id}
                layer={layer}
                onPointerDown={onLayerPointerDown}
                selectionColor={selectionColor}
            />
        );

        default:
            console.warn("Unkk=nown layer type");
            return null;
    }




    return(
        <div>
            LayerPreview
        </div>
    )
});



LayerPreview.displayName = "LayerPreview";