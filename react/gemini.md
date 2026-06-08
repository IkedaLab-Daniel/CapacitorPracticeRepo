# Project: XiaoBai AI MVP

You are helping me build an MVP called XiaoBai AI.

## Goal

Create a fully client-side React PWA that works offline and allows users to load a local GGUF LLM file and chat with it.

No backend, no cloud inference, and no server-side AI processing.

The long-term vision is an offline travel assistant, but for this MVP, focus only on local AI chat.

---

## Requirements

### Tech Stack

* React
* Vite
* PWA support
* Modern browser APIs
* No backend

### MVP Features

1. User can select a local `.gguf` model file from:

   * Local storage
   * USB OTG storage on Android
   * File picker

2. App loads the selected model.

3. User can chat with the model.

4. Responses are generated locally.

5. App should work offline after loading.

6. Clean and minimal UI.

---

## Architecture

src/

* App.tsx
* components/

  * ModelLoader.tsx
  * ChatWindow.tsx
  * MessageList.tsx
  * PromptInput.tsx
* services/

  * llm.ts
  * storage.ts
* hooks/

  * useChat.ts
  * useModel.ts

---

## Model Runtime

Research and recommend the best browser-compatible approach for loading GGUF models.

Candidates:

* llama.cpp WebAssembly
* llama.cpp WebGPU
* WebLLM
* Transformers.js

Choose the approach that provides the best support for user-supplied GGUF files.

Explain the tradeoffs before implementation.

---

## Model Loading

Implement:

* Select GGUF file
* Validate extension
* Show file size
* Load model
* Show loading progress
* Handle errors gracefully

Example UI:

[ Select Model ]

Selected:
Qwen-1.5B.gguf

Size:
1.2 GB

Status:
Loading...

---

## Chat UI

Simple ChatGPT-style layout.

Requirements:

* Scrollable messages
* User messages
* Assistant messages
* Loading state
* Streaming output if supported

---

## Persistence

Persist:

* Chat history
* Selected model metadata

Use:

* IndexedDB

Do not use localStorage for large files.

If browser APIs permit, investigate storing model files in IndexedDB for future sessions.

---

## PWA

Configure:

* Manifest
* Service worker
* Offline support

Goal:

User can install XiaoBai to Android home screen.

---

## Code Quality

* Strict TypeScript
* Functional React components
* Reusable hooks
* Clear folder structure
* No unnecessary dependencies

---

## Deliverables

1. Recommended local inference strategy.
2. Project structure.
3. Dependency list.
4. Initial implementation.
5. Step-by-step explanation.
6. Working code files ready to run.

Do not provide pseudo-code. Generate production-ready code where possible.
