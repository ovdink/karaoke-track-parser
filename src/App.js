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
  const [fragmentObj, setFragmentObj] = useState([]);

  const [actualStringIndex, setActualStringIndex] = useState('0');

  const audioRef = useRef();

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

  const currentTime = audioRef.current?.audioEl.current.currentTime;

  const getURL = (file) => {
    const blob = new Blob([file]);

    setUrl(URL.createObjectURL(blob));
  };

  const takeBeginTime = () => {
    console.log('begin:', currentTime);

    setBeginTime(currentTime);

    Object.entries(fragmentObj).reduce(
      (acc, [indexKey, { text, begin, end }]) => {
        if (actualStringIndex === String(indexKey)) {
          acc[indexKey] = { text, begin: beginTime, end };

          console.log(fragmentObj);
          console.log(acc);

          return { ...fragmentObj, ...acc };
        }
      },
      fragmentObj
    );
  };

  const takeEndTime = () => {
    console.log('end:', currentTime);

    setEndTime(currentTime);
  };

  const onParse = () => {
    const arr = textArea.split('\n');

    setFragmentObj(
      arr.reduce((acc, item, index) => {
        acc[index] = { text: item, begin: '-', end: '-' };
        return acc;
      }, {})
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
              controls
              ref={audioRef}
              onLoadedMetadata={() => console.log('song is loaded')}
              // onPlay={checkAudioFn}
              // onPause={checkAudioFn}
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

      {Object.keys(fragmentObj).length > 0 && (
        <ul>
          {Object.entries(fragmentObj).map(([index, { text, begin, end }]) => (
            <li
              key={index}
              style={
                index === actualStringIndex
                  ? { cursor: 'pointer', backgroundColor: 'pink' }
                  : { cursor: 'pointer', backgroundColor: 'white' }
              }
              onClick={() => setActualStringIndex(index)}
            >
              {begin} {end} {text}
            </li>
          ))}
        </ul>
      )}
    </>
  );
};

// {0: {text: dsadada, begin: 1, end: 2}, 1: {text: dsadada, begin: 1, end: 2} }

export default App;
