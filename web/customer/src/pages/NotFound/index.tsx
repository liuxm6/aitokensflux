import type { ComponentType } from "react";
import { AppLink } from "../../components/common/AppLink";
import { T } from "../../context/Language";

export function createNotFoundPage({
  MarketingHeader,
}: {
  MarketingHeader: ComponentType;
}) {
  return function NotFoundPage() {
    return (
      <>
        <MarketingHeader />
        <main className="signin-page">
          <section className="signin-card">
            <h1>404</h1>
            <p>
              <T id="This customer portal page was not found." />
            </p>
            <AppLink className="btn btn-flux btn-block" href="/">
              <T id="Back home" />
            </AppLink>
          </section>
        </main>
      </>
    );
  };
}
