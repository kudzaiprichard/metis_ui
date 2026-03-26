import type { Metadata } from 'next';
import { SimilarPatientsContent } from './similar-patients-content';

export const metadata: Metadata = {
    title: 'Similar Patients | Metis',
};

export default function SimilarPatientsPage() {
    return <SimilarPatientsContent />;
}
