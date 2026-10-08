import React from 'react';
import Header from './components/Header/Header';
import Notes from './pages/Notes';
import './styles/globals.css';

const App = () => {
  return (
    <div className="app-container">
      <Header />
      <main>
        <Notes />
      </main>
    </div>
  );
};

export default App;