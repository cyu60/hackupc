import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import GroupVoting from "./pages/GroupVoting";
import Team from "./pages/Team";
import ImagesPage from "./pages/Images";
import Destinations from "./pages/Destinations";
import EEGCitySession from "./pages/EEGCitySession";
import ResultsPage from "./pages/Results"; // ✅ Add this if you're using results

import { TeamProvider } from "@/context/TeamContext";
import { CitySessionProvider } from "@/context/CitySessionContext";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <TeamProvider>
        <CitySessionProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/team" element={<Team />} />
              <Route path="/destinations" element={<Destinations />} />
              <Route path="/images/:city" element={<ImagesPage />} />
              <Route path="/eeg-session/:city" element={<EEGCitySession />} />
              <Route path="/results" element={<ResultsPage />} /> {/* ✅ New route */}
              <Route path="/vote" element={<GroupVoting />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </CitySessionProvider>
      </TeamProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
