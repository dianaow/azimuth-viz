<script lang="ts">
    import { onMount, onDestroy } from 'svelte';
    import SteamGraph from '$lib/charts/steamgraph.js';
    import type { AirplayData, FetchDataResponse } from '$src/lib/types.js';
    //import { airplay } from '$lib/data.js';
    import * as d3 from 'd3'; // Ensure d3 is imported

    export let data: FetchDataResponse
    const { airplay, demographic, market } = data
    console.log(airplay, demographic, market)

    let screenSize = { width: 0, height: 0 };

    // Function to update screen size
    function updateScreenSize() {
        screenSize = {
            width: window.innerWidth,
            height: window.innerHeight
        };
    }

    // Group the data by market_id
    function groupByMarket(data) {
        return d3.group(data, d => d.market_id); // Group by market_id
    }

    // onMount is like React's useEffect (to add event listeners)
    onMount(() => {   
        if (typeof window !== 'undefined') {
            updateScreenSize(); // Initialize screen size
            window.addEventListener('resize', updateScreenSize);
            
            // Render chart when airplay data exists in the DOM
            if (airplay?.data) {
                const groupedData = groupByMarket(airplay.data);
                
                // Iterate over each group of data (market_id)
                groupedData.forEach((group, marketId) => {
                    // Create a DIV for each market
                    const marketDiv = document.createElement('div');
                    marketDiv.id = `steamgraph-${marketId}`;
                    document.body.appendChild(marketDiv);

                    const transformedData = transformData(group); // Pass each group of data
                    const top10Data = getTop10Artists(transformedData);

                    SteamGraph({
                        data: top10Data,
                        id: `#steamgraph-${marketId}`, // Render within the specific DIV
                        width: screenSize.width,
                        //height: screenSize.height,
                        height: 200
                    });
                });
            }
        }
    });

    // Clean up when the component is destroyed
    onDestroy(() => {
        window.removeEventListener('resize', updateScreenSize);
    });

    interface TransformedRow {
        date: string;
        [artist: string]: number | string; // Dynamic artist keys with count or date as string
    }

    // Fixing the transformData function to handle grouped data
    function transformData(inputData: AirplayData[]): TransformedRow[] {
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

    function getTop10Artists(data: ArtistDataRow[]): ArtistDataRow[] {
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
            .slice(0, 10); // Top 10 artists

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
</script>
