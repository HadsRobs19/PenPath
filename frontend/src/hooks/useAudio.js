import { useRef } from "react";

export const useAudio = (src) => {
  const audioRef = useRef(new Audio(src));

  const play = () => {
    audioRef.current.currentTime = 0;
    audioRef.current.play();
  };

  return play;
};
