import React, { useState } from 'react';
import './App.css';

const App: React.FC = () => {
  const [numDice, setNumDice] = useState<number>(5);
  const [target, setTarget] = useState<number>(6);

  // Ensure target is between 1 and 10.
  const adjustedTarget = Math.min(Math.max(target, 1), 10);
  // Success probability for a d10 (roll >= target).
  const p = (11 - adjustedTarget) / 10;
  // For botch: probability a die fails without showing a 1.
  const pFailureNoOne = adjustedTarget > 2 ? (adjustedTarget - 2) / 10 : 0;

  // Helper: Calculate binomial coefficient.
  const binom = (n: number, k: number): number => {
    if (k > n) return 0;
    let coeff = 1;
    for (let i = 1; i <= k; i++) {
      coeff = (coeff * (n - i + 1)) / i;
    }
    return coeff;
  };

  // Compute exact probabilities for k successes (k = 0 ... numDice).
  const exactProbabilities: number[] = [];
  for (let k = 0; k <= numDice; k++) {
    exactProbabilities[k] = binom(numDice, k) * Math.pow(p, k) * Math.pow(1 - p, numDice - k);
  }

  // Compute cumulative probabilities: probability of at least k successes.
  const cumulativeProbabilities: number[] = [];
  for (let k = 0; k <= numDice; k++) {
    let sum = 0;
    for (let j = k; j <= numDice; j++) {
      sum += exactProbabilities[j];
    }
    cumulativeProbabilities[k] = sum;
  }

  // Botch: 0 successes with at least one die showing a 1.
  const botchProbability = exactProbabilities[0] - Math.pow(pFailureNoOne, numDice);

  // Return a CSS class based on the percentage.
  // We add an extra parameter "isBotch" to distinguish between botch and general failure (0 successes).
  const getColorClass = (percentage: number, lowIsGood: boolean = false, isBotch: boolean = false): string => {
    if (!lowIsGood) {
      // For successes (high is good):
      if (percentage >= 75) return 'color-green';
      if (percentage >= 50) return 'color-yellow';
      if (percentage >= 25) return 'color-orange';
      return 'color-red';
    } else {
      if (isBotch) {
        // For botch: red if botch chance is 10% or higher.
        if (percentage <= 2) return 'color-green';
        if (percentage <= 5) return 'color-yellow';
        if (percentage <= 10) return 'color-orange';
        return 'color-red';
      } else {
        // For 0 successes (failure): since 70%+ chance to succeed is safe,
        // the complementary 0-success chance should be under 30%.
        if (percentage <= 8) return 'color-green';
        if (percentage <= 16) return 'color-yellow';
        if (percentage <= 25) return 'color-orange';
        return 'color-red';
      }
    }
  };

  // Build rows for "x+ successes" for x from 1 to min(5, numDice).
  const maxSuccessRow = Math.min(5, numDice);
  const successRows = [];
  for (let k = 1; k <= maxSuccessRow; k++) {
    const cumulativePercentage = cumulativeProbabilities[k] * 100;
    successRows.push(
      <li key={`success-${k}`}>
        {k}+ successes:{" "}
        <span className={getColorClass(cumulativePercentage, false)}>
          {cumulativePercentage.toFixed(2)}%
        </span>
      </li>
    );
  }

  const zeroSuccessPercentage = exactProbabilities[0] * 100;
  const zeroRow = (
    <li key="zero-successes">
      0 successes:{" "}
      <span className={getColorClass(zeroSuccessPercentage, true, false)}>
        {zeroSuccessPercentage.toFixed(2)}%
      </span>
    </li>
  );

  const botchPercentage = botchProbability * 100;
  const botchRow = (
    <li key="botch">
      Botch (0 successes with at least one 1):{" "}
      <span className={getColorClass(botchPercentage, true, true)}>
        {botchPercentage.toFixed(2)}%
      </span>
    </li>
  );

  return (
    <div className="app-container">
      <h1>Vampire: The Masquerade Success Calculator</h1>
      <div className="input-container">
        <label>
          Number of d10s:
          <input
            type="number"
            value={numDice}
            onChange={(e) => setNumDice(parseInt(e.target.value) || 0)}
            className="input-field"
          />
        </label>
      </div>
      <div className="input-container">
        <label>
          Target Number:
          <input
            type="number"
            value={target}
            onChange={(e) => setTarget(parseInt(e.target.value) || 0)}
            className="input-field"
          />
        </label>
      </div>
      <h2>Success Probabilities</h2>
      <ul>
        {successRows}
        {zeroRow}
        {botchRow}
      </ul>
    </div>
  );
};

export default App;
