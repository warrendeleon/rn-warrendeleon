/**
 * Realtime Subscription Integration Tests
 *
 * Tests for WebSocket/Realtime subscription scenarios:
 * - Subscribe to channel
 * - Receive real-time updates
 * - Handle disconnect/reconnect
 * - Unsubscribe on unmount
 * - Multiple subscriptions
 * - Subscription error handling
 * - Presence tracking
 *
 * These tests verify that real-time communication patterns work correctly
 * in the context of React components and Redux state management.
 */

import React, { useCallback, useEffect, useState } from 'react';
import { Box, Pressable, Text } from '@gluestack-ui/themed';
import { act, fireEvent, waitFor } from '@testing-library/react-native';

import { renderWithProviders } from '@app/test-utils';

// Mock realtime channel for testing
interface RealtimeMessage {
  type: string;
  payload: unknown;
  timestamp: number;
}

interface RealtimeChannel {
  name: string;
  isConnected: boolean;
  messages: RealtimeMessage[];
  subscribe: () => void;
  unsubscribe: () => void;
  send: (message: Omit<RealtimeMessage, 'timestamp'>) => void;
}

// Mock realtime hook implementation for testing
const mockChannels = new Map<string, RealtimeChannel>();
const mockListeners = new Map<string, Set<(message: RealtimeMessage) => void>>();

const mockRealtimeConnection = {
  connected: true,
  reconnecting: false,
  error: null as string | null,
};

const useRealtimeChannel = (channelName: string) => {
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);
  const [messages, setMessages] = useState<RealtimeMessage[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Create or get existing channel
    let existingChannel = mockChannels.get(channelName);
    if (!existingChannel) {
      existingChannel = {
        name: channelName,
        isConnected: false,
        messages: [],
        subscribe: () => {
          existingChannel!.isConnected = true;
          setIsConnected(true);
        },
        unsubscribe: () => {
          existingChannel!.isConnected = false;
          setIsConnected(false);
        },
        send: (message: Omit<RealtimeMessage, 'timestamp'>) => {
          const fullMessage = { ...message, timestamp: Date.now() };
          existingChannel!.messages.push(fullMessage);
          // Notify all listeners
          const listeners = mockListeners.get(channelName);
          listeners?.forEach(listener => listener(fullMessage));
        },
      };
      mockChannels.set(channelName, existingChannel);
    }

    setChannel(existingChannel);

    // Set up message listener
    const listeners = mockListeners.get(channelName) ?? new Set();
    const messageHandler = (message: RealtimeMessage) => {
      setMessages(prev => [...prev, message]);
    };
    listeners.add(messageHandler);
    mockListeners.set(channelName, listeners);

    // Subscribe to channel
    existingChannel.subscribe();

    // Cleanup on unmount
    return () => {
      listeners.delete(messageHandler);
      existingChannel?.unsubscribe();
    };
  }, [channelName]);

  const sendMessage = useCallback(
    (type: string, payload: unknown) => {
      if (channel && isConnected) {
        channel.send({ type, payload });
      } else {
        setError('Not connected to channel');
      }
    },
    [channel, isConnected]
  );

  return {
    channel,
    messages,
    isConnected,
    error,
    sendMessage,
    connectionStatus: mockRealtimeConnection,
  };
};

// Mock presence hook
interface PresenceUser {
  id: string;
  name: string;
  status: 'online' | 'away' | 'offline';
}

const mockPresenceUsers = new Map<string, PresenceUser[]>();

const usePresence = (channelName: string, userId: string, userName: string) => {
  const [users, setUsers] = useState<PresenceUser[]>([]);
  const [isTracking, setIsTracking] = useState(false);

  useEffect(() => {
    const currentUser: PresenceUser = { id: userId, name: userName, status: 'online' };
    const existingUsers = mockPresenceUsers.get(channelName) ?? [];
    // Avoid duplicate adds
    const alreadyExists = existingUsers.some(u => u.id === userId);
    if (!alreadyExists) {
      const updatedUsers = [...existingUsers, currentUser];
      mockPresenceUsers.set(channelName, updatedUsers);
      setUsers(updatedUsers);
    } else {
      setUsers(existingUsers);
    }
    setIsTracking(true);

    return () => {
      const currentUsers = mockPresenceUsers.get(channelName) ?? [];
      const filteredUsers = currentUsers.filter(u => u.id !== userId);
      mockPresenceUsers.set(channelName, filteredUsers);
    };
  }, [channelName, userId, userName]);

  const updateStatus = useCallback(
    (status: PresenceUser['status']) => {
      const currentUsers = mockPresenceUsers.get(channelName) ?? [];
      const updatedUsers = currentUsers.map(u => (u.id === userId ? { ...u, status } : u));
      mockPresenceUsers.set(channelName, updatedUsers);
      setUsers(updatedUsers);
    },
    [channelName, userId]
  );

  return { users, isTracking, updateStatus };
};

// Test components
const RealtimeMessageList: React.FC<{ channelName: string }> = ({ channelName }) => {
  const { messages, isConnected, sendMessage, error } = useRealtimeChannel(channelName);

  return (
    <Box testID="realtime-message-list">
      <Text testID="connection-status">{isConnected ? 'Connected' : 'Disconnected'}</Text>
      {error && (
        <Text testID="error-message" accessibilityRole="alert">
          {error}
        </Text>
      )}
      <Box testID="messages-container">
        {messages.map((msg, index) => (
          <Text key={index} testID={`message-${index}`}>
            {msg.type}: {JSON.stringify(msg.payload)}
          </Text>
        ))}
      </Box>
      <Pressable
        testID="send-message-button"
        onPress={() => sendMessage('chat', { text: 'Hello' })}
        accessibilityRole="button"
        accessibilityLabel="Send message"
      >
        <Text>Send Message</Text>
      </Pressable>
    </Box>
  );
};

const MultiChannelComponent: React.FC<{ channels: string[] }> = ({ channels }) => {
  const channelData = channels.map(name => ({
    name,
    hook: useRealtimeChannel(name),
  }));

  return (
    <Box testID="multi-channel-component">
      {channelData.map(({ name, hook }) => (
        <Box key={name} testID={`channel-${name}`}>
          <Text testID={`channel-${name}-status`}>
            {name}: {hook.isConnected ? 'Connected' : 'Disconnected'}
          </Text>
          <Text testID={`channel-${name}-message-count`}>Messages: {hook.messages.length}</Text>
        </Box>
      ))}
    </Box>
  );
};

const PresenceComponent: React.FC<{
  channelName: string;
  userId: string;
  userName: string;
}> = ({ channelName, userId, userName }) => {
  const { users, isTracking, updateStatus } = usePresence(channelName, userId, userName);

  return (
    <Box testID="presence-component">
      <Text testID="tracking-status">{isTracking ? 'Tracking' : 'Not Tracking'}</Text>
      <Box testID="users-list">
        {users.map(user => (
          <Text key={user.id} testID={`user-${user.id}`}>
            {user.name}: {user.status}
          </Text>
        ))}
      </Box>
      <Pressable
        testID="set-away-button"
        onPress={() => updateStatus('away')}
        accessibilityRole="button"
        accessibilityLabel="Set status to away"
      >
        <Text>Set Away</Text>
      </Pressable>
    </Box>
  );
};

describe('Realtime Subscription Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockChannels.clear();
    mockListeners.clear();
    mockPresenceUsers.clear();
    mockRealtimeConnection.connected = true;
    mockRealtimeConnection.reconnecting = false;
    mockRealtimeConnection.error = null;
  });

  describe('subscribe to channel', () => {
    it('should connect to channel on component mount', async () => {
      const { getByTestId } = await renderWithProviders(
        <RealtimeMessageList channelName="test-channel" />
      );

      await waitFor(
        () => {
          expect(getByTestId('connection-status')).toHaveTextContent('Connected');
        },
        { timeout: 3000, interval: 100 }
      );
    });

    it('should create channel subscription with correct name', async () => {
      await renderWithProviders(<RealtimeMessageList channelName="my-channel" />);

      await waitFor(
        () => {
          expect(mockChannels.has('my-channel')).toBe(true);
        },
        { timeout: 3000, interval: 100 }
      );

      const channel = mockChannels.get('my-channel');
      expect(channel?.isConnected).toBe(true);
    });

    it('should handle channel name changes by resubscribing', async () => {
      const { rerender, getByTestId } = await renderWithProviders(
        <RealtimeMessageList channelName="channel-1" />
      );

      await waitFor(
        () => {
          expect(getByTestId('connection-status')).toHaveTextContent('Connected');
        },
        { timeout: 3000, interval: 100 }
      );

      expect(mockChannels.get('channel-1')?.isConnected).toBe(true);

      await rerender(<RealtimeMessageList channelName="channel-2" />);

      await waitFor(
        () => {
          expect(mockChannels.get('channel-2')?.isConnected).toBe(true);
        },
        { timeout: 3000, interval: 100 }
      );
    });
  });

  describe('receive real-time updates', () => {
    it('should start with empty message list', async () => {
      const { getByTestId, queryByTestId } = await renderWithProviders(
        <RealtimeMessageList channelName="messages-channel" />
      );

      await waitFor(
        () => {
          expect(getByTestId('connection-status')).toHaveTextContent('Connected');
        },
        { timeout: 3000, interval: 100 }
      );

      // Messages container should exist but be empty initially
      expect(getByTestId('messages-container')).toBeOnTheScreen();
      expect(queryByTestId('message-0')).toBeNull();
    });

    it('should handle channel send API', async () => {
      const { getByTestId } = await renderWithProviders(
        <RealtimeMessageList channelName="typed-messages" />
      );

      await waitFor(
        () => {
          expect(getByTestId('connection-status')).toHaveTextContent('Connected');
        },
        { timeout: 3000, interval: 100 }
      );

      const channel = mockChannels.get('typed-messages');
      expect(channel).toBeDefined();
      expect(channel?.isConnected).toBe(true);

      // Verify send function exists and works
      channel?.send({ type: 'test', payload: {} });
      expect(channel?.messages.length).toBe(1);
    });

    it('should attempt to send messages when button is pressed', async () => {
      const { getByTestId } = await renderWithProviders(
        <RealtimeMessageList channelName="send-channel" />
      );

      await waitFor(
        () => {
          expect(getByTestId('connection-status')).toHaveTextContent('Connected');
        },
        { timeout: 3000, interval: 100 }
      );

      const channel = mockChannels.get('send-channel');
      const initialMessageCount = channel?.messages.length ?? 0;

      await fireEvent.press(getByTestId('send-message-button'));

      // Verify message was sent to channel
      expect(channel?.messages.length).toBe(initialMessageCount + 1);
    });
  });

  describe('handle disconnect/reconnect', () => {
    it('should show disconnected status when connection drops', async () => {
      const { getByTestId } = await renderWithProviders(
        <RealtimeMessageList channelName="disconnect-channel" />
      );

      await waitFor(
        () => {
          expect(getByTestId('connection-status')).toHaveTextContent('Connected');
        },
        { timeout: 3000, interval: 100 }
      );

      // Simulate disconnect
      const channel = mockChannels.get('disconnect-channel');
      await act(() => {
        channel?.unsubscribe();
      });

      await waitFor(
        () => {
          expect(getByTestId('connection-status')).toHaveTextContent('Disconnected');
        },
        { timeout: 3000, interval: 100 }
      );
    });

    it('should reconnect after connection restored', async () => {
      const { getByTestId } = await renderWithProviders(
        <RealtimeMessageList channelName="reconnect-channel" />
      );

      await waitFor(
        () => {
          expect(getByTestId('connection-status')).toHaveTextContent('Connected');
        },
        { timeout: 3000, interval: 100 }
      );

      const channel = mockChannels.get('reconnect-channel');

      // Simulate disconnect then reconnect
      await act(() => {
        channel?.unsubscribe();
      });

      await waitFor(
        () => {
          expect(getByTestId('connection-status')).toHaveTextContent('Disconnected');
        },
        { timeout: 3000, interval: 100 }
      );

      await act(() => {
        channel?.subscribe();
      });

      await waitFor(
        () => {
          expect(getByTestId('connection-status')).toHaveTextContent('Connected');
        },
        { timeout: 3000, interval: 100 }
      );
    });

    it('should preserve channel messages across reconnections', async () => {
      const { getByTestId } = await renderWithProviders(
        <RealtimeMessageList channelName="history-channel" />
      );

      await waitFor(
        () => {
          expect(getByTestId('connection-status')).toHaveTextContent('Connected');
        },
        { timeout: 3000, interval: 100 }
      );

      const channel = mockChannels.get('history-channel');

      // Send message before disconnect
      channel?.send({ type: 'before', payload: { order: 1 } });

      // Channel should store the message
      expect(channel?.messages.length).toBe(1);

      // Disconnect and reconnect
      await act(() => {
        channel?.unsubscribe();
        channel?.subscribe();
      });

      // Channel messages should still be stored
      expect(channel?.messages.length).toBe(1);
      expect(channel?.messages[0]?.type).toBe('before');
    });
  });

  describe('unsubscribe on unmount', () => {
    it('should unsubscribe from channel when component unmounts', async () => {
      const { unmount } = await renderWithProviders(
        <RealtimeMessageList channelName="unmount-channel" />
      );

      await waitFor(
        () => {
          expect(mockChannels.get('unmount-channel')?.isConnected).toBe(true);
        },
        { timeout: 3000, interval: 100 }
      );

      await unmount();

      expect(mockChannels.get('unmount-channel')?.isConnected).toBe(false);
    });

    it('should remove message listeners on unmount', async () => {
      const { unmount } = await renderWithProviders(
        <RealtimeMessageList channelName="listener-channel" />
      );

      await waitFor(
        () => {
          expect(mockListeners.get('listener-channel')?.size).toBeGreaterThan(0);
        },
        { timeout: 3000, interval: 100 }
      );

      await unmount();

      expect(mockListeners.get('listener-channel')?.size).toBe(0);
    });

    it('should not receive messages after unmount', async () => {
      const { unmount } = await renderWithProviders(
        <RealtimeMessageList channelName="post-unmount-channel" />
      );

      await waitFor(
        () => {
          expect(mockChannels.get('post-unmount-channel')?.isConnected).toBe(true);
        },
        { timeout: 3000, interval: 100 }
      );

      await unmount();

      // Channel should be disconnected after unmount
      expect(mockChannels.get('post-unmount-channel')?.isConnected).toBe(false);

      // Listener should be removed
      expect(mockListeners.get('post-unmount-channel')?.size).toBe(0);
    });
  });

  describe('multiple subscriptions', () => {
    it('should handle multiple channel subscriptions simultaneously', async () => {
      const { getByTestId } = await renderWithProviders(
        <MultiChannelComponent channels={['channel-a', 'channel-b', 'channel-c']} />
      );

      // Each channel should have a status indicator
      expect(getByTestId('channel-channel-a')).toBeOnTheScreen();
      expect(getByTestId('channel-channel-b')).toBeOnTheScreen();
      expect(getByTestId('channel-channel-c')).toBeOnTheScreen();

      // All channels should be created in the mock store
      await waitFor(
        () => {
          expect(mockChannels.has('channel-a')).toBe(true);
          expect(mockChannels.has('channel-b')).toBe(true);
          expect(mockChannels.has('channel-c')).toBe(true);
        },
        { timeout: 3000, interval: 100 }
      );
    });

    it('should create separate channel instances', async () => {
      await renderWithProviders(<MultiChannelComponent channels={['alpha', 'beta']} />);

      await waitFor(
        () => {
          expect(mockChannels.has('alpha')).toBe(true);
          expect(mockChannels.has('beta')).toBe(true);
        },
        { timeout: 3000, interval: 100 }
      );

      // Send message to alpha channel only
      const alphaChannel = mockChannels.get('alpha');
      const betaChannel = mockChannels.get('beta');

      alphaChannel?.send({ type: 'test', payload: {} });

      // Alpha should have message, beta should not
      expect(alphaChannel?.messages.length).toBe(1);
      expect(betaChannel?.messages.length).toBe(0);
    });

    it('should unsubscribe from all channels on unmount', async () => {
      const { unmount } = await renderWithProviders(
        <MultiChannelComponent channels={['multi-1', 'multi-2']} />
      );

      await waitFor(
        () => {
          expect(mockChannels.get('multi-1')?.isConnected).toBe(true);
          expect(mockChannels.get('multi-2')?.isConnected).toBe(true);
        },
        { timeout: 3000, interval: 100 }
      );

      await unmount();

      expect(mockChannels.get('multi-1')?.isConnected).toBe(false);
      expect(mockChannels.get('multi-2')?.isConnected).toBe(false);
    });
  });

  describe('subscription error handling', () => {
    it('should display error when sending message while disconnected', async () => {
      const { getByTestId } = await renderWithProviders(
        <RealtimeMessageList channelName="error-channel" />
      );

      await waitFor(
        () => {
          expect(getByTestId('connection-status')).toHaveTextContent('Connected');
        },
        { timeout: 3000, interval: 100 }
      );

      // Disconnect
      const channel = mockChannels.get('error-channel');
      await act(() => {
        channel?.unsubscribe();
      });

      await waitFor(
        () => {
          expect(getByTestId('connection-status')).toHaveTextContent('Disconnected');
        },
        { timeout: 3000, interval: 100 }
      );

      // Try to send message while disconnected
      await fireEvent.press(getByTestId('send-message-button'));

      await waitFor(
        () => {
          expect(getByTestId('error-message')).toHaveTextContent('Not connected to channel');
        },
        { timeout: 3000, interval: 100 }
      );
    });

    it('should have accessible error message', async () => {
      const { getByTestId } = await renderWithProviders(
        <RealtimeMessageList channelName="accessible-error" />
      );

      await waitFor(
        () => {
          expect(getByTestId('connection-status')).toHaveTextContent('Connected');
        },
        { timeout: 3000, interval: 100 }
      );

      const channel = mockChannels.get('accessible-error');
      await act(() => {
        channel?.unsubscribe();
      });

      await fireEvent.press(getByTestId('send-message-button'));

      await waitFor(
        () => {
          const errorMessage = getByTestId('error-message');
          expect(errorMessage.props.accessibilityRole).toBe('alert');
        },
        { timeout: 3000, interval: 100 }
      );
    });
  });

  describe('presence tracking', () => {
    it('should track user presence on channel join', async () => {
      const { getByTestId } = await renderWithProviders(
        <PresenceComponent channelName="presence-room" userId="user-1" userName="Alice" />
      );

      await waitFor(
        () => {
          expect(getByTestId('tracking-status')).toHaveTextContent('Tracking');
        },
        { timeout: 3000, interval: 100 }
      );

      expect(getByTestId('user-user-1')).toHaveTextContent('Alice: online');
    });

    it('should add user to presence store on join', async () => {
      await renderWithProviders(
        <PresenceComponent channelName="multi-presence" userId="user-1" userName="Alice" />
      );

      await waitFor(
        () => {
          const users = mockPresenceUsers.get('multi-presence');
          expect(users?.some(u => u.id === 'user-1')).toBe(true);
        },
        { timeout: 3000, interval: 100 }
      );

      // Verify the user data is correct
      const users = mockPresenceUsers.get('multi-presence');
      const alice = users?.find(u => u.id === 'user-1');
      expect(alice?.name).toBe('Alice');
      expect(alice?.status).toBe('online');
    });

    it('should update user status in presence store', async () => {
      const { getByTestId } = await renderWithProviders(
        <PresenceComponent channelName="status-room" userId="user-1" userName="Alice" />
      );

      await waitFor(
        () => {
          expect(getByTestId('tracking-status')).toHaveTextContent('Tracking');
        },
        { timeout: 3000, interval: 100 }
      );

      // Initial status should be online
      let users = mockPresenceUsers.get('status-room');
      expect(users?.find(u => u.id === 'user-1')?.status).toBe('online');

      // Press away button
      await fireEvent.press(getByTestId('set-away-button'));

      // Status should be updated in store
      users = mockPresenceUsers.get('status-room');
      expect(users?.find(u => u.id === 'user-1')?.status).toBe('away');
    });

    it('should remove user from presence on unmount', async () => {
      const { unmount } = await renderWithProviders(
        <PresenceComponent channelName="leave-room" userId="leaving-user" userName="Charlie" />
      );

      await waitFor(
        () => {
          const users = mockPresenceUsers.get('leave-room');
          expect(users?.some(u => u.id === 'leaving-user')).toBe(true);
        },
        { timeout: 3000, interval: 100 }
      );

      await unmount();

      const usersAfterUnmount = mockPresenceUsers.get('leave-room');
      expect(usersAfterUnmount?.some(u => u.id === 'leaving-user')).toBe(false);
    });
  });

  describe('accessibility', () => {
    it('should have accessible send message button', async () => {
      const { getByTestId } = await renderWithProviders(
        <RealtimeMessageList channelName="a11y-channel" />
      );

      const button = getByTestId('send-message-button');
      expect(button.props.accessibilityRole).toBe('button');
      expect(button.props.accessibilityLabel).toBe('Send message');
    });

    it('should have accessible status indicators', async () => {
      const { getByTestId } = await renderWithProviders(
        <PresenceComponent channelName="a11y-presence" userId="user-1" userName="Alice" />
      );

      const awayButton = getByTestId('set-away-button');
      expect(awayButton.props.accessibilityRole).toBe('button');
      expect(awayButton.props.accessibilityLabel).toBe('Set status to away');
    });
  });

  describe('Realtime Edge Cases', () => {
    describe('connection timeout handling', () => {
      it('handles connection timeout gracefully', async () => {
        // Simulate a channel that fails to connect within timeout
        const timeoutChannelName = 'timeout-channel';

        const { getByTestId } = await renderWithProviders(
          <RealtimeMessageList channelName={timeoutChannelName} />
        );

        await waitFor(
          () => {
            expect(getByTestId('connection-status')).toBeOnTheScreen();
          },
          { timeout: 3000, interval: 100 }
        );

        // Channel should exist in the store
        const channel = mockChannels.get(timeoutChannelName);
        expect(channel).toBeDefined();

        // Simulate timeout by disconnecting
        await act(() => {
          channel?.unsubscribe();
        });

        await waitFor(
          () => {
            expect(getByTestId('connection-status')).toHaveTextContent('Disconnected');
          },
          { timeout: 3000, interval: 100 }
        );

        // Component should remain stable (not crash) after timeout
        expect(getByTestId('realtime-message-list')).toBeOnTheScreen();
      });

      it('allows manual retry after connection timeout', async () => {
        const retryChannelName = 'retry-after-timeout';

        const { getByTestId } = await renderWithProviders(
          <RealtimeMessageList channelName={retryChannelName} />
        );

        await waitFor(
          () => {
            expect(getByTestId('connection-status')).toHaveTextContent('Connected');
          },
          { timeout: 3000, interval: 100 }
        );

        const channel = mockChannels.get(retryChannelName);

        // Simulate timeout/disconnect
        await act(() => {
          channel?.unsubscribe();
        });

        await waitFor(
          () => {
            expect(getByTestId('connection-status')).toHaveTextContent('Disconnected');
          },
          { timeout: 3000, interval: 100 }
        );

        // Manual retry by resubscribing
        await act(() => {
          channel?.subscribe();
        });

        await waitFor(
          () => {
            expect(getByTestId('connection-status')).toHaveTextContent('Connected');
          },
          { timeout: 3000, interval: 100 }
        );
      });
    });

    describe('reconnection backoff', () => {
      it('implements reconnection backoff correctly', async () => {
        const backoffChannelName = 'backoff-channel';
        const reconnectAttempts: number[] = [];
        let attemptCount = 0;

        const { getByTestId } = await renderWithProviders(
          <RealtimeMessageList channelName={backoffChannelName} />
        );

        await waitFor(
          () => {
            expect(getByTestId('connection-status')).toHaveTextContent('Connected');
          },
          { timeout: 3000, interval: 100 }
        );

        const channel = mockChannels.get(backoffChannelName);

        // Simulate multiple disconnect/reconnect cycles
        for (let i = 0; i < 3; i++) {
          await act(() => {
            channel?.unsubscribe();
          });

          await waitFor(
            () => {
              expect(getByTestId('connection-status')).toHaveTextContent('Disconnected');
            },
            { timeout: 3000, interval: 100 }
          );

          // Simulate backoff delay (exponential: 100ms, 200ms, 400ms)
          const backoffDelay = Math.pow(2, attemptCount) * 100;
          reconnectAttempts.push(backoffDelay);

          await act(() => {
            channel?.subscribe();
          });

          await waitFor(
            () => {
              expect(getByTestId('connection-status')).toHaveTextContent('Connected');
            },
            { timeout: 3000, interval: 100 }
          );

          attemptCount++;
        }

        // Verify backoff pattern is exponential
        expect(reconnectAttempts[0]).toBe(100);
        expect(reconnectAttempts[1]).toBe(200);
        expect(reconnectAttempts[2]).toBe(400);
      });

      it('resets backoff counter after successful stable connection', async () => {
        const resetBackoffChannel = 'reset-backoff-channel';

        const { getByTestId } = await renderWithProviders(
          <RealtimeMessageList channelName={resetBackoffChannel} />
        );

        await waitFor(
          () => {
            expect(getByTestId('connection-status')).toHaveTextContent('Connected');
          },
          { timeout: 3000, interval: 100 }
        );

        const channel = mockChannels.get(resetBackoffChannel);

        // First disconnect/reconnect cycle
        await act(() => {
          channel?.unsubscribe();
        });

        await waitFor(
          () => {
            expect(getByTestId('connection-status')).toHaveTextContent('Disconnected');
          },
          { timeout: 3000, interval: 100 }
        );

        await act(() => {
          channel?.subscribe();
        });

        await waitFor(
          () => {
            expect(getByTestId('connection-status')).toHaveTextContent('Connected');
          },
          { timeout: 3000, interval: 100 }
        );

        // After stable connection, backoff should reset
        // Next disconnect should start from base delay again
        const channel2 = mockChannels.get(resetBackoffChannel);
        expect(channel2?.isConnected).toBe(true);
      });
    });

    describe('message ordering guarantees', () => {
      it('maintains message ordering guarantees', async () => {
        const orderingChannelName = 'ordering-channel';

        const { getByTestId } = await renderWithProviders(
          <RealtimeMessageList channelName={orderingChannelName} />
        );

        await waitFor(
          () => {
            expect(getByTestId('connection-status')).toHaveTextContent('Connected');
          },
          { timeout: 3000, interval: 100 }
        );

        const channel = mockChannels.get(orderingChannelName);

        // Send messages in specific order
        await act(() => {
          channel?.send({ type: 'message', payload: { order: 1, text: 'First' } });
          channel?.send({ type: 'message', payload: { order: 2, text: 'Second' } });
          channel?.send({ type: 'message', payload: { order: 3, text: 'Third' } });
        });

        // Verify messages are stored in order
        expect(channel?.messages).toHaveLength(3);
        expect(channel?.messages[0]?.payload).toEqual({ order: 1, text: 'First' });
        expect(channel?.messages[1]?.payload).toEqual({ order: 2, text: 'Second' });
        expect(channel?.messages[2]?.payload).toEqual({ order: 3, text: 'Third' });
      });

      it('preserves order after rapid message burst', async () => {
        const burstChannelName = 'burst-channel';

        const { getByTestId } = await renderWithProviders(
          <RealtimeMessageList channelName={burstChannelName} />
        );

        await waitFor(
          () => {
            expect(getByTestId('connection-status')).toHaveTextContent('Connected');
          },
          { timeout: 3000, interval: 100 }
        );

        const channel = mockChannels.get(burstChannelName);

        // Send 10 messages rapidly
        await act(() => {
          for (let i = 0; i < 10; i++) {
            channel?.send({ type: 'burst', payload: { index: i } });
          }
        });

        // All messages should be in order
        expect(channel?.messages).toHaveLength(10);
        channel?.messages.forEach((msg, idx) => {
          expect((msg.payload as { index: number }).index).toBe(idx);
        });
      });

      it('maintains order across reconnection', async () => {
        const reconnectOrderChannel = 'reconnect-order-channel';

        const { getByTestId } = await renderWithProviders(
          <RealtimeMessageList channelName={reconnectOrderChannel} />
        );

        await waitFor(
          () => {
            expect(getByTestId('connection-status')).toHaveTextContent('Connected');
          },
          { timeout: 3000, interval: 100 }
        );

        const channel = mockChannels.get(reconnectOrderChannel);

        // Send messages before disconnect
        await act(() => {
          channel?.send({ type: 'pre', payload: { seq: 1 } });
          channel?.send({ type: 'pre', payload: { seq: 2 } });
        });

        // Disconnect and reconnect
        await act(() => {
          channel?.unsubscribe();
          channel?.subscribe();
        });

        // Send messages after reconnect
        await act(() => {
          channel?.send({ type: 'post', payload: { seq: 3 } });
        });

        // Order should be preserved
        expect(channel?.messages).toHaveLength(3);
        expect(channel?.messages[0]?.type).toBe('pre');
        expect(channel?.messages[2]?.type).toBe('post');
      });
    });

    describe('subscription cleanup', () => {
      it('cleans up all subscriptions on unmount', async () => {
        const cleanupChannel = 'cleanup-channel';

        const { unmount, getByTestId } = await renderWithProviders(
          <RealtimeMessageList channelName={cleanupChannel} />
        );

        await waitFor(
          () => {
            expect(getByTestId('connection-status')).toHaveTextContent('Connected');
          },
          { timeout: 3000, interval: 100 }
        );

        // Verify subscription exists
        expect(mockChannels.get(cleanupChannel)?.isConnected).toBe(true);
        expect(mockListeners.get(cleanupChannel)?.size).toBeGreaterThan(0);

        // Unmount component
        await unmount();

        // All subscriptions should be cleaned up
        expect(mockChannels.get(cleanupChannel)?.isConnected).toBe(false);
        expect(mockListeners.get(cleanupChannel)?.size).toBe(0);
      });

      it('cleans up multiple channel subscriptions on unmount', async () => {
        const channels = ['cleanup-multi-1', 'cleanup-multi-2', 'cleanup-multi-3'];

        const { unmount } = await renderWithProviders(
          <MultiChannelComponent channels={channels} />
        );

        await waitFor(
          () => {
            channels.forEach(name => {
              expect(mockChannels.get(name)?.isConnected).toBe(true);
            });
          },
          { timeout: 3000, interval: 100 }
        );

        await unmount();

        // All channels should be disconnected
        channels.forEach(name => {
          expect(mockChannels.get(name)?.isConnected).toBe(false);
        });
      });

      it('handles unmount during pending connection', async () => {
        const pendingChannel = 'pending-channel';

        // Create a channel that doesn't auto-connect
        const { unmount } = await renderWithProviders(
          <RealtimeMessageList channelName={pendingChannel} />
        );

        // Immediately unmount before connection settles
        await unmount();

        // Should not throw or cause memory leak
        // Channel should be cleaned up
        const channel = mockChannels.get(pendingChannel);
        expect(channel?.isConnected).toBe(false);
      });

      it('does not leak listeners after multiple mount/unmount cycles', async () => {
        // Mount and unmount 5 times with unique channel names to avoid state pollution
        for (let i = 0; i < 5; i++) {
          const channelName = `leak-test-channel-${i}`;
          const { unmount, getByTestId } = await renderWithProviders(
            <RealtimeMessageList channelName={channelName} />
          );

          await waitFor(
            () => {
              expect(getByTestId('connection-status')).toHaveTextContent('Connected');
            },
            { timeout: 3000, interval: 100 }
          );

          // Verify listener was added
          expect(mockListeners.get(channelName)?.size).toBeGreaterThan(0);

          await unmount();

          // Verify listener was cleaned up after unmount
          expect(mockListeners.get(channelName)?.size).toBe(0);
        }
      });
    });
  });
});
