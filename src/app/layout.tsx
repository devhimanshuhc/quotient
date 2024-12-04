import './globals.css'
import { Inter, Fraunces } from 'next/font/google'
import Navbar from '@/components/Navbar'
import AuthProvider from '@/components/AuthProvider'
import SessionProvider from '@/components/providers/SessionProvider'
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ 
  subsets: ['latin'], 
  variable: '--font-inter',
  display: 'swap',
})

const fraunces = Fraunces({ 
  subsets: ['latin'],
  variable: '--font-fraunces',
  display: 'swap',
  axes: ['SOFT', 'WONK', 'opsz'],
})

export const metadata = {
  title: 'Quotient - Shape Your Narrative',
  description: 'A modern platform for creative writing',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${fraunces.variable}`}>
      <body className="font-inter antialiased">
        <AuthProvider>
          <SessionProvider>
            <Navbar />
            {children}
            <Toaster />
          </SessionProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
