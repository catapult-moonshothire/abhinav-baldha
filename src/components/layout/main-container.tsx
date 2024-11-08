import React, { ReactNode } from "react";
import { cn } from "@/lib/utils";

// MainContainer component
const MainContainer = ({
  children,
  className,
  large = false,
}: {
  children: ReactNode;
  className?: string;
  large?: boolean;
}) => (
  <div className="">
    <MaxWidthWrapper className={className} large={large}>
      <main className="px-4 sm:px-8 mx-auto w-full">{children}</main>
    </MaxWidthWrapper>
  </div>
);

// MaxWidthWrapper component
const MaxWidthWrapper = ({
  className,
  children,
  large = false,
}: {
  className?: string;
  large?: boolean;
  children: ReactNode;
}) => {
  return (
    <div
      className={cn(
        "container",
        large ? "max-w-screen-2xl container" : "max-w-4xl",
        className
      )}
    >
      {children}
    </div>
  );
};

export default MainContainer;
