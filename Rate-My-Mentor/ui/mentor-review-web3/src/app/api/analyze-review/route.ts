import { NextRequest, NextResponse } from "next/server";

interface AnalyzeReviewRequest {
  comment: string;
  rating: number;
}

interface AnalyzeReviewResponse {
  tags: string[];
  scores: Record<string, number>;
  sentiment: "positive" | "neutral" | "negative";
}

// 后端API地址
const BACKEND_API_BASE = process.env.NEXT_PUBLIC_API_BASE || "https://www65-hackathon-test-9a1a.up.railway.app/api/v1";

/**
 * 调用后端AI接口分析评论
 */
async function analyzeCommentWithBackend(
  comment: string,
  rating: number
): Promise<AnalyzeReviewResponse> {
  const response = await fetch(`${BACKEND_API_BASE}/ai/extract-review`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      rawContent: comment,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error("Backend API error:", error);
    throw new Error(`Backend API error: ${error}`);
  }

  const result = await response.json();

  if (!result.success) {
    throw new Error(result.message || "AI分析失败");
  }

  const data = result.data;

  // 将后端返回的格式转换为前端需要的格式
  const scoreMap: Record<string, number> = {
    communication: 0,
    technical: 0,
    responsiveness: 0,
    overall: 0,
  };

  // 映射维度评分到前端格式
  if (data.dimensionScores) {
    data.dimensionScores.forEach((dim: { dimension: string; score: number }) => {
      const dimensionMap: Record<string, string[]> = {
        沟通能力: ["communication", "沟通效率"],
        专业能力: ["technical"],
        响应速度: ["responsiveness"],
        指导能力: ["responsiveness"],
      };
      const keys = dimensionMap[dim.dimension] || [];
      keys.forEach((key) => {
        if (key) scoreMap[key] = dim.score / 5;
      });
    });
  }

  // 使用overallScore作为overall
  scoreMap.overall = data.overallScore ? data.overallScore / 5 : rating / 5;

  // 根据overallScore判断情感
  let sentiment: "positive" | "neutral" | "negative" = "neutral";
  if (data.overallScore >= 4) sentiment = "positive";
  else if (data.overallScore <= 2) sentiment = "negative";

  return {
    tags: data.tags || [],
    scores: scoreMap,
    sentiment,
  };
}

export async function POST(request: NextRequest) {
  try {
    const body: AnalyzeReviewRequest = await request.json();

    if (!body.comment || typeof body.comment !== "string") {
      return NextResponse.json(
        { error: "Missing or invalid 'comment' field" },
        { status: 400 }
      );
    }

    if (!body.rating || typeof body.rating !== "number") {
      return NextResponse.json(
        { error: "Missing or invalid 'rating' field" },
        { status: 400 }
      );
    }

    // 调用后端AI接口
    const result = await analyzeCommentWithBackend(body.comment, body.rating);

    return NextResponse.json(result, {
      headers: {
        "Cache-Control": "no-cache",
      },
    });
  } catch (error) {
    console.error("Error analyzing review:", error);
    return NextResponse.json(
      { error: "Failed to analyze review" },
      { status: 500 }
    );
  }
}
