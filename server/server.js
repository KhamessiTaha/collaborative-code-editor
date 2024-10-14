const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

let files = [
  { id: '1', name: 'file1.js', content: '// File 1 content' }
];

function getUniqueFileName(baseName) {
  let name = baseName;
  let counter = 1;
  while (files.some(file => file.name === name)) {
    name = `${baseName.split('.')[0]}(${counter}).${baseName.split('.')[1]}`;
    counter++;
  }
  return name;
}

io.on('connection', (socket) => {
  console.log('A user connected');

  socket.on('get-initial-files', () => {
    socket.emit('initial-files', files);
  });

  socket.on('add-file', (newFile) => {
    newFile.name = getUniqueFileName(newFile.name);
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
      const uniqueName = getUniqueFileName(newName);
      file.name = uniqueName;
      io.emit('file-renamed', { fileId, newName: uniqueName });
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