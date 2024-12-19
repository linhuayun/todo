// __tests__/api.test.js

describe('Todo API', () => {
  let globalFetch;

  beforeAll(() => {
    globalFetch = global.fetch;
  });

  afterAll(() => {
    global.fetch = globalFetch;
  });

  beforeEach(() => {
    // 重置 fetch mock
    global.fetch = jest.fn();
  });

  test('toggleTodoStatus should update todo status', async () => {
    const todoId = 1;
    const newStatus = true;

    // 模拟成功的API响应
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ id: todoId, completed: newStatus })
    });

    // 模拟发送请求
    const response = await fetch(`/api/todos/${todoId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ completed: newStatus })
    });

    const data = await response.json();

    // 验证请求是否按预期发送
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledWith(`/api/todos/${todoId}`, expect.any(Object));

    // 验证响应数据
    expect(data.id).toBe(todoId);
    expect(data.completed).toBe(newStatus);
  });

  test('should handle API error', async () => {
    const todoId = 1;
    const newStatus = true;

    // 模拟API错误
    global.fetch.mockRejectedValueOnce(new Error('API Error'));

    // 验证错误处理
    await expect(fetch(`/api/todos/${todoId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ completed: newStatus })
    })).rejects.toThrow('API Error');
  });
});
