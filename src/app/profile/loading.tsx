export default function Loading() {
  return (
    <div className="max-w-2xl mx-auto px-4 pt-8 pb-32">
      <div className="h-8 w-24 bg-[#EDE8E0] rounded-xl animate-pulse mb-8" />
      <div className="flex items-center gap-4 mb-8">
        <div className="w-20 h-20 rounded-full bg-[#EDE8E0] animate-pulse" />
        <div className="space-y-2">
          <div className="h-6 w-32 bg-[#EDE8E0] rounded-lg animate-pulse" />
          <div className="h-4 w-24 bg-[#EDE8E0] rounded-lg animate-pulse" />
        </div>
      </div>
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="card space-y-2">
            <div className="h-4 w-20 bg-[#EDE8E0] rounded-lg animate-pulse" />
            <div className="h-6 w-48 bg-[#EDE8E0] rounded-lg animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  )
}
