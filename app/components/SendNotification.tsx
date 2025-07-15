"use client";
import type { MouseEventHandler } from "react";
import { useEffect, useState } from "react";

const base64ToUint8Array = (base64: string) => {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const b64 = (base64 + padding).replace(/-/g, "+").replace(/_/g, "/");

  const rawData = window.atob(b64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
};

export default function SendNotification() {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [isUnsubscribing, setIsUnsubscribing] = useState(false);
  const [subscription, setSubscription] = useState<PushSubscription | null>(
    null
  );
  const [registration, setRegistration] =
    useState<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      "serviceWorker" in navigator &&
      window.serwist !== undefined
    ) {
      // run only in browser
      navigator.serviceWorker.ready.then((reg) => {
        reg.pushManager.getSubscription().then((sub) => {
          if (
            sub &&
            !(
              sub.expirationTime &&
              Date.now() > sub.expirationTime - 5 * 60 * 1000
            )
          ) {
            setSubscription(sub);
            setIsSubscribed(true);
          }
        });
        setRegistration(reg);
      });
    }
  }, []);

  const subscribeButtonOnClick: MouseEventHandler<HTMLButtonElement> = async (
    event
  ) => {
    if (!process.env.NEXT_PUBLIC_WEB_PUSH_PUBLIC_KEY) {
      throw new Error("Environment variables supplied not sufficient.");
    }
    if (!registration) {
      console.error("No SW registration available.");
      return;
    }
    event.preventDefault();
    
    setIsSubscribing(true);
    try {
      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: base64ToUint8Array(
          process.env.NEXT_PUBLIC_WEB_PUSH_PUBLIC_KEY
        ),
      });
      // TODO: you should call your API to save subscription data on the server in order to send web push notification from the server
      setSubscription(sub);
      setIsSubscribed(true);
      alert("Web push subscribed!");
      console.log(sub);
    } catch (error) {
      console.error("Failed to subscribe:", error);
      alert("Failed to subscribe to notifications");
    } finally {
      setIsSubscribing(false);
    }
  };

  const unsubscribeButtonOnClick: MouseEventHandler<HTMLButtonElement> = async (
    event
  ) => {
    if (!subscription) {
      console.error("Web push not subscribed");
      return;
    }
    event.preventDefault();
    
    setIsUnsubscribing(true);
    try {
      await subscription.unsubscribe();
      // TODO: you should call your API to delete or invalidate subscription data on the server
      setSubscription(null);
      setIsSubscribed(false);
      console.log("Web push unsubscribed!");
    } catch (error) {
      console.error("Failed to unsubscribe:", error);
      alert("Failed to unsubscribe from notifications");
    } finally {
      setIsUnsubscribing(false);
    }
  };

  const sendNotificationButtonOnClick: MouseEventHandler<
    HTMLButtonElement
  > = async (event) => {
    event.preventDefault();

    if (!subscription) {
      alert("Web push not subscribed");
      return;
    }

    try {
      await fetch("/notification", {
        method: "POST",
        headers: {
          "Content-type": "application/json",
        },
        body: JSON.stringify({
          subscription,
        }),
        signal: AbortSignal.timeout(10000),
      });
    } catch (err) {
      if (err instanceof Error) {
        if (err.name === "TimeoutError") {
          console.error("Timeout: It took too long to get the result.");
        } else if (err.name === "AbortError") {
          console.error(
            "Fetch aborted by user action (browser stop button, closing tab, etc.)"
          );
        } else if (err.name === "TypeError") {
          console.error("The AbortSignal.timeout() method is not supported.");
        } else {
          // A network error, or some other problem.
          console.error(`Error: type: ${err.name}, message: ${err.message}`);
        }
      } else {
        console.error(err);
      }
      alert("An error happened.");
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 border border-slate-200 dark:border-slate-700 mb-8">
      <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-6 flex items-center">
        <span className="w-8 h-8 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center mr-3">
          🔔
        </span>
        Push Notifications
      </h3>
      
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={subscribeButtonOnClick}
            disabled={isSubscribed || isSubscribing}
            className={`flex-1 font-semibold py-3 px-6 rounded-lg transition-colors duration-200 shadow-md flex items-center justify-center ${
              isSubscribed || isSubscribing
                ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                : 'bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600 text-white hover:shadow-lg'
            }`}
          >
            {isSubscribing ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Subscribing...
              </>
            ) : isSubscribed ? (
              '✓ Subscribed'
            ) : (
              'Subscribe to Notifications'
            )}
          </button>
          
          <button
            type="button"
            onClick={unsubscribeButtonOnClick}
            disabled={!isSubscribed || isUnsubscribing}
            className={`flex-1 font-semibold py-3 px-6 rounded-lg transition-colors duration-200 shadow-md flex items-center justify-center ${
              !isSubscribed || isUnsubscribing
                ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                : 'bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600 text-white hover:shadow-lg'
            }`}
          >
            {isUnsubscribing ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Unsubscribing...
              </>
            ) : (
              'Unsubscribe'
            )}
          </button>
        </div>
        
        <button
          type="button"
          onClick={sendNotificationButtonOnClick}
          disabled={!isSubscribed}
          className={`w-full font-semibold py-3 px-6 rounded-lg transition-colors duration-200 shadow-md ${
            !isSubscribed
              ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 text-white hover:shadow-lg'
          }`}
        >
          Send Test Notification
        </button>
        
        {isSubscribed && (
          <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <div className="flex items-center">
              <span className="text-green-600 dark:text-green-400 mr-2">✓</span>
              <span className="text-sm text-green-800 dark:text-green-200 font-medium">
                Notifications are enabled for this device
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
