import React, { useState, useEffect } from 'react';
import { Editor } from '@monaco-editor/react';
import io from 'socket.io-client';
import './App.css';

const socket = io('http://localhost:3001'); // Connect to the backend

function App() {
  const [files, setFiles] = useState(() => {
    const savedFiles = localStorage.getItem('files');
    return savedFiles ? JSON.parse(savedFiles) : [{ name: 'file1.js', content: '// File 1 content' }];
  });
  const [currentFileIndex, setCurrentFileIndex] = useState(0);

  useEffect(() => {
    localStorage.setItem('files', JSON.stringify(files));
  }, [files]);

  // Listen for code updates from other users
  useEffect(() => {
    socket.on('receive-code-update', (newCode) => {
      setFiles(prevFiles => {
        const updatedFiles = [...prevFiles];
        updatedFiles[currentFileIndex] = { ...updatedFiles[currentFileIndex], content: newCode };
        return updatedFiles;
      });
    });

    return () => {
      socket.off('receive-code-update');
    };
  }, [currentFileIndex]);

  const handleFileChange = (index) => {
    setCurrentFileIndex(index);
  };

  const handleEditorChange = (newCode) => {
    setFiles(prevFiles => {
      const newFiles = [...prevFiles];
      newFiles[currentFileIndex] = { ...newFiles[currentFileIndex], content: newCode };
      return newFiles;
    });

    // Emit the code update to the server
    socket.emit('code-update', newCode);
  };

  const addNewFile = () => {
    setFiles(prevFiles => {
      const newFile = { name: `file${prevFiles.length + 1}.js`, content: '// New file content' };
      return [...prevFiles, newFile];
    });
    setCurrentFileIndex(files.length);
  };

  const deleteFile = (index) => {
    if (files.length > 1) {
      setFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
      setCurrentFileIndex(prev => (prev >= index ? Math.max(0, prev - 1) : prev));
    } else {
      alert("You can't delete the last file.");
    }
  };

  return (
    <div className="App">
      <h1>Collaborative Code Editor</h1>
      <div className="editor-container">
        <div className="sidebar">
          <div className="file-actions">
            <button onClick={addNewFile}>New File</button>
            {files.length > 1 && (
              <button onClick={() => deleteFile(currentFileIndex)}>Delete Current File</button>
            )}
          </div>
          <div className="file-list">
            {files.map((file, index) => (
              <button
                key={file.name}
                onClick={() => handleFileChange(index)}
                className={index === currentFileIndex ? 'active' : ''}
              >
                {file.name}
              </button>
            ))}
          </div>
        </div>
        <div className="editor-wrapper">
          <Editor
            height="100%"
            language="javascript"
            theme="vs-dark"
            value={files[currentFileIndex].content}
            onChange={handleEditorChange}
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              scrollBeyondLastLine: false,
            }}
          />
        </div>
      </div>
    </div>
  );
}

export default App;