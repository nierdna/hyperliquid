import fs from 'fs';
import path from 'path';
import config from '../config';

// Enum cho các level của log
enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

// Map string log level sang enum
const logLevelMap: Record<string, LogLevel> = {
  debug: LogLevel.DEBUG,
  info: LogLevel.INFO,
  warn: LogLevel.WARN,
  error: LogLevel.ERROR,
};

// Lấy log level từ config
const configLogLevel = logLevelMap[config.logLevel.toLowerCase()] || LogLevel.INFO;

// Class Logger
class Logger {
  private logDir: string;
  private logFile: string;
  
  constructor() {
    this.logDir = path.join(config.dataDir, 'logs');
    
    // Tạo thư mục logs nếu chưa tồn tại
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
    
    // Tạo tên file log với timestamp
    const date = new Date().toISOString().split('T')[0];
    this.logFile = path.join(this.logDir, `${date}.log`);
  }
  
  // Phương thức log
  private log(level: LogLevel, message: string, data?: any): void {
    // Kiểm tra log level
    if (level < configLogLevel) {
      return;
    }
    
    // Tạo timestamp
    const timestamp = new Date().toISOString();
    
    // Tạo log message
    let logMessage = `[${timestamp}] [${LogLevel[level]}] ${message}`;
    
    // Thêm data nếu có
    if (data) {
      logMessage += ` ${JSON.stringify(data)}`;
    }
    
    // Log ra console
    console.log(logMessage);
    
    // Ghi log vào file
    fs.appendFileSync(this.logFile, logMessage + '\n');
  }
  
  // Phương thức debug
  public debug(message: string, data?: any): void {
    this.log(LogLevel.DEBUG, message, data);
  }
  
  // Phương thức info
  public info(message: string, data?: any): void {
    this.log(LogLevel.INFO, message, data);
  }
  
  // Phương thức warn
  public warn(message: string, data?: any): void {
    this.log(LogLevel.WARN, message, data);
  }
  
  // Phương thức error
  public error(message: string, data?: any): void {
    this.log(LogLevel.ERROR, message, data);
  }
}

// Export instance của Logger
export default new Logger(); 