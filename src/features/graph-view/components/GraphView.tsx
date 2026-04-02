'use client';

import { useEffect, useMemo, useState } from 'react';
import type { GraphViewData } from '../lib/adapters';
import { TOKENS } from '../lib/tokens';
import type { LayoutType, OutcomeFilter, Patient, SelectedNode, TopNFilter } from '../lib/types';
import { ContextStrip } from './ContextStrip';
import { FilterDock } from './FilterDock';
import { FloatingLegend } from './FloatingLegend';
import { GraphCanvas } from './GraphCanvas';
import { GraphControls } from './GraphControls';
import { HintsPopover } from './HintsPopover';
import { NodeInspector } from './NodeInspector';
import { OutcomeRollupCard } from './OutcomeRollupCard';

interface GraphViewProps {
    data: GraphViewData;
    loading?: boolean;
    /** Optional. When provided, the context strip renders a back button. */
    onBack?: () => void;
}

export function GraphView({ data, loading = false, onBack }: GraphViewProps) {
    const [layout, setLayout] = useState<LayoutType>('tree');
    const [outcomeFilter, setOutcomeFilter] = useState<OutcomeFilter>('all');
    const [topN, setTopN] = useState<TopNFilter>('all');
    const [zoom, setZoom] = useState(1);
    // Pan offset in screen pixels. Lives alongside zoom so "Fit to view" and
    // the `0` shortcut can reset both viewport states atomically.
    const [pan, setPan] = useState({ x: 0, y: 0 });
    // Selection is tracked by id only and resolved against the current data
    // every render. If the underlying patient/treatment disappears (e.g. new
    // search), the inspector silently closes — no stale-selection effect.
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [hintsOpen, setHintsOpen] = useState(false);
    const [rollupOpen, setRollupOpen] = useState(true);

    const fitToView = () => {
        setZoom(1);
        setPan({ x: 0, y: 0 });
    };

    const stats = useMemo(() => {
        return {
            total: data.patients.length,
            success: data.patients.filter(p => p.out === 'success').length,
            partial: data.patients.filter(p => p.out === 'partial').length,
            failure: data.patients.filter(p => p.out === 'failure').length,
        };
    }, [data.patients]);

    const selected: SelectedNode | null = useMemo(() => {
        if (!selectedId) return null;
        const patient = data.patients.find(p => p.id === selectedId);
        if (patient) return { kind: 'patient', ...patient };
        const treatment = data.treatments.find(t => t.id === selectedId);
        if (treatment) {
            const txPatients = data.patients.filter(p => p.tx === treatment.id);
            const rate =
                txPatients.length === 0
                    ? 0
                    : txPatients.filter(p => p.out === 'success').length / txPatients.length;
            return { kind: 'treatment', ...treatment, patients: txPatients, rate };
        }
        return null;
    }, [selectedId, data.patients, data.treatments]);

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
            switch (e.key) {
                case 'Escape':
                    setSelectedId(null);
                    break;
                case '1':
                    setLayout('force');
                    break;
                case '2':
                    setLayout('tree');
                    break;
                case '3':
                    setLayout('cluster');
                    break;
                case '4':
                    setLayout('outcome');
                    break;
                case '0':
                    fitToView();
                    break;
                case '+':
                case '=':
                    setZoom(z => Math.min(2.5, z + 0.15));
                    break;
                case '-':
                    setZoom(z => Math.max(0.4, z - 0.15));
                    break;
            }
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, []);

    const handleSelectPatient = (p: Patient) => {
        setSelectedId(p.id);
    };

    return (
        <div
            style={{
                height: '100vh',
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                background: TOKENS.bg,
                overflow: 'hidden',
                color: TOKENS.text,
                fontFamily: TOKENS.fontSans,
            }}
        >
            <ContextStrip
                queryPatient={data.queryPatient}
                filtersApplied={data.filtersApplied}
                similarityRange={data.similarityRange}
                resultCount={data.resultCount}
                loading={loading}
                onBack={onBack}
            />

            <GraphControls
                layout={layout}
                onLayoutChange={setLayout}
                zoom={zoom}
                onZoomChange={setZoom}
                onFit={fitToView}
                stats={stats}
                hintsOpen={hintsOpen}
                onHintsToggle={() => setHintsOpen(o => !o)}
            />

            <div style={{ flex: 1, display: 'flex', minHeight: 0 }}>
                <div style={{ flex: 1, position: 'relative', minHeight: 0, display: 'flex' }}>
                    <GraphCanvas
                        patients={data.patients}
                        treatments={data.treatments}
                        layout={layout}
                        outcomeFilter={outcomeFilter}
                        topN={topN}
                        zoom={zoom}
                        onZoomChange={setZoom}
                        pan={pan}
                        onPanChange={setPan}
                        selected={selected}
                        onSelect={node => setSelectedId(node?.id ?? null)}
                    />

                    <FloatingLegend />
                    <OutcomeRollupCard
                        patients={data.patients}
                        treatments={data.treatments}
                        open={rollupOpen}
                        onToggle={() => setRollupOpen(o => !o)}
                    />
                    <FilterDock
                        outcomeFilter={outcomeFilter}
                        onOutcomeChange={setOutcomeFilter}
                        topN={topN}
                        onTopNChange={setTopN}
                    />
                    <HintsPopover open={hintsOpen} onClose={() => setHintsOpen(false)} />
                </div>

                <NodeInspector
                    node={selected}
                    layout={layout}
                    treatments={data.treatments}
                    queryPatient={data.queryPatient}
                    queryVitals={data.queryVitals}
                    onClose={() => setSelectedId(null)}
                    onSelectPatient={handleSelectPatient}
                />
            </div>
        </div>
    );
}
