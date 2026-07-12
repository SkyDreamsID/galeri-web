import { UploadForm } from '@/components/admin/UploadForm'

export default function AdminPage() {
  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Upload Momen Baru</h2>
        <p className="text-zinc-400 mt-1">
          Satu momen (post) bisa berisi banyak foto sekaligus. Data EXIF kamera akan diekstrak otomatis.
        </p>
      </div>
      
      <UploadForm />
    </div>
  )
}
