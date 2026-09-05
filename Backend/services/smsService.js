/**
 * @file smsService.js
 * @description Twilio Messaging Integration Service for PashuPrahari High/Critical Risk Outbreak Alerts using Restricted API Key Authentication.
 * Fully resilient: Twilio failures are logged without crashing main case operations.
 */

const dotenv = require('dotenv');
dotenv.config();

/**
 * Sends a high/critical risk SMS alert via Twilio REST API using a Restricted API Key.
 * 
 * @param {object} caseData - Case details (farmerName, village, species, riskLevel, riskScore)
 * @returns {Promise<{ success: boolean, sid?: string, error?: string }>}
 */
async function sendRiskAlert(caseData) {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const apiKeySid = process.env.TWILIO_API_KEY_SID;
  const apiKeySecret = process.env.TWILIO_API_KEY_SECRET;
  const fromNumber = process.env.TWILIO_PHONE_NUMBER || process.env.TWILIO_MESSAGING_SERVICE_SID;
  const toNumber = process.env.ALERT_RECIPIENT_PHONE || process.env.TWILIO_ALERT_RECIPIENT;

  // Only trigger alerts for High or Critical cases
  const riskLevel = (caseData.riskLevel || '').toUpperCase();
  if (riskLevel !== 'HIGH' && riskLevel !== 'CRITICAL') {
    return { success: false, error: `Risk level '${caseData.riskLevel}' does not trigger alert` };
  }

  // Guard against missing Twilio environment variables (Restricted API Key auth)
  if (!accountSid || !apiKeySid || !apiKeySecret || !fromNumber || !toNumber) {
    const missing = [];
    if (!accountSid) missing.push('TWILIO_ACCOUNT_SID');
    if (!apiKeySid) missing.push('TWILIO_API_KEY_SID');
    if (!apiKeySecret) missing.push('TWILIO_API_KEY_SECRET');
    if (!fromNumber) missing.push('TWILIO_PHONE_NUMBER');
    if (!toNumber) missing.push('ALERT_RECIPIENT_PHONE');

    console.warn(`[Twilio SMS Warning] Skipping SMS alert. Twilio Restricted API Key credentials are not configured. Missing: ${missing.join(', ')}`);
    return {
      success: false,
      error: `Twilio Restricted API Key credentials are not configured. Missing: ${missing.join(', ')}`
    };
  }

  const villageStr = caseData.village || 'Bhiwandi';
  const speciesStr = caseData.species || 'Livestock';
  const scoreStr = caseData.riskScore !== undefined ? caseData.riskScore : 'N/A';
  const messageBody = `PashuPrahari Alert: A ${caseData.riskLevel}-risk livestock health case (Score: ${scoreStr}, Species: ${speciesStr}) has been reported in ${villageStr}. Immediate veterinary attention is recommended.`;

  try {
    // Authenticate with Restricted API Key (API Key SID + API Key Secret) targeting Account SID
    const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
    const authHeader = 'Basic ' + Buffer.from(`${apiKeySid}:${apiKeySecret}`).toString('base64');

    const params = new URLSearchParams();
    params.append('To', toNumber);
    params.append('From', fromNumber);
    params.append('Body', messageBody);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: params.toString(),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    const resData = await response.json();

    if (!response.ok) {
      console.error(`[Twilio SMS Error] Twilio HTTP ${response.status}: ${resData.message || JSON.stringify(resData)}`);
      return {
        success: false,
        error: `Twilio HTTP ${response.status}: ${resData.message || 'API request failed'}`
      };
    }

    console.log(`[Twilio SMS Success] Alert sent to ${toNumber}. Message SID: ${resData.sid}`);
    return {
      success: true,
      sid: resData.sid
    };
  } catch (err) {
    console.error(`[Twilio SMS Error] Failed to send SMS alert: ${err.message}`);
    return {
      success: false,
      error: err.message
    };
  }
}

module.exports = {
  sendRiskAlert
};
