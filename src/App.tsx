import { useState, useRef } from 'react';
import './App.css';
import allChartConstants from '../src/chartConstants.json';
import sampleJson from '../src/sample_pc_scores.json';
import './index.css';
import HeroLayout from './layouts/HeroLayout';
import FileInput from './components/FileInput';
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
  grade: string;
  achievement_rate: number;
  difficulty: string;
  chartConstant: number;
}

function App() {
  const [scores, setScores] = useState<ScoreData[]>([]);
  const [allScores, setAllScores] = useState<ScoreData[]>([]);
  const [userRating, setUserRating] = useState<number | null>(null);
  const [error, setError] = useState<any>(null);
  const userScoresRef = useRef<HTMLTextAreaElement>(null);
  const [activeTab, setActiveTab] = useState<string>("image");

  const handleJsonLoad = (json:any) => { //expected to be official score data from ea site
    if(!userScoresRef.current) return; //@TODO possibly error here
    userScoresRef.current.value = JSON.stringify(json);
  };

  const loadSampleScores = () => {
    if(!userScoresRef.current) return; //@TODO possibly error here
    userScoresRef.current.value = JSON.stringify(sampleJson);
  }

  const calculatePaSkill = (base:number, cap:number, achievement:number, floor:number, ceil:number) => {
    const range = ceil - floor;
    const score = achievement - floor;

    const diff = cap - base;
    const bonusRate = (score / range) * diff;
    return base + bonusRate;
  };
  
  const calculateScores = () => {
    let userScores = null;
    try {
      if(!userScoresRef.current) return; //@TODO possibly error here
      userScores = JSON.parse(userScoresRef.current.value);
    }
    catch(error:any) {
      setError(error);
      return;
    }

    // const distorder = calculatePaSkill(14.3, 15.8, 9919, 9800, 9950);
    // const whatsuppop = calculatePaSkill(14.2, 15.7, 9933, 9800, 9950);
    // const kamui = calculatePaSkill(14.4, 15.9, 9865, 9800, 9950);

    // console.log(distorder, whatsuppop, kamui);

    const musicData = userScores.data.score_data.usr_music_highscore.music;

    const fullScoreData:any = {};

    for(let song of musicData) {
      const songTitle = song.name;
      const songId = song.music_id;
      let playedCharts = song.chart_list.chart;
      if(!Array.isArray(playedCharts)) {
        playedCharts = [playedCharts];
      }
      const chartConstants = allChartConstants[songTitle as keyof typeof allChartConstants];

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
    setError(null);
  };


  return (
    <HeroLayout align="">
      <div className="">
        <h1 className="text-5xl font-extrabold text-white drop-shadow-lg mb-4">
          Polaris Chord Rating Analyzer
        </h1>
        <div className="flex flex-col items-start mb-4">
          <label>Input scores here:</label>
          <div className="flex w-full gap-2 flex-col md:flex-row items-center mb-4">
            <FileInput className="flex-1" onJsonLoad={handleJsonLoad} />
            <button className="responsive-bg btn py-2 px-4 h-fit w-full md:w-auto" onClick={loadSampleScores}>Load Sample</button>
          </div>
          <textarea placeholder="Upload a json or paste it here" ref={userScoresRef} id="scores-input" className="p-4 w-full responsive-bg"rows={5}></textarea>
        </div>
        <button className="
          px-4 py-2
          responsive-bg btn
          w-full md:w-auto
          " onClick={calculateScores}>Calculate</button>
      </div>

      {error && <p className="text-lg text-red-500 mt-4">{error.toString()}</p>}

      {userRating !== null && 
        <div className="mt-4 text-foreground">
          <h2 className="text-left text-lg font-semibold">User Rating: {userRating.toFixed(2)}</h2>
          <Tabs value={activeTab} className="mt-4">
            <TabsHeader {...({} as any)}>
              <Tab {...({} as any)} key="image" value="image" className="cursor-pointer text-blue-gray" onClick={() => setActiveTab("image")}>B30 Image</Tab>
              <Tab {...({} as any)} key="table" value="table" onClick={() => setActiveTab("table")}>All Scores Table</Tab>
            </TabsHeader>
            <TabsBody {...({} as any)}>
              <TabPanel key="image" value="image" className="text-foreground">
                {activeTab === "image" && 
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 auto-rows-fr">
                    { scores.map((score, index) => {
                      const {paSkill, title, difficulty, id, achievement_rate, grade, chartConstant} = score;
                      const currImage = `https://p.eagate.573.jp/game/polarischord/pc/img/music/jacket.html?c=${id}`;
                      return (
                        <div
                          key={index}
                          className={`difficulty-${difficulties.indexOf(difficulty) + 1} border-2 flex items-stretch p-1`}
                        >
                          <div className="w-3/9 relative flex">
                            <img
                              src={currImage}
                              alt=""
                              className="object-cover w-full h-auto min-h-0 min-w-0 flex-1"
                            />
                            <div className="absolute top-0 right-0 bottom-0 w-full bg-gradient-to-r pointer-events-none"></div>
                          </div>
                          <div className="w-6/9 flex flex-col justify-center">
                            <div className="px-2 font-bold truncate">
                              {title}
                            </div>
                            <div className="px-2">{achievement_rate/100}% {grade}</div>
                              <div className="px-2">Lv. {chartConstant}</div>
                              <div className="px-2 font-bold">{paSkill.toFixed(2)}</div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                }
              </TabPanel>
              <TabPanel key="table" value="table" className={`text-foreground overflow-x-auto`}>
                {activeTab === "table" && 
                  <table className="w-full text-left border-1 border-foreground min-w-full border-collapse">
                    <thead>
                      <tr className="">
                        <th className="cell-padding">Song</th>
                        <th className="cell-padding">Grade</th>
                        <th className="cell-padding">Constant</th>
                        <th className="cell-padding">Rating</th>
                      </tr>
                    </thead>
                    <tbody>
                      { allScores.map((score, index) => {
                        const {paSkill, title, difficulty, chartConstant, grade, achievement_rate } = score;
                        return (
                          <tr key={index} className={`difficulty-${difficulties.indexOf(difficulty) + 1} border-b-1 border-background`}>
                            <td className="cell-padding">{title} ({difficulty})</td>
                            <td className="cell-padding">{achievement_rate/100}% {grade}</td>
                            <td className="cell-padding">{chartConstant}</td>
                            <td className="cell-padding">{paSkill.toFixed(2)}</td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                }
              </TabPanel>
            </TabsBody>
          </Tabs>
        </div>
      }
      
    </HeroLayout>
  )
}

export default App
