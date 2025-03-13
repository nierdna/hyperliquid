import fs from 'fs';
import path from 'path';
import config from '../config';
import logger from './logger';

// Định nghĩa interface cho thông tin kích thước
interface SizeInfo {
  timestamp: string;
  bytes: number;
  kilobytes: number;
  megabytes: number;
  gigabytes: number;
  terabytes: number;
  type: string;
  path: string;
}

// Class Storage
class Storage {
  private dataDir: string;
  private sizeHistoryFile: string;

  constructor() {
    this.dataDir = config.dataDir;
    this.sizeHistoryFile = path.join(this.dataDir, "size_history.json");

    // Tạo thư mục data nếu chưa tồn tại
    if (!fs.existsSync(this.dataDir)) {
      fs.mkdirSync(this.dataDir, { recursive: true });
    }

    // Tạo file lưu lịch sử kích thước nếu chưa tồn tại
    if (!fs.existsSync(this.sizeHistoryFile)) {
      fs.writeFileSync(this.sizeHistoryFile, JSON.stringify([], null, 2));
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
      const timestamp = new Date().toISOString().replace(/:/g, "-");
      const fileName = `${timestamp}.json`;
      const filePath = path.join(typeDir, fileName);

      // Ghi dữ liệu vào file
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

      logger.debug(`Saved ${type} data to ${filePath}`);

      // Cập nhật thông tin kích thước
      this.updateSizeInfo(type);
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
      const timestamp = new Date().toISOString().replace(/:/g, "-");
      const fileName = `${timestamp}.json`;
      const filePath = path.join(coinDir, fileName);

      // Ghi dữ liệu vào file
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

      logger.debug(`Saved ${type} data for ${coin} to ${filePath}`);

      // Cập nhật thông tin kích thước
      this.updateSizeInfo(`${type}/${coin}`);
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
      const timestamp = new Date().toISOString().replace(/:/g, "-");
      const fileName = `${timestamp}.json`;
      const filePath = path.join(userDir, fileName);

      // Ghi dữ liệu vào file
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

      logger.debug(`Saved ${type} data for user ${user} to ${filePath}`);

      // Cập nhật thông tin kích thước
      this.updateSizeInfo(`${type}/${user}`);
    } catch (error) {
      logger.error(`Error saving ${type} data for user ${user}`, error);
    }
  }

  // Phương thức lưu dữ liệu theo candle
  public saveCandleData(coin: string, interval: string, data: any): void {
    try {
      // Tạo thư mục cho candle, coin và interval
      const candleDir = path.join(this.dataDir, "candle", coin, interval);
      if (!fs.existsSync(candleDir)) {
        fs.mkdirSync(candleDir, { recursive: true });
      }

      // Tạo tên file với timestamp
      const timestamp = new Date().toISOString().replace(/:/g, "-");
      const fileName = `${timestamp}.json`;
      const filePath = path.join(candleDir, fileName);

      // Ghi dữ liệu vào file
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

      logger.debug(`Saved candle data for ${coin} ${interval} to ${filePath}`);

      // Cập nhật thông tin kích thước
      this.updateSizeInfo(`candle/${coin}/${interval}`);
    } catch (error) {
      logger.error(`Error saving candle data for ${coin} ${interval}`, error);
    }
  }

  // Phương thức tính kích thước thư mục
  private calculateDirectorySize(directoryPath: string): number {
    let totalSize = 0;

    try {
      const files = fs.readdirSync(directoryPath);

      for (const file of files) {
        const filePath = path.join(directoryPath, file);
        const stats = fs.statSync(filePath);

        if (stats.isDirectory()) {
          totalSize += this.calculateDirectorySize(filePath);
        } else {
          totalSize += stats.size;
        }
      }
    } catch (error) {
      logger.error(
        `Error calculating directory size for ${directoryPath}`,
        error
      );
    }

    return totalSize;
  }

  // Phương thức chuyển đổi bytes sang các đơn vị khác
  private convertBytes(bytes: number): {
    bytes: number;
    kilobytes: number;
    megabytes: number;
    gigabytes: number;
    terabytes: number;
  } {
    const kilobytes = bytes / 1024;
    const megabytes = kilobytes / 1024;
    const gigabytes = megabytes / 1024;
    const terabytes = gigabytes / 1024;

    return {
      bytes,
      kilobytes,
      megabytes,
      gigabytes,
      terabytes,
    };
  }

  // Phương thức cập nhật thông tin kích thước
  private updateSizeInfo(type: string): void {
    try {
      const dirPath = path.join(this.dataDir, type);

      // Kiểm tra thư mục tồn tại
      if (!fs.existsSync(dirPath)) {
        return;
      }

      // Tính kích thước
      const sizeInBytes = this.calculateDirectorySize(dirPath);
      const sizeInfo = this.convertBytes(sizeInBytes);

      // Tạo thông tin kích thước
      const sizeData: SizeInfo = {
        timestamp: new Date().toISOString(),
        ...sizeInfo,
        type,
        path: dirPath,
      };

      // Đọc lịch sử kích thước
      let sizeHistory: SizeInfo[] = [];
      if (fs.existsSync(this.sizeHistoryFile)) {
        const historyData = fs.readFileSync(this.sizeHistoryFile, "utf8");
        sizeHistory = JSON.parse(historyData);
      }

      // Thêm thông tin mới
      sizeHistory.push(sizeData);

      // Ghi lại lịch sử
      fs.writeFileSync(
        this.sizeHistoryFile,
        JSON.stringify(sizeHistory, null, 2)
      );

      logger.debug(
        `Updated size info for ${type}: ${sizeInfo.megabytes.toFixed(2)} MB`
      );
    } catch (error) {
      logger.error(`Error updating size info for ${type}`, error);
    }
  }

  // Phương thức lấy thông tin kích thước hiện tại
  public getCurrentSizeInfo(): {
    total: SizeInfo;
    byType: Record<string, SizeInfo>;
  } {
    try {
      // Tính tổng kích thước
      const totalBytes = this.calculateDirectorySize(this.dataDir);
      const totalSizeInfo = this.convertBytes(totalBytes);

      const totalInfo: SizeInfo = {
        timestamp: new Date().toISOString(),
        ...totalSizeInfo,
        type: "total",
        path: this.dataDir,
      };

      // Tính kích thước theo loại
      const byType: Record<string, SizeInfo> = {};

      // Đọc các thư mục con trực tiếp
      const subDirs = fs.readdirSync(this.dataDir);

      for (const dir of subDirs) {
        const dirPath = path.join(this.dataDir, dir);

        // Bỏ qua file và thư mục logs
        if (!fs.statSync(dirPath).isDirectory() || dir === "logs") {
          continue;
        }

        const bytes = this.calculateDirectorySize(dirPath);
        const sizeInfo = this.convertBytes(bytes);

        byType[dir] = {
          timestamp: new Date().toISOString(),
          ...sizeInfo,
          type: dir,
          path: dirPath,
        };
      }

      return { total: totalInfo, byType };
    } catch (error) {
      logger.error("Error getting current size info", error);

      // Trả về giá trị mặc định nếu có lỗi
      return {
        total: {
          timestamp: new Date().toISOString(),
          bytes: 0,
          kilobytes: 0,
          megabytes: 0,
          gigabytes: 0,
          terabytes: 0,
          type: "total",
          path: this.dataDir,
        },
        byType: {},
      };
    }
  }

  // Phương thức lấy lịch sử kích thước
  public getSizeHistory(): SizeInfo[] {
    try {
      if (fs.existsSync(this.sizeHistoryFile)) {
        const historyData = fs.readFileSync(this.sizeHistoryFile, "utf8");
        return JSON.parse(historyData);
      }
      return [];
    } catch (error) {
      logger.error("Error getting size history", error);
      return [];
    }
  }

  // Phương thức lấy lịch sử kích thước theo loại
  public getSizeHistoryByType(type: string): SizeInfo[] {
    try {
      const history = this.getSizeHistory();
      return history.filter((item) => item.type === type);
    } catch (error) {
      logger.error(`Error getting size history for ${type}`, error);
      return [];
    }
  }
}

// Export instance của Storage
export default new Storage(); 