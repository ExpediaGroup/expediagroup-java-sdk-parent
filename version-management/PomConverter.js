import {convert, fs} from "./bundle.js"
import {isLeaf, searchAndPerformActionOnSpecificNode} from "./utils.js"


class PomConverter {
    constructor(pomFileLocation) {
        this.pomFileLocation = pomFileLocation
        this.pom = fs.readFileSync(pomFileLocation, 'utf8');
        this.pomInJsFormat = convert.xml2js(this.pom)
        this.targetParent = null
    }

    findSdkNode(node, parent, name, targetText) {
        if (node.name === name && node?.elements[0]?.text === targetText) {
            this.targetParent = parent;
        } else if (isLeaf(node)) return
        else {
            for (const element of node?.elements) {
                this.findSdkNode(element, node, name, targetText)
                if (this.targetParent !== null) return;
            }
        }
    }

    updatePomFile(sdkName, sdkVersion) {
        this.findSdkNode(this.pomInJsFormat, this.pomInJsFormat, 'artifactId', sdkName)
        if (this.targetParent !== null) {
            searchAndPerformActionOnSpecificNode(this.targetParent, 'version', (node) => {
                node.elements[0].text = sdkVersion
            })
        } else {
            // save the new dependency in the pom
            searchAndPerformActionOnSpecificNode(this.pomInJsFormat, 'dependencies', (node) => {
                node.elements.push(
                    {
                        type: 'element',
                        name: 'dependency',
                        elements: [
                            {
                                type: 'element',
                                name: 'groupId',
                                elements: [{type: 'text', text: 'com.expediagroup.openworld.sdk'}]
                            },
                            {
                                type: 'element',
                                name: 'artifactId',
                                elements: [{type: 'text', text: sdkName}]
                            }
                            ,
                            {
                                type: 'element',
                                name: 'version',
                                elements: [{type: 'text', text: sdkVersion}]
                            }
                        ]
                    }
                )
            })
        }
        let version = this.updateBomVersion();
        this.updateTimeStamp();
        return version
    }

    updateTimeStamp() {
        searchAndPerformActionOnSpecificNode(this.pomInJsFormat, 'timestamp', (timestamp) => {
            timestamp.elements[0].text = Date.now()
        })
    }

    updateBomVersion() {
        let version = this.pomInJsFormat.elements[0].elements.filter((element) => element.name === 'version'
        )[0].elements[0];
        let lastDigit = version.text[version.text.length - 1];
        if (!isNaN(lastDigit)) {
            version.text = version.text.slice(0, -1) + (parseInt(lastDigit) + 1)
        } else {
            version.text = version.text + '.1'
        }
        return version
    }

    getXml() {
        return convert.js2xml(this.pomInJsFormat, {
            compact: false,
            ignoreComment: false,
            spaces: 4
        })
    }

    updateAndSavePomFile(sdkName, sdkVersion, newPomVersion) {
        let version = this.updatePomFile(sdkName, sdkVersion, newPomVersion);
        fs.writeFile(this.pomFileLocation, this.getXml(), (err) => {
            console.log(version.text)
        });
    }
}

export default PomConverter

