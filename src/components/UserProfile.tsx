import { useState } from 'react';
import { useAccount } from 'wagmi';
import { useUserData } from '../hooks/useUserData';

export const UserProfile = () => {
  const { address } = useAccount();
  const { userData, isVerified, updateUserName, isSigningMessage, signError } = useUserData();

  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState('');
  const [showFullAddress, setShowFullAddress] = useState(false);

  // 地址掩码处理函数
  const formatAddress = (addr: string, showFull: boolean = false) => {
    if (showFull) return addr;
    return `${addr.slice(0, 6)}...${addr.slice(-6)}`;
  };

  // 复制地址到剪贴板
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // 可以添加成功提示
    } catch (error) {
      console.error('复制失败:', error);
    }
  };

  const handleUpdateName = async () => {
    if (newName.trim() && newName !== userData?.name) {
      const success = await updateUserName(newName.trim());
      if (success) {
        setIsEditing(false);
        setNewName('');
      }
    }
  };

  const startEditing = () => {
    setNewName(userData?.name || '');
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setNewName('');
    setIsEditing(false);
  };

  if (!address) {
    return (
      <div className="user-profile">
        <h3>用户信息</h3>
        <p>请先连接钱包查看个人信息</p>
      </div>
    );
  }

  if (!isVerified) {
    return (
      <div className="user-profile">
        <h3>登录验证中</h3>
        <p>请在MetaMask中完成签名以验证您的身份...</p>
        {signError && <div className="error">签名失败: {signError.message}</div>}
      </div>
    );
  }

  return (
    <div className="user-profile">
      <h3>个人信息</h3>

      <div className="profile-info">
        <div className="info-item">
          <label>钱包地址:</label>
          <div className="address-container">
            <span
              className="address clickable"
              onClick={() => setShowFullAddress(!showFullAddress)}
              title="点击切换显示完整地址"
            >
              {formatAddress(address!, showFullAddress)}
            </span>
            <div className="address-actions">
              <button
                className="address-action-btn"
                onClick={() => copyToClipboard(address!)}
                title="复制地址"
              >
                📋
              </button>
              <button
                className="address-action-btn"
                onClick={() => setShowFullAddress(!showFullAddress)}
                title={showFullAddress ? '隐藏完整地址' : '显示完整地址'}
              >
                {showFullAddress ? '👁️‍🗨️' : '👁️'}
              </button>
            </div>
          </div>
        </div>

        <div className="info-item">
          <label>姓名:</label>
          {isEditing ? (
            <div className="edit-name">
              <input
                type="text"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                className="name-input"
              />
              <button
                onClick={handleUpdateName}
                disabled={!newName.trim() || isSigningMessage}
                className="save-btn"
              >
                {isSigningMessage ? '保存中...' : '保存'}
              </button>
              <button onClick={cancelEditing} className="cancel-btn">
                取消
              </button>
            </div>
          ) : (
            <div className="display-name">
              <span>{userData?.name || '未设置'}</span>
              <button onClick={startEditing} className="edit-btn">
                编辑
              </button>
            </div>
          )}
        </div>

        {signError && <div className="error">操作失败: {signError.message}</div>}
      </div>
    </div>
  );
};
