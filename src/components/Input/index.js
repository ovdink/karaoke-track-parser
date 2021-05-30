import React from 'react';
import { db } from '../../db';

export const Input = ({ setLoaded, isLoaded }) => {
  const handleFileChosen = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();

      reader.onload = (e) => resolve(new Uint8Array(e.target.result));
      reader.readAsArrayBuffer(file);
    });
  };

  const addFileToDB = (file) => {
    db.song.clear();

    handleFileChosen(file)
      .then((data) =>
        db.song.add({ id: 0, name: file.name, size: file.size, data })
      )
      .then(() => setLoaded(++isLoaded));
  };

  return (
    <input
      type="file"
      accept="audio/*"
      title=""
      onChange={(e) => {
        addFileToDB(e.target.files[0]);
      }}
      onClick={(e) => (e.target.value = null)}
    />
  );
};
