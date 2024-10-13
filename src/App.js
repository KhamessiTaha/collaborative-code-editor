import React, { useState, useEffect } from 'react';
import { Editor } from '@monaco-editor/react';

function App() {
  const [files, setFiles] = useState(() => {
    const savedFiles = localStorage.getItem('files');
    return savedFiles ? JSON.parse(savedFiles) : [{ name: 'file1.js', content: '// File 1 content' }];
  });
  const [currentFileIndex, setCurrentFileIndex] = useState(0);

  useEffect(() => {
    localStorage.setItem('files', JSON.stringify(files));
  }, [files]);

  const handleFileChange = (index) => {
    setCurrentFileIndex(index);
  };

  const handleEditorChange = (newCode) => {
    setFiles(prevFiles => {
      const newFiles = [...prevFiles];
      newFiles[currentFileIndex] = { ...newFiles[currentFileIndex], content: newCode };
      return newFiles;
    });
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
            style={{ fontWeight: index === currentFileIndex ? 'bold' : 'normal' }}
          >
            {file.name}
          </button>
        ))}
      </div>
      <Editor
        height="80vh"
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
  );
}

export default App;