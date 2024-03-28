const package = require('./code/package.ts');
package.clean();
package.copyFiles()
package.package();