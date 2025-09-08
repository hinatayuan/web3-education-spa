import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { formatUnits, parseUnits } from 'viem';
import {
  useStakingSystemContract,
  useStakingUserLinkInfo,
  useStakingLinkSystemStats,
  useStakingSystemPaused,
  useLINKBalance,
  useLINKAllowance,
  useLINKContract,
} from '../hooks/useContracts';
import { STAKING_SYSTEM_CONTRACT_ADDRESS } from '../config/contract';

export const LinkStakingSystem = () => {
  const [stakeAmount, setStakeAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [activeTab, setActiveTab] = useState<'stake' | 'withdraw' | 'rewards'>('stake');
  const [approving, setApproving] = useState(false);

  const { address } = useAccount();
  const { balance: linkBalance, refetchBalance } = useLINKBalance(address || ('' as `0x${string}`));
  const { allowance, refetchAllowance } = useLINKAllowance(
    address || ('' as `0x${string}`),
    STAKING_SYSTEM_CONTRACT_ADDRESS,
  );
  const { data: userLinkInfo, refetchUserInfo } = useStakingUserLinkInfo(
    address || ('' as `0x${string}`),
  );
  const { data: linkSystemStats, refetchSystemStats } = useStakingLinkSystemStats();
  const { isPaused } = useStakingSystemPaused();

  // LINK使用18位小数
  const stakeAmountBigInt = stakeAmount ? parseUnits(stakeAmount, 18) : 0n;
  const needsApproval = stakeAmountBigInt > 0n && stakeAmountBigInt > (allowance || 0n);
  const hasBalance = stakeAmountBigInt > 0n && stakeAmountBigInt <= (linkBalance || 0n);

  const {
    stakeLINK,
    withdrawLINK,
    claimLinkRewards,
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
  } = useLINKContract();

  const handleApproveStake = () => {
    if (!stakeAmount || !address) return;
    setApproving(true);
    const amount = parseUnits(stakeAmount, 18);
    approve(STAKING_SYSTEM_CONTRACT_ADDRESS, amount);
  };

  const handleStake = () => {
    if (!stakeAmount || !address) return;
    const amount = parseUnits(stakeAmount, 18);
    stakeLINK(amount);
  };

  const handleWithdraw = () => {
    if (!withdrawAmount || !address) return;

    const amount = parseUnits(withdrawAmount, 18);
    withdrawLINK(amount);
  };

  const handleClaimRewards = () => {
    if (!address) return;
    claimLinkRewards();
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
        refetchSystemStats();
      }, 2000);
    }
  }, [stakingConfirmed, refetchBalance, refetchUserInfo, refetchSystemStats]);

  if (isPaused) {
    return (
      <div className="staking-system">
        <div className="staking-paused">
          <h3>LINK质押系统暂时停用</h3>
          <p>系统维护中，请稍后再试</p>
        </div>
      </div>
    );
  }

  return (
    <div className="staking-system">
      <h3>LINK Aave质押系统</h3>

      {/* 系统统计 */}
      {linkSystemStats && (
        <div className="system-stats">
          <div className="stat-item">
            <span>总质押量:</span>
            <span>{formatUnits(linkSystemStats.totalLinkStaked, 18)} LINK</span>
          </div>
          <div className="stat-item">
            <span>已支付奖励:</span>
            <span>{formatUnits(linkSystemStats.totalLinkRewardsPaid, 18)} LINK</span>
          </div>
          <div className="stat-item">
            <span>Aave代币总量:</span>
            <span>{formatUnits(linkSystemStats.totalLinkATokens, 18)} aLINK</span>
          </div>
          <div className="stat-item">
            <span>可用收益:</span>
            <span>{formatUnits(linkSystemStats.availableLinkRewards, 18)} LINK</span>
          </div>
          <div className="stat-item">
            <span>当前APY:</span>
            <span>{formatUnits(linkSystemStats.currentLinkAPY, 2)}%</span>
          </div>
        </div>
      )}

      {/* 用户信息 */}
      {userLinkInfo && (
        <div className="user-info">
          <div className="info-item">
            <span>我的质押:</span>
            <span>{formatUnits(userLinkInfo.stakedAmount, 18)} LINK</span>
          </div>
          <div className="info-item">
            <span>aToken余额:</span>
            <span>{formatUnits(userLinkInfo.aTokenBalance, 18)} aLINK</span>
          </div>
          <div className="info-item">
            <span>累计奖励:</span>
            <span>{formatUnits(userLinkInfo.totalRewardsClaimed, 18)} LINK</span>
          </div>
          <div className="info-item">
            <span>可领取奖励:</span>
            <span>{formatUnits(userLinkInfo.availableRewards, 18)} LINK</span>
          </div>
          <div className="info-item">
            <span>当前价值:</span>
            <span>{formatUnits(userLinkInfo.currentValue, 18)} LINK</span>
          </div>
        </div>
      )}

      {/* 当前余额 */}
      <div className="current-balance">
        <p>LINK余额: {linkBalance ? formatUnits(linkBalance, 18) : '0'} LINK</p>
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
            <label htmlFor="stake-amount">质押数量 (LINK):</label>
            <input
              id="stake-amount"
              type="number"
              step="0.001"
              min="0"
              value={stakeAmount}
              onChange={e => setStakeAmount(e.target.value)}
              placeholder="输入要质押的LINK数量"
              className="stake-input"
            />
          </div>

          <div className="staking-info">
            <p>• 质押LINK到Aave协议获得收益</p>
            <p>• LINK将投入Aave协议进行理财</p>
            <p>• 获得aLINK代币作为凭证</p>
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
                  质押数量: {stakeAmount} LINK ({parseUnits(stakeAmount, 18).toString()} wei)
                </p>
                <p>
                  用户余额: {linkBalance ? formatUnits(linkBalance, 18) : '0'} LINK (
                  {linkBalance?.toString()} wei)
                </p>
                <p>
                  当前授权: {allowance ? formatUnits(allowance, 18) : '0'} LINK (
                  {allowance?.toString()} wei)
                </p>
                <p>余额检查: {hasBalance ? '✅ 足够' : '❌ 不足'}</p>
                <p>授权检查: {needsApproval ? '❌ 需要授权' : '✅ 已授权'}</p>
                <p>系统状态: {isPaused ? '❌ 已暂停' : '✅ 正常'}</p>
                <p>LINK合约: 0xf8Fb3713D459D7C1018BD0A49D19b4C44290EBE5</p>
                <p>质押合约: {STAKING_SYSTEM_CONTRACT_ADDRESS}</p>
              </div>
            )}

            {needsApproval && (
              <div className="approval-notice">
                <p>
                  <strong>⚠️ 注意：</strong>首次质押需要先授权LINK代币
                </p>
                <p>当前授权额度: {allowance ? formatUnits(allowance, 18) : '0'} LINK</p>
                <p>需要授权额度: {stakeAmount || '0'} LINK</p>
              </div>
            )}
            {!hasBalance && stakeAmount && (
              <div className="balance-warning">
                <p>
                  <strong>❌ 余额不足：</strong>
                </p>
                <p>当前余额: {linkBalance ? formatUnits(linkBalance, 18) : '0'} LINK</p>
                <p>需要余额: {stakeAmount} LINK</p>
              </div>
            )}
          </div>

          <div className="stake-flow">
            {needsApproval ? (
              <div className="approval-step">
                <button
                  onClick={handleApproveStake}
                  disabled={
                    !stakeAmount || !address || !hasBalance || approvePending || approveConfirming
                  }
                  className="approve-btn"
                >
                  {approvePending
                    ? 'Approving...'
                    : approveConfirming
                      ? '确认中...'
                      : approveConfirmed
                        ? 'Approved!'
                        : `Approve ${stakeAmount || '0'} LINK`}
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
                      : `质押 ${stakeAmount || '0'} LINK`}
              </button>
            )}
          </div>

          {(approveError || stakingError) && (
            <div className="error">错误: {approveError?.message || stakingError?.message}</div>
          )}
          {stakingConfirmed && (
            <div className="success">质押成功！您的LINK已投入Aave协议开始获得收益。</div>
          )}
        </div>
      )}

      {/* 提取标签页 */}
      {activeTab === 'withdraw' && (
        <div className="withdraw-form">
          <div className="input-group">
            <label htmlFor="withdraw-amount">提取数量 (LINK):</label>
            <input
              id="withdraw-amount"
              type="number"
              step="0.001"
              min="0"
              value={withdrawAmount}
              onChange={e => setWithdrawAmount(e.target.value)}
              placeholder="输入要提取的LINK数量"
              className="withdraw-input"
            />
          </div>

          <div className="withdraw-info">
            <p>• 提取LINK将从Aave协议中赎回</p>
            <p>• 系统会销毁对应的aLINK代币</p>
            <p>• 提取的LINK会发送到您的钱包</p>
            <p>
              • 最大可提取: {userLinkInfo ? formatUnits(userLinkInfo.stakedAmount, 18) : '0'} LINK
            </p>
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
                  : '提取LINK'}
          </button>

          {stakingError && <div className="error">错误: {stakingError.message}</div>}
          {stakingConfirmed && activeTab === 'withdraw' && (
            <div className="success">提取成功！LINK已发送到您的钱包。</div>
          )}
        </div>
      )}

      {/* 奖励标签页 */}
      {activeTab === 'rewards' && (
        <div className="rewards-form">
          <div className="rewards-info">
            <h4>Aave LINK理财奖励</h4>
            <p>
              可领取奖励: {userLinkInfo ? formatUnits(userLinkInfo.availableRewards, 18) : '0'} LINK
            </p>
            <p>
              累计总奖励: {userLinkInfo ? formatUnits(userLinkInfo.totalRewardsClaimed, 18) : '0'}{' '}
              LINK
            </p>
            <p className="rewards-description">这些奖励来自您质押的LINK在Aave协议中的理财收益</p>
          </div>

          <button
            onClick={handleClaimRewards}
            disabled={
              !address ||
              !userLinkInfo?.availableRewards ||
              userLinkInfo.availableRewards === 0n ||
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
  );
};
