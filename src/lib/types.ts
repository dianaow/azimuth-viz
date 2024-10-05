export interface DemographicData {
  id: number;
  dma_id: number;
  created_at: Date;
  azimuth_rank: number;
  population_total: number;
}

export interface MarketData {
  id: number;
  name: string;
  dma_id: number;
  coordinates:[number, number][];
}

export interface AirplayData {
  id: string;
  song_title: string;
  artist_name: string[];
  timestamp: string | Date;
  market_id: string;
  station_id: string;
  song_id: string;
  date: string;
}

export interface FetchDataResponse {
  demographic?: DemographicData[];
  market?: MarketData[];
  airplay?: AirplayData[];
}
