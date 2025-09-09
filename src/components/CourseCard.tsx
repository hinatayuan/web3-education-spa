import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { formatEther } from 'viem';
import {
  useHasUserPurchasedCourse,
  useTokenAllowance,
  useTokenBalance,
  useYDTokenContract,
  useCourseManagerContract,
} from '../hooks/useContracts';
import { useUserData } from '../hooks/useUserData';
import { COURSE_MANAGER_CONTRACT_ADDRESS } from '../config/contract';
import type { Course } from '../types';

interface CourseCardProps {
  course: Course;
}

export const CourseCard = ({ course }: CourseCardProps) => {
  // 测试代码走读提交
  const { address } = useAccount();
  const [approving, setApproving] = useState(false);

  const { hasPurchased, refetchPurchaseStatus } = useHasUserPurchasedCourse(
    course.courseId,
    address || '',
  );
  const { allowance, refetchAllowance } = useTokenAllowance(
    address || '',
    COURSE_MANAGER_CONTRACT_ADDRESS,
  );
  const { refetchBalance } = useTokenBalance(address || '');
  const { addPurchasedCourse } = useUserData();

  const {
    approve,
    isPending: approveIsPending,
    isConfirming: approveIsConfirming,
    isConfirmed: approveIsConfirmed,
  } = useYDTokenContract();

  const {
    purchaseCourse,
    isPending: purchaseIsPending,
    isConfirming: purchaseIsConfirming,
    isConfirmed: purchaseIsConfirmed,
  } = useCourseManagerContract();

  // 判断是否为课程作者
  const isCreator = address?.toLowerCase() === course.creator.toLowerCase();

  // 判断是否需要授权（只有未购买且非作者的用户需要授权）
  const needsApproval = !isCreator && !hasPurchased && allowance < course.price;

  // 判断是否可以购买（已授权且未购买且非作者）
  const canPurchase = !isCreator && !hasPurchased && allowance >= course.price;

  const handleApprove = () => {
    if (!address || isCreator || hasPurchased) return;
    setApproving(true);
    approve(COURSE_MANAGER_CONTRACT_ADDRESS, course.price);
  };

  const handlePurchase = () => {
    if (!address || hasPurchased || isCreator) return;
    purchaseCourse(course.courseId);
  };

  // 当approval成功后，重置状态并刷新allowance
  useEffect(() => {
    if (approving && approveIsConfirmed) {
      setApproving(false);
      // 延时刷新allowance数据
      setTimeout(() => {
        refetchAllowance();
      }, 1500);
    }
  }, [approving, approveIsConfirmed, refetchAllowance]);

  // 当购买成功后，刷新购买状态并更新本地用户数据
  useEffect(() => {
    if (purchaseIsConfirmed) {
      // 立即更新本地用户数据
      addPurchasedCourse(course.courseId);

      // 延时刷新购买状态和余额，确保链上状态已更新
      setTimeout(() => {
        refetchPurchaseStatus();
        refetchBalance();
      }, 2000);
    }
  }, [
    purchaseIsConfirmed,
    refetchPurchaseStatus,
    addPurchasedCourse,
    course.courseId,
    refetchBalance,
  ]);

  return (
    <div className="course-card">
      <div className="course-header">
        <h3>{course.title}</h3>
        <div className="course-price">{formatEther(course.price)} YD</div>
      </div>

      <div className="course-body">
        <p className="course-description">{course.description}</p>
        <p className="course-creator">
          创建者: {course.creator.slice(0, 6)}...{course.creator.slice(-4)}
        </p>
        <p className="course-status">状态: {course.isActive ? '可购买' : '暂停销售'}</p>
      </div>

      <div className="course-actions">
        {!address ? (
          <p className="connect-wallet">请先连接钱包</p>
        ) : isCreator ? (
          <div className="creator-badge">
            <span>👑 我的课程</span>
          </div>
        ) : hasPurchased ? (
          <div className="purchased">
            <span>✓ 已购买</span>
          </div>
        ) : !course.isActive ? (
          <div className="unavailable">
            <span>暂停销售</span>
          </div>
        ) : (
          <div className="purchase-flow">
            {needsApproval ? (
              <div className="approval-step">
                <button
                  onClick={handleApprove}
                  disabled={approveIsPending || approveIsConfirming}
                  className="approve-btn"
                >
                  {approveIsPending
                    ? 'Approving...'
                    : approveIsConfirming
                      ? '确认中...'
                      : approveIsConfirmed
                        ? 'Approved!'
                        : 'Approve'}
                </button>
                <small className="approval-note">需要先授权才能购买</small>
              </div>
            ) : canPurchase ? (
              <button
                onClick={handlePurchase}
                disabled={purchaseIsPending || purchaseIsConfirming}
                className="purchase-btn"
              >
                {purchaseIsPending
                  ? '购买中...'
                  : purchaseIsConfirming
                    ? '确认购买中...'
                    : purchaseIsConfirmed
                      ? '购买成功!'
                      : '购买课程'}
              </button>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
};
