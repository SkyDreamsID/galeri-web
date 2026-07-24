import { Sidebar } from '@/components/admin/Sidebar'
import { createClient } from '@/lib/supabase/server'
import { Metadata } from 'next'

export async function generateMetadata(): Promise<Metadata> {
  const supabase = await createClient()
  const { data: settings } = await supabase.from('site_settings').select('site_title').limit(1).single()
  const siteTitle = settings?.site_title || "Jurnal Visual"

  return {
    title: {
      template: `%s | ${siteTitle}`,
      default: `Dashboard Admin`,
    }
  }
}
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen bg-background text-text-main selection:bg-primary-neutral/30">
      <Sidebar />
      <main className="flex-1 w-full p-4 md:p-8 pt-20 md:pt-8 bg-background">
        {children}
      </main>
    </div>
  )
}
