import { getMiniMaxClient } from '../config/openai';
import { getAIEnv } from '../config/env';
import { AIReviewResult, ReviewDimension } from '../types/review.types';

/**
 * 调用 MiniMax API 进行聊天
 */
async function chatWithMiniMax(prompt: string): Promise<string> {
  const client = getMiniMaxClient();

  // 检查客户端是否正确初始化
  if (!client) {
    throw new Error('MiniMax AI 客户端未初始化，请检查 MINIMAX_API_KEY 配置');
  }

  const aiEnv = getAIEnv();
  const { MINIMAX_MODEL } = aiEnv;

  console.log('MiniMax 请求:', { model: MINIMAX_MODEL, baseURL: client.baseURL });

  const response = await fetch(`${client.baseURL}/text/chatcompletion_v2`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${client.apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: MINIMAX_MODEL,
      messages: [
        { role: 'system', content: '你是一个专业的职场评价分析专家，请严格按照用户要求返回JSON格式。' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.3,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`MiniMax API error: ${errorText}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error('MiniMax API 返回为空');
  }

  return content;
}

export class AIService {
  // 从用户自然语言评价中提取结构化评分
  static async extractStructuredReview(rawContent: string): Promise<AIReviewResult> {
    const prompt = `
      你是一个专业的[职场企业/工作组]评价分析专家，请严格按照以下要求处理用户的评价内容：
      1. 评价维度：${Object.values(ReviewDimension).join('、')}，每个维度必须打1-5的整数分，并给出简短的维度评语
      2. 综合评分：1-5分，基于各维度评分加权计算，保留1位小数
      3. 生成3-5个精准的标签，总结导师的特点
      4. 生成100字以内的评价总结
      5. 判断评价是否有效：无恶意攻击、无灌水、内容真实和导师相关，无效请给出明确原因
      6. 必须严格返回JSON格式，不要任何额外的解释内容

      用户的原始评价内容：${rawContent}

      返回的JSON格式必须严格如下：
      {
        "overallScore": 数字,
        "dimensionScores": [
          {
            "dimension": "维度名称",
            "score": 数字,
            "comment": "该维度的评语"
          }
        ],
        "summary": "评价总结",
        "tags": ["标签1", "标签2"],
        "isQualified": true,
        "unqualifiedReason": ""
      }
      `;
    
    // 使用 MiniMax API 调用 AI
    const result = await chatWithMiniMax(prompt);

    // 解析 JSON 结果
    try {
      // 尝试提取 JSON（可能包含在 markdown 代码块中）
      let jsonStr = result;
      const codeBlockMatch = result.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (codeBlockMatch) {
        jsonStr = codeBlockMatch[1];
      }

      return JSON.parse(jsonStr.trim()) as AIReviewResult;
    } catch (parseError) {
      console.error('Failed to parse AI response:', result);
      throw new Error('AI 返回格式解析失败');
    }
  }
}
