import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const htmlPath = join(process.cwd(), 'coverage', 'index.html');
if (existsSync(htmlPath)) {
  console.log(`\nCoverage HTML report: ${pathToFileURL(htmlPath).href}`);
}
