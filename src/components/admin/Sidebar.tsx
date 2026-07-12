'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { ImagePlus, Images, LogOut, Settings } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/admin/login')
  }

  const menu = [
    { name: 'Upload Baru', path: '/admin', icon: ImagePlus },
    { name: 'Kelola Galeri', path: '/admin/gallery', icon: Images },
    { name: 'Pengaturan', path: '/admin/settings', icon: Settings },
  ]

  return (
    <aside className="w-64 bg-zinc-900 border-r border-zinc-800 flex flex-col hidden md:flex sticky top-0 h-screen">
      <div className="p-6 border-b border-zinc-800">
        <h1 className="text-xl font-bold tracking-tight">Admin<span className="text-blue-500">.</span></h1>
        <p className="text-xs text-zinc-400 mt-1">Galeri Control Panel</p>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {menu.map((item) => {
          const isActive = pathname === item.path
          const Icon = item.icon
          return (
            <Link
              key={item.path}
              href={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive 
                  ? 'bg-blue-600 text-white' 
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
              }`}
            >
              <Icon size={20} />
              <span className="font-medium">{item.name}</span>
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-zinc-800">
        <button 
          onClick={handleLogout}
          className="flex w-full items-center gap-3 px-4 py-3 text-red-400 hover:text-red-300 hover:bg-red-950/30 rounded-lg transition-colors"
        >
          <LogOut size={20} />
          <span className="font-medium">Keluar</span>
        </button>
      </div>
    </aside>
  )
}
