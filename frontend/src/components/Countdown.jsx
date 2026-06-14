import { useEffect, useState } from "react";

function calculateTimeLeft(targetDate) {
  if (!targetDate) {
    return null;
  }

  const fixedDate =
    typeof targetDate === "string"
      ? targetDate.replace(" ", "T")
      : targetDate;

  const target = new Date(fixedDate).getTime();

  if (Number.isNaN(target)) {
    return null;
  }

  const difference = target - Date.now();

  if (difference <= 0) {
    return null;
  }

  return {
    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((difference / (1000 * 60)) % 60),
    seconds: Math.floor((difference / 1000) % 60),
  };
}

export default function Countdown({
  targetDate,
  title = "Starts In",
  endedText = "Started",
}) {
  const [timeLeft, setTimeLeft] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const updateCountdown = () => {
      setTimeLeft(calculateTimeLeft(targetDate));
      setReady(true);
    };

    updateCountdown();

    const timer = setInterval(updateCountdown, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  if (!ready) {
    return null;
  }

  if (!timeLeft) {
    return (
      <div className="w-full rounded-xl border border-blue-500/30 bg-blue-500/10 px-3 py-2 text-center">
        <span className="text-[10px] font-black uppercase tracking-widest text-blue-400 sm:text-xs">
          {endedText}
        </span>
      </div>
    );
  }

  const items = [
    { label: "Days", short: "D", value: timeLeft.days },
    { label: "Hours", short: "H", value: timeLeft.hours },
    { label: "Minutes", short: "M", value: timeLeft.minutes },
    { label: "Seconds", short: "S", value: timeLeft.seconds },
  ];

  return (
    <div className="w-full">
      <p className="mb-2 text-center text-[9px] font-black uppercase tracking-widest text-blue-300 sm:text-xs">
        {title}
      </p>

      <div className="grid grid-cols-4 gap-1.5 sm:gap-3">
        {items.map((item) => (
          <div
            key={item.label}
            className="min-w-0 rounded-lg border border-blue-500/30 bg-zinc-900 px-1 py-2 text-center sm:rounded-xl sm:px-3 sm:py-4"
          >
            <p className="truncate text-base font-black leading-none text-white sm:text-2xl">
              {String(item.value).padStart(2, "0")}
            </p>

            <p className="mt-1 text-[8px] font-bold uppercase text-gray-400 sm:hidden">
              {item.short}
            </p>

            <p className="mt-1 hidden text-xs font-semibold text-gray-400 sm:block">
              {item.label}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}