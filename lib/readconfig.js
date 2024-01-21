import { findUp } from 'find-up'

const configFile = '.siarc.js'

async function getConfig() {
  try {
    const siarc = await findUp(configFile)
    const { default: config } = await import(siarc)
    return config
  } catch (err) {
    throw new Error(`Unable to find and load the ${configFile} file.`)
  }
}
const config = await getConfig()
export default config ?? {
  app: {},
  site: {},
}
