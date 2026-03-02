'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/src/components/shadcn/card';
import { PatientDetail, PatientMedicalData } from '../../../api/patients.types';
import { MedicalRecordCard } from '../cards/MedicalRecordCard';
import { MedicalRecordDetail } from './MedicalRecordDetail';
import { EditMedicalRecordModal } from '../modals/EditMedicalRecordModal';
import { DeleteMedicalRecordDialog } from '../modals/DeleteMedicalRecordDialog';
import { FolderOpen } from 'lucide-react';

interface MedicalRecordsListProps {
    patient: PatientDetail;
}

export function MedicalRecordsList({ patient }: MedicalRecordsListProps) {
    const [selectedRecord, setSelectedRecord] = useState<PatientMedicalData | null>(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);

    const records = patient.medical_records;

    const handleView = (record: PatientMedicalData) => {
        setSelectedRecord(record);
        setIsDetailOpen(true);
    };

    const handleEdit = (record: PatientMedicalData) => {
        setSelectedRecord(record);
        setIsEditOpen(true);
    };

    const handleDelete = (record: PatientMedicalData) => {
        setSelectedRecord(record);
        setIsDeleteOpen(true);
    };

    return (
        <>
            <Card className="border-white/10 bg-card/30 backdrop-blur-sm rounded-none overflow-hidden p-0">
                {/* Section Header */}
                <div className="flex justify-between items-center px-5 py-4 border-b border-white/5">
                    <div className="flex items-center gap-3">
                        <FolderOpen className="h-4 w-4 text-primary" />
                        <div>
                            <h2 className="text-[15px] font-semibold text-foreground mb-0.5">
                                Medical Records
                            </h2>
                            <p className="text-[12px] text-muted-foreground">
                                {records.length} visit{records.length !== 1 ? 's' : ''} recorded
                            </p>
                        </div>
                    </div>
                </div>

                {/* Records */}
                {records.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                        <div className="w-16 h-16 rounded-none bg-white/[0.04] border border-white/[0.08] flex items-center justify-center mb-4">
                            <FolderOpen className="h-7 w-7 text-muted-foreground/30" />
                        </div>
                        <h3 className="text-[16px] font-semibold text-foreground/70 mb-1.5">
                            No medical records yet
                        </h3>
                        <p className="text-[13px] text-muted-foreground/50">
                            Add the first visit record using the + button below.
                        </p>
                    </div>
                ) : (
                    <CardContent className="p-5">
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                            {records.map((record, i) => (
                                <MedicalRecordCard
                                    key={record.id}
                                    record={record}
                                    index={records.length - i}
                                    onView={() => handleView(record)}
                                    onEdit={() => handleEdit(record)}
                                    onDelete={() => handleDelete(record)}
                                />
                            ))}
                        </div>
                    </CardContent>
                )}
            </Card>

            {/* Detail Sheet */}
            <MedicalRecordDetail
                isOpen={isDetailOpen}
                onClose={() => setIsDetailOpen(false)}
                record={selectedRecord}
                onEdit={() => { setIsDetailOpen(false); setIsEditOpen(true); }}
                onDelete={() => { setIsDetailOpen(false); setIsDeleteOpen(true); }}
            />

            {/* Edit Modal */}
            <EditMedicalRecordModal
                isOpen={isEditOpen}
                onClose={() => setIsEditOpen(false)}
                record={selectedRecord}
                patientId={patient.id}
            />

            {/* Delete Dialog */}
            <DeleteMedicalRecordDialog
                isOpen={isDeleteOpen}
                onClose={() => setIsDeleteOpen(false)}
                record={selectedRecord}
                patientId={patient.id}
            />
        </>
    );
}