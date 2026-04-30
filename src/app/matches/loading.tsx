export default function Loading() {
  return (
    <div className="max-w-2xl mx-auto px-4 pt-8 pb-32">
      <div className="h-8 w-28 bg-[#EDE8E0] rounded-xl animate-pulse mb-2" />
      <div className="h-4 w-40 bg-[#EDE8E0] rounded-lg animate-pulse mb-8" />
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="card flex gap-4">
            <div className="w-16 h-16 rounded-2xl bg-[#EDE8E0] animate-pulse flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-5 w-32 bg-[#EDE8E0] rounded-lg animate-pulse" />
              <div className="h-3 w-20 bg-[#EDE8E0] rounded-lg animate-pulse" />
              <div className="h-8 w-28 bg-[#EDE8E0] rounded-xl animate-pulse mt-3" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
