import React, { useEffect, useState } from 'react';

interface CountdownTimerProps {
  targetDate: string;
  className?: string;
  onExpire?: () => void;
  endMessage?: string;
}

export const CountdownTimer: React.FC<CountdownTimerProps> = ({
  targetDate,
  className = 'flex h-17.5 min-w-[56px] items-center justify-center rounded-lg bg-black px-3 text-xl font-black leading-[1.35] text-white dark:bg-boxdark lg:text-3xl xl:text-[40px]',
  onExpire,
  endMessage,
}) => {
  const calculateTimeLeft = () => {
    const now = new Date();
    const difference = countdownExpirationDate.getTime() - now.getTime();

    return {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
      minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
      seconds: Math.floor((difference % (1000 * 60)) / 1000),
      isExpired: now >= countdownExpirationDate,
    };
  };

  const countdownExpirationDate = new Date(targetDate);
  const initialTime = calculateTimeLeft();

  const [days, setDays] = useState(initialTime.days);
  const [hours, setHours] = useState(initialTime.hours);
  const [minutes, setMinutes] = useState(initialTime.minutes);
  const [seconds, setSeconds] = useState(initialTime.seconds);
  const [isExpired, setIsExpired] = useState(initialTime.isExpired);

  const calculateRemainingPercentage = (): string => {
    const now = new Date();
    const difference = countdownExpirationDate.getTime() - now.getTime();
    const elapsedPercentage = (difference / countdownExpirationDate.getTime()) * 100;
    const remainingPercentage = (100 - elapsedPercentage).toFixed(2);
    return `${remainingPercentage}%`;
  };

  const formatNumber = (num: number): number[] => {
    const formattedNumber = num.toString().padStart(2, '0');
    return formattedNumber.split('').map(Number);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      const timeLeft = calculateTimeLeft();

      setDays(timeLeft.days);
      setHours(timeLeft.hours);
      setMinutes(timeLeft.minutes);
      setSeconds(timeLeft.seconds);

      if (timeLeft.isExpired !== isExpired) {
        setIsExpired(timeLeft.isExpired);
        if (timeLeft.isExpired && onExpire) {
          onExpire();
        }
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [targetDate, onExpire, isExpired]);

  return (
    <>
      {isExpired ? (
        <span className="text-red-500">{endMessage || 'The countdown has ended.'}</span>
      ) : (
        <div className="flex flex-wrap gap-6">
          <div>
            <div className="mb-3 flex items-center gap-2">
              {formatNumber(days).map((digit, index) => (
                <div key={index} className="timer-box relative overflow-hidden rounded-lg">
                  <span className={className}>{digit}</span>

                  <span
                    className="absolute bottom-0 left-0 block w-full bg-[#000]/20"
                    style={{ height: calculateRemainingPercentage() }}
                  ></span>
                </div>
              ))}
            </div>

            <span className="block text-center font-medium">Days</span>
          </div>

          <div>
            <div className="mb-3 flex items-center gap-2">
              {formatNumber(hours).map((digit, index) => (
                <div key={index} className="timer-box relative overflow-hidden rounded-lg">
                  <span className={className}>{digit}</span>

                  <span
                    className="absolute bottom-0 left-0 block w-full bg-[#000]/20"
                    style={{ height: calculateRemainingPercentage() }}
                  ></span>
                </div>
              ))}
            </div>

            <span className="block text-center font-medium">Hours</span>
          </div>

          <div>
            <div className="mb-3 flex items-center gap-2">
              {formatNumber(minutes).map((digit, index) => (
                <div key={index} className="timer-box relative overflow-hidden rounded-lg">
                  <span className={className}>{digit}</span>

                  <span
                    className="absolute bottom-0 left-0 block w-full bg-[#000]/20"
                    style={{ height: calculateRemainingPercentage() }}
                  ></span>
                </div>
              ))}
            </div>

            <span className="block text-center font-medium">Minutes</span>
          </div>

          <div>
            <div className="mb-3 flex items-center gap-2">
              {formatNumber(seconds).map((digit, index) => (
                <div key={index} className="timer-box relative overflow-hidden rounded-lg">
                  <span className={className}>{digit}</span>
                  <span
                    className="absolute bottom-0 left-0 block w-full bg-[#000]/20"
                    style={{ height: calculateRemainingPercentage() }}
                  ></span>
                </div>
              ))}
            </div>

            <span className="block text-center font-medium">Seconds</span>
          </div>
        </div>
      )}
    </>
  );
};
