import { Sidebar } from '@/components/admin/Sidebar'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen bg-background text-text-main selection:bg-primary-neutral/30">
      <Sidebar />
      <main className="flex-1 w-full overflow-y-auto p-4 md:p-8 pt-20 md:pt-8 bg-background">
        {children}
      </main>
    </div>
  )
}
