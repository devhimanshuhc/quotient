import './globals.css'
import { Inter, Fraunces } from 'next/font/google'
import Navbar from '@/components/Navbar'
import AuthProvider from '@/components/AuthProvider'
import SessionProvider from '@/components/providers/SessionProvider'
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const fraunces = Fraunces({ 
  subsets: ['latin'],
  variable: '--font-fraunces',
  display: 'swap',
  style: ['italic', 'normal'],
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
    <html lang="en" className="h-full bg-white">
      <body className={`${inter.variable} ${fraunces.variable} font-inter h-full`}>
        <AuthProvider>
          <SessionProvider>
            <Navbar />
            <main>
              {children}
            </main>
            <Toaster />
          </SessionProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
