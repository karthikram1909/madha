import React from "react";
import { CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Filter } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function UserFilters({ filters, setFilters }) {
  const handleFilterChange = (type, value) => {
    setFilters(prev => ({ ...prev, [type]: value }));
  };

  const getActiveFiltersCount = () => {
    return Object.values(filters).filter(value => value !== 'all').length;
  };

  return (
    <CardContent className="px-6 py-4 border-b border-slate-100 bg-slate-50">
      <div className="flex flex-wrap gap-4 items-center">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-500" />
          <span className="text-sm font-medium text-slate-700">Filters:</span>
          {getActiveFiltersCount() > 0 && (
            <Badge variant="secondary" className="text-xs">
              {getActiveFiltersCount()} active
            </Badge>
          )}
        </div>

        <Select 
          value={filters.role} 
          onValueChange={(value) => handleFilterChange("role", value)}
        >
          <SelectTrigger className="w-32 bg-white">
            <SelectValue placeholder="Role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="moderator">Moderator</SelectItem>
            <SelectItem value="user">User</SelectItem>
          </SelectContent>
        </Select>

        <Select 
          value={filters.status} 
          onValueChange={(value) => handleFilterChange("status", value)}
        >
          <SelectTrigger className="w-32 bg-white">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>

        {getActiveFiltersCount() > 0 && (
          <button 
            onClick={() => setFilters({ role: 'all', status: 'all' })}
            className="text-xs text-red-600 hover:text-red-700 font-medium"
          >
            Clear all
          </button>
        )}
      </div>
    </CardContent>
  );
}