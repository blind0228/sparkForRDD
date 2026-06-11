import { render, screen, waitFor } from '@testing-library/react';
import { MapMode } from './MapMode';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';

// Mock Google Maps API
vi.mock('@react-google-maps/api', () => ({
  GoogleMap: ({ children, onIdle }: any) => {
    // Simulate onIdle to trigger data fetching
    useEffect(() => {
      onIdle?.();
    }, []);
    return <div data-testid="google-map">{children}</div>;
  },
  useJsApiLoader: () => ({ isLoaded: true }),
  Marker: ({ onClick }: any) => <div data-testid="marker" onClick={onClick} />,
  InfoWindow: ({ children }: any) => <div data-testid="info-window">{children}</div>,
  MarkerClusterer: ({ children }: any) => <div>{children(() => {})}</div>,
}));

import { useEffect } from 'react';

const mockMarkers = [
  {
    id: 1,
    dataBatch: 'batch1',
    country: 'Japan',
    fileName: 'test.jpg',
    imageFileName: 'test.jpg',
    imageUrl: 'http://example.com/test.jpg',
    latitude: 35.0,
    longitude: 139.0,
    totalDamageCount: 1,
    createdAt: '2024-01-01T00:00:00Z',
  },
];

describe('MapMode', () => {
  beforeEach(() => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockMarkers),
    });
  });

  it('renders correctly and fetches markers', async () => {
    render(
      <MemoryRouter>
        <MapMode />
      </MemoryRouter>
    );

    expect(screen.getByText('GIS 관제 지도')).toBeInTheDocument();
    
    await waitFor(() => {
      expect(globalThis.fetch).toHaveBeenCalledWith(expect.stringContaining('/api/damages/markers'));
    });
  });
});
