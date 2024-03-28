const docker = require('./code/docker.ts');
const books = require('./code/books.ts');

books.clean();
books.build(true);
// docker.clean();
docker.build();