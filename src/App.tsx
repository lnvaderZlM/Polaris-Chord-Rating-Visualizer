import { useState, useRef } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import allChartConstants from '../src/chartConstants.json'
import './index.css'
import HeroLayout from './layouts/HeroLayout';

const difficulties = [
    "EASY",
    "NORMAL",
    "HARD",
    "INFLUENCE"
];

function App() {
  const [scores, setScores] = useState([]);
  const [userRating, setUserRating] = useState(null);
  const userScoresRef = useRef();

  const calculatePaSkill = (base, cap, achievement, floor, ceil) => {
    const range = ceil - floor;
    const score = achievement - floor;

    const diff = cap - base;
    const bonusRate = (score / range) * diff;
    return base + bonusRate;
  };

  const calculateScores = (e) => {
    const userScores = JSON.parse(userScoresRef.current.value);

    const musicData = userScores.data.score_data.usr_music_highscore.music;

    const ratings = {};

    for(let song of musicData) {
      const songTitle = song.name;
      let playedCharts = song.chart_list.chart;
      if(!Array.isArray(playedCharts)) {
        playedCharts = [playedCharts];
      }
      const chartConstants = allChartConstants[songTitle];
      for(let playedChart of playedCharts) {
        const {achievement_rate, chart_difficulty_type} = playedChart;
        const chartConstant = Number(chartConstants[chart_difficulty_type]);
        if(achievement_rate < 8500) continue; //i arent dealing with that

        const key = songTitle + " " + difficulties[chart_difficulty_type];
        let paSkill = chartConstant + 2.3;
        if(achievement_rate < 8500) {
          const base = chartConstant - 1;
          const cap = chartConstant;
          paSkill = calculatePaSkill(base, cap, achievement_rate, 8500, 9500);
        }
        else if(achievement_rate < 9800) {
          const base = chartConstant;
          const cap = chartConstant + 0.5;
          paSkill = calculatePaSkill(base, cap, achievement_rate, 9500, 9800);
        }

        else if(achievement_rate < 9950) {
          const base = chartConstant + 0.5;
          const cap = chartConstant + 2;
          paSkill = calculatePaSkill(base, cap, achievement_rate, 9800, 9950);
        }
        else if(achievement_rate < 10000){
          const base = chartConstant + 2;
          const cap = chartConstant + 2.3;
          paSkill = calculatePaSkill(base, cap, achievement_rate, 9950, 10000);
        }
        ratings[key] = paSkill;
      }
    }

    const songs = Object.keys(ratings);
    songs.sort((a,b) => {
      return ratings[a] < ratings[b] ? 1 : -1;
    })
    const top30 = songs.slice(0, 30);

    const top30Chart = [];
    let totalRating = 0;
    for(let i = 0; i < top30.length; i++) {
      top30Chart.push({
        song: top30[i],
        rating: ratings[top30[i]]
      });
      totalRating += ratings[top30[i]];
    }

    setScores(top30Chart);
    setUserRating(totalRating / 30);
  };

  return (
    <HeroLayout align="">
      <div className="">
        <h1 className="text-5xl font-extrabold text-white drop-shadow-lg mb-4">
          Polaris Chord Rating Analyzer
        </h1>
        <div className="flex flex-col items-start mb-4">
          <label for="scores-input">Input scores here:</label>
          <textarea ref={userScoresRef} id="scores-input" className="bg-foreground w-full" rows="5"></textarea>
        </div>
        <button onClick={calculateScores}>Calculate</button>
      </div>

      {userRating !== null && 
        <div>
          <h2>User Rating: {userRating.toFixed(2)}</h2>
          <table className="w-full text-left">
            <tr>
              <th>Song</th>
              <th>Rating</th>
            </tr>
            { scores.map((score, index) => {
              console.log(score);
              const {song, rating} = score;
              return (
                <tr key={index}>
                  <td>{song}</td>
                  <td>{rating.toFixed(2)}</td>
                </tr>
              )
            })}
          </table>
        </div>
      }
      
    </HeroLayout>
  )
}

export default App
