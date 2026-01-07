import { create } from 'zustand';

interface ScormState {
  courseId: string | null;
  title: string | null;
  version: '1.1' | '1.2' | '2004' | null;
  launchUrl: string | null;
  status: 'idle' | 'uploading' | 'processing' | 'ready' | 'error';
  error: string | null;
  warning: string | null;
  cmi: Record<string, string | number | boolean | null>;
  
  setUploading: () => void;
  setProcessing: () => void;
  setReady: (data: { courseId: string; title: string; version: '1.1' | '1.2' | '2004'; launchUrl: string; warning?: string | null }) => void;
  setError: (error: string) => void;
  setCmiValue: (key: string, value: string | number | boolean | null) => void;
  reset: () => void;
}

export const useScormStore = create<ScormState>((set) => ({
  courseId: null,
  title: null,
  version: null,
  launchUrl: null,
  status: 'idle',
  error: null,
  warning: null,
  cmi: {},

  setUploading: () => set({ status: 'uploading', error: null, warning: null }),
  setProcessing: () => set({ status: 'processing', error: null }),
  setReady: (data) => set({ ...data, status: 'ready', error: null, cmi: {}, warning: data.warning || null }),
  setError: (error) => set({ status: 'error', error, warning: null }),
  setCmiValue: (key, value) => set((state) => ({
    cmi: { ...state.cmi, [key]: value }
  })),
  reset: () => set({
    courseId: null,
    title: null,
    version: null,
    launchUrl: null,
    status: 'idle',
    error: null,
    warning: null,
    cmi: {}
  }),
}));
