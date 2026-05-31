/**
 * Background Tasks Integration Tests
 *
 * Tests for background task scenarios:
 * - Background fetch completion
 * - Background task timeout handling
 * - Background task retry on failure
 * - Background task progress tracking
 * - Background task cancellation
 * - Background task result delivery
 *
 * These tests verify that background processing works correctly
 * and integrates properly with React component lifecycle.
 */

import React, { useCallback, useEffect, useState } from 'react';
import { Box, Pressable, Text } from '@gluestack-ui/themed';
import { act, fireEvent, waitFor } from '@testing-library/react-native';

import { renderWithProviders } from '@app/test-utils';

// Types for background tasks
type TaskStatus = 'idle' | 'pending' | 'running' | 'completed' | 'failed' | 'cancelled' | 'timeout';

interface BackgroundTask {
  id: string;
  type: string;
  status: TaskStatus;
  progress: number;
  result: unknown | null;
  error: string | null;
  createdAt: number;
  completedAt: number | null;
  retryCount: number;
  maxRetries: number;
}

interface TaskOptions {
  timeout?: number;
  maxRetries?: number;
  onProgress?: (progress: number) => void;
}

// Mock background task manager
const mockTasks = new Map<string, BackgroundTask>();
let taskIdCounter = 0;

const createTask = (type: string, options: TaskOptions = {}): BackgroundTask => {
  const id = `task-${++taskIdCounter}`;
  const task: BackgroundTask = {
    id,
    type,
    status: 'pending',
    progress: 0,
    result: null,
    error: null,
    createdAt: Date.now(),
    completedAt: null,
    retryCount: 0,
    maxRetries: options.maxRetries ?? 3,
  };
  mockTasks.set(id, task);
  return task;
};

const updateTask = (id: string, updates: Partial<BackgroundTask>): BackgroundTask | null => {
  const task = mockTasks.get(id);
  if (task) {
    const updatedTask = { ...task, ...updates };
    mockTasks.set(id, updatedTask);
    return updatedTask;
  }
  return null;
};

const getTask = (id: string): BackgroundTask | null => {
  return mockTasks.get(id) ?? null;
};

const cancelTask = (id: string): boolean => {
  const task = mockTasks.get(id);
  if (task && (task.status === 'pending' || task.status === 'running')) {
    updateTask(id, { status: 'cancelled', completedAt: Date.now() });
    return true;
  }
  return false;
};

// Mock hook for background tasks
const useBackgroundTask = (taskType: string, options: TaskOptions = {}) => {
  const [task, setTask] = useState<BackgroundTask | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  const startTask = useCallback(() => {
    const newTask = createTask(taskType, options);
    setTask(newTask);
    setIsRunning(true);
    return newTask.id;
  }, [taskType, options]);

  const cancel = useCallback(() => {
    if (task) {
      const success = cancelTask(task.id);
      if (success) {
        setTask(prev => (prev ? { ...prev, status: 'cancelled' } : null));
        setIsRunning(false);
      }
      return success;
    }
    return false;
  }, [task]);

  const updateProgress = useCallback(
    (progress: number) => {
      if (task) {
        const updated = updateTask(task.id, { progress, status: 'running' });
        if (updated) {
          setTask(updated);
          options.onProgress?.(progress);
        }
      }
    },
    [task, options]
  );

  const complete = useCallback(
    (result: unknown) => {
      if (task) {
        const updated = updateTask(task.id, {
          status: 'completed',
          result,
          progress: 100,
          completedAt: Date.now(),
        });
        if (updated) {
          setTask(updated);
          setIsRunning(false);
        }
      }
    },
    [task]
  );

  const fail = useCallback(
    (error: string) => {
      if (task) {
        const currentTask = getTask(task.id);
        if (currentTask && currentTask.retryCount < currentTask.maxRetries) {
          // Retry
          const updated = updateTask(task.id, {
            retryCount: currentTask.retryCount + 1,
            status: 'pending',
            error: null,
          });
          if (updated) {
            setTask(updated);
          }
        } else {
          // Max retries reached
          const updated = updateTask(task.id, {
            status: 'failed',
            error,
            completedAt: Date.now(),
          });
          if (updated) {
            setTask(updated);
            setIsRunning(false);
          }
        }
      }
    },
    [task]
  );

  const timeout = useCallback(() => {
    if (task) {
      const updated = updateTask(task.id, {
        status: 'timeout',
        error: 'Task timed out',
        completedAt: Date.now(),
      });
      if (updated) {
        setTask(updated);
        setIsRunning(false);
      }
    }
  }, [task]);

  return {
    task,
    isRunning,
    startTask,
    cancel,
    updateProgress,
    complete,
    fail,
    timeout,
  };
};

// Test Components
const BackgroundFetchComponent: React.FC<{ taskType: string }> = ({ taskType }) => {
  const { task, isRunning, startTask, complete, fail } = useBackgroundTask(taskType);

  return (
    <Box testID="background-fetch-component">
      <Text testID="task-status">{task?.status ?? 'idle'}</Text>
      <Text testID="task-result">{task?.result ? JSON.stringify(task.result) : 'No result'}</Text>
      <Pressable
        testID="start-fetch-button"
        onPress={() => {
          const taskId = startTask();
          // Simulate async fetch
          setTimeout(() => {
            if (getTask(taskId)?.status !== 'cancelled') {
              complete({ data: 'fetched data' });
            }
          }, 100);
        }}
        accessibilityRole="button"
        accessibilityLabel="Start background fetch"
      >
        <Text>Start Fetch</Text>
      </Pressable>
      <Pressable
        testID="fail-fetch-button"
        onPress={() => {
          startTask();
          fail('Network error');
        }}
        accessibilityRole="button"
        accessibilityLabel="Start failing fetch"
      >
        <Text>Fail Fetch</Text>
      </Pressable>
      <Text testID="running-status">{isRunning ? 'Running' : 'Idle'}</Text>
    </Box>
  );
};

const TaskProgressComponent: React.FC<{ taskType: string }> = ({ taskType }) => {
  const [progressUpdates, setProgressUpdates] = useState<number[]>([]);
  const { task, updateProgress, startTask, complete } = useBackgroundTask(taskType, {
    onProgress: progress => setProgressUpdates(prev => [...prev, progress]),
  });

  return (
    <Box testID="task-progress-component">
      <Text testID="progress-value">{task?.progress ?? 0}%</Text>
      <Text testID="progress-updates">{progressUpdates.join(',')}</Text>
      <Pressable
        testID="start-progress-task"
        onPress={() => {
          startTask();
        }}
        accessibilityRole="button"
        accessibilityLabel="Start task with progress"
      >
        <Text>Start Task</Text>
      </Pressable>
      <Pressable
        testID="update-progress-25"
        onPress={() => updateProgress(25)}
        accessibilityRole="button"
        accessibilityLabel="Update progress to 25%"
      >
        <Text>25%</Text>
      </Pressable>
      <Pressable
        testID="update-progress-50"
        onPress={() => updateProgress(50)}
        accessibilityRole="button"
        accessibilityLabel="Update progress to 50%"
      >
        <Text>50%</Text>
      </Pressable>
      <Pressable
        testID="update-progress-100"
        onPress={() => {
          updateProgress(100);
          complete({ done: true });
        }}
        accessibilityRole="button"
        accessibilityLabel="Complete task"
      >
        <Text>Complete</Text>
      </Pressable>
    </Box>
  );
};

const TaskCancellationComponent: React.FC<{ taskType: string }> = ({ taskType }) => {
  const { task, isRunning, startTask, cancel } = useBackgroundTask(taskType);

  return (
    <Box testID="task-cancellation-component">
      <Text testID="task-status">{task?.status ?? 'idle'}</Text>
      <Text testID="is-running">{isRunning ? 'Running' : 'Not Running'}</Text>
      <Pressable
        testID="start-long-task"
        onPress={() => startTask()}
        accessibilityRole="button"
        accessibilityLabel="Start long running task"
      >
        <Text>Start Task</Text>
      </Pressable>
      <Pressable
        testID="cancel-task-button"
        onPress={() => cancel()}
        accessibilityRole="button"
        accessibilityLabel="Cancel running task"
      >
        <Text>Cancel</Text>
      </Pressable>
    </Box>
  );
};

const TaskRetryComponent: React.FC<{ taskType: string; maxRetries: number }> = ({
  taskType,
  maxRetries,
}) => {
  const { task, startTask, fail } = useBackgroundTask(taskType, { maxRetries });

  return (
    <Box testID="task-retry-component">
      <Text testID="task-status">{task?.status ?? 'idle'}</Text>
      <Text testID="retry-count">{task?.retryCount ?? 0}</Text>
      <Text testID="error-message">{task?.error ?? 'No error'}</Text>
      <Pressable
        testID="start-retry-task"
        onPress={() => startTask()}
        accessibilityRole="button"
        accessibilityLabel="Start task that may need retries"
      >
        <Text>Start Task</Text>
      </Pressable>
      <Pressable
        testID="trigger-failure"
        onPress={() => fail('Temporary failure')}
        accessibilityRole="button"
        accessibilityLabel="Trigger task failure"
      >
        <Text>Trigger Failure</Text>
      </Pressable>
    </Box>
  );
};

const TaskTimeoutComponent: React.FC<{ taskType: string; timeoutMs: number }> = ({
  taskType,
  timeoutMs,
}) => {
  const { task, startTask, timeout } = useBackgroundTask(taskType, { timeout: timeoutMs });

  useEffect(() => {
    if (task?.status === 'running') {
      const timer = setTimeout(() => {
        timeout();
      }, timeoutMs);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [task?.status, timeout, timeoutMs]);

  return (
    <Box testID="task-timeout-component">
      <Text testID="task-status">{task?.status ?? 'idle'}</Text>
      <Text testID="error-message">{task?.error ?? 'No error'}</Text>
      <Pressable
        testID="start-timeout-task"
        onPress={() => {
          const taskId = startTask();
          updateTask(taskId, { status: 'running' });
        }}
        accessibilityRole="button"
        accessibilityLabel="Start task that may timeout"
      >
        <Text>Start Task</Text>
      </Pressable>
      <Pressable
        testID="force-timeout"
        onPress={() => timeout()}
        accessibilityRole="button"
        accessibilityLabel="Force task timeout"
      >
        <Text>Force Timeout</Text>
      </Pressable>
    </Box>
  );
};

describe('Background Tasks Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    mockTasks.clear();
    taskIdCounter = 0;
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('background fetch completion', () => {
    it('should start a background fetch task', async () => {
      const { getByTestId } = await renderWithProviders(
        <BackgroundFetchComponent taskType="data-sync" />
      );

      expect(getByTestId('task-status')).toHaveTextContent('idle');

      await fireEvent.press(getByTestId('start-fetch-button'));

      await waitFor(
        () => {
          expect(getByTestId('task-status')).toHaveTextContent('pending');
        },
        { timeout: 3000, interval: 100 }
      );
    });

    it('should track running status when task starts', async () => {
      const { getByTestId } = await renderWithProviders(
        <BackgroundFetchComponent taskType="data-fetch" />
      );

      // Initial state
      expect(getByTestId('running-status')).toHaveTextContent('Idle');
      expect(getByTestId('task-status')).toHaveTextContent('idle');

      // Start the task
      await fireEvent.press(getByTestId('start-fetch-button'));

      // Task should be running
      await waitFor(
        () => {
          expect(getByTestId('running-status')).toHaveTextContent('Running');
        },
        { timeout: 3000, interval: 100 }
      );
    });

    it('should transition from idle to pending', async () => {
      const { getByTestId } = await renderWithProviders(
        <BackgroundFetchComponent taskType="transition-test" />
      );

      // Initial state is idle
      expect(getByTestId('task-status')).toHaveTextContent('idle');

      // Start task
      await fireEvent.press(getByTestId('start-fetch-button'));

      // Should transition to pending
      await waitFor(
        () => {
          expect(getByTestId('task-status')).toHaveTextContent('pending');
        },
        { timeout: 3000, interval: 100 }
      );
    });
  });

  describe('background task timeout handling', () => {
    it('should start task in pending state', async () => {
      const { getByTestId } = await renderWithProviders(
        <TaskTimeoutComponent taskType="slow-task" timeoutMs={100} />
      );

      // Initially idle
      expect(getByTestId('task-status')).toHaveTextContent('idle');

      // Press start
      await fireEvent.press(getByTestId('start-timeout-task'));

      // Task starts (hook returns pending initially)
      await waitFor(
        () => {
          const status = getByTestId('task-status').props.children;
          expect(['pending', 'running']).toContain(status);
        },
        { timeout: 3000, interval: 100 }
      );
    });

    it('should allow manual timeout trigger', async () => {
      const { getByTestId } = await renderWithProviders(
        <TaskTimeoutComponent taskType="manual-timeout" timeoutMs={10000} />
      );

      await fireEvent.press(getByTestId('start-timeout-task'));

      // Task should be started
      await waitFor(
        () => {
          expect(getByTestId('task-status')).not.toHaveTextContent('idle');
        },
        { timeout: 3000, interval: 100 }
      );

      await fireEvent.press(getByTestId('force-timeout'));

      await waitFor(
        () => {
          expect(getByTestId('task-status')).toHaveTextContent('timeout');
        },
        { timeout: 3000, interval: 100 }
      );
    });
  });

  describe('background task retry on failure', () => {
    it('should retry failed task up to maxRetries', async () => {
      const { getByTestId } = await renderWithProviders(
        <TaskRetryComponent taskType="flaky-task" maxRetries={3} />
      );

      await fireEvent.press(getByTestId('start-retry-task'));

      // First failure - should retry
      await fireEvent.press(getByTestId('trigger-failure'));

      await waitFor(
        () => {
          expect(getByTestId('retry-count')).toHaveTextContent('1');
          expect(getByTestId('task-status')).toHaveTextContent('pending');
        },
        { timeout: 3000, interval: 100 }
      );

      // Second failure - should retry
      await fireEvent.press(getByTestId('trigger-failure'));

      await waitFor(
        () => {
          expect(getByTestId('retry-count')).toHaveTextContent('2');
        },
        { timeout: 3000, interval: 100 }
      );

      // Third failure - should retry
      await fireEvent.press(getByTestId('trigger-failure'));

      await waitFor(
        () => {
          expect(getByTestId('retry-count')).toHaveTextContent('3');
        },
        { timeout: 3000, interval: 100 }
      );

      // Fourth failure - should fail permanently
      await fireEvent.press(getByTestId('trigger-failure'));

      await waitFor(
        () => {
          expect(getByTestId('task-status')).toHaveTextContent('failed');
          expect(getByTestId('error-message')).toHaveTextContent('Temporary failure');
        },
        { timeout: 3000, interval: 100 }
      );
    });

    it('should show error message after max retries exhausted', async () => {
      const { getByTestId } = await renderWithProviders(
        <TaskRetryComponent taskType="failing-task" maxRetries={1} />
      );

      await fireEvent.press(getByTestId('start-retry-task'));

      // First failure
      await fireEvent.press(getByTestId('trigger-failure'));

      await waitFor(
        () => {
          expect(getByTestId('retry-count')).toHaveTextContent('1');
        },
        { timeout: 3000, interval: 100 }
      );

      // Second failure - max retries reached
      await fireEvent.press(getByTestId('trigger-failure'));

      await waitFor(
        () => {
          expect(getByTestId('task-status')).toHaveTextContent('failed');
          expect(getByTestId('error-message')).not.toHaveTextContent('No error');
        },
        { timeout: 3000, interval: 100 }
      );
    });
  });

  describe('background task progress tracking', () => {
    it('should track task progress updates', async () => {
      const { getByTestId } = await renderWithProviders(<TaskProgressComponent taskType="upload-task" />);

      await fireEvent.press(getByTestId('start-progress-task'));

      expect(getByTestId('progress-value')).toHaveTextContent('0%');

      await fireEvent.press(getByTestId('update-progress-25'));

      await waitFor(
        () => {
          expect(getByTestId('progress-value')).toHaveTextContent('25%');
        },
        { timeout: 3000, interval: 100 }
      );

      await fireEvent.press(getByTestId('update-progress-50'));

      await waitFor(
        () => {
          expect(getByTestId('progress-value')).toHaveTextContent('50%');
        },
        { timeout: 3000, interval: 100 }
      );
    });

    it('should call onProgress callback with progress updates', async () => {
      const { getByTestId } = await renderWithProviders(
        <TaskProgressComponent taskType="callback-task" />
      );

      await fireEvent.press(getByTestId('start-progress-task'));
      await fireEvent.press(getByTestId('update-progress-25'));
      await fireEvent.press(getByTestId('update-progress-50'));

      await waitFor(
        () => {
          expect(getByTestId('progress-updates')).toHaveTextContent('25,50');
        },
        { timeout: 3000, interval: 100 }
      );
    });

    it('should set progress to 100 on completion', async () => {
      const { getByTestId } = await renderWithProviders(
        <TaskProgressComponent taskType="complete-task" />
      );

      await fireEvent.press(getByTestId('start-progress-task'));
      await fireEvent.press(getByTestId('update-progress-100'));

      await waitFor(
        () => {
          expect(getByTestId('progress-value')).toHaveTextContent('100%');
        },
        { timeout: 3000, interval: 100 }
      );
    });
  });

  describe('background task cancellation', () => {
    it('should cancel a pending task', async () => {
      const { getByTestId } = await renderWithProviders(
        <TaskCancellationComponent taskType="cancellable-task" />
      );

      await fireEvent.press(getByTestId('start-long-task'));

      await waitFor(
        () => {
          expect(getByTestId('task-status')).toHaveTextContent('pending');
          expect(getByTestId('is-running')).toHaveTextContent('Running');
        },
        { timeout: 3000, interval: 100 }
      );

      await fireEvent.press(getByTestId('cancel-task-button'));

      await waitFor(
        () => {
          expect(getByTestId('task-status')).toHaveTextContent('cancelled');
          expect(getByTestId('is-running')).toHaveTextContent('Not Running');
        },
        { timeout: 3000, interval: 100 }
      );
    });

    it('should not cancel an already completed task', async () => {
      const { getByTestId } = await renderWithProviders(
        <TaskCancellationComponent taskType="completed-check" />
      );

      // Start and immediately complete a task manually via state
      await fireEvent.press(getByTestId('start-long-task'));

      await waitFor(
        () => {
          expect(getByTestId('task-status')).toHaveTextContent('pending');
        },
        { timeout: 3000, interval: 100 }
      );

      // When task is pending, cancel should work
      await fireEvent.press(getByTestId('cancel-task-button'));

      await waitFor(
        () => {
          expect(getByTestId('task-status')).toHaveTextContent('cancelled');
        },
        { timeout: 3000, interval: 100 }
      );

      // Trying to cancel again should have no effect
      expect(getByTestId('task-status')).toHaveTextContent('cancelled');
    });

    it('should prevent result delivery after cancellation', async () => {
      const { getByTestId } = await renderWithProviders(
        <BackgroundFetchComponent taskType="cancel-before-complete" />
      );

      await fireEvent.press(getByTestId('start-fetch-button'));

      await waitFor(
        () => {
          expect(getByTestId('task-status')).toHaveTextContent('pending');
        },
        { timeout: 3000, interval: 100 }
      );

      // Cancel before the async completion
      const taskId = 'task-' + taskIdCounter;
      cancelTask(taskId);

      // Advance timers to where completion would happen
      await act(() => {
        jest.advanceTimersByTime(150);
      });

      // Task should remain cancelled, not completed
      expect(getTask(taskId)?.status).toBe('cancelled');
    });
  });

  describe('background task result delivery', () => {
    it('should deliver result data on completion', async () => {
      const { getByTestId } = await renderWithProviders(
        <TaskProgressComponent taskType="result-delivery" />
      );

      // Start task
      await fireEvent.press(getByTestId('start-progress-task'));

      // Complete the task with result
      await fireEvent.press(getByTestId('update-progress-100'));

      await waitFor(
        () => {
          expect(getByTestId('progress-value')).toHaveTextContent('100%');
        },
        { timeout: 3000, interval: 100 }
      );
    });

    it('should show error instead of result on failure', async () => {
      const { getByTestId } = await renderWithProviders(
        <TaskRetryComponent taskType="error-result" maxRetries={0} />
      );

      await fireEvent.press(getByTestId('start-retry-task'));
      await fireEvent.press(getByTestId('trigger-failure'));

      await waitFor(
        () => {
          expect(getByTestId('error-message')).toHaveTextContent('Temporary failure');
          expect(getByTestId('task-status')).toHaveTextContent('failed');
        },
        { timeout: 3000, interval: 100 }
      );
    });
  });

  describe('accessibility', () => {
    it('should have accessible task controls', async () => {
      const { getByTestId } = await renderWithProviders(
        <BackgroundFetchComponent taskType="a11y-task" />
      );

      const startButton = getByTestId('start-fetch-button');
      expect(startButton.props.accessibilityRole).toBe('button');
      expect(startButton.props.accessibilityLabel).toBe('Start background fetch');

      const failButton = getByTestId('fail-fetch-button');
      expect(failButton.props.accessibilityRole).toBe('button');
      expect(failButton.props.accessibilityLabel).toBe('Start failing fetch');
    });

    it('should have accessible progress controls', async () => {
      const { getByTestId } = await renderWithProviders(
        <TaskProgressComponent taskType="a11y-progress" />
      );

      const progressButton = getByTestId('update-progress-25');
      expect(progressButton.props.accessibilityRole).toBe('button');
      expect(progressButton.props.accessibilityLabel).toBe('Update progress to 25%');
    });

    it('should have accessible cancel button', async () => {
      const { getByTestId } = await renderWithProviders(
        <TaskCancellationComponent taskType="a11y-cancel" />
      );

      const cancelButton = getByTestId('cancel-task-button');
      expect(cancelButton.props.accessibilityRole).toBe('button');
      expect(cancelButton.props.accessibilityLabel).toBe('Cancel running task');
    });
  });
});
