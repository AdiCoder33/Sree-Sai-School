// src/pages/Login.tsx
import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Navigate, Link } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { School, ArrowLeft, AlertCircle } from "lucide-react";

export const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { user, login } = useAuth();

  // Parallax for the big desktop illustration
  const [mx, setMx] = useState(0);
  const [my, setMy] = useState(0);
  const parallaxVars = { ["--mx" as any]: mx, ["--my" as any]: my };

  if (user) return <Navigate to="/dashboard" replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    const ok = await login(email, password);
    if (!ok) setError("Invalid email or password");
    setIsLoading(false);
  };

  return (
    <div className="h-screen relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 grid">
        <div className="clay-bg" />
      </div>

      {/* Header */}
      <header className="relative z-20 px-6 pt-4">
        <div className="flex items-center justify-between">
          {/* Brand */}
          <div className="flex items-center gap-3 text-white">
            <div className="h-10 w-10 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center shadow-[inset_0_1px_2px_rgba(255,255,255,0.5),0_10px_30px_rgba(0,0,0,0.25)]">
              <School className="h-6 w-6 text-white" />
            </div>
            <div className="leading-tight">
              <h1 className="text-2xl sm:text-3xl font-extrabold">School</h1>
              <p className="text-white/85 text-sm -mt-0.5">
                 Management System
              </p>
            </div>
          </div>

          {/* Back to Home */}
          <Link
            to="/"
            className="flex items-center gap-2 text-white/90 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm font-semibold">Back</span>
          </Link>
        </div>
      </header>

      {/* Main */}
<main className="mt-8 relative z-10 mx-auto max-w-7xl px-6">
  <div
    className="
      grid sm:grid-cols-2
      gap-6 lg:gap-12 items-center
      min-h-[calc(100vh-96px)]
    "
  >
    {/* LEFT: large illustration (desktop & tablet only) */}
    <div
      className="hidden sm:block text-white select-none col-wrap"
      onMouseMove={(e) => {
        const r = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        setMx(Number((x * 2).toFixed(3)));
        setMy(Number((y * 2).toFixed(3)));
      }}
      onMouseLeave={() => { setMx(0); setMy(0); }}
      style={parallaxVars as React.CSSProperties}
    >
      <div className="relative h-[360px] md:h-[430px] lg:h-[380px]">
        <div className="floor-shadow absolute bottom-2 h-8 rounded-[32px] bg-white/15 blur-[1.5px] drop-shadow-[0_32px_60px_rgba(0,0,0,0.35)]" />
        <img
          src="/illustration/complete_School.png"
          alt="Students reading on stacked books with school"
          className="base-illustration parallax depth-2 absolute bottom-0 z-10 select-none pointer-events-none drop-shadow-[0_30px_60px_rgba(0,0,0,0.35)] [image-rendering:-webkit-optimize-contrast]"
          loading="eager"
        />
      </div>
    </div>

    {/* RIGHT: login card */}
    <div className="w-full col-wrap flex justify-end relative">
      {/* Mobile corner art (only <sm) */}
      <div className="sm:hidden pointer-events-none absolute -top-6 -left-2 z-[2]">
        <div aria-hidden className="absolute -top-3 -left-3 h-16 w-16 rounded-full bg-white/20 blur-xl" />
        <img
          src="/illustration/complete_School.png"
          alt=""
          className="w-28 h-auto drop-shadow-xl select-none [clip-path:inset(5%_46%_50%_5%_round_18px)]"
          loading="eager"
        />
      </div>
<Card
  className="
    relative z-[3] clay-card w-full max-w-[520px] mb-10
    rounded-[28px] overflow-y-auto overscroll-contain
    px-6 pt-1 sm:pt-1 sm:px-6
    max-h-[100vh]
  "
>
  {/* Special top-left image (mobile only) */}
  {/* Special image (mobile only, centered) */}
<div className="flex justify-center block sm:hidden">
  <img
    src="/illustration/complete_School.png" // replace with your file path
    alt="Special Highlight"
    className="w-36 h-auto object-contain drop-shadow-lg select-none pointer-events-none"
  />
</div>


  <CardHeader className="pb-1 px-0">
    <CardTitle className="clay-title text-[24px] sm:text-[28px] md:text-[30px] font-extrabold text-[#1f2937]">
      Login to Your Dashboard
    </CardTitle>
  </CardHeader>


              <CardContent className="px-0">
                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Email */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="email"
                      className="text-[14px] sm:text-[15px] font-semibold text-gray-800"
                    >
                      Email / Username
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email or ID"
                      className="clay-input h-11 sm:h-12 px-4 text-[15px] placeholder:text-gray-400"
                      required
                    />
                  </div>

                  {/* Password */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="password"
                      className="text-[14px] sm:text-[15px] font-semibold text-gray-800"
                    >
                      Password
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="clay-input h-11 sm:h-12 px-4 text-[15px] placeholder:text-gray-400"
                      required
                    />
                  </div>

                  {/* Error */}
                  {error && (
                    <div className="flex items-center gap-2 text-red-600 text-sm">
                      <AlertCircle className="h-4 w-4" />
                      <span>{error}</span>
                    </div>
                  )}

                  {/*<div className="flex items-center justify-end">
                    <Link
                      to="/forgot-password"
                      className="text-[var(--brand-600)] hover:underline text-[14px]"
                    >
                      Forgot Password?
                    </Link>
                  </div>*/}

                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="clay-btn w-full mt-1 text-[16px]"
                  >
                    {isLoading ? "Signing in..." : "Login"}
                  </Button>

                  <p className="text-center text-xs text-gray-500 mt-4">
                    © 2025  School Management System. All rights
                    reserved.
                  </p>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Ambient glows */}
      <div className="scene-glow-1" />
      <div className="scene-glow-2" />
    </div>
  );
};
