import JSZip from 'jszip';
import { v4 as uuidv4 } from 'uuid';
import { dbUtility } from '@/utils/db';

export interface ProcessedScorm {
  courseId: string;
  title: string;
  version: '1.1' | '1.2' | '2004';
  launchUrl: string;
  warning?: string | null;
}

/**
 * Service for SCORM-specific business logic.
 * Handles ZIP extraction, manifest parsing, and orchestrates storage via dbUtility.
 */
export const scormService = {
  /**
   * Unzips the package, parses metadata, and stores files in the DB.
   */
  async processAndStore(file: File): Promise<ProcessedScorm> {
    const courseId = uuidv4();
    const zip = await JSZip.loadAsync(file);
    
    const filePromises: Promise<void>[] = [];
    let manifestContent = '';

    for (const [relativePath, zipEntry] of Object.entries(zip.files)) {
      if (zipEntry.dir) continue;
      
      const content = await zipEntry.async('blob');
      // Store in DB via the generic DB service
      filePromises.push(dbUtility.put(`${courseId}:${relativePath}`, content));
      
      const lowerName = relativePath.toLowerCase();
      if (lowerName === 'imsmanifest.xml' || (lowerName.endsWith('.xml') && !manifestContent)) {
        manifestContent = await zipEntry.async('string');
      }
    }

    if (!manifestContent) throw new Error('Manifest file not found in package');

    await Promise.all(filePromises);

    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(manifestContent, 'text/xml');
    const { version, warning } = this._detectVersion(xmlDoc);

    const metadata = this._extractMetadata(xmlDoc, version);

    return {
      courseId,
      ...metadata,
      version,
      launchUrl: `/api/content/${courseId}/${metadata.launchHref}`,
      warning,
    };
  },

  /**
   * Internal helper to detect SCORM version from manifest.
   */
  _detectVersion(doc: Document): { version: '1.1' | '1.2' | '2004'; warning?: string | null } {
    const metadata = doc.querySelector('metadata');
    const schemaVersion = metadata?.querySelector('schemaversion')?.textContent || '';
    
    if (schemaVersion.includes('1.2')) return { version: '1.2' };
    if (schemaVersion.includes('2004') || schemaVersion.includes('CAM')) return { version: '2004' };

    if (!doc.querySelector('organizations') && doc.querySelector('block')) return { version: '1.1' };

    return { 
      version: '1.2', 
      warning: 'SCORM version could not be clearly identified. Defaulting to 1.2 environment.' 
    };
  },

  /**
   * Internal helper to extract title and launch URL.
   */
  _extractMetadata(doc: Document, version: string): { title: string; launchHref: string } {
    let title = 'Untitled Course';
    let launchHref = '';

    if (version === '1.1') {
      title = doc.querySelector('block > identification > title')?.textContent || 'Untitled 1.1 Course';
      launchHref = doc.querySelector('block > sco > launch > location')?.textContent || '';
    } else {
      title = doc.querySelector('organization > title')?.textContent || 'Untitled Course';
      const resources = Array.from(doc.querySelectorAll('resource'));
      const scoRes = resources.find(r => r.getAttribute('adlcp:scormType') === 'sco' || r.getAttribute('scormtype') === 'sco') || resources[0];
      launchHref = scoRes?.getAttribute('href') || '';
    }

    return { title, launchHref };
  }
};
