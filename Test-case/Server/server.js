const http = require('http');
const url = require('url');

const server = http.createServer((req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');

    const parsedUrl = url.parse(req.url, true);    
    const id = parsedUrl.query.id;
    
    if (id) {
        console.log('Received id:', id);
        res.writeHead(200, {'Content-Type': 'text/plain'});
        res.end('You Sent id: ' + id);
    } else {
        res.writeHead(400, {'Content-Type': 'text/plain'});
        res.end('Bad Request: Missing id parameter');
    }
});

server.listen(3000, () => {
    console.log('Server running at http://localhost:3000/');
});
