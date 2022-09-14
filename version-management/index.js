import PomConverter from './PomConverter.js'

const pomConverter = new PomConverter('../bom/pom.xml')
const {sdkName, sdkVersion} = process.env
pomConverter.updateAndSavePomFile(sdkName, sdkVersion);