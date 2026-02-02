import React, { useState, useCallback, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
// Removed unused imports - now parsing CSV directly in browser
import { Program, ProgramImage } from '@/api/entities';
import { Upload, FileCheck, Loader2, AlertTriangle, List, Check, Download, X } from 'lucide-react';
import { toast } from 'sonner';
import { getProgramImage } from '../utils/programImageMapper';

// CSV is now parsed directly in browser - no need for extraction schema

export default function BulkImportModal({ isOpen, onClose, onImportSuccess }) {
    const [isDragOver, setIsDragOver] = useState(false);
    const [file, setFile] = useState(null);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [step, setStep] = useState('upload'); // 'upload', 'preview', 'importing'
    const [previewData, setPreviewData] = useState([]);
    const [invalidRows, setInvalidRows] = useState([]);
    const [uploadedImages, setUploadedImages] = useState([]);

    // Load uploaded images for auto-matching
    useEffect(() => {
        if (isOpen) {
            ProgramImage.list().then(images => {
                setUploadedImages(images);
            }).catch(err => {
                console.error('Failed to load program images:', err);
            });
        }
    }, [isOpen]);

    const resetState = () => {
        setFile(null);
        setUploadProgress(0);
        setIsLoading(false);
        setError('');
        setStep('upload');
        setPreviewData([]);
        setInvalidRows([]);
        setIsDragOver(false);
    };

    const handleClose = () => {
        resetState();
        onClose();
    };

    // Drag and Drop handlers
    const handleDragOver = useCallback((e) => {
        e.preventDefault();
        setIsDragOver(true);
    }, []);

    const handleDragLeave = useCallback((e) => {
        e.preventDefault();
        setIsDragOver(false);
    }, []);

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        setIsDragOver(false);
        
        const droppedFile = e.dataTransfer.files?.[0];
        if (droppedFile) {
            setFile(droppedFile);
            setError('');
        }
    }, []);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            setFile(selectedFile);
            setError('');
        }
    };

    // Parse date from column header like "30-NOVEMBER 2025", "01-DECEMBER 2025 MONDAY", "02-NOVEMBER 2025 TUESDAY"
    const parseDateFromHeader = (header) => {
        if (!header || typeof header !== 'string') return null;
        
        const cleanHeader = header.toString().trim().toUpperCase();
        
        // Skip TIME column
        if (cleanHeader === 'TIME') return null;
        
        const monthNames = {
            'JANUARY': '01', 'FEBRUARY': '02', 'MARCH': '03', 'APRIL': '04',
            'MAY': '05', 'JUNE': '06', 'JULY': '07', 'AUGUST': '08',
            'SEPTEMBER': '09', 'OCTOBER': '10', 'NOVEMBER': '11', 'DECEMBER': '12'
        };
        
        for (const [monthName, monthNum] of Object.entries(monthNames)) {
            if (cleanHeader.includes(monthName)) {
                // Extract day - can be at start like "30-NOVEMBER" or "01-DECEMBER"
                const dayMatch = cleanHeader.match(/(\d{1,2})[-\s]/);
                const yearMatch = cleanHeader.match(/(\d{4})/);
                
                if (dayMatch && yearMatch) {
                    const day = dayMatch[1].padStart(2, '0');
                    const year = yearMatch[1];
                    return `${year}-${monthNum}-${day}`;
                }
            }
        }
        
        return null;
    };

    // Parse time from TIME column like "12:00 AM" or "1:30 PM"
    const parseTimeValue = (timeStr) => {
        if (!timeStr) return null;
        
        const cleanTime = timeStr.toString().trim().toUpperCase();
        
        // Match patterns like "12:00 AM", "1:30 PM", "12:00AM", "1:30PM"
        const match = cleanTime.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
        if (match) {
            let hours = parseInt(match[1], 10);
            const minutes = match[2];
            const period = match[3]?.toUpperCase();
            
            if (period === 'PM' && hours !== 12) {
                hours += 12;
            } else if (period === 'AM' && hours === 12) {
                hours = 0;
            }
            
            return `${hours.toString().padStart(2, '0')}:${minutes}`;
        }
        
        return null;
    };

    const validateAndProcessData = (rawData, images) => {
        const validRows = [];
        const invalidRows = [];
        
        console.log('Raw data received:', rawData);
        
        if (!rawData || !Array.isArray(rawData) || rawData.length === 0) {
            console.log('No raw data or empty array');
            return { validRows, invalidRows };
        }
        
        // Get all column headers (keys from first row)
        const firstRow = rawData[0];
        const allKeys = Object.keys(firstRow);
        
        console.log('All keys from first row:', allKeys);
        
        // Find the TIME column (case-insensitive) - check for various forms
        const timeKey = allKeys.find(key => {
            const upperKey = key.toString().toUpperCase().trim();
            return upperKey === 'TIME' || upperKey.includes('TIME');
        });
        
        // Find date columns (columns that contain month names and year)
        const dateColumns = [];
        const monthKeywords = ['JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE', 
                               'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'];
        
        allKeys.forEach(key => {
            const upperKey = key.toString().toUpperCase().trim();
            
            // Skip TIME column
            if (upperKey === 'TIME' || upperKey.includes('TIME')) return;
            
            // Check if this column contains a month name
            const hasMonth = monthKeywords.some(month => upperKey.includes(month));
            
            if (hasMonth) {
                const parsedDate = parseDateFromHeader(key);
                if (parsedDate) {
                    dateColumns.push({ header: key, date: parsedDate });
                    console.log(`Date column found: "${key}" -> ${parsedDate}`);
                } else {
                    console.log(`Could not parse date from column: "${key}"`);
                }
            }
        });
        
        console.log('Detected TIME column:', timeKey);
        console.log('Detected date columns:', dateColumns);
        
        if (!timeKey) {
            console.log('TIME column not found in keys:', allKeys);
        }
        
        if (dateColumns.length === 0) {
            console.log('No date columns detected. Keys were:', allKeys);
            // Try a more lenient approach - any column that's not TIME and has content
            allKeys.forEach(key => {
                const upperKey = key.toString().toUpperCase().trim();
                if (upperKey !== 'TIME' && !upperKey.includes('TIME')) {
                    console.log(`Non-TIME column that failed date parse: "${key}"`);
                }
            });
        }
        
        // Process each row
        rawData.forEach((row, rowIndex) => {
            const timeValue = timeKey ? row[timeKey] : null;
            const parsedTime = parseTimeValue(timeValue);
            
            console.log(`Row ${rowIndex}: Time value="${timeValue}", Parsed time="${parsedTime}"`);
            
            if (!parsedTime) {
                // Skip rows without valid time
                return;
            }
            
            // For each date column, create a program entry
            dateColumns.forEach((dateCol) => {
                const programTitle = row[dateCol.header];
                
                // Skip only empty cells (removed "NEW" filter - user may have programs starting with NEW)
                if (!programTitle || programTitle.toString().trim() === '') {
                    return;
                }
                
                const cleanTitle = programTitle.toString().trim();
                
                // Create program entry - pass images for dynamic matching
                const processedRow = {
                    title: cleanTitle,
                    schedule_date: dateCol.date,
                    schedule_time: parsedTime,
                    category: 'live_mass',
                    status: 'scheduled',
                    is_published: true,
                    program_image: getProgramImage(cleanTitle, images)
                };
                
                console.log('Created program:', processedRow);
                validRows.push(processedRow);
            });
        });

        console.log('Total valid rows:', validRows.length);
        return { validRows, invalidRows };
    };

    const simulateUploadProgress = () => {
        setUploadProgress(0);
        const interval = setInterval(() => {
            setUploadProgress(prev => {
                if (prev >= 95) {
                    clearInterval(interval);
                    return 95;
                }
                return prev + Math.random() * 15;
            });
        }, 200);
        return interval;
    };
    
    const handleDownloadTemplate = () => {
        // Grid format template matching the reference image
        const headers = ["TIME", "23-NOVEMBER 2025 SUNDAY", "24-NOVEMBER 2025 MONDAY", "25-NOVEMBER 2025 TUESDAY"];
        const sampleRows = [
            ["12:00 AM", "ARAM SEI", "PRAISE AND WORSHIP", "VANTHATHUM THANTHATHUM"],
            ["12:30 AM", "ANDRADA UNAVVU", "VAZHVU THARUM IRAIVARTHAI - CHRIST THE KING", "ANDRADA UNAVVU"],
            ["12:45 AM", "SONGS", "", "SONGS"],
            ["1:00 AM", "HOLY MASS (TAMIL) - KOTTAR", "HOLY MASS (TAMIL) - CHENGALPET", "HOLY MASS (TAMIL) - MADURAI"],
            ["2:00 AM", "MARIAN HYMNS", "VANTHATHUM THANTHATHUM", "PUTHAGAM PESUGIRATHU"],
            ["3:00 AM", "DIVINE MERCY ROSARY", "DIVINE MERCY ROSARY", "DIVINE MERCY ROSARY"]
        ];
        
        const csvContent = "data:text/csv;charset=utf-8," 
            + headers.join(",") + "\n" 
            + sampleRows.map(row => row.join(",")).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "madha_program_schedule_grid_template.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success("Grid template downloaded!");
    };

    // Parse CSV file directly in browser
    const parseCSVFile = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const text = e.target.result;
                    const lines = text.split(/\r?\n/).filter(line => line.trim());
                    
                    if (lines.length < 2) {
                        reject(new Error("CSV file must have at least a header row and one data row"));
                        return;
                    }
                    
                    // Parse header row
                    const headers = parseCSVLine(lines[0]);
                    console.log('CSV Headers:', headers);
                    
                    // Parse data rows
                    const rows = [];
                    for (let i = 1; i < lines.length; i++) {
                        const values = parseCSVLine(lines[i]);
                        const row = {};
                        headers.forEach((header, index) => {
                            row[header] = values[index] || '';
                        });
                        rows.push(row);
                    }
                    
                    console.log('Parsed CSV rows:', rows);
                    resolve(rows);
                } catch (err) {
                    reject(err);
                }
            };
            reader.onerror = () => reject(new Error("Failed to read file"));
            reader.readAsText(file);
        });
    };
    
    // Parse a single CSV line handling quoted values
    const parseCSVLine = (line) => {
        const result = [];
        let current = '';
        let inQuotes = false;
        
        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            
            if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                result.push(current.trim());
                current = '';
            } else {
                current += char;
            }
        }
        result.push(current.trim());
        
        return result;
    };

    const handlePreview = async () => {
        if (!file) {
            setError("Please select a file to upload.");
            return;
        }

        setIsLoading(true);
        setError('');
        setUploadProgress(30);

        try {
            // Parse CSV directly in browser
            const extractedPrograms = await parseCSVFile(file);
            
            setUploadProgress(100);
            
            console.log('Extracted programs from CSV:', extractedPrograms);
            
            if (!extractedPrograms || extractedPrograms.length === 0) {
                 throw new Error("No valid program data found in the file. Please check the CSV format.");
            }

            const { validRows, invalidRows } = validateAndProcessData(extractedPrograms, uploadedImages);
            
            console.log('Validated - Valid rows:', validRows.length, 'Invalid rows:', invalidRows.length);
            
            if (validRows.length === 0) {
                throw new Error("No valid programs found. Make sure your CSV has TIME column and date columns like '30-NOVEMBER 2025'.");
            }
            
            setPreviewData(validRows);
            setInvalidRows(invalidRows);
            setStep('preview');

        } catch (err) {
            setError(err.message);
            setUploadProgress(0);
        } finally {
            setIsLoading(false);
        }
    };

    const handleConfirmImport = async () => {
        setStep('importing');
        setIsLoading(true);
        
        try {
            if (previewData.length > 0) {
                await Program.bulkCreate(previewData);
                toast.success(`${previewData.length} programs imported successfully!`);
                if (invalidRows.length > 0) {
                    toast.warning(`${invalidRows.length} rows were skipped due to errors.`);
                }
            }
            onImportSuccess();
            handleClose();

        } catch (err) {
            setError(err.message || "An error occurred during import.");
            setStep('preview');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Upload className="w-5 h-5" />
                        Bulk Import Program Schedule
                    </DialogTitle>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto">
                    {step === 'upload' && (
                        <div className="py-4 space-y-6">
                            {/* Instructions */}
                            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                <h3 className="font-semibold mb-2 text-blue-900">📋 Upload Instructions (Grid Schedule Format):</h3>
                                <ul className="list-decimal list-inside text-sm text-blue-800 space-y-1">
                                    <li>Upload CSV in grid format with <code className="bg-blue-100 p-1 rounded">TIME</code> column and date columns.</li>
                                    <li>First column: <code className="bg-blue-100 p-1 rounded">TIME</code> (e.g., 12:00 AM, 1:30 PM)</li>
                                    <li>Date columns: <code className="bg-blue-100 p-1 rounded">23-NOVEMBER 2025 SUNDAY</code> format</li>
                                    <li>Each cell contains the program name for that time slot and date.</li>
                                    <li>Program images will be auto-assigned based on program title.</li>
                                </ul>
                                
                                <Button variant="link" onClick={handleDownloadTemplate} className="p-0 h-auto mt-2 text-blue-600">
                                    <Download className="w-4 h-4 mr-1" />
                                    Download Sample Template
                                </Button>
                            </div>

                            {/* Drag & Drop Zone */}
                            <div
                                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                                    isDragOver ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
                                }`}
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                            >
                                <div className="mx-auto w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                                    <Upload className={`w-6 h-6 ${isDragOver ? 'text-blue-500' : 'text-gray-400'}`} />
                                </div>
                                <h3 className="text-lg font-medium text-gray-900 mb-2">
                                    {isDragOver ? 'Drop your file here' : 'Drag & Drop Schedule Files Here'}
                                </h3>
                                <p className="text-gray-500 mb-4">
                                    Or click to browse and select your CSV file
                                </p>
                                
                                <Label htmlFor="file-upload" className="cursor-pointer">
                                    <Input
                                        id="file-upload"
                                        type="file"
                                        className="hidden"
                                        accept=".csv"
                                        onChange={handleFileChange}
                                    />
                                    <Button variant="outline" className="pointer-events-none">
                                        Choose File
                                    </Button>
                                </Label>
                                
                                {file && (
                                    <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <FileCheck className="w-4 h-4 text-green-600" />
                                                <span className="text-sm font-medium text-green-800">{file.name}</span>
                                                <span className="text-xs text-green-600">({(file.size / 1024).toFixed(1)} KB)</span>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => setFile(null)}
                                                className="text-green-600 hover:text-green-800"
                                            >
                                                <X className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Upload Progress */}
                            {isLoading && (
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span>Uploading and processing...</span>
                                        <span>{Math.round(uploadProgress)}%</span>
                                    </div>
                                    <Progress value={uploadProgress} className="w-full" />
                                </div>
                            )}

                            {error && (
                                <div className="bg-red-50 text-red-700 p-3 rounded-md flex items-center gap-2 text-sm">
                                    <AlertTriangle className="w-4 h-4" />
                                    <p>{error}</p>
                                </div>
                            )}
                        </div>
                    )}
                    
                    {step === 'preview' && (
                        <div className="py-4 space-y-4">
                            <div className="flex justify-between items-center">
                                <h3 className="text-lg font-semibold">Preview Import Data</h3>
                                <div className="flex gap-2">
                                    {previewData.length > 0 && (
                                        <span className="text-sm text-green-600 bg-green-50 px-2 py-1 rounded">
                                            ✓ {previewData.length} valid rows
                                        </span>
                                    )}
                                    {invalidRows.length > 0 && (
                                        <span className="text-sm text-red-600 bg-red-50 px-2 py-1 rounded">
                                            ⚠ {invalidRows.length} invalid rows
                                        </span>
                                    )}
                                </div>
                            </div>
                            
                            {/* Valid Data Preview */}
                            {previewData.length > 0 && (
                                <div>
                                    <h4 className="font-medium text-green-800 mb-2">✅ Valid Programs ({previewData.length})</h4>
                                    <div className="max-h-64 overflow-y-auto border rounded-lg">
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-gray-50 sticky top-0">
                                                <tr>
                                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Duration (min)</th>
                                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Auto-Assigned Image</th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {previewData.slice(0, 10).map((row, index) => (
                                                    <tr key={index} className="hover:bg-gray-50">
                                                        <td className="px-4 py-2 text-sm">{row.title}</td>
                                                        <td className="px-4 py-2 text-sm">{row.schedule_date}</td>
                                                        <td className="px-4 py-2 text-sm">{row.schedule_time}</td>
                                                        <td className="px-4 py-2 text-sm">{row.duration_minutes || '-'}</td>
                                                        <td className="px-4 py-2 text-sm">{row.category || 'live_mass'}</td>
                                                        <td className="px-4 py-2 text-sm">
                                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                                {row.program_image}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                        {previewData.length > 10 && (
                                            <div className="p-2 text-center text-sm text-gray-500 bg-gray-50">
                                                ... and {previewData.length - 10} more rows (all with auto-assigned images)
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Invalid Data Preview */}
                            {invalidRows.length > 0 && (
                                <div>
                                    <h4 className="font-medium text-red-800 mb-2">❌ Invalid Rows ({invalidRows.length}) - Will be skipped</h4>
                                    <div className="max-h-32 overflow-y-auto border border-red-200 rounded-lg">
                                        {invalidRows.map((row, index) => (
                                            <div key={index} className="p-2 border-b border-red-100 last:border-b-0">
                                                <div className="text-sm font-medium text-red-800">Row {row.rowNumber}:</div>
                                                <div className="text-xs text-red-600">{row.errors.join(', ')}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {error && (
                                <div className="bg-red-50 text-red-700 p-3 rounded-md flex items-center gap-2 text-sm">
                                    <AlertTriangle className="w-4 h-4" />
                                    <p>{error}</p>
                                </div>
                            )}
                        </div>
                    )}

                    {step === 'importing' && (
                        <div className="py-8 text-center">
                            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
                            <h3 className="text-lg font-medium mb-2">Importing Programs...</h3>
                            <p className="text-gray-600">Please wait while we process your schedule data.</p>
                        </div>
                    )}
                </div>

                <DialogFooter className="border-t pt-4">
                    <Button variant="outline" onClick={handleClose} disabled={isLoading}>
                        Cancel
                    </Button>
                    
                    {step === 'upload' && (
                        <Button onClick={handlePreview} disabled={isLoading || !file}>
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Processing...
                                </>
                            ) : (
                                <>
                                    <List className="mr-2 h-4 w-4" />
                                    Preview Data
                                </>
                            )}
                        </Button>
                    )}
                    
                    {step === 'preview' && (
                        <Button 
                            onClick={handleConfirmImport} 
                            disabled={isLoading || previewData.length === 0}
                            className="bg-green-600 hover:bg-green-700"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Importing...
                                </>
                            ) : (
                                <>
                                    <Check className="mr-2 h-4 w-4" />
                                    Import {previewData.length} Programs
                                </>
                            )}
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}