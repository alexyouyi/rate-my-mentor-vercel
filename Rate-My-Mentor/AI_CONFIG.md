# AI 配置文档

## 概述

本项目使用 **MiniMax AI** 替代 OpenAI 进行评价分析。M2.7 Token Plan API Key 已配置。

---

## Backend 配置 (API 服务)

### 环境变量

文件：[backend_/.env.example](Rate-My-Mentor/backend_/.env.example)

```bash
# MiniMax AI 配置 (M2.7 Token Plan)
MINIMAX_API_KEY=sk-cp-ME6n_tK0Ux4kaYKOCij21zjhYoMrhocw4FUmmDjE7l3Y3sUQnRSpXSZd2vBkMivaDbgFV7CqoOiNH9OP60I8OekraYiPWKuvFy72YGzWA2Nc5U0unOa8SlU
MINIMAX_MODEL=abab6.5s-chat
```

### 修改的文件

| 文件 | 变更 |
|-----|------|
| [src/config/env.ts](Rate-My-Mentor/backend_/src/config/env.ts) | 将 `OPENAI_API_KEY` 改为 `MINIMAX_API_KEY`，`OPENAI_MODEL` 改为 `MINIMAX_MODEL` |
| [src/config/openai.ts](Rate-My-Mentor/backend_/src/config/openai.ts) | 重构为 MiniMax 客户端，使用 REST API 调用 |
| [src/services/ai.service.ts](Rate-My-Mentor/backend_/src/services/ai.service.ts) | 使用 `fetch` 直接调用 MiniMax API |

### API Endpoint

```
POST https://api.minimax.chat/v1/text/chatcompletion_v2
```

### 请求格式

```json
{
  "model": "abab6.5s-chat",
  "messages": [
    { "role": "system", "content": "系统提示词" },
    { "role": "user", "content": "用户输入" }
  ],
  "temperature": 0.3
}
```

---

## Frontend 配置 (Web 应用)

### 环境变量

文件：[ui/mentor-review-web3/.env.local](ui/mentor-review-web3/.env.local)

```bash
MINIMAX_API_KEY=sk-cp-ME6n_tK0Ux4kaYKOCij21zjhYoMrhocw4FUmmDjE7l3Y3sUQnRSpXSZd2vBkMivaDbgFV7CqoOiNH9OP60I8OekraYiPWKuvFy72YGzWA2Nc5U0unOa8SlU
```

### 相关文件

| 文件 | 作用 |
|-----|------|
| [src/app/api/analyze-review/route.ts](ui/mentor-review-web3/src/app/api/analyze-review/route.ts) | AI 分析 API 端点 |
| [src/hooks/useAIAnalysis.ts](ui/mentor-review-web3/src/hooks/useAIAnalysis.ts) | 前端调用 AI 分析的 Hook |

---

## MiniMax API 官方文档

**文档地址**: https://platform.minimax.io/document/GuYd0DXz7oLmqP3P/Text/ChatCompletion/V2

主要功能：
- 文本聊天补全 (ChatCompletion V2)
- 支持模型: abab6.5s-chat, abab6.5g-chat 等
- API 调用方式: REST API (Bearer Token 认证)

---

## 可用模型

根据项目配置，默认使用 `abab6.5s-chat`。如需使用 codingplan 或其他模型，可修改：

1. **环境变量方式** (推荐):
   ```bash
   MINIMAX_MODEL=abab6.5s-coding
   ```

2. **直接修改代码**: [env.ts](Rate-My-Mentor/backend_/src/config/env.ts) 中的默认值

---

## 验证配置

1. 复制 `.env.example` 为 `.env` 并填入配置
2. 重启后端服务
3. 调用 AI 分析接口验证连通性