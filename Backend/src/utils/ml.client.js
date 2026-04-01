const ApiError = require("./api.error.js");

const VALID_SENTIMENTS = new Set(["Positive", "Neutral", "Negative"]);

const getSentimentFromML = async (payload) => {
  const endpoint =
    process.env.ML_SERVICE_URL || "http://127.0.0.1:3000/api/feedback";
  const timeoutMs = Number(process.env.ML_SERVICE_TIMEOUT_MS || 4000);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    const body = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new ApiError(
        502,
        body?.error || body?.message || "ML service request failed",
      );
    }

    const sentiment = body?.sentiment || body?.data?.sentiment;

    if (!VALID_SENTIMENTS.has(sentiment)) {
      throw new ApiError(502, "ML service returned invalid sentiment");
    }

    return sentiment;
  } finally {
    clearTimeout(timeoutId);
  }
};

module.exports = {
  getSentimentFromML,
};
