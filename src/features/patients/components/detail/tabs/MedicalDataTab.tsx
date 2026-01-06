/**
 * MedicalDataTab Component
 * Create and edit patient medical data (always in edit mode)
 */

'use client';

import { useState, FormEvent, useEffect } from 'react';
import { PatientDetail } from '../../../api/patients.types';
import {
    useCreatePatientMedicalData,
    useUpdatePatientMedicalData
} from '../../../hooks/usePatients';
import { useToast } from '@/src/components/shared/ui/toast';
import { ApiError } from '@/src/lib/types';

interface MedicalDataTabProps {
    patient: PatientDetail;
}

type GenderType = 'Male' | 'Female';
type EthnicityType = 'Caucasian' | 'African' | 'Asian' | 'Hispanic' | 'Other';

export function MedicalDataTab({ patient }: MedicalDataTabProps) {
    const hasMedicalData = !!patient.medical_data;
    const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

    const getInitialFormData = () => ({
        // Demographics
        age: patient.medical_data?.age || 0,
        gender: (patient.medical_data?.gender || 'Male') as GenderType,
        ethnicity: (patient.medical_data?.ethnicity || 'Caucasian') as EthnicityType,

        // Diabetes Profile
        hba1c_baseline: patient.medical_data?.hba1c_baseline || '',
        diabetes_duration: patient.medical_data?.diabetes_duration || '',
        fasting_glucose: patient.medical_data?.fasting_glucose || '',
        c_peptide: patient.medical_data?.c_peptide || '',

        // Metabolic & Cardiovascular
        egfr: patient.medical_data?.egfr || '',
        bmi: patient.medical_data?.bmi || '',
        bp_systolic: patient.medical_data?.bp_systolic || 0,
        bp_diastolic: patient.medical_data?.bp_diastolic || 0,

        // Liver & Lipid Profile
        alt: patient.medical_data?.alt || '',
        ldl: patient.medical_data?.ldl || '',
        hdl: patient.medical_data?.hdl || '',
        triglycerides: patient.medical_data?.triglycerides || '',

        // Medical History
        previous_prediabetes: patient.medical_data?.previous_prediabetes || false,
        hypertension: patient.medical_data?.hypertension || false,
        ckd: patient.medical_data?.ckd || false,
        cvd: patient.medical_data?.cvd || false,
        nafld: patient.medical_data?.nafld || false,
        retinopathy: patient.medical_data?.retinopathy || false,
    });

    const [formData, setFormData] = useState(getInitialFormData());

    const createMedicalData = useCreatePatientMedicalData();
    const updateMedicalData = useUpdatePatientMedicalData();
    const { showToast } = useToast();

    // Update form when patient data changes
    useEffect(() => {
        if (patient.medical_data) {
            const newFormData = {
                age: patient.medical_data.age,
                gender: patient.medical_data.gender as GenderType,
                ethnicity: patient.medical_data.ethnicity as EthnicityType,
                hba1c_baseline: patient.medical_data.hba1c_baseline,
                diabetes_duration: patient.medical_data.diabetes_duration,
                fasting_glucose: patient.medical_data.fasting_glucose,
                c_peptide: patient.medical_data.c_peptide,
                egfr: patient.medical_data.egfr,
                bmi: patient.medical_data.bmi,
                bp_systolic: patient.medical_data.bp_systolic,
                bp_diastolic: patient.medical_data.bp_diastolic,
                alt: patient.medical_data.alt,
                ldl: patient.medical_data.ldl,
                hdl: patient.medical_data.hdl,
                triglycerides: patient.medical_data.triglycerides,
                previous_prediabetes: patient.medical_data.previous_prediabetes,
                hypertension: patient.medical_data.hypertension,
                ckd: patient.medical_data.ckd,
                cvd: patient.medical_data.cvd,
                nafld: patient.medical_data.nafld,
                retinopathy: patient.medical_data.retinopathy,
            };

            setFormData(prevData => {
                if (JSON.stringify(prevData) !== JSON.stringify(newFormData)) {
                    return newFormData;
                }
                return prevData;
            });
        }
    }, [patient.medical_data]);

    const handleChange = (field: string, value: string | number | boolean) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        if (fieldErrors[field]) {
            setFieldErrors((prev) => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        }
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        setFieldErrors({});

        const submitData = {
            age: Number(formData.age),
            gender: formData.gender,
            ethnicity: formData.ethnicity,
            hba1c_baseline: Number(formData.hba1c_baseline),
            diabetes_duration: Number(formData.diabetes_duration),
            fasting_glucose: Number(formData.fasting_glucose),
            c_peptide: Number(formData.c_peptide),
            egfr: Number(formData.egfr),
            bmi: Number(formData.bmi),
            bp_systolic: Number(formData.bp_systolic),
            bp_diastolic: Number(formData.bp_diastolic),
            alt: Number(formData.alt),
            ldl: Number(formData.ldl),
            hdl: Number(formData.hdl),
            triglycerides: Number(formData.triglycerides),
            previous_prediabetes: formData.previous_prediabetes,
            hypertension: formData.hypertension,
            ckd: formData.ckd,
            cvd: formData.cvd,
            nafld: formData.nafld,
            retinopathy: formData.retinopathy,
        };

        if (hasMedicalData) {
            updateMedicalData.mutate(
                { patientId: patient.id, data: submitData },
                {
                    onSuccess: () => {
                        showToast(
                            'Medical Data Updated',
                            'Patient medical data has been updated successfully',
                            'success'
                        );
                    },
                    onError: (error: ApiError) => {
                        if (error.hasFieldErrors()) {
                            setFieldErrors(error.fieldErrors || {});
                        }
                        showToast('Update Failed', error.getMessage(), 'error');
                    },
                }
            );
        } else {
            createMedicalData.mutate(
                { ...submitData, patient_id: patient.id },
                {
                    onSuccess: () => {
                        showToast(
                            'Medical Data Created',
                            'Patient medical data has been created successfully',
                            'success'
                        );
                    },
                    onError: (error: ApiError) => {
                        if (error.hasFieldErrors()) {
                            setFieldErrors(error.fieldErrors || {});
                        }
                        showToast('Creation Failed', error.getMessage(), 'error');
                    },
                }
            );
        }
    };

    const isPending = createMedicalData.isPending || updateMedicalData.isPending;

    return (
        <>
            <form onSubmit={handleSubmit}>
                {/* Demographics Section */}
                <div className="section-card">
                    <div className="form-section">
                        <h3 className="form-section-title">Demographics</h3>
                        <div className="form-grid">
                            <div className="form-group">
                                <label className="form-label">Age (years) *</label>
                                <input
                                    type="number"
                                    className={`form-input ${fieldErrors.age ? 'error' : ''}`}
                                    value={formData.age}
                                    onChange={(e) => handleChange('age', e.target.value)}
                                    min="18"
                                    max="120"
                                    required
                                />
                                {fieldErrors.age && (
                                    <p className="error-text">{fieldErrors.age[0]}</p>
                                )}
                            </div>

                            <div className="form-group">
                                <label className="form-label">Gender *</label>
                                <select
                                    className={`form-input ${fieldErrors.gender ? 'error' : ''}`}
                                    value={formData.gender}
                                    onChange={(e) => handleChange('gender', e.target.value as GenderType)}
                                    required
                                >
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                </select>
                                {fieldErrors.gender && (
                                    <p className="error-text">{fieldErrors.gender[0]}</p>
                                )}
                            </div>

                            <div className="form-group full-width">
                                <label className="form-label">Ethnicity *</label>
                                <select
                                    className={`form-input ${fieldErrors.ethnicity ? 'error' : ''}`}
                                    value={formData.ethnicity}
                                    onChange={(e) => handleChange('ethnicity', e.target.value as EthnicityType)}
                                    required
                                >
                                    <option value="Caucasian">Caucasian</option>
                                    <option value="African">African</option>
                                    <option value="Asian">Asian</option>
                                    <option value="Hispanic">Hispanic</option>
                                    <option value="Other">Other</option>
                                </select>
                                {fieldErrors.ethnicity && (
                                    <p className="error-text">{fieldErrors.ethnicity[0]}</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Diabetes Profile Section */}
                <div className="section-card">
                    <div className="form-section">
                        <h3 className="form-section-title">Diabetes Profile</h3>
                        <div className="form-grid">
                            <div className="form-group">
                                <label className="form-label">HbA1c Baseline (%) *</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    className={`form-input ${fieldErrors.hba1c_baseline ? 'error' : ''}`}
                                    value={formData.hba1c_baseline}
                                    onChange={(e) => handleChange('hba1c_baseline', e.target.value)}
                                    min="4.0"
                                    max="20.0"
                                    required
                                />
                                <span className="info-text">Normal: 4.0-5.6%</span>
                                {fieldErrors.hba1c_baseline && (
                                    <p className="error-text">{fieldErrors.hba1c_baseline[0]}</p>
                                )}
                            </div>

                            <div className="form-group">
                                <label className="form-label">Diabetes Duration (years) *</label>
                                <input
                                    type="number"
                                    step="0.1"
                                    className={`form-input ${fieldErrors.diabetes_duration ? 'error' : ''}`}
                                    value={formData.diabetes_duration}
                                    onChange={(e) => handleChange('diabetes_duration', e.target.value)}
                                    min="0.0"
                                    max="50.0"
                                    required
                                />
                                {fieldErrors.diabetes_duration && (
                                    <p className="error-text">{fieldErrors.diabetes_duration[0]}</p>
                                )}
                            </div>

                            <div className="form-group">
                                <label className="form-label">Fasting Glucose (mg/dL) *</label>
                                <input
                                    type="number"
                                    step="0.1"
                                    className={`form-input ${fieldErrors.fasting_glucose ? 'error' : ''}`}
                                    value={formData.fasting_glucose}
                                    onChange={(e) => handleChange('fasting_glucose', e.target.value)}
                                    min="50.0"
                                    max="500.0"
                                    required
                                />
                                <span className="info-text">Normal: 70-100 mg/dL</span>
                                {fieldErrors.fasting_glucose && (
                                    <p className="error-text">{fieldErrors.fasting_glucose[0]}</p>
                                )}
                            </div>

                            <div className="form-group">
                                <label className="form-label">C-Peptide (ng/mL) *</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    className={`form-input ${fieldErrors.c_peptide ? 'error' : ''}`}
                                    value={formData.c_peptide}
                                    onChange={(e) => handleChange('c_peptide', e.target.value)}
                                    min="0.0"
                                    max="10.0"
                                    required
                                />
                                <span className="info-text">Normal: 1.1-4.4 ng/mL</span>
                                {fieldErrors.c_peptide && (
                                    <p className="error-text">{fieldErrors.c_peptide[0]}</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Metabolic & Cardiovascular Section */}
                <div className="section-card">
                    <div className="form-section">
                        <h3 className="form-section-title">Metabolic & Cardiovascular</h3>
                        <div className="form-grid">
                            <div className="form-group">
                                <label className="form-label">eGFR (mL/min/1.73m²) *</label>
                                <input
                                    type="number"
                                    step="0.1"
                                    className={`form-input ${fieldErrors.egfr ? 'error' : ''}`}
                                    value={formData.egfr}
                                    onChange={(e) => handleChange('egfr', e.target.value)}
                                    min="0.0"
                                    max="150.0"
                                    required
                                />
                                <span className="info-text">Normal: &gt;90 mL/min/1.73m²</span>
                                {fieldErrors.egfr && (
                                    <p className="error-text">{fieldErrors.egfr[0]}</p>
                                )}
                            </div>

                            <div className="form-group">
                                <label className="form-label">BMI (kg/m²) *</label>
                                <input
                                    type="number"
                                    step="0.1"
                                    className={`form-input ${fieldErrors.bmi ? 'error' : ''}`}
                                    value={formData.bmi}
                                    onChange={(e) => handleChange('bmi', e.target.value)}
                                    min="10.0"
                                    max="80.0"
                                    required
                                />
                                <span className="info-text">Normal: 18.5-24.9 kg/m²</span>
                                {fieldErrors.bmi && (
                                    <p className="error-text">{fieldErrors.bmi[0]}</p>
                                )}
                            </div>

                            <div className="form-group">
                                <label className="form-label">BP Systolic (mmHg) *</label>
                                <input
                                    type="number"
                                    className={`form-input ${fieldErrors.bp_systolic ? 'error' : ''}`}
                                    value={formData.bp_systolic}
                                    onChange={(e) => handleChange('bp_systolic', e.target.value)}
                                    min="70"
                                    max="250"
                                    required
                                />
                                <span className="info-text">Normal: &lt;120 mmHg</span>
                                {fieldErrors.bp_systolic && (
                                    <p className="error-text">{fieldErrors.bp_systolic[0]}</p>
                                )}
                            </div>

                            <div className="form-group">
                                <label className="form-label">BP Diastolic (mmHg) *</label>
                                <input
                                    type="number"
                                    className={`form-input ${fieldErrors.bp_diastolic ? 'error' : ''}`}
                                    value={formData.bp_diastolic}
                                    onChange={(e) => handleChange('bp_diastolic', e.target.value)}
                                    min="40"
                                    max="150"
                                    required
                                />
                                <span className="info-text">Normal: &lt;80 mmHg</span>
                                {fieldErrors.bp_diastolic && (
                                    <p className="error-text">{fieldErrors.bp_diastolic[0]}</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Liver & Lipid Profile Section */}
                <div className="section-card">
                    <div className="form-section">
                        <h3 className="form-section-title">Liver & Lipid Profile</h3>
                        <div className="form-grid">
                            <div className="form-group">
                                <label className="form-label">ALT (U/L) *</label>
                                <input
                                    type="number"
                                    step="0.1"
                                    className={`form-input ${fieldErrors.alt ? 'error' : ''}`}
                                    value={formData.alt}
                                    onChange={(e) => handleChange('alt', e.target.value)}
                                    min="0.0"
                                    max="500.0"
                                    required
                                />
                                <span className="info-text">Normal: 7-56 U/L</span>
                                {fieldErrors.alt && (
                                    <p className="error-text">{fieldErrors.alt[0]}</p>
                                )}
                            </div>

                            <div className="form-group">
                                <label className="form-label">LDL (mg/dL) *</label>
                                <input
                                    type="number"
                                    step="0.1"
                                    className={`form-input ${fieldErrors.ldl ? 'error' : ''}`}
                                    value={formData.ldl}
                                    onChange={(e) => handleChange('ldl', e.target.value)}
                                    min="0.0"
                                    max="500.0"
                                    required
                                />
                                <span className="info-text">Optimal: &lt;100 mg/dL</span>
                                {fieldErrors.ldl && (
                                    <p className="error-text">{fieldErrors.ldl[0]}</p>
                                )}
                            </div>

                            <div className="form-group">
                                <label className="form-label">HDL (mg/dL) *</label>
                                <input
                                    type="number"
                                    step="0.1"
                                    className={`form-input ${fieldErrors.hdl ? 'error' : ''}`}
                                    value={formData.hdl}
                                    onChange={(e) => handleChange('hdl', e.target.value)}
                                    min="0.0"
                                    max="200.0"
                                    required
                                />
                                <span className="info-text">Normal: &gt;40 mg/dL (M), &gt;50 mg/dL (F)</span>
                                {fieldErrors.hdl && (
                                    <p className="error-text">{fieldErrors.hdl[0]}</p>
                                )}
                            </div>

                            <div className="form-group">
                                <label className="form-label">Triglycerides (mg/dL) *</label>
                                <input
                                    type="number"
                                    step="0.1"
                                    className={`form-input ${fieldErrors.triglycerides ? 'error' : ''}`}
                                    value={formData.triglycerides}
                                    onChange={(e) => handleChange('triglycerides', e.target.value)}
                                    min="0.0"
                                    max="1000.0"
                                    required
                                />
                                <span className="info-text">Normal: &lt;150 mg/dL</span>
                                {fieldErrors.triglycerides && (
                                    <p className="error-text">{fieldErrors.triglycerides[0]}</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Medical History Section */}
                <div className="section-card">
                    <div className="form-section">
                        <h3 className="form-section-title">Medical History & Comorbidities</h3>
                        <div className="form-grid">
                            <div className="form-group">
                                <div className="form-group-inline">
                                    <input
                                        type="checkbox"
                                        className="form-checkbox"
                                        id="previous_prediabetes"
                                        checked={formData.previous_prediabetes}
                                        onChange={(e) => handleChange('previous_prediabetes', e.target.checked)}
                                    />
                                    <label className="checkbox-label" htmlFor="previous_prediabetes">
                                        Previous Prediabetes
                                    </label>
                                </div>
                            </div>

                            <div className="form-group">
                                <div className="form-group-inline">
                                    <input
                                        type="checkbox"
                                        className="form-checkbox"
                                        id="hypertension"
                                        checked={formData.hypertension}
                                        onChange={(e) => handleChange('hypertension', e.target.checked)}
                                    />
                                    <label className="checkbox-label" htmlFor="hypertension">
                                        Hypertension
                                    </label>
                                </div>
                            </div>

                            <div className="form-group">
                                <div className="form-group-inline">
                                    <input
                                        type="checkbox"
                                        className="form-checkbox"
                                        id="ckd"
                                        checked={formData.ckd}
                                        onChange={(e) => handleChange('ckd', e.target.checked)}
                                    />
                                    <label className="checkbox-label" htmlFor="ckd">
                                        Chronic Kidney Disease (CKD)
                                    </label>
                                </div>
                            </div>

                            <div className="form-group">
                                <div className="form-group-inline">
                                    <input
                                        type="checkbox"
                                        className="form-checkbox"
                                        id="cvd"
                                        checked={formData.cvd}
                                        onChange={(e) => handleChange('cvd', e.target.checked)}
                                    />
                                    <label className="checkbox-label" htmlFor="cvd">
                                        Cardiovascular Disease (CVD)
                                    </label>
                                </div>
                            </div>

                            <div className="form-group">
                                <div className="form-group-inline">
                                    <input
                                        type="checkbox"
                                        className="form-checkbox"
                                        id="nafld"
                                        checked={formData.nafld}
                                        onChange={(e) => handleChange('nafld', e.target.checked)}
                                    />
                                    <label className="checkbox-label" htmlFor="nafld">
                                        NAFLD (Fatty Liver Disease)
                                    </label>
                                </div>
                            </div>

                            <div className="form-group">
                                <div className="form-group-inline">
                                    <input
                                        type="checkbox"
                                        className="form-checkbox"
                                        id="retinopathy"
                                        checked={formData.retinopathy}
                                        onChange={(e) => handleChange('retinopathy', e.target.checked)}
                                    />
                                    <label className="checkbox-label" htmlFor="retinopathy">
                                        Retinopathy
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Form Actions */}
                <div className="form-actions-wrapper">
                    <button
                        type="submit"
                        className="form-btn submit"
                        disabled={isPending}
                    >
                        {isPending ? (
                            <>
                                <i className="fa-solid fa-spinner fa-spin"></i>
                                <span>{hasMedicalData ? 'Updating...' : 'Creating...'}</span>
                            </>
                        ) : (
                            <>
                                <i className="fa-solid fa-check"></i>
                                <span>{hasMedicalData ? 'Save Changes' : 'Create Medical Data'}</span>
                            </>
                        )}
                    </button>
                </div>
            </form>

            <style jsx>{`
                .section-card {
                    padding: 24px;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 10px;
                    margin-bottom: 20px;
                }

                .form-section {
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                }

                .form-section-title {
                    font-size: 16px;
                    font-weight: 600;
                    color: #34d399;
                    margin-bottom: 8px;
                    padding-bottom: 12px;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
                    letter-spacing: -0.3px;
                }

                .form-grid {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 20px;
                }

                .form-group {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }

                .form-group.full-width {
                    grid-column: 1 / -1;
                }

                .form-label {
                    font-size: 12px;
                    color: rgba(255, 255, 255, 0.6);
                    font-weight: 500;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }

                .form-input {
                    padding: 12px 14px;
                    background: rgba(255, 255, 255, 0.03);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 8px;
                    color: #ffffff;
                    font-size: 14px;
                    outline: none;
                    transition: all 0.2s ease;
                }

                .form-input::placeholder {
                    color: rgba(255, 255, 255, 0.3);
                }

                .form-input:focus {
                    border-color: rgba(16, 185, 129, 0.4);
                    background: rgba(255, 255, 255, 0.05);
                    box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
                }

                .form-input.error {
                    border-color: rgba(239, 68, 68, 0.5);
                    background: rgba(239, 68, 68, 0.05);
                }

                .info-text {
                    font-size: 11px;
                    color: rgba(255, 255, 255, 0.4);
                    font-style: italic;
                }

                .error-text {
                    font-size: 12px;
                    color: #ef4444;
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    margin-top: -4px;
                }

                .error-text::before {
                    content: '⚠';
                    font-size: 11px;
                }

                .form-group-inline {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 10px;
                    background: rgba(255, 255, 255, 0.02);
                    border-radius: 6px;
                }

                .form-checkbox {
                    width: 18px;
                    height: 18px;
                    border-radius: 4px;
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    background: rgba(255, 255, 255, 0.03);
                    cursor: pointer;
                    transition: all 0.2s ease;
                    appearance: none;
                    -webkit-appearance: none;
                    position: relative;
                    flex-shrink: 0;
                }

                .form-checkbox:checked {
                    background: #10b981;
                    border-color: #10b981;
                }

                .form-checkbox:checked::after {
                    content: '✓';
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    color: white;
                    font-size: 12px;
                    font-weight: bold;
                }

                .form-checkbox:focus {
                    outline: none;
                    box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
                }

                .checkbox-label {
                    font-size: 13px;
                    color: rgba(255, 255, 255, 0.8);
                    cursor: pointer;
                    user-select: none;
                    font-weight: 400;
                }

                .form-actions-wrapper {
                    display: flex;
                    justify-content: flex-end;
                    margin-top: 24px;
                }

                .form-btn {
                    padding: 11px 24px;
                    border-radius: 8px;
                    font-size: 14px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    border: 1px solid;
                }

                .form-btn:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }

                .form-btn.submit {
                    background: linear-gradient(135deg, #047857, #10b981);
                    border-color: rgba(16, 185, 129, 0.3);
                    color: white;
                }

                .form-btn.submit:hover:not(:disabled) {
                    background: linear-gradient(135deg, #059669, #34d399);
                    border-color: rgba(16, 185, 129, 0.4);
                }

                @media (max-width: 768px) {
                    .section-card {
                        padding: 16px;
                    }

                    .form-grid {
                        grid-template-columns: 1fr;
                        gap: 16px;
                    }

                    .form-group.full-width {
                        grid-column: 1;
                    }

                    .form-actions-wrapper {
                        justify-content: stretch;
                    }

                    .form-btn {
                        width: 100%;
                        justify-content: center;
                    }
                }
            `}</style>
        </>
    );
}