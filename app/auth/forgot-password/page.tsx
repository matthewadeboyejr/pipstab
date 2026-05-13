"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { forgotpasswordSchema, ForgotPasswordFormValues } from "@/schemas/forgotpasswordSchema";
import PublicNav from "@/components/navigation/PublicNav";
import { Card, CardContent } from "@/components/ui/card";
import Input from "@/components/inputs/Input";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import arror_right from "@/public/public_images/arrow-right.svg";
import Loader from "@/components/loader/Loader";
import { useToast } from "@/context/ToastContext";
import { createClient } from "@/utils/supabase/client";

export default function ForgotPassword() {
  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isSubmitting },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotpasswordSchema),
    mode: "onChange",
  });

  const { addToast } = useToast();
  const supabase = createClient();

  const onSubmit = async (data: ForgotPasswordFormValues) => {
    const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
      redirectTo: `${window.location.origin}/auth/update-password`,
    });

    if (error) {
      addToast(error.message, "error");
      return;
    }

    addToast("Password reset link sent! Please check your email.", "success");
  };

  return (
    <>
      <div className="flex flex-col justify-center items-center pt-0 md:pt-5">
        <PublicNav />
      </div>
      <div className="flex flex-col w-full items-center justify-center pt-2 px-2">
        <div className="w-full flex flex-col md:flex-row gap-3 item-center justify-center pt-5 px-2 md:px-5 pb-4">
          <Card className="bg-background py-[32px] lg:py-[64px] px-0 lg:px-[32px] w-full max-w-[471px] border-0">
            <CardContent className="h-full flex flex-col items-start justify-center">
              <h1 className="font-['Montserrat'] font-semibold text-2xl leading-8 tracking-[-0.04em] text-foreground pb-2">
                Forgot Password
              </h1>
              <p className="font-['Montserrat'] font-medium text-sm leading-5 tracking-[-0.04em] text-muted-foreground mb-6">
                Enter your email to receive a password reset link
              </p>

              <form
                onSubmit={handleSubmit(onSubmit)}
                className="flex flex-col gap-3 w-full"
              >
                <Input
                  label="Email"
                  autoComplete="off"
                  placeholder="yourname@gmail.com"
                  {...register("email")}
                  error={errors.email?.message}
                />

                <Button
                  type="submit"
                  disabled={!isValid || isSubmitting}
                  className={`flex items-center justify-center w-full py-3 mt-4 rounded-md transition-none form-submit-btn
                  ${isValid
                      ? "bg-accent text-accent-foreground shadow-[inset_0px_7.4px_18.5px_#FFFFFF1C,0px_0px_0px_3.7px_#BECAEA08] hover:shadow-[inset_0px_7.4px_18.5px_#FFFFFF1C,0px_0px_0px_3.7px_#BECAEA08]"
                      : "bg-secondary text-muted-foreground hover:bg-secondary hover:text-muted-foreground hover:shadow-none"
                    }`}
                >
                  {isSubmitting ? (
                    <Loader />
                  ) : (
                    <>
                      Send Reset link
                      <Image
                        src={arror_right}
                        className="ml-2"
                        alt="arrow_right"
                      />
                    </>
                  )}
                </Button>
              </form>

              <p className="auth-question text-center w-full mt-6">
                Back to{" "}
                <Link href="/auth/sign-in" className="text-accent">
                  Sign In
                </Link>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
