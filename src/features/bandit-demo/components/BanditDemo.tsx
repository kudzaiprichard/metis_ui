'use client';

import Link from 'next/link';
import { Brain, History } from 'lucide-react';

import { Button } from '@/src/components/shadcn/button';

import { useSimulationStream } from '../hooks/useSimulationStream';
import { BanditSimulation } from './BanditSimulation';
import { DatasetUploader } from './DatasetUploader';

export function BanditDemo() {
    const simulation = useSimulationStream();

    return (
        <div className="pb-24">
            {/* Header */}
            <div className="mb-6 flex items-start justify-between gap-4 flex-wrap">
                <div>
                    <h1 className="text-2xl font-bold text-foreground tracking-tight flex items-center gap-3">
                        <Brain className="h-7 w-7 text-primary" />
                        NeuralThompson Bandit Simulation
                    </h1>
                    <p className="text-base text-muted-foreground/50 mt-1">
                        Watch how the NeuralThompson bandit learns which diabetes treatment works best for each patient in real time
                    </p>
                </div>
                <Link href="/ml-engineer/bandit-demo/history">
                    <Button
                        variant="ghost"
                        className="rounded-lg h-9 px-4 text-base font-semibold border border-white/10 bg-white/[0.04] text-muted-foreground hover:bg-white/[0.08] hover:text-foreground"
                    >
                        <History className="h-3.5 w-3.5 mr-2" />
                        History
                    </Button>
                </Link>
            </div>

            <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mb-6" />

            <DatasetUploader
                status={simulation.status}
                error={simulation.error}
                csvErrors={simulation.csvErrors}
                onUpload={simulation.upload}
                onReset={simulation.reset}
                totalSteps={simulation.totalSteps}
            />

            {simulation.status !== 'idle' &&
                simulation.status !== 'uploading' && (
                    <BanditSimulation simulation={simulation} />
                )}
        </div>
    );
}
