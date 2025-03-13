import storage from "../utils/storage";
import logger from "../utils/logger";
import config from "../config";

/**
 * Task để cập nhật thông tin kích thước dữ liệu định kỳ
 */
export class StorageMonitorTask {
  private intervalId: NodeJS.Timeout | null = null;

  constructor() {}

  /**
   * Bắt đầu task monitor
   */
  public start(intervalMinutes: number = 60): void {
    logger.info(
      `Starting storage monitor task with interval of ${intervalMinutes} minutes`
    );

    // Chạy ngay lần đầu
    this.updateStorageInfo();

    // Thiết lập interval
    this.intervalId = setInterval(() => {
      this.updateStorageInfo();
    }, intervalMinutes * 60 * 1000);
  }

  /**
   * Dừng task monitor
   */
  public stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      logger.info("Stopped storage monitor task");
    }
  }

  /**
   * Cập nhật thông tin kích thước
   */
  private updateStorageInfo(): void {
    try {
      logger.debug("Updating storage size information");

      // Lấy thông tin kích thước hiện tại
      const sizeInfo = storage.getCurrentSizeInfo();

      // Log thông tin tổng kích thước
      logger.info(
        `Total storage size: ${sizeInfo.total.megabytes.toFixed(
          2
        )} MB (${sizeInfo.total.bytes.toLocaleString()} bytes)`
      );

      // Log thông tin kích thước theo loại
      for (const [type, info] of Object.entries(sizeInfo.byType)) {
        logger.debug(
          `Storage size for ${type}: ${info.megabytes.toFixed(
            2
          )} MB (${info.bytes.toLocaleString()} bytes)`
        );
      }
    } catch (error) {
      logger.error("Error updating storage size information", error);
    }
  }
}

// Export instance mặc định
export default new StorageMonitorTask();
