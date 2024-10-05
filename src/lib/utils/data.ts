import type { AirplayData } from '$src/lib/types.js';
import * as d3 from 'd3';

interface TransformedRow {
  date: string;
  [artist: string]: number | string;
}

// Transform raw data into columns of artist names with total count of songs played per day
export function transformData(inputData: AirplayData[]): TransformedRow[] {
  // Filter out data points with invalid timestamps
  const filteredData = inputData.filter(d => {
    const dateObject = new Date(d.timestamp);
    return !isNaN(dateObject.getTime()); // Only keep valid timestamps
  });

  // Now map over the filtered data to transform it
  const parsedData = filteredData.map(d => {
    return {
      ...d,
      date: new Date(d.timestamp).toISOString().split('T')[0], // Convert to date string
      artist_name: d.artist_name
    };
  });

  // Explode artist_name array into individual rows
  let explodedData: AirplayData[] = [];
  parsedData.forEach(row => {
    row.artist_name.forEach(artist => {
      explodedData.push({ ...row, artist_name: [artist] });
    });
  });

  // Create a nested object where keys are dates and values are objects with artist counts
  let groupedData: { [date: string]: { [artist: string]: number } } = {};
  explodedData.forEach(row => {
    const date = row.date;
    const artist = row.artist_name[0];
    if (!groupedData[date]) {
        groupedData[date] = {};
    }
    groupedData[date][artist] = (groupedData[date][artist] || 0) + 1;
  });

  // Get unique artists (columns) from the exploded data
  const uniqueArtists = [...new Set(explodedData.map(row => row.artist_name[0]))];

  // Convert the nested object into a flat array with artist columns
  const result: TransformedRow[] = Object.keys(groupedData).map(date => {
    let row: TransformedRow = { date: date };
    uniqueArtists.forEach(artist => {
        row[artist] = groupedData[date][artist] || 0; // Fill missing artists with 0
    });
    return row;
  });

  return result;
}

// Filter transformed data from transformData function to only show the artists with the top played songs
export function getTopArtists(data: TransformedRow[], topNum: number): TransformedRow[] {
  const artistTotals: { [artist: string]: number } = {};

  data.forEach(row => {
    Object.keys(row).forEach(key => {
        if (key !== 'date') {
            const count = row[key] as number;
            artistTotals[key] = (artistTotals[key] || 0) + count;
        }
    });
  });

  const sortedArtists = Object.entries(artistTotals)
    .sort(([, countA], [, countB]) => countB - countA)
    .slice(0, topNum); // Top artists

  const top10Artists = sortedArtists.map(artist => artist[0]);

  const truncatedData: TransformedRow[] = data.map(row => {
    const newRow: TransformedRow = { date: row.date };
    top10Artists.forEach(artist => {
        newRow[artist] = row[artist] || 0; // Fill missing artists with 0
    });
    return newRow;
  });

  return truncatedData;
}

type TimeDataType = {
  date: string | Date; // Date can be a string or a Date object
  [key: string]: any;  // Allow for other properties
};

export function topAirplay(data: AirplayData[]): TimeDataType[] {
  const transformedData = transformData(data)
  const tableData = sortByDate(getTopArtists(transformedData, 15))
  tableData.forEach(d => {
      if (d.date instanceof Date) {
          d.date = d.date.toISOString().split('T')[0]; // Only format if it's a Date object
      }
  });
  return tableData
}

export function sortByDate(data: TimeDataType[]): TimeDataType[] {
  // Ensure dates are parsed to Date objects if necessary
  data.forEach(d => {
    if (typeof d.date === 'string') {
      d.date = new Date(d.date);
    }
  });
  // Sort the data by date
  data.sort((a, b) => (a.date as Date).getTime() - (b.date as Date).getTime());

  return data
}

type MultipleGraphData = {
  id: string;
  data: TimeDataType[];
};

export function groupAirplayByMarket(data: AirplayData[]): MultipleGraphData[] {
  let graphsData: MultipleGraphData[] = [];
  const groupedData = d3.group(data, (d: AirplayData) => d.market_id); // Group by market_id
  groupedData.forEach((group, marketId) => {
    const transformedData = transformData(group); // Pass each group of data
    const graphData = sortByDate(getTopArtists(transformedData, 6));
    graphsData.push({ id: marketId, data: graphData });
  });
  return graphsData
}
