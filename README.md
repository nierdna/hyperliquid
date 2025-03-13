# Hyperliquid Crawler

Một ứng dụng TypeScript để crawl dữ liệu từ Hyperliquid WebSocket API.

## Giới thiệu

Hyperliquid Crawler là một ứng dụng được viết bằng TypeScript để thu thập dữ liệu từ Hyperliquid WebSocket API. Ứng dụng này cho phép bạn subscribe vào các kênh dữ liệu khác nhau như giá mid, giao dịch, sổ lệnh, nến, và các sự kiện người dùng.

## Cài đặt

1. Clone repository:
```bash
git clone https://github.com/yourusername/hyperliquid-crawler.git
cd hyperliquid-crawler
```

2. Cài đặt các dependencies:
```bash
npm install
```

3. Tạo file `.env` từ file `.env.example`:
```bash
cp .env.example .env
```

4. Chỉnh sửa file `.env` để cấu hình ứng dụng:
```bash
# Hyperliquid WebSocket API URLs
MAINNET_WS_URL=wss://api.hyperliquid.xyz/ws
TESTNET_WS_URL=wss://api.hyperliquid-testnet.xyz/ws

# Chọn mạng (MAINNET hoặc TESTNET)
NETWORK=MAINNET

# Cấu hình lưu trữ dữ liệu
DATA_DIR=./data

# Cấu hình logging
LOG_LEVEL=info
```

## Sử dụng

1. Build ứng dụng:
```bash
npm run build
```

2. Chạy ứng dụng:
```bash
npm start
```

Hoặc chạy ứng dụng trong chế độ development:
```bash
npm run dev
```

## Cấu trúc dự án

```
hyperliquid-crawler/
├── src/
│   ├── types/
│   │   └── index.ts         # Định nghĩa các interface
│   ├── utils/
│   │   ├── logger.ts        # Utility cho logging
│   │   └── storage.ts       # Utility cho lưu trữ dữ liệu
│   ├── services/
│   │   ├── websocket.ts     # Service quản lý kết nối WebSocket
│   │   └── crawler.ts       # Service quản lý việc crawl dữ liệu
│   ├── config.ts            # Cấu hình ứng dụng
│   └── index.ts             # Entry point
├── data/                    # Thư mục lưu trữ dữ liệu
├── .env                     # File cấu hình biến môi trường
├── .gitignore               # Git ignore file
├── package.json             # NPM package file
├── tsconfig.json            # TypeScript configuration
└── README.md                # Tài liệu dự án
```

## Các loại dữ liệu

Ứng dụng có thể crawl các loại dữ liệu sau từ Hyperliquid WebSocket API:

1. **allMids**: Giá mid của tất cả các coin.
2. **notification**: Thông báo từ hệ thống.
3. **trades**: Các giao dịch của một coin cụ thể.
4. **l2Book**: Sổ lệnh L2 của một coin cụ thể.
5. **candle**: Dữ liệu nến của một coin cụ thể với một khoảng thời gian cụ thể.
6. **userEvents**: Các sự kiện của một người dùng cụ thể.
7. **userFills**: Các lệnh đã được khớp của một người dùng cụ thể.
8. **userFundings**: Các khoản funding của một người dùng cụ thể.
9. **userNonFundingLedgerUpdates**: Các cập nhật sổ cái không phải funding của một người dùng cụ thể.

## Cấu hình

Bạn có thể cấu hình ứng dụng bằng cách chỉnh sửa file `.env`:

- **NETWORK**: Chọn mạng (MAINNET hoặc TESTNET).
- **DATA_DIR**: Thư mục lưu trữ dữ liệu.
- **LOG_LEVEL**: Level của log (debug, info, warn, error).

## Đóng góp

Nếu bạn muốn đóng góp vào dự án, vui lòng tạo một pull request hoặc mở một issue.

## Giấy phép

Dự án này được phân phối dưới giấy phép MIT. Xem file `LICENSE` để biết thêm chi tiết. 