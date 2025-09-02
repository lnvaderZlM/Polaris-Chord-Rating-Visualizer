import { useState, useRef } from 'react'
import './App.css'
import allChartConstants from '../src/chartConstants.json'
import './index.css'
import HeroLayout from './layouts/HeroLayout';
import {
  Tabs,
  TabsHeader,
  TabsBody,
  Tab,
  TabPanel,
} from "@material-tailwind/react";

const difficulties = [
    "EASY",
    "NORMAL",
    "HARD",
    "INFLUENCE"
];

type ScoreData = {
  paSkill: number;
  id: string;
  title: string;
}

function App() {
  const [scores, setScores] = useState([]);
  const [allScores, setAllScores] = useState([]);
  const [userRating, setUserRating] = useState(null);
  const userScoresRef = useRef(null);

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

    const fullScoreData:ScoreData = {};

    for(let song of musicData) {
      const songTitle = song.name;
      const songId = song.music_id;
      let playedCharts = song.chart_list.chart;
      if(!Array.isArray(playedCharts)) {
        playedCharts = [playedCharts];
      }
      const chartConstants = allChartConstants[songTitle];
      for(let playedChart of playedCharts) {
        const {achievement_rate, chart_difficulty_type} = playedChart;
        const chartConstant = Number(chartConstants[chart_difficulty_type]);
        let grade = "SSS+";
        if(achievement_rate < 8500) continue; //i arent dealing with that
        let paSkill = chartConstant + 2.3;
        if(achievement_rate < 9500) {
          grade = "A";
          if(achievement_rate >= 9000) grade = "AA";
          const base = chartConstant - 1;
          const cap = chartConstant;
          paSkill = calculatePaSkill(base, cap, achievement_rate, 8500, 9500);
        }
        else if(achievement_rate < 9800) {
          grade = "AAA";
          const base = chartConstant;
          const cap = chartConstant + 0.5;
          paSkill = calculatePaSkill(base, cap, achievement_rate, 9500, 9800);
        }

        else if(achievement_rate < 9950) {
          grade = "S";
          if(achievement_rate >= 9850) grade = "SS";
          if(achievement_rate >= 9900) grade = "SSS";
          const base = chartConstant + 0.5;
          const cap = chartConstant + 2;
          paSkill = calculatePaSkill(base, cap, achievement_rate, 9800, 9950);
        }
        else if(achievement_rate < 10000){
          const base = chartConstant + 2;
          const cap = chartConstant + 2.3;
          paSkill = calculatePaSkill(base, cap, achievement_rate, 9950, 10000);
        }

        fullScoreData[songTitle + " " + difficulties[chart_difficulty_type]] = {
          paSkill,
          chartConstant,
          achievement_rate,
          grade,
          id: songId,
          title: songTitle,
          difficulty: difficulties[chart_difficulty_type]}
      }
    }

    const songs = Object.keys(fullScoreData);
    songs.sort((a,b) => {
      return fullScoreData[a].paSkill < fullScoreData[b].paSkill ? 1 : -1;
    })
    const top30Keys = songs.slice(0, 30);

    const top30Chart = [];
    let totalRating = 0;
    for(let i = 0; i < top30Keys.length; i++) {
      const currScoreData = fullScoreData[top30Keys[i]];
      top30Chart.push(currScoreData);
      totalRating += currScoreData.paSkill;
    }
    setScores(top30Chart);

    let allChart = [];
    for(let i = 0; i < songs.length; i++) {
      const currScoreData = fullScoreData[songs[i]];
      allChart.push(currScoreData);
    }

    setAllScores(allChart);


    const fixedRating = Math.trunc((totalRating / 30) * 100) / 100
    setUserRating(fixedRating);
  };

  return (
    <HeroLayout align="">
      <div className="">
        <h1 className="text-5xl font-extrabold text-white drop-shadow-lg mb-4">
          Polaris Chord Rating Analyzer
        </h1>
        <div className="flex flex-col items-start mb-4">
          <label for="scores-input">Input scores here:</label>
          <textarea ref={userScoresRef} id="scores-input" className="bg-foreground text-background p-4 w-full" rows="5"></textarea>
        </div>
        <button className="bg-foreground px-4 py-2 text-background rounded-sm border border-solid hover:border-foreground hover:text-foreground hover:bg-transparent" onClick={calculateScores}>Calculate</button>
      </div>

      {userRating !== null && 
        <div className="mt-4">
          <h2 className="text-left text-lg font-semibold">User Rating: {userRating.toFixed(2)}</h2>
          <Tabs value="image" className="mt-4">
            <TabsHeader>
              <Tab key="image" value="image" className="cursor-pointer text-blue-gray">B30 Image</Tab>
              <Tab key="table" value="table">All Scores Table</Tab>
            </TabsHeader>
            <TabsBody>
              <TabPanel key="image" value="image">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                  { scores.map((score, index) => {
                    const {paSkill, title, difficulty, id} = score;
                    const currImage = `https://p.eagate.573.jp/game/polarischord/pc/img/music/jacket.html?c=${id}`;
                    return (
                      <div key={index} className={`difficulty-${difficulties.indexOf(difficulty) + 1} border-2 flex`}>
                        <div className="w-1/3 relative">
                          <img
                            src={currImage}
                            className="h-full object-cover"
                            alt=""
                          />
                          {/* Gradient overlay */}
                          <div className="absolute top-0 right-0 bottom-0 w-full bg-gradient-to-r pointer-events-none"></div>
                        </div>

                        {/* Text div */}
                        <div className="w-2/3 flex flex-col justify-center">
                          <div className="px-2">{title} ({difficulty})</div>
                          <div className="px-2">{paSkill.toFixed(2)}</div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </TabPanel>
              <TabPanel key="table" value="table">
                <table className="w-full text-left border-1 border-foreground">
                  <tr className="">
                    <th className="cell-padding">Song</th>
                    <th className="cell-padding">Grade</th>
                    <th className="cell-padding">Constant</th>
                    <th className="cell-padding">Rating</th>
                  </tr>
                  { allScores.map((score, index) => {
                    const {paSkill, title, difficulty, songId, chartConstant, grade, achievement_rate } = score;
                    return (
                      <tr key={index} className={`difficulty-${difficulties.indexOf(difficulty) + 1} border-b-1 border-background`}>
                        <td className="cell-padding">{title} ({difficulty})</td>
                        <td className="cell-padding">{achievement_rate/100}% {grade}</td>
                        <td className="cell-padding">{chartConstant}</td>
                        <td className="cell-padding">{paSkill.toFixed(2)}</td>
                      </tr>
                    )
                  })}
                </table>
              </TabPanel>
            </TabsBody>
          </Tabs>
        </div>
      }
      
    </HeroLayout>
  )
}

export default App
