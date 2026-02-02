import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { format } from 'date-fns';

export default function ReportDataTable({ data, columns, isLoading }) {

    const exportToCSV = () => {
        const headers = columns.map(col => col.header).join(',');
        const rows = data.map(row => {
            return columns.map(col => {
                let value = row[col.accessorKey];
                if (col.accessorKey.includes('date')) {
                    value = value ? format(new Date(value), 'yyyy-MM-dd') : '';
                }
                // Escape commas in the value
                return `"${String(value || '').replace(/"/g, '""')}"`;
            }).join(',');
        });

        const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "report.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (isLoading) {
        return <p>Loading report data...</p>;
    }

    if (!data || data.length === 0) {
        return <p className="text-center py-10">No data available for the selected criteria.</p>;
    }

    return (
        <div>
            <div className="flex justify-end mb-4">
                <Button onClick={exportToCSV} className="bg-[#B71C1C] hover:bg-[#D32F2F]">
                    <Download className="w-4 h-4 mr-2" /> Export to CSV
                </Button>
            </div>
            <div className="border rounded-md">
                <Table>
                    <TableHeader>
                        <TableRow>
                            {columns.map(col => <TableHead key={col.accessorKey}>{col.header}</TableHead>)}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data.map((row, rowIndex) => (
                            <TableRow key={rowIndex}>
                                {columns.map(col => (
                                    <TableCell key={col.accessorKey}>
                                        {col.accessorKey.includes('date')
                                            ? row[col.accessorKey] ? format(new Date(row[col.accessorKey]), 'PP') : 'N/A'
                                            : row[col.accessorKey]}
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}