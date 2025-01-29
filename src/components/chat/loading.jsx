'use client';

export default function Loading() {
  return (
    <div className="flex flex-col h-screen max-h-screen">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className="animate-pulse space-y-4">
          <div className="flex justify-end">
            <div className="rounded-lg px-4 py-2 max-w-[80%] bg-primary/50 h-12 w-64" />
          </div>
          <div className="flex justify-start">
            <div className="rounded-lg px-4 py-2 max-w-[80%] bg-muted h-24 w-96" />
          </div>
          <div className="flex justify-end">
            <div className="rounded-lg px-4 py-2 max-w-[80%] bg-primary/50 h-12 w-48" />
          </div>
          <div className="flex justify-start">
            <div className="rounded-lg px-4 py-2 max-w-[80%] bg-muted h-32 w-[90%]" />
          </div>
        </div>
      </div>
      <div className="p-4 border-t">
        <div className="flex gap-2">
          <div className="flex-1 h-10 bg-muted rounded-md animate-pulse" />
          <div className="w-20 h-10 bg-primary/50 rounded-md animate-pulse" />
        </div>
      </div>
    </div>
  );
}
