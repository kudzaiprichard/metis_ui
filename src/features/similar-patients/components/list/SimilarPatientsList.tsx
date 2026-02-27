/**
 * SimilarPatientsList Component
 * Container for displaying similar patient cases in card or table view
 */

'use client';

import { SimilarPatientCase } from '../../api/similar-patients.types';
import { SimilarPatientCard } from './SimilarPatientCard';
import { SimilarPatientTableRow } from './SimilarPatientTableRow';

interface SimilarPatientsListProps {
    cases: SimilarPatientCase[];
    viewMode: 'cards' | 'table';
}

export function SimilarPatientsList({ cases, viewMode }: SimilarPatientsListProps) {
    return (
        <>
            <div className="list-container">
                {viewMode === 'cards' ? (
                    <div className="cases-grid">
                        {cases.map((case_) => (
                            <SimilarPatientCard key={case_.case_id} case={case_} />
                        ))}
                    </div>
                ) : (
                    <div className="cases-table">
                        <div className="table-header">
                            <div className="table-cell">Case ID</div>
                            <div className="table-cell">Similarity</div>
                            <div className="table-cell">Profile</div>
                            <div className="table-cell">Treatment</div>
                            <div className="table-cell">Outcome</div>
                            <div className="table-cell actions-header">Actions</div>
                        </div>

                        {cases.map((case_) => (
                            <SimilarPatientTableRow key={case_.case_id} case={case_} />
                        ))}
                    </div>
                )}
            </div>

            <style jsx>{`
                .list-container {
                    margin-bottom: 100px;
                }

                .cases-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
                    gap: 20px;
                }

                .cases-table {
                    overflow-x: auto;
                }

                .table-header {
                    display: grid;
                    grid-template-columns: 1.2fr 1fr 1.8fr 1.5fr 1.2fr 0.8fr;
                    gap: 16px;
                    padding: 14px 0;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
                    margin-bottom: 4px;
                    align-items: center;
                }

                .table-header .table-cell {
                    font-size: 12px;
                    color: rgba(255, 255, 255, 0.5);
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 0.8px;
                    display: flex;
                    align-items: center;
                }

                .table-header .actions-header {
                    justify-content: flex-end;
                }

                @media (max-width: 768px) {
                    .cases-grid {
                        grid-template-columns: 1fr;
                    }

                    .table-header {
                        display: none;
                    }
                }
            `}</style>
        </>
    );
}