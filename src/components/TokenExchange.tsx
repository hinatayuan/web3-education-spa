import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { formatEther, parseEther } from 'viem';
import {
  useCourseManagerContract,
  useTokenBalance,
  useExchangeReserves,
  useContractBalances,
  useTokenAllowance,
  useYDTokenContract,
} from '../hooks/useContracts';
import { COURSE_MANAGER_CONTRACT_ADDRESS } from '../config/contract';

export const TokenExchange = () => {
  const [ethAmount, setEthAmount] = useState('');
  const [sellTokenAmount, setSellTokenAmount] = useState('');
  const [adminTokenAmount, setAdminTokenAmount] = useState('');
  const [adminEthAmount, setAdminEthAmount] = useState('');
  const [activeTab, setActiveTab] = useState<'buy' | 'sell'>('buy');
  const [approving, setApproving] = useState(false);

  const { address } = useAccount();
  const { balance, refetchBalance } = useTokenBalance(address || '');
  const { allowance, refetchAllowance } = useTokenAllowance(
    address || '',
    COURSE_MANAGER_CONTRACT_ADDRESS,
  );
  const {
    buyTokens,
    sellTokens,
    mintTokenReserve,
    addETHReserve,
    isPending,
    isConfirming,
    isConfirmed,
    error,
  } = useCourseManagerContract();
  const { ethReserve, tokenReserve, refetchReserves } = useExchangeReserves();
  const { ethBalance, tokenBalance, refetchContractBalances } = useContractBalances();

  // YD代币授权相关
  const {
    approve,
    isPending: approvePending,
    isConfirming: approveConfirming,
    isConfirmed: approveConfirmed,
    error: approveError,
  } = useYDTokenContract();

  // 检查是否为管理员账户 (第一个Hardhat账户)
  const isOwner = address?.toLowerCase() === '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266';

  // 根据合约中的汇率计算，1 ETH = 4000 YD tokens
  const EXCHANGE_RATE = 4000n;

  const calculateTokenAmount = (eth: string) => {
    if (!eth) return '0';
    try {
      const ethBigInt = parseEther(eth);
      const tokenAmount = ethBigInt * EXCHANGE_RATE;
      return formatEther(tokenAmount);
    } catch {
      return '0';
    }
  };

  const calculateEthAmount = (tokens: string) => {
    if (!tokens) return '0';
    try {
      const tokenBigInt = parseEther(tokens);
      const calculatedEthAmount = tokenBigInt / EXCHANGE_RATE;
      return formatEther(calculatedEthAmount);
    } catch {
      return '0';
    }
  };

  const handleBuyTokens = () => {
    if (!ethAmount || !address) return;
    buyTokens(ethAmount);
  };

  const handleApproveSell = () => {
    if (!sellTokenAmount || !address) return;
    setApproving(true);
    const amount = parseEther(sellTokenAmount);
    approve(COURSE_MANAGER_CONTRACT_ADDRESS, amount);
  };

  const handleSellTokens = () => {
    if (!sellTokenAmount || !address) return;
    const amount = parseEther(sellTokenAmount);
    sellTokens(amount);
  };

  const handleMintTokenReserve = () => {
    if (!adminTokenAmount) return;
    mintTokenReserve(parseEther(adminTokenAmount));
  };

  const handleAddETHReserve = () => {
    if (!adminEthAmount) return;
    addETHReserve(adminEthAmount);
  };

  const tokenAmount = calculateTokenAmount(ethAmount);
  const ethFromTokens = calculateEthAmount(sellTokenAmount);

  // 检查出售时的授权状态
  const sellAmountBigInt = sellTokenAmount ? parseEther(sellTokenAmount) : 0n;
  const needsApprovalForSell = sellAmountBigInt > 0n && sellAmountBigInt > (allowance || 0n);
  const hasBalanceForSell = sellAmountBigInt > 0n && sellAmountBigInt <= (balance || 0n);

  // 当授权完成后，重置 approving 状态并刷新 allowance
  useEffect(() => {
    if (approving && approveConfirmed) {
      setApproving(false);
      // 延时刷新allowance数据
      setTimeout(() => {
        refetchAllowance();
      }, 1500);
    }
  }, [approving, approveConfirmed, refetchAllowance]);

  // 当出售金额改变时重置 approving 状态
  useEffect(() => {
    setApproving(false);
  }, [sellTokenAmount]);

  // 当兑换交易确认后，刷新所有相关余额数据
  useEffect(() => {
    if (isConfirmed) {
      // 延时刷新所有余额数据，确保链上状态已更新
      setTimeout(() => {
        refetchBalance();
        refetchReserves();
        refetchContractBalances();
      }, 2000);
    }
  }, [isConfirmed, refetchBalance, refetchReserves, refetchContractBalances]);

  return (
    <div className="token-exchange">
      <h3>代币兑换</h3>

      <div className="current-balance">
        <p>当前 YD 余额: {balance ? formatEther(balance) : '0'} YD</p>
      </div>

      {/* 标签页 */}
      <div className="exchange-tabs">
        <button
          className={activeTab === 'buy' ? 'tab-button active' : 'tab-button'}
          onClick={() => setActiveTab('buy')}
        >
          购买 YD 币
        </button>
        <button
          className={activeTab === 'sell' ? 'tab-button active' : 'tab-button'}
          onClick={() => setActiveTab('sell')}
        >
          出售 YD 币
        </button>
      </div>

      {/* 合约储备金状态 */}
      <div className="contract-status">
        <h4>🏦 合约储备状态</h4>
        <div className="reserves-info">
          <p>💰 ETH 储备: {formatEther(ethReserve)} ETH</p>
          <p>🪙 YD 储备: {formatEther(tokenReserve)} YD</p>
          <p>📊 合约 ETH 余额: {formatEther(ethBalance)} ETH</p>
          <p>📊 合约 YD 余额: {formatEther(tokenBalance)} YD</p>
        </div>
        {tokenReserve === 0n && (
          <div className="warning">
            ⚠️ <strong>警告：</strong>合约没有YD代币储备！需要管理员添加储备金才能进行兑换。
          </div>
        )}
        {tokenReserve > 0n && ethAmount && parseEther(ethAmount) * 4000n > tokenReserve && (
          <div className="warning">
            ⚠️ <strong>储备不足：</strong>合约YD储备不足以完成此次兑换！
          </div>
        )}
        {tokenReserve > 0n &&
          sellTokenAmount &&
          ethReserve > 0n &&
          parseEther(sellTokenAmount) / 4000n > ethReserve && (
            <div className="warning">
              ⚠️ <strong>ETH储备不足：</strong>合约ETH储备不足以完成此次兑换！
            </div>
          )}
      </div>

      {/* 购买 YD 币标签页 */}
      {activeTab === 'buy' && (
        <div className="exchange-form">
          <h4>ETH 兑换 YD 币</h4>
          <div className="input-group">
            <label htmlFor="eth-amount">ETH 数量:</label>
            <input
              id="eth-amount"
              type="number"
              step="0.001"
              min="0"
              value={ethAmount}
              onChange={e => setEthAmount(e.target.value)}
              placeholder="输入 ETH 数量"
              className="eth-input"
            />
          </div>

          <div className="exchange-rate">
            <p>兑换率: 1 ETH = 4000 YD</p>
            <p>将获得: {tokenAmount} YD</p>
          </div>

          <button
            onClick={handleBuyTokens}
            disabled={!ethAmount || !address || isPending || isConfirming}
            className="buy-tokens-btn"
          >
            {isPending
              ? '确认中...'
              : isConfirming
                ? '交易确认中...'
                : isConfirmed
                  ? '兑换成功!'
                  : '兑换 YD 币'}
          </button>

          {error && <div className="error">错误: {error.message}</div>}
          {isConfirmed && activeTab === 'buy' && (
            <div className="success">兑换成功！YD币已发放到您的钱包。</div>
          )}
        </div>
      )}

      {/* 出售 YD 币标签页 */}
      {activeTab === 'sell' && (
        <div className="exchange-form">
          <h4>YD 币兑换 ETH</h4>
          <div className="input-group">
            <label htmlFor="sell-token-amount">YD 币数量:</label>
            <input
              id="sell-token-amount"
              type="number"
              step="0.001"
              min="0"
              max={balance ? parseFloat(formatEther(balance)) : undefined}
              value={sellTokenAmount}
              onChange={e => setSellTokenAmount(e.target.value)}
              placeholder="输入要出售的 YD 币数量"
              className="token-input"
            />
          </div>

          <div className="exchange-rate">
            <p>兑换率: 4000 YD = 1 ETH</p>
            <p>将获得: {ethFromTokens} ETH</p>
            <p>最大可出售: {balance ? formatEther(balance) : '0'} YD</p>
          </div>

          {needsApprovalForSell && (
            <div className="approval-notice">
              <p>
                <strong>⚠️ 注意：</strong>出售YD币需要先授权合约
              </p>
              <p>当前授权额度: {allowance ? formatEther(allowance) : '0'} YD</p>
              <p>需要授权额度: {sellTokenAmount || '0'} YD</p>
            </div>
          )}

          {sellTokenAmount && parseEther(sellTokenAmount) > (balance || 0n) && (
            <div className="warning">
              ⚠️ <strong>余额不足：</strong>您的YD币余额不足以完成此次兑换！
            </div>
          )}

          <div className="sell-flow">
            {needsApprovalForSell ? (
              <div className="approval-step">
                <button
                  onClick={handleApproveSell}
                  disabled={
                    !sellTokenAmount ||
                    !address ||
                    !hasBalanceForSell ||
                    approvePending ||
                    approveConfirming
                  }
                  className="approve-btn"
                >
                  {approvePending
                    ? 'Approving...'
                    : approveConfirming
                      ? '确认中...'
                      : approveConfirmed
                        ? 'Approved!'
                        : `Approve ${sellTokenAmount || '0'} YD`}
                </button>
                <small className="approval-note">需要先授权才能出售</small>
              </div>
            ) : (
              <button
                onClick={handleSellTokens}
                disabled={
                  !sellTokenAmount || !address || !hasBalanceForSell || isPending || isConfirming
                }
                className="sell-tokens-btn"
              >
                {isPending
                  ? '出售中...'
                  : isConfirming
                    ? '确认出售中...'
                    : isConfirmed
                      ? '出售成功!'
                      : '出售 YD 币'}
              </button>
            )}
          </div>

          {(error || approveError) && (
            <div className="error">错误: {error?.message || approveError?.message}</div>
          )}
          {isConfirmed && activeTab === 'sell' && (
            <div className="success">兑换成功！ETH已发送到您的钱包。</div>
          )}
        </div>
      )}

      {/* 管理员面板 */}
      {isOwner && (
        <div className="admin-panel">
          <h4>🔧 管理员面板</h4>
          <div className="admin-actions">
            <div className="admin-section">
              <h5>添加YD代币储备 (Mint)</h5>
              <div className="input-group">
                <input
                  type="number"
                  step="1000"
                  min="0"
                  value={adminTokenAmount}
                  onChange={e => setAdminTokenAmount(e.target.value)}
                  placeholder="YD代币数量 (如: 1000000)"
                />
                <button
                  onClick={handleMintTokenReserve}
                  disabled={!adminTokenAmount || isPending || isConfirming}
                  className="admin-btn"
                >
                  {isPending || isConfirming ? '处理中...' : 'Mint YD储备'}
                </button>
              </div>
            </div>

            <div className="admin-section">
              <h5>添加ETH储备</h5>
              <div className="input-group">
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  value={adminEthAmount}
                  onChange={e => setAdminEthAmount(e.target.value)}
                  placeholder="ETH数量 (如: 10)"
                />
                <button
                  onClick={handleAddETHReserve}
                  disabled={!adminEthAmount || isPending || isConfirming}
                  className="admin-btn"
                >
                  {isPending || isConfirming ? '处理中...' : '添加ETH储备'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
