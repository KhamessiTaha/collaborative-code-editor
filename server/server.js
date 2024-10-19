const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

let files = [
  { id: '1', name: 'file1.js', content: '// File 1 content' }
];

io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  // Implement token verification logic here
  if (isValidToken(token)) {
    next();
  } else {
    next(new Error("Authentication error"));
  }
});

io.on('connection', (socket) => {
  console.log('A user connected');

  socket.on('get-initial-files', () => {
    socket.emit('initial-files', files);
  });

  socket.on('add-file', (newFile) => {
    newFile.id = uuidv4();
    files.push(newFile);
    io.emit('file-added', newFile);
  });

  socket.on('delete-file', (fileId) => {
    files = files.filter(file => file.id !== fileId);
    io.emit('file-deleted', fileId);
  });

  socket.on('rename-file', ({ fileId, newName }) => {
    const file = files.find(file => file.id === fileId);
    if (file) {
      file.name = newName;
      io.emit('file-renamed', { fileId, newName });
    }
  });

  socket.on('update-file-content', ({ fileId, newContent }) => {
    const file = files.find(file => file.id === fileId);
    if (file) {
      file.content = newContent;
      socket.broadcast.emit('file-content-updated', { fileId, newContent });
    }
  });

  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

function isValidToken(token) {
  // Implement your token validation logic here
  return true; // Placeholder
}