import { useState } from 'react'
import './App.css'
import DigitCanvas from "./components/DigitCanvas";
function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-6 rounded shadow">
        <h1 style={{ textAlign: "center" }}>Digit Recognizer</h1>
        <DigitCanvas backendUrl="http://localhost:5000" />
      </div>
    </div>
    </>
  )
}

export default App
