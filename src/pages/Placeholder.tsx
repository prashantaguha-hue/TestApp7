interface PlaceholderProps {
  title: string
}

export function Placeholder({ title }: PlaceholderProps) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
      <h1 className="text-xl font-semibold text-slate-800">{title}</h1>
      <p className="text-sm text-slate-400">This section isn't part of the prototype yet.</p>
    </div>
  )
}
