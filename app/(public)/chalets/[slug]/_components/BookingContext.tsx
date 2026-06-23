"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

interface BookingState {
  checkIn: Date | undefined;
  checkOut: Date | undefined;
  setCheckIn: (d: Date | undefined) => void;
  setCheckOut: (d: Date | undefined) => void;
  step: "checkin" | "checkout" | "done";
  setStep: (s: "checkin" | "checkout" | "done") => void;
  reset: () => void;
}

const BookingContext = createContext<BookingState | null>(null);

export function BookingProvider({ children }: { children: ReactNode }) {
  const [checkIn, setCheckIn] = useState<Date | undefined>();
  const [checkOut, setCheckOut] = useState<Date | undefined>();
  const [step, setStep] = useState<"checkin" | "checkout" | "done">("checkin");

  function reset() {
    setCheckIn(undefined);
    setCheckOut(undefined);
    setStep("checkin");
  }

  return (
    <BookingContext.Provider
      value={{ checkIn, checkOut, setCheckIn, setCheckOut, step, setStep, reset }}
    >
      {children}
    </BookingContext.Provider>
  );
}

export function useBooking() {
  const ctx = useContext(BookingContext);
  if (!ctx) throw new Error("useBooking must be used inside BookingProvider");
  return ctx;
}
