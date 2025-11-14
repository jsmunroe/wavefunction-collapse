import { useState } from 'react'
import RoomView from './components/RoomView'
import './App.css'
import { GameContext } from './hooks/useGame';
import { Game } from './models/Game';

function App() {
  const [game] = useState(() => new Game);
  
  return (
    <GameContext.Provider value={game}>
      <RoomView />
    </GameContext.Provider>
  )
}

export default App;
