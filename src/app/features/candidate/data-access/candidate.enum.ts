import { EnumOption, EnumOptionConfig } from '../../../core/models/enum.model';

export type { EnumOption, EnumOptionConfig };

export enum CandidateStage {
  Applied = 'Applied',
  Screening = 'Screening',
  Interview = 'Interview',
  Offer = 'Offer',
  Hired = 'Hired',
  Rejected = 'Rejected',
}

export enum MatchScoreLevel {
  High = 'High',
  Medium = 'Medium',
  Fair = 'Fair',
}

export interface CandidateStageColumnConfig extends EnumOptionConfig {
  key: string;
  columnClass: string;
  dotClass: string;
  textClass: string;
  tagClass: string;
  subtextKey: string;
}

export const CANDIDATE_STAGE_CONFIG: Record<string, CandidateStageColumnConfig> = {
  [CandidateStage.Applied]: {
    key: 'applied',
    label: 'candidate.applied',
    icon: 'fa-file-signature',
    cssClass: 'badge-blue',
    columnClass: 'column-applied',
    dotClass: 'dot-applied',
    textClass: 'text-applied',
    tagClass: 'tag-applied',
    subtextKey: 'candidate.stageSubtextApplied',
  },
  [CandidateStage.Screening]: {
    key: 'screening',
    label: 'candidate.screening',
    icon: 'fa-filter',
    cssClass: 'badge-cyan',
    columnClass: 'column-screening',
    dotClass: 'dot-screening',
    textClass: 'text-screening',
    tagClass: 'tag-screening',
    subtextKey: 'candidate.stageSubtextScreening',
  },
  [CandidateStage.Interview]: {
    key: 'interview',
    label: 'candidate.interview',
    icon: 'fa-comments',
    cssClass: 'badge-purple',
    columnClass: 'column-interview',
    dotClass: 'dot-interview',
    textClass: 'text-interview',
    tagClass: 'tag-interview',
    subtextKey: 'candidate.stageSubtextInterview',
  },
  [CandidateStage.Offer]: {
    key: 'offer',
    label: 'candidate.offer',
    icon: 'fa-envelope-open-text',
    cssClass: 'badge-amber',
    columnClass: 'column-offer',
    dotClass: 'dot-offer',
    textClass: 'text-offer',
    tagClass: 'tag-offer',
    subtextKey: 'candidate.stageSubtextOffer',
  },
  [CandidateStage.Hired]: {
    key: 'hired',
    label: 'candidate.hired',
    icon: 'fa-circle-check',
    cssClass: 'badge-green',
    columnClass: 'column-hired',
    dotClass: 'dot-hired',
    textClass: 'text-hired',
    tagClass: 'tag-hired',
    subtextKey: 'candidate.stageSubtextHired',
  },
  [CandidateStage.Rejected]: {
    key: 'rejected',
    label: 'candidate.rejected',
    icon: 'fa-circle-xmark',
    cssClass: 'badge-red',
    columnClass: 'column-rejected',
    dotClass: 'dot-rejected',
    textClass: 'text-rejected',
    tagClass: 'tag-rejected',
    subtextKey: 'candidate.stageSubtextRejected',
  },
};

export const MATCH_SCORE_LEVEL_CONFIG: Record<string, EnumOptionConfig> = {
  [MatchScoreLevel.High]: {
    label: 'candidate.matchHigh',
    icon: 'fa-wand-magic-sparkles',
    cssClass: 'match-high',
  },
  [MatchScoreLevel.Medium]: {
    label: 'candidate.matchMedium',
    icon: 'fa-star-half-stroke',
    cssClass: 'match-medium',
  },
  [MatchScoreLevel.Fair]: {
    label: 'candidate.matchFair',
    icon: 'fa-circle-dot',
    cssClass: 'match-fair',
  },
};

export const CANDIDATE_STAGE_OPTIONS: EnumOption<CandidateStage>[] = Object.values(
  CandidateStage,
).map((value) => ({
  value,
  label: CANDIDATE_STAGE_CONFIG[value]?.label ?? `candidate.${value.toLowerCase()}`,
  cssClass: CANDIDATE_STAGE_CONFIG[value]?.cssClass ?? 'badge-secondary',
  icon: CANDIDATE_STAGE_CONFIG[value]?.icon,
}));

export const MATCH_SCORE_LEVEL_OPTIONS: EnumOption<MatchScoreLevel>[] = Object.values(
  MatchScoreLevel,
).map((value) => ({
  value,
  label: MATCH_SCORE_LEVEL_CONFIG[value]?.label ?? `candidate.match${value}`,
  cssClass: MATCH_SCORE_LEVEL_CONFIG[value]?.cssClass ?? 'match-medium',
  icon: MATCH_SCORE_LEVEL_CONFIG[value]?.icon,
}));
