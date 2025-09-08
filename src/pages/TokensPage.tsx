import { TokenExchange } from '../components/TokenExchange';
import { ExchangeRecords } from '../components/ExchangeRecords';
import { useAccount } from 'wagmi';
import { useTokenBalance } from '../hooks/useContracts';
import { formatEther } from 'viem';

export const TokensPage = () => {
  const { address, isConnected } = useAccount();
  const { balance } = useTokenBalance(address || '');

  return (
    <div className="tokens-page">
      <div className="page-container">
        {/* 页面介绍 */}
        <div className="tokens-intro">
          <div className="intro-content">
            <h2>YD学习币兑换</h2>
            <p>
              YD币是Web3大学的学习代币，用于购买课程和参与平台活动。通过ETH兑换获得YD币，开启您的学习之旅。
            </p>
          </div>

          {isConnected && (
            <div className="balance-card">
              <div className="balance-info">
                <div className="balance-label">当前余额</div>
                <div className="balance-amount">{balance ? formatEther(balance) : '0'} YD</div>
                <div className="balance-usd">
                  ≈ ${balance ? (parseFloat(formatEther(balance)) * 0.25).toFixed(2) : '0.00'} USD
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 兑换功能 */}
        <div className="exchange-section">
          <TokenExchange />
        </div>

        {/* 使用说明 */}
        <div className="usage-guide">
          <h3>YD币使用指南</h3>
          <div className="guide-grid">
            <div className="guide-item">
              <div className="guide-icon">🎓</div>
              <h4>购买课程</h4>
              <p>使用YD币购买平台上的所有付费课程，享受专业的Web3教育内容</p>
            </div>

            <div className="guide-item">
              <div className="guide-icon">🎁</div>
              <h4>参与活动</h4>
              <p>参与平台举办的各种学习活动和比赛，赢取更多奖励</p>
            </div>

            <div className="guide-item">
              <div className="guide-icon">🤝</div>
              <h4>社区互动</h4>
              <p>在社区中打赏优秀内容创作者，建立良性的学习生态</p>
            </div>

            <div className="guide-item">
              <div className="guide-icon">💎</div>
              <h4>权益升级</h4>
              <p>持有一定数量的YD币可获得VIP权益，享受更多专属服务</p>
            </div>
          </div>
        </div>

        {/* 兑换记录 */}
        {isConnected && (
          <div className="page-exchange-records">
            <ExchangeRecords />
          </div>
        )}

        {/* 风险提示 */}
        <div className="risk-notice">
          <div className="notice-header">
            <span className="notice-icon">⚠️</span>
            <h4>风险提示</h4>
          </div>
          <ul>
            <li>请确保您理解区块链交易的不可逆性</li>
            <li>交易前请仔细核对兑换数量和汇率</li>
            <li>建议在测试网络上先进行小额测试</li>
            <li>妥善保管您的钱包私钥和助记词</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
