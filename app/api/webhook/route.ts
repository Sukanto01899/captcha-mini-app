import {
  deleteUserNotificationDetails,
  setUserNotificationDetails,
} from "@/lib/kv";
import { sendFrameNotification } from "@/lib/notifs";
import {
  type ParseWebhookEvent,
  parseWebhookEvent,
  verifyAppKeyWithNeynar,
} from "@farcaster/miniapp-node";
import type { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const requestJson = await request.json();

  let data: Awaited<ReturnType<typeof parseWebhookEvent>> | null = null;
  try {
    data = await parseWebhookEvent(requestJson, verifyAppKeyWithNeynar);
  } catch (e: unknown) {
    const error = e as ParseWebhookEvent.ErrorType;

    switch (error.name) {
      case "VerifyJsonFarcasterSignature.InvalidDataError":
      case "VerifyJsonFarcasterSignature.InvalidEventDataError":
        // The request data is invalid
        return Response.json(
          { success: false, error: error.message },
          { status: 400 },
        );
      case "VerifyJsonFarcasterSignature.InvalidAppKeyError":
        // The app key is invalid
        return Response.json(
          { success: false, error: error.message },
          { status: 401 },
        );
      case "VerifyJsonFarcasterSignature.VerifyAppKeyError":
        // Internal error verifying the app key (caller may want to try again)
        return Response.json(
          { success: false, error: error.message },
          { status: 500 },
        );
    }
  }

  if (!data) {
    return Response.json(
      { success: false, error: "Invalid webhook payload" },
      { status: 400 },
    );
  }

  const fid = data.fid;
  const event = data.event;

  switch (event.event) {
    case "miniapp_added":
      if (event.notificationDetails) {
        await setUserNotificationDetails(fid, event.notificationDetails);
        await sendFrameNotification({
          fid,
          title: "Welcome to Captcha!",
          body: "You have successfully enabled notifications!",
        });
      } else {
        await deleteUserNotificationDetails(fid);
      }

      break;
    case "miniapp_removed":
      await deleteUserNotificationDetails(fid);
      break;
    case "notifications_enabled":
      await setUserNotificationDetails(fid, event.notificationDetails);
      await sendFrameNotification({
        fid,
        title: "Great Job!",
        body: "You are enabled notification!",
      });

      break;
    case "notifications_disabled":
      await deleteUserNotificationDetails(fid);

      break;
  }

  return Response.json({ success: true });
}
