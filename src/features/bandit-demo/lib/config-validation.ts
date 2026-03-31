/**
 * Client-side validation for simulation config fields — mirrors the backend
 * form-field constraints documented in spec §6 "POST /api/v1/simulations":
 *
 *   initial_epsilon  0.0 – 1.0   (float)
 *   epsilon_decay    0.9 – 1.0   (float)
 *   min_epsilon      0.0 – 1.0   (float)
 *   random_seed      0 – 999 999 (integer)
 *
 * Surfacing errors at input time prevents the common footgun of submitting an
 * out-of-range value and getting back a generic VALIDATION_ERROR from the
 * backend with no field-level context.
 *
 * We also enforce one cross-field rule the spec implies but does not state in
 * a single sentence: min_epsilon must not exceed initial_epsilon. The bandit's
 * epsilon schedule is `max(min_epsilon, initial_epsilon × decay^step)` (spec
 * §6.5 "epsilon" row), so an inverted pair means epsilon is pinned at
 * min_epsilon forever and initial_epsilon is effectively ignored.
 */
import type { SimulationUploadConfig } from '../types';

export interface RangeRule {
    min: number;
    max: number;
    integer?: boolean;
    label: string;
}

export const CONFIG_RANGES: Record<keyof Omit<SimulationUploadConfig, 'resetPosterior'>, RangeRule> = {
    initialEpsilon: { min: 0, max: 1, label: 'Initial epsilon' },
    epsilonDecay: { min: 0.9, max: 1, label: 'Epsilon decay' },
    minEpsilon: { min: 0, max: 1, label: 'Min epsilon' },
    randomSeed: { min: 0, max: 999_999, integer: true, label: 'Random seed' },
};

export interface ConfigValidationErrors {
    initialEpsilon: string | null;
    epsilonDecay: string | null;
    minEpsilon: string | null;
    randomSeed: string | null;
}

export function validateSimulationConfig(
    config: SimulationUploadConfig,
): ConfigValidationErrors {
    return {
        initialEpsilon: checkRange(config.initialEpsilon, CONFIG_RANGES.initialEpsilon),
        epsilonDecay: checkRange(config.epsilonDecay, CONFIG_RANGES.epsilonDecay),
        minEpsilon:
            checkRange(config.minEpsilon, CONFIG_RANGES.minEpsilon) ??
            checkMinVsInitial(config),
        randomSeed: checkRange(config.randomSeed, CONFIG_RANGES.randomSeed),
    };
}

export function hasConfigErrors(errors: ConfigValidationErrors): boolean {
    return (
        errors.initialEpsilon !== null ||
        errors.epsilonDecay !== null ||
        errors.minEpsilon !== null ||
        errors.randomSeed !== null
    );
}

function checkRange(value: number, rule: RangeRule): string | null {
    if (!Number.isFinite(value)) {
        return `${rule.label} must be a number`;
    }
    if (rule.integer && !Number.isInteger(value)) {
        return `${rule.label} must be a whole number`;
    }
    if (value < rule.min || value > rule.max) {
        return `${rule.label} must be between ${rule.min} and ${rule.max}`;
    }
    return null;
}

function checkMinVsInitial(config: SimulationUploadConfig): string | null {
    if (config.minEpsilon > config.initialEpsilon) {
        return `Min epsilon cannot exceed initial epsilon (${config.initialEpsilon})`;
    }
    return null;
}
