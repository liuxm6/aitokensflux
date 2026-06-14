import { AppLink } from "./AppLink";

const brandLockupUrl = new URL(
  "../../assets/brand/lockup-horizontal-flux-light.svg",
  import.meta.url,
).href;
const brandIconUrl = new URL(
  "../../assets/brand/icon-color.svg",
  import.meta.url,
).href;

export function Brand({ small = false }: { small?: boolean }) {
  return (
    <AppLink className={`brand${small ? " sm" : ""}`} href="/">
      <img
        className="brand-logo-lockup"
        src={brandLockupUrl}
        alt="aitokensflux"
      />
      <img className="brand-logo-icon" src={brandIconUrl} alt="aitokensflux" />
    </AppLink>
  );
}
