import fs from 'fs';
import path from 'path';
import config from '../config';
import logger from './logger';

// Class Storage
class Storage {
  private dataDir: string;
  
  constructor() {
    this.dataDir = config.dataDir;
    
    // Tạo thư mục data nếu chưa tồn tại
    if (!fs.existsSync(this.dataDir)) {
      fs.mkdirSync(this.dataDir, { recursive: true });
    }
  }
  
  // Phương thức lưu dữ liệu
  public saveData(type: string, data: any): void {
    try {
      // Tạo thư mục cho loại dữ liệu
      const typeDir = path.join(this.dataDir, type);
      if (!fs.existsSync(typeDir)) {
        fs.mkdirSync(typeDir, { recursive: true });
      }
      
      // Tạo tên file với timestamp
      const timestamp = new Date().toISOString().replace(/:/g, '-');
      const fileName = `${timestamp}.json`;
      const filePath = path.join(typeDir, fileName);
      
      // Ghi dữ liệu vào file
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
      
      logger.debug(`Saved ${type} data to ${filePath}`);
    } catch (error) {
      logger.error(`Error saving ${type} data`, error);
    }
  }
  
  // Phương thức lưu dữ liệu theo coin
  public saveCoinData(type: string, coin: string, data: any): void {
    try {
      // Tạo thư mục cho loại dữ liệu và coin
      const coinDir = path.join(this.dataDir, type, coin);
      if (!fs.existsSync(coinDir)) {
        fs.mkdirSync(coinDir, { recursive: true });
      }
      
      // Tạo tên file với timestamp
      const timestamp = new Date().toISOString().replace(/:/g, '-');
      const fileName = `${timestamp}.json`;
      const filePath = path.join(coinDir, fileName);
      
      // Ghi dữ liệu vào file
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
      
      logger.debug(`Saved ${type} data for ${coin} to ${filePath}`);
    } catch (error) {
      logger.error(`Error saving ${type} data for ${coin}`, error);
    }
  }
  
  // Phương thức lưu dữ liệu theo user
  public saveUserData(type: string, user: string, data: any): void {
    try {
      // Tạo thư mục cho loại dữ liệu và user
      const userDir = path.join(this.dataDir, type, user);
      if (!fs.existsSync(userDir)) {
        fs.mkdirSync(userDir, { recursive: true });
      }
      
      // Tạo tên file với timestamp
      const timestamp = new Date().toISOString().replace(/:/g, '-');
      const fileName = `${timestamp}.json`;
      const filePath = path.join(userDir, fileName);
      
      // Ghi dữ liệu vào file
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
      
      logger.debug(`Saved ${type} data for user ${user} to ${filePath}`);
    } catch (error) {
      logger.error(`Error saving ${type} data for user ${user}`, error);
    }
  }
  
  // Phương thức lưu dữ liệu theo candle
  public saveCandleData(coin: string, interval: string, data: any): void {
    try {
      // Tạo thư mục cho candle, coin và interval
      const candleDir = path.join(this.dataDir, 'candle', coin, interval);
      if (!fs.existsSync(candleDir)) {
        fs.mkdirSync(candleDir, { recursive: true });
      }
      
      // Tạo tên file với timestamp
      const timestamp = new Date().toISOString().replace(/:/g, '-');
      const fileName = `${timestamp}.json`;
      const filePath = path.join(candleDir, fileName);
      
      // Ghi dữ liệu vào file
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
      
      logger.debug(`Saved candle data for ${coin} ${interval} to ${filePath}`);
    } catch (error) {
      logger.error(`Error saving candle data for ${coin} ${interval}`, error);
    }
  }
}

// Export instance của Storage
export default new Storage(); 