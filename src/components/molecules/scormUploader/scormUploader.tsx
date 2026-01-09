'use client';
import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, AlertCircle, Loader2 } from 'lucide-react';
import { useScormStore } from '@/store/useScormStore';
import { toast } from 'sonner';
import { uploadScormAction } from '@/app/actions/upload';

const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB

export const ScormUploader = () => {
  const { setUploading, setReady, setError, status } = useScormStore();

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    if (!file.name.endsWith('.zip')) {
      const msg = 'Please upload a valid .zip SCORM package.';
      setError(msg);
      toast.error(msg);
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      const msg = `File is too large (${(file.size / 1024 / 1024).toFixed(2)}MB). Maximum allowed size is 25MB.`;
      setError(msg);
      toast.error(msg);
      return;
    }

    setUploading();
    const loadingToast = toast.loading('Uploading and processing SCORM package...');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const data = await uploadScormAction(formData);

      if (data.error) {
        throw new Error(data.error);
      }

      setReady({
        courseId: data.courseId!,
        title: data.title!,
        version: data.version!,
        launchUrl: data.launchUrl!,
        warning: data.warning,
      });
      toast.success('Course uploaded successfully!', { id: loadingToast });
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMsg);
      toast.error(errorMsg, { id: loadingToast });
    }
  }, [setUploading, setReady, setError]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/zip': ['.zip'] },
    maxFiles: 1,
    disabled: status === 'uploading' || status === 'processing',
  });

  const { warning, error } = useScormStore();

  return (
    <div className="space-y-4 w-full">
      {error && (
        <div className="bg-red-50 border border-red-200 p-4 rounded-xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
          <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
          <div className="text-sm">
            <p className="font-bold text-red-800">Upload Failed</p>
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      )}
      {warning && (
        <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
          <AlertCircle className="w-5 h-5 text-amber-500 mt-0.5" />
          <div className="text-sm">
            <p className="font-bold text-amber-800">Version Mismatch / Ambiguity</p>
            <p className="text-amber-700">{warning}</p>
          </div>
        </div>
      )}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-xl p-10 text-center transition-all cursor-pointer bg-white/50 backdrop-blur-sm
          ${isDragActive ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-primary/50 hover:bg-white/80'}
          ${(status === 'uploading' || status === 'processing') ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-4 text-gray-600">
          {status === 'uploading' || status === 'processing' ? (
            <>
              <Loader2 className="w-12 h-12 text-primary animate-spin" />
              <p className="font-medium animate-pulse">Processing SCORM Package...</p>
            </>
          ) : (
            <>
              <div className="p-4 bg-primary/10 rounded-full text-primary">
                <Upload className="w-8 h-8" />
              </div>
              <div>
                <p className="font-semibold text-lg text-gray-800">
                  {isDragActive ? 'Drop your SCORM package here' : 'Click to upload or drag & drop'}
                </p>
                <p className="text-sm text-gray-400 mt-1">Supports SCORM 1.1, 1.2 & 2004 (.zip)</p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
