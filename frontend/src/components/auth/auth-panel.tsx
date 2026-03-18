"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { generateAvatarSeed } from "@/lib/avatar";
import {
  getEmptySessionSnapshot,
  getWorkspacePath,
  readSessionSnapshot,
  saveSession,
  subscribeToSession,
} from "@/lib/auth";
import { loginUser, loginWithOtp, registerUser, requestPasswordReset, requestSignupOtp, verifySignupOtp } from "@/lib/api";
import { studioProjects } from "@/lib/site-data";
import { useSyncExternalStore } from "react";

type Mode = "login" | "signup";

type OtpState = {
  recipient: string;
  requested: boolean;
  verified: boolean;
  debugCode?: string;
  message?: string;
  expiresInMinutes?: number;
};

function createOtpState(recipient = ""): OtpState {
  return {
    recipient,
    requested: false,
    verified: false,
    debugCode: undefined,
    message: undefined,
    expiresInMinutes: undefined,
  };
}

function buildDefaultMessage(mode: Mode) {
  return mode === "signup"
    ? "Verify your email, set a password, and your client workspace will be ready."
    : "Sign in with your email or username.";
}

export function AuthPanel() {
  const router = useRouter();
  const session = useSyncExternalStore(subscribeToSession, readSessionSnapshot, getEmptySessionSnapshot);
  const [mode, setMode] = useState<Mode>("login");
  const [identifier, setIdentifier] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [studioName, setStudioName] = useState("");
  const [message, setMessage] = useState(() => buildDefaultMessage("login"));
  const [isPending, setIsPending] = useState(false);
  const [otpPending, setOtpPending] = useState(false);
  const [emailOtp, setEmailOtp] = useState("");
  const [emailVerification, setEmailVerification] = useState<OtpState>(createOtpState());
  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotOtp, setForgotOtp] = useState("");
  const [forgotVerification, setForgotVerification] = useState<OtpState>(createOtpState());

  const normalizedUsername = username.trim().toLowerCase();
  const normalizedEmail = email.trim().toLowerCase();
  const normalizedPhone = phone.trim();
  const normalizedForgotEmail = forgotEmail.trim().toLowerCase();
  const signupReady = emailVerification.verified;
  const showcaseProject = studioProjects[1];
  const signupAvatarSeed = generateAvatarSeed(normalizedUsername || normalizedEmail || "guest");

  useEffect(() => {
    if (session.token && session.user) {
      router.replace(getWorkspacePath(session.user.role));
    }
  }, [router, session.token, session.user]);

  useEffect(() => {
    setMessage(buildDefaultMessage(mode));
    if (mode === "signup") {
      setForgotOpen(false);
      setForgotOtp("");
      setForgotVerification(createOtpState());
      return;
    }

    setEmailOtp("");
    setEmailVerification(createOtpState());
  }, [mode]);

  useEffect(() => {
    if (mode !== "signup") {
      return;
    }

    if (normalizedEmail !== emailVerification.recipient) {
      setEmailVerification(createOtpState(normalizedEmail));
      setEmailOtp("");
    }
  }, [emailVerification.recipient, mode, normalizedEmail]);

  useEffect(() => {
    if (!forgotOpen) {
      return;
    }

    if (identifier.includes("@") && !forgotEmail.trim()) {
      setForgotEmail(identifier.trim().toLowerCase());
    }
  }, [forgotOpen, forgotEmail, identifier]);

  useEffect(() => {
    if (!forgotOpen) {
      return;
    }

    if (normalizedForgotEmail !== forgotVerification.recipient) {
      setForgotVerification(createOtpState(normalizedForgotEmail));
      setForgotOtp("");
    }
  }, [forgotOpen, forgotVerification.recipient, normalizedForgotEmail]);

  async function handleRequestSignupOtp() {
    if (!normalizedEmail) {
      setMessage("Enter your email before requesting the OTP.");
      return;
    }

    setOtpPending(true);

    try {
      const response = await requestSignupOtp("email", normalizedEmail);
      setEmailVerification({
        recipient: normalizedEmail,
        requested: true,
        verified: false,
        debugCode: response.debugCode,
        expiresInMinutes: response.expiresInMinutes,
        message: response.message,
      });
      setEmailOtp("");
      setMessage(response.message);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unable to send the email OTP.";
      setEmailVerification((current) => ({
        ...current,
        requested: false,
        verified: false,
        message: errorMessage,
      }));
      setMessage(errorMessage);
    } finally {
      setOtpPending(false);
    }
  }

  async function handleVerifySignupOtp() {
    if (!normalizedEmail || !emailOtp.trim()) {
      setMessage("Enter the email OTP before verifying.");
      return;
    }

    setOtpPending(true);

    try {
      const response = await verifySignupOtp("email", normalizedEmail, emailOtp.trim());
      setEmailVerification((current) => ({
        ...current,
        recipient: normalizedEmail,
        requested: true,
        verified: true,
        message: response.message,
      }));
      setMessage(response.message);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unable to verify the email OTP.";
      setEmailVerification((current) => ({
        ...current,
        verified: false,
        message: errorMessage,
      }));
      setMessage(errorMessage);
    } finally {
      setOtpPending(false);
    }
  }

  async function handleRequestLoginOtp() {
    if (!normalizedForgotEmail) {
      setMessage("Enter the email address linked to your account.");
      return;
    }

    setOtpPending(true);

    try {
      const response = await requestPasswordReset(normalizedForgotEmail);
      setForgotVerification({
        recipient: normalizedForgotEmail,
        requested: true,
        verified: false,
        debugCode: response.debugCode,
        expiresInMinutes: response.expiresInMinutes,
        message: response.message,
      });
      setForgotOtp("");
      setMessage(response.message);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unable to send the login OTP.";
      setForgotVerification((current) => ({
        ...current,
        requested: false,
        verified: false,
        message: errorMessage,
      }));
      setMessage(errorMessage);
    } finally {
      setOtpPending(false);
    }
  }

  async function handleLoginWithOtp() {
    if (!normalizedForgotEmail || !forgotOtp.trim()) {
      setMessage("Enter the email OTP to continue.");
      return;
    }

    setOtpPending(true);

    try {
      const response = await loginWithOtp(normalizedForgotEmail, forgotOtp.trim());
      saveSession(response.token, response.user);
      router.push(getWorkspacePath(response.user.role));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to sign in with OTP.");
    } finally {
      setOtpPending(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (mode === "signup" && !signupReady) {
      setMessage("Verify your email OTP before creating the account.");
      return;
    }

    setIsPending(true);
    setMessage(mode === "signup" ? "Creating your account..." : "Signing you in...");

    try {
      const response =
        mode === "signup"
          ? await registerUser({
              username: normalizedUsername,
              email: normalizedEmail,
              password,
              phone: normalizedPhone,
              studioName: studioName.trim(),
              avatarSeed: signupAvatarSeed,
            })
          : await loginUser(identifier.trim(), password);

      saveSession(response.token, response.user);
      router.push(getWorkspacePath(response.user.role));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to continue.");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[0.56fr_0.44fr]">
      <form
        onSubmit={handleSubmit}
        className="glass-panel relative overflow-hidden rounded-[38px] border border-white/50 p-6 shadow-[0_32px_80px_rgba(17,17,17,0.08)] md:p-8"
      >
        <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-[radial-gradient(circle_at_top,rgba(200,169,126,0.18),transparent_62%)]" />

        <div className="relative flex flex-col gap-6">
          <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
            <div className="max-w-xl">
              <p className="eyebrow">Secure Access</p>
              <h1 className="display-title mt-4 text-4xl leading-[0.94] md:text-6xl">
                {mode === "signup" ? "Create your client account" : "Sign in to the workspace"}
              </h1>
              <p className="mt-4 max-w-lg text-sm leading-7 text-[#5d5d5d]">{message}</p>
            </div>

            <div className="inline-flex rounded-full border border-black/8 bg-white/72 p-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.82)]">
              {(["login", "signup"] as Mode[]).map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setMode(item)}
                  className={`rounded-full px-4 py-2 text-sm transition-all ${
                    mode === item
                      ? "bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(200,169,126,0.22))] text-[#111111] shadow-[0_10px_24px_rgba(200,169,126,0.12)]"
                      : "text-[#6a6a6a]"
                  }`}
                >
                  {item === "login" ? "Login" : "Sign Up"}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-4">
            {mode === "signup" ? (
              <>
                <label className="grid gap-2 text-sm text-[#3c3c3c]">
                  Username
                  <input
                    required
                    value={username}
                    onChange={(event) => setUsername(event.target.value)}
                    className="rounded-[24px] border border-black/10 bg-white/88 px-4 py-3.5 outline-none transition-colors focus:border-[#c8a97e]"
                  />
                </label>

                <div className="rounded-[28px] border border-black/8 bg-white/70 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.84)]">
                  <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
                    <label className="grid gap-2 text-sm text-[#3c3c3c]">
                      Email
                      <input
                        required
                        type="email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        className="rounded-[22px] border border-black/10 bg-white px-4 py-3 outline-none transition-colors focus:border-[#c8a97e]"
                      />
                    </label>
                    <button
                      type="button"
                      onClick={handleRequestSignupOtp}
                      disabled={otpPending || !normalizedEmail}
                      className="premium-button px-5 py-3 text-sm font-medium disabled:opacity-60"
                    >
                      {otpPending ? "Sending..." : emailVerification.requested ? "Resend OTP" : "Send OTP"}
                    </button>
                  </div>

                  <div className="mt-4 grid gap-3 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
                    <label className="grid gap-2 text-sm text-[#3c3c3c]">
                      Email OTP
                      <input
                        value={emailOtp}
                        onChange={(event) => setEmailOtp(event.target.value)}
                        maxLength={6}
                        inputMode="numeric"
                        placeholder="Enter 6-digit code"
                        className="rounded-[22px] border border-black/10 bg-white px-4 py-3 outline-none transition-colors focus:border-[#c8a97e]"
                      />
                    </label>
                    <button
                      type="button"
                      onClick={handleVerifySignupOtp}
                      disabled={otpPending || !emailVerification.requested || emailVerification.verified}
                      className="premium-button-soft px-5 py-3 text-sm font-medium disabled:opacity-60"
                    >
                      {otpPending ? "Checking..." : emailVerification.verified ? "Verified" : "Verify"}
                    </button>
                  </div>

                  {emailVerification.message || emailVerification.debugCode ? (
                    <div className="mt-3 grid gap-2 text-xs leading-6 text-[#6b6b6b]">
                      {emailVerification.message ? <p>{emailVerification.message}</p> : null}
                      {emailVerification.expiresInMinutes ? <p>OTP expires in {emailVerification.expiresInMinutes} minutes.</p> : null}
                      {emailVerification.debugCode ? (
                        <p className="rounded-2xl border border-[#c8a97e]/24 bg-[#fbf6ee] px-3 py-2 text-[#8f6532]">
                          Debug OTP: <span className="font-semibold tracking-[0.18em]">{emailVerification.debugCode}</span>
                        </p>
                      ) : null}
                    </div>
                  ) : null}
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <label className="grid gap-2 text-sm text-[#3c3c3c]">
                    Phone Number
                    <input
                      required
                      value={phone}
                      onChange={(event) => setPhone(event.target.value)}
                      className="rounded-[24px] border border-black/10 bg-white/88 px-4 py-3.5 outline-none transition-colors focus:border-[#c8a97e]"
                    />
                  </label>
                  <label className="grid gap-2 text-sm text-[#3c3c3c]">
                    Studio / Company
                    <input
                      value={studioName}
                      onChange={(event) => setStudioName(event.target.value)}
                      className="rounded-[24px] border border-black/10 bg-white/88 px-4 py-3.5 outline-none transition-colors focus:border-[#c8a97e]"
                    />
                  </label>
                </div>

                <label className="grid gap-2 text-sm text-[#3c3c3c]">
                  Password
                  <input
                    required
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="rounded-[24px] border border-black/10 bg-white/88 px-4 py-3.5 outline-none transition-colors focus:border-[#c8a97e]"
                  />
                </label>
              </>
            ) : (
              <>
                <label className="grid gap-2 text-sm text-[#3c3c3c]">
                  Email or Username
                  <input
                    required
                    value={identifier}
                    onChange={(event) => setIdentifier(event.target.value)}
                    className="rounded-[24px] border border-black/10 bg-white/88 px-4 py-3.5 outline-none transition-colors focus:border-[#c8a97e]"
                  />
                </label>

                <div className="grid gap-2">
                  <label className="grid gap-2 text-sm text-[#3c3c3c]">
                    Password
                    <input
                      required
                      type="password"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      className="rounded-[24px] border border-black/10 bg-white/88 px-4 py-3.5 outline-none transition-colors focus:border-[#c8a97e]"
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() => setForgotOpen((current) => !current)}
                    className="justify-self-start text-sm font-medium text-[#3867b4] transition-colors hover:text-[#111111]"
                  >
                    Forgot password?
                  </button>
                </div>

                {forgotOpen ? (
                  <div className="rounded-[28px] border border-[#c8a97e]/18 bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(249,243,235,0.92))] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.84)]">
                    <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
                      <label className="grid gap-2 text-sm text-[#3c3c3c]">
                        Email ID
                        <input
                          type="email"
                          value={forgotEmail}
                          onChange={(event) => setForgotEmail(event.target.value)}
                          className="rounded-[22px] border border-black/10 bg-white px-4 py-3 outline-none transition-colors focus:border-[#c8a97e]"
                        />
                      </label>
                      <button
                        type="button"
                        onClick={handleRequestLoginOtp}
                        disabled={otpPending || !normalizedForgotEmail}
                        className="premium-button px-5 py-3 text-sm font-medium disabled:opacity-60"
                      >
                        {otpPending ? "Sending..." : forgotVerification.requested ? "Resend OTP" : "Send OTP"}
                      </button>
                    </div>

                    <div className="mt-4 grid gap-3 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
                      <label className="grid gap-2 text-sm text-[#3c3c3c]">
                        OTP
                        <input
                          value={forgotOtp}
                          onChange={(event) => setForgotOtp(event.target.value)}
                          maxLength={6}
                          inputMode="numeric"
                          placeholder="Enter 6-digit code"
                          className="rounded-[22px] border border-black/10 bg-white px-4 py-3 outline-none transition-colors focus:border-[#c8a97e]"
                        />
                      </label>
                      <button
                        type="button"
                        onClick={handleLoginWithOtp}
                        disabled={otpPending || !forgotVerification.requested || !forgotOtp.trim()}
                        className="premium-button-soft px-5 py-3 text-sm font-medium disabled:opacity-60"
                      >
                        {otpPending ? "Checking..." : "Login with OTP"}
                      </button>
                    </div>

                    {forgotVerification.message || forgotVerification.debugCode ? (
                      <div className="mt-3 grid gap-2 text-xs leading-6 text-[#6b6b6b]">
                        {forgotVerification.message ? <p>{forgotVerification.message}</p> : null}
                        {forgotVerification.expiresInMinutes ? <p>OTP expires in {forgotVerification.expiresInMinutes} minutes.</p> : null}
                        {forgotVerification.debugCode ? (
                          <p className="rounded-2xl border border-[#c8a97e]/24 bg-[#fbf6ee] px-3 py-2 text-[#8f6532]">
                            Debug OTP: <span className="font-semibold tracking-[0.18em]">{forgotVerification.debugCode}</span>
                          </p>
                        ) : null}
                      </div>
                    ) : null}
                  </div>
                ) : null}
              </>
            )}
          </div>

          <div className="flex flex-col gap-3 pt-2 md:flex-row md:items-center md:justify-between">
            <p className="text-sm leading-7 text-[#5d5d5d]">
              {mode === "signup"
                ? "Your dashboard will open right after account creation."
                : "Use password sign-in, or switch to email OTP below the password field."}
            </p>
            <button
              type="submit"
              disabled={isPending || (mode === "signup" && !signupReady)}
              className="premium-button min-w-[180px] px-6 py-3 text-sm font-medium disabled:opacity-60"
            >
              {isPending ? "Please wait..." : mode === "signup" ? "Create account" : "Sign in"}
            </button>
          </div>
        </div>
      </form>

      <div className="hidden gap-4 xl:grid">
        <div
          className="glass-panel relative min-h-[420px] overflow-hidden rounded-[38px] border border-white/50"
          style={{
            backgroundImage: `linear-gradient(180deg, rgba(17,17,17,0.1), rgba(17,17,17,0.62)), url(${showcaseProject.heroImage})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(200,169,126,0.24),transparent_58%)]" />
          <div className="relative flex h-full flex-col justify-between p-6 text-white">
            <div className="grid gap-3">
              <div className="w-fit rounded-full border border-white/25 bg-white/10 px-3 py-1 text-xs uppercase tracking-[0.24em] backdrop-blur-md">
                Dashboard Preview
              </div>
              <h2 className="display-title max-w-md text-5xl leading-[0.95]">
                Clean client access with a sharper presentation.
              </h2>
            </div>

            <div className="grid gap-3">
              <div className="grid gap-3 md:grid-cols-3">
                {[
                  { label: "Projects", value: "03" },
                  { label: "Files", value: "24" },
                  { label: "Meetings", value: "06" },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="rounded-[24px] border border-white/16 bg-white/10 px-4 py-4 backdrop-blur-md"
                  >
                    <p className="text-xs uppercase tracking-[0.22em] text-white/72">{item.label}</p>
                    <p className="mt-3 text-3xl font-medium">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-[0.46fr_0.54fr]">
          <div className="glass-panel rounded-[32px] p-5">
            <p className="eyebrow">Latest project</p>
            <p className="display-title mt-4 text-3xl">{showcaseProject.title}</p>
            <p className="mt-3 text-sm leading-7 text-[#5d5d5d]">{showcaseProject.summary}</p>
            <div className="mt-5 space-y-3">
              {showcaseProject.timeline.slice(0, 2).map((entry) => (
                <div key={entry.title} className="rounded-[22px] border border-black/8 bg-white/65 p-4">
                  <p className="font-medium text-[#111111]">{entry.title}</p>
                  <p className="mt-2 text-xs uppercase tracking-[0.22em] text-[#8f6532]">{entry.status}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-panel rounded-[32px] p-5">
            <p className="eyebrow">Inside the portal</p>
            <div className="mt-5 grid gap-3">
              {[
                "Project files organized by deliverable",
                "Meetings and invoice checkpoints in one view",
                "Separate admin and staff workspaces after sign-in",
              ].map((item) => (
                <div
                  key={item}
                  className="rounded-[22px] border border-black/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(249,243,235,0.82))] px-4 py-4 text-sm text-[#333333]"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
