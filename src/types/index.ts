// Định nghĩa các loại subscription
export type SubscriptionType = 
  | 'allMids' 
  | 'notification' 
  | 'trades' 
  | 'l2Book' 
  | 'userEvents' 
  | 'userFills' 
  | 'userFundings' 
  | 'userNonFundingLedgerUpdates'
  | 'candle';

// Interface cho subscription message
export interface SubscriptionMessage {
  method: 'subscribe' | 'unsubscribe';
  subscription: Subscription;
}

// Interface cho các loại subscription
export type Subscription = 
  | AllMidsSubscription 
  | NotificationSubscription 
  | TradesSubscription 
  | L2BookSubscription 
  | UserEventsSubscription 
  | UserFillsSubscription 
  | UserFundingsSubscription 
  | UserNonFundingLedgerUpdatesSubscription
  | CandleSubscription;

// Interface cho AllMids subscription
export interface AllMidsSubscription {
  type: 'allMids';
}

// Interface cho Notification subscription
export interface NotificationSubscription {
  type: 'notification';
}

// Interface cho Trades subscription
export interface TradesSubscription {
  type: 'trades';
  coin: string;
}

// Interface cho L2Book subscription
export interface L2BookSubscription {
  type: 'l2Book';
  coin: string;
}

// Interface cho UserEvents subscription
export interface UserEventsSubscription {
  type: 'userEvents';
  user: string;
}

// Interface cho UserFills subscription
export interface UserFillsSubscription {
  type: 'userFills';
  user: string;
}

// Interface cho UserFundings subscription
export interface UserFundingsSubscription {
  type: 'userFundings';
  user: string;
}

// Interface cho UserNonFundingLedgerUpdates subscription
export interface UserNonFundingLedgerUpdatesSubscription {
  type: 'userNonFundingLedgerUpdates';
  user: string;
}

// Interface cho Candle subscription
export interface CandleSubscription {
  type: 'candle';
  coin: string;
  interval: string; // '1m', '5m', '15m', '30m', '1h', '4h', '1d'
}

// Interface cho response từ server
export interface SubscriptionResponse {
  channel: 'subscriptionResponse';
  data: {
    method: 'subscribe' | 'unsubscribe';
    subscription: Subscription;
  };
}

// Interface cho dữ liệu AllMids
export interface AllMidsData {
  channel: 'allMids';
  data: {
    mids: Record<string, string>;
  };
}

// Interface cho dữ liệu Notification
export interface NotificationData {
  channel: 'notification';
  data: {
    notification: string;
  };
}

// Interface cho dữ liệu Trades
export interface TradesData {
  channel: 'trades';
  data: WsTrade[];
}

// Interface cho WsTrade
export interface WsTrade {
  coin: string;
  side: string;
  px: string;
  sz: string;
  hash: string;
  time: number;
  tid: number;
  users?: [string, string];
}

// Interface cho dữ liệu L2Book
export interface L2BookData {
  channel: 'l2Book';
  data: WsBook;
}

// Interface cho WsBook
export interface WsBook {
  coin: string;
  levels: [Array<WsLevel>, Array<WsLevel>];
  time: number;
}

// Interface cho WsLevel
export interface WsLevel {
  px: string;
  sz: string;
  n: number;
}

// Interface cho dữ liệu Candle
export interface CandleData {
  channel: 'candle';
  data: Candle;
}

// Interface cho Candle
export interface Candle {
  t: number; // open millis
  T: number; // close millis
  s: string; // coin
  i: string; // interval
  o: number; // open price
  c: number; // close price
  h: number; // high price
  l: number; // low price
  v: number; // volume (base unit)
  n: number; // number of trades
}

// Interface cho dữ liệu UserEvents
export interface UserEventsData {
  channel: 'userEvents';
  data: WsUserEvent;
}

// Interface cho WsUserEvent
export type WsUserEvent = 
  | { fills: WsFill[] } 
  | { funding: WsUserFunding } 
  | { liquidation: WsLiquidation } 
  | { nonUserCancel: WsNonUserCancel[] };

// Interface cho WsFill
export interface WsFill {
  coin: string;
  px: string;
  sz: string;
  side: string;
  time: number;
  startPosition: string;
  dir: string;
  closedPnl: string;
  hash: string;
  oid: number;
  crossed: boolean;
  fee: string;
  tid: number;
  liquidation?: FillLiquidation;
  feeToken: string;
  builderFee?: string;
}

// Interface cho FillLiquidation
export interface FillLiquidation {
  liquidatedUser?: string;
  markPx: number;
  method: 'market' | 'backstop';
}

// Interface cho WsUserFunding
export interface WsUserFunding {
  time: number;
  coin: string;
  usdc: string;
  szi: string;
  fundingRate: string;
}

// Interface cho WsLiquidation
export interface WsLiquidation {
  lid: number;
  liquidator: string;
  liquidated_user: string;
  liquidated_ntl_pos: string;
  liquidated_account_value: string;
}

// Interface cho WsNonUserCancel
export interface WsNonUserCancel {
  coin: string;
  oid: number;
}

// Interface cho dữ liệu UserFills
export interface UserFillsData {
  channel: 'userFills';
  data: WsUserFills;
}

// Interface cho WsUserFills
export interface WsUserFills {
  isSnapshot?: boolean;
  user: string;
  fills: Array<WsFill>;
}

// Interface cho dữ liệu UserFundings
export interface UserFundingsData {
  channel: 'userFundings';
  data: WsUserFundings;
}

// Interface cho WsUserFundings
export interface WsUserFundings {
  isSnapshot?: boolean;
  user: string;
  fundings: Array<WsUserFunding>;
}

// Interface cho dữ liệu UserNonFundingLedgerUpdates
export interface UserNonFundingLedgerUpdatesData {
  channel: 'userNonFundingLedgerUpdates';
  data: WsUserNonFundingLedgerUpdates;
}

// Interface cho WsUserNonFundingLedgerUpdates
export interface WsUserNonFundingLedgerUpdates {
  isSnapshot?: boolean;
  user: string;
  updates: Array<WsUserNonFundingLedgerUpdate>;
}

// Interface cho WsUserNonFundingLedgerUpdate
export interface WsUserNonFundingLedgerUpdate {
  time: number;
  hash: string;
  delta: WsLedgerUpdate;
}

// Interface cho WsLedgerUpdate
export type WsLedgerUpdate = 
  | WsDeposit
  | WsWithdraw 
  | WsInternalTransfer 
  | WsSubAccountTransfer 
  | WsLedgerLiquidation 
  | WsVaultDelta 
  | WsVaultWithdrawal
  | WsVaultLeaderCommission
  | WsSpotTransfer
  | WsAccountClassTransfer
  | WsSpotGenesis
  | WsRewardsClaim;

// Interface cho WsDeposit
export interface WsDeposit {
  type: 'deposit';
  usdc: number;
}

// Interface cho WsWithdraw
export interface WsWithdraw {
  type: 'withdraw';
  usdc: number;
  nonce: number;
  fee: number;
}

// Interface cho WsInternalTransfer
export interface WsInternalTransfer {
  type: 'internalTransfer';
  usdc: number;
  user: string;
  destination: string;
  fee: number;
}

// Interface cho WsSubAccountTransfer
export interface WsSubAccountTransfer {
  type: 'subAccountTransfer';
  usdc: number;
  user: string;
  destination: string;
}

// Interface cho WsLedgerLiquidation
export interface WsLedgerLiquidation {
  type: 'liquidation';
  accountValue: number;
  leverageType: 'Cross' | 'Isolated';
  liquidatedPositions: Array<LiquidatedPosition>;
}

// Interface cho LiquidatedPosition
export interface LiquidatedPosition {
  coin: string;
  szi: number;
}

// Interface cho WsVaultDelta
export interface WsVaultDelta {
  type: 'vaultCreate' | 'vaultDeposit' | 'vaultDistribution';
  vault: string;
  usdc: number;
}

// Interface cho WsVaultWithdrawal
export interface WsVaultWithdrawal {
  type: 'vaultWithdraw';
  vault: string;
  user: string;
  requestedUsd: number;
  commission: number;
  closingCost: number;
  basis: number;
  netWithdrawnUsd: number;
}

// Interface cho WsVaultLeaderCommission
export interface WsVaultLeaderCommission {
  type: 'vaultLeaderCommission';
  user: string;
  usdc: number;
}

// Interface cho WsSpotTransfer
export interface WsSpotTransfer {
  type: 'spotTransfer';
  token: string;
  amount: number;
  usdcValue: number;
  user: string;
  destination: string;
  fee: number;
}

// Interface cho WsAccountClassTransfer
export interface WsAccountClassTransfer {
  type: 'accountClassTransfer';
  usdc: number;
  toPerp: boolean;
}

// Interface cho WsSpotGenesis
export interface WsSpotGenesis {
  type: 'spotGenesis';
  token: string;
  amount: number;
}

// Interface cho WsRewardsClaim
export interface WsRewardsClaim {
  type: 'rewardsClaim';
  amount: number;
} 