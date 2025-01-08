"use client"
import MiniDSPController from '@/components/minidsp-controller'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <MiniDSPController />
    </main>
  )
}