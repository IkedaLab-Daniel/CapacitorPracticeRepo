import React from 'react';
import './App.css';
import { useModel } from './hooks/useModel';
import { useChat } from './hooks/useChat';
import { ModelLoader } from './components/ModelLoader';
import { ChatWindow } from './components/ChatWindow';

const App: React.FC = () => {
  const {
    loading: modelLoading,
    progress: modelProgress,
    error: modelError,
    currentModel,
    availableModels,
    nativeFiles,
    loadModelFromFile,
    loadStoredModel,
    loadNativeModel,
    refreshNativeFiles,
  } = useModel();

  const {
    messages,
    isGenerating,
    sendMessage,
    clearChat,
  } = useChat(currentModel?.fileName);

  return (
    <div className="app-container">
      <header>
        <h1>XiaoBai AI</h1>
        <p>Offline Local LLM Chat</p>
      </header>

      <main className="app-container">
        <ModelLoader
          onFileSelect={loadModelFromFile}
          onModelSelect={loadStoredModel}
          onNativeSelect={loadNativeModel}
          availableModels={availableModels}
          nativeFiles={nativeFiles}
          currentModel={currentModel}
          loading={modelLoading}
          progress={modelProgress}
          error={modelError}
        />

        {nativeFiles.length > 0 && (
          <button className="button secondary" onClick={refreshNativeFiles} style={{ marginBottom: '1rem' }}>
            Refresh Native Files
          </button>
        )}

        <ChatWindow
          messages={messages}
          onSendMessage={sendMessage}
          isGenerating={isGenerating}
          disabled={!currentModel}
        />
        
        {messages.length > 0 && (
          <button className="button secondary" onClick={clearChat} style={{ marginTop: '1rem' }}>
            Clear Chat
          </button>
        )}
      </main>

      <footer>
        <small>Powered by Wllama (llama.cpp WASM)</small>
      </footer>
    </div>
  );
};

export default App;
