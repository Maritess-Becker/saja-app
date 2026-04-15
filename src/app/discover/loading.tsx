export default function Loading() {
  return (
    <div className="max-w-lg mx-auto px-4 pt-8">
      <div className="flex items-center justify-between mb-6">
        <div className="h-8 w-32 bg-sand rounded-xl animate-pulse" />
        <div className="h-8 w-20 bg-sand rounded-xl animate-pulse" />
      </div>
      <div className="bg-white rounded-3xl shadow-lg overflow-hidden border border-sand">
        <div className="aspect-[3/4] bg-sand animate-pulse" />
        <div className="p-5 space-y-3">
          <div className="h-6 w-40 bg-sand rounded-lg animate-pulse" />
          <div className="h-4 w-24 bg-sand rounded-lg animate-pulse" />
          <div className="flex gap-2">
            <div className="h-6 w-16 bg-sand rounded-full animate-pulse" />
            <div className="h-6 w-20 bg-sand rounded-full animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  )
}
