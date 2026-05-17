"use client";

import { useState, useCallback, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import QueryPanel from "@/components/QueryPanel";
import CitationDrawer from "@/components/CitationDrawer";
import { useFinRAGQuery } from "@/hooks/useFinRAGQuery";
import type { Citation, QueryFilters } from "@/lib/types";
import { DEFAULT_FILTERS } from "@/lib/constants";
import { checkHealth } from "@/lib/api";

export default function Home() {
  const [filters, setFilters] = useState<QueryFilters>(DEFAULT_FILTERS);
  const [selectedCitation, setSelectedCitation] = useState<Citation | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [pendingQuery, setPendingQuery] = useState<string>("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isOnline, setIsOnline] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    const check = async () => {
      try {
        const healthy = await checkHealth();
        setIsOnline(healthy);
      } catch {
        setIsOnline(false);
      }
    };
    check();
    const interval = setInterval(check, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleCitationClick = useCallback((citation: Citation) => {
    setSelectedCitation(citation);
    setDrawerOpen(true);
  }, []);

  const handleDrawerClose = useCallback(() => {
    setDrawerOpen(false);
    setTimeout(() => setSelectedCitation(null), 300);
  }, []);

  const handleExampleSelect = useCallback((query: string) => {
    setPendingQuery(query);
    if (isMobile) setMobileMenuOpen(false);
  }, [isMobile]);

  const finragState = useFinRAGQuery();

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background text-foreground">
      
      {/* Mobile Header (Only visible on small screens) */}
      {isMobile && (
        <div className="absolute top-0 left-0 right-0 h-14 border-b border-border bg-background/95 backdrop-blur flex items-center justify-between px-4 z-40">
          <div className="font-semibold text-lg">FinRAG</div>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 -mr-2 text-muted-foreground hover:text-foreground"
            aria-label="Toggle Menu"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              {mobileMenuOpen ? (
                <path d="M18 6L6 18M6 6l12 12" />
              ) : (
                <path d="M3 12h18M3 6h18M3 18h18" />
              )}
            </svg>
          </button>
        </div>
      )}

      {/* Sidebar Overlay for Mobile */}
      {isMobile && mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 transition-opacity" 
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar Area */}
      <div 
        className={`
          fixed md:relative z-50 h-full transform transition-transform duration-300 ease-in-out
          ${isMobile ? (mobileMenuOpen ? 'translate-x-0' : '-translate-x-full') : 'translate-x-0'}
        `}
      >
        <Sidebar
          filters={filters}
          onFiltersChange={setFilters}
          onExampleSelect={handleExampleSelect}
          isOnline={isOnline}
        />
      </div>

      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col relative w-full h-full ${isMobile ? 'pt-14' : ''}`}>
        <QueryPanel
          filters={filters}
          onCitationClick={handleCitationClick}
          pendingQuery={pendingQuery}
          onPendingQueryConsumed={() => setPendingQuery("")}
          finragState={finragState}
        />
      </div>

      {/* Global Citation Drawer */}
      <CitationDrawer
        citation={selectedCitation}
        isOpen={drawerOpen}
        onClose={handleDrawerClose}
      />
    </div>
  );
}
