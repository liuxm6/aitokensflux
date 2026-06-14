import { LoaderCircle } from "lucide-react";
import { type ComponentType, useContext, useEffect, useState } from "react";
import { Panel } from "../../components/common/ui/Panel";
import { Footer } from "../../components/layout/Footer";
import { LanguageContext } from "../../context/Language";
import { localizeKey } from "../../i18n/localization";
import { apiRequest } from "../../services/api";

export function createLegalPage({
  MarketingHeader,
}: {
  MarketingHeader: ComponentType;
}) {
  return function LegalPage({
    type,
  }: {
    type: "userAgreement" | "privacyPolicy";
  }) {
    const { language } = useContext(LanguageContext);
    const [content, setContent] = useState("");
    const [loading, setLoading] = useState(true);
    const isAgreement = type === "userAgreement";
    const title = isAgreement
      ? localizeKey(language, "User Agreement and Terms of Service")
      : localizeKey(language, "Privacy Policy");

    useEffect(() => {
      let mounted = true;
      const endpoint = isAgreement
        ? `/api/user-agreement?lang=${encodeURIComponent(language)}`
        : "/api/privacy-policy";
      void apiRequest<string>(endpoint, { method: "GET" })
        .then((response) => {
          if (
            mounted &&
            response.success &&
            typeof response.data === "string"
          ) {
            setContent(response.data);
          }
        })
        .finally(() => {
          if (mounted) setLoading(false);
        });
      return () => {
        mounted = false;
      };
    }, [isAgreement, language]);

    const trimmed = content.trim();
    const isUrl = /^https?:\/\//i.test(trimmed);
    const isHtml = /<\/?[a-z][\s\S]*>/i.test(trimmed);

    return (
      <>
        <MarketingHeader />
        <main className="section legal-page">
          <div className="wrap narrow">
            <h1 className="doc-title">{title}</h1>
            <Panel>
              {loading ? (
                <div className="empty">
                  <LoaderCircle className="spin" size={22} />
                </div>
              ) : trimmed ? (
                isUrl ? (
                  <a
                    className="btn btn-flux"
                    href={trimmed}
                    rel="noreferrer"
                    target="_blank"
                  >
                    {localizeKey(language, "Open external link")}
                  </a>
                ) : isHtml ? (
                  <div
                    className="legal-content"
                    dangerouslySetInnerHTML={{ __html: trimmed }}
                  />
                ) : (
                  <div className="legal-content">
                    {trimmed.split("\n").map((line, index) => (
                      <p key={`${line}-${index}`}>{line}</p>
                    ))}
                  </div>
                )
              ) : (
                <div className="empty">
                  {localizeKey(language, "{{title}} is not configured", {
                    title,
                  })}
                </div>
              )}
            </Panel>
          </div>
        </main>
        <Footer />
      </>
    );
  };
}
