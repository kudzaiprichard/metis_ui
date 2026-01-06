/**
 * TimelineTab Component
 * Display patient timeline (read-only view)
 */

'use client';

interface TimelineTabProps {
    patientId: string;
}

export function TimelineTab({ patientId }: TimelineTabProps) {
    // TODO: Implement timeline data fetching
    // const { data: timeline, isLoading } = usePatientTimeline(patientId);

    return (
        <>
            <div className="tab-content">
                <div className="content-header">
                    <h2 className="content-title">Patient Timeline</h2>
                </div>

                <div className="empty-state">
                    <div className="empty-icon">
                        <i className="fa-solid fa-clock-rotate-left"></i>
                    </div>
                    <h3 className="empty-title">Timeline Coming Soon</h3>
                    <p className="empty-subtitle">
                        Patient activity timeline will be available here, including visits, treatments, and medical updates.
                    </p>
                </div>
            </div>

            <style jsx>{`
                .tab-content {
                    padding: 24px;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 10px;
                }

                .content-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 24px;
                    padding-bottom: 16px;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
                }

                .content-title {
                    font-size: 18px;
                    font-weight: 600;
                    color: #ffffff;
                    letter-spacing: -0.3px;
                }

                .empty-state {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 60px 20px;
                    text-align: center;
                }

                .empty-icon {
                    width: 64px;
                    height: 64px;
                    border-radius: 12px;
                    background: rgba(255, 255, 255, 0.04);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin-bottom: 20px;
                    font-size: 28px;
                    color: rgba(255, 255, 255, 0.3);
                }

                .empty-title {
                    font-size: 18px;
                    font-weight: 600;
                    color: #ffffff;
                    margin-bottom: 8px;
                    letter-spacing: -0.3px;
                }

                .empty-subtitle {
                    font-size: 14px;
                    color: rgba(255, 255, 255, 0.5);
                    max-width: 400px;
                    line-height: 1.6;
                }

                @media (max-width: 768px) {
                    .tab-content {
                        padding: 16px;
                    }

                    .empty-state {
                        padding: 40px 16px;
                    }

                    .empty-icon {
                        width: 56px;
                        height: 56px;
                        font-size: 24px;
                    }

                    .empty-title {
                        font-size: 16px;
                    }

                    .empty-subtitle {
                        font-size: 13px;
                    }
                }
            `}</style>
        </>
    );
}