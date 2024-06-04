const package = require('./code/package.ts');
const server = require('./code/server.ts');
const webui = require('./code/webui.ts');

webui.clean();
webui.build();

server.clean();
server.build();

package.clean();
package.copyFiles()
package.package();