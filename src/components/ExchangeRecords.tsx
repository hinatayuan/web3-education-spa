import { useAccount } from 'wagmi';
import { formatEther } from 'viem';
import { useExchangeRecords } from '../hooks/useContracts';

export const ExchangeRecords = () => {
  const { address } = useAccount();
  const { records, loading, error, refetch } = useExchangeRecords(address || '');

  if (!address) {
    return (
      <div className="exchange-records">
        <h3>兑换记录</h3>
        <div className="empty-state">
          <p>请先连接钱包查看兑换记录</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="exchange-records">
        <h3>兑换记录</h3>
        <div className="loading-state">
          <p>正在加载兑换记录...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="exchange-records">
        <h3>兑换记录</h3>
        <div className="error-state">
          <p>加载失败: {error.message}</p>
          <button onClick={() => refetch()} className="retry-btn">
            重试
          </button>
        </div>
      </div>
    );
  }

  if (!records.length) {
    return (
      <div className="exchange-records">
        <div className="records-header">
          <h3>兑换记录</h3>
          <button onClick={() => refetch()} className="refresh-btn">
            🔄 刷新
          </button>
        </div>
        <div className="empty-state">
          <p>暂无兑换记录</p>
        </div>
      </div>
    );
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('zh-CN');
  };

  const shortenHash = (hash: string) => {
    return `${hash.slice(0, 10)}...${hash.slice(-8)}`;
  };

  return (
    <div className="exchange-records">
      <div className="records-header">
        <h3>兑换记录 ({records.length})</h3>
        <button onClick={() => refetch()} className="refresh-btn">
          🔄 刷新
        </button>
      </div>

      <div className="records-list">
        {records.map(record => (
          <div key={record.id} className={`record-item ${record.type}`}>
            <div className="record-main">
              <div className="record-type">
                <span className={`type-badge ${record.type}`}>
                  {record.type === 'buy' ? '🟢 买入' : '🔴 卖出'}
                </span>
                <span className="record-time">{formatDate(record.timestamp)}</span>
              </div>

              <div className="record-amounts">
                {record.type === 'buy' ? (
                  <>
                    <div className="amount-item">
                      <label>支付 ETH:</label>
                      <span className="eth-amount">{formatEther(record.ethAmount)}</span>
                    </div>
                    <div className="amount-item">
                      <label>获得 YD:</label>
                      <span className="token-amount">{formatEther(record.tokenAmount)}</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="amount-item">
                      <label>出售 YD:</label>
                      <span className="token-amount">{formatEther(record.tokenAmount)}</span>
                    </div>
                    <div className="amount-item">
                      <label>获得 ETH:</label>
                      <span className="eth-amount">{formatEther(record.ethAmount)}</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="record-details">
              <div className="detail-item">
                <label>区块号:</label>
                <span>{record.blockNumber.toString()}</span>
              </div>
              <div className="detail-item">
                <label>交易哈希:</label>
                <a
                  href={`https://sepolia.etherscan.io/tx/${record.transactionHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="tx-link"
                >
                  {shortenHash(record.transactionHash)}
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
