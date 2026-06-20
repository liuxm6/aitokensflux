import defaultRuLocale from "../../../../default/src/i18n/locales/ru.json";

const defaultRuTranslations = defaultRuLocale.translation as Record<
  string,
  string
>;

const customerRuTranslations = {
  "Model pricing": "Цены на модели",
  "Pay only for the tokens you use": "Платите только за использованные токены",
  Input: "Ввод",
  Output: "Вывод",
  "Cache read": "Чтение из кэша",
  "per request": "за запрос",
  Referrals: "Реферальные бонусы",
  "Custom period": "Пользовательский период",
  "Daily reset": "Ежедневный сброс",
  "Weekly reset": "Еженедельный сброс",
  "Monthly reset": "Ежемесячный сброс",
  "No automatic reset": "Без автоматического сброса",
  "Balance / online payment": "Баланс / онлайн-оплата",
  "Balance payment": "Оплата балансом",
  Bind: "Привязать",
  "Online payment": "Онлайн-оплата",
  "Payment needs configuration": "Требуется настройка оплаты",
  "Buy now": "Купить сейчас",
  "Admin grant": "Выдано администратором",
  "Authorize Ai Tokens Flux": "Авторизовать Ai Tokens Flux",
  "Authorize and open ATF Switch": "Авторизовать и открыть ATF Switch",
  "Authorization ready. Opening ATF Switch...":
    "Авторизация готова. Открываем ATF Switch...",
  "ATF Switch opened. Please confirm import in the desktop app.":
    "ATF Switch открыт. Подтвердите импорт в настольном приложении.",
  "Connect your browser account to the desktop app without copying an API key.":
    "Подключите аккаунт из браузера к настольному приложению без копирования API-ключа.",
  "ATF Switch authorization synced. You can return to the desktop app.":
    "Авторизация ATF Switch синхронизирована. Можно вернуться в настольное приложение.",
  "Could not reach ATF Switch. Keep the desktop app open and click Sync to ATF Switch again.":
    "Не удалось подключиться к ATF Switch. Оставьте настольное приложение открытым и нажмите синхронизацию еще раз.",
  "Confirm sign in": "Подтвердить вход",
  "Confirming sign in...": "Проверяем вход...",
  "Default model": "Модель по умолчанию",
  "Failed to open ATF Switch": "Не удалось открыть ATF Switch",
  "Failed to prepare authorization": "Не удалось подготовить авторизацию",
  "Manage API keys": "Управление API-ключами",
  "Open ATF Switch again": "Открыть ATF Switch снова",
  "Opening ATF Switch...": "Открываем ATF Switch...",
  "Please sign in first": "Сначала войдите",
  "Preparing authorization...": "Подготовка авторизации...",
  "Sign in to Ai Tokens Flux. Existing ATF Switch provider settings will not be changed.":
    "Войдите в Ai Tokens Flux. Настройки поставщика в ATF Switch не будут изменены.",
  "Signed in. Existing provider authorization was updated without importing a new provider.":
    "Вход выполнен. Авторизация существующего поставщика обновлена без импорта нового поставщика.",
  "Signed in. You can return to ATF Switch.":
    "Вход выполнен. Можно вернуться в ATF Switch.",
  "Sync to ATF Switch": "Синхронизировать с ATF Switch",
  "Synced to ATF Switch": "Синхронизировано с ATF Switch",
  "Target app": "Целевое приложение",
  "Payment failed": "Платеж не удался",
  "Payment page is ready. If it did not open automatically, use the button below to continue.":
    "Страница оплаты готова. Если она не открылась автоматически, нажмите кнопку ниже.",
  "Payment started. Please finish it on the payment page.":
    "Оплата запущена. Завершите ее на странице оплаты.",
  "Redirecting to the payment page. Please finish payment there.":
    "Переходим на страницу оплаты. Завершите оплату там.",
  "Payment page opened. Please finish it in the new window.":
    "Страница оплаты открыта. Завершите оплату в новом окне.",
  "Anthropic CLI": "Anthropic CLI",
  "bash / zsh": "bash / zsh",
  "My invites": "Мои приглашения",
  "Change password": "Изменить пароль",
  "Change email": "Изменить email",
  "Contact us": "Связаться с нами",
  "Sign in / Register": "Войти",
  "The unified AI model gateway that makes every call count.":
    "Единый шлюз AI-моделей, где каждый запрос приносит больше пользы.",
  Resources: "Ресурсы",
  Features: "Возможности",
  Docs: "Настройка",
  keys: "ключи",
  Company: "Компания",
  Terms: "Условия",
  "User Agreement and Terms of Service":
    "Пользовательское соглашение и условия обслуживания",
  Privacy: "Конфиденциальность",
  Contact: "Контакты",
  "All rights reserved.": "Все права защищены.",
  "Get started, effortlessly": "Начните без лишних шагов",
  "A stable AI coding solution": "Стабильное решение для AI-разработки",
  "Open dashboard": "Открыть панель",
  "Start now": "Начать сейчас",
  "Setup guide": "Настройка",
  "Claude Code · Codex · Windows / macOS / Linux":
    "Claude Code · Codex · Windows / macOS / Linux",
  "Follow these steps to install and configure {{tool}} on {{os}}.":
    "Следуйте этим шагам, чтобы установить и настроить {{tool}} на {{os}}.",
  "Why aitokensflux": "Почему aitokensflux",
  "Keep your workflow. Bill it smarter.":
    "Сохраните привычный процесс. Платите умнее.",
  "One-key switch": "Переключение одной командой",
  "One command reroutes your CLI traffic. Scripts untouched.":
    "Одна команда перенаправляет CLI-трафик. Скрипты остаются без изменений.",
  "Top up any amount. Zero minimum. Credits never expire.":
    "Пополняйте на любую сумму. Минимального порога нет, кредиты не сгорают.",
  "Visual usage": "Наглядное использование",
  "Heatmaps and per-request cost make spending transparent.":
    "Тепловые карты и стоимость каждого запроса делают расходы прозрачными.",
  Secure: "Безопасно",
  "Self-managed keys, instant revocation, no content retained.":
    "Ключами управляете вы: мгновенный отзыв и отсутствие хранения содержимого.",
  "Transparent pricing that scales down":
    "Прозрачные тарифы, которые дешевеют при росте использования",
  "See all plans": "Все тарифы",
  "Loading plans": "Загрузка тарифов",
  "No available plans": "Нет доступных тарифов",
  Unavailable: "Недоступно",
  "Original {{amount}}": "Изначально {{amount}}",
  "Min {{amount}}": "Мин. {{amount}}",
  "Purchase limit reached ({{current}}/{{limit}})":
    "Достигнут лимит покупок ({{current}}/{{limit}})",
  "Quota ({{unit}})": "Квота ({{unit}})",
  "Submitted quota: {{quota}}": "Отправляемая квота: {{quota}}",
  "Conversion: {{rate}}": "Конвертация: {{rate}}",
  "Plug in in 5 minutes. Start saving today.":
    "Подключитесь за 5 минут и начните экономить уже сегодня.",
  "Sign up for free trial credits, follow the guide once, and your Claude Code runs on aitokensflux.":
    "Зарегистрируйтесь, получите пробные кредиты, пройдите руководство один раз, и ваш Claude Code будет работать через aitokensflux.",
  "Read docs": "Инструкция",
  "Will aitokensflux change my existing tools?":
    "Изменит ли aitokensflux мои текущие инструменты?",
  "No. It only reroutes at the request layer. Your Claude Code, Codex and VS Code workflows stay intact.":
    "Нет. Он меняет только маршрутизацию запросов. Ваши процессы Claude Code, Codex и VS Code остаются прежними.",
  "Do credits expire?": "Сгорают ли кредиты?",
  "Pay-as-you-go credits never expire. Subscription plans reset each billing cycle.":
    "Кредиты с оплатой по факту не сгорают. В подписках лимит сбрасывается каждый расчетный период.",
  "Which models are supported?": "Какие модели поддерживаются?",
  "Equivalent APIs for frontier models including Claude Sonnet 4.6, Claude Opus 4.7 and GPT-5.5.":
    "Совместимые API для передовых моделей, включая Claude Sonnet 4.6, Claude Opus 4.7 и GPT-5.5.",
  "Is my code and data safe?": "Безопасны ли мой код и данные?",
  "Keys are self-managed and revocable anytime; the gateway retains no request content.":
    "Вы управляете ключами сами и можете отозвать их в любой момент; шлюз не хранит содержимое запросов.",
  "Current plan": "Текущий тариф",
  "Loading current plan": "Загрузка текущего тарифа",
  "Wallet balance": "Баланс кошелька",
  "Today used": "Использовано сегодня",
  "Top up now": "Пополнить сейчас",
  "Pay-as-you-go service": "Оплата по факту",
  "AI Coding pay-as-you-go service": "AI Coding с оплатой по факту",
  "From {{amount}}": "От {{amount}}",
  "Custom amount top-up": "Пополнение на произвольную сумму",
  "Top up credits anytime. Use the same instant top-up flow as the dashboard.":
    "Пополняйте баланс в любое время через тот же быстрый процесс, что и на панели.",
  "Common top-up amounts": "Популярные суммы пополнения",
  "Credits never expire and can be used anytime":
    "Кредиты не сгорают и доступны в любое время",
  "Use as much as you need without renewal":
    "Используйте сколько нужно без продления",
  "Works with Claude Code / Codex": "Работает с Claude Code / Codex",
  "Add balance alongside Pro / Max / Ultra plans":
    "Добавляйте баланс к тарифам Pro / Max / Ultra",
  "Choose amount and payment method after signing in":
    "После входа выберите сумму и способ оплаты",
  "Setup tutorials": "Инструкции по настройке",
  "Choose your setup method": "Выберите способ настройки",
  "No current plan": "Нет текущего тарифа",
  "After purchasing a plan, quota, validity, and remaining balance will appear here.":
    "После покупки тарифа здесь появятся лимит, срок действия и остаток.",
  "Buy plan": "Купить тариф",
  Rate: "Курс",
  "Plan quota": "Квота тарифа",
  "No reset": "Сброс не настроен",
  "Plan used": "Использовано по тарифу",
  "Plan remaining": "Остаток по тарифу",
  "Failed to load top-up settings": "Не удалось загрузить настройки пополнения",
  "Creating order...": "Создаем заказ...",
  "Getting payment details...": "Получаем данные оплаты...",
  "Payment link was not returned.": "Ссылка на оплату не была возвращена.",
  "Payment details received. Launching payment...":
    "Данные оплаты получены. Запускаем оплату...",
  "Top-up flow failed. Please try again.":
    "Процесс пополнения не удался. Попробуйте еще раз.",
  "Product is not configured.": "Продукт не настроен.",
  "Enter a redemption code.": "Введите код пополнения.",
  "Top up": "Пополнить",
  "Loading top-up options": "Загрузка вариантов пополнения",
  "Payment compliance has not been confirmed by admin yet.":
    "Администратор еще не подтвердил условия платежного соответствия.",
  "Top-up amount": "Сумма пополнения",
  "Estimated payment": "Ориентировочный платеж",
  "Payment method": "Способ оплаты",
  "WeChat Pay / Alipay": "WeChat Pay / Alipay",
  "No online payment method is enabled.":
    "Доступные способы онлайн-оплаты не включены.",
  "Redemption code": "Код пополнения",
  "Open external top-up link": "Открыть внешнюю ссылку пополнения",
  "Failed to load billing records": "Не удалось загрузить записи платежей",
  "PAYG top-up": "Пополнение по факту",
  "Plan subscription": "Подписка на тариф",
  "No plan subscription records": "Нет записей подписки",
  "No PAYG top-up records": "Нет записей пополнения по факту",
  "No billing records": "Нет записей платежей",
  "Billing records": "История платежей",
  "Plan subscriptions": "Подписки",
  "PAYG top-ups": "Пополнения по факту",
  "PAYG left": "Остаток PAYG",
  "Loading billing records": "Загрузка истории платежей",
  "Start date cannot be after end date":
    "Дата начала не может быть позже даты окончания",
  "Start date": "Дата начала",
  "End date": "Дата окончания",
  "Start time": "Время начала",
  "End time": "Время окончания",
  "Failed to load usage details": "Не удалось загрузить детализацию расходов",
  "Usage details": "Детализация использования",
  "Only the latest 7 days": "Доступны только последние 7 дней",
  "Loading usage details": "Загрузка детализации использования",
  "No usage details": "Нет данных использования",
  "Requests/min": "Запросов/мин",
  "Tokens/min": "Токенов/мин",
  Rows: "Строк",
  "Rows per page": "Строк на странице",
  Previous: "Предыдущая",
  Next: "Следующая",
  Search: "Поиск",
  "Total consumed": "Всего использовано",
  "All types": "Все типы",
  "Actual model: {{model}}": "Фактическая модель: {{model}}",
  "Async task refund": "Возврат за асинхронную задачу",
  Consumption: "Расход",
  Error: "Ошибка",
  Refund: "Возврат",
  "Top-up": "Пополнение",
  Other: "Другое",
  "Model name": "Название модели",
  Group: "Группа",
  Type: "Тип",
  View: "Просмотр",
  Expand: "Развернуть",
  Collapse: "Свернуть",
  Reset: "Сбросить",
  "Token name": "Название ключа",
  "Request ID": "ID запроса",
  "Upstream request ID": "ID upstream-запроса",
  Time: "Время",
  Token: "Ключ",
  Model: "Модель",
  Latency: "Задержка",
  Tokens: "Токены",
  Cost: "Стоимость",
  Details: "Детали",
  "Dynamic pricing": "Динамический расчет",
  Fee: "Списание",
  "First page": "Первая страница",
  "Last page": "Последняя страница",
  "Page {{page}} of {{total}}": "Страница {{page}} из {{total}}",
  "Group ratio": "Коэффициент группы",
  "Matched tier": "Подобранный уровень",
  "Stream · {{rate}} t/s": "Поток · {{rate}} т/с",
  "Non-stream": "Без потока",
  "Cache read {{tokens}}": "Кэш↓ {{tokens}}",
  "Cache write {{tokens}}": "Кэш↑ {{tokens}}",
  "No cache": "Без кэша",
  Tiered: "Многоуровневый",
  "Per request": "За запрос",
  Standard: "Стандарт",
  Subscription: "Подписка",
  "Subscription remaining": "Остаток подписки",
  "Subscription used": "Списано по подписке",
  "System prompt override": "Переопределение системного промпта",
  "Violation fee": "Штрафное списание",
  Wallet: "Кошелек",
  "Use the following Base URL instead of official endpoints with your API key":
    "Используйте этот Base URL вместо официальных адресов вместе с вашим API-ключом",
  Examples: "Примеры",
  Export: "Экспорт",
  "Copy Base URL": "Скопировать Base URL",
  "Create key": "Создать ключ",
  "Failed to load API keys": "Не удалось загрузить API-ключи",
  "Please enter a key name": "Введите название ключа",
  "Key name cannot exceed 50 characters":
    "Название ключа не может превышать 50 символов",
  "Please choose a valid time": "Выберите срок действия",
  "Please enter a quota limit": "Введите лимит квоты",
  "Quota limit must be 0 or greater": "Лимит квоты должен быть 0 или больше",
  "Creating key...": "Создание ключа...",
  "Failed to create key": "Не удалось создать ключ",
  "Key created": "Ключ создан",
  "Enabling key...": "Включение ключа...",
  "Disabling key...": "Отключение ключа...",
  "Failed to update key status": "Не удалось обновить статус ключа",
  "Key enabled": "Ключ включен",
  "Key disabled": "Ключ отключен",
  "Deleting key...": "Удаление ключа...",
  "Failed to delete key": "Не удалось удалить ключ",
  "Key deleted": "Ключ удален",
  "Reading key...": "Чтение ключа...",
  "Failed to read key": "Не удалось прочитать ключ",
  "Key copied": "Ключ скопирован",
  "Loading API keys": "Загрузка API-ключей",
  "No API keys yet": "API-ключей пока нет",
  "Create first key": "Создать первый ключ",
  "e.g. Production": "например, Production",
  "Valid until": "Действует до",
  "7 days": "7 дней",
  "30 days": "30 дней",
  "90 days": "90 дней",
  "Custom date": "Пользовательская дата",
  "Expiry date": "Дата истечения",
  "Unlimited quota": "Безлимитная квота",
  "With unlimited quota enabled, this key is not capped at the key level.":
    "Если включена безлимитная квота, этот ключ не ограничивается на уровне ключа.",
  "Expires: Never": "Истекает: никогда",
  "Referral reward": "Реферальное вознаграждение",
  "Invitee bonus": "Бонус приглашенного",
  "Invite reward": "Бонус за приглашение",
  Referral: "Рефералы",
  "Failed to load referral records": "Не удалось загрузить записи приглашений",
  "Invite code is not ready": "Код приглашения еще не готов",
  "Invite link copied": "Ссылка приглашения скопирована",
  "No withdrawable rewards": "Нет вознаграждений для вывода",
  "Withdrawal failed": "Вывод не удался",
  "Rewards moved to balance": "Вознаграждения переведены на баланс",
  "Referral rewards": "Реферальные вознаграждения",
  "Invite code": "Код приглашения",
  "Invite friends to sign up. Rewards are credited to referral quota.":
    "Приглашайте друзей регистрироваться. Вознаграждения начисляются в реферальную квоту.",
  "Rewards follow the gateway settings after a friend signs up with your code.":
    "Вознаграждения выдаются по настройкам шлюза после регистрации друга по вашему коду.",
  "Earn {{amount}} per referral": "Получайте {{amount}} за приглашение",
  "Credited after a friend signs up with your invite code.":
    "Начисляется после регистрации друга по вашему коду приглашения.",
  "Copy link": "Скопировать ссылку",
  "Reward statistics": "Статистика вознаграждений",
  "Withdrawable amount": "Доступно для вывода",
  "Total referrals": "Всего приглашений",
  "Total rewards": "Всего вознаграждений",
  Withdrawable: "Доступно к выводу",
  "Withdraw moves referral quota into account balance":
    "Вывод переводит реферальную квоту на баланс аккаунта",
  Moving: "Переводится",
  "Move to balance": "Перевести на баланс",
  "Invite records": "История приглашений",
  "Loading referral records": "Загрузка истории приглашений",
  "No invite records": "Нет записей приглашений",
  "Account security": "Безопасность аккаунта",
  Support: "Поддержка",
  "Create order": "Создание заказа",
  "Get payment details": "Получение данных оплаты",
  "Launch payment": "Запуск оплаты",
  Processing: "Обработка",
  "Payment needs attention": "Оплата требует внимания",
  "Preparing payment": "Подготовка оплаты",
  "Payment page ready": "Страница оплаты готова",
  "Purchase successful": "Покупка успешна",
  "Open payment page": "Открыть страницу оплаты",
  "Purchase subscription": "Купить подписку",
  "Confirm the plan and choose a payment method.":
    "Подтвердите тариф и выберите способ оплаты.",
  "Plan name": "Название тарифа",
  "Validity period": "Срок действия",
  "Reset period": "Период сброса",
  "Upgrade group": "Группа после покупки",
  "Amount due": "К оплате",
  "This plan does not allow balance payment.":
    "Этот тариф не поддерживает оплату балансом.",
  "Insufficient balance.": "Недостаточно средств.",
  "Pay with balance": "Оплатить балансом",
  Pay: "Оплатить",
  "No online payment method is available.":
    "Нет доступного способа онлайн-оплаты.",
  "Please select a payment method.": "Выберите способ оплаты.",
  "Completing purchase with balance...": "Завершаем покупку с баланса...",
  "Failed to purchase plan": "Не удалось купить тариф",
  "Plan purchased successfully.": "Тариф успешно куплен.",
  "Purchase flow failed. Please try again.":
    "Процесс покупки не удался. Попробуйте еще раз.",
  "Pay for how you use AI": "Платите за то, как используете AI",
  "Pay-as-you-go credits never expire. Subscriptions fit steady builders and teams.":
    "Кредиты с оплатой по факту не сгорают. Подписки подходят активным разработчикам и командам.",
  "CLI / VS Code / desktop app": "CLI / VS Code / приложение",
  PowerShell: "PowerShell",
  "Terminal / zsh": "Терминал / zsh",
  "Prepare an API key": "Подготовьте API-ключ",
  "Create an API key in the customer portal first. Replace every YOUR_API_KEY below with that real key.":
    "Сначала создайте API-ключ в клиентском портале. Замените каждый YOUR_API_KEY ниже на реальный ключ.",
  "Open API Keys": "Открыть API-ключи",
  "Gateway variables for Claude Code": "Переменные Claude Code",
  "Install Node.js LTS": "Установите Node.js LTS",
  "Claude Code requires Node.js. On Windows, install the LTS build with winget or the official installer.":
    "Claude Code требует Node.js. В Windows установите LTS-версию через winget или официальный установщик.",
  "Download Windows Installer": "Скачать Windows installer",
  "Install the Claude Code CLI": "Установите Claude Code CLI",
  "Open PowerShell and install Claude Code with npm.":
    "Откройте PowerShell и установите Claude Code через npm.",
  "Clean old settings and configure env vars": "Очистка и переменные",
  "If you used Claude CLI before, remove old settings first, then set the aitokensflux gateway and API key.":
    "Если вы раньше использовали Claude CLI, сначала удалите старые настройки, затем задайте шлюз aitokensflux и API-ключ.",
  Important: "Важно",
  "Replace YOUR_API_KEY with the key you created on the API Keys page.":
    "Замените YOUR_API_KEY ключом, созданным на странице API-ключей.",
  "Clean old config": "Очистить старое",
  "Temporary for current terminal": "Временно в терминале",
  "Persist to user environment": "Сохранить для пользователя",
  "Start Claude Code": "Запустить Claude Code",
  "Reopen PowerShell and run Claude Code.":
    "Переоткройте PowerShell и запустите Claude Code.",
  "After setup, all Claude Code requests appear in Usage details.":
    "После настройки все запросы Claude Code появятся в детализации использования.",
  "On macOS, install Node.js LTS with Homebrew or download the .pkg installer from Node.js.":
    "В macOS установите Node.js LTS через Homebrew или скачайте .pkg с сайта Node.js.",
  "Install Node.js LTS on Linux. Debian / Ubuntu can use NodeSource; other distributions should use their package manager.":
    "В Linux установите Node.js LTS. Debian / Ubuntu могут использовать NodeSource, для других дистрибутивов используйте их пакетный менеджер.",
  "Download macOS Installer (.pkg)": "Скачать macOS .pkg",
  "Open Node.js downloads": "Открыть загрузки Node.js",
  "Use npm to install the latest Claude Code CLI. If permissions fail, use sudo as prompted.":
    "Установите последнюю версию Claude Code CLI через npm. Если не хватает прав, используйте sudo по подсказке системы.",
  "If you used Claude CLI before, remove old settings first, then persist the gateway and key in your shell profile.":
    "Если вы раньше использовали Claude CLI, сначала удалите старые настройки, затем сохраните шлюз и ключ в профиле shell.",
  "Reload your shell profile and launch Claude Code. Seeing the prompt means setup is complete.":
    "Перезагрузите профиль shell и запустите Claude Code. Если появился prompt, настройка завершена.",
  "Codex uses OpenAI-compatible settings. Create an API key first, then replace YOUR_API_KEY with the real key.":
    "Codex использует OpenAI-совместимые настройки. Сначала создайте API-ключ, затем замените YOUR_API_KEY реальным ключом.",
  "Codex / OpenAI-compatible values": "Параметры Codex/OpenAI",
  "Install the Codex CLI": "Установите Codex CLI",
  "On Windows, use the official installer script for Codex CLI. npm install -g @openai/codex is also available.":
    "В Windows используйте официальный установочный скрипт Codex CLI. Также доступен npm install -g @openai/codex.",
  "Open Codex CLI docs": "Документация Codex CLI",
  "npm alternative": "Через npm",
  "Configure user-level Codex settings": "Настройки Codex",
  "Put the gateway in user-level config.toml. Do not put provider/base URL settings in project .codex/config.toml because Codex ignores them there.":
    "Укажите шлюз в пользовательском config.toml. Не добавляйте provider/base URL в проектный .codex/config.toml, потому что Codex игнорирует их на уровне проекта.",
  "Open user-level config.toml": "Открыть config.toml",
  "Add to config.toml": "Добавить в config.toml",
  "Temporary for current PowerShell": "Временно в PowerShell",
  "Configure VS Code / desktop app": "Настроить VS Code / приложение",
  "The Codex IDE extension shares the same user-level config as the CLI. Other OpenAI-compatible apps can use these values directly.":
    "Расширение Codex IDE использует ту же пользовательскую конфигурацию, что и CLI. Другие OpenAI-совместимые приложения могут использовать эти параметры напрямую.",
  "Verify Codex": "Проверьте Codex",
  "Reopen PowerShell and start Codex.":
    "Переоткройте PowerShell и запустите Codex.",
  "After setup, all Codex requests appear in Usage details.":
    "После настройки все запросы Codex появятся в детализации использования.",
  "Terminal / VS Code text tutorial": "Инструкция CLI / VS Code",
  "Setup and installation guide": "Установка и настройка",
  "Which tool do you want to configure?":
    "Какой инструмент вы хотите настроить?",
  "Choose operating system": "Выберите операционную систему",
  "Which operating system are you using?":
    "Какую операционную систему вы используете?",
  "On macOS, install Codex CLI with the official script, Homebrew, or npm.":
    "В macOS установите Codex CLI официальным скриптом, через Homebrew или npm.",
  "On Linux, install Codex CLI with the official script, or use npm if Node.js is already installed.":
    "В Linux установите Codex CLI официальным скриптом или используйте npm, если Node.js уже установлен.",
  "Official installer": "Официальный скрипт",
  "Alternative install": "Другой способ",
  "Put the gateway in user-level ~/.codex/config.toml and persist the API key in your shell profile.":
    "Укажите шлюз в пользовательском ~/.codex/config.toml и сохраните API-ключ в профиле shell.",
  "openai_base_url must live in user-level config. Project .codex/config.toml ignores provider/base URL settings.":
    "openai_base_url должен быть в пользовательской конфигурации. Проектный .codex/config.toml игнорирует настройки provider/base URL.",
  "Add to user-level config.toml": "Добавить в config.toml",
  "Reload your shell profile and start Codex.":
    "Перезагрузите профиль shell и запустите Codex.",
  "Unified AI gateway": "Единый AI-шлюз",
  "setup guide": "руководство по настройке",
  "Setup complete": "Настройка завершена",
  "Start using it after saving. Requests will appear in Usage details.":
    "После сохранения можно начинать работу. Запросы появятся в детализации использования.",
  "View usage": "Посмотреть использование",
  "Verification code sent. Check your inbox.":
    "Код подтверждения отправлен. Проверьте почту.",
  "Completing sign in...": "Завершаем вход...",
  "Missing OAuth callback parameters": "Отсутствуют параметры OAuth callback",
  "OAuth sign in failed": "Вход через OAuth не удался",
  "Sign-in callback": "Callback входа",
  "Back to sign in": "Вернуться ко входу",
  "Confirm reset": "Подтвердить сброс",
  "Confirm this password reset request to generate a new password for your account.":
    "Подтвердите запрос сброса пароля, чтобы создать новый пароль для аккаунта.",
  "Invalid reset link. Please request a new password reset email.":
    "Недействительная ссылка сброса. Запросите новое письмо для сброса пароля.",
  "Password copied": "Пароль скопирован",
  "Password reset successfully. Save the new password below before signing in.":
    "Пароль успешно сброшен. Сохраните новый пароль ниже перед входом.",
  "Request a new reset email": "Запросить новое письмо для сброса",
  "Reset password": "Сбросить пароль",
  "Resetting password...": "Сбрасываем пароль...",
  "Waiting for reset link...": "Ожидание ссылки сброса...",
  "User Agreement": "Пользовательское соглашение",
  "Privacy Policy": "Политика конфиденциальности",
  "Open external link": "Открыть внешнюю ссылку",
  "This customer portal page was not found.":
    "Эта страница клиентского портала не найдена.",
  "Back home": "На главную",
  "Sign out of the current account?": "Выйти из текущего аккаунта?",
  Account: "Аккаунт",
  Language: "Язык",
  Switch: "Сменить",
  "Password set": "Пароль задан",
  "API receipt": "Квитанция API",
  "API receipt request": "Запрос квитанции API",
  "Request a receipt for a specific month":
    "Запросить квитанцию за выбранный месяц",
  Apply: "Оформить",
  "Customer support": "Поддержка клиентов",
  "Send email": "Отправить email",
  "Sign in again to continue after signing out":
    "После выхода войдите снова, чтобы продолжить",

  Register: "Регистрация",
  "Email code sign in": "Вход по коду из email",
  "Account password sign in": "Вход по аккаунту и паролю",
  Email: "Электронная почта",
  "Email / username": "Email / имя пользователя",
  "Enter your email": "Введите email",
  "Enter your email or username": "Введите email или имя пользователя",
  Password: "Пароль",
  "Enter your password": "Введите пароль",
  "Email verification code": "Код подтверждения email",
  "Enter code": "Введите код",
  "No code required": "Код не требуется",
  "Invite code (optional)": "Код приглашения (необязательно)",
  "Get code": "Получить код",
  "Sign in": "Войти",
  "Sign in with email code": "Войти по коду из email",
  "Sign in with password": "Войти по паролю",
  "Sign in with Google": "Войти через Google",
  "Forgot password?": "Забыли пароль?",
  "I have read and agree to": "Я прочитал(а) и принимаю",
  and: "и",
  "Already have an account? Sign in": "Уже есть аккаунт? Войти",
  "No account? Register": "Нет аккаунта? Зарегистрироваться",
  "Not bound": "Не привязано",
  "Enter a valid email": "Введите корректный email",
  "Enter a valid email, up to 50 characters":
    "Введите корректный email до 50 символов",
  "Enter your email or username, up to 50 characters":
    "Введите email или имя пользователя до 50 символов",
  "Password must be 8-20 characters": "Пароль должен быть 8-20 символов",
  "Please agree to the legal terms first":
    "Сначала примите пользовательские условия",
  "Enter the email verification code": "Введите код подтверждения email",
  "Password login is disabled": "Вход по паролю отключен",
  "Password registration is disabled": "Регистрация по паролю отключена",
  "Complete the human verification first":
    "Сначала пройдите проверку пользователя",
  "Email verification code is not required": "Код подтверждения email не нужен",
  "This sign-in method is not available yet":
    "Этот способ входа пока недоступен",
  "Passkey is not available in this environment":
    "Passkey недоступен в этой среде",
  "Sign in with Passkey": "Войти с Passkey",
  "Continue with WeChat": "Продолжить через WeChat",
  "Continue with GitHub": "Продолжить через GitHub",
  "Continue with Discord": "Продолжить через Discord",
  "Continue with OIDC": "Продолжить через OIDC",
  "Continue with LinuxDO": "Продолжить через LinuxDO",
  "Continue with Telegram": "Продолжить через Telegram",
  "Failed to initialize OAuth": "Не удалось инициализировать OAuth",
  "Reset email sent. Check your inbox.":
    "Письмо для сброса отправлено. Проверьте почту.",
  "Enter your account email first": "Сначала введите email аккаунта",
  "Two-factor verification": "Двухфакторная проверка",
  "Enter an authenticator code or backup code to finish signing in.":
    "Введите код аутентификатора или резервный код, чтобы завершить вход.",
  "Backup code": "Резервный код",
  "Verification code": "Код подтверждения",
  "Enter 8-character backup code": "Введите 8-символьный резервный код",
  "Enter 6-digit code": "Введите 6-значный код",
  "Verify and sign in": "Подтвердить и войти",
  "Use verification code": "Использовать код подтверждения",
  "Use backup code": "Использовать резервный код",
  Username: "Имя пользователя",
  "Back to password sign in": "Вернуться ко входу по паролю",
  "WeChat sign in": "Вход через WeChat",
  "Scan the QR code, follow the account, and enter the verification code.":
    "Отсканируйте QR-код, подпишитесь на аккаунт и введите код подтверждения.",
  "Enter WeChat verification code": "Введите код подтверждения WeChat",
  "WeChat QR code is not configured": "QR-код WeChat не настроен",
  "Other sign-in options": "Другие способы входа",
  "Registered. Signing in...": "Регистрация завершена. Выполняем вход...",
  "Signed in": "Вход выполнен",

  "After verification, email sign-in uses the new address.":
    "После проверки вход по email будет использовать новый адрес.",
  "Enter your current password and set a new one.":
    "Введите текущий пароль и задайте новый.",
  "Current email": "Текущий email",
  "Current password": "Текущий пароль",
  "Enter current password": "Введите текущий пароль",
  "New password": "Новый пароль",
  "Enter new password": "Введите новый пароль",
  "Confirm new password": "Подтвердите новый пароль",
  "Enter new password again": "Введите новый пароль еще раз",
  "New email": "Новый email",
  "Enter new email address": "Введите новый email",
  "Enter verification code": "Введите код подтверждения",
  "Save changes": "Сохранить изменения",
  "New email must be different from current email":
    "Новый email должен отличаться от текущего",
  "Loading site security settings. Try again shortly.":
    "Загрузка настроек безопасности сайта. Повторите чуть позже.",
  "Enter your current password": "Введите текущий пароль",
  "New password must be different": "Новый пароль должен отличаться",
  "Passwords do not match": "Пароли не совпадают",
  "Password changed": "Пароль изменен",
  "Email changed": "Email изменен",
  "Account: {{account}}\nBilling month:\nNotes:":
    "Аккаунт: {{account}}\nРасчетный месяц:\nПримечания:",
  "Account: {{account}}\nIssue:": "Аккаунт: {{account}}\nОписание вопроса:",
  "Expired: {{date}}": "Истек: {{date}}",
  "Expires: {{date}}": "Истекает: {{date}}",
  Method: "Способ",
  "Minimum top-up amount is {{amount}}":
    "Минимальная сумма пополнения: {{amount}}",
  "Minimum withdrawal is {{amount}}": "Минимальный вывод: {{amount}}",
  "Name / Trade No.": "Название / номер заказа",
  Paid: "Оплачено",
  "Persist to {{target}}": "Сохранить в {{target}}",
  Record: "Запись",
  "Redeemed {{amount}} successfully.": "Зачислено {{amount}}.",
  "Replace {{key}} with the key you created on the API Keys page.":
    "Замените {{key}} ключом, созданным на странице API-ключей.",
  "Replace {{key}} with the key you created on the API Keys page. Reopen PowerShell after persisting it.":
    "Замените {{key}} ключом, созданным на странице API-ключей. После сохранения переоткройте PowerShell.",
  "{{start}}-{{end}} of {{total}}": "{{start}}-{{end}} из {{total}}",
  "{{title}} is not configured": "{{title}} не настроено",
  Copy: "Копировать",
  "Copy key": "Скопировать ключ",
  "CNY and USD are settled 1:1.": "CNY и USD рассчитываются 1:1.",
  "Customer navigation": "Навигация клиента",
  "Enter a quota limit for this key.": "Введите лимит квоты для этого ключа.",
  "Close navigation": "Закрыть навигацию",
  "Network request failed. Please check the backend service.":
    "Сетевой запрос не удался. Проверьте серверную службу.",
  "Open navigation": "Открыть навигацию",
  "Primary navigation": "Основная навигация",
  "Request failed": "Запрос не выполнен",
  "Request timed out. Please try again.":
    "Время ожидания запроса истекло. Повторите попытку.",
  "Received amount": "Сумма зачисления",
  "Failed to load models": "Не удалось загрузить модели",
  "Loading models...": "Загрузка моделей...",
  "Opening CC Switch...": "Открываем CC Switch...",
  "Chinese support for top-ups, setup, and account issues":
    "Поддержка на китайском по пополнениям, настройке и аккаунтам",
  "Choose the support channel that works for you.":
    "Выберите удобный канал поддержки.",
  "Community discussion and usage experience":
    "Обсуждения сообщества и опыт использования",
  "Email support for accounts, orders, and security":
    "Поддержка по email для аккаунтов, заказов и безопасности",
  Gmail: "Gmail",
  "mr.liuxm6@gmail.com": "mr.liuxm6@gmail.com",
  "Product updates and public announcements":
    "Новости продукта и публичные объявления",
  "QQ group: 826073513": "Группа QQ: 826073513",
  "QQ support group": "Группа поддержки QQ",
  "Real-time notices and international support":
    "Оперативные уведомления и международная поддержка",
  "Support & community": "Поддержка и сообщество",
  "Support groups are best for real-time help. Email is best for account, order, and security issues.":
    "Группы поддержки подходят для быстрой помощи. Email лучше использовать для вопросов аккаунта, заказов и безопасности.",
  "Telegram support group": "Группа поддержки Telegram",
  X: "X",
} satisfies Record<string, string>;

export const ruTranslations: Record<string, string> = {
  ...defaultRuTranslations,
  ...customerRuTranslations,
};

type RuPattern = {
  pattern: RegExp;
  replace: (...matches: string[]) => string;
};

function pluralRu(value: string, one: string, few: string, many: string) {
  const numeric = Math.abs(Number.parseInt(value, 10));
  if (!Number.isFinite(numeric)) return many;
  const mod10 = numeric % 10;
  const mod100 = numeric % 100;
  if (mod10 === 1 && mod100 !== 11) return one;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return few;
  return many;
}

const ruPatterns: RuPattern[] = [
  {
    pattern: /^(\d+) days?$/,
    replace: (value) => `${value} ${pluralRu(value, "день", "дня", "дней")}`,
  },
  {
    pattern: /^(\d+) hours?$/,
    replace: (value) => `${value} ${pluralRu(value, "час", "часа", "часов")}`,
  },
  {
    pattern: /^(\d+) minutes?$/,
    replace: (value) =>
      `${value} ${pluralRu(value, "минута", "минуты", "минут")}`,
  },
  {
    pattern: /^(\d+) seconds?$/,
    replace: (value) =>
      `${value} ${pluralRu(value, "секунда", "секунды", "секунд")}`,
  },
  {
    pattern: /^(\d+) years?$/,
    replace: (value) => `${value} ${pluralRu(value, "год", "года", "лет")}`,
  },
  {
    pattern: /^(\d+) months?$/,
    replace: (value) =>
      `${value} ${pluralRu(value, "месяц", "месяца", "месяцев")}`,
  },
  {
    pattern: /^Quota (.+)$/,
    replace: (value) => `Квота ${translateRu(value)}`,
  },
  {
    pattern: /^Period (.+)$/,
    replace: (value) => `Период ${translateRu(value)}`,
  },
  {
    pattern: /^Includes (.+)$/,
    replace: (value) => `Включает ${translateRu(value)}`,
  },
  {
    pattern: /^Resets every (.+)$/,
    replace: (value) => `Сброс каждые ${translateRu(value)}`,
  },
  {
    pattern: /^Original (.+)$/,
    replace: (value) => `Изначально ${value}`,
  },
  {
    pattern: /^Min (.+)$/,
    replace: (value) => `Мин. ${value}`,
  },
  {
    pattern: /^Minimum top-up amount is (.+)$/,
    replace: (value) => `Минимальная сумма пополнения: ${value}`,
  },
  {
    pattern: /^Redeemed (.+) successfully\.$/,
    replace: (value) => `Код успешно применен: ${value}`,
  },
  {
    pattern: /^(\d+)-(\d+) of (\d+)$/,
    replace: (from, to, total) => `${from}-${to} из ${total}`,
  },
  {
    pattern: /^Quota \((.+)\)$/,
    replace: (unit) => `Квота (${unit})`,
  },
  {
    pattern: /^Submitted quota: (.+)$/,
    replace: (value) => `Отправляемая квота: ${value}`,
  },
  {
    pattern: /^Conversion: (.+)$/,
    replace: (value) => `Конвертация: ${value}`,
  },
  {
    pattern: /^Expired: (.+)$/,
    replace: (value) => `Истек: ${value}`,
  },
  {
    pattern: /^Expires: (.+)$/,
    replace: (value) => `Истекает: ${translateRu(value)}`,
  },
  {
    pattern: /^Minimum withdrawal is (.+)$/,
    replace: (value) => `Минимальный вывод: ${value}`,
  },
  {
    pattern: /^Purchase limit reached \((.+)\/(.+)\)$/,
    replace: (current, limit) =>
      `Достигнут лимит покупок (${current}/${limit})`,
  },
  {
    pattern: /^(\d+)-(\d+) of (\d+)$/,
    replace: (start, end, total) => `${start}-${end} из ${total}`,
  },
  {
    pattern: /^Account: (.+)\nBilling month:\nNotes:$/,
    replace: (account) => `Аккаунт: ${account}\nРасчетный месяц:\nПримечания:`,
  },
  {
    pattern: /^Account: (.+)\nIssue:$/,
    replace: (account) => `Аккаунт: ${account}\nОписание вопроса:`,
  },
  {
    pattern: /^Follow these steps to install and configure (.+) on (.+)\.$/,
    replace: (tool, os) =>
      `Следуйте этим шагам, чтобы установить и настроить ${tool} на ${os}.`,
  },
  {
    pattern: /^Replace (.+) with the key you created on the API Keys page\.$/,
    replace: (value) =>
      `Замените ${value} ключом, созданным на странице API-ключей.`,
  },
  {
    pattern:
      /^Replace (.+) with the key you created on the API Keys page\. Reopen PowerShell after persisting it\.$/,
    replace: (value) =>
      `Замените ${value} ключом, созданным на странице API-ключей. После сохранения переоткройте PowerShell.`,
  },
  {
    pattern: /^Persist to (.+)$/,
    replace: (target) => `Сохранить в ${target}`,
  },
  {
    pattern: /^Disable API key "(.+)"\? Requests using this key will fail\.$/,
    replace: (name) =>
      `Отключить API-ключ "${name}"? Запросы с этим ключом будут завершаться ошибкой.`,
  },
  {
    pattern: /^Delete API key "(.+)"\? This cannot be undone\.$/,
    replace: (name) =>
      `Удалить API-ключ "${name}"? Это действие нельзя отменить.`,
  },
  {
    pattern: /^Continue with (.+)$/,
    replace: (name) => `Продолжить через ${name}`,
  },
];

function translateRuPattern(value: string) {
  for (const { pattern, replace } of ruPatterns) {
    const match = value.match(pattern);
    if (match) return replace(...match.slice(1));
  }
  return undefined;
}

export function translateRu(value: string) {
  return ruTranslations[value] ?? translateRuPattern(value) ?? value;
}
