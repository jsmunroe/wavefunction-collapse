import { useState } from 'react'
import RoomView from './components/RoomView'
import './App.css'
import useGame, { GameContext } from './hooks/useGame';
import { Game } from './models/Game';

function App() {
  const game = useGame();
  
  return (
    <GameContext.Provider value={game}>
      {game.isStarted && <RoomView />}
    </GameContext.Provider>
  )
}

export default App;
