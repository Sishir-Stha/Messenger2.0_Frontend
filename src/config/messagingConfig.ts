export const messagingConfig = {
  restApiBaseUrl: import.meta.env.VITE_REST_API_BASE_URL ?? 'http://localhost:8080/api/messaging',
  webSocketEndpoint: import.meta.env.VITE_WEBSOCKET_ENDPOINT ?? 'ws://localhost:8080/ws',
  stompAppPrefix: import.meta.env.VITE_STOMP_APP_PREFIX ?? '/app',
  userQueueDestination: import.meta.env.VITE_USER_QUEUE_DESTINATION ?? '/queue/messages',
  roomTopicDestination: import.meta.env.VITE_ROOM_TOPIC_DESTINATION ?? '/topic/conversations',
  currentUserId: import.meta.env.VITE_CURRENT_USER_ID ?? 'user-current',
} as const;
