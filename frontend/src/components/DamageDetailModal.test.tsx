import { render, screen, waitFor } from '@testing-library/react';
import { DamageDetailModal } from './DamageDetailModal';
import type { RoadDamageMarker } from '../types/damage';
import { vi, describe, it, expect, beforeEach } from 'vitest';

const mockMarker: RoadDamageMarker = {
  id: 1,
  dataBatch: 'batch1',
  country: 'Japan',
  fileName: 'test_file.jpg',
  imageFileName: 'test_file.jpg',
  imageUrl: 'https://example.com/test_file.jpg',
  latitude: 35.0,
  longitude: 139.0,
  totalDamageCount: 2,
  createdAt: '2024-01-01T00:00:00Z',
};

const mockLabels = [
  {
    id: 1,
    damageCode: 'D00',
    damageName: 'Longitudinal Crack',
    classId: 0,
    xCenter: 0.5,
    yCenter: 0.5,
    bboxWidth: 0.1,
    bboxHeight: 0.1,
    latitude: 35.0,
    longitude: 139.0,
  },
];

describe('DamageDetailModal', () => {
  beforeEach(() => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockLabels),
    });
  });

  it('renders correctly when open', async () => {
    render(
      <DamageDetailModal
        isOpen={true}
        marker={mockMarker}
        onClose={() => {}}
      />
    );

    expect(screen.getByText('손상 상세 정보')).toBeInTheDocument();
    expect(screen.getByAltText('Road Damage')).toHaveAttribute('src', mockMarker.imageUrl);
    
    await waitFor(() => {
      expect(screen.getAllByText('D00').length).toBeGreaterThan(0);
      expect(screen.getByText('Longitudinal Crack')).toBeInTheDocument();
    });
  });

  it('calls onClose when close button is clicked', () => {
    const onClose = vi.fn();
    render(
      <DamageDetailModal
        isOpen={true}
        marker={mockMarker}
        onClose={onClose}
      />
    );

    const closeButton = screen.getByRole('button', { name: /close/i });
    closeButton.click();
    expect(onClose).toHaveBeenCalled();
  });
});
