import express from 'express';
import { generateSyntheticScenarios } from '../agents/dataAugmenter.js';
import { getInMemoryStore } from '../config/db.js';
import { SyntheticDataset } from '../models/SyntheticDataset.js';

export const datasetRouter = express.Router();

// List all generated datasets
datasetRouter.get('/', async (req, res) => {
  try {
    let datasets = [];
    if (SyntheticDataset.db?.readyState === 1) {
      datasets = await SyntheticDataset.find().sort({ createdAt: -1 });
    }
    if (datasets.length === 0) {
      datasets = getInMemoryStore().datasets;
    }
    res.json({
      success: true,
      count: datasets.length,
      datasets
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Trigger generation of synthetic play dataset
datasetRouter.post('/generate', async (req, res) => {
  try {
    const { patternType, count } = req.body;
    const batch = await generateSyntheticScenarios({
      patternType: patternType || 'Counter-Attack from Corner',
      count: count || 3
    });
    res.json({
      success: true,
      message: `Generated ${batch.scenarios?.length || 0} synthetic tactical scenarios.`,
      data: batch
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Export dataset as downloadable JSON
datasetRouter.get('/:id/export', async (req, res) => {
  try {
    const { id } = req.params;
    let dataset = null;
    if (SyntheticDataset.db?.readyState === 1) {
      dataset = await SyntheticDataset.findOne({ datasetBatchId: id });
    }
    if (!dataset) {
      dataset = getInMemoryStore().datasets.find(d => d.datasetBatchId === id);
    }

    if (!dataset) {
      return res.status(404).json({ success: false, message: 'Dataset not found' });
    }

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename=omnipitch_${id}.json`);
    res.send(JSON.stringify(dataset, null, 2));
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});
