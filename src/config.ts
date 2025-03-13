import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Load biến môi trường từ file .env
dotenv.config();

// Định nghĩa interface cho cấu hình
interface Config {
  wsUrl: string;
  dataDir: string;
  logLevel: string;
  tradeNotionalThreshold: number; // Ngưỡng notional cho giao dịch
}

// Lấy URL WebSocket dựa trên mạng được chọn
const getWsUrl = (): string => {
  const network = process.env.NETWORK || "MAINNET";

  if (network === "MAINNET") {
    return process.env.MAINNET_WS_URL || "wss://api.hyperliquid.xyz/ws";
  } else {
    return process.env.TESTNET_WS_URL || "wss://api.hyperliquid-testnet.xyz/ws";
  }
};

// Lấy thư mục lưu trữ dữ liệu
const getDataDir = (): string => {
  const dataDir = process.env.DATA_DIR || "./data";

  // Tạo thư mục nếu chưa tồn tại
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  return dataDir;
};

// Tạo cấu hình
const config: Config = {
  wsUrl: getWsUrl(),
  dataDir: getDataDir(),
  logLevel: process.env.LOG_LEVEL || "info",
  tradeNotionalThreshold: Number(process.env.TRADE_NOTIONAL_THRESHOLD) || 100, // Mặc định là 100 USD
};

export default config; 