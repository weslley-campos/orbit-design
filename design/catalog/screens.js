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

// Home, Charts, Add, Wallet and Settings, each with filled artwork when selected. The destinations other than the selected one are hotspots;
// their keys stay the old hotspot ids (`nav-house`, `nav-user_round`) so saved prototype links keep working.
const MAIN_NAV = { home: 0, charts: 1, wallet: 3, settings: 4 };
const mainNav = (ctx, selectedIndex) => ctx.node({
  key: 'bottom',
  styles: ['Home/bottom'],
  children: [OrbitNavigationBar(ctx, {
    key: 'nav',
    selectedIndex,
    items: [
      navToggleItem(ctx, 'nav-house', 'home', 'home_nav_home', selectedIndex !== MAIN_NAV.home),
      navToggleItem(ctx, 'nav-charts', 'chart_pie', 'home_nav_charts', selectedIndex !== MAIN_NAV.charts),
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

// Columns with 4dp rounded caps, square at the baseline; `selected` adds the tooltip a tap shows.
const COLUMNS_HEIGHT = 176;
const columnChart = (ctx, key, { months, max, budget, budgetLabel, accent, labelled = [], tooltip, label }) => {
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
  return plot(ctx, `${key}-plot`, 'Charts/columns', COLUMNS_HEIGHT, label, [
    svgLine(ctx, `${key}-baseline`, [0, bottom, PLOT_WIDTH, bottom], 'colors.border.base'),
    ...months.flatMap(({ month, value, caption }, i) => [
      svgPath(ctx, `${key}-month-${month}`, column(i, value), {
        fill: i === accent ? { token: 'colors.brand.primary' } : { token: 'colors.text.tertiary', alpha: 0.28 },
      }),
      labelled.includes(i) && svgText(ctx, `${key}-month-${month}/value`, caption, {
        x: center(i), y: y(value) - 6, anchor: 'middle', font: 'typography.labelMedium', color: 'colors.text.primary',
      }),
      svgText(ctx, `${key}-month-${month}/label`, ctx.t(`charts_month_short_${month}`), {
        x: center(i), y: COLUMNS_HEIGHT - 6, anchor: 'middle', color: i === accent ? 'colors.text.primary' : 'colors.text.tertiary',
      }),
    ]),
    svgLine(ctx, `${key}-budget`, [0, y(budget), PLOT_WIDTH, y(budget)], 'colors.text.tertiary'),
    svgText(ctx, `${key}-budget/label`, budgetLabel, { x: 0, y: y(budget) - 5, color: 'colors.text.secondary' }),
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
const shareRow = (ctx, [category, amount, share, direction, change]) => ctx.node({
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
        trend(ctx, `share-${category}/trend`, direction, change),
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
const categoriesCard = (ctx) => OrbitCard(ctx, { key: 'shares', variant: 'Base' }, [
  ctx.node({
    key: 'shares/bar-row',
    styles: ['Home/cardBody'],
    children: [ctx.node({
      key: 'shares/bar',
      styles: ['Home/split', 'Charts/split'],
      children: [['groceries', 37], ['restaurants', 22], ['transport', 13], ['other', 28]].map(([category, share]) => ctx.node({
        key: `shares/bar/${category}`,
        styles: [`Home/grow/${share}`],
        bind: { background: { token: CATEGORIES[category].color ?? OTHER_ARC } },
      })),
    })],
  }),
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

// Wallet: the cards, stacked like Apple Wallet. Art comes from assets/proposed/cards (bank artwork the user supplied);
// the app would use the issuer's card image from Pluggy or a generated card.
const WALLET_SPEC = 'docs/specs/wallet.md';
const CARDS = [
  { key: 'azul', name: 'Azul Itaú', art: 'azul', network: 'Mastercard', last4: '4821', bill: 'R$ 2.140,20', closes: ['oct', 12], due: ['oct', 20], used: 0.18, limit: 'R$ 12.000,00', available: 'R$ 9.859,80' },
  { key: 'amazon', name: 'Amazon Mastercard', art: 'amazon', network: 'Mastercard', last4: '1093', bill: 'R$ 486,90', closes: ['oct', 8], due: ['oct', 15] },
  { key: 'bradesco', name: 'Bradesco Diners', art: 'bradesco-diners', network: 'Elo', last4: '7712', bill: 'R$ 1.315,00', closes: ['oct', 18], due: ['oct', 25] },
  { key: 'amex', name: 'Amex Green', art: 'amex-green', network: 'Amex', last4: '3005', bill: 'R$ 870,30', closes: ['oct', 26], due: ['nov', 2] },
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
const walletSort = sheetFrame('wallet-sort', 'Wallet · Sort', WALLET_SPEC, wallet, 'sort-sheet', 'wallet_sort', (ctx) => [
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
const editRow = (ctx, c, dragging = false) => ctx.node({
  key: `edit-${c.key}`,
  styles: ['Family/row', dragging && 'Wallet/dragging'],
  children: [
    OrbitIconButton(ctx, { key: `edit-${c.key}/remove`, hotspot: true, contentDescription: ctx.t('wallet_remove_card', c.name) }, [
      icon(ctx, `edit-${c.key}/remove/icon`, 'circle_minus', 'medium', 'colors.text.error'),
    ]),
    thumb(ctx, `edit-${c.key}/thumb`, c),
    cardInfo(ctx, `edit-${c.key}`, c, { textKey: 'wallet_number', textArgs: [c.network, c.last4] }),
    ctx.node({
      key: `edit-${c.key}/handle`, styles: ['Wallet/handle'], attrs: { role: 'button', 'aria-label': ctx.t('wallet_reorder_card', c.name) },
      children: [icon(ctx, `edit-${c.key}/handle/icon`, 'grip_vertical', 'medium', 'colors.text.tertiary')],
    }),
  ],
});
const walletEdit = frame('wallet-edit', 'Wallet · Edit cards', { status: 'proposed', spec: WALLET_SPEC }, (ctx) => screenFrame(ctx, [
  content(ctx, [
    ...header(ctx, 'wallet_edit_title', 'wallet_edit_guidance'),
    OrbitCard(ctx, { key: 'cards', variant: 'Base', styles: ['Charts/card'] }, [
      editRow(ctx, card('azul')),
      HorizontalDivider(ctx, { key: 'cards/divider-1' }),
      editRow(ctx, card('bradesco'), true),
      editRow(ctx, card('amazon')),
      HorizontalDivider(ctx, { key: 'cards/divider-3' }),
      editRow(ctx, card('amex')),
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
const walletAdd = frame('wallet-add', 'Wallet · Add card', { status: 'proposed', spec: WALLET_SPEC }, (ctx) => screenFrame(ctx, [
  content(ctx, [
    ...header(ctx, 'wallet_add', 'wallet_add_guidance'),
    ctx.node({
      key: 'preview',
      styles: ['Wallet/preview'],
      attrs: { role: 'img', 'aria-label': 'Nubank Ultravioleta' },
      children: [
        text(ctx, 'preview/name', 'Wallet/previewName', { text: 'Nubank Ultravioleta' }),
        ctx.node({ key: 'preview/spacer', styles: ['Screen/grow'] }),
        ctx.node({
          key: 'preview/bottom',
          styles: ['Home/spread'],
          children: [text(ctx, 'preview/number', 'Wallet/previewNumber', { text: '•••• 6620' }), text(ctx, 'preview/network', 'Wallet/previewName', { text: 'Mastercard' })],
        }),
      ],
    }),
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
    text(ctx, 'remove-body', 'Screen/guidance', { textKey: 'wallet_remove_body' }),
    gap(ctx, 'remove-gap-body', 'spacing.large'),
    actions(ctx, [
      OrbitButton(ctx, { key: 'remove-confirm', variant: 'Destructive', hotspot: true, styles: ['Screen/fill'] }, [
        label(ctx, 'remove-confirm/label', { textKey: 'wallet_remove_confirm' }),
      ]),
      textButton(ctx, 'remove-cancel', 'wallet_cancel'),
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
  charts,
  chartsCategory,
  wallet,
  walletCard,
  walletSort,
  walletEdit,
  walletAdd,
  walletRemove,
  settings,
  settingsTheme,
  settingsSignOut,
  connectorsEmpty,
  connectors,
  pluggySetup,
  pluggySecretHelp,
  connectorsInstitutions,
];
