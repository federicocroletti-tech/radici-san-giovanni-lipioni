import { LocalizedText } from './localized-text.model';

export type TimelineKind = 'sismico' | 'storico' | 'persona' | 'emigrazione' | 'tradizione';
export type SourceStatus = 'verified' | 'to-verify' | 'research';

export interface TimelineEvent {
  id: string;
  kind: TimelineKind;
  dateLabel: string;
  title: LocalizedText;
  summary: LocalizedText;
  sourceStatus: SourceStatus;
  sourceIds: string[];
  placeId?: string | null;
}
