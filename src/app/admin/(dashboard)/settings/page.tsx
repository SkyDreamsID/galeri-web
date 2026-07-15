import { SettingsForm } from '@/components/admin/SettingsForm'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Pengaturan | Galeri Admin',
}

export default function SettingsPage() {
  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-heading">Pengaturan Global</h1>
        <p className="text-text-muted mt-2">
          Ubah judul website, deskripsi halaman utama, dan tautan sosial media di sini.
        </p>
      </div>

      <SettingsForm />
    </div>
  )
}
