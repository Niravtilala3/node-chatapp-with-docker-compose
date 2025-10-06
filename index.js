const express = require('express');
const app = express();
const { Server } = require('socket.io');
const http = require('http');
const os = require('os');
const server = http.createServer(app);

// Trust proxy so socket.io / express see correct client IP and protocol behind nginx
app.set('trust proxy', true);

// Create io with CORS and allow both polling and websocket transports
const io = new Server(server, {
  cors: {
    // allow the origin (true reflects request Origin header), or set explicit origin(s)
    origin: true,
    methods: ["GET", "POST"],
    credentials: true
  },
  transports: ['websocket', 'polling'],
  path: "/socket.io", // Explicitly set path
});

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

// New endpoint: return container id (hostname)
app.get('/container-id', (req, res) => {
    res.json({ containerId: os.hostname() });
});

io.on('connection', (socket) => {
    socket.on('chat message', (data) => {
        // data: { name, message }
        console.log(data)
        io.emit('chat message', data);
    });
});

const port = 3000;
server.listen(port, '0.0.0.0', () => { // Listen on all interfaces
    console.log(`Server is listening at the port: ${port}`);
});