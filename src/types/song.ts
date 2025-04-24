export interface Song {
  song_id: string;
  title: string;
  artist: string;
  album?: string;
  bpm?: string;
  composer?: string;
  version?: string;
  date?: string;
  filename?: string;
  filepath?: string;
  description?: string;
  lineage?: string[];
  s3_uri: string;
}
