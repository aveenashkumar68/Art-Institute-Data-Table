import { useEffect, useState, useMemo } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";

import { fetchArtworks } from "./services/api";
import type { Artwork } from "./types/artwork";

function App() {
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalRecords, setTotalRecords] = useState<number>(0);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
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
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [currentPage]);


  const selectedRows = useMemo(() => {
    return artworks.filter((row) => selectedIds.has(row.id));
  }, [artworks, selectedIds]);


  const handleSelectRows = () => {
    if (!rowsToSelect || rowsToSelect <= 0) return;

    setSelectedIds((prev) => {
      const updated = new Set(prev);

      const limit = Math.min(rowsToSelect, totalRecords);

      for (let i = 1; i <= limit; i++) {
        updated.add(i);
      }

      return updated;
    });
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
        />
        <button onClick={handleSelectRows}>
          Select Rows
        </button>
        <button
          style={{ marginLeft: "1rem" }}
          onClick={() => setSelectedIds(new Set())}
        >
          Clear Selection
        </button>
      </div>

      <DataTable
        value={artworks}
        loading={loading}
        paginator
        lazy
        rows={rowsPerPage}
        totalRecords={totalRecords}
        first={(currentPage - 1) * rowsPerPage}
        onPage={(event) => {
          const pageIndex = event.page ?? 0;
          setCurrentPage(pageIndex + 1);
        }}
        selection={selectedRows}
        onSelectionChange={(e) => {
          const selectedRows = e.value as unknown as Artwork[];

          setSelectedIds((prev) => {
            const updated = new Set(prev);

            // Remove current page IDs
            artworks.forEach((row) => {
              updated.delete(row.id);
            });

            // Add newly selected rows
            selectedRows.forEach((row) => {
              updated.add(row.id);
            });

            return updated;
          });
        }}
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