"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { buildAvatarUrl, generateAvatarSeed } from "@/lib/avatar";
import { getWorkspacePath, saveSession } from "@/lib/auth";
import { loginUser, registerUser, requestPasswordReset, requestSignupOtp, staffLoginUser, verifySignupOtp } from "@/lib/api";
import type { OtpChannel } from "@/lib/platform-types";

type AuthPanelProps = {
  staffMode?: boolean;
};

type Mode = "login" | "signup" | "forgot";

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

function getDefaultMessage(staffMode: boolean, mode: Mode) {
  if (staffMode) {
    return "Use your architect/admin credentials to enter the internal workspace.";
  }

  if (mode === "signup") {
    return "Create a client account to track projects, files, revisions, meetings, and payment milestones.";
  }

  if (mode === "forgot") {
    return "Enter your account email to register a password-reset request.";
  }

  return "Use your client credentials to open the project workspace, review updates, and track invoices.";
}

function otpCopy(channel: OtpChannel) {
  return channel === "email"
    ? {
        label: "Email",
        action: "Send email OTP",
        resend: "Resend email OTP",
        verify: "Verify email",
        verified: "Email verified",
        helper: "We send a six-digit verification code to confirm this address before account creation.",
      }
    : {
        label: "Phone number",
        action: "Send phone OTP",
        resend: "Resend phone OTP",
        verify: "Verify phone",
        verified: "Phone verified",
        helper: "We send a six-digit OTP to confirm the contact number that will receive project updates.",
      };
}

export function AuthPanel({ staffMode = false }: AuthPanelProps) {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>(staffMode ? "login" : "signup");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [studioName, setStudioName] = useState("");
  const [message, setMessage] = useState(() => getDefaultMessage(staffMode, staffMode ? "login" : "signup"));
  const [isPending, setIsPending] = useState(false);
  const [otpPending, setOtpPending] = useState<Record<OtpChannel, boolean>>({
    email: false,
    phone: false,
  });
  const [emailOtp, setEmailOtp] = useState("");
  const [phoneOtp, setPhoneOtp] = useState("");
  const [otpStates, setOtpStates] = useState<Record<OtpChannel, OtpState>>({
    email: createOtpState(),
    phone: createOtpState(),
  });
  const [avatarSeed, setAvatarSeed] = useState(() => generateAvatarSeed("guest"));

  const normalizedEmail = email.trim().toLowerCase();
  const normalizedPhone = phone.trim();
  const signupReady = otpStates.email.verified && otpStates.phone.verified;

  useEffect(() => {
    if (fullName.trim()) {
      setAvatarSeed(generateAvatarSeed(fullName));
    }
  }, [fullName]);

  useEffect(() => {
    if (mode !== "signup") {
      return;
    }

    if (normalizedEmail !== otpStates.email.recipient) {
      setOtpStates((current) => ({
        ...current,
        email: createOtpState(normalizedEmail),
      }));
      setEmailOtp("");
    }
  }, [mode, normalizedEmail, otpStates.email.recipient]);

  useEffect(() => {
    if (mode !== "signup") {
      return;
    }

    if (normalizedPhone !== otpStates.phone.recipient) {
      setOtpStates((current) => ({
        ...current,
        phone: createOtpState(normalizedPhone),
      }));
      setPhoneOtp("");
    }
  }, [mode, normalizedPhone, otpStates.phone.recipient]);

  const avatarUrl = useMemo(() => buildAvatarUrl(avatarSeed), [avatarSeed]);

  function handleModeChange(nextMode: Mode) {
    setMode(nextMode);
    setMessage(getDefaultMessage(staffMode, nextMode));
  }

  async function handleRequestOtp(channel: OtpChannel) {
    const recipient = channel === "email" ? normalizedEmail : normalizedPhone;

    if (!recipient) {
      setMessage(`Enter your ${channel === "email" ? "email address" : "phone number"} before requesting an OTP.`);
      return;
    }

    setOtpPending((current) => ({ ...current, [channel]: true }));

    try {
      const response = await requestSignupOtp(channel, recipient);

      setOtpStates((current) => ({
        ...current,
        [channel]: {
          recipient,
          requested: true,
          verified: false,
          debugCode: response.debugCode,
          expiresInMinutes: response.expiresInMinutes,
          message: response.message,
        },
      }));

      if (channel === "email") {
        setEmailOtp("");
      } else {
        setPhoneOtp("");
      }

      setMessage(
        response.debugCode
          ? `${response.message} Debug fallback is active, so the OTP is visible in the card below.`
          : response.message,
      );
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unable to send OTP.";
      setOtpStates((current) => ({
        ...current,
        [channel]: {
          ...current[channel],
          requested: false,
          verified: false,
          message: errorMessage,
        },
      }));
      setMessage(errorMessage);
    } finally {
      setOtpPending((current) => ({ ...current, [channel]: false }));
    }
  }

  async function handleVerifyOtp(channel: OtpChannel) {
    const recipient = channel === "email" ? normalizedEmail : normalizedPhone;
    const code = channel === "email" ? emailOtp.trim() : phoneOtp.trim();

    if (!recipient) {
      setMessage(`Enter your ${channel === "email" ? "email address" : "phone number"} before verifying the OTP.`);
      return;
    }

    if (!code) {
      setMessage(`Enter the ${channel === "email" ? "email" : "phone"} OTP before verifying.`);
      return;
    }

    setOtpPending((current) => ({ ...current, [channel]: true }));

    try {
      const response = await verifySignupOtp(channel, recipient, code);

      setOtpStates((current) => ({
        ...current,
        [channel]: {
          ...current[channel],
          recipient,
          requested: true,
          verified: true,
          message: response.message,
        },
      }));

      setMessage(response.message);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unable to verify OTP.";
      setOtpStates((current) => ({
        ...current,
        [channel]: {
          ...current[channel],
          verified: false,
          message: errorMessage,
        },
      }));
      setMessage(errorMessage);
    } finally {
      setOtpPending((current) => ({ ...current, [channel]: false }));
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (mode === "signup" && !signupReady) {
      setMessage("Verify both email OTP and phone OTP before creating the account.");
      return;
    }

    setIsPending(true);
    setMessage("Working...");

    try {
      if (mode === "forgot") {
        const response = await requestPasswordReset(email);
        setMessage(response.message);
        setIsPending(false);
        return;
      }

      const response =
        mode === "signup"
          ? await registerUser({
              fullName,
              email: normalizedEmail,
              password,
              phone: normalizedPhone,
              studioName,
              avatarSeed,
            })
          : staffMode
            ? await staffLoginUser(email, password)
            : await loginUser(email, password);

      saveSession(response.token, response.user);
      router.push(getWorkspacePath(response.user.role));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to continue.");
    } finally {
      setIsPending(false);
    }
  }

  function renderOtpCard(channel: OtpChannel) {
    const copy = otpCopy(channel);
    const state = otpStates[channel];
    const code = channel === "email" ? emailOtp : phoneOtp;
    const setCode = channel === "email" ? setEmailOtp : setPhoneOtp;
    const recipient = channel === "email" ? normalizedEmail : normalizedPhone;

    return (
      <div className="rounded-[28px] border border-black/8 bg-white/75 p-4 shadow-[0_18px_40px_rgba(17,17,17,0.04)]">
        <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
          <label className="grid gap-2 text-sm text-[#3c3c3c]">
            {copy.label}
            <input
              required
              type={channel === "email" ? "email" : "tel"}
              value={channel === "email" ? email : phone}
              onChange={(event) => (channel === "email" ? setEmail(event.target.value) : setPhone(event.target.value))}
              className="rounded-2xl border border-black/10 bg-white px-4 py-3 outline-none transition-colors focus:border-[#c8a97e]"
            />
          </label>
          <button
            type="button"
            onClick={() => handleRequestOtp(channel)}
            disabled={otpPending[channel] || !recipient}
            className="premium-button px-5 py-3 text-sm font-medium disabled:opacity-60"
          >
            {otpPending[channel] ? "Sending..." : state.requested ? copy.resend : copy.action}
          </button>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
          <label className="grid gap-2 text-sm text-[#3c3c3c]">
            {copy.label} OTP
            <input
              value={code}
              onChange={(event) => setCode(event.target.value)}
              maxLength={6}
              inputMode="numeric"
              placeholder="Enter 6-digit code"
              className="rounded-2xl border border-black/10 bg-white px-4 py-3 outline-none transition-colors focus:border-[#c8a97e]"
            />
          </label>
          <button
            type="button"
            onClick={() => handleVerifyOtp(channel)}
            disabled={otpPending[channel] || !state.requested || state.verified}
            className="premium-button px-5 py-3 text-sm font-medium disabled:opacity-60"
          >
            {otpPending[channel] ? "Checking..." : state.verified ? copy.verified : copy.verify}
          </button>
        </div>

        <div className="mt-3 grid gap-2 text-xs leading-6 text-[#6b6b6b]">
          <p>
            {state.message ||
              (state.verified
                ? `${copy.label} verification completed.`
                : state.requested
                  ? `${copy.label} OTP sent. Enter the six-digit code to continue.`
                  : copy.helper)}
          </p>
          {state.expiresInMinutes ? <p>OTP expires in {state.expiresInMinutes} minutes.</p> : null}
          {state.debugCode ? (
            <p className="rounded-2xl border border-[#c8a97e]/30 bg-[#f9f3ea] px-3 py-2 text-[#8f6532]">
              Debug OTP: <span className="font-semibold tracking-[0.2em]">{state.debugCode}</span>
            </p>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[0.54fr_0.46fr]">
      <form onSubmit={handleSubmit} className="glass-panel rounded-[36px] p-6 md:p-8">
        <p className="eyebrow">{staffMode ? "Staff Access" : "Secure Access"}</p>
        <h1 className="display-title mt-4 text-4xl leading-[0.95] md:text-6xl">
          {staffMode ? "Architect and admin workspace access" : "Client and studio authentication"}
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-[#5d5d5d]">
          {staffMode
            ? "Internal staff accounts are separated from the public auth flow. Use your studio credentials to open the architect workspace or admin control panel."
            : "Public sign up is reserved for clients and onboarding users. Internal staff roles stay behind a separate login path, and new client accounts require both email and phone OTP verification."}
        </p>

        {!staffMode ? (
          <div className="mt-6 inline-flex rounded-full border border-black/8 bg-white/70 p-1">
            {(["signup", "login", "forgot"] as Mode[]).map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => handleModeChange(item)}
                className={`rounded-full px-4 py-2 text-sm transition-all ${
                  mode === item
                    ? "bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(200,169,126,0.22))] text-[#111111] shadow-[0_10px_24px_rgba(200,169,126,0.12)]"
                    : "text-[#5d5d5d]"
                }`}
              >
                {item === "signup" ? "Sign Up" : item === "login" ? "Login" : "Forgot Password"}
              </button>
            ))}
          </div>
        ) : null}

        <div className="mt-6 grid gap-4">
          {mode === "signup" ? (
            <>
              <div className="flex items-center gap-4 rounded-[28px] border border-black/8 bg-white/70 p-4">
                <img src={avatarUrl} alt="Generated avatar preview" className="h-16 w-16 rounded-full border border-black/8" />
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-[#8f6532]">Avatar Preview</p>
                  <p className="mt-2 text-sm text-[#5d5d5d]">
                    A random profile avatar is generated automatically at signup and can be changed later in profile settings.
                  </p>
                </div>
              </div>

              <label className="grid gap-2 text-sm text-[#3c3c3c]">
                Full name
                <input
                  required
                  value={fullName}
                  onChange={(event) => setFullName(event.target.value)}
                  className="rounded-2xl border border-black/10 bg-white px-4 py-3 outline-none transition-colors focus:border-[#c8a97e]"
                />
              </label>

              {renderOtpCard("email")}
              {renderOtpCard("phone")}

              <div className="grid gap-4 md:grid-cols-2">
                <label className="grid gap-2 text-sm text-[#3c3c3c]">
                  Studio / Company
                  <input
                    value={studioName}
                    onChange={(event) => setStudioName(event.target.value)}
                    className="rounded-2xl border border-black/10 bg-white px-4 py-3 outline-none transition-colors focus:border-[#c8a97e]"
                  />
                </label>
                <label className="grid gap-2 text-sm text-[#3c3c3c]">
                  Password
                  <input
                    required
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="rounded-2xl border border-black/10 bg-white px-4 py-3 outline-none transition-colors focus:border-[#c8a97e]"
                  />
                </label>
              </div>
            </>
          ) : (
            <>
              <label className="grid gap-2 text-sm text-[#3c3c3c]">
                Email
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="rounded-2xl border border-black/10 bg-white px-4 py-3 outline-none transition-colors focus:border-[#c8a97e]"
                />
              </label>

              {mode !== "forgot" ? (
                <label className="grid gap-2 text-sm text-[#3c3c3c]">
                  Password
                  <input
                    required
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="rounded-2xl border border-black/10 bg-white px-4 py-3 outline-none transition-colors focus:border-[#c8a97e]"
                  />
                </label>
              ) : null}
            </>
          )}
        </div>

        <div className="mt-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <p className="max-w-2xl text-sm leading-7 text-[#5d5d5d]">{message}</p>
          <button
            type="submit"
            disabled={isPending || (mode === "signup" && !signupReady)}
            className="premium-button min-w-[180px] px-6 py-3 text-sm font-medium disabled:opacity-60"
          >
            {isPending
              ? "Please wait..."
              : mode === "signup"
                ? "Create account"
                : mode === "forgot"
                  ? "Request reset"
                  : "Sign in"}
          </button>
        </div>
      </form>

      <div className="grid gap-4">
        <div className="glass-panel rounded-[36px] p-6">
          <p className="text-xs uppercase tracking-[0.24em] text-[#8f6532]">Why this flow</p>
          <div className="mt-4 grid gap-3 text-sm leading-7 text-[#5d5d5d]">
            <p>Clients can onboard directly, track assigned projects, and review invoices without seeing staff-only operations.</p>
            <p>Architect and admin accounts remain internal and route into secure role-based workspaces.</p>
            <p>Email OTP and phone OTP both gate public signup, while avatar fallbacks and JWT-backed sessions stay wired into the platform.</p>
          </div>
        </div>

        {!staffMode ? (
          <div className="glass-panel rounded-[36px] p-6">
            <p className="text-xs uppercase tracking-[0.24em] text-[#8f6532]">Internal staff</p>
            <p className="mt-4 text-sm leading-7 text-[#5d5d5d]">
              Studio architects and admins should not use the public signup page.
            </p>
            <Link href="/staff-login" className="premium-button mt-5 px-5 py-3 text-sm font-medium">
              Open staff login
            </Link>
          </div>
        ) : (
          <div className="glass-panel rounded-[36px] p-6">
            <p className="text-xs uppercase tracking-[0.24em] text-[#8f6532]">Client onboarding</p>
            <p className="mt-4 text-sm leading-7 text-[#5d5d5d]">
              Public users and clients should return to the public auth page to sign up, log in, or request password reset.
            </p>
            <Link href="/auth" className="premium-button mt-5 px-5 py-3 text-sm font-medium">
              Open public auth
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
