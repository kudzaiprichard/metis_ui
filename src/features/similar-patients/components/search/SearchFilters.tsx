'use client';

import { Button } from '@/src/components/shadcn/button';
import { Input } from '@/src/components/shadcn/input';
import { Label } from '@/src/components/shadcn/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/src/components/shadcn/select';
import { User, List, Pill, SlidersHorizontal, RotateCw, Search, Loader2, ClipboardList } from 'lucide-react';

interface SearchFiltersProps {
    patientId: string;
    onPatientIdChange: (value: string) => void;
    medicalDataId: string;
    onMedicalDataIdChange: (value: string) => void;
    limit: number;
    onLimitChange: (value: number) => void;
    treatmentFilter: string;
    onTreatmentFilterChange: (value: string) => void;
    minSimilarity: number;
    onMinSimilarityChange: (value: number) => void;
    onSearch: () => void;
    onReset: () => void;
    isLoading: boolean;
    disabled: boolean;
}

export function SearchFilters({
                                  patientId,
                                  onPatientIdChange,
                                  medicalDataId,
                                  onMedicalDataIdChange,
                                  limit,
                                  onLimitChange,
                                  treatmentFilter,
                                  onTreatmentFilterChange,
                                  minSimilarity,
                                  onMinSimilarityChange,
                                  onSearch,
                                  onReset,
                                  isLoading,
                                  disabled,
                              }: SearchFiltersProps) {
    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !disabled) onSearch();
    };

    const treatments = [
        'All Treatments', 'Metformin', 'GLP-1', 'SGLT-2', 'DPP-4', 'Insulin', 'Sulfonylureas', 'TZDs',
    ];

    return (
        <div className="border border-primary/20 rounded-none p-4 mb-5">
            {/* Row 1: Patient ID & Medical Data ID */}
            <div className="grid grid-cols-2 gap-3 mb-3">
                {/* Patient ID */}
                <div className="flex flex-col gap-1.5">
                    <Label className="text-[10px] font-semibold text-primary/80 uppercase tracking-wider flex items-center gap-1.5">
                        <User className="h-2.5 w-2.5 opacity-70" />
                        Patient ID
                    </Label>
                    <Input
                        type="text"
                        placeholder="Enter patient ID..."
                        value={patientId}
                        onChange={(e) => onPatientIdChange(e.target.value)}
                        onKeyDown={handleKeyPress}
                        disabled={!!medicalDataId.trim()}
                        className="rounded-none h-9 border-primary/20 bg-transparent text-[12px] placeholder:text-muted-foreground/30 focus:border-primary/50 disabled:opacity-40"
                    />
                </div>

                {/* Medical Data ID */}
                <div className="flex flex-col gap-1.5">
                    <Label className="text-[10px] font-semibold text-primary/80 uppercase tracking-wider flex items-center gap-1.5">
                        <ClipboardList className="h-2.5 w-2.5 opacity-70" />
                        Medical Record ID
                        <span className="text-muted-foreground/40 normal-case tracking-normal font-normal ml-1">(takes priority)</span>
                    </Label>
                    <Input
                        type="text"
                        placeholder="Enter medical record ID..."
                        value={medicalDataId}
                        onChange={(e) => onMedicalDataIdChange(e.target.value)}
                        onKeyDown={handleKeyPress}
                        className="rounded-none h-9 border-primary/20 bg-transparent text-[12px] placeholder:text-muted-foreground/30 focus:border-primary/50"
                    />
                </div>
            </div>

            {/* Row 2: Other filters & actions */}
            <div className="grid grid-cols-[1fr_1.5fr_2fr_auto] gap-3 items-end">
                {/* Results Limit */}
                <div className="flex flex-col gap-1.5">
                    <Label className="text-[10px] font-semibold text-primary/80 uppercase tracking-wider flex items-center gap-1.5">
                        <List className="h-2.5 w-2.5 opacity-70" />
                        Results
                    </Label>
                    <Select value={String(limit)} onValueChange={(v) => onLimitChange(Number(v))}>
                        <SelectTrigger className="rounded-none h-9 border-primary/20 bg-transparent text-[12px]">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="rounded-none border-white/10 bg-card">
                            {[5, 10, 15, 20].map((n) => (
                                <SelectItem key={n} value={String(n)}>{n} cases</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Treatment Filter */}
                <div className="flex flex-col gap-1.5">
                    <Label className="text-[10px] font-semibold text-primary/80 uppercase tracking-wider flex items-center gap-1.5">
                        <Pill className="h-2.5 w-2.5 opacity-70" />
                        Treatment
                    </Label>
                    <Select
                        value={treatmentFilter || 'All Treatments'}
                        onValueChange={(v) => onTreatmentFilterChange(v === 'All Treatments' ? '' : v)}
                    >
                        <SelectTrigger className="rounded-none h-9 border-primary/20 bg-transparent text-[12px]">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="rounded-none border-white/10 bg-card">
                            {treatments.map((t) => (
                                <SelectItem key={t} value={t}>{t}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Similarity Slider */}
                <div className="flex flex-col gap-1.5">
                    <Label className="text-[10px] font-semibold text-primary/80 uppercase tracking-wider flex items-center gap-1.5">
                        <SlidersHorizontal className="h-2.5 w-2.5 opacity-70" />
                        Similarity
                        <span className="text-primary font-bold ml-auto">{(minSimilarity * 100).toFixed(0)}%</span>
                    </Label>
                    <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.05"
                        value={minSimilarity}
                        onChange={(e) => onMinSimilarityChange(Number(e.target.value))}
                        className="w-full h-[5px] rounded-none bg-primary/20 appearance-none cursor-pointer accent-primary [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-background [&::-webkit-slider-thumb]:shadow-md"
                    />
                </div>

                {/* Actions */}
                <div className="flex gap-2 items-center">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onReset}
                        disabled={isLoading}
                        className="h-9 w-9 rounded-none border border-white/15 bg-transparent text-muted-foreground/70 hover:bg-white/[0.05] hover:text-foreground disabled:opacity-40"
                    >
                        <RotateCw className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                        onClick={onSearch}
                        disabled={disabled || isLoading}
                        className="rounded-none h-9 px-4 bg-primary hover:bg-primary/80 text-primary-foreground text-[12px] font-semibold disabled:opacity-40"
                    >
                        {isLoading ? (
                            <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                        ) : (
                            <Search className="h-3.5 w-3.5 mr-1.5" />
                        )}
                        Search
                    </Button>
                </div>
            </div>
        </div>
    );
}