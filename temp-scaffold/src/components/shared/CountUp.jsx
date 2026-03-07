import { useCountUp } from '../../hooks/useCountUp';

export function CountUp({
  value,
  duration = 1200,
  decimals = 0,
  prefix = '',
  suffix = '',
  className = '',
}) {
  const animated = useCountUp(value, duration);
  const display =
    decimals > 0 ? animated.toFixed(decimals) : Math.round(animated);

  return (
    <span className={className}>
      {prefix}
      {display}
      {suffix}
    </span>
  );
}
