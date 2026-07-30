"use client";

import { nanoid } from "nanoid";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Info } from "./info";
import { Participants } from "./participants";
import { useAuth, useUser, useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import { useMutation as useConvexMutation } from "convex/react";
import { Toolbar } from "./toolbar";
import { Camera, CanvasMode, CanvasState, Color, LayerType, Point, Side, XYWH } from "@/types/canvas";
import { useCanRedo, useCanUndo, useHistory, useMutation, useOthersMapped, useSelf, useStorage} from "@liveblocks/react";
import { CursorsPresence } from "./cursors-presence";
import { colorToCss, connectionIdToColor, findIntersectingLayersWithRect, penPointsToPathLayer, pointerEventToCanvasPoint, resizeBounds } from "@/lib/utils";
import { LiveObject } from "@liveblocks/client";
import { LayerPreview } from "./LayerPreview";
import { SelectionBox } from "./selection-box";
import { SelectionTools } from "./selection-tools";
import { Path } from "./path";
import { useDisableScrollBounce } from "@/hooks/use-disable-scroll-bounce";
import { useDeleteLayers } from "@/hooks/use-delete-layers";

const MAX_LAYERS = 100;

interface CanvasProps {
    boardId: string;
    title?: string;
    orgId?: string;
    isReadOnly?: boolean;
    myRequestStatus?: "pending" | "approved" | "rejected" | "blocked" | null;
}

export const Canvas = ({
    boardId,
    title,
    orgId,
    isReadOnly,
    myRequestStatus,
}: CanvasProps) => {
    const { isSignedIn } = useAuth();
    const { user } = useUser();
    const router = useRouter();
    const createCollabRequest = useConvexMutation(api.requests.create);
    const [isRequesting, setIsRequesting] = useState(false);
    const [cooldown, setCooldown] = useState(0);

    const layerIds = useStorage((root) => root.layerIds);
    const pencilDraft = useSelf((me) => me.presence.pencilDraft);

    // Casting to any to avoid conflict with the built-in HTML CanvasState
    const [canvasState, setCanvasState] = useState<CanvasState>({
        mode: CanvasMode.None,
    } as any);

    const [camera, setCamera] = useState<Camera>({ x : 0, y : 0});
    const [lastUsedColor, setLastUsedColor] = useState<Color>({
        r:255, g:255, b:255,
    });

    useDisableScrollBounce();
    const history = useHistory();
    const canUndo = useCanUndo();
    const canRedo = useCanRedo();

    const insertLayer = useMutation((
        {storage, setMyPresence},
        layerType: LayerType.Ellipse | LayerType.Rectangle | LayerType.Note | LayerType.Text | LayerType.Path,
        position: Point,
    ) => {
        const liveLayers = storage.get("layers");
        if(liveLayers.size >= MAX_LAYERS) return;

        const liveLayerIds = storage.get("layerIds");
        const layerId = nanoid();
        
        // Use 'as any' to handle the Discriminated Union mismatch
        const layer = new LiveObject({
            type: layerType,
            x: position.x,
            y: position.y,
            height: 100,
            width: 100,
            fill: lastUsedColor,
        } as any);

        liveLayerIds.push(layerId);
        liveLayers.set(layerId, layer);

        setMyPresence({selection : [layerId]}, { addToHistory: true});
        setCanvasState({ mode: CanvasMode.None});
    }, [lastUsedColor]);

    const translateSelectedLayer = useMutation((
        {storage, self},
        point: Point,
    ) => {
        if(canvasState.mode !== CanvasMode.Translating) return;

        const offset = {
            x: point.x - canvasState.current.x,
            y: point.y - canvasState.current.y,
        };

        const liveLayers = storage.get("layers");

        for(const id of self.presence.selection) {
            const layer = liveLayers.get(id);

            if(layer) {
                // Cast layer to any to allow dynamic access to .get("x")
                layer.update({
                    x: (layer as any).get("x") + offset.x,
                    y: (layer as any).get("y") + offset.y,
                });
            }
        }
        setCanvasState({mode: CanvasMode.Translating, current: point});
    }, [canvasState]);

    const updateSelectionNet = useMutation((
        {storage, setMyPresence},
        current: Point,
        origin: Point,
    ) => {
        const layers = storage.get("layers").toImmutable();
        setCanvasState({
            mode: CanvasMode.SelectionNet,
            origin,
            current,
        });

        const ids = findIntersectingLayersWithRect(
            layerIds || [], // Ensure layerIds isn't null
            layers,
            origin,
            current,
        );

        setMyPresence({selection: ids});
    }, [layerIds]);

    // ... (unselectLayers, startMultiSelection, continueDrawing, insertPath, startDrawing remain largely the same)

    const unselectLayers = useMutation(({self, setMyPresence}) => {
        if(self.presence.selection.length > 0 ) {
            setMyPresence({selection: []}, {addToHistory:true});
        }
    } ,[]);

    const startMultiSelection = useCallback((current: Point, origin: Point) => {
        if(Math.abs(current.x - origin.x) + Math.abs(current.y - origin.y) > 5){
            setCanvasState({
                mode: CanvasMode.SelectionNet,
                origin,
                current,
            });
        }
    }, []);

    const continueDrawing = useMutation(({self, setMyPresence}, point: Point, e: React.PointerEvent) => {
        const {pencilDraft} = self.presence;
        if(canvasState.mode !== CanvasMode.Pencil || e.buttons !== 1 || pencilDraft == null) return;

        setMyPresence({
            cursor: point,
            pencilDraft: pencilDraft.length === 1 && 
            pencilDraft[0][0] == point.x &&
            pencilDraft[0][1] === point.y
                ? pencilDraft
                : [...pencilDraft, [point.x, point.y, e.pressure]],
        });
    }, [canvasState.mode]);

    const insertPath = useMutation(({storage, self, setMyPresence}) => {
        const liveLayers = storage.get("layers");
        const { pencilDraft } = self.presence;
        
        if(pencilDraft == null || pencilDraft.length < 2 || liveLayers.size >= MAX_LAYERS){
            setMyPresence({pencilDraft : null});
            return;
        }

        const id = nanoid();
        liveLayers.set(id, new LiveObject(penPointsToPathLayer(pencilDraft, lastUsedColor)) as any);

        const liveLayerIds = storage.get("layerIds");
        liveLayerIds.push(id);

        setMyPresence({pencilDraft: null});
        setCanvasState({mode: CanvasMode.Pencil});
    }, [lastUsedColor]);

    const startDrawing = useMutation(({setMyPresence}, point: Point, pressure: number) => {
        setMyPresence({
            pencilDraft: [[point.x, point.y, pressure]],
            penColor: lastUsedColor,
        });
    }, [lastUsedColor]);

    const resizeSelectedLayer = useMutation(({storage, self}, point: Point) => {
        if(canvasState.mode !== CanvasMode.Resizing) return;

        const bounds = resizeBounds(canvasState.initialBounds, canvasState.corner, point);
        const liveLayers = storage.get("layers");
        const layer = liveLayers.get(self.presence.selection[0]);

        if(layer) {
            layer.update(bounds);
        }
    }, [canvasState]);

    const onResizeHandlePointerDown = useCallback((corner: Side, initialBounds: XYWH) => {
        history.pause();
        setCanvasState({
            mode: CanvasMode.Resizing,
            initialBounds,
            corner,
        });
    }, [history]);

    const onWheel = useCallback((e: React.WheelEvent) => {
        setCamera((camera) => ({
            x: camera.x - e.deltaX,
            y: camera.y - e.deltaY,
        }));
    }, []);

    const onPointerMove = useMutation(({setMyPresence}, e: React.PointerEvent) => {
        e.preventDefault();
        const current = pointerEventToCanvasPoint(e, camera);

        if(canvasState.mode === CanvasMode.Pressing){
            startMultiSelection(current, canvasState.origin);
        } else if(canvasState.mode === CanvasMode.SelectionNet) {
            updateSelectionNet(current, canvasState.origin);
        } else if(canvasState.mode === CanvasMode.Translating) {
            translateSelectedLayer(current);
        } else if (canvasState.mode === CanvasMode.Resizing) {
            resizeSelectedLayer(current);
        } else if (canvasState.mode === CanvasMode.Pencil) {
            continueDrawing(current, e);
        }

        setMyPresence({cursor: current});
    }, [continueDrawing, startMultiSelection, updateSelectionNet, canvasState, resizeSelectedLayer, camera]);

    const onPointerLeave = useMutation(({setMyPresence}) => {
        setMyPresence({cursor: null});
    }, []);

    const onPointerDown = useCallback((e: React.PointerEvent) => {
        const point = pointerEventToCanvasPoint(e, camera);
        if(canvasState.mode === CanvasMode.Inserting) return;
        if(canvasState.mode === CanvasMode.Pencil) {
            startDrawing(point, e.pressure);
            return;
        }
        setCanvasState({origin: point, mode: CanvasMode.Pressing});
    }, [camera, canvasState.mode]);

    const onPointerUp = useMutation((
        {}, 
        e: React.PointerEvent
    ) => {
        const point = pointerEventToCanvasPoint(e, camera);

        if (canvasState.mode === CanvasMode.None || canvasState.mode === CanvasMode.Pressing) {
            unselectLayers();
            setCanvasState({ mode: CanvasMode.None });
        } else if (canvasState.mode === CanvasMode.Pencil){
            insertPath();
        } else if (canvasState.mode === CanvasMode.Inserting){
            insertLayer(canvasState.layerType, point);
        } else {
            setCanvasState({ mode: CanvasMode.None });
        }
        history.resume();
    }, [camera, canvasState, history, insertLayer, unselectLayers, insertPath]);

    const onLayerPointerDown = useMutation(({self , setMyPresence}, e: React.PointerEvent, layerId: string) => {
        if(canvasState.mode === CanvasMode.Pencil || canvasState.mode === CanvasMode.Inserting) return;

        history.pause();
        e.stopPropagation();
        const point = pointerEventToCanvasPoint(e, camera);

        if(!self.presence.selection.includes(layerId)){
            setMyPresence({selection: [layerId]} ,{addToHistory: true});
        }
        setCanvasState({mode: CanvasMode.Translating, current: point});
    }, [camera, history, canvasState.mode]);

    const selections = useOthersMapped((other) => other.presence.selection );
    const layerIdsToColorSelection = useMemo(() => {
        const layerIdsToColorSelection: Record<string, string> = {};
        for (const user of selections) {
            const [connectionId, selection] = user;
            for(const layerId of selection) {
                layerIdsToColorSelection[layerId] = connectionIdToColor(connectionId);
            }
        }
        return layerIdsToColorSelection;
    }, [selections]);

    const deleteLayers = useDeleteLayers();

    useEffect(() => {
        function onKeyDown(e: KeyboardEvent) {
            switch (e.key) {
                case "z" : {
                    if(e.ctrlKey || e.metaKey){
                        if(e.shiftKey) history.redo();
                        else history.undo();
                    }
                    break;
                }
            }
        }
        document.addEventListener("keydown", onKeyDown);
        return () => document.removeEventListener("keydown", onKeyDown);
    }, [deleteLayers, history]);

    // Timer logic for collaboration request cooldown
    useEffect(() => {
        if (cooldown <= 0) return;
        const timer = setInterval(() => setCooldown((prev) => prev - 1), 1000);
        return () => clearInterval(timer);
    }, [cooldown]);

    const { redirectToSignIn } = useClerk();

    const handleRequestCollab = async () => {
        if (cooldown > 0) return;
        if (!isSignedIn) {
            redirectToSignIn({ signInFallbackRedirectUrl: window.location.href });
            return;
        }
        if (!user || !title || !orgId) return;

        try {
            setIsRequesting(true);
            await createCollabRequest({
                boardId: boardId as any,
                boardTitle: title,
                orgId: orgId,
                requesterId: user.id,
                requesterName: user.firstName || "Anonymous User",
            });
            toast.success("Collaboration request sent!");
            setCooldown(30); // Start 30s cooldown on success
        } catch (error: any) {
            toast.error(error.message || "Failed to send request.");
            if (error.message?.includes("rejected") || error.message?.includes("blocked")) {
                 setCooldown(30); // Also cooldown if they hit an error state
            }
        } finally {
            setIsRequesting(false);
        }
    };

    return (
        <main 
            className="h-full w-full relative touch-none overflow-hidden"
            style={{
                backgroundColor: "#0f1117",
                backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.05) 1px, transparent 0)`,
                backgroundSize: "32px 32px"
            }}
        >
            <Info boardId={boardId} />
            <Participants />
            
            {isReadOnly && (
                <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] flex items-center justify-center px-4">
                    <div className="bg-slate-900/40 border border-white/10 rounded-full p-1.5 flex items-center shadow-2xl backdrop-blur-md transition-all">
                        <div className="px-3 flex items-center gap-2">
                            <span className="text-amber-400 text-[13px] drop-shadow-sm">👁️</span>
                            <span className="text-slate-200 text-xs font-semibold tracking-wide">View Only</span>
                        </div>
                        
                        <span className="w-px h-5 bg-white/15 mx-1" />

                        {myRequestStatus !== "blocked" && (
                            <div className="flex items-center">
                                {myRequestStatus === "pending" ? (
                                    <div className="px-4 py-1.5 text-xs text-indigo-300 font-semibold flex items-center gap-2 bg-indigo-500/10 rounded-full border border-indigo-500/20">
                                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
                                        Pending Approval...
                                    </div>
                                ) : (
                                    <Button
                                        size="sm"
                                        className="h-7 text-xs bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-900/20 text-white rounded-full px-4 font-semibold transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
                                        onClick={handleRequestCollab}
                                        disabled={isRequesting || cooldown > 0}
                                    >
                                        {isRequesting ? "Sending..." : cooldown > 0 ? `Wait ${cooldown}s to send again` : "Request to Collaborate ✨"}
                                    </Button>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {!isReadOnly && (
                <>
                    <Toolbar 
                        canvasState={canvasState}
                        setCanvasState={setCanvasState}
                        canRedo={canRedo}
                        canUndo={canUndo}
                        undo={history.undo}
                        redo={history.redo}
                    />
                    <SelectionTools camera={camera} setLastUsedColor={setLastUsedColor} />
                </>
            )}

            <svg
                id="board-canvas-svg"
                className="h-[100vh] w-[100vw]"
                style={{ pointerEvents: isReadOnly ? "none" : "auto" }} // Disables clicking/editing but allows scrolling on main wrapper
                onWheel={onWheel}
                onPointerMove={!isReadOnly ? onPointerMove : undefined}
                onPointerLeave={!isReadOnly ? onPointerLeave : undefined}
                onPointerDown={!isReadOnly ? onPointerDown : undefined}
                onPointerUp={!isReadOnly ? onPointerUp : undefined}
            >
                <g style={{ transform: `translate(${camera.x}px, ${camera.y}px)` }}>
                    {layerIds?.map((layerId) => (
                        <LayerPreview 
                            key={layerId}
                            id={layerId}
                            onLayerPointerDown={onLayerPointerDown}
                            selectionColor={layerIdsToColorSelection[layerId]}
                        />
                    ))}
                    <SelectionBox onResizeHandlePointerDown={onResizeHandlePointerDown} />
                    {canvasState.mode === CanvasMode.SelectionNet && canvasState.current != null && (
                        <rect 
                            className="fill-indigo-500/5 stroke-indigo-500 stroke-1"
                            x={Math.min(canvasState.origin.x, canvasState.current.x)}
                            y={Math.min(canvasState.origin.y, canvasState.current.y)}
                            width={Math.abs(canvasState.origin.x - canvasState.current.x)}
                            height={Math.abs(canvasState.origin.y - canvasState.current.y)}
                        />
                    )}
                    <CursorsPresence />
                    {pencilDraft != null && pencilDraft.length > 0 && (
                        <Path 
                            points={pencilDraft}
                            fill={colorToCss(lastUsedColor)}
                            x={0} y={0}
                        />
                    )}
                </g>
            </svg>
        </main>
    );
};