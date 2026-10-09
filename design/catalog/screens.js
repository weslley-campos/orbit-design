import {
  AnimatedOrbitLogo, Checkbox, CodeField, HorizontalDivider, OrbitBottomSheet, OrbitButton, OrbitCard, OrbitFilterChip, OrbitIconButton,
  OrbitLinearProgressIndicator, OrbitNavigationBar, OrbitOutlineTextField, OrbitScaffold, OrbitTopAppBar,
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
  text(ctx, 'title', 'SignIn/title', { textKey: titleKey }),
  gap(ctx, 'gap-title', 'spacing.small'),
  text(ctx, 'subtitle', 'SignIn/subtitle', { textKey: subtitleKey }),
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
const bankLogo = (ctx, key, initials) => text(ctx, `${key}/logo`, 'Institution/logo', { text: initials }, {
  styles: ['Institution/logo', `Institution/${key}`],
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
        status(ctx, 'pluggy/status', 'circle_check', 'colors.text.success', 'connectors_connected', ['2']), chevron(ctx, 'pluggy-row')),
      HorizontalDivider(ctx, { key: 'pluggy-divider' }),
      text(ctx, 'banks-eyebrow', 'Connectors/subhead', { textKey: 'connectors_banks_eyebrow' }),
      row(ctx, 'nubank', bankLogo(ctx, 'nubank', 'Nu'), 'Nubank',
        status(ctx, 'nubank/status', 'circle_check', 'colors.text.success', 'connectors_synced', ['5']), chevron(ctx, 'nubank')),
      row(ctx, 'itau', bankLogo(ctx, 'itau', 'It'), 'Itaú',
        status(ctx, 'itau/status', 'triangle_alert', 'colors.text.warning', 'connectors_sync_paused'),
        textButton(ctx, 'reconnect', 'connectors_reconnect', []), false),
      ctx.node({
        key: 'add-bank',
        styles: ['Family/row'],
        hotspot: true,
        attrs: { role: 'button', tabindex: 0 },
        children: [
          ctx.node({ key: 'add-bank/ring', styles: ['Family/addRing'], children: [icon(ctx, 'add-bank/icon', 'plus', 'small', 'colors.text.tertiary')] }),
          text(ctx, 'add-bank/label', 'Family/addPlaceholder', { textKey: 'connectors_add_bank' }),
          chevron(ctx, 'add-bank'),
        ],
      }),
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

// Opened from the Pluggy row: the credentials Orbit needs to call Pluggy's API.
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
    gap(ctx, 'gap-client-secret', 'spacing.small'),
    ...field(ctx, 'connector-id', 'pluggy_connector_id_label', {
      value: 'c3b1e2f4-7a9d-4e60-b8f5-1d2a6c9e0b47', placeholderKey: 'pluggy_connector_id_placeholder',
    }),
    gap(ctx, 'gap-connector-id', 'spacing.medium'),
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

// Sample of what Pluggy's GET /connectors returns: [key, initials, name, type, health.status, already connected].
const INSTITUTIONS = [
  ['banco-do-brasil', 'BB', 'Banco do Brasil', 'PERSONAL_BANK', 'ONLINE'],
  ['bradesco', 'Br', 'Bradesco', 'PERSONAL_BANK', 'ONLINE'],
  ['c6-bank', 'C6', 'C6 Bank', 'PERSONAL_BANK', 'ONLINE'],
  ['caixa', 'Cx', 'Caixa', 'PERSONAL_BANK', 'UNSTABLE'],
  ['inter', 'In', 'Inter', 'PERSONAL_BANK', 'ONLINE'],
  ['itau', 'It', 'Itaú', 'PERSONAL_BANK', 'ONLINE', true],
  ['nubank', 'Nu', 'Nubank', 'PERSONAL_BANK', 'ONLINE', true],
  ['santander', 'Sa', 'Santander', 'PERSONAL_BANK', 'OFFLINE'],
  ['xp', 'XP', 'XP Investimentos', 'INVESTMENT', 'ONLINE'],
];
const TYPE_KEYS = { PERSONAL_BANK: 'institutions_type_personal_bank', INVESTMENT: 'institutions_type_investment' };
const FILTERS = ['all', 'banks', 'investments'];

const institutionRow = (ctx, [key, initials, name, type, health, connected]) => {
  const offline = health === 'OFFLINE';
  const detail = health === 'ONLINE'
    ? text(ctx, `${key}/type`, 'Family/pending', { textKey: TYPE_KEYS[type] })
    : status(ctx, `${key}/health`, 'triangle_alert', offline ? 'colors.text.tertiary' : 'colors.text.warning',
      offline ? 'institutions_offline' : 'institutions_unstable');
  return ctx.node({
    key,
    styles: ['Family/row', offline && 'Institutions/offline'],
    hotspot: !offline,
    attrs: offline ? { 'aria-disabled': 'true' } : { role: 'button', tabindex: 0 },
    children: [
      text(ctx, `${key}/logo`, 'Institution/logo', { text: initials }, { styles: ['Institution/logo', `Institution/${key}`] }),
      ctx.node({
        key: `${key}/info`,
        styles: ['Family/info'],
        children: [text(ctx, `${key}/name`, 'Family/name', { text: name }), detail],
      }),
      connected
        ? text(ctx, `${key}/connected`, 'Family/youPill', { textKey: 'institutions_connected' })
        : !offline && icon(ctx, `${key}/chevron`, 'chevron_right', 'medium', 'colors.text.tertiary'),
    ],
  });
};

const connectorsInstitutions = frame('connectors-institutions', 'Connectors · Institutions', {
  status: 'proposed', spec: 'docs/specs/connectors.md',
}, (ctx) => screenFrame(ctx, [
  content(ctx, [
    ...header(ctx, 'institutions_title', 'institutions_guidance'),
    OrbitOutlineTextField(ctx, {
      key: 'search-field',
      placeholderKey: 'institutions_search',
      leadingIcon: icon(ctx, 'search-field/icon', 'search', 'medium', 'colors.text.tertiary'),
    }),
    gap(ctx, 'gap-search', 'spacing.small'),
    ctx.node({
      key: 'filters',
      styles: ['Institutions/chips'],
      attrs: { role: 'group', 'aria-label': ctx.t('institutions_filters') },
      children: FILTERS.map((filter, i) => OrbitFilterChip(ctx, {
        key: `filter-${filter}`,
        labelKey: `institutions_filter_${filter}`,
        selected: i === 0,
        hotspot: true,
        attrs: { role: 'button', 'aria-pressed': i === 0, tabindex: 0 },
      })),
    }),
    gap(ctx, 'gap-filters', 'spacing.large'),
    text(ctx, 'eyebrow', 'Screen/eyebrow', { textKey: 'institutions_eyebrow', textArgs: [String(INSTITUTIONS.length)] }),
    gap(ctx, 'gap-eyebrow', 'spacing.xxSmall'),
    OrbitCard(ctx, { key: 'institutions', variant: 'Base', styles: ['Institutions/list'] }, INSTITUTIONS.flatMap((row, i) => [
      i > 0 && HorizontalDivider(ctx, { key: `divider-${row[0]}` }),
      institutionRow(ctx, row),
    ])),
    gap(ctx, 'gap-card', 'spacing.small'),
    ctx.node({
      key: 'note',
      styles: ['Family/note'],
      children: [
        icon(ctx, 'note/icon', 'shield_check', 'medium', 'colors.text.tertiary'),
        ctx.node({ key: 'note/text', textKey: 'institutions_note' }),
      ],
    }),
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

const expense = (ctx, [key, merchant, category, dayKey, member, amount, glyph]) => ctx.node({
  key,
  styles: ['Home/row'],
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
const navItem = (ctx, glyph, labelKey, hotspot) => ({ labelKey, icon: navIcon(ctx, `nav-${glyph}`, glyph, hotspot) });
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
  ctx.node({
    key: 'bottom',
    styles: ['Home/bottom'],
    children: [OrbitNavigationBar(ctx, {
      key: 'nav',
      selectedIndex: 0,
      items: [
        navItem(ctx, 'house', 'home_nav_home'),
        navItem(ctx, 'receipt_text', 'home_nav_expenses'),
        {
          slot: ctx.node({
            key: 'nav-add-slot',
            styles: ['Home/addSlot'],
            children: [ctx.node({
              key: 'add-expense',
              styles: ['Home/addButton'],
              hotspot: true,
              attrs: addExpenseAttrs(ctx),
              children: [icon(ctx, 'add-expense/icon', 'plus', 'large', 'colors.text.onInk')],
            })],
          }),
        },
        navItem(ctx, 'target', 'home_nav_plans'),
        navItem(ctx, 'users', 'home_nav_family'),
      ],
    })],
  }),
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

const splitMember = (ctx, key, initial, name, amount, percent, avatarBind, youPill) => ctx.node({
  key,
  styles: ['Home/memberRow'],
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
      ctx.node({ key: 'clearance', styles: ['Home/clearance'] }),
    ],
  }),
  ctx.node({
    key: 'bottom',
    styles: ['Home/bottom'],
    children: [
      ctx.node({
        key: 'add-expense',
        styles: ['Home/fab', 'Home/fabSquare', 'Home/fabAbove'],
        hotspot: true,
        attrs: addExpenseAttrs(ctx),
        children: [icon(ctx, 'add-expense/icon', 'plus', 'large', 'colors.text.onInk')],
      }),
      OrbitNavigationBar(ctx, {
        key: 'nav',
        selectedIndex: 0,
        items: [navItem(ctx, 'house', 'home_nav_home'), navItem(ctx, 'receipt_text', 'home_nav_expenses'), navItem(ctx, 'target', 'home_nav_plans')],
      }),
    ],
  }),
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
      ctx.node({ key: 'clearance', styles: ['Home/clearance'] }),
    ],
  }),
  ctx.node({
    key: 'add-expense',
    styles: ['Home/fab', 'Home/fabPill', 'Home/fabFloor'],
    hotspot: true,
    attrs: addExpenseAttrs(ctx),
    children: [
      icon(ctx, 'add-expense/icon', 'plus', 'medium', 'colors.text.onInk'),
      text(ctx, 'add-expense/label', 'Screen/label', { textKey: 'home_add_expense' }),
    ],
  }),
]));

const addNavItem = (ctx) => ({
  labelKey: 'home_nav_add',
  icon: ctx.node({
    key: 'add-expense',
    styles: ['Home/navAdd'],
    hotspot: true,
    attrs: addExpenseAttrs(ctx),
    children: [icon(ctx, 'add-expense/icon', 'plus', 'large', 'colors.text.onInk')],
  }),
});

// Home, Charts, Add, Cards and Settings; the destinations other than the selected one are hotspots.
const MAIN_NAV = { home: 0, settings: 4 };
const mainNav = (ctx, selectedIndex) => ctx.node({
  key: 'bottom',
  styles: ['Home/bottom'],
  children: [OrbitNavigationBar(ctx, {
    key: 'nav',
    selectedIndex,
    items: [
      navItem(ctx, 'house', 'home_nav_home', selectedIndex !== MAIN_NAV.home),
      navItem(ctx, 'chart_no_axes_column', 'home_nav_charts'),
      addNavItem(ctx),
      navItem(ctx, 'credit_card', 'home_nav_cards'),
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
  mainNav(ctx, 0),
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

const PALETTES = ['spruce', 'indigo', 'plum', 'orchid', 'flamingo', 'azure', 'ember', 'graphite'];
const MODES = ['system', 'light', 'dark'];

// Each Settings row: a neutral icon badge, a title with an optional detail line, and a chevron unless `trailing` says otherwise.
const settingsRow = (ctx, key, glyph, titleKey, { detail, trailing, hotspot = true } = {}) => ctx.node({
  key,
  styles: ['Family/row'],
  hotspot,
  attrs: hotspot ? { role: 'button', tabindex: 0 } : {},
  children: [
    ctx.node({
      key: `${key}/badge`,
      styles: ['Home/badgeSmall'],
      bind: { background: { token: 'colors.surface.sunken' } },
      children: [icon(ctx, `${key}/icon`, glyph, 'small', NEUTRAL)],
    }),
    ctx.node({
      key: `${key}/info`,
      styles: ['Family/info'],
      children: [
        text(ctx, `${key}/title`, 'Family/name', { textKey: titleKey }, clipped('Family/name')),
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
    attrs: { role: 'button', tabindex: 0, 'aria-label': ctx.t('settings_account') },
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
          detail: { textKey: 'settings_connectors_detail', textArgs: ['2'] },
        }),
      ]),
      ...settingsSection(ctx, 'preferences', 'settings_preferences_eyebrow', [
        settingsRow(ctx, 'language', 'languages', 'settings_language', { detail: { textKey: 'settings_language_value' } }),
        settingsRow(ctx, 'currency', 'banknote', 'settings_currency', { detail: { textKey: 'settings_currency_value' } }),
        settingsRow(ctx, 'notifications', 'bell', 'settings_notifications', { detail: { textKey: 'settings_notifications_detail' } }),
      ]),
      ...settingsSection(ctx, 'security', 'settings_security_eyebrow', [
        settingsRow(ctx, 'app-lock', 'lock', 'settings_app_lock', { detail: { textKey: 'settings_app_lock_detail' } }),
        settingsRow(ctx, 'password', 'key_round', 'settings_password', { detail: { textKey: 'settings_password_detail' } }),
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
      gap(ctx, 'gap-sign-out', 'spacing.xxSmall'),
      inset(ctx, 'delete-account/inset', OrbitButton(ctx, { key: 'delete-account', variant: 'Text', hotspot: true, styles: ['Screen/fill'] }, [
        label(ctx, 'delete-account/label', { textKey: 'settings_delete_account' }, 'Settings/danger'),
      ])),
      gap(ctx, 'gap-delete', 'spacing.xxSmall'),
      text(ctx, 'version', 'Settings/version', { textKey: 'settings_version', textArgs: ['1.0.0 (42)'] }),
      gap(ctx, 'gap-bottom', 'spacing.large'),
    ],
  }),
  mainNav(ctx, MAIN_NAV.settings),
]));

// A bottom sheet over Settings, like the month picker over Home.
const settingsSheet = (id, name, sheetKey, labelKey, content) => frame(id, name, {
  status: 'proposed', spec: 'docs/specs/settings.md',
}, (ctx) => ctx.node({
  key: `${sheetKey}-frame`,
  styles: ['OrbitScaffold'],
  children: [
    ctx.node({
      key: `${sheetKey}-background`,
      styles: ['MonthPicker/background'],
      attrs: { inert: '', 'aria-hidden': 'true' },
      children: [settings.render(ctx)],
    }),
    OrbitBottomSheet(ctx, {
      key: sheetKey,
      attrs: { role: 'dialog', 'aria-modal': 'true', 'aria-label': ctx.t(labelKey) },
    }, [ctx.node({ key: `${sheetKey}-content`, styles: ['Screen/content'], children: content(ctx) })]),
  ],
}));

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
  settings,
  settingsTheme,
  settingsSignOut,
  connectorsEmpty,
  connectors,
  pluggySetup,
  pluggySecretHelp,
  connectorsInstitutions,
];
