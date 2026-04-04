import { getAIEnv } from './env';

let _minimaxClient: any = null;

/**
 * 获取 MiniMax AI Client（懒加载 + 单例）
 * - 使用 MiniMax API 替代 OpenAI
 * - API 文档: https://platform.minimax.io/document/GuYd0DXz7oLmqP3P/Text/ChatCompletion/V2
 */
export function getMiniMaxClient(): any {
  if (_minimaxClient) return _minimaxClient;

  const aiEnv = getAIEnv();
  const { MINIMAX_API_KEY } = aiEnv;

  // 如果缺少 API Key，返回 null 或使用 mock
  if (!MINIMAX_API_KEY) {
    console.warn('⚠️ MINIMAX_API_KEY 未配置，AI 功能将被禁用');
    return null;
  }

  // MiniMax 使用 REST API，无需 SDK，直接返回配置对象
  _minimaxClient = {
    apiKey: MINIMAX_API_KEY,
    baseURL: 'https://api.minimax.chat/v1',
  };

  return _minimaxClient;
}

// 兼容旧代码导入
export const openaiClient = {
  get client() {
    return getMiniMaxClient();
  }
};
