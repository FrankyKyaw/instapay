// // app/api/polling/route.ts
// import { NextResponse } from 'next/server';
// import { pollBalances } from '@/utils/pollBalance';
// // Background polling interval in milliseconds (e.g., every 15 minutes)
// const POLLING_INTERVAL = 1 * 10 * 1000;

// // Track if polling is already running
// let isPolling = false;
// let pollingInterval: NodeJS.Timeout | null = null;

// // Function to start background polling
// function startBackgroundPolling() {
//   if (isPolling) return;
  
//   isPolling = true;
//   console.log("Starting background polling...");
  
//   // Run immediately once
//   runPoll();
  
//   // Then set up interval
//   pollingInterval = setInterval(runPoll, POLLING_INTERVAL);
// }

// async function runPoll() {
//   try {
//     console.log("Running balance poll...");
//     const result = await pollBalances();
//     console.log(`Poll completed. Processed ${result.processed} transactions.`);
//   } catch (error) {
//     console.error("Error in background poll:", error);
//   }
// }

// // Start polling when the API module loads (in development this may run multiple times)
// if (typeof window === 'undefined') { // Only run on the server
//   startBackgroundPolling();
// }

// export async function GET() {
//   try {
//     // Force an immediate poll
//     const result = await pollBalances();
    
//     // Ensure background polling is running
//     if (!isPolling) {
//       startBackgroundPolling();
//     }
    
//     return NextResponse.json({
//       success: true,
//       result,
//       backgroundPolling: isPolling
//     });
//   } catch (error) {
//     console.error("Polling API error:", error);
//     return NextResponse.json(
//       { error: "Failed to process balances" },
//       { status: 500 }
//     );
//   }
// }

// // Route to check polling status
// export async function POST(request: Request) {
//   try {
//     const body = await request.json();
    
//     // Allow changing the polling interval
//     if (body.pollingInterval && typeof body.pollingInterval === 'number') {
//       if (pollingInterval) {
//         clearInterval(pollingInterval);
//       }
      
//       const newInterval = Math.max(60000, body.pollingInterval); // Minimum 1 minute
//       pollingInterval = setInterval(runPoll, newInterval);
      
//       return NextResponse.json({
//         success: true,
//         message: `Polling interval updated to ${newInterval}ms`
//       });
//     }
    
//     // Force start/stop polling
//     if (typeof body.startPolling === 'boolean') {
//       if (body.startPolling && !isPolling) {
//         startBackgroundPolling();
//         return NextResponse.json({
//           success: true,
//           message: "Background polling started"
//         });
//       } else if (!body.startPolling && isPolling) {
//         if (pollingInterval) {
//           clearInterval(pollingInterval);
//           pollingInterval = null;
//         }
//         isPolling = false;
//         return NextResponse.json({
//           success: true,
//           message: "Background polling stopped"
//         });
//       }
//     }
    
//     return NextResponse.json({ 
//       success: true,
//       isPolling,
//       pollingInterval: POLLING_INTERVAL
//     });
//   } catch (error) {
//     return NextResponse.json(
//       { error: "Failed to process request" },
//       { status: 500 }
//     );
//   }
// }