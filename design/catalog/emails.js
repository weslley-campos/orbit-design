import { HorizontalDivider, OrbitButton } from './components.js';
import { text } from './screens.js';

const SPEC = 'orbit-api: docs/specs/email-verification.md';
const VERIFICATION_CODE = '482917';
const LANGUAGE_NAMES = { pt: 'Português', en: 'English' };
const WIDTH = 664;

const emailFrame = (id, name, height, render) => ({
  id: `emails/${id}`, name, group: 'Emails', viewport: { width: WIDTH, height }, status: 'proposed', spec: SPEC, render,
});

const clientHeader = (ctx) => ctx.node({
  key: 'client',
  styles: ['Email/client'],
  children: [
    text(ctx, 'sender', 'Screen/secondary', { text: 'Orbit' }),
    text(ctx, 'subject', 'Email/subject', { textKey: 'email_verification_subject' }),
  ],
});

const wordmark = (ctx) => text(ctx, 'wordmark', 'Email/wordmark', { text: 'Orbit' });

const languageSwitch = (ctx) => ctx.node({
  key: 'switch',
  styles: ['Email/switch'],
  children: ['pt', 'en'].flatMap((language, i) => [
    i > 0 && text(ctx, 'switch/separator', 'Screen/tertiary', { text: '|' }),
    text(ctx, `switch/${language}`, language === ctx.settings.language ? 'Email/langSelected' : 'Email/lang', {
      text: LANGUAGE_NAMES[language],
    }),
  ]),
});

const message = (ctx, prefix, language) => {
  const own = language === ctx.settings.language;
  const copy = (name) => (own ? { textKey: name } : { text: ctx.catalog.strings[language][name] });
  return ctx.node({
    key: `${prefix}message`,
    styles: ['Email/block'],
    children: [
      text(ctx, `${prefix}title`, 'Email/title', copy('email_validation_title')),
      text(ctx, `${prefix}guidance`, 'Screen/guidance', copy('email_verification_guidance')),
      text(ctx, `${prefix}code`, 'Email/code', { text: VERIFICATION_CODE }),
      OrbitButton(ctx, { key: `${prefix}open-orbit`, hotspot: own && !prefix, styles: ['Screen/fill'] }, [
        text(ctx, `${prefix}open-orbit/label`, 'Screen/label', copy('email_verification_open_orbit')),
      ]),
      text(ctx, `${prefix}expiry`, 'Screen/secondary', copy('email_verification_expiry')),
      HorizontalDivider(ctx, { key: `${prefix}divider` }),
      text(ctx, `${prefix}not-you`, 'Screen/tertiary', copy('email_verification_not_you')),
    ],
  });
};

const emailCanvas = (ctx, body) => ctx.node({
  key: 'canvas',
  styles: ['Email/canvas'],
  children: [ctx.node({
    key: 'column',
    styles: ['Email/column'],
    children: [clientHeader(ctx), ctx.node({ key: 'body', styles: ['Email/body'], children: body })],
  })],
});

const verificationCode = emailFrame('verification-code', 'Verification code', 544, (ctx) => emailCanvas(ctx, [
  ctx.node({ key: 'top-row', styles: ['Email/topRow'], children: [wordmark(ctx), languageSwitch(ctx)] }),
  message(ctx, '', ctx.settings.language),
]));

const stacked = emailFrame('verification-code-stacked', 'Verification code (stacked)', 892, (ctx) => {
  const own = ctx.settings.language;
  const other = own === 'en' ? 'pt' : 'en';
  return emailCanvas(ctx, [
    wordmark(ctx),
    message(ctx, '', own),
    HorizontalDivider(ctx, { key: 'language-divider' }),
    message(ctx, `${other}/`, other),
  ]);
});

export const frames = [verificationCode, stacked];
