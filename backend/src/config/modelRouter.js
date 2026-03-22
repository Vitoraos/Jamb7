// backend/src/config/modelRouter.js

const MODEL_ROUTER = {
  mathematics: "deepseek-ai/DeepSeek-R1-Distill-Qwen-7B",
  physics:     "moonshotai/Kimi-K2.5",
  chemistry:   "Qwen/Qwen2.5-72B-Instruct",
  default:     "deepseek-ai/DeepSeek-R1-Distill-Qwen-7B"  # strongest reasoning
};
export function getModelForSubject(subject) {
  if (!subject) return MODEL_ROUTER.default;
  const key = subject.toLowerCase();
  return MODEL_ROUTER[key] ?? MODEL_ROUTER.default;
}
