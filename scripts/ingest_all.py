"""CLI script to batch download SEC filings (10-K and 10-Q) for AAPL, MSFT, TSLA, GOOG, AMZN.

Usage:
    python scripts/ingest_all.py
"""

import asyncio
import sys
from pathlib import Path

# Add src to path for direct script execution
sys.path.insert(0, str(Path(__file__).parent.parent / "src"))

import structlog

from finrag.config import get_settings
from finrag.ingestion.edgar_client import (
    EdgarError,
    ingest_filing,
)

structlog.configure(
    processors=[
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.add_log_level,
        structlog.dev.ConsoleRenderer(),
    ],
)

logger = structlog.get_logger(__name__)

# List of tickers to download
TICKERS = ["AAPL", "MSFT", "TSLA", "GOOG", "AMZN"]
FILING_TYPES = ["10-K", "10-Q"]
COUNT = 2

async def run_batch_ingestion() -> None:
    """Download filings for all configured tickers and types sequentially to respect rate limits."""
    settings = get_settings()
    total_saved = 0

    logger.info("batch_ingestion_started", tickers=TICKERS, filing_types=FILING_TYPES, count_per_type=COUNT)

    for ticker in TICKERS:
        for filing_type in FILING_TYPES:
            logger.info("ingesting_ticker_filings", ticker=ticker, filing_type=filing_type)
            try:
                # Ingest filings
                saved_paths = await ingest_filing(
                    ticker=ticker,
                    filing_type=filing_type,
                    settings=settings,
                    count=COUNT,
                )
                
                for path in saved_paths:
                    logger.info("filing_saved", ticker=ticker, filing_type=filing_type, path=str(path))
                
                total_saved += len(saved_paths)
                
                # Small polite sleep between request batches to avoid triggering EDGAR rate limits
                await asyncio.sleep(2)
                
            except EdgarError as e:
                logger.error("ingestion_failed_for_item", ticker=ticker, filing_type=filing_type, error=str(e))
            except Exception as e:
                logger.error("unexpected_error", ticker=ticker, filing_type=filing_type, error=str(e))

    logger.info("batch_ingestion_complete", total_directories_saved=total_saved)

def main() -> None:
    try:
        asyncio.run(run_batch_ingestion())
    except KeyboardInterrupt:
        logger.info("ingestion_interrupted")
        sys.exit(130)

if __name__ == "__main__":
    main()
