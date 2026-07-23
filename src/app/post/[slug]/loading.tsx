import { Loader2 } from "lucide-react"

export default function PostLoading() {
  return (
    <main className="container mx-auto max-w-7xl px-4 md:px-8 py-10 md:py-16 animate-pulse">
      <div className="flex flex-col max-lg:landscape:grid max-lg:landscape:grid-cols-11 lg:grid lg:grid-cols-11 max-lg:landscape:gap-6 lg:gap-16 items-start">
        
        {/* === BAGIAN KIRI: Foto === */}
        <div className="max-lg:landscape:col-span-5 lg:col-span-6 order-1 w-full max-lg:landscape:sticky max-lg:landscape:top-24 lg:sticky lg:top-24 self-start">
          <div className="aspect-square md:aspect-auto max-lg:landscape:aspect-[4/3] md:h-[65vh] max-lg:landscape:h-auto lg:h-[80vh] lg:landscape:h-[80vh] w-full rounded-[16px] bg-surface border border-border/40 flex items-center justify-center">
            <Loader2 className="h-8 w-8 text-text-muted animate-spin" />
          </div>
        </div>

        {/* === BAGIAN KANAN: Detail & Cerita === */}
        <div className="max-lg:landscape:col-span-6 lg:col-span-5 order-2 w-full max-lg:landscape:sticky max-lg:landscape:top-20 lg:sticky lg:top-20 max-lg:landscape:h-[calc(100vh-80px)] lg:h-[calc(100vh-80px)] flex flex-col">
          
          {/* ZONA ATAS: Tombol Kembali */}
          <div className="shrink-0 pb-4 border-b border-border/20 mb-6 sticky top-0 z-10 bg-background pt-2 md:pt-0">
            <div className="w-32 h-4 bg-surface border border-border/40 rounded-sm" />
          </div>

          {/* ZONA BAWAH: Konten Utama */}
          <div className="max-lg:landscape:flex-1 max-lg:landscape:overflow-y-auto lg:flex-1 lg:overflow-y-auto pr-1 max-lg:landscape:scrollbar-thin lg:scrollbar-thin space-y-6 md:space-y-8 pb-10">
            
            {/* Header Area */}
            <div className="flex flex-col gap-2 md:gap-3">
              <div className="w-16 h-5 bg-surface border border-border/40 rounded-full" />
              <div className="w-3/4 h-8 md:h-10 bg-surface border border-border/40 rounded-md" />
            </div>

            {/* Metadata (Diposting, File, Lokasi) */}
            <div className="space-y-2.5">
               <div className="w-48 h-4 bg-surface border border-border/40 rounded-sm" />
               <div className="w-40 h-4 bg-surface border border-border/40 rounded-sm" />
               <div className="w-44 h-4 bg-surface border border-border/40 rounded-sm" />
            </div>

            {/* Tombol Bagikan */}
            <div className="pt-2">
               <div className="w-24 h-9 bg-surface border border-border/40 rounded-full" />
            </div>

            {/* Cerita Area */}
            <div className="space-y-3 pt-6 border-t border-border/20">
              <div className="w-40 h-6 bg-surface border border-border/40 rounded-md mb-2" />
              <div className="w-full h-4 bg-surface border border-border/40 rounded-sm" />
              <div className="w-full h-4 bg-surface border border-border/40 rounded-sm" />
              <div className="w-5/6 h-4 bg-surface border border-border/40 rounded-sm" />
              <div className="w-2/3 h-4 bg-surface border border-border/40 rounded-sm" />
            </div>

            {/* Tags Skeleton */}
            <div className="flex gap-2 pt-2">
              <div className="w-16 h-6 bg-surface border border-border/40 rounded-full" />
              <div className="w-20 h-6 bg-surface border border-border/40 rounded-full" />
            </div>
          </div>

        </div>
      </div>
    </main>
  )
}
