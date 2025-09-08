import { useState, useEffect, useCallback } from 'react';
import { useAccount } from 'wagmi';
import { parseEther } from 'viem';
import { useCourseManagerContract } from '../hooks/useContracts';

export const CourseCreationForm = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
  });
  const [generatedCourseId, setGeneratedCourseId] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { address } = useAccount();
  const { createCourse, isPending, isConfirming, isConfirmed, error } = useCourseManagerContract();

  // 生成唯一的课程ID
  const generateCourseId = useCallback(() => {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 9);
    const addressSuffix = address ? address.slice(-6) : '000000';
    return `course_${timestamp}_${random}_${addressSuffix}`.toLowerCase();
  }, [address]);

  // 当用户连接钱包时生成课程ID
  useEffect(() => {
    if (address && !generatedCourseId) {
      setGeneratedCourseId(generateCourseId());
    }
  }, [address, generatedCourseId, generateCourseId]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = '课程标题不能为空';
    }

    if (!formData.description.trim()) {
      newErrors.description = '课程内容不能为空';
    }

    if (!formData.price) {
      newErrors.price = '课程价格不能为空';
    } else {
      const price = parseFloat(formData.price);
      if (price <= 0) {
        newErrors.price = '价格必须大于0';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!address) {
      alert('请先连接钱包');
      return;
    }

    if (!generatedCourseId) {
      alert('课程ID生成失败，请刷新页面重试');
      return;
    }

    if (!validateForm()) return;

    try {
      const priceInWei = parseEther(formData.price);
      createCourse(generatedCourseId, formData.title, formData.description, priceInWei);
    } catch (err) {
      console.error('价格格式错误:', err);
      setErrors({ price: '价格格式不正确' });
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // 清除对应字段的错误
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const resetForm = useCallback(() => {
    setFormData({
      title: '',
      description: '',
      price: '',
    });
    setErrors({});
    // 重新生成课程ID
    if (address) {
      setGeneratedCourseId(generateCourseId());
    }
  }, [address, generateCourseId]);

  // 创建成功后重置表单
  useEffect(() => {
    if (isConfirmed && !isPending && !isConfirming) {
      const timer = setTimeout(() => {
        resetForm();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isConfirmed, isPending, isConfirming, resetForm]);

  return (
    <div className="course-creation-form">
      <h3>创建新课程</h3>

      <form onSubmit={handleSubmit} className="form">
        <div className="form-group">
          <label htmlFor="title">课程标题*</label>
          <input
            id="title"
            type="text"
            value={formData.title}
            onChange={e => handleInputChange('title', e.target.value)}
            placeholder="输入课程标题"
            className={errors.title ? 'error' : ''}
          />
          {errors.title && <span className="error-text">{errors.title}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="description">课程内容*</label>
          <textarea
            id="description"
            value={formData.description}
            onChange={e => handleInputChange('description', e.target.value)}
            placeholder="输入课程详细内容"
            rows={4}
            className={errors.description ? 'error' : ''}
          />
          {errors.description && <span className="error-text">{errors.description}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="price">课程价格* (YD)</label>
          <input
            id="price"
            type="number"
            step="0.001"
            min="0"
            value={formData.price}
            onChange={e => handleInputChange('price', e.target.value)}
            placeholder="输入课程价格"
            className={errors.price ? 'error' : ''}
          />
          {errors.price && <span className="error-text">{errors.price}</span>}
        </div>

        <button
          type="submit"
          disabled={!address || !generatedCourseId || isPending || isConfirming}
          className="submit-btn"
        >
          {isPending
            ? '创建中...'
            : isConfirming
              ? '确认中...'
              : isConfirmed
                ? '创建成功!'
                : '创建课程'}
        </button>

        {error && <div className="error">错误: {error.message}</div>}
        {isConfirmed && (
          <div className="success">
            <p>🎉 课程创建成功！</p>
            <p className="course-id-success">
              课程ID: <span className="course-id">{generatedCourseId}</span>
            </p>
          </div>
        )}
      </form>
    </div>
  );
};
