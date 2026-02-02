import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle, XCircle, ArrowRight, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function MappingDialog({ isOpen, onClose, table, onConfirm }) {
    const [existingEntities, setExistingEntities] = useState([]);
    const [selectedEntity, setSelectedEntity] = useState(null);
    const [createNewEntity, setCreateNewEntity] = useState(true);
    const [entityName, setEntityName] = useState('');
    const [columnMapping, setColumnMapping] = useState({});
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (isOpen && table) {
            loadExistingEntities();
            initializeMapping();
        }
    }, [isOpen, table]);

    const loadExistingEntities = async () => {
        setIsLoading(true);
        try {
            // Get all entities by reading the entities directory
            // This is a workaround since there's no direct API to list entities
            const response = await fetch('/api/entities');
            if (response.ok) {
                const entities = await response.json();
                setExistingEntities(entities);
            }
        } catch (error) {
            console.error('Error loading entities:', error);
        }
        setIsLoading(false);
    };

    const initializeMapping = () => {
        const normalizedName = normalizeEntityName(table.tableName);
        setEntityName(normalizedName);

        const mapping = {};
        table.columns.forEach(col => {
            mapping[col.name] = {
                fieldName: col.name,
                sqlType: col.type,
                skip: col.name === 'id' || col.name === 'created_at' || col.name === 'updated_at'
            };
        });
        setColumnMapping(mapping);
    };

    const normalizeEntityName = (name) => {
        // Convert snake_case to PascalCase
        return name
            .split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join('');
    };

    const handleFieldNameChange = (sqlCol, newName) => {
        setColumnMapping(prev => ({
            ...prev,
            [sqlCol]: { ...prev[sqlCol], fieldName: newName }
        }));
    };

    const handleSkipToggle = (sqlCol) => {
        setColumnMapping(prev => ({
            ...prev,
            [sqlCol]: { ...prev[sqlCol], skip: !prev[sqlCol].skip }
        }));
    };

    const handleEntityModeChange = (isNew) => {
        setCreateNewEntity(isNew);
        if (!isNew && existingEntities.length > 0) {
            setSelectedEntity(existingEntities[0]);
        }
    };

    const handleConfirm = () => {
        const mappedCount = Object.values(columnMapping).filter(m => !m.skip).length;
        
        if (mappedCount === 0) {
            toast.error('At least one column must be mapped');
            return;
        }

        if (createNewEntity && !entityName.trim()) {
            toast.error('Entity name is required');
            return;
        }

        if (!createNewEntity && !selectedEntity) {
            toast.error('Please select an entity');
            return;
        }

        onConfirm({
            tableName: table.tableName,
            entityName: createNewEntity ? entityName : selectedEntity,
            columnMapping,
            createNewEntity
        });
    };

    const mappedColumns = Object.values(columnMapping).filter(m => !m.skip).length;
    const totalColumns = table.columns.length;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Review Migration Setup: {table.tableName}</DialogTitle>
                    <DialogDescription>
                        Configure how this SQL table will be migrated to Base44
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Entity Selection */}
                    <div className="border rounded-lg p-4 bg-slate-50">
                        <h3 className="font-semibold mb-4">Target Entity</h3>
                        
                        <div className="flex items-center gap-4 mb-4">
                            <div className="flex items-center gap-2">
                                <Switch
                                    checked={createNewEntity}
                                    onCheckedChange={handleEntityModeChange}
                                />
                                <Label>Create New Entity</Label>
                            </div>
                        </div>

                        {createNewEntity ? (
                            <div>
                                <Label htmlFor="entityName">New Entity Name</Label>
                                <div className="flex items-center gap-2 mt-2">
                                    <Input
                                        id="entityName"
                                        value={entityName}
                                        onChange={(e) => setEntityName(e.target.value)}
                                        placeholder="EntityName"
                                        className="flex-1"
                                    />
                                    <Badge className="bg-green-500">Auto-Created</Badge>
                                </div>
                                <p className="text-xs text-slate-500 mt-1">
                                    Entity will be automatically created before migration
                                </p>
                            </div>
                        ) : (
                            <div>
                                <Label htmlFor="existingEntity">Select Existing Entity</Label>
                                <Select
                                    value={selectedEntity}
                                    onValueChange={setSelectedEntity}
                                    disabled={existingEntities.length === 0}
                                >
                                    <SelectTrigger className="mt-2">
                                        <SelectValue placeholder="Choose entity..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {existingEntities.map(entity => (
                                            <SelectItem key={entity} value={entity}>
                                                {entity}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {existingEntities.length === 0 && (
                                    <p className="text-xs text-amber-600 mt-1">
                                        No existing entities found. Create a new one instead.
                                    </p>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Column Mapping */}
                    <div>
                        <h3 className="font-semibold mb-4">Column Mapping</h3>
                        <div className="border rounded-lg overflow-hidden">
                            <table className="w-full">
                                <thead className="bg-slate-100">
                                    <tr>
                                        <th className="px-4 py-2 text-left text-sm font-medium">SQL Column</th>
                                        <th className="px-4 py-2 text-left text-sm font-medium">Type</th>
                                        <th className="px-4 py-2 text-center text-sm font-medium">→</th>
                                        <th className="px-4 py-2 text-left text-sm font-medium">Base44 Field</th>
                                        <th className="px-4 py-2 text-left text-sm font-medium">Status</th>
                                        <th className="px-4 py-2 text-center text-sm font-medium">Skip</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {table.columns.map((col, index) => {
                                        const mapping = columnMapping[col.name] || {};
                                        return (
                                            <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                                                <td className="px-4 py-2 font-mono text-sm">{col.name}</td>
                                                <td className="px-4 py-2">
                                                    <Badge variant="outline" className="text-xs">
                                                        {col.type}
                                                    </Badge>
                                                </td>
                                                <td className="px-4 py-2 text-center">
                                                    <ArrowRight className="w-4 h-4 mx-auto text-slate-400" />
                                                </td>
                                                <td className="px-4 py-2">
                                                    {mapping.skip ? (
                                                        <span className="text-slate-400 italic">—</span>
                                                    ) : (
                                                        <Input
                                                            value={mapping.fieldName || ''}
                                                            onChange={(e) => handleFieldNameChange(col.name, e.target.value)}
                                                            className="h-8 text-sm"
                                                        />
                                                    )}
                                                </td>
                                                <td className="px-4 py-2">
                                                    {mapping.skip ? (
                                                        <Badge className="bg-yellow-500">
                                                            <XCircle className="w-3 h-3 mr-1" />
                                                            Skipped
                                                        </Badge>
                                                    ) : col.name === 'id' ? (
                                                        <Badge className="bg-blue-500">
                                                            <AlertCircle className="w-3 h-3 mr-1" />
                                                            Auto-ID
                                                        </Badge>
                                                    ) : (
                                                        <Badge className="bg-green-500">
                                                            <CheckCircle className="w-3 h-3 mr-1" />
                                                            Mapped
                                                        </Badge>
                                                    )}
                                                </td>
                                                <td className="px-4 py-2 text-center">
                                                    <Switch
                                                        checked={mapping.skip || false}
                                                        onCheckedChange={() => handleSkipToggle(col.name)}
                                                    />
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-4 text-sm text-slate-600">
                        <Badge variant="outline">
                            {mappedColumns} / {totalColumns} columns mapped
                        </Badge>
                        <Badge variant="outline">
                            {table.estimatedRows.toLocaleString()} rows to migrate
                        </Badge>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button 
                        onClick={handleConfirm}
                        className="bg-[#B71C1C] hover:bg-[#8B0000]"
                    >
                        {createNewEntity ? 'Create Entity & Migrate' : 'Confirm & Migrate'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}