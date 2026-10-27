import express from 'express';

export const createMatchRouter = (simulator) => {
  const router = express.Router();

  router.get('/state', (req, res) => {
    res.json({
      success: true,
      data: simulator.getCurrentState()
    });
  });

  router.post('/start', (req, res) => {
    simulator.start();
    res.json({ success: true, message: 'Simulation started', state: simulator.getCurrentState() });
  });

  router.post('/pause', (req, res) => {
    simulator.pause();
    res.json({ success: true, message: 'Simulation paused', state: simulator.getCurrentState() });
  });

  router.post('/speed', (req, res) => {
    const { speed } = req.body;
    simulator.setSpeed(speed || 1);
    res.json({ success: true, speedMultiplier: simulator.speedMultiplier });
  });

  router.post('/reset', (req, res) => {
    simulator.reset();
    res.json({ success: true, message: 'Simulation reset', state: simulator.getCurrentState() });
  });

  router.get('/events', (req, res) => {
    res.json({
      success: true,
      events: simulator.matchState.eventsHistory
    });
  });

  return router;
};
