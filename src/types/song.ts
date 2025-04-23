export interface Song {
  song_id: string;
  title: string;
  artist: string;
  album?: string;
  bpm?: number;
  s3_uri: string;
  description?: string;
  lineage?: string[];
  composer?: string;
  version?: string;
  date?: string;
  filename?: string;
  filepath?: string;
}
