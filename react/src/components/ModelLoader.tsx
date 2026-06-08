import React from 'react';
import { type ModelMetadata } from '../services/storage';

interface ModelLoaderProps {
  onFileSelect: (file: File) => void;
  onModelSelect: (metadata: ModelMetadata) => void;
  availableModels: ModelMetadata[];
  currentModel: ModelMetadata | null;
  loading: boolean;
  progress: number;
  error: string | null;
}

export const ModelLoader: React.FC<ModelLoaderProps> = ({
  onFileSelect,
  onModelSelect,
  availableModels,
  currentModel,
  loading,
  progress,
  error,
}) => {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
  };

  return (
    <div className="model-loader">
      <h3>Select Model</h3>
      
      <div className="file-input-wrapper">
        <label className="button secondary">
          Select .gguf File
          <input type="file" accept=".gguf" onChange={handleFileChange} disabled={loading} hidden />
        </label>
      </div>

      {availableModels.length > 0 && (
        <div className="stored-models">
          <h4>Stored Models</h4>
          <ul>
            {availableModels.map((m) => (
              <li key={m.fileName}>
                <button 
                  className={`model-item ${currentModel?.fileName === m.fileName ? 'active' : ''}`}
                  onClick={() => onModelSelect(m)}
                  disabled={loading}
                >
                  {m.name} ({(m.size / (1024 * 1024 * 1024)).toFixed(2)} GB)
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {loading && (
        <div className="loading-status">
          <p>Loading model... {Math.round(progress * 100)}%</p>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progress * 100}%` }}></div>
          </div>
        </div>
      )}

      {currentModel && !loading && (
        <div className="current-model-info">
          <p>Active: <strong>{currentModel.name}</strong></p>
        </div>
      )}

      {error && <p className="error">{error}</p>}
    </div>
  );
};
