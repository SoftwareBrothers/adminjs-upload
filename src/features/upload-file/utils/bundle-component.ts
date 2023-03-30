import path from 'path'

import type { ComponentLoader } from 'adminjs'

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
const bundleComponent = (
  loader: ComponentLoader,
  componentName: string,
) => {
  const componentPath = path.join(__dirname, `../components/${componentName}`)
  return loader.add(componentName, componentPath)
}

export default bundleComponent
