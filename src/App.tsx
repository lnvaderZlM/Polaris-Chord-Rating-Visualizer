import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import chartConstants from '../src/chartConstants.json'
import './index.css'
import HeroLayout from './layouts/HeroLayout';

function App() {
  const [scores, setScores] = useState([])

  return (
    <HeroLayout align="">
      <div className="">
      <h1 className="text-5xl font-extrabold text-white drop-shadow-lg mb-4">
        Polaris Chord Rating Analyzer
      </h1>
      <div className="flex flex-col items-start">
          <label for="scores-input">Input scores here:</label>
          <textarea id="scores-input" className="bg-foreground w-full" rows="8"></textarea>
        </div>
      </div>
    </HeroLayout>
  )
}

export default App
