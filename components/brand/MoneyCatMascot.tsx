import Image from "next/image";

export function MoneyCatMascot({ className = "", priority = false }: { className?: string; priority?: boolean }) {
  return (
    <figure className={`moneycat-figure ${className}`}>
      <Image
        alt="Kucing putih Moneyhist dengan liontin koin emas"
        className="moneycat-image"
        height={1450}
        priority={priority}
        src="/images/moneyhist-zhaocai-cat.png"
        width={1240}
      />
    </figure>
  );
}
