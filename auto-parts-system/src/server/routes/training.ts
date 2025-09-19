import express from 'express';
import { DatabaseManager } from '../../lib/database';
import { AuthManager } from '../../lib/auth';
import { TrainingManager } from '../../lib/training-manager';
import { logger } from '../../lib/logger';
import { User } from '../../types';

const router = express.Router();
const databaseManager = new DatabaseManager();
const authManager = new AuthManager();
const trainingManager = new TrainingManager();

// Middleware to check authentication
const requireAuth = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const currentUser = await authManager.getCurrentUser();
    if (!currentUser) {
      return res.status(401).json({
        success: false,
        error: 'NOT_AUTHENTICATED',
        message: 'Authentication required',
        timestamp: new Date().toISOString()
      });
    }
    req.user = currentUser as User;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      error: 'AUTHENTICATION_FAILED',
      message: 'Authentication failed',
      timestamp: new Date().toISOString()
    });
  }
};

// GET /api/training/modules - Get all training modules
router.get('/modules', requireAuth, async (req, res) => {
  try {
    const currentUser = req.user;
    if (!currentUser || !authManager.hasPermission(currentUser, 'training.view')) {
      return res.status(403).json({
        success: false,
        error: 'INSUFFICIENT_PERMISSIONS',
        message: 'You do not have permission to view training modules.',
        timestamp: new Date().toISOString()
      });
    }

    const modules = await trainingManager.getTrainingModules(currentUser.id);

    res.json({
      success: true,
      data: modules,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Get training modules error:', error);
    res.status(500).json({
      success: false,
      error: 'GET_TRAINING_MODULES_FAILED',
      message: 'Failed to get training modules',
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/training/progress - Get training progress
router.get('/progress', requireAuth, async (req, res) => {
  try {
    const currentUser = req.user;
    if (!currentUser || !authManager.hasPermission(currentUser, 'training.view')) {
      return res.status(403).json({
        success: false,
        error: 'INSUFFICIENT_PERMISSIONS',
        message: 'You do not have permission to view training progress.',
        timestamp: new Date().toISOString()
      });
    }

    const progress = await trainingManager.getTrainingProgress(currentUser.id);

    res.json({
      success: true,
      data: progress,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Get training progress error:', error);
    res.status(500).json({
      success: false,
      error: 'GET_TRAINING_PROGRESS_FAILED',
      message: 'Failed to get training progress',
      timestamp: new Date().toISOString()
    });
  }
});

// POST /api/training/sessions - Start training session
router.post('/sessions', requireAuth, async (req, res) => {
  try {
    const currentUser = req.user;
    if (!currentUser || !authManager.hasPermission(currentUser, 'training.start')) {
      return res.status(403).json({
        success: false,
        error: 'INSUFFICIENT_PERMISSIONS',
        message: 'You do not have permission to start training sessions.',
        timestamp: new Date().toISOString()
      });
    }

    const { module_id } = req.body;

    if (!module_id) {
      return res.status(400).json({
        success: false,
        error: 'MISSING_REQUIRED_FIELDS',
        message: 'Module ID is required',
        timestamp: new Date().toISOString()
      });
    }

    const session = await trainingManager.startTrainingSession(currentUser.id, module_id);

    res.status(201).json({
      success: true,
      data: session,
      message: 'Training session started successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Start training session error:', error);
    res.status(500).json({
      success: false,
      error: 'START_TRAINING_SESSION_FAILED',
      message: 'Failed to start training session',
      timestamp: new Date().toISOString()
    });
  }
});

// PUT /api/training/progress - Update training progress
router.put('/progress', requireAuth, async (req, res) => {
  try {
    const currentUser = req.user;
    if (!currentUser || !authManager.hasPermission(currentUser, 'training.update')) {
      return res.status(403).json({
        success: false,
        error: 'INSUFFICIENT_PERMISSIONS',
        message: 'You do not have permission to update training progress.',
        timestamp: new Date().toISOString()
      });
    }

    const { step_id, status, time_spent_minutes, quiz_score, notes } = req.body;

    if (!step_id || !status) {
      return res.status(400).json({
        success: false,
        error: 'MISSING_REQUIRED_FIELDS',
        message: 'Step ID and status are required',
        timestamp: new Date().toISOString()
      });
    }

    const validStatuses = ['not_started', 'in_progress', 'completed', 'skipped'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'INVALID_STATUS',
        message: `Status must be one of: ${validStatuses.join(', ')}`,
        timestamp: new Date().toISOString()
      });
    }

    await trainingManager.updateTrainingProgress(
      currentUser.id,
      step_id,
      status,
      time_spent_minutes || 0,
      quiz_score,
      notes
    );

    res.json({
      success: true,
      message: 'Training progress updated successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Update training progress error:', error);
    res.status(500).json({
      success: false,
      error: 'UPDATE_TRAINING_PROGRESS_FAILED',
      message: 'Failed to update training progress',
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/training/achievements - Get training achievements
router.get('/achievements', requireAuth, async (req, res) => {
  try {
    const currentUser = req.user;
    if (!currentUser || !authManager.hasPermission(currentUser, 'training.view')) {
      return res.status(403).json({
        success: false,
        error: 'INSUFFICIENT_PERMISSIONS',
        message: 'You do not have permission to view training achievements.',
        timestamp: new Date().toISOString()
      });
    }

    const achievements = await trainingManager.getTrainingAchievements(currentUser.id);

    res.json({
      success: true,
      data: achievements,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Get training achievements error:', error);
    res.status(500).json({
      success: false,
      error: 'GET_TRAINING_ACHIEVEMENTS_FAILED',
      message: 'Failed to get training achievements',
      timestamp: new Date().toISOString()
    });
  }
});

// POST /api/training/achievements - Award training achievement
router.post('/achievements', requireAuth, async (req, res) => {
  try {
    const currentUser = req.user;
    if (!currentUser || !authManager.hasPermission(currentUser, 'training.award')) {
      return res.status(403).json({
        success: false,
        error: 'INSUFFICIENT_PERMISSIONS',
        message: 'You do not have permission to award training achievements.',
        timestamp: new Date().toISOString()
      });
    }

    const { 
      achievement_type, 
      achievement_name, 
      achievement_name_ar, 
      description, 
      description_ar 
    } = req.body;

    if (!achievement_type || !achievement_name || !achievement_name_ar || !description || !description_ar) {
      return res.status(400).json({
        success: false,
        error: 'MISSING_REQUIRED_FIELDS',
        message: 'All achievement fields are required',
        timestamp: new Date().toISOString()
      });
    }

    await trainingManager.awardAchievement(
      currentUser.id,
      achievement_type,
      achievement_name,
      achievement_name_ar,
      description,
      description_ar
    );

    res.status(201).json({
      success: true,
      message: 'Training achievement awarded successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Award training achievement error:', error);
    res.status(500).json({
      success: false,
      error: 'AWARD_TRAINING_ACHIEVEMENT_FAILED',
      message: 'Failed to award training achievement',
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/training/dashboard - Get training dashboard
router.get('/dashboard', requireAuth, async (req, res) => {
  try {
    const currentUser = req.user;
    if (!currentUser || !authManager.hasPermission(currentUser, 'training.view')) {
      return res.status(403).json({
        success: false,
        error: 'INSUFFICIENT_PERMISSIONS',
        message: 'You do not have permission to view training dashboard.',
        timestamp: new Date().toISOString()
      });
    }

    // Get comprehensive training data
    const [modules, progress, achievements] = await Promise.all([
      trainingManager.getTrainingModules(currentUser.id),
      trainingManager.getTrainingProgress(currentUser.id),
      trainingManager.getTrainingAchievements(currentUser.id)
    ]);

    // Calculate overall progress
    const totalSteps = modules.reduce((sum, module) => sum + module.steps.length, 0);
    const completedSteps = progress.filter(p => p.status === 'completed').length;
    const overallProgress = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;

    // Calculate time spent
    const totalTimeSpent = progress.reduce((sum, p) => sum + p.time_spent_minutes, 0);

    // Get recent activity
    const recentProgress = progress
      .filter(p => p.status === 'completed')
      .sort((a, b) => new Date(b.completed_at || '').getTime() - new Date(a.completed_at || '').getTime())
      .slice(0, 5);

    const dashboard = {
      overall_progress: overallProgress,
      total_steps: totalSteps,
      completed_steps: completedSteps,
      total_time_spent_minutes: totalTimeSpent,
      modules: modules.map(module => ({
        id: module.id,
        name: module.name,
        name_ar: module.name_ar,
        completion_percentage: module.completion_percentage,
        estimated_time_minutes: module.estimated_time_minutes,
        is_required: module.is_required
      })),
      recent_achievements: achievements.slice(0, 5),
      recent_progress: recentProgress,
      last_updated: new Date().toISOString()
    };

    res.json({
      success: true,
      data: dashboard,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Get training dashboard error:', error);
    res.status(500).json({
      success: false,
      error: 'GET_TRAINING_DASHBOARD_FAILED',
      message: 'Failed to get training dashboard',
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/training/step/:id - Get specific training step
router.get('/step/:id', requireAuth, async (req, res) => {
  try {
    const currentUser = req.user;
    if (!currentUser || !authManager.hasPermission(currentUser, 'training.view')) {
      return res.status(403).json({
        success: false,
        error: 'INSUFFICIENT_PERMISSIONS',
        message: 'You do not have permission to view training steps.',
        timestamp: new Date().toISOString()
      });
    }

    const stepId = req.params.id;
    const step = await databaseManager.query(
      'SELECT * FROM training_steps WHERE id = ?',
      [stepId]
    );

    if (!step || step.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'TRAINING_STEP_NOT_FOUND',
        message: 'Training step not found',
        timestamp: new Date().toISOString()
      });
    }

    // Get user's progress for this step
    const progress = await databaseManager.get(
      'SELECT * FROM training_progress WHERE user_id = ? AND step_id = ?',
      [currentUser.id, stepId]
    );

    const stepData = {
      ...step[0],
      content: JSON.parse(step[0].content),
      completion_criteria: JSON.parse(step[0].completion_criteria),
      prerequisites: JSON.parse(step[0].prerequisites || '[]'),
      user_progress: progress || null
    };

    res.json({
      success: true,
      data: stepData,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Get training step error:', error);
    res.status(500).json({
      success: false,
      error: 'GET_TRAINING_STEP_FAILED',
      message: 'Failed to get training step',
      timestamp: new Date().toISOString()
    });
  }
});

// POST /api/training/quiz/submit - Submit quiz answers
router.post('/quiz/submit', requireAuth, async (req, res) => {
  try {
    const currentUser = req.user;
    if (!currentUser || !authManager.hasPermission(currentUser, 'training.update')) {
      return res.status(403).json({
        success: false,
        error: 'INSUFFICIENT_PERMISSIONS',
        message: 'You do not have permission to submit quiz answers.',
        timestamp: new Date().toISOString()
      });
    }

    const { step_id, answers } = req.body;

    if (!step_id || !answers) {
      return res.status(400).json({
        success: false,
        error: 'MISSING_REQUIRED_FIELDS',
        message: 'Step ID and answers are required',
        timestamp: new Date().toISOString()
      });
    }

    // Get the training step
    const step = await databaseManager.get(
      'SELECT * FROM training_steps WHERE id = ?',
      [step_id]
    );

    if (!step) {
      return res.status(404).json({
        success: false,
        error: 'TRAINING_STEP_NOT_FOUND',
        message: 'Training step not found',
        timestamp: new Date().toISOString()
      });
    }

    const stepContent = JSON.parse(step.content);
    const questions = stepContent.quiz_questions || [];

    // Calculate score
    let correctAnswers = 0;
    const results = [];

    for (const question of questions) {
      const userAnswer = answers[question.id];
      let isCorrect = false;

      if (question.type === 'multiple_choice') {
        const correctOption = question.options?.find((opt: any) => opt.is_correct);
        isCorrect = userAnswer === correctOption?.id;
      } else if (question.type === 'true_false') {
        isCorrect = userAnswer === question.correct_answer;
      } else if (question.type === 'text') {
        // For text questions, we'll consider them correct for now
        // In a real implementation, you might want more sophisticated text matching
        isCorrect = userAnswer && userAnswer.trim().length > 0;
      }

      if (isCorrect) {
        correctAnswers++;
      }

      results.push({
        question_id: question.id,
        user_answer: userAnswer,
        is_correct: isCorrect,
        correct_answer: question.type === 'multiple_choice' 
          ? question.options?.find((opt: any) => opt.is_correct)?.id 
          : question.correct_answer
      });
    }

    const score = Math.round((correctAnswers / questions.length) * 100);
    const passed = score >= 70; // 70% passing threshold

    // Update progress
    await trainingManager.updateTrainingProgress(
      currentUser.id,
      step_id,
      passed ? 'completed' : 'in_progress',
      0,
      score,
      `Quiz score: ${score}%`
    );

    res.json({
      success: true,
      data: {
        score,
        passed,
        correct_answers: correctAnswers,
        total_questions: questions.length,
        results
      },
      message: passed ? 'Quiz passed successfully!' : 'Quiz not passed. Please try again.',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Submit quiz error:', error);
    res.status(500).json({
      success: false,
      error: 'SUBMIT_QUIZ_FAILED',
      message: 'Failed to submit quiz answers',
      timestamp: new Date().toISOString()
    });
  }
});

export default router;
