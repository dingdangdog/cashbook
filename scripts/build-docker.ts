const docker = require('./code/docker.ts');
const webui = require('./code/webui.ts');

webui.clean();
webui.build(true);
// docker.clean();
docker.build();