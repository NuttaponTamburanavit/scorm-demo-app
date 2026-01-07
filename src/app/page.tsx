'use client';

import { useScormStore } from '@/store/useScormStore';
import { ScormUploader } from '@/components/molecules';
import { ScormPlayer, CmiExplorer } from '@/components/organisms';
import { GraduationCap } from 'lucide-react';

export default function Home() {
  const { status } = useScormStore();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-gray-800">
      {/* Header */}
      <header className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-gray-100 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-primary/10 p-2 rounded-lg text-primary">
              <GraduationCap className="w-6 h-6" />
            </div>
            <h1 className="font-bold text-xl tracking-tight">
              SCORM<span className="text-primary">Demo</span>
            </h1>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-500">
            {/* <a href="#" className="text-gray-900">Dashboard</a> */}
            {/* <a href="#" className="hover:text-primary transition-colors">Course Library</a>
            <a href="#" className="hover:text-primary transition-colors">Analytics</a> */}
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 pt-24 pb-12 px-6">
        <div className={`mx-auto space-y-8 transition-all duration-500 ${status === 'ready' ? 'max-w-[1400px]' : 'max-w-4xl'}`}>

          <div className="text-center space-y-4">
            <h2 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-600">
              {status === 'ready' ? 'Learning Session Active' : 'Start Your Learning Journey'}
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              {status === 'ready'
                ? 'Interact with the course content below. Communication logs and the CMI data model are displayed in real-time.'
                : 'Upload a standard SCORM 1.1, 1.2 or 2004 package to preview the content and test RTE communication.'}
            </p>
          </div>

          <div className="transition-all duration-500 ease-in-out">
            {status === 'ready' ? (
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-3">
                  <ScormPlayer />
                </div>
                <div className="lg:col-span-1 h-[600px] lg:h-auto sticky top-24">
                  <CmiExplorer />
                </div>
              </div>
            ) : (
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                <ScormUploader />
              </div>
            )}
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 text-center text-gray-400 text-sm">
        <p>&copy; 2024 SCORM Demo Platform. Built with Next.js & Tailwind.</p>
      </footer>
    </div>
  );
}
