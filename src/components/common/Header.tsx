import { useAccount, useConnect, useDisconnect, useChainId, useSwitchChain } from 'wagmi';
import { mainnet, sepolia } from 'wagmi/chains';
import { localhost } from '@connections/wagmi';
import { useState, useEffect, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import '../ModernHeader.css';

import type { EthereumError } from '../../types';

const ChevronDownIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="m6 9 6 6 6-6" />
  </svg>
);

const WalletIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect width="18" height="13" x="3" y="6" rx="2" />
    <path d="m3 6 9 4 9-4" />
  </svg>
);

// 导航图标组件
const IconCourses = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
  </svg>
);

const IconTokens = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="8" />
    <line x1="3" x2="6" y1="3" y2="6" />
    <line x1="21" x2="18" y1="3" y2="6" />
    <line x1="3" x2="6" y1="21" y2="18" />
    <line x1="21" x2="18" y1="21" y2="18" />
  </svg>
);

const IconCreate = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="m18 2 4 4-14 14H4v-4Z" />
    <path d="m14.5 5.5-4 4" />
  </svg>
);

const IconProfile = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const Header = () => {
  const { address, isConnected } = useAccount();
  const { connect, connectors, error, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  const location = useLocation();

  const [showNetworkDropdown, setShowNetworkDropdown] = useState(false);
  const [showWalletDropdown, setShowWalletDropdown] = useState(false);
  const [showAccountsDropdown, setShowAccountsDropdown] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [availableAccounts, setAvailableAccounts] = useState<string[]>([]);
  const [isLoadingAccounts, setIsLoadingAccounts] = useState(false);

  // 加载所有可用账户
  const loadAvailableAccounts = useCallback(async () => {
    if (!isConnected) {
      setAvailableAccounts([]);
      return;
    }

    setIsLoadingAccounts(true);
    try {
      const ethereum = window.ethereum;
      if (ethereum) {
        // 请求获取所有账户
        const accounts = (await ethereum.request({
          method: 'eth_accounts',
        })) as string[];

        // 更新可用账户列表
        setAvailableAccounts(accounts.filter(Boolean));

        // 保存到localStorage以供后续使用
        if (accounts.length > 0) {
          localStorage.setItem('web3_accounts', JSON.stringify(accounts));
        }
      }
    } catch (loadError) {
      console.error('获取账户列表失败:', loadError);
      // 从localStorage读取已保存的账户
      try {
        const savedAccounts = localStorage.getItem('web3_accounts');
        if (savedAccounts) {
          const accounts = JSON.parse(savedAccounts);
          setAvailableAccounts(accounts.filter((acc: string) => acc));
        }
      } catch (parseError) {
        console.error('读取保存的账户失败:', parseError);
      }
    } finally {
      setIsLoadingAccounts(false);
    }
  }, [isConnected]);

  // 主题切换功能
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const shouldUseDark = savedTheme === 'dark' || (!savedTheme && prefersDark);

    setIsDark(shouldUseDark);
    document.documentElement.setAttribute('data-theme', shouldUseDark ? 'dark' : 'light');
  }, []);

  // 加载账户列表
  useEffect(() => {
    if (isConnected && address) {
      loadAvailableAccounts();
    } else {
      setAvailableAccounts([]);
    }
  }, [isConnected, address, loadAvailableAccounts]);

  // 监听账户变化
  useEffect(() => {
    const ethereum = window.ethereum;
    if (ethereum && isConnected) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length > 0) {
          setAvailableAccounts(accounts.filter(Boolean));
          localStorage.setItem('web3_accounts', JSON.stringify(accounts));
        } else {
          setAvailableAccounts([]);
          localStorage.removeItem('web3_accounts');
        }
      };

      ethereum.on('accountsChanged', handleAccountsChanged);

      return () => {
        if (ethereum && ethereum.removeListener) {
          ethereum.removeListener('accountsChanged', handleAccountsChanged);
        }
      };
    }
  }, [isConnected]);

  const toggleTheme = () => {
    const newTheme = isDark ? 'light' : 'dark';
    setIsDark(!isDark);
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  };

  // 导航配置
  const navItems = [
    { path: '/', label: '课程中心', icon: IconCourses },
    { path: '/tokens', label: '代币兑换', icon: IconTokens },
    { path: '/creator', label: '创作中心', icon: IconCreate },
    { path: '/profile', label: '个人中心', icon: IconProfile },
  ];

  const supportedChains = [
    { ...localhost, color: '#10B981', icon: 'L' },
    { ...mainnet, color: '#627EEA', icon: 'Ξ' },
    { ...sepolia, color: '#FFC107', icon: 'S' },
  ];

  const currentChain = supportedChains.find(chain => chain.id === chainId) || supportedChains[0];

  const handleNetworkSwitch = (targetChainId: number) => {
    if (chainId !== targetChainId) {
      switchChain({ chainId: targetChainId as 1 | 31337 | 11155111 });
    }
    setShowNetworkDropdown(false);
  };

  const handleWalletConnect = (connector: ReturnType<typeof useConnect>['connectors'][0]) => {
    connect({ connector });
    setShowWalletDropdown(false);
  };

  const formatAddress = (addr: string, short: boolean = false) => {
    if (short) {
      return `${addr.slice(0, 4)}...${addr.slice(-2)}`;
    }
    return `${addr.slice(0, 6)}...${addr.slice(-6)}`;
  };

  // 获取可用的账户列表
  const getAvailableAccounts = () => {
    return availableAccounts.length > 0 ? availableAccounts : address ? [address] : [];
  };

  // 切换账户
  const switchAccount = async (targetAddress: string) => {
    if (targetAddress === address) {
      setShowAccountsDropdown(false);
      setShowWalletDropdown(false);
      return;
    }

    try {
      const ethereum = window.ethereum;
      if (ethereum) {
        // 大部分钱包不支持程序直接切换到特定账户
        // 我们请求用户重新选择账户
        const result = await ethereum.request({
          method: 'wallet_requestPermissions',
          params: [{ eth_accounts: {} }],
        });

        if (result) {
          // 请求获取当前账户，看是否已经切换
          const accounts = (await ethereum.request({
            method: 'eth_accounts',
          })) as string[];

          if (accounts[0] && accounts[0].toLowerCase() === targetAddress.toLowerCase()) {
            console.log('账户切换成功');
          } else {
            // 如果还没有切换到目标账户，提示用户
            const shortTarget = formatAddress(targetAddress);
            alert(`请在钱包弹窗中选择账户 ${shortTarget}`);
          }

          // 刷新账户列表
          await loadAvailableAccounts();
        }
      }
    } catch (err) {
      const ethError = err as EthereumError;
      console.error('切换账户失败:', ethError);

      if (ethError.code === 4001) {
        // 用户拒绝了请求
        console.log('用户取消了账户切换');
      } else {
        // 其他错误，提示用户手动切换
        const shortTarget = formatAddress(targetAddress);
        alert(`自动切换失败，请在钱包中手动切换到账户 ${shortTarget}`);
      }
    } finally {
      setShowAccountsDropdown(false);
      setShowWalletDropdown(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      console.log('地址已复制到剪贴板');
    } catch {
      // 降级方案 - 创建临时文本区域
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.opacity = '0';
      textArea.style.left = '-999999px';
      textArea.setAttribute('readonly', '');
      document.body.appendChild(textArea);
      textArea.select();
      textArea.setSelectionRange(0, 99999); // 移动端兼容
      try {
        // 使用Selection API作为现代替代方案
        if (document.getSelection) {
          const selection = document.getSelection();
          if (selection) {
            selection.removeAllRanges();
            const range = document.createRange();
            range.selectNodeContents(textArea);
            selection.addRange(range);
            console.log('地址已选中，请手动复制 (Ctrl+C)');
          }
        }
      } catch (copyError) {
        console.error('复制失败:', copyError);
      } finally {
        document.body.removeChild(textArea);
      }
    }
  };

  return (
    <header className="modern-header">
      <div className="header-container">
        {/* 左侧品牌区域 */}
        <div className="header-brand">
          <Link to="/" className="brand-logo-link">
            <div className="brand-logo">
              <span className="logo-icon">⚡</span>
              <span className="logo-text">Web3大学</span>
            </div>
          </Link>
        </div>

        {/* 中间导航区域 */}
        <nav className="header-nav">
          <ul className="nav-list">
            {navItems.map(item => {
              const IconComponent = item.icon;
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
                  >
                    <IconComponent />
                    <span className="nav-label">{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* 右侧工具栏 */}
        <div className="header-tools">
          {/* 主题切换 */}
          <button onClick={toggleTheme} className="theme-toggle" aria-label="切换主题">
            <span className="theme-icon">{isDark ? '☀️' : '🌙'}</span>
          </button>
          {/* 网络选择器 */}
          <div className="network-selector">
            <button
              className="network-button"
              onClick={() => setShowNetworkDropdown(!showNetworkDropdown)}
              onBlur={() => setTimeout(() => setShowNetworkDropdown(false), 200)}
            >
              <div className="network-info">
                <div className="network-indicator" style={{ backgroundColor: currentChain.color }}>
                  {currentChain.icon}
                </div>
                <span className="network-name">{currentChain.name}</span>
                <ChevronDownIcon />
              </div>
            </button>

            {showNetworkDropdown && (
              <div className="network-dropdown">
                {supportedChains.map(chain => (
                  <button
                    key={chain.id}
                    className={`network-option ${chainId === chain.id ? 'active' : ''}`}
                    onClick={() => handleNetworkSwitch(chain.id)}
                  >
                    <div className="network-indicator" style={{ backgroundColor: chain.color }}>
                      {chain.icon}
                    </div>
                    <span>{chain.name}</span>
                    {chainId === chain.id && <div className="active-indicator">✓</div>}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 钱包连接器 */}
          <div className="wallet-connector">
            {isConnected ? (
              <div className="wallet-connected-wrapper">
                <button
                  className="wallet-connected"
                  onClick={() => setShowWalletDropdown(!showWalletDropdown)}
                  onBlur={() => setTimeout(() => setShowWalletDropdown(false), 200)}
                >
                  <div className="wallet-avatar">
                    <div className="avatar-circle">{address?.slice(2, 4).toUpperCase()}</div>
                  </div>
                  <span className="wallet-address">{formatAddress(address!, true)}</span>
                  <ChevronDownIcon />
                </button>

                {showWalletDropdown && (
                  <div className="wallet-dropdown">
                    <div className="wallet-section">
                      <div className="section-header">
                        <h4>当前账户</h4>
                      </div>
                      <div className="current-account">
                        <div className="account-avatar">
                          <div className="avatar-circle">{address?.slice(2, 4).toUpperCase()}</div>
                        </div>
                        <div className="account-info">
                          <div className="account-address">
                            <span className="address-text">{formatAddress(address!)}</span>
                            <button
                              className="address-copy-btn"
                              onClick={() => copyToClipboard(address!)}
                              title="复制地址"
                            >
                              📋
                            </button>
                          </div>
                          <div className="account-network">
                            <span className="network-label">网络:</span>
                            <span className="network-name">{currentChain.name}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="wallet-section">
                      <div className="section-header">
                        <h4>账户管理</h4>
                      </div>
                      <div className="account-actions">
                        <button
                          className="account-action"
                          onClick={() => {
                            setShowAccountsDropdown(true);
                            setShowWalletDropdown(false);
                          }}
                        >
                          <span className="action-icon">🔄</span>
                          <span>切换账户</span>
                        </button>
                        <button
                          className="account-action"
                          onClick={() => copyToClipboard(address!)}
                        >
                          <span className="action-icon">📋</span>
                          <span>复制地址</span>
                        </button>
                        <button
                          className="account-action disconnect-action"
                          onClick={() => {
                            disconnect();
                            setShowWalletDropdown(false);
                          }}
                        >
                          <span className="action-icon">🚪</span>
                          <span>断开连接</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* 账户切换下拉菜单 */}
                {showAccountsDropdown && (
                  <div className="accounts-dropdown">
                    <div
                      className="dropdown-overlay"
                      onClick={() => setShowAccountsDropdown(false)}
                    />
                    <div className="accounts-content">
                      <div className="accounts-header">
                        <h4>选择账户</h4>
                        <button
                          className="close-btn"
                          onClick={() => setShowAccountsDropdown(false)}
                        >
                          ✕
                        </button>
                      </div>

                      <div className="accounts-list">
                        {isLoadingAccounts ? (
                          <div className="loading-accounts">
                            <div className="loading-spinner">⏳</div>
                            <span>正在加载账户...</span>
                          </div>
                        ) : getAvailableAccounts().length > 0 ? (
                          getAvailableAccounts().map((accountAddress, index) => (
                            <div
                              key={accountAddress}
                              className={`account-item ${accountAddress === address ? 'active' : ''}`}
                              onClick={() => switchAccount(accountAddress)}
                            >
                              <div className="account-avatar">
                                <div className="avatar-circle">
                                  {accountAddress.slice(2, 4).toUpperCase()}
                                </div>
                              </div>
                              <div className="account-details">
                                <div className="account-name">账户 {index + 1}</div>
                                <div className="account-address">
                                  {formatAddress(accountAddress)}
                                </div>
                              </div>
                              {accountAddress === address && (
                                <div className="active-indicator">✓</div>
                              )}
                            </div>
                          ))
                        ) : (
                          <div className="no-accounts">
                            <div className="no-accounts-icon">👤</div>
                            <div className="no-accounts-text">
                              <p>暂无其他账户</p>
                              <small>在钱包中添加更多账户后刷新页面</small>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="accounts-footer">
                        <div className="footer-actions">
                          <button
                            className="refresh-accounts-btn"
                            onClick={() => loadAvailableAccounts()}
                            disabled={isLoadingAccounts}
                          >
                            <span className="action-icon">🔄</span>
                            <span>刷新账户</span>
                          </button>
                          <button
                            className="add-account-btn"
                            onClick={() => {
                              setShowAccountsDropdown(false);
                              setShowWalletDropdown(true);
                            }}
                          >
                            <span className="action-icon">➕</span>
                            <span>连接新账户</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="wallet-connect-wrapper">
                <button
                  className="wallet-connect"
                  onClick={() => setShowWalletDropdown(!showWalletDropdown)}
                  onBlur={() => setTimeout(() => setShowWalletDropdown(false), 200)}
                  disabled={isPending}
                >
                  <WalletIcon />
                  <span>{isPending ? '连接中...' : '连接钱包'}</span>
                </button>

                {showWalletDropdown && !isPending && (
                  <div className="wallet-dropdown">
                    <div className="wallet-options-header">
                      <h3>选择钱包</h3>
                    </div>
                    <div className="wallet-options">
                      {connectors.map(connector => (
                        <button
                          key={connector.uid}
                          className="wallet-option"
                          onClick={() => handleWalletConnect(connector)}
                        >
                          <div className="connector-icon">
                            {connector.name === 'MetaMask' && '🦊'}
                            {connector.name === 'WalletConnect' && '🔗'}
                            {connector.name === 'Injected' && '💼'}
                            {!['MetaMask', 'WalletConnect', 'Injected'].includes(connector.name) &&
                              '🔑'}
                          </div>
                          <span>{connector.name}</span>
                        </button>
                      ))}
                    </div>
                    {error && <div className="wallet-error">{error.message}</div>}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
