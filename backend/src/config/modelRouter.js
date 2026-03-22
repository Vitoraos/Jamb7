// backend/src/config/modelRouter.js

const MODEL_ROUTER = {
  mathematics: "Qwen/Qwen3-32B",
  physics:     "Qwen/Qwen2.5-72B-Instruct",
  chemistry:   "Qwen/Qwen2.5-72B-Instruct",
  default:     "meta-llama/Llama-3.3-70B-Instruct",
};

export function getModelForSubject(subject) {
  if (!subject) return MODEL_ROUTER.default;
  const key = subject.toLowerCase();
  return MODEL_ROUTER[key] ?? MODEL_ROUTER.default;
}