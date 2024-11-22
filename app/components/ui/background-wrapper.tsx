'use client';

import { BackgroundGradientAnimation } from './background-gradient-animation';

export default function BackgroundWrapper() {
  return (
    <div className="fixed inset-0 -z-10">
      <BackgroundGradientAnimation
        gradientBackgroundStart="rgb(0, 0, 0)"
        gradientBackgroundEnd="rgb(25, 25, 25)"
        firstColor="18, 18, 18"
        secondColor="38, 38, 38"
        thirdColor="48, 48, 48"
        fourthColor="68, 68, 68"
        fifthColor="88, 88, 88"
        pointerColor="128, 128, 128"
        interactive={true}
        className="!absolute"
      />
    </div>
  );
}
