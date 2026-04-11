"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { SignupSchema, SignupSchemaType } from "@/schemas/signupSchema";
import PublicNav from "@/components/navigation/PublicNav";
import { Card, CardContent } from "@/components/ui/card";
import Input from "@/components/inputs/Input";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import googleimg from "@/public/public_images/google.svg";
import arror_right from "@/public/public_images/arrow-right.svg";
import authbg from "@/public/public_images/authbg.svg";
import Loader from "@/components/loader/Loader";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { useToast } from "@/context/ToastContext";

const Signup = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isSubmitting },
  } = useForm<SignupSchemaType>({
    resolver: zodResolver(SignupSchema),
    mode: "onChange",
  });

  const { addToast } = useToast();
  const router = useRouter();
  const supabase = createClient();

  const onSubmit = async (data: SignupSchemaType) => {
    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          first_name: data.firstname,
          last_name: data.lastname,
          phone: data.phone,
        },
      },
    });

    if (error) {
      addToast(error.message, "error");
      return;
    }

    addToast("Account created successfully! Please check your email to verify.", "success");
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
                Register
              </h1>
              <p className="font-['Montserrat'] font-medium text-sm leading-5 tracking-[-0.04em] text-muted-foreground mb-6">
                Let’s create new account
              </p>

              <form
                onSubmit={handleSubmit(onSubmit)}
                className="flex flex-col gap-3 w-full"
              >
                <div className="flex gap-3">
                  <Input
                    label="First   name"
                    placeholder="john"
                    autoComplete="off"
                    {...register("firstname")}
                    error={errors.firstname?.message}
                  />
                  <Input
                    label="Last name"
                    placeholder="doe"
                    autoComplete="off"
                    {...register("lastname")}
                    error={errors.lastname?.message}
                  /> </div>


                <Input
                  label="Email"
                  autoComplete="off"
                  placeholder="yourname@gmail.com"
                  {...register("email")}
                  error={errors.email?.message}
                />

                <Input
                  label="Phone Number"
                  placeholder="(+12)435-1213-232"
                  {...register("phone")}
                  autoComplete="off"
                  error={errors.phone?.message}
                />

                <Input
                  label="Password"
                  typeToggle
                  placeholder="Enter your password"
                  {...register("password")}
                  error={errors.password?.message}
                />

                <Input
                  label="Repeat Password"
                  typeToggle
                  placeholder="Re-enter your password"
                  {...register("repeatPassword")}
                  error={errors.repeatPassword?.message}
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
                      Register
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
                Already have an account?
                <Link href="/auth/sign-in" className="text-accent">
                  {" "}
                  Login Here
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
                <Image src={googleimg} className="mr-2" alt="googleimg" /> Join
                with Google
              </Button>
            </CardContent>
          </Card>

          {/* <Card className="login-card-box w-full hidden lg:flex border-0">
            <CardContent className="flex items-center h-full justify-center">
              <Image src={authbg} alt="authbg" />
            </CardContent>
          </Card> */}
        </div>
      </div>
    </>
  );
};

export default Signup;
