import WebSocket from 'ws';
import config from '../config';
import logger from '../utils/logger';
import { SubscriptionMessage, SubscriptionResponse } from '../types';

// Class WebSocketService
class WebSocketService {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 10;
  private reconnectDelay = 1000; // 1 giây
  private messageHandlers: Map<string, (data: any) => void> = new Map();
  
  // Phương thức kết nối
  public connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        logger.info(`Connecting to WebSocket: ${config.wsUrl}`);
        
        this.ws = new WebSocket(config.wsUrl);
        
        // Xử lý sự kiện open
        this.ws.on('open', () => {
          logger.info('WebSocket connected');
          this.reconnectAttempts = 0;
          resolve();
        });
        
        // Xử lý sự kiện message
        this.ws.on('message', (data: WebSocket.Data) => {
          try {
            const message = JSON.parse(data.toString());
            this.handleMessage(message);
          } catch (error) {
            logger.error('Error parsing WebSocket message', error);
          }
        });
        
        // Xử lý sự kiện error
        this.ws.on('error', (error) => {
          logger.error('WebSocket error', error);
          reject(error);
        });
        
        // Xử lý sự kiện close
        this.ws.on('close', (code, reason) => {
          logger.warn(`WebSocket closed: ${code} - ${reason}`);
          this.reconnect();
        });
      } catch (error) {
        logger.error('Error connecting to WebSocket', error);
        reject(error);
      }
    });
  }
  
  // Phương thức reconnect
  private reconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      logger.error('Max reconnect attempts reached');
      return;
    }
    
    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
    
    logger.info(`Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
    
    setTimeout(() => {
      this.connect().catch((error) => {
        logger.error('Error reconnecting to WebSocket', error);
      });
    }, delay);
  }
  
  // Phương thức đóng kết nối
  public close(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
  
  // Phương thức gửi message
  public send(message: any): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      logger.error('WebSocket not connected');
      return;
    }
    
    try {
      this.ws.send(JSON.stringify(message));
    } catch (error) {
      logger.error('Error sending WebSocket message', error);
    }
  }
  
  // Phương thức subscribe
  public subscribe(subscription: SubscriptionMessage): void {
    logger.info('Subscribing to', subscription);
    this.send(subscription);
  }
  
  // Phương thức unsubscribe
  public unsubscribe(subscription: SubscriptionMessage): void {
    logger.info('Unsubscribing from', subscription);
    this.send(subscription);
  }
  
  // Phương thức xử lý message
  private handleMessage(message: any): void {
    // Kiểm tra nếu là subscription response
    if (message.channel === 'subscriptionResponse') {
      const response = message as SubscriptionResponse;
      logger.info('Subscription response', response.data);
      return;
    }
    
    // Xử lý message dựa trên channel
    const channel = message.channel;
    const handler = this.messageHandlers.get(channel);
    
    if (handler) {
      handler(message.data);
    } else {
      logger.debug(`No handler for channel: ${channel}`, message);
    }
  }
  
  // Phương thức đăng ký handler cho channel
  public registerHandler(channel: string, handler: (data: any) => void): void {
    this.messageHandlers.set(channel, handler);
    logger.debug(`Registered handler for channel: ${channel}`);
  }
  
  // Phương thức hủy đăng ký handler cho channel
  public unregisterHandler(channel: string): void {
    this.messageHandlers.delete(channel);
    logger.debug(`Unregistered handler for channel: ${channel}`);
  }
}

// Export instance của WebSocketService
export default new WebSocketService(); 