import type { Metadata, Viewport } from 'next'
import { Space_Grotesk, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { Toaster } from '@/components/ui/sonner'
import './globals.css'

const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], variable: '--font-space-grotesk' })
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono" });

export const metadata: Metadata = {
  title: {
    default: 'Wayne Industries - Sistema de Gestao',
    template: '%s | Wayne Industries'
  },
  description: 'Sistema de gestao de recursos das Industrias Wayne - Equipamentos, Veiculos e Dispositivos de Seguranca',
  icons: {
    icon: '/logo favicon.png',
    apple: '/logo favicon.png',
  },
}

export const viewport: Viewport = {
  themeColor: '#1a1a2e',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR" className="dark">
      <body className={`${spaceGrotesk.variable} ${geistMono.variable} font-sans antialiased min-h-screen bg-background text-foreground`}>
        {children}
        <Toaster />
        <Analytics />
      </body>
    </html>
  )
}
