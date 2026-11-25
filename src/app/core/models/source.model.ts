export interface SourceSupport {
  placeId: string;
  claims: string[];
}

export interface Source {
  id: string;
  title: string;
  creator: string;
  publisher: string | null;
  citation: string;
  url: string | null;
  consultedAt: string;
  supports: SourceSupport[];
}
