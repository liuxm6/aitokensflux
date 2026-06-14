package system_setting

import (
	"strings"

	"github.com/QuantumNous/new-api/setting/config"
)

type LegalSettings struct {
	UserAgreement string `json:"user_agreement"`
	PrivacyPolicy string `json:"privacy_policy"`
}

const DefaultUserAgreementZhTW = `# 使用者協議與服務條款

最後更新日期：2026 年 6 月 8 日

歡迎使用 AI Tokens Flux。本協議適用於您訪問或使用本平台網站、API 代理、模型接入、訂閱方案、按量充值、帳戶管理及相關服務。請您在註冊、登入、購買套餐、充值或使用 API 前仔細閱讀本協議。您勾選同意、註冊帳戶、完成付款或實際使用服務，即表示您已閱讀、理解並同意受本協議約束。

## 1. 服務說明

AI Tokens Flux 提供面向 AI 開發與使用場景的統一接入服務，包括但不限於 API 轉發、模型調用、用量統計、金鑰管理、套餐訂閱、按量充值、配置教程及相關客戶支援。本平台可能根據業務、技術或安全需要調整服務內容、模型列表、計費方式、功能入口或使用限制。

您理解並同意，部分 AI 模型、支付、郵件、登入、人機驗證、雲服務或網路能力可能由第三方服務商提供。本平台會盡合理努力維持服務可用性，但不保證第三方服務始終可用、無錯誤或符合您的全部預期。

## 2. 帳戶與使用資格

您應提供真實、準確、完整且可聯絡的註冊資料，並在資料變更時及時更新。您應妥善保管帳戶、密碼、API Key、驗證碼、OAuth 授權及其他登入憑證，因您未妥善保管而造成的損失由您自行承擔。

您不得冒用他人身份、批量惡意註冊、出售或出租帳戶、繞過安全校驗、干擾平台正常運行，或以任何方式未經授權訪問他人帳戶、系統、資料或服務。若我們合理認為您的帳戶存在安全風險、違規使用或異常交易，本平台有權要求驗證身份、限制部分功能、暫停服務或終止帳戶。

## 3. 套餐、充值與付款

平台可能提供訂閱套餐、一次性套餐、按量充值、試用額度、優惠活動或其他付費服務。具體價格、額度、有效期、重置規則、支付方式及適用限制，以購買頁面、訂單頁面、後台配置或平台公示為準。

除法律另有強制規定或平台另行明確承諾外，已完成支付的套餐、充值餘額、優惠額度、試用額度通常不支持退款、折現、轉讓或兌換現金。若因第三方支付、匯率、手續費、稅費或風控導致實付金額與展示金額存在差異，應以實際支付渠道和訂單記錄為準。

您應自行確認所購買服務是否符合您的使用需求。若套餐額度耗盡、到期、被取消或因違規被限制，相關 API 調用、代理轉發或增值功能可能無法繼續使用。

## 4. 可接受使用

您承諾遵守適用法律法規、第三方模型服務商政策及平台使用規則。您不得使用本平台從事或協助從事以下行為：

- 侵犯他人知識產權、隱私權、商業秘密、人格權或其他合法權益；
- 生成、傳播或處理違法、有害、欺詐、騷擾、仇恨、暴力、色情、惡意程式、釣魚、垃圾訊息或其他不當內容；
- 進行未授權爬取、掃描、攻擊、壓測、逆向工程、繞過限流、繞過計費或破壞服務穩定性的行為；
- 將服務用於高風險決策場景而未進行充分人工審核，包括醫療、法律、金融、就業、信貸、保險、公共安全等可能對個人權益造成重大影響的場景；
- 以違反第三方模型、支付、雲服務或開源項目規則的方式使用本平台。

您對透過帳戶、API Key 或其他憑證發起的請求、輸入內容、輸出內容、使用結果及其後續處理承擔責任。

## 5. AI 輸入與輸出

您理解 AI 生成內容可能存在不準確、不完整、過時、偏差、不可用或不適合特定用途的情況。您應根據實際場景自行判斷、驗證和審核輸出內容，不應將 AI 輸出作為唯一依據用於專業建議、重大決策或法律要求必須由專業人士完成的事項。

除平台另有明確說明外，本平台不主張您合法提交內容或合法獲得輸出內容中的權利。但您應確保自己擁有提交相關資料、提示詞、文件、程式碼、圖片或其他內容所必需的權利或授權。

## 6. 資料與隱私

為提供服務、完成付款、保障安全、統計用量、處理客服請求及履行法律義務，平台可能處理您的帳戶資料、聯絡方式、付款狀態、API 調用記錄、用量資訊、日誌資訊及必要的請求元資料。

在模型代理或第三方服務調用過程中，您的輸入、輸出或相關請求資料可能會被傳輸至相應的上游模型、支付、人機驗證、郵件或雲服務提供商。請勿提交您無權處理的敏感個人資料、機密資訊、商業秘密或受額外合規要求約束的資料，除非您已完成必要評估並取得合法授權。

平台將採取合理的技術與管理措施保護資料安全，但網際網路服務不存在絕對安全。因您自身設備、網路、憑證洩露、第三方服務或不可抗力導致的風險，平台在法律允許範圍內不承擔超出合理控制範圍的責任。

## 7. 知識產權

平台網站、介面、商標、標識、頁面設計、文案、程式、資料結構、文檔及相關素材的權利歸平台或相應權利人所有。未經授權，您不得複製、修改、分發、出售、出租、反向工程、抓取、鏡像或以其他方式使用平台內容。

您保留自己依法享有的內容權利，但您授予平台在提供、維護、保護和改進服務所必需範圍內處理相關內容的權利。

## 8. 服務可用性與變更

平台可能因系統維護、版本升級、容量調整、安全事件、第三方故障、網路問題、政策變化、不可抗力或其他合理原因中斷、限制或調整服務。我們會在合理可行範圍內降低影響，但不承諾服務永久、連續、無錯誤或完全符合您的特定目的。

平台有權根據風控、合規、成本、上游限制或產品規劃調整模型、費率、限額、套餐、充值規則、可用功能或服務入口。涉及已購買服務的重要變更，平台將盡合理努力透過網站公告、站內通知或其他方式提示。

## 9. 免責與責任限制

在法律允許的最大範圍內，平台按「現狀」和「可用」基礎提供服務，不對服務的適銷性、特定用途適用性、準確性、完整性、連續性、安全性或不侵權作出明示或默示保證。

對於因使用或無法使用服務而產生的間接、附帶、特殊、懲罰性或後果性損失，包括利潤損失、資料遺失、業務中斷、商譽損害或第三方索賠，平台在法律允許範圍內不承擔責任。若平台依法需承擔責任，責任總額以您在爭議發生前十二個月內就相關服務實際支付的金額為上限。

## 10. 暫停與終止

若您違反本協議、適用法律、第三方服務政策或平台公示規則，或您的使用行為可能導致安全、合規、支付、濫用、聲譽或服務穩定性風險，平台有權在合理範圍內採取措施，包括提醒整改、限制請求、暫停 API Key、凍結帳戶、取消訂單、終止服務或依法保存、披露相關資料。

您可停止使用服務或按平台流程申請關閉帳戶。帳戶終止後，依法或為完成結算、風控、爭議處理、安全審計所需的資料可能在必要期限內保留。

## 11. 條款更新

平台可能不時更新本協議。更新後的條款會透過網站頁面、站內通知或其他合理方式公布，並自公布時或通知載明的日期起生效。若您在條款更新後繼續使用服務，視為您接受更新後的條款；若您不同意更新內容，應停止使用相關服務。

## 12. 適用法律與爭議處理

除強制性法律另有規定外，本協議的訂立、履行、解釋及爭議處理，適用平台運營主體所在地或服務提供地的法律。因本協議或服務產生的爭議，雙方應先友好協商；協商不成的，任一方可向有管轄權的法院或爭議解決機構提交處理。

## 13. 聯絡方式

如您對本協議、帳戶、付款、資料處理或服務使用有疑問，請透過以下渠道聯絡我們：

- 官方網站：https://aitokensflux.com
- 客服郵箱：support@aitokensflux.com
- 聯絡地址：本服務以線上方式提供，暫無線下接待地址；如後續需要書面通知或法律文件送達，請先透過客服郵箱與我們確認有效收件方式。`

const DefaultUserAgreementZhCN = `# 使用者協議與服務條款

最后更新日期：2026 年 6 月 8 日

欢迎使用 AI Tokens Flux。本协议适用于您访问或使用本平台网站、API 代理、模型接入、订阅方案、按量充值、账户管理及相关服务。请您在注册、登录、购买套餐、充值或使用 API 前仔细阅读本协议。您勾选同意、注册账户、完成付款或实际使用服务，即表示您已阅读、理解并同意受本协议约束。

## 1. 服务说明

AI Tokens Flux 提供面向 AI 开发与使用场景的统一接入服务，包括但不限于 API 转发、模型调用、用量统计、密钥管理、套餐订阅、按量充值、配置教程及相关客户支持。本平台可能根据业务、技术或安全需要调整服务内容、模型列表、计费方式、功能入口或使用限制。

您理解并同意，部分 AI 模型、支付、邮件、登录、人机验证、云服务或网络能力可能由第三方服务商提供。本平台会尽合理努力维持服务可用性，但不保证第三方服务始终可用、无错误或符合您的全部预期。

## 2. 账户与使用资格

您应提供真实、准确、完整且可联系的注册资料，并在资料变更时及时更新。您应妥善保管账户、密码、API Key、验证码、OAuth 授权及其他登录凭证，因您未妥善保管而造成的损失由您自行承担。

您不得冒用他人身份、批量恶意注册、出售或出租账户、绕过安全校验、干扰平台正常运行，或以任何方式未经授权访问他人账户、系统、数据或服务。若我们合理认为您的账户存在安全风险、违规使用或异常交易，本平台有权要求验证身份、限制部分功能、暂停服务或终止账户。

## 3. 套餐、充值与付款

平台可能提供订阅套餐、一次性套餐、按量充值、试用额度、优惠活动或其他付费服务。具体价格、额度、有效期、重置规则、支付方式及适用限制，以购买页面、订单页面、后台配置或平台公示为准。

除法律另有强制规定或平台另行明确承诺外，已完成支付的套餐、充值余额、优惠额度、试用额度通常不支持退款、折现、转让或兑换现金。若因第三方支付、汇率、手续费、税费或风控导致实付金额与展示金额存在差异，应以实际支付渠道和订单记录为准。

您应自行确认所购买服务是否符合您的使用需求。若套餐额度耗尽、到期、被取消或因违规被限制，相关 API 调用、代理转发或增值功能可能无法继续使用。

## 4. 可接受使用

您承诺遵守适用法律法规、第三方模型服务商政策及平台使用规则。您不得使用本平台从事或协助从事以下行为：

- 侵犯他人知识产权、隐私权、商业秘密、人格权或其他合法权益；
- 生成、传播或处理违法、有害、欺诈、骚扰、仇恨、暴力、色情、恶意程序、钓鱼、垃圾信息或其他不当内容；
- 进行未授权爬取、扫描、攻击、压测、逆向工程、绕过限流、绕过计费或破坏服务稳定性的行为；
- 将服务用于高风险决策场景而未进行充分人工审核，包括医疗、法律、金融、就业、信贷、保险、公共安全等可能对个人权益造成重大影响的场景；
- 以违反第三方模型、支付、云服务或开源项目规则的方式使用本平台。

您对通过账户、API Key 或其他凭证发起的请求、输入内容、输出内容、使用结果及其后续处理承担责任。

## 5. AI 输入与输出

您理解 AI 生成内容可能存在不准确、不完整、过时、偏差、不可用或不适合特定用途的情况。您应根据实际场景自行判断、验证和审核输出内容，不应将 AI 输出作为唯一依据用于专业建议、重大决策或法律要求必须由专业人士完成的事项。

除平台另有明确说明外，本平台不主张您合法提交内容或合法获得输出内容中的权利。但您应确保自己拥有提交相关资料、提示词、文件、代码、图片或其他内容所必需的权利或授权。

## 6. 数据与隐私

为提供服务、完成付款、保障安全、统计用量、处理客服请求及履行法律义务，平台可能处理您的账户资料、联系方式、付款状态、API 调用记录、用量信息、日志信息及必要的请求元数据。

在模型代理或第三方服务调用过程中，您的输入、输出或相关请求数据可能会被传输至相应的上游模型、支付、人机验证、邮件或云服务提供商。请勿提交您无权处理的敏感个人资料、机密信息、商业秘密或受额外合规要求约束的数据，除非您已完成必要评估并取得合法授权。

平台将采取合理的技术与管理措施保护数据安全，但互联网服务不存在绝对安全。因您自身设备、网络、凭证泄露、第三方服务或不可抗力导致的风险，平台在法律允许范围内不承担超出合理控制范围的责任。

## 7. 知识产权

平台网站、界面、商标、标识、页面设计、文案、程序、数据结构、文档及相关素材的权利归平台或相应权利人所有。未经授权，您不得复制、修改、分发、出售、出租、反向工程、抓取、镜像或以其他方式使用平台内容。

您保留自己依法享有的内容权利，但您授予平台在提供、维护、保护和改进服务所必需范围内处理相关内容的权利。

## 8. 服务可用性与变更

平台可能因系统维护、版本升级、容量调整、安全事件、第三方故障、网络问题、政策变化、不可抗力或其他合理原因中断、限制或调整服务。我们会在合理可行范围内降低影响，但不承诺服务永久、连续、无错误或完全符合您的特定目的。

平台有权根据风控、合规、成本、上游限制或产品规划调整模型、费率、限额、套餐、充值规则、可用功能或服务入口。涉及已购买服务的重要变更，平台将尽合理努力通过网站公告、站内通知或其他方式提示。

## 9. 免责与责任限制

在法律允许的最大范围内，平台按“现状”和“可用”基础提供服务，不对服务的适销性、特定用途适用性、准确性、完整性、连续性、安全性或不侵权作出明示或默示保证。

对于因使用或无法使用服务而产生的间接、附带、特殊、惩罚性或后果性损失，包括利润损失、数据丢失、业务中断、商誉损害或第三方索赔，平台在法律允许范围内不承担责任。若平台依法需承担责任，责任总额以您在争议发生前十二个月内就相关服务实际支付的金额为上限。

## 10. 暂停与终止

若您违反本协议、适用法律、第三方服务政策或平台公示规则，或您的使用行为可能导致安全、合规、支付、滥用、声誉或服务稳定性风险，平台有权在合理范围内采取措施，包括提醒整改、限制请求、暂停 API Key、冻结账户、取消订单、终止服务或依法保存、披露相关资料。

您可停止使用服务或按平台流程申请关闭账户。账户终止后，依法或为完成结算、风控、争议处理、安全审计所需的数据可能在必要期限内保留。

## 11. 条款更新

平台可能不时更新本协议。更新后的条款会通过网站页面、站内通知或其他合理方式公布，并自公布时或通知载明的日期起生效。若您在条款更新后继续使用服务，视为您接受更新后的条款；若您不同意更新内容，应停止使用相关服务。

## 12. 适用法律与争议处理

除强制性法律另有规定外，本协议的订立、履行、解释及争议处理，适用平台运营主体所在地或服务提供地的法律。因本协议或服务产生的争议，双方应先友好协商；协商不成的，任一方可向有管辖权的法院或争议解决机构提交处理。

## 13. 联系方式

如您对本协议、账户、付款、数据处理或服务使用有疑问，请通过以下渠道联系我们：

- 官方网站：https://aitokensflux.com
- 客服邮箱：support@aitokensflux.com
- 联系地址：本服务以线上方式提供，暂无线下接待地址；如后续需要书面通知或法律文件送达，请先通过客服邮箱与我们确认有效收件方式。`

const DefaultUserAgreementEn = `# User Agreement and Terms of Service

Last updated: June 8, 2026

Welcome to AI Tokens Flux. These terms govern your access to and use of our website, API proxy, model gateway, subscription plans, pay-as-you-go top-ups, account management tools, and related services. By creating an account, signing in, purchasing a plan, topping up your balance, checking the consent box, or otherwise using the service, you confirm that you have read, understood, and agreed to these terms.

## 1. Service description

AI Tokens Flux provides a unified gateway for AI development and usage workflows, including API forwarding, model access, usage analytics, API key management, subscription plans, pay-as-you-go credits, setup guides, and customer support. We may adjust available features, model lists, billing methods, product entries, or usage limits for business, technical, safety, or compliance reasons.

Some AI models, payments, email delivery, sign-in methods, bot protection, cloud infrastructure, and network capabilities may be provided by third-party providers. We use reasonable efforts to keep the service available, but we do not guarantee that third-party services will always be available, error-free, or suitable for your expectations.

## 2. Accounts and eligibility

You must provide accurate, complete, and reachable account information and keep it updated. You are responsible for protecting your account, password, API keys, verification codes, OAuth authorizations, and other credentials. Losses caused by your failure to protect credentials are your responsibility.

You may not impersonate others, register abusive accounts in bulk, sell or rent accounts, bypass security checks, disrupt the platform, or access other users' accounts, systems, data, or services without authorization. If we reasonably believe your account creates security, abuse, payment, or compliance risk, we may request verification, restrict features, suspend service, or terminate the account.

## 3. Plans, top-ups, and payments

The platform may offer subscriptions, one-time plans, pay-as-you-go top-ups, trial credits, promotions, or other paid services. Prices, quotas, validity periods, reset rules, payment methods, and limitations are shown on the purchase page, checkout page, admin configuration, or public platform notices.

Unless required by law or expressly promised by the platform, paid plans, top-up balances, promotional credits, and trial credits are generally non-refundable, non-transferable, not redeemable for cash, and not exchangeable. If third-party payment processing, exchange rates, fees, taxes, or risk controls cause differences between displayed and paid amounts, the payment channel and order record prevail.

You are responsible for confirming that a service fits your needs before purchasing. If a plan is exhausted, expired, canceled, or restricted due to violation, API calls, proxy forwarding, or paid features may stop working.

## 4. Acceptable use

You agree to comply with applicable laws, third-party model provider policies, and platform rules. You may not use the service to conduct or assist with:

- infringement of intellectual property, privacy, trade secrets, personality rights, or other lawful rights;
- illegal, harmful, fraudulent, harassing, hateful, violent, sexual, malicious, phishing, spam, or otherwise abusive content or activity;
- unauthorized scraping, scanning, attacks, load testing, reverse engineering, rate-limit bypassing, billing bypassing, or actions that harm service stability;
- high-impact decisions without appropriate human review, including medical, legal, financial, employment, credit, insurance, public safety, or other decisions that may materially affect individual rights;
- use that violates third-party model, payment, cloud service, or open-source project rules.

You are responsible for requests, inputs, outputs, usage results, and downstream handling initiated through your account, API key, or other credentials.

## 5. AI inputs and outputs

AI-generated outputs may be inaccurate, incomplete, outdated, biased, unavailable, or unsuitable for a specific purpose. You should independently evaluate, verify, and review outputs for your use case. You should not rely on AI outputs as the sole basis for professional advice, major decisions, or matters that legally require qualified professionals.

Unless expressly stated otherwise, the platform does not claim ownership over content that you lawfully submit or lawfully receive as output. You must ensure that you have the rights or permissions necessary to submit prompts, files, code, images, data, or other content.

## 6. Data and privacy

To provide the service, complete payments, maintain security, measure usage, handle support requests, and comply with legal obligations, the platform may process account data, contact details, payment status, API usage records, usage metrics, logs, and necessary request metadata.

When using model proxying or third-party integrations, your inputs, outputs, or request data may be transmitted to upstream model, payment, bot protection, email, or cloud providers. Do not submit sensitive personal data, confidential information, trade secrets, or regulated data that you are not authorized to process unless you have completed the necessary assessment and obtained proper authorization.

We use reasonable technical and organizational measures to protect data, but no internet service is absolutely secure. To the extent permitted by law, we are not responsible for risks outside our reasonable control, including your devices, networks, credential leakage, third-party services, or force majeure events.

## 7. Intellectual property

The platform website, interface, trademarks, logos, page designs, copy, software, data structures, documentation, and related materials are owned by the platform or their respective rights holders. Without authorization, you may not copy, modify, distribute, sell, rent, reverse engineer, scrape, mirror, or otherwise use platform materials.

You retain rights you lawfully hold in your content, while granting the platform the rights necessary to provide, maintain, protect, and improve the service.

## 8. Availability and changes

The platform may interrupt, limit, or change the service due to maintenance, upgrades, capacity changes, security events, third-party failures, network issues, policy changes, force majeure, or other reasonable causes. We will try to reduce impact where practicable, but we do not promise that the service will be permanent, uninterrupted, error-free, or fit every specific purpose.

We may adjust models, rates, limits, plans, top-up rules, features, or service entry points based on risk control, compliance, cost, upstream limits, or product planning. For important changes affecting purchased services, we will use reasonable efforts to provide notice through the website, in-app notices, or other reasonable channels.

## 9. Disclaimers and limitation of liability

To the maximum extent permitted by law, the service is provided on an "as is" and "as available" basis. We make no express or implied warranties regarding merchantability, fitness for a particular purpose, accuracy, completeness, continuity, security, or non-infringement.

To the extent permitted by law, we are not liable for indirect, incidental, special, punitive, or consequential losses, including lost profits, data loss, business interruption, goodwill damage, or third-party claims arising from use or inability to use the service. If we are legally liable, our total liability is capped at the amount you paid for the relevant service during the twelve months before the dispute arose.

## 10. Suspension and termination

If you violate these terms, applicable law, third-party service policies, or platform rules, or if your use may create security, compliance, payment, abuse, reputation, or stability risks, we may take reasonable measures, including warnings, request limits, API key suspension, account freezing, order cancellation, service termination, or lawful preservation and disclosure of relevant data.

You may stop using the service or request account closure according to platform procedures. After termination, data may be retained for the period necessary for settlement, risk control, dispute handling, security audits, or legal obligations.

## 11. Updates to these terms

We may update these terms from time to time. Updated terms will be posted on the website, shown in-app, or provided through another reasonable method, and will take effect when posted or on the stated effective date. Continued use after updates means you accept the updated terms. If you do not agree, you should stop using the relevant service.

## 12. Governing law and disputes

Unless mandatory law provides otherwise, these terms and related disputes are governed by the laws of the platform operator's location or the place where the service is provided. The parties should first try to resolve disputes through good-faith negotiation. If negotiation fails, either party may submit the dispute to a court or dispute resolution body with jurisdiction.

## 13. Contact

If you have questions about these terms, your account, payments, data processing, or use of the service, please contact us through:

- Website: https://aitokensflux.com
- Support email: support@aitokensflux.com
- Address for contact: This service is provided online and currently has no offline reception address. If written notice or legal document delivery is required, please contact support first to confirm an effective receiving method.`

const DefaultUserAgreementRu = `# Пользовательское соглашение и условия обслуживания

Дата обновления: 8 июня 2026 г.

Добро пожаловать в AI Tokens Flux. Эти условия регулируют доступ к сайту, API-прокси, шлюзу моделей, тарифам, пополнениям, управлению аккаунтом и связанным сервисам. Создавая аккаунт, входя в систему, покупая тариф, пополняя баланс, отмечая согласие или используя сервис, вы подтверждаете, что прочитали, поняли и приняли эти условия.

## 1. Описание сервиса

AI Tokens Flux предоставляет единый шлюз для AI-разработки и рабочих процессов: проксирование API, доступ к моделям, статистику использования, управление ключами, тарифы, пополнение баланса, инструкции по настройке и поддержку. Мы можем менять функции, список моделей, правила оплаты, точки входа и лимиты по деловым, техническим, безопасностным или правовым причинам.

Часть возможностей, включая AI-модели, платежи, email, вход, защиту от ботов, облачную инфраструктуру и сеть, может предоставляться третьими сторонами. Мы стараемся поддерживать доступность сервиса, но не гарантируем постоянную доступность, отсутствие ошибок или полное соответствие вашим ожиданиям у сторонних сервисов.

## 2. Аккаунт и права пользователя

Вы должны указывать точные, полные и актуальные данные аккаунта. Вы отвечаете за сохранность аккаунта, пароля, API-ключей, кодов подтверждения, OAuth-доступов и других учетных данных. Потери из-за ненадлежащей защиты учетных данных несете вы.

Запрещено выдавать себя за других лиц, массово создавать злоупотребляющие аккаунты, продавать или сдавать аккаунты, обходить проверки безопасности, нарушать работу платформы или без разрешения получать доступ к чужим аккаунтам, системам, данным или сервисам. Если мы разумно считаем, что аккаунт создает риск безопасности, злоупотребления, платежный или правовой риск, мы можем запросить проверку, ограничить функции, приостановить сервис или закрыть аккаунт.

## 3. Тарифы, пополнения и платежи

Платформа может предлагать подписки, разовые тарифы, пополнения по факту использования, пробные кредиты, акции и другие платные сервисы. Цены, квоты, сроки действия, правила сброса, способы оплаты и ограничения указываются на странице покупки, оплаты, в настройках администратора или публичных уведомлениях платформы.

Если закон или отдельное обещание платформы не требуют иного, оплаченные тарифы, баланс, промокредиты и пробные кредиты обычно не возвращаются, не передаются, не обмениваются на деньги и не подлежат выводу. Если платежный провайдер, курс валют, комиссии, налоги или риск-контроль приводят к различию между показанной и фактически оплаченной суммой, приоритет имеют данные платежного канала и заказа.

Вы сами проверяете, подходит ли услуга вашим задачам до покупки. Если тариф исчерпан, истек, отменен или ограничен из-за нарушения, API-вызовы, проксирование и платные функции могут перестать работать.

## 4. Допустимое использование

Вы соглашаетесь соблюдать применимое право, правила поставщиков моделей и правила платформы. Нельзя использовать сервис для следующих действий:

- нарушения интеллектуальных прав, приватности, коммерческой тайны, личных прав или иных законных прав;
- незаконного, вредоносного, мошеннического, оскорбительного, ненавистнического, насильственного, сексуального, вредоносного программного, фишингового, спамного или иного злоупотребляющего контента или активности;
- несанкционированного скрейпинга, сканирования, атак, нагрузочного тестирования, реверс-инжиниринга, обхода лимитов, обхода оплаты или действий, вредящих стабильности сервиса;
- решений с высоким влиянием без надлежащей проверки человеком, включая медицину, право, финансы, трудоустройство, кредит, страхование, общественную безопасность и другие решения, существенно влияющие на права людей;
- использования, нарушающего правила сторонних моделей, платежных, облачных сервисов или open-source проектов.

Вы отвечаете за запросы, ввод, вывод, результаты и дальнейшую обработку, выполненные через ваш аккаунт, API-ключ или другие учетные данные.

## 5. Ввод и вывод AI

AI-вывод может быть неточным, неполным, устаревшим, предвзятым, недоступным или неподходящим для конкретной цели. Вы должны самостоятельно оценивать, проверять и анализировать вывод под свою задачу. Не следует использовать AI-вывод как единственное основание для профессиональных советов, важных решений или вопросов, которые по закону требуют квалифицированного специалиста.

Если прямо не указано иное, платформа не заявляет права собственности на контент, который вы законно отправляете или законно получаете как вывод. Вы должны иметь необходимые права или разрешения на отправку подсказок, файлов, кода, изображений, данных или другого контента.

## 6. Данные и конфиденциальность

Для предоставления сервиса, обработки платежей, безопасности, учета использования, поддержки и исполнения правовых обязанностей платформа может обрабатывать данные аккаунта, контакты, статус платежей, записи API-вызовов, метрики использования, журналы и необходимые метаданные запросов.

При проксировании моделей или использовании интеграций ваши вводы, выводы или данные запросов могут передаваться вышестоящим поставщикам моделей, платежей, защиты от ботов, email или облачных услуг. Не отправляйте чувствительные персональные данные, конфиденциальную информацию, коммерческую тайну или регулируемые данные, если у вас нет права их обрабатывать и вы не выполнили необходимую оценку.

Мы применяем разумные технические и организационные меры защиты данных, но интернет-сервис не может быть абсолютно безопасным. В пределах, разрешенных законом, мы не отвечаем за риски вне нашего разумного контроля, включая ваши устройства, сети, утечку учетных данных, сторонние сервисы или форс-мажор.

## 7. Интеллектуальная собственность

Сайт, интерфейс, товарные знаки, логотипы, дизайн страниц, тексты, программное обеспечение, структуры данных, документация и связанные материалы принадлежат платформе или соответствующим правообладателям. Без разрешения нельзя копировать, изменять, распространять, продавать, сдавать, реверс-инжинирить, скрейпить, зеркалировать или иначе использовать материалы платформы.

Вы сохраняете права на свой законный контент, одновременно предоставляя платформе права, необходимые для предоставления, поддержки, защиты и улучшения сервиса.

## 8. Доступность и изменения

Платформа может прерывать, ограничивать или менять сервис из-за обслуживания, обновлений, изменения мощности, событий безопасности, сбоев третьих сторон, сетевых проблем, изменений политики, форс-мажора или других разумных причин. Мы постараемся уменьшить влияние, когда это практически возможно, но не обещаем постоянную, непрерывную, безошибочную работу или пригодность для любой конкретной цели.

Мы можем менять модели, ставки, лимиты, тарифы, правила пополнения, функции или точки входа из-за риск-контроля, комплаенса, затрат, ограничений поставщиков или продуктовых планов. Для важных изменений, влияющих на купленные услуги, мы постараемся уведомить через сайт, уведомления в приложении или другой разумный канал.

## 9. Отказ от гарантий и ограничение ответственности

В максимальной степени, разрешенной законом, сервис предоставляется "как есть" и "по доступности". Мы не даем явных или подразумеваемых гарантий товарной пригодности, пригодности для конкретной цели, точности, полноты, непрерывности, безопасности или ненарушения прав.

В пределах, разрешенных законом, мы не отвечаем за косвенные, случайные, специальные, штрафные или последующие убытки, включая упущенную прибыль, потерю данных, перерыв бизнеса, ущерб репутации или претензии третьих лиц из-за использования или невозможности использовать сервис. Если ответственность по закону наступает, ее общий размер ограничивается суммой, которую вы фактически заплатили за соответствующий сервис за двенадцать месяцев до спора.

## 10. Приостановка и прекращение

Если вы нарушаете эти условия, закон, правила третьих сторон или правила платформы, либо ваше использование может создать риск безопасности, комплаенса, платежей, злоупотреблений, репутации или стабильности, мы можем принять разумные меры: предупреждение, лимиты запросов, приостановку API-ключа, заморозку аккаунта, отмену заказа, прекращение сервиса или законное сохранение и раскрытие данных.

Вы можете прекратить использование сервиса или запросить закрытие аккаунта по процедурам платформы. После прекращения данные могут храниться столько, сколько необходимо для расчетов, риск-контроля, споров, аудита безопасности или правовых обязанностей.

## 11. Обновление условий

Мы можем периодически обновлять эти условия. Обновленные условия будут опубликованы на сайте, показаны в приложении или переданы другим разумным способом и вступят в силу при публикации или в указанную дату. Продолжение использования после обновления означает согласие с новыми условиями. Если вы не согласны, прекратите использовать соответствующий сервис.

## 12. Применимое право и споры

Если обязательное право не требует иного, эти условия и связанные споры регулируются правом места оператора платформы или места предоставления сервиса. Стороны сначала стараются решить спор добросовестными переговорами. Если переговоры не помогут, любая сторона может обратиться в компетентный суд или орган разрешения споров.

## 13. Контакты

Если у вас есть вопросы об этих условиях, аккаунте, платежах, обработке данных или использовании сервиса, свяжитесь с нами:

- Сайт: https://aitokensflux.com
- Email поддержки: support@aitokensflux.com
- Адрес для связи: сервис предоставляется онлайн и сейчас не имеет офлайн-приемной. Если требуется письменное уведомление или доставка юридических документов, сначала свяжитесь с поддержкой для подтверждения действительного способа получения.`

var defaultLegalSettings = LegalSettings{
	UserAgreement: "",
	PrivacyPolicy: "",
}

func init() {
	config.GlobalConfig.Register("legal", &defaultLegalSettings)
}

func GetLegalSettings() *LegalSettings {
	return &defaultLegalSettings
}

func GetUserAgreementContent(languageHints ...string) string {
	if strings.TrimSpace(defaultLegalSettings.UserAgreement) != "" {
		return defaultLegalSettings.UserAgreement
	}
	return GetDefaultUserAgreementContent(languageHints...)
}

func GetDefaultUserAgreementContent(languageHints ...string) string {
	for _, hint := range languageHints {
		normalized := strings.ToLower(strings.TrimSpace(hint))
		if normalized == "" {
			continue
		}
		switch {
		case strings.HasPrefix(normalized, "ru"):
			return DefaultUserAgreementRu
		case strings.HasPrefix(normalized, "en"):
			return DefaultUserAgreementEn
		case strings.HasPrefix(normalized, "zh-tw"),
			strings.HasPrefix(normalized, "zh-hk"),
			strings.HasPrefix(normalized, "zh-hant"):
			return DefaultUserAgreementZhTW
		case strings.HasPrefix(normalized, "zh"):
			return DefaultUserAgreementZhCN
		}
	}
	return DefaultUserAgreementZhCN
}
