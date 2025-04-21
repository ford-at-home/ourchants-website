interface ResumeState {
  songId: string;
  timestamp: number;
  lastUpdated: number;
}

const RESUME_STATE_KEY = 'ourchants_resume_state';

export const saveResumeState = (songId: string, timestamp: number) => {
  const state: ResumeState = {
    songId,
    timestamp,
    lastUpdated: Date.now()
  };
  localStorage.setItem(RESUME_STATE_KEY, JSON.stringify(state));
};

export const getResumeState = (): ResumeState | null => {
  const state = localStorage.getItem(RESUME_STATE_KEY);
  if (!state) return null;
  return JSON.parse(state);
};

export const clearResumeState = () => {
  localStorage.removeItem(RESUME_STATE_KEY);
}; 