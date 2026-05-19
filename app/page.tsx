"use client";
import dynamic from "next/dynamic";

const Dashboard = dynamic(() => import("../PersonalizedDashboard"), {
  ssr: false,
});

export default function Home() {
  return <Dashboard />;
}