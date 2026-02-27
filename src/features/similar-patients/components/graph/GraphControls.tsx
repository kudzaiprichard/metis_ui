/**
 * GraphControls Component
 * Controls for graph visualization (zoom, layout) - without radial layout
 */

'use client';

interface GraphControlsProps {
    zoom: number;
    onZoomChange: (zoom: number) => void;
    layout: 'force' | 'hierarchical' | 'cluster' | 'outcome';
    onLayoutChange: (layout: 'force' | 'hierarchical' | 'cluster' | 'outcome') => void;
    showLabels: boolean;
    onShowLabelsChange: (show: boolean) => void;
    onReset: () => void;
}

export function GraphControls({
                                  zoom,
                                  onZoomChange,
                                  layout,
                                  onLayoutChange,
                                  showLabels,
                                  onShowLabelsChange,
                                  onReset,
                              }: GraphControlsProps) {
    const handleZoomIn = () => {
        onZoomChange(Math.min(zoom + 0.2, 2));
    };

    const handleZoomOut = () => {
        onZoomChange(Math.max(zoom - 0.2, 0.5));
    };

    return (
        <>
            <div className="controls-container">
                {/* Zoom Controls */}
                <div className="control-group">
                    <label className="control-label">Zoom</label>
                    <div className="zoom-controls">
                        <button
                            className="control-btn"
                            onClick={handleZoomOut}
                            disabled={zoom <= 0.5}
                            title="Zoom out"
                        >
                            <i className="fa-solid fa-minus"></i>
                        </button>
                        <span className="zoom-value">{(zoom * 100).toFixed(0)}%</span>
                        <button
                            className="control-btn"
                            onClick={handleZoomIn}
                            disabled={zoom >= 2}
                            title="Zoom in"
                        >
                            <i className="fa-solid fa-plus"></i>
                        </button>
                    </div>
                </div>

                {/* Layout Selector */}
                <div className="control-group">
                    <label className="control-label">Layout</label>
                    <div className="layout-selector">
                        <button
                            className={`layout-btn ${layout === 'force' ? 'active' : ''}`}
                            onClick={() => onLayoutChange('force')}
                            title="Force-directed layout"
                        >
                            <i className="fa-solid fa-circle-nodes"></i>
                            <span>Force</span>
                        </button>
                        <button
                            className={`layout-btn ${layout === 'hierarchical' ? 'active' : ''}`}
                            onClick={() => onLayoutChange('hierarchical')}
                            title="Hierarchical layout"
                        >
                            <i className="fa-solid fa-sitemap"></i>
                            <span>Tree</span>
                        </button>
                        <button
                            className={`layout-btn ${layout === 'cluster' ? 'active' : ''}`}
                            onClick={() => onLayoutChange('cluster')}
                            title="Cluster layout"
                        >
                            <i className="fa-solid fa-layer-group"></i>
                            <span>Cluster</span>
                        </button>
                        <button
                            className={`layout-btn ${layout === 'outcome' ? 'active' : ''}`}
                            onClick={() => onLayoutChange('outcome')}
                            title="Outcome-based layout"
                        >
                            <i className="fa-solid fa-chart-line"></i>
                            <span>Outcome</span>
                        </button>
                    </div>
                </div>
            </div>

            <style jsx>{`
                .controls-container {
                    display: flex;
                    align-items: center;
                    gap: 20px;
                    padding: 16px 20px;
                    background: rgba(255, 255, 255, 0.04);
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    border-radius: 10px;
                    flex-wrap: wrap;
                }

                .control-group {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }

                .control-label {
                    font-size: 10px;
                    color: rgba(255, 255, 255, 0.5);
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    font-weight: 600;
                }

                .zoom-controls {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    background: rgba(255, 255, 255, 0.04);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 8px;
                    padding: 4px;
                }

                .control-btn {
                    width: 32px;
                    height: 32px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: rgba(255, 255, 255, 0.04);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 6px;
                    color: rgba(255, 255, 255, 0.7);
                    cursor: pointer;
                    transition: all 0.2s ease;
                    font-size: 12px;
                }

                .control-btn:hover:not(:disabled) {
                    background: rgba(255, 255, 255, 0.08);
                    border-color: rgba(255, 255, 255, 0.15);
                    color: rgba(255, 255, 255, 0.9);
                }

                .control-btn:disabled {
                    opacity: 0.4;
                    cursor: not-allowed;
                }

                .zoom-value {
                    font-size: 12px;
                    font-weight: 600;
                    color: #34d399;
                    min-width: 45px;
                    text-align: center;
                }

                .layout-selector {
                    display: flex;
                    gap: 4px;
                    background: rgba(255, 255, 255, 0.04);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 8px;
                    padding: 4px;
                }

                .layout-btn {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    padding: 6px 12px;
                    background: transparent;
                    border: none;
                    border-radius: 6px;
                    color: rgba(255, 255, 255, 0.6);
                    font-size: 12px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    white-space: nowrap;
                }

                .layout-btn:hover {
                    background: rgba(255, 255, 255, 0.05);
                    color: rgba(255, 255, 255, 0.9);
                }

                .layout-btn.active {
                    background: rgba(16, 185, 129, 0.15);
                    color: #34d399;
                }

                .layout-btn i {
                    font-size: 11px;
                }

                @media (max-width: 768px) {
                    .controls-container {
                        flex-direction: column;
                        align-items: stretch;
                        gap: 16px;
                    }

                    .control-group {
                        width: 100%;
                    }

                    .layout-selector {
                        width: 100%;
                        flex-wrap: wrap;
                    }

                    .layout-btn {
                        flex: 1;
                        justify-content: center;
                        min-width: calc(50% - 2px);
                    }
                }
            `}</style>
        </>
    );
}