import React, { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { groupBy } from 'lodash';
import { Search, FileText } from 'lucide-react';

export default function TemplateList({ templates, isLoading, onSelectTemplate, selectedTemplate }) {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredTemplates = useMemo(() => {
        if (!searchTerm) return templates;
        return templates.filter(t => 
            t.template_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            t.template_key.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [templates, searchTerm]);

    const groupedTemplates = useMemo(() => {
        return groupBy(filteredTemplates, 'section');
    }, [filteredTemplates]);

    if (isLoading) return <p>Loading templates...</p>;

    return (
        <div className="space-y-4">
            <div className="relative">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input 
                    placeholder="Search templates..." 
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <div className="space-y-6 max-h-[60vh] overflow-y-auto">
                {Object.keys(groupedTemplates).sort().map(section => (
                    <div key={section}>
                        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2 capitalize">
                            {section.replace(/_/g, ' ')}
                        </h3>
                        <div className="space-y-1">
                            {groupedTemplates[section].map(template => (
                                <button
                                    key={template.id}
                                    onClick={() => onSelectTemplate(template)}
                                    className={`w-full text-left p-3 rounded-lg transition-colors ${selectedTemplate?.id === template.id ? 'bg-red-100 text-red-900' : 'hover:bg-slate-100'}`}
                                >
                                    <p className="font-medium text-sm flex items-center gap-2">
                                        <FileText className="w-4 h-4"/>
                                        {template.template_name}
                                    </p>
                                    <p className="text-xs text-slate-500 font-mono ml-6">{template.template_key}</p>
                                </button>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}