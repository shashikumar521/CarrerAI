import React from 'react';
import { CareerAiLoadingScreen } from './CareerAiLoadingScreen';

export interface CareerAiStartupIntroProps {
  onComplete: () => void;
}

/**
 * CareerAiStartupIntro
 * Reuses the ONE centralized CareerAI loading experience for the first-visit intro / replay.
 */
export const CareerAiStartupIntro: React.FC<CareerAiStartupIntroProps> = ({ onComplete }) => {
  return (
    <CareerAiLoadingScreen
      show={true}
      isIntroMode={true}
      onComplete={onComplete}
      onDismiss={onComplete}
    />
  );
};

export default CareerAiStartupIntro;
