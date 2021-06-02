/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useRef, useState } from 'react';
import ReactAudioPlayer from 'react-audio-player';
import { GlobalHotKeys } from 'react-hotkeys';

import { db } from './db';

import { Input } from './components';

const imageUrl =
  'https://noizemc.com/wp-content/uploads/2015/02/Noize-Mc-_-_-_2.600x600-751.jpg';

const App = () => {
  const [isLoaded, setLoaded] = useState(0);
  const [url, setUrl] = useState(null);

  const [isPlaying, setPlaying] = useState(false);

  const [beginTime, setBeginTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [currentTimeShow, setCurrentTimeShow] = useState(0);

  const [textArea, setTextArea] = useState('');
  const [showFirstArea, setShowFirstArea] = useState(true);

  const [fragmentArr, setFragmentArr] = useState([]);
  const [json, setJson] = useState('');

  const [actualStringIndex, setActualStringIndex] = useState(-1);

  const [copyStatus, setCopyStatus] = useState(false);

  // _____input speed state_____________
  const [speed, setSpeed] = useState(1);

  // _____info handlers_________________
  const [author, setAuthor] = useState('');
  const [songName, setSongName] = useState('');

  // _____refs___________________________
  const audioRef = useRef(null);
  const textAreaJsonRef = useRef(null);

  const current = audioRef.current?.audioEl.current;

  useEffect(() => {
    db.song.clear();
  }, []);

  useEffect(() => {
    (async () => {
      if (isLoaded) {
        const fileFromDB = await db.song.get(0);

        getURL(fileFromDB.data);
      }
    })();
  }, [isLoaded]);

  useEffect(() => {
    setTime('begin', beginTime);
  }, [beginTime]);

  useEffect(() => {
    setTime('end', endTime);

    setActualStringIndex((actualStringIndex) => actualStringIndex + 1);
  }, [endTime]);

  /* for slowly speed */
  useEffect(() => {
    if (current) {
      current.playbackRate = speed;
    }
  }, [speed]);

  useEffect(() => {
    if (current) {
      playPause();
    }
  }, [isPlaying]);

  /*____for currentTime update in UI ____*/
  // function tick() {
  //   setCurrentTimeShow(convertToMs(current?.currentTime));
  // }

  // useEffect(() => {
  //   const timer = setInterval(tick, 100);

  //   return () => clearInterval(timer);
  // }, [tick]);

  /*_________________________________________*/

  const playPause = () => {
    if (isPlaying) {
      current.pause();
    } else {
      current.play();
    }
  };

  const setTime = (keyTime, valueTime) => {
    if (fragmentArr[actualStringIndex]) {
      const tmpFragment = [...fragmentArr];

      tmpFragment[actualStringIndex][keyTime] = valueTime;

      setFragmentArr(tmpFragment);
    }
  };

  const getURL = (file) => {
    const blob = new Blob([file]);

    setUrl(URL.createObjectURL(blob));
  };

  const convertToMs = (currentTime) => {
    const ms = currentTime * 1000;

    const minutes = Math.floor(ms / 60000);
    const seconds = ((ms % 60000) / 1000).toFixed(4);

    return minutes + ':' + (seconds < 10 ? '0' : '') + seconds;
  };

  const convertTimeToMs = (time) => {
    return Number(time.split(':')[0]) * 60 + Number(time.split(':')[1]);
  };

  const takeBeginTime = () => {
    // doenst work with hotkey, but work with button (begin):   const current = audioRef.current?.audioEl.current;
    // setBeginTime(convertToMs(current.currentTime));

    setBeginTime(convertToMs(audioRef.current?.audioEl.current.currentTime));
  };

  const takeEndTime = () => {
    setEndTime(convertToMs(audioRef.current?.audioEl.current.currentTime));
  };

  const onParse = () => {
    const arr = textArea.split('\n');

    const defFragmentObj = arr.map((item) => {
      return { text: item, begin: '-', end: '-' };
    });

    setFragmentArr(defFragmentObj);

    setShowFirstArea(false);
  };

  const copyToBuffer = (e) => {
    textAreaJsonRef.current.select();
    document.execCommand('copy');

    e.target.focus();

    setCopyStatus(true);
  };

  const onListenCurrentTime = (timeMs) => {
    setCurrentTimeShow(convertToMs(timeMs));
  };

  const pressEnterKeyInInput = (e) => {
    if (e.key === 'Enter' && current.currentTime) {
      current.currentTime = convertTimeToMs(currentTimeShow);
    }
  };

  const formationJsonData = () => {
    return {
      author,
      name: songName,
      duration: current.duration,
      image: imageUrl,
      song: fragmentArr,
    };
  };

  const listCb = (data, index) => {
    const { text, begin, end } = data;

    const background = index === actualStringIndex ? 'pink' : 'white';

    return (
      <li
        key={index}
        style={{ cursor: 'pointer', backgroundColor: background }}
        onClick={() => setActualStringIndex(index)}
      >
        ({begin} — {end}) {text}
      </li>
    );
  };

  const keyMap = {
    MOVE_NEXT_10S: ['right'],
    MOVE_PREV_10S: ['left'],
    SPEED_UP: ['up'],
    SPEED_DOWN: ['down'],
    SET_BEGIN: ['c'],
    SET_END: ['v'],
    TO_PARSE: ['p'],
    PLAY_PAUSE: ['space'],
  };

  const handlers = {
    MOVE_NEXT_10S: () => {
      console.log('+10 sec');
    },
    MOVE_PREV_10S: () => {
      console.log('-10 sec');
    },
    SPEED_UP: () => {
      setSpeed((speed) => speed + 0.1);
    },
    SPEED_DOWN: () => {
      setSpeed((speed) => speed - 0.1);
    },
    SET_BEGIN: () => {
      takeBeginTime();
    },
    SET_END: () => {
      takeEndTime();
    },
    PLAY_PAUSE: () => {
      setPlaying((isPlaying) => !isPlaying);
    },
  };

  return (
    <>
      <GlobalHotKeys keyMap={keyMap} handlers={handlers} attach={window} />

      <Input setLoaded={setLoaded} isLoaded={isLoaded} />

      <div style={{ marginTop: '20px' }}>
        {url && (
          <>
            <div style={{ display: 'flex' }}>
              <ReactAudioPlayer
                src={url}
                autoPlay={false}
                ref={audioRef}
                controls
                listenInterval={50}
                onListen={onListenCurrentTime}
                onSeeked={() => {
                  setCurrentTimeShow(convertToMs(current?.currentTime));
                }}
                // onPlay={() => setPlaying(!isPlaying)}
                // onPause={() => setPlaying(!isPlaying)}
              />{' '}
              <div>Speed (step=0.1; normal speed=1)</div>
              <input
                type="number"
                step={0.1}
                // max={1}
                // min={0.1}
                value={speed}
                onChange={({ target: { value } }) => setSpeed(value)}
              />
            </div>
            <div style={{ display: 'flex' }}>
              <input
                value={currentTimeShow}
                onChange={({ target: { value } }) => setCurrentTimeShow(value)}
                onKeyDown={pressEnterKeyInInput}
              />
              <div>&nbsp;/&nbsp;</div>
              <div>{convertToMs(current?.duration)}</div>
            </div>
            <div>
              <button children="begin" onClick={takeBeginTime} />
              <button children="end" onClick={takeEndTime} />
            </div>
          </>
        )}
      </div>

      {showFirstArea && (
        <div>
          <div>
            <textarea
              style={{ marginTop: '20px', height: '200px', width: '400px' }}
              onChange={({ target: { value } }) => {
                setTextArea(value);
              }}
            />
          </div>
          <button children="parse" onClick={onParse} />
        </div>
      )}

      <ul>{fragmentArr.map(listCb)}</ul>

      <hr />
      <p>Info:</p>

      <div>Author:</div>
      <input
        value={author}
        onChange={({ target: { value } }) => {
          setAuthor(value);
        }}
      />

      <div>Song name:</div>
      <input
        value={songName}
        onChange={({ target: { value } }) => {
          setSongName(value);
        }}
      />

      <hr />

      <div>
        <button
          children="to json"
          onClick={() => setJson(JSON.stringify(formationJsonData()))}
        />
      </div>

      <textarea
        style={{ marginTop: '20px', height: '100px', width: '400px' }}
        ref={textAreaJsonRef}
        value={json}
        readOnly
      />

      {json && (
        <div>
          <button children="copy to buffer" onClick={copyToBuffer} />
        </div>
      )}

      {copyStatus && (
        <div style={{ fontWeight: 'bold', marginTop: '10px' }}>OK!</div>
      )}
    </>
  );
};

export default App;
