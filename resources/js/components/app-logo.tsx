export default function AppLogo() {
    return (
        <>
            <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-agency-accent text-agency-primary">
                <span className="text-lg font-black italic">A</span>
            </div>
            <div className="ml-1 grid flex-1 text-left text-sm">
                <span className="mb-0.5 truncate leading-tight font-black uppercase tracking-tighter">
                    Avant-Garde
                </span>
                <span className="text-[10px] font-bold uppercase tracking-widest opacity-40 -mt-1">
                    CMS Panel
                </span>
            </div>
        </>
    );
}
