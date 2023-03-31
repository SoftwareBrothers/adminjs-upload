import path from 'path';
import * as url from 'url';

import type { ComponentLoader } from 'adminjs';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
const bundleComponent = (
  loader: ComponentLoader,
  componentName: string,
) => {
  const componentPath = path.join(__dirname, `../components/${componentName}`)
  return loader.add(componentName, componentPath)
}

export default bundleComponent
