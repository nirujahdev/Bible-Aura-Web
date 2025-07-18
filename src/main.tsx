import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import LoadingScreen from './components/LoadingScreen.tsx'

// Get root element with error handling
const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element not found. This is likely a build issue.");
}

// Create root with error handling
try {
  const root = createRoot(rootElement);
  
  // Render with loading fallback
  root.render(<App />);
  
  // Hide any initial loading screen
  const initialLoader = document.getElementById('initial-loader');
  if (initialLoader) {
    initialLoader.remove();
  }
} catch (error) {
  console.error('Failed to render React app:', error);
  
  // Fallback content in case React fails to load
  if (rootElement) {
    rootElement.innerHTML = `
      <div style="
        min-height: 100vh; 
        display: flex; 
        align-items: center; 
        justify-content: center;
        font-family: system-ui, -apple-system, sans-serif;
        background: white;
        color: #333;
      ">
        <div style="text-align: center; padding: 2rem;">
          <h1 style="color: #f85700; margin-bottom: 1rem;">✦Bible Aura</h1>
          <p>Unable to load the application. Please refresh the page.</p>
          <button 
            onclick="window.location.reload()" 
            style="
              background: #f85700; 
              color: white; 
              border: none; 
              padding: 0.5rem 1rem; 
              border-radius: 0.5rem; 
              margin-top: 1rem;
              cursor: pointer;
            "
          >
            Refresh Page
          </button>
        </div>
      </div>
    `;
  }
}
