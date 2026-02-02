import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Upload, FileText, Database, CheckCircle, XCircle, AlertCircle, Loader2, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { base44 } from '@/api/base44Client';
import MappingDialog from '../components/sql-migration/MappingDialog';

export default function SQLFileMigration() {
    const [selectedFile, setSelectedFile] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [processingProgress, setProcessingProgress] = useState(0);
    const [detectedTables, setDetectedTables] = useState([]);
    const [migrationStatus, setMigrationStatus] = useState({});
    const [showMappingDialog, setShowMappingDialog] = useState(false);
    const [currentTable, setCurrentTable] = useState(null);
    const fileInputRef = useRef(null);

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file && (file.name.endsWith('.sql') || file.name.endsWith('.csv'))) {
            setSelectedFile(file);
            toast.success(`File selected: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`);
        } else {
            toast.error('Please select a valid .sql or .csv file');
        }
    };

    const parseTableStructure = (createStatement) => {
        const tableNameMatch = createStatement.match(/CREATE TABLE [`']?(\w+)[`']?/i);
        const tableName = tableNameMatch ? tableNameMatch[1] : null;
        
        if (!tableName) return null;

        const columnMatches = createStatement.match(/\(([^)]+)\)/s);
        if (!columnMatches) return null;

        const columnsText = columnMatches[1];
        const columnLines = columnsText.split(',').map(line => line.trim());
        
        const columns = [];
        for (const line of columnLines) {
            if (line.startsWith('PRIMARY KEY') || line.startsWith('KEY') || 
                line.startsWith('UNIQUE') || line.startsWith('CONSTRAINT')) {
                continue;
            }
            
            const columnMatch = line.match(/^[`']?(\w+)[`']?\s+(\w+)/);
            if (columnMatch) {
                const [, name, type] = columnMatch;
                columns.push({ name, type: type.toUpperCase() });
            }
        }

        return { tableName, columns };
    };

    const estimateRowCount = (sqlContent, tableName) => {
        const insertPattern = new RegExp(`INSERT INTO [\`']?${tableName}[\`']?`, 'gi');
        const matches = sqlContent.match(insertPattern);
        return matches ? matches.length * 10 : 0; // Rough estimate
    };

    const processFile = async () => {
        if (!selectedFile) return;

        setIsProcessing(true);
        setProcessingProgress(0);
        setDetectedTables([]);

        try {
            // Handle CSV files
            if (selectedFile.name.endsWith('.csv')) {
                toast.info('Detected CSV file - preparing for users migration');

                const text = await selectedFile.text();
                const lines = text.split(/\r?\n/).filter(line => line.trim());
                const estimatedRows = lines.length - 1; // Exclude header

                setDetectedTables([{
                    tableName: 'users',
                    columns: [
                        { name: 'id', type: 'VARCHAR' },
                        { name: 'name', type: 'VARCHAR' },
                        { name: 'email', type: 'VARCHAR' },
                        { name: 'phone', type: 'VARCHAR' },
                        { name: 'usertype', type: 'VARCHAR' },
                        { name: 'flag', type: 'VARCHAR' }
                    ],
                    estimatedRows: estimatedRows
                }]);

                setProcessingProgress(100);
                toast.success(`CSV file ready for migration (${estimatedRows} rows)`);
                setIsProcessing(false);
                return;
            }

            // Handle SQL files
            const chunkSize = 5 * 1024 * 1024; // 5MB chunks
            const totalSize = selectedFile.size;
            let offset = 0;
            let buffer = '';
            const tables = [];
            const tableInserts = {};

            while (offset < totalSize) {
                const chunk = selectedFile.slice(offset, offset + chunkSize);
                const text = await chunk.text();
                buffer += text;
                offset += chunkSize;
                setProcessingProgress(Math.min((offset / totalSize) * 100, 99));

                // Extract CREATE TABLE statements
                const createTableRegex = /CREATE TABLE[^;]+;/gi;
                const createMatches = buffer.match(createTableRegex) || [];
                
                for (const createStmt of createMatches) {
                    const tableInfo = parseTableStructure(createStmt);
                    if (tableInfo && !tables.find(t => t.tableName === tableInfo.tableName)) {
                        tables.push(tableInfo);
                        tableInserts[tableInfo.tableName] = 0;
                    }
                }

                // Count INSERT statements
                const insertRegex = /INSERT INTO [`']?(\w+)[`']?/gi;
                let insertMatch;
                while ((insertMatch = insertRegex.exec(buffer)) !== null) {
                    const tableName = insertMatch[1];
                    if (tableInserts[tableName] !== undefined) {
                        tableInserts[tableName]++;
                    }
                }

                // Keep last part of buffer for next iteration
                buffer = buffer.slice(-1000);
            }

            // Finalize table data with row counts
            const finalTables = tables.map(table => ({
                ...table,
                estimatedRows: tableInserts[table.tableName] || 0
            }));

            setDetectedTables(finalTables);
            setProcessingProgress(100);
            toast.success(`Found ${finalTables.length} tables in SQL file`);
        } catch (error) {
            console.error('Error processing file:', error);
            toast.error('Failed to process SQL file');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleAutoMigrate = (table) => {
        setCurrentTable(table);
        setShowMappingDialog(true);
    };

    const handleHybridUsersMigration = async (table) => {
        const tableName = table.tableName;

        setMigrationStatus(prev => ({
            ...prev,
            [tableName]: {
                status: 'preparing',
                progress: 0,
                total: table.estimatedRows,
                migrated: 0,
                errors: [],
                skipped: 0
            }
        }));

        try {
            const isCSV = selectedFile.name.endsWith('.csv');

            toast.info('🔍 Extracting users data...');
            const usersData = isCSV ? await extractUsersDataFromCSV() : await extractUsersData(tableName);

            if (usersData.length === 0) {
                throw new Error('No user records found');
            }

            toast.info(`📋 Found ${usersData.length} users. Starting batched migration...`);

            setMigrationStatus(prev => ({
                ...prev,
                [tableName]: { ...prev[tableName], status: 'migrating', total: usersData.length }
            }));

            // Process in very small batches with retry logic to avoid network errors
            const BATCH_SIZE = 50;
            const MAX_RETRIES = 3;
            let totalInserted = 0;
            let totalSkipped = 0;
            let totalFailed = 0;

            for (let i = 0; i < usersData.length; i += BATCH_SIZE) {
                const batch = usersData.slice(i, i + BATCH_SIZE);
                const batchNum = Math.floor(i / BATCH_SIZE) + 1;
                const totalBatches = Math.ceil(usersData.length / BATCH_SIZE);

                let retryCount = 0;
                let batchSuccess = false;

                while (retryCount < MAX_RETRIES && !batchSuccess) {
                    try {
                        if (retryCount > 0) {
                            toast.info(`Retrying batch ${batchNum}/${totalBatches} (attempt ${retryCount + 1}/${MAX_RETRIES})...`);
                        } else {
                            toast.info(`Processing batch ${batchNum}/${totalBatches} (${batch.length} users)...`);
                        }

                        const response = await base44.functions.invoke('migrateLegacyUsersToAppUser', {
                            users: batch
                        });

                        const result = response.data;
                        totalInserted += result.inserted || 0;
                        totalSkipped += result.skipped || 0;
                        totalFailed += result.failed || 0;

                        batchSuccess = true;

                    } catch (error) {
                        retryCount++;
                        console.error(`Batch ${batchNum} error (attempt ${retryCount}):`, error.message);

                        if (retryCount >= MAX_RETRIES) {
                            toast.error(`Failed batch ${batchNum} after ${MAX_RETRIES} attempts`);
                            totalFailed += batch.length;
                        } else {
                            // Exponential backoff: wait longer between retries
                            await new Promise(resolve => setTimeout(resolve, 2000 * retryCount));
                        }
                    }
                }

                // Update progress
                const progress = Math.min(((i + batch.length) / usersData.length) * 100, 100);
                setMigrationStatus(prev => ({
                    ...prev,
                    [tableName]: {
                        ...prev[tableName],
                        progress: progress,
                        migrated: totalInserted,
                        skipped: totalSkipped
                    }
                }));

                // Wait between successful batches
                if (i + BATCH_SIZE < usersData.length) {
                    await new Promise(resolve => setTimeout(resolve, 1500));
                }
            }

            setMigrationStatus(prev => ({
                ...prev,
                [tableName]: {
                    ...prev[tableName],
                    status: 'completed',
                    progress: 100,
                    migrated: totalInserted,
                    skipped: totalSkipped,
                    errors: totalFailed > 0 ? [{ error: `${totalFailed} records failed to migrate` }] : []
                }
            }));

            toast.success(`✅ Migration completed: ${totalInserted} inserted, ${totalSkipped} skipped`);
        } catch (error) {
            console.error('Hybrid migration error:', error);
            setMigrationStatus(prev => ({
                ...prev,
                [tableName]: {
                    ...prev[tableName],
                    status: 'failed',
                    errors: [{ error: error.message }]
                }
            }));
            toast.error(`❌ Migration failed: ${error.message}`);
        }
    };

    const extractUsersData = async (tableName) => {
        const chunkSize = 5 * 1024 * 1024;
        const totalSize = selectedFile.size;
        let offset = 0;
        let buffer = '';
        const users = [];

        const insertPattern = new RegExp(
            `INSERT INTO [\`']?${tableName}[\`']?[^;]+;`,
            'gis'
        );

        while (offset < totalSize) {
            const chunk = selectedFile.slice(offset, offset + chunkSize);
            const text = await chunk.text();
            buffer += text;
            offset += chunkSize;

            let match;
            insertPattern.lastIndex = 0;

            while ((match = insertPattern.exec(buffer)) !== null) {
                const insertStatement = match[0];
                const valuesPattern = /VALUES\s*\(([^)]+(?:\([^)]*\)[^)]*)*)\)/gis;
                const allValuesMatches = insertStatement.matchAll(valuesPattern);

                for (const valuesMatch of allValuesMatches) {
                    try {
                        const valuesString = valuesMatch[1];
                        const values = parseInsertValues(valuesString);

                        if (values.length >= 3) {
                            // Map SQL INSERT values based on actual column order:
                            // id, name, email, password, usertype, flag, phone, address1, ...
                            // CRITICAL: Phone is at index 6
                            users.push({
                                id: String(values[0] || ''),
                                name: String(values[1] || ''),
                                email: String(values[2] || ''),
                                password: String(values[3] || ''),
                                usertype: String(values[4] || '1'),
                                flag: String(values[5] || '0'),
                                phonenumber: String(values[6] || ''), // Corrected: phone at index 6
                                address1: String(values[7] || ''),
                                address2: String(values[8] || ''),
                                country: String(values[9] || ''),
                                state: String(values[10] || ''),
                                city: String(values[11] || ''),
                                zipcode: String(values[12] || ''),
                                regdate: String(values[13] || ''),
                                userimage: String(values[14] || ''),
                                platform: String(values[15] || 'web')
                            });
                        }
                    } catch (error) {
                        // Log and continue - never fail
                        console.warn('Skipped malformed row:', error.message);
                    }
                }
            }

            const lastInsertIndex = buffer.lastIndexOf('INSERT INTO');
            if (lastInsertIndex > 0 && offset < totalSize) {
                buffer = buffer.slice(lastInsertIndex);
            } else {
                buffer = '';
            }
        }

        console.log(`Extracted ${users.length} users (all fields as strings, no validation)`);
        return users;
    };

    const handleMigrationConfirm = async (mappingData) => {
        const { tableName, entityName, columnMapping, createNewEntity } = mappingData;
        
        setShowMappingDialog(false);
        
        // Initialize migration status
        setMigrationStatus(prev => ({
            ...prev,
            [tableName]: {
                status: 'preparing',
                progress: 0,
                total: currentTable.estimatedRows,
                migrated: 0,
                errors: []
            }
        }));

        try {
            // Step 1: Create entity if needed
            if (createNewEntity) {
                toast.info(`Creating new entity: ${entityName}`);
                await createEntityFromMapping(entityName, columnMapping);
                toast.success(`Entity ${entityName} created successfully`);
            }

            // Step 2: Extract and migrate data
            setMigrationStatus(prev => ({
                ...prev,
                [tableName]: { ...prev[tableName], status: 'migrating' }
            }));

            await migrateTableData(tableName, entityName, columnMapping);

            setMigrationStatus(prev => ({
                ...prev,
                [tableName]: { ...prev[tableName], status: 'completed' }
            }));

            toast.success(`Migration completed for ${tableName}`);
        } catch (error) {
            console.error('Migration error:', error);
            setMigrationStatus(prev => ({
                ...prev,
                [tableName]: { 
                    ...prev[tableName], 
                    status: 'failed',
                    errors: [...(prev[tableName]?.errors || []), error.message]
                }
            }));
            toast.error(`Migration failed for ${tableName}`);
        }
    };

    const createEntityFromMapping = async (entityName, columnMapping) => {
        const properties = {};
        
        for (const [sqlCol, mapping] of Object.entries(columnMapping)) {
            if (mapping.skip || sqlCol === 'id') continue;
            
            const fieldName = mapping.fieldName || sqlCol;
            const sqlType = mapping.sqlType.toUpperCase();
            
            let base44Type = 'string';
            if (sqlType.includes('INT') || sqlType.includes('DECIMAL') || sqlType.includes('FLOAT')) {
                base44Type = 'number';
            } else if (sqlType.includes('BOOL')) {
                base44Type = 'boolean';
            } else if (sqlType.includes('DATE') || sqlType.includes('TIME')) {
                base44Type = 'string';
                properties[fieldName] = { type: base44Type, format: 'date-time' };
                continue;
            } else if (sqlType.includes('TEXT')) {
                base44Type = 'string';
            }
            
            properties[fieldName] = { type: base44Type };
        }

        const entitySchema = {
            name: entityName,
            type: 'object',
            properties
        };

        // Create entity using backend function
        const response = await base44.functions.invoke('createEntityFromSchema', {
            schema: entitySchema
        });

        if (!response.data.success) {
            throw new Error(response.data.error || 'Failed to create entity');
        }
    };

    const migrateTableData = async (tableName, entityName, columnMapping) => {
        const chunkSize = 1 * 1024 * 1024; // 1MB for data extraction
        const totalSize = selectedFile.size;
        let offset = 0;
        let buffer = '';
        let recordCount = 0;
        const errors = [];

        const insertPattern = new RegExp(
            `INSERT INTO [\`']?${tableName}[\`']?[^;]*VALUES\\s*\\(([^)]+)\\)[^;]*;`,
            'gi'
        );

        while (offset < totalSize) {
            const chunk = selectedFile.slice(offset, offset + chunkSize);
            const text = await chunk.text();
            buffer += text;
            offset += chunkSize;

            let match;
            while ((match = insertPattern.exec(buffer)) !== null) {
                try {
                    const valuesString = match[1];
                    const values = parseInsertValues(valuesString);
                    
                    const record = {};
                    let colIndex = 0;
                    for (const [sqlCol, mapping] of Object.entries(columnMapping)) {
                        if (mapping.skip || sqlCol === 'id') {
                            colIndex++;
                            continue;
                        }
                        
                        const fieldName = mapping.fieldName || sqlCol;
                        record[fieldName] = values[colIndex];
                        colIndex++;
                    }

                    // Insert record
                    await base44.asServiceRole.entities[entityName].create(record);
                    recordCount++;

                    // Update progress
                    setMigrationStatus(prev => ({
                        ...prev,
                        [tableName]: {
                            ...prev[tableName],
                            progress: (recordCount / prev[tableName].total) * 100,
                            migrated: recordCount
                        }
                    }));

                    // Rate limiting
                    if (recordCount % 10 === 0) {
                        await new Promise(resolve => setTimeout(resolve, 100));
                    }
                } catch (error) {
                    errors.push({ row: recordCount, error: error.message });
                    setMigrationStatus(prev => ({
                        ...prev,
                        [tableName]: {
                            ...prev[tableName],
                            errors: [...prev[tableName].errors, { row: recordCount, error: error.message }]
                        }
                    }));
                }
            }

            buffer = buffer.slice(-5000);
        }
    };

    const extractUsersDataFromCSV = async () => {
        const text = await selectedFile.text();
        const lines = text.split(/\r?\n/).filter(line => line.trim());

        if (lines.length === 0) return [];

        // Skip header row
        const dataLines = lines.slice(1);
        const users = [];

        for (const line of dataLines) {
            try {
                // Parse CSV line (handle quoted values with commas)
                const values = [];
                let current = '';
                let inQuotes = false;

                for (let i = 0; i < line.length; i++) {
                    const char = line[i];

                    if (char === '"') {
                        inQuotes = !inQuotes;
                    } else if (char === ',' && !inQuotes) {
                        values.push(current.trim());
                        current = '';
                    } else {
                        current += char;
                    }
                }
                values.push(current.trim());

                // Map CSV columns based on actual structure from error log:
                // 30414,Leo Edmond joseph,leojoseph06444@gmail.com,,2,91,leojoseph06444@,...
                // Index: 0=id, 1=name, 2=email, 3=password, 4=usertype, 5=flag, 6=phone, ...
                // CRITICAL: Phone is at index 6, NOT 4
                if (values.length >= 15) {
                    users.push({
                        id: String(values[0] || ''),
                        name: String(values[1] || ''),
                        email: String(values[2] || ''),
                        password: String(values[3] || ''),
                        usertype: String(values[4] || '1'),
                        flag: String(values[5] || '0'),
                        phonenumber: String(values[6] || ''), // Corrected: phone is at index 6
                        address1: String(values[7] || ''),
                        address2: String(values[8] || ''),
                        country: String(values[9] || ''),
                        state: String(values[10] || ''),
                        city: String(values[11] || ''),
                        zipcode: String(values[12] || ''),
                        regdate: String(values[13] || ''),
                        userimage: String(values[14] || ''),
                        platform: String(values[15] || 'web')
                    });
                }
            } catch (error) {
                console.warn('Skipped malformed CSV row:', error.message);
            }
        }

        console.log(`Extracted ${users.length} users from CSV (all fields as strings)`);
        return users;
    };

    const parseInsertValues = (valuesString) => {
        const values = [];
        let current = '';
        let inQuotes = false;
        let escapeNext = false;

        for (let i = 0; i < valuesString.length; i++) {
            const char = valuesString[i];

            if (escapeNext) {
                current += char;
                escapeNext = false;
                continue;
            }

            if (char === '\\') {
                escapeNext = true;
                continue;
            }

            if (char === "'" && !escapeNext) {
                inQuotes = !inQuotes;
                continue;
            }

            if (char === ',' && !inQuotes) {
                values.push(current.trim());
                current = '';
                continue;
            }

            current += char;
        }

        if (current) {
            values.push(current.trim());
        }

        // NO TYPE CONVERSION - return everything as strings
        return values.map(v => {
            if (v === 'NULL' || v === 'null' || v === '') return null;
            return v.replace(/^['"]|['"]$/g, '');
        });
    };

    const handleReset = () => {
        setSelectedFile(null);
        setDetectedTables([]);
        setMigrationStatus({});
        setProcessingProgress(0);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
        toast.info('Reset completed');
    };

    return (
        <div className="bg-slate-50 min-h-screen p-6">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">SQL File Migration</h1>
                    <p className="text-slate-600">Upload your SQL file and migrate data into Base44 entities</p>
                </div>

                {/* Upload & Parse Card */}
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Upload className="w-5 h-5" />
                            Upload & Parse SQL File
                        </CardTitle>
                        <CardDescription>
                            Select a .sql or .csv file to migrate users. File will be processed locally in your browser.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-center gap-4">
                                <Input
                                    ref={fileInputRef}
                                    type="file"
                                    accept=".sql,.csv"
                                    onChange={handleFileSelect}
                                    className="flex-1"
                                />
                                <Button
                                    onClick={processFile}
                                    disabled={!selectedFile || isProcessing}
                                    className="bg-[#B71C1C] hover:bg-[#8B0000]"
                                >
                                    {isProcessing ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            Processing...
                                        </>
                                    ) : (
                                        <>
                                            <FileText className="w-4 h-4 mr-2" />
                                            Upload & Parse
                                        </>
                                    )}
                                </Button>
                                {detectedTables.length > 0 && (
                                    <Button onClick={handleReset} variant="outline">
                                        <RefreshCw className="w-4 h-4 mr-2" />
                                        Reset
                                    </Button>
                                )}
                            </div>

                            {selectedFile && (
                                <Alert>
                                    <FileText className="w-4 h-4" />
                                    <AlertDescription>
                                        <strong>{selectedFile.name}</strong> - {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                                    </AlertDescription>
                                </Alert>
                            )}

                            {isProcessing && (
                                <div className="space-y-2">
                                    <Progress value={processingProgress} className="w-full" />
                                    <p className="text-sm text-slate-600 text-center">
                                        Processing large file locally... {Math.round(processingProgress)}%
                                    </p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Detected Tables Card */}
                {detectedTables.length > 0 && (
                    <Card className="mb-6">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Database className="w-5 h-5" />
                                Detected Tables ({detectedTables.length})
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {detectedTables.map((table, index) => {
                                    const isUsersTable = table.tableName.toLowerCase() === 'users';
                                    return (
                                        <div key={index} className="border rounded-lg p-4 bg-white">
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <h3 className="font-semibold text-lg">{table.tableName}</h3>
                                                        {isUsersTable && (
                                                            <Badge className="bg-purple-500">
                                                                System Table – Hybrid Migration
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    <div className="text-sm text-slate-600 mb-2">
                                                        <strong>Columns:</strong> {table.columns.slice(0, 5).map(c => c.name).join(', ')}
                                                        {table.columns.length > 5 && ` +${table.columns.length - 5} more`}
                                                    </div>
                                                    <div className="text-sm text-slate-600">
                                                        <strong>Estimated Rows:</strong> {table.estimatedRows.toLocaleString()}
                                                    </div>
                                                    {isUsersTable && (
                                                        <div className="mt-2 text-xs bg-purple-50 border border-purple-200 rounded p-2 text-purple-800">
                                                            ⚠️ Migrates to <strong>AppUser</strong> entity only. Base44 Auth Users are not modified.
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {migrationStatus[table.tableName] && (
                                                        <Badge className={
                                                            migrationStatus[table.tableName].status === 'completed' ? 'bg-green-500' :
                                                            migrationStatus[table.tableName].status === 'failed' ? 'bg-red-500' :
                                                            migrationStatus[table.tableName].status === 'migrating' ? 'bg-blue-500' :
                                                            'bg-yellow-500'
                                                        }>
                                                            {migrationStatus[table.tableName].status}
                                                        </Badge>
                                                    )}
                                                    {isUsersTable ? (
                                                        <Button
                                                            onClick={() => handleHybridUsersMigration(table)}
                                                            disabled={migrationStatus[table.tableName]?.status === 'migrating'}
                                                            className="bg-purple-600 hover:bg-purple-700"
                                                        >
                                                            Run Hybrid Users Migration
                                                        </Button>
                                                    ) : (
                                                        <Button
                                                            onClick={() => handleAutoMigrate(table)}
                                                            disabled={migrationStatus[table.tableName]?.status === 'migrating'}
                                                            className="bg-[#B71C1C] hover:bg-[#8B0000]"
                                                        >
                                                            Auto-Migrate
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                    })}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Migration Progress Card */}
                {Object.keys(migrationStatus).length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Database className="w-5 h-5" />
                                Migration Progress
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {Object.entries(migrationStatus).map(([tableName, status]) => (
                                    <div key={tableName} className="border rounded-lg p-4 bg-white">
                                        <div className="flex items-center justify-between mb-2">
                                            <h3 className="font-semibold">{tableName}</h3>
                                            <div className="flex items-center gap-2">
                                                {status.status === 'completed' && <CheckCircle className="w-5 h-5 text-green-500" />}
                                                {status.status === 'failed' && <XCircle className="w-5 h-5 text-red-500" />}
                                                {status.status === 'migrating' && <Loader2 className="w-5 h-5 animate-spin text-blue-500" />}
                                                <Badge className={
                                                    status.status === 'completed' ? 'bg-green-500' :
                                                    status.status === 'failed' ? 'bg-red-500' :
                                                    status.status === 'migrating' ? 'bg-blue-500' :
                                                    'bg-yellow-500'
                                                }>
                                                    {status.status}
                                                </Badge>
                                            </div>
                                        </div>
                                        
                                        {status.status !== 'preparing' && (
                                            <>
                                                <Progress value={status.progress} className="mb-2" />
                                                <div className="text-sm text-slate-600 space-y-1">
                                                    <div className="flex justify-between">
                                                        <span>{status.migrated} / {status.total} rows migrated</span>
                                                        <span>{Math.round(status.progress)}%</span>
                                                    </div>
                                                    {status.skipped > 0 && (
                                                        <div className="text-amber-600">
                                                            {status.skipped} duplicates skipped
                                                        </div>
                                                    )}
                                                </div>
                                            </>
                                        )}

                                        {status.errors && status.errors.length > 0 && (
                                            <Alert className="mt-3 bg-red-50 border-red-200">
                                                <AlertCircle className="w-4 h-4 text-red-600" />
                                                <AlertDescription className="text-red-800">
                                                    {status.errors.length} errors occurred during migration.
                                                    <details className="mt-2">
                                                        <summary className="cursor-pointer">View errors</summary>
                                                        <ul className="mt-2 space-y-1 text-xs">
                                                            {status.errors.slice(0, 10).map((err, i) => (
                                                                <li key={i}>Row {err.row}: {err.error}</li>
                                                            ))}
                                                        </ul>
                                                    </details>
                                                </AlertDescription>
                                            </Alert>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>

            {showMappingDialog && currentTable && (
                <MappingDialog
                    isOpen={showMappingDialog}
                    onClose={() => setShowMappingDialog(false)}
                    table={currentTable}
                    onConfirm={handleMigrationConfirm}
                />
            )}
        </div>
    );
}