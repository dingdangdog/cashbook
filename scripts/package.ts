const package = require('./code/package.ts');
const server = require('./code/server.ts');
const books = require('./code/books.ts');

books.clean();
books.build();

server.clean();
server.build();

package.clean();
package.copyFiles()
package.package();