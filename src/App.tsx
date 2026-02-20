import { useEffect, useState } from "react";
import { DataTable, type DataTablePageEvent } from "primereact/datatable";
import { Column } from "primereact/column";

import { fetchArtworks } from "./services/api";
import type { Artwork } from "./types/artwork";

function App() {
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalRecords, setTotalRecords] = useState<number>(0);
  const [selectedArtworks, setSelectedArtworks] = useState<Artwork[]>([]);
  const [rowsToSelect, setRowsToSelect] = useState<number>(0);

  const rowsPerPage = 12;

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const response = await fetchArtworks(currentPage);

        setArtworks(response.data);
        setTotalRecords(response.pagination.total);
      } catch (error) {
        console.error("Error fetching artworks:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [currentPage]);


  const handleSelectRows = async () => {
    if (!rowsToSelect || rowsToSelect <= 0) return;

    setSelectedArtworks([]); 
    

    const totalPagesNeeded = Math.ceil(rowsToSelect / rowsPerPage);
    let allSelectedArtworks: Artwork[] = [];
    
    try {
      setLoading(true);
      
      // Fetch data from multiple pages if needed
      for (let page = 1; page <= totalPagesNeeded; page++) {
        const response = await fetchArtworks(page);
        const remainingToSelect = rowsToSelect - allSelectedArtworks.length;
        const artworksToAdd = response.data.slice(0, remainingToSelect);
        allSelectedArtworks = [...allSelectedArtworks, ...artworksToAdd];
        
        if (allSelectedArtworks.length >= rowsToSelect) break;
      }
      
      setSelectedArtworks(allSelectedArtworks);
    } catch (error) {
      console.error("Error fetching artworks for selection:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Art Institute Data Table</h1>

      <div style={{ marginBottom: "1rem" }}>
        <input
          type="number"
          value={rowsToSelect}
          onChange={(e) => setRowsToSelect(Number(e.target.value))}
          placeholder="Enter number of rows"
          min="1"
          max={totalRecords}
        />

        <button onClick={handleSelectRows} style={{ marginLeft: "0.5rem" }}>
          Select Rows
        </button>

        <button
          onClick={() => setSelectedArtworks([])}
          style={{ marginLeft: "0.5rem" }}
        >
          Clear Selection
        </button>
        
        <span style={{ marginLeft: "1rem" }}>
          Selected: {selectedArtworks.length} rows
        </span>
      </div>

      <DataTable
        value={artworks}
        loading={loading}
        paginator
        lazy
        rows={rowsPerPage}
        totalRecords={totalRecords}
        first={(currentPage - 1) * rowsPerPage}
        onPage={(event: DataTablePageEvent) => {
          const pageIndex = event.page ?? 0;
          setCurrentPage(pageIndex + 1);
        }}
        selection={selectedArtworks}
        onSelectionChange={(e) => {
          setSelectedArtworks(e.value as Artwork[]);
        }}
        selectionMode="multiple" // Move selectionMode here instead of Column
        dataKey="id"
        tableStyle={{ minWidth: "60rem" }}
      >
        <Column selectionMode="multiple" headerStyle={{ width: "3rem" }} />
        <Column field="title" header="Title" />
        <Column field="place_of_origin" header="Origin" />
        <Column field="artist_display" header="Artist" />
        <Column field="inscriptions" header="Inscriptions" />
        <Column field="date_start" header="Start Date" />
        <Column field="date_end" header="End Date" />
      </DataTable>
    </div>
  );
}

export default App;