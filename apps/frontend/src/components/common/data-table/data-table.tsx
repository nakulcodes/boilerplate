'use client';

import { flexRender, Table as TanStackTable } from '@tanstack/react-table';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { ReactNode } from 'react';

interface DataTableProps<TData> {
  table: TanStackTable<TData>;
  isLoading?: boolean;
  onRowClick?: (row: TData) => void;
  getRowClassName?: (row: TData) => string;
  emptyMessage?: string;
  enableRowSelection?: boolean;
}

export function DataTable<TData>({
  table,
  isLoading,
  onRowClick,
  getRowClassName,
  emptyMessage = 'No results found.',
  enableRowSelection = false,
}: DataTableProps<TData>) {
  const columns = table.getAllColumns();
  const rows = table.getRowModel().rows;

  return (
    <Table>
      <TableHeader>
        <TableRow>
          {enableRowSelection && (
            <TableHead className="w-[64px]">
              <Checkbox
                checked={table.getIsAllPageRowsSelected()}
                onCheckedChange={(value) =>
                  table.toggleAllPageRowsSelected(!!value)
                }
                className="ml-2"
              />
            </TableHead>
          )}
          {table.getHeaderGroups().map((headerGroup) =>
            headerGroup.headers.map((header) => (
              <TableHead
                key={header.id}
                style={{ width: header.column.columnDef.size }}
              >
                {header.isPlaceholder
                  ? null
                  : flexRender(
                      header.column.columnDef.header,
                      header.getContext(),
                    )}
              </TableHead>
            )),
          )}
        </TableRow>
      </TableHeader>
      <TableBody>
        {isLoading ? (
          <TableRow>
            <TableCell
              colSpan={columns.length + (enableRowSelection ? 1 : 0)}
              className="h-24 text-center"
            >
              <div className="flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                  <div className="relative flex items-center gap-2">
                    <div className="w-6 h-6 border-2 border-black/20 border-t-black/60 dark:border-white/20 dark:border-t-white/60 rounded-full animate-spin" />
                    <span className="text-sm text-muted-foreground">
                      Loading...
                    </span>
                  </div>
                </div>
              </div>
            </TableCell>
          </TableRow>
        ) : rows.length === 0 ? (
          <TableRow>
            <TableCell
              colSpan={columns.length + (enableRowSelection ? 1 : 0)}
              className="h-24 text-center text-muted-foreground"
            >
              {emptyMessage}
            </TableCell>
          </TableRow>
        ) : (
          rows.map((row) => (
            <TableRow
              key={row.id}
              data-state={row.getIsSelected() && 'selected'}
              onClick={() => onRowClick?.(row.original)}
              className={getRowClassName?.(row.original)}
            >
              {enableRowSelection && (
                <TableCell
                  className="w-[64px]"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Checkbox
                    checked={row.getIsSelected()}
                    onCheckedChange={(value) => row.toggleSelected(!!value)}
                    className="ml-2"
                  />
                </TableCell>
              )}
              {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}
