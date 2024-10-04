import type { AirplayData } from '$src/lib/types.js';

interface TransformedRow {
  date: string;
  [artist: string]: number | string; // Dynamic artist keys with count or date as string
}

// Fixing the transformData function to handle grouped data
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

interface ArtistDataRow {
  date: string;
  [artist: string]: number | string;
}

export function getTopArtists(data: ArtistDataRow[], topNum: number): ArtistDataRow[] {
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

  const truncatedData: ArtistDataRow[] = data.map(row => {
    const newRow: ArtistDataRow = { date: row.date };
    top10Artists.forEach(artist => {
        newRow[artist] = row[artist] || 0; // Fill missing artists with 0
    });
    return newRow;
  });

  return truncatedData;
}