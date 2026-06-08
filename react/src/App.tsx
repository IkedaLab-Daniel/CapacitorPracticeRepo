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
    loadModelFromFile,
    loadStoredModel,
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
          availableModels={availableModels}
          currentModel={currentModel}
          loading={modelLoading}
          progress={modelProgress}
          error={modelError}
        />

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
