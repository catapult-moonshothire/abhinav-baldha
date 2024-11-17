"use client";

import React, { useState, useEffect } from "react";
import Head from "next/head";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import { Button } from "../../../components/ui/button";
import { Spinner } from "../../../components/ui/spinner";
import BlogPostDisplay from "@/components/blog-post-display";
import MainContainer from "@/components/layout/main-container";
import Link from "next/link";
import { useAuth } from "@/components/providers/auth-context";

export default function Admin() {
  const { isAuthenticated, login, logout, error } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await login(username, password);
    setLoading(false);
  };

  if (!isAuthenticated) {
    return (
      <div className="flex h-[calc(100vh-248px)] mt-20 items-center justify-center">
        <Card className="mt-16 w-96">
          <CardHeader>
            <CardTitle>Login</CardTitle>
            <CardDescription>
              Enter your credentials to access the page.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <label
                  htmlFor="username"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Username
                </label>
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <label
                  htmlFor="password"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Password
                </label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Logging in..." : "Login"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <Head>
        <meta name="robots" content="noindex" />
      </Head>
      <MainContainer className="" large={true}>
        <div className="">
          {/* <div className="flex items-center px-4 gap-2 justify-end">
            <Link href="/">
              <Button variant={"secondary"}>Home</Button>
            </Link>
            <Button onClick={logout}>Logout</Button>
          </div> */}
          {loading ? (
            <Spinner />
          ) : error ? (
            <p className="text-red-500">{error}</p>
          ) : (
            <BlogPostDisplay />
          )}
        </div>
      </MainContainer>
    </>
  );
}
