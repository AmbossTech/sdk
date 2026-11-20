import type { GraphQLClient, RequestOptions } from 'graphql-request';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
type GraphQLClientRequestHeaders = RequestOptions['requestHeaders'];
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
};

export type AcceptLegalDocumentsInput = {
  payments_acceptable_use_policy: Scalars['Boolean']['input'];
  privacy_policy: Scalars['Boolean']['input'];
  terms_of_service: Scalars['Boolean']['input'];
};

export type AccountBalance = {
  balances: Array<Balances>;
  financial_changes: FinancialChanges;
  id: Scalars['String']['output'];
};

export type AccountInfo = {
  company_name?: Maybe<Scalars['String']['output']>;
  first_name?: Maybe<Scalars['String']['output']>;
  id: Scalars['String']['output'];
  last_name?: Maybe<Scalars['String']['output']>;
  location?: Maybe<Scalars['String']['output']>;
  us_state?: Maybe<Scalars['String']['output']>;
};

export type ActivityChart = {
  chart: Array<ActivityPeriod>;
  id: Scalars['String']['output'];
  interval: AggregateInterval;
};

export type ActivityCount = {
  count: Scalars['Float']['output'];
  id: Scalars['String']['output'];
  type: TransactionType;
};

export type ActivityPeriod = {
  /** Event counts by type. Types with no events are left out. */
  counts: Array<ActivityCount>;
  id: Scalars['String']['output'];
  period: Scalars['String']['output'];
};

export type AddPartnerNodeInput = {
  node_id: Scalars['String']['input'];
  pubkey: Scalars['String']['input'];
};

export type AggregateInterval =
  | 'DAY'
  | 'MONTH'
  | 'WEEK'
  | 'YEAR';

export type AssetBalance = {
  amount: BitcoinAssetAmount;
  id: Scalars['String']['output'];
};

export type AssetBalances = {
  asset: BitcoinAsset;
  channel_balance: AssetBalance;
  id: Scalars['String']['output'];
  is_automated: Scalars['Boolean']['output'];
  onchain_balance: AssetBalance;
  percentage: Scalars['Float']['output'];
  quotes?: Maybe<AssetOracleQuotes>;
  total_balance: AssetBalance;
};

export type AssetOracleQuotes = {
  ask?: Maybe<BitcoinAssetAmount>;
  bid?: Maybe<BitcoinAssetAmount>;
  id: Scalars['String']['output'];
};

export type AssignLightningAddressWalletInput = {
  id: Scalars['String']['input'];
  wallet_id?: InputMaybe<Scalars['String']['input']>;
};

/** Trimmed Taproot Asset representation used in the taproot_assets list view. Contains only the metadata required for proof-courier setup, asset identification (symbol, group_key, universe) and amount scaling (precision). See BitcoinAsset for the full type, which additionally carries type and pricing. */
export type AvailableTaprootAsset = {
  group_key?: Maybe<Scalars['String']['output']>;
  id: Scalars['String']['output'];
  precision: Scalars['Float']['output'];
  symbol: Scalars['String']['output'];
  universe: Scalars['String']['output'];
};

export type BalanceChart = {
  chart: Array<BalancePeriod>;
  id: Scalars['String']['output'];
  interval: AggregateInterval;
};

export type BalancePeriod = {
  balance: SatoshiAmount;
  id: Scalars['String']['output'];
  period: Scalars['String']['output'];
};

export type Balances = {
  alltime_leasing_revenue: SatoshiAmount;
  alltime_onchain_costs: SatoshiAmount;
  alltime_routing_revenue: SatoshiAmount;
  available: SatoshiAmount;
  balance: SatoshiAmount;
  created_at: Scalars['String']['output'];
  earnings: SatoshiAmount;
  id: Scalars['String']['output'];
  principal: SatoshiAmount;
  reserved: SatoshiAmount;
};

/** Full asset record for a supported Bitcoin or Taproot Asset. Includes type, precision, and pricing alongside identity fields. AvailableTaprootAsset is the trimmed counterpart used when only proof-courier metadata (group_key, universe) is needed; it does not carry type or precision. */
export type BitcoinAsset = {
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['String']['output'];
  precision: Scalars['Float']['output'];
  prices: BitcoinAssetPrices;
  symbol: Scalars['String']['output'];
  taproot_asset_details?: Maybe<TaprootAssetDetails>;
  type: BitcoinAssetType;
  website_url?: Maybe<Scalars['String']['output']>;
};

export type BitcoinAssetAmount = {
  display_amount: Scalars['String']['output'];
  full_amount: Scalars['String']['output'];
  id: Scalars['String']['output'];
  value: BitcoinAssetValue;
};

export type BitcoinAssetPrices = {
  id: Scalars['String']['output'];
  /** Price of one display unit of the asset in satoshis, derived from the USD spot prices of the asset and BTC. Always 100000000 for the BTC base asset. */
  sats: Scalars['String']['output'];
  usd: Scalars['String']['output'];
};

export type BitcoinAssetType =
  | 'BASE_ASSET'
  | 'TAPROOT_ASSET';

export type BitcoinAssetValue = {
  id: Scalars['String']['output'];
  usd_value: Scalars['String']['output'];
};

export type CapitalChart = {
  /** Periods without a balance snapshot are left out */
  chart: Array<CapitalPeriod>;
  id: Scalars['String']['output'];
  interval: AggregateInterval;
};

export type CapitalPeriod = {
  /** Local balance in channels at the end of the period */
  channels: SatoshiAmount;
  id: Scalars['String']['output'];
  /** On-chain funds, confirmed and pending, at the end of the period */
  onchain: SatoshiAmount;
  period: Scalars['String']['output'];
};

export type Charts = {
  /** Number of events per period, using the same events as transaction_list */
  activity: ActivityChart;
  balance: BalanceChart;
  /** Where the funds sat over time: on-chain or in channels */
  capital: CapitalChart;
  id: Scalars['String']['output'];
  revenue: RevenueChart;
};

export type CheckPasswordResult = {
  success: Scalars['Boolean']['output'];
};

/** Which checkout theme a logo is for */
export type CheckoutLogoTheme =
  | 'DARK'
  | 'LIGHT';

export type CheckoutStyleMutations = {
  create: PaymentsCheckoutStyle;
  delete: Scalars['Boolean']['output'];
  remove_logo: PaymentsCheckoutStyle;
  update: PaymentsCheckoutStyle;
};


export type CheckoutStyleMutationsCreateArgs = {
  input: CreateCheckoutStyleInput;
};


export type CheckoutStyleMutationsDeleteArgs = {
  id: Scalars['String']['input'];
};


export type CheckoutStyleMutationsRemove_LogoArgs = {
  id: Scalars['String']['input'];
  theme?: CheckoutLogoTheme;
};


export type CheckoutStyleMutationsUpdateArgs = {
  input: UpdateCheckoutStyleInput;
};

export type CheckoutStyleQueries = {
  find_many: Array<PaymentsCheckoutStyle>;
  find_one: PaymentsCheckoutStyle;
  id: Scalars['String']['output'];
};


export type CheckoutStyleQueriesFind_OneArgs = {
  id: Scalars['String']['input'];
};

export type ConnectLitdInput = {
  grpc: Scalars['String']['input'];
  management_macaroon: Scalars['String']['input'];
  rest: Scalars['String']['input'];
  taproot_assets?: InputMaybe<Scalars['Boolean']['input']>;
  tls_cert?: InputMaybe<Scalars['String']['input']>;
};

export type ConnectLndInput = {
  grpc: Scalars['String']['input'];
  management_macaroon: Scalars['String']['input'];
  rest: Scalars['String']['input'];
  tls_cert?: InputMaybe<Scalars['String']['input']>;
};

export type CreateCheckoutInput = {
  return_url?: InputMaybe<Scalars['String']['input']>;
  /** Checkout style to show on the checkout page */
  style_id?: InputMaybe<Scalars['String']['input']>;
  success_url?: InputMaybe<Scalars['String']['input']>;
};

export type CreateCheckoutStyleInput = {
  brand_color?: InputMaybe<Scalars['String']['input']>;
  display_name?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
};

export type CreateInvoiceInput = {
  amount_sats?: InputMaybe<Scalars['String']['input']>;
  asset_amount?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  expires_at?: InputMaybe<Scalars['String']['input']>;
  group_key?: InputMaybe<Scalars['String']['input']>;
  node_id: Scalars['String']['input'];
  peer_pubkey?: InputMaybe<Scalars['String']['input']>;
  swap_node_pubkey?: InputMaybe<Scalars['String']['input']>;
};

export type CreateInvoiceResult = {
  id: Scalars['String']['output'];
  payment_request: Scalars['String']['output'];
};

export type CreateLightningAddressInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  environment_id: Scalars['String']['input'];
  name: Scalars['String']['input'];
  wallet_id?: InputMaybe<Scalars['String']['input']>;
};

export type CreateLoopInSwapInput = {
  amount_sat: Scalars['Int']['input'];
  transaction_id: Scalars['String']['input'];
};

export type CreatePaymentDestinationInput = {
  currency?: InputMaybe<PaymentDestinationCurrency>;
  environment_id: Scalars['String']['input'];
  label: Scalars['String']['input'];
  lightning_address?: InputMaybe<Scalars['String']['input']>;
};

export type CreatePaymentsEnvironmentInput = {
  live?: InputMaybe<LivePaymentsEnvironmentInput>;
  name: Scalars['String']['input'];
  type: PaymentsEnvironmentType;
};

export type CreatePaymentsEnvironmentResult = {
  checkout_url?: Maybe<Scalars['String']['output']>;
  environment: PaymentsEnvironment;
};

export type CreatePaymentsWalletInput = {
  asset_id: Scalars['String']['input'];
  environment_id: Scalars['String']['input'];
  name: Scalars['String']['input'];
};

export type CreateReceiveBolt11Input = {
  description_hash?: InputMaybe<Scalars['String']['input']>;
};

export type CreateReceiveTransactionInput = {
  amount: Scalars['String']['input'];
  bolt11?: InputMaybe<CreateReceiveBolt11Input>;
  checkout?: InputMaybe<CreateCheckoutInput>;
  description?: InputMaybe<Scalars['String']['input']>;
  expires_in_seconds?: InputMaybe<Scalars['Int']['input']>;
  idempotency_key?: InputMaybe<Scalars['String']['input']>;
  metadata?: InputMaybe<Scalars['String']['input']>;
  wallet_id: Scalars['String']['input'];
};

export type CreateSendTransactionInput = {
  address?: InputMaybe<SendByAddress>;
  destination?: InputMaybe<SendByDestination>;
  idempotency_key?: InputMaybe<Scalars['String']['input']>;
  metadata?: InputMaybe<Scalars['String']['input']>;
  request?: InputMaybe<SendByRequest>;
  wallet_id: Scalars['String']['input'];
};

export type CreateServiceApiKeyInput = {
  environment_id: Scalars['String']['input'];
  /** ISO date string. If omitted, the key never expires. */
  expires_at?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  node_id?: InputMaybe<Scalars['String']['input']>;
  permissions: Array<ServiceApiKeyPermissionInput>;
  wallet_id?: InputMaybe<Scalars['String']['input']>;
};

export type CreateServiceApiKeyResult = {
  key: ServiceApiKey;
  plaintext_key: Scalars['String']['output'];
};

export type CreateSwapInput = {
  /** Payer address on the same chain. A late or short payment goes back here. */
  refund_address: Scalars['String']['input'];
  /** Only "USDT" for now */
  source_asset: Scalars['String']['input'];
  /** Only "tron" for now */
  source_chain: Scalars['String']['input'];
  /** The receive the swap pays */
  transaction_id: Scalars['String']['input'];
};

export type CreateWebhookEndpointInput = {
  environment_id: Scalars['String']['input'];
  event_filters?: InputMaybe<Array<Scalars['String']['input']>>;
  url: Scalars['String']['input'];
};

export type CreateWebhookEndpointResult = {
  endpoint: WebhookEndpoint;
  secret: Scalars['String']['output'];
};

export type CredentialMutations = {
  store_admin: Scalars['Boolean']['output'];
  store_management: Scalars['Boolean']['output'];
};


export type CredentialMutationsStore_AdminArgs = {
  input: StoreAdminCredentialsInput;
};


export type CredentialMutationsStore_ManagementArgs = {
  input: StoreManagementCredentialsInput;
};

export type DateRangeInput = {
  /** Inclusive lower bound */
  from?: InputMaybe<Scalars['String']['input']>;
  /** Exclusive upper bound */
  to?: InputMaybe<Scalars['String']['input']>;
};

export type DeployManagedNode = {
  node_id: Scalars['String']['output'];
  success: Scalars['Boolean']['output'];
};

export type DeployedNode = {
  alias?: Maybe<Scalars['String']['output']>;
  backup?: Maybe<NodeBackup>;
  created_at: Scalars['String']['output'];
  credentials: NodeMacaroonList;
  deactivation_initiated?: Maybe<Scalars['String']['output']>;
  deleted_at?: Maybe<Scalars['String']['output']>;
  funds_available_at: Scalars['String']['output'];
  id: Scalars['String']['output'];
  is_automated: Scalars['Boolean']['output'];
  network: DeployedNodeNetwork;
  node_type: ManagedNodeType;
  partners: PartnerNodeList;
  password: Scalars['String']['output'];
  pubkey?: Maybe<Scalars['String']['output']>;
  sockets: NodeSockets;
  state: DeployedNodeState;
  taproot_assets_enabled: Scalars['Boolean']['output'];
  type: DeployedNodeType;
  withdrawal_target: Scalars['String']['output'];
};

export type DeployedNodeMacaroonLocation =
  | 'LITD'
  | 'LND'
  | 'TAPD';

export type DeployedNodeNetwork =
  | 'MAINNET'
  | 'MUTINYNET'
  | 'TESTNET';

export type DeployedNodeState =
  | 'ACTIVE'
  | 'CREATED'
  | 'DELETED'
  | 'DELETION_INITIATED'
  | 'PROVISIONED'
  | 'PROVISIONING_FAILED'
  | 'WAITING_FOR_ACTIVATION'
  | 'WAITING_FOR_CREDENTIALS'
  | 'WAITING_FOR_DEPOSIT'
  | 'WAITING_FOR_INIT';

export type DeployedNodeType =
  | 'LP'
  | 'P2P_TRADE'
  | 'PAYMENTS';

export type DepositStats = {
  first_deposit?: Maybe<Scalars['String']['output']>;
  id: Scalars['String']['output'];
};

export type DestinationMutations = {
  create: PaymentDestination;
  delete: Scalars['Boolean']['output'];
  id: Scalars['String']['output'];
  update: PaymentDestination;
};


export type DestinationMutationsCreateArgs = {
  input: CreatePaymentDestinationInput;
};


export type DestinationMutationsDeleteArgs = {
  id: Scalars['String']['input'];
};


export type DestinationMutationsUpdateArgs = {
  input: UpdatePaymentDestinationInput;
};

export type DestinationQueries = {
  find_many: FindManyPaymentDestinations;
  find_one: PaymentDestination;
  id: Scalars['String']['output'];
};


export type DestinationQueriesFind_OneArgs = {
  id: Scalars['String']['input'];
};

export type DisableTaprootAssetsInput = {
  node_id: Scalars['String']['input'];
};

export type DisableTaprootAssetsResult = {
  success: Scalars['Boolean']['output'];
};

export type EnableTaprootAssetsInput = {
  grpc?: InputMaybe<Scalars['String']['input']>;
  node_id: Scalars['String']['input'];
  rest?: InputMaybe<Scalars['String']['input']>;
};

export type EnableTaprootAssetsResult = {
  success: Scalars['Boolean']['output'];
};

export type EnvironmentMutations = {
  create: CreatePaymentsEnvironmentResult;
  delete: Scalars['Boolean']['output'];
  id: Scalars['String']['output'];
};


export type EnvironmentMutationsCreateArgs = {
  input: CreatePaymentsEnvironmentInput;
};


export type EnvironmentMutationsDeleteArgs = {
  id: Scalars['String']['input'];
};

export type EnvironmentQueries = {
  find_many: FindManyEnvironments;
  find_one: PaymentsEnvironment;
  id: Scalars['String']['output'];
};


export type EnvironmentQueriesFind_OneArgs = {
  id: Scalars['String']['input'];
};

export type ExpectedPermissions = {
  id: Scalars['String']['output'];
  lnd: LndPermissions;
};

export type FinancialChanges = {
  id: Scalars['String']['output'];
  leasing_revenue_change: SatoshiAmount;
  onchain_costs_change: SatoshiAmount;
  routing_revenue_change: SatoshiAmount;
};

export type FindManyEnvironments = {
  id: Scalars['String']['output'];
  list: Array<SimplePaymentsEnvironment>;
};

export type FindManyLightningAddresses = {
  /** Lightning addresses visible to the caller: team-wide for JWT, environment-wide for API keys */
  count: Scalars['Int']['output'];
  id: Scalars['String']['output'];
  list: Array<LightningAddress>;
  /** Most Lightning addresses a team can have */
  max: Scalars['Int']['output'];
};


export type FindManyLightningAddressesListArgs = {
  environment_id: Scalars['String']['input'];
};

export type FindManyPaymentDestinations = {
  id: Scalars['String']['output'];
  list: Array<PaymentDestination>;
};


export type FindManyPaymentDestinationsListArgs = {
  environment_id: Scalars['String']['input'];
};

export type FindManyTransactions = {
  id: Scalars['String']['output'];
  list: Array<SimplePaymentsTransaction>;
  pagination: Pagination;
  total_count: Scalars['Int']['output'];
};

export type FindManyWallets = {
  id: Scalars['String']['output'];
  list: Array<SimplePaymentsWallet>;
};


export type FindManyWalletsListArgs = {
  environment_id: Scalars['String']['input'];
};

export type FindManyWebhookEndpoints = {
  id: Scalars['String']['output'];
  list: Array<SimpleWebhookEndpoint>;
};


export type FindManyWebhookEndpointsListArgs = {
  environment_id: Scalars['String']['input'];
};

export type FindManyWebhookEvents = {
  id: Scalars['String']['output'];
  list: Array<SimpleWebhookEvent>;
  pagination: Pagination;
  total_count: Scalars['Int']['output'];
};

export type FindOneTransactionLightningInput = {
  payment_hash?: InputMaybe<Scalars['String']['input']>;
};

export type Funds = {
  available: SatoshiAmount;
  earnings: SatoshiAmount;
  id: Scalars['String']['output'];
  reserved: SatoshiAmount;
  total: SatoshiAmount;
};

export type IncreaseWithdrawalInput = {
  amount_sats: Scalars['String']['input'];
  node_id: Scalars['String']['input'];
  password_hash?: InputMaybe<Scalars['String']['input']>;
};

export type Lease = {
  closed_at?: Maybe<Scalars['String']['output']>;
  /** Minimum number of blocks the channel is leased for */
  duration_blocks: Scalars['Float']['output'];
  /** Estimated end of the lease: open time plus duration_blocks at ten minutes per block */
  expected_end?: Maybe<Scalars['String']['output']>;
  /** Fee received for the lease */
  fee: SatoshiAmount;
  id: Scalars['String']['output'];
  opened_at?: Maybe<Scalars['String']['output']>;
  /** Channel size sold */
  size: SatoshiAmount;
  sold_at: Scalars['String']['output'];
  /** PENDING until the channel opens, ACTIVE while it is open, CLOSED after */
  status: LeaseStatus;
};

export type LeaseStatus =
  | 'ACTIVE'
  | 'CLOSED'
  | 'PENDING';

export type LegalAcceptance = {
  id: Scalars['String']['output'];
  payments_acceptable_use_policy: Scalars['Boolean']['output'];
  privacy_policy: Scalars['Boolean']['output'];
  terms_of_service: Scalars['Boolean']['output'];
};

export type LightningAddress = {
  created_at: Scalars['String']['output'];
  /** Shown in the payer's wallet. Null means the default text: Payment to name@domain */
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['String']['output'];
  name: Scalars['String']['output'];
  updated_at: Scalars['String']['output'];
  wallet_id?: Maybe<Scalars['String']['output']>;
};

export type LightningAddressMutations = {
  assign_wallet: LightningAddress;
  create: LightningAddress;
  update_description: LightningAddress;
};


export type LightningAddressMutationsAssign_WalletArgs = {
  input: AssignLightningAddressWalletInput;
};


export type LightningAddressMutationsCreateArgs = {
  input: CreateLightningAddressInput;
};


export type LightningAddressMutationsUpdate_DescriptionArgs = {
  input: UpdateLightningAddressDescriptionInput;
};

export type LightningAddressQueries = {
  find_many: FindManyLightningAddresses;
  find_one: LightningAddress;
  id: Scalars['String']['output'];
};


export type LightningAddressQueriesFind_OneArgs = {
  id: Scalars['String']['input'];
};

export type LiquidityProvider = {
  assets?: Maybe<LiquidityProviderAssets>;
  /** @deprecated Snapshot history is no longer shown. Use charts.balance and funds instead. */
  balances: AccountBalance;
  charts: Charts;
  funds: Funds;
  id: Scalars['String']['output'];
  /** Every channel sale of this account, newest first */
  leases: Array<Lease>;
  node_id: Scalars['String']['output'];
  revenue: Revenue;
  stats: Stats;
  total_value: TotalValue;
  transaction_list: TransactionList;
};


export type LiquidityProviderTransaction_ListArgs = {
  input?: InputMaybe<TransactionInput>;
};

export type LiquidityProviderAsset = {
  balances: Array<AssetBalances>;
  id: Scalars['String']['output'];
};

export type LiquidityProviderAssets = {
  id: Scalars['String']['output'];
  list: LiquidityProviderAsset;
};

export type LiquidityProviderInput = {
  from?: InputMaybe<Scalars['String']['input']>;
  /** Chart bucket size. When omitted it is derived from the date range. */
  interval?: InputMaybe<AggregateInterval>;
  node_id?: InputMaybe<Scalars['String']['input']>;
  to?: InputMaybe<Scalars['String']['input']>;
};

export type LiquidityStats = {
  id: Scalars['String']['output'];
  partners: Scalars['Float']['output'];
  provided_liquidity: Scalars['String']['output'];
  sales: Scalars['Float']['output'];
};

export type ListTransactionsFilterInput = {
  date_range?: InputMaybe<DateRangeInput>;
  direction?: InputMaybe<PaymentsTransactionDirection>;
  status?: InputMaybe<PaymentsTransactionStatus>;
};

export type ListTransactionsInput = {
  environment_id?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<ListTransactionsFilterInput>;
  page?: InputMaybe<PageInput>;
  wallet_id?: InputMaybe<Scalars['String']['input']>;
};

export type ListWebhookEventsFilterInput = {
  date_range?: InputMaybe<DateRangeInput>;
  endpoint_id?: InputMaybe<Scalars['String']['input']>;
  event_type?: InputMaybe<Scalars['String']['input']>;
  transaction_id?: InputMaybe<Scalars['String']['input']>;
  wallet_id?: InputMaybe<Scalars['String']['input']>;
};

export type ListWebhookEventsInput = {
  environment_id: Scalars['String']['input'];
  filter?: InputMaybe<ListWebhookEventsFilterInput>;
  page?: InputMaybe<PageInput>;
};

export type LitdSockets = {
  grpc: Scalars['String']['output'];
  id: Scalars['String']['output'];
  rest: Scalars['String']['output'];
};

export type LivePaymentsEnvironmentInput = {
  cancel_url: Scalars['String']['input'];
  success_url: Scalars['String']['input'];
};

export type LndPermissions = {
  default: Array<Scalars['String']['output']>;
  id: Scalars['String']['output'];
  p2p_trade: Array<Scalars['String']['output']>;
  taproot_assets: Array<Scalars['String']['output']>;
};

export type LndSockets = {
  grpc: Scalars['String']['output'];
  id: Scalars['String']['output'];
  rest: Scalars['String']['output'];
};

export type LoopInSwap = {
  /** On-chain address for the payer to send to */
  address: Scalars['String']['output'];
  /** What lands on the node over Lightning, after the swap fee */
  lightning_amount_sat: Scalars['Int']['output'];
  onchain_amount_sat: Scalars['Int']['output'];
  swap_fee_sat: Scalars['Int']['output'];
  swap_id: Scalars['String']['output'];
};

export type MacaroonEncryptionType =
  | 'CLIENT'
  | 'SERVER';

export type MacaroonType =
  | 'ADMIN'
  | 'MANAGEMENT'
  | 'SUPERADMIN';

export type ManagedNodeType =
  | 'FULLY_MANAGED'
  | 'THIRD_PARTY';

export type MintStreamTokenInput = {
  id: Scalars['String']['input'];
  scope: StreamTokenScope;
};

export type Mutation = {
  credentials: CredentialMutations;
  node: NodeMutations;
  payment: PaymentMutations;
  public: PublicMutations;
  service_api_key: ServiceApiKeyMutations;
  user: UserMutations;
};

export type NodeAssetMutations = {
  disable_taproot_assets: DisableTaprootAssetsResult;
  enable_taproot_assets: EnableTaprootAssetsResult;
  set_asset_config: SetAssetConfigResult;
};


export type NodeAssetMutationsDisable_Taproot_AssetsArgs = {
  input: DisableTaprootAssetsInput;
};


export type NodeAssetMutationsEnable_Taproot_AssetsArgs = {
  input: EnableTaprootAssetsInput;
};


export type NodeAssetMutationsSet_Asset_ConfigArgs = {
  input: SetAutomatedAssetInput;
};

export type NodeBackup = {
  created_at: Scalars['String']['output'];
  id: Scalars['String']['output'];
  latest: Scalars['String']['output'];
  size: Scalars['Float']['output'];
};

export type NodeChangeSettings = {
  new_alias?: Maybe<Scalars['String']['output']>;
};

export type NodeConnectInput = {
  litd?: InputMaybe<ConnectLitdInput>;
  lnd?: InputMaybe<ConnectLndInput>;
  node_type?: DeployedNodeType;
};

export type NodeConnection = {
  node_id: Scalars['String']['output'];
  success: Scalars['Boolean']['output'];
};

export type NodeDeactivation = {
  success: Scalars['Boolean']['output'];
};

export type NodeDeactivationInput = {
  node_id: Scalars['String']['input'];
  password_hash?: InputMaybe<Scalars['String']['input']>;
};

export type NodeInvoice = {
  create: CreateInvoiceResult;
};


export type NodeInvoiceCreateArgs = {
  input: CreateInvoiceInput;
};

export type NodeMacaroon = {
  encryption_type: MacaroonEncryptionType;
  id: Scalars['String']['output'];
  is_admin: Scalars['Boolean']['output'];
  location: DeployedNodeMacaroonLocation;
  macaroon: Scalars['String']['output'];
  macaroon_type: MacaroonType;
  permissions?: Maybe<Array<Scalars['String']['output']>>;
};

export type NodeMacaroonList = {
  id: Scalars['String']['output'];
  list: Array<NodeMacaroon>;
};

export type NodeMutations = {
  activate: NodeSubscription;
  asset: NodeAssetMutations;
  change_settings: NodeChangeSettings;
  connect: NodeConnection;
  deactivate: NodeDeactivation;
  deploy: DeployManagedNode;
  invoices: NodeInvoice;
  partners: NodePartners;
  withdrawal: NodeWithdrawal;
};


export type NodeMutationsActivateArgs = {
  cancel_url: Scalars['String']['input'];
  node_id: Scalars['String']['input'];
  success_url: Scalars['String']['input'];
};


export type NodeMutationsChange_SettingsArgs = {
  input: NodeSettingsInput;
};


export type NodeMutationsConnectArgs = {
  input: NodeConnectInput;
};


export type NodeMutationsDeactivateArgs = {
  input: NodeDeactivationInput;
};


export type NodeMutationsDeployArgs = {
  network?: InputMaybe<DeployedNodeNetwork>;
  type?: Scalars['String']['input'];
};

export type NodePartners = {
  add: PartnerNode;
  remove: Scalars['Boolean']['output'];
};


export type NodePartnersAddArgs = {
  input: AddPartnerNodeInput;
};


export type NodePartnersRemoveArgs = {
  input: RemovePartnerNodeInput;
};

export type NodePermission = {
  encrypted_macaroon: Scalars['String']['output'];
  id: Scalars['String']['output'];
  macaroon_id: Scalars['String']['output'];
  network: DeployedNodeNetwork;
  node_id: Scalars['String']['output'];
  sockets: NodePermissionSockets;
  tls_cert?: Maybe<Scalars['String']['output']>;
};

export type NodePermissionSockets = {
  id: Scalars['String']['output'];
  litd?: Maybe<SocketEndpoints>;
  lnd?: Maybe<SocketEndpoints>;
};

export type NodeQueries = {
  deployed_node: DeployedNode;
  deployed_nodes: Array<DeployedNode>;
  id: Scalars['String']['output'];
};


export type NodeQueriesDeployed_NodeArgs = {
  node_id: Scalars['String']['input'];
};

export type NodeSettingsInput = {
  alias?: InputMaybe<Scalars['String']['input']>;
  node_id: Scalars['String']['input'];
};

export type NodeSockets = {
  id: Scalars['String']['output'];
  litd?: Maybe<LitdSockets>;
  lnd?: Maybe<LndSockets>;
};

export type NodeSubscription = {
  external_url?: Maybe<Scalars['String']['output']>;
  success: Scalars['Boolean']['output'];
};

export type NodeWithdrawal = {
  increase_withdrawal_target: NodeWithdrawalResult;
};


export type NodeWithdrawalIncrease_Withdrawal_TargetArgs = {
  input: IncreaseWithdrawalInput;
};

export type NodeWithdrawalResult = {
  amount: Scalars['String']['output'];
};

export type OfferInput = {
  asset_id?: InputMaybe<Scalars['String']['input']>;
  min_amount?: InputMaybe<Scalars['String']['input']>;
  page?: InputMaybe<PageInput>;
  sort_by?: InputMaybe<OfferSortBy>;
  sort_dir?: InputMaybe<SortDirection>;
  transaction_type: SwapTransactionType;
};

export type OfferSortBy =
  | 'AVAILABLE'
  | 'RATE';

export type PageInput = {
  limit: Scalars['Float']['input'];
  offset: Scalars['Float']['input'];
};

export type Pagination = {
  limit: Scalars['Float']['output'];
  offset: Scalars['Float']['output'];
};

export type PartnerNode = {
  id: Scalars['String']['output'];
  node: SimpleNode;
};

export type PartnerNodeList = {
  id: Scalars['String']['output'];
  list: Array<PartnerNode>;
};

export type PaymentDestination = {
  created_at: Scalars['String']['output'];
  currency?: Maybe<PaymentDestinationCurrency>;
  id: Scalars['String']['output'];
  label: Scalars['String']['output'];
  type: Scalars['String']['output'];
  updated_at: Scalars['String']['output'];
  value: PaymentDestinationValueObject;
};

/** Fiat currency associated with a payment destination. */
export type PaymentDestinationCurrency =
  | 'EUR'
  | 'MXN'
  | 'USD';

export type PaymentDestinationValueObject = {
  lightning_address?: Maybe<Scalars['String']['output']>;
};

export type PaymentInfoQueries = {
  /** Cached BTC price in USD. New receives read the same cache for exchange_rate, so a receive created after the hourly refresh saves a newer price. Null when no price is available. */
  btc_usd_price?: Maybe<Scalars['String']['output']>;
  id: Scalars['String']['output'];
  live_setup: PaymentLiveSetup;
  pricing: PaymentsPricing;
};

export type PaymentLiveSetup = {
  active_subscription: Scalars['Boolean']['output'];
  id: Scalars['String']['output'];
};

export type PaymentMutations = {
  checkout_style: CheckoutStyleMutations;
  destination: DestinationMutations;
  environment: EnvironmentMutations;
  id: Scalars['String']['output'];
  lightning_address: LightningAddressMutations;
  stream_token: StreamTokenMutations;
  transaction: TransactionMutations;
  wallet: WalletMutations;
  webhook_endpoint: WebhookEndpointMutations;
};

export type PaymentQueries = {
  checkout_style: CheckoutStyleQueries;
  destination: DestinationQueries;
  environment: EnvironmentQueries;
  id: Scalars['String']['output'];
  info: PaymentInfoQueries;
  lightning_address: LightningAddressQueries;
  transaction: TransactionQueries;
  wallet: WalletQueries;
  webhook_endpoint: WebhookEndpointQueries;
  webhook_event: WebhookEventQueries;
};

export type PaymentsCheckout = {
  id: Scalars['String']['output'];
  return_url?: Maybe<Scalars['String']['output']>;
  style_id?: Maybe<Scalars['String']['output']>;
  success_url?: Maybe<Scalars['String']['output']>;
  /** Link to send to the customer to pay this checkout */
  url?: Maybe<Scalars['String']['output']>;
};

/** How a checkout page looks. A checkout created with style_id uses it. */
export type PaymentsCheckoutStyle = {
  /** Hex colour like #ff0080, used for the pay button */
  brand_color?: Maybe<Scalars['String']['output']>;
  created_at: Scalars['String']['output'];
  /** Shown to the customer in the checkout header */
  display_name?: Maybe<Scalars['String']['output']>;
  id: Scalars['String']['output'];
  /** Shown instead of logo_url when the checkout page is dark. Without it, the dark page shows logo_url. */
  logo_dark_url?: Maybe<Scalars['String']['output']>;
  logo_url?: Maybe<Scalars['String']['output']>;
  /** Shown only to the merchant, to tell checkout styles apart */
  name: Scalars['String']['output'];
};

/** Full environment record, returned when fetching a single environment. */
export type PaymentsEnvironment = {
  created_at: Scalars['String']['output'];
  id: Scalars['String']['output'];
  name: Scalars['String']['output'];
  type: PaymentsEnvironmentType;
  updated_at: Scalars['String']['output'];
  wallet_count: Scalars['Int']['output'];
};

export type PaymentsEnvironmentType =
  | 'LIVE'
  | 'SANDBOX';

export type PaymentsOnboarding = {
  business_name: Scalars['String']['output'];
  id: Scalars['String']['output'];
  industry: Scalars['String']['output'];
  intended_payment_usage: Scalars['String']['output'];
  /** ISO 3166-1 alpha-2 country code */
  jurisdiction: Scalars['String']['output'];
  submitted_at: Scalars['String']['output'];
  website: Scalars['String']['output'];
};

export type PaymentsPricing = {
  platform_fee_usd_cents: Scalars['Float']['output'];
  volume_fee_bps: Scalars['Float']['output'];
};

export type PaymentsTransaction = {
  amount: BitcoinAssetAmount;
  amount_sats?: Maybe<Scalars['String']['output']>;
  asset: BitcoinAsset;
  checkout?: Maybe<PaymentsCheckout>;
  created_at: Scalars['String']['output'];
  description?: Maybe<Scalars['String']['output']>;
  direction: PaymentsTransactionDirection;
  error?: Maybe<Scalars['String']['output']>;
  events: Array<PaymentsTransactionEvent>;
  exchange_rate?: Maybe<Scalars['String']['output']>;
  expires_at?: Maybe<Scalars['String']['output']>;
  fee?: Maybe<Scalars['String']['output']>;
  id: Scalars['String']['output'];
  idempotency_key: Scalars['String']['output'];
  /** True for a FAILED send whose payment_request has not expired yet, so the same invoice can be paid again. */
  is_retryable: Scalars['Boolean']['output'];
  metadata?: Maybe<Scalars['String']['output']>;
  node_id?: Maybe<Scalars['String']['output']>;
  payment_hash?: Maybe<Scalars['String']['output']>;
  payment_request?: Maybe<Scalars['String']['output']>;
  preimage?: Maybe<Scalars['String']['output']>;
  settle_amount?: Maybe<BitcoinAssetAmount>;
  /** @deprecated Use settle_amount instead. */
  settle_amount_sats?: Maybe<Scalars['String']['output']>;
  settled_at?: Maybe<Scalars['String']['output']>;
  status: PaymentsTransactionStatus;
  updated_at: Scalars['String']['output'];
  wallet_id: Scalars['String']['output'];
};

export type PaymentsTransactionDirection =
  | 'RECEIVE'
  | 'SEND';

export type PaymentsTransactionEvent = {
  created_at: Scalars['String']['output'];
  details?: Maybe<Scalars['String']['output']>;
  event_type: Scalars['String']['output'];
  id: Scalars['String']['output'];
  message?: Maybe<Scalars['String']['output']>;
};

export type PaymentsTransactionStatus =
  | 'COMPLETED'
  | 'EXPIRED'
  | 'FAILED'
  | 'PENDING';

/** Full wallet record, returned when fetching a single wallet. Includes all fields from SimplePaymentsWallet plus balance, environment, nodes, node_permissions, and updated_at. */
export type PaymentsWallet = {
  asset: BitcoinAsset;
  asset_id: Scalars['String']['output'];
  balance: PaymentsWalletBalance;
  created_at: Scalars['String']['output'];
  environment: PaymentsEnvironment;
  environment_id: Scalars['String']['output'];
  id: Scalars['String']['output'];
  /** Whether the wallet can receive payments. Always true in sandbox; in live it becomes true once the node has inbound asset-channel liquidity. */
  is_ready: Scalars['Boolean']['output'];
  name: Scalars['String']['output'];
  node_permissions: WalletNodePermissions;
  nodes: Array<DeployedNode>;
  team_id: Scalars['String']['output'];
  updated_at: Scalars['String']['output'];
};


/** Full wallet record, returned when fetching a single wallet. Includes all fields from SimplePaymentsWallet plus balance, environment, nodes, node_permissions, and updated_at. */
export type PaymentsWalletNode_PermissionsArgs = {
  password_hash?: InputMaybe<Scalars['String']['input']>;
};

export type PaymentsWalletBalance = {
  balance: Scalars['String']['output'];
  received: Scalars['String']['output'];
  sent: Scalars['String']['output'];
};

export type PermissionCommandsLnd = {
  default: Scalars['String']['output'];
  id: Scalars['String']['output'];
  p2p_trade: Scalars['String']['output'];
  taproot_assets: Scalars['String']['output'];
};

export type PermissionQueries = {
  expected_permissions: ExpectedPermissions;
  id: Scalars['String']['output'];
  permission_commands: PermissionsCommand;
};

export type PermissionsCommand = {
  id: Scalars['String']['output'];
  lnd: PermissionCommandsLnd;
};

export type PublicAssetQueries = {
  id: Scalars['String']['output'];
  supported: SupportedAssetList;
};


export type PublicAssetQueriesSupportedArgs = {
  input?: InputMaybe<SupportedAssetsInput>;
};

export type PublicMutations = {
  /** Start a swap that pays a receive. Needs no login: the payer calls it. */
  create_swap: Swap;
  id: Scalars['String']['output'];
};


export type PublicMutationsCreate_SwapArgs = {
  input: CreateSwapInput;
};

export type PublicQueries = {
  assets: PublicAssetQueries;
  id: Scalars['String']['output'];
  offers: TradeOfferList;
  quote: TradeQuote;
};


export type PublicQueriesOffersArgs = {
  input: OfferInput;
};


export type PublicQueriesQuoteArgs = {
  input: QuoteInput;
};

export type Query = {
  hello: Scalars['String']['output'];
  node: NodeQueries;
  payment: PaymentQueries;
  permissions: PermissionQueries;
  public: PublicQueries;
  service_api_keys: ServiceApiKeyQueries;
  subscriptions: SubscriptionQueries;
  taproot_assets: TaprootAssetsQuery;
  trade: TradeQueries;
  user: User;
};

export type QuoteInput = {
  asset_id: Scalars['String']['input'];
  pubkey: Scalars['String']['input'];
  transaction_type: SwapTransactionType;
};

export type RailsTxnsExportInput = {
  node_id: Scalars['String']['input'];
  year: Scalars['Float']['input'];
};

export type RailsTxnsExportResult = {
  message: Scalars['String']['output'];
  success: Scalars['Boolean']['output'];
};

export type RemovePartnerNodeInput = {
  node_id: Scalars['String']['input'];
  partner_id: Scalars['String']['input'];
};

export type RenamePaymentsWalletInput = {
  id: Scalars['String']['input'];
  name: Scalars['String']['input'];
};

export type Revenue = {
  id: Scalars['String']['output'];
  liquidity: SatoshiAmount;
  routing: SatoshiAmount;
};

export type RevenueChart = {
  chart: Array<RevenuePeriod>;
  id: Scalars['String']['output'];
  interval: AggregateInterval;
};

export type RevenuePeriod = {
  /** Price of channels bought on the Magma marketplace, by order date */
  channel_purchase_costs: SatoshiAmount;
  /** Number of successful routed payments in the period */
  forwards: Scalars['Float']['output'];
  id: Scalars['String']['output'];
  liquidity: SatoshiAmount;
  /** Fees paid for confirmed on-chain transactions in the period */
  onchain_costs: SatoshiAmount;
  period: Scalars['String']['output'];
  /** Amount forwarded by successful routed payments in the period */
  routed_volume: SatoshiAmount;
  routing: SatoshiAmount;
};

export type RoutingStats = {
  id: Scalars['String']['output'];
  payment_count: Scalars['Float']['output'];
  payment_value: SatoshiAmount;
};

export type SatoshiAmount = {
  id: Scalars['String']['output'];
  sats: Scalars['String']['output'];
  usd: Scalars['Float']['output'];
};

export type SendByAddress = {
  amount: Scalars['String']['input'];
  lightning_address: Scalars['String']['input'];
};

export type SendByDestination = {
  amount: Scalars['String']['input'];
  payment_destination_id: Scalars['String']['input'];
};

export type SendByRequest = {
  /** Amount in sats to pay. Required for a zero-amount invoice, and rejected for an invoice that encodes an amount. */
  amount?: InputMaybe<Scalars['String']['input']>;
  bolt11: Scalars['String']['input'];
};

export type ServiceApiKey = {
  active: Scalars['Boolean']['output'];
  created_at: Scalars['String']['output'];
  environment_id?: Maybe<Scalars['String']['output']>;
  expires_at?: Maybe<Scalars['String']['output']>;
  id: Scalars['String']['output'];
  key_prefix: Scalars['String']['output'];
  key_suffix: Scalars['String']['output'];
  last_used_at?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  node_id?: Maybe<Scalars['String']['output']>;
  permissions: Array<ServiceApiKeyPermissionEntry>;
  wallet_id?: Maybe<Scalars['String']['output']>;
};

export type ServiceApiKeyGetMany = {
  id: Scalars['String']['output'];
  list: Array<ServiceApiKey>;
};

export type ServiceApiKeyMutations = {
  create: CreateServiceApiKeyResult;
  id: Scalars['String']['output'];
  revoke: ServiceApiKey;
  update: ServiceApiKey;
};


export type ServiceApiKeyMutationsCreateArgs = {
  input: CreateServiceApiKeyInput;
};


export type ServiceApiKeyMutationsRevokeArgs = {
  id: Scalars['String']['input'];
};


export type ServiceApiKeyMutationsUpdateArgs = {
  id: Scalars['String']['input'];
  input: UpdateServiceApiKeyInput;
};

export type ServiceApiKeyPermissionEntry = {
  level: ServiceApiKeyPermissionLevel;
  resource: ServiceApiKeyPermissionResource;
};

export type ServiceApiKeyPermissionInput = {
  level: ServiceApiKeyPermissionLevel;
  resource: ServiceApiKeyPermissionResource;
};

export type ServiceApiKeyPermissionLevel =
  | 'READ'
  | 'WRITE';

export type ServiceApiKeyPermissionResource =
  | 'ENVIRONMENTS'
  | 'PAYMENTS'
  | 'WALLETS'
  | 'WALLET_CREDENTIALS'
  | 'WEBHOOKS';

export type ServiceApiKeyQueries = {
  get_many: ServiceApiKeyGetMany;
  id: Scalars['String']['output'];
};

export type SetAssetConfigResult = {
  success: Scalars['Boolean']['output'];
};

export type SetAutomatedAssetInput = {
  asset_id: Scalars['String']['input'];
  enabled: Scalars['Boolean']['input'];
  node_id: Scalars['String']['input'];
};

/** Trimmed node representation returned in list views and as a nested reference. Contains only public identity fields (pubkey, alias, sockets). See DeployedNode for the full type, which includes state, credentials, and configuration. */
export type SimpleNode = {
  alias?: Maybe<Scalars['String']['output']>;
  id: Scalars['String']['output'];
  pubkey: Scalars['String']['output'];
  sockets: Array<Scalars['String']['output']>;
};

/** Trimmed environment representation returned in list views. PaymentsEnvironment is the full type for single-record lookups. */
export type SimplePaymentsEnvironment = {
  created_at: Scalars['String']['output'];
  id: Scalars['String']['output'];
  name: Scalars['String']['output'];
  type: PaymentsEnvironmentType;
  updated_at: Scalars['String']['output'];
  wallet_count: Scalars['Int']['output'];
};

/** Trimmed transaction representation returned in list views. Contains core transaction fields (amount, asset, status, direction, fee, description, is_retryable). See PaymentsTransaction for the full type, which additionally includes idempotency_key, events, error, exchange_rate, payment_hash, payment_request, node_id, and related computed fields. */
export type SimplePaymentsTransaction = {
  amount: BitcoinAssetAmount;
  asset: BitcoinAsset;
  checkout?: Maybe<PaymentsCheckout>;
  created_at: Scalars['String']['output'];
  description?: Maybe<Scalars['String']['output']>;
  direction: PaymentsTransactionDirection;
  fee?: Maybe<Scalars['String']['output']>;
  id: Scalars['String']['output'];
  /** True for a FAILED send whose payment_request has not expired yet, so the same invoice can be paid again. */
  is_retryable: Scalars['Boolean']['output'];
  metadata?: Maybe<Scalars['String']['output']>;
  settled_at?: Maybe<Scalars['String']['output']>;
  status: PaymentsTransactionStatus;
  updated_at: Scalars['String']['output'];
  wallet_id: Scalars['String']['output'];
};

/** Trimmed wallet representation returned in list views. Contains identity, asset, and readiness fields only. See PaymentsWallet for the full type, which additionally includes balance, environment, nodes, node_permissions, and updated_at. */
export type SimplePaymentsWallet = {
  asset: BitcoinAsset;
  asset_id: Scalars['String']['output'];
  created_at: Scalars['String']['output'];
  id: Scalars['String']['output'];
  /** Whether the wallet can receive payments. Always true in sandbox; in live it becomes true once the node has inbound asset-channel liquidity. */
  is_ready: Scalars['Boolean']['output'];
  name: Scalars['String']['output'];
};

/** Trimmed webhook endpoint representation returned in list views. Contains identity and configuration fields only. See WebhookEndpoint for the full type, which additionally includes environment_id and updated_at. */
export type SimpleWebhookEndpoint = {
  active: Scalars['Boolean']['output'];
  created_at: Scalars['String']['output'];
  event_filters: Array<Scalars['String']['output']>;
  id: Scalars['String']['output'];
  url: Scalars['String']['output'];
};

/** Trimmed webhook event representation returned in list views. Contains identity and routing fields only (event_type, wallet_id, transaction_id). See WebhookEvent for the full type, which additionally includes idempotency_key, payload, environment_id, and deliveries. */
export type SimpleWebhookEvent = {
  created_at: Scalars['String']['output'];
  event_type: Scalars['String']['output'];
  id: Scalars['String']['output'];
  transaction_id?: Maybe<Scalars['String']['output']>;
  wallet_id: Scalars['String']['output'];
};

export type SocketEndpoints = {
  grpc: Scalars['String']['output'];
  id: Scalars['String']['output'];
  rest: Scalars['String']['output'];
};

export type SortDirection =
  | 'ASC'
  | 'DESC';

export type Stats = {
  deposits: DepositStats;
  id: Scalars['String']['output'];
  liquidity: LiquidityStats;
  routing: RoutingStats;
};

export type StoreAdminCredentialsInput = {
  encrypted_macaroon: Scalars['String']['input'];
  location?: InputMaybe<DeployedNodeMacaroonLocation>;
  macaroon_type?: InputMaybe<MacaroonType>;
  node_id: Scalars['String']['input'];
  permissions: Array<Scalars['String']['input']>;
};

export type StoreManagementCredentialsInput = {
  macaroon: Scalars['String']['input'];
  macaroon_type?: InputMaybe<MacaroonType>;
  node_id: Scalars['String']['input'];
  p2p_trade?: InputMaybe<Scalars['Boolean']['input']>;
  taproot_assets?: InputMaybe<Scalars['Boolean']['input']>;
};

export type StorePasswordResult = {
  success: Scalars['Boolean']['output'];
};

export type StreamToken = {
  expires_at: Scalars['String']['output'];
  token: Scalars['String']['output'];
};

export type StreamTokenMutations = {
  id: Scalars['String']['output'];
  mint: StreamToken;
};


export type StreamTokenMutationsMintArgs = {
  input: MintStreamTokenInput;
};

export type StreamTokenScope =
  | 'ENVIRONMENT'
  | 'TRANSACTION'
  | 'WALLET';

export type StripeCardMethod = {
  brand: Scalars['String']['output'];
  country: Scalars['String']['output'];
  exp_month: Scalars['Float']['output'];
  exp_year: Scalars['Float']['output'];
  fingerprint: Scalars['String']['output'];
  last4: Scalars['String']['output'];
};

export type StripeInfo = {
  default_payment_method?: Maybe<StripePaymentMethod>;
  id: Scalars['String']['output'];
  payment_methods: Array<StripePaymentMethod>;
};

export type StripePaymentMethod = {
  card?: Maybe<StripeCardMethod>;
  created_at: Scalars['String']['output'];
  id: Scalars['String']['output'];
  type: Scalars['String']['output'];
};

export type SubmitPaymentsOnboardingInput = {
  business_name: Scalars['String']['input'];
  industry: Scalars['String']['input'];
  intended_payment_usage: Scalars['String']['input'];
  /** ISO 3166-1 alpha-2 country code */
  jurisdiction: Scalars['String']['input'];
  website: Scalars['String']['input'];
};

export type SubscriptionQueries = {
  id: Scalars['String']['output'];
  quote: SubscriptionQuote;
};


export type SubscriptionQueriesQuoteArgs = {
  node_id: Scalars['String']['input'];
};

export type SubscriptionQuote = {
  aum: Scalars['String']['output'];
  id: Scalars['String']['output'];
  monthly_fixed_fee_usd: Scalars['Float']['output'];
  monthly_variable_fee_usd: Scalars['Float']['output'];
  node_id: Scalars['String']['output'];
};

export type SupportedAssetList = {
  id: Scalars['String']['output'];
  list: Array<BitcoinAsset>;
  pagination: Pagination;
  total_count: Scalars['Int']['output'];
};

export type SupportedAssetsInput = {
  page?: InputMaybe<PageInput>;
};

export type Swap = {
  /** Exact amount to send, in the asset base unit (USDT on Tron has 6 decimals) */
  amount_in: Scalars['String']['output'];
  /** Address for the payer to send to */
  deposit_address: Scalars['String']['output'];
  /** Memo the payer must add, on chains that need one */
  deposit_memo?: Maybe<Scalars['String']['output']>;
  /** When this quote ends. The payer must send before then. */
  expires_at: Scalars['String']['output'];
  source_asset: Scalars['String']['output'];
  source_chain: Scalars['String']['output'];
};

export type SwapTransactionType =
  | 'PURCHASE'
  | 'SALE';

export type TaprootAssetDetails = {
  asset_id?: Maybe<Scalars['String']['output']>;
  group_key?: Maybe<Scalars['String']['output']>;
  universe?: Maybe<Scalars['String']['output']>;
};

export type TaprootAssetsQuery = {
  id: Scalars['String']['output'];
  list: Array<AvailableTaprootAsset>;
};

export type Team = {
  encrypted_symmetric_key?: Maybe<Scalars['String']['output']>;
  has_password: Scalars['Boolean']['output'];
  id: Scalars['String']['output'];
  members: Array<TeamMember>;
  month_to_date_payment_volume_sats: Scalars['String']['output'];
  password_hash?: Maybe<Scalars['String']['output']>;
  payments_onboarding_status: TeamPaymentsOnboardingStatus;
};

export type TeamMember = {
  email?: Maybe<Scalars['String']['output']>;
  id: Scalars['String']['output'];
  is_master: Scalars['Boolean']['output'];
};

export type TeamPaymentsOnboardingStatus = {
  id: Scalars['String']['output'];
  is_complete: Scalars['Boolean']['output'];
  is_owner: Scalars['Boolean']['output'];
  owner_email?: Maybe<Scalars['String']['output']>;
};

export type TermsOfService = {
  date: Scalars['String']['output'];
};

export type TotalValue = {
  asset_value: Scalars['String']['output'];
  btc_value: Scalars['String']['output'];
  id: Scalars['String']['output'];
  total: Scalars['String']['output'];
};

export type TradeOffer = {
  asset: BitcoinAsset;
  available: BitcoinAssetAmount;
  fees: TradeOfferFees;
  id: Scalars['String']['output'];
  magma_offer_id: Scalars['String']['output'];
  max_order: BitcoinAssetAmount;
  min_order: BitcoinAssetAmount;
  node: SimpleNode;
  rate: BitcoinAssetAmount;
};

export type TradeOfferFees = {
  base_fee_sats: Scalars['Int']['output'];
  fee_rate_ppm: Scalars['Int']['output'];
};

export type TradeOfferList = {
  id: Scalars['String']['output'];
  list: Array<TradeOffer>;
  pagination: Pagination;
  total_count: Scalars['Int']['output'];
};

export type TradeQueries = {
  id: Scalars['String']['output'];
  offers: TradeOfferList;
};


export type TradeQueriesOffersArgs = {
  input: OfferInput;
};

export type TradeQuote = {
  asset: BitcoinAsset;
  expires: Scalars['String']['output'];
  id: Scalars['String']['output'];
  node: SimpleNode;
  rate: BitcoinAssetAmount;
};

export type Transaction = {
  amount: SatoshiAmount;
  confirmed: Scalars['Boolean']['output'];
  cost_basis: Scalars['String']['output'];
  date: Scalars['String']['output'];
  fee?: Maybe<SatoshiAmount>;
  id: Scalars['String']['output'];
  metadata: TransactionMetadata;
  status: TransactionStatus;
  type: TransactionType;
};

export type TransactionInput = {
  page?: InputMaybe<PageInput>;
  tx_types?: InputMaybe<Array<TransactionType>>;
};

export type TransactionList = {
  id: Scalars['String']['output'];
  list: Array<Transaction>;
  pagination: Pagination;
  total_count: Scalars['Float']['output'];
};

export type TransactionMetadata = {
  amount_routed?: Maybe<SatoshiAmount>;
  id: Scalars['String']['output'];
  type: Scalars['String']['output'];
};

export type TransactionMutations = {
  create_loop_in_swap: LoopInSwap;
  create_receive: PaymentsTransaction;
  create_send: PaymentsTransaction;
  id: Scalars['String']['output'];
};


export type TransactionMutationsCreate_Loop_In_SwapArgs = {
  input: CreateLoopInSwapInput;
};


export type TransactionMutationsCreate_ReceiveArgs = {
  input: CreateReceiveTransactionInput;
};


export type TransactionMutationsCreate_SendArgs = {
  input: CreateSendTransactionInput;
};

export type TransactionQueries = {
  find_many: FindManyTransactions;
  find_one: PaymentsTransaction;
  id: Scalars['String']['output'];
};


export type TransactionQueriesFind_ManyArgs = {
  input: ListTransactionsInput;
};


export type TransactionQueriesFind_OneArgs = {
  id?: InputMaybe<Scalars['String']['input']>;
  lightning?: InputMaybe<FindOneTransactionLightningInput>;
};

export type TransactionStatus =
  | 'RECEIVED'
  | 'SENT';

export type TransactionType =
  | 'CHANNEL_CLOSE'
  | 'CHANNEL_OPEN'
  | 'CHANNEL_PURCHASE'
  | 'CHANNEL_SALE'
  | 'DEPOSIT'
  | 'ROUTING'
  | 'WITHDRAW';

export type UpdateCheckoutStyleInput = {
  /** Omit to keep the current colour, or null to remove it */
  brand_color?: InputMaybe<Scalars['String']['input']>;
  /** Omit to keep the current display name, or null to remove it */
  display_name?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['String']['input'];
  /** Omit to keep the current name */
  name?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateLightningAddressDescriptionInput = {
  /** Send null or an empty string to go back to the default text */
  description?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['String']['input'];
};

export type UpdatePaymentDestinationInput = {
  currency?: InputMaybe<PaymentDestinationCurrency>;
  id: Scalars['String']['input'];
  label: Scalars['String']['input'];
};

export type UpdateServiceApiKeyInput = {
  name: Scalars['String']['input'];
};

export type UpdateWebhookEndpointInput = {
  active?: InputMaybe<Scalars['Boolean']['input']>;
  event_filters?: InputMaybe<Array<Scalars['String']['input']>>;
  id: Scalars['String']['input'];
  url?: InputMaybe<Scalars['String']['input']>;
};

export type User = {
  email?: Maybe<Scalars['String']['output']>;
  /** @deprecated Use has_lp_access instead */
  has_access: Scalars['Boolean']['output'];
  has_lp_access: Scalars['Boolean']['output'];
  id: Scalars['String']['output'];
  is_master: Scalars['Boolean']['output'];
  is_team: Scalars['Boolean']['output'];
  liquidity_provider?: Maybe<LiquidityProvider>;
  stripe?: Maybe<StripeInfo>;
  team: Team;
  /** @deprecated Use verification_info.legal_acceptance instead */
  terms_of_service?: Maybe<TermsOfService>;
  verification_info: VerificationInfo;
};


export type UserLiquidity_ProviderArgs = {
  input?: InputMaybe<LiquidityProviderInput>;
};

export type UserMutations = {
  accept_legal_documents: LegalAcceptance;
  /** @deprecated Use accept_legal_documents instead */
  accept_terms_of_service: TermsOfService;
  check_team_password: CheckPasswordResult;
  request_transaction_export: RailsTxnsExportResult;
  store_team_password_and_keys: StorePasswordResult;
  submit_payments_onboarding: PaymentsOnboarding;
};


export type UserMutationsAccept_Legal_DocumentsArgs = {
  input: AcceptLegalDocumentsInput;
};


export type UserMutationsCheck_Team_PasswordArgs = {
  password_hash: Scalars['String']['input'];
};


export type UserMutationsRequest_Transaction_ExportArgs = {
  input: RailsTxnsExportInput;
};


export type UserMutationsStore_Team_Password_And_KeysArgs = {
  encrypted_symmetric_key: Scalars['String']['input'];
  password_hash: Scalars['String']['input'];
};


export type UserMutationsSubmit_Payments_OnboardingArgs = {
  input: SubmitPaymentsOnboardingInput;
};

export type VerificationInfo = {
  account_info?: Maybe<AccountInfo>;
  id: Scalars['String']['output'];
  legal_acceptance: LegalAcceptance;
  status: VerificationStatus;
};

export type VerificationStatus =
  | 'COMPLETED'
  | 'IN_PROGRESS'
  | 'NOT_COMPLETED';

export type WalletMutations = {
  create: PaymentsWallet;
  delete: Scalars['Boolean']['output'];
  id: Scalars['String']['output'];
  rename: PaymentsWallet;
};


export type WalletMutationsCreateArgs = {
  input: CreatePaymentsWalletInput;
};


export type WalletMutationsDeleteArgs = {
  id: Scalars['String']['input'];
};


export type WalletMutationsRenameArgs = {
  input: RenamePaymentsWalletInput;
};

export type WalletNodePermissions = {
  encrypted_symmetric_key: Scalars['String']['output'];
  id: Scalars['String']['output'];
  nodes: Array<NodePermission>;
};

export type WalletQueries = {
  find_many: FindManyWallets;
  find_one: PaymentsWallet;
  id: Scalars['String']['output'];
};


export type WalletQueriesFind_OneArgs = {
  id: Scalars['String']['input'];
};

export type WebhookDelivery = {
  attempt_number: Scalars['Int']['output'];
  created_at: Scalars['String']['output'];
  error_message?: Maybe<Scalars['String']['output']>;
  http_status?: Maybe<Scalars['Int']['output']>;
  id: Scalars['String']['output'];
  status: WebhookDeliveryStatus;
  updated_at: Scalars['String']['output'];
  webhook_endpoint_id: Scalars['String']['output'];
};

export type WebhookDeliveryStatus =
  | 'FAILED'
  | 'IN_PROGRESS'
  | 'PENDING'
  | 'SUCCESS';

export type WebhookEndpoint = {
  active: Scalars['Boolean']['output'];
  created_at: Scalars['String']['output'];
  environment_id: Scalars['String']['output'];
  event_filters: Array<Scalars['String']['output']>;
  id: Scalars['String']['output'];
  updated_at: Scalars['String']['output'];
  url: Scalars['String']['output'];
};

export type WebhookEndpointMutations = {
  create: CreateWebhookEndpointResult;
  delete: Scalars['Boolean']['output'];
  id: Scalars['String']['output'];
  rotate_secret: CreateWebhookEndpointResult;
  update: WebhookEndpoint;
};


export type WebhookEndpointMutationsCreateArgs = {
  input: CreateWebhookEndpointInput;
};


export type WebhookEndpointMutationsDeleteArgs = {
  id: Scalars['String']['input'];
};


export type WebhookEndpointMutationsRotate_SecretArgs = {
  id: Scalars['String']['input'];
};


export type WebhookEndpointMutationsUpdateArgs = {
  input: UpdateWebhookEndpointInput;
};

export type WebhookEndpointQueries = {
  available_event_types: Array<Scalars['String']['output']>;
  find_many: FindManyWebhookEndpoints;
  find_one: WebhookEndpoint;
  id: Scalars['String']['output'];
};


export type WebhookEndpointQueriesFind_OneArgs = {
  id: Scalars['String']['input'];
};

export type WebhookEvent = {
  created_at: Scalars['String']['output'];
  deliveries: Array<WebhookDelivery>;
  environment_id: Scalars['String']['output'];
  event_type: Scalars['String']['output'];
  id: Scalars['String']['output'];
  idempotency_key: Scalars['String']['output'];
  payload: Scalars['String']['output'];
  transaction_id?: Maybe<Scalars['String']['output']>;
  wallet_id: Scalars['String']['output'];
};

export type WebhookEventQueries = {
  find_many: FindManyWebhookEvents;
  find_one: WebhookEvent;
  id: Scalars['String']['output'];
};


export type WebhookEventQueriesFind_ManyArgs = {
  input: ListWebhookEventsInput;
};


export type WebhookEventQueriesFind_OneArgs = {
  id: Scalars['String']['input'];
};

export type PaymentsEnvironmentFieldsFragment = { id: string, name: string, type: PaymentsEnvironmentType, wallet_count: number, created_at: string, updated_at: string };

export type SimplePaymentsEnvironmentFieldsFragment = { id: string, name: string, type: PaymentsEnvironmentType, wallet_count: number, created_at: string, updated_at: string };

export type ListEnvironmentsQueryVariables = Exact<{ [key: string]: never; }>;


export type ListEnvironmentsQuery = { payment: { environment: { find_many: { list: Array<{ id: string, name: string, type: PaymentsEnvironmentType, wallet_count: number, created_at: string, updated_at: string }> } } } };

export type GetEnvironmentQueryVariables = Exact<{
  id: Scalars['String']['input'];
}>;


export type GetEnvironmentQuery = { payment: { environment: { find_one: { id: string, name: string, type: PaymentsEnvironmentType, wallet_count: number, created_at: string, updated_at: string } } } };

export type CreateEnvironmentMutationVariables = Exact<{
  input: CreatePaymentsEnvironmentInput;
}>;


export type CreateEnvironmentMutation = { payment: { environment: { create: { environment: { id: string, name: string, type: PaymentsEnvironmentType, wallet_count: number, created_at: string, updated_at: string } } } } };

export type DeleteEnvironmentMutationVariables = Exact<{
  id: Scalars['String']['input'];
}>;


export type DeleteEnvironmentMutation = { payment: { environment: { delete: boolean } } };

export type PaymentsCheckoutFieldsFragment = { id: string, url?: string | null, success_url?: string | null, return_url?: string | null, style_id?: string | null };

export type PaymentsTransactionFieldsFragment = { id: string, wallet_id: string, node_id?: string | null, idempotency_key: string, direction: PaymentsTransactionDirection, status: PaymentsTransactionStatus, amount_sats?: string | null, fee?: string | null, payment_hash?: string | null, payment_request?: string | null, description?: string | null, error?: string | null, expires_at?: string | null, settled_at?: string | null, created_at: string, updated_at: string, amount: { id: string, display_amount: string, full_amount: string }, asset: { id: string, symbol: string, type: BitcoinAssetType, precision: number }, checkout?: { id: string, url?: string | null, success_url?: string | null, return_url?: string | null, style_id?: string | null } | null };

export type SimplePaymentsTransactionFieldsFragment = { id: string, wallet_id: string, direction: PaymentsTransactionDirection, status: PaymentsTransactionStatus, fee?: string | null, description?: string | null, settled_at?: string | null, created_at: string, updated_at: string, amount: { id: string, display_amount: string, full_amount: string }, asset: { id: string, symbol: string, type: BitcoinAssetType, precision: number }, checkout?: { id: string, url?: string | null, success_url?: string | null, return_url?: string | null, style_id?: string | null } | null };

export type FindManyTransactionsFieldsFragment = { total_count: number, list: Array<{ id: string, wallet_id: string, direction: PaymentsTransactionDirection, status: PaymentsTransactionStatus, fee?: string | null, description?: string | null, settled_at?: string | null, created_at: string, updated_at: string, amount: { id: string, display_amount: string, full_amount: string }, asset: { id: string, symbol: string, type: BitcoinAssetType, precision: number }, checkout?: { id: string, url?: string | null, success_url?: string | null, return_url?: string | null, style_id?: string | null } | null }>, pagination: { limit: number, offset: number } };

export type GetTransactionQueryVariables = Exact<{
  id: Scalars['String']['input'];
}>;


export type GetTransactionQuery = { payment: { transaction: { find_one: { id: string, wallet_id: string, node_id?: string | null, idempotency_key: string, direction: PaymentsTransactionDirection, status: PaymentsTransactionStatus, amount_sats?: string | null, fee?: string | null, payment_hash?: string | null, payment_request?: string | null, description?: string | null, error?: string | null, expires_at?: string | null, settled_at?: string | null, created_at: string, updated_at: string, amount: { id: string, display_amount: string, full_amount: string }, asset: { id: string, symbol: string, type: BitcoinAssetType, precision: number }, checkout?: { id: string, url?: string | null, success_url?: string | null, return_url?: string | null, style_id?: string | null } | null } } } };

export type ListTransactionsQueryVariables = Exact<{
  input: ListTransactionsInput;
}>;


export type ListTransactionsQuery = { payment: { transaction: { find_many: { total_count: number, list: Array<{ id: string, wallet_id: string, direction: PaymentsTransactionDirection, status: PaymentsTransactionStatus, fee?: string | null, description?: string | null, settled_at?: string | null, created_at: string, updated_at: string, amount: { id: string, display_amount: string, full_amount: string }, asset: { id: string, symbol: string, type: BitcoinAssetType, precision: number }, checkout?: { id: string, url?: string | null, success_url?: string | null, return_url?: string | null, style_id?: string | null } | null }>, pagination: { limit: number, offset: number } } } } };

export type CreateReceiveTransactionMutationVariables = Exact<{
  input: CreateReceiveTransactionInput;
}>;


export type CreateReceiveTransactionMutation = { payment: { transaction: { create_receive: { id: string, wallet_id: string, node_id?: string | null, idempotency_key: string, direction: PaymentsTransactionDirection, status: PaymentsTransactionStatus, amount_sats?: string | null, fee?: string | null, payment_hash?: string | null, payment_request?: string | null, description?: string | null, error?: string | null, expires_at?: string | null, settled_at?: string | null, created_at: string, updated_at: string, amount: { id: string, display_amount: string, full_amount: string }, asset: { id: string, symbol: string, type: BitcoinAssetType, precision: number }, checkout?: { id: string, url?: string | null, success_url?: string | null, return_url?: string | null, style_id?: string | null } | null } } } };

export type CreateSendTransactionMutationVariables = Exact<{
  input: CreateSendTransactionInput;
}>;


export type CreateSendTransactionMutation = { payment: { transaction: { create_send: { id: string, wallet_id: string, node_id?: string | null, idempotency_key: string, direction: PaymentsTransactionDirection, status: PaymentsTransactionStatus, amount_sats?: string | null, fee?: string | null, payment_hash?: string | null, payment_request?: string | null, description?: string | null, error?: string | null, expires_at?: string | null, settled_at?: string | null, created_at: string, updated_at: string, amount: { id: string, display_amount: string, full_amount: string }, asset: { id: string, symbol: string, type: BitcoinAssetType, precision: number }, checkout?: { id: string, url?: string | null, success_url?: string | null, return_url?: string | null, style_id?: string | null } | null } } } };

export type GetWalletSendContextQueryVariables = Exact<{
  id: Scalars['String']['input'];
}>;


export type GetWalletSendContextQuery = { payment: { wallet: { find_one: { id: string, team_id: string, environment: { id: string, type: PaymentsEnvironmentType } } } } };

export type GetWalletNodePermissionsQueryVariables = Exact<{
  id: Scalars['String']['input'];
  password_hash?: InputMaybe<Scalars['String']['input']>;
}>;


export type GetWalletNodePermissionsQuery = { payment: { wallet: { find_one: { id: string, asset: { id: string, type: BitcoinAssetType, taproot_asset_details?: { group_key?: string | null } | null }, node_permissions: { id: string, encrypted_symmetric_key: string, nodes: Array<{ id: string, node_id: string, network: DeployedNodeNetwork, encrypted_macaroon: string, tls_cert?: string | null, sockets: { id: string, lnd?: { id: string, rest: string } | null, litd?: { id: string, rest: string } | null } }> } } } } };

export type PaymentsWalletFieldsFragment = { id: string, name: string, asset_id: string, environment_id: string, created_at: string, updated_at: string, balance: { balance: string, received: string, sent: string }, asset: { id: string, symbol: string, precision: number, type: BitcoinAssetType, description?: string | null, website_url?: string | null, taproot_asset_details?: { asset_id?: string | null, group_key?: string | null, universe?: string | null } | null }, environment: { id: string, name: string, type: PaymentsEnvironmentType, wallet_count: number, created_at: string, updated_at: string }, nodes: Array<{ id: string, alias?: string | null, pubkey?: string | null, state: DeployedNodeState, type: DeployedNodeType }> };

export type SimplePaymentsWalletFieldsFragment = { id: string, name: string, asset_id: string, is_ready: boolean, created_at: string, asset: { id: string, symbol: string, precision: number, type: BitcoinAssetType, description?: string | null, website_url?: string | null, taproot_asset_details?: { asset_id?: string | null, group_key?: string | null, universe?: string | null } | null } };

export type ListWalletsQueryVariables = Exact<{
  environmentId: Scalars['String']['input'];
}>;


export type ListWalletsQuery = { payment: { wallet: { find_many: { list: Array<{ id: string, name: string, asset_id: string, is_ready: boolean, created_at: string, asset: { id: string, symbol: string, precision: number, type: BitcoinAssetType, description?: string | null, website_url?: string | null, taproot_asset_details?: { asset_id?: string | null, group_key?: string | null, universe?: string | null } | null } }> } } } };

export type GetWalletQueryVariables = Exact<{
  id: Scalars['String']['input'];
}>;


export type GetWalletQuery = { payment: { wallet: { find_one: { id: string, name: string, asset_id: string, environment_id: string, created_at: string, updated_at: string, balance: { balance: string, received: string, sent: string }, asset: { id: string, symbol: string, precision: number, type: BitcoinAssetType, description?: string | null, website_url?: string | null, taproot_asset_details?: { asset_id?: string | null, group_key?: string | null, universe?: string | null } | null }, environment: { id: string, name: string, type: PaymentsEnvironmentType, wallet_count: number, created_at: string, updated_at: string }, nodes: Array<{ id: string, alias?: string | null, pubkey?: string | null, state: DeployedNodeState, type: DeployedNodeType }> } } } };

export type CreateWalletMutationVariables = Exact<{
  input: CreatePaymentsWalletInput;
}>;


export type CreateWalletMutation = { payment: { wallet: { create: { id: string, name: string, asset_id: string, environment_id: string, created_at: string, updated_at: string, balance: { balance: string, received: string, sent: string }, asset: { id: string, symbol: string, precision: number, type: BitcoinAssetType, description?: string | null, website_url?: string | null, taproot_asset_details?: { asset_id?: string | null, group_key?: string | null, universe?: string | null } | null }, environment: { id: string, name: string, type: PaymentsEnvironmentType, wallet_count: number, created_at: string, updated_at: string }, nodes: Array<{ id: string, alias?: string | null, pubkey?: string | null, state: DeployedNodeState, type: DeployedNodeType }> } } } };

export type DeleteWalletMutationVariables = Exact<{
  id: Scalars['String']['input'];
}>;


export type DeleteWalletMutation = { payment: { wallet: { delete: boolean } } };

export const SimplePaymentsEnvironmentFieldsFragmentDoc = `
    fragment SimplePaymentsEnvironmentFields on SimplePaymentsEnvironment {
  id
  name
  type
  wallet_count
  created_at
  updated_at
}
    `;
export const PaymentsCheckoutFieldsFragmentDoc = `
    fragment PaymentsCheckoutFields on PaymentsCheckout {
  id
  url
  success_url
  return_url
  style_id
}
    `;
export const PaymentsTransactionFieldsFragmentDoc = `
    fragment PaymentsTransactionFields on PaymentsTransaction {
  id
  wallet_id
  node_id
  idempotency_key
  direction
  status
  amount {
    id
    display_amount
    full_amount
  }
  amount_sats
  asset {
    id
    symbol
    type
    precision
  }
  fee
  payment_hash
  payment_request
  description
  error
  expires_at
  settled_at
  created_at
  updated_at
  checkout {
    ...PaymentsCheckoutFields
  }
}
    ${PaymentsCheckoutFieldsFragmentDoc}`;
export const SimplePaymentsTransactionFieldsFragmentDoc = `
    fragment SimplePaymentsTransactionFields on SimplePaymentsTransaction {
  id
  wallet_id
  direction
  status
  amount {
    id
    display_amount
    full_amount
  }
  asset {
    id
    symbol
    type
    precision
  }
  fee
  description
  settled_at
  created_at
  updated_at
  checkout {
    ...PaymentsCheckoutFields
  }
}
    ${PaymentsCheckoutFieldsFragmentDoc}`;
export const FindManyTransactionsFieldsFragmentDoc = `
    fragment FindManyTransactionsFields on FindManyTransactions {
  list {
    ...SimplePaymentsTransactionFields
  }
  pagination {
    limit
    offset
  }
  total_count
}
    ${SimplePaymentsTransactionFieldsFragmentDoc}`;
export const PaymentsEnvironmentFieldsFragmentDoc = `
    fragment PaymentsEnvironmentFields on PaymentsEnvironment {
  id
  name
  type
  wallet_count
  created_at
  updated_at
}
    `;
export const PaymentsWalletFieldsFragmentDoc = `
    fragment PaymentsWalletFields on PaymentsWallet {
  id
  name
  asset_id
  environment_id
  created_at
  updated_at
  balance {
    balance
    received
    sent
  }
  asset {
    id
    symbol
    precision
    type
    description
    website_url
    taproot_asset_details {
      asset_id
      group_key
      universe
    }
  }
  environment {
    ...PaymentsEnvironmentFields
  }
  nodes {
    id
    alias
    pubkey
    state
    type
  }
}
    ${PaymentsEnvironmentFieldsFragmentDoc}`;
export const SimplePaymentsWalletFieldsFragmentDoc = `
    fragment SimplePaymentsWalletFields on SimplePaymentsWallet {
  id
  name
  asset_id
  is_ready
  created_at
  asset {
    id
    symbol
    precision
    type
    description
    website_url
    taproot_asset_details {
      asset_id
      group_key
      universe
    }
  }
}
    `;
export const ListEnvironmentsDocument = `
    query ListEnvironments {
  payment {
    environment {
      find_many {
        list {
          ...SimplePaymentsEnvironmentFields
        }
      }
    }
  }
}
    ${SimplePaymentsEnvironmentFieldsFragmentDoc}`;
export const GetEnvironmentDocument = `
    query GetEnvironment($id: String!) {
  payment {
    environment {
      find_one(id: $id) {
        ...PaymentsEnvironmentFields
      }
    }
  }
}
    ${PaymentsEnvironmentFieldsFragmentDoc}`;
export const CreateEnvironmentDocument = `
    mutation CreateEnvironment($input: CreatePaymentsEnvironmentInput!) {
  payment {
    environment {
      create(input: $input) {
        environment {
          ...PaymentsEnvironmentFields
        }
      }
    }
  }
}
    ${PaymentsEnvironmentFieldsFragmentDoc}`;
export const DeleteEnvironmentDocument = `
    mutation DeleteEnvironment($id: String!) {
  payment {
    environment {
      delete(id: $id)
    }
  }
}
    `;
export const GetTransactionDocument = `
    query GetTransaction($id: String!) {
  payment {
    transaction {
      find_one(id: $id) {
        ...PaymentsTransactionFields
      }
    }
  }
}
    ${PaymentsTransactionFieldsFragmentDoc}`;
export const ListTransactionsDocument = `
    query ListTransactions($input: ListTransactionsInput!) {
  payment {
    transaction {
      find_many(input: $input) {
        ...FindManyTransactionsFields
      }
    }
  }
}
    ${FindManyTransactionsFieldsFragmentDoc}`;
export const CreateReceiveTransactionDocument = `
    mutation CreateReceiveTransaction($input: CreateReceiveTransactionInput!) {
  payment {
    transaction {
      create_receive(input: $input) {
        ...PaymentsTransactionFields
      }
    }
  }
}
    ${PaymentsTransactionFieldsFragmentDoc}`;
export const CreateSendTransactionDocument = `
    mutation CreateSendTransaction($input: CreateSendTransactionInput!) {
  payment {
    transaction {
      create_send(input: $input) {
        ...PaymentsTransactionFields
      }
    }
  }
}
    ${PaymentsTransactionFieldsFragmentDoc}`;
export const GetWalletSendContextDocument = `
    query GetWalletSendContext($id: String!) {
  payment {
    wallet {
      find_one(id: $id) {
        id
        team_id
        environment {
          id
          type
        }
      }
    }
  }
}
    `;
export const GetWalletNodePermissionsDocument = `
    query GetWalletNodePermissions($id: String!, $password_hash: String) {
  payment {
    wallet {
      find_one(id: $id) {
        id
        asset {
          id
          type
          taproot_asset_details {
            group_key
          }
        }
        node_permissions(password_hash: $password_hash) {
          id
          encrypted_symmetric_key
          nodes {
            id
            node_id
            network
            encrypted_macaroon
            tls_cert
            sockets {
              id
              lnd {
                id
                rest
              }
              litd {
                id
                rest
              }
            }
          }
        }
      }
    }
  }
}
    `;
export const ListWalletsDocument = `
    query ListWallets($environmentId: String!) {
  payment {
    wallet {
      find_many {
        list(environment_id: $environmentId) {
          ...SimplePaymentsWalletFields
        }
      }
    }
  }
}
    ${SimplePaymentsWalletFieldsFragmentDoc}`;
export const GetWalletDocument = `
    query GetWallet($id: String!) {
  payment {
    wallet {
      find_one(id: $id) {
        ...PaymentsWalletFields
      }
    }
  }
}
    ${PaymentsWalletFieldsFragmentDoc}`;
export const CreateWalletDocument = `
    mutation CreateWallet($input: CreatePaymentsWalletInput!) {
  payment {
    wallet {
      create(input: $input) {
        ...PaymentsWalletFields
      }
    }
  }
}
    ${PaymentsWalletFieldsFragmentDoc}`;
export const DeleteWalletDocument = `
    mutation DeleteWallet($id: String!) {
  payment {
    wallet {
      delete(id: $id)
    }
  }
}
    `;

export type SdkFunctionWrapper = <T>(action: (requestHeaders?:Record<string, string>) => Promise<T>, operationName: string, operationType?: string, variables?: any) => Promise<T>;


const defaultWrapper: SdkFunctionWrapper = (action, _operationName, _operationType, _variables) => action();

export function getSdk(client: GraphQLClient, withWrapper: SdkFunctionWrapper = defaultWrapper) {
  return {
    ListEnvironments(variables?: ListEnvironmentsQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<ListEnvironmentsQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<ListEnvironmentsQuery>({ document: ListEnvironmentsDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'ListEnvironments', 'query', variables);
    },
    GetEnvironment(variables: GetEnvironmentQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<GetEnvironmentQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetEnvironmentQuery>({ document: GetEnvironmentDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'GetEnvironment', 'query', variables);
    },
    CreateEnvironment(variables: CreateEnvironmentMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<CreateEnvironmentMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<CreateEnvironmentMutation>({ document: CreateEnvironmentDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'CreateEnvironment', 'mutation', variables);
    },
    DeleteEnvironment(variables: DeleteEnvironmentMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<DeleteEnvironmentMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<DeleteEnvironmentMutation>({ document: DeleteEnvironmentDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'DeleteEnvironment', 'mutation', variables);
    },
    GetTransaction(variables: GetTransactionQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<GetTransactionQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetTransactionQuery>({ document: GetTransactionDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'GetTransaction', 'query', variables);
    },
    ListTransactions(variables: ListTransactionsQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<ListTransactionsQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<ListTransactionsQuery>({ document: ListTransactionsDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'ListTransactions', 'query', variables);
    },
    CreateReceiveTransaction(variables: CreateReceiveTransactionMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<CreateReceiveTransactionMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<CreateReceiveTransactionMutation>({ document: CreateReceiveTransactionDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'CreateReceiveTransaction', 'mutation', variables);
    },
    CreateSendTransaction(variables: CreateSendTransactionMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<CreateSendTransactionMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<CreateSendTransactionMutation>({ document: CreateSendTransactionDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'CreateSendTransaction', 'mutation', variables);
    },
    GetWalletSendContext(variables: GetWalletSendContextQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<GetWalletSendContextQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetWalletSendContextQuery>({ document: GetWalletSendContextDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'GetWalletSendContext', 'query', variables);
    },
    GetWalletNodePermissions(variables: GetWalletNodePermissionsQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<GetWalletNodePermissionsQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetWalletNodePermissionsQuery>({ document: GetWalletNodePermissionsDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'GetWalletNodePermissions', 'query', variables);
    },
    ListWallets(variables: ListWalletsQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<ListWalletsQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<ListWalletsQuery>({ document: ListWalletsDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'ListWallets', 'query', variables);
    },
    GetWallet(variables: GetWalletQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<GetWalletQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetWalletQuery>({ document: GetWalletDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'GetWallet', 'query', variables);
    },
    CreateWallet(variables: CreateWalletMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<CreateWalletMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<CreateWalletMutation>({ document: CreateWalletDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'CreateWallet', 'mutation', variables);
    },
    DeleteWallet(variables: DeleteWalletMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<DeleteWalletMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<DeleteWalletMutation>({ document: DeleteWalletDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'DeleteWallet', 'mutation', variables);
    }
  };
}
export type Sdk = ReturnType<typeof getSdk>;