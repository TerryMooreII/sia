import { findUp } from 'find-up'

async function getConfig() {
  try {
    const siarc = await findUp('siarc.js')
    const { default: config } = await import(siarc)
    return config
  } catch (err) {
    console.log('Unable to find and load the siarc.js file.')
  }
}
const config = await getConfig()
export default config ?? {
  app: {},
  site: {},
}
