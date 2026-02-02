import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// =====================================
// TEMP GLOBAL base44 MOCK (LOCAL DEV)
// =====================================
window.base44 = {
  entities: new Proxy({}, {
    get: () => ({
      list: async () => [],
      get: async () => null,
      create: async () => ({ success: true }),
      update: async () => ({ success: true }),
      delete: async () => ({ success: true }),
    })
  }),

  integrations: {
    Core: {
      InvokeLLM: async () => ({ success: true }),
      SendEmail: async () => ({ success: true }),
      UploadFile: async () => ({ success: true }),
      GenerateImage: async () => ({ success: true }),
      ExtractDataFromUploadedFile: async () => ({ success: true }),
      CreateFileSignedUrl: async () => ({ success: true }),
      UploadPrivateFile: async () => ({ success: true }),
    }
  },

  auth: {
    current: async () => ({
      id: 1,
      name: 'Local Dev User',
      role: 'admin',
    })
  }
};
// =====================================

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
