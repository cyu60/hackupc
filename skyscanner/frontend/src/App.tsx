import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Preferences from "./pages/Preferences";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import GroupVoting from "./pages/GroupVoting";
import Team from "./pages/Team";
import ImagesPage from "./pages/Images";
import Destinations from "./pages/Destinations";
import EEGCitySession from "./pages/EEGCitySession";
import ResultsPage from "./pages/Results";
import FinalDestination from "./pages/FinalDestination"; // ✅ Import new page

import { TeamProvider } from "@/context/TeamContext";
import { CitySessionProvider } from "@/context/CitySessionContext";
import { VoteProvider } from "@/context/VoteContext";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <TeamProvider>
        <CitySessionProvider>
          <VoteProvider>
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/team" element={<Team />} />
                <Route path="/destinations" element={<Destinations />} />
                <Route path="/images/:city" element={<ImagesPage />} />
                <Route path="/eeg-session/:city" element={<EEGCitySession />} />
                <Route path="/results" element={<ResultsPage />} />
                <Route path="/vote" element={<GroupVoting />} />
                <Route path="/final-destination" element={<FinalDestination />} /> {/* ✅ New route */}
                <Route path="/preferences" element={<Preferences />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </VoteProvider>
        </CitySessionProvider>
      </TeamProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
