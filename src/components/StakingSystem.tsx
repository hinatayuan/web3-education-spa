import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { formatUnits, parseUnits } from 'viem';
import {
  useStakingSystemContract,
  useStakingUserInfo,
  useStakingSystemStats,
  useStakingSystemPaused,
  useUSDTBalance,
  useUSDTAllowance,
  useUSDTContract,
} from '../hooks/useContracts';
import { STAKING_SYSTEM_CONTRACT_ADDRESS } from '../config/contract';
import { LinkStakingSystem } from './LinkStakingSystem';

export const StakingSystem = () => {
  const [stakeAmount, setStakeAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [activeTab, setActiveTab] = useState<'stake' | 'withdraw' | 'rewards'>('stake');
  const [activeStakingType, setActiveStakingType] = useState<'usdt' | 'link'>('usdt');
  const [approving, setApproving] = useState(false);

  const { address } = useAccount();
  const { balance: usdtBalance, refetchBalance } = useUSDTBalance(address || ('' as `0x${string}`));
  const { allowance, refetchAllowance } = useUSDTAllowance(
    address || ('' as `0x${string}`),
    STAKING_SYSTEM_CONTRACT_ADDRESS,
  );
  const { data: userInfo, refetchUserInfo } = useStakingUserInfo(address || ('' as `0x${string}`));
  const systemStats = useStakingSystemStats();
  const { isPaused } = useStakingSystemPaused();

  // USDT使用6位小数
  const stakeAmountBigInt = stakeAmount ? parseUnits(stakeAmount, 6) : 0n;
  const needsApproval = stakeAmountBigInt > 0n && stakeAmountBigInt > (allowance || 0n);
  const hasBalance = stakeAmountBigInt > 0n && stakeAmountBigInt <= (usdtBalance || 0n);

  const {
    stake,
    withdraw,
    claimRewards,
    isPending: stakingPending,
    isConfirming: stakingConfirming,
    isConfirmed: stakingConfirmed,
    error: stakingError,
  } = useStakingSystemContract();

  const {
    approve,
    isPending: approvePending,
    isConfirming: approveConfirming,
    isConfirmed: approveConfirmed,
    error: approveError,
  } = useUSDTContract();

  const handleApproveStake = () => {
    if (!stakeAmount || !address) return;
    setApproving(true);
    const amount = parseUnits(stakeAmount, 6);
    approve(STAKING_SYSTEM_CONTRACT_ADDRESS, amount);
  };

  const handleStake = () => {
    if (!stakeAmount || !address) return;
    const amount = parseUnits(stakeAmount, 6);
    stake(amount);
  };

  const handleWithdraw = () => {
    if (!withdrawAmount || !address) return;

    const amount = parseUnits(withdrawAmount, 6);
    withdraw(amount);
  };

  const handleClaimRewards = () => {
    if (!address) return;
    claimRewards();
  };

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

  // 当质押金额改变时重置 approving 状态
  useEffect(() => {
    setApproving(false);
  }, [stakeAmount]);

  // 当质押交易确认后，刷新所有相关余额数据
  useEffect(() => {
    if (stakingConfirmed) {
      // 延时刷新所有余额数据，确保链上状态已更新
      setTimeout(() => {
        refetchBalance();
        refetchUserInfo();
      }, 2000);
    }
  }, [stakingConfirmed, refetchBalance, refetchUserInfo]);

  if (isPaused) {
    return (
      <div className="staking-system">
        <div className="staking-paused">
          <h3>质押系统暂时停用</h3>
          <p>系统维护中，请稍后再试</p>
        </div>
      </div>
    );
  }

  return (
    <div className="staking-system">
      <h3>Aave质押系统</h3>

      {/* 质押类型切换 */}
      <div className="staking-type-tabs">
        <button
          className={activeStakingType === 'usdt' ? 'type-button active' : 'type-button'}
          onClick={() => setActiveStakingType('usdt')}
        >
          USDT 质押
        </button>
        <button
          className={activeStakingType === 'link' ? 'type-button active' : 'type-button'}
          onClick={() => setActiveStakingType('link')}
        >
          LINK 质押
        </button>
      </div>

      {/* 根据选择的类型显示对应的质押系统 */}
      {activeStakingType === 'usdt' ? (
        <div className="usdt-staking">
          <h4>USDT Aave质押系统</h4>

          {/* 系统统计 */}
          {systemStats && (
            <div className="system-stats">
              <div className="stat-item">
                <span>总质押量:</span>
                <span>{formatUnits(systemStats.totalStaked, 6)} USDT</span>
              </div>
              <div className="stat-item">
                <span>已支付奖励:</span>
                <span>{formatUnits(systemStats.totalRewardsPaid, 6)} USDT</span>
              </div>
              <div className="stat-item">
                <span>Aave代币总量:</span>
                <span>{formatUnits(systemStats.totalATokens, 6)} aUSDT</span>
              </div>
              <div className="stat-item">
                <span>可用收益:</span>
                <span>{formatUnits(systemStats.availableRewards, 6)} USDT</span>
              </div>
              <div className="stat-item">
                <span>当前APY:</span>
                <span>{formatUnits(systemStats.currentAPY, 2)}%</span>
              </div>
            </div>
          )}

          {/* 用户信息 */}
          {userInfo && (
            <div className="user-info">
              <div className="info-item">
                <span>我的质押:</span>
                <span>{formatUnits(userInfo.stakedAmount, 6)} USDT</span>
              </div>
              <div className="info-item">
                <span>aToken余额:</span>
                <span>{formatUnits(userInfo.aTokenBalance, 6)} aUSDT</span>
              </div>
              <div className="info-item">
                <span>累计奖励:</span>
                <span>{formatUnits(userInfo.totalRewardsClaimed, 6)} USDT</span>
              </div>
              <div className="info-item">
                <span>可领取奖励:</span>
                <span>{formatUnits(userInfo.availableRewards, 6)} USDT</span>
              </div>
              <div className="info-item">
                <span>当前价值:</span>
                <span>{formatUnits(userInfo.currentValue, 6)} USDT</span>
              </div>
            </div>
          )}

          {/* 当前余额 */}
          <div className="current-balance">
            <p>USDT余额: {usdtBalance ? formatUnits(usdtBalance, 6) : '0'} USDT</p>
          </div>

          {/* 标签页 */}
          <div className="staking-tabs">
            <button
              className={activeTab === 'stake' ? 'tab-button active' : 'tab-button'}
              onClick={() => setActiveTab('stake')}
            >
              质押
            </button>
            <button
              className={activeTab === 'withdraw' ? 'tab-button active' : 'tab-button'}
              onClick={() => setActiveTab('withdraw')}
            >
              提取
            </button>
            <button
              className={activeTab === 'rewards' ? 'tab-button active' : 'tab-button'}
              onClick={() => setActiveTab('rewards')}
            >
              领取奖励
            </button>
          </div>

          {/* 质押标签页 */}
          {activeTab === 'stake' && (
            <div className="stake-form">
              <div className="input-group">
                <label htmlFor="stake-amount">质押数量 (USDT):</label>
                <input
                  id="stake-amount"
                  type="number"
                  step="0.001"
                  min="0"
                  value={stakeAmount}
                  onChange={e => setStakeAmount(e.target.value)}
                  placeholder="输入要质押的USDT数量"
                  className="stake-input"
                />
              </div>

              <div className="staking-info">
                <p>• 质押USDT到Aave协议获得收益</p>
                <p>• USDT将投入Aave协议进行理财</p>
                <p>• 获得aUSDT代币作为凭证</p>
                <p>• Aave理财收益会自动累积，可随时领取</p>

                {/* 调试信息 */}
                {stakeAmount && (
                  <div
                    className="debug-info"
                    style={{
                      background: '#f0f8ff',
                      border: '1px solid #ccc',
                      padding: '10px',
                      margin: '10px 0',
                      fontSize: '12px',
                      borderRadius: '4px',
                    }}
                  >
                    <p>
                      <strong>🔍 调试信息:</strong>
                    </p>
                    <p>
                      质押数量: {stakeAmount} USDT ({parseUnits(stakeAmount, 6).toString()} wei)
                    </p>
                    <p>
                      用户余额: {usdtBalance ? formatUnits(usdtBalance, 6) : '0'} USDT (
                      {usdtBalance?.toString()} wei)
                    </p>
                    <p>
                      当前授权: {allowance ? formatUnits(allowance, 6) : '0'} USDT (
                      {allowance?.toString()} wei)
                    </p>
                    <p>余额检查: {hasBalance ? '✅ 足够' : '❌ 不足'}</p>
                    <p>授权检查: {needsApproval ? '❌ 需要授权' : '✅ 已授权'}</p>
                    <p>系统状态: {isPaused ? '❌ 已暂停' : '✅ 正常'}</p>
                    <p>USDT合约: 0xaA8E23Fb1079EA71e0a56F48a2aA51851D8433D0</p>
                    <p>质押合约: {STAKING_SYSTEM_CONTRACT_ADDRESS}</p>
                  </div>
                )}

                {needsApproval && (
                  <div className="approval-notice">
                    <p>
                      <strong>⚠️ 注意：</strong>首次质押需要先授权USDT代币
                    </p>
                    <p>当前授权额度: {allowance ? formatUnits(allowance, 6) : '0'} USDT</p>
                    <p>需要授权额度: {stakeAmount || '0'} USDT</p>
                  </div>
                )}
                {!hasBalance && stakeAmount && (
                  <div className="balance-warning">
                    <p>
                      <strong>❌ 余额不足：</strong>
                    </p>
                    <p>当前余额: {usdtBalance ? formatUnits(usdtBalance, 6) : '0'} USDT</p>
                    <p>需要余额: {stakeAmount} USDT</p>
                  </div>
                )}
              </div>

              <div className="stake-flow">
                {needsApproval ? (
                  <div className="approval-step">
                    <button
                      onClick={handleApproveStake}
                      disabled={
                        !stakeAmount ||
                        !address ||
                        !hasBalance ||
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
                            : `Approve ${stakeAmount || '0'} USDT`}
                    </button>
                    <small className="approval-note">需要先授权才能质押</small>
                  </div>
                ) : (
                  <button
                    onClick={handleStake}
                    disabled={
                      !stakeAmount || !address || !hasBalance || stakingPending || stakingConfirming
                    }
                    className="stake-btn"
                  >
                    {stakingPending
                      ? '质押中...'
                      : stakingConfirming
                        ? '确认质押中...'
                        : stakingConfirmed
                          ? '质押成功!'
                          : `质押 ${stakeAmount || '0'} USDT`}
                  </button>
                )}
              </div>

              {(approveError || stakingError) && (
                <div className="error">错误: {approveError?.message || stakingError?.message}</div>
              )}
              {stakingConfirmed && (
                <div className="success">质押成功！您的USDT已投入Aave协议开始获得收益。</div>
              )}
            </div>
          )}

          {/* 提取标签页 */}
          {activeTab === 'withdraw' && (
            <div className="withdraw-form">
              <div className="input-group">
                <label htmlFor="withdraw-amount">提取数量 (USDT):</label>
                <input
                  id="withdraw-amount"
                  type="number"
                  step="0.001"
                  min="0"
                  value={withdrawAmount}
                  onChange={e => setWithdrawAmount(e.target.value)}
                  placeholder="输入要提取的USDT数量"
                  className="withdraw-input"
                />
              </div>

              <div className="withdraw-info">
                <p>• 提取USDT将从Aave协议中赎回</p>
                <p>• 系统会销毁对应的aUSDT代币</p>
                <p>• 提取的USDT会发送到您的钱包</p>
                <p>• 最大可提取: {userInfo ? formatUnits(userInfo.stakedAmount, 6) : '0'} USDT</p>
              </div>

              <button
                onClick={handleWithdraw}
                disabled={!withdrawAmount || !address || stakingPending || stakingConfirming}
                className="withdraw-btn"
              >
                {stakingPending
                  ? '提取中...'
                  : stakingConfirming
                    ? '交易确认中...'
                    : stakingConfirmed
                      ? '提取成功!'
                      : '提取USDT'}
              </button>

              {stakingError && <div className="error">错误: {stakingError.message}</div>}
              {stakingConfirmed && activeTab === 'withdraw' && (
                <div className="success">提取成功！USDT已发送到您的钱包。</div>
              )}
            </div>
          )}

          {/* 奖励标签页 */}
          {activeTab === 'rewards' && (
            <div className="rewards-form">
              <div className="rewards-info">
                <h4>Aave理财奖励</h4>
                <p>可领取奖励: {userInfo ? formatUnits(userInfo.availableRewards, 6) : '0'} USDT</p>
                <p>
                  累计总奖励: {userInfo ? formatUnits(userInfo.totalRewardsClaimed, 6) : '0'} USDT
                </p>
                <p className="rewards-description">
                  这些奖励来自您质押的USDT在Aave协议中的理财收益
                </p>
              </div>

              <button
                onClick={handleClaimRewards}
                disabled={
                  !address ||
                  !userInfo?.availableRewards ||
                  userInfo.availableRewards === 0n ||
                  stakingPending ||
                  stakingConfirming
                }
                className="claim-btn"
              >
                {stakingPending
                  ? '领取中...'
                  : stakingConfirming
                    ? '交易确认中...'
                    : stakingConfirmed
                      ? '领取成功!'
                      : '领取奖励'}
              </button>

              {stakingError && <div className="error">错误: {stakingError.message}</div>}
              {stakingConfirmed && activeTab === 'rewards' && (
                <div className="success">奖励已成功领取！</div>
              )}
            </div>
          )}
        </div>
      ) : (
        <LinkStakingSystem />
      )}
    </div>
  );
};
