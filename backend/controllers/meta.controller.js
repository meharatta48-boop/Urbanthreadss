import crypto from "crypto";

const hashValue = (value) => {
  if (!value || typeof value !== "string") return undefined;
  return crypto.createHash("sha256").update(value.trim().toLowerCase()).digest("hex");
};

export const trackMetaEvent = async (req, res) => {
  const accessToken = process.env.META_ACCESS_TOKEN;
  const pixelId = process.env.META_PIXEL_ID;

  if (!accessToken || !pixelId) {
    return res.status(200).json({ success: true, skipped: true });
  }

  const {
    eventName,
    eventId,
    eventSourceUrl,
    userData = {},
    customData = {},
  } = req.body || {};

  if (!eventName) {
    return res.status(400).json({ success: false, message: "eventName is required" });
  }

  const payload = {
    data: [
      {
        event_name: eventName,
        event_time: Math.floor(Date.now() / 1000),
        event_id: eventId,
        event_source_url: eventSourceUrl,
        action_source: "website",
        user_data: {
          em: hashValue(userData.email),
          ph: hashValue(userData.phone),
          client_ip_address: req.ip,
          client_user_agent: req.get("user-agent"),
        },
        custom_data: customData,
      },
    ],
  };

  try {
    const response = await fetch(`https://graph.facebook.com/v18.0/${pixelId}/events?access_token=${accessToken}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const result = await response.json();
    return res.status(response.ok ? 200 : 502).json({ success: response.ok, result });
  } catch (error) {
    return res.status(502).json({ success: false, message: error.message });
  }
};
