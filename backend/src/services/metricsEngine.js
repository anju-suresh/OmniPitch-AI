/**
 * Mathematical Telemetry & Metrics Engine
 * Computes xG, xT, PPDA, Pass Quality, Ball & Shot Speeds, and Control vs Chaos.
 */

// Pitch dimensions normalized 0 - 100
// Real pitch metrics: 105m length x 68m width
export const calculateXG = (x, y, shotType = 'open_play', underPressure = false) => {
  const dx = 100 - x;
  const dy = Math.abs(50 - y);
  const distance = Math.sqrt(dx * dx + dy * dy);
  
  // Angle to goal posts (posts located at y=45 and y=55)
  const angle = Math.atan2(10, dx); // angle aperture

  let baseProbability = Math.exp(-0.065 * distance) * (angle / (Math.PI / 2));
  
  if (shotType === 'header') baseProbability *= 0.65;
  if (shotType === 'volley') baseProbability *= 0.8;
  if (shotType === 'penalty') return 0.79;
  if (underPressure) baseProbability *= 0.72;

  return Math.min(Math.max(parseFloat(baseProbability.toFixed(3)), 0.02), 0.95);
};

export const calculateXT = (startX, startY, endX, endY) => {
  const getZoneThreat = (x, y) => {
    const xFactor = Math.pow(x / 100, 2.5);
    const yFactor = 1 - Math.abs(50 - y) / 50 * 0.4;
    return xFactor * yFactor;
  };

  const threatBefore = getZoneThreat(startX, startY);
  const threatAfter = getZoneThreat(endX, endY);
  const diff = threatAfter - threatBefore;
  
  return parseFloat(diff.toFixed(3));
};

export const calculatePassQuality = (startX, startY, endX, endY, pressure = 0.5) => {
  // Convert 0-100 pitch coordinates to real meters (105m x 68m)
  const dxMeters = Math.abs(endX - startX) * 1.05;
  const dyMeters = Math.abs(endY - startY) * 0.68;
  const distanceMeters = parseFloat(Math.sqrt(dxMeters * dxMeters + dyMeters * dyMeters).toFixed(1));

  // Forward progression factor
  const isProgressive = endX > startX;
  const forwardGain = Math.max(0, (endX - startX) * 1.05);

  // Difficulty rating 0 - 100%
  let difficulty = Math.min(Math.round((distanceMeters / 45) * 50 + pressure * 40 + (isProgressive ? 10 : 0)), 96);
  difficulty = Math.max(difficulty, 12);

  // Expected Pass Completion (xP)
  const xP = parseFloat((1 - (difficulty / 100) * 0.75).toFixed(2));

  return {
    distanceMeters,
    forwardGain: parseFloat(forwardGain.toFixed(1)),
    difficultyRating: difficulty,
    expectedPassCompletion: xP,
    ratingTier: difficulty > 75 ? 'Very High' : difficulty > 50 ? 'Medium-High' : 'Standard'
  };
};

export const calculateBallSpeed = (type, startX, startY, endX, endY, durationSeconds = 1.2) => {
  const dxMeters = Math.abs((endX || startX) - startX) * 1.05;
  const dyMeters = Math.abs((endY || startY) - startY) * 0.68;
  const distanceMeters = Math.sqrt(dxMeters * dxMeters + dyMeters * dyMeters);

  if (type === 'goal' || type?.includes('shot')) {
    // Shot speed range 75 - 118 km/h
    const baseSpeedKmh = Math.round(85 + (distanceMeters / 25) * 20);
    return {
      speedKmh: Math.min(Math.max(baseSpeedKmh, 78), 118),
      speedMps: parseFloat(((baseSpeedKmh * 1000) / 3600).toFixed(1)),
      isThresholdTriggered: baseSpeedKmh >= 95
    };
  }

  // Pass speed
  const speedMps = durationSeconds > 0 ? distanceMeters / durationSeconds : 15;
  const speedKmh = Math.round((speedMps * 3600) / 1000);

  return {
    speedKmh: Math.min(Math.max(speedKmh, 28), 85),
    speedMps: parseFloat(speedMps.toFixed(1)),
    isThresholdTriggered: speedKmh >= 65 || distanceMeters >= 35
  };
};

export const calculateControlVsChaos = (eventsWindow = []) => {
  if (!eventsWindow || eventsWindow.length === 0) {
    return { controlPct: 72, chaosPct: 28, index: 'Controlled Positional Phase' };
  }

  let chaosScore = 0;
  eventsWindow.slice(0, 10).forEach(evt => {
    if (evt.type === 'tackle' || evt.type === 'interception') chaosScore += 8;
    if (evt.type === 'shot' || evt.type === 'goal') chaosScore += 12;
    if (evt.type === 'yellow_card' || evt.type === 'red_card') chaosScore += 18;
    if (evt.type === 'turnover') chaosScore += 10;
    if (evt.type === 'pass_sequence') chaosScore -= 5;
  });

  const chaosPct = Math.min(Math.max(Math.round(20 + chaosScore), 15), 85);
  const controlPct = 100 - chaosPct;

  return {
    controlPct,
    chaosPct,
    index: controlPct >= 65 ? 'Controlled Positional Circulation' : chaosPct >= 60 ? 'High-Intensity Chaotic Duel' : 'Contested Midfield Transition'
  };
};

export const calculatePPDA = (defensiveActions, opponentPassesInDefensiveThird) => {
  if (defensiveActions === 0) return 20.0;
  const ppda = opponentPassesInDefensiveThird / defensiveActions;
  return parseFloat(ppda.toFixed(1));
};

export class MomentumTracker {
  constructor(windowSize = 10) {
    this.windowSize = windowSize;
    this.history = [];
    this.currentScore = 0; // Negative = Alavés, Positive = Barcelona
  }

  recordEvent(event) {
    let weight = 0;
    const isBarca = event.teamId === 'barcelona' || event.team === 'Barcelona' || event.team === 'FC Barcelona';
    const multiplier = isBarca ? 1 : -1;

    switch (event.type) {
      case 'goal':
        weight = 30;
        break;
      case 'shot':
      case 'shot_saved':
      case 'shot_woodwork':
        weight = 10 + (event.xg || event.metrics?.xG || 0.1) * 15;
        break;
      case 'penalty_awarded':
        weight = 22;
        break;
      case 'tackle':
      case 'interception':
        weight = 5;
        break;
      case 'pass_sequence':
        weight = 4;
        break;
      case 'corner':
        weight = 6;
        break;
      default:
        weight = 2;
    }

    const value = weight * multiplier;
    this.history.push({
      minute: event.minute,
      second: event.second,
      value,
      team: isBarca ? 'Barcelona' : 'Alavés'
    });

    if (this.history.length > this.windowSize) {
      this.history.shift();
    }

    const sum = this.history.reduce((acc, curr) => acc + curr.value, 0);
    this.currentScore = Math.max(Math.min(Math.round(sum), 100), -100);
    return this.currentScore;
  }

  getCurrentMomentum() {
    return {
      score: this.currentScore,
      dominantTeam: this.currentScore > 10 ? 'Barcelona' : this.currentScore < -10 ? 'Alavés' : 'Neutral',
      intensity: Math.abs(this.currentScore)
    };
  }
}
