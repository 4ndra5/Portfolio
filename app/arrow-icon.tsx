export default function ArrowIcon({ direction = "up" }: { direction?: "up" | "right" | "down" | "left" }) {
  return <img className={`round-arrow round-arrow-${direction}`} src="/category-arrow-light.png" alt="" aria-hidden="true" />;
}
