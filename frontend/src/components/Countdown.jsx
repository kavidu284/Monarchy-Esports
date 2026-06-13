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

export default function Countdown({ targetDate, endedText = "Started" }) {
  const [timeLeft, setTimeLeft] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const updateCountdown = () => {
      setTimeLeft(calculateTimeLeft(targetDate));
      setReady(true);
    };

    const startTimer = setTimeout(updateCountdown, 0);

    const timer = setInterval(updateCountdown, 1000);

    return () => {
      clearTimeout(startTimer);
      clearInterval(timer);
    };
  }, [targetDate]);

  if (!ready) {
    return null;
  }

  if (!timeLeft) {
    return (
      <span className="text-blue-400 font-semibold">
        {endedText}
      </span>
    );
  }

  return (
    <div className="grid grid-cols-4 gap-3">
      <div className="bg-zinc-900 rounded-xl p-4 text-center border border-blue-500/40">
        <p className="text-2xl font-bold text-white">{timeLeft.days}</p>
        <p className="text-xs text-gray-400">Days</p>
      </div>

      <div className="bg-zinc-900 rounded-xl p-4 text-center border border-blue-500/40">
        <p className="text-2xl font-bold text-white">{timeLeft.hours}</p>
        <p className="text-xs text-gray-400">Hours</p>
      </div>

      <div className="bg-zinc-900 rounded-xl p-4 text-center border border-blue-500/40">
        <p className="text-2xl font-bold text-white">{timeLeft.minutes}</p>
        <p className="text-xs text-gray-400">Minutes</p>
      </div>

      <div className="bg-zinc-900 rounded-xl p-4 text-center border border-blue-500/40">
        <p className="text-2xl font-bold text-white">{timeLeft.seconds}</p>
        <p className="text-xs text-gray-400">Seconds</p>
      </div>
    </div>
  );
}