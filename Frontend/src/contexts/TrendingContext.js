import { createContext } from 'react';

const TrendingContext = createContext({
  trendingSongs : [],
  setTrendingSongs : () =>{},
  trendingPlaylists : [],
  setTrendingPlaylists : () =>{},
  trendingArtists : {},
  setTrendingArtists : () =>{},
  trendingRadio : [],
  setTrendingRadio : ()=>{},
  hasFetched : false,
});

export default TrendingContext;
