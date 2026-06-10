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

export type AddNodeToWalletInput = {
  node_id: Scalars['String']['input'];
  wallet_id: Scalars['String']['input'];
};

export type AddPartnerNodeInput = {
  node_id: Scalars['String']['input'];
  pubkey: Scalars['String']['input'];
};

export type AggregateInterval =
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

export type AvailableTaprootAsset = {
  group_key?: Maybe<Scalars['String']['output']>;
  id: Scalars['String']['output'];
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
  usd: Scalars['String']['output'];
};

export type BitcoinAssetType =
  | 'BASE_ASSET'
  | 'TAPROOT_ASSET';

export type BitcoinAssetValue = {
  id: Scalars['String']['output'];
  usd_value: Scalars['String']['output'];
};

export type Charts = {
  balance: BalanceChart;
  id: Scalars['String']['output'];
  revenue: RevenueChart;
};

export type CheckPasswordResult = {
  success: Scalars['Boolean']['output'];
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

export type CreatePaymentsEnvironmentInput = {
  name: Scalars['String']['input'];
  type: PaymentsEnvironmentType;
};

export type CreatePaymentsWalletInput = {
  asset_id: Scalars['String']['input'];
  environment_id: Scalars['String']['input'];
  name: Scalars['String']['input'];
};

export type CreateReceiveTransactionInput = {
  amount: Scalars['String']['input'];
  description?: InputMaybe<Scalars['String']['input']>;
  expires_in?: InputMaybe<Scalars['Int']['input']>;
  idempotency_key: Scalars['String']['input'];
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

export type DeployManagedNode = {
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

export type DeployedNodeState =
  | 'ACTIVE'
  | 'CREATED'
  | 'DELETED'
  | 'DELETION_INITIATED'
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
  create: PaymentsEnvironment;
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
  get: PaymentsEnvironment;
  id: Scalars['String']['output'];
  list: Array<PaymentsEnvironment>;
};


export type EnvironmentQueriesGetArgs = {
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

export type LiquidityProvider = {
  assets?: Maybe<LiquidityProviderAssets>;
  balances: AccountBalance;
  charts: Charts;
  funds: Funds;
  id: Scalars['String']['output'];
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
  node_id?: InputMaybe<Scalars['String']['input']>;
  to?: InputMaybe<Scalars['String']['input']>;
};

export type LiquidityStats = {
  id: Scalars['String']['output'];
  partners: Scalars['Float']['output'];
  provided_liquidity: Scalars['String']['output'];
  sales: Scalars['Float']['output'];
};

export type LitdSockets = {
  grpc: Scalars['String']['output'];
  id: Scalars['String']['output'];
  rest: Scalars['String']['output'];
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

export type Mutation = {
  credentials: CredentialMutations;
  node: NodeMutations;
  payment: PaymentMutations;
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
  node_id: Scalars['String']['input'];
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

export type PaymentMutations = {
  environment: EnvironmentMutations;
  id: Scalars['String']['output'];
  transaction: TransactionMutations;
  wallet: WalletMutations;
};

export type PaymentQueries = {
  environment: EnvironmentQueries;
  id: Scalars['String']['output'];
  wallet: WalletQueries;
};

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

export type PaymentsTransaction = {
  amount: Scalars['String']['output'];
  created_at: Scalars['String']['output'];
  description?: Maybe<Scalars['String']['output']>;
  direction: PaymentsTransactionDirection;
  error?: Maybe<Scalars['String']['output']>;
  expires_at?: Maybe<Scalars['String']['output']>;
  fee?: Maybe<Scalars['String']['output']>;
  id: Scalars['String']['output'];
  idempotency_key: Scalars['String']['output'];
  node_id: Scalars['String']['output'];
  payment_hash?: Maybe<Scalars['String']['output']>;
  payment_request?: Maybe<Scalars['String']['output']>;
  settled_at?: Maybe<Scalars['String']['output']>;
  status: PaymentsTransactionStatus;
  updated_at: Scalars['String']['output'];
  wallet_id: Scalars['String']['output'];
};

export type PaymentsTransactionDirection =
  | 'RECEIVE'
  | 'SEND';

export type PaymentsTransactionStatus =
  | 'COMPLETED'
  | 'EXPIRED'
  | 'FAILED'
  | 'PENDING';

export type PaymentsWallet = {
  asset: BitcoinAsset;
  asset_id: Scalars['String']['output'];
  balance: PaymentsWalletBalance;
  created_at: Scalars['String']['output'];
  environment: PaymentsEnvironment;
  environment_id: Scalars['String']['output'];
  id: Scalars['String']['output'];
  name: Scalars['String']['output'];
  nodes: Array<DeployedNode>;
  updated_at: Scalars['String']['output'];
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
  id: Scalars['String']['output'];
  liquidity: SatoshiAmount;
  period: Scalars['String']['output'];
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
  | 'WALLETS';

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

export type SimpleNode = {
  alias?: Maybe<Scalars['String']['output']>;
  id: Scalars['String']['output'];
  pubkey: Scalars['String']['output'];
  sockets: Array<Scalars['String']['output']>;
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
  id: Scalars['String']['output'];
  members: Array<TeamMember>;
  password_hash?: Maybe<Scalars['String']['output']>;
};

export type TeamMember = {
  email?: Maybe<Scalars['String']['output']>;
  id: Scalars['String']['output'];
  is_master: Scalars['Boolean']['output'];
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
  create_receive: PaymentsTransaction;
  id: Scalars['String']['output'];
};


export type TransactionMutationsCreate_ReceiveArgs = {
  input: CreateReceiveTransactionInput;
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

export type UpdateServiceApiKeyInput = {
  name: Scalars['String']['input'];
};

export type User = {
  email?: Maybe<Scalars['String']['output']>;
  has_access: Scalars['Boolean']['output'];
  id: Scalars['String']['output'];
  is_master: Scalars['Boolean']['output'];
  is_team: Scalars['Boolean']['output'];
  liquidity_provider?: Maybe<LiquidityProvider>;
  stripe?: Maybe<StripeInfo>;
  team: Team;
  terms_of_service?: Maybe<TermsOfService>;
  verification_info: VerificationInfo;
};


export type UserLiquidity_ProviderArgs = {
  input?: InputMaybe<LiquidityProviderInput>;
};

export type UserMutations = {
  accept_terms_of_service: TermsOfService;
  check_team_password: CheckPasswordResult;
  request_transaction_export: RailsTxnsExportResult;
  store_team_password_and_keys: StorePasswordResult;
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

export type VerificationInfo = {
  account_info?: Maybe<AccountInfo>;
  id: Scalars['String']['output'];
  status: VerificationStatus;
};

export type VerificationStatus =
  | 'COMPLETED'
  | 'IN_PROGRESS'
  | 'NOT_COMPLETED';

export type WalletMutations = {
  add_node: PaymentsWallet;
  create: PaymentsWallet;
  delete: Scalars['Boolean']['output'];
  id: Scalars['String']['output'];
};


export type WalletMutationsAdd_NodeArgs = {
  input: AddNodeToWalletInput;
};


export type WalletMutationsCreateArgs = {
  input: CreatePaymentsWalletInput;
};


export type WalletMutationsDeleteArgs = {
  id: Scalars['String']['input'];
};

export type WalletQueries = {
  get: PaymentsWallet;
  id: Scalars['String']['output'];
  list: Array<PaymentsWallet>;
};


export type WalletQueriesGetArgs = {
  id: Scalars['String']['input'];
};


export type WalletQueriesListArgs = {
  environment_id: Scalars['String']['input'];
};

export type PaymentsEnvironmentFieldsFragment = { id: string, name: string, type: PaymentsEnvironmentType, wallet_count: number, created_at: string, updated_at: string };

export type ListEnvironmentsQueryVariables = Exact<{ [key: string]: never; }>;


export type ListEnvironmentsQuery = { payment: { environment: { list: Array<{ id: string, name: string, type: PaymentsEnvironmentType, wallet_count: number, created_at: string, updated_at: string }> } } };

export type GetEnvironmentQueryVariables = Exact<{
  id: Scalars['String']['input'];
}>;


export type GetEnvironmentQuery = { payment: { environment: { get: { id: string, name: string, type: PaymentsEnvironmentType, wallet_count: number, created_at: string, updated_at: string } } } };

export type CreateEnvironmentMutationVariables = Exact<{
  input: CreatePaymentsEnvironmentInput;
}>;


export type CreateEnvironmentMutation = { payment: { environment: { create: { id: string, name: string, type: PaymentsEnvironmentType, wallet_count: number, created_at: string, updated_at: string } } } };

export type DeleteEnvironmentMutationVariables = Exact<{
  id: Scalars['String']['input'];
}>;


export type DeleteEnvironmentMutation = { payment: { environment: { delete: boolean } } };

export type PaymentsTransactionFieldsFragment = { id: string, wallet_id: string, node_id: string, idempotency_key: string, direction: PaymentsTransactionDirection, status: PaymentsTransactionStatus, amount: string, fee?: string | null, payment_hash?: string | null, payment_request?: string | null, description?: string | null, error?: string | null, expires_at?: string | null, settled_at?: string | null, created_at: string, updated_at: string };

export type CreateReceiveTransactionMutationVariables = Exact<{
  input: CreateReceiveTransactionInput;
}>;


export type CreateReceiveTransactionMutation = { payment: { transaction: { create_receive: { id: string, wallet_id: string, node_id: string, idempotency_key: string, direction: PaymentsTransactionDirection, status: PaymentsTransactionStatus, amount: string, fee?: string | null, payment_hash?: string | null, payment_request?: string | null, description?: string | null, error?: string | null, expires_at?: string | null, settled_at?: string | null, created_at: string, updated_at: string } } } };

export type PaymentsWalletFieldsFragment = { id: string, name: string, asset_id: string, environment_id: string, created_at: string, updated_at: string, balance: { balance: string, received: string, sent: string }, asset: { id: string, symbol: string, precision: number, type: BitcoinAssetType, description?: string | null, website_url?: string | null, taproot_asset_details?: { asset_id?: string | null, group_key?: string | null, universe?: string | null } | null }, environment: { id: string, name: string, type: PaymentsEnvironmentType, wallet_count: number, created_at: string, updated_at: string }, nodes: Array<{ id: string, alias?: string | null, pubkey?: string | null, state: DeployedNodeState, type: DeployedNodeType }> };

export type ListWalletsQueryVariables = Exact<{
  environmentId: Scalars['String']['input'];
}>;


export type ListWalletsQuery = { payment: { wallet: { list: Array<{ id: string, name: string, asset_id: string, environment_id: string, created_at: string, updated_at: string, balance: { balance: string, received: string, sent: string }, asset: { id: string, symbol: string, precision: number, type: BitcoinAssetType, description?: string | null, website_url?: string | null, taproot_asset_details?: { asset_id?: string | null, group_key?: string | null, universe?: string | null } | null }, environment: { id: string, name: string, type: PaymentsEnvironmentType, wallet_count: number, created_at: string, updated_at: string }, nodes: Array<{ id: string, alias?: string | null, pubkey?: string | null, state: DeployedNodeState, type: DeployedNodeType }> }> } } };

export type GetWalletQueryVariables = Exact<{
  id: Scalars['String']['input'];
}>;


export type GetWalletQuery = { payment: { wallet: { get: { id: string, name: string, asset_id: string, environment_id: string, created_at: string, updated_at: string, balance: { balance: string, received: string, sent: string }, asset: { id: string, symbol: string, precision: number, type: BitcoinAssetType, description?: string | null, website_url?: string | null, taproot_asset_details?: { asset_id?: string | null, group_key?: string | null, universe?: string | null } | null }, environment: { id: string, name: string, type: PaymentsEnvironmentType, wallet_count: number, created_at: string, updated_at: string }, nodes: Array<{ id: string, alias?: string | null, pubkey?: string | null, state: DeployedNodeState, type: DeployedNodeType }> } } } };

export type CreateWalletMutationVariables = Exact<{
  input: CreatePaymentsWalletInput;
}>;


export type CreateWalletMutation = { payment: { wallet: { create: { id: string, name: string, asset_id: string, environment_id: string, created_at: string, updated_at: string, balance: { balance: string, received: string, sent: string }, asset: { id: string, symbol: string, precision: number, type: BitcoinAssetType, description?: string | null, website_url?: string | null, taproot_asset_details?: { asset_id?: string | null, group_key?: string | null, universe?: string | null } | null }, environment: { id: string, name: string, type: PaymentsEnvironmentType, wallet_count: number, created_at: string, updated_at: string }, nodes: Array<{ id: string, alias?: string | null, pubkey?: string | null, state: DeployedNodeState, type: DeployedNodeType }> } } } };

export type AddNodeToWalletMutationVariables = Exact<{
  input: AddNodeToWalletInput;
}>;


export type AddNodeToWalletMutation = { payment: { wallet: { add_node: { id: string, name: string, asset_id: string, environment_id: string, created_at: string, updated_at: string, balance: { balance: string, received: string, sent: string }, asset: { id: string, symbol: string, precision: number, type: BitcoinAssetType, description?: string | null, website_url?: string | null, taproot_asset_details?: { asset_id?: string | null, group_key?: string | null, universe?: string | null } | null }, environment: { id: string, name: string, type: PaymentsEnvironmentType, wallet_count: number, created_at: string, updated_at: string }, nodes: Array<{ id: string, alias?: string | null, pubkey?: string | null, state: DeployedNodeState, type: DeployedNodeType }> } } } };

export type DeleteWalletMutationVariables = Exact<{
  id: Scalars['String']['input'];
}>;


export type DeleteWalletMutation = { payment: { wallet: { delete: boolean } } };

export const PaymentsTransactionFieldsFragmentDoc = `
    fragment PaymentsTransactionFields on PaymentsTransaction {
  id
  wallet_id
  node_id
  idempotency_key
  direction
  status
  amount
  fee
  payment_hash
  payment_request
  description
  error
  expires_at
  settled_at
  created_at
  updated_at
}
    `;
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
export const ListEnvironmentsDocument = `
    query ListEnvironments {
  payment {
    environment {
      list {
        ...PaymentsEnvironmentFields
      }
    }
  }
}
    ${PaymentsEnvironmentFieldsFragmentDoc}`;
export const GetEnvironmentDocument = `
    query GetEnvironment($id: String!) {
  payment {
    environment {
      get(id: $id) {
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
        ...PaymentsEnvironmentFields
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
export const ListWalletsDocument = `
    query ListWallets($environmentId: String!) {
  payment {
    wallet {
      list(environment_id: $environmentId) {
        ...PaymentsWalletFields
      }
    }
  }
}
    ${PaymentsWalletFieldsFragmentDoc}`;
export const GetWalletDocument = `
    query GetWallet($id: String!) {
  payment {
    wallet {
      get(id: $id) {
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
export const AddNodeToWalletDocument = `
    mutation AddNodeToWallet($input: AddNodeToWalletInput!) {
  payment {
    wallet {
      add_node(input: $input) {
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
    CreateReceiveTransaction(variables: CreateReceiveTransactionMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<CreateReceiveTransactionMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<CreateReceiveTransactionMutation>({ document: CreateReceiveTransactionDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'CreateReceiveTransaction', 'mutation', variables);
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
    AddNodeToWallet(variables: AddNodeToWalletMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<AddNodeToWalletMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<AddNodeToWalletMutation>({ document: AddNodeToWalletDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'AddNodeToWallet', 'mutation', variables);
    },
    DeleteWallet(variables: DeleteWalletMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<DeleteWalletMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<DeleteWalletMutation>({ document: DeleteWalletDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'DeleteWallet', 'mutation', variables);
    }
  };
}
export type Sdk = ReturnType<typeof getSdk>;