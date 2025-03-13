import websocket from './websocket';
import storage from '../utils/storage';
import logger from '../utils/logger';
import {
  AllMidsData,
  NotificationData,
  TradesData,
  L2BookData,
  CandleData,
  UserEventsData,
  UserFillsData,
  UserFundingsData,
  UserNonFundingLedgerUpdatesData,
  SubscriptionMessage,
} from '../types';

// Class CrawlerService
class CrawlerService {
  private isRunning = false;
  
  // Phương thức khởi động crawler
  public async start(): Promise<void> {
    if (this.isRunning) {
      logger.warn('Crawler is already running');
      return;
    }
    
    this.isRunning = true;
    logger.info('Starting crawler');
    
    try {
      // Kết nối WebSocket
      await websocket.connect();
      
      // Đăng ký các handler
      this.registerHandlers();
      
      logger.info('Crawler started');
    } catch (error) {
      this.isRunning = false;
      logger.error('Error starting crawler', error);
      throw error;
    }
  }
  
  // Phương thức dừng crawler
  public stop(): void {
    if (!this.isRunning) {
      logger.warn('Crawler is not running');
      return;
    }
    
    this.isRunning = false;
    logger.info('Stopping crawler');
    
    // Đóng kết nối WebSocket
    websocket.close();
    
    logger.info('Crawler stopped');
  }
  
  // Phương thức đăng ký các handler
  private registerHandlers(): void {
    // Đăng ký handler cho allMids
    websocket.registerHandler('allMids', (data) => {
      this.handleAllMids(data);
    });
    
    // Đăng ký handler cho notification
    websocket.registerHandler('notification', (data) => {
      this.handleNotification(data);
    });
    
    // Đăng ký handler cho trades
    websocket.registerHandler('trades', (data) => {
      this.handleTrades(data);
    });
    
    // Đăng ký handler cho l2Book
    websocket.registerHandler('l2Book', (data) => {
      this.handleL2Book(data);
    });
    
    // Đăng ký handler cho candle
    websocket.registerHandler('candle', (data) => {
      this.handleCandle(data);
    });
    
    // Đăng ký handler cho userEvents
    websocket.registerHandler('userEvents', (data) => {
      this.handleUserEvents(data);
    });
    
    // Đăng ký handler cho userFills
    websocket.registerHandler('userFills', (data) => {
      this.handleUserFills(data);
    });
    
    // Đăng ký handler cho userFundings
    websocket.registerHandler('userFundings', (data) => {
      this.handleUserFundings(data);
    });
    
    // Đăng ký handler cho userNonFundingLedgerUpdates
    websocket.registerHandler('userNonFundingLedgerUpdates', (data) => {
      this.handleUserNonFundingLedgerUpdates(data);
    });
  }
  
  // Phương thức subscribe
  public subscribe(subscription: SubscriptionMessage): void {
    websocket.subscribe(subscription);
  }
  
  // Phương thức unsubscribe
  public unsubscribe(subscription: SubscriptionMessage): void {
    websocket.unsubscribe(subscription);
  }
  
  // Phương thức xử lý allMids
  private handleAllMids(data: AllMidsData['data']): void {
    logger.debug('Received allMids data');
    storage.saveData('allMids', data);
  }
  
  // Phương thức xử lý notification
  private handleNotification(data: NotificationData['data']): void {
    logger.debug('Received notification data');
    storage.saveData('notification', data);
  }
  
  // Phương thức xử lý trades
  private handleTrades(data: TradesData['data']): void {
    if (data.length === 0) {
      return;
    }
    
    const coin = data[0].coin;
    logger.debug(`Received trades data for ${coin}`);
    storage.saveCoinData('trades', coin, data);
  }
  
  // Phương thức xử lý l2Book
  private handleL2Book(data: L2BookData['data']): void {
    const coin = data.coin;
    logger.debug(`Received l2Book data for ${coin}`);
    storage.saveCoinData('l2Book', coin, data);
  }
  
  // Phương thức xử lý candle
  private handleCandle(data: CandleData['data']): void {
    const coin = data.s;
    const interval = data.i;
    logger.debug(`Received candle data for ${coin} ${interval}`);
    storage.saveCandleData(coin, interval, data);
  }
  
  // Phương thức xử lý userEvents
  private handleUserEvents(data: UserEventsData['data']): void {
    logger.debug('Received userEvents data');
    
    // Xác định user từ dữ liệu
    let user = '';
    
    if ('fills' in data && data.fills.length > 0) {
      // Lưu dữ liệu fills
      storage.saveData('userEventsFills', data.fills);
    } else if ('funding' in data) {
      // Lưu dữ liệu funding
      storage.saveData('userEventsFunding', data.funding);
    } else if ('liquidation' in data) {
      // Lưu dữ liệu liquidation
      storage.saveData('userEventsLiquidation', data.liquidation);
    } else if ('nonUserCancel' in data) {
      // Lưu dữ liệu nonUserCancel
      storage.saveData('userEventsNonUserCancel', data.nonUserCancel);
    }
  }
  
  // Phương thức xử lý userFills
  private handleUserFills(data: UserFillsData['data']): void {
    const user = data.user;
    logger.debug(`Received userFills data for user ${user}`);
    storage.saveUserData('userFills', user, data);
  }
  
  // Phương thức xử lý userFundings
  private handleUserFundings(data: UserFundingsData['data']): void {
    const user = data.user;
    logger.debug(`Received userFundings data for user ${user}`);
    storage.saveUserData('userFundings', user, data);
  }
  
  // Phương thức xử lý userNonFundingLedgerUpdates
  private handleUserNonFundingLedgerUpdates(data: UserNonFundingLedgerUpdatesData['data']): void {
    const user = data.user;
    logger.debug(`Received userNonFundingLedgerUpdates data for user ${user}`);
    storage.saveUserData('userNonFundingLedgerUpdates', user, data);
  }
}

// Export instance của CrawlerService
export default new CrawlerService(); 