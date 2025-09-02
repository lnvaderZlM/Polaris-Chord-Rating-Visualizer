# Polaris Chord Rating Visualizer

Visualizes Polaris Chord scores focusing on their PA Skill value, in both a B30 (best 30) image and a table of all scores.

## How to Use

1. Get your score data in the format that Bemani gives it in
    1. Go to the [official eamusement site](https://p.eagate.573.jp/game/polarischord/pc/playdata/music_data.html) while logged in
    2. Inspect network requests for pdata_getdata.html
    3. Download this file - it should have JSON data in it
    4. Alternatively, check src/sample_pc_scores.json for expected format
2. Upload this file to the tool (or paste it into the text box)
3. Click on Calculate
4. Switch between B30 image view and table view using the tabs

## How to run locally

  1. Download/clone the repo
  2. npm install
  3. npm run dev
