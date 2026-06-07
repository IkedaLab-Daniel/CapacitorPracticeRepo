import { cookies } from 'next/headers';

import { loginAction, logoutAction, registerAction } from './actions';

const AUTH_COOKIE_NAME = 'auth_token';

type PageSearchParams = Promise<Record<string, string | string[] | undefined>>;

type FlashMessage = {
  kind: 'notice' | 'error';
  text: string;
};

function firstValue(value: string | string[] | undefined) {
  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
}

function getFlashMessage(searchParams: Record<string, string | string[] | undefined>): FlashMessage | null {
  const error = firstValue(searchParams.error);

  if (error) {
    return { kind: 'error', text: error };
  }

  const notice = firstValue(searchParams.notice);

  if (notice) {
    return { kind: 'notice', text: notice };
  }

  return null;
}

type AuthFieldProps = {
  label: string;
  name: string;
  type?: string;
  autoComplete: string;
  placeholder: string;
  hint?: string;
};

function AuthField({ label, name, type = 'text', autoComplete, placeholder, hint }: AuthFieldProps) {
  return (
    <label className="grid gap-2 text-sm text-slate-200">
      <span className="font-medium tracking-wide text-slate-100">{label}</span>
      <input
        name={name}
        type={type}
        autoComplete={autoComplete}
        placeholder={placeholder}
        required
        minLength={name === 'password' ? 8 : undefined}
        spellCheck={false}
        className="rounded-2xl border border-white/10 bg-slate-950/45 px-4 py-3 text-sm text-slate-50 outline-none transition placeholder:text-slate-500 focus:border-sky-300/60 focus:ring-4 focus:ring-sky-400/10"
      />
      {hint ? <span className="text-xs text-slate-400">{hint}</span> : null}
    </label>
  );
}

type AuthCardProps = {
  title: string;
  description: string;
  submitLabel: string;
  formAction: (formData: FormData) => Promise<void>;
  passwordAutoComplete: string;
};

function AuthCard({ title, description, submitLabel, formAction, passwordAutoComplete }: AuthCardProps) {
  return (
    <form action={formAction} className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-[0_20px_80px_rgba(2,6,23,0.22)] backdrop-blur">
      <div className="space-y-1">
        <h2 className="text-lg font-semibold tracking-tight text-white">{title}</h2>
        <p className="text-sm leading-6 text-slate-300">{description}</p>
      </div>

      <div className="mt-5 grid gap-4">
        <AuthField
          label="Username"
          name="username"
          autoComplete="username"
          placeholder="ada_lovelace"
          hint="Djoser uses the username field by default in this repo."
        />
        <AuthField
          label="Password"
          name="password"
          type="password"
          autoComplete={passwordAutoComplete}
          placeholder="Your password"
          hint="At least 8 characters."
        />
      </div>

      <button
        type="submit"
        className="mt-5 inline-flex w-full items-center justify-center rounded-2xl bg-sky-300 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-200 focus:outline-none focus:ring-4 focus:ring-sky-300/30"
      >
        {submitLabel}
      </button>
    </form>
  );
}

export default async function Page({ searchParams }: { searchParams?: PageSearchParams }) {
  const params = (await searchParams) ?? {};
  const flashMessage = getFlashMessage(params);
  const cookieStore = await cookies();
  const hasSession = Boolean(cookieStore.get(AUTH_COOKIE_NAME)?.value);

  return (
    <main className="relative isolate min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,rgba(125,211,252,0.18),transparent_34%),radial-gradient(circle_at_80%_20%,rgba(94,234,212,0.12),transparent_24%),linear-gradient(180deg,#07111f_0%,#050b16_100%)]">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-size-[96px_96px] opacity-20" />

      <div className="relative mx-auto flex min-h-screen max-w-6xl items-center px-6 py-12">
        <section className="grid w-full gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
          <div className="flex flex-col justify-center gap-6 lg:py-8">
            <div className="inline-flex w-fit items-center rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium uppercase tracking-[0.25em] text-slate-300">
              Django auth bridge
            </div>

            <div className="space-y-4">
              <h1 className="max-w-xl text-4xl font-semibold tracking-tight text-white sm:text-6xl">
                Minimal auth, rendered on the server.
              </h1>
              <p className="max-w-xl text-base leading-7 text-slate-300 sm:text-lg">
                This page submits directly to the Django Djoser endpoints from server actions, then stores the login token in an HTTP-only cookie.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl border border-white/10 bg-white/5 p-5 text-sm text-slate-300 backdrop-blur">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-200">Backend</p>
                <ul className="mt-3 space-y-2 text-slate-200">
                  <li>POST /auth/users/</li>
                  <li>POST /auth/token/login/</li>
                  <li>POST /auth/token/logout/</li>
                </ul>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/5 p-5 text-sm text-slate-300 backdrop-blur">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-200">Session</p>
                <p className="mt-3 text-slate-200">
                  {hasSession ? 'HTTP-only auth token cookie is set.' : 'No auth token cookie yet.'}
                </p>
                <p className="mt-2 text-slate-400">
                  Login is server-side. If you change the Django host, set DJANGO_API_URL.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {flashMessage ? (
              <div
                className={`rounded-2xl border px-4 py-3 text-sm ${
                  flashMessage.kind === 'error'
                    ? 'border-rose-400/30 bg-rose-400/10 text-rose-100'
                    : 'border-emerald-400/30 bg-emerald-400/10 text-emerald-50'
                }`}
                aria-live="polite"
              >
                {flashMessage.text}
              </div>
            ) : null}

            {hasSession ? (
              <form action={logoutAction} className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur">
                <div className="space-y-1">
                  <h2 className="text-lg font-semibold tracking-tight text-white">Signed in</h2>
                  <p className="text-sm leading-6 text-slate-300">Clear the cookie and call the Djoser logout endpoint.</p>
                </div>

                <button
                  type="submit"
                  className="mt-5 inline-flex w-full items-center justify-center rounded-2xl border border-white/10 bg-slate-950/35 px-4 py-3 text-sm font-semibold text-white transition hover:border-white/20 hover:bg-slate-950/55 focus:outline-none focus:ring-4 focus:ring-sky-300/20"
                >
                  Sign out
                </button>
              </form>
            ) : null}

            <div className="grid gap-4">
              <AuthCard
                title="Sign in"
                description="Use the token login endpoint. This is the path that stores the auth cookie."
                submitLabel="Sign in"
                formAction={loginAction}
                passwordAutoComplete="current-password"
              />

              <AuthCard
                title="Create account"
                description="Creates a Djoser user through the server. The same username and password are used here."
                submitLabel="Create account"
                formAction={registerAction}
                passwordAutoComplete="new-password"
              />
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}