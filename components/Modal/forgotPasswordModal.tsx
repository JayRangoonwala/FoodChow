import { useEffect, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check, Eye, EyeOff } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import { ForgotPassword, ResetPassword, VerifyOtp } from "@/lib/loginService";
import { toast } from "sonner";

const forgotPasswordSchema = z
  .object({
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

const forgotRequestSchema = z.object({
  value: z.string().refine(
    (val) => {
      // Check if it's a valid email or a 10-digit mobile
      const emailRegex = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
      return emailRegex.test(val);
    },
    { message: "Enter a valid email" }
  ),
});

function ForgotPasswordRequestModal({
  open,
  onClose,
  onNext,
}: {
  open: boolean;
  onClose: () => void;
  onNext: (value: string) => void;
}) {
  const form = useForm<z.infer<typeof forgotRequestSchema>>({
    resolver: zodResolver(forgotRequestSchema),
    defaultValues: { value: "" },
  });
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-xs w-sm rounded-xl px-4 py-4">
        <DialogHeader>
          <DialogTitle>Forgot Password</DialogTitle>
        </DialogHeader>
        <div className="mb-2 text-sm">Enter your registered email address.</div>
        <form
          onSubmit={form.handleSubmit(async (data) => {
            const res = await ForgotPassword(data.value);
            if (res.message === "OTP sent successfully.") {
              onNext(data.value);
            } else {
              form.setError("value", { message: "Enter a valid Email" });
            }
          })}
          className="space-y-2"
        >
          <Input
            placeholder="Enter Email"
            {...form.register("value")}
            className="mb-2"
          />
          {form.formState.errors.value && (
            <div className="text-xs text-red-600 mb-2">
              {form.formState.errors.value.message}
            </div>
          )}
          <Button
            className="w-full"
            type="submit"
            disabled={form.formState.isSubmitting}
          >
            Send OTP
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function ForgotPasswordNewModal({
  open,
  onClose,
  onSubmission,
  email,
}: {
  open: boolean;
  onClose: () => void;
  onSubmission: () => void;
  email: string;
}) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const form = useForm<z.infer<typeof forgotPasswordSchema>>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });
  useEffect(() => {
    if (open) {
      form.reset();
    }
  }, [open]);
  
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-xs w-sm rounded-xl px-4 py-4">
        <DialogHeader>
          <DialogTitle>Reset Password</DialogTitle>
        </DialogHeader>
        <div className="mb-2 text-sm">Enter your new password below.</div>
        <form
          onSubmit={form.handleSubmit(async (formData) => {
            const data: any = {
              email: email,
              newPassword: formData.password,
              confirmPassword: formData.confirmPassword,
            }
            const res = await ResetPassword(data);

            if (res.error){
              form.setError("password", { message: res.error });
            }

            if(res.message === "Password reset successfully."){
              onSubmission();
            }
          })}
          className="space-y-2"
        >
          <div className="mb-2">
            <label className="block text-xs font-medium mb-1">
              New Password
            </label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                {...form.register("password")}
                className="pr-8"
                placeholder="New Password"
              />
              <button
                type="button"
                className="absolute right-2 top-2 text-gray-500"
                tabIndex={-1}
                onClick={() => setShowPassword((v) => !v)}
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
            {form.formState.errors.password && (
              <div className="text-xs text-red-600 mt-1">
                {form.formState.errors.password.message}
              </div>
            )}
          </div>
          <div className="mb-2">
            <label className="block text-xs font-medium mb-1">
              Confirm Password
            </label>
            <div className="relative">
              <Input
                type={showConfirm ? "text" : "password"}
                {...form.register("confirmPassword")}
                className="pr-8"
                placeholder="Confirm Password"
              />
              <button
                type="button"
                className="absolute right-2 top-2 text-gray-500"
                tabIndex={-1}
                onClick={() => setShowConfirm((v) => !v)}
              >
                {showConfirm ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
            {form.formState.errors.confirmPassword && (
              <div className="text-xs text-red-600 mt-1">
                {form.formState.errors.confirmPassword.message}
              </div>
            )}
          </div>
          <Button
            className="w-full"
            type="submit"
            disabled={form.formState.isSubmitting}
          >
            Set New Password
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function ForgotPasswordSuccessModal({
  open,
  onLogin,
}: {
  open: boolean;
  onLogin: () => void;
}) {
  return (
    <Dialog open={open}>
      <DialogContent className="max-w-xs w-sm rounded-xl px-4 py-4 flex flex-col items-center justify-center gap-2">
        <DialogHeader>
          <DialogTitle>Password Changed Successfully</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center justify-center mt-2 mb-2 bg-green-600 rounded-full p-2">
          <Check className="w-10 h-10 text-white" />
        </div>
        <div className="text-lg font-bold text-center mb-2">
          Password Changed Successfully
        </div>
        <Button className="w-full" onClick={onLogin}>
          Login
        </Button>
      </DialogContent>
    </Dialog>
  );
}

export default function ForgotPasswordModal({
  open,
  onClose,
  onLogin,
}: {
  open: boolean;
  onClose: () => void;
  onLogin: () => void;
}) {
  const [step, setStep] = useState<"request" | "otp" | "new" | "success">(
    "request"
  );
  const [value, setValue] = useState("");
  const [otp, setOtp] = useState("");

  return (
    <>
      <ForgotPasswordRequestModal
        open={open && step === "request"}
        onClose={onClose}
        onNext={(val) => {
          setValue(val);
          setStep("otp");
        }}
      />
      <SignUpOtpModal
        open={open && step === "otp"}
        onClose={onClose}
        email={value}
        onNext={() => {
          setStep("new");
        }}
        onBack={() => setStep("request")}
      />
      <ForgotPasswordNewModal
        open={open && step === "new"}
        onClose={onClose}
        email={value}
        onSubmission={() => {
          setStep("success");
        }}
      />
      <ForgotPasswordSuccessModal
        open={open && step === "success"}
        onLogin={() => {
          setStep("request");
          onClose();
          if (onLogin) onLogin();
        }}
      />
    </>
  );
}

export function SignUpOtpModal({
  open,
  onClose,
  email,
  onNext,
  onBack,
}: {
  open: boolean;
  onClose: () => void;
  email: string;
  onNext: () => void;
  onBack: () => void;
}) {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const otpValue = otp.join("");
  const canSubmit = otpValue.length === 6 && otp.every((d) => d !== "");
  const firstInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setOtp(["", "", "", "", "", ""]);
      setError("");
      setTimeout(() => {
        firstInputRef.current?.focus();
      }, 0);
    }
  }, [open]);

  const handleChange = (idx: number, value: string) => {
    if (/^[0-9]?$/.test(value)) {
      const newOtp = [...otp];
      newOtp[idx] = value;
      setOtp(newOtp);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otpValue.length !== 6) {
      setError("Enter 6 digit OTP");
      return;
    }
    setError("");
    // console.log(email, otpValue);
    const res = await VerifyOtp(email, otpValue);

    if (res.error === "Invalid OTP.") {
      setError("Invalid OTP");
    }
    if (res === "OTP verified successfully.") {
      onNext();
    } else {
      setError("Failed to verify OTP");
    }
  };

  const handleEdit = () => {
    setOtp(["", "", "", "", "", ""]);
    setError("");
    onBack(); // Go back to edit mobile
  };

  const handleResend = async () => {
    setOtp(["", "", "", "", "", ""]);
    setError("");
    const res = await ForgotPassword(email);
    if (res.message === "OTP sent successfully.") {
      return;
    } else {
      setError("Failed to send OTP");
    }
    // TODO: Implement resend OTP logic
    // You can show a toast or feedback here
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-xs w-sm rounded-xl p-2 pt-0 overflow-hidden">
        {/* Header */}
        <div className="relative bg-[#dff3f4] px-2 py-4 text-center rounded-t-xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-center">
              OTP Verification
            </DialogTitle>
          </DialogHeader>
        </div>
        {/* Message */}
        <div className="text-center text-sm mt-2 mb-1">
          We've sent to verification code to <br />
          <span className="font-medium">{email}</span>{" "}
          <button
            type="button"
            className="text-primary underline text-sm ml-1"
            onClick={handleEdit}
          >
            Edit
          </button>
        </div>
        <form
          onSubmit={handleSubmit}
          className="flex flex-col items-center gap-3 px-1"
        >
          {/* OTP Inputs */}
          <div className="flex gap-1 justify-center mb-1">
            {otp.map((digit, idx) => (
              <input
                key={idx}
                ref={idx === 0 ? firstInputRef : undefined}
                type="text"
                inputMode="numeric"
                maxLength={1}
                className="w-8 h-10 text-center border border-gray-300 rounded text-lg focus:border-primary outline-none"
                value={digit}
                onChange={(e) => {
                  const val = e.target.value;
                  handleChange(idx, val);
                  if (/^[0-9]$/.test(val) && idx < 5) {
                    const next = document.getElementById(
                      `otp-input-${idx + 1}`
                    );
                    if (next) (next as HTMLInputElement).focus();
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === "Backspace" && !otp[idx] && idx > 0) {
                    const prev = document.getElementById(
                      `otp-input-${idx - 1}`
                    );
                    if (prev) (prev as HTMLInputElement).focus();
                  }
                }}
                id={`otp-input-${idx}`}
                autoFocus={idx === 0}
              />
            ))}
          </div>
          {/* Resend */}
          <div className="text-center text-xs mb-1">
            Didn't receive the OTP?{" "}
            <button
              type="button"
              className="text-primary underline"
              onClick={handleResend}
            >
              Resend
            </button>
          </div>
          {error && <p className="text-xs text-red-600">{error}</p>}
          {/* VERIFY OTP Button */}
          <Button
            type="submit"
            className="w-full bg-primary text-white h-10 rounded-lg text-sm font-semibold disabled:opacity-60"
            disabled={!canSubmit}
          >
            VERIFY OTP
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
