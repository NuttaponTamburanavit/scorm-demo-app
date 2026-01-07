import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import os from 'os';
import mime from 'mime'; // We might need to install 'mime-types' or similar if 'mime' isn't available, but standard node doesn't have it built-in. Let's use a simple map or install a package.

// Simple mime map to avoid extra dependencies if possible, or we can add 'mime-types' to the install list.
// For robustness, I should probably check if I can use a library. 
// I'll add a simple helper for common web types for now.

function getMimeType(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();
  const types: Record<string, string> = {
    '.html': 'text/html',
    '.htm': 'text/html',
    '.js': 'application/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.xml': 'application/xml',
    '.mp4': 'video/mp4',
    '.mp3': 'audio/mpeg',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
  };
  return types[ext] || 'application/octet-stream';
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ courseId: string; path: string[] }> }
) {
  const resolvedParams = await params;
  const { courseId, path: filePathArray } = resolvedParams;
  
  if (!courseId || !filePathArray) {
    return new NextResponse('Not Found', { status: 404 });
  }

  const relativePath = filePathArray.join('/');
  // Prevent path traversal
  if (relativePath.includes('..')) {
    return new NextResponse('Forbidden', { status: 403 });
  }

  const fullPath = path.join(os.tmpdir(), 'scorm-demo', courseId, relativePath);

  if (!fs.existsSync(fullPath)) {
    console.error(`File not found: ${fullPath}`);
    return new NextResponse('Not Found', { status: 404 });
  }

  try {
    const fileBuffer = fs.readFileSync(fullPath);
    const contentType = getMimeType(fullPath);

    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        // SCORM content often requires specific cache settings
        'Cache-Control': 'no-store, must-revalidate',
      },
    });
  } catch (error) {
    console.error('Error serving file:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
