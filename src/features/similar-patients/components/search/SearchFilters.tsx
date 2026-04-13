'use client';

import { Button } from '@/src/components/shadcn/button';
import { Input } from '@/src/components/shadcn/input';
import { Label } from '@/src/components/shadcn/label';
import { Slider } from '@/src/components/shadcn/slider';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/src/components/shadcn/select';
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/src/components/shadcn/dropdown-menu';
import { ChevronDown, ClipboardList, List, Loader2, Pill, RotateCw, Search, SlidersHorizontal, User } from 'lucide-react';

interface SearchFiltersProps {
    patientId: string;
    onPatientIdChange: (value: string) => void;
    medicalDataId: string;
    onMedicalDataIdChange: (value: string) => void;
    limit: number;
    onLimitChange: (value: number) => void;
    /** Selected drug names. Empty array means "all treatments". */
    treatmentFilter: string[];
    onTreatmentFilterChange: (value: string[]) => void;
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

    // Must mirror the drug names the data generator + Neo4j loader actually
    // ship (playground/data_generator.py: self.treatments). Adding an option
    // here that doesn't exist in Neo4j silently returns an empty cohort.
    const treatments = ['Metformin', 'GLP-1', 'SGLT-2', 'DPP-4', 'Insulin'];

    const toggleTreatment = (drug: string) => {
        if (treatmentFilter.includes(drug)) {
            onTreatmentFilterChange(treatmentFilter.filter(t => t !== drug));
        } else {
            onTreatmentFilterChange([...treatmentFilter, drug]);
        }
    };

    // Trigger label: "All treatments" when empty, the drug name when one
    // selected, "N treatments" when many.
    const triggerLabel =
        treatmentFilter.length === 0
            ? 'All treatments'
            : treatmentFilter.length === 1
            ? treatmentFilter[0]
            : `${treatmentFilter.length} treatments`;

    return (
        <div className="border border-primary/20 rounded-lg p-4 mb-5">
            {/* Row 1: Patient ID & Medical Data ID */}
            <div className="grid grid-cols-2 gap-3 mb-3">
                {/* Patient ID */}
                <div className="flex flex-col gap-1.5">
                    <Label className="text-xs font-semibold text-primary/80 uppercase tracking-wider flex items-center gap-1.5">
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
                        className="rounded-lg h-9 border-primary/20 bg-transparent text-sm placeholder:text-muted-foreground/30 focus:border-primary/50 disabled:opacity-40"
                    />
                </div>

                {/* Medical Data ID */}
                <div className="flex flex-col gap-1.5">
                    <Label className="text-xs font-semibold text-primary/80 uppercase tracking-wider flex items-center gap-1.5">
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
                        className="rounded-lg h-9 border-primary/20 bg-transparent text-sm placeholder:text-muted-foreground/30 focus:border-primary/50"
                    />
                </div>
            </div>

            {/* Row 2: Other filters & actions */}
            <div className="grid grid-cols-[1fr_1.5fr_2fr_auto] gap-3 items-end">
                {/* Results Limit */}
                <div className="flex flex-col gap-1.5">
                    <Label className="text-xs font-semibold text-primary/80 uppercase tracking-wider flex items-center gap-1.5">
                        <List className="h-2.5 w-2.5 opacity-70" />
                        Results
                    </Label>
                    <Select value={String(limit)} onValueChange={(v) => onLimitChange(Number(v))}>
                        <SelectTrigger className="rounded-lg h-9 border-primary/20 bg-transparent text-sm">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="rounded-lg border-white/10 bg-card">
                            {[5, 10, 15, 20].map((n) => (
                                <SelectItem key={n} value={String(n)}>{n} cases</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Treatment Filter — multi-select */}
                <div className="flex flex-col gap-1.5">
                    <Label className="text-xs font-semibold text-primary/80 uppercase tracking-wider flex items-center gap-1.5">
                        <Pill className="h-2.5 w-2.5 opacity-70" />
                        Treatment
                    </Label>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                type="button"
                                variant="outline"
                                className="justify-between rounded-lg h-9 border-primary/20 bg-transparent text-sm font-normal hover:bg-white/[0.04] hover:text-foreground px-3"
                            >
                                <span className={treatmentFilter.length === 0 ? 'text-muted-foreground/70' : ''}>
                                    {triggerLabel}
                                </span>
                                <ChevronDown className="h-3.5 w-3.5 opacity-60" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                            align="start"
                            className="rounded-lg border-white/10 bg-card min-w-[var(--radix-dropdown-menu-trigger-width)]"
                        >
                            <DropdownMenuLabel className="text-xs text-muted-foreground/70">
                                Pick one or more treatments
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator className="bg-white/10" />
                            {treatments.map((t) => (
                                <DropdownMenuCheckboxItem
                                    key={t}
                                    checked={treatmentFilter.includes(t)}
                                    onCheckedChange={() => toggleTreatment(t)}
                                    onSelect={(e) => e.preventDefault()}
                                >
                                    {t}
                                </DropdownMenuCheckboxItem>
                            ))}
                            {treatmentFilter.length > 0 && (
                                <>
                                    <DropdownMenuSeparator className="bg-white/10" />
                                    <button
                                        type="button"
                                        onClick={() => onTreatmentFilterChange([])}
                                        className="w-full text-left px-2 py-1.5 text-xs text-muted-foreground/80 hover:bg-white/[0.04] rounded-sm"
                                    >
                                        Clear selection
                                    </button>
                                </>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                {/* Similarity Slider */}
                <div className="flex flex-col gap-1.5">
                    <Label className="text-xs font-semibold text-primary/80 uppercase tracking-wider flex items-center gap-1.5">
                        <SlidersHorizontal className="h-2.5 w-2.5 opacity-70" />
                        Similarity
                        <span className="text-primary font-bold ml-auto">{(minSimilarity * 100).toFixed(0)}%</span>
                    </Label>
                    <Slider
                        min={0}
                        max={1}
                        step={0.05}
                        value={[minSimilarity]}
                        onValueChange={(values) => onMinSimilarityChange(values[0])}
                        className="h-9 py-2"
                    />
                </div>

                {/* Actions */}
                <div className="flex gap-2 items-center">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onReset}
                        disabled={isLoading}
                        className="h-9 w-9 rounded-lg border border-white/15 bg-transparent text-muted-foreground/70 hover:bg-white/[0.05] hover:text-foreground disabled:opacity-40"
                    >
                        <RotateCw className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                        onClick={onSearch}
                        disabled={disabled || isLoading}
                        className="rounded-lg h-9 px-4 bg-primary hover:bg-primary/80 text-primary-foreground text-sm font-semibold disabled:opacity-40"
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