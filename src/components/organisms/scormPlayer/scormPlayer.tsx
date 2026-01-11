'use client';
import { useEffect, useRef, useState } from 'react';
import { useScormStore } from '@/store/useScormStore';
import { Maximize2, Upload, Monitor, Tablet, Smartphone, ShieldCheck, ShieldAlert } from 'lucide-react';
// We need to import scorm-again dynamically or ensure it runs only on client
// Since this is a 'use client' component, it's fine, but 'scorm-again' is often a script.
// I'll assume we can import specific parts or assign to window using the default import.
import { Scorm12API, Scorm2004API } from 'scorm-again';
import { ScormEventEnum } from '@/types/scorm';


export const ScormPlayer = () => {
  const { launchUrl, title, version, courseId, reset, setCmiValue, conformanceMode, setConformanceMode } = useScormStore();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [isApiReady, setIsApiReady] = useState(false);
  const [viewportSize, setViewportSize] = useState<'full' | 'desktop' | 'tablet' | 'mobile'>('full');

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Initialize SCORM API
    const settings = {
      autocommit: true,
      logLevel: 4,
      strict: conformanceMode === 'strict',
    };

    let api: Scorm12API | Scorm2004API;
    if (version === '1.2' || version === '1.1') {
      api = new Scorm12API(settings);
      window.API = api;
    } else {
      api = new Scorm2004API(settings);
      window.API_1484_11 = api;
    }

    const syncFullCmi = () => {
      try {
        const flatten = (obj: any, prefix = ''): Record<string, string> => {
          const results: Record<string, string> = {};
          for (const key in obj) {
            if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
              Object.assign(results, flatten(obj[key], prefix + key + '.'));
            } else {
              results[prefix + key] = String(obj[key]);
            }
          }
          return results;
        };

        const flatModel = flatten(api.cmi as unknown as Record<string, unknown>);
        Object.entries(flatModel).forEach(([key, val]) => {
          useScormStore.getState().setCmiValue(key, val);
        });
      } catch (e) {
        console.error('Failed to sync full CMI', e);
      }
    };

    // Attach event listeners for logging
    api.on(ScormEventEnum.LMS_SET_VALUE, (elm: string, val: string) => {
      setLogs(prev => [`[LMSSetValue] ${elm} = ${val}`, ...prev.slice(0, 9)]);
      useScormStore.getState().setCmiValue(elm, val);
    });

    api.on(ScormEventEnum.SET_VALUE, (elm: string, val: string) => {
      setLogs(prev => [`[SetValue] ${elm} = ${val}`, ...prev.slice(0, 9)]);
      useScormStore.getState().setCmiValue(elm, val);
    });

    api.on(ScormEventEnum.LMS_INITIALIZE, () => {
      setLogs(prev => [`[LMSInitialize] Session started`, ...prev.slice(0, 9)]);
      syncFullCmi();
    });

    api.on(ScormEventEnum.INITIALIZE, () => {
      setLogs(prev => [`[Initialize] Session started`, ...prev.slice(0, 9)]);
      syncFullCmi();
    });

    api.on(ScormEventEnum.LMS_FINISH, () => {
      setLogs(prev => [`[LMSFinish] Session ended`, ...prev.slice(0, 9)]);
    });

    api.on(ScormEventEnum.TERMINATE, () => {
      setLogs(prev => [`[Terminate] Session ended`, ...prev.slice(0, 9)]);
    });

    api.on(ScormEventEnum.LMS_COMMIT, () => {
      setLogs(prev => [`[LMSCommit] Progress saved`, ...prev.slice(0, 9)]);
      syncFullCmi();
    });

    api.on(ScormEventEnum.COMMIT, () => {
      setLogs(prev => [`[Commit] Progress saved`, ...prev.slice(0, 9)]);
      syncFullCmi();
    });

    // setIsApiReady(true) is called here to signal that the API is attached to window
    // and the iframe can be loaded.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsApiReady(true);
    // Proactively sync initial state even before course calls Initialize
    syncFullCmi();
    console.log(`DEBUG: ScormPlayer initialized for version ${version}`);

    // Cleanup
    return () => {
      delete (window as any).API;
      delete (window as any).API_1484_11;
    };
  }, [version, courseId, setCmiValue, conformanceMode]);

  if (!launchUrl) return null;

  return (
    <div className="flex flex-col gap-4 animate-in fade-in duration-500 w-full max-w-5xl mx-auto">
      <div className="flex items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div>
          <h2 className="font-bold text-gray-800 text-lg">{title}</h2>
          <span className="text-xs font-mono text-gray-400 bg-gray-50 px-2 py-1 rounded">
            SCORM {version}
          </span>
        </div>
        <div className="flex gap-2 items-center">
          {/* Responsive Toggles */}
          <div className="flex bg-gray-100 p-1 rounded-lg mr-2">
            <button
              onClick={() => setViewportSize('full')}
              className={`p-1.5 rounded-md transition-all ${viewportSize === 'full' ? 'bg-white shadow-sm text-primary' : 'text-gray-400 hover:text-gray-600'}`}
              title="Full Width"
            >
              <Maximize2 size={16} />
            </button>
            <button
              onClick={() => setViewportSize('desktop')}
              className={`p-1.5 rounded-md transition-all ${viewportSize === 'desktop' ? 'bg-white shadow-sm text-primary' : 'text-gray-400 hover:text-gray-600'}`}
              title="Desktop (1280px)"
            >
              <Monitor size={16} />
            </button>
            <button
              onClick={() => setViewportSize('tablet')}
              className={`p-1.5 rounded-md transition-all ${viewportSize === 'tablet' ? 'bg-white shadow-sm text-primary' : 'text-gray-400 hover:text-gray-600'}`}
              title="Tablet (768px)"
            >
              <Tablet size={16} />
            </button>
            <button
              onClick={() => setViewportSize('mobile')}
              className={`p-1.5 rounded-md transition-all ${viewportSize === 'mobile' ? 'bg-white shadow-sm text-primary' : 'text-gray-400 hover:text-gray-600'}`}
              title="Mobile (375px)"
            >
              <Smartphone size={16} />
            </button>
          </div>

          {/* Conformance Toggle */}
          <button
            onClick={() => setConformanceMode(conformanceMode === 'strict' ? 'lenient' : 'strict')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all text-xs font-semibold mr-2
              ${conformanceMode === 'strict'
                ? 'bg-amber-50 border-amber-200 text-amber-700'
                : 'bg-green-50 border-green-200 text-green-700'}`}
            title={`Current: ${conformanceMode === 'strict' ? 'Strict' : 'Lenient'}. Click to toggle.`}
          >
            {conformanceMode === 'strict' ? <ShieldCheck size={14} /> : <ShieldAlert size={14} />}
            {conformanceMode === 'strict' ? 'Strict Mode' : 'Lenient Mode'}
          </button>

          <button
            onClick={reset}
            className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors"
            title="Upload new course"
          >
            <Upload size={20} />
          </button>
        </div>
      </div>

      <div
        className={`relative bg-black/5 rounded-2xl overflow-hidden shadow-inner border border-gray-200 mx-auto transition-all duration-300 ease-in-out
          ${viewportSize === 'full' ? 'w-full aspect-video' : ''}
          ${viewportSize === 'desktop' ? 'w-[1280px] max-w-full aspect-video' : ''}
          ${viewportSize === 'tablet' ? 'w-[768px] max-w-full aspect-[3/4] md:aspect-video' : ''}
          ${viewportSize === 'mobile' ? 'w-[375px] max-w-full aspect-[9/16]' : ''}
        `}
      >
        {isApiReady ? (
          <iframe
            ref={iframeRef}
            src={launchUrl}
            className="w-full h-full border-0"
            title="SCORM Content"
            allowFullScreen
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-50">
            <div className="flex flex-col items-center gap-2">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              <p className="text-xs font-medium text-gray-400 font-mono">Initializing LMS API...</p>
            </div>
          </div>
        )}
      </div>

      {/* Mini Debugger */}
      <div className="bg-gray-900 text-green-400 p-4 rounded-xl font-mono text-xs h-32 overflow-y-auto shadow-md">
        <div className="flex items-center gap-2 text-gray-500 mb-2 border-b border-gray-800 pb-1">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
          LMS Communication Log
        </div>
        {logs.length === 0 ? (
          <span className="text-gray-600 opacity-50">Waiting for SCORM API calls...</span>
        ) : (
          logs.map((log, i) => (
            <div key={i} className="opacity-80 py-0.5">{log}</div>
          ))
        )}
      </div>
    </div>
  );
};

declare global {
  interface Window {
    API: any;
    API_1484_11: any;
  }
}

