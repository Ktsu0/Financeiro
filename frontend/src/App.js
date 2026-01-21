import React from 'react';
import Dashboard from './components/Dashboard';
import { Toaster } from './components/ui/sonner';
import './App.css';

function App() {
  return (
    <div className="App min-h-screen bg-background">
      <Dashboard />
      <Toaster position="top-right" />
    </div>
  );
}

export default App;
