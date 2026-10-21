import {
  AnimatedOrbitLogo, Checkbox, CodeField, HorizontalDivider, OrbitBottomSheet, OrbitButton, OrbitCard, OrbitFilterChip, OrbitIconButton,
  OrbitLinearProgressIndicator, OrbitNavigationBar, OrbitOutlineTextField, OrbitScaffold, OrbitSnackbar, OrbitTopAppBar,
} from './components.js';

const AUTH = 'feature/auth/src/commonMain/kotlin/br/com/weslleycampos/orbit/feature/auth';
const LEGAL_FILES = {
  terms: ['assets/feature-auth/files/legal/terms.md', 'assets/feature-auth/files/legal/pt/terms.md'],
  privacy: ['assets/feature-auth/files/legal/privacy.md', 'assets/feature-auth/files/legal/pt/privacy.md'],
};

export const assets = Object.values(LEGAL_FILES).flat();

const viewport = { width: 392, height: 846 };
const frame = (id, name, extra, render) => ({ id: `screens/${id}`, name, group: 'Screens', viewport, ...extra, render });

const gap = (ctx, key, token) => ctx.node({ key, styles: ['Screen/gap'], bind: { height: { token } } });
export const text = (ctx, key, style, content, extra = {}) => ctx.node({ key, styles: [style], ...content, ...extra });
const icon = (ctx, key, name, size, color, styles = []) => ctx.node({
  key,
  styles: [`Icon/${name}`, ...styles],
  bind: { width: { token: `sizes.${size}` }, height: { token: `sizes.${size}` }, color: { token: color } },
});
const field = (ctx, key, labelKey, options) => [
  text(ctx, `${key}/eyebrow`, 'Screen/eyebrow', { textKey: labelKey }),
  gap(ctx, `${key}/gap`, 'spacing.xxxSmall'),
  OrbitOutlineTextField(ctx, { key, ...options }),
];
const label = (ctx, key, content, style = 'Screen/label') => text(ctx, key, style, content);

const sentence = (ctx, key, templateKey, links, linkStyle) => ctx.t(templateKey).split(/%\d\$s/).flatMap((part, i) => [
  ctx.node({ key: `${key}/text-${i}`, tag: 'span', text: part }),
  links[i] && ctx.node({ key: links[i][0], tag: 'span', styles: [linkStyle], textKey: links[i][1], hotspot: true }),
]);

const backButton = (ctx, glyph) => OrbitIconButton(ctx, {
  key: 'back', hotspot: true, contentDescription: ctx.t('legal_navigate_back'),
}, [glyph ?? icon(ctx, 'back/icon', 'chevron_left', 'large', 'colors.text.primary')]);
const heading = (ctx, titleKey, subtitleKey, badge, under) => [
  ...(badge ? [badge, gap(ctx, 'gap-badge', 'spacing.medium')] : []),
  text(ctx, 'title', 'SignIn/title', typeof titleKey === 'string' ? { textKey: titleKey } : titleKey),
  gap(ctx, 'gap-title', 'spacing.small'),
  text(ctx, 'subtitle', 'SignIn/subtitle', typeof subtitleKey === 'string' ? { textKey: subtitleKey } : subtitleKey),
  ...(under ? [gap(ctx, 'gap-under', 'spacing.xxxSmall'), under] : []),
  gap(ctx, 'gap-subtitle', 'spacing.small'),
];
const header = (ctx, ...rest) => [
  ctx.node({ key: 'toolbar', styles: ['Screen/toolbar'], children: [backButton(ctx)] }),
  gap(ctx, 'gap-toolbar', 'spacing.xxSmall'),
  ...heading(ctx, ...rest),
];
const content = (ctx, children) => ctx.node({ key: 'content', styles: ['Screen/content'], children });
const primary = (ctx, key, textKey, children = []) => OrbitButton(ctx, {
  key, hotspot: true, styles: ['Screen/fill'],
}, [...children, label(ctx, `${key}/label`, { textKey })]);
const textButton = (ctx, key, textKey, styles = ['Screen/fill']) => OrbitButton(ctx, {
  key, variant: 'Text', hotspot: true, styles,
}, [label(ctx, `${key}/label`, { textKey }, 'Screen/textButton')]);
const actions = (ctx, children) => ctx.node({ key: 'actions', styles: ['Screen/actions'], children });
const screenFrame = (ctx, children) => OrbitScaffold(ctx, { key: 'scaffold' }, children);

const splash = frame('splash', 'Splash', { source: `${AUTH}/splash/SplashScreen.kt`, status: 'implemented' }, (ctx) => screenFrame(ctx, [
  ctx.node({
    key: 'center',
    styles: ['Splash/center'],
    children: [
      AnimatedOrbitLogo(ctx, { key: 'logo', styles: ['Splash/logo'] }),
      text(ctx, 'name', 'Splash/name', { text: 'Orbit' }),
    ],
  }),
]));

const signIn = frame('sign-in', 'Sign in', { source: `${AUTH}/signin/SignInScreen.kt`, status: 'implemented' }, (ctx) => screenFrame(ctx, [
  ctx.node({
    key: 'content',
    styles: ['SignIn/content'],
    children: [
      gap(ctx, 'gap-top', 'spacing.xxLarge'),
      text(ctx, 'title', 'SignIn/title', { textKey: 'sign_in_title' }),
      gap(ctx, 'gap-subtitle', 'spacing.small'),
      text(ctx, 'subtitle', 'SignIn/subtitle', { textKey: 'sign_in_subtitle' }),
      gap(ctx, 'gap-email', 'spacing.small'),
      ...field(ctx, 'email', 'sign_in_email_label', { placeholderKey: 'sign_in_email_placeholder' }),
      gap(ctx, 'gap-password', 'spacing.small'),
      ...field(ctx, 'password', 'sign_in_password_label', {
        placeholderKey: 'sign_in_password_placeholder',
        password: true,
        trailingIcon: OrbitIconButton(ctx, {
          key: 'show-password', contentDescription: ctx.t('password_show'),
        }, [icon(ctx, 'show-password/icon', 'eye', 'medium', 'colors.text.secondary')]),
      }),
      gap(ctx, 'gap-remember', 'spacing.xxSmall'),
      ctx.node({
        key: 'remember-row',
        styles: ['Screen/row'],
        children: [
          ctx.node({
            key: 'remember-toggle',
            styles: ['Screen/toggleRow'],
            children: [
              Checkbox(ctx, { key: 'remember', checked: false }),
              text(ctx, 'remember-label', 'SignIn/remember', { textKey: 'sign_in_remember_me' }),
            ],
          }),
          ctx.node({ key: 'remember-spacer', styles: ['Screen/grow'] }),
          OrbitButton(ctx, {
            key: 'forgot-password', variant: 'Text', hotspot: true, inactive: 'onClick = { /*TODO*/ }: tapping does nothing yet',
          }, [text(ctx, 'forgot-password/label', 'SignIn/forgot', { textKey: 'sign_in_forgot_password' })]),
        ],
      }),
      ctx.node({ key: 'spacer', styles: ['Screen/grow'] }),
      OrbitButton(ctx, {
        key: 'sign-in', enabled: false, hotspot: true, styles: ['Screen/fill'],
      }, [label(ctx, 'sign-in/label', { textKey: 'sign_in_title' })]),
      ctx.node({
        key: 'or-row',
        styles: ['SignIn/orRow'],
        children: [
          HorizontalDivider(ctx, { key: 'or-left', styles: ['SignIn/orDivider'] }),
          text(ctx, 'or-label', 'SignIn/orText', { textKey: 'sign_in_or' }),
          HorizontalDivider(ctx, { key: 'or-right', styles: ['SignIn/orDivider'] }),
        ],
      }),
      OrbitButton(ctx, { key: 'google', variant: 'Outlined', hotspot: true, styles: ['Screen/fill'] }, [
        ctx.node({ key: 'google/icon', styles: ['SignIn/googleIcon'] }),
        text(ctx, 'google/label', 'SignIn/googleLabel', { textKey: 'sign_in_google' }),
      ]),
      ctx.node({
        key: 'no-account-row',
        styles: ['SignIn/noAccountRow'],
        children: [
          text(ctx, 'no-account', 'SignIn/noAccount', { textKey: 'sign_in_no_account' }),
          text(ctx, 'create-account', 'SignIn/createAccount', { textKey: 'sign_in_create_account' }, {
            hotspot: true,
          }),
        ],
      }),
      ctx.node({
        key: 'legal',
        styles: ['SignIn/legal'],
        children: sentence(ctx, 'legal', 'sign_in_legal', [['terms', 'sign_in_terms'], ['privacy', 'sign_in_privacy_policy']], 'SignIn/legalLink'),
      }),
      gap(ctx, 'gap-bottom', 'spacing.large'),
    ],
  }),
]));

const INLINE_MARKDOWN = /\*\*(.+?)\*\*|\[(.+?)\]\((.+?)\)/g;

function inline(ctx, key, line) {
  const spans = [];
  let cursor = 0;
  const span = (value, style) => value && spans.push(ctx.node({ key: `${key}/${spans.length}`, tag: 'span', styles: style ? [style] : [], text: value }));
  for (const match of line.matchAll(INLINE_MARKDOWN)) {
    span(line.slice(cursor, match.index));
    span(match[1] ?? match[2], match[1] ? 'Legal/bold' : 'Legal/link');
    cursor = match.index + match[0].length;
  }
  span(line.slice(cursor));
  return spans;
}

function markdownLine(ctx, key, line) {
  if (line.startsWith('## ')) return ctx.node({ key, styles: ['Legal/h2'], children: inline(ctx, key, line.slice(3)) });
  if (line.startsWith('# ')) return ctx.node({ key, styles: ['Legal/h1'], children: inline(ctx, key, line.slice(2)) });
  if (line.startsWith('- ')) {
    return ctx.node({
      key,
      styles: ['Legal/bullet'],
      children: [
        text(ctx, `${key}/dot`, 'Legal/body', { text: '•' }),
        ctx.node({ key: `${key}/text`, styles: ['Legal/body'], children: inline(ctx, `${key}/text`, line.slice(2)) }),
      ],
    });
  }
  return ctx.node({ key, styles: ['Legal/body'], children: inline(ctx, key, line) });
}

const legal = (id, name, document, titleKey) => frame(`legal-${id}`, name, { source: `${AUTH}/legal/LegalScreen.kt`, status: 'implemented' }, (ctx) => {
  const [en, pt] = LEGAL_FILES[document];
  const lines = ctx.asset(ctx.settings.language === 'pt' ? pt : en).split('\n').filter((line) => line.trim());
  return screenFrame(ctx, [
    OrbitTopAppBar(ctx, {
      key: 'bar',
      titleKey,
      navigationIcon: backButton(ctx, text(ctx, 'back/glyph', 'Legal/backGlyph', { text: '‹' })),
    }),
    ctx.node({ key: 'list', styles: ['Legal/list'], children: lines.map((line, i) => markdownLine(ctx, `line-${i}`, line)) }),
  ]);
});

const createAccount = frame('create-account', 'Create account', { source: `${AUTH}/signup/SignUpScreen.kt`, status: 'implemented' }, (ctx) => screenFrame(ctx, [
  content(ctx, [
    ...header(ctx, 'sign_in_create_account', 'create_account_subtitle'),
    ...field(ctx, 'name', 'create_account_name_label', { value: 'Ana Souza' }),
    gap(ctx, 'gap-name', 'spacing.small'),
    ...field(ctx, 'email', 'sign_in_email_label', { value: 'ana@example.com' }),
    gap(ctx, 'gap-email', 'spacing.small'),
    ...field(ctx, 'password', 'sign_in_password_label', {
      value: 'Orbit123',
      password: true,
      supportingTextKey: 'create_account_password_hint',
      trailingIcon: OrbitIconButton(ctx, {
        key: 'show-password', contentDescription: ctx.t('password_show'),
      }, [icon(ctx, 'show-password/icon', 'eye', 'medium', 'colors.text.secondary')]),
    }),
    gap(ctx, 'gap-password', 'spacing.xxSmall'),
    ctx.node({
      key: 'consent-row',
      styles: ['Screen/toggleRow'],
      children: [
        Checkbox(ctx, { key: 'consent', checked: true }),
        ctx.node({
          key: 'consent-text',
          styles: ['Screen/consent'],
          children: sentence(ctx, 'consent-text', 'create_account_consent', [['terms', 'create_account_terms_link'], ['privacy', 'sign_in_privacy_policy']], 'Screen/link'),
        }),
      ],
    }),
    ctx.node({ key: 'spacer', styles: ['Screen/grow'] }),
    primary(ctx, 'submit', 'sign_in_create_account'),
    ctx.node({
      key: 'footer',
      styles: ['Screen/footer'],
      children: [
        text(ctx, 'footer/prompt', 'Screen/guidance', { textKey: 'create_account_have_account' }),
        ctx.node({ key: 'sign-in', styles: ['Screen/guidance', 'Screen/link'], textKey: 'sign_in_title', hotspot: true }),
      ],
    }),
  ]),
]));

const forgotPassword = frame('forgot-password', 'Forgot password', { status: 'proposed', spec: 'docs/specs/forgot-password.md' }, (ctx) => screenFrame(ctx, [
  content(ctx, [
    ...header(ctx, 'forgot_password_title', 'forgot_password_guidance'),
    ...field(ctx, 'email', 'sign_in_email_label', { value: 'ana@example.com' }),
    ctx.node({ key: 'spacer', styles: ['Screen/grow'] }),
    actions(ctx, [
      primary(ctx, 'send', 'forgot_password_send'),
      textButton(ctx, 'back-to-sign-in', 'forgot_password_back_to_sign_in'),
    ]),
  ]),
]));

const emailSent = frame('email-sent', 'Email sent', { status: 'proposed', spec: 'docs/specs/forgot-password.md' }, (ctx) => screenFrame(ctx, [
  content(ctx, [
    ...header(ctx, 'email_sent_title', 'email_sent_guidance', ctx.node({
      key: 'badge', styles: ['EmailSent/badge'], children: [icon(ctx, 'badge/icon', 'mail_check', 'xLarge', 'colors.text.brand')],
    })),
    OrbitCard(ctx, { key: 'email-card', variant: 'Base' }, [
      ctx.node({
        key: 'email-part',
        styles: ['EmailSent/part'],
        children: [
          ctx.node({
            key: 'email-info',
            styles: ['EmailSent/info'],
            children: [
              text(ctx, 'email-eyebrow', 'Screen/eyebrow', { textKey: 'email_sent_email_eyebrow' }),
              gap(ctx, 'email-gap', 'spacing.xxxSmall'),
              text(ctx, 'email', 'SignIn/subtitle', { text: 'ana@example.com' }),
            ],
          }),
          ctx.node({ key: 'change-email', styles: ['Screen/guidance', 'Screen/link', 'EmailSent/change'], textKey: 'email_sent_change', hotspot: true }),
        ],
      }),
      HorizontalDivider(ctx, { key: 'divider' }),
      ctx.node({
        key: 'tip-row',
        styles: ['Screen/noteRow'],
        children: [
          icon(ctx, 'tip/icon', 'clock', 'medium', 'colors.text.tertiary'),
          text(ctx, 'tip/text', 'Screen/secondary', { textKey: 'email_sent_tip' }),
        ],
      }),
    ]),
    ctx.node({ key: 'spacer', styles: ['Screen/grow'] }),
    actions(ctx, [
      primary(ctx, 'back-to-sign-in', 'forgot_password_back_to_sign_in'),
      OrbitButton(ctx, { key: 'resend', variant: 'Outlined', hotspot: true, styles: ['Screen/fill'] }, [
        label(ctx, 'resend/label', { textKey: 'email_sent_resend' }),
      ]),
    ]),
  ]),
]));

const emailValidation = frame('email-validation', 'Email validation', {
  source: `${AUTH}/verification/EmailVerificationScreen.kt`, spec: 'docs/specs/email-verification.md', status: 'implemented',
}, (ctx) => screenFrame(ctx, [
  content(ctx, [
    ...header(ctx, 'email_validation_title', 'email_validation_guidance', null, text(ctx, 'email', 'Validation/email', { text: 'ana@example.com' })),
    ctx.node({
      key: 'code',
      styles: ['Validation/codeRow'],
      children: [...'482917'].map((digit, i) => text(ctx, `code-${i}`, 'Validation/cell', { text: digit })),
    }),
    ctx.node({
      key: 'resend-row',
      styles: ['Validation/resendRow'],
      children: [
        text(ctx, 'timer', 'Validation/timer', { textKey: 'email_validation_resend_in', textArgs: ['0:24'] }),
        OrbitButton(ctx, { key: 'resend', variant: 'Text', enabled: false, hotspot: true }, [
          label(ctx, 'resend/label', { textKey: 'email_validation_resend' }),
        ]),
      ],
    }),
    gap(ctx, 'gap-resend', 'spacing.small'),
    OrbitCard(ctx, { key: 'note', variant: 'Base' }, [
      ctx.node({
        key: 'note/row',
        styles: ['Screen/noteRow'],
        children: [
          icon(ctx, 'note/icon', 'mail', 'medium', 'colors.text.brand'),
          text(ctx, 'note/text', 'Screen/secondary', { textKey: 'email_validation_note' }),
        ],
      }),
    ]),
    ctx.node({ key: 'spacer', styles: ['Screen/grow'] }),
    primary(ctx, 'confirm', 'email_validation_confirm'),
  ]),
]));

const joinFamily = frame('join-family', 'Join family', { status: 'proposed' }, (ctx) => screenFrame(ctx, [
  content(ctx, [
    gap(ctx, 'gap-top', 'spacing.xxLarge'),
    ...heading(ctx, 'join_family_title', 'join_family_guidance', ctx.node({
      key: 'badge', styles: ['EmailSent/badge'], children: [icon(ctx, 'badge/icon', 'users', 'xLarge', 'colors.text.brand')],
    })),
    CodeField(ctx, {
      key: 'code', labelKey: 'invite_code_eyebrow', value: 'ORB-4K', placeholder: 'ORB-0000-00', focused: true, supportingTextKey: 'join_family_code_hint',
    }),
    ctx.node({ key: 'spacer', styles: ['Screen/grow'] }),
    actions(ctx, [
      primary(ctx, 'join', 'join_family_join'),
      textButton(ctx, 'cancel', 'join_family_cancel'),
    ]),
  ]),
]));

const member = (ctx, key, initial, name, detail, trailing) => ctx.node({
  key,
  styles: ['Family/row'],
  children: [
    text(ctx, `${key}/avatar`, 'Family/avatar', { text: initial }),
    ctx.node({
      key: `${key}/info`,
      styles: ['Family/info'],
      children: [text(ctx, `${key}/name`, 'Family/name', { text: name }), detail],
    }),
    trailing,
  ],
});

const familyMembers = frame('family-members', 'Family members', { status: 'proposed' }, (ctx) => screenFrame(ctx, [
  content(ctx, [
    ...header(ctx, 'family_members_title', 'family_members_guidance'),
    text(ctx, 'eyebrow', 'Screen/eyebrow', { textKey: 'family_members_eyebrow' }),
    gap(ctx, 'gap-eyebrow', 'spacing.xxSmall'),
    OrbitCard(ctx, { key: 'members', variant: 'Base' }, [
      member(
        ctx, 'you', 'A', 'Ana Souza',
        text(ctx, 'you/email', 'Family/email', { text: 'ana@example.com' }),
        text(ctx, 'you/pill', 'Family/youPill', { textKey: 'family_members_you' }),
      ),
      HorizontalDivider(ctx, { key: 'divider-1' }),
      member(
        ctx, 'invited', 'M', 'Marina Souza',
        ctx.node({
          key: 'invited/pending',
          styles: ['Family/pending'],
          children: [
            icon(ctx, 'invited/clock', 'clock', 'xSmall', 'colors.text.tertiary'),
            ctx.node({ key: 'invited/pending-text', tag: 'span', textKey: 'family_members_invite_pending' }),
          ],
        }),
        OrbitIconButton(ctx, { key: 'remove-member', hotspot: true, contentDescription: ctx.t('family_members_remove') }, [
          icon(ctx, 'remove-member/icon', 'x', 'medium', 'colors.text.tertiary'),
        ]),
      ),
      HorizontalDivider(ctx, { key: 'divider-2' }),
      ctx.node({
        key: 'add-row',
        styles: ['Family/row'],
        children: [
          ctx.node({ key: 'add-ring', styles: ['Family/addRing'], children: [icon(ctx, 'add-ring/icon', 'plus', 'small', 'colors.text.tertiary')] }),
          text(ctx, 'add-placeholder', 'Family/addPlaceholder', { textKey: 'family_members_add_placeholder' }),
          textButton(ctx, 'add-member', 'family_members_add', []),
        ],
      }),
    ]),
    gap(ctx, 'gap-card', 'spacing.small'),
    ctx.node({
      key: 'note',
      styles: ['Family/note'],
      children: [
        icon(ctx, 'note/icon', 'users', 'medium', 'colors.text.tertiary'),
        ctx.node({ key: 'note/text', textKey: 'family_members_note' }),
      ],
    }),
    ctx.node({ key: 'spacer', styles: ['Screen/grow'] }),
    actions(ctx, [
      primary(ctx, 'continue', 'family_members_continue'),
      textButton(ctx, 'add-later', 'family_members_add_later'),
    ]),
  ]),
]));

const invite = frame('invite', 'Invite', { status: 'proposed' }, (ctx) => screenFrame(ctx, [
  content(ctx, [
    ...header(ctx, 'invite_title', 'invite_guidance'),
    CodeField(ctx, { key: 'code-card', labelKey: 'invite_code_eyebrow', value: 'ORB-4K9P-27', readOnly: true, supportingTextKey: 'invite_validity' }),
    ctx.node({ key: 'spacer', styles: ['Screen/grow'] }),
    actions(ctx, [
      primary(ctx, 'copy-code', 'invite_copy', [icon(ctx, 'copy-code/icon', 'copy', 'medium', 'colors.text.onBrand', ['Screen/leadingIcon'])]),
      OrbitButton(ctx, { key: 'share', variant: 'Outlined', hotspot: true, styles: ['Screen/fill'] }, [
        icon(ctx, 'share/icon', 'share', 'medium', 'colors.text.primary', ['Screen/leadingIcon']),
        label(ctx, 'share/label', { textKey: 'invite_share' }),
      ]),
      textButton(ctx, 'invite-later', 'invite_later'),
    ]),
  ]),
]));

const status = (ctx, key, glyph, color, textKey, textArgs) => ctx.node({
  key,
  styles: ['Family/pending'],
  bind: { color: { token: color } },
  children: [
    icon(ctx, `${key}/icon`, glyph, 'xSmall', color),
    ctx.node({ key: `${key}/text`, tag: 'span', textKey, textArgs }),
  ],
});
const row = (ctx, key, logo, name, detail, trailing, hotspot = true) => ctx.node({
  key,
  styles: ['Family/row'],
  hotspot,
  attrs: hotspot ? { role: 'button', tabindex: 0 } : {},
  children: [
    logo,
    ctx.node({
      key: `${key}/info`,
      styles: ['Family/info'],
      children: [text(ctx, `${key}/name`, 'Family/name', { text: name }), detail],
    }),
    trailing,
  ],
});
const chevron = (ctx, key) => icon(ctx, `${key}/chevron`, 'chevron_right', 'medium', 'colors.text.tertiary');
const pluggyLogo = (ctx) => ctx.node({
  key: 'pluggy/logo', styles: ['Family/avatar'], children: [icon(ctx, 'pluggy/logo-icon', 'plug', 'medium', 'colors.text.brand')],
});
// Orbit's bank logos (orbit-api images/banks, the bg_ variant GET /connectors sends as logo.background),
// copied for a sample of banks into assets/proposed/banks. Names are the catalog's.
const BANKS = {
  'banco-do-brasil': 'Banco do Brasil',
  bradesco: 'Bradesco',
  'c6-bank': 'C6 Bank',
  caixa: 'Caixa Econômica Federal',
  inter: 'Inter',
  itau: 'Itaú',
  'mercado-pago': 'Mercado Pago',
  nubank: 'Nubank',
  picpay: 'PicPay',
  santander: 'Santander',
};
const bankLogo = (ctx, key, bank = key, styles = []) => ctx.node({
  key: `${key}/logo`,
  styles: ['Institution/logo', ...styles],
  attrs: { role: 'img', 'aria-label': ctx.t('connectors_logo', BANKS[bank]) },
  children: [ctx.node({
    key: `${key}/logo-art`, tag: 'img', styles: ['Institution/art'], attrs: { src: `assets/proposed/banks/${bank}.svg`, alt: '', draggable: 'false' },
  })],
});
const addBankRow = (ctx) => ctx.node({
  key: 'add-bank',
  styles: ['Family/row'],
  hotspot: true,
  attrs: { role: 'button', tabindex: 0 },
  children: [
    ctx.node({ key: 'add-bank/ring', styles: ['Family/addRing'], children: [icon(ctx, 'add-bank/icon', 'plus', 'small', 'colors.text.tertiary')] }),
    text(ctx, 'add-bank/label', 'Family/addPlaceholder', { textKey: 'connectors_add_bank' }),
    chevron(ctx, 'add-bank'),
  ],
});
const connectorsHeader = (ctx) => [
  ...header(ctx, 'connectors_title', 'connectors_guidance'),
  text(ctx, 'eyebrow', 'Screen/eyebrow', { textKey: 'connectors_eyebrow' }),
  gap(ctx, 'gap-eyebrow', 'spacing.xxSmall'),
];
const connectorsFooter = (ctx) => [
  gap(ctx, 'gap-card', 'spacing.small'),
  ctx.node({
    key: 'more',
    styles: ['Family/row'],
    children: [
      ctx.node({ key: 'more-ring', styles: ['Family/addRing'], children: [icon(ctx, 'more-ring/icon', 'plug', 'small', 'colors.text.tertiary')] }),
      text(ctx, 'more-label', 'Family/addPlaceholder', { textKey: 'connectors_more_soon' }),
    ],
  }),
  ctx.node({
    key: 'note',
    styles: ['Family/note'],
    children: [
      icon(ctx, 'note/icon', 'shield_check', 'medium', 'colors.text.tertiary'),
      ctx.node({ key: 'note/text', textKey: 'connectors_note' }),
    ],
  }),
];

// Pluggy is the only connector for now; once set up it lists the banks it reads transactions from.
const connectors = frame('connectors', 'Connectors', { status: 'proposed', spec: 'docs/specs/connectors.md' }, (ctx) => screenFrame(ctx, [
  content(ctx, [
    ...connectorsHeader(ctx),
    OrbitCard(ctx, { key: 'pluggy', variant: 'Base', styles: ['Institutions/list'] }, [
      row(ctx, 'pluggy-row', pluggyLogo(ctx), 'Pluggy',
        status(ctx, 'pluggy/status', 'circle_check', 'colors.text.success', 'connectors_connected', ['4']), chevron(ctx, 'pluggy-row')),
      HorizontalDivider(ctx, { key: 'pluggy-divider' }),
      text(ctx, 'banks-eyebrow', 'Connectors/subhead', { textKey: 'connectors_banks_eyebrow' }),
      row(ctx, 'nubank', bankLogo(ctx, 'nubank'), 'Nubank',
        status(ctx, 'nubank/status', 'circle_check', 'colors.text.success', 'connectors_synced', ['5']), chevron(ctx, 'nubank')),
      // Paused with reconnect AUTHORIZATION: the user fixes it in MeuPluggy, which Orbit can't do, so a status pill and no button.
      row(ctx, 'itau', bankLogo(ctx, 'itau'), 'Itaú',
        status(ctx, 'itau/status', 'triangle_alert', 'colors.text.warning', 'connectors_sync_paused'),
        text(ctx, 'itau/authorize', 'Family/youPill', { textKey: 'connectors_authorize_in_meupluggy' }, {
          styles: ['Family/youPill', 'Connectors/authorizePill'],
        }), false),
      // Paused with reconnect CREDENTIALS: Pluggy rejects the saved client ID or secret, so Reconnect opens Pluggy setup.
      row(ctx, 'inter', bankLogo(ctx, 'inter'), 'Inter',
        status(ctx, 'inter/status', 'triangle_alert', 'colors.text.warning', 'connectors_sync_paused'),
        textButton(ctx, 'reconnect', 'connectors_reconnect', []), false),
      // Just added with its Item ID: Orbit knows the bank the user picked, but nothing about it until the first import.
      row(ctx, 'c6-bank', bankLogo(ctx, 'c6-bank'), 'C6 Bank',
        status(ctx, 'c6-bank/status', 'clock', 'colors.text.tertiary', 'connectors_pending'), null, false),
      // Each bank is its own Pluggy Item: Add a bank picks the bank, then asks for that Item's ID.
      addBankRow(ctx),
    ]),
    ...connectorsFooter(ctx),
  ]),
]));

const connectorsEmpty = frame('connectors-empty', 'Connectors · Not set up', { status: 'proposed', spec: 'docs/specs/connectors.md' }, (ctx) => screenFrame(ctx, [
  content(ctx, [
    ...connectorsHeader(ctx),
    OrbitCard(ctx, { key: 'pluggy', variant: 'Base', styles: ['Institutions/list'] }, [
      row(ctx, 'pluggy-row', pluggyLogo(ctx), 'Pluggy',
        text(ctx, 'pluggy/detail', 'Family/pending', { textKey: 'connectors_not_connected' }), null, false),
      ctx.node({
        key: 'pluggy-body',
        styles: ['Connectors/body'],
        children: [
          text(ctx, 'pluggy-body/text', 'Screen/guidance', { textKey: 'connectors_setup_body' }),
          OrbitButton(ctx, { key: 'setup', hotspot: true, styles: ['Screen/fill'] }, [label(ctx, 'setup/label', { textKey: 'connectors_setup' })]),
        ],
      }),
    ]),
    ...connectorsFooter(ctx),
  ]),
]));

const connectorsNoBanks = frame('connectors-no-banks', 'Connectors · No banks yet', { status: 'proposed', spec: 'docs/specs/pluggy-banks.md' }, (ctx) => screenFrame(ctx, [
  content(ctx, [
    ...connectorsHeader(ctx),
    OrbitCard(ctx, { key: 'pluggy', variant: 'Base', styles: ['Institutions/list'] }, [
      row(ctx, 'pluggy-row', pluggyLogo(ctx), 'Pluggy',
        status(ctx, 'pluggy/status', 'circle_check', 'colors.text.success', 'connectors_connected_none'), chevron(ctx, 'pluggy-row')),
      HorizontalDivider(ctx, { key: 'pluggy-divider' }),
      ctx.node({
        key: 'pluggy-body',
        styles: ['Connectors/body', 'Connectors/bodyTop'],
        children: [
          text(ctx, 'pluggy-body/text', 'Screen/guidance', { textKey: 'connectors_no_banks_body' }),
          OrbitButton(ctx, { key: 'add-first-bank', hotspot: true, styles: ['Screen/fill'] }, [
            icon(ctx, 'add-first-bank/icon', 'plus', 'medium', 'colors.text.onBrand', ['Screen/leadingIcon']),
            label(ctx, 'add-first-bank/label', { textKey: 'connectors_add_bank' }),
          ]),
        ],
      }),
    ]),
    ...connectorsFooter(ctx),
  ]),
]));

// Opened from Set up Pluggy, Edit credentials or Reconnect: the credentials Orbit needs to call Pluggy's API.
// Banks are added one by one afterwards, each with its own Item ID.
const pluggySetup = frame('pluggy-setup', 'Connectors · Pluggy setup', { status: 'proposed', spec: 'docs/specs/pluggy-setup.md' }, (ctx) => screenFrame(ctx, [
  content(ctx, [
    ...header(ctx, 'pluggy_setup_title', 'pluggy_setup_guidance', ctx.node({
      key: 'badge', styles: ['EmailSent/badge'], children: [icon(ctx, 'badge/icon', 'plug', 'xLarge', 'colors.text.brand')],
    })),
    ...field(ctx, 'client-id', 'pluggy_client_id_label', {
      value: '8f3c2a71-5d4e-4b9a-a1c6-2e7f90b3d415', placeholderKey: 'pluggy_client_id_placeholder',
    }),
    ctx.node({
      key: 'client-secret/label-row',
      styles: ['Pluggy/labelRow'],
      children: [
        text(ctx, 'client-secret/eyebrow', 'Screen/eyebrow', { textKey: 'pluggy_client_secret_label' }),
        OrbitIconButton(ctx, { key: 'secret-help', hotspot: true, contentDescription: ctx.t('pluggy_secret_help_title') }, [
          icon(ctx, 'secret-help/icon', 'circle_help', 'small', 'colors.text.tertiary'),
        ]),
      ],
    }),
    OrbitOutlineTextField(ctx, {
      key: 'client-secret',
      value: 'pk_live_4K9P27xQ',
      password: true,
      placeholderKey: 'pluggy_client_secret_placeholder',
      trailingIcon: OrbitIconButton(ctx, {
        key: 'show-secret', contentDescription: ctx.t('password_show'),
      }, [icon(ctx, 'show-secret/icon', 'eye', 'medium', 'colors.text.secondary')]),
    }),
    gap(ctx, 'gap-client-secret', 'spacing.medium'),
    ctx.node({ key: 'help', styles: ['Screen/guidance', 'Screen/link'], textKey: 'pluggy_setup_help', hotspot: true }),
    ctx.node({ key: 'spacer', styles: ['Screen/grow'] }),
    actions(ctx, [
      primary(ctx, 'save', 'pluggy_setup_save'),
      textButton(ctx, 'cancel', 'pluggy_setup_cancel'),
    ]),
  ]),
]));

const helpPoint = (ctx, key, glyph, titleKey, bodyKey) => ctx.node({
  key,
  styles: ['Pluggy/helpPoint'],
  children: [
    icon(ctx, `${key}/icon`, glyph, 'medium', 'colors.text.brand'),
    ctx.node({
      key: `${key}/text`,
      styles: ['Family/info'],
      children: [
        text(ctx, `${key}/title`, 'Family/name', { textKey: titleKey }),
        text(ctx, `${key}/body`, 'Screen/guidance', { textKey: bodyKey }),
      ],
    }),
  ],
});

const pluggySecretHelp = frame('pluggy-secret-help', 'Connectors · Pluggy setup · Secret help', {
  status: 'proposed', spec: 'docs/specs/pluggy-setup.md',
}, (ctx) => ctx.node({
  key: 'help-frame',
  styles: ['OrbitScaffold'],
  children: [
    ctx.node({
      key: 'help-background',
      styles: ['MonthPicker/background'],
      attrs: { inert: '', 'aria-hidden': 'true' },
      children: [pluggySetup.render(ctx)],
    }),
    OrbitBottomSheet(ctx, {
      key: 'secret-help-sheet',
      attrs: { role: 'dialog', 'aria-modal': 'true', 'aria-label': ctx.t('pluggy_secret_help_title') },
    }, [ctx.node({
      key: 'help-content',
      styles: ['Screen/content'],
      children: [
        ctx.node({
          key: 'help-header',
          styles: ['Home/spread'],
          children: [
            text(ctx, 'help-title', 'SignIn/title', { textKey: 'pluggy_secret_help_title' }),
            OrbitIconButton(ctx, { key: 'help-close', hotspot: true, contentDescription: ctx.t('home_picker_close') }, [
              icon(ctx, 'help-close/icon', 'x', 'medium', 'colors.text.secondary'),
            ]),
          ],
        }),
        gap(ctx, 'help-gap-title', 'spacing.small'),
        helpPoint(ctx, 'help-encrypted', 'shield_check', 'pluggy_secret_help_encrypted_title', 'pluggy_secret_help_encrypted_body'),
        helpPoint(ctx, 'help-hidden', 'eye_off', 'pluggy_secret_help_hidden_title', 'pluggy_secret_help_hidden_body'),
        helpPoint(ctx, 'help-private', 'triangle_alert', 'pluggy_secret_help_private_title', 'pluggy_secret_help_private_body'),
        gap(ctx, 'help-gap-button', 'spacing.large'),
        OrbitButton(ctx, { key: 'help-done', hotspot: true, styles: ['Screen/fill'] }, [
          label(ctx, 'help-done/label', { textKey: 'pluggy_secret_help_done' }),
        ]),
      ],
    })]),
  ],
}));

// Choose a bank: Orbit's catalog of banks and payment institutions (GET /institutions?types=BANK,PAYMENTS), with Orbit's
// logos. No status: a bank's state is only known once an Item is linked to it, so the list never says Connected or Offline.
// Kept under the old connectors-institutions id so saved drafts still load.
const BANK_SPEC = 'docs/specs/pluggy-banks.md';
const bankRow = (ctx, bank) => row(ctx, bank, bankLogo(ctx, bank), BANKS[bank], null, chevron(ctx, bank));
const bankHelpLink = (ctx, key, textKey) => ctx.node({
  key,
  styles: ['Screen/guidance', 'Screen/link', 'Pluggy/helpLink'],
  hotspot: true,
  attrs: { role: 'button', tabindex: 0 },
  children: [
    icon(ctx, `${key}/icon`, 'circle_help', 'small', 'colors.text.brand'),
    ctx.node({ key: `${key}/text`, tag: 'span', textKey }),
  ],
});

const connectorsInstitutions = frame('connectors-institutions', 'Connectors · Choose a bank', { status: 'proposed', spec: BANK_SPEC }, (ctx) => screenFrame(ctx, [
  content(ctx, [
    ...header(ctx, 'choose_bank_title', 'choose_bank_guidance', null, bankHelpLink(ctx, 'how-it-works', 'choose_bank_help')),
    OrbitOutlineTextField(ctx, {
      key: 'search-field',
      placeholderKey: 'choose_bank_search',
      leadingIcon: icon(ctx, 'search-field/icon', 'search', 'medium', 'colors.text.tertiary'),
    }),
    gap(ctx, 'gap-search', 'spacing.large'),
    text(ctx, 'eyebrow', 'Screen/eyebrow', { textKey: 'choose_bank_eyebrow', textArgs: [String(Object.keys(BANKS).length)] }),
    gap(ctx, 'gap-eyebrow', 'spacing.xxSmall'),
    OrbitCard(ctx, { key: 'banks', variant: 'Base', styles: ['Institutions/list'] }, Object.keys(BANKS).flatMap((bank, i) => [
      i > 0 && HorizontalDivider(ctx, { key: `divider-${bank}` }),
      bankRow(ctx, bank),
    ])),
    gap(ctx, 'gap-card', 'spacing.small'),
    ctx.node({
      key: 'note',
      styles: ['Family/note'],
      children: [
        icon(ctx, 'note/icon', 'credit_card', 'medium', 'colors.text.tertiary'),
        ctx.node({ key: 'note/text', textKey: 'choose_bank_note' }),
      ],
    }),
  ]),
]));

// Connect <bank>: the Item ID of the one Pluggy Item that reads this bank. Through MeuPluggy every Item reports the same
// MeuPluggy connector, so the bank picked on the previous screen is what names the row until the first import.
const CONNECT_BANK = 'c6-bank';
const connectBank = frame('connectors-connect-bank', 'Connectors · Connect bank', { status: 'proposed', spec: BANK_SPEC }, (ctx) => screenFrame(ctx, [
  content(ctx, [
    ...header(ctx,
      { textKey: 'connect_bank_title', textArgs: [BANKS[CONNECT_BANK]] },
      { textKey: 'connect_bank_guidance', textArgs: [BANKS[CONNECT_BANK]] },
      bankLogo(ctx, 'badge', CONNECT_BANK, ['Institution/badge'])),
    ...field(ctx, 'item-id', 'connect_bank_item_label', {
      value: 'c3b1e2f4-7a9d-4e60-b8f5-1d2a6c9e0b47', placeholderKey: 'connect_bank_item_placeholder',
    }),
    gap(ctx, 'gap-item-id', 'spacing.medium'),
    bankHelpLink(ctx, 'help', 'connect_bank_help'),
    ctx.node({ key: 'spacer', styles: ['Screen/grow'] }),
    actions(ctx, [
      primary(ctx, 'connect', 'connect_bank_save'),
      textButton(ctx, 'cancel', 'connect_bank_cancel'),
    ]),
  ]),
]));

const CATEGORIES = {
  groceries: { glyph: 'shopping_basket', color: 'colors.category.primary', spent: 'R$ 1.284,40', budget: 'R$ 1.500', used: 0.856 },
  restaurants: { glyph: 'utensils', color: 'colors.category.secondary', spent: 'R$ 767,60', budget: 'R$ 700', used: 1.097, over: 'R$ 67,60' },
  transport: { glyph: 'car_front', color: 'colors.category.tertiary', spent: 'R$ 440,00', budget: 'R$ 600', used: 0.733 },
  health: { glyph: 'heart_pulse', spent: 'R$ 388,00', budget: 'R$ 500', used: 0.776 },
  leisure: { glyph: 'ticket', spent: 'R$ 320,00', budget: 'R$ 400', used: 0.8 },
  bills: { glyph: 'zap', spent: 'R$ 250,00', budget: 'R$ 300', used: 0.833 },
  other: { glyph: 'ellipsis' },
};
const NEUTRAL = 'colors.text.secondary';
const OTHER_ARC = 'colors.text.tertiary';

const EXPENSES = [
  ['pao-de-acucar', 'Pão de Açúcar', 'groceries', 'home_today', null, 'R$ 182,40'],
  ['uber', 'Uber', 'transport', 'home_today', 'Marina', 'R$ 24,90'],
  ['ifood', 'iFood', 'restaurants', 'home_yesterday', null, 'R$ 68,50'],
  ['ipiranga', 'Posto Ipiranga', 'transport', 'home_yesterday', null, 'R$ 210,00', 'fuel'],
  ['drogasil', 'Drogasil', 'health', 'home_yesterday', 'Marina', 'R$ 57,30'],
];

const clipped = (style) => ({ styles: [style, 'Home/ellipsis'] });
const inset = (ctx, key, child) => ctx.node({ key, styles: ['Home/inset'], children: [child] });
const avatar = (ctx) => text(ctx, 'account', 'Family/avatar', { text: 'A' }, {
  hotspot: true, attrs: { role: 'button', 'aria-label': ctx.t('home_account') },
});
const bell = (ctx) => OrbitIconButton(ctx, { key: 'notifications', hotspot: true, contentDescription: ctx.t('home_notifications') }, [
  icon(ctx, 'notifications/icon', 'bell', 'medium', 'colors.text.secondary'),
]);
const sectionHeader = (ctx, key, eyebrowKey, linkKey) => ctx.node({
  key,
  styles: ['Home/spread', 'Home/inset'],
  children: [
    text(ctx, `${key}/eyebrow`, 'Screen/eyebrow', { textKey: eyebrowKey }),
    linkKey && ctx.node({ key: `${key}/link`, styles: ['Screen/guidance', 'Screen/link'], textKey: linkKey, hotspot: true }),
  ],
});
const section = (ctx, key, header, child) => [header, gap(ctx, `${key}/gap`, 'spacing.xxSmall'), inset(ctx, `${key}/inset`, child)];

const badge = (ctx, key, category, { small = false, glyph } = {}) => {
  const { color, glyph: own } = CATEGORIES[category];
  return ctx.node({
    key,
    styles: [small ? 'Home/badgeSmall' : 'Home/badge'],
    bind: { background: color ? { token: color, alpha: 0.14 } : { token: 'colors.surface.sunken' } },
    children: [icon(ctx, `${key}/icon`, glyph ?? own, small ? 'small' : 'medium', color ?? NEUTRAL)],
  });
};

// Every expense row opens its transaction.
const expense = (ctx, [key, merchant, category, dayKey, member, amount, glyph]) => ctx.node({
  key,
  styles: ['Home/row'],
  hotspot: true,
  attrs: { role: 'button', tabindex: 0 },
  children: [
    badge(ctx, `${key}/badge`, category, { glyph }),
    ctx.node({
      key: `${key}/info`,
      styles: ['Family/info'],
      children: [
        text(ctx, `${key}/merchant`, 'Family/name', { text: merchant }, clipped('Family/name')),
        text(ctx, `${key}/detail`, 'Screen/tertiary', {
          text: [ctx.t(`home_category_${category}`), ctx.t(dayKey), member].filter(Boolean).join(' · '),
        }, clipped('Screen/tertiary')),
      ],
    }),
    text(ctx, `${key}/amount`, 'Home/amount', { text: amount }),
  ],
});

const recentCard = (ctx, count) => OrbitCard(ctx, { key: 'recent', variant: 'Base' }, EXPENSES.slice(0, count).flatMap((row, i) => [
  i > 0 && HorizontalDivider(ctx, { key: `divider-${i}` }),
  expense(ctx, row),
]));
const recent = (ctx, count) => section(ctx, 'recent', sectionHeader(ctx, 'recent-header', 'home_recent_eyebrow', 'home_see_all'), recentCard(ctx, count));

const percentOf = (category) => `${Math.round(CATEGORIES[category].used * 100)}%`;
const statusOf = (used) => (used > 1 ? 'Error' : used >= 0.9 ? 'Warning' : 'Primary');
const progressOf = (ctx, key, category) => OrbitLinearProgressIndicator(ctx, {
  key, progress: Math.min(CATEGORIES[category].used, 1), status: statusOf(CATEGORIES[category].used), styles: ['Home/track', 'Home/tileProgress'],
});

const categoryTile = (ctx, category, { styles, percent = false }) => {
  const { spent, budget, over, used } = CATEGORIES[category];
  const key = `category-${category}`;
  return OrbitCard(ctx, { key, variant: 'Base', hotspot: true, styles }, [
    ctx.node({
      key: `${key}/body`,
      styles: ['Home/tileBody'],
      children: [
        ctx.node({
          key: `${key}/top`,
          styles: ['Home/tileTop'],
          children: [
            badge(ctx, `${key}/badge`, category),
            percent && text(ctx, `${key}/percent`, 'Home/percent', { text: percentOf(category) }, used > 1 ? { bind: { color: { token: 'colors.text.error' } } } : {}),
          ],
        }),
        text(ctx, `${key}/name`, 'Family/name', { textKey: `home_category_${category}` }, clipped('Family/name')),
        text(ctx, `${key}/amount`, 'Home/amount', { text: spent }),
        progressOf(ctx, `${key}/progress`, category),
        over
          ? text(ctx, `${key}/caption`, 'Screen/tertiary', { textKey: 'home_over', textArgs: [over] }, { ...clipped('Screen/tertiary'), bind: { color: { token: 'colors.text.error' } } })
          : text(ctx, `${key}/caption`, 'Screen/tertiary', { textKey: 'home_of', textArgs: [budget] }, clipped('Screen/tertiary')),
      ],
    }),
  ]);
};

const navIcon = (ctx, key, glyph, hotspot) => ctx.node({
  key, styles: [`Icon/${glyph}`], bind: { width: { token: 'sizes.large' }, height: { token: 'sizes.large' } }, hotspot,
});
// Filled artwork for the selected destination, outlined otherwise. `key` stays the old hotspot id so saved prototype links keep working.
const navToggleItem = (ctx, key, name, labelKey, hotspot) => ({
  labelKey, icon: (selected) => navIcon(ctx, key, `${name}_${selected ? 'filled' : 'outline'}`, hotspot),
});
const addExpenseAttrs = (ctx) => ({ role: 'button', 'aria-label': ctx.t('home_add_expense') });

const donut = (ctx) => {
  const GAP = 1.2;
  const arcs = [['groceries', 25.69], ['restaurants', 15.35], ['transport', 8.8], ['other', 19.16]];
  let start = 0;
  const circle = (key, stroke, extra = {}) => ctx.node({
    key,
    tag: 'circle',
    bind: { stroke: { token: stroke } },
    attrs: { cx: 120, cy: 120, r: 108, fill: 'none', 'stroke-width': 24, pathLength: 100, ...extra },
  });
  const drawn = arcs.map(([category, share]) => {
    const arc = circle(`ring-${category}`, CATEGORIES[category].color ?? OTHER_ARC, {
      'stroke-dasharray': `${share - GAP} 100`,
      'stroke-dashoffset': -(start + GAP / 2),
    });
    start += share;
    return arc;
  });
  return ctx.node({
    key: 'ring',
    styles: ['Home/ring'],
    attrs: { role: 'img' },
    children: [
      ctx.node({
        key: 'ring/svg',
        tag: 'svg',
        attrs: { viewBox: '0 0 240 240' },
        children: [ctx.node({
          key: 'ring/arcs',
          tag: 'g',
          attrs: { transform: 'rotate(-90 120 120)' },
          children: [circle('ring-track', 'colors.border.base'), ...drawn],
        })],
      }),
      ctx.node({
        key: 'ring/center',
        styles: ['Home/ringCenter'],
        children: [
          text(ctx, 'ring/eyebrow', 'Screen/eyebrow', { textKey: 'home_spent_eyebrow' }),
          text(ctx, 'ring/amount', 'Home/ringAmount', { text: 'R$ 3.450,00' }),
          text(ctx, 'ring/budget', 'Screen/secondary', { textKey: 'home_of', textArgs: ['R$ 5.000,00'] }),
        ],
      }),
    ],
  });
};

const stat = (ctx, key, labelKey, value) => ctx.node({
  key,
  styles: ['Home/stat'],
  children: [
    text(ctx, `${key}/label`, 'Screen/eyebrow', { textKey: labelKey }),
    text(ctx, `${key}/value`, 'Home/statValue', value),
  ],
});

const upcomingRow = (ctx, key, { day, nameKey, amount, days }) => ctx.node({
  key,
  styles: ['Home/row'],
  children: [
    ctx.node({
      key: `${key}/date`,
      styles: ['Home/dateTile'],
      children: [
        text(ctx, `${key}/day`, 'Home/dateDay', { text: day }),
        text(ctx, `${key}/month`, 'Home/dateMonth', { textKey: 'home_month_oct' }),
      ],
    }),
    ctx.node({
      key: `${key}/info`,
      styles: ['Family/info'],
      children: [
        text(ctx, `${key}/name`, 'Family/name', { textKey: nameKey }, clipped('Family/name')),
        text(ctx, `${key}/detail`, 'Screen/tertiary', { textKey: 'home_bill_monthly' }, clipped('Screen/tertiary')),
      ],
    }),
    ctx.node({
      key: `${key}/trailing`,
      styles: ['Home/trailing'],
      children: [
        text(ctx, `${key}/amount`, 'Home/amount', { text: amount }),
        text(ctx, `${key}/due`, 'Screen/tertiary', { textKey: 'home_in_days', textArgs: [days] }),
      ],
    }),
  ],
});

const homePulse = frame('home-pulse', 'Home · Pulse', { status: 'proposed' }, (ctx) => screenFrame(ctx, [
  ctx.node({
    key: 'content',
    styles: ['Home/scroll'],
    children: [
      gap(ctx, 'gap-top', 'spacing.xxLarge'),
      ctx.node({
        key: 'header',
        styles: ['Home/spread', 'Home/inset'],
        children: [
          ctx.node({
            key: 'header/text',
            styles: ['Home/headerText'],
            children: [
              text(ctx, 'greeting', 'Screen/guidance', { textKey: 'home_greeting', textArgs: ['Ana'] }),
              ctx.node({
                key: 'month',
                styles: ['Home/monthRow'],
                hotspot: true,
                children: [
                  text(ctx, 'month/title', 'SignIn/title', { textKey: 'home_month' }),
                  icon(ctx, 'month/chevron', 'chevron_down', 'medium', 'colors.text.secondary'),
                ],
              }),
            ],
          }),
          ctx.node({ key: 'actions', styles: ['Home/actions'], children: [bell(ctx), avatar(ctx)] }),
        ],
      }),
      gap(ctx, 'gap-header', 'spacing.large'),
      inset(ctx, 'hero/inset', OrbitCard(ctx, { key: 'hero', variant: 'Base' }, [
        ctx.node({ key: 'hero/area', styles: ['Home/ringArea'], children: [donut(ctx)] }),
        HorizontalDivider(ctx, { key: 'hero/divider' }),
        ctx.node({
          key: 'stats',
          styles: ['Home/stats'],
          children: [
            stat(ctx, 'stat-left', 'home_stat_left', { text: 'R$ 1.550,00' }),
            stat(ctx, 'stat-per-day', 'home_stat_per_day', { text: 'R$ 64,58' }),
            stat(ctx, 'stat-days', 'home_stat_days_left', { text: '24' }),
          ],
        }),
      ])),
      gap(ctx, 'gap-hero', 'spacing.large'),
      sectionHeader(ctx, 'categories-header', 'home_categories_eyebrow', 'home_see_all'),
      gap(ctx, 'gap-categories', 'spacing.xxSmall'),
      ctx.node({
        key: 'carousel',
        styles: ['Home/carousel'],
        children: Object.keys(CATEGORIES).filter((name) => name !== 'other').map((name) => categoryTile(ctx, name, { styles: ['Home/tile'] })),
      }),
      gap(ctx, 'gap-carousel', 'spacing.large'),
      inset(ctx, 'upcoming/inset', OrbitCard(ctx, { key: 'upcoming', variant: 'Base' }, [
        ctx.node({
          key: 'upcoming-header',
          styles: ['Home/titleRow'],
          children: [
            text(ctx, 'upcoming-title', 'Home/cardTitle', { textKey: 'home_upcoming_title' }),
            text(ctx, 'upcoming-summary', 'Screen/eyebrow', { textKey: 'home_upcoming_summary', textArgs: [2, 'R$ 366,70'] }, {
              bind: { color: { token: 'colors.text.tertiary' } },
            }),
          ],
        }),
        HorizontalDivider(ctx, { key: 'upcoming-header-divider' }),
        upcomingRow(ctx, 'bill-electricity', { day: '10', nameKey: 'home_bill_electricity', amount: 'R$ 246,80', days: 3 }),
        HorizontalDivider(ctx, { key: 'upcoming-divider' }),
        upcomingRow(ctx, 'bill-internet', { day: '15', nameKey: 'home_bill_internet', amount: 'R$ 119,90', days: 8 }),
      ])),
      gap(ctx, 'gap-upcoming', 'spacing.large'),
      ...recent(ctx, 5),
      gap(ctx, 'gap-bottom', 'spacing.large'),
    ],
  }),
  mainNav(ctx, MAIN_NAV.home),
]));

const WEEK = [35, 60, 90, 45, 20, 70, 55];

const weekChart = (ctx) => [
  text(ctx, 'week-eyebrow', 'Home/heroEyebrow', { textKey: 'home_last_days_eyebrow' }),
  ctx.node({
    key: 'plot',
    styles: ['Home/plot'],
    children: WEEK.map((share, i) => ctx.node({
      key: `day-${i + 1}`,
      styles: ['Home/plotColumn'],
      children: [
        ctx.node({ key: `day-${i + 1}/space`, styles: [`Home/grow/${100 - share}`] }),
        ctx.node({
          key: `day-${i + 1}/bar`,
          styles: ['Home/bar', `Home/grow/${share}`],
          bind: i === WEEK.length - 1 ? { background: { token: 'colors.text.onInk' } } : {},
        }),
      ],
    })),
  }),
  ctx.node({
    key: 'plot-labels',
    styles: ['Home/chartLabels'],
    children: WEEK.map((_, i) => text(ctx, `day-label-${i + 1}`, 'Home/chartLabel', { text: String(i + 1) }, i === WEEK.length - 1 ? { bind: { color: { token: 'colors.text.onInk' } } } : {})),
  }),
];

const budgetHero = (ctx) => OrbitCard(ctx, { key: 'hero', variant: 'Gradient' }, [
  ctx.node({
    key: 'hero/content',
    styles: ['Home/hero'],
    children: [
      ctx.node({
        key: 'hero/top',
        styles: ['Home/spread'],
        children: [
          text(ctx, 'hero/eyebrow', 'Home/heroEyebrow', { textKey: 'home_spent_eyebrow' }),
          text(ctx, 'hero/days', 'Home/pill', { textKey: 'home_days_left_pill', textArgs: [24] }),
        ],
      }),
      text(ctx, 'hero/amount', 'OrbitCard/amount', { text: 'R$ 3.450,00' }),
      text(ctx, 'hero/budget', 'Home/heroNote', { textKey: 'home_of_budget', textArgs: ['R$ 5.000,00'] }),
      ctx.node({
        key: 'hero/track',
        styles: ['Home/inkTrack'],
        children: [ctx.node({ key: 'hero/fill', styles: ['Home/inkFill', 'Home/grow/69'] }), ctx.node({ key: 'hero/rest', styles: ['Home/grow/31'] })],
      }),
      ctx.node({
        key: 'hero/stats',
        styles: ['Home/spread'],
        children: [
          text(ctx, 'hero/left', 'Home/heroStat', { textKey: 'home_amount_left', textArgs: ['R$ 1.550,00'] }),
          text(ctx, 'hero/per-day', 'Home/heroStat', { textKey: 'home_amount_per_day', textArgs: ['R$ 64,58'] }),
        ],
      }),
      ctx.node({ key: 'hero/divider', styles: ['Home/inkDivider'] }),
      ...weekChart(ctx),
    ],
  }),
]);

const splitBar = (ctx, key, segments) => ctx.node({
  key,
  styles: ['Home/split'],
  children: segments.map(([name, share, token]) => ctx.node({
    key: `${key}/${name}`,
    styles: [`Home/grow/${share}`],
    bind: token ? { background: { token } } : {},
  })),
});

const splitMember = (ctx, key, initial, name, amount, percent, avatarBind, youPill, hotspot = false) => ctx.node({
  key,
  styles: ['Home/memberRow'],
  hotspot,
  attrs: hotspot ? { role: 'button', tabindex: 0 } : {},
  children: [
    text(ctx, `${key}/avatar`, 'Family/avatar', { text: initial }, { bind: avatarBind }),
    ctx.node({
      key: `${key}/name-row`,
      styles: ['Home/nameRow'],
      children: [
        text(ctx, `${key}/name`, 'Family/name', { text: name }),
        youPill && text(ctx, `${key}/you`, 'Family/youPill', { textKey: 'family_members_you' }),
      ],
    }),
    text(ctx, `${key}/amount`, 'Home/amount', { text: amount }),
    text(ctx, `${key}/percent`, 'Home/memberPercent', { text: percent }),
  ],
});

const familyCard = (ctx) => OrbitCard(ctx, { key: 'family', variant: 'Base' }, [
  ctx.node({
    key: 'family/body',
    styles: ['Home/cardBody'],
    children: [
      splitBar(ctx, 'split', [['ana', 62, 'colors.brand.primary'], ['marina', 38, 'colors.brand.accent']]),
      splitMember(ctx, 'member-ana', 'A', 'Ana', 'R$ 2.139,00', '62%', {
        background: { token: 'colors.brand.primary' }, color: { token: 'colors.text.onBrand' },
      }, true),
      splitMember(ctx, 'member-marina', 'M', 'Marina', 'R$ 1.311,00', '38%', {
        background: { token: 'colors.brand.accent' }, color: { token: 'colors.brand.ink' },
      }, false),
    ],
  }),
]);

const goalCard = (ctx) => OrbitCard(ctx, { key: 'goal', variant: 'Base' }, [
  ctx.node({
    key: 'goal/body',
    styles: ['Home/cardBody'],
    children: [
      ctx.node({
        key: 'goal/top',
        styles: ['Home/spread'],
        children: [
          text(ctx, 'goal/eyebrow', 'Screen/eyebrow', { textKey: 'home_goal_eyebrow' }),
          text(ctx, 'goal/date', 'Screen/eyebrow', { textKey: 'home_goal_date' }, { bind: { color: { token: 'colors.text.tertiary' } } }),
        ],
      }),
      text(ctx, 'goal/name', 'Home/goalTitle', { textKey: 'home_goal_name' }),
      ctx.node({
        key: 'goal/amounts',
        styles: ['Home/goalAmounts'],
        children: [
          text(ctx, 'goal/saved', 'Home/goalValue', { text: 'R$ 7.581' }),
          text(ctx, 'goal/target', 'Screen/secondary', { textKey: 'home_of', textArgs: ['R$ 8.900'] }),
          ctx.node({ key: 'goal/spacer', styles: ['Screen/grow'] }),
          text(ctx, 'goal/percent', 'Home/goalPercent', { text: '85%' }),
        ],
      }),
      OrbitLinearProgressIndicator(ctx, { key: 'goal/progress', progress: 0.85, status: 'Success', styles: ['Home/track'] }),
    ],
  }),
]);

const homeBudget = frame('home-budget', 'Home · Budget', { status: 'proposed' }, (ctx) => screenFrame(ctx, [
  ctx.node({
    key: 'content',
    styles: ['Home/scroll'],
    children: [
      gap(ctx, 'gap-top', 'spacing.xxLarge'),
      ctx.node({
        key: 'header',
        styles: ['Home/spread', 'Home/inset'],
        children: [
          ctx.node({
            key: 'header/text',
            styles: ['Home/headerText'],
            children: [
              text(ctx, 'month', 'Screen/eyebrow', { textKey: 'home_month_eyebrow' }),
              gap(ctx, 'gap-month', 'spacing.xxxSmall'),
              text(ctx, 'greeting', 'SignIn/title', { textKey: 'home_greeting', textArgs: ['Ana'] }),
            ],
          }),
          avatar(ctx),
        ],
      }),
      gap(ctx, 'gap-header', 'spacing.large'),
      inset(ctx, 'hero/inset', budgetHero(ctx)),
      gap(ctx, 'gap-hero', 'spacing.large'),
      sectionHeader(ctx, 'categories-header', 'home_categories_eyebrow', 'home_see_all'),
      gap(ctx, 'gap-categories', 'spacing.xxSmall'),
      ctx.node({
        key: 'grid',
        styles: ['Home/grid'],
        children: [['groceries', 'restaurants'], ['transport', 'health']].map((pair, row) => ctx.node({
          key: `grid-row-${row}`,
          styles: ['Home/gridRow'],
          children: pair.map((name) => categoryTile(ctx, name, { styles: ['Home/tileFlex'], percent: true })),
        })),
      }),
      gap(ctx, 'gap-grid', 'spacing.large'),
      ...section(ctx, 'family', sectionHeader(ctx, 'family-header', 'home_family_eyebrow'), familyCard(ctx)),
      gap(ctx, 'gap-family', 'spacing.large'),
      inset(ctx, 'goal/inset', goalCard(ctx)),
      gap(ctx, 'gap-goal', 'spacing.large'),
      ...recent(ctx, 3),
      gap(ctx, 'gap-bottom', 'spacing.large'),
    ],
  }),
  mainNav(ctx, MAIN_NAV.home),
]));

const RANKS = [['groceries', 16, '37%'], ['restaurants', 10, '22%'], ['transport', 6, '13%'], ['other', 12, '28%']];
const SPENT = { groceries: 'R$ 1.284,40', restaurants: 'R$ 767,60', transport: 'R$ 440,00', other: 'R$ 958,00' };

const rankRow = (ctx, [category, , percent]) => ctx.node({
  key: `rank-${category}`,
  styles: ['Home/rankRow'],
  children: [
    badge(ctx, `rank-${category}/badge`, category, { small: true }),
    ctx.node({
      key: `rank-${category}/info`,
      styles: ['Family/info'],
      children: [text(ctx, `rank-${category}/name`, 'Family/name', { textKey: `home_category_${category}` }, clipped('Family/name'))],
    }),
    text(ctx, `rank-${category}/amount`, 'Home/amount', { text: SPENT[category] }),
    text(ctx, `rank-${category}/percent`, 'Home/memberPercent', { text: percent }),
  ],
});

const leftoverHero = (ctx) => OrbitCard(ctx, { key: 'hero', variant: 'Raised' }, [
  ctx.node({
    key: 'hero/content',
    styles: ['Home/hero'],
    children: [
      ctx.node({
        key: 'hero/top',
        styles: ['Home/spread'],
        children: [
          text(ctx, 'hero/eyebrow', 'Screen/eyebrow', { textKey: 'home_left_eyebrow' }),
          text(ctx, 'hero/status', 'Home/statusPill', { textKey: 'home_on_track' }),
        ],
      }),
      text(ctx, 'hero/amount', 'OrbitCard/amount', { text: 'R$ 4.350,00' }),
      text(ctx, 'hero/income', 'Screen/secondary', { textKey: 'home_of_income', textArgs: ['R$ 7.800,00'] }),
      gap(ctx, 'hero/gap-bar', 'spacing.xxSmall'),
      splitBar(ctx, 'split', [
        ...RANKS.map(([name, share]) => [name, share, CATEGORIES[name].color ?? OTHER_ARC]),
        ['leftover', 56, null],
      ]),
      gap(ctx, 'hero/gap-ranks', 'spacing.xxSmall'),
      ...RANKS.map((rank) => rankRow(ctx, rank)),
    ],
  }),
]);

const attentionRow = (ctx, key, glyph, title, detail) => ctx.node({
  key,
  styles: ['Home/attentionRow'],
  hotspot: true,
  children: [
    ctx.node({ key: `${key}/badge`, styles: ['Home/warnBadge'], children: [icon(ctx, `${key}/icon`, glyph, 'medium', 'colors.text.warning')] }),
    ctx.node({
      key: `${key}/info`,
      styles: ['Family/info'],
      children: [
        text(ctx, `${key}/title`, 'Family/name', title),
        text(ctx, `${key}/detail`, 'Screen/tertiary', detail, clipped('Screen/tertiary')),
      ],
    }),
    icon(ctx, `${key}/chevron`, 'chevron_right', 'medium', 'colors.text.tertiary'),
  ],
});

const attentionCard = (ctx) => OrbitCard(ctx, { key: 'attention', variant: 'Base' }, [
  attentionRow(
    ctx, 'attention-budget', 'triangle_alert',
    { textKey: 'home_attention_over', textArgs: [ctx.t('home_category_restaurants'), 'R$ 67,60'] },
    { textKey: 'home_attention_budgeted', textArgs: ['R$ 767,60', 'R$ 700,00'] },
  ),
  HorizontalDivider(ctx, { key: 'attention-divider' }),
  attentionRow(ctx, 'attention-invite', 'clock', { textKey: 'home_invite_expired' }, { textKey: 'home_invite_resend' }),
]);

const homeLeftover = frame('home-leftover', 'Home · Leftover', { status: 'proposed' }, (ctx) => screenFrame(ctx, [
  ctx.node({
    key: 'content',
    styles: ['Home/scroll'],
    children: [
      gap(ctx, 'gap-top', 'spacing.xxLarge'),
      ctx.node({
        key: 'header',
        styles: ['Home/spread', 'Home/inset'],
        children: [
          ctx.node({
            key: 'brand',
            styles: ['Home/brand'],
            children: [
              AnimatedOrbitLogo(ctx, { key: 'logo', styles: ['Home/logo'] }),
              text(ctx, 'wordmark', 'Home/wordmark', { text: 'Orbit' }),
            ],
          }),
          ctx.node({ key: 'actions', styles: ['Home/actions'], children: [bell(ctx), avatar(ctx)] }),
        ],
      }),
      gap(ctx, 'gap-header', 'spacing.small'),
      inset(ctx, 'switcher/inset', ctx.node({
        key: 'switcher',
        styles: ['Home/switcher'],
        children: [
          OrbitIconButton(ctx, { key: 'month-previous', hotspot: true, styles: ['Home/switcherButton'], contentDescription: ctx.t('home_month_previous') }, [
            icon(ctx, 'month-previous/icon', 'chevron_left', 'medium', 'colors.text.secondary'),
          ]),
          text(ctx, 'switcher/label', 'Family/name', { textKey: 'home_month' }, { styles: ['Family/name', 'Home/switcherLabel'] }),
          OrbitIconButton(ctx, { key: 'month-next', hotspot: true, styles: ['Home/switcherButton'], contentDescription: ctx.t('home_month_next') }, [
            icon(ctx, 'month-next/icon', 'chevron_right', 'medium', 'colors.text.secondary'),
          ]),
        ],
      })),
      gap(ctx, 'gap-switcher', 'spacing.large'),
      inset(ctx, 'hero/inset', leftoverHero(ctx)),
      gap(ctx, 'gap-hero', 'spacing.large'),
      ...section(ctx, 'attention', sectionHeader(ctx, 'attention-header', 'home_attention_eyebrow'), attentionCard(ctx)),
      gap(ctx, 'gap-attention', 'spacing.large'),
      ...recent(ctx, 5),
      gap(ctx, 'gap-bottom', 'spacing.large'),
    ],
  }),
  mainNav(ctx, MAIN_NAV.home),
]));

// Add is a round gradient button in the middle of the bar, without a label.
const addNavItem = (ctx) => ({
  slot: ctx.node({
    key: 'nav-add-slot',
    styles: ['Nav/addSlot'],
    children: [ctx.node({
      key: 'add-expense',
      styles: ['Nav/add'],
      hotspot: true,
      attrs: addExpenseAttrs(ctx),
      children: [icon(ctx, 'add-expense/icon', 'plus', 'large', 'colors.text.onInk')],
    })],
  }),
});

// Home, Insights, Add, Wallet and Settings, each with filled artwork when selected. The destinations other than the selected one are hotspots;
// their keys stay the old hotspot ids (`nav-house`, `nav-user_round`) so saved prototype links keep working.
const MAIN_NAV = { home: 0, charts: 1, insights: 1, wallet: 3, settings: 4 };
const mainNav = (ctx, selectedIndex) => ctx.node({
  key: 'bottom',
  styles: ['Home/bottom'],
  children: [OrbitNavigationBar(ctx, {
    key: 'nav',
    selectedIndex,
    items: [
      navToggleItem(ctx, 'nav-house', 'home', 'home_nav_home', selectedIndex !== MAIN_NAV.home),
      navToggleItem(ctx, 'nav-charts', 'chart_pie', 'home_nav_insights', selectedIndex !== MAIN_NAV.insights),
      addNavItem(ctx),
      navToggleItem(ctx, 'nav-wallet', 'wallet', 'home_nav_wallet', selectedIndex !== MAIN_NAV.wallet),
      navToggleItem(ctx, 'nav-user_round', 'settings', 'home_nav_settings', selectedIndex !== MAIN_NAV.settings),
    ],
  })],
});

const home = frame('home', 'Home', { status: 'proposed' }, (ctx) => screenFrame(ctx, [
  ctx.node({
    key: 'content',
    styles: ['Home/scroll'],
    children: [
      gap(ctx, 'gap-top', 'spacing.xxLarge'),
      ctx.node({
        key: 'header',
        styles: ['Home/spread', 'Home/inset'],
        children: [
          ctx.node({
            key: 'header/text',
            styles: ['Home/headerText'],
            children: [
              ctx.node({
                key: 'month',
                tag: 'button',
                styles: ['Home/monthRow'],
                hotspot: true,
                children: [
                  text(ctx, 'month/title', 'Screen/eyebrow', { textKey: 'home_month_eyebrow' }),
                  icon(ctx, 'month/chevron', 'chevron_down', 'xSmall', 'colors.text.secondary'),
                ],
              }),
              gap(ctx, 'gap-month', 'spacing.xxxSmall'),
              text(ctx, 'greeting', 'SignIn/title', { textKey: 'home_greeting', textArgs: ['Ana'] }),
            ],
          }),
          bell(ctx),
        ],
      }),
      gap(ctx, 'gap-header', 'spacing.large'),
      inset(ctx, 'hero/inset', budgetHero(ctx)),
      gap(ctx, 'gap-hero', 'spacing.large'),
      ...section(ctx, 'attention', sectionHeader(ctx, 'attention-header', 'home_attention_eyebrow'), attentionCard(ctx)),
      gap(ctx, 'gap-attention', 'spacing.large'),
      sectionHeader(ctx, 'categories-header', 'home_categories_eyebrow', 'home_see_all'),
      gap(ctx, 'gap-categories', 'spacing.xxSmall'),
      ctx.node({
        key: 'grid',
        styles: ['Home/grid'],
        children: [['groceries', 'restaurants'], ['transport', 'health']].map((pair, row) => ctx.node({
          key: `grid-row-${row}`,
          styles: ['Home/gridRow'],
          children: pair.map((name) => categoryTile(ctx, name, { styles: ['Home/tileFlex'], percent: true })),
        })),
      }),
      gap(ctx, 'gap-grid', 'spacing.large'),
      ...recent(ctx, 5),
      gap(ctx, 'gap-recent', 'spacing.large'),
      ...section(ctx, 'family', sectionHeader(ctx, 'family-header', 'home_family_eyebrow'), familyCard(ctx)),
      gap(ctx, 'gap-family', 'spacing.large'),
      inset(ctx, 'goal/inset', goalCard(ctx)),
      gap(ctx, 'gap-goal', 'spacing.large'),
    ],
  }),
  mainNav(ctx, MAIN_NAV.home),
]));

const homeMonthPicker = frame('home-month-picker', 'Home · Month picker', {
  status: 'proposed', spec: 'docs/specs/home-month-picker.md',
}, (ctx) => ctx.node({
  key: 'picker-frame',
  styles: ['OrbitScaffold'],
  children: [
    ctx.node({
      key: 'picker-background',
      styles: ['MonthPicker/background'],
      attrs: { inert: '', 'aria-hidden': 'true' },
      children: [home.render(ctx)],
    }),
    OrbitBottomSheet(ctx, {
      key: 'month-picker',
      attrs: { role: 'dialog', 'aria-modal': 'true', 'aria-label': ctx.t('home_picker_title') },
    }, [ctx.node({
      key: 'picker-content',
      styles: ['Screen/content'],
      children: [
        ctx.node({
          key: 'picker-header',
          styles: ['Home/spread'],
          children: [
            text(ctx, 'picker-title', 'SignIn/title', { textKey: 'home_picker_title' }),
            OrbitIconButton(ctx, { key: 'picker-close', hotspot: true, contentDescription: ctx.t('home_picker_close') }, [
              icon(ctx, 'picker-close/icon', 'x', 'medium', 'colors.text.secondary'),
            ]),
          ],
        }),
        gap(ctx, 'picker-gap-title', 'spacing.small'),
        ctx.node({
          key: 'picker-year',
          styles: ['Home/spread'],
          attrs: { role: 'group', 'aria-label': ctx.t('home_picker_year') },
          children: [
            OrbitIconButton(ctx, { key: 'picker-year-previous', hotspot: true, contentDescription: ctx.t('home_picker_previous_year') }, [
              icon(ctx, 'picker-year-previous/icon', 'chevron_left', 'medium', 'colors.text.secondary'),
            ]),
            text(ctx, 'picker-year/value', 'Home/wordmark', { text: '2026' }),
            OrbitIconButton(ctx, { key: 'picker-year-next', hotspot: true, contentDescription: ctx.t('home_picker_next_year') }, [
              icon(ctx, 'picker-year-next/icon', 'chevron_right', 'medium', 'colors.text.secondary'),
            ]),
          ],
        }),
        gap(ctx, 'picker-gap-year', 'spacing.small'),
        ctx.node({
          key: 'picker-months',
          styles: ['MonthPicker/grid'],
          children: [[1, 2, 3], [4, 5, 6], [7, 8, 9], [10, 11, 12]].map((months, row) => ctx.node({
            key: `picker-month-row-${row}`,
            styles: ['Home/gridRow'],
            children: months.map((month) => OrbitFilterChip(ctx, {
              key: `picker-month-${month}`,
              labelKey: `home_picker_month_${month}`,
              selected: month === 10,
              hotspot: true,
              styles: ['MonthPicker/month'],
              attrs: { role: 'button', 'aria-pressed': month === 10, tabindex: 0 },
            })),
          })),
        }),
        gap(ctx, 'picker-gap-apply', 'spacing.large'),
        OrbitButton(ctx, { key: 'picker-apply', hotspot: true, styles: ['Screen/fill'] }, [
          label(ctx, 'picker-apply/label', { textKey: 'home_picker_apply' }),
        ]),
      ],
    })]),
  ],
}));

// Charts: SVG marks bound to theme tokens. The plot width is the frame minus the screen inset and the card padding.
const PLOT_WIDTH = 338;
const decimal = (ctx, value) => (ctx.settings.language === 'pt' ? value.replace('.', ',') : value);
const thousands = (ctx, value) => ctx.t('charts_axis_thousands', decimal(ctx, value));
const svgText = (ctx, key, text, { x, y, anchor = 'start', font = 'typography.labelSmall', color = 'colors.text.tertiary' }) => ctx.node({
  key, tag: 'text', text, bind: { font: { token: font }, fill: { token: color } }, attrs: { x, y, 'text-anchor': anchor },
});
const svgLine = (ctx, key, [x1, y1, x2, y2], color, width = 1, dash) => ctx.node({
  key, tag: 'line', bind: { stroke: { token: color } }, attrs: { x1, y1, x2, y2, 'stroke-width': width, ...(dash ? { 'stroke-dasharray': dash } : {}) },
});
const svgPath = (ctx, key, d, bind, attrs = {}) => ctx.node({ key, tag: 'path', bind, attrs: { d, ...attrs } });
const plot = (ctx, key, style, height, label, children) => ctx.node({
  key,
  styles: [style],
  children: [ctx.node({
    key: `${key}/svg`, tag: 'svg', attrs: { viewBox: `0 0 ${PLOT_WIDTH} ${height}`, role: 'img', 'aria-label': label }, children,
  })],
});

// Cumulative spending by day: October so far against September and an even pace to the budget.
const PACE = {
  budget: 5000,
  days: 31,
  today: 7,
  current: [[0, 0], [1, 620], [2, 980], [3, 1392], [4, 1705], [5, 2310], [6, 2880], [7, 3450]],
  previous: [[0, 0], [1, 310], [3, 720], [5, 1180], [7, 1540], [10, 2120], [14, 2860], [18, 3420], [21, 3780], [25, 4260], [28, 4540], [30, 4760]],
};
const PACE_HEIGHT = 176;
const paceChart = (ctx) => {
  const top = 8;
  const bottom = PACE_HEIGHT - 24;
  const x = (day) => Math.round((day / PACE.days) * PLOT_WIDTH * 10) / 10;
  const y = (value) => Math.round((bottom - (value / PACE.budget) * (bottom - top)) * 10) / 10;
  const line = (points) => points.map(([day, value], i) => `${i ? 'L' : 'M'}${x(day)},${y(value)}`).join(' ');
  const [todayDay, todayValue] = PACE.current.at(-1);
  return plot(ctx, 'pace-plot', 'Charts/pace', PACE_HEIGHT, ctx.t('charts_pace_label'), [
    ...[[0, '0'], [2500, '2.5'], [5000, '5']].flatMap(([value, label]) => [
      svgLine(ctx, `pace-grid-${value}`, [0, y(value), PLOT_WIDTH, y(value)], 'colors.border.base'),
      svgText(ctx, `pace-grid-${value}/label`, value ? thousands(ctx, label) : label, { x: 0, y: y(value) - 4 }),
    ]),
    svgLine(ctx, 'pace-even', [x(0), y(0), x(PACE.days), y(PACE.budget)], 'colors.text.tertiary', 1.5, '4 4'),
    svgPath(ctx, 'pace-previous', line(PACE.previous), { stroke: { token: 'colors.border.strong' } }, {
      fill: 'none', 'stroke-width': 2, 'stroke-linecap': 'round', 'stroke-linejoin': 'round',
    }),
    svgPath(ctx, 'pace-area', `${line(PACE.current)} L${x(todayDay)},${y(0)} Z`, { fill: { token: 'colors.brand.primary', alpha: 0.1 } }),
    svgPath(ctx, 'pace-current', line(PACE.current), { stroke: { token: 'colors.brand.primary' } }, {
      fill: 'none', 'stroke-width': 2, 'stroke-linecap': 'round', 'stroke-linejoin': 'round',
    }),
    ctx.node({
      key: 'pace-today', tag: 'circle', bind: { fill: { token: 'colors.brand.primary' }, stroke: { token: 'colors.surface.base' } },
      attrs: { cx: x(todayDay), cy: y(todayValue), r: 5, 'stroke-width': 2 },
    }),
    svgText(ctx, 'pace-today/value', 'R$ 3.450', { x: x(todayDay) + 10, y: y(todayValue) - 2, font: 'typography.labelMedium', color: 'colors.text.primary' }),
    svgText(ctx, 'pace-axis-1', '1', { x: x(1), y: PACE_HEIGHT - 6, anchor: 'middle' }),
    svgText(ctx, 'pace-axis-today', ctx.t('charts_today'), { x: x(todayDay), y: PACE_HEIGHT - 6, anchor: 'middle', color: 'colors.text.primary' }),
    svgText(ctx, 'pace-axis-15', '15', { x: x(15), y: PACE_HEIGHT - 6, anchor: 'middle' }),
    svgText(ctx, 'pace-axis-31', '31', { x: PLOT_WIDTH, y: PACE_HEIGHT - 6, anchor: 'end' }),
  ]);
};

// Legend keys draw the series' own mark: a solid or dashed line in its color.
const legendKey = (ctx, key, labelKey, color, dashed) => ctx.node({
  key,
  styles: ['Charts/legendItem'],
  children: [
    ctx.node({ key: `${key}/mark`, styles: ['Charts/key', dashed && 'Charts/keyDashed'], bind: { 'border-color': { token: color } } }),
    text(ctx, `${key}/label`, 'Screen/tertiary', { textKey: labelKey }),
  ],
});

// Chart marks take the palette's light gradient in both modes: the dark one is a background and vanishes on a dark surface.
let gradientCount = 0;
const themeGradient = (ctx, key, [x1, y1, x2, y2], opacity = 1) => {
  const id = `${key}-${++gradientCount}`;
  const { css } = ctx.tokens.themed[`${ctx.settings.palette}/light`]['gradients.primary'];
  const stops = [...css.matchAll(/(#[0-9a-f]{6})\s+([\d.]+)%/gi)];
  return {
    fill: `url(#${id})`,
    defs: ctx.node({
      key,
      tag: 'linearGradient',
      attrs: { id, gradientUnits: 'userSpaceOnUse', x1, y1, x2, y2 },
      children: stops.map(([, color, offset], i) => ctx.node({
        key: `${key}/stop-${i}`, tag: 'stop', attrs: { offset: `${offset}%`, 'stop-color': color, 'stop-opacity': opacity },
      })),
    }),
  };
};
const fadeGradient = (ctx, key, top, bottom) => {
  const id = `${key}-${++gradientCount}`;
  return {
    fill: `url(#${id})`,
    defs: ctx.node({
      key,
      tag: 'linearGradient',
      attrs: { id, gradientUnits: 'userSpaceOnUse', x1: 0, y1: top, x2: 0, y2: bottom },
      children: [[0, 0.32], [100, 0]].map(([offset, opacity]) => ctx.node({
        key: `${key}/stop-${offset}`, tag: 'stop', bind: { 'stop-color': { token: 'colors.brand.primary' } },
        attrs: { offset: `${offset}%`, 'stop-opacity': opacity },
      })),
    }),
  };
};
// Columns fill with the gradient from the baseline up: the accent at full strength, the rest softened. The gradient
// runs past the plot's top, so the tallest column keeps a color that reads on the surface, and on a dark surface it
// also starts below the baseline, past the deepest stop.
const columnGradients = (ctx, key, top, bottom) => {
  const reach = top - (bottom - top) * 0.4;
  const start = bottom + (ctx.settings.mode === 'dark' ? (bottom - top) * 0.4 : 0);
  return {
    rest: themeGradient(ctx, `${key}-gradient`, [0, start, 0, reach], 0.55),
    accent: themeGradient(ctx, `${key}-gradient-accent`, [0, start, 0, reach]),
  };
};
// A line's gradient runs left to right, past the plot's end; on a dark surface it starts past the deepest stop.
const lineGradient = (ctx, key) => themeGradient(ctx, key, [ctx.settings.mode === 'dark' ? -PLOT_WIDTH * 0.4 : 0, 0, PLOT_WIDTH * 1.25, 0]);
// Columns with 4dp rounded caps, square at the baseline; `selected` adds the tooltip a tap shows.
const COLUMNS_HEIGHT = 176;
const columnChart = (ctx, key, { months, max, budget, budgetLabel, budgetEnd = false, accent, labelled = [], tooltip, label, hotspots = [], gradient = false }) => {
  const top = 28;
  const bottom = COLUMNS_HEIGHT - 24;
  const band = PLOT_WIDTH / months.length;
  const width = 24;
  const y = (value) => Math.round((bottom - (value / max) * (bottom - top)) * 10) / 10;
  const center = (i) => Math.round((band * i + band / 2) * 10) / 10;
  const column = (i, value) => {
    const left = center(i) - width / 2;
    const cap = y(value);
    return `M${left},${bottom} V${cap + 4} Q${left},${cap} ${left + 4},${cap} H${left + width - 4} Q${left + width},${cap} ${left + width},${cap + 4} V${bottom} Z`;
  };
  const fills = gradient && columnGradients(ctx, key, top, bottom);
  return plot(ctx, `${key}-plot`, 'Charts/columns', COLUMNS_HEIGHT, label, [
    fills && ctx.node({ key: `${key}-defs`, tag: 'defs', children: [fills.rest.defs, fills.accent.defs] }),
    svgLine(ctx, `${key}-baseline`, [0, bottom, PLOT_WIDTH, bottom], 'colors.border.base'),
    ...months.flatMap(({ month, value, caption }, i) => [
      value > 0 && ctx.node({
        key: `${key}-month-${month}`,
        tag: 'path',
        hotspot: hotspots.includes(i),
        bind: fills ? {} : { fill: i === accent ? { token: 'colors.brand.primary' } : { token: 'colors.text.tertiary', alpha: 0.28 } },
        attrs: { d: column(i, value), ...(fills && { fill: (i === accent ? fills.accent : fills.rest).fill }) },
      }),
      labelled.includes(i) && svgText(ctx, `${key}-month-${month}/value`, caption, {
        x: center(i), y: y(value) - 6, anchor: 'middle', font: 'typography.labelMedium', color: 'colors.text.primary',
      }),
      svgText(ctx, `${key}-month-${month}/label`, months[i].label ?? ctx.t(`charts_month_short_${month}`), {
        x: center(i), y: COLUMNS_HEIGHT - 6, anchor: 'middle', color: i === accent ? 'colors.text.primary' : 'colors.text.tertiary',
      }),
    ]),
    budget && svgLine(ctx, `${key}-budget`, [0, y(budget), PLOT_WIDTH, y(budget)], 'colors.text.tertiary'),
    budget && svgText(ctx, `${key}-budget/label`, budgetLabel, { x: budgetEnd ? PLOT_WIDTH : 0, y: y(budget) - 5, anchor: budgetEnd ? 'end' : 'start', color: 'colors.text.secondary' }),
    tooltip && (() => {
      const boxWidth = 120;
      const left = Math.min(Math.max(center(accent) - boxWidth / 2, 0), PLOT_WIDTH - boxWidth);
      const boxTop = Math.max(y(months[accent].value) - 52, 0);
      return ctx.node({
        key: `${key}-tooltip`,
        tag: 'g',
        children: [
          ctx.node({ key: `${key}-tooltip/box`, tag: 'rect', bind: { fill: { token: 'colors.text.primary' } }, attrs: { x: left, y: boxTop, width: boxWidth, height: 42, rx: 8 } }),
          svgText(ctx, `${key}-tooltip/title`, tooltip[0], { x: left + 10, y: boxTop + 18, font: 'typography.labelMedium', color: 'colors.surface.base' }),
          svgText(ctx, `${key}-tooltip/detail`, tooltip[1], { x: left + 10, y: boxTop + 34, color: 'colors.surface.base' }),
        ],
      });
    })(),
  ]);
};

const SHARES = [
  ['groceries', 'R$ 1.284,40', '37%', 'up', '4%'],
  ['restaurants', 'R$ 767,60', '22%', 'up', '18%'],
  ['transport', 'R$ 440,00', '13%', 'down', '18%'],
  ['health', 'R$ 388,00', '11%', 'up', '2%'],
  ['leisure', 'R$ 320,00', '9%', 'down', '6%'],
  ['bills', 'R$ 250,00', '7%', 'down', '1%'],
];
// Spending more than usual is the bad direction, so up reads as error and down as success; the arrow keeps it from being color alone.
const trend = (ctx, key, direction, value) => ctx.node({
  key,
  styles: ['Family/pending'],
  children: [
    icon(ctx, `${key}/icon`, `trending_${direction}`, 'xSmall', direction === 'up' ? 'colors.text.error' : 'colors.text.success'),
    ctx.node({ key: `${key}/text`, tag: 'span', textKey: 'charts_vs_average', textArgs: [`${direction === 'up' ? '+' : '−'}${value}`] }),
  ],
});
// The second line is the trend against the average unless a row brings its own detail.
const shareRow = (ctx, [category, amount, share, direction, change], detail = trend(ctx, `share-${category}/trend`, direction, change)) => ctx.node({
  key: `share-${category}`,
  styles: ['Family/row'],
  hotspot: true,
  attrs: { role: 'button', tabindex: 0 },
  children: [
    badge(ctx, `share-${category}/badge`, category, { small: true }),
    ctx.node({
      key: `share-${category}/info`,
      styles: ['Family/info'],
      children: [
        text(ctx, `share-${category}/name`, 'Family/name', { textKey: `home_category_${category}` }, clipped('Family/name')),
        detail,
      ],
    }),
    ctx.node({
      key: `share-${category}/trailing`,
      styles: ['Home/trailing'],
      children: [
        text(ctx, `share-${category}/amount`, 'Home/amount', { text: amount }),
        text(ctx, `share-${category}/share`, 'Screen/tertiary', { text: share }),
      ],
    }),
  ],
});
const shareBar = (ctx, key, shares) => ctx.node({
  key: `${key}/bar-row`,
  styles: ['Home/cardBody'],
  children: [ctx.node({
    key: `${key}/bar`,
    styles: ['Home/split', 'Charts/split'],
    children: shares.map(([category, share]) => ctx.node({
      key: `${key}/bar/${category}`,
      styles: [`Home/grow/${share}`],
      bind: { background: { token: CATEGORIES[category].color ?? OTHER_ARC } },
    })),
  })],
});
const categoriesCard = (ctx) => OrbitCard(ctx, { key: 'shares', variant: 'Base' }, [
  shareBar(ctx, 'shares', [['groceries', 37], ['restaurants', 22], ['transport', 13], ['other', 28]]),
  ...SHARES.flatMap((row, i) => [i > 0 && HorizontalDivider(ctx, { key: `shares/divider-${i}` }), shareRow(ctx, row)]),
]);

const MONTHS = [[5, 4210], [6, 4890], [7, 5320], [8, 4450], [9, 4760], [10, 3450]];
const monthsCard = (ctx) => OrbitCard(ctx, { key: 'months', variant: 'Base' }, [
  ctx.node({
    key: 'months/body',
    styles: ['Home/cardBody'],
    children: [
      columnChart(ctx, 'months', {
        months: MONTHS.map(([month, value]) => ({ month, value, caption: thousands(ctx, String(value / 1000)) })),
        max: 6000,
        budget: 5000,
        budgetLabel: `${ctx.t('charts_budget')} ${thousands(ctx, '5')}`,
        accent: MONTHS.length - 1,
        labelled: [2, MONTHS.length - 1],
        label: ctx.t('charts_months_label'),
      }),
      ctx.node({
        key: 'months/footer',
        styles: ['Home/spread'],
        children: [
          text(ctx, 'months/average', 'Screen/secondary', { textKey: 'charts_average_month', textArgs: ['R$ 4.726'] }),
          status(ctx, 'months/over', 'triangle_alert', 'colors.text.warning', 'charts_over_months', ['1']),
        ],
      }),
    ],
  }),
]);

const insightRow = (ctx, key, glyph, tone, title, detail) => ctx.node({
  key,
  styles: ['Home/attentionRow'],
  hotspot: true,
  children: [
    ctx.node({ key: `${key}/badge`, styles: [`Charts/${tone}Badge`], children: [icon(ctx, `${key}/icon`, glyph, 'medium', `colors.direction.${tone === 'good' ? 'gain' : tone}`)] }),
    ctx.node({
      key: `${key}/info`,
      styles: ['Family/info'],
      children: [text(ctx, `${key}/title`, 'Family/name', title), text(ctx, `${key}/detail`, 'Screen/tertiary', detail, clipped('Screen/tertiary'))],
    }),
    chevron(ctx, key),
  ],
});
const insightsCard = (ctx) => OrbitCard(ctx, { key: 'insights', variant: 'Base' }, [
  attentionRow(
    ctx, 'insight-restaurants', 'triangle_alert',
    { textKey: 'home_attention_over', textArgs: [ctx.t('home_category_restaurants'), 'R$ 67,60'] },
    { textKey: 'home_attention_budgeted', textArgs: ['R$ 767,60', 'R$ 700,00'] },
  ),
  HorizontalDivider(ctx, { key: 'insights/divider-1' }),
  insightRow(ctx, 'insight-transport', 'trending_down', 'good', { textKey: 'charts_insight_transport' }, { textKey: 'charts_insight_transport_detail' }),
  HorizontalDivider(ctx, { key: 'insights/divider-2' }),
  insightRow(ctx, 'insight-day', 'calendar_days', 'info', { textKey: 'charts_insight_day' }, { textKey: 'charts_insight_day_detail' }),
]);

const paceCard = (ctx) => OrbitCard(ctx, { key: 'hero', variant: 'Base' }, [
  ctx.node({
    key: 'hero/content',
    styles: ['Home/hero'],
    children: [
      ctx.node({
        key: 'hero/top',
        styles: ['Home/spread'],
        children: [
          text(ctx, 'hero/eyebrow', 'Screen/eyebrow', { textKey: 'charts_spent_eyebrow' }),
          ctx.node({
            key: 'hero/delta',
            styles: ['Charts/deltaUp'],
            children: [
              icon(ctx, 'hero/delta/icon', 'trending_up', 'xSmall', 'colors.text.error'),
              ctx.node({ key: 'hero/delta/text', tag: 'span', textKey: 'charts_vs_last', textArgs: ['R$ 1.910'] }),
            ],
          }),
        ],
      }),
      text(ctx, 'hero/amount', 'OrbitCard/amount', { text: 'R$ 3.450,00' }),
      ctx.node({
        key: 'stats',
        styles: ['Home/stats', 'Charts/stats'],
        children: [
          stat(ctx, 'stat-daily', 'charts_daily_average', { text: 'R$ 492,86' }),
          stat(ctx, 'stat-biggest', 'charts_biggest_day', { text: 'R$ 412,30' }),
          stat(ctx, 'stat-purchases', 'charts_purchases', { text: '48' }),
        ],
      }),
      HorizontalDivider(ctx, { key: 'hero/divider' }),
      gap(ctx, 'hero/gap-pace', 'spacing.xxSmall'),
      ctx.node({
        key: 'pace-header',
        styles: ['Home/spread'],
        children: [
          text(ctx, 'pace-title', 'Family/name', { textKey: 'charts_pace_title' }),
          text(ctx, 'pace-caption', 'Screen/tertiary', { textKey: 'charts_pace_caption', textArgs: ['R$ 2.321'] }),
        ],
      }),
      ctx.node({
        key: 'pace-legend',
        styles: ['Charts/legend'],
        children: [
          legendKey(ctx, 'legend-current', 'charts_legend_this_month', 'colors.brand.primary'),
          legendKey(ctx, 'legend-previous', 'charts_legend_last_month', 'colors.border.strong'),
          legendKey(ctx, 'legend-even', 'charts_legend_even', 'colors.text.tertiary', true),
        ],
      }),
      paceChart(ctx),
    ],
  }),
]);

const charts = frame('charts', 'Charts', { status: 'proposed', spec: 'docs/specs/charts.md' }, (ctx) => screenFrame(ctx, [
  ctx.node({
    key: 'content',
    styles: ['Home/scroll'],
    children: [
      gap(ctx, 'gap-top', 'spacing.xxLarge'),
      ctx.node({
        key: 'header',
        styles: ['Home/spread', 'Home/inset'],
        children: [ctx.node({
          key: 'header/text',
          styles: ['Home/headerText'],
          children: [
            ctx.node({
              key: 'month',
              tag: 'button',
              styles: ['Home/monthRow'],
              hotspot: true,
              children: [
                text(ctx, 'month/title', 'Screen/eyebrow', { textKey: 'home_month_eyebrow' }),
                icon(ctx, 'month/chevron', 'chevron_down', 'xSmall', 'colors.text.secondary'),
              ],
            }),
            gap(ctx, 'gap-month', 'spacing.xxxSmall'),
            text(ctx, 'title', 'SignIn/title', { textKey: 'charts_title' }),
          ],
        })],
      }),
      gap(ctx, 'gap-header', 'spacing.small'),
      inset(ctx, 'periods/inset', ctx.node({
        key: 'periods',
        styles: ['Charts/periods'],
        attrs: { role: 'group', 'aria-label': ctx.t('charts_periods') },
        children: ['week', 'month', 'year'].map((period) => OrbitFilterChip(ctx, {
          key: `period-${period}`,
          labelKey: `charts_period_${period}`,
          selected: period === 'month',
          hotspot: true,
          styles: ['Settings/option'],
          attrs: { role: 'button', 'aria-pressed': period === 'month', tabindex: 0 },
        })),
      })),
      gap(ctx, 'gap-periods', 'spacing.medium'),
      inset(ctx, 'hero/inset', paceCard(ctx)),
      gap(ctx, 'gap-hero', 'spacing.large'),
      ...section(ctx, 'categories', sectionHeader(ctx, 'categories-header', 'charts_categories_eyebrow'), categoriesCard(ctx)),
      gap(ctx, 'gap-categories', 'spacing.large'),
      ...section(ctx, 'months', sectionHeader(ctx, 'months-header', 'charts_months_eyebrow'), monthsCard(ctx)),
      gap(ctx, 'gap-months', 'spacing.large'),
      ...section(ctx, 'family', sectionHeader(ctx, 'family-header', 'home_family_eyebrow'), familyCard(ctx)),
      gap(ctx, 'gap-family', 'spacing.large'),
      ...section(ctx, 'insights', sectionHeader(ctx, 'insights-header', 'charts_insights_eyebrow'), insightsCard(ctx)),
      gap(ctx, 'gap-bottom', 'spacing.large'),
    ],
  }),
  mainNav(ctx, MAIN_NAV.charts),
]));

// Opened from a category on Charts: Restaurants with its months, places and expenses; August is tapped to show its tooltip.
const RESTAURANT_MONTHS = [[5, 540], [6, 620], [7, 810], [8, 612.3], [9, 690], [10, 767.6]];
const PLACES = [
  ['ifood', 'iFood', 9, 'R$ 312,40', 1],
  ['outback', 'Outback', 2, 'R$ 186,90', 0.6],
  ['padaria', 'Padaria Real', 6, 'R$ 142,30', 0.46],
  ['others', null, 5, 'R$ 126,00', 0.4],
];
const RESTAURANT_EXPENSES = [
  ['ifood', 'iFood', 'restaurants', 'home_yesterday', null, 'R$ 68,50'],
  ['outback', 'Outback', 'restaurants', 'home_yesterday', 'Marina', 'R$ 186,90'],
  ['padaria', 'Padaria Real', 'restaurants', 'home_today', null, 'R$ 23,40'],
];
const placeRow = (ctx, [key, name, count, amount, share]) => ctx.node({
  key: `place-${key}`,
  styles: ['Charts/place'],
  children: [
    ctx.node({
      key: `place-${key}/top`,
      styles: ['Home/spread'],
      children: [
        ctx.node({
          key: `place-${key}/info`,
          styles: ['Family/info'],
          children: [
            text(ctx, `place-${key}/name`, 'Family/name', name ? { text: name } : { textKey: 'home_category_other' }, clipped('Family/name')),
            text(ctx, `place-${key}/count`, 'Screen/tertiary', { textKey: 'charts_tooltip_purchases', textArgs: [count] }),
          ],
        }),
        text(ctx, `place-${key}/amount`, 'Home/amount', { text: amount }),
      ],
    }),
    OrbitLinearProgressIndicator(ctx, { key: `place-${key}/bar`, progress: share, status: 'Primary', styles: ['Home/track'] }),
  ],
});

const chartsCategory = frame('charts-category', 'Charts · Restaurants', { status: 'proposed', spec: 'docs/specs/charts.md' }, (ctx) => screenFrame(ctx, [
  content(ctx, [
    ctx.node({ key: 'toolbar', styles: ['Screen/toolbar'], children: [backButton(ctx)] }),
    gap(ctx, 'gap-toolbar', 'spacing.xxSmall'),
    ctx.node({
      key: 'title-row',
      styles: ['Charts/titleRow'],
      children: [
        badge(ctx, 'title/badge', 'restaurants'),
        ctx.node({
          key: 'title/text',
          styles: ['Family/info'],
          children: [
            text(ctx, 'title', 'SignIn/title', { textKey: 'home_category_restaurants' }),
            text(ctx, 'subtitle', 'Screen/secondary', { textKey: 'home_month' }),
          ],
        }),
      ],
    }),
    gap(ctx, 'gap-title', 'spacing.medium'),
    OrbitCard(ctx, { key: 'summary', variant: 'Base', styles: ['Charts/card'] }, [
      ctx.node({
        key: 'summary/body',
        styles: ['Home/cardBody'],
        children: [
          ctx.node({
            key: 'summary/amounts',
            styles: ['Home/goalAmounts'],
            children: [
              text(ctx, 'summary/spent', 'OrbitCard/amount', { text: 'R$ 767,60' }),
              text(ctx, 'summary/budget', 'Screen/secondary', { textKey: 'home_of', textArgs: ['R$ 700,00'] }),
            ],
          }),
          OrbitLinearProgressIndicator(ctx, { key: 'summary/progress', progress: 1, status: 'Error', styles: ['Home/track'] }),
          ctx.node({
            key: 'summary/footer',
            styles: ['Home/spread'],
            children: [
              status(ctx, 'summary/over', 'triangle_alert', 'colors.text.error', 'home_over', ['R$ 67,60']),
              trend(ctx, 'summary/trend', 'up', '18%'),
            ],
          }),
        ],
      }),
    ]),
    gap(ctx, 'gap-summary', 'spacing.large'),
    text(ctx, 'months-eyebrow', 'Screen/eyebrow', { textKey: 'charts_restaurants_eyebrow' }),
    gap(ctx, 'gap-months-eyebrow', 'spacing.xxSmall'),
    OrbitCard(ctx, { key: 'months', variant: 'Base', styles: ['Charts/card'] }, [
      ctx.node({
        key: 'months/body',
        styles: ['Home/cardBody'],
        children: [columnChart(ctx, 'restaurant-months', {
          months: RESTAURANT_MONTHS.map(([month, value]) => ({ month, value })),
          max: 900,
          budget: 700,
          budgetLabel: ctx.t('charts_category_budget', 'R$ 700'),
          accent: 3,
          tooltip: [`${ctx.t('charts_month_short_8')} · R$ 612,30`, ctx.t('charts_tooltip_purchases', 14)],
          label: ctx.t('charts_months_label'),
        })],
      }),
    ]),
    gap(ctx, 'gap-months', 'spacing.large'),
    text(ctx, 'places-eyebrow', 'Screen/eyebrow', { textKey: 'charts_top_places_eyebrow' }),
    gap(ctx, 'gap-places-eyebrow', 'spacing.xxSmall'),
    OrbitCard(ctx, { key: 'places', variant: 'Base', styles: ['Charts/card'] }, PLACES.flatMap((row, i) => [i > 0 && HorizontalDivider(ctx, { key: `places/divider-${i}` }), placeRow(ctx, row)])),
    gap(ctx, 'gap-places', 'spacing.large'),
    text(ctx, 'recent-eyebrow', 'Screen/eyebrow', { textKey: 'home_recent_eyebrow' }),
    gap(ctx, 'gap-recent-eyebrow', 'spacing.xxSmall'),
    OrbitCard(ctx, { key: 'recent', variant: 'Base', styles: ['Charts/card'] }, RESTAURANT_EXPENSES.flatMap((row, i) => [i > 0 && HorizontalDivider(ctx, { key: `recent/divider-${i}` }), expense(ctx, row)])),
  ]),
]));

const PALETTES = ['spruce', 'indigo', 'plum', 'orchid', 'flamingo', 'azure', 'ember', 'graphite'];
const MODES = ['system', 'light', 'dark'];

// Each Settings row: a neutral icon badge, a title with an optional detail line, and a chevron unless `trailing` says otherwise.
const settingsRow = (ctx, key, glyph, titleKey, { detail, trailing, hotspot = true, leading } = {}) => ctx.node({
  key,
  styles: ['Family/row'],
  hotspot,
  attrs: hotspot ? { role: 'button', tabindex: 0 } : {},
  children: [
    leading ?? ctx.node({
      key: `${key}/badge`,
      styles: ['Home/badgeSmall'],
      bind: { background: { token: 'colors.surface.sunken' } },
      children: [icon(ctx, `${key}/icon`, glyph, 'small', NEUTRAL)],
    }),
    ctx.node({
      key: `${key}/info`,
      styles: ['Family/info'],
      children: [
        text(ctx, `${key}/title`, 'Family/name', typeof titleKey === 'string' ? { textKey: titleKey } : titleKey, clipped('Family/name')),
        detail && text(ctx, `${key}/detail`, 'Screen/tertiary', detail, clipped('Screen/tertiary')),
      ],
    }),
    trailing === undefined ? chevron(ctx, key) : trailing,
  ],
});
const settingsCard = (ctx, key, rows) => OrbitCard(ctx, { key, variant: 'Base' }, rows.flatMap((row, i) => [
  i > 0 && HorizontalDivider(ctx, { key: `${key}/divider-${i}` }),
  row,
]));
const settingsSection = (ctx, key, eyebrowKey, rows) => [
  ...section(ctx, key, sectionHeader(ctx, `${key}-header`, eyebrowKey), settingsCard(ctx, key, rows)),
  gap(ctx, `${key}/gap-after`, 'spacing.large'),
];
const paletteMark = (ctx, key, palette) => ctx.node({ key, styles: ['Settings/mark', `Settings/mark/${palette}`] });

const accountCard = (ctx) => OrbitCard(ctx, { key: 'account-card', variant: 'Base' }, [
  ctx.node({
    key: 'account',
    styles: ['Family/row', 'Settings/accountRow'],
    hotspot: true,
    attrs: { role: 'button', tabindex: 0, 'aria-label': ctx.t('profile_title') },
    children: [
      text(ctx, 'account/avatar', 'Family/avatar', { text: 'A' }, { styles: ['Family/avatar', 'Settings/avatar'] }),
      ctx.node({
        key: 'account/info',
        styles: ['Family/info'],
        children: [
          text(ctx, 'account/name', 'Home/cardTitle', { text: 'Ana Souza' }, clipped('Home/cardTitle')),
          text(ctx, 'account/email', 'Screen/secondary', { text: 'ana@example.com' }, clipped('Screen/secondary')),
        ],
      }),
      chevron(ctx, 'account'),
    ],
  }),
]);

const darkMode = (ctx) => ctx.node({
  key: 'dark-mode',
  styles: ['Settings/stack'],
  children: [
    settingsRow(ctx, 'dark-mode-row', 'moon', 'settings_dark_mode', { trailing: null, hotspot: false }),
    ctx.node({
      key: 'dark-mode-options',
      styles: ['Settings/options'],
      attrs: { role: 'group', 'aria-label': ctx.t('settings_dark_mode_options') },
      children: MODES.map((mode, i) => OrbitFilterChip(ctx, {
        key: `mode-${mode}`,
        labelKey: `settings_mode_${mode}`,
        selected: i === 0,
        hotspot: true,
        styles: ['Settings/option'],
        attrs: { role: 'button', 'aria-pressed': i === 0, tabindex: 0 },
      })),
    }),
  ],
});

// The tab reached from the navigation bar: everything that supports the app rather than tracking expenses.
const settings = frame('settings', 'Settings', { status: 'proposed', spec: 'docs/specs/settings.md' }, (ctx) => screenFrame(ctx, [
  ctx.node({
    key: 'content',
    styles: ['Home/scroll'],
    children: [
      gap(ctx, 'gap-top', 'spacing.xxLarge'),
      inset(ctx, 'title/inset', text(ctx, 'title', 'SignIn/title', { textKey: 'settings_title' })),
      gap(ctx, 'gap-title', 'spacing.medium'),
      inset(ctx, 'account/inset', accountCard(ctx)),
      gap(ctx, 'gap-account', 'spacing.large'),
      ...settingsSection(ctx, 'appearance', 'settings_appearance_eyebrow', [
        settingsRow(ctx, 'theme', 'palette', 'settings_theme', {
          detail: { textKey: `settings_palette_${ctx.settings.palette}` },
          trailing: ctx.node({
            key: 'theme/trailing',
            styles: ['Settings/trailing'],
            children: [paletteMark(ctx, 'theme/mark', ctx.settings.palette), chevron(ctx, 'theme')],
          }),
        }),
        darkMode(ctx),
      ]),
      ...settingsSection(ctx, 'family', 'settings_family_eyebrow', [
        settingsRow(ctx, 'family-members', 'users', 'settings_family_members', {
          detail: { textKey: 'settings_family_members_detail', textArgs: ['2', '1'] },
        }),
        settingsRow(ctx, 'invite', 'share', 'settings_invite', { detail: { textKey: 'settings_invite_detail' } }),
      ]),
      ...settingsSection(ctx, 'connections', 'settings_connections_eyebrow', [
        settingsRow(ctx, 'connectors', 'plug', 'settings_connectors', {
          detail: { textKey: 'settings_connectors_detail', textArgs: ['4'] },
        }),
      ]),
      ...settingsSection(ctx, 'preferences', 'settings_preferences_eyebrow', [
        settingsRow(ctx, 'language', 'languages', 'settings_language', { detail: { textKey: 'settings_language_value' } }),
        settingsRow(ctx, 'currency', 'banknote', 'settings_currency', { detail: { textKey: 'settings_currency_value' } }),
        settingsRow(ctx, 'notifications', 'bell', 'settings_notifications', { detail: { textKey: 'settings_notifications_detail' } }),
      ]),
      ...settingsSection(ctx, 'security', 'settings_security_eyebrow', [
        settingsRow(ctx, 'app-lock', 'lock', 'settings_app_lock', { detail: { textKey: 'settings_app_lock_detail' } }),
        settingsRow(ctx, 'export', 'download', 'settings_export', { detail: { textKey: 'settings_export_detail' } }),
      ]),
      ...settingsSection(ctx, 'about', 'settings_about_eyebrow', [
        settingsRow(ctx, 'help', 'circle_help', 'settings_help'),
        settingsRow(ctx, 'terms', 'file_text', 'settings_terms'),
        settingsRow(ctx, 'privacy', 'shield_check', 'sign_in_privacy_policy'),
      ]),
      inset(ctx, 'sign-out/inset', OrbitButton(ctx, { key: 'sign-out', variant: 'Outlined', hotspot: true, styles: ['Screen/fill'] }, [
        icon(ctx, 'sign-out/icon', 'log_out', 'medium', 'colors.text.error', ['Screen/leadingIcon']),
        label(ctx, 'sign-out/label', { textKey: 'settings_sign_out' }, 'Settings/danger'),
      ])),
      gap(ctx, 'gap-sign-out', 'spacing.small'),
      text(ctx, 'version', 'Settings/version', { textKey: 'settings_version', textArgs: ['1.0.0 (42)'] }),
      gap(ctx, 'gap-bottom', 'spacing.large'),
    ],
  }),
  mainNav(ctx, MAIN_NAV.settings),
]));

// A bottom sheet over another frame, like the month picker over Home.
const sheetFrame = (id, name, spec, background, sheetKey, labelKey, content) => frame(id, name, { status: 'proposed', spec }, (ctx) => ctx.node({
  key: `${sheetKey}-frame`,
  styles: ['OrbitScaffold'],
  children: [
    ctx.node({
      key: `${sheetKey}-background`,
      styles: ['MonthPicker/background'],
      attrs: { inert: '', 'aria-hidden': 'true' },
      children: [background.render(ctx)],
    }),
    OrbitBottomSheet(ctx, {
      key: sheetKey,
      attrs: { role: 'dialog', 'aria-modal': 'true', 'aria-label': typeof labelKey === 'function' ? labelKey(ctx) : ctx.t(labelKey) },
    }, [ctx.node({ key: `${sheetKey}-content`, styles: ['Screen/content'], children: content(ctx) })]),
  ],
}));
const settingsSheet = (id, name, sheetKey, labelKey, content) => sheetFrame(id, name, 'docs/specs/settings.md', settings, sheetKey, labelKey, content);

const paletteOption = (ctx, palette) => {
  const selected = palette === ctx.settings.palette;
  return ctx.node({
    key: `palette-${palette}`,
    styles: ['Settings/palette', selected && 'Settings/paletteSelected'],
    hotspot: true,
    attrs: { role: 'radio', 'aria-checked': String(selected), tabindex: 0 },
    children: [
      paletteMark(ctx, `palette-${palette}/mark`, palette),
      text(ctx, `palette-${palette}/name`, 'Settings/paletteName', { textKey: `settings_palette_${palette}` }, clipped('Settings/paletteName')),
    ],
  });
};

const settingsTheme = settingsSheet('settings-theme', 'Settings · Theme', 'theme-sheet', 'settings_theme', (ctx) => [
  ctx.node({
    key: 'theme-header',
    styles: ['Home/spread'],
    children: [
      text(ctx, 'theme-title', 'SignIn/title', { textKey: 'settings_theme' }),
      OrbitIconButton(ctx, { key: 'theme-close', hotspot: true, contentDescription: ctx.t('home_picker_close') }, [
        icon(ctx, 'theme-close/icon', 'x', 'medium', 'colors.text.secondary'),
      ]),
    ],
  }),
  gap(ctx, 'theme-gap-title', 'spacing.xxSmall'),
  text(ctx, 'theme-guidance', 'Screen/guidance', { textKey: 'settings_theme_guidance' }),
  gap(ctx, 'theme-gap-guidance', 'spacing.medium'),
  ctx.node({
    key: 'palettes',
    styles: ['MonthPicker/grid'],
    attrs: { role: 'radiogroup', 'aria-label': ctx.t('settings_theme_palettes') },
    children: [PALETTES.slice(0, 4), PALETTES.slice(4)].map((row, i) => ctx.node({
      key: `palettes-row-${i}`,
      styles: ['Home/gridRow'],
      children: row.map((palette) => paletteOption(ctx, palette)),
    })),
  }),
  gap(ctx, 'theme-gap-apply', 'spacing.large'),
  OrbitButton(ctx, { key: 'theme-apply', hotspot: true, styles: ['Screen/fill'] }, [
    label(ctx, 'theme-apply/label', { textKey: 'settings_theme_apply' }),
  ]),
]);

const settingsSignOut = settingsSheet('settings-sign-out', 'Settings · Sign out', 'sign-out-sheet', 'settings_sign_out_title', (ctx) => [
  ctx.node({
    key: 'sign-out-badge',
    styles: ['EmailSent/badge', 'Settings/dangerBadge'],
    children: [icon(ctx, 'sign-out-badge/icon', 'log_out', 'xLarge', 'colors.text.error')],
  }),
  gap(ctx, 'sign-out-gap-badge', 'spacing.medium'),
  text(ctx, 'sign-out-title', 'SignIn/title', { textKey: 'settings_sign_out_title' }),
  gap(ctx, 'sign-out-gap-title', 'spacing.xxSmall'),
  text(ctx, 'sign-out-body', 'Screen/guidance', { textKey: 'settings_sign_out_body' }),
  gap(ctx, 'sign-out-gap-body', 'spacing.large'),
  actions(ctx, [
    OrbitButton(ctx, { key: 'sign-out-confirm', variant: 'Destructive', hotspot: true, styles: ['Screen/fill'] }, [
      label(ctx, 'sign-out-confirm/label', { textKey: 'settings_sign_out' }),
    ]),
    textButton(ctx, 'sign-out-cancel', 'settings_sign_out_cancel'),
  ]),
]);

// Pluggy once it's connected, opened from its row on Connectors: what Orbit saved, Edit credentials and Disconnect.
const PLUGGY_SPEC = 'docs/specs/pluggy-disconnect.md';
const credential = (ctx, key, glyph, titleKey, detail) => settingsRow(ctx, key, glyph, titleKey, { detail, trailing: null, hotspot: false });
const pluggy = frame('pluggy', 'Connectors · Pluggy', { status: 'proposed', spec: PLUGGY_SPEC }, (ctx) => screenFrame(ctx, [
  content(ctx, [
    ...header(ctx, 'pluggy_title', 'pluggy_guidance', ctx.node({
      key: 'badge', styles: ['EmailSent/badge'], children: [icon(ctx, 'badge/icon', 'plug', 'xLarge', 'colors.text.brand')],
    }), status(ctx, 'pluggy/status', 'circle_check', 'colors.text.success', 'connectors_connected', ['4'])),
    text(ctx, 'eyebrow', 'Screen/eyebrow', { textKey: 'pluggy_credentials_eyebrow' }),
    gap(ctx, 'gap-eyebrow', 'spacing.xxSmall'),
    OrbitCard(ctx, { key: 'credentials', variant: 'Base', styles: ['Institutions/list'] }, [
      credential(ctx, 'client-id', 'key_round', 'pluggy_client_id_label', { text: '8f3c2a71-5d4e-4b9a-a1c6-2e7f90b3d415' }),
      credential(ctx, 'client-secret', 'lock', 'pluggy_client_secret_label', { textKey: 'pluggy_secret_saved' }),
      settingsRow(ctx, 'edit', 'pencil', 'pluggy_edit'),
    ].flatMap((row, i) => [i > 0 && HorizontalDivider(ctx, { key: `credentials/divider-${i}` }), row])),
    ctx.node({
      key: 'note',
      styles: ['Family/note'],
      children: [
        icon(ctx, 'note/icon', 'landmark', 'medium', 'colors.text.tertiary'),
        ctx.node({ key: 'note/text', textKey: 'pluggy_note' }),
      ],
    }),
    ctx.node({ key: 'spacer', styles: ['Screen/grow'] }),
    actions(ctx, [
      OrbitButton(ctx, { key: 'disconnect', variant: 'Outlined', hotspot: true, styles: ['Screen/fill'] }, [
        icon(ctx, 'disconnect/icon', 'unplug', 'medium', 'colors.text.error', ['Screen/leadingIcon']),
        label(ctx, 'disconnect/label', { textKey: 'pluggy_disconnect' }, 'Settings/danger'),
      ]),
    ]),
  ]),
]));

const pluggyDisconnectSheet = (id, name, deleteData) => sheetFrame(id, name, PLUGGY_SPEC, pluggy, 'disconnect-sheet',
  'pluggy_disconnect_title', (ctx) => [
    ctx.node({
      key: 'disconnect-badge',
      styles: ['EmailSent/badge', 'Settings/dangerBadge'],
      children: [icon(ctx, 'disconnect-badge/icon', 'unplug', 'xLarge', 'colors.text.error')],
    }),
    gap(ctx, 'disconnect-gap-badge', 'spacing.medium'),
    text(ctx, 'disconnect-title', 'SignIn/title', { textKey: 'pluggy_disconnect_title' }),
    gap(ctx, 'disconnect-gap-title', 'spacing.xxSmall'),
    text(ctx, 'disconnect-body', 'Screen/guidance', { textKey: 'pluggy_disconnect_body', textArgs: ['4'] }),
    gap(ctx, 'disconnect-gap-body', 'spacing.large'),
    text(ctx, 'disconnect-data-eyebrow', 'Screen/eyebrow', { textKey: 'pluggy_disconnect_data_eyebrow' }),
    gap(ctx, 'disconnect-gap-eyebrow', 'spacing.xxSmall'),
    ctx.node({
      key: 'disconnect-data',
      styles: ['Settings/stack'],
      attrs: { role: 'radiogroup', 'aria-label': ctx.t('pluggy_disconnect_data_eyebrow') },
      children: [
        settingsRow(ctx, 'disconnect-keep', 'shield_check', 'pluggy_disconnect_keep', {
          detail: { textKey: 'pluggy_disconnect_keep_detail' },
          trailing: deleteData ? null : icon(ctx, 'disconnect-keep/check', 'check', 'medium', 'colors.text.brand'),
        }),
        settingsRow(ctx, 'disconnect-delete', 'trash', 'pluggy_disconnect_delete', {
          detail: { textKey: 'pluggy_disconnect_delete_detail' },
          trailing: deleteData ? icon(ctx, 'disconnect-delete/check', 'check', 'medium', 'colors.text.brand') : null,
        }),
      ],
    }),
    gap(ctx, 'disconnect-gap-data', 'spacing.large'),
    // Not actions(): the Pluggy screen behind the sheet already has a node keyed `actions`.
    ctx.node({
      key: 'disconnect-actions',
      styles: ['Screen/actions'],
      children: [
        OrbitButton(ctx, { key: 'disconnect-confirm', variant: 'Destructive', hotspot: true, styles: ['Screen/fill'] }, [
          label(ctx, 'disconnect-confirm/label', { textKey: deleteData ? 'pluggy_disconnect_confirm_delete' : 'pluggy_disconnect_confirm' }),
        ]),
        textButton(ctx, 'disconnect-cancel', 'pluggy_disconnect_cancel'),
      ],
    }),
  ]);
const pluggyDisconnect = pluggyDisconnectSheet('pluggy-disconnect', 'Connectors · Pluggy · Disconnect', false);
const pluggyDisconnectDelete = pluggyDisconnectSheet('pluggy-disconnect-delete', 'Connectors · Pluggy · Disconnect · Delete data', true);

// How connecting a bank works, from Choose a bank or Connect bank: the bank is added in MeuPluggy, shared with the user's
// Pluggy application through the MeuPluggy connector, and that Item's ID is what Orbit asks for.
const bankHelpSheet = (id, name, background) => sheetFrame(id, name, BANK_SPEC, background, 'bank-help-sheet', 'bank_help_title', (ctx) => [
  ctx.node({
    key: 'bank-help-header',
    styles: ['Home/spread'],
    children: [
      text(ctx, 'bank-help-title', 'SignIn/title', { textKey: 'bank_help_title' }),
      OrbitIconButton(ctx, { key: 'bank-help-close', hotspot: true, contentDescription: ctx.t('home_picker_close') }, [
        icon(ctx, 'bank-help-close/icon', 'x', 'medium', 'colors.text.secondary'),
      ]),
    ],
  }),
  gap(ctx, 'bank-help-gap-title', 'spacing.xxSmall'),
  text(ctx, 'bank-help-intro', 'Screen/guidance', { textKey: 'bank_help_intro' }),
  gap(ctx, 'bank-help-gap-intro', 'spacing.small'),
  helpPoint(ctx, 'bank-help-meupluggy', 'landmark', 'bank_help_meupluggy_title', 'bank_help_meupluggy_body'),
  helpPoint(ctx, 'bank-help-dashboard', 'plug', 'bank_help_dashboard_title', 'bank_help_dashboard_body'),
  helpPoint(ctx, 'bank-help-copy', 'copy', 'bank_help_copy_title', 'bank_help_copy_body'),
  ctx.node({
    key: 'bank-help-note',
    styles: ['Family/note'],
    children: [
      icon(ctx, 'bank-help-note/icon', 'circle_help', 'medium', 'colors.text.tertiary'),
      ctx.node({ key: 'bank-help-note/text', textKey: 'bank_help_note' }),
    ],
  }),
  gap(ctx, 'bank-help-gap-button', 'spacing.small'),
  OrbitButton(ctx, { key: 'bank-help-done', hotspot: true, styles: ['Screen/fill'] }, [
    label(ctx, 'bank-help-done/label', { textKey: 'bank_help_done' }),
  ]),
]);
const chooseBankHelp = bankHelpSheet('connectors-choose-bank-help', 'Connectors · Choose a bank · How it works', connectorsInstitutions);
const connectBankHelp = bankHelpSheet('connectors-connect-bank-help', 'Connectors · Connect bank · How it works', connectBank);

// Profile: who you are in Orbit, opened from the account card in Settings. It sits one level below the Settings tab,
// so it hides the navigation bar and goes back with Back, like the Transaction screen.
const PROFILE_SPEC = 'docs/specs/profile.md';
const googleBadge = (ctx) => ctx.node({
  key: 'google/badge',
  styles: ['Home/badgeSmall'],
  bind: { background: { token: 'colors.surface.sunken' } },
  children: [ctx.node({ key: 'google/logo', styles: ['SignIn/googleIcon', 'Profile/google'] })],
});
const avatarStack = (ctx, key, initials) => ctx.node({
  key,
  styles: ['Profile/stack'],
  children: initials.map((initial, i) => text(ctx, `${key}/${i}`, 'Family/avatar', { text: initial }, { styles: ['Family/avatar', i > 0 && 'Profile/stacked'] })),
});

// The sign-in rows follow how the user signs in: with an email and password they can change the password and connect
// Google; with Google only, Google is connected and they can add a password.
const passwordRow = (ctx, google) => (google
  ? settingsRow(ctx, 'password', 'key_round', 'profile_password', {
    detail: { textKey: 'profile_password_none' },
    hotspot: false,
    trailing: textButton(ctx, 'password-add', 'profile_password_add', []),
  })
  : settingsRow(ctx, 'password', 'key_round', 'profile_password', { detail: { textKey: 'profile_password_detail' } }));
const googleRow = (ctx, google) => settingsRow(ctx, 'google', null, 'profile_google', {
  detail: { textKey: google ? 'profile_google_connected' : 'profile_google_detail' },
  leading: googleBadge(ctx),
  hotspot: false,
  trailing: google ? null : textButton(ctx, 'google-connect', 'profile_connect', []),
});

const profileFrame = (id, name, google) => frame(id, name, { status: 'proposed', spec: PROFILE_SPEC }, (ctx) => screenFrame(ctx, [
  content(ctx, [
    ctx.node({ key: 'toolbar', styles: ['Screen/toolbar'], children: [backButton(ctx)] }),
    gap(ctx, 'gap-toolbar', 'spacing.xxSmall'),
    ctx.node({
      key: 'hero',
      styles: ['Tx/hero'],
      children: [
        ctx.node({
          key: 'avatar',
          styles: ['Profile/avatarWrap'],
          children: [
            text(ctx, 'avatar/initial', 'Family/avatar', { text: 'A' }, { styles: ['Family/avatar', 'Profile/avatar'] }),
            OrbitIconButton(ctx, { key: 'photo', variant: 'Filled', hotspot: true, styles: ['Profile/photo'], contentDescription: ctx.t('profile_change_photo') }, [
              icon(ctx, 'photo/icon', 'camera', 'small', 'colors.text.onInk'),
            ]),
          ],
        }),
        gap(ctx, 'gap-avatar', 'spacing.xxSmall'),
        text(ctx, 'name', 'SignIn/title', { text: 'Ana Souza' }),
        text(ctx, 'email', 'Screen/secondary', { text: 'ana@example.com' }),
        text(ctx, 'since', 'Screen/tertiary', { textKey: 'profile_member_since' }),
      ],
    }),
    gap(ctx, 'gap-hero', 'spacing.large'),
    text(ctx, 'personal-eyebrow', 'Screen/eyebrow', { textKey: 'profile_personal_eyebrow' }),
    gap(ctx, 'gap-personal-eyebrow', 'spacing.xxSmall'),
    OrbitCard(ctx, { key: 'personal', variant: 'Base', styles: ['Charts/card'] }, [
      detailRow(ctx, 'full-name', neutralBadge(ctx, 'full-name/badge', 'user_round'), 'profile_name', { text: 'Ana Souza' }, true),
      HorizontalDivider(ctx, { key: 'personal/divider-1' }),
      detailRow(ctx, 'short-name', neutralBadge(ctx, 'short-name/badge', 'users'), 'profile_short_name', { text: 'Ana' }, true),
      HorizontalDivider(ctx, { key: 'personal/divider-2' }),
      ctx.node({
        key: 'email-row',
        styles: ['Family/row'],
        children: [
          neutralBadge(ctx, 'email-row/badge', 'mail'),
          ctx.node({
            key: 'email-row/info',
            styles: ['Family/info'],
            children: [
              text(ctx, 'email-row/label', 'Screen/tertiary', { textKey: 'profile_email' }),
              text(ctx, 'email-row/value', 'Family/name', { text: 'ana@example.com' }, clipped('Family/name')),
            ],
          }),
          status(ctx, 'email-row/verified', 'circle_check', 'colors.text.success', 'profile_verified'),
        ],
      }),
      HorizontalDivider(ctx, { key: 'personal/divider-3' }),
      detailRow(ctx, 'phone', neutralBadge(ctx, 'phone/badge', 'phone'), 'profile_phone', { textKey: 'profile_phone_add', bind: { color: { token: 'colors.text.brand' } } }, true),
    ]),
    gap(ctx, 'gap-personal', 'spacing.large'),
    text(ctx, 'family-eyebrow', 'Screen/eyebrow', { textKey: 'settings_family_eyebrow' }),
    gap(ctx, 'gap-family-eyebrow', 'spacing.xxSmall'),
    OrbitCard(ctx, { key: 'family-card', variant: 'Base', styles: ['Charts/card'] }, [
      settingsRow(ctx, 'family', null, 'profile_family', { detail: { textKey: 'profile_family_detail', textArgs: ['1'] }, leading: avatarStack(ctx, 'family/avatars', ['A', 'M']) }),
    ]),
    gap(ctx, 'gap-family', 'spacing.large'),
    text(ctx, 'sign-in-eyebrow', 'Screen/eyebrow', { textKey: 'profile_sign_in_eyebrow' }),
    gap(ctx, 'gap-sign-in-eyebrow', 'spacing.xxSmall'),
    OrbitCard(ctx, { key: 'sign-in-card', variant: 'Base', styles: ['Charts/card'] }, [
      passwordRow(ctx, google),
      HorizontalDivider(ctx, { key: 'sign-in-card/divider-1' }),
      googleRow(ctx, google),
    ]),
    gap(ctx, 'gap-sign-in', 'spacing.small'),
    OrbitButton(ctx, { key: 'delete-account', variant: 'Text', hotspot: true, styles: ['Screen/fill'] }, [
      label(ctx, 'delete-account/label', { textKey: 'settings_delete_account' }, 'Settings/danger'),
    ]),
    gap(ctx, 'gap-bottom', 'spacing.small'),
  ]),
]));
const profile = profileFrame('profile', 'Profile', false);
const profileGoogle = profileFrame('profile-google', 'Profile · Google sign-in', true);

// Photo: Take photo opens the camera and Choose from library the system picker; the chosen photo uploads and the
// sheet closes. Remove photo appears once a photo is set. Take photo is hidden on desktop and web, which have no camera.
const profilePhotoSheet = (id, name, withPhoto) => sheetFrame(id, name, PROFILE_SPEC, profile, 'photo-sheet', 'profile_photo_title', (ctx) => [
  ctx.node({
    key: 'photo-header',
    styles: ['Home/spread'],
    children: [
      text(ctx, 'photo-title', 'SignIn/title', { textKey: 'profile_photo_title' }),
      OrbitIconButton(ctx, { key: 'photo-close', hotspot: true, contentDescription: ctx.t('home_picker_close') }, [
        icon(ctx, 'photo-close/icon', 'x', 'medium', 'colors.text.secondary'),
      ]),
    ],
  }),
  gap(ctx, 'photo-gap-title', 'spacing.xxSmall'),
  text(ctx, 'photo-guidance', 'Screen/guidance', { textKey: 'profile_photo_guidance' }),
  gap(ctx, 'photo-gap-guidance', 'spacing.medium'),
  settingsCard(ctx, 'photo-options', [
    settingsRow(ctx, 'take-photo', 'camera', 'profile_photo_take', { trailing: null }),
    settingsRow(ctx, 'choose-photo', 'image', 'profile_photo_choose', { trailing: null }),
    withPhoto && settingsRow(ctx, 'remove-photo', 'trash', {
      textKey: 'profile_photo_remove', bind: { color: { token: 'colors.text.error' } },
    }, { trailing: null }),
  ].filter(Boolean)),
  gap(ctx, 'photo-gap-bottom', 'spacing.small'),
]);
const profilePhoto = profilePhotoSheet('profile-photo', 'Profile · Photo', false);
const profilePhotoSet = profilePhotoSheet('profile-photo-set', 'Profile · Photo · Remove', true);

// Name: both names in one sheet, opened from either name row.
const profileName = sheetFrame('profile-name', 'Profile · Name', PROFILE_SPEC, profile, 'name-sheet', 'profile_name_title', (ctx) => [
  text(ctx, 'name-title', 'SignIn/title', { textKey: 'profile_name_title' }),
  gap(ctx, 'name-gap-title', 'spacing.xxSmall'),
  text(ctx, 'name-guidance', 'Screen/guidance', { textKey: 'profile_name_guidance' }),
  gap(ctx, 'name-gap-guidance', 'spacing.medium'),
  ...field(ctx, 'name-field', 'profile_name', { value: 'Ana Souza', placeholderKey: 'profile_name_placeholder' }),
  gap(ctx, 'name-gap-field', 'spacing.small'),
  ...field(ctx, 'short-name-field', 'profile_short_name', {
    value: 'Ana', placeholderKey: 'profile_short_name_placeholder', supportingTextKey: 'profile_short_name_hint',
  }),
  gap(ctx, 'name-gap-short', 'spacing.large'),
  ctx.node({
    key: 'name-actions',
    styles: ['Screen/actions'],
    children: [
      primary(ctx, 'name-save', 'profile_name_save'),
      textButton(ctx, 'name-cancel', 'profile_name_cancel'),
    ],
  }),
]);

// Phone: one field with the country code. Saving it empty removes the number.
const profilePhone = sheetFrame('profile-phone', 'Profile · Phone', PROFILE_SPEC, profile, 'phone-sheet', 'profile_phone_title', (ctx) => [
  text(ctx, 'phone-title', 'SignIn/title', { textKey: 'profile_phone_title' }),
  gap(ctx, 'phone-gap-title', 'spacing.xxSmall'),
  text(ctx, 'phone-guidance', 'Screen/guidance', { textKey: 'profile_phone_guidance' }),
  gap(ctx, 'phone-gap-guidance', 'spacing.medium'),
  ...field(ctx, 'phone-field', 'profile_phone', {
    placeholderKey: 'profile_phone_placeholder', supportingTextKey: 'profile_phone_hint',
  }),
  gap(ctx, 'phone-gap-field', 'spacing.large'),
  ctx.node({
    key: 'phone-actions',
    styles: ['Screen/actions'],
    children: [
      primary(ctx, 'phone-save', 'profile_phone_save'),
      textButton(ctx, 'phone-cancel', 'profile_phone_cancel'),
    ],
  }),
]);

// Password: changing it asks for the current one; a Google-only account adds one without it.
const passwordField = (ctx, key, labelKey, placeholderKey, supportingTextKey) => field(ctx, key, labelKey, {
  placeholderKey,
  supportingTextKey,
  password: true,
  trailingIcon: OrbitIconButton(ctx, {
    key: `${key}/show`, contentDescription: ctx.t('password_show'),
  }, [icon(ctx, `${key}/show/icon`, 'eye', 'medium', 'colors.text.secondary')]),
});
const passwordActions = (ctx, key) => ctx.node({
  key: `${key}-actions`,
  styles: ['Screen/actions'],
  children: [
    primary(ctx, `${key}-save`, 'profile_password_save'),
    textButton(ctx, `${key}-cancel`, 'profile_password_cancel'),
  ],
});
const profilePassword = sheetFrame('profile-password', 'Profile · Password', PROFILE_SPEC, profile, 'password-sheet', 'profile_password_title', (ctx) => [
  text(ctx, 'password-title', 'SignIn/title', { textKey: 'profile_password_title' }),
  gap(ctx, 'password-gap-title', 'spacing.xxSmall'),
  text(ctx, 'password-guidance', 'Screen/guidance', { textKey: 'profile_password_guidance' }),
  gap(ctx, 'password-gap-guidance', 'spacing.medium'),
  ...passwordField(ctx, 'current-password', 'profile_password_current', 'profile_password_current_placeholder'),
  gap(ctx, 'password-gap-current', 'spacing.small'),
  ...passwordField(ctx, 'new-password', 'profile_password_new', 'profile_password_new_placeholder', 'profile_password_hint'),
  gap(ctx, 'password-gap-new', 'spacing.large'),
  passwordActions(ctx, 'password'),
]);
const profilePasswordAdd = sheetFrame('profile-password-add', 'Profile · Add password', PROFILE_SPEC, profileGoogle, 'password-add-sheet', 'profile_password_add_title', (ctx) => [
  text(ctx, 'password-add-title', 'SignIn/title', { textKey: 'profile_password_add_title' }),
  gap(ctx, 'password-add-gap-title', 'spacing.xxSmall'),
  text(ctx, 'password-add-guidance', 'Screen/guidance', { textKey: 'profile_password_add_guidance', textArgs: ['ana@example.com'] }),
  gap(ctx, 'password-add-gap-guidance', 'spacing.medium'),
  ...passwordField(ctx, 'add-password', 'profile_password_new', 'profile_password_new_placeholder', 'profile_password_hint'),
  gap(ctx, 'password-add-gap-new', 'spacing.large'),
  passwordActions(ctx, 'password-add'),
]);

// Wallet: the cards, stacked like Apple Wallet. Art comes from assets/proposed/cards (bank artwork the user supplied);
// the app would use the issuer's card image from Pluggy or a generated card.
const WALLET_SPEC = 'docs/specs/wallet.md';
const CARDS = [
  { key: 'azul', name: 'Azul Itaú', short: 'Azul', art: 'azul', network: 'Mastercard', last4: '4821', bill: 'R$ 2.140,20', closes: ['oct', 12], due: ['oct', 20], used: 0.36, limit: 'R$ 12.000,00', available: 'R$ 7.708,10', inUse: 'R$ 4.291,90' },
  { key: 'amazon', name: 'Amazon Mastercard', short: 'Amazon', art: 'amazon', network: 'Mastercard', last4: '1093', bill: 'R$ 486,90', closes: ['oct', 8], due: ['oct', 15] },
  { key: 'bradesco', name: 'Bradesco Diners', short: 'Diners', art: 'bradesco-diners', network: 'Elo', last4: '7712', bill: 'R$ 1.315,00', closes: ['oct', 18], due: ['oct', 25] },
  { key: 'amex', name: 'Amex Green', short: 'Amex', art: 'amex-green', network: 'Amex', last4: '3005', bill: 'R$ 870,30', closes: ['oct', 26], due: ['nov', 2] },
];
const card = (key) => CARDS.find((c) => c.key === key);
const day = (ctx, [month, n]) => ctx.t(`wallet_date_${month}`, n);
const cardArt = (ctx, key, { art, name }, styles = [], extra = {}) => ctx.node({
  key,
  styles: ['Wallet/card', ...styles],
  attrs: { role: 'img', 'aria-label': name },
  ...extra,
  children: [ctx.node({ key: `${key}/art`, tag: 'img', styles: ['Wallet/art'], attrs: { src: `assets/proposed/cards/${art}.jpg`, alt: '', draggable: 'false' } })],
});
const thumb = (ctx, key, c) => cardArt(ctx, key, c, ['Wallet/thumb']);
const cardInfo = (ctx, key, c, detail) => ctx.node({
  key: `${key}/info`,
  styles: ['Family/info'],
  children: [text(ctx, `${key}/name`, 'Family/name', { text: c.name }, clipped('Family/name')), text(ctx, `${key}/detail`, 'Screen/tertiary', detail, clipped('Screen/tertiary'))],
});
const billRow = (ctx, c) => ctx.node({
  key: `bill-${c.key}`,
  styles: ['Family/row'],
  hotspot: true,
  attrs: { role: 'button', tabindex: 0 },
  children: [
    thumb(ctx, `bill-${c.key}/thumb`, c),
    cardInfo(ctx, `bill-${c.key}`, c, { textKey: 'wallet_closes_due', textArgs: [day(ctx, c.closes), day(ctx, c.due)] }),
    text(ctx, `bill-${c.key}/amount`, 'Home/amount', { text: c.bill }),
  ],
});
const iconAction = (ctx, key, glyph, labelKey) => OrbitIconButton(ctx, { key, hotspot: true, contentDescription: ctx.t(labelKey) }, [
  icon(ctx, `${key}/icon`, glyph, 'medium', 'colors.text.primary'),
]);

const wallet = frame('wallet', 'Wallet', { status: 'proposed', spec: WALLET_SPEC }, (ctx) => screenFrame(ctx, [
  ctx.node({
    key: 'content',
    styles: ['Home/scroll'],
    children: [
      gap(ctx, 'gap-top', 'spacing.xxLarge'),
      ctx.node({
        key: 'header',
        styles: ['Home/spread', 'Home/inset'],
        children: [
          ctx.node({
            key: 'header/text',
            styles: ['Home/headerText'],
            children: [
              text(ctx, 'title', 'SignIn/title', { textKey: 'wallet_title' }),
              text(ctx, 'summary', 'Screen/secondary', { textKey: 'wallet_summary', textArgs: [CARDS.length, 'R$ 4.812,40'] }),
            ],
          }),
          ctx.node({ key: 'actions', styles: ['Home/actions'], children: [iconAction(ctx, 'sort', 'arrow_up_down', 'wallet_sort'), iconAction(ctx, 'add', 'plus', 'wallet_add')] }),
        ],
      }),
      gap(ctx, 'gap-header', 'spacing.medium'),
      inset(ctx, 'stack/inset', ctx.node({
        key: 'stack',
        styles: ['Wallet/stack'],
        attrs: { role: 'list' },
        children: CARDS.map((c, i) => cardArt(ctx, `card-${c.key}`, c, i ? ['Wallet/stacked'] : [], { hotspot: true, attrs: { role: 'button', 'aria-label': c.name, tabindex: 0 } })),
      })),
      gap(ctx, 'gap-stack', 'spacing.large'),
      ...section(ctx, 'bills', sectionHeader(ctx, 'bills-header', 'wallet_bills_eyebrow', 'wallet_sorted_manual'), OrbitCard(ctx, { key: 'bills', variant: 'Base' }, CARDS.flatMap((c, i) => [
        i > 0 && HorizontalDivider(ctx, { key: `bills/divider-${i}` }),
        billRow(ctx, c),
      ]))),
      gap(ctx, 'gap-bottom', 'spacing.large'),
    ],
  }),
  mainNav(ctx, MAIN_NAV.wallet),
]));

// A tapped card rises to the top with its bill and transactions; the other cards wait in a short deck above the bar.
const CARD_EXPENSES = [EXPENSES[0], EXPENSES[1], EXPENSES[2], EXPENSES[3]];
const walletCard = frame('wallet-card', 'Wallet · Card', { status: 'proposed', spec: WALLET_SPEC }, (ctx) => {
  const c = card('azul');
  return screenFrame(ctx, [
    ctx.node({
      key: 'content',
      styles: ['Home/scroll'],
      children: [
        gap(ctx, 'gap-top', 'spacing.xLarge'),
        inset(ctx, 'toolbar/inset', ctx.node({
          key: 'toolbar',
          styles: ['Home/spread', 'Screen/toolbar'],
          children: [backButton(ctx), OrbitIconButton(ctx, { key: 'more', hotspot: true, contentDescription: ctx.t('wallet_edit') }, [
            icon(ctx, 'more/icon', 'ellipsis', 'medium', 'colors.text.primary'),
          ])],
        })),
        gap(ctx, 'gap-toolbar', 'spacing.xxSmall'),
        inset(ctx, 'selected/inset', cardArt(ctx, 'selected-card', c, ['Wallet/raised'])),
        gap(ctx, 'gap-card', 'spacing.small'),
        inset(ctx, 'name/inset', ctx.node({
          key: 'name',
          styles: ['Home/headerText'],
          children: [
            text(ctx, 'name/title', 'Home/cardTitle', { text: c.name }),
            text(ctx, 'name/number', 'Screen/secondary', { textKey: 'wallet_number', textArgs: [c.network, c.last4] }),
          ],
        })),
        gap(ctx, 'gap-name', 'spacing.medium'),
        inset(ctx, 'bill/inset', OrbitCard(ctx, { key: 'bill', variant: 'Base' }, [
          ctx.node({
            key: 'bill/body',
            styles: ['Home/cardBody'],
            children: [
              ctx.node({
                key: 'bill/top',
                styles: ['Home/spread'],
                children: [
                  text(ctx, 'bill/eyebrow', 'Screen/eyebrow', { textKey: 'wallet_current_bill' }),
                  text(ctx, 'bill/dates', 'Screen/tertiary', { textKey: 'wallet_closes_due', textArgs: [day(ctx, c.closes), day(ctx, c.due)] }),
                ],
              }),
              text(ctx, 'bill/amount', 'OrbitCard/amount', { text: c.bill }),
              OrbitLinearProgressIndicator(ctx, { key: 'bill/limit', progress: c.used, status: 'Primary', styles: ['Home/track'] }),
              ctx.node({
                key: 'bill/footer',
                styles: ['Home/spread'],
                children: [
                  text(ctx, 'bill/used', 'Screen/secondary', { textKey: 'wallet_limit', textArgs: [c.limit] }),
                  text(ctx, 'bill/available', 'Screen/tertiary', { textKey: 'wallet_available', textArgs: [c.available] }),
                ],
              }),
            ],
          }),
        ])),
        gap(ctx, 'gap-bill', 'spacing.small'),
        inset(ctx, 'card-actions/inset', ctx.node({
          key: 'card-actions',
          styles: ['Home/gridRow'],
          children: [
            OrbitButton(ctx, { key: 'edit-card', variant: 'Outlined', hotspot: true, styles: ['Wallet/half'] }, [
              icon(ctx, 'edit-card/icon', 'pencil', 'medium', 'colors.text.primary', ['Screen/leadingIcon']),
              label(ctx, 'edit-card/label', { textKey: 'wallet_edit' }),
            ]),
            OrbitButton(ctx, { key: 'remove-card', variant: 'Outlined', hotspot: true, styles: ['Wallet/half'] }, [
              icon(ctx, 'remove-card/icon', 'circle_minus', 'medium', 'colors.text.error', ['Screen/leadingIcon']),
              label(ctx, 'remove-card/label', { textKey: 'wallet_remove' }, 'Settings/danger'),
            ]),
          ],
        })),
        gap(ctx, 'gap-actions', 'spacing.large'),
        ...section(ctx, 'transactions', sectionHeader(ctx, 'transactions-header', 'wallet_transactions_eyebrow', 'wallet_see_bill'),
          OrbitCard(ctx, { key: 'transactions', variant: 'Base' }, CARD_EXPENSES.flatMap((row, i) => [i > 0 && HorizontalDivider(ctx, { key: `transactions/divider-${i}` }), expense(ctx, row)]))),
        gap(ctx, 'gap-bottom', 'spacing.large'),
      ],
    }),
    ctx.node({
      key: 'deck',
      styles: ['Wallet/deck'],
      hotspot: true,
      attrs: { role: 'button', tabindex: 0, 'aria-label': ctx.t('wallet_other_cards') },
      children: CARDS.filter((other) => other !== c).map((other, i) => ctx.node({
        key: `deck-${other.key}`,
        styles: ['Wallet/sliver', i && 'Wallet/sliverStacked'],
        children: [cardArt(ctx, `deck-${other.key}/card`, other)],
      })),
    }),
    mainNav(ctx, MAIN_NAV.wallet),
  ]);
});

const SORTS = [['manual', 'grip_vertical'], ['bill', 'trending_up'], ['due', 'calendar_days'], ['name', 'arrow_up_down']];
const walletSortSheet = sheetFrame('wallet-sort', 'Wallet · Sort', WALLET_SPEC, wallet, 'sort-sheet', 'wallet_sort', (ctx) => [
  ctx.node({
    key: 'sort-header',
    styles: ['Home/spread'],
    children: [
      text(ctx, 'sort-title', 'SignIn/title', { textKey: 'wallet_sort' }),
      OrbitIconButton(ctx, { key: 'sort-close', hotspot: true, contentDescription: ctx.t('home_picker_close') }, [icon(ctx, 'sort-close/icon', 'x', 'medium', 'colors.text.secondary')]),
    ],
  }),
  gap(ctx, 'sort-gap-title', 'spacing.xxSmall'),
  ctx.node({
    key: 'sort-options',
    styles: ['Settings/stack'],
    attrs: { role: 'radiogroup', 'aria-label': ctx.t('wallet_sort') },
    children: SORTS.map(([sort, glyph], i) => settingsRow(ctx, `sort-${sort}`, glyph, `wallet_sort_${sort}`, {
      detail: { textKey: `wallet_sort_${sort}_detail` },
      trailing: i === 0 ? icon(ctx, `sort-${sort}/check`, 'check', 'medium', 'colors.text.brand') : null,
    })),
  }),
  gap(ctx, 'sort-gap-edit', 'spacing.medium'),
  OrbitButton(ctx, { key: 'edit-order', variant: 'Outlined', hotspot: true, styles: ['Screen/fill'] }, [
    icon(ctx, 'edit-order/icon', 'grip_vertical', 'medium', 'colors.text.primary', ['Screen/leadingIcon']),
    label(ctx, 'edit-order/label', { textKey: 'wallet_edit_order' }),
  ]),
]);

// Reordering: Bradesco is being dragged above Amazon.
const sortRow = (ctx, c, dragging = false) => ctx.node({
  key: `edit-${c.key}`,
  styles: ['Family/row', dragging && 'Wallet/dragging'],
  children: [
    thumb(ctx, `edit-${c.key}/thumb`, c),
    cardInfo(ctx, `edit-${c.key}`, c, { textKey: 'wallet_number', textArgs: [c.network, c.last4] }),
    ctx.node({
      key: `edit-${c.key}/handle`, styles: ['Wallet/handle'], attrs: { role: 'button', 'aria-label': ctx.t('wallet_reorder_card', c.name) },
      children: [icon(ctx, `edit-${c.key}/handle/icon`, 'grip_vertical', 'medium', 'colors.text.tertiary')],
    }),
  ],
});
const walletSort = frame('wallet-edit', 'Wallet · Sort cards', { status: 'proposed', spec: WALLET_SPEC }, (ctx) => screenFrame(ctx, [
  content(ctx, [
    ...header(ctx, 'wallet_sort', 'wallet_sort_guidance'),
    OrbitCard(ctx, { key: 'cards', variant: 'Base', styles: ['Charts/card'] }, [
      sortRow(ctx, card('azul')),
      sortRow(ctx, card('bradesco'), true),
      sortRow(ctx, card('amazon')),
      HorizontalDivider(ctx, { key: 'cards/divider-3' }),
      sortRow(ctx, card('amex')),
    ]),
    ctx.node({ key: 'spacer', styles: ['Screen/grow'] }),
    actions(ctx, [
      primary(ctx, 'done', 'wallet_done'),
      OrbitButton(ctx, { key: 'add-card', variant: 'Outlined', hotspot: true, styles: ['Screen/fill'] }, [
        icon(ctx, 'add-card/icon', 'plus', 'medium', 'colors.text.primary', ['Screen/leadingIcon']),
        label(ctx, 'add-card/label', { textKey: 'wallet_add' }),
      ]),
    ]),
  ]),
]));

const NETWORKS = ['Mastercard', 'Visa', 'Elo', 'Amex', null];
const halfField = (ctx, key, labelKey, options) => ctx.node({ key: `${key}/column`, styles: ['Wallet/fieldColumn'], children: field(ctx, key, labelKey, options) });
// A card Orbit draws itself, with the name and last 4 digits, for cards without art.
const generatedCard = (ctx, key, { name, last4, network }, styles = []) => ctx.node({
  key,
  styles: ['Wallet/preview', ...styles],
  attrs: { role: 'img', 'aria-label': name },
  children: [
    text(ctx, `${key}/name`, 'Wallet/previewName', { text: name }),
    ctx.node({ key: `${key}/spacer`, styles: ['Screen/grow'] }),
    ctx.node({
      key: `${key}/bottom`,
      styles: ['Home/spread'],
      children: [text(ctx, `${key}/number`, 'Wallet/previewNumber', { text: `•••• ${last4}` }), text(ctx, `${key}/network`, 'Wallet/previewName', { text: network })],
    }),
  ],
});
const walletAdd = frame('wallet-add', 'Wallet · Add card', { status: 'proposed', spec: WALLET_SPEC }, (ctx) => screenFrame(ctx, [
  content(ctx, [
    ...header(ctx, 'wallet_add', 'wallet_add_guidance'),
    generatedCard(ctx, 'preview', { name: 'Nubank Ultravioleta', last4: '6620', network: 'Mastercard' }),
    gap(ctx, 'gap-preview', 'spacing.medium'),
    OrbitCard(ctx, { key: 'import-card', variant: 'Base', styles: ['Charts/card'] }, [
      settingsRow(ctx, 'import', 'plug', 'wallet_import', { detail: { textKey: 'wallet_import_detail' } }),
    ]),
    gap(ctx, 'gap-import', 'spacing.large'),
    text(ctx, 'manual-eyebrow', 'Screen/eyebrow', { textKey: 'wallet_manual_eyebrow' }),
    gap(ctx, 'gap-manual', 'spacing.small'),
    ...field(ctx, 'card-name', 'wallet_name_label', { value: 'Nubank Ultravioleta', placeholderKey: 'wallet_name_placeholder' }),
    gap(ctx, 'gap-name', 'spacing.small'),
    ctx.node({
      key: 'numbers-row',
      styles: ['Home/gridRow'],
      children: [
        halfField(ctx, 'last-digits', 'wallet_digits_label', { value: '6620' }),
        halfField(ctx, 'limit', 'wallet_limit_label', { value: '', placeholder: 'R$ 0,00' }),
      ],
    }),
    gap(ctx, 'gap-numbers', 'spacing.small'),
    text(ctx, 'network-eyebrow', 'Screen/eyebrow', { textKey: 'wallet_network_label' }),
    gap(ctx, 'gap-network', 'spacing.xxxSmall'),
    ctx.node({
      key: 'networks',
      styles: ['Wallet/chips'],
      attrs: { role: 'radiogroup', 'aria-label': ctx.t('wallet_network_label') },
      children: NETWORKS.map((network, i) => OrbitFilterChip(ctx, {
        key: `network-${network?.toLowerCase() ?? 'other'}`,
        ...(network ? { label: network } : { labelKey: 'wallet_network_other' }),
        selected: i === 0,
        hotspot: true,
        attrs: { role: 'radio', 'aria-checked': i === 0, tabindex: 0 },
      })),
    }),
    gap(ctx, 'gap-networks', 'spacing.small'),
    ctx.node({
      key: 'days-row',
      styles: ['Home/gridRow'],
      children: [
        halfField(ctx, 'closing-day', 'wallet_closing_label', { value: '3' }),
        halfField(ctx, 'due-day', 'wallet_due_label', { value: '10' }),
      ],
    }),
    gap(ctx, 'gap-days', 'spacing.large'),
    ctx.node({ key: 'spacer', styles: ['Screen/grow'] }),
    actions(ctx, [primary(ctx, 'save', 'wallet_add'), textButton(ctx, 'cancel', 'wallet_cancel')]),
  ]),
]));

const walletRemove = sheetFrame('wallet-remove', 'Wallet · Remove card', WALLET_SPEC, walletCard, 'remove-sheet',
  (ctx) => ctx.t('wallet_remove_title', card('azul').name), (ctx) => [
    ctx.node({
      key: 'remove-badge',
      styles: ['EmailSent/badge', 'Settings/dangerBadge'],
      children: [icon(ctx, 'remove-badge/icon', 'circle_minus', 'xLarge', 'colors.text.error')],
    }),
    gap(ctx, 'remove-gap-badge', 'spacing.medium'),
    text(ctx, 'remove-title', 'SignIn/title', { textKey: 'wallet_remove_title', textArgs: [card('azul').name] }),
    gap(ctx, 'remove-gap-title', 'spacing.xxSmall'),
    text(ctx, 'remove-body', 'Screen/guidance', { textKey: 'wallet_remove_body_imported' }),
    gap(ctx, 'remove-gap-body', 'spacing.large'),
    actions(ctx, [
      OrbitButton(ctx, { key: 'remove-confirm', variant: 'Destructive', hotspot: true, styles: ['Screen/fill'] }, [
        label(ctx, 'remove-confirm/label', { textKey: 'wallet_remove_confirm' }),
      ]),
      textButton(ctx, 'remove-cancel', 'wallet_cancel'),
    ]),
  ]);

// Edit card: the bank keeps the number, limit and dates; the name and image are the user's. Save sends them to orbit-api
// and is off until something changes; Back without saving drops the changes. With Match the name on, the image follows
// the name as it is typed: the design that matches it, else a card Orbit draws with the name. Choosing an image turns
// matching off. An empty name uses the bank's, shown as placeholder. The art is the Wallet sample art; Orbit is a drawn
// card. Color opens a sheet of fixed card colors (the eight palettes' primaries and Black, the same in every theme), for a
// card with no image or a user who'd rather have a color; picking one draws the card in it and turns matching off.
const CARD_EDIT_SPEC = 'docs/specs/card-edit.md';
const BANK_CARD_NAME = 'MASTERCARD BLACK PTS';
const DESIGNS = [
  { key: 'azul', name: 'Azul Itaú', art: 'azul' },
  { key: 'amazon', name: 'Amazon', art: 'amazon' },
  { key: 'diners', name: 'Diners Club', art: 'bradesco-diners' },
  { key: 'amex', name: 'Amex Green', art: 'amex-green' },
  { key: 'orbit', nameKey: 'card_edit_design_orbit', styles: ['Wallet/generated'] },
  { key: 'color', nameKey: 'card_edit_design_color' },
];
const CARD_COLORS = [...PALETTES, 'black'];
const cardColorName = (color) => (color === 'black' ? 'card_edit_color_black' : `settings_palette_${color}`);
// A card-shaped tile with its name below, for an image (design-*) or a card color (color-*).
const cardTile = (ctx, key, { styles = [], art, glyph, nameContent, selected }) => ctx.node({
  key,
  styles: ['Wallet/design'],
  hotspot: true,
  attrs: { role: 'radio', 'aria-checked': String(selected), tabindex: 0 },
  children: [
    ctx.node({
      key: `${key}/card`,
      styles: ['Wallet/card', 'Wallet/tile', ...styles, glyph && 'Wallet/colorEmpty', selected && 'Wallet/designSelected'],
      children: [
        art && ctx.node({ key: `${key}/art`, tag: 'img', styles: ['Wallet/art'], attrs: { src: `assets/proposed/cards/${art}.jpg`, alt: '', draggable: 'false' } }),
        glyph && icon(ctx, `${key}/glyph`, glyph, 'large', 'colors.text.secondary'),
        selected && ctx.node({
          key: `${key}/check`,
          styles: ['Wallet/designCheck'],
          children: [icon(ctx, `${key}/check/icon`, 'check', 'xSmall', 'colors.text.onBrand')],
        }),
      ],
    }),
    text(ctx, `${key}/name`, 'Settings/paletteName', nameContent, clipped('Settings/paletteName')),
  ],
});
// The Color tile shows the picked color, or the palette icon until one is picked.
const designTile = (ctx, d, selected, color) => cardTile(ctx, `design-${d.key}`, {
  styles: d.key === 'color' && color ? [`Wallet/color/${color}`] : d.styles,
  art: d.art,
  glyph: d.key === 'color' && !color ? 'palette' : null,
  nameContent: d.nameKey ? { textKey: d.nameKey } : { text: d.name },
  selected,
});
const cardEditFrame = (id, name, { value, design, color, match, note, save = 'enabled', failed = false }) => frame(id, name, { status: 'proposed', spec: CARD_EDIT_SPEC }, (ctx) => {
  const c = card('azul');
  const d = DESIGNS.find((option) => option.key === design);
  return screenFrame(ctx, [
    content(ctx, [
      ...header(ctx, 'card_edit_title', 'card_edit_guidance'),
      d.art
        ? cardArt(ctx, 'preview', { art: d.art, name: value }, ['Wallet/raised', 'Wallet/previewArt'])
        : generatedCard(ctx, 'preview', { name: value, last4: c.last4, network: c.network }, ['Wallet/previewArt', color && `Wallet/color/${color}`]),
      gap(ctx, 'gap-preview', 'spacing.small'),
      ...field(ctx, 'card-name', 'wallet_name_label', {
        value,
        placeholder: BANK_CARD_NAME,
        hotspot: true,
        ...(value === BANK_CARD_NAME ? { supportingTextKey: 'card_edit_bank_name_kept' } : { supportingText: ctx.t('card_edit_bank_name', BANK_CARD_NAME) }),
      }),
      gap(ctx, 'gap-name', 'spacing.small'),
      ctx.node({
        key: 'image-header',
        styles: ['Home/spread'],
        children: [
          text(ctx, 'image-eyebrow', 'Screen/eyebrow', { textKey: 'card_edit_image_eyebrow' }),
          ctx.node({
            key: 'match',
            styles: ['Screen/toggleRow'],
            hotspot: true,
            attrs: { role: 'checkbox', 'aria-checked': String(match), tabindex: 0 },
            children: [
              Checkbox(ctx, { key: 'match/checkbox', checked: match, attrs: { 'aria-hidden': 'true' } }),
              text(ctx, 'match/label', 'SignIn/remember', { textKey: 'card_edit_match' }),
            ],
          }),
        ],
      }),
      gap(ctx, 'gap-image-header', 'spacing.xxSmall'),
      ctx.node({
        key: 'designs',
        styles: ['Wallet/designs'],
        attrs: { role: 'radiogroup', 'aria-label': ctx.t('card_edit_image_eyebrow') },
        children: [DESIGNS.slice(0, 3), DESIGNS.slice(3)].map((row, i) => ctx.node({
          key: `designs-row-${i}`,
          styles: ['Home/gridRow'],
          children: row.map((option) => designTile(ctx, option, option === d, color)),
        })),
      }),
      gap(ctx, 'gap-designs', 'spacing.small'),
      text(ctx, 'image-note', 'Screen/tertiary', note),
      gap(ctx, 'gap-note', 'spacing.small'),
      ctx.node({ key: 'spacer', styles: ['Screen/grow'] }),
      actions(ctx, [
        OrbitButton(ctx, { key: 'save', enabled: save !== 'disabled', loading: save === 'loading', hotspot: true, styles: ['Screen/fill'] }, [
          label(ctx, 'save/label', { textKey: 'card_edit_save' }),
        ]),
      ]),
    ]),
    failed && OrbitSnackbar(ctx, {
      key: 'save-error',
      type: 'Error',
      titleKey: 'card_edit_error_title',
      textKey: 'card_edit_error_body',
      styles: ['Wallet/saveError'],
      attrs: { role: 'alert' },
    }),
  ]);
});
const walletCardEdit = cardEditFrame('wallet-card-edit', 'Wallet · Edit card', {
  value: 'Azul Itaú', design: 'azul', match: true, note: { textKey: 'card_edit_note_match', textArgs: ['Azul Itaú'] },
});
const walletCardEditImported = cardEditFrame('wallet-card-edit-imported', 'Wallet · Edit card · From the bank', {
  value: BANK_CARD_NAME, design: 'orbit', match: true, note: { textKey: 'card_edit_note_none' }, save: 'disabled',
});
const walletCardEditChosen = cardEditFrame('wallet-card-edit-chosen', 'Wallet · Edit card · Chosen color', {
  value: 'Azul Itaú', design: 'color', color: 'azure', match: false, note: { textKey: 'card_edit_note_color' },
});
const walletCardEditSaving = cardEditFrame('wallet-card-edit-saving', 'Wallet · Edit card · Saving', {
  value: 'Azul Itaú', design: 'azul', match: true, note: { textKey: 'card_edit_note_match', textArgs: ['Azul Itaú'] }, save: 'loading',
});
const walletCardEditFailed = cardEditFrame('wallet-card-edit-failed', 'Wallet · Edit card · Couldn’t save', {
  value: 'Azul Itaú', design: 'azul', match: true, note: { textKey: 'card_edit_note_match', textArgs: ['Azul Itaú'] }, failed: true,
});
// Opened from the Color tile. Tapping a color picks it and closes the sheet; nothing is picked yet over Edit card.
const walletCardEditColor = sheetFrame('wallet-card-edit-color', 'Wallet · Edit card · Color', CARD_EDIT_SPEC, walletCardEdit, 'color-sheet', 'card_edit_color_title', (ctx) => [
  ctx.node({
    key: 'color-header',
    styles: ['Home/spread'],
    children: [
      text(ctx, 'color-title', 'SignIn/title', { textKey: 'card_edit_color_title' }),
      OrbitIconButton(ctx, { key: 'color-close', hotspot: true, contentDescription: ctx.t('home_picker_close') }, [
        icon(ctx, 'color-close/icon', 'x', 'medium', 'colors.text.secondary'),
      ]),
    ],
  }),
  gap(ctx, 'color-gap-title', 'spacing.xxSmall'),
  text(ctx, 'color-guidance', 'Screen/guidance', { textKey: 'card_edit_color_guidance' }),
  gap(ctx, 'color-gap-guidance', 'spacing.medium'),
  ctx.node({
    key: 'colors',
    styles: ['Wallet/designs'],
    attrs: { role: 'radiogroup', 'aria-label': ctx.t('card_edit_color_title') },
    children: [0, 3, 6].map((start) => ctx.node({
      key: `colors-row-${start / 3}`,
      styles: ['Home/gridRow'],
      children: CARD_COLORS.slice(start, start + 3).map((option) => cardTile(ctx, `color-${option}`, {
        styles: [`Wallet/color/${option}`], nameContent: { textKey: cardColorName(option) }, selected: false,
      })),
    })),
  }),
]);

// Transactions: one list for a day, week, month or year. The period picks the grouping: by time for a day, by day for a week
// or month, by month for a year. Search and the filter chips keep applying when the period changes.
const TX_SPEC = 'docs/specs/transactions.md';
// [key, merchant, category, card, family member, amount, time, glyph]
const TX_DAYS = [
  { key: 'oct-7', weekday: 3, date: 7, labelKey: 'home_today', total: 'R$ 230,70', rows: [
    ['pao-de-acucar', 'Pão de Açúcar', 'groceries', 'azul', null, 'R$ 182,40', '18:42'],
    ['uber', 'Uber', 'transport', 'azul', 'Marina', 'R$ 24,90', '08:15'],
    ['padaria', 'Padaria Real', 'restaurants', 'amazon', null, 'R$ 23,40', '07:50'],
  ] },
  { key: 'oct-6', weekday: 2, date: 6, labelKey: 'home_yesterday', total: 'R$ 522,70', rows: [
    ['ifood', 'iFood', 'restaurants', 'azul', null, 'R$ 68,50', '20:14'],
    ['outback', 'Outback', 'restaurants', 'bradesco', 'Marina', 'R$ 186,90', '13:05'],
    ['ipiranga', 'Posto Ipiranga', 'transport', 'azul', null, 'R$ 210,00', '09:30', 'fuel'],
    ['drogasil', 'Drogasil', 'health', 'amex', 'Marina', 'R$ 57,30', '08:47'],
  ] },
  { key: 'oct-5', weekday: 1, date: 5, total: 'R$ 361,80', rows: [
    ['cinemark', 'Cinemark', 'leisure', 'bradesco', 'Marina', 'R$ 86,00', '21:10'],
    ['sabesp', 'Sabesp', 'bills', 'azul', null, 'R$ 155,90', '10:00'],
    ['smart-fit', 'Smart Fit', 'health', 'amex', null, 'R$ 119,90', '07:00'],
  ] },
];
const weekdayDate = (ctx, { weekday, month = 'oct', date }) => ctx.t('tx_weekday_date', ctx.t(`tx_weekday_${weekday}`), day(ctx, [month, date]));

const txRow = (ctx, [key, merchant, category, cardKey, member, amount, time, glyph], { timed = false, carded = true } = {}) => ctx.node({
  key,
  styles: ['Home/row'],
  hotspot: true,
  attrs: { role: 'button', tabindex: 0 },
  children: [
    badge(ctx, `${key}/badge`, category, { glyph }),
    ctx.node({
      key: `${key}/info`,
      styles: ['Family/info'],
      children: [
        text(ctx, `${key}/merchant`, 'Family/name', { text: merchant }, clipped('Family/name')),
        text(ctx, `${key}/detail`, 'Screen/tertiary', {
          text: [timed && time, ctx.t(`home_category_${category}`), carded && card(cardKey).short, member].filter(Boolean).join(' · '),
        }, clipped('Screen/tertiary')),
      ],
    }),
    text(ctx, `${key}/amount`, 'Home/amount', { text: amount }),
  ],
});
const txCard = (ctx, key, rows, options) => OrbitCard(ctx, { key, variant: 'Base' }, rows.flatMap((row, i) => [
  i > 0 && HorizontalDivider(ctx, { key: `${key}/divider-${i}` }),
  (options?.row ?? txRow)(ctx, row, options),
]));
const dayGroup = (ctx, group, options) => {
  const title = [group.labelKey && ctx.t(group.labelKey), weekdayDate(ctx, group)].filter(Boolean).join(' · ').toLocaleUpperCase(ctx.settings.language);
  return [
    ctx.node({
      key: `${group.key}-header`,
      styles: ['Home/spread', 'Home/inset'],
      children: [
        text(ctx, `${group.key}-header/date`, 'Screen/eyebrow', { text: title }),
        text(ctx, `${group.key}-header/total`, 'Screen/eyebrow', { text: group.total }, { bind: { color: { token: 'colors.text.tertiary' } } }),
      ],
    }),
    gap(ctx, `${group.key}-gap`, 'spacing.xxSmall'),
    inset(ctx, `${group.key}/inset`, txCard(ctx, group.key, group.rows, options)),
    gap(ctx, `${group.key}-gap-after`, 'spacing.medium'),
  ];
};
const txSummary = (ctx, eyebrowKey, amount, count, average, chart) => inset(ctx, 'summary/inset', OrbitCard(ctx, { key: 'summary', variant: 'Base' }, [
  ctx.node({
    key: 'summary/body',
    styles: ['Home/cardBody'],
    children: [
      text(ctx, 'summary/eyebrow', 'Screen/eyebrow', { textKey: eyebrowKey }),
      ctx.node({
        key: 'summary/amounts',
        styles: ['Home/goalAmounts'],
        children: [
          text(ctx, 'summary/amount', 'Home/cardTitle', { text: amount }),
          text(ctx, 'summary/count', 'Screen/secondary', { textKey: 'tx_count', textArgs: [count, average] }),
        ],
      }),
      chart,
    ],
  }),
]));
const txFilters = (ctx) => inset(ctx, 'filters/inset', ctx.node({
  key: 'filters',
  styles: ['Institutions/chips'],
  attrs: { role: 'group', 'aria-label': ctx.t('tx_filters') },
  children: ['categories', 'cards', 'people'].map((filter) => OrbitFilterChip(ctx, {
    key: `filter-${filter}`, labelKey: `tx_filter_${filter}`, hotspot: true, attrs: { role: 'button', tabindex: 0 },
  })),
}));

const txFrame = (id, name, period, stepper, body) => frame(id, name, { status: 'proposed', spec: TX_SPEC }, (ctx) => screenFrame(ctx, [
  ctx.node({
    key: 'content',
    styles: ['Home/scroll'],
    children: [
      gap(ctx, 'gap-top', 'spacing.xLarge'),
      inset(ctx, 'toolbar/inset', ctx.node({
        key: 'toolbar',
        styles: ['Home/spread', 'Screen/toolbar'],
        children: [
          backButton(ctx),
          ctx.node({ key: 'actions', styles: ['Home/actions'], children: [iconAction(ctx, 'search', 'search', 'tx_search'), iconAction(ctx, 'filters-button', 'sliders_horizontal', 'tx_filters')] }),
        ],
      })),
      inset(ctx, 'title/inset', text(ctx, 'title', 'SignIn/title', { textKey: 'tx_title' })),
      gap(ctx, 'gap-title', 'spacing.small'),
      inset(ctx, 'periods/inset', ctx.node({
        key: 'periods',
        styles: ['Charts/periods'],
        attrs: { role: 'group', 'aria-label': ctx.t('tx_periods') },
        children: ['day', 'week', 'month', 'year'].map((option) => OrbitFilterChip(ctx, {
          key: `period-${option}`,
          labelKey: `tx_period_${option}`,
          selected: option === period,
          hotspot: true,
          styles: ['Settings/option'],
          attrs: { role: 'button', 'aria-pressed': option === period, tabindex: 0 },
        })),
      })),
      gap(ctx, 'gap-periods', 'spacing.small'),
      inset(ctx, 'stepper/inset', ctx.node({
        key: 'stepper',
        styles: ['Home/switcher'],
        children: [
          OrbitIconButton(ctx, { key: 'period-previous', hotspot: true, styles: ['Home/switcherButton'], contentDescription: ctx.t('tx_previous') }, [
            icon(ctx, 'period-previous/icon', 'chevron_left', 'medium', 'colors.text.secondary'),
          ]),
          text(ctx, 'stepper/label', 'Family/name', stepper(ctx), { styles: ['Family/name', 'Home/switcherLabel'], hotspot: true }),
          OrbitIconButton(ctx, { key: 'period-next', hotspot: true, styles: ['Home/switcherButton'], contentDescription: ctx.t('tx_next') }, [
            icon(ctx, 'period-next/icon', 'chevron_right', 'medium', 'colors.text.secondary'),
          ]),
        ],
      })),
      gap(ctx, 'gap-stepper', 'spacing.medium'),
      ...body(ctx),
      gap(ctx, 'gap-bottom', 'spacing.large'),
    ],
  }),
]));

const transactions = txFrame('transactions', 'Transactions · Month', 'month', () => ({ textKey: 'home_month' }), (ctx) => [
  txSummary(ctx, 'tx_spent_month', 'R$ 3.450,00', 48, 'R$ 71,88'),
  gap(ctx, 'gap-summary', 'spacing.small'),
  txFilters(ctx),
  gap(ctx, 'gap-filters', 'spacing.medium'),
  ...TX_DAYS.flatMap((group) => dayGroup(ctx, group)),
]);

// The week's days as columns against an even daily budget; days still to come stay empty.
const WEEK_TOTALS = [361.8, 522.7, 230.7, 0, 0, 0, 0];
const transactionsWeek = txFrame('transactions-week', 'Transactions · Week', 'week', () => ({ textKey: 'tx_week_range' }), (ctx) => [
  txSummary(ctx, 'tx_spent_week', 'R$ 1.115,20', 10, 'R$ 111,52', columnChart(ctx, 'week', {
    months: WEEK_TOTALS.map((value, i) => ({ month: i + 1, value, label: ctx.t(`tx_weekday_${i + 1}`), caption: `R$ ${Math.round(value)}` })),
    max: 640,
    budget: 161,
    budgetLabel: ctx.t('tx_daily_budget', '161'),
    budgetEnd: true,
    accent: 2,
    labelled: [0, 1, 2],
    label: ctx.t('tx_week_label'),
    gradient: true,
  })),
  gap(ctx, 'gap-summary', 'spacing.small'),
  txFilters(ctx),
  gap(ctx, 'gap-filters', 'spacing.medium'),
  ...TX_DAYS.flatMap((group) => dayGroup(ctx, group)),
]);

const transactionsDay = txFrame('transactions-day', 'Transactions · Day', 'day', () => ({ textKey: 'tx_today_label' }), (ctx) => [
  txSummary(ctx, 'tx_spent_day', TX_DAYS[0].total, TX_DAYS[0].rows.length, 'R$ 76,90'),
  gap(ctx, 'gap-summary', 'spacing.small'),
  txFilters(ctx),
  gap(ctx, 'gap-filters', 'spacing.medium'),
  inset(ctx, 'day/inset', txCard(ctx, 'day', TX_DAYS[0].rows, { timed: true })),
]);

// A year groups by month: each row is the month's total against the budget and opens that month.
const YEAR = [4380, 4120, 4650, 4290, 4210, 4890, 5320, 4450, 4760, 3450, 0, 0];
const YEAR_ROWS = [
  [10, 'R$ 3.450,00', 48, null, 0.69],
  [9, 'R$ 4.760,00', 61, '95%', 0.952],
  [8, 'R$ 4.450,00', 57, '89%', 0.89],
  [7, 'R$ 5.320,00', 64, '106%', 1.064],
  [6, 'R$ 4.890,00', 59, '98%', 0.978],
];
const monthRow = (ctx, [month, amount, count, share, used]) => ctx.node({
  key: `month-${month}`,
  styles: ['Charts/place'],
  hotspot: true,
  attrs: { role: 'button', tabindex: 0 },
  children: [
    ctx.node({
      key: `month-${month}/top`,
      styles: ['Home/spread'],
      children: [
        ctx.node({
          key: `month-${month}/info`,
          styles: ['Family/info'],
          children: [
            text(ctx, `month-${month}/name`, 'Family/name', { textKey: `home_picker_month_${month}` }),
            text(ctx, `month-${month}/detail`, 'Screen/tertiary', share ? { textKey: 'tx_month_detail', textArgs: [count, share] } : { textKey: 'tx_month_so_far', textArgs: [count] }),
          ],
        }),
        text(ctx, `month-${month}/amount`, 'Home/amount', { text: amount }),
        chevron(ctx, `month-${month}`),
      ],
    }),
    OrbitLinearProgressIndicator(ctx, { key: `month-${month}/bar`, progress: Math.min(used, 1), status: statusOf(used), styles: ['Home/track'] }),
  ],
});
const transactionsYear = txFrame('transactions-year', 'Transactions · Year', 'year', () => ({ text: '2026' }), (ctx) => [
  txSummary(ctx, 'tx_spent_year', 'R$ 44.520,00', 548, 'R$ 81,24', columnChart(ctx, 'year', {
    months: YEAR.map((value, i) => ({ month: i + 1, value, label: ctx.t(`charts_month_short_${i + 1}`).slice(0, 1), caption: thousands(ctx, String(value / 1000)) })),
    max: 6000,
    budget: 5000,
    budgetLabel: `${ctx.t('charts_budget')} ${thousands(ctx, '5')}`,
    accent: 9,
    labelled: [6, 9],
    label: ctx.t('tx_year_label'),
    gradient: true,
  })),
  gap(ctx, 'gap-summary', 'spacing.small'),
  txFilters(ctx),
  gap(ctx, 'gap-filters', 'spacing.medium'),
  ...section(ctx, 'months', sectionHeader(ctx, 'months-header', 'tx_months_eyebrow'), OrbitCard(ctx, { key: 'months', variant: 'Base' }, YEAR_ROWS.flatMap((row, i) => [
    i > 0 && HorizontalDivider(ctx, { key: `months/divider-${i}` }),
    monthRow(ctx, row),
  ]))),
]);

// Insights: an overview of a week, month or year that answers how much went out, whether that is more than before, where it went,
// who spent it and on what. Every mark opens Transactions narrowed to it, so the list stays the detail view. Nothing reads a budget.
const INSIGHTS_SPEC = 'docs/specs/insights.md';
const signed = (direction, value) => `${direction === 'up' ? '+' : '−'}${value}`;
// Spending more is the bad direction, so up reads as error and down as success; the arrow keeps it from being color alone.
const changeOf = (ctx, key, direction, value, textKey, styles = ['Family/pending']) => ctx.node({
  key,
  styles,
  children: [
    icon(ctx, `${key}/icon`, `trending_${direction}`, 'xSmall', direction === 'up' ? 'colors.text.error' : 'colors.text.success'),
    ctx.node({ key: `${key}/text`, tag: 'span', textKey, textArgs: [signed(direction, value)] }),
  ],
});

// Oct 1–7 running totals: the days add up to the month's R$ 3.450,00, and Oct 5–7 match Transactions' days.
const INSIGHTS_PACE = [[0, 0], [1, 612.4], [2, 1110.5], [3, 1815.1], [4, 2334.8], [5, 2696.6], [6, 3219.3], [7, 3450]];
// October's projection: what is spent so far, the installments still due this month and the recent daily average for the days left.
const INSIGHTS_PROJECTED_MONTH = 4620;
const insightsPace = (ctx, { previous, max, grid }) => {
  const top = 18;
  const bottom = PACE_HEIGHT - 24;
  const x = (dayOfMonth) => Math.round((dayOfMonth / PACE.days) * PLOT_WIDTH * 10) / 10;
  const y = (value) => Math.round((bottom - (value / max) * (bottom - top)) * 10) / 10;
  const line = (points) => points.map(([dayOfMonth, value], i) => `${i ? 'L' : 'M'}${x(dayOfMonth)},${y(value)}`).join(' ');
  const [todayDay, todayValue] = INSIGHTS_PACE.at(-1);
  const stroke = { fill: 'none', 'stroke-width': 2, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' };
  const gradient = lineGradient(ctx, 'pace-stroke');
  const area = fadeGradient(ctx, 'pace-area-fade', y(todayValue), y(0));
  return plot(ctx, 'pace-plot', 'Charts/pace', PACE_HEIGHT, ctx.t(previous ? 'insights_pace_label' : 'insights_pace_label_first'), [
    ctx.node({ key: 'pace-defs', tag: 'defs', children: [gradient.defs, area.defs] }),
    ...grid.flatMap(([value, label]) => [
      svgLine(ctx, `pace-grid-${value}`, [0, y(value), PLOT_WIDTH, y(value)], 'colors.border.base'),
      svgText(ctx, `pace-grid-${value}/label`, value ? thousands(ctx, label) : label, { x: 0, y: y(value) - 4 }),
    ]),
    previous && svgPath(ctx, 'pace-previous', line(PACE.previous), { stroke: { token: 'colors.border.strong' } }, stroke),
    svgPath(ctx, 'pace-area', `${line(INSIGHTS_PACE)} L${x(todayDay)},${y(0)} Z`, {}, { fill: area.fill }),
    svgPath(ctx, 'pace-current', line(INSIGHTS_PACE), {}, { ...stroke, stroke: gradient.fill }),
    previous && svgPath(ctx, 'pace-projected', line([[todayDay, todayValue], [PACE.days, INSIGHTS_PROJECTED_MONTH]]),
      {}, { ...stroke, stroke: gradient.fill, 'stroke-dasharray': '4 4' }),
    previous && svgText(ctx, 'pace-projected/value', 'R$ 4.620', {
      x: PLOT_WIDTH, y: y(INSIGHTS_PROJECTED_MONTH) + 28, anchor: 'end', font: 'typography.labelMedium', color: 'colors.text.secondary',
    }),
    ctx.node({
      key: 'pace-today', tag: 'circle', bind: { fill: { token: 'colors.brand.primary' }, stroke: { token: 'colors.surface.base' } },
      attrs: { cx: x(todayDay), cy: y(todayValue), r: 5, 'stroke-width': 2 },
    }),
    svgText(ctx, 'pace-today/value', 'R$ 3.450', { x: x(todayDay), y: y(todayValue) - 12, anchor: 'middle', font: 'typography.labelMedium', color: 'colors.text.primary' }),
    svgText(ctx, 'pace-axis-1', '1', { x: x(1), y: PACE_HEIGHT - 6, anchor: 'middle' }),
    svgText(ctx, 'pace-axis-today', ctx.t('charts_today'), { x: x(todayDay), y: PACE_HEIGHT - 6, anchor: 'middle', color: 'colors.text.primary' }),
    svgText(ctx, 'pace-axis-15', '15', { x: x(15), y: PACE_HEIGHT - 6, anchor: 'middle' }),
    svgText(ctx, 'pace-axis-31', '31', { x: PLOT_WIDTH, y: PACE_HEIGHT - 6, anchor: 'end' }),
  ]);
};
const monthPace = (ctx, previous) => [
  previous && ctx.node({
    key: 'pace-legend',
    styles: ['Charts/legend'],
    children: [
      legendGradientLine(ctx, 'legend-current', 'charts_legend_this_month'),
      legendKey(ctx, 'legend-previous', 'charts_legend_last_month', 'colors.border.strong'),
      legendKey(ctx, 'legend-projected', 'insights_legend_projected', 'colors.brand.primary', true),
    ],
  }),
  previous
    ? insightsPace(ctx, { previous, max: 5000, grid: [[0, '0'], [2500, '2.5'], [5000, '5']] })
    : insightsPace(ctx, { previous, max: 4000, grid: [[0, '0'], [2000, '2'], [4000, '4']] }),
];
const weekColumns = (ctx) => [columnChart(ctx, 'week', {
  months: WEEK_TOTALS.map((value, i) => ({ month: i + 1, value, label: ctx.t(`tx_weekday_${i + 1}`), caption: `R$ ${Math.round(value)}` })),
  max: 640,
  accent: 2,
  labelled: [0, 1, 2],
  label: ctx.t('tx_week_label'),
  gradient: true,
})];
// 2026 by month, past, present and future: Jan–Sep spent, October spent so far with its projected rest, Nov–Dec projected.
// Projections add the installments already due to the recent average. December's income carries the 13th salary.
const INSIGHTS_YEAR_PROJECTED = [0, 0, 0, 0, 0, 0, 0, 0, 0, 4620, 4480, 4310];
const INSIGHTS_INCOME = [6200, 6200, 6200, 6450, 6200, 6200, 6200, 6200, 6200, 6350, 6200, 9300];
const INSIGHTS_THIS_MONTH = 9;

const legendSwatch = (ctx, key, labelKey, projected) => {
  const gradient = !projected && themeGradient(ctx, `${key}/gradient`, [0, 12, 12, 0]);
  return ctx.node({
    key,
    styles: ['Charts/legendItem'],
    children: [
      ctx.node({
        key: `${key}/mark`, tag: 'svg', styles: ['Insights/swatch'], attrs: { viewBox: '0 0 12 12', 'aria-hidden': 'true' },
        children: [
          gradient && ctx.node({ key: `${key}/defs`, tag: 'defs', children: [gradient.defs] }),
          ctx.node({
            key: `${key}/mark/fill`,
            tag: 'rect',
            bind: projected ? { fill: { token: 'colors.brand.primary', alpha: 0.12 }, stroke: { token: 'colors.brand.primary', alpha: 0.6 } } : {},
            attrs: { x: 0.5, y: 0.5, width: 11, height: 11, rx: 3, ...(projected ? { 'stroke-dasharray': '3 2' } : { fill: gradient.fill }) },
          }),
        ],
      }),
      text(ctx, `${key}/label`, 'Screen/tertiary', { textKey: labelKey }),
    ],
  });
};
const legendGradientLine = (ctx, key, labelKey) => {
  const gradient = themeGradient(ctx, `${key}/gradient`, [0, 0, 16, 0]);
  return ctx.node({
    key,
    styles: ['Charts/legendItem'],
    children: [
      ctx.node({
        key: `${key}/mark`, tag: 'svg', styles: ['Insights/swatch', 'Insights/swatchWide'], attrs: { viewBox: '0 0 16 12', 'aria-hidden': 'true' },
        children: [
          ctx.node({ key: `${key}/defs`, tag: 'defs', children: [gradient.defs] }),
          ctx.node({ key: `${key}/line`, tag: 'path', attrs: { d: 'M1,6 H15', stroke: gradient.fill, 'stroke-width': 2, 'stroke-linecap': 'round' } }),
        ],
      }),
      text(ctx, `${key}/label`, 'Screen/tertiary', { textKey: labelKey }),
    ],
  });
};
const chartLegend = (ctx, key, items) => ctx.node({ key, styles: ['Charts/legend'], children: items });

// Shared geometry for both views: twelve months across the plot, labeled by initial, the current one emphasized.
const YEAR_TOP = 16;
const YEAR_BOTTOM = COLUMNS_HEIGHT - 24;
const yearGeometry = (max, min = 0) => {
  const band = PLOT_WIDTH / 12;
  return {
    y: (value) => Math.round((YEAR_BOTTOM - ((value - min) / (max - min)) * (YEAR_BOTTOM - YEAR_TOP)) * 10) / 10,
    center: (i) => Math.round((band * i + band / 2) * 10) / 10,
  };
};
const monthInitials = (ctx, key, center) => YEAR.map((_, i) => svgText(ctx, `${key}-month-${i + 1}/label`, ctx.t(`charts_month_short_${i + 1}`).slice(0, 1), {
  x: center(i), y: COLUMNS_HEIGHT - 6, anchor: 'middle', color: i === INSIGHTS_THIS_MONTH ? 'colors.text.primary' : 'colors.text.tertiary',
}));

const yearBars = (ctx) => {
  const { y, center } = yearGeometry(6000);
  const width = 18;
  const now = INSIGHTS_THIS_MONTH;
  const left = (i) => center(i) - width / 2;
  const capped = (i, from, to) => {
    const cap = y(to);
    return `M${left(i)},${y(from)} V${cap + 4} Q${left(i)},${cap} ${left(i) + 4},${cap} H${left(i) + width - 4} Q${left(i) + width},${cap} ${left(i) + width},${cap + 4} V${y(from)} Z`;
  };
  const square = (i, to) => `M${left(i)},${YEAR_BOTTOM} V${y(to)} H${left(i) + width} V${YEAR_BOTTOM} Z`;
  const { rest: past, accent: current } = columnGradients(ctx, 'year-bars', YEAR_TOP, YEAR_BOTTOM);
  return plot(ctx, 'year-plot', 'Charts/columns', COLUMNS_HEIGHT, ctx.t('insights_year_label'), [
    ctx.node({ key: 'year-defs', tag: 'defs', children: [past.defs, current.defs] }),
    svgLine(ctx, 'year-baseline', [0, YEAR_BOTTOM, PLOT_WIDTH, YEAR_BOTTOM], 'colors.border.base'),
    ...YEAR.flatMap((value, i) => {
      const month = i + 1;
      const projected = INSIGHTS_YEAR_PROJECTED[i];
      return [
        i < now && ctx.node({ key: `year-month-${month}`, tag: 'path', hotspot: true, attrs: { d: capped(i, 0, value), fill: past.fill } }),
        i === now && ctx.node({ key: `year-month-${month}`, tag: 'path', hotspot: true, attrs: { d: square(i, value), fill: current.fill } }),
        projected > 0 && ctx.node({
          key: `year-month-${month}/projected`, tag: 'path',
          bind: { fill: { token: 'colors.brand.primary', alpha: 0.12 }, stroke: { token: 'colors.brand.primary', alpha: 0.6 } },
          attrs: { d: capped(i, value, projected), 'stroke-width': 1, 'stroke-dasharray': '3 2' },
        }),
        (i === 6 || i === now) && svgText(ctx, `year-month-${month}/value`, thousands(ctx, String(value / 1000)), {
          x: center(i), y: y(Math.max(value, projected)) - 6, anchor: 'middle', font: 'typography.labelMedium', color: 'colors.text.primary',
        }),
      ];
    }),
    ...monthInitials(ctx, 'year', center),
  ]);
};

// A smooth curve through the points (Catmull-Rom as cubic Béziers), drawn from one index to another so a solid
// past and a dashed future meet without a kink.
const smooth = (points, from, to) => points.slice(from, to).map(([x1, y1], k) => {
  const i = from + k;
  const [x0, y0] = points[Math.max(i - 1, 0)];
  const [x2, y2] = points[i + 1];
  const [x3, y3] = points[Math.min(i + 2, points.length - 1)];
  const c1 = [x1 + (x2 - x0) / 6, y1 + (y2 - y0) / 6].map((v) => Math.round(v * 10) / 10);
  const c2 = [x2 - (x3 - x1) / 6, y2 - (y3 - y1) / 6].map((v) => Math.round(v * 10) / 10);
  return `${k ? '' : `M${x1},${y1} `}C${c1} ${c2} ${x2},${y2}`;
}).join(' ');
const yearLines = (ctx) => {
  // Lines start above zero, so a month's change shows; columns keep a zero baseline.
  const { y, center } = yearGeometry(10000, 2000);
  const now = INSIGHTS_THIS_MONTH;
  const spending = YEAR.map((value, i) => [center(i), y(i < now ? value : INSIGHTS_YEAR_PROJECTED[i])]);
  const income = INSIGHTS_INCOME.map((value, i) => [center(i), y(value)]);
  const stroke = { fill: 'none', 'stroke-width': 2.5, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' };
  const line = lineGradient(ctx, 'year-line-stroke');
  const area = fadeGradient(ctx, 'year-line-area', YEAR_TOP, YEAR_BOTTOM);
  const [spentX, spentY] = [center(now), y(YEAR[now])];
  return plot(ctx, 'year-plot', 'Charts/columns', COLUMNS_HEIGHT, ctx.t('insights_year_line_label'), [
    ctx.node({ key: 'year-defs', tag: 'defs', children: [line.defs, area.defs] }),
    svgLine(ctx, 'year-baseline', [0, YEAR_BOTTOM, PLOT_WIDTH, YEAR_BOTTOM], 'colors.border.base'),
    svgLine(ctx, 'year-now', [center(now), YEAR_TOP, center(now), YEAR_BOTTOM], 'colors.border.strong', 1, '2 3'),
    svgPath(ctx, 'year-spending-area', `${smooth(spending, 0, now - 1)} L${spending[now - 1][0]},${YEAR_BOTTOM} L${spending[0][0]},${YEAR_BOTTOM} Z`, {}, { fill: area.fill }),
    svgPath(ctx, 'year-income', smooth(income, 0, now), { stroke: { token: 'colors.border.strong' } }, { ...stroke, 'stroke-width': 1.5 }),
    svgPath(ctx, 'year-income-expected', smooth(income, now, 11), { stroke: { token: 'colors.border.strong' } }, { ...stroke, 'stroke-width': 1.5, 'stroke-dasharray': '3 4' }),
    svgPath(ctx, 'year-spending', smooth(spending, 0, now - 1), {}, { ...stroke, stroke: line.fill }),
    svgPath(ctx, 'year-spending-projected', smooth(spending, now - 1, 11), {}, { ...stroke, stroke: line.fill, 'stroke-dasharray': '4 5' }),
    ctx.node({
      key: 'year-spending-projected-now', tag: 'circle', bind: { fill: { token: 'colors.surface.base' }, stroke: { token: 'colors.brand.primary' } },
      attrs: { cx: spending[now][0], cy: spending[now][1], r: 4, 'stroke-width': 2 },
    }),
    ctx.node({
      key: 'year-spending-now', tag: 'circle', hotspot: true, bind: { fill: { token: 'colors.brand.primary' }, stroke: { token: 'colors.surface.base' } },
      attrs: { cx: spentX, cy: spentY, r: 5, 'stroke-width': 2 },
    }),
    svgText(ctx, 'year-spending-now/value', thousands(ctx, String(YEAR[now] / 1000)), {
      x: spentX - 9, y: spentY + 4, anchor: 'end', font: 'typography.labelMedium', color: 'colors.text.primary',
    }),
    ...monthInitials(ctx, 'year', center),
  ]);
};
const yearColumns = (ctx) => [
  chartLegend(ctx, 'year-legend', [
    legendSwatch(ctx, 'legend-spent', 'insights_legend_spent', false),
    legendSwatch(ctx, 'legend-projected', 'insights_legend_projected', true),
  ]),
  yearBars(ctx),
];
// Year draws as columns or as lines; the selected view's button is tonal.
const chartViewSwitch = (ctx, selected) => ctx.node({
  key: 'view-switch',
  styles: ['Insights/viewSwitch'],
  attrs: { role: 'group', 'aria-label': ctx.t('insights_views') },
  children: [['columns', 'chart_column', 'insights_view_columns'], ['line', 'chart_spline', 'insights_view_line']].map(([view, glyph, labelKey]) => OrbitIconButton(ctx, {
    key: `view-${view}`,
    variant: view === selected ? 'Tonal' : 'Standard',
    hotspot: true,
    styles: ['Home/switcherButton'],
    contentDescription: ctx.t(labelKey),
  }, [icon(ctx, `view-${view}/icon`, glyph, 'medium', view === selected ? 'colors.brand.primary' : 'colors.text.secondary')])),
});
const yearLineChart = (ctx) => [
  chartLegend(ctx, 'year-legend', [
    legendGradientLine(ctx, 'legend-spending', 'insights_legend_spending'),
    legendKey(ctx, 'legend-income', 'insights_legend_income', 'colors.border.strong'),
    legendKey(ctx, 'legend-projected', 'insights_legend_projected', 'colors.text.tertiary', true),
  ]),
  yearLines(ctx),
];

// [category, amount, share, direction, change against the same days, purchases]. Each period's amounts add up to its total.
const INSIGHTS_MONTH = {
  stepper: { textKey: 'home_month' },
  eyebrow: 'tx_spent_month',
  total: 'R$ 3.450,00',
  change: ['up', 'R$ 1.910'],
  vsKey: 'insights_vs_month',
  stats: [['charts_daily_average', 'R$ 492,86'], ['charts_biggest_day', 'R$ 704,60'], ['charts_purchases', '48']],
  chart: { titleKey: 'charts_pace_title', caption: { textKey: 'insights_days_of', textArgs: ['7', '31'] }, render: (ctx) => monthPace(ctx, true) },
  bar: [['groceries', 37], ['restaurants', 22], ['transport', 13], ['other', 28]],
  shares: [
    ['groceries', 'R$ 1.284,40', '37%', 'up', 'R$ 904', 14],
    ['restaurants', 'R$ 767,60', '22%', 'up', 'R$ 578', 12],
    ['transport', 'R$ 440,00', '13%', 'down', 'R$ 80', 8],
    ['health', 'R$ 388,00', '11%', 'up', 'R$ 308', 5],
    ['leisure', 'R$ 320,00', '9%', 'up', 'R$ 260', 5],
    ['bills', 'R$ 250,00', '7%', 'down', 'R$ 60', 4],
  ],
  months: true,
  family: [['A', 'Ana', 'R$ 2.139,00', 62], ['M', 'Marina', 'R$ 1.311,00', 38]],
  biggest: [
    ['carrefour', 'Carrefour', 'groceries', 'azul', null, 'R$ 412,30'],
    ['ipiranga', 'Posto Ipiranga', 'transport', 'azul', null, 'R$ 210,00', null, 'fuel'],
    ['outback', 'Outback', 'restaurants', 'bradesco', 'Marina', 'R$ 186,90'],
  ],
};
const INSIGHTS_WEEK = {
  ...INSIGHTS_MONTH,
  stepper: { textKey: 'tx_week_range' },
  eyebrow: 'tx_spent_week',
  total: 'R$ 1.115,20',
  change: ['down', 'R$ 287'],
  vsKey: 'insights_vs_week',
  stats: [['charts_daily_average', 'R$ 371,73'], ['charts_biggest_day', 'R$ 522,70'], ['charts_purchases', '10']],
  chart: { titleKey: 'insights_by_day', caption: { textKey: 'insights_days_of', textArgs: ['3', '7'] }, render: weekColumns },
  bar: [['restaurants', 25], ['transport', 21], ['groceries', 16], ['other', 38]],
  shares: [
    ['restaurants', 'R$ 278,80', '25%', 'up', 'R$ 92', 3],
    ['transport', 'R$ 234,90', '21%', 'down', 'R$ 120', 2],
    ['groceries', 'R$ 182,40', '16%', 'down', 'R$ 64', 1],
    ['health', 'R$ 177,20', '16%', 'up', 'R$ 57', 2],
    ['bills', 'R$ 155,90', '14%', 'up', 'R$ 156', 1],
    ['leisure', 'R$ 86,00', '8%', 'down', 'R$ 408', 1],
  ],
  months: false,
  family: [['A', 'Ana', 'R$ 760,10', 68], ['M', 'Marina', 'R$ 355,10', 32]],
  biggest: [
    ['ipiranga', 'Posto Ipiranga', 'transport', 'azul', null, 'R$ 210,00', null, 'fuel'],
    ['outback', 'Outback', 'restaurants', 'bradesco', 'Marina', 'R$ 186,90'],
    ['pao-de-acucar', 'Pão de Açúcar', 'groceries', 'azul', null, 'R$ 182,40'],
  ],
};
const INSIGHTS_YEAR = {
  ...INSIGHTS_MONTH,
  stepper: { text: '2026' },
  eyebrow: 'tx_spent_year',
  total: 'R$ 44.520,00',
  change: ['up', 'R$ 2.650'],
  vsKey: 'insights_vs_year',
  stats: [['insights_monthly_average', 'R$ 4.452,00'], ['insights_biggest_month', 'R$ 5.320,00'], ['charts_purchases', '548']],
  chart: { titleKey: 'insights_by_month', caption: { textKey: 'insights_year_projected', textArgs: ['R$ 54.480'] }, view: 'columns', render: yearColumns },
  bar: [['groceries', 36], ['restaurants', 21], ['transport', 14], ['other', 29]],
  shares: [
    ['groceries', 'R$ 16.030,00', '36%', 'up', 'R$ 1.120', 162],
    ['restaurants', 'R$ 9.350,00', '21%', 'up', 'R$ 1.480', 141],
    ['transport', 'R$ 6.230,00', '14%', 'down', 'R$ 310', 98],
    ['health', 'R$ 4.900,00', '11%', 'up', 'R$ 240', 52],
    ['leisure', 'R$ 4.450,00', '10%', 'up', 'R$ 380', 61],
    ['bills', 'R$ 3.560,00', '8%', 'down', 'R$ 260', 34],
  ],
  months: false,
  family: [['A', 'Ana', 'R$ 27.160,00', 61], ['M', 'Marina', 'R$ 17.360,00', 39]],
  biggest: [
    ['decolar', 'Decolar', 'leisure', 'amex', null, 'R$ 2.480,00'],
    ['fleury', 'Fleury', 'health', 'bradesco', 'Marina', 'R$ 1.240,00'],
    ['assai', 'Assaí Atacadista', 'groceries', 'azul', null, 'R$ 986,40'],
  ],
};
// Ana alone in her first month: nothing to compare, no family members, and only October's line.
const INSIGHTS_FIRST_MONTH = {
  ...INSIGHTS_MONTH,
  change: null,
  chart: { ...INSIGHTS_MONTH.chart, render: (ctx) => monthPace(ctx, false) },
  months: false,
  family: null,
  biggest: [
    ['carrefour', 'Carrefour', 'groceries', 'azul', null, 'R$ 412,30'],
    ['ipiranga', 'Posto Ipiranga', 'transport', 'azul', null, 'R$ 210,00', null, 'fuel'],
    ['outback', 'Outback', 'restaurants', 'bradesco', null, 'R$ 186,90'],
  ],
};

const insightsSummary = (ctx, p) => OrbitCard(ctx, { key: 'summary', variant: 'Base', hotspot: true }, [
  ctx.node({
    key: 'summary/content',
    styles: ['Home/hero'],
    children: [
      ctx.node({
        key: 'summary/top',
        styles: ['Home/spread'],
        children: [
          text(ctx, 'summary/eyebrow', 'Screen/eyebrow', { textKey: p.eyebrow }),
          p.change && changeOf(ctx, 'summary/delta', ...p.change, p.vsKey, [p.change[0] === 'up' ? 'Charts/deltaUp' : 'Insights/deltaDown']),
        ],
      }),
      text(ctx, 'summary/amount', 'OrbitCard/amount', { text: p.total }),
      !p.change && status(ctx, 'summary/first', 'calendar_days', 'colors.text.tertiary', 'insights_first_month'),
      ctx.node({
        key: 'stats',
        styles: ['Home/stats', 'Charts/stats'],
        children: p.stats.map(([labelKey, value], i) => stat(ctx, `stat-${i}`, labelKey, { text: value })),
      }),
      HorizontalDivider(ctx, { key: 'summary/divider' }),
      gap(ctx, 'summary/gap-chart', 'spacing.xxSmall'),
      p.chart.view ? ctx.node({
        key: 'chart-header',
        styles: ['Home/spread'],
        children: [
          ctx.node({
            key: 'chart-heading',
            styles: ['Family/info'],
            children: [
              text(ctx, 'chart-title', 'Family/name', { textKey: p.chart.titleKey }),
              text(ctx, 'chart-caption', 'Screen/tertiary', p.chart.caption),
            ],
          }),
          chartViewSwitch(ctx, p.chart.view),
        ],
      }) : ctx.node({
        key: 'chart-header',
        styles: ['Home/spread'],
        children: [
          text(ctx, 'chart-title', 'Family/name', { textKey: p.chart.titleKey }),
          text(ctx, 'chart-caption', 'Screen/tertiary', p.chart.caption),
        ],
      }),
      ...p.chart.render(ctx),
    ],
  }),
]);
const insightsCategories = (ctx, p) => OrbitCard(ctx, { key: 'shares', variant: 'Base' }, [
  shareBar(ctx, 'shares', p.bar),
  ...p.shares.flatMap(([category, amount, share, direction, change, count], i) => [
    i > 0 && HorizontalDivider(ctx, { key: `shares/divider-${i}` }),
    shareRow(ctx, [category, amount, share], p.change
      ? changeOf(ctx, `share-${category}/change`, direction, change, p.vsKey)
      : text(ctx, `share-${category}/count`, 'Screen/tertiary', { textKey: 'charts_tooltip_purchases', textArgs: [String(count)] })),
  ]),
]);
// Tapping a column opens that month; October is the one the prototype links.
const insightsMonths = (ctx) => OrbitCard(ctx, { key: 'months', variant: 'Base' }, [
  ctx.node({
    key: 'months/body',
    styles: ['Home/cardBody'],
    children: [
      columnChart(ctx, 'months', {
        months: MONTHS.map(([month, value]) => ({ month, value, caption: thousands(ctx, String(value / 1000)) })),
        max: 6000,
        accent: MONTHS.length - 1,
        labelled: [2, MONTHS.length - 1],
        label: ctx.t('insights_months_label'),
        hotspots: MONTHS.map((_, i) => i),
        gradient: true,
      }),
      text(ctx, 'months/average', 'Screen/secondary', { textKey: 'charts_average_month', textArgs: ['R$ 4.726'] }),
    ],
  }),
]);
const MEMBER_AVATARS = [
  { background: { token: 'colors.brand.primary' }, color: { token: 'colors.text.onBrand' } },
  { background: { token: 'colors.brand.accent' }, color: { token: 'colors.brand.ink' } },
];
const insightsFamily = (ctx, members) => OrbitCard(ctx, { key: 'family', variant: 'Base' }, [
  ctx.node({
    key: 'family/body',
    styles: ['Home/cardBody'],
    children: [
      splitBar(ctx, 'split', members.map(([, name, , share], i) => [name.toLowerCase(), share, MEMBER_AVATARS[i].background.token])),
      ...members.map(([initial, name, amount, share], i) => splitMember(
        ctx, `member-${name.toLowerCase()}`, initial, name, amount, `${share}%`, MEMBER_AVATARS[i], i === 0, true,
      )),
    ],
  }),
]);

const insightsHeader = (ctx, period, stepper) => [
  gap(ctx, 'gap-top', 'spacing.xxLarge'),
  inset(ctx, 'title/inset', text(ctx, 'title', 'SignIn/title', { textKey: 'insights_title' })),
  gap(ctx, 'gap-title', 'spacing.small'),
  ...(period ? [
    inset(ctx, 'periods/inset', ctx.node({
      key: 'periods',
      styles: ['Charts/periods'],
      attrs: { role: 'group', 'aria-label': ctx.t('charts_periods') },
      children: ['week', 'month', 'year'].map((option) => OrbitFilterChip(ctx, {
        key: `period-${option}`,
        labelKey: `charts_period_${option}`,
        selected: option === period,
        hotspot: true,
        styles: ['Settings/option'],
        attrs: { role: 'button', 'aria-pressed': option === period, tabindex: 0 },
      })),
    })),
    gap(ctx, 'gap-periods', 'spacing.small'),
    inset(ctx, 'stepper/inset', ctx.node({
      key: 'stepper',
      styles: ['Home/switcher'],
      children: [
        OrbitIconButton(ctx, { key: 'period-previous', hotspot: true, styles: ['Home/switcherButton'], contentDescription: ctx.t('tx_previous') }, [
          icon(ctx, 'period-previous/icon', 'chevron_left', 'medium', 'colors.text.secondary'),
        ]),
        text(ctx, 'stepper/label', 'Family/name', stepper, { styles: ['Family/name', 'Home/switcherLabel'] }),
        OrbitIconButton(ctx, { key: 'period-next', enabled: false, styles: ['Home/switcherButton'], contentDescription: ctx.t('tx_next') }, [
          icon(ctx, 'period-next/icon', 'chevron_right', 'medium', 'colors.text.disabled'),
        ]),
      ],
    })),
    gap(ctx, 'gap-stepper', 'spacing.medium'),
  ] : []),
];
// Two proposals for the period controls, drafted to compare with the chips and stepper above.
const weekStart = (ctx, month, day) => ({ textKey: 'insights_week_start', textArgs: [ctx.t(`charts_month_short_${month}`), day] });
const PERIOD_SELECTOR = {
  week: {
    title: { textKey: 'tx_week_range' },
    progress: 'insights_progress_week',
    rail: (ctx) => [
      ['sep-7', weekStart(ctx, 9, '7'), 980, 'past'],
      ['sep-14', weekStart(ctx, 9, '14'), 1240, 'past'],
      ['sep-21', weekStart(ctx, 9, '21'), 860, 'past'],
      ['sep-28', weekStart(ctx, 9, '28'), 1402, 'past'],
      ['oct-5', weekStart(ctx, 10, '5'), 1115.2, 'current'],
      ['oct-12', weekStart(ctx, 10, '12'), 0, 'future'],
      ['oct-19', weekStart(ctx, 10, '19'), 0, 'future'],
    ],
  },
  month: {
    title: { textKey: 'home_month' },
    progress: 'insights_progress_month',
    rail: () => [6, 7, 8, 9, 10, 11, 12].map((month) => [
      `month-${month}`, { textKey: `charts_month_short_${month}` }, YEAR[month - 1], month < 10 ? 'past' : month === 10 ? 'current' : 'future',
    ]),
  },
  year: {
    title: { text: '2026' },
    progress: 'insights_progress_year',
    rail: () => [['2024', { text: '2024' }, 39800, 'past'], ['2025', { text: '2025' }, 51870, 'past'], ['2026', { text: '2026' }, 44520, 'current']],
  },
};

const periodSegments = (ctx, period) => ctx.node({
  key: 'periods',
  styles: ['Insights/segmented'],
  attrs: { role: 'group', 'aria-label': ctx.t('charts_periods') },
  children: ['week', 'month', 'year'].map((option) => ctx.node({
    key: `period-${option}`,
    tag: 'button',
    styles: ['Insights/segment', option === period && 'Insights/segmentSelected'],
    textKey: `charts_period_${option}`,
    hotspot: option !== period,
    attrs: { 'aria-pressed': option === period },
  })),
});
const periodSteps = (ctx) => ctx.node({
  key: 'period/steps',
  styles: ['Home/switcher'],
  children: [
    OrbitIconButton(ctx, { key: 'period-previous', styles: ['Home/switcherButton'], contentDescription: ctx.t('tx_previous') }, [
      icon(ctx, 'period-previous/icon', 'chevron_left', 'medium', 'colors.text.secondary'),
    ]),
    OrbitIconButton(ctx, { key: 'period-next', enabled: false, styles: ['Home/switcherButton'], contentDescription: ctx.t('tx_next') }, [
      icon(ctx, 'period-next/icon', 'chevron_right', 'medium', 'colors.text.disabled'),
    ]),
  ],
});

// A: a segmented control for the length, then the period itself as a heading that opens a picker, stepped by arrows.
const segmentedHeader = (ctx, period) => {
  const { title, progress } = PERIOD_SELECTOR[period];
  return [
    gap(ctx, 'gap-top', 'spacing.xxLarge'),
    inset(ctx, 'title/inset', text(ctx, 'title', 'SignIn/title', { textKey: 'insights_title' })),
    gap(ctx, 'gap-title', 'spacing.small'),
    inset(ctx, 'periods/inset', periodSegments(ctx, period)),
    gap(ctx, 'gap-periods', 'spacing.medium'),
    inset(ctx, 'period/inset', ctx.node({
      key: 'period',
      styles: ['Home/spread'],
      children: [
        ctx.node({
          key: 'period/text',
          styles: ['Insights/periodText'],
          children: [
            ctx.node({
              key: 'period-pick',
              tag: 'button',
              styles: ['Home/monthRow'],
              attrs: { 'aria-label': ctx.t('insights_pick_period') },
              children: [
                text(ctx, 'period/title', 'Insights/periodTitle', title),
                icon(ctx, 'period/chevron', 'chevron_down', 'small', 'colors.text.secondary'),
              ],
            }),
            text(ctx, 'period/progress', 'Screen/tertiary', { textKey: progress }),
          ],
        }),
        periodSteps(ctx),
      ],
    })),
    gap(ctx, 'gap-period', 'spacing.medium'),
  ];
};

// B: the length beside the title, and a rail of recent periods, each a mini bar of what was spent; later ones are empty slots.
const RailHeight = 32;
const railItem = (ctx, key, label, share, state) => {
  const current = state === 'current';
  const future = state === 'future';
  const gradient = !future && themeGradient(ctx, `${key}/gradient`, [0, RailHeight, 0, 0], current ? 1 : 0.55);
  const height = Math.max(3, share * RailHeight);
  return ctx.node({
    key,
    tag: 'button',
    styles: ['Insights/railItem', current && 'Insights/railItemSelected'],
    attrs: { 'aria-pressed': current, ...(future ? { disabled: true } : {}) },
    children: [
      ctx.node({
        key: `${key}/bar`, tag: 'svg', styles: ['Insights/railBar'], attrs: { viewBox: `0 0 8 ${RailHeight}`, 'aria-hidden': 'true' },
        children: future ? [
          ctx.node({
            key: `${key}/slot`, tag: 'rect', bind: { stroke: { token: 'colors.border.strong' } },
            attrs: { x: 0.5, y: 0.5, width: 7, height: RailHeight - 1, rx: 3.5, fill: 'none', 'stroke-dasharray': '2 2' },
          }),
        ] : [
          ctx.node({ key: `${key}/defs`, tag: 'defs', children: [gradient.defs] }),
          ctx.node({ key: `${key}/track`, tag: 'rect', bind: { fill: { token: 'colors.border.base' } }, attrs: { width: 8, height: RailHeight, rx: 4 } }),
          ctx.node({ key: `${key}/value`, tag: 'rect', attrs: { y: RailHeight - height, width: 8, height, rx: 4, fill: gradient.fill } }),
        ],
      }),
      text(ctx, `${key}/label`, 'Insights/railLabel', label, {
        styles: ['Insights/railLabel', current && 'Insights/railLabelSelected', future && 'Insights/railLabelFuture'],
      }),
    ],
  });
};
const periodRail = (ctx, items) => {
  const max = Math.max(...items.map(([, , amount]) => amount));
  return ctx.node({
    key: 'rail',
    styles: ['Insights/rail'],
    attrs: { role: 'group', 'aria-label': ctx.t('insights_rail') },
    children: items.map(([key, label, amount, state]) => railItem(ctx, `rail-${key}`, label, amount / max, state)),
  });
};
const railHeader = (ctx, period) => {
  const { title, progress, rail } = PERIOD_SELECTOR[period];
  return [
    gap(ctx, 'gap-top', 'spacing.xxLarge'),
    ctx.node({
      key: 'header',
      styles: ['Home/spread', 'Home/inset'],
      children: [text(ctx, 'title', 'SignIn/title', { textKey: 'insights_title' }), periodSegments(ctx, period)],
    }),
    gap(ctx, 'gap-title', 'spacing.medium'),
    inset(ctx, 'rail/inset', periodRail(ctx, rail(ctx))),
    gap(ctx, 'gap-rail', 'spacing.small'),
    inset(ctx, 'period/inset', ctx.node({
      key: 'period',
      styles: ['Home/spread'],
      children: [
        ctx.node({
          key: 'period/text',
          styles: ['Insights/periodText'],
          children: [text(ctx, 'period/title', 'Insights/periodTitle', title), text(ctx, 'period/progress', 'Screen/tertiary', { textKey: progress })],
        }),
        periodSteps(ctx),
      ],
    })),
    gap(ctx, 'gap-period', 'spacing.medium'),
  ];
};

const insightsFrame = (id, name, period, p, header = insightsHeader) => frame(id, name, { status: 'proposed', spec: INSIGHTS_SPEC }, (ctx) => screenFrame(ctx, [
  ctx.node({
    key: 'content',
    styles: ['Home/scroll'],
    children: [
      ...header(ctx, period, p.stepper),
      inset(ctx, 'summary/inset', insightsSummary(ctx, p)),
      gap(ctx, 'gap-summary', 'spacing.large'),
      ...section(ctx, 'categories', sectionHeader(ctx, 'categories-header', 'charts_categories_eyebrow'), insightsCategories(ctx, p)),
      gap(ctx, 'gap-categories', 'spacing.large'),
      ...(p.months ? [
        ...section(ctx, 'months', sectionHeader(ctx, 'months-header', 'charts_months_eyebrow'), insightsMonths(ctx)),
        gap(ctx, 'gap-months', 'spacing.large'),
      ] : []),
      ...(p.family ? [
        ...section(ctx, 'family', sectionHeader(ctx, 'family-header', 'home_family_eyebrow'), insightsFamily(ctx, p.family)),
        gap(ctx, 'gap-family', 'spacing.large'),
      ] : []),
      ...section(ctx, 'biggest', sectionHeader(ctx, 'biggest-header', 'insights_biggest_eyebrow', 'home_see_all'), txCard(ctx, 'biggest', p.biggest)),
      gap(ctx, 'gap-bottom', 'spacing.large'),
    ],
  }),
  mainNav(ctx, MAIN_NAV.insights),
]));

const INSIGHTS_BY_PERIOD = { week: INSIGHTS_WEEK, month: INSIGHTS_MONTH, year: INSIGHTS_YEAR };
const insights = insightsFrame('insights', 'Insights · Month', 'month', INSIGHTS_MONTH);
const insightsWeek = insightsFrame('insights-week', 'Insights · Week', 'week', INSIGHTS_WEEK);
const insightsYear = insightsFrame('insights-year', 'Insights · Year', 'year', INSIGHTS_YEAR);
const insightsYearLine = insightsFrame('insights-year-line', 'Insights · Year · Line', 'year', {
  ...INSIGHTS_YEAR,
  chart: { ...INSIGHTS_YEAR.chart, view: 'line', render: yearLineChart },
});
const insightsSegmented = ['month', 'week', 'year'].map((period) => insightsFrame(
  `insights-segmented-${period}`, `Insights · Segmented · ${period[0].toUpperCase()}${period.slice(1)}`, period, INSIGHTS_BY_PERIOD[period], segmentedHeader,
));
const insightsTimeline = ['month', 'week', 'year'].map((period) => insightsFrame(
  `insights-timeline-${period}`, `Insights · Timeline · ${period[0].toUpperCase()}${period.slice(1)}`, period, INSIGHTS_BY_PERIOD[period], railHeader,
));
const insightsFirstMonth = insightsFrame('insights-first-month', 'Insights · First month', 'month', INSIGHTS_FIRST_MONTH);

// No expenses yet: the period controls would change nothing, so only the title and what will appear here.
const insightsEmpty = frame('insights-empty', 'Insights · No expenses yet', { status: 'proposed', spec: INSIGHTS_SPEC }, (ctx) => screenFrame(ctx, [
  ctx.node({
    key: 'content',
    styles: ['Home/scroll'],
    children: [
      ...insightsHeader(ctx, null),
      gap(ctx, 'gap-empty', 'spacing.small'),
      inset(ctx, 'empty/inset', OrbitCard(ctx, { key: 'empty', variant: 'Base' }, [
        ctx.node({
          key: 'empty/body',
          styles: ['Home/cardBody'],
          children: [
            ctx.node({ key: 'empty/badge', styles: ['Charts/infoBadge'], children: [icon(ctx, 'empty/icon', 'chart_pie_outline', 'medium', 'colors.direction.info')] }),
            text(ctx, 'empty/title', 'Home/cardTitle', { textKey: 'insights_empty_title' }),
            text(ctx, 'empty/text', 'Screen/guidance', { textKey: 'insights_empty_body' }),
            primary(ctx, 'connect', 'insights_empty_connect'),
            textButton(ctx, 'add-expense-empty', 'home_add_expense'),
          ],
        }),
      ])),
    ],
  }),
  mainNav(ctx, MAIN_NAV.insights),
]));

// One transaction: what, when, how it was paid, where it came from, and what it did to the budget.
const detailRow = (ctx, key, leading, labelKey, value, hotspot = false) => ctx.node({
  key,
  styles: ['Family/row'],
  hotspot,
  attrs: hotspot ? { role: 'button', tabindex: 0 } : {},
  children: [
    leading,
    ctx.node({
      key: `${key}/info`,
      styles: ['Family/info'],
      children: [text(ctx, `${key}/label`, 'Screen/tertiary', { textKey: labelKey }), text(ctx, `${key}/value`, 'Family/name', value, clipped('Family/name'))],
    }),
    hotspot && chevron(ctx, key),
  ],
});
const neutralBadge = (ctx, key, glyph) => ctx.node({
  key, styles: ['Home/badgeSmall'], bind: { background: { token: 'colors.surface.sunken' } }, children: [icon(ctx, `${key}/icon`, glyph, 'small', NEUTRAL)],
});
const transactionDetail = frame('transaction-detail', 'Transaction', { status: 'proposed', spec: TX_SPEC }, (ctx) => {
  const c = card('azul');
  const when = `${weekdayDate(ctx, TX_DAYS[1])} · 20:14`;
  return screenFrame(ctx, [
    content(ctx, [
      ctx.node({
        key: 'toolbar',
        styles: ['Home/spread', 'Screen/toolbar'],
        children: [backButton(ctx), iconAction(ctx, 'more', 'ellipsis', 'tx_more')],
      }),
      gap(ctx, 'gap-toolbar', 'spacing.xxSmall'),
      ctx.node({
        key: 'hero',
        styles: ['Tx/hero'],
        children: [
          badge(ctx, 'hero/badge', 'restaurants'),
          text(ctx, 'hero/merchant', 'Home/cardTitle', { text: 'iFood' }),
          text(ctx, 'hero/amount', 'OrbitCard/amount', { text: 'R$ 68,50' }),
          text(ctx, 'hero/when', 'Screen/secondary', { textKey: 'tx_when', textArgs: [ctx.t('home_yesterday'), when] }),
        ],
      }),
      gap(ctx, 'gap-hero', 'spacing.large'),
      OrbitCard(ctx, { key: 'details', variant: 'Base', styles: ['Charts/card'] }, [
        detailRow(ctx, 'category', badge(ctx, 'category/badge', 'restaurants', { small: true }), 'tx_category', { textKey: 'home_category_restaurants' }, true),
        HorizontalDivider(ctx, { key: 'details/divider-1' }),
        detailRow(ctx, 'card', thumb(ctx, 'card/thumb', c), 'tx_card', { textKey: 'wallet_number', textArgs: [c.name, c.last4] }, true),
        HorizontalDivider(ctx, { key: 'details/divider-2' }),
        detailRow(ctx, 'paid-by', text(ctx, 'paid-by/avatar', 'Family/avatar', { text: 'A' }), 'tx_paid_by', { textKey: 'tx_you', textArgs: ['Ana'] }, true),
        HorizontalDivider(ctx, { key: 'details/divider-3' }),
        detailRow(ctx, 'payment', neutralBadge(ctx, 'payment/badge', 'credit_card'), 'tx_payment', { textKey: 'tx_payment_single' }),
        HorizontalDivider(ctx, { key: 'details/divider-4' }),
        detailRow(ctx, 'source', neutralBadge(ctx, 'source/badge', 'plug'), 'tx_source', { textKey: 'tx_source_pluggy' }),
      ]),
      gap(ctx, 'gap-details', 'spacing.small'),
      OrbitCard(ctx, { key: 'statement', variant: 'Base', styles: ['Charts/card'] }, [
        ctx.node({
          key: 'statement/body',
          styles: ['Home/cardBody'],
          children: [
            text(ctx, 'statement/eyebrow', 'Screen/eyebrow', { textKey: 'tx_statement_eyebrow' }, { bind: { color: { token: 'colors.text.tertiary' } } }),
            text(ctx, 'statement/text', 'Tx/statement', { text: 'IFD*IFOOD.COM AGENCIA DE SAO PAULO BR' }),
          ],
        }),
      ]),
      gap(ctx, 'gap-statement', 'spacing.small'),
      OrbitCard(ctx, { key: 'note-card', variant: 'Base', styles: ['Charts/card'] }, [
        settingsRow(ctx, 'note', 'pencil', 'tx_note', { detail: { textKey: 'tx_note_detail' } }),
      ]),
      gap(ctx, 'gap-note', 'spacing.large'),
      text(ctx, 'budget-eyebrow', 'Screen/eyebrow', { textKey: 'tx_budget_eyebrow' }),
      gap(ctx, 'gap-budget-eyebrow', 'spacing.xxSmall'),
      OrbitCard(ctx, { key: 'budget', variant: 'Base', styles: ['Charts/card'], hotspot: true }, [
        ctx.node({
          key: 'budget/body',
          styles: ['Home/cardBody'],
          children: [
            ctx.node({
              key: 'budget/amounts',
              styles: ['Home/goalAmounts'],
              children: [
                text(ctx, 'budget/spent', 'Home/goalValue', { text: 'R$ 767,60' }),
                text(ctx, 'budget/of', 'Screen/secondary', { textKey: 'home_of', textArgs: ['R$ 700,00'] }),
                ctx.node({ key: 'budget/spacer', styles: ['Screen/grow'] }),
                status(ctx, 'budget/over', 'triangle_alert', 'colors.text.error', 'home_over', ['R$ 67,60']),
              ],
            }),
            OrbitLinearProgressIndicator(ctx, { key: 'budget/progress', progress: 1, status: 'Error', styles: ['Home/track'] }),
            text(ctx, 'budget/share', 'Screen/tertiary', { textKey: 'tx_budget_share', textArgs: ['10%'] }),
          ],
        }),
      ]),
      gap(ctx, 'gap-budget', 'spacing.large'),
      text(ctx, 'merchant-eyebrow', 'Screen/eyebrow', { textKey: 'tx_merchant_eyebrow', textArgs: ['IFOOD'] }),
      gap(ctx, 'gap-merchant-eyebrow', 'spacing.xxSmall'),
      OrbitCard(ctx, { key: 'merchant-card', variant: 'Base', styles: ['Charts/card'] }, [
        settingsRow(ctx, 'merchant', 'store', { textKey: 'tx_merchant_summary', textArgs: [9] }, { detail: { text: 'R$ 312,40' } }),
      ]),
      gap(ctx, 'gap-merchant', 'spacing.large'),
      ctx.node({
        key: 'tx-actions',
        styles: ['Home/gridRow'],
        children: [
          OrbitButton(ctx, { key: 'edit', variant: 'Outlined', hotspot: true, styles: ['Wallet/half'] }, [
            icon(ctx, 'edit/icon', 'pencil', 'medium', 'colors.text.primary', ['Screen/leadingIcon']),
            label(ctx, 'edit/label', { textKey: 'tx_edit' }),
          ]),
          OrbitButton(ctx, { key: 'delete', variant: 'Outlined', hotspot: true, styles: ['Wallet/half'] }, [
            icon(ctx, 'delete/icon', 'trash', 'medium', 'colors.text.error', ['Screen/leadingIcon']),
            label(ctx, 'delete/label', { textKey: 'tx_delete' }, 'Settings/danger'),
          ]),
        ],
      }),
    ]),
  ]);
});

// A bill belongs to the credit account, not to a physical card: every card on the account shares one bill, one limit,
// one closing day and one due day. A closed bill comes from the bank (total, minimum, payments); the open bill is the sum
// of its lines and a future bill holds only the installments already committed. Orbit never moves money, so nothing here
// pays a bill.
const BILL_SPEC = 'docs/specs/bill.md';
const BANK = 'Itaú';
const ACCOUNT_CARDS = ['4821', '7730'];
const AVATARS = {
  ana: { background: { token: 'colors.brand.primary' }, color: { token: 'colors.text.onBrand' } },
  marina: { background: { token: 'colors.brand.accent' }, color: { token: 'colors.brand.ink' } },
};
// Statement text is all the bank sends for a card purchase: no merchant name, logo or time of day.
// Amounts are as the bank reports them; a credit (refund) is negative.
const line = (key, statement, category, last4, amount, extra = {}) => ({ key, statement, category, last4, amount, ...extra });
const PAO = (amount, extra) => line('pao-de-acucar', 'PAO DE ACUCAR 1342', 'groceries', '4821', amount, extra);
const IFOOD = (amount) => line('ifood', 'IFD*IFOOD.COM AGENCIA DE SAO PAULO BR', 'restaurants', '4821', amount);
const UBER = (amount, extra) => line('uber', 'UBER *TRIP HELP.UBER.COM', 'transport', '7730', amount, extra);
const IPIRANGA = (amount) => line('ipiranga', 'POSTO IPIRANGA 0214', 'transport', '4821', amount, { glyph: 'fuel' });
// Installments carry their number and the original purchase date, which differs from the day they post.
const MAGALU = (number) => line('magalu', 'MAGALU*MAGAZINELUIZA', 'other', '4821', 'R$ 289,90', { glyph: 'store', installment: [number, 10, ['jul', 14]] });
const FAST_SHOP = (number) => line('fast-shop', 'FAST SHOP*FASTSHOP', 'other', '7730', 'R$ 122,40', { glyph: 'store', installment: [number, 3, ['aug', 21]] });
const group = (key, weekday, month, date, total, rows, labelKey) => ({ key, weekday, month, date, total, rows, labelKey });

// What is already committed to the next bills: [month, amount]. Magazine Luiza ends in May 2027.
const AFTER_NOVEMBER = [12, 1, 2, 3, 4, 5].map((month) => [month, 'R$ 289,90']);
const BILLS = {
  jul: {
    labelKey: 'bill_july',
    previous: false,
    eyebrow: { textKey: 'bill_no_record_eyebrow', textArgs: [BANK.toUpperCase()] },
    pill: ['neutral', { textKey: 'bill_status_no_record' }],
    dates: { textKey: 'bill_period', textArgs: [['jun', 13], ['jul', 12]] },
    notes: [['circle_help', { textKey: 'bill_no_record_note', textArgs: [BANK, 12] }]],
    lines: { count: 24, days: [
      group('jul-12', 7, 'jul', 12, 'R$ 167,80', [PAO('R$ 167,80')]),
      group('jul-11', 6, 'jul', 11, 'R$ 262,00', [line('cinemark', 'CINEMARK MORUMBI', 'leisure', '7730', 'R$ 72,00'), IPIRANGA('R$ 190,00')]),
    ] },
  },
  aug: {
    labelKey: 'bill_august',
    eyebrow: { textKey: 'bill_total_eyebrow', textArgs: [BANK.toUpperCase()] },
    pill: ['due', { textKey: 'bill_status_partial' }],
    amount: 'R$ 1.742,15',
    dates: { textKey: 'bill_closed_due', textArgs: [['aug', 12], ['aug', 20]] },
    minimum: 'R$ 261,32',
    payments: { rows: [['aug-20', 'partial', ['aug', 20], 'Pix', 'R$ 1.200,00']], short: 'R$ 542,15' },
    installments: { amount: 'R$ 289,90', share: 17, count: 1 },
    lines: { count: 26, reconcile: true, days: [
      group('aug-12', 3, 'aug', 12, 'R$ 201,70', [PAO('R$ 201,70')]),
      group('aug-11', 2, 'aug', 11, 'R$ 86,20', [IFOOD('R$ 54,80'), UBER('R$ 31,40')]),
    ] },
  },
  sep: {
    labelKey: 'bill_september',
    eyebrow: { textKey: 'bill_total_eyebrow', textArgs: [BANK.toUpperCase()] },
    pill: ['paid', { textKey: 'bill_status_paid' }],
    amount: 'R$ 1.986,40',
    dates: { textKey: 'bill_closed_due', textArgs: [['sep', 12], ['sep', 20]] },
    payments: { rows: [['sep-18', 'full', ['sep', 18], 'Pix', 'R$ 1.986,40']] },
    installments: { amount: 'R$ 412,30', share: 21, count: 2 },
    lines: { count: 28, reconcile: true, days: [
      group('sep-12', 6, 'sep', 12, 'R$ 143,20', [PAO('R$ 143,20')]),
      group('sep-11', 5, 'sep', 11, 'R$ 70,10', [
        line('netshoes', 'ESTORNO NETSHOES', 'other', '4821', '−R$ 79,90', { credit: true }),
        line('shell', 'SHELL BOX', 'transport', '7730', 'R$ 150,00', { glyph: 'fuel' }),
      ]),
    ] },
  },
  oct: {
    labelKey: 'bill_october',
    eyebrow: { textKey: 'bill_so_far_eyebrow' },
    pill: ['open', { textKey: 'bill_status_open' }],
    amount: 'R$ 2.140,20',
    dates: { textKey: 'wallet_closes_due', textArgs: [['oct', 12], ['oct', 20]] },
    limit: true,
    notes: [['calendar_days', { textKey: 'bill_dates_worked_out', textArgs: [12, 20] }]],
    installments: { amount: 'R$ 412,30', share: 19, count: 2, next: [[11, 'R$ 412,30'], ...AFTER_NOVEMBER], committed: 'R$ 2.151,70' },
    lines: { count: 31, days: [
      group('oct-7', 3, 'oct', 7, 'R$ 207,30', [PAO('R$ 182,40', { pending: true }), UBER('R$ 24,90', { pending: true })], 'home_today'),
      group('oct-6', 2, 'oct', 6, 'R$ 278,50', [IFOOD('R$ 68,50'), IPIRANGA('R$ 210,00')], 'home_yesterday'),
      group('oct-5', 1, 'oct', 5, 'R$ 155,90', [line('sabesp', 'SABESP*CONTA AGUA', 'bills', '4821', 'R$ 155,90')]),
    ] },
  },
  nov: {
    labelKey: 'bill_november',
    eyebrow: { textKey: 'bill_at_least_eyebrow' },
    pill: ['neutral', { textKey: 'bill_status_upcoming' }],
    amount: 'R$ 412,30',
    dates: { textKey: 'wallet_closes_due', textArgs: [['nov', 12], ['nov', 20]] },
    notes: [['calendar_days', { textKey: 'bill_future_note', textArgs: [['oct', 13]] }]],
    installments: { next: AFTER_NOVEMBER, committed: 'R$ 1.739,40' },
    lines: { count: 2, eyebrowKey: 'bill_committed_eyebrow', rows: [MAGALU(4), FAST_SHOP(3)] },
  },
};
// The open bill filtered to one card: the header keeps the account's bill, the list keeps that card's lines.
BILLS.octCard = {
  ...BILLS.oct,
  filter: '7730',
  lines: { count: 9, share: 'R$ 642,10', days: [
    group('oct-7', 3, 'oct', 7, 'R$ 24,90', [UBER('R$ 24,90', { pending: true })], 'home_today'),
    group('oct-4', 7, 'oct', 4, 'R$ 186,30', [line('coco-bambu', 'COCO BAMBU MORUMBI', 'restaurants', '7730', 'R$ 186,30')]),
    group('oct-2', 5, 'oct', 2, 'R$ 98,60', [
      line('netflix', 'NETFLIX.COM', 'leisure', '7730', 'R$ 55,90'),
      line('drogaria', 'DROGARIA SAO PAULO', 'health', '7730', 'R$ 42,70'),
    ]),
  ] },
};
// October once it closes, seen on Wed 14 Oct: the bank's total and minimum, nothing paid yet, due date ahead.
BILLS.octClosed = {
  labelKey: 'bill_october',
  eyebrow: { textKey: 'bill_total_eyebrow', textArgs: [BANK.toUpperCase()] },
  pill: ['due', { textKey: 'bill_status_due_in', textArgs: [6] }],
  amount: 'R$ 2.318,60',
  dates: { textKey: 'bill_closed_due', textArgs: [['oct', 12], ['oct', 20]] },
  minimum: 'R$ 347,79',
  notes: [
    ['calendar_days', { textKey: 'bill_installment_plan', textArgs: [BANK] }],
    ['circle_help', { textKey: 'bill_pay_elsewhere', textArgs: [BANK] }],
  ],
  payments: { none: ['oct', 20] },
  installments: { amount: 'R$ 412,30', share: 18, count: 2 },
  lines: { count: 38, reconcile: true, days: [
    group('oct-12', 1, 'oct', 12, 'R$ 115,10', [
      line('zona-sul', 'ZONA SUL SUPERMERCADOS', 'groceries', '4821', 'R$ 96,40'),
      line('99-pop', '99 *POP', 'transport', '7730', 'R$ 18,70'),
    ]),
    group('oct-10', 6, 'oct', 10, 'R$ 63,30', [line('madero', 'MADERO MORUMBI', 'restaurants', '4821', 'R$ 63,30')]),
  ] },
};
// A card added by hand: the user typed its closing and due days and its lines, so the total is their sum.
// Due on Nov 2, so it is the November bill.
BILLS.manual = {
  card: 'amex',
  labelKey: 'bill_november',
  eyebrow: { textKey: 'bill_sum_eyebrow' },
  pill: ['open', { textKey: 'bill_status_open' }],
  amount: 'R$ 870,30',
  dates: { textKey: 'wallet_closes_due', textArgs: [['oct', 26], ['nov', 2]] },
  notes: [['pencil', { textKey: 'bill_manual_note', textArgs: [26, 2] }]],
  lines: { count: 14, days: [
    group('oct-6', 2, 'oct', 6, 'R$ 57,30', [line('drogasil', 'Drogasil', 'health', '3005', 'R$ 57,30', { typed: true })], 'home_yesterday'),
    group('oct-5', 1, 'oct', 5, 'R$ 119,90', [line('smart-fit', 'Smart Fit', 'health', '3005', 'R$ 119,90', { typed: true })]),
  ] },
};
// Dates in textArgs are [month, day] pairs, localized here.
const dated = (ctx, args) => args.map((arg) => (Array.isArray(arg) ? day(ctx, arg) : arg));
const lastFour = (ctx, last4) => ctx.t('bill_card', last4);
const billPill = (ctx, key, [tone, content]) => text(ctx, key, 'Bill/pill', { ...content, textArgs: dated(ctx, content.textArgs ?? []) }, { styles: ['Bill/pill', `Bill/pill/${tone}`] });
const billNote = (ctx, key, [glyph, content]) => ctx.node({
  key,
  styles: ['Bill/note'],
  children: [
    icon(ctx, `${key}/icon`, glyph, 'xSmall', 'colors.text.tertiary', ['Bill/noteIcon']),
    ctx.node({ key: `${key}/text`, tag: 'span', ...content, textArgs: dated(ctx, content.textArgs ?? []) }),
  ],
});

// A line on a bill. With more than one card on the account and no card filter, each line names its card.
const billLine = (ctx, { key, statement, category, last4, amount, glyph, pending, credit, installment, typed }, { carded = false } = {}) => {
  const [number, of, bought] = installment ?? [];
  // The card goes first: when the line is too long, the category (also shown by the badge) is what gets cut.
  const detail = [
    carded && lastFour(ctx, last4),
    installment ? ctx.t('bill_bought', day(ctx, bought)) : ctx.t(`home_category_${category}`),
  ].filter(Boolean).join(' · ');
  const amountText = text(ctx, `${key}/amount`, 'Home/amount', { text: amount }, credit ? { bind: { color: { token: 'colors.text.success' } } } : {});
  const title = typed ? 'Family/name' : 'Bill/statement';
  return ctx.node({
    key,
    styles: ['Home/row'],
    hotspot: true,
    attrs: { role: 'button', tabindex: 0 },
    children: [
      badge(ctx, `${key}/badge`, category, { glyph }),
      ctx.node({
        key: `${key}/info`,
        styles: ['Family/info'],
        children: [
          text(ctx, `${key}/statement`, title, { text: statement }, clipped(title)),
          pending
            ? ctx.node({
              key: `${key}/detail`,
              styles: ['Family/pending'],
              children: [
                icon(ctx, `${key}/pending`, 'clock', 'xSmall', 'colors.text.tertiary'),
                ctx.node({ key: `${key}/detail-text`, tag: 'span', styles: ['Home/ellipsis'], textKey: 'bill_pending', textArgs: [detail] }),
              ],
            })
            : text(ctx, `${key}/detail`, 'Screen/tertiary', { text: detail }, clipped('Screen/tertiary')),
        ],
      }),
      // An installment shows its number under the amount, so the detail line keeps the original purchase date.
      installment ? ctx.node({
        key: `${key}/trailing`,
        styles: ['Home/trailing'],
        children: [
          amountText,
          text(ctx, `${key}/number`, 'Screen/tertiary', { textKey: number === of ? 'bill_installment_last' : 'bill_installment', textArgs: [number, of] }),
        ],
      }) : amountText,
    ],
  });
};
const billLines = (ctx, key, rows, options) => OrbitCard(ctx, { key, variant: 'Base' }, rows.flatMap((row, i) => [
  i > 0 && HorizontalDivider(ctx, { key: `${key}/divider-${i}` }),
  billLine(ctx, row, options),
]));

// The account's limit, as on Wallet · Card. In use counts every future installment, so it is more than the open bill.
const limitRows = (ctx, c) => [
  OrbitLinearProgressIndicator(ctx, { key: 'bill/limit', progress: c.used, status: 'Primary', styles: ['Home/track'] }),
  ctx.node({
    key: 'bill/footer',
    styles: ['Home/spread'],
    children: [
      text(ctx, 'bill/used', 'Screen/tertiary', { textKey: 'wallet_limit', textArgs: [c.limit] }),
      text(ctx, 'bill/available', 'Screen/tertiary', { textKey: 'wallet_available', textArgs: [c.available] }),
    ],
  }),
  text(ctx, 'bill/in-use', 'Screen/tertiary', { textKey: 'bill_in_use', textArgs: [c.inUse, BILLS.oct.installments.committed] }),
];

const billCard = (ctx, bill, c) => inset(ctx, 'bill/inset', OrbitCard(ctx, { key: 'bill', variant: 'Base' }, [
  ctx.node({
    key: 'bill/body',
    styles: ['Home/cardBody'],
    children: [
      ctx.node({
        key: 'bill/top',
        styles: ['Home/spread'],
        children: [text(ctx, 'bill/eyebrow', 'Screen/eyebrow', bill.eyebrow), billPill(ctx, 'bill/status', bill.pill)],
      }),
      bill.amount && text(ctx, 'bill/amount', 'OrbitCard/amount', { text: bill.amount }),
      text(ctx, 'bill/dates', 'Screen/secondary', { textKey: bill.dates.textKey, textArgs: dated(ctx, bill.dates.textArgs) }),
      ...(bill.limit ? limitRows(ctx, c) : []),
      bill.minimum && ctx.node({
        key: 'bill/minimum',
        styles: ['Home/spread'],
        children: [
          text(ctx, 'bill/minimum-label', 'Screen/secondary', { textKey: 'bill_minimum' }),
          text(ctx, 'bill/minimum-amount', 'Home/amount', { text: bill.minimum }),
        ],
      }),
    ],
  }),
  ...(bill.notes ? [
    HorizontalDivider(ctx, { key: 'bill/divider' }),
    ctx.node({ key: 'bill/notes', styles: ['Bill/notes'], children: bill.notes.map((note, i) => billNote(ctx, `bill/note-${i}`, note)) }),
  ] : []),
]));

// Payments exist only on closed bills, as the bank reports them. Orbit never marks a bill as paid.
const paymentsSection = (ctx, { rows = [], short, none }) => [
  ...section(ctx, 'payments', sectionHeader(ctx, 'payments-header', 'bill_payments_eyebrow'), settingsCard(ctx, 'payments', [
    ...rows.map(([key, kind, date, method, amount]) => settingsRow(ctx, `payment-${key}`, 'banknote', `bill_payment_${kind}`, {
      detail: { textKey: 'bill_payment_detail', textArgs: [day(ctx, date), method] },
      trailing: text(ctx, `payment-${key}/amount`, 'Home/amount', { text: amount }),
      hotspot: false,
    })),
    short && settingsRow(ctx, 'payment-short', 'triangle_alert', 'bill_short', {
      detail: { textKey: 'bill_short_detail' },
      trailing: text(ctx, 'payment-short/amount', 'Home/amount', { text: short }, { bind: { color: { token: 'colors.text.warning' } } }),
      hotspot: false,
    }),
    none && settingsRow(ctx, 'payment-none', 'clock', 'bill_no_payment', {
      detail: { textKey: 'bill_no_payment_detail', textArgs: [day(ctx, none)] },
      trailing: null,
      hotspot: false,
    }),
  ].filter(Boolean))),
  gap(ctx, 'gap-payments', 'spacing.large'),
];

// How much of this bill is installments, and what is already committed to the next bills ("at least", not a forecast).
const installmentsSection = (ctx, { amount, share, count, next, committed }) => [
  ...section(ctx, 'installments', sectionHeader(ctx, 'installments-header', 'bill_installments_eyebrow'), OrbitCard(ctx, { key: 'installments', variant: 'Base' }, [
    amount && ctx.node({
      key: 'installments/body',
      styles: ['Home/cardBody'],
      children: [
        ctx.node({
          key: 'installments/top',
          styles: ['Home/spread'],
          children: [
            text(ctx, 'installments/amount', 'Family/name', { textKey: 'bill_installments_share', textArgs: [amount] }),
            text(ctx, 'installments/percent', 'Screen/tertiary', { textKey: 'bill_installments_percent', textArgs: [`${share}%`] }),
          ],
        }),
        OrbitLinearProgressIndicator(ctx, { key: 'installments/bar', progress: share / 100, status: 'Primary', styles: ['Home/track'] }),
        text(ctx, 'installments/count', 'Screen/tertiary', { textKey: count === 1 ? 'bill_installments_count_one' : 'bill_installments_count', textArgs: [count] }),
      ],
    }),
    amount && next && HorizontalDivider(ctx, { key: 'installments/divider' }),
    next && ctx.node({
      key: 'next',
      styles: ['Home/cardBody'],
      children: [
        text(ctx, 'next/eyebrow', 'Screen/eyebrow', { textKey: 'bill_next_bills_eyebrow' }, { bind: { color: { token: 'colors.text.tertiary' } } }),
        ctx.node({
          key: 'next/strip',
          styles: ['Bill/strip'],
          attrs: { role: 'list' },
          children: next.map(([month, value]) => ctx.node({
            key: `next-${month}`,
            styles: ['Bill/stripItem'],
            hotspot: true,
            attrs: { role: 'button', tabindex: 0 },
            children: [
              text(ctx, `next-${month}/month`, 'Screen/tertiary', { textKey: `charts_month_short_${month}` }),
              text(ctx, `next-${month}/amount`, 'Home/amount', { text: value }),
            ],
          })),
        }),
        text(ctx, 'next/note', 'Screen/tertiary', { textKey: 'bill_next_bills_note', textArgs: [committed] }),
      ],
    }),
  ])),
  gap(ctx, 'gap-installments', 'spacing.large'),
];

// Lines grouped by day like Transactions. A closed bill's total is the bank's and can differ from its lines, so the list
// never sums up to it. The card filter shows when the account has more than one card.
const linesSection = (ctx, bill, cards) => {
  const { count, days, rows, share, reconcile, eyebrowKey = 'bill_lines_eyebrow' } = bill.lines;
  const carded = cards.length > 1 && !bill.filter;
  return [
    ctx.node({
      key: 'lines-header',
      styles: ['Home/spread', 'Home/inset'],
      children: [
        text(ctx, 'lines-header/eyebrow', 'Screen/eyebrow', { textKey: eyebrowKey }),
        text(ctx, 'lines-header/count', 'Screen/tertiary', { textKey: 'bill_lines_count', textArgs: [count] }),
      ],
    }),
    ...(reconcile ? [
      gap(ctx, 'gap-lines-note', 'spacing.xxSmall'),
      inset(ctx, 'lines-note/inset', text(ctx, 'lines-note', 'Screen/tertiary', { textKey: 'bill_lines_note', textArgs: [BANK] })),
    ] : []),
    ...(cards.length > 1 ? [
      gap(ctx, 'gap-chips', 'spacing.xSmall'),
      inset(ctx, 'cards/inset', ctx.node({
        key: 'cards',
        styles: ['Institutions/chips'],
        attrs: { role: 'radiogroup', 'aria-label': ctx.t('bill_cards_filter') },
        children: [null, ...cards].map((last4) => OrbitFilterChip(ctx, {
          key: `chip-${last4 ?? 'all'}`,
          ...(last4 ? { label: lastFour(ctx, last4) } : { labelKey: 'tx_filter_cards' }),
          selected: (bill.filter ?? null) === last4,
          hotspot: true,
          attrs: { role: 'radio', 'aria-checked': (bill.filter ?? null) === last4, tabindex: 0 },
        })),
      })),
    ] : []),
    ...(share ? [
      gap(ctx, 'gap-share', 'spacing.xSmall'),
      inset(ctx, 'share/inset', text(ctx, 'share', 'Screen/secondary', { textKey: 'bill_card_share', textArgs: [share, lastFour(ctx, bill.filter)] })),
    ] : []),
    gap(ctx, 'gap-lines', 'spacing.small'),
    ...(days
      ? days.flatMap((g) => dayGroup(ctx, g, { row: billLine, carded }))
      : [inset(ctx, 'lines/inset', billLines(ctx, 'lines', rows, { carded })), gap(ctx, 'gap-lines-after', 'spacing.medium')]),
    count > (days ? days.reduce((sum, g) => sum + g.rows.length, 0) : rows.length) && inset(ctx, 'see-all/inset', OrbitButton(ctx, {
      key: 'see-all', variant: 'Outlined', hotspot: true, styles: ['Screen/fill'],
    }, [label(ctx, 'see-all/label', { textKey: 'bill_see_all', textArgs: [count] })])),
  ];
};

const billFrame = (id, name, cycle) => frame(id, name, { status: 'proposed', spec: BILL_SPEC }, (ctx) => {
  const bill = BILLS[cycle];
  const c = card(bill.card ?? 'azul');
  const manual = Boolean(bill.card);
  const cards = manual ? [c.last4] : ACCOUNT_CARDS;
  const stepButton = (key, glyph, labelKey, enabled = true) => OrbitIconButton(ctx, {
    key, hotspot: enabled, enabled, styles: ['Home/switcherButton'], contentDescription: ctx.t(labelKey),
  }, [icon(ctx, `${key}/icon`, glyph, 'medium', enabled ? 'colors.text.secondary' : 'colors.text.disabled')]);
  return screenFrame(ctx, [
    ctx.node({
      key: 'content',
      styles: ['Home/scroll'],
      children: [
        gap(ctx, 'gap-top', 'spacing.xLarge'),
        inset(ctx, 'toolbar/inset', ctx.node({
          key: 'toolbar',
          styles: ['Home/spread', 'Screen/toolbar'],
          children: [backButton(ctx), !manual && iconAction(ctx, 'sync', 'sliders_horizontal', 'sync_title')],
        })),
        // The screen opens from one card, so it names every card the bill covers.
        inset(ctx, 'card/inset', ctx.node({
          key: 'card',
          styles: ['Family/row'],
          children: [
            thumb(ctx, 'card/thumb', c),
            ctx.node({
              key: 'card/text',
              styles: ['Home/headerText'],
              children: [
                text(ctx, 'card/name', 'Home/cardTitle', { text: c.name }),
                text(ctx, 'card/covers', 'Screen/secondary', manual
                  ? { textKey: 'bill_manual_card', textArgs: [c.network, c.last4] }
                  : { textKey: 'bill_covers', textArgs: cards.map((last4) => lastFour(ctx, last4)) }, clipped('Screen/secondary')),
              ],
            }),
          ],
        })),
        gap(ctx, 'gap-card', 'spacing.small'),
        inset(ctx, 'stepper/inset', ctx.node({
          key: 'stepper',
          styles: ['Home/switcher'],
          children: [
            stepButton('bill-previous', 'chevron_left', 'bill_previous', bill.previous !== false),
            text(ctx, 'stepper/label', 'Family/name', { textKey: bill.labelKey }, { styles: ['Family/name', 'Home/switcherLabel'] }),
            stepButton('bill-next', 'chevron_right', 'bill_next'),
          ],
        })),
        gap(ctx, 'gap-stepper', 'spacing.medium'),
        billCard(ctx, bill, c),
        gap(ctx, 'gap-bill', 'spacing.large'),
        ...(bill.payments ? paymentsSection(ctx, bill.payments) : []),
        ...(bill.installments ? installmentsSection(ctx, bill.installments) : []),
        ...linesSection(ctx, bill, cards),
        gap(ctx, 'gap-bottom', 'spacing.large'),
      ],
    }),
  ]);
});
const walletBill = billFrame('wallet-bill', 'Wallet · Bill', 'oct');
const walletBillCard = billFrame('wallet-bill-card', 'Wallet · Bill · One card', 'octCard');
const walletBillClosed = billFrame('wallet-bill-closed', 'Wallet · Bill · October closed', 'octClosed');
const walletBillSeptember = billFrame('wallet-bill-september', 'Wallet · Bill · September', 'sep');
const walletBillAugust = billFrame('wallet-bill-august', 'Wallet · Bill · August', 'aug');
const walletBillJuly = billFrame('wallet-bill-july', 'Wallet · Bill · July', 'jul');
const walletBillNovember = billFrame('wallet-bill-november', 'Wallet · Bill · November', 'nov');
const walletBillManual = billFrame('wallet-bill-manual', 'Wallet · Bill · Manual card', 'manual');

// The previous bill draft (commit cb25b34), kept unchanged next to the redraw so the two can be compared.
// Its strings carry a bill_v1_ prefix where the redraw changed or dropped them.
// A card's bill: one cycle at a time, what it adds up to, who spent it, where it went and the purchases on it.
// Status and payment always come from the bank; Orbit never marks a bill as paid.
const BILL_V1_SPEC = 'docs/specs/bill.md';
const BILL_V1_TOTALS = { 'oct-7': 'R$ 207,30', 'oct-6': 'R$ 278,50', 'oct-5': 'R$ 155,90' };
const BILL_V1_DAYS = TX_DAYS.map((group) => ({ ...group, total: BILL_V1_TOTALS[group.key], rows: group.rows.filter(([, , , cardKey]) => cardKey === 'azul') }));
// Installments are bought once and charged on later bills: [key, merchant, category, glyph, number, of, amount, total]
const INSTALLMENTS_V1 = {
  sep: [['magalu', 'Magazine Luiza', 'other', 'store', 2, 10, 'R$ 289,90', 'R$ 2.899,00'], ['fast-shop', 'Fast Shop', 'other', 'store', 1, 3, 'R$ 122,40', 'R$ 367,20']],
  oct: [['magalu', 'Magazine Luiza', 'other', 'store', 3, 10, 'R$ 289,90', 'R$ 2.899,00'], ['fast-shop', 'Fast Shop', 'other', 'store', 2, 3, 'R$ 122,40', 'R$ 367,20']],
  nov: [['magalu', 'Magazine Luiza', 'other', 'store', 4, 10, 'R$ 289,90', 'R$ 2.899,00'], ['fast-shop', 'Fast Shop', 'other', 'store', 3, 3, 'R$ 122,40', 'R$ 367,20']],
};
const BILLS_V1 = {
  sep: {
    labelKey: 'bill_september',
    eyebrowKey: 'bill_v1_paid_eyebrow',
    amount: 'R$ 1.986,40',
    dates: { textKey: 'bill_v1_closed_due', textArgs: [['sep', 12], ['sep', 20]] },
    status: ['circle_check', 'colors.text.success', 'bill_v1_paid_reported', [['sep', 20]]],
    members: [['ana', 'A', 'Ana', 'R$ 1.390,50', 70], ['marina', 'M', 'Marina', 'R$ 595,90', 30]],
    shares: [['groceries', 'R$ 794,60', 40, 10], ['restaurants', 'R$ 397,30', 20, 6], ['transport', 'R$ 238,40', 12, 5], ['other', 'R$ 556,10', 28, 7]],
    count: 28,
  },
  oct: {
    labelKey: 'bill_october',
    eyebrowKey: 'bill_v1_open_eyebrow',
    amount: 'R$ 2.140,20',
    corner: ['clock', 'colors.text.secondary', 'bill_v1_closes_in', [5]],
    dates: { textKey: 'wallet_closes_due', textArgs: [['oct', 12], ['oct', 20]] },
    limit: true,
    status: ['circle_check', 'colors.text.success', 'bill_v1_last_paid', ['R$ 1.986,40', ['sep', 20]]],
    members: [['ana', 'A', 'Ana', 'R$ 1.498,10', 70], ['marina', 'M', 'Marina', 'R$ 642,10', 30]],
    shares: [['groceries', 'R$ 791,90', 37, 9], ['transport', 'R$ 470,80', 22, 7], ['restaurants', 'R$ 278,20', 13, 6], ['other', 'R$ 599,30', 28, 9]],
    committed: true,
    days: true,
    count: 31,
  },
  nov: {
    labelKey: 'bill_november',
    eyebrowKey: 'bill_v1_next_eyebrow',
    amount: 'R$ 412,30',
    corner: ['calendar_days', 'colors.text.secondary', 'bill_v1_opens', [['oct', 13]]],
    dates: { textKey: 'wallet_closes_due', textArgs: [['nov', 12], ['nov', 20]] },
    status: ['calendar_days', 'colors.text.tertiary', 'bill_v1_next_note', [['oct', 13]]],
  },
};

// The bar under the text shows how much of the purchase is already charged.
const installmentRowV1 = (ctx, [key, merchant, category, glyph, number, of, amount, total]) => ctx.node({
  key: `installment-${key}`,
  styles: ['Bill/installment'],
  hotspot: true,
  attrs: { role: 'button', tabindex: 0 },
  children: [
    badge(ctx, `installment-${key}/badge`, category, { glyph }),
    ctx.node({
      key: `installment-${key}/info`,
      styles: ['Family/info'],
      children: [
        text(ctx, `installment-${key}/merchant`, 'Family/name', { text: merchant }, clipped('Family/name')),
        text(ctx, `installment-${key}/detail`, 'Screen/tertiary', number === of
          ? { textKey: 'bill_v1_installment_last', textArgs: [number, of] }
          : { textKey: 'bill_v1_installment', textArgs: [number, of, of - number] }, clipped('Screen/tertiary')),
        gap(ctx, `installment-${key}/gap`, 'spacing.xxxSmall'),
        OrbitLinearProgressIndicator(ctx, { key: `installment-${key}/bar`, progress: number / of, status: 'Primary', styles: ['Home/track'] }),
      ],
    }),
    ctx.node({
      key: `installment-${key}/trailing`,
      styles: ['Home/trailing'],
      children: [
        text(ctx, `installment-${key}/amount`, 'Home/amount', { text: amount }),
        text(ctx, `installment-${key}/total`, 'Screen/tertiary', { textKey: 'bill_v1_installment_total', textArgs: [total] }),
      ],
    }),
  ],
});

const billFrameV1 = (id, name, cycle) => frame(id, name, { status: 'proposed', spec: BILL_V1_SPEC }, (ctx) => {
  const c = { ...card('azul'), used: 0.18, available: 'R$ 9.859,80' };
  const bill = BILLS_V1[cycle];
  const statusLine = (key, [glyph, color, textKey, args]) => status(ctx, key, glyph, color, textKey, dated(ctx, args));
  return screenFrame(ctx, [
    ctx.node({
      key: 'content',
      styles: ['Home/scroll'],
      children: [
        gap(ctx, 'gap-top', 'spacing.xLarge'),
        inset(ctx, 'toolbar/inset', ctx.node({
          key: 'toolbar',
          styles: ['Home/spread', 'Screen/toolbar'],
          children: [backButton(ctx), iconAction(ctx, 'sync', 'sliders_horizontal', 'sync_title')],
        })),
        inset(ctx, 'card/inset', ctx.node({
          key: 'card',
          styles: ['Family/row'],
          children: [
            thumb(ctx, 'card/thumb', c),
            ctx.node({
              key: 'card/text',
              styles: ['Home/headerText'],
              children: [
                text(ctx, 'card/name', 'Home/cardTitle', { text: c.name }),
                text(ctx, 'card/number', 'Screen/secondary', { textKey: 'wallet_number', textArgs: [c.network, c.last4] }),
              ],
            }),
          ],
        })),
        gap(ctx, 'gap-card', 'spacing.small'),
        inset(ctx, 'stepper/inset', ctx.node({
          key: 'stepper',
          styles: ['Home/switcher'],
          children: [
            OrbitIconButton(ctx, { key: 'bill-previous', hotspot: true, styles: ['Home/switcherButton'], contentDescription: ctx.t('bill_previous') }, [
              icon(ctx, 'bill-previous/icon', 'chevron_left', 'medium', 'colors.text.secondary'),
            ]),
            text(ctx, 'stepper/label', 'Family/name', { textKey: bill.labelKey }, { styles: ['Family/name', 'Home/switcherLabel'] }),
            OrbitIconButton(ctx, { key: 'bill-next', hotspot: true, styles: ['Home/switcherButton'], contentDescription: ctx.t('bill_next') }, [
              icon(ctx, 'bill-next/icon', 'chevron_right', 'medium', 'colors.text.secondary'),
            ]),
          ],
        })),
        gap(ctx, 'gap-stepper', 'spacing.medium'),
        inset(ctx, 'bill/inset', OrbitCard(ctx, { key: 'bill', variant: 'Base' }, [
          ctx.node({
            key: 'bill/body',
            styles: ['Home/cardBody'],
            children: [
              ctx.node({
                key: 'bill/top',
                styles: ['Home/spread'],
                children: [
                  text(ctx, 'bill/eyebrow', 'Screen/eyebrow', { textKey: bill.eyebrowKey }),
                  bill.corner && statusLine('bill/corner', bill.corner),
                ],
              }),
              text(ctx, 'bill/amount', 'OrbitCard/amount', { text: bill.amount }),
              text(ctx, 'bill/dates', 'Screen/secondary', { textKey: bill.dates.textKey, textArgs: dated(ctx, bill.dates.textArgs) }),
              ...(bill.limit ? [
                OrbitLinearProgressIndicator(ctx, { key: 'bill/limit', progress: c.used, status: 'Primary', styles: ['Home/track'] }),
                ctx.node({
                  key: 'bill/footer',
                  styles: ['Home/spread'],
                  children: [
                    text(ctx, 'bill/used', 'Screen/tertiary', { textKey: 'wallet_limit', textArgs: [c.limit] }),
                    text(ctx, 'bill/available', 'Screen/tertiary', { textKey: 'wallet_available', textArgs: [c.available] }),
                  ],
                }),
              ] : []),
              HorizontalDivider(ctx, { key: 'bill/divider' }),
              statusLine('bill/status', bill.status),
            ],
          }),
        ])),
        gap(ctx, 'gap-bill', 'spacing.large'),
        ...(bill.members ? [
          ...section(ctx, 'members', sectionHeader(ctx, 'members-header', 'bill_v1_members_eyebrow'), OrbitCard(ctx, { key: 'members', variant: 'Base' }, [
            ctx.node({
              key: 'members/body',
              styles: ['Home/cardBody'],
              children: [
                splitBar(ctx, 'members/split', bill.members.map(([key, , , , share]) => [key, share, AVATARS[key].background.token])),
                ...bill.members.map(([key, initial, person, amount, share], i) => splitMember(ctx, `member-${key}`, initial, person, amount, `${share}%`, AVATARS[key], i === 0)),
              ],
            }),
          ])),
          gap(ctx, 'gap-members', 'spacing.large'),
        ] : []),
        ...(bill.shares ? [
          ...section(ctx, 'shares', sectionHeader(ctx, 'shares-header', 'bill_v1_categories_eyebrow'), OrbitCard(ctx, { key: 'shares', variant: 'Base' }, [
            shareBar(ctx, 'shares', bill.shares.map(([category, , share]) => [category, share])),
            ...bill.shares.flatMap(([category, amount, share, count], i) => [
              i > 0 && HorizontalDivider(ctx, { key: `shares/divider-${i}` }),
              shareRow(ctx, [category, amount, `${share}%`], text(ctx, `share-${category}/count`, 'Screen/tertiary', { textKey: 'bill_v1_purchases', textArgs: [count] })),
            ]),
          ])),
          gap(ctx, 'gap-shares', 'spacing.large'),
        ] : []),
        ...section(ctx, 'installments', sectionHeader(ctx, 'installments-header', 'bill_installments_eyebrow'), OrbitCard(ctx, { key: 'installments', variant: 'Base' }, [
          ...INSTALLMENTS_V1[cycle].flatMap((row, i) => [i > 0 && HorizontalDivider(ctx, { key: `installments/divider-${i}` }), installmentRowV1(ctx, row)]),
          ...(bill.committed ? [
            HorizontalDivider(ctx, { key: 'installments/divider-committed' }),
            settingsRow(ctx, 'committed', 'calendar_days', { textKey: 'bill_v1_committed', textArgs: ['R$ 2.151,70'] }, { detail: { textKey: 'bill_v1_committed_detail' } }),
          ] : []),
        ])),
        gap(ctx, 'gap-installments', 'spacing.large'),
        ...(bill.days ? BILL_V1_DAYS.flatMap((group) => dayGroup(ctx, group, { carded: false })) : []),
        bill.count && inset(ctx, 'see-all/inset', OrbitButton(ctx, { key: 'see-all', variant: 'Outlined', hotspot: true, styles: ['Screen/fill'] }, [
          label(ctx, 'see-all/label', { textKey: 'bill_v1_see_all', textArgs: [bill.count] }),
        ])),
        gap(ctx, 'gap-bottom', 'spacing.large'),
      ],
    }),
  ]);
});
const walletBillV1 = billFrameV1('wallet-bill-v1', 'Wallet · Bill v1 · October', 'oct');
const walletBillV1September = billFrameV1('wallet-bill-v1-september', 'Wallet · Bill v1 · September', 'sep');
const walletBillV1November = billFrameV1('wallet-bill-v1-november', 'Wallet · Bill v1 · November', 'nov');

// Which of the bank's cards Orbit loads, from when, and who uses each one. Without an end date it keeps fetching.
const SYNC_MODES = ['on', 'off'];
const syncCard = (ctx, key, initial, avatarBind, titleKey, digits, detail) => settingsRow(ctx, `sync-${key}`, null, { textKey: titleKey, textArgs: [digits] }, {
  detail,
  leading: text(ctx, `sync-${key}/avatar`, 'Family/avatar', { text: initial }, avatarBind ? { bind: avatarBind } : {}),
});
// Inside Screen/content, which already has the side gutter, so sections are not inset again.
const syncSection = (ctx, key, eyebrowKey, rows) => [
  text(ctx, `${key}-eyebrow`, 'Screen/eyebrow', { textKey: eyebrowKey }),
  gap(ctx, `${key}-gap`, 'spacing.xxSmall'),
  settingsCard(ctx, key, rows),
];
const walletCardSync = frame('wallet-card-sync', 'Wallet · Card sync', { status: 'proposed', spec: 'docs/specs/card-sync.md' }, (ctx) => screenFrame(ctx, [
  content(ctx, [
    ...header(ctx, 'sync_title', 'sync_guidance'),
    ...syncSection(ctx, 'load', 'sync_load_eyebrow', [
      ctx.node({
        key: 'load-stack',
        styles: ['Settings/stack'],
        children: [
          settingsRow(ctx, 'load-row', 'plug', { textKey: 'wallet_number', textArgs: ['Azul Itaú', '4821'] }, { detail: { textKey: 'tx_source_pluggy' }, trailing: null, hotspot: false }),
          ctx.node({
            key: 'load-options',
            styles: ['Settings/options'],
            attrs: { role: 'radiogroup', 'aria-label': ctx.t('sync_load_eyebrow') },
            children: SYNC_MODES.map((mode, i) => OrbitFilterChip(ctx, {
              key: `load-${mode}`,
              labelKey: `sync_load_${mode}`,
              selected: i === 0,
              hotspot: true,
              styles: ['Settings/option'],
              attrs: { role: 'radio', 'aria-checked': i === 0, tabindex: 0 },
            })),
          }),
        ],
      }),
    ]),
    gap(ctx, 'gap-load', 'spacing.large'),
    text(ctx, 'period-eyebrow', 'Screen/eyebrow', { textKey: 'sync_period_eyebrow' }),
    gap(ctx, 'gap-period-eyebrow', 'spacing.xxSmall'),
    ctx.node({
      key: 'period-row',
      styles: ['Home/gridRow'],
      children: [
        halfField(ctx, 'from', 'sync_from', { value: ctx.t('sync_from_value'), trailingIcon: icon(ctx, 'from/icon', 'calendar_days', 'medium', 'colors.text.tertiary') }),
        halfField(ctx, 'until', 'sync_until', { value: '', placeholderKey: 'sync_until_placeholder', trailingIcon: icon(ctx, 'until/icon', 'calendar_days', 'medium', 'colors.text.tertiary') }),
      ],
    }),
    gap(ctx, 'gap-period', 'spacing.xxSmall'),
    text(ctx, 'period-guidance', 'Screen/guidance', { textKey: 'sync_period_guidance' }),
    gap(ctx, 'gap-period-guidance', 'spacing.large'),
    ...syncSection(ctx, 'cards', 'sync_cards_eyebrow', [
      syncCard(ctx, 'main', 'A', AVATARS.ana, 'sync_card_main', '4821', { textKey: 'tx_you', textArgs: ['Ana'] }),
      syncCard(ctx, 'marina', 'M', AVATARS.marina, 'sync_card_additional', '7730', { text: 'Marina' }),
      syncCard(ctx, 'carlos', 'C', null, 'sync_card_additional', '5512', { textKey: 'sync_not_loaded', textArgs: ['Carlos', day(ctx, ['aug', 1])] }),
    ]),
    gap(ctx, 'gap-cards', 'spacing.xxSmall'),
    text(ctx, 'cards-guidance', 'Screen/guidance', { textKey: 'sync_cards_guidance' }),
    gap(ctx, 'gap-bottom', 'spacing.large'),
  ]),
]));

export const frames = [
  splash,
  signIn,
  legal('terms', 'Legal / Terms', 'terms', 'sign_in_terms'),
  legal('privacy', 'Legal / Privacy', 'privacy', 'sign_in_privacy_policy'),
  createAccount,
  forgotPassword,
  emailSent,
  emailValidation,
  joinFamily,
  familyMembers,
  invite,
  home,
  homeMonthPicker,
  homePulse,
  homeBudget,
  homeLeftover,
  insights,
  insightsWeek,
  insightsYear,
  insightsYearLine,
  ...insightsSegmented,
  ...insightsTimeline,
  insightsFirstMonth,
  insightsEmpty,
  charts,
  chartsCategory,
  wallet,
  walletCard,
  walletSortSheet,
  walletSort,
  walletAdd,
  walletRemove,
  walletCardEdit,
  walletCardEditImported,
  walletCardEditChosen,
  walletCardEditSaving,
  walletCardEditFailed,
  walletCardEditColor,
  walletBillJuly,
  walletBillAugust,
  walletBillSeptember,
  walletBill,
  walletBillCard,
  walletBillClosed,
  walletBillNovember,
  walletBillManual,
  walletBillV1September,
  walletBillV1,
  walletBillV1November,
  walletCardSync,
  transactions,
  transactionsWeek,
  transactionsDay,
  transactionsYear,
  transactionDetail,
  settings,
  settingsTheme,
  settingsSignOut,
  profile,
  profileGoogle,
  profilePhoto,
  profilePhotoSet,
  profileName,
  profilePhone,
  profilePassword,
  profilePasswordAdd,
  connectorsEmpty,
  connectorsNoBanks,
  connectors,
  pluggy,
  pluggyDisconnect,
  pluggyDisconnectDelete,
  pluggySetup,
  pluggySecretHelp,
  connectorsInstitutions,
  chooseBankHelp,
  connectBank,
  connectBankHelp,
];
