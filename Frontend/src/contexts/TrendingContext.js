import { createContext } from 'react';

const TrendingContext = createContext({
  trendingSongs : [],
  setTrendingSongs : () =>{},
  trendingPlaylists : [],
  setTrendingPlaylists : () =>{},
  trendingArtists : {},
  setTrendingArtists : () =>{},
});

export default TrendingContext;
