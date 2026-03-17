export const Overlay = () => {
    return (
        <div 
            className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 absolute inset-0 pointer-events-none"
            style={{
                background: "linear-gradient(180deg, rgba(0,0,0,0.08) 0%, transparent 40%, rgba(0,0,0,0.55) 100%)"
            }}
        />
    );
};