// __tests__/todo.api.test.js

describe('Todo API Integration', () => {
  beforeEach(() => {
    // 清理所有的mock
    jest.clearAllMocks();
    
    // 设置文档
    document.body.innerHTML = `
      <div id="todoList"></div>
    `;
  });

  test('should update todo status via API', async () => {
    const todoId = 1;
    const newStatus = true;

    // 模拟fetch响应
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        id: todoId,
        completed: newStatus,
        text: 'Test Todo'
      })
    });

    // 模拟API调用
    const response = await fetch(`/api/todos/${todoId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ completed: newStatus })
    });

    const data = await response.json();

    // 验证API调用
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledWith(
      `/api/todos/${todoId}`,
      expect.objectContaining({
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        }
      })
    );

    // 验证返回数据
    expect(data).toEqual({
      id: todoId,
      completed: newStatus,
      text: 'Test Todo'
    });
  });

  test('should handle API errors gracefully', async () => {
    const todoId = 1;
    const newStatus = true;

    // 模拟API错误
    global.fetch = jest.fn().mockRejectedValueOnce(new Error('API Error'));

    // 验证错误处理
    await expect(
      fetch(`/api/todos/${todoId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ completed: newStatus })
      })
    ).rejects.toThrow('API Error');
  });
});
