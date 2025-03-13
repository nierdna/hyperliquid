import crawler from './services/crawler';
import logger from './utils/logger';
import { SubscriptionMessage } from './types';

// Danh sách các coin muốn crawl
const COINS = [
  "BTC",
  // 'ETH',
  // 'SOL',
  // 'AVAX',
  // 'ARB',
  // 'LINK',
  // 'DOGE',
  // 'MATIC',
  // 'XRP',
  // 'BNB',
];

// Danh sách các interval cho candle
const CANDLE_INTERVALS: string[] = [
  // '1m',
  // '5m',
  // '15m',
  // '1h',
  // '4h',
  // '1d',
];

// Hàm main
async function main() {
  try {
    logger.info('Starting Hyperliquid Crawler');
    
    // Khởi động crawler
    await crawler.start();
    
    // Subscribe to allMids
    const allMidsSubscription: SubscriptionMessage = {
      method: 'subscribe',
      subscription: {
        type: 'allMids',
      },
    };
    crawler.subscribe(allMidsSubscription);
    
    // Subscribe to notification
    const notificationSubscription: SubscriptionMessage = {
      method: 'subscribe',
      subscription: {
        type: 'notification',
      },
    };
    crawler.subscribe(notificationSubscription);
    
    // Subscribe to trades cho mỗi coin
    for (const coin of COINS) {
      const tradesSubscription: SubscriptionMessage = {
        method: 'subscribe',
        subscription: {
          type: 'trades',
          coin,
        },
      };
      crawler.subscribe(tradesSubscription);
      
      // Đợi 1 giây trước khi subscribe tiếp để tránh rate limit
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Subscribe to l2Book cho mỗi coin
      const l2BookSubscription: SubscriptionMessage = {
        method: 'subscribe',
        subscription: {
          type: 'l2Book',
          coin,
        },
      };
      crawler.subscribe(l2BookSubscription);
      
      // Đợi 1 giây trước khi subscribe tiếp để tránh rate limit
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Subscribe to candle cho mỗi coin và interval
      for (const interval of CANDLE_INTERVALS) {
        const candleSubscription: SubscriptionMessage = {
          method: 'subscribe',
          subscription: {
            type: 'candle',
            coin,
            interval,
          },
        };
        crawler.subscribe(candleSubscription);
        
        // Đợi 500ms trước khi subscribe tiếp để tránh rate limit
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
    
    logger.info('Subscribed to all channels');
    
    // Xử lý khi nhận được signal để dừng ứng dụng
    process.on('SIGINT', () => {
      logger.info('Received SIGINT signal');
      crawler.stop();
      process.exit(0);
    });
    
    process.on('SIGTERM', () => {
      logger.info('Received SIGTERM signal');
      crawler.stop();
      process.exit(0);
    });
    
    // Giữ ứng dụng chạy
    logger.info('Crawler is running. Press Ctrl+C to stop.');
  } catch (error) {
    logger.error('Error in main function', error);
    process.exit(1);
  }
}

// Chạy hàm main
main(); 