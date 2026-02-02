"use client";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DataTablePaginationProps } from "./data-table-types";

export function DataTablePagination<TData>({
  table,
  totalItems,
  pageSizeOptions = [5, 8, 10, 20, 50, 100],
}: DataTablePaginationProps<TData>) {
  const state = table.getState();
  const pageIndex = state.pagination.pageIndex;
  const pageSize = state.pagination.pageSize;
  const pageCount = table.getPageCount();

  const startRow = pageIndex * pageSize + 1;
  const endRow = Math.min((pageIndex + 1) * pageSize, totalItems);

  return (
    <div className="flex items-center justify-between mt-3">
      <div className="flex items-center gap-4">
        <div className="text-sm text-muted-foreground">
          Showing {startRow} to {endRow} of {totalItems} items
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Show:</span>
          <Select
            value={pageSize.toString()}
            onValueChange={(value) => {
              table.setPageSize(Number(value));
            }}
          >
            <SelectTrigger className="w-[80px] rounded-xl h-8 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              {pageSizeOptions.map((size) => (
                <SelectItem key={size} value={size.toString()}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span className="text-sm text-muted-foreground">per page</span>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="h-8 w-8"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="text-sm text-muted-foreground min-w-[100px] text-center">
            Page {pageIndex + 1} of {pageCount || 1}
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="h-8 w-8"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
