import { useEffect, useRef, useState } from 'react';
import ReactAudioPlayer from 'react-audio-player';

import { db } from './db';

import { Input } from './components';

const App = () => {
  const [isLoaded, setLoaded] = useState(0);
  const [url, setUrl] = useState(null);

  const [beginTime, setBeginTime] = useState(null);
  const [endTime, setEndTime] = useState(null);

  const [textArea, setTextArea] = useState('');
  const [fragmentArr, setFragmentArr] = useState([]);
  const [json, setJson] = useState('');

  const [actualStringIndex, setActualStringIndex] = useState(0);

  const audioRef = useRef();

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
  }, [endTime]);

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

  const takeBeginTime = () => {
    setBeginTime(current.currentTime);
  };

  const takeEndTime = () => {
    setEndTime(current.currentTime);
  };

  const onParse = () => {
    const arr = textArea.split('\n');

    const defFragmentObj = arr.map((item) => {
      return { text: item, begin: '-', end: '-' };
    });

    setFragmentArr(defFragmentObj);
  };

  const listCb = (meta, index) => {
    const { begin, end, text } = meta;

    const background = index === actualStringIndex ? 'pink' : 'white';

    return (
      <li
        key={index}
        style={{ cursor: 'pointer', backgroundColor: background }}
        onClick={() => setActualStringIndex(index)}
      >
        {begin} {end} {text}
      </li>
    );
  };

  return (
    <>
      <Input setLoaded={setLoaded} isLoaded={isLoaded} />

      <div style={{ marginTop: '20px' }}>
        {url && (
          <>
            <ReactAudioPlayer
              src={url}
              autoPlay={false}
              ref={audioRef}
              controls
            />
            <div>
              <button children="begin" onClick={takeBeginTime} />
              <button children="end" onClick={takeEndTime} />
            </div>
          </>
        )}
      </div>

      <div>
        <textarea
          style={{ marginTop: '20px' }}
          onChange={({ target: { value } }) => {
            setTextArea(value);
          }}
        />
      </div>

      <button children="parse" onClick={onParse} />

      <ul>{fragmentArr.map(listCb)}</ul>

      <hr />

      <button
        children="to json"
        onClick={() => setJson(JSON.stringify(fragmentArr))}
      />

      <div style={{ margin: '20px' }}>{json}</div>
    </>
  );
};

export default App;
