export default function Loading() {
  return (
    <div className="max-w-2xl mx-auto px-4 pt-8 pb-32">
      <div className="h-8 w-36 bg-sand rounded-xl animate-pulse mb-8" />
      <div className="card space-y-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-sand animate-pulse" />
          <div className="space-y-2">
            <div className="h-5 w-28 bg-sand rounded-lg animate-pulse" />
            <div className="h-3 w-20 bg-sand rounded-lg animate-pulse" />
          </div>
        </div>
        <div className="h-12 w-full bg-sand rounded-2xl animate-pulse" />
      </div>
    </div>
  )
}
