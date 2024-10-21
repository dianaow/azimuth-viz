export interface DMAData {
  id: string;
  name: string;
  geometry?: any;
  population?: number;
}

export interface RawDemographicData {
  id: string;
  dma_id: string;
  created_at: Date;
  azimuth_rank: number;
  population_total: number;
  median_age: number;
}

export interface MarketData {
  id: string;
  name: string;
  dma_id: string;
  coordinates:[number, number][];
}

export interface VenueDMAData {
  venue_id: string
  dma_id: string;
}

export interface VenueData {
  venue_id: string
  dma_id: string;
  address: string;
  city: string;
  postal_code: string;
  latitude: number;
  longitude: number;
  website: string;
  capacity: number;
}

export interface StationData {
  id: string
  name: string;
  market_id: string;
  format_name: string;
  image: string;
  azimuth_panel: boolean;
  coverage: string;
}

export interface RawAirplayData {
  id: string;
  song_title: string;
  artist_name: string[];
  timestamp: string | Date;
  market_id: string;
  station_id: string;
  song_id: string;
  date: string;
}

export interface TimeDataType {
  date: string | Date; // Date can be a string or a Date object
  [key: string]: any;  // Allow for other properties
};

export interface StreamGraph {
  id: string;
  data: TimeDataType[];
};

export interface HeatMap {
  date: string | Date,
  artist: string, 
  count: number
}

export interface AirplayData {
  streamgraph: StreamGraph[];
  heatmap: HeatMap[];
}

export interface ChartEntry {
  key: string;
  value: number | string;
};

export interface DemographicData {
  age: ChartEntry[],
  gender: ChartEntry[],
  population: number;
  median_age: number;
  rank: number;
}

export interface FetchDataResponse {
  dma: DMAData;
  demographic: DemographicData;
  markets: MarketData[];
  venues: VenueData[];
  stations: StationData[];
}

export interface MainFetchDataResponse {
  dmas: DMAData[]; 
  markets: MarketData[];
}