export function Loading({ message = 'LOADING...' }: { message?: string }) {
  return (
    <div className="flex flex-col items-center gap-4 py-8" role="status" aria-live="polite">
      <div className="text-4xl animate-float" aria-hidden="true">👻</div>
      <p className="font-pixel text-[10px] text-[#EDE7F6] text-center leading-loose">
        {message}
      </p>
      <div className="flex gap-1" aria-hidden="true">
        {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
          <div
            key={i}
            className="w-2 h-2 bg-[#FF7A00]"
            style={{
              animation: `blink 1s step-end infinite`,
              animationDelay: `${i * 0.125}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
