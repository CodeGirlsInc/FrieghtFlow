import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DataTable } from "@/components/shared/DataTable";
import type { ColumnDef } from "@tanstack/react-table";

type Row = { id: string; name: string };

describe("DataTable", () => {
  it("sorts by clicking the header", async () => {
    const user = userEvent.setup();
    const data: Row[] = [
      { id: "1", name: "Charlie" },
      { id: "2", name: "Alice" },
      { id: "3", name: "Bob" },
    ];
    const columns: ColumnDef<Row>[] = [
      { accessorKey: "id", header: "ID" },
      { accessorKey: "name", header: "Name" },
    ];

    render(<DataTable data={data} columns={columns} pagination={false} />);

    // Initial first row should be "Charlie"
    const cellsBefore = screen.getAllByRole("cell");
    expect(cellsBefore.some((c) => c.textContent === "Charlie")).toBe(true);

    await user.click(screen.getByText("Name"));

    // After sorting asc by Name, "Alice" should appear before "Charlie"
    const rows = screen.getAllByRole("row");
    // rows[0] is header; first data row is rows[1]
    expect(rows[1]).toHaveTextContent("Alice");
  });
});

