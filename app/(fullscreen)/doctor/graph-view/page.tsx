import type { Metadata } from 'next';
import { GraphViewContent } from './graph-view-content';

export const metadata: Metadata = {
    title: 'Graph View | Metis',
};

export default function GraphViewPage() {
    return <GraphViewContent />;
}
