/*
import { fetchSongs } from '../songApi';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

// Mock the fetch function
global.fetch = vi.fn();

describe('songApi', () => {
  beforeEach(() => {
    (global.fetch as unknown as ReturnType<typeof vi.fn>).mockClear();
  });

  it('fetches songs with default parameters', async () => {
    const mockResponse = {
      items: [
        {
          song_id: '1',
          title: 'Test Song',
          artist: 'Test Artist',
          album: 'Test Album',
          s3_uri: 's3://test-bucket/song.mp3'
        }
      ],
      total: 1,
      has_more: false
    };

    (global.fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse)
    });

    const result = await fetchSongs();

    expect(global.fetch).toHaveBeenCalledWith(
      'https://api.ourchants.com/songs?limit=20&offset=0',
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    expect(result).toEqual(mockResponse);
  });

  it('fetches songs with custom parameters', async () => {
    const mockResponse = {
      items: [
        {
          song_id: '1',
          title: 'Test Song',
          artist: 'Test Artist',
          album: 'Test Album',
          s3_uri: 's3://test-bucket/song.mp3'
        }
      ],
      total: 1,
      has_more: false
    };

    (global.fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse)
    });

    const result = await fetchSongs({
      artist_filter: 'Test Artist',
      limit: 10,
      offset: 5
    });

    expect(global.fetch).toHaveBeenCalledWith(
      'https://api.ourchants.com/songs?artist_filter=Test%20Artist&limit=10&offset=5',
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    expect(result).toEqual(mockResponse);
  });

  it('handles API errors', async () => {
    (global.fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error'
    });

    await expect(fetchSongs()).rejects.toThrow('Failed to fetch songs');
  });

  it('handles network errors', async () => {
    (global.fetch as unknown as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error('Network error'));

    await expect(fetchSongs()).rejects.toThrow('Network error');
  });
});
*/ 