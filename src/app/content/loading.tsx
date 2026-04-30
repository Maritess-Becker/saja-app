export default function Loading() {
  return (
    <div className="max-w-2xl mx-auto px-4 pt-8 pb-32">
      <div className="h-8 w-28 bg-[#EDE8E0] rounded-xl animate-pulse mb-6" />
      <div className="flex gap-2 mb-8">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-9 w-24 bg-[#EDE8E0] rounded-full animate-pulse" />
        ))}
      </div>
      <div className="space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="card flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-[#EDE8E0] animate-pulse flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-40 bg-[#EDE8E0] rounded-lg animate-pulse" />
              <div className="h-3 w-56 bg-[#EDE8E0] rounded-lg animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
