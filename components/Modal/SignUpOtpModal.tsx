import { useEffect, useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export default function SignUpOtpModal({
  open,
  onClose,
  mobile,
  countryCode,
  onNext,
  onBack
}: {
  open: boolean;
  onClose: () => void;
  mobile: string;
  countryCode: string;
  onNext: (otp: string) => void;
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (otpValue.length !== 6) {
      setError("Enter 6 digit OTP");
      return;
    }
    setError("");
    onNext(otpValue);
  };

  const handleEdit = () => {
    setOtp(["", "", "", "", "", ""]);
    setError("");
    onBack(); // Go back to edit mobile
  };

  const handleResend = () => {
    setOtp(["", "", "", "", "", ""]);
    setError("");
    // TODO: Implement resend OTP logic
    // You can show a toast or feedback here
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-xs w-sm rounded-xl p-2 pt-0 overflow-hidden">
        {/* Header */}
        <div className="relative bg-[#dff3f4] px-2 py-4 text-center rounded-t-xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-center">OTP Verification</DialogTitle>
          </DialogHeader>
        </div>
        {/* Message */}
        <div className="text-center text-sm mt-2 mb-1">
          We've sent to verification code to <br />
          <span className="font-medium">+{countryCode} {mobile}</span>{" "}
          <button type="button" className="text-primary underline text-sm ml-1" onClick={handleEdit}>Edit</button>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col items-center gap-3 px-1">
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
                onChange={e => {
                  const val = e.target.value;
                  handleChange(idx, val);
                  if (/^[0-9]$/.test(val) && idx < 5) {
                    const next = document.getElementById(`otp-input-${idx + 1}`);
                    if (next) (next as HTMLInputElement).focus();
                  }
                }}
                onKeyDown={e => {
                  if (e.key === 'Backspace' && !otp[idx] && idx > 0) {
                    const prev = document.getElementById(`otp-input-${idx - 1}`);
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
            Didn't receive the OTP?{' '}
            <button type="button" className="text-primary underline" onClick={handleResend}>Resend</button>
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