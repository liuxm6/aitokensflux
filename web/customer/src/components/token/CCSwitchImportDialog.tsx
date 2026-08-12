import { ArrowRightLeft, X } from "lucide-react";
import { useContext, useId, useRef } from "react";
import { AccessibleDialog } from "../common/ui/Dialog";
import { LanguageContext, T } from "../../context/Language";
import { localizeKey } from "../../i18n/localization";
import { CC_SWITCH_APP_CONFIGS } from "./cc-switch";
import type { CCSwitchApp } from "./cc-switch";

export function CCSwitchImportDialog({
  app,
  name,
  models,
  modelOptions,
  modelsLoading,
  tokenName,
  onAppChange,
  onChangeName,
  onChangeModels,
  onClose,
  onSubmit,
}: {
  app: CCSwitchApp;
  name: string;
  models: Record<string, string>;
  modelOptions: string[];
  modelsLoading: boolean;
  tokenName: string;
  onAppChange: (app: CCSwitchApp) => void;
  onChangeName: (name: string) => void;
  onChangeModels: (models: Record<string, string>) => void;
  onClose: () => void;
  onSubmit: () => void;
}) {
  const { language } = useContext(LanguageContext);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();

  const currentConfig = CC_SWITCH_APP_CONFIGS[app];
  const modelListId = `cc-switch-models-${app}`;

  const updateModel = (key: string, value: string) => {
    onChangeModels({ ...models, [key]: value });
  };

  return (
    <AccessibleDialog
      ariaLabelledBy={titleId}
      backdropClassName="purchase-backdrop as-button"
      className="purchase-dialog cc-switch-dialog"
      closeLabel={localizeKey(language, "Close")}
      initialFocusRef={closeButtonRef}
      panelClassName="purchase-panel cc-switch-panel"
      onClose={onClose}
    >
      <button
        ref={closeButtonRef}
        className="purchase-close"
        type="button"
        aria-label={localizeKey(language, "Close")}
        onClick={onClose}
      >
        <X size={20} />
      </button>
      <div className="purchase-head key-create-head">
        <span className="purchase-kicker">CC Switch</span>
        <h2 id={titleId}>
          <T id="Import to CC Switch" />
        </h2>
        {tokenName ? <p>{tokenName}</p> : null}
      </div>

      <div className="key-create-form">
        <label className="key-create-field">
          <span>
            <T id="Application" />
          </span>
          <select
            className="console-select"
            value={app}
            onChange={(event) => onAppChange(event.target.value as CCSwitchApp)}
          >
            {(
              Object.entries(CC_SWITCH_APP_CONFIGS) as [
                CCSwitchApp,
                (typeof CC_SWITCH_APP_CONFIGS)[CCSwitchApp],
              ][]
            ).map(([value, config]) => (
              <option key={value} value={value}>
                {config.label}
              </option>
            ))}
          </select>
        </label>

        <label className="key-create-field">
          <span>
            <T id="Name" />
          </span>
          <input
            className="console-input"
            value={name}
            placeholder={currentConfig.defaultName}
            onChange={(event) => onChangeName(event.target.value)}
          />
        </label>

        <datalist id={modelListId}>
          {modelOptions.map((model) => (
            <option key={model} value={model} />
          ))}
        </datalist>

        {currentConfig.modelFields.map((field) => (
          <label className="key-create-field" key={field.key}>
            <span>
              {localizeKey(language, field.labelId)}
              {field.required ? <b className="required-dot">*</b> : null}
            </span>
            <input
              className="console-input"
              list={modelListId}
              value={models[field.key] || ""}
              placeholder={localizeKey(language, "Select or enter model name")}
              onChange={(event) => updateModel(field.key, event.target.value)}
            />
          </label>
        ))}

        {modelsLoading ? (
          <p className="cc-switch-hint">
            <T id="Loading models..." />
          </p>
        ) : null}

        <div className="key-create-actions">
          <button className="btn btn-ghost" type="button" onClick={onClose}>
            <T id="Cancel" />
          </button>
          <button className="btn btn-flux" type="button" onClick={onSubmit}>
            <ArrowRightLeft size={16} />
            <T id="Open CC Switch" />
          </button>
        </div>
      </div>
    </AccessibleDialog>
  );
}
