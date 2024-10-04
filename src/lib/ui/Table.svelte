<script lang="ts">
  import { onMount } from 'svelte';

  // Define types for the component props
  type RowData = { [key: string]: string | number };
  type SortConfig = { key: string; direction: 'ascending' | 'descending' };
  type ColorCodingRules = { [key: string]: (value: any) => string };
  type CustomSortOrders = { [key: string]: string[] };
  type TextAlignments = { [key: string]: string };

  export let data: RowData[] = [];
  export let sortableColumns: string[] = [];
  export let colorCodingRules: ColorCodingRules = {};
  export let customSortOrders: CustomSortOrders = {};
  export let textAlignments: TextAlignments = {};
  export let title = '';
  export let wrapText = false;
  export let onRowClick: (row: RowData) => void;

  let sortConfig: SortConfig = { key: '', direction: 'ascending' };
  let sortedData: RowData[] = [];

  onMount(() => {
    if (data.length) {
      sortedData = [...data];
    }
  });

  // Get table headers from the keys of the first object in the data array
  const headers = data.length > 0 ? Object.keys(data[0]) : [];

  const handleSort = (header: string) => {
    if (!sortableColumns.includes(header)) return;

    const direction = sortConfig.key === header && sortConfig.direction === 'ascending' ? 'descending' : 'ascending';

    sortedData = [...sortedData].sort((a, b) => {
      if (customSortOrders[header]) {
        const order = customSortOrders[header];
        const aIndex = order.indexOf(a[header] as string);
        const bIndex = order.indexOf(b[header] as string);

        if (aIndex === -1 || bIndex === -1) {
          return direction === 'ascending' ? a[header].toString().localeCompare(b[header].toString()) : b[header].toString().localeCompare(a[header].toString());
        }

        return direction === 'ascending' ? aIndex - bIndex : bIndex - aIndex;
      } else {
        if (a[header] < b[header]) return direction === 'ascending' ? -1 : 1;
        if (a[header] > b[header]) return direction === 'ascending' ? 1 : -1;
        return 0;
      }
    });

    sortConfig = { key: header, direction };
  };

  const applyColorCoding = (header: string, value: any) => {
    if (colorCodingRules[header]) {
      return colorCodingRules[header](value);
    }
    return '';
  };

  const getChevron = (header: string) => {
    if (sortConfig.key !== header) return '▼';
    return sortConfig.direction === 'ascending' ? '▲' : '▼';
  };

  const getTextAlignment = (header: string) => {
    return textAlignments[header] || 'text-left';
  };

  const handleRowClick = (row: RowData) => {
    if (onRowClick) {
      onRowClick(row);
    }
  };
</script>

<div class="flex justify-start items-center cursor-pointer">
  <p class="text-xl pl-4">{title}</p>
</div>

<table class="mt-4 border-collapse w-full">
  <thead>
    <tr>
      {#each headers as header}
        <th
          class="border-b-2 py-1 px-3 text-xs text-neutral-400 cursor-pointer 
          {wrapText ? '' : 'whitespace-nowrap'} {sortableColumns.includes(header) ? 'hover:text-purple-500' : ''} {getTextAlignment(header)}"
          on:click={() => handleSort(header)}
        >
          <span class="flex">
            {header}
            {#if sortableColumns.includes(header)}
              <span class="ml-1">{getChevron(header)}</span>
            {/if}
          </span>
        </th>
      {/each}
    </tr>
  </thead>
  <tbody>
    {#each sortedData as row, index}
      <tr class="hover:bg-neutral-200" on:click={() => handleRowClick(row)}>
        {#each headers as header}
          <td class="py-1 px-3 text-xs {wrapText ? '' : 'whitespace-nowrap'} {applyColorCoding(header, row[header])} {getTextAlignment(header)}">
            {row[header]}
          </td>
        {/each}
      </tr>
    {/each}
  </tbody>
</table>
