"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signInSchema, SignInFormValues } from "@/schemas/signinSchema";
import PublicNav from "@/components/navigation/PublicNav";
import { Card, CardContent } from "@/components/ui/card";
import Input from "@/components/inputs/Input";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import googleimg from "@/public/public_images/google.svg";
import arror_right from "@/public/public_images/arrow-right.svg";
import Loader from "@/components/loader/Loader";
import { useRouter } from "next/navigation";
import { useToast } from "@/context/ToastContext";
import { createClient } from "@/utils/supabase/client";

const Signin = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isSubmitting },
  } = useForm<SignInFormValues>({
    resolver: zodResolver(signInSchema),
    mode: "onChange",
  });

  const { addToast } = useToast();
  const router = useRouter();
  const supabase = createClient();

  const onSubmit = async (data: SignInFormValues) => {
    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (error) {
      addToast(error.message, "error");
      return;
    }

    addToast("Signed in successfully!", "success");
    router.push("/overview");
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
                Sign In
              </h1>
              <p className="font-['Montserrat'] font-medium text-sm leading-5 tracking-[-0.04em] text-muted-foreground mb-6">
                Let&apos;s sign in to your account
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

                <Input
                  label="Password"
                  typeToggle
                  placeholder="Enter your password"
                  {...register("password")}
                  error={errors.password?.message}
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
                      Sign In
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
                Don&apos;t have an account?{" "}
                <Link href="/auth/sign-up" className="text-accent">
                  Sign Up Here
                </Link>
              </p>

              <div className="w-full flex items-center justify-center my-6">
                <div className="grow h-px bg-border" />
                <span className="mx-4 auth-divider text-muted-foreground">
                  Or
                </span>
                <div className="grow h-px bg-border" />
              </div>

              <Button
                onClick={() => router.push("/overview")}
                className="hover:bg-accent bg-secondary flex items-center justify-center gap-3 w-full form-btn text-muted-foreground hover:text-accent-foreground"
              >
                <Image src={googleimg} className="mr-2" alt="googleimg" />
                Sign In with Google
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default Signin;
