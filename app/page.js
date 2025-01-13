"use client";
import { MiniDSPController } from '@/components/minidsp-controller';
import Head from 'next/head';

export default function Home() {
  return (
    <>
      <Head>
        <title>MiniDSP Controller</title>
        <meta name="description" content="A simple web interface to control the MiniDSP device." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <main className="min-h-screen p-4 md:p-8 lg:p-12">
        <div className="max-w-[2000px] mx-auto">
          <MiniDSPController />
        </div>
      </main>
    </>
  );
}