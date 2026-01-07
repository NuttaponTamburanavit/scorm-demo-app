import { NextRequest, NextResponse } from 'next/server';
import AdmZip from 'adm-zip';
import { parseStringPromise } from 'xml2js';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import os from 'os';

// Helper to determine SCORM version from manifest with enhanced validation
// Helper to determine SCORM version from manifest with enhanced validation
const detectVersion = (manifest: any): { version: '1.1' | '1.2' | '2004'; warning?: string | null } => {
  // Check for SCORM 1.1 CSF root structure (<content> with <block> or <globalProperties>)
  const is11 = manifest?.block || manifest?.['block'] || manifest?.globalProperties;
  if (is11 && !manifest.organizations && !manifest.resources) {
     return { version: '1.1' };
  }
  
  const metadata = manifest?.metadata?.[0] || manifest?.['imscp:metadata']?.[0];
  const schemaVersion = metadata?.schemaversion?.[0] || metadata?.['imscp:schemaversion']?.[0];
  
  if (schemaVersion?.includes('1.2')) return { version: '1.2' };
  if (schemaVersion?.includes('2004') || schemaVersion?.includes('CAM')) return { version: '2004' };
  
  const model = manifest?.globalProperties?.[0]?.externalMetadata?.[0]?.model?.[0];
  if (model?.includes('1.1')) return { version: '1.1' };

  // Fallback heuristic check on namespaces
  const namespaces = manifest?.$ ? Object.keys(manifest.$) : [];
  if (namespaces.some(ns => ns.includes('adlcp_v1p3') || ns.includes('imsss'))) return { version: '2004' };

  return { 
    version: '1.2', 
    warning: 'SCORM version could not be clearly identified. Defaulting to 1.2 environment.' 
  };
};

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const courseId = uuidv4();
    const uploadDir = path.join(os.tmpdir(), 'scorm-demo', courseId);
    
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

    const zipPath = path.join(uploadDir, 'package.zip');
    fs.writeFileSync(zipPath, buffer);

    const zip = new AdmZip(zipPath);
    zip.extractAllTo(uploadDir, true);

    let manifestPath = path.join(uploadDir, 'imsmanifest.xml');
    if (!fs.existsSync(manifestPath)) {
        const files = fs.readdirSync(uploadDir);
        const candidates = files.filter(f => f.toLowerCase().endsWith('.xml'));
        // Try to find one that looks like a CSF or imsmanifest (case insensitive)
        const bestCandidate = candidates.find(f => f.toLowerCase() === 'csf.xml' || f.toLowerCase() === 'imsmanifest.xml') || candidates[0];
        if (bestCandidate) manifestPath = path.join(uploadDir, bestCandidate);
    }
    
    if (!fs.existsSync(manifestPath)) {
      return NextResponse.json({ error: 'Manifest file not found (.xml)' }, { status: 400 });
    }

    const manifestContent = fs.readFileSync(manifestPath, 'utf-8');
    const result = await parseStringPromise(manifestContent);
    const manifest = result.manifest || result['imscp:manifest'] || result.content;
    
    if (!manifest) return NextResponse.json({ error: 'Invalid manifest structure' }, { status: 400 });
    
    const { version, warning } = detectVersion(manifest);

    let title = 'Untitled Course';
    let launchHref: string | undefined;

    if (version === '1.1') {
        const block = manifest.block?.[0] || manifest.block;
        const identification = block?.identification?.[0] || block?.identification;
        title = identification?.title?.[0] || identification?.title || 'Untitled 1.1 Course';
        const sco = block?.sco?.[0] || block?.sco;
        launchHref = sco?.launch?.[0]?.location?.[0] || sco?.launch?.location;
    } else {
        const organization = manifest.organizations?.[0]?.organization?.[0];
        title = organization?.title?.[0] || 'Untitled Course';
        const resources = manifest.resources?.[0]?.resource || [];
        const launchRes = resources.find((r: any) => r.$?.['adlcp:scormType'] === 'sco') || resources[0];
        launchHref = launchRes?.$?.href;
    }
    
    if (!launchHref) return NextResponse.json({ error: 'Launch resource not found' }, { status: 400 });

    fs.unlinkSync(zipPath);

    return NextResponse.json({
      courseId,
      title,
      version,
      launchUrl: `/api/content/${courseId}/${launchHref}`,
      warning
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Internal server error processing package' }, { status: 500 });
  }
}
