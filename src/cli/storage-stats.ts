import storage from "../utils/storage";
import logger from "../utils/logger";
import { table } from "table";
import chalk from "chalk";
import fs from "fs";
import path from "path";
import config from "../config";

// Định nghĩa các tham số dòng lệnh
const args = process.argv.slice(2);
const command = args[0] || "current";
const type = args[1] || "all";

// Hàm định dạng kích thước
function formatSize(size: number): string {
  if (size < 1024) {
    return `${size.toFixed(2)} B`;
  } else if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(2)} KB`;
  } else if (size < 1024 * 1024 * 1024) {
    return `${(size / 1024 / 1024).toFixed(2)} MB`;
  } else if (size < 1024 * 1024 * 1024 * 1024) {
    return `${(size / 1024 / 1024 / 1024).toFixed(2)} GB`;
  } else {
    return `${(size / 1024 / 1024 / 1024 / 1024).toFixed(2)} TB`;
  }
}

// Hàm hiển thị thông tin kích thước hiện tại
function showCurrentSize(): void {
  const sizeInfo = storage.getCurrentSizeInfo();

  console.log(chalk.bold.green("\n===== STORAGE SIZE INFORMATION =====\n"));

  // Hiển thị tổng kích thước
  console.log(chalk.bold.blue("Total Storage Size:"));
  console.log(`Bytes: ${sizeInfo.total.bytes.toLocaleString()}`);
  console.log(`Kilobytes: ${sizeInfo.total.kilobytes.toFixed(2)} KB`);
  console.log(`Megabytes: ${sizeInfo.total.megabytes.toFixed(2)} MB`);
  console.log(`Gigabytes: ${sizeInfo.total.gigabytes.toFixed(2)} GB`);
  console.log(`Terabytes: ${sizeInfo.total.terabytes.toFixed(6)} TB`);
  console.log(`Path: ${sizeInfo.total.path}`);
  console.log(`Timestamp: ${sizeInfo.total.timestamp}`);

  console.log(chalk.bold.blue("\nStorage Size by Type:"));

  // Tạo bảng hiển thị kích thước theo loại
  const tableData = [
    [
      chalk.bold("Type"),
      chalk.bold("Bytes"),
      chalk.bold("KB"),
      chalk.bold("MB"),
      chalk.bold("GB"),
      chalk.bold("TB"),
      chalk.bold("Path"),
    ],
  ];

  // Thêm dữ liệu vào bảng
  for (const [type, info] of Object.entries(sizeInfo.byType)) {
    tableData.push([
      type,
      info.bytes.toLocaleString(),
      info.kilobytes.toFixed(2),
      info.megabytes.toFixed(2),
      info.gigabytes.toFixed(4),
      info.terabytes.toFixed(6),
      info.path,
    ]);
  }

  // Hiển thị bảng
  console.log(table(tableData));
}

// Hàm hiển thị lịch sử kích thước
function showSizeHistory(specificType: string = "all"): void {
  let history;

  if (specificType === "all") {
    history = storage.getSizeHistory();
    console.log(chalk.bold.green("\n===== STORAGE SIZE HISTORY =====\n"));
  } else {
    history = storage.getSizeHistoryByType(specificType);
    console.log(
      chalk.bold.green(
        `\n===== STORAGE SIZE HISTORY FOR ${specificType.toUpperCase()} =====\n`
      )
    );
  }

  if (history.length === 0) {
    console.log(chalk.yellow("No history data available."));
    return;
  }

  // Tạo bảng hiển thị lịch sử
  const tableData = [
    [
      chalk.bold("Timestamp"),
      chalk.bold("Type"),
      chalk.bold("Bytes"),
      chalk.bold("KB"),
      chalk.bold("MB"),
      chalk.bold("GB"),
      chalk.bold("TB"),
    ],
  ];

  // Thêm dữ liệu vào bảng
  for (const info of history) {
    tableData.push([
      info.timestamp,
      info.type,
      info.bytes.toLocaleString(),
      info.kilobytes.toFixed(2),
      info.megabytes.toFixed(2),
      info.gigabytes.toFixed(4),
      info.terabytes.toFixed(6),
    ]);
  }

  // Hiển thị bảng
  console.log(table(tableData));
}

// Hàm hiển thị thống kê tăng trưởng
function showGrowthStats(specificType: string = "all"): void {
  let history;

  if (specificType === "all") {
    // Lấy lịch sử cho tất cả các loại
    history = storage.getSizeHistory();
    console.log(chalk.bold.green("\n===== STORAGE GROWTH STATISTICS =====\n"));
  } else {
    // Lấy lịch sử cho loại cụ thể
    history = storage.getSizeHistoryByType(specificType);
    console.log(
      chalk.bold.green(
        `\n===== STORAGE GROWTH STATISTICS FOR ${specificType.toUpperCase()} =====\n`
      )
    );
  }

  if (history.length < 2) {
    console.log(
      chalk.yellow("Not enough history data to calculate growth statistics.")
    );
    return;
  }

  // Nhóm dữ liệu theo loại
  const typeGroups: Record<string, any[]> = {};

  for (const entry of history) {
    if (!typeGroups[entry.type]) {
      typeGroups[entry.type] = [];
    }
    typeGroups[entry.type].push(entry);
  }

  // Tạo bảng hiển thị thống kê tăng trưởng
  const tableData = [
    [
      chalk.bold("Type"),
      chalk.bold("First Record"),
      chalk.bold("Last Record"),
      chalk.bold("Initial Size"),
      chalk.bold("Current Size"),
      chalk.bold("Growth"),
      chalk.bold("Growth %"),
      chalk.bold("Avg. Minute Growth"),
      chalk.bold("Avg. Daily Growth"),
    ],
  ];

  // Tính toán thống kê cho mỗi loại
  for (const [type, entries] of Object.entries(typeGroups)) {
    if (entries.length < 2) continue;

    // Sắp xếp theo thời gian
    entries.sort(
      (a, b) =>
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    const firstEntry = entries[0];
    const lastEntry = entries[entries.length - 1];

    // Tính toán tăng trưởng
    const initialSize = firstEntry.bytes;
    const currentSize = lastEntry.bytes;
    const growth = currentSize - initialSize;
    const growthPercent = (growth / initialSize) * 100;

    // Tính số phút giữa bản ghi đầu tiên và cuối cùng
    const firstDate = new Date(firstEntry.timestamp);
    const lastDate = new Date(lastEntry.timestamp);
    const minutesDiff = Math.max(
      1,
      (lastDate.getTime() - firstDate.getTime()) / (1000 * 60)
    );

    // Tính số ngày giữa bản ghi đầu tiên và cuối cùng
    const daysDiff = minutesDiff / (60 * 24);

    // Tính tăng trưởng trung bình mỗi phút
    const avgMinuteGrowth = growth / minutesDiff;

    // Suy ra tăng trưởng trung bình hàng ngày từ tăng trưởng mỗi phút
    const avgDailyGrowth = avgMinuteGrowth * 60 * 24;

    tableData.push([
      type,
      firstEntry.timestamp,
      lastEntry.timestamp,
      formatSize(initialSize),
      formatSize(currentSize),
      formatSize(growth),
      `${growthPercent.toFixed(2)}%`,
      formatSize(avgMinuteGrowth),
      formatSize(avgDailyGrowth),
    ]);
  }

  // Hiển thị bảng
  console.log(table(tableData));
}

// Hàm hiển thị trợ giúp
function showHelp(): void {
  console.log(chalk.bold.green("\n===== STORAGE STATS HELP =====\n"));
  console.log("Usage: node storage-stats.js [command] [type]\n");
  console.log("Commands:");
  console.log("  current    - Show current storage size (default)");
  console.log("  history    - Show storage size history");
  console.log("  growth     - Show storage growth statistics");
  console.log("  help       - Show this help message\n");
  console.log("Types:");
  console.log("  all        - All data types (default)");
  console.log(
    "  [type]     - Specific data type (e.g., trades, candle, notification, etc.)\n"
  );
  console.log("Examples:");
  console.log("  node storage-stats.js current");
  console.log("  node storage-stats.js history trades");
  console.log("  node storage-stats.js growth candle\n");
}

// Xử lý lệnh
try {
  switch (command) {
    case "current":
      showCurrentSize();
      break;
    case "history":
      showSizeHistory(type);
      break;
    case "growth":
      showGrowthStats(type);
      break;
    case "help":
      showHelp();
      break;
    default:
      console.log(chalk.red(`Unknown command: ${command}`));
      showHelp();
      break;
  }
} catch (error) {
  console.error(chalk.red("Error:"), error);
}
