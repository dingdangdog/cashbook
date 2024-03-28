const books = require('./code/books.ts');
const server = require('./code/server.ts');
const docker = require('./code/docker.ts');

books.clean();
books.build();

server.clean();
server.build();

docker.clean();
docker.build();