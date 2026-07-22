import { login } from './actions'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Lock } from 'lucide-react'
import Link from 'next/link'

export default async function LoginPage(props: {
  searchParams: Promise<{ error?: string }>
}) {
  const searchParams = await props.searchParams

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center bg-background px-4 py-12 overflow-hidden selection:bg-primary-neutral/30">
      {/* Background Glow Effect */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-primary-neutral/20 rounded-full blur-[80px] md:blur-[120px] pointer-events-none opacity-50 dark:opacity-30" />

      <div className="relative z-10 w-full max-w-[380px]">
        <div className="mb-8 flex justify-center">
          <Link href="/" className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-surface/50 border border-border/50 text-text-muted hover:text-text-main hover:bg-surface backdrop-blur-md transition-all text-sm font-medium shadow-sm">
            <ArrowLeft className="w-4 h-4" />
            Kembali ke Beranda
          </Link>
        </div>
        
        <Card className="bg-surface/80 backdrop-blur-xl border-border/60 shadow-2xl overflow-hidden rounded-2xl sm:rounded-3xl">
          <CardHeader className="space-y-3 text-center pb-6 pt-8">
            <div className="mx-auto w-14 h-14 bg-primary-neutral/10 rounded-2xl flex items-center justify-center mb-1 rotate-3 hover:rotate-0 transition-transform duration-300 shadow-inner">
              <Lock className="w-6 h-6 text-primary-neutral drop-shadow-sm" />
            </div>
            <CardTitle className="text-2xl md:text-3xl font-extrabold tracking-tight font-heading text-text-main">
              Admin Area
            </CardTitle>
            <CardDescription className="text-text-muted font-medium px-4">
              Akses dashboard untuk mengelola konten, media, dan pengaturan website.
            </CardDescription>
          </CardHeader>
          <form action={login}>
            <CardContent className="space-y-5 px-6 md:px-8">
              {searchParams?.error && (
                <div className="text-[13px] font-medium text-red-600 dark:text-red-400 bg-red-500/10 border border-red-500/20 p-3 rounded-xl text-center animate-in zoom-in-95 duration-300">
                  {searchParams.error}
                </div>
              )}
              <div className="space-y-2.5">
                <Label htmlFor="email" className="text-text-main/80 text-[11px] font-bold uppercase tracking-widest pl-1">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="admin@jurnalvisual.com"
                  required
                  className="bg-background/80 border-border/60 text-text-main placeholder:text-text-muted/40 focus-visible:ring-primary-neutral focus-visible:border-primary-neutral h-12 rounded-xl transition-all"
                />
              </div>
              <div className="space-y-2.5">
                <Label htmlFor="password" className="text-text-main/80 text-[11px] font-bold uppercase tracking-widest pl-1">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••••••"
                  required
                  className="bg-background/80 border-border/60 text-text-main placeholder:text-text-muted/40 focus-visible:ring-primary-neutral focus-visible:border-primary-neutral h-12 rounded-xl transition-all"
                />
              </div>
            </CardContent>
            <CardFooter className="px-6 md:px-8 pb-8 pt-2">
              <Button type="submit" className="w-full bg-primary-neutral text-white hover:bg-primary-neutral/90 h-12 rounded-xl font-bold text-[15px] shadow-lg shadow-primary-neutral/25 transition-all active:scale-[0.98]">
                Masuk ke Dashboard
              </Button>
            </CardFooter>
          </form>
        </Card>

        <p className="text-center text-text-muted/40 text-[10px] mt-8 font-medium tracking-wider uppercase">
          Dilindungi oleh Supabase Auth
        </p>
      </div>
    </div>
  )
}
