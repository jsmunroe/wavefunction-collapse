import { useState } from 'react'
import './App.css'
import { buildRoom } from './models/Room'
import RoomView from './components/RoomView'

function App() {
  const [room] = useState(buildRoom());

  return (
    <>
      <RoomView room={room} />
    </>
  )
}

export default App
