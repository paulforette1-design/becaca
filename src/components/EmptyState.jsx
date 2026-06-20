export default function EmptyState({ icon = '💩', title, message }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-20 text-center px-8">
      <span className="text-6xl">{icon}</span>
      <h3 className="text-caca-text font-bold text-xl font-nunito">{title}</h3>
      <p className="text-caca-muted text-sm font-nunito leading-relaxed">{message}</p>
    </div>
  )
}
