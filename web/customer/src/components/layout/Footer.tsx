import { useContext } from "react";
import { AuthContext } from "../../context/Auth";
import { T } from "../../context/Language";
import { buildSupportMailto } from "../../helpers/account";
import { AppLink } from "../common/AppLink";
import { Brand } from "../common/Brand";

export function Footer() {
  const { user } = useContext(AuthContext);

  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-grid">
          <div>
            <Brand small />
            <p className="footer-copy">
              <T id="The unified AI model gateway that makes every call count." />
            </p>
            <p className="mono footer-domain">aitokensflux.com</p>
          </div>
          <div>
            <h4>
              <T id="Product" />
            </h4>
            <AppLink href="/#features">
              <T id="Features" />
            </AppLink>
            <AppLink href="/subscribe">
              <T id="Pricing" />
            </AppLink>
            <AppLink href={user ? "/dashboard" : "/sign-in"}>
              <T id={user ? "Dashboard" : "Sign in"} />
            </AppLink>
          </div>
          <div>
            <h4>
              <T id="Resources" />
            </h4>
            <AppLink href="/setup">
              <T id="Setup guide" />
            </AppLink>
            <AppLink href="/dashboard/usage">
              <T id="Usage" />
            </AppLink>
            <AppLink href="/dashboard/api-key">
              API <T id="keys" />
            </AppLink>
            <a href="https://check.aitokensflux.com/group/TokenFlux">
              <T id="Service status" />
            </a>
            <AppLink href="/dashboard/invite-record">
              <T id="Referrals" />
            </AppLink>
          </div>
          <div>
            <h4>
              <T id="Company" />
            </h4>
            <AppLink href="/#features">
              <T id="About" />
            </AppLink>
            <AppLink href="/user-agreement">
              <T id="Terms" />
            </AppLink>
            <AppLink href="/privacy-policy">
              <T id="Privacy" />
            </AppLink>
            <a href={buildSupportMailto("aitokensflux support")}>
              <T id="Contact" />
            </a>
          </div>
        </div>
        <div className="copy">
          <span>
            © 2026 AI Tokens Flux. <T id="All rights reserved." />
          </span>
          <span className="mono">aitokensflux.com</span>
        </div>
      </div>
    </footer>
  );
}
