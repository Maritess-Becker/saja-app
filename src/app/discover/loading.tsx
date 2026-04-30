export default function Loading() {
  return (
    <div className="max-w-lg mx-auto px-4 pt-8">
      <div className="flex items-center justify-between mb-6">
        <div className="h-8 w-32 bg-[#EDE8E0] rounded-xl animate-pulse" />
        <div className="h-8 w-20 bg-[#EDE8E0] rounded-xl animate-pulse" />
      </div>
      <div className="bg-white rounded-3xl shadow-lg overflow-hidden border border-[rgba(30,20,10,0.08)]">
        <div className="aspect-[3/4] bg-[#EDE8E0] animate-pulse" />
        <div className="p-5 space-y-3">
          <div className="h-6 w-40 bg-[#EDE8E0] rounded-lg animate-pulse" />
          <div className="h-4 w-24 bg-[#EDE8E0] rounded-lg animate-pulse" />
          <div className="flex gap-2">
            <div className="h-6 w-16 bg-[#EDE8E0] rounded-full animate-pulse" />
            <div className="h-6 w-20 bg-[#EDE8E0] rounded-full animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  )
}
