import { renderHook, act } from '@testing-library/react';
import { useImmer } from '../../src/hooks/useImmer';

describe('useImmer Hook测试', () => {
  describe('基本功能测试', () => {
    it('应该使用初始值初始化状态', () => {
      const initialValue = { count: 0, name: 'test' };
      const { result } = renderHook(() => useImmer(initialValue));

      expect(result.current[0]).toEqual(initialValue);
      // 检查对象是否被冻结
      expect(Object.isFrozen(result.current[0])).toBe(true);
    });

    it('应该支持函数形式的初始值', () => {
      const initializer = () => ({ count: 5, items: ['a', 'b'] });
      const { result } = renderHook(() => useImmer(initializer));

      expect(result.current[0]).toEqual({ count: 5, items: ['a', 'b'] });
    });

    it('应该支持原始类型的初始值', () => {
      const { result } = renderHook(() => useImmer(42));

      expect(result.current[0]).toBe(42);
    });

    it('应该支持数组初始值', () => {
      const initialArray = [1, 2, 3];
      const { result } = renderHook(() => useImmer(initialArray));

      expect(result.current[0]).toEqual(initialArray);
      // 检查数组是否被冻结
      expect(Object.isFrozen(result.current[0])).toBe(true);
    });
  });

  describe('Draft函数更新测试', () => {
    it('应该通过draft函数更新对象状态', () => {
      const { result } = renderHook(() => useImmer({ count: 0, name: 'initial' }));

      act(() => {
        result.current[1]((draft) => {
          draft.count = 10;
          draft.name = 'updated';
        });
      });

      expect(result.current[0]).toEqual({ count: 10, name: 'updated' });
    });

    it('应该通过draft函数更新嵌套对象', () => {
      const { result } = renderHook(() => 
        useImmer({ 
          user: { 
            id: 1, 
            profile: { 
              name: 'John', 
              age: 25 
            } 
          },
          settings: { 
            theme: 'light' 
          }
        })
      );

      act(() => {
        result.current[1]((draft) => {
          draft.user.profile.name = 'Jane';
          draft.user.profile.age = 30;
          draft.settings.theme = 'dark';
        });
      });

      expect(result.current[0]).toEqual({
        user: { 
          id: 1, 
          profile: { 
            name: 'Jane', 
            age: 30 
          } 
        },
        settings: { 
          theme: 'dark' 
        }
      });
    });

    it('应该通过draft函数更新数组', () => {
      const { result } = renderHook(() => useImmer([1, 2, 3]));

      act(() => {
        result.current[1]((draft) => {
          draft.push(4);
          draft[0] = 10;
        });
      });

      expect(result.current[0]).toEqual([10, 2, 3, 4]);
    });

    it('应该通过draft函数操作复杂数据结构', () => {
      const { result } = renderHook(() => 
        useImmer({
          todos: [
            { id: 1, text: 'Learn React', done: false },
            { id: 2, text: 'Learn Immer', done: false }
          ],
          filter: 'all'
        })
      );

      act(() => {
        result.current[1]((draft) => {
          // 标记第一个todo为完成
          draft.todos[0].done = true;
          // 添加新的todo
          draft.todos.push({ id: 3, text: 'Learn TypeScript', done: false });
          // 修改过滤器
          draft.filter = 'completed';
        });
      });

      expect(result.current[0]).toEqual({
        todos: [
          { id: 1, text: 'Learn React', done: true },
          { id: 2, text: 'Learn Immer', done: false },
          { id: 3, text: 'Learn TypeScript', done: false }
        ],
        filter: 'completed'
      });
    });

    it('应该支持从数组中删除元素', () => {
      const { result } = renderHook(() => 
        useImmer(['apple', 'banana', 'cherry'])
      );

      act(() => {
        result.current[1]((draft) => {
          draft.splice(1, 1); // 删除 'banana'
        });
      });

      expect(result.current[0]).toEqual(['apple', 'cherry']);
    });
  });

  describe('直接值更新测试', () => {
    it('应该支持直接值更新对象', () => {
      const { result } = renderHook(() => useImmer({ count: 0 }));

      act(() => {
        result.current[1]({ count: 5, newProp: 'added' });
      });

      expect(result.current[0]).toEqual({ count: 5, newProp: 'added' });
    });

    it('应该支持直接值更新原始类型', () => {
      const { result } = renderHook(() => useImmer(0));

      act(() => {
        result.current[1](42);
      });

      expect(result.current[0]).toBe(42);
    });

    it('应该支持直接值更新数组', () => {
      const { result } = renderHook(() => useImmer([1, 2, 3]));

      act(() => {
        result.current[1]([4, 5, 6, 7]);
      });

      expect(result.current[0]).toEqual([4, 5, 6, 7]);
    });

    it('应该支持直接值更新为null', () => {
      const { result } = renderHook(() => useImmer({ data: 'test' }));

      act(() => {
        result.current[1](null);
      });

      expect(result.current[0]).toBe(null);
    });

    it('应该支持直接值更新为undefined', () => {
      const { result } = renderHook(() => useImmer({ data: 'test' }));

      act(() => {
        result.current[1](undefined);
      });

      expect(result.current[0]).toBe(undefined);
    });
  });

  describe('不可变性测试', () => {
    it('更新后应该返回新的引用', () => {
      const { result } = renderHook(() => useImmer({ count: 0 }));
      const initialState = result.current[0];

      act(() => {
        result.current[1]((draft) => {
          draft.count = 1;
        });
      });

      expect(result.current[0]).not.toBe(initialState);
      expect(initialState.count).toBe(0); // 原始状态不应被修改
      expect(result.current[0].count).toBe(1);
    });

    it('嵌套对象更新后应该保持引用不变的部分', () => {
      const { result } = renderHook(() => 
        useImmer({
          a: { value: 1 },
          b: { value: 2 }
        })
      );

      const initialB = result.current[0].b;

      act(() => {
        result.current[1]((draft) => {
          draft.a.value = 10;
        });
      });

      // b对象没有被修改，应该保持相同的引用（结构共享）
      expect(result.current[0].b).toBe(initialB);
    });

    it('状态应该是冻结的', () => {
      const { result } = renderHook(() => useImmer({ count: 0 }));

      expect(Object.isFrozen(result.current[0])).toBe(true);
    });
  });

  describe('边界情况测试', () => {
    it('应该处理空对象', () => {
      const { result } = renderHook(() => useImmer({}));

      act(() => {
        result.current[1]((draft) => {
          draft.newProp = 'added';
        });
      });

      expect(result.current[0]).toEqual({ newProp: 'added' });
    });

    it('应该处理空数组', () => {
      const { result } = renderHook(() => useImmer([]));

      act(() => {
        result.current[1]((draft) => {
          draft.push('first');
        });
      });

      expect(result.current[0]).toEqual(['first']);
    });

    it('应该处理复杂的嵌套更新', () => {
      const { result } = renderHook(() => 
        useImmer({
          level1: {
            level2: {
              level3: {
                data: [1, 2, 3]
              }
            }
          }
        })
      );

      act(() => {
        result.current[1]((draft) => {
          draft.level1.level2.level3.data.push(4);
        });
      });

      expect(result.current[0].level1.level2.level3.data).toEqual([1, 2, 3, 4]);
    });

    it('应该处理没有变化的draft函数', () => {
      const { result } = renderHook(() => useImmer({ count: 0 }));
      const initialState = result.current[0];

      act(() => {
        result.current[1]((draft) => {
          // 不做任何修改
        });
      });

      // 如果没有修改，应该返回相同的引用
      expect(result.current[0]).toBe(initialState);
    });
  });

  describe('性能测试', () => {
    it('updater函数应该被memoized', () => {
      const { result, rerender } = renderHook(() => useImmer({ count: 0 }));
      const firstUpdater = result.current[1];

      rerender();

      const secondUpdater = result.current[1];
      expect(firstUpdater).toBe(secondUpdater);
    });

    it('多次更新应该正确工作', () => {
      const { result } = renderHook(() => useImmer({ count: 0 }));

      act(() => {
        result.current[1]((draft) => {
          draft.count = 1;
        });
      });

      act(() => {
        result.current[1]((draft) => {
          draft.count = draft.count + 1;
        });
      });

      act(() => {
        result.current[1]((draft) => {
          draft.count = draft.count * 2;
        });
      });

      expect(result.current[0].count).toBe(4); // (0 -> 1 -> 2 -> 4)
    });
  });

  describe('TypeScript类型测试', () => {
    it('应该正确推断对象类型', () => {
      interface TestState {
        name: string;
        age: number;
        active: boolean;
      }

      const { result } = renderHook(() => 
        useImmer<TestState>({ name: 'John', age: 25, active: true })
      );

      act(() => {
        result.current[1]((draft) => {
          draft.name = 'Jane';
          draft.age = 30;
          draft.active = false;
        });
      });

      expect(result.current[0]).toEqual({ name: 'Jane', age: 30, active: false });
    });

    it('应该正确推断数组类型', () => {
      const { result } = renderHook(() => useImmer<number[]>([1, 2, 3]));

      act(() => {
        result.current[1]((draft) => {
          draft.push(4);
        });
      });

      expect(result.current[0]).toEqual([1, 2, 3, 4]);
    });
  });
});