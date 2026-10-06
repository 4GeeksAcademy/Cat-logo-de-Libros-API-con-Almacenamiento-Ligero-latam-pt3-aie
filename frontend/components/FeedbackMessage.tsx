export function FeedbackMessage({ message, kind = "error" }: { message: string; kind?: "error" | "success" }) {
  return <p className={`feedback feedback-${kind}`} role={kind === "error" ? "alert" : "status"}>{message}</p>;
}
