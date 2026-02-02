import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Languages } from 'lucide-react';

export default function TemplatePreview({ contentEnglish, contentTamil }) {
  return (
    <Card className="bg-slate-50">
        <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
                <Languages className="w-5 h-5 text-slate-500"/>
                Content Preview
            </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
            <div>
                <h4 className="font-semibold text-sm text-slate-700 mb-1">English</h4>
                <p className="p-3 bg-white rounded-md border text-sm">{contentEnglish || "..."}</p>
            </div>
            <div>
                <h4 className="font-semibold text-sm text-slate-700 mb-1">Tamil</h4>
                <p className="p-3 bg-white rounded-md border text-sm">{contentTamil || "..."}</p>
            </div>
        </CardContent>
    </Card>
  )
}