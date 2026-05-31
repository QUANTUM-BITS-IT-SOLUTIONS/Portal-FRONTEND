import { useState } from 'react';
import {
  Search,
  Filter,
  X,
  Calendar,
  User,
  IndianRupee,
  ChevronDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Label } from '@/components/ui/label';
import { format } from 'date-fns';

interface Profile {
  id: string;
  first_name: string;
  last_name: string;
}

interface PipelineFiltersProps {
  users: Profile[];
  onFiltersChange: (filters: PipelineFilters) => void;
  activeFiltersCount: number;
}

export interface PipelineFilters {
  search: string;
  partnerId: string;
  status: string;
  dateFrom: string;
  dateTo: string;
  dealValueMin: string;
  dealValueMax: string;
}

const statusOptions = [
  { value: 'all', label: 'All Statuses' },
  { value: 'lead_added', label: 'Lead Received' },
  { value: 'team_approval', label: 'Contacted' },
  { value: 'negotiating', label: 'Negotiating' },
  { value: 'payment_link', label: 'Deal Closed' },
  { value: 'client_pays', label: 'Payment Received' },
  { value: 'invoice', label: 'Invoice Sent' },
  { value: 'commission_approved', label: 'Commission Approved' },
  { value: 'commission_paid', label: 'Commission Paid' },
  { value: 'work_starts', label: 'Work Starts' },
];

const PipelineFilters = ({ users, onFiltersChange, activeFiltersCount }: PipelineFiltersProps) => {
  const [filters, setFilters] = useState<PipelineFilters>({
    search: '',
    partnerId: 'all',
    status: 'all',
    dateFrom: '',
    dateTo: '',
    dealValueMin: '',
    dealValueMax: '',
  });

  const [isOpen, setIsOpen] = useState(false);

  const handleFilterChange = (key: keyof PipelineFilters, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const clearFilters = () => {
    const clearedFilters: PipelineFilters = {
      search: '',
      partnerId: 'all',
      status: 'all',
      dateFrom: '',
      dateTo: '',
      dealValueMin: '',
      dealValueMax: '',
    };
    setFilters(clearedFilters);
    onFiltersChange(clearedFilters);
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row gap-2">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by client name, email, company..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Quick Status Filter */}
        <Select value={filters.status} onValueChange={(value) => handleFilterChange('status', value)}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            {statusOptions.map(option => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Advanced Filters */}
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              Filters
              {activeFiltersCount > 0 && (
                <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 flex items-center justify-center text-xs">
                  {activeFiltersCount}
                </Badge>
              )}
              <ChevronDown className="h-3 w-3" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80" align="end">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-sm">Advanced Filters</h4>
                <Button variant="ghost" size="sm" onClick={clearFilters} className="h-7 text-xs">
                  <X className="h-3 w-3 mr-1" />
                  Clear All
                </Button>
              </div>

              {/* Partner Filter */}
              <div className="space-y-2">
                <Label className="text-xs flex items-center gap-1">
                  <User className="h-3 w-3" />
                  Partner
                </Label>
                <Select value={filters.partnerId} onValueChange={(value) => handleFilterChange('partnerId', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Partners" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Partners</SelectItem>
                    {users.map(user => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.first_name} {user.last_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Date Range */}
              <div className="space-y-2">
                <Label className="text-xs flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Date Range
                </Label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Input
                      type="date"
                      placeholder="From"
                      value={filters.dateFrom}
                      onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                      className="text-xs"
                    />
                  </div>
                  <div>
                    <Input
                      type="date"
                      placeholder="To"
                      value={filters.dateTo}
                      onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                      className="text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Deal Value Range */}
              <div className="space-y-2">
                <Label className="text-xs flex items-center gap-1">
                  <IndianRupee className="h-3 w-3" />
                  Deal Value Range
                </Label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Input
                      type="number"
                      placeholder="Min ₹"
                      value={filters.dealValueMin}
                      onChange={(e) => handleFilterChange('dealValueMin', e.target.value)}
                      className="text-xs"
                    />
                  </div>
                  <div>
                    <Input
                      type="number"
                      placeholder="Max ₹"
                      value={filters.dealValueMax}
                      onChange={(e) => handleFilterChange('dealValueMax', e.target.value)}
                      className="text-xs"
                    />
                  </div>
                </div>
              </div>

              <Button className="w-full" onClick={() => setIsOpen(false)}>
                Apply Filters
              </Button>
            </div>
          </PopoverContent>
        </Popover>

        {/* Clear button when filters active */}
        {activeFiltersCount > 0 && (
          <Button variant="ghost" size="sm" onClick={clearFilters} className="hidden sm:flex">
            <X className="h-4 w-4 mr-1" />
            Clear
          </Button>
        )}
      </div>

      {/* Active Filters Display */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {filters.search && (
            <Badge variant="secondary" className="gap-1">
              Search: {filters.search}
              <X className="h-3 w-3 cursor-pointer" onClick={() => handleFilterChange('search', '')} />
            </Badge>
          )}
          {filters.status !== 'all' && (
            <Badge variant="secondary" className="gap-1">
              Status: {statusOptions.find(s => s.value === filters.status)?.label}
              <X className="h-3 w-3 cursor-pointer" onClick={() => handleFilterChange('status', 'all')} />
            </Badge>
          )}
          {filters.partnerId !== 'all' && (
            <Badge variant="secondary" className="gap-1">
              Partner: {users.find(u => u.id === filters.partnerId)?.first_name}
              <X className="h-3 w-3 cursor-pointer" onClick={() => handleFilterChange('partnerId', 'all')} />
            </Badge>
          )}
          {filters.dateFrom && (
            <Badge variant="secondary" className="gap-1">
              From: {filters.dateFrom}
              <X className="h-3 w-3 cursor-pointer" onClick={() => handleFilterChange('dateFrom', '')} />
            </Badge>
          )}
          {filters.dateTo && (
            <Badge variant="secondary" className="gap-1">
              To: {filters.dateTo}
              <X className="h-3 w-3 cursor-pointer" onClick={() => handleFilterChange('dateTo', '')} />
            </Badge>
          )}
          {filters.dealValueMin && (
            <Badge variant="secondary" className="gap-1">
              Min: ₹{filters.dealValueMin}
              <X className="h-3 w-3 cursor-pointer" onClick={() => handleFilterChange('dealValueMin', '')} />
            </Badge>
          )}
          {filters.dealValueMax && (
            <Badge variant="secondary" className="gap-1">
              Max: ₹{filters.dealValueMax}
              <X className="h-3 w-3 cursor-pointer" onClick={() => handleFilterChange('dealValueMax', '')} />
            </Badge>
          )}
        </div>
      )}
    </div>
  );
};

export default PipelineFilters;
