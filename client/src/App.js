import React, { useState, useEffect } from 'react';
import { Editor } from '@monaco-editor/react';
import io from 'socket.io-client';
import { v4 as uuidv4 } from 'uuid';
import './App.css';

const socket = io('http://localhost:3001'); // Change to your backend URL

function App() {
  const [files, setFiles] = useState([]);
  const [currentFileIndex, setCurrentFileIndex] = useState(0);
  const [isConnected, setIsConnected] = useState(socket.connected);

  useEffect(() => {
    socket.on('connect', () => {
      setIsConnected(true);
      socket.emit('get-initial-files');
    });
    socket.on('disconnect', () => setIsConnected(false));
    socket.on('initial-files', (initialFiles) => {
      setFiles(initialFiles);
    });
    socket.on('file-added', (newFile) => {
      setFiles(prevFiles => [...prevFiles, newFile]);
    });
    socket.on('file-deleted', (fileId) => {
      setFiles(prevFiles => prevFiles.filter(file => file.id !== fileId));
      setCurrentFileIndex(prev => (prev >= files.length - 1 ? Math.max(0, prev - 1) : prev));
    });
    socket.on('file-renamed', ({ fileId, newName }) => {
      setFiles(prevFiles => prevFiles.map(file => 
        file.id === fileId ? { ...file, name: newName } : file
      ));
    });
    socket.on('file-content-updated', ({ fileId, newContent }) => {
      setFiles(prevFiles => prevFiles.map(file => 
        file.id === fileId ? { ...file, content: newContent } : file
      ));
    });

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('initial-files');
      socket.off('file-added');
      socket.off('file-deleted');
      socket.off('file-renamed');
      socket.off('file-content-updated');
    };
  }, []);

  const addNewFile = () => {
    const newFile = { id: uuidv4(), name: `file${files.length + 1}.js`, content: '// New file content' };
    socket.emit('add-file', newFile);
  };

  const deleteFile = (index) => {
    if (files.length > 1) {
      socket.emit('delete-file', files[index].id);
    } else {
      alert("You can't delete the last file.");
    }
  };

  const renameFile = (index, newName) => {
    socket.emit('rename-file', { fileId: files[index].id, newName });
  };

  const handleEditorChange = (newContent) => {
    const currentFile = files[currentFileIndex];
    socket.emit('update-file-content', { fileId: currentFile.id, newContent });
  };

  return (
    <div className="App">
      <Header title="Collaborative Code Editor" isConnected={isConnected} />
      <div className="editor-container">
        <Sidebar
          files={files}
          currentFileIndex={currentFileIndex}
          onFileChange={setCurrentFileIndex}
          onAddFile={addNewFile}
          onDeleteFile={deleteFile}
          onRenameFile={renameFile}
        />
        {files.length > 0 && (
          <EditorWrapper
            content={files[currentFileIndex].content}
            language={getFileLanguage(files[currentFileIndex].name)}
            onEditorChange={handleEditorChange}
          />
        )}
      </div>
    </div>
  );
}

const Header = ({ title, isConnected }) => (
  <h1>
    {title}
    <span className={`connection-status ${isConnected ? 'connected' : 'disconnected'}`}>
      {isConnected ? 'Connected' : 'Disconnected'}
    </span>
  </h1>
);

const Sidebar = ({ files, currentFileIndex, onFileChange, onAddFile, onDeleteFile, onRenameFile }) => (
  <div className="sidebar">
    <div className="file-actions">
      <button onClick={onAddFile}>New File</button>
      {files.length > 1 && (
        <button onClick={() => onDeleteFile(currentFileIndex)}>Delete Current File</button>
      )}
    </div>
    <div className="file-list">
      {files.map((file, index) => (
        <div key={file.id} className="file-item">
          <button
            onClick={() => onFileChange(index)}
            className={index === currentFileIndex ? 'active' : ''}
          >
            {file.name}
          </button>
          <button onClick={() => {
            const newName = prompt('Enter new file name:', file.name);
            if (newName) onRenameFile(index, newName);
          }}>
            Rename
          </button>
        </div>
      ))}
    </div>
  </div>
);

const EditorWrapper = ({ content, language, onEditorChange }) => (
  <div className="editor-wrapper">
    <Editor
      height="100%"
      language={language}
      theme="vs-dark"
      value={content}
      onChange={onEditorChange}
      options={{
        minimap: { enabled: false },
        fontSize: 14,
        scrollBeyondLastLine: false,
        automaticLayout: true,
      }}
    />
  </div>
);

const getFileLanguage = (fileName) => {
  const extension = fileName.split('.').pop().toLowerCase();
  const languageMap = {
    js: 'javascript',
    py: 'python',
    html: 'html',
    css: 'css',
    json: 'json',
  };
  return languageMap[extension] || 'plaintext';
};

export default App;